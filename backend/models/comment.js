const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const comment = mongoose.Schema({
    body: { type: String, required: true },
    user: { type: Schema.Types.ObjectId, ref: 'users', required: true },
    userstory: { type: Schema.Types.ObjectId, ref: 'userstories', required: true },
    created_at: { type: String, required: true }
}, { strict: true });

const commentSchema = mongoose.model('comments', comment);

module.exports = { Comment: commentSchema };