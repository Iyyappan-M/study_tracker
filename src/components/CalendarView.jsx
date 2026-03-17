import { motion } from 'framer-motion';
import { Calendar as CalIcon, ChevronLeft, ChevronRight } from 'lucide-react';
import { useState } from 'react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, getDay, addMonths, subMonths, isSameDay, isToday } from 'date-fns';
import { getDayStatus } from '../store';

export default function CalendarView({ rows }) {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });
  const startDayOfWeek = getDay(monthStart);

  const getStatus = (date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    const dayEntry = rows.find(r => r.date === dateStr);
    if (!dayEntry) return null;
    const status = getDayStatus(dayEntry.tasks);
    if (status === true) return 'completed';
    if (status === false) return 'incomplete';
    return 'pending';
  };

  const completedCount = rows.filter(r => getDayStatus(r.tasks) === true).length;
  const totalCount = rows.length;
  const completionRate = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5 }}
      className="glass-card p-5"
    >
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center">
            <CalIcon className="w-4 h-4 text-white" />
          </div>
          <div>
            <h3 className="text-sm font-display font-bold text-white">Calendar</h3>
            <p className="text-[0.65rem] text-dark-400">{completionRate}% completion rate</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
            className="p-1.5 rounded-lg glass-light text-dark-400 hover:text-white transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="text-sm font-semibold text-white min-w-[100px] text-center">
            {format(currentMonth, 'MMMM yyyy')}
          </span>
          <button
            onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
            className="p-1.5 rounded-lg glass-light text-dark-400 hover:text-white transition-colors"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Day headers */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
          <div key={d} className="text-center text-[0.6rem] font-semibold text-dark-500 uppercase tracking-wider py-1">
            {d}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-1">
        {/* Empty cells for offset */}
        {Array.from({ length: startDayOfWeek }).map((_, i) => (
          <div key={`empty-${i}`} className="calendar-day" />
        ))}

        {daysInMonth.map(day => {
          const status = getStatus(day);
          const today = isToday(day);

          return (
            <motion.div
              key={day.toISOString()}
              whileHover={{ scale: 1.1 }}
              className={`calendar-day ${status || ''} ${today ? 'today' : ''}`}
              title={`${format(day, 'MMM dd')} - ${status || 'No data'}`}
            >
              {format(day, 'd')}
            </motion.div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 mt-4 justify-center">
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded bg-green-500/40 border border-green-500/60" />
          <span className="text-[0.65rem] text-dark-400">Completed</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded bg-red-500/40 border border-red-500/60" />
          <span className="text-[0.65rem] text-dark-400">Missed</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded border-2 border-indigo-500" />
          <span className="text-[0.65rem] text-dark-400">Today</span>
        </div>
      </div>

      {/* Progress bar */}
      <div className="mt-4">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-[0.65rem] text-dark-400">Monthly Progress</span>
          <span className="text-[0.65rem] font-semibold text-indigo-300">{completedCount}/{totalCount} days</span>
        </div>
        <div className="progress-bar">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${completionRate}%` }}
            transition={{ duration: 1, delay: 0.5 }}
            className="progress-fill"
          />
        </div>
      </div>
    </motion.div>
  );
}
