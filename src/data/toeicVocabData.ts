import type { QuestionVocabItem } from '../types';

export interface WordFamilyGroup {
  root: string;
  items: QuestionVocabItem[];
}

// =========================================================================
// 1. TỪ ĐIỂN HỌ TỪ VỰNG TOEIC TOÀN DIỆN (80+ NHÓM HỌ TỪ PHỔ BIẾN NHẤT PART 5)
// =========================================================================
export const COMMON_WORD_FAMILIES: Record<string, WordFamilyGroup> = {
  access: {
    root: 'access',
    items: [
      { word: 'access', pos: 'v', phonetic: '/ˈæk.ses/', meaning: 'truy cập, tiếp cận' },
      { word: 'access', pos: 'n', phonetic: '/ˈæk.ses/', meaning: 'quyền truy cập, lối vào' },
      { word: 'accessible', pos: 'adj', phonetic: '/əkˈses.ə.bəl/', meaning: 'có thể tiếp cận, dễ sử dụng' },
      { word: 'accessibility', pos: 'n', phonetic: '/əkˌses.əˈbɪl.ə.ti/', meaning: 'khả năng tiếp cận' }
    ]
  },
  accompany: {
    root: 'accompany',
    items: [
      { word: 'accompany', pos: 'v', phonetic: '/əˈkʌm.pə.ni/', meaning: 'đi cùng, kèm theo' },
      { word: 'accompanying', pos: 'adj', phonetic: '/əˈkʌm.pə.ni.ɪŋ/', meaning: 'được đính kèm, đi kèm' },
      { word: 'accompaniment', pos: 'n', phonetic: '/əˈkʌm.pən.ɪ.mənt/', meaning: 'vật kèm theo, phụ kiện' }
    ]
  },
  accurate: {
    root: 'accura',
    items: [
      { word: 'accurate', pos: 'adj', phonetic: '/ˈæk.jə.rət/', meaning: 'chính xác, chuẩn xác' },
      { word: 'accurately', pos: 'adv', phonetic: '/ˈæk.jə.rət.li/', meaning: 'một cách chính xác' },
      { word: 'accuracy', pos: 'n', phonetic: '/ˈæk.jə.rə.si/', meaning: 'sự chính xác, độ chuẩn xác' }
    ]
  },
  acquire: {
    root: 'acqui',
    items: [
      { word: 'acquire', pos: 'v', phonetic: '/əˈkwaɪər/', meaning: 'mua lại, thâu tóm, đạt được' },
      { word: 'acquisition', pos: 'n', phonetic: '/ˌæk.wɪˈzɪʃ.ən/', meaning: 'sự thâu tóm, sáp nhập doanh nghiệp' },
      { word: 'acquired', pos: 'adj', phonetic: '/əˈkwaɪəd/', meaning: 'thu được, mua lại được' },
      { word: 'acquisitive', pos: 'adj', phonetic: '/əˈkwɪz.ə.tɪv/', meaning: 'thích thâu tóm, trục lợi' }
    ]
  },
  adjust: {
    root: 'adjust',
    items: [
      { word: 'adjust', pos: 'v', phonetic: '/əˈdʒʌst/', meaning: 'điều chỉnh, chỉnh lý' },
      { word: 'adjustable', pos: 'adj', phonetic: '/əˈdʒʌs.tə.bəl/', meaning: 'có thể điều chỉnh được' },
      { word: 'adjustment', pos: 'n', phonetic: '/əˈdʒʌst.mənt/', meaning: 'sự điều chỉnh, mức chỉnh' }
    ]
  },
  advise: {
    root: 'advis',
    items: [
      { word: 'advise', pos: 'v', phonetic: '/ədˈvaɪz/', meaning: 'khuyên bảo, cố vấn' },
      { word: 'advice', pos: 'n', phonetic: '/ədˈvaɪs/', meaning: 'lời khuyên, lời chỉ dẫn' },
      { word: 'advisable', pos: 'adj', phonetic: '/ədˈvaɪ.zə.bəl/', meaning: 'thích hợp, nên làm' },
      { word: 'advisory', pos: 'adj', phonetic: '/ədˈvaɪ.zər.i/', meaning: 'mang tính cố vấn, tư vấn' }
    ]
  },
  afford: {
    root: 'afford',
    items: [
      { word: 'afford', pos: 'v', phonetic: '/əˈfɔːd/', meaning: 'đủ khả năng chi trả' },
      { word: 'affordable', pos: 'adj', phonetic: '/əˈfɔː.də.bəl/', meaning: 'phải chăng, hợp túi tiền' },
      { word: 'affordably', pos: 'adv', phonetic: '/əˈfɔː.də.bli/', meaning: 'với mức giá phải chăng' },
      { word: 'affordability', pos: 'n', phonetic: '/əˌfɔː.dəˈbɪl.ə.ti/', meaning: 'khả năng chi trả' }
    ]
  },
  analyze: {
    root: 'analy',
    items: [
      { word: 'analyze', pos: 'v', phonetic: '/ˈæn.əl.aɪz/', meaning: 'phân tích số liệu/dữ liệu' },
      { word: 'analysis', pos: 'n', phonetic: '/əˈnæl.ə.sɪs/', meaning: 'bản phân tích, sự phân tích' },
      { word: 'analyst', pos: 'n', phonetic: '/ˈæn.ə.lɪst/', meaning: 'chuyên viên phân tích' },
      { word: 'analytical', pos: 'adj', phonetic: '/ˌæn.əlˈɪt.ɪ.kəl/', meaning: 'có tính phân tích logic' }
    ]
  },
  apply: {
    root: 'appli',
    items: [
      { word: 'apply', pos: 'v', phonetic: '/əˈplaɪ/', meaning: 'nộp đơn (for), áp dụng (to)' },
      { word: 'application', pos: 'n', phonetic: '/ˌæp.lɪˈkeɪ.ʃən/', meaning: 'đơn xin việc, ứng dụng' },
      { word: 'applicant', pos: 'n', phonetic: '/ˈæp.lɪ.kənt/', meaning: 'người nộp đơn, ứng viên' },
      { word: 'applicable', pos: 'adj', phonetic: '/əˈplɪk.ə.bəl/', meaning: 'có thể áp dụng, thích hợp' }
    ]
  },
  approve: {
    root: 'approv',
    items: [
      { word: 'approve', pos: 'v', phonetic: '/əˈpruːv/', meaning: 'phê duyệt, chấp thuận, tán thành' },
      { word: 'approval', pos: 'n', phonetic: '/əˈpruː.vəl/', meaning: 'sự phê duyệt, sự chấp thuận' },
      { word: 'approved', pos: 'adj', phonetic: '/əˈpruːvd/', meaning: 'đã được phê duyệt' },
      { word: 'approvingly', pos: 'adv', phonetic: '/əˈpruː.vɪŋ.li/', meaning: 'một cách tán thành' }
    ]
  },
  assess: {
    root: 'assess',
    items: [
      { word: 'assess', pos: 'v', phonetic: '/əˈses/', meaning: 'đánh giá, thẩm định' },
      { word: 'assessment', pos: 'n', phonetic: '/əˈses.mənt/', meaning: 'sự đánh giá, thẩm định' },
      { word: 'assessor', pos: 'n', phonetic: '/əˈses.ər/', meaning: 'chuyên viên thẩm định' }
    ]
  },
  assist: {
    root: 'assist',
    items: [
      { word: 'assist', pos: 'v', phonetic: '/əˈsɪst/', meaning: 'hỗ trợ, trợ giúp' },
      { word: 'assistance', pos: 'n', phonetic: '/əˈsɪs.təns/', meaning: 'sự hỗ trợ, sự giúp đỡ' },
      { word: 'assistant', pos: 'n', phonetic: '/əˈsɪs.tənt/', meaning: 'trợ lý, trợ tá' }
    ]
  },
  attend: {
    root: 'atten',
    items: [
      { word: 'attend', pos: 'v', phonetic: '/əˈtend/', meaning: 'tham dự, có mặt' },
      { word: 'attendance', pos: 'n', phonetic: '/əˈten.dəns/', meaning: 'sự tham dự, số lượng người tham dự' },
      { word: 'attendee', pos: 'n', phonetic: '/ə.tenˈdiː/', meaning: 'người tham dự cuộc họp/hội thảo' },
      { word: 'attention', pos: 'n', phonetic: '/əˈten.ʃən/', meaning: 'sự chú ý' },
      { word: 'attentive', pos: 'adj', phonetic: '/əˈten.tɪv/', meaning: 'chăm chú, chu đáo' },
      { word: 'attentively', pos: 'adv', phonetic: '/əˈten.tɪv.li/', meaning: 'một cách chăm chú' }
    ]
  },
  automate: {
    root: 'automat',
    items: [
      { word: 'automate', pos: 'v', phonetic: '/ˈɔː.tə.meɪt/', meaning: 'tự động hóa quy trình' },
      { word: 'automatic', pos: 'adj', phonetic: '/ˌɔː.təˈmæt.ɪk/', meaning: 'tự động' },
      { word: 'automatically', pos: 'adv', phonetic: '/ˌɔː.təˈmæt.ɪ.kəl.i/', meaning: 'một cách tự động' },
      { word: 'automation', pos: 'n', phonetic: '/ˌɔː.təˈmeɪ.ʃən/', meaning: 'sự tự động hóa' }
    ]
  },
  calibrate: {
    root: 'calibrat',
    items: [
      { word: 'calibrate', pos: 'v', phonetic: '/ˈkæl.ɪ.breɪt/', meaning: 'hiệu chuẩn, căn chỉnh máy móc' },
      { word: 'calibration', pos: 'n', phonetic: '/ˌkæl.ɪˈbreɪ.ʃən/', meaning: 'sự hiệu chuẩn máy móc' }
    ]
  },
  care: {
    root: 'care',
    items: [
      { word: 'care', pos: 'v', phonetic: '/keər/', meaning: 'chăm sóc, quan tâm' },
      { word: 'careful', pos: 'adj', phonetic: '/ˈkeə.fəl/', meaning: 'cẩn thận, kỹ lưỡng' },
      { word: 'carefully', pos: 'adv', phonetic: '/ˈkeə.fəl.i/', meaning: 'một cách cẩn thận' },
      { word: 'careless', pos: 'adj', phonetic: '/ˈkeə.ləs/', meaning: 'bất cẩn, sơ suất' }
    ]
  },
  certify: {
    root: 'certif',
    items: [
      { word: 'certify', pos: 'v', phonetic: '/ˈsɜː.tɪ.faɪ/', meaning: 'chứng nhận, xác nhận' },
      { word: 'certificate', pos: 'n', phonetic: '/səˈtɪf.ɪ.kət/', meaning: 'chứng chỉ, văn bằng' },
      { word: 'certification', pos: 'n', phonetic: '/ˌsɜː.tɪ.fɪˈkeɪ.ʃən/', meaning: 'giấy chứng nhận, sự chứng nhận' },
      { word: 'certified', pos: 'adj', phonetic: '/ˈsɜː.tɪ.faɪd/', meaning: 'đã được cấp chứng nhận' }
    ]
  },
  collect: {
    root: 'collect',
    items: [
      { word: 'collect', pos: 'v', phonetic: '/kəˈlekt/', meaning: 'thu thập, quyên góp' },
      { word: 'collection', pos: 'n', phonetic: '/kəˈlek.ʃən/', meaning: 'bộ sưu tập, sự thu thập' },
      { word: 'collective', pos: 'adj', phonetic: '/kəˈlek.tɪv/', meaning: 'mang tính tập thể' }
    ]
  },
  compare: {
    root: 'compar',
    items: [
      { word: 'compare', pos: 'v', phonetic: '/kəmˈpeər/', meaning: 'so sánh, đối chiếu' },
      { word: 'comparison', pos: 'n', phonetic: '/kəmˈpær.ɪ.sən/', meaning: 'sự so sánh' },
      { word: 'comparable', pos: 'adj', phonetic: '/ˈkɒm.pər.ə.bəl/', meaning: 'tương đương, có thể so sánh' },
      { word: 'comparative', pos: 'adj', phonetic: '/kəmˈpær.ə.tɪv/', meaning: 'so sánh, tương đối' }
    ]
  },
  compete: {
    root: 'compet',
    items: [
      { word: 'compete', pos: 'v', phonetic: '/kəmˈpiːt/', meaning: 'cạnh tranh, thi đua' },
      { word: 'competition', pos: 'n', phonetic: '/ˌkɒm.pəˈtɪʃ.ən/', meaning: 'sự cạnh tranh, cuộc thi' },
      { word: 'competitive', pos: 'adj', phonetic: '/kəmˈpet.ɪ.tɪv/', meaning: 'có tính cạnh tranh, giá cạnh tranh' },
      { word: 'competitively', pos: 'adv', phonetic: '/kəmˈpet.ɪ.tɪv.li/', meaning: 'một cách cạnh tranh' },
      { word: 'competitor', pos: 'n', phonetic: '/kəmˈpet.ɪ.tər/', meaning: 'đối thủ cạnh tranh' }
    ]
  },
  compile: {
    root: 'compile',
    items: [
      { word: 'compile', pos: 'v', phonetic: '/kəmˈpaɪl/', meaning: 'tập hợp, thu thập, biên soạn tài liệu' },
      { word: 'compilation', pos: 'n', phonetic: '/ˌkɒm.pɪˈleɪ.ʃən/', meaning: 'sự biên soạn, tuyển tập' },
      { word: 'compiler', pos: 'n', phonetic: '/kəmˈpaɪ.lər/', meaning: 'người biên soạn' },
      { word: 'compiled', pos: 'adj', phonetic: '/kəmˈpaɪld/', meaning: 'đã được tổng hợp' }
    ]
  },
  comply: {
    root: 'compl',
    items: [
      { word: 'comply', pos: 'v', phonetic: '/kəmˈplaɪ/', meaning: 'tuân thủ (comply with)' },
      { word: 'compliance', pos: 'n', phonetic: '/kəmˈplaɪ.əns/', meaning: 'sự tuân thủ' },
      { word: 'compliant', pos: 'adj', phonetic: '/kəmˈplaɪ.ənt/', meaning: 'tuân thủ quy chuẩn' }
    ]
  },
  compose: {
    root: 'compos',
    items: [
      { word: 'compose', pos: 'v', phonetic: '/kəmˈpəʊz/', meaning: 'soạn thảo, cấu thành' },
      { word: 'composition', pos: 'n', phonetic: '/ˌkɒm.pəˈzɪʃ.ən/', meaning: 'bài soạn, kết cấu' },
      { word: 'composure', pos: 'n', phonetic: '/kəmˈpəʊ.ʒər/', meaning: 'sự bình tĩnh, điềm đạm' },
      { word: 'composed', pos: 'adj', phonetic: '/kəmˈpəʊzd/', meaning: 'điềm tĩnh, gồm có' },
      { word: 'composedly', pos: 'adv', phonetic: '/kəmˈpəʊ.zɪd.li/', meaning: 'một cách bình thản' }
    ]
  },
  comprehensive: {
    root: 'comprehen',
    items: [
      { word: 'comprehend', pos: 'v', phonetic: '/ˌkɒm.prɪˈhend/', meaning: 'thấu hiểu, lĩnh hội' },
      { word: 'comprehension', pos: 'n', phonetic: '/ˌkɒm.prɪˈhen.ʃən/', meaning: 'sự đọc hiểu' },
      { word: 'comprehensive', pos: 'adj', phonetic: '/ˌkɒm.prɪˈhen.sɪv/', meaning: 'toàn diện, bao quát' },
      { word: 'comprehensively', pos: 'adv', phonetic: '/ˌkɒm.prɪˈhen.sɪv.li/', meaning: 'một cách toàn diện' }
    ]
  },
  concise: {
    root: 'concis',
    items: [
      { word: 'concise', pos: 'adj', phonetic: '/kənˈsaɪs/', meaning: 'ngắn gọn, súc tích' },
      { word: 'concisely', pos: 'adv', phonetic: '/kənˈsaɪs.li/', meaning: 'một cách ngắn gọn, rõ ràng' },
      { word: 'conciseness', pos: 'n', phonetic: '/kənˈsaɪs.nəs/', meaning: 'sự súc tích' }
    ]
  },
  configure: {
    root: 'configur',
    items: [
      { word: 'configure', pos: 'v', phonetic: '/kənˈfɪɡ.ər/', meaning: 'cấu hình, thiết lập hệ thống' },
      { word: 'configuration', pos: 'n', phonetic: '/kənˌfɪɡ.əˈreɪ.ʃən/', meaning: 'cấu hình thiết bị' }
    ]
  },
  consider: {
    root: 'consider',
    items: [
      { word: 'consider', pos: 'v', phonetic: '/kənˈsɪd.ər/', meaning: 'cân nhắc, xem xét' },
      { word: 'consideration', pos: 'n', phonetic: '/kənˌsɪd.əˈreɪ.ʃən/', meaning: 'sự cân nhắc' },
      { word: 'considerable', pos: 'adj', phonetic: '/kənˈsɪd.ər.ə.bəl/', meaning: 'đáng kể, to lớn' },
      { word: 'considerably', pos: 'adv', phonetic: '/kənˈsɪd.ər.ə.bli/', meaning: 'một cách đáng kể' },
      { word: 'considerate', pos: 'adj', phonetic: '/kənˈsɪd.ər.ət/', meaning: 'chu đáo, ân cần' }
    ]
  },
  consistent: {
    root: 'consist',
    items: [
      { word: 'consist', pos: 'v', phonetic: '/kənˈsɪst/', meaning: 'bao gồm (consist of)' },
      { word: 'consistency', pos: 'n', phonetic: '/kənˈsɪs.tən.si/', meaning: 'sự kiên định, tính nhất quán' },
      { word: 'consistent', pos: 'adj', phonetic: '/kənˈsɪs.tənt/', meaning: 'nhất quán, ổn định' },
      { word: 'consistently', pos: 'adv', phonetic: '/kənˈsɪs.tənt.li/', meaning: 'luôn luôn, một cách nhất quán' }
    ]
  },
  construct: {
    root: 'construct',
    items: [
      { word: 'construct', pos: 'v', phonetic: '/kənˈstrʌkt/', meaning: 'xây dựng, kiến tạo, thiết lập' },
      { word: 'construction', pos: 'n', phonetic: '/kənˈstrʌk.ʃən/', meaning: 'sự xây dựng, công trình xây dựng' },
      { word: 'constructive', pos: 'adj', phonetic: '/kənˈstrʌk.tɪv/', meaning: 'mang tính xây dựng, tích cực' },
      { word: 'constructively', pos: 'adv', phonetic: '/kənˈstrʌk.tɪv.li/', meaning: 'một cách có tính xây dựng' },
      { word: 'constructed', pos: 'adj', phonetic: '/kənˈstrʌk.tɪd/', meaning: 'đã được xây dựng' }
    ]
  },
  deceive: {
    root: 'decep',
    items: [
      { word: 'deceive', pos: 'v', phonetic: '/dɪˈsiːv/', meaning: 'lừa dối, đánh lừa' },
      { word: 'deception', pos: 'n', phonetic: '/dɪˈsep.ʃən/', meaning: 'sự dối trá, trò lừa gạt' },
      { word: 'deceptive', pos: 'adj', phonetic: '/dɪˈsep.tɪv/', meaning: 'dễ gây hiểu nhầm, giả dối' },
      { word: 'deceptively', pos: 'adv', phonetic: '/dɪˈsep.tɪv.li/', meaning: 'một cách đánh lừa' }
    ]
  },
  decide: {
    root: 'deci',
    items: [
      { word: 'decide', pos: 'v', phonetic: '/dɪˈsaɪd/', meaning: 'quyết định' },
      { word: 'decision', pos: 'n', phonetic: '/dɪˈsɪʒ.ən/', meaning: 'quyết định, sự dứt khoát' },
      { word: 'decisive', pos: 'adj', phonetic: '/dɪˈsaɪ.sɪv/', meaning: 'mang tính quyết định, quả quyết' },
      { word: 'decisively', pos: 'adv', phonetic: '/dɪˈsaɪ.sɪv.li/', meaning: 'một cách dứt khoát, kiên quyết' }
    ]
  },
  disrupt: {
    root: 'disrupt',
    items: [
      { word: 'disrupt', pos: 'v', phonetic: '/dɪsˈrʌpt/', meaning: 'gây gián đoạn, phá vỡ' },
      { word: 'disruption', pos: 'n', phonetic: '/dɪsˈrʌp.ʃən/', meaning: 'sự gián đoạn công việc' },
      { word: 'disruptive', pos: 'adj', phonetic: '/dɪsˈrʌp.tɪv/', meaning: 'gây xáo trộn, đột phá' }
    ]
  },
  distribute: {
    root: 'distribut',
    items: [
      { word: 'distribute', pos: 'v', phonetic: '/dɪˈstrɪb.juːt/', meaning: 'phân phát, phân phối' },
      { word: 'distribution', pos: 'n', phonetic: '/ˌdɪs.trɪˈbjuː.ʃən/', meaning: 'sự phân phối, phát hành' },
      { word: 'distributor', pos: 'n', phonetic: '/dɪˈstrɪb.jə.tər/', meaning: 'nhà phân phối' }
    ]
  },
  efficient: {
    root: 'efficien',
    items: [
      { word: 'efficiency', pos: 'n', phonetic: '/ɪˈfɪʃ.ən.si/', meaning: 'sự hiệu quả, năng suất' },
      { word: 'efficient', pos: 'adj', phonetic: '/ɪˈfɪʃ.ənt/', meaning: 'hiệu quả, tiết kiệm chi phí/thời gian' },
      { word: 'efficiently', pos: 'adv', phonetic: '/ɪˈfɪʃ.ənt.li/', meaning: 'một cách hiệu quả' }
    ]
  },
  evaluate: {
    root: 'evaluat',
    items: [
      { word: 'evaluate', pos: 'v', phonetic: '/ɪˈvæl.ju.eɪt/', meaning: 'đánh giá, định giá' },
      { word: 'evaluation', pos: 'n', phonetic: '/ɪˌvæl.juˈeɪ.ʃən/', meaning: 'sự thẩm định, đánh giá' }
    ]
  },
  expand: {
    root: 'expand',
    items: [
      { word: 'expand', pos: 'v', phonetic: '/ɪkˈspænd/', meaning: 'mở rộng quy mô, bành trướng' },
      { word: 'expansion', pos: 'n', phonetic: '/ɪkˈspæn.ʃən/', meaning: 'sự mở rộng' },
      { word: 'expansive', pos: 'adj', phonetic: '/ɪkˈspæn.sɪv/', meaning: 'rộng lớn, bao la' }
    ]
  },
  explain: {
    root: 'expla',
    items: [
      { word: 'explain', pos: 'v', phonetic: '/ɪkˈspleɪn/', meaning: 'giải thích, phân trần' },
      { word: 'explanation', pos: 'n', phonetic: '/ˌek.spləˈneɪ.ʃən/', meaning: 'lời giải thích, sự lý giải' },
      { word: 'explanatory', pos: 'adj', phonetic: '/ɪkˈsplæn.ə.tər.i/', meaning: 'có tính giải thích' }
    ]
  },
  familiar: {
    root: 'familiar',
    items: [
      { word: 'familiar', pos: 'adj', phonetic: '/fəˈmɪl.i.ər/', meaning: 'quen thuộc (familiar with)' },
      { word: 'familiarity', pos: 'n', phonetic: '/fəˌmɪl.iˈær.ə.ti/', meaning: 'sự thân thuộc, sự hiểu biết rõ' },
      { word: 'familiarize', pos: 'v', phonetic: '/fəˈmɪl.i.ər.aɪz/', meaning: 'làm quen (với điều gì)' },
      { word: 'familiarly', pos: 'adv', phonetic: '/fəˈmɪl.i.ə.li/', meaning: 'một cách thân mật' }
    ]
  },
  fascinate: {
    root: 'fascinat',
    items: [
      { word: 'fascinate', pos: 'v', phonetic: '/ˈfæs.ən.eɪt/', meaning: 'lôi cuốn, quyến rũ' },
      { word: 'fascinating', pos: 'adj', phonetic: '/ˈfæs.ən.eɪ.tɪŋ/', meaning: 'hấp dẫn, lôi cuốn' },
      { word: 'fascinated', pos: 'adj', phonetic: '/ˈfæs.ən.eɪ.tɪd/', meaning: 'bị thu hút, say mê' },
      { word: 'fascination', pos: 'n', phonetic: '/ˌfæs.ənˈeɪ.ʃən/', meaning: 'sự quyến rũ, mê hoặc' }
    ]
  },
  gradual: {
    root: 'gradua',
    items: [
      { word: 'gradual', pos: 'adj', phonetic: '/ˈɡrædʒ.u.əl/', meaning: 'dần dần, từ từ' },
      { word: 'gradually', pos: 'adv', phonetic: '/ˈɡrædʒ.u.ə.li/', meaning: 'từng bước, dần dần' }
    ]
  },
  identify: {
    root: 'identif',
    items: [
      { word: 'identify', pos: 'v', phonetic: '/aɪˈden.tɪ.faɪ/', meaning: 'nhận diện, xác định danh tính' },
      { word: 'identification', pos: 'n', phonetic: '/aɪˌden.tɪ.fɪˈkeɪ.ʃən/', meaning: 'giấy tờ tùy thân, sự nhận diện' },
      { word: 'identifiable', pos: 'adj', phonetic: '/aɪˌden.tɪˈfaɪ.ə.bəl/', meaning: 'có thể nhận biết được' },
      { word: 'identity', pos: 'n', phonetic: '/aɪˈden.tə.ti/', meaning: 'bản sắc, danh tính' }
    ]
  },
  illustrate: {
    root: 'illustrat',
    items: [
      { word: 'illustrate', pos: 'v', phonetic: '/ˈɪl.ə.streɪt/', meaning: 'minh họa, làm sáng tỏ' },
      { word: 'illustration', pos: 'n', phonetic: '/ˌɪl.əˈstreɪ.ʃən/', meaning: 'hình minh họa' },
      { word: 'illustrative', pos: 'adj', phonetic: '/ˈɪl.ə.strə.tɪv/', meaning: 'có tính minh họa' }
    ]
  },
  improve: {
    root: 'improv',
    items: [
      { word: 'improve', pos: 'v', phonetic: '/ɪmˈpruːv/', meaning: 'cải thiện, nâng cao' },
      { word: 'improvement', pos: 'n', phonetic: '/ɪmˈpruːv.mənt/', meaning: 'sự tiến bộ, sự cải thiện' }
    ]
  },
  inconvenient: {
    root: 'inconvenien',
    items: [
      { word: 'inconvenience', pos: 'n', phonetic: '/ˌɪn.kənˈviː.ni.əns/', meaning: 'sự bất tiện' },
      { word: 'inconvenience', pos: 'v', phonetic: '/ˌɪn.kənˈviː.ni.əns/', meaning: 'làm phiền' },
      { word: 'inconvenient', pos: 'adj', phonetic: '/ˌɪn.kənˈviː.ni.ənt/', meaning: 'bất tiện' },
      { word: 'inconveniently', pos: 'adv', phonetic: '/ˌɪn.kənˈviː.ni.ənt.li/', meaning: 'một cách bất tiện' }
    ]
  },
  increase: {
    root: 'increas',
    items: [
      { word: 'increase', pos: 'v', phonetic: '/ɪnˈkriːs/', meaning: 'tăng lên, gia tăng' },
      { word: 'increase', pos: 'n', phonetic: '/ˈɪn.kriːs/', meaning: 'sự gia tăng, mức tăng' },
      { word: 'increasing', pos: 'adj', phonetic: '/ɪnˈkriː.sɪŋ/', meaning: 'ngày càng tăng' },
      { word: 'increasingly', pos: 'adv', phonetic: '/ɪnˈkriː.sɪŋ.li/', meaning: 'ngày càng nhiều' }
    ]
  },
  independent: {
    root: 'independen',
    items: [
      { word: 'independent', pos: 'adj', phonetic: '/ˌɪn.dɪˈpen.dənt/', meaning: 'độc lập, tự chủ' },
      { word: 'independently', pos: 'adv', phonetic: '/ˌɪn.dɪˈpen.dənt.li/', meaning: 'một cách độc lập' },
      { word: 'independence', pos: 'n', phonetic: '/ˌɪn.dɪˈpen.dəns/', meaning: 'sự độc lập' }
    ]
  },
  inform: {
    root: 'inform',
    items: [
      { word: 'inform', pos: 'v', phonetic: '/ɪnˈfɔːm/', meaning: 'thông báo, báo tin' },
      { word: 'information', pos: 'n', phonetic: '/ˌɪn.fəˈmeɪ.ʃən/', meaning: 'thông tin' },
      { word: 'informative', pos: 'adj', phonetic: '/ɪnˈfɔː.mə.tɪv/', meaning: 'nhiều thông tin bổ ích' },
      { word: 'informed', pos: 'adj', phonetic: '/ɪnˈfɔːmd/', meaning: 'thông thái, am hiểu' }
    ]
  },
  inspect: {
    root: 'inspect',
    items: [
      { word: 'inspect', pos: 'v', phonetic: '/ɪnˈspekt/', meaning: 'thanh tra, kiểm tra kỹ lưỡng' },
      { word: 'inspection', pos: 'n', phonetic: '/ɪnˈspek.ʃən/', meaning: 'cuộc thanh tra, sự kiểm định' },
      { word: 'inspector', pos: 'n', phonetic: '/ɪnˈspek.tər/', meaning: 'thanh tra viên' }
    ]
  },
  install: {
    root: 'install',
    items: [
      { word: 'install', pos: 'v', phonetic: '/ɪnˈstɔːl/', meaning: 'lắp đặt, cài đặt thiết bị/phần mềm' },
      { word: 'installation', pos: 'n', phonetic: '/ˌɪn.stəˈleɪ.ʃən/', meaning: 'sự lắp đặt, cài đặt' },
      { word: 'installer', pos: 'n', phonetic: '/ɪnˈstɔː.lər/', meaning: 'thợ lắp ráp' }
    ]
  },
  legible: {
    root: 'legib',
    items: [
      { word: 'legible', pos: 'adj', phonetic: '/ˈledʒ.ə.bəl/', meaning: 'rõ ràng, dễ đọc (chữ viết)' },
      { word: 'legibly', pos: 'adv', phonetic: '/ˈledʒ.ə.bli/', meaning: 'một cách rõ ràng, dễ đọc' },
      { word: 'legibility', pos: 'n', phonetic: '/ˌledʒ.əˈbɪl.ə.ti/', meaning: 'độ rõ nét, tính dễ đọc' }
    ]
  },
  locate: {
    root: 'locat',
    items: [
      { word: 'locate', pos: 'v', phonetic: '/ləʊˈkeɪt/', meaning: 'xác định vị trí, đặt tại (be located in)' },
      { word: 'location', pos: 'n', phonetic: '/ləʊˈkeɪ.ʃən/', meaning: 'vị trí, địa điểm' }
    ]
  },
  maintain: {
    root: 'maintain',
    items: [
      { word: 'maintain', pos: 'v', phonetic: '/meɪnˈteɪn/', meaning: 'duy trì, bảo dưỡng định kỳ' },
      { word: 'maintenance', pos: 'n', phonetic: '/ˈmeɪn.tən.əns/', meaning: 'sự bảo trì, bảo dưỡng' }
    ]
  },
  manage: {
    root: 'manage',
    items: [
      { word: 'manage', pos: 'v', phonetic: '/ˈmæn.ɪdʒ/', meaning: 'quản lý, xoay xở được' },
      { word: 'management', pos: 'n', phonetic: '/ˈmæn.ɪdʒ.mənt/', meaning: 'ban quản lý, sự điều hành' },
      { word: 'manager', pos: 'n', phonetic: '/ˈmæn.ɪ.dʒər/', meaning: 'người quản lý, trưởng phòng' },
      { word: 'manageable', pos: 'adj', phonetic: '/ˈmæn.ɪ.dʒə.bəl/', meaning: 'có thể quản lý, kiểm soát được' }
    ]
  },
  meaningful: {
    root: 'meaning',
    items: [
      { word: 'mean', pos: 'v', phonetic: '/miːn/', meaning: 'có nghĩa là, dự định' },
      { word: 'meaning', pos: 'n', phonetic: '/ˈmiː.nɪŋ/', meaning: 'ý nghĩa' },
      { word: 'meaningful', pos: 'adj', phonetic: '/ˈmiː.nɪŋ.fəl/', meaning: 'đầy ý nghĩa, sâu sắc' },
      { word: 'meaningfully', pos: 'adv', phonetic: '/ˈmiː.nɪŋ.fəl.i/', meaning: 'một cách có ý nghĩa' }
    ]
  },
  negotiate: {
    root: 'negotiat',
    items: [
      { word: 'negotiate', pos: 'v', phonetic: '/nəˈɡəʊ.ʃi.eɪt/', meaning: 'đàm phán, thương lượng' },
      { word: 'negotiation', pos: 'n', phonetic: '/nəˌɡəʊ.ʃiˈeɪ.ʃən/', meaning: 'cuộc đàm phán' },
      { word: 'negotiable', pos: 'adj', phonetic: '/nəˈɡəʊ.ʃi.ə.bəl/', meaning: 'có thể thương lượng được' }
    ]
  },
  notice: {
    root: 'notic',
    items: [
      { word: 'notice', pos: 'v', phonetic: '/ˈnəʊ.tɪs/', meaning: 'chú ý, nhận thấy' },
      { word: 'notice', pos: 'n', phonetic: '/ˈnəʊ.tɪs/', meaning: 'thông báo, sự chú ý' },
      { word: 'noticeable', pos: 'adj', phonetic: '/ˈnəʊ.tɪ.sə.bəl/', meaning: 'đáng chú ý, dễ thấy' },
      { word: 'noticeably', pos: 'adv', phonetic: '/ˈnəʊ.tɪ.sə.bli/', meaning: 'một cách đáng kể' }
    ]
  },
  notify: {
    root: 'notif',
    items: [
      { word: 'notify', pos: 'v', phonetic: '/ˈnəʊ.tɪ.faɪ/', meaning: 'thông báo, gửi tin chính thức' },
      { word: 'notification', pos: 'n', phonetic: '/ˌnəʊ.tɪ.fɪˈkeɪ.ʃən/', meaning: 'thông báo, sự báo tin' }
    ]
  },
  organize: {
    root: 'organiz',
    items: [
      { word: 'organize', pos: 'v', phonetic: '/ˈɔː.ɡən.aɪz/', meaning: 'tổ chức, sắp xếp' },
      { word: 'organization', pos: 'n', phonetic: '/ˌɔː.ɡən.aɪˈzeɪ.ʃən/', meaning: 'cơ quan, tổ chức' },
      { word: 'organizational', pos: 'adj', phonetic: '/ˌɔː.ɡən.aɪˈzeɪ.ʃən.əl/', meaning: 'thuộc về cơ cấu tổ chức' },
      { word: 'organized', pos: 'adj', phonetic: '/ˈɔː.ɡən.aɪzd/', meaning: 'có tổ chức, ngăn nắp' }
    ]
  },
  periodic: {
    root: 'periodic',
    items: [
      { word: 'period', pos: 'n', phonetic: '/ˈpɪə.ri.əd/', meaning: 'giai đoạn, khoảng thời gian' },
      { word: 'periodic', pos: 'adj', phonetic: '/ˌpɪə.riˈɒd.ɪk/', meaning: 'định kỳ' },
      { word: 'periodically', pos: 'adv', phonetic: '/ˌpɪə.riˈɒd.ɪ.kəl.i/', meaning: 'theo định kỳ' }
    ]
  },
  postpone: {
    root: 'postpon',
    items: [
      { word: 'postpone', pos: 'v', phonetic: '/pəʊstˈpəʊn/', meaning: 'hoãn lại, lùi lịch' },
      { word: 'postponement', pos: 'n', phonetic: '/pəʊstˈpəʊn.mənt/', meaning: 'sự trì hoãn' }
    ]
  },
  practice: {
    root: 'practic',
    items: [
      { word: 'practice', pos: 'v/n', phonetic: '/ˈpræk.tɪs/', meaning: 'luyện tập, thói quen tác nghiệp' },
      { word: 'practical', pos: 'adj', phonetic: '/ˈpræk.tɪ.kəl/', meaning: 'thực tế, mang tính ứng dụng' },
      { word: 'practically', pos: 'adv', phonetic: '/ˈpræk.tɪ.kəl.i/', meaning: 'gần như, trên thực tế' }
    ]
  },
  prepare: {
    root: 'prepar',
    items: [
      { word: 'prepare', pos: 'v', phonetic: '/prɪˈpeər/', meaning: 'chuẩn bị' },
      { word: 'preparation', pos: 'n', phonetic: '/ˌprep.ərˈeɪ.ʃən/', meaning: 'sự chuẩn bị' },
      { word: 'prepared', pos: 'adj', phonetic: '/prɪˈpeəd/', meaning: 'sẵn sàng, đã được chuẩn bị' }
    ]
  },
  produce: {
    root: 'produc',
    items: [
      { word: 'produce', pos: 'v', phonetic: '/prəˈdjuːs/', meaning: 'sản xuất, chế tạo' },
      { word: 'production', pos: 'n', phonetic: '/prəˈdʌk.ʃən/', meaning: 'sản lượng, sự sản xuất' },
      { word: 'product', pos: 'n', phonetic: '/ˈprɒd.ʌkt/', meaning: 'sản phẩm' },
      { word: 'productive', pos: 'adj', phonetic: '/prəˈdʌk.tɪv/', meaning: 'năng suất cao, hiệu quả' },
      { word: 'productively', pos: 'adv', phonetic: '/prəˈdʌk.tɪv.li/', meaning: 'một cách hiệu quả' },
      { word: 'productivity', pos: 'n', phonetic: '/ˌprɒd.ʌkˈtɪv.ə.ti/', meaning: 'năng suất lao động' }
    ]
  },
  profession: {
    root: 'profession',
    items: [
      { word: 'profession', pos: 'n', phonetic: '/prəˈfeʃ.ən/', meaning: 'nghề nghiệp, chuyên môn' },
      { word: 'professional', pos: 'adj', phonetic: '/prəˈfeʃ.ən.əl/', meaning: 'chuyên nghiệp' },
      { word: 'professional', pos: 'n', phonetic: '/prəˈfeʃ.ən.əl/', meaning: 'chuyên gia' },
      { word: 'professionally', pos: 'adv', phonetic: '/prəˈfeʃ.ən.əl.i/', meaning: 'một cách chuyên nghiệp' },
      { word: 'professionalism', pos: 'n', phonetic: '/prəˈfeʃ.ən.əl.ɪ.zəm/', meaning: 'tác phong chuyên nghiệp' }
    ]
  },
  prompt: {
    root: 'prompt',
    items: [
      { word: 'prompt', pos: 'adj', phonetic: '/prɒmpt/', meaning: 'nhanh chóng, mau lẹ' },
      { word: 'promptly', pos: 'adv', phonetic: '/ˈprɒmpt.li/', meaning: 'ngay lập tức, đúng giờ' },
      { word: 'promptness', pos: 'n', phonetic: '/ˈprɒmpt.nəs/', meaning: 'sự nhanh nhẹn, tính đúng giờ' }
    ]
  },
  qualify: {
    root: 'qualif',
    items: [
      { word: 'qualify', pos: 'v', phonetic: '/ˈkwɒl.ɪ.faɪ/', meaning: 'đủ điều kiện, đạt chuẩn' },
      { word: 'qualification', pos: 'n', phonetic: '/ˌkwɒl.ɪ.fɪˈkeɪ.ʃən/', meaning: 'bằng cấp, năng lực chuyên môn' },
      { word: 'qualified', pos: 'adj', phonetic: '/ˈkwɒl.ɪ.faɪd/', meaning: 'có trình độ chuyên môn, đủ năng lực' }
    ]
  },
  reduce: {
    root: 'reduc',
    items: [
      { word: 'reduce', pos: 'v', phonetic: '/rɪˈdjuːs/', meaning: 'cắt giảm, giảm bớt chi phí' },
      { word: 'reduction', pos: 'n', phonetic: '/rɪˈdʌk.ʃən/', meaning: 'sự giảm thiểu, mức cắt giảm' }
    ]
  },
  rely: {
    root: 'reli',
    items: [
      { word: 'rely', pos: 'v', phonetic: '/rɪˈlaɪ/', meaning: 'tin cậy, phụ thuộc (rely on)' },
      { word: 'reliable', pos: 'adj', phonetic: '/rɪˈlaɪ.ə.bəl/', meaning: 'đáng tin cậy' },
      { word: 'reliably', pos: 'adv', phonetic: '/rɪˈlaɪ.ə.bli/', meaning: 'một cách đáng tin cậy' },
      { word: 'reliance', pos: 'n', phonetic: '/rɪˈlaɪ.əns/', meaning: 'sự tín nhiệm, sự trông cậy' }
    ]
  },
  relocate: {
    root: 'relocat',
    items: [
      { word: 'relocate', pos: 'v', phonetic: '/ˌriː.ləʊˈkeɪt/', meaning: 'chuyển địa điểm, dời văn phòng' },
      { word: 'relocation', pos: 'n', phonetic: '/ˌriː.ləʊˈkeɪ.ʃən/', meaning: 'sự dời địa điểm công tác' }
    ]
  },
  represent: {
    root: 'represent',
    items: [
      { word: 'represent', pos: 'v', phonetic: '/ˌrep.rɪˈzent/', meaning: 'đại diện cho' },
      { word: 'representative', pos: 'n', phonetic: '/ˌrep.rɪˈzen.tə.tɪv/', meaning: 'người đại diện, đại biểu' },
      { word: 'representation', pos: 'n', phonetic: '/ˌrep.rɪ.zenˈteɪ.ʃən/', meaning: 'sự đại diện' }
    ]
  },
  require: {
    root: 'requir',
    items: [
      { word: 'require', pos: 'v', phonetic: '/rɪˈkwaɪər/', meaning: 'yêu cầu, đòi hỏi' },
      { word: 'requirement', pos: 'n', phonetic: '/rɪˈkwaɪə.mənt/', meaning: 'yêu cầu bắt buộc' },
      { word: 'required', pos: 'adj', phonetic: '/rɪˈkwaɪəd/', meaning: 'bắt buộc' }
    ]
  },
  respond: {
    root: 'respond',
    items: [
      { word: 'respond', pos: 'v', phonetic: '/rɪˈspɒnd/', meaning: 'phản hồi, đáp lại' },
      { word: 'response', pos: 'n', phonetic: '/rɪˈspɒns/', meaning: 'câu trả lời, phản hồi' },
      { word: 'responsible', pos: 'adj', phonetic: '/rɪˈspɒn.sə.bəl/', meaning: 'chịu trách nhiệm (responsible for)' },
      { word: 'responsibly', pos: 'adv', phonetic: '/rɪˈspɒn.sə.bli/', meaning: 'một cách có trách nhiệm' },
      { word: 'responsibility', pos: 'n', phonetic: '/rɪˌspɒn.sɪˈbɪl.ə.ti/', meaning: 'trách nhiệm' }
    ]
  },
  revise: {
    root: 'revis',
    items: [
      { word: 'revise', pos: 'v', phonetic: '/rɪˈvaɪz/', meaning: 'sửa đổi, điều chỉnh văn bản' },
      { word: 'revision', pos: 'n', phonetic: '/rɪˈvɪʒ.ən/', meaning: 'bản sửa đổi, sự chỉnh sửa' }
    ]
  },
  satisfy: {
    root: 'satisf',
    items: [
      { word: 'satisfy', pos: 'v', phonetic: '/ˈsæt.ɪs.faɪ/', meaning: 'làm thỏa mãn, đáp ứng yêu cầu' },
      { word: 'satisfaction', pos: 'n', phonetic: '/ˌsæt.ɪsˈfæk.ʃən/', meaning: 'sự hài lòng, thỏa mãn' },
      { word: 'satisfactory', pos: 'adj', phonetic: '/ˌsæt.ɪsˈfæk.tər.i/', meaning: 'thỏa đáng, đạt yêu cầu' },
      { word: 'satisfied', pos: 'adj', phonetic: '/ˈsæt.ɪs.faɪd/', meaning: 'cảm thấy hài lòng' },
      { word: 'satisfactorily', pos: 'adv', phonetic: '/ˌsæt.ɪsˈfæk.tər.əl.i/', meaning: 'một cách thỏa đáng' }
    ]
  },
  sharp: {
    root: 'sharp',
    items: [
      { word: 'sharp', pos: 'adj', phonetic: '/ʃɑːp/', meaning: 'sắc bén, rõ rệt, nhanh chóng' },
      { word: 'sharply', pos: 'adv', phonetic: '/ˈʃɑːp.li/', meaning: 'đột ngột, mạnh mẽ (increase sharply)' },
      { word: 'sharpness', pos: 'n', phonetic: '/ˈʃɑːp.nəs/', meaning: 'độ sắc nét' }
    ]
  },
  significant: {
    root: 'signif',
    items: [
      { word: 'signify', pos: 'v', phonetic: '/ˈsɪɡ.nɪ.faɪ/', meaning: 'biểu thị, báo hiệu' },
      { word: 'significance', pos: 'n', phonetic: '/sɪɡˈnɪf.ɪ.kəns/', meaning: 'tầm quan trọng, ý nghĩa' },
      { word: 'significant', pos: 'adj', phonetic: '/sɪɡˈnɪf.ɪ.kənt/', meaning: 'đáng kể, quan trọng' },
      { word: 'significantly', pos: 'adv', phonetic: '/sɪɡˈnɪf.ɪ.kənt.li/', meaning: 'một cách đáng kể' }
    ]
  },
  specific: {
    root: 'specif',
    items: [
      { word: 'specify', pos: 'v', phonetic: '/ˈspes.ɪ.faɪ/', meaning: 'chỉ định rõ, ghi rõ chi tiết' },
      { word: 'specific', pos: 'adj', phonetic: '/spəˈsɪf.ɪk/', meaning: 'cụ thể, chi tiết' },
      { word: 'specifically', pos: 'adv', phonetic: '/spəˈsɪf.ɪ.kəl.i/', meaning: 'cụ thể là, đặc biệt' },
      { word: 'specification', pos: 'n', phonetic: '/ˌspes.ɪ.fɪˈkeɪ.ʃən/', meaning: 'thông số kỹ thuật' }
    ]
  },
  steady: {
    root: 'stead',
    items: [
      { word: 'steady', pos: 'adj', phonetic: '/ˈsted.i/', meaning: 'vững chắc, đều đặn' },
      { word: 'steadily', pos: 'adv', phonetic: '/ˈsted.əl.i/', meaning: 'một cách đều đặn' },
      { word: 'steadiness', pos: 'n', phonetic: '/ˈsted.i.nəs/', meaning: 'sự vững vàng' }
    ]
  },
  structure: {
    root: 'structur',
    items: [
      { word: 'structure', pos: 'n', phonetic: '/ˈstrʌk.tʃər/', meaning: 'kết cấu, cấu trúc' },
      { word: 'structural', pos: 'adj', phonetic: '/ˈstrʌk.tʃər.əl/', meaning: 'thuộc về kết cấu' },
      { word: 'structurally', pos: 'adv', phonetic: '/ˈstrʌk.tʃər.əl.i/', meaning: 'về mặt cấu trúc' }
    ]
  },
  submit: {
    root: 'submi',
    items: [
      { word: 'submit', pos: 'v', phonetic: '/səbˈmɪt/', meaning: 'nộp, đệ trình hồ sơ' },
      { word: 'submission', pos: 'n', phonetic: '/səbˈmɪʃ.ən/', meaning: 'sự nộp, tài liệu đệ trình' }
    ]
  },
  subscribe: {
    root: 'subscri',
    items: [
      { word: 'subscribe', pos: 'v', phonetic: '/səbˈskraɪb/', meaning: 'đăng ký theo dõi/đặt mua định kỳ' },
      { word: 'subscription', pos: 'n', phonetic: '/səbˈskrɪp.ʃən/', meaning: 'sự đăng ký thuê bao, gói định kỳ' },
      { word: 'subscriber', pos: 'n', phonetic: '/səbˈskraɪ.bər/', meaning: 'người đăng ký' }
    ]
  },
  substantial: {
    root: 'substan',
    items: [
      { word: 'substance', pos: 'n', phonetic: '/ˈsʌb.stəns/', meaning: 'chất, thực chất' },
      { word: 'substantial', pos: 'adj', phonetic: '/səbˈstæn.ʃəl/', meaning: 'đáng kể, to lớn (= significant)' },
      { word: 'substantially', pos: 'adv', phonetic: '/səbˈstæn.ʃəl.i/', meaning: 'đáng kể, thực chất' },
      { word: 'substantiate', pos: 'v', phonetic: '/səbˈstæn.ʃi.eɪt/', meaning: 'chứng minh, xác thực' }
    ]
  },
  supervise: {
    root: 'supervis',
    items: [
      { word: 'supervise', pos: 'v', phonetic: '/ˈsuː.pə.vaɪz/', meaning: 'giám sát, quản lý công việc' },
      { word: 'supervisor', pos: 'n', phonetic: '/ˈsuː.pə.vaɪ.zər/', meaning: 'người giám sát, sếp trực tiếp' },
      { word: 'supervision', pos: 'n', phonetic: '/ˌsuː.pəˈvɪʒ.ən/', meaning: 'sự giám sát' },
      { word: 'supervisory', pos: 'adj', phonetic: '/ˌsuː.pəˈvaɪ.zər.i/', meaning: 'mang tính giám sát' }
    ]
  },
  thorough: {
    root: 'thorough',
    items: [
      { word: 'thorough', pos: 'adj', phonetic: '/ˈθʌr.ə/', meaning: 'cẩn thận, kỹ lưỡng, triệt để' },
      { word: 'thoroughly', pos: 'adv', phonetic: '/ˈθʌr.ə.li/', meaning: 'một cách thấu đáo, triệt để' },
      { word: 'thoroughness', pos: 'n', phonetic: '/ˈθʌr.ə.nəs/', meaning: 'sự cẩn trọng, tỉ mỉ' }
    ]
  },
  transparent: {
    root: 'transparen',
    items: [
      { word: 'transparent', pos: 'adj', phonetic: '/trænˈspær.ənt/', meaning: 'minh bạch, rõ ràng' },
      { word: 'transparently', pos: 'adv', phonetic: '/trænˈspær.ənt.li/', meaning: 'một cách minh bạch' },
      { word: 'transparency', pos: 'n', phonetic: '/trænˈspær.ən.si/', meaning: 'sự minh bạch trong tài chính/thông tin' }
    ]
  },
  verify: {
    root: 'verif',
    items: [
      { word: 'verify', pos: 'v', phonetic: '/ˈver.ɪ.faɪ/', meaning: 'xác minh, kiểm chứng tính xác thực' },
      { word: 'verification', pos: 'n', phonetic: '/ˌver.ɪ.fɪˈkeɪ.ʃən/', meaning: 'sự xác nhận, kiểm chứng' },
      { word: 'verifiable', pos: 'adj', phonetic: '/ˈver.ɪ.faɪ.ə.bəl/', meaning: 'có thể xác minh được' }
    ]
  }
};

