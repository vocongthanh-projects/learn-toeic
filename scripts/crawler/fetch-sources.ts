import fs from 'node:fs';
import path from 'node:path';
import https from 'node:https';
import vm from 'node:vm';

function fetchUrl(url: string): Promise<string> {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      if (res.statusCode && res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        return fetchUrl(res.headers.location).then(resolve).catch(reject);
      }
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(data));
    }).on('error', reject);
  });
}

async function fetchSource2(): Promise<void> {
  console.log('Fetching Source 2 (Open TOEIC Practice - Maxim Cuynat)...');
  const targetDir = path.resolve(process.cwd(), 'scripts/sources/source2_open_toeic_prep');
  const testFiles = [
    'reading-test-1.json',
    'reading-test-2.json',
    'reading-test-3.json',
    'reading-test-4.json',
    'reading-test-5.json',
    'reading-test-6.json',
  ];

  const testsData = [];
  for (const filename of testFiles) {
    const url = `https://raw.githubusercontent.com/maximcuynat/toeic-practice/main/data/${filename}`;
    try {
      const raw = await fetchUrl(url);
      const parsed = JSON.parse(raw);
      testsData.push({ filename, data: parsed });
      console.log(`  ✓ Fetched ${filename} (${parsed.parts?.length || 0} parts)`);
    } catch (err: any) {
      console.error(`  ✗ Error fetching ${filename}:`, err.message);
    }
  }

  const outPath = path.join(targetDir, 'raw.json');
  fs.writeFileSync(outPath, JSON.stringify(testsData, null, 2), 'utf-8');
  console.log(`Saved Source 2 raw data to ${outPath} (${testsData.length} tests)`);
}

async function fetchSource3(): Promise<void> {
  console.log('Fetching Source 3 (TOEIC Question Ocean - kdeppaei)...');
  const targetDir = path.resolve(process.cwd(), 'scripts/sources/source3_community_corpus');
  const bankFiles = [
    'question-bank.js',
    'question-bank-v15.js', 'question-bank-v16.js', 'question-bank-v17.js', 'question-bank-v18.js',
    'question-bank-v19.js', 'question-bank-v20.js', 'question-bank-v21.js', 'question-bank-v22.js',
    'question-bank-v23.js', 'question-bank-v24.js', 'question-bank-v25.js', 'question-bank-v26.js',
    'question-bank-v27.js', 'question-bank-v28.js', 'question-bank-v29.js', 'question-bank-v30.js',
    'question-bank-v31.js', 'question-bank-v32.js', 'question-bank-v33.js', 'question-bank-v34.js',
    'question-bank-v40.js', 'question-bank-v41.js', 'question-bank-v42.js', 'question-bank-v43.js',
    'question-bank-v44.js', 'question-bank-v45.js', 'question-bank-v46.js', 'question-bank-v47.js',
    'question-bank-v50.js', 'question-bank-v210.js',
  ];

  const sandbox: { window: { BUILTIN_BANK?: any[] } } = { window: {} };
  vm.createContext(sandbox);

  for (const filename of bankFiles) {
    const url = `https://raw.githubusercontent.com/kdeppaei/toeic-question-ocean/main/${filename}`;
    try {
      const code = await fetchUrl(url);
      vm.runInContext(code, sandbox);
      console.log(`  ✓ Loaded ${filename} (cumulative: ${sandbox.window.BUILTIN_BANK?.length || 0})`);
    } catch (err: any) {
      console.error(`  ✗ Error loading ${filename}:`, err.message);
    }
  }

  const rawQuestions = sandbox.window.BUILTIN_BANK || [];
  const outPath = path.join(targetDir, 'raw.json');
  fs.writeFileSync(outPath, JSON.stringify(rawQuestions, null, 2), 'utf-8');
  console.log(`Saved Source 3 raw data to ${outPath} (${rawQuestions.length} questions)`);
}

async function run() {
  try {
    await fetchSource2();
    await fetchSource3();
    console.log('\nAll external sources fetched successfully.');
  } catch (err) {
    console.error('Fetch failed:', err);
    process.exit(1);
  }
}

run();
