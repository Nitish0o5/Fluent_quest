import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { FaMap, FaDumbbell, FaRobot, FaCrown, FaUserCircle, FaBookOpen, FaShieldAlt } from 'react-icons/fa';

export default function Navbar() {
  const { user, logout } = useAuth();
  const location = useLocation();

  if (!user) return null;

  const isStudent = user.roles?.includes('STUDENT');
  const isInstructor = user.roles?.includes('INSTRUCTOR');
  const isAdmin = user.roles?.includes('ADMIN');

  let links = [];

  if (isStudent) {
    links = [
      { to: '/dashboard', icon: FaMap, label: 'LEARN' },
      { to: '/srs', icon: FaDumbbell, label: 'REVIEW' },
      { to: '/ai-chat', icon: FaRobot, label: 'TUTOR' },
      { to: '/leaderboard', icon: FaCrown, label: 'RANK' },
      { to: '/profile', icon: FaUserCircle, label: 'PROFILE' },
    ];
  } else if (isInstructor) {
    links = [
      { to: '/instructor', icon: FaDumbbell, label: 'DASHBOARD' },
      { to: '/instructor/lessons', icon: FaBookOpen, label: 'BUILDER' },
    ];
  } else if (isAdmin) {
    links = [
      { to: '/admin', icon: FaShieldAlt, label: 'ADMIN' },
    ];
  }

  // Desktop sidebar / Mobile bottom bar
  return (
    <>
      {/* Desktop Sidebar */}
      <nav className="hidden md:flex flex-col w-64 h-screen border-r-2 border-neutral-200 bg-white p-6 fixed left-0 top-0">
        <Link to="/dashboard" className="mb-12 inline-block transition-transform hover:scale-105">
          <h1 className="text-3xl font-extrabold text-brand-primary tracking-tight">VocabVerse</h1>
        </Link>
        <div className="flex-1 space-y-2">
          {links.map((v) => {
            const active = location.pathname.startsWith(v.to) && (v.to !== '/dashboard' || location.pathname === '/dashboard');
            return (
              <Link
                key={v.to}
                to={v.to}
                className={`flex items-center gap-4 px-4 py-3 rounded-2xl font-bold transition-all ${
                  active
                    ? 'bg-brand-primary/10 text-brand-primary border-2 border-brand-primary/20'
                    : 'text-neutral-500 hover:bg-neutral-100 hover:text-neutral-800 border-2 border-transparent'
                }`}
              >
                <v.icon size={24} />
                <span className="tracking-wide">{v.label}</span>
              </Link>
            )
          })}
        </div>
        <button
          onClick={logout}
          className="text-neutral-400 font-bold hover:text-neutral-600 text-left py-4 uppercase tracking-wide"
        >
          Sign Out
        </button>
      </nav>

      {/* Mobile Bottom Bar */}
      <nav className="md:hidden fixed bottom-0 w-full bg-white border-t-2 border-neutral-200 flex justify-around p-3 z-50">
        {links.map((v) => {
          const active = location.pathname.startsWith(v.to) && (v.to !== '/dashboard' || location.pathname === '/dashboard');
          return (
            <Link
              key={v.to}
              to={v.to}
              className={`flex flex-col flex-1 items-center gap-1 p-2 rounded-xl transition-all ${
                active ? 'text-brand-primary bg-brand-primary/10' : 'text-neutral-400'
              }`}
            >
              <v.icon size={22} />
              <span className="text-[10px] font-bold">{v.label}</span>
            </Link>
          )
        })}
      </nav>
    </>
  );
}
