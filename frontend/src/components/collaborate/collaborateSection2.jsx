import React, { useEffect, useState } from 'react';
import io from "socket.io-client";
import { Input, Icon, IconButton, ButtonToolbar } from 'rsuite';
import chatSvg from '../../assets/chat.svg';
function CollaborateSection2(props) {
    const [msg, setMsg] = useState("");

    useEffect(() => {
        serverConnect();
    }, []);

    const serverConnect = () => {
        try {
            const socket = io.connect(process.env.REACT_APP_SOCKET, {
                forceNew: true,
                transports: ["websocket"],
            });
            socket.on("connect", () =>
                console.log(`Is this client is connected? - ${socket.connected}`)
            );
        } catch (err) {
            setMsg("client connection failed");
        }
    };
    return (
        <>
            {
                !props.selectedChatGroup ?
                    <>
                        <section className="chat__section">
                            <section className="chat__section__empty">
                                <div>
                                    <img src={chatSvg} alt="chatsvg" />
                                </div>
                            </section>
                        </section>
                    </> :
                    <>
                        <section className="chat__section">
                            <section className="chat__area">
                                <MessageComponent
                                    content="Hello Dan"
                                    isAuthor={true}
                                />
                                <MessageComponent
                                    content="Hello there, How are you?"
                                    isAuthor={false}
                                />
                                <MessageComponent
                                    content="Not bad, what are you up to?"
                                    isAuthor={true}
                                />
                                <MessageComponent
                                    content="Just watching footbal. How about you?"
                                    isAuthor={false}
                                />
                                <MessageComponent
                                    content="Doing home work, so boring"
                                    isAuthor={true}
                                />

                            </section>
                            <section className="chat__send">
                                <Input
                                    placeholder="Enter your message here"
                                    style={{ width: '80%', height: '45px', border: '1px solid #d4d4d4' }}
                                />
                                <ButtonToolbar>
                                    <IconButton
                                        style={{ width: "130px", height: '45px', background: '#134069', color: '#f5f5f5' }}
                                        icon={
                                            <Icon
                                                icon="send"
                                                style={{ height: '45px', background: '#134069', color: '#f5f5f5' }}
                                            />
                                        }
                                        placement="right"
                                    >
                                        Send
                                    </IconButton>
                                </ButtonToolbar>
                            </section>
                        </section>
                    </>
            }
        </>
    )
}

export default CollaborateSection2;

function MessageComponent({ content, isAuthor }) {
    return (
        <section
            className="msg__component"
            style={{ flexDirection: isAuthor ? 'row-reverse' : 'row' }}
        >
            <div>
                <img
                    src="https://avatars.githubusercontent.com/u/38032299?v=4"
                    alt="profilepic"
                />
            </div>
            <div
                className="msg"
                style={{
                    background: isAuthor ? '#134069' : '#FEFDFF',
                    color: isAuthor ? '#f5f5f5' : '#575757'
                }}
            >
                {content}
            </div>
        </section>
    )
}

