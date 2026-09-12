import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import type { SubscriptionPlan } from '../types/index';
import {
  Crown,
  Sparkles,
  Check,
  X,
  CreditCard,
  ShieldCheck,
  Lock,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Copy,
  UploadCloud,
  Smartphone,
  Send,
  MessageCircle,
  Building2,
  FileCheck,
} from 'lucide-react';

export function SubscriptionPage() {
  const { subscriptionPlans, currentUser, platformSettings, showToast, refreshBootstrap, navigateTo } = useApp();

  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan | null>(null);
  const [checkoutModalOpen, setCheckoutModalOpen] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'baridimob' | 'ccp' | 'edahabia' | 'cib'>('baridimob');
  const [cardNumber, setCardNumber] = useState('5020 0000 1234 5678');
  const [cardHolder, setCardHolder] = useState(currentUser.name || 'أمين بن علي');
  const [expiry, setExpiry] = useState('12/28');
  const [cvv, setCvv] = useState('123');
  const [isProcessing, setIsProcessing] = useState(false);

  // Offline transfer form state (BaridiMob & CCP)
  const [transferRef, setTransferRef] = useState('');
  const [senderPhone, setSenderPhone] = useState('');
  const [receiptUrl, setReceiptUrl] = useState('');
  const [receiptFileName, setReceiptFileName] = useState('');
  const [copiedText, setCopiedText] = useState<string | null>(null);

  const isAlreadyPremium = currentUser.subscriptionStatus === 'premium';

  const copyToClipboard = (text: string, label: string) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedText(label);
    showToast(`تم نسخ ${label} إلى الحافظة بنجاح`, 'info');
    setTimeout(() => setCopiedText(null), 2500);
  };

  const handleReceiptUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        showToast('حجم الصورة كبير، يرجى اختيار ملف بحجم أقل من 5 ميغابايت', 'error');
        return;
      }
      setReceiptFileName(file.name);
      const reader = new FileReader();
      reader.onloadend = () => {
        setReceiptUrl(reader.result as string);
        showToast('تم تحميل صورة الوصل بنجاح', 'success');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleStartCheckout = (plan: SubscriptionPlan) => {
    setSelectedPlan(plan);
    setCheckoutModalOpen(true);
  };

  const handleConfirmCardPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPlan) return;

    setIsProcessing(true);
    try {
      const res = await fetch('/api/subscriptions/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          planId: selectedPlan.id,
          paymentMethod,
          cardNumber,
          cardExpiry: expiry,
          cvv,
        }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setCheckoutModalOpen(false);
        await refreshBootstrap();
        showToast(
          `تهانينا! تم تفعيل اشتراكك في باقة (${selectedPlan.nameAr || selectedPlan.name}) بنجاح 🎉`,
          'success'
        );
      } else {
        showToast(data.error || 'فشلت عملية الدفع', 'error');
      }
    } catch (e) {
      showToast('تعذر إتمام الدفع، يرجى المحاولة لاحقاً', 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleOfflineTransferSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPlan) return;

    if (!transferRef && !receiptUrl) {
      showToast('يرجى إدخال رقم المعاملة أو إرفاق صورة وصل التحويل', 'error');
      return;
    }

    setIsProcessing(true);
    try {
      const res = await fetch('/api/payments/offline-transfer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          planId: selectedPlan.id,
          method: paymentMethod === 'ccp' ? 'CCP' : 'BaridiMob',
          transactionRef: transferRef,
          senderPhone,
          receiptUrl,
        }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setCheckoutModalOpen(false);
        setTransferRef('');
        setReceiptUrl('');
        setReceiptFileName('');
        await refreshBootstrap();
        showToast('تم إرسال طلب الاشتراك ووصل التحويل بنجاح! سيتم تفعيل حسابك فور مراجعة المشرف 👍', 'success');
      } else {
        showToast(data.error || 'فشل إرسال الطلب', 'error');
      }
    } catch (err) {
      showToast('تعذر إرسال الطلب، يرجى المحاولة لاحقاً', 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  const generateWhatsAppLink = () => {
    const rawPhone = (platformSettings.contactPhone || '0550123456').replace(/\s+/g, '');
    const cleanPhone = rawPhone.startsWith('0') ? `213${rawPhone.slice(1)}` : rawPhone;
    const text = encodeURIComponent(
      `السلام عليكم أستاذ، قمت بتحويل مبلغ اشتراك باقة (${selectedPlan?.nameAr || selectedPlan?.name}) وقدره ${selectedPlan?.priceDzd} دج.\n` +
      `👤 الاسم: ${currentUser.name}\n` +
      `📧 البريد: ${currentUser.email}\n` +
      (transferRef ? `🔢 رقم العملية: ${transferRef}\n` : '') +
      `أرجو تفعيل حسابي، وبارك الله فيكم.`
    );
    return `https://wa.me/${cleanPhone}?text=${text}`;
  };

  return (
    <div id="subscription-page" className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">
      {/* Page Header */}
      <div className="text-center max-w-3xl mx-auto space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-amber-100 dark:bg-amber-950 text-amber-900 dark:text-amber-200 border border-amber-300 dark:border-amber-900/60">
          <Crown className="w-3.5 h-3.5 text-amber-600" />
          <span>الترقية الأكاديمية</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-black text-stone-900 dark:text-stone-100 tracking-tight">
          استثمر في نجاحك وتفوقك الدراسي
        </h1>
        <p className="text-sm sm:text-base text-stone-600 dark:text-stone-300 leading-relaxed max-w-xl mx-auto">
          احصل على وصول غير محدود لكافة الدروس المعمقة، بنوك الأسئلة المحلولة، وملفات ومذكرات PDF الرسمية.
        </p>
      </div>

      {/* Active Premium Banner if already subscribed */}
      {isAlreadyPremium && (
        <div className="p-6 rounded-3xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 text-emerald-950 dark:text-emerald-100 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center font-bold">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div className="text-right">
              <h3 className="font-bold text-base">أنت مشترك حالياً في باقة Premium النشطة</h3>
              <p className="text-xs text-emerald-700 dark:text-emerald-300">
                حسابك يتمتع بكافة الامتيازات الأكاديمية غير المحدودة.
              </p>
            </div>
          </div>
          <span className="px-4 py-1.5 rounded-full text-xs font-bold bg-emerald-600 text-white">
            حسابك مفعّل بالكامل
          </span>
        </div>
      )}

      {/* Pricing Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {subscriptionPlans.map((plan) => {
          const isPopular = plan.popular || plan.isPopular;
          return (
            <div
              key={plan.id}
              className={`relative rounded-3xl bg-white dark:bg-stone-900 border transition-all flex flex-col justify-between p-6 ${
                isPopular
                  ? 'border-amber-400 dark:border-amber-600 shadow-xl ring-2 ring-amber-400/30'
                  : 'border-stone-200 dark:border-stone-800 shadow-sm hover:shadow-md'
              }`}
            >
              {isPopular && (
                <div className="absolute -top-3.5 right-6 px-3 py-1 rounded-full text-[11px] font-black bg-gradient-to-r from-amber-500 to-amber-600 text-stone-950 uppercase tracking-wide shadow-sm">
                  {plan.badge || 'الأكثر طلباً وتوفيراً ⭐'}
                </div>
              )}

              <div>
                <h3 className="text-lg font-bold text-stone-900 dark:text-stone-100 mb-1">
                  {plan.nameAr || plan.name}
                </h3>
                <p className="text-xs text-stone-500 dark:text-stone-400 mb-4 min-h-[32px]">
                  {plan.description}
                </p>

                <div className="mb-6 pb-6 border-b border-stone-100 dark:border-stone-800">
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl sm:text-4xl font-black text-stone-900 dark:text-stone-100 tracking-tight">
                      {plan.priceDzd}
                    </span>
                    <span className="text-sm font-bold text-stone-500">دج</span>
                  </div>
                  <span className="text-[11px] text-stone-400 font-medium">
                    {plan.durationMonths === 1
                      ? 'تدفع شهرياً'
                      : plan.durationMonths === 12
                      ? 'صالحة للعام الجامعي كاملاً'
                      : `صالحة لمدة ${plan.durationMonths} أشهر`}
                  </span>
                </div>

                <div className="space-y-2.5 mb-6 text-xs text-stone-700 dark:text-stone-300">
                  {plan.features.map((feat, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>{feat}</span>
                    </div>
                  ))}
                </div>
              </div>

              <button
                onClick={() => handleStartCheckout(plan)}
                className={`w-full py-3 px-4 rounded-xl font-bold text-xs transition-all shadow-xs flex items-center justify-center gap-1.5 ${
                  isPopular
                    ? 'bg-amber-500 hover:bg-amber-600 text-stone-950 font-black'
                    : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                }`}
              >
                <span>{isAlreadyPremium ? 'تجديد الاشتراك' : 'اختيار هذه الباقة'}</span>
                <ArrowRight className="w-3.5 h-3.5 rotate-180" />
              </button>
            </div>
          );
        })}
      </div>

      {/* Comparison Table: Free vs Premium */}
      <div className="bg-white dark:bg-stone-900 rounded-3xl border border-stone-200/80 dark:border-stone-800 p-6 sm:p-8 shadow-sm space-y-6">
        <div className="text-right">
          <h2 className="text-xl font-bold text-stone-900 dark:text-stone-100">
            مقارنة الميزات بين الحساب المجاني و Premium
          </h2>
          <p className="text-xs text-stone-500 mt-1">
            شفافية كاملة حول ما تتيحه لك كل باقة.
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs sm:text-sm">
            <thead>
              <tr className="border-b border-stone-200 dark:border-stone-800 text-stone-400">
                <th className="py-3 px-4 font-bold text-stone-700 dark:text-stone-300">الميزة الأكاديمية</th>
                <th className="py-3 px-4 text-center font-bold text-stone-600 dark:text-stone-400">الحساب المجاني</th>
                <th className="py-3 px-4 text-center font-bold text-amber-600 dark:text-amber-400">باقة Premium ⭐</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100 dark:divide-stone-800/60 text-stone-700 dark:text-stone-300">
              <tr>
                <td className="py-3 px-4">تصفح فهرس المقاييس والدروس التأسيسية</td>
                <td className="py-3 px-4 text-center font-bold text-emerald-600">✓ متاح</td>
                <td className="py-3 px-4 text-center font-bold text-emerald-600">✓ متاح</td>
              </tr>
              <tr>
                <td className="py-3 px-4">الدروس المعمقة والمذكرات التطبيقية الكاملة</td>
                <td className="py-3 px-4 text-center text-stone-400">محدود بالدرس الأول فقط</td>
                <td className="py-3 px-4 text-center font-bold text-emerald-600">✓ وصول غير محدود</td>
              </tr>
              <tr>
                <td className="py-3 px-4">تحميل ملفات PDF الرسمية والمذكرات الجاهزة</td>
                <td className="py-3 px-4 text-center text-rose-500 font-bold">✕ غير متاح</td>
                <td className="py-3 px-4 text-center font-bold text-emerald-600">✓ تحميل مباشر وغير محدود</td>
              </tr>
              <tr>
                <td className="py-3 px-4">بنك الاختبارات التفاعلية ونماذج الامتحانات</td>
                <td className="py-3 px-4 text-center text-stone-400">اختبار تجريبي واحد</td>
                <td className="py-3 px-4 text-center font-bold text-emerald-600">✓ كافة الاختبارات مع الشرح</td>
              </tr>
              <tr>
                <td className="py-3 px-4">حفظ الدروس في المفضلة وتتبع التقدم</td>
                <td className="py-3 px-4 text-center font-bold text-emerald-600">✓ متاح</td>
                <td className="py-3 px-4 text-center font-bold text-emerald-600">✓ متاح</td>
              </tr>
              <tr>
                <td className="py-3 px-4">الدعم البيداغوجي والإجابة عن استفسارات الدروس</td>
                <td className="py-3 px-4 text-center text-stone-400">أولوية عادية</td>
                <td className="py-3 px-4 text-center font-bold text-emerald-600">✓ أولوية فورية</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Payment Security & Trust Badges */}
      <div className="p-6 rounded-3xl bg-stone-50 dark:bg-stone-800/40 border border-stone-200 dark:border-stone-800 flex flex-wrap items-center justify-around gap-6 text-center text-xs text-stone-600 dark:text-stone-400">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-emerald-600" />
          <span>دفع مؤمن 100% ومشفر</span>
        </div>
        <div className="flex items-center gap-2">
          <CreditCard className="w-5 h-5 text-teal-600" />
          <span>تفعيل فوري وتلقائي للحساب</span>
        </div>
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-amber-500" />
          <span>دعم مباشر عبر البريد والهاتف</span>
        </div>
      </div>

      {/* Checkout Modal with Algerian Payment Simulation */}
      {checkoutModalOpen && selectedPlan && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/70 backdrop-blur-sm animate-in fade-in duration-200"
          onClick={() => setCheckoutModalOpen(false)}
        >
          <div
            className="w-full max-w-lg bg-white dark:bg-stone-900 rounded-3xl border border-stone-200 dark:border-stone-800 p-6 sm:p-8 text-right shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-4 border-b border-stone-100 dark:border-stone-800 mb-6">
              <div>
                <span className="text-xs font-bold text-emerald-600">بوابة الدفع الآمنة</span>
                <h3 className="text-xl font-bold text-stone-900 dark:text-stone-100">
                  تأكيد الاشتراك: {selectedPlan.name}
                </h3>
              </div>
              <button
                onClick={() => setCheckoutModalOpen(false)}
                className="p-1.5 text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 rounded-lg hover:bg-stone-100 dark:hover:bg-stone-800"
              >
                ✕
              </button>
            </div>

            {/* Price Summary */}
            <div className="p-4 rounded-2xl bg-stone-50 dark:bg-stone-800/60 border border-stone-100 dark:border-stone-800 flex items-center justify-between mb-6 text-sm">
              <span className="text-stone-600 dark:text-stone-400">المبلغ الإجمالي المستحق:</span>
              <span className="text-xl font-black text-emerald-600 dark:text-emerald-400">
                {selectedPlan.priceDzd} دج
              </span>
            </div>

            {/* Payment Method Selector Tabs */}
            <div className="mb-6">
              <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-2">
                اختر طريقة الدفع المناسبة لك في الجزائر:
              </label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setPaymentMethod('baridimob')}
                  className={`p-2.5 rounded-xl border-2 flex flex-col items-center justify-center gap-1 text-xs font-bold transition-all ${
                    paymentMethod === 'baridimob'
                      ? 'border-emerald-600 bg-emerald-50/70 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-200 shadow-xs'
                      : 'border-stone-200 dark:border-stone-700 text-stone-600 dark:text-stone-400 hover:bg-stone-50 dark:hover:bg-stone-800'
                  }`}
                >
                  <Smartphone className="w-4 h-4 text-emerald-600" />
                  <span className="text-[11px]">بريدي موب RIP</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod('ccp')}
                  className={`p-2.5 rounded-xl border-2 flex flex-col items-center justify-center gap-1 text-xs font-bold transition-all ${
                    paymentMethod === 'ccp'
                      ? 'border-amber-500 bg-amber-50/70 dark:bg-amber-950/40 text-amber-900 dark:text-amber-200 shadow-xs'
                      : 'border-stone-200 dark:border-stone-700 text-stone-600 dark:text-stone-400 hover:bg-stone-50 dark:hover:bg-stone-800'
                  }`}
                >
                  <Building2 className="w-4 h-4 text-amber-600" />
                  <span className="text-[11px]">حوالة بريد CCP</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod('edahabia')}
                  className={`p-2.5 rounded-xl border-2 flex flex-col items-center justify-center gap-1 text-xs font-bold transition-all ${
                    paymentMethod === 'edahabia' || paymentMethod === 'cib'
                      ? 'border-teal-600 bg-teal-50/70 dark:bg-teal-950/40 text-teal-900 dark:text-teal-200 shadow-xs'
                      : 'border-stone-200 dark:border-stone-700 text-stone-600 dark:text-stone-400 hover:bg-stone-50 dark:hover:bg-stone-800'
                  }`}
                >
                  <CreditCard className="w-4 h-4 text-teal-600" />
                  <span className="text-[11px]">البطاقة الذهبية / CIB</span>
                </button>
              </div>
            </div>

            {/* TAB 1: BaridiMob RIP Transfer */}
            {paymentMethod === 'baridimob' && (
              <div className="space-y-4 text-right">
                {/* Account Details Box */}
                <div className="p-4 rounded-2xl bg-emerald-50/60 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/80 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-emerald-800 dark:text-emerald-300">
                      بيانات التحويل عبر تطبيق BaridiMob:
                    </span>
                    <span className="text-[10px] bg-emerald-200/60 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-200 px-2 py-0.5 rounded-full font-bold">
                      تحويل فوري
                    </span>
                  </div>

                  {/* RIP Display */}
                  <div className="bg-white dark:bg-stone-900 p-3 rounded-xl border border-emerald-200/80 dark:border-emerald-900 flex items-center justify-between gap-2">
                    <button
                      type="button"
                      onClick={() => copyToClipboard(platformSettings.baridiMobRip || '00799999002145896345', 'رقم RIP')}
                      className="px-2.5 py-1.5 rounded-lg text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white flex items-center gap-1 shrink-0 transition-colors"
                    >
                      <Copy className="w-3.5 h-3.5" />
                      <span>{copiedText === 'رقم RIP' ? 'تم النسخ!' : 'نسخ RIP'}</span>
                    </button>
                    <div className="text-left font-mono font-bold text-stone-800 dark:text-stone-100 text-sm tracking-wider" dir="ltr">
                      {platformSettings.baridiMobRip || '00799999002145896345'}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs text-stone-600 dark:text-stone-300 pt-1">
                    <div>
                      <span className="text-stone-400 block text-[10px]">صاحب الحساب:</span>
                      <span className="font-bold">{platformSettings.accountHolder || 'الأستاذ المشرف'}</span>
                    </div>
                    <div>
                      <span className="text-stone-400 block text-[10px]">المبلغ المطلوب:</span>
                      <span className="font-bold text-emerald-600 dark:text-emerald-400">{selectedPlan.priceDzd} دج</span>
                    </div>
                  </div>
                </div>

                {/* Form to submit proof of payment */}
                <form onSubmit={handleOfflineTransferSubmit} className="space-y-3.5 pt-1">
                  <div>
                    <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">
                      رقم العملية أو المعاملة (N° Transaction):
                    </label>
                    <input
                      type="text"
                      value={transferRef}
                      onChange={(e) => setTransferRef(e.target.value)}
                      placeholder="مثال: 987654321 أو لقطة شاشة"
                      className="w-full px-3.5 py-2 rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-xs font-mono text-stone-900 dark:text-stone-100 focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">
                      رقم هاتفك للتواصل والتأكيد:
                    </label>
                    <input
                      type="tel"
                      value={senderPhone}
                      onChange={(e) => setSenderPhone(e.target.value)}
                      placeholder="05 / 06 / 07 ..."
                      dir="ltr"
                      className="w-full px-3.5 py-2 rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-xs text-stone-900 dark:text-stone-100 focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>

                  {/* Receipt Upload */}
                  <div>
                    <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">
                      إرفاق لقطة شاشة وصل التحويل من بريدي موب:
                    </label>
                    <label className="border-2 border-dashed border-stone-300 dark:border-stone-700 hover:border-emerald-500 rounded-xl p-3 flex flex-col items-center justify-center cursor-pointer bg-stone-50 dark:bg-stone-800/60 transition-colors">
                      <UploadCloud className="w-6 h-6 text-stone-400 mb-1" />
                      <span className="text-xs font-medium text-stone-600 dark:text-stone-300">
                        {receiptFileName ? receiptFileName : 'اضغط لاختيار صورة وصل التحويل'}
                      </span>
                      <span className="text-[10px] text-stone-400 mt-0.5">JPG, PNG (أقل من 5 ميغابايت)</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleReceiptUpload}
                        className="hidden"
                      />
                    </label>
                    {receiptUrl && (
                      <div className="mt-2 flex items-center gap-2 p-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 text-xs">
                        <FileCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                        <span className="truncate">تم تجهيز صورة الوصل للإرسال</span>
                      </div>
                    )}
                  </div>

                  <div className="pt-2 space-y-2">
                    <button
                      type="submit"
                      disabled={isProcessing}
                      className="w-full py-3 px-4 rounded-xl font-bold text-white bg-emerald-600 hover:bg-emerald-700 shadow-md shadow-emerald-600/25 transition-all text-xs disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      <Send className="w-4 h-4" />
                      <span>{isProcessing ? 'جاري إرسال الطلب...' : 'إرسال طلب الاشتراك مع الوصل'}</span>
                    </button>

                    {/* WhatsApp option */}
                    <a
                      href={generateWhatsAppLink()}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full py-2.5 px-4 rounded-xl font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-100/70 hover:bg-emerald-100 dark:bg-emerald-950/60 transition-all text-xs flex items-center justify-center gap-2 border border-emerald-200 dark:border-emerald-800"
                    >
                      <MessageCircle className="w-4 h-4 text-emerald-600" />
                      <span>إرسال الوصل مباشرة عبر WhatsApp للأستاذ المشرف</span>
                    </a>
                  </div>
                </form>
              </div>
            )}

            {/* TAB 2: CCP Postal Transfer */}
            {paymentMethod === 'ccp' && (
              <div className="space-y-4 text-right">
                {/* Account Details Box */}
                <div className="p-4 rounded-2xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/80 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-amber-900 dark:text-amber-200">
                      بيانات الحساب البريدي الجاري (CCP):
                    </span>
                    <span className="text-[10px] bg-amber-200/60 dark:bg-amber-900/60 text-amber-900 dark:text-amber-200 px-2 py-0.5 rounded-full font-bold">
                      مكاتب البريد
                    </span>
                  </div>

                  {/* CCP & Key Display */}
                  <div className="bg-white dark:bg-stone-900 p-3 rounded-xl border border-amber-200 dark:border-amber-900 flex items-center justify-between gap-2">
                    <button
                      type="button"
                      onClick={() => copyToClipboard(`${platformSettings.ccpNumber || '0021458963'} Clé ${platformSettings.ccpKey || '45'}`, 'رقم CCP')}
                      className="px-2.5 py-1.5 rounded-lg text-xs font-bold bg-amber-600 hover:bg-amber-700 text-white flex items-center gap-1 shrink-0 transition-colors"
                    >
                      <Copy className="w-3.5 h-3.5" />
                      <span>{copiedText === 'رقم CCP' ? 'تم النسخ!' : 'نسخ الحساب'}</span>
                    </button>
                    <div className="text-left font-mono font-bold text-stone-800 dark:text-stone-100 text-sm tracking-wider" dir="ltr">
                      CCP: {platformSettings.ccpNumber || '0021458963'} / Clé: {platformSettings.ccpKey || '45'}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs text-stone-600 dark:text-stone-300 pt-1">
                    <div>
                      <span className="text-stone-400 block text-[10px]">صاحب الحساب:</span>
                      <span className="font-bold">{platformSettings.accountHolder || 'الأستاذ المشرف'}</span>
                    </div>
                    <div>
                      <span className="text-stone-400 block text-[10px]">المبلغ المستحق:</span>
                      <span className="font-bold text-amber-600 dark:text-amber-400">{selectedPlan.priceDzd} دج</span>
                    </div>
                  </div>
                </div>

                {/* Form to submit proof of CCP payment */}
                <form onSubmit={handleOfflineTransferSubmit} className="space-y-3.5 pt-1">
                  <div>
                    <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">
                      رقم الحوالة أو وصل مكتب البريد:
                    </label>
                    <input
                      type="text"
                      value={transferRef}
                      onChange={(e) => setTransferRef(e.target.value)}
                      placeholder="رقم الوصل المختوم من البريد"
                      className="w-full px-3.5 py-2 rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-xs text-stone-900 dark:text-stone-100 focus:ring-2 focus:ring-amber-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">
                      رقم الهاتف للتواصل:
                    </label>
                    <input
                      type="tel"
                      value={senderPhone}
                      onChange={(e) => setSenderPhone(e.target.value)}
                      placeholder="05 / 06 / 07 ..."
                      dir="ltr"
                      className="w-full px-3.5 py-2 rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-xs text-stone-900 dark:text-stone-100 focus:ring-2 focus:ring-amber-500"
                    />
                  </div>

                  {/* Receipt Upload */}
                  <div>
                    <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">
                      صورة وصل التحويل البريدي (Reçu):
                    </label>
                    <label className="border-2 border-dashed border-stone-300 dark:border-stone-700 hover:border-amber-500 rounded-xl p-3 flex flex-col items-center justify-center cursor-pointer bg-stone-50 dark:bg-stone-800/60 transition-colors">
                      <UploadCloud className="w-6 h-6 text-stone-400 mb-1" />
                      <span className="text-xs font-medium text-stone-600 dark:text-stone-300">
                        {receiptFileName ? receiptFileName : 'اضغط لاختيار صورة الوصل'}
                      </span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleReceiptUpload}
                        className="hidden"
                      />
                    </label>
                    {receiptUrl && (
                      <div className="mt-2 flex items-center gap-2 p-1.5 rounded-lg bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 text-xs">
                        <FileCheck className="w-4 h-4 text-amber-600 shrink-0" />
                        <span className="truncate">تم تجهيز صورة الوصل</span>
                      </div>
                    )}
                  </div>

                  <div className="pt-2 space-y-2">
                    <button
                      type="submit"
                      disabled={isProcessing}
                      className="w-full py-3 px-4 rounded-xl font-bold text-white bg-amber-600 hover:bg-amber-700 shadow-md shadow-amber-600/25 transition-all text-xs disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      <Send className="w-4 h-4" />
                      <span>{isProcessing ? 'جاري إرسال الطلب...' : 'تأكيد وإرسال طلب الاشتراك'}</span>
                    </button>

                    <a
                      href={generateWhatsAppLink()}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full py-2.5 px-4 rounded-xl font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-100/70 hover:bg-emerald-100 dark:bg-emerald-950/60 transition-all text-xs flex items-center justify-center gap-2 border border-emerald-200 dark:border-emerald-800"
                    >
                      <MessageCircle className="w-4 h-4 text-emerald-600" />
                      <span>إرسال الوصل عبر WhatsApp للأستاذ</span>
                    </a>
                  </div>
                </form>
              </div>
            )}

            {/* TAB 3: Instant Card Checkout (Edahabia / CIB) */}
            {(paymentMethod === 'edahabia' || paymentMethod === 'cib') && (
              <form onSubmit={handleConfirmCardPayment} className="space-y-4">
                <div className="grid grid-cols-2 gap-2 mb-2">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('edahabia')}
                    className={`p-2 rounded-lg border text-xs font-bold ${
                      paymentMethod === 'edahabia'
                        ? 'border-amber-500 bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-200'
                        : 'border-stone-200 dark:border-stone-700 text-stone-500'
                    }`}
                  >
                    البطاقة الذهبية Edahabia
                  </button>
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('cib')}
                    className={`p-2 rounded-lg border text-xs font-bold ${
                      paymentMethod === 'cib'
                        ? 'border-teal-600 bg-teal-50 dark:bg-teal-950/40 text-teal-800 dark:text-teal-200'
                        : 'border-stone-200 dark:border-stone-700 text-stone-500'
                    }`}
                  >
                    بطاقة CIB البنكية
                  </button>
                </div>

                {/* Card Number */}
                <div>
                  <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">
                    رقم البطاقة (16 رقماً):
                  </label>
                  <input
                    type="text"
                    required
                    value={cardNumber}
                    onChange={(e) => setCardNumber(e.target.value)}
                    dir="ltr"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-sm font-mono text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                {/* Card Holder */}
                <div>
                  <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">
                    اسم صاحب البطاقة:
                  </label>
                  <input
                    type="text"
                    required
                    value={cardHolder}
                    onChange={(e) => setCardHolder(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-sm text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                {/* Expiry & CVV */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">
                      تاريخ الانتهاء:
                    </label>
                    <input
                      type="text"
                      required
                      value={expiry}
                      onChange={(e) => setExpiry(e.target.value)}
                      dir="ltr"
                      placeholder="MM/YY"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-sm font-mono text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">
                      رمز الأمان (CVV):
                    </label>
                    <input
                      type="password"
                      required
                      maxLength={4}
                      value={cvv}
                      onChange={(e) => setCvv(e.target.value)}
                      dir="ltr"
                      placeholder="123"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-sm font-mono text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/40 text-amber-900 dark:text-amber-200 text-xs">
                  💡 <span className="font-bold">وضع المحاكاة المباشر:</span> يمكنك الضغط مباشرة على زر التأكيد لاختبار عملية الترقية الإلكترونية الفورية!
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={isProcessing}
                    className="w-full py-3.5 px-6 rounded-xl font-bold text-white bg-emerald-600 hover:bg-emerald-700 shadow-md shadow-emerald-600/25 transition-all text-sm disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    <Lock className="w-4 h-4" />
                    <span>{isProcessing ? 'جاري معالجة الدفع والتحقق...' : `دفع ${selectedPlan.priceDzd} دج وتفعيل الحساب`}</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
