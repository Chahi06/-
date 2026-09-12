import React from 'react';
import { useApp } from '../context/AppContext';
import {
  User,
  Mail,
  GraduationCap,
  Crown,
  Calendar,
  ShieldCheck,
  CheckCircle2,
  Award,
  ArrowRight,
  Heart,
} from 'lucide-react';

export function ProfilePage() {
  const { currentUser, navigateTo, studentProgress, switchDemoUser } = useApp();

  const isPremium = currentUser.subscriptionStatus === 'premium';

  return (
    <div id="profile-page" className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header Banner */}
      <div className="border-b border-stone-200 dark:border-stone-800 pb-6">
        <h1 className="text-2xl sm:text-4xl font-extrabold text-stone-900 dark:text-stone-100 tracking-tight">
          الملف الشخصي والاشتراك
        </h1>
        <p className="text-xs sm:text-sm text-stone-600 dark:text-stone-400 mt-1">
          إدارة بيانات الحساب، ومتابعة حالة الاشتراك الأكاديمي، واختبار الصلاحيات.
        </p>
      </div>

      {/* Profile Card */}
      <div className="bg-white dark:bg-stone-900 rounded-3xl border border-stone-200/80 dark:border-stone-800 p-6 sm:p-8 shadow-sm flex flex-col sm:flex-row items-center sm:items-start gap-6">
        <img
          src={currentUser.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150'}
          alt={currentUser.name}
          className="w-24 h-24 rounded-2xl object-cover ring-4 ring-emerald-500/20"
        />

        <div className="flex-1 text-center sm:text-right space-y-2">
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
            <h2 className="text-2xl font-bold text-stone-900 dark:text-stone-100">
              {currentUser.name}
            </h2>
            {isPremium ? (
              <span className="inline-flex items-center gap-1 px-3 py-0.5 rounded-full text-xs font-bold bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300">
                <Crown className="w-3 h-3" /> Premium عضوية نشطة
              </span>
            ) : (
              <span className="px-3 py-0.5 rounded-full text-xs font-bold bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400">
                حساب مجاني Free
              </span>
            )}
            {currentUser.role === 'admin' && (
              <span className="px-3 py-0.5 rounded-full text-xs font-bold bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300">
                صلاحيات المشرفة (Admin)
              </span>
            )}
          </div>

          <p className="text-xs sm:text-sm text-stone-500 flex items-center justify-center sm:justify-start gap-1.5">
            <Mail className="w-3.5 h-3.5" />
            <span>{currentUser.email}</span>
          </p>

          <p className="text-xs sm:text-sm text-stone-700 dark:text-stone-300 flex items-center justify-center sm:justify-start gap-1.5 font-medium">
            <GraduationCap className="w-3.5 h-3.5 text-emerald-600" />
            <span>{currentUser.academicLevel}</span>
          </p>
        </div>
      </div>

      {/* Subscription Card */}
      <div className="bg-white dark:bg-stone-900 rounded-3xl border border-stone-200/80 dark:border-stone-800 p-6 sm:p-8 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
                isPremium
                  ? 'bg-amber-100 dark:bg-amber-950 text-amber-600 dark:text-amber-400'
                  : 'bg-stone-100 dark:bg-stone-800 text-stone-500'
              }`}
            >
              <Crown className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-stone-900 dark:text-stone-100">
                {isPremium ? 'باقة Premium الشاملة' : 'الحساب المجاني'}
              </h3>
              <p className="text-xs text-stone-500">
                {isPremium
                  ? 'مفعلة وتتيح لك الوصول لجميع الدروس، الاختبارات، والمذكرات'
                  : 'يتيح لك تصفح الدروس التأسيسية فقط'}
              </p>
            </div>
          </div>

          {isPremium ? (
            <span className="px-4 py-1.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
              نشط وموثق ✓
            </span>
          ) : (
            <button
              onClick={() => navigateTo('subscription')}
              className="px-5 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-amber-600 to-amber-500 text-white shadow-xs hover:from-amber-700 transition-all"
            >
              ترقية الحساب الآن
            </button>
          )}
        </div>

        {isPremium && (
          <div className="pt-4 border-t border-stone-100 dark:border-stone-800 flex items-center gap-2 text-xs text-stone-600 dark:text-stone-400">
            <Calendar className="w-4 h-4 text-emerald-600" />
            <span>تاريخ انتهاء الصلاحية: 2026-06-30 (تغطية كاملة للموسم الجامعي)</span>
          </div>
        )}
      </div>

      {/* Progress Overview Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div
          onClick={() => navigateTo('progress')}
          className="p-5 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200/80 dark:border-stone-800 cursor-pointer hover:border-emerald-500/50 transition-colors"
        >
          <span className="text-xs text-stone-400 font-medium block mb-1">الدروس المكتملة</span>
          <span className="text-2xl font-black text-stone-900 dark:text-stone-100">
            {studentProgress.completedLessons.length}
          </span>
          <span className="text-[11px] text-emerald-600 font-bold block mt-1">عرض في تقدمي ←</span>
        </div>

        <div
          onClick={() => navigateTo('progress')}
          className="p-5 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200/80 dark:border-stone-800 cursor-pointer hover:border-emerald-500/50 transition-colors"
        >
          <span className="text-xs text-stone-400 font-medium block mb-1">الاختبارات المنجزة</span>
          <span className="text-2xl font-black text-stone-900 dark:text-stone-100">
            {studentProgress.quizResults.length}
          </span>
          <span className="text-[11px] text-emerald-600 font-bold block mt-1">سجل النتائج ←</span>
        </div>

        <div
          onClick={() => navigateTo('favorites')}
          className="p-5 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200/80 dark:border-stone-800 cursor-pointer hover:border-rose-500/50 transition-colors"
        >
          <span className="text-xs text-stone-400 font-medium block mb-1">المحفوظات</span>
          <span className="text-2xl font-black text-stone-900 dark:text-stone-100">
            {studentProgress.favoriteLessons.length + studentProgress.favoriteSummaries.length}
          </span>
          <span className="text-[11px] text-rose-600 font-bold block mt-1">فتح المفضلة ←</span>
        </div>
      </div>

      {/* Demo Role Switcher for Testing */}
      <div className="bg-stone-50 dark:bg-stone-800/40 rounded-3xl border border-stone-200 dark:border-stone-800 p-6 space-y-3">
        <h3 className="text-sm font-bold text-stone-900 dark:text-stone-100">
          مبدّل الأدوار التجريبي (Demo Switcher):
        </h3>
        <p className="text-xs text-stone-500">
          يمكنك تجربة المنصة من منظور طالب مجاني، أو طالب مشترك في باقة Premium، أو مديرة المنصة (Admin) بنقرة واحدة لاختبار كافة الصلاحيات والأمان السحابي.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
          <button
            onClick={() => switchDemoUser('student', 'free')}
            className="p-3 rounded-xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 text-right hover:border-stone-400 transition-colors"
          >
            <span className="block text-xs font-bold text-stone-900 dark:text-stone-100">طالب مجاني (Free)</span>
            <span className="text-[10px] text-stone-400">تصفح المحتوى المفتوح فقط</span>
          </button>

          <button
            onClick={() => switchDemoUser('student', 'premium')}
            className="p-3 rounded-xl bg-white dark:bg-stone-900 border border-amber-300 dark:border-amber-800 text-right hover:border-amber-500 transition-colors"
          >
            <span className="block text-xs font-bold text-amber-700 dark:text-amber-400">طالب مشترك (Premium)</span>
            <span className="text-[10px] text-stone-400">فتح كامل الدروس والـ PDF والكويزات</span>
          </button>

          <button
            onClick={() => switchDemoUser('admin', 'premium')}
            className="p-3 rounded-xl bg-white dark:bg-stone-900 border border-emerald-300 dark:border-emerald-800 text-right hover:border-emerald-500 transition-colors"
          >
            <span className="block text-xs font-bold text-emerald-700 dark:text-emerald-400">مديرة المنصة (Admin)</span>
            <span className="text-[10px] text-stone-400">إدارة الدروس والمقاييس والأسعار</span>
          </button>
        </div>
      </div>
    </div>
  );
}
