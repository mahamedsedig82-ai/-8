/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Calendar, Clock, X, ArrowLeft, BookOpen } from "lucide-react";
import { BlogPost } from "../types";

interface BlogSectionProps {
  blogs: BlogPost[];
}

export default function BlogSection({ blogs }: BlogSectionProps) {
  const [activePost, setActivePost] = useState<BlogPost | null>(null);

  // Prevent background scroll when reading modal is active
  useEffect(() => {
    if (activePost) {
      const originalStyle = window.getComputedStyle(document.body).overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = originalStyle;
      };
    }
  }, [activePost]);

  return (
    <section id="blog" className="py-20 sm:py-28 bg-[#fafafa] dark:bg-slate-950 transition-colors duration-300">
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
            <span>مدونة إبداع</span>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-2xl sm:text-4xl font-sans font-bold text-slate-900 dark:text-white tracking-tight"
          >
            آخر المقالات والنصائح التقنية
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-slate-500 dark:text-slate-400 font-sans text-sm sm:text-base"
          >
            تابع أحدث المقالات التي نكتبها لمساعدتك في فهم مجالات تطوير المواقع، السيو، التسويق الرقمي وبناء المشاريع الناجحة.
          </motion.p>
        </div>

        {/* Blogs Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {blogs.map((post, idx) => {
            const coverImage = post.image || "https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=600&auto=format&fit=crop";
            return (
              <motion.article
                key={post.id}
                initial={{ opacity: 0, y: 25 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: idx * 0.1 }}
                className="group bg-white dark:bg-slate-900 rounded-3xl overflow-hidden border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-md hover:border-brand-primary/10 transition-all duration-300 flex flex-col sm:flex-row h-full"
              >
                {/* Blog Image */}
                <div className="w-full sm:w-2/5 aspect-video sm:aspect-auto sm:min-h-full overflow-hidden bg-slate-50 relative shrink-0">
                  <img
                    src={coverImage}
                    alt={post.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    referrerPolicy="no-referrer"
                  />
                </div>

                {/* Blog Info Content */}
                <div className="p-6 flex flex-col justify-between flex-1 space-y-4">
                  <div className="space-y-3">
                    {/* Date and time meta info */}
                    <div className="flex items-center gap-4 text-[11px] font-sans font-medium text-slate-400">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5" />
                        <span>{post.date}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        <span>{post.readTime || "5 دقائق"}</span>
                      </div>
                    </div>

                    <h3
                      onClick={() => setActivePost(post)}
                      className="text-base sm:text-lg font-sans font-bold text-slate-900 dark:text-white cursor-pointer hover:text-brand-primary transition-colors line-clamp-2"
                    >
                      {post.title}
                    </h3>

                    <p className="text-slate-500 dark:text-slate-400 font-sans text-xs sm:text-sm line-clamp-2 leading-relaxed">
                      {post.summary}
                    </p>
                  </div>

                  {/* Read More link button */}
                  <div className="pt-2">
                    <button
                      onClick={() => setActivePost(post)}
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-brand-primary hover:text-brand-secondary transition-colors"
                    >
                      <span>اقرأ المقال بالكامل</span>
                      <ArrowLeft className="w-4 h-4" />
                    </button>
                  </div>
                </div>

              </motion.article>
            );
          })}
        </div>

        {blogs.length === 0 && (
          <div className="text-center py-12 text-slate-400 font-sans">
            لا توجد تدوينات مضافة حالياً.
          </div>
        )}

        {/* Blog Post Detail Lightbox Modal */}
        <AnimatePresence>
          {activePost && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-md">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-white dark:bg-slate-900 rounded-3xl max-w-3xl w-full max-h-[85vh] overflow-y-auto shadow-2xl relative custom-scrollbar touch-momentum border border-slate-100 dark:border-slate-800"
              >
                {/* Close Button */}
                <button
                  onClick={() => setActivePost(null)}
                  className="absolute top-4 left-4 z-10 p-2 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>

                {/* Image */}
                <div className="w-full aspect-video sm:aspect-[2/1] overflow-hidden bg-slate-100">
                  <img
                    src={activePost.image || "https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=600&auto=format&fit=crop"}
                    alt={activePost.title}
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                </div>

                {/* Post Content Details */}
                <div className="p-6 sm:p-8 space-y-6">
                  {/* Meta Tags */}
                  <div className="flex items-center gap-4 text-xs font-sans font-semibold text-slate-400">
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-4 h-4" />
                      <span>{activePost.date}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-4 h-4" />
                      <span>{activePost.readTime || "5 دقائق"}</span>
                    </div>
                    <div className="flex items-center gap-1.5 border-r border-slate-200 dark:border-slate-800 pr-4 text-brand-primary">
                      <BookOpen className="w-4 h-4" />
                      <span>فكر ومعرفة</span>
                    </div>
                  </div>

                  {/* Title */}
                  <h3 className="text-xl sm:text-3xl font-sans font-bold text-slate-900 dark:text-white leading-tight">
                    {activePost.title}
                  </h3>

                  {/* Body Content */}
                  <div className="text-slate-600 dark:text-slate-300 font-sans text-sm sm:text-base leading-relaxed whitespace-pre-line space-y-4">
                    {activePost.content}
                  </div>
                </div>

                {/* Footer close option */}
                <div className="p-6 border-t border-slate-50 dark:border-slate-800/60 bg-slate-50/50 dark:bg-slate-900/30 flex justify-end">
                  <button
                    onClick={() => setActivePost(null)}
                    className="px-5 py-2 bg-slate-200 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-sm font-semibold rounded-xl transition-all"
                  >
                    إغلاق المقال
                  </button>
                </div>

              </motion.div>
            </div>
          )}
        </AnimatePresence>

      </div>
    </section>
  );
}
