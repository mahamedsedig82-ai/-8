/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from "express";
import fs from "fs";
import path from "path";
import crypto from "crypto";
import type { DatabaseSchema, SiteSettings, Service, Project, Testimonial, FAQ, BlogPost, ContactMessage, Offer } from "./src/types.ts";

const app = express();
const PORT = 3000;

const IS_VERCEL = !!process.env.VERCEL;
const DATA_DIR = IS_VERCEL ? "/tmp/data" : path.join(process.cwd(), "data");
const UPLOADS_DIR = IS_VERCEL ? "/tmp/data/uploads" : path.join(DATA_DIR, "uploads");
const DB_FILE = IS_VERCEL ? "/tmp/data/db.json" : path.join(DATA_DIR, "db.json");

// Ensure data and uploads folders exist
if (!fs.existsSync(DATA_DIR)) {
  try {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  } catch (err) {
    console.error("Failed to create DATA_DIR:", err);
  }
}
if (!fs.existsSync(UPLOADS_DIR)) {
  try {
    fs.mkdirSync(UPLOADS_DIR, { recursive: true });
  } catch (err) {
    console.error("Failed to create UPLOADS_DIR:", err);
  }
}

// Copy default db.json on Vercel from project directory to /tmp
if (IS_VERCEL) {
  const ORIGINAL_DB_FILE = path.join(process.cwd(), "data", "db.json");
  if (!fs.existsSync(DB_FILE)) {
    try {
      if (fs.existsSync(ORIGINAL_DB_FILE)) {
        fs.copyFileSync(ORIGINAL_DB_FILE, DB_FILE);
        console.log("Successfully copied DB seed file to /tmp/data/db.json");
      }
    } catch (err) {
      console.error("Error copying DB file to /tmp:", err);
    }
  }
}

