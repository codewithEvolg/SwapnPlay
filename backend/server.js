//require("dotenv").config();
const config = require('config');
const express = require("express");
const app = express();
const PORT = config.get('APPPORT') || 8080;
const helmet = require('helmet');
const morgan = require("morgan");
const cors = require('cors');
const debug = require('debug')('app:startup');

const newToy = require('./src/routes/newToy')
//const toys = require('./src/routes/toys')
const reviews = require('./src/routes/reviews')
const matches = require('./src/routes/matches')

//Middlewares
// To log details about incoming HTTP requests
app.use(express.json()); //req.body
app.use(helmet());
app.use(cors());
app.use('/api/toys/new', newToy);
//app.use('/api/toys', toys);
app.use('/api/reviews', reviews);
app.use('/api/matches', matches);

if (app.get('env') === 'development') {
  app.use(morgan('tiny'));
  debug('Application started in development mode!'); //export DEBUG=app:startup in environment variable
}


app.get('/', (req, res) => {
  res.send('Hello');
});


app.listen(PORT, () => {
  console.log(`listening on port ${PORT}`);
});