import React from 'react';
import Navbar from '../Navbar';
import './collaborate.css';
import CollaborateSection1 from "./collaborateSection1";
import CollaborateSection2 from "./collaborateSection2";
import CollaborateSection3 from "./collaborateSection3";

function collaborateHome() {
    return (
        <>
            <Navbar />
            <section className="collaborate__home">
                <section className='ch__1'>
                    <CollaborateSection1 />
                </section>
                <section className='ch__2'>
                    <CollaborateSection2 />
                </section>
                <section className='ch__3'>
                    <CollaborateSection3 />
                </section>
            </section>
        </>
    )
}

export default collaborateHome
