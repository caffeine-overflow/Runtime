
import React, { useState, useEffect } from 'react';
import Loader from 'react-loader-spinner';
import { Table, IconButton, Icon } from 'rsuite';
import NotFound from "../NotFound";
import NoBacklog from "../../assets/nobacklog.svg";
import utils from "../../utility/utils"
import Editor from "../utilitycomponents/Editor";


export default function Backlog(props) {

    const [backlogs, setbacklogs] = useState([]);
    const [loading, setloading] = useState(false);

    const [expandedRowKeys, setexpandedRowKeys] = useState([]);

    const handleExpanded = (rowData, dataKey) => {
        let open = false;
        const nextExpandedRowKeys = [];

        expandedRowKeys.forEach(key => {
            if (key === rowData[rowKey]) {
                open = true;
            } else {
                nextExpandedRowKeys.push(key);
            }
        });

        if (!open) {
            nextExpandedRowKeys.push(rowData[rowKey]);
        }

        setexpandedRowKeys(nextExpandedRowKeys);
    }

    const getBacklogs = async () => {
        setloading(true);
        const response = await utils.FETCH_DATA(`api/userstories/backlogs/${props.project_id}`);
        let data = await response.data;
        setbacklogs(data.userstories);
        setloading(false);
    }

    const moveToActiveSprint = async (userstory) => {
        let body = {};
        body._id = userstory._id;
        body.sprint_id = props.acitveSprint._id;
        let message = 'User Story Has Been Moved to the Active Sprint';
        let _body = body;
        const response = await utils.UPDATE_DATA(`api/userstories`, _body, message);
        //if updated
        if (response.status === 200) {
            getBacklogs();
        }
    }

    useEffect(() => {
        getBacklogs();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    return (
        <div>
            {
                loading ?
                    <div style={{ height: '80vh' }}>
                        <Loader
                            style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}
                            type="ThreeDots"
                            color="#134069"
                            height={50}
                            width={50}
                        />
                    </div>

                    : (backlogs.length === 0 ?
                        <NotFound
                            image={NoBacklog}
                            msg="So empty!"
                        />
                        :
                        <div style={{ margin: '50px' }}>
                            <Table
                                height={700}
                                rowHeight={60}
                                data={backlogs}
                                rowKey={rowKey}
                                expandedRowKeys={expandedRowKeys}
                                rowExpandedHeight={400}
                                renderRowExpanded={rowData => {
                                    return (
                                        <Editor
                                            disabled={true}
                                            value={rowData.description}
                                        />
                                    );
                                }}
                            >
                                <Table.Column width={100} align="center">
                                    <Table.HeaderCell style={styles.header}>#</Table.HeaderCell>
                                    <ExpandCell
                                        dataKey="id"
                                        expandedRowKeys={expandedRowKeys}
                                        onChange={handleExpanded}
                                    />
                                </Table.Column>

                                <Table.Column width={200}>
                                    <Table.HeaderCell style={styles.header}>Identifier</Table.HeaderCell>
                                    <Table.Cell dataKey="identifier" />
                                </Table.Column>

                                <Table.Column width={400}>
                                    <Table.HeaderCell style={styles.header}>Title</Table.HeaderCell>
                                    <Table.Cell dataKey="title" />
                                </Table.Column>

                                <Table.Column width={200}>
                                    <Table.HeaderCell style={styles.header}>Created On</Table.HeaderCell>
                                    <Table.Cell dataKey="created_at" />
                                </Table.Column>

                                <Table.Column width={250}>
                                    <Table.HeaderCell style={styles.header}>Created By</Table.HeaderCell>
                                    <Table.Cell>
                                        {rowData => `${rowData.created_by.firstname} ${rowData.created_by.lastname}`}
                                    </Table.Cell>
                                </Table.Column>

                                <Table.Column width={200} fixed="right">
                                    <Table.HeaderCell style={styles.header}>Action</Table.HeaderCell>
                                    <Table.Cell>
                                        {rowData => {
                                            return (
                                                <p
                                                    style={{ color: '#134069', textDecoration: 'underline', cursor: 'pointer' }}
                                                    onClick={() => {
                                                        if (!!!props.acitveSprint) return;
                                                        moveToActiveSprint(rowData);
                                                    }}
                                                >
                                                    Move To Active Sprint
                                                </p>
                                            );
                                        }}
                                    </Table.Cell>
                                </Table.Column>

                            </Table>
                        </div>)
            }
        </div>
    )
}

const rowKey = 'identifier';
const ExpandCell = ({ rowData, dataKey, expandedRowKeys, onChange, ...props }) => (
    <Table.Cell {...props}>
        <IconButton
            size="lg"
            appearance="link"
            onClick={() => {
                onChange(rowData);
            }}
            icon={
                <Icon
                    icon={
                        expandedRowKeys.some(key => key === rowData[rowKey])
                            ? 'minus-square-o'
                            : 'plus-square-o'
                    }
                />
            }
        />
    </Table.Cell>
);

const styles = {
    header: {
        color: 'black',
    },
    cell: {
        color: 'black'
    },
};
