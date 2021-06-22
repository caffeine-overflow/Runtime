const express = require("express");
const router = express.Router();
const { User } = require("../models/user.js");
const { UserStory } = require("../models/userstory.js");
const { Project } = require("../models/project.js");
const { Sprint } = require("../models/sprint.js");
const { UserStoryHistory } = require("../models/userstory_history.js");
const errorHandler = require("../utils/errorhandler");
const jwt = require("jsonwebtoken");
const { token_secret } = require("../config");
const { deleteAllRepo, createRepo } = require("../github/gitUtils");

router.get("/", async (req, res, next) => {
    try {
        let user = await User.findOne({ email: "demo.runtime@gmail.com" },
            function (err, result) {
                  if (err) return handleError(err);
                  if (result) {
                      req.user = result;
                      return result;
                  }
            }
        )

        let projects = await Project.find({client_id: user.client_id })
        projects = Array.from(projects, x => x._id)

        let userStories = await UserStory.find({ project_id: { $in: projects }})
        let userStoryHistories = Array.from(userStories, x => x.history).reduce((a, b) => a.concat(b), [])

        await UserStoryHistory.deleteMany({ _id: { $in: userStoryHistories } });
        await UserStory.deleteMany({ project_id: { $in: projects } });
        await Sprint.deleteMany({ project_id: { $in: projects } });
        await Project.deleteMany({ client_id: user.client_id, name: { $ne: 'Demo_Project' }});
        await User.deleteMany({ client_id: user.client_id, role: {$ne: 'owner'}});

        await deleteAllRepo(user.git_token, 'Runtime-Demo')
        await fillDefault(user)
        const userToken = {
            id: user._id,
            email: user.email,
            firstname: user.firstname,
            lastname: user.lastname,
            role: user.role,
            invitationAccepted: user.invitation_accepted,
        };
        const access_token = jwt.sign(userToken, token_secret);
        return res.status(200).send({
            access_token,
            user: user._id,
            name: `${user.firstname} ${user.lastname}`,
            firstLogin: user.first_login,
            validGitToken: !!user.git_token,
            userRole: user.role,
            invitationAccepted: user.invitation_accepted,
            organization: user.client_id?.organization,
        });
    } catch (err) {
        next(errorHandler(err, req, 500));
    }
});

let fillDefault = async (user) => {
    let project = await Project.findOneAndUpdate({ client_id: user.client_id, name:'Demo_Project' },{ members: [user._id], project_lead: user._id})
    const sprint = await new Sprint({
        created_at: new Date().toLocaleString(),
        start_date: new Date().toLocaleString(),
        end_date: null,
        name: 'Demo Sprint',
        description: 'This is a Demo Sprint for Trial. You can create a new Sprint by clicking on "Create New Sprint" or view the sprint by clicking on "Active Sprint" on the left side of the screen',
        is_done: false,
        created_by: user.id,
        project_id: project._id,
    }).save();
    
    const userStoryHistory = await new UserStoryHistory({
        sprint_id: sprint._id,
        attribute: "user_story",
        new_value: "created",
        updated_by: user.id,
        timestamp: new Date().toLocaleString(),
    }).save();

    const userstory = await new UserStory({
        identifier: `DP-0`,
        title: 'Demo User Story',
        description: 'This is a Trial User Story. You can create a new user Story by clicking on "Create User Story" on the left side of the screen',
        created_at: new Date().toLocaleString(),
        created_by: user.id,
        assigned_to: null,
        estimated_time: '5,0',
        time_spent: null,
        parent_task: null,
        state: "To Do",
        history: [userStoryHistory._id],
        sprint_id: sprint._id,
        project_id: project._id
    }).save();
}
module.exports = router;
