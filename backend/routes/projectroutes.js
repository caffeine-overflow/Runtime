const express = require("express");
const router = express.Router();
const { Project } = require("../models/project.js");
const { User } = require("../models/user.js");
const { Sprint } = require("../models/sprint.js");
const { UserStory } = require("../models/userstory.js");
const authroutes = require("./authroutes");
const mongoose = require("mongoose");
const { createRepo, getAllRepo, addMember, removeMember, getAllMembers } = require("../github/gitUtils");
const errorHandler = require('../utils/errorhandler');
const sprint = require("../models/sprint.js");

router.get("/", authroutes.authenticateToken, async (req, res, next) => {
	try {
		let allRepoAccess = await getAllRepo(req.user.git_token, req.user.client_id.organization);
		allRepoAccess = allRepoAccess.data.map((repo) => repo.full_name.split("/")[1]);

		let projects = await Project.find({client_id: req.user.client_id, repo: { $in: allRepoAccess }}).populate("project_lead");
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

router.get("/report/:project_id", authroutes.authenticateToken, async (req, res, next) => {
	try {
		let project = await Project.findById(req.params.project_id).populate("project_lead");
		let owner = await User.findOne({ client_id: req.user.client_id._id, role: 'owner' });
		let members = await getAllMembers(owner.git_token, req.user.client_id.organization, project.repo);
		let membersIn = await User.find({ client_id: req.user.client_id._id, git_username: { $in: members } });
		let sprints = await Sprint.find({ project_id: req.params.project_id }).populate("created_by");
		let userStories = await UserStory.find({ project_id: req.params.project_id }).populate("created_by");
		let backlogs = userStories.filter(userstory => userstory.sprint_id === null)
		project._doc.doneStories = userStories.filter(userstory => userstory.state === "Done").length
		project._doc.testingStories = userStories.filter(userstory => userstory.state === "Testing").length
		project._doc.inProgressStories = userStories.filter(userstory => userstory.state === "In Progress").length
		project._doc.toDoStories = userStories.filter(userstory => userstory.state === "To Do").length
		project._doc.unassignedStories = userStories.filter(userstory => userstory.assigned_to === null).length
		sprints.forEach(sprint => sprint._doc.userStories = userStories.filter(userstory => userstory.sprint_id?.equals(sprint._id)))
	
		let timeSpent = { minutes: 0, hours: 0 }
		let timeEstimate = {minutes: 0, hours: 0}
		for (i in userStories) {
			let te = userStories[i].estimated_time.split(',')
			timeEstimate.hours += parseInt(te[0])
			timeEstimate.minutes += parseInt(te[1])
			if (userStories[i].time_spent) {
				let ts = userStories[i].time_spent.split(',')
				timeSpent.hours += parseInt(ts[0])
				timeSpent.minutes += parseInt(ts[1])
			}
		}


		timeSpent.hours += timeSpent.minutes / 60
		timeSpent.minutes = timeSpent.minutes % 60
		timeEstimate.hours += timeSpent.minutes / 60
		timeEstimate.minutes = timeSpent.minutes % 60

		membersIn.forEach(user => user.password = undefined)
		project._doc.members = membersIn
		project._doc.sprints = sprints;
		project._doc.backlogs = backlogs;
		project._doc.total_estimated_time = timeEstimate;
		project._doc.total_logged_time = timeSpent;
		return res.status(200).send({ project });
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
