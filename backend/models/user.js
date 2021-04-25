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
});

const userSchema = mongoose.model('users', user);

module.exports = { User: userSchema };