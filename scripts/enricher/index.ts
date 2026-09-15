import type { Question, QuestionExplanation } from '../../src/types';
import { TAXONOMY } from '../../src/data/taxonomy';
import { QUESTION_TYPE_VI_MAP, TAGS_VI_MAP, translateEvidenceLocation, translateQuestionType } from './dictionary';
import {
  extractWordFamily,
  extractKeyVocabulary,
  getCleanSentenceTranslation,
  getDeepGrammarBreakdown,
  detectPart5FormRequirement,
  describeVerbForm,
  detectPart5ConnectorContrast,
  classifyConnector,
  hasVietnamese
} from '../../src/utils/explanationEnricher';

const VALID_TAXONOMY_IDS = new Set(Object.keys(TAXONOMY));


function hasChinese(str?: string): boolean {
  return Boolean(str && /[\u4e00-\u9fa5]/.test(str));
}

export function enrichQuestion(q: Question): Question {
  // 1. Assign Knowledge Node IDs
  const assignedNodes = assignKnowledgeNodes(q);
  const validNodes = assignedNodes.filter(id => VALID_TAXONOMY_IDS.has(id));
  q.knowledgeNodeIds = validNodes.length > 0 ? validNodes : [getDefaultNodeForPart(q.part)];

  // 2. Translate questionType if Chinese
  if (q.questionType) {
    q.questionType = translateQuestionType(q.questionType);
  }

  // 3. Translate tags if Chinese
  if (q.tags && Array.isArray(q.tags)) {
    q.tags = q.tags.map(t => TAGS_VI_MAP[t] || t);
  }

  // 4. Translate evidenceLocation if Chinese
  if (q.evidenceLocation) {
    q.evidenceLocation = translateEvidenceLocation(q.evidenceLocation);
  }

  // 5. Enrich Explanation if missing fields or contains non-Vietnamese
  q.explanation = enrichExplanation(q);

  return q;
}

function getDefaultNodeForPart(part: number): string {
  switch (part) {
    case 5: return 'grammar.word_form.noun_suffix';
    case 6: return 'reading.part6.text_completion';
    case 7: return 'reading.part7.comprehension';
    default: return 'grammar.word_form.noun_suffix';
  }
}