// Default Seed Database state in Arabic
const DEFAULT_DATABASE: DatabaseSchema & { adminUsername?: string, adminPasswordHash: string, visitorCount: number } = {
  adminUsername: "admin",
  adminPasswordHash: "kl1122#44", // Default admin password (will be securely hashed on first run / migration)
  visitorCount: 154, // Seed some initial visitors for realistic admin dashboard feel
  settings: {
    siteName: "إبداع الرقمية",
    siteLogo: "", // No default logo as requested by user
    logoWidth: 120,
    primaryColor: "#3b82f6", // Nice Tailwind Blue
    secondaryColor: "#1d4ed8", // Deep blue
    fontFamily: "Cairo",
    heroTitle: "نصنع الحلول الرقمية التي تمنح مشروعك التميز والريادة",
    heroSubtitle: "نحن وكالة إبداعية متكاملة متخصصة في تصميم وتطوير مواقع الويب الاحترافية، الهويات البصرية، والتسويق الرقمي بأحدث التقنيات وأفضل معايير الأداء.",
    heroBgImage: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=1200&auto=format&fit=crop",
    aboutTitle: "شريكك الموثوق في رحلة التحول الرقمي",
    aboutText: "نحن فريق من المصممين والمطورين الشغوفين ببناء تجارب رقمية استثنائية. نؤمن بأن كل موقع ويب هو بمثابة واجهة الهوية الفريدة لعملائنا، لذلك نحرص على دمج التصاميم المبتكرة مع الأكواد البرمجية النظيفة والسريعة جداً لتحقيق أقصى مستويات النجاح لمشروعك.\n\nعلى مدار سنوات، قمنا بتنفيذ عشرات المشاريع الناجحة لشركات محلية وعالمية، ونسعى دائماً لبناء علاقات طويلة الأمد مع عملائنا قائمة على الثقة والاحترافية والتميز المستمر.",
    aboutImage: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?q=80&w=600&auto=format&fit=crop",
    contactPhone: "+966 50 123 4567",
    contactEmail: "info@ebda3.com",
    contactAddress: "الرياض، برج العليا، المملكة العربية السعودية",
    contactWhatsapp: "966501234567",
    socialFacebook: "https://facebook.com",
    socialTwitter: "https://twitter.com",
    socialInstagram: "https://instagram.com",
    socialLinkedin: "https://linkedin.com",
    socialGithub: "https://github.com",
    sectionOrder: ["hero", "about", "offers", "services", "portfolio", "testimonials", "faq", "blog", "contact"],
    activeSections: {
      hero: true,
      about: true,
      services: true,
      portfolio: true,
      testimonials: true,
      faq: true,
      blog: true,
      contact: true,
      offers: true
    }
  },
  services: [
    {
      id: "srv-1",
      title: "تطوير تطبيقات ومواقع الويب",
      description: "برمجة وتطوير مواقع ويب سريعة جداً ومتجاوبة بالكامل مع الهواتف، باستخدام أحدث التقنيات مثل React و Next.js لضمان أفضل أداء وصداقة لمحركات البحث (SEO).",
      icon: "Globe"
    },
    {
      id: "srv-2",
      title: "تصميم تجربة وواجهات المستخدم UI/UX",
      description: "تصميم واجهات مستخدم تفاعلية وجذابة تركز على تلبية احتياجات عملائك وسلوكهم، مما يضمن زيادة نسبة التفاعل والمبيعات لمنتجاتك.",
      icon: "Palette"
    },
    {
      id: "srv-3",
      title: "بناء الهويات البصرية والشعارات",
      description: "نبتكر شعارات وهويات بصرية كاملة تنبض بالحياة وتعكس رؤية وقيم مشروعك وتترك انطباعاً قوياً ومستداماً لدى عملائك.",
      icon: "Briefcase"
    },
    {
      id: "srv-4",
      title: "التسويق الرقمي وإدارة الحملات",
      description: "إعداد وإدارة الحملات الإعلانية المدفوعة على منصات التواصل الاجتماعي ومحركات البحث وتهيئة المواقع (SEO) لتحقيق أعلى عائد على الاستثمار.",
      icon: "TrendingUp"
    }
  ],
  projects: [
    {
      id: "proj-1",
      title: "متجر أرابيكا للبن والقهوة المختصة",
      description: "منصة تجارة إلكترونية متكاملة لبيع القهوة الفاخرة وأدوات تحضيرها. يتميز بواجهة مستخدم مبتكرة، وسرعة فائقة في التصفح والتحميل، وتكامل تام مع بوابات الدفع الإلكتروني المحلية والدولية، مع توفير تجربة تتبع طلبات تفاعلية ومرنة.",
      category: "تطوير ويب",
      images: [
        "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?q=80&w=800&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1447933601403-0c6688de566e?q=80&w=800&auto=format&fit=crop"
      ],
      previewUrl: "https://example.com/arabica",
      clientName: "شركة أرابيكا للقهوة",
      clientUrl: "https://example.com",
      orderIndex: 0
    },
    {
      id: "proj-2",
      title: "منصة همة للخدمات والاستشارات الطبية",
      description: "تطبيق ويب متقدم يربط بين المرضى والأطباء المتخصصين لإجراء مشاورات طبية تفاعلية عن بعد. يضم غرف دردشة مشفرة، ونظام حجز مواعيد مرن، مع إمكانية الدفع الطبي الإلكتروني الآمن وإدارة السجلات الطبية بكفاءة وحماية تامة للمعلومات.",
      category: "تصميم واجهات",
      images: [
        "https://images.unsplash.com/photo-1505751172876-fa1923c5c528?q=80&w=800&auto=format&fit=crop"
      ],
      previewUrl: "https://example.com/himma",
      clientName: "مجموعة همة الطبية",
      clientUrl: "https://example.com",
      orderIndex: 1
    },
    {
      id: "proj-3",
      title: "الهوية البصرية المتكاملة لشركة نماء المالية",
      description: "بناء وتصميم الهوية التجارية الكاملة لشركة نماء المتخصصة في الاستثمارات التمويلية. شمل العمل تصميم الشعار، واختيار باليتة الألوان المؤسسية والخطوط الرسمية، وتصميم المواد المطبوعة (البيزنس كارد، ورق المراسلات، البروشورات) بالإضافة إلى واجهات موقعها التعريفي.",
      category: "هوية بصرية",
      images: [
        "https://images.unsplash.com/photo-1606857521015-7f9fcf423740?q=80&w=800&auto=format&fit=crop"
      ],
      previewUrl: "https://example.com/namaa",
      clientName: "مؤسسة نماء الاستثمارية",
      clientUrl: "https://example.com",
      orderIndex: 2
    }
  ],
  testimonials: [
    {
      id: "test-1",
      clientName: "المهندس خالد عبد الرحمن",
      clientRole: "المدير التنفيذي",
      clientCompany: "أرابيكا المحدودة",
      feedback: "التعامل مع الوكالة كان بمثابة قفزة نوعية لمتجرنا الإلكتروني. التزام مذهل بالمواعيد، تواصل احترافي، وأداء للموقع فاق توقعاتنا بكثير. سرعة التصفح ساهمت مباشرة في رفع مبيعاتنا بنسبة 35% خلال الشهر الأول.",
      rating: 5,
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=150&auto=format&fit=crop"
    },
    {
      id: "test-2",
      clientName: "الأستاذة سارة الحربي",
      clientRole: "مديرة الاتصال التسويقي",
      clientCompany: "شركة نماء الاستثمارية",
      feedback: "لقد نجحوا في تصميم هوية بصرية رائعة تميزنا عن منافسينا في السوق. الاهتمام بأدق التفاصيل والذوق الفني الراقي جعل هويتنا التجارية تظهر في أبهى وأرقى صورة ممكنة. شكراً جزيلاً لجهودكم المخلصة.",
      rating: 5,
      avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=150&auto=format&fit=crop"
    }
  ],
  faqs: [
    {
      id: "faq-1",
      question: "ما هي المدة اللازمة لتنفيذ موقع ويب تعريفي؟",
      answer: "في العادة، يستغرق تصميم وبرمجة المواقع التعريفية المتكاملة من 7 إلى 14 يوم عمل. تشمل هذه المدة التخطيط والتصميم والمراجعة والاختبار النهائي قبل الإطلاق على السيرفر الخاص بك."
    },
    {
      id: "faq-2",
      question: "هل يسهل علي تعديل محتوى موقعي بنفسي لاحقاً؟",
      answer: "نعم بكل تأكيد! نوفر لك لوحة تحكم إدارية باللغة العربية سهلة الاستخدام ومبسطة جداً، تتيح لك إضافة المشاريع، الخدمات، تعديل كافة النصوص والصور، وتخصيص الألوان بسهولة دون كتابة سطر برمجى واحد."
    },
    {
      id: "faq-3",
      question: "هل الموقع متوافق وسريع على الهواتف الذكية؟",
      answer: "نعم، نحن نطبق أعلى معايير تطوير الويب الحديثة والـ Core Web Vitals. الموقع متجاوب 100% مع كافة الشاشات، ويتم ضغط الصور وعمل Lazy Loading لها برمجياً لضمان سرعة تحميل فائقة على الهواتف المحمولة والشبكات الضعيفة."
    }
  ],
  blogs: [
    {
      id: "blog-1",
      title: "لماذا تعد تجربة المستخدم (UI/UX) حاسمة لزيادة مبيعاتك؟",
      summary: "تعرف على مدى تأثير تصميم واجهات الاستخدام وتسهيل رحلة الزائر داخل موقعك في تحويل متصفحي الويب إلى عملاء فعليين.",
      content: "في سوق التجارة الرقمية المزدحم اليوم، لم يعد امتلاك موقع إلكتروني جميلاً كافياً وحده، بل يجب أن يكون مريحاً ومبنياً بطريقة ذكية لخدمة أهداف المستخدم. تصميم واجهات وتجربة المستخدم (UI/UX) يهدف لتبسيط المسار الذي يتخذه العميل داخل موقعك؛ من التصفح وحتى إتمام الدفع أو التواصل المباشر. تشير الدراسات إلى أن كل دولار يُستثمر في تجربة المستخدم يحقق عائداً يصل إلى 100 دولار، كما أن المواقع سهلة التصفح تزيد ثقة العميل وتجعله يكرر عملية الشراء بشكل مستمر. في موقعنا نهتم بهذا الجانب لتسريع وتحسين تجربة العميل بالكامل.",
      image: "https://images.unsplash.com/photo-1541462608141-275d72e2302a?q=80&w=600&auto=format&fit=crop",
      date: "2026-07-18",
      readTime: "5 دقائق"
    },
    {
      id: "blog-2",
      title: "أسرار تصدر محركات البحث (SEO) للمواقع الحديثة",
      summary: "دليل عملي سريع للمبتكرين وأصحاب المشاريع لتهيئة مواقع الويب ومحركات البحث للظهور في الصفحة الأولى في جوجل وتصدر المنافسين.",
      content: "الوصول الطبيعي (Organic Traffic) لزوار موقعك عبر محركات البحث هو أفضل أنواع الزيارات لكونه مجانياً ومستهدفاً بدقة. لكي يتصدر موقعك محرك البحث جوجل، يجب التركيز على أربعة ركائز أساسية:\n\n1. سرعة الموقع الفائقة والاستجابة السريعة للهواتف.\n2. المحتوى الحصري والقيم الذي يجيب على تساؤلات الباحثين.\n3. التكويد السليم المتوافق مع هيكلة السيو التقني (Technical SEO) والعلامات التعريفية (Tags).\n4. الروابط الخارجية وعلامات ثقة المستخدم.\n\nمن خلال قالبنا الاحترافي المطوَّر، نوفر لك بنية برمجية تدعم محركات البحث تلقائياً لتمهد لك طريق النجاح.",
      image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=600&auto=format&fit=crop",
      date: "2026-07-15",
      readTime: "4 دقائق"
    }
  ],
  messages: [
    {
      id: "msg-1",
      name: "أحمد بن محمد",
      email: "ahmed@example.com",
      subject: "طلب استشارة لتطوير موقع عقاري",
      message: "مرحباً، أود الاستفسار عن إمكانية تطوير موقع عقاري متكامل يتيح تصفح العقارات وحجزها مع لوحة تحكم خاصة بنا، وكم هي التكلفة والوقت التقريبي. شكراً لكم.",
      date: "2026-07-18T10:30:00Z",
      isRead: false
    }
  ],
  offers: [
    {
      id: "offer-1",
      title: "خصم 20% على تطوير المواقع التعريفية",
      description: "احصل على موقع تعريفي متكامل لشركتك أو مشروعك الناشئ بأحدث التقنيات مع دعم فني لمدة عام كامل بخصم خاص لفترة محدودة.",
      imageUrl: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=800&auto=format&fit=crop",
      discountCode: "EBDA20",
      discountPercentage: 20,
      isActive: true,
      orderIndex: 0
    }
  ]
};

