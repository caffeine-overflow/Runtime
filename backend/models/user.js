const mongoose = require('mongoose');

const user = mongoose.Schema({
    firstname: {
        type: String,
        required: true
    },
    lastname: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    role: {
        type: String,
        required: false
    },
    password: {
        type: String,
        required: true
    },
    phone: {
        type: String,
        required: false
    },
    location: {
        type: String,
        required: false
    },
    image: {
        type: String,
        required: false
    },
    position: {
        type: String,
        required: false
    },
    first_login: {
        type: Boolean,
        required: false
    },
    git_token: {
        type: String,
        required: false,
    },
});

const userSchema = mongoose.model('users', user);

module.exports = { User: userSchema };