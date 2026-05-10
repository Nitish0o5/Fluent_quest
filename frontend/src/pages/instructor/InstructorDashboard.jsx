import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { instructorAPI } from '../../api/instructor.api';
import { lessonsAPI } from '../../api/lessons.api';
import { FaBookOpen, FaUsers, FaExclamationTriangle, FaChartBar, FaPlus } from 'react-icons/fa';
import { motion } from 'framer-motion';

export default function InstructorDashboard() {
  const [courses, setCourses] = useState([]);
  const [lessons, setLessons] = useState([]);
  const [atRisk, setAtRisk] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [c, l, r] = await Promise.all([
          instructorAPI.getCourses().catch(() => ({ data: [] })),
          lessonsAPI.getMyLessons().catch(() => ({ data: [] })),
          instructorAPI.getAtRiskStudents().catch(() => ({ data: [] })),
        ]);
        setCourses(c.data || []);
        setLessons(Array.isArray(l.data) ? l.data : []);
        setAtRisk(r.data || []);
      } catch (err) { console.error(err); }
      finally { setLoading(false); }
    };
    load();
  }, []);

  if (loading) return <div className="flex items-center justify-center min-h-[60vh]"><div className="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin" /></div>;

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-heading font-bold text-neutral-800">Instructor Dashboard</h1>
        <div className="flex gap-3">
          <Link to="/instructor/lessons" className="px-4 py-2.5 rounded-xl bg-primary/20 text-primary-light font-medium hover:bg-primary/30 transition-all flex items-center gap-2 text-sm">
            <FaPlus size={14} /> New Lesson
          </Link>
        </div>
      </div>

      {/* Overview cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { icon: FaBookOpen, label: 'My Lessons', value: lessons.length, color: 'text-primary-light', bg: 'bg-primary/10' },
          { icon: FaUsers, label: 'Courses', value: courses.length, color: 'text-secondary', bg: 'bg-secondary/10' },
          { icon: FaExclamationTriangle, label: 'At-Risk Students', value: atRisk.length, color: 'text-danger', bg: 'bg-danger/10' },
        ].map((s, i) => (
          <motion.div key={s.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} className="card-fun rounded-2xl p-6">
            <div className={`w-10 h-10 rounded-xl ${s.bg} flex items-center justify-center mb-3`}>
              <s.icon className={s.color} size={20} />
            </div>
            <div className="text-2xl font-bold text-neutral-800">{s.value}</div>
            <div className="text-neutral-500 text-sm">{s.label}</div>
          </motion.div>
        ))}
      </div>

      {/* Recent lessons */}
      <div>
        <h2 className="text-xl font-heading font-bold text-white mb-4">Recent Lessons</h2>
        <div className="space-y-2">
          {lessons.slice(0, 5).map(lesson => (
            <Link key={lesson._id} to={`/instructor/lessons`} className="block glass rounded-xl p-4 hover:bg-white/[0.06] transition-all">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-white font-medium">{lesson.title}</h3>
                  <span className="text-dark-400 text-xs">{lesson.language} · {lesson.cefrLevel} · {lesson.type}</span>
                </div>
                <span className={`px-3 py-1 rounded-lg text-xs font-bold ${lesson.isPublished ? 'bg-success/20 text-success' : 'bg-dark-600 text-dark-300'}`}>
                  {lesson.isPublished ? 'Published' : 'Draft'}
                </span>
              </div>
            </Link>
          ))}
          {lessons.length === 0 && <p className="text-dark-400 text-center py-8">No lessons created yet</p>}
        </div>
      </div>

      {/* At-risk students */}
      {atRisk.length > 0 && (
        <div>
          <h2 className="text-xl font-heading font-bold text-white mb-4 flex items-center gap-2">
            <FaExclamationTriangle className="text-danger" /> At-Risk Students
          </h2>
          <div className="space-y-2">
            {atRisk.map((s, i) => (
              <div key={i} className="glass rounded-xl p-4 border-l-4 border-danger">
                <h3 className="text-white font-medium">{s.name || s.email}</h3>
                <span className="text-dark-400 text-sm">{s.reason || 'Inactive'}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
