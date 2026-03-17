import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Lock, Eye, EyeOff, LogIn, ArrowRight } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import AnimatedBackground from './AnimatedBackground';

export default function Login({ onLogin }) {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const result = await onLogin(formData);
      if (result.success) {
        if (result.user.status === 'approved') {
          navigate('/dashboard');
        } else {
          navigate('/join-club');
        }
      } else {
        setError(result.message || 'Invalid email or password');
      }
    } catch (err) {
      setError('System error. Please try later.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center p-6 overflow-hidden">
      <AnimatedBackground />

      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="glass-card max-w-lg w-full p-10 relative z-10"
      >
        <div className="text-center mb-10">
          <div className="w-20 h-20 rounded-[2.5rem] bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center mx-auto mb-6 shadow-2xl shadow-indigo-500/20 rotate-6">
            <LogIn className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl font-display font-black text-white mb-2 uppercase tracking-tight">Login</h1>
          <p className="text-dark-500 text-[0.7rem] font-black uppercase tracking-[0.3em]">Welcome back focus master</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-[0.65rem] font-black text-dark-400 uppercase tracking-widest ml-1 flex items-center gap-2">
              <Mail className="w-3.5 h-3.5 text-indigo-400" /> Email Address
            </label>
            <input
              required
              type="email"
              placeholder="you@example.com"
              className="input-glass w-full py-4 text-sm font-bold placeholder:text-dark-700"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <label className="text-[0.65rem] font-black text-dark-400 uppercase tracking-widest ml-1 flex items-center gap-2">
              <Lock className="w-3.5 h-3.5 text-indigo-400" /> Password
            </label>
            <div className="relative">
              <input
                required
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                className="input-glass w-full py-4 text-sm font-bold placeholder:text-dark-700 pr-12"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-dark-500 hover:text-indigo-400"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 text-[0.65rem] font-black text-red-400 uppercase tracking-wider"
              >
                ❌ {error}
              </motion.div>
            )}
          </AnimatePresence>

          <motion.button
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            disabled={loading}
            className="btn-primary w-full py-4 mt-6 text-[0.7rem] font-black uppercase tracking-[0.3em] flex items-center justify-center gap-4 bg-gradient-to-r from-indigo-600 to-purple-700 shadow-xl shadow-indigo-500/20"
          >
            {loading ? 'Authenticating...' : 'Login Now'}
            {!loading && <ArrowRight className="w-5 h-5" />}
          </motion.button>
        </form>

        <div className="mt-8 text-center">
          <p className="text-[0.65rem] text-dark-500 font-bold uppercase tracking-widest">
            Don't have an account?{' '}
            <Link to="/register" className="text-indigo-400 hover:text-indigo-300 ml-2 transition-colors">
              Register here
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
