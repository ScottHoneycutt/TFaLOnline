const models = require('../models');

const { Account, Profile } = models;

// Sends back the login page -SJH
const loginPage = (req, res) => res.render('login');

// Sends back the account page -SJH
const accountPage = (req, res) => res.render('account');

// Sends back the change password page -SJH
const changePasswordPage = (rez, res) => res.render('changePass');

// Logs the user out of their account -SJH
const logout = (req, res) => {
  req.session.destroy();
  return res.redirect('/');
};

// Called when a client tries to login -SJH
const login = (req, res) => {
  const username = `${req.body.username}`;
  const pass = `${req.body.pass}`;

  // Ensure both params are passed in -SJH
  if (!username || !pass) {
    return res.status(400).json({ error: 'All fields are required!' });
  }
  // Check to see if the account credentials are correct -SJH
  return Account.authenticate(username, pass, (err, account) => {
    if (err || !account) {
      return res.status(401).json({ error: 'Wrong username or password!' });
    }

    // Creating login session -SJH
    req.session.account = Account.toAPI(account);
    return res.json({ redirect: '/account' });
  });
};

// Called when the user wants to change their password. -SJH
const changePassword = async (req, res) => {
  const { username } = req.session.account;
  const pass = `${req.body.pass}`;
  const pass2 = `${req.body.pass2}`;

  // Two replacement passwords must be sent -SJH
  if (!pass || !pass2) {
    return res.status(400).json({ error: 'All fields are required!' });
  }
  // 2 input passwords must match -SJH
  if (pass !== pass2) {
    return res.status(400).json({ error: 'Passwords do not match!' });
  }

  // Get the account back from MonogDB -SJH
  const query = { username };
  const doc = await Account.findOne(query).lean().exec();
  try {
    // Apply changed password and overwrite the existing account -SJH
    const hash = await Account.generateHash(pass);
    doc.password = hash;
    await Account.replaceOne(query, doc);
    // Creating login session info -SJH
    req.session.account = doc;
    return res.redirect('/account');
  } catch (err) {
    console.log(err);
    return res.status(500).json({ error: 'An error occured!' });
  }
};

// Called when a client tries to add a new login set of data to the site -SJH
const signup = async (req, res) => {
  const username = `${req.body.username}`;
  const pass = `${req.body.pass}`;
  const pass2 = `${req.body.pass2}`;

  // All 3 fields must be sent -SJH
  if (!username || !pass || !pass2) {
    return res.status(400).json({ error: 'All fields are required!' });
  }
  // 2 input passwords must match -SJH
  if (pass !== pass2) {
    return res.status(400).json({ error: 'Passwords do not match!' });
  }

  try {
    // Generating account object -SJH
    const hash = await Account.generateHash(pass);
    const newAccount = new Account({ username, password: hash });
    await newAccount.save();

    // Creating login session info -SJH
    req.session.account = Account.toAPI(newAccount);

    // Creating profile object -SJH
    const newProfile = new Profile({
      username,
      premium: false,
      gamesPlayed: 0,
      owner: req.session.account._id,
    });
    await newProfile.save();

    // Redirect to the default logged-in page -SJH
    return res.json({ redirect: '/account' });
  } catch (err) {
    console.log(err);
    if (err.code === 11000) {
      return res.status(400).json({ error: 'Username already in use!' });
    }
    return res.status(500).json({ error: 'An error occured!' });
  }
};

// Simple request handler to tell the client if they are logged in or not -SJH
const isLoggedIn = (req, res) => {
  if (req.session.account) {
    return res.status(200).json({ loggedIn: true });
  }
  return res.status(200).json({ loggedIn: false });
};

// Returns profile data so the user's browser can populate the profile part of their
// account page -SJH
const getProfileData = async (req, res) => {
  if (!req.session.account) {
    return res.status(400).json({ error: 'You must be logged in to access your profile!' });
  }

  // Get the profile data from the database -SJH
  try {
    const query = { owner: req.session.account._id };
    const doc = await Profile.findOne(query)
      .select('username gamesPlayed premium color').lean().exec();

    return res.json({ profile: doc });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ error: 'Error retrieving profile data!' });
  }
};

// Called when the client takes an action that modifies their profile -SJH
const modifyProfile = async (req, res) => {
  const query = { owner: req.session.account._id };
  const doc = await Profile.findOne(query).lean().exec();

  doc.color = req.body.color;
  doc.premium = req.body.premium;

  // Overwrite the profile on MongoDB, then send a response to the client -SJH
  await Profile.replaceOne(query, doc);
  return res.status(201).json({ profile: doc });
};

// Called after a logged-in user has finished playing a game -SJH
const incrementGamesPlayed = async (req, res) => {
  const query = { owner: req.session.account._id };
  const doc = await Profile.findOne(query).lean().exec();

  doc.gamesPlayed += 1;

  // Overwrite the profile on MongoDB, then send a response to the client -SJH
  await Profile.replaceOne(query, doc);
  return res.status(204);
};

module.exports = {
  loginPage,
  accountPage,
  login,
  logout,
  signup,
  changePassword,
  isLoggedIn,
  getProfileData,
  modifyProfile,
  incrementGamesPlayed,
  changePasswordPage,
};
