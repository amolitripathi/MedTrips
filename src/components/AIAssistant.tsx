import React, { useState, useRef, useEffect } from 'react';
import { Bot, X, Send, Sparkles, Loader2 } from 'lucide-react';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

const SYSTEM_PROMPT = 'You are an expert MBBS medical education assistant. Help students with anatomy, physiology, biochemistry, pathology, pharmacology, microbiology, and all clinical subjects. Be concise, clear, and educational. Use mnemonics when helpful. Focus on MBBS and NEET PG curriculum. Format responses clearly with line breaks.';

const QUICK_PROMPTS = ['Explain this topic', 'Give a mnemonic', 'Key exam points', 'Quiz me'];

export const AIAssistant: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { id: '1', role: 'assistant', content: "Hi! I'm your AI study assistant, connected live. Ask me anything about MBBS. 🧠" }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const sendMessage = async (text?: string) => {
    const content = (text ?? input).trim();
    if (!content || isLoading) return;

    const userMsg: Message = { id: Date.now().toString(), role: 'user', content };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);
    abortRef.current = new AbortController();

    try {
      const history = [...messages.slice(-5), userMsg].map((m) => ({ role: m.role, content: m.content }));

      const response = await fetch('https://text.pollinations.ai/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: abortRef.current.signal,
        body: JSON.stringify({
          messages: [{ role: 'system', content: SYSTEM_PROMPT }, ...history],
          model: 'openai',
          seed: -1,
          stream: false,
        }),
      });

      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const text = await response.text();
      setMessages((prev) => [...prev, { id: (Date.now() + 1).toString(), role: 'assistant', content: text || 'Sorry, could not generate a response. Try again.' }]);
    } catch (err: any) {
      if (err.name === 'AbortError') return;
      setMessages((prev) => [...prev, { id: (Date.now() + 1).toString(), role: 'assistant', content: 'Connection error. The AI service is free but may be momentarily busy — please retry.' }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className={`fixed bottom-6 right-6 z-50 flex items-center gap-2 px-4 py-3 rounded-full bg-amber-500 hover:bg-amber-400 text-white font-semibold text-sm shadow-lg shadow-amber-500/30 transition-all duration-200 ${isOpen ? 'scale-0 opacity-0' : 'scale-100 opacity-100'}`}
      >
        <Sparkles className="w-4 h-4" />
        AI Assistant
      </button>

      <div
        className={`fixed bottom-6 right-6 z-50 w-80 sm:w-96 rounded-2xl border border-amber-500/20 bg-[#161b22] shadow-2xl shadow-black/60 flex flex-col overflow-hidden transition-all duration-300 origin-bottom-right ${isOpen ? 'scale-100 opacity-100' : 'scale-90 opacity-0 pointer-events-none'}`}
        style={{ height: 500 }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 bg-amber-500/10 border-b border-amber-500/20 flex-shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-full bg-amber-500 flex items-center justify-center flex-shrink-0">
              <Bot className="w-4 h-4 text-white" />
            </div>
            <div>
              <div className="text-sm font-semibold text-amber-300">AI Study Assistant</div>
              <div className="flex items-center gap-1.5 text-[10px] text-amber-500/70">
                <span className={`w-1.5 h-1.5 rounded-full inline-block ${isLoading ? 'bg-amber-400 animate-pulse' : 'bg-emerald-400'}`} />
                {isLoading ? 'Thinking...' : 'Live · Always on call'}
              </div>
            </div>
          </div>
          <button
            onClick={() => { setIsOpen(false); abortRef.current?.abort(); }}
            className="p-1 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Quick prompts */}
        <div className="flex gap-2 px-3 py-2 overflow-x-auto border-b border-[#30363d] flex-shrink-0">
          {QUICK_PROMPTS.map((p) => (
            <button
              key={p}
              onClick={() => sendMessage(p)}
              disabled={isLoading}
              className="flex-shrink-0 text-xs px-2.5 py-1.5 rounded-full border border-[#30363d] text-slate-400 hover:text-amber-300 hover:border-amber-500/40 disabled:opacity-50 transition whitespace-nowrap"
            >
              {p}
            </button>
          ))}
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-3 py-3 space-y-3">
          {messages.map((msg) => (
            <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} gap-2`}>
              {msg.role === 'assistant' && (
                <div className="w-5 h-5 rounded-full bg-amber-500/20 border border-amber-500/30 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Bot className="w-3 h-3 text-amber-400" />
                </div>
              )}
              <div className={`max-w-[82%] rounded-xl px-3 py-2 text-xs leading-relaxed whitespace-pre-wrap ${
                msg.role === 'user'
                  ? 'bg-amber-500/20 text-amber-100 border border-amber-500/20'
                  : 'bg-[#21262d] text-slate-200 border border-[#30363d]'
              }`}>
                {msg.content}
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex justify-start gap-2">
              <div className="w-5 h-5 rounded-full bg-amber-500/20 border border-amber-500/30 flex items-center justify-center flex-shrink-0">
                <Bot className="w-3 h-3 text-amber-400" />
              </div>
              <div className="bg-[#21262d] border border-[#30363d] rounded-xl px-3 py-2 flex items-center gap-2">
                <Loader2 className="w-3 h-3 text-amber-400 animate-spin" />
                <span className="text-xs text-slate-400">Generating response...</span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="flex gap-2 px-3 py-3 border-t border-[#30363d] flex-shrink-0">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && sendMessage()}
            placeholder="Ask anything about MBBS..."
            disabled={isLoading}
            className="flex-1 bg-[#21262d] border border-[#30363d] rounded-xl px-3 py-2 text-xs text-white placeholder:text-slate-500 outline-none focus:border-amber-500/50 disabled:opacity-60"
          />
          <button
            onClick={() => sendMessage()}
            disabled={isLoading || !input.trim()}
            className="w-8 h-8 rounded-xl bg-amber-500 hover:bg-amber-400 disabled:opacity-40 flex items-center justify-center transition flex-shrink-0"
          >
            {isLoading ? <Loader2 className="w-3.5 h-3.5 text-white animate-spin" /> : <Send className="w-3.5 h-3.5 text-white" />}
          </button>
        </div>
      </div>
    </>
  );
};
