import React, { useState, useEffect } from "react";
import { Table, Tag, Avatar, Progress, Icon, InputPicker, Toggle, Drawer, Button } from "rsuite";
import Loader from "react-loader-spinner";
import './userTable.css';
import util from '../../utility/utils';

const { Column, HeaderCell, Cell } = Table;
const UserRoles = [
	{ label: "Admin", value: "admin" },
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
		const response = await util.FETCH_DATA(`api/users`, "No Notification");
		let filteredUsers = response.data.users.filter((user) => {
			if (user.role.toLowerCase() !== "owner") return user;
			return undefined;
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
			<>
				{pass ? (
					<Icon icon="check-circle" style={{ margin: 5, color: "green" }} size="2x" />
				) : (
					<Icon icon="close-circle" style={{ margin: 5, color: "red" }} size="2x" />
				)}
			</>
		);
	};

	const updateUser = async () => {
		let message = "User Has Been Updated"
		let body = { id: selectedUser._id, role: selectedRole, disabled: userStatus };
		await util.UPDATE_DATA(`api/users/updateUserById`, body, message);
		setOpenDrawer(false);
		getUsers();
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
				<Drawer.Header>
					<Drawer.Title>User Information</Drawer.Title>
				</Drawer.Header>
				<Drawer.Body>
					<div className='user__info__container'>
						<div>
							<div>User Name</div>
							<div>{selectedUser?.firstname} {selectedUser?.lastname}</div>
						</div>
						<div>
							<div>Account Activated</div>
							<div>{PassFailIcon(!selectedUser?.first_login)}</div>
						</div>
						<div>
							<div>Github Authorized</div>
							<div>{PassFailIcon(selectedUser?.git_token)}</div>
						</div>
						<div>
							<div>Joined Organization</div>
							<div>{PassFailIcon(selectedUser?.invitation_accepted)}</div>
						</div>
						<div>
							<label className="rs-control-label">User Role</label>
							<section>
								<InputPicker
									style={{ width: '150px' }}
									data={UserRoles}
									placeholder="User Role"
									value={selectedRole}
									cleanable={false}
									onChange={(value) => setSelectedRole(value)}
								/>
							</section>
						</div>
						<div>
							<label>User Enabled</label>
							<div style={{ textAlign: 'center' }}>
								<Toggle
									style={{ width: '30px', textAlign: 'center' }}
									size="lg"
									checked={!userStatus}
									onChange={() => setUserStatus(!userStatus)}
								/>
							</div>
						</div>
					</div>
					<div style={{ textAlign: 'center' }}>
						<Button
							appearance="primary"
							onClick={() => updateUser()}
							style={{ width: 250 }}
						>
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
