document.addEventListener('DOMContentLoaded', async () => {
  try {
    const txtFileURL = './quiz1.txt';
    const answerKeyURL = './answer_key.txt';
    const quizData = await parseTxtFile(txtFileURL, answerKeyURL);

    const container = document.getElementById('quiz-container');
    const questionElement = document.getElementById('question');
    const choicesContainer = document.getElementById('choices-container');
    const resultsContainer = document.getElementById('results');
    const restartButton = document.getElementById('restart');

    let currentQuestion = 0;
    let correctAnswers = 0;
    let answeredQuestions = [];

    showQuestion();

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
      answeredQuestions.push({
        questionIndex: currentQuestion,
        userAnswer: selectedIndex,
        correctAnswer: quizData[currentQuestion].correctAnswer
      });
    
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
      console.log('Showing results');
      console.log('Answered questions:', answeredQuestions);
    
      questionElement.style.display = 'none';
      choicesContainer.style.display = 'none';
      resultsContainer.innerHTML = `You scored ${correctAnswers} out of ${quizData.length} (${Math.round((correctAnswers / quizData.length) * 100)}%)<br><br>`;
      resultsContainer.style.display = 'block';
      restartButton.style.display = 'block';
    
      const wrongAnswers = answeredQuestions.filter(answer => answer.userAnswer !== answer.correctAnswer);
      console.log('Wrong answers:', wrongAnswers);
      const wrongResultsContainer = document.createElement('div');
      wrongResultsContainer.innerHTML = `<strong>You got ${wrongAnswers.length} questions wrong:</strong><br><br>`;
      resultsContainer.appendChild(wrongResultsContainer);
    
      wrongAnswers.forEach(answer => {
        const questionData = quizData[answer.questionIndex];
        const questionText = questionData.question;
        const userAnswer = questionData.choices[answer.userAnswer];
        const correctAnswer = questionData.choices[answer.correctAnswer];
    
        const answerDetails = document.createElement('div');
        answerDetails.innerHTML = `
          <strong>Question:</strong> ${questionText}<br>
          <strong>Your Answer:</strong> ${userAnswer}<br>
          <strong>Correct Answer:</strong> ${correctAnswer}<br><br>
        `;
        resultsContainer.appendChild(answerDetails);
      });
    
      restartButton.onclick = () => {
        currentQuestion = 0;
        correctAnswers = 0;
        answeredQuestions = [];
        questionElement.style.display = 'block';
        choicesContainer.style.display = 'block';
        resultsContainer.style.display = 'none';
        restartButton.style.display = 'none';
        showQuestion();
      };
    }
    

    async function parseTxtFile(url, answerKeyURL) {
      const response = await fetch(url);
      const txtData = await response.text();
      const responseAnswers = await fetch(answerKeyURL);
      const txtAnswers = await responseAnswers.text();
    
      const answers = txtAnswers
        .trim()
        .split('\n')
        .filter(line => line.trim()) // Filter out empty lines
        .map(line => line.slice(3).trim().toUpperCase());
    
      const lines = txtData.trim().split('\n');
      const quizData = [];
    
      let i = 0;
      while (i < lines.length) {
        if (/^\d+\)/.test(lines[i])) { // Check if the line starts with a number followed by a closing parenthesis
          const question = lines[i].slice(3).trim();
          i++;
    
          const choices = [];
          while (i < lines.length && !/^\d+\)/.test(lines[i])) { // Check if the line starts with a number followed by a closing parenthesis
            if (/^[A-D]\)/.test(lines[i])) { // Check if the line starts with a capital letter (A-D) followed by a closing parenthesis
              choices.push(lines[i].slice(2).trim());
            }
            i++;
          }
    
          const answerIndex = quizData.length;
          if (answerIndex < answers.length) {
            const correctAnswer = answers[answerIndex].charCodeAt(0) - 65;
            console.log('Current index:', answerIndex, 'Answer:', answers[answerIndex]);
            quizData.push({ question, choices, correctAnswer });
          } else {
            console.warn('No corresponding answer found for question index:', answerIndex);
          }
        } else {
          i++;
        }
      }
    
      return quizData;
    }
    
  } catch (error) {
    console.error('Error:', error);
  }
});
