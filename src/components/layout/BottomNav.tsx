import React from 'react';
import { useApp } from '../../context/AppContext';
import { Home, BookOpen, CheckSquare, Award, User, Crown } from 'lucide-react';

export function BottomNav() {
  const { currentView, navigateTo, currentUser } = useApp();

  return (
    <nav
      id="mobile-bottom-navigation"
      className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-stone-900/95 backdrop-blur-md border-t border-stone-200 dark:border-stone-800 px-2 py-1.5 shadow-lg"
    >
      <div className="grid grid-cols-5 gap-1 items-center max-w-md mx-auto">
        <button
          id="tab-btn-home"
          onClick={() => navigateTo('home')}
          className={`flex flex-col items-center justify-center py-1.5 rounded-xl transition-all ${
            currentView === 'home'
              ? 'text-emerald-600 dark:text-emerald-400 font-bold scale-105'
              : 'text-stone-500 dark:text-stone-400 hover:text-stone-800 dark:hover:text-stone-200'
          }`}
        >
          <Home className="w-5 h-5 mb-0.5" />
          <span className="text-[10px] leading-none">الرئيسية</span>
        </button>

        <button
          id="tab-btn-subjects"
          onClick={() => navigateTo('subjects')}
          className={`flex flex-col items-center justify-center py-1.5 rounded-xl transition-all ${
            currentView === 'subjects' || currentView === 'subject-detail'
              ? 'text-emerald-600 dark:text-emerald-400 font-bold scale-105'
              : 'text-stone-500 dark:text-stone-400 hover:text-stone-800 dark:hover:text-stone-200'
          }`}
        >
          <BookOpen className="w-5 h-5 mb-0.5" />
          <span className="text-[10px] leading-none">المقاييس</span>
        </button>

        <button
          id="tab-btn-quizzes"
          onClick={() => navigateTo('quizzes')}
          className={`flex flex-col items-center justify-center py-1.5 rounded-xl transition-all ${
            currentView === 'quizzes' || currentView === 'quiz-play'
              ? 'text-emerald-600 dark:text-emerald-400 font-bold scale-105'
              : 'text-stone-500 dark:text-stone-400 hover:text-stone-800 dark:hover:text-stone-200'
          }`}
        >
          <CheckSquare className="w-5 h-5 mb-0.5" />
          <span className="text-[10px] leading-none">الاختبارات</span>
        </button>

        <button
          id="tab-btn-progress"
          onClick={() => navigateTo('progress')}
          className={`flex flex-col items-center justify-center py-1.5 rounded-xl transition-all ${
            currentView === 'progress'
              ? 'text-emerald-600 dark:text-emerald-400 font-bold scale-105'
              : 'text-stone-500 dark:text-stone-400 hover:text-stone-800 dark:hover:text-stone-200'
          }`}
        >
          <Award className="w-5 h-5 mb-0.5" />
          <span className="text-[10px] leading-none">تقدمي</span>
        </button>

        <button
          id="tab-btn-profile"
          onClick={() => navigateTo('profile')}
          className={`flex flex-col items-center justify-center py-1.5 rounded-xl transition-all relative ${
            currentView === 'profile'
              ? 'text-emerald-600 dark:text-emerald-400 font-bold scale-105'
              : 'text-stone-500 dark:text-stone-400 hover:text-stone-800 dark:hover:text-stone-200'
          }`}
        >
          <User className="w-5 h-5 mb-0.5" />
          <span className="text-[10px] leading-none">حسابي</span>
          {currentUser.subscriptionStatus === 'premium' && (
            <Crown className="w-2.5 h-2.5 text-amber-500 absolute top-1 right-3" />
          )}
        </button>
      </div>
    </nav>
  );
}
