export const QUESTION_TYPE_VI_MAP: Record<string, string> = {
  '圖片描述': 'Mô tả tranh (Part 1)',
  '應答': 'Hỏi & Đáp (Part 2)',
  '對話': 'Đoạn hội thoại (Part 3)',
  '公告': 'Thông báo (Part 4/7)',
  '語音留言': 'Tin nhắn thoại',
  '會議安排': 'Sắp xếp cuộc họp',
  '飯店訂房': 'Đặt phòng khách sạn',
  '物流延誤': 'Chậm trễ vận chuyển',
  '求職面試': 'Phỏng vấn tuyển dụng',
  '設備維修': 'Bảo trì thiết bị',
  '行銷活動': 'Chiến dịch tiếp thị',
  '訂單修改': 'Chỉnh sửa đơn hàng',
  '簡報設備': 'Thiết bị thuyết trình',
  '員工訓練': 'Đào tạo nhân viên',
  '餐廳設備': 'Trang thiết bị nhà hàng',
  '差旅安排': 'Sắp xếp công tác',
  '網站更新': 'Cập nhật website',
  '交通公告': 'Thông báo giao thông',
  '場館公告': 'Thông báo địa điểm',
  '公司安全': 'An toàn lao động',
  '商店公告': 'Thông báo cửa hàng',
  '會議開場': 'Mở đầu cuộc họp',
  '辦公室公告': 'Thông báo văn phòng',
  '商務活動': 'Hoạt động kinh doanh',
  '商店語音': 'Thông báo thoại cửa hàng',
  '辦公室搬遷': 'Chuyển văn phòng',
  '商品攝影': 'Chụp ảnh sản phẩm',
  '印刷訂單': 'Đơn hàng in ấn',
  '客戶軟體展示': 'Demo phần mềm khách hàng',
  '商店陳列': 'Trưng bày cửa hàng',
  '接待系統更新': 'Cập nhật hệ thống tiếp tân',
  '線上研討會': 'Hội thảo trực tuyến (Webinar)',
  '客服系統更新': 'Cập nhật hệ thống CSKH',
  '供應商簡報': 'Báo cáo nhà cung cấp',
  'AI 會議逐字稿': 'Biên bản cuộc họp AI',
  '機場公告': 'Thông báo sân bay',
  '大樓公告': 'Thông báo tòa nhà',
  '產品說明': 'Mô tả sản phẩm',
  '圖書館公告': 'Thông báo thư viện',
  '飯店語音': 'Tổng đài khách sạn',
  '公司活動': 'Sự kiện công ty',
  '旅客服務公告': 'Thông báo dịch vụ hành khách',
  '公司公告': 'Thông báo doanh nghiệp',
  '電動車充電設備': 'Trạm sạc xe điện',
  '無密碼登入': 'Đăng nhập không mật khẩu',
  '智慧訪客通行': 'Thẻ khách thông minh',
  '混合會議字幕': 'Phụ đề cuộc họp kết hợp',
  '資安試行評估': 'Thử nghiệm an ninh mạng',
  '活動介紹': 'Giới thiệu sự kiện',
  '倉儲無人機公告': 'Drone trong quản lý kho',
  '循環包裝計畫': 'Bao bì tuần hoàn',
  '交通應用程式更新': 'Cập nhật ứng dụng giao thông',
  '行李追蹤更新': 'Theo dõi hành lý',
  '門市太陽能維护': 'Bảo trì năng lượng mặt trời',
  '接駁路線公告': 'Tuyến xe đưa đón',
  '科技支援': 'Hỗ trợ kỹ thuật IT',
  '行程安排': 'Sắp xếp lịch trình',
  '辦公室溝通': 'Giao tiếp văn phòng',
  '請求協助': 'Yêu cầu trợ giúp',
  '請求回應': 'Phản hồi yêu cầu',
  '時間辨識': 'Nhận biết thời gian',
  '地點辨識': 'Nhận biết địa điểm',
  '間接回應': 'Phản hồi gián tiếp',
  '是非題': 'Câu hỏi Yes/No',
  '建議回應': 'Phản hồi lời khuyên',
  '原因辨識': 'Nhận biết lý do / nguyên nhân',
  '轉折回應': 'Phản hồi chuyển hướng ý',
  '選項題': 'Câu hỏi lựa chọn (Or)',
  '確認資訊': 'Xác nhận thông tin',
  '人物辨識': 'Nhận biết nhân vật',
  '否定問句': 'Câu hỏi phủ định',
  '頻率辨識': 'Nhận biết tần suất',
  '選擇辨識': 'Lựa chọn phương án',
  '陳述回應': 'Phản hồi câu trần thuật',
  '委婉請求': 'Yêu cầu lịch sự',
  '提議判斷': 'Đánh giá đề xuất',
  '期間辨識': 'Nhận biết khoảng thời gian',
  '提議回應': 'Phản hồi lời đề nghị',
  '否定完成問句': 'Câu hỏi phủ định thì hoàn thành',
  '許可請求': 'Yêu cầu cho phép',
  '陳述推論': 'Suy luận câu trần thuật',
  '數量辨識': 'Nhận biết số lượng',
  '人物與職責': 'Nhân vật & nhiệm vụ',
  '介系詞': 'Giới từ (Prepositions)',
  '固定搭配': 'Cụm từ cố định (Collocations)',
  '動名詞': 'Danh động từ (Gerunds)',
  '時態': 'Thì động từ (Tenses)',
  '原因片語': 'Cụm từ chỉ nguyên nhân',
  '連接詞': 'Liên từ (Conjunctions)',
  '副詞': 'Trạng từ (Adverbs)',
  '動詞原形': 'Động từ nguyên mẫu (Bare Infinitive)',
  '關係代名詞': 'Đại từ quan hệ',
  '條件句': 'Câu điều kiện (Conditionals)',
  '讓步': 'Mệnh đề nhượng bộ',
  '詞性': 'Biến thể từ loại (Word Form)',
  '固定句型': 'Mẫu câu cố định',
  '相關連接詞': 'Liên từ tương quan',
  '平行結構': 'Cấu trúc song song (Parallelism)',
  'be動詞': 'Động từ To Be',
  '過去完成式': 'Quá khứ hoàn thành',
  '不定詞': 'Động từ nguyên mẫu To-V',
  '分詞構句': 'Mệnh đề phân từ',
  '介系詞關係代名詞': 'Giới từ + Đại từ quan hệ',
  '假設語氣': 'Câu giả định & Điều kiện',
  '倒裝假設': 'Đảo ngữ câu điều kiện',
  '被動語態': 'Thể bị động (Passive Voice)',
  '最高級': 'So sánh nhất (Superlatives)',
  '數量詞': 'Từ chỉ số lượng (Quantifiers)',
  '電子郵件': 'Email thương mại',
  '顧客通知': 'Thông báo khách hàng',
  '內部備忘錄': 'Bản ghi nhớ nội bộ (Memo)',
  '廣告': 'Quảng cáo (Advertisement)',
  '公司新聞': 'Bản tin doanh nghiệp',
  '客訴信': 'Thư khiếu nại',
  '活動通知': 'Thông báo sự kiện',
  '雙篇閱讀': 'Đoạn đôi (Double Passage)',
  '三篇閱讀': 'Đoạn ba (Triple Passage)',
  '職缺': 'Tuyển dụng việc làm',
  '訂單確認': 'Xác nhận đơn hàng',
  '備忘錄': 'Bản ghi nhớ (Memo)',
  '文章': 'Bài viết / Bài báo',
  '活動公告': 'Thông báo sự kiện',
  '公司電子郵件': 'Email doanh nghiệp',
  '公司文章': 'Bài viết doanh nghiệp',
  '訂單通知': 'Thông báo đơn hàng',
  '限定詞': 'Từ hạn định (Determiners)',
  '主動詞一致': 'Hòa hợp chủ - vị',
  '主詞動詞一致': 'Hòa hợp chủ - vị',
  '時間介系詞': 'Giới từ chỉ thời gian',
  '片語介系詞': 'Cụm giới từ',
  '名詞子句': 'Mệnh đề danh ngữ (Noun Clause)',
  '目的子句': 'Mệnh đề mục đích',
  '商務字彙': 'Từ vựng thương mại (Vocabulary)',
  '服務公告': 'Thông báo dịch vụ',
  '辦公室通知': 'Thông báo văn phòng',
  '員工通知': 'Thông báo nhân viên',
  '活動網頁': 'Trang web sự kiện',
  '訂位確認': 'Xác nhận đặt bàn / phòng',
  '關係副詞': 'Trạng từ quan hệ',
  '關係子句': 'Mệnh đề quan hệ',
  '倒裝': 'Đảo ngữ (Inversion)',
  '倒裝句': 'Đảo ngữ (Inversion)',
  '分詞': 'Phân từ (Participles)',
  '完成式': 'Thì hoàn thành',
  '未來完成式': 'Tương lai hoàn thành',
  '比較級': 'Cấu trúc so sánh hơn',
  '比較結構': 'Cấu trúc so sánh',
  '代名詞': 'Đại từ (Pronouns)',
  '連接副詞': 'Trạng từ liên kết',
  '副詞子句': 'Mệnh đề trạng ngữ',
  '產品召回': 'Thu hồi sản phẩm',
  '系統通知': 'Thông báo hệ thống',
  '短文填空': 'Điền đoạn văn (Part 6)',
  '單篇閱讀': 'Đoạn đơn (Single Passage)',
  '科技公告': 'Thông báo công nghệ',
  '語意副詞': 'Trạng từ theo nghĩa',
  '同位語': 'Ngữ đồng vị (Appositive)',
  '讓步介系詞': 'Giới từ nhượng bộ (despite/in spite of)',
  '形容詞': 'Tính từ (Adjectives)',
  '名詞': 'Danh từ (Nouns)',
  '動詞': 'Động từ (Verbs)',
  '動詞搭配': 'Cụm động từ (Collocations)',
  '介系詞搭配': 'Cụm giới từ kết hợp',
  '動詞時態': 'Thì của động từ',
  '副詞位置': 'Vị trí của trạng từ',
  '時間連接詞': 'Liên từ chỉ thời gian',
  '形容詞語意': 'Ngữ nghĩa của tính từ',
  '名詞選擇': 'Chọn danh từ thích hợp',
  '形容詞補語': 'Bổ ngữ tính từ',
  '名詞搭配': 'Cụm danh từ kết hợp',
  '動詞型態': 'Dạng của động từ',
  '可數名詞': 'Danh từ đếm được',
  '分詞形容詞': 'Tính từ phân từ (-ing / -ed)',
  '固定片語': 'Cụm từ cố định',
  '動詞語意': 'Ngữ nghĩa của động từ',
  '所有格': 'Đại từ sở hữu',
  '倒裝條件': 'Đảo ngữ câu điều kiện',
  '句意與副詞': 'Ngữ nghĩa & Trạng từ',
  '讓步邏輯': 'Quan hệ tương phản / nhượng bộ',
  '語意精準': 'Tính chuẩn xác về ngữ nghĩa',
  '代名詞指涉': 'Đại từ chỉ xuất',
  '目的連接': 'Liên từ chỉ mục đích',
  '比較與推論': 'So sánh và suy luận',
  '例外條件': 'Điều kiện ngoại lệ',
  '省略關係子句': 'Rút gọn mệnh đề quan hệ',
  '省略副詞子句': 'Rút gọn mệnh đề trạng ngữ',
  '分詞片語': 'Cụm phân từ',
  '條件連接詞': 'Liên từ điều kiện (if/unless)',
  '假設語氣倒裝': 'Đảo ngữ câu điều kiện',
  '要求類假設語氣': 'Giả định thức (Subjunctive: demand, insist)',
  '系統維護通知': 'Thông báo bảo trì hệ thống',
  '產品保固信件': 'Thư bảo hành sản phẩm',
  '人力資源公告': 'Thông báo nhân sự (HR)',
  '活動邀請': 'Thư mời sự kiện',
  '資料保留政策': 'Chính sách lưu trữ dữ liệu',
  '培訓課程郵件': 'Email khóa đào tạo',
  '服務持續性公告': 'Thông báo duy trì dịch vụ',
  '合約續約通知': 'Thông báo gia hạn hợp đồng',
  '設備維護備忘錄': 'Bản ghi nhớ bảo trì thiết bị',
  '會議紀錄工具試行': 'Thử nghiệm công cụ ghi biên bản họp',
  '循環包材回收通知': 'Thông báo thu hồi bao bì tuần hoàn',
  '客服時段調整': 'Điều chỉnh giờ làm việc CSKH',
  '政策公告': 'Thông báo chính sách',
  '作業流程': 'Quy trình vận hành',
  '數據報告': 'Báo cáo số liệu',
  '內部信件': 'Email nội bộ',
  '立場聲明': 'Tuyên bố lập trường'
};

