
import React, { useState, useEffect } from 'react'
import { Button, FlexboxGrid, PanelGroup, Panel } from 'rsuite';
import NotFound from "../NotFound";
import NoBacklog from "../../assets/nobacklog.svg";
import utils from "../../utility/utils"
import Editor from "../utilitycomponents/Editor";


export default function Backlog(props) {

    const [backlogs, setbacklogs] = useState([]);
    const [loading, setloading] = useState(false);

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
                !loading && backlogs.length === 0 ?
                    <NotFound
                        image={NoBacklog}
                        msg="So empty!"
                    />
                    :
                    <div style={{ margin: '50px auto', width: '80%' }}>
                        <PanelGroup accordion defaultActiveKey={null} bordered>
                            {
                                backlogs.map((b, i) => {
                                    return <Panel key={i} header={b.title} eventKey={i + 1}>
                                        <FlexboxGrid style={{ minHeight: '300px' }}>
                                            <FlexboxGrid.Item colspan={12}>
                                                <div>
                                                    <div
                                                        style={{ fontSize: '20px', fontWeight: 'bold', margin: '10px 0' }}
                                                    >
                                                        {b.title}
                                                    </div>
                                                    <Editor
                                                        disabled={true}
                                                        value={b.description}
                                                    />
                                                </div>
                                            </FlexboxGrid.Item>
                                            <FlexboxGrid.Item colspan={12} style={{ height: '300px' }}>
                                                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                                                    <Button
                                                        style={{ padding: '20px', color: '#f5f5f5', background: '#134069' }}
                                                        disabled={!!!props.acitveSprint}
                                                        onClick={() => moveToActiveSprint(b)}
                                                    >
                                                        Move To Active Sprint
                                                    </Button>
                                                </div>
                                            </FlexboxGrid.Item>
                                        </FlexboxGrid>
                                    </Panel>
                                })
                            }
                        </PanelGroup>
                    </div>
            }
        </div>
    )
}
