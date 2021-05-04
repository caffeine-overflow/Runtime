import React, { useEffect, useState } from "react";
import { Redirect, Route } from "react-router-dom";
import Loader from "react-loader-spinner";

function PrivateRoute({ component: Component, ...rest }) {
	const [Validated, setValidated] = useState(false);
	const [renewAuth, setrenewAuth] = useState(false);
	const [isAuthorized, setIsAuthorized] = useState(true);

	useEffect(() => {
		let token = sessionStorage.getItem("sprintCompassToken");

		async function fetchData() {
			const requestOptions = {
				method: "GET",
				headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
			};
			const response = await fetch("http://localhost:5000/auth/validate", requestOptions);

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
