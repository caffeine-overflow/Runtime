import React, { useEffect, useState } from 'react'
import { Redirect, Route } from 'react-router-dom'
import Loader from "react-loader-spinner";

function PrivateRoute({ component: Component, ...rest }) {
    const [isAuthenticated, setisAuthenticated] = useState(false);
    const [isAuthorized, setIsAuthorized] = useState(true);
    const [Validated, setValidated] = useState(false)

    useEffect(() => {
        let token = sessionStorage.getItem('sprintCompassToken');

        async function fetchData() {
            const requestOptions = {
                method: 'GET',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }
            };
            const response = await fetch('http://localhost:5000/auth/authrenew_validate', requestOptions);

            if (response.status === 200) {
                setIsAuthorized(true);
                setisAuthenticated(true);
            }
            else if (response.status === 403) {
                setIsAuthorized(false);
            }
            else {
                setIsAuthorized(true);
                setisAuthenticated(false);
            }
            setValidated(true);
        }
        fetchData();
    }, []);

    if (!Validated) {
        return <Loader
            style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '90vh' }}
            type="BallTriangle"
            color="#134069"
            height={50}
            width={50}
        />
    };

    return (
        <Route
            {...rest}
            render={(props) =>
                isAuthorized ? (
                    isAuthenticated ? (
                        <Component {...props} />
                    ) : (
                        <Redirect
                            to={{
                                pathname: "/projects",
                                state: { from: props.location },
                            }}
                        />
                    )
                ) : (
                    <Redirect
                        to={{
                            pathname: "/login",
                            state: { from: props.location },
                        }}
                    />
                )
            }
        />
    );
}

export default PrivateRoute;
