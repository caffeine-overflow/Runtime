import React, { useState } from 'react';
import Navbar from "../Navbar";
import utils from "../../utility/utils"
import {
    Form, FormGroup, ControlLabel, Icon, Button, FormControl, Schema, Message
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
            let message = "Successfully Created the User";
            let body = {firstname, lastname, email};
            const response = await utils.POST_DATA('api/users/create', body, message);
            if (response.status === 200) {
                setfirstname('');
                setlastname('');
                setemail('');
            }else{
                setemail('');
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