const express = require("express");
const router = express.Router();
const { Sprint } = require("../models/sprint.js");
const { UserStory } = require("../models/userstory.js");
const { UserStoryHistory } = require("../models/userstory_history.js");
const authroutes = require("./authroutes");
const mongoose = require("mongoose");
mongoose.set('useFindAndModify', false);

router.get("/allByProjectId/:project_id", authroutes.authenticateToken, async (req, res) => {
	try {
		let sprints = await Sprint.find({ project_id: req.params.project_id }).populate("created_by");
		res.status(200).send({ sprints });
	} catch (err) {
		console.error(err.stack);
		res.status(500).send({ msg: "Something went wrong. Please try again" });
	}
});

router.post("/", authroutes.authenticateToken, async (req, res) => {
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

			body.user_stories.forEach(async (task_detail) => {
				let userstory = await UserStory.findById(task_detail.id);
				for (const property in task_detail) {
					if (property == "_id") continue;
					let new_value = task_detail[property];
					let old_value = userstory[property];
					if (property == "moveto_backlog") {
						new_value = task_detail["moveto_backlog"] ? null : sprint.name;
						old_value = current_sprint.name;
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
				userstory.estimated_time = body.estimated_time ? body.estimated_time : userstory.estimated_time;
				userstory.sprint_id = task_detail["moveto_backlog"] ? null : sprint._id;
				//change state to "todo" if moving to backlog
				if (task_detail["moveto_backlog"]) {
					userstory.state = "To Do";
				}
				userstory.save();
			});
			current_sprint.save();
		}
		sprint
			.save()
			.then((data) => {
				res.status(200).send({ msg: 'Sprint Created Succesfully' });
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

router.get("/generateReport", authroutes.authenticateToken, async (req, res) => {
	//generate report here
});

module.exports = router;
