import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldCheck, User, Key, ArrowRight, Loader2 } from 'lucide-react';
import AnimatedBackground from './AnimatedBackground';

export default function JoinClub({ user, onRequestJoin }) {
  const [formData, setFormData] = useState({
    name: user?.name || '',
    secretCode: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (formData.secretCode !== '29354546') {
      setError('Invalid Secret Code');
      return;
    }

    setLoading(true);
    try {
      const ok = await onRequestJoin(formData.name, formData.secretCode);
      if (ok) {
        setSuccess(true);
      } else {
        setError('Failed to send request. Try again.');
      }
    } catch (err) {
      setError('Something went wrong.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen relative flex items-center justify-center p-6 overflow-hidden">
        <AnimatedBackground />
        <motion.div
           initial={{ opacity: 0, scale: 0.9 }}
           animate={{ opacity: 1, scale: 1 }}
           className="glass-card max-w-lg w-full p-10 text-center relative z-10"
        >
          <div className="w-20 h-20 rounded-full bg-emerald-500/20 flex items-center justify-center mx-auto mb-8 animate-pulse">
            <ShieldCheck className="w-10 h-10 text-emerald-400" />
          </div>
          <h2 className="text-3xl font-display font-black text-white mb-4 uppercase">Request Sent!</h2>
          <p className="text-dark-400 text-sm font-medium leading-relaxed">
            Your join request is now pending. The Admin will review your application soon. Once approved, you'll get full access to the dashboard.
          </p>
          <div className="mt-8 flex justify-center">
            <div className="flex gap-2 items-center px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/20">
               <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
               <span className="text-[0.6rem] font-black text-emerald-400 uppercase tracking-widest">Awaiting Approval</span>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative flex items-center justify-center p-6 overflow-hidden">
      <AnimatedBackground />

      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="glass-card max-w-lg w-full p-10 relative z-10"
      >
        <div className="text-center mb-10">
          <div className="w-20 h-20 rounded-[2.5rem] bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center mx-auto mb-6 shadow-2xl shadow-emerald-500/20 rotate-12">
            <ShieldCheck className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl font-display font-black text-white mb-2 uppercase tracking-tight">Join Study Club</h1>
          <p className="text-dark-500 text-[0.7rem] font-black uppercase tracking-[0.3em]">Enter the secret gates</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-[0.65rem] font-black text-dark-400 uppercase tracking-widest ml-1 flex items-center gap-2">
              <User className="w-3.5 h-3.5 text-emerald-400" /> Your Club Name
            </label>
            <input
              required
              type="text"
              placeholder="How should we call you?"
              className="input-glass w-full py-4 text-sm font-bold placeholder:text-dark-700"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <label className="text-[0.65rem] font-black text-dark-400 uppercase tracking-widest ml-1 flex items-center gap-2">
              <Key className="w-3.5 h-3.5 text-emerald-400" /> Secret Access Code
            </label>
            <input
              required
              type="text"
              placeholder="Enter 8-digit code"
              className="input-glass w-full py-4 text-sm font-bold placeholder:text-dark-700"
              value={formData.secretCode}
              onChange={(e) => setFormData({ ...formData, secretCode: e.target.value })}
            />
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
            className="btn-primary w-full py-4 mt-6 text-[0.7rem] font-black uppercase tracking-[0.3em] flex items-center justify-center gap-4 bg-gradient-to-r from-emerald-600 to-teal-700 shadow-xl shadow-emerald-500/20"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Request to Join'}
            {!loading && <ArrowRight className="w-5 h-5" />}
          </motion.button>
        </form>
      </motion.div>
    </div>
  );
}