function assignKnowledgeNodes(q: Question): string[] {
  const nodes: string[] = [];
  const optionsText = (q.options || []).map(o => o.text).join(' ');
  const text = (q.question + ' ' + optionsText + ' ' + (q.tags || []).join(' ') + ' ' + (q.explanation?.grammarBreakdown || '')).toLowerCase();

  if (q.part === 6) {
    const hasLongOption = q.options && q.options.some(o => o.text && o.text.length > 45);
    if (text.includes('sentence') || hasLongOption) {
      nodes.push('reading.part6.sentence_insertion');
    } else {
      nodes.push('reading.part6.text_completion');
    }
    return nodes;
  }

  if (q.part === 7) {
    if (text.includes('imply') || text.includes('suggest') || text.includes('most likely') || text.includes('infer')) {
      nodes.push('reading.part7.inference_paraphrase');
    } else {
      nodes.push('reading.part7.comprehension');
    }
    return nodes;
  }

  // Part 5 - Detailed grammar & vocabulary classification
  const isPronoun = /himself|herself|themselves|itself|myself|yourself|whose|pronoun|đại từ|代名詞/.test(text) ||
    Boolean(q.options && q.options.some(o => /^(he|him|his|himself|she|her|hers|herself|they|them|their|theirs|themselves|we|us|our|ours|ourselves|it|its|itself)$/i.test(o.text.trim())));

  const isAdjAdv = /trạng từ|tính từ|副詞|形容詞|adverb|adjective/.test(text) ||
    Boolean(q.options && q.options.some(o => o.text.trim().endsWith('ly')) && q.options.some(o => /ful$|ive$|able$|ic$|al$|ous$/i.test(o.text.trim())));

  const isAdvModAdj = /highly|extremely|remarkably|exceptionally|particularly|substantially|adverb_modifying/.test(text);

  if (isPronoun) {
    nodes.push('grammar.pronoun.case');
  } else if (isAdvModAdj) {
    nodes.push('grammar.word_form.adverb_modifying_adjective');
  } else if (isAdjAdv) {
    nodes.push('grammar.word_form.adjective_and_adverb');
  } else if (text.includes('responsible')) {
    nodes.push('grammar.preposition.collocation.responsible_for');
  } else if (text.includes('comply') || text.includes('adhere') || text.includes('accordance') || text.includes('abide')) {
    nodes.push('grammar.preposition.collocation.comply_with');
  } else if (text.includes('prior to') || text.includes('prior')) {
    nodes.push('grammar.preposition.collocation.prior_to');
  } else if (text.includes('yesterday') || text.includes('ago') || text.includes('formerly') || text.includes('past_simple')) {
    nodes.push('grammar.verb.tense.past_simple');
  } else if (text.includes('since') || text.includes('over the past') || text.includes('present-perfect')) {
    nodes.push('grammar.verb.tense.present_perfect');
  } else if (text.includes('passive') || text.includes('be submitted') || text.includes('be repaired') || text.includes('was delayed')) {
    nodes.push('grammar.verb.passive_voice');
  } else if (text.includes('each of') || text.includes('neither') || text.includes('either') || text.includes('subject-verb')) {
    nodes.push('grammar.verb.subject_verb_agreement');
  } else if (text.includes('capable of') || text.includes('interested in') || text.includes('gerund') || text.includes('to-infinitive') || text.includes('in order to')) {
    nodes.push('grammar.verb.gerund_and_infinitive');
  } else if (text.includes('unless') || text.includes('if') || text.includes('conditional')) {
    nodes.push('grammar.verb.conditional');
  } else if (text.includes('although') || text.includes('despite') || text.includes('concession') || text.includes('contrast')) {
    nodes.push('grammar.conjunction_vs_preposition.concession');
  } else if (text.includes('relative-clause') || text.includes('reduction')) {
    nodes.push('grammar.relative_clause.reduction');
  } else if (text.includes('when') || text.includes('until') || text.includes('as soon as') || text.includes('time_clause')) {
    nodes.push('grammar.verb.time_clause');
  } else if (text.includes('within') || text.includes('during') || text.includes('deadline') || text.includes('preposition')) {
    nodes.push('grammar.preposition.time_place');
  } else if (text.includes('efficiently') || text.includes('highly')) {
    nodes.push('grammar.word_form.adverb_modifying_adjective');
  } else if (text.includes('word-form') || text.includes('suffix') || text.includes('approval') || text.includes('construction')) {
    nodes.push('grammar.word_form.noun_suffix');
  } else if (text.includes('vocabulary') || text.includes('revenue') || text.includes('reimbursement') || text.includes('negotiate') || text.includes('warranty')) {
    nodes.push('vocabulary.business.collocation');
  } else {
    nodes.push('grammar.word_form.noun_suffix');
  }

  return nodes;
}

const PREPOSITION_SET = new Set([
  'in', 'on', 'at', 'for', 'since', 'during', 'within', 'by', 'until', 'before', 'after', 'about',
  'with', 'without', 'through', 'among', 'between', 'despite', 'from', 'of', 'to', 'into', 'onto',
  'upon', 'toward', 'towards', 'against', 'along', 'across', 'behind', 'beyond', 'beside', 'besides',
  'underneath', 'throughout'
]);

