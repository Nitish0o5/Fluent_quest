import { useState, useEffect } from 'react';
import { studentAPI } from '../../api/student.api';
import { useAuth } from '../../context/AuthContext';
import { FaCrown, FaBolt } from 'react-icons/fa';
import { motion } from 'framer-motion';

export default function LeaderboardPage() {
  const { user } = useAuth();
  const [board, setBoard] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await studentAPI.getLeaderboard(50);
        setBoard(res.data || []);
      } catch (err) { console.error(err); }
      finally { setLoading(false); }
    };
    load();
  }, []);

  const podiumStyles = [
    { bg: 'bg-[#FFC800]', border: 'border-[#CCA000]', height: 'h-32' },
    { bg: 'bg-neutral-300', border: 'border-neutral-400', height: 'h-24' },
    { bg: 'bg-[#ff8f00]', border: 'border-[#cc7200]', height: 'h-16' },
  ];

  if (loading) return <div className="flex justify-center py-20"><div className="w-12 h-12 border-4 border-brand-primary/30 border-t-brand-primary rounded-full animate-spin" /></div>;

  return (
    <div className="max-w-2xl mx-auto space-y-10 py-4">
      <div className="text-center">
        <h1 className="text-3xl font-extrabold text-neutral-800 flex items-center justify-center gap-3">
          <FaCrown className="text-brand-accent" size={32} /> Leaderboard
        </h1>
        <p className="text-neutral-500 font-bold mt-2 uppercase tracking-widest text-sm">Top learners this week</p>
      </div>

      {/* Top 3 Podium */}
      {board.length >= 3 && (
        <div className="flex items-end justify-center gap-4 md:gap-8 pt-8">
          {[1, 0, 2].map(idx => {
            const entry = board[idx];
            if (!entry) return null;
            const style = podiumStyles[idx];
            return (
              <motion.div key={idx} initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.15 }} className={`flex flex-col items-center ${idx === 0 ? 'order-2' : idx === 1 ? 'order-1' : 'order-3'}`}>
                <div className={`w-14 h-14 rounded-full border-4 flex items-center justify-center mb-3 shadow-[0_4px_0_rgba(0,0,0,0.1)] bg-white ${style.border} ${idx === 0 ? 'w-20 h-20 -mt-8' : ''}`}>
                  <span className="text-neutral-700 font-extrabold text-xl">{entry.name?.[0]?.toUpperCase()}</span>
                </div>
                <span className="text-neutral-700 font-extrabold text-sm mb-1 truncate max-w-[80px]">{entry.name}</span>
                <span className="text-brand-primary font-extrabold flex items-center gap-1 text-sm"><FaBolt />{entry.weeklyXp}</span>
                <div className={`w-20 rounded-t-2xl border-x-4 border-t-4 flex items-center justify-center mt-3 shadow-[0_-4px_0_inset_rgba(0,0,0,0.1)] ${style.bg} ${style.border} ${style.height}`}>
                  <span className="text-white/90 font-extrabold text-3xl">{idx + 1}</span>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Full list */}
      <div className="card-fun overflow-hidden">
        {board.map((entry, i) => {
          const isMe = entry.name === user?.name;
          return (
            <div key={i} className={`flex items-center gap-4 px-6 py-4 border-b-2 border-neutral-100 last:border-0 ${isMe ? 'bg-brand-primary/5' : 'hover:bg-neutral-50'} transition-colors`}>
              <span className={`w-8 text-center font-extrabold ${i < 3 ? (i===0?'text-brand-accent':i===1?'text-neutral-400':'text-[#ff8f00]') : 'text-neutral-400'}`}>
                {entry.rank}
              </span>
              <div className={`w-12 h-12 rounded-full flex items-center justify-center font-extrabold border-2 ${isMe ? 'bg-brand-primary/20 text-brand-primary border-brand-primary/30' : 'bg-neutral-100 text-neutral-500 border-neutral-200'}`}>
                {entry.name?.[0]?.toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <span className={`font-extrabold truncate block text-lg ${isMe ? 'text-brand-primary' : 'text-neutral-700'}`}>
                  {entry.name} {isMe && '(You)'}
                </span>
                <span className="text-neutral-400 font-bold text-xs uppercase tracking-wide">{entry.cefrLevel} · {entry.streak}🔥 streak</span>
              </div>
              <span className="text-brand-primary font-extrabold flex items-center gap-1 text-lg"><FaBolt size={16} />{entry.weeklyXp}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
