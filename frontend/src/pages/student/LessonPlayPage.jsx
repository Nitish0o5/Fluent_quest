import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { lessonsAPI } from '../../api/lessons.api';
import { motion, AnimatePresence } from 'framer-motion';
import { FaCheck, FaTimes, FaLightbulb, FaTrophy, FaBolt, FaHeart } from 'react-icons/fa';
import { sounds } from '../../utils/sounds';
import { useToast } from '../../context/ToastContext';

const MAX_HEARTS = 5;

/* ─── Confetti ─────────────────────────────────────────────────────────────── */
function Confetti() {
  const pieces = Array.from({ length: 60 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    color: ['#58CC02','#FFC800','#1CB0F6','#ff4b4b','#a560f7'][i % 5],
    delay: Math.random() * 0.6,
    size: 6 + Math.random() * 8,
    duration: 1.5 + Math.random() * 1,
  }));

  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
      {pieces.map(p => (
        <motion.div
          key={p.id}
          style={{ left: `${p.x}%`, top: '-10px', width: p.size, height: p.size, background: p.color, borderRadius: Math.random() > 0.5 ? '50%' : '2px' }}
          initial={{ y: -20, opacity: 1, rotate: 0 }}
          animate={{ y: '110vh', opacity: [1, 1, 0], rotate: Math.random() * 720 - 360 }}
          transition={{ duration: p.duration, delay: p.delay, ease: 'easeIn' }}
        />
      ))}
    </div>
  );
}

/* ─── Animated Counter ──────────────────────────────────────────────────────── */
function AnimCounter({ target, suffix = '', className = '' }) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    let current = 0;
    const step = Math.ceil(target / 40);
    const timer = setInterval(() => {
      current = Math.min(current + step, target);
      setVal(current);
      if (current >= target) clearInterval(timer);
    }, 30);
    return () => clearInterval(timer);
  }, [target]);
  return <span className={className}>{val}{suffix}</span>;
}

/* ─── Hearts ────────────────────────────────────────────────────────────────── */
function Hearts({ count, max = MAX_HEARTS }) {
  return (
    <div className="flex gap-1">
      {Array.from({ length: max }, (_, i) => (
        <motion.div
          key={i}
          animate={i === count ? { scale: [1, 1.4, 1] } : {}}
          transition={{ duration: 0.3 }}
        >
          <FaHeart size={22} className={i < count ? 'text-brand-secondary' : 'text-neutral-200'} />
        </motion.div>
      ))}
    </div>
  );
}

/* ─── Timer ─────────────────────────────────────────────────────────────────── */
function Timer({ running }) {
  const [secs, setSecs] = useState(0);
  useEffect(() => {
    if (!running) return;
    const t = setInterval(() => setSecs(s => s + 1), 1000);
    return () => clearInterval(t);
  }, [running]);
  const m = Math.floor(secs / 60);
  const s = secs % 60;
  return (
    <span className="text-neutral-400 font-bold tabular-nums">
      {m}:{String(s).padStart(2, '0')}
    </span>
  );
}

