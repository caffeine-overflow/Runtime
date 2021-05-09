const mongoose = require('mongoose');

const client = mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    organization: {
        type: Object,
        required: true
    }
});

const clientSchema = mongoose.model('clients', client);

module.exports = { Client: clientSchema };