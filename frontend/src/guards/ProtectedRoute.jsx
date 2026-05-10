import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function getDefaultRoute(user) {
  if (user?.roles?.includes('ADMIN')) return '/admin';
  if (user?.roles?.includes('INSTRUCTOR')) return '/instructor';
  if (user?.roles?.includes('STUDENT') && user.isOnboardingComplete === false) return '/onboarding';
  return '/dashboard';
}

export default function ProtectedRoute({ children, roles }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-dark-900">
        <div className="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) return <Navigate to="/login" replace />;

  if (roles && !roles.some(r => user.roles?.includes(r))) {
    return <Navigate to={getDefaultRoute(user)} replace />;
  }

  return children;
}