/* ─── Main Component ────────────────────────────────────────────────────────── */
export default function LessonPlayPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToast } = useToast();

  const [lesson, setLesson] = useState(null);
  const [currentEx, setCurrentEx] = useState(0);
  const [answer, setAnswer] = useState('');
  const [feedback, setFeedback] = useState(null);
  const [completed, setCompleted] = useState(false);
  const [completionData, setCompletionData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [hearts, setHearts] = useState(MAX_HEARTS);
  const [gameOver, setGameOver] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const startTime = useRef(Date.now());

  useEffect(() => {
    const load = async () => {
      try {
        const res = await lessonsAPI.getLessonById(id);
        setLesson(res.data);
        await lessonsAPI.startLesson(id);
        addToast('Lesson started! Good luck 🎯', 'info', 2500);
      } catch (err) {
        console.error(err);
        addToast('Failed to load lesson', 'error');
      } finally { setLoading(false); }
    };
    load();
  }, [id]); // eslint-disable-line

  const exercises = lesson?.content?.exercises || [];
  const exercise = exercises[currentEx];
  const progress = exercises.length > 0 ? ((currentEx + (feedback ? 1 : 0)) / exercises.length) * 100 : 0;

  const handleSubmit = useCallback(async (selectedAnswer) => {
    const ans = selectedAnswer || answer;
    if (!ans.trim() || submitting) return;
    setSubmitting(true);
    const hesitation = Date.now() - startTime.current;
    try {
      const res = await lessonsAPI.submitExercise(id, {
        exerciseIndex: currentEx,
        answer: ans,
        hesitationMs: hesitation,
      });
      const fb = res.data;
      setFeedback(fb);
      if (fb.isCorrect) {
        sounds.correct();
      } else {
        sounds.wrong();
        const newHearts = hearts - 1;
        setHearts(newHearts);
        if (newHearts <= 0) {
          setTimeout(() => setGameOver(true), 1200);
        }
      }
    } catch (err) {
      console.error(err);
      addToast('Failed to submit answer', 'error');
    } finally { setSubmitting(false); }
  }, [answer, submitting, currentEx, id, hearts]); // eslint-disable-line

  const handleNext = async () => {
    if (currentEx < exercises.length - 1) {
      setCurrentEx(currentEx + 1);
      setAnswer('');
      setFeedback(null);
      setShowHint(false);
      startTime.current = Date.now();
    } else {
      try {
        const res = await lessonsAPI.completeLesson(id);
        setCompletionData(res.data);
        setCompleted(true);
        sounds.complete();
        setShowConfetti(true);
        setTimeout(() => setShowConfetti(false), 3000);
      } catch (err) {
        console.error(err);
        addToast('Error saving completion', 'error');
      }
    }
  };

  if (loading) return (
    <div className="flex justify-center p-20">
      <div className="w-12 h-12 border-4 border-brand-primary/30 border-t-brand-primary rounded-full animate-spin" />
    </div>
  );

  /* ── Game Over ── */
  if (gameOver) {
    return (
      <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="max-w-md mx-auto text-center py-16">
        <div className="w-32 h-32 rounded-3xl bg-brand-secondary flex items-center justify-center mx-auto mb-8 shadow-[0_8px_0_#cc3c3c] animate-bounce-in">
          <FaHeart className="text-white" size={60} />
        </div>
        <h1 className="text-4xl font-extrabold text-neutral-800 mb-2">Out of Hearts!</h1>
        <p className="text-neutral-500 font-bold mb-8">Practice makes perfect. Try again!</p>
        <div className="flex gap-4 justify-center">
          <button onClick={() => navigate('/dashboard')} className="btn-outline-fun px-8 py-4 text-lg">HOME</button>
          <button onClick={() => window.location.reload()} className="btn-fun px-8 py-4 text-lg">TRY AGAIN</button>
        </div>
      </motion.div>
    );
  }

  /* ── Completion ── */
  if (completed && completionData) {
    return (
      <>
        {showConfetti && <Confetti />}
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="max-w-md mx-auto text-center py-16">
          <div className="w-32 h-32 rounded-3xl bg-brand-accent flex items-center justify-center mx-auto mb-8 shadow-[0_8px_0_#d4a600] animate-bounce-in">
            <FaTrophy className="text-white" size={60} />
          </div>
          <h1 className="text-4xl font-extrabold text-neutral-800 mb-2">Lesson Complete!</h1>
          <p className="text-neutral-500 font-bold mb-8">You're doing great. Keep the streak alive!</p>

          <div className="card-fun p-6 mb-6 grid grid-cols-3 gap-4">
            <div className="text-brand-success font-extrabold flex flex-col items-center">
              <AnimCounter target={completionData.accuracy} suffix="%" className="text-3xl" />
              <span className="text-sm uppercase tracking-wide opacity-80 mt-1">Accuracy</span>
            </div>
            <div className="text-brand-primary font-extrabold flex flex-col items-center">
              <span className="text-3xl flex items-center gap-1"><FaBolt size={22}/><AnimCounter target={completionData.xpEarned ?? completionData.xpReward ?? 0} /></span>
              <span className="text-sm uppercase tracking-wide opacity-80 mt-1">XP Earned</span>
            </div>
            <div className="text-brand-secondary font-extrabold flex flex-col items-center">
              <span className="text-3xl flex items-center gap-1"><FaHeart size={20} />{hearts}</span>
              <span className="text-sm uppercase tracking-wide opacity-80 mt-1">Hearts Left</span>
            </div>
          </div>

          {completionData.newBadges?.length > 0 && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="card-fun p-4 mb-6 bg-brand-accent/10 border-brand-accent/30">
              <p className="font-extrabold text-brand-accent mb-2">🏅 New Badge{completionData.newBadges.length > 1 ? 's' : ''} Unlocked!</p>
              <div className="flex flex-wrap gap-2 justify-center">
                {completionData.newBadges.map(b => (
                  <span key={b} className="px-3 py-1 bg-brand-accent/20 rounded-xl text-sm font-bold text-[#a07800]">{b}</span>
                ))}
              </div>
            </motion.div>
          )}

          <button onClick={() => navigate('/dashboard')} className="w-full btn-fun text-xl py-4">CONTINUE</button>
        </motion.div>
      </>
    );
  }

  if (!exercise) return <div className="text-center text-neutral-500 font-bold py-20">No exercises found.</div>;

  return (
    <div className="max-w-2xl mx-auto flex flex-col h-[calc(100vh-8rem)] relative">
      {/* Progress + Hearts + Timer */}
      <div className="flex items-center gap-4 mb-6">
        <button onClick={() => navigate('/dashboard')} className="text-neutral-400 hover:text-neutral-600">
          <FaTimes size={24} />
        </button>
        <div className="flex-1 h-4 rounded-full bg-neutral-200 overflow-hidden">
          <motion.div
            className="h-full rounded-full bg-brand-success"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ type: 'spring', stiffness: 50 }}
          />
        </div>
        <Timer running={!completed && !gameOver} />
        <Hearts count={hearts} />
      </div>

      <AnimatePresence mode="wait">
        <motion.div key={currentEx} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="flex-1 flex flex-col">
          <div className="text-xs font-bold text-neutral-400 uppercase tracking-widest mb-3">
            {currentEx + 1} / {exercises.length}
          </div>
          <h2 className="text-3xl font-extrabold text-neutral-800 mb-8">{exercise.prompt}</h2>

          {exercise.options?.length > 0 ? (
            <div className="grid grid-cols-1 gap-4">
              {exercise.options.map((opt, i) => {
                const isSelected = answer === opt;
                const isCorrect = feedback && opt === exercise.correctAnswer;
                const isWrong = feedback && isSelected && !feedback.isCorrect;

                return (
                  <motion.button
                    key={i}
                    whileTap={!feedback ? { scale: 0.98 } : {}}
                    onClick={() => { if (!feedback) { setAnswer(opt); handleSubmit(opt); } }}
                    disabled={!!feedback || submitting}
                    className={`p-4 rounded-2xl border-2 font-bold transition-all flex items-center justify-between text-left ${
                      isCorrect ? 'bg-brand-success/10 border-brand-success text-brand-success shadow-[0_4px_0_#58CC02]' :
                      isWrong   ? 'bg-brand-danger/10 border-brand-danger text-brand-danger shadow-[0_4px_0_#ea2b2b]' :
                      isSelected ? 'bg-brand-primary/10 border-brand-primary text-brand-primary shadow-[0_4px_0_#1CB0F6]' :
                                  'bg-white border-neutral-200 text-neutral-600 hover:bg-neutral-50 shadow-[0_4px_0_#CECECE]'
                    } ${feedback && !isCorrect && !isWrong ? 'opacity-40' : ''} ${!feedback ? 'active:translate-y-[4px] active:shadow-none' : ''}`}
                  >
                    <span className="text-lg">{opt}</span>
                    {isCorrect && <FaCheck size={20} />}
                    {isWrong && <FaTimes size={20} />}
                  </motion.button>
                );
              })}
            </div>
          ) : (
            <div className="space-y-4">
              <input
                type="text"
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
                disabled={!!feedback}
                className="w-full p-4 rounded-2xl border-2 border-neutral-200 text-neutral-800 font-bold focus:outline-none focus:border-brand-primary shadow-[0_4px_0_#CECECE] disabled:opacity-50 transition-all text-xl placeholder-neutral-300"
                placeholder="Type your answer..."
                autoFocus
              />
            </div>
          )}

          {/* Hint */}
          {!feedback && exercise.hints?.length > 0 && (
            <button onClick={() => setShowHint(!showHint)} className="mt-6 flex items-center justify-center gap-2 text-brand-primary font-bold hover:text-brand-primary-dark mx-auto">
              <FaLightbulb size={18} /> {showHint ? 'Hide hint' : 'Use a hint'}
            </button>
          )}
          <AnimatePresence>
            {showHint && exercise.hints?.[0] && !feedback && (
              <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} className="mt-4 p-4 rounded-2xl bg-brand-primary/10 border-2 border-brand-primary/20 text-brand-primary font-bold text-center">
                💡 {exercise.hints[0]}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </AnimatePresence>

      {/* Bottom Bar — Check / Feedback */}
      <AnimatePresence>
        {!feedback && (
          <motion.div
            initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed bottom-0 left-0 right-0 p-6 md:p-8 border-t-2 border-neutral-200 bg-white z-40 flex justify-center"
          >
            <div className="w-full max-w-4xl flex items-center justify-between">
              <button
                onClick={handleNext}
                className="font-bold text-neutral-400 hover:text-neutral-500 uppercase tracking-wide hidden sm:block"
                disabled={submitting}
              >
                Skip
              </button>
              <button
                onClick={() => handleSubmit()}
                disabled={!answer || !answer.trim() || submitting}
                className="w-full sm:w-48 py-4 text-xl uppercase tracking-wider btn-fun disabled:opacity-50 disabled:bg-neutral-200 disabled:text-neutral-400 disabled:shadow-[0_4px_0_#E5E5E5] disabled:border-2 disabled:border-transparent"
              >
                {submitting ? 'Checking...' : 'Check'}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {feedback && (
          <motion.div
            initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className={`fixed bottom-0 left-0 right-0 p-6 md:p-8 border-t-4 z-50 flex justify-center ${
              feedback.isCorrect ? 'bg-[#d7ffb8] border-[#b0e685]' : 'bg-[#ffdfe0] border-[#ffb3b8]'
            }`}
          >
            <div className="w-full max-w-4xl flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="flex items-center gap-6 w-full md:w-auto">
                <div className={`w-16 h-16 rounded-full flex items-center justify-center text-white shrink-0 shadow-lg ${
                  feedback.isCorrect ? 'bg-brand-success shadow-brand-success-dark' : 'bg-brand-danger shadow-[#cc2222]'
                }`}>
                  {feedback.isCorrect ? <FaCheck size={32} /> : <FaTimes size={32} />}
                </div>
                <div>
                  <h3 className={`text-2xl font-extrabold mb-1 ${feedback.isCorrect ? 'text-brand-success-dark' : 'text-brand-danger'}`}>
                    {feedback.isCorrect ? 'Excellent!' : 'Correct Solution:'}
                  </h3>
                  {!feedback.isCorrect && <p className={`font-extrabold text-xl mb-1 text-brand-danger`}>{exercise.correctAnswer}</p>}
                  {exercise.explanation && <p className={`font-bold ${feedback.isCorrect ? 'text-brand-success-dark/80' : 'text-[#cc2222]/80'}`}>{exercise.explanation}</p>}
                </div>
              </div>
              <button
                onClick={handleNext}
                className={`w-full md:w-48 py-4 text-xl uppercase tracking-wider ${feedback.isCorrect ? 'btn-success-fun' : 'btn-fun !bg-brand-danger !shadow-[0_4px_0_#cc2222]'}`}
              >
                CONTINUE
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
