const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const sprint = mongoose.Schema({
    name: { type: String, required: true},
    created_at: { type: String, required: true },
    start_date: { type: String },
    end_date: { type: String },
    is_done: { type: Boolean },
    description: { type: String },
    created_by: { type: Schema.Types.ObjectId, ref: 'users', required: true },
    project_id: { type: Schema.Types.ObjectId, ref: 'projects' },
},
{strict: true});

const sprintSchema = mongoose.model('sprints', sprint);

module.exports = { Sprint: sprintSchema };