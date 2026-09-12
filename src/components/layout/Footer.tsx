import React from 'react';
import { useApp } from '../../context/AppContext';
import { GraduationCap, ShieldCheck, Mail, Heart, Crown, BookOpen } from 'lucide-react';

export function Footer() {
  const { platformSettings, navigateTo, currentUser } = useApp();

  return (
    <footer
      id="main-footer"
      className="border-t border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900/80 text-stone-600 dark:text-stone-400 py-12 px-4 sm:px-6 lg:px-8 mb-16 md:mb-0 transition-colors"
    >
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8 mb-10">
        {/* Col 1: Brand & Tagline */}
        <div className="space-y-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white flex items-center justify-center">
              <GraduationCap className="w-5 h-5" />
            </div>
            <span className="font-extrabold text-lg text-stone-900 dark:text-stone-100">
              {platformSettings.appName}
            </span>
          </div>
          <p className="text-xs md:text-sm leading-relaxed text-stone-500 dark:text-stone-400">
            {platformSettings.tagline}
          </p>
          <div className="pt-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
              <ShieldCheck className="w-3.5 h-3.5" /> منهاج معتمد وأكاديمي موثوق
            </span>
          </div>
        </div>

        {/* Col 2: Fast Navigation */}
        <div>
          <h4 className="text-sm font-bold text-stone-900 dark:text-stone-100 mb-3">
            المحتوى الدراسي
          </h4>
          <ul className="space-y-2 text-xs md:text-sm">
            <li>
              <button onClick={() => navigateTo('subjects')} className="hover:text-emerald-600 transition-colors">
                جميع المقاييس (11 مقياساً)
              </button>
            </li>
            <li>
              <button onClick={() => navigateTo('summaries')} className="hover:text-emerald-600 transition-colors">
                الملخصات والخرائط الذهنية
              </button>
            </li>
            <li>
              <button onClick={() => navigateTo('quizzes')} className="hover:text-emerald-600 transition-colors">
                بنك الاختبارات التفاعلية
              </button>
            </li>
            <li>
              <button onClick={() => navigateTo('progress')} className="hover:text-emerald-600 transition-colors">
                متابعة تقدم الطالب
              </button>
            </li>
          </ul>
        </div>

        {/* Col 3: Subscriptions & Roles */}
        <div>
          <h4 className="text-sm font-bold text-stone-900 dark:text-stone-100 mb-3">
            الاشتراكات والأسعار
          </h4>
          <ul className="space-y-2 text-xs md:text-sm">
            <li>
              <button onClick={() => navigateTo('subscription')} className="hover:text-amber-600 font-semibold flex items-center gap-1 transition-colors">
                <Crown className="w-3.5 h-3.5 text-amber-500" />
                <span>عضوية Premium (من 300 دج)</span>
              </button>
            </li>
            <li>
              <button onClick={() => navigateTo('profile')} className="hover:text-emerald-600 transition-colors">
                إدارة الحساب الشخصي
              </button>
            </li>
            <li>
              <button onClick={() => navigateTo('favorites')} className="hover:text-emerald-600 transition-colors">
                الدروس المحفوظة
              </button>
            </li>
            {currentUser.role === 'admin' && (
              <li>
                <button onClick={() => navigateTo('admin')} className="text-emerald-600 dark:text-emerald-400 font-bold hover:underline">
                  لوحة تحكم الإدارة (Admin)
                </button>
              </li>
            )}
          </ul>
        </div>

        {/* Col 4: Platform Contact & Info */}
        <div>
          <h4 className="text-sm font-bold text-stone-900 dark:text-stone-100 mb-3">
            الدعم والمرافقة
          </h4>
          <p className="text-xs leading-relaxed text-stone-500 dark:text-stone-400 mb-3">
            فريق من الأساتذة والمفتشين المتقاعدين والمشرفين لمرافقتكم طيلة السنة الجامعية.
          </p>
          <div className="flex items-center gap-2 text-xs font-medium text-stone-700 dark:text-stone-300">
            <Mail className="w-4 h-4 text-emerald-600" />
            <a href={`mailto:${platformSettings.supportEmail}`} className="hover:underline">
              {platformSettings.supportEmail}
            </a>
          </div>
          <div className="mt-4 p-2.5 rounded-lg bg-stone-100 dark:bg-stone-800 text-[11px] text-stone-500">
            {platformSettings.testModeNotice}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto pt-6 border-t border-stone-200/60 dark:border-stone-800/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-stone-500">
        <p>© {new Date().getFullYear()} {platformSettings.appName}. جميع الحقوق محفوظة لطلبة التعليم الابتدائي.</p>
        <p className="flex items-center gap-1">
          <span>صُممت بعناية ومحبة لطلبة اللغة العربية</span>
          <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" />
        </p>
      </div>
    </footer>
  );
}
