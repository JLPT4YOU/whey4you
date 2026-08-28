'use client';

import React, { useState, useRef, useEffect } from 'react';
import {
  Bot,
  Sparkles,
  X,
  Send,
  ArrowRight,
  Zap,
  Dumbbell,
  ShieldCheck,
  RotateCcw,
  ShoppingCart,
  Check
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCart } from '@/context/cart-context';
import { Product } from '@/types/product';
import { ChatMessageRenderer } from '@/components/ai/chat-message-renderer';

interface Message {
  id: string;
  sender: 'ai' | 'user';
  text: string;
  suggestedProduct?: Product;
  suggestedProducts?: Product[];
  isStreaming?: boolean;
}

const QUICK_PROMPTS = [
  {
    icon: Dumbbell,
    label: 'Tăng cơ nạc cho người mới',
    query: 'Mình mới tập gym, muốn tăng cơ nạc nhanh thì nên dùng sản phẩm nào?',
  },
  {
    icon: Zap,
    label: 'Cách dùng Pre-workout & Creatine',
    query: 'Kết hợp Pre-Workout và Creatine thế nào để tập khỏe nhất?',
  },
  {
    icon: ShieldCheck,
    label: 'Chăm sóc tim mạch & xương khớp',
    query: 'Tập nặng hay đau khớp và mỏi người thì nên bổ sung gì?',
  },
];

const INITIAL_MESSAGE: Message = {
  id: 'welcome',
  sender: 'ai',
  text: 'Chào bạn! Mình là **Chuyên viên Dinh dưỡng & AI Coach W4U** 🤖⚡️\n\nBạn đang có mục tiêu **tăng cơ nạc**, **tăng sức mạnh**, **giảm mỡ** hay cần phác đồ thực phẩm bổ sung nào hôm nay?',
};

const CHAT_STORAGE_KEY = 'w4u_ai_chat_session_history';

