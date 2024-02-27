// Assuming you have already initialized Firebase in another file (e.g., firebase-config.js)
import { getDatabase, ref, get, update } from 'firebase/database';

// Initialize Firebase Database
const database = getDatabase();

export async function getQuizNames() {
  const quizNamesSnapshot = await get(ref(database, '/quizzes')).once('value');
  return Object.keys(quizNamesSnapshot.val() || {});
}

export async function getQuizData(quizName) {
  const quizDataSnapshot = await get(ref(database, `/quizzes/${quizName}`)).once('value');
  return quizDataSnapshot.val() || {};
}

export async function updateQuizName(quizName, newName) {
  if (!newName || newName.trim() === '') {
    console.error('New name cannot be empty');
    return;
  }

  // Note: This assumes a structure where quiz names are keys. You might need to adjust
  // this logic based on your exact data structure and what "updating a quiz name" entails.
  const updates = {};
  updates[`/quizzes/${quizName}/name`] = newName; // Adjusted path based on the provided JSON structure
  await update(ref(database), updates);
}
