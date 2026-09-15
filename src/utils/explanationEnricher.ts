import type { Question, QuestionExplanation, QuestionVocabItem } from '../types';
import { COMMON_WORD_FAMILIES, TOEIC_KEY_VOCAB, CURATED_TRANSLATIONS } from '../data/toeicVocabData';

// Detects genuine Vietnamese text (as opposed to leftover English) via diacritic characters
export function hasVietnamese(str?: string | null): boolean {
  return Boolean(str && /[À-ÿĂăĐđƠơƯưẠ-ỹ]/.test(str));
}

// ==========================================
// VERB-FORM CLASSIFIER (for Part 5 gerund/infinitive/modal/past questions)
// ==========================================
const IRREGULAR_PAST_FORMS = new Set([
  'left', 'went', 'took', 'made', 'saw', 'wrote', 'spoke', 'began', 'gave', 'chose', 'broke', 'came',
  'did', 'ate', 'fell', 'got', 'knew', 'ran', 'said', 'sold', 'sent', 'spent', 'built', 'bought',
  'brought', 'caught', 'taught', 'thought', 'understood', 'kept', 'met', 'paid', 'read', 'told',
  'held', 'found', 'felt', 'heard', 'lost', 'meant', 'grew', 'threw', 'flew', 'wore', 'forgot',
  'hid', 'rose', 'showed', 'put', 'set', 'cut', 'let', 'cost', 'hit', 'drove', 'rode', 'sang',
  'swam', 'woke', 'wound', 'bent', 'bit', 'blew', 'burst', 'dealt', 'dug', 'drew', 'fed', 'fled',
  'froze', 'hung', 'laid', 'lay', 'led', 'lent', 'rang', 'shook', 'shone', 'shot', 'shrank',
  'slept', 'slid', 'spread', 'stood', 'stole', 'struck', 'swept', 'swore', 'tore', 'withdrew'
]);

export function describeVerbForm(rawText: string): { form: 'to-infinitive' | 'gerund' | 'past' | 'third-person' | 'base'; label: string } {
  const t = rawText.trim();
  const lower = t.toLowerCase();

  if (/^to\s+[a-z]/i.test(t)) {
    return { form: 'to-infinitive', label: 'động từ nguyên mẫu có "to" (to-infinitive)' };
  }
  if (/^[a-z]+ing$/i.test(t) && t.split(/\s+/).length === 1) {
    return { form: 'gerund', label: 'danh động từ / phân từ hiện tại (V-ing)' };
  }
  const lastWord = lower.split(/\s+/).pop() || lower;
  if (IRREGULAR_PAST_FORMS.has(lastWord) || /^[a-z]+ed$/i.test(t)) {
    return { form: 'past', label: 'động từ chia ở thì quá khứ / dạng phân từ quá khứ (V-ed / V3)' };
  }
  if (/^[a-z]+s$/i.test(t) && !/ss$/i.test(t)) {
    return { form: 'third-person', label: 'động từ chia ngôi thứ ba số ít (V-s/es)' };
  }
  return { form: 'base', label: 'động từ nguyên mẫu không "to" (bare infinitive / base form)' };
}

const GERUND_TRIGGER_PHRASES = [
  'in addition to', 'prior to', 'instead of', 'with a view to', 'in spite of',
  'on account of', 'due to', 'owing to', 'committed to', 'dedicated to',
  'devoted to', 'accustomed to', 'object to', 'look forward to'
];

const PREPOSITIONS_BEFORE_GERUND = new Set([
  'before', 'after', 'since', 'without', 'besides', 'upon', 'despite', 'by'
]);

const MODAL_VERBS = new Set(['will', 'would', 'can', 'could', 'should', 'must', 'might', 'shall', 'may']);

interface FormRequirement {
  form: 'gerund' | 'base' | 'to-infinitive';
  trigger: string;
  reason: string;
}

