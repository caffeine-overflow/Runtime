const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const chatMessage = mongoose.Schema({
    group_id: { type: Schema.Types.ObjectId, ref: 'chatGroup', required: true },
    author: { type: Schema.Types.ObjectId, ref: 'users', required: true },
    created_at: { type: String, required: true },
    content: { type: String, required: true }
}, { strict: true, timestamps: true });

const chatMessageSchema = mongoose.model('chatMessage', chatMessage);

module.exports = { ChatMessage: chatMessageSchema };