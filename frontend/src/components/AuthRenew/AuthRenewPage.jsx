/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from 'react';
import PasswordRenewSvg from '../../assets/passwordRenew.svg';
import BioSvg from '../../assets/bio.svg';
import Gitsvg from '../../assets/git.svg';
import OrganizationSvg from '../../assets/organization.svg';
import './authrenew.css';
import util from "../../utility/utils";
import {
    Form, FormControl, FormGroup, ControlLabel, Schema,
    Notification, Steps, Panel, Button, InputPicker, Message
} from 'rsuite';

const { StringType } = Schema.Types;


export default function AuthRenewPage(props) {

    const [user, setuser] = useState(null);

    const [currentPassord, setcurrentPassord] = useState("");
    const [newpassword, setnewpassword] = useState("");
    const [confirmPassword, setconfirmPassword] = useState("");

    const [position, setPosition] = useState('');
    const [phone, setphone] = useState('');
    const [location, setlocation] = useState('');

    const [authenticating, setAuthenticating] = useState(false);

    const [step, setStep] = useState();
    const [loading, setloading] = useState(false);

    const [organizations, setorganizations] = useState([]);
    const [companyName, setcompanyName] = useState("");
    const [gitOrganization, setgitOrganization] = useState(null);

    const getUserData = async () => {
        let response = await util.FETCH_DATA(`api/users/getUserById/${sessionStorage.getItem('sprintCompassUser')}`);
        if (response.status === 200) {
            let user = response.data.user;
            if (!!user.first_login) setStep(0);
            else if (!!user.git_token) setStep(3);
            else {
                console.log(user);
                setStep(2);
            }
            setuser(response.data.user);
        }
    };

    const changePassword = async (status) => {
        if (status) {
            setloading(true);
            let message = "Password Has Been Updated";
            let body = { old_password: currentPassord, new_password: newpassword };
            let response = await util.UPDATE_DATA(`api/users/update_password`, body, message);
            if (response.status === 200) {
                setStep(1);
            }
            setloading(false);
        }
    }

    const updateUserData = async () => {
        if (position === "" && phone === "" && location === "") {
            setStep(2);
            return;
        }
        let message = "Profile Has Been Updated";
        let body = { position, phone, location };
        let response = await util.UPDATE_DATA(`api/users/update_user`, body, message);
        if (response.status === 200) {
            setStep(2);
        }
    }

    const getQueryVariable = (variable) => {
        var query = window.location.search.substring(1);
        var vars = query.split("&");
        for (var i = 0; i < vars.length; i++) {
            var pair = vars[i].split("=");
            if (pair[0] === variable) {
                return pair[1];
            }
        }
        return false;
    };

    const checkAuthorization = async () => {
        if (getQueryVariable("error") === "access_denied") {
            Notification.error({
                title: `Authorization Failed`,
                description: <div style={{ width: 220 }} rows={3} />,
                placement: "topEnd",
            });
        }
        let code = getQueryVariable("code");
        if (code) {
            const response = await util.FETCH_DATA(`gitauth/get_token?code=${code}`, "Successfully authorized github");
            if (response.status === 200) {
                setStep(3);

                //remove code from the url withour reloading
                let newUrl = window.location.origin + '/auth';
                window.history.pushState({}, null, newUrl);
            }
        }
    };

    let getOrganizations = async () => {
        const response = await util.FETCH_DATA(`api/git/getOrganizations`, "No Notification");
        setorganizations(response.data.organizations);
    }

    let validateInvite = async () => {
        const response = await util.FETCH_DATA(`gitauth/validateInvite`, "Congratulations!");
        if (response.status === 200) {
            props.history.push('/projects');
        }
    }

    let submitOrganization = async () => {
        if (!companyName || !gitOrganization) {
            Notification.error({
                title: "Missing Fields",
                description: <div style={{ width: 220 }} rows={3} />,
                placement: "topEnd",
            });
            return;
        }

        let body = { name: companyName, organization: gitOrganization };
        let response = await util.POST_DATA(`api/users/addClient`, body);

        if (response.status === 200) {
            props.history.push('/projects');
        }
    }

    useEffect(() => {
        if (step === 3 && user?.role === 'owner' && organizations.length === 0) {
            getOrganizations();
        }
    }, [step, user]);

    useEffect(() => {
        checkAuthorization();
        getUserData();
    }, [])


    const authorize = () => {
        setAuthenticating(true);
        let url = `https://github.com/login/oauth/authorize?client_id=${process.env.REACT_APP_CLIENT_ID}&scope=admin:org%20repo`;
        window.open(url, "_self");
    }

    return (
        <div style={{ width: '80%', margin: 'auto', height: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <div style={{ width: '100%', height: '80vh' }}>
                <Steps current={step}>
                    <Steps.Item title="Change Password" />
                    <Steps.Item title="Update Bio" />
                    <Steps.Item title="Authorize Github" />
                    {
                        user && user.role === 'owner' ?
                            <Steps.Item title="Choose Organization" /> :
                            <Steps.Item title="Accept Organization Invite" />
                    }
                </Steps>
                <hr />
                <Panel style={{ height: '60vh' }} >
                    <section style={{ display: 'flex', height: '60vh' }}>
                        <div style={{ width: '50%', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                            {
                                step === 0 &&
                                <img style={{ maxWidth: '550px' }} src={PasswordRenewSvg} alt="passwordrenewimg" />
                            }
                            {
                                step === 1 &&
                                <img style={{ maxWidth: '550px' }} src={BioSvg} alt="profileimg" />
                            }
                            {
                                step === 2 &&
                                <img style={{ maxWidth: '550px' }} src={Gitsvg} alt="gitimg" />
                            }
                            {
                                step === 3 &&
                                <img style={{ maxWidth: '550px' }} src={OrganizationSvg} alt="orgImg" />
                            }
                        </div>
                        <div style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                            {
                                step === 0 &&
                                <Form
                                    model={Schema.Model({
                                        currentPassword: StringType().isRequired(`Current Password is required.`),
                                        newPassword: StringType()
                                            .addRule((value) => {
                                                if (value.length < 8)
                                                    return false;
                                                return true;
                                            }, 'Password must be atleast 8 characters long')
                                            .isRequired(`New Password is required.`),
                                        confirmPassword: StringType()
                                            .addRule((value) => {
                                                if (value !== newpassword)
                                                    return false;
                                                return true;
                                            }, 'The two passwords do not match')
                                            .isRequired('This field is required.')
                                    })}
                                    onSubmit={(status) => { changePassword(status) }}
                                >
                                    <TextField
                                        type="password"
                                        name='currentPassword'
                                        label='Current Password'
                                        onChange={(value) => {
                                            setcurrentPassord(value);
                                        }}
                                    />
                                    <TextField
                                        type="password"
                                        name='newPassword'
                                        label='New Password'
                                        onChange={(value) => {
                                            setnewpassword(value);
                                        }}
                                    />
                                    <TextField
                                        type="password"
                                        name='confirmPassword'
                                        label='Confirm Password'
                                        onChange={(value) => {
                                            setconfirmPassword(value);
                                        }}
                                    />
                                    <Button
                                        type="submit"
                                        style={styles.update__button}
                                        disabled={loading}
                                    >
                                        Update Password
                                    </Button>
                                </Form>
                            }
                            {
                                step === 1 && !!user &&
                                <div>
                                    <Form
                                        onSubmit={() => updateUserData()}
                                    >
                                        <TextField
                                            label='Job Title'
                                            onChange={(value) => {
                                                setPosition(value);
                                            }}
                                        />
                                        <TextField
                                            label='Phone'
                                            onChange={(value) => {
                                                setphone(value);
                                            }}
                                        />
                                        <TextField
                                            label='Location'
                                            onChange={(value) => {
                                                setlocation(value);
                                            }}
                                        />
                                        <Button
                                            type="submit"
                                            style={styles.update__button}
                                        >
                                            Update Bio
                                        </Button>
                                    </Form>
                                </div>
                            }
                            {
                                step === 2 &&
                                <Button
                                    type="submit"
                                    style={authenticating ? styles.disabled__button : styles.update__button}
                                    onClick={authorize}
                                    disabled={authenticating}
                                >
                                    Authorize Github
                                </Button>
                            }
                            {
                                step === 3 &&
                                <>
                                    {
                                        user && user.role === 'owner' &&
                                        <div>
                                            <Form
                                                onSubmit={() => submitOrganization()}
                                            >
                                                <TextField
                                                    label='Organization Name'
                                                    onChange={(value) => {
                                                        setcompanyName(value);
                                                    }}
                                                />
                                                <InputPicker
                                                    data={organizations}
                                                    onChange={(value) => setgitOrganization(value)}
                                                    block
                                                    placeholder="Select a Github Organization"
                                                />
                                                <Button
                                                    type="submit"
                                                    style={styles.update__button}
                                                >
                                                    Submit
                                                </Button>
                                            </Form>
                                        </div>
                                    }
                                    {
                                        user && user.role !== 'owner' &&
                                        <Message
                                            showIcon
                                            type="success"
                                            title="Invitation Sent"
                                            description={
                                                <>
                                                    We have sent you an email invitation to join the organization.<br />
                                                    Please accept it and click finish.
                                                </>
                                            }
                                        />
                                    }
                                </>
                            }
                        </div>
                    </section>
                </Panel>
                <hr />
                <div style={{ float: 'right' }}>
                    {step === 3 && user?.role !== "owner" &&
                        <Button style={{ background: "#193A5A", color: "#f5f5f5", width: "100px" }} onClick={validateInvite}>
                            Finish
                        </Button>
                    }
                </div>

            </div>
        </div>
    )
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

const styles = {
    update__button: {
        marginTop: '50px',
        background: '#193A5A',
        color: '#f5f5f5',
        minWidth: '300px',
    },
    disabled__button: {
        marginTop: '50px',
        background: 'grey',
        color: '#f5f5f5',
        minWidth: '300px',
    },
    next__button: {
        background: '#193A5A',
        color: '#f5f5f5',
        float: 'right',
        minWidth: '100px'
    }
};