export function enrichExplanation(q: Question): QuestionExplanation {
  const current = q.explanation || {};
  const correctOpt = q.options.find(o => o.key === q.correctAnswer);
  const correctText = correctOpt ? correctOpt.text : '';

  // 2. Base Translation
  let translation = current.translation;
  if (!translation || hasChinese(translation) || translation.includes('Câu hỏi kiểm tra ngữ pháp')) {
    translation = getCleanSentenceTranslation(q);
  }

  // 3. Grammar Breakdown
  let grammarBreakdown = current.grammarBreakdown;
  if (!grammarBreakdown || hasChinese(grammarBreakdown) || !hasVietnamese(grammarBreakdown) || grammarBreakdown.includes('Between “the” and “of”') || grammarBreakdown.includes('Căn cứ vào cấu trúc ngữ pháp trước và sau chỗ trống') || grammarBreakdown.length < 30) {
    grammarBreakdown = getDeepGrammarBreakdown(q);
  } else if (q.evidence && !grammarBreakdown.includes('Dẫn chứng')) {
    grammarBreakdown = `Dẫn chứng trong văn bản: "${q.evidence}". ${grammarBreakdown}`;
  }

  // 4. Distractors Analysis
  let distractors: Partial<Record<'A' | 'B' | 'C' | 'D', string>> = {};
  const part5FormReq = q.part === 5 ? detectPart5FormRequirement(q) : null;
  const part5ConnectorReq = q.part === 5 && !part5FormReq ? detectPart5ConnectorContrast(q) : null;

  const hasValidNonChineseNotes = q.choiceNotes && Array.isArray(q.choiceNotes) && q.choiceNotes.length > 0 && !q.choiceNotes.some(hasChinese);

  if (hasValidNonChineseNotes && q.choiceNotes) {
    // Use clean choiceNotes from annotations
    const keys: Array<'A' | 'B' | 'C' | 'D'> = ['A', 'B', 'C', 'D'];
    q.choiceNotes.forEach((note, idx) => {
      const optKey = keys[idx];
      if (optKey && optKey !== q.correctAnswer) {
        distractors[optKey] = note;
      }
    });
  } else if (q.part === 2) {
    // Specific Part 2 Distractor Analysis
    const qLower = (q.question + ' ' + (q.transcript || '')).toLowerCase();
    const whMatch = qLower.match(/\b(who|where|when|why|what|how|which)\b/);

    for (const opt of q.options) {
      if (opt.key === q.correctAnswer) continue;
      const optLower = opt.text.toLowerCase();

      if (whMatch && /^(yes|no|sure|certainly|of course|yep|nope)\b/i.test(opt.text)) {
        distractors[opt.key] = `⚡ Bẫy Yes/No: Câu hỏi có từ để hỏi Wh- ("${whMatch[1].toUpperCase()}") là câu hỏi thông tin, tuyệt đối không trả lời bằng Yes/No.`;
      } else if (whMatch && whMatch[1] === 'where' && /(o'clock|am|pm|tomorrow|yesterday|monday|friday|next week|minutes|hours)/i.test(optLower)) {
        distractors[opt.key] = `⚡ Bẫy lệch thông tin: Câu hỏi hỏi địa điểm ("Where") nhưng phương án lại đưa ra mốc thời gian ("When").`;
      } else if (whMatch && whMatch[1] === 'when' && /(room|office|building|floor|street|station|hall|avenue|desk)/i.test(optLower)) {
        distractors[opt.key] = `⚡ Bẫy lệch thông tin: Câu hỏi hỏi thời gian ("When") nhưng phương án lại đưa ra vị trí nơi chốn ("Where").`;
      } else if (whMatch && whMatch[1] === 'who' && /(tomorrow|yesterday|because|at the office)/i.test(optLower)) {
        distractors[opt.key] = `⚡ Bẫy lệch đối tượng: Câu hỏi hỏi về danh tính người ("Who") nhưng phương án lại trả lời thời gian hoặc địa điểm.`;
      } else {
        distractors[opt.key] = `Phương án (${opt.key}) "${opt.text}" là câu phản hồi lạc đề hoặc dùng từ cùng gốc (same-word trap) để đánh lừa người nghe.`;
      }
    }
  } else if (q.part === 5) {
    // Specific Part 5 Distractor Analysis
    const allPrepositions = q.options.every(o => PREPOSITION_SET.has(o.text.trim().toLowerCase()));

    for (const opt of q.options) {
      if (opt.key === q.correctAnswer) continue;
      const t = opt.text.trim();

      if (part5FormReq) {
        // Verb-form question (gerund / bare infinitive / to-infinitive) — explain by actual form, not suffix guessing.
        const info = describeVerbForm(t);
        distractors[opt.key] = `"${t}" là ${info.label}. ${part5FormReq.reason} Do đó phương án này sai về dạng động từ (verb form).`;
      } else if (part5ConnectorReq) {
        const info = classifyConnector(t);
        if (info.category !== 'unknown' && info.category !== part5ConnectorReq.category) {
          distractors[opt.key] = `"${t}" là ${info.label}, khác loại với đáp án đúng "${correctText}" (${part5ConnectorReq.label}) — không thể thay thế trong cấu trúc câu này.`;
        } else {
          distractors[opt.key] = `Phương án (${opt.key}) "${t}" không phù hợp về nghĩa/logic liên kết ý so với đáp án đúng "${correctText}" trong câu này.`;
        }
      } else if (allPrepositions) {
        // All 4 options are prepositions: the error is meaning/usage, not part of speech.
        distractors[opt.key] = `"${t}" tuy cũng là giới từ nhưng sai về ý nghĩa/ngữ cảnh sử dụng (thời gian, địa điểm hay cách thức) so với đáp án đúng "${correctText}" trong câu này.`;
      } else if (t.endsWith('ly')) {
        distractors[opt.key] = `"${t}" là TRẠNG TỪ (Adverb đuôi -ly), không thể đứng làm chủ ngữ, tân ngữ hoặc bổ nghĩa trực tiếp cho danh từ ở vị trí này.`;
      } else if (/(tion|ment|ance|ence|ity|ness|sion)$/i.test(t)) {
        distractors[opt.key] = `"${t}" là DANH TỪ (Noun), không phù hợp vị trí đòi hỏi động từ hoặc tính từ trong câu.`;
      } else if (/(ive|able|ible|ous|ful|al|ic)$/i.test(t)) {
        distractors[opt.key] = `"${t}" là TÍNH TỪ (Adjective), không thể đóng vai trò làm tân ngữ hoặc động từ chính của câu.`;
      } else if (/(ed|ing|es|s)$/i.test(t)) {
        distractors[opt.key] = `"${t}" là dạng ĐỘNG TỪ chia thì/phân từ, sai về cấu trúc ngữ pháp đối với vị trí trống này.`;
      } else {
        distractors[opt.key] = `Phương án (${opt.key}) "${t}" sai về từ loại hoặc không đúng cấu trúc kết hợp từ (collocation).`;
      }
    }
  } else if (q.part === 6 || q.part === 7) {
    // Specific Reading Distractor Analysis
    for (const opt of q.options) {
      if (opt.key === q.correctAnswer) continue;
      const t = opt.text;

      if (/\b(always|never|all|only|every|must|none)\b/i.test(t)) {
        distractors[opt.key] = `⚡ Bẫy tuyệt đối hóa: Chứa từ mang nghĩa tuyệt đối ("${t.match(/\b(always|never|all|only|every|must|none)\b/i)?.[0]}"), trong khi bài đọc chỉ đề cập thông tin có điều kiện.`;
      } else {
        distractors[opt.key] = `Phương án (${opt.key}) "${t}" suy diễn vượt quá phạm vi bài đọc hoặc lặp lại từ khóa trong văn bản nhưng sai mối quan hệ logic.`;
      }
    }
  } else {
    for (const opt of q.options) {
      if (opt.key !== q.correctAnswer) {
        distractors[opt.key] = `Phương án (${opt.key}) "${opt.text}" không phù hợp với ngữ cảnh của bài nghe.`;
      }
    }
  }

  // 5. Why You Got It Wrong
  let whyYouGotItWrong = current.whyYouGotItWrong;
  if (!whyYouGotItWrong || hasChinese(whyYouGotItWrong)) {
    if (q.part === 1) {
      whyYouGotItWrong = `Bị lừa bởi từ đồng âm hoặc nghe thấy từ quen thuộc nhưng hành động/đồ vật đó không có trong hình.`;
    } else if (q.part === 2) {
      whyYouGotItWrong = `Dính bẫy Yes/No ở câu hỏi Wh- hoặc bị lừa bởi bẫy lặp lại từ cùng gốc (same-word trap).`;
    } else if (q.part === 5) {
      whyYouGotItWrong = `Chọn theo cảm tính/quán tính thói quen mà chưa phân tích kỹ từ loại đứng trước và sau chỗ trống.`;
    } else if (q.part === 7) {
      whyYouGotItWrong = `Bẫy từ vựng lặp lại nguyên xi từ bài đọc (bẫy búp bê Nga) hoặc suy diễn vượt quá thông tin được cung cấp trong văn bản.`;
    } else {
      whyYouGotItWrong = `Nghe sót từ khóa chính hoặc bị phân tâm bởi các từ đồng âm gây nhiễu (distractors).`;
    }
  }

  // 6. Quick Trick
  let quickTrick = current.quickTrick;
  if (part5FormReq) {
    // Override any stale generic tip with a trigger-specific one — this is strictly more useful.
    const formLabel = part5FormReq.form === 'gerund' ? 'V-ing' : part5FormReq.form === 'base' ? 'động từ nguyên mẫu không "to"' : 'to-infinitive';
    quickTrick = `⚡ Nhận diện "${part5FormReq.trigger}" ngay trước chỗ trống ➔ chỗ trống phải là ${formLabel}. Loại ngay các phương án chia thì/dạng khác.`;
  } else if (part5ConnectorReq) {
    quickTrick = `⚡ Mẹo liên từ: Xác định vế sau chỗ trống là một MỆNH ĐỀ đầy đủ (S+V) hay chỉ một CỤM DANH TỪ/V-ing, rồi chọn đúng loại từ nối (liên từ / giới từ / trạng từ liên kết) tương ứng.`;
  } else if (!quickTrick || hasChinese(quickTrick)) {
    if (q.part === 1) {
      quickTrick = `⚡ Mẹo Part 1: Loại trừ ngay các phương án có chứa "is being + V3" nếu trong ảnh không có người đang thực hiện hành động.`;
    } else if (q.part === 2) {
      quickTrick = `⚡ Mẹo Part 2: Câu hỏi bắt đầu bằng Wh- (Who, Where, When, Why) ➔ Loại ngay lập tức các đáp án có Yes/No!`;
    } else if (q.part === 5) {
      quickTrick = `⚡ Mẹo 3 giây: Xác định từ loại đứng trước và đứng sau chỗ trống để loại ngay 2 đáp án sai trước khi dịch nghĩa.`;
    } else if (q.part === 7) {
      quickTrick = `⚡ Mẹo Part 7: Đáp án đúng thường là từ đồng nghĩa (paraphrase) của thông tin trong bài, hiếm khi chép nguyên 100% từng chữ.`;
    } else {
      quickTrick = `⚡ Mẹo: Đọc lướt nhanh câu hỏi và phương án trước khi nghe để chủ động bắt từ khóa.`;
    }
  }

  const wordFamily = current.wordFamily && current.wordFamily.length > 0 ? current.wordFamily : extractWordFamily(q);
  const keyVocabulary = current.keyVocabulary && current.keyVocabulary.length > 0 ? current.keyVocabulary : extractKeyVocabulary(q);

  return {
    translation,
    grammarBreakdown,
    distractors,
    whyYouGotItWrong,
    quickTrick,
    wordFamily,
    keyVocabulary
  };
}
