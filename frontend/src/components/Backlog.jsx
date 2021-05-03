
import React, { useState, useEffect } from 'react'
import { Button, FlexboxGrid, Notification, PanelGroup, Panel } from 'rsuite';
import NotFound from "./NotFound";
import NoBacklog from "../assets/nobacklog.svg";

export default function Backlog(props) {

    const [backlogs, setbacklogs] = useState([]);

    const getBacklogs = async () => {
        let token = sessionStorage.getItem('sprintCompassToken');
        const requestOptions = {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`
            }
        };
        const response = await fetch(`http://localhost:5000/api/userstories/backlogs/${props.project_id}`, requestOptions);
        let data = await response.json();

        setbacklogs(data.userstories);
    }

    const moveToActiveSprint = async (userstory) => {
        let body = {};
        body._id = userstory._id;
        body.sprint_id = props.acitveSprint._id;
        let token = sessionStorage.getItem('sprintCompassToken');
        const requestOptions = {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`
            },
            body: JSON.stringify(body)
        };
        const response = await fetch(`http://localhost:5000/api/userstories`, requestOptions);

        //if updated
        if (response.ok) {
            Notification.success({
                title: 'User Story Has Been Moved to the Active Sprint',
                description: <div style={{ width: 220 }} rows={3} />,
                placement: 'topEnd'
            });
            getBacklogs();
        }
    }

    useEffect(() => {
        getBacklogs();
    }, [])

    return (
        <div>
            {
                backlogs.length === 0 ?
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
                                                    <div
                                                        style={{ padding: '20px', background: '#f5f5f5', height: '250px', overflowY: 'auto' }}
                                                    >
                                                        {b.description}
                                                    </div>
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
