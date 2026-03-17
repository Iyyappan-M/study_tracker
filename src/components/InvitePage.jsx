import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Users, Send, CheckCircle2, ShieldAlert, KeyRound, UserCircle2 } from 'lucide-react';
import { useState } from 'react';
import AnimatedBackground from './AnimatedBackground';

export default function InvitePage({ onJoinRequest }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const SECRET_JOIN_CODE = '29354546';

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (code !== SECRET_JOIN_CODE) {
      setError('❌ Invalid Secret Code. Ask the Admin for the key.');
      return;
    }

    if (name && email) {
      onJoinRequest({ name, email });
      setSubmitted(true);
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
        {/* Header Decor */}
        <div className="absolute -top-12 left-1/2 -translate-x-1/2">
           <div className="w-24 h-24 rounded-[2.5rem] bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-[0_20px_50px_rgba(79,70,229,0.3)] rotate-6">
              <Users className="w-12 h-12 text-white" />
           </div>
        </div>

        <div className="text-center mt-12 mb-10">
          <h1 className="text-4xl font-display font-black text-white mb-3 leading-tight tracking-tight uppercase">
            Join the Study Club
          </h1>
          <p className="text-dark-500 text-[0.7rem] font-black uppercase tracking-[0.3em] flex items-center justify-center gap-2">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" /> Private Productivity Circle
          </p>
        </div>

        {!submitted ? (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-[0.65rem] font-black text-dark-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                <UserCircle2 className="w-3.5 h-3.5 text-indigo-400" /> Full Name
              </label>
              <input
                required
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Karthik"
                className="input-glass w-full py-4 text-sm font-bold placeholder:text-dark-700"
              />
            </div>

            <div className="space-y-2">
              <label className="text-[0.65rem] font-black text-dark-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                <Send className="w-3.5 h-3.5 text-indigo-400" /> Email Address
              </label>
              <input
                required
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="input-glass w-full py-4 text-sm font-bold placeholder:text-dark-700"
              />
            </div>

            <div className="space-y-2">
              <label className="text-[0.65rem] font-black text-dark-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                <KeyRound className="w-3.5 h-3.5 text-indigo-400" /> Secret Join Code
              </label>
              <input
                required
                type="password"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="Enter 8-digit secret key"
                className="input-glass w-full py-4 text-sm font-bold tracking-[0.5em] placeholder:tracking-normal placeholder:text-dark-700"
              />
            </div>

            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 flex items-center gap-3"
                >
                  <ShieldAlert className="w-5 h-5 text-red-400 shrink-0" />
                  <p className="text-xs font-black text-red-400 uppercase tracking-wider">{error}</p>
                </motion.div>
              )}
            </AnimatePresence>

            <motion.button
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              className="btn-primary w-full py-4 mt-6 text-[0.7rem] font-black uppercase tracking-[0.3em] flex items-center justify-center gap-4 bg-gradient-to-r from-indigo-600 to-purple-700 hover:from-indigo-500 hover:to-purple-600 shadow-[0_15px_30px_rgba(79,70,229,0.25)]"
            >
              Send Request
              <ChevronCircleRight className="w-5 h-5" />
            </motion.button>
          </form>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="py-12 text-center"
          >
            <div className="w-20 h-20 rounded-full bg-emerald-500/10 flex items-center justify-center mx-auto mb-6 border-2 border-emerald-500/20 shadow-xl shadow-emerald-500/10">
              <CheckCircle2 className="w-10 h-10 text-emerald-400" />
            </div>
            <h2 className="text-2xl font-display font-black text-white mb-3 uppercase tracking-tight">Request Logged!</h2>
            <p className="text-dark-500 text-[0.7rem] leading-relaxed font-bold uppercase tracking-widest max-w-[300px] mx-auto">
              Successfully validated. The Admin will review your registration shortly. You'll receive full access once approved.
            </p>
            
            <motion.div 
               initial={{ width: 0 }}
               animate={{ width: "100%" }}
               transition={{ duration: 3 }}
               className="h-1 bg-indigo-500/20 rounded-full mt-10 relative overflow-hidden"
            >
               <div className="absolute inset-0 bg-indigo-500 animate-loading-bar" />
            </motion.div>
          </motion.div>
        )}

        <div className="mt-12 pt-8 border-t border-white/5 flex items-center justify-center gap-4">
          <div className="flex -space-x-2">
             <div className="w-6 h-6 rounded-full border-2 border-[#120a2e] bg-indigo-500 flex items-center justify-center text-[10px]">👑</div>
             <div className="w-6 h-6 rounded-full border-2 border-[#120a2e] bg-emerald-500 flex items-center justify-center text-[10px]">🔥</div>
             <div className="w-6 h-6 rounded-full border-2 border-[#120a2e] bg-amber-500 flex items-center justify-center text-[10px]">🎯</div>
          </div>
          <p className="text-[0.6rem] text-dark-600 font-black uppercase tracking-[0.2em]">
            Trusted by 50+ Top Focusers
          </p>
        </div>
      </motion.div>
    </div>
  );
}

function ChevronCircleRight(props) {
  return (
    <svg 
      {...props}
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="3" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
    >
      <circle cx="12" cy="12" r="10" />
      <path d="M8 12h8" />
      <path d="m12 8 4 4-4 4" />
    </svg>
  );
}
