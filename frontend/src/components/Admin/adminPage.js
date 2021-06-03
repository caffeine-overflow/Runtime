import React, { useState } from 'react';
import Navbar from "../Navbar";
import {
    Form, FormGroup, ControlLabel, Icon, Button, FormControl, Schema, Message, Notification
} from 'rsuite';
import './adminPage.css';
import UsersTable from './UsersTable';
import AdminSvg from '../../assets/admin.svg';

const { StringType } = Schema.Types;
const adminFunctions = [
    { key: 1, name: 'Create User', icon: 'user-plus' },
    { key: 3, name: 'Manage Users', icon: 'setting' },
    { key: 4, name: 'App Settings', icon: 'laptop' },
    { key: 5, name: 'Github Settings', icon: 'github' },
    { key: 6, name: 'Reports', icon: 'file-text-o' },
    { key: 7, name: 'Data Management', icon: 'database' }
];

export default function AdminPage() {
    const [activeKey, setactiveKey] = useState(0);
    return (
        <div>
            <Navbar />
            <section className="adminContainer">
                <section className="adminContainer__1">
                    {
                        adminFunctions.map(f => {
                            return <FunctionCard
                                key={f.key}
                                function={f}
                                active={f.key === activeKey}
                                makeActiveKey={() => setactiveKey(f.key)}
                            />
                        })
                    }
                </section>
                <section className="adminContainer__2">
                    {
                        activeKey === 0 &&
                        <section className="adminHome">
                            <img src={AdminSvg} alt="adminSvg" />
                        </section>
                    }
                    {
                        activeKey === 1 &&
                        <section className="functionContainer">
                            <div>
                                <img src={AdminSvg} alt="adminSvg" />
                            </div>
                            <div>
                                <AddUserCard />
                            </div>
                        </section>
                    }
                    {
                        activeKey === 3 &&
                        <div>
                            <UsersTable />
                        </div>
                    }
                </section>
            </section>
        </div>
    )
}


let FunctionCard = (props) => {
    return (
        <section
            className="functionCard"
            onClick={props.makeActiveKey}
            style={{ color: props.active ? '#134069' : '' }}
        >
            <div>
                <Icon icon={props.function.icon} size='2x' />
            </div>
            <div style={{ fontWeight: props.active ? 700 : 500 }}>
                {props.function.name}
            </div>
        </section>
    )
}

let AddUserCard = () => {
    const [firstname, setfirstname] = useState("");
    const [lastname, setlastname] = useState("");
    const [email, setemail] = useState("");

    const addUser = async (status) => {
        if (status) {
            console.log(status)
            let token = sessionStorage.getItem('sprintCompassToken');
            const requestOptions = {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({
                    firstname, lastname, email
                })
            };
            const response = await fetch('http://localhost:5000/api/users/create', requestOptions);
            const data = await response.json();

            if (response.ok) {
                setfirstname('');
                setlastname('');
                setemail('');

                Notification.success({
                    title: "Successfully Created the User",
                    description: <div style={{ width: 220 }} rows={3} />,
                    placement: 'topEnd'
                });
            }
            else {
                Notification.error({
                    title: data.msg,
                    description: <div style={{ width: 220 }} rows={3} />,
                    placement: 'topEnd'
                });
            }
        }
    };

    return (
        <Form
            className="addUserForm"
            model={registerModel}
            onSubmit={(status) => { addUser(status) }}
        >
            <TextField
                name="firstname"
                label="First Name"
                value={firstname}
                onChange={(value) => setfirstname(value)}
            />
            <TextField
                name="lastname"
                label="Last Name"
                value={lastname}
                onChange={(value) => setlastname(value)}
            />
            <TextField
                name="email"
                label="Email"
                value={email}
                onChange={(value) => setemail(value)}
            />
            <Message
                showIcon
                type="info"
                title="Did you know?"
                description="The new user will get an email with the temperory password"
            />
            <Button
                appearance="primary"
                type="submit"
                style={{ width: '100%', marginTop: '20px' }}
                disabled={!firstname || !lastname || !email}
            >
                Create User
            </Button>
        </Form>
    );
}

function TextField(props) {
    const { name, label, accepter, type, ...rest } = props;
    return (
        <FormGroup>
            <ControlLabel>{label} </ControlLabel>
            <FormControl name={name} type={type} accepter={accepter} {...rest} />
        </FormGroup>
    );
}

//data validation for add user
const registerModel = Schema.Model({
    firstname: StringType().isRequired('First Name is required.'),
    lastname: StringType().isRequired('Last Name is required.'),
    email: StringType().isEmail('Please enter a valid email address.').isRequired('Email is required.'),
});