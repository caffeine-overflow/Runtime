import React, { useState, useEffect } from 'react'
import ProjectSvg from "../assets/teamsHome.svg";
import {
    Grid, Row, Col, Drawer,
    Button, Form, FormGroup, FormControl, ControlLabel,
    ButtonToolbar, Schema, Notification, Tag
} from 'rsuite';
import {
    useRouteMatch, withRouter
} from 'react-router-dom';
import '../App.css';
import Navbar from './Navbar'

const { StringType } = Schema.Types;


//data validation for add new team
const model = Schema.Model({
    name: StringType().isRequired('This field is required.')
});

function TextField(props) {
    const { name, label, accepter, ...rest } = props;
    return (
        <FormGroup>
            <ControlLabel>{label} </ControlLabel>
            <FormControl name={name} accepter={accepter} {...rest} />
        </FormGroup>
    );
}

//data validation for join team
const model2 = Schema.Model({
    name: StringType().isRequired('This field is required.'),
    access_code: StringType().isRequired('This field is required.')
});

function TextField2(props) {
    const { name, label, accepter, ...rest } = props;
    return (
        <FormGroup>
            <ControlLabel>{label} </ControlLabel>
            <FormControl name={name} accepter={accepter} {...rest} />
        </FormGroup>
    );
}


