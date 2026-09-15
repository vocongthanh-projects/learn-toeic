const fs = require('fs');
const path = require('path');

const QUESTIONS_PATH = path.join(__dirname, '../src/data/question_bank/questions.json');

async function translateText(text) {
  const url = 'https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=vi&dt=t&q=' + encodeURIComponent(text);
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`HTTP ${res.status}`);
  }
  const data = await res.json();
  if (data && data[0]) {
    return data[0].map(item => item[0]).join('').trim();
  }
  return null;
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function main() {
  console.log('Loading questions from:', QUESTIONS_PATH);
  const raw = fs.readFileSync(QUESTIONS_PATH, 'utf-8');
  const questions = JSON.parse(raw);

  const part5Questions = questions.filter(q => q.part === 5);
  console.log(`Found ${part5Questions.length} Part 5 questions.`);

  let translatedCount = 0;
  let skippedCount = 0;
  let errorCount = 0;

  for (let i = 0; i < part5Questions.length; i++) {
    const q = part5Questions[i];
    const correctOpt = q.options.find(o => o.key === q.correctAnswer);
    const correctWord = correctOpt ? correctOpt.text : '';

    const currentTrans = q.explanation?.translation || '';
    const isPlaceholder = !currentTrans ||
      currentTrans.includes('Câu hỏi kiểm tra ngữ pháp') ||
      currentTrans.includes('Đoạn văn và câu hỏi kiểm tra') ||
      currentTrans.includes('Câu hoàn chỉnh khi điền') ||
      currentTrans.startsWith('Phương án đúng:');

    if (!isPlaceholder && currentTrans.length > 15) {
      skippedCount++;
      continue;
    }

    const fullSentence = q.question.replace(/_{2,}/g, correctWord).trim();

    try {
      const vi = await translateText(fullSentence);
      if (vi) {
        if (!q.explanation) q.explanation = {};
        q.explanation.translation = vi;
        translatedCount++;
      } else {
        errorCount++;
      }
    } catch (err) {
      console.error(`Error translating question ${q.id}:`, err.message);
      errorCount++;
      await sleep(1000);
    }

    if (i % 20 === 0 || i === part5Questions.length - 1) {
      console.log(`Progress: ${i + 1}/${part5Questions.length} | Translated: ${translatedCount} | Skipped: ${skippedCount} | Errors: ${errorCount}`);
    }

    // Small delay to be polite and avoid rate limits
    await sleep(60);
  }

  console.log(`\nWriting updated questions to file...`);
  fs.writeFileSync(QUESTIONS_PATH, JSON.stringify(questions, null, 2), 'utf-8');
  console.log(`Done! Translated ${translatedCount} questions. Skipped ${skippedCount}. Errors ${errorCount}.`);
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
