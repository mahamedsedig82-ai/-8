/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { motion } from "motion/react";
import { Phone, Mail, MapPin, Send, CheckCircle2, AlertCircle, MessageCircle } from "lucide-react";
import { SiteSettings } from "../types";

interface ContactProps {
  settings: SiteSettings;
}

export default function Contact({ settings }: ContactProps) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });

  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setFeedback(null);

    if (!formData.name || !formData.email || !formData.message) {
      setFeedback({
        type: "error",
        message: "الرجاء تعبئة جميع الحقول المطلوبة (الاسم، البريد، الرسالة).",
      });
      setLoading(false);
      return;
    }

    try {
      const response = await fetch("/api/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        setFeedback({
          type: "success",
          message: data.message || "تم إرسال رسالتك بنجاح! شكراً لك.",
        });
        setFormData({ name: "", email: "", subject: "", message: "" });
      } else {
        setFeedback({
          type: "error",
          message: data.error || "حدث خطأ ما، الرجاء المحاولة لاحقاً.",
        });
      }
    } catch (err) {
      setFeedback({
        type: "error",
        message: "فشل الاتصال بالخادم. تأكد من اتصالك بالإنترنت وحاول مجدداً.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <section id="contact" className="py-20 sm:py-28 bg-white dark:bg-slate-900 transition-colors duration-300">
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
            <span>اتصل بنا</span>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-2xl sm:text-4xl font-sans font-bold text-slate-900 dark:text-white tracking-tight"
          >
            هل أنت مستعد لبدء قصة نجاح جديدة معنا؟
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-slate-500 dark:text-slate-400 font-sans text-sm sm:text-base"
          >
            لا تتردد في طرح مشروعك، فكرتك، أو استفسارك. فريقنا مستعد دائماً لتقديم الدعم الفني والمشورة المناسبة لنمو مشروعك.
          </motion.p>
        </div>

        {/* Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 max-w-6xl mx-auto items-start">
          
          {/* Info Details */}
          <div className="lg:col-span-5 space-y-6">
            <h3 className="text-xl sm:text-2xl font-sans font-bold text-slate-900 dark:text-white mb-6">
              معلومات الاتصال المباشر
            </h3>

            {/* Phone Info Cards */}
            {settings.contactPhone && (
              <div className="flex items-center gap-4 p-5 bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800/80 rounded-2xl">
                <div className="p-3 bg-brand-primary/10 text-brand-primary rounded-xl shrink-0">
                  <Phone className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs text-slate-400 font-sans">رقم الهاتف والجوال:</div>
                  <a href={`tel:${settings.contactPhone}`} className="text-sm sm:text-base font-bold font-mono text-slate-900 dark:text-white hover:text-brand-primary transition-colors" dir="ltr">
                    {settings.contactPhone}
                  </a>
                </div>
              </div>
            )}

            {/* Email Info Card */}
            {settings.contactEmail && (
              <div className="flex items-center gap-4 p-5 bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800/80 rounded-2xl">
                <div className="p-3 bg-brand-primary/10 text-brand-primary rounded-xl shrink-0">
                  <Mail className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs text-slate-400 font-sans">البريد الإلكتروني:</div>
                  <a href={`mailto:${settings.contactEmail}`} className="text-sm sm:text-base font-bold text-slate-900 dark:text-white hover:text-brand-primary transition-colors">
                    {settings.contactEmail}
                  </a>
                </div>
              </div>
            )}

            {/* Address Info Card */}
            {settings.contactAddress && (
              <div className="flex items-center gap-4 p-5 bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800/80 rounded-2xl">
                <div className="p-3 bg-brand-primary/10 text-brand-primary rounded-xl shrink-0">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs text-slate-400 font-sans">العنوان والمقر:</div>
                  <p className="text-sm sm:text-base font-semibold text-slate-900 dark:text-white leading-relaxed">
                    {settings.contactAddress}
                  </p>
                </div>
              </div>
            )}

            {/* WhatsApp Quick Link */}
            {settings.contactWhatsapp && (
              <div className="pt-4">
                <a
                  href={`https://wa.me/${settings.contactWhatsapp.replace(/\+/g, "")}`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 px-6 py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm rounded-xl shadow-md shadow-emerald-600/10 hover:shadow-emerald-700/20 transition-all duration-300 w-full justify-center sm:w-auto"
                >
                  <MessageCircle className="w-5 h-5" />
                  <span>تواصل فوري عبر الواتساب</span>
                </a>
              </div>
            )}
          </div>

          {/* Contact Form Card */}
          <div className="lg:col-span-7 bg-slate-50 dark:bg-slate-850/20 p-6 sm:p-8 rounded-3xl border border-slate-100 dark:border-slate-800">
            <h3 className="text-xl sm:text-2xl font-sans font-bold text-slate-900 dark:text-white mb-6">
              أرسل لنا رسالة مباشرة
            </h3>

            {/* Inline Notifications */}
            {feedback && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex items-start gap-3 p-4 rounded-xl border mb-6 text-sm ${
                  feedback.type === "success"
                    ? "bg-emerald-50 dark:bg-emerald-950/20 border-emerald-100 dark:border-emerald-900/40 text-emerald-800 dark:text-emerald-300"
                    : "bg-rose-50 dark:bg-rose-950/20 border-rose-100 dark:border-rose-900/40 text-rose-800 dark:text-rose-300"
                }`}
              >
                {feedback.type === "success" ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
                ) : (
                  <AlertCircle className="w-5 h-5 text-rose-500 shrink-0" />
                )}
                <span className="font-sans font-medium">{feedback.message}</span>
              </motion.div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                {/* Name */}
                <div className="space-y-2">
                  <label htmlFor="name" className="text-xs font-bold text-slate-700 dark:text-slate-300 font-sans">
                    الاسم بالكامل *
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    placeholder="مثل: أحمد محمد"
                    className="w-full px-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl font-sans text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-brand-primary"
                  />
                </div>

                {/* Email */}
                <div className="space-y-2">
                  <label htmlFor="email" className="text-xs font-bold text-slate-700 dark:text-slate-300 font-sans">
                    البريد الإلكتروني *
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    placeholder="example@domain.com"
                    className="w-full px-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl font-sans text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-brand-primary"
                  />
                </div>
              </div>

              {/* Subject */}
              <div className="space-y-2">
                <label htmlFor="subject" className="text-xs font-bold text-slate-700 dark:text-slate-300 font-sans">
                  موضوع الرسالة
                </label>
                <input
                  type="text"
                  id="subject"
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  placeholder="مثل: استفسار عن الخدمات"
                  className="w-full px-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl font-sans text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-brand-primary"
                />
              </div>

              {/* Message */}
              <div className="space-y-2">
                <label htmlFor="message" className="text-xs font-bold text-slate-700 dark:text-slate-300 font-sans">
                  نص الرسالة والاستفسار *
                </label>
                <textarea
                  id="message"
                  name="message"
                  rows={4}
                  value={formData.message}
                  onChange={handleChange}
                  required
                  placeholder="اكتب تفاصيل طلبك أو استفسارك هنا وسنتواصل معك..."
                  className="w-full px-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl font-sans text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-brand-primary resize-none"
                />
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 px-6 bg-brand-primary hover:bg-brand-secondary disabled:bg-slate-400 text-white font-bold text-sm rounded-xl shadow-lg shadow-brand-primary/10 hover:shadow-brand-secondary/20 flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                {loading ? (
                  <span className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>إرسال الرسالة الآن</span>
                  </>
                )}
              </button>
            </form>
          </div>

        </div>
      </div>
    </section>
  );
}
