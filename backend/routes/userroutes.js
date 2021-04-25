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
		res.status(500).send({ msg: err.stack });
	}
});

router.get("/getById/:id", authroutes.authenticateToken, async (req, res) => {
	try {
		let user = await User.findById(req.params.id);
		user.password = undefined;
		if (!user) res.status(404).send({ msg: "Cannot find the user" });
		else res.status(200).send({ user });
	} catch (err) {
		res.status(500).send({ msg: err.stack });
	}
});

//Change Password
router.put("/change_password", authroutes.authenticateToken, async (req, res) => {
	try {
		const { old_password, new_password } = req.body;
        const user = await User.findById(req.user.id);
		if (!(await bcrypt.compare(old_password, user.password))) res.status(500).send({ msg: "Password doesnot match" });

		const salt = await bcrypt.genSalt();
		const hashedPassword = await bcrypt.hash(new_password, salt);

		await User.findByIdAndUpdate(req.user.id, { $set: { password: hashedPassword } }, function (err, result) {
			if (err) {
				res.status(500).send({ msg: err });
			} else {
				res.status(200).send({ msg: "Password Updated Successfully" });
			}
		});
	} catch (err) {
		res.status(500).send({ msg: err.stack });
	}
});

module.exports = router;
