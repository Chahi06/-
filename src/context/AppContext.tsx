import React, { createContext, useContext, useState, useEffect } from 'react';
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { auth, googleProvider, signInWithPopup, fbSignOut } from '../lib/firebase';
import {
  syncUserProfileToFirestore,
  saveUserProgressToFirestore,
  getUserProgressFromFirestore,
} from '../services/firestoreService';
import {
  initialAcademicLevels,
  initialSubjects,
  initialSubscriptionPlans,
  initialNotifications,
} from '../data/initialData';
import type {
  User,
  Subject,
  Lesson,
  Summary,
  PDFFile,
  Quiz,
  QuizResult,
  SubscriptionPlan,
  AppNotification,
  PlatformSettings,
  AcademicLevel,
  PaymentTransaction,
  AdminMetrics,
} from '../types/index.js';

interface ToastInfo {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
}

export type AppView =
  | 'home'
  | 'subjects'
  | 'subject-detail'
  | 'lesson-detail'
  | 'summaries'
  | 'quizzes'
  | 'quiz-play'
  | 'progress'
  | 'favorites'
  | 'subscription'
  | 'profile'
  | 'notifications'
  | 'admin'
  | 'search';

interface NavigationParams {
  subjectId?: string;
  lessonId?: string;
  quizId?: string;
  tab?: string;
}

interface AppContextType {
  currentUser: User;
  setCurrentUser: React.Dispatch<React.SetStateAction<User>>;
  academicLevels: AcademicLevel[];
  selectedLevel: string;
  setSelectedLevel: (lvl: string) => void;
  subjects: Subject[];
  subscriptionPlans: SubscriptionPlan[];
  notifications: AppNotification[];
  unreadNotificationsCount: number;
  markNotificationsAsRead: () => void;
  studentProgress: {
    completedLessons: string[];
    quizResults: QuizResult[];
    favoriteLessons: string[];
    favoriteSummaries: string[];
  };
  platformSettings: PlatformSettings;
  isDarkMode: boolean;
  toggleDarkMode: () => void;
  fontScale: 'normal' | 'large' | 'xlarge';
  setFontScale: (scale: 'normal' | 'large' | 'xlarge') => void;
  currentView: AppView;
  navParams: NavigationParams;
  navigateTo: (view: AppView, params?: NavigationParams) => void;
  toasts: ToastInfo[];
  showToast: (message: string, type?: 'success' | 'error' | 'info') => void;
  removeToast: (id: string) => void;
  premiumModalOpen: boolean;
  setPremiumModalOpen: (open: boolean) => void;
  premiumModalReason: string;
  openPremiumModal: (reason?: string) => void;
  pdfViewerModal: { open: boolean; pdf: PDFFile | null };
  openPdfViewer: (pdf: PDFFile) => void;
  closePdfViewer: () => void;
  switchDemoUser: (role: 'student' | 'admin', status?: 'free' | 'premium') => Promise<void>;
  toggleLessonCompleted: (lessonId: string) => Promise<boolean>;
  toggleFavorite: (type: 'lesson' | 'summary', id: string) => Promise<boolean>;
  refreshBootstrap: () => Promise<void>;
  // Admin helpers
  updateSubject: (id: string, data: Partial<Subject>) => Promise<boolean>;
  deleteSubject: (id: string) => Promise<boolean>;
  addSubject: (data: Partial<Subject>) => Promise<boolean>;
  addLesson: (data: Partial<Lesson>) => Promise<boolean>;
  updateLesson: (id: string, data: Partial<Lesson>) => Promise<boolean>;
  deleteLesson: (id: string) => Promise<boolean>;
  addPdf: (data: Partial<PDFFile>) => Promise<boolean>;
  deletePdf: (id: string) => Promise<boolean>;
  addSummary: (data: Partial<Summary>) => Promise<boolean>;
  updateSummary: (id: string, data: Partial<Summary>) => Promise<boolean>;
  deleteSummary: (id: string) => Promise<boolean>;
  addQuiz: (data: Partial<Quiz>) => Promise<boolean>;
  deleteQuiz: (id: string) => Promise<boolean>;
  updatePlanPrice: (planId: string, priceDzd: number) => Promise<boolean>;
  broadcastNotification: (title: string, message: string, type?: string, link?: string) => Promise<boolean>;
  updatePlatformSettings: (settings: Partial<PlatformSettings>) => Promise<boolean>;
  firebaseUser: FirebaseUser | null;
  signInWithGoogle: () => Promise<void>;
  signOutUser: () => Promise<void>;
}

