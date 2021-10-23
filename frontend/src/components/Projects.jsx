import React, { useState, useEffect } from 'react'
import ProjectSvg from "../assets/teamsHome.svg";
import Loader from "react-loader-spinner";
import {
    Drawer, Icon, Button, Form, FormGroup, FormControl, ControlLabel,
    ButtonToolbar, Schema, List, FlexboxGrid
} from 'rsuite';
import {
    withRouter
} from 'react-router-dom';
import '../App.css';
import Navbar from './Navbar'
import util from "../utility/utils";
import Tour from 'reactour';

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
    const [userRole, setUserRole] = useState([]);
    const [loading, setloading] = useState(false);
    const [helpEnabled, setHelpEnabled] = useState(false);

    let getProjects = async () => {
        setloading(true);
        setUserRole(sessionStorage.getItem('sprintCompassUserRole'));
        const response = await util.FETCH_DATA(`api/projects`);
        setuserProjects(response.data.projects);
        setloading(false);
    }

    let close = () => {
        setcreateProjectDrawer(false);
        setprojectName("");
        setdescription("");
    }

    let createProject = async (status) => {
        if (status) {
            let message = "Project Has Been Created";
            let body = { 'name': projectName, 'description': description };
            await util.POST_DATA(`api/projects`, body, message);
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
                <Icon
                    icon="help-o"
                    size="2x"
                    style={{ color: '#134069', position: 'absolute', right: 50, top: 20, cursor: 'pointer' }}
                    onClick={() => setHelpEnabled(true)}
                />
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
                            style={{ color: "#2D56B3" }}
                        >
                            Run
                        </span>
                        <span style={{ color: "#515B60" }}>time</span>
                    </div>
                    {(userRole === "owner" || userRole === "admin") && (
                        <div style={{ width: "100%" }}>
                            <div className="teamButtons" onClick={() => setcreateProjectDrawer(true)}>
                                Create a Project
                            </div>
                        </div>
                    )}
                </div>
            </section>
            {
                loading &&
                <Loader
                    style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}
                    type="ThreeDots"
                    color="#134069"
                    height={50}
                    width={50}
                />
            }
            <div>
                <div className="projectHomeHeader">Your Projects</div>
                <List id="project__list" hover style={{ width: '80%', margin: 'auto' }}>
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
            </div>
            {
                userProjects.length === 0 && !loading && <div style={{ textAlign: 'center' }}>No Projects Found</div>
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
            <Tour
                steps={steps}
                isOpen={helpEnabled}
                rounded={5}
                accentColor="#134069"
                className="helper"
                onRequestClose={() => setHelpEnabled(false)}
            />
        </div>
    )
}

const steps = [
    {
        selector: '#project__link',
        content: () => <div className="helper__text">You can access all your projects from here</div>
    },
    {
        selector: '#collaborate__link',
        content: () => <div className="helper__text">Collaborate with your teammates with a single click</div>
    },
    {
        selector: '#account__dropdown',
        content: () => <div className="helper__text">You can manage your account here</div>
    },
    {
        selector: '#project__list',
        content: () => <div className="helper__text">You can view all your projects here</div>,
    }
]

export default withRouter(Projects);
