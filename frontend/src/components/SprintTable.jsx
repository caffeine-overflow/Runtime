import React, { useState, useEffect } from 'react'
import {
    Drawer, Icon, InputNumber, Timeline,
    Button, Notification, Toggle, Tag,
    Input, InputPicker, FlexboxGrid, Modal
} from 'rsuite';
import { withRouter } from 'react-router-dom';
import '../App.css';
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import UserStoryForm from "./UserStoryForm";
import SubTaskForm from "./SubTaskForm";
import NotFound from "./NotFound";
import NoUserStories from "../assets/noactivesprint.svg";

//four states of the stories, has to match the db
const STORY_STATES = ["To Do", "In Progress", "Testing", "Done"];

/*Moves an item from one list to another list.*/
const move = (source, destination, droppableSource, droppableDestination) => {
    const sourceClone = Array.from(source);
    const destClone = Array.from(destination);
    const [removed] = sourceClone.splice(droppableSource.index, 1);

    destClone.splice(droppableDestination.index, 0, removed);

    const result = {};
    result[droppableSource.droppableId] = sourceClone;
    result[droppableDestination.droppableId] = destClone;

    return result;
};

const grid = 8;

const getItemStyle = (isDragging, draggableStyle, childTask) => ({
    userSelect: "none",
    padding: grid * 2,
    margin: childTask ? `0 0 ${grid}px 20px` : `0 0 ${grid}px 0`,
    borderRadius: '10px',
    // change background colour if dragging
    background: isDragging ? "#f5f5f5" : "#ffffff",

    cursor: 'pointer',
    // styles we need to apply on draggables
    ...draggableStyle
});

const getListStyle = isDraggingOver => ({
    background: isDraggingOver ? "#e6e6e6" : "#f1f1f1",
    padding: grid,
    width: 350,
    margin: "0 10px"
});

const getTagColor = (index) => {
    if (index === 0)
        return "orange"
    else if (index === 1)
        return "blue"
    else if (index === 2)
        return "violet"
    else if (index === 3)
        return "green"
};