function parseHashLocation(): { view: AppView; params: NavigationParams } {
  if (typeof window === 'undefined') return { view: 'home', params: {} };
  const rawHash = window.location.hash.replace(/^#\/?/, '').trim();
  if (!rawHash) return { view: 'home', params: {} };

  const [pathPart, queryPart] = rawHash.split('?');
  const validViews: AppView[] = [
    'home',
    'subjects',
    'subject-detail',
    'lesson-detail',
    'summaries',
    'quizzes',
    'quiz-play',
    'progress',
    'favorites',
    'subscription',
    'profile',
    'notifications',
    'admin',
    'search',
  ];

  const view = validViews.includes(pathPart as AppView) ? (pathPart as AppView) : 'home';
  const params: NavigationParams = {};

  if (queryPart) {
    const sp = new URLSearchParams(queryPart);
    if (sp.has('subjectId')) params.subjectId = sp.get('subjectId')!;
    if (sp.has('lessonId')) params.lessonId = sp.get('lessonId')!;
    if (sp.has('quizId')) params.quizId = sp.get('quizId')!;
    if (sp.has('tab')) params.tab = sp.get('tab')!;
  }

  return { view, params };
}

const AppContext = createContext<AppContextType | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const initialRoute = parseHashLocation();

  const [currentUser, setCurrentUser] = useState<User>(() => {
    const saved = typeof window !== 'undefined' ? localStorage.getItem('ostadhi_user') : null;
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.email) return parsed;
      } catch (e) {}
    }
    return {
      id: 'usr-owner-azc',
      name: 'المشرف العام والمالك (azc1744)',
      email: 'azc1744@gmail.com',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
      role: 'admin',
      subscriptionStatus: 'premium',
      subscriptionExpiresAt: '2099-12-31T23:59:59.000Z',
      academicLevel: 'المالك والمشرف البيداغوجي العام (تحكم كلي)',
      createdAt: '2025-01-01T08:00:00.000Z',
      isActive: true,
    };
  });

  const updateCurrentUser = (u: User) => {
    setCurrentUser(u);
    try {
      localStorage.setItem('ostadhi_user', JSON.stringify(u));
    } catch (e) {}
  };

  const getAuthHeaders = () => ({
    'Content-Type': 'application/json',
    'x-user-id': currentUser.id,
    'x-user-email': currentUser.email,
    'x-user-role': currentUser.role,
    'x-admin-role': currentUser.role === 'admin' ? 'admin' : '',
  });

  const [academicLevels, setAcademicLevels] = useState<AcademicLevel[]>(initialAcademicLevels);
  const [selectedLevel, setSelectedLevel] = useState<string>('السنة الأولى - لغة عربية');
  const [subjects, setSubjects] = useState<Subject[]>(initialSubjects);
  const [subscriptionPlans, setSubscriptionPlans] = useState<SubscriptionPlan[]>(initialSubscriptionPlans);
  const [notifications, setNotifications] = useState<AppNotification[]>(initialNotifications);
  const [studentProgress, setStudentProgress] = useState<{
    completedLessons: string[];
    quizResults: QuizResult[];
    favoriteLessons: string[];
    favoriteSummaries: string[];
  }>({
    completedLessons: [],
    quizResults: [],
    favoriteLessons: [],
    favoriteSummaries: [],
  });

  const [platformSettings, setPlatformSettings] = useState<PlatformSettings>({
    appName: 'أستاذي | سنة أولى تعليم ابتدائي',
    tagline: 'المنصة الأكاديمية الأولى لطلبة المدرسة العليا للأساتذة والجامعات',
    logoText: 'أستاذي',
    primaryColor: '#059669',
    supportEmail: 'contact@ostadhi.dz',
    enableGuestPreview: true,
    testModeNotice: 'وضع التجربة مفعل: يمكنك تجربة الدفع بالبطاقة الذهبية و CIB مجاناً لاختبار ترقية الحساب.',
  });

  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    return localStorage.getItem('ostadhi_dark_mode') === 'true';
  });

  const [fontScale, setFontScale] = useState<'normal' | 'large' | 'xlarge'>('normal');
  const [currentView, setCurrentView] = useState<AppView>(initialRoute.view);
  const [navParams, setNavParams] = useState<NavigationParams>(initialRoute.params);
  const [toasts, setToasts] = useState<ToastInfo[]>([]);

  const [premiumModalOpen, setPremiumModalOpen] = useState(false);
  const [premiumModalReason, setPremiumModalReason] = useState('هذا المحتوى متاح لأعضاء Premium');

  const [pdfViewerModal, setPdfViewerModal] = useState<{ open: boolean; pdf: PDFFile | null }>({
    open: false,
    pdf: null,
  });

  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);

  // Sync Firebase Auth State
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
      setFirebaseUser(fbUser);
      if (fbUser && fbUser.email) {
        try {
          // Sync with backend session
          const res = await fetch('/api/auth/firebase-sync', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              uid: fbUser.uid,
              email: fbUser.email,
              displayName: fbUser.displayName,
              photoURL: fbUser.photoURL,
            }),
          });
          if (res.ok) {
            const data = await res.json();
            setCurrentUser(data.user);
            // Sync to Firestore profile
            await syncUserProfileToFirestore({
              uid: fbUser.uid,
              name: fbUser.displayName || data.user.name,
              email: fbUser.email,
              role: data.user.role,
              subscriptionStatus: data.user.subscriptionStatus,
            });
            // Try fetching stored progress from Firestore
            const cloudProgress = await getUserProgressFromFirestore(fbUser.uid);
            if (cloudProgress) {
              setStudentProgress((prev) => ({
                ...prev,
                completedLessons: cloudProgress.completedLessons || prev.completedLessons,
                favoriteLessons: cloudProgress.favoriteLessons || prev.favoriteLessons,
                favoriteSummaries: cloudProgress.favoriteSummaries || prev.favoriteSummaries,
              }));
            }
          }
        } catch (err) {
          console.error('Error syncing Firebase user profile:', err);
        }
      }
    });

    return () => unsubscribe();
  }, []);

  const signInWithGoogle = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      if (result.user) {
        showToast(`مرحباً بك ${result.user.displayName || 'يا زميلي المعلم'}! تم تسجيل الدخول عبر Google بنجاح`, 'success');
      }
    } catch (err: any) {
      console.error('Google Sign In Error:', err);
      showToast('تعذر تسجيل الدخول عبر Google، يرجى المحاولة مجدداً', 'error');
    }
  };

  const signOutUser = async () => {
    try {
      await fbSignOut(auth);
      setFirebaseUser(null);
      await switchDemoUser('student', 'free');
      showToast('تم تسجيل الخروج بنجاح', 'info');
    } catch (err) {
      console.error('Sign Out Error:', err);
    }
  };

  // Load initial data
  const refreshBootstrap = async (overrideUser?: User) => {
    try {
      const active = overrideUser || currentUser;
      const res = await fetch('/api/bootstrap', {
        headers: {
          'x-user-id': active.id,
          'x-user-email': active.email,
          'x-user-role': active.role,
        },
      });
      if (res.ok) {
        const data = await res.json();
        if (data.currentUser && !overrideUser) {
          updateCurrentUser(data.currentUser);
        }
        setAcademicLevels(data.academicLevels || []);
        setSubjects(data.subjects || []);
        setSubscriptionPlans(data.subscriptionPlans || []);
        setNotifications(data.notifications || []);
        setPlatformSettings(data.platformSettings);
        if (data.studentProgress) {
          setStudentProgress(data.studentProgress);
        }
      }
    } catch (e) {
      console.error('Failed to bootstrap app data:', e);
    }
  };

  useEffect(() => {
    refreshBootstrap();
  }, []);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('ostadhi_dark_mode', 'true');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('ostadhi_dark_mode', 'false');
    }
  }, [isDarkMode]);

  const toggleDarkMode = () => setIsDarkMode((prev) => !prev);

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      removeToast(id);
    }, 4000);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  useEffect(() => {
    const handleLocationChange = () => {
      const { view, params } = parseHashLocation();
      setCurrentView(view);
      setNavParams(params);
    };

    window.addEventListener('popstate', handleLocationChange);
    window.addEventListener('hashchange', handleLocationChange);

    return () => {
      window.removeEventListener('popstate', handleLocationChange);
      window.removeEventListener('hashchange', handleLocationChange);
    };
  }, []);

  const navigateTo = (view: AppView, params: NavigationParams = {}) => {
    setCurrentView(view);
    setNavParams(params);
    window.scrollTo({ top: 0, behavior: 'smooth' });

    try {
      const q = new URLSearchParams();
      if (params.subjectId) q.set('subjectId', params.subjectId);
      if (params.lessonId) q.set('lessonId', params.lessonId);
      if (params.quizId) q.set('quizId', params.quizId);
      if (params.tab) q.set('tab', params.tab);
      const queryStr = q.toString() ? `?${q.toString()}` : '';
      const newHash = view === 'home' ? '' : `#${view}${queryStr}`;
      if (window.location.hash !== newHash) {
        window.history.pushState(null, '', newHash || window.location.pathname);
      }
    } catch {
      // Safe fallback if history API is restricted in sandbox
    }
  };

  const openPremiumModal = (reason = 'هذا المحتوى متاح لأعضاء باقة Premium') => {
    setPremiumModalReason(reason);
    setPremiumModalOpen(true);
  };

  const openPdfViewer = (pdf: PDFFile) => {
    const isPremiumUser = currentUser.subscriptionStatus === 'premium' || currentUser.role === 'admin';
    if (pdf.isPremium && !isPremiumUser) {
      openPremiumModal(`الملف "${pdf.title}" محمي ومتاح حصرياً لمشتركي Premium.`);
      return;
    }
    setPdfViewerModal({ open: true, pdf });
  };

  const closePdfViewer = () => {
    setPdfViewerModal({ open: false, pdf: null });
  };

  const unreadNotificationsCount = notifications.filter((n) => !n.isRead).length;

  const markNotificationsAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
  };

  const switchDemoUser = async (role: 'student' | 'admin', status: 'free' | 'premium' = 'free') => {
    try {
      const res = await fetch('/api/auth/switch-demo-user', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ role, status }),
      });
      if (res.ok) {
        const data = await res.json();
        updateCurrentUser(data.user);
        await refreshBootstrap(data.user);
        showToast(
          role === 'admin'
            ? 'تم التبديل إلى حساب الإدارة (Admin) بنجاح'
            : status === 'premium'
            ? 'تم التبديل إلى حساب طالب مشترك (Premium) بنجاح'
            : 'تم التبديل إلى حساب طالب مجاني (Free) بنجاح',
          'info'
        );
      }
    } catch (e) {
      showToast('تعذر تبديل الحساب', 'error');
    }
  };

  const toggleLessonCompleted = async (lessonId: string): Promise<boolean> => {
    try {
      const res = await fetch('/api/progress/toggle-lesson', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ lessonId }),
      });
      if (res.ok) {
        const data = await res.json();
        setStudentProgress((prev) => ({ ...prev, completedLessons: data.completedLessons }));
        showToast(data.isCompleted ? 'رائع! تمت دراسة هذا الدرس بنجاح' : 'تم إلغاء تعليم الدرس كمكتمل', 'success');
        return data.isCompleted;
      }
    } catch (e) {
      showToast('حدث خطأ في تحديث التقدم', 'error');
    }
    return false;
  };

  const toggleFavorite = async (type: 'lesson' | 'summary', id: string): Promise<boolean> => {
    try {
      const res = await fetch('/api/progress/toggle-favorite', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ type, id }),
      });
      if (res.ok) {
        const data = await res.json();
        if (type === 'lesson') {
          setStudentProgress((prev) => ({ ...prev, favoriteLessons: data.favoriteLessons }));
        } else {
          setStudentProgress((prev) => ({ ...prev, favoriteSummaries: data.favoriteSummaries }));
        }
        showToast(data.isFavorite ? 'تمت الإضافة إلى المفضلة ❤️' : 'تمت الإزالة من المفضلة', 'info');
        return data.isFavorite;
      }
    } catch (e) {
      showToast('تعذر تحديث المفضلة', 'error');
    }
    return false;
  };

  // Admin Actions
  const updateSubject = async (id: string, data: Partial<Subject>): Promise<boolean> => {
    try {
      const res = await fetch(`/api/subjects/${id}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(data),
      });
      if (res.ok) {
        await refreshBootstrap();
        showToast('تم تحديث بيانات المقياس بنجاح', 'success');
        return true;
      }
    } catch (e) {
      showToast('تعذر تحديث المقياس', 'error');
    }
    return false;
  };

  const deleteSubject = async (id: string): Promise<boolean> => {
    try {
      const res = await fetch(`/api/subjects/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });
      if (res.ok) {
        await refreshBootstrap();
        showToast('تم حذف المقياس ومحتوياته', 'info');
        return true;
      }
    } catch (e) {
      showToast('تعذر حذف المقياس', 'error');
    }
    return false;
  };

  const addSubject = async (data: Partial<Subject>): Promise<boolean> => {
    try {
      const res = await fetch('/api/subjects', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(data),
      });
      if (res.ok) {
        await refreshBootstrap();
        showToast('تمت إضافة المقياس الدراسي بنجاح', 'success');
        return true;
      }
    } catch (e) {
      showToast('تعذر إضافة المقياس', 'error');
    }
    return false;
  };

  const addLesson = async (data: Partial<Lesson>): Promise<boolean> => {
    try {
      const res = await fetch('/api/lessons', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(data),
      });
      if (res.ok) {
        await refreshBootstrap();
        showToast('تمت إضافة الدرس بنجاح', 'success');
        return true;
      }
    } catch (e) {
      showToast('تعذر إضافة الدرس', 'error');
    }
    return false;
  };

  const updateLesson = async (id: string, data: Partial<Lesson>): Promise<boolean> => {
    try {
      const res = await fetch(`/api/lessons/${id}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(data),
      });
      if (res.ok) {
        await refreshBootstrap();
        showToast('تم تحديث بيانات ومحتوى الدرس بنجاح', 'success');
        return true;
      }
    } catch (e) {
      showToast('تعذر تحديث محتوى الدرس', 'error');
    }
    return false;
  };

  const deleteLesson = async (id: string): Promise<boolean> => {
    try {
      const res = await fetch(`/api/lessons/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });
      if (res.ok) {
        await refreshBootstrap();
        showToast('تم حذف الدرس', 'info');
        return true;
      }
    } catch (e) {
      showToast('تعذر حذف الدرس', 'error');
    }
    return false;
  };

  const addPdf = async (data: Partial<PDFFile>): Promise<boolean> => {
    try {
      const res = await fetch('/api/pdfs', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(data),
      });
      if (res.ok) {
        await refreshBootstrap();
        showToast('تم رفع ملف PDF بنجاح', 'success');
        return true;
      }
    } catch (e) {
      showToast('تعذر رفع الملف', 'error');
    }
    return false;
  };

  const deletePdf = async (id: string): Promise<boolean> => {
    try {
      const res = await fetch(`/api/pdfs/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });
      if (res.ok) {
        await refreshBootstrap();
        showToast('تم حذف ملف PDF', 'info');
        return true;
      }
    } catch (e) {
      showToast('تعذر حذف الملف', 'error');
    }
    return false;
  };

  const addSummary = async (data: Partial<Summary>): Promise<boolean> => {
    try {
      const res = await fetch('/api/summaries', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(data),
      });
      if (res.ok) {
        await refreshBootstrap();
        showToast('تمت إضافة الملخص بنجاح', 'success');
        return true;
      }
    } catch (e) {
      showToast('تعذر إضافة الملخص', 'error');
    }
    return false;
  };

  const updateSummary = async (id: string, data: Partial<Summary>): Promise<boolean> => {
    try {
      const res = await fetch(`/api/summaries/${id}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(data),
      });
      if (res.ok) {
        await refreshBootstrap();
        showToast('تم تحديث محتوى الملخص بنجاح', 'success');
        return true;
      }
    } catch (e) {
      showToast('تعذر تحديث الملخص', 'error');
    }
    return false;
  };

  const deleteSummary = async (id: string): Promise<boolean> => {
    try {
      const res = await fetch(`/api/summaries/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });
      if (res.ok) {
        await refreshBootstrap();
        showToast('تم حذف الملخص', 'info');
        return true;
      }
    } catch (e) {
      showToast('تعذر حذف الملخص', 'error');
    }
    return false;
  };

  const addQuiz = async (data: Partial<Quiz>): Promise<boolean> => {
    try {
      const res = await fetch('/api/quizzes', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(data),
      });
      if (res.ok) {
        await refreshBootstrap();
        showToast('تم إنشاء الاختبار بنجاح', 'success');
        return true;
      }
    } catch (e) {
      showToast('تعذر إنشاء الاختبار', 'error');
    }
    return false;
  };

  const deleteQuiz = async (id: string): Promise<boolean> => {
    try {
      const res = await fetch(`/api/quizzes/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });
      if (res.ok) {
        await refreshBootstrap();
        showToast('تم حذف الاختبار', 'info');
        return true;
      }
    } catch (e) {
      showToast('تعذر حذف الاختبار', 'error');
    }
    return false;
  };

  const updatePlanPrice = async (planId: string, priceDzd: number): Promise<boolean> => {
    try {
      const res = await fetch(`/api/subscriptions/plans/${planId}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify({ priceDzd }),
      });
      if (res.ok) {
        await refreshBootstrap();
        showToast('تم تحديث سعر الخطة بنجاح في قاعدة البيانات', 'success');
        return true;
      }
    } catch (e) {
      showToast('تعذر تحديث السعر', 'error');
    }
    return false;
  };

  const broadcastNotification = async (
    title: string,
    message: string,
    type = 'system',
    link = '/subjects'
  ): Promise<boolean> => {
    try {
      const res = await fetch('/api/admin/notifications', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ title, message, type, link }),
      });
      if (res.ok) {
        await refreshBootstrap();
        showToast('تم إرسال الإشعار لجميع الطلبة', 'success');
        return true;
      }
    } catch (e) {
      showToast('تعذر إرسال الإشعار', 'error');
    }
    return false;
  };

  const updatePlatformSettings = async (settings: Partial<PlatformSettings>): Promise<boolean> => {
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(settings),
      });
      if (res.ok) {
        setPlatformSettings((prev) => ({ ...prev, ...settings }));
        showToast('تم حفظ إعدادات المنصة', 'success');
        return true;
      }
    } catch (e) {
      showToast('تعذر حفظ الإعدادات', 'error');
    }
    return false;
  };

  return (
    <AppContext.Provider
      value={{
        currentUser,
        setCurrentUser,
        academicLevels,
        selectedLevel,
        setSelectedLevel,
        subjects,
        subscriptionPlans,
        notifications,
        unreadNotificationsCount,
        markNotificationsAsRead,
        studentProgress,
        platformSettings,
        isDarkMode,
        toggleDarkMode,
        fontScale,
        setFontScale,
        currentView,
        navParams,
        navigateTo,
        toasts,
        showToast,
        removeToast,
        premiumModalOpen,
        setPremiumModalOpen,
        premiumModalReason,
        openPremiumModal,
        pdfViewerModal,
        openPdfViewer,
        closePdfViewer,
        switchDemoUser,
        toggleLessonCompleted,
        toggleFavorite,
        refreshBootstrap,
        updateSubject,
        deleteSubject,
        addSubject,
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
        firebaseUser,
        signInWithGoogle,
        signOutUser,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within an AppProvider');
  return context;
}