// Password hashing helper functions
function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = crypto.pbkdf2Sync(password, salt, 1000, 64, "sha512").toString("hex");
  return `${salt}:${hash}`;
}

function verifyPassword(password: string, storedHash: string): boolean {
  if (!storedHash) return false;
  if (!storedHash.includes(":")) {
    // Fallback for legacy plain text passwords if any
    return password === storedHash;
  }
  const [salt, originalHash] = storedHash.split(":");
  const hash = crypto.pbkdf2Sync(password, salt, 1000, 64, "sha512").toString("hex");
  return hash === originalHash;
}

// Helper to read database and perform migrations/upgrades on the fly
function getDb(): DatabaseSchema & { adminUsername?: string, adminPasswordHash: string, visitorCount: number } {
  if (!fs.existsSync(DB_FILE)) {
    // Generate default database with secure hashed default password
    const hashedDefaultPassword = hashPassword(DEFAULT_DATABASE.adminPasswordHash);
    const initialDb = {
      ...DEFAULT_DATABASE,
      adminUsername: "admin",
      adminPasswordHash: hashedDefaultPassword,
    };
    fs.writeFileSync(DB_FILE, JSON.stringify(initialDb, null, 2), "utf-8");
    return initialDb;
  }
  try {
    const raw = fs.readFileSync(DB_FILE, "utf-8");
    const db = JSON.parse(raw);
    
    // Safety check and migrations on-the-fly
    let changed = false;
    
    if (!db.adminUsername) {
      db.adminUsername = "admin";
      changed = true;
    }
    
    // Hash password if stored in plaintext (e.g. no ":" salt prefix)
    if (db.adminPasswordHash && !db.adminPasswordHash.includes(":")) {
      db.adminPasswordHash = hashPassword(db.adminPasswordHash);
      changed = true;
    }
    
    // Auto-migrate old default password "admin123" or corrupt/empty states to "kl1122#44" securely hashed
    const isOldPassword = verifyPassword("admin123", db.adminPasswordHash);
    const isNewPassword = verifyPassword("kl1122#44", db.adminPasswordHash);
    
    if (!isNewPassword && (isOldPassword || !db.adminPasswordHash || db.adminPasswordHash === "admin123" || db.adminPasswordHash === "kl1122#44" || db.adminPasswordHash.length < 10)) {
      db.adminPasswordHash = hashPassword("kl1122#44");
      db.adminUsername = "admin";
      changed = true;
    }

    if (!db.offers) {
      db.offers = [
        {
          id: "offer-1",
          title: "خصم 20% على تطوير المواقع التعريفية",
          description: "احصل على موقع تعريفي متكامل لشركتك أو مشروعك الناشئ بأحدث التقنيات مع دعم فني لمدة عام كامل بخصم خاص لفترة محدودة.",
          imageUrl: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=800&auto=format&fit=crop",
          discountCode: "EBDA20",
          discountPercentage: 20,
          isActive: true,
          orderIndex: 0
        }
      ];
      changed = true;
    }

    // Deep validation to prevent crashes if arrays are missing or corrupt
    if (!Array.isArray(db.services)) { db.services = []; changed = true; }
    if (!Array.isArray(db.projects)) { db.projects = []; changed = true; }
    if (!Array.isArray(db.testimonials)) { db.testimonials = []; changed = true; }
    if (!Array.isArray(db.faqs)) { db.faqs = []; changed = true; }
    if (!Array.isArray(db.blogs)) { db.blogs = []; changed = true; }
    if (!Array.isArray(db.messages)) { db.messages = []; changed = true; }

    if (db.settings && db.settings.activeSections && db.settings.activeSections.offers === undefined) {
      db.settings.activeSections.offers = true;
      changed = true;
    }

    if (db.settings) {
      if (db.settings.logoWidth === undefined) {
        db.settings.logoWidth = 120;
        changed = true;
      }
      if (!db.settings.sectionOrder) {
        db.settings.sectionOrder = ["hero", "about", "offers", "services", "portfolio", "testimonials", "faq", "blog", "contact"];
        changed = true;
      }
      if (db.settings.siteLogo === "Sparkles" || db.settings.siteLogo === "siteLogo") {
        db.settings.siteLogo = "";
        changed = true;
      }
    }

    if (changed) {
      saveDb(db);
    }

    return db;
  } catch (error) {
    console.error("Error reading database file, resetting to default:", error);
    // Return with hashed password
    const hashedDefaultPassword = hashPassword("kl1122#44");
    const initialDb = {
      ...DEFAULT_DATABASE,
      adminUsername: "admin",
      adminPasswordHash: hashedDefaultPassword,
    };
    return initialDb;
  }
}

