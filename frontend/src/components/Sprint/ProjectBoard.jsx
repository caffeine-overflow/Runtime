import React, { useState, useEffect } from 'react';
import {
    Sidenav, Dropdown, Nav, Container, Icon,
    Content, Sidebar, Navbar, FlexboxGrid
} from 'rsuite';
import { useRouteMatch, withRouter } from 'react-router-dom';
import '../../App.css';
import MainNavbar from '../Navbar';
import SprintTable from './SprintTable';
import CreateTicket from "../../assets/createTicket.svg";
import SprintImg from "../../assets/sprint.svg";
import NoActiveSprint from "../../assets/noactivesprint.svg";
import Backlog from "./Backlog";
import SprintHistory from "./SprintHistory";
import UserStoryForm from "./UserStoryForm";
import SprintForm from "./SprintForm";
import NotFound from "../NotFound";
import SprintHome from "./sprintHome";
import utils from "../../utility/utils";


const NavToggle = ({ expand, onChange }) => {
    return (
        <Navbar appearance="inverse"
            style={{ background: '#134069' }}
            className="nav-toggle"
        >
            <Navbar.Body>
                <Nav pullRight>
                    <Nav.Item onClick={onChange} style={{ width: 56, textAlign: 'center' }}>
                        <Icon icon={expand ? 'angle-left' : 'angle-right'} />
                    </Nav.Item>
                </Nav>
            </Navbar.Body>
        </Navbar>
    );
};

