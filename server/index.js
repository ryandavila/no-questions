const express = require('express');
const cors = require('cors');
const monk = require('monk');
const rateLimit = require('express-rate-limit');
const moment = require('moment');
moment().format();

const app = express();
app.use(cors());
app.use(express.json());

const db = monk(process.env.MONGODB_URI || 'localhost:27017/questions');
db.then(() => {
  console.log('Properly connected to server...')
});
const questions = db.get('questions');

app.use(express.static('../client'));

app.get('/', (req, res) => {
  res.json({
    message: 'Question received homie'
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

app.listen(process.env.PORT || 5000, () => {
  console.log('Listening...');
});

function isValidQuestion(question) {
  return question.question && question.question.toString().trim() !== '' &&
    question.author && question.author.toString().trim() !== '';
}