const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const { ObjectId } = Schema.Types;

const userstory_history = mongoose.Schema({    
    sprint_id: { type: ObjectId , ref: 'sprints'},
    attribute: { type: String, required: true },
    new_value: { type: String },
    old_value: { type: String },
    updated_by: { type: ObjectId, ref: 'users', required: true },
    timestamp: { type: String }
},
    { strict: true });

const userstory_history_Schema = mongoose.model('userstory_history', userstory_history);

module.exports = { UserStoryHistory: userstory_history_Schema };