import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  GraduationCap,
  BookOpen,
  CheckCircle2,
  Clock,
  Lock,
  Sparkles,
  ArrowLeft,
  ChevronDown,
  Award,
  FileText,
  HelpCircle,
  Star,
  Users,
  ShieldCheck,
  Zap,
} from 'lucide-react';

export function HomePage() {
  const { subjects, navigateTo, openPremiumModal, currentUser } = useApp();
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  // Derive latest & most viewed lessons
  const featuredSubjects = subjects.slice(0, 6);

  const faqs = [
    {
      q: 'هل المحتوى مطابق لمنهاج السنة الأولى تخصص أستاذ التعليم الابتدائي في الجزائر؟',
      a: 'نعم 100%. تم إعداد ومراجعة كافة الدروس والملخصات والمذكرات البيداغوجية وفق المقرر الوزاري المعتمد في المدارس العليا للأساتذة والجامعات الجزائرية لشعبة التعليم الابتدائي (لغة عربية).',
    },
    {
      q: 'ما هو الفرق بين الحساب المجاني Free وحساب Premium؟',
      a: 'الحساب المجاني يتيح لك الاطلاع على الدروس التأسيسية وتجربة بعض الاختبارات. أما باقة Premium فتفتح لك جميع الدروس المتقدمة، وتحميل ملفات PDF والمذكرات النموذجية، وحل كافة الاختبارات مع التصحيح الفوري والشرح المنهجي.',
    },
    {
      q: 'كيف يمكنني دفع الاشتراك من داخل الجزائر؟',
      a: 'ندعم الدفع الفوري والآمن عبر البطاقة الذهبية (Edahabia) وبطاقة الدفع البنكية (CIB). تفعيل الاشتراك يتم فورياً وبشكل تلقائي بمجرد تأكيد العملية، مع أسعار تبدأ من 300 دج فقط شهرياً.',
    },
    {
      q: 'هل يمكنني استخدام المنصة من الهاتف الذكي؟',
      a: 'بالتأكيد! تم تصميم المنصة لتعمل كتطبيق هاتف ذكي سريع وسلس مع شريط تنقل سفلي، وخط عربي واضح ومريح، وإمكانية تفعيل الوضع الليلي لحماية عينيك أثناء المراجعة.',
    },
    {
      q: 'هل ستتم إضافة مقاييس السنوات القادمة؟',
      a: 'نعم، المنصة مبنية على معمارية قابلة للتوسع، وسيتم إطلاق محتوى السنة الثانية والثالثة تباعاً مع بدء السداسيات الجديدة.',
    },
  ];

  const testimonials = [
    {
      name: 'مريم شارف',
      role: 'طالبة بالسنة الأولى، المدرسة العليا للأساتذة ببوزريعة',
      text: 'منصة أستاذي أنقذتني في السداسي الأول! ملخصات النحو والمذكرات البيداغوجية ساعدتني كثيراً في فهم المثلث الديداكتيكي وتطبيق قواعد الإعراب.',
      avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=120&q=80',
    },
    {
      name: 'عبد القادر بلحاج',
      role: 'طالب أستاذ ابتدائي، جامعة وهران',
      text: 'الاختبارات التفاعلية بنظام التصحيح الفوري مكنتني من تثبيت المعلومات وتدارك أخطائي في علم النفس التربوي والصرف قبل الامتحان.',
      avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=120&q=80',
    },
    {
      name: 'ياسمين قاسم',
      role: 'مترشحة متفوقة في مسابقة التوظيف',
      text: 'الاشتراك السنوي يستحق كل دينار! ملفات PDF المنظمة وحقائب الدروس وفرت عليّ ساعات طويلة من البحث والتلخيص اليدوي.',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80',
    },
  ];

  return (
    <div id="home-page" className="space-y-16 pb-12">
      {/* 1. Hero Section */}
      <section
        id="hero-section"
        className="relative overflow-hidden pt-8 pb-16 md:py-24 px-4 sm:px-6 lg:px-8 border-b border-stone-200/80 dark:border-stone-800"
      >
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-emerald-400/10 dark:bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/4 w-80 h-80 bg-teal-400/10 dark:bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-4xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs md:text-sm font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60 mb-6">
            <Sparkles className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span>منصة متخصصة لطلبة أستاذ التعليم الابتدائي - لغة عربية</span>
          </div>

          <h1 className="text-3xl sm:text-5xl md:text-6xl font-black text-stone-900 dark:text-stone-100 tracking-tight leading-[1.25] mb-6">
            كل ما تحتاجه للنجاح في <br className="hidden sm:inline" />
            <span className="text-transparent bg-clip-text bg-gradient-to-l from-emerald-600 to-teal-500">
              السنة الأولى بين يديك
            </span>
          </h1>

          <p className="text-base sm:text-xl text-stone-600 dark:text-stone-300 max-w-2xl mx-auto leading-relaxed mb-8">
            دروس، ملخصات، اختبارات ومراجعات مخصصة لطلبة أستاذ التعليم الابتدائي طبق المنهاج الجامعي المعتمد.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 max-w-md mx-auto">
            <button
              id="btn-hero-start-learning"
              onClick={() => navigateTo('subjects')}
              className="w-full sm:w-auto px-8 py-4 rounded-xl text-base font-bold text-white bg-emerald-600 hover:bg-emerald-700 shadow-lg shadow-emerald-600/25 hover:shadow-xl transition-all flex items-center justify-center gap-2"
            >
              <span>ابدأ التعلم الآن</span>
              <ArrowLeft className="w-5 h-5" />
            </button>
            <button
              id="btn-hero-explore-subjects"
              onClick={() => navigateTo('subjects')}
              className="w-full sm:w-auto px-7 py-4 rounded-xl text-base font-semibold text-stone-700 dark:text-stone-200 bg-white dark:bg-stone-800 hover:bg-stone-100 dark:hover:bg-stone-700 border border-stone-200 dark:border-stone-700 transition-all"
            >
              استكشف المقاييس
            </button>
          </div>

          {/* Key Stats Bar */}
          <div className="mt-12 pt-8 border-t border-stone-200/60 dark:border-stone-800/80 grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
            <div>
              <p className="text-2xl sm:text-3xl font-black text-emerald-600 dark:text-emerald-400">11</p>
              <p className="text-xs text-stone-500 dark:text-stone-400 font-medium">مقياساً دراسياً معتمداً</p>
            </div>
            <div>
              <p className="text-2xl sm:text-3xl font-black text-emerald-600 dark:text-emerald-400">+50</p>
              <p className="text-xs text-stone-500 dark:text-stone-400 font-medium">درساً ومذكرة مفصلة</p>
            </div>
            <div>
              <p className="text-2xl sm:text-3xl font-black text-emerald-600 dark:text-emerald-400">100%</p>
              <p className="text-xs text-stone-500 dark:text-stone-400 font-medium">اختبارات بتصحيح فوري</p>
            </div>
            <div>
              <p className="text-2xl sm:text-3xl font-black text-emerald-600 dark:text-emerald-400">300 دج</p>
              <p className="text-xs text-stone-500 dark:text-stone-400 font-medium">اشتراك رمزي متاح للجميع</p>
            </div>
          </div>
        </div>
      </section>

      {/* 2. لماذا أستاذي؟ */}
      <section id="why-us-section" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
            التميز البيداغوجي
          </span>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-stone-900 dark:text-stone-100 mt-1">
            لماذا تختار منصة أستاذي؟
          </h2>
          <p className="text-sm text-stone-600 dark:text-stone-400 mt-2">
            تم تصميم كل عنصر في المنصة ليلبي احتياجات الطالب المعلم ويوفر عليه عناء التشتت بين المراجع المعقدة.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200/80 dark:border-stone-800 shadow-sm hover:shadow-md transition-shadow">
            <div className="w-12 h-12 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-4">
              <BookOpen className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-stone-900 dark:text-stone-100 mb-2">
              محتوى أكاديمي متخصص
            </h3>
            <p className="text-xs md:text-sm text-stone-600 dark:text-stone-400 leading-relaxed">
              تركيز كامل على متطلبات أستاذ الابتدائي: من النحو والصرف إلى علوم التربية والديداكتيك وعلم النفس التربوي.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200/80 dark:border-stone-800 shadow-sm hover:shadow-md transition-shadow">
            <div className="w-12 h-12 rounded-xl bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center mb-4">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-stone-900 dark:text-stone-100 mb-2">
              اختبارات وتقييم فوري
            </h3>
            <p className="text-xs md:text-sm text-stone-600 dark:text-stone-400 leading-relaxed">
              أسئلة متعددة الخيارات وصواب/خطأ مع تعليل الإجابة النموذجية فور الانتهاء وحفظ نتائج تقدمك.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200/80 dark:border-stone-800 shadow-sm hover:shadow-md transition-shadow">
            <div className="w-12 h-12 rounded-xl bg-teal-100 dark:bg-teal-950/60 text-teal-600 dark:text-teal-400 flex items-center justify-center mb-4">
              <Zap className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-stone-900 dark:text-stone-100 mb-2">
              تجربة هاتف ذكية
            </h3>
            <p className="text-xs md:text-sm text-stone-600 dark:text-stone-400 leading-relaxed">
              تصفح سريع بدون إعلانات مزعجة، وضع ليلي مريح، مع إمكانية تكبير الخط وقراءة المذكرات بوضوح.
            </p>
          </div>
        </div>
      </section>

      {/* 3. المقاييس الدراسية (Dynamic Grid) */}
      <section id="subjects-preview-section" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
              المقرر الوزاري
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-stone-900 dark:text-stone-100 mt-1">
              المقاييس الدراسية للسنة الأولى
            </h2>
          </div>
          <button
            onClick={() => navigateTo('subjects')}
            className="text-xs md:text-sm font-bold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1 self-start sm:self-auto"
          >
            <span>عرض كافة المقاييس (11)</span>
            <ArrowLeft className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {featuredSubjects.map((subj) => (
            <div
              key={subj.id}
              onClick={() => navigateTo('subject-detail', { subjectId: subj.id })}
              className="group cursor-pointer rounded-2xl bg-white dark:bg-stone-900 border border-stone-200/80 dark:border-stone-800 p-5 hover:border-emerald-500/50 dark:hover:border-emerald-500/50 hover:shadow-lg transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between gap-3 mb-4">
                  <div className="w-11 h-11 rounded-xl bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 flex items-center justify-center font-bold text-sm">
                    <BookOpen className="w-5 h-5" />
                  </div>
                  <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400">
                    {subj.code}
                  </span>
                </div>

                <h3 className="text-lg font-bold text-stone-900 dark:text-stone-100 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors mb-2">
                  {subj.title}
                </h3>
                <p className="text-xs text-stone-500 dark:text-stone-400 line-clamp-2 leading-relaxed mb-4">
                  {subj.description}
                </p>
              </div>

              <div className="pt-3 border-t border-stone-100 dark:border-stone-800/70 flex items-center justify-between text-xs text-stone-500 dark:text-stone-400">
                <div className="flex items-center gap-3">
                  <span>{subj.lessonsCount} دروس</span>
                  <span>•</span>
                  <span>{subj.summariesCount} ملخص</span>
                  <span>•</span>
                  <span>{subj.quizzesCount} اختبار</span>
                </div>
                <span className="text-emerald-600 dark:text-emerald-400 font-semibold group-hover:translate-x-1 transition-transform">
                  ←
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 4. مميزات باقة Premium */}
      <section
        id="premium-features-section"
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 rounded-3xl bg-gradient-to-br from-amber-500/10 via-emerald-500/5 to-teal-500/10 border border-amber-200/60 dark:border-amber-900/40"
      >
        <div className="max-w-3xl mx-auto text-center mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-200 mb-3">
            <Sparkles className="w-3.5 h-3.5 text-amber-600" />
            <span>عضوية التفوق الأكاديمي</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-stone-900 dark:text-stone-100">
            مميزات الاشتراك في باقة Premium
          </h2>
          <p className="text-sm text-stone-600 dark:text-stone-300 mt-2">
            تمكين كامل للطالب للوصول إلى كافة المذكرات، نماذج الامتحانات، والملخصات بجودة عالية.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 max-w-5xl mx-auto mb-8">
          <div className="p-4 rounded-xl bg-white/90 dark:bg-stone-900/90 border border-stone-200/60 dark:border-stone-800 text-right">
            <div className="font-bold text-stone-900 dark:text-stone-100 text-sm mb-1 flex items-center gap-2">
              <span className="text-amber-500">🔒</span> فتح كامل الدروس المتقدمة
            </div>
            <p className="text-xs text-stone-500 dark:text-stone-400">
              الوصول غير المحدود لدروس النواسخ، المفاعيل، والمقاربة بالكفاءات المعمقة.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-white/90 dark:bg-stone-900/90 border border-stone-200/60 dark:border-stone-800 text-right">
            <div className="font-bold text-stone-900 dark:text-stone-100 text-sm mb-1 flex items-center gap-2">
              <span className="text-amber-500">📥</span> تحميل ملفات PDF غير محدود
            </div>
            <p className="text-xs text-stone-500 dark:text-stone-400">
              طباعة المذكرات البيداغوجية الجاهزة للاستعمال في القسم والتربصات الميدانية.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-white/90 dark:bg-stone-900/90 border border-stone-200/60 dark:border-stone-800 text-right">
            <div className="font-bold text-stone-900 dark:text-stone-100 text-sm mb-1 flex items-center gap-2">
              <span className="text-amber-500">📝</span> بنك أسئلة الامتحانات المحلولة
            </div>
            <p className="text-xs text-stone-500 dark:text-stone-400">
              حل اختبارات السداسيات الماضية مع شروحات نموذجية لضمان أعلى الدرجات.
            </p>
          </div>
        </div>

        <div className="text-center">
          <button
            id="btn-home-view-plans"
            onClick={() => navigateTo('subscription')}
            className="px-8 py-3.5 rounded-xl font-bold text-white bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-700 hover:to-amber-600 shadow-md shadow-amber-500/25 transition-all text-sm"
          >
            استكشف خطط الاشتراك (ابتداءً من 300 دج)
          </button>
        </div>
      </section>

      {/* 5. آراء الطلاب */}
      <section id="testimonials-section" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
            شهادات حية
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-stone-900 dark:text-stone-100 mt-1">
            ماذا يقول طلبة المدرسة العليا والجامعات؟
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonials.map((t, idx) => (
            <div
              key={idx}
              className="p-6 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200/80 dark:border-stone-800 shadow-sm flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center gap-1 text-amber-400 mb-3">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <p className="text-xs md:text-sm text-stone-600 dark:text-stone-300 leading-relaxed italic mb-6">
                  "{t.text}"
                </p>
              </div>

              <div className="flex items-center gap-3 pt-4 border-t border-stone-100 dark:border-stone-800">
                <img
                  src={t.avatar}
                  alt={t.name}
                  className="w-10 h-10 rounded-full object-cover ring-2 ring-emerald-500/30"
                />
                <div className="text-right">
                  <h4 className="text-xs font-bold text-stone-900 dark:text-stone-100">{t.name}</h4>
                  <p className="text-[11px] text-stone-500 dark:text-stone-400">{t.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 6. الأسئلة الشائعة (FAQ) */}
      <section id="faq-section" className="max-w-3xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-10">
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
            الأسئلة المتكررة
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-stone-900 dark:text-stone-100 mt-1">
            إجابات عن تساؤلاتكم
          </h2>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, idx) => {
            const isOpen = openFaqIndex === idx;
            return (
              <div
                key={idx}
                className="rounded-xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 overflow-hidden transition-colors"
              >
                <button
                  onClick={() => setOpenFaqIndex(isOpen ? null : idx)}
                  className="w-full p-4 text-right flex items-center justify-between gap-4 font-bold text-sm text-stone-900 dark:text-stone-100 hover:text-emerald-600 dark:hover:text-emerald-400"
                >
                  <span>{faq.q}</span>
                  <ChevronDown
                    className={`w-4 h-4 shrink-0 transition-transform ${isOpen ? 'rotate-180 text-emerald-600' : 'text-stone-400'}`}
                  />
                </button>
                {isOpen && (
                  <div className="px-4 pb-4 pt-1 text-xs md:text-sm text-stone-600 dark:text-stone-400 leading-relaxed border-t border-stone-100 dark:border-stone-800/60">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* 7. CTA للاشتراك */}
      <section id="cta-section" className="max-w-5xl mx-auto px-4 sm:px-6">
        <div className="p-8 sm:p-12 rounded-3xl bg-gradient-to-r from-emerald-700 via-emerald-600 to-teal-700 text-white text-center relative overflow-hidden shadow-xl">
          <div className="relative z-10 max-w-2xl mx-auto">
            <h2 className="text-2xl sm:text-4xl font-extrabold mb-4">
              جاهز للتفوق في السنة الأولى؟
            </h2>
            <p className="text-sm sm:text-base text-emerald-100 leading-relaxed mb-8">
              انضم إلى مئات الطلبة المعلمين، وابدأ دراسة المقاييس وحل الاختبارات واستفد من الدعم البيداغوجي المتكامل.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                id="btn-cta-subscribe"
                onClick={() => navigateTo('subscription')}
                className="w-full sm:w-auto px-8 py-3.5 rounded-xl font-bold bg-white text-emerald-800 hover:bg-stone-100 shadow-md transition-colors text-sm"
              >
                اشترك الآن في Premium
              </button>
              <button
                id="btn-cta-explore-free"
                onClick={() => navigateTo('subjects')}
                className="w-full sm:w-auto px-6 py-3.5 rounded-xl font-medium text-white border border-emerald-400/60 hover:bg-emerald-800/40 transition-colors text-sm"
              >
                تصفح المحتوى المجاني
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
