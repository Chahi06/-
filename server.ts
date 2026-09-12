import express from 'express';
import path from 'path';
import fs from 'fs';
import { createServer as createViteServer } from 'vite';
import type {
  Subject,
  Lesson,
  Summary,
  PDFFile,
  Quiz,
  QuizResult,
  User,
  SubscriptionPlan,
  PaymentTransaction,
  AppNotification,
  PlatformSettings,
  AdminMetrics,
} from './src/types/index.js';

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '100mb' }));
app.use(express.urlencoded({ extended: true, limit: '100mb' }));

// Ensure public uploads directories exist and serve them statically
const uploadsBaseDir = path.join(process.cwd(), 'public', 'uploads');
if (!fs.existsSync(uploadsBaseDir)) {
  fs.mkdirSync(uploadsBaseDir, { recursive: true });
}
['lessons', 'summaries', 'videos', 'images', 'general'].forEach((folder) => {
  const fPath = path.join(uploadsBaseDir, folder);
  if (!fs.existsSync(fPath)) {
    fs.mkdirSync(fPath, { recursive: true });
  }
});
app.use('/uploads', express.static(uploadsBaseDir));

// In-Memory Real State Store for full interactivity
const academicLevels = [
  { id: 'lvl-1', name: 'السنة الأولى - تخصص أستاذ التعليم الابتدائي (لغة عربية)', description: 'الطور التأسيسي لمدرسي المرحلة الابتدائية', isDefault: true },
  { id: 'lvl-2', name: 'السنة الثانية - لغة عربية (قريباً)', description: 'الطور المعمق والتربص الميداني', isDefault: false },
  { id: 'lvl-3', name: 'السنة الثالثة - لغة عربية (قريباً)', description: 'سنة التخرج ومذكرة البحث', isDefault: false },
];

let platformSettings: PlatformSettings = {
  appName: 'أستاذي | سنة أولى تعليم ابتدائي',
  tagline: 'المنصة الأكاديمية الأولى لطلبة المدرسة العليا للأساتذة والجامعات',
  logoText: 'أستاذي',
  primaryColor: '#059669', // Emerald
  supportEmail: 'contact@ostadhi.dz',
  enableGuestPreview: true,
  testModeNotice: 'وضع التجربة مفعل: يمكنك تجربة الدفع بالبطاقة الذهبية و CIB أو إرسال وصل بريدي موب تجريبياً.',
  ccpNumber: '0021458963',
  ccpKey: '45',
  baridiMobRip: '00799999002145896345',
  accountHolder: 'الأستاذ المشرف العام (azc1744)',
  contactPhone: '0550 12 34 56',
  paymentInstructions: 'يرجى تحويل مبلغ الاشتراك المحدد عبر تطبيق بريدي موب (BaridiMob) إلى رقم RIP الموضح، أو عبر مكتب البريد (حوالة CCP)، ثم إرفاق صورة الوصل أو رقم العملية ليتم تفعيل حسابك فوراً.',
};

let users: User[] = [
  {
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
  },
  {
    id: 'usr-student-free',
    name: 'أمين بن علي',
    email: 'student@ostadhi.dz',
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80',
    role: 'student',
    subscriptionStatus: 'free',
    subscriptionExpiresAt: null,
    academicLevel: 'السنة الأولى - لغة عربية',
    createdAt: '2026-01-15T10:00:00.000Z',
    isActive: true,
  },
  {
    id: 'usr-student-prem',
    name: 'فرح قادري',
    email: 'farah@ostadhi.dz',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80',
    role: 'student',
    subscriptionStatus: 'premium',
    subscriptionExpiresAt: '2026-12-31T23:59:59.000Z',
    academicLevel: 'السنة الأولى - لغة عربية',
    createdAt: '2026-02-01T14:30:00.000Z',
    isActive: true,
  },
];

let currentUser: User = users[0]; // Set azc1744@gmail.com as master owner by default

function getRequestUser(req: any): User {
  const emailHeader = ((req.headers['x-user-email'] as string) || '').toLowerCase().trim();
  const idHeader = ((req.headers['x-user-id'] as string) || '').trim();
  const roleHeader = ((req.headers['x-user-role'] as string) || '').trim();

  // If azc1744@gmail.com or role is explicitly admin, resolve to admin
  if (emailHeader === 'azc1744@gmail.com' || roleHeader === 'admin') {
    let owner = users.find((u) => u.email.toLowerCase() === 'azc1744@gmail.com' || u.role === 'admin');
    if (!owner) owner = users[0];
    owner.role = 'admin';
    owner.subscriptionStatus = 'premium';
    return owner;
  }

  if (emailHeader) {
    const found = users.find((u) => u.email.toLowerCase() === emailHeader);
    if (found) return found;
  }

  if (idHeader) {
    const found = users.find((u) => u.id === idHeader);
    if (found) return found;
  }

  return currentUser || users[0];
}

function isAdmin(req: any): boolean {
  if (req.headers && req.headers['x-admin-role'] === 'admin') return true;
  const user = getRequestUser(req);
  return user.role === 'admin' || user.email.toLowerCase() === 'azc1744@gmail.com';
}

let subjects: Subject[] = [
  {
    id: 'subj-nahw',
    levelId: 'lvl-1',
    title: 'النحو العربي',
    code: 'NAHW-101',
    description: 'دراسة التراكيب وأصول الإعراب والبناء والجملة الاسمية والفعلية والمفاعيل وتطبيقاتها.',
    icon: 'BookOpen',
    color: 'emerald',
    coverImage: 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?auto=format&fit=crop&w=600&q=80',
    lessonsCount: 4,
    summariesCount: 2,
    pdfsCount: 3,
    quizzesCount: 2,
    order: 1,
  },
  {
    id: 'subj-sarf',
    levelId: 'lvl-1',
    title: 'علم الصرف',
    code: 'SARF-102',
    description: 'الميزان الصرفي، بنية الكلمة، المجرد والمزيد، الاشتقاق والإعلال والإبدال للمرحلة الابتدائية.',
    icon: 'Feather',
    color: 'amber',
    coverImage: 'https://images.unsplash.com/photo-1457369804613-52c61a468e7d?auto=format&fit=crop&w=600&q=80',
    lessonsCount: 2,
    summariesCount: 1,
    pdfsCount: 2,
    quizzesCount: 1,
    order: 2,
  },
  {
    id: 'subj-balagha',
    levelId: 'lvl-1',
    title: 'البلاغة والبيان',
    code: 'BAL-103',
    description: 'علوم البلاغة الثلاثة: البيان (التشبيه والاستعارة والكناية)، والمعاني، والمحسنات البديعية.',
    icon: 'Sparkles',
    color: 'purple',
    coverImage: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=600&q=80',
    lessonsCount: 2,
    summariesCount: 1,
    pdfsCount: 1,
    quizzesCount: 1,
    order: 3,
  },
  {
    id: 'subj-adab',
    levelId: 'lvl-1',
    title: 'الأدب العربي ونصوصه',
    code: 'ADB-104',
    description: 'تاريخ الأدب العربي وعصوره ونصوص مختارة موجهة لغرس التذوق الأدبي واللغوي لدى المتعلمين.',
    icon: 'Scroll',
    color: 'rose',
    coverImage: 'https://images.unsplash.com/photo-1476275466078-4007374efbbe?auto=format&fit=crop&w=600&q=80',
    lessonsCount: 2,
    summariesCount: 1,
    pdfsCount: 2,
    quizzesCount: 1,
    order: 4,
  },
  {
    id: 'subj-tabir',
    levelId: 'lvl-1',
    title: 'فنيات التعبير والتحرير',
    code: 'TAB-105',
    description: 'منهجيات الإنشاء والتعبير الشفوي والكتابي، والتدريب على صياغة المذكرات وتصحيح التعبير.',
    icon: 'PenTool',
    color: 'blue',
    coverImage: 'https://images.unsplash.com/photo-1455390582262-044cdead277a?auto=format&fit=crop&w=600&q=80',
    lessonsCount: 2,
    summariesCount: 1,
    pdfsCount: 1,
    quizzesCount: 1,
    order: 5,
  },
  {
    id: 'subj-tarbiya',
    levelId: 'lvl-1',
    title: 'علوم التربية والديداكتيك',
    code: 'TRB-106',
    description: 'مناهج التدريس الحديثة، المقاربة بالكفاءات، التخطيط التربوي وصناعة جذاذات الدروس النموذجية.',
    icon: 'GraduationCap',
    color: 'teal',
    coverImage: 'https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&w=600&q=80',
    lessonsCount: 3,
    summariesCount: 2,
    pdfsCount: 3,
    quizzesCount: 2,
    order: 6,
  },
  {
    id: 'subj-nafs',
    levelId: 'lvl-1',
    title: 'علم النفس التربوي والنمو',
    code: 'NFS-107',
    description: 'خصائص نمو تلميذ المرحلة الابتدائية (6-12 سنة)، نظريات بياجيه وفيغوتسكي وتعديل السلوك الصفي.',
    icon: 'Brain',
    color: 'indigo',
    coverImage: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=600&q=80',
    lessonsCount: 2,
    summariesCount: 1,
    pdfsCount: 2,
    quizzesCount: 1,
    order: 7,
  },
  {
    id: 'subj-math',
    levelId: 'lvl-1',
    title: 'ديداكتيك الرياضيات الابتدائية',
    code: 'MTH-108',
    description: 'أساليب تقديم مفاهيم الحساب والهندسة والقياس للمبتدئين وتوظيف الوسائل المجسمة.',
    icon: 'Calculator',
    color: 'sky',
    coverImage: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?auto=format&fit=crop&w=600&q=80',
    lessonsCount: 2,
    summariesCount: 1,
    pdfsCount: 2,
    quizzesCount: 1,
    order: 8,
  },
  {
    id: 'subj-sci',
    levelId: 'lvl-1',
    title: 'النشاط العلمي والتكنولوجي',
    code: 'SCI-109',
    description: 'مبادئ تدريس الإيقاظ العلمي، استكشاف المحيط، الظواهر الطبيعية والتجارب المخبرية البسيطة.',
    icon: 'Atom',
    color: 'cyan',
    coverImage: 'https://images.unsplash.com/photo-1532094349884-543bc11b234d?auto=format&fit=crop&w=600&q=80',
    lessonsCount: 1,
    summariesCount: 1,
    pdfsCount: 1,
    quizzesCount: 1,
    order: 9,
  },
  {
    id: 'subj-info',
    levelId: 'lvl-1',
    title: 'الإعلام الآلي وتكنولوجيا التعليم',
    code: 'INF-110',
    description: 'توظيف الوسائط الرقمية والحقائب البيداغوجية والبرمجيات التفاعلية في القسم الابتدائي.',
    icon: 'Laptop',
    color: 'slate',
    coverImage: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=600&q=80',
    lessonsCount: 1,
    summariesCount: 1,
    pdfsCount: 1,
    quizzesCount: 1,
    order: 10,
  },
  {
    id: 'subj-lang',
    levelId: 'lvl-1',
    title: 'ديداكتيك اللغة الأجنبية',
    code: 'LNG-111',
    description: 'استراتيجيات تعليم اللغة الفرنسية كلغة تواصلية ثانية لتلاميذ الطورين الثاني والثالث.',
    icon: 'Languages',
    color: 'violet',
    coverImage: 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?auto=format&fit=crop&w=600&q=80',
    lessonsCount: 1,
    summariesCount: 1,
    pdfsCount: 1,
    quizzesCount: 1,
    order: 11,
  },
];

