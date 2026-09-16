import type { WritingPrompt } from '../types';

// Hand-written TOEIC-style Writing prompts (original content, not scraped from any source).
// Task 1 reuses the existing Part 1 photo assets so no new images are needed.
export const WRITING_PROMPTS: WritingPrompt[] = [
  // ==========================================
  // TASK 1: Write a sentence based on a picture (5 câu, dùng 2 từ cho sẵn)
  // ==========================================
  {
    id: 'w1-01',
    taskType: 1,
    title: 'Viết câu mô tả tranh',
    image: 'assets/part1/meeting-ai-v2.jpg',
    requiredWords: ['discuss', 'table'],
    minWords: 5
  },
  {
    id: 'w1-02',
    taskType: 1,
    title: 'Viết câu mô tả tranh',
    image: 'assets/part1/warehouse.jpg',
    requiredWords: ['shelf', 'boxes'],
    minWords: 5
  },
  {
    id: 'w1-03',
    taskType: 1,
    title: 'Viết câu mô tả tranh',
    image: 'assets/part1/restaurant-ai-v2.jpg',
    requiredWords: ['carry', 'tray'],
    minWords: 5
  },
  {
    id: 'w1-04',
    taskType: 1,
    title: 'Viết câu mô tả tranh',
    image: 'assets/part1/printer-ai-v2.jpg',
    requiredWords: ['operate', 'machine'],
    minWords: 5
  },
  {
    id: 'w1-05',
    taskType: 1,
    title: 'Viết câu mô tả tranh',
    image: 'assets/part1/reception-ai-v3.jpg',
    requiredWords: ['phone', 'while'],
    minWords: 5
  },
  {
    id: 'w1-06',
    taskType: 1,
    title: 'Viết câu mô tả tranh',
    image: 'assets/part1/solar-ai-v3.jpg',
    requiredWords: ['inspect', 'panel'],
    minWords: 5
  },
  {
    id: 'w1-07',
    taskType: 1,
    title: 'Viết câu mô tả tranh',
    image: 'assets/part1/station.jpg',
    requiredWords: ['wait', 'platform'],
    minWords: 5
  },
  {
    id: 'w1-08',
    taskType: 1,
    title: 'Viết câu mô tả tranh',
    image: 'assets/part1/housekeeping-ai-v4.jpg',
    requiredWords: ['fold', 'beside'],
    minWords: 5
  },

  // ==========================================
  // TASK 2: Respond to a written request (email response, ~4 câu)
  // ==========================================
  {
    id: 'w2-01',
    taskType: 2,
    title: 'Trả lời email',
    emailContent: `From: Daniel Reyes <d.reyes@brightlinelogistics.com>
Subject: Team lunch next Friday

Hi,

I'm organizing a team lunch next Friday to celebrate finishing the Q3 project. Could you let me know:
1. Whether you can attend and what time works best for you,
2. Any dietary restrictions we should plan around, and
3. A restaurant you'd recommend near the office.

Thanks,
Daniel`,
    requiredPoints: [
      'Xác nhận có tham dự được hay không và giờ nào phù hợp',
      'Nêu yêu cầu/hạn chế về đồ ăn (nếu có)',
      'Đề xuất một nhà hàng gần văn phòng'
    ],
    minWords: 40
  },
  {
    id: 'w2-02',
    taskType: 2,
    title: 'Trả lời email',
    emailContent: `From: Priya Nair <priya.nair@meridianoffice.com>
Subject: Delayed shipment — order #4471

Dear Customer Service,

I placed an order for office chairs three weeks ago (order #4471), but it still hasn't arrived. Could you please:
1. Tell me the current status of my order,
2. Explain the reason for the delay, and
3. Let me know when I can expect delivery.

Regards,
Priya Nair`,
    requiredPoints: [
      'Xin lỗi vì sự chậm trễ',
      'Giải thích lý do (có thể tự nghĩ lý do hợp lý)',
      'Đưa ra thời gian giao hàng dự kiến mới'
    ],
    minWords: 40
  },
  {
    id: 'w2-03',
    taskType: 2,
    title: 'Trả lời email',
    emailContent: `From: Marcus Webb <m.webb@corestone-hr.com>
Subject: Interview scheduling

Hello,

Thank you for applying for the Marketing Coordinator position. We would like to invite you for an interview next week. Please reply and let us know:
1. Which day and time work best for you,
2. Whether you prefer an in-person or video interview, and
3. If you have any questions about the role before the interview.

Best,
Marcus Webb, HR Department`,
    requiredPoints: [
      'Cảm ơn vì được mời phỏng vấn',
      'Đề xuất ngày/giờ cụ thể',
      'Chọn hình thức phỏng vấn (trực tiếp hoặc video) và nêu 1 câu hỏi (nếu muốn)'
    ],
    minWords: 40
  },
  {
    id: 'w2-04',
    taskType: 2,
    title: 'Trả lời email',
    emailContent: `From: Facilities Team <facilities@northgatetower.com>
Subject: Parking lot maintenance next week

Dear Tenant,

The parking lot will be closed for resurfacing from Monday to Wednesday next week. We are writing to ask:
1. Whether you will need a temporary parking permit for the nearby lot,
2. How many vehicles you would like to register, and
3. Any concerns you have about the schedule.

Regards,
Facilities Team`,
    requiredPoints: [
      'Xác nhận có cần permit đỗ xe tạm thời hay không',
      'Nêu số lượng xe cần đăng ký',
      'Nêu 1 mối quan tâm hoặc yêu cầu thêm về lịch trình'
    ],
    minWords: 40
  },

  // ==========================================
  // TASK 3: Opinion essay (3 đề, tối thiểu 300 từ)
  // ==========================================
  {
    id: 'w3-01',
    taskType: 3,
    title: 'Bài luận ý kiến',
    essayTopic:
      'Some companies allow employees to work from home, while others require employees to work in the office every day. Which policy do you think is better for a company? Use specific reasons and examples to support your opinion.',
    minWords: 300
  },
  {
    id: 'w3-02',
    taskType: 3,
    title: 'Bài luận ý kiến',
    essayTopic:
      'Do you agree or disagree with the following statement? "Managers should give employees detailed instructions for every task rather than letting them decide how to complete the work." Use specific reasons and examples to support your answer.',
    minWords: 300
  },
  {
    id: 'w3-03',
    taskType: 3,
    title: 'Bài luận ý kiến',
    essayTopic:
      'Some people prefer to work for a large company, while others prefer to work for a small company. Which do you prefer? Use specific reasons and details to support your choice.',
    minWords: 300
  }
];