// Helper to delete locally uploaded files from disk to prevent storage clutter
function deleteLocalFile(url: string | undefined | null) {
  if (!url || typeof url !== "string" || !url.startsWith("/uploads/")) return;
  try {
    const fileName = path.basename(url);
    if (fileName.includes("..") || fileName.includes("/") || fileName.includes("\\")) return;
    const filePath = path.join(UPLOADS_DIR, fileName);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      console.log(`Successfully deleted orphaned file from disk: ${fileName}`);
    }
  } catch (err) {
    console.error(`Failed to delete orphaned file ${url}:`, err);
  }
}

// Helper to save database
function saveDb(data: any) {
  try {
    // Validate database structure before writing to disk to prevent corrupt saves
    if (data && typeof data === "object") {
      if (!data.settings) data.settings = { ...DEFAULT_DATABASE.settings };
      if (!Array.isArray(data.services)) data.services = [];
      if (!Array.isArray(data.projects)) data.projects = [];
      if (!Array.isArray(data.testimonials)) data.testimonials = [];
      if (!Array.isArray(data.faqs)) data.faqs = [];
      if (!Array.isArray(data.blogs)) data.blogs = [];
      if (!Array.isArray(data.messages)) data.messages = [];
      if (!Array.isArray(data.offers)) data.offers = [];
    }
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), "utf-8");
  } catch (error) {
    console.error("Error saving database file:", error);
  }
}

// Memory session tokens
const activeSessions = new Set<string>();

// Middleware to parse JSON
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

// Serve static uploaded files
app.use("/uploads", express.static(UPLOADS_DIR));

// Request Logging & Path Normalization Middleware
app.use((req: express.Request, res: express.Response, next: express.NextFunction) => {
  const start = Date.now();
  
  // Clean up and normalize path for Vercel Serverless environment
  const urlPath = req.url.split('?')[0];

  // If request doesn't start with /api or /uploads and is an API resource
  if (!urlPath.startsWith("/api") && !urlPath.startsWith("/uploads") && urlPath !== "/" && urlPath !== "/index.html") {
    // Check if it matches known API routes
    const knownApiPrefixes = ["/settings", "/offers", "/services", "/projects", "/testimonials", "/faqs", "/blogs", "/stats", "/auth", "/messages", "/upload", "/backup", "/health"];
    if (knownApiPrefixes.some(prefix => urlPath.startsWith(prefix))) {
      req.url = "/api" + (req.url.startsWith("/") ? "" : "/") + req.url;
    }
  }

  res.on("finish", () => {
    const duration = Date.now() - start;
    console.log(`[Express API] ${req.method} ${req.url} -> Status: ${res.statusCode} (${duration}ms)`);
  });

  next();
});

// Root API Health & Readiness Endpoints
app.get(["/api", "/api/", "/api/health"], (req, res) => {
  res.json({
    status: "ok",
    message: "خادم الهوية والواجهة البرمجية لوكالة إبداع الرقمية يعمل بنجاح",
    timestamp: new Date().toISOString()
  });
});

// Authentication Middleware
function requireAuth(req: express.Request, res: express.Response, next: express.NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "غير مصرح بالدخول - الرجاء تسجيل الدخول أولاً" });
  }
  const token = authHeader.split(" ")[1];
  if (!activeSessions.has(token)) {
    return res.status(401).json({ error: "جلسة منتهية أو غير صالحة" });
  }
  next();
}

// API Routes

// Traffic counter trigger
app.post("/api/stats/increment-visitor", (req, res) => {
  const db = getDb();
  db.visitorCount = (db.visitorCount || 0) + 1;
  saveDb(db);
  res.json({ success: true, count: db.visitorCount });
});

// Authentication Routes
app.post("/api/auth/login", (req, res) => {
  const { username, password } = req.body;
  const db = getDb();
  const dbUsername = db.adminUsername || "admin";

  if (username === dbUsername && verifyPassword(password, db.adminPasswordHash)) {
    const token = "token_" + Math.random().toString(36).substring(2) + Date.now();
    activeSessions.add(token);
    return res.json({ token, user: { username: dbUsername } });
  }

  return res.status(400).json({ error: "اسم المستخدم أو كلمة المرور غير صحيحة" });
});

app.post("/api/auth/logout", (req, res) => {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith("Bearer ")) {
    const token = authHeader.split(" ")[1];
    activeSessions.delete(token);
  }
  res.json({ success: true });
});

app.get("/api/auth/me", (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ authenticated: false });
  }
  const token = authHeader.split(" ")[1];
  if (activeSessions.has(token)) {
    const db = getDb();
    return res.json({ authenticated: true, user: { username: db.adminUsername || "admin" } });
  }
  return res.status(401).json({ authenticated: false });
});

app.post("/api/auth/change-password", requireAuth, (req, res) => {
  const { currentPassword, newUsername, newPassword } = req.body;
  const db = getDb();

  if (!verifyPassword(currentPassword, db.adminPasswordHash)) {
    return res.status(400).json({ error: "كلمة المرور الحالية غير صحيحة" });
  }

  let updated = false;

  if (newUsername && newUsername.trim()) {
    const trimmedUsername = newUsername.trim();
    if (trimmedUsername.length < 3) {
      return res.status(400).json({ error: "يجب أن يكون اسم المستخدم مكوناً من 3 خانات على الأقل" });
    }
    db.adminUsername = trimmedUsername;
    updated = true;
  }

  if (newPassword && newPassword.trim()) {
    const trimmedPassword = newPassword.trim();
    if (trimmedPassword.length < 4) {
      return res.status(400).json({ error: "يجب أن تكون كلمة المرور الجديدة مكونة من 4 خانات على الأقل" });
    }
    db.adminPasswordHash = hashPassword(trimmedPassword);
    updated = true;
  }

  if (!updated) {
    return res.status(400).json({ error: "لم يتم توفير اسم مستخدم جديد أو كلمة مرور جديدة لتغييرها" });
  }

  saveDb(db);
  res.json({ success: true, message: "تم تحديث بيانات الاعتماد بنجاح" });
});

// Public Stats for Admin
app.get("/api/stats", requireAuth, (req, res) => {
  const db = getDb();
  const unreadMessagesCount = db.messages.filter(m => !m.isRead).length;
  res.json({
    visitorCount: db.visitorCount,
    messagesCount: db.messages.length,
    unreadMessagesCount,
    projectsCount: db.projects.length,
    servicesCount: db.services.length,
    blogsCount: db.blogs.length
  });
});

