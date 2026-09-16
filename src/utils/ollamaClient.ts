import type { WritingPrompt } from '../types';

// Local-only integration: talks directly to Ollama running on the same machine
// (http://localhost:11434). This never works for a visitor on the public deployed
// site — only when running `npm run dev` with `ollama serve` active locally.
const OLLAMA_BASE_URL = 'http://localhost:11434';
export const DEFAULT_WRITING_MODEL = 'qwen2.5:14b-instruct';

export async function checkOllamaAvailable(): Promise<boolean> {
  try {
    const res = await fetch(`${OLLAMA_BASE_URL}/api/version`, { signal: AbortSignal.timeout(2000) });
    return res.ok;
  } catch {
    return false;
  }
}

function maxScoreForTask(taskType: 1 | 2 | 3): number {
  // Official ETS TOEIC Writing per-task scales
  if (taskType === 1) return 3;
  if (taskType === 2) return 4;
  return 5;
}

const LANGUAGE_GUARD = 'QUY TẮC BẮT BUỘC: Trường "feedback" CHỈ được viết bằng tiếng Việt và trích dẫn tiếng Anh của học viên khi cần — TUYỆT ĐỐI không được chứa bất kỳ ký tự tiếng Trung, tiếng Nhật hay ngôn ngữ nào khác ngoài tiếng Việt và tiếng Anh.';

function buildSystemPrompt(prompt: WritingPrompt): string {
  const maxScore = maxScoreForTask(prompt.taskType);

  if (prompt.taskType === 1) {
    return `Bạn là giám khảo chấm bài TOEIC Writing Task 1 (Write a sentence based on a picture).
${LANGUAGE_GUARD}
Thang điểm chính thức ETS: 0-${maxScore}.
Tiêu chí: câu phải liên quan hợp lý đến bức ảnh, dùng ĐÚNG cả 2 từ cho sẵn (có thể chia thì/số nhiều), ngữ pháp đúng.
Bắt buộc trả lời DUY NHẤT bằng JSON hợp lệ, không thêm chữ nào khác, theo đúng schema:
{"score": <số nguyên 0-${maxScore}>, "feedback": "<nhận xét bằng tiếng Việt: có dùng đúng 2 từ không, câu có đúng ngữ pháp không, có liên quan đến ảnh không, và gợi ý câu sửa nếu sai>"}`;
  }

  if (prompt.taskType === 2) {
    return `Bạn là giám khảo chấm bài TOEIC Writing Task 2 (Respond to a written request - trả lời email).
${LANGUAGE_GUARD}
Thang điểm chính thức ETS: 0-${maxScore}.
Tiêu chí: trả lời đủ CẢ 3 yêu cầu trong email gốc, giọng văn phù hợp (formal/business), ngữ pháp và từ vựng đúng, độ dài hợp lý (khoảng ${prompt.minWords} từ trở lên).
Bắt buộc trả lời DUY NHẤT bằng JSON hợp lệ, không thêm chữ nào khác, theo đúng schema:
{"score": <số nguyên 0-${maxScore}>, "feedback": "<nhận xét bằng tiếng Việt: đã trả lời đủ 3 ý chưa (nêu rõ ý nào thiếu nếu có), ngữ pháp/từ vựng thế nào, giọng văn có phù hợp không, và 1-2 gợi ý cải thiện cụ thể>"}`;
  }

  return `Bạn là giám khảo chấm bài TOEIC Writing Task 3 (Opinion essay - bài luận ý kiến).
${LANGUAGE_GUARD}
Thang điểm chính thức ETS: 0-${maxScore}.
Tiêu chí: có lập trường rõ ràng, lý lẽ/ví dụ cụ thể hỗ trợ quan điểm, tổ chức bài mạch lạc (mở-thân-kết), ngữ pháp và từ vựng đa dạng, đủ độ dài (tối thiểu ${prompt.minWords} từ).
Bắt buộc trả lời DUY NHẤT bằng JSON hợp lệ, không thêm chữ nào khác, theo đúng schema:
{"score": <số nguyên 0-${maxScore}>, "feedback": "<nhận xét chi tiết bằng tiếng Việt: lập luận có thuyết phục không, cấu trúc bài có rõ ràng không, các lỗi ngữ pháp/từ vựng đáng chú ý (trích dẫn câu gốc), và 1-2 gợi ý cải thiện cụ thể>"}`;
}

function buildUserPrompt(prompt: WritingPrompt, userAnswer: string): string {
  if (prompt.taskType === 1) {
    return `Đề bài: Viết 1 câu miêu tả liên quan đến bức ảnh, bắt buộc dùng cả 2 từ: "${prompt.requiredWords?.[0]}" và "${prompt.requiredWords?.[1]}".
(Lưu ý: bạn không nhìn thấy ảnh, chỉ chấm dựa trên việc câu có dùng đúng 2 từ và ngữ pháp có đúng không.)

Bài làm của học viên: "${userAnswer}"`;
  }

  if (prompt.taskType === 2) {
    return `Email gốc cần trả lời:
"""
${prompt.emailContent}
"""

3 yêu cầu bắt buộc phải đề cập trong bài trả lời:
${prompt.requiredPoints?.map((p, i) => `${i + 1}. ${p}`).join('\n')}

Bài làm của học viên:
"""
${userAnswer}
"""`;
  }

  return `Đề bài: ${prompt.essayTopic}

Bài làm của học viên:
"""
${userAnswer}
"""`;
}

export interface WritingScoreResult {
  score: number;
  maxScore: number;
  feedback: string;
}

export async function scoreWritingWithOllama(
  prompt: WritingPrompt,
  userAnswer: string,
  model: string = DEFAULT_WRITING_MODEL
): Promise<WritingScoreResult> {
  const maxScore = maxScoreForTask(prompt.taskType);

  const res = await fetch(`${OLLAMA_BASE_URL}/api/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model,
      stream: false,
      format: 'json',
      messages: [
        { role: 'system', content: buildSystemPrompt(prompt) },
        { role: 'user', content: buildUserPrompt(prompt, userAnswer) }
      ]
    })
  });

  if (!res.ok) {
    throw new Error(`Ollama trả lỗi HTTP ${res.status}. Kiểm tra model "${model}" đã được tải chưa (ollama pull ${model}).`);
  }

  const data = await res.json();
  const content: string = data?.message?.content || '';

  let parsed: { score?: number; feedback?: string };
  try {
    parsed = JSON.parse(content);
  } catch {
    throw new Error('AI trả về định dạng không hợp lệ, thử chấm lại.');
  }

  const rawScore = typeof parsed.score === 'number' ? parsed.score : Number(parsed.score);
  const score = Number.isFinite(rawScore) ? Math.max(0, Math.min(maxScore, Math.round(rawScore))) : 0;
  const feedback = parsed.feedback || 'Không có nhận xét.';

  // Local models occasionally code-switch into Chinese/Japanese mid-sentence — never show
  // that silently, since a learner can't tell a real assessment from garbled output.
  if (/[一-鿿぀-ヿ]/.test(feedback)) {
    throw new Error('AI trả lời bị lẫn ngôn ngữ khác (không phải tiếng Việt), vui lòng bấm chấm lại.');
  }

  return {
    score,
    maxScore,
    feedback
  };
}
