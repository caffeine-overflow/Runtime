
const express = require("express");
const router = express.Router();
const { User } = require('../models/user.js');
const authroutes = require("./authroutes");

router.get("/", authroutes.authenticateToken, async (req, res) => {
    try {
        let users = await User.find({});
        res.status(200).send({ users });
    } catch (err) {
        console.log(err.stack);
    }
    
});

module.exports = router;
