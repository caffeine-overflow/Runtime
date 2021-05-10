import React from 'react'
import homeImg from "../../assets/sprintHome.svg";

function sprintHome() {
    return (
        <>
            <section style={{ display: 'flex', height: '90vh' }} >
                <section style={{ width: '50%', display: 'flex', alignItems: 'center' }}>
                    <img style={{ maxWidth: '650px', display: 'block', margin: 'auto' }} src={homeImg} alt="homeimg" />
                </section>
                <section style={{ width: '50%' }}>

                </section>
            </section>
        </>
    )
}

export default sprintHome
