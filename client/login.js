const Joi = require('joi');

const LOGIN_URL = `${window.location.origin}/auth/login`;
const form = document.querySelector('form');
const errorElement = document.querySelector('.alert');
const loadingElement = document.querySelector('.loading');

const schema = Joi.object().keys({
  username: Joi.string().regex(/(^[a-zA-Z0-9_-]+$)/).min(2).max(30).required(),
  password: Joi.string().trim().min(8).required(),
  confirmPassword: Joi.string().trim().min(8).required()
});

loadingElement.style.display = 'none';

form.addEventListener('submit', (event) => {
  event.preventDefault();
  const formData = new FormData(form);
  const username = formData.get('username');
  const password = formData.get('password');
  const confirmPassword = formData.get('confirmPassword');

  const newUser = {
    username,
    password,
    confirmPassword
  };
  loadingElement.style.display = '';
  signup(newUser);
  loadingElement.style.display = 'none';
});
