const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    userId: { type: String, required: true, unique: true },
    acceptedTerms: { type: Boolean, default: false },
    playedStories: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Story' }],
    correctStories: { type: Number, default: 0 },
    coins: { type: Number, default: 2 }, 
    supportServerJoined: { type: Boolean, default: false }, 
    botOwner: { type: Boolean, default: false } 
});

const User = mongoose.model('User', userSchema);

module.exports = User;