let lessons: Lesson[] = [
  {
    id: 'les-nahw-1',
    subjectId: 'subj-nahw',
    levelId: 'lvl-1',
    title: 'أقسام الكلمة في اللغة العربية: الاسم والفعل والحرف',
    excerpt: 'المدخل الأساسي لتعليم قواعد اللغة: تمييز الكلمة وضوابط كل قسم وطرق تقديمه لتلميذ السنة الثالثة ابتدائي.',
    readingTimeMinutes: 7,
    isPremium: false,
    order: 1,
    relatedQuizId: 'quiz-nahw-1',
    viewsCount: 342,
    createdAt: '2026-01-10T12:00:00.000Z',
    imageUrl: 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?auto=format&fit=crop&w=1200&q=80',
    videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    videoTitle: 'المحاضرة المرئية: شرح ديداكتيكي لأقسام الكلمة وطرق تقديمها لتلاميذ الابتدائي',
    videoDuration: '14:25',
    quickSummary: 'الكلمة هي اللفظ المفرد الدال على معنى. تنقسم إلى: اسم (يقبل ال، التنوين، الجر، والنداء)، وفعل (يدل على حدث وزمن وله علامات خاصة)، وحرف (لا يظهر معناه إلا مع غيره).',
    subheadings: [
      {
        id: 'sub-1',
        title: 'أولاً: تعريف الكلمة وأقسامها الثلاثة',
        body: 'الكلمة في اصطلاح النحاة هي اللفظ المفرد الموضوع لمعنى، وكل نص عربي مهما بلغت فصاحته لا يخرج عن تركيبة من ثلاثة أقسام لا رابع لها: الاسم، والفعل، والحرف. وفي الممارسة التربوية في المدرسة الابتدائية، يركز المعلم على تمييز المتعلم بين ما يدل على ذات (اسم) وما يدل على حركة وزمن (فعل).',
        examples: [
          'الاسم: التلميذُ، المدرسةُ، الشجرةُ، الصدقُ.',
          'الفعل: كَتَبَ (ماضٍ)، يَكْتُبُ (مضارع)، اكْتُبْ (أمر).',
          'الحرف: في، مِنْ، إِلَى، عَنْ، عَلَى، الباء، الكاف، اللام.',
        ],
        keyPoints: [
          'الاسم يدل على معنى في نفسه غير مقترن بزمن وضعاً.',
          'الفعل يدل على حدث مقترن بزمن (ماض، حاضر، مستقبل).',
          'الحرف رابط بيداغوجي لا يتضح معناه الكامل بمفرده.',
        ],
      },
      {
        id: 'sub-2',
        title: 'ثانياً: العلامات المميزة للاسم وطرق تدريسها',
        body: 'للاسم علامات مخصوصة جمعها ابن مالك في ألفيته: (بالجر والتنوين والندا وأل ومسند للاسم تمييز حصل). وفي مرحلة التعليم الابتدائي، نعتمد على أسهل علامتين للمتعلم: قبول دخول "أل" التعريف، وقبول التنوين.',
        examples: [
          'كتاب -> الكتاب (قبل أل، إذن هو اسم قطعي).',
          'قلمٌ -> قلماً -> قلمٍ (قبل التنوين بأنواعه).',
          'يا أحمدُ، يا بطلُ (دخول حرف النداء).',
        ],
        keyPoints: [
          'لا يجتمع التنوين مع "أل" في كلمة واحدة أبداً.',
          'الفعل والحرف لا يقبلان التنوين أو حرف الجر.',
        ],
      },
      {
        id: 'sub-3',
        title: 'ثالثاً: البعد الديداكتيكي لمعلم الابتدائي',
        body: 'عند بناء وضعية انطلاق في القسم، تجنب تقديم التعريف النحوي المجرد في البداية. ابدأ بنص قصير من واقع المتعلم، ثم استخدم استراتيجية التصنيف في جدول ثلاثي الأعمدة مدعوماً بصور توضيحية لترسيخ التمييز الحسي والحركي.',
        examples: [
          'وضعية انطلاق: "دخل المعلمُ إلى القسمِ وكتبَ على السبورةِ..." يستخرج التلميذ الكلمات ويصنفها.',
        ],
        keyPoints: [
          'الانطلاق دائماً من السند اللغوي المألوف.',
          'التدرج من الشفوي إلى المكتوب.',
        ],
      },
    ],
  },
  {
    id: 'les-nahw-2',
    subjectId: 'subj-nahw',
    levelId: 'lvl-1',
    title: 'الإعراب والبناء وموقع الكلمات في الجملة البسيطة',
    excerpt: 'معرفة التغير اللاحق بأواخر الكلم لاختلاف العوامل، وضبط المبنيات كالأفعال الماضية والضمائر.',
    readingTimeMinutes: 9,
    isPremium: false,
    order: 2,
    relatedQuizId: 'quiz-nahw-1',
    viewsCount: 280,
    createdAt: '2026-01-14T10:00:00.000Z',
    quickSummary: 'الإعراب هو تغير أحوال أواخر الكلمات بسبب العوامل الداخلة عليها (رفع، نصب، جر، جزم). أما البناء فهو لزوم آخر الكلمة حركة واحدة لا تتغير مهما تغير موقعها.',
    subheadings: [
      {
        id: 'sub-1',
        title: 'مفهوم الإعراب والعلامات الأصلية والفرعية',
        body: 'الإعراب هو أثر ظاهر أو مقدر يجلبه العامل في آخر الكلمة. العلامات الأصلية هي الضمة للرفع، والفتحة للنصب، والكسرة للجر، والسكون للجزم.',
        examples: [
          'حضرَ الأستاذُ (فاعل مرفوع بالضمة).',
          'شكرتُ الأستاذَ (مفعول به منصوب بالفتحة).',
          'سلّمتُ على الأستاذِ (اسم مجرور بالكسرة).',
        ],
      },
    ],
  },
  {
    id: 'les-nahw-3',
    subjectId: 'subj-nahw',
    levelId: 'lvl-1',
    title: 'نواسخ الجملة الاسمية: كان وأخواتها وإن وأخواتها وأحكامها الديداكتيكية',
    excerpt: 'شرح مفصل للأفعال الناقصة والحروف المشبهة بالفعل، مع جدول مقارنة ديداكتيكي لإعداد مذكرات المعلم.',
    readingTimeMinutes: 12,
    isPremium: true,
    order: 3,
    relatedQuizId: 'quiz-nahw-2',
    viewsCount: 512,
    createdAt: '2026-01-18T09:00:00.000Z',
    quickSummary: 'كان وأخواتها أفعال ناسخة ترفع المبتدأ وتنصب الخبر. إن وأخواتها حروف ناسخة تنصب المبتدأ وترفع الخبر. تسمى بالنواسخ لأنها تنسخ وتغير الحكم الإعرابي الأصلي للجملة الاسمية.',
    subheadings: [
      {
        id: 'sub-1',
        title: 'كان وأخواتها وعملها في الجملة',
        body: 'تدخل كان وأخواتها (صار، أصبح، أمسى، بات، ظل، ليس، ما زال...) على الجملة الاسمية، فترفع الأول ويسمى اسمها، وتنصب الثاني ويسمى خبرها.',
        examples: [
          'العلمُ نافعٌ -> أصبحَ العلمُ نافعاً.',
          'الطقسُ باردٌ -> كانَ الطقسُ بارداً.',
        ],
        keyPoints: [
          'اسم كان مرفوع دائماً، وخبرها منصوب دائماً.',
          'قد يكون الخبر مفرداً أو جملة أو شبه جملة.',
        ],
      },
      {
        id: 'sub-2',
        title: 'إن وأخواتها والفرق في الأثر المعنوي والإعرابي',
        body: 'إن وأخواتها (أنّ، كأنّ، لكنّ، ليتَ، لعلّ) حروف توكيد وتشبيه واستدراك وتمنٍ وترجٍ، تؤثر عكسياً: فتنصب المبتدأ ويسمى اسمها، وترفع الخبر ويسمى خبرها.',
        examples: [
          'النجاحَ قريبٌ -> إنّ النجاحَ قريبٌ.',
          'المعلمَ شمعةٌ -> كأنّ المعلمَ شمعةٌ تُضيء الدرب.',
        ],
      },
      {
        id: 'sub-3',
        title: 'مذكرة بيداغوجية نموذجية للطور الثالث (السنة الرابعة والخامسة)',
        body: 'خطوات تقديم درس كان وأخواتها: 1. مرحلة الانطلاق (تذكير بعناصر الجملة الاسمية). 2. مرحلة بناء التعلمات (إدخال كان وملاحظة التغير على الحركة الإعرابية الأخيرة). 3. مرحلة الاستنتاج. 4. التدريب الفردي والجماعي.',
        keyPoints: [
          'استخدام بطاقات ملونة للتركيز على تغير حركة الخبر من الضمة إلى الفتحة.',
          'تجنب التوسع في النواسخ المهملة في مرحلة التعليم الابتدائي.',
        ],
      },
    ],
  },
  {
    id: 'les-nahw-4',
    subjectId: 'subj-nahw',
    levelId: 'lvl-1',
    title: 'المفاعيل الخمسة وضوابط تدريسها في المدرسة الابتدائية',
    excerpt: 'المفعول به، المفعول المطلق، المفعول لأجله، المفعول فيه، والمفعول معه مع نماذج إعرابية كاملة.',
    readingTimeMinutes: 14,
    isPremium: true,
    order: 4,
    relatedQuizId: 'quiz-nahw-2',
    viewsCount: 430,
    createdAt: '2026-01-22T11:00:00.000Z',
    quickSummary: 'المفاعيل الخمسة كلها أسماء منصوبة تدل على تفاصيل الحدث: من وقع عليه، سبب وقوعه، زمانه ومكانه، توكيده، والمصاحب له.',
    subheadings: [
      {
        id: 'sub-1',
        title: 'منظومة المنصوبات: المفاعيل',
        body: 'المفعول به هو الركن الأبرز لتعليم التلميذ التعدي واللزوم، يليه المفعول المطلق للتأكيد والعدد والنوع، والمفعول لأجله لبيان العلة والسبب.',
        examples: [
          'قرأ التلميذُ القصةَ (مفعول به).',
          'رتّلَ القارئُ ترتيلاً (مفعول مطلق).',
          'وقفَ الطلابُ احتراماً للمعلمِ (مفعول لأجله).',
        ],
      },
    ],
  },
  {
    id: 'les-sarf-1',
    subjectId: 'subj-sarf',
    levelId: 'lvl-1',
    title: 'الميزان الصرفي وتطبيقاته الأساسية على الأفعال الثلاثية',
    excerpt: 'كيفية وزن الكلمات العربية بالحروف الأصلية (ف - ع - ل) وحركات الحروف الصرفية.',
    readingTimeMinutes: 8,
    isPremium: false,
    order: 1,
    relatedQuizId: 'quiz-sarf-1',
    viewsCount: 195,
    createdAt: '2026-01-12T09:00:00.000Z',
    quickSummary: 'الميزان الصرفي مقياس وضعه علماء اللغة لوزن الكلمات، وحروفه الأصلية هي (ف، ع، ل). تقابل فاء الميزان الحرف الأصلي الأول، وعينه الثاني، ولامه الثالث.',
    subheadings: [
      {
        id: 'sub-1',
        title: 'أصل الميزان الصرفي',
        body: 'لما كانت غالبية الكلمات في اللغة العربية ثلاثية الأصول، اختار النحاة كلمة "فعل" ميزاناً عاماً لمرونته واشتماله على مخارج الحروف الصوتية الثلاثة.',
        examples: [
          'كَتَبَ -> فَعَلَ',
          'شَرِبَ -> فَعِلَ',
          'كَرُمَ -> فَعُلَ',
        ],
      },
    ],
  },
  {
    id: 'les-sarf-2',
    subjectId: 'subj-sarf',
    levelId: 'lvl-1',
    title: 'المجرد والمزيد ودلالات أحرف الزيادة في التعبير',
    excerpt: 'الفعل المجرد الثلاثي والرباعي، وأحرف الزيادة المجموعة في (سألتمونيها) وأثرها في المعنى.',
    readingTimeMinutes: 11,
    isPremium: true,
    order: 2,
    relatedQuizId: 'quiz-sarf-1',
    viewsCount: 310,
    createdAt: '2026-01-20T10:00:00.000Z',
    quickSummary: 'المجرد ما كانت جميع أحرفه أصلية لا يسقط منها حرف، والمزيد ما زاد فيه حرف أو أكثر على أحرفه الأصلية. الزيادة في المبنى تدل على زيادة في المعنى.',
    subheadings: [
      {
        id: 'sub-1',
        title: 'أحرف الزيادة (سألتمونيها)',
        body: 'تزاد الحروف على الأصول لغايات دلالية، مثل التعدية، والمطاوعة، والمبالغة، والطلب (استفعل).',
        examples: [
          'خَرَجَ (مجرد) -> أَخْرَجَ (مزيد بالهمزة للتعدية).',
          'غَفَرَ (مجرد) -> اسْتَغْفَرَ (مزيد بثلاثة أحرف للطلب).',
        ],
      },
    ],
  },
  {
    id: 'les-trb-1',
    subjectId: 'subj-tarbiya',
    levelId: 'lvl-1',
    title: 'مفهوم البيداغوجيا والديداكتيك والفرق العملي بينهما',
    excerpt: 'الأسس النظرية للتعليمية والتربية: العلاقة بين المعلم والمتعلم والمعرفة (المثلث الديداكتيكي).',
    readingTimeMinutes: 10,
    isPremium: false,
    order: 1,
    relatedQuizId: 'quiz-trb-1',
    viewsCount: 420,
    createdAt: '2026-01-11T13:00:00.000Z',
    quickSummary: 'البيداغوجيا تهتم بالعلاقة التربوية الشاملة بين المعلم والمتعلم والبيئة الصفية. أما الديداكتيك (التعليمية) فتهتم بمحتوى المادة الدراسية ونقل المعرفة وطرق تدريسها.',
    subheadings: [
      {
        id: 'sub-1',
        title: 'المثلث الديداكتيكي (Pédagogique / Didactique)',
        body: 'يتكون المثلث الديداكتيكي من ثلاثة أقطاب: المعلم (الموجه)، المتعلم (الفاعل المركزي)، والمعرفة (المحتوى التعليمي المنقول).',
        examples: [
          'محور المعلم - المتعلم: محور بيداغوجي وتواصلي ونفسي.',
          'محور المعلم - المعرفة: محور النقل الديداكتيكي والتحضير العلمي.',
          'محور المتعلم - المعرفة: محور التعلم واكتساب الكفايات.',
        ],
      },
    ],
  },
  {
    id: 'les-trb-2',
    subjectId: 'subj-tarbiya',
    levelId: 'lvl-1',
    title: 'المقاربة بالكفاءات في المدرسة الابتدائية الجزائرية: من النظرية إلى التطبيق',
    excerpt: 'تحليل المنهاج الرسمي، صياغة الكفاءة الختامية والشاملة، والوضعيات الإدماجية والتقويم البنائي.',
    readingTimeMinutes: 15,
    isPremium: true,
    order: 2,
    relatedQuizId: 'quiz-trb-1',
    viewsCount: 615,
    createdAt: '2026-01-19T14:00:00.000Z',
    quickSummary: 'المقاربة بالكفاءات تجعل المتعلم قادراً على تجنيد وتعبئة مكتسباته المعرفية والمهارية لحل مشكلات واقعية دالة في حياته اليومية والمدرسية.',
    subheadings: [
      {
        id: 'sub-1',
        title: 'مفهوم الكفاءة وعناصرها',
        body: 'الكفاءة ليست مجرد تراكم للمعلومات والحفظ، بل هي القدرة على تحريك الموارد (المعارف والمهارات والمواقف) في وضعية مشكلة معقدة.',
        keyPoints: [
          'المورد: المعرفة القاعدية (قاعدة نحوية، جدول ضرب).',
          'الإدماج: تضافر الموارد لإنتاج نص أو حل مسألة.',
          'التقويم: قياس الأداء في وضعية جديدة مشابهة.',
        ],
      },
    ],
  },
  {
    id: 'les-nfs-1',
    subjectId: 'subj-nafs',
    levelId: 'lvl-1',
    title: 'مراحل النمو المعرفي عند جان بياجيه وتطبيقاتها في الطور الابتدائي',
    excerpt: 'مرحلة العمليات المادية المحسوسة (7-11 سنة)، التمركز حول الذات، وبناء المفاهيم المجردة.',
    readingTimeMinutes: 9,
    isPremium: false,
    order: 1,
    relatedQuizId: 'quiz-nfs-1',
    viewsCount: 388,
    createdAt: '2026-01-13T16:00:00.000Z',
    quickSummary: 'يمر الطفل في المرحلة الابتدائية بمرحلة العمليات المحسوسة؛ لذلك يحتاج المعلم دائماً إلى المحسوسات والوسائل البصرية والملموسة قبل الانتقال إلى التجريد الرمزي.',
    subheadings: [
      {
        id: 'sub-1',
        title: 'مرحلة العمليات العيانية (المحسوسة)',
        body: 'يستطيع التلميذ في هذا الطور الترتيب والتصنيف وإدراك ثبات المادة، لكنه يظل عاجزاً عن التفكير الفرضي المجرد دون سند حسي.',
      },
    ],
  },
  {
    id: 'les-nfs-2',
    subjectId: 'subj-nafs',
    levelId: 'lvl-1',
    title: 'الدافعية للتعلم وإدارة الانتباه وتعديل السلوك الصفي',
    excerpt: 'استراتيجيات التعزيز الإيجابي، احتواء فرط الحركة وتشتت الانتباه داخل الفصل الدراسي.',
    readingTimeMinutes: 13,
    isPremium: true,
    order: 2,
    relatedQuizId: 'quiz-nfs-1',
    viewsCount: 470,
    createdAt: '2026-01-21T08:30:00.000Z',
    quickSummary: 'الدافعية هي المحرك للتعلم. المعلم الناجح يركز على الدافعية الذاتية والتعزيز الإيجابي اللفظي والمعنوي بدلاً من العقاب السلبي المنفر.',
    subheadings: [
      {
        id: 'sub-1',
        title: 'أساليب زيادة الدافعية في القسم الابتدائي',
        body: 'ربط المحتوى بحياة التلميذ، تنويع الأنشطة، كسر الروتين الصفي، وإتاحة الفرصة للتعبير الحر.',
      },
    ],
  },
];

