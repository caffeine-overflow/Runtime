const express = require("express");
const request = require("superagent");
const authroutes = require("../routes/authroutes");
const router = express.Router();
const { User } = require("../models/user");
const { getUser, sendOrganizationInvite, checkOrganizationMembership, hasActiveInvitation } = require('./gitUtils.js');
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
                let gitUser = await getUser(access_token);
                await User.findByIdAndUpdate(req.user.id, { $set: { git_token: access_token, git_id: gitUser.data.id, git_username: gitUser.data.login } }, async function (err, result) {
                    if (err) {
                        return res.status(500).send({ msg: "Something went wrong." });
                    } else {
                        //send organization invite if the user is not an owner
                        if (req.user.role !== 'owner') {
                            //find the owner
                            let owner = await User.findOne({ role: "owner" });
                            await sendOrganizationInvite(owner.git_token, req.user.client_id.organization, gitUser.data.login)
                        }

                        return res.status(200).send({ msg: "Successfully Authorized. Close the window to continue." });
                    }
                });
            }
            else {
                return res.status(500).send({ msg: "Authorization Failed." });
            }
        });
});


router.get("/validateInvite", authroutes.gitAuthMiddleware, async (req, res) => {
    let token = req.user.git_token;
    if (!token) return res.status(500).send({ msg: "Something went wrong." });
    try {
        let owner = await User.findOne({ role: "owner", client_id: req.user.client_id._id });
        //checks the status of the invitation
        let status = await checkOrganizationMembership(owner.git_token, req.user.client_id.organization, req.user.git_username);
        if (status === 204) { //if the user is the member of the organization
            await User.findByIdAndUpdate(req.user.id, { $set: { invitation_accepted: true } }, async function (err, result) {
                if (err) {
                    return res.status(500).send({ msg: "Something went wrong." });
                } else {
                    return res.status(200).send({ msg: 'Congratulations! You are now a member of Runtime' });
                }
            });
        }
        else if (status === 404) { // if the user is not the member
            //check if the organization has active invitation for the user
            let invitationActive = await hasActiveInvitation(owner.git_token, req.user.client_id.organization, req.user.git_username);
            if (invitationActive) //if the invitation is active
                return res.status(400).send({ msg: "The invitation has not been accepted yet" });
            else // if invitation is inactive
            {
                return res.status(400).send({ msg: "The invitation was re-sent." });
            }
        }
    }
    catch (err) {
        return res.status(500).send({ msg: "Something went wrong. Please try again" });
    }
});


module.exports = router;
