/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { motion } from "motion/react";
import { Quote, Star } from "lucide-react";
import { Testimonial } from "../types";

interface TestimonialsProps {
  testimonials: Testimonial[];
}

export default function Testimonials({ testimonials }: TestimonialsProps) {
  return (
    <section id="testimonials" className="py-20 sm:py-28 bg-[#fafafa] dark:bg-slate-950 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Title */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-1.5 px-3 py-1 bg-brand-primary/10 rounded-lg text-brand-primary font-medium text-sm"
          >
            <span>آراء شركائنا في النجاح</span>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-2xl sm:text-4xl font-sans font-bold text-slate-900 dark:text-white tracking-tight"
          >
            ماذا يقول عملاؤنا عن خدماتنا؟
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-slate-500 dark:text-slate-400 font-sans text-sm sm:text-base"
          >
            ثقة عملائنا هي أكبر حافز لنا لتقديم الأفضل دائماً. إليك بعض من رسائل الشكر والتقييمات التي نعتز بها.
          </motion.p>
        </div>

        {/* Testimonials Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 max-w-5xl mx-auto">
          {testimonials.map((test, idx) => (
            <motion.div
              key={test.id}
              initial={{ opacity: 0, y: 25 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: idx * 0.1 }}
              className="p-6 sm:p-8 bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm relative flex flex-col justify-between"
            >
              {/* Decorative Quote Icon */}
              <div className="absolute top-6 left-6 text-slate-100 dark:text-slate-800/60 z-0">
                <Quote className="w-12 h-12 transform rotate-180" />
              </div>

              <div className="relative z-10 space-y-4">
                {/* Rating stars */}
                <div className="flex items-center gap-1">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className={`w-4.5 h-4.5 ${
                        i < (test.rating || 5)
                          ? "fill-amber-400 text-amber-400"
                          : "text-slate-200 dark:text-slate-700"
                      }`}
                    />
                  ))}
                </div>

                {/* Feedback Text */}
                <p className="text-slate-600 dark:text-slate-300 font-sans text-sm sm:text-base leading-relaxed whitespace-pre-line italic">
                  &ldquo;{test.feedback}&rdquo;
                </p>
              </div>

              {/* Author Info Block */}
              <div className="flex items-center gap-4 mt-8 pt-6 border-t border-slate-50 dark:border-slate-800/80 relative z-10">
                {/* Avatar */}
                <div className="w-12 h-12 rounded-full overflow-hidden bg-slate-100 dark:bg-slate-800 border-2 border-brand-primary/10 shrink-0">
                  <img
                    src={test.avatar || "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=150&auto=format&fit=crop"}
                    alt={test.clientName}
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                </div>
                <div>
                  <h4 className="font-sans font-bold text-sm sm:text-[15px] text-slate-900 dark:text-white">
                    {test.clientName}
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-sans mt-0.5">
                    {test.clientRole} {test.clientCompany ? `، ${test.clientCompany}` : ""}
                  </p>
                </div>
              </div>

            </motion.div>
          ))}
        </div>

        {testimonials.length === 0 && (
          <div className="text-center py-12 text-slate-400 font-sans">
            لا تتوفر آراء عملاء حالياً.
          </div>
        )}

      </div>
    </section>
  );
}