export const TAGS_VI_MAP: Record<string, string> = {
  '條件例外': 'Điều kiện ngoại lệ',
  '流程順序': 'Trình tự quy trình',
  '跨文件推論': 'Suy luận liên văn bản',
  '數據判讀': 'Đọc hiểu số liệu',
  '目的意圖': 'Mục đích & Ý đồ',
  '語氣立場': 'Thái độ & Lập trường'
};

export function translateEvidenceLocation(loc?: string): string | undefined {
  if (!loc) return undefined;
  let s = loc;

  // Documents
  s = s.replace(/進場公告/g, 'Thông báo vào cổng');
  s = s.replace(/更新公告/g, 'Thông báo cập nhật');
  s = s.replace(/估價單/g, 'Bảng báo giá');
  s = s.replace(/課程表/g, 'Lịch đào tạo');
  s = s.replace(/退貨政策/g, 'Chính sách đổi trả');
  s = s.replace(/會議行程/g, 'Lịch trình hội nghị');
  s = s.replace(/工作站政策/g, 'Chính sách trạm làm việc');
  s = s.replace(/Job Posting/g, 'Bảng tin tuyển dụng');
  s = s.replace(/E-mail/g, 'Email');
  s = s.replace(/Online Chat/g, 'Đoạn chat trực tuyến');
  s = s.replace(/Warranty Card/g, 'Phiếu bảo hành');
  s = s.replace(/Conference Agenda/g, 'Lịch trình hội nghị');
  s = s.replace(/Text Message/g, 'Tin nhắn văn bản');
  s = s.replace(/Invoice Note/g, 'Ghi chú hóa đơn');
  s = s.replace(/Article/g, 'Bài viết');
  s = s.replace(/Resident Comment/g, 'Ý kiến cư dân');
  s = s.replace(/Memo/g, 'Bản ghi nhớ nội bộ');
  s = s.replace(/FAQ/g, 'Câu hỏi thường gặp FAQ');

  // Relative positions
  s = s.replace(/費用表後/g, 'sau bảng biểu phí, ');
  s = s.replace(/倒數第二句/g, 'câu áp chót');
  s = s.replace(/倒數第 2 句/g, 'câu áp chót');
  s = s.replace(/最後一句/g, 'câu cuối cùng');
  s = s.replace(/最後一列/g, 'hàng cuối cùng');
  s = s.replace(/第 1 句/g, 'câu 1');
  s = s.replace(/第一句/g, 'câu 1');
  s = s.replace(/第 2 句/g, 'câu 2');
  s = s.replace(/第二句/g, 'câu 2');
  s = s.replace(/第 3 句/g, 'câu 3');
  s = s.replace(/第三句/g, 'câu 3');
  s = s.replace(/第 4 句/g, 'câu 4');
  s = s.replace(/第四句/g, 'câu 4');
  s = s.replace(/第 5 句/g, 'câu 5');
  s = s.replace(/第五句/g, 'câu 5');
  s = s.replace(/第 1–2 句/g, 'câu 1–2');

  // Specific actors / conditions
  s = s.replace(/Customer/g, 'Khách hàng');
  s = s.replace(/Agent/g, 'Nhân viên CSKH');
  s = s.replace(/回覆/g, 'phản hồi');
  s = s.replace(/回答中的資料排除項目/g, 'mục loại trừ dữ liệu trong phần trả lời');
  s = s.replace(/回答/g, 'phần trả lời');
  s = s.replace(/場次/g, 'phiên');
  s = s.replace(/的 before 條件/g, ' (điều kiện before)');
  s = s.replace(/的 after 條件/g, ' (điều kiện after)');
  s = s.replace(/一般規則/g, 'quy tắc chung');
  s = s.replace(/限制條件/g, 'điều kiện ràng buộc');
  s = s.replace(/例外規則/g, 'quy tắc ngoại lệ');
  s = s.replace(/例外的例外/g, 'ngoại lệ của ngoại lệ');
  s = s.replace(/流程起點/g, 'bước khởi đầu quy trình');

  // Strip any remaining Chinese artifacts
  s = s.replace(/[\u4e00-\u9fa5]/g, '').trim();
  s = s.replace(/｜\s*$/, '').trim();

  return s;
}

