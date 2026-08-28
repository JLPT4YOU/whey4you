import { NextRequest, NextResponse } from 'next/server';
import { Mistral } from '@mistralai/mistralai';
import { getProducts } from '@/lib/services/product-service';
import { Product } from '@/types/product';

interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content?: string;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { messages }: { messages: ChatMessage[] } = body;

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Thiếu dữ liệu tin nhắn' },
        { status: 400 }
      );
    }

    // 1. Lấy danh mục sản phẩm từ Database/Catalog của Whey4You
    const products = await getProducts();
    const productCatalogContext = products
      .map(
        (p) =>
          `- [Tên: ${p.name}] | Slug: ${p.slug} | Giá: ${p.price.toLocaleString('vi-VN')}đ | Danh mục: ${p.categoryName} | Điểm nổi bật: ${p.tagline} | Thành phần: ${p.macros.map((m) => `${m.label}: ${m.value}`).join(', ')}`
      )
      .join('\n');

    const systemPrompt = `Bạn là "AI Coach & Chuyên Gia Dinh Dưỡng Thể Hình Cao Cấp" độc quyền của hệ thống Whey4You (W4U).

🎯 VAI TRÒ & PHONG CÁCH:
- Bạn là một Huấn luyện viên chuyên nghiệp, am hiểu sâu rộng về gym, bài tập tăng cơ/giảm mỡ, tính toán Macro/Calo và tất cả các dòng Supplement (Whey, Creatine, Pre-workout, EAA, Omega-3...).
- Luôn thân thiện, truyền cảm hứng tích cực (kèm emoji 💪⚡️🔥).
- Tuyệt đối KHÔNG BAO GIỜ từ chối hay nói "Tôi không có thông tin". Luôn dùng chuyên môn để tư vấn hữu ích cho khách.

💡 NGUYÊN TẮC TRÌNH BÀY (ĐẶC THÙ KHUNG CHAT BONG BÓNG):
1. CÔ ĐỌNG, DỄ ĐỌC & TRỰC QUAN (150 - 300 TỪ):
   - Trả lời thẳng vào trọng tâm bằng các gạch đầu dòng hoặc bảng Markdown rõ ràng, dứt khoát.
   - Khi tư vấn lịch uống supplement trong ngày, thực đơn các bữa, so sánh sản phẩm hoặc lịch tập, NÊN sử dụng bảng Markdown ngắn gọn (2-4 cột) để người dùng dễ tra cứu nhanh.
   - Tuyệt đối KHÔNG viết bài luận dài dòng hàng nghìn chữ.
   - Tập trung vào các hành động thực tế quan trọng nhất (Calo cần ăn, bài tập then chốt, liều lượng & thời điểm dùng).
2. HOÀN TẤT 100%: Luôn hoàn thành trọn vẹn toàn bộ câu chữ, đóng đầy đủ các hàng trong bảng Markdown, không bao giờ bỏ dở giữa chừng.
3. GỢI Ý SẢN PHẨM: Đặt mã sản phẩm ở CUỐI CÙNG tin nhắn theo cú pháp: [SUGGEST_PRODUCT: slug-san-pham].

📦 DANH MỤC SẢN PHẨM CÓ SẴN TẠI WHEY4YOU:
${productCatalogContext}`;

    const apiKey = process.env.MISTRAL_API_KEY;

    // Fallback nếu không có API Key
    if (!apiKey) {
      const fallback = generateSmartFallback(messages, products);
      return createFallbackStream(fallback.text, fallback.suggestedProducts);
    }

    const mistral = new Mistral({ apiKey });

    const mistralMessages = [
      { role: 'system' as const, content: systemPrompt },
      ...messages.slice(-6).map((m) => ({
        role: (m.role === 'assistant' ? 'assistant' : 'user') as 'user' | 'assistant',
        content: m.content || '',
      })),
    ];

    try {
      // Stream trực tiếp câu trả lời đầy đủ, không lo bị cắt cụt token
      const stream = await mistral.chat.stream({
        model: 'mistral-small-latest',
        messages: mistralMessages,
        temperature: 0.35,
        maxTokens: 1200,
      });

      const encoder = new TextEncoder();
      let fullAccumulatedText = '';

      const readableStream = new ReadableStream({
        async start(controller) {
          try {
            for await (const chunk of stream) {
              const delta = chunk.data.choices[0]?.delta?.content || '';
              if (delta) {
                fullAccumulatedText += delta;
                controller.enqueue(
                  encoder.encode(`data: ${JSON.stringify({ type: 'chunk', content: delta })}\n\n`)
                );
              }
            }

            // Trích xuất danh sách sản phẩm gợi ý chuẩn xác từ Catalog
            const { cleanText, suggestedSlugs } = extractSuggestedProducts(fullAccumulatedText);
            const suggestedProducts: Product[] = [];
            for (const slug of suggestedSlugs) {
              const found = products.find((p) => p.slug === slug);
              if (found && !suggestedProducts.some((p) => p.id === found.id)) {
                suggestedProducts.push(found);
              }
              if (suggestedProducts.length >= 3) break;
            }

            controller.enqueue(
              encoder.encode(
                `data: ${JSON.stringify({
                  type: 'done',
                  cleanText,
                  suggestedProducts,
                  suggestedProduct: suggestedProducts[0],
                })}\n\n`
              )
            );
            controller.close();
          } catch (err) {
            controller.error(err);
          }
        },
      });

      return new Response(readableStream, {
        headers: {
          'Content-Type': 'text/event-stream; charset=utf-8',
          'Cache-Control': 'no-cache, no-transform',
          Connection: 'keep-alive',
        },
      });
    } catch (mistralErr) {
      console.warn('Lỗi xử lý Mistral, kích hoạt fallback:', mistralErr);
      const fallback = generateSmartFallback(messages, products);
      return createFallbackStream(fallback.text, fallback.suggestedProducts);
    }
  } catch (error: unknown) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Lỗi xử lý yêu cầu AI Chat',
      },
      { status: 500 }
    );
  }
}

