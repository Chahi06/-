import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  GraduationCap,
  Bell,
  Search,
  Moon,
  Sun,
  ShieldCheck,
  User,
  Crown,
  ChevronDown,
  Sparkles,
  BookOpen,
  CheckCircle,
  LogIn,
  LogOut,
} from 'lucide-react';

export function Navbar() {
  const {
    currentUser,
    platformSettings,
    academicLevels,
    selectedLevel,
    setSelectedLevel,
    notifications,
    unreadNotificationsCount,
    markNotificationsAsRead,
    isDarkMode,
    toggleDarkMode,
    currentView,
    navigateTo,
    switchDemoUser,
    firebaseUser,
    signInWithGoogle,
    signOutUser,
  } = useApp();

  const [notifDropdownOpen, setNotifDropdownOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  return (
    <header
      id="main-navbar"
      className="sticky top-0 z-40 w-full border-b border-stone-200/80 dark:border-stone-800 bg-white/95 dark:bg-stone-900/95 backdrop-blur-md transition-colors"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Brand & Level */}
        <div className="flex items-center gap-4">
          <button
            id="nav-logo-btn"
            onClick={() => navigateTo('home')}
            className="flex items-center gap-2.5 text-right group focus:outline-none"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white flex items-center justify-center shadow-md shadow-emerald-500/20 group-hover:scale-105 transition-transform">
              <GraduationCap className="w-6 h-6" />
            </div>
            <div>
              <span className="font-extrabold text-xl tracking-tight text-stone-900 dark:text-stone-100 flex items-center gap-1">
                {platformSettings.logoText || 'أستاذي'}
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                  سنة 1
                </span>
              </span>
              <span className="text-[11px] text-stone-500 dark:text-stone-400 block -mt-0.5 font-medium">
                تعليم ابتدائي
              </span>
            </div>
          </button>

          {/* Academic Level Selector */}
          <div className="hidden lg:flex items-center border-r border-stone-200 dark:border-stone-800 pr-4 mr-2">
            <select
              id="academic-level-select"
              value={selectedLevel}
              onChange={(e) => setSelectedLevel(e.target.value)}
              className="text-xs font-medium bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 rounded-lg px-2.5 py-1.5 border border-stone-200 dark:border-stone-700 focus:outline-none focus:ring-1 focus:ring-emerald-500 cursor-pointer"
            >
              {academicLevels.map((lvl) => (
                <option key={lvl.id} value={lvl.name}>
                  {lvl.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-1 text-sm font-medium">
          <button
            id="nav-link-home"
            onClick={() => navigateTo('home')}
            className={`px-3 py-2 rounded-lg transition-colors ${
              currentView === 'home'
                ? 'bg-stone-100 dark:bg-stone-800 text-emerald-600 dark:text-emerald-400 font-bold'
                : 'text-stone-600 dark:text-stone-300 hover:text-stone-900 dark:hover:text-white'
            }`}
          >
            الرئيسية
          </button>
          <button
            id="nav-link-subjects"
            onClick={() => navigateTo('subjects')}
            className={`px-3 py-2 rounded-lg transition-colors ${
              currentView === 'subjects' || currentView === 'subject-detail'
                ? 'bg-stone-100 dark:bg-stone-800 text-emerald-600 dark:text-emerald-400 font-bold'
                : 'text-stone-600 dark:text-stone-300 hover:text-stone-900 dark:hover:text-white'
            }`}
          >
            المقاييس
          </button>
          <button
            id="nav-link-summaries"
            onClick={() => navigateTo('summaries')}
            className={`px-3 py-2 rounded-lg transition-colors ${
              currentView === 'summaries'
                ? 'bg-stone-100 dark:bg-stone-800 text-emerald-600 dark:text-emerald-400 font-bold'
                : 'text-stone-600 dark:text-stone-300 hover:text-stone-900 dark:hover:text-white'
            }`}
          >
            الملخصات
          </button>
          <button
            id="nav-link-quizzes"
            onClick={() => navigateTo('quizzes')}
            className={`px-3 py-2 rounded-lg transition-colors ${
              currentView === 'quizzes' || currentView === 'quiz-play'
                ? 'bg-stone-100 dark:bg-stone-800 text-emerald-600 dark:text-emerald-400 font-bold'
                : 'text-stone-600 dark:text-stone-300 hover:text-stone-900 dark:hover:text-white'
            }`}
          >
            الاختبارات
          </button>
          <button
            id="nav-link-progress"
            onClick={() => navigateTo('progress')}
            className={`px-3 py-2 rounded-lg transition-colors ${
              currentView === 'progress'
                ? 'bg-stone-100 dark:bg-stone-800 text-emerald-600 dark:text-emerald-400 font-bold'
                : 'text-stone-600 dark:text-stone-300 hover:text-stone-900 dark:hover:text-white'
            }`}
          >
            تقدمي الدراسي
          </button>
          <button
            id="nav-link-subscription"
            onClick={() => navigateTo('subscription')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/50 hover:bg-amber-100 dark:hover:bg-amber-900/60 font-semibold text-xs transition-colors border border-amber-200 dark:border-amber-900/50"
          >
            <Crown className="w-4 h-4 text-amber-500" />
            <span>باقة Premium</span>
          </button>
          <button
            id="nav-link-admin"
            onClick={() => {
              if (currentUser.role !== 'admin') {
                switchDemoUser('admin', 'premium');
              }
              navigateTo('admin');
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold text-xs transition-all shadow-xs ${
              currentUser.role === 'admin'
                ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-500/20'
                : 'bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 hover:text-emerald-600 border border-stone-200 dark:border-stone-700'
            }`}
            title="الدخول إلى لوحة الإدارة العامة"
          >
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            <span>لوحة الإدارة</span>
            {currentUser.role === 'admin' && (
              <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse"></span>
            )}
          </button>
        </nav>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          {/* Search button */}
          <button
            id="nav-search-btn"
            onClick={() => navigateTo('search')}
            className="p-2 text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 rounded-xl transition-colors"
            title="البحث في المنصة"
          >
            <Search className="w-5 h-5" />
          </button>

          {/* Dark Mode Switcher */}
          <button
            id="nav-dark-mode-btn"
            onClick={toggleDarkMode}
            className="p-2 text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 rounded-xl transition-colors"
            title={isDarkMode ? 'الوضع النهاري' : 'الوضع الليلي'}
          >
            {isDarkMode ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5" />}
          </button>

          {/* Notifications Dropdown */}
          <div className="relative">
            <button
              id="nav-notifications-btn"
              onClick={() => {
                setNotifDropdownOpen(!notifDropdownOpen);
                setUserDropdownOpen(false);
                if (!notifDropdownOpen) markNotificationsAsRead();
              }}
              className="relative p-2 text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 rounded-xl transition-colors"
              title="الإشعارات"
            >
              <Bell className="w-5 h-5" />
              {unreadNotificationsCount > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-rose-500 rounded-full ring-2 ring-white dark:ring-stone-900 animate-pulse" />
              )}
            </button>

            {notifDropdownOpen && (
              <div
                id="notifications-popover"
                className="absolute left-0 mt-2 w-80 sm:w-96 bg-white dark:bg-stone-900 rounded-2xl shadow-xl border border-stone-200 dark:border-stone-800 py-3 px-2 z-50 animate-in fade-in zoom-in-95 duration-150"
              >
                <div className="flex items-center justify-between px-3 pb-2 border-b border-stone-100 dark:border-stone-800">
                  <span className="font-bold text-sm text-stone-900 dark:text-stone-100">الإشعارات والتحديثات</span>
                  <button
                    onClick={() => {
                      setNotifDropdownOpen(false);
                      navigateTo('notifications');
                    }}
                    className="text-xs text-emerald-600 dark:text-emerald-400 hover:underline"
                  >
                    عرض الكل
                  </button>
                </div>
                <div className="divide-y divide-stone-100 dark:divide-stone-800/60 max-h-72 overflow-y-auto mt-1">
                  {notifications.slice(0, 4).map((notif) => (
                    <div
                      key={notif.id}
                      onClick={() => {
                        setNotifDropdownOpen(false);
                        if (notif.link) {
                          if (notif.link.startsWith('/subjects/')) {
                            navigateTo('subject-detail', { subjectId: notif.link.split('/')[2] });
                          } else if (notif.link.startsWith('/quizzes/')) {
                            navigateTo('quiz-play', { quizId: notif.link.split('/')[2] });
                          } else {
                            navigateTo('notifications');
                          }
                        }
                      }}
                      className="p-3 hover:bg-stone-50 dark:hover:bg-stone-800/50 rounded-xl cursor-pointer transition-colors text-right"
                    >
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="font-bold text-stone-900 dark:text-stone-200">{notif.title}</span>
                        <span className="text-stone-400 text-[10px]">{notif.date}</span>
                      </div>
                      <p className="text-xs text-stone-600 dark:text-stone-400 leading-snug line-clamp-2">
                        {notif.message}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* User Profile & Demo Switcher Dropdown */}
          <div className="relative">
            <button
              id="nav-user-dropdown-btn"
              onClick={() => {
                setUserDropdownOpen(!userDropdownOpen);
                setNotifDropdownOpen(false);
              }}
              className="flex items-center gap-2 p-1.5 pr-2.5 rounded-xl bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 transition-colors"
            >
              <img
                src={currentUser.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100'}
                alt={currentUser.name}
                className="w-7 h-7 rounded-lg object-cover ring-1 ring-stone-300 dark:ring-stone-700"
              />
              <div className="hidden sm:block text-right">
                <p className="text-xs font-bold text-stone-900 dark:text-stone-100 leading-none">
                  {currentUser.name}
                </p>
                <div className="flex items-center gap-1 mt-0.5">
                  {currentUser.role === 'admin' ? (
                    <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400">مشرفة (Admin)</span>
                  ) : currentUser.subscriptionStatus === 'premium' ? (
                    <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400 flex items-center gap-0.5">
                      <Crown className="w-2.5 h-2.5" /> Premium
                    </span>
                  ) : (
                    <span className="text-[10px] text-stone-500 dark:text-stone-400">حساب مجاني</span>
                  )}
                </div>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-stone-400" />
            </button>

            {userDropdownOpen && (
              <div
                id="user-profile-popover"
                className="absolute left-0 mt-2 w-72 bg-white dark:bg-stone-900 rounded-2xl shadow-xl border border-stone-200 dark:border-stone-800 py-3 px-2 z-50 animate-in fade-in zoom-in-95 duration-150"
              >
                <div className="px-3 pb-3 border-b border-stone-100 dark:border-stone-800 text-right">
                  <p className="font-bold text-sm text-stone-900 dark:text-stone-100">{currentUser.name}</p>
                  <p className="text-xs text-stone-500 dark:text-stone-400 truncate">{currentUser.email}</p>
                  <div className="mt-2 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300">
                    <BookOpen className="w-3.5 h-3.5" />
                    <span>{currentUser.academicLevel}</span>
                  </div>
                </div>

                {/* Quick Navigation */}
                <div className="py-2 space-y-1">
                  <button
                    onClick={() => {
                      setUserDropdownOpen(false);
                      navigateTo('profile');
                    }}
                    className="w-full flex items-center justify-between px-3 py-2 text-xs font-medium text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 rounded-lg text-right"
                  >
                    <span>الملف الشخصي والاشتراك</span>
                    <User className="w-4 h-4 text-stone-400" />
                  </button>
                  <button
                    onClick={() => {
                      setUserDropdownOpen(false);
                      navigateTo('favorites');
                    }}
                    className="w-full flex items-center justify-between px-3 py-2 text-xs font-medium text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 rounded-lg text-right"
                  >
                    <span>الدروس والملخصات المفضلة</span>
                    <span className="text-[10px] bg-stone-200 dark:bg-stone-800 px-1.5 py-0.5 rounded">❤️</span>
                  </button>
                  <button
                    onClick={() => {
                      setUserDropdownOpen(false);
                      if (currentUser.role !== 'admin') {
                        switchDemoUser('admin', 'premium');
                      }
                      navigateTo('admin');
                    }}
                    className="w-full flex items-center justify-between px-3 py-2 text-xs font-semibold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 rounded-lg text-right"
                  >
                    <span>لوحة تحكم الإدارة (Admin)</span>
                    <ShieldCheck className="w-4 h-4" />
                  </button>
                </div>

                {/* Quick Role & Account Switcher (Demo / Testing feature requested) */}
                <div className="mt-2 pt-2 border-t border-stone-100 dark:border-stone-800 px-2">
                  <p className="text-[11px] font-bold text-stone-400 mb-1.5 text-right">
                    تجربة الأدوار بنقرة واحدة (Demo):
                  </p>
                  <div className="grid grid-cols-3 gap-1">
                    <button
                      onClick={() => {
                        setUserDropdownOpen(false);
                        switchDemoUser('student', 'free');
                      }}
                      className={`text-[10px] py-1.5 px-1 rounded font-bold border transition-colors ${
                        currentUser.role === 'student' && currentUser.subscriptionStatus === 'free'
                          ? 'bg-stone-200 dark:bg-stone-800 border-stone-400 text-stone-900 dark:text-white'
                          : 'bg-stone-50 dark:bg-stone-900/50 border-stone-200 dark:border-stone-800 text-stone-600 dark:text-stone-400'
                      }`}
                    >
                      طالب Free
                    </button>
                    <button
                      onClick={() => {
                        setUserDropdownOpen(false);
                        switchDemoUser('student', 'premium');
                      }}
                      className={`text-[10px] py-1.5 px-1 rounded font-bold border transition-colors ${
                        currentUser.subscriptionStatus === 'premium' && currentUser.role === 'student'
                          ? 'bg-amber-100 dark:bg-amber-950 border-amber-400 text-amber-900 dark:text-amber-200'
                          : 'bg-stone-50 dark:bg-stone-900/50 border-stone-200 dark:border-stone-800 text-amber-700 dark:text-amber-400'
                      }`}
                    >
                      طالب Premium
                    </button>
                    <button
                      onClick={() => {
                        setUserDropdownOpen(false);
                        switchDemoUser('admin', 'premium');
                      }}
                      className={`text-[10px] py-1.5 px-1 rounded font-bold border transition-colors ${
                        currentUser.role === 'admin'
                          ? 'bg-emerald-100 dark:bg-emerald-950 border-emerald-400 text-emerald-900 dark:text-emerald-200'
                          : 'bg-stone-50 dark:bg-stone-900/50 border-stone-200 dark:border-stone-800 text-emerald-700 dark:text-emerald-400'
                      }`}
                    >
                      المشرفة Admin
                    </button>
                  </div>
                </div>

                {/* Firebase Authentication Section */}
                <div className="mt-2 pt-2 border-t border-stone-100 dark:border-stone-800 px-2">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[10px] font-medium text-stone-500 dark:text-stone-400">سحابة Firebase:</span>
                    <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-1.5 py-0.5 rounded">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                      متصل
                    </span>
                  </div>

                  {firebaseUser ? (
                    <div className="space-y-1">
                      <div className="text-[10px] text-stone-500 dark:text-stone-400 truncate">
                        Google: {firebaseUser.email}
                      </div>
                      <button
                        id="firebase-signout-btn"
                        onClick={() => {
                          setUserDropdownOpen(false);
                          signOutUser();
                        }}
                        className="w-full flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg text-xs font-medium text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                      >
                        <LogOut className="w-3.5 h-3.5" />
                        <span>تسجيل الخروج من Google</span>
                      </button>
                    </div>
                  ) : (
                    <button
                      id="firebase-google-login-btn"
                      onClick={() => {
                        setUserDropdownOpen(false);
                        signInWithGoogle();
                      }}
                      className="w-full flex items-center justify-center gap-2 py-1.5 px-2.5 rounded-lg text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm transition-colors"
                    >
                      <LogIn className="w-3.5 h-3.5" />
                      <span>تسجيل الدخول عبر Google</span>
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
