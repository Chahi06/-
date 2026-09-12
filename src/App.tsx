import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Navbar } from './components/layout/Navbar';
import { BottomNav } from './components/layout/BottomNav';
import { Footer } from './components/layout/Footer';
import { ToastContainer } from './components/common/Toast';
import { PremiumModal } from './components/common/PremiumModal';
import { PdfViewerModal } from './components/common/PdfViewerModal';

// Pages
import { HomePage } from './pages/HomePage';
import { SubjectsPage } from './pages/SubjectsPage';
import { SubjectDetailPage } from './pages/SubjectDetailPage';
import { LessonDetailPage } from './pages/LessonDetailPage';
import { SummariesPage } from './pages/SummariesPage';
import { QuizzesPage } from './pages/QuizzesPage';
import { QuizPlayPage } from './pages/QuizPlayPage';
import { ProgressPage } from './pages/ProgressPage';
import { FavoritesPage } from './pages/FavoritesPage';
import { SubscriptionPage } from './pages/SubscriptionPage';
import { ProfilePage } from './pages/ProfilePage';
import { NotificationsPage } from './pages/NotificationsPage';
import { SearchModal } from './pages/SearchModal';
import { AdminDashboard } from './pages/AdminDashboard';

function AppContent() {
  const { currentView } = useApp();

  const renderView = () => {
    switch (currentView) {
      case 'home':
        return <HomePage />;
      case 'subjects':
        return <SubjectsPage />;
      case 'subject-detail':
        return <SubjectDetailPage />;
      case 'lesson-detail':
        return <LessonDetailPage />;
      case 'summaries':
        return <SummariesPage />;
      case 'quizzes':
        return <QuizzesPage />;
      case 'quiz-play':
        return <QuizPlayPage />;
      case 'progress':
        return <ProgressPage />;
      case 'favorites':
        return <FavoritesPage />;
      case 'subscription':
        return <SubscriptionPage />;
      case 'profile':
        return <ProfilePage />;
      case 'notifications':
        return <NotificationsPage />;
      case 'search':
        return <SearchModal />;
      case 'admin':
        return <AdminDashboard />;
      default:
        return <HomePage />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-stone-50/70 dark:bg-stone-950 text-stone-900 dark:text-stone-100 transition-colors pb-16 md:pb-0 font-sans">
      <Navbar />

      <main className="flex-1 w-full animate-in fade-in duration-150">
        {renderView()}
      </main>

      {/* Show footer on desktop / non-quiz-play views for clean focus */}
      {currentView !== 'quiz-play' && <Footer />}

      <BottomNav />
      <ToastContainer />
      <PremiumModal />
      <PdfViewerModal />
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
