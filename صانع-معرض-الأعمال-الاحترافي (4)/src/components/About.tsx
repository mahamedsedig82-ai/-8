/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { motion } from "motion/react";
import { CheckCircle2, PhoneCall } from "lucide-react";
import { SiteSettings } from "../types";

interface AboutProps {
  settings: SiteSettings;
}

export default function About({ settings }: AboutProps) {
  const points = [
    "تصاميم إبداعية مخصصة لكل عميل",
    "تطوير سريع ومتوافق مع محركات البحث",
    "دعم فني مستمر واستجابة فورية",
    "أمان وحماية قصوى للبيانات والمواقع",
  ];

  return (
    <section id="about" className="py-20 sm:py-28 bg-white dark:bg-slate-900 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          
          {/* Text and Information */}
          <div className="lg:col-span-7 space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="inline-flex items-center gap-1.5 px-3 py-1 bg-brand-primary/10 rounded-lg text-brand-primary font-medium text-sm"
            >
              <span>من نحن</span>
            </motion.div>

            <motion.h2
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-2xl sm:text-4xl font-sans font-bold text-slate-900 dark:text-white tracking-tight"
            >
              {settings.aboutTitle}
            </motion.h2>

            <motion.div
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-slate-600 dark:text-slate-400 font-sans text-sm sm:text-base leading-relaxed space-y-4 whitespace-pre-line"
            >
              {settings.aboutText}
            </motion.div>

            {/* Feature lists */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4"
            >
              {points.map((pt, idx) => (
                <div key={idx} className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                  <CheckCircle2 className="w-5 h-5 text-brand-primary shrink-0" />
                  <span className="font-sans font-medium text-sm sm:text-[15px]">{pt}</span>
                </div>
              ))}
            </motion.div>

            {/* Quick contact trigger */}
            {settings.contactPhone && (
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.4 }}
                className="pt-6"
              >
                <div className="inline-flex items-center gap-4 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800">
                  <div className="p-3 bg-brand-primary text-white rounded-xl">
                    <PhoneCall className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-xs text-slate-500 dark:text-slate-400 font-sans">تحدث معنا مباشرة:</div>
                    <a
                      href={`tel:${settings.contactPhone}`}
                      className="text-base sm:text-lg font-bold text-slate-900 dark:text-white font-mono hover:text-brand-primary transition-colors"
                      dir="ltr"
                    >
                      {settings.contactPhone}
                    </a>
                  </div>
                </div>
              </motion.div>
            )}
          </div>

          {/* Image visual panel */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="lg:col-span-5 relative"
          >
            <div className="absolute inset-0 bg-brand-primary rounded-3xl rotate-3 opacity-10" />
            <div className="relative border border-slate-100 dark:border-slate-800 rounded-3xl overflow-hidden shadow-xl bg-slate-100 dark:bg-slate-800 aspect-[4/3] sm:aspect-video lg:aspect-square">
              <img
                src={settings.aboutImage || "https://images.unsplash.com/photo-1522071820081-009f0129c71c?q=80&w=600&auto=format&fit=crop"}
                alt="About us presentation"
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </div>
            {/* Visual badge */}
            <div className="absolute -bottom-6 -right-6 sm:bottom-6 sm:right-6 bg-white dark:bg-slate-800 p-4 rounded-2xl shadow-lg border border-slate-100 dark:border-slate-700 max-w-[180px] hidden sm:block">
              <div className="text-3xl font-black text-brand-primary font-mono">+100</div>
              <div className="text-xs font-semibold text-slate-600 dark:text-slate-300 font-sans mt-1">مشروع ناجح تم تسليمه للعملاء</div>
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
}
