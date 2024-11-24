const models = require('../models');

const { Highscore } = models;

const scoresPage = async (req, res) => {
  res.render('scoreboard');
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
    return res.status(400).json({ error: 'Missing score field or username!' });
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
    if (err.code === 11000) {
      return res.status(400).json({ error: 'Highscore already exists!' });
    }
    return res.status(500).json({ error: 'An error occured making Highscore!' });
  }
};

// Returns the highscores associated with this account -SJH
const getMyHighscores = async (req, res) => {
  try {
    const query = { owner: req.session.account._id };
    const docs = await Highscore.find(query).select('username score').lean().exec();
    return res.json({ highscores: docs });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ error: 'Error retrieving highscores!' });
  }
};

// Returns all highscores -SJH
const getAllHighScores = async (req, res) => {
  try {
    // No search query because we want all highscore objects -SJH
    const docs = await Highscore.find({}).sort({ score: -1 }).select('username score').lean()
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
};
