const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const chatGroup = mongoose.Schema({
    users: [{ type: Schema.Types.ObjectId, ref: 'users' }]
}, { strict: true });

const chatSchema = mongoose.model('chatGroup', chatGroup);

module.exports = { Chat: chatSchema };