import type { SpeakingPrompt } from '../types';

// Hand-written TOEIC-style Speaking prompts (original content). Task 2 reuses the existing
// Part 1 photo assets so no new images are needed.
export const SPEAKING_PROMPTS: SpeakingPrompt[] = [
  // ==========================================
  // TASK 1: Read a text aloud (pronunciation scored against this exact text)
  // ==========================================
  {
    id: 'sp1-01',
    taskType: 1,
    title: 'Đọc to đoạn văn',
    readAloudText:
      'Welcome to Riverside Business Center. Our office hours are from eight in the morning until six in the evening, Monday through Friday. If you need assistance outside of these hours, please contact our front desk and a staff member will be happy to help you.',
    prepSeconds: 30,
    responseSeconds: 45
  },
  {
    id: 'sp1-02',
    taskType: 1,
    title: 'Đọc to đoạn văn',
    readAloudText:
      'Thank you for calling Global Tech Support. All of our representatives are currently assisting other customers. Please stay on the line, and your call will be answered in the order it was received. We appreciate your patience.',
    prepSeconds: 30,
    responseSeconds: 45
  },
  {
    id: 'sp1-03',
    taskType: 1,
    title: 'Đọc to đoạn văn',
    readAloudText:
      'The quarterly sales report shows a significant increase in revenue compared to last year. Our marketing team will present the detailed findings during tomorrow morning\'s meeting in the main conference room on the third floor.',
    prepSeconds: 30,
    responseSeconds: 45
  },
  {
    id: 'sp1-04',
    taskType: 1,
    title: 'Đọc to đoạn văn',
    readAloudText:
      'Attention passengers. The flight to Chicago has been delayed by approximately forty minutes due to weather conditions. We apologize for any inconvenience and will provide further updates as soon as they become available.',
    prepSeconds: 30,
    responseSeconds: 45
  },

  // ==========================================
  // TASK 2: Describe a picture (reuses Part 1 photo assets)
  // ==========================================
  {
    id: 'sp2-01',
    taskType: 2,
    title: 'Mô tả bức tranh',
    image: 'assets/part1/warehouse.jpg',
    prepSeconds: 30,
    responseSeconds: 45
  },
  {
    id: 'sp2-02',
    taskType: 2,
    title: 'Mô tả bức tranh',
    image: 'assets/part1/training-room-ai-v5.jpg',
    prepSeconds: 30,
    responseSeconds: 45
  },
  {
    id: 'sp2-03',
    taskType: 2,
    title: 'Mô tả bức tranh',
    image: 'assets/part1/cafe-chairs-ai-v4.jpg',
    prepSeconds: 30,
    responseSeconds: 45
  },

  // ==========================================
  // TASK 3: Express an opinion / propose a solution
  // ==========================================
  {
    id: 'sp3-01',
    taskType: 3,
    title: 'Nêu ý kiến',
    topic: 'What do you think is the most important quality for a good manager to have? Explain why, using specific reasons and examples.',
    prepSeconds: 45,
    responseSeconds: 60
  },
  {
    id: 'sp3-02',
    taskType: 3,
    title: 'Đề xuất giải pháp',
    topic: 'A coworker frequently arrives late to team meetings, which disrupts the schedule. If you were the team leader, how would you address this problem?',
    prepSeconds: 45,
    responseSeconds: 60
  },
  {
    id: 'sp3-03',
    taskType: 3,
    title: 'Nêu ý kiến',
    topic: 'Do you think companies should allow employees to choose their own working hours (flexible schedules)? Give reasons to support your opinion.',
    prepSeconds: 45,
    responseSeconds: 60
  }
];