// =========================================================================
// 2. TỪ ĐIỂN TỪ VỰNG KINH DOANH & CỤM TỪ CỐT LÕI (200+ TỪ VỰNG TẦN SUẤT CAO)
// =========================================================================
export const TOEIC_KEY_VOCAB: Record<string, QuestionVocabItem> = {
  // Ban bệ & Nhân sự
  'board': { word: 'board', pos: 'n', phonetic: '/bɔːd/', meaning: 'ban giám đốc, hội đồng quản trị (board of directors)' },
  'personnel': { word: 'personnel', pos: 'n', phonetic: '/ˌpɜː.sənˈel/', meaning: 'nhân sự, đội ngũ nhân viên' },
  'candidate': { word: 'candidate', pos: 'n', phonetic: '/ˈkæn.dɪ.dət/', meaning: 'ứng viên ứng tuyển' },
  'applicant': { word: 'applicant', pos: 'n', phonetic: '/ˈæp.lɪ.kənt/', meaning: 'người nộp đơn xin việc' },
  'consultant': { word: 'consultant', pos: 'n', phonetic: '/kənˈsʌl.tənt/', meaning: 'chuyên viên tư vấn' },
  'representative': { word: 'representative', pos: 'n', phonetic: '/ˌrep.rɪˈzen.tə.tɪv/', meaning: 'đại diện bán hàng / dịch vụ' },
  'headquarters': { word: 'headquarters', pos: 'n', phonetic: '/ˌhedˈkwɔː.təz/', meaning: 'trụ sở chính công ty' },

  // Hợp đồng, Phê duyệt, Kiểm toán
  'approve': { word: 'approve', pos: 'v', phonetic: '/əˈpruːv/', meaning: 'phê duyệt, thông qua, tán thành' },
  'approval': { word: 'approval', pos: 'n', phonetic: '/əˈpruː.vəl/', meaning: 'sự phê chuẩn, chấp thuận' },
  'auditor': { word: 'auditor', pos: 'n', phonetic: '/ˈɔː.dɪ.tər/', meaning: 'kiểm toán viên' },
  'audit': { word: 'audit', pos: 'v', phonetic: '/ˈɔː.dɪt/', meaning: 'kiểm toán sổ sách' },
  'supporting documents': { word: 'supporting documents', pos: 'phrase', phonetic: '/səˈpɔː.tɪŋ ˈdɒk.jə.mənts/', meaning: 'các chứng từ, tài liệu chứng minh kèm theo' },
  'compile': { word: 'compile', pos: 'v', phonetic: '/kəmˈpaɪl/', meaning: 'tổng hợp, biên soạn tài liệu' },
  'finance team': { word: 'finance team', pos: 'phrase', phonetic: '/ˈfaɪ.næns tiːm/', meaning: 'bộ phận tài chính' },
  'revenue': { word: 'revenue', pos: 'n', phonetic: '/ˈrev.ən.juː/', meaning: 'doanh thu' },
  'reimbursement': { word: 'reimbursement', pos: 'n', phonetic: '/ˌriː.ɪmˈbɜːs.mənt/', meaning: 'khoản bồi hoàn chi phí' },
  'quota': { word: 'quota', pos: 'n', phonetic: '/ˈkwəʊ.tə/', meaning: 'chỉ tiêu, hạn ngạch doanh số' },
  'invoice': { word: 'invoice', pos: 'n', phonetic: '/ˈɪn.vɔɪs/', meaning: 'hóa đơn thanh toán' },
  'estimate': { word: 'estimate', pos: 'n/v', phonetic: '/ˈes.tɪ.meɪt/', meaning: 'bản ước tính giá, dự toán' },
  'warranty': { word: 'warranty', pos: 'n', phonetic: '/ˈwɒr.ən.ti/', meaning: 'chính sách bảo hành, phiếu bảo hành' },

  // Logistics & Cơ sở vật chất
  'logistics': { word: 'logistics', pos: 'n', phonetic: '/ləˈdʒɪs.tɪks/', meaning: 'hậu cần, vận chuyển kho bãi' },
  'distribution centre': { word: 'distribution centre', pos: 'phrase', phonetic: '/ˌdɪs.trɪˈbjuː.ʃən ˈsen.tər/', meaning: 'trung tâm phân phối hàng hóa' },
  'warehouse': { word: 'warehouse', pos: 'n', phonetic: '/ˈweə.haʊs/', meaning: 'nhà kho, kho hàng' },
  'vendor': { word: 'vendor', pos: 'n', phonetic: '/ˈven.dər/', meaning: 'nhà cung cấp, người bán hàng' },
  'inventory': { word: 'inventory', pos: 'n', phonetic: '/ˈɪn.vən.tər.i/', meaning: 'hàng tồn kho, sự kiểm kê' },
  'renovate': { word: 'renovate', pos: 'v', phonetic: '/ˈren.ə.veɪt/', meaning: 'cải tạo, tu sửa công trình' },
  'renovation': { word: 'renovation', pos: 'n', phonetic: '/ˌren.əˈveɪ.ʃən/', meaning: 'sự nâng cấp, cải tạo' },
  'spacious': { word: 'spacious', pos: 'adj', phonetic: '/ˈspeɪ.ʃəs/', meaning: 'rộng rãi, thoáng đãng' },
  'eastern region': { word: 'eastern region', pos: 'phrase', phonetic: '/ˈiː.stən ˈriː.dʒən/', meaning: 'khu vực phía đông' },

  // Quy định, Tính chất
  'mandatory': { word: 'mandatory', pos: 'adj', phonetic: '/ˈmæn.də.tər.i/', meaning: 'bắt buộc theo quy định (= compulsory)' },
  'confidential': { word: 'confidential', pos: 'adj', phonetic: '/ˌkɒn.fɪˈden.ʃəl/', meaning: 'tuyệt mật, bảo mật' },
  'eligible': { word: 'eligible', pos: 'adj', phonetic: '/ˈel.ɪ.dʒə.bəl/', meaning: 'đủ tư cách, đủ điều kiện (eligible for)' },
  'complimentary': { word: 'complimentary', pos: 'adj', phonetic: '/ˌkɒm.plɪˈmen.tər.i/', meaning: 'miễn phí phục vụ kèm theo' },
  'additional': { word: 'additional', pos: 'adj', phonetic: '/əˈdɪʃ.ən.əl/', meaning: 'bổ sung, thêm vào (= extra)' },
  'reliable': { word: 'reliable', pos: 'adj', phonetic: '/rɪˈlaɪ.ə.bəl/', meaning: 'đáng tin cậy' },
  'deadline': { word: 'deadline', pos: 'n', phonetic: '/ˈded.laɪn/', meaning: 'hạn chót' },
  'initiative': { word: 'initiative', pos: 'n', phonetic: '/ɪˈnɪʃ.ə.tɪv/', meaning: 'sáng kiến đổi mới' },
  'itinerary': { word: 'itinerary', pos: 'n', phonetic: '/aɪˈtɪn.ər.ər.i/', meaning: 'lịch trình công tác' },

  // Cụm từ cố định & Giới từ TOEIC
  'comply with': { word: 'comply with', pos: 'phrase', phonetic: '/kəmˈplaɪ wɪð/', meaning: 'tuân thủ nghiêm ngặt theo quy định' },
  'responsible for': { word: 'responsible for', pos: 'phrase', phonetic: '/rɪˈspɒn.sə.bəl fɔːr/', meaning: 'chịu trách nhiệm cho' },
  'prior to': { word: 'prior to', pos: 'phrase', phonetic: '/ˈpraɪ.ər tuː/', meaning: 'trước khi (= before)' },
  'in charge of': { word: 'in charge of', pos: 'phrase', phonetic: '/ɪn tʃɑːdʒ əv/', meaning: 'phụ trách, quản lý chính' },
  'in advance': { word: 'in advance', pos: 'phrase', phonetic: '/ɪn ədˈvɑːns/', meaning: 'trước, làm trước' },
  'take advantage of': { word: 'take advantage of', pos: 'phrase', phonetic: '/teɪk ədˈvɑːn.tɪdʒ əv/', meaning: 'tận dụng cơ hội' },
  'in accordance with': { word: 'in accordance with', pos: 'phrase', phonetic: '/ɪn əˈkɔː.dəns wɪð/', meaning: 'phù hợp với quy chuẩn/luật' },
  'as a result of': { word: 'as a result of', pos: 'phrase', phonetic: '/æz ə rɪˈzʌlt əv/', meaning: 'do hậu quả của, vì nguyên nhân' },
  'regardless of': { word: 'regardless of', pos: 'phrase', phonetic: '/rɪˈɡɑːd.ləs əv/', meaning: 'bất kể, không phân biệt' },
  'on behalf of': { word: 'on behalf of', pos: 'phrase', phonetic: '/ɒn bɪˈhɑːf əv/', meaning: 'thay mặt cho, đại diện cho' },
  'in conjunction with': { word: 'in conjunction with', pos: 'phrase', phonetic: '/ɪn kənˈdʒʌŋk.ʃən wɪð/', meaning: 'kết hợp cùng với' }
};

