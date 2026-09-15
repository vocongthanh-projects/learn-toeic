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
  hasVietnamese
} from '../../src/utils/explanationEnricher';

const VALID_TAXONOMY_IDS = new Set(Object.keys(TAXONOMY));

interface Part1Detail {
  translation: string;
  grammarBreakdown: string;
  tip: string;
  distractors: Record<string, string>;
}

const PART1_VI_EXPLANATIONS: Record<string, Part1Detail> = {
  's3_P1-001': {
    translation: 'Nhiều người đang ngồi họp tập trung quanh bàn hội nghị.',
    grammarBreakdown: 'Bức ảnh chụp một nhóm đồng nghiệp đang ngồi xung quanh bàn họp lớn trong phòng hội thảo (gathered around a conference table). Trên bàn có tài liệu và máy tính xách tay.',
    tip: 'Để ý vị trí tương quan: "gathered around a table" thường xuất hiện khi có từ 3 người trở lên ngồi quanh một bàn.',
    distractors: {
      A: 'Trong ảnh không hề có bảng trắng (whiteboard) và không có ai đang viết.',
      C: 'Các ghế văn phòng đang có người ngồi họp, không hề bị xếp chồng (stacked) lên nhau.',
      D: 'Mọi người đang họp trao đổi, không có ai đang tháo lắp hay sửa chữa máy tính.'
    }
  },
  's3_P1-002': {
    translation: 'Các công nhân đang đứng giữa những hàng kệ chất đầy thùng hàng.',
    grammarBreakdown: 'Trong kho hàng, hai công nhân đang đứng ở lối đi giữa hai dãy kệ chứa đầy các thùng carton (standing between shelves of boxes).',
    tip: 'Loại trừ ngay đáp án C (shelves empty) vì các kệ chứa đầy hàng, đáp án D (climbing ladder) vì không có thang.',
    distractors: {
      B: 'Các thùng hàng đang nằm trên giá kệ kho, không phải đang được bốc lên thùng xe tải giao hàng.',
      C: 'Các kệ hàng chứa đầy các thùng carton, không hề trống rỗng (completely empty).',
      D: 'Hai công nhân đang đứng dưới mặt sàn, không có ai đang trèo thang (climbing a ladder).'
    }
  },
  's3_P1-003': {
    translation: 'Các hành khách mang theo hành lý đang ngồi chờ trong nhà ga sân bay.',
    grammarBreakdown: 'Khung cảnh sảnh chờ sân bay với các hành khách đang ngồi trên dãy ghế cạnh cửa sổ lớn, bên cạnh có vali hành lý (waiting in an airport terminal with luggage).',
    tip: 'Nhận diện bối cảnh sân bay qua cửa kính nhìn ra đường băng và vali kéo của hành khách.',
    distractors: {
      A: 'Hành khách đang ngồi bên trong sảnh nhà ga, không phải đang ngoài trời bước lên xe buýt.',
      B: 'Các dãy ghế phòng chờ vẫn còn nguyên và có người ngồi, không hề bị tháo dỡ.',
      D: 'Không có phi công nào trong khung hình và không có ai đang kiểm tra động cơ máy bay.'
    }
  },
  's3_P1-004': {
    translation: 'Các công nhân xây dựng đang đứng phía sau rào chắn bên đường.',
    grammarBreakdown: 'Những người công nhân mặc áo bảo hộ phản quang đang đứng phía sau rào chắn an toàn thi công bên lề đường (standing behind a roadside barrier).',
    tip: 'Để ý trang phục bảo hộ (safety vest) và rào chắn công trình (barrier).',
    distractors: {
      A: 'Không có khách hàng nào đang bước vào siêu thị trong khung cảnh công trường này.',
      B: 'Các công nhân đang đứng bên lề đường thi công hạ tầng, không phải đang sơn tường tòa nhà.',
      C: 'Không có chiếc xe đạp nào đang đỗ cạnh lề đường.'
    }
  },
  's3_P1-005': {
    translation: 'Người phục vụ đang bưng một khay thức ăn.',
    grammarBreakdown: 'Nhân viên phục vụ nhà hàng đang cẩn thận bưng khay đựng các đĩa đồ ăn đến bàn ăn (carrying a tray of food).',
    tip: 'Chú ý hành động cầm/bưng bê: "carrying a tray" là động tác đặc trưng của nhân viên phục vụ.',
    distractors: {
      A: 'Khu vực bàn ăn đang phục vụ khách, không có nhân viên nào đang quét dọn sàn nhà.',
      C: 'Bàn ăn có khách đang ngồi đợi, không phải bàn trống đang xem thực đơn.',
      D: 'Đây là người phục vụ bưng đồ ra sảnh tiệc, không phải đầu bếp đang rửa bát trong bếp.'
    }
  },
  's3_P1-006': {
    translation: 'Một người đàn ông đang sử dụng máy in văn phòng.',
    grammarBreakdown: 'Một người đàn ông đang đứng trước chiếc máy photocopy/máy in văn phòng lớn và thực hiện thao tác in ấn (operating an office printer).',
    tip: 'Động từ "operating" trong TOEIC mang nghĩa thao tác, bấm nút điều khiển máy móc.',
    distractors: {
      B: 'Người đàn ông đang bấm màn hình máy in, không mang theo chồng bìa tài liệu nào.',
      C: 'Chiếc máy in đặt cố định trong phòng, không bị khiêng qua ô cửa.',
      D: 'Không có tài liệu nào đang được dán lên tường.'
    }
  },
  's3_P1-007': {
    translation: 'Một nhân viên đang xếp thùng hàng vào trong xe tải chở hàng.',
    grammarBreakdown: 'Nhân viên giao hàng đang nâng và đặt một thùng các-tông vào thùng sau của xe tải chở hàng (placing a box inside a van).',
    tip: 'Chú ý hành động xếp hàng "placing a box" vào khoang sau xe thay vì đáp án bẫy rửa xe.',
    distractors: {
      A: 'Không có chiếc xe nào đang được cọ rửa vệ sinh.',
      B: 'Các thùng hàng đang được nhân viên cầm bốc xếp, không bị bỏ mặc bên lề đường.',
      D: 'Nhân viên đang xếp hàng lên xe, không có khách hàng nào đang ký nhận gói bưu phẩm.'
    }
  },
  's3_P1-008': {
    translation: 'Các hành khách đang đứng chờ tại sân ga xe lửa.',
    grammarBreakdown: 'Nhiều hành khách đứng dọc theo sân ga cạnh đường ray tàu hỏa để đợi tàu đến (waiting on a train platform).',
    tip: '"Train platform" là sân ga đường sắt, thường có vạch an toàn màu vàng cạnh ray xe lửa.',
    distractors: {
      A: 'Đường ray tàu hỏa bình thường, không có công nhân nào đang sửa chữa đường ray.',
      B: 'Tàu chưa vào ga và không có cảnh tàu đang chạy qua cầu.',
      C: 'Sân ga có nhiều hành khách đang đứng đợi, không hề vắng tanh (empty).'
    }
  },
  's3_P1-009': {
    translation: 'Một người phụ nữ đang nói chuyện điện thoại tại quầy lễ tân.',
    grammarBreakdown: 'Nữ nhân viên lễ tân ngồi sau quầy tiếp đón và đang cầm ống nghe điện thoại nói chuyện với khách hàng (speaking on the phone at a reception desk).',
    tip: 'Bối cảnh quầy lễ tân (reception desk) và hành động nghe điện thoại (on the phone).',
    distractors: {
      A: 'Khách đang đứng chờ, không có ai đang cầm bút ký vào mẫu đơn.',
      C: 'Không có chiếc ghế nào đang được khiêng qua sảnh tiếp tân.',
      D: 'Không có chiếc máy tính nào đang bị tháo dỡ đóng vào thùng.'
    }
  },
  's3_P1-010': {
    translation: 'Một kỹ thuật viên đang kiểm tra một dãy tấm pin năng lượng mặt trời.',
    grammarBreakdown: 'Người kỹ sư/kỹ thuật viên đội mũ bảo hộ đang cúi xuống kiểm tra bề mặt của các tấm pin quang điện (inspecting a row of solar panels).',
    tip: 'Từ khóa "inspecting" (kiểm tra, thanh tra) là động từ tần suất cao trong Part 1.',
    distractors: {
      B: 'Thời tiết ban ngày khô ráo, các tấm pin không hề bị phủ tuyết (covered with snow).',
      C: 'Kỹ thuật viên đang kiểm tra tấm pin mặt trời, không phải thợ sơn mái nhà.',
      D: 'Không có thiết bị nào đang được bốc dỡ lên xe tải.'
    }
  },
  's3_P1-011': {
    translation: 'Một nhân viên đang quét mã vạch trên nhãn bưu kiện.',
    grammarBreakdown: 'Nhân viên kho cầm máy quét mã vạch điện tử và chiếu tia quét vào mã dán trên bề mặt thùng bưu kiện (scanning a label on a package).',
    tip: 'Hành động "scanning a label" bằng thiết bị cầm tay tại kho logistics.',
    distractors: {
      A: 'Không có ai đang bóc tem niêm phong kiện hàng.',
      B: 'Không có chiếc xe nâng hàng nào đang di chuyển trong khoang làm việc này.',
      D: 'Nhân viên đang quét mã kiểm kê bưu kiện, không phải hành động kiểm đếm tiền.'
    }
  },
  's3_P1-012': {
    translation: 'Một người phụ nữ đang tưới nước cho các chậu cây tại sảnh lớn.',
    grammarBreakdown: 'Người phụ nữ dùng bình tưới đang tưới nước cho những chậu cây cảnh đặt trang trí dọc hành lang sảnh toà nhà (watering potted plants in a lobby).',
    tip: '"Potted plants" nghĩa là cây cảnh trồng trong chậu, đặt ở không gian công cộng.',
    distractors: {
      A: 'Người phụ nữ đang cầm bình tưới nước, không cầm kéo cắt tỉa cành cây.',
      B: 'Không có nhân viên nào đang cầm cây lau sàn sảnh tòa nhà.',
      C: 'Các chậu cây đặt ngay ngắn trên kệ và sàn, không có chậu nào bị đổ ngã.'
    }
  },
  's3_P1-013': {
    translation: 'Cáp sạc đang được cắm kết nối vào xe ô tô điện.',
    grammarBreakdown: 'Đầu sạc pin ô tô điện từ trụ sạc đang được cắm kết nối trực tiếp vào cổng sạc của xe (charging cable is being connected to a vehicle).',
    tip: 'Dạng bị động "is being connected" mô tả trạng thái dây cáp đang được gắn vào xe.',
    distractors: {
      B: 'Dây cáp đang được cắm vào xe để nạp điện, không phải được cuộn gọn trên giá treo.',
      C: 'Xe đang đỗ sạc điện bình thường, không có người đang thay tháo lốp xe.',
      D: 'Trụ sạc pin và xe điện hoạt động bình thường, không có dấu hiệu bị hỏng hóc.'
    }
  },
  's3_P1-014': {
    translation: 'Nhân viên buồng phòng đang gấp khăn tắm bên cạnh xe đẩy đồ dùng.',
    grammarBreakdown: 'Người nhân viên dọn phòng khách sạn đứng cạnh xe đẩy chở đồ giặt ủi và đang gấp những chiếc khăn bông trắng (folding towels beside a cart).',
    tip: 'Hành động "folding towels" (gấp khăn) và vị trí "beside a cart" (cạnh xe đẩy).',
    distractors: {
      A: 'Nhân viên đang gấp khăn bên xe đẩy, không có ai đang cầm máy hút bụi thảm.',
      C: 'Không có hành khách nào đang làm thủ tục nhận phòng ở hành lang.',
      D: 'Đây là xe đẩy chuyên dụng của nhân viên buồng phòng, không phải xe đẩy hành lý của khách.'
    }
  },
  's3_P1-015': {
    translation: 'Một người công nhân đang với đặt một thùng hàng lên kệ cao.',
    grammarBreakdown: 'Người công nhân vươn tay đưa chiếc thùng các-tông đặt lên tầng kệ cao trong nhà kho (placing a box on a high shelf).',
    tip: 'Quan sát hướng chuyển động của tay và vị trí giá kệ cao (high shelf).',
    distractors: {
      A: 'Công nhân vươn tay xếp thùng lên giá cao, không phải dỡ hàng xuống sàn nhà.',
      B: 'Công nhân thực hiện thao tác thủ công bằng tay, không có xe nâng vận hành cạnh đó.',
      D: 'Kệ sắt chứa hàng rất kiên cố và ngay ngắn, không có kệ nào bị đổ sập.'
    }
  },
  's3_P1-016': {
    translation: 'Hai hành khách đi làm đang cùng xem và đối chiếu bản đồ tuyến giao thông.',
    grammarBreakdown: 'Hai người đứng trước bảng sơ đồ mạng lưới giao thông công cộng và cùng nhìn chỉ dẫn lộ trình (comparing transit maps).',
    tip: '"Transit map" là bản đồ tuyến giao thông công cộng (xe buýt, tàu điện ngầm).',
    distractors: {
      A: 'Hai người đang đứng đọc bảng lộ trình công cộng, không phải đang mua vé tại quầy.',
      B: 'Không có chiếc xe buýt nào đang mở cửa đón khách trong khung hình.',
      C: 'Cả hai đang nhìn trực tiếp lên bảng sơ đồ, không ai cầm điện thoại chụp ảnh.'
    }
  },
  's3_P1-017': {
    translation: 'Một người thợ đang đo chiều rộng của khung cửa sổ.',
    grammarBreakdown: 'Người thợ dùng thước cuộn kim loại để đo khoảng cách mép khung cửa sổ (measuring the width of a window frame).',
    tip: 'Hành động "measuring" (đo đạc) bằng thước dây trên khung cửa.',
    distractors: {
      B: 'Người thợ đang dùng thước cuộn đo kích thước, không phải đang cầm cọ sơn khung cửa.',
      C: 'Cửa sổ đang trong quá trình đo đạc lắp đặt, không có ai đang lau chùi mặt kính.',
      D: 'Không có chiếc cưa nào và không có thanh gỗ nào đang bị cưa xẻ trong góc chụp.'
    }
  },
  's3_P1-018': {
    translation: 'Nhiều chiếc ghế đã được xếp chồng gọn gàng bên cạnh các bàn cà phê.',
    grammarBreakdown: 'Các ghế ngồi ngoài trời được xếp chồng lên nhau gọn gàng bên cạnh bàn trong khu vực quán cà phê (chairs have been stacked beside cafe tables).',
    tip: 'Thể bị động / hiện tại hoàn thành mô tả trạng thái đồ vật: "chairs have been stacked".',
    distractors: {
      A: 'Khu vực bàn ghế ngoài trời đang được dọn xếp gọn, không có thực khách nào đang ăn uống.',
      B: 'Không có nhân viên phục vụ nào đang lau chùi mặt bàn cà phê.',
      D: 'Những chiếc ô che nắng đang được gập lại, không được mở bung.'
    }
  },
  's3_P1-019': {
    translation: 'Một người phụ nữ đang quẹt thẻ ra vào qua cổng kiểm soát tự động.',
    grammarBreakdown: 'Người phụ nữ đưa thẻ ra vào công ty chạm vào đầu đọc từ tại cửa kiểm soát an ninh (tapping an access card on a turnstile reader).',
    tip: '"Turnstile reader" là đầu đọc thẻ tại cổng xoay/cổng tự động của tòa nhà.',
    distractors: {
      A: 'Người phụ nữ tự quẹt thẻ qua cổng tự động, không có nhân viên bảo vệ đứng nói chuyện cùng.',
      C: 'Cửa kiểm soát từ tự động, không có ai đang mở balo kiểm tra đồ đạc.',
      D: 'Không có thang máy nào xuất hiện trong góc chụp tại sảnh cổng an ninh.'
    }
  },
  's3_P1-020': {
    translation: 'Một nhân viên đang dán băng dính niêm phong hộp bưu phẩm.',
    grammarBreakdown: 'Người đóng gói dùng cuộn băng keo dán dọc theo nắp hộp để niêm phong bưu phẩm trước khi gửi (sealing a package with tape).',
    tip: 'Cụm từ "sealing with tape" (dán kín bằng băng keo) rất hay gặp ở các khâu đóng gói hàng.',
    distractors: {
      A: 'Nhân viên đang dùng cuộn băng dính dán nắp thùng, không phải đang cân trọng lượng kiện hàng.',
      B: 'Thùng hàng làm bằng giấy bìa các-tông, không phải thùng gỗ cần đóng đinh.',
      D: 'Đây là bàn đóng gói trong kho hàng, không có chiếc xe tải giao hàng nào trong phòng.'
    }
  },
  's3_P1-021': {
    translation: 'Một người thợ đang điều chỉnh bộ điều nhiệt gắn trên tường.',
    grammarBreakdown: 'Tay người thợ đang vặn điều chỉnh thiết bị hiển thị nhiệt độ gắn trên tường phòng (adjusting a wall-mounted thermostat).',
    tip: '"Wall-mounted" nghĩa là gắn/treo trên tường; "thermostat" là bộ điều khiển nhiệt độ.',
    distractors: {
      B: 'Người thợ đang dùng tay vặn núm điều chỉnh thiết bị, không phải đang dùng máy khoan tường.',
      C: 'Thiết bị được lắp cố định ngay ngắn trên tường, không phải đặt nằm dưới sàn.',
      D: 'Hộp điều nhiệt nguyên vẹn, không có sợi dây điện hở nào bị rơi thò ra ngoài.'
    }
  },
  's3_P1-022': {
    translation: 'Các hàng ghế trong phòng đào tạo đều hướng về phía màn hình thuyết trình.',
    grammarBreakdown: 'Trong phòng hội thảo/đào tạo, các hàng ghế được kê ngay ngắn và đều quay mặt về phía màn hình chiếu trung tâm (rows of chairs are facing a presentation screen).',
    tip: 'Động từ "facing" chỉ hướng quay mặt của ghế hoặc người về một phía.',
    distractors: {
      A: 'Phòng đào tạo đang trống người chuẩn bị cho buổi họp, không có diễn giả nào đang phát biểu.',
      B: 'Các dãy ghế được xếp thành hàng thẳng tắp, không hề bị xô lệch hay lộn xộn.',
      C: 'Màn hình chiếu đang bật sáng sẵn sàng, không hề bị tắt tối.'
    }
  },
  's3_P1-023': {
    translation: 'Một người đi làm đang khóa xe đạp vào giá để xe.',
    grammarBreakdown: 'Người đi xe đạp đang dùng ổ khóa để khóa khung xe đạp vào thanh giá đỗ xe trên vỉa hè (fastening a bicycle to a rack).',
    tip: '"Bicycle rack" là giá/thanh kim loại chuyên dùng để dựng và khóa xe đạp.',
    distractors: {
      A: 'Người này đang cúi người bấm khóa xe vào giá sắt, không phải đang đạp xe lưu thông trên đường.',
      C: 'Xe đạp còn nguyên vẹn và đang đứng vững, không hề bị thủng hay xẹp lốp.',
      D: 'Đây là khu vực giá đỗ xe đạp chuyên dụng, không có xe máy nào đỗ tại đây.'
    }
  },
  's3_P1-024': {
    translation: 'Một thủ thư đang xếp sách lên xe đẩy chuyên dụng trong thư viện.',
    grammarBreakdown: 'Nhân viên thư viện đang lấy các cuốn sách và đặt ngay ngắn lên xe đẩy nhiều tầng để phân loại (placing a book on a rolling cart).',
    tip: '"Rolling cart" là xe đẩy có bánh lăn trong văn phòng hoặc thư viện.',
    distractors: {
      B: 'Nhân viên thư viện đang phân loại sách lên xe đẩy, không phải độc giả đang ngồi đọc sách.',
      C: 'Sách được cầm và xếp ngăn nắp trên xe đẩy, không có cuốn sách nào bị rơi xuống sàn.',
      D: 'Không có quầy thanh toán hay thủ tục mượn trả sách nào trong góc chụp này.'
    }
  },
  's3_P1-025': {
    translation: 'Một kỹ thuật viên đang cuộn gọn lại dây cáp điện.',
    grammarBreakdown: 'Người thợ/kỹ thuật viên dùng tay cuộn tròn sợi dây cáp điện dài thành từng vòng gọn gàng (coiling an electrical cable).',
    tip: 'Động từ "coiling" nghĩa là cuộn dây thành vòng tròn.',
    distractors: {
      A: 'Kỹ thuật viên đang dùng hai tay cuộn dây cáp, không phải đang cắm phích điện vào ổ cắm.',
      B: 'Sợi dây cáp dày màu đen chuyên dụng, không phải dây kim loại mỏng.',
      C: 'Khu vực làm việc an toàn, không có thiết bị điện nào đang bị chập cháy hay bốc khói.'
    }
  }
};

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

  // 1. PART 1: 100% Custom Visual Breakdown
  if (q.part === 1 && PART1_VI_EXPLANATIONS[q.id]) {
    const p1Meta = PART1_VI_EXPLANATIONS[q.id];
    return {
      translation: p1Meta.translation,
      grammarBreakdown: p1Meta.grammarBreakdown,
      distractors: p1Meta.distractors,
      whyYouGotItWrong: 'Dễ bị bẫy bởi các từ chỉ đồ vật hoặc hành động gần giống nhưng không hề xuất hiện trong ảnh.',
      quickTrick: `⚡ ${p1Meta.tip}`
    };
  }

  // 2. Base Translation
  let translation = current.translation;
  if (!translation || hasChinese(translation) || translation.includes('Câu hỏi kiểm tra ngữ pháp')) {
    translation = getCleanSentenceTranslation(q);
  }

  // 3. Grammar Breakdown
  let grammarBreakdown = current.grammarBreakdown;
  if (!grammarBreakdown || hasChinese(grammarBreakdown) || !hasVietnamese(grammarBreakdown) || grammarBreakdown.includes('Between “the” and “of”') || grammarBreakdown.length < 30) {
    grammarBreakdown = getDeepGrammarBreakdown(q);
  } else if (q.evidence && !grammarBreakdown.includes('Dẫn chứng')) {
    grammarBreakdown = `Dẫn chứng trong văn bản: "${q.evidence}". ${grammarBreakdown}`;
  }

  // 4. Distractors Analysis
  let distractors: Partial<Record<'A' | 'B' | 'C' | 'D', string>> = {};
  const part5FormReq = q.part === 5 ? detectPart5FormRequirement(q) : null;

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
