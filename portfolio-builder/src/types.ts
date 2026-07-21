/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface SiteSettings {
  siteName: string;
  siteLogo: string;
  logoWidth?: number;
  primaryColor: string;
  secondaryColor: string;
  fontFamily: string;
  heroTitle: string;
  heroSubtitle: string;
  heroBgImage: string;
  aboutTitle: string;
  aboutText: string;
  aboutImage: string;
  contactPhone: string;
  contactEmail: string;
  contactAddress: string;
  contactWhatsapp: string;
  socialFacebook: string;
  socialTwitter: string;
  socialInstagram: string;
  socialLinkedin: string;
  socialGithub: string;
  sectionOrder?: string[];
  activeSections: {
    hero: boolean;
    about: boolean;
    services: boolean;
    portfolio: boolean;
    testimonials: boolean;
    faq: boolean;
    blog: boolean;
    contact: boolean;
    offers?: boolean;
  };
}

export interface Offer {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  discountCode?: string;
  discountPercentage?: number;
  isActive: boolean;
  orderIndex: number;
}

export interface Service {
  id: string;
  title: string;
  description: string;
  icon: string;
}

export interface Project {
  id: string;
  title: string;
  description: string;
  category: string;
  images: string[];
  previewUrl: string;
  clientName: string;
  clientUrl: string;
  orderIndex: number;
}

export interface Testimonial {
  id: string;
  clientName: string;
  clientRole: string;
  clientCompany: string;
  feedback: string;
  rating: number;
  avatar: string;
}

export interface FAQ {
  id: string;
  question: string;
  answer: string;
}

export interface BlogPost {
  id: string;
  title: string;
  content: string;
  summary: string;
  image: string;
  date: string;
  readTime: string;
}

export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  date: string;
  isRead: boolean;
}

export interface DatabaseSchema {
  settings: SiteSettings;
  services: Service[];
  projects: Project[];
  testimonials: Testimonial[];
  faqs: FAQ[];
  blogs: BlogPost[];
  messages: ContactMessage[];
  offers: Offer[];
}
