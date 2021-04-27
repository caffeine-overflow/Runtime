const express = require("express");
const router = express.Router();
const { User } = require("../models/user.js");
const authroutes = require("./authroutes");
const bcrypt = require("bcrypt");

router.get("/", authroutes.authenticateToken, async (req, res) => {
	try {
		let users = await User.find({});
		res.status(200).send({ users });
	} catch (err) {
		console.error(err.stack)
		res.status(500).send({ msg: "Something went wrong. Please try again!" });
	}
});

router.get("/getById/:id", authroutes.authenticateToken, async (req, res) => {
	try {
		let user = await User.findById(req.params.id);
		user.password = undefined;
		if (!user) res.status(404).send({ msg: "Cannot find the user" });
		else res.status(200).send({ user });
	} catch (err) {
		console.error(err.stack)
		res.status(500).send({ msg: "Something went wrong. Please try again!" });
	}
});

router.put("/", authroutes.authenticateToken, async (req, res) => {
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
				res.status(200).send({ msg: "User Updated Successfully", user });
			})
			.catch((err) => {
				console.error(err.stack)
				res.status(500).send({ msg: "Something went wrong. Please try again!" });
			});
	} catch (err) {
		res.status(500).send({ msg: err.stack });
	}
});


//Change Password
router.put("/change_password", authroutes.authenticateToken, async (req, res) => {
	try {
		const { old_password, new_password } = req.body;
		const user = await User.findById(req.user.id);
		if (!(await bcrypt.compare(old_password, user.password))) {
			res.status(500).send({ msg: "Current password is incorrect" });
			return;
		}

		const salt = await bcrypt.genSalt();
		const hashedPassword = await bcrypt.hash(new_password, salt);

		await User.findByIdAndUpdate(req.user.id, { $set: { password: hashedPassword } }, function (err, result) {
			if (err) {
				res.status(500).send({ msg: "Something went wrong. Please try again!" });
			} else {
				res.status(200).send({ msg: "Password Updated Successfully" });
			}
		});
	} catch (err) {
		console.error(err.stack)
		res.status(500).send({ msg: "Something went wrong. Please try again!" });
	}
});

module.exports = router;
