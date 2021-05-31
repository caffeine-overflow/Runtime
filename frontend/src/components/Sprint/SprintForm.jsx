import React, { useState, useEffect } from 'react'
import utils from "../../utility/utils";
import {
    InputNumber, Button, Form, FormGroup, ControlLabel, FormControl, Notification,
    Table, Toggle, Steps, Panel, ButtonGroup
} from 'rsuite';


export default function SprintForm(props) {
    const [title, settitle] = useState("");
    const [description, setdescription] = useState("");
    const [step, setStep] = useState(0);
    const [userStoriesDone, setuserStoriesDone] = useState([]);

    useEffect(() => {
        if (!!props.acitveSprint)
            getUserStoriesDone();
    }, []);

    const getUserStoriesDone = async () => {
        const response = await utils.FETCH_DATA(`api/userstories/unfinishedTask/${props.acitveSprint._id}`);
        let data = await response.data;
        let tableData = [];
        data.userstories.forEach((d, i) => {
            let estimated = d.estimated_time.split(',');
            tableData.push({
                "story": d.identifier,
                "estimated_hours": estimated[0],
                "estimated_mins": estimated[1],
                "re_estimated_hours": <InputNumber
                    onChange={(val) => {
                        tableData[i].hours = val;
                        setuserStoriesDone(tableData);
                    }}
                    max={50}
                    min={0}
                />,
                "re_estimated_mins": <InputNumber
                    onChange={(val) => {
                        tableData[i].mins = val;
                        setuserStoriesDone(tableData);
                    }}
                    max={59}
                    min={0}
                    defaultValue={0}
                />,
                "move_to_backlog": <Toggle
                    onChange={(val) => {
                        tableData[i].moveto_backlog = val;
                        setuserStoriesDone(tableData);
                    }}
                />,
                "moveto_backlog": false,
                "hours": 0,
                "mins": 0,
                "id": d._id
            });
        });
        setuserStoriesDone(tableData);
    }

    const onChange = nextStep => {
        setStep(nextStep < 0 ? 0 : nextStep > 3 ? 3 : nextStep);
    };

    const onNext = () => {
        if (!title || !description) return;
        if (step === 1 && userStoriesDone.find(u => Number(u.hours) === 0 && Number(u.mins) === 0)) {
            return;
        }
        onChange(step + 1);
    }

    const onPrevious = () => onChange(step - 1);

    const generateReport = async () => {
        //generate report
        return;
    }

    const createNewSprint = async () => {
        let user_stories = [];
        userStoriesDone.forEach(u => {
            user_stories.push({
                'id': u.id,
                'estimated_time': `${u.hours},${u.mins}`,
                'moveto_backlog': u.moveto_backlog
            });
        });

        if (props.acitveSprint) {
            await generateReport();
        }
        
        let message = "Sprint Created Successfully";
        let body = { 
                    'name': title,
                    'description': description,
                    'project_id': props.project_id,
                    'sprint_id': props.acitveSprint ? props.acitveSprint._id : null,
                     user_stories
                    };

        const response = await utils.POST_DATA('api/sprints',body ,message);
        if (response.status === 200) {
            props.refresh();
        }
       
    }
    return (
        <div>
            <div
                style={{
                    fontSize: '25px',
                    display: 'block',
                    textAlign: 'center',
                    marginBottom: '35px',
                    fontWeight: '400'
                }}
            >
                Create Sprint
            </div>

            <div style={{ padding: '0 40px', width: '90%' }}>
                <Steps current={step}>
                    <Steps.Item title="Sprint Info" description="Sprint Information" />
                    {
                        props.acitveSprint && <Steps.Item title="Manage User Stories" description="Re-Estimate/ Move to Backlog" />
                    }
                    <Steps.Item title="Submit" description="Create New Sprint" />
                </Steps>
                <hr />
                <Panel style={{ height: '40vh', padding: '0' }}>
                    {
                        step === 0 &&
                        <Form
                            className="loginForm"
                            style={{
                                margin: 'auto',
                                display: 'flex',
                                alignContent: 'center',
                                justifyContent: 'center',
                                flexWrap: 'wrap',
                                height: '35vh'
                            }}
                        >
                            <div style={{ width: '70%', margin: '10px 0' }}>
                                <TextField
                                    name="title"
                                    label="Title"
                                    value={title}
                                    onChange={(value) => settitle(value)}
                                />
                            </div>
                            <div style={{ width: '70%' }}>
                                <TextField
                                    name="description"
                                    label="Description"
                                    value={description}
                                    onChange={(value) => setdescription(value)}
                                />
                            </div>
                        </Form>
                    }
                    {
                        props.acitveSprint && step === 1 &&
                        <Table
                            cellBordered
                            height={350}
                            data={userStoriesDone}
                            headerHeight={80}
                            rowHeight={60}
                            style={{ border: '1px solid #e6e6e6' }}
                        >
                            <Table.Column align="center" verticalAlign="middle" flexGrow={1}>
                                <Table.HeaderCell>User Story</Table.HeaderCell>
                                <Table.Cell dataKey="story" />
                            </Table.Column>

                            <Table.ColumnGroup align="center" verticalAlign="middle" header="Estimated" flexGrow={1}>
                                <Table.Column>
                                    <Table.HeaderCell>Hours</Table.HeaderCell>
                                    <Table.Cell dataKey="estimated_hours" />
                                </Table.Column>
                                <Table.Column>
                                    <Table.HeaderCell>Minutes</Table.HeaderCell>
                                    <Table.Cell dataKey="estimated_mins" />
                                </Table.Column>
                            </Table.ColumnGroup>

                            <Table.ColumnGroup header="Re-Estimate" align="center" verticalAlign="middle" flexGrow={1}>
                                <Table.Column>
                                    <Table.HeaderCell>Hours</Table.HeaderCell>
                                    <Table.Cell dataKey="re_estimated_hours" />
                                </Table.Column>
                                <Table.Column>
                                    <Table.HeaderCell>Minutes</Table.HeaderCell>
                                    <Table.Cell dataKey="re_estimated_mins" />
                                </Table.Column>
                            </Table.ColumnGroup>

                            <Table.Column flexGrow={1} align="center" verticalAlign="middle">
                                <Table.HeaderCell>Move to Backlog</Table.HeaderCell>
                                <Table.Cell dataKey="move_to_backlog" />
                            </Table.Column>
                        </Table>
                    }
                    {
                        (step === 2 || !props.acitveSprint) &&
                        <div
                            style={{
                                margin: 'auto',
                                display: 'flex',
                                alignContent: 'center',
                                justifyContent: 'center',
                                flexWrap: 'wrap',
                                height: '35vh'
                            }}
                        >
                            <Button
                                style={{ width: '300px', background: "#134069", color: '#f5f5f5' }}
                                onClick={createNewSprint}
                            >
                                Create Sprint
                            </Button>
                        </div>
                    }
                </Panel>
                <hr />
                <ButtonGroup>
                    <Button onClick={onPrevious} disabled={step === 0}>
                        Previous
                    </Button>
                    <Button type="submit" onClick={onNext} disabled={props.acitveSprint ? step === 2 : step === 1}>
                        Next
                    </Button>
                </ButtonGroup>
            </div>
        </div>
    )
};

function TextField(props) {
    const { name, label, accepter, type, ...rest } = props;
    return (
        <FormGroup>
            <ControlLabel>{label} </ControlLabel>
            <FormControl name={name} type={type} accepter={accepter} {...rest} />
        </FormGroup>
    );
}

