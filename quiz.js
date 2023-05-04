const questionEl = document.getElementById("question");
const choicesEl = Array.from(document.getElementsByClassName("choice-text"));
const progressTextEl = document.getElementById("progress-text");
const progressBarFullEl = document.getElementById("progress-bar-full");

let currentQuestion = {};
let acceptingAnswers = true;
let questionCounter = 0;
let score = 0;

function textToCSV(text) {
  const lines = text.split('\n');
  const csvLines = [];

  for (let i = 0; i < lines.length; i += 8) {
    const question = lines[i].slice(3).trim();
    const choices = [
      lines[i + 1].slice(2).trim(),
      lines[i + 2].slice(2).trim(),
      lines[i + 3].slice(2).trim(),
      lines[i + 4].slice(2).trim(),
    ];
    const correctAnswer = lines[lines.length - Math.ceil((lines.length - i) / 8)].charCodeAt(0) - 65;
    csvLines.push(`"${question}","${choices.join('","')}",${correctAnswer}`);
  }

  return csvLines.join('\n');
}

function parseCSV(csv) {
  const lines = csv.trim().split('\n');
  const questions = lines.map((line) => {
    const values = line.split('","');
    return {
      question: values[0].slice(1),
      choices: [
        values[1],
        values[2],
        values[3],
        values[4].slice(0, -1),
      ],
      correctAnswer: parseInt(values[5], 10),
    };
  });
  return questions;
}

let questions = [];
fetch('URL_TO_YOUR_TEXT_FILE')
  .then((response) => response.text())
  .then((text) => {
    const csv = textToCSV(text);
    questions = parseCSV(csv);
    displayQuestion();
  });

// Add a function to reset the choice colors
function resetChoiceColors() {
  choicesEl.forEach((choice) => {
    choice.classList.remove("correct");
    choice.classList.remove("incorrect");
  });
}

function displayQuestion() {
  if (questionCounter >= questions.length) {
    // Display the end of quiz screen
    showScoreScreen();
    return;
  }

  resetChoiceColors();
  // ... (existing code)
}

// Add logic for scoring and visual feedback
choicesEl.forEach((choice) => {
  choice.addEventListener("click", (e) => {
    if (!acceptingAnswers) return;

    acceptingAnswers = false;
    const selectedChoice = e.target;
    const selectedAnswer = parseInt(selectedChoice.dataset["number"]) - 1;

    const isCorrect = selectedAnswer === currentQuestion.correctAnswer;
    if (isCorrect) {
      score++;
    }
    selectedChoice.classList.add(isCorrect ? "correct" : "incorrect");

    setTimeout(() => {
      displayQuestion();
    }, 1000);
  });
});

// Add the logic for the end of the quiz
function showScoreScreen() {
  const scorePercentage = (score / questions.length) * 100;
  const scoreText = `You scored ${score} out of ${questions.length} (${scorePercentage.toFixed(2)}%)`;

  // Display the score screen and the start button
  document.getElementById("score-screen").innerText = scoreText;
  document.getElementById("start-button").style.display = "block";
}

// Add a function to start a quiz with the specified URL
function startQuiz(url) {
  questionCounter = 0;
  score = 0;
  fetch(url)
    .then((response) => response.text())
    .then((text) => {
      const csv = textToCSV(text);
      questions = parseCSV(csv);
      displayQuestion();
    });

  // Hide the score screen and the start button
  document.getElementById("score-screen").innerText = "";
  document.getElementById("start-button").style.display = "none";
}

// Add event listeners for the quiz selection buttons
document.getElementById("quiz1-button").addEventListener("click", () => {
  startQuiz("URL_TO_YOUR_CSV_FILE_1");
});

document.getElementById("quiz2-button").addEventListener("click", () => {
  startQuiz("URL_TO_YOUR_CSV_FILE_2");
});

// ... Add more event listeners for additional quiz buttons

