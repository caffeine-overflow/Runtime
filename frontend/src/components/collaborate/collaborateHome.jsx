import React, { useState, useEffect, useRef } from 'react';
import io from "socket.io-client";
import Navbar from '../Navbar';
import './collaborate.css';
import Loader from "react-loader-spinner";
import CollaborateSection1 from "./collaborateSection1";
import CollaborateSection2 from "./collaborateSection2";
import CollaborateSection3 from "./collaborateSection3";

const CURRENT_USER = sessionStorage.getItem('sprintCompassUser');

function CollaborateHome() {
    const [currentuser, setcurrentuser] = useState(null);//*active user
    const [chatGroups, setchatGroups] = useState(null);//*all the chat groups for the user
    const [loading, setloading] = useState(true);
    const [socket, setsocket] = useState(null);
    const [selectedChatGroup, setselectedChatGroup] = useState(null);//*selected chat group from the availabel groups
    const [chatHistory, setchatHistory] = useState([]);//*array to hold the message history when selecting a chatgroup

    /*refValue holds the dynamic value of selectedchat group
     *why useRef
    /*socket will act as event listner. And it has access to the initial state only */
    const refValue = useRef(null);

    //*chat group change hook
    useEffect(() => {
        refValue.current = selectedChatGroup;//*assigning the current chatgroup to the refValue

        //*get the chat history of a chat group
        selectedChatGroup && socket.emit("getChatHistory", { "chatGroup": selectedChatGroup._id, 'user_id': CURRENT_USER });
    }, [selectedChatGroup]);

    useEffect(() => {
        serverConnect();
    }, []);

    const changeChatGroup = (chatGroup) => {
        setselectedChatGroup(chatGroup);
    }

    const serverConnect = () => {
        try {
            const socket = io.connect(process.env.REACT_APP_SOCKET, {
                forceNew: true,
                transports: ["websocket"],
            });
            //const socket = io.connect();

            //*get all the chat groups for the active user
            socket.emit("getChatGroups", { 'user_id': CURRENT_USER });

            //*socket handler to recive chatgroups
            socket.on("receiveChatGroup", ({ chatgroups, current_user }) => {
                setchatGroups(chatgroups);
                setcurrentuser(current_user);
                setloading(false);
            });

            //*socket handler to recieve chat history
            socket.on("receiveChatHistory", ({ chatGroupId, messages }) => {
                socket.emit("getChatGroups", { 'user_id': CURRENT_USER });//*doing this to show unread msg for the other user
                //*if user is in the same chat group. No need to show the messages if the user in a diffrent group
                if (refValue.current?._id === chatGroupId) {
                    setchatHistory(messages);
                    messages.length > 0 && socket.emit('msg_seen', { "chatGroup": chatGroupId, "user_id": CURRENT_USER })
                }
            });
            setsocket(socket);
        } catch (err) {
            console.log('socket error')
        }
    };
    return (
        <>
            <Navbar />
            <section className="collaborate__home">
                <section className='ch__1'>
                    {
                        loading ?
                            <section className="loader__section">
                                <Loader
                                    type="ThreeDots"
                                    color="#134069"
                                    height={50}
                                    width={50}
                                />
                            </section> :
                            <CollaborateSection1
                                chatGroups={chatGroups}
                                currentuser={currentuser}
                                selectedChatGroup={selectedChatGroup}
                                selectChatGroup={changeChatGroup}
                            />
                    }
                </section>
                <section className='ch__2'>
                    <CollaborateSection2
                        selectedChatGroup={selectedChatGroup}
                        chatHistory={chatHistory}
                        socket={socket}
                    />
                </section>
                <section className='ch__3'>
                    <CollaborateSection3 />
                </section>
            </section>
        </>
    )
}

export default CollaborateHome;