// Settings Management
app.get("/api/settings", (req, res) => {
  const db = getDb();
  res.json(db.settings);
});

app.put("/api/settings", requireAuth, (req, res) => {
  const db = getDb();
  db.settings = { ...db.settings, ...req.body };
  saveDb(db);
  res.json({ success: true, settings: db.settings });
});

// Services Management
app.get("/api/services", (req, res) => {
  const db = getDb();
  res.json(db.services);
});

app.post("/api/services", requireAuth, (req, res) => {
  const { title, description, icon } = req.body;
  if (!title || typeof title !== "string" || !title.trim()) {
    return res.status(400).json({ error: "عنوان الخدمة مطلوب ولا يمكن أن يكون فارغاً" });
  }
  if (!description || typeof description !== "string" || !description.trim()) {
    return res.status(400).json({ error: "وصف الخدمة مطلوب ولا يمكن أن يكون فارغاً" });
  }

  const db = getDb();
  const newService: Service = {
    id: "srv-" + Date.now(),
    title: title.trim(),
    description: description.trim(),
    icon: icon || "Sparkles"
  };
  db.services.push(newService);
  saveDb(db);
  res.json(newService);
});

app.put("/api/services/:id", requireAuth, (req, res) => {
  const { id } = req.params;
  const { title, description } = req.body;

  if (title !== undefined && (!title || typeof title !== "string" || !title.trim())) {
    return res.status(400).json({ error: "عنوان الخدمة لا يمكن أن يكون فارغاً" });
  }
  if (description !== undefined && (!description || typeof description !== "string" || !description.trim())) {
    return res.status(400).json({ error: "وصف الخدمة لا يمكن أن يكون فارغاً" });
  }

  const db = getDb();
  const index = db.services.findIndex(s => s.id === id);
  if (index !== -1) {
    db.services[index] = { ...db.services[index], ...req.body };
    saveDb(db);
    res.json(db.services[index]);
  } else {
    res.status(404).json({ error: "الخدمة غير موجودة" });
  }
});

app.delete("/api/services/:id", requireAuth, (req, res) => {
  const { id } = req.params;
  const db = getDb();
  db.services = db.services.filter(s => s.id !== id);
  saveDb(db);
  res.json({ success: true });
});

// Offers Management
app.get("/api/offers", (req, res) => {
  const db = getDb();
  const sorted = [...(db.offers || [])].sort((a, b) => (a.orderIndex || 0) - (b.orderIndex || 0));
  res.json(sorted);
});

app.post("/api/offers", requireAuth, (req, res) => {
  const { title, description, discountPercentage, imageUrl, discountCode, isActive } = req.body;
  if (!title || typeof title !== "string" || !title.trim()) {
    return res.status(400).json({ error: "عنوان العرض مطلوب ولا يمكن أن يكون فارغاً" });
  }
  if (!description || typeof description !== "string" || !description.trim()) {
    return res.status(400).json({ error: "وصف العرض مطلوب ولا يمكن أن يكون فارغاً" });
  }
  if (discountPercentage !== undefined && discountPercentage !== "") {
    const num = Number(discountPercentage);
    if (isNaN(num) || num < 0 || num > 100) {
      return res.status(400).json({ error: "نسبة الخصم يجب أن تكون رقماً مئوياً بين 0 و 100" });
    }
  }

  const db = getDb();
  const maxOrder = (db.offers || []).reduce((max, o) => Math.max(max, o.orderIndex || 0), -1);
  const newOffer: Offer = {
    id: "offer-" + Date.now(),
    title: title.trim(),
    description: description.trim(),
    imageUrl: imageUrl || "",
    discountCode: discountCode || "",
    discountPercentage: discountPercentage !== undefined && discountPercentage !== "" ? Number(discountPercentage) : undefined,
    isActive: isActive !== undefined ? !!isActive : true,
    orderIndex: maxOrder + 1
  };
  if (!db.offers) db.offers = [];
  db.offers.push(newOffer);
  saveDb(db);
  res.json(newOffer);
});

app.put("/api/offers/reorder", requireAuth, (req, res) => {
  const { orderedIds } = req.body;
  if (!Array.isArray(orderedIds)) {
    return res.status(400).json({ error: "تنسيق معرفات الترتيب غير صالح" });
  }
  const db = getDb();
  db.offers = (db.offers || []).map(offer => {
    const idx = orderedIds.indexOf(offer.id);
    return {
      ...offer,
      orderIndex: idx !== -1 ? idx : (offer.orderIndex || 0)
    };
  });
  saveDb(db);
  res.json({ success: true, offers: db.offers });
});

app.put("/api/offers/:id", requireAuth, (req, res) => {
  const { id } = req.params;
  const { title, description, discountPercentage, imageUrl } = req.body;

  if (title !== undefined && (!title || typeof title !== "string" || !title.trim())) {
    return res.status(400).json({ error: "عنوان العرض لا يمكن أن يكون فارغاً" });
  }
  if (description !== undefined && (!description || typeof description !== "string" || !description.trim())) {
    return res.status(400).json({ error: "وصف العرض لا يمكن أن يكون فارغاً" });
  }
  if (discountPercentage !== undefined && discountPercentage !== "") {
    const num = Number(discountPercentage);
    if (isNaN(num) || num < 0 || num > 100) {
      return res.status(400).json({ error: "نسبة الخصم يجب أن تكون رقماً مئوياً بين 0 و 100" });
    }
  }

  const db = getDb();
  const index = (db.offers || []).findIndex(o => o.id === id);
  if (index !== -1) {
    // Delete old local file if image is changed/updated
    const oldImage = db.offers[index].imageUrl;
    if (imageUrl && imageUrl !== oldImage) {
      deleteLocalFile(oldImage);
    }

    db.offers[index] = { 
      ...db.offers[index], 
      ...req.body,
      discountPercentage: discountPercentage !== undefined && discountPercentage !== "" ? Number(discountPercentage) : undefined 
    };
    saveDb(db);
    res.json(db.offers[index]);
  } else {
    res.status(404).json({ error: "العرض غير موجود" });
  }
});

app.delete("/api/offers/:id", requireAuth, (req, res) => {
  const { id } = req.params;
  const db = getDb();
  const index = (db.offers || []).findIndex(o => o.id === id);
  if (index !== -1) {
    const offer = db.offers[index];
    // Delete associated physical image
    deleteLocalFile(offer.imageUrl);
    
    db.offers = db.offers.filter(o => o.id !== id);
    saveDb(db);
    res.json({ success: true });
  } else {
    res.status(404).json({ error: "العرض غير موجود" });
  }
});