let summaries: Summary[] = [
  {
    id: 'sum-1',
    subjectId: 'subj-nahw',
    levelId: 'lvl-1',
    title: 'ملخص شامل: جدول علامات الإعراب الأصلية والفرعية في صفحة واحدة',
    excerpt: 'مخطط بصري دقيق يجمع علامات الرفع والنصب والجر والجزم للمفرد والمثنى وجمع التكسير والجموع السالمة والأسماء الخمسة.',
    keyPoints: [
      'المفرد وجمع التكسير: يرفعان بالضمة، وينصبان بالفتحة، ويجران بالكسرة.',
      'المثنى: يرفع بالألف، وينصب ويجر بالياء.',
      'جمع المذكر السالم: يرفع بالواو، وينصب ويجر بالياء.',
      'جمع المؤنث السالم: ينصب بالكسرة نيابة عن الفتحة (نقطة تركيز هامة!).',
      'الأسماء الخمسة: ترفع بالواو، وتنصب بالألف، وتجر بالياء.',
    ],
    fullSummary: 'هذا الملخص مصمم كمرجع سريع لمعلم الابتدائي لتفادي الأخطاء الشائعة أثناء تصحيح كراسات المتعلمين وإعداد الاختبارات التقويمية. يتضمن شواهد قرآنية ونماذج إعرابية موجزة.',
    imageUrl: 'https://images.unsplash.com/photo-1516979187457-637abb4f9353?auto=format&fit=crop&w=1200&q=80',
    videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    isPremium: false,
    downloadsCount: 520,
    createdAt: '2026-01-15T10:00:00.000Z',
  },
  {
    id: 'sum-2',
    subjectId: 'subj-nahw',
    levelId: 'lvl-1',
    title: 'ملخص كان وأخواتها وإن وأخواتها وفروق الاستعمال الديداكتيكي',
    excerpt: 'مقارنة شاملة بين النواسخ الفعلية والحرفية مع جداول تطبيقية وتراكيب إعرابية جاهزة للاختبارات.',
    keyPoints: [
      'كان وأخواتها: 13 فعلاً تدل على توقيت أو تحول أو نفي، وتعمل الرفع ثم النصب.',
      'إن وأخواتها: 6 حروف تدل على التوكيد والتشبيه والاستدراك، وتعمل النصب ثم الرفع.',
      'حالات تقدم الخبر على الاسم وجوباً وجوازاً في المستويات المتقدمة.',
    ],
    fullSummary: 'ملخص مخصص للتحضير لمسابقات الترقية واختبارات السداسي الأول لطلبة السنة الأولى، يركز على التطبيقات الجزئية والتنبيهات المنهجية.',
    isPremium: true,
    downloadsCount: 840,
    createdAt: '2026-01-24T12:00:00.000Z',
  },
  {
    id: 'sum-3',
    subjectId: 'subj-tarbiya',
    levelId: 'lvl-1',
    title: 'خريطة ذهنية: مصطلحات علوم التربية والمقاربة بالكفاءات',
    excerpt: 'توضيح مركز لمفاهيم: الهدف الإجرائي، العائق البيداغوجي، النقل الديداكتيكي، الإدماج والتقويم التشخيصي والتكويني.',
    keyPoints: [
      'التقويم التشخيصي: يكون في بداية التعلم لتحديد المكتسبات القبلية.',
      'التقويم التكويني: يرافق عملية التعلم لتشخيص التعثرات وتصحيح المسار فورياً.',
      'التقويم التحصيلي: يكون في ختام مرحلة لتتويج أو منح رتبة وشهادة.',
    ],
    fullSummary: 'دليل اصطلاحي مكثف لا يستغني عنه أي طالب أستاذ في مسيرته التكوينية بالسنة الأولى.',
    isPremium: false,
    downloadsCount: 680,
    createdAt: '2026-01-17T15:00:00.000Z',
  },
];

