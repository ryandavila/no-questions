const Joi = require('joi');

const LOGIN_URL = `${window.location.origin}/auth/login`;
const form = document.querySelector('form');
const errorElement = document.querySelector('.alert');
const loadingElement = document.querySelector('.loading');


const schema = Joi.object().keys({
  username: Joi.string().regex(/(^[a-zA-Z0-9_-]+$)/).min(2).max(30).required(),
  password: Joi.string().trim().min(8).required(),
});

loadingElement.style.display = 'none';

if (localStorage.token) {
  window.location = '/index.html'
}

form.addEventListener('submit', (event) => {
  event.preventDefault();
  const formData = new FormData(form);
  const username = formData.get('username');
  const password = formData.get('password');

  const newUser = {
    username,
    password,
  };
  loadingElement.style.display = '';
  login(newUser);
  loadingElement.style.display = 'none';
});

function login(user) {
  errorElement.innerHTML = '';
  errorElement.style.display = 'none'
  if (validUser(user)) {
    console.log("logging in");
    const body = {
      username: user.username,
      password: user.password
    }
    fetch(LOGIN_URL, {
      method: 'POST',
      body: JSON.stringify(body),
      headers: {
        'content-type': 'application/json '
      }
    }).then(response => {
      if (response.ok) {
        console.log(response);
        return response.json()
      }
      return response.json().then(error => {
        throw new Error(error.message);
      });
    }).then((result) => {
      console.log(result);
      setTimeout(() => {
        localStorage.token = result.token;
        // transition to main page
        window.location = "/index.html";
      }, 1000);
    }).catch(error => {
      errorElement.innerHTML = error;
      errorElement.style.display = '';
    });
  }
}

function validUser(user) {
  const result = Joi.validate(user, schema);
  if (result.error === null) {
    return true;
  }
  if (result.error.message.includes('username')) {
    errorMessage = 'Username is invalid.'
    errorElement.innerHTML = errorMessage;
    errorElement.style.display = '';

  } else {
    errorMessage = 'Password is invalid.'
    errorElement.innerHTML = errorMessage;
    errorElement.style.display = '';
  }
  return false;
}
