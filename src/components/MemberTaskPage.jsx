import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Check, X, Trash2, Edit3, Plus, Flame, Target, Calendar, MessageSquare, ChevronDown, ChevronRight, Settings2, Sparkles } from 'lucide-react';
import { useState } from 'react';
import { format } from 'date-fns';
import { getDayStatus } from '../store';

export default function MemberTaskPage({
  getMember,
  getRowsForMember,
  calculateStreak,
  addDay,
  deleteDay,
  addTask,
  updateTask,
  deleteTask,
  toggleTaskStatus,
  updateTaskFeedback,
  updateTaskGlobally,
  currentUserRole,
}) {
  const { username: memberId } = useParams();
  const navigate = useNavigate();

  const member = getMember(memberId);
  const mid = member?._id;
  const days = mid ? getRowsForMember(mid) : [];
  const streak = mid ? calculateStreak(mid) : 0;

  const [editingCell, setEditingCell] = useState(null);
  const [editValue, setEditValue] = useState('');
  const [addingTaskForDay, setAddingTaskForDay] = useState(null);
  const [newTaskName, setNewTaskName] = useState('');
  const [collapsedDays, setCollapsedDays] = useState({});
  const [globalEditMode, setGlobalEditMode] = useState(false);

  const isAdmin = currentUserRole === 'admin';

  if (!member) {
    return (
      <div className="mx-6 mt-10 text-center">
        <div className="glass-card p-10 max-w-md mx-auto">
          <p className="text-4xl mb-4">😕</p>
          <h2 className="text-xl font-display font-bold text-white mb-2">Member Not Found</h2>
          <p className="text-sm text-dark-400 mb-6">The member with ID "{memberId}" doesn't exist.</p>
          <button onClick={() => navigate('/dashboard')} className="btn-primary uppercase tracking-widest text-[0.6rem] font-black">← Back to Dashboard</button>
        </div>
      </div>
    );
  }

  const sortedDays = [...days].sort((a, b) => new Date(b.date) - new Date(a.date));

  // Stats
  const completedDays = days.filter(d => getDayStatus(d.tasks) === true).length;
  const missedDays = days.filter(d => getDayStatus(d.tasks) === false).length;
  const totalTasks = days.reduce((acc, d) => acc + d.tasks.length, 0);
  const completedTasks = days.reduce((acc, d) => acc + d.tasks.filter(t => t.completed === true).length, 0);
  const rate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  // ─── inline edit helpers ───────────────────────────────────
  const startEdit = (dayId, taskId, field, currentValue) => {
    setEditingCell({ dayId, taskId, field });
    setEditValue(currentValue || '');
  };

  const saveEdit = (oldValue) => {
    if (!editingCell) return;
    const { dayId, taskId, field } = editingCell;
    
    if (field === 'name') {
      if (globalEditMode) {
        updateTaskGlobally(mid, oldValue, editValue);
      } else {
        updateTask(mid, dayId, taskId, { name: editValue });
      }
    } else {
      updateTaskFeedback(mid, dayId, taskId, field, editValue);
    }
    setEditingCell(null);
    setEditValue('');
  };

  const handleKeyDown = (e, oldValue) => {
    if (e.key === 'Enter') saveEdit(oldValue);
    if (e.key === 'Escape') { setEditingCell(null); setEditValue(''); }
  };

  const toggleCollapse = (dayId) => {
    setCollapsedDays(prev => ({ ...prev, [dayId]: !prev[dayId] }));
  };

  // ─── Editable Cell ─────────────────────────────────────────
  const EditableCell = ({ dayId, taskId, field, value, placeholder, canEdit }) => {
    const isEditing = editingCell?.dayId === dayId && editingCell?.taskId === taskId && editingCell?.field === field;

    if (isEditing) {
      return (
        <input autoFocus value={editValue} onChange={e => setEditValue(e.target.value)}
          onBlur={() => saveEdit(value)} onKeyDown={(e) => handleKeyDown(e, value)}
          className="input-glass text-[0.7rem] w-full py-1 h-7 border-indigo-500/50" placeholder={placeholder} />
      );
    }

    return (
      <div
        onClick={() => canEdit && startEdit(dayId, taskId, field, value)}
        className={`group flex items-center gap-2 min-h-[28px] ${canEdit ? 'cursor-pointer' : ''}`}
      >
        <span className={`text-[0.7rem] font-medium leading-relaxed ${value ? 'text-dark-100' : 'text-dark-600 italic'}`}>
          {value || placeholder}
        </span>
        {canEdit && (
          <Edit3 className={`w-3 h-3 text-indigo-400 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0 ${globalEditMode && field === 'name' ? 'opacity-100' : ''}`} />
        )}
      </div>
    );
  };

  const StatusButton = ({ completed, onComplete, onIncomplete, canEdit }) => (
    <div className="flex gap-1.5">
      <motion.button 
        whileHover={canEdit ? { scale: 1.15 } : {}} 
        whileTap={canEdit ? { scale: 0.9 } : {}}
        onClick={canEdit ? onComplete : undefined}
        className={`w-7 h-7 rounded-lg flex items-center justify-center transition-all ${
          completed === true
            ? 'bg-emerald-500/30 border border-emerald-400 text-emerald-300 shadow-lg shadow-emerald-500/20'
            : 'bg-dark-800 border border-dark-600 text-dark-600 hover:border-emerald-500/50 hover:text-emerald-500'
        } ${!canEdit ? 'cursor-default' : ''}`}>
        <Check className="w-3.5 h-3.5" />
      </motion.button>
      <motion.button 
        whileHover={canEdit ? { scale: 1.15 } : {}} 
        whileTap={canEdit ? { scale: 0.9 } : {}}
        onClick={canEdit ? onIncomplete : undefined}
        className={`w-7 h-7 rounded-lg flex items-center justify-center transition-all ${
          completed === false
            ? 'bg-red-500/30 border border-red-400 text-red-300 shadow-lg shadow-red-500/20'
            : 'bg-dark-800 border border-dark-600 text-dark-600 hover:border-red-500/50 hover:text-red-500'
        } ${!canEdit ? 'cursor-default' : ''}`}>
        <X className="w-3.5 h-3.5" />
      </motion.button>
    </div>
  );

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mx-6 mb-8">
      {/* Back + Profile Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <button onClick={() => navigate('/dashboard')}
          className="flex items-center gap-2 text-[0.65rem] font-black uppercase tracking-widest text-dark-500 hover:text-indigo-400 transition-colors mb-6 group">
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          <span>Back to Dashboard</span>
        </button>

        <div className="glass-card p-8 relative overflow-hidden group border-white/5">
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-purple-500/5" />
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/[0.02] to-transparent animate-shimmer" style={{ backgroundSize: '200% 100%' }} />

          <div className="flex flex-col lg:flex-row items-center justify-between gap-8 relative z-10">
            <div className="flex items-center gap-6">
              <div className="w-20 h-20 rounded-[2rem] bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-4xl shadow-2xl shadow-indigo-500/20 rotate-3 group-hover:rotate-0 transition-transform duration-500">
                {member.avatar || '👤'}
              </div>
              <div>
                <div className="flex items-center gap-3 mb-1.5">
                  <h2 className="text-3xl font-display font-black text-white leading-tight uppercase tracking-tight">{member.name}</h2>
                  {member.role === 'admin' && (
                    <span className="text-[0.6rem] px-2 py-1 rounded bg-amber-500/10 border border-amber-500/20 text-amber-400 font-black uppercase tracking-[0.2em]">Admin</span>
                  )}
                </div>
                <div className="flex items-center gap-4">
                  <p className="text-[0.65rem] text-dark-600 font-black uppercase tracking-widest">UID: {mid.substring(0, 12)}</p>
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  <p className="text-[0.6rem] text-dark-500 font-black uppercase tracking-widest italic">Personal Tracker</p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-10">
              <div className="flex items-center gap-3">
                <motion.span
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                  className="text-4xl"
                  style={{ filter: 'drop-shadow(0 0 10px rgba(255,107,0,0.5))' }}>🔥</motion.span>
                <div>
                  <p className="text-4xl font-display font-black fire-text leading-none">{streak}</p>
                  <p className="text-[0.6rem] text-dark-500 uppercase tracking-[0.2em] font-black mt-1">Streak</p>
                </div>
              </div>
              <div className="w-px h-12 bg-white/5" />
              <div className="text-center">
                <div className="flex items-center justify-center gap-1.5 text-emerald-400 mb-1.5">
                  <Target className="w-4 h-4" />
                  <span className="text-[0.55rem] font-black uppercase tracking-[0.2em]">Rate</span>
                </div>
                <p className="text-2xl font-display font-black text-white leading-none">{rate}%</p>
              </div>
              <div className="w-px h-12 bg-white/5" />
              <div className="text-center">
                <div className="flex items-center justify-center gap-1.5 text-indigo-400 mb-1.5">
                  <Calendar className="w-4 h-4" />
                  <span className="text-[0.55rem] font-black uppercase tracking-[0.2em]">Tasks</span>
                </div>
                <p className="text-2xl font-display font-black text-white leading-none">{totalTasks}</p>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Mini Stat Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Completed Days', value: completedDays, icon: '✅', color: 'bg-emerald-500' },
          { label: 'Missed Days', value: missedDays, icon: '❌', color: 'bg-red-500' },
          { label: 'Tasks Done', value: completedTasks, icon: '🎯', color: 'bg-indigo-500' },
          { label: 'Total Logs', value: days.length, icon: '📊', color: 'bg-amber-500' },
        ].map((stat, i) => (
          <motion.div key={stat.label} 
            initial={{ opacity: 0, y: 10 }} 
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 + i * 0.08 }}
            className="glass-card p-5 flex items-center gap-4 border border-white/5 hover:border-white/10 transition-colors shadow-inner"
          >
            <div className={`w-12 h-12 rounded-2xl ${stat.color}/10 flex items-center justify-center`}>
              <span className="text-xl">{stat.icon}</span>
            </div>
            <div>
              <p className="text-[0.6rem] text-dark-500 uppercase tracking-widest font-black mb-1">{stat.label}</p>
              <p className="text-2xl font-display font-black text-white leading-none">{stat.value}</p>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="space-y-6">
        {isAdmin && (
          <div className="flex flex-wrap gap-4 mb-2">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => addDay(mid)}
              className="flex-1 min-w-[200px] py-4 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl text-white text-[0.7rem] font-black uppercase tracking-[0.2em] shadow-xl shadow-indigo-500/20 flex items-center justify-center gap-3 group"
            >
              <Plus className="w-4 h-4 group-hover:rotate-90 transition-transform" />
              Add Today's Entry
              <Sparkles className="w-3.5 h-3.5" />
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setGlobalEditMode(!globalEditMode)}
              className={`flex-1 min-w-[200px] py-4 rounded-2xl text-[0.7rem] font-black uppercase tracking-[0.2em] border transition-all flex items-center justify-center gap-3 ${
                globalEditMode 
                  ? 'bg-amber-500/10 border-amber-500/30 text-amber-400 shadow-xl shadow-amber-500/10' 
                  : 'bg-white/5 border-white/10 text-dark-300 hover:bg-white/10'
              }`}
            >
              <Settings2 className={`w-4 h-4 ${globalEditMode ? 'animate-spin-slow' : ''}`} />
              {globalEditMode ? 'Editing Global Plan...' : 'Modify Global Plan'}
            </motion.button>
          </div>
        )}

        <AnimatePresence>
          {sortedDays.map((day, dayIdx) => {
            const dayStatus = getDayStatus(day.tasks);
            const isCollapsed = collapsedDays[day.id];
            const dayCompleted = day.tasks.filter(t => t.completed === true).length;
            const dayTotal = day.tasks.length;
            const dayRate = dayTotal > 0 ? Math.round((dayCompleted / dayTotal) * 100) : 0;

            const cardBg = dayStatus === true
              ? 'bg-emerald-500/5 border-emerald-500/20'
              : dayStatus === false
                ? 'bg-red-500/5 border-red-500/20'
                : 'bg-white/5 border-white/5';

            return (
              <motion.div
                key={day.id}
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: dayIdx * 0.05 }}
                className={`glass-card overflow-hidden border transition-all duration-500 ${cardBg}`}
              >
                <div
                  className="flex items-center justify-between p-6 cursor-pointer hover:bg-white/[0.02] transition-colors"
                  onClick={() => toggleCollapse(day.id)}
                >
                  <div className="flex items-center gap-5">
                    <motion.div animate={{ rotate: isCollapsed ? 0 : 90 }} transition={{ duration: 0.3 }}>
                      <ChevronRight className="w-5 h-5 text-dark-500" />
                    </motion.div>
                    <div>
                      <span className="text-lg font-display font-black text-indigo-200 tracking-tight">
                        {format(new Date(day.date), 'EEEE, MMM dd')}
                      </span>
                      <div className="flex items-center gap-4 mt-1.5">
                        <div className="flex items-center gap-2">
                          <Check className={`w-3 h-3 ${dayStatus === true ? 'text-emerald-400' : 'text-dark-600'}`} />
                          <span className="text-[0.6rem] font-black text-dark-500 uppercase tracking-widest">
                            {dayCompleted}/{dayTotal}
                          </span>
                        </div>
                        {dayStatus === true && (
                          <span className="text-[0.5rem] font-black uppercase tracking-widest px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 ring-1 ring-emerald-500/20">Great Day!</span>
                        )}
                        {dayStatus === false && (
                          <span className="text-[0.5rem] font-black uppercase tracking-widest px-2 py-0.5 rounded-md bg-red-500/20 text-red-400 border border-red-500/30">Incomplete</span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-6">
                    <div className="hidden sm:flex items-center gap-3">
                      <div className="w-32 h-1.5 rounded-full bg-black/40 overflow-hidden shadow-inner">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${dayRate}%` }}
                          className="h-full rounded-full"
                          style={{
                            background: dayRate === 100 ? 'linear-gradient(90deg, #10b981, #34d399)'
                              : dayRate >= 50 ? 'linear-gradient(90deg, #6366f1, #818cf8)'
                              : 'linear-gradient(90deg, #ef4444, #f87171)',
                          }}
                        />
                      </div>
                      <span className="text-[0.65rem] font-black text-dark-400 min-w-[32px]">{dayRate}%</span>
                    </div>

                    {isAdmin && (
                      <motion.button
                        whileHover={{ scale: 1.1, rotate: 10 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={(e) => { e.stopPropagation(); deleteDay(mid, day.id); }}
                        className="p-2.5 rounded-xl text-dark-600 hover:text-red-400 hover:bg-red-500/10 transition-all"
                      >
                        <Trash2 className="w-4 h-4" />
                      </motion.button>
                    )}
                  </div>
                </div>

                <AnimatePresence>
                  {!isCollapsed && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.4, ease: "circOut" }}
                      className="overflow-hidden"
                    >
                      <div className="px-6 pb-6">
                        <div className="overflow-x-auto rounded-2xl border border-white/5 bg-black/5">
                          <table className="w-full text-left border-collapse">
                            <thead>
                              <tr className="bg-black/20 border-b border-white/5">
                                <th className="px-5 py-4 w-12 text-[0.6rem] font-black text-dark-500 uppercase tracking-widest">#</th>
                                <th className="px-5 py-4 text-[0.6rem] font-black text-dark-500 uppercase tracking-widest">Description</th>
                                <th className="px-5 py-4 w-28 text-[0.6rem] font-black text-dark-500 uppercase tracking-widest text-center">Status</th>
                                <th className="px-5 py-4 text-[0.6rem] font-black text-dark-500 uppercase tracking-widest">Feedback</th>
                                <th className="px-5 py-4 text-[0.6rem] font-black text-dark-500 uppercase tracking-widest text-right">Review</th>
                                {isAdmin && <th className="px-5 py-4 w-12"></th>}
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-white/[0.03]">
                              <AnimatePresence>
                                {day.tasks.map((task, tIdx) => (
                                  <motion.tr
                                    key={task.id}
                                    initial={{ opacity: 0, y: 5 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: tIdx * 0.03 }}
                                    className={`group/row transition-colors ${
                                      task.completed === true ? 'bg-emerald-500/[0.02]' : 
                                      task.completed === false ? 'bg-red-500/[0.01]' : ''
                                    }`}
                                  >
                                    <td className="px-5 py-4">
                                      <span className="text-[0.6rem] font-black text-dark-700 group-hover/row:text-indigo-400 transition-colors">0{tIdx + 1}</span>
                                    </td>
                                    <td className="px-5 py-4">
                                      <EditableCell
                                        dayId={day.id} taskId={task.id} field="name"
                                        value={task.name} placeholder="Study task"
                                        canEdit={isAdmin}
                                      />
                                    </td>
                                    <td className="px-5 py-4">
                                      <div className="flex justify-center">
                                        <StatusButton
                                          completed={task.completed}
                                          onComplete={() => toggleTaskStatus(mid, day.id, task.id, true)}
                                          onIncomplete={() => toggleTaskStatus(mid, day.id, task.id, false)}
                                          canEdit={isAdmin || mid === store?.user?._id}
                                        />
                                      </div>
                                    </td>
                                    <td className="px-5 py-4">
                                      <EditableCell
                                        dayId={day.id} taskId={task.id} field="myFeedback"
                                        value={task.myFeedback} placeholder="Add personal note..."
                                        canEdit={mid === store?.user?._id || isAdmin}
                                      />
                                    </td>
                                    <td className="px-5 py-4 text-right">
                                      <EditableCell
                                        dayId={day.id} taskId={task.id} field="friendFeedback"
                                        value={task.friendFeedback} placeholder="..."
                                        canEdit={isAdmin}
                                      />
                                    </td>
                                    {isAdmin && (
                                      <td className="px-5 py-4 text-center">
                                        <button
                                          onClick={() => deleteTask(mid, day.id, task.id)}
                                          className="p-1.5 rounded-lg text-dark-600 hover:text-red-400 hover:bg-red-500/10 transition-all opacity-0 group-hover/row:opacity-100"
                                        >
                                          <Trash2 className="w-3.5 h-3.5" />
                                        </button>
                                      </td>
                                    )}
                                  </motion.tr>
                                ))}
                              </AnimatePresence>
                            </tbody>
                          </table>
                        </div>

                        {isAdmin && (
                          <div className="mt-5">
                            <AnimatePresence>
                              {addingTaskForDay === day.id ? (
                                <motion.div
                                  initial={{ height: 0, opacity: 0 }}
                                  animate={{ height: 'auto', opacity: 1 }}
                                  exit={{ height: 0, opacity: 0 }}
                                  className="overflow-hidden"
                                >
                                  <div className="flex gap-2 glass-light p-3 rounded-2xl border border-white/5">
                                    <input
                                      autoFocus
                                      value={newTaskName}
                                      onChange={e => setNewTaskName(e.target.value)}
                                      placeholder="New study goal..."
                                      className="input-glass flex-1 text-xs font-bold"
                                      onKeyDown={e => {
                                        if (e.key === 'Enter' && newTaskName.trim()) {
                                          addTask(mid, day.id, newTaskName.trim());
                                          setNewTaskName('');
                                        }
                                        if (e.key === 'Escape') {
                                          setAddingTaskForDay(null);
                                          setNewTaskName('');
                                        }
                                      }}
                                    />
                                    <button
                                      onClick={() => {
                                        if (newTaskName.trim()) {
                                          addTask(mid, day.id, newTaskName.trim());
                                          setNewTaskName('');
                                        }
                                      }}
                                      className="px-5 py-2.5 rounded-xl bg-indigo-500 text-white font-black uppercase tracking-widest text-[0.6rem] shadow-lg shadow-indigo-500/20"
                                    >
                                      Add Task
                                    </button>
                                  </div>
                                </motion.div>
                              ) : (
                                <motion.button
                                  whileHover={{ scale: 1.005, y: -2 }}
                                  whileTap={{ scale: 0.995 }}
                                  onClick={() => { setAddingTaskForDay(day.id); setNewTaskName(''); }}
                                  className="w-full py-4 rounded-2xl border-2 border-dashed border-indigo-500/10 text-indigo-400/40
                                    hover:border-indigo-500/30 hover:text-indigo-300 hover:bg-indigo-500/5
                                    transition-all flex items-center justify-center gap-3 text-[0.6rem] font-black uppercase tracking-[0.2em]"
                                >
                                  <Plus className="w-4 h-4" />
                                  Insert New Tracker
                                </motion.button>
                              )}
                            </AnimatePresence>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
