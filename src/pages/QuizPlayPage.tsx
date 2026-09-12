import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import type { Quiz, QuizQuestion } from '../types/index';
import {
  CheckSquare,
  Clock,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  XCircle,
  AlertCircle,
  RotateCcw,
  Sparkles,
  Lock,
  Award,
  BookOpen,
} from 'lucide-react';

export function QuizPlayPage() {
  const { navParams, navigateTo, currentUser, openPremiumModal, showToast, refreshBootstrap } = useApp();
  const quizId = navParams.quizId || 'qz-nahw-1';

  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [loading, setLoading] = useState(true);
  const [isLocked, setIsLocked] = useState(false);

  // Quiz Play State
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<Record<string, string>>({});
  const [timeLeft, setTimeLeft] = useState<number>(600); // 10 minutes default
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [result, setResult] = useState<{
    score: number;
    total: number;
    passed: boolean;
    answersBreakdown: Array<{
      questionId: string;
      questionText: string;
      userAnswer: string;
      correctAnswer: string;
      isCorrect: boolean;
      explanation: string;
    }>;
  } | null>(null);

  useEffect(() => {
    async function loadQuiz() {
      setLoading(true);
      try {
        const res = await fetch(`/api/quizzes/${quizId}`);
        const data = await res.json();
        if (res.ok) {
          setQuiz(data.quiz);
          setIsLocked(data.isLockedForUser);
          if (data.quiz?.durationMinutes) {
            setTimeLeft(data.quiz.durationMinutes * 60);
          }
        } else {
          setQuiz(null);
        }
      } catch (e) {
        console.error('Failed to load quiz:', e);
      } finally {
        setLoading(false);
      }
    }
    loadQuiz();
  }, [quizId]);

  // Timer effect
  useEffect(() => {
    if (isSubmitted || loading || isLocked || timeLeft <= 0) return;
    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          handleSubmitQuiz();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [isSubmitted, loading, isLocked, timeLeft]);

  const formatTime = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const handleSelectAnswer = (questionId: string, answer: string) => {
    if (isSubmitted) return;
    setUserAnswers((prev) => ({
      ...prev,
      [questionId]: answer,
    }));
  };

  const handleSubmitQuiz = async () => {
    if (!quiz) return;
    try {
      const res = await fetch(`/api/quizzes/${quiz.id}/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userAnswers }),
      });
      const data = await res.json();
      if (res.ok) {
        setResult(data);
        setIsSubmitted(true);
        await refreshBootstrap();
        showToast(
          data.passed
            ? `مبروك! لقد اجتزت الاختبار بنجاح بنسبة ${data.score}% 🎉`
            : `أنهيت الاختبار بنسبة ${data.score}%. يمكنك مراجعة الأسئلة وإعادة المحاولة.`,
          data.passed ? 'success' : 'info'
        );
      } else {
        showToast(data.message || 'حدث خطأ أثناء تصحيح الاختبار', 'error');
      }
    } catch (e) {
      showToast('خطأ في إرسال الإجابات', 'error');
    }
  };

  const handleResetQuiz = () => {
    setUserAnswers({});
    setCurrentIndex(0);
    setIsSubmitted(false);
    setResult(null);
    if (quiz?.durationMinutes) {
      setTimeLeft(quiz.durationMinutes * 60);
    }
  };

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center">
        <div className="w-10 h-10 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-sm text-stone-500 font-medium">جاري إعداد الاختبار التفاعلي...</p>
      </div>
    );
  }

  if (isLocked) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <div className="bg-white dark:bg-stone-900 rounded-3xl border border-amber-300 dark:border-amber-900/50 p-8 shadow-xl">
          <div className="w-16 h-16 rounded-2xl bg-amber-100 dark:bg-amber-950 text-amber-600 dark:text-amber-400 flex items-center justify-center mx-auto mb-4">
            <Lock className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-bold text-stone-900 dark:text-stone-100 mb-2">
            هذا الاختبار متاح لأعضاء Premium
          </h2>
          <p className="text-sm text-stone-600 dark:text-stone-400 mb-6">
            اشترك في باقة Premium للوصول إلى كافة الاختبارات ونماذج الامتحانات الرسمية مع الحلول المفصلة.
          </p>
          <button
            onClick={() => openPremiumModal(`اشترك الآن للوصول إلى هذا الاختبار وبنك الأسئلة الكامل.`)}
            className="px-6 py-3 rounded-xl font-bold text-white bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-700 shadow-md text-sm"
          >
            اشترك الآن (من 300 دج)
          </button>
        </div>
      </div>
    );
  }

  if (!quiz || !quiz.questions || quiz.questions.length === 0) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <p className="text-sm text-stone-500">الاختبار غير متوفر حالياً.</p>
        <button
          onClick={() => navigateTo('quizzes')}
          className="mt-4 px-4 py-2 rounded-xl bg-emerald-600 text-white font-bold text-xs"
        >
          العودة للاختبارات
        </button>
      </div>
    );
  }

  const currentQ: QuizQuestion = quiz.questions[currentIndex];
  const progressPercent = Math.round(((currentIndex + 1) / quiz.questions.length) * 100);

  return (
    <div id="quiz-play-page" className="max-w-3xl mx-auto px-4 sm:px-6 py-8 space-y-6">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigateTo('quizzes')}
          className="flex items-center gap-1.5 text-xs font-bold text-stone-500 hover:text-stone-800 dark:hover:text-stone-200 transition-colors"
        >
          <ArrowRight className="w-4 h-4" />
          <span>الخروج من الاختبار</span>
        </button>

        {!isSubmitted && (
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-stone-100 dark:bg-stone-800 text-xs font-bold text-stone-700 dark:text-stone-300">
            <Clock className="w-4 h-4 text-emerald-600" />
            <span dir="ltr">{formatTime(timeLeft)}</span>
          </div>
        )}
      </div>

      {/* When Quiz is In Progress */}
      {!isSubmitted ? (
        <div className="bg-white dark:bg-stone-900 rounded-3xl border border-stone-200/80 dark:border-stone-800 p-6 sm:p-8 shadow-sm space-y-6">
          {/* Progress Bar & Header */}
          <div>
            <div className="flex items-center justify-between text-xs font-bold text-stone-500 mb-2">
              <span>{quiz.title}</span>
              <span>
                السؤال {currentIndex + 1} من {quiz.questions.length}
              </span>
            </div>
            <div className="w-full h-2 bg-stone-100 dark:bg-stone-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-emerald-600 rounded-full transition-all duration-300"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          {/* Question Text */}
          <div className="py-2">
            <span className="inline-block px-2.5 py-0.5 rounded-md text-[11px] font-bold bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 mb-2">
              {currentQ.type === 'true_false' ? 'صواب أو خطأ' : 'اختيار من متعدد'}
            </span>
            <h3 className="text-lg sm:text-xl font-bold text-stone-900 dark:text-stone-100 leading-snug">
              {currentQ.questionText || (currentQ as any).question}
            </h3>
          </div>

          {/* Options */}
          <div className="space-y-3">
            {currentQ.options.map((opt, idx) => {
              const isSelected = userAnswers[currentQ.id] === opt;
              return (
                <button
                  key={idx}
                  onClick={() => handleSelectAnswer(currentQ.id, opt)}
                  className={`w-full p-4 rounded-2xl text-right text-xs sm:text-sm font-semibold border-2 transition-all flex items-center justify-between ${
                    isSelected
                      ? 'border-emerald-600 bg-emerald-50/50 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-200 shadow-sm'
                      : 'border-stone-200 dark:border-stone-800 hover:border-stone-300 dark:hover:border-stone-700 text-stone-700 dark:text-stone-300 bg-stone-50/50 dark:bg-stone-800/30'
                  }`}
                >
                  <span className="leading-relaxed">{opt}</span>
                  <div
                    className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 mr-3 ${
                      isSelected
                        ? 'border-emerald-600 bg-emerald-600 text-white'
                        : 'border-stone-300 dark:border-stone-600'
                    }`}
                  >
                    {isSelected && <div className="w-2 h-2 bg-white rounded-full" />}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Navigation Controls */}
          <div className="flex items-center justify-between pt-4 border-t border-stone-100 dark:border-stone-800">
            <button
              onClick={() => setCurrentIndex((idx) => Math.max(0, idx - 1))}
              disabled={currentIndex === 0}
              className="px-4 py-2.5 rounded-xl text-xs font-bold border border-stone-200 dark:border-stone-700 text-stone-600 dark:text-stone-300 disabled:opacity-30 transition-colors flex items-center gap-1"
            >
              <ArrowRight className="w-4 h-4" />
              <span>السابق</span>
            </button>

            {currentIndex === quiz.questions.length - 1 ? (
              <button
                id="btn-submit-quiz"
                onClick={handleSubmitQuiz}
                className="px-6 py-2.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white transition-colors shadow-sm flex items-center gap-1.5"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>إنهاء وتصحيح الاختبار</span>
              </button>
            ) : (
              <button
                onClick={() => setCurrentIndex((idx) => Math.min(quiz.questions.length - 1, idx + 1))}
                className="px-6 py-2.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white transition-colors shadow-sm flex items-center gap-1"
              >
                <span>السؤال التالي</span>
                <ArrowLeft className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      ) : (
        /* Results and Detailed Review View */
        <div className="space-y-6">
          {/* Result Score Card */}
          <div className="bg-white dark:bg-stone-900 rounded-3xl border border-stone-200/80 dark:border-stone-800 p-6 sm:p-8 text-center shadow-sm">
            <div
              className={`w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 ${
                result?.passed
                  ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400'
                  : 'bg-amber-100 text-amber-600 dark:bg-amber-950 dark:text-amber-400'
              }`}
            >
              <Award className="w-8 h-8" />
            </div>

            <span
              className={`inline-block px-3 py-1 rounded-full text-xs font-bold mb-2 ${
                result?.passed
                  ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                  : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
              }`}
            >
              {result?.passed ? 'اجتياز ناجح وممتاز ✓' : 'بحاجة إلى مزيد من المراجعة'}
            </span>

            <h2 className="text-2xl sm:text-3xl font-black text-stone-900 dark:text-stone-100 mb-1">
              النتيجة: {result?.score}%
            </h2>
            <p className="text-xs sm:text-sm text-stone-500 mb-6">
              أجبت بشكل صحيح على {result?.answersBreakdown.filter((a) => a.isCorrect).length} من أصل{' '}
              {result?.total} أسئلة
            </p>

            <div className="flex flex-wrap items-center justify-center gap-3">
              <button
                onClick={handleResetQuiz}
                className="px-5 py-2.5 rounded-xl font-bold text-xs bg-emerald-600 hover:bg-emerald-700 text-white transition-colors flex items-center gap-1.5"
              >
                <RotateCcw className="w-4 h-4" />
                <span>إعادة الاختبار الآن</span>
              </button>
              <button
                onClick={() => navigateTo('quizzes')}
                className="px-5 py-2.5 rounded-xl font-medium text-xs bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 hover:bg-stone-200 transition-colors"
              >
                العودة لقائمة الاختبارات
              </button>
            </div>
          </div>

          {/* Detailed Question Review with Explanations */}
          <div className="bg-white dark:bg-stone-900 rounded-3xl border border-stone-200/80 dark:border-stone-800 p-6 sm:p-8 shadow-sm space-y-6">
            <h3 className="text-base sm:text-lg font-bold text-stone-900 dark:text-stone-100 pb-3 border-b border-stone-100 dark:border-stone-800">
              مراجعة الإجابات والشرح المنهجي
            </h3>

            <div className="space-y-6">
              {result?.answersBreakdown.map((item, idx) => (
                <div
                  key={idx}
                  className={`p-5 rounded-2xl border ${
                    item.isCorrect
                      ? 'border-emerald-200 dark:border-emerald-900/60 bg-emerald-50/20 dark:bg-emerald-950/20'
                      : 'border-rose-200 dark:border-rose-900/60 bg-rose-50/20 dark:bg-rose-950/20'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-start gap-2.5">
                      {item.isCorrect ? (
                        <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                      ) : (
                        <XCircle className="w-5 h-5 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
                      )}
                      <div>
                        <span className="text-[11px] font-bold text-stone-400 block mb-0.5">السؤال #{idx + 1}</span>
                        <p className="text-sm font-bold text-stone-900 dark:text-stone-100 leading-snug">
                          {item.questionText}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs mb-3 pr-7">
                    <div
                      className={`p-2.5 rounded-xl border ${
                        item.isCorrect
                          ? 'bg-emerald-100/60 dark:bg-emerald-950/50 border-emerald-300 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200'
                          : 'bg-rose-100/60 dark:bg-rose-950/50 border-rose-300 dark:border-rose-800 text-rose-900 dark:text-rose-200'
                      }`}
                    >
                      <span className="block text-[10px] text-stone-500 font-bold mb-0.5">إجابتك:</span>
                      <span className="font-semibold">{item.userAnswer || 'لم تجب'}</span>
                    </div>

                    {!item.isCorrect && (
                      <div className="p-2.5 rounded-xl border bg-emerald-100/60 dark:bg-emerald-950/50 border-emerald-300 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200">
                        <span className="block text-[10px] text-emerald-600 font-bold mb-0.5">الإجابة النموذجية:</span>
                        <span className="font-semibold">{item.correctAnswer}</span>
                      </div>
                    )}
                  </div>

                  {item.explanation && (
                    <div className="mr-7 p-3 rounded-xl bg-stone-100 dark:bg-stone-800 text-xs text-stone-700 dark:text-stone-300 leading-relaxed border border-stone-200 dark:border-stone-700">
                      <span className="font-bold text-stone-900 dark:text-stone-100 block mb-0.5">الشرح والتعليل:</span>
                      {item.explanation}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
