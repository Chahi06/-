import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  BookOpen,
  Search,
  FileText,
  CheckSquare,
  ArrowLeft,
  Plus,
  Layers,
  GraduationCap,
} from 'lucide-react';

export function SubjectsPage() {
  const { subjects, navigateTo, currentUser, selectedLevel } = useApp();
  const [searchQuery, setSearchQuery] = useState('');

  const filteredSubjects = subjects.filter((s) => {
    const matchesSearch =
      s.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.code.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  return (
    <div id="subjects-page" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-stone-200 dark:border-stone-800 pb-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 mb-2">
            <GraduationCap className="w-4 h-4" />
            <span>{selectedLevel}</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold text-stone-900 dark:text-stone-100 tracking-tight">
            المقاييس الدراسية
          </h1>
          <p className="text-xs sm:text-sm text-stone-600 dark:text-stone-400 mt-1">
            اختر المقياس للوصول إلى الدروس الكاملة، المذكرات، الملخصات وملفات PDF والاختبارات التفاعلية.
          </p>
        </div>

        {currentUser.role === 'admin' && (
          <button
            onClick={() => navigateTo('admin', { tab: 'subjects' })}
            className="self-start md:self-auto flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>إضافة وتعديل المقاييس (Admin)</span>
          </button>
        )}
      </div>

      {/* Search & Filter bar */}
      <div className="relative max-w-md">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="ابحث عن مقياس (مثال: النحو، الصرف، التربية...)"
          className="w-full pl-4 pr-10 py-3 rounded-xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 text-sm text-stone-900 dark:text-stone-100 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-colors"
        />
        <Search className="w-4 h-4 text-stone-400 absolute right-3.5 top-3.5 pointer-events-none" />
      </div>

      {/* Subjects Grid */}
      {filteredSubjects.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-800 p-8">
          <BookOpen className="w-12 h-12 text-stone-400 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-stone-800 dark:text-stone-200">لم يتم العثور على مقياس</h3>
          <p className="text-xs text-stone-500 dark:text-stone-400 mt-1">
            جرب كتابة مصطلح بحث آخر أو تحقق من صحة الكلمة.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredSubjects.map((subj) => (
            <div
              key={subj.id}
              id={`subject-card-${subj.id}`}
              onClick={() => navigateTo('subject-detail', { subjectId: subj.id })}
              className="group cursor-pointer bg-white dark:bg-stone-900 rounded-2xl border border-stone-200/80 dark:border-stone-800 p-6 shadow-sm hover:shadow-md hover:border-emerald-500/50 dark:hover:border-emerald-500/50 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-3 mb-4">
                  <div className="w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-950/70 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
                    <BookOpen className="w-6 h-6" />
                  </div>
                  <span className="text-xs font-mono px-2 py-0.5 rounded bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400">
                    {subj.code}
                  </span>
                </div>

                <h3 className="text-xl font-bold text-stone-900 dark:text-stone-100 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors mb-2">
                  {subj.title}
                </h3>
                <p className="text-xs md:text-sm text-stone-600 dark:text-stone-400 leading-relaxed line-clamp-3 mb-6">
                  {subj.description}
                </p>
              </div>

              <div>
                {/* Stats row */}
                <div className="grid grid-cols-3 gap-2 py-3 px-3 rounded-xl bg-stone-50 dark:bg-stone-800/40 text-center text-xs mb-4 border border-stone-100 dark:border-stone-800/60">
                  <div>
                    <span className="block font-bold text-stone-900 dark:text-stone-100 text-sm">
                      {subj.lessonsCount}
                    </span>
                    <span className="text-[11px] text-stone-500">دروس</span>
                  </div>
                  <div className="border-r border-stone-200 dark:border-stone-700">
                    <span className="block font-bold text-stone-900 dark:text-stone-100 text-sm">
                      {subj.summariesCount}
                    </span>
                    <span className="text-[11px] text-stone-500">ملخصات</span>
                  </div>
                  <div className="border-r border-stone-200 dark:border-stone-700">
                    <span className="block font-bold text-stone-900 dark:text-stone-100 text-sm">
                      {subj.quizzesCount}
                    </span>
                    <span className="text-[11px] text-stone-500">اختبارات</span>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs font-bold text-emerald-600 dark:text-emerald-400 pt-1">
                  <span>فتح محتوى المقياس</span>
                  <span className="group-hover:translate-x-1 transition-transform">←</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
