import React, { useState, useEffect } from 'react';
import Loader from "react-loader-spinner";
import utils from "../../utility/utils";
import {
    Drawer, Icon, InputNumber, Button, Toggle, Tag,
    Input, InputPicker, FlexboxGrid, Modal
} from 'rsuite';
import { withRouter } from 'react-router-dom';
import '../../App.css';
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import SubTaskForm from "./SubTaskForm";
import NotFound from "../NotFound";
import NoUserStories from "../../assets/noactivesprint.svg";
import Editor from "../utilitycomponents/Editor";
import UserStoryTab from "./UserStoryTab";

//four states of the stories, has to match the db
const STORY_STATES = ["To Do", "In Progress", "Testing", "Done"];
const STATE_COLORS = ["#01949A", "#2196F3", "#134069", "#4CAF50"];


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
    border: "1px solid #e6e6e6",
    cursor: 'pointer',
    boxShadow: "0 2px 5px #e6e6e6",
    // styles we need to apply on draggables
    ...draggableStyle
});

const getListStyle = (length) => ({
    padding: grid,
    width: 350,
    minHeight: length === 0 ? "100px" : "75vh",
    margin: "0 10px"
});

function Sprint(props) {

    const [state, setState] = useState(null);
    const [userStories, setuserStories] = useState([]);
    const [showdrawer, setshowdrawer] = useState(false);
    const [selectedUserStory, setselectedUserStory] = useState(null);

    const [identifier, setidentifier] = useState("");
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

    const [gitBranches, setgitBranches] = useState([]);

    function onDragEnd(result) {

        const { source, destination } = result;

        // dropped outside the list
        if (!destination) {
            return;
        }
        const sInd = +source.droppableId;
        const dInd = +destination.droppableId;

        if (sInd === dInd) {
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
        
        let body = { _id: id, state };
        const response = await utils.UPDATE_DATA(`api/userstories`, body);
        if (response.status === 200) getUserStories();
    }

    const getUserStories = async () => {
        const response = await utils.FETCH_DATA(`api/userstories/bySprint/${props.sprint._id}`);
        if (response.status === 200) {
            let data = response.data;
            generateTableCards(data.userstories)
            setuserStories(data.userstories);
            if (!!selectedUserStory) {
                setselectedUserStory(data.userstories.find(u => u._id === selectedUserStory._id));
            }
        }
    }

    const updateUserStory = async () => {
        let body = {};
        let est = {hours: estimatedHours, minutes: estimatedMinutes}
        let time = {hours: timeSpentHours, minutes: timeSpentMinuts}
        /*Checks if new estimate time is less than the original*/
        if (parseInt(estimatedHours) <= parseInt(selectedUserStory.estimated_time.split(',')[0])) {
            setestimatedHours(selectedUserStory.estimated_time.split(',')[0])
            est.hours = selectedUserStory.estimated_time.split(',')[0]
            if (parseInt(estimatedMinutes) <= parseInt(selectedUserStory.estimated_time.split(',')[1])) {
                setestimatedMinutes(selectedUserStory.estimated_time.split(',')[1])
                est.minutes = selectedUserStory.estimated_time.split(',')[1]
            }
        }

        /*Checks if new time spent is less than the original*/
        if (parseInt(timeSpentHours) <= parseInt(selectedUserStory.time_spent?.split(',')[0])) {
            settimeSpentHours(selectedUserStory.time_spent?.split(',')[0])
            time.hours = selectedUserStory.time_spent?.split(',')[0]
            if (parseInt(timeSpentMinuts) <= parseInt(selectedUserStory.time_spent?.split(',')[1])) {
                settimeSpentMinuts(selectedUserStory.time_spent?.split(',')[1])
                time.minutes = selectedUserStory.time_spent?.split(',')[1]
            }
        }

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
        if (est.hours !== selectedUserStory.estimated_time.split(',')[0] ||
            est.minutes !== selectedUserStory.estimated_time.split(',')[1]
        ) {
            body['estimated_time'] = `${est.hours},${est.minutes}`;
        }

        //checking if timespent has changed
        if (time.hours !== selectedUserStory.time_spent?.split(',')[0] ||
            time.minutes !== selectedUserStory.time_spent?.split(',')[1]
        ) {
            if (time.hours !== "0" || time.minutes !== "0") {
                body['time_spent'] = `${time.hours},${time.minutes}`;
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
        let message = 'User Story Has Been Updated';
        let _body = body;

        await utils.UPDATE_DATA(`api/userstories`,_body,message);
        setshowdrawer(false);
        getUserStories();
    }

    let parseHistory = async (histories) => {

        let parsedHisotry = histories.map((history) => {
            let returnContent = '';
            if (history.attribute === "user_story") {
                returnContent = `Created the task`
            }
            else if (history.attribute === "description")
                returnContent = `Updated Description`
            else if (history.attribute === "state")
                returnContent = `Changed state from "${history.old_value}" to  "${history.new_value}"`

            else if (history.attribute === "title")
                returnContent = `Updated Title to  "${history.new_value}"`

            else if (history.attribute === "assigned_to") {
                let assigned_to = props.collaborators.find(element => element._id === history.new_value);
                returnContent = assigned_to ? `Changed Assiginee to ${assigned_to.firstname} ${assigned_to.lastname}` : `Unassigned`;
            }
            else if (history.attribute === "estimated_time")
                returnContent = `Re-estimated the task to be completed in ${history.new_value.split(',')[0]} hours and  ${history.new_value.split(',')[1]} minutes`

            else if (history.attribute === "time_spent")
                returnContent = `Increased the time stpent to ${history.new_value.split(',')[0]} hours and  ${history.new_value.split(',')[1]} minutes`

            else if (history.attribute === "state")
                returnContent = `Changed State from ${history.old_value} to ${history.new_value}`

            else if (history.attribute === "moveto_backlog")
                returnContent = `Moved task to backlog.`

            else if (history.attribute === "sprint_id")
                returnContent = `Moved task to sprint ${history.new_value}`

            let user = props.collaborators.find(element => element._id === history.updated_by);

            return { 'timestamp': history.timestamp, 'content': returnContent, 'user': `${user?.firstname} ${user?.lastname}` };
        })

        setHistory(parsedHisotry);
    }

    const getGitBranches = async () => {
        let response = await utils.FETCH_DATA(`api/git/getAllBranches/${props.project.repo}`);
        if (response.status === 200) {
            let data = response.data.branches.data;
            setgitBranches(data);
        }
    }

    useEffect(() => {
        getUserStories();
        getGitBranches();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <div>
            {
                !state ?
                    <div style={{ height: '80vh' }}>
                        <Loader
                            style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}
                            type="ThreeDots"
                            color="#134069"
                            height={50}
                            width={50}
                        />
                    </div>
                    : <div>
                        <div style={{ display: "flex", justifyContent: "center", margin: "100px 0 10px 0" }}>
                            <DragDropContext onDragEnd={onDragEnd}>
                                {state.map((el, ind) => (
                                    <Droppable key={ind} droppableId={`${ind}`}>
                                        {(provided, snapshot) => (
                                            <div
                                                ref={provided.innerRef}
                                                style={getListStyle(userStories.length)}
                                                {...provided.droppableProps}
                                            >
                                                <div
                                                    style={{
                                                        padding: '20px',
                                                        margin: '10px 0',
                                                        color: '#575757',
                                                        fontWeight: 'bold',
                                                        fontSize: '18px',
                                                        borderTop: `7px solid ${STATE_COLORS[ind]}`,
                                                        position: 'relative'
                                                    }}
                                                >
                                                    {
                                                        /*not a best practice, doing this for the looks */
                                                        ind === 0 &&
                                                        <div style={{ position: 'absolute', fontSize: '23px', fontWeight: '700', left: 0, top: -80 }}>
                                                            Sprint - {props.sprint.name}
                                                        </div>
                                                    }
                                                    {STORY_STATES[ind]}
                                                </div>
                                                {el.map((item, index) => (
                                                    <div key={index}>
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
                                                                        setidentifier(item.identifier);
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
                                                                                style={{ color: '#f5f5f5', fontWeight: '600', marginBottom: '10px', background: STATE_COLORS[ind] }}
                                                                            >
                                                                                {item.title}
                                                                            </Tag>

                                                                            <Tag style={{ fontWeight: '600', marginBottom: '10px', background: '#ececec' }}>
                                                                                {item.identifier}
                                                                            </Tag>
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
                        {
                            userStories.length === 0 &&
                            <NotFound
                                msg="No User Stories Found"
                                image={NoUserStories}
                                height="300px"
                            />
                        }
                    </div>
            }

            <Drawer
                show={showdrawer}
                onHide={() => {
                    setshowdrawer(false);
                    setselectedUserStory(null);
                }}
                style={{ width: '100%' }}
            >
                <Drawer.Header>
                </Drawer.Header>
                <Drawer.Body>
                    {
                        !!selectedUserStory &&
                        <div style={{ display: 'flex', height: '100%', justifyContent: 'space-between' }}>
                            <div
                                style={{
                                    width: '40%',
                                    display: 'flex',
                                    justifyContent: 'start',
                                    height: '100%',
                                    flexWrap: 'wrap',
                                    marginLeft: '30px',
                                    textAlign: 'left'
                                }}>
                                <div style={{ display: 'flex', alignItems: 'center', marginBottom: '20px', width: '100%' }}>
                                    <Icon icon="task" size="2x" />
                                    <h3 style={{ color: '#193A5A', marginLeft: '15px' }}>{identifier}</h3>
                                    <Button
                                        appearance="default"
                                        style={{ background: '#e6e6e6', marginLeft: 'auto' }}
                                        onClick={() => setshowModal(true)}
                                    >
                                        Create Subtask
                                    </Button>
                                </div>
                                <p style={{ width: '90%', margin: '20px 0 5px 10px', fontWeight: '600' }}>Title</p>
                                <Input
                                    style={{ fontSize: '20px', width: '100%', fontWeight: 'bold' }}
                                    value={title}
                                    onChange={(value) => settitle(value)}
                                />
                                <p style={{ width: '90%', margin: '20px 0 5px 10px', fontWeight: '600' }}>Description</p>
                                <Editor
                                    setText={(value) => setdescription(value)}
                                    value={description}
                                />
                                <FlexboxGrid style={{ width: '100%', marginTop: '50px' }}>
                                    <FlexboxGrid.Item colspan={12}>
                                        <p style={{ width: '100%', margin: '0 0 5px 15px', fontWeight: '600' }}>Assigned To</p>
                                        <div style={{ width: '100%' }}>
                                            <InputPicker
                                                data={props.collaborators.map(c => {
                                                    return { "label": `${c.firstname} ${c.lastname}`, "value": c._id }
                                                })}
                                                placeholder="Assign To"
                                                style={{ padding: "5px 0", maxWidth: '310px', marginLeft: '12px' }}
                                                value={assignedTo}
                                                onChange={(value) => setassignedTo(value)}
                                            />
                                        </div>
                                        <p style={{ width: '100%', margin: '20px 0 5px 15px', fontWeight: '600' }}>Github Branch</p>
                                        <div
                                            style={{ margin: "0 15px" }}
                                        >
                                            {selectedUserStory.git_branch}
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
                                    >
                                        <p style={{ width: '100%', margin: '0px 0 5px 15px', fontWeight: '600' }}>Estimated Time</p>
                                        <div style={{ display: 'flex', marginLeft: '12px' }}>
                                            <InputNumber
                                                style={{ width: 150, marginRight: 10 }}
                                                postfix="Hour(s)"
                                                min={parseInt(selectedUserStory.estimated_time?.split(',')[0])}
                                                max={50}
                                                value={estimatedHours ?? 0}
                                                onChange={(val) => setestimatedHours(val)}
                                            />
                                            <InputNumber
                                                postfix="Minute(s)"
                                                style={{ width: 150 }}
                                                min={parseInt(estimatedHours) <= parseInt(selectedUserStory.estimated_time?.split(',')[0]) ? parseInt(selectedUserStory.estimated_time?.split(',')[1]) : 0}
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
                                                min={parseInt(selectedUserStory.time_spent?.split(',')[0])}
                                                max={50}
                                                value={timeSpentHours ?? 0}
                                                onChange={(val) => settimeSpentHours(val)}
                                            />
                                            <InputNumber
                                                postfix="Minute(s)"
                                                style={{ width: 150 }}
                                                min={parseInt(timeSpentHours) <= parseInt(selectedUserStory.time_spent?.split(',')[0]) ? parseInt(selectedUserStory.time_spent?.split(',')[1]) : 0}
                                                max={59}
                                                value={timeSpentMinuts ?? 0}
                                                onChange={(val) => settimeSpentMinuts(val)}
                                            />
                                        </div>

                                    </FlexboxGrid.Item>
                                </FlexboxGrid>
                                <div style={{ height: '1px', width: '100%', background: '#e6e6e6', margin: '30px 0' }} />
                                <div style={{ width: '100%', display: 'flex', justifyContent: 'flex-end' }}>
                                    <Button
                                        appearance="primary"
                                        style={{ width: '250px' }}
                                        onClick={() => updateUserStory()}
                                    >
                                        Update User Story
                                    </Button>
                                </div>
                            </div>
                            <div style={{ width: '55%', borderLeft: '1px solid #e6e6e6' }}>
                                <UserStoryTab
                                    gitBranches={gitBranches}
                                    project={props.project}
                                    userStory={selectedUserStory}
                                    refresh={() => getUserStories()}
                                    history={history}
                                />
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
