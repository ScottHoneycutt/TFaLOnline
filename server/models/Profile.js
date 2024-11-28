const mongoose = require('mongoose');
const _ = require('underscore');

// Helper method. Trims a string and preps it for HTML display. -SJH
const setUserName = (name) => _.escape(name).trim();

// Define what a profile includes. -SJH
const ProfileSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    trim: true,
    set: setUserName,
  },
  premium: {
    type: Boolean,
    default: false,
    required: false,
  },
  nickname: {
    type: String,
    required: true,
    trim: true,
    set: setUserName,
  },
  gamesPlayed: {
    type: Number,
    min: 0,
    required: true,
  },
  owner: {
    type: mongoose.Schema.ObjectId,
    required: true,
    ref: 'Account',
  },
  createdDate: {
    type: Date,
    default: Date.now,
  },
});

// Converts the highscore into just the data needed for the controller to send to the client -SJH
ProfileSchema.statics.toAPI = (doc) => ({
  gamesPlayed: doc.gamesPlayed,
  premium: doc.premium,
  username: doc.username,
  createdDate: doc.createdDate,
});

const ProfileModel = mongoose.model('Highscore', ProfileSchema);
module.exports = ProfileModel;
