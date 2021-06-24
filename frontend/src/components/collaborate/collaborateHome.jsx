import React, { useState, useEffect } from 'react';
import io from "socket.io-client";
import Navbar from '../Navbar';
import './collaborate.css';
import CollaborateSection1 from "./collaborateSection1";
import CollaborateSection2 from "./collaborateSection2";
import CollaborateSection3 from "./collaborateSection3";

function CollaborateHome() {
    const [socket, setsocket] = useState(null);
    const [selectedChatGroup, setselectedChatGroup] = useState(null);
    const [chatHistory, setchatHistory] = useState([]);

    useEffect(() => {
        serverConnect();
    }, []);

    const changeChatGroup = (chatGroup) => {
        socket.emit("getChatHistory", { "id": chatGroup._id });
        setselectedChatGroup(chatGroup);
    }

    const receiveChatHistory = ({ messages }) => {
        setchatHistory(messages);
    };

    const serverConnect = () => {
        try {
            const socket = io.connect(process.env.REACT_APP_SOCKET, {
                forceNew: true,
                transports: ["websocket"],
            });
            //const socket = io.connect();
            socket.on("receiveChatHistory", receiveChatHistory);
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
                    <CollaborateSection1
                        selectedChatGroup={selectedChatGroup}
                        selectChatGroup={changeChatGroup}
                    />
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
