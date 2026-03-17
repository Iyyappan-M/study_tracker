// Study Streak Tracker — Supabase Integrated Store
import { useState, useCallback, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase (Placeholder for user keys)
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';
const supabase = (supabaseUrl && supabaseAnonKey) ? createClient(supabaseUrl, supabaseAnonKey) : null;

const generateId = () => Math.random().toString(36).substring(2, 11);

const defaultMembers = [
  { id: 'admin-1', name: 'Admin', role: 'admin', avatar: '👨‍💻', username: 'admin', status: 'accepted', email: 'admin@tracker.com' },
];

const initialMessages = [
  {
    id: 'm1',
    userId: 'admin-1',
    userName: 'Admin',
    userRole: 'admin',
    userAvatar: '👨‍💻',
    text: "Welcome to the Study Club Chat! Let's keep the streaks alive. 🔥",
    time: new Date(Date.now() - 3600000).toISOString(),
  }
];

export const getDayStatus = (tasks) => {
  if (!tasks || tasks.length === 0) return null;
  const anyFalse = tasks.some(t => t.completed === false);
  if (anyFalse) return false;
  const allTrue = tasks.every(t => t.completed === true);
  if (allTrue) return true;
  return null;
};

export const useStore = () => {
  const [members, setMembers] = useState(defaultMembers);
  const [memberDays, setMemberDays] = useState({});
  const [joinRequests, setJoinRequests] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [streakPopup, setStreakPopup] = useState(null);
  const [inviteLink, setInviteLink] = useState('');

  // ─── Chat State ─────────────────────────────────────────────
  const [messages, setMessages] = useState(initialMessages);
  const [pinnedMessage, setPinnedMessage] = useState(null);
  const [chatNotifications, setChatNotifications] = useState(0);

  // ─── Invite & Join Requests ─────────────────────────────────
  const generateInviteLink = useCallback(() => {
    const code = Math.random().toString(36).substring(2, 8).toUpperCase();
    const link = `${window.location.origin}/invite/${code}`;
    setInviteLink(link);
    return link;
  }, []);

  const addJoinRequest = useCallback((request) => {
    const newRequest = { ...request, id: generateId(), status: 'pending', time: new Date().toISOString() };
    setJoinRequests(prev => [newRequest, ...prev]);
    addNotification(`📩 New join request from ${request.name}`, 'info');
  }, []);

  const acceptRequest = useCallback((requestId) => {
    const request = joinRequests.find(r => r.id === requestId);
    if (request) {
      const newMember = {
        id: generateId(),
        name: request.name,
        email: request.email,
        role: 'friend',
        avatar: '🎉',
        username: request.name.toLowerCase().replace(/\s+/g, '-'),
        status: 'accepted'
      };
      setMembers(prev => [...prev, newMember]);
      setJoinRequests(prev => prev.filter(r => r.id !== requestId));
      addNotification(`✅ Accepted ${request.name}'s join request`, 'success');
    }
  }, [joinRequests]);

  const rejectRequest = useCallback((requestId) => {
    setJoinRequests(prev => prev.filter(r => r.id !== requestId));
    addNotification(`❌ Request rejected`, 'warning');
  }, []);

  const removeMember = useCallback((memberId) => {
    if (members.find(m => m.id === memberId)?.role === 'admin') {
      addNotification(`🛡️ Cannot remove admin`, 'warning');
      return;
    }
    setMembers(prev => prev.filter(m => m.id !== memberId));
    addNotification(`🗑️ Member removed from club`, 'warning');
  }, [members]);

  // ─── Task Setup & 15-Day Auto-Fill ──────────────────────────
  const setupStudyPlan = useCallback((memberId, taskNames) => {
    const startDate = new Date();
    const newDays = [];

    for (let i = 0; i < 15; i++) {
      const date = new Date(startDate);
      date.setDate(date.getDate() + i);
      const dateStr = date.toISOString().split('T')[0];

      newDays.push({
        id: generateId(),
        date: dateStr,
        tasks: taskNames.map(name => ({
          id: generateId(),
          name,
          completed: null,
          myFeedback: '',
          friendFeedback: ''
        }))
      });
    }

    setMemberDays(prev => ({
      ...prev,
      [memberId]: newDays
    }));
    addNotification(`🚀 15-day plan setup for ${taskNames.length} tasks!`, 'success');
  }, []);

  // ─── Global Task Edit ───────────────────────────────────────
  const updateTaskGlobally = useCallback((memberId, oldName, newName) => {
    setMemberDays(prev => {
      const userDays = prev[memberId] || [];
      const today = new Date().toISOString().split('T')[0];

      const updatedDays = userDays.map(d => {
        // Only update future tasks (today onwards)
        if (new Date(d.date) < new Date(today)) return d;
        
        return {
          ...d,
          tasks: d.tasks.map(t => t.name === oldName ? { ...t, name: newName } : t)
        };
      });

      return { ...prev, [memberId]: updatedDays };
    });
    addNotification(`📝 Updated "${oldName}" to "${newName}" for all future days`, 'info');
  }, []);

  // ─── Core Tracking Actions ──────────────────────────────────
  const addNotification = useCallback((message, type = 'info') => {
    const id = generateId();
    setNotifications(prev => [{ id, message, type, time: new Date() }, ...prev].slice(0, 5));
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== id));
    }, 5000);
  }, []);

  const toggleTaskStatus = useCallback((memberId, dayId, taskId, completed) => {
    setMemberDays(prev => {
      const userDays = prev[memberId] || [];
      const updatedDays = userDays.map(d => {
        if (d.id !== dayId) return d;
        return {
          ...d,
          tasks: d.tasks.map(t => t.id === taskId ? { ...t, completed } : t),
        };
      });

      // Streak detection
      if (completed === false) {
          const streak = calculateStreak(memberId);
          const member = members.find(m => m.id === memberId);
          if (streak > 0) {
              setStreakPopup({
                  userId: memberId,
                  userName: member?.name || 'User',
                  streak: streak,
                  dayId: dayId
              });
          }
      }

      return { ...prev, [memberId]: updatedDays };
    });
  }, [members]);

  const updateTaskFeedback = useCallback((memberId, dayId, taskId, field, value) => {
    setMemberDays(prev => ({
      ...prev,
      [memberId]: (prev[memberId] || []).map(d => {
        if (d.id !== dayId) return d;
        return {
          ...d,
          tasks: d.tasks.map(t => t.id === taskId ? { ...t, [field]: value } : t),
        };
      }),
    }));
  }, []);

  const calculateStreak = useCallback((memberId) => {
    const days = (memberDays[memberId] || [])
      .slice()
      .sort((a, b) => new Date(b.date) - new Date(a.date));
    let streak = 0;
    for (const day of days) {
      const status = getDayStatus(day.tasks);
      if (status === true) streak++;
      else if (status === false) break;
      else continue;
    }
    return streak;
  }, [memberDays]);

  const getMember = useCallback((user) => 
    members.find(m => m.username === user || m.id === user), [members]);

  const getRowsForMember = useCallback((id) => memberDays[id] || [], [memberDays]);

  const getLeaderboard = useCallback(() => {
    return members.map(m => ({
      ...m,
      streak: calculateStreak(m.id),
      totalCompleted: (memberDays[m.id] || []).filter(d => getDayStatus(d.tasks) === true).length,
      totalDays: (memberDays[m.id] || []).length
    })).sort((a, b) => b.streak - a.streak);
  }, [members, memberDays, calculateStreak]);

  const getWeeklyStats = useCallback(() => {
    const last7Days = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      last7Days.push(d.toISOString().split('T')[0]);
    }

    return last7Days.map(dateStr => {
      const stats = { day: dateStr };
      members.forEach(m => {
        const dayEntry = (memberDays[m.id] || []).find(d => d.date === dateStr);
        if (!dayEntry) {
          stats[m.name === 'Admin' ? 'You' : m.name] = null;
        } else {
          const status = getDayStatus(dayEntry.tasks);
          stats[m.name === 'Admin' ? 'You' : m.name] = status === true ? 100 : status === false ? 0 : 50;
        }
      });
      return stats;
    });
  }, [members, memberDays]);

  const addDay = useCallback((memberId) => {
    const today = new Date().toISOString().split('T')[0];
    
    setMemberDays(prev => {
      const userDays = prev[memberId] || [];
      const alreadyExists = userDays.some(d => d.date === today);
      
      if (alreadyExists) {
        addNotification(`📅 Entry for today (${today}) already exists`, 'warning');
        return prev;
      }

      const newDay = {
        id: generateId(),
        date: today,
        tasks: []
      };

      addNotification(`📅 Added new entry for today`, 'success');
      return {
        ...prev,
        [memberId]: [newDay, ...userDays]
      };
    });
  }, [addNotification]);

  const deleteDay = useCallback((mid, did) => {
    setMemberDays(prev => ({
      ...prev,
      [mid]: prev[mid].filter(d => d.id !== did)
    }));
  }, []);

  const addTask = useCallback((mid, did, name) => {
    setMemberDays(prev => ({
      ...prev,
      [mid]: prev[mid].map(d => d.id === did ? { ...d, tasks: [...d.tasks, { id: generateId(), name, completed: null, myFeedback: '', friendFeedback: '' }] } : d)
    }));
  }, []);

  const updateTask = useCallback((mid, did, tid, updates) => {
    setMemberDays(prev => ({
      ...prev,
      [mid]: prev[mid].map(d => d.id === did ? { ...d, tasks: d.tasks.map(t => t.id === tid ? { ...t, ...updates } : t) } : d)
    }));
  }, []);

  const deleteTask = useCallback((mid, did, tid) => {
      setMemberDays(prev => ({
          ...prev,
          [mid]: prev[mid].map(d => d.id === did ? { ...d, tasks: d.tasks.filter(t => t.id !== tid) } : d)
      }));
  }, []);

  const restoreStreak = useCallback((dayId, userId, feedback) => {
    setMemberDays(prev => {
      const userDays = prev[userId] || [];
      const updatedDays = userDays.map(d => {
        if (d.id !== dayId) return d;
        return {
          ...d,
          tasks: d.tasks.map(t => t.completed === false ? { ...t, completed: true, friendFeedback: feedback } : t)
        };
      });
      return { ...prev, [userId]: updatedDays };
    });
    setStreakPopup(null);
    addNotification(`✨ Streak restored for ${feedback.substring(0, 20)}...`, 'success');
  }, [addNotification]);

  const endStreak = useCallback((feedback) => {
    // Just close and keep the failure
    setStreakPopup(null);
    addNotification(`💔 Streak ended. Feedback: ${feedback.substring(0, 20)}...`, 'warning');
  }, [addNotification]);

  // ─── Chat Actions ───────────────────────────────────────────
  const sendMessage = useCallback((userId, text, replyTo = null) => {
    const user = members.find(m => m.id === userId);
    if (!user) return;

    const newMessage = {
      id: generateId(),
      userId,
      userName: user.name,
      userRole: user.role,
      userAvatar: user.avatar,
      text,
      time: new Date().toISOString(),
      replyTo
    };

    setMessages(prev => [...prev, newMessage]);
    // Simulate real-time logic: if we were not the sender, we'd increment notifications.
    // For now, let's say we increment if window blurred or something, but simplified:
    // setChatNotifications(prev => prev + 1); 
  }, [members]);

  const deleteMessage = useCallback((messageId) => {
    setMessages(prev => prev.filter(m => m.id !== messageId));
    if (pinnedMessage?.id === messageId) setPinnedMessage(null);
    addNotification('🗑️ Message deleted', 'info');
  }, [pinnedMessage]);

  const pinMessage = useCallback((messageId) => {
    const msg = messages.find(m => m.id === messageId);
    if (msg) {
      setPinnedMessage(msg);
      addNotification('📌 Message pinned as announcement', 'success');
    }
  }, [messages]);

  const clearChatNotifications = useCallback(() => {
    setChatNotifications(0);
  }, []);

  return {
    members, admin: members[0], friends: members.slice(1),
    joinRequests, notifications, streakPopup, inviteLink,
    messages, pinnedMessage, chatNotifications,
    generateInviteLink, addJoinRequest, acceptRequest, rejectRequest, removeMember,
    setupStudyPlan, updateTaskGlobally, calculateStreak, getMember, getRowsForMember,
    toggleTaskStatus, updateTaskFeedback, getLeaderboard, getWeeklyStats,
    addDay, deleteDay, addTask, updateTask, deleteTask, setStreakPopup, addNotification,
    restoreStreak, endStreak,
    sendMessage, deleteMessage, pinMessage, clearChatNotifications
  };
};
