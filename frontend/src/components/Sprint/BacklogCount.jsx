import React from 'react'

export default function App(props) {
    return <section className="backlog__circle">
        <div className="backlog__count">
            {props.count}
        </div>
    </section>
}