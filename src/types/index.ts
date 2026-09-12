export type UserRole = 'student' | 'admin';
export type SubscriptionStatus = 'free' | 'premium';

export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role: UserRole;
  subscriptionStatus: SubscriptionStatus;
  subscriptionExpiresAt?: string | null;
  academicLevel: string; // e.g. "السنة الأولى - لغة عربية"
  createdAt: string;
  isActive: boolean;
}

export interface AcademicLevel {
  id: string;
  name: string;
  description: string;
  isDefault?: boolean;
}

export interface Subject {
  id: string;
  levelId: string;
  title: string;
  code: string;
  description: string;
  icon: string; // lucide icon identifier
  color: string; // badge/accent theme
  coverImage?: string;
  lessonsCount: number;
  summariesCount: number;
  pdfsCount: number;
  quizzesCount: number;
  order: number;
}

export interface LessonSubheading {
  id: string;
  title: string;
  body: string;
  examples?: string[];
  keyPoints?: string[];
}

export interface Lesson {
  id: string;
  subjectId: string;
  levelId: string;
  title: string;
  excerpt: string;
  content?: string;
  summary?: string; // alias/fallback for quickSummary
  subheadings: LessonSubheading[];
  quickSummary: string;
  readingTimeMinutes: number;
  isPremium: boolean;
  order: number;
  relatedQuizId?: string;
  viewsCount: number;
  createdAt: string;
  imageUrl?: string;
  videoUrl?: string;
  videoTitle?: string;
  videoDuration?: string;
}

export interface Summary {
  id: string;
  subjectId: string;
  levelId: string;
  title: string;
  excerpt: string;
  keyPoints: string[];
  fullSummary: string;
  content?: string;
  isPremium: boolean;
  downloadsCount: number;
  createdAt: string;
  imageUrl?: string;
  images?: string[];
  videoUrl?: string;
}

export interface PDFFile {
  id: string;
  subjectId: string;
  levelId: string;
  title: string;
  description: string;
  coverImage?: string;
  fileUrl: string;
  fileSize: string;
  pagesCount: number;
  isPremium: boolean;
  createdAt: string;
}

export type QuestionType = 'multiple_choice' | 'true_false';

export interface QuizQuestion {
  id: string;
  questionText: string;
  type: QuestionType;
  options: string[];
  correctAnswer: number; // index of correct option
  explanation: string;
}

export interface Quiz {
  id: string;
  subjectId: string;
  levelId: string;
  lessonId?: string;
  title: string;
  description: string;
  durationMinutes: number;
  isPremium: boolean;
  questions: QuizQuestion[];
  createdAt: string;
}

export interface QuizResult {
  id: string;
  quizId: string;
  userId: string;
  quizTitle: string;
  subjectTitle: string;
  score: number;
  total: number;
  percentage: number;
  completedAt: string;
  answersReview: {
    questionId: string;
    questionText: string;
    selectedOption: number;
    correctOption: number;
    isCorrect: boolean;
    explanation: string;
  }[];
}

export interface StudentProgress {
  userId: string;
  completedLessons: string[]; // lessonIds
  quizResults: QuizResult[];
  favoriteLessons: string[]; // lessonIds
  favoriteSummaries: string[]; // summaryIds
}

export interface SubscriptionPlan {
  id: string;
  name: string;
  nameAr: string;
  description?: string;
  durationMonths: number;
  priceDzd: number;
  popular?: boolean;
  isPopular?: boolean;
  yearly?: boolean;
  badge?: string;
  features: string[];
}

export interface PaymentTransaction {
  id: string;
  userId: string;
  userEmail: string;
  userName?: string;
  planId: string;
  planName: string;
  amountDzd: number;
  method: 'CIB' | 'Edahabia' | 'BaridiMob' | 'CCP' | 'TEST';
  cardNumberMasked?: string;
  transferReceiptUrl?: string;
  transactionRef?: string;
  senderPhone?: string;
  notes?: string;
  status: 'completed' | 'pending' | 'rejected';
  createdAt: string;
}

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  date: string;
  type: 'lesson' | 'quiz' | 'subscription' | 'system';
  isRead: boolean;
  link?: string;
}

export interface PlatformSettings {
  appName: string;
  tagline: string;
  logoText: string;
  primaryColor: string;
  supportEmail: string;
  enableGuestPreview: boolean;
  testModeNotice: string;
  ccpNumber?: string;
  ccpKey?: string;
  baridiMobRip?: string;
  accountHolder?: string;
  contactPhone?: string;
  paymentInstructions?: string;
}

export interface AdminMetrics {
  totalUsers: number;
  premiumUsers: number;
  freeUsers: number;
  activeSubscriptions: number;
  expiredSubscriptions: number;
  totalLessons: number;
  totalSummaries: number;
  totalPdfs: number;
  totalQuizzes: number;
  estimatedRevenueDzd: number;
}
