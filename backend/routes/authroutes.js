const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const { token_secret, client_domain } = require("../config");
const bcrypt = require("bcrypt");
const { User } = require("../models/user.js");
const { sendEmail } = require('../utils/email');
const { welcomeEmail } = require("../utils/email_templates/welcome");
const { resetPassword } = require("../utils/email_templates/resetPassword");
const errorHandler = require('../utils/errorhandler');
const logger = require('../utils/logger');
//function to authenticate the token, act as a middleware
let authenticateToken = (req, res, next) => {
    //get the token
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];

    //return 403 if no token
    if (!token) return res.status(403).send({ msg: "Not Authorized" });

    jwt.verify(token, token_secret, async (err, user) => {
        if (!user || err) return res.status(403).send({ msg: "Not Authorized" });
        let tempUser = await User.findById(user.id).populate('client_id');
        if (tempUser.first_login || !!!tempUser.git_token) {
            return res.status(307).send({ msg: "Redirecting..." });
        }
        else if (tempUser.role === 'owner' && !tempUser.client_id) {
            return res.status(307).send({ msg: "Redirecting..." });
        }
        else if (tempUser.role !== 'owner' && !!!tempUser.invitation_accepted) {
            return res.status(307).send({ msg: "Redirecting..." });
        }
        req.user = tempUser;

        logger.infoLogger.info(req);
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
        let tempUser = await User.findById(user.id).populate('client_id');
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

        logger.infoLogger.info(req);
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
        logger.infoLogger.info(req);
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

        logger.infoLogger.info(req);
        //move on from the middleware
        next();
    });
};


let authToken = (req, res, next) => {
    //get the token
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];

    //return 403 if no token
    if (!token) return res.status(403).send({ msg: "Invalid Token" });

    jwt.verify(token, token_secret, async (err, user) => {
        if (!user || err) return res.status(403).send({ msg: "Invalid Token" });
        let tempUser = await User.findById(user.id).populate('client_id');
        if(tempUser.disabled) return res.status(403).send({ msg: "Not Authorized" });
        if(user.password !== tempUser.password) return res.status(403).send({ msg: "Expired Token" });
        
        req.user = tempUser;

        logger.infoLogger.info(req);
        //move on from the middleware
        next();
    });
};

//route for authentication check
router.get("/validate", authenticateToken, async (req, res) => {
    return res.status(200).send({ msg: "Token validated." });
});

//route for authentication check
router.get("/validate_url", authToken, async (req, res) => {
    return res.status(200).send({});
});

router.get("/authrenew_validate", authRenewToken, async (req, res) => {
    return res.status(200).send({ msg: "Token validated." });
});

//login function
router.post("/login", async (req, res, next) => {
    try {
        const { email, password } = req.body;
        let user = await User.where({ email: email, disabled: false }).findOne(
            function (err, result) {
                if (err) return handleError(err);
                if (result) {
                    req.user = result;
                    return result;
                }
            }).populate('client_id');

        if (user && await bcrypt.compare(password, user.password)) {
            //create the json web tokens
            const userToken = { id: user._id, email: email, firstname: user.firstname, lastname: user.lastname, role: user.role, invitationAccepted: user.invitation_accepted };
            const access_token = jwt.sign(userToken, token_secret);

            return res.status(200).send(
                {
                    access_token,
                    'user': user._id,
                    'name': `${user.firstname} ${user.lastname}`,
                    firstLogin: user.first_login,
                    validGitToken: !!user.git_token,
                    userRole: user.role,
                    invitationAccepted: user.invitation_accepted,
                    organization: user.client_id.organization
                }
            );
        }
        else return res.status(403).send({ msg: "Invalid Email or password" });

    } catch (err) {
        next(errorHandler(err, req, 500));
    }
});

//reset password
router.get("/reset_password/:email", async (req, res, next) => {
    try {
        let user = await User.findOne({ email: req.params.email })
        req.user = user
        if (!user) {
            return res.status(400).send({ msg: "User does not exist" });
        }
        else {
            //create the json web tokens
            const userToken = { id: user._id, email: user.email, password: user.password, firstname: user.firstname, lastname: user.lastname, role: user.role, invitationAccepted: user.invitation_accepted };
            const access_token = jwt.sign(userToken, token_secret);
            let link = client_domain + `ResetPassword?token=${access_token}`
            let htmlTemplate = resetPassword(`${user.firstname} ${user.lastname}`, link);
            sendEmail(htmlTemplate, user.email, "Runtime: Reset Password").catch(console.error);
            return res.status(200).send({});
        }
    }
    catch (err) {
        next(errorHandler(err, req, 500));
    }
});

//register function
router.post("/register", authenticateToken, async (req, res, next) => {
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
        next(errorHandler(err, req, 500));
    }
});

module.exports = { router, authenticateToken, authRenewToken, gitAuthMiddleware, authAdmin };
