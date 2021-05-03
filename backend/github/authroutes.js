const express = require("express");
const request = require("superagent");
const authroutes = require("../routes/authroutes");
const octokit = require("./instance");
const router = express.Router();
const { User } = require("../models/user");
const { Octokit } = require("@octokit/rest");

//route for github callback
router.get("/callback", async (req, res) => {
    const { query } = req;
    const { code, state } = req.query;
    request
        .post('https://github.com/login/oauth/access_token')
        .send({
            client_id: '9bf7686b61e73fbd065a',
            client_secret: '96c6add10bdf8ae41ab2b2c63cf7d6e13d2bbd35',
            code: code
        })
        .set('Accept', 'application/json')
        .then(async (result) => {
            let access_token = result.body.access_token;
            if (access_token) {
                await User.findByIdAndUpdate(state, { $set: { git_token: access_token } }, function (err, result) {
                    if (err) {
                        return res.status(500).send("Something went wrong. Cannot insert the user token");
                    } else {
                        return res.status(200).send("Successfully Authorized");
                    }
                });
            }
           //return res.status(500).send({ success: false, data: result.body });
        });
});

router.get("/authorized", authroutes.gitAuthMiddleware, async (req, res) => {
    try {
        console.log('data');
        let user = await User.findById(req.user.id);
        let octo = octokit(user.git_token);
        let { data } = await octo.request("/user");
        console.log(data);
        if(data.type == 'User')
            return res.status(200).send({ authorized: true });
    } catch (err) {
		console.error(err.stack)
		return res.status(500).send({msg:"Failed to authorize github" , authorized: false });
	}
});

module.exports = router ;
