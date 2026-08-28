'use client';

import React from 'react';
import {
  Lightbulb,
  AlertTriangle,
  CheckCircle2,
  Info,
  BookmarkCheck,
  FlaskConical,
  XCircle,
} from 'lucide-react';

interface MarkdownRendererProps {
  content: string;
}

export function MarkdownRenderer({ content }: MarkdownRendererProps) {
  const renderedElements = parseMarkdownToReact(content);

  return (
    <div className="article-markdown space-y-6 text-slate-700 leading-relaxed text-base sm:text-lg">
      {renderedElements}
    </div>
  );
}

/**
 * Custom Lightweight, Safe & Feature-Rich Markdown to React Parser
 */
function parseMarkdownToReact(markdown: string): React.ReactNode[] {
  if (!markdown) return [];

  const lines = markdown.split('\n');
  const elements: React.ReactNode[] = [];
  let currentTableRows: string[][] = [];
  let currentQuoteLines: string[] = [];
  let inTable = false;
  let inQuote = false;
  let keyIndex = 0;

  const flushTable = () => {
    if (currentTableRows.length > 0) {
      const headerRow = currentTableRows[0];
      const bodyRows = currentTableRows.slice(1);

      elements.push(
        <div
          key={`table-${keyIndex++}`}
          className="overflow-x-auto my-6 rounded-2xl border border-slate-200 shadow-sm bg-white"
        >
          <table className="w-full text-left text-sm border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-900 font-bold">
                {headerRow.map((cell, cIdx) => (
                  <th key={cIdx} className="py-3 px-4 sm:px-5">
                    {parseInlineFormatting(cell.trim())}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {bodyRows.map((row, rIdx) => (
                <tr key={rIdx} className="hover:bg-blue-50/20 transition-colors">
                  {row.map((cell, cIdx) => (
                    <td key={cIdx} className="py-3 px-4 sm:px-5 text-slate-700">
                      {parseInlineFormatting(cell.trim())}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
      currentTableRows = [];
      inTable = false;
    }
  };

  const flushQuote = () => {
    if (currentQuoteLines.length > 0) {
      const combinedText = currentQuoteLines.join('\n');
      const firstLine = currentQuoteLines[0] || '';

      const isKeyTakeaway =
        firstLine.includes('📌') ||
        firstLine.toLowerCase().includes('tóm tắt') ||
        firstLine.toLowerCase().includes('takeaway');

      const isScience =
        firstLine.includes('🔬') ||
        firstLine.includes('🧪') ||
        firstLine.toLowerCase().includes('khoa học') ||
        firstLine.toLowerCase().includes('nghiên cứu') ||
        firstLine.toLowerCase().includes('evidence');

      const isTip =
        firstLine.includes('💡') ||
        firstLine.toLowerCase().includes('mẹo') ||
        firstLine.toLowerCase().includes('lời khuyên');

      const isWarning =
        firstLine.includes('⚠️') ||
        firstLine.toLowerCase().includes('lưu ý') ||
        firstLine.toLowerCase().includes('chú ý') ||
        firstLine.toLowerCase().includes('cảnh báo');

      const isRecommendation =
        firstLine.includes('✅') ||
        firstLine.toLowerCase().includes('khuyên dùng') ||
        firstLine.toLowerCase().includes('nên làm');

      const isMyth =
        firstLine.includes('❌') ||
        firstLine.toLowerCase().includes('lầm tưởng') ||
        firstLine.toLowerCase().includes('sai lầm');

      let themeClass = 'bg-slate-50 border-slate-200 text-slate-800';
      let icon = <Info className="w-5 h-5 text-slate-600 shrink-0 mt-0.5" />;

      if (isKeyTakeaway) {
        themeClass = 'bg-gradient-to-br from-indigo-50/90 to-blue-50/60 border-indigo-200 text-indigo-950 shadow-indigo-100/50';
        icon = <BookmarkCheck className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" />;
      } else if (isScience) {
        themeClass = 'bg-cyan-50/80 border-cyan-200 text-cyan-950';
        icon = <FlaskConical className="w-5 h-5 text-cyan-700 shrink-0 mt-0.5" />;
      } else if (isTip) {
        themeClass = 'bg-blue-50/70 border-blue-200 text-blue-950';
        icon = <Lightbulb className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />;
      } else if (isWarning) {
        themeClass = 'bg-amber-50/80 border-amber-200 text-amber-950';
        icon = <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />;
      } else if (isRecommendation) {
        themeClass = 'bg-emerald-50/80 border-emerald-200 text-emerald-950';
        icon = <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />;
      } else if (isMyth) {
        themeClass = 'bg-rose-50/80 border-rose-200 text-rose-950';
        icon = <XCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />;
      }

      elements.push(
        <div
          key={`quote-${keyIndex++}`}
          className={`p-4 sm:p-5 rounded-2xl border my-5 flex items-start gap-3.5 shadow-sm ${themeClass}`}
        >
          {icon}
          <div className="text-sm sm:text-base font-medium leading-relaxed space-y-2 w-full">
            {currentQuoteLines.map((qLine, qIdx) => {
              let cleanLine = qLine.trim();
              if (qIdx === 0) {
                // Xoá emoji ở đầu câu đầu tiên nếu đã có icon
                cleanLine = cleanLine.replace(/^(?:💡|⚠️|📌|🔬|🧪|✅|❌|🔥|⚡)\s*/u, '');
              }

              // Nếu là gạch đầu dòng trong quote
              if (/^[-*]\s+/.test(cleanLine)) {
                return (
                  <div key={qIdx} className="flex items-start gap-2 pl-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-current shrink-0 mt-2 opacity-70" />
                    <span>{parseInlineFormatting(cleanLine.replace(/^[-*]\s+/, ''))}</span>
                  </div>
                );
              }

              return <p key={qIdx}>{parseInlineFormatting(cleanLine)}</p>;
            })}
          </div>
        </div>
      );

      currentQuoteLines = [];
      inQuote = false;
    }
  };

  for (let i = 0; i < lines.length; i++) {
    const rawLine = lines[i];
    const trimmed = rawLine.trim();

    // 1. Markdown Tables (| Col 1 | Col 2 |)
    if (trimmed.startsWith('|') && trimmed.endsWith('|')) {
      if (inQuote) flushQuote();
      if (/^\|[\s\-:]+(\|[\s\-:]+)+\|$/.test(trimmed)) {
        continue;
      }
      const cells = trimmed
        .slice(1, -1)
        .split('|')
        .map((c) => c.trim());
      currentTableRows.push(cells);
      inTable = true;
      continue;
    } else if (inTable) {
      flushTable();
    }

    // 2. Blockquotes & Callouts (> ...)
    if (trimmed.startsWith('>')) {
      const quoteContent = trimmed.replace(/^>\s*/, '');
      currentQuoteLines.push(quoteContent);
      inQuote = true;
      continue;
    } else if (inQuote) {
      flushQuote();
    }

    if (!trimmed) {
      continue;
    }

    // 3. Markdown Images (![Alt text](url))
    const imgMatch = trimmed.match(/^!\[(.*?)\]\((.*?)\)$/);
    if (imgMatch) {
      const altText = imgMatch[1] || 'Hình ảnh minh họa';
      const imgUrl = imgMatch[2];
      elements.push(
        <figure key={`img-${keyIndex++}`} className="my-8 space-y-2.5">
          <div className="rounded-3xl overflow-hidden border border-slate-100 shadow-md bg-slate-900 aspect-[16/9] relative group">
            <img
              src={imgUrl}
              alt={altText}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              onError={(e) => {
                (e.target as HTMLImageElement).src =
                  'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=1200&q=80';
              }}
            />
          </div>
          {altText && (
            <figcaption className="text-center text-xs sm:text-sm text-slate-500 italic font-medium px-4">
              📸 {altText}
            </figcaption>
          )}
        </figure>
      );
      continue;
    }

    // 4. Headings (H2, H3, H4)
    if (trimmed.startsWith('## ')) {
      const headingText = trimmed.replace(/^##\s+/, '').trim();
      const anchorId = headingText
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9\s-]/g, '')
        .trim()
        .replace(/\s+/g, '-');

      elements.push(
        <h2
          key={`h2-${keyIndex++}`}
          id={anchorId}
          className="text-xl sm:text-2xl lg:text-3xl font-black text-slate-900 tracking-tight pt-6 pb-2 border-b border-slate-100 flex items-center gap-2 group scroll-mt-24"
        >
          <span className="w-1.5 h-6 rounded-full bg-[#0055FE] inline-block shrink-0" />
          <span>{parseInlineFormatting(headingText)}</span>
        </h2>
      );
      continue;
    }

    if (trimmed.startsWith('### ')) {
      const headingText = trimmed.replace(/^###\s+/, '').trim();
      elements.push(
        <h3
          key={`h3-${keyIndex++}`}
          className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight pt-4 pb-1 text-[#08183A]"
        >
          {parseInlineFormatting(headingText)}
        </h3>
      );
      continue;
    }

    // 5. Horizontal Rule (---)
    if (/^---|\*\*\*|___$/.test(trimmed)) {
      elements.push(<hr key={`hr-${keyIndex++}`} className="my-6 border-slate-200" />);
      continue;
    }

    // 6. Bullet Lists (- hoặc *)
    if (/^[-*]\s+/.test(trimmed)) {
      const itemText = trimmed.replace(/^[-*]\s+/, '').trim();
      elements.push(
        <div key={`li-${keyIndex++}`} className="flex items-start gap-3 pl-2 my-2">
          <div className="w-2 h-2 rounded-full bg-[#0055FE] shrink-0 mt-2.5" />
          <div className="text-sm sm:text-base text-slate-700 leading-relaxed">
            {parseInlineFormatting(itemText)}
          </div>
        </div>
      );
      continue;
    }

    // 7. Numbered Lists (1. 2.)
    if (/^\d+\.\s+/.test(trimmed)) {
      const match = trimmed.match(/^(\d+)\.\s+(.*)/);
      if (match) {
        const num = match[1];
        const itemText = match[2];
        elements.push(
          <div key={`num-li-${keyIndex++}`} className="flex items-start gap-3 pl-1 my-2">
            <span className="w-5 h-5 rounded-full bg-blue-100 text-[#0055FE] text-xs font-black flex items-center justify-center shrink-0 mt-0.5">
              {num}
            </span>
            <div className="text-sm sm:text-base text-slate-700 leading-relaxed">
              {parseInlineFormatting(itemText)}
            </div>
          </div>
        );
        continue;
      }
    }

    // 8. Regular Paragraph
    elements.push(
      <p key={`p-${keyIndex++}`} className="text-sm sm:text-base leading-relaxed text-slate-700">
        {parseInlineFormatting(trimmed)}
      </p>
    );
  }

  flushTable();
  flushQuote();
  return elements;
}

/**
 * Format inline Bold (**text**), Italic (*text*), Code (`code`)
 */
function parseInlineFormatting(text: string): React.ReactNode {
  if (!text) return null;

  const parts = text.split(/(\*\*.*?\*\*|\*.*?\*|`.*?`)/g);

  return parts.map((part, index) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return (
        <strong key={index} className="font-black text-slate-900">
          {part.slice(2, -2)}
        </strong>
      );
    }
    if (part.startsWith('*') && part.endsWith('*')) {
      return (
        <em key={index} className="italic text-slate-800">
          {part.slice(1, -1)}
        </em>
      );
    }
    if (part.startsWith('`') && part.endsWith('`')) {
      return (
        <code
          key={index}
          className="px-1.5 py-0.5 rounded bg-slate-100 text-blue-700 font-mono text-xs font-semibold"
        >
          {part.slice(1, -1)}
        </code>
      );
    }
    return part;
  });
}

