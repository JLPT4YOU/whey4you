import { NextRequest, NextResponse } from 'next/server';
import { Mistral } from '@mistralai/mistralai';
import { mcpDeepResearch, mcpWebSearch } from '@/lib/services/mcp-service';
import { getProducts } from '@/lib/services/product-service';
import { ARTICLE_CATEGORIES, ArticleCategory } from '@/types/article';
import { slugify } from '@/lib/utils/slug';

export type ArticleFramework = 'evidence-based' | 'how-to-guide' | 'comparison' | 'myth-buster';

export interface GenerateArticleRequestBody {
  topic: string;
  category?: ArticleCategory;
  targetAudience?: string;
  tone?: 'expert' | 'friendly' | 'inspirational' | 'scientific';
  framework?: ArticleFramework;
  searchDepth?: 'quick' | 'deep';
  enableWebSearch?: boolean;
  selectedProductSlug?: string;
  customInstructions?: string;
}

// Curated Fitness & Nutrition Unsplash Cover Images by Category
const CATEGORY_COVER_IMAGES: Record<string, string[]> = {
  'tang-co': [
    'https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=1200&q=80',
  ],
  'giam-mo': [
    'https://images.unsplash.com/photo-1490645935967-10de6ba17061?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=1200&q=80',
  ],
  supplement: [
    'https://images.unsplash.com/photo-1579722821273-0f6c7d44362f?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1593095948071-474c5cc2989d?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&w=1200&q=80',
  ],
  'dinh-duong-chung': [
    'https://images.unsplash.com/photo-1498837167922-ddd27525d352?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1467003909585-2f8a72700288?auto=format&fit=crop&w=1200&q=80',
  ],
  'phuc-hoi': [
    'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&w=1200&q=80',
  ],
};

