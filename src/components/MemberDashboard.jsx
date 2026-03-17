import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Flame, Target, ChevronRight, Crown, Users, Sparkles, UserPlus, Check, X, Mail, ShieldAlert, Trash2, ShieldCheck } from 'lucide-react';
import { getDayStatus } from '../store';

export default function MemberDashboard({ 
  members, 
  calculateStreak, 
  getRowsForMember, 
  isAdmin, 
  joinRequests = [], 
  onAcceptRequest, 
  onRejectRequest,
  onRemoveMember 
}) {
  const navigate = useNavigate();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className="mx-6 mb-12"
    >
      {/* ─── Admin Control Panel ─────────────────────────────────── */}
      {isAdmin && (
        <section className="mb-12">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/25">
              <ShieldCheck className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-display font-black text-white uppercase tracking-tight">Admin Control Panel</h2>
              <p className="text-[0.65rem] text-dark-500 font-bold uppercase tracking-[0.2em] mt-1">Manage club members and pending approvals</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Pending Requests */}
            <div className="glass-card overflow-hidden">
               <div className="px-6 py-4 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
                  <h3 className="text-xs font-black text-amber-400 uppercase tracking-widest flex items-center gap-2">
                    <UserPlus className="w-4 h-4" /> Pending Requests
                  </h3>
                  <span className="text-[0.6rem] font-black px-2 py-0.5 rounded bg-amber-500/10 text-amber-500">{joinRequests.length}</span>
               </div>
               <div className="max-h-[300px] overflow-y-auto custom-scrollbar">
                  {joinRequests.length === 0 ? (
                    <div className="p-8 text-center">
                      <p className="text-[0.65rem] text-dark-600 font-bold uppercase tracking-widest">No pending requests</p>
                    </div>
                  ) : (
                    <table className="w-full text-left">
                      <tbody className="divide-y divide-white/5">
                        {joinRequests.map(req => (
                          <tr key={req.id} className="hover:bg-white/[0.01] transition-colors">
                            <td className="px-6 py-4 flex items-center gap-3">
                              <div className="w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center text-xs">👤</div>
                              <div>
                                <p className="text-sm font-bold text-white leading-none">{req.name}</p>
                                <p className="text-[0.6rem] text-dark-500 mt-1 font-medium">{req.email}</p>
                              </div>
                            </td>
                            <td className="px-6 py-4 text-right">
                              <div className="flex items-center justify-end gap-2">
                                <button onClick={() => onAcceptRequest(req.id)} className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 transition-all">
                                  <Check className="w-3.5 h-3.5" />
                                </button>
                                <button onClick={() => onRejectRequest(req.id)} className="p-2 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-all">
                                  <X className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
               </div>
            </div>

            {/* Members Directory */}
            <div className="glass-card overflow-hidden">
               <div className="px-6 py-4 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
                  <h3 className="text-xs font-black text-indigo-400 uppercase tracking-widest flex items-center gap-2">
                    <Users className="w-4 h-4" /> Club Member Directory
                  </h3>
                  <span className="text-[0.6rem] font-black px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-500">{members.length}</span>
               </div>
               <div className="max-h-[300px] overflow-y-auto custom-scrollbar">
                  <table className="w-full text-left">
                    <tbody className="divide-y divide-white/5">
                      {members.map(m => (
                        <tr key={m.id} className="hover:bg-white/[0.01] transition-colors">
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <span className="text-xl">{m.avatar}</span>
                              <div>
                                <p className="text-sm font-bold text-white leading-none">{m.name} {m.role === 'admin' && '👑'}</p>
                                <p className="text-[0.6rem] text-dark-500 mt-1 font-black uppercase tracking-widest">{m.role}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-right">
                            {m.role !== 'admin' && (
                              <button 
                                onClick={() => onRemoveMember(m.id)}
                                className="flex items-center gap-2 ml-auto px-3 py-1.5 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/10 transition-all text-[0.6rem] font-black uppercase tracking-widest group"
                              >
                                <Trash2 className="w-3 h-3 transition-transform group-hover:scale-110" />
                                Remove
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
               </div>
            </div>
          </div>
        </section>
      )}

      {/* ─── Public Member List Header ─────────────────────────── */}
      <div className="flex items-center justify-between mb-8 pt-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 flex items-center justify-center border border-indigo-500/20">
            <Sparkles className="w-6 h-6 text-indigo-400" />
          </div>
          <div>
            <h2 className="text-2xl font-display font-black text-white tracking-tight uppercase">The Focus Club</h2>
            <p className="text-[0.65rem] text-dark-500 font-bold uppercase tracking-[0.3em] mt-1 italic">Real-time Study Accountability</p>
          </div>
        </div>
      </div>

      {/* Member Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {members.map((member, i) => {
          const streak = calculateStreak(member.id);
          const days = getRowsForMember(member.id);
          const totalTasks = days.reduce((acc, d) => acc + d.tasks.length, 0);
          const completedTasks = days.reduce((acc, d) => acc + d.tasks.filter(t => t.completed === true).length, 0);
          const rate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

          return (
            <motion.div
              key={member.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 + i * 0.08 }}
              whileHover={{ y: -8 }}
              onClick={() => navigate(`/member/${member.username}`)}
              className="glass-card p-6 cursor-pointer group flex flex-col h-full border-white/5 hover:border-indigo-500/30"
            >
              <div className="flex items-start justify-between mb-6">
                <div className="w-16 h-16 rounded-[1.5rem] bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border border-white/10 flex items-center justify-center text-3xl shadow-2xl group-hover:rotate-6 transition-transform">
                  {member.avatar}
                </div>
                {member.role === 'admin' && (
                  <span className="text-[0.55rem] font-black uppercase tracking-[0.2em] px-2 py-1 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">Admin</span>
                )}
              </div>

              <div className="mb-6 flex-1">
                <h3 className="text-xl font-display font-black text-white group-hover:text-indigo-300 transition-colors uppercase tracking-tight truncate">
                  {member.name}
                </h3>
                <p className="text-[0.65rem] text-dark-500 font-bold uppercase tracking-widest mt-1">@{member.username}</p>
              </div>

              <div className="grid grid-cols-2 gap-3 mb-6 bg-black/20 p-4 rounded-2xl border border-white/5">
                <div>
                  <p className="text-[0.5rem] text-dark-600 font-black uppercase tracking-widest mb-1.5">Streak</p>
                  <div className="flex items-center gap-2">
                    <span className="text-lg font-display font-black text-white italic">🔥 {streak}</span>
                  </div>
                </div>
                <div>
                  <p className="text-[0.5rem] text-dark-600 font-black uppercase tracking-widest mb-1.5">Focus Rate</p>
                  <p className="text-lg font-display font-black text-white italic">{rate}%</p>
                </div>
              </div>

              <div className="mt-auto pt-6 border-t border-white/5 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse" />
                  <span className="text-[0.6rem] text-dark-500 font-black uppercase tracking-widest">Active Tracker</span>
                </div>
                <ChevronRight className="w-4 h-4 text-dark-600 group-hover:text-indigo-400 group-hover:translate-x-1 transition-all" />
              </div>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}
