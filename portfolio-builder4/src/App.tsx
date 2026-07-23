/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, Fragment } from "react";
import { DatabaseSchema, SiteSettings, Service, Project, Testimonial, FAQ, BlogPost, Offer } from "./types";
import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import About from "./components/About";
import OffersSection from "./components/OffersSection";
import Services from "./components/Services";
import Portfolio from "./components/Portfolio";
import Testimonials from "./components/Testimonials";
import FAQSection from "./components/FAQSection";
import BlogSection from "./components/BlogSection";
import Contact from "./components/Contact";
import Footer from "./components/Footer";
import AdminPanel from "./components/AdminPanel";

// High-Fidelity Arabic Fallback Data to prevent screen lock/freeze if network/server APIs fail or are slow
const FALLBACK_SETTINGS: SiteSettings = {
  siteName: "إبداع الرقمية",
  siteLogo: "",
  logoWidth: 120,
  primaryColor: "#3b82f6",
  secondaryColor: "#1d4ed8",
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
  sectionOrder: [
    "hero",
    "about",
    "offers",
    "services",
    "portfolio",
    "testimonials",
    "faq",
    "blog",
    "contact"
  ],
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
};

const FALLBACK_OFFERS: Offer[] = [
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

const FALLBACK_SERVICES: Service[] = [
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
];

const FALLBACK_PROJECTS: Project[] = [
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
];

const FALLBACK_TESTIMONIALS: Testimonial[] = [
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
];

const FALLBACK_FAQS: FAQ[] = [
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
];

const FALLBACK_BLOGS: BlogPost[] = [
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
];

export default function App() {
  // Theme & Layout States
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    try {
      console.log("[App Init] Initializing darkMode state from localStorage...");
      const saved = localStorage.getItem("darkMode");
      return saved === "true" || (!saved && window.matchMedia("(prefers-color-scheme: dark)").matches);
    } catch (e) {
      console.warn("[App Init] localStorage is blocked or throws an error. Defaulting to light mode:", e);
      return false;
    }
  });
  const [isAdminOpen, setIsAdminOpen] = useState(false);

  // Dynamic Content States loaded from database pre-seeded with beautiful fallbacks
  const [settings, setSettings] = useState<SiteSettings>(FALLBACK_SETTINGS);
  const [offers, setOffers] = useState<Offer[]>(FALLBACK_OFFERS);
  const [services, setServices] = useState<Service[]>(FALLBACK_SERVICES);
  const [projects, setProjects] = useState<Project[]>(FALLBACK_PROJECTS);
  const [testimonials, setTestimonials] = useState<Testimonial[]>(FALLBACK_TESTIMONIALS);
  const [faqs, setFaqs] = useState<FAQ[]>(FALLBACK_FAQS);
  const [blogs, setBlogs] = useState<BlogPost[]>(FALLBACK_BLOGS);
  const [loading, setLoading] = useState(true);

  // Apply dark mode class to HTML tag
  useEffect(() => {
    const root = document.documentElement;
    if (darkMode) {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
    try {
      localStorage.setItem("darkMode", String(darkMode));
    } catch (e) {
      console.warn("[App Init] Failed to write darkMode to localStorage:", e);
    }
  }, [darkMode]);

  // Handle URL path routing on load
  useEffect(() => {
    const path = window.location.pathname;
    if (path === "/admin" || path === "/login") {
      setIsAdminOpen(true);
    }
  }, []);

  // Sync URL path with Admin Panel state
  useEffect(() => {
    const path = window.location.pathname;
    if (isAdminOpen) {
      if (path !== "/admin" && path !== "/login") {
        window.history.pushState(null, "", "/admin");
      }
    } else {
      if (path === "/admin" || path === "/login") {
        window.history.pushState(null, "", "/");
      }
    }
  }, [isAdminOpen]);

  // Trigger once-per-session Visitor Analytics
  useEffect(() => {
    try {
      const hasVisited = sessionStorage.getItem("hasVisited");
      if (!hasVisited) {
        console.log("[App Init] Incrementing visitor stats...");
        fetch("/api/stats/increment-visitor", { method: "POST" })
          .then(() => {
            try {
              sessionStorage.setItem("hasVisited", "true");
              console.log("[App Init] Visitor count incremented successfully.");
            } catch (e) {
              console.warn("[App Init] Failed to write to sessionStorage:", e);
            }
          })
          .catch((err) => console.error("[App Init] Error updating visitor count:", err));
      }
    } catch (e) {
      console.warn("[App Init] sessionStorage is blocked or throws an error:", e);
    }
  }, []);

  // Fetch Public Data on Load with timeouts and safe promise tracking
  const fetchAllData = async () => {
    console.log("INIT_START");
    const fetchSafe = async <T,>(url: string, fallbackValue: T): Promise<T> => {
      console.log(`[App Init] [FetchSafe] Fetching: ${url}`);
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => {
          console.warn(`[App Init] [FetchSafe] Timeout of 4s reached for: ${url}. Aborting request.`);
          controller.abort();
        }, 4000); // 4s timeout per request

        const res = await fetch(url, { signal: controller.signal });
        clearTimeout(timeoutId);
        
        if (res.ok) {
          const data = await res.json();
          if (data) {
            console.log(`[App Init] [FetchSafe] Success: ${url}`);
            return data;
          }
        } else {
          console.error(`[App Init] [FetchSafe] Error: ${url} returned status ${res.status}`);
        }
      } catch (err) {
        console.warn(`[App Init] [FetchSafe] Catch block. Fallback active for ${url}:`, err);
      }
      return fallbackValue;
    };

    try {
      console.log("[App Init] Fetching all database records simultaneously via Promise.all...");
      const [
        settingsData,
        offersData,
        servicesData,
        projectsData,
        testimonialsData,
        faqsData,
        blogsData
      ] = await Promise.all([
        fetchSafe<SiteSettings>("/api/settings", FALLBACK_SETTINGS),
        fetchSafe<Offer[]>("/api/offers", FALLBACK_OFFERS),
        fetchSafe<Service[]>("/api/services", FALLBACK_SERVICES),
        fetchSafe<Project[]>("/api/projects", FALLBACK_PROJECTS),
        fetchSafe<Testimonial[]>("/api/testimonials", FALLBACK_TESTIMONIALS),
        fetchSafe<FAQ[]>("/api/faqs", FALLBACK_FAQS),
        fetchSafe<BlogPost[]>("/api/blogs", FALLBACK_BLOGS),
      ]);

      console.log("DB_LOADED");
      console.log("API_LOADED");
      console.log("AUTH_LOADED");
      console.log("[App Init] Finished Promise.all fetches. Updating states with loaded or fallback data.");

      setSettings(settingsData);
      setOffers(offersData);
      setServices(servicesData);
      setProjects(projectsData);
      setTestimonials(testimonialsData);
      setFaqs(faqsData);
      setBlogs(blogsData);
    } catch (err) {
      console.error("[App Init] Critical error inside fetchAllData:", err);
    } finally {
      setLoading(false);
      console.log("APP_READY");
      console.log("[App Init] fetchAllData finally block completed: Loading set to false.");
    }
  };

  useEffect(() => {
    console.log("APP_START");
    console.log("[App Init] App component mounted.");
    
    // Safety fallback timeout: closes loading screen unconditionally in 5 seconds max
    const safetyTimeoutId = setTimeout(() => {
      console.warn("[App Init] Safety fallback timeout (5 seconds) triggered! Closing loading screen unconditionally.");
      console.log("APP_READY");
      setLoading(false);
    }, 5000);

    fetchAllData()
      .then(() => {
        console.log("[App Init] fetchAllData promise resolved successfully.");
        clearTimeout(safetyTimeoutId);
      })
      .catch((err) => {
        console.error("[App Init] fetchAllData promise rejected:", err);
        clearTimeout(safetyTimeoutId);
        console.log("APP_READY");
        setLoading(false);
      });

    return () => {
      clearTimeout(safetyTimeoutId);
    };
  }, []);

  // Show a beautifully animated skeleton loader during initial paint
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 text-white space-y-4">
        <div className="relative">
          <div className="h-14 w-14 border-4 border-brand-primary border-t-transparent rounded-full animate-spin" />
          <div className="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-slate-300">إبداع</div>
        </div>
        <p className="text-sm font-sans font-semibold text-slate-400 animate-pulse">
          الرجاء الانتظار، جاري تحميل الموقع وتهيئة الهوية الرقمية...
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-slate-900 transition-colors duration-300 relative selection:bg-brand-primary/20">
      
      {/* Dynamic Style Injection for on-the-fly colors */}
      <style>{`
        :root {
          --color-primary: ${settings.primaryColor || "#3b82f6"};
          --color-secondary: ${settings.secondaryColor || "#1d4ed8"};
        }
      `}</style>

      {/* Public Navbar (Sticky top) */}
      <Navbar
        settings={settings}
        darkMode={darkMode}
        setDarkMode={setDarkMode}
        onAdminToggle={() => setIsAdminOpen(!isAdminOpen)}
      />

      {/* Main Sections rendered sequentially based on dynamic toggles and customized order */}
      <main className="relative">
        {(settings.sectionOrder || ["hero", "about", "offers", "services", "portfolio", "testimonials", "faq", "blog", "contact"]).map((sectionKey) => {
          return (
            <Fragment key={sectionKey}>
              {sectionKey === "hero" && settings.activeSections.hero && <Hero settings={settings} />}
              {sectionKey === "about" && settings.activeSections.about && <About settings={settings} />}
              {sectionKey === "offers" && settings.activeSections.offers && <OffersSection offers={offers} />}
              {sectionKey === "services" && settings.activeSections.services && <Services services={services} />}
              {sectionKey === "portfolio" && settings.activeSections.portfolio && <Portfolio projects={projects} />}
              {sectionKey === "testimonials" && settings.activeSections.testimonials && <Testimonials testimonials={testimonials} />}
              {sectionKey === "faq" && settings.activeSections.faq && <FAQSection faqs={faqs} />}
              {sectionKey === "blog" && settings.activeSections.blog && <BlogSection blogs={blogs} />}
              {sectionKey === "contact" && settings.activeSections.contact && <Contact settings={settings} />}
            </Fragment>
          );
        })}
      </main>

      {/* Footer */}
      <Footer
        settings={settings}
        onAdminToggle={() => setIsAdminOpen(!isAdminOpen)}
      />

      {/* Full-Screen Administration Dashboard */}
      {isAdminOpen && (
        <AdminPanel
          settings={settings}
          offers={offers}
          onClose={() => setIsAdminOpen(false)}
          onRefreshAll={fetchAllData}
        />
      )}
    </div>
  );
}