// Projects Management (Portfolio)
app.get("/api/projects", (req, res) => {
  const db = getDb();
  // Sort projects by orderIndex
  const sorted = [...db.projects].sort((a, b) => (a.orderIndex || 0) - (b.orderIndex || 0));
  res.json(sorted);
});

app.post("/api/projects", requireAuth, (req, res) => {
  const { title, description, category, images, previewUrl, clientName, clientUrl } = req.body;
  if (!title || typeof title !== "string" || !title.trim()) {
    return res.status(400).json({ error: "عنوان المشروع مطلوب ولا يمكن أن يكون فارغاً" });
  }
  if (!description || typeof description !== "string" || !description.trim()) {
    return res.status(400).json({ error: "وصف المشروع مطلوب ولا يمكن أن يكون فارغاً" });
  }
  if (!category || typeof category !== "string" || !category.trim()) {
    return res.status(400).json({ error: "تصنيف أو مجال المشروع مطلوب" });
  }
  if (!Array.isArray(images) || images.length === 0) {
    return res.status(400).json({ error: "يجب إرفاق صورة واحدة على الأقل للمشروع" });
  }

  const db = getDb();
  const maxOrder = db.projects.reduce((max, p) => Math.max(max, p.orderIndex || 0), -1);
  const newProject: Project = {
    id: "proj-" + Date.now(),
    title: title.trim(),
    description: description.trim(),
    category: category.trim(),
    images: images.map(img => typeof img === "string" ? img.trim() : "").filter(Boolean),
    previewUrl: previewUrl || "",
    clientName: clientName || "",
    clientUrl: clientUrl || "",
    orderIndex: maxOrder + 1
  };
  db.projects.push(newProject);
  saveDb(db);
  res.json(newProject);
});

app.put("/api/projects/reorder", requireAuth, (req, res) => {
  const { orderedIds } = req.body;
  if (!Array.isArray(orderedIds)) {
    return res.status(400).json({ error: "تنسيق معرفات الترتيب غير صالح" });
  }
  const db = getDb();
  db.projects = db.projects.map(proj => {
    const idx = orderedIds.indexOf(proj.id);
    return {
      ...proj,
      orderIndex: idx !== -1 ? idx : (proj.orderIndex || 0)
    };
  });
  saveDb(db);
  res.json({ success: true, projects: db.projects });
});

app.put("/api/projects/:id", requireAuth, (req, res) => {
  const { id } = req.params;
  const { title, description, category, images } = req.body;

  if (title !== undefined && (!title || typeof title !== "string" || !title.trim())) {
    return res.status(400).json({ error: "عنوان المشروع لا يمكن أن يكون فارغاً" });
  }
  if (description !== undefined && (!description || typeof description !== "string" || !description.trim())) {
    return res.status(400).json({ error: "وصف المشروع لا يمكن أن يكون فارغاً" });
  }
  if (category !== undefined && (!category || typeof category !== "string" || !category.trim())) {
    return res.status(400).json({ error: "تصنيف المشروع لا يمكن أن يكون فارغاً" });
  }
  if (images !== undefined && (!Array.isArray(images) || images.length === 0)) {
    return res.status(400).json({ error: "يجب إرفاق صورة واحدة على الأقل للمشروع" });
  }

  const db = getDb();
  const index = db.projects.findIndex(p => p.id === id);
  if (index !== -1) {
    const oldProject = db.projects[index];
    const newImages = images || [];

    // Diff images: delete any old local image that was removed in the new images array
    if (Array.isArray(oldProject.images)) {
      oldProject.images.forEach(oldImg => {
        if (!newImages.includes(oldImg)) {
          deleteLocalFile(oldImg);
        }
      });
    }

    db.projects[index] = { ...db.projects[index], ...req.body };
    saveDb(db);
    res.json(db.projects[index]);
  } else {
    res.status(404).json({ error: "المشروع غير موجود" });
  }
});

app.delete("/api/projects/:id", requireAuth, (req, res) => {
  const { id } = req.params;
  const db = getDb();
  const index = db.projects.findIndex(p => p.id === id);
  if (index !== -1) {
    const project = db.projects[index];
    // Delete all associated local files from disk
    if (Array.isArray(project.images)) {
      project.images.forEach(img => deleteLocalFile(img));
    }

    db.projects = db.projects.filter(p => p.id !== id);
    saveDb(db);
    res.json({ success: true });
  } else {
    res.status(404).json({ error: "المشروع غير موجود" });
  }
});

// Testimonials Management
app.get("/api/testimonials", (req, res) => {
  const db = getDb();
  res.json(db.testimonials);
});

app.post("/api/testimonials", requireAuth, (req, res) => {
  const { clientName, clientRole, clientCompany, feedback, rating, avatar } = req.body;
  if (!clientName || typeof clientName !== "string" || !clientName.trim()) {
    return res.status(400).json({ error: "اسم العميل مطلوب ولا يمكن أن يكون فارغاً" });
  }
  if (!feedback || typeof feedback !== "string" || !feedback.trim()) {
    return res.status(400).json({ error: "رأي وتقييم العميل مطلوب ولا يمكن أن يكون فارغاً" });
  }
  const numRating = Number(rating);
  if (isNaN(numRating) || numRating < 1 || numRating > 5) {
    return res.status(400).json({ error: "التقييم يجب أن يكون رقماً صحيحاً بين 1 و 5 نجوم" });
  }

  const db = getDb();
  const newTestimonial: Testimonial = {
    id: "test-" + Date.now(),
    clientName: clientName.trim(),
    clientRole: clientRole || "",
    clientCompany: clientCompany || "",
    feedback: feedback.trim(),
    rating: numRating,
    avatar: avatar || ""
  };
  db.testimonials.push(newTestimonial);
  saveDb(db);
  res.json(newTestimonial);
});