export function translateQuestionType(raw?: string): string {
  if (!raw) return 'TOEIC Practice';
  if (QUESTION_TYPE_VI_MAP[raw]) {
    return QUESTION_TYPE_VI_MAP[raw];
  }

  let s = raw;
  // Prefixes
  s = s.replace(/^單篇閱讀[・·]/, 'Đoạn đơn: ');
  s = s.replace(/^雙篇閱讀[・·]/, 'Đoạn đôi: ');
  s = s.replace(/^三篇閱讀[・·]/, 'Đoạn ba: ');
  s = s.replace(/^訊息串[・·]/, 'Chuỗi tin nhắn: ');
  s = s.replace(/^公告規範[・·]/, 'Quy định thông báo: ');

  // Sub-topics
  s = s.replace(/場地進場規則/g, 'Quy tắc vào cổng & địa điểm');
  s = s.replace(/通勤票更新/g, 'Cập nhật vé đi lại');
  s = s.replace(/維修估價/g, 'Báo giá sửa chữa');
  s = s.replace(/培訓先修/g, 'Yêu cầu tiên quyết khóa đào tạo');
  s = s.replace(/企業退貨/g, 'Chính sách đổi trả doanh nghiệp');
  s = s.replace(/工作站政策/g, 'Chính sách trạm làm việc');
  s = s.replace(/訂單延誤/g, 'Chậm trễ đơn hàng');
  s = s.replace(/商務論壇/g, 'Diễn đàn thương mại');
  s = s.replace(/費用流程/g, 'Quy trình thanh toán chi phí');
  s = s.replace(/產品更新/g, 'Cập nhật sản phẩm');
  s = s.replace(/營運研究/g, 'Nghiên cứu vận hành');
  s = s.replace(/課程公告/g, 'Thông báo khóa học');
  s = s.replace(/無障礙設計/g, 'Thiết kế hỗ trợ người khuyết tật');
  s = s.replace(/AI 採購/g, 'Mua sắm giải pháp AI');
  s = s.replace(/碳排資料/g, 'Dữ liệu phát thải carbon');
  s = s.replace(/場館整修/g, 'Tu sửa cơ sở vật chất');
  s = s.replace(/供應商績效/g, 'Đánh giá nhà cung cấp');
  s = s.replace(/設備安裝/g, 'Lắp đặt thiết bị');
  s = s.replace(/展示欄/g, 'Bảng trưng bày');
  s = s.replace(/隔音板訂單/g, 'Đơn hàng tấm cách âm');
  s = s.replace(/電話語音服務/g, 'Dịch vụ thoại qua điện thoại');
  s = s.replace(/鐵路時刻/g, 'Lịch trình đường sắt');
  s = s.replace(/服務帳單/g, 'Hóa đơn dịch vụ');
  s = s.replace(/服務圖表/g, 'Biểu đồ dịch vụ');
  s = s.replace(/庫存訂單/g, 'Đơn hàng tồn kho');
  s = s.replace(/會議議程/g, 'Nghị trình cuộc họp');
  s = s.replace(/差旅報支/g, 'Thanh toán chi phí công tác');
  s = s.replace(/服務合約/g, 'Hợp đồng dịch vụ');
  s = s.replace(/補助表單/g, 'Mẫu đơn xin trợ cấp');
  s = s.replace(/行事曆協調/g, 'Phối hợp lịch làm việc');
  s = s.replace(/行銷圖表/g, 'Biểu đồ tiếp thị');
  s = s.replace(/智慧門禁/g, 'Kiểm soát ra vào thông minh');
  s = s.replace(/充電費報銷/g, 'Hoàn trả phí sạc xe điện');
  s = s.replace(/翻譯工具試辦/g, 'Thử nghiệm công cụ dịch thuật');
  s = s.replace(/門市太陽能維[護护]/g, 'Bảo trì pin mặt trời tại cửa hàng');
  s = s.replace(/讓步連接詞/g, 'Liên từ chỉ sự nhượng bộ');
  s = s.replace(/語意連接詞/g, 'Liên từ theo ngữ nghĩa');
  s = s.replace(/詞性判斷/g, 'Xác định biến thể từ loại');
  s = s.replace(/公告與信件/g, 'Thông báo & Thư từ');

  // Strip any remaining Chinese characters
  s = s.replace(/[\u4e00-\u9fa5]/g, '').trim();

  return s || 'TOEIC Practice';
}
