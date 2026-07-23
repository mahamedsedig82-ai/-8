/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { motion } from "motion/react";
import { ArrowLeft, MessageSquare } from "lucide-react";
import { SiteSettings } from "../types";

interface HeroProps {
  settings: SiteSettings;
}

export default function Hero({ settings }: HeroProps) {
  return (
    <section
      id="hero"
      className="relative min-h-screen flex items-center justify-center pt-24 overflow-hidden bg-slate-950 text-white"
    >
      {/* Background overlay with image */}
      <div className="absolute inset-0 z-0">
        <img
          src={settings.heroBgImage || "https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=1200&auto=format&fit=crop"}
          alt="Hero background"
          className="w-full h-full object-cover object-center opacity-25"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-slate-950/80 via-slate-950/90 to-slate-950 z-10" />
      </div>

      {/* Decorative colored glow circles */}
      <div className="absolute top-1/4 right-1/4 w-80 h-80 bg-brand-primary/20 rounded-full blur-[100px] z-10 animate-pulse duration-5000" />
      <div className="absolute bottom-1/4 left-1/4 w-96 h-96 bg-brand-secondary/15 rounded-full blur-[120px] z-10" />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-20 text-center">
        {/* Visual Tag */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-white/90 text-xs sm:text-sm font-medium mb-6 backdrop-blur-md"
        >
          <span className="flex h-2 w-2 rounded-full bg-brand-primary animate-ping" />
          <span>متاحون الآن للمشاريع الجديدة</span>
        </motion.div>

        {/* Hero Title */}
        <motion.h1
          initial={{ opacity: 0, y: 25 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1 }}
          className="text-3xl sm:text-5xl md:text-6xl font-sans font-extrabold tracking-tight leading-[1.2] mb-6 text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-100 to-slate-300"
        >
          {settings.heroTitle}
        </motion.h1>

        {/* Hero Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 25 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="text-base sm:text-xl text-slate-400 font-sans max-w-3xl mx-auto mb-10 leading-relaxed"
        >
          {settings.heroSubtitle}
        </motion.p>

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 25 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <a
            href="#portfolio"
            className="w-full sm:w-auto px-8 py-4 bg-brand-primary hover:bg-brand-secondary text-white font-bold rounded-xl shadow-lg shadow-brand-primary/25 hover:shadow-brand-secondary/30 flex items-center justify-center gap-2 transition-all duration-300"
          >
            <span>مشاهدة أعمالنا</span>
            <ArrowLeft className="w-5 h-5" />
          </a>

          <a
            href="#contact"
            className="w-full sm:w-auto px-8 py-4 bg-white/10 hover:bg-white/15 border border-white/15 hover:border-white/20 text-white font-semibold rounded-xl flex items-center justify-center gap-2 transition-all duration-300 backdrop-blur-sm"
          >
            <MessageSquare className="w-5 h-5 text-slate-300" />
            <span>تواصل معنا</span>
          </a>
        </motion.div>
      </div>

      {/* Slide down arrow indicator */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20">
        <motion.a
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
          href="#about"
          className="flex h-10 w-10 items-center justify-center rounded-full bg-white/5 border border-white/10 backdrop-blur-sm text-slate-400 hover:text-white transition-colors"
        >
          <svg className="h-5 w-5 rotate-90" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
          </svg>
        </motion.a>
      </div>
    </section>
  );
}
