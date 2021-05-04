import React, { useState, useEffect } from 'react';
import PasswordRenewSvg from '../../assets/passwordRenew.svg';
import BioSvg from '../../assets/bio.svg';
import Gitsvg from '../../assets/git.svg';
import './authrenew.css';
import FETCH_DATA from "../../utility/utils";
import {
    Icon, Form, FormControl, Drawer,
    FormGroup, ControlLabel, Schema, Notification,
    Steps, Panel, Button
} from 'rsuite';

const { StringType } = Schema.Types;


export default function AuthRenewPage(props) {

    const [user, setuser] = useState(null);

    const [openDrawer, setopenDrawer] = useState(false);
    const [changeAttribute, setChangeAttribute] = useState('');

    const [currentPassord, setcurrentPassord] = useState("");
    const [newpassword, setnewpassword] = useState("");
    const [confirmPassword, setconfirmPassword] = useState("");


    const [authenticating, setAuthenticating] = React.useState(false);
    const [authorizedUser, setAuthorizedUser] = React.useState(false);

    const [step, setStep] = useState(0);
    const [loading, setloading] = useState(false);

    const getUserData = async () => {
        let response = await FETCH_DATA(`api/users/getUserById/${sessionStorage.getItem('sprintCompassUser')}`);
        if (response.status === 200) {
            setuser(response.data.user);
        }
    };

    const changePassword = async (status) => {
        if (status) {
            setloading(true);
            let token = sessionStorage.getItem('sprintCompassToken');
            const requestOptions = {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({
                    old_password: currentPassord,
                    new_password: newpassword
                })
            };

            let response = await fetch(`http://localhost:5000/api/users/update_password`, requestOptions);
            let message = await response.json();

            if (response.status === 200) {
                Notification.success({
                    title: `Password Has Been Updated`,
                    description: <div style={{ width: 220 }} rows={3} />,
                    placement: 'topEnd'
                });
                setStep(1);
            }
            else {
                Notification.error({
                    title: message.msg,
                    description: <div style={{ width: 220 }} rows={3} />,
                    placement: 'topEnd'
                });
            }
            setloading(false);
        }
    }

    const updateUserData = async (status) => {
        if (status) {
            setloading(true);
            setopenDrawer(false);
            let token = sessionStorage.getItem('sprintCompassToken');
            const requestOptions = {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({ [changeAttribute.toLowerCase()]: user[changeAttribute.toLowerCase()] })
            };

            const response = await fetch(`http://localhost:5000/api/users/update_user`, requestOptions);
            if (response.status === 200) {
                Notification.success({
                    title: `${changeAttribute} Has Been Updated`,
                    description: <div style={{ width: 220 }} rows={3} />,
                    placement: 'topEnd'
                });
            }
            else {
                Notification.error({
                    title: 'Server error, Try again later',
                    description: <div style={{ width: 220 }} rows={3} />,
                    placement: 'topEnd'
                });
            }

            setChangeAttribute(null);
            setloading(false);
        }
    }

    useEffect(() => {
        getUserData();
    }, [])

    const refresh = async () => {
        setAuthenticating(false);
        let response = await FETCH_DATA(`gitauth/authorized`);
        if (response.status === 200) {
            setAuthorizedUser(response.data.authorized);
            props.history.push('/projects');
        }
    }

    const authorize = () => {
        setAuthenticating(true);
        var parameters = "location=0,width=800,height=650";
        let url = `https://github.com/login/oauth/authorize?client_id=${process.env.REACT_APP_CLIENT_ID}&scope=repo&state=${sessionStorage.getItem('sprintCompassUser')}`;
        var win = window.open(url, "", parameters);
        var pollOAuth = window.setInterval(function () {
            try {
                if (win.closed) {
                    window.clearInterval(pollOAuth);
                    win.close();
                    refresh();
                }
                if (win.document.URL.indexOf("code") != -1) {
                    window.clearInterval(pollOAuth);
                    win.close();
                    refresh();
                }
            } catch (e) {
            }
        }, 100);
    }
    return (
        <div style={{ width: '80%', margin: 'auto', height: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <div style={{ width: '100%', height: '80vh' }}>
                <Steps current={step}>
                    <Steps.Item title="Change Password" description="Description" />
                    <Steps.Item title="Update Bio" description="Description" />
                    <Steps.Item title="Authorize Github" description="Description" />
                </Steps>
                <hr />
                <Panel style={{ height: '60vh' }} >
                    <section style={{ display: 'flex' }}>
                        <div style={{ width: '50%', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                            {
                                step === 0 &&
                                <img style={{ maxWidth: '550px' }} src={PasswordRenewSvg} alt="passwordrenewimg" />
                            }
                            {
                                step === 1 &&
                                <img style={{ maxWidth: '550px' }} src={BioSvg} alt="passwordrenewimg" />
                            }
                            {
                                step === 2 &&
                                <img style={{ maxWidth: '550px' }} src={Gitsvg} alt="passwordrenewimg" />
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
                                    <div style={styles.name}>
                                        {`${user.firstname} ${user.lastname}`}
                                    </div>
                                    <div style={styles.profession}>
                                        {user.position && `${user.position}`}
                                        <span
                                            style={styles.change}
                                            onClick={() => {
                                                setopenDrawer(true);
                                                setChangeAttribute('Position');
                                            }}
                                        >
                                            {user.position ? 'change' : 'Add Position'}
                                        </span>
                                    </div>
                                    <section style={styles.info}>
                                        <div style={styles.attribute__container}>
                                            <Icon size='2x' icon='send' style={styles.info__1} />
                                            <div style={styles.info__2}>
                                                {`${user.email}`}
                                                <span
                                                    style={styles.change}
                                                    onClick={() => {
                                                        setopenDrawer(true);
                                                        setChangeAttribute('Email');
                                                    }}
                                                >
                                                    change
                                                </span>
                                            </div>
                                        </div>
                                        <div style={styles.attribute__container}>
                                            {(user.phone) && <Icon size='2x' icon='phone' style={styles.info__1} />}
                                            <div style={styles.info__2}>
                                                {user.phone && `${user.phone}`}
                                                <span
                                                    style={styles.change}
                                                    onClick={() => {
                                                        setopenDrawer(true);
                                                        setChangeAttribute('Phone');
                                                    }}
                                                >
                                                    {user.phone ? 'change' : 'Add Phone Number'}{' '}
                                                </span>
                                            </div>
                                        </div>
                                        <div style={styles.attribute__container}>
                                            {(user.location) && <Icon size='2x' icon='map-marker' style={styles.info__1} />}
                                            <div style={styles.info__2}>
                                                {user.location && `${user.location}`}
                                                <span
                                                    style={styles.change}
                                                    onClick={() => {
                                                        setopenDrawer(true);
                                                        setChangeAttribute('Location');
                                                    }}
                                                >
                                                    {user.location ? 'change' : 'Add Location'}
                                                </span>
                                            </div>
                                        </div>
                                    </section>
                                </div>}
                            {
                                step === 2 &&
                                <Button
                                    type="submit"
                                    style={authenticating || authorizedUser ? styles.disabled__button : styles.update__button}
                                    onClick={authorize}
                                    disabled={authenticating || authorizedUser}
                                >
                                    Authorize Github
                                </Button>
                            }
                        </div>
                    </section>
                </Panel>
                <hr />
                {
                    step === 1 &&
                    <Button
                        style={styles.next__button}
                        onClick={() => setStep(2)}
                    >
                        Next
                    </Button>
                }
            </div>
            <Drawer show={openDrawer} onHide={() => setopenDrawer(false)}>
                <Drawer.Header>
                    <Drawer.Title>Add/Change {changeAttribute}</Drawer.Title>
                </Drawer.Header>
                <Drawer.Body style={styles.drawer__body}>
                    {
                        user && changeAttribute &&
                        <Form
                            model={Schema.Model({
                                [changeAttribute]: StringType().isRequired(`${changeAttribute} is required.`),
                            })}
                            onSubmit={(status) => { updateUserData(status) }}
                        >
                            <TextField
                                name={changeAttribute}
                                label={changeAttribute}
                                value={user[changeAttribute.toLowerCase()] ?? ""}
                                onChange={(value) => {
                                    let userTemp = JSON.parse(JSON.stringify(user));
                                    userTemp[changeAttribute.toLowerCase()] = value;
                                    setuser(userTemp);
                                }}
                            />
                            <Button
                                type="submit"
                                style={styles.update__button}
                                disabled={loading}
                            >
                                Update {changeAttribute}
                            </Button>
                        </Form>
                    }
                </Drawer.Body>
            </Drawer>
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
    name: {
        fontSize: '25px',
        fontWeight: 'bold',
        width: '100%',
        margin: '5px 0',
    },
    profession: {
        fontSize: '15px',
    },
    info: {
        width: '100%',
        margin: '50px 0',
    },
    attribute__container: {
        display: 'flex',
        margin: '25px 0',
    },
    info__1: {
        width: '50px',
    },
    info__2: {
        flex: 1,
        fontSize: '17px',
    },
    change: {
        marginLeft: '5px',
        color: 'blue',
        textDecoration: 'underline',
        fontSize: '15px',
        cursor: 'pointer'
    },
    change__image: {
        color: 'blue',
        textDecoration: 'underline',
        fontSize: '15px',
        marginTop: '15px',
        textAlign: 'center',
        cursor: 'pointer',
    },
    update__password: {
        color: 'blue',
        textDecoration: 'underline',
        fontSize: '15px',
        width: '100%',
        cursor: 'pointer'
    },
    drawer__body: {
        display: 'flex',
        justifyContent: 'center',
        alignContent: 'center',
        flexWrap: 'wrap',
    },
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
