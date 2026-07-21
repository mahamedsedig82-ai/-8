/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ExternalLink, Building, ChevronLeft, ChevronRight, X, Image as ImageIcon } from "lucide-react";
import { Project } from "../types";

interface PortfolioProps {
  projects: Project[];
}

export default function Portfolio({ projects }: PortfolioProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>("الكل");
  const [activeProject, setActiveProject] = useState<Project | null>(null);
  const [currentImageIdx, setCurrentImageIdx] = useState<number>(0);

  // Prevent background scroll when modal is active
  useEffect(() => {
    if (activeProject) {
      const originalStyle = window.getComputedStyle(document.body).overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = originalStyle;
      };
    }
  }, [activeProject]);

  // Extract all categories dynamically
  const categories = ["الكل", ...Array.from(new Set(projects.map((p) => p.category)))];

  const filteredProjects = selectedCategory === "الكل"
    ? projects
    : projects.filter((p) => p.category === selectedCategory);

  const openProjectDetails = (proj: Project) => {
    setActiveProject(proj);
    setCurrentImageIdx(0);
  };

  const nextImage = () => {
    if (!activeProject) return;
    setCurrentImageIdx((prev) => (prev + 1) % activeProject.images.length);
  };

  const prevImage = () => {
    if (!activeProject) return;
    setCurrentImageIdx((prev) => (prev - 1 + activeProject.images.length) % activeProject.images.length);
  };

  return (
    <section id="portfolio" className="py-20 sm:py-28 bg-white dark:bg-slate-900 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Title */}
        <div className="text-center max-w-3xl mx-auto mb-12 space-y-4">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-1.5 px-3 py-1 bg-brand-primary/10 rounded-lg text-brand-primary font-medium text-sm"
          >
            <span>معرض الأعمال</span>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-2xl sm:text-4xl font-sans font-bold text-slate-900 dark:text-white tracking-tight"
          >
            فخورون باستعراض أحدث مشاريعنا الإبداعية
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-slate-500 dark:text-slate-400 font-sans text-sm sm:text-base"
          >
            استكشف مجموعة واسعة من المشاريع الرقمية التي قمنا بتطويرها لعملائنا في شتى القطاعات والمجالات.
          </motion.p>
        </div>

        {/* Categories filters */}
        <div className="flex overflow-x-auto md:flex-wrap items-center justify-start md:justify-center gap-2 mb-12 pb-3 md:pb-0 scrollbar-none touch-momentum select-none">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-5 py-2 text-sm font-semibold rounded-xl font-sans transition-all duration-300 shrink-0 ${
                selectedCategory === category
                  ? "bg-brand-primary text-white shadow-md shadow-brand-primary/15"
                  : "bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700"
              }`}
            >
              {category}
            </button>
          ))}
        </div>

        {/* Projects Grid */}
        <motion.div
          layout
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8"
        >
          <AnimatePresence mode="popLayout">
            {filteredProjects.map((project) => {
              const coverImage = project.images && project.images.length > 0
                ? project.images[0]
                : "https://images.unsplash.com/photo-1541462608141-275d72e2302a?q=80&w=600&auto=format&fit=crop";

              return (
                <motion.div
                  key={project.id}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.4 }}
                  className="group bg-slate-50 dark:bg-slate-800/40 rounded-3xl overflow-hidden border border-slate-100 dark:border-slate-800 hover:border-brand-primary/20 dark:hover:border-brand-primary/20 transition-all duration-300 shadow-sm"
                >
                  {/* Project Image Panel */}
                  <div className="relative aspect-[4/3] overflow-hidden bg-slate-100 dark:bg-slate-800 group">
                    <img
                      src={coverImage}
                      alt={project.title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute inset-0 bg-slate-950/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-3">
                      <button
                        onClick={() => openProjectDetails(project)}
                        className="p-3 bg-white text-slate-900 rounded-xl hover:bg-brand-primary hover:text-white transition-all scale-90 group-hover:scale-100 duration-300 font-bold"
                      >
                        تفاصيل المشروع
                      </button>
                    </div>
                    {/* Images count tag */}
                    {project.images && project.images.length > 1 && (
                      <div className="absolute top-4 left-4 flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-black/60 text-white text-xs font-mono backdrop-blur-sm">
                        <ImageIcon className="w-3.5 h-3.5" />
                        <span>{project.images.length}</span>
                      </div>
                    )}
                    {/* Category tag */}
                    <div className="absolute bottom-4 right-4 px-3 py-1 bg-brand-primary text-white text-xs font-medium rounded-lg font-sans">
                      {project.category}
                    </div>
                  </div>

                  {/* Project Summary */}
                  <div className="p-6">
                    <h3
                      onClick={() => openProjectDetails(project)}
                      className="text-lg font-sans font-bold text-slate-900 dark:text-white mb-2 cursor-pointer hover:text-brand-primary transition-colors line-clamp-1"
                    >
                      {project.title}
                    </h3>
                    <p className="text-slate-500 dark:text-slate-400 font-sans text-xs sm:text-sm line-clamp-2 leading-relaxed mb-4">
                      {project.description}
                    </p>
                    {/* Quick action detail */}
                    <button
                      onClick={() => openProjectDetails(project)}
                      className="inline-flex items-center gap-1 text-xs font-bold text-brand-primary hover:text-brand-secondary transition-colors"
                    >
                      <span>تفاصيل ومعاينة</span>
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </motion.div>

        {/* Empty state when no projects exist */}
        {filteredProjects.length === 0 && (
          <div className="text-center py-12 text-slate-400 font-sans">
            لا توجد مشاريع مضافة حالياً في هذا القسم.
          </div>
        )}

        {/* Lightbox / Details Modal */}
        <AnimatePresence>
          {activeProject && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-md">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-white dark:bg-slate-900 rounded-3xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl relative custom-scrollbar touch-momentum border border-slate-100 dark:border-slate-800"
              >
                {/* Close Button */}
                <button
                  onClick={() => setActiveProject(null)}
                  className="absolute top-4 left-4 z-10 p-2 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>

                {/* Grid Layout inside modal */}
                <div className="grid grid-cols-1 md:grid-cols-2">
                  
                  {/* Left: Gallery Slider */}
                  <div className="bg-slate-950 flex flex-col justify-center relative aspect-[4/3] md:aspect-auto md:min-h-[400px]">
                    {activeProject.images && activeProject.images.length > 0 ? (
                      <>
                        <img
                          src={activeProject.images[currentImageIdx]}
                          alt={activeProject.title}
                          className="w-full h-full object-contain max-h-[50vh] md:max-h-none"
                          referrerPolicy="no-referrer"
                        />

                        {/* Slider Nav Controls */}
                        {activeProject.images.length > 1 && (
                          <>
                            <button
                              onClick={prevImage}
                              className="absolute right-4 p-2 bg-black/40 hover:bg-black/60 text-white rounded-full transition-colors"
                            >
                              <ChevronRight className="w-5 h-5" />
                            </button>
                            <button
                              onClick={nextImage}
                              className="absolute left-4 p-2 bg-black/40 hover:bg-black/60 text-white rounded-full transition-colors"
                            >
                              <ChevronLeft className="w-5 h-5" />
                            </button>

                            {/* Dots */}
                            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5 z-10">
                              {activeProject.images.map((_, i) => (
                                <span
                                  key={i}
                                  className={`h-2 w-2 rounded-full transition-all ${
                                    currentImageIdx === i ? "bg-brand-primary w-4" : "bg-white/40"
                                  }`}
                                />
                              ))}
                            </div>
                          </>
                        )}
                      </>
                    ) : (
                      <div className="flex flex-col items-center justify-center p-8 text-slate-500">
                        <ImageIcon className="w-12 h-12 mb-2" />
                        <span>لا توجد صور متوفرة للمشروع</span>
                      </div>
                    )}
                  </div>

                  {/* Right: Project Details Info */}
                  <div className="p-6 sm:p-8 flex flex-col justify-between">
                    <div className="space-y-4">
                      {/* Meta Tags */}
                      <span className="inline-flex px-3 py-1 bg-brand-primary/10 rounded-lg text-brand-primary font-medium text-xs">
                        {activeProject.category}
                      </span>

                      {/* Title */}
                      <h3 className="text-xl sm:text-2xl font-sans font-bold text-slate-900 dark:text-white">
                        {activeProject.title}
                      </h3>

                      {/* Description */}
                      <div className="text-slate-600 dark:text-slate-400 font-sans text-sm sm:text-base leading-relaxed whitespace-pre-line max-h-[220px] overflow-y-auto custom-scrollbar">
                        {activeProject.description}
                      </div>

                      {/* Client / Business info block */}
                      {activeProject.clientName && (
                        <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center gap-3">
                          <div className="p-2.5 bg-slate-50 dark:bg-slate-800 rounded-xl text-slate-400">
                            <Building className="w-5 h-5" />
                          </div>
                          <div>
                            <div className="text-xs text-slate-400 font-sans">العميل الشريك:</div>
                            {activeProject.clientUrl ? (
                              <a
                                href={activeProject.clientUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="text-sm font-semibold text-slate-700 dark:text-slate-200 hover:text-brand-primary transition-colors flex items-center gap-1"
                              >
                                <span>{activeProject.clientName}</span>
                                <ExternalLink className="w-3.5 h-3.5 shrink-0" />
                              </a>
                            ) : (
                              <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                                {activeProject.clientName}
                              </span>
                            )}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Launch Project Button */}
                    {activeProject.previewUrl && (
                      <div className="pt-6">
                        <a
                          href={activeProject.previewUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="w-full py-3.5 px-6 bg-brand-primary hover:bg-brand-secondary text-white font-semibold text-sm rounded-xl shadow-lg shadow-brand-primary/15 hover:shadow-brand-secondary/20 flex items-center justify-center gap-2 transition-all"
                        >
                          <span>معاينة المشروع المباشر</span>
                          <ExternalLink className="w-4 h-4" />
                        </a>
                      </div>
                    )}
                  </div>

                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

      </div>
    </section>
  );
}
