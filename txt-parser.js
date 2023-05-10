// txt-parser.js
export async function parseTxtFile(url, answerKeyURL) {
    //console.log('parseTxtFile called with:', url, answerKeyURL);
    try {
      const response = await fetch(url);
      const txtData = await response.text();
      //console.log('Question Text:', txtData);
      const responseAnswers = await fetch(answerKeyURL);
      const txtAnswers = await responseAnswers.text();
      //console.log('Answer Key Text:', txtAnswers);
      
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
  