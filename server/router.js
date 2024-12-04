// import the controllers
// This only specifies the folder name, which means it will automatically pull the index.js file
const controllers = require('./controllers');
const mid = require('./middleware');

// function to attach routes
const router = (app) => {
  app.get('/getDomos', mid.requiresLogin, controllers.Domo.getDomos);

  app.get('/getAllScores', mid.requiresSecure, controllers.Highscore.getAllHighScores);

  app.get('/login', mid.requiresSecure, mid.requiresLogout, controllers.Account.loginPage);
  app.post('/login', mid.requiresSecure, mid.requiresLogout, controllers.Account.login);

  app.post('/signup', mid.requiresSecure, mid.requiresLogout, controllers.Account.signup);

  app.get('/scoreboard', mid.requiresSecure, controllers.Highscore.scoresPage);
  app.post('/scoreboard', mid.requiresSecure, controllers.Highscore.addNewScore);
  app.get('/isLoggedIn', mid.requiresSecure, controllers.Account.isLoggedIn);

  app.get('/logout', mid.requiresLogin, controllers.Account.logout);

  app.get('/account', mid.requiresLogin, controllers.Account.accountPage);

  app.get('/game', mid.requiresSecure, controllers.Domo.makerPage);
  app.post('/game', mid.requiresSecure, controllers.Domo.makeDomo);

  app.get('/', mid.requiresSecure, mid.requiresLogout, controllers.Account.loginPage);
  module.exports = router;
};

// export the router function
module.exports = router;
