const models = require('../models');

const { Highscore, Profile } = models;

const scoresPage = async (req, res) => {
  res.render('scoreboard');
};

// Checks the color of a specified user. Used for displaying the colors of the
// scoreboard (premium feature) -SJH
const getUserColor = async (req, res) => {
  const defaultColor = '#707070';

  const query = { username: req.body.username };
  const docs = await Profile.findOne(query).select('color premium').lean().exec();
  console.log(docs);

  // If no user matches that username, return default color -SJH
  if (!docs) {
    return res.status(200).json({ color: defaultColor });
  } if (docs.premium) { // User both exists and is premium: Send their color -SJH
    return res.status(200).json({ color: docs.color });
  }
  // User matched but does not have premium = default color -SJH
  return res.status(200).json({ color: defaultColor });
};

// Used to add a new score for this account, storing it if it's a highscore. -SJH
const addNewScore = async (req, res) => {
  const { account } = req.session;

  // Generate a JS object containing the data needed to make a new highscore object -SJH
  let highScoreData;

  // If an account cookie exists, then use the username of the logged-in account and
  // the session id to generate the score object server-side -SJH
  if (account) {
    highScoreData = {
      score: req.body.score,
      username: account.username,
      owner: account._id,
    };
  } else {
    // If there is no logged-in account, then the username for the highscore needs to
    // be passed in with the request body. -SJH
    highScoreData = {
      score: req.body.score,
      username: req.body.username,
    };
  }

  // Both username and highscore must exist -SJH
  if (!highScoreData.username || !highScoreData.score) {
    return res.status(400).json({ error: 'You must be logged in OR submit an alias to submit your score!' });
  }

  // Try to save the new highscore to the database -SJH
  try {
    const newHighscore = new Highscore(highScoreData);
    await newHighscore.save();
    // Send back response data to the client if it succeeded -SJH
    return res.status(201).json(
      { username: newHighscore.username, score: newHighscore.score },
    );
  } catch (err) {
    // Send back errors otherwise.
    console.log(err);
    // if (err.code === 11000) {
    //   return res.status(400).json({ error: 'Highscore already exists!' });
    // }
    return res.status(500).json({ error: 'An error occured making Highscore!' });
  }
};

// Returns the highscores associated with this account -SJH
const getMyHighscores = async (req, res) => {
  try {
    const query = { owner: req.session.account._id };
    const docs = await Highscore.find(query).select('createdDate score').lean().exec();
    return res.json({ highscores: docs });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ error: 'Error retrieving highscores!' });
  }
};

// Returns the top 20 scores (all players) -SJH
const getAllHighScores = async (req, res) => {
  try {
    // No search query because we want all highscore objects -SJH
    const docs = await Highscore.find({}).sort({ score: -1 }).limit(10).select('username score')
      .lean()
      .exec();
    return res.json({ highscores: docs });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ error: 'Error retrieving highscores!' });
  }
};

module.exports = {
  addNewScore,
  getMyHighscores,
  getAllHighScores,
  scoresPage,
  getUserColor,
};
