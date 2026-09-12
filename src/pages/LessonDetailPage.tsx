import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import type { Lesson } from '../types/index';
import { VideoPlayer } from '../components/common/VideoPlayer';
import { MediaUpload } from '../components/common/MediaUpload';
import {
  BookOpen,
  Clock,
  CheckCircle2,
  Heart,
  Share2,
  Sparkles,
  Lock,
  ArrowRight,
  CheckSquare,
  Bookmark,
  Sun,
  Moon,
  Type,
  ArrowLeft,
  AlertCircle,
  FileCheck,
  Edit3,
  X,
  Image as ImageIcon,
  Maximize2,
} from 'lucide-react';

export function LessonDetailPage() {
  const {
    navParams,
    navigateTo,
    currentUser,
    subjects,
    updateLesson,
    openPremiumModal,
    studentProgress,
    toggleLessonCompleted,
    toggleFavorite,
    fontScale,
    setFontScale,
    isDarkMode,
    toggleDarkMode,
    showToast,
  } = useApp();

  const lessonId = navParams.lessonId || 'lsn-kalima';
  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [loading, setLoading] = useState(true);
  const [isLocked, setIsLocked] = useState(false);
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);

  // Admin edit states
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editTitle, setEditTitle] = useState('');
  const [editSubjectId, setEditSubjectId] = useState('');
  const [editReadingTime, setEditReadingTime] = useState(10);
  const [editExcerpt, setEditExcerpt] = useState('');
  const [editQuickSummary, setEditQuickSummary] = useState('');
  const [editContent, setEditContent] = useState('');
  const [editIsPremium, setEditIsPremium] = useState(false);
  const [editImageUrl, setEditImageUrl] = useState('');
  const [editVideoUrl, setEditVideoUrl] = useState('');
  const [editVideoTitle, setEditVideoTitle] = useState('');
  const [editVideoDuration, setEditVideoDuration] = useState('');

  const handleOpenEdit = () => {
    if (!lesson) return;
    setEditTitle(lesson.title);
    setEditSubjectId(lesson.subjectId);
    setEditReadingTime(lesson.readingTimeMinutes || 10);
    setEditExcerpt(lesson.excerpt || '');
    setEditQuickSummary(lesson.quickSummary || lesson.summary || '');
    setEditContent(lesson.content || '');
    setEditIsPremium(lesson.isPremium);
    setEditImageUrl(lesson.imageUrl || '');
    setEditVideoUrl(lesson.videoUrl || '');
    setEditVideoTitle(lesson.videoTitle || '');
    setEditVideoDuration(lesson.videoDuration || '');
    setIsEditModalOpen(true);
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!lesson || !editTitle) return;
    const ok = await updateLesson(lesson.id, {
      title: editTitle,
      subjectId: editSubjectId,
      readingTimeMinutes: editReadingTime,
      excerpt: editExcerpt,
      quickSummary: editQuickSummary,
      summary: editQuickSummary,
      content: editContent,
      isPremium: editIsPremium,
      imageUrl: editImageUrl,
      videoUrl: editVideoUrl,
      videoTitle: editVideoTitle,
      videoDuration: editVideoDuration,
    });
    if (ok) {
      setLesson((prev) =>
        prev
          ? {
              ...prev,
              title: editTitle,
              subjectId: editSubjectId,
              readingTimeMinutes: editReadingTime,
              excerpt: editExcerpt,
              quickSummary: editQuickSummary,
              summary: editQuickSummary,
              content: editContent,
              isPremium: editIsPremium,
              imageUrl: editImageUrl,
              videoUrl: editVideoUrl,
              videoTitle: editVideoTitle,
              videoDuration: editVideoDuration,
            }
          : null
      );
      setIsEditModalOpen(false);
      showToast('تم حفظ وتحديث محتوى وميديا الدرس بنجاح! 💾', 'success');
    }
  };

  useEffect(() => {
    async function fetchLesson() {
      setLoading(true);
      try {
        const res = await fetch(`/api/lessons/${lessonId}`);
        const data = await res.json();
        if (res.ok) {
          setLesson(data.lesson);
          setIsLocked(data.isLockedForUser);
        } else {
          setLesson(null);
        }
      } catch (e) {
        console.error('Failed to load lesson:', e);
      } finally {
        setLoading(false);
      }
    }
    fetchLesson();
  }, [lessonId]);

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <div className="w-10 h-10 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-sm text-stone-500 font-medium">جاري تحميل محتوى الدرس الأكاديمي...</p>
      </div>
    );
  }

  if (!lesson) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <h2 className="text-xl font-bold text-stone-900 dark:text-stone-100">الدرس غير متوفر</h2>
        <button
          onClick={() => navigateTo('subjects')}
          className="mt-4 px-4 py-2 rounded-lg bg-emerald-600 text-white font-bold text-sm"
        >
          العودة للمقاييس
        </button>
      </div>
    );
  }

  const isCompleted = studentProgress.completedLessons.includes(lesson.id);
  const isFav = studentProgress.favoriteLessons.includes(lesson.id);

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      showToast('تم نسخ رابط الدرس للمشاركة 📋', 'success');
    } else {
      showToast('الرابط جاهز للمشاركة', 'info');
    }
  };

  const getFontSizeClass = () => {
    if (fontScale === 'large') return 'text-lg leading-relaxed';
    if (fontScale === 'xlarge') return 'text-xl leading-loose';
    return 'text-base leading-relaxed';
  };

  // Locked State for Free Users trying to read a Premium Lesson
  if (isLocked) {
    return (
      <div id="lesson-locked-view" className="max-w-3xl mx-auto px-4 py-12">
        <button
          onClick={() => navigateTo('subject-detail', { subjectId: lesson.subjectId })}
          className="mb-6 inline-flex items-center gap-2 text-xs font-bold text-stone-500 hover:text-stone-800 dark:hover:text-stone-200"
        >
          <ArrowRight className="w-4 h-4" />
          <span>العودة إلى فهرس المقياس</span>
        </button>

        <div className="bg-white dark:bg-stone-900 rounded-3xl border border-amber-300 dark:border-amber-900/50 p-8 md:p-12 text-center shadow-xl relative overflow-hidden">
          <div className="w-16 h-16 rounded-2xl bg-amber-100 dark:bg-amber-950 text-amber-600 dark:text-amber-400 flex items-center justify-center mx-auto mb-5">
            <Lock className="w-8 h-8" />
          </div>

          <span className="inline-block px-3 py-1 rounded-full text-xs font-bold bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 mb-3">
            محتوى حصري لمشتركي Premium
          </span>

          <h2 className="text-2xl md:text-3xl font-black text-stone-900 dark:text-stone-100 mb-3">
            هذا الدرس متاح لأعضاء Premium
          </h2>

          <p className="text-sm md:text-base text-stone-600 dark:text-stone-400 max-w-lg mx-auto leading-relaxed mb-8">
            درس <span className="font-bold text-stone-800 dark:text-stone-200">"{lesson.title}"</span> يحتوي على شروحات مفصلة، أمثلة إعرابية، وجداول تطبيقية ومذكرات بيداغوجية حصرية للمشتركين.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 max-w-md mx-auto">
            <button
              onClick={() => openPremiumModal(`اشترك لتفتح درس "${lesson.title}" وكافة المحتويات الحصرية.`)}
              className="w-full sm:flex-1 py-3.5 px-6 rounded-xl font-bold text-white bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-700 hover:to-amber-600 shadow-md shadow-amber-500/25 transition-all text-sm flex items-center justify-center gap-2"
            >
              <Sparkles className="w-4 h-4 text-amber-200" />
              <span>اشترك الآن (من 300 دج)</span>
            </button>
            <button
              onClick={() => navigateTo('subject-detail', { subjectId: lesson.subjectId })}
              className="w-full sm:w-auto py-3.5 px-6 rounded-xl font-medium text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors text-sm"
            >
              تصفح الدروس المجانية
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div id="lesson-detail-page" className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Top Toolbar / Reader Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-800 shadow-sm">
        <button
          id="btn-back-to-subject"
          onClick={() => navigateTo('subject-detail', { subjectId: lesson.subjectId })}
          className="flex items-center gap-1 text-xs font-bold text-stone-600 dark:text-stone-300 hover:text-emerald-600 transition-colors"
        >
          <ArrowRight className="w-4 h-4" />
          <span>العودة للمقياس</span>
        </button>

        {/* Reader Helpers (Font size & Dark mode) */}
        <div className="flex items-center gap-2">
          <div className="flex items-center bg-stone-100 dark:bg-stone-800 rounded-xl p-1 gap-1 text-xs">
            <span className="text-stone-400 text-[10px] px-1.5 font-bold">الخط:</span>
            <button
              onClick={() => setFontScale('normal')}
              className={`px-2 py-1 rounded-lg font-bold transition-colors ${
                fontScale === 'normal' ? 'bg-white dark:bg-stone-700 text-emerald-600 shadow-xs' : 'text-stone-600'
              }`}
            >
              عادي
            </button>
            <button
              onClick={() => setFontScale('large')}
              className={`px-2 py-1 rounded-lg font-bold transition-colors ${
                fontScale === 'large' ? 'bg-white dark:bg-stone-700 text-emerald-600 shadow-xs' : 'text-stone-600'
              }`}
            >
              كبير
            </button>
            <button
              onClick={() => setFontScale('xlarge')}
              className={`px-2 py-1 rounded-lg font-bold transition-colors ${
                fontScale === 'xlarge' ? 'bg-white dark:bg-stone-700 text-emerald-600 shadow-xs' : 'text-stone-600'
              }`}
            >
              أكبر
            </button>
          </div>

          <button
            onClick={toggleDarkMode}
            className="p-2 text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 rounded-xl transition-colors"
            title="تبديل الوضع الليلي"
          >
            {isDarkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Lesson Header Card */}
      <div className="p-6 md:p-8 bg-white dark:bg-stone-900 rounded-3xl border border-stone-200/80 dark:border-stone-800 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300">
              الدرس #{lesson.order}
            </span>
            <span className="flex items-center gap-1 text-xs text-stone-500 dark:text-stone-400">
              <Clock className="w-3.5 h-3.5" />
              <span>{lesson.readingTimeMinutes} دقائق قراءة</span>
            </span>
          </div>

          {lesson.isPremium ? (
            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-800">
              <Lock className="w-3 h-3" /> متاح بعضوية Premium
            </span>
          ) : (
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300">
              درس مجاني Free
            </span>
          )}
        </div>

        <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-stone-900 dark:text-stone-100 tracking-tight mb-4">
          {lesson.title}
        </h1>

        <p className="text-sm md:text-base text-stone-600 dark:text-stone-400 leading-relaxed pb-4 border-b border-stone-100 dark:border-stone-800">
          {lesson.excerpt}
        </p>

        {/* Quick Actions Row */}
        <div className="pt-4 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <button
              id="btn-toggle-complete-lesson"
              onClick={() => toggleLessonCompleted(lesson.id)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-xs ${
                isCompleted
                  ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                  : 'bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 hover:bg-emerald-50 dark:hover:bg-emerald-950/50'
              }`}
            >
              <CheckCircle2 className={`w-4 h-4 ${isCompleted ? 'text-white' : 'text-stone-400'}`} />
              <span>{isCompleted ? 'تمت دراسة هذا الدرس بنجاح' : 'تعليم الدرس كمكتمل'}</span>
            </button>

            <button
              id="btn-toggle-favorite-lesson"
              onClick={() => toggleFavorite('lesson', lesson.id)}
              className={`p-2 rounded-xl border transition-colors ${
                isFav
                  ? 'bg-rose-50 dark:bg-rose-950/60 border-rose-300 dark:border-rose-900 text-rose-600'
                  : 'border-stone-200 dark:border-stone-800 text-stone-400 hover:text-rose-500'
              }`}
              title={isFav ? 'إزالة من المفضلة' : 'إضافة للمفضلة'}
            >
              <Heart className={`w-4 h-4 ${isFav ? 'fill-rose-500 text-rose-500' : ''}`} />
            </button>

            <button
              id="btn-share-lesson"
              onClick={handleShare}
              className="p-2 rounded-xl border border-stone-200 dark:border-stone-800 text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
              title="مشاركة رابط الدرس"
            >
              <Share2 className="w-4 h-4" />
            </button>

            {currentUser.role === 'admin' && (
              <button
                id="btn-admin-edit-lesson"
                onClick={handleOpenEdit}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-600 text-white transition-colors shadow-xs"
                title="تعديل محتوى هذا الدرس كمسؤول"
              >
                <Edit3 className="w-4 h-4" />
                <span>تعديل محتوى الدرس</span>
              </button>
            )}
          </div>

          <button
            id="btn-test-myself-lesson"
            onClick={() => navigateTo('quizzes')}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/50 hover:bg-emerald-100 transition-colors"
          >
            <CheckSquare className="w-4 h-4 text-emerald-600" />
            <span>اختبر معلوماتك في الدرس</span>
          </button>
        </div>
      </div>

      {/* Lesson Media Banner & Video (if available) */}
      {(lesson.imageUrl || lesson.videoUrl) && (
        <div className="space-y-4">
          {lesson.imageUrl && (
            <div className="relative rounded-3xl overflow-hidden border border-stone-200/80 dark:border-stone-800 bg-stone-900 shadow-sm group">
              <img
                src={lesson.imageUrl}
                alt={lesson.title}
                className="w-full max-h-[440px] object-cover object-center group-hover:scale-[1.01] transition-transform duration-300 cursor-pointer"
                onClick={() => setIsImageModalOpen(true)}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent pointer-events-none" />
              <div className="absolute bottom-4 right-4 left-4 flex items-center justify-between text-white text-xs">
                <div className="flex items-center gap-2 bg-black/50 backdrop-blur-md px-3.5 py-1.5 rounded-xl border border-white/10">
                  <ImageIcon className="w-4 h-4 text-emerald-400" />
                  <span className="font-bold">المخطط التوضيحي للدرس</span>
                </div>
                <button
                  onClick={() => setIsImageModalOpen(true)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/20 hover:bg-white/30 backdrop-blur-md text-white font-bold transition-colors"
                >
                  <Maximize2 className="w-3.5 h-3.5" />
                  <span>تكبير الصورة</span>
                </button>
              </div>
            </div>
          )}

          {lesson.videoUrl && (
            <VideoPlayer
              url={lesson.videoUrl}
              title={lesson.videoTitle || `المحاضرة المرئية: ${lesson.title}`}
              duration={lesson.videoDuration}
            />
          )}
        </div>
      )}

      {/* Image Zoom Modal */}
      {isImageModalOpen && lesson.imageUrl && (
        <div
          onClick={() => setIsImageModalOpen(false)}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative max-w-5xl w-full bg-stone-900 rounded-3xl overflow-hidden shadow-2xl border border-stone-800"
          >
            <div className="flex items-center justify-between p-4 border-b border-stone-800 text-white">
              <div className="flex items-center gap-2">
                <ImageIcon className="w-5 h-5 text-emerald-400" />
                <span className="font-bold text-sm">{lesson.title} - صورة توضيحية</span>
              </div>
              <button
                onClick={() => setIsImageModalOpen(false)}
                className="p-1.5 text-stone-400 hover:text-white rounded-xl hover:bg-stone-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4 flex items-center justify-center bg-black/40 max-h-[80vh] overflow-auto">
              <img
                src={lesson.imageUrl}
                alt={lesson.title}
                className="max-h-[75vh] w-auto object-contain rounded-xl"
              />
            </div>
          </div>
        </div>
      )}

      {/* Lesson Body Content */}
      <article
        id="lesson-content-body"
        className={`bg-white dark:bg-stone-900 rounded-3xl border border-stone-200/80 dark:border-stone-800 p-6 sm:p-10 shadow-sm text-stone-800 dark:text-stone-200 ${getFontSizeClass()}`}
      >
        <div className="space-y-6">
          {/* Format paragraphs, subheadings, lists, and examples */}
          {lesson.content.split('\n\n').map((block, idx) => {
            if (block.startsWith('### ')) {
              return (
                <h3
                  key={idx}
                  className="text-xl sm:text-2xl font-extrabold text-stone-900 dark:text-stone-100 pt-4 pb-1 border-b border-stone-100 dark:border-stone-800 flex items-center gap-2"
                >
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shrink-0" />
                  <span>{block.replace('### ', '')}</span>
                </h3>
              );
            }
            if (block.startsWith('## ')) {
              return (
                <h2
                  key={idx}
                  className="text-2xl sm:text-3xl font-black text-emerald-800 dark:text-emerald-300 pt-6 pb-2"
                >
                  {block.replace('## ', '')}
                </h2>
              );
            }
            if (block.startsWith('* ') || block.startsWith('- ')) {
              const items = block.split('\n');
              return (
                <ul key={idx} className="space-y-2 pr-6 list-disc text-stone-700 dark:text-stone-300">
                  {items.map((it, i) => (
                    <li key={i}>{it.replace(/^[*|-]\s+/, '')}</li>
                  ))}
                </ul>
              );
            }
            if (block.startsWith('> ')) {
              return (
                <blockquote
                  key={idx}
                  className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 border-r-4 border-emerald-600 text-emerald-900 dark:text-emerald-200 font-medium text-sm"
                >
                  {block.replace(/^>\s+/, '')}
                </blockquote>
              );
            }
            return (
              <p key={idx} className="leading-relaxed">
                {block}
              </p>
            );
          })}
        </div>
      </article>

      {/* Quick Summary Card at the bottom of the lesson */}
      <div className="p-6 md:p-8 rounded-3xl bg-gradient-to-tr from-stone-50 to-emerald-50/50 dark:from-stone-900 dark:to-emerald-950/20 border border-emerald-200 dark:border-emerald-900/60 shadow-sm">
        <div className="flex items-center gap-2 font-black text-lg text-emerald-800 dark:text-emerald-300 mb-3">
          <FileCheck className="w-5 h-5 text-emerald-600" />
          <span>الخلاصة المركزة للدرس</span>
        </div>
        <p className="text-xs md:text-sm text-stone-700 dark:text-stone-300 leading-relaxed mb-6">
          {lesson.summary}
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-emerald-200/60 dark:border-emerald-900/40">
          <button
            onClick={() => toggleLessonCompleted(lesson.id)}
            className="w-full sm:w-auto px-6 py-3 rounded-xl font-bold text-xs bg-emerald-600 hover:bg-emerald-700 text-white transition-colors flex items-center justify-center gap-2"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>{isCompleted ? 'الدرس مسجل كمكتمل' : 'إنهاء الدرس وتأكيد الفهم ✓'}</span>
          </button>

          <button
            onClick={() => navigateTo('quizzes')}
            className="w-full sm:w-auto px-6 py-3 rounded-xl font-bold text-xs bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-800 dark:text-stone-200 hover:bg-stone-50 transition-colors flex items-center justify-center gap-2"
          >
            <span>الانتقال لبنك الاختبارات</span>
            <ArrowLeft className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Admin Edit Lesson Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white dark:bg-stone-900 rounded-3xl border border-stone-200 dark:border-stone-800 p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl space-y-4 text-right">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100 dark:border-stone-800 sticky top-0 bg-white dark:bg-stone-900 z-10">
              <div>
                <h3 className="text-base font-bold text-stone-900 dark:text-stone-100 flex items-center gap-2">
                  <Edit3 className="w-5 h-5 text-emerald-600" />
                  <span>تعديل محتوى هذا الدرس</span>
                </h3>
                <p className="text-xs text-stone-500 mt-0.5">
                  تعديل العنوان، المقياس، التلخيص السريع، والمحتوى الكامل للدرس.
                </p>
              </div>
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="p-1.5 text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 rounded-xl hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold mb-1">المقياس التابع له:</label>
                  <select
                    value={editSubjectId}
                    onChange={(e) => setEditSubjectId(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 font-medium"
                  >
                    {subjects.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.title}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold mb-1">عنوان الدرس الأكاديمي:</label>
                  <input
                    type="text"
                    required
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
                <div>
                  <label className="block font-bold mb-1">وقت القراءة (بالدقائق):</label>
                  <input
                    type="number"
                    min="1"
                    max="120"
                    value={editReadingTime}
                    onChange={(e) => setEditReadingTime(Number(e.target.value))}
                    className="w-full p-2.5 rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800"
                  />
                </div>

                <div className="pt-4">
                  <label className="flex items-center gap-2 font-bold cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={editIsPremium}
                      onChange={(e) => setEditIsPremium(e.target.checked)}
                      className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500"
                    />
                    <span className="text-stone-800 dark:text-stone-200">
                      محتوى مدفوع (خاص بـ Premium 🔒)
                    </span>
                  </label>
                </div>
              </div>

              <div>
                <label className="block font-bold mb-1">المقتطف الموجز (Excerpt):</label>
                <textarea
                  rows={2}
                  value={editExcerpt}
                  onChange={(e) => setEditExcerpt(e.target.value)}
                  placeholder="نبذة موجزة تظهر في بطاقة الدرس..."
                  className="w-full p-2.5 rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800"
                />
              </div>

              <div>
                <label className="block font-bold mb-1">التلخيص السريع (Quick Summary):</label>
                <textarea
                  rows={2}
                  value={editQuickSummary}
                  onChange={(e) => setEditQuickSummary(e.target.value)}
                  placeholder="خلاصة موجزة في سطرين..."
                  className="w-full p-2.5 rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block font-bold">محتوى وشروحات الدرس الكاملة:</label>
                  <span className="text-[10px] text-stone-400">
                    يدعم العناوين (## و ###)، القوائم (*)، والاقتباسات (&gt;)
                  </span>
                </div>
                <textarea
                  rows={8}
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  placeholder="اكتب هنا محتوى الدرس الكامل والشروحات..."
                  className="w-full p-3 rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 font-mono text-xs leading-relaxed"
                />
              </div>

              {/* Media Upload Section for Lesson Edit */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 rounded-2xl bg-stone-50/80 dark:bg-stone-800/50 border border-stone-200/80 dark:border-stone-700/80">
                <MediaUpload
                  label="صورة توضيحية أو غلاف للدرس"
                  type="image"
                  category="lessons"
                  value={editImageUrl}
                  onChange={setEditImageUrl}
                  helperText="ارفع صورة توضيحية، مخططاً ذهنياً، أو صورة تعبيرية للدرس"
                />

                <div className="space-y-3">
                  <MediaUpload
                    label="فيديو الدرس أو المحاضرة المرئية"
                    type="video"
                    category="videos"
                    value={editVideoUrl}
                    onChange={setEditVideoUrl}
                    helperText="ارفع ملف فيديو MP4 أو ضع رابط يوتيوب / فيميو مباشر"
                  />
                  {editVideoUrl && (
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="text"
                        placeholder="عنوان الفيديو (اختياري)"
                        value={editVideoTitle}
                        onChange={(e) => setEditVideoTitle(e.target.value)}
                        className="p-2 rounded-lg border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-900 text-[11px]"
                      />
                      <input
                        type="text"
                        placeholder="المدة (مثال: 12:45)"
                        value={editVideoDuration}
                        onChange={(e) => setEditVideoDuration(e.target.value)}
                        className="p-2 rounded-lg border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-900 text-[11px]"
                      />
                    </div>
                  )}
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-stone-100 dark:border-stone-800">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-stone-200 dark:border-stone-700 text-stone-600 dark:text-stone-300 font-bold hover:bg-stone-50 dark:hover:bg-stone-800 transition-colors"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold transition-colors shadow-xs"
                >
                  حفظ وتحديث الدرس
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