let pdfFiles: PDFFile[] = [
  {
    id: 'pdf-1',
    subjectId: 'subj-nahw',
    levelId: 'lvl-1',
    title: 'محاضرات النحو العربي المعمق - السداسي الأول (جامعة الجزائر)',
    description: 'كتاب محاضرات جامعي يغطي البرنامج الكامل للسنة الأولى لتخصص أساتذة الابتدائي مع التمارين المحلولة.',
    fileUrl: 'https://example.com/assets/pdfs/nahw-s1-lectures.pdf',
    fileSize: '4.8 MB',
    pagesCount: 64,
    isPremium: false,
    createdAt: '2026-01-10T10:00:00.000Z',
  },
  {
    id: 'pdf-2',
    subjectId: 'subj-nahw',
    levelId: 'lvl-1',
    title: 'حقيبة مذكرات النحو النموذجية للطور الابتدائي (كافة المستويات)',
    description: 'جذاذات بيداغوجية مفصلة طبق المنهاج الوزاري الجديد مع وضعيات انطلاق مشوقة وشبكات تقويم المعايير.',
    fileUrl: 'https://example.com/assets/pdfs/nahw-moudhakarat-bundle.pdf',
    fileSize: '9.2 MB',
    pagesCount: 112,
    isPremium: true,
    createdAt: '2026-01-25T11:30:00.000Z',
  },
  {
    id: 'pdf-3',
    subjectId: 'subj-tarbiya',
    levelId: 'lvl-1',
    title: 'دليل الأستاذ في علوم التربية وعلم النفس المدرسي',
    description: 'مرجع شامل في سيكولوجية الطفل، حل النزاعات الصفية، وتخطيط الوحدات التعليمية التفاعلية.',
    fileUrl: 'https://example.com/assets/pdfs/dalil-al-ustadh-tarbiya.pdf',
    fileSize: '6.1 MB',
    pagesCount: 88,
    isPremium: true,
    createdAt: '2026-01-28T09:00:00.000Z',
  },
  {
    id: 'pdf-4',
    subjectId: 'subj-sarf',
    levelId: 'lvl-1',
    title: 'ملزمة تصريف الأفعال وجداول الميزان الصرفي',
    description: 'تمارين تطبيقية وجداول تصريف مع الضمائر في الماضي والمضارع والأمر مع الحلول المنهجية.',
    fileUrl: 'https://example.com/assets/pdfs/sarf-tables.pdf',
    fileSize: '3.4 MB',
    pagesCount: 42,
    isPremium: false,
    createdAt: '2026-01-14T14:00:00.000Z',
  },
];

let quizzes: Quiz[] = [
  {
    id: 'quiz-nahw-1',
    subjectId: 'subj-nahw',
    levelId: 'lvl-1',
    lessonId: 'les-nahw-1',
    title: 'اختبار تجريبي: أقسام الكلمة وعلامات الإعراب',
    description: 'اختبار دقيق لتقييم فهمك لأقسام الكلمة وعلامات الاسم والفعل، مدة الاختبار 10 دقائق.',
    durationMinutes: 10,
    isPremium: false,
    createdAt: '2026-01-12T10:00:00.000Z',
    questions: [
      {
        id: 'q1',
        questionText: 'أي من العلامات التالية تخص الأسماء ولا تدخل على الأفعال قطيعاً؟',
        type: 'multiple_choice',
        options: ['التاء المتحركة', 'التنوين', 'نون التوكيد', 'الجزم'],
        correctAnswer: 1,
        explanation: 'التنوين علامة فارقة تخص الأسماء فقط كما قال ابن مالك: بالجر والتنوين والندا وأل.',
      },
      {
        id: 'q2',
        questionText: 'هل يمكن أن تجتمع "أل" التعريف والتنوين في كلمة واحدة في اللغة العربية الفصيحة؟',
        type: 'true_false',
        options: ['صحيح (يجوز في حالات نادرة)', 'خطأ (لا يجتمعان أبداً)'],
        correctAnswer: 1,
        explanation: 'خطأ؛ "أل" والتنوين ضدان لا يجتمعان في كلمة واحدة أبداً، فدخول أحدهما يمنع الآخر.',
      },
      {
        id: 'q3',
        questionText: 'في جملة: "شَكَرَ المُعَلِّمُ المُتَفَوِّقِينَ"، ما هي علامة نصب المفعول به "المتفوقين"؟',
        type: 'multiple_choice',
        options: ['الفتحة الظاهرة', 'الكسرة نيابة عن الفتحة', 'الياء لأنه جمع مذكر سالم', 'الألف'],
        correctAnswer: 2,
        explanation: 'المتفوقين جمع مذكر سالم، وجمع المذكر السالم ينصب ويجر بالياء.',
      },
      {
        id: 'q4',
        questionText: 'الفعل "اكتُبْ" هو فعل أمر مبني على:',
        type: 'multiple_choice',
        options: ['الفتح', 'السكون', 'حذف النون', 'الضمة'],
        correctAnswer: 1,
        explanation: 'فعل الأمر صحيح الآخر الذي لم يتصل به شيء يبنى على السكون.',
      },
    ],
  },
  {
    id: 'quiz-nahw-2',
    subjectId: 'subj-nahw',
    levelId: 'lvl-1',
    lessonId: 'les-nahw-3',
    title: 'اختبار النواسخ والمفاعيل المتقدم (Premium)',
    description: 'اختبار تخصصي لطلبة السنة الأولى لاختبار مهارات الإعراب الدقيق لنواسخ الجملة الاسمية والمفاعيل.',
    durationMinutes: 15,
    isPremium: true,
    createdAt: '2026-01-20T11:00:00.000Z',
    questions: [
      {
        id: 'qn2-1',
        questionText: 'في قوله تعالى: "وَكَانَ اللَّهُ غَفُوراً رَحِيماً"، كلمة "غفوراً" تعرب:',
        type: 'multiple_choice',
        options: ['حال منصوبة', 'خبر كان أول منصوب بالفتحة', 'مفعول به ثانٍ', 'نعت مرفوع'],
        correctAnswer: 1,
        explanation: 'غفوراً هو خبر كان الأول منصوب بالفتحة الظاهرة.',
      },
      {
        id: 'qn2-2',
        questionText: 'الحرف "لعلّ" من أخوات إن يفيد التمني المستحيل حدوثه.',
        type: 'true_false',
        options: ['صحيح', 'خطأ (يفيد الترجي الممكن والمحبوب)'],
        correctAnswer: 1,
        explanation: 'خطأ؛ ليت تفيد التمني للأمر المستحيل أو عسير الوقوع، أما لعل فتفيد الترجّي للأمر القريب والمحبوب أو الإشفاق.',
      },
      {
        id: 'qn2-3',
        questionText: 'أي نوع من المفاعيل يمثله اللفظ المخطوط في: "سافرتُ رَغْبَةً في الاستجمام"؟',
        type: 'multiple_choice',
        options: ['مفعول فيه', 'مفعول به', 'مفعول لأجله (مفعول له)', 'مفعول مطلق'],
        correctAnswer: 2,
        explanation: 'رغبةً مصدر قلبي يبين سبب وقوع الفعل وعِلته، ويعرب مفعولاً لأجله.',
      },
    ],
  },
  {
    id: 'quiz-trb-1',
    subjectId: 'subj-tarbiya',
    levelId: 'lvl-1',
    lessonId: 'les-trb-1',
    title: 'اختبار المفاهيم البيداغوجية والديداكتيكية',
    description: 'اختبار في المثلث الديداكتيكي، النقل التعليمي، ونظريات التعلم في الابتدائي.',
    durationMinutes: 12,
    isPremium: false,
    createdAt: '2026-01-16T12:00:00.000Z',
    questions: [
      {
        id: 'qt-1',
        questionText: 'الديداكتيك (Didactique) تركز بصورة مباشرة على:',
        type: 'multiple_choice',
        options: ['العلاقات الإنسانية فقط', 'طبيعة المادة التعليمية وتدريس مفاهيمها', 'الإدارة المدرسية والمالية', 'التربية البدنية'],
        correctAnswer: 1,
        explanation: 'الديداكتيك هي علم التدريس الذي يهتم بالمعرفة ومادتها وكيفية نقلها واستيعابها.',
      },
      {
        id: 'qt-2',
        questionText: 'التقويم التكويني (Formatif) يجرى فقط في نهاية السنة لتحديد النجاح والرسوب.',
        type: 'true_false',
        options: ['صحيح', 'خطأ (يرافق مسار التعلم لتقديم تغذية راجعة)'],
        correctAnswer: 1,
        explanation: 'خطأ؛ التقويم الذي يمنح الشهادة هو التقويم التحصيلي/الختامي، أما التكويني فيصاحب التعلم لمعالجة الصعوبات.',
      },
    ],
  },
];

let subscriptionPlans: SubscriptionPlan[] = [
  {
    id: 'plan-monthly',
    name: 'شهري',
    nameAr: 'اشتراك شهري',
    durationMonths: 1,
    priceDzd: 300,
    description: 'وصول كامل لكافة الدروس والملخصات والاختبارات لمدة شهر واحد.',
    features: [
      'الوصول لجميع الدروس المقفلة',
      'تحميل جميع الملخصات',
      'الاطلاع على ملفات PDF',
      'حل كافة الاختبارات وتقييم الإجابات',
      'دعم فني واستشارات',
    ],
  },
  {
    id: 'plan-3months',
    name: '3 أشهر',
    nameAr: 'اشتراك فصلي (3 أشهر)',
    durationMonths: 3,
    priceDzd: 700,
    features: [
      'تغطية كامل السداسي الدراسي',
      'تحميل وحفظ جميع ملفات PDF دون حد',
      'وصول للاختبارات الحصرية والمذكرات البيداغوجية',
      'توفير 200 دج مقارنة بالشهري',
    ],
  },
  {
    id: 'plan-6months',
    name: '6 أشهر',
    nameAr: 'اشتراك نصف سنوي (6 أشهر)',
    durationMonths: 6,
    priceDzd: 1200,
    popular: true,
    badge: 'الأكثر طلباً',
    features: [
      'تغطية عام دراسي كامل للطور الأول',
      'حقيبة المذكرات الجاهزة للطباعة',
      'نماذج امتحانات السداسيات السابقة مع التصحيح النموذجي',
      'أولوية الإجابة عن أسئلة الدروس من الأساتذة المشرفين',
    ],
  },
  {
    id: 'plan-yearly',
    name: 'سنوي',
    nameAr: 'الاشتراك السنوي الشامل',
    durationMonths: 12,
    priceDzd: 2000,
    yearly: true,
    badge: 'القيمة الأفضل (خصم 45%)',
    features: [
      'وصول غير محدود لمدة عام كامل (365 يوماً)',
      'شامل لكافة المواد والمقاييس (11 مقياساً)',
      'حقائب ونماذج امتحانات ومسابقات الترقية والتوظيف',
      'تحديثات فورية لكافة الدروس الجديدة ومذكرات الطور الابتدائي',
      'إمكانية استخدام المنصة دون أي قيود',
    ],
  },
];

