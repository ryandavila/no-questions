const QUESTIONS_URL = `${window.location.origin}/questions`;
const USER_URL = `${window.location.origin}/api/user`;
const form = document.querySelector('form');
const loadingElement = document.querySelector('.loading');
const questionsElement = document.querySelector('.questions');
const usernameElement = document.querySelector('.username');

loadingElement.style.display = '';

listAllQuestions();

fetch(USER_URL, {
  headers: {
    authorization: `Bearer ${localStorage.token}`,
  },
  }).then(res => res.json())
    .then((result) => {
      if (result.user) {
        const user = result.user;
        console.log(user);
        usernameElement.innerHTML = `Hello ${user.username}!`;
        document.getElementById('register').style.display = 'none';
        document.getElementById('login').style.display = 'none';
      } else {
        localStorage.removeItem('token');
        // can add logic to redirect here
      }
});

loadingElement.style.display = 'none';

form.addEventListener('submit', (event) => {
  event.preventDefault();
  const formData = new FormData(form);
  const question = formData.get('question');
  const author = formData.get('author');
  const sober = formData.get('sober');

  const questionEntry = {
    question,
    author,
    sober
  };
    
  form.style.display = 'none';
  loadingElement.style.display = '';

  fetch(QUESTIONS_URL, {
    method: 'POST',
    body: JSON.stringify(questionEntry),
    headers: {
        'content-type': 'application/json'
    }
  }).then(response => response.json())
    .then( () => {
      form.reset();
      form.style.display = '';
      listAllQuestions();
    });
});

function listAllQuestions() {
  questionsElement.innerHTML = '';
  fetch(QUESTIONS_URL)
    .then(response => response.json())
    .then(questions => {
      questions.reverse();
      // console.log(questions);
      questions.forEach(question => {
        let div = document.createElement('div');
        div.className = 'question';
        
        let header = document.createElement('h3');
        header.textContent = question.question;
        
        let author = document.createElement('p');
        author.textContent = question.author;

        let date = document.createElement('small');
        date.textContent = new Date(question.created);
        //idea for a card, with the color representing the 
        //sober answer
        div.style.backgroundColor = question.sober.includes('Nope') ? 'red' : 'green';

        div.appendChild(header);
        div.appendChild(author);
        div.appendChild(date);

        questionsElement.appendChild(div);
      });
      loadingElement.style.display = 'none';
    });
}

function logout() {
  localStorage.removeItem('token');
  window.location = '/login.html'
}