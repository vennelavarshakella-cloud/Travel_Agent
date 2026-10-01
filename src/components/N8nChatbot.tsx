import React, { useState, useEffect, useRef } from 'react';
import { 
  MessageSquare, 
  X, 
  Send, 
  Bot, 
  User, 
  Sparkles, 
  Trash2, 
  Minimize2, 
  Maximize2, 
  Compass, 
  ArrowRight,
  ExternalLink,
  Copy,
  Check,
  Plane
} from 'lucide-react';

interface ChatMessage {
  id: string;
  sender: 'bot' | 'user';
  text: string;
  timestamp: string;
}

interface N8nChatbotProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  onApplyItineraryToForm?: (destination: string, budget?: number) => void;
}

const INITIAL_MESSAGES: ChatMessage[] = [
  {
    id: 'msg-0',
    sender: 'bot',
    text: 'Hi there! 👋',
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
  },
  {
    id: 'msg-1',
    sender: 'bot',
    text: 'My name is Nathan, your personal n8n travel agent. How can I assist you with your routes, dates, transport options, or trip costs today?',
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
  },
];

const SUGGESTED_PROMPTS = [
  'Help me plan a 7-day trip to Tokyo on a $3,000 budget for 2 people',
  'What are the best transport options between Paris and Rome?',
  'Suggest a luxury mountain getaway with scenic rail in Switzerland',
  'Can you estimate total costs for a 1-week trip to Bali?',
];

