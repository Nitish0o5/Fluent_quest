import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import TopBar from './TopBar';
import { useAuth } from '../../context/AuthContext';

export default function AppLayout() {
  const { user } = useAuth();
  
  return (
    <div className="flex min-h-screen bg-neutral-100 font-sans text-neutral-800 pb-20 md:pb-0 md:pl-64">
      <Navbar />
      <div className="flex-1 flex flex-col items-center overflow-x-hidden">
        {user?.roles?.includes('STUDENT') && <TopBar />}
        <main className="w-full max-w-[1056px] px-4 py-8 md:py-10 mx-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