export function FloatingContactHub() {
  const { setQuickViewProduct, addToCart } = useCart();
  const [isAiOpen, setIsAiOpen] = useState(false);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [addedProductId, setAddedProductId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([INITIAL_MESSAGE]);
  const [hasHydrated, setHasHydrated] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const triggerButtonRef = useRef<HTMLButtonElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Khôi phục lịch sử chat từ sessionStorage khi refresh trang
  useEffect(() => {
    try {
      const saved = sessionStorage.getItem(CHAT_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          // Bỏ cờ isStreaming nếu trang bị reload giữa chừng
          const cleanHistory = parsed.map((m: Message) => ({ ...m, isStreaming: false }));
          setMessages(cleanHistory);
        }
      }
    } catch {
      // Bỏ qua nếu có lỗi parse JSON
    } finally {
      setHasHydrated(true);
    }
  }, []);

  // Tự động lưu lịch sử chat vào sessionStorage khi có tin nhắn mới
  useEffect(() => {
    if (!hasHydrated) return;
    try {
      if (messages.length === 1 && messages[0].id === 'welcome') {
        sessionStorage.removeItem(CHAT_STORAGE_KEY);
      } else {
        sessionStorage.setItem(CHAT_STORAGE_KEY, JSON.stringify(messages));
      }
    } catch {
      // Bỏ qua nếu vượt quá quota storage
    }
  }, [messages, hasHydrated]);

  useEffect(() => {
    if (isAiOpen) {
      scrollToBottom();
    }
  }, [messages, isTyping, isAiOpen]);

  // Click ra ngoài để đóng chat
  useEffect(() => {
    function handleClickOutside(event: MouseEvent | TouchEvent) {
      if (
        isAiOpen &&
        chatContainerRef.current &&
        !chatContainerRef.current.contains(event.target as Node) &&
        triggerButtonRef.current &&
        !triggerButtonRef.current.contains(event.target as Node)
      ) {
        setIsAiOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, [isAiOpen]);

  // Xóa toàn bộ cache và làm mới chat khi người dùng bấm nút Reset
  const handleResetChat = () => {
    try {
      sessionStorage.removeItem(CHAT_STORAGE_KEY);
    } catch {}
    setMessages([INITIAL_MESSAGE]);
  };

  const handleAddToCartQuick = (e: React.MouseEvent, product: Product) => {
    e.stopPropagation();
    addToCart(product, 1, product.flavors?.[0], product.sizes?.[0]);
    setAddedProductId(product.id);
    setTimeout(() => setAddedProductId(null), 1800);
  };

  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || inputText).trim();
    if (!text || isTyping) return;

    const userMsg: Message = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text,
    };

    const aiMsgId = `ai-${Date.now()}`;
    const initialAiMsg: Message = {
      id: aiMsgId,
      sender: 'ai',
      text: '',
      isStreaming: true,
    };

    const newMessages = [...messages, userMsg];
    setMessages([...newMessages, initialAiMsg]);
    if (!textToSend) setInputText('');
    setIsTyping(true);

    try {
      const apiPayload = newMessages.map((m) => ({
        role: m.sender === 'ai' ? 'assistant' : 'user',
        content: m.text,
      }));

      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: apiPayload }),
      });

      if (!res.ok || !res.body) {
        throw new Error('Lỗi kết nối máy chủ');
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';
      let currentAiText = '';

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6));
              if (data.type === 'chunk' && data.content) {
                currentAiText += data.content;
                setMessages((prev) =>
                  prev.map((msg) =>
                    msg.id === aiMsgId
                      ? { ...msg, text: currentAiText, isStreaming: true }
                      : msg
                  )
                );
              } else if (data.type === 'done') {
                setMessages((prev) =>
                  prev.map((msg) =>
                    msg.id === aiMsgId
                      ? {
                          ...msg,
                          text: data.cleanText || currentAiText,
                          suggestedProduct: data.suggestedProduct,
                          suggestedProducts:
                            data.suggestedProducts ||
                            (data.suggestedProduct ? [data.suggestedProduct] : undefined),
                          isStreaming: false,
                        }
                      : msg
                  )
                );
              }
            } catch {
              // Ignore partial JSON
            }
          }
        }
      }
    } catch {
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === aiMsgId
            ? {
                ...msg,
                text: 'Xin lỗi bạn, kết nối của mình đang bị gián đoạn đôi chút. Bạn thử gửi lại câu hỏi nhé!',
                isStreaming: false,
              }
            : msg
        )
      );
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-40 flex flex-col items-end pointer-events-auto select-none">
      {/* Contact Bubbles: Facebook & Zalo */}
      <div className="flex flex-col items-end gap-2 mb-2">
        {/* 1. Facebook Fanpage Button */}
        <a
          href="https://www.facebook.com/p/Whey4You-61563177707517/"
          target="_blank"
          rel="noopener noreferrer"
          className="group flex items-center gap-2 bg-[#1877F2] hover:bg-[#1465CE] text-white pl-3.5 pr-3 py-2 rounded-full shadow-lg shadow-blue-600/25 transition-all duration-300 hover:scale-105 active:scale-95"
          aria-label="Facebook Fanpage Whey4You"
        >
          <span className="text-[11px] font-bold tracking-tight hidden group-hover:inline-block transition-all">
            Facebook
          </span>
          <svg className="w-4 h-4 sm:w-5 sm:h-5 fill-current" viewBox="0 0 24 24">
            <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
          </svg>
        </a>

        {/* 2. Zalo Chat Button */}
        <a
          href="https://zalo.me/g/hqwqsqcnpgik9n3zo0nk"
          target="_blank"
          rel="noopener noreferrer"
          className="group flex items-center gap-2 bg-[#0068FF] hover:bg-[#0055D4] text-white pl-3.5 pr-3 py-2 rounded-full shadow-lg shadow-blue-500/25 transition-all duration-300 hover:scale-105 active:scale-95"
          aria-label="Chat Zalo W4U"
        >
          <span className="text-[11px] font-bold tracking-tight hidden group-hover:inline-block transition-all">
            Chat Zalo
          </span>
          <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-white text-[#0068FF] flex items-center justify-center font-black text-[11px] sm:text-xs">
            Z
          </div>
        </a>
      </div>

      {/* AI Coach Trigger Button */}
      <motion.button
        ref={triggerButtonRef}
        whileHover={{ scale: 1.04 }}
        whileTap={{ scale: 0.96 }}
        onClick={() => setIsAiOpen(!isAiOpen)}
        className={`group relative z-50 flex items-center gap-2 sm:gap-2.5 pl-3.5 sm:pl-4 pr-3.5 sm:pr-4 py-2 sm:py-2.5 rounded-full shadow-xl transition-all duration-300 border cursor-pointer ${
          isAiOpen
            ? 'bg-[#0055FE] text-white border-blue-400 shadow-blue-500/30'
            : 'bg-slate-950 hover:bg-[#0055FE] text-white border-slate-800 shadow-slate-950/25'
        }`}
        aria-label="AI Coach Tư Vấn Thể Hình"
      >
        <div className="relative flex items-center justify-center">
          <Sparkles className="w-4 h-4 text-[#00D2FF] group-hover:text-white transition-colors" />
          <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-emerald-400 animate-ping opacity-75" />
          <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-emerald-400" />
        </div>
        <div className="text-left">
          <span className="block text-[11px] sm:text-xs font-black tracking-tight leading-tight">
            AI Coach W4U
          </span>
          <span className="block text-[8px] sm:text-[9px] text-slate-400 group-hover:text-blue-100 font-medium">
            Tư vấn thể hình 24/7
          </span>
        </div>
      </motion.button>

      {/* Compact Minimalist Chat Window */}
      <AnimatePresence>
        {isAiOpen && (
          <motion.div
            ref={chatContainerRef}
            initial={{ opacity: 0, y: 15, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 15, scale: 0.96 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            style={{ transformOrigin: 'bottom right' }}
            className="fixed inset-x-2 bottom-2 top-14 sm:static sm:inset-auto sm:bottom-16 sm:right-0 z-50 w-auto sm:w-[420px] sm:max-w-[440px] h-auto sm:h-[560px] sm:max-h-[80vh] bg-white/95 backdrop-blur-2xl rounded-3xl shadow-2xl border border-slate-200/80 flex flex-col overflow-hidden sm:mb-1"
          >
            {/* Clean Minimalist Header */}
            <div className="px-4 sm:px-5 py-3.5 bg-slate-950 text-white border-b border-slate-800 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-[#0055FE] flex items-center justify-center text-white shadow-sm ring-2 ring-blue-400/20">
                  <Bot className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-xs font-black uppercase tracking-wider font-display flex items-center gap-1.5">
                    <span>W4U AI Coach</span>
                  </h3>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    <span className="text-[10px] text-slate-400 font-medium">
                      Trực tuyến • Tư vấn thể hình tức thì
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-1">
                <button
                  onClick={handleResetChat}
                  title="Xóa đoạn chat làm mới"
                  className="p-1.5 text-slate-400 hover:text-white rounded-full hover:bg-white/10 transition-colors cursor-pointer"
                  aria-label="Xóa đoạn chat làm mới"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => setIsAiOpen(false)}
                  className="p-1.5 text-slate-400 hover:text-white rounded-full hover:bg-white/10 transition-colors cursor-pointer"
                  aria-label="Đóng"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-3.5 sm:p-4 space-y-3 sm:space-y-4 text-xs">
              {messages.map((msg) => {
                const isAI = msg.sender === 'ai';
                if (isAI && !msg.text && msg.isStreaming) {
                  return (
                    <div
                      key={msg.id}
                      className="flex items-center gap-2 p-3 bg-[#F4F7FC] rounded-2xl w-24 border border-slate-100"
                    >
                      <Bot className="w-3.5 h-3.5 text-[#0055FE] animate-pulse" />
                      <div className="flex items-center gap-1">
                        <span className="w-1.5 h-1.5 bg-[#0055FE] rounded-full animate-bounce [animation-delay:-0.3s]" />
                        <span className="w-1.5 h-1.5 bg-[#0055FE] rounded-full animate-bounce [animation-delay:-0.15s]" />
                        <span className="w-1.5 h-1.5 bg-[#0055FE] rounded-full animate-bounce" />
                      </div>
                    </div>
                  );
                }

                return (
                  <motion.div
                    key={msg.id}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.22 }}
                    className={`flex flex-col ${isAI ? 'items-start' : 'items-end'}`}
                  >
                    <div
                      className={`max-w-[92%] sm:max-w-[90%] px-3.5 sm:px-4 py-2.5 sm:py-3 rounded-2xl ${
                        isAI
                          ? 'bg-[#F4F7FC] text-slate-800 rounded-tl-xs border border-slate-100/80 shadow-2xs'
                          : 'bg-[#0055FE] text-white rounded-tr-xs shadow-sm font-medium'
                      }`}
                    >
                      {isAI ? (
                        <ChatMessageRenderer
                          content={msg.text}
                          isStreaming={msg.isStreaming}
                        />
                      ) : (
                        <p className="whitespace-pre-wrap">{msg.text}</p>
                      )}
                    </div>

                    {/* Suggested Product Cards Horizontal Carousel */}
                    {(() => {
                      const productsToRender =
                        msg.suggestedProducts ||
                        (msg.suggestedProduct ? [msg.suggestedProduct] : []);
                      if (productsToRender.length === 0) return null;

                      return (
                        <div className="mt-2.5 w-full max-w-full">
                          {productsToRender.length > 1 && (
                            <div className="flex items-center justify-between text-[10px] font-bold text-slate-500 mb-1 px-1">
                              <span className="flex items-center gap-1 text-slate-700">
                                <Sparkles className="w-3 h-3 text-[#0055FE]" />
                                <span>Gợi ý {productsToRender.length} sản phẩm phù hợp</span>
                              </span>
                              <span className="text-[#0055FE] text-[9px] font-medium flex items-center gap-0.5">
                                Cuộn sang 👉
                              </span>
                            </div>
                          )}

                          <div className="w-full overflow-x-auto no-scrollbar flex items-stretch gap-2 pb-1 snap-x snap-mandatory">
                            {productsToRender.map((prod) => (
                              <motion.div
                                key={prod.id}
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ duration: 0.25 }}
                                className={`${
                                  productsToRender.length === 1
                                    ? 'w-full max-w-[95%]'
                                    : 'w-[220px] sm:w-[250px]'
                                } shrink-0 snap-start bg-white p-2.5 sm:p-3 rounded-2xl border border-blue-200/90 shadow-xs hover:shadow-md transition-all flex flex-col justify-between`}
                              >
                                <div className="flex items-center gap-2.5">
                                  <img
                                    src={prod.image}
                                    alt={prod.name}
                                    className="w-11 h-11 sm:w-12 sm:h-12 object-contain bg-slate-50 rounded-xl p-1 shrink-0 border border-slate-100"
                                  />
                                  <div className="flex-1 min-w-0">
                                    <span className="inline-block px-1.5 py-0.2 bg-blue-50 text-[#0055FE] text-[8px] sm:text-[9px] font-black uppercase rounded mb-0.5">
                                      {prod.categoryName}
                                    </span>
                                    <p
                                      className="text-xs font-black text-slate-900 truncate leading-snug"
                                      title={prod.name}
                                    >
                                      {prod.name}
                                    </p>
                                    <p className="text-xs font-black text-[#0055FE] mt-0.5">
                                      {prod.price.toLocaleString('vi-VN')}₫
                                    </p>
                                  </div>
                                </div>

                                {/* Action Button */}
                                <div className="mt-2 pt-2 border-t border-slate-100">
                                  <button
                                    onClick={() => setQuickViewProduct(prod)}
                                    className="w-full py-1.5 px-2 bg-[#0055FE] hover:bg-blue-600 active:scale-95 text-white rounded-lg text-[10px] font-bold flex items-center justify-center gap-1.5 transition-all shadow-2xs cursor-pointer"
                                  >
                                    <ShoppingCart className="w-3 h-3" />
                                    <span>Mua Ngay</span>
                                  </button>
                                </div>
                              </motion.div>
                            ))}
                          </div>
                        </div>
                      );
                    })()}
                  </motion.div>
                );
              })}

              <div ref={messagesEndRef} />
            </div>

            {/* Quick Prompt Suggestions */}
            <div className="px-3 py-2 border-t border-slate-100 bg-[#FAFCFF] overflow-x-auto no-scrollbar flex items-center gap-1.5 shrink-0">
              {QUICK_PROMPTS.map((prompt, idx) => {
                const Icon = prompt.icon;
                return (
                  <button
                    key={idx}
                    disabled={isTyping}
                    onClick={() => handleSendMessage(prompt.query)}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-blue-50 text-slate-700 hover:text-[#0055FE] rounded-full border border-slate-200/80 text-[10px] sm:text-[11px] font-semibold whitespace-nowrap transition-colors shrink-0 shadow-2xs disabled:opacity-50 cursor-pointer"
                  >
                    <Icon className="w-3 h-3 text-[#0055FE]" />
                    <span>{prompt.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Input Box */}
            <div className="p-2.5 sm:p-3 bg-white border-t border-slate-100 flex items-center gap-2 shrink-0">
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleSendMessage();
                }}
                placeholder="Hỏi về liều lượng, tăng cơ, dinh dưỡng..."
                disabled={isTyping}
                className="flex-1 px-3.5 sm:px-4 py-2 sm:py-2.5 bg-[#F4F7FC] border border-slate-200/80 rounded-full text-base sm:text-xs font-medium text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#0055FE] transition-colors disabled:opacity-60"
              />
              <button
                onClick={() => handleSendMessage()}
                disabled={!inputText.trim() || isTyping}
                className="w-9 h-9 rounded-full bg-[#0055FE] hover:bg-[#0038FF] disabled:bg-slate-200 text-white flex items-center justify-center transition-colors shrink-0 shadow-sm cursor-pointer"
                aria-label="Gửi tin nhắn"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
