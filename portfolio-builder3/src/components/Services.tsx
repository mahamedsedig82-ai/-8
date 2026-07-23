/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { motion } from "motion/react";
import { Service } from "../types";
import LucideIcon from "./LucideIcon";

interface ServicesProps {
  services: Service[];
}

export default function Services({ services }: ServicesProps) {
  return (
    <section id="services" className="py-20 sm:py-28 bg-[#fafafa] dark:bg-slate-950 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Title */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-1.5 px-3 py-1 bg-brand-primary/10 rounded-lg text-brand-primary font-medium text-sm"
          >
            <span>خدماتنا المتميزة</span>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-2xl sm:text-4xl font-sans font-bold text-slate-900 dark:text-white tracking-tight"
          >
            ما نقدمه من حلول إبداعية لمشروعك
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-slate-500 dark:text-slate-400 font-sans text-sm sm:text-base leading-relaxed"
          >
            نحن هنا لنرافقك في كافة مراحل بناء وتطوير علامتك التجارية الرقمية، عبر تقديم خدمات متكاملة تضمن لك الأداء الأفضل والمنافسة العالية.
          </motion.p>
        </div>

        {/* Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
          {services.map((service, idx) => (
            <motion.div
              key={service.id}
              initial={{ opacity: 0, y: 25 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: idx * 0.1 }}
              className="group p-6 sm:p-8 bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 hover:border-brand-primary/20 dark:hover:border-brand-primary/30 shadow-sm hover:shadow-md transition-all duration-300"
            >
              {/* Dynamic Icon */}
              <div className="inline-flex p-4 bg-slate-50 dark:bg-slate-800/80 text-brand-primary group-hover:bg-brand-primary group-hover:text-white rounded-2xl mb-6 transition-all duration-300 transform group-hover:scale-110 group-hover:rotate-3">
                <LucideIcon name={service.icon} className="w-6 h-6" />
              </div>

              {/* Service Title */}
              <h3 className="text-lg sm:text-xl font-sans font-bold text-slate-900 dark:text-white mb-3 group-hover:text-brand-primary transition-colors">
                {service.title}
              </h3>

              {/* Service Description */}
              <p className="text-slate-500 dark:text-slate-400 font-sans text-sm sm:text-[14px] leading-relaxed">
                {service.description}
              </p>
            </motion.div>
          ))}
        </div>

      </div>
    </section>
  );
}