app.put("/api/testimonials/:id", requireAuth, (req, res) => {
  const { id } = req.params;
  const { clientName, feedback, rating, avatar } = req.body;

  if (clientName !== undefined && (!clientName || typeof clientName !== "string" || !clientName.trim())) {
    return res.status(400).json({ error: "اسم العميل لا يمكن أن يكون فارغاً" });
  }
  if (feedback !== undefined && (!feedback || typeof feedback !== "string" || !feedback.trim())) {
    return res.status(400).json({ error: "رأي وتقييم العميل لا يمكن أن يكون فارغاً" });
  }
  if (rating !== undefined) {
    const numRating = Number(rating);
    if (isNaN(numRating) || numRating < 1 || numRating > 5) {
      return res.status(400).json({ error: "التقييم يجب أن يكون رقماً صحيحاً بين 1 و 5 نجوم" });
    }
  }

  const db = getDb();
  const index = db.testimonials.findIndex(t => t.id === id);
  if (index !== -1) {
    // Delete old local file if avatar is updated
    const oldAvatar = db.testimonials[index].avatar;
    if (avatar && avatar !== oldAvatar) {
      deleteLocalFile(oldAvatar);
    }

    db.testimonials[index] = { ...db.testimonials[index], ...req.body };
    saveDb(db);
    res.json(db.testimonials[index]);
  } else {
    res.status(404).json({ error: "الرأي غير موجود" });
  }
});

app.delete("/api/testimonials/:id", requireAuth, (req, res) => {
  const { id } = req.params;
  const db = getDb();
  const index = db.testimonials.findIndex(t => t.id === id);
  if (index !== -1) {
    const testimonial = db.testimonials[index];
    // Delete local avatar
    deleteLocalFile(testimonial.avatar);

    db.testimonials = db.testimonials.filter(t => t.id !== id);
    saveDb(db);
    res.json({ success: true });
  } else {
    res.status(404).json({ error: "الرأي غير موجود" });
  }
});

// FAQs Management
app.get("/api/faqs", (req, res) => {
  const db = getDb();
  res.json(db.faqs);
});

app.post("/api/faqs", requireAuth, (req, res) => {
  const { question, answer } = req.body;
  if (!question || typeof question !== "string" || !question.trim()) {
    return res.status(400).json({ error: "السؤال مطلوب ولا يمكن أن يكون فارغاً" });
  }
  if (!answer || typeof answer !== "string" || !answer.trim()) {
    return res.status(400).json({ error: "الإجابة مطلوبة ولا يمكن أن تكون فارغة" });
  }

  const db = getDb();
  const newFaq: FAQ = {
    id: "faq-" + Date.now(),
    question: question.trim(),
    answer: answer.trim()
  };
  db.faqs.push(newFaq);
  saveDb(db);
  res.json(newFaq);
});

app.put("/api/faqs/:id", requireAuth, (req, res) => {
  const { id } = req.params;
  const { question, answer } = req.body;

  if (question !== undefined && (!question || typeof question !== "string" || !question.trim())) {
    return res.status(400).json({ error: "السؤال لا يمكن أن يكون فارغاً" });
  }
  if (answer !== undefined && (!answer || typeof answer !== "string" || !answer.trim())) {
    return res.status(400).json({ error: "الإجابة لا يمكن أن تكون فارغة" });
  }

  const db = getDb();
  const index = db.faqs.findIndex(f => f.id === id);
  if (index !== -1) {
    db.faqs[index] = { ...db.faqs[index], ...req.body };
    saveDb(db);
    res.json(db.faqs[index]);
  } else {
    res.status(404).json({ error: "السؤال غير موجود" });
  }
});

app.delete("/api/faqs/:id", requireAuth, (req, res) => {
  const { id } = req.params;
  const db = getDb();
  db.faqs = db.faqs.filter(f => f.id !== id);
  saveDb(db);
  res.json({ success: true });
});

// Blog posts Management
app.get("/api/blogs", (req, res) => {
  const db = getDb();
  res.json(db.blogs);
});

app.post("/api/blogs", requireAuth, (req, res) => {
  const { title, summary, content, image, readTime } = req.body;
  if (!title || typeof title !== "string" || !title.trim()) {
    return res.status(400).json({ error: "عنوان المقال مطلوب ولا يمكن أن يكون فارغاً" });
  }
  if (!summary || typeof summary !== "string" || !summary.trim()) {
    return res.status(400).json({ error: "ملخص المقال مطلوب ولا يمكن أن يكون فارغاً" });
  }
  if (!content || typeof content !== "string" || !content.trim()) {
    return res.status(400).json({ error: "محتوى المقال مطلوب" });
  }

  const db = getDb();
  const newBlog: BlogPost = {
    id: "blog-" + Date.now(),
    title: title.trim(),
    summary: summary.trim(),
    content: content.trim(),
    image: image || "",
    date: new Date().toISOString().split('T')[0],
    readTime: readTime || "5 دقائق"
  };
  db.blogs.push(newBlog);
  saveDb(db);
  res.json(newBlog);
});

app.put("/api/blogs/:id", requireAuth, (req, res) => {
  const { id } = req.params;
  const { title, summary, content, image } = req.body;

  if (title !== undefined && (!title || typeof title !== "string" || !title.trim())) {
    return res.status(400).json({ error: "عنوان المقال لا يمكن أن يكون فارغاً" });
  }
  if (summary !== undefined && (!summary || typeof summary !== "string" || !summary.trim())) {
    return res.status(400).json({ error: "ملخص المقال لا يمكن أن يكون فارغاً" });
  }
  if (content !== undefined && (!content || typeof content !== "string" || !content.trim())) {
    return res.status(400).json({ error: "محتوى المقال لا يمكن أن يكون فارغاً" });
  }

  const db = getDb();
  const index = db.blogs.findIndex(b => b.id === id);
  if (index !== -1) {
    // Delete old local cover image if a new image is supplied
    const oldImage = db.blogs[index].image;
    if (image && image !== oldImage) {
      deleteLocalFile(oldImage);
    }

    db.blogs[index] = { ...db.blogs[index], ...req.body };
    saveDb(db);
    res.json(db.blogs[index]);
  } else {
    res.status(404).json({ error: "المقال غير موجود" });
  }
});

app.delete("/api/blogs/:id", requireAuth, (req, res) => {
  const { id } = req.params;
  const db = getDb();
  const index = db.blogs.findIndex(b => b.id === id);
  if (index !== -1) {
    const blog = db.blogs[index];
    // Delete associated cover image from disk
    deleteLocalFile(blog.image);

    db.blogs = db.blogs.filter(b => b.id !== id);
    saveDb(db);
    res.json({ success: true });
  } else {
    res.status(404).json({ error: "المقال غير موجود" });
  }
});

// Contact Messages Management
app.get("/api/messages", requireAuth, (req, res) => {
  const db = getDb();
  // Sort messages descending (newest first)
  const sorted = [...db.messages].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  res.json(sorted);
});

