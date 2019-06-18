console.log("Howdy world.");

const API_URL = 'http://localhost:5000/questions';
const form = document.querySelector('form');
const loadingElement = document.querySelector('.loading');
const questionsElement = document.querySelector('.questions');

loadingElement.style.display = '';

listAllQuestions();

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
  
  fetch(API_URL, {
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
  fetch(API_URL)
    .then(response => response.json())
    .then(questions => {
      questions.reverse();
      console.log(questions);
      questions.forEach(question => {
        let div = document.createElement('div');
        
        let header = document.createElement('h3');
        header.textContent = question.question;
        
        let author = document.createElement('p');
        author.textContent = question.author;

        let date = document.createElement('small');
        date.textContent = new Date(question.created);

        //idea for a card, with the color representing the 
        //sober answer

        div.appendChild(header);
        div.appendChild(author);
        div.appendChild(date);

        questionsElement.appendChild(div);
      });
      loadingElement.style.display = 'none';
    });
}