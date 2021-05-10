import Homeimg from "../assets/loginPage.svg";
import "../App.css";
import {
    Button, Form, FormGroup, FormControl, ControlLabel, Schema, Notification
} from 'rsuite';
import { useReducer } from 'react';
import { withRouter } from 'react-router-dom'
const { StringType } = Schema.Types;


//data validation for login
const loginModel = Schema.Model({
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
                sessionStorage.setItem('sprintCompassUserRole', data.userRole);

                const { from } = props.location.state || { from: { pathname: '/projects' } }
                if (data.firstLogin || !data.validGitToken) {
                    window.open("/auth", '_self');
                }
                else {
                    window.open(from.pathname, '_self');
                }
            }
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
                            </Form>
                        }
                    </div>
                </div>
            </div>
        </div>
    );
}

export default withRouter(Login);
