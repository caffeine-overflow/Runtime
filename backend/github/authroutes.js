const express = require("express");
const request = require("superagent");
const authroutes = require("../routes/authroutes");
const octokit = require("./instance");
const router = express.Router();
const { User } = require("../models/user");
const { github_client_id, github_client_secret } = require("../config");

//route for github callback
router.get("/get_token", authroutes.gitAuthMiddleware, async (req, res) => {
    request
        .post('https://github.com/login/oauth/access_token')
        .send({
            client_id: github_client_id,
            client_secret: github_client_secret,
            code: req.query.code
        })
        .set('Accept', 'application/json')
        .then(async (result) => {
            let access_token = result.body.access_token;
            if (access_token) {
                await User.findByIdAndUpdate(req.user.id, { $set: { git_token: access_token } }, function (err, result) {
                    if (err) {
                        return res.status(500).send({ msg: "Something went wrong. Cannot insert the user token" });
                    } else {
                        return res.status(200).send({ msg: "Successfully Authorized. Close the window to continue."});
                    }
                });
            }
            else {
                return res.status(500).send({ msg: "Authorization Failed." });
            }
        });
});

router.get("/authorized", authroutes.gitAuthMiddleware, async (req, res) => {
    try {
        let user = await User.findById(req.user.id);
        let octo = octokit(user.git_token);
        let { data } = await octo.request("/user");
        if (data.type == 'User')
            return res.status(200).send({ authorized: true });
    } catch (err) {
        console.error(err.stack)
        return res.status(500).send({ msg: "Failed to authorize github", authorized: false });
    }
});

module.exports = router;
