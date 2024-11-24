const mongoose = require('mongoose');
const _ = require('underscore');

// Helper method. Trims a string and preps it for HTML display. -SJH
const setUserName = (name) => _.escape(name).trim();

// Define what a highscore includes. -SJH
const HighscoreSchema = new mongoose.Schema({
  score: {
    type: Number,
    min: 0,
    required: true,
  },
  username: {
    type: String,
    required: true,
    trim: true,
    set: setUserName,
  },
  owner: {
    type: mongoose.Schema.ObjectId,
    required: false,
    ref: 'Account',
  },
  createdDate: {
    type: Date,
    default: Date.now,
  },
});

// Converts the highscore into just the data needed for the controller to send to the client -SJH
HighscoreSchema.statics.toAPI = (doc) => ({
  score: doc.score,
  username: doc.username,
  createdDate: doc.createdDate
});

const HighscoreModel = mongoose.model('Highscore', HighscoreSchema);
module.exports = HighscoreModel;
