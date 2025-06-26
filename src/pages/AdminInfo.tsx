import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Home } from 'lucide-react';

const ADMIN_EMAIL = 'admin@monk.edu';
const ADMIN_PASSWORD = 'admin123';

const AdminInfo: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
      setTimeout(() => {
        setLoading(false);
        navigate('/admin-dashboard');
      }, 500);
    } else {
      setTimeout(() => {
        setLoading(false);
        setError('Invalid admin email or password. Please try again.');
      }, 500);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-blue-900 dark:to-purple-900 p-4">
      <div className="w-full max-w-md bg-white/80 dark:bg-gray-800/80 rounded-xl shadow-xl p-8 text-center backdrop-blur-sm">
        <div className="mx-auto w-20 h-20 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full flex items-center justify-center mb-6">
          <span className="text-3xl font-bold text-white">MT</span>
        </div>
        <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-2">Admin Login</h1>
        <form onSubmit={handleSubmit} className="space-y-4 text-left">
          <div>
            <label htmlFor="admin-email" className="block text-sm font-medium text-gray-700 dark:text-gray-200">Email</label>
            <input
              id="admin-email"
              type="email"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-900 dark:text-white"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              autoComplete="username"
              placeholder="admin@monk.edu"
            />
          </div>
          <div className="relative">
            <label htmlFor="admin-password" className="block text-sm font-medium text-gray-700 dark:text-gray-200">Password</label>
            <input
              id="admin-password"
              type={showPassword ? 'text' : 'password'}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-900 dark:text-white pr-10"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              autoComplete="current-password"
              placeholder="Enter password"
            />
            <button
              type="button"
              className="absolute top-8 right-3 text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 focus:outline-none"
              tabIndex={-1}
              onClick={() => setShowPassword(v => !v)}
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
          {error && <div className="text-red-600 text-sm text-center font-medium">{error}</div>}
          <button
            type="submit"
            className="w-full py-2 px-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-md shadow hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            disabled={loading}
          >
            {loading ? 'Logging in...' : 'Login as Admin'}
          </button>
        </form>
        <button
          className="mt-6 flex items-center justify-center gap-2 text-sm text-blue-600 hover:underline mx-auto"
          onClick={() => navigate('/')}
        >
          <Home size={16} /> Back to Home
        </button>
      </div>
    </div>
  );
};

export default AdminInfo; 