import type { KnowledgeNode } from '../types';

export const TAXONOMY: Record<string, KnowledgeNode> = {
  // --- THÌ QUÁ KHỨ ĐƠN ---
  'grammar.verb.tense.past_simple': {
    id: 'grammar.verb.tense.past_simple',
    parent: 'grammar.verb',
    name: 'Quá khứ đơn (Past Simple)',
    category: 'grammar',
    description: 'Diễn tả một hành động hoặc sự kiện đã xảy ra và kết thúc hoàn toàn trong quá khứ.',
    ruleSummary: 'S + V2/ed (Phủ định: S + did not + V-inf; Nghi vấn: Did + S + V-inf?).',
    keySignals: ['yesterday', 'ago', 'last week/month/year', 'previously', 'formerly', 'in + năm quá khứ (in 2022)'],
    examples: [
      'The board approved the quarterly budget at yesterday’s meeting.',
      'Ms. Watson formerly worked as a senior auditor in Tokyo.'
    ],
    commonMistakes: [
      'Chọn nhầm Hiện tại hoàn thành (have/has + V3) khi trong câu có từ chỉ mốc thời gian quá khứ rõ ràng như "yesterday" hoặc "ago".',
      'Quên rằng sau trợ động từ "did / didn’t" thì động từ chính phải quay về dạng nguyên mẫu (bare infinitive).'
    ],
    quickTips: [
      '⚡ Thần chú: Thấy "yesterday, ago, last..." $\\rightarrow$ gạch ngay các đáp án Hiện tại / Tương lai / Hoàn thành $\\rightarrow$ chọn ngay V2/ed.',
      '⚡ Nếu thấy "formerly / previously" đứng trước động từ $\\rightarrow$ 99% chia thì Quá khứ đơn.'
    ]
  },

  // --- THÌ HIỆN TẠI HOÀN THÀNH ---
  'grammar.verb.tense.present_perfect': {
    id: 'grammar.verb.tense.present_perfect',
    parent: 'grammar.verb',
    name: 'Hiện tại hoàn thành (Present Perfect)',
    category: 'grammar',
    description: 'Diễn tả hành động bắt đầu trong quá khứ và kéo dài liên tục đến hiện tại, hoặc để lại kết quả ảnh hưởng đến hiện tại.',
    ruleSummary: 'S + have/has + V3/ed. (Phủ định: haven’t/hasn’t + V3/ed).',
    keySignals: ['since + mốc thời gian', 'for + khoảng thời gian', 'over the past/last + N năm', 'recently', 'lately', 'already', 'yet'],
    examples: [
      'Sales have increased dramatically over the past two quarters.',
      'Our team has already completed the initial draft.'
    ],
    commonMistakes: [
      'Nhầm "Over the past 5 years" thành thì Quá khứ đơn vì nhìn thấy chữ "past". Trong cụm này "past" là tính từ mang nghĩa "vừa qua".',
      'Dùng thì Hiện tại hoàn thành đi kèm với mốc thời gian đã chấm dứt (như yesterday, last year).'
    ],
    quickTips: [
      '⚡ Bộ tứ thì HTHT: In / For / During / Over + the past / last + khoảng thời gian $\\rightarrow$ 100% chọn have/has + V3/ed.',
      '⚡ "Since" + mốc quá khứ (hoặc S + V2/ed) $\\rightarrow$ mệnh đề chính luôn chia Hiện tại hoàn thành.'
    ]
  },

  // --- CỤM GIỚI TỪ: RESPONSIBLE FOR ---
  'grammar.preposition.collocation.responsible_for': {
    id: 'grammar.preposition.collocation.responsible_for',
    parent: 'grammar.preposition.collocation',
    name: 'be responsible for + N/V-ing',
    category: 'vocabulary',
    description: 'Cụm tính từ cố định chỉ trách nhiệm đối với một công việc, dự án hoặc hành động.',
    ruleSummary: 'be responsible + FOR + Noun / V-ing (chịu trách nhiệm về việc gì).',
    keySignals: ['responsible for', 'hold someone responsible for'],
    examples: [
      'The maintenance staff are responsible for inspecting the equipment.',
      'Who is responsible for organizing the annual shareholder conference?'
    ],
    commonMistakes: [
      'Chọn "to" theo thói quen động từ nguyên mẫu (to V) mà không để ý phía sau là V-ing.',
      'Dùng "about" do dịch thô từ tiếng Việt ("chịu trách nhiệm về"). Tiếng Anh bắt buộc dùng "for".'
    ],
    quickTips: [
      '⚡ Thấy "responsible" $\\rightarrow$ lướt mắt tìm ngay giới từ "for".',
      '⚡ "Responsible to someone" (chịu trách nhiệm trước sếp/cấp trên), còn "Responsible for something" (chịu trách nhiệm về công việc).'
    ]
  },

  // --- CỤM GIỚI TỪ: COMPLY WITH ---
  'grammar.preposition.collocation.comply_with': {
    id: 'grammar.preposition.collocation.comply_with',
    parent: 'grammar.preposition.collocation',
    name: 'comply with / in accordance with',
    category: 'vocabulary',
    description: 'Cụm động từ chỉ sự tuân thủ quy tắc, điều luật, tiêu chuẩn an toàn trong môi trường doanh nghiệp.',
    ruleSummary: 'comply WITH = abide BY = conform TO = adhere TO = follow/observe + O.',
    keySignals: ['regulations', 'safety standards', 'guidelines', 'policies', 'building codes'],
    examples: [
      'All factories in the industrial park must comply with local emissions regulations.',
      'The report was prepared in accordance with international financial standards.'
    ],
    commonMistakes: [
      'Dùng lẫn lộn giới từ: nói "abide with" (sai, phải là "abide by") hoặc "comply by" (sai, phải là "comply with").',
      'Thêm giới từ sau "follow" hoặc "observe" (hai từ này đi trực tiếp với danh từ, không có giới từ).'
    ],
    quickTips: [
      '⚡ Bộ tứ tuân thủ TOEIC:\n• comply WITH\n• abide BY\n• conform / adhere TO\n• follow / observe + O (không giới từ).'
    ]
  },

  // --- CỤM GIỚI TỪ: PRIOR TO ---
  'grammar.preposition.collocation.prior_to': {
    id: 'grammar.preposition.collocation.prior_to',
    parent: 'grammar.preposition.collocation',
    name: 'prior to + N/V-ing (Trước khi)',
    category: 'vocabulary',
    description: 'Cụm giới từ trang trọng mang nghĩa tương đương "before", thường xuất hiện trong thông báo lịch trình bay hoặc họp.',
    ruleSummary: 'prior to + Noun Phrase / V-ing (không làm liên từ nối 2 mệnh đề).',
    keySignals: ['prior to departure', 'prior to the meeting', 'prior to entering'],
    examples: [
      'Passengers must check in at least two hours prior to departure.',
      'Please turn off your phones prior to entering the auditorium.'
    ],
    commonMistakes: [
      'Nhầm "in advance" và "prior to": "in advance" thường đứng cuối câu (please pay in advance), còn "prior to" đứng trước Noun/V-ing.',
      'Dùng "prior" đứng một mình không có "to".'
    ],
    quickTips: [
      '⚡ Nhớ công thức: prior to = before (+ Noun / V-ing).'
    ]
  },

  // --- TỪ LOẠI: TRẠNG TỪ BỔ NGHĨA TÍNH TỪ ---
  'grammar.word_form.adverb_modifying_adjective': {
    id: 'grammar.word_form.adverb_modifying_adjective',
    parent: 'grammar.word_form',
    name: 'Trạng từ bổ nghĩa Tính từ (Adv + Adj + N)',
    category: 'grammar',
    description: 'Vị trí giữa mạo từ/tính từ sở hữu và tính từ là một trạng từ để bổ nghĩa mức độ cho tính từ đó.',
    ruleSummary: 'a/an/the (hoặc my/our/their) + ADV (-ly) + ADJ + NOUN.',
    keySignals: ['a/an/the + ___ + Adj + Noun', 'be + ___ + Adj'],
    examples: [
      'Vanguard Electronics produced an exceptionally reliable backup server.',
      'The company announced an unexpectedly high quarterly dividend.'
    ],
    commonMistakes: [
      'Nhớ máy móc công thức "mạo từ + Tính từ + Danh từ" nên vội chọn Tính từ mà không để ý từ tiếp theo đã là Tính từ sẵn rồi.',
      'Chọn Danh từ vào vị trí này.'
    ],
    quickTips: [
      '⚡ Công thức kẹp bánh mì: [Mạo từ / Sở hữu] + TRẠNG TỪ (-ly) + TÍNH TỪ + DANH TỪ.'
    ]
  },

  // --- LIÊN TỪ VS GIỚI TỪ: MẶC DÙ ---
  'grammar.conjunction_vs_preposition.concession': {
    id: 'grammar.conjunction_vs_preposition.concession',
    parent: 'grammar.conjunction_vs_preposition',
    name: 'Mặc dù: Although vs Despite / In spite of',
    category: 'grammar',
    description: 'Cùng diễn tả ý nghĩa tương phản nhưng khác biệt hoàn toàn về cấu trúc cú pháp.',
    ruleSummary: 'Although / Even though / Though + S + V (Mệnh đề). | Despite / In spite of + Noun Phrase / V-ing.',
    keySignals: ['Although + Clause', 'Despite + Noun Phrase'],
    examples: [
      'Despite the heavy traffic, we arrived at the venue on schedule.',
      'Although the construction was finished early, congestion remained high.'
    ],
    commonMistakes: [
      'Chỉ dịch nghĩa tiếng Việt thấy "mặc dù" là chọn bừa "Although" mà không kiểm tra phía sau có động từ chia thì hay không.',
      'Dùng "Despite of" (sai nghiêm trọng! Chỉ có "Despite" hoặc "In spite of").'
    ],
    quickTips: [
      '⚡ Quét sau chỗ trống: Có động từ chia thì $\\rightarrow$ chọn Although. Chỉ có cụm danh từ $\\rightarrow$ chọn Despite / In spite of.'
    ]
  },

  // --- RÚT GỌN MỆNH ĐỀ QUAN HỆ ---
  'grammar.relative_clause.reduction': {
    id: 'grammar.relative_clause.reduction',
    parent: 'grammar.relative_clause',
    name: 'Rút gọn Mệnh đề quan hệ (Reduced Relative Clause)',
    category: 'grammar',
    description: 'Câu đã có động từ chính chia thì, mệnh đề quan hệ được rút gọn thành V-ing (chủ động) hoặc V3/ed (bị động).',
    ruleSummary: 'Chủ động: N + V-ing (thay cho who/which + V). Bị động: N + V3/ed (thay cho who/which + be + V3/ed).',
    keySignals: ['Câu đã có 1 vị ngữ chia thì (e.g. should submit, was announced)', 'danh từ + [ _______ ] + giới từ'],
    examples: [
      'Anyone interested in attending the conference should register online.',
      'The machinery manufactured at this plant complies with strict ISO standards.'
    ],
    commonMistakes: [
      'Chọn động từ chia thì (V-s/-es/-ed) khiến câu bị thừa 2 động từ chính mà không có liên từ nối.',
      'Nhầm lẫn giữa tính từ đuôi -ing (chỉ tính chất vật) và đuôi -ed (chỉ cảm xúc/bị tác động của người).'
    ],
    quickTips: [
      '⚡ Thấy "Participants / Anyone / Candidates + _______ + in" $\\rightarrow$ 99% chọn "interested in" (rút gọn từ who are interested in).'
    ]
  },

  // --- QUY TẮC MỆNH ĐỀ THỜI GIAN ---
  'grammar.verb.time_clause': {
    id: 'grammar.verb.time_clause',
    parent: 'grammar.verb',
    name: 'Quy tắc Mệnh đề Trạng ngữ Thời gian',
    category: 'grammar',
    description: 'Trong mệnh đề trạng ngữ chỉ thời gian, tuyệt đối không dùng thì tương lai (will), mà dùng thì Hiện tại đơn.',
    ruleSummary: 'When / Until / As soon as / Before / After + S + V(hiện tại đơn), S + will + V-inf.',
    keySignals: ['When', 'As soon as', 'Until', 'Before', 'After'],
    examples: [
      'The contract cannot be finalized until the legal director reviews all clauses.',
      'As soon as the shipment arrives, we will notify the warehouse team.'
    ],
    commonMistakes: [
      'Chọn "will + V" trong mệnh đề thời gian vì nghĩ hành động chưa xảy ra trong tương lai.'
    ],
    quickTips: [
      '⚡ Bẫy thời gian kinh điển: Sau When / Until / As soon as $\\rightarrow$ CẤM DÙNG "WILL" $\\rightarrow$ Luôn ưu tiên Hiện tại đơn.'
    ]
  },

  // --- CÂU BỊ ĐỘNG ---
  'grammar.verb.passive_voice': {
    id: 'grammar.verb.passive_voice',
    parent: 'grammar.verb',
    name: 'Câu bị động (Passive Voice: be + V3/ed)',
    category: 'grammar',
    description: 'Chủ ngữ chịu tác động của hành động. Rất phổ biến trong báo cáo, email công việc và quy trình.',
    ruleSummary: 'S + be + V3/ed (+ by O). Nhận diện: Chủ ngữ là vật, sau chỗ trống không có tân ngữ trực tiếp.',
    keySignals: ['must be + V3', 'was/were + V3', 'has been + V3', 'by the end of'],
    examples: [
      'All expense reports must be submitted by Friday.',
      'The package was delivered to the reception desk.'
    ],
    commonMistakes: [
      'Chọn động từ chủ động cho chủ từ là vật vô tri (như report, package, decision).',
      'Quên trợ động từ be trong cấu trúc bị động.'
    ],
    quickTips: [
      '⚡ Quét nhanh: Sau chỗ trống có giới từ (by, to, in, at) hoặc dấu chấm câu $\\rightarrow$ 90% chọn Bị động (be + V3/ed).'
    ]
  },

  // --- HÒA HỢP CHỦ NGỮ - ĐỘNG TỪ ---
  'grammar.verb.subject_verb_agreement': {
    id: 'grammar.verb.subject_verb_agreement',
    parent: 'grammar.verb',
    name: 'Hòa hợp Chủ ngữ - Động từ (Subject-Verb Agreement)',
    category: 'grammar',
    description: 'Động từ phải chia số ít hoặc số nhiều tương ứng với danh từ làm chủ ngữ chính.',
    ruleSummary: 'S(số ít) + V(s/es/is/was/has). S(số nhiều) + V(nguyên mẫu/are/were/have). Each/Every/One of + S(số nhiều) $\\rightarrow$ V(số ít).',
    keySignals: ['Each of', 'One of', 'The manager and his assistants', 'along with'],
    examples: [
      'Each of the conference participants receives a name badge.',
      'Additional information is available on the website.'
    ],
    commonMistakes: [
      'Bị bẫy bởi cụm giới từ chêm vào giữa chủ ngữ và động từ (ví dụ: The list [of attendees] IS, chứ không phải ARE).',
      'Nhầm danh từ không đếm được (information, equipment, luggage) thành số nhiều.'
    ],
    quickTips: [
      '⚡ Gạch bỏ cụm giới từ [in/on/at/of/with + N] đứng giữa để tìm chính xác Danh từ làm chủ ngữ thật.'
    ]
  },

  // --- V-ING VÀ TO V ---
  'grammar.verb.gerund_and_infinitive': {
    id: 'grammar.verb.gerund_and_infinitive',
    parent: 'grammar.verb',
    name: 'Danh động từ (V-ing) & Động từ nguyên mẫu (To V)',
    category: 'grammar',
    description: 'Quy tắc sau giới từ luôn dùng V-ing; To V dùng để chỉ mục đích hoặc sau các động từ nhất định.',
    ruleSummary: 'Preposition + V-ing. In order to / To + V-inf (mục đích). Expect/decide/plan/intend + to V.',
    keySignals: ['capable of', 'interested in', 'in order to', 'plan to', 'look forward to + V-ing'],
    examples: [
      'The software is capable of processing large amounts of data.',
      'The firm installed solar panels to reduce energy costs.'
    ],
    commonMistakes: [
      'Chọn V nguyên thể sau giới từ (of, in, for, without). Sau giới từ luôn là V-ing hoặc Noun.',
      'Nhầm "to" trong "look forward to" là To-infinitive (đúng phải là look forward to + V-ing).'
    ],
    quickTips: [
      '⚡ Thấy giới từ (of, in, at, with, without, after, before) $\\rightarrow$ chốt ngay V-ing!'
    ]
  },

  // --- CÂU ĐIỀU KIỆN ---
  'grammar.verb.conditional': {
    id: 'grammar.verb.conditional',
    parent: 'grammar.verb',
    name: 'Câu điều kiện (If / Unless / In case)',
    category: 'grammar',
    description: 'Diễn tả giả thiết và hệ quả trong môi trường công việc (chính sách bảo hành, điều khoản hủy lịch).',
    ruleSummary: 'If + S + V(hiện tại), S + will/can + V-inf. Unless = If not (trừ khi). In case + Clause (phòng khi).',
    keySignals: ['unless', 'if', 'provided that', 'in the event of'],
    examples: [
      'The shipment will arrive on time unless the weather becomes severe.',
      'Please call this number in case an emergency occurs.'
    ],
    commonMistakes: [
      'Dùng phủ định sau "Unless" (Unless bản thân đã mang nghĩa phủ định: Unless it rains = If it does not rain).'
    ],
    quickTips: [
      '⚡ Unless = If ... not (Trừ khi). Sau unless tuyệt đối không có "not".'
    ]
  },

  // --- TỪ LOẠI: HẬU TỐ DANH TỪ ---
  'grammar.word_form.noun_suffix': {
    id: 'grammar.word_form.noun_suffix',
    parent: 'grammar.word_form',
    name: 'Từ loại: Vị trí & Hậu tố Danh từ (-tion, -ment, -ance, -ity)',
    category: 'grammar',
    description: 'Xác định vị trí cần điền danh từ làm chủ ngữ, tân ngữ hoặc sau tính từ sở hữu / mạo từ.',
    ruleSummary: 'a/an/the / Tính từ sở hữu / Tính từ + [ DANH TỪ ]. Hậu tố: -tion, -ment, -ance, -ence, -ity, -sion.',
    keySignals: ['Final ___ from the director', 'The ___ of the new building'],
    examples: [
      'Final approval from the finance department is required.',
      'The company announced the acquisition of its competitor.'
    ],
    commonMistakes: [
      'Chọn động từ hoặc tính từ vào chỗ trống cần danh từ sau tính từ (ví dụ: final + approval, chứ không phải approve).'
    ],
    quickTips: [
      '⚡ Đuôi danh từ quen thuộc: -tion (action), -ment (development), -ance (attendance), -ity (flexibility).'
    ]
  },

  // --- TỪ LOẠI: TÍNH TỪ VÀ TRẠNG TỪ ---
  'grammar.word_form.adjective_and_adverb': {
    id: 'grammar.word_form.adjective_and_adverb',
    parent: 'grammar.word_form',
    name: 'Từ loại: Tính từ (-ful, -ive, -able) & Trạng từ (-ly)',
    category: 'grammar',
    description: 'Tính từ đứng trước danh từ để bổ nghĩa cho danh từ; Trạng từ bổ nghĩa cho động từ, tính từ hoặc cả câu.',
    ruleSummary: 'Verb + [ ADV ] (bổ nghĩa cho động từ). [ ADJ ] + Noun. be + [ ADJ ].',
    keySignals: ['more ___ than', 'operate ___', 'highly recommended'],
    examples: [
      'The new filing system allows employees to locate files efficiently.',
      'The consultant was highly recommended by previous clients.'
    ],
    commonMistakes: [
      'Dùng tính từ để bổ nghĩa cho động từ hành động thường (sai: locate files efficient $\\rightarrow$ đúng: efficiently).'
    ],
    quickTips: [
      '⚡ Động từ hành động + TRẠNG TỪ (-ly). To-be / Linking Verb (seem, look, remain, become) + TÍNH TỪ.'
    ]
  },

  // --- ĐẠI TỪ ---
  'grammar.pronoun.case': {
    id: 'grammar.pronoun.case',
    parent: 'grammar.pronoun',
    name: 'Đại từ nhân xưng, Sở hữu và Phản thân (-self)',
    category: 'grammar',
    description: 'Sử dụng đúng đại từ chủ ngữ (he, she), tân ngữ (him, her), tính từ sở hữu (their, his) và phản thân (himself, themselves).',
    ruleSummary: 'Tính từ sở hữu + Noun (their orders). S + V + [ Đại từ phản thân: -self ] (chính chủ thể tự làm).',
    keySignals: ['by himself / on his own', 'their + Noun', 'who / whose'],
    examples: [
      'Customers whose orders were damaged will receive full refunds.',
      'The CEO drafted the statement herself.'
    ],
    commonMistakes: [
      'Chọn đại từ tân ngữ (them) vào vị trí tính từ sở hữu trước danh từ (phải là their + Noun).'
    ],
    quickTips: [
      '⚡ Trước Danh từ $\\rightarrow$ luôn chọn Tính từ sở hữu (my, your, his, her, its, our, their).'
    ]
  },

  // --- GIỚI TỪ THỜI GIAN & ĐỊA ĐIỂM ---
  'grammar.preposition.time_place': {
    id: 'grammar.preposition.time_place',
    parent: 'grammar.preposition',
    name: 'Giới từ Thời gian & Địa điểm (Within, During, By, For)',
    category: 'grammar',
    description: 'Các giới từ chỉ giới hạn thời gian (within 10 days, during office hours, by Friday).',
    ruleSummary: 'Within + khoảng thời gian (trong vòng). During + danh từ chỉ thời kỳ/sự kiện. By + mốc thời gian (trước/hạn chót).',
    keySignals: ['within ten business days', 'during working hours', 'by 5:00 P.M.'],
    examples: [
      'Please return the signed agreement within ten business days.',
      'No personal phone calls are permitted during working hours.'
    ],
    commonMistakes: [
      'Dùng "while" thay cho "during" trước danh từ (while + mệnh đề S+V; during + cụm danh từ).'
    ],
    quickTips: [
      '⚡ Within + số lượng thời gian (within 7 days). During + danh từ chung (during the meeting, during the summer).'
    ]
  },

  // --- TỪ VỰNG THƯƠNG MẠI ---
  'vocabulary.business.collocation': {
    id: 'vocabulary.business.collocation',
    parent: 'vocabulary.business',
    name: 'Từ vựng & Cụm từ Thương mại TOEIC',
    category: 'vocabulary',
    description: 'Các từ vựng cốt lõi thường xuyên xuất hiện trong hợp đồng, đàm phán, thanh toán, bảo hành và chuỗi cung ứng.',
    ruleSummary: 'Từ vựng theo ngữ cảnh văn phòng: reimbursement (hoàn phí), inventory (hàng tồn kho), warranty (bảo hành), revenue (doanh thu).',
    keySignals: ['travel reimbursement', 'product warranty', 'annual revenue', 'negotiate with'],
    examples: [
      'Employees should attach original receipts when requesting travel reimbursement.',
      'The purchasing department will negotiate with three prospective vendors.'
    ],
    commonMistakes: [
      'Nhầm lẫn các từ có tiền tố tương tự như acquire / require / inquire.'
    ],
    quickTips: [
      '⚡ Học từ theo cụm danh từ ghép: travel reimbursement, warranty period, inventory check, safety inspection.'
    ]
  },

  // --- READING: PART 6 ---
  'reading.part6.text_completion': {
    id: 'reading.part6.text_completion',
    parent: 'reading.part6',
    name: 'Reading Part 6: Điền từ & Ngữ pháp trong đoạn văn',
    category: 'trap_pattern',
    description: 'Đoạn văn hoàn chỉnh với 4 chỗ trống: 3 câu từ vựng/ngữ pháp và 1 câu điền trọn vẹn cả câu (sentence insertion).',
    ruleSummary: 'Xem câu đứng ngay trước và câu ngay sau chỗ trống để xác định liên kết logic và thì của đoạn văn.',
    keySignals: ['As a result', 'In addition', 'However', 'Therefore'],
    examples: [
      'The parking lot will be closed for maintenance. [ Sentence ] Employees should park across the street.'
    ],
    commonMistakes: [
      'Chỉ đọc chỗ trống mà không đọc câu liền trước và liền sau, dẫn đến chọn câu điền sai mạch liên kết.'
    ],
    quickTips: [
      '⚡ Với câu điền cả câu: Chú ý đại từ thay thế (This, These, Such policies, They) kết nối với câu đi trước.'
    ]
  },
  'reading.part6.sentence_insertion': {
    id: 'reading.part6.sentence_insertion',
    parent: 'reading.part6',
    name: 'Reading Part 6: Điền trọn vẹn cả câu (Sentence Insertion)',
    category: 'trap_pattern',
    description: 'Lựa chọn 1 câu văn hoàn chỉnh phù hợp nhất về mạch nghĩa và cấu trúc logic để ghép vào chỗ trống trong đoạn văn.',
    ruleSummary: 'Xem kỹ từ nối (Transition words: Furthermore, Consequently) và đại từ chỉ định (These changes, Such requests).',
    keySignals: ['In fact', 'On the other hand', 'Please note that', 'For more information'],
    examples: [
      'We appreciate your prompt response. [ Please contact our office if you need further assistance. ]'
    ],
    commonMistakes: [
      'Chọn câu đúng ngữ pháp nhưng lạc đề hoặc lệch tông giọng (tone) của thông cáo/email.'
    ],
    quickTips: [
      '⚡ Đọc câu trước + câu định chọn + câu sau: nếu mạch văn trơn tru, logic nguyên nhân - kết quả liền mạch thì đó là đáp án đúng.'
    ]
  },

  // --- READING: PART 7 ---
  'reading.part7.comprehension': {
    id: 'reading.part7.comprehension',
    parent: 'reading.part7',
    name: 'Reading Part 7: Đọc hiểu Tổng quan & Quét thông tin',
    category: 'trap_pattern',
    description: 'Xử lý email, memo, hóa đơn, bài báo và đoạn văn đôi/ba. Kỹ năng paraphrase và scan từ khóa.',
    ruleSummary: 'Mỗi câu hỏi có bằng chứng (evidence) cụ thể trong văn bản. Đáp án đúng hầu hết là paraphrase của từ trong bài.',
    keySignals: ['What is indicated about...?', 'Why was the email sent?', 'According to the notice...'],
    examples: [
      'Why was the email sent? - To announce a temporary schedule change.',
      'What is suggested about the company? - It recently acquired a regional competitor.'
    ],
    commonMistakes: [
      'Chọn đáp án lặp y nguyên từ vựng trong bài đọc nhưng sai ngữ cảnh (bẫy búp bê Nga / bẫy copy-paste).'
    ],
    quickTips: [
      '⚡ Từ vựng trong bài đọc hiếm khi xuất hiện y nguyên trong đáp án đúng; hãy tìm từ đồng nghĩa (paraphrase)!'
    ]
  },
  'reading.part7.inference_paraphrase': {
    id: 'reading.part7.inference_paraphrase',
    parent: 'reading.part7',
    name: 'Reading Part 7: Suy luận gián tiếp & Paraphrase từ đồng nghĩa',
    category: 'trap_pattern',
    description: 'Xử lý câu hỏi suy luận (What is implied / suggested?) và nối thông tin liên đoạn trong văn bản đôi/ba (Cross-reference).',
    ruleSummary: 'Văn bản đôi/ba: Thông tin đáp án thường được ghép từ 1 chi tiết ở đoạn 1 và 1 chi tiết ở đoạn 2.',
    keySignals: ['What is implied about', 'What is most likely true about', 'In which of the positions...'],
    examples: [
      'Đoạn 1 nói hạn chót là 15/5. Đoạn 2 nói đơn nộp ngày 12/5 $\\rightarrow$ Suy ra: Đơn được nộp đúng hạn.'
    ],
    commonMistakes: [
      'Chỉ tìm thông tin trong 1 đoạn văn duy nhất đối với các câu hỏi liên kết văn bản đôi/ba (Cross-referencing).'
    ],
    quickTips: [
      '⚡ Khi câu hỏi nhắc đến 2 đối tượng ở 2 đoạn khác nhau $\\rightarrow$ 100% phải xâu chuỗi thông tin từ cả 2 nguồn.'
    ]
  },

  // --- LISTENING: PART 1 ---
  'listening.part1.photo_description': {
    id: 'listening.part1.photo_description',
    parent: null,
    name: 'Listening Part 1: Mô tả tranh',
    category: 'trap_pattern',
    description: 'Nghe 4 câu mô tả và chọn câu khớp nhất với bức ảnh cho sẵn.',
    ruleSummary: 'Đáp án đúng thường mô tả hành động/vị trí tương quan giữa người và vật một cách khái quát, không quá chi tiết.',
    keySignals: ['is/are + V-ing', 'has/have been + V3 (trạng thái)'],
    commonMistakes: [
      'Bị lừa bởi từ vựng quen thuộc (đồ vật xuất hiện trong ảnh) nhưng hành động mô tả sai với ảnh.'
    ],
    quickTips: [
      '⚡ Loại ngay các câu nhắc đến vật/người không xuất hiện trong ảnh trước khi so hành động.'
    ]
  },

  // --- LISTENING: PART 2 ---
  'listening.part2.question_response': {
    id: 'listening.part2.question_response',
    parent: null,
    name: 'Listening Part 2: Hỏi - Đáp',
    category: 'trap_pattern',
    description: 'Nghe 1 câu hỏi hoặc câu đề nghị, chọn 1 trong 3 phương án trả lời phù hợp nhất.',
    ruleSummary: 'Câu hỏi Wh- (Who/Where/When/Why/What/How) không được trả lời bằng Yes/No.',
    keySignals: ['Who', 'Where', 'When', 'Why', 'What', 'How', 'Could you...?'],
    commonMistakes: [
      'Dính bẫy từ lặp lại cùng gốc (same-word trap) hoặc trả lời Yes/No cho câu hỏi Wh-.'
    ],
    quickTips: [
      '⚡ Nghe kỹ từ để hỏi đầu tiên — xác định đúng loại thông tin cần tìm (người/nơi chốn/thời gian/lý do).'
    ]
  },

  // --- LISTENING: PART 3 ---
  'listening.part3.conversation': {
    id: 'listening.part3.conversation',
    parent: null,
    name: 'Listening Part 3: Hội thoại ngắn',
    category: 'trap_pattern',
    description: 'Nghe đoạn hội thoại giữa 2-3 người và trả lời 3 câu hỏi liên quan (chủ đề, chi tiết, hành động tiếp theo).',
    ruleSummary: 'Đọc trước câu hỏi và đáp án trước khi nghe để biết cần chú ý thông tin gì trong hội thoại.',
    keySignals: ['What are the speakers discussing?', 'What will the man/woman do next?'],
    commonMistakes: [
      'Không đọc trước câu hỏi nên bỏ lỡ thông tin quan trọng khi hội thoại trôi qua nhanh.'
    ],
    quickTips: [
      '⚡ Ba câu hỏi thường theo đúng trình tự thông tin xuất hiện trong hội thoại — tận dụng để dự đoán vị trí câu trả lời.'
    ]
  },

  // --- LISTENING: PART 4 ---
  'listening.part4.talk': {
    id: 'listening.part4.talk',
    parent: null,
    name: 'Listening Part 4: Bài nói/Thông báo ngắn',
    category: 'trap_pattern',
    description: 'Nghe một bài độc thoại (thông báo, quảng cáo, hướng dẫn) và trả lời 3 câu hỏi liên quan.',
    ruleSummary: 'Câu hỏi đầu thường hỏi về chủ đề/mục đích chung, câu sau hỏi chi tiết cụ thể.',
    keySignals: ['What is the purpose of the announcement?', 'What is being advertised?'],
    commonMistakes: [
      'Tập trung vào chi tiết nhỏ mà bỏ lỡ ý chính (chủ đề/mục đích) được hỏi ở câu đầu tiên.'
    ],
    quickTips: [
      '⚡ Câu mở đầu bài nói thường chứa ngay chủ đề/mục đích — nghe kỹ 1-2 câu đầu tiên.'
    ]
  }
};

