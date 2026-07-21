import { useState } from "react";
import { motion } from "motion/react";
import { Tag, Copy, Check, Percent, ArrowRight } from "lucide-react";
import { Offer } from "../types";

interface OffersSectionProps {
  offers: Offer[];
}

export default function OffersSection({ offers }: OffersSectionProps) {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const activeOffers = offers.filter((o) => o.isActive);

  if (activeOffers.length === 0) return null;

  const handleCopyCode = (id: string, code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <section id="offers" className="py-24 bg-slate-50 dark:bg-slate-900/40 relative overflow-hidden">
      {/* Decorative Blur Backgrounds */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-brand-primary/5 rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-brand-primary/10 rounded-full blur-3xl" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="px-4 py-1.5 rounded-full text-xs font-semibold bg-brand-primary/10 text-brand-primary tracking-wider uppercase font-sans">
            عروض خاصة وحصرية
          </span>
          <h2 className="mt-4 text-3xl sm:text-4xl font-sans font-bold text-slate-900 dark:text-white tracking-tight">
            عروضنا الرقمية المتميزة
          </h2>
          <p className="mt-4 text-base text-slate-600 dark:text-slate-400 font-sans leading-relaxed">
            استفد من الفرص المتاحة وارتقِ بحضورك الرقمي اليوم مع هذه العروض الحصرية والمؤقتة لخدمات تطوير المواقع والتسويق.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {activeOffers.map((offer, index) => (
            <motion.div
              key={offer.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="bg-white dark:bg-slate-800 rounded-3xl overflow-hidden border border-slate-100 dark:border-slate-700/60 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col group relative"
            >
              {/* Discount Badge */}
              {offer.discountPercentage && (
                <div className="absolute top-4 right-4 z-20 bg-emerald-500 text-white text-xs font-bold px-3 py-1.5 rounded-full flex items-center gap-1 shadow-sm">
                  <Percent className="w-3.5 h-3.5" />
                  <span>خصم {offer.discountPercentage}%</span>
                </div>
              )}

              {/* Offer Image */}
              <div className="relative h-48 sm:h-52 overflow-hidden bg-slate-100 dark:bg-slate-700">
                {offer.imageUrl ? (
                  <img
                    src={offer.imageUrl}
                    alt={offer.title}
                    loading="lazy"
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-slate-400 dark:text-slate-500">
                    <Tag className="w-12 h-12 stroke-[1.5]" />
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-transparent to-transparent opacity-60" />
              </div>

              {/* Offer Details */}
              <div className="p-6 flex-1 flex flex-col">
                <h3 className="text-xl font-sans font-bold text-slate-900 dark:text-white leading-snug group-hover:text-brand-primary transition-colors">
                  {offer.title}
                </h3>
                <p className="mt-3 text-sm text-slate-600 dark:text-slate-400 font-sans leading-relaxed flex-1">
                  {offer.description}
                </p>

                {/* Promo Code Box */}
                {offer.discountCode && (
                  <div className="mt-6 p-3.5 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-slate-100 dark:border-slate-700/50 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <Tag className="w-4 h-4 text-slate-400 dark:text-slate-500" />
                      <span className="text-[12px] text-slate-500 dark:text-slate-400 font-sans">كود الخصم:</span>
                      <span className="font-mono font-bold text-sm tracking-wider text-slate-900 dark:text-white select-all">
                        {offer.discountCode}
                      </span>
                    </div>
                    <button
                      onClick={() => handleCopyCode(offer.id, offer.discountCode!)}
                      className="p-1.5 text-slate-500 dark:text-slate-400 hover:text-brand-primary dark:hover:text-brand-primary hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-all"
                      title="نسخ الكود"
                    >
                      {copiedId === offer.id ? (
                        <Check className="w-4 h-4 text-emerald-500" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                )}

                {/* CTA Action */}
                <a
                  href={`https://wa.me/${offers[0] ? "966501234567" : ""}?text=${encodeURIComponent(
                    `مرحباً، أود الاستفسار بخصوص العرض: ${offer.title} ${
                      offer.discountCode ? `(كود: ${offer.discountCode})` : ""
                    }`
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-6 w-full flex items-center justify-center gap-2 px-5 py-3 bg-brand-primary hover:bg-brand-secondary text-white font-sans font-semibold text-sm rounded-2xl shadow-sm hover:shadow-lg transition-all"
                >
                  <span>استفد من العرض الآن</span>
                  <ArrowRight className="w-4 h-4 transform rotate-180" />
                </a>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