let paymentTransactions: PaymentTransaction[] = [
  {
    id: 'tx-1001',
    userId: 'usr-student-prem',
    userEmail: 'farah@ostadhi.dz',
    planId: 'plan-yearly',
    planName: 'الاشتراك السنوي الشامل',
    amountDzd: 2000,
    method: 'Edahabia',
    cardNumberMasked: '•••• •••• •••• 4519',
    status: 'completed',
    createdAt: '2026-02-01T14:30:00.000Z',
  },
  {
    id: 'tx-1002',
    userId: 'usr-student-2',
    userEmail: 'karim@gmail.com',
    planId: 'plan-6months',
    planName: 'اشتراك نصف سنوي (6 أشهر)',
    amountDzd: 1200,
    method: 'CIB',
    cardNumberMasked: '•••• •••• •••• 8821',
    status: 'completed',
    createdAt: '2026-02-14T09:15:00.000Z',
  },
];

let studentProgress: Record<string, { completedLessons: string[]; quizResults: QuizResult[]; favoriteLessons: string[]; favoriteSummaries: string[] }> = {
  'usr-student-free': {
    completedLessons: ['les-nahw-1'],
    quizResults: [
      {
        id: 'res-1',
        quizId: 'quiz-nahw-1',
        userId: 'usr-student-free',
        quizTitle: 'اختبار تجريبي: أقسام الكلمة وعلامات الإعراب',
        subjectTitle: 'النحو العربي',
        score: 4,
        total: 4,
        percentage: 100,
        completedAt: '2026-01-20T14:00:00.000Z',
        answersReview: [],
      },
    ],
    favoriteLessons: ['les-nahw-1', 'les-trb-1'],
    favoriteSummaries: ['sum-1'],
  },
  'usr-student-prem': {
    completedLessons: ['les-nahw-1', 'les-nahw-2', 'les-nahw-3', 'les-sarf-1', 'les-trb-1', 'les-nfs-1'],
    quizResults: [
      {
        id: 'res-2',
        quizId: 'quiz-nahw-1',
        userId: 'usr-student-prem',
        quizTitle: 'اختبار تجريبي: أقسام الكلمة وعلامات الإعراب',
        subjectTitle: 'النحو العربي',
        score: 4,
        total: 4,
        percentage: 100,
        completedAt: '2026-02-05T10:00:00.000Z',
        answersReview: [],
      },
      {
        id: 'res-3',
        quizId: 'quiz-nahw-2',
        userId: 'usr-student-prem',
        quizTitle: 'اختبار النواسخ والمفاعيل المتقدم (Premium)',
        subjectTitle: 'النحو العربي',
        score: 3,
        total: 3,
        percentage: 100,
        completedAt: '2026-02-10T16:00:00.000Z',
        answersReview: [],
      },
    ],
    favoriteLessons: ['les-nahw-3', 'les-trb-2'],
    favoriteSummaries: ['sum-2'],
  },
};

let notifications: AppNotification[] = [
  {
    id: 'notif-1',
    title: 'تمت إضافة درس جديد في النحو 📚',
    message: 'يمكنك الآن دراسة درس "نواسخ الجملة الاسمية: كان وأخواتها وإن وأخواتها" مع مذكرات بيداغوجية نموذجية.',
    date: 'منذ ساعتين',
    type: 'lesson',
    isRead: false,
    link: '/subjects/subj-nahw',
  },
  {
    id: 'notif-2',
    title: 'اختبار تفاعلي جديد متاح الآن 📝',
    message: 'اختبر معارفك في درس أقسام الكلمة وعلامات الإعراب واحصل على تصحيح فوري.',
    date: 'منذ يومين',
    type: 'quiz',
    isRead: false,
    link: '/quizzes/quiz-nahw-1',
  },
  {
    id: 'notif-3',
    title: 'أهلاً بك في منصة أستاذي 🎓',
    message: 'منصتك الشاملة للتفوق في السنة الأولى أستاذ التعليم الابتدائي. تصفح المقاييس والدروس المجانية والمدفوعة.',
    date: 'منذ أسبوع',
    type: 'system',
    isRead: true,
    link: '/subjects',
  },
];

// Helper to get or init student progress
function getStudentProgress(userId: string) {
  if (!studentProgress[userId]) {
    studentProgress[userId] = {
      completedLessons: [],
      quizResults: [],
      favoriteLessons: [],
      favoriteSummaries: [],
    };
  }
  return studentProgress[userId];
}

// ----------------------
// API ROUTES
// ----------------------

// 1. Health & Bootstrap
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.get('/api/bootstrap', (req, res) => {
  const currentProgress = getStudentProgress(currentUser.id);
  res.json({
    currentUser,
    platformSettings,
    academicLevels,
    subjects,
    subscriptionPlans,
    notifications,
    studentProgress: currentProgress,
  });
});

// 2. Auth & Current User
app.get('/api/auth/me', (req, res) => {
  res.json({ user: currentUser });
});

app.post('/api/auth/switch-demo-user', (req, res) => {
  const { role, status, userId, email } = req.body;
  if (userId) {
    const foundById = users.find((u) => u.id === userId);
    if (foundById) {
      if (foundById.email.toLowerCase() === 'azc1744@gmail.com') {
        foundById.role = 'admin';
        foundById.subscriptionStatus = 'premium';
      }
      currentUser = foundById;
      return res.json({ success: true, user: currentUser });
    }
  }
  if (email && email.toLowerCase() === 'azc1744@gmail.com') {
    const adminUser = users.find((u) => u.email.toLowerCase() === 'azc1744@gmail.com') || users[0];
    adminUser.role = 'admin';
    adminUser.subscriptionStatus = 'premium';
    currentUser = adminUser;
    return res.json({ success: true, user: currentUser });
  }
  if (role === 'admin') {
    const adminUser = users.find((u) => u.role === 'admin' || u.email.toLowerCase() === 'azc1744@gmail.com') || users[0];
    adminUser.role = 'admin';
    adminUser.subscriptionStatus = 'premium';
    currentUser = adminUser;
  } else if (status === 'premium') {
    currentUser = users.find((u) => u.subscriptionStatus === 'premium' && u.role === 'student') || users[2] || users[1];
  } else {
    currentUser = users.find((u) => u.subscriptionStatus === 'free' && u.role === 'student') || users[1] || users[0];
  }
  res.json({ success: true, user: currentUser });
});

app.post('/api/auth/login', (req, res) => {
  const { email } = req.body;
  const cleanEmail = (email || '').toLowerCase().trim();
  const isAdminEmail = cleanEmail === 'azc1744@gmail.com' || cleanEmail.includes('admin');
  const found = users.find((u) => u.email.toLowerCase() === cleanEmail);
  if (found) {
    if (!found.isActive) {
      return res.status(403).json({ error: 'الحساب معطل من طرف الإدارة، يرجى التواصل مع الدعم.' });
    }
    if (isAdminEmail) {
      found.role = 'admin';
      found.subscriptionStatus = 'premium';
    }
    currentUser = found;
    return res.json({ success: true, user: currentUser });
  }

  // Create or sign in user seamlessly
  const newUser: User = {
    id: `usr-${Date.now()}`,
    name: email.split('@')[0] || 'طالب جديد',
    email,
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
    role: isAdminEmail ? 'admin' : 'student',
    subscriptionStatus: isAdminEmail ? 'premium' : 'free',
    subscriptionExpiresAt: isAdminEmail ? '2099-12-31T23:59:59.000Z' : null,
    academicLevel: 'السنة الأولى - لغة عربية',
    createdAt: new Date().toISOString(),
    isActive: true,
  };
  users.push(newUser);
  currentUser = newUser;
  res.json({ success: true, user: currentUser });
});

app.post('/api/auth/firebase-sync', (req, res) => {
  const { uid, email, displayName, photoURL } = req.body;
  if (!email) return res.status(400).json({ error: 'البريد الإلكتروني مطلوب' });

  const isAdminEmail = email.toLowerCase().trim() === 'azc1744@gmail.com';
  let found = users.find((u) => u.email.toLowerCase() === email.toLowerCase().trim() || u.id === uid);

  if (found) {
    if (isAdminEmail) {
      found.role = 'admin';
      found.subscriptionStatus = 'premium';
    }
    if (displayName) found.name = displayName;
    if (photoURL) found.avatar = photoURL;
    currentUser = found;
    return res.json({ success: true, user: currentUser });
  }

  const newUser: User = {
    id: uid || `usr-${Date.now()}`,
    name: displayName || email.split('@')[0] || 'طالب جديد',
    email,
    avatar: photoURL || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
    role: isAdminEmail ? 'admin' : 'student',
    subscriptionStatus: isAdminEmail ? 'premium' : 'free',
    subscriptionExpiresAt: null,
    academicLevel: 'السنة الأولى - لغة عربية',
    createdAt: new Date().toISOString(),
    isActive: true,
  };
  users.push(newUser);
  currentUser = newUser;
  res.json({ success: true, user: currentUser });
});

