'use client';

import React from 'react';
import { Lightbulb, AlertCircle, Info, Sparkles } from 'lucide-react';

interface ChatMessageRendererProps {
  content: string;
  isStreaming?: boolean;
  className?: string;
}

/**
 * ChatMessageRenderer - Bộ phân tích và hiển thị Markdown & Table
 * được thiết kế chuyên biệt cho bong bóng chat AI (responsive, streaming-safe).
 */
export function ChatMessageRenderer({
  content,
  isStreaming = false,
  className = '',
}: ChatMessageRendererProps) {
  const cleanedContent = cleanStreamingContent(content);
  const elements = parseChatMarkdown(cleanedContent, isStreaming);

  return (
    <div className={`space-y-2 text-xs leading-relaxed text-slate-800 ${className}`}>
      {elements}
      {isStreaming && (
        <span className="inline-flex items-center gap-1 ml-1 align-baseline">
          <span className="inline-block w-1.5 h-3.5 bg-[#0055FE] rounded-xs animate-pulse" />
        </span>
      )}
    </div>
  );
}

/**
 * Làm sạch text khỏi các tag ẩn hoặc các tag gợi ý đang stream dở
 */
function cleanStreamingContent(rawText: string): string {
  if (!rawText) return '';

  let text = rawText
    // Loại bỏ tag SUGGEST_PRODUCT hoàn chỉnh
    .replace(/\[\s*SUGGEST_PRODUCT:[^\]]*\]/gi, '')
    .replace(/\[\s*SUGGEST_PRODUCT[^\n\]]*\]?/gi, '')
    // Loại bỏ tag SUGGEST đang stream dở ở cuối chuỗi
    .replace(/\[\s*SUGGEST_PRODUCT[^\n\]]*$/gi, '')
    .replace(/\[\s*SUGGEST[^\n\]]*$/gi, '')
    .replace(/\[\s*SUG[^\n\]]*$/gi, '')
    .replace(/\[\s*SU[^\n\]]*$/gi, '')
    .replace(/\[\s*S[^\n\]]*$/gi, '')
    .replace(/\[\s*$/g, '')
    .replace(/\bSUGGEST_PRODUCT:[^\s\]]*/gi, '');

  // Xóa các tiêu đề gợi ý sản phẩm treo ở cuối tin nhắn nếu chưa có nội dung sau đó
  text = text
    .replace(/(\*\*|__)?(Combo|Sản phẩm đề xuất|Sản phẩm gợi ý|Gợi ý sản phẩm|Combo gợi ý|Gợi ý|Sản phẩm)(\*\*|__)?\s*:?\s*$/gim, '')
    .replace(/[\+\,\s\:\-\*]+$/, '');

  return text.trim();
}

/**
 * Trình phân tích cú pháp Markdown sang React Elements an toàn cho Chat
 */
