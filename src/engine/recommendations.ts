import type { Attempt, Recommendation, SrsItem, VocabularyItem } from '../types';
import { SAMPLE_QUESTIONS } from '../data/questions';
import { TAXONOMY } from '../data/taxonomy';

/**
 * Returns a map of questionId -> latest Attempt,
 * ensuring cognitive status reflects current mastery rather than accumulated history.
 */
export function getLatestAttemptsMap(attempts: Attempt[]): Map<string, Attempt> {
  const map = new Map<string, Attempt>();
  const sorted = [...attempts].sort((a, b) => a.timestamp - b.timestamp);
  for (const att of sorted) {
    map.set(att.questionId, att);
  }
  return map;
}

export function generateNextStudyPlan(
  attempts: Attempt[],
  srsItems: SrsItem[],
  vocabulary: VocabularyItem[] = []
): Recommendation[] {
  const recommendations: Recommendation[] = [];
  const now = Date.now();

  // Map questionId -> Question
  const questionMap = new Map(SAMPLE_QUESTIONS.map(q => [q.id, q]));

  // Deduplicate attempts: compute from the user's latest status per question
  const latestAttemptsMap = getLatestAttemptsMap(attempts);
  const latestAttempts = Array.from(latestAttemptsMap.values());

  // 1. Scan for MISCONCEPTIONS (Priority 1)
  // Questions where user answered wrong with high confidence on their latest attempt
  const misconceptionAttempts = latestAttempts.filter(a => a.cognitiveStatus === 'misconception');
  
  if (misconceptionAttempts.length > 0) {
    // Group by knowledgeNode
    const nodeMisconceptions: Record<string, string[]> = {};
    for (const att of misconceptionAttempts) {
      const q = questionMap.get(att.questionId);
      if (q) {
        const primaryNode = q.knowledgeNodeIds[0] || 'general';
        if (!nodeMisconceptions[primaryNode]) nodeMisconceptions[primaryNode] = [];
        if (!nodeMisconceptions[primaryNode].includes(q.id)) {
          nodeMisconceptions[primaryNode].push(q.id);
        }
      }
    }

    for (const [nodeId, qIds] of Object.entries(nodeMisconceptions)) {
      const node = TAXONOMY[nodeId];
      const nodeName = node ? node.name : 'Điểm ngữ pháp quan trọng';
      recommendations.push({
        id: `rec_misconception_${nodeId}`,
        type: 'misconception',
        priority: 1,
        title: `Chữa hiểu lầm: ${nodeName}`,
        subtitle: `Bạn đang có ${qIds.length} câu làm sai dù tự tin rằng mình đúng!`,
        description: `Đây là bẫy tư duy nguy hiểm nhất trong bài thi TOEIC. Hãy xem kỹ giải thích "Why you got it wrong" và làm lại để sửa triệt để.`,
        badge: 'Cảnh báo Đỏ (Misconception)',
        badgeColor: 'red',
        knowledgeNodeId: nodeId,
        questionIds: qIds,
        actionLabel: 'Sửa hiểu lầm ngay (Xem giải thích & Làm lại)'
      });
    }
  }

  // 2. Scan for LUCKY GUESSES (Priority 2)
  // Questions where user was correct by guessing on their latest attempt
  const luckyAttempts = latestAttempts.filter(a => a.cognitiveStatus === 'lucky_guess');
  if (luckyAttempts.length > 0) {
    const luckyQuestionIds = Array.from(new Set(luckyAttempts.map(a => a.questionId)));
    recommendations.push({
      id: 'rec_lucky_guesses',
      type: 'lucky_guess',
      priority: 2,
      title: `Kiểm chứng ${luckyQuestionIds.length} câu đúng do đoán mò`,
      subtitle: 'Đoán đúng chỉ là may mắn nhất thời, cần hiểu bản chất',
      description: 'Bạn đã chọn đúng các câu này nhưng mức độ tự tin là "Đoán mò/Chưa biết". Hãy làm lại để biến may mắn thành phản xạ thực tế.',
      badge: 'Cần xác thực (Lucky Guess)',
      badgeColor: 'amber',
      questionIds: luckyQuestionIds,
      actionLabel: 'Kiểm chứng ngay'
    });
  }

  // 3. Scan for DUE QUESTION SRS REVIEWS (Priority 2)
  const dueSrs = srsItems.filter(item => item.nextReview <= now);
  if (dueSrs.length > 0) {
    const dueQuestionIds = dueSrs
      .filter(item => item.type === 'question')
      .map(item => item.targetId);

    if (dueQuestionIds.length > 0) {
      recommendations.push({
        id: 'rec_srs_due',
        type: 'srs_due',
        priority: 2,
        title: `Đến hạn ôn tập ngắt quãng (${dueQuestionIds.length} câu)`,
        subtitle: 'Thời điểm vàng để não bộ kích hoạt trí nhớ dài hạn',
        description: 'Thuật toán SRS đã tính toán các câu hỏi này đang nằm ở ngưỡng sắp quên. Ôn tập lại ngay bây giờ sẽ giúp bạn nhớ lâu gấp 3 lần.',
        badge: 'Đến hạn SRS',
        badgeColor: 'purple',
        questionIds: dueQuestionIds,
        actionLabel: 'Bắt đầu phiên ôn tập'
      });
    }
  }

  // 4. Scan for DUE VOCABULARY SRS REVIEWS (Priority 2)
  const dueVocab = vocabulary.filter(v => v.nextReview <= now);
  if (dueVocab.length > 0) {
    recommendations.push({
      id: 'rec_vocab_due',
      type: 'vocab_due',
      priority: 2,
      title: `Ôn tập từ vựng FSRS (${dueVocab.length} từ đến hạn)`,
      subtitle: 'Thuật toán ngắt quãng đã xếp lịch ôn từ vựng cho bạn',
      description: `Bạn có ${dueVocab.length} từ vựng trong sổ tay đã đến hạn ôn tập để tránh bị lãng quên. Luyện tập flashcard ngay để giữ vững vốn từ!`,
      badge: 'FSRS Từ vựng',
      badgeColor: 'emerald',
      questionIds: [],
      actionLabel: 'Mở Sổ Từ Vựng ôn tập',
      targetView: 'vocabulary'
    });
  }

  // 5. Scan for WEAK KNOWLEDGE TOPICS (Priority 3)
  // Topics with accuracy < 60% and at least 3 attempted questions
  const nodeStats: Record<string, { correct: number; total: number; qIds: string[] }> = {};
  for (const att of latestAttempts) {
    const q = questionMap.get(att.questionId);
    if (!q) continue;
    for (const nId of q.knowledgeNodeIds) {
      if (!nodeStats[nId]) nodeStats[nId] = { correct: 0, total: 0, qIds: [] };
      nodeStats[nId].total += 1;
      if (att.isCorrect) nodeStats[nId].correct += 1;
      if (!nodeStats[nId].qIds.includes(q.id)) nodeStats[nId].qIds.push(q.id);
    }
  }

  for (const [nId, stats] of Object.entries(nodeStats)) {
    // Only flag as weak if user has attempted at least 3 questions in this topic
    if (stats.total >= 3) {
      const accuracy = (stats.correct / stats.total) * 100;
      if (accuracy < 60) {
        const node = TAXONOMY[nId];
        const nodeName = node ? node.name : nId;
        recommendations.push({
          id: `rec_weak_${nId}`,
          type: 'weak_topic',
          priority: 3,
          title: `Củng cố chuyên đề yếu: ${nodeName}`,
          subtitle: `Độ chính xác hiện tại: ${Math.round(accuracy)}% (${stats.correct}/${stats.total} câu)`,
          description: node?.ruleSummary || 'Cần luyện tập thêm các câu hỏi thuộc chủ đề này để cải thiện điểm số.',
          badge: 'Chủ đề yếu',
          badgeColor: 'blue',
          knowledgeNodeId: nId,
          questionIds: stats.qIds,
          actionLabel: `Luyện tập chuyên đề (${stats.qIds.length} câu)`
        });
      }
    }
  }

  // Default fallback if student has practiced everything with flying colors or is brand new
  if (recommendations.length === 0) {
    recommendations.push({
      id: 'rec_practice_all',
      type: 'weak_topic',
      priority: 2,
      title: 'Khởi động Luyện tập thích ứng Part 5',
      subtitle: 'Thực hành các câu hỏi thực tế kèm giải thích đa tầng',
      description: 'Làm bài và đánh giá mức độ tự tin để hệ thống lập bản đồ điểm mạnh - điểm yếu cho bạn.',
      badge: 'Khởi động',
      badgeColor: 'blue',
      questionIds: SAMPLE_QUESTIONS.slice(0, 20).map(q => q.id),
      actionLabel: 'Bắt đầu luyện tập ngay'
    });
  }

  // Sort by priority (1 is highest)
  return recommendations.sort((a, b) => a.priority - b.priority);
}

