import { useState, useEffect } from 'react';
import { srsAPI } from '../../api/srs.api';
import { motion, AnimatePresence } from 'framer-motion';
import { FaBrain, FaTrophy, FaDumbbell } from 'react-icons/fa';

const QUALITY_BUTTONS = [
  { q: 0, label: 'Forgot', emoji: '😵', color: 'bg-brand-danger text-white hover:bg-[#cc2222] shadow-[0_4px_0_#cc2222]' },
  { q: 1, label: 'Hard', emoji: '😰', color: 'bg-orange-500 text-white hover:bg-orange-600 shadow-[0_4px_0_#cc6600]' },
  { q: 3, label: 'OK', emoji: '🤔', color: 'bg-brand-accent text-white hover:bg-[#e6b400] shadow-[0_4px_0_#cca000]' },
  { q: 4, label: 'Good', emoji: '😊', color: 'bg-brand-primary text-white hover:bg-brand-primary-dark shadow-[0_4px_0_#1899D6]' },
  { q: 5, label: 'Perfect', emoji: '🤩', color: 'bg-brand-success text-white hover:bg-brand-success-dark shadow-[0_4px_0_#46A302]' },
];

export default function SRSReviewPage() {
  const [cards, setCards] = useState([]);
  const [current, setCurrent] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sessionDone, setSessionDone] = useState(false);
  const [reviewed, setReviewed] = useState(0);
  const [startTime, setStartTime] = useState(Date.now());

  useEffect(() => {
    const load = async () => {
      try {
        const [dueRes, statsRes] = await Promise.all([
          srsAPI.getDueCards(),
          srsAPI.getStats(),
        ]);
        setCards(dueRes.data || []);
        setStats(statsRes.data);
        if (!dueRes.data?.length) setSessionDone(true);
      } catch (err) { console.error(err); }
      finally { setLoading(false); }
    };
    load();
  }, []);

  const handleRate = async (quality) => {
    const card = cards[current];
    const responseTime = Date.now() - startTime;
    try {
      await srsAPI.reviewCard(card._id, { quality, responseTimeMs: responseTime });
      setReviewed(reviewed + 1);
      if (current < cards.length - 1) {
        setCurrent(current + 1);
        setFlipped(false);
        setStartTime(Date.now());
      } else {
        setSessionDone(true);
      }
    } catch (err) { console.error(err); }
  };

  if (loading) return <div className="flex justify-center p-20"><div className="w-12 h-12 border-4 border-brand-primary/30 border-t-brand-primary rounded-full animate-spin" /></div>;

  if (sessionDone) {
    return (
      <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="max-w-md mx-auto text-center py-20">
        <div className="w-24 h-24 rounded-3xl bg-brand-success flex items-center justify-center mx-auto mb-6 shadow-[0_8px_0_#46A302] animate-bounce-in">
          {reviewed > 0 ? <FaTrophy className="text-white" size={40} /> : <FaBrain className="text-white" size={40} />}
        </div>
        <h2 className="text-3xl font-extrabold text-neutral-800 mb-2">
          {reviewed > 0 ? 'Session Complete! 🎉' : 'All caught up! ✅'}
        </h2>
        <p className="text-neutral-500 font-bold mb-6">
          {reviewed > 0 ? `You reviewed ${reviewed} cards` : 'No cards due for review right now'}
        </p>
        {stats && (
          <div className="card-fun p-6 mb-6 grid grid-cols-3 gap-4">
            <div><div className="text-2xl font-extrabold text-neutral-800">{stats.total}</div><div className="text-neutral-400 text-xs font-bold uppercase tracking-wide">Total</div></div>
            <div><div className="text-2xl font-extrabold text-brand-success">{stats.mastered}</div><div className="text-neutral-400 text-xs font-bold uppercase tracking-wide">Mastered</div></div>
            <div><div className="text-2xl font-extrabold text-brand-primary">{stats.learning}</div><div className="text-neutral-400 text-xs font-bold uppercase tracking-wide">Learning</div></div>
          </div>
        )}
      </motion.div>
    );
  }

  const card = cards[current];

  return (
    <div className="max-w-xl mx-auto py-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-extrabold text-neutral-800 flex items-center gap-2"><FaDumbbell className="text-brand-primary" /> SRS Review</h1>
        <span className="px-3 py-1.5 rounded-xl bg-neutral-200 text-neutral-500 font-bold text-sm">
          {current + 1} / {cards.length}
        </span>
      </div>

      {/* Progress */}
      <div className="h-4 rounded-full bg-neutral-200 mb-8 overflow-hidden">
        <motion.div
          className="h-full rounded-full bg-brand-success"
          animate={{ width: `${((current + (flipped ? 0.5 : 0)) / cards.length) * 100}%` }}
          transition={{ type: "spring", stiffness: 50 }}
        />
      </div>

      {/* Card */}
      <div onClick={() => !flipped && setFlipped(true)} className="cursor-pointer perspective-1000 mb-8">
        <motion.div
          className={`relative w-full min-h-[300px] rounded-3xl p-8 flex flex-col items-center justify-center text-center transition-all duration-300 ${
            flipped ? 'bg-[#f0f9ff] border-4 border-[#bdf0ff]' : 'bg-white border-4 border-neutral-200 hover:bg-neutral-50 shadow-[0_8px_0_#CECECE] active:translate-y-[4px] active:shadow-[0_4px_0_#CECECE]'
          }`}
          animate={{ rotateY: flipped ? 0 : 0 }}
        >
          <AnimatePresence mode="wait">
            {!flipped ? (
              <motion.div key="front" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <span className="text-neutral-400 font-bold text-sm mb-4 block uppercase tracking-widest">Question</span>
                <h2 className="text-4xl font-extrabold text-neutral-800">{card?.front}</h2>
                {card?.cefrLevel && (
                  <span className="mt-6 inline-block px-3 py-1 rounded-lg bg-neutral-100 text-neutral-500 text-xs font-bold border-2 border-neutral-200">
                    {card.cefrLevel}
                  </span>
                )}
                <p className="text-brand-primary font-bold text-sm mt-8 animate-pulse">Tap to reveal answer</p>
              </motion.div>
            ) : (
              <motion.div key="back" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <span className="text-brand-success/70 font-bold text-sm mb-4 block uppercase tracking-widest">Answer</span>
                <h2 className="text-4xl font-extrabold text-brand-success-dark">{card?.back}</h2>
                {card?.context && (
                  <p className="text-neutral-500 font-bold text-sm mt-6 italic">"{card.context}"</p>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>

      {/* Rating buttons */}
      {flipped && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
          <p className="text-neutral-500 font-extrabold text-center mb-2">How well did you know this?</p>
          <div className="grid grid-cols-5 gap-2 md:gap-4">
            {QUALITY_BUTTONS.map(btn => (
              <button
                key={btn.q}
                onClick={() => handleRate(btn.q)}
                className={`p-3 md:p-4 rounded-2xl text-center transition-all active:translate-y-[4px] active:shadow-none ${btn.color}`}
              >
                <span className="text-2xl md:text-3xl block">{btn.emoji}</span>
                <span className="text-[10px] md:text-xs font-extrabold uppercase mt-2 block tracking-wide">{btn.label}</span>
              </button>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
}
