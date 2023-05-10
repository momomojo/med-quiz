export async function initQuizApp() {
console.log('Quiz.js loaded');

(async function() {
  

  try {
    const quizSelectContainer = document.getElementById('quiz-select-container');
    const questionElement = document.getElementById('question');
    const choicesContainer = document.getElementById('choices-container');
    const resultsContainer = document.getElementById('results');
    const restartButton = document.getElementById('restart');

    async function fileExists(url) {
      try {
        const response = await fetch(url, { method: 'HEAD' });
        return response.status === 200;
      } catch (error) {
        console.error('Error checking file existence:', error);
        return false;
      }
    }
    
    async function checkQuizExists(quizName) {
      const url = `./Quizzes/${quizName}.txt`;
      return await fileExists(url);
    }
    
    
    async function updateQuizName(quizName, newName) {
      if (!newName || newName.trim() === '') {
        console.error('New name cannot be empty');
        return;
      }
    
      const quizNames = await getQuizNames();
      quizNames[quizName] = newName;
    
      const updates = {};
      updates[`/quizNames/${quizName}`] = newName;
      await database.ref().update(updates);
    }
    
    async function getQuizNames() {
      const quizNamesSnapshot = await database.ref('/quizNames').once('value');
      return quizNamesSnapshot.val() || {};
    }    

    let quizListPopulated = false;
    let populatingQuizList = false; // Add this flag

    async function populateQuizList() {
      if (quizListPopulated || populatingQuizList) { // Check if the function is already running
        console.warn('Quiz list has already been populated or is being populated. Skipping...');
        return;
      }
    
      populatingQuizList = true; // Set the flag to true when the function starts

      quizSelectContainer.innerHTML = ''; // Clear the container to avoid duplicates
      let quizIndex = 1;

      const quizNames = await getQuizNames();

      console.log('Populating quiz list...');

      while (true) {
        const quizName = `quiz${quizIndex}`;
        const url = `./Quizzes/${quizName}.txt`;
        const answerKeyURL = `./Quizzes/${quizName}_answer_key.txt`;
    
        const questionFileExists = await fileExists(url);
        const answerKeyFileExists = await fileExists(answerKeyURL);
    
        if (questionFileExists && answerKeyFileExists) {
          const quizButton = document.createElement('button');
          const displayName = quizNames[quizName] || quizName.replace(/(\d+)/g, ' $1'); // Add a space before each digit
          const formattedName = displayName.charAt(0).toUpperCase() + displayName.slice(1); // Capitalize the first letter
          quizButton.textContent = formattedName;
          quizButton.onclick = () => startQuiz(quizName);
          quizButton.classList.add('quiz-button');
          quizSelectContainer.appendChild(quizButton);
    
          const renameButton = document.createElement('button');
          renameButton.innerHTML = '<i class="fas fa-edit"></i>';
          renameButton.onclick = async () => {
            const newName = prompt('Enter a new name for the quiz:', formattedName);
            if (newName && newName !== formattedName) {
              await updateQuizName(quizName, newName);
              await populateQuizList();
            }
          };
          renameButton.classList.add('rename-button');
          quizSelectContainer.appendChild(renameButton);
        }
    
        // Stop checking for quizzes if there is no quiz for the current index
        const nextQuizName = `quiz${quizIndex + 1}`;
        const nextQuestionFileURL = `./Quizzes/${nextQuizName}.txt`;
        const nextAnswerKeyFileURL = `./Quizzes/${nextQuizName}_answer_key.txt`;
        const nextQuestionFileExists = await fileExists(nextQuestionFileURL);
        const nextAnswerKeyFileExists = await fileExists(nextAnswerKeyFileURL);
    
        if (!questionFileExists && !nextQuestionFileExists && !answerKeyFileExists && !nextAnswerKeyFileExists) {
          break;
        }
    
        //console.log('Quiz Names:', quizNames);
        //console.log('Quiz Index:', quizIndex);
    
        quizIndex++;
      }
    
      quizListPopulated = true;
      populatingQuizList = false; // Set the flag to false when the function finishes
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
          try {
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
                  if (/^[A-Z][\.\)]/.test(lines[i])) { // Check if the line starts with a capital letter (A-Z) followed by a dot or closing parenthesis
                    choices.push(lines[i].slice(2).trim());
                  }
                  i++;
                }
              
                const answerIndex = quizData.length;
                if (answerIndex < answers.length) {
                  const correctAnswer = answers[answerIndex].charCodeAt(0) - 65;
                  // console.log('Current index:', answerIndex, 'Answer:', answers[answerIndex]);
                  quizData.push({ question, choices, correctAnswer });
                } else {
                  console.warn('No corresponding answer found for question index:', answerIndex);
                }
              } else {
                i++;
              }
            }
          
            return quizData;
          } catch (error) {
            console.error('Error:', error);
            return [];
          }
        }
        
      } catch (error) {
        console.error('Error:', error);
      }
    }
  } catch (error) {
    console.error('Error:', error);
  };
})()};
