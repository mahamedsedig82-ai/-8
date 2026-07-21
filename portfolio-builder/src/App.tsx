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

export default function App() {
  // Theme & Layout States
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    const saved = localStorage.getItem("darkMode");
    return saved === "true" || (!saved && window.matchMedia("(prefers-color-scheme: dark)").matches);
  });
  const [isAdminOpen, setIsAdminOpen] = useState(false);

  // Dynamic Content States loaded from database
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [offers, setOffers] = useState<Offer[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [blogs, setBlogs] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);

  // Apply dark mode class to HTML tag
  useEffect(() => {
    const root = document.documentElement;
    if (darkMode) {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
    localStorage.setItem("darkMode", String(darkMode));
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
    const hasVisited = sessionStorage.getItem("hasVisited");
    if (!hasVisited) {
      fetch("/api/stats/increment-visitor", { method: "POST" })
        .then(() => sessionStorage.setItem("hasVisited", "true"))
        .catch((err) => console.error("Error updating visitor count:", err));
    }
  }, []);

  // Fetch Public Data on Load
  const fetchAllData = async () => {
    try {
      const [settingsRes, offersRes, srvRes, projRes, testRes, faqRes, blogRes] = await Promise.all([
        fetch("/api/settings"),
        fetch("/api/offers"),
        fetch("/api/services"),
        fetch("/api/projects"),
        fetch("/api/testimonials"),
        fetch("/api/faqs"),
        fetch("/api/blogs"),
      ]);

      if (settingsRes.ok) setSettings(await settingsRes.json());
      if (offersRes.ok) setOffers(await offersRes.json());
      if (srvRes.ok) setServices(await srvRes.json());
      if (projRes.ok) setProjects(await projRes.json());
      if (testRes.ok) setTestimonials(await testRes.json());
      if (faqRes.ok) setFaqs(await faqRes.json());
      if (blogRes.ok) setBlogs(await blogRes.json());

    } catch (err) {
      console.error("Error loading public dynamic content:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  // Show a beautifully animated skeleton loader during initial paint
  if (loading || !settings) {
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
