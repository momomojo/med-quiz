// ui-handler.js

import { startQuiz } from './quiz.js'; // Assuming startQuiz function is defined in quiz.js
import { getQuizNames, updateQuizName, fileExists } from './firebase-handler.js'; // Import necessary functions from firebase-handler.js

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
        const url = `./Quizzes/${quizName}.txt`;
        const answerKeyURL = `./Quizzes/${quizName}_answer_key.txt`;

        const questionFileExists = await fileExists(url);
        const answerKeyFileExists = await fileExists(answerKeyURL);

        if (questionFileExists && answerKeyFileExists) {
            const quizButton = createQuizButton(quizName, quizNames[quizName], answerKeyURL);
            quizSelectContainer.appendChild(quizButton);
        }
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
