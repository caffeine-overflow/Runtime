const express = require("express");
const { UserStory } = require("../models/userstory.js");
const authroutes = require("../routes/authroutes");
const router = express.Router();
const { getOrganizationsByUser, getRepo, getAllBranches, createBranch, getBranchCommits, getPullRequestsByBranch } = require("./gitUtils");

router.get("/getOrganizations", authroutes.authAdmin, async (req, res) => {
    let token = req.user.git_token;
    if (!token) return res.status(500).send({ msg: "Something went wrong." });

    try {
        let organizationsdata = await getOrganizationsByUser(token);
        let organizations = [];
        organizationsdata.data.forEach(o => organizations.push({ label: o.login, value: o.login, role: o.login }));
        return res.status(200).send({ organizations });
    }
    catch (err) {
        return res.status(500).send({ msg: "Something went wrong. Please try again" });
    }
});

router.get("/getRepo/:repo", authroutes.authenticateToken, async (req, res) => {
    let token = req.user.git_token;
    if (!token) return res.status(500).send({ msg: "Something went wrong." });
    try {
        let repo = await getRepo(token, req.user.client_id.organization, req.params.repo);
        return res.status(200).send({ repo });
    }
    catch (err) {
        return res.status(500).send({ msg: "Something went wrong. Please try again" });
    }
})

router.get("/getAllBranches/:repo", authroutes.authenticateToken, async (req, res) => {
    let token = req.user.git_token;
    if (!token) return res.status(500).send({ msg: "Something went wrong." });
    try {
        let branches = await getAllBranches(token, req.user.client_id.organization, req.params.repo);
        return res.status(200).send({ branches });
    }
    catch (err) {
        return res.status(500).send({ msg: "Something went wrong. Please try again" });
    }
})

router.post("/createBranch", authroutes.authenticateToken, async (req, res) => {
    let token = req.user.git_token;
    if (!token) return res.status(500).send({ msg: "Something went wrong." });
    let { branchName, sha, repo } = req.body;
    try {

        //* create the branch in the github
        let newBranch = await createBranch(token, req.user.client_id.organization, repo, branchName, sha);

        //* add git branch sha to the user story
        if (newBranch.status === 422) {
            return res.status(500).send({ msg: "Branch with the same name exists!" });
        }
        else {
            await UserStory.findByIdAndUpdate(req.body.userStoryId,
                { $set: { git_branch: newBranch.data.ref.split('/')[2], git_branch_sha: newBranch.data.object.sha } },
                function (err, result) {
                    if (err) {
                        return res.status(500).send({ msg: "Something went wrong. Please try again!" });
                    } else {
                        return res.status(200).send({ newBranch });
                    }
                }
            );
        }
    }
    catch (err) {
        return res.status(500).send({ msg: "Something went wrong. Please try again" });
    }
})

router.get("/getCommitsByBranch", authroutes.authenticateToken, async (req, res) => {
    let token = req.user.git_token;
    if (!token) return res.status(500).send({ msg: "Something went wrong." });
    try {
        let { sha, repo } = req.query;
        let commits = await getBranchCommits(token, req.user.client_id.organization, repo, sha);
        return res.status(200).send({ commits });
    }
    catch (err) {
        return res.status(500).send({ msg: "Something went wrong. Please try again" });
    }
})

router.get("/getPullRequestByBranch", authroutes.authenticateToken, async (req, res) => {
    let token = req.user.git_token;
    if (!token) return res.status(500).send({ msg: "Something went wrong." });
    try {
        let { repo, head } = req.query;
        let pullrequests = await getPullRequestsByBranch(token, req.user.client_id.organization, repo, head);
        return res.status(200).send({ pullrequests });
    }
    catch (err) {
        return res.status(500).send({ msg: "Something went wrong. Please try again" });
    }
})


module.exports = router;

