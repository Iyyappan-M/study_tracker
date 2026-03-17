import { motion } from 'framer-motion';
import { Flame, Zap, TrendingUp, Users, Bell, Link2, Copy, Check, LayoutGrid, ListPlus } from 'lucide-react';
import { useState } from 'react';

export default function Header({ 
  adminStreak, 
  totalFriends, 
  notifications, 
  inviteLink, 
  onOpenTaskBox, 
  onGenerateInvite,
  isAdmin 
}) {
  const [copied, setCopied] = useState(false);
  const [showNotifs, setShowNotifs] = useState(false);
  const [showInvite, setShowInvite] = useState(false);

  const handleCopy = () => {
    if (!inviteLink) {
      onGenerateInvite();
    }
    navigator.clipboard.writeText(inviteLink || 'Generating...');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const toggleInvite = () => {
    if (!showInvite && !inviteLink) {
      onGenerateInvite();
    }
    setShowInvite(!showInvite);
  };

  return (
    <header className="relative z-10">
      {/* Top Bar */}
      <div className="flex items-center justify-between px-6 py-4">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex items-center gap-3"
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/30">
            <Zap className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-display font-bold text-white tracking-tight">Study Streak</h1>
            <p className="text-[0.65rem] text-dark-400 font-medium tracking-wider uppercase">Tracker</p>
          </div>
        </motion.div>

        <div className="flex items-center gap-3">
          {/* Admin Actions */}
          {isAdmin && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onOpenTaskBox}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-200 text-sm font-medium hover:bg-indigo-500/20 transition-all"
            >
              <ListPlus className="w-4 h-4" />
              <span className="hidden sm:inline">Open Task Box</span>
            </motion.button>
          )}

          {/* Invite Button */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={toggleInvite}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-indigo-500/20 to-purple-500/20 border border-indigo-500/30 text-indigo-300 text-sm font-medium hover:border-indigo-400/50 transition-all"
          >
            <Link2 className="w-4 h-4" />
            <span className="hidden sm:inline">Invite Friends</span>
          </motion.button>

          {/* Notifications */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowNotifs(!showNotifs)}
            className="relative p-2.5 rounded-xl glass-light text-dark-300 hover:text-white transition-colors"
          >
            <Bell className="w-5 h-5" />
            {notifications.length > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-neon-pink rounded-full text-[0.6rem] font-bold flex items-center justify-center text-white">
                {notifications.length > 9 ? '9+' : notifications.length}
              </span>
            )}
          </motion.button>

          {/* User Avatar */}
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center text-lg shadow-lg shadow-green-500/20 ring-1 ring-white/10">
            {isAdmin ? '👨‍💻' : '🎉'}
          </div>
        </div>
      </div>

      {/* Invite Dropdown */}
      {showInvite && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute right-6 top-16 w-80 glass-card p-5 z-50 shadow-2xl shadow-black/50"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-white">Share Invite Link</h3>
            <button onClick={() => setShowInvite(false)} className="text-dark-500 hover:text-white">
              <Check className="w-4 h-4" />
            </button>
          </div>
          <div className="flex gap-2 p-2 rounded-lg bg-black/20 border border-white/5">
            <input
              type="text"
              value={inviteLink || 'Generating link...'}
              readOnly
              className="bg-transparent text-[0.7rem] text-dark-300 flex-1 outline-none px-1"
            />
            <button 
              onClick={handleCopy} 
              className="p-2 rounded-md bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 hover:bg-indigo-500/30 transition-colors"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5" />}
            </button>
          </div>
          <p className="text-[0.6rem] text-dark-500 mt-3 text-center">
            Friends will see the join request page when they open this link.
          </p>
        </motion.div>
      )}

      {/* Notifications Dropdown */}
      {showNotifs && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute right-6 top-16 w-80 glass-card p-4 z-50 max-h-80 overflow-y-auto shadow-2xl shadow-black/50"
        >
          <h3 className="text-sm font-semibold text-white mb-3">Recent Activity</h3>
          {notifications.length === 0 ? (
            <p className="text-xs text-dark-400 text-center py-8">No new activity</p>
          ) : (
            <div className="space-y-2">
              {notifications.slice(0, 10).map(n => (
                <div key={n.id} className="flex items-start gap-3 p-3 rounded-xl bg-white/5 border border-white/5">
                  <span className="text-sm mt-0.5">{n.type === 'success' ? '✅' : n.type === 'warning' ? '⚠️' : '📩'}</span>
                  <div className="flex-1">
                    <p className="text-xs text-dark-200 leading-relaxed">{n.message}</p>
                    <p className="text-[0.6rem] text-dark-500 mt-1 font-medium">
                      {new Date(n.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </motion.div>
      )}

      {/* Streak Banner */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="mx-6 mb-6"
      >
        <div className="glass-card p-6 relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/[0.03] to-transparent animate-shimmer" style={{ backgroundSize: '200% 100%' }} />

          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 relative z-10">
            <div className="flex items-center gap-5">
              <motion.div
                animate={{ scale: [1, 1.15, 1], rotate: [-3, 3, -3] }}
                transition={{ duration: 0.6, repeat: Infinity, repeatType: 'reverse' }}
                className="text-6xl select-none"
                style={{ filter: 'drop-shadow(0 0 20px rgba(255,107,0,0.7))' }}
              >
                🔥
              </motion.div>
              <div>
                <p className="text-[0.7rem] font-bold text-dark-500 mb-1 tracking-[0.2em] uppercase">Current Study Streak</p>
                <div className="flex items-baseline gap-3">
                  <span className="text-6xl font-display font-black fire-text drop-shadow-sm">{adminStreak}</span>
                  <span className="text-xl font-bold text-dark-400/80">Days</span>
                </div>
              </div>
            </div>

            <div className="flex gap-8 px-4 py-3 rounded-2xl bg-black/20 border border-white/5">
              <div className="text-center min-w-[70px]">
                <div className="flex items-center justify-center gap-1.5 text-cyan-400 mb-1">
                  <TrendingUp className="w-3.5 h-3.5" />
                  <span className="text-[0.55rem] font-black uppercase tracking-widest">Target</span>
                </div>
                <p className="text-2xl font-display font-black text-white">{Math.max(adminStreak, 15)}</p>
              </div>
              <div className="w-px bg-white/10 h-10 self-center" />
              <div className="text-center min-w-[70px]">
                <div className="flex items-center justify-center gap-1.5 text-purple-400 mb-1">
                  <Users className="w-3.5 h-3.5" />
                  <span className="text-[0.55rem] font-black uppercase tracking-widest">Friends</span>
                </div>
                <p className="text-2xl font-display font-black text-white">{totalFriends}</p>
              </div>
              <div className="w-px bg-white/10 h-10 self-center" />
              <div className="text-center min-w-[70px]">
                <div className="flex items-center justify-center gap-1.5 text-emerald-400 mb-1">
                  <LayoutGrid className="w-3.5 h-3.5" />
                  <span className="text-[0.55rem] font-black uppercase tracking-widest">Days</span>
                </div>
                <p className="text-2xl font-display font-black text-white">15</p>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </header>
  );
}
