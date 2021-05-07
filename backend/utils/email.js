"use strict";
const nodemailer = require("nodemailer");
const { runtime_email, runtime_password } = require("../config");

let sendEmail = async (htmlTemplate, email, subject) => {

    // create reusable transporter object using the default SMTP transport
    let transporter = nodemailer.createTransport({
        host: "smtp-mail.outlook.com", // hostname
        secureConnection: false, // TLS requires secureConnection to be false
        port: 587, // port for secure SMTP
        tls: {
            ciphers: 'SSLv3'
        },
        auth: {
            user: runtime_email,
            pass: runtime_password
        }
    });

    // send mail with defined transport object
    let info = await transporter.sendMail({
        from: `"Runtime App" <${runtime_email}>`,
        to: email, // list of receivers
        subject: subject,
        html: htmlTemplate
    });

    console.log("Message sent: %s", info.messageId);
}

module.exports = { sendEmail };