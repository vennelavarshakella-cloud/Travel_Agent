import React, { useState, useEffect, useRef } from 'react';
import { 
  Bot, 
  User, 
  Send, 
  Sparkles, 
  Trash2, 
  Copy, 
  Check, 
  Plane, 
  Compass, 
  ShieldCheck, 
  ArrowRight,
  RefreshCw,
  MessageSquare,
  ExternalLink,
  ChevronRight,
  MapPin,
  DollarSign
} from 'lucide-react';
import { TravelFormData } from '../types/travel.ts';

interface ChatMessage {
  id: string;
  sender: 'bot' | 'user';
  text: string;
  timestamp: string;
}

interface ChatbotSectionProps {
  onApplyRouteToForm?: (origin: string, destination: string, budget?: number) => void;
}

const INITIAL_MESSAGES: ChatMessage[] = [
  {
    id: 'init-0',
    sender: 'bot',
    text: 'Hi there! 👋',
    timestamp: 'Just now',
  },
  {
    id: 'init-1',
    sender: 'bot',
    text: 'My name is Nathan. I am your AI travel agent powered directly by the n8n webhook workflow. Ask me about routes, flight options, high-speed rail connections, best travel seasons, or cost estimates!',
    timestamp: 'Just now',
  },
];

const SUGGESTED_QUESTIONS = [
  'Help me plan a 7-day trip to Tokyo on a $3,000 budget for 2 people',
  'What are the best transport options between Paris and Rome?',
  'Recommend a scenic Swiss Alps itinerary with Glacier Express rail',
  'Estimate total trip cost for a 1-week vacation in Bali from London',
];

