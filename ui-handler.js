// ui-handler.js

import { getQuizNames, updateQuizName } from './firebase-handler.js'; // Import necessary functions from firebase-handler.js

let quizListPopulated = false;
let populatingQuizList = false;

export async function populateQuizList(quizSelectContainer) {
    if (quizListPopulated || populatingQuizList) {
        console.warn('Quiz list has already been populated or is being populated. Skipping...');
        return;
    }

    populatingQuizList = true;

    quizSelectContainer.innerHTML = ''; // Clear the container to avoid duplicates

    const quizNames = await getQuizNames();

    // Iterate through quiz names and populate the quiz list
    for (const quizName in quizNames) {
        const answerKeyURL = `./Quizzes/${quizName}_answer_key.txt`;
        const quizButton = createQuizButton(quizName, quizNames[quizName], answerKeyURL);
        quizSelectContainer.appendChild(quizButton);
    }

    quizListPopulated = true;
    populatingQuizList = false;
}

function createQuizButton(quizName, displayName, answerKeyURL) {
    const quizButton = document.createElement('button');
    const formattedName = displayName.charAt(0).toUpperCase() + displayName.slice(1);
    quizButton.textContent = formattedName;

    quizButton.onclick = () => startQuiz(quizName, answerKeyURL);

    return quizButton;
}

// Define startQuiz function
export async function startQuiz(quizName, answerKeyURL) {
    console.log(`Starting quiz: ${quizName} with answer key URL: ${answerKeyURL}`);
    // Placeholder for starting the quiz logic
    // Here, you should implement the logic to display the quiz questions and handle user interactions
}
