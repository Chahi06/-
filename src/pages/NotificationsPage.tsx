import React from 'react';
import { useApp } from '../context/AppContext';
import { Bell, Check, ArrowRight, BookOpen, Crown, Info } from 'lucide-react';

export function NotificationsPage() {
  const { notifications, markNotificationsAsRead, navigateTo } = useApp();

  return (
    <div id="notifications-page" className="max-w-3xl mx-auto px-4 sm:px-6 py-8 space-y-6">
      <div className="flex items-center justify-between border-b border-stone-200 dark:border-stone-800 pb-4">
        <div>
          <h1 className="text-2xl font-black text-stone-900 dark:text-stone-100">
            الإشعارات والتحديثات الأكاديمية
          </h1>
          <p className="text-xs text-stone-500 mt-0.5">
            آخر المستجدات حول المقاييس، الدروس الجديدة، والاختبارات المضافة.
          </p>
        </div>

        <button
          onClick={markNotificationsAsRead}
          className="flex items-center gap-1 text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline"
        >
          <Check className="w-4 h-4" />
          <span>تحديد الكل كمقروء</span>
        </button>
      </div>

      <div className="space-y-3">
        {notifications.map((notif) => (
          <div
            key={notif.id}
            onClick={() => {
              if (notif.link) {
                if (notif.link.startsWith('/subjects/')) {
                  navigateTo('subject-detail', { subjectId: notif.link.split('/')[2] });
                } else if (notif.link.startsWith('/quizzes/')) {
                  navigateTo('quiz-play', { quizId: notif.link.split('/')[2] });
                } else {
                  navigateTo('subjects');
                }
              }
            }}
            className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-start gap-4 ${
              !notif.isRead
                ? 'bg-emerald-50/40 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-900/60'
                : 'bg-white dark:bg-stone-900 border-stone-200/80 dark:border-stone-800'
            }`}
          >
            <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
              <Bell className="w-5 h-5" />
            </div>

            <div className="flex-1 text-right">
              <div className="flex items-center justify-between gap-2 mb-1">
                <h3 className="font-bold text-sm text-stone-900 dark:text-stone-100">{notif.title}</h3>
                <span className="text-[11px] text-stone-400">{notif.date}</span>
              </div>
              <p className="text-xs text-stone-600 dark:text-stone-400 leading-relaxed">{notif.message}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
