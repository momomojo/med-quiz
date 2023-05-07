document.addEventListener('DOMContentLoaded', async () => {
  try {
    const quizSelectContainer = document.getElementById('quiz-select-container');
    const questionElement = document.getElementById('question');
    const choicesContainer = document.getElementById('choices-container');
    const resultsContainer = document.getElementById('results');
    const restartButton = document.getElementById('restart');

    async function checkQuizExists(quizName) {
      const response = await fetch(`./Quizzes/${quizName}.txt`);
      return response.ok;
    }

    async function populateQuizList() {
      quizSelectContainer.innerHTML = ''; // Clear the container to avoid duplicates
      let quizIndex = 1;
    
      while (true) {
        const quizName = `quiz${quizIndex}`;
        const exists = await checkQuizExists(quizName);
    
        if (exists) {
          const quizButton = document.createElement('button');
          const displayName = quizName.replace(/(\d+)/g, ' $1'); // Add a space before each digit
          const formattedName = displayName.charAt(0).toUpperCase() + displayName.slice(1); // Capitalize the first letter
          quizButton.textContent = formattedName;
          quizButton.onclick = () => startQuiz(quizName);
          quizButton.classList.add('quiz-button');
          quizSelectContainer.appendChild(quizButton);
        }
    
        // Stop checking for quizzes if there is no quiz for the current index
        const nextQuizName = `quiz${quizIndex + 1}`;
        const nextExists = await checkQuizExists(nextQuizName);
        if (!exists && !nextExists) {
          break;
        }
    
        quizIndex++;
      }
    }

    await populateQuizList();
    

    async function startQuiz(quizName) {
      try {
        quizSelectContainer.style.display = 'none';
    
        const txtFileURL = `./Quizzes/${quizName}.txt`;
        const answerKeyURL = `./Quizzes/${quizName}_answer_key.txt`;
        let quizData = await parseTxtFile(txtFileURL, answerKeyURL);
        
        // Add a shuffle function to shuffle an array
        function shuffle(array) {
          for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
          }
        }
        
        // Shuffle the quizData array
        shuffle(quizData);
    
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
        
            // Add a class to each choice button
            button.classList.add('quiz-button');
        
            choicesContainer.appendChild(button);
          });
        
          updateProgressBar();
        }
        
        function updateProgressBar() {
          const progressBar = document.getElementById('progress-bar');
          const progress = (currentQuestion / quizData.length) * 100;
          progressBar.style.width = progress + '%';
        }
        
        

        function handleAnswerClick(selectedIndex) {
          answeredQuestions.push({
            questionIndex: currentQuestion,
            userAnswer: selectedIndex,
            correctAnswer: quizData[currentQuestion].correctAnswer
          });
        
          showCorrectAnswer(selectedIndex);
        }
        
        function showCorrectAnswer(selectedIndex) {
          const buttons = choicesContainer.getElementsByTagName('button');
          const correctAnswer = quizData[currentQuestion].correctAnswer;
          const isCorrect = selectedIndex === correctAnswer;
        
          for (let i = 0; i < buttons.length; i++) {
            if (i === correctAnswer) {
              buttons[i].innerHTML = isCorrect ? '<i class="fas fa-check"></i> ' + buttons[i].textContent : '<i class="fas fa-times"></i> ' + buttons[i].textContent;
              buttons[i].classList.add(isCorrect ? 'correct' : 'correct-after-wrong');
            } else if (i === selectedIndex && !isCorrect) {
              buttons[i].innerHTML = '<i class="fas fa-times"></i> ' + buttons[i].textContent;
              buttons[i].classList.add('wrong');
            }
          }
        
          // Wait for 2 seconds before proceeding to the next question or showing the results
          setTimeout(() => {
            if (isCorrect) {
              correctAnswers++;
            }
        
            currentQuestion++;
        
            if (currentQuestion < quizData.length) {
              showQuestion();
            } else {
              showResults();
            }
          }, 2000);
        }
        
        function showResults() {
          questionElement.style.display = 'none';
          choicesContainer.style.display = 'none';
        
          resultsContainer.innerHTML = `
            <h2>You scored:</h2>
            <h1>${correctAnswers} out of ${quizData.length}</h1>
            <h3>(${Math.round((correctAnswers / quizData.length) * 100)}%)</h3><br>
          `;
        
          resultsContainer.style.display = 'block';
          restartButton.style.display = 'block';
    
          const wrongAnswers = answeredQuestions.filter(answer => answer.userAnswer !== answer.correctAnswer);
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
            questionElement.style.display = 'none';
            choicesContainer.style.display = 'none';
            resultsContainer.style.display = 'none';
            restartButton.style.display = 'none';
            quizSelectContainer.style.display = 'block';
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
            if (/^\d+[\.\)]/.test(lines[i])) { // Check if the line starts with a number followed by a dot or closing parenthesis
              const question = lines[i].slice(3).trim();
              i++;
        
              const choices = [];
              while (i < lines.length && !/^\d+[\.\)]/.test(lines[i])) { // Check if the line starts with a number followed by a dot or closing parenthesis
                if (/^[A-D][\.\)]/.test(lines[i])) { // Check if the line starts with a capital letter (A-D) followed by a dot or closing parenthesis
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
    }
  } catch (error) {
    console.error('Error:', error);
  }
});