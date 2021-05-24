const express = require("express");
const router = express.Router();
const { Project } = require("../models/project.js");
const authroutes = require("./authroutes");
const mongoose = require("mongoose");
const { createRepo, getAllRepo } = require("../github/gitUtils");
const errorHandler = require('../utils/errorhandler');

router.get("/", authroutes.authenticateToken, async (req, res, next) => {
	try {
		let allRepoAccess = await getAllRepo(req.user.git_token);
		allRepoAccess = allRepoAccess.data
			.filter((repo) => repo.full_name.includes(req.user.client_id.organization))
			.map((repo) => repo.full_name.split("/")[1]);

		let projects = await Project.find({ repo: { $in: allRepoAccess } }).populate("project_lead");
		return res.status(200).send({ projects });
	} catch (err) {
		next(errorHandler(err,req,500));
	}
});

router.get("/byProjectId/:project_id", authroutes.authenticateToken, async (req, res, next) => {
	try {
		let project = await Project.findById(req.params.project_id)
			.populate("members")
			.populate("project_lead");
		if (project) return res.status(200).send({ project });
		else return res.status(400).send("Cannot find the project");
	} catch (err) {
		next(errorHandler(err,req,500));
	}
});

router.post("/", authroutes.authenticateToken, authroutes.authAdmin, async (req, res,next) => {
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
				next(errorHandler(err,req,500));
			});
	} catch (err) {
		next(errorHandler(err,req,500));
	}
});

module.exports = router;
