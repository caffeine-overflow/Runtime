const express = require("express");
const router = express.Router();
const { ChatGroup } = require("../models/chatGroup.js");
const authroutes = require("./authroutes");
const errorHandler = require('../utils/errorhandler');

router.get("/getAll", authroutes.authenticateToken, async (req, res, next) => {
    try {
        let chatgroups = await ChatGroup.find({ 'users': req.user._id }).populate("users");
        return res.status(200).send({ chatgroups });
    } catch (err) {
        next(errorHandler(err, req, 500));
    }
});

module.exports = router;