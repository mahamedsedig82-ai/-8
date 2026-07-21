/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Shield, Facebook, Twitter, Instagram, Linkedin, Github } from "lucide-react";
import { SiteSettings } from "../types";
import LucideIcon from "./LucideIcon";

interface FooterProps {
  settings: SiteSettings;
  onAdminToggle: () => void;
}

export default function Footer({ settings, onAdminToggle }: FooterProps) {
  const currentYear = new Date().getFullYear();

  const socialLinks = [
    { icon: Facebook, href: settings.socialFacebook, name: "Facebook" },
    { icon: Twitter, href: settings.socialTwitter, name: "Twitter" },
    { icon: Instagram, href: settings.socialInstagram, name: "Instagram" },
    { icon: Linkedin, href: settings.socialLinkedin, name: "LinkedIn" },
    { icon: Github, href: settings.socialGithub, name: "GitHub" },
  ].filter(link => link.href);

  return (
    <footer className="bg-slate-900 dark:bg-slate-950 text-slate-400 py-12 border-t border-slate-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center pb-8 border-b border-slate-800">
          
          {/* Brand Logo and Name */}
          <div className="md:col-span-5 space-y-4">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-brand-primary/10 rounded-xl text-brand-primary">
                <LucideIcon name={settings.siteLogo || "Sparkles"} className="w-5 h-5" />
              </div>
              <span className="font-sans font-bold text-lg text-white">
                {settings.siteName}
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 font-sans leading-relaxed max-w-sm">
              موقع ويب ومحرر متكامل لمعرض أعمالك وحضورك الرقمي على شبكة الإنترنت. صُمم وصُنع ليخدم أعمالك باحترافية وسرعة فائقة.
            </p>
          </div>

          {/* Nav quick lists */}
          <div className="md:col-span-4 flex flex-wrap gap-x-6 gap-y-2">
            <a href="#about" className="text-sm hover:text-white transition-colors font-sans">من نحن</a>
            <a href="#services" className="text-sm hover:text-white transition-colors font-sans">الخدمات</a>
            <a href="#portfolio" className="text-sm hover:text-white transition-colors font-sans">أعمالنا</a>
            <a href="#testimonials" className="text-sm hover:text-white transition-colors font-sans">آراء العملاء</a>
            <a href="#blog" className="text-sm hover:text-white transition-colors font-sans">المدونة</a>
            <a href="#contact" className="text-sm hover:text-white transition-colors font-sans">اتصل بنا</a>
          </div>

          {/* Social Links Panel */}
          <div className="md:col-span-3 flex md:justify-end gap-3">
            {socialLinks.map((link, idx) => {
              const Icon = link.icon;
              return (
                <a
                  key={idx}
                  href={link.href}
                  target="_blank"
                  rel="noreferrer"
                  className="p-2.5 bg-slate-800 hover:bg-brand-primary text-slate-400 hover:text-white rounded-xl transition-all hover:scale-105"
                  title={link.name}
                >
                  <Icon className="w-5 h-5" />
                </a>
              );
            })}
          </div>

        </div>

        {/* Copyright and Admin access */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-sans text-slate-500">
          <div>
            <span>© {currentYear} {settings.siteName}. جميع الحقوق محفوظة.</span>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={onAdminToggle}
              className="flex items-center gap-1 hover:text-white transition-colors focus:outline-none cursor-pointer"
            >
              <Shield className="w-3.5 h-3.5" />
              <span>لوحة الإدارة الآمنة</span>
            </button>
          </div>
        </div>

      </div>
    </footer>
  );
}
