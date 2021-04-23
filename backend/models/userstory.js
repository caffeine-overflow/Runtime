const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const { ObjectId } = Schema.Types;

const userstory = mongoose.Schema({
    identifier: { type: String, required: true, required: true },
    title: { type: String, required: true },
    description: { type: String },
    created_at: { type: String, required: true },
    created_by: { type: ObjectId, ref: 'users', required: true },
    assigned_to: { type: ObjectId, ref: 'users' },
    estimated_time: { type: String },
    time_spent: { type: String },
    parent_task: { type: ObjectId, ref: 'userstories' },
    history: [{ type: ObjectId, ref: 'userstory_history' }],
    state: { type: String, required: true },
    project_id: { type: ObjectId, ref: 'projects', required: true },
    sprint_id: { type: ObjectId, ref: 'sprints' }
},
    { strict: true });

const userstorySchema = mongoose.model('userstories', userstory);

module.exports = { UserStory: userstorySchema };