const express = require("express");
const router = express.Router();
const { Project } = require("../models/project.js");
const authroutes = require("./authroutes");
const mongoose = require("mongoose");
const { createRepo } = require("../github/gitUtils");
const errorHandler = require('../utils/errorhandler');

router.get("/", authroutes.authenticateToken, async (req, res, next) => {
	try {
		let projects = await Project.find({})
			.populate("members")
			.populate("project_lead");
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
	try {
		let body = req.body;
		const project = new Project({
			members: [req.user.id],
			project_lead: req.user.id,
			created_at: new Date().toLocaleString(),
			name: body.name,
			description: body.description,
			is_done: false,
			client_id: req.user.client_id,
		});

		project
			.save()
			.then(async (data) => {
				let repoName = body.name
				let resp = await createRepo(req.user.git_token, req.user.client_id.organization, repoName);
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
