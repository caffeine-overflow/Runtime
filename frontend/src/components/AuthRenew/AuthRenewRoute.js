import React, { useEffect, useState } from 'react'
import { Redirect, Route } from 'react-router-dom'
import Loader from "react-loader-spinner";
import util from "../../utility/utils";

function PrivateRoute({ component: Component, ...rest }) {
    const [isAuthenticated, setisAuthenticated] = useState(false);
    const [isAuthorized, setIsAuthorized] = useState(true);
    const [Validated, setValidated] = useState(false)

    useEffect(() => {
        async function fetchData() {
            const response = await util.FETCH_DATA(`auth/authrenew_validate`, "No Notification");
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
