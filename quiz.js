// quiz.js
import { getQuizNames, getQuizData } from './firebase-handler.js';
import { populateQuizList, startQuiz } from './ui-handler.js';

export async function initQuizApp() {
  try {
    const quizSelectContainer = document.getElementById('quiz-select-container');
    const questionElement = document.getElementById('question');
    const choicesContainer = document.getElementById('choices-container');
    const resultsContainer = document.getElementById('results');
    const restartButton = document.getElementById('restart');

    // Assuming populateQuizList is adapted to fetch and display quiz names from Firebase
    await populateQuizList(
      getQuizNames, // This function should fetch quiz names from Firebase
      quizSelectContainer
    );

    // Listener for quiz selection that fetches quiz data and starts the quiz
    quizSelectContainer.addEventListener('change', async (e) => {
      const selectedQuiz = e.target.value;
      const quizData = await getQuizData(selectedQuiz); // Fetch quiz data based on selection
      startQuiz(
        quizData, // Pass the fetched quiz data
        questionElement,
        choicesContainer,
        resultsContainer,
        restartButton
      );
    });

  } catch (error) {
    console.error('Error:', error);
  }
}
