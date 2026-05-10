import { useState, useEffect, useRef } from 'react';
import { aiAPI } from '../../api/ai.api';
import { studentAPI } from '../../api/student.api';
import { FaPaperPlane, FaRobot, FaUser, FaPlus, FaHistory } from 'react-icons/fa';
import { motion } from 'framer-motion';

export default function AIChatPage() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [convId, setConvId] = useState(null);
  const [profile, setProfile] = useState(null);
  const [conversations, setConversations] = useState([]);
  const [showHistory, setShowHistory] = useState(false);
  const chatRef = useRef(null);

  useEffect(() => {
    const load = async () => {
      try {
        const [p, c] = await Promise.all([
          studentAPI.getProfile().catch(() => null),
          aiAPI.getConversations().catch(() => ({ data: [] })),
        ]);
        if (p) setProfile(p.data);
        setConversations(c.data || []);
      } catch {}
    };
    load();
  }, []);

  useEffect(() => {
    chatRef.current?.scrollTo({ top: chatRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || sending) return;
    const msg = input;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: msg }]);
    setSending(true);

    try {
      const res = await aiAPI.chat({
        message: msg,
        language: profile?.targetLanguage || 'English',
        cefrLevel: profile?.cefrLevel || 'A1',
        conversationId: convId,
      });
      const data = res.data;
      setConvId(data.conversationId);
      setMessages(prev => [...prev, { role: 'assistant', content: data.message }]);
    } catch (err) {
      setMessages(prev => [...prev, { role: 'assistant', content: '❌ Error: Could not get AI response. Please try again.' }]);
    } finally {
      setSending(false);
    }
  };

  const loadConversation = async (id) => {
    try {
      const res = await aiAPI.getConversation(id);
      setMessages(res.data.messages || []);
      setConvId(id);
      setShowHistory(false);
    } catch (err) { console.error(err); }
  };

  const startNew = () => {
    setMessages([]);
    setConvId(null);
    setShowHistory(false);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-10rem)] max-w-3xl mx-auto py-2 relative">
      {/* Header */}
      <div className="flex items-center justify-between mb-4 bg-white p-4 rounded-3xl border-2 border-neutral-200 shadow-sm z-10">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-brand-primary text-white flex items-center justify-center shadow-[0_4px_0_#1899D6] transform -rotate-3">
            <FaRobot size={24} className="rotate-3" />
          </div>
          <div>
            <h1 className="text-xl font-extrabold text-neutral-800">AI Tutor</h1>
            <p className="text-neutral-500 font-bold text-sm">
              Level {profile?.cefrLevel || 'A1'} · {profile?.targetLanguage || 'English'}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setShowHistory(!showHistory)} className="p-3 rounded-xl bg-neutral-100 text-neutral-500 hover:text-neutral-700 font-bold flex items-center justify-center transition-all">
            <FaHistory size={16} />
          </button>
          <button onClick={startNew} className="p-3 rounded-xl bg-brand-primary/10 text-brand-primary font-bold flex items-center justify-center transition-all">
            <FaPlus size={16} />
          </button>
        </div>
      </div>

      {/* History sidebar overlay */}
      {showHistory && conversations.length > 0 && (
        <div className="absolute top-24 right-0 w-64 bg-white rounded-3xl p-4 border-2 border-neutral-200 shadow-xl z-20 space-y-2">
          <h3 className="font-extrabold text-neutral-700 mb-3 px-2">Previous Chats</h3>
          <div className="max-h-64 overflow-y-auto space-y-2 pr-1">
            {conversations.map(conv => (
              <button
                key={conv._id}
                onClick={() => loadConversation(conv._id)}
                className={`w-full text-left p-3 rounded-xl transition-colors border-2 ${convId === conv._id ? 'bg-brand-primary/10 border-brand-primary text-brand-primary' : 'bg-neutral-50 border-transparent text-neutral-600 hover:border-neutral-200'}`}
              >
                <div className="font-bold text-sm truncate">{conv.topic}</div>
                <div className="text-neutral-400 text-xs font-semibold">{new Date(conv.updatedAt).toLocaleDateString()}</div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Chat area */}
      <div ref={chatRef} className="flex-1 overflow-y-auto space-y-6 mb-4 px-2 custom-scrollbar">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <img src="https://api.dicebear.com/7.x/bottts/svg?seed=VocabVerse&backgroundColor=1CB0F6" alt="Robot" className="w-32 h-32 rounded-3xl mb-6 shadow-md" />
            <h3 className="text-2xl font-extrabold text-neutral-800 mb-2">Say Hello!</h3>
            <p className="text-neutral-500 font-bold max-w-sm">
              I'm your AI language partner. Type a message in {profile?.targetLanguage || 'your target language'} and I'll help you practice with real-time corrections.
            </p>
          </div>
        )}

        {messages.map((msg, i) => (
          <motion.div key={i} initial={{ opacity: 0, scale: 0.95, y: 10 }} animate={{ opacity: 1, scale: 1, y: 0 }} className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            {msg.role === 'assistant' && (
              <div className="w-10 h-10 rounded-full bg-brand-primary text-white flex items-center justify-center shrink-0 mt-1 shadow-sm">
                <FaRobot size={18} />
              </div>
            )}
            <div className={`max-w-[75%] p-4 rounded-3xl font-semibold shadow-sm border-2 ${
              msg.role === 'user'
                ? 'bg-neutral-800 text-white border-neutral-800 rounded-br-md'
                : 'bg-white text-neutral-800 border-neutral-200 rounded-bl-md'
            }`}>
              <p className="whitespace-pre-wrap leading-relaxed">{msg.content}</p>
            </div>
          </motion.div>
        ))}

        {sending && (
          <div className="flex gap-3">
            <div className="w-10 h-10 rounded-full bg-brand-primary text-white flex items-center justify-center shrink-0 mt-1 shadow-sm">
              <FaRobot size={18} />
            </div>
            <div className="bg-white border-2 border-neutral-200 rounded-3xl rounded-bl-md p-5 shadow-sm">
              <div className="flex gap-2">
                <div className="w-2 h-2 rounded-full bg-neutral-300 animate-bounce" style={{ animationDelay: '0s' }} />
                <div className="w-2 h-2 rounded-full bg-neutral-300 animate-bounce" style={{ animationDelay: '0.15s' }} />
                <div className="w-2 h-2 rounded-full bg-neutral-300 animate-bounce" style={{ animationDelay: '0.3s' }} />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Input */}
      <div className="flex gap-3 bg-white p-3 rounded-2xl border-2 border-neutral-200 shadow-sm relative z-10 focus-within:border-brand-primary transition-colors">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          placeholder={`Type in ${profile?.targetLanguage || 'your target language'}...`}
          className="flex-1 px-4 py-2 bg-transparent text-neutral-800 font-bold placeholder-neutral-400 focus:outline-none"
          disabled={sending}
        />
        <button
          onClick={handleSend}
          disabled={!input.trim() || sending}
          className="w-12 h-12 flex items-center justify-center rounded-xl bg-brand-primary text-white font-bold disabled:opacity-50 hover:bg-brand-primary-dark transition-colors"
        >
          <FaPaperPlane />
        </button>
      </div>
    </div>
  );
}
