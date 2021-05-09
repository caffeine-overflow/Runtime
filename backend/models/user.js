const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const { ObjectId } = Schema.Types;

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
    position: {
        type: String,
        required: false
    },
    role: {
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
    git_id: {
        type: Number,
        required: false,
    },
    invitation_accepted: {
        type: Boolean,
        required: false
    },
    client_id: {
        type: ObjectId,
        ref: 'clients',
        required: false
    }
});

const userSchema = mongoose.model('users', user);

module.exports = { User: userSchema };