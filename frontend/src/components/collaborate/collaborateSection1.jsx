import React from 'react'

function collaborateSection1() {
    return (
        <>
            <section className="ch__profile">
                <div>
                    <img
                        src="https://avatars.githubusercontent.com/u/38032299?v=4"
                        alt="profilepic"
                    />
                </div>
                <div>
                    <div style={{ fontSize: 20, fontWeight: 'bold', marginBottom: 5 }}>
                        Danish Davis
                    </div>
                    <div>Software Developer</div>
                </div>
            </section>
            <section className="ch__list">
                <div style={{ fontSize: 17, fontWeight: 'bold', margin: '30px 0', textAlign: 'center' }}>
                    Active Conversations
                </div>
                <UserItem />
                <UserItem />
                <UserItem />
                <UserItem />
                <UserItem />
            </section>
        </>
    )
}

export default collaborateSection1;


function UserItem() {
    return (
        <section className="user__item">
            <div>
                <img
                    src="https://avatars.githubusercontent.com/u/38032299?v=4"
                    alt="profilepic"
                />
            </div>
            <div>
                Danish Davis
            </div>
        </section>
    )
}