app.post("/api/messages", (req, res) => {
  const { name, email, subject, message } = req.body;
  if (!name || !email || !message) {
    return res.status(400).json({ error: "الرجاء تعبئة جميع الحقول المطلوبة (الاسم، البريد الإلكتروني، الرسالة)" });
  }
  const db = getDb();
  const newMessage: ContactMessage = {
    id: "msg-" + Date.now(),
    name,
    email,
    subject: subject || "رسالة من الموقع",
    message,
    date: new Date().toISOString(),
    isRead: false
  };
  db.messages.push(newMessage);
  saveDb(db);
  res.json({ success: true, message: "تم إرسال رسالتك بنجاح وسنتواصل معك قريباً." });
});

app.put("/api/messages/:id/read", requireAuth, (req, res) => {
  const { id } = req.params;
  const db = getDb();
  const index = db.messages.findIndex(m => m.id === id);
  if (index !== -1) {
    db.messages[index].isRead = true;
    saveDb(db);
    res.json(db.messages[index]);
  } else {
    res.status(404).json({ error: "الرسالة غير موجودة" });
  }
});

app.delete("/api/messages/:id", requireAuth, (req, res) => {
  const { id } = req.params;
  const db = getDb();
  db.messages = db.messages.filter(m => m.id !== id);
  saveDb(db);
  res.json({ success: true });
});

// Image Upload API (Accepts Base64 and writes to disk, returning URL with validation)
app.post("/api/upload", requireAuth, (req, res) => {
  const { fileName, base64Data } = req.body;
  if (!fileName || !base64Data) {
    return res.status(400).json({ error: "الرجاء توفير اسم الملف وبيانات الصورة" });
  }

  try {
    // Check file extension compatibility
    const allowedExtensions = [".jpg", ".jpeg", ".png", ".gif", ".webp", ".svg"];
    const ext = path.extname(fileName).toLowerCase();
    if (!allowedExtensions.includes(ext)) {
      return res.status(400).json({ error: `نوع الملف غير مدعوم. الأنواع المسموحة هي: ${allowedExtensions.join(", ")}` });
    }

    // Process base64 string
    const matches = base64Data.match(/^data:([A-Za-z-+/]+);base64,(.+)$/);
    let dataBuffer: Buffer;

    if (matches && matches.length === 3) {
      dataBuffer = Buffer.from(matches[2], 'base64');
    } else {
      dataBuffer = Buffer.from(base64Data, 'base64');
    }

    // Validate size limit of decoded content: Max 5MB (5 * 1024 * 1024 bytes)
    const MAX_SIZE_BYTES = 5 * 1024 * 1024;
    if (dataBuffer.length > MAX_SIZE_BYTES) {
      return res.status(400).json({ error: "حجم الملف كبير جداً. الحد الأقصى المسموح به هو 5 ميجابايت." });
    }

    // Clean up filename and append timestamp
    const cleanFileName = path.basename(fileName).replace(/[^a-zA-Z0-9.-]/g, "_");
    const uniqueName = `${Date.now()}-${cleanFileName}`;
    const filePath = path.join(UPLOADS_DIR, uniqueName);

    // Write file to disk
    fs.writeFileSync(filePath, dataBuffer);

    // Return the URL
    res.json({ url: `/uploads/${uniqueName}` });
  } catch (error: any) {
    console.error("Error during upload:", error);
    res.status(500).json({ error: "فشل في حفظ الصورة المرفوعة: " + error.message });
  }
});

// Delete temporary or orphaned uploaded files manually
app.delete("/api/upload", requireAuth, (req, res) => {
  const { url } = req.body;
  if (!url) {
    return res.status(400).json({ error: "الرجاء توفير رابط الملف المراد حذفه" });
  }
  try {
    deleteLocalFile(url);
    res.json({ success: true, message: "تم حذف الملف بنجاح" });
  } catch (err: any) {
    res.status(500).json({ error: "فشل في حذف الملف: " + err.message });
  }
});

// Backup System (Export & Import)
app.get("/api/backup/export", requireAuth, (req, res) => {
  const db = getDb();
  // Set headers to trigger JSON download
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Content-Disposition', 'attachment; filename=portfolio-backup.json');
  res.send(JSON.stringify(db, null, 2));
});

app.post("/api/backup/import", requireAuth, (req, res) => {
  const { backupData } = req.body;
  if (!backupData || typeof backupData !== "object") {
    return res.status(400).json({ error: "بيانات النسخة الاحتياطية غير صالحة" });
  }

  try {
    // Basic structural verification
    if (!backupData.settings || !Array.isArray(backupData.services) || !Array.isArray(backupData.projects)) {
      return res.status(400).json({ error: "هيكل النسخة الاحتياطية غير متوافق" });
    }

    // Ensure all required fields exist
    if (!backupData.offers) {
      backupData.offers = [];
    }
    if (backupData.settings && backupData.settings.activeSections && backupData.settings.activeSections.offers === undefined) {
      backupData.settings.activeSections.offers = true;
    }

    // Save imported data
    saveDb(backupData);
    res.json({ success: true, message: "تم استيراد النسخة الاحتياطية بنجاح وتحديث كافة البيانات." });
  } catch (error: any) {
    res.status(500).json({ error: "فشل استيراد النسخة الاحتياطية: " + error.message });
  }
});


// Catch-all 404 handler for API routes to prevent hanging or infinite pending
app.use("/api", (req: express.Request, res: express.Response) => {
  console.warn(`[Express API 404] Endpoint not found: ${req.method} ${req.url}`);
  res.status(404).json({ error: `الرمز أو المسار غير موجود: ${req.url}` });
});

// Global Express Error Handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(`[Express Internal Error] ${req.method} ${req.url}:`, err);
  if (!res.headersSent) {
    res.status(500).json({ error: "حدث خطأ داخلي في خادم التطبيق", details: err?.message || String(err) });
  }
});

// Dev vs Production Setup
async function startServer() {
  // Run database checks and credentials migration on boot
  try {
    getDb();
    console.log("Database initialized and migrations applied successfully.");
  } catch (err) {
    console.error("Failed to initialize database on startup:", err);
  }

  if (process.env.NODE_ENV !== "production" && !IS_VERCEL) {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running at http://localhost:${PORT}`);
  });
}

if (!IS_VERCEL) {
  startServer();
} else {
  // On Vercel, ensure database is initialized on cold-start
  try {
    getDb();
  } catch (err) {
    console.error("Vercel database initialization error:", err);
  }
}

export default app;
