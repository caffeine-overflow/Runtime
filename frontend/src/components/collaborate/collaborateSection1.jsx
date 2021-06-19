import React, { useState, useEffect } from 'react';
import utils from "../../utility/utils";
import Loader from "react-loader-spinner";

const CURRENT_USER = sessionStorage.getItem('sprintCompassUser');

function CollaborateSection1(props) {

    const [currentuser, setcurrentuser] = useState(null);
    const [chatGroups, setchatGroups] = useState(null);
    const [loading, setloading] = useState(true);

    useEffect(() => {
        getData();
    }, []);

    const getData = async () => {
        let response = await utils.FETCH_DATA(`api/collaborate/getAll`);
        setchatGroups(response.data.chatgroups);
        response = await utils.FETCH_DATA(`api/users/getById/${CURRENT_USER}`);
        setcurrentuser(response.data.user);
        setloading(false);
    }

    return (
        <>
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
                    <>
                        <section className="ch__profile">
                            <div>
                                <img
                                    src={currentuser.git_avatar}
                                    alt="profilepic"
                                />
                            </div>
                            <div>
                                <div style={{ fontSize: 20, fontWeight: 'bold', marginBottom: 5 }}>
                                    {`${currentuser.firstname}  ${currentuser.lastname}`}
                                </div>
                                <div>{currentuser.position}</div>
                            </div>
                        </section>
                        <section className="ch__list">
                            <div style={{ fontSize: 17, fontWeight: 'bold', margin: '30px 0', textAlign: 'center' }}>
                                Active Conversations
                            </div>
                            {
                                chatGroups.map((cg, i) =>
                                    <UserItem
                                        key={i}
                                        user={cg.users.find(u => u._id !== CURRENT_USER)}
                                        chatGroup={cg}
                                        selectedChatGroup={props.selectedChatGroup}
                                        select={(val) => props.selectChatGroup(val)}
                                    />
                                )
                            }

                        </section>
                    </>
            }
        </>
    )
}

export default CollaborateSection1;

function UserItem({ user, chatGroup, selectedChatGroup, select }) {
    return (
        <section
            className="user__item"
            style={{ background: selectedChatGroup?._id === chatGroup._id ? '#edf0f5' : 'none' }}
            onClick={() => select(chatGroup)}
        >
            <div>
                <img
                    src={user.git_avatar}
                    alt="profilepic"
                />
            </div>
            <div>
                {`${user.firstname} ${user.lastname}`}
            </div>
        </section>
    )
}

