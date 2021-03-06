const express = require('express');
const cors = require('cors');
const monk = require('monk');
const rateLimit = require('express-rate-limit');

require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

const middlewares = require('./auth/middlewares');
app.use(middlewares.checkTokenSetUser);

const auth = require('./auth');
app.use('/auth', auth);

// const db = monk(process.env.MONGODB_URI || 'localhost:27017/questions');
// db.then(() => {
//   console.log('Properly connected to server...')
// });
const db = require('./db/connection');
const questions = db.get('questions');

app.use(express.static('../client'));

app.get('/api/user', (req, res) => {
  res.json({
    user: req.user,
  });
});

app.get('/questions', (req, res) => {
  questions
    .find()
    .then(questions => {
      res.json(questions);
    });
});

app.use(rateLimit({
  windowMs: 5 * 1000, // 30 seconds
  max: 1
}));

app.post('/questions', (req, res) => {
  if (isValidQuestion(req.body)) {
    const question = {
      question: req.body.question.toString(),
      author: req.body.author.toString(),
      sober: req.body.sober.toString(),
      created: new Date()
    };

    questions
      .insert(question)
      .then(createdQuestion => {
        res.json(createdQuestion);
      })
      .catch(err => {
        console.log(err);
      });
    console.log("added to database");
  } else {
    res.status(422);
    res.json({
      message: 'A valid question and author are in fact, required.'
    })
  }
});

const port = process.env.PORT || 5000
app.listen(port, () => {
  console.log('Listening on port', port);
});

function notFound(req, res, next) {
  res.status(404);
  const error = new Error('Not Found - ' + req.originalUrl);
  next(error);
}

function errorHandler(err, req, res, next) {
  res.status(res.statusCode || 500);
  res.json({
    message: err.message,
    stack: err.stack
  });
}

app.use(notFound);
app.use(errorHandler);

function isValidQuestion(question) {
  return question.question && question.question.toString().trim() !== '' &&
    question.author && question.author.toString().trim() !== '';
}