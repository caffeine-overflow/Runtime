import React, { useState, useEffect } from "react";
import { Table, Tag, Avatar, Progress, Icon, InputPicker, Notification, Drawer, Button } from "rsuite";
import Loader from "react-loader-spinner";
import './userTable.css';

const { Column, HeaderCell, Cell, Pagination } = Table;
const UserRoles = [
	{ label: "Admin", value: "admin" },
	{ label: "Manager", value: "manager" },
	{ label: "Member", value: "member" },
];
export default function UsersTable(props) {
	const [users, setUsers] = useState([]);
	const [selectedRole, setSelectedRole] = useState(-1);
	const [sortColumn, setSortColumn] = useState(null);
	const [selectedUser, setSelectedUser] = useState(null);
	const [sortType, setSortType] = useState("asc");
	const [openDrawer, setOpenDrawer] = useState(false);
	const [userStatus, setUserStatus] = useState(false);

	const [loading, setloading] = useState(false);

	const getUsers = async () => {
		setloading(true);
		let token = sessionStorage.getItem("sprintCompassToken");
		const requestOptions = {
			method: "GET",
			headers: {
				"Content-Type": "application/json",
				Authorization: `Bearer ${token}`,
			},
		};
		const response = await fetch(`http://localhost:5000/api/users`, requestOptions);
		let data = await response.json();
		let filteredUsers = data.users.filter((user) => {
			if (user.role.toLowerCase() !== "owner") return user;
		});
		setUsers(filteredUsers);
		setloading(false);
	};

	useEffect(() => {
		getUsers();
	}, []);

	const getData = () => {
		if (sortColumn && sortType) {
			return users.sort((a, b) => {
				let x = a[sortColumn];
				let y = b[sortColumn];
				if (sortType === "asc") {
					return x.localeCompare(y);
				} else {
					return y.localeCompare(x);
				}
			});
		}
		return users;
	};

	const ImageCell = ({ rowData, dataKey, ...props }) => {
		return (
			<Cell {...props} style={{ padding: 8 }}>
				<Avatar circle src={rowData[dataKey]} />
			</Cell>
		);
	};

	const TagCell = ({ rowData, dataKey, ...props }) => {
		let colour = rowData[dataKey] ? "blue" : "green";
		let content = rowData[dataKey] ? "Disabled" : "Active";

		return (
			<Cell {...props} style={{ margin: 2, alignContent: "center" }}>
				<Tag color={colour}>{content}</Tag>
			</Cell>
		);
	};

	const ProcessCell = ({ rowData, ...props }) => {
		let percentage = Math.trunc(((!rowData.first_login + !!rowData.git_token + rowData.invitation_accepted) / 3) * 100);
		percentage = isNaN(percentage) ? 0 : percentage;

		return (
			<Cell {...props}>
				{percentage === 0 ? (
					<div style={{ width: '35px' }}>
						<Progress.Circle />
					</div>
				) : percentage === 100 ? (
					<div style={{ width: '35px' }}>
						<Progress.Circle percent={percentage} status="success" />
					</div>
				) : (
					<div style={{ width: '35px' }}>
						<Progress.Circle percent={percentage} strokeColor="#ffc107" />
					</div>
				)}
			</Cell>
		);
	};

	const handleSortColumn = (sortColumn, sortType) => {
		setSortColumn(sortColumn);
		setSortType(sortType);
	};

	let close = () => {
		setOpenDrawer(false);
	};

	const PassFailIcon = (pass) => {
		return (
			<div>
				{pass ? (
					<Icon icon="check-circle" style={{ margin: 5, color: "green" }} size="2x" />
				) : (
					<Icon icon="close-circle" style={{ margin: 5, color: "red" }} size="2x" />
				)}
			</div>
		);
	};

	const updateUser = async () => {
		let token = sessionStorage.getItem("sprintCompassToken");
		const requestOptions = {
			method: "PUT",
			headers: {
				"Content-Type": "application/json",
				Authorization: `Bearer ${token}`,
			},
			body: JSON.stringify({ id: selectedUser._id, role: selectedRole, disabled: userStatus }),
		};
		const response = await fetch(`http://localhost:5000/api/users/updateUserById`, requestOptions);
		//if updated
		if (response.ok) {
			Notification.success({
				title: "User Has Been Updated",
				description: <div style={{ width: 220 }} rows={3} />,
				placement: "topEnd",
			});
			setOpenDrawer(false);
			getUsers();
		}
	};

	return (
		<div>
			{
				loading ?
					<Loader
						type="ThreeDots"
						color="#134069"
						height={50}
						width={50}
					/>
					:
					<Table
						width={1000}
						height={600}
						data={getData()}
						rowHeight={65}
						sortColumn={sortColumn}
						sortType={sortType}
						onSortColumn={handleSortColumn}
						onRowClick={(data) => {
							setSelectedRole(data.role);
							setSelectedUser(data);
							setOpenDrawer(true);
							setUserStatus(data.disabled);
						}}
					>
						<Column width={100} fixed>
							<HeaderCell />
							<ImageCell dataKey="git_avatar" />
						</Column>
						<Column width={200} fixed sortable>
							<HeaderCell style={styles.header}>First Name</HeaderCell>
							<Cell style={styles.cell} dataKey="firstname" />
						</Column>
						<Column width={200} fixed sortable>
							<HeaderCell style={styles.header}>Last Name</HeaderCell>
							<Cell style={styles.cell} dataKey="lastname" />
						</Column>
						<Column width={200} fixed sortable>
							<HeaderCell style={styles.header}>User Role</HeaderCell>
							<Cell style={styles.cell} dataKey="role" />
						</Column>
						<Column width={100}>
							<HeaderCell style={styles.header}>Status</HeaderCell>
							<TagCell dataKey="disabled" />
						</Column>
						<Column width={150}>
							<HeaderCell style={styles.header}>Onboarding</HeaderCell>
							<ProcessCell />
						</Column>
					</Table>
			}
			<Drawer
				show={openDrawer}
				onHide={() => {
					close();
				}}
			>
				<Drawer.Body>
					<div style={{ marginTop: "50%" }}>
						<p style={{ textAlign: "center", marginBottom: "50px", fontWeight: "800", fontSize: 32 }}>User Info</p>
						<p style={{ fontWeight: "600", fontSize: 24, marginTop: 20 }}>
							Name: {selectedUser?.firstname} {selectedUser?.lastname}
						</p>
						<p style={{ fontWeight: "600", fontSize: 24, display: "flex", marginTop: 20 }}>
							Account Activated: {PassFailIcon(!selectedUser?.first_login)}
						</p>
						<p style={{ fontWeight: "600", fontSize: 24, display: "flex", marginTop: 20 }}>
							Github Authorized: {PassFailIcon(selectedUser?.git_token)}
						</p>
						<p style={{ fontWeight: "600", fontSize: 24, display: "flex", marginTop: 20 }}>
							Joined Organization: {PassFailIcon(selectedUser?.invitation_accepted)}
						</p>
						<label style={{ fontWeight: "600", fontSize: 24, marginTop: 20 }} className="rs-control-label">
							User Role:
						</label>
						<InputPicker
							data={UserRoles}
							placeholder="User Role"
							style={{ width: 200, height: 40, marginLeft: 5 }}
							value={selectedRole}
							cleanable={false}
							onChange={(value) => setSelectedRole(value)}
						/>
						<br />
						<label style={{ fontWeight: "600", fontSize: 24, marginTop: 20 }}>User Status: </label>
						<Button
							appearance={"primary"}
							color={userStatus ? "cyan" : "green"}
							style={{ width: "100px", marginLeft: 10 }}
							onClick={() => setUserStatus(!userStatus)}
						>
							{userStatus ? "Disabled" : "Active"}
						</Button>
						<Button appearance="primary" style={{ width: "250px", position: "fixed", bottom: 20 }} onClick={() => updateUser()}>
							Update User
						</Button>
					</div>
				</Drawer.Body>
			</Drawer>
		</div>
	);
}

const styles = {
	header: {
		color: 'black',
	},
	cell: {
		color: 'black'
	},
};
