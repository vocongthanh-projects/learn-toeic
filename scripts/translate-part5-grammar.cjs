const fs = require('fs');
const path = require('path');

const QUESTIONS_PATH = path.join(__dirname, '../src/data/question_bank/questions.json');

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

// Check if string has English words indicating it needs translation
function isEnglishGrammar(text) {
  if (!text) return false;
  // If it already has rich Vietnamese marker
  if (text.includes('📌') || text.includes('Cấu trúc') || text.includes('Quy tắc') || text.includes('Giữa mạo từ') || text.includes('Phương án')) {
    return false;
  }
  // Common English words in original grammar breakdown
  const enMarkers = /\b(is required|is needed|requires|noun|verb|adjective|adverb|relative|clause|subject|object|possessive|belong to|between|after|before|preposition|because|since|indicates|refers to)\b/i;
  return enMarkers.test(text);
}

async function main() {
  console.log('Loading questions for grammar translation...');
  const questions = JSON.parse(fs.readFileSync(QUESTIONS_PATH, 'utf-8'));
  const part5 = questions.filter(q => q.part === 5);
  console.log(`Found ${part5.length} Part 5 questions.`);

  let translated = 0;
  let skipped = 0;
  let errors = 0;

  for (let i = 0; i < part5.length; i++) {
    const q = part5[i];
    const gb = q.explanation?.grammarBreakdown || '';

    if (!isEnglishGrammar(gb)) {
      skipped++;
      continue;
    }

    try {
      const vi = await translateText(gb);
      if (vi) {
        q.explanation.grammarBreakdown = vi;
        translated++;
      }
    } catch (err) {
      errors++;
      await sleep(500);
    }

    if ((i + 1) % 20 === 0 || i === part5.length - 1) {
      console.log(`Progress: ${i + 1}/${part5.length} | Translated: ${translated} | Skipped: ${skipped} | Errors: ${errors}`);
    }

    await sleep(40);
  }

  console.log(`Saving updated grammar breakdowns...`);
  fs.writeFileSync(QUESTIONS_PATH, JSON.stringify(questions, null, 2), 'utf-8');
  console.log(`Done! Translated ${translated} grammar breakdowns. Skipped: ${skipped}. Errors: ${errors}.`);
}

main().catch(err => {
  console.error('Fatal:', err);
  process.exit(1);
});