function parseChatMarkdown(markdown: string, isStreaming: boolean): React.ReactNode[] {
  if (!markdown) return [];

  const lines = markdown.split('\n');
  const elements: React.ReactNode[] = [];
  let tableRows: string[][] = [];
  let inTable = false;
  let elementKey = 0;

  const flushTable = () => {
    if (tableRows.length > 0) {
      const headerRow = tableRows[0];
      const bodyRows = tableRows.slice(1);
      const isScrollable = headerRow.length > 2;

      elements.push(
        <div key={`table-wrapper-${elementKey++}`} className="my-2.5 w-full">
          <div className="rounded-xl border border-slate-200/90 bg-white shadow-2xs overflow-hidden">
            {isScrollable && (
              <div className="bg-slate-50/80 px-2.5 py-1 border-b border-slate-100 flex items-center justify-between text-[10px] text-slate-500 font-medium">
                <span className="flex items-center gap-1 font-bold text-slate-700">
                  <Sparkles className="w-2.5 h-2.5 text-[#0055FE]" />
                  <span>Bảng tổng hợp</span>
                </span>
                <span className="text-[#0055FE] text-[9px] font-semibold">
                  Cuộn ngang 👉
                </span>
              </div>
            )}
            <div className="overflow-x-auto no-scrollbar max-w-full">
              <table className="w-full text-left border-collapse text-[11px] sm:text-xs">
                <thead>
                  <tr className="bg-slate-100/90 text-slate-900 border-b border-slate-200/90 font-bold">
                    {headerRow.map((cell, cIdx) => (
                      <th
                        key={cIdx}
                        className="py-1.5 sm:py-2 px-2.5 sm:px-3 font-black whitespace-nowrap tracking-tight"
                      >
                        {formatInline(cell.trim())}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                  {bodyRows.map((row, rIdx) => (
                    <tr
                      key={rIdx}
                      className="hover:bg-blue-50/30 transition-colors odd:bg-white even:bg-slate-50/40"
                    >
                      {row.map((cell, cIdx) => (
                        <td
                          key={cIdx}
                          className="py-1.5 sm:py-2 px-2.5 sm:px-3 text-slate-700 leading-snug align-top"
                        >
                          {formatInline(cell.trim())}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      );

      tableRows = [];
      inTable = false;
    }
  };

  for (let i = 0; i < lines.length; i++) {
    const rawLine = lines[i];
    const trimmed = rawLine.trim();

    // 1. Nhận diện dòng Markdown Table (| Cột 1 | Cột 2 |)
    if (trimmed.startsWith('|') || (inTable && trimmed.includes('|'))) {
      // Bỏ qua dòng phân cách Markdown | :--- | :--- |
      if (/^\|?[\s\-:]+(\|[\s\-:]+)+\|?$/.test(trimmed)) {
        continue;
      }

      // Tách ô bằng dấu |
      let cleanLine = trimmed;
      if (cleanLine.startsWith('|')) cleanLine = cleanLine.slice(1);
      if (cleanLine.endsWith('|')) cleanLine = cleanLine.slice(0, -1);

      const cells = cleanLine.split('|').map((c) => c.trim());
      if (cells.length > 0 && cells.some((c) => c.length > 0)) {
        tableRows.push(cells);
        inTable = true;
        continue;
      }
    } else if (inTable) {
      flushTable();
    }

    // Dòng trống
    if (!trimmed) {
      elements.push(<div key={`blank-${elementKey++}`} className="h-1" />);
      continue;
    }

    // 2. Headings (### hoặc ## hoặc #)
    if (/^#{1,6}\s+/.test(trimmed)) {
      const headingText = trimmed.replace(/^#{1,6}\s+/, '').trim();
      elements.push(
        <div
          key={`heading-${elementKey++}`}
          className="font-black text-slate-950 pt-1.5 pb-0.5 text-xs flex items-center gap-1.5"
        >
          <span className="w-1 h-3 rounded-full bg-[#0055FE] inline-block shrink-0" />
          <span>{formatInline(headingText)}</span>
        </div>
      );
      continue;
    }

    // 3. Blockquotes / Callout Tips (> 💡 hoặc > Mẹo hoặc > ...)
    if (trimmed.startsWith('>')) {
      let quoteText = trimmed.replace(/^>\s*/, '').trim();
      const isTip =
        quoteText.includes('💡') ||
        quoteText.toLowerCase().includes('mẹo') ||
        quoteText.toLowerCase().includes('tip');
      const isWarning =
        quoteText.includes('⚠️') ||
        quoteText.toLowerCase().includes('lưu ý') ||
        quoteText.toLowerCase().includes('chú ý');

      quoteText = quoteText.replace(/^(?:💡|⚠️|📌|🔥|⚡)\s*/u, '');

      elements.push(
        <div
          key={`quote-${elementKey++}`}
          className={`p-2.5 rounded-xl border my-1.5 flex items-start gap-2 text-[11px] shadow-2xs ${
            isTip
              ? 'bg-blue-50/70 border-blue-200/80 text-blue-950'
              : isWarning
              ? 'bg-amber-50/80 border-amber-200/80 text-amber-950'
              : 'bg-slate-50 border-slate-200 text-slate-800'
          }`}
        >
          <div className="shrink-0 mt-0.5">
            {isTip ? (
              <Lightbulb className="w-3.5 h-3.5 text-blue-600" />
            ) : isWarning ? (
              <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
            ) : (
              <Info className="w-3.5 h-3.5 text-slate-500" />
            )}
          </div>
          <div className="flex-1 font-medium leading-relaxed">
            {formatInline(quoteText)}
          </div>
        </div>
      );
      continue;
    }

    // 4. Horizontal Rule (--- hoặc ***)
    if (/^[-*_]{3,}$/.test(trimmed)) {
      elements.push(
        <hr key={`hr-${elementKey++}`} className="my-2 border-slate-200/80" />
      );
      continue;
    }

    // 5. Bullet Lists (- hoặc * hoặc •)
    if (/^[\*\-\+•]\s+/.test(trimmed)) {
      const itemText = trimmed.replace(/^[\*\-\+•]\s+/, '').trim();
      elements.push(
        <div
          key={`bullet-${elementKey++}`}
          className="flex items-start gap-2 pl-1 my-0.5 leading-relaxed"
        >
          <div className="w-1.5 h-1.5 rounded-full bg-[#0055FE] shrink-0 mt-1.5" />
          <div className="flex-1 font-medium text-slate-800">
            {formatInline(itemText)}
          </div>
        </div>
      );
      continue;
    }

    // 6. Numbered Lists (1. 2.)
    if (/^\d+[\.\)]\s+/.test(trimmed)) {
      const match = trimmed.match(/^(\d+)[\.\)]\s+(.*)/);
      if (match) {
        const num = match[1];
        const itemText = match[2];
        elements.push(
          <div
            key={`num-${elementKey++}`}
            className="flex items-start gap-2 pl-0.5 my-0.5 leading-relaxed"
          >
            <span className="w-4 h-4 rounded-full bg-blue-100 text-[#0055FE] text-[10px] font-black flex items-center justify-center shrink-0 mt-0.5">
              {num}
            </span>
            <div className="flex-1 font-medium text-slate-800">
              {formatInline(itemText)}
            </div>
          </div>
        );
        continue;
      }
    }

    // 7. Regular Paragraph
    elements.push(
      <p key={`p-${elementKey++}`} className="leading-relaxed font-normal">
        {formatInline(trimmed)}
      </p>
    );
  }

  flushTable();
  return elements;
}

/**
 * Xử lý định dạng Inline: Bold (**text**), Italic (*text*), Code (`code`)
 * Hỗ trợ an toàn khi token streaming đang dang dở (unclosed tags).
 */
function formatInline(text: string): React.ReactNode {
  if (!text) return null;

  // Tách theo **bold**, `code`, *italic*
  const parts = text.split(/(\*\*.*?\*\*|`.*?`|\*.*?\*)/g);

  return parts.map((part, index) => {
    if (part.startsWith('**') && part.endsWith('**') && part.length >= 4) {
      const content = part.slice(2, -2).replace(/\*/g, '');
      return (
        <strong key={index} className="font-extrabold text-slate-950">
          {content}
        </strong>
      );
    }

    if (part.startsWith('`') && part.endsWith('`') && part.length >= 2) {
      return (
        <code
          key={index}
          className="px-1 py-0.5 rounded bg-blue-50 text-[#0055FE] font-mono text-[10px] font-semibold border border-blue-100/60"
        >
          {part.slice(1, -1)}
        </code>
      );
    }

    if (part.startsWith('*') && part.endsWith('*') && part.length >= 2) {
      return (
        <em key={index} className="italic text-slate-700">
          {part.slice(1, -1)}
        </em>
      );
    }

    // Xử lý nếu chuỗi kết thúc bằng ** dở dang khi đang stream (ví dụ: "**Tăng cơ")
    let cleanPart = part;
    if (cleanPart.startsWith('**')) {
      cleanPart = cleanPart.slice(2);
      return (
        <strong key={index} className="font-extrabold text-slate-950">
          {cleanPart}
        </strong>
      );
    }

    return <span key={index}>{cleanPart}</span>;
  });
}
