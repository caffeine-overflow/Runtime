import React from 'react';
import ProfilePlaceHolder from '../../assets/profile.jpg';

function CollaborateSection1(props) {

    return (
        <>
            <section className="ch__profile">
                <div>
                    <img
                        src={props.currentuser.git_avatar}
                        alt="profilepic"
                    />
                </div>
                <div>
                    <div style={{ fontSize: 20, fontWeight: 'bold', marginBottom: 5 }}>
                        {`${props.currentuser.firstname}  ${props.currentuser.lastname}`}
                    </div>
                    <div>{props.currentuser.position}</div>
                </div>
            </section>
            <section className="ch__list">
                <div style={{ fontSize: 17, fontWeight: 'bold', margin: '30px 0', textAlign: 'center' }}>
                    Active Conversations
                </div>
                {
                    props.chatGroups.map((cg, i) =>
                        <UserItem
                            key={i}
                            user={cg.users.find(u => u._id !== props.currentuser._id)}
                            chatGroup={cg}
                            selectedChatGroup={props.selectedChatGroup}
                            select={(val) => props.selectChatGroup(val)}
                            currentuserid={props.currentuser._id}
                        />
                    )
                }
            </section>
        </>
    )
}

export default CollaborateSection1;

function UserItem({ user, chatGroup, selectedChatGroup, select, currentuserid }) {

    //*logic to check if the user read the last message or not
    let unreadMsg = selectedChatGroup?._id !== chatGroup._id && !chatGroup.seen_by.find(u => u === currentuserid);

    return (
        <section
            className="user__item"
            style={{ background: selectedChatGroup?._id === chatGroup._id ? '#edf0f5' : 'none' }}
            onClick={() => select(chatGroup)}
        >
            <div>
                <img
                    src={user.git_avatar ?? ProfilePlaceHolder}
                    alt="profilepic"
                />
            </div>
            <div style={{ fontWeight: unreadMsg ? 'bold' : 300 }}>
                {`${user.firstname} ${user.lastname}`}
            </div>
        </section>
    )
}