export const N8nChatbot: React.FC<N8nChatbotProps> = ({
  isOpen,
  setIsOpen,
  onApplyItineraryToForm,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    try {
      const saved = localStorage.getItem('n8n_chat_history');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {}
    return INITIAL_MESSAGES;
  });

  const [inputMessage, setInputMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [unreadCount, setUnreadCount] = useState(0);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Session ID management
  const sessionIdRef = useRef<string>('');
  if (!sessionIdRef.current) {
    let sid = typeof window !== 'undefined' ? localStorage.getItem('n8n_chat_session_id') : null;
    if (!sid) {
      sid = 'session_' + Math.random().toString(36).substring(2, 9) + '_' + Date.now();
      try {
        localStorage.setItem('n8n_chat_session_id', sid);
      } catch {}
    }
    sessionIdRef.current = sid;
  }

  // Save messages to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('n8n_chat_history', JSON.stringify(messages));
    } catch {}
  }, [messages]);

  // Scroll to bottom when messages update
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, loading, isOpen]);

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      setUnreadCount(0);
      setTimeout(() => inputRef.current?.focus(), 150);
    }
  }, [isOpen]);

  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || inputMessage).trim();
    if (!text || loading) return;

    const userMsg: ChatMessage = {
      id: 'usr-' + Date.now(),
      sender: 'user',
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputMessage('');
    setLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text,
          sessionId: sessionIdRef.current,
        }),
      });

      const data = await response.json();

      if (response.ok && data.ok) {
        const botMsg: ChatMessage = {
          id: 'bot-' + Date.now(),
          sender: 'bot',
          text: data.output || 'I have processed your request.',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };
        setMessages((prev) => [...prev, botMsg]);
        if (!isOpen) {
          setUnreadCount((c) => c + 1);
        }
      } else {
        const errorMsg: ChatMessage = {
          id: 'err-' + Date.now(),
          sender: 'bot',
          text: data.error || 'Sorry, I encountered an issue connecting to the n8n travel agent. Please try again.',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };
        setMessages((prev) => [...prev, errorMsg]);
      }
    } catch (err: any) {
      const errorMsg: ChatMessage = {
        id: 'err-' + Date.now(),
        sender: 'bot',
        text: 'Network error connecting to the n8n chatbot. Please verify the endpoint is reachable.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleClearChat = () => {
    if (window.confirm('Reset conversation history with Nathan?')) {
      const newSid = 'session_' + Math.random().toString(36).substring(2, 9) + '_' + Date.now();
      localStorage.setItem('n8n_chat_session_id', newSid);
      sessionIdRef.current = newSid;
      setMessages(INITIAL_MESSAGES);
      localStorage.removeItem('n8n_chat_history');
    }
  };

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1800);
  };

  // Render markdown-like formatting (bolding, lists, linebreaks)
  const formatBotText = (text: string) => {
    const lines = text.split('\n');
    return (
      <div className="space-y-1.5 leading-relaxed text-xs">
        {lines.map((line, idx) => {
          if (!line.trim()) {
            return <div key={idx} className="h-1.5" />;
          }

          // Bullet points
          const isBullet = line.trim().startsWith('* ') || line.trim().startsWith('- ') || line.trim().startsWith('• ');
          const lineContent = isBullet ? line.trim().replace(/^[\*\-•]\s*/, '') : line;

          // Format bold text **text**
          const parts = lineContent.split(/(\*\*.*?\*\*)/g);
          const renderedParts = parts.map((part, pIdx) => {
            if (part.startsWith('**') && part.endsWith('**')) {
              return (
                <strong key={pIdx} className="font-semibold text-stone-100">
                  {part.slice(2, -2)}
                </strong>
              );
            }
            return part;
          });

          if (isBullet) {
            return (
              <div key={idx} className="flex items-start gap-2 pl-1">
                <span className="text-amber-400 mt-0.5">•</span>
                <span className="flex-1">{renderedParts}</span>
              </div>
            );
          }

          return <p key={idx}>{renderedParts}</p>;
        })}
      </div>
    );
  };

  return (
    <>
      {/* Floating Launcher Button (when closed) */}
      {!isOpen && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 animate-in fade-in slide-in-from-bottom-4 duration-300">
          <div className="hidden sm:flex items-center gap-2 bg-stone-900/95 border border-stone-800 backdrop-blur shadow-xl rounded-full py-2 px-3.5 text-xs text-stone-200">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>Chat with Nathan</span>
            <span className="text-[10px] font-mono text-amber-400 bg-amber-500/10 px-1.5 py-0.5 rounded">n8n AI</span>
          </div>

          <button
            onClick={() => setIsOpen(true)}
            className="relative w-14 h-14 rounded-full bg-gradient-to-tr from-amber-600 via-amber-500 to-amber-600 text-stone-950 flex items-center justify-center shadow-2xl hover:scale-105 active:scale-95 transition-all group"
            aria-label="Open n8n Travel Agent Chat"
          >
            <Bot className="w-7 h-7 stroke-[2.2] group-hover:rotate-12 transition-transform duration-300" />
            
            {/* Unread badge */}
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-rose-500 text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center border-2 border-stone-900">
                {unreadCount}
              </span>
            )}

            {/* Online beacon */}
            <span className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-emerald-500 border-2 border-stone-900 rounded-full" />
          </button>
        </div>
      )}

      {/* Expanded Chat Window */}
      {isOpen && (
        <div
          className={`fixed z-50 bg-stone-900 border border-stone-800 shadow-2xl backdrop-blur-xl flex flex-col transition-all duration-200 ${
            isExpanded
              ? 'inset-4 sm:inset-10 rounded-2xl'
              : 'bottom-4 right-4 sm:bottom-6 sm:right-6 w-[calc(100vw-2rem)] sm:w-[420px] h-[580px] max-h-[85vh] rounded-2xl'
          }`}
        >
          {/* Header */}
          <div className="p-4 bg-stone-950/90 border-b border-stone-800 rounded-t-2xl flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-500 to-amber-700 flex items-center justify-center text-stone-950">
                  <Bot className="w-5 h-5 stroke-[2.2]" />
                </div>
                <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-stone-950" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h3 className="font-serif font-bold text-sm text-stone-100">Nathan</h3>
                  <span className="text-[10px] font-mono px-1.5 py-0.2 bg-amber-500/10 text-amber-300 rounded border border-amber-500/20">
                    n8n Agent
                  </span>
                </div>
                <p className="text-[11px] text-stone-400 font-mono">
                  Online · Travel Route & Cost Advisor
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1 text-stone-400">
              <button
                onClick={handleClearChat}
                className="p-1.5 hover:text-stone-200 hover:bg-stone-800 rounded-lg transition-colors"
                title="Reset conversation"
              >
                <Trash2 className="w-4 h-4" />
              </button>
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="p-1.5 hover:text-stone-200 hover:bg-stone-800 rounded-lg transition-colors hidden sm:block"
                title={isExpanded ? 'Restore size' : 'Expand window'}
              >
                {isExpanded ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 hover:text-stone-200 hover:bg-stone-800 rounded-lg transition-colors"
                title="Close chat"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Messages Body */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-2.5 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {msg.sender === 'bot' && (
                  <div className="w-7 h-7 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center shrink-0 mt-0.5">
                    <Bot className="w-4 h-4" />
                  </div>
                )}

                <div
                  className={`max-w-[85%] rounded-2xl p-3.5 space-y-1 relative group ${
                    msg.sender === 'user'
                      ? 'bg-amber-600 text-stone-950 font-medium rounded-tr-none text-xs leading-relaxed'
                      : 'bg-stone-950/80 border border-stone-800/80 text-stone-200 rounded-tl-none'
                  }`}
                >
                  {msg.sender === 'bot' ? formatBotText(msg.text) : <p className="text-xs">{msg.text}</p>}

                  <div className="flex items-center justify-between gap-2 pt-1 border-t border-stone-800/40 text-[10px] font-mono text-stone-500">
                    <span>{msg.timestamp}</span>
                    {msg.sender === 'bot' && (
                      <button
                        onClick={() => handleCopy(msg.id, msg.text)}
                        className="opacity-0 group-hover:opacity-100 transition-opacity hover:text-stone-300 flex items-center gap-1"
                        title="Copy message"
                      >
                        {copiedId === msg.id ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                        <span>{copiedId === msg.id ? 'Copied' : 'Copy'}</span>
                      </button>
                    )}
                  </div>
                </div>

                {msg.sender === 'user' && (
                  <div className="w-7 h-7 rounded-lg bg-stone-800 text-stone-300 flex items-center justify-center shrink-0 mt-0.5">
                    <User className="w-4 h-4" />
                  </div>
                )}
              </div>
            ))}

            {/* Loading Indicator */}
            {loading && (
              <div className="flex gap-2.5 items-start">
                <div className="w-7 h-7 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
                  <Bot className="w-4 h-4 animate-pulse" />
                </div>
                <div className="bg-stone-950/80 border border-stone-800/80 rounded-2xl rounded-tl-none p-3.5 text-xs text-stone-400 space-y-1">
                  <div className="flex items-center gap-1.5 text-amber-400">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-bounce" />
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-bounce [animation-delay:0.2s]" />
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-bounce [animation-delay:0.4s]" />
                    <span className="text-[11px] font-mono ml-1 text-stone-400">Nathan is researching routes & costs...</span>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Quick Prompts (visible if fewer than 4 messages or user hasn't sent much) */}
          {messages.length <= 3 && !loading && (
            <div className="px-4 py-2 border-t border-stone-800/60 bg-stone-950/40">
              <span className="text-[10px] font-mono uppercase text-stone-500 block mb-1.5">
                Suggested Questions:
              </span>
              <div className="flex flex-col gap-1 max-h-24 overflow-y-auto">
                {SUGGESTED_PROMPTS.map((prompt, i) => (
                  <button
                    key={i}
                    onClick={() => handleSendMessage(prompt)}
                    className="text-left text-[11px] text-stone-300 hover:text-amber-300 hover:bg-stone-800/60 p-1.5 rounded-md transition-colors truncate"
                  >
                    • {prompt}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Input Bar */}
          <div className="p-3 bg-stone-950 border-t border-stone-800 rounded-b-2xl">
            <div className="relative flex items-end gap-2">
              <textarea
                ref={inputRef}
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask Nathan anything about routes, flights, or budgets..."
                rows={1}
                disabled={loading}
                className="w-full bg-stone-900 border border-stone-700/80 rounded-xl px-3.5 py-2.5 text-xs text-stone-100 placeholder:text-stone-500 focus:outline-none focus:border-amber-500 resize-none max-h-24 min-h-[40px] transition-colors disabled:opacity-50"
              />
              <button
                type="button"
                onClick={() => handleSendMessage()}
                disabled={!inputMessage.trim() || loading}
                className="p-2.5 bg-amber-600 hover:bg-amber-500 disabled:opacity-40 disabled:hover:bg-amber-600 text-stone-950 rounded-xl transition-colors shrink-0 shadow-sm"
                aria-label="Send message"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
            <div className="flex items-center justify-between mt-2 text-[10px] text-stone-500 font-mono">
              <span>Enter to send · Shift+Enter for newline</span>
              <span>Webhook: 76c515fa.../chat</span>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
