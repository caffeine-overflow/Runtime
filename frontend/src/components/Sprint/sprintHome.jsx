import React, { useState, useEffect } from 'react'
import homeImg from "../../assets/sprintHome.svg";
import util from "../../utility/utils";
import Clipboard from 'react-clipboard.js';
import { IconButton, Icon, Button, Avatar, Drawer, Form, InputPicker, ButtonToolbar, Whisper, Popover } from "rsuite";

function SprintHome(props) {
	const [repo, setrepo] = useState(null);
	const [selectedUser, setselectedUser] = useState(null);
	const [addMemberDrawer, setAddMemberDrawer] = useState(false);
	const [membersIn, setMembersIn] = useState([]);
	const [membersNotIn, setMembersNotIn] = useState([]);

	const getRepo = async () => {
		let response = await util.FETCH_DATA(`api/git/getRepo/${props.project.repo}`);
		setrepo(response.data.repo.data);
	};

	const getMembers = async () => {
		let response = await util.FETCH_DATA(`api/projects/members/${props.project._id}`);
		setMembersIn(response.data.membersIn);
		setMembersNotIn(response.data.membersNotIn);
	};

	const addMember = async () => {
		let body = {
			project_id: props.project._id,
			user_id: selectedUser,
		};
		let successMessage = "Successfully added the user";
		await util.PUT_DATA(`api/projects/addMember`, body, successMessage);
		setAddMemberDrawer(false);
		getMembers();
		getRepo();
	};

	useEffect(() => {
		getMembers();
		getRepo();
	}, []);

	return (
		<>
			<section style={{ display: "flex", height: "70vh" }}>
				<section style={{ width: "50%", display: "flex", alignItems: "center" }}>
					<img style={{ maxWidth: "700px", display: "block", margin: "auto" }} src={homeImg} alt="homeimg" />
				</section>
				<section style={{ width: "50%", display: "flex", justifyContent: "center", height: "100%", alignContent: "center", flexWrap: "wrap" }}>
					<div style={{ width: "100%", textAlign: "center", fontSize: "30px", fontWeight: "bold" }}>{props.project.name}</div>
					<div style={{ width: "100%", textAlign: "center", marginTop: "10px" }}>{props.project.description}</div>
					<div style={{ width: "100%", textAlign: "center", fontSize: "22px", marginTop: "10px", fontWeight: "bold" }}>Contributors</div>
					<div className="avatar-group" style={{ justifyContent: "center", display: "flex", width: "50%", margin: "auto", flexWrap: "wrap" }}>
						{membersIn.map((t, i) => {
							return (
								<Whisper key={i} trigger="hover" placement={"top"} speaker={<Popover title={`${t.firstname} ${t.lastname}`}></Popover>}>
									<Avatar circle style={{ background: "#828282", cursor: "pointer", margin: "10px" }} src={t.git_avatar} />
								</Whisper>
							);
						})}
					</div>
					<div style={{ width: "100%", display: "flex", justifyContent: "center", marginTop: "40px" }}>
						{["owner", "admin"].includes(sessionStorage.getItem("sprintCompassUserRole").toLowerCase()) && (
							<Button style={{ marginRight: "10px" }} onClick={() => setAddMemberDrawer(true)}>
								Add Member
							</Button>
						)}
						<div>
							<Icon style={{ padding: "4px 10px" }} icon="github" size="2x" />
						</div>
						<Button onClick={() => window.open(repo.html_url, "_blank")}>Open with Github</Button>
					</div>
					{repo && (
						<div style={{ marginTop: "40px", display: "flex" }}>
							<Clipboard data-clipboard-text={repo.clone_url} style={{ background: "none", display: "flex" }}>
								<div style={{ background: "#e6e6e6", padding: "7px", border: "1px solid #e6e6e6" }}>Clone Url</div>
								<div style={{ background: "#f5f5f5", padding: "7px", border: "1px solid #e6e6e6" }}>{repo.clone_url}</div>
							</Clipboard>
							<IconButton style={{ marginLeft: "10px" }} icon={<Icon icon="copy" />} />
						</div>
					)}
				</section>
			</section>
			<Drawer
				show={addMemberDrawer}
				onHide={() => {
					setAddMemberDrawer(false);
					setselectedUser(null);
				}}
			>
				<Drawer.Body>
					<div className="drawerBody">
						<Form
							onSubmit={() => {
								addMember();
							}}
						>
							<h5 style={{ textAlign: "center", marginBottom: "50px" }}>Add a Member</h5>
							{membersNotIn && membersNotIn.length === 0 && <div style={{ textAlign: "center" }}>No new members to add</div>}
							{membersNotIn && membersNotIn.length > 0 && (
								<div>
									<InputPicker
										data={membersNotIn.map((m) => {
											return { label: m.firstname + " " + m.lastname, value: m._id };
										})}
										style={{ width: 224 }}
										onChange={(value) => setselectedUser(value)}
									/>
									<ButtonToolbar>
										<Button appearance="primary" type="submit" style={{ width: "100%", margin: "30px 0" }} disabled={!selectedUser}>
											Submit
										</Button>
									</ButtonToolbar>
								</div>
							)}
						</Form>
					</div>
				</Drawer.Body>
			</Drawer>
		</>
	);
}

export default SprintHome
