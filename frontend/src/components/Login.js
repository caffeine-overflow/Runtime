import Homeimg from "../assets/loginPage.svg";
import "../App.css";
import {
    Grid, Row, Col, Drawer,
    Button, Form, FormGroup, FormControl, ControlLabel,
    ButtonToolbar, Schema, Notification, Tag
} from 'rsuite';
import { useReducer } from 'react';
import { withRouter } from 'react-router-dom'
const { StringType } = Schema.Types;


//data validation for login
const loginModel = Schema.Model({
    email: StringType().isRequired('Email is required.'),
    password: StringType().isRequired('Password is required.')
});

//data validation for register
const registerModel = Schema.Model({
    firstname: StringType().isRequired('First Name is required.'),
    lastname: StringType().isRequired('Last Name is required.'),
    email: StringType().isRequired('Email is required.'),
    password: StringType().isRequired('Password is required.')
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

function Login(props) {

    const initialState = {
        login: true,
        users: [],
        userLogin: "",
        userPass: "",
        firstname: "",
        lastname: ""
    };

    const reducer = (state, newState) => ({ ...state, ...newState });
    const [state, setState] = useReducer(reducer, initialState);

    const login = async (status) => {
        if (status) {
            const requestOptions = {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: state.userLogin, password: state.userPass })
            };
            const response = await fetch('http://localhost:5000/auth/login', requestOptions);
            const data = await response.json();
            if (response.status === 403) {
                Notification.error({
                    title: data.msg,
                    description: <div style={{ width: 220 }} rows={3} />,
                    placement: 'topEnd'
                });
            }
            else if (response.status === 200) {
                sessionStorage.setItem('sprintCompassToken', data.access_token);
                sessionStorage.setItem('sprintCompassUser', data.user);
                sessionStorage.setItem('sprintCompassUserName', data.name);
                const { from } = props.location.state || { from: { pathname: '/teams' } }
                window.open(from.pathname, '_self');
            }
        }
    };

    const register = async (status) => {
        if (status) {
            const requestOptions = {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    firstname: state.firstname, lastname: state.lastname, email: state.userLogin, password: state.userPass
                })
            };
            const response = await fetch('http://localhost:5000/auth/register', requestOptions);
            const data = await response.json();
            if (response.status === 201) {
                Notification.success({
                    title: "Successfully Created the Account",
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
            setState({ login: true, firstname: "", lastname: "", userLogin: "", userPass: "" });
        }
    };


    return (
        <div className="App">
            <div
                style={{
                    display: "flex",
                    justifyContent: "center",
                    height: "900px",
                    alignContent: "center",
                }}
            >
                <div
                    style={{
                        width: "50%",
                        height: "100%",
                        display: "flex",
                        justifyContent: "center",
                        alignItems: " center",
                    }}
                >
                    <img
                        style={{ width: "100%", maxWidth: "750px" }}
                        src={Homeimg}
                        alt="homeimg"
                    />
                </div>
                <div
                    style={{
                        width: "50%",
                        height: "100%",
                        display: "flex",
                        justifyContent: "center",
                        alignItems: " center",
                    }}
                >
                    <div style={{ width: "80%", maxWidth: "450px" }}>
                        <div
                            style={{
                                fontSize: "45px",
                                fontWeight: "bold",
                                lineHeight: "1.2",
                                marginBottom: "100px",
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
                        {
                            state.login &&
                            <Form
                                className="loginForm"
                                model={loginModel}
                                onSubmit={(status) => { login(status) }}
                            >
                                <TextField
                                    name="email"
                                    label="Email"
                                    onChange={(value) => setState({ userLogin: value })}
                                />
                                <TextField
                                    name="password"
                                    label="Password"
                                    type="password"
                                    onChange={(value) => setState({ userPass: value })}
                                />
                                <Button
                                    appearance="primary"
                                    type="submit"
                                    style={{ width: '100%' }}
                                >
                                    Sign In
                                </Button>
                                <div
                                    className="signOptionsLink"
                                    onClick={() => setState({ login: false })}
                                >
                                    Sign Up
                                </div>
                            </Form>
                        }

                        {
                            !state.login &&
                            <Form
                                className="loginForm"
                                model={registerModel}
                                onSubmit={(status) => { register(status) }}
                            >
                                <TextField
                                    name="firstname"
                                    label="First Name"
                                    onChange={(value) => setState({ firstname: value })}
                                />
                                <TextField
                                    name="lastname"
                                    label="Last Name"
                                    onChange={(value) => setState({ lastname: value })}
                                />
                                <TextField
                                    name="email"
                                    label="Email"
                                    onChange={(value) => setState({ userLogin: value })}
                                />
                                <TextField
                                    name="password"
                                    label="Password"
                                    type="password"
                                    onChange={(value) => setState({ userPass: value })}
                                />
                                <Button
                                    appearance="primary"
                                    type="submit"
                                    style={{ width: '100%' }}
                                >
                                    Sign Up
                                </Button>
                                <div
                                    className="signOptionsLink"
                                    onClick={() => setState({ login: true })}
                                >
                                    Sign In
                                </div>
                            </Form>
                        }
                    </div>
                </div>
            </div>
        </div>
    );
}

export default withRouter(Login);