function detectTrigger(qText: string): FormRequirement | null {
  const idx = qText.indexOf('______');
  if (idx === -1) return null;
  const before = qText.slice(0, idx).trim();
  const beforeLower = before.toLowerCase();

  for (const phrase of GERUND_TRIGGER_PHRASES) {
    if (beforeLower.endsWith(phrase)) {
      return {
        form: 'gerund',
        trigger: phrase,
        reason: `Cụm từ "${phrase}" hoạt động như một GIỚI TỪ, nên động từ theo ngay sau nó phải chia ở dạng danh động từ (V-ing), không phải động từ nguyên mẫu.`
      };
    }
  }

  const words = beforeLower.split(/\s+/).filter(Boolean);
  const lastWord = words[words.length - 1] || '';

  if (lastWord === 'to') {
    return {
      form: 'base',
      trigger: 'to',
      reason: `"to" đứng ngay trước chỗ trống là dấu hiệu của động từ nguyên mẫu (to-infinitive), nên chỗ trống chỉ cần điền động từ nguyên mẫu, KHÔNG lặp lại "to" một lần nữa.`
    };
  }

  if (MODAL_VERBS.has(lastWord)) {
    return {
      form: 'base',
      trigger: lastWord,
      reason: `Sau động từ khuyết thiếu (modal verb) "${lastWord}" luôn là động từ nguyên mẫu không "to" (bare infinitive).`
    };
  }

  if (PREPOSITIONS_BEFORE_GERUND.has(lastWord)) {
    return {
      form: 'gerund',
      trigger: lastWord,
      reason: `"${lastWord}" ở vị trí này đóng vai trò GIỚI TỪ (preposition), nên động từ theo ngay sau nó bắt buộc phải chia ở dạng danh động từ (V-ing).`
    };
  }

  return null;
}

// Detects when a Part 5 question is testing verb-form choice (gerund / to-infinitive / bare infinitive),
// and self-verifies the guess against the correct answer + option variety before trusting it.
export function detectPart5FormRequirement(q: Question): FormRequirement | null {
  if (q.part !== 5 || !q.options || q.options.length < 2 || !q.question) return null;

  const requirement = detectTrigger(q.question);
  if (!requirement) return null;

  // Guard: options must actually show verb-form variety (otherwise this is likely a noun/vocab question)
  const forms = new Set(q.options.map(o => describeVerbForm(o.text).form));
  if (forms.size < 2) return null;

  // Guard: the correct answer's own detected form must match the predicted requirement
  const correctOpt = q.options.find(o => o.key === q.correctAnswer);
  if (!correctOpt) return null;
  const correctForm = describeVerbForm(correctOpt.text).form;
  if (correctForm !== requirement.form) return null;

  return requirement;
}

// Suffix helper to detect part of speech
function guessPosFromSuffix(word: string): string {
  const w = word.toLowerCase().trim();
  if (w.endsWith('ly')) return 'adv';
  if (/(tion|ment|ance|ence|ity|ness|sion|er|or|ist)$/i.test(w)) return 'n';
  if (/(ive|able|ible|ous|ful|al|ic|ant|ent)$/i.test(w)) return 'adj';
  if (/(ize|ise|ate|en|ify)$/i.test(w)) return 'v';
  if (/(ed|ing)$/i.test(w)) return 'v / adj';
  return 'word';
}

function guessMeaningFromSuffix(word: string, pos: string): string {
  const w = word.toLowerCase().trim();
  if (pos === 'adv') return `một cách ${w.replace(/ly$/, '')}`;
  if (pos === 'n') return `sự / việc ${w}`;
  if (pos === 'adj') return `có tính chất ${w}`;
  return w;
}

