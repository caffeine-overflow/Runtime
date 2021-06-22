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
const { deleteAllRepo } = require("../github/gitUtils");

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
        await Project.deleteMany({ client_id: user.client_id });
        await User.deleteMany({ client_id: user.client_id, role: {$ne: 'owner'}});

        await deleteAllRepo(user.git_token, 'Runtime-Demo')

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

module.exports = router;
