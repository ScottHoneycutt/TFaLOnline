const models = require('../models');

const { Account } = models;

// Sends back the login page -SJH
const loginPage = (req, res) => res.render('login');

// Sends back the signup page -SJH
const signupPage = (req, res) => res.render('signup');

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
    return res.json({ redirect: '/maker' });
  });
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
    const hash = await Account.generateHash(pass);
    const newAccount = new Account({ username, password: hash });
    await newAccount.save();
    // Creating login session info -SJH
    req.session.account = Account.toAPI(newAccount);
    return res.json({ redirect: '/maker' });
  } catch (err) {
    console.log(err);
    if (err.code === 11000) {
      return res.status(400).json({ error: 'Username already in use!' });
    }
    return res.status(500).json({ error: 'An error occured!' });
  }
};

module.exports = {
  loginPage,
  signupPage,
  login,
  logout,
  signup,
};
