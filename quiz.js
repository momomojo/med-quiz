// quiz.js
import { getQuizNames, updateQuizName } from './firebase-handler.js';
import { populateQuizList, startQuiz } from './ui-handler.js';


export async function initQuizApp() {
  //console.log('Quiz.js loaded');

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

    let quizListPopulated = false;
    let populatingQuizList = false; // Add this flag

    await populateQuizList(
      quizListPopulated,
      populatingQuizList,
      getQuizNames,
      startQuiz,
      updateQuizName,
      fileExists,
      quizSelectContainer
    );
    
    await startQuiz(
      questionElement,
      choicesContainer,
      resultsContainer,
      restartButton,
      quizSelectContainer,
      fileExists
    );
    

  } catch (error) {
    console.error('Error:', error);
  };
}
