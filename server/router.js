// import the controllers
// This only specifies the folder name, which means it will automatically pull the index.js file
const controllers = require('./controllers');
const mid = require('./middleware');

// function to attach routes
const router = (app) => {
  app.get('/getAllScores', mid.requiresSecure, controllers.Highscore.getAllHighScores);
  app.get('/getProfileData', mid.requiresLogin, controllers.Account.getProfileData);
  app.post('/modifyProfile', mid.requiresLogin, controllers.Account.modifyProfile);
  app.get('/getMyHighscores', mid.requiresLogin, controllers.Highscore.getMyHighscores);
  app.post('/incrementGamesPlayed', mid.requiresLogin, controllers.Account.incrementGamesPlayed);
  app.post('/userColor', mid.requiresSecure, controllers.Highscore.getUserColor);

  app.get('/login', mid.requiresSecure, mid.requiresLogout, controllers.Account.loginPage);
  app.post('/login', mid.requiresSecure, mid.requiresLogout, controllers.Account.login);

  app.post('/signup', mid.requiresSecure, mid.requiresLogout, controllers.Account.signup);

  app.get('/scoreboard', mid.requiresSecure, controllers.Highscore.scoresPage);
  app.post('/scoreboard', mid.requiresSecure, controllers.Highscore.addNewScore);
  app.get('/isLoggedIn', mid.requiresSecure, controllers.Account.isLoggedIn);

  app.get('/logout', mid.requiresLogin, controllers.Account.logout);
  app.post('/changePassword', mid.requiresLogin, controllers.Account.changePassword);
  app.get('/changePassword', mid.requiresLogin, controllers.Account.changePasswordPage);

  app.get('/account', mid.requiresLogin, controllers.Account.accountPage);

  app.get('/game', mid.requiresSecure, controllers.Game.gamePage);

  app.get('/', mid.requiresSecure, mid.requiresLogout, controllers.Account.loginPage);
  module.exports = router;
};

// export the router function
module.exports = router;
