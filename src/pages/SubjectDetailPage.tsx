import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import type { Subject, Lesson, Summary, PDFFile, Quiz } from '../types/index';
import {
  BookOpen,
  FileText,
  CheckSquare,
  Lock,
  Clock,
  CheckCircle2,
  Download,
  Eye,
  ArrowRight,
  Share2,
  Sparkles,
  ArrowLeft,
  Plus,
  Edit3,
} from 'lucide-react';

export function SubjectDetailPage() {
  const { navParams, navigateTo, currentUser, openPremiumModal, openPdfViewer, studentProgress } = useApp();
  const subjectId = navParams.subjectId || 'subj-nahw';

  const [activeTab, setActiveTab] = useState<'lessons' | 'summaries' | 'pdfs' | 'quizzes'>(
    (navParams.tab as any) || 'lessons'
  );
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<{
    subject: Subject | null;
    lessons: Lesson[];
    summaries: Summary[];
    pdfs: PDFFile[];
    quizzes: Quiz[];
  }>({
    subject: null,
    lessons: [],
    summaries: [],
    pdfs: [],
    quizzes: [],
  });

  useEffect(() => {
    async function fetchSubjectData() {
      setLoading(true);
      try {
        const res = await fetch(`/api/subjects/${subjectId}`);
        if (res.ok) {
          const resData = await res.json();
          setData(resData);
        }
      } catch (e) {
        console.error('Failed to fetch subject details:', e);
      } finally {
        setLoading(false);
      }
    }
    fetchSubjectData();
  }, [subjectId]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <div className="w-10 h-10 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-sm text-stone-500 font-medium">جاري تحميل بيانات المقياس والدروس...</p>
      </div>
    );
  }

  const { subject, lessons, summaries, pdfs, quizzes } = data;
  if (!subject) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <h2 className="text-xl font-bold text-stone-900 dark:text-stone-100">المقياس غير موجود</h2>
        <button
          onClick={() => navigateTo('subjects')}
          className="mt-4 px-4 py-2 rounded-lg bg-emerald-600 text-white font-bold text-sm"
        >
          العودة للمقاييس
        </button>
      </div>
    );
  }

  const isPremiumUser = currentUser.subscriptionStatus === 'premium' || currentUser.role === 'admin';

  return (
    <div id="subject-detail-page" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Breadcrumb & Back */}
      <div className="flex items-center gap-2 text-xs text-stone-500 dark:text-stone-400">
        <button onClick={() => navigateTo('home')} className="hover:underline">
          الرئيسية
        </button>
        <span>/</span>
        <button onClick={() => navigateTo('subjects')} className="hover:underline">
          المقاييس
        </button>
        <span>/</span>
        <span className="font-bold text-stone-800 dark:text-stone-200">{subject.title}</span>
      </div>

      {/* Subject Hero Card */}
      <div
        id="subject-hero-card"
        className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-900 to-teal-950 text-white p-6 sm:p-10 shadow-xl border border-emerald-800"
      >
        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-emerald-800/80 text-emerald-200 border border-emerald-700/60 mb-3">
            <span>{subject.code}</span>
            <span>•</span>
            <span>السنة الأولى تعليم ابتدائي</span>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
            <h1 className="text-2xl sm:text-4xl font-black tracking-tight">
              {subject.title}
            </h1>
            {currentUser.role === 'admin' && (
              <button
                onClick={() => navigateTo('admin', { tab: 'subjects' })}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-white/20 hover:bg-white/30 text-white backdrop-blur-md transition-colors w-fit border border-white/20"
                title="تعديل هذا المقياس في لوحة الإدارة"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>تعديل المقياس في لوحة الإدارة</span>
              </button>
            )}
          </div>

          <p className="text-xs sm:text-sm md:text-base text-emerald-100/90 leading-relaxed mb-6 max-w-2xl">
            {subject.description}
          </p>

          {/* Quick Stats Pill */}
          <div className="flex flex-wrap items-center gap-4 text-xs font-medium text-emerald-200 bg-emerald-950/60 backdrop-blur-md px-4 py-2.5 rounded-2xl w-fit border border-emerald-800/60">
            <span>{lessons.length} دروس</span>
            <span>•</span>
            <span>{summaries.length} ملخصات</span>
            <span>•</span>
            <span>{pdfs.length} ملفات PDF</span>
            <span>•</span>
            <span>{quizzes.length} اختبارات</span>
          </div>
        </div>
      </div>

      {/* 4 Interactive Tabs */}
      <div className="border-b border-stone-200 dark:border-stone-800">
        <div className="flex gap-2 sm:gap-4 overflow-x-auto pb-1 text-sm font-bold">
          <button
            id="tab-btn-subject-lessons"
            onClick={() => setActiveTab('lessons')}
            className={`pb-3 px-3 flex items-center gap-2 border-b-2 transition-all whitespace-nowrap ${
              activeTab === 'lessons'
                ? 'border-emerald-600 text-emerald-600 dark:text-emerald-400'
                : 'border-transparent text-stone-500 hover:text-stone-800 dark:hover:text-stone-200'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>الدروس ({lessons.length})</span>
          </button>

          <button
            id="tab-btn-subject-summaries"
            onClick={() => setActiveTab('summaries')}
            className={`pb-3 px-3 flex items-center gap-2 border-b-2 transition-all whitespace-nowrap ${
              activeTab === 'summaries'
                ? 'border-emerald-600 text-emerald-600 dark:text-emerald-400'
                : 'border-transparent text-stone-500 hover:text-stone-800 dark:hover:text-stone-200'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>الملخصات ({summaries.length})</span>
          </button>

          <button
            id="tab-btn-subject-pdfs"
            onClick={() => setActiveTab('pdfs')}
            className={`pb-3 px-3 flex items-center gap-2 border-b-2 transition-all whitespace-nowrap ${
              activeTab === 'pdfs'
                ? 'border-emerald-600 text-emerald-600 dark:text-emerald-400'
                : 'border-transparent text-stone-500 hover:text-stone-800 dark:hover:text-stone-200'
            }`}
          >
            <Download className="w-4 h-4" />
            <span>ملفات PDF ({pdfs.length})</span>
          </button>

          <button
            id="tab-btn-subject-quizzes"
            onClick={() => setActiveTab('quizzes')}
            className={`pb-3 px-3 flex items-center gap-2 border-b-2 transition-all whitespace-nowrap ${
              activeTab === 'quizzes'
                ? 'border-emerald-600 text-emerald-600 dark:text-emerald-400'
                : 'border-transparent text-stone-500 hover:text-stone-800 dark:hover:text-stone-200'
            }`}
          >
            <CheckSquare className="w-4 h-4" />
            <span>الاختبارات ({quizzes.length})</span>
          </button>
        </div>
      </div>

      {/* Tab 1: الدروس */}
      {activeTab === 'lessons' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-stone-900 dark:text-stone-100">
              قائمة الدروس المنهجية
            </h3>
            <span className="text-xs text-stone-500">
              مرتبة وفق المنهاج الوزاري المعتمد
            </span>
          </div>

          {lessons.length === 0 ? (
            <div className="p-8 text-center bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-800">
              <p className="text-xs text-stone-500">لا توجد دروس مضافة لهذا المقياس حالياً.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {lessons.map((lesson) => {
                const isCompleted = studentProgress.completedLessons.includes(lesson.id);
                return (
                  <div
                    key={lesson.id}
                    id={`lesson-card-${lesson.id}`}
                    className="p-5 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200/80 dark:border-stone-800 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-3">
                        <div className="flex items-center gap-2">
                          <span className="w-6 h-6 rounded-full bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400 text-xs font-bold flex items-center justify-center">
                            {lesson.order}
                          </span>
                          <span className="flex items-center gap-1 text-[11px] text-stone-500 dark:text-stone-400">
                            <Clock className="w-3.5 h-3.5" />
                            <span>{lesson.readingTimeMinutes} دقائق قراءة</span>
                          </span>
                        </div>

                        {/* Badge Free / Premium */}
                        {lesson.isPremium ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-800">
                            <Lock className="w-3 h-3" /> Premium 🔒
                          </span>
                        ) : (
                          <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300">
                            FREE مجاني
                          </span>
                        )}
                      </div>

                      <h4 className="text-base font-bold text-stone-900 dark:text-stone-100 mb-2 leading-snug">
                        {lesson.title}
                      </h4>
                      <p className="text-xs text-stone-600 dark:text-stone-400 line-clamp-2 leading-relaxed mb-4">
                        {lesson.excerpt}
                      </p>
                    </div>

                    <div className="pt-3 border-t border-stone-100 dark:border-stone-800 flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5 text-xs">
                        {isCompleted ? (
                          <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-bold">
                            <CheckCircle2 className="w-4 h-4" /> تمت دراسته
                          </span>
                        ) : (
                          <span className="text-stone-400 text-[11px]">لم يُدرس بعد</span>
                        )}
                      </div>

                      <button
                        onClick={() => {
                          if (lesson.isPremium && !isPremiumUser) {
                            openPremiumModal(`درس "${lesson.title}" متاح حصرياً لمشتركي باقة Premium.`);
                          } else {
                            navigateTo('lesson-detail', { lessonId: lesson.id, subjectId: subject.id });
                          }
                        }}
                        className="px-4 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white transition-colors flex items-center gap-1"
                      >
                        <span>فتح الدرس</span>
                        <ArrowLeft className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Tab 2: الملخصات */}
      {activeTab === 'summaries' && (
        <div className="space-y-4">
          <h3 className="text-lg font-bold text-stone-900 dark:text-stone-100">
            ملخصات المراجعة المركزة
          </h3>
          {summaries.length === 0 ? (
            <div className="p-8 text-center bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-800">
              <p className="text-xs text-stone-500">لا توجد ملخصات مضافة لهذا المقياس حتى الآن.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {summaries.map((sum) => (
                <div
                  key={sum.id}
                  className="p-5 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200/80 dark:border-stone-800 flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <span className="px-2 py-0.5 rounded text-[11px] bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400 font-medium">
                        خلاصة جاهزة
                      </span>
                      {sum.isPremium ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300">
                          <Lock className="w-3 h-3" /> Premium
                        </span>
                      ) : (
                        <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300">
                          مجاني
                        </span>
                      )}
                    </div>
                    <h4 className="text-base font-bold text-stone-900 dark:text-stone-100 mb-2">
                      {sum.title}
                    </h4>
                    <p className="text-xs text-stone-600 dark:text-stone-400 mb-4 leading-relaxed">
                      {sum.excerpt}
                    </p>
                    <div className="space-y-1.5 mb-4 bg-stone-50 dark:bg-stone-800/40 p-3 rounded-xl border border-stone-100 dark:border-stone-800">
                      <span className="text-[11px] font-bold text-stone-500 block mb-1">أبرز النقاط:</span>
                      {sum.keyPoints.slice(0, 2).map((kp, i) => (
                        <p key={i} className="text-xs text-stone-700 dark:text-stone-300 flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                          <span>{kp}</span>
                        </p>
                      ))}
                    </div>
                  </div>
                  <div className="pt-3 border-t border-stone-100 dark:border-stone-800 flex items-center justify-between">
                    <span className="text-xs text-stone-400">{sum.downloadsCount} طالب اطلع عليه</span>
                    <button
                      onClick={() => {
                        if (sum.isPremium && !isPremiumUser) {
                          openPremiumModal(`ملخص "${sum.title}" متاح لمشتركي باقة Premium.`);
                        } else {
                          navigateTo('summaries');
                        }
                      }}
                      className="text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline"
                    >
                      عرض الملخص الكامل ←
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 3: ملفات PDF */}
      {activeTab === 'pdfs' && (
        <div className="space-y-4">
          <h3 className="text-lg font-bold text-stone-900 dark:text-stone-100">
            ملفات ومحاضرات PDF الرسمية
          </h3>
          {pdfs.length === 0 ? (
            <div className="p-8 text-center bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-800">
              <p className="text-xs text-stone-500">لا توجد ملفات PDF لهذا المقياس حالياً.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {pdfs.map((pdf) => (
                <div
                  key={pdf.id}
                  className="p-5 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200/80 dark:border-stone-800 flex flex-col justify-between"
                >
                  <div className="flex gap-4 items-start mb-4">
                    <div className="w-12 h-14 rounded-xl bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex flex-col items-center justify-center shrink-0 border border-rose-200 dark:border-rose-900/60 font-bold text-xs">
                      <FileText className="w-5 h-5 mb-0.5" />
                      <span>PDF</span>
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        {pdf.isPremium ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-bold bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 rounded">
                            <Lock className="w-2.5 h-2.5" /> Premium
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 text-[10px] font-bold bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 rounded">
                            مجاني
                          </span>
                        )}
                        <span className="text-[11px] text-stone-400">
                          {pdf.pagesCount} صفحة • {pdf.fileSize}
                        </span>
                      </div>
                      <h4 className="text-sm font-bold text-stone-900 dark:text-stone-100 leading-snug">
                        {pdf.title}
                      </h4>
                      <p className="text-xs text-stone-500 dark:text-stone-400 mt-1 line-clamp-2">
                        {pdf.description}
                      </p>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-stone-100 dark:border-stone-800 flex items-center justify-end gap-2">
                    <button
                      onClick={() => openPdfViewer(pdf)}
                      className="px-4 py-2 rounded-xl text-xs font-bold bg-stone-100 hover:bg-stone-200 dark:bg-stone-800 dark:hover:bg-stone-700 text-stone-800 dark:text-stone-200 transition-colors flex items-center gap-1.5"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>قراءة داخل الموقع</span>
                    </button>
                    <button
                      onClick={() => {
                        if (pdf.isPremium && !isPremiumUser) {
                          openPremiumModal(`تحميل ملف "${pdf.title}" متاح لأعضاء Premium فقط.`);
                        } else {
                          openPdfViewer(pdf);
                        }
                      }}
                      className="px-4 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white transition-colors flex items-center gap-1.5"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>تحميل</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 4: الاختبارات */}
      {activeTab === 'quizzes' && (
        <div className="space-y-4">
          <h3 className="text-lg font-bold text-stone-900 dark:text-stone-100">
            الاختبارات التفاعلية وبنك الأسئلة
          </h3>
          {quizzes.length === 0 ? (
            <div className="p-8 text-center bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-800">
              <p className="text-xs text-stone-500">لا توجد اختبارات مضافة لهذا المقياس حتى الآن.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {quizzes.map((quiz) => (
                <div
                  key={quiz.id}
                  className="p-5 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200/80 dark:border-stone-800 flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <span className="text-xs text-stone-500 font-medium">
                        المدة: {quiz.durationMinutes} دقيقة
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
                    <h4 className="text-base font-bold text-stone-900 dark:text-stone-100 mb-2">
                      {quiz.title}
                    </h4>
                    <p className="text-xs text-stone-600 dark:text-stone-400 mb-4">
                      {quiz.description}
                    </p>
                  </div>
                  <div className="pt-3 border-t border-stone-100 dark:border-stone-800 flex items-center justify-between">
                    <span className="text-xs text-stone-500">
                      {quiz.questions?.length || 0} أسئلة متنوعة
                    </span>
                    <button
                      onClick={() => {
                        if (quiz.isPremium && !isPremiumUser) {
                          openPremiumModal(`اختبار "${quiz.title}" مخصص لأعضاء باقة Premium.`);
                        } else {
                          navigateTo('quiz-play', { quizId: quiz.id });
                        }
                      }}
                      className="px-4 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white transition-colors"
                    >
                      بدء الاختبار 📝
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
