const path = require('path');
const express = require('express');
const compression = require('compression');
const favicon = require('serve-favicon');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const expressHandlebars = require('express-handlebars');
const helmet = require('helmet');

const router = require('./router.js');

//Setting port to run server on. -SJH
const port = process.env.PORT || process.env.NODE_PORT || 3000;

//Connecting server to database. -SJH
const dbURI = process.env.MONGODB_URI || 
'mongodb+srv://sjh3552:STOP4utogen!@cluster0.onrz2.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';
mongoose.connect(dbURI).catch((err) => {
  if (err) {
    console.log('Could not connect to database');
    throw err;
  }
});

const app = express();

//Setting up dependencies -SJH
app.use(helmet());
app.use('/assets', express.static(path.resolve(`${__dirname}/../hosted/`)));
app.use(favicon(`${__dirname}/../hosted/img/favicon.png`));
app.use(compression());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.engine('handlebars', expressHandlebars.engine({defaultLayout: '',}));
app.set('view engine', 'handlebars');
app.set('views', `${__dirname}/../views`);

//Run server routing setup -SJH
router(app);

//Start the serv0er listening on the specified port -SJH
app.listen(port, (err) => {
  // if the app fails, throw the err
  if (err) {
    throw err;
  }
  console.log(`Listening on port ${port}`);
});
