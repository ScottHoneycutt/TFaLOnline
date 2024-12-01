require('dotenv').config();
const path = require('path');
const express = require('express');
const compression = require('compression');
const favicon = require('serve-favicon');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const expressHandlebars = require('express-handlebars');
const helmet = require('helmet');
const session = require('express-session');
const RedisStore = require('connect-redis').default;
const redis = require('redis');

const router = require('./router.js');

// Setting port to run server on. -SJH
const port = process.env.PORT || process.env.NODE_PORT || 3000;

// Connecting server to MongoDB. -SJH
const dbURI = process.env.MONGODB_URI
  || 'mongodb+srv://sjh3552:STOP4utogen!@cluster0.onrz2.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';
mongoose.connect(dbURI).catch((err) => {
  if (err) {
    console.log('Could not connect to database');
    throw err;
  }
});

// Connecting server to Redis -SJH
const redisClient = redis.createClient({
  url: process.env.REDISCLOUD_URL,
});
redisClient.on('error', (err) => console.log('Redis Client Error', err));

// Wait for redis to connect before attaching dependences -SJH
redisClient.connect().then(() => {
  const app = express();

  // Setting up dependencies -SJH
  app.use( helmet({ contentSecurityPolicy: false }) );
  app.use('/assets', express.static(path.resolve(`${__dirname}/../hosted/`)));
  app.use(favicon(`${__dirname}/../hosted/img/player.png`));
  app.use(compression());
  app.use(bodyParser.urlencoded({ extended: true }));
  app.use(bodyParser.json());
  // Used for login sessions. Saves a cookie to the browser for a login session. -SJH
  app.use(session({
    key: 'loginSessionKey',
    store: new RedisStore({
      client: redisClient,
    }),
    secret: 'Domo Arigato',
    resave: false,
    saveUninitialized: false,
  }));
  app.engine('handlebars', expressHandlebars.engine({ defaultLayout: '' }));
  app.set('view engine', 'handlebars');
  app.set('views', `${__dirname}/../views`);

  // Run server routing setup -SJH
  router(app);

  // Start the serv0er listening on the specified port -SJH
  app.listen(port, (err) => {
    // if the app fails, throw the err
    if (err) {
      throw err;
    }
    console.log(`Listening on port ${port}`);
  });
});
