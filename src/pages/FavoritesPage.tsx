import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import type { Lesson, Summary } from '../types/index';
import { Heart, BookOpen, FileText, ArrowLeft, Trash2 } from 'lucide-react';

export function FavoritesPage() {
  const { studentProgress, toggleFavorite, navigateTo } = useApp();
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [summaries, setSummaries] = useState<Summary[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const [lRes, sRes] = await Promise.all([fetch('/api/lessons'), fetch('/api/summaries')]);
        if (lRes.ok) {
          const lData: Lesson[] = await lRes.json();
          setLessons(lData.filter((l) => studentProgress.favoriteLessons.includes(l.id)));
        }
        if (sRes.ok) {
          const sData: Summary[] = await sRes.json();
          setSummaries(sData.filter((s) => studentProgress.favoriteSummaries.includes(s.id)));
        }
      } catch (e) {
        console.error('Failed to load favorites:', e);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [studentProgress.favoriteLessons, studentProgress.favoriteSummaries]);

  const isEmpty = lessons.length === 0 && summaries.length === 0;

  return (
    <div id="favorites-page" className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div className="border-b border-stone-200 dark:border-stone-800 pb-6">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300 mb-2">
          <Heart className="w-3.5 h-3.5 fill-rose-600 text-rose-600" />
          <span>محتواك المحفوظ</span>
        </div>
        <h1 className="text-2xl sm:text-4xl font-extrabold text-stone-900 dark:text-stone-100 tracking-tight">
          الدروس والملخصات المفضلة
        </h1>
        <p className="text-xs sm:text-sm text-stone-600 dark:text-stone-400 mt-1">
          كل ما قمت بتمييزه بنجمة أو قلب للمراجعة السريعة أثناء فترة الامتحانات.
        </p>
      </div>

      {loading ? (
        <div className="py-16 text-center">
          <div className="w-8 h-8 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
          <p className="text-xs text-stone-500">جاري تحميل المفضلة...</p>
        </div>
      ) : isEmpty ? (
        <div className="text-center py-16 bg-white dark:bg-stone-900 rounded-3xl border border-stone-200 dark:border-stone-800 p-8">
          <Heart className="w-12 h-12 text-stone-300 dark:text-stone-700 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-stone-800 dark:text-stone-200">
            قائمة المفضلة فارغة حالياً
          </h3>
          <p className="text-xs text-stone-500 max-w-sm mx-auto mt-1 mb-6">
            أثناء قراءة أي درس أو ملخص، انقر على أيقونة القلب ❤️ لحفظه هنا والوصول إليه بسرعة.
          </p>
          <button
            onClick={() => navigateTo('subjects')}
            className="px-6 py-2.5 rounded-xl font-bold text-xs bg-emerald-600 hover:bg-emerald-700 text-white transition-colors"
          >
            تصفح المقاييس والدروس
          </button>
        </div>
      ) : (
        <div className="space-y-8">
          {/* Favorite Lessons */}
          {lessons.length > 0 && (
            <div className="space-y-4">
              <h2 className="text-base sm:text-lg font-bold text-stone-900 dark:text-stone-100 flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-emerald-600" />
                <span>الدروس المحفوظة ({lessons.length})</span>
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {lessons.map((lesson) => (
                  <div
                    key={lesson.id}
                    className="p-5 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200/80 dark:border-stone-800 shadow-sm flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between text-xs mb-2">
                        <span className="font-bold text-emerald-600">درس #{lesson.order}</span>
                        <button
                          onClick={() => toggleFavorite('lesson', lesson.id)}
                          className="text-stone-400 hover:text-rose-500 p-1"
                          title="إزالة من المفضلة"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                      <h3 className="text-base font-bold text-stone-900 dark:text-stone-100 mb-2">
                        {lesson.title}
                      </h3>
                      <p className="text-xs text-stone-600 dark:text-stone-400 line-clamp-2 mb-4">
                        {lesson.excerpt}
                      </p>
                    </div>

                    <div className="pt-3 border-t border-stone-100 dark:border-stone-800 flex justify-end">
                      <button
                        onClick={() => navigateTo('lesson-detail', { lessonId: lesson.id })}
                        className="px-4 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white transition-colors flex items-center gap-1"
                      >
                        <span>قراءة الدرس</span>
                        <ArrowLeft className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Favorite Summaries */}
          {summaries.length > 0 && (
            <div className="space-y-4">
              <h2 className="text-base sm:text-lg font-bold text-stone-900 dark:text-stone-100 flex items-center gap-2">
                <FileText className="w-5 h-5 text-teal-600" />
                <span>الملخصات المحفوظة ({summaries.length})</span>
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {summaries.map((sum) => (
                  <div
                    key={sum.id}
                    className="p-5 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200/80 dark:border-stone-800 shadow-sm flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between text-xs mb-2">
                        <span className="font-bold text-teal-600">ملخص مركز</span>
                        <button
                          onClick={() => toggleFavorite('summary', sum.id)}
                          className="text-stone-400 hover:text-rose-500 p-1"
                          title="إزالة من المفضلة"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                      <h3 className="text-base font-bold text-stone-900 dark:text-stone-100 mb-2">
                        {sum.title}
                      </h3>
                      <p className="text-xs text-stone-600 dark:text-stone-400 line-clamp-2 mb-4">
                        {sum.excerpt}
                      </p>
                    </div>

                    <div className="pt-3 border-t border-stone-100 dark:border-stone-800 flex justify-end">
                      <button
                        onClick={() => navigateTo('summaries')}
                        className="px-4 py-2 rounded-xl text-xs font-bold bg-teal-600 hover:bg-teal-700 text-white transition-colors flex items-center gap-1"
                      >
                        <span>عرض في صفحة الملخصات</span>
                        <ArrowLeft className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
