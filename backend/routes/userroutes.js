
const express = require("express");
const router = express.Router();
const { User } = require('../models/user.js');
// import { db_connection } from '../config';
// const mongoose = require('mongoose');
// mongoose.connect(db_connection, {useNewUrlParser: true, useUnifiedTopology: true});

router.get("/", async (req, res) => {
    try {
        let users = await User.find({});
        res.status(200).send({ users });
    } catch (err) {
        console.log(err.stack);
    }
    
});

router.get("/:email", async(req, res) => {
    try {
        console.log(req);
        const query  = User.where({ email: req.query.email });
        let user = await query.findOne(function (err, user) {
            if (err) return handleError(err);
            if (user) {
                return user;
            }
        });
        res.status(200).send({ user });
    } catch (err) {
        console.log(err.stack);
    }
})

router.post("/", async (req, res) => {
    try {
        const user = new User({
            "firstname": "fdfd",
            "lastname": "fdfdfd",
            "email": "fdfd",
            "password": "fdfd",
            "token": "Fdfd"
        })

        user.save()
            .then(data => {
                res.json(data)
            })
            .catch(err => {
                res.json({ "message": err })
            })


    } catch (err) {
        console.log(err.stack);
    }
});

module.exports = router;
