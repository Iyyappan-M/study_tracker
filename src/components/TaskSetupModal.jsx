import { motion, AnimatePresence } from 'framer-motion';
import { X, Plus, Save, ListTodo, Sparkles } from 'lucide-react';
import { useState } from 'react';

export default function TaskSetupModal({ isOpen, onClose, onSave }) {
  const [tasks, setTasks] = useState(['']);

  const addTaskField = () => setTasks([...tasks, '']);
  const updateTask = (index, value) => {
    const newTasks = [...tasks];
    newTasks[index] = value;
    setTasks(newTasks);
  };
  const removeTask = (index) => {
    if (tasks.length > 1) {
      setTasks(tasks.filter((_, i) => i !== index));
    }
  };

  const handleSave = () => {
    const validTasks = tasks.map(t => t.trim()).filter(t => t !== '');
    if (validTasks.length > 0) {
      onSave(validTasks);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          className="glass-card w-full max-w-lg overflow-hidden flex flex-col"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-white/10 bg-gradient-to-r from-indigo-500/10 to-purple-500/10">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/25">
                <ListTodo className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-display font-bold text-white">Setup Study Plan</h2>
                <p className="text-xs text-dark-400 mt-0.5">Tasks will repeat for the next 15 days</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-white/5 text-dark-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6 max-h-[60vh] overflow-y-auto custom-scrollbar">
            <div className="space-y-3">
              {tasks.map((task, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="flex gap-2"
                >
                  <div className="flex-none w-8 h-10 flex items-center justify-center text-indigo-400 font-bold font-display">
                    {index + 1}.
                  </div>
                  <input
                    autoFocus={index === tasks.length - 1}
                    value={task}
                    onChange={(e) => updateTask(index, e.target.value)}
                    placeholder={`Task ${index + 1} (e.g. DSA Practice)`}
                    className="input-glass flex-1"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') addTaskField();
                    }}
                  />
                  {tasks.length > 1 && (
                    <button
                      onClick={() => removeTask(index)}
                      className="p-2 text-dark-500 hover:text-red-400 hover:bg-red-500/5 rounded-lg transition-all"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </motion.div>
              ))}
            </div>

            <button
              onClick={addTaskField}
              className="mt-4 flex items-center gap-2 text-sm font-semibold text-indigo-400 hover:text-indigo-300 transition-colors px-2 py-1"
            >
              <Plus className="w-4 h-4" />
              Add another task
            </button>
          </div>

          {/* Footer */}
          <div className="p-6 border-t border-white/10 bg-dark-900/50 flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 py-3 px-4 rounded-xl border border-white/10 text-white font-semibold hover:bg-white/5 transition-all text-sm"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-semibold shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 transition-all flex items-center justify-center gap-2 text-sm group"
            >
              <Save className="w-4 h-4" />
              Save Plan
              <Sparkles className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
