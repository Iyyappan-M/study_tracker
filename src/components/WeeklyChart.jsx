import { motion } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { TrendingUp } from 'lucide-react';

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload) return null;

  return (
    <div className="glass-card p-3 border border-indigo-500/20 text-xs">
      <p className="text-white font-semibold mb-2">{label}</p>
      {payload.map((entry, i) => (
        <div key={i} className="flex items-center gap-2 mb-1">
          <div className="w-2.5 h-2.5 rounded-full" style={{ background: entry.color }} />
          <span className="text-dark-300">{entry.name}:</span>
          <span className="text-white font-medium">{entry.value === 100 ? '✅' : entry.value === 0 ? '❌' : '⏳'}</span>
        </div>
      ))}
    </div>
  );
};

const chartColors = ['#6366f1', '#8b5cf6', '#06b6d4', '#f59e0b', '#10b981', '#ef4444', '#ec4899'];

export default function WeeklyChart({ data, friends }) {
  const allUsers = ['admin', ...friends.map(f => f.name)];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4 }}
      className="glass-card p-5"
    >
      <div className="flex items-center gap-2 mb-5">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center">
          <TrendingUp className="w-4 h-4 text-white" />
        </div>
        <div>
          <h3 className="text-sm font-display font-bold text-white">Weekly Progress</h3>
          <p className="text-[0.65rem] text-dark-400">Last 7 days performance</p>
        </div>
      </div>

      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} barGap={2} barCategoryGap="20%">
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(99,102,241,0.08)" />
            <XAxis
              dataKey="day"
              tick={{ fill: '#64748b', fontSize: 11 }}
              tickLine={false}
              axisLine={{ stroke: 'rgba(99,102,241,0.1)' }}
            />
            <YAxis
              tick={{ fill: '#64748b', fontSize: 11 }}
              tickLine={false}
              axisLine={false}
              domain={[0, 100]}
              ticks={[0, 50, 100]}
              tickFormatter={(v) => v === 100 ? '✅' : v === 0 ? '❌' : '⏳'}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend
              wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }}
              iconType="circle"
              iconSize={8}
            />
            <Bar
              dataKey="You"
              name="You"
              fill="#6366f1"
              radius={[4, 4, 0, 0]}
              maxBarSize={20}
            />
            {friends.map((f, i) => (
              <Bar
                key={f.id}
                dataKey={f.name}
                name={f.name}
                fill={chartColors[(i + 1) % chartColors.length]}
                radius={[4, 4, 0, 0]}
                maxBarSize={20}
              />
            ))}
          </BarChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  );
}
