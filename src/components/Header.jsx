import { motion, AnimatePresence } from 'framer-motion';
import { Flame, Zap, TrendingUp, Users, Bell, LogOut, Check, LayoutGrid, ListPlus } from 'lucide-react';
import { useState } from 'react';

export default function Header({ 
  user,
  adminStreak, 
  totalFriends, 
  notifications, 
  onOpenTaskBox, 
  onLogout,
  onUpdateProfile,
  isAdmin 
}) {
  const [showNotifs, setShowNotifs] = useState(false);
  const [isEditingName, setIsEditingName] = useState(false);
  const [newName, setNewName] = useState(user?.name || '');

  const handleUpdateName = async () => {
    if (!newName.trim() || newName === user?.name) {
      setIsEditingName(false);
      return;
    }
    const success = await onUpdateProfile(newName.trim());
    if (success) setIsEditingName(false);
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
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              {isEditingName ? (
                <div className="flex items-center gap-2">
                  <input
                    autoFocus
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleUpdateName()}
                    onBlur={handleUpdateName}
                    className="bg-white/5 border border-indigo-500/30 rounded px-2 py-0.5 text-sm text-white focus:outline-none focus:ring-1 focus:ring-indigo-500 w-32"
                  />
                </div>
              ) : (
                <div className="group flex items-center gap-2 cursor-pointer" onClick={() => setIsEditingName(true)}>
                  <h1 className="text-lg font-display font-bold text-white tracking-tight">{user?.name || 'Study Streak'}</h1>
                  <ListPlus className="w-3 h-3 text-dark-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              )}
            </div>
            <p className="text-[0.65rem] text-dark-400 font-medium tracking-wider uppercase">
              {isAdmin ? 'Club Admin' : 'Study Club Member'}
            </p>
          </div>
        </motion.div>

        <div className="flex items-center gap-3">
          {/* Task Actions (Accessible to everyone) */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onOpenTaskBox}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-200 text-sm font-medium hover:bg-indigo-500/20 transition-all"
          >
            <ListPlus className="w-4 h-4" />
            <span className="hidden sm:inline">Open Task Box</span>
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

          {/* Logout Button */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onLogout}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-200 text-sm font-medium hover:bg-red-500/20 transition-all"
            title="Logout"
          >
            <LogOut className="w-4 h-4" />
            <span className="hidden sm:inline text-[0.65rem] font-black uppercase tracking-widest">Logout</span>
          </motion.button>

          {/* User Avatar */}
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center text-lg shadow-lg shadow-green-500/20 ring-1 ring-white/10 premium-aura glow-pulse" title={user?.name}>
            {user?.avatar || (isAdmin ? '👨‍💻' : '🎉')}
          </div>
        </div>
      </div>

      {/* Notifications Dropdown */}
      <AnimatePresence>
        {showNotifs && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute right-6 top-16 w-80 glass-card p-4 z-50 max-h-80 overflow-y-auto shadow-2xl shadow-black/50"
          >
            <h3 className="text-sm font-semibold text-white mb-3 flex items-center justify-between">
              Recent Activity
              <button onClick={() => setShowNotifs(false)} className="text-dark-500 hover:text-white"><Check className="w-4 h-4" /></button>
            </h3>
            {notifications.length === 0 ? (
              <div className="text-center py-12">
                <Bell className="w-8 h-8 text-dark-800 mx-auto mb-3 opacity-20" />
                <p className="text-[0.6rem] font-black text-dark-600 uppercase tracking-widest">No new activity</p>
              </div>
            ) : (
              <div className="space-y-2">
                {notifications.slice(0, 10).map(n => (
                  <div key={n.id} className="flex items-start gap-3 p-3 rounded-xl bg-white/5 border border-white/5">
                    <span className="text-sm mt-0.5">{n.type === 'success' ? '✅' : n.type === 'warning' ? '⚠️' : '📩'}</span>
                    <div className="flex-1">
                      <p className="text-xs text-dark-200 leading-relaxed font-medium">{n.message}</p>
                      <p className="text-[0.55rem] text-dark-500 mt-1 font-bold">
                        {new Date(n.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Streak Banner */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="mx-6 mb-6"
      >
        <div className="glass-card p-6 relative overflow-hidden group border-white/5 premium-aura">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/[0.03] to-transparent animate-shimmer" style={{ backgroundSize: '200% 100%' }} />

          <div className="flex flex-col sm:flex-row items-center justify-between gap-6 relative z-10">
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
                <p className="text-[0.7rem] font-black text-dark-500 mb-1 tracking-[0.2em] uppercase">Current Study Streak</p>
                <div className="flex items-baseline gap-3">
                  <span className="text-6xl font-display font-black fire-text drop-shadow-sm">{adminStreak}</span>
                  <span className="text-xl font-black text-dark-600 uppercase tracking-widest">Days</span>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap justify-center gap-6 px-6 py-4 rounded-2xl bg-black/30 border border-white/5 shadow-inner">
              <div className="text-center min-w-[70px]">
                <div className="flex items-center justify-center gap-1.5 text-cyan-400 mb-1">
                  <TrendingUp className="w-3.5 h-3.5" />
                  <span className="text-[0.5rem] font-black uppercase tracking-[0.15em]">Target</span>
                </div>
                <p className="text-2xl font-display font-black text-white">{Math.max(adminStreak, 15)}</p>
              </div>
              <div className="w-px bg-white/10 h-10 self-center hidden sm:block" />
              <div className="text-center min-w-[70px]">
                <div className="flex items-center justify-center gap-1.5 text-purple-400 mb-1">
                  <Users className="w-3.5 h-3.5" />
                  <span className="text-[0.5rem] font-black uppercase tracking-[0.15em]">Members</span>
                </div>
                <p className="text-2xl font-display font-black text-white">{totalFriends}</p>
              </div>
              <div className="w-px bg-white/10 h-10 self-center hidden sm:block" />
              <div className="text-center min-w-[70px]">
                <div className="flex items-center justify-center gap-1.5 text-emerald-400 mb-1">
                  <LayoutGrid className="w-3.5 h-3.5" />
                  <span className="text-[0.5rem] font-black uppercase tracking-[0.15em]">Plan</span>
                </div>
                <p className="text-2xl font-display font-black text-white">15D</p>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </header>
  );
}
