const express = require("express");
const router = express.Router();
const { User } = require("../models/user.js");
const { Client } = require("../models/client.js");
const authroutes = require("./authroutes");
const bcrypt = require("bcrypt");
const { sendEmail } = require('../utils/email');
const { welcomeEmail } = require("../utils/email_templates/welcome");
const errorHandler = require('../utils/errorhandler');
const { removeUserFromOrganization, changeRole } = require("../github/gitUtils");

router.get("/", authroutes.authenticateToken, async (req, res, next) => {
	try {
		let users = await User.find({ client_id: req.user.client_id._id });
		users.forEach(user => user.password = undefined)
		return res.status(200).send({ users });
	} catch (err) {
		next(errorHandler(err, req, 500));
	}
});

router.get("/getById/:id", authroutes.authenticateToken, async (req, res, next) => {
	try {
		let user = await User.findById(req.params.id);
		user.password = undefined;
		if (!user) return res.status(404).send({ msg: "Cannot find the user" });
		else return res.status(200).send({ user });
	} catch (err) {
		next(errorHandler(err, req, 500));
	}
});

//same as the function above but with a different middleware auth
router.get("/getUserById/:id", authroutes.authRenewToken, async (req, res, next) => {
	try {
		let user = await User.findById(req.params.id);
		user.password = undefined;
		if (!user) return res.status(404).send({ msg: "Cannot find the user" });
		else return res.status(200).send({ user });
	} catch (err) {
		next(errorHandler(err, req, 500));
	}
});

router.put("/updateUserById", authroutes.authAdmin, async (req, res, next) => {
	try {
		let error = false;
		let body = req.body;
		let renewedUser = false;
		let password = "";
		let user = await User.findById(body.id);
		if (user.disabled && user.role != body.role) {
			return res.status(400).send({ msg: "Can't change role of disabled user" });
		} else {
			if (user.disabled && !body.disabled) {
				renewedUser = true;
				password = Math.random().toString(36).substring(2, 8) + (Math.random() * 100).toFixed();
				const salt = await bcrypt.genSalt();
				user.password = await bcrypt.hash(password, salt);
			}
			if (body.disabled && !user.disabled) {
				user.git_token = "";
				user.first_login = true;
				user.invitation_accepted = false;
				user.role = "member";
				await removeUserFromOrganization(req.user.git_token, req.user.client_id.organization, user.git_username);
			}
			user.disabled = body.disabled;
			if (!user.disabled && user.role != body.role) {
				let roleChange = await changeRole(req.user.git_token, req.user.client_id.organization, user.git_username, body.role);
				if (roleChange.status !== 200) {
					error = true;
					return res.status(500).send({ msg: "User hasn't authorized their Github yet." });
				}
				user.role = body.role;
			}
			if (!error) {
				user.save()
					.then((data) => {
						if (renewedUser) {
							let htmlTemplate = welcomeEmail(`${data.firstname} ${data.lastname}`, data.email, password);
							sendEmail(htmlTemplate, data.email, "Welcome").catch(console.error);
						}
						return res.status(200).send({ msg: "User Updated Successfully" });
					})
					.catch((err) => {
						next(errorHandler(err, req, 500));
					});
			}
		}
	} catch (err) {
		next(errorHandler(err, req, 500));
	}
});

router.put("/", authroutes.authenticateToken, async (req, res, next) => {
	try {
		let body = req.body;
		let user = await User.findById(req.user.id);
		user.firstname = body.firstname ? body.firstname : user.firstname;
		user.lastname = body.lastname ? body.lastname : user.lastname;
		user.email = body.email ? body.email : user.email;
		user.phone = body.phone ? body.phone : user.phone;
		user.location = body.location ? body.location : user.location;
		user.image = body.image ? body.image : user.image;
		user.position = body.position ? body.position : user.position;

		user.save()
			.then((data) => {
				return res.status(200).send({ msg: "User Updated Successfully", user });
			})
			.catch((err) => {
				next(errorHandler(err, req, 500));
			});
	} catch (err) {
		next(errorHandler(err, req, 500));
	}
});

//same as the function above but with diffrent middleware auth
router.put("/update_user", authroutes.authRenewToken, async (req, res, next) => {
	try {
		let body = req.body;
		let user = await User.findById(req.user.id);
		user.firstname = body.firstname ? body.firstname : user.firstname;
		user.lastname = body.lastname ? body.lastname : user.lastname;
		user.email = body.email ? body.email : user.email;
		user.phone = body.phone ? body.phone : user.phone;
		user.location = body.location ? body.location : user.location;
		user.image = body.image ? body.image : user.image;
		user.position = body.position ? body.position : user.position;

		user.save()
			.then((data) => {
				return res.status(200).send({ msg: "User Updated Successfully", user });
			})
			.catch((err) => {
				next(errorHandler(err, req, 500));
			});
	} catch (err) {
		next(errorHandler(err, req, 500));
	}
});



