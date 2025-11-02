import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { Header } from './core/layout/Header';
import { Sidebar } from './core/layout/Sidebar';
import { LoginPage as AuthLoginPage } from './features/auth';
import { TaskManagerPage } from './features/tasks/pages/TaskManagerPage';
import { CalendarPage } from './features/calendar';
import { TeamManagerPage } from './features/teams';
import { PaymentManagerPage } from './features/payments';
import { ScheduleView } from './features/schedule';
import { UserProfile } from './components/UserProfile';
import { TaskProvider } from './core/contexts/TaskContext';
import { UserProvider, useUser } from './core/contexts/UserContext';
import { TeamProvider } from './core/contexts/TeamContext';
import { AuthDialog } from './components/AuthDialog';
import { useTask } from './core/contexts/TaskContext';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { ENV_CONFIG } from './config/env';
import { useAuthRedirect } from './hooks/useAuthRedirect';

export type ViewType = 'tasks' | 'schedule' | 'calendar' | 'teams' | 'payments' | 'profile';

const MainPage: React.FC = () => {
  const location = useLocation();
  const [currentView, setCurrentView] = useState<ViewType>('tasks');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const { currentUser } = useUser();
  const { loadTasks, resetTaskPaging } = useTask();
  const { dialog } = useAuthRedirect();
  const navigate = useNavigate();
  const prevUserIdRef = React.useRef<string | null>(null);

  // Check for redirect after login
  useEffect(() => {
    const redirectPath = sessionStorage.getItem('redirectAfterLogin');
    if (redirectPath && currentUser) {
      sessionStorage.removeItem('redirectAfterLogin');
      navigate(redirectPath);
    }
  }, [currentUser, navigate]);

  // Sync URL path with current view
  useEffect(() => {
    const pathSegments = location.pathname.split('/').filter(Boolean);
    const view = pathSegments[pathSegments.length - 1];
    
    const validViews: ViewType[] = ['tasks', 'schedule', 'calendar', 'teams', 'payments', 'profile'];
    if (validViews.includes(view as ViewType)) {
      setCurrentView(view as ViewType);
    }
  }, [location.pathname]);

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

  const handleViewChange = (view: ViewType) => {
    setCurrentView(view);
    navigate(`/main/${view}`);
  };

  const renderCurrentView = () => {
    switch (currentView) {
      case 'tasks':
        return <TaskManagerPage />;
      case 'schedule':
        return <ScheduleView />;
      case 'calendar':
        return <CalendarPage />;
      case 'teams':
        return <TeamManagerPage />;
      case 'payments':
        return <PaymentManagerPage />;
      case 'profile':
        return <UserProfile />;
      default:
        return <TaskManagerPage />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="flex">
        <Sidebar
          currentView={currentView}
          onViewChange={handleViewChange}
          toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
          isOpen={isSidebarOpen}
        />
        <main 
          className={`flex-1 p-4 sm:p-6 relative overflow-x-hidden transition-all duration-300`}
          style={{
            marginLeft: isSidebarOpen ? '16rem' : '3rem',
          }}
        >
          {dialog && (
            <AuthDialog
              show={dialog.show}
              message={dialog.message}
              onConfirm={dialog.onConfirm}
              onCancel={dialog.onCancel}
            />
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

  return <AuthLoginPage onLogin={login} onGuestMode={handleGuestMode} />;
};


function App() {
  const clientID = ENV_CONFIG.GOOGLE_CLIENT_ID;
  return (
    <GoogleOAuthProvider clientId={clientID}>
      <BrowserRouter>
        <TaskProvider>
          <TeamProvider>
            <UserProvider>
              <Routes>
                <Route path="/login" element={<LoginPage />} />
                <Route path="/main" element={<MainPage />} />
                <Route path="/main/tasks" element={<MainPage />} />
                <Route path="/main/schedule" element={<MainPage />} />
                <Route path="/main/calendar" element={<MainPage />} />
                <Route path="/main/teams" element={<MainPage />} />
                <Route path="/main/payments" element={<MainPage />} />
                <Route path="/main/profile" element={<MainPage />} />
                <Route path="/guest" element={<MainPage />} />
                <Route path="/" element={<LoginPage />} /> {/* Default to login */}
              </Routes>
            </UserProvider>
          </TeamProvider>
        </TaskProvider>
      </BrowserRouter>
    </GoogleOAuthProvider>
  );
}

export default App;