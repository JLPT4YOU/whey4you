import { NextRequest, NextResponse } from 'next/server';
import { Mistral } from '@mistralai/mistralai';
import { mcpWebSearch } from '@/lib/services/mcp-service';

export interface GenerateProductRequestBody {
  name: string;
  category_id?: string;
  goal?: string;
  enableWebSearch?: boolean;
  searchQuery?: string;
  tone?: 'expert' | 'marketing' | 'scientific';
  customInstructions?: string;
}

export async function POST(request: NextRequest) {
  try {
    const body: GenerateProductRequestBody = await request.json();
    const {
      name,
      category_id = 'whey-protein',
      goal = 'muscle-growth',
      enableWebSearch = true,
      searchQuery,
      tone = 'expert',
      customInstructions,
    } = body;

    if (!name || !name.trim()) {
      return NextResponse.json(
        { success: false, error: 'Vui lòng cung cấp tên sản phẩm' },
        { status: 400 }
      );
    }

    const categoryNames: Record<string, string> = {
      'whey-protein': 'Whey Protein',
      'strength-endurance': 'Sức Mạnh & Sức Bền',
      'vitamins': 'Vitamins & Khoáng Chất',
    };
    const categoryName = categoryNames[category_id] || 'Thực phẩm bổ sung';

    // 1. Tra cứu Internet thời gian thực qua MCP DuckDuckGo nếu bật enableWebSearch
    let webSearchContext = '';
    if (enableWebSearch) {
      try {
        const currentYear = new Date().getFullYear();
        const query =
          searchQuery?.trim() ||
          `${name} official supplement nutrition facts ingredients serving size new formula updated ${currentYear}`;
        const searchResults = await mcpWebSearch(query, 4, 4500);
        if (searchResults && searchResults.length > 0) {
          webSearchContext = searchResults
            .map((r, i) => `[Nguồn ${i + 1}: ${r.title}]\nURL: ${r.url}\nNội dung: ${r.snippet}`)
            .join('\n\n');
        }
      } catch (searchErr) {
        console.warn('Không thể thực hiện MCP web search cho sản phẩm:', searchErr);
      }
    }

    const apiKey = process.env.MISTRAL_API_KEY;

    if (!apiKey) {
      const fallbackData = generateFallbackProductContent(name, category_id, goal);
      return NextResponse.json({
        success: true,
        data: fallbackData,
        source: 'fallback-template',
      });
    }

    const mistral = new Mistral({ apiKey });

    const systemPrompt = `Bạn là "Chuyên Gia Dinh Dưỡng Thể Hình & Giám Đốc R&D Cấp Cao tại Whey4You (W4U)".
Nhiệm vụ của bạn là soạn thảo nội dung sản phẩm thể hình & dinh dưỡng ĐẦY ĐỦ, CHI TIẾT, GIÀU THÔNG TIN, BẮT MẮT và CHUẨN XÁC TUYỆT ĐỐI THEO THÔNG SỐ CỦA HÃNG để xuất bản trực tiếp lên website Whey4You.

🎯 YÊU CẦU ĐỊNH DẠNG ĐẦU RA:
Bạn PHẢI trả về ĐÚNG DUY NHẤT một JSON Object hợp lệ (không kèm theo văn bản giải thích thừa ở ngoài) với cấu trúc sau:
{
  "tagline": "Mô tả ngắn 1 câu ấn tượng, nêu bật công dụng cốt lõi và điểm độc nhất của sản phẩm (khoảng 15-25 từ)",
  "description": "Nội dung chi tiết phần [MÔ TẢ & THÀNH PHẦN]: Viết đầy đủ (khoảng 250-450 từ), chia thành các phần rõ ràng:\\n\\n**1. Tổng Quan & Xuất Xứ:** Giới thiệu thương hiệu, vị thế trên thị trường và công nghệ sản xuất tinh khiết.\\n\\n**2. Bảng Thành Phần & Tác Dụng Vượt Trội:** Phân tích chi tiết nồng độ Protein/serving, tỷ lệ BCAA, EAA, Enzyme tiêu hóa và các vi chất then chốt.\\n\\n**3. Lợi Ích Cốt Lõi Đối Với Gymer:**\\n- Tối ưu hóa quá trình tổng hợp Protein và phát triển cơ nạc\\n- Rút ngắn thời gian phục hồi cơ bắp sau buổi tập nặng\\n- Hỗ trợ kiểm soát calo, không gây tích mỡ thừa\\n\\n**4. Đối Tượng Sử Dụng Phù Hợp:** Chỉ rõ đối tượng (người tập gym, vận động viên, người ăn kiêng...)",
  "usage_guide": "Nội dung chi tiết phần [HƯỚNG DẪN SỬ DỤNG]: Trình bày theo từng mục trực quan:\\n\\n⏰ **Thời Điểm Vàng Trong Ngày:**\\n- **Buổi sáng sau khi thức dậy:** Nạp nhanh nguồn dinh dưỡng sau 8 tiếng ngủ đêm.\\n- **Ngay sau khi tập luyện (20-30 phút):** Thời điểm 'cửa sổ đồng hóa' để cơ bắp hấp thu tối đa.\\n\\n🥛 **Cách Pha Chế Chuẩn:**\\n- Pha 1 muỗng (1 serving) với 250ml - 350ml nước mát hoặc sữa tươi không đường.\\n- Cho vào bình lắc Shaker và lắc đều từ 15-20 giây cho bột tan mịn hoàn toàn.\\n\\n💡 **Lưu Ý Quan Trọng:** Không pha với nước nóng/nước sôi để tránh biến tính đạm. Bảo quản nơi khô ráo, thoáng mát, đậy kín nắp sau khi dùng.",
  "quality_commitment": "Nội dung chi tiết phần [CAM KẾT CHẤT LƯỢNG]: Trình bày 4 cam kết vàng từ W4U:\\n\\n🛡️ **100% Chính Hãng Nhập Khẩu:** Đầy đủ tem phụ tiếng Việt, tem chống hàng giả và hóa đơn chứng từ rõ ràng.\\n\\n💰 **Cam Kết Hoàn Tiền 200%:** Nếu phát hiện hàng giả, hàng nhái hoặc cận date mà không báo trước.\\n\\n📜 **Chứng Nhận Tiêu Chuẩn Quốc Tế:** Đạt chuẩn FDA, GMP, Informed-Choice hoặc Labdoor kiểm nghiệm độ an toàn.\\n\\n🤝 **Đồng Hành & Hỗ Trợ 24/7:** Đội ngũ chuyên gia dinh dưỡng Whey4You luôn sẵn sàng tư vấn thực đơn và cách dùng tối ưu.",
  "macros": [
    { "label": "Protein / Hoạt chất", "value": "25g", "badgeColor": "lime" },
    { "label": "BCAA / Phục hồi", "value": "5.5g", "badgeColor": "emerald" },
    { "label": "Calories / Khẩu phần", "value": "120 kcal", "badgeColor": "blue" },
    { "label": "Đường & Fat", "value": "0g", "badgeColor": "amber" }
  ],
  "flavors": ["Hương vị 1 (vd: Chocolate Fudge)", "Hương vị 2 (vd: Vanilla Ice Cream)", "Hương vị 3 (vd: Matcha Latte)"],
  "sizes": [
    { "name": "2.27kg (5 lbs / 75 servings)", "price": "" },
    { "name": "4.5kg (10 lbs / 150 servings)", "price": "" }
  ]
}

💡 NGUYÊN TẮC VIẾT:
1. DỮ LIỆU ĐẦY ĐỦ, PHONG PHÚ: Viết kỹ lưỡng, sâu sắc, không viết hời hợt vài dòng ngắn ngủn.
2. ĐỐI CHIẾU SỐ LIỆU INTERNET: Nếu có MCP Live Search bên dưới, hãy lấy chuẩn xác số gram protein, calo, servings, quy cách bao bì thực tế của hãng.
3. Phong cách: ${tone === 'scientific' ? 'Nghiêm túc, chuẩn xác số liệu và cơ chế sinh học' : tone === 'marketing' ? 'Cuốn hút, kích thích hành động mua hàng, làm nổi bật hiệu suất gymer' : 'Chuyên gia thể hình, thực tế, dễ hiểu, giàu độ tin cậy'}.
${webSearchContext ? `\n🌐 DỮ LIỆU THỰC TẾ TRA CỨU MỚI NHẤT TỪ INTERNET (MCP LIVE SEARCH):\n${webSearchContext}` : ''}
`;

    const userPrompt = `Hãy tạo nội dung sản phẩm đầy đủ cho: "${name}"
- Danh mục: ${categoryName} (${category_id})
- Mục tiêu thể hình: ${goal}
${customInstructions ? `- Yêu cầu bổ sung từ admin: ${customInstructions}` : ''}

Hãy trả về định dạng JSON thuần túy theo cấu trúc đã yêu cầu.`;

    try {
      const response = await mistral.chat.complete({
        model: 'mistral-small-latest',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        temperature: 0.35,
        responseFormat: { type: 'json_object' },
      });

      const responseText = response.choices?.[0]?.message?.content;
      if (!responseText) {
        throw new Error('Mistral AI không trả về nội dung');
      }

      let parsedData;
      try {
        parsedData = typeof responseText === 'string' ? JSON.parse(responseText) : responseText;
      } catch {
        const cleaned = responseText
          .toString()
          .replace(/^```json\s*/i, '')
          .replace(/^```\s*/i, '')
          .replace(/\s*```$/i, '')
          .trim();
        parsedData = JSON.parse(cleaned);
      }

      return NextResponse.json({
        success: true,
        data: {
          tagline: parsedData.tagline || `${name} - Dinh dưỡng thể hình chuẩn quốc tế`,
          description: parsedData.description || '',
          usage_guide: parsedData.usage_guide || '',
          quality_commitment: parsedData.quality_commitment || '',
          macros: Array.isArray(parsedData.macros) ? parsedData.macros : [],
          flavors: Array.isArray(parsedData.flavors) ? parsedData.flavors : [],
          sizes: Array.isArray(parsedData.sizes) ? parsedData.sizes : [],
        },
        source: 'mistral-ai',
      });
    } catch (mistralErr) {
      console.warn('Lỗi gọi Mistral AI cho sản phẩm, chuyển sang Fallback Engine:', mistralErr);
      const fallbackData = generateFallbackProductContent(name, category_id, goal);
      return NextResponse.json({
        success: true,
        data: fallbackData,
        source: 'fallback-template',
      });
    }
  } catch (error: unknown) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Lỗi hệ thống khi sinh nội dung sản phẩm AI',
      },
      { status: 500 }
    );
  }
}

/**
 * Smart Fallback Product Content Generator
 */
function generateFallbackProductContent(name: string, category_id: string, _goal: string) {
  const isWhey = category_id === 'whey-protein' || name.toLowerCase().includes('whey') || name.toLowerCase().includes('isolate');
  const isStrength = category_id === 'strength-endurance' || name.toLowerCase().includes('creatine') || name.toLowerCase().includes('pre-workout') || name.toLowerCase().includes('eaa');

  if (isWhey) {
    return {
      tagline: '100% Protein siêu tinh khiết hấp thu nhanh, hỗ trợ phát triển cơ bắp nạc vượt trội',
      description: `${name} là dòng thực phẩm bổ sung đạm tinh khiết hàng đầu, được sản xuất qua quy trình lọc tân tiến Micro-filtration giúp tách bỏ tối đa chất béo, tạp chất và đường lactose.\n\nĐiểm nổi bật vượt trội:\n• Nguồn đạm sinh học giá trị cao hấp thu siêu tốc vào tế bào cơ bắp.\n• Giàu chuỗi Axit Amin thiết yếu (EAA & BCAA) chống dị hóa và kích thích tổng hợp protein (mTOR).\n• Hương vị thơm ngon tự nhiên, hòa tan mịn màng chỉ sau vài giây lắc.`,
      usage_guide: `• Thời điểm lý tưởng:\n- Ngay sau buổi tập (trong vòng 30 phút): Đây là "thời điểm vàng" để bù đắp protein phục hồi sợi cơ bị tổn thương.\n- Buổi sáng ngay sau khi thức dậy: Cung cấp năng lượng tức thì sau 7-8 tiếng ngủ không nạp dưỡng chất.\n\n• Cách pha chuẩn:\n- Pha 1 muỗng gạt ngang cùng 250ml - 350ml nước mát hoặc sữa tươi không đường trong bình Shaker.\n- Lắc đều trong 15-20 giây và thưởng thức ngay.`,
      quality_commitment: `• 100% Sản phẩm nhập khẩu chính ngạch với đầy đủ hóa đơn chứng từ và tem phụ tiếng Việt theo quy định.\n• Đạt chuẩn kiểm định an toàn thực phẩm quốc tế (GMP, FDA, Informed-Choice Tested).\n• Cam kết hoàn tiền 200% nếu phát hiện hàng giả, hàng nhái hoặc không rõ nguồn gốc xuất xứ tại Whey4You.`,
      macros: [
        { label: 'Protein', value: '27g', badgeColor: 'lime' },
        { label: 'BCAA', value: '6.5g', badgeColor: 'emerald' },
        { label: 'Calories', value: '115 kcal', badgeColor: 'blue' },
        { label: 'Sugar', value: '0g', badgeColor: 'amber' },
      ],
      flavors: ['Chocolate Fudge', 'Vanilla Ice Cream', 'Matcha Latte', 'Strawberry Milkshake'],
      sizes: [
        { name: '2.27kg (5 lbs / 75 servings)', price: '' },
        { name: '4.5kg (10 lbs / 150 servings)', price: '' },
      ],
    };
  }

  if (isStrength) {
    return {
      tagline: 'Bùng nổ sức mạnh, tăng cường sức bền và tối ưu hiệu suất tập luyện cường độ cao',
      description: `${name} cung cấp nguồn năng lượng cơ học trực tiếp cho các bó cơ thông qua chu trình tái tạo ATP nhanh chóng, hỗ trợ Gymer nâng tạ nặng hơn và kéo dài số rep trong mỗi hiệp tập.\n\nĐiểm nổi bật vượt trội:\n• Độ tinh khiết siêu mịn Micronized hấp thu trọn vẹn không gây đầy bụng.\n• Tăng khối lượng cơ bắp và sức mạnh bột phát trong các bài tập đa khớp (Squat, Bench, Deadlift).\n• Thúc đẩy hydrat hóa tế bào cơ, giúp cơ bắp căng phồng và săn chắc hơn.`,
      usage_guide: `• Liều lượng & Thời điểm:\n- Sử dụng 1 khẩu phần (3g - 5g) mỗi ngày trước khi tập 30 phút hoặc ngay sau buổi tập cùng Whey/Carb.\n- Vào ngày không tập: Uống vào buổi sáng để duy trì nồng độ bão hòa trong cơ bắp.\n\n• Cách pha:\n- Hòa tan cùng 200ml - 300ml nước lọc, nước trái cây hoặc pha trực tiếp vào bình Whey Shaker.`,
      quality_commitment: `• Cam kết 100% chính hãng từ các thương hiệu dinh dưỡng thể thao danh tiếng toàn cầu.\n• Quy trình kiểm định độc lập không chứa chất cấm trong thể thao (WADA Compliant).\n• Đổi trả miễn phí trong vòng 7 ngày nếu sản phẩm có lỗi bao bì hoặc đóng gói từ nhà sản xuất.`,
      macros: [
        { label: 'Creatine Pure', value: '5000mg', badgeColor: 'lime' },
        { label: 'Serving', value: '60 lần', badgeColor: 'emerald' },
        { label: 'Calories', value: '0 kcal', badgeColor: 'blue' },
        { label: 'Sugar', value: '0g', badgeColor: 'amber' },
      ],
      flavors: ['Không Mùi (Unflavored)', 'Blue Raspberry', 'Fruit Punch', 'Cam Chanh'],
      sizes: [
        { name: '300g (Hũ bột siêu mịn / 60 servings)', price: '' },
        { name: '500g (Hũ bột tiết kiệm / 100 servings)', price: '' },
      ],
    };
  }

  return {
    tagline: 'Bổ sung vi chất thiết yếu, tăng cường đề kháng và bảo vệ sức khỏe toàn diện',
    description: `${name} được đặc chế với công thức tối ưu sinh khả dụng, bổ sung đầy đủ các vitamin và khoáng chất thiết yếu mà chế độ ăn hàng ngày thường thiếu hụt, giúp duy trì thể lực dẻo dai và tinh thần tỉnh táo.\n\nĐiểm nổi bật vượt trội:\n• Cân bằng chuyển hóa năng lượng và hỗ trợ hệ miễn dịch tự nhiên.\n• Chống oxy hóa mạnh mẽ, bảo vệ tế bào trước căng thẳng tập luyện.\n• Viên nang dễ hấp thu, không gây khó chịu cho dạ dày.`,
    usage_guide: `• Hướng dẫn sử dụng:\n- Uống 1-2 viên mỗi ngày cùng bữa ăn chính (bữa sáng hoặc bữa trưa) để cơ thể hấp thu tốt nhất các vitamin tan trong dầu (A, D, E, K).\n- Uống kèm nhiều nước trong ngày (tối thiểu 2 - 2.5 lít nước).`,
    quality_commitment: `• Hàng nhập khẩu chính ngạch 100%, bảo quản ở nhiệt độ tiêu chuẩn để đảm bảo hoạt tính vi chất.\n• Đạt chứng nhận GMP và an toàn vệ sinh thực phẩm của Bộ Y Tế.\n• Chính sách bảo hành chất lượng 1 đổi 1 trong 7 ngày nếu phát hiện bất kỳ dấu hiệu hư hỏng.`,
    macros: [
      { label: 'Vi chất', value: '20+ loại', badgeColor: 'lime' },
      { label: 'Hấp thu', value: 'Cao cấp', badgeColor: 'emerald' },
      { label: 'Quy cách', value: '120 viên', badgeColor: 'blue' },
      { label: 'Độ tinh khiết', value: '100%', badgeColor: 'amber' },
    ],
    flavors: ['Dạng Viên Nang (Capsules)', 'Dạng Viên Mềm (Softgels)'],
    sizes: [
      { name: '60 Viên (Dùng 1-2 tháng)', price: '' },
      { name: '120 Viên (Dùng 2-4 tháng)', price: '' },
    ],
  };
}
