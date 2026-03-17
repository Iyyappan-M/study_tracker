import { motion } from 'framer-motion';
import { Trophy, Flame, Target, Medal } from 'lucide-react';

const rankColors = {
  1: { bg: 'from-yellow-500/20 to-amber-500/10', border: 'border-yellow-500/40', text: 'text-yellow-300', icon: '🥇' },
  2: { bg: 'from-gray-400/20 to-slate-400/10', border: 'border-gray-400/40', text: 'text-gray-300', icon: '🥈' },
  3: { bg: 'from-amber-700/20 to-orange-700/10', border: 'border-amber-700/40', text: 'text-amber-400', icon: '🥉' },
};

export default function Leaderboard({ data }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.6 }}
      className="glass-card p-5"
    >
      <div className="flex items-center gap-2 mb-5">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center">
          <Trophy className="w-4 h-4 text-white" />
        </div>
        <div>
          <h3 className="text-sm font-display font-bold text-white">Leaderboard</h3>
          <p className="text-[0.65rem] text-dark-400">Who's studying the most?</p>
        </div>
      </div>

      <div className="space-y-2.5">
        {data.map((user, i) => {
          const rank = i + 1;
          const style = rankColors[rank] || { bg: '', border: 'border-dark-700', text: 'text-dark-300', icon: `#${rank}` };
          const completionRate = user.totalDays > 0 ? Math.round((user.totalCompleted / user.totalDays) * 100) : 0;

          return (
            <motion.div
              key={user.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 * rank }}
              className={`leaderboard-row ${rank <= 3 ? `leaderboard-rank-${rank}` : ''}`}
            >
              {/* Rank */}
              <div className="text-lg font-bold min-w-[32px] text-center">
                {rank <= 3 ? style.icon : <span className="text-dark-500 text-sm">#{rank}</span>}
              </div>

              {/* Avatar */}
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border border-indigo-500/20 flex items-center justify-center text-lg">
                {user.avatar}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-white truncate">{user.name}</span>
                  {user.role === 'admin' && (
                    <span className="text-[0.55rem] px-1.5 py-0.5 rounded-full bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 font-semibold uppercase tracking-wider">
                      Admin
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-3 mt-1">
                  <span className="flex items-center gap-1 text-[0.65rem] text-dark-400">
                    <Flame className="w-3 h-3 text-orange-400" />
                    {user.streak} streak
                  </span>
                  <span className="flex items-center gap-1 text-[0.65rem] text-dark-400">
                    <Target className="w-3 h-3 text-green-400" />
                    {completionRate}% rate
                  </span>
                </div>
              </div>

              {/* Stats */}
              <div className="text-right">
                <p className="text-lg font-display font-bold text-white">{user.totalCompleted}</p>
                <p className="text-[0.6rem] text-dark-500 uppercase tracking-wider">completed</p>
              </div>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}