app.post('/api/auth/register', (req, res) => {
  const { name, email, academicLevel } = req.body;
  if (!name || !email) {
    return res.status(400).json({ error: 'الاسم والبريد الإلكتروني مطلوبان' });
  }
  const existing = users.find((u) => u.email.toLowerCase() === email.toLowerCase().trim());
  if (existing) {
    currentUser = existing;
    return res.json({ success: true, user: currentUser });
  }
  const newUser: User = {
    id: `usr-${Date.now()}`,
    name,
    email,
    avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name)}`,
    role: 'student',
    subscriptionStatus: 'free',
    subscriptionExpiresAt: null,
    academicLevel: academicLevel || 'السنة الأولى - لغة عربية',
    createdAt: new Date().toISOString(),
    isActive: true,
  };
  users.push(newUser);
  currentUser = newUser;
  res.json({ success: true, user: currentUser });
});

app.post('/api/auth/logout', (req, res) => {
  currentUser = users[0]; // Reset to demo free user
  res.json({ success: true });
});

// 3. Subjects
app.get('/api/subjects', (req, res) => {
  res.json(subjects);
});

app.get('/api/subjects/:id', (req, res) => {
  const subject = subjects.find((s) => s.id === req.params.id);
  if (!subject) return res.status(404).json({ error: 'المقياس غير موجود' });

  const subjectLessons = lessons.filter((l) => l.subjectId === subject.id);
  const subjectSummaries = summaries.filter((s) => s.subjectId === subject.id);
  const subjectPdfs = pdfFiles.filter((p) => p.subjectId === subject.id);
  const subjectQuizzes = quizzes.filter((q) => q.subjectId === subject.id);

  res.json({
    subject,
    lessons: subjectLessons,
    summaries: subjectSummaries,
    pdfs: subjectPdfs,
    quizzes: subjectQuizzes,
  });
});

app.post('/api/subjects', (req, res) => {
  if (!isAdmin(req)) {
    return res.status(403).json({ error: 'غير مصرح لك بإضافة مقاييس' });
  }
  const { title, description, code, icon, color, coverImage } = req.body;
  if (!title) return res.status(400).json({ error: 'عنوان المقياس مطلوب' });

  const newSubject: Subject = {
    id: `subj-${Date.now()}`,
    levelId: 'lvl-1',
    title,
    code: code || `SUBJ-${subjects.length + 1}`,
    description: description || '',
    icon: icon || 'BookOpen',
    color: color || 'emerald',
    coverImage: coverImage || 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?auto=format&fit=crop&w=600&q=80',
    lessonsCount: 0,
    summariesCount: 0,
    pdfsCount: 0,
    quizzesCount: 0,
    order: subjects.length + 1,
  };
  subjects.push(newSubject);
  res.json({ success: true, subject: newSubject });
});

app.put('/api/subjects/:id', (req, res) => {
  if (!isAdmin(req)) return res.status(403).json({ error: 'غير مصرح' });
  const idx = subjects.findIndex((s) => s.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'المقياس غير موجود' });
  subjects[idx] = { ...subjects[idx], ...req.body };
  res.json({ success: true, subject: subjects[idx] });
});

app.delete('/api/subjects/:id', (req, res) => {
  if (!isAdmin(req)) return res.status(403).json({ error: 'غير مصرح' });
  subjects = subjects.filter((s) => s.id !== req.params.id);
  lessons = lessons.filter((l) => l.subjectId !== req.params.id);
  summaries = summaries.filter((s) => s.subjectId !== req.params.id);
  pdfFiles = pdfFiles.filter((p) => p.subjectId !== req.params.id);
  quizzes = quizzes.filter((q) => q.subjectId !== req.params.id);
  res.json({ success: true });
});

// Media & File Upload Endpoint (Images, Videos, Documents)
app.post('/api/upload', (req, res) => {
  if (!isAdmin(req)) return res.status(403).json({ error: 'غير مصرح لرفع الملفات' });
  const { data, filename, category = 'general' } = req.body;
  if (!data) return res.status(400).json({ error: 'البيانات ناقصة، يرجى تزويد الملف' });

  try {
    const validCategories = ['lessons', 'summaries', 'videos', 'images', 'general'];
    const cleanCategory = validCategories.includes(category) ? category : 'general';
    const targetFolder = path.join(uploadsBaseDir, cleanCategory);
    if (!fs.existsSync(targetFolder)) {
      fs.mkdirSync(targetFolder, { recursive: true });
    }

    let base64Data = data;
    let extension = 'bin';

    if (data.includes(';base64,')) {
      const parts = data.split(';base64,');
      const header = parts[0];
      base64Data = parts[1];
      if (header.includes('image/jpeg') || header.includes('image/jpg')) extension = 'jpg';
      else if (header.includes('image/png')) extension = 'png';
      else if (header.includes('image/webp')) extension = 'webp';
      else if (header.includes('image/gif')) extension = 'gif';
      else if (header.includes('image/svg')) extension = 'svg';
      else if (header.includes('video/mp4')) extension = 'mp4';
      else if (header.includes('video/webm')) extension = 'webm';
      else if (header.includes('video/ogg')) extension = 'ogv';
      else if (header.includes('video/quicktime')) extension = 'mov';
    } else if (filename && filename.includes('.')) {
      const ext = filename.split('.').pop()?.toLowerCase();
      if (ext) extension = ext;
    }

    const safeBaseName = (filename ? filename.replace(/[^a-zA-Z0-9_\u0600-\u06FF.-]/g, '_') : 'media')
      .replace(/\.[^/.]+$/, '');
    const uniqueFilename = `${safeBaseName}-${Date.now()}.${extension}`;
    const filePath = path.join(targetFolder, uniqueFilename);

    const buffer = Buffer.from(base64Data, 'base64');
    fs.writeFileSync(filePath, buffer);

    const publicUrl = `/uploads/${cleanCategory}/${uniqueFilename}`;
    const sizeInBytes = buffer.length;
    const formattedSize =
      sizeInBytes > 1024 * 1024
        ? `${(sizeInBytes / (1024 * 1024)).toFixed(2)} MB`
        : `${(sizeInBytes / 1024).toFixed(1)} KB`;

    return res.json({
      success: true,
      url: publicUrl,
      filename: uniqueFilename,
      size: formattedSize,
      category: cleanCategory,
      type: ['mp4', 'webm', 'mov', 'ogv'].includes(extension) ? 'video' : 'image',
    });
  } catch (err: any) {
    console.error('File upload error:', err);
    return res.status(500).json({ error: 'فشل حفظ الملف على الخادم', details: err.message });
  }
});

// 4. Lessons with Server-Side Premium Enforcing
app.get('/api/lessons', (req, res) => {
  const subjectId = req.query.subjectId as string | undefined;
  if (subjectId) {
    return res.json(lessons.filter((l) => l.subjectId === subjectId));
  }
  res.json(lessons);
});

app.get('/api/lessons/:id', (req, res) => {
  const lesson = lessons.find((l) => l.id === req.params.id);
  if (!lesson) return res.status(404).json({ error: 'الدرس غير موجود' });

  const subject = subjects.find((s) => s.id === lesson.subjectId);
  const activeUser = getRequestUser(req);
  const isPremiumUser = activeUser.subscriptionStatus === 'premium' || activeUser.role === 'admin' || activeUser.email.toLowerCase() === 'azc1744@gmail.com';

  lesson.viewsCount += 1;

  // Server-side Protection: If lesson is Premium and user is Free, return restricted content
  if (lesson.isPremium && !isPremiumUser) {
    return res.json({
      lesson: {
        id: lesson.id,
        subjectId: lesson.subjectId,
        levelId: lesson.levelId,
        title: lesson.title,
        excerpt: lesson.excerpt,
        quickSummary: lesson.quickSummary,
        readingTimeMinutes: lesson.readingTimeMinutes,
        isPremium: true,
        order: lesson.order,
        viewsCount: lesson.viewsCount,
        createdAt: lesson.createdAt,
        subheadings: [
          {
            id: 'locked-preview',
            title: 'المحتوى الكامل متاح فقط لأعضاء باقة Premium',
            body: 'يتضمن هذا الدرس شرحاً مفصلاً لجميع القواعد اللغوية مع المذكرات البيداغوجية والتمارين النموذجية المحلولة. اشترك الآن في الباقة لفتح كافة الدروس والملخصات والاختبارات التفاعلية.',
            keyPoints: ['محتوى حصري لطلبة السنة الأولى', 'مذكرات بيداغوجية جاهزة للتحميل'],
          },
        ],
        isLockedForUser: true,
      },
      subject,
    });
  }

  const fallbackContent = lesson.content || (lesson.subheadings || []).map((s) => {
    let part = `## ${s.title}\n\n${s.body}`;
    if (s.examples && s.examples.length > 0) {
      part += `\n\n### أمثلة وتطبيقات\n\n` + s.examples.map((e) => `* ${e}`).join('\n');
    }
    if (s.keyPoints && s.keyPoints.length > 0) {
      part += `\n\n### إضاءات منهجية\n\n` + s.keyPoints.map((k) => `> ${k}`).join('\n');
    }
    return part;
  }).join('\n\n') || 'لا يوجد محتوى مسجل لهذا الدرس حتى الآن.';

  res.json({
    lesson: {
      ...lesson,
      content: fallbackContent,
      isLockedForUser: false,
    },
    subject,
  });
});

app.post('/api/lessons', (req, res) => {
  if (!isAdmin(req)) return res.status(403).json({ error: 'غير مصرح' });
  const {
    title,
    subjectId,
    excerpt,
    content,
    quickSummary,
    readingTimeMinutes,
    isPremium,
    subheadings,
    imageUrl,
    videoUrl,
    videoTitle,
    videoDuration,
  } = req.body;
  if (!title || !subjectId) return res.status(400).json({ error: 'البيانات ناقصة' });

  const newLesson: Lesson = {
    id: `les-${Date.now()}`,
    subjectId,
    levelId: 'lvl-1',
    title,
    excerpt: excerpt || '',
    content: content || '',
    quickSummary: quickSummary || '',
    readingTimeMinutes: Number(readingTimeMinutes) || 10,
    isPremium: Boolean(isPremium),
    order: lessons.filter((l) => l.subjectId === subjectId).length + 1,
    viewsCount: 0,
    createdAt: new Date().toISOString(),
    subheadings: subheadings || [],
    imageUrl: imageUrl || '',
    videoUrl: videoUrl || '',
    videoTitle: videoTitle || '',
    videoDuration: videoDuration || '',
  };
  lessons.push(newLesson);

  // Update subject lessonsCount
  const subj = subjects.find((s) => s.id === subjectId);
  if (subj) subj.lessonsCount += 1;

  res.json({ success: true, lesson: newLesson });
});

app.put('/api/lessons/:id', (req, res) => {
  if (!isAdmin(req)) return res.status(403).json({ error: 'غير مصرح' });
  const idx = lessons.findIndex((l) => l.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'الدرس غير موجود' });
  lessons[idx] = { ...lessons[idx], ...req.body };
  res.json({ success: true, lesson: lessons[idx] });
});

app.delete('/api/lessons/:id', (req, res) => {
  if (!isAdmin(req)) return res.status(403).json({ error: 'غير مصرح' });
  const lesson = lessons.find((l) => l.id === req.params.id);
  if (lesson) {
    const subj = subjects.find((s) => s.id === lesson.subjectId);
    if (subj && subj.lessonsCount > 0) subj.lessonsCount -= 1;
  }
  lessons = lessons.filter((l) => l.id !== req.params.id);
  res.json({ success: true });
});

// 5. Summaries
app.get('/api/summaries', (req, res) => {
  res.json(summaries);
});

app.post('/api/summaries', (req, res) => {
  if (!isAdmin(req)) return res.status(403).json({ error: 'غير مصرح' });
  const { title, subjectId, excerpt, keyPoints, fullSummary, isPremium, imageUrl, images, videoUrl } = req.body;
  const newSummary: Summary = {
    id: `sum-${Date.now()}`,
    subjectId,
    levelId: 'lvl-1',
    title,
    excerpt: excerpt || '',
    keyPoints: keyPoints || [],
    fullSummary: fullSummary || '',
    isPremium: Boolean(isPremium),
    downloadsCount: 0,
    createdAt: new Date().toISOString(),
    imageUrl: imageUrl || '',
    images: images || [],
    videoUrl: videoUrl || '',
  };
  summaries.push(newSummary);

  const subj = subjects.find((s) => s.id === subjectId);
  if (subj) subj.summariesCount += 1;

  res.json({ success: true, summary: newSummary });
});