function Sprint(props) {

    const [state, setState] = useState(null);
    const [userStories, setuserStories] = useState([]);
    const [users, setUsers] = useState([]);
    const [showdrawer, setshowdrawer] = useState(false);
    const [selectedUserStory, setselectedUserStory] = useState(null);

    const [title, settitle] = useState("");
    const [description, setdescription] = useState("");
    const [assignedTo, setassignedTo] = useState(null);
    const [estimatedHours, setestimatedHours] = useState(null);
    const [estimatedMinutes, setestimatedMinutes] = useState(null);
    const [timeSpentHours, settimeSpentHours] = useState(null);
    const [timeSpentMinuts, settimeSpentMinuts] = useState(null);
    const [moveToBacklog, setmoveToBacklog] = useState(null);
    const [history, setHistory] = useState([]);

    const [showModal, setshowModal] = useState(false);

    function onDragEnd(result) {

        const { source, destination } = result;

        // dropped outside the list
        if (!destination) {
            return;
        }
        const sInd = +source.droppableId;
        const dInd = +destination.droppableId;

        if (sInd === dInd) {
            // const items = reorder(state[sInd], source.index, destination.index);
            // const newState = [...state];
            // newState[sInd] = items;
            // setState(newState);
            return;
        } else {
            //change the state in the database
            changeStoryState(result.draggableId, STORY_STATES[destination.droppableId]);

            const resultSet = move(state[sInd], state[dInd], source, destination);
            const newState = [...state];
            newState[sInd] = resultSet[sInd];
            newState[dInd] = resultSet[dInd];

            newState.forEach(t => {
                t.sort((a, b) => a.identifier.localeCompare(b.identifier));
            })

            setState(newState);
        }
    }

    const generateTableCards = (data) => {
        let tableData = [];
        tableData.push(data.filter(d => d.state === "To Do"));
        tableData.push(data.filter(d => d.state === "In Progress"));
        tableData.push(data.filter(d => d.state === "Testing"));
        tableData.push(data.filter(d => d.state === "Done"));

        tableData.forEach(t => {
            t.forEach(u => {
                if (u.parent_task) {
                    u.identifier = `${u.parent_task.identifier}/${u.identifier}`
                }
            })
            t.sort((a, b) => a.identifier.localeCompare(b.identifier));
        })

        setState(tableData);
    }

    const changeStoryState = async (id, state) => {
        let token = sessionStorage.getItem('sprintCompassToken');
        const requestOptions = {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`
            },
            body: JSON.stringify({ _id: id, state })
        };
        const response = await fetch(`http://localhost:5000/api/userstories`, requestOptions);
        if (response.ok) getUserStories();
    }

    const getUserStories = async () => {
        let token = sessionStorage.getItem('sprintCompassToken');
        const requestOptions = {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`
            }
        };
        const response = await fetch(`http://localhost:5000/api/userstories/bySprint/${props.sprint._id}`, requestOptions);
        if (response.ok) {
            let data = await response.json();
            generateTableCards(data.userstories)
            setuserStories(data.userstories);
        }
    }

    const getAllUsers = async () => {
        let token = sessionStorage.getItem('sprintCompassToken');
        const requestOptions = {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`
            }
        };
        const response = await fetch(`http://localhost:5000/api/users`, requestOptions);
        let data = await response.json();
        setUsers(data.users)
    }

    const updateUserStory = async () => {
        let body = {};

        /*checking what has changed*/

        //checking if title has changed
        if (title !== selectedUserStory.title) {
            body['title'] = title;
        }

        //checking if title has changed
        if (description !== selectedUserStory.description) {
            body['description'] = description;
        }

        //checking if description has changed
        if (assignedTo !== selectedUserStory.assigned_to?._id) {
            body['assigned_to'] = assignedTo;
        }

        //checking if estimated time has changed
        if (estimatedHours !== selectedUserStory.estimated_time.split(',')[0] ||
            estimatedMinutes !== selectedUserStory.estimated_time.split(',')[1]
        ) {
            body['estimated_time'] = `${estimatedHours},${estimatedMinutes}`;
        }

        //checking if timespent has changed
        if (timeSpentHours !== selectedUserStory.time_spent?.split(',')[0] ||
            timeSpentMinuts !== selectedUserStory.time_spent?.split(',')[1]
        ) {
            if (timeSpentHours !== "0" || timeSpentMinuts !== "0") {
                body['time_spent'] = `${timeSpentHours},${timeSpentMinuts}`;
            }
        }

        //checking if the userstory needs to be moved to backlog
        if (moveToBacklog) {
            body['moveto_backlog'] = true;
        }
        if (Object.keys(body).length === 0) {
            setshowdrawer(false);
            return;
        }

        body['_id'] = selectedUserStory._id;
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
                title: 'User Story Has Been Updated',
                description: <div style={{ width: 220 }} rows={3} />,
                placement: 'topEnd'
            });

            setshowdrawer(false);
            getUserStories();
        }
    }

    let parseHistory = async (histories) => {

        let parsedHisotry = histories.map((history) => {
            let returnContent = '';
            if (history.attribute == "user_story") {
                returnContent = `Created the task`
            }
            else if (history.attribute == "description")
                returnContent = `Updated Description to  "${history.new_value}"`
            else if (history.attribute == "state")
                returnContent = `Changed state from "${history.old_value}" to  "${history.new_value}"`

            else if (history.attribute == "title")
                returnContent = `Updated Title to  "${history.new_value}"`

            else if (history.attribute == "assigned_to") {
                let assigned_to = users.find(element => element._id == history.new_value);
                returnContent = `Changed Assiginee to ${assigned_to.firstname} ${assigned_to.lastname}`
            }

            else if (history.attribute == "estimated_time")
                returnContent = `Re-estimated the task to be completed in ${history.new_value.split(',')[0]} hours and  ${history.new_value.split(',')[1]} minutes`

            else if (history.attribute == "time_spent")
                returnContent = `Increased the time stpent to ${history.new_value.split(',')[0]} hours and  ${history.new_value.split(',')[1]} minutes`

            else if (history.attribute == "state")
                returnContent = `Changed State from ${history.old_value} to ${history.new_value}`

            else if (history.attribute == "moveto_backlog")
                returnContent = `Moved task to backlog.`

            else if (history.attribute == "sprint_id")
                returnContent = `Moved task to sprint ${history.new_value}`

            let user = users.find(element => element._id == history.updated_by);
            return <div><p style={{ fontWeight: 500 }}>{history.timestamp}</p><p style={{ marginTop: -3 }}>{returnContent}</p><p style={{ marginTop: -1, fontWeight: 400 }}>By: {user?.firstname} {user?.lastname}</p></div>
        })
        setHistory(parsedHisotry);
    }

    useEffect(() => {
        getAllUsers();
        getUserStories();
    }, []);

    return (
        <div>
            {
                state &&
                <div>
                    <div style={{ margin: '40px 30px', fontSize: '23px', fontWeight: '700' }}>
                        Sprint - {props.sprint.name}
                    </div>
                    {
                        userStories.length === 0 ?
                            <NotFound
                                msg="No User Stories Found"
                                image={NoUserStories}
                            /> :
                            <div style={{ display: "flex", justifyContent: "center", margin: "20px 0" }}>
                                <DragDropContext onDragEnd={onDragEnd}>
                                    {state.map((el, ind) => (
                                        <Droppable key={ind} droppableId={`${ind}`}>
                                            {(provided, snapshot) => (
                                                <div
                                                    ref={provided.innerRef}
                                                    style={getListStyle(snapshot.isDraggingOver)}
                                                    {...provided.droppableProps}
                                                >
                                                    <div
                                                        style={{ margin: '20px', color: '#575757', fontWeight: 'bold', fontSize: '18px' }}
                                                    >
                                                        {STORY_STATES[ind]}
                                                    </div>
                                                    {el.map((item, index) => (
                                                        <div key={index} style={{ padding: '0 15px' }}>
                                                            <Draggable
                                                                key={item._id}
                                                                draggableId={String(item._id)}
                                                                index={index}
                                                            >
                                                                {(provided, snapshot) => (
                                                                    <div
                                                                        ref={provided.innerRef}
                                                                        {...provided.draggableProps}
                                                                        {...provided.dragHandleProps}
                                                                        style={getItemStyle(
                                                                            snapshot.isDragging,
                                                                            provided.draggableProps.style,
                                                                            !!item.parent_task
                                                                        )}
                                                                        onClick={() => {
                                                                            setshowdrawer(true);
                                                                            setselectedUserStory(item);
                                                                            parseHistory(item.history);
                                                                            settitle(item.title);
                                                                            setdescription(item.description);
                                                                            setassignedTo(item.assigned_to?._id);
                                                                            setestimatedHours(item.estimated_time?.split(',')[0]);
                                                                            setestimatedMinutes(item.estimated_time?.split(',')[1]);
                                                                            settimeSpentHours(item.time_spent ? item.time_spent.split(',')[0] : "0");
                                                                            settimeSpentMinuts(item.time_spent ? item.time_spent.split(',')[1] : "0");
                                                                            setmoveToBacklog(false);
                                                                        }}
                                                                    >
                                                                        <div>
                                                                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                                                                <Tag
                                                                                    style={{ fontWeight: '600', marginBottom: '10px' }}
                                                                                    color={getTagColor(ind)}
                                                                                >
                                                                                    {item.title}
                                                                                </Tag>

                                                                                <Tag style={{ fontWeight: '600', marginBottom: '10px', background: '#ececec' }}>
                                                                                    {item.identifier}
                                                                                </Tag>
                                                                            </div>
                                                                            <div
                                                                                style={{ margin: '10px 0' }}
                                                                            >
                                                                                {item.description}
                                                                            </div>
                                                                            <div style={{ marginTop: "15px" }}>
                                                                                <Icon
                                                                                    icon="user-circle-o"
                                                                                    style={{ marginRight: '5px' }}
                                                                                />
                                                                                {
                                                                                    item.assigned_to ? `${item.assigned_to.firstname} ${item.assigned_to.lastname}` : 'Unassigned'
                                                                                }
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                )}
                                                            </Draggable>
                                                        </div>
                                                    ))}
                                                    {provided.placeholder}
                                                </div>
                                            )}
                                        </Droppable>
                                    ))}
                                </DragDropContext>
                            </div>
                    }
                </div>
            }

            <Drawer
                show={showdrawer}
                onHide={() => {
                    setshowdrawer(false);
                    setselectedUserStory(null);
                }}
                size="md"
            >
                <Drawer.Header>
                </Drawer.Header>
                <Drawer.Body>
                    {
                        !!selectedUserStory &&
                        <div
                            style={{
                                display: 'flex',
                                justifyContent: 'start',
                                alignContent: 'center',
                                height: '100%',
                                flexWrap: 'wrap',
                                marginLeft: '30px',
                                textAlign: 'left'
                            }}>
                            <Input
                                style={{ fontSize: '20px', width: '100%', fontWeight: 'bold' }}
                                value={title}
                                onChange={(value) => settitle(value)}
                            />

                            <p style={{ width: '90%', margin: '20px 0 5px 10px', fontWeight: '600' }}>Description</p>
                            <Input
                                componentClass="textarea"
                                rows={15}
                                style={{ fontSize: '15px', background: '#f5f5f5' }}
                                value={description}
                                onChange={(value) => setdescription(value)}
                            />
                            <FlexboxGrid style={{ width: '100%' }}>
                                <FlexboxGrid.Item colspan={12}>
                                    <p style={{ width: '100%', margin: '40px 0 5px 15px', fontWeight: '600' }}>Assigned To</p>
                                    <div style={{ width: '100%' }}>
                                        <InputPicker
                                            data={props.collaborators.map(c => {
                                                return { "label": `${c.firstname} ${c.lastname}`, "value": c._id }
                                            })}
                                            placeholder="Assign To"
                                            style={{ padding: "5px 0", width: '50%', maxWidth: '310px', marginLeft: '12px' }}
                                            value={assignedTo}
                                            onChange={(value) => setassignedTo(value)}
                                        />
                                    </div>
                                    <p style={{ width: '100%', margin: '20px 0 5px 15px', fontWeight: '600' }}>Estimated Time</p>
                                    <div style={{ display: 'flex', marginLeft: '12px' }}>
                                        <InputNumber
                                            style={{ width: 150, marginRight: 10 }}
                                            postfix="Hour(s)"
                                            min={0}
                                            max={50}
                                            value={estimatedHours ?? 0}
                                            onChange={(val) => setestimatedHours(val)}
                                        />
                                        <InputNumber
                                            postfix="Minute(s)"
                                            style={{ width: 150 }}
                                            min={0}
                                            max={59}
                                            value={estimatedMinutes ?? 0}
                                            onChange={(val) => setestimatedMinutes(val)}
                                        />
                                    </div>

                                    <p style={{ width: '100%', margin: '20px 0 5px 15px', fontWeight: '600' }}>Time Spent</p>
                                    <div style={{ display: 'flex', marginLeft: '12px' }}>
                                        <InputNumber
                                            style={{ width: 150, marginRight: 10 }}
                                            postfix="Hour(s)"
                                            min={0}
                                            max={50}
                                            value={timeSpentHours ?? 0}
                                            onChange={(val) => settimeSpentHours(val)}
                                        />
                                        <InputNumber
                                            postfix="Minute(s)"
                                            style={{ width: 150 }}
                                            min={0}
                                            max={59}
                                            value={timeSpentMinuts ?? 0}
                                            onChange={(val) => settimeSpentMinuts(val)}
                                        />
                                    </div>

                                    <p style={{ width: '100%', margin: '20px 0 5px 15px', fontWeight: '600' }}>Move to Backlog</p>
                                    <Toggle
                                        style={{ margin: "0 12px" }}
                                        checkedChildren={<Icon icon="check" />}
                                        unCheckedChildren={<Icon icon="close" />}
                                        value={moveToBacklog}
                                        onChange={(val) => setmoveToBacklog(val)}
                                    />
                                </FlexboxGrid.Item>

                                <FlexboxGrid.Item
                                    colspan={12}
                                    style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}
                                >
                                    <Timeline endless style={{ margin: '40px 0px 0 30px', maxHeight: '300px', overflowY: 'auto' }}>
                                        {history.map((h, i) => {
                                            return <Timeline.Item key={i} style={{ width: '90%' }}>{h}</Timeline.Item>
                                        })}
                                    </Timeline>
                                </FlexboxGrid.Item>
                            </FlexboxGrid>

                            <div style={{ width: '100%', marginTop: '50px', display: 'flex', justifyContent: 'space-evenly' }}>
                                <Button
                                    appearance="primary"
                                    style={{ width: '250px' }}
                                    onClick={() => updateUserStory()}
                                >
                                    Update User Story
                                </Button>
                                <Button
                                    appearance="default"
                                    style={{ width: '250px', background: '#e6e6e6' }}
                                    onClick={() => setshowModal(true)}
                                >
                                    Create Subtask
                                </Button>
                            </div>
                        </div>
                    }
                </Drawer.Body>
            </Drawer>

            <Modal
                show={showModal}
                overflowY={false}
                onHide={() => setshowModal(false)}
            >
                <Modal.Header>
                    <Modal.Title>Create Subtask</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <SubTaskForm
                        project_id={props.project_id}
                        acitveSprint={props.sprint}
                        collaborators={props.collaborators}
                        parentId={selectedUserStory?._id}
                        close={() => {
                            setshowModal(false);
                            getUserStories();
                        }}
                    />
                </Modal.Body>
            </Modal>
        </div>
    );
}

export default withRouter(Sprint);
