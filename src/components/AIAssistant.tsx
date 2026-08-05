import React, { useState, useRef, useEffect } from 'react';
import { Bot, X, Send, Sparkles } from 'lucide-react';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

const QUICK_PROMPTS = ['Explain this topic', 'Give a mnemonic', 'Key exam points', 'Quiz me'];

const getAutoResponse = (text: string): string => {
  const lower = text.toLowerCase();
  if (lower.includes('quiz') || lower.includes('test me') || lower.includes('question'))
    return "Here's a quick MCQ:\n\nWhich enzyme converts angiotensin I → angiotensin II?\n\nA) Renin\nB) ACE (Angiotensin-Converting Enzyme)\nC) Aldosterone synthase\nD) Neprilysin\n\nAnswer: **B — ACE**, found mainly in pulmonary endothelium.";
  if (lower.includes('mnemonic') || lower.includes('remember') || lower.includes('trick'))
    return 'Cranial nerves mnemonic:\n"Oh Oh Oh To Touch And Feel Very Good Velvet AH"\nI–Olfactory, II–Optic, III–Oculomotor, IV–Trochlear, V–Trigeminal, VI–Abducens, VII–Facial, VIII–Vestibulocochlear, IX–Glossopharyngeal, X–Vagus, XI–Accessory, XII–Hypoglossal';
  if (lower.includes('explain') || lower.includes('what is') || lower.includes('how'))
    return "I'd love to explain that! Which topic? Try: anatomy, physiology, biochemistry, pathology, pharmacology, or microbiology. Be specific (e.g. 'explain action potential') for the best answer.";
  if (lower.includes('exam') || lower.includes('tips') || lower.includes('study'))
    return "Top MBBS exam tips:\n• **Spaced repetition** — review at day 1, 3, 7, 30\n• **Active recall** — close the book, write from memory\n• **Clinical links** — connect every concept to a case\n• **MCQ pattern** — elimination > guessing\n• **High-yield topics** — focus on frequently-tested chapters first";
  return "Good question! For the most helpful answer, try:\n• 'Explain [topic name]'\n• 'Give a mnemonic for [topic]'\n• 'Quiz me on [subject]'\n• 'Exam tips for [paper]'\n\nI'm your on-call study companion. 📖";
};

export const AIAssistant: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { id: '1', role: 'assistant', content: "Hi! I'm your AI study assistant, always on call. Ask me to explain topics, create mnemonics, or quiz you on any MBBS subject. 🧠" }
  ]);
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = (text?: string) => {
    const content = (text ?? input).trim();
    if (!content) return;
    setMessages(prev => [...prev, { id: Date.now().toString(), role: 'user', content }]);
    setInput('');
    setTimeout(() => {
      setMessages(prev => [...prev, { id: (Date.now() + 1).toString(), role: 'assistant', content: getAutoResponse(content) }]);
    }, 500);
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

      <div className={`fixed bottom-6 right-6 z-50 w-80 sm:w-96 rounded-2xl border border-amber-500/20 bg-[#161b22] shadow-2xl shadow-black/60 flex flex-col overflow-hidden transition-all duration-300 origin-bottom-right ${isOpen ? 'scale-100 opacity-100' : 'scale-90 opacity-0 pointer-events-none'}`} style={{ height: 480 }}>
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 bg-amber-500/10 border-b border-amber-500/20 flex-shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-full bg-amber-500 flex items-center justify-center flex-shrink-0">
              <Bot className="w-4 h-4 text-white" />
            </div>
            <div>
              <div className="text-sm font-semibold text-amber-300">AI Study Assistant</div>
              <div className="flex items-center gap-1.5 text-[10px] text-amber-500/70">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block" />
                Always on call
              </div>
            </div>
          </div>
          <button onClick={() => setIsOpen(false)} className="p-1 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Quick prompts */}
        <div className="flex gap-2 px-3 py-2 overflow-x-auto border-b border-[#30363d] flex-shrink-0 scrollbar-hide">
          {QUICK_PROMPTS.map((p) => (
            <button key={p} onClick={() => sendMessage(p)} className="flex-shrink-0 text-xs px-2.5 py-1.5 rounded-full border border-[#30363d] text-slate-400 hover:text-amber-300 hover:border-amber-500/40 transition whitespace-nowrap">
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
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="flex gap-2 px-3 py-3 border-t border-[#30363d] flex-shrink-0">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
            placeholder="Ask me anything..."
            className="flex-1 bg-[#21262d] border border-[#30363d] rounded-xl px-3 py-2 text-xs text-white placeholder:text-slate-500 outline-none focus:border-amber-500/50"
          />
          <button onClick={() => sendMessage()} className="w-8 h-8 rounded-xl bg-amber-500 hover:bg-amber-400 flex items-center justify-center transition flex-shrink-0">
            <Send className="w-3.5 h-3.5 text-white" />
          </button>
        </div>
      </div>
    </>
  );
};
