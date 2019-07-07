const express = require('express');
const Joi = require('joi');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const router = express.Router();

const db = require('../db/connection');
const users = db.get('users');

const schema = Joi.object().keys({
  username: Joi.string().regex(/(^[a-zA-Z0-9_-]+$)/).min(2).max(30).required(),
  password: Joi.string().trim().min(8).required()
});

function createTokenSendResponse(user, res, next) {
  const payload = {
    _id: user._id,
    username: user.username
  };
  jwt.sign(payload, process.env.TOKEN_SECRET, {
    expiresIn: '1d'
  }, (err, token) => {
    if (err) {
      respondError422(res, next)
    } else {
      res.json({
        token
      });
    }
  });
}

router.get('/', (req, res) => {
  res.json({
    message: 'auth pathway returned'
  });
});

router.post('/register', (req, res, next) => {
  const result = Joi.validate(req.body, schema);
  if (result.error === null) {
    // username unique?
    users.findOne({
      //look to see if username exists in database
      username: req.body.username,
    }).then(user => {
      if (user) {
        res.status(409);
        //already user in the DB with this username, res = error
        const error = new Error('That username already exists! Please select another...');
        next(error);
      } else {
        bcrypt.hash(req.body.password, 12).then(hashedPassword => {
          const newUser = {
            username: req.body.username,
            password: hashedPassword
          };

          users.insert(newUser).then(insertedUser => {
            createTokenSendResponse(insertedUser, res, next);
          });
        });
      }
    });
  } else {
    res.status(422);
    next(result.error);
  }
});

function respondError422(res, next) {
  res.status(422);
  const error = new Error('Unable to login');
  next(error);
}

router.post('/login', (req, res, next) => {
  const result = Joi.validate(req.body, schema);
  if (result.error === null) {
    users.findOne({
      username: req.body.username
    }).then(user => {
      if (user) {
        //found user, need to compare password
        bcrypt
          .compare(req.body.password, user.password)
          .then((result) => {
            if (result) {
              //correct password!
              createTokenSendResponse(user, res, next)
            } else {
              respondError422(res, next);
            }
        });
      } else {
        respondError422(res, next);
      }
    });
  } else {
    respondError422(res, next);
  }
});

module.exports = router;