export async function POST(request: NextRequest) {
  try {
    const body: GenerateArticleRequestBody = await request.json();
    const {
      topic,
      category = 'tang-co',
      targetAudience = 'Người tập gym, thể thao, người quan tâm đến hình thể & sức khỏe',
      tone = 'expert',
      framework = 'evidence-based',
      searchDepth = 'deep',
      enableWebSearch = true,
      selectedProductSlug,
      customInstructions,
    } = body;

    if (!topic || !topic.trim()) {
      return NextResponse.json(
        { success: false, error: 'Vui lòng cung cấp chủ đề bài viết' },
        { status: 400 }
      );
    }

    // 1. Lấy danh mục sản phẩm Whey4You để AI đối chiếu và lồng ghép chính xác
    const products = await getProducts();
    const productCatalogContext = products
      .map(
        (p) =>
          `- [Tên: ${p.name}] | Slug: ${p.slug} | Giá: ${p.price.toLocaleString('vi-VN')}đ | Danh mục: ${p.categoryName} | Điểm nổi bật: ${p.tagline} | Thành phần chính: ${p.macros.map((m) => `${m.label}: ${m.value}`).join(', ')}`
      )
      .join('\n');

    // 2. Nghiên cứu & Cào dữ liệu chuyên sâu từ Internet qua MCP
    let internetResearchContext = '';
    let researchSourcesCount = 0;

    if (enableWebSearch) {
      try {
        if (searchDepth === 'deep') {
          // Deep Research Pipeline: Multi-query + Domain filtering + Deep Scraping
          const researchResult = await mcpDeepResearch(topic, {
            maxSearchSources: 4,
            maxScrapeSources: 2,
            searchTimeoutMs: 3800,
            scrapeTimeoutMs: 4500,
          });
          internetResearchContext = researchResult.formattedContext;
          researchSourcesCount = researchResult.totalSources;
        } else {
          // Quick Search Pipeline
          const currentYear = new Date().getFullYear();
          const query = `${topic} nghiên cứu dinh dưỡng gym thể hình ${currentYear}`;
          const quickResults = await mcpWebSearch(query, 3, 3500);
          if (quickResults && quickResults.length > 0) {
            internetResearchContext = quickResults
              .map((r, i) => `[Nguồn ${i + 1}: ${r.title}]\nURL: ${r.url}\nTóm tắt: ${r.snippet}`)
              .join('\n\n');
            researchSourcesCount = quickResults.length;
          }
        }
      } catch (searchErr) {
        console.warn('Lỗi khi thực hiện MCP Research:', searchErr);
      }
    }

    const categoryObj = ARTICLE_CATEGORIES.find((c) => c.id === category) || ARTICLE_CATEGORIES[0];
    const apiKey = process.env.MISTRAL_API_KEY;

    // Ảnh đại diện mặc định theo chuyên mục
    const categoryImages = CATEGORY_COVER_IMAGES[category] || CATEGORY_COVER_IMAGES['tang-co'];
    const defaultCover = categoryImages[Math.floor(Math.random() * categoryImages.length)];

    if (!apiKey) {
      const fallbackArticle = generateAdvancedFallbackArticle(
        topic,
        category,
        categoryObj.name,
        framework,
        selectedProductSlug,
        products,
        defaultCover
      );
      return NextResponse.json({
        success: true,
        data: fallbackArticle,
        source: 'fallback-engine',
        researchSourcesCount,
      });
    }

    const mistral = new Mistral({ apiKey });

    // Hướng dẫn chi tiết theo từng Framework viết bài
    const frameworkGuide = getFrameworkGuide(framework);

    const systemPrompt = `Bạn là "Chuyên Gia Trưởng Nghiên Cứu Dinh Dưỡng Thể Hình Whey4You & Master Fitness Copywriter".
Nhiệm vụ của bạn là viết một bài blog ĐỘC QUYỀN, ĐỈNH CAO, CHUẨN KHOA HỌC (Evidence-Based), CỰC KỲ HẤP DẪN VÀ THỰC CHIẾN CHO GYMER VIỆT NAM.

🎯 TIÊU CHUẨN ĐỊNH DẠNG ĐẦU RA (BẮT BUỘC):
Trả về DUY NHẤT một JSON Object hợp lệ (không kèm theo văn bản giải thích thừa bên ngoài):
{
  "title": "Tiêu đề cuốn hút, chuẩn SEO, chứa từ khóa chính và con số/lợi ích rõ ràng (VD: Uống Whey Khi Nào Tốt Nhất? 4 Thời Điểm Vàng Tăng Cơ Nhanh Hơn 35%)",
  "slug": "slug-tieng-viet-khong-dau-ngan-gon-chuan-seo",
  "excerpt": "Đoạn tóm tắt mở đầu 2-3 câu (khoảng 140-180 ký tự) nêu bật nỗi đau thực tế của gymer và giải pháp bài viết mang lại.",
  "readingTime": 6,
  "tags": ["Từ Khóa 1", "Từ Khóa 2", "Từ Khóa 3", "Whey4You", "Dinh Dưỡng Thể Hình"],
  "suggestedProductSlugs": ["slug-san-pham-1", "slug-san-pham-2"],
  "content": "Toàn bộ bài viết hoàn chỉnh định dạng Markdown chuẩn đẹp"
}

🔥 QUY TẮC BỐ CỤC BÀI VIẾT (BẮT BUỘC THEO CẤU TRÚC 7 PHẦN):
1. **Hook Mở Đầu & Đặt Vấn Đề**: Đánh trúng tâm lý, sự băn khoăn hoặc sai lầm thường gặp của gymer (ví dụ: tập mãi không to, uống whey bị nổi mụn/tiêu chảy, sợ tích mỡ...).
2. **Box Tóm Tắt Nhanh (Key Takeaways)**: Ngay sau phần mở đầu, đặt blockquote tóm tắt:
   > 📌 **Tóm Tắt Nhanh Cho Gymer Bận Rộn:**
   > - Ý chính 1 (liều lượng/thời điểm then chốt)...
   > - Ý chính 2 (cơ chế khoa học ngắn gọn)...
   > - Ý chính 3 (sản phẩm/thực phẩm hỗ trợ tối ưu)...
3. **Cơ Chế Khoa Học & Dữ Liệu Nghiên Cứu (Deep Science)**:
   - Phân tích cơ chế sinh học một cách dễ hiểu: Tổng hợp Protein cơ bắp (MPS), ngưỡng Leucine (2.7g - 3.5g), phục hồi Glycogen, độ nhạy Insulin.
   - Trích dẫn dữ liệu, nghiên cứu thực tế từ Internet Research (ISSN, PubMed, Examine):
     > 🔬 **Bằng Chứng Khoa Học:** Theo nghiên cứu của [Tên tác giả/Tổ chức], việc bổ sung... giúp cải thiện...
4. **Bảng Đối Chiếu So Sánh Markdown Trực Quan**:
   - Bắt buộc có ít nhất 1 bảng Markdown so sánh rõ ràng các tiêu chí (Ví dụ: So sánh các loại Whey, hoặc So sánh thời điểm dùng, hoặc So sánh Macro).
5. **Lật Tẩy Sai Lầm / Lầm Tưởng Phổ Biến (Myth vs Fact)**:
   - Vạch trần 1-2 quan niệm "Bro-science" sai lệch và đưa ra giải pháp chuẩn xác.
6. **Phác Đồ Hành Động Thực Chiến (Step-by-Step Protocol)**:
   - Chia lịch trình cụ thể trong ngày: Sáng thức dậy, 1.5 - 2h trước tập, Ngay sau tập, Bữa tối.
   - Liều lượng gram tính chuẩn theo thể trọng (g/kg).
7. **Lồng Ghép Giải Pháp Từ Whey4You Tự Nhiên & FAQ Chuẩn SEO**:
   - Khéo léo phân tích vì sao sản phẩm từ danh mục Whey4You (nhắc đúng tên và thành phần ưu việt) là lựa chọn tối ưu để thực hiện phác đồ trên.
   - 3 câu Hỏi & Đáp nhanh (FAQ) giải đáp thắc mắc cặn kẽ.
   - Lời khuyên động viên kết bài từ W4U Coach.

🎨 ĐẶC TẢ PHONG CÁCH & FRAMEWORK:
- Phong cách: ${tone === 'scientific' ? 'Chuẩn mực y khoa, số liệu thực chứng, ngôn từ chính xác' : tone === 'inspirational' ? 'Hừng hực năng lượng Gymer, thúc đẩy hành động bứt phá' : 'Chuyên sâu, gần gũi, thực tế, dễ áp dụng ngay'}.
- Định hướng Framework: ${frameworkGuide}

📦 DANH MỤC SẢN PHẨM SẴN CÓ TẠI WHEY4YOU:
${productCatalogContext}

${internetResearchContext ? `🌐 DỮ LIỆU NGHIÊN CỨU & BẰNG CHỨNG INTERNET THỜI GIAN THỰC (MCP DEEP RESEARCH):\n${internetResearchContext}` : ''}
`;

    const userPrompt = `Hãy sáng tạo một bài blog xuất sắc về chủ đề: "${topic}"
- Chuyên mục: ${categoryObj.name} (${category})
- Đối tượng độc giả mục tiêu: ${targetAudience}
- Định dạng Framework: ${framework}
${selectedProductSlug ? `- Ưu tiên phân tích và lồng ghép sản phẩm chính có slug: "${selectedProductSlug}"` : ''}
${customInstructions ? `- Yêu cầu bổ sung từ biên tập viên: ${customInstructions}` : ''}

Hãy trả về đúng định dạng JSON thuần túy theo yêu cầu.`;

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
        throw new Error('Mistral AI không trả về phản hồi');
      }

      // Xử lý chuỗi JSON
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

      const validSlug = slugify(parsedData.slug || parsedData.title || topic);

      return NextResponse.json({
        success: true,
        data: {
          title: parsedData.title || topic,
          slug: validSlug,
          excerpt: parsedData.excerpt || '',
          content: parsedData.content || '',
          category,
          categoryName: categoryObj.name,
          coverImage: defaultCover,
          readingTime: Number(parsedData.readingTime) || 6,
          tags: Array.isArray(parsedData.tags)
            ? parsedData.tags
            : [categoryObj.name, 'Whey4You', 'Dinh Dưỡng Thể Hình', 'Kiến Thức Gym'],
          suggestedProductSlugs: Array.isArray(parsedData.suggestedProductSlugs)
            ? parsedData.suggestedProductSlugs
            : selectedProductSlug
            ? [selectedProductSlug]
            : [products[0]?.slug].filter(Boolean),
        },
        source: 'mistral-ai-deep-engine',
        researchSourcesCount,
      });
    } catch (mistralErr) {
      console.warn('Lỗi gọi Mistral AI, chuyển sang Fallback Engine:', mistralErr);
      const fallbackArticle = generateAdvancedFallbackArticle(
        topic,
        category,
        categoryObj.name,
        framework,
        selectedProductSlug,
        products,
        defaultCover
      );
      return NextResponse.json({
        success: true,
        data: fallbackArticle,
        source: 'fallback-engine',
        researchSourcesCount,
      });
    }
  } catch (error: unknown) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Lỗi hệ thống khi sinh bài viết AI',
      },
      { status: 500 }
    );
  }
}

