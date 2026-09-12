import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { FileText, Download, X, Eye, ShieldCheck, Lock } from 'lucide-react';

export function PdfViewerModal() {
  const { pdfViewerModal, closePdfViewer, currentUser, openPremiumModal, showToast } = useApp();
  const [currentPage, setCurrentPage] = useState(1);
  const [downloading, setDownloading] = useState(false);

  if (!pdfViewerModal.open || !pdfViewerModal.pdf) return null;

  const { pdf } = pdfViewerModal;
  const isPremiumUser = currentUser.subscriptionStatus === 'premium' || currentUser.role === 'admin';

  const handleDownload = async () => {
    if (pdf.isPremium && !isPremiumUser) {
      openPremiumModal(`ملف "${pdf.title}" متاح حصرياً لمشتركي Premium.`);
      return;
    }

    setDownloading(true);
    try {
      const res = await fetch(`/api/pdfs/${pdf.id}/download`);
      const data = await res.json();
      if (!res.ok) {
        showToast(data.message || 'تعذر تحميل الملف، يرجى الترقية إلى باقة Premium', 'error');
        openPremiumModal();
        return;
      }
      showToast(`تم تجهيز تحميل "${pdf.title}" (${pdf.fileSize})`, 'success');
      // Simulated secure download triggering
    } catch (e) {
      showToast('خطأ أثناء تجهيز الملف', 'error');
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div
      id="pdf-viewer-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 md:p-6 bg-stone-950/80 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={closePdfViewer}
    >
      <div
        id="pdf-viewer-container"
        className="relative w-full max-w-4xl h-[88vh] bg-white dark:bg-stone-900 rounded-2xl shadow-2xl border border-stone-200 dark:border-stone-800 flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Toolbar */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-900/90 shrink-0">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="w-10 h-10 rounded-xl bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0">
              <FileText className="w-5 h-5" />
            </div>
            <div className="truncate text-right">
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-sm md:text-base text-stone-900 dark:text-stone-100 truncate">
                  {pdf.title}
                </h3>
                {pdf.isPremium ? (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-bold bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 rounded-md">
                    <Lock className="w-3 h-3" /> Premium
                  </span>
                ) : (
                  <span className="px-2 py-0.5 text-xs font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 rounded-md">
                    مجاني
                  </span>
                )}
              </div>
              <p className="text-xs text-stone-500 dark:text-stone-400">
                {pdf.pagesCount} صفحة • الحجم: {pdf.fileSize}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              id="btn-download-pdf-modal"
              onClick={handleDownload}
              disabled={downloading}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs md:text-sm font-semibold rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white transition-colors shadow-sm disabled:opacity-50"
            >
              <Download className="w-4 h-4" />
              <span>{downloading ? 'جاري التجهيز...' : 'تحميل PDF'}</span>
            </button>
            <button
              id="btn-close-pdf-modal"
              onClick={closePdfViewer}
              className="p-1.5 text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 rounded-lg hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
              aria-label="إغلاق قارئ PDF"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Reader Canvas Area */}
        <div className="flex-1 overflow-y-auto p-4 md:p-8 bg-stone-100 dark:bg-stone-950 flex flex-col items-center">
          <div className="w-full max-w-2xl bg-white dark:bg-stone-900 rounded-xl shadow-lg border border-stone-200 dark:border-stone-800 p-8 min-h-[600px] text-right">
            {/* Header Document simulation */}
            <div className="border-b border-stone-200 dark:border-stone-800 pb-4 mb-6 flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-stone-400">الجمهورية الجزائرية الديمقراطية الشعبية</p>
                <p className="text-xs text-stone-500">وزارة التعليم العالي والبحث العلمي / المدرسة العليا للأساتذة</p>
              </div>
              <div className="text-left text-xs text-stone-400">
                <span>الصفحة {currentPage} من {pdf.pagesCount}</span>
              </div>
            </div>

            <div className="space-y-6">
              <div className="bg-stone-50 dark:bg-stone-800/40 p-4 rounded-xl border border-stone-100 dark:border-stone-800">
                <h4 className="font-bold text-lg text-emerald-700 dark:text-emerald-400 mb-2">
                  {pdf.title}
                </h4>
                <p className="text-stone-600 dark:text-stone-300 text-sm leading-relaxed">
                  {pdf.description}
                </p>
              </div>

              <div className="prose dark:prose-invert max-w-none text-stone-700 dark:text-stone-300 text-sm leading-relaxed space-y-4">
                <h5 className="font-bold text-stone-900 dark:text-stone-100 text-base">
                  محتويات الوثيقة الأكاديمية:
                </h5>
                <ul className="list-disc pr-6 space-y-2">
                  <li>الأهداف الكفائية والديداكتيكية المسطرة للوحدة التعليمية.</li>
                  <li>تحديد المفاهيم والمصطلحات الأساسية طبق منهاج وزارة التربية الوطنية.</li>
                  <li>مخططات بيداغوجية تفصيلية لتدبير الحصص داخل القسم الابتدائي.</li>
                  <li>شبكات تقويم المعايير والمؤشرات وتصحيح الأخطاء الشائعة لدى المتعلمين.</li>
                  <li>نماذج تطبيقية مستوحاة من الامتحانات الجامعية ومسابقات الترقية.</li>
                </ul>

                <div className="p-4 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 text-xs">
                  <div className="flex items-center gap-2 font-bold mb-1">
                    <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    <span>وثيقة موثوقة ومراجعة أكاديمياً</span>
                  </div>
                  تمت مراجعة هذه المادة بواسطة هيئة التدريس المختصة في تعليمية اللغة العربية والعلوم الإنسانية.
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Page Navigation */}
        <div className="px-4 py-2.5 border-t border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-900 flex items-center justify-between text-xs text-stone-600 dark:text-stone-400">
          <span>عرض تفاعلي مباشر داخل المنصة</span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage <= 1}
              className="px-2.5 py-1 rounded bg-stone-200 dark:bg-stone-800 hover:bg-stone-300 dark:hover:bg-stone-700 disabled:opacity-40 transition-colors"
            >
              الصفحة السابقة
            </button>
            <span className="font-medium">
              {currentPage} / {pdf.pagesCount}
            </span>
            <button
              onClick={() => setCurrentPage((p) => Math.min(pdf.pagesCount, p + 1))}
              disabled={currentPage >= pdf.pagesCount}
              className="px-2.5 py-1 rounded bg-stone-200 dark:bg-stone-800 hover:bg-stone-300 dark:hover:bg-stone-700 disabled:opacity-40 transition-colors"
            >
              الصفحة التالية
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
