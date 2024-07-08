const mongoose = require('mongoose');

const storySchema = new mongoose.Schema({
    title: String,
    description: String,
    events: [String],
    evidence: [String],
    witnesses: [String],
    suspects: [String],
    correctGuilty: String
});

module.exports = mongoose.model('Story', storySchema);
