import { useState, useEffect } from 'react';
import { studentAPI } from '../../api/student.api';
import { useAuth } from '../../context/AuthContext';
import { FaUser, FaCheck, FaFire, FaBolt, FaChartLine, FaClock } from 'react-icons/fa';
import { motion } from 'framer-motion';

const CEFR = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];
const LANGUAGES = ['English', 'German', 'Italian', 'Swedish', 'Spanish', 'French'];

export default function ProfilePage() {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({});
  const [success, setSuccess] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        const res = await studentAPI.getProfile();
        setProfile(res.data);
        setForm({
          targetLanguage: res.data.targetLanguage || 'English',
          nativeLanguage: res.data.nativeLanguage || 'English',
          cefrGoal: res.data.cefrGoal || 'B2',
          dailyGoalMinutes: res.data.dailyGoalMinutes || 15,
        });
      } catch (err) { console.error(err); }
      finally { setLoading(false); }
    };
    load();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    setSuccess('');
    try {
      const res = await studentAPI.updateProfile(form);
      setProfile(res.data);
      setSuccess('Profile updated!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) { console.error(err); }
    finally { setSaving(false); }
  };

  if (loading) return <div className="flex justify-center py-20"><div className="w-12 h-12 border-4 border-brand-primary/30 border-t-brand-primary rounded-full animate-spin" /></div>;

  return (
    <div className="max-w-3xl mx-auto space-y-8 py-4">
      {/* Profile Header */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="card-fun p-8 flex flex-col sm:flex-row items-center gap-6 border-b-4 border-b-brand-primary">
        <div className="w-24 h-24 rounded-[30px] bg-brand-primary flex items-center justify-center text-white text-4xl font-extrabold shadow-[0_6px_0_#1899D6] transform -rotate-3">
          <div className="rotate-3">{user?.name?.[0]?.toUpperCase()}</div>
        </div>
        <div className="text-center sm:text-left">
          <h1 className="text-3xl font-extrabold text-neutral-800 tracking-tight">{user?.name}</h1>
          <p className="text-neutral-500 font-bold mb-3">{user?.email}</p>
          <div className="flex items-center gap-3 justify-center sm:justify-start">
            <span className="px-3 py-1 bg-brand-secondary/10 border-2 border-brand-secondary/20 text-brand-secondary text-xs uppercase tracking-widest font-extrabold rounded-lg">
              Level {profile?.cefrLevel}
            </span>
            <span className="text-neutral-400 font-bold text-sm">{profile?.targetLanguage} Learner</span>
          </div>
        </div>
      </motion.div>

      {/* Stats */}
      <h2 className="text-2xl font-extrabold text-neutral-800">Your Stats</h2>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { icon: FaBolt, label: 'Total XP', value: profile?.xp || 0, color: 'text-brand-primary' },
          { icon: FaFire, label: 'Streak', value: `${profile?.streak?.current || 0}`, color: 'text-orange-500' },
          { icon: FaChartLine, label: 'Accuracy', value: `${profile?.averageAccuracy || 0}%`, color: 'text-brand-success' },
          { icon: FaClock, label: 'Lessons', value: profile?.totalLessonsCompleted || 0, color: 'text-brand-secondary' },
        ].map((s, i) => (
          <motion.div key={s.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} className="card-fun p-5 text-center flex flex-col items-center justify-center">
            <s.icon className={`mb-3 ${s.color}`} size={28} />
            <div className="text-2xl font-extrabold text-neutral-800">{s.value}</div>
            <div className="text-neutral-400 font-bold text-xs uppercase tracking-wide mt-1">{s.label}</div>
          </motion.div>
        ))}
      </div>

      {/* Settings */}
      <div className="card-fun p-6 md:p-8 space-y-6">
        <h2 className="text-2xl font-extrabold text-neutral-800 flex items-center gap-2">
          <FaUser className="text-brand-primary" /> Learning Settings
        </h2>

        {success && (
          <div className="p-4 rounded-2xl bg-[#d7ffb8] border-2 border-[#b0e685] text-brand-success-dark font-bold animate-bounce-in flex items-center gap-2">
            <FaCheck /> {success}
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {['targetLanguage', 'nativeLanguage', 'cefrGoal'].map(field => (
            <div key={field}>
              <label className="block text-sm font-extrabold text-neutral-500 uppercase tracking-wider mb-2">
                {field.replace(/([A-Z])/g, ' $1').trim()}
              </label>
              <select
                value={form[field]}
                onChange={(e) => setForm({ ...form, [field]: e.target.value })}
                className="w-full px-5 py-3 rounded-2xl bg-neutral-100 border-2 border-neutral-200 text-neutral-800 font-bold focus:outline-none focus:border-brand-primary transition-all"
              >
                {(field === 'cefrGoal' ? CEFR : LANGUAGES).map(opt => <option key={opt}>{opt}</option>)}
              </select>
            </div>
          ))}
          <div>
            <label className="block text-sm font-extrabold text-neutral-500 uppercase tracking-wider mb-2">Daily Goal (Min)</label>
            <select
              value={form.dailyGoalMinutes}
              onChange={(e) => setForm({ ...form, dailyGoalMinutes: parseInt(e.target.value) })}
              className="w-full px-5 py-3 rounded-2xl bg-neutral-100 border-2 border-neutral-200 text-neutral-800 font-bold focus:outline-none focus:border-brand-primary transition-all"
            >
              {[5, 10, 15, 30, 45, 60].map(m => <option key={m} value={m}>{m} min</option>)}
            </select>
          </div>
        </div>

        <button onClick={handleSave} disabled={saving} className="btn-fun w-full md:w-auto md:px-8 mt-4">
          {saving ? 'SAVING...' : 'SAVE CHANGES'}
        </button>
      </div>
    </div>
  );
}