function getFrameworkGuide(framework: ArticleFramework): string {
  switch (framework) {
    case 'evidence-based':
      return 'Tập trung sâu vào các bằng chứng y khoa, tỷ lệ % hấp thu, nghiên cứu lâm sàng, cơ chế tổng hợp đạm MPS và giải thích căn nguyên khoa học.';
    case 'how-to-guide':
      return 'Tập trung vào hướng dẫn thực hành A-Z, bảng biểu thực đơn, công thức pha chế, lộ trình áp dụng theo từng tuần và phác đồ tập luyện.';
    case 'comparison':
      return 'Tập trung vào bảng đối đầu so sánh trực diện (Ưu điểm, Nhược điểm, Giá trị kinh tế, Ai nên dùng gì), giúp người đọc đưa ra quyết định mua sắm sáng suốt.';
    case 'myth-buster':
      return 'Tập trung vào việc lật tẩy 3-4 lầm tưởng kinh điển trong giới gym (Bro-science), chỉ rõ tác hại của việc hiểu sai và cung cấp giải pháp khoa học thay thế.';
    default:
      return 'Kết hợp hài hòa giữa cơ chế khoa học, bảng đối chiếu và phác đồ thực hành chi tiết.';
  }
}

/**
 * Smart Fallback Article Generator với cấu trúc bài viết cao cấp
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function generateAdvancedFallbackArticle(
  topic: string,
  category: ArticleCategory,
  categoryName: string,
  framework: ArticleFramework,
  selectedProductSlug?: string,
  products: any[] = [],
  coverImage?: string
) {
  const chosenProduct =
    products.find((p) => p.slug === selectedProductSlug) ||
    products.find((p) => p.category === category) ||
    products[0];

  const slug = slugify(topic);

  return {
    title: `Cẩm Nang Dinh Dưỡng Khoa Học: ${topic}`,
    slug: `${slug}-${Date.now().toString().slice(-4)}`,
    excerpt: `Hướng dẫn chuyên sâu từ W4U Coach về "${topic}". Phân tích cơ chế sinh học, bằng chứng nghiên cứu mới nhất và phác đồ áp dụng thực tế để bứt phá hiệu suất.`,
    category,
    categoryName,
    coverImage: coverImage || 'https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?auto=format&fit=crop&w=1200&q=80',
    readingTime: 6,
    tags: [categoryName, 'Whey4You', 'Dinh Dưỡng Thể Hình', 'Khoa Học Gym', 'Tối Ưu Hiệu Suất'],
    suggestedProductSlugs: chosenProduct ? [chosenProduct.slug] : ['whey-isolate-hydrolyzed-pure'],
    content: `
## 1. Đặt Vấn Đề: Tại Sao "${topic}" Lại Quyết Định Kết Quả Tập Luyện?

Trong thể hình và thể thao hiệu suất cao, quá trình tập luyện chỉ chiếm 30% vai trò kích thích, trong khi **70% thành quả tăng cơ, siết mỡ và phục hồi** phụ thuộc hoàn toàn vào chiến lược dinh dưỡng chuẩn xác. Rất nhiều gymer dành hàng giờ mỗi ngày tại phòng tạ nhưng vẫn không đạt được vóc dáng mong muốn chỉ vì thiếu hiểu biết về **${topic}**.

> 📌 **Tóm Tắt Nhanh Cho Gymer Bận Rộn:**
> - **Nguyên tắc then chốt:** Cung cấp đủ nguyên liệu Axit Amin và năng lượng đúng thời điểm để kích hoạt tối đa quá trình Tổng hợp Protein Cơ bắp (MPS).
> - **Liều lượng khuyến nghị:** Nạp 1.8g - 2.2g Protein/kg thể trọng mỗi ngày, chia đều vào 4-5 bữa cách nhau 3-4 tiếng.
> - **Giải pháp tối ưu:** Kết hợp bữa ăn tự nhiên cùng dòng thực phẩm bổ sung tinh khiết đã qua kiểm định như **${chosenProduct ? chosenProduct.name : 'Whey Protein Isolate'}**.

---

## 2. Cơ Chế Sinh Học & Bằng Chứng Nghiên Cứu Mới Nhất

Để cơ bắp phát triển liên tục mà không bị dị hóa (Muscle Breakdown), cơ thể cần đạt được **Ngưỡng Leucine (Leucine Threshold)** tối thiểu từ 2.7g đến 3.5g trong mỗi bữa ăn. Đây là công tắc sinh học kích hoạt thụ thể **mTORC1** – con đường then chốt điều phối sự phì đại sợi cơ (Hypertrophy).

> 🔬 **Bằng Chứng Khoa Học:** Theo các nghiên cứu từ *Hiệp hội Dinh dưỡng Thể thao Quốc tế (ISSN)*, việc bổ sung nguồn Protein hấp thu nhanh giàu EAA/BCAA ngay sau khi tập luyện giúp tăng tốc độ tổng hợp protein lên tới **38%** so với việc chỉ ăn bữa ăn thông thường.

### Bảng Đối Chiếu Các Phương Pháp Áp Dụng:

| Tiêu Chí Đánh Giá | Phương Pháp Truyền Thống | Phác Đồ Khoa Học Chuẩn W4U | Hiệu Quả Đạt Được |
| :--- | :--- | :--- | :--- |
| **Phân bổ Protein** | Ăn dồn vào 1-2 bữa lớn | Chia đều 4-5 cữ/ngày (25-35g/cữ) | Tối ưu hóa MPS liên tục 24h |
| **Tốc độ hấp thu** | Tiêu hóa chậm (2-4 tiếng) | Bổ sung Whey Isolate/Hydrolyzed (20-30 phút) | Cắt đứt dị hóa cơ ngay sau tập |
| **Kiểm soát Calo** | Dễ lẫn mỡ thừa & cholesterol | Nạp Macro tinh khiết, 0 đường 0 fat | Tăng cơ nạc không tích mỡ |

---

## 3. Lật Tẩy Lầm Tưởng Phổ Biến (Myth vs Fact)

- ❌ **Lầm tưởng 1:** *"Chỉ cần uống protein vào bữa ăn là đủ, thời điểm không quan trọng."*
  - ✅ **Sự thật khoa học:** Khung giờ vàng trong vòng 45-60 phút sau buổi tập là thời điểm tế bào cơ cực kỳ nhạy cảm với Insulin và Axit Amin để bù đắp Glycogen và phục hồi vi tổn thương sợi cơ.
- ❌ **Lầm tưởng 2:** *"Nạp càng nhiều protein một lúc thì cơ bắp càng phát triển nhanh."*
  - ✅ **Sự thật khoa học:** Cơ thể chỉ có thể sử dụng tối đa khoảng 30-40g protein cho quá trình MPS trong một cữ ăn. Lượng dư thừa sẽ chuyển hóa thành năng lượng hoặc đào thải qua thận.

---

## 4. Phác Đồ Hành Động 4 Bước Thực Chiến Trong Ngày

1. **Buổi sáng (Ngay sau khi thức dậy):** Uống 300ml nước ấm + 1 muỗng Whey Protein hoặc 3 quả trứng luộc để chấm dứt chu kỳ dị hóa cơ sau 8 tiếng ngủ.
2. **Trước khi tập (1.5 - 2 tiếng):** Bữa ăn nhẹ gồm Carb phức hợp (khoai lang, yến mạch) + 20g Protein để cung cấp nguồn năng lượng bền bỉ.
3. **Ngay sau khi tập (Thời điểm then chốt):** Pha 1 muỗng **${chosenProduct ? chosenProduct.name : 'Whey Isolate Hydrolyzed'}** cùng nước lạnh, uống chậm rãi để cơ thể thẩm thấu tức thì.
4. **Bữa tối & Trước khi ngủ:** Ưu tiên ức gà, cá hồi hoặc thịt bò kèm nhiều rau xanh và chất béo tốt (Omega-3, dầu ô liu).

---

## 5. Giải Pháp Đề Xuất Từ Whey4You

Để đảm bảo nguồn dinh dưỡng đạt chuẩn tinh khiết cao nhất, không chứa tạp chất gây đầy bụng hay nổi mụn, bạn có thể tham khảo dòng sản phẩm **${chosenProduct ? chosenProduct.name : 'Whey Isolate Cao Cấp'}** đang được phân phối chính hãng tại Whey4You.

---

## 6. Câu Hỏi Thường Gặp (FAQ)

### Q1: Người mới tập gym có nên áp dụng phác đồ này ngay không?
*Trả lời:* Hoàn toàn nên. Việc xây dựng nền tảng dinh dưỡng chuẩn khoa học ngay từ những tuần đầu tiên sẽ giúp bạn tránh tình trạng đau nhức cơ quá mức và đẩy nhanh tiến độ tăng cơ gấp 2 lần.

### Q2: Có thể dùng thực phẩm tự nhiên thay thế hoàn toàn được không?
*Trả lời:* Thực phẩm tự nhiên luôn là nền tảng cốt lõi. Tuy nhiên, việc kết hợp thêm sản phẩm bổ sung hấp thu nhanh sẽ mang lại sự tiện lợi vượt trội và tối ưu hóa thời điểm phục hồi sau những buổi tập cường độ cao.
    `.trim(),
  };
}

