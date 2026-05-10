import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { FaGraduationCap } from 'react-icons/fa';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const user = await login(email, password);
      addToast(`Welcome back! 👋`, 'success', 2500);
      if (user.roles?.includes('ADMIN')) return navigate('/admin');
      if (user.roles?.includes('INSTRUCTOR')) return navigate('/instructor');
      if (!user.isOnboardingComplete) return navigate('/onboarding');
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to login');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md animate-fade-in">
        <div className="text-center mb-8">
          <div className="w-20 h-20 rounded-3xl bg-brand-primary text-white flex items-center justify-center mx-auto mb-6 transform rotate-3 shadow-[0_6px_0_#1899D6]">
            <FaGraduationCap size={40} className="-rotate-3" />
          </div>
          <h1 className="text-4xl font-extrabold text-neutral-800 tracking-tight">VocabVerse</h1>
          <p className="text-neutral-500 font-bold mt-2">The fun way to learn languages!</p>
        </div>

        <div className="card-fun p-8 mb-6">
          {error && (
            <div className="p-4 bg-red-100 border-2 border-red-200 text-red-600 rounded-2xl mb-6 font-bold text-center">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-5 py-4 rounded-2xl bg-neutral-100 border-2 border-neutral-200 text-neutral-800 font-bold placeholder-neutral-400 focus:outline-none focus:border-brand-primary focus:bg-white transition-all"
                placeholder="Email address"
              />
            </div>
            <div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-5 py-4 rounded-2xl bg-neutral-100 border-2 border-neutral-200 text-neutral-800 font-bold placeholder-neutral-400 focus:outline-none focus:border-brand-primary focus:bg-white transition-all"
                placeholder="Password"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full btn-fun mt-2"
            >
              {loading ? 'Logging in...' : 'LOG IN'}
            </button>
          </form>
        </div>

        <p className="text-center text-neutral-500 font-bold">
          Don't have an account?{' '}
          <Link to="/register" className="text-brand-primary hover:text-brand-primary-dark">
            Create one
          </Link>
        </p>
      </div>
    </div>
  );
}
