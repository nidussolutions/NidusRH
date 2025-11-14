
import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { Toaster } from '@/components/ui/toaster';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { AuthProvider, useAuth } from '@/contexts/SupabaseAuthContext';
import LandingPage from '@/pages/LandingPage';
import LoginPage from '@/pages/LoginPage';
import RegisterPage from '@/pages/RegisterPage';
import PlanSelectionPage from '@/pages/PlanSelectionPage';
import Dashboard from '@/pages/Dashboard';
import EmployeesPage from '@/pages/EmployeesPage';
import RecruitmentPage from '@/pages/RecruitmentPage';
import PayrollPage from '@/pages/PayrollPage';
import AttendancePage from '@/pages/AttendancePage';
import AdminDashboard from '@/pages/AdminDashboard';
import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';
import { supabase } from '@/lib/customSupabaseClient';

const AppContent = () => {
  const { session, loading, company, subscription, isAdmin } = useAuth();
  const [view, setView] = useState('landing'); // landing, register, login
  const [currentPage, setCurrentPage] = useState('dashboard');

  useEffect(() => {
    if (!loading) {
      if (session && company && subscription) {
        setView('app');
      } else if (session && !company) {
        setView('plan_selection');
      } else {
        setView('landing');
      }
    }
  }, [session, company, subscription, loading]);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50 dark:bg-gray-900">
        <p>Carregando...</p>
      </div>
    );
  }

  const renderPage = () => {
    if (isAdmin) {
        return <AdminDashboard />;
    }
    switch (currentPage) {
      case 'dashboard':
        return <Dashboard />;
      case 'employees':
        return <EmployeesPage />;
      case 'recruitment':
        return <RecruitmentPage />;
      case 'payroll':
        return <PayrollPage />;
      case 'attendance':
        return <AttendancePage />;
      default:
        return <Dashboard />;
    }
  };

  if (view === 'app') {
    return (
      <div className="flex h-screen overflow-hidden bg-gray-50 dark:bg-gray-900">
        <Sidebar currentPage={currentPage} onNavigate={setCurrentPage} isAdmin={isAdmin} />
        <div className="flex-1 flex flex-col overflow-hidden">
          <Header />
          <main className="flex-1 overflow-y-auto">
            {renderPage()}
          </main>
        </div>
      </div>
    );
  }

  if (view === 'plan_selection') {
    return <PlanSelectionPage />;
  }

  if (view === 'login') {
    return <LoginPage onSwitchToRegister={() => setView('register')} onSwitchToLanding={() => setView('landing')} />;
  }

  if (view === 'register') {
    return <RegisterPage onSwitchToLogin={() => setView('login')} />;
  }

  return <LandingPage onLogin={() => setView('login')} onRegister={() => setView('register')} />;
};

function App() {
  return (
    <ThemeProvider>
      <AuthProvider supabaseClient={supabase}>
        <Helmet>
          <title>NidusRH - Solução Completa de Gestão de RH</title>
          <meta name="description" content="Sistema de RH completo para recrutamento, folha de pagamento, gestão de funcionários e controle de ponto." />
        </Helmet>
        <AppContent />
        <Toaster />
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