/**
 * Tạo Server-Sent Event stream cho Fallback
 */
function createFallbackStream(text: string, suggestedProducts?: Product[]) {
  const encoder = new TextEncoder();
  const readableStream = new ReadableStream({
    async start(controller) {
      const words = text.split(' ');
      for (let i = 0; i < words.length; i++) {
        const word = words[i] + (i < words.length - 1 ? ' ' : '');
        controller.enqueue(
          encoder.encode(`data: ${JSON.stringify({ type: 'chunk', content: word })}\n\n`)
        );
        await new Promise((r) => setTimeout(r, 20));
      }
      controller.enqueue(
        encoder.encode(
          `data: ${JSON.stringify({
            type: 'done',
            cleanText: text,
            suggestedProducts: suggestedProducts || [],
            suggestedProduct: suggestedProducts?.[0],
          })}\n\n`
        )
      );
      controller.close();
    },
  });

  return new Response(readableStream, {
    headers: {
      'Content-Type': 'text/event-stream; charset=utf-8',
      'Cache-Control': 'no-cache, no-transform',
      Connection: 'keep-alive',
    },
  });
}

/**
 * Trích xuất mã sản phẩm từ định dạng [SUGGEST_PRODUCT: slug]
 */
function extractSuggestedProducts(text: string): {
  cleanText: string;
  suggestedSlugs: string[];
} {
  const productRegex = /\[\s*SUGGEST_PRODUCT:\s*([a-zA-Z0-9-]+)\s*\]/gi;
  const suggestedSlugs: string[] = [];
  let match;

  while ((match = productRegex.exec(text)) !== null) {
    if (match[1]) {
      suggestedSlugs.push(match[1].trim());
    }
  }

  // Loại bỏ hoàn toàn mọi tag [SUGGEST_PRODUCT: ...], [SUGGEST...] và các tiêu đề treo ở cuối câu
  let cleanText = text
    .replace(/\[\s*SUGGEST_PRODUCT:[^\]]*\]/gi, '')
    .replace(/\[\s*SUGGEST[^\]]*\]/gi, '')
    .replace(/\bSUGGEST_PRODUCT:[^\s\]]+/gi, '')
    .replace(/(\*\*|__)?(Combo|Sản phẩm đề xuất|Sản phẩm gợi ý|Gợi ý sản phẩm|Combo gợi ý|Gợi ý|Sản phẩm)(\*\*|__)?\s*:?\s*$/gim, '')
    .replace(/[\+\,\s\:\-\*]+$/, '')
    .trim();

  cleanText = cleanText
    .replace(/(\*\*|__)?(Combo|Sản phẩm đề xuất|Sản phẩm gợi ý|Gợi ý sản phẩm|Combo gợi ý|Gợi ý|Sản phẩm)(\*\*|__)?\s*:?\s*$/gim, '')
    .replace(/[\+\,\s\:\-\*]+$/, '')
    .trim();

  return { cleanText, suggestedSlugs };
}

/**
 * Smart Fallback Engine
 */
