import type { SpeakingPrompt } from '../types';

// All three services are local-only, same rationale as ollamaClient.ts — none of this
// ever works for a visitor on the public deployed site, only when running `npm run dev`
// with `whisper-server`, the pronunciation wrapper server, and `ollama serve` all active.
const WHISPER_URL = 'http://127.0.0.1:8090';
const PRONUNCIATION_URL = 'http://127.0.0.1:8091';
const OLLAMA_URL = 'http://localhost:11434';
const DEFAULT_SPEAKING_MODEL = 'qwen2.5:14b-instruct';

export interface LocalServiceStatus {
  whisper: boolean;
  pronunciation: boolean;
  ollama: boolean;
}

export async function checkSpeakingServices(): Promise<LocalServiceStatus> {
  const ping = async (url: string) => {
    try {
      const res = await fetch(url, { signal: AbortSignal.timeout(2000) });
      return res.ok;
    } catch {
      return false;
    }
  };
  const [whisper, pronunciation, ollama] = await Promise.all([
    ping(`${WHISPER_URL}/`), // whisper-server serves its static UI at "/" when up
    ping(`${PRONUNCIATION_URL}/health`),
    ping(`${OLLAMA_URL}/api/version`)
  ]);
  return { whisper, pronunciation, ollama };
}

export async function transcribeAudio(audioBlob: Blob): Promise<string> {
  const form = new FormData();
  form.append('file', audioBlob, 'recording.webm');
  form.append('response_format', 'json');

  const res = await fetch(`${WHISPER_URL}/inference`, { method: 'POST', body: form });
  if (!res.ok) {
    throw new Error(`whisper-server trả lỗi HTTP ${res.status}. Kiểm tra whisper-server đã chạy chưa.`);
  }
  const data = await res.json();
  return (data.text || '').trim();
}

export interface PronunciationResult {
  score: number;
  transcribe: string;
  mispronouncedWords: string[];
}

export async function scorePronunciation(audioBlob: Blob, referenceText: string): Promise<PronunciationResult> {
  const form = new FormData();
  form.append('audio', audioBlob, 'recording.webm');
  form.append('text', referenceText);

  const res = await fetch(`${PRONUNCIATION_URL}/pronunciation`, { method: 'POST', body: form });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(`Lỗi chấm phát âm: ${body.error || res.status}`);
  }
  const data = await res.json();
  const errors: Array<{ word: string }> = data?.differences?.errors || [];
  return {
    score: Math.round(data.score ?? 0),
    transcribe: data.transcribe || '',
    mispronouncedWords: errors.map(e => e.word)
  };
}

const LANGUAGE_GUARD = 'QUY TẮC BẮT BUỘC: Trường "feedback" CHỈ được viết bằng tiếng Việt và trích dẫn tiếng Anh của học viên khi cần — TUYỆT ĐỐI không được chứa bất kỳ ký tự tiếng Trung, tiếng Nhật hay ngôn ngữ nào khác ngoài tiếng Việt và tiếng Anh.';

function maxScoreForTask(taskType: 1 | 2 | 3): number {
  if (taskType === 1) return 3;
  if (taskType === 2) return 3;
  return 5;
}

function buildSystemPrompt(prompt: SpeakingPrompt): string {
  const maxScore = maxScoreForTask(prompt.taskType);

  if (prompt.taskType === 1) {
    return `Bạn là giám khảo chấm bài TOEIC Speaking Task 1 (Read a text aloud) — chỉ chấm phần TRÔI CHẢY/NGỮ ĐIỆU dựa trên bản chuyển văn bản (KHÔNG chấm phát âm, việc đó đã có công cụ khác đảm nhiệm).
${LANGUAGE_GUARD}
Thang điểm: 0-${maxScore}.
Bắt buộc trả lời DUY NHẤT bằng JSON: {"score": <0-${maxScore}>, "feedback": "<nhận xét tiếng Việt về việc đọc có đủ, có đúng nội dung văn bản gốc không, có vẻ trôi chảy không dựa trên transcript>"}`;
  }

  if (prompt.taskType === 2) {
    return `Bạn là giám khảo chấm bài TOEIC Speaking Task 2 (Describe a picture) dựa trên bản chuyển văn bản (transcript) của câu trả lời nói.
${LANGUAGE_GUARD}
Thang điểm: 0-${maxScore}.
Tiêu chí: mô tả có đủ chi tiết (người, vật, hành động, bối cảnh) không, câu văn có mạch lạc và đúng ngữ pháp không (dựa trên transcript, bỏ qua lỗi transcribe nhỏ).
Bắt buộc trả lời DUY NHẤT bằng JSON: {"score": <0-${maxScore}>, "feedback": "<nhận xét tiếng Việt>"}`;
  }

  return `Bạn là giám khảo chấm bài TOEIC Speaking Task 3 (Express an opinion / Propose a solution) dựa trên bản chuyển văn bản (transcript) của câu trả lời nói.
${LANGUAGE_GUARD}
Thang điểm: 0-${maxScore}.
Tiêu chí: có trả lời đúng trọng tâm câu hỏi không, có lý lẽ/ví dụ hỗ trợ không, tổ chức ý có rõ ràng không, ngữ pháp/từ vựng qua transcript.
Bắt buộc trả lời DUY NHẤT bằng JSON: {"score": <0-${maxScore}>, "feedback": "<nhận xét tiếng Việt chi tiết>"}`;
}

function buildUserPrompt(prompt: SpeakingPrompt, transcript: string): string {
  if (prompt.taskType === 1) {
    return `Văn bản gốc cần đọc:\n"""${prompt.readAloudText}"""\n\nBản chuyển văn bản từ giọng nói của học viên:\n"""${transcript}"""`;
  }
  if (prompt.taskType === 2) {
    return `Đề bài: mô tả bức tranh (giám khảo không thấy tranh, chỉ chấm dựa trên transcript).\n\nBản chuyển văn bản từ giọng nói của học viên:\n"""${transcript}"""`;
  }
  return `Đề bài: ${prompt.topic}\n\nBản chuyển văn bản từ giọng nói của học viên:\n"""${transcript}"""`;
}

export interface SpeakingContentResult {
  score: number;
  maxScore: number;
  feedback: string;
}

export async function scoreSpeakingContent(prompt: SpeakingPrompt, transcript: string): Promise<SpeakingContentResult> {
  const maxScore = maxScoreForTask(prompt.taskType);

  const res = await fetch(`${OLLAMA_URL}/api/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: DEFAULT_SPEAKING_MODEL,
      stream: false,
      format: 'json',
      messages: [
        { role: 'system', content: buildSystemPrompt(prompt) },
        { role: 'user', content: buildUserPrompt(prompt, transcript) }
      ]
    })
  });

  if (!res.ok) {
    throw new Error(`Ollama trả lỗi HTTP ${res.status}.`);
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

  if (/[\u4e00-\u9fff\u3040-\u30ff]/.test(feedback)) {
    throw new Error('AI trả lời bị lẫn ngôn ngữ khác (không phải tiếng Việt), vui lòng bấm chấm lại.');
  }

  return { score, maxScore, feedback };
}
