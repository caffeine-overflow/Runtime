const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const { token_secret } = require("../config");
const bcrypt = require("bcrypt");
const { User } = require("../models/user.js");
const { sendEmail } = require('../utils/email');
const { welcomeEmail } = require("../utils/email_templates/welcome");


//function to authenticate the token, act as a middleware
let authenticateToken = (req, res, next) => {
    //get the token
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];

    //return 403 if no token
    if (!token) return res.status(403).send({ msg: "Not Authorized" });

    jwt.verify(token, token_secret, async (err, user) => {
        if (!user || err) return res.status(403).send({ msg: "Not Authorized" });
        let tempUser = await User.findById(user.id);
        if (tempUser.first_login || !!!tempUser.git_token) {
            return res.status(307).send({ msg: "Redirecting..." });
        }
        else if (tempUser.role === 'owner' && !tempUser.client_id)
        {
            return res.status(307).send({ msg: "Redirecting..." });
        }
        else if (tempUser.role !== 'owner' && !!!tempUser.invitation_accepted) {
            return res.status(307).send({ msg: "Redirecting..." });
        }
        req.user = tempUser;

        //move on from the middleware
        next();
    });
};

let authRenewToken = (req, res, next) => {
    //get the token
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];

    //return 403 if no token
    if (!token) return res.status(403).send({ msg: "Not Authorized" });

    jwt.verify(token, token_secret, async (err, user) => {
        if (!user || err) return res.status(403).send({ msg: "Not Authorized" });
        let tempUser = await User.findById(user.id);
        if (!tempUser.first_login && !!tempUser.git_token) {
            if (tempUser.role === 'owner') {
                if (!!tempUser.client_id)
                    return res.status(307).send({ msg: "Redirecting..." });
            }
            else {
                if (!!tempUser.invitation_accepted)
                    return res.status(307).send({ msg: "Redirecting..." });
            }
        }
        req.user = tempUser;

        //move on from the middleware
        next();
    });
};

let authAdmin = (req, res, next) => {
    //get the token
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];

    //return 403 if no token
    if (!token) return res.status(403).send({ msg: "Not Authorized" });

    jwt.verify(token, token_secret, async (err, user) => {
        if (!user || err) return res.status(403).send({ msg: "Not Authorized" });
        let tempUser = await User.findById(user.id).populate('client_id');
        if (tempUser.role !== "owner" && tempUser.role !== "admin")
            return res.status(403).send({ msg: "Not Authorized." });

        req.user = tempUser;
        //move on from the middleware
        next();
    });
};

let gitAuthMiddleware = (req, res, next) => {
    //get the token
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];

    //return 403 if no token
    if (!token) return res.status(403).send({ msg: "Not Authorized" });

    jwt.verify(token, token_secret, async (err, user) => {
        if (!user || err) return res.status(403).send({ msg: "Not Authorized" });
        let tempUser = await User.findById(user.id).populate("client_id");
        req.user = tempUser;

        //move on from the middleware
        next();
    });
};

//route for authentication check
router.get("/validate", authenticateToken, async (req, res) => {
    return res.status(200).send({ msg: "Token validated." });
});

router.get("/authrenew_validate", authRenewToken, async (req, res) => {
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
            const userToken = { id: user._id, email: email, firstname: user.firstname, lastname: user.lastname, role: user.role, invitationAccepted: user.invitation_accepted};
            const access_token = jwt.sign(userToken, token_secret);
            return res.status(200).send(
                {
                    access_token, 'user': user._id,
                    'name': `${user.firstname} ${user.lastname}`,
                    firstLogin: user.first_login,
                    validGitToken: !!user.git_token,
                    userRole: user.role,
                    invitationAccepted: user.invitation_accepted
                }
            );
        } else return res.status(403).send({ msg: "Invalid Email or password" });
    } catch (err) {
        console.log(err.stack);
        return res.status(500).send({ msg: "Something went wrong. Please try again" });
    }
});

//register function
router.post("/register", authenticateToken, async (req, res) => {
    try {
        const { firstname, lastname, email, phone, location, image } = req.body;

        const existingUser = await User.findOne({ email: email });
        if (existingUser) {
            return res.status(400).send({ msg: "User already exists" });
        }

        let password = Math.random().toString(36).substring(2, 8) + (Math.random() * 100).toFixed();
        const salt = await bcrypt.genSalt();
        const hashedPassword = await bcrypt.hash(password, salt);
        const newUser = new User({
            firstname: firstname,
            lastname: lastname,
            email: email,
            password: hashedPassword,
            phone: phone,
            location: location,
            image: image,
            first_login: true,
            git_token: null,
        });

        newUser.save(function (err) {
            if (err) {
                return res.status(500).send({ msg: "Something went wrong. Please try again" });
            }
            else {
                let htmlTemplate = welcomeEmail(`${firstname} ${lastname}`, email, password);
                sendEmail(htmlTemplate, email, "Welcome").catch(console.error);
                return res.status(200).send({ msg: "Account Created" });
            }
        });
    } catch (err) {
        return res.status(500).send({ msg: "Something went wrong. Please try again" });
    }
});

module.exports = { router, authenticateToken, authRenewToken, gitAuthMiddleware, authAdmin };