export const ChatbotSection: React.FC<ChatbotSectionProps> = ({ onApplyRouteToForm }) => {
  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    try {
      const saved = localStorage.getItem('n8n_chat_section_history');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {}
    return INITIAL_MESSAGES;
  });

  const [inputMessage, setInputMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [pingStatus, setPingStatus] = useState<'idle' | 'testing' | 'success' | 'error'>('idle');

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Persistent session ID
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

  // Persist history
  useEffect(() => {
    try {
      localStorage.setItem('n8n_chat_section_history', JSON.stringify(messages));
    } catch {}
  }, [messages]);

  // Scroll to bottom on message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

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
          text: data.output || 'I have analyzed your request.',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };
        setMessages((prev) => [...prev, botMsg]);
      } else {
        const errorMsg: ChatMessage = {
          id: 'err-' + Date.now(),
          sender: 'bot',
          text: data.error || 'Sorry, I encountered an issue communicating with the n8n travel agent. Please try again.',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };
        setMessages((prev) => [...prev, errorMsg]);
      }
    } catch (err: any) {
      const errorMsg: ChatMessage = {
        id: 'err-' + Date.now(),
        sender: 'bot',
        text: 'Network error connecting to the n8n webhook. Please check connectivity.',
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

  const handleClearHistory = () => {
    if (window.confirm('Reset conversation with Nathan?')) {
      const newSid = 'session_' + Math.random().toString(36).substring(2, 9) + '_' + Date.now();
      try {
        localStorage.setItem('n8n_chat_session_id', newSid);
      } catch {}
      sessionIdRef.current = newSid;
      setMessages(INITIAL_MESSAGES);
      try {
        localStorage.removeItem('n8n_chat_section_history');
      } catch {}
    }
  };

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1800);
  };

  const handlePingWebhook = async () => {
    setPingStatus('testing');
    try {
      const res = await fetch('/api/test-n8n');
      const data = await res.json();
      if (res.ok && data.ok) {
        setPingStatus('success');
      } else {
        setPingStatus('error');
      }
    } catch {
      setPingStatus('error');
    }
    setTimeout(() => setPingStatus('idle'), 3000);
  };

  // Extract potential destination / budget mentions to quickly populate the form
  const handleTransferToPlanner = (text: string) => {
    let dest = 'Tokyo, Japan';
    let budget = 3000;

    const lower = text.toLowerCase();
    if (lower.includes('tokyo') || lower.includes('japan')) dest = 'Tokyo, Japan';
    else if (lower.includes('paris') || lower.includes('france')) dest = 'Paris, France';
    else if (lower.includes('rome') || lower.includes('italy')) dest = 'Rome, Italy';
    else if (lower.includes('swiss') || lower.includes('zermatt') || lower.includes('zurich')) dest = 'Zurich, Switzerland';
    else if (lower.includes('bali')) dest = 'Bali, Indonesia';
    else if (lower.includes('dubai')) dest = 'Dubai, UAE';

    const budgetMatch = text.match(/\$?([1-9][0-9]{2,4})/);
    if (budgetMatch) {
      const parsed = parseInt(budgetMatch[1], 10);
      if (parsed >= 300 && parsed <= 50000) budget = parsed;
    }

    if (onApplyRouteToForm) {
      onApplyRouteToForm('San Francisco, USA', dest, budget);
    }
    const plannerEl = document.getElementById('planner-section');
    if (plannerEl) {
      plannerEl.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Markdown formatter
  const renderBotContent = (content: string) => {
    const lines = content.split('\n');
    return (
      <div className="space-y-2 leading-relaxed text-sm">
        {lines.map((line, idx) => {
          if (!line.trim()) return <div key={idx} className="h-1" />;

          if (line.startsWith('### ')) {
            return (
              <h4 key={idx} className="font-serif font-bold text-amber-300 text-base mt-2">
                {line.replace('### ', '')}
              </h4>
            );
          }

          if (line.startsWith('## ')) {
            return (
              <h3 key={idx} className="font-serif font-bold text-stone-100 text-lg mt-3">
                {line.replace('## ', '')}
              </h3>
            );
          }

          if (line.trim() === '---') {
            return <hr key={idx} className="border-stone-800 my-2" />;
          }

          const isBullet = line.trim().startsWith('* ') || line.trim().startsWith('- ') || line.trim().startsWith('• ');
          const lineText = isBullet ? line.trim().replace(/^[\*\-•]\s*/, '') : line;

          const parts = lineText.split(/(\*\*.*?\*\*)/g);
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
              <div key={idx} className="flex items-start gap-2 pl-1.5 text-stone-300">
                <span className="text-amber-400 font-bold shrink-0 mt-0.5">•</span>
                <span className="flex-1">{renderedParts}</span>
              </div>
            );
          }

          return <p key={idx} className="text-stone-300">{renderedParts}</p>;
        })}
      </div>
    );
  };

  return (
    <section id="chatbot-section" className="scroll-mt-20 py-16 bg-stone-950 border-t border-b border-stone-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-10 space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-mono">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>n8n AI Chat Trigger Active</span>
          </div>

          <h2 className="text-3xl sm:text-4xl font-bold font-serif text-stone-100 tracking-tight">
            Consult With Nathan, Your n8n Travel Agent
          </h2>
          <p className="text-sm text-stone-400 leading-relaxed">
            Need advice on route timing, high-speed rail alternatives, regional airports, or budget splits? Ask questions directly to the automated travel agent below.
          </p>
        </div>

        {/* Main Chat Interface Layout: Chat Console (8 cols) + Info & Bridge Panel (4 cols) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left: Interactive Chat Console */}
          <div className="lg:col-span-8 bg-stone-900 border border-stone-800 rounded-2xl overflow-hidden shadow-2xl flex flex-col h-[650px]">
            
            {/* Chat Header */}
            <div className="p-4 bg-stone-950 border-b border-stone-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-amber-700 flex items-center justify-center text-stone-950 shadow-md">
                    <Bot className="w-5 h-5 stroke-[2.2]" />
                  </div>
                  <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-500 border-2 border-stone-950" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-serif font-bold text-base text-stone-100">Nathan</h3>
                    <span className="text-[10px] font-mono px-2 py-0.5 bg-emerald-950/60 border border-emerald-800/80 text-emerald-400 rounded-full">
                      n8n Agent Online
                    </span>
                  </div>
                  <p className="text-xs text-stone-400 font-mono">
                    Endpoint: <code className="text-amber-400/90 font-mono">76c515fa.../chat</code>
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handlePingWebhook}
                  disabled={pingStatus === 'testing'}
                  className="px-2.5 py-1.5 bg-stone-800 hover:bg-stone-700 text-stone-300 text-xs font-mono rounded-lg transition-colors flex items-center gap-1.5"
                  title="Check webhook responsiveness"
                >
                  <RefreshCw className={`w-3 h-3 ${pingStatus === 'testing' ? 'animate-spin' : ''}`} />
                  <span className="hidden sm:inline">
                    {pingStatus === 'testing' ? 'Testing...' : pingStatus === 'success' ? 'Alive (200)' : 'Ping'}
                  </span>
                </button>
                <button
                  type="button"
                  onClick={handleClearHistory}
                  className="p-2 text-stone-400 hover:text-stone-200 hover:bg-stone-800 rounded-lg transition-colors"
                  title="Reset conversation"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Messages Body */}
            <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-4">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex gap-3 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  {msg.sender === 'bot' && (
                    <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center shrink-0 mt-0.5">
                      <Bot className="w-4 h-4" />
                    </div>
                  )}

                  <div
                    className={`max-w-[85%] rounded-2xl p-4 space-y-2 relative group ${
                      msg.sender === 'user'
                        ? 'bg-amber-600 text-stone-950 font-medium rounded-tr-none text-sm'
                        : 'bg-stone-950/80 border border-stone-800 text-stone-200 rounded-tl-none shadow-sm'
                    }`}
                  >
                    {msg.sender === 'bot' ? renderBotContent(msg.text) : <p className="leading-relaxed">{msg.text}</p>}

                    <div className="flex items-center justify-between gap-3 pt-1 border-t border-stone-800/40 text-[11px] font-mono text-stone-500">
                      <span>{msg.timestamp}</span>

                      {msg.sender === 'bot' && (
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => handleCopy(msg.id, msg.text)}
                            className="opacity-0 group-hover:opacity-100 transition-opacity hover:text-stone-300 flex items-center gap-1"
                            title="Copy response"
                          >
                            {copiedId === msg.id ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                            <span>{copiedId === msg.id ? 'Copied' : 'Copy'}</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => handleTransferToPlanner(msg.text)}
                            className="opacity-0 group-hover:opacity-100 transition-opacity text-amber-400 hover:text-amber-300 flex items-center gap-1"
                            title="Apply route to trip form"
                          >
                            <Plane className="w-3 h-3" />
                            <span>Use in Form</span>
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  {msg.sender === 'user' && (
                    <div className="w-8 h-8 rounded-lg bg-stone-800 text-stone-300 flex items-center justify-center shrink-0 mt-0.5">
                      <User className="w-4 h-4" />
                    </div>
                  )}
                </div>
              ))}

              {/* Typing state */}
              {loading && (
                <div className="flex gap-3 items-start">
                  <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
                    <Bot className="w-4 h-4 animate-pulse" />
                  </div>
                  <div className="bg-stone-950/80 border border-stone-800 rounded-2xl rounded-tl-none p-4 text-xs text-stone-400 space-y-1">
                    <div className="flex items-center gap-2 text-amber-400">
                      <span className="w-2 h-2 rounded-full bg-amber-400 animate-bounce" />
                      <span className="w-2 h-2 rounded-full bg-amber-400 animate-bounce [animation-delay:0.2s]" />
                      <span className="w-2 h-2 rounded-full bg-amber-400 animate-bounce [animation-delay:0.4s]" />
                      <span className="text-xs font-mono ml-1 text-stone-300">
                        Nathan is querying transport databases and drafting response...
                      </span>
                    </div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Quick Prompt Chips */}
            <div className="px-4 py-2.5 bg-stone-950/60 border-t border-stone-800/80 flex items-center gap-2 overflow-x-auto">
              <span className="text-[10px] font-mono uppercase text-stone-500 shrink-0">Prompts:</span>
              {SUGGESTED_QUESTIONS.map((q, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleSendMessage(q)}
                  disabled={loading}
                  className="shrink-0 text-xs px-2.5 py-1 bg-stone-900 hover:bg-stone-800 text-stone-300 hover:text-amber-300 border border-stone-800 rounded-lg transition-colors truncate max-w-xs"
                >
                  {q}
                </button>
              ))}
            </div>

            {/* Input Bar */}
            <div className="p-4 bg-stone-950 border-t border-stone-800">
              <div className="flex items-end gap-3">
                <textarea
                  ref={textareaRef}
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Ask Nathan anything about routes, train passes, airfares, or budgeting..."
                  rows={2}
                  disabled={loading}
                  className="w-full bg-stone-900 border border-stone-700/80 rounded-xl px-4 py-3 text-sm text-stone-100 placeholder:text-stone-500 focus:outline-none focus:border-amber-500 resize-none max-h-32 transition-colors disabled:opacity-50"
                />
                <button
                  type="button"
                  onClick={() => handleSendMessage()}
                  disabled={!inputMessage.trim() || loading}
                  className="px-5 py-3.5 bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-stone-950 font-semibold text-xs rounded-xl transition-all shadow-md flex items-center gap-2 shrink-0 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <span>Send</span>
                  <Send className="w-4 h-4" />
                </button>
              </div>

              <div className="flex items-center justify-between text-[11px] text-stone-500 font-mono mt-2">
                <span>Press Enter to send · Shift+Enter for newline</span>
                <span>Direct n8n AI Chatbot Pipeline</span>
              </div>
            </div>

          </div>

          {/* Right: Agent Capabilities & Sync with Planner */}
          <div className="lg:col-span-4 space-y-6">
            
            {/* Agent Profile Card */}
            <div className="bg-stone-900 border border-stone-800 rounded-2xl p-6 space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center">
                  <Compass className="w-6 h-6 stroke-[2]" />
                </div>
                <div>
                  <h3 className="font-serif font-bold text-lg text-stone-100">About Nathan</h3>
                  <p className="text-xs text-stone-400 font-mono">Automated Travel Specialist</p>
                </div>
              </div>

              <p className="text-xs text-stone-300 leading-relaxed">
                Nathan is configured in your n8n workflow with domain knowledge across global transit corridors, high-speed rail itineraries (JR Shinkansen, Eurostar, Frecciarossa, TGV), multi-city flight routes, and seasonal pricing.
              </p>

              <div className="border-t border-stone-800/80 pt-4 space-y-2 text-xs font-mono text-stone-400">
                <div className="flex items-center justify-between">
                  <span>Webhook Mode:</span>
                  <span className="text-emerald-400">Production POST</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Instance ID:</span>
                  <span className="text-stone-300 font-mono">ac00ef61...</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Session Memory:</span>
                  <span className="text-stone-300">Contextual Active</span>
                </div>
              </div>
            </div>

            {/* Transfer to Form Promo */}
            <div className="bg-gradient-to-br from-amber-950/40 via-stone-900 to-stone-900 border border-amber-500/30 rounded-2xl p-6 space-y-3">
              <span className="text-xs font-mono uppercase tracking-wider text-amber-400 font-semibold block">
                Workflow Synergy
              </span>
              <h4 className="text-base font-bold font-serif text-stone-100">
                Found your ideal itinerary?
              </h4>
              <p className="text-xs text-stone-300 leading-relaxed">
                You can transfer your destination and planned budget directly from this conversation into the formal 9-field n8n trip configurator below to generate your official booking inquiry.
              </p>

              <a
                href="#planner-section"
                className="inline-flex items-center gap-2 px-4 py-2.5 bg-amber-600 hover:bg-amber-500 text-stone-950 font-semibold text-xs rounded-xl transition-all shadow-sm"
              >
                <span>Go to Trip Configurator Form</span>
                <ArrowRight className="w-4 h-4" />
              </a>
            </div>

            {/* Direct Webhook URL Box */}
            <div className="bg-stone-900 border border-stone-800 rounded-2xl p-5 space-y-2 text-xs">
              <span className="text-[11px] font-mono uppercase tracking-wider text-stone-400 block">
                Target Webhook URL
              </span>
              <div className="p-2.5 bg-stone-950 border border-stone-800/80 rounded-lg font-mono text-[11px] text-amber-400 break-all select-all">
                https://vennela0811.app.n8n.cloud/webhook/76c515fa-5e07-4c05-bf40-92cb512b41d8/chat
              </div>
              <a
                href="https://vennela0811.app.n8n.cloud/webhook/76c515fa-5e07-4c05-bf40-92cb512b41d8/chat"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 text-[11px] text-stone-400 hover:text-amber-400 transition-colors pt-1"
              >
                <span>Open direct n8n endpoint</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>

          </div>

        </div>

      </div>
    </section>
  );
};
