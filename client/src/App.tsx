import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, useNavigate } from 'react-router-dom';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { LoginForm } from './components/LoginForm';
import { TaskManager } from './components/TaskManager';
import { ScheduleView } from './components/ScheduleView';
import { TeamManager } from './components/TeamManager';
import { UserProfile } from './components/UserProfile';
import { TaskProvider } from './contexts/TaskContext';
import { UserProvider, useUser } from './contexts/UserContext';
import { TeamProvider } from './contexts/TeamContext';
import { Dialog } from './components/Dialog';
import MyCalendar from './components/MyCalendar';
import PaymentManager from './components/PaymentManager';
import { useTask } from './contexts/TaskContext';

export type ViewType = 'tasks' | 'schedule' | 'calendar' | 'teams' | 'payments' | 'profile';

const MainPage: React.FC = () => {
  const [currentView, setCurrentView] = useState<ViewType>('tasks');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const { currentUser } = useUser();
  const { loadTasks, resetTaskPaging } = useTask();
  const [dialog, setDialog] = useState<{ message: string; redirect?: boolean } | null>(null);
  const navigate = useNavigate();
  const prevUserIdRef = React.useRef<string | null>(null);

  React.useEffect(() => {
    const currentUserId = currentUser?.id || null;
    
    // Only load tasks if the user changed
    if (currentUserId !== prevUserIdRef.current) {
      prevUserIdRef.current = currentUserId;
      
      if (currentUserId) {
        // Reset pagination state and load tasks for the new user
        resetTaskPaging();
        loadTasks(currentUserId, 1, 6, false); // explicitly load first page, replace existing
      }
    }
  }, [currentUser?.id]); // Only depend on the user ID, not the functions

  const handleAction = (action: () => void) => {
    if (!currentUser) {
      setDialog({ message: 'You need to be signed in to perform this action', redirect: true });
      return;
    }
    action();
  };

  const renderCurrentView = () => {
    switch (currentView) {
      case 'tasks':
        return <TaskManager onAction={(action) => handleAction(action)} />;
      case 'schedule':
        return <ScheduleView />;
      case 'calendar':
        return <MyCalendar />;
      case 'teams':
        return <TeamManager />;
      case 'payments':
        return <PaymentManager />;
      case 'profile':
        return <UserProfile />;
      default:
        return <TaskManager onAction={(action) => handleAction(action)} />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="flex">
        <Sidebar
          currentView={currentView}
          onViewChange={setCurrentView}
          toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
          isOpen={isSidebarOpen}
        />
        <main className={isSidebarOpen ? "flex-1 ml-64 p-6 relative" : "flex-1 ml-12 p-6 relative"}>
          {dialog && (
            <Dialog
              title="Action Required"
              message={dialog.message}
              onClose={() => setDialog(null)}
              onRedirect={dialog.redirect ? () => navigate('/login') : undefined}
              redirectLabel="Go to Login" open={false}                />
          )}
          {renderCurrentView()}
        </main>
      </div>
    </div>
  );
};

const LoginPage: React.FC = () => {
  const { login } = useUser();
  const navigate = useNavigate();

  const handleGuestMode = () => {
    navigate('/main'); // Navigate to the landing page for guest mode
  };

  return <LoginForm onLogin={login} onGuestMode={handleGuestMode} />;
};


function App() {
  return (
    <BrowserRouter>
      <TaskProvider>
        <TeamProvider>
          <UserProvider>
            <Routes>
              <Route path="/login" element={<LoginPage />} />
              <Route path="/main" element={<MainPage />} />
              <Route path="/" element={<LoginPage />} /> {/* Default to login */}
            </Routes>
          </UserProvider>
        </TeamProvider>
      </TaskProvider>
    </BrowserRouter>
  );
}

export default App;