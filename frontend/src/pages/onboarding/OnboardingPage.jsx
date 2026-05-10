import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { studentAPI } from '../../api/student.api';
import { FaGlobeAmericas, FaLayerGroup, FaBullseye, FaClock, FaCheckCircle, FaSpinner } from 'react-icons/fa';

const LANGUAGES = ['English', 'German', 'Italian', 'Swedish', 'Spanish', 'French'];
const LEVELS = [
  { id: 'A1', label: 'Absolute Beginner', desc: 'I know very few words' },
  { id: 'A2', label: 'Beginner', desc: 'I can have simple conversations' },
  { id: 'B1', label: 'Intermediate', desc: 'I can manage most everyday situations' },
  { id: 'B2', label: 'Upper Intermediate', desc: 'I can communicate with native speakers easily' },
  { id: 'C1', label: 'Advanced', desc: 'I can express myself fluently and spontaneously' },
  { id: 'C2', label: 'Mastery', desc: 'I can understand almost everything I hear or read' }
];

export default function OnboardingPage() {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuth();

  // Redirect if already onboarded
  useEffect(() => {
    if (user?.isOnboardingComplete) {
      navigate('/dashboard', { replace: true });
    }
  }, [user, navigate]);

  const [form, setForm] = useState({
    targetLanguage: '',
    nativeLanguage: 'English',
    cefrLevel: '',
    cefrGoal: '',
    dailyGoalMinutes: 15
  });

  const handleNext = () => setStep(s => s + 1);
  const handleBack = () => setStep(s => s - 1);

  const handleComplete = async () => {
    setLoading(true);
    try {
      await studentAPI.onboard(form);
      navigate('/dashboard');
    } catch (err) {
      alert(err.response?.data?.message || err.message);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-100 flex flex-col items-center py-12 px-4">
      {/* Progress Bar */}
      <div className="w-full max-w-2xl mb-12">
        <div className="h-4 rounded-full bg-neutral-200 overflow-hidden">
          <div 
            className="h-full rounded-full bg-brand-primary transition-all duration-500 ease-out"
            style={{ width: `${((step-1) / 3) * 100}%` }}
          />
        </div>
      </div>

      <div className="w-full max-w-2xl text-center">
        {step === 1 && (
          <div className="animate-fade-in text-left">
            <h1 className="text-3xl font-extrabold text-neutral-800 mb-8 text-center flex items-center justify-center gap-3">
              <FaGlobeAmericas className="text-brand-primary" /> What do you want to learn?
            </h1>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {LANGUAGES.map(l => (
                <button
                  key={l}
                  onClick={() => { setForm({ ...form, targetLanguage: l }); handleNext(); }}
                  className="card-fun p-6 text-center hover:bg-neutral-50 transition-all hover:-translate-y-1 hover:shadow-lg active:translate-y-0 active:shadow-none"
                >
                  <span className="text-4xl mb-4 block">
                    {l === 'English' ? '🇬🇧' : l === 'German' ? '🇩🇪' : l === 'Italian' ? '🇮🇹' : l === 'Swedish' ? '🇸🇪' : l === 'Spanish' ? '🇪🇸' : '🇫🇷'}
                  </span>
                  <span className="font-extrabold text-neutral-700 text-lg">{l}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="animate-fade-in text-left">
            <h1 className="text-3xl font-extrabold text-neutral-800 mb-8 text-center flex items-center justify-center gap-3">
              <FaLayerGroup className="text-brand-primary" /> How much {form.targetLanguage} do you know?
            </h1>
            <div className="space-y-3">
              {LEVELS.slice(0, 4).map(l => (
                <button
                  key={l.id}
                  onClick={() => { setForm({ ...form, cefrLevel: l.id }); handleNext(); }}
                  className="w-full card-fun p-6 flex flex-col items-center hover:bg-neutral-50 transition-all hover:-translate-y-1 hover:shadow-lg focus:ring-4 ring-brand-primary/20"
                >
                  <span className="font-extrabold text-brand-primary text-xl mb-1">{l.label} ({l.id})</span>
                  <span className="text-neutral-500 font-bold">{l.desc}</span>
                </button>
              ))}
            </div>
            <button onClick={handleBack} className="mt-8 text-neutral-400 font-bold hover:text-neutral-600 block mx-auto">BACK</button>
          </div>
        )}

        {step === 3 && (
          <div className="animate-fade-in text-left">
            <h1 className="text-3xl font-extrabold text-neutral-800 mb-8 text-center flex items-center justify-center gap-3">
              <FaBullseye className="text-brand-secondary" /> What is your goal?
            </h1>
            <div className="space-y-3">
              {LEVELS.map(l => (
                <button
                  key={l.id}
                  onClick={() => { setForm({ ...form, cefrGoal: l.id }); handleNext(); }}
                  className="w-full card-fun p-6 flex flex-col items-center hover:bg-neutral-50 transition-all hover:-translate-y-1 hover:shadow-lg focus:ring-4 ring-brand-secondary/20"
                >
                  <span className="font-extrabold text-brand-secondary text-xl mb-1">{l.label} ({l.id})</span>
                  <span className="text-neutral-500 font-bold">{l.desc}</span>
                </button>
              ))}
            </div>
            <button onClick={handleBack} className="mt-8 text-neutral-400 font-bold hover:text-neutral-600 block mx-auto">BACK</button>
          </div>
        )}

        {step === 4 && (
          <div className="animate-fade-in">
            <h1 className="text-3xl font-extrabold text-neutral-800 mb-8 flex items-center justify-center gap-3">
              <FaClock className="text-brand-accent" /> Ready, set, go!
            </h1>
            <div className="card-fun p-8 mb-8 inline-block max-w-sm w-full mx-auto shadow-lg text-left">
              <h3 className="font-extrabold text-neutral-700 text-lg mb-4 text-center">Your Learning Path</h3>
              
              <div className="space-y-4">
                <div className="flex items-center gap-3 p-3 bg-neutral-100 rounded-xl">
                  <div className="w-10 h-10 rounded-full bg-brand-primary text-white flex items-center justify-center font-bold">1</div>
                  <div>
                    <div className="text-xs font-bold text-neutral-400 uppercase">Target</div>
                    <div className="font-extrabold text-neutral-700">{form.targetLanguage}</div>
                  </div>
                </div>
                
                <div className="flex items-center gap-3 p-3 bg-neutral-100 rounded-xl">
                  <div className="w-10 h-10 rounded-full bg-brand-secondary text-white flex items-center justify-center font-bold">2</div>
                  <div>
                    <div className="text-xs font-bold text-neutral-400 uppercase">From → To</div>
                    <div className="font-extrabold text-neutral-700">{form.cefrLevel || 'A1'} → {form.cefrGoal || 'B2'}</div>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 bg-neutral-100 rounded-xl">
                  <div className="w-10 h-10 rounded-full bg-brand-accent text-white flex items-center justify-center font-bold">3</div>
                  <div className="flex-1">
                    <div className="text-xs font-bold text-neutral-400 uppercase mb-1">Daily Goal</div>
                    <select
                      value={form.dailyGoalMinutes}
                      onChange={(e) => setForm({ ...form, dailyGoalMinutes: parseInt(e.target.value) })}
                      className="w-full bg-white border-2 border-neutral-200 rounded-lg p-2 font-bold text-neutral-700 focus:outline-none focus:border-brand-accent"
                    >
                      <option value={5}>Casual (5 min/day)</option>
                      <option value={15}>Regular (15 min/day)</option>
                      <option value={30}>Serious (30 min/day)</option>
                      <option value={60}>Intense (60 min/day)</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            <button
              onClick={handleComplete}
              disabled={loading}
              className="w-full max-w-sm mx-auto btn-fun text-xl py-4 flex items-center justify-center gap-2"
            >
              {loading ? <FaSpinner className="animate-spin" /> : <FaCheckCircle size={24} />} 
              {loading ? 'SAVING...' : 'START LEARNING'}
            </button>
            <button onClick={handleBack} disabled={loading} className="mt-6 text-neutral-400 font-bold hover:text-neutral-600">BACK</button>
          </div>
        )}
      </div>
    </div>
  );
}
