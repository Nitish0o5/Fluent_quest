import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { lessonsAPI } from '../../api/lessons.api';
import { FaClock, FaBolt, FaGraduationCap, FaFilter } from 'react-icons/fa';
import { HiOutlineArrowRight, HiOutlineSearch } from 'react-icons/hi';
import { motion } from 'framer-motion';

const CEFR = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];
const CATEGORIES = ['All', 'Grammar', 'Vocabulary', 'Conversation', 'Reading', 'Writing'];
const TYPE_COLORS = { MCQ: 'bg-blue-500/20 text-blue-300', FILL_BLANK: 'bg-purple-500/20 text-purple-300', TRANSLATION: 'bg-green-500/20 text-green-300', WORD_MATCH: 'bg-amber-500/20 text-amber-300', AI_CHAT: 'bg-cyan-500/20 text-cyan-300', LISTENING: 'bg-pink-500/20 text-pink-300' };

export default function LessonsPage() {
  const [lessons, setLessons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ cefrLevel: '', category: '', search: '' });

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const params = {};
        if (filters.cefrLevel) params.cefrLevel = filters.cefrLevel;
        if (filters.category && filters.category !== 'All') params.category = filters.category;
        const res = await lessonsAPI.getLessons(params);
        setLessons(res.data.lessons || []);
      } catch (err) { console.error(err); }
      finally { setLoading(false); }
    };
    load();
  }, [filters.cefrLevel, filters.category]);

  const filtered = filters.search
    ? lessons.filter(l => l.title.toLowerCase().includes(filters.search.toLowerCase()))
    : lessons;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-heading font-bold text-white">Lessons</h1>
          <p className="text-dark-300 mt-1">Browse and start learning</p>
        </div>
      </div>

      {/* Filters */}
      <div className="glass rounded-2xl p-4 space-y-4">
        <div className="relative">
          <HiOutlineSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-dark-400" size={20} />
          <input
            type="text"
            placeholder="Search lessons..."
            value={filters.search}
            onChange={(e) => setFilters({ ...filters, search: e.target.value })}
            className="w-full pl-12 pr-4 py-3 rounded-xl bg-dark-800 border border-dark-600 text-white placeholder-dark-400 focus:outline-none focus:border-primary transition-all"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          <span className="text-dark-400 text-sm flex items-center gap-1 mr-2"><FaFilter size={12} /> CEFR:</span>
          {['', ...CEFR].map(lvl => (
            <button
              key={lvl}
              onClick={() => setFilters({ ...filters, cefrLevel: lvl })}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                filters.cefrLevel === lvl
                  ? 'bg-primary/20 text-primary-light border border-primary/30'
                  : 'bg-dark-700 text-dark-300 hover:bg-dark-600'
              }`}
            >
              {lvl || 'All'}
            </button>
          ))}
        </div>
        <div className="flex flex-wrap gap-2">
          <span className="text-dark-400 text-sm flex items-center gap-1 mr-2"><FaGraduationCap size={12} /> Category:</span>
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => setFilters({ ...filters, category: cat })}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                (filters.category || 'All') === cat
                  ? 'bg-secondary/20 text-secondary border border-secondary/30'
                  : 'bg-dark-700 text-dark-300 hover:bg-dark-600'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Lessons Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1,2,3,4,5,6].map(i => (
            <div key={i} className="h-48 rounded-2xl bg-dark-800 animate-pulse" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20">
          <FaBookOpen className="mx-auto text-dark-500 mb-4" size={48} />
          <h3 className="text-xl font-heading text-dark-300">No lessons found</h3>
          <p className="text-dark-400 mt-2">Try adjusting your filters</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((lesson, i) => (
            <motion.div
              key={lesson._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <Link
                to={`/lessons/${lesson._id}`}
                className="block p-6 rounded-2xl bg-dark-800 border border-dark-600 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300 group h-full"
              >
                <div className="flex items-start justify-between mb-3">
                  <span className={`px-2.5 py-1 rounded-lg text-xs font-bold ${TYPE_COLORS[lesson.type] || 'bg-dark-600 text-dark-200'}`}>
                    {lesson.type?.replace('_', ' ')}
                  </span>
                  <span className="px-2.5 py-1 rounded-lg bg-primary/10 text-primary-light text-xs font-bold">
                    {lesson.cefrLevel}
                  </span>
                </div>
                <h3 className="text-white font-semibold text-lg mb-2 group-hover:text-primary-light transition-colors line-clamp-2">
                  {lesson.title}
                </h3>
                {lesson.description && (
                  <p className="text-dark-400 text-sm mb-4 line-clamp-2">{lesson.description}</p>
                )}
                <div className="flex items-center gap-4 text-dark-400 text-xs mt-auto">
                  <span className="flex items-center gap-1"><FaClock size={12} /> {lesson.estimatedMinutes || 10} min</span>
                  <span className="flex items-center gap-1"><FaBolt className="text-accent" size={12} /> {lesson.xpReward || 10} XP</span>
                </div>
                <div className="mt-3 flex items-center gap-1 text-primary-light text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                  Start lesson <HiOutlineArrowRight size={14} />
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}

function FaBookOpen(props) {
  return <FaGraduationCap {...props} />;
}