app.put('/api/summaries/:id', (req, res) => {
  if (!isAdmin(req)) return res.status(403).json({ error: 'غير مصرح' });
  const idx = summaries.findIndex((s) => s.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'الملخص غير موجود' });
  summaries[idx] = { ...summaries[idx], ...req.body };
  res.json({ success: true, summary: summaries[idx] });
});

app.delete('/api/summaries/:id', (req, res) => {
  if (!isAdmin(req)) return res.status(403).json({ error: 'غير مصرح' });
  summaries = summaries.filter((s) => s.id !== req.params.id);
  res.json({ success: true });
});

// 6. PDF Files with Server-Side Authorization
app.get('/api/pdfs', (req, res) => {
  res.json(pdfFiles);
});

app.get('/api/pdfs/:id/download', (req, res) => {
  const pdf = pdfFiles.find((p) => p.id === req.params.id);
  if (!pdf) return res.status(404).json({ error: 'الملف غير موجود' });

  const activeUser = getRequestUser(req);
  const isPremiumUser = activeUser.subscriptionStatus === 'premium' || activeUser.role === 'admin' || activeUser.email.toLowerCase() === 'azc1744@gmail.com';
  if (pdf.isPremium && !isPremiumUser) {
    return res.status(403).json({
      error: 'PREMIUM_REQUIRED',
      message: 'عذراً! هذا الملف مخصص حصرياً للمشتركين في باقة Premium. يرجى الترقية لتحميله وقراءته.',
    });
  }

  res.json({
    success: true,
    fileUrl: pdf.fileUrl,
    title: pdf.title,
  });
});

app.post('/api/pdfs', (req, res) => {
  if (!isAdmin(req)) return res.status(403).json({ error: 'غير مصرح' });
  const { title, subjectId, description, fileUrl, fileSize, pagesCount, isPremium, coverImage } = req.body;
  const newPdf: PDFFile = {
    id: `pdf-${Date.now()}`,
    subjectId,
    levelId: 'lvl-1',
    title,
    description: description || '',
    fileUrl: fileUrl || 'https://example.com/demo.pdf',
    fileSize: fileSize || '3.2 MB',
    pagesCount: Number(pagesCount) || 24,
    isPremium: Boolean(isPremium),
    coverImage: coverImage || 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=600&q=80',
    createdAt: new Date().toISOString(),
  };
  pdfFiles.push(newPdf);

  const subj = subjects.find((s) => s.id === subjectId);
  if (subj) subj.pdfsCount += 1;

  res.json({ success: true, pdf: newPdf });
});

app.delete('/api/pdfs/:id', (req, res) => {
  if (!isAdmin(req)) return res.status(403).json({ error: 'غير مصرح' });
  pdfFiles = pdfFiles.filter((p) => p.id !== req.params.id);
  res.json({ success: true });
});

// 7. Quizzes & Submissions
app.get('/api/quizzes', (req, res) => {
  res.json(quizzes);
});

app.get('/api/quizzes/:id', (req, res) => {
  const quiz = quizzes.find((q) => q.id === req.params.id);
  if (!quiz) return res.status(404).json({ error: 'الاختبار غير موجود' });

  const activeUser = getRequestUser(req);
  const isPremiumUser = activeUser.subscriptionStatus === 'premium' || activeUser.role === 'admin' || activeUser.email.toLowerCase() === 'azc1744@gmail.com';
  if (quiz.isPremium && !isPremiumUser) {
    return res.json({
      quiz: {
        id: quiz.id,
        subjectId: quiz.subjectId,
        levelId: quiz.levelId,
        title: quiz.title,
        description: quiz.description,
        durationMinutes: quiz.durationMinutes,
        isPremium: true,
        isLockedForUser: true,
        questionsCount: quiz.questions.length,
      },
    });
  }

  // Strip answers during live test
  const sanitizedQuestions = quiz.questions.map((q) => ({
    id: q.id,
    questionText: q.questionText,
    type: q.type,
    options: q.options,
  }));

  res.json({
    quiz: {
      ...quiz,
      questions: sanitizedQuestions,
      isLockedForUser: false,
    },
  });
});

app.post('/api/quizzes/:id/submit', (req, res) => {
  const { userAnswers } = req.body; // Record<questionId, selectedOptionIndex>
  const quiz = quizzes.find((q) => q.id === req.params.id);
  if (!quiz) return res.status(404).json({ error: 'الاختبار غير موجود' });

  const subject = subjects.find((s) => s.id === quiz.subjectId);

  let correctCount = 0;
  const answersReview = quiz.questions.map((q) => {
    const selected = userAnswers[q.id];
    const isCorrect = selected === q.correctAnswer;
    if (isCorrect) correctCount++;
    return {
      questionId: q.id,
      questionText: q.questionText,
      selectedOption: selected !== undefined ? selected : -1,
      correctOption: q.correctAnswer,
      isCorrect,
      explanation: q.explanation,
    };
  });

  const total = quiz.questions.length;
  const percentage = Math.round((correctCount / total) * 100);

  const result: QuizResult = {
    id: `res-${Date.now()}`,
    quizId: quiz.id,
    userId: currentUser.id,
    quizTitle: quiz.title,
    subjectTitle: subject ? subject.title : 'مقياس عام',
    score: correctCount,
    total,
    percentage,
    completedAt: new Date().toISOString(),
    answersReview,
  };

  const progress = getStudentProgress(currentUser.id);
  progress.quizResults.unshift(result);

  res.json({ success: true, result });
});

app.post('/api/quizzes', (req, res) => {
  if (!isAdmin(req)) return res.status(403).json({ error: 'غير مصرح' });
  const { title, subjectId, description, durationMinutes, isPremium, questions } = req.body;

  const newQuiz: Quiz = {
    id: `quiz-${Date.now()}`,
    subjectId,
    levelId: 'lvl-1',
    title,
    description: description || '',
    durationMinutes: Number(durationMinutes) || 15,
    isPremium: Boolean(isPremium),
    questions: questions || [],
    createdAt: new Date().toISOString(),
  };
  quizzes.push(newQuiz);

  const subj = subjects.find((s) => s.id === subjectId);
  if (subj) subj.quizzesCount += 1;

  res.json({ success: true, quiz: newQuiz });
});

app.delete('/api/quizzes/:id', (req, res) => {
  if (!isAdmin(req)) return res.status(403).json({ error: 'غير مصرح' });
  quizzes = quizzes.filter((q) => q.id !== req.params.id);
  res.json({ success: true });
});

// 8. Progress & Favorites
app.get('/api/progress', (req, res) => {
  const progress = getStudentProgress(currentUser.id);
  res.json(progress);
});

app.post('/api/progress/toggle-lesson', (req, res) => {
  const { lessonId } = req.body;
  const progress = getStudentProgress(currentUser.id);
  const exists = progress.completedLessons.includes(lessonId);
  if (exists) {
    progress.completedLessons = progress.completedLessons.filter((id) => id !== lessonId);
  } else {
    progress.completedLessons.push(lessonId);
  }
  res.json({ success: true, isCompleted: !exists, completedLessons: progress.completedLessons });
});

app.post('/api/progress/toggle-favorite', (req, res) => {
  const { type, id } = req.body; // type: 'lesson' | 'summary'
  const progress = getStudentProgress(currentUser.id);
  if (type === 'lesson') {
    const exists = progress.favoriteLessons.includes(id);
    if (exists) {
      progress.favoriteLessons = progress.favoriteLessons.filter((x) => x !== id);
    } else {
      progress.favoriteLessons.push(id);
    }
    return res.json({ success: true, isFavorite: !exists, favoriteLessons: progress.favoriteLessons });
  } else {
    const exists = progress.favoriteSummaries.includes(id);
    if (exists) {
      progress.favoriteSummaries = progress.favoriteSummaries.filter((x) => x !== id);
    } else {
      progress.favoriteSummaries.push(id);
    }
    return res.json({ success: true, isFavorite: !exists, favoriteSummaries: progress.favoriteSummaries });
  }
});

// 9. Subscriptions & Payments Architecture
app.get('/api/subscriptions/plans', (req, res) => {
  res.json(subscriptionPlans);
});

app.put('/api/subscriptions/plans/:id', (req, res) => {
  if (!isAdmin(req)) return res.status(403).json({ error: 'غير مصرح' });
  const { priceDzd } = req.body;
  const plan = subscriptionPlans.find((p) => p.id === req.params.id);
  if (!plan) return res.status(404).json({ error: 'الخطة غير موجودة' });
  plan.priceDzd = Number(priceDzd);
  res.json({ success: true, plan });
});

// Checkout Simulation for CIB / Edahabia
// Checkout Simulation for CIB / Edahabia / Online
const handleCardCheckout = (req: any, res: any) => {
  const { planId, cardNumber, cardExpiry, cvv, paymentMethod } = req.body;
  const plan = subscriptionPlans.find((p) => p.id === planId);
  if (!plan) return res.status(404).json({ error: 'خطة الاشتراك غير صالحة' });

  // Validate card format minimally in test mode
  const cleanCard = (cardNumber || '').replace(/\s+/g, '');
  if (cleanCard.length < 12) {
    return res.status(400).json({ error: 'يرجى إدخال رقم بطاقة صحيح (16 رقماً)' });
  }

  // Calculate expiration date
  const now = new Date();
  const expiresAt = new Date();
  expiresAt.setMonth(now.getMonth() + plan.durationMonths);

  // Update user subscription
  currentUser.subscriptionStatus = 'premium';
  currentUser.subscriptionExpiresAt = expiresAt.toISOString();

  // Also update in users list
  const u = users.find((x) => x.id === currentUser.id);
  if (u) {
    u.subscriptionStatus = 'premium';
    u.subscriptionExpiresAt = expiresAt.toISOString();
  }

  // Record transaction
  const transaction: PaymentTransaction = {
    id: `tx-${Date.now()}`,
    userId: currentUser.id,
    userEmail: currentUser.email,
    userName: currentUser.name,
    planId: plan.id,
    planName: plan.nameAr,
    amountDzd: plan.priceDzd,
    method: paymentMethod === 'CIB' ? 'CIB' : 'Edahabia',
    cardNumberMasked: `•••• •••• •••• ${cleanCard.slice(-4)}`,
    status: 'completed',
    createdAt: new Date().toISOString(),
  };
  paymentTransactions.unshift(transaction);

  // Send congratulatory notification
  notifications.unshift({
    id: `notif-${Date.now()}`,
    title: 'تهانينا! تم تفعيل اشتراك Premium بنجاح 🎉',
    message: `أصبحت عضواً مميزاً في باقة "${plan.nameAr}". يمكنك الآن الوصول غير المحدود لكافة المحتويات.`,
    date: 'الآن',
    type: 'subscription',
    isRead: false,
    link: '/profile',
  });

  res.json({
    success: true,
    message: 'تمت معالجة الدفع بنجاح وترقية الحساب إلى Premium',
    transaction,
    user: currentUser,
  });
};

