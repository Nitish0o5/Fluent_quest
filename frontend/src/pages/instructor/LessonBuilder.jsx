import { useState, useEffect } from 'react';
import { lessonsAPI } from '../../api/lessons.api';
import { aiAPI } from '../../api/ai.api';
import { FaPlus, FaTrash, FaRobot, FaEye, FaPaperPlane, FaSave } from 'react-icons/fa';
import { motion } from 'framer-motion';

const TYPES = ['MCQ', 'FILL_BLANK', 'TRANSLATION', 'WORD_MATCH'];
const CATEGORIES = ['Grammar', 'Vocabulary', 'Conversation', 'Reading', 'Writing'];
const LANGUAGES = ['English', 'German', 'Italian', 'Swedish', 'Spanish', 'French'];
const CEFR = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];

export default function LessonBuilder() {
  const [lessons, setLessons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [form, setForm] = useState({
    title: '', description: '', language: 'English', cefrLevel: 'A1', type: 'MCQ',
    category: 'Grammar', grammarTopic: '', xpReward: 10, estimatedMinutes: 10,
    content: { instructions: '', exercises: [] },
  });

  useEffect(() => {
    const load = async () => {
      try {
        const res = await lessonsAPI.getMyLessons();
        setLessons(Array.isArray(res.data) ? res.data : []);
      } catch {}
      finally { setLoading(false); }
    };
    load();
  }, []);

  const handleAIGenerate = async () => {
    if (!form.grammarTopic) return;
    setGenerating(true);
    try {
      const res = await aiAPI.generateContent({
        topic: form.grammarTopic,
        language: form.language,
        cefrLevel: form.cefrLevel,
        exerciseType: form.type,
        count: 5,
      });
      const data = res.data;
      setForm(prev => ({
        ...prev,
        title: data.title || prev.title,
        description: data.description || prev.description,
        content: {
          instructions: data.instructions || prev.content.instructions,
          exercises: data.exercises || [],
        },
      }));
    } catch (err) { console.error(err); }
    finally { setGenerating(false); }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await lessonsAPI.createLesson(form);
      const res = await lessonsAPI.getMyLessons();
      setLessons(Array.isArray(res.data) ? res.data : []);
      setShowForm(false);
      setForm({ title: '', description: '', language: 'English', cefrLevel: 'A1', type: 'MCQ', category: 'Grammar', grammarTopic: '', xpReward: 10, estimatedMinutes: 10, content: { instructions: '', exercises: [] } });
    } catch (err) { console.error(err); }
    finally { setSaving(false); }
  };

  const handlePublish = async (id) => {
    try {
      await lessonsAPI.publishLesson(id);
      setLessons(prev => prev.map(l => l._id === id ? { ...l, isPublished: true } : l));
    } catch (err) { console.error(err); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this lesson?')) return;
    try {
      await lessonsAPI.deleteLesson(id);
      setLessons(prev => prev.filter(l => l._id !== id));
    } catch (err) { console.error(err); }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-heading font-bold text-neutral-800">Lesson Builder</h1>
        <button onClick={() => setShowForm(!showForm)} className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-primary to-primary-dark text-neutral-800 font-medium hover:scale-105 active:scale-95 transition-all flex items-center gap-2">
          <FaPlus size={14} /> New Lesson
        </button>
      </div>

      {/* Create Form */}
      {showForm && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="card-fun rounded-2xl p-6 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div><label className="block text-sm text-dark-200 mb-1.5">Title</label><input value={form.title} onChange={e=>setForm({...form,title:e.target.value})} className="w-full px-4 py-3 rounded-xl bg-neutral-100 border border-dark-600 text-neutral-800 focus:outline-none focus:border-primary" placeholder="Lesson title" /></div>
            <div><label className="block text-sm text-dark-200 mb-1.5">Grammar Topic</label><input value={form.grammarTopic} onChange={e=>setForm({...form,grammarTopic:e.target.value})} className="w-full px-4 py-3 rounded-xl bg-neutral-100 border border-dark-600 text-neutral-800 focus:outline-none focus:border-primary" placeholder="e.g. Past Simple" /></div>
            <div><label className="block text-sm text-dark-200 mb-1.5">Language</label><select value={form.language} onChange={e=>setForm({...form,language:e.target.value})} className="w-full px-4 py-3 rounded-xl bg-neutral-100 border border-dark-600 text-neutral-800 focus:outline-none focus:border-primary">{LANGUAGES.map(l=><option key={l}>{l}</option>)}</select></div>
            <div><label className="block text-sm text-dark-200 mb-1.5">CEFR Level</label><select value={form.cefrLevel} onChange={e=>setForm({...form,cefrLevel:e.target.value})} className="w-full px-4 py-3 rounded-xl bg-neutral-100 border border-dark-600 text-neutral-800 focus:outline-none focus:border-primary">{CEFR.map(l=><option key={l}>{l}</option>)}</select></div>
            <div><label className="block text-sm text-dark-200 mb-1.5">Type</label><select value={form.type} onChange={e=>setForm({...form,type:e.target.value})} className="w-full px-4 py-3 rounded-xl bg-neutral-100 border border-dark-600 text-neutral-800 focus:outline-none focus:border-primary">{TYPES.map(t=><option key={t}>{t}</option>)}</select></div>
            <div><label className="block text-sm text-dark-200 mb-1.5">Category</label><select value={form.category} onChange={e=>setForm({...form,category:e.target.value})} className="w-full px-4 py-3 rounded-xl bg-neutral-100 border border-dark-600 text-neutral-800 focus:outline-none focus:border-primary">{CATEGORIES.map(c=><option key={c}>{c}</option>)}</select></div>
          </div>
          <div><label className="block text-sm text-dark-200 mb-1.5">Description</label><textarea value={form.description} onChange={e=>setForm({...form,description:e.target.value})} rows={2} className="w-full px-4 py-3 rounded-xl bg-neutral-100 border border-dark-600 text-neutral-800 focus:outline-none focus:border-primary resize-none" placeholder="Lesson description" /></div>

          {/* AI Generate */}
          <button onClick={handleAIGenerate} disabled={generating || !form.grammarTopic} className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-secondary to-blue-600 text-neutral-800 font-medium hover:scale-105 transition-all disabled:opacity-50 flex items-center gap-2">
            <FaRobot /> {generating ? 'Generating...' : 'AI Generate Exercises'}
          </button>

          {/* Exercises preview */}
          {form.content.exercises.length > 0 && (
            <div className="space-y-2">
              <h3 className="text-neutral-800 font-medium">Exercises ({form.content.exercises.length})</h3>
              {form.content.exercises.map((ex, i) => (
                <div key={i} className="p-3 rounded-xl bg-neutral-100 border border-dark-600">
                  <p className="text-neutral-800 text-sm">{i + 1}. {ex.prompt}</p>
                  <p className="text-success text-xs mt-1">Answer: {ex.correctAnswer}</p>
                </div>
              ))}
            </div>
          )}

          <div className="flex gap-3">
            <button onClick={handleSave} disabled={saving || !form.title} className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-primary to-primary-dark text-neutral-800 font-medium hover:scale-105 transition-all disabled:opacity-50 flex items-center gap-2">
              <FaSave /> {saving ? 'Saving...' : 'Save Lesson'}
            </button>
            <button onClick={() => setShowForm(false)} className="px-5 py-2.5 rounded-xl bg-dark-700 text-dark-300 hover:text-neutral-800 transition-all">Cancel</button>
          </div>
        </motion.div>
      )}

      {/* Existing Lessons */}
      {loading ? (
        <div className="space-y-3">{[1,2,3].map(i=><div key={i} className="h-16 rounded-xl bg-neutral-100 animate-pulse" />)}</div>
      ) : (
        <div className="space-y-2">
          {lessons.map(lesson => (
            <div key={lesson._id} className="card-fun rounded-xl p-4 flex items-center justify-between">
              <div>
                <h3 className="text-neutral-800 font-medium">{lesson.title}</h3>
                <span className="text-neutral-500 text-xs">{lesson.language} · {lesson.cefrLevel} · {lesson.type} · {lesson.content?.exercises?.length || 0} exercises</span>
              </div>
              <div className="flex items-center gap-2">
                {!lesson.isPublished && (
                  <button onClick={() => handlePublish(lesson._id)} className="px-3 py-1.5 rounded-lg bg-success/20 text-success text-xs font-medium hover:bg-success/30 transition-all flex items-center gap-1">
                    <FaPaperPlane size={10} /> Publish
                  </button>
                )}
                <span className={`px-3 py-1.5 rounded-lg text-xs font-bold ${lesson.isPublished ? 'bg-success/10 text-success' : 'bg-dark-600 text-neutral-500'}`}>
                  {lesson.isPublished ? 'Live' : 'Draft'}
                </span>
                <button onClick={() => handleDelete(lesson._id)} className="p-2 rounded-lg text-neutral-500 hover:text-danger hover:bg-danger/10 transition-all"><FaTrash size={14} /></button>
              </div>
            </div>
          ))}
          {lessons.length === 0 && <p className="text-neutral-500 text-center py-8">No lessons yet. Create your first one!</p>}
        </div>
      )}
    </div>
  );
}
