import React from 'react'
import {
    Button
} from 'rsuite';

function collaborateSection3(props) {
    let user = props.selectedChatGroup.users.find(u => u._id !== props.currentuser._id);
    return (
        <>
            <section className="ch__profile" style={{ 'height': '300px' }}>
                <div>
                    <img
                        src={user.git_avatar ?? "https://upload.wikimedia.org/wikipedia/commons/8/89/Portrait_Placeholder.png"}
                        alt="profilepic"
                    />
                </div>
                <div>
                    <div style={{ fontSize: 20, fontWeight: 'bold', marginBottom: 5 }}>
                        {`${user.firstname}  ${user.lastname}`}
                    </div>
                    <div>{user.role}</div>
                    <Button
                        style={{ margin: '20px 0' }}
                        appearance="primary"
                        onClick={() => window.open(`/profile/${user._id}`, '_blank')}
                    >
                        Visit Profile
                    </Button>
                </div>
            </section>
        </>
    )
}
export default collaborateSection3
