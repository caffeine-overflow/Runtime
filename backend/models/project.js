const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const project = mongoose.Schema({
    members: [{ type: Schema.Types.ObjectId, ref: 'users' }],
    project_lead: { type: Schema.Types.ObjectId, ref: 'users', required: true },
    client_id: { type: Schema.Types.ObjectId, ref: 'clients', required: true },
    created_at: { type: String, required: true },
    name: { type: String, required: true },
    repo: { type: String, required: true },
    description: { type: String },
    is_done: { type: Boolean },
},
    { strict: true });

const projectSchema = mongoose.model('projects', project);

module.exports = { Project: projectSchema };