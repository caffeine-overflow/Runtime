const express = require("express");
const router = express.Router();
const { Sprint } = require("../models/sprint.js");
const { UserStory } = require("../models/userstory.js");
const { UserStoryHistory } = require("../models/userstory_history.js");
const authroutes = require("./authroutes");
const mongoose = require("mongoose");
mongoose.set('useFindAndModify', false);
const errorHandler = require('../utils/errorhandler');

router.get("/allByProjectId/:project_id", authroutes.authenticateToken, async (req, res,next) => {
	try {
		let sprints = await Sprint.find({ project_id: req.params.project_id }).populate("created_by");
		return res.status(200).send({ sprints });
	} catch (err) {
		next(errorHandler(err,req,500));
	}
});

router.post("/", authroutes.authenticateToken, async (req, res,next) => {
	try {
		let body = req.body;
		let history = [];
		let current_sprint = await Sprint.findById(body.sprint_id);
		const sprint = new Sprint({
			created_at: new Date().toLocaleString(),
			start_date: new Date().toLocaleString(),
			end_date: null,
			name: body.name,
			description: body.description,
			is_done: false,
			created_by: req.user.id,
			project_id: body.project_id,
		});

		if (current_sprint) {
			current_sprint.is_done = true;
			current_sprint.end_date = new Date().toLocaleString();
			//used old school for loop because, the map or foreach was behaving weird as async
			for (const i in body.user_stories) {
				task_detail = body.user_stories[i]
				let userstory = await UserStory.findById(task_detail._id);
				for (const property in task_detail) {
					if (property == "_id") continue;
					let new_value = task_detail[property];
					let old_value = userstory[property];
					if (property == "moveto_backlog") {
						new_value = task_detail["moveto_backlog"] ? null : `${sprint._id},${sprint.name}`;
						old_value = `${current_sprint._id},${current_sprint.name}`
					}
					const userStoryHistory = await new UserStoryHistory({
						sprint_id: current_sprint._id,
						attribute: property === "moveto_backlog" && !task_detail["moveto_backlog"] ? "sprint_id" : property,
						old_value: old_value,
						new_value: new_value,
						updated_by: req.user.id,
						timestamp: new Date().toLocaleString(),
					}).save();
					history.push(userStoryHistory._id);
				}
				userstory.history = [...userstory.history, ...history];
				userstory.estimated_time = task_detail.hasOwnProperty("estimated_time") ? task_detail.estimated_time : userstory.estimated_time;
				userstory.sprint_id = task_detail["moveto_backlog"] ? null : sprint._id;
				//change state to "todo" if moving to backlog
				if (task_detail["moveto_backlog"]) {
					userstory.state = "To Do";
				}
				await userstory.save()
				history = []
			};
			await current_sprint.save();
		}
		sprint
			.save()
			.then((data) => {
				return res.status(200).send({ msg: 'Sprint Created Succesfully' });
			})
			.catch((err) => {
				next(errorHandler(err,req,500));
			});
	} catch (err) {
		next(errorHandler(err,req,500));
	}
});


router.get("/report/:sprint_id", authroutes.authenticateToken, async (req, res, next) => {
	try {
		let sprint = await Sprint.findById(req.params.sprint_id).populate("created_by");
		let userStories = await UserStory.find({ sprint_id: sprint._id })
			.populate("created_by")
			.populate("parent_task")
			.populate("assigned_to")
			.populate({ path: "userstory_history", populate: "updated_by" });
		sprint._doc.doneStories = userStories.filter((userstory) => userstory.state === "Done").length;
		sprint._doc.testingStories = userStories.filter((userstory) => userstory.state === "Testing").length;
		sprint._doc.inProgressStories = userStories.filter((userstory) => userstory.state === "In Progress").length;
		sprint._doc.toDoStories = userStories.filter((userstory) => userstory.state === "To Do").length;
		sprint._doc.unassignedStories = userStories.filter((userstory) => userstory.assigned_to === null).length;
		let backlogs = await UserStory.find({ sprint_id: null, project_id: sprint.project_id }).populate("created_by");
		let timeSpent = { minutes: 0, hours: 0 };
		let timeEstimate = { minutes: 0, hours: 0 };
		for (i in userStories) {
			let te = userStories[i].estimated_time.split(",");
			timeEstimate.hours += parseInt(te[0]);
			timeEstimate.minutes += parseInt(te[1]);
			if (userStories[i].time_spent) {
				let ts = userStories[i].time_spent.split(",");
				timeSpent.hours += parseInt(ts[0]);
				timeSpent.minutes += parseInt(ts[1]);
			}
		}

		timeSpent.hours += timeSpent.minutes / 60;
		timeSpent.minutes = timeSpent.minutes % 60;
		timeEstimate.hours += timeSpent.minutes / 60;
		timeEstimate.minutes = timeSpent.minutes % 60;

		sprint._doc.backlogs = backlogs;
		sprint._doc.total_estimated_time = timeEstimate;
		sprint._doc.total_logged_time = timeSpent;
		return res.status(200).send({ sprint });
	} catch (err) {
		next(errorHandler(err, req, 500));
	}
});
module.exports = router;
