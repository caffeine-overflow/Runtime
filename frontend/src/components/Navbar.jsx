import React from 'react';
import { Nav, Dropdown } from 'rsuite';
import Logo from '../assets/logo.svg';
import '../styling/nav.css';

const CustomNav = ({ active, onSelect, ...props }) => {
    const logout = () => {
        sessionStorage.removeItem('sprintCompassToken');
        sessionStorage.removeItem('sprintCompassUser');
        sessionStorage.removeItem('sprintCompassUserName');
        window.open('/login', '_self');
    }
    return (
        <Nav {...props} activeKey={active} onSelect={onSelect}>
            <Nav.Item style={{ margin: '0 50px' }}>
                <img style={{ width: '80px' }} src={Logo} alt="logo" />
            </Nav.Item>
            <Nav.Item className="navHeader" eventKey="teams">Teams</Nav.Item>
            <Nav.Item className="navHeader" eventKey="solutions">Solutions</Nav.Item>
            <Nav.Item className="navHeader" eventKey="products">Products</Nav.Item>
            <Nav.Item className="navHeader" eventKey="about">About</Nav.Item>
            <Dropdown
                style={{ float: 'right', marginRight: '30px' }}
                className="navHeader"
                title={sessionStorage.getItem('sprintCompassUserName')}>
                <Dropdown.Item>Profile</Dropdown.Item>
                <Dropdown.Item>Settings</Dropdown.Item>
                <Dropdown.Item onClick={() => logout()}>Log Out</Dropdown.Item>
            </Dropdown>
        </Nav>
    );
};

class Navbar extends React.Component {
    constructor() {
        super();
        this.state = {
            active: 'home'
        };
        this.handleSelect = this.handleSelect.bind(this);
    }

    handleSelect(activeKey) {
        if (activeKey === "teams") window.open(window.location.origin + '/teams', '_self');
    }

    componentDidMount() {
        let route = window.location.pathname.split('/');
        if (route[1] === 'team' || route[1] === 'teams') {
            this.setState({ active: 'teams' })
        }
    }

    render() {
        const { active } = this.state;
        return (
            <div>
                <CustomNav appearance="subtle" active={active} onSelect={this.handleSelect} />
            </div>
        );
    }
}

export default Navbar;

