import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { lessonsAPI } from '../../api/lessons.api';
import { FaFlag, FaStar, FaLock, FaCrown, FaBookOpen, FaBolt, FaCheck, FaShieldAlt } from 'react-icons/fa';

export default function DashboardPage() {
  const [lessons, setLessons] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const load = async () => {
      try {
        const res = await lessonsAPI.getLessons();
        let data = res.data?.lessons || res.data;
        if (!Array.isArray(data)) data = [];

        // Fetch real progress for each lesson in parallel
        const progressResults = await Promise.allSettled(
          data.map((l) => lessonsAPI.getProgress(l._id))
        );

        let foundCurrent = false;
        const processed = data.map((l, i) => {
          const prog = progressResults[i].status === 'fulfilled' ? progressResults[i].value?.data : null;
          let status = 'LOCKED';
          if (prog?.status === 'COMPLETED') {
            status = 'COMPLETED';
          } else if (!foundCurrent) {
            // First non-completed lesson is the current one
            status = 'CURRENT';
            foundCurrent = true;
          }
          return { ...l, roadmapStatus: status };
        });

        setLessons(processed);
      } catch (err) { console.error(err); }
      finally { setLoading(false); }
    };
    load();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="w-12 h-12 border-4 border-brand-primary/30 border-t-brand-primary rounded-full animate-spin" />
      </div>
    );
  }

  // If no lessons, provide a dummy set so the beautiful UI can be seen
  const displayLessons = lessons.length > 0 ? lessons : Array.from({ length: 12 }).map((_, i) => ({
    _id: `dummy-${i}`,
    title: `Lesson ${i + 1}`,
    type: i % 3 === 0 ? 'GRAMMAR' : 'VOCABULARY',
    roadmapStatus: i < 5 ? 'COMPLETED' : i === 5 ? 'CURRENT' : 'LOCKED'
  }));

  // Chunk into units of 6
  const units = [];
  const CHUNK_SIZE = 6;
  for (let i = 0; i < displayLessons.length; i += CHUNK_SIZE) {
    const unitIndex = Math.floor(i / CHUNK_SIZE) + 1;
    units.push({
      id: `unit-${unitIndex}`,
      title: unitIndex === 1 ? "Basics & Fundamentals" : unitIndex === 2 ? "Everyday Phrases" : "Advanced Concepts",
      section: 1,
      unitNumber: unitIndex,
      color: unitIndex % 2 === 0 ? 'bg-brand-primary text-white border-brand-primary-dark' : 'bg-brand-success text-white border-brand-success-dark',
      lessons: displayLessons.slice(i, i + CHUNK_SIZE)
    });
  }

  const getZigZagTransform = (index) => {
    const sequence = [0, -1, -1.5, -1, 0, 1, 1.5, 1];
    const magnitude = 60; // Max pixel shift
    const phase = index % sequence.length;
    return `translateX(${sequence[phase] * magnitude}px)`;
  };

  const getNodeColor = (status, type) => {
    if (status === 'LOCKED') return 'bg-neutral-200 border-neutral-300 text-neutral-400';
    if (status === 'COMPLETED') return 'bg-brand-accent border-[#d4a600] text-white'; // Gold for completed
    
    // CURRENT varies by type
    if (type === 'GRAMMAR') return 'bg-brand-primary border-brand-primary-dark text-white';
    if (type === 'VOCABULARY') return 'bg-brand-success border-brand-success-dark text-white';
    return 'bg-brand-secondary border-brand-secondary-dark text-white';
  };

  return (
    <div className="w-full max-w-5xl mx-auto grid grid-cols-1 xl:grid-cols-3 gap-10 pb-20">
      
      {/* LEFT COLUMN: Map View (Spans 2 columns on desktop) */}
      <div className="xl:col-span-2 space-y-10 min-h-screen">
        {units.map((unit) => (
          <div key={unit.id} className="relative">
            
            {/* Unit Header block mimicking the reference image */}
            <div className={`rounded-3xl p-6 ${unit.color.split(' ')[0]} text-white border-b-4 ${unit.color.split(' ')[2]} flex flex-col md:flex-row shadow-sm justify-between items-start md:items-center mb-8 relative z-10`}>
              <div>
                <h3 className="font-bold text-white/90 uppercase text-sm tracking-wider mb-1">
                  Section {unit.section}, Unit {unit.unitNumber}
                </h3>
                <h2 className="text-2xl font-extrabold">{unit.title}</h2>
              </div>
              <button className="mt-4 md:mt-0 flex items-center gap-2 bg-white/20 hover:bg-white/30 backdrop-blur-sm px-4 py-2 font-bold rounded-2xl transition-all border-2 border-transparent active:border-white/40">
                <FaBookOpen /> GUIDEBOOK
              </button>
            </div>

            {/* Path Nodes */}
            <div className="flex flex-col items-center py-4 relative">
              {/* Invisible path line could go here, but omitted for cleaner look */}
              
              {unit.lessons.map((lesson, idx) => {
                const status = lesson.roadmapStatus;
                const isCurrent = status === 'CURRENT';
                const isCompleted = status === 'COMPLETED';
                const colorClasses = getNodeColor(status, lesson.type);
                const transform = getZigZagTransform(idx);
                
                return (
                  <div key={lesson._id} className="relative flex justify-center w-full mb-8 select-none" style={{ transform }}>
                    
                    {/* START Tooltip for Current Lesson */}
                    {isCurrent && (
                      <div className="absolute -top-16 z-50 animate-float-small">
                        <button 
                          onClick={() => navigate(`/lessons/${lesson._id}`)}
                          className="bg-white text-brand-primary font-black uppercase tracking-wider py-3 px-6 rounded-2xl shadow-[0_4px_0_#CECECE] border-2 border-neutral-200 active:translate-y-1 active:shadow-none transition-all flex items-center"
                        >
                          START
                        </button>
                        {/* Tooltip downward triangle */}
                        <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-white border-b-2 border-r-2 border-neutral-200 rotate-45" />
                      </div>
                    )}

                    {/* Node Button */}
                    <button
                      onClick={() => status !== 'LOCKED' && navigate(`/lessons/${lesson._id}`)}
                      className={`relative z-10 flex items-center justify-center rounded-full border-[5px] transition-transform ${isCurrent ? 'w-[75px] h-[75px] hover:scale-105 active:scale-95' : 'w-[65px] h-[65px] hover:scale-105 active:scale-95'} ${colorClasses} ${status === 'LOCKED' ? 'cursor-not-allowed cursor-default hover:scale-100 active:scale-100' : 'shadow-[0_6px_0_rgba(0,0,0,0.15)] active:shadow-none active:translate-y-[6px]'}`}
                    >
                      {/* Inner Icon */}
                      {isCompleted ? <FaCheck size={24} /> :
                       status === 'LOCKED' ? <FaLock size={22} className="opacity-80" /> :
                       <FaStar size={30} />}
                    </button>

                    {/* Crown marker for completed nodes (floating bottom right) */}
                    {isCompleted && (
                      <div className="absolute bottom-0 right-1/2 translate-x-8 translate-y-2 z-20">
                        <div className="bg-brand-accent text-white p-1 rounded-full border-2 border-white shadow-sm">
                          <FaCrown size={12} />
                        </div>
                      </div>
                    )}

                    {/* Progress Ring for Active Node */}
                    {isCurrent && (
                      <svg
                        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[100px] h-[100px] pointer-events-none -z-10"
                        viewBox="0 0 100 100"
                      >
                        <circle
                          cx="50" cy="50" r="42"
                          fill="none"
                          stroke="#E5E5E5"
                          strokeWidth="8"
                        />
                        <circle
                          cx="50" cy="50" r="42"
                          fill="none"
                          stroke="#58CC02"
                          strokeWidth="8"
                          strokeDasharray="264"
                          strokeDashoffset="180" // partially filled ring
                          strokeLinecap="round"
                          className="transform -rotate-90 origin-center transition-all duration-1000"
                        />
                      </svg>
                    )}
                  </div>
                );
              })}

              {/* Box/Chest at end of unit */}
              <div className="relative flex justify-center w-full mt-4" style={{ transform: getZigZagTransform(unit.lessons.length) }}>
                <div className="w-[80px] h-[80px] rounded-2xl bg-gradient-to-b from-brand-accent to-[#d4a600] border-4 border-[#b99103] flex justify-center items-center shadow-[0_8px_0_#8f7000] z-10 cursor-pointer hover:scale-105 active:scale-95 transition-transform active:translate-y-[8px] active:shadow-none">
                  <FaCrown size={40} className="text-white drop-shadow-md" />
                </div>
              </div>
            </div>

          </div>
        ))}
      </div>

      {/* RIGHT COLUMN: Desktop Sidebars (Hidden on mobile/tablet unless XL) */}
      <div className="hidden xl:flex flex-col gap-6">
        
        {/* League Card */}
        <div className="border-2 border-neutral-200 rounded-2xl p-5 bg-white">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-extrabold text-neutral-800 text-lg">Semifinals</h3>
            <span className="text-brand-primary font-bold text-sm hover:text-brand-primary-dark cursor-pointer text-blue-500 uppercase">View League</span>
          </div>
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-indigo-100 flex items-center justify-center border-2 border-indigo-200">
              <FaShieldAlt size={28} className="text-indigo-400" />
            </div>
            <div>
              <p className="font-bold text-neutral-800">You're ranked #4</p>
              <p className="text-sm font-bold text-neutral-400 mt-1">You're almost at the top 3!</p>
            </div>
          </div>
        </div>

        {/* Daily Quests Card */}
        <div className="border-2 border-neutral-200 rounded-2xl p-5 bg-white">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-extrabold text-neutral-800 text-lg">Daily Quests</h3>
            <span className="text-brand-primary font-bold text-sm hover:text-brand-primary-dark cursor-pointer uppercase">View All</span>
          </div>
          
          <div className="space-y-6">
            {/* Quest 1 */}
            <div className="flex gap-4 items-center">
              <FaBolt size={32} className="text-brand-accent drop-shadow-sm min-w-[32px]" />
              <div className="flex-1">
                <p className="font-bold text-neutral-800 text-sm mb-2">Earn 50 XP</p>
                <div className="flex items-center gap-2">
                  <div className="h-4 flex-1 bg-neutral-200 rounded-full overflow-hidden">
                    <div className="bg-brand-accent h-full w-[80%] rounded-full" />
                  </div>
                  <span className="text-brand-accent font-bold text-sm w-12 text-right">40/50</span>
                </div>
              </div>
            </div>

            {/* Quest 2 */}
            <div className="flex gap-4 items-center">
              <div className="w-8 h-8 rounded-full border-[3px] border-brand-success flex items-center justify-center min-w-[32px]">
                <div className="w-3 h-3 bg-brand-success rounded-full" />
              </div>
              <div className="flex-1">
                <p className="font-bold text-neutral-800 text-sm mb-2">Score 90% or higher in 3 lessons</p>
                <div className="flex items-center gap-2">
                  <div className="h-4 flex-1 bg-neutral-200 rounded-full overflow-hidden">
                    <div className="bg-brand-success h-full w-[33%] rounded-full" />
                  </div>
                  <span className="text-brand-success font-bold text-sm w-10 text-right">1/3</span>
                </div>
              </div>
            </div>

            {/* Quest 3 */}
            <div className="flex gap-4 items-center">
              <FaBookOpen size={30} className="text-brand-primary drop-shadow-sm min-w-[32px]" />
              <div className="flex-1">
                <p className="font-bold text-neutral-800 text-sm mb-2">Read 2 short stories</p>
                <div className="flex items-center gap-2">
                  <div className="h-4 flex-1 bg-neutral-200 rounded-full overflow-hidden">
                    <div className="bg-brand-primary h-full w-[0%] rounded-full" />
                  </div>
                  <span className="text-neutral-400 font-bold text-sm w-10 text-right">0/2</span>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>

    </div>
  );
}
