import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import ProtectedRoute from './guards/ProtectedRoute';
import AppLayout from './components/layout/AppLayout';

// Auth
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';

// Onboarding
import OnboardingPage from './pages/onboarding/OnboardingPage';

// Student
import DashboardPage from './pages/student/DashboardPage';
import LessonsPage from './pages/student/LessonsPage';
import LessonPlayPage from './pages/student/LessonPlayPage';
import SRSReviewPage from './pages/student/SRSReviewPage';
import AIChatPage from './pages/student/AIChatPage';
import GrammarCheckPage from './pages/student/GrammarCheckPage';
import LeaderboardPage from './pages/student/LeaderboardPage';
import ProfilePage from './pages/student/ProfilePage';

// Instructor
import InstructorDashboard from './pages/instructor/InstructorDashboard';
import LessonBuilder from './pages/instructor/LessonBuilder';

// Admin
import AdminDashboard from './pages/admin/AdminDashboard';

function RootRedirect() {
  const { user, loading } = useAuth();
  if (loading) return <div className="min-h-screen flex items-center justify-center bg-dark-900"><div className="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin" /></div>;
  if (!user) return <Navigate to="/login" />;
  if (user.roles?.includes('ADMIN')) return <Navigate to="/admin" />;
  if (user.roles?.includes('INSTRUCTOR')) return <Navigate to="/instructor" />;
  if (user.roles?.includes('STUDENT') && user.isOnboardingComplete === false) return <Navigate to="/onboarding" />;
  return <Navigate to="/dashboard" />;
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Public */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* Onboarding */}
          <Route path="/onboarding" element={
            <ProtectedRoute><OnboardingPage /></ProtectedRoute>
          } />

          {/* Student routes */}
          <Route element={<ProtectedRoute roles={['STUDENT']}><AppLayout /></ProtectedRoute>}>
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/lessons" element={<LessonsPage />} />
            <Route path="/lessons/:id" element={<LessonPlayPage />} />
            <Route path="/srs" element={<SRSReviewPage />} />
            <Route path="/ai-chat" element={<AIChatPage />} />
            <Route path="/grammar-check" element={<GrammarCheckPage />} />
            <Route path="/leaderboard" element={<LeaderboardPage />} />
            <Route path="/profile" element={<ProfilePage />} />
          </Route>

          {/* Instructor routes */}
          <Route element={<ProtectedRoute roles={['INSTRUCTOR']}><AppLayout /></ProtectedRoute>}>
            <Route path="/instructor" element={<InstructorDashboard />} />
            <Route path="/instructor/lessons" element={<LessonBuilder />} />
            <Route path="/instructor/courses" element={<InstructorDashboard />} />
            <Route path="/instructor/analytics" element={<InstructorDashboard />} />
          </Route>

          {/* Admin routes */}
          <Route element={<ProtectedRoute roles={['ADMIN']}><AppLayout /></ProtectedRoute>}>
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/admin/users" element={<AdminDashboard />} />
            <Route path="/admin/health" element={<AdminDashboard />} />
          </Route>

          {/* Root */}
          <Route path="/" element={<RootRedirect />} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
