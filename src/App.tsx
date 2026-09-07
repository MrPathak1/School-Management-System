import { useState } from 'react';
import { AppProvider, useApp } from './contexts/AppContext';
import { Layout } from './components/Layout';
import { AdminDashboard } from './pages/AdminDashboard';
import { TeacherDashboard } from './pages/TeacherDashboard';
import { StudentDashboard } from './pages/StudentDashboard';
import { ParentDashboard } from './pages/ParentDashboard';
import { LandingPage } from './pages/LandingPage';
import { ToastContainer } from './hooks/useToast';

function DashboardContent() {
  const { role, isAuthenticated, loading } = useApp();
  const [activeTab, setActiveTab] = useState('dashboard');

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-50 flex flex-col items-center justify-center gap-4">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        <p className="text-neutral-500 font-semibold text-sm">Loading school portal...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <LandingPage />;
  }

  const renderDashboard = () => {
    switch (role) {
      case 'admin':
        return <AdminDashboard activeTab={activeTab} setActiveTab={setActiveTab} />;
      case 'teacher':
        return <TeacherDashboard activeTab={activeTab} setActiveTab={setActiveTab} />;
      case 'student':
        return <StudentDashboard activeTab={activeTab} setActiveTab={setActiveTab} />;
      case 'parent':
        return <ParentDashboard activeTab={activeTab} setActiveTab={setActiveTab} />;
      default:
        return <AdminDashboard activeTab={activeTab} setActiveTab={setActiveTab} />;
    }
  };

  return (
    <Layout activeTab={activeTab} setActiveTab={setActiveTab}>
      {renderDashboard()}
    </Layout>
  );
}

function App() {
  return (
    <AppProvider>
      <DashboardContent />
      <ToastContainer />
    </AppProvider>
  );
}

export default App;
