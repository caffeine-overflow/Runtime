const express = require("express");
const router = express.Router();
const { Project } = require("../models/project.js");
const { User } = require("../models/user.js");
const authroutes = require("./authroutes");
const mongoose = require("mongoose");
const { createRepo, getAllRepo, addMember, removeMember, getAllMembers } = require("../github/gitUtils");
const errorHandler = require('../utils/errorhandler');

router.get("/", authroutes.authenticateToken, async (req, res, next) => {
	try {
		// let allRepoAccess = await getAllRepo(req.user.git_token);
		// allRepoAccess = allRepoAccess.data
		// 	.filter((repo) => repo.full_name.includes(req.user.client_id.organization))
		// 	.map((repo) => repo.full_name.split("/")[1]);

		let projects = await Project.find({}).populate("project_lead");
		return res.status(200).send({ projects });
	} catch (err) {
		next(errorHandler(err, req, 500));
	}
});

router.get("/members/:project_id", authroutes.authenticateToken, async (req, res, next) => {
	try {
		let project = await Project.findById(req.params.project_id)
		let owner = await User.findOne({ client_id: req.user.client_id._id, role: 'owner' })
		let members = await getAllMembers(owner.git_token, req.user.client_id.organization, project.repo)
		let membersIn = await User.find({ client_id: req.user.client_id._id, git_username: { $in: members } });
		let membersNotIn = await User.find({ client_id: req.user.client_id._id, git_username: { $nin: members }, invitation_accepted: true });
		membersIn.forEach(user => user.password = undefined)
		membersNotIn.forEach(user => user.password = undefined)
		return res.status(200).send({ membersIn, membersNotIn });
	} catch (err) {
		next(errorHandler(err, req, 500));
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
		next(errorHandler(err, req, 500));
	}
});

router.post("/", authroutes.authAdmin, async (req, res, next) => {
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
				next(errorHandler(err, req, 500));
			});
	} catch (err) {
		next(errorHandler(err, req, 500));
	}
});

router.put("/addMember", authroutes.authAdmin, async (req, res, next) => {
	try {
		let body = req.body;
		let project = await Project.findById(body.project_id)
		let user = await User.findById(body.user_id)
		await addMember(req.user.git_token, req.user.client_id.organization, project.repo, user.git_username)
		return res.status(200).send({ msg: "Successfully added the member" });
	} catch (err) {
		next(errorHandler(err, req, 500));
	}
});

router.delete("/removeMember", authroutes.authAdmin, async (req, res, next) => {
	try {
		let body = req.body;
		let project = await Project.findById(body.project_id)
		let user = await User.findById(body.user_id)
		await removeMember(req.user.git_token, req.user.client_id.organization, project.repo, user.git_username)
		return res.status(200).send({ msg: "Successfully removed the member" });
	} catch (err) {
		next(errorHandler(err, req, 500));
	}
});

module.exports = router;
