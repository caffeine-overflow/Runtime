const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const team = mongoose.Schema({
    members: [{ type: Schema.Types.ObjectId, ref: 'users' }],
    team_lead: { type: Schema.Types.ObjectId, ref: 'users' },
    created_at: { type: String, required: true },
    name: { type: String, required: true},
    description: { type: String, required: true },
},
{strict: true}); //idk strict sounds good

const teamSchema = mongoose.model('teams', team);

module.exports = { Team: teamSchema };