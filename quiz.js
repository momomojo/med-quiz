document.addEventListener('DOMContentLoaded', async () => {
  const txtFileURL = 'quiz1.txt'; // Replace with your .txt file URL
  const quizData = await parseTxtFile(txtFileURL);

  const container = document.getElementById('quiz-container');
  const questionElement = document.getElementById('question');
  const choicesContainer = document.getElementById('choices');
  const resultsContainer = document.getElementById('results');
  const restartButton = document.getElementById('restart');

  let currentQuestion = 0;
  let correctAnswers = 0;

  function showQuestion() {
    const questionData = quizData[currentQuestion];
    questionElement.textContent = questionData.question;

    choicesContainer.innerHTML = '';

    questionData.choices.forEach((choice, index) => {
      const button = document.createElement('button');
      button.textContent = choice;
      button.onclick = () => handleAnswerClick(index);
      choicesContainer.appendChild(button);
    });
  }

  function handleAnswerClick(selectedIndex) {
    if (selectedIndex === quizData[currentQuestion].correctAnswer) {
      correctAnswers++;
    }

    currentQuestion++;

    if (currentQuestion < quizData.length) {
      showQuestion();
    } else {
      showResults();
    }
  }

  function showResults() {
    questionElement.style.display = 'none';
    choicesContainer.style.display = 'none';
    resultsContainer.textContent = `You scored ${correctAnswers} out of ${quizData.length} (${Math.round((correctAnswers / quizData.length) * 100)}%)`;
    resultsContainer.style.display = 'block';
    restartButton.style.display = 'block';

    restartButton.onclick = () => {
      currentQuestion = 0;
      correctAnswers = 0;
      questionElement.style.display = 'block';
      choicesContainer.style.display = 'block';
      resultsContainer.style.display = 'none';
      restartButton.style.display = 'none';
      showQuestion();
    };
  }

  async function parseTxtFile(url) {
    const response = await fetch(url);
    const txtData = await response.text();

    const lines = txtData.trim().split('\n');
    const quizData = [];

    for (let i = 0; i < lines.length; i += 6) {
      const question = lines[i].slice(3).trim();
      const choices = lines.slice(i + 1, i + 5).map(line => line.slice(2).trim());
      const correctAnswer = lines[i + 5].trim().charCodeAt(0) - 65;

      quizData.push({ question, choices, correctAnswer });
    }

    return quizData;
  }

  showQuestion();
});
