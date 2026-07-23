/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from "react";
import { Menu, X, Sun, Moon, Shield } from "lucide-react";
import { SiteSettings } from "../types";
import LucideIcon from "./LucideIcon";

interface NavbarProps {
  settings: SiteSettings;
  darkMode: boolean;
  setDarkMode: (val: boolean) => void;
  onAdminToggle: () => void;
}

export default function Navbar({ settings, darkMode, setDarkMode, onAdminToggle }: NavbarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Prevent background scroll when mobile menu is open
  useEffect(() => {
    if (isOpen) {
      const originalStyle = window.getComputedStyle(document.body).overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = originalStyle;
      };
    }
  }, [isOpen]);

  const navLinks = [
    { name: "الرئيسية", href: "#hero", active: settings.activeSections.hero },
    { name: "من نحن", href: "#about", active: settings.activeSections.about },
    { name: "الخدمات", href: "#services", active: settings.activeSections.services },
    { name: "أعمالنا", href: "#portfolio", active: settings.activeSections.portfolio },
    { name: "آراء العملاء", href: "#testimonials", active: settings.activeSections.testimonials },
    { name: "الأسئلة الشائعة", href: "#faq", active: settings.activeSections.faq },
    { name: "المدونة", href: "#blog", active: settings.activeSections.blog },
    { name: "اتصل بنا", href: "#contact", active: settings.activeSections.contact },
  ].filter(link => link.active);

  return (
    <nav
      id="main-navbar"
      className={`fixed top-0 right-0 left-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-white/90 dark:bg-slate-900/90 backdrop-blur-md shadow-sm py-3"
          : "bg-transparent py-5"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-12">
          {/* Logo & Site Name */}
          <a href="#hero" className="flex items-center gap-3 group">
            {settings.siteLogo && (settings.siteLogo.startsWith("/") || settings.siteLogo.startsWith("http") || settings.siteLogo.startsWith("data:")) ? (
              <img
                src={settings.siteLogo}
                alt={settings.siteName}
                style={{ width: `${settings.logoWidth || 120}px` }}
                className="h-auto max-h-12 object-contain transition-all duration-300"
              />
            ) : null}
            <span className="font-sans font-bold text-lg sm:text-xl tracking-tight text-slate-900 dark:text-white transition-all">
              {settings.siteName}
            </span>
          </a>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-6">
            <div className="flex items-center gap-1">
              {navLinks.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  className="px-3 py-2 text-[15px] font-medium text-slate-600 dark:text-slate-300 hover:text-brand-primary dark:hover:text-brand-primary rounded-lg transition-colors"
                >
                  {link.name}
                </a>
              ))}
            </div>

            <div className="flex items-center gap-3 border-r border-slate-200 dark:border-slate-800 pr-4">
              {/* Theme Toggle */}
              <button
                id="theme-toggle-btn"
                onClick={() => setDarkMode(!darkMode)}
                className="p-2 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-all"
                title={darkMode ? "الوضع الفاتح" : "الوضع الداكن"}
              >
                {darkMode ? <Sun className="w-5 h-5 text-amber-500" /> : <Moon className="w-5 h-5 text-slate-700" />}
              </button>

              {/* Admin Portal Button */}
              <button
                id="admin-portal-nav-btn"
                onClick={onAdminToggle}
                className="flex items-center gap-1.5 px-4 py-2 bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-950 font-medium text-[14px] rounded-xl shadow-sm transition-all hover:shadow-md"
              >
                <Shield className="w-4 h-4" />
                <span>لوحة التحكم</span>
              </button>
            </div>
          </div>

          {/* Mobile menu and toggles */}
          <div className="flex lg:hidden items-center gap-2">
            <button
              id="mobile-theme-toggle"
              onClick={() => setDarkMode(!darkMode)}
              className="p-2 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-all"
            >
              {darkMode ? <Sun className="w-5 h-5 text-amber-500" /> : <Moon className="w-5 h-5 text-slate-700" />}
            </button>

            <button
              id="mobile-admin-btn"
              onClick={onAdminToggle}
              className="p-2 text-slate-900 dark:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-all"
              title="لوحة الإدارة"
            >
              <Shield className="w-5 h-5" />
            </button>

            <button
              id="mobile-menu-toggle"
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-all"
            >
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation Drawer */}
      {isOpen && (
        <div id="mobile-menu-drawer" className="lg:hidden bg-white/95 dark:bg-slate-900/95 backdrop-blur-lg border-b border-slate-100 dark:border-slate-800 shadow-md">
          <div className="px-4 pt-2 pb-6 space-y-1">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={() => setIsOpen(false)}
                className="block px-4 py-3 rounded-xl text-[16px] font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-brand-primary"
              >
                {link.name}
              </a>
            ))}
          </div>
        </div>
      )}
    </nav>
  );
}