// =========================================================================
// 3. TỪ ĐIỂN DỊCH NGHĨA CÂU MẪU CHUẨN XÁC
// =========================================================================
export const CURATED_TRANSLATIONS: Record<string, string> = {
  'The board has approved the ______ of two additional distribution centres in the eastern region.':
    'Ban giám đốc đã phê duyệt việc xây dựng hai trung tâm phân phối bổ sung ở khu vực phía đông.',
  'By the time the auditors arrive next Monday, the finance team ______ all supporting documents.':
    'Trước khi các kiểm toán viên đến vào thứ Hai tới, đội ngũ tài chính sẽ đã tổng hợp xong tất cả tài liệu chứng minh.',
  'Mr. Halloran has worked at Brightline Logistics ______ more than fifteen years.':
    'Ông Halloran đã làm việc tại công ty Brightline Logistics được hơn mười lăm năm.',
  'Please submit your expense reports to the accounting department ______ Friday afternoon.':
    'Vui lòng nộp báo cáo chi tiêu của bạn cho bộ phận kế toán trước chiều thứ Sáu.',
  'The newly renovated cafeteria offers a wide ______ of healthy lunch options for employees.':
    'Nhà ăn mới được nâng cấp cung cấp nhiều lựa chọn bữa trưa tốt cho sức khỏe dành cho nhân viên.'
};
