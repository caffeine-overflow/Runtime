const express = require("express");
const router = express.Router();
const { UserStory } = require("../models/userstory.js");
const { Project } = require("../models/project.js");
const { UserStoryHistory } = require("../models/userstory_history.js");
const { Sprint } = require("../models/sprint.js");
const authroutes = require("./authroutes");
const mongoose = require("mongoose");
mongoose.set('useFindAndModify', false);
const errorHandler = require('../utils/errorhandler');
const { Comment } = require("../models/comment.js");

router.get(
    "/bySprint/:sprint_id",
    authroutes.authenticateToken,
    async (req, res) => {
        try {

            let sprint_id = req.params.sprint_id;
            if (sprint_id === 'null') {
                sprint_id = undefined;
            }

            let userstories = await UserStory.find({ sprint_id })
                .populate("created_by")
                .populate("assigned_to")
                .populate("parent_task")
                .populate("sprint_id")
                .populate("project_id")
                .populate({ path: 'history', options: { sort: { 'timestamp': -1 } } })
            return res.status(200).send({ userstories });
        } catch (err) {
            next(errorHandler(err, req, 500));
        }
    }
);


router.get(
    "/unfinishedTask/:sprint_id",
    authroutes.authenticateToken,
    async (req, res) => {
        try {

            let sprint_id = req.params.sprint_id;
            if (sprint_id === 'null') {
                sprint_id = undefined;
            }

            let userstories = await UserStory.find({ sprint_id: sprint_id, state: { $ne: "Done" } })
                .populate("created_by")
                .populate("assigned_to")
                .populate("parent_task")
                .populate("sprint_id")
                .populate("project_id")
                .populate("history");
            return res.status(200).send({ userstories });
        } catch (err) {
            next(errorHandler(err, req, 500));
        }
    }
);

router.get(
    "/backlogs/:project_id",
    authroutes.authenticateToken,
    async (req, res, next) => {
        try {
            let project_id = req.params.project_id;
            let userstories = await UserStory.find({ project_id: project_id, sprint_id: null })
                .populate("created_by")
                .populate("assigned_to")
                .populate("parent_task")
                .populate("history");

            return res.status(200).send({ userstories });
        } catch (err) {
            next(errorHandler(err, req, 500));
        }
    }
);

router.post("/", authroutes.authenticateToken, async (req, res, next) => {
    try {
        let body = req.body;

        const userStoryHistory = await new UserStoryHistory({
            sprint_id: body.sprint_id,
            attribute: "user_story",
            new_value: "created",
            updated_by: req.user.id,
            timestamp: new Date().toLocaleString(),
        }).save();

        let project = await Project.findById(body.project_id);
        let identifierAcronym = project.name
            .split(/[\s_]/)
            .reduce((response, word) => (response += word.slice(0, 1) + word.slice(1, word.length).replace(/[^A-Z]/g, "")), "")
            .toUpperCase();

        //find the last instance to get the unique identifier
        let lastStory = (await UserStory.find({ project_id: body.project_id }).sort({ _id: -1 }).limit(1))[0];
        let lastStoryIdentifier = 0;
        if (lastStory) {
            lastStoryIdentifier = Number(lastStory.identifier.split("-")[1]) + 1;
        }
        let identifier = `${identifierAcronym}-${lastStoryIdentifier}`;

        //get the project
        const userstory = new UserStory({
            identifier: identifier,
            title: body.title,
            description: body.description,
            created_at: `${new Date().toLocaleDateString('en-CA')} ${new Date().toLocaleTimeString('en-CA')}`,
            created_by: req.user.id,
            assigned_to: body.assigned_to,
            estimated_time: body.estimated_time,
            time_spent: null,
            parent_task: body.parent_task,
            state: "To Do",
            history: [userStoryHistory._id],
            sprint_id: body.sprint_id,
            project_id: body.project_id
        });

        userstory
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


router.put(
    "/",
    authroutes.authenticateToken,
    async (req, res, next) => {
        try {
            let body = (req.body);
            let history = [];
            let userstory = await UserStory.findOne({ _id: body._id }).populate("sprint_id");

            for (const property in body) {
                if (property === '_id' || property === 'current_sprint') continue;
                let new_value = body[property];
                let old_value = null;
                if (property == "sprint_id") {
                    new_value = (await Sprint.findOne({ _id: body[property] })).name;
                    old_value = !userstory.sprint_id ? "Backlog" : userstory.sprint_id.name;
                }
                else if (property == "moveto_backlog") {
                    new_value = null;
                    old_value = userstory.sprint_id._id;
                }
                const userStoryHistory = await new UserStoryHistory({
                    sprint_id: body['current_sprint'],
                    attribute: property,
                    old_value: old_value ? old_value : userstory[property],
                    new_value: new_value,
                    updated_by: req.user.id,
                    timestamp: new Date().toLocaleString(),
                }).save();
                history.push(userStoryHistory._id);
            }

            userstory = await UserStory.findOne({ _id: body._id });
            userstory.history = [...userstory.history, ...history];
            userstory.title = body.hasOwnProperty('title') ? body.title : userstory.title;
            userstory.description = body.hasOwnProperty('description') ? body.description : userstory.description;
            userstory.assigned_to = body.hasOwnProperty('assigned_to') ? body.assigned_to : userstory.assigned_to;
            userstory.estimated_time = body.hasOwnProperty('estimated_time') ? body.estimated_time : userstory.estimated_time;
            userstory.time_spent = body.hasOwnProperty('time_spent') ? body.time_spent : userstory.time_spent;
            userstory.state = body.hasOwnProperty('state') ? body.state : userstory.state;

            /* 
               If move_to_backlog is true, set sprint id to null,
               If move_to_backlog is not there and sprint_id is there than set the sprint_id to the one you get from frontend
               else don't update it
            */

            userstory.sprint_id = body.moveto_backlog ? null : (body.hasOwnProperty('sprint_id') ? body.sprint_id : userstory.sprint_id);

            //change state to "todo" if moving to backlog
            if (body.moveto_backlog) {
                userstory.state = "To Do";
            }

            userstory
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
    }
);

router.post("/addComment", authroutes.authenticateToken, async (req, res, next) => {
    try {
        let body = req.body;
        let m = new Date();
        var dateString = m.getUTCFullYear() + "/" + (m.getUTCMonth() + 1) +
            "/" + m.getUTCDate() + " " + m.getUTCHours() + ":" + m.getUTCMinutes() +
            ":" + m.getUTCSeconds();

        const comment = new Comment({
            body: body.body,
            user: body.user,
            userstory: body.userStoryId,
            created_at: dateString
        });

        comment
            .save()
            .then(async (data) => {
                let comments = await Comment.find({ userstory: body.userStoryId }).populate("user");
                return res.status(200).send({ comments });
            })
            .catch((err) => {
                next(errorHandler(err, req, 500));
            });
    } catch (err) {
        next(errorHandler(err, req, 500));
    }
});

router.get("/comments/:userstoryid", authroutes.authenticateToken, async (req, res, next) => {
    try {

        let userstoryid = req.params.userstoryid;
        let comments = await Comment.find({ userstory: userstoryid }).populate("user");
        return res.status(200).send({ comments });

    } catch (err) {
        next(errorHandler(err, req, 500));
    }
}
);

module.exports = router;
