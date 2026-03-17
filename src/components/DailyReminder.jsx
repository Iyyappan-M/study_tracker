import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, X } from 'lucide-react';

export default function DailyReminder() {
  const [show, setShow] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    // Show reminder 3 seconds after page load
    const timer = setTimeout(() => {
      if (!dismissed) setShow(true);
    }, 3000);

    return () => clearTimeout(timer);
  }, [dismissed]);

  // Auto-dismiss after 8 seconds
  useEffect(() => {
    if (show) {
      const timer = setTimeout(() => {
        setShow(false);
      }, 8000);
      return () => clearTimeout(timer);
    }
  }, [show]);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning! ☀️';
    if (hour < 17) return 'Good Afternoon! 🌤️';
    if (hour < 21) return 'Good Evening! 🌅';
    return 'Night Owl Mode! 🦉';
  };

  const getMotivation = () => {
    const quotes = [
      "Consistency beats talent. Keep going! 💪",
      "Small daily improvements lead to stunning results. 🚀",
      "Your future self will thank you for studying today. 📚",
      "Don't break the chain! Your streak matters. 🔥",
      "Every expert was once a beginner. Keep learning! 🌟",
      "Study hard now, celebrate later. You've got this! 🎯",
    ];
    return quotes[Math.floor(Math.random() * quotes.length)];
  };

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ x: 400, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: 400, opacity: 0 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="fixed top-4 right-4 z-50 max-w-sm"
        >
          <div className="glass-card p-4 border-l-4 border-l-indigo-500 shadow-2xl shadow-indigo-500/10">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center flex-shrink-0 mt-0.5">
                <Bell className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <h4 className="text-sm font-semibold text-white">{getGreeting()}</h4>
                  <button
                    onClick={() => { setShow(false); setDismissed(true); }}
                    className="p-1 rounded-lg hover:bg-dark-700 text-dark-500 hover:text-white transition-colors"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
                <p className="text-xs text-dark-300 leading-relaxed">
                  {getMotivation()}
                </p>
                <p className="text-[0.65rem] text-dark-500 mt-2">
                  🔔 Daily Reminder • Don't forget to log your study tasks today!
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