function generateSmartFallback(
  messages: ChatMessage[],
  products: Product[]
): { text: string; suggestedProducts?: Product[] } {
  const lastUserMsg = messages
    .slice()
    .reverse()
    .find((m) => m.role === 'user')?.content || '';
  const lower = lastUserMsg.toLowerCase();

  let replyText = '';
  const suggestedList: Product[] = [];

  if (
    lower.includes('bảng') ||
    lower.includes('lịch') ||
    lower.includes('thời gian') ||
    lower.includes('kế hoạch') ||
    lower.includes('thực đơn')
  ) {
    const whey = products.find((p) => p.category === 'whey-protein') || products[0];
    const creatine = products.find((p) => p.slug.includes('creapure')) || products[1];
    const pre = products.find((p) => p.slug.includes('pre') || p.slug.includes('nitro')) || products[2];
    if (whey) suggestedList.push(whey);
    if (creatine) suggestedList.push(creatine);
    if (pre) suggestedList.push(pre);

    replyText = `Dưới đây là **Lịch Bổ Sung Thực Phẩm Thể Hình Chuẩn HLV** trong ngày dành cho bạn:

| Thời Điểm | Sản Phẩm Đề Xuất | Liều Dùng & Tác Dụng |
| :--- | :--- | :--- |
| **Sáng ngủ dậy** | Nước ấm + Creatine | 5g Creatine nạp năng lượng cơ bắp |
| **Trước tập 25p** | Pre-Workout | 1 muỗng bùng nổ tỉnh táo & tăng pump |
| **Sau tập 30p** | Whey Isolate / Hydro | 1 muỗng bổ sung protein phục hồi siêu tốc |
| **Bữa tối** | Omega-3 + Multi-Vitamin | 1-2 viên chống mỏi khớp & bảo vệ tim mạch |

> 💡 **Mẹo HLV W4U**: Bạn nhớ uống đủ 2.5 - 3.5L nước mỗi ngày để Creatine và Protein phát huy hiệu quả tăng cơ tối đa! 💪`;
  } else if (
    lower.includes('combo') ||
    (lower.includes('whey') && lower.includes('creatine')) ||
    lower.includes('tăng cơ nhanh')
  ) {
    const whey = products.find((p) => p.category === 'whey-protein');
    const creatine = products.find((p) => p.slug.includes('creapure'));
    if (whey) suggestedList.push(whey);
    if (creatine) suggestedList.push(creatine);
    replyText =
      'Combo tăng cơ nạc & sức mạnh tối ưu: **Whey Isolate** (1 muỗng sau tập) kết hợp **Creatine Creapure®** (5g/ngày) giúp tăng 15% sức bộc phát và phục hồi cơ tức thì! 💪';
  } else if (
    lower.includes('tăng cơ') ||
    lower.includes('whey') ||
    lower.includes('mới tập') ||
    lower.includes('protein')
  ) {
    const whey = products.find((p) => p.category === 'whey-protein') || products[0];
    suggestedList.push(whey);
    replyText =
      'Để tăng cơ nạc tối ưu, bạn nên nạp 1 muỗng **Whey Isolate** trong vòng 30 phút sau tập. Dòng Hydrolyzed hấp thu siêu tốc, không đường và không lactose!';
  } else if (
    lower.includes('pre') ||
    lower.includes('creatine') ||
    lower.includes('sức mạnh') ||
    lower.includes('khỏe')
  ) {
    const pre = products.find((p) => p.slug.includes('nitro') || p.slug.includes('pre'));
    const creatine = products.find((p) => p.slug.includes('creapure'));
    if (pre) suggestedList.push(pre);
    if (creatine) suggestedList.push(creatine);
    replyText =
      'Hãy dùng **Pre-Workout** (trước tập 20p) để tăng pump cơ và tỉnh táo, kết hợp **Creatine Monohydrate** (5g/ngày) duy trì sức bền bộc phát!';
  } else if (
    lower.includes('khớp') ||
    lower.includes('mỏi') ||
    lower.includes('tim') ||
    lower.includes('vitamin')
  ) {
    const omega = products.find((p) => p.category === 'vitamins');
    const multi = products.find((p) => p.slug.includes('multi') || p.slug.includes('athlete'));
    if (omega) suggestedList.push(omega);
    if (multi) suggestedList.push(multi);
    replyText =
      'Bổ sung **Omega-3 IFOS 5 Sao** kết hợp **Daily Athlete Multi-Vitamin** sẽ giúp giảm viêm khớp, bảo vệ tim mạch và phục hồi hệ thần kinh hiệu quả!';
  } else {
    suggestedList.push(products[0]);
    replyText =
      'Chào bạn! W4U luôn sẵn sàng hỗ trợ mục tiêu nâng tầm vóc dáng và sức mạnh. Bạn đang quan tâm đến dòng sản phẩm nào? 💪';
  }

  return {
    text: replyText,
    suggestedProducts: suggestedList,
  };
}