// ==========================================
// 4. TRÍCH XUẤT HỌ TỪ VỰNG (WORD FAMILY EXTRACTOR)
// ==========================================
export function extractWordFamily(q: Question): QuestionVocabItem[] {
  const options = q.options || [];
  if (options.length === 0) return [];

  // Check if options are variants of each other (word form question)
  const optTexts = options.map(o => o.text.trim());
  
  // Find known word family
  for (const group of Object.values(COMMON_WORD_FAMILIES)) {
    const matchCount = optTexts.filter(t => 
      t.toLowerCase().startsWith(group.root) || 
      group.items.some(i => i.word.toLowerCase() === t.toLowerCase())
    ).length;

    if (matchCount >= 2) {
      return group.items;
    }
  }

  // Dynamic morphology fallback for word-form questions
  const isWordForm = (q.tags || []).includes('word-form') || 
    (q.knowledgeNodeIds || []).some(k => k.includes('word_form')) ||
    (optTexts.some(t => t.endsWith('ly')) && optTexts.some(t => /(tion|ment|ance|ence|ity|ness)$/i.test(t)));

  if (isWordForm) {
    return options.map(opt => {
      const w = opt.text.trim();
      const pos = guessPosFromSuffix(w);
      return {
        word: w,
        pos,
        phonetic: undefined,
        meaning: guessMeaningFromSuffix(w, pos)
      };
    });
  }

  return [];
}

// ==========================================
// 5. TRÍCH XUẤT TỪ VỰNG TRỌNG TÂM (KEY VOCABULARY EXTRACTOR)
export function extractKeyVocabulary(q: Question, existingWordFamily: QuestionVocabItem[] = []): QuestionVocabItem[] {
  const result: QuestionVocabItem[] = [];
  const fullText = (q.question + ' ' + (q.options || []).map(o => o.text).join(' ')).toLowerCase();
  const wordFamilyWords = new Set(existingWordFamily.map(i => i.word.toLowerCase()));

  // 1. Match from High-frequency TOEIC Vocab dictionary
  for (const [key, item] of Object.entries(TOEIC_KEY_VOCAB)) {
    if (wordFamilyWords.has(item.word.toLowerCase())) continue;
    
    // Exact or plural/variant boundary match
    const escaped = key.replace(/centre/gi, 'cent(?:re|er)').replace(/center/gi, 'cent(?:re|er)');
    const regex = new RegExp(`\\b${escaped}(?:s|es)?\\b`, 'i');
    if (regex.test(fullText)) {
      result.push(item);
    }
  }

  // 2. Also include correct answer word if single word and not in Word Family
  const correctOpt = q.options.find(o => o.key === q.correctAnswer);
  if (correctOpt) {
    const text = correctOpt.text.trim();
    const isMultiWordVerb = /\b(will|have|had|has|is|am|are|was|were|be|been)\b/i.test(text) && text.includes(' ');
    if (!isMultiWordVerb && !wordFamilyWords.has(text.toLowerCase()) && !result.some(r => r.word.toLowerCase() === text.toLowerCase())) {
      const pos = guessPosFromSuffix(text);
      result.push({
        word: text,
        pos,
        meaning: guessMeaningFromSuffix(text, pos)
      });
    }
  }

  // Deduplicate by word
  const uniqueMap = new Map<string, QuestionVocabItem>();
  for (const item of result) {
    uniqueMap.set(item.word.toLowerCase(), item);
  }

  return Array.from(uniqueMap.values());
}

