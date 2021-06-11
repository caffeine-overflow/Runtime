/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from "react";
import PasswordRenewSvg from "../assets/passwordRenew.svg";
import Loader from "react-loader-spinner";
import util from "../utility/utils";
import {
    Form,
    FormControl,
    FormGroup,
    ControlLabel,
    Schema,
    Panel,
    Button,
} from "rsuite";

const { StringType } = Schema.Types;

export default function ResetPasswordPage(props) {

    const [newpassword, setnewpassword] = useState("");
    const [confirmPassword, setconfirmPassword] = useState("");

    const [loading, setloading] = useState(true);

    const changePassword = async (status) => {
        if (status) {
            setloading(true);

            let token = sessionStorage.getItem("sprintCompassToken");
            const requestOptions = {
              method: "PUT",
              headers: {
                "Access-Control-Expose-Headers": "*",
                "Access-Control-Allow-Origin": "*",
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
              },
              body: JSON.stringify({ new_password: newpassword }),
            };

            const response = await fetch(`${util.ADDRESS}api/users/reset_password`, requestOptions);

            if (response.status === 200) {
              window.open("/login?success=true", "_self");
            } else {
              window.open(
                `/login?error=true&msg=${response.data.msg}`,
                "_self"
              );
            }
        }
    };
	
    useEffect(() => {        
		authorizeURL();
	}, []);

    const authorizeURL = async () => {
        let token = util.getQueryVariable("token");
        if(!token){
            window.open('/login?error=true', '_self')
        }
        else{
            sessionStorage.setItem("sprintCompassToken", token);
            const requestOptions = {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
            };
            let response =  await fetch(`${util.ADDRESS}auth/validate_url`, requestOptions);
            if(response.status !== 200){
                let data = await response.json();
                window.open(`/login?error=true&msg=${data.msg}`, '_self')
            }else{                
                setloading(false);
            }
        }
    };

    return (
        <div
            style={{
                width: "80%",
                margin: "auto",
                height: "100vh",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
            }}
        >
            {
                loading &&
                <Loader
                    style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}
                    type="ThreeDots"
                    color="#134069"
                    height={50}
                    width={50}
                />
            }
            {
                !loading &&
                <div style={{ width: "100%", height: "80vh" }}>
                    <h2 style={{ textAlign: "center" }}>Reset Your Password</h2>
                    <hr />
                    <Panel style={{ height: "60vh" }}>
                        <section style={{ display: "flex", height: "60vh" }}>
                            <div
                                style={{
                                    width: "50%",
                                    display: "flex",
                                    justifyContent: "center",
                                    alignItems: "center",
                                }}
                            >
                                <img
                                    style={{ maxWidth: "550px" }}
                                    src={PasswordRenewSvg}
                                    alt="passwordrenewimg"
                                />
                            </div>
                            <div
                                style={{
                                    flex: 1,
                                    display: "flex",
                                    justifyContent: "center",
                                    alignItems: "center",
                                }}
                            >
                                <Form
                                    model={Schema.Model({
                                        newPassword: StringType()
                                            .addRule((value) => {
                                                if (value.length < 8) return false;
                                                return true;
                                            }, "Password must be atleast 8 characters long")
                                            .isRequired(`New Password is required.`),
                                        confirmPassword: StringType()
                                            .addRule((value) => {
                                                if (value !== newpassword) return false;
                                                return true;
                                            }, "The two passwords do not match")
                                            .isRequired("This field is required."),
                                    })}
                                    onSubmit={(status) => {
                                        changePassword(status);
                                    }}
                                >
                                    <TextField
                                        type="password"
                                        name="newPassword"
                                        label="New Password"
                                        onChange={(value) => {
                                            setnewpassword(value);
                                        }}
                                    />
                                    <TextField
                                        type="password"
                                        name="confirmPassword"
                                        label="Confirm Password"
                                        onChange={(value) => {
                                            setconfirmPassword(value);
                                        }}
                                    />
                                    <Button
                                        type="submit"
                                        style={{
                                            marginTop: "50px",
                                            background: "#193A5A",
                                            color: "#f5f5f5",
                                            minWidth: "300px",
                                        }}
                                        disabled={loading}
                                    >
                                        Update Password
                                    </Button>
                                </Form>
                            </div>
                        </section>
                    </Panel>
                    <hr />
                </div>
            }
        </div>
    );
}

function TextField(props) {
    const { name, label, accepter, type, ...rest } = props;
    return (
        <FormGroup>
            <ControlLabel>{label} </ControlLabel>
            <FormControl name={name} type={type} accepter={accepter} {...rest} />
        </FormGroup>
    );
}