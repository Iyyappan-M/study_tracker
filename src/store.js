// Study Streak Tracker — MongoDB & Express Integrated Store
import { useState, useCallback, useEffect } from 'react';

const generateId = () => Math.random().toString(36).substring(2, 11);

const API_BASE_URL = import.meta.env.PROD 
  ? '/api' 
  : (import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:5000/api');
console.log('Using API Base URL:', API_BASE_URL);

export const getDayStatus = (tasks) => {
  if (!tasks || tasks.length === 0) return null;
  const anyFalse = tasks.some(t => t.completed === false);
  if (anyFalse) return false;
  const allTrue = tasks.every(t => t.completed === true);
  if (allTrue) return true;
  return null;
};

export const useStore = () => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [members, setMembers] = useState([]);
  const [memberDays, setMemberDays] = useState({});
  const [joinRequests, setJoinRequests] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [streakPopup, setStreakPopup] = useState(null);

  // ─── Chat State ─────────────────────────────────────────────
  const [messages, setMessages] = useState([]);
  const [pinnedMessage, setPinnedMessage] = useState(null);
  const [chatNotifications, setChatNotifications] = useState(0);

  // ─── Auth Actions ───────────────────────────────────────────
  
  const register = async (formData) => {
    try {
      const res = await fetch(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      if (res.ok) {
        addNotification('✅ Registration successful!', 'success');
        return true;
      } else {
        addNotification(`❌ ${data.message}`, 'warning');
        return false;
      }
    } catch (err) {
      console.error('Registration error:', err);
      addNotification('❌ Server connection failed', 'warning');
      return false;
    }
  };

  const login = async (formData) => {
    try {
      const res = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      if (res.ok) {
        setToken(data.token);
        setUser(data.user);
        localStorage.setItem('token', data.token);
        addNotification(`👋 Welcome back, ${data.user.name}!`, 'success');
        return { success: true, user: data.user };
      } else {
        return { success: false, message: data.message };
      }
    } catch (err) {
      console.error('Login error:', err);
      return { success: false, message: 'Server connection failed' };
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('token');
    addNotification('🚪 Logged out successfully', 'info');
  };

  const checkAuth = useCallback(async () => {
    if (!token) return;
    try {
      const res = await fetch(`${API_BASE_URL}/user/me`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const userData = await res.json();
        setUser(userData);
      } else {
        logout();
      }
    } catch (err) {
      console.error('Auth check failed');
    }
  }, [token]);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  const updateProfile = async (name) => {
    try {
      const res = await fetch(`${API_BASE_URL}/user/update-profile`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ name })
      });
      const data = await res.json();
      if (res.ok) {
        setUser(data);
        addNotification('✨ Profile updated successfully!', 'success');
        return true;
      } else {
        addNotification(`❌ ${data.message}`, 'warning');
        return false;
      }
    } catch (err) {
      addNotification('❌ Update failed', 'warning');
      return false;
    }
  };

  // ─── Club Actions ───────────────────────────────────────────

  const requestJoinClub = async (name, secretCode) => {
    try {
      const res = await fetch(`${API_BASE_URL}/club/join`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ name, secretCode })
      });
      const data = await res.json();
      if (res.ok) {
        addNotification('📩 Request sent! Waiting for approval.', 'success');
        return true;
      } else {
        addNotification(`❌ ${data.message}`, 'warning');
        return false;
      }
    } catch (err) {
      addNotification('❌ Server error', 'warning');
      return false;
    }
  };

  const fetchClubData = useCallback(async () => {
    if (!user || user.status !== 'approved') return;
    try {
      // 1. Fetch Members (Visible to all approved users)
      const memRes = await fetch(`${API_BASE_URL}/club/members`, { 
        headers: { 'Authorization': `Bearer ${token}` } 
      });
      if (memRes.ok) {
        setMembers(await memRes.json());
      }

      // 2. Fetch Requests (Admins only)
      if (user.role === 'admin') {
        const reqRes = await fetch(`${API_BASE_URL}/admin/requests`, { 
          headers: { 'Authorization': `Bearer ${token}` } 
        });
        if (reqRes.ok) {
          setJoinRequests(await reqRes.json());
        }
      }
      // 3. Fetch Messages
      const msgRes = await fetch(`${API_BASE_URL}/chat/messages`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (msgRes.ok) {
        const msgs = await msgRes.json();
        setMessages(msgs);
        const pinned = msgs.find(m => m.isPinned);
        setPinnedMessage(pinned || null);
      }
    } catch (err) {
      console.error('Study club data fetch failed');
    }
  }, [user, token]);

  useEffect(() => {
    if (user && user.status === 'approved') {
      fetchClubData();
      const timer = setInterval(fetchClubData, 5000); // Fast sync for chat (5s)
      return () => clearInterval(timer);
    }
  }, [user, fetchClubData]);

  const handleRequest = async (requestId, action) => {
    try {
      const res = await fetch(`${API_BASE_URL}/admin/handle-request`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ requestId, action })
      });
      if (res.ok) {
        addNotification(`✅ Request ${action}d`, 'success');
        fetchClubData();
      }
    } catch (err) {
      addNotification('❌ Action failed', 'warning');
    }
  };

  const removeMember = async (memberId) => {
    try {
      const res = await fetch(`${API_BASE_URL}/admin/member/${memberId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        addNotification('🗑️ Member removed', 'warning');
        fetchClubData();
      }
    } catch (err) {
      addNotification('❌ Removal failed', 'warning');
    }
  };

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

  const setupGlobalStudyPlan = useCallback((taskNames) => {
    const startDate = new Date();
    
    setMemberDays(prev => {
      const newState = { ...prev };
      
      members.forEach(m => {
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
        newState[m._id] = newDays;
      });
      
      return newState;
    });
    
    addNotification(`🌍 Global 15-day plan pushed to all ${members.length} members!`, 'success');
  }, [members]);

  // ─── Global Task Edit ───────────────────────────────────────
  const updateTaskGlobally = useCallback((memberId, oldName, newName) => {
    setMemberDays(prev => {
      const userDays = prev[memberId] || [];
      const today = new Date().toISOString().split('T')[0];

      const updatedDays = userDays.map(d => {
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

      if (completed === false) {
          const streak = calculateStreak(memberId);
          if (streak > 0) {
              setStreakPopup({
                  userId: memberId,
                  userName: members.find(m => m._id === memberId)?.name || 'User',
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

  const getMember = useCallback((userParam) => 
    members.find(m => m.username === userParam || m._id === userParam), [members]);

  const getRowsForMember = useCallback((id) => memberDays[id] || [], [memberDays]);

  const getLeaderboard = useCallback(() => {
    return members.map(m => ({
      ...m,
      streak: calculateStreak(m._id),
      totalCompleted: (memberDays[m._id] || []).filter(d => getDayStatus(d.tasks) === true).length,
      totalDays: (memberDays[m._id] || []).length
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
        const dayEntry = (memberDays[m._id] || []).find(d => d.date === dateStr);
        const nameKey = m._id === user?._id ? 'You' : m.name;
        if (!dayEntry) {
          stats[nameKey] = null;
        } else {
          const status = getDayStatus(dayEntry.tasks);
          stats[nameKey] = status === true ? 100 : status === false ? 0 : 50;
        }
      });
      return stats;
    });
  }, [members, memberDays]);

  // ─── Chat Actions ───────────────────────────────────────────
  const sendMessage = async (userId, text, replyTo = null) => {
    try {
      const payload = { text };
      if (replyTo) {
        payload.replyTo = {
          id: replyTo._id || replyTo.id,
          userName: replyTo.userName,
          text: replyTo.text
        };
      }

      const res = await fetch(`${API_BASE_URL}/chat/message`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        fetchClubData();
      }
    } catch (err) {
      addNotification('❌ Message failed', 'warning');
    }
  };

  const deleteMessage = async (messageId) => {
    try {
      const res = await fetch(`${API_BASE_URL}/chat/message/${messageId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        addNotification('🗑️ Message deleted', 'info');
        fetchClubData();
      }
    } catch (err) {
      addNotification('❌ Delete failed', 'warning');
    }
  };

  const pinMessage = async (messageId) => {
    try {
      const res = await fetch(`${API_BASE_URL}/chat/pin-message`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ messageId })
      });
      if (res.ok) {
        addNotification('📌 Pin updated!', 'success');
        fetchClubData();
      }
    } catch (err) {
      addNotification('❌ Pin failed', 'warning');
    }
  };

  const clearChatNotifications = useCallback(() => setChatNotifications(0), []);

  return {
    user, token, members,
    joinRequests, notifications, streakPopup,
    messages, pinnedMessage, chatNotifications,
    register, login, logout, updateProfile, requestJoinClub, handleRequest, removeMember,
    setupStudyPlan, setupGlobalStudyPlan, updateTaskGlobally, calculateStreak, getMember, getRowsForMember,
    toggleTaskStatus, updateTaskFeedback, getLeaderboard, getWeeklyStats,
    setStreakPopup, addNotification,
    sendMessage, deleteMessage, pinMessage, clearChatNotifications
  };
};