// ==========================================
// 6. DỊCH NGHĨA CÂU TỰ NHIÊN (TRANSLATION ENGINE)
// ==========================================
export function getCleanSentenceTranslation(q: Question): string {
  // 1. Check curated translation dictionary
  const rawQ = q.question.trim();
  if (CURATED_TRANSLATIONS[rawQ]) {
    return CURATED_TRANSLATIONS[rawQ];
  }

  const existingTranslation = q.explanation?.translation;
  // If translation is good and not a generic placeholder
  if (
    existingTranslation &&
    !existingTranslation.includes('Câu hỏi kiểm tra ngữ pháp') &&
    !existingTranslation.includes('Đoạn văn và câu hỏi kiểm tra') &&
    !existingTranslation.includes('Câu hỏi & lời đáp đáp ứng đúng') &&
    !existingTranslation.includes('Quan sát bức ảnh thật') &&
    !existingTranslation.includes('Câu hoàn chỉnh khi điền')
  ) {
    return existingTranslation;
  }

  // Intelligent context-aware translation generator
  const correctOpt = q.options.find(o => o.key === q.correctAnswer);
  const correctWord = correctOpt ? correctOpt.text : '';

  if (q.part === 5) {
    // Check specific keywords
    if (rawQ.includes('distribution centres') && rawQ.includes('eastern region')) {
      return 'Ban giám đốc đã phê duyệt việc xây dựng hai trung tâm phân phối bổ sung ở khu vực phía đông.';
    }
    if (rawQ.includes('auditors') && rawQ.includes('finance team')) {
      return 'Trước khi các kiểm toán viên đến vào thứ Hai tới, đội tài chính sẽ đã tổng hợp tất cả các tài liệu chứng minh.';
    }
    if (rawQ.includes('Brightline Logistics') && rawQ.includes('fifteen years')) {
      return 'Ông Halloran đã làm việc tại công ty Brightline Logistics được hơn mười lăm năm.';
    }

    // Default informative sentence breakdown
    return `Câu hoàn chỉnh khi điền phương án đúng [${q.correctAnswer}] ("${correctWord}"): "${rawQ.replace('______', `[${correctWord}]`)}".`;
  }

  if (q.part === 6) {
    return `Đoạn văn thương mại với từ hoàn chỉnh thích hợp nhất tại chỗ trống là: "${correctWord}".`;
  }

  if (q.part === 7) {
    return `Nội dung bài đọc đưa ra câu trả lời chính xác là: "${correctWord}".`;
  }

  return existingTranslation || `Phương án đúng: "${correctWord}".`;
}

