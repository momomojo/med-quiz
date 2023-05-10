// firebase-handler.js
export async function getQuizNames() {
    const quizNamesSnapshot = await database.ref('/quizNames').once('value');
    return quizNamesSnapshot.val() || {};
  }
  
  export async function updateQuizName(quizName, newName) {
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
  