//Change Password
router.put("/change_password", authroutes.authenticateToken, async (req, res, next) => {
	try {
		const { old_password, new_password } = req.body;
		const user = await User.findById(req.user.id);
		if (!(await bcrypt.compare(old_password, user.password))) {
			return res.status(500).send({ msg: "Current password is incorrect" });
		}

		const salt = await bcrypt.genSalt();
		const hashedPassword = await bcrypt.hash(new_password, salt);

		await User.findByIdAndUpdate(req.user.id, { $set: { password: hashedPassword, first_login: false } }, function (err, result) {
			if (err) {
				return res.status(500).send({ msg: "Something went wrong. Please try again!" });
			} else {
				return res.status(200).send({ msg: "Password Updated Successfully" });
			}
		});
	} catch (err) {
		next(errorHandler(err, req, 500));
	}
});


//Reset Password
router.put("/reset_password", authroutes.authenticateToken, async (req, res, next) => {
	try {
		const { new_password } = req.body;
		const salt = await bcrypt.genSalt();
		const hashedPassword = await bcrypt.hash(new_password, salt);

		await User.findByIdAndUpdate(req.user.id, { $set: { password: hashedPassword, first_login: false } }, function (err, result) {
			if (err) {
				return res.status(500).send({ msg: "Something went wrong. Please try again!" });
			} else {
				return res.status(200).send({ msg: "Password Updated Successfully" });
			}
		});
	} catch (err) {
		next(errorHandler(err, req, 500));
	}
});

//same as the function above but with a different middleware auth
router.put("/update_password", authroutes.authRenewToken, async (req, res, next) => {
	try {
		const { old_password, new_password } = req.body;
		const user = await User.findById(req.user.id);
		if (!(await bcrypt.compare(old_password, user.password))) {
			return res.status(500).send({ msg: "Current password is incorrect" });
		}

		const salt = await bcrypt.genSalt();
		const hashedPassword = await bcrypt.hash(new_password, salt);

		await User.findByIdAndUpdate(req.user.id, { $set: { password: hashedPassword, first_login: false } }, function (err, result) {
			if (err) {
				next(errorHandler(err, req, 500));
			} else {
				return res.status(200).send({ msg: "Password Updated Successfully" });
			}
		});
	} catch (err) {
		next(errorHandler(err, req, 500));
	}
});


//register function
router.post("/create", authroutes.authAdmin, async (req, res, next) => {
	try {
		const { firstname, lastname, email, phone, location, image } = req.body;

		const existingUser = await User.findOne({ email: email });
		if (existingUser) {
			return res.status(400).send({ msg: "User already exists" });
		}

		let password = Math.random().toString(36).substring(2, 8) + (Math.random() * 100).toFixed();
		const salt = await bcrypt.genSalt();
		const hashedPassword = await bcrypt.hash(password, salt);
		const newUser = new User({
			firstname: firstname,
			lastname: lastname,
			email: email,
			password: hashedPassword,
			phone: phone,
			location: location,
			image: image,
			first_login: true,
			git_token: null,
			client_id: req.user.client_id._id,
			disabled: false,
			role: "member"
		});

		newUser.save(function (err) {
			if (err) {
				next(errorHandler(err, req, 500));
			}
			else {
				let htmlTemplate = welcomeEmail(`${firstname} ${lastname}`, email, password);
				sendEmail(htmlTemplate, email, "Welcome").catch(console.error);
				return res.status(200).send({ msg: "Account Created" });
			}
		});
	} catch (err) {
		next(errorHandler(err, req, 500));
	}
});

router.post("/addClient", authroutes.authAdmin, async (req, res, next) => {

	const client = await new Client({
		'name': req.body.name,
		'organization': req.body.organization
	}).save();

	if (!client) {
		next(errorHandler(err, req, 500));
	}

	await User.findByIdAndUpdate(req.user.id, { $set: { client_id: client._id } }, function (err, result) {
		if (err) {
			next(errorHandler(err, req, 500));
		} else {
			return res.status(200).send({ msg: "Successfully added Organization" });
		}
	});
});

module.exports = router;
