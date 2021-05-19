const express = require("express");
const router = express.Router();
const { Project } = require("../models/project.js");
const authroutes = require("./authroutes");
const mongoose = require("mongoose");
const { createRepo } = require("../github/gitUtils");

router.get("/", authroutes.authenticateToken, async (req, res) => {
	try {
		let projects = await Project.find({})
			.populate("project_lead");

		return res.status(200).send({ projects });
	} catch (err) {
		console.log(err.stack);
		return res.status(500).send({ msg: "Something went wrong. Please try again" });
	}
});

router.get("/byProjectId/:project_id", authroutes.authenticateToken, async (req, res) => {
	try {
		let project = await Project.findById(req.params.project_id)
			.populate("members")
			.populate("project_lead");
		if (project) return res.status(200).send({ project });
		else return res.status(400).send("Cannot find the project");
	} catch (err) {
		console.log(err.stack);
		return res.status(500).send({ msg: "Something went wrong. Please try again" });
	}
});

router.post("/", authroutes.authenticateToken, authroutes.authAdmin, async (req, res) => {
	let repoError = true;
	try {
		let body = req.body;
		let repo = await createRepo(req.user.git_token, req.user.client_id.organization, body.name);
		repoError = false
		const project = new Project({
			members: [req.user.id],
			project_lead: req.user.id,
			created_at: new Date().toLocaleString(),
			name: body.name,
			repo: repo.data.name,
			description: body.description,
			is_done: false,
			client_id: req.user.client_id,
		});

		project
			.save()
			.then((data) => {
				return res.status(200).send(data);
			})
			.catch((err) => {
				return res.status(500).send({ msg: "Something went wrong. Please try again" });
			});
	} catch (err) {
		if(repoError)
			return res.status(400).send({ msg: "Duplicate Project name. Please try again" });
		else
			return res.status(500).send({ msg: "Something went wrong. Please try again" });
	}
});

module.exports = router;
