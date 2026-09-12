import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import type { Subject, Lesson, Summary, Quiz } from '../types/index';
import { Search, X, BookOpen, FileText, CheckSquare, ArrowLeft } from 'lucide-react';

export function SearchModal() {
  const { navigateTo, currentView } = useApp();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<{
    subjects: Subject[];
    lessons: Lesson[];
    summaries: Summary[];
    quizzes: Quiz[];
  }>({
    subjects: [],
    lessons: [],
    summaries: [],
    quizzes: [],
  });
  const [searching, setSearching] = useState(false);

  useEffect(() => {
    if (!query.trim()) {
      setResults({ subjects: [], lessons: [], summaries: [], quizzes: [] });
      return;
    }

    const timer = setTimeout(async () => {
      setSearching(true);
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
        if (res.ok) {
          const data = await res.json();
          setResults(data);
        }
      } catch (e) {
        console.error('Search failed:', e);
      } finally {
        setSearching(false);
      }
    }, 200);

    return () => clearTimeout(timer);
  }, [query]);

  const totalFound =
    results.subjects.length + results.lessons.length + results.summaries.length + results.quizzes.length;

  return (
    <div id="search-page-view" className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-6">
      {/* Header & Back */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-extrabold text-stone-900 dark:text-stone-100">
          البحث الشامل في المنصة
        </h1>
        <button
          onClick={() => navigateTo('home')}
          className="text-xs font-bold text-stone-500 hover:text-stone-800 dark:hover:text-stone-200"
        >
          العودة للرئيسية ✕
        </button>
      </div>

      {/* Big Search Input */}
      <div className="relative">
        <input
          type="text"
          autoFocus
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="ابحث عن درس، مقياس، ملخص، قاعدة نحوية، أو اختبار..."
          className="w-full pl-4 pr-12 py-4 rounded-2xl bg-white dark:bg-stone-900 border-2 border-emerald-500/40 text-base text-stone-900 dark:text-stone-100 placeholder-stone-400 focus:outline-none focus:border-emerald-600 shadow-sm"
        />
        <Search className="w-5 h-5 text-emerald-600 absolute right-4 top-4 pointer-events-none" />
        {query && (
          <button
            onClick={() => setQuery('')}
            className="absolute left-4 top-4 text-stone-400 hover:text-stone-600"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {searching && (
        <p className="text-xs text-stone-400 text-center">جاري البحث في كافة المحتويات...</p>
      )}

      {/* Results view */}
      {query.trim() && !searching && totalFound === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-800 p-8">
          <p className="text-stone-500 text-sm font-bold">لا توجد نتائج مطابقة لـ "{query}"</p>
          <p className="text-xs text-stone-400 mt-1">جرب البحث بكلمات مفتاحية أخرى (مثل: النحو، المبتدأ، التقويم، بياجي).</p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Subjects */}
          {results.subjects.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-xs font-bold text-stone-400 uppercase tracking-wider">المقاييس المطابقة:</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {results.subjects.map((s) => (
                  <div
                    key={s.id}
                    onClick={() => navigateTo('subject-detail', { subjectId: s.id })}
                    className="p-4 rounded-xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 hover:border-emerald-500 cursor-pointer flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
                        <BookOpen className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="font-bold text-sm text-stone-900 dark:text-stone-100">{s.title}</h4>
                        <span className="text-[11px] text-stone-400">{s.code}</span>
                      </div>
                    </div>
                    <ArrowLeft className="w-4 h-4 text-stone-400" />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Lessons */}
          {results.lessons.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-xs font-bold text-stone-400 uppercase tracking-wider">الدروس المطابقة:</h3>
              <div className="space-y-2">
                {results.lessons.map((l) => (
                  <div
                    key={l.id}
                    onClick={() => navigateTo('lesson-detail', { lessonId: l.id, subjectId: l.subjectId })}
                    className="p-4 rounded-xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 hover:border-emerald-500 cursor-pointer flex items-center justify-between"
                  >
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="px-2 py-0.5 rounded text-[10px] bg-stone-100 dark:bg-stone-800 font-bold text-stone-600 dark:text-stone-300">
                          درس #{l.order}
                        </span>
                        {l.isPremium && (
                          <span className="px-2 py-0.5 rounded text-[10px] bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 font-bold">
                            Premium 🔒
                          </span>
                        )}
                      </div>
                      <h4 className="font-bold text-sm text-stone-900 dark:text-stone-100">{l.title}</h4>
                      <p className="text-xs text-stone-500 line-clamp-1 mt-0.5">{l.excerpt}</p>
                    </div>
                    <ArrowLeft className="w-4 h-4 text-stone-400 shrink-0 mr-3" />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Summaries */}
          {results.summaries.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-xs font-bold text-stone-400 uppercase tracking-wider">الملخصات المطابقة:</h3>
              <div className="space-y-2">
                {results.summaries.map((s) => (
                  <div
                    key={s.id}
                    onClick={() => navigateTo('summaries')}
                    className="p-4 rounded-xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 hover:border-teal-500 cursor-pointer flex items-center justify-between"
                  >
                    <div>
                      <h4 className="font-bold text-sm text-stone-900 dark:text-stone-100">{s.title}</h4>
                      <p className="text-xs text-stone-500 line-clamp-1 mt-0.5">{s.excerpt}</p>
                    </div>
                    <ArrowLeft className="w-4 h-4 text-stone-400 shrink-0 mr-3" />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Quizzes */}
          {results.quizzes.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-xs font-bold text-stone-400 uppercase tracking-wider">الاختبارات المطابقة:</h3>
              <div className="space-y-2">
                {results.quizzes.map((q) => (
                  <div
                    key={q.id}
                    onClick={() => navigateTo('quiz-play', { quizId: q.id })}
                    className="p-4 rounded-xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 hover:border-emerald-500 cursor-pointer flex items-center justify-between"
                  >
                    <div>
                      <h4 className="font-bold text-sm text-stone-900 dark:text-stone-100">{q.title}</h4>
                      <p className="text-xs text-stone-500 line-clamp-1 mt-0.5">{q.description}</p>
                    </div>
                    <ArrowLeft className="w-4 h-4 text-stone-400 shrink-0 mr-3" />
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
