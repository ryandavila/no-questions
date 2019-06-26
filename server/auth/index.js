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

router.get('/', (req, res) => {
  res.json({
    message: 'auth pathway returned'
  });
});

router.post('/signup', (req, res, next) => {
  console.log('body', req.body);
  const result = Joi.validate(req.body, schema);
  if (result.error === null) {
    // username unique?
    users.findOne({
      //look to see if username exists in database
      username: req.body.username,
    }).then(user => {
      if (user) {
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
            delete insertedUser.password;
            res.json(insertedUser);
          });
        });
      }
    });
  } else {
    next(result.error);
  }
});

module.exports = router;