import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import type { AdminMetrics, PaymentTransaction, User, Subject, Lesson, Quiz, Summary, PDFFile } from '../types/index';
import { MediaUpload } from '../components/common/MediaUpload';
import {
  ShieldCheck,
  Users,
  CreditCard,
  BookOpen,
  FileText,
  CheckSquare,
  Plus,
  Trash2,
  Edit3,
  Bell,
  Settings,
  DollarSign,
  TrendingUp,
  Download,
  Lock,
  ArrowRight,
  CheckCircle2,
  X,
  Smartphone,
  Building2,
  Eye,
  Copy,
  ExternalLink,
  MessageCircle,
  Image as ImageIcon,
  Video,
  Film,
} from 'lucide-react';

export function AdminDashboard() {
  const {
    currentUser,
    subjects,
    subscriptionPlans,
    platformSettings,
    addSubject,
    updateSubject,
    deleteSubject,
    addLesson,
    updateLesson,
    deleteLesson,
    addPdf,
    deletePdf,
    addSummary,
    updateSummary,
    deleteSummary,
    addQuiz,
    deleteQuiz,
    updatePlanPrice,
    broadcastNotification,
    updatePlatformSettings,
    navParams,
    navigateTo,
    showToast,
    switchDemoUser,
  } = useApp();

  const [activeTab, setActiveTab] = useState<
    'overview' | 'subjects' | 'lessons' | 'summaries' | 'pdfs' | 'quizzes' | 'pricing' | 'payments' | 'users' | 'notifications' | 'settings'
  >((navParams.tab as any) || 'overview');

  const [metrics, setMetrics] = useState<AdminMetrics | null>(null);
  const [usersList, setUsersList] = useState<User[]>([]);
  const [paymentsList, setPaymentsList] = useState<PaymentTransaction[]>([]);
  const [selectedReceiptImage, setSelectedReceiptImage] = useState<string | null>(null);
  const [allLessons, setAllLessons] = useState<Lesson[]>([]);
  const [allSummaries, setAllSummaries] = useState<Summary[]>([]);
  const [allPdfs, setAllPdfs] = useState<PDFFile[]>([]);
  const [allQuizzes, setAllQuizzes] = useState<Quiz[]>([]);
  const [loading, setLoading] = useState(true);

  // Forms states
  const [newSubjectTitle, setNewSubjectTitle] = useState('');
  const [newSubjectCode, setNewSubjectCode] = useState('');
  const [newSubjectDesc, setNewSubjectDesc] = useState('');

  // Edit Subject state
  const [editingSubject, setEditingSubject] = useState<Subject | null>(null);
  const [editSubjectTitle, setEditSubjectTitle] = useState('');
  const [editSubjectCode, setEditSubjectCode] = useState('');
  const [editSubjectDesc, setEditSubjectDesc] = useState('');
  const [editSubjectColor, setEditSubjectColor] = useState('emerald');
  const [editSubjectIcon, setEditSubjectIcon] = useState('BookOpen');

  // Edit Lesson state
  const [editingLesson, setEditingLesson] = useState<Lesson | null>(null);
  const [editLessonTitle, setEditLessonTitle] = useState('');
  const [editLessonSubjectId, setEditLessonSubjectId] = useState('');
  const [editLessonExcerpt, setEditLessonExcerpt] = useState('');
  const [editLessonQuickSummary, setEditLessonQuickSummary] = useState('');
  const [editLessonContent, setEditLessonContent] = useState('');
  const [editLessonReadingTime, setEditLessonReadingTime] = useState(10);
  const [editLessonIsPremium, setEditLessonIsPremium] = useState(false);
  const [editLessonImageUrl, setEditLessonImageUrl] = useState('');
  const [editLessonVideoUrl, setEditLessonVideoUrl] = useState('');
  const [editLessonVideoTitle, setEditLessonVideoTitle] = useState('');
  const [editLessonVideoDuration, setEditLessonVideoDuration] = useState('');

  // Edit Summary state
  const [editingSummary, setEditingSummary] = useState<Summary | null>(null);
  const [editSumTitle, setEditSumTitle] = useState('');
  const [editSumSubjectId, setEditSumSubjectId] = useState('');
  const [editSumExcerpt, setEditSumExcerpt] = useState('');
  const [editSumPoints, setEditSumPoints] = useState('');
  const [editSumFullText, setEditSumFullText] = useState('');
  const [editSumIsPremium, setEditSumIsPremium] = useState(false);
  const [editSumImageUrl, setEditSumImageUrl] = useState('');
  const [editSumVideoUrl, setEditSumVideoUrl] = useState('');

  // Lesson Form
  const [newLessonSubjectId, setNewLessonSubjectId] = useState(subjects[0]?.id || '');
  const [newLessonTitle, setNewLessonTitle] = useState('');
  const [newLessonExcerpt, setNewLessonExcerpt] = useState('');
  const [newLessonContent, setNewLessonContent] = useState('');
  const [newLessonIsPremium, setNewLessonIsPremium] = useState(false);
  const [newLessonReadingTime, setNewLessonReadingTime] = useState(10);
  const [newLessonImageUrl, setNewLessonImageUrl] = useState('');
  const [newLessonVideoUrl, setNewLessonVideoUrl] = useState('');
  const [newLessonVideoTitle, setNewLessonVideoTitle] = useState('');
  const [newLessonVideoDuration, setNewLessonVideoDuration] = useState('');

  // Summary Form
  const [newSumSubjectId, setNewSumSubjectId] = useState(subjects[0]?.id || '');
  const [newSumTitle, setNewSumTitle] = useState('');
  const [newSumExcerpt, setNewSumExcerpt] = useState('');
  const [newSumPoints, setNewSumPoints] = useState('');
  const [newSumContent, setNewSumContent] = useState('');
  const [newSumIsPremium, setNewSumIsPremium] = useState(false);
  const [newSumImageUrl, setNewSumImageUrl] = useState('');
  const [newSumVideoUrl, setNewSumVideoUrl] = useState('');

  // PDF Form
  const [newPdfSubjectId, setNewPdfSubjectId] = useState(subjects[0]?.id || '');
  const [newPdfTitle, setNewPdfTitle] = useState('');
  const [newPdfDesc, setNewPdfDesc] = useState('');
  const [newPdfSize, setNewPdfSize] = useState('2.4 MB');
  const [newPdfPages, setNewPdfPages] = useState(18);
  const [newPdfIsPremium, setNewPdfIsPremium] = useState(true);

  // Quiz Form
  const [newQuizSubjectId, setNewQuizSubjectId] = useState(subjects[0]?.id || '');
  const [newQuizTitle, setNewQuizTitle] = useState('');
  const [newQuizDesc, setNewQuizDesc] = useState('');
  const [newQuizIsPremium, setNewQuizIsPremium] = useState(false);
  const [newQ1Text, setNewQ1Text] = useState('');
  const [newQ1OptA, setNewQ1OptA] = useState('');
  const [newQ1OptB, setNewQ1OptB] = useState('');
  const [newQ1OptC, setNewQ1OptC] = useState('');
  const [newQ1Correct, setNewQ1Correct] = useState('');
  const [newQ1Exp, setNewQ1Exp] = useState('');

  // Notification Broadcast Form
  const [notifTitle, setNotifTitle] = useState('');
  const [notifMsg, setNotifMsg] = useState('');

  // Pricing Form
  const [editedPrices, setEditedPrices] = useState<Record<string, number>>({});

  // Platform Settings Form
  const [settingsAppName, setSettingsAppName] = useState(platformSettings.appName);
  const [settingsTagline, setSettingsTagline] = useState(platformSettings.tagline);
  const [settingsLogoText, setSettingsLogoText] = useState(platformSettings.logoText);
  const [settingsEmail, setSettingsEmail] = useState(platformSettings.supportEmail);
  const [settingsCcpNumber, setSettingsCcpNumber] = useState(platformSettings.ccpNumber || '0021458963');
  const [settingsCcpKey, setSettingsCcpKey] = useState(platformSettings.ccpKey || '45');
  const [settingsBaridiMobRip, setSettingsBaridiMobRip] = useState(platformSettings.baridiMobRip || '00799999002145896345');
  const [settingsAccountHolder, setSettingsAccountHolder] = useState(platformSettings.accountHolder || 'الأستاذ المشرف العام (azc1744)');
  const [settingsContactPhone, setSettingsContactPhone] = useState(platformSettings.contactPhone || '0550 12 34 56');
  const [settingsPaymentInstructions, setSettingsPaymentInstructions] = useState(
    platformSettings.paymentInstructions ||
      'يرجى تحويل مبلغ الاشتراك المحدد عبر تطبيق بريدي موب (BaridiMob) إلى رقم RIP الموضح، أو عبر مكتب البريد (حوالة CCP)، ثم إرفاق صورة الوصل أو رقم العملية ليتم تفعيل حسابك فوراً.'
  );

  const getAdminHeaders = () => ({
    'x-user-id': currentUser.id,
    'x-user-email': currentUser.email,
    'x-user-role': currentUser.role,
    'x-admin-role': 'admin',
  });

  const fetchAdminData = async () => {
    setLoading(true);
    const adminHeaders = getAdminHeaders();
    try {
      const [mRes, uRes, lRes, sRes, pRes, pdfRes, qRes] = await Promise.all([
        fetch('/api/admin/metrics', { headers: adminHeaders }),
        fetch('/api/admin/users', { headers: adminHeaders }),
        fetch('/api/lessons'),
        fetch('/api/summaries'),
        fetch('/api/admin/payments', { headers: adminHeaders }),
        fetch('/api/pdfs'),
        fetch('/api/quizzes'),
      ]);
      if (mRes.ok) {
        const mData = await mRes.json();
        setMetrics(mData.metrics || mData);
        if (mData.transactions && (!paymentsList || paymentsList.length === 0)) {
          setPaymentsList(mData.transactions);
        }
      }
      if (uRes.ok) setUsersList(await uRes.json());
      if (lRes.ok) setAllLessons(await lRes.json());
      if (sRes.ok) setAllSummaries(await sRes.json());
      if (pRes.ok) setPaymentsList(await pRes.json());
      if (pdfRes.ok) setAllPdfs(await pdfRes.json());
      if (qRes.ok) setAllQuizzes(await qRes.json());
    } catch (e) {
      console.error('Failed to load admin data:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  useEffect(() => {
    if (platformSettings) {
      setSettingsAppName(platformSettings.appName);
      setSettingsTagline(platformSettings.tagline);
      setSettingsLogoText(platformSettings.logoText);
      setSettingsEmail(platformSettings.supportEmail);
      if (platformSettings.ccpNumber) setSettingsCcpNumber(platformSettings.ccpNumber);
      if (platformSettings.ccpKey) setSettingsCcpKey(platformSettings.ccpKey);
      if (platformSettings.baridiMobRip) setSettingsBaridiMobRip(platformSettings.baridiMobRip);
      if (platformSettings.accountHolder) setSettingsAccountHolder(platformSettings.accountHolder);
      if (platformSettings.contactPhone) setSettingsContactPhone(platformSettings.contactPhone);
      if (platformSettings.paymentInstructions) setSettingsPaymentInstructions(platformSettings.paymentInstructions);
    }
  }, [platformSettings]);

  const handleCreateSubject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubjectTitle) return;
    const ok = await addSubject({
      title: newSubjectTitle,
      code: newSubjectCode || `SUBJ-${subjects.length + 1}`,
      description: newSubjectDesc,
    });
    if (ok) {
      setNewSubjectTitle('');
      setNewSubjectCode('');
      setNewSubjectDesc('');
    }
  };

  const handleOpenEditSubject = (subject: Subject) => {
    setEditingSubject(subject);
    setEditSubjectTitle(subject.title);
    setEditSubjectCode(subject.code);
    setEditSubjectDesc(subject.description);
    setEditSubjectColor(subject.color || 'emerald');
    setEditSubjectIcon(subject.icon || 'BookOpen');
  };

  const handleSaveEditSubject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSubject || !editSubjectTitle) return;
    const ok = await updateSubject(editingSubject.id, {
      title: editSubjectTitle,
      code: editSubjectCode,
      description: editSubjectDesc,
      color: editSubjectColor,
      icon: editSubjectIcon,
    });
    if (ok) {
      setEditingSubject(null);
    }
  };

  const handleCreateLesson = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLessonTitle || !newLessonSubjectId) return;
    const ok = await addLesson({
      subjectId: newLessonSubjectId,
      title: newLessonTitle,
      excerpt: newLessonExcerpt,
      content: newLessonContent || 'محتوى الدرس النموذجي...',
      summary: newLessonExcerpt,
      isPremium: newLessonIsPremium,
      readingTimeMinutes: Number(newLessonReadingTime) || 10,
      imageUrl: newLessonImageUrl,
      videoUrl: newLessonVideoUrl,
      videoTitle: newLessonVideoTitle,
      videoDuration: newLessonVideoDuration,
    });
    if (ok) {
      setNewLessonTitle('');
      setNewLessonExcerpt('');
      setNewLessonContent('');
      setNewLessonImageUrl('');
      setNewLessonVideoUrl('');
      setNewLessonVideoTitle('');
      setNewLessonVideoDuration('');
      // Refresh lessons
      const res = await fetch('/api/lessons');
      if (res.ok) setAllLessons(await res.json());
    }
  };

  const handleOpenEditLesson = async (lesson: Lesson) => {
    setEditingLesson(lesson);
    setEditLessonTitle(lesson.title);
    setEditLessonSubjectId(lesson.subjectId);
    setEditLessonExcerpt(lesson.excerpt || '');
    setEditLessonQuickSummary(lesson.quickSummary || '');
    setEditLessonReadingTime(lesson.readingTimeMinutes || 10);
    setEditLessonIsPremium(lesson.isPremium);
    setEditLessonImageUrl(lesson.imageUrl || '');
    setEditLessonVideoUrl(lesson.videoUrl || '');
    setEditLessonVideoTitle(lesson.videoTitle || '');
    setEditLessonVideoDuration(lesson.videoDuration || '');

    try {
      const res = await fetch(`/api/lessons/${lesson.id}`);
      if (res.ok) {
        const data = await res.json();
        setEditLessonContent(data.lesson?.content || lesson.content || '');
      } else {
        setEditLessonContent(lesson.content || '');
      }
    } catch {
      setEditLessonContent(lesson.content || '');
    }
  };

  const handleSaveEditLesson = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingLesson || !editLessonTitle) return;
    const ok = await updateLesson(editingLesson.id, {
      title: editLessonTitle,
      subjectId: editLessonSubjectId,
      excerpt: editLessonExcerpt,
      quickSummary: editLessonQuickSummary,
      content: editLessonContent,
      readingTimeMinutes: Number(editLessonReadingTime) || 10,
      isPremium: editLessonIsPremium,
      imageUrl: editLessonImageUrl,
      videoUrl: editLessonVideoUrl,
      videoTitle: editLessonVideoTitle,
      videoDuration: editLessonVideoDuration,
    });
    if (ok) {
      setEditingLesson(null);
      const res = await fetch('/api/lessons');
      if (res.ok) setAllLessons(await res.json());
    }
  };

  const handleCreateSummary = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSumTitle || !newSumSubjectId) return;
    const pts = newSumPoints.split('\n').filter((p) => p.trim().length > 0);
    const ok = await addSummary({
      subjectId: newSumSubjectId,
      title: newSumTitle,
      excerpt: newSumExcerpt,
      keyPoints: pts.length > 0 ? pts : ['أهم قاعدة ومفهوم في الوحدة التعليمية'],
      fullSummary: newSumContent || newSumExcerpt,
      isPremium: newSumIsPremium,
      imageUrl: newSumImageUrl,
      videoUrl: newSumVideoUrl,
    });
    if (ok) {
      setNewSumTitle('');
      setNewSumExcerpt('');
      setNewSumPoints('');
      setNewSumContent('');
      setNewSumImageUrl('');
      setNewSumVideoUrl('');
      const sRes = await fetch('/api/summaries');
      if (sRes.ok) setAllSummaries(await sRes.json());
    }
  };

  const handleOpenEditSummary = (summary: Summary) => {
    setEditingSummary(summary);
    setEditSumTitle(summary.title);
    setEditSumSubjectId(summary.subjectId);
    setEditSumExcerpt(summary.excerpt || '');
    setEditSumPoints((summary.keyPoints || []).join('\n'));
    setEditSumFullText(summary.fullSummary || '');
    setEditSumIsPremium(summary.isPremium);
    setEditSumImageUrl(summary.imageUrl || '');
    setEditSumVideoUrl(summary.videoUrl || '');
  };

  const handleSaveEditSummary = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSummary || !editSumTitle) return;
    const pts = editSumPoints.split('\n').map((p) => p.trim()).filter(Boolean);
    const ok = await updateSummary(editingSummary.id, {
      title: editSumTitle,
      subjectId: editSumSubjectId,
      excerpt: editSumExcerpt,
      keyPoints: pts,
      fullSummary: editSumFullText,
      isPremium: editSumIsPremium,
      imageUrl: editSumImageUrl,
      videoUrl: editSumVideoUrl,
    });
    if (ok) {
      setEditingSummary(null);
      const sRes = await fetch('/api/summaries');
      if (sRes.ok) setAllSummaries(await sRes.json());
    }
  };

  const handleDeleteSummary = async (id: string) => {
    const ok = await deleteSummary(id);
    if (ok) {
      setAllSummaries((prev) => prev.filter((s) => s.id !== id));
    }
  };

  const handleCreatePdf = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPdfTitle || !newPdfSubjectId) return;
    const ok = await addPdf({
      subjectId: newPdfSubjectId,
      title: newPdfTitle,
      description: newPdfDesc,
      fileSize: newPdfSize,
      pagesCount: Number(newPdfPages) || 15,
      isPremium: newPdfIsPremium,
      downloadUrl: `/uploads/pdfs/document-${Date.now()}.pdf`,
    });
    if (ok) {
      setNewPdfTitle('');
      setNewPdfDesc('');
      const pRes = await fetch('/api/pdfs');
      if (pRes.ok) setAllPdfs(await pRes.json());
    }
  };

  const handleDeletePdf = async (id: string) => {
    const ok = await deletePdf(id);
    if (ok) {
      setAllPdfs((prev) => prev.filter((p) => p.id !== id));
    }
  };

  const handleCreateQuiz = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newQuizTitle || !newQuizSubjectId) return;
    const ok = await addQuiz({
      subjectId: newQuizSubjectId,
      title: newQuizTitle,
      description: newQuizDesc,
      durationMinutes: 10,
      passingScore: 60,
      isPremium: newQuizIsPremium,
      questions: [
        {
          id: `q-${Date.now()}-1`,
          questionText: newQ1Text || 'السؤال الأول في المقياس',
          type: 'multiple_choice',
          options: [newQ1OptA || 'الخيار الأول', newQ1OptB || 'الخيار الثاني', newQ1OptC || 'الخيار الثالث'],
          correctAnswer: 0,
          explanation: newQ1Exp || 'توضيح منهجي للإجابة الصحيحة.',
        },
      ],
    });
    if (ok) {
      setNewQuizTitle('');
      setNewQuizDesc('');
      setNewQ1Text('');
      setNewQ1OptA('');
      setNewQ1OptB('');
      setNewQ1OptC('');
      setNewQ1Correct('');
      setNewQ1Exp('');
      const qRes = await fetch('/api/quizzes');
      if (qRes.ok) setAllQuizzes(await qRes.json());
    }
  };

  const handleDeleteQuiz = async (id: string) => {
    const ok = await deleteQuiz(id);
    if (ok) {
      setAllQuizzes((prev) => prev.filter((q) => q.id !== id));
    }
  };

  const handleSendNotification = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!notifTitle || !notifMsg) return;
    const ok = await broadcastNotification(notifTitle, notifMsg);
    if (ok) {
      setNotifTitle('');
      setNotifMsg('');
    }
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    await updatePlatformSettings({
      appName: settingsAppName,
      tagline: settingsTagline,
      logoText: settingsLogoText,
      supportEmail: settingsEmail,
      ccpNumber: settingsCcpNumber,
      ccpKey: settingsCcpKey,
      baridiMobRip: settingsBaridiMobRip,
      accountHolder: settingsAccountHolder,
      contactPhone: settingsContactPhone,
      paymentInstructions: settingsPaymentInstructions,
    });
    showToast('تم حفظ إعدادات المنصة وحسابات الاستقبال بنجاح', 'success');
  };

  const handleApprovePayment = async (id: string) => {
    try {
      const res = await fetch(`/api/admin/payments/${id}/approve`, {
        method: 'POST',
        headers: getAdminHeaders(),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        showToast('تم التحقق من الوصل وتفعيل اشتراك Premium للطالب بنجاح 🎉', 'success');
        fetchAdminData();
      } else {
        showToast(data.error || 'فشلت العملية', 'error');
      }
    } catch (e) {
      showToast('تعذر تأكيد العملية', 'error');
    }
  };

  const handleRejectPayment = async (id: string) => {
    try {
      const res = await fetch(`/api/admin/payments/${id}/reject`, {
        method: 'POST',
        headers: getAdminHeaders(),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        showToast('تم رفض طلب التحويل', 'info');
        fetchAdminData();
      } else {
        showToast(data.error || 'فشلت العملية', 'error');
      }
    } catch (e) {
      showToast('تعذر رفض العملية', 'error');
    }
  };

  const handleToggleUserPremium = async (userId: string, currentStatus: string) => {
    const nextStatus = currentStatus === 'premium' ? 'free' : 'premium';
    try {
      const res = await fetch(`/api/admin/users/${userId}/subscription`, {
        method: 'PUT',
        headers: { ...getAdminHeaders(), 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: nextStatus,
          expiresAt: nextStatus === 'premium' ? '2026-06-30T00:00:00.000Z' : null,
        }),
      });
      if (res.ok) {
        showToast(
          nextStatus === 'premium' ? 'تم منح اشتراك Premium للطالب بنجاح' : 'تم تخفيض الحساب إلى مجاني',
          'info'
        );
        const uRes = await fetch('/api/admin/users', { headers: getAdminHeaders() });
        if (uRes.ok) setUsersList(await uRes.json());
      }
    } catch (e) {
      showToast('تعذر تحديث اشتراك المستخدم', 'error');
    }
  };

  return (
    <div id="admin-dashboard-page" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Non-admin notice with 1-click upgrade button */}
      {currentUser.role !== 'admin' && (
        <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-amber-900 dark:text-amber-200 text-xs">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0" />
            <span>
              أنت تتصفح حالياً بحساب (<strong className="font-bold">{currentUser.name}</strong> - {currentUser.email}). تم تفعيل وضع الإدارة بالكامل في هذه اللوحة.
            </span>
          </div>
          <button
            onClick={async () => {
              await switchDemoUser('admin', 'premium');
              await fetchAdminData();
              showToast('تم التبديل لحساب المشرفة Admin وتأكيد الصلاحيات', 'success');
            }}
            className="px-4 py-2 rounded-xl font-bold bg-amber-600 hover:bg-amber-700 text-white transition-colors cursor-pointer shrink-0 shadow-xs"
          >
            التبديل لحساب المشرفة Admin
          </button>
        </div>
      )}

      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-stone-200 dark:border-stone-800 pb-6">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 mb-2">
            <ShieldCheck className="w-4 h-4" />
            <span>لوحة تحكم الإدارة الكاملة (Admin Portal)</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold text-stone-900 dark:text-stone-100 tracking-tight">
            إدارة منصة أستاذي
          </h1>
          <p className="text-xs sm:text-sm text-stone-600 dark:text-stone-400 mt-1">
            تحكم كامل في المقاييس، الدروس، المذكرات، أسعار الاشتراكات، وحسابات الطلبة.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-bold px-3 py-1.5 rounded-lg bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300">
            المشرفة: {currentUser.name}
          </span>
          <button
            onClick={() => navigateTo('home')}
            className="px-4 py-2 rounded-xl text-xs font-bold bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-700 dark:text-stone-200 hover:bg-stone-50 transition-colors"
          >
            معاينة الموقع كطالب
          </button>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="border-b border-stone-200 dark:border-stone-800 overflow-x-auto">
        <div className="flex gap-2 sm:gap-4 pb-1 text-xs sm:text-sm font-bold whitespace-nowrap">
          <button
            onClick={() => setActiveTab('overview')}
            className={`pb-3 px-2.5 border-b-2 transition-all ${
              activeTab === 'overview'
                ? 'border-emerald-600 text-emerald-600 dark:text-emerald-400'
                : 'border-transparent text-stone-500 hover:text-stone-800'
            }`}
          >
            نظرة عامة وإحصائيات
          </button>
          <button
            onClick={() => setActiveTab('subjects')}
            className={`pb-3 px-2.5 border-b-2 transition-all ${
              activeTab === 'subjects'
                ? 'border-emerald-600 text-emerald-600 dark:text-emerald-400'
                : 'border-transparent text-stone-500 hover:text-stone-800'
            }`}
          >
            إدارة المقاييس ({subjects.length})
          </button>
          <button
            onClick={() => setActiveTab('lessons')}
            className={`pb-3 px-2.5 border-b-2 transition-all ${
              activeTab === 'lessons'
                ? 'border-emerald-600 text-emerald-600 dark:text-emerald-400'
                : 'border-transparent text-stone-500 hover:text-stone-800'
            }`}
          >
            إدارة الدروس ({allLessons.length})
          </button>
          <button
            onClick={() => setActiveTab('summaries')}
            className={`pb-3 px-2.5 border-b-2 transition-all ${
              activeTab === 'summaries'
                ? 'border-emerald-600 text-emerald-600 dark:text-emerald-400'
                : 'border-transparent text-stone-500 hover:text-stone-800'
            }`}
          >
            الملخصات
          </button>
          <button
            onClick={() => setActiveTab('pdfs')}
            className={`pb-3 px-2.5 border-b-2 transition-all ${
              activeTab === 'pdfs'
                ? 'border-emerald-600 text-emerald-600 dark:text-emerald-400'
                : 'border-transparent text-stone-500 hover:text-stone-800'
            }`}
          >
            ملفات PDF
          </button>
          <button
            onClick={() => setActiveTab('quizzes')}
            className={`pb-3 px-2.5 border-b-2 transition-all ${
              activeTab === 'quizzes'
                ? 'border-emerald-600 text-emerald-600 dark:text-emerald-400'
                : 'border-transparent text-stone-500 hover:text-stone-800'
            }`}
          >
            بنك الاختبارات
          </button>
          <button
            onClick={() => setActiveTab('pricing')}
            className={`pb-3 px-2.5 border-b-2 transition-all ${
              activeTab === 'pricing'
                ? 'border-emerald-600 text-emerald-600 dark:text-emerald-400'
                : 'border-transparent text-stone-500 hover:text-stone-800'
            }`}
          >
            الأسعار والباقات
          </button>
          <button
            onClick={() => setActiveTab('payments')}
            className={`pb-3 px-2.5 border-b-2 transition-all flex items-center gap-1.5 ${
              activeTab === 'payments'
                ? 'border-emerald-600 text-emerald-600 dark:text-emerald-400'
                : 'border-transparent text-stone-500 hover:text-stone-800'
            }`}
          >
            <span>طلبات الاشتراكات والتحويلات</span>
            {paymentsList.filter((p) => p.status === 'pending').length > 0 && (
              <span className="bg-amber-500 text-white text-[10px] font-black px-1.5 py-0.5 rounded-full">
                {paymentsList.filter((p) => p.status === 'pending').length}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('users')}
            className={`pb-3 px-2.5 border-b-2 transition-all ${
              activeTab === 'users'
                ? 'border-emerald-600 text-emerald-600 dark:text-emerald-400'
                : 'border-transparent text-stone-500 hover:text-stone-800'
            }`}
          >
            الطلاب والمشتركين ({usersList.length})
          </button>
          <button
            onClick={() => setActiveTab('notifications')}
            className={`pb-3 px-2.5 border-b-2 transition-all ${
              activeTab === 'notifications'
                ? 'border-emerald-600 text-emerald-600 dark:text-emerald-400'
                : 'border-transparent text-stone-500 hover:text-stone-800'
            }`}
          >
            إرسال إشعارات
          </button>
          <button
            onClick={() => setActiveTab('settings')}
            className={`pb-3 px-2.5 border-b-2 transition-all ${
              activeTab === 'settings'
                ? 'border-emerald-600 text-emerald-600 dark:text-emerald-400'
                : 'border-transparent text-stone-500 hover:text-stone-800'
            }`}
          >
            إعدادات المنصة
          </button>
        </div>
      </div>

      {/* 1. Overview Tab */}
      {activeTab === 'overview' && (
        <div className="space-y-8">
          {/* Key Metrics Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="p-5 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200/80 dark:border-stone-800 shadow-sm">
              <span className="text-xs text-stone-400 font-bold block mb-1">إجمالي الطلاب المسجلين</span>
              <span className="text-2xl sm:text-3xl font-black text-stone-900 dark:text-stone-100">
                {metrics?.totalUsers ?? usersList.length}
              </span>
              <span className="text-[11px] text-emerald-600 font-semibold block mt-1">+18 طالب هذا الأسبوع</span>
            </div>

            <div className="p-5 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200/80 dark:border-stone-800 shadow-sm">
              <span className="text-xs text-stone-400 font-bold block mb-1">المشتركين في Premium</span>
              <span className="text-2xl sm:text-3xl font-black text-amber-600 dark:text-amber-400">
                {metrics?.premiumUsers ?? metrics?.premiumSubscribers ?? usersList.filter((u) => u.subscriptionStatus === 'premium').length}
              </span>
              <span className="text-[11px] text-amber-600 font-semibold block mt-1">
                {usersList.length > 0 ? `نسبة التحويل ${Math.round((usersList.filter((u) => u.subscriptionStatus === 'premium').length / usersList.length) * 100)}%` : 'نسبة التحويل 34%'}
              </span>
            </div>

            <div className="p-5 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200/80 dark:border-stone-800 shadow-sm">
              <span className="text-xs text-stone-400 font-bold block mb-1">إجمالي الإيرادات (DZD)</span>
              <span className="text-2xl sm:text-3xl font-black text-emerald-600 dark:text-emerald-400">
                {(metrics?.totalRevenueDzd ?? metrics?.estimatedRevenueDzd ?? 142600).toLocaleString('ar-DZ')} دج
              </span>
              <span className="text-[11px] text-stone-400 font-medium block mt-1">مدفوعات الذهبية، بريدي موب و CCP</span>
            </div>

            <div className="p-5 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200/80 dark:border-stone-800 shadow-sm">
              <span className="text-xs text-stone-400 font-bold block mb-1">المحتوى الأكاديمي</span>
              <span className="text-2xl sm:text-3xl font-black text-teal-600 dark:text-teal-400">
                {subjects.length} مقاييس
              </span>
              <span className="text-[11px] text-teal-600 font-semibold block mt-1">
                {metrics?.totalLessons ?? allLessons.length} دروس منشورة
              </span>
            </div>
          </div>

          {/* Recent Payment Transactions */}
          <div className="bg-white dark:bg-stone-900 rounded-3xl border border-stone-200/80 dark:border-stone-800 p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-stone-900 dark:text-stone-100">
                أحدث عمليات الدفع والاشتراكات (Algerian Dinar)
              </h3>
              <button
                onClick={() => setActiveTab('payments')}
                className="text-xs font-bold text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 cursor-pointer"
              >
                عرض كل التحويلات ({paymentsList.length}) ←
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-right text-xs">
                <thead>
                  <tr className="border-b border-stone-200 dark:border-stone-800 text-stone-400">
                    <th className="py-3 px-3">رقم العملية</th>
                    <th className="py-3 px-3">الطالب</th>
                    <th className="py-3 px-3">الباقة</th>
                    <th className="py-3 px-3">المبلغ</th>
                    <th className="py-3 px-3">طريقة الدفع</th>
                    <th className="py-3 px-3">الحالة</th>
                    <th className="py-3 px-3">التاريخ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100 dark:divide-stone-800/60">
                  {((metrics?.recentTransactions && metrics.recentTransactions.length > 0)
                    ? metrics.recentTransactions
                    : paymentsList.map((p) => ({
                        id: p.id,
                        userName: p.userName || p.userEmail,
                        planName: p.planName,
                        amountDzd: p.amountDzd,
                        paymentMethod: p.method,
                        createdAt: p.createdAt ? new Date(p.createdAt).toLocaleDateString('ar-DZ') : 'الآن',
                      }))
                  ).slice(0, 10).map((tx) => (
                    <tr key={tx.id} className="hover:bg-stone-50/50 dark:hover:bg-stone-800/30">
                      <td className="py-3 px-3 font-mono text-stone-500">{tx.id}</td>
                      <td className="py-3 px-3 font-bold text-stone-900 dark:text-stone-100">{tx.userName}</td>
                      <td className="py-3 px-3">{tx.planName}</td>
                      <td className="py-3 px-3 font-bold text-emerald-600">{Number(tx.amountDzd).toLocaleString('ar-DZ')} دج</td>
                      <td className="py-3 px-3">
                        <span className="px-2 py-0.5 rounded bg-stone-100 dark:bg-stone-800 font-medium">
                          {tx.paymentMethod === 'edahabia' || tx.paymentMethod === 'Edahabia'
                            ? 'البطاقة الذهبية'
                            : tx.paymentMethod === 'CIB'
                            ? 'CIB البنكية'
                            : tx.paymentMethod === 'BaridiMob'
                            ? 'بريدي موب (RIP)'
                            : tx.paymentMethod === 'CCP'
                            ? 'حوالة CCP'
                            : tx.paymentMethod || 'بطاقة بنكية'}
                        </span>
                      </td>
                      <td className="py-3 px-3">
                        <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 font-bold">
                          مكتمل ومفعل
                        </span>
                      </td>
                      <td className="py-3 px-3 text-stone-400">{tx.createdAt}</td>
                    </tr>
                  ))}
                  {(!metrics?.recentTransactions?.length && !paymentsList.length) && (
                    <tr>
                      <td colSpan={7} className="py-6 text-center text-stone-400">
                        لا توجد تحويلات مالية مسجلة بعد
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* 2. Subjects Management */}
      {activeTab === 'subjects' && (
        <div className="space-y-6">
          {/* Add Subject Form */}
          <div className="p-6 rounded-3xl bg-white dark:bg-stone-900 border border-stone-200/80 dark:border-stone-800 shadow-sm space-y-4">
            <h3 className="text-base font-bold text-stone-900 dark:text-stone-100 flex items-center gap-2">
              <Plus className="w-5 h-5 text-emerald-600" />
              <span>إضافة مقياس دراسي جديد</span>
            </h3>
            <form onSubmit={handleCreateSubject} className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <div>
                <label className="block font-bold mb-1">اسم المقياس:</label>
                <input
                  type="text"
                  required
                  value={newSubjectTitle}
                  onChange={(e) => setNewSubjectTitle(e.target.value)}
                  placeholder="مثال: البلاغة العربية ومناهج النقد"
                  className="w-full p-2.5 rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800"
                />
              </div>
              <div>
                <label className="block font-bold mb-1">الرمز الأكاديمي:</label>
                <input
                  type="text"
                  value={newSubjectCode}
                  onChange={(e) => setNewSubjectCode(e.target.value)}
                  placeholder="مثال: BALAGHA-101"
                  className="w-full p-2.5 rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800"
                />
              </div>
              <div>
                <label className="block font-bold mb-1">وصف مختصر:</label>
                <input
                  type="text"
                  value={newSubjectDesc}
                  onChange={(e) => setNewSubjectDesc(e.target.value)}
                  placeholder="مقرر السداسي الأول لطلبة التعليم الابتدائي"
                  className="w-full p-2.5 rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800"
                />
              </div>
              <div className="sm:col-span-3 flex justify-end">
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl font-bold bg-emerald-600 hover:bg-emerald-700 text-white transition-colors"
                >
                  حفظ ونشر المقياس
                </button>
              </div>
            </form>
          </div>

          {/* Subjects Table */}
          <div className="bg-white dark:bg-stone-900 rounded-3xl border border-stone-200/80 dark:border-stone-800 p-6 shadow-sm">
            <h3 className="text-base font-bold text-stone-900 dark:text-stone-100 mb-4">
              المقاييس الحالية ({subjects.length})
            </h3>
            <div className="divide-y divide-stone-100 dark:divide-stone-800 text-xs">
              {subjects.map((s) => (
                <div key={s.id} className="py-3 flex items-center justify-between gap-4">
                  <div>
                    <span className="font-mono text-stone-400 ml-2">{s.code}</span>
                    <span className="font-bold text-stone-900 dark:text-stone-100 text-sm">{s.title}</span>
                    <p className="text-stone-500 text-[11px] mt-0.5">{s.description}</p>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-stone-400 text-[11px] hidden sm:inline">
                      {s.lessonsCount} درس • {s.quizzesCount} اختبار
                    </span>
                    <button
                      onClick={() => handleOpenEditSubject(s)}
                      className="p-2 text-stone-600 dark:text-stone-300 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 rounded-xl transition-colors flex items-center gap-1 font-bold text-xs"
                      title="تعديل بيانات المقياس"
                    >
                      <Edit3 className="w-4 h-4" />
                      <span className="hidden sm:inline">تعديل</span>
                    </button>
                    <button
                      onClick={() => deleteSubject(s.id)}
                      className="p-2 text-stone-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-xl transition-colors"
                      title="حذف المقياس"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Edit Subject Modal */}
          {editingSubject && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
              <div className="bg-white dark:bg-stone-900 rounded-3xl border border-stone-200 dark:border-stone-800 p-6 max-w-lg w-full shadow-2xl space-y-4 text-right">
                <div className="flex items-center justify-between pb-3 border-b border-stone-100 dark:border-stone-800">
                  <h3 className="text-base font-bold text-stone-900 dark:text-stone-100 flex items-center gap-2">
                    <Edit3 className="w-5 h-5 text-emerald-600" />
                    <span>تعديل بيانات المقياس الدراسي</span>
                  </h3>
                  <button
                    onClick={() => setEditingSubject(null)}
                    className="p-1.5 text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 rounded-xl hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <form onSubmit={handleSaveEditSubject} className="space-y-4 text-xs">
                  <div>
                    <label className="block font-bold mb-1">اسم المقياس الدراسي:</label>
                    <input
                      type="text"
                      required
                      value={editSubjectTitle}
                      onChange={(e) => setEditSubjectTitle(e.target.value)}
                      className="w-full p-2.5 rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 font-bold"
                    />
                  </div>

                  <div>
                    <label className="block font-bold mb-1">الرمز الأكاديمي:</label>
                    <input
                      type="text"
                      required
                      value={editSubjectCode}
                      onChange={(e) => setEditSubjectCode(e.target.value)}
                      className="w-full p-2.5 rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 font-mono"
                    />
                  </div>

                  <div>
                    <label className="block font-bold mb-1">الوصف والمقرر البيداغوجي:</label>
                    <textarea
                      rows={3}
                      value={editSubjectDesc}
                      onChange={(e) => setEditSubjectDesc(e.target.value)}
                      className="w-full p-2.5 rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 leading-relaxed"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block font-bold mb-1">السمة اللونية:</label>
                      <select
                        value={editSubjectColor}
                        onChange={(e) => setEditSubjectColor(e.target.value)}
                        className="w-full p-2.5 rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800"
                      >
                        <option value="emerald">أخضر زمردي (Emerald)</option>
                        <option value="amber">عنبري ذهبي (Amber)</option>
                        <option value="purple">أرجواني (Purple)</option>
                        <option value="rose">وردي (Rose)</option>
                        <option value="blue">أزرق سماوي (Blue)</option>
                        <option value="indigo">نيلي (Indigo)</option>
                        <option value="teal">فيروزي (Teal)</option>
                      </select>
                    </div>
                    <div>
                      <label className="block font-bold mb-1">الأيقونة المعتمدة:</label>
                      <select
                        value={editSubjectIcon}
                        onChange={(e) => setEditSubjectIcon(e.target.value)}
                        className="w-full p-2.5 rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800"
                      >
                        <option value="BookOpen">كتاب مفتوح (BookOpen)</option>
                        <option value="Feather">ريشة (Feather)</option>
                        <option value="Sparkles">بريق (Sparkles)</option>
                        <option value="Scroll">مخطوطة (Scroll)</option>
                        <option value="PenTool">قلم (PenTool)</option>
                        <option value="GraduationCap">قبعة تخرج (GraduationCap)</option>
                        <option value="Award">وسام (Award)</option>
                      </select>
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-3 border-t border-stone-100 dark:border-stone-800">
                    <button
                      type="button"
                      onClick={() => setEditingSubject(null)}
                      className="px-4 py-2 rounded-xl text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 font-bold"
                    >
                      إلغاء
                    </button>
                    <button
                      type="submit"
                      className="px-5 py-2 rounded-xl font-bold bg-emerald-600 hover:bg-emerald-700 text-white transition-colors"
                    >
                      حفظ التعديلات
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      )}

      {/* 3. Lessons Management */}
      {activeTab === 'lessons' && (
        <div className="space-y-6">
          {/* Add Lesson Form */}
          <div className="p-6 rounded-3xl bg-white dark:bg-stone-900 border border-stone-200/80 dark:border-stone-800 shadow-sm space-y-4">
            <h3 className="text-base font-bold text-stone-900 dark:text-stone-100 flex items-center gap-2">
              <Plus className="w-5 h-5 text-emerald-600" />
              <span>إضافة درس منهجي جديد</span>
            </h3>
            <form onSubmit={handleCreateLesson} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block font-bold mb-1">المقياس التابع له:</label>
                  <select
                    value={newLessonSubjectId}
                    onChange={(e) => setNewLessonSubjectId(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 font-medium"
                  >
                    {subjects.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.title}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-bold mb-1">عنوان الدرس:</label>
                  <input
                    type="text"
                    required
                    value={newLessonTitle}
                    onChange={(e) => setNewLessonTitle(e.target.value)}
                    placeholder="مثال: بناء الجملة الفعلية وإعراب الفاعل"
                    className="w-full p-2.5 rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800"
                  />
                </div>
                <div>
                  <label className="block font-bold mb-1">مدة القراءة (بالدقائق):</label>
                  <input
                    type="number"
                    value={newLessonReadingTime}
                    onChange={(e) => setNewLessonReadingTime(Number(e.target.value))}
                    className="w-full p-2.5 rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold mb-1">مقدمة أو ملخص قصير للدرس:</label>
                <input
                  type="text"
                  value={newLessonExcerpt}
                  onChange={(e) => setNewLessonExcerpt(e.target.value)}
                  placeholder="شرح مدخل عام للقواعد والأهداف البيداغوجية..."
                  className="w-full p-2.5 rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800"
                />
              </div>

              <div>
                <label className="block font-bold mb-1">محتوى الدرس الكامل (نصوص، عناوين، وفقرات):</label>
                <textarea
                  rows={4}
                  value={newLessonContent}
                  onChange={(e) => setNewLessonContent(e.target.value)}
                  placeholder="اكتب تفاصيل الدرس وأمثلة الإعراب والتطبيقات الصفية..."
                  className="w-full p-2.5 rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800"
                />
              </div>

              {/* Media Upload Section for Lesson */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 rounded-2xl bg-stone-50/80 dark:bg-stone-800/50 border border-stone-200/80 dark:border-stone-700/80">
                <MediaUpload
                  label="صورة توضيحية أو غلاف للدرس"
                  type="image"
                  category="lessons"
                  value={newLessonImageUrl}
                  onChange={setNewLessonImageUrl}
                  helperText="ارفع صورة توضيحية، مخططاً ذهنياً، أو صورة تعبيرية للدرس"
                />

                <div className="space-y-3">
                  <MediaUpload
                    label="فيديو الدرس أو المحاضرة المرئية"
                    type="video"
                    category="videos"
                    value={newLessonVideoUrl}
                    onChange={setNewLessonVideoUrl}
                    helperText="ارفع ملف فيديو MP4 أو ضع رابط يوتيوب / فيميو مباشر"
                  />
                  {newLessonVideoUrl && (
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="text"
                        placeholder="عنوان الفيديو (اختياري)"
                        value={newLessonVideoTitle}
                        onChange={(e) => setNewLessonVideoTitle(e.target.value)}
                        className="p-2 rounded-lg border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-900 text-[11px]"
                      />
                      <input
                        type="text"
                        placeholder="المدة (مثال: 12:45)"
                        value={newLessonVideoDuration}
                        onChange={(e) => setNewLessonVideoDuration(e.target.value)}
                        className="p-2 rounded-lg border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-900 text-[11px]"
                      />
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 font-bold cursor-pointer">
                  <input
                    type="checkbox"
                    checked={newLessonIsPremium}
                    onChange={(e) => setNewLessonIsPremium(e.target.checked)}
                    className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500"
                  />
                  <span>درس حصري لأعضاء Premium 🔒 (يحجب عن المستخدمين المجانيين)</span>
                </label>

                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl font-bold bg-emerald-600 hover:bg-emerald-700 text-white transition-colors"
                >
                  نشر الدرس
                </button>
              </div>
            </form>
          </div>

          {/* Lessons List */}
          <div className="bg-white dark:bg-stone-900 rounded-3xl border border-stone-200/80 dark:border-stone-800 p-6 shadow-sm space-y-3">
            <h3 className="text-base font-bold text-stone-900 dark:text-stone-100 mb-2">
              الدروس المسجلة في المنصة ({allLessons.length})
            </h3>
            <div className="divide-y divide-stone-100 dark:divide-stone-800 text-xs">
              {allLessons.map((l) => (
                <div key={l.id} className="py-3 flex items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span className="font-bold text-stone-900 dark:text-stone-100 text-sm">{l.title}</span>
                      {l.isPremium ? (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300">
                          Premium 🔒
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                          Free مجاني
                        </span>
                      )}
                      {l.imageUrl && (
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-blue-50 text-blue-700 dark:bg-blue-950/50 dark:text-blue-300 flex items-center gap-1" title="يحتوي على صورة توضيحية">
                          <ImageIcon className="w-3 h-3" />
                          <span>صورة</span>
                        </span>
                      )}
                      {l.videoUrl && (
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-rose-50 text-rose-700 dark:bg-rose-950/50 dark:text-rose-300 flex items-center gap-1" title="يحتوي على فيديو أو محاضرة مرئية">
                          <Video className="w-3 h-3" />
                          <span>فيديو</span>
                        </span>
                      )}
                    </div>
                    <p className="text-stone-500 text-[11px] line-clamp-1">{l.excerpt}</p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleOpenEditLesson(l)}
                      className="px-3 py-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 font-bold hover:bg-emerald-100 dark:hover:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300 flex items-center gap-1 transition-colors"
                      title="تعديل محتوى هذا الدرس"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      <span>تعديل</span>
                    </button>
                    <button
                      onClick={() => navigateTo('lesson-detail', { lessonId: l.id })}
                      className="px-3 py-1.5 rounded-lg bg-stone-100 dark:bg-stone-800 font-bold hover:bg-stone-200 text-stone-700 dark:text-stone-200"
                    >
                      معاينة
                    </button>
                    <button
                      onClick={async () => {
                        if (!window.confirm('هل أنت متأكد من رغبتك في حذف هذا الدرس نهائياً؟')) return;
                        await deleteLesson(l.id);
                        const res = await fetch('/api/lessons');
                        if (res.ok) setAllLessons(await res.json());
                      }}
                      className="p-1.5 text-stone-400 hover:text-rose-600 rounded-lg transition-colors"
                      title="حذف الدرس"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Edit Lesson Modal */}
          {editingLesson && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
              <div className="bg-white dark:bg-stone-900 rounded-3xl border border-stone-200 dark:border-stone-800 p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl space-y-4 text-right">
                <div className="flex items-center justify-between pb-3 border-b border-stone-100 dark:border-stone-800 sticky top-0 bg-white dark:bg-stone-900 z-10">
                  <div>
                    <h3 className="text-base font-bold text-stone-900 dark:text-stone-100 flex items-center gap-2">
                      <Edit3 className="w-5 h-5 text-emerald-600" />
                      <span>تعديل محتوى الدرس الأكاديمي</span>
                    </h3>
                    <p className="text-xs text-stone-500 mt-0.5">
                      تحكم كامل في عنوان الدرس ومحتواه وشروحاته ومقياسه التابع له.
                    </p>
                  </div>
                  <button
                    onClick={() => setEditingLesson(null)}
                    className="p-1.5 text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 rounded-xl hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <form onSubmit={handleSaveEditLesson} className="space-y-4 text-xs">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block font-bold mb-1">المقياس التابع له الدرس:</label>
                      <select
                        value={editLessonSubjectId}
                        onChange={(e) => setEditLessonSubjectId(e.target.value)}
                        className="w-full p-2.5 rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 font-medium"
                      >
                        {subjects.map((s) => (
                          <option key={s.id} value={s.id}>
                            {s.title}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block font-bold mb-1">عنوان الدرس الأكاديمي:</label>
                      <input
                        type="text"
                        required
                        value={editLessonTitle}
                        onChange={(e) => setEditLessonTitle(e.target.value)}
                        className="w-full p-2.5 rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
                    <div>
                      <label className="block font-bold mb-1">وقت القراءة التقديري (بالدقائق):</label>
                      <input
                        type="number"
                        min="1"
                        max="120"
                        value={editLessonReadingTime}
                        onChange={(e) => setEditLessonReadingTime(Number(e.target.value))}
                        className="w-full p-2.5 rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800"
                      />
                    </div>

                    <div className="pt-4">
                      <label className="flex items-center gap-2 font-bold cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={editLessonIsPremium}
                          onChange={(e) => setEditLessonIsPremium(e.target.checked)}
                          className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500"
                        />
                        <span className="text-stone-800 dark:text-stone-200">
                          محتوى مدفوع (حصري لأعضاء باقة Premium 🔒)
                        </span>
                      </label>
                    </div>
                  </div>

                  <div>
                    <label className="block font-bold mb-1">المقتطف والوصف المختصر (Excerpt):</label>
                    <textarea
                      rows={2}
                      value={editLessonExcerpt}
                      onChange={(e) => setEditLessonExcerpt(e.target.value)}
                      placeholder="نبذة سريعة تظهر في بطاقة الدرس قبل الدخول..."
                      className="w-full p-2.5 rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800"
                    />
                  </div>

                  <div>
                    <label className="block font-bold mb-1">التلخيص السريع (Quick Summary):</label>
                    <textarea
                      rows={2}
                      value={editLessonQuickSummary}
                      onChange={(e) => setEditLessonQuickSummary(e.target.value)}
                      placeholder="خلاصة موجزة ومفيدة في سطرين..."
                      className="w-full p-2.5 rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800"
                    />
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="block font-bold">محتوى وشروحات الدرس الكاملة:</label>
                      <span className="text-[10px] text-stone-400">
                        يدعم تنسيقات العناوين (## و ###)، القوائم (*)، والاقتباسات (&gt;)
                      </span>
                    </div>
                    <textarea
                      rows={8}
                      value={editLessonContent}
                      onChange={(e) => setEditLessonContent(e.target.value)}
                      placeholder="اكتب هنا محتوى وشرح الدرس بالكامل مع الأمثلة والقواعد..."
                      className="w-full p-3 rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 font-mono text-xs leading-relaxed"
                    />
                  </div>

                  {/* Media Upload Section for Editing Lesson */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 rounded-2xl bg-stone-50/80 dark:bg-stone-800/50 border border-stone-200/80 dark:border-stone-700/80">
                    <MediaUpload
                      label="صورة توضيحية أو غلاف للدرس"
                      type="image"
                      category="lessons"
                      value={editLessonImageUrl}
                      onChange={setEditLessonImageUrl}
                      helperText="ارفع صورة توضيحية، مخططاً ذهنياً، أو صورة تعبيرية للدرس"
                    />

                    <div className="space-y-3">
                      <MediaUpload
                        label="فيديو الدرس أو المحاضرة المرئية"
                        type="video"
                        category="videos"
                        value={editLessonVideoUrl}
                        onChange={setEditLessonVideoUrl}
                        helperText="ارفع ملف فيديو MP4 أو ضع رابط يوتيوب / فيميو مباشر"
                      />
                      {editLessonVideoUrl && (
                        <div className="grid grid-cols-2 gap-2">
                          <input
                            type="text"
                            placeholder="عنوان الفيديو (اختياري)"
                            value={editLessonVideoTitle}
                            onChange={(e) => setEditLessonVideoTitle(e.target.value)}
                            className="p-2 rounded-lg border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-900 text-[11px]"
                          />
                          <input
                            type="text"
                            placeholder="المدة (مثال: 12:45)"
                            value={editLessonVideoDuration}
                            onChange={(e) => setEditLessonVideoDuration(e.target.value)}
                            className="p-2 rounded-lg border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-900 text-[11px]"
                          />
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex justify-end gap-3 pt-3 border-t border-stone-100 dark:border-stone-800">
                    <button
                      type="button"
                      onClick={() => setEditingLesson(null)}
                      className="px-4 py-2 rounded-xl border border-stone-200 dark:border-stone-700 text-stone-600 dark:text-stone-300 font-bold hover:bg-stone-50 dark:hover:bg-stone-800 transition-colors"
                    >
                      إلغاء
                    </button>
                    <button
                      type="submit"
                      className="px-6 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold transition-colors shadow-xs"
                    >
                      حفظ وتحديث الدرس
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      )}

      {/* 4. Summaries Management */}
      {activeTab === 'summaries' && (
        <div className="space-y-6">
          <div className="p-6 rounded-3xl bg-white dark:bg-stone-900 border border-stone-200/80 dark:border-stone-800 shadow-sm space-y-4">
            <h3 className="text-base font-bold text-stone-900 dark:text-stone-100 flex items-center gap-2">
              <Plus className="w-5 h-5 text-emerald-600" />
              <span>إضافة ملخص مراجعة جديد</span>
            </h3>
            <form onSubmit={handleCreateSummary} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold mb-1">المقياس:</label>
                  <select
                    value={newSumSubjectId}
                    onChange={(e) => setNewSumSubjectId(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 font-medium"
                  >
                    {subjects.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.title}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-bold mb-1">عنوان الملخص:</label>
                  <input
                    type="text"
                    required
                    value={newSumTitle}
                    onChange={(e) => setNewSumTitle(e.target.value)}
                    placeholder="مثال: خريطة ذهنية لقواعد الإعلال والإبدال"
                    className="w-full p-2.5 rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold mb-1">الوصف المختصر للملخص:</label>
                <input
                  type="text"
                  value={newSumExcerpt}
                  onChange={(e) => setNewSumExcerpt(e.target.value)}
                  placeholder="موجز يصف محتوى هذا الملخص..."
                  className="w-full p-2.5 rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800"
                />
              </div>

              <div>
                <label className="block font-bold mb-1">النقاط الرئيسية (كل نقطة في سطر):</label>
                <textarea
                  rows={3}
                  value={newSumPoints}
                  onChange={(e) => setNewSumPoints(e.target.value)}
                  placeholder="مفهوم الإعلال بالنقل&#10;شروط قلب الواو ياءً&#10;أمثلة نموذجية في الامتحانات"
                  className="w-full p-2.5 rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800"
                />
              </div>

              <div>
                <label className="block font-bold mb-1">المحتوى الكامل والشرح المركز للملخص:</label>
                <textarea
                  rows={4}
                  value={newSumContent}
                  onChange={(e) => setNewSumContent(e.target.value)}
                  placeholder="اكتب تفاصيل الملخص والقواعد الأساسية والشرح الشامل..."
                  className="w-full p-2.5 rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800"
                />
              </div>

              {/* Media Upload Section for Summary */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 rounded-2xl bg-stone-50/80 dark:bg-stone-800/50 border border-stone-200/80 dark:border-stone-700/80">
                <MediaUpload
                  label="صورة الملخص أو الخريطة الذهنية"
                  type="image"
                  category="summaries"
                  value={newSumImageUrl}
                  onChange={setNewSumImageUrl}
                  helperText="ارفع صورة خريطة ذهنية، مخطط تلخيصي، أو جدول قواعد"
                />

                <MediaUpload
                  label="فيديو الشرح المركز للملخص"
                  type="video"
                  category="videos"
                  value={newSumVideoUrl}
                  onChange={setNewSumVideoUrl}
                  helperText="ارفع فيديو مراجعة مركزة أو ضع رابط يوتيوب للملخص"
                />
              </div>

              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 font-bold cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={newSumIsPremium}
                    onChange={(e) => setNewSumIsPremium(e.target.checked)}
                    className="w-4 h-4 rounded text-emerald-600"
                  />
                  <span>ملخص حصري لأعضاء Premium 🔒</span>
                </label>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl font-bold bg-emerald-600 hover:bg-emerald-700 text-white transition-colors"
                >
                  حفظ ونشر الملخص
                </button>
              </div>
            </form>
          </div>

          {/* Summaries List */}
          <div className="bg-white dark:bg-stone-900 rounded-3xl border border-stone-200/80 dark:border-stone-800 p-6 shadow-sm space-y-3">
            <h3 className="text-base font-bold text-stone-900 dark:text-stone-100 mb-2">
              الملخصات المسجلة في المنصة ({allSummaries.length})
            </h3>
            {allSummaries.length === 0 ? (
              <p className="text-stone-500 text-xs py-4 text-center">لا توجد ملخصات مسجلة حالياً.</p>
            ) : (
              <div className="divide-y divide-stone-100 dark:divide-stone-800 text-xs">
                {allSummaries.map((s) => {
                  const subj = subjects.find((sub) => sub.id === s.subjectId);
                  return (
                    <div key={s.id} className="py-3 flex items-center justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <span className="font-bold text-stone-900 dark:text-stone-100 text-sm">{s.title}</span>
                          {subj && (
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300">
                              {subj.title}
                            </span>
                          )}
                          {s.isPremium ? (
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300">
                              Premium 🔒
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                              Free مجاني
                            </span>
                          )}
                          {s.imageUrl && (
                            <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-blue-50 text-blue-700 dark:bg-blue-950/50 dark:text-blue-300 flex items-center gap-1" title="يحتوي على صورة أو خريطة ذهنية">
                              <ImageIcon className="w-3 h-3" />
                              <span>صورة</span>
                            </span>
                          )}
                          {s.videoUrl && (
                            <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-rose-50 text-rose-700 dark:bg-rose-950/50 dark:text-rose-300 flex items-center gap-1" title="يحتوي على فيديو مراجعة">
                              <Video className="w-3 h-3" />
                              <span>فيديو</span>
                            </span>
                          )}
                        </div>
                        <p className="text-stone-500 text-[11px] line-clamp-1">{s.excerpt}</p>
                        {s.keyPoints && s.keyPoints.length > 0 && (
                          <p className="text-stone-400 text-[10px] mt-0.5">{s.keyPoints.length} نقاط رئيسية</p>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleOpenEditSummary(s)}
                          className="px-3 py-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 font-bold hover:bg-emerald-100 dark:hover:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300 flex items-center gap-1 transition-colors"
                          title="تعديل محتوى هذا الملخص"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                          <span>تعديل</span>
                        </button>
                        <button
                          onClick={() => navigateTo('summaries')}
                          className="px-3 py-1.5 rounded-lg bg-stone-100 dark:bg-stone-800 font-bold hover:bg-stone-200 text-stone-700 dark:text-stone-200"
                        >
                          معاينة
                        </button>
                        <button
                          onClick={() => handleDeleteSummary(s.id)}
                          className="p-1.5 text-stone-400 hover:text-rose-600 rounded-lg transition-colors"
                          title="حذف الملخص"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Edit Summary Modal */}
          {editingSummary && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
              <div className="bg-white dark:bg-stone-900 rounded-3xl border border-stone-200 dark:border-stone-800 p-6 max-w-xl w-full max-h-[90vh] overflow-y-auto shadow-2xl space-y-4 text-right">
                <div className="flex items-center justify-between pb-3 border-b border-stone-100 dark:border-stone-800 sticky top-0 bg-white dark:bg-stone-900 z-10">
                  <div>
                    <h3 className="text-base font-bold text-stone-900 dark:text-stone-100 flex items-center gap-2">
                      <Edit3 className="w-5 h-5 text-emerald-600" />
                      <span>تعديل محتوى ملخص المراجعة</span>
                    </h3>
                    <p className="text-xs text-stone-500 mt-0.5">
                      تعديل العنوان، المقياس، النقاط الرئيسية والشرح المفصل للملخص.
                    </p>
                  </div>
                  <button
                    onClick={() => setEditingSummary(null)}
                    className="p-1.5 text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 rounded-xl hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <form onSubmit={handleSaveEditSummary} className="space-y-4 text-xs">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block font-bold mb-1">المقياس التابع له الملخص:</label>
                      <select
                        value={editSumSubjectId}
                        onChange={(e) => setEditSumSubjectId(e.target.value)}
                        className="w-full p-2.5 rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 font-medium"
                      >
                        {subjects.map((s) => (
                          <option key={s.id} value={s.id}>
                            {s.title}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block font-bold mb-1">عنوان الملخص:</label>
                      <input
                        type="text"
                        required
                        value={editSumTitle}
                        onChange={(e) => setEditSumTitle(e.target.value)}
                        className="w-full p-2.5 rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="flex items-center gap-2 font-bold cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={editSumIsPremium}
                        onChange={(e) => setEditSumIsPremium(e.target.checked)}
                        className="w-4 h-4 rounded text-emerald-600"
                      />
                      <span>ملخص حصري لأعضاء باقة Premium 🔒</span>
                    </label>
                  </div>

                  <div>
                    <label className="block font-bold mb-1">الوصف المختصر (Excerpt):</label>
                    <textarea
                      rows={2}
                      value={editSumExcerpt}
                      onChange={(e) => setEditSumExcerpt(e.target.value)}
                      placeholder="نبذة سريعة تصف هذا الملخص..."
                      className="w-full p-2.5 rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800"
                    />
                  </div>

                  <div>
                    <label className="block font-bold mb-1">النقاط الرئيسية (كل نقطة في سطر منفصل):</label>
                    <textarea
                      rows={4}
                      value={editSumPoints}
                      onChange={(e) => setEditSumPoints(e.target.value)}
                      placeholder="نقطة أولى جوهرية&#10;نقطة ثانية&#10;نقطة ثالثة"
                      className="w-full p-2.5 rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800"
                    />
                  </div>

                  <div>
                    <label className="block font-bold mb-1">المحتوى الكامل والشرح المركز للملخص:</label>
                    <textarea
                      rows={5}
                      value={editSumFullText}
                      onChange={(e) => setEditSumFullText(e.target.value)}
                      placeholder="اكتب هنا المحتوى الكامل للملخص والشرح التوضيحي..."
                      className="w-full p-2.5 rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 font-mono text-xs leading-relaxed"
                    />
                  </div>

                  {/* Media Upload Section for Editing Summary */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 rounded-2xl bg-stone-50/80 dark:bg-stone-800/50 border border-stone-200/80 dark:border-stone-700/80">
                    <MediaUpload
                      label="صورة الملخص أو الخريطة الذهنية"
                      type="image"
                      category="summaries"
                      value={editSumImageUrl}
                      onChange={setEditSumImageUrl}
                      helperText="ارفع صورة خريطة ذهنية، مخطط تلخيصي، أو جدول قواعد"
                    />

                    <MediaUpload
                      label="فيديو الشرح المركز للملخص"
                      type="video"
                      category="videos"
                      value={editSumVideoUrl}
                      onChange={setEditSumVideoUrl}
                      helperText="ارفع فيديو مراجعة مركزة أو ضع رابط يوتيوب للملخص"
                    />
                  </div>

                  <div className="flex justify-end gap-3 pt-3 border-t border-stone-100 dark:border-stone-800">
                    <button
                      type="button"
                      onClick={() => setEditingSummary(null)}
                      className="px-4 py-2 rounded-xl border border-stone-200 dark:border-stone-700 text-stone-600 dark:text-stone-300 font-bold hover:bg-stone-50 dark:hover:bg-stone-800 transition-colors"
                    >
                      إلغاء
                    </button>
                    <button
                      type="submit"
                      className="px-6 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold transition-colors shadow-xs"
                    >
                      حفظ وتحديث الملخص
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      )}

      {/* 5. PDFs Management */}
      {activeTab === 'pdfs' && (
        <div className="space-y-6">
          <div className="p-6 rounded-3xl bg-white dark:bg-stone-900 border border-stone-200/80 dark:border-stone-800 shadow-sm space-y-4">
            <h3 className="text-base font-bold text-stone-900 dark:text-stone-100 flex items-center gap-2">
              <Download className="w-5 h-5 text-emerald-600" />
              <span>رفع وتسجيل وثيقة PDF جديدة</span>
            </h3>
            <form onSubmit={handleCreatePdf} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block font-bold mb-1">المقياس:</label>
                  <select
                    value={newPdfSubjectId}
                    onChange={(e) => setNewPdfSubjectId(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 font-medium"
                  >
                    {subjects.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.title}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-bold mb-1">اسم الملف أو المحاضرة:</label>
                  <input
                    type="text"
                    required
                    value={newPdfTitle}
                    onChange={(e) => setNewPdfTitle(e.target.value)}
                    placeholder="مطبوعة محاضرات النحو العربي (PDF)"
                    className="w-full p-2.5 rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800"
                  />
                </div>
                <div>
                  <label className="block font-bold mb-1">عدد الصفحات والحجم:</label>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      value={newPdfPages}
                      onChange={(e) => setNewPdfPages(Number(e.target.value))}
                      placeholder="الصفحات"
                      className="w-1/2 p-2.5 rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800"
                    />
                    <input
                      type="text"
                      value={newPdfSize}
                      onChange={(e) => setNewPdfSize(e.target.value)}
                      placeholder="3.5 MB"
                      className="w-1/2 p-2.5 rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block font-bold mb-1">وصف الملف:</label>
                <input
                  type="text"
                  value={newPdfDesc}
                  onChange={(e) => setNewPdfDesc(e.target.value)}
                  placeholder="المحاضرة الرسمية المعتمدة لطلبة المدارس العليا"
                  className="w-full p-2.5 rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800"
                />
              </div>

              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 font-bold cursor-pointer">
                  <input
                    type="checkbox"
                    checked={newPdfIsPremium}
                    onChange={(e) => setNewPdfIsPremium(e.target.checked)}
                    className="w-4 h-4 rounded text-emerald-600"
                  />
                  <span>ملف PDF محمي بموجب باقة Premium (يمنع التحميل للمجاني)</span>
                </label>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl font-bold bg-emerald-600 hover:bg-emerald-700 text-white transition-colors"
                >
                  إضافة ملف PDF
                </button>
              </div>
            </form>
          </div>

          {/* List of PDFs */}
          <div className="bg-white dark:bg-stone-900 rounded-3xl border border-stone-200/80 dark:border-stone-800 p-6 shadow-sm space-y-4">
            <h3 className="text-base font-bold text-stone-900 dark:text-stone-100 flex items-center justify-between">
              <span>ملفات ومذكرات PDF المسجلة ({allPdfs.length})</span>
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {allPdfs.map((pdf) => {
                const sub = subjects.find((s) => s.id === pdf.subjectId);
                return (
                  <div
                    key={pdf.id}
                    className="p-4 rounded-2xl border border-stone-200 dark:border-stone-700 bg-stone-50/50 dark:bg-stone-800/40 flex flex-col justify-between space-y-3"
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-1.5">
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-stone-200 dark:bg-stone-700 text-stone-700 dark:text-stone-300">
                          {sub?.title || 'مقياس'}
                        </span>
                        {pdf.isPremium ? (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300">
                            Premium
                          </span>
                        ) : (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300">
                            مجاني
                          </span>
                        )}
                      </div>
                      <h4 className="font-bold text-sm text-stone-900 dark:text-stone-100">{pdf.title}</h4>
                      <p className="text-xs text-stone-500 mt-1 line-clamp-2">{pdf.description}</p>
                    </div>
                    <div className="flex items-center justify-between pt-2 border-t border-stone-200/60 dark:border-stone-700/60 text-xs">
                      <span className="text-stone-400 font-mono text-[11px]">{pdf.fileSize} • {pdf.pagesCount} صفحة</span>
                      <button
                        onClick={() => handleDeletePdf(pdf.id)}
                        className="text-rose-600 hover:text-rose-700 font-bold text-xs cursor-pointer"
                      >
                        حذف الملف
                      </button>
                    </div>
                  </div>
                );
              })}
              {allPdfs.length === 0 && (
                <div className="col-span-full py-8 text-center text-stone-400 text-xs">
                  لا توجد ملفات PDF مسجلة حالياً
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 6. Quizzes Management */}
      {activeTab === 'quizzes' && (
        <div className="space-y-6">
          <div className="p-6 rounded-3xl bg-white dark:bg-stone-900 border border-stone-200/80 dark:border-stone-800 shadow-sm space-y-4">
            <h3 className="text-base font-bold text-stone-900 dark:text-stone-100 flex items-center gap-2">
              <CheckSquare className="w-5 h-5 text-emerald-600" />
              <span>إنشاء اختبار تفاعلي جديد مع بنك الأسئلة</span>
            </h3>
            <form onSubmit={handleCreateQuiz} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold mb-1">المقياس:</label>
                  <select
                    value={newQuizSubjectId}
                    onChange={(e) => setNewQuizSubjectId(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 font-medium"
                  >
                    {subjects.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.title}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-bold mb-1">عنوان الاختبار:</label>
                  <input
                    type="text"
                    required
                    value={newQuizTitle}
                    onChange={(e) => setNewQuizTitle(e.target.value)}
                    placeholder="مثال: اختبار الفهم المنهجي لمقياس النحو العربي"
                    className="w-full p-2.5 rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800"
                  />
                </div>
              </div>

              {/* Sample Question Creator */}
              <div className="p-4 rounded-2xl bg-stone-50 dark:bg-stone-800/50 border border-stone-200 dark:border-stone-700 space-y-3">
                <p className="font-bold text-stone-900 dark:text-stone-100">السؤال النموذجي الأول:</p>
                <input
                  type="text"
                  value={newQ1Text}
                  onChange={(e) => setNewQ1Text(e.target.value)}
                  placeholder="نص السؤال (مثال: ما هو حكم الفاعل في الجملة الفعلية؟)"
                  className="w-full p-2 rounded-lg border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-900"
                />

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <input
                    type="text"
                    value={newQ1OptA}
                    onChange={(e) => setNewQ1OptA(e.target.value)}
                    placeholder="الخيار أ (مثال: الرفع دائماً)"
                    className="p-2 rounded-lg border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-900"
                  />
                  <input
                    type="text"
                    value={newQ1OptB}
                    onChange={(e) => setNewQ1OptB(e.target.value)}
                    placeholder="الخيار ب (مثال: النصب دائماً)"
                    className="p-2 rounded-lg border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-900"
                  />
                  <input
                    type="text"
                    value={newQ1OptC}
                    onChange={(e) => setNewQ1OptC(e.target.value)}
                    placeholder="الخيار ج (مثال: الجر بحرف الجر)"
                    className="p-2 rounded-lg border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-900"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <input
                    type="text"
                    value={newQ1Correct}
                    onChange={(e) => setNewQ1Correct(e.target.value)}
                    placeholder="الإجابة الصحيحة مطابقة تماماً لأحد الخيارات"
                    className="p-2 rounded-lg border border-emerald-300 dark:border-emerald-700 bg-white dark:bg-stone-900"
                  />
                  <input
                    type="text"
                    value={newQ1Exp}
                    onChange={(e) => setNewQ1Exp(e.target.value)}
                    placeholder="التعليل المنهجي والتفسير للطالب"
                    className="p-2 rounded-lg border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-900"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 font-bold cursor-pointer">
                  <input
                    type="checkbox"
                    checked={newQuizIsPremium}
                    onChange={(e) => setNewQuizIsPremium(e.target.checked)}
                    className="w-4 h-4 rounded text-emerald-600"
                  />
                  <span>اختبار مخصص لمشتركي Premium</span>
                </label>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl font-bold bg-emerald-600 hover:bg-emerald-700 text-white transition-colors"
                >
                  نشر الاختبار في بنك الأسئلة
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 7. Subscriptions & Pricing Management */}
      {activeTab === 'pricing' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-stone-900 rounded-3xl border border-stone-200/80 dark:border-stone-800 p-6 shadow-sm space-y-6">
            <div>
              <h3 className="text-base font-bold text-stone-900 dark:text-stone-100">
                تعديل أسعار خطط الاشتراك بالدينار الجزائري (DZD)
              </h3>
              <p className="text-xs text-stone-500 mt-0.5">
                تتحدث هذه الأسعار مباشرة وبشكل فوري في صفحة الأسعار وبوابة الدفع.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {subscriptionPlans.map((plan) => (
                <div
                  key={plan.id}
                  className="p-5 rounded-2xl border border-stone-200 dark:border-stone-700 bg-stone-50/60 dark:bg-stone-800/40 space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-sm text-stone-900 dark:text-stone-100">{plan.name}</span>
                    <span className="text-xs text-stone-400">المدة: {plan.durationMonths} شهر</span>
                  </div>

                  <div className="flex items-center gap-2 text-xs">
                    <label className="font-bold">السعر بالدينار الجزائري:</label>
                    <input
                      type="number"
                      defaultValue={plan.priceDzd}
                      onChange={(e) => {
                        setEditedPrices({
                          ...editedPrices,
                          [plan.id]: Number(e.target.value),
                        });
                      }}
                      className="w-28 p-2 rounded-lg border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-900 font-bold text-emerald-600"
                    />
                    <span className="font-bold text-stone-500">دج</span>
                  </div>

                  <button
                    onClick={() => {
                      const newP = editedPrices[plan.id];
                      if (newP && newP > 0) {
                        updatePlanPrice(plan.id, newP);
                      }
                    }}
                    className="w-full py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white transition-colors"
                  >
                    حفظ السعر الجديد لـ {plan.name}
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 8. Payments & Student Transfers Management (BaridiMob & CCP) */}
      {activeTab === 'payments' && (
        <div className="space-y-6">
          {/* Header & Overview Cards */}
          <div className="bg-white dark:bg-stone-900 rounded-3xl border border-stone-200/80 dark:border-stone-800 p-6 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-base font-bold text-stone-900 dark:text-stone-100 flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-emerald-600" />
                  <span>طلبات الاشتراكات والتحويلات المالية للطلبة</span>
                </h3>
                <p className="text-xs text-stone-500 mt-1">
                  مراجعة تحويلات بريدي موب (BaridiMob RIP) وحوالات البريد (CCP)، والتحقق من وصولات الدفع لتفعيل الاشتراكات بنقرة واحدة.
                </p>
              </div>

              <button
                onClick={() => setActiveTab('settings')}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-stone-100 dark:bg-stone-800 hover:bg-emerald-50 hover:text-emerald-700 dark:hover:text-emerald-300 transition-colors flex items-center gap-2 shrink-0"
              >
                <Building2 className="w-4 h-4 text-emerald-600" />
                <span>تعديل بيانات حسابك (CCP / بريدي موب)</span>
              </button>
            </div>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-4 rounded-2xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200/80 dark:border-amber-900/60 flex items-center justify-between">
                <div>
                  <span className="text-xs text-amber-800 dark:text-amber-300 block font-bold">بانتظار المراجعة والتأكيد</span>
                  <span className="text-2xl font-black text-amber-900 dark:text-amber-100">
                    {paymentsList.filter((p) => p.status === 'pending').length}
                  </span>
                </div>
                <span className="p-2.5 rounded-xl bg-amber-200/60 dark:bg-amber-900/50 text-amber-800 dark:text-amber-200">
                  ⏳
                </span>
              </div>

              <div className="p-4 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200/80 dark:border-emerald-900/60 flex items-center justify-between">
                <div>
                  <span className="text-xs text-emerald-800 dark:text-emerald-300 block font-bold">الاشتراكات المؤكدة</span>
                  <span className="text-2xl font-black text-emerald-900 dark:text-emerald-100">
                    {paymentsList.filter((p) => p.status === 'completed').length}
                  </span>
                </div>
                <span className="p-2.5 rounded-xl bg-emerald-200/60 dark:bg-emerald-900/50 text-emerald-800 dark:text-emerald-200">
                  ✓
                </span>
              </div>

              <div className="p-4 rounded-2xl bg-teal-50/70 dark:bg-teal-950/30 border border-teal-200/80 dark:border-teal-900/60 flex items-center justify-between">
                <div>
                  <span className="text-xs text-teal-800 dark:text-teal-300 block font-bold">إجمالي المداخيل المسجلة</span>
                  <span className="text-2xl font-black text-teal-900 dark:text-teal-100">
                    {paymentsList
                      .filter((p) => p.status === 'completed')
                      .reduce((acc, p) => acc + (p.amountDzd || 0), 0)}{' '}
                    دج
                  </span>
                </div>
                <span className="p-2.5 rounded-xl bg-teal-200/60 dark:bg-teal-900/50 text-teal-800 dark:text-teal-200">
                  💰
                </span>
              </div>
            </div>

            {/* Transactions Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-right text-xs">
                <thead>
                  <tr className="border-b border-stone-200 dark:border-stone-800 text-stone-400">
                    <th className="py-3 px-3">الطالب</th>
                    <th className="py-3 px-3">الباقة والمبلغ</th>
                    <th className="py-3 px-3">طريقة الدفع</th>
                    <th className="py-3 px-3">رقم العملية / الوصل</th>
                    <th className="py-3 px-3">هاتف المشترك</th>
                    <th className="py-3 px-3">الحالة</th>
                    <th className="py-3 px-3">الإجراءات</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100 dark:divide-stone-800/60">
                  {paymentsList.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-8 text-center text-stone-400">
                        لا توجد طلبات اشتراك أو تحويلات حالياً
                      </td>
                    </tr>
                  ) : (
                    paymentsList.map((tx) => (
                      <tr key={tx.id} className="hover:bg-stone-50/50 dark:hover:bg-stone-800/30">
                        <td className="py-3 px-3">
                          <div className="font-bold text-stone-900 dark:text-stone-100">
                            {tx.userName || tx.userEmail}
                          </div>
                          <div className="text-[11px] text-stone-400">{tx.userEmail}</div>
                        </td>

                        <td className="py-3 px-3">
                          <div className="font-bold text-emerald-600 dark:text-emerald-400">
                            {tx.amountDzd} دج
                          </div>
                          <div className="text-[11px] text-stone-500">{tx.planName}</div>
                        </td>

                        <td className="py-3 px-3">
                          <span
                            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold ${
                              tx.method === 'BaridiMob'
                                ? 'bg-emerald-100 text-emerald-900 dark:bg-emerald-950 dark:text-emerald-300'
                                : tx.method === 'CCP'
                                ? 'bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-300'
                                : 'bg-teal-100 text-teal-900 dark:bg-teal-950 dark:text-teal-300'
                            }`}
                          >
                            {tx.method === 'BaridiMob' && <Smartphone className="w-3.5 h-3.5" />}
                            {tx.method === 'CCP' && <Building2 className="w-3.5 h-3.5" />}
                            {tx.method === 'BaridiMob'
                              ? 'بريدي موب RIP'
                              : tx.method === 'CCP'
                              ? 'حوالة CCP'
                              : tx.method}
                          </span>
                        </td>

                        <td className="py-3 px-3">
                          <div className="font-mono text-stone-700 dark:text-stone-300 text-[11px]">
                            {tx.transactionRef || tx.cardNumberMasked || 'تحويل مباشر'}
                          </div>
                          {tx.transferReceiptUrl && (
                            <button
                              onClick={() => setSelectedReceiptImage(tx.transferReceiptUrl!)}
                              className="mt-1 text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 flex items-center gap-1 text-[11px] font-bold"
                            >
                              <Eye className="w-3.5 h-3.5" />
                              <span>عرض صورة الوصل</span>
                            </button>
                          )}
                        </td>

                        <td className="py-3 px-3">
                          {tx.senderPhone ? (
                            <div className="flex items-center gap-1.5">
                              <span className="font-mono text-stone-700 dark:text-stone-300" dir="ltr">
                                {tx.senderPhone}
                              </span>
                              <a
                                href={`https://wa.me/213${tx.senderPhone.replace(/\s+/g, '').replace(/^0/, '')}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-1 rounded text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950"
                                title="مراسلة عبر واتساب"
                              >
                                <MessageCircle className="w-3.5 h-3.5" />
                              </a>
                            </div>
                          ) : (
                            <span className="text-stone-400">-</span>
                          )}
                        </td>

                        <td className="py-3 px-3">
                          {tx.status === 'completed' && (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                              مؤكد ✓
                            </span>
                          )}
                          {tx.status === 'pending' && (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 animate-pulse">
                              قيد المراجعة ⏳
                            </span>
                          )}
                          {tx.status === 'rejected' && (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300">
                              مرفوض ✕
                            </span>
                          )}
                        </td>

                        <td className="py-3 px-3">
                          {tx.status === 'pending' ? (
                            <div className="flex items-center gap-1.5">
                              <button
                                onClick={() => handleApprovePayment(tx.id)}
                                className="px-3 py-1.5 rounded-lg text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white transition-colors shadow-xs flex items-center gap-1"
                              >
                                <span>تأكيد وتفعيل Premium</span>
                              </button>
                              <button
                                onClick={() => handleRejectPayment(tx.id)}
                                className="px-2.5 py-1.5 rounded-lg text-xs font-bold bg-rose-50 text-rose-600 hover:bg-rose-100 dark:bg-rose-950/50 dark:text-rose-400 transition-colors"
                              >
                                <span>رفض</span>
                              </button>
                            </div>
                          ) : (
                            <span className="text-stone-400 text-[11px]">مكتمل</span>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* 9. Users Management */}
      {activeTab === 'users' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-stone-900 rounded-3xl border border-stone-200/80 dark:border-stone-800 p-6 shadow-sm space-y-4">
            <h3 className="text-base font-bold text-stone-900 dark:text-stone-100">
              قائمة الطلاب والتحكم في الاشتراكات ({usersList.length})
            </h3>

            <div className="overflow-x-auto">
              <table className="w-full text-right text-xs">
                <thead>
                  <tr className="border-b border-stone-200 dark:border-stone-800 text-stone-400">
                    <th className="py-3 px-3">اسم الطالب</th>
                    <th className="py-3 px-3">البريد الإلكتروني</th>
                    <th className="py-3 px-3">التخصص</th>
                    <th className="py-3 px-3">حالة الاشتراك</th>
                    <th className="py-3 px-3">الإجراءات</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100 dark:divide-stone-800/60">
                  {usersList.map((u) => (
                    <tr key={u.id}>
                      <td className="py-3 px-3 font-bold text-stone-900 dark:text-stone-100">{u.name}</td>
                      <td className="py-3 px-3 text-stone-500">{u.email}</td>
                      <td className="py-3 px-3">{u.academicLevel}</td>
                      <td className="py-3 px-3">
                        {u.subscriptionStatus === 'premium' ? (
                          <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-200">
                            Premium مشترك ⭐
                          </span>
                        ) : (
                          <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-stone-100 text-stone-600 dark:bg-stone-800 dark:text-stone-400">
                            Free مجاني
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-3">
                        <button
                          onClick={() => handleToggleUserPremium(u.id, u.subscriptionStatus)}
                          className={`px-3 py-1.5 rounded-lg font-bold text-xs transition-colors ${
                            u.subscriptionStatus === 'premium'
                              ? 'bg-rose-50 text-rose-700 hover:bg-rose-100'
                              : 'bg-emerald-600 text-white hover:bg-emerald-700'
                          }`}
                        >
                          {u.subscriptionStatus === 'premium' ? 'تعطيل Premium' : 'ترقية يدوية إلى Premium'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* 9. Broadcast Notifications */}
      {activeTab === 'notifications' && (
        <div className="space-y-6">
          <div className="p-6 rounded-3xl bg-white dark:bg-stone-900 border border-stone-200/80 dark:border-stone-800 shadow-sm space-y-4 max-w-2xl">
            <div>
              <h3 className="text-base font-bold text-stone-900 dark:text-stone-100 flex items-center gap-2">
                <Bell className="w-5 h-5 text-emerald-600" />
                <span>إرسال إشعار عام لكافة طلبة المنصة</span>
              </h3>
              <p className="text-xs text-stone-500 mt-0.5">
                سيظهر هذا الإشعار فوراً في جرس التنبيهات وشريط الإشعارات لجميع الطلاب.
              </p>
            </div>

            <form onSubmit={handleSendNotification} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold mb-1">عنوان الإشعار:</label>
                <input
                  type="text"
                  required
                  value={notifTitle}
                  onChange={(e) => setNotifTitle(e.target.value)}
                  placeholder="مثال: تم نشر مذكرات وملخصات جديدة في مقياس النحو"
                  className="w-full p-2.5 rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800"
                />
              </div>

              <div>
                <label className="block font-bold mb-1">نص الرسالة والتفاصيل:</label>
                <textarea
                  rows={4}
                  required
                  value={notifMsg}
                  onChange={(e) => setNotifMsg(e.target.value)}
                  placeholder="أعزاءنا الطلبة، يمكنكم الآن تحميل ملفات PDF الخاصة بالوحدة الثالثة..."
                  className="w-full p-2.5 rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800"
                />
              </div>

              <button
                type="submit"
                className="px-6 py-2.5 rounded-xl font-bold bg-emerald-600 hover:bg-emerald-700 text-white transition-colors flex items-center gap-1.5"
              >
                <Bell className="w-4 h-4" />
                <span>إرسال الإشعار لجميع الطلاب</span>
              </button>
            </form>
          </div>
        </div>
      )}

      {/* 10. Platform Settings */}
      {activeTab === 'settings' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* General Identity */}
            <div className="p-6 rounded-3xl bg-white dark:bg-stone-900 border border-stone-200/80 dark:border-stone-800 shadow-sm space-y-4">
              <div>
                <h3 className="text-base font-bold text-stone-900 dark:text-stone-100 flex items-center gap-2">
                  <Settings className="w-5 h-5 text-emerald-600" />
                  <span>إعدادات وهوية المنصة</span>
                </h3>
                <p className="text-xs text-stone-500 mt-0.5">
                  تعديل اسم التطبيق، الشعار المكتوب، والشعار اللفظي.
                </p>
              </div>

              <form onSubmit={handleSaveSettings} className="space-y-4 text-xs">
                <div>
                  <label className="block font-bold mb-1">اسم المنصة:</label>
                  <input
                    type="text"
                    value={settingsAppName}
                    onChange={(e) => setSettingsAppName(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800"
                  />
                </div>

                <div>
                  <label className="block font-bold mb-1">نص الشعار (Logo Text):</label>
                  <input
                    type="text"
                    value={settingsLogoText}
                    onChange={(e) => setSettingsLogoText(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800"
                  />
                </div>

                <div>
                  <label className="block font-bold mb-1">الشعار اللفظي (Tagline):</label>
                  <input
                    type="text"
                    value={settingsTagline}
                    onChange={(e) => setSettingsTagline(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800"
                  />
                </div>

                <div>
                  <label className="block font-bold mb-1">البريد الإلكتروني للدعم:</label>
                  <input
                    type="email"
                    value={settingsEmail}
                    onChange={(e) => setSettingsEmail(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800"
                  />
                </div>

                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl font-bold bg-emerald-600 hover:bg-emerald-700 text-white transition-colors"
                >
                  حفظ التغييرات
                </button>
              </form>
            </div>

            {/* Payment & Banking Settings */}
            <div className="p-6 rounded-3xl bg-white dark:bg-stone-900 border border-stone-200/80 dark:border-stone-800 shadow-sm space-y-4">
              <div>
                <h3 className="text-base font-bold text-stone-900 dark:text-stone-100 flex items-center gap-2">
                  <Building2 className="w-5 h-5 text-emerald-600" />
                  <span>حسابات استقبال الأموال من المشتركين (CCP / بريدي موب)</span>
                </h3>
                <p className="text-xs text-stone-500 mt-0.5">
                  هذه البيانات تظهر للطلاب في نافذة الاشتراك عندما يختارون الدفع عبر بريدي موب أو مكتب البريد CCP.
                </p>
              </div>

              <form onSubmit={handleSaveSettings} className="space-y-4 text-xs">
                <div className="p-3.5 rounded-2xl bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-200/60 dark:border-emerald-900/40 space-y-3">
                  <div className="font-bold text-emerald-800 dark:text-emerald-300 flex items-center gap-1.5">
                    <Smartphone className="w-4 h-4" />
                    <span>بيانات تطبيق بريدي موب (BaridiMob RIP)</span>
                  </div>

                  <div>
                    <label className="block font-bold mb-1">رقم RIP الكامل (20 رقماً):</label>
                    <input
                      type="text"
                      value={settingsBaridiMobRip}
                      onChange={(e) => setSettingsBaridiMobRip(e.target.value)}
                      placeholder="00799999002145896345"
                      className="w-full p-2.5 rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 font-mono tracking-wider font-bold text-emerald-700 dark:text-emerald-400"
                    />
                    <span className="text-[10px] text-stone-400 mt-0.5 block">
                      يقوم الطالب بنسخ هذا الرقم ولصقه في تطبيق بريدي موب لتحويل المبلغ إليك مباشرة.
                    </span>
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200/60 dark:border-amber-900/40 space-y-3">
                  <div className="font-bold text-amber-800 dark:text-amber-300 flex items-center gap-1.5">
                    <Building2 className="w-4 h-4" />
                    <span>بيانات الحساب البريدي الجاري (CCP)</span>
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    <div className="col-span-2">
                      <label className="block font-bold mb-1">رقم الحساب الجاري (CCP):</label>
                      <input
                        type="text"
                        value={settingsCcpNumber}
                        onChange={(e) => setSettingsCcpNumber(e.target.value)}
                        placeholder="0021458963"
                        className="w-full p-2.5 rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 font-mono font-bold"
                      />
                    </div>
                    <div>
                      <label className="block font-bold mb-1">المفتاح (Clé):</label>
                      <input
                        type="text"
                        value={settingsCcpKey}
                        onChange={(e) => setSettingsCcpKey(e.target.value)}
                        placeholder="45"
                        className="w-full p-2.5 rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 font-mono font-bold"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold mb-1">اسم صاحب الحساب (المستفيد):</label>
                    <input
                      type="text"
                      value={settingsAccountHolder}
                      onChange={(e) => setSettingsAccountHolder(e.target.value)}
                      placeholder="الأستاذ / الإدارة"
                      className="w-full p-2.5 rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800"
                    />
                  </div>

                  <div>
                    <label className="block font-bold mb-1">رقم هاتف التأكيد وواتساب:</label>
                    <input
                      type="text"
                      value={settingsContactPhone}
                      onChange={(e) => setSettingsContactPhone(e.target.value)}
                      placeholder="0550 12 34 56"
                      className="w-full p-2.5 rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-bold mb-1">تعليمات وإرشادات الدفع للطلاب:</label>
                  <textarea
                    rows={3}
                    value={settingsPaymentInstructions}
                    onChange={(e) => setSettingsPaymentInstructions(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-xs"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 rounded-xl font-bold bg-emerald-600 hover:bg-emerald-700 text-white transition-colors flex items-center justify-center gap-2"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>حفظ وتحديث معلومات الحسابات البنكية فوراً</span>
                </button>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Lightbox Modal for Receipt Image */}
      {selectedReceiptImage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="relative max-w-2xl w-full bg-white dark:bg-stone-900 rounded-3xl p-4 shadow-2xl border border-stone-200 dark:border-stone-800">
            <div className="flex items-center justify-between pb-3 border-b border-stone-200 dark:border-stone-800 mb-3">
              <h4 className="font-bold text-sm text-stone-900 dark:text-stone-100 flex items-center gap-2">
                <Eye className="w-4 h-4 text-emerald-600" />
                <span>معاينة وصل التحويل المرسل من المشترك</span>
              </h4>
              <button
                onClick={() => setSelectedReceiptImage(null)}
                className="p-1 rounded-full text-stone-400 hover:text-stone-700 dark:hover:text-stone-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex items-center justify-center max-h-[70vh] overflow-hidden rounded-2xl bg-stone-100 dark:bg-stone-950 p-2">
              <img
                src={selectedReceiptImage}
                alt="وصل التحويل"
                className="max-h-[65vh] w-auto object-contain rounded-xl shadow-md"
              />
            </div>

            <div className="mt-4 flex justify-end gap-2">
              <button
                onClick={() => setSelectedReceiptImage(null)}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-stone-100 hover:bg-stone-200 dark:bg-stone-800 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-300 transition-colors"
              >
                إغلاق
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
