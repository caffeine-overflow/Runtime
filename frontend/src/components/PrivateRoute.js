import React, { useEffect, useState } from "react";
import { Redirect, Route } from "react-router-dom";
import Loader from "react-loader-spinner";
import util from "../utility/utils";

function PrivateRoute({ component: Component, ...rest }) {
	const [Validated, setValidated] = useState(false);
	const [renewAuth, setrenewAuth] = useState(false);
	const [isAuthorized, setIsAuthorized] = useState(true);

	useEffect(() => {
		async function fetchData() {
			const response = await util.FETCH_DATA(`auth/validate`, "No Notification");

			if (response.status === 403) {
				setIsAuthorized(false);
			} else if (response.status === 307) {
				setrenewAuth(true);
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
	}

	return (
		<Route
			{...rest}
			render={(props) =>
				isAuthorized ? (
					renewAuth ? (
						<Redirect
							to={{
								pathname: "/auth",
								state: { from: props.location },
							}}
						/>
					) : (
						<Component {...props} />
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
