import React, { useState, useEffect } from 'react';
import Navbar from "./Navbar";
import { Icon, IconButton, Drawer, Button } from 'rsuite';
import ImageUploader from "react-images-upload";

export default function Profile(props) {
    const [picture, setPicture] = useState([]);
    const [editable, seteditable] = useState(false);
    const [changeAttribute, setChangeAttribute] = useState("");
    const [openDrawer, setopenDrawer] = useState(false);


    const onDrop = (picture, a) => {
        console.log(a[0]);
        setPicture([...picture, picture]);
    };

    useEffect(() => {
        let path = window.location.pathname.split('/');
        if (path.length > 2) {
            seteditable(false);
        }
        else {
            seteditable(true);
        }
    }, [])

    return (
        <div>
            <Navbar />
            <section style={styles.main}>
                <section style={styles.main__1}>
                    <img
                        style={styles.main__1__img}
                        src="https://images.unsplash.com/photo-1583512603805-3cc6b41f3edb?ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&ixlib=rb-1.2.1&auto=format&fit=crop&w=2000&q=80"
                        alt="dp"
                    />
                    {
                        editable &&
                        <div
                            style={styles.change__image}
                            onClick={() => {
                                setopenDrawer(true);
                                setChangeAttribute("Image");
                            }}
                        >
                            Change Image
                        </div>
                    }
                </section>
                <section style={styles.main__2}>
                    <div style={styles.name}>Danish Davis</div>
                    <div style={styles.profession}>Software Developer</div>
                    <section style={styles.info}>
                        <div style={styles.attribute__container}>
                            <Icon
                                size="2x"
                                icon="send"
                                style={styles.info__1}
                            />
                            <div style={styles.info__2}>
                                danishdavis@hotmail.com
                                {
                                    editable &&
                                    <span style={styles.change}>change</span>
                                }
                            </div>
                        </div>
                        <div style={styles.attribute__container}>
                            <Icon
                                size="2x"
                                icon="phone"
                                style={styles.info__1}
                            />
                            <div style={styles.info__2}>
                                226-700-9229
                                {
                                    editable &&
                                    <span style={styles.change}>change</span>
                                }
                            </div>
                        </div>
                        <div style={styles.attribute__container}>
                            <Icon
                                size="2x"
                                icon="map-marker"
                                style={styles.info__1}
                            />
                            <div style={styles.info__2}>
                                London, Ontario
                                {
                                    editable &&
                                    <span style={styles.change}>change</span>
                                }
                            </div>
                        </div>
                    </section>
                    {
                        editable &&
                        <div style={styles.update__password}>
                            Change Password
                        </div>
                    }
                    <IconButton
                        style={{ width: '250px', margin: '30px 0', background: '#134069', color: '#f5f5f5' }}
                        icon={<Icon style={{ background: '#486b8c', color: '#f5f5f5' }}
                            icon="send" />}
                        placement="left"
                    >
                        Send Message
                    </IconButton>
                </section>
            </section>

            <Drawer
                show={openDrawer}
                onHide={() => setopenDrawer(false)}
            >
                <Drawer.Header>
                    <Drawer.Title>Change {changeAttribute}</Drawer.Title>
                </Drawer.Header>
                <Drawer.Body style={styles.drawer__body}>
                    {
                        changeAttribute === "Image" &&
                        <ImageUploader
                            withIcon={true}
                            onChange={(a, b) => onDrop(a, b)}
                            imgExtension={[".jpg", ".png"]}
                            maxFileSize={5242880}
                            withPreview
                            buttonText="Choose Image"
                        />
                    }
                    <Button
                        style={styles.update__button}
                    >
                        Update {changeAttribute}
                    </Button>
                </Drawer.Body>
            </Drawer>
        </div>
    )
}

const styles = {
    main: {
        display: 'flex',
        height: '600px',
        width: '80%',
        maxWidth: '1400px',
        margin: '50px auto'
    },
    main__1: {
        width: '50%',
        margin: 'auto'
    },
    main__1__img: {
        maxHeight: '100%',
        maxWidth: '80%',
        display: 'block',
        margin: 'auto'
    },
    main__2: {
        flex: 1,
        marginLeft: '5%',
        display: 'flex',
        alignContent: 'center',
        flexWrap: 'wrap'
    },
    name: {
        fontSize: '25px',
        fontWeight: 'bold',
        width: '100%',
        margin: '5px 0'
    },
    profession: {
        fontSize: '15px'
    },
    info: {
        width: '100%',
        margin: '50px 0'
    },
    attribute__container: {
        display: 'flex',
        margin: '25px 0'
    },
    info__1: {
        width: '50px'
    },
    info__2: {
        flex: 1,
        fontSize: '17px'
    },
    change: {
        marginLeft: '5px',
        color: 'blue',
        textDecoration: 'underline',
        fontSize: '15px'
    },
    change__image: {
        color: 'blue',
        textDecoration: 'underline',
        fontSize: '15px',
        marginTop: '15px',
        textAlign: 'center',
        cursor: 'pointer'
    },
    update__password: {
        color: 'blue',
        textDecoration: 'underline',
        fontSize: '15px',
        width: '100%'
    },
    drawer__body: {
        display: 'flex',
        justifyContent: 'center',
        alignContent: 'center',
        flexWrap: 'wrap'
    },
    update__button: {
        marginTop: '50px',
        background: '#193A5A',
        color: '#f5f5f5',
        minWidth: '250px'
    }
}