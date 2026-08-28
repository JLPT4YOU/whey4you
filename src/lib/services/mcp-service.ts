/**
 * Service giao tiếp với MCP (Model Context Protocol) Server trên Railway
 * Cung cấp công cụ tìm kiếm DuckDuckGo và cào dữ liệu web thời gian thực
 */

export interface WebSearchResult {
  title: string;
  url: string;
  snippet: string;
}

export interface WebScrapeResult {
  title: string;
  content: string;
  word_count: number;
}

const MCP_SERVER_URL = process.env.MCP_SERVER_URL || 'https://mcpg4f-production.up.railway.app/mcp';
const MCP_API_KEY = process.env.MCP_API_KEY || 'jlpt4you_xK9mP7vQ2nT4wR8zF5sL6hJ3cN1bY9eD5';

/**
 * Tìm kiếm thông tin trên internet qua DuckDuckGo (MCP web_search)
 */
export async function mcpWebSearch(
  query: string,
  maxResults = 3,
  timeoutMs = 3500
): Promise<WebSearchResult[]> {
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);

    const response = await fetch(MCP_SERVER_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': MCP_API_KEY,
      },
      body: JSON.stringify({
        jsonrpc: '2.0',
        method: 'tools/call',
        params: {
          name: 'web_search',
          arguments: {
            query,
            max_results: maxResults,
          },
        },
        id: Date.now(),
      }),
      signal: controller.signal,
    });

    clearTimeout(timer);

    if (!response.ok) {
      console.warn(`MCP search failed with status: ${response.status}`);
      return [];
    }

    const data = await response.json();
    if (data.error) {
      console.warn('MCP search error:', data.error);
      return [];
    }

    const contentText = data.result?.content?.[0]?.text;
    if (!contentText) return [];

    const parsed = JSON.parse(contentText);
    if (parsed && Array.isArray(parsed.results)) {
      return parsed.results.map((r: { title?: string; url?: string; snippet?: string }) => ({
        title: r.title || '',
        url: r.url || '',
        snippet: r.snippet || '',
      }));
    }

    return [];
  } catch (err) {
    console.warn('MCP Web Search Timeout or Error:', err);
    return [];
  }
}

/**
 * Cào và làm sạch nội dung bài viết từ một URL (MCP web_scrape)
 */
export async function mcpWebScrape(
  url: string,
  maxWords = 1000,
  timeoutMs = 4500
): Promise<WebScrapeResult | null> {
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);

    const response = await fetch(MCP_SERVER_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': MCP_API_KEY,
      },
      body: JSON.stringify({
        jsonrpc: '2.0',
        method: 'tools/call',
        params: {
          name: 'web_scrape',
          arguments: {
            url,
            max_words: maxWords,
          },
        },
        id: Date.now(),
      }),
      signal: controller.signal,
    });

    clearTimeout(timer);

    if (!response.ok) return null;

    const data = await response.json();
    const contentText = data.result?.content?.[0]?.text;
    if (!contentText) return null;

    return JSON.parse(contentText) as WebScrapeResult;
  } catch (err) {
    console.warn('MCP Web Scrape Timeout or Error:', err);
    return null;
  }
}

export interface DeepResearchSource {
  title: string;
  url: string;
  snippet: string;
  scrapedContent?: string;
}

export interface DeepResearchResult {
  sources: DeepResearchSource[];
  formattedContext: string;
  totalSources: number;
}

/**
 * Danh sách domain bỏ qua khi chọn lọc bài viết nghiên cứu chuyên sâu
 */
const IGNORED_DOMAINS = [
  'facebook.com',
  'youtube.com',
  'twitter.com',
  'x.com',
  'tiktok.com',
  'instagram.com',
  'pinterest.com',
  'shopee.vn',
  'lazada.vn',
  'tiki.vn',
];

/**
 * Nghiên cứu chuyên sâu Internet (Deep Research Pipeline):
 * 1. Tìm kiếm đa truy vấn (Việt Nam + Học thuật Quốc tế)
 * 2. Lọc bỏ rác & chọn lọc các nguồn uy tín
 * 3. Cào sâu (Scrape) nội dung 2-3 bài viết hàng đầu để lấy số liệu thực tế
 */
export async function mcpDeepResearch(
  topic: string,
  options: {
    maxSearchSources?: number;
    maxScrapeSources?: number;
    searchTimeoutMs?: number;
    scrapeTimeoutMs?: number;
  } = {}
): Promise<DeepResearchResult> {
  const {
    maxSearchSources = 3,
    maxScrapeSources = 2,
    searchTimeoutMs = 2500,
    scrapeTimeoutMs = 3000,
  } = options;

  const currentYear = new Date().getFullYear();

  // 1. Tạo 2 luồng truy vấn: Tiếng Việt và Quốc tế
  const viQuery = `${topic} nghiên cứu dinh dưỡng gym thể hình ${currentYear}`;
  const enQuery = `${topic} sports nutrition evidence based journal ISSN pubmed`;

  try {
    const [viResults, enResults] = await Promise.all([
      mcpWebSearch(viQuery, maxSearchSources, searchTimeoutMs),
      mcpWebSearch(enQuery, maxSearchSources, searchTimeoutMs),
    ]);

    // Hợp nhất kết quả và khử trùng lặp theo URL
    const combinedMap = new Map<string, WebSearchResult>();
    [...viResults, ...enResults].forEach((item) => {
      if (!item.url) return;
      const isIgnored = IGNORED_DOMAINS.some((d) => item.url.toLowerCase().includes(d));
      if (!isIgnored && !combinedMap.has(item.url)) {
        combinedMap.set(item.url, item);
      }
    });

    const uniqueSearchResults = Array.from(combinedMap.values()).slice(0, 6);

    if (uniqueSearchResults.length === 0) {
      return {
        sources: [],
        formattedContext: '',
        totalSources: 0,
      };
    }

    // 2. Chọn ra 2-3 nguồn tốt nhất để cào sâu nội dung chi tiết
    const scrapeCandidates = uniqueSearchResults.slice(0, maxScrapeSources);
    const scrapePromises = scrapeCandidates.map(async (candidate) => {
      const scraped = await mcpWebScrape(candidate.url, 800, scrapeTimeoutMs);
      return {
        title: candidate.title,
        url: candidate.url,
        snippet: candidate.snippet,
        scrapedContent: scraped?.content ? cleanScrapedContent(scraped.content) : undefined,
      };
    });

    const scrapedResults = await Promise.all(scrapePromises);

    // Ghép các nguồn còn lại chỉ có snippet
    const remainingSources = uniqueSearchResults.slice(maxScrapeSources).map((candidate) => ({
      title: candidate.title,
      url: candidate.url,
      snippet: candidate.snippet,
    }));

    const finalSources: DeepResearchSource[] = [...scrapedResults, ...remainingSources];

    // 3. Format dữ liệu thành Grounding Context chất lượng cao cho LLM
    const formattedContext = finalSources
      .map((s, idx) => {
        let text = `[Nguồn ${idx + 1}: ${s.title}]\nURL: ${s.url}\n`;
        if (s.scrapedContent && s.scrapedContent.length > 100) {
          text += `Trích đoạn nội dung chi tiết:\n${s.scrapedContent.slice(0, 900)}...`;
        } else {
          text += `Tóm tắt: ${s.snippet}`;
        }
        return text;
      })
      .join('\n\n---\n\n');

    return {
      sources: finalSources,
      formattedContext,
      totalSources: finalSources.length,
    };
  } catch (err) {
    console.warn('Lỗi trong mcpDeepResearch pipeline:', err);
    return {
      sources: [],
      formattedContext: '',
      totalSources: 0,
    };
  }
}

/**
 * Loại bỏ ký tự thừa, HTML rác hoặc menu điều hướng trong nội dung cào về
 */
function cleanScrapedContent(content: string): string {
  if (!content) return '';
  return content
    .replace(/\s+/g, ' ')
    .replace(/(Đăng nhập|Đăng ký|Cookie policy|Privacy Policy|Giỏ hàng|Menu|Trang chủ)/gi, '')
    .trim();
}