function Teams(props) {
    const [openDrawer, setopenDrawer] = useState(false);
    const [openJoinTeamDrawer, setJoinTeamDrawer] = useState(false);
    const [name, setName] = useState("");
    const [desc, setDesc] = useState("");
    const [accessCode, setAccessCode] = useState("");
    const [teams, setTeams] = useState([]);

    let { path, url } = useRouteMatch();

    let close = () => {
        setopenDrawer(false);
        setName("");
    }

    let toggleDrawer = () => {
        setopenDrawer(true);
    }

    let addTeam = async (status) => {
        if (status) {
            let token = sessionStorage.getItem('sprintCompassToken');
            const requestOptions = {
                method: 'POST',
                headers: {
                    'Access-Control-Expose-Headers': '*',
                    'Access-Control-Allow-Origin': '*',
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({ 'name': name, 'description': desc })
            };

            const response = await fetch('http://localhost:5000/api/teams', requestOptions);

            if (response.status === 200) {
                Notification.success({
                    title: 'Team Has Been Created',
                    description: <div style={{ width: 220 }} rows={3} />,
                    placement: 'topEnd'
                });
            }
            else {
                Notification.error({
                    title: 'Server error, Try again later',
                    description: <div style={{ width: 220 }} rows={3} />,
                    placement: 'topEnd'
                });
            }
            close();
            getTeams();
        }
    }

    let joinTeam = async (status) => {
        if (status) {
            let token = sessionStorage.getItem('sprintCompassToken');
            const requestOptions = {
                method: 'PUT',
                headers: {
                    'Access-Control-Expose-Headers': '*',
                    'Access-Control-Allow-Origin': '*',
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({ 'teamName': name, 'teamId': accessCode })
            };

            const response = await fetch('http://localhost:5000/api/teams/join', requestOptions);

            if (response.status === 200) {
                Notification.success({
                    title: `You have joined the ${name} Successfully.`,
                    description: <div style={{ width: 220 }} rows={3} />,
                    placement: 'topEnd'
                });
            }
            else {
                Notification.error({
                    title: 'Server error, Try again later',
                    description: <div style={{ width: 220 }} rows={3} />,
                    placement: 'topEnd'
                });
            }
            setJoinTeamDrawer(false);
            setName("");
            getTeams();
        }
    }

    let getTeams = async () => {
        let token = sessionStorage.getItem('sprintCompassToken');
        const requestOptions = {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`
            }
        };
        const response = await fetch('http://localhost:5000/api/teams', requestOptions);
        let data = await response.json();
        setTeams(data.teams);
    }

    useEffect(() => {
        getTeams();
    }, []);

    return (
        <div>
            <Navbar />
            <Grid fluid>
                <Row className="show-grid" style={{ minHeight: '750px' }}>
                    <Col xs={12} className="projectImageContainer">
                        <img
                            style={{ width: "80%", maxWidth: "750px" }}
                            src={ProjectSvg}
                            alt="ProjectSvg"
                        />
                    </Col>
                    <Col xs={12} className="projectImageContainer">
                        <div
                            style={{
                                fontSize: "45px",
                                fontWeight: "bold",
                                lineHeight: "1.2",
                                marginBottom: "100px",
                                width: '100%',
                                textAlign: 'center'
                            }}
                        >
                            Welcome To
                            <br />
                            <span
                                style={{
                                    color: "#2D56B3",
                                    marginRight: "10px",
                                }}
                            >
                                Sprint
                            </span>
                            <span style={{ color: "#515B60" }}>Compass</span>
                        </div>
                        <div style={{ width: '100%' }}>
                            <div
                                className="createProjectButton"
                                onClick={toggleDrawer}
                            >
                                Create a Team
                            </div>
                            <div
                                className="createProjectButton"
                                onClick={() => setJoinTeamDrawer(true)}
                            >
                                Join a Team
                            </div>
                        </div>
                    </Col>
                </Row>
            </Grid>
            {
                teams && teams.length > 0 &&
                <div>
                    <div className="projectHomeHeader">Your Teams</div>
                    <div style={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap', width: '80%', margin: '0 auto 50px auto' }}>
                        {
                            teams.map((t, i) => {
                                return <div
                                    key={i}
                                    className="teamCard"
                                    onClick={() => props.history.push(`team/${t._id}`)}
                                >
                                    <div style={{ margin: '15px' }}>
                                        <div style={{ fontSize: '20px', fontWeight: '500' }}>{t.name}</div>
                                        <div style={{ margin: '25px 0' }}>
                                            <Tag style={{ background: '#505050', color: '#f5f5f5' }}>Lead</Tag>
                                            <span style={{ margin: '0 10px', fontSize: '18px' }}>
                                                {`${t.team_lead.firstname} ${t.team_lead.lastname}`}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            })
                        }
                    </div>
                </div>
            }
            <Drawer
                show={openDrawer}
                onHide={close}
            >
                <Drawer.Body>
                    <div className="drawerBody">
                        <Form
                            model={model}
                            onSubmit={(status) => { addTeam(status) }}
                        >
                            <h5 style={{ textAlign: 'center', marginBottom: '50px' }}>Create a New Team</h5>
                            <TextField
                                name="name"
                                label="Team Name"
                                onChange={(value) => setName(value)}
                            />
                            <FormGroup>
                                <ControlLabel>Description</ControlLabel>
                                <FormControl
                                    rows={5}
                                    name="description"
                                    componentClass="textarea"
                                    onChange={(value) => setDesc(value)}
                                />
                            </FormGroup>
                            <ButtonToolbar>
                                <Button
                                    appearance="primary"
                                    type="submit"
                                    style={{ width: '100%' }}
                                >
                                    Submit
                                </Button>
                            </ButtonToolbar>
                        </Form>
                    </div>
                </Drawer.Body>
            </Drawer>

            <Drawer
                show={openJoinTeamDrawer}
                onHide={() => {
                    setJoinTeamDrawer(false);
                    setName("");
                }}
            >
                <Drawer.Body>
                    <div className="drawerBody">
                        <Form
                            model={model2}
                            onSubmit={(status) => { joinTeam(status) }}
                        >
                            <h5 style={{ textAlign: 'center', marginBottom: '50px' }}>Join a New Team</h5>
                            <TextField2
                                name="name"
                                label="Team Name"
                                onChange={(value) => setName(value)}
                            />
                            <TextField2
                                name="access_code"
                                label="Access Code"
                                onChange={(value) => setAccessCode(value)}
                            />
                            <ButtonToolbar>
                                <Button
                                    appearance="primary"
                                    type="submit"
                                    style={{ width: '100%' }}
                                >
                                    Join
                                </Button>
                            </ButtonToolbar>
                        </Form>
                    </div>
                </Drawer.Body>
            </Drawer>
        </div>
    )
}
export default withRouter(Teams);
