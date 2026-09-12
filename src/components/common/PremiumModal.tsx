import React from 'react';
import { useApp } from '../../context/AppContext';
import { Lock, Sparkles, Check, X, ArrowLeft } from 'lucide-react';

export function PremiumModal() {
  const { premiumModalOpen, setPremiumModalOpen, premiumModalReason, navigateTo } = useApp();

  if (!premiumModalOpen) return null;

  return (
    <div
      id="premium-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/70 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={() => setPremiumModalOpen(false)}
    >
      <div
        id="premium-modal-card"
        className="relative w-full max-w-lg bg-white dark:bg-stone-900 rounded-2xl shadow-2xl border border-amber-200 dark:border-amber-900/40 p-6 md:p-8 text-center overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Background glow accent */}
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-amber-400/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-emerald-400/20 rounded-full blur-3xl pointer-events-none" />

        {/* Close Button */}
        <button
          id="btn-close-premium-modal"
          onClick={() => setPremiumModalOpen(false)}
          className="absolute top-4 left-4 p-2 text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 rounded-full transition-colors"
          aria-label="إغلاق"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Badge & Lock Icon */}
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-tr from-amber-500 to-amber-300 text-stone-950 shadow-md mb-5 mx-auto">
          <Lock className="w-8 h-8" />
        </div>

        <span className="inline-block px-3 py-1 text-xs font-bold text-amber-700 dark:text-amber-300 bg-amber-100 dark:bg-amber-950/80 rounded-full mb-3">
          محتوى حصري للمشتركين
        </span>

        <h2 className="text-2xl md:text-3xl font-bold text-stone-900 dark:text-stone-100 mb-3 tracking-tight">
          هذا المحتوى متاح لأعضاء Premium
        </h2>

        <p className="text-stone-600 dark:text-stone-400 text-sm md:text-base leading-relaxed mb-6 max-w-md mx-auto">
          {premiumModalReason}
        </p>

        {/* Value Perks list */}
        <div className="bg-stone-50 dark:bg-stone-800/60 rounded-xl p-4 mb-6 text-right border border-stone-100 dark:border-stone-800 space-y-2.5">
          <div className="flex items-center gap-2.5 text-xs md:text-sm font-medium text-stone-700 dark:text-stone-200">
            <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <span>فتح جميع الدروس المعمقة والمذكرات النموذجية المحلولة</span>
          </div>
          <div className="flex items-center gap-2.5 text-xs md:text-sm font-medium text-stone-700 dark:text-stone-200">
            <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <span>تحميل غير محدود لكافة ملخصات وملفات PDF الرسمية</span>
          </div>
          <div className="flex items-center gap-2.5 text-xs md:text-sm font-medium text-stone-700 dark:text-stone-200">
            <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <span>حل جميع الاختبارات التفاعلية مع التصحيح الفوري والشرح المنهجي</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <button
            id="btn-modal-subscribe-now"
            onClick={() => {
              setPremiumModalOpen(false);
              navigateTo('subscription');
            }}
            className="w-full sm:flex-1 py-3.5 px-6 rounded-xl font-bold text-white bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-700 hover:to-amber-600 shadow-md shadow-amber-500/25 transition-all flex items-center justify-center gap-2"
          >
            <Sparkles className="w-4 h-4 text-amber-200" />
            <span>اشترك الآن (ابتداءً من 300 دج)</span>
            <ArrowLeft className="w-4 h-4" />
          </button>
          <button
            id="btn-modal-cancel"
            onClick={() => setPremiumModalOpen(false)}
            className="w-full sm:w-auto py-3.5 px-5 rounded-xl font-medium text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors text-sm"
          >
            لاحقاً
          </button>
        </div>
      </div>
    </div>
  );
}
