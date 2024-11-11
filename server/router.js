// import the controllers
// This only specifies the folder name, which means it will automatically pull the index.js file
const controllers = require('./controllers');

// function to attach routes
const router = (app) => {
  app.get(
    '/login',
    controllers.Account.loginPage,
  );
  app.post('/login', controllers.Account.login);

  app.get('/signup', controllers.Account.signupPage);
  app.post('/signup', controllers.Account.signup);

  app.get('/logout', controllers.Account.logout);

  app.get('/maker', controllers.Domo.makerPage);
  app.post('/maker', controllers.Domo.makeDomo);
  app.get('/', controllers.Account.loginPage);
};

// export the router function
module.exports = router;
