import React, { useState } from 'react'
import { InputNumber, Button, Form, InputPicker, Schema, FormGroup, ControlLabel, FormControl, Notification } from 'rsuite';
import utils from "../../utility/utils";

export default function SubTaskForm(props) {

    const [selectedCollaborator, setselectedCollaborator] = useState(null);
    const [estimatedHours, setestimatedHours] = useState(1);
    const [estimatedMinutes, setestimatedMinutes] = useState(0);
    const [title, settitle] = useState("");
    const [description, setdescription] = useState("");

    let createUserStory = async (status) => {
        if (status) {
      
            let body = {
                'title': title,
                'description': description,
                'assigned_to': selectedCollaborator,
                'estimated_time': `${estimatedHours},${estimatedMinutes}`,
                'project_id': props.project_id,
                'sprint_id': props.acitveSprint._id,
                'parent_task': props.parentId
            };

            let message = 'Subtask Has Been Created';

            const response = await utils.POST_DATA('api/userstories',body,message);

            if (response.status === 200) {
                //clear the fields
                setselectedCollaborator(null);
                setestimatedHours(1);
                setestimatedMinutes(0);
                settitle("");
                setdescription("");

                props.close();
            }
        }
    }

    return (
        <Form
            className="loginForm"
            model={loginModel}
            style={{ margin: 'auto' }}
            onSubmit={(status) => { createUserStory(status) }}
        >
            <TextField
                name="title"
                label="Title"
                value={title}
                onChange={(value) => settitle(value)}
            />
            <TextField
                name="description"
                label="Description"
                value={description}
                onChange={(value) => setdescription(value)}
            />
            <label className="rs-control-label">Assign To </label>
            <InputPicker
                data={props.collaborators.map(c => {
                    return { "label": `${c.firstname} ${c.lastname}`, "value": c._id }
                })}
                placeholder="Assign To"
                style={{ width: 400 }}
                value={selectedCollaborator}
                onChange={(value) => setselectedCollaborator(value)}
            />
            <label
                style={{ margin: "25px 0 5px" }}
                className="rs-control-label" >
                Estimated Time
            </label>
            <div style={{ display: 'flex', marginBottom: 30 }}>
                <InputNumber
                    style={{ width: 250, marginRight: 10 }}
                    postfix="Hour(s)"
                    min={0}
                    max={50}
                    value={estimatedHours}
                    onChange={(val) => setestimatedHours(val)}
                />
                <InputNumber
                    postfix="Minute(s)"
                    style={{ width: 250 }}
                    min={0}
                    max={59}
                    value={estimatedMinutes}
                    onChange={(val) => setestimatedMinutes(val)}
                />
            </div>

            <Button
                type="submit"
                style={{ width: '100%', background: "#134069", color: '#f5f5f5' }}
                disabled={title === "" || description === ""}
            >
                Submit
        </Button>
        </Form>
    )
}

const { StringType } = Schema.Types;

//data validation for create user story
const loginModel = Schema.Model({
    title: StringType().isRequired('Title is required.'),
    description: StringType().isRequired('Description is required.')
});

function TextField(props) {
    const { name, label, accepter, type, ...rest } = props;
    return (
        <FormGroup>
            <ControlLabel>{label} </ControlLabel>
            <FormControl name={name} type={type} accepter={accepter} {...rest} />
        </FormGroup>
    );
}