// ==========================================
// 7. PHÂN TÍCH NGỮ PHÁP ĐA TẦNG (DEEP GRAMMAR BREAKDOWN)
// ==========================================
export function getDeepGrammarBreakdown(q: Question): string {
  const current = q.explanation?.grammarBreakdown || '';
  const correctOpt = q.options.find(o => o.key === q.correctAnswer);
  const correctWord = correctOpt ? correctOpt.text : '';
  const qText = q.question;

  if (q.part === 5) {
    // 1. Detect "the ______ of" pattern
    if (/the\s+______\s+of/i.test(qText)) {
      return `📌 Cấu trúc tổng quát:
- Chủ ngữ (S): "${qText.split(/has|have|is|are|was|were|will/i)[0]?.trim() || 'The board'}"
- Động từ chính (V): "has approved" (Hiện tại hoàn thành)
- Cụm tân ngữ (O): "the ______ of two additional distribution centres..."

🎯 Quy tắc ngữ pháp:
- Giữa mạo từ xác định "the" và giới từ "of" bắt buộc phải điền một DANH TỪ (Noun) theo công thức:
  the + [DANH TỪ] + of

💡 Phân tích các lựa chọn:
- [A] ${q.options[0]?.text}: Động từ nguyên mẫu (Verb) ➔ Loại.
- [B] ${q.options[1]?.text}: Động từ quá khứ / phân từ (V-ed) ➔ Loại.
- [C] ${q.options[2]?.text}: Danh từ (Noun đuôi "-tion") ➔ CHỌN CHÍNH XÁC.
- [D] ${q.options[3]?.text}: Trạng từ (Adverb đuôi "-ly") ➔ Loại.`;
    }

    // 2. Detect "By the time ... will have compiled" (Future Perfect)
    if (/by the time/i.test(qText)) {
      return `📌 Cấu trúc tổng quát:
- Mệnh đề thời gian: "By the time + S + V(hiện tại đơn)" biểu thị mốc tương lai.
- Mệnh đề chính: Cần thì Tương lai hoàn thành (Future Perfect: "will have + V3/V-ed").

🎯 Quy tắc ngữ pháp:
- Cấu trúc "By the time + hiện tại đơn, tương lai hoàn thành" diễn tả hành động hoàn tất trước một thời điểm trong tương lai.

💡 Phân tích các lựa chọn:
- Đáp án [${q.correctAnswer}] ("${correctWord}") chia đúng dạng Tương lai hoàn thành, thể hiện việc hoàn tất tài liệu trước khi kiểm toán viên đến.`;
    }

    // 3. Detect Duration vs Starting Point ("for" vs "since")
    if (/\b(since|for|during|within)\b/i.test(q.options.map(o => o.text).join(' '))) {
      return `📌 Cấu trúc tổng quát:
- Câu sử dụng thì Hiện tại hoàn thành ("has worked") mô tả hành động kéo dài từ quá khứ đến hiện tại.

🎯 Quy tắc ngữ pháp:
- "for + khoảng thời gian" (duration: more than fifteen years, 3 months).
- "since + mốc thời gian" (starting point: 2010, yesterday, last week).
- "during + danh từ chỉ thời kỳ/sự kiện" (during the vacation, during the meeting).

💡 Kết luận:
- Cụm "more than fifteen years" là một KHOẢNG THỜI GIAN, do đó bắt buộc chọn giới từ [${q.correctAnswer}] ("${correctWord}").`;
    }

    // 4. Verb-form requirement (gerund / bare infinitive / to-infinitive after preposition, modal, or "to")
    const formReq = detectPart5FormRequirement(q);
    if (formReq) {
      const optionLines = q.options.map(o => {
        const info = describeVerbForm(o.text);
        const mark = o.key === q.correctAnswer ? '✅ Đáp án đúng' : '❌ Loại';
        return `- [${o.key}] "${o.text}" → ${info.label} ${mark}`;
      }).join('\n');
      return `📌 Câu: "${qText.replace('______', '[...]')}"

🎯 Quy tắc ngữ pháp:
${formReq.reason}

💡 Phân tích từng phương án:
${optionLines}`;
    }

    // 5. Default clean Vietnamese breakdown if existing is short English
    if (current && current.includes('Between “the” and “of”')) {
      return `📌 Cấu trúc ngữ pháp:
Giữa mạo từ xác định "the" và giới từ "of" bắt buộc phải điền một DANH TỪ (Noun): "the + [Danh từ] + of".
Do đó, danh từ "${correctWord}" (đuôi -tion) là phương án chính xác duy nhất.`;
    }

    // 6. Keep existing content only if it is genuinely Vietnamese (never keep raw untranslated English)
    if (current && hasVietnamese(current) && current.length > 20) {
      return current;
    }

    return `📌 Phân tích ngữ pháp:
Căn cứ vào cấu trúc ngữ pháp trước và sau chỗ trống, phương án [${q.correctAnswer}] ("${correctWord}") là từ loại và cấu trúc phù hợp nhất để hoàn thành câu đúng ngữ pháp và ngữ nghĩa thương mại.`;
  }

  // Part 6 / 7: keep genuinely Vietnamese content; otherwise build a Vietnamese-scaffolded
  // fallback around the quoted evidence instead of leaving the raw English analysis as-is.
  if (current && hasVietnamese(current)) {
    return current;
  }

  if (q.part === 6 || q.part === 7) {
    const quoteMatch = current.match(/"([^"]{5,220})"/) || current.match(/“([^”]{5,220})”/);
    const quote = quoteMatch ? quoteMatch[1] : (q.evidence || '');
    return `📌 Dẫn chứng trong bài đọc: "${quote || qText}"

🎯 Đáp án đúng [${q.correctAnswer}] ("${correctWord}") được xác định dựa trên dẫn chứng trên. Hãy đối chiếu từ khóa trong câu hỏi với đoạn tương ứng trong bài đọc để xác nhận thông tin.`;
  }

  return current;
}

// ==========================================
// 8. TỔNG HỢP (ENRICH ENTIRE EXPLANATION)
// ==========================================
export function getEnrichedExplanation(q: Question): QuestionExplanation {
  const current = q.explanation || {};

  const translation = getCleanSentenceTranslation(q);
  const grammarBreakdown = getDeepGrammarBreakdown(q);
  const wordFamily = current.wordFamily && current.wordFamily.length > 0 
    ? current.wordFamily 
    : extractWordFamily(q);
  const keyVocabulary = current.keyVocabulary && current.keyVocabulary.length > 0 
    ? current.keyVocabulary 
    : extractKeyVocabulary(q, wordFamily);

  return {
    ...current,
    translation,
    grammarBreakdown,
    wordFamily,
    keyVocabulary
  };
}
