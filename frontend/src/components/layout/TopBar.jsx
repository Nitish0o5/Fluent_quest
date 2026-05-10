import { FaBolt, FaFire, FaHeart } from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';
import { useState, useEffect } from 'react';
import { studentAPI } from '../../api/student.api';

export default function TopBar() {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await studentAPI.getProfile();
        setProfile(res.data);
      } catch (err) { console.error(err); }
    };
    if (user?.roles?.includes('STUDENT')) load();
  }, [user]);

  return (
    <div className="sticky top-0 z-40 w-full max-w-4xl mx-auto flex items-center justify-between px-6 py-4 bg-neutral-100/90 backdrop-blur-md">
      <div className="flex items-center gap-2 text-neutral-400 font-bold">
        <span className="w-8 h-8 rounded-full border-2 border-neutral-300 flex items-center justify-center uppercase bg-white">
          {profile?.targetLanguage?.substring(0, 2) || 'EN'}
        </span>
      </div>
      
      <div className="flex items-center gap-6">
        {/* Streak */}
        <div className="flex items-center gap-2 font-extrabold text-orange-500">
          <FaFire size={20} className={profile?.streak?.current > 0 ? "text-orange-500" : "text-neutral-300"} />
          <span className={profile?.streak?.current > 0 ? '' : 'text-neutral-400'}>{profile?.streak?.current || 0}</span>
        </div>
        
        {/* XP */}
        <div className="flex items-center gap-2 font-extrabold text-brand-primary">
          <FaBolt size={20} />
          <span>{profile?.xp || 0}</span>
        </div>
        
        {/* Hearts (Mocked for gamification feel) */}
        <div className="flex items-center gap-2 font-extrabold text-brand-secondary">
          <FaHeart size={20} />
          <span>5</span>
        </div>
      </div>
    </div>
  );
}
