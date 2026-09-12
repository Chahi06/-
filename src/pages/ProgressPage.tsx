import React from 'react';
import { useApp } from '../context/AppContext';
import {
  Award,
  BookOpen,
  CheckCircle2,
  Clock,
  Heart,
  Crown,
  Sparkles,
  ArrowLeft,
  Calendar,
  Layers,
} from 'lucide-react';

export function ProgressPage() {
  const { studentProgress, subjects, currentUser, navigateTo } = useApp();

  const totalLessonsInApp = subjects.reduce((acc, s) => acc + s.lessonsCount, 0) || 1;
  const completedLessonsCount = studentProgress.completedLessons.length;
  const overallLessonPercentage = Math.round((completedLessonsCount / Math.max(totalLessonsInApp, 1)) * 100);

  const totalQuizzesTaken = studentProgress.quizResults.length;
  const averageQuizScore =
    totalQuizzesTaken > 0
      ? Math.round(studentProgress.quizResults.reduce((acc, q) => acc + q.score, 0) / totalQuizzesTaken)
      : 0;

  return (
    <div id="progress-page" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="border-b border-stone-200 dark:border-stone-800 pb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 mb-2">
            <Award className="w-3.5 h-3.5" />
            <span>لوحة المؤشرات الأكاديمية</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold text-stone-900 dark:text-stone-100 tracking-tight">
            تقدمي الدراسي
          </h1>
          <p className="text-xs sm:text-sm text-stone-600 dark:text-stone-400 mt-1">
            تابع إنجازاتك في دراسة الدروس، ونتائج اختباراتك، ومسار تفوقك الأكاديمي.
          </p>
        </div>

        {/* Subscription Status Pill */}
        <div className="bg-white dark:bg-stone-900 p-4 rounded-2xl border border-stone-200 dark:border-stone-800 shadow-sm flex items-center gap-3 self-start sm:self-auto">
          <div
            className={`w-10 h-10 rounded-xl flex items-center justify-center ${
              currentUser.subscriptionStatus === 'premium'
                ? 'bg-amber-100 dark:bg-amber-950 text-amber-600 dark:text-amber-400'
                : 'bg-stone-100 dark:bg-stone-800 text-stone-500'
            }`}
          >
            <Crown className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] text-stone-400 block font-medium">نوع العضوية</span>
            <span className="text-xs font-bold text-stone-900 dark:text-stone-100">
              {currentUser.subscriptionStatus === 'premium' ? 'عضوية Premium مميزة' : 'حساب مجاني Free'}
            </span>
          </div>
          {currentUser.subscriptionStatus === 'free' && (
            <button
              onClick={() => navigateTo('subscription')}
              className="mr-2 px-3 py-1.5 rounded-lg text-xs font-bold bg-amber-500 hover:bg-amber-600 text-white shadow-xs"
            >
              ترقية
            </button>
          )}
        </div>
      </div>

      {/* Top 4 Metrics Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200/80 dark:border-stone-800 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs text-stone-500 dark:text-stone-400 font-medium">الدروس المكتملة</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-950 text-emerald-600 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-black text-stone-900 dark:text-stone-100">
            {completedLessonsCount}
          </p>
          <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold mt-1 block">
            {overallLessonPercentage}% من إجمالي الدروس
          </span>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200/80 dark:border-stone-800 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs text-stone-500 dark:text-stone-400 font-medium">الاختبارات المجتازة</span>
            <div className="w-8 h-8 rounded-lg bg-teal-100 dark:bg-teal-950 text-teal-600 flex items-center justify-center">
              <Award className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-black text-stone-900 dark:text-stone-100">
            {totalQuizzesTaken}
          </p>
          <span className="text-[11px] text-stone-400 mt-1 block">اختبارات منجزة</span>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200/80 dark:border-stone-800 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs text-stone-500 dark:text-stone-400 font-medium">معدل الاختبارات</span>
            <div className="w-8 h-8 rounded-lg bg-amber-100 dark:bg-amber-950 text-amber-600 flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-black text-stone-900 dark:text-stone-100">
            {averageQuizScore}%
          </p>
          <span className="text-[11px] text-amber-600 dark:text-amber-400 font-semibold mt-1 block">
            متوسط درجاتك الحالية
          </span>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200/80 dark:border-stone-800 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs text-stone-500 dark:text-stone-400 font-medium">العناصر المفضلة</span>
            <div className="w-8 h-8 rounded-lg bg-rose-100 dark:bg-rose-950 text-rose-600 flex items-center justify-center">
              <Heart className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-black text-stone-900 dark:text-stone-100">
            {studentProgress.favoriteLessons.length + studentProgress.favoriteSummaries.length}
          </p>
          <button
            onClick={() => navigateTo('favorites')}
            className="text-[11px] text-rose-600 dark:text-rose-400 font-semibold mt-1 block hover:underline"
          >
            عرض المفضلة ←
          </button>
        </div>
      </div>

      {/* Progress Breakdown by Subject */}
      <div className="bg-white dark:bg-stone-900 rounded-3xl border border-stone-200/80 dark:border-stone-800 p-6 sm:p-8 shadow-sm space-y-6">
        <h2 className="text-lg font-bold text-stone-900 dark:text-stone-100">
          نسبة إنجاز الدروس حسب المقياس
        </h2>

        <div className="space-y-4">
          {subjects.map((subj) => {
            // Simulated progress per subject
            const completedInSubj = Math.min(subj.lessonsCount, Math.floor(subj.lessonsCount * 0.4));
            const percent = Math.round((completedInSubj / Math.max(subj.lessonsCount, 1)) * 100);

            return (
              <div key={subj.id} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs font-semibold">
                  <span className="text-stone-800 dark:text-stone-200">{subj.title}</span>
                  <span className="text-stone-500">
                    {completedInSubj} من {subj.lessonsCount} درس ({percent}%)
                  </span>
                </div>
                <div className="w-full h-2.5 bg-stone-100 dark:bg-stone-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-emerald-600 rounded-full transition-all duration-500"
                    style={{ width: `${percent}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Recent Quiz Attempts Log */}
      <div className="bg-white dark:bg-stone-900 rounded-3xl border border-stone-200/80 dark:border-stone-800 p-6 sm:p-8 shadow-sm space-y-4">
        <h2 className="text-lg font-bold text-stone-900 dark:text-stone-100">
          سجل الاختبارات الأخيرة
        </h2>

        {studentProgress.quizResults.length === 0 ? (
          <div className="p-6 text-center text-xs text-stone-500">
            لم تقم بإجراء أي اختبار بعد.{' '}
            <button onClick={() => navigateTo('quizzes')} className="text-emerald-600 font-bold hover:underline">
              ابدأ أول اختبار الآن
            </button>
          </div>
        ) : (
          <div className="divide-y divide-stone-100 dark:divide-stone-800">
            {studentProgress.quizResults.map((qr) => (
              <div key={qr.id} className="py-3.5 flex items-center justify-between gap-3 text-xs">
                <div>
                  <h4 className="font-bold text-stone-900 dark:text-stone-100 text-sm mb-0.5">
                    {qr.quizTitle}
                  </h4>
                  <span className="text-stone-400 text-[11px]">{qr.completedAt}</span>
                </div>

                <div className="flex items-center gap-3">
                  <span
                    className={`px-3 py-1 rounded-full font-bold ${
                      qr.passed
                        ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                        : 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                    }`}
                  >
                    {qr.score}% {qr.passed ? 'ناجح' : 'راسب'}
                  </span>
                  <button
                    onClick={() => navigateTo('quiz-play', { quizId: qr.quizId })}
                    className="text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 font-semibold"
                  >
                    إعادة
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
