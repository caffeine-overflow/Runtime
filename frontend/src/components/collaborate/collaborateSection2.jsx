import React, { useState } from 'react';
import InfiniteScroll from "react-infinite-scroll-component";
import { Input, Icon, IconButton, ButtonToolbar } from 'rsuite';
import chatSvg from '../../assets/chat.svg';
const CURRENT_USER = sessionStorage.getItem('sprintCompassUser');

function CollaborateSection2(props) {
    const [message, setmessage] = useState("");

    let fetchMoreData = () => {
        // setTimeout(() => {
        //     setitems(items.concat(Array.from({ length: 20 })))
        // }, 1500);
    };

    let sendMessage = () => {
        props.socket.emit("sendMessage", {
            "author": CURRENT_USER,
            "group_id": props.selectedChatGroup._id,
            "content": message
        });
        setmessage("");
    }

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
                            <section
                                className="scrollable"
                                id="scrollableDiv"
                                style={{
                                    height: '87%',
                                    overflow: 'auto',
                                    display: 'flex',
                                    flexDirection: 'column-reverse'
                                }}
                            >
                                {/*Put the scroll bar always on the bottom*/}
                                <InfiniteScroll
                                    dataLength={props.chatHistory.length}
                                    next={fetchMoreData}
                                    style={{ display: 'flex', flexDirection: 'column-reverse' }} //To put endMessage and loader to the top.
                                    inverse={true}
                                    hasMore={false}
                                    loader={<h5>Loading...</h5>}
                                    scrollableTarget="scrollableDiv"
                                >
                                    {props.chatHistory.map((ch, i) => (
                                        <MessageComponent
                                            key={i}
                                            message={ch}
                                        />
                                    ))}
                                </InfiniteScroll>
                            </section>
                            <section className="chat__send">
                                <Input
                                    placeholder="Enter your message here"
                                    value={message}
                                    onChange={(val, e) => {
                                        setmessage(val)
                                    }}
                                    onPressEnter={() => sendMessage()}
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
                                        onClick={() => sendMessage()}
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

function MessageComponent({ message }) {
    let { author, content } = message;
    let isAuthor = author._id === CURRENT_USER;
    return (
        <section
            className="msg__component"
            style={{ flexDirection: isAuthor ? 'row-reverse' : 'row' }}
        >
            <div>
                <img
                    src={author.git_avatar}
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