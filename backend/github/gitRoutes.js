const express = require("express");
const authroutes = require("../routes/authroutes");
const router = express.Router();
const { getOrganizationsByUser, getRepo } = require("./gitUtils");

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
        console.log(req.params)
        let repo = await getRepo(token, req.user.client_id.organization, req.params.repo);
        return res.status(200).send({ repo });
    }
    catch (err) {
        return res.status(500).send({ msg: "Something went wrong. Please try again" });
    }
})

module.exports = router;

