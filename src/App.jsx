import { useState } from 'react';
import { Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { LayoutDashboard, BarChart3, Calendar, Trophy, MessageSquare } from 'lucide-react';

import AnimatedBackground from './components/AnimatedBackground';
import Header from './components/Header';
import MemberDashboard from './components/MemberDashboard';
import MemberTaskPage from './components/MemberTaskPage';
import WeeklyChart from './components/WeeklyChart';
import CalendarView from './components/CalendarView';
import Leaderboard from './components/Leaderboard';
import StreakPopup from './components/StreakPopup';
import DailyReminder from './components/DailyReminder';
import TaskSetupModal from './components/TaskSetupModal';
import ClubChat from './components/ClubChat';
import Login from './components/Login';
import Register from './components/Register';
import JoinClub from './components/JoinClub';
import { useStore } from './store';

const tabsConfig = [
  { id: 'dashboard', label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
  { id: 'chat', label: 'Club Chat', path: '/chat', icon: MessageSquare, badge: true },
  { id: 'chart', label: 'Analytics', path: '/analytics', icon: BarChart3 },
  { id: 'calendar', label: 'Calendar', path: '/calendar', icon: Calendar },
  { id: 'leaderboard', label: 'Leaderboard', path: '/leaderboard', icon: Trophy },
];

export default function App() {
  const store = useStore();
  const location = useLocation();
  const navigate = useNavigate();

  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);

  const isAuthenticated = !!store.token;
  const isApproved = store.user?.status === 'approved';
  const isAdmin = store.user?.role === 'admin';

  // Stats
  const weeklyStats = store.getWeeklyStats();
  const leaderboardData = store.getLeaderboard();
  const adminStreak = store.user ? store.calculateStreak(store.user._id) : 0;

  // Active Tab logic
  const activeTab = tabsConfig.find(t => location.pathname.startsWith(t.path))?.id || 'dashboard';

  // State-specific layout flags
  const authPages = ['/login', '/register', '/join-club'];
  const isAuthPage = authPages.includes(location.pathname);
  const isMemberPage = location.pathname.startsWith('/member/');

  // Handler for task setup
  const handleSetupPlan = (tasks) => {
    if (isAdmin) {
      store.setupGlobalStudyPlan(tasks); // Admin pushes to everyone
    } else {
      store.setupStudyPlan(store.user._id, tasks); // User sets up personal plan
    }
    setIsTaskModalOpen(false);
  };

  // Protected Route Logic
  if (!isAuthenticated && !['/login', '/register'].includes(location.pathname)) {
    return <Navigate to="/login" replace />;
  }

  if (isAuthenticated && !isApproved && location.pathname !== '/join-club') {
    return <Navigate to="/join-club" replace />;
  }

  if (isAuthenticated && isApproved && isAuthPage) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="min-h-screen relative">
      {!isAuthPage && <AnimatedBackground />}
      {!isAuthPage && <DailyReminder />}

      {/* Modals & Popups */}
      <StreakPopup
        popup={store.streakPopup}
        onRestore={store.restoreStreak}
        onEnd={store.endStreak}
        onClose={() => store.setStreakPopup(null)}
      />

      <TaskSetupModal
        isOpen={isTaskModalOpen}
        onClose={() => setIsTaskModalOpen(false)}
        onSave={handleSetupPlan}
      />

      {/* Main Layout Wrap */}
      <div className="relative z-10 flex flex-col min-h-screen">
        {!isAuthPage && (
          <Header
            user={store.user}
            adminStreak={adminStreak}
            totalFriends={store.members.length}
            notifications={store.notifications}
            onOpenTaskBox={() => setIsTaskModalOpen(true)}
            onLogout={store.logout}
            onUpdateProfile={store.updateProfile}
            isAdmin={isAdmin}
          />
        )}

        <main className={`flex-1 ${!isAuthPage ? 'max-w-[1400px] mx-auto w-full' : ''}`}>
          {/* Main Navigation (Visible only after approval) */}
          {!isMemberPage && !isAuthPage && isApproved && (
            <div className="mx-6 mb-8 mt-2 scroll-x-mobile">
              <div className="glass-card p-1.5 inline-flex gap-1.5 bg-black/40 border-white/5 shadow-inner">
                {tabsConfig.map(tab => {
                  const Icon = tab.icon;
                  const isActive = activeTab === tab.id;
                  const hasBadge = tab.badge && store.chatNotifications > 0;

                  return (
                    <motion.button
                      key={tab.id}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => navigate(tab.path)}
                      className={`flex items-center gap-2.5 px-6 py-3 rounded-2xl text-[0.65rem] font-black uppercase tracking-[0.2em] transition-all duration-300 relative ${
                        isActive
                          ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-xl shadow-indigo-500/20'
                          : 'text-dark-500 hover:text-dark-200 border border-transparent'
                      }`}
                    >
                      <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-dark-500'}`} />
                      <span className="hidden sm:inline">{tab.label}</span>
                      
                      {hasBadge && (
                         <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center text-[0.6rem] font-bold ring-2 ring-black shadow-lg">
                           {store.chatNotifications}
                         </span>
                      )}
                    </motion.button>
                  );
                })}
              </div>
            </div>
          )}

          <AnimatePresence mode="wait">
            <Routes location={location} key={location.pathname}>
              <Route path="/register" element={<Register onRegister={store.register} />} />
              <Route path="/login" element={<Login onLogin={store.login} />} />
              <Route path="/join-club" element={<JoinClub user={store.user} onRequestJoin={store.requestJoinClub} />} />

              <Route path="/" element={<Navigate to="/dashboard" replace />} />

              <Route
                path="/dashboard"
                element={
                <MemberDashboard
                    members={store.members}
                    currentUser={store.user}
                    calculateStreak={store.calculateStreak}
                    getRowsForMember={store.getRowsForMember}
                    isAdmin={isAdmin}
                    joinRequests={store.joinRequests}
                    onAcceptRequest={(id) => store.handleRequest(id, 'approve')}
                    onRejectRequest={(id) => store.handleRequest(id, 'reject')}
                    onRemoveMember={store.removeMember}
                  />
                }
              />

              <Route
                path="/chat"
                element={
                  <ClubChat
                    messages={store.messages}
                    pinnedMessage={store.pinnedMessage}
                    currentUser={store.user}
                    members={store.members}
                    onSendMessage={store.sendMessage}
                    onDeleteMessage={store.deleteMessage}
                    onPinMessage={store.pinMessage}
                    onClearNotifications={store.clearChatNotifications}
                  />
                }
              />

              <Route
                path="/member/:username"
                element={
                  <MemberTaskPage
                    getMember={store.getMember}
                    getRowsForMember={store.getRowsForMember}
                    calculateStreak={store.calculateStreak}
                    addDay={store.addDay}
                    deleteDay={store.deleteDay}
                    addTask={store.addTask}
                    updateTask={store.updateTask}
                    deleteTask={store.deleteTask}
                    toggleTaskStatus={store.toggleTaskStatus}
                    updateTaskFeedback={store.updateTaskFeedback}
                    updateTaskGlobally={store.updateTaskGlobally}
                    currentUserRole={isAdmin ? "admin" : "friend"}
                    currentUser={store.user}
                  />
                }
              />

              <Route
                path="/analytics"
                element={
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mx-6">
                    <WeeklyChart data={weeklyStats} friends={store.members.filter(m => m.role !== 'admin')} />
                  </motion.div>
                }
              />

              <Route
                path="/calendar"
                element={
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mx-6 max-w-md">
                    <CalendarView rows={store.user ? store.getRowsForMember(store.user._id) : []} />
                  </motion.div>
                }
              />

              <Route
                path="/leaderboard"
                element={
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mx-6 max-w-xl">
                    <Leaderboard data={leaderboardData} currentUser={store.user} />
                  </motion.div>
                }
              />

              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Routes>
          </AnimatePresence>
        </main>

        {!isAuthPage && (
          <footer className="text-center py-10 opacity-50">
            <p className="text-[0.6rem] font-black uppercase tracking-[0.4em] text-dark-500">
              Study Streak Club • Built for Success {new Date().getFullYear()}
            </p>
          </footer>
        )}
      </div>
    </div>
  );
}
