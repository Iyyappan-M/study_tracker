import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Smile, Reply, Pin, Trash2, ShieldCheck, Crown, MessageCircle } from 'lucide-react';
import { format } from 'date-fns';

export default function ClubChat({
  messages,
  pinnedMessage,
  currentUser, // { id, name, role, avatar }
  members,
  onSendMessage,
  onDeleteMessage,
  onPinMessage,
  onClearNotifications,
}) {
  const [inputText, setInputText] = useState('');
  const [replyingTo, setReplyingTo] = useState(null);
  const scrollRef = useRef(null);
  const isAdmin = currentUser?.role === 'admin';

  // Auto-scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  // Clear notifications when entering chat
  useEffect(() => {
    onClearNotifications();
  }, [onClearNotifications]);

  const handleSend = () => {
    if (!inputText.trim()) return;
    onSendMessage(currentUser._id, inputText.trim(), replyingTo);
    setInputText('');
    setReplyingTo(null);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      className="mx-6 mb-6 flex flex-col h-[75vh] glass-card overflow-hidden border-white/5 relative"
    >
      {/* ─── Chat Header ────────────────────────────────────────── */}
      <div className="px-6 py-4 border-b border-white/5 bg-white/[0.02] flex items-center justify-between z-10 shrink-0">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
            <MessageCircle className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-display font-black text-white tracking-tight uppercase">Study Club Group</h2>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <p className="text-[0.6rem] text-dark-500 font-bold uppercase tracking-widest">{members.length} members online</p>
            </div>
          </div>
        </div>
      </div>

      {/* ─── Pinned Message ─────────────────────────────────────── */}
      <AnimatePresence>
        {pinnedMessage && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="bg-indigo-500/10 border-b border-indigo-500/20 px-6 py-3 flex items-center justify-between group z-10 shrink-0"
          >
            <div className="flex items-center gap-3 overflow-hidden">
              <div className="shrink-0 p-1.5 rounded-lg bg-indigo-500/20">
                <Pin className="w-3.5 h-3.5 text-indigo-400" />
              </div>
              <div className="min-w-0">
                <p className="text-[0.6rem] font-black text-indigo-400 uppercase tracking-widest mb-0.5">Pinned Announcement</p>
                <p className="text-xs text-indigo-200 truncate font-semibold">{pinnedMessage.text}</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ─── Chat History ───────────────────────────────────────── */}
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar scroll-smooth bg-black/10"
      >
        {messages.map((msg, i) => {
          const isMe = msg.userId === currentUser?._id;
          const showAvatar = i === 0 || messages[i-1].userId !== msg.userId;

          return (
            <motion.div
              key={msg._id || msg.id}
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              className={`flex items-end gap-3 ${isMe ? 'flex-row-reverse' : 'flex-row'}`}
            >
              {/* Avatar Slot */}
              <div className="w-8 shrink-0">
                {showAvatar && (
                  <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center text-sm shadow-lg border border-white/5">
                    {msg.userAvatar}
                  </div>
                )}
              </div>

              {/* Message Bubble Column */}
              <div className={`flex flex-col max-w-[75%] sm:max-w-[60%] ${isMe ? 'items-end' : 'items-start'}`}>
                {showAvatar && (
                  <div className={`flex items-center gap-2 mb-1.5 ${isMe ? 'flex-row-reverse' : 'flex-row'}`}>
                    <span className="text-[0.65rem] font-black text-dark-300 uppercase tracking-widest">
                      {isMe ? 'You' : msg.userName}
                    </span>
                    {msg.userRole === 'admin' && (
                      <span className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-amber-500/10 border border-amber-500/20 text-[0.5rem] font-black text-amber-400 uppercase tracking-tighter shadow-sm">
                        <Crown className="w-2.5 h-2.5" /> Admin
                      </span>
                    )}
                  </div>
                )}

                <div className="relative group/bubble">
                  {/* Bubble */}
                  <div className={`px-4 py-3 rounded-2xl shadow-xl backdrop-blur-md transition-all ${
                    isMe 
                      ? 'bg-gradient-to-br from-indigo-500 to-indigo-600 text-white rounded-tr-none border border-white/10' 
                      : 'bg-white/5 text-dark-100 rounded-tl-none border border-white/5 hover:bg-white/10'
                  }`}>
                    {/* Reply Context */}
                    {msg.replyTo && (
                      <div className={`mb-2 p-2 rounded-lg text-[0.65rem] border-l-2 ${
                        isMe ? 'bg-black/20 border-white/40 text-white/60' : 'bg-white/5 border-indigo-500/40 text-dark-500'
                      }`}>
                         <p className="font-black uppercase tracking-widest mb-1">{msg.replyTo.userName}</p>
                         <p className="line-clamp-1 italic">{msg.replyTo.text}</p>
                      </div>
                    )}
                    <p className="text-sm leading-relaxed whitespace-pre-wrap font-medium">{msg.text}</p>
                    <p className={`text-[0.55rem] mt-2 font-bold uppercase tracking-tighter opacity-50 ${isMe ? 'text-right' : 'text-left'}`}>
                      {format(new Date(msg.createdAt || Date.now()), 'hh:mm a')}
                    </p>
                  </div>

                  {/* Bubble Actions */}
                  <div className={`absolute top-0 flex gap-2 p-1 rounded-xl bg-dark-900 border border-white/10 shadow-2xl opacity-0 group-hover/bubble:opacity-100 transition-all z-20 ${
                    isMe ? 'right-full mr-2' : 'left-full ml-2'
                  }`}>
                    <button 
                      onClick={() => setReplyingTo(msg)}
                      className="p-1.5 hover:bg-white/10 rounded-lg text-dark-400 hover:text-indigo-400 transition-colors"
                      title="Reply"
                    >
                      <Reply className="w-3.5 h-3.5" />
                    </button>
                    {isAdmin && (
                      <>
                        <button 
                          onClick={() => onPinMessage(msg._id || msg.id)}
                          className="p-1.5 hover:bg-white/10 rounded-lg text-dark-400 hover:text-amber-400 transition-colors"
                          title="Pin Message"
                        >
                          <Pin className="w-3.5 h-3.5" />
                        </button>
                        <button 
                          onClick={() => onDeleteMessage(msg._id || msg.id)}
                          className="p-1.5 hover:bg-white/10 rounded-lg text-dark-400 hover:text-red-400 transition-all"
                          title="Delete Message"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* ─── Message Input ──────────────────────────────────────── */}
      <div className="p-6 border-t border-white/5 shrink-0 bg-white/[0.01] overflow-visible">
        <AnimatePresence>
          {replyingTo && (
            <motion.div
              initial={{ y: 10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 10, opacity: 0 }}
              className="bg-indigo-500/10 rounded-2xl p-4 mb-4 border border-indigo-500/20 flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <Reply className="w-4 h-4 text-indigo-400" />
                <div>
                  <p className="text-[0.6rem] font-black text-indigo-400 uppercase tracking-widest">Replying to {replyingTo.userName}</p>
                  <p className="text-xs text-dark-300 line-clamp-1">{replyingTo.text}</p>
                </div>
              </div>
              <button onClick={() => setReplyingTo(null)} className="p-1.5 hover:bg-white/10 rounded-full text-dark-500 hover:text-white transition-all">
                <XCircleIcon className="w-4 h-4" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="flex items-center gap-3 relative">
          <div className="flex-1 relative group">
            <div className="absolute inset-y-0 left-4 flex items-center text-dark-600 pointer-events-none group-focus-within:text-indigo-400 transition-colors">
              <Smile className="w-5 h-5" />
            </div>
            <textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder="Share your progress or ask a question... 🔥"
              rows="1"
              className="w-full bg-black/40 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-sm text-white placeholder:text-dark-600 focus:outline-none focus:border-indigo-500/50 focus:ring-4 focus:ring-indigo-500/5 transition-all resize-none custom-scrollbar"
            />
          </div>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleSend}
            disabled={!inputText.trim()}
            className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all ${
              inputText.trim() 
                ? 'bg-gradient-to-br from-indigo-500 to-purple-600 text-white shadow-lg shadow-indigo-500/40' 
                : 'bg-white/5 text-dark-600 cursor-not-allowed'
            }`}
          >
            <Send className="w-5 h-5" />
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
}

function XCircleIcon(props) {
  return (
    <svg 
      {...props} 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2.5" 
      strokeLinecap="round" 
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="10" />
      <path d="m15 9-6 6" />
      <path d="m9 9 6 6" />
    </svg>
  );
}
