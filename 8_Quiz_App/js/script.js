// script.js
const questions = [
  {
    question: "What does HTML stand for?",
    options: ["HyperText Markdown Language", "HyperText Markup Language", "Hyperloop Machine Language", "None of these"],
    answer: 1
  },
  {
    question: "CSS is used for?",
    options: ["Structuring content", "Backend scripting", "Styling web pages", "Server hosting"],
    answer: 2
  },
  {
    question: "JavaScript is primarily used for?",
    options: ["Database Management", "Making pages interactive", "Creating server logs", "Email communication"],
    answer: 1
  },
  {
    question: "Which HTML tag is used to link a CSS file?",
    options: ["<script>", "<style>", "<link>", "<css>"],
    answer: 2
  },
  {
    question: "Which is a JavaScript framework?",
    options: ["Laravel", "Django", "React", "Spring"],
    answer: 2
  }
];

let currentIndex = 0;
let score = 0;

const questionEl = document.getElementById('question');
const optionsEl = document.getElementById('options');
const nextBtn = document.getElementById('next-btn');
const resultBox = document.getElementById('result-box');
const scoreText = document.getElementById('score');
const progressCurrent = document.getElementById('current');
const progressTotal = document.getElementById('total');

const correctSound = document.getElementById('correct-sound');
const wrongSound = document.getElementById('wrong-sound');

progressTotal.textContent = questions.length;

function loadQuestion(index) {
  const q = questions[index];
  questionEl.textContent = q.question;
  optionsEl.innerHTML = '';

  q.options.forEach((option, i) => {
    const li = document.createElement('li');
    li.textContent = option;
    li.addEventListener('click', () => selectAnswer(i, li));
    optionsEl.appendChild(li);
  });

  progressCurrent.textContent = index + 1;
}

function selectAnswer(selected, li) {
  const correct = questions[currentIndex].answer;
  const options = optionsEl.children;

  Array.from(options).forEach((el, i) => {
    el.classList.add(i === correct ? 'correct' : (i === selected ? 'wrong' : ''));
    el.style.pointerEvents = 'none';
  });

  if (selected === correct) {
    score++;
    correctSound.play();
  } else {
    wrongSound.play();
  }
}

nextBtn.addEventListener('click', () => {
  if (currentIndex < questions.length - 1) {
    currentIndex++;
    loadQuestion(currentIndex);
  } else {
    document.querySelector('.quiz-container').style.display = 'none';
    resultBox.classList.remove('hidden');
    scoreText.textContent = `Your Score: ${score} / ${questions.length}`;
  }
});

window.onload = () => {
  loadQuestion(currentIndex);
};
