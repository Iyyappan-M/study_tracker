import { motion, AnimatePresence } from 'framer-motion';
import { Check, X, Trash2, Edit3, MessageSquare, Plus } from 'lucide-react';
import { useState } from 'react';
import { format } from 'date-fns';

export default function TrackerTable({
  rows,
  friends,
  onToggleAdmin,
  onToggleFriend,
  onUpdateFeedback,
  onUpdateFriendFeedback,
  onUpdateFriendTasks,
  onDeleteRow,
  onAddRow,
  onUpdateRow,
}) {
  const [editingCell, setEditingCell] = useState(null);
  const [editValue, setEditValue] = useState('');
  const [newTask, setNewTask] = useState('');
  const [showAddRow, setShowAddRow] = useState(false);

  const startEdit = (rowId, field, currentValue) => {
    setEditingCell({ rowId, field });
    setEditValue(currentValue || '');
  };

  const saveEdit = () => {
    if (!editingCell) return;
    const { rowId, field } = editingCell;

    if (field === 'adminTasks') {
      onUpdateRow(rowId, { adminTasks: editValue });
    } else if (field === 'adminFeedback') {
      onUpdateFeedback(rowId, 'adminFeedback', editValue);
    } else if (field.startsWith('friendFeedback-')) {
      const friendId = field.replace('friendFeedback-', '');
      onUpdateFriendFeedback(rowId, friendId, editValue);
    } else if (field.startsWith('friendTasks-')) {
      const friendId = field.replace('friendTasks-', '');
      onUpdateFriendTasks(rowId, friendId, editValue);
    }

    setEditingCell(null);
    setEditValue('');
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') saveEdit();
    if (e.key === 'Escape') {
      setEditingCell(null);
      setEditValue('');
    }
  };

  const sortedRows = [...rows].sort((a, b) => new Date(b.date) - new Date(a.date));

  const EditableCell = ({ rowId, field, value, placeholder }) => {
    const isEditing = editingCell?.rowId === rowId && editingCell?.field === field;

    if (isEditing) {
      return (
        <input
          autoFocus
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          onBlur={saveEdit}
          onKeyDown={handleKeyDown}
          className="input-glass text-xs w-full"
          placeholder={placeholder}
        />
      );
    }

    return (
      <div
        onClick={() => startEdit(rowId, field, value)}
        className="group cursor-pointer flex items-center gap-1 min-h-[28px]"
      >
        <span className="text-xs text-dark-200 truncate max-w-[140px]">
          {value || <span className="text-dark-600 italic">{placeholder}</span>}
        </span>
        <Edit3 className="w-3 h-3 text-dark-600 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
      </div>
    );
  };

  const StatusButton = ({ completed, onComplete, onIncomplete }) => (
    <div className="flex gap-1.5">
      <motion.button
        whileHover={{ scale: 1.15 }}
        whileTap={{ scale: 0.9 }}
        onClick={onComplete}
        className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${
          completed === true
            ? 'bg-green-500/30 border-2 border-green-400 text-green-300 shadow-lg shadow-green-500/20'
            : 'bg-dark-800 border border-dark-600 text-dark-500 hover:border-green-500/50 hover:text-green-400'
        }`}
      >
        <Check className="w-4 h-4" />
      </motion.button>
      <motion.button
        whileHover={{ scale: 1.15 }}
        whileTap={{ scale: 0.9 }}
        onClick={onIncomplete}
        className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${
          completed === false
            ? 'bg-red-500/30 border-2 border-red-400 text-red-300 shadow-lg shadow-red-500/20'
            : 'bg-dark-800 border border-dark-600 text-dark-500 hover:border-red-500/50 hover:text-red-400'
        }`}
      >
        <X className="w-4 h-4" />
      </motion.button>
    </div>
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className="mx-6 mb-6"
    >
      <div className="glass-card p-5 overflow-hidden">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="text-lg font-display font-bold text-white">Daily Tracker</h2>
            <p className="text-xs text-dark-400 mt-1">Track your daily study progress</p>
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowAddRow(!showAddRow)}
            className="btn-primary text-sm flex items-center gap-2 px-4 py-2.5"
          >
            <Plus className="w-4 h-4" />
            Add Day
          </motion.button>
        </div>

        {/* Add New Row Form */}
        <AnimatePresence>
          {showAddRow && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden mb-4"
            >
              <div className="glass-light p-4 rounded-xl flex gap-3">
                <input
                  value={newTask}
                  onChange={(e) => setNewTask(e.target.value)}
                  placeholder="What's your study plan for today?"
                  className="input-glass flex-1"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && newTask.trim()) {
                      onAddRow(newTask.trim());
                      setNewTask('');
                      setShowAddRow(false);
                    }
                  }}
                />
                <button
                  onClick={() => {
                    if (newTask.trim()) {
                      onAddRow(newTask.trim());
                      setNewTask('');
                      setShowAddRow(false);
                    }
                  }}
                  className="btn-success text-sm"
                >
                  Add
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Table */}
        <div className="overflow-x-auto -mx-1 px-1">
          <table className="tracker-table">
            <thead>
              <tr>
                <th className="w-24">Date</th>
                <th>My Tasks</th>
                <th className="w-24">Status</th>
                <th>My Feedback</th>
                {friends.map(f => (
                  <th key={`${f.id}-tasks`} className="min-w-[120px]">
                    <span className="flex items-center gap-1.5">
                      <span>{f.avatar}</span>
                      <span>{f.name}</span>
                    </span>
                  </th>
                ))}
                {friends.map(f => (
                  <th key={`${f.id}-status`} className="w-24">{f.name} Status</th>
                ))}
                {friends.map(f => (
                  <th key={`${f.id}-feedback`} className="min-w-[120px]">
                    <span className="flex items-center gap-1">
                      <MessageSquare className="w-3 h-3" />
                      {f.name} Feedback
                    </span>
                  </th>
                ))}
                <th className="w-12"></th>
              </tr>
            </thead>
            <tbody>
              <AnimatePresence>
                {sortedRows.map((row, i) => {
                  const rowClass = row.adminCompleted === true
                    ? 'row-completed'
                    : row.adminCompleted === false
                      ? 'row-incomplete'
                      : '';

                  return (
                    <motion.tr
                      key={row.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      transition={{ delay: i * 0.03 }}
                      className={rowClass}
                    >
                      <td>
                        <div className="text-xs font-semibold text-indigo-300">
                          {format(new Date(row.date), 'MMM dd')}
                        </div>
                        <div className="text-[0.65rem] text-dark-500">
                          {format(new Date(row.date), 'EEE')}
                        </div>
                      </td>
                      <td>
                        <EditableCell
                          rowId={row.id}
                          field="adminTasks"
                          value={row.adminTasks}
                          placeholder="Add tasks..."
                        />
                      </td>
                      <td>
                        <StatusButton
                          completed={row.adminCompleted}
                          onComplete={() => onToggleAdmin(row.id, true)}
                          onIncomplete={() => onToggleAdmin(row.id, false)}
                        />
                      </td>
                      <td>
                        <EditableCell
                          rowId={row.id}
                          field="adminFeedback"
                          value={row.adminFeedback}
                          placeholder="Add feedback..."
                        />
                      </td>
                      {friends.map(f => {
                        const fd = row.friends.find(fr => fr.friendId === f.id);
                        return (
                          <td key={`${f.id}-tasks`}>
                            <EditableCell
                              rowId={row.id}
                              field={`friendTasks-${f.id}`}
                              value={fd?.tasks}
                              placeholder={`${f.name}'s tasks...`}
                            />
                          </td>
                        );
                      })}
                      {friends.map(f => {
                        const fd = row.friends.find(fr => fr.friendId === f.id);
                        return (
                          <td key={`${f.id}-status`}>
                            <StatusButton
                              completed={fd?.completed}
                              onComplete={() => onToggleFriend(row.id, f.id, true)}
                              onIncomplete={() => onToggleFriend(row.id, f.id, false)}
                            />
                          </td>
                        );
                      })}
                      {friends.map(f => {
                        const fd = row.friends.find(fr => fr.friendId === f.id);
                        return (
                          <td key={`${f.id}-feedback`}>
                            <EditableCell
                              rowId={row.id}
                              field={`friendFeedback-${f.id}`}
                              value={fd?.feedback}
                              placeholder="Add feedback..."
                            />
                          </td>
                        );
                      })}
                      <td>
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => onDeleteRow(row.id)}
                          className="p-1.5 rounded-lg text-dark-600 hover:text-red-400 hover:bg-red-500/10 transition-all"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </motion.button>
                      </td>
                    </motion.tr>
                  );
                })}
              </AnimatePresence>
            </tbody>
          </table>
        </div>

        {sortedRows.length === 0 && (
          <div className="text-center py-12">
            <p className="text-dark-500 text-sm">No days tracked yet. Click "Add Day" to get started!</p>
          </div>
        )}
      </div>
    </motion.div>
  );
}