app.post('/api/payments/checkout', handleCardCheckout);
app.post('/api/subscriptions/checkout', handleCardCheckout);

// Offline payment transfer (BaridiMob RIP / CCP)
app.post('/api/payments/offline-transfer', (req, res) => {
  const { planId, method, transactionRef, senderPhone, receiptUrl, notes } = req.body;
  const plan = subscriptionPlans.find((p) => p.id === planId);
  if (!plan) return res.status(404).json({ error: 'خطة الاشتراك غير صالحة' });

  const transaction: PaymentTransaction = {
    id: `tx-${Date.now()}`,
    userId: currentUser.id,
    userEmail: currentUser.email,
    userName: currentUser.name,
    planId: plan.id,
    planName: plan.nameAr,
    amountDzd: plan.priceDzd,
    method: method === 'CCP' ? 'CCP' : 'BaridiMob',
    transactionRef: transactionRef || '',
    senderPhone: senderPhone || '',
    transferReceiptUrl: receiptUrl || '',
    notes: notes || '',
    status: 'pending',
    createdAt: new Date().toISOString(),
  };
  paymentTransactions.unshift(transaction);

  // Notify student
  notifications.unshift({
    id: `notif-${Date.now()}`,
    title: 'تم استلام طلب التحويل وهو قيد المعالجة ⏳',
    message: `تم تسجيل طلب اشتراكك في باقة "${plan.nameAr}" عبر ${method === 'CCP' ? 'حوالة CCP' : 'بريدي موب BaridiMob'}. سيتم التفعيل فور مراجعة المشرف.`,
    date: 'الآن',
    type: 'subscription',
    isRead: false,
    link: '/subscription',
  });

  res.json({
    success: true,
    message: 'تم إرسال طلب الاشتراك بنجاح، سيقوم المشرف بالتحقق وتفعيل اشتراكك سريعاً',
    transaction,
  });
});

// Helper to verify admin permissions robustly
const isAdminRequest = (req: any): boolean => {
  return isAdmin(req);
};

// Admin payments management
app.get('/api/admin/payments', (req, res) => {
  if (!isAdminRequest(req)) return res.status(403).json({ error: 'غير مصرح' });
  res.json(paymentTransactions);
});

app.post('/api/admin/payments/:id/approve', (req, res) => {
  if (!isAdminRequest(req)) return res.status(403).json({ error: 'غير مصرح' });
  const tx = paymentTransactions.find((t) => t.id === req.params.id);
  if (!tx) return res.status(404).json({ error: 'العملية غير موجودة' });

  tx.status = 'completed';

  const plan = subscriptionPlans.find((p) => p.id === tx.planId);
  const durationMonths = plan?.durationMonths || 1;

  const targetUser = users.find((u) => u.id === tx.userId || u.email === tx.userEmail);
  if (targetUser) {
    const expiresAt = new Date();
    expiresAt.setMonth(expiresAt.getMonth() + durationMonths);
    targetUser.subscriptionStatus = 'premium';
    targetUser.subscriptionExpiresAt = expiresAt.toISOString();
    if (currentUser.id === targetUser.id) {
      currentUser.subscriptionStatus = 'premium';
      currentUser.subscriptionExpiresAt = expiresAt.toISOString();
    }
  }

  // Notify the student
  notifications.unshift({
    id: `notif-${Date.now()}`,
    title: 'تم تفعيل باقة Premium بنجاح! 🎉',
    message: `تم التحقق من تحويلك (${tx.method}) وتفعيل باقة "${tx.planName}". استمتع بكافة الميزات غير المحدودة.`,
    date: 'الآن',
    type: 'subscription',
    isRead: false,
    link: '/subjects',
  });

  res.json({ success: true, transaction: tx, user: targetUser });
});

app.post('/api/admin/payments/:id/reject', (req, res) => {
  if (!isAdminRequest(req)) return res.status(403).json({ error: 'غير مصرح' });
  const tx = paymentTransactions.find((t) => t.id === req.params.id);
  if (!tx) return res.status(404).json({ error: 'العملية غير موجودة' });

  tx.status = 'rejected';
  res.json({ success: true, transaction: tx });
});

// 10. Admin Dashboard
app.get('/api/admin/metrics', (req, res) => {
  if (!isAdminRequest(req)) return res.status(403).json({ error: 'غير مصرح' });

  const totalUsers = users.length;
  const premiumUsers = users.filter((u) => u.subscriptionStatus === 'premium').length;
  const freeUsers = totalUsers - premiumUsers;
  const activeSubscriptions = paymentTransactions.filter((t) => t.status === 'completed').length;
  const estimatedRevenueDzd = paymentTransactions.reduce((acc, t) => acc + (t.amountDzd || 0), 0) + 142000;

  const metrics: AdminMetrics = {
    totalUsers,
    premiumUsers,
    freeUsers,
    activeSubscriptions,
    expiredSubscriptions: 0,
    totalLessons: lessons.length,
    totalSummaries: summaries.length,
    totalPdfs: pdfFiles.length,
    totalQuizzes: quizzes.length,
    estimatedRevenueDzd,
  };
  res.json({
    metrics,
    transactions: paymentTransactions,
    ...metrics,
    recentTransactions: paymentTransactions.slice(0, 10),
  });
});

app.get('/api/admin/users', (req, res) => {
  if (!isAdminRequest(req)) return res.status(403).json({ error: 'غير مصرح' });
  res.json(users);
});

app.put('/api/admin/users/:id', (req, res) => {
  if (!isAdminRequest(req)) return res.status(403).json({ error: 'غير مصرح' });
  const user = users.find((u) => u.id === req.params.id);
  if (!user) return res.status(404).json({ error: 'المستخدم غير موجود' });

  const { role, subscriptionStatus, isActive } = req.body;
  if (role !== undefined) user.role = role;
  if (subscriptionStatus !== undefined) user.subscriptionStatus = subscriptionStatus;
  if (isActive !== undefined) user.isActive = isActive;

  res.json({ success: true, user });
});

app.put('/api/admin/users/:id/subscription', (req, res) => {
  if (!isAdminRequest(req)) return res.status(403).json({ error: 'غير مصرح' });
  const user = users.find((u) => u.id === req.params.id);
  if (!user) return res.status(404).json({ error: 'المستخدم غير موجود' });

  const { status, expiresAt } = req.body;
  if (status) user.subscriptionStatus = status;
  user.subscriptionExpiresAt = expiresAt !== undefined ? expiresAt : (user.subscriptionStatus === 'premium' ? '2026-12-31T23:59:59.000Z' : null);

  if (currentUser.id === user.id) {
    currentUser.subscriptionStatus = user.subscriptionStatus;
    currentUser.subscriptionExpiresAt = user.subscriptionExpiresAt;
  }

  res.json({ success: true, user });
});

const handleUpdatePlanPrice = (req: any, res: any) => {
  if (!isAdminRequest(req)) return res.status(403).json({ error: 'غير مصرح' });
  const plan = subscriptionPlans.find((p) => p.id === req.params.id);
  if (!plan) return res.status(404).json({ error: 'الخطة غير موجودة' });
  const { priceDzd, nameAr, description, name } = req.body;
  if (priceDzd !== undefined) plan.priceDzd = Number(priceDzd);
  if (nameAr !== undefined) plan.nameAr = nameAr;
  if (name !== undefined) plan.name = name;
  if (description !== undefined) plan.description = description;
  res.json({ success: true, plan });
};

app.put('/api/subscriptions/plans/:id', handleUpdatePlanPrice);
app.put('/api/subscription-plans/:id', handleUpdatePlanPrice);

app.post('/api/admin/notifications', (req, res) => {
  if (!isAdminRequest(req)) return res.status(403).json({ error: 'غير مصرح' });
  const { title, message, type, link } = req.body;
  if (!title || !message) return res.status(400).json({ error: 'العنوان والرسالة مطلوبان' });

  const newNotif: AppNotification = {
    id: `notif-${Date.now()}`,
    title,
    message,
    date: 'الآن',
    type: type || 'system',
    isRead: false,
    link: link || '/subjects',
  };
  notifications.unshift(newNotif);
  res.json({ success: true, notification: newNotif });
});

app.get('/api/notifications', (req, res) => {
  res.json(notifications);
});

app.get('/api/admin/notifications', (req, res) => {
  res.json(notifications);
});

app.get('/api/subscription-plans', (req, res) => {
  res.json(subscriptionPlans);
});

app.get('/api/platform/settings', (req, res) => {
  res.json(platformSettings);
});

app.put('/api/admin/settings', (req, res) => {
  if (!isAdminRequest(req)) return res.status(403).json({ error: 'غير مصرح' });
  platformSettings = { ...platformSettings, ...req.body };
  res.json({ success: true, settings: platformSettings });
});

// 11. Search Across App
app.get('/api/search', (req, res) => {
  const query = (req.query.q as string || '').trim().toLowerCase();
  if (!query) return res.json({ subjects: [], lessons: [], summaries: [], quizzes: [] });

  const matchedSubjects = subjects.filter((s) => s.title.toLowerCase().includes(query) || s.description.toLowerCase().includes(query));
  const matchedLessons = lessons.filter((l) => l.title.toLowerCase().includes(query) || l.excerpt.toLowerCase().includes(query));
  const matchedSummaries = summaries.filter((s) => s.title.toLowerCase().includes(query) || s.excerpt.toLowerCase().includes(query));
  const matchedQuizzes = quizzes.filter((q) => q.title.toLowerCase().includes(query) || q.description.toLowerCase().includes(query));

  res.json({
    subjects: matchedSubjects,
    lessons: matchedLessons,
    summaries: matchedSummaries,
    quizzes: matchedQuizzes,
  });
});

// Catch-all 404 for unhandled /api/* endpoints to ensure JSON is always returned (never HTML)
app.all('/api/*', (req, res) => {
  res.status(404).json({ error: `API route ${req.method} ${req.path} not found` });
});

// ----------------------
// Vite Middleware & Startup
// ----------------------
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    // Resolve distPath safely across environments
    let distPath = path.join(process.cwd(), 'dist');
    if (!fs.existsSync(path.join(distPath, 'index.html'))) {
      if (fs.existsSync(path.join(__dirname, 'index.html'))) {
        distPath = __dirname;
      } else if (fs.existsSync(path.join(process.cwd(), 'index.html'))) {
        distPath = process.cwd();
      }
    }

    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      const indexPath = path.join(distPath, 'index.html');
      if (fs.existsSync(indexPath)) {
        res.sendFile(indexPath);
      } else {
        res.status(404).send('Not Found');
      }
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`أستاذي server is running live on http://0.0.0.0:${PORT}`);
  });
}

startServer();
