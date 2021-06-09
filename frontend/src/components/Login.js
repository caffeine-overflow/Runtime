import Homeimg from "../assets/loginPage.svg";
import "../App.css";
import util from "../utility/utils";
import {
    Modal, Button, Form, FormGroup, FormControl, ControlLabel, Schema, Notification, Divider, Input
} from 'rsuite';
import { useReducer, useEffect } from 'react';
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
        resetEmail: "",
        show: false,
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

    const resetPassword = async () => {
        const emailRegex = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        let resetEmail = state.resetEmail.match(/.{1,29}/g);
        resetEmail = resetEmail.join(' ')
        if (!emailRegex.test(String(state.resetEmail).toLowerCase())) {
            Notification.error({
                title: `Invalid Email`,
                description: <div style={{ width: 220 }} rows={4}> <strong>{resetEmail}</strong> is not a valid email</div>,
                placement: 'topEnd'
            });
        }
        else {
            let response = await util.FETCH_DATA(`auth/reset_password/${state.resetEmail}`);
            console.log(response);
            if (response.status === 200) {
                Notification.success({
                    title: `Reset Email Sent`,
                    description: <div style={{ width: 220 }} rows={4}> A reset email has been sent to <br /><strong>{resetEmail}</strong>.</div>,
                    placement: 'topEnd'
                });
            }
        }

        setState({ show: false, resetEmail: "" })
    };

    useEffect(() => {
        
        let msg = util.getQueryVariable("msg");
        let error = util.getQueryVariable("error");
        let success = util.getQueryVariable("success");
        let newUrl = window.location.origin + '/login';
        window.history.pushState({}, null, newUrl);
        if(msg) msg = decodeURI(msg)
        if(error){
            Notification.error({
                title: msg ? msg : "Invalid Url",
                description: <div style={{ width: 220 }} rows={3} />,
                placement: "topEnd",
            });
        }
        else if(success){
            Notification.success({
                title: "Password Updated Successfully",
                description: <div style={{ width: 220 }} rows={3} />,
                placement: "topEnd",
            });
        }
    })
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
						<div
							style={{
								textAlign: "center",
								color: "blue",
								textDecoration: "underline",
								fontSize: "15px",
								cursor: "pointer",
								marginTop: 20,
								marginLeft: "30%",
								width: "29%",
							}}
							onClick={() => setState({ show: true })}
						>
							Forgot Password?
						</div>
					</div>
				</div>
			</div>
			<Modal backdrop={true} size="xs" show={state.show} onHide={() => setState({ show: false, resetEmail: "" })}>
				<Modal.Header >
                    <Modal.Title>Reset Your Password</Modal.Title>
                    <Divider style={{marginBottom:-10, marginTop:0}} />
				</Modal.Header>
				<Modal.Body>
					<p>Please enter your email to receive a password reset link.</p>
					<Input
						style={{ width: "90%", marginTop: 10 }}
						name="resetemail"
						value={state.resetEmail}
						onChange={(value) => setState({ resetEmail: value })}
					/>
				</Modal.Body>
				<Modal.Footer>
                    <Divider style={{marginBottom:-5, marginTop:0}} />
					<Button
						disabled={state.resetEmail?.trim() === ""}
						appearance="primary"
						style={{ marginLeft: "25%", width: "50%", marginTop: 10 }}
						onClick={() => resetPassword()}
					>
						Reset Password
					</Button>
					<Button onClick={() => setState({ show: false, resetEmail: "" })} appearance="subtle">
						Cancel
					</Button>
				</Modal.Footer>
			</Modal>
        </div>
    );
}

export default withRouter(Login);