function ProjectBoard() {
    const [collaborators, setcollaborators] = useState([]);
    const [project, setproject] = useState(null);
    const [sprints, setsprints] = useState([]);

    const [homeToggle, setHomeToggle] = useState(true);
    const [activeSprintToggle, setactiveSprintToggle] = useState(false);
    const [createSprintToggle, setcreateSprintToggle] = useState(false);
    const [createUserStoryToggle, setcreateUserStoryToggle] = useState(false);
    const [viewBacklogToggle, setviewBacklogToggle] = useState(false);
    const [sprintHistoryToggle, setsprintHistoryToggle] = useState(false);

    const [expand, setexpand] = useState(true);
    const [acitveSprint, setActiveSprint] = useState(null);

    let { url } = useRouteMatch();

    let getSprints = async () => {

        const response = await utils.FETCH_DATA(`api/sprints/allByProjectId/${url.split('/')[2]}`);
        let data = await response.data;

        let currentSprint = data.sprints.find(d => !d.is_done);
        setActiveSprint(currentSprint);
        setsprints(data.sprints);
    }

    let getProjectById = async () => {
        const response = await utils.FETCH_DATA(`api/projects/byProjectId/${url.split('/')[2]}`);
        let data = await response.data;
        setproject(data.project);
    }

    const handleToggle = () => {
        setexpand(!expand);
    }

    const navbarToggleHandler = (toggleFunction) => {
        setactiveSprintToggle(false);
        setcreateUserStoryToggle(false);
        setcreateSprintToggle(false);
        setviewBacklogToggle(false);
        setsprintHistoryToggle(false);
        setHomeToggle(false);

        toggleFunction(true);
    };

    const getAllUsers = async () => {

        const response = await utils.FETCH_DATA(`api/users`);
        let data = await response.data;
        setcollaborators(data.users);
    }

    useEffect(() => {
        getAllUsers();
        getSprints();
        getProjectById();
    }, []);

    return (
        <div>
            <MainNavbar />
            <div className="show-fake-browser sidebar-page">
                <Container>
                    <Sidebar
                        style={{ display: 'flex', flexDirection: 'column' }}
                        width={expand ? 260 : 56}
                        collapsible
                    >
                        <Sidenav
                            expanded={expand}
                            defaultOpenKeys={['3', '4']}
                            appearance="inverse"
                            style={{ background: '#134069', minHeight: 'calc(100vh - 97px)', height: '100%' }}
                        >
                            <Sidenav.Body>
                                <Nav>
                                    <Nav.Item
                                        eventKey="2"
                                        icon={<Icon icon="home" />}
                                        active={homeToggle}
                                        onClick={() => navbarToggleHandler(setHomeToggle)}
                                    >
                                        Home
                                    </Nav.Item>
                                    <Dropdown
                                        eventKey="3"
                                        trigger="hover"
                                        title="Sprint Planning"
                                        icon={<Icon icon="magic" />}
                                        placement="rightStart"
                                    >
                                        <Dropdown.Item
                                            eventKey="3-3"
                                            active={activeSprintToggle}
                                            icon={<Icon icon="dashboard" />}
                                            onClick={() => navbarToggleHandler(setactiveSprintToggle)}
                                        >
                                            Active Sprint
                                        </Dropdown.Item>

                                        <Dropdown.Item eventKey="3-2"
                                            active={createSprintToggle}
                                            icon={<Icon icon="plus-square" />}
                                            onClick={() => navbarToggleHandler(setcreateSprintToggle)}
                                        >
                                            Create New Sprint
                                        </Dropdown.Item>

                                        <Dropdown.Item
                                            eventKey="3-1"
                                            active={createUserStoryToggle}
                                            icon={<Icon icon="newspaper-o" />}
                                            onClick={() => navbarToggleHandler(setcreateUserStoryToggle)}
                                        >
                                            Create User Story
                                        </Dropdown.Item>

                                    </Dropdown>
                                    <Nav.Item
                                        eventKey="2"
                                        active={viewBacklogToggle}
                                        icon={<Icon icon="toggle-left" />}
                                        onClick={() => navbarToggleHandler(setviewBacklogToggle)}
                                    >
                                        View Backlog
                                    </Nav.Item>
                                    <Dropdown
                                        eventKey="4"
                                        trigger="hover"
                                        title="Advanced"
                                        icon={<Icon icon="gear-circle" />}
                                        placement="rightStart"
                                    >
                                        <Dropdown.Item
                                            eventKey="4-1"
                                            active={sprintHistoryToggle}
                                            onClick={() => navbarToggleHandler(setsprintHistoryToggle)}
                                            icon={<Icon icon="history" />}
                                        >
                                            Sprint History
                                        </Dropdown.Item>
                                        <Dropdown.Item eventKey="4-2">Websites</Dropdown.Item>
                                        <Dropdown.Item eventKey="4-3">Channels</Dropdown.Item>
                                        <Dropdown.Item eventKey="4-4">Tags</Dropdown.Item>
                                        <Dropdown.Item eventKey="4-5">Versions</Dropdown.Item>
                                    </Dropdown>
                                </Nav>
                            </Sidenav.Body>
                            <NavToggle expand={expand} onChange={handleToggle} />
                        </Sidenav>
                    </Sidebar>

                    <Container>
                        <Content>
                            {
                                homeToggle && !!project &&
                                <SprintHome
                                    project={project}
                                />
                            }
                            {
                                activeSprintToggle &&
                                <div>

                                    {
                                        acitveSprint ?
                                            <SprintTable
                                                sprint={acitveSprint}
                                                collaborators={collaborators}
                                                project_id={url.split('/')[2]}
                                            /> :
                                            <NotFound
                                                image={NoActiveSprint}
                                                msg="No Active Sprint Found"
                                            />
                                    }
                                </div>
                            }
                            {
                                createSprintToggle &&
                                <div>
                                    <div className="show-grid">
                                        <FlexboxGrid style={{ background: '#f5f5f5', height: 'calc(100vh - 97px)' }}>
                                            <FlexboxGrid.Item
                                                style={{ margin: 'auto' }}
                                                colspan={8}
                                            >
                                                <img
                                                    className="dashBoardSectionImg"
                                                    src={SprintImg}
                                                    alt=""
                                                />
                                            </FlexboxGrid.Item>
                                            <FlexboxGrid.Item
                                                colspan={16}
                                                style={{ margin: 'auto' }}
                                            >
                                                <SprintForm
                                                    project_id={url.split('/')[2]}
                                                    acitveSprint={acitveSprint}
                                                    refresh={() => {
                                                        navbarToggleHandler(setHomeToggle);
                                                        getSprints()
                                                    }}
                                                />
                                            </FlexboxGrid.Item>
                                        </FlexboxGrid>
                                    </div>
                                </div>
                            }
                            {
                                createUserStoryToggle &&
                                <div>
                                    <div className="show-grid">
                                        <FlexboxGrid style={{ background: '#f5f5f5', height: 'calc(100vh - 97px)' }}>
                                            <FlexboxGrid.Item
                                                style={{ margin: 'auto' }}
                                                colspan={12}
                                            >
                                                <img
                                                    className="dashBoardSectionImg"
                                                    src={CreateTicket}
                                                    alt=""
                                                />
                                            </FlexboxGrid.Item>
                                            <FlexboxGrid.Item
                                                colspan={12}
                                                style={{ margin: 'auto' }}
                                            >
                                                <div
                                                    style={{
                                                        fontSize: '25px',
                                                        display: 'block',
                                                        textAlign: 'center',
                                                        marginBottom: '15px',
                                                        fontWeight: '400'
                                                    }}
                                                >
                                                    Create User Story
                                                </div>
                                                <UserStoryForm
                                                    project_id={url.split('/')[2]}
                                                    acitveSprint={acitveSprint}
                                                    collaborators={collaborators}
                                                />
                                            </FlexboxGrid.Item>
                                        </FlexboxGrid>
                                    </div>
                                </div>
                            }
                            {
                                viewBacklogToggle &&
                                <Backlog project_id={url.split('/')[2]} acitveSprint={acitveSprint} />
                            }
                            {
                                sprintHistoryToggle &&
                                <SprintHistory />
                            }
                        </Content>
                    </Container>
                </Container>
            </div>
        </div>
    );
}

export default withRouter(ProjectBoard);