const express = require("express");
const router = express.Router();
const { Project } = require("../models/project.js");
const authroutes = require("./authroutes");
const mongoose = require("mongoose");

router.get("/byTeamId/:team_id", authroutes.authenticateToken, async (req, res) => {
	try {
		let projects = await Project.find({ team: req.params.team_id })
			.populate("members")
			.populate({ path: "team", populate: [{ path: "members" }, { path: "team_lead" }] })
			.populate("project_lead");
		
		res.status(200).send({ projects });
	} catch (err) {
		console.log(err.stack);
		res.status(500).send({ msg: "Something went wrong. Please try again" });
	}
});

router.get("/byProjectId/:project_id", authroutes.authenticateToken, async (req, res) => {
	try {
		let project = await Project.findById(req.params.project_id)
			.populate("members")
			.populate({ path: "team", populate: [{ path: "members" }, { path: "team_lead" }] })
			.populate("project_lead");
		if (project) return res.status(200).send({ project });
		else return res.status(400).send("Cannot find the project");
	} catch (err) {
		console.log(err.stack);
		res.status(500).send({ msg: "Something went wrong. Please try again" });
	}
});

router.post("/", authroutes.authenticateToken, async (req, res) => {
	try {
		let body = req.body;
		console.log(req.user);
		const project = new Project({
			members: [req.user.id],
			project_lead: req.user.id,
			created_at: new Date().toLocaleString(),
			name: body.name,
			description: body.description,
			team: body.team_id,
			is_done: false,
		});

		project
			.save()
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

router.put("/join", authroutes.authenticateToken, async (req, res) => {
	try {
		const { projectId } = req.body;
		let joinedProject = await Project.findOne({ members: { $in: [req.user.id] }, _id: projectId });
		if (joinedProject) return res.status(400).send("Already Joined");
		mongoose.set("useFindAndModify", false);
		const project = await Project.findOneAndUpdate({ _id: projectId }, { $push: { members: req.user.id } });

		project
			.save()
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
