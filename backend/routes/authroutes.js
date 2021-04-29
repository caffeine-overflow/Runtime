const express = require("express");
const request = require("superagent");
const router = express.Router();
const jwt = require("jsonwebtoken");
const { token_secret } = require("../config");
const bcrypt = require("bcrypt");
const { User } = require("../models/user.js");

//function to authenticate the token, act as a middleware
let authenticateToken = (req, res, next) => {
    //get the token
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];

    //return 403 if no token
    if (!token) return res.sendStatus(403);

    jwt.verify(token, token_secret, (err, user) => {
        if (err) return res.sendStatus(403);
        req.user = user;

        //move on from the middleware
        next();
    });
};

//route for authentication check
router.get("/validate", authenticateToken, async (req, res) => {
    return res.status(200).send({ msg: "Token validated." });
});

//login function
router.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body;
        const query = User.where({ email: email });
        let user = await query.findOne(function (
            err,
            user
        ) {
            if (err) return handleError(err);
            if (user) {
                return user;
            }
        });

        if (user && await bcrypt.compare(password, user.password)) {
            //create the json web tokens
            const userToken = { id: user._id, email: email, firstname: user.firstname, lastname: user.lastname };
            const access_token = jwt.sign(userToken, token_secret);
            return res.status(200).send({ access_token, 'user': user._id, 'name': `${user.firstname} ${user.lastname}` });
        } else return res.status(403).send({ msg: "Invalid Email or password" });
    } catch (err) {
        console.log(err.stack);
        return res.status(500).send({ msg: "Something went wrong. Please try again" });
    }
});

//register function
router.post("/register", async (req, res) => {
    try {
        const { firstname, lastname, email, password, phone, location, image } = req.body;
        const existingUser = await User.findOne({ email: email });
        if (existingUser) return res.status(400).send({ msg: "User already exists" });
        const salt = await bcrypt.genSalt();
        const hashedPassword = await bcrypt.hash(password, salt);
        const newUser = new User({ firstname: firstname, lastname: lastname, email: email, password: hashedPassword, phone: phone, location: location, image: image });
        newUser.save(function (err, newUser) {
            if (err) {
                console.error(err);
                return res.status(500).send({ msg: "Something went wrong. Please try again" });
            }
        });
        return res.status(200).send({ msg: "Account Created" });
    } catch (err) {
        console.log(err.stack);
        return res.status(500).send({ msg: "Something went wrong. Please try again" });
    }
});

//route for github callback
router.get("/git_callback", async (req, res) => {
    const { query } = req;
    const { code } = req.query;
    console.log(query, code);

    request
        .post('https://github.com/login/oauth/access_token')
        .send({
            client_id: 'fe04f90a54e050ce4ff6',
            client_secret: '23e75396d7bc5d19c19202d0246018fbf7b8489f',
            code: code
        })
        .set('Accept', 'application/json')
        .then((result) => {
            console.log("-------------------------");
            console.log(result.body);
            res.send({ success: true, data: result.body });
        });



});

module.exports = { router, authenticateToken };
