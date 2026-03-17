import { motion, AnimatePresence } from 'framer-motion';
import { RotateCcw, OctagonX, MessageCircle } from 'lucide-react';
import { useState } from 'react';

export default function StreakPopup({ popup, onRestore, onEnd, onClose }) {
  const [feedback, setFeedback] = useState('');
  const [showRestore, setShowRestore] = useState(false);
  const [showEnd, setShowEnd] = useState(false);

  if (!popup) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="modal-overlay"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.8, opacity: 0, y: 30 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.8, opacity: 0, y: 30 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          onClick={(e) => e.stopPropagation()}
          className="glass-card p-8 max-w-md w-full mx-4 text-center"
        >
          {/* Fire animation */}
          <motion.div
            animate={{ scale: [1, 1.2, 1], rotate: [-5, 5, -5] }}
            transition={{ duration: 0.8, repeat: Infinity }}
            className="text-6xl mb-4 inline-block"
            style={{ filter: 'drop-shadow(0 0 20px rgba(255,107,0,0.6))' }}
          >
            💔🔥
          </motion.div>

          <h2 className="text-2xl font-display font-bold text-white mb-2">
            Streak Ended!
          </h2>
          <p className="text-dark-300 text-sm mb-2">
            <span className="text-white font-semibold">{popup.userName}'s</span> study streak of{' '}
            <span className="fire-text font-bold text-lg">{popup.streak} days</span> has ended.
          </p>
          <p className="text-dark-500 text-xs mb-6">
            Choose what to do next. A feedback comment is required.
          </p>

          {/* Feedback Input */}
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-2">
              <MessageCircle className="w-4 h-4 text-indigo-400" />
              <label className="text-xs font-medium text-dark-300">Feedback Comment</label>
            </div>
            <textarea
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              placeholder="Write your feedback here... (e.g., 'Had an emergency, will resume tomorrow')"
              className="input-glass w-full h-24 resize-none text-sm"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => {
                if (!feedback.trim()) return;
                onRestore(popup.dayId, popup.userId, feedback.trim());
              }}
              disabled={!feedback.trim()}
              className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-semibold text-sm transition-all ${
                feedback.trim()
                  ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-lg shadow-green-500/30 hover:shadow-green-500/50'
                  : 'bg-dark-700 text-dark-500 cursor-not-allowed'
              }`}
            >
              <RotateCcw className="w-4 h-4" />
              🔁 Restore Streak
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => {
                if (!feedback.trim()) return;
                onEnd(feedback.trim());
              }}
              disabled={!feedback.trim()}
              className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-semibold text-sm transition-all ${
                feedback.trim()
                  ? 'bg-gradient-to-r from-red-500 to-rose-500 text-white shadow-lg shadow-red-500/30 hover:shadow-red-500/50'
                  : 'bg-dark-700 text-dark-500 cursor-not-allowed'
              }`}
            >
              <OctagonX className="w-4 h-4" />
              🛑 End Streak
            </motion.button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
