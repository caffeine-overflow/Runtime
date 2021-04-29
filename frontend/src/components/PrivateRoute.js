import React, { useEffect, useState } from 'react'
import { Redirect, Route } from 'react-router-dom'

function PrivateRoute({ component: Component, ...rest }) {
    const [isAuthenticated, setisAuthenticated] = useState(false);
    const [Validated, setValidated] = useState(false)
    const [renewAuth, setrenewAuth] = useState(false);

    useEffect(() => {
        let token = sessionStorage.getItem('sprintCompassToken');

        async function fetchData() {
            const requestOptions = {
                method: 'GET',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }
            };
            const response = await fetch('http://localhost:5000/auth/validate', requestOptions);

            if (response.status === 200) {
                setisAuthenticated(true);
                setValidated(true);
            }
            else if (response.status === 307) {
                setisAuthenticated(true);
                setValidated(true);
                setrenewAuth(true);
            }
            else {
                setisAuthenticated(false);
                setValidated(true);
            }
        }
        fetchData();
    }, []);

    if (!isAuthenticated && !Validated) {
        return <div></div>
    };

    return <Route {...rest} render={(props) => (
        renewAuth ?
            <Redirect to={{
                pathname: '/auth',
                state: { from: props.location }
            }} />
            :
            (
                isAuthenticated
                    ? <Component {...props} />
                    :
                    <Redirect to={{
                        pathname: '/login',
                        state: { from: props.location }
                    }} />
            )
    )} />
}

export default PrivateRoute;
