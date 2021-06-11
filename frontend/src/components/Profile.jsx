import React, { useState, useEffect } from 'react';
import Navbar from './Navbar';
import {
    Icon, IconButton, Drawer, Button, Schema,
    Form, FormControl, FormGroup, ControlLabel, Notification
} from 'rsuite';
import ImageUploader from 'react-images-upload';
import Resizer from "react-image-file-resizer";
import Loader from "react-loader-spinner";
import ImagePlaceHolder from "../assets/imagePlaceHolder.svg";
import util from "../utility/utils";

const { StringType } = Schema.Types;

export default function Profile(props) {
    const [editable, seteditable] = useState(false);
    const [changeAttribute, setChangeAttribute] = useState('');
    const [openDrawer, setopenDrawer] = useState(false);
    const [loading, setloading] = useState(false);
    const [validImage, setvalidImage] = useState(false);

    const [id, setid] = useState(null);
    const [user, setuser] = useState(null);

    const [currentPassord, setcurrentPassord] = useState("");
    const [newpassword, setnewpassword] = useState("");
    const [confirmPassword, setconfirmPassword] = useState("");

    const resizeFile = (file) =>
        new Promise((resolve) => {
            Resizer.imageFileResizer(file, 800, 800, "JPEG", 100, 0,
                (uri) => {
                    resolve(uri);
                },
                "base64"
            );
        });

    const onDrop = async (picture) => {
        if (picture[0]) {
            const image = await resizeFile(picture[0]);
            let userTemp = JSON.parse(JSON.stringify(user));
            userTemp.image = image;
            setuser(userTemp);
            setvalidImage(true);
        }
    };

    const getUserData = async (id) => {
        let response = await util.FETCH_DATA(`api/users/getById/${id}`);
        if (response.status === 200) {
            setuser(response.data.user);
        }
    };

    const updateUserData = async (status) => {
        if (status) {
            setloading(true);
            setopenDrawer(false);
            let body = { [changeAttribute.toLowerCase()]: user[changeAttribute.toLowerCase()]}
            let message = `${changeAttribute} Has Been Updated`;
              await util.PUT_DATA(`api/users`, body,message);
              setChangeAttribute(null);
              getUserData(id);
              setloading(false);
              setvalidImage(false);
        }
    }
    
    const changePassword = async (status) => {
        if (status) {

        let message = `Password Has Been Updated`;
        let body ={
                    old_password: currentPassord,
                    new_password: newpassword
                }
            await util.PUT_DATA(`api/users/change_password`, body,message);
             
            setopenDrawer(false);
            setChangeAttribute(null);
            getUserData(id);
            setloading(false);
            setvalidImage(false);
        }
    }

    useEffect(() => {
        let path = window.location.pathname.split('/');
        let user_id = null;
        if (path.length > 2) {
            user_id = path[2];
            seteditable(false);
        } else {
            seteditable(true);
            user_id = sessionStorage.getItem('sprintCompassUser');
        }
        setid(user_id);
        getUserData(user_id);
    }, []);

    return (
        <div>
            <Navbar />
            {
                (!user || loading) &&
                <div style={{ height: '70vh' }}>
                    <Loader
                        style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}
                        type="ThreeDots"
                        color="#134069"
                        height={50}
                        width={50}
                    />
                </div>
            }
            {user && !loading &&
                <>
                    <section style={styles.main}>
                        <section style={styles.main__1}>
                            {
                                user.image ?
                                    <img
                                        style={styles.main__1__img}
                                        src={user.image}
                                        alt='dp'
                                    /> :
                                    <img
                                        style={{ maxWidth: '500px', display: 'block', margin: 'auto' }}
                                        src={ImagePlaceHolder}
                                        alt='dp'
                                    />
                            }
                            {editable && (
                                <div
                                    style={styles.change__image}
                                    onClick={() => {
                                        setopenDrawer(true);
                                        setChangeAttribute('Image');
                                    }}
                                >
                                    Change Image
                                </div>
                            )}
                        </section>
                        <section style={styles.main__2}>
                            <div style={styles.name}>
                                {`${user.firstname} ${user.lastname}`}
                            </div>
                            <div style={styles.profession}>
                                {user.position && `${user.position}`}
                                {editable && (
                                    <span
                                        style={styles.change}
                                        onClick={() => {
                                            setopenDrawer(true);
                                            setChangeAttribute('Position');
                                        }}
                                    >
                                        {user.position ? 'change' : 'Add Position'}
                                    </span>
                                )}
                            </div>
                            <section style={styles.info}>
                                <div style={styles.attribute__container}>
                                    <Icon size='2x' icon='send' style={styles.info__1} />
                                    <div style={styles.info__2}>
                                        {`${user.email}`}
                                        {editable &&
                                            <span
                                                style={styles.change}
                                                onClick={() => {
                                                    setopenDrawer(true);
                                                    setChangeAttribute('Email');
                                                }}
                                            >
                                                change
                                         </span>
                                        }
                                    </div>
                                </div>
                                <div style={styles.attribute__container}>
                                    {(user.phone || editable) && <Icon size='2x' icon='phone' style={styles.info__1} />}
                                    <div style={styles.info__2}>
                                        {user.phone && `${user.phone}`}
                                        {editable && (
                                            <span
                                                style={styles.change}
                                                onClick={() => {
                                                    setopenDrawer(true);
                                                    setChangeAttribute('Phone');
                                                }}
                                            >
                                                {user.phone ? 'change' : 'Add Phone Number'}{' '}
                                            </span>
                                        )}
                                    </div>
                                </div>
                                <div style={styles.attribute__container}>
                                    {(user.location || editable) && <Icon size='2x' icon='map-marker' style={styles.info__1} />}
                                    <div style={styles.info__2}>
                                        {user.location && `${user.location}`}
                                        {editable && (
                                            <span
                                                style={styles.change}
                                                onClick={() => {
                                                    setopenDrawer(true);
                                                    setChangeAttribute('Location');
                                                }}
                                            >
                                                {user.location ? 'change' : 'Add Location'}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </section>
                            {editable && (
                                <div
                                    style={styles.update__password}
                                    onClick={() => {
                                        setopenDrawer(true);
                                        setChangeAttribute('Password');
                                    }}
                                >
                                    Change Password
                                </div>
                            )}
                            <IconButton
                                style={{
                                    width: '250px',
                                    margin: '30px 0',
                                    background: '#134069',
                                    color: '#f5f5f5',
                                }}
                                icon={
                                    <Icon
                                        style={{ background: '#486b8c', color: '#f5f5f5' }}
                                        icon='send'
                                    />
                                }
                                placement='left'
                            >
                                Send Message
                            </IconButton>
                        </section>
                    </section>

                    <Drawer show={openDrawer} onHide={() => setopenDrawer(false)}>
                        <Drawer.Header>
                            <Drawer.Title>Add/Change {changeAttribute}</Drawer.Title>
                        </Drawer.Header>
                        <Drawer.Body style={styles.drawer__body}>
                            {
                                changeAttribute === 'Image' &&
                                <>
                                    <ImageUploader
                                        withIcon={true}
                                        onChange={(a, b) => onDrop(a, b)}
                                        imgExtension={['.jpg', '.png']}
                                        maxFileSize={2097152}
                                        buttonText='Choose Image'
                                        label="Maximum File Size: 2 mb, Accepted Formats: jpg, png"
                                    />
                                    <Button
                                        style={styles.update__button}
                                        disabled={loading || !validImage}
                                        onClick={() => {
                                            updateUserData(!!user.image)
                                        }}
                                    >
                                        Update {changeAttribute}
                                    </Button>
                                </>
                            }
                            {
                                (
                                    changeAttribute === 'Position' ||
                                    changeAttribute === 'Email' ||
                                    changeAttribute === 'Location' ||
                                    changeAttribute === 'Phone'
                                )
                                &&
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
                            {
                                changeAttribute === "Password" &&
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
                        </Drawer.Body>
                    </Drawer>
                </>
            }
        </div>
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

const styles = {
    main: {
        display: 'flex',
        height: '600px',
        width: '80%',
        maxWidth: '1400px',
        margin: '50px auto',
    },
    main__1: {
        width: '50%',
        margin: 'auto',
    },
    main__1__img: {
        maxHeight: '100%',
        maxWidth: '80%',
        display: 'block',
        margin: 'auto',
    },
    main__2: {
        flex: 1,
        marginLeft: '5%',
        display: 'flex',
        alignContent: 'center',
        flexWrap: 'wrap',
    },
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
};
