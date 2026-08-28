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

const INITIAL_MSG: Message = {
  id: 'welcome',
  sender: 'ai',
  text: 'Chào bạn! Mình là **AI Coach W4U** 🤖⚡️\n\nBạn đang có mục tiêu tăng cơ, tăng sức mạnh hay cần tư vấn thực phẩm bổ sung nào hôm nay?',
};

const CHAT_STORAGE_KEY = 'w4u_ai_chat_session_history';

export function AIAdvisorWidget() {
  const { setQuickViewProduct, addToCart } = useCart();
  const [isOpen, setIsOpen] = useState(false);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [messages, setMessages] = useState<Message[]>([INITIAL_MSG]);
  const [hasHydrated, setHasHydrated] = useState(false);
  const [addedId, setAddedId] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Khôi phục cache khi refresh trang
  useEffect(() => {
    try {
      const saved = sessionStorage.getItem(CHAT_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const cleanHistory = parsed.map((m: Message) => ({ ...m, isStreaming: false }));
          setMessages(cleanHistory);
        }
      }
    } catch {
      // Ignore parse error
    } finally {
      setHasHydrated(true);
    }
  }, []);

  // Tự động lưu cache sessionStorage
  useEffect(() => {
    if (!hasHydrated) return;
    try {
      if (messages.length === 1 && messages[0].id === 'welcome') {
        sessionStorage.removeItem(CHAT_STORAGE_KEY);
      } else {
        sessionStorage.setItem(CHAT_STORAGE_KEY, JSON.stringify(messages));
      }
    } catch {
      // Ignore quota error
    }
  }, [messages, hasHydrated]);

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isTyping, isOpen]);

  const handleResetChat = () => {
    try {
      sessionStorage.removeItem(CHAT_STORAGE_KEY);
    } catch {}
    setMessages([INITIAL_MSG]);
  };

  const handleAddToCart = (e: React.MouseEvent, product: Product) => {
    e.stopPropagation();
    addToCart(product, 1, product.flavors?.[0], product.sizes?.[0]);
    setAddedId(product.id);
    setTimeout(() => setAddedId(null), 1800);
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
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: newMessages.map((m) => ({
            role: m.sender === 'ai' ? 'assistant' : 'user',
            content: m.text,
          })),
        }),
      });

      if (!res.ok || !res.body) {
        throw new Error('Lỗi kết nối');
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
                          suggestedProducts: data.suggestedProducts || (data.suggestedProduct ? [data.suggestedProduct] : undefined),
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
                text: 'Xin lỗi bạn, mạng đang chập chờn. Bạn vui lòng thử lại câu hỏi nhé!',
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
    <>
      {/* Floating Modern AI Trigger Button */}
      <div className="fixed bottom-6 left-6 z-40">
        <motion.button
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.96 }}
          onClick={() => setIsOpen(!isOpen)}
          className="group flex items-center gap-2.5 bg-slate-950 hover:bg-[#0055FE] text-white pl-4 pr-5 py-3 rounded-full shadow-xl shadow-slate-950/20 border border-slate-800 transition-colors duration-300 select-none cursor-pointer"
          aria-label="Mở AI Coach tư vấn"
        >
          <div className="relative flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-[#00D2FF] group-hover:text-white transition-colors" />
            <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-emerald-400 animate-ping opacity-75" />
            <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-emerald-400" />
          </div>

          <div className="text-left">
            <p className="text-xs font-black tracking-tight leading-none">
              AI Coach W4U
            </p>
            <p className="text-[9px] text-slate-400 group-hover:text-blue-100 transition-colors font-medium">
              Tư vấn thể hình 24/7
            </p>
          </div>
        </motion.button>
      </div>

      {/* Compact Minimalist Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 15, scale: 0.95 }}
            transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
            className="fixed bottom-20 left-6 z-50 w-[92vw] sm:w-[400px] max-w-[420px] h-[540px] bg-white/95 backdrop-blur-2xl rounded-3xl shadow-2xl border border-slate-200/80 flex flex-col overflow-hidden select-none"
          >
            {/* Minimalist Header */}
            <div className="px-5 py-4 bg-slate-950 text-white flex items-center justify-between border-b border-slate-800 shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-[#0055FE] flex items-center justify-center text-white shadow-sm">
                  <Bot className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-xs font-black uppercase tracking-wider font-display flex items-center gap-1.5">
                    <span>W4U AI Coach</span>
                  </h3>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                    <span className="text-[10px] text-slate-400 font-medium">
                      Trực tuyến • Tư vấn tức thì
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
                  onClick={() => setIsOpen(false)}
                  className="p-1.5 text-slate-400 hover:text-white rounded-full hover:bg-white/10 transition-colors cursor-pointer"
                  aria-label="Đóng"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs">
              {messages.map((msg) => {
                const isAI = msg.sender === 'ai';
                if (isAI && !msg.text && msg.isStreaming) {
                  return (
                    <div key={msg.id} className="flex items-center gap-2 p-3 bg-[#F4F7FC] rounded-2xl w-24 border border-slate-100">
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
                      className={`max-w-[90%] px-4 py-3 rounded-2xl ${
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
                        msg.suggestedProducts || (msg.suggestedProduct ? [msg.suggestedProduct] : []);
                      if (productsToRender.length === 0) return null;

                      return (
                        <div className="mt-2.5 w-full max-w-full">
                          {productsToRender.length > 1 && (
                            <div className="flex items-center justify-between text-[10px] font-bold text-slate-500 mb-1.5 px-1">
                              <span className="flex items-center gap-1 text-slate-700">
                                <Sparkles className="w-3 h-3 text-[#0055FE]" />
                                <span>Gợi ý {productsToRender.length} sản phẩm</span>
                              </span>
                              <span className="text-[#0055FE] text-[9px] font-medium flex items-center gap-0.5">
                                Cuộn sang 👉
                              </span>
                            </div>
                          )}

                          <div className="w-full overflow-x-auto no-scrollbar flex items-stretch gap-2.5 pb-1 snap-x snap-mandatory">
                            {productsToRender.map((prod) => (
                              <motion.div
                                key={prod.id}
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ duration: 0.25 }}
                                className={`${
                                  productsToRender.length === 1
                                    ? 'w-full max-w-[95%]'
                                    : 'w-[235px] sm:w-[250px]'
                                } shrink-0 snap-start bg-white p-3 rounded-2xl border border-blue-200/90 shadow-sm hover:shadow-md transition-all flex flex-col justify-between`}
                              >
                                <div className="flex items-center gap-2.5">
                                  <img
                                    src={prod.image}
                                    alt={prod.name}
                                    className="w-12 h-12 object-contain bg-slate-50 rounded-xl p-1 shrink-0 border border-slate-100"
                                  />
                                  <div className="flex-1 min-w-0">
                                    <span className="inline-block px-1.5 py-0.2 bg-blue-50 text-[#0055FE] text-[9px] font-black uppercase rounded mb-0.5">
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

                                <div className="mt-2.5 pt-2 border-t border-slate-100">
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
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-blue-50 text-slate-700 hover:text-[#0055FE] rounded-full border border-slate-200/80 text-[11px] font-semibold whitespace-nowrap transition-colors shrink-0 shadow-2xs disabled:opacity-50 cursor-pointer"
                  >
                    <Icon className="w-3 h-3 text-[#0055FE]" />
                    <span>{prompt.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Input Box */}
            <div className="p-3 bg-white border-t border-slate-100 flex items-center gap-2 shrink-0">
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleSendMessage();
                }}
                placeholder="Hỏi về liều lượng, tăng cơ, dinh dưỡng..."
                disabled={isTyping}
                className="flex-1 px-4 py-2.5 bg-[#F4F7FC] border border-slate-200/80 rounded-full text-xs font-medium text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#0055FE] transition-colors disabled:opacity-60"
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
    </>
  );
}
