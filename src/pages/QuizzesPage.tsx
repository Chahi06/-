import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import type { Quiz } from '../types/index';
import {
  CheckSquare,
  Clock,
  Lock,
  Sparkles,
  Award,
  Search,
  ArrowLeft,
  BookOpen,
} from 'lucide-react';

export function QuizzesPage() {
  const { subjects, currentUser, openPremiumModal, navigateTo, studentProgress } = useApp();
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadQuizzes() {
      setLoading(true);
      try {
        const res = await fetch('/api/quizzes');
        if (res.ok) {
          const data = await res.json();
          setQuizzes(data);
        }
      } catch (e) {
        console.error('Failed to load quizzes:', e);
      } finally {
        setLoading(false);
      }
    }
    loadQuizzes();
  }, []);

  const isPremiumUser = currentUser.subscriptionStatus === 'premium' || currentUser.role === 'admin';

  const filtered = quizzes.filter((q) => {
    return selectedSubjectId === 'all' || q.subjectId === selectedSubjectId;
  });

  return (
    <div id="quizzes-page" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="border-b border-stone-200 dark:border-stone-800 pb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 mb-2">
            <CheckSquare className="w-3.5 h-3.5" />
            <span>بنك الأسئلة والتقييم الذاتي</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold text-stone-900 dark:text-stone-100 tracking-tight">
            الاختبارات التفاعلية
          </h1>
          <p className="text-xs sm:text-sm text-stone-600 dark:text-stone-400 mt-1">
            اختبر مكتسباتك في مختلف مقاييس السنة الأولى مع تصحيح فوري وتعليل منهجي مفصل.
          </p>
        </div>

        {/* User Stats Card */}
        <div className="bg-stone-50 dark:bg-stone-800/60 rounded-2xl p-4 border border-stone-200 dark:border-stone-700/60 flex items-center gap-4 self-start md:self-auto">
          <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
            <Award className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] text-stone-400 block font-medium">اختبارات قمت بحلها</span>
            <span className="text-lg font-black text-stone-900 dark:text-stone-100">
              {studentProgress.quizResults.length} من {quizzes.length}
            </span>
          </div>
        </div>
      </div>

      {/* Subject Filter Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        <button
          onClick={() => setSelectedSubjectId('all')}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors whitespace-nowrap ${
            selectedSubjectId === 'all'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300 hover:bg-stone-200'
          }`}
        >
          جميع المقاييس ({quizzes.length})
        </button>
        {subjects.map((subj) => (
          <button
            key={subj.id}
            onClick={() => setSelectedSubjectId(subj.id)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors whitespace-nowrap ${
              selectedSubjectId === subj.id
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300 hover:bg-stone-200'
            }`}
          >
            {subj.title}
          </button>
        ))}
      </div>

      {/* Quizzes Grid */}
      {loading ? (
        <div className="py-16 text-center">
          <div className="w-8 h-8 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
          <p className="text-xs text-stone-500">جاري تحميل الاختبارات...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-800 p-8">
          <CheckSquare className="w-10 h-10 text-stone-400 mx-auto mb-2" />
          <p className="text-sm font-bold text-stone-700 dark:text-stone-300">لا توجد اختبارات في هذا المقياس حالياً</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((quiz) => {
            const subj = subjects.find((s) => s.id === quiz.subjectId);
            const pastResult = studentProgress.quizResults.find((r) => r.quizId === quiz.id);

            return (
              <div
                key={quiz.id}
                className="p-6 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200/80 dark:border-stone-800 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className="text-[11px] font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-md">
                      {subj?.title || 'مقياس دراسي'}
                    </span>
                    {quiz.isPremium ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300">
                        <Lock className="w-3 h-3" /> Premium
                      </span>
                    ) : (
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300">
                        مجاني
                      </span>
                    )}
                  </div>

                  <h3 className="text-lg font-bold text-stone-900 dark:text-stone-100 mb-2 leading-snug">
                    {quiz.title}
                  </h3>
                  <p className="text-xs text-stone-600 dark:text-stone-400 mb-4 line-clamp-2 leading-relaxed">
                    {quiz.description}
                  </p>

                  <div className="flex items-center gap-4 text-xs text-stone-500 dark:text-stone-400 mb-6 bg-stone-50 dark:bg-stone-800/40 p-3 rounded-xl border border-stone-100 dark:border-stone-800/60">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      <span>{quiz.durationMinutes} دقيقة</span>
                    </span>
                    <span>•</span>
                    <span>{quiz.questions?.length || 0} أسئلة</span>
                    <span>•</span>
                    <span>نسبة النجاح {quiz.passingScore}%</span>
                  </div>
                </div>

                <div className="pt-3 border-t border-stone-100 dark:border-stone-800 flex items-center justify-between">
                  {pastResult ? (
                    <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                      <Award className="w-3.5 h-3.5" />
                      <span>نتيجتك: {pastResult.score}%</span>
                    </span>
                  ) : (
                    <span className="text-xs text-stone-400">لم يُجتز بعد</span>
                  )}

                  <button
                    onClick={() => {
                      if (quiz.isPremium && !isPremiumUser) {
                        openPremiumModal(`اختبار "${quiz.title}" متاح حصرياً لمشتركي باقة Premium.`);
                      } else {
                        navigateTo('quiz-play', { quizId: quiz.id });
                      }
                    }}
                    className="px-4 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white transition-colors flex items-center gap-1"
                  >
                    <span>{pastResult ? 'إعادة الاختبار' : 'بدء الاختبار'}</span>
                    <ArrowLeft className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
