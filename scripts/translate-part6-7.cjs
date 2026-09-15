const fs = require('fs');
const path = require('path');

const QUESTIONS_PATH = path.join(__dirname, '../src/data/question_bank/questions.json');
const PASSAGES_PATH = path.join(__dirname, '../src/data/question_bank/passages.json');

async function translateText(text) {
  if (!text || text.trim().length === 0) return '';
  const url = 'https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=vi&dt=t&q=' + encodeURIComponent(text);
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`HTTP ${res.status}`);
  }
  const data = await res.json();
  if (data && data[0]) {
    return data[0].map(item => item[0]).join('').trim();
  }
  return '';
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function main() {
  console.log('Starting background translation for Part 6 & Part 7...');
  const questions = JSON.parse(fs.readFileSync(QUESTIONS_PATH, 'utf-8'));
  const passages = JSON.parse(fs.readFileSync(PASSAGES_PATH, 'utf-8'));

  const targetQuestions = questions.filter(q => q.part === 6 || q.part === 7);
  console.log(`Found ${targetQuestions.length} questions in Part 6 & 7 to process.`);

  let count = 0;
  let errors = 0;

  for (let i = 0; i < targetQuestions.length; i++) {
    const q = targetQuestions[i];
    const correctOpt = q.options.find(o => o.key === q.correctAnswer);
    const correctWord = correctOpt ? correctOpt.text : '';

    const currentTrans = q.explanation?.translation || '';
    const isPlaceholder = !currentTrans ||
      currentTrans.includes('Câu hỏi kiểm tra') ||
      currentTrans.includes('Đoạn văn và câu hỏi kiểm tra') ||
      currentTrans.includes('Đoạn văn thương mại với từ') ||
      currentTrans.includes('Nội dung bài đọc đưa ra') ||
      currentTrans.startsWith('Phương án đúng:');

    if (!isPlaceholder && currentTrans.length > 20) {
      continue;
    }

    try {
      if (q.part === 6) {
        if (q.question && q.question.includes('______')) {
          const filled = q.question.replace(/_{2,}/g, correctWord).trim();
          const vi = await translateText(filled);
          if (vi) {
            if (!q.explanation) q.explanation = {};
            q.explanation.translation = `Nội dung hoàn chỉnh khi điền [${q.correctAnswer}]: "${vi}".`;
          }
        } else {
          const viOpt = await translateText(correctWord);
          if (!q.explanation) q.explanation = {};
          q.explanation.translation = `Từ/cụm từ thích hợp nhất để điền vào chỗ trống là phương án [${q.correctAnswer}] ("${correctWord}"): ${viOpt}.`;
        }
      } else if (q.part === 7) {
        // Part 7: Translate question prompt + correct answer option
        const [viPrompt, viOpt] = await Promise.all([
          translateText(q.question),
          translateText(correctWord)
        ]);

        if (!q.explanation) q.explanation = {};
        q.explanation.translation = `Câu hỏi: "${viPrompt}".\n👉 Đáp án đúng [${q.correctAnswer}]: "${viOpt}" (${correctWord}).`;
      }

      count++;
    } catch (err) {
      errors++;
      await sleep(1000);
    }

    if ((i + 1) % 25 === 0 || i === targetQuestions.length - 1) {
      console.log(`[P6/P7 Background] Progress: ${i + 1}/${targetQuestions.length} | Translated: ${count} | Errors: ${errors}`);
      // Save periodically every 100 questions
      if ((i + 1) % 100 === 0) {
        fs.writeFileSync(QUESTIONS_PATH, JSON.stringify(questions, null, 2), 'utf-8');
        console.log(`[P6/P7 Background] Auto-saved progress to questions.json.`);
      }
    }

    await sleep(70);
  }

  // Final save
  fs.writeFileSync(QUESTIONS_PATH, JSON.stringify(questions, null, 2), 'utf-8');
  console.log(`\n[P6/P7 Background] Finished! Successfully translated ${count} questions. Total errors: ${errors}.`);
}

main().catch(err => {
  console.error('Fatal error in P6/P7 translation:', err);
});
