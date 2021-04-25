const express = require("express");
const router = express.Router();
const { Team } = require("../models/team.js");
const authroutes = require("./authroutes");
const mongoose = require('mongoose');

router.get("/", authroutes.authenticateToken, async (req, res) => {
	try {
		let teams = await Team.find({ members: { "$in": [req.user.id] } }).populate('members').populate('team_lead')
		res.status(200).send({ teams });
	} catch (err) {
		console.error(err.stack);
		res.status(500).send({ msg: "Something went wrong. Please try again" });
	}
});

router.get("/:id", authroutes.authenticateToken, async (req, res) => {
	try {
		let team = await Team.findById(req.params.id).populate('members').populate('team_lead');
		res.status(200).send({ team });
	} catch (err) {
		console.error(err.stack);
		res.status(500).send({ msg: "Something went wrong. Please try again" });
	}
});

router.post("/", authroutes.authenticateToken, async (req, res) => {
	try {
		const { name, description } = req.body;
		const team = new Team({
			members: [req.user.id],
			team_lead: req.user.id,
			created_at: new Date().toLocaleString(),
			name: name,
			description: description,
		});

		team.save()
			.then((data) => {
                res.status(200).send(data);
			})
			.catch((err) => {
				console.error(err.stack);
                res.status(500).send({ msg: "Something went wrong. Please try again" });
			});
	} catch (err) {
		console.error(err.stack);
		res.status(500).send({ msg: "Something went wrong. Please try again" });
	}
});


router.put("/join", authroutes.authenticateToken, async (req, res) => {
	try {
		const { teamName, teamId } = req.body;
		let joinedTeam = await Team.findOne({ members: { "$in": [req.user.id] }, _id: teamId })
		if (joinedTeam) return res.status(400).send("Already Joined");
		mongoose.set('useFindAndModify', false);
		const team = await Team.findOneAndUpdate(
			{ name: teamName, _id: teamId },
			{ "$push": { "members": req.user.id } }
		);

		team.save()
			.then((data) => {
                res.status(200).send(data);
			})
			.catch((err) => {
				console.error(err.stack);
                res.status(500).send({ msg: "Something went wrong. Please try again" });
			});
	} catch (err) {
		console.log(err.stack);
		res.status(500).send({ msg: "Something went wrong. Please try again" });
	}
});
module.exports = router;
