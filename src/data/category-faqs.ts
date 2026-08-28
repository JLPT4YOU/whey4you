export interface FAQItem {
  question: string;
  answer: string;
}

export const CATEGORY_FAQS: Record<string, FAQItem[]> = {
  'whey-protein': [
    {
      question: 'Uống Whey Protein có bị nổi mụn hoặc nóng trong người không?',
      answer:
        'Không. Các dòng Whey Isolate và Hydrolyzed tại Whey4You đã được lọc bỏ hoàn toàn đường Lactose, chất béo và tạp chất – những nguyên nhân chính gây rối loạn tiêu hóa và mụn ở người cơ địa dị ứng sữa bò. Chỉ cần bạn uống đủ 2.5 - 3 lít nước mỗi ngày.',
    },
    {
      question: 'Thời điểm nào uống Whey Protein để tăng cơ nhanh nhất?',
      answer:
        'Thời điểm vàng số 1 là trong vòng 20 - 30 phút ngay sau khi tập luyện (Post-workout) khi cơ bắp đang cạn kiệt glycogen và cần amino acid tức thì. Thời điểm thứ 2 là buổi sáng ngay sau khi thức dậy để chặn dị hóa cơ.',
    },
    {
      question: 'Whey Isolate khác gì so với Whey Concentrate thông thường?',
      answer:
        'Whey Isolate trải qua quy trình lọc vi sinh nhiều tầng (Cross-Flow Microfiltration), đạt độ tinh khiết trên 90% protein, gần như 0% đường và chất béo. Hấp thu siêu nhanh (sau 30 phút) so với Whey Concentrate (1 - 2 tiếng) và không gây đầy bụng.',
    },
  ],
  'strength-endurance': [
    {
      question: 'Dùng Creatine Monohydrate có bị tích nước hay hại thận không?',
      answer:
        'Creatine kéo nước vào nội bào (bên trong sợi cơ), giúp tế bào cơ căng phồng và tăng tổng hợp protein, chứ không phải tích nước dưới da làm béo mặt. Hàng trăm nghiên cứu y khoa quốc tế đã chứng minh Creatine 100% an toàn cho người khỏe mạnh khi uống đủ 2.5 - 3.5L nước/ngày.',
    },
    {
      question: 'Nên uống Pre-Workout trước khi tập bao lâu?',
      answer:
        'Nên uống trước buổi tập 20 - 30 phút. Hoạt chất L-Citrulline và Beta-Alanine sẽ bắt đầu phát huy tác dụng làm giãn mạch, tăng tuần hoàn máu và tạo cảm giác châm chích nhẹ giúp bạn tập trung và sung mãn tối đa.',
    },
    {
      question: 'Có nên dùng chung Creatine với Whey Protein sau tập không?',
      answer:
        'Rất nên! Pha 5g Creatine Monohydrate trực tiếp vào cốc Whey Protein sau tập là công thức chuẩn vàng của các vận động viên thể hình chuyên nghiệp giúp tăng tốc độ hấp thu và phục hồi thể lực tối đa.',
    },
  ],
  'vitamins': [
    {
      question: 'Tại sao người tập gym cần bổ sung Dầu cá Omega-3 chất lượng cao?',
      answer:
        'Omega-3 chứa EPA và DHA nồng độ cao giúp giảm đau nhức cơ bắp (DOMS), bôi trơn các khớp gối và vai khi gánh tạ nặng, đồng thời tăng độ nhạy insulin giúp dinh dưỡng đi thẳng vào cơ bắp thay vì tích mỡ.',
    },
    {
      question: 'Chứng nhận IFOS 5 sao trên dầu cá thể hiện điều gì?',
      answer:
        'IFOS (International Fish Oil Standards) là tiêu chuẩn kiểm nghiệm dầu cá nghiêm ngặt nhất thế giới từ Canada. Chứng nhận 5 sao bảo chứng dầu cá đạt độ tươi mới tối đa, hoàn toàn sạch kim loại nặng (thủy ngân, chì, PCB) và đúng 100% hàm lượng EPA/DHA công bố.',
    },
    {
      question: 'Nên uống Vitamin tổng hợp và Omega-3 vào thời gian nào trong ngày?',
      answer:
        'Nên uống ngay sau bữa ăn chính (bữa sáng hoặc bữa trưa) vì các vitamin tan trong chất béo (A, D, E, K) và Omega-3 sẽ được hấp thu tối đa cùng chất béo trong thức ăn.',
    },
  ],
  all: [
    {
      question: 'Làm sao để kiểm tra hàng chính hãng tại Whey4You?',
      answer:
        'Mọi sản phẩm tại Whey4You đều có tem phụ tiếng Việt theo quy định của Bộ Y Tế, tem cào mã bảo mật xác thực nguồn gốc và hóa đơn VAT minh bạch. Chúng tôi cam kết đền tiền gấp đôi (200%) nếu phát hiện hàng không chuẩn.',
    },
    {
      question: 'Chính sách giao hàng của Whey4You như thế nào?',
      answer:
        'Whey4You hợp tác cùng SPX Express để giao hàng hỏa tốc và chuyển phát nhanh toàn quốc. Khách hàng được đồng kiểm bóc kiện hàng trước khi thanh toán và được miễn phí vận chuyển cho đơn từ 500.000₫.',
    },
  ],
};
