import { useState } from 'react';
import { aiAPI } from '../../api/ai.api';
import { FaCheck, FaTimes, FaSpinner, FaLightbulb, FaPen } from 'react-icons/fa';
import { motion } from 'framer-motion';

export default function GrammarCheckPage() {
  const [sentence, setSentence] = useState('');
  const [language, setLanguage] = useState('English');
  const [cefrLevel, setCefrLevel] = useState('A1');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleCheck = async () => {
    if (!sentence.trim() || loading) return;
    setLoading(true);
    setResult(null);
    try {
      const res = await aiAPI.grammarCheck({ sentence, language, cefrLevel });
      setResult(res.data);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const errorTypeColors = {
    grammar: 'bg-purple-100 text-purple-700 border-purple-200',
    spelling: 'bg-blue-100 text-blue-700 border-blue-200',
    vocabulary: 'bg-brand-accent/20 text-[#cca000] border-brand-accent/30',
    punctuation: 'bg-pink-100 text-pink-700 border-pink-200',
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="text-center mb-10">
        <div className="w-16 h-16 rounded-full bg-brand-primary/10 text-brand-primary flex items-center justify-center mx-auto mb-4 border-2 border-brand-primary/20">
          <FaPen size={24} />
        </div>
        <h1 className="text-3xl font-extrabold text-neutral-800">Grammar Check</h1>
        <p className="text-neutral-500 font-bold mt-2">Get instant AI-powered feedback on your writing.</p>
      </div>

      <div className="card-fun p-6">
        {/* Controls */}
        <div className="flex gap-3 mb-4">
          <select value={language} onChange={(e) => setLanguage(e.target.value)} className="px-4 py-2 rounded-xl border-2 border-neutral-200 text-neutral-700 font-bold focus:outline-none focus:border-brand-primary bg-neutral-50">
            {['English', 'German', 'Italian', 'Swedish', 'Spanish', 'French'].map(l => <option key={l} value={l}>{l}</option>)}
          </select>
          <select value={cefrLevel} onChange={(e) => setCefrLevel(e.target.value)} className="px-4 py-2 rounded-xl border-2 border-neutral-200 text-neutral-700 font-bold focus:outline-none focus:border-brand-primary bg-neutral-50">
            {['A1', 'A2', 'B1', 'B2', 'C1', 'C2'].map(l => <option key={l} value={l}>{l}</option>)}
          </select>
        </div>

        {/* Input */}
        <textarea
          value={sentence}
          onChange={(e) => setSentence(e.target.value)}
          rows={4}
          className="w-full bg-neutral-50 border-2 border-neutral-200 rounded-2xl p-4 text-neutral-800 font-semibold placeholder-neutral-400 focus:outline-none focus:border-brand-primary resize-none text-lg"
          placeholder="Type a sentence to check..."
        />
        
        <div className="flex justify-between items-center mt-4">
          <span className="text-neutral-400 font-bold text-sm tracking-wide">{sentence.length} / 500 chars</span>
          <button
            onClick={handleCheck}
            disabled={!sentence.trim() || loading}
            className="btn-fun"
          >
            {loading ? <><FaSpinner className="animate-spin inline mr-2" /> CHECKING</> : 'CHECK GRAMMAR'}
          </button>
        </div>
      </div>

      {/* Results */}
      {result && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
          <div className={`card-fun p-6 border-b-4 ${result.isCorrect ? 'border-brand-success bg-brand-success/5' : 'border-brand-danger bg-brand-danger/5'}`}>
            <div className="flex items-center gap-3 mb-4">
              {result.isCorrect ? (
                <><FaCheck className="text-brand-success" size={24} /><h3 className="text-brand-success-dark font-extrabold text-xl">Perfect! No errors found</h3></>
              ) : (
                <><FaTimes className="text-brand-danger" size={24} /><h3 className="text-brand-danger font-extrabold text-xl">{result.errors?.length || 0} error(s) found</h3></>
              )}
            </div>

            {!result.isCorrect && (
              <div className="space-y-3">
                <div className="p-4 rounded-2xl border-2 border-neutral-200 bg-white">
                  <span className="text-neutral-400 font-extrabold text-[10px] uppercase tracking-widest block mb-1">Original</span>
                  <span className="text-neutral-500 line-through font-medium">{result.original}</span>
                </div>
                <div className="p-4 rounded-2xl border-2 border-[#b0e685] bg-[#d7ffb8]">
                  <span className="text-brand-success-dark font-extrabold text-[10px] uppercase tracking-widest block mb-1">Corrected</span>
                  <span className="text-brand-success-dark font-extrabold text-lg">{result.corrected}</span>
                </div>
              </div>
            )}
          </div>

          {/* Error details */}
          {result.errors?.length > 0 && (
            <div className="space-y-3">
              {result.errors.map((err, i) => (
                <div key={i} className="card-fun p-5 border-l-4">
                  <div className="flex items-start gap-4">
                    <span className={`px-3 py-1 rounded-lg text-xs font-extrabold uppercase tracking-wide border-2 shrink-0 ${errorTypeColors[err.type] || 'bg-neutral-100 text-neutral-600 border-neutral-200'}`}>
                      {err.type}
                    </span>
                    <div className="flex-1">
                      <div className="font-extrabold text-lg">
                        <span className="text-brand-danger line-through">{err.wrong}</span>
                        <span className="text-neutral-300 mx-3">→</span>
                        <span className="text-brand-success leading-tight">{err.right}</span>
                      </div>
                      {err.explanation && <p className="text-neutral-600 font-semibold mt-2">{err.explanation}</p>}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Suggestion */}
          {result.suggestion && (
            <div className="card-fun p-5 bg-brand-primary/5 border-brand-primary/20">
              <div className="flex items-center gap-2 mb-2">
                <FaLightbulb className="text-brand-primary" />
                <span className="text-brand-primary font-extrabold uppercase text-xs tracking-widest">Natural Alternative</span>
              </div>
              <p className="text-neutral-700 font-bold italic text-lg">"{result.suggestion}"</p>
            </div>
          )}
        </motion.div>
      )}
    </div>
  );
}
