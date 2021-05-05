import React, { useState } from 'react';
import Navbar from "../Navbar";
import {
    Drawer, Icon, InputNumber, Timeline,
    Button, Notification, Toggle, Tag,
    Input, InputPicker, FlexboxGrid, Modal
} from 'rsuite';
import './adminPage.css';
import AdminSvg from '../../assets/admin.svg';
const adminFunctions = [
    { key: 1, name: 'Create User', icon: 'user-plus' },
    { key: 2, name: 'Create Project', icon: 'task' },
    { key: 3, name: 'Manage Users', icon: 'setting' },
    { key: 4, name: 'App Settings', icon: 'laptop' },
    { key: 5, name: 'Github Settings', icon: 'github' },
    { key: 6, name: 'Reports', icon: 'file-text-o' },
    { key: 7, name: 'Data Management', icon: 'database' }
];

export default function AdminPage() {
    const [activeKey, setactiveKey] = useState(0);
    console.log(activeKey);
    return (
        <div>
            <Navbar />
            <section className="adminContainer">
                <section className="adminContainer__1">
                    {
                        adminFunctions.map(f => {
                            return <FunctionCard
                                key={f.key}
                                function={f}
                                active={f.key === activeKey}
                                makeActiveKey={() => setactiveKey(f.key)}
                            />
                        })
                    }
                </section>
                <section className="adminContainer__2">
                    {
                        activeKey === 0 &&
                        <section className="adminHome">
                            <img src={AdminSvg} alt="adminSvg" />
                        </section>
                    }
                </section>
            </section>
        </div>
    )
}


let FunctionCard = (props) => {
    return (
        <section
            className="functionCard"
            onClick={props.makeActiveKey}
            style={{ color: props.active ? '#134069' : '' }}
        >
            <div>
                <Icon icon={props.function.icon} size='2x' />
            </div>
            <div style={{ fontWeight: props.active ? 700 : 500 }}>
                {props.function.name}
            </div>
        </section>
    )
}
