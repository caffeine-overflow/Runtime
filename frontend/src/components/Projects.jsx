import React, { useState, useEffect } from 'react'
import ProjectSvg from "../assets/teamsHome.svg";
import Loader from "react-loader-spinner";
import {
    Drawer, Icon, Button, Form, FormGroup, FormControl, ControlLabel,
    ButtonToolbar, Schema, Notification, List, FlexboxGrid
} from 'rsuite';
import {
    useRouteMatch,
    withRouter
} from 'react-router-dom';
import '../App.css';
import Navbar from './Navbar'

const { StringType } = Schema.Types;

//model for create project
const createProjectDrawerModel = Schema.Model({
    name: StringType().isRequired('Name is required.'),
    description: StringType().isRequired('Description is required.')
});

//custom text field
function TextField(props) {
    const { name, label, accepter, type, ...rest } = props;
    return (
        <FormGroup>
            <ControlLabel>{label} </ControlLabel>
            <FormControl name={name} type={type} accepter={accepter} {...rest} />
        </FormGroup>
    );
}

const styleCenter = {
    display: 'flex',
    alignItems: 'center',
    height: '60px'
};

const slimText = {
    fontSize: '0.9em',
    color: '#97969B',
    fontWeight: 'lighter',
    paddingBottom: 3
};

const titleStyle = {
    paddingBottom: 5,
    whiteSpace: 'nowrap',
    fontWeight: 500
};

function Projects(props) {
    const [createProjectDrawer, setcreateProjectDrawer] = useState(false);
    const [projectName, setprojectName] = useState("");
    const [description, setdescription] = useState("");
    const [userProjects, setuserProjects] = useState([]);

    let getProjects = async () => {
        let currentUser = sessionStorage.getItem('sprintCompassUser');
        let token = sessionStorage.getItem('sprintCompassToken');
        const requestOptions = {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`
            }
        };
        const response = await fetch(`http://localhost:5000/api/projects`, requestOptions);
        let data = await response.json();

        let userProjects = [];
        data.projects.map(d => {
            let userExist = d.members.find(m => m._id === currentUser);
            if (userExist) {
                userProjects.push(d);
            }
        });
        setuserProjects(userProjects);
    }

    let close = () => {
        setcreateProjectDrawer(false);
        setprojectName("");
        setdescription("");
    }

    let createProject = async (status) => {
        if (status) {
            let token = sessionStorage.getItem('sprintCompassToken');
            const requestOptions = {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({ 'name': projectName, 'description': description })
            };
            const response = await fetch(`http://localhost:5000/api/projects`, requestOptions);
            if (response.status === 200) {
                Notification.success({
                    title: 'Project Has Been Created',
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
            getProjects();
        }
    }

    useEffect(() => {
        getProjects();
    }, []);

    return (
        <div>
            <Navbar />
            <section className="projectBannerContainer">
                <div className="teamImageContainer">
                    <img
                        style={{ width: "80%", maxWidth: "600px" }}
                        src={ProjectSvg}
                        alt="ProjectSvg"
                    />
                </div>
                <div className="projectImageContainer">
                    <div
                        style={{
                            fontSize: "45px",
                            fontWeight: "bold",
                            lineHeight: "1.2",
                            marginBottom: "50px",
                            width: '100%',
                            textAlign: 'center'
                        }}
                    >
                        Welcome to
                            <br />
                        <span
                            style={{
                                color: "#2D56B3",
                                fontWeight: 600
                            }}
                        >
                            Run
                            </span>
                        <span style={{ color: "#515B60" }}>time</span>
                    </div>
                    <div style={{ width: '100%' }}>
                        <div
                            className="teamButtons"
                            onClick={() => setcreateProjectDrawer(true)}
                        >
                            Create a Project
                    </div>
                    </div>
                </div>
            </section>
            {
                (userProjects && userProjects.length > 0) ?
                    <div>
                        <div className="projectHomeHeader">Your Projects</div>
                        <List hover style={{ width: '80%', margin: 'auto' }}>
                            {userProjects.map((item, index) => (
                                <List.Item key={item._id} index={index}>
                                    <FlexboxGrid>
                                        <FlexboxGrid.Item
                                            colspan={10}
                                            style={{
                                                ...styleCenter,
                                                flexDirection: 'column',
                                                alignItems: 'flex-start',
                                                overflow: 'hidden'
                                            }}
                                        >
                                            <div style={titleStyle}>{item.name}</div>
                                            <div style={slimText}>
                                                <div>Description</div>
                                                <div>{item.description}</div>
                                            </div>
                                        </FlexboxGrid.Item>
                                        <FlexboxGrid.Item colspan={6} style={styleCenter}>
                                            <div>
                                                <div style={slimText}>Project Lead</div>
                                                <div>
                                                    <Icon icon="user-circle-o" />
                                                    {`  ${item.project_lead.firstname} ${item.project_lead.lastname}`}
                                                </div>
                                            </div>
                                        </FlexboxGrid.Item>
                                        <FlexboxGrid.Item colspan={5} style={styleCenter}>
                                            <div>
                                                <div style={slimText}>Start Date</div>
                                                <div style={slimText}>{item.created_at}</div>
                                            </div>
                                        </FlexboxGrid.Item>
                                        <FlexboxGrid.Item
                                            colspan={3}
                                            style={{ ...styleCenter, justifyContent: 'center' }}
                                        >
                                            <div
                                                style={{ cursor: 'pointer', color: '#134069' }}
                                                onClick={() => props.history.push(`project/${item._id}`)}
                                            >
                                                View
                                        </div>
                                        </FlexboxGrid.Item>
                                    </FlexboxGrid>
                                </List.Item>
                            ))}
                        </List>
                    </div> :
                    <Loader
                        style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}
                        type="ThreeDots"
                        color="#134069"
                        height={50}
                        width={50}
                    />
            }
            <Drawer
                show={createProjectDrawer}
                onHide={() => { close() }}
            >
                <Drawer.Body>
                    <div className="drawerBody">
                        <Form
                            model={createProjectDrawerModel}
                            onSubmit={(status) => { createProject(status) }}
                        >
                            <h5 style={{ textAlign: 'center', marginBottom: '50px' }}>Create a Project</h5>
                            <TextField
                                name="name"
                                label="Project Name"
                                onChange={(value) => setprojectName(value)}
                            />
                            <TextField
                                name="description"
                                label="Description"
                                onChange={(value) => setdescription(value)}
                            />
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
        </div>
    )
}
export default withRouter(Projects);
