const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const chatGroup = mongoose.Schema({
    users: [{ type: Schema.Types.ObjectId, ref: 'users' }],
    last_msg_timestamp: { type: String, required: true },
    seen_by: { type: [String], default: [] }
}, { strict: true });

const chatGroupSchema = mongoose.model('chatGroup', chatGroup);

module.exports = { ChatGroup: chatGroupSchema };