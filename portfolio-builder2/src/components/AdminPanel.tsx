/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import {
  Shield, Lock, LogOut, CheckCircle2, AlertCircle, Database, LayoutGrid,
  FileText, Star, HelpCircle, Mail, Settings, Plus, Trash2, Edit2, ChevronUp,
  ChevronDown, Image as ImageIcon, ExternalLink, RefreshCw, Upload, Download, ArrowRight, Eye, Tag, Copy, Percent, Menu, X
} from "lucide-react";
import { SiteSettings, Service, Project, Testimonial, FAQ, BlogPost, ContactMessage, Offer } from "../types";
import { AVAILABLE_ICONS } from "./LucideIcon";

interface AdminPanelProps {
  settings: SiteSettings;
  offers: Offer[];
  onClose: () => void;
  onRefreshAll: () => void;
}

// Client-side canvas-based image compression helper (Max 1600px width/height, 0.75 quality Jpeg conversion)
const compressImage = (file: File): Promise<{ base64: string; name: string }> => {
  return new Promise((resolve, reject) => {
    if (!file.type.startsWith("image/")) {
      reject(new Error("الملف المحدد ليس صورة صالحة"));
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        try {
          const canvas = document.createElement("canvas");
          const ctx = canvas.getContext("2d");
          if (!ctx) {
            resolve({ base64: event.target?.result as string, name: file.name });
            return;
          }

          const MAX_WIDTH = 1600;
          const MAX_HEIGHT = 1600;
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > MAX_WIDTH) {
              height *= MAX_WIDTH / width;
              width = MAX_WIDTH;
            }
          } else {
            if (height > MAX_HEIGHT) {
              width *= MAX_HEIGHT / height;
              height = MAX_HEIGHT;
            }
          }

          canvas.width = width;
          canvas.height = height;
          ctx.drawImage(img, 0, 0, width, height);

          const compressedBase64 = canvas.toDataURL("image/jpeg", 0.75);
          
          const origName = file.name;
          const lastDot = origName.lastIndexOf('.');
          const baseName = lastDot !== -1 ? origName.substring(0, lastDot) : origName;
          const cleanBaseName = baseName.replace(/[^a-zA-Z0-9.-]/g, "_");
          const newName = `${cleanBaseName}.jpg`;

          resolve({ base64: compressedBase64, name: newName });
        } catch (err) {
          resolve({ base64: event.target?.result as string, name: file.name });
        }
      };
      img.onerror = () => reject(new Error("فشل تحميل ملف الصورة لمعالجة الضغط"));
      img.src = event.target?.result as string;
    };
    reader.onerror = () => reject(new Error("فشل قراءة ملف الصورة من الجهاز"));
    reader.readAsDataURL(file);
  });
};

export default function AdminPanel({ settings, offers, onClose, onRefreshAll }: AdminPanelProps) {
  // Authentication State
  const [authToken, setAuthToken] = useState<string | null>(() => {
    try {
      return localStorage.getItem("adminToken");
    } catch (e) {
      console.warn("[AdminPanel] localStorage read failed:", e);
      return null;
    }
  });
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [authError, setAuthError] = useState("");
  const [authLoading, setAuthLoading] = useState(false);

  // Active Panel Tab
  const [activeTab, setActiveTab] = useState<
    "stats" | "general" | "sections" | "services" | "portfolio" | "testimonials" | "faqs" | "blog" | "messages" | "backup" | "offers" | "ordering"
  >("stats");

  // Database States loaded inside Dashboard
  const [stats, setStats] = useState({
    visitorCount: 0,
    messagesCount: 0,
    unreadMessagesCount: 0,
    projectsCount: 0,
    servicesCount: 0,
    blogsCount: 0
  });

  const [dbServices, setDbServices] = useState<Service[]>([]);
  const [dbProjects, setDbProjects] = useState<Project[]>([]);
  const [dbTestimonials, setDbTestimonials] = useState<Testimonial[]>([]);
  const [dbFaqs, setDbFaqs] = useState<FAQ[]>([]);
  const [dbBlogs, setDbBlogs] = useState<BlogPost[]>([]);
  const [dbOffers, setDbOffers] = useState<Offer[]>(offers);
  const [dbMessages, setDbMessages] = useState<ContactMessage[]>([]);

  // Editing Forms States
  const [localSettings, setLocalSettings] = useState<SiteSettings>(settings);
  const [actionFeedback, setActionFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const [formLoading, setFormLoading] = useState(false);

  // Modal / Form Sub-states for CRUD
  const [editingItem, setEditingItem] = useState<any>(null); // holds item being added or edited
  const [newImageUrl, setNewImageUrl] = useState(""); // temp field for adding image urls
  const [credentialsForm, setCredentialsForm] = useState({ currentPassword: "", newUsername: "admin", newPassword: "" });
  const [confirmDelete, setConfirmDelete] = useState<{ id: string; collection: string; label: string } | null>(null);
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);

  // Prevent background scroll on mount
  useEffect(() => {
    const originalStyle = window.getComputedStyle(document.body).overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = originalStyle;
    };
  }, []);

  // Auto-hide alerts
  useEffect(() => {
    if (actionFeedback) {
      const timer = setTimeout(() => setActionFeedback(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [actionFeedback]);

  // Load Administrative Data on Auth success
  useEffect(() => {
    if (authToken) {
      loadDashboardData();
    }
  }, [authToken]);

  const loadDashboardData = async () => {
    try {
      const headers = { Authorization: `Bearer ${authToken}` };

      // Fetch stats
      const statsRes = await fetch("/api/stats", { headers });
      if (statsRes.ok) {
        const statsData = await statsRes.json();
        setStats(statsData);
      }

      // Fetch all dynamic collections
      const [srvRes, projRes, testRes, faqRes, blogRes, offersRes, msgRes] = await Promise.all([
        fetch("/api/services"),
        fetch("/api/projects"),
        fetch("/api/testimonials"),
        fetch("/api/faqs"),
        fetch("/api/blogs"),
        fetch("/api/offers"),
        fetch("/api/messages", { headers })
      ]);

      if (srvRes.ok) setDbServices(await srvRes.json());
      if (projRes.ok) setDbProjects(await projRes.json());
      if (testRes.ok) setDbTestimonials(await testRes.json());
      if (faqRes.ok) setDbFaqs(await faqRes.json());
      if (blogRes.ok) setDbBlogs(await blogRes.json());
      if (offersRes.ok) setDbOffers(await offersRes.json());
      if (msgRes.ok) setDbMessages(await msgRes.json());

      // Fetch current administrative user details
      const meRes = await fetch("/api/auth/me", { headers });
      if (meRes.ok) {
        const meData = await meRes.json();
        if (meData.authenticated && meData.user) {
          setCredentialsForm(prev => ({ ...prev, newUsername: meData.user.username }));
        }
      }

    } catch (err) {
      console.error("Error loading admin dashboard data:", err);
    }
  };

  // Login handler
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError("");
    setAuthLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password })
      });
      const data = await res.json();
      if (res.ok) {
        try {
          localStorage.setItem("adminToken", data.token);
        } catch (e) {
          console.warn("[AdminPanel] Failed to save adminToken to localStorage:", e);
        }
        setAuthToken(data.token);
      } else {
        setAuthError(data.error || "خطأ غير متوقع أثناء تسجيل الدخول");
      }
    } catch (err) {
      setAuthError("فشل الاتصال بالخادم لمصادقة الحساب");
    } finally {
      setAuthLoading(false);
    }
  };

  // Logout handler
  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", {
        method: "POST",
        headers: { Authorization: `Bearer ${authToken}` }
      });
    } catch (err) {
      // ignore logout errors
    }
    try {
      localStorage.removeItem("adminToken");
    } catch (e) {
      console.warn("[AdminPanel] Failed to remove adminToken from localStorage:", e);
    }
    setAuthToken(null);
    setUsername("");
    setPassword("");
  };

  // Change Admin Credentials (Username and/or Password)
  const handleCredentialsChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionFeedback(null);

    try {
      const res = await fetch("/api/auth/change-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`
        },
        body: JSON.stringify({
          currentPassword: credentialsForm.currentPassword,
          newUsername: credentialsForm.newUsername,
          newPassword: credentialsForm.newPassword || undefined
        })
      });
      const data = await res.json();
      if (res.ok) {
        setActionFeedback({ type: "success", message: "تم تحديث بيانات الدخول بنجاح!" });
        setCredentialsForm(prev => ({ ...prev, currentPassword: "", newPassword: "" }));
      } else {
        setActionFeedback({ type: "error", message: data.error || "فشل تعديل بيانات الدخول" });
      }
    } catch (err) {
      setActionFeedback({ type: "error", message: "فشل الاتصال بالخادم لتعديل الأمان" });
    }
  };

  // Core backend image compression & upload proxy (with quality optimization and canvas scaling)
  const uploadAndProcessFile = async (file: File): Promise<string> => {
    try {
      setActionFeedback({ type: "success", message: "جاري ضغط ومعالجة الصورة لرفعها..." });
      const compressed = await compressImage(file);
      
      const res = await fetch("/api/upload", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`
        },
        body: JSON.stringify({
          fileName: compressed.name,
          base64Data: compressed.base64
        })
      });
      const data = await res.json();
      if (res.ok && data.url) {
        setActionFeedback({ type: "success", message: "تم ضغط ورفع الصورة بنجاح!" });
        return data.url;
      } else {
        throw new Error(data.error || "فشل الرفع للخادم");
      }
    } catch (err: any) {
      setActionFeedback({ type: "error", message: err.message || "خطأ أثناء رفع ومعالجة الصورة" });
      throw err;
    }
  };

  // Reusable Drag & Drop Image Upload Zone component
  const ImageUploadZone = ({ label, value, onChange, helperText }: {
    label: string;
    value: string;
    onChange: (url: string) => void;
    helperText?: string;
  }) => {
    const [dragActive, setDragActive] = useState(false);
    const [uploading, setUploading] = useState(false);

    const handleDrag = (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      if (e.type === "dragenter" || e.type === "dragover") {
        setDragActive(true);
      } else if (e.type === "dragleave") {
        setDragActive(false);
      }
    };

    const processSelectedFile = async (file: File) => {
      if (!file) return;
      setUploading(true);
      try {
        const url = await uploadAndProcessFile(file);
        onChange(url);
      } catch (err) {
        console.error(err);
      } finally {
        setUploading(false);
      }
    };

    const handleDrop = async (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setDragActive(false);
      if (e.dataTransfer.files && e.dataTransfer.files[0]) {
        await processSelectedFile(e.dataTransfer.files[0]);
      }
    };

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files[0]) {
        await processSelectedFile(e.target.files[0]);
      }
    };

    const handleRemoveImage = async () => {
      if (!value) return;
      try {
        await fetch("/api/upload", {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${authToken}`
          },
          body: JSON.stringify({ url: value })
        });
        setActionFeedback({ type: "success", message: "تم إزالة الملف ومعاينة الصورة المؤقتة." });
      } catch (err) {
        console.error("Error deleting temp file:", err);
      }
      onChange("");
    };

    return (
      <div className="space-y-2 w-full text-right font-sans">
        <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center justify-between">
          <span>{label}</span>
          {helperText && <span className="text-[10px] text-slate-400 font-normal">{helperText}</span>}
        </label>

        {value ? (
          <div className="relative group rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 p-2 overflow-hidden flex flex-col items-center">
            <img
              src={value}
              alt="معاينة المرفق"
              referrerPolicy="no-referrer"
              className="h-40 w-full object-cover rounded-xl border border-slate-100 dark:border-slate-850"
            />
            <div className="mt-2 w-full flex items-center justify-between gap-3 px-1">
              <span className="text-[10px] text-slate-400 dark:text-slate-500 font-mono truncate max-w-[70%]" dir="ltr">{value}</span>
              <button
                type="button"
                onClick={handleRemoveImage}
                className="px-3 py-1 bg-red-500/10 hover:bg-red-500 text-red-600 hover:text-white text-[11px] font-bold rounded-lg transition-all flex items-center gap-1 cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>حذف الصورة</span>
              </button>
            </div>
          </div>
        ) : (
          <div
            onDragEnter={handleDrag}
            onDragOver={handleDrag}
            onDragLeave={handleDrag}
            onDrop={handleDrop}
            className={`relative border-2 border-dashed rounded-2xl p-6 text-center transition-all flex flex-col items-center justify-center cursor-pointer min-h-[160px] ${
              dragActive
                ? "border-brand-primary bg-brand-primary/5"
                : "border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-slate-50/50 dark:bg-slate-900/20"
            }`}
          >
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              disabled={uploading}
            />
            {uploading ? (
              <div className="space-y-2 flex flex-col items-center">
                <RefreshCw className="w-8 h-8 text-brand-primary animate-spin" />
                <p className="text-xs font-bold text-slate-600 dark:text-slate-300">جاري ضغط ورفع الصورة...</p>
              </div>
            ) : (
              <div className="space-y-2 flex flex-col items-center">
                <div className="p-3 bg-slate-100 dark:bg-slate-800 rounded-full text-slate-500">
                  <Upload className="w-6 h-6" />
                </div>
                <p className="text-xs font-bold text-slate-700 dark:text-slate-200">
                  اسحب وأفلت الصورة هنا، أو <span className="text-brand-primary">تصفح جهازك</span>
                </p>
                <p className="text-[10px] text-slate-400">الحد الأقصى للملف: 5 ميجابايت (سيتم ضغطها وتصغيرها تلقائياً)</p>
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  // Settings Save handler
  const saveGeneralSettings = async (updatedSettings: SiteSettings) => {
    setFormLoading(true);
    setActionFeedback(null);
    try {
      const res = await fetch("/api/settings", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`
        },
        body: JSON.stringify(updatedSettings)
      });
      const data = await res.json();
      if (res.ok) {
        setActionFeedback({ type: "success", message: "تم حفظ الإعدادات وتحديث الهوية بنجاح!" });
        onRefreshAll(); // trigger parent refresh
      } else {
        setActionFeedback({ type: "error", message: data.error || "فشل حفظ الإعدادات" });
      }
    } catch (err) {
      setActionFeedback({ type: "error", message: "خطأ اتصال بالخادم لحفظ الإعدادات" });
    } finally {
      setFormLoading(false);
    }
  };

  // Contacts Messaging: Mark Read & Delete
  const handleMarkMessageRead = async (id: string) => {
    try {
      const res = await fetch(`/api/messages/${id}/read`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${authToken}` }
      });
      if (res.ok) {
        setDbMessages(dbMessages.map(m => m.id === id ? { ...m, isRead: true } : m));
        setStats(prev => ({ ...prev, unreadMessagesCount: Math.max(0, prev.unreadMessagesCount - 1) }));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteMessage = (id: string) => {
    setConfirmDelete({ id, collection: "messages", label: "الرسالة" });
  };

  // CRUD Operations Helpers for Collections (Services, Portfolio, Testimonials, FAQs, Blogs)
  const handleSaveCollectionItem = async (collection: string, item: any) => {
    setActionFeedback(null);
    const isNew = !item.id;
    const url = isNew ? `/api/${collection}` : `/api/${collection}/${item.id}`;
    const method = isNew ? "POST" : "PUT";

    try {
      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`
        },
        body: JSON.stringify(item)
      });
      if (res.ok) {
        setActionFeedback({
          type: "success",
          message: isNew ? "تمت إضافة العنصر بنجاح!" : "تم تعديل وحفظ التغييرات بنجاح!"
        });
        setEditingItem(null);
        loadDashboardData();
        onRefreshAll();
      } else {
        const errData = await res.json();
        setActionFeedback({ type: "error", message: errData.error || "فشل حفظ التعديلات" });
      }
    } catch (err) {
      setActionFeedback({ type: "error", message: "حدث خطأ بالاتصال بالخادم لحفظ التعديلات" });
    }
  };

  const handleDeleteCollectionItem = (collection: string, id: string, label?: string) => {
    setConfirmDelete({ id, collection, label: label || "هذا العنصر" });
  };

  // Reordering Projects
  const handleReorderProject = async (index: number, direction: "up" | "down") => {
    const newProjects = [...dbProjects];
    const targetIdx = direction === "up" ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= newProjects.length) return;

    // Swap items
    const temp = newProjects[index];
    newProjects[index] = newProjects[targetIdx];
    newProjects[targetIdx] = temp;

    setDbProjects(newProjects);

    // Send the updated ordering to backend
    const orderedIds = newProjects.map(p => p.id);
    try {
      const res = await fetch("/api/projects/reorder", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`
        },
        body: JSON.stringify({ orderedIds })
      });
      if (res.ok) {
        onRefreshAll();
      } else {
        setActionFeedback({ type: "error", message: "فشل حفظ الترتيب الجديد للمشاريع" });
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Reordering Offers
  const handleReorderOffer = async (index: number, direction: "up" | "down") => {
    const newOffers = [...dbOffers];
    const targetIdx = direction === "up" ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= newOffers.length) return;

    // Swap items
    const temp = newOffers[index];
    newOffers[index] = newOffers[targetIdx];
    newOffers[targetIdx] = temp;

    setDbOffers(newOffers);

    // Send the updated ordering to backend
    const orderedIds = newOffers.map(o => o.id);
    try {
      const res = await fetch("/api/offers/reorder", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`
        },
        body: JSON.stringify({ orderedIds })
      });
      if (res.ok) {
        onRefreshAll();
      } else {
        setActionFeedback({ type: "error", message: "فشل حفظ الترتيب الجديد للعروض" });
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Backup & Restore
  const handleBackupImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const json = JSON.parse(event.target?.result as string);
        const res = await fetch("/api/backup/import", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${authToken}`
          },
          body: JSON.stringify({ backupData: json })
        });
        const data = await res.json();
        if (res.ok) {
          setActionFeedback({ type: "success", message: "تم استيراد واستعادة النسخة الاحتياطية بنجاح! جاري تحديث البيانات..." });
          setTimeout(() => {
            window.location.reload();
          }, 2000);
        } else {
          setActionFeedback({ type: "error", message: data.error || "فشل استيراد النسخة الاحتياطية" });
        }
      } catch (err: any) {
        setActionFeedback({ type: "error", message: "فشل قراءة الملف كـ JSON صحيح: " + err.message });
      }
    };
    reader.readAsText(file);
  };

  // If not authenticated, show secure Login Interface
  if (!authToken) {
    return (
      <div className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4">
        <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl space-y-6">
          <div className="text-center space-y-2">
            <div className="inline-flex p-4 bg-brand-primary/10 text-brand-primary rounded-2xl">
              <Shield className="w-8 h-8" />
            </div>
            <h2 className="text-2xl font-sans font-extrabold text-slate-900 dark:text-white">
              تسجيل الدخول للوحة التحكم
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 font-sans">
              يرجى إدخال اسم المستخدم وكلمة المرور للدخول للقسم الإداري
            </p>
          </div>

          {authError && (
            <div className="flex items-center gap-2 p-4 rounded-xl bg-rose-50 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-900/40 text-rose-800 dark:text-rose-300 text-xs sm:text-sm">
              <AlertCircle className="w-5 h-5 text-rose-500 shrink-0" />
              <span className="font-sans font-medium">{authError}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-1.5">
              <label htmlFor="admin-username" className="text-xs font-bold text-slate-700 dark:text-slate-300 font-sans">
                اسم المستخدم *
              </label>
              <input
                type="text"
                id="admin-username"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="أدخل اسم المستخدم"
                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-sans text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-brand-primary"
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="admin-password" className="text-xs font-bold text-slate-700 dark:text-slate-300 font-sans">
                كلمة المرور *
              </label>
              <input
                type="password"
                id="admin-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="أدخل كلمة المرور"
                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-sans text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-brand-primary"
              />
            </div>

            <button
              type="submit"
              disabled={authLoading}
              className="w-full py-3 px-4 bg-brand-primary hover:bg-brand-secondary text-white font-bold rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              {authLoading ? (
                <span className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <Lock className="w-4 h-4" />
                  <span>دخول آمن</span>
                </>
              )}
            </button>
          </form>

          <button
            onClick={onClose}
            className="w-full py-3 px-4 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-semibold rounded-xl text-center transition-all text-sm cursor-pointer"
          >
            الرجوع للموقع العام
          </button>
        </div>
      </div>
    );
  }

  // Dashboard Frame
  return (
    <div className="fixed inset-0 z-50 bg-slate-50 dark:bg-slate-950 flex flex-col md:flex-row transition-colors">
      
      {/* Mobile Drawer Backdrop */}
      {isMobileNavOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/60 backdrop-blur-xs md:hidden transition-opacity"
          onClick={() => setIsMobileNavOpen(false)}
        />
      )}

      {/* Sidebar navigation (Drawers in mobile, fixed aside on desktop) */}
      <aside className={`fixed inset-y-0 right-0 z-40 w-72 bg-slate-900 text-slate-300 flex flex-col justify-between shrink-0 border-l border-slate-800 transition-transform duration-300 md:relative md:w-64 md:translate-x-0 ${
        isMobileNavOpen ? "translate-x-0" : "translate-x-full"
      }`}>
        <div className="p-5 flex flex-col space-y-6 overflow-y-auto max-h-[85vh] md:max-h-none custom-scrollbar">
          
          {/* Logo & Brand Header with close button */}
          <div className="flex items-center justify-between pb-4 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-brand-primary text-white rounded-xl">
                <Shield className="w-5 h-5" />
              </div>
              <div>
                <span className="font-sans font-bold text-base text-white block">لوحة تحكم إبداع</span>
                <span className="text-[10px] text-slate-500 font-sans">بنية برمجية متكاملة</span>
              </div>
            </div>
            
            {/* Close Mobile Drawer */}
            <button
              onClick={() => setIsMobileNavOpen(false)}
              className="md:hidden p-2 text-slate-400 hover:text-white hover:bg-slate-850 rounded-xl"
            >
              <X className="w-5.5 h-5.5" />
            </button>
          </div>

          {/* Tab buttons */}
          <nav className="space-y-1">
            {[
              { id: "stats", label: "الرئيسية والإحصائيات", icon: LayoutGrid },
              { id: "general", label: "الهوية والألوان", icon: Settings },
              { id: "sections", label: "الـ Hero ومن نحن", icon: FileText },
              { id: "services", label: "إدارة الخدمات", icon: LayoutGrid },
              { id: "portfolio", label: "معرض الأعمال", icon: ImageIcon },
              { id: "offers", label: "العروض الخاصة", icon: Tag },
              { id: "testimonials", label: "آراء العملاء", icon: Star },
              { id: "faqs", label: "الأسئلة الشائعة", icon: HelpCircle },
              { id: "blog", label: "إدارة المدونة", icon: FileText },
              { id: "ordering", label: "أقسام وترتيب الموقع", icon: ChevronDown },
              { id: "messages", label: `رسائل الاتصال (${stats.unreadMessagesCount})`, icon: Mail },
              { id: "backup", label: "النسخ والأمان", icon: Database },
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => {
                    setActiveTab(tab.id as any);
                    setEditingItem(null);
                    setIsMobileNavOpen(false);
                  }}
                  className={`w-full px-4 py-3 rounded-xl font-sans text-sm font-medium flex items-center gap-3 transition-colors ${
                    activeTab === tab.id
                      ? "bg-brand-primary text-white"
                      : "hover:bg-slate-800 text-slate-400 hover:text-white"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Bottom controls */}
        <div className="p-5 border-t border-slate-800 space-y-3">
          <button
            onClick={() => {
              onClose();
              setIsMobileNavOpen(false);
            }}
            className="w-full py-2.5 px-4 bg-slate-800 hover:bg-slate-700 text-white text-xs sm:text-sm font-semibold rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer"
          >
            <ArrowRight className="w-4 h-4" />
            <span>عرض الموقع العام</span>
          </button>

          <button
            onClick={() => {
              handleLogout();
              setIsMobileNavOpen(false);
            }}
            className="w-full py-2.5 px-4 bg-rose-950/20 hover:bg-rose-950/40 text-rose-400 text-xs sm:text-sm font-semibold rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            <span>تسجيل الخروج</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto touch-momentum custom-scrollbar bg-slate-50 dark:bg-slate-900">
        
        {/* Top Header */}
        <header className="sticky top-0 z-10 bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800/80 p-4 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            {/* Hamburger menu for mobile navigation */}
            <button
              onClick={() => setIsMobileNavOpen(true)}
              className="md:hidden p-2 -mr-1 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl shrink-0"
              title="القائمة الإدارية"
            >
              <Menu className="w-5.5 h-5.5" />
            </button>
            <h1 className="text-sm sm:text-xl font-sans font-extrabold text-slate-900 dark:text-white truncate">
              {activeTab === "stats" && "اللوحة الرئيسية للزوار والإحصائيات"}
              {activeTab === "general" && "إعدادات الهوية والسمات البصرية"}
              {activeTab === "sections" && "محتوى الأقسام الأساسية والـ Hero"}
              {activeTab === "services" && "إدارة وتعديل الخدمات المقدمة"}
              {activeTab === "portfolio" && "إدارة معرض الأعمال والمشاريع"}
              {activeTab === "offers" && "إدارة وتعديل العروض الترويجية"}
              {activeTab === "testimonials" && "آراء العملاء والشركاء"}
              {activeTab === "faqs" && "الأسئلة الشائعة وإجاباتها"}
              {activeTab === "blog" && "إدارة مقالات مدونة إبداع"}
              {activeTab === "ordering" && "أقسام وترتيب صفحات الموقع"}
              {activeTab === "messages" && "بريد ورسائل تواصل العملاء"}
              {activeTab === "backup" && "الأمان والنسخ الاحتياطي لقاعدة البيانات"}
            </h1>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={loadDashboardData}
              className="p-2 bg-slate-50 hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-300 rounded-xl transition-all"
              title="تحديث البيانات"
            >
              <RefreshCw className="w-4.5 h-4.5" />
            </button>
            <div className="hidden sm:flex items-center gap-2 text-xs font-semibold px-3 py-1.5 bg-brand-primary/10 text-brand-primary rounded-lg">
              <span className="h-2 w-2 rounded-full bg-brand-primary animate-pulse" />
              <span>جلسة إدارية نشطة</span>
            </div>
          </div>
        </header>

        {/* Horizontal scroll tabs for fast thumbs-friendly switching on mobile */}
        <div className="md:hidden flex overflow-x-auto gap-2 px-4 py-2.5 bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800/80 shrink-0 select-none scrollbar-none">
          {[
            { id: "stats", label: "الرئيسية", icon: LayoutGrid },
            { id: "general", label: "الهوية", icon: Settings },
            { id: "sections", label: "الأقسام", icon: FileText },
            { id: "services", label: "الخدمات", icon: LayoutGrid },
            { id: "portfolio", label: "الأعمال", icon: ImageIcon },
            { id: "offers", label: "العروض", icon: Tag },
            { id: "testimonials", label: "الآراء", icon: Star },
            { id: "faqs", label: "الأسئلة", icon: HelpCircle },
            { id: "blog", label: "المدونة", icon: FileText },
            { id: "ordering", label: "الترتيب", icon: ChevronDown },
            { id: "messages", label: `الرسائل (${stats.unreadMessagesCount})`, icon: Mail },
            { id: "backup", label: "الأمان", icon: Database },
          ].map((tab) => {
            const Icon = tab.icon;
            const isSelected = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id as any);
                  setEditingItem(null);
                }}
                className={`px-3 py-1.5 rounded-xl font-sans text-xs font-bold flex items-center gap-1.5 whitespace-nowrap shrink-0 transition-all ${
                  isSelected
                    ? "bg-brand-primary text-white shadow-sm shadow-brand-primary/15"
                    : "bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400"
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Body panel container */}
        <div className="p-2 sm:p-8 flex-1 relative max-w-7xl w-full mx-auto mobile-full-width-layout">
          
          {/* Action toast feedback */}
          {actionFeedback && (
            <div
              className={`fixed top-20 left-6 z-50 flex items-start gap-3 p-4 rounded-xl border shadow-xl max-w-sm ${
                actionFeedback.type === "success"
                  ? "bg-emerald-50 border-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:border-emerald-900 dark:text-emerald-200"
                  : "bg-rose-50 border-rose-100 text-rose-800 dark:bg-rose-950 dark:border-rose-900 dark:text-rose-200"
              }`}
            >
              {actionFeedback.type === "success" ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
              ) : (
                <AlertCircle className="w-5 h-5 text-rose-500 shrink-0" />
              )}
              <span className="font-sans font-medium text-sm">{actionFeedback.message}</span>
            </div>
          )}

          {/* Tab Panels */}

          {/* TAB 1: Stats & Insights */}
          {activeTab === "stats" && (
            <div className="space-y-8 animate-fadeIn">
              {/* Stats overview cards */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  { label: "زيارات الموقع", value: stats.visitorCount, icon: Eye, color: "text-blue-500" },
                  { label: "رسائل التواصل", value: stats.messagesCount, icon: Mail, color: "text-emerald-500" },
                  { label: "مشاريع أعمالنا", value: stats.projectsCount, icon: ImageIcon, color: "text-purple-500" },
                  { label: "إجمالي المقالات", value: stats.blogsCount, icon: FileText, color: "text-amber-500" }
                ].map((stat, idx) => {
                  const Icon = stat.icon;
                  return (
                    <div key={idx} className="p-5 sm:p-6 bg-white dark:bg-slate-850 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs sm:text-sm font-semibold text-slate-500 dark:text-slate-400 font-sans">{stat.label}</span>
                        <div className={`p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 ${stat.color}`}>
                          <Icon className="w-5 h-5" />
                        </div>
                      </div>
                      <div className="text-2xl sm:text-3xl font-black font-mono text-slate-900 dark:text-white">
                        {stat.value}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Message preview and recent activities */}
              <div className="bg-white dark:bg-slate-850 border border-slate-100 dark:border-slate-800 rounded-3xl p-6 shadow-sm">
                <div className="flex items-center justify-between mb-6 border-b border-slate-100 dark:border-slate-800 pb-4">
                  <h3 className="font-sans font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
                    <Mail className="w-5 h-5 text-brand-primary" />
                    <span>آخر رسائل البريد الواردة</span>
                  </h3>
                  <button
                    onClick={() => setActiveTab("messages")}
                    className="text-xs font-bold text-brand-primary hover:text-brand-secondary"
                  >
                    عرض كافة الرسائل
                  </button>
                </div>

                <div className="divide-y divide-slate-100 dark:divide-slate-800">
                  {dbMessages.slice(0, 4).map((msg) => (
                    <div key={msg.id} className="py-4 flex items-start justify-between gap-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className={`h-2.5 w-2.5 rounded-full ${msg.isRead ? "bg-slate-300" : "bg-brand-primary"}`} />
                          <h4 className="font-sans font-bold text-sm text-slate-900 dark:text-white">{msg.name}</h4>
                          <span className="text-[10px] text-slate-400 font-sans" dir="ltr">({msg.email})</span>
                        </div>
                        <p className="text-xs font-semibold text-slate-700 dark:text-slate-300 font-sans">{msg.subject}</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400 font-sans line-clamp-1">{msg.message}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        {!msg.isRead && (
                          <button
                            onClick={() => handleMarkMessageRead(msg.id)}
                            className="px-2 py-1 bg-brand-primary/10 text-brand-primary text-[10px] font-bold rounded hover:bg-brand-primary hover:text-white transition-all"
                          >
                            تحديد كمقروء
                          </button>
                        )}
                        <button
                          onClick={() => handleDeleteMessage(msg.id)}
                          className="p-1 text-slate-400 hover:text-rose-500 rounded"
                          title="حذف الرسالة"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}

                  {dbMessages.length === 0 && (
                    <div className="text-center py-12 text-slate-400 font-sans text-sm">
                      علبة الوارد فارغة، لا توجد رسائل جديدة مضافة.
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: General Site Settings */}
          {activeTab === "general" && (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                saveGeneralSettings(localSettings);
              }}
              className="bg-white dark:bg-slate-850 border border-slate-100 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-6"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Site Name */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 font-sans">اسم الموقع بالكامل *</label>
                  <input
                    type="text"
                    required
                    value={localSettings.siteName}
                    onChange={(e) => setLocalSettings({ ...localSettings, siteName: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm"
                  />
                </div>

                {/* Custom Logo Upload & Width Adjustment */}
                <div className="space-y-4 md:col-span-2 p-5 bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl">
                  <h4 className="font-sans font-bold text-sm text-slate-950 dark:text-white flex items-center gap-2">
                    <ImageIcon className="w-4 h-4 text-brand-primary" />
                    <span>رفع وإدارة شعار الموقع الإلكتروني (Logo)</span>
                  </h4>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
                    <div className="space-y-2">
                      <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 font-sans">ملف الشعار (يفضل خلفية شفافة PNG)</label>
                      <div className="flex items-center gap-3">
                        <input
                          type="file"
                          accept="image/*"
                          id="logo-upload-input"
                          className="hidden"
                          onChange={async (e) => {
                            const file = e.target.files?.[0];
                            if (!file) return;
                            try {
                              setFormLoading(true);
                              const reader = new FileReader();
                              reader.onloadend = async () => {
                                const base64 = reader.result as string;
                                const res = await fetch("/api/upload", {
                                  method: "POST",
                                  headers: {
                                    "Content-Type": "application/json",
                                    "Authorization": `Bearer ${authToken}`
                                  },
                                  body: JSON.stringify({ fileName: file.name, base64Data: base64 })
                                });
                                if (res.ok) {
                                  const data = await res.json();
                                  setLocalSettings({ ...localSettings, siteLogo: data.url });
                                  setActionFeedback({ type: "success", message: "تم رفع الشعار وتحديثه بنجاح" });
                                } else {
                                  const err = await res.json();
                                  setActionFeedback({ type: "error", message: err.error || "فشل رفع الشعار" });
                                }
                              };
                              reader.readAsDataURL(file);
                            } catch (err: any) {
                              setActionFeedback({ type: "error", message: "حدث خطأ: " + err.message });
                            } finally {
                              setFormLoading(false);
                            }
                          }}
                        />
                        <button
                          type="button"
                          onClick={() => document.getElementById("logo-upload-input")?.click()}
                          className="px-4 py-2.5 bg-brand-primary/10 hover:bg-brand-primary hover:text-white text-brand-primary text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center gap-2"
                        >
                          <Upload className="w-4 h-4" />
                          <span>اختر ملف الشعار</span>
                        </button>
                        
                        {localSettings.siteLogo ? (
                          <button
                            type="button"
                            onClick={() => setLocalSettings({ ...localSettings, siteLogo: "" })}
                            className="px-3 py-2.5 bg-rose-500/10 hover:bg-rose-500 hover:text-white text-rose-500 text-xs font-bold rounded-xl transition-all"
                          >
                            حذف الشعار الحالي
                          </button>
                        ) : null}
                      </div>

                      {/* Display Direct URL Input as fallback */}
                      <div className="mt-3 space-y-1">
                        <span className="text-[10px] font-medium text-slate-400 font-sans">أو رابط مباشر للشعار:</span>
                        <input
                          type="text"
                          placeholder="مثال: https://my-site.com/logo.png"
                          value={localSettings.siteLogo}
                          onChange={(e) => setLocalSettings({ ...localSettings, siteLogo: e.target.value })}
                          className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs"
                        />
                      </div>
                    </div>

                    <div className="space-y-3">
                      <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 font-sans">عرض الشعار بالشريط العلوي (بالبكسل)</label>
                      <div className="flex items-center gap-4">
                        <input
                          type="range"
                          min="40"
                          max="300"
                          step="5"
                          value={localSettings.logoWidth || 120}
                          onChange={(e) => setLocalSettings({ ...localSettings, logoWidth: parseInt(e.target.value) })}
                          className="flex-1 accent-brand-primary cursor-pointer"
                        />
                        <span className="text-sm font-bold font-mono px-3 py-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shrink-0">
                          {localSettings.logoWidth || 120}px
                        </span>
                      </div>

                      {/* Preview area */}
                      <div className="p-3 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700/50 rounded-xl flex items-center justify-center min-h-[70px]">
                        {localSettings.siteLogo ? (
                          <img
                            src={localSettings.siteLogo}
                            alt="Logo preview"
                            style={{ width: `${localSettings.logoWidth || 120}px` }}
                            className="h-auto max-h-12 object-contain"
                          />
                        ) : (
                          <span className="text-xs text-slate-400 font-sans">لا يوجد شعار مرفوع حالياً (سيظهر اسم الموقع فقط كـ نص)</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Primary Color Picker */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 font-sans">اللون الأساسي للبراند</label>
                  <div className="flex items-center gap-3">
                    <input
                      type="color"
                      value={localSettings.primaryColor}
                      onChange={(e) => setLocalSettings({ ...localSettings, primaryColor: e.target.value })}
                      className="h-10 w-10 border-0 rounded-lg cursor-pointer"
                    />
                    <input
                      type="text"
                      value={localSettings.primaryColor}
                      onChange={(e) => setLocalSettings({ ...localSettings, primaryColor: e.target.value })}
                      className="flex-1 px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-mono"
                    />
                  </div>
                </div>

                {/* Secondary Color Picker */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 font-sans">اللون الثانوي والرديف</label>
                  <div className="flex items-center gap-3">
                    <input
                      type="color"
                      value={localSettings.secondaryColor}
                      onChange={(e) => setLocalSettings({ ...localSettings, secondaryColor: e.target.value })}
                      className="h-10 w-10 border-0 rounded-lg cursor-pointer"
                    />
                    <input
                      type="text"
                      value={localSettings.secondaryColor}
                      onChange={(e) => setLocalSettings({ ...localSettings, secondaryColor: e.target.value })}
                      className="flex-1 px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-mono"
                    />
                  </div>
                </div>
              </div>

              {/* Toggle sections active checkboxes */}
              <div className="border-t border-slate-100 dark:border-slate-800 pt-6">
                <h4 className="font-sans font-bold text-sm text-slate-900 dark:text-white mb-4">عرض وإخفاء أقسام الموقع الإلكتروني</h4>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  {[
                    { key: "hero", label: "الواجهة الترحيبية" },
                    { key: "about", label: "من نحن" },
                    { key: "offers", label: "العروض الخاصة" },
                    { key: "services", label: "خدماتنا" },
                    { key: "portfolio", label: "معرض أعمالنا" },
                    { key: "testimonials", label: "آراء عملائنا" },
                    { key: "faq", label: "الأسئلة الشائعة" },
                    { key: "blog", label: "المدونة والمقالات" },
                    { key: "contact", label: "اتصل بنا والنموذج" }
                  ].map((sec) => (
                    <label key={sec.key} className="flex items-center gap-2 px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-xl cursor-pointer">
                      <input
                        type="checkbox"
                        checked={(localSettings.activeSections as any)[sec.key]}
                        onChange={(e) => setLocalSettings({
                          ...localSettings,
                          activeSections: {
                            ...localSettings.activeSections,
                            [sec.key]: e.target.checked
                          }
                        })}
                        className="rounded border-slate-300 dark:border-slate-800 text-brand-primary"
                      />
                      <span className="font-sans text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-300">{sec.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="pt-4 flex justify-end">
                <button
                  type="submit"
                  disabled={formLoading}
                  className="px-6 py-3 bg-brand-primary hover:bg-brand-secondary text-white font-bold text-sm rounded-xl flex items-center gap-2 cursor-pointer"
                >
                  {formLoading && <span className="h-4.5 w-4.5 border-2 border-white border-t-transparent rounded-full animate-spin" />}
                  <span>حفظ وإطلاق التغييرات الهيكلية</span>
                </button>
              </div>
            </form>
          )}

          {/* TAB 3: Hero & About section contents */}
          {activeTab === "sections" && (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                saveGeneralSettings(localSettings);
              }}
              className="space-y-6"
            >
              {/* Hero edit details */}
              <div className="bg-white dark:bg-slate-850 border border-slate-100 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-6">
                <h3 className="font-sans font-extrabold text-base text-slate-900 dark:text-white border-b border-slate-50 dark:border-slate-800 pb-3">
                  محتويات الواجهة الترحيبية (Hero Banner)
                </h3>

                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 font-sans">العنوان الترحيبي العريض *</label>
                    <input
                      type="text"
                      required
                      value={localSettings.heroTitle}
                      onChange={(e) => setLocalSettings({ ...localSettings, heroTitle: e.target.value })}
                      className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 font-sans">الوصف والتعريف الفرعي *</label>
                    <textarea
                      required
                      rows={3}
                      value={localSettings.heroSubtitle}
                      onChange={(e) => setLocalSettings({ ...localSettings, heroSubtitle: e.target.value })}
                      className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm resize-none"
                    />
                  </div>

                  {/* Hero Image file upload with Drag & Drop */}
                  <div className="bg-slate-50/50 dark:bg-slate-900/30 p-4 rounded-2xl border border-slate-100 dark:border-slate-800">
                    <ImageUploadZone
                      label="صورة الخلفية الترحيبية (Hero Background)"
                      value={localSettings.heroBgImage}
                      onChange={(url) => setLocalSettings({ ...localSettings, heroBgImage: url })}
                      helperText="اختر صورة ذات دقة وجودة عالية للواجهة الترحيبية"
                    />
                  </div>
                </div>
              </div>

              {/* About Us section contents */}
              <div className="bg-white dark:bg-slate-850 border border-slate-100 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-6">
                <h3 className="font-sans font-extrabold text-base text-slate-900 dark:text-white border-b border-slate-50 dark:border-slate-800 pb-3">
                  محتويات صفحة &ldquo;من نحن&rdquo; (About Us)
                </h3>

                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 font-sans">عنوان القسم الرئيسي *</label>
                    <input
                      type="text"
                      required
                      value={localSettings.aboutTitle}
                      onChange={(e) => setLocalSettings({ ...localSettings, aboutTitle: e.target.value })}
                      className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 font-sans">النصوص التعريفية وسيرة العمل بالكامل *</label>
                    <textarea
                      required
                      rows={6}
                      value={localSettings.aboutText}
                      onChange={(e) => setLocalSettings({ ...localSettings, aboutText: e.target.value })}
                      className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm leading-relaxed"
                    />
                  </div>

                  {/* About Image upload with Drag & Drop */}
                  <div className="bg-slate-50/50 dark:bg-slate-900/30 p-4 rounded-2xl border border-slate-100 dark:border-slate-800">
                    <ImageUploadZone
                      label="الصورة التعبيرية لقسم من نحن"
                      value={localSettings.aboutImage}
                      onChange={(url) => setLocalSettings({ ...localSettings, aboutImage: url })}
                      helperText="الصورة التوضيحية التي تظهر بجوار النص التعريفي"
                    />
                  </div>
                </div>
              </div>

              {/* Socials & Contacts */}
              <div className="bg-white dark:bg-slate-850 border border-slate-100 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-6">
                <h3 className="font-sans font-extrabold text-base text-slate-900 dark:text-white border-b border-slate-50 dark:border-slate-800 pb-3">
                  أرقام التواصل والشبكات الاجتماعية
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 font-sans">رقم الجوال أو الهاتف</label>
                    <input
                      type="text"
                      value={localSettings.contactPhone}
                      onChange={(e) => setLocalSettings({ ...localSettings, contactPhone: e.target.value })}
                      className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-mono"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 font-sans">البريد الإلكتروني المعتمد</label>
                    <input
                      type="email"
                      value={localSettings.contactEmail}
                      onChange={(e) => setLocalSettings({ ...localSettings, contactEmail: e.target.value })}
                      className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 font-sans">رقم الواتساب مع رمز الدولة (بدون + أو أصفار)</label>
                    <input
                      type="text"
                      placeholder="مثل: 966501234567"
                      value={localSettings.contactWhatsapp}
                      onChange={(e) => setLocalSettings({ ...localSettings, contactWhatsapp: e.target.value })}
                      className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-mono"
                    />
                  </div>

                  <div className="space-y-1.5 sm:col-span-2">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 font-sans">العنوان الجغرافي بالكامل</label>
                    <input
                      type="text"
                      value={localSettings.contactAddress}
                      onChange={(e) => setLocalSettings({ ...localSettings, contactAddress: e.target.value })}
                      className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 font-sans">حساب فيسبوك (رابط كامل)</label>
                    <input
                      type="text"
                      value={localSettings.socialFacebook}
                      onChange={(e) => setLocalSettings({ ...localSettings, socialFacebook: e.target.value })}
                      className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-mono"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 font-sans">حساب تويتر / إكس (رابط كامل)</label>
                    <input
                      type="text"
                      value={localSettings.socialTwitter}
                      onChange={(e) => setLocalSettings({ ...localSettings, socialTwitter: e.target.value })}
                      className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-mono"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 font-sans">حساب إنستغرام (رابط كامل)</label>
                    <input
                      type="text"
                      value={localSettings.socialInstagram}
                      onChange={(e) => setLocalSettings({ ...localSettings, socialInstagram: e.target.value })}
                      className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-mono"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 font-sans">حساب لينكد إن (رابط كامل)</label>
                    <input
                      type="text"
                      value={localSettings.socialLinkedin}
                      onChange={(e) => setLocalSettings({ ...localSettings, socialLinkedin: e.target.value })}
                      className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-mono"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 font-sans">حساب غيت هاب (رابط كامل)</label>
                    <input
                      type="text"
                      value={localSettings.socialGithub}
                      onChange={(e) => setLocalSettings({ ...localSettings, socialGithub: e.target.value })}
                      className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-mono"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-4 flex justify-end">
                <button
                  type="submit"
                  disabled={formLoading}
                  className="px-6 py-3 bg-brand-primary hover:bg-brand-secondary text-white font-bold text-sm rounded-xl flex items-center gap-2 cursor-pointer"
                >
                  {formLoading && <span className="h-4.5 w-4.5 border-2 border-white border-t-transparent rounded-full animate-spin" />}
                  <span>حفظ وإطلاق تعديلات المحتوى والشبكات</span>
                </button>
              </div>
            </form>
          )}

          {/* TAB 4: Services Management */}
          {activeTab === "services" && (
            <div className="space-y-6">
              {!editingItem ? (
                <div className="bg-white dark:bg-slate-850 border border-slate-100 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-6">
                  <div className="flex items-center justify-between">
                    <h3 className="font-sans font-bold text-slate-900 dark:text-white">قائمة الخدمات الحالية</h3>
                    <button
                      onClick={() => setEditingItem({ title: "", description: "", icon: "Globe" })}
                      className="px-4 py-2.5 bg-brand-primary hover:bg-brand-secondary text-white font-bold text-xs sm:text-sm rounded-xl flex items-center gap-1.5 cursor-pointer"
                    >
                      <Plus className="w-4 h-4" />
                      <span>إضافة خدمة جديدة</span>
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {dbServices.map((srv) => (
                      <div key={srv.id} className="p-4 bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl flex justify-between gap-4">
                        <div className="space-y-1">
                          <h4 className="font-sans font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                            <span className="p-1.5 bg-brand-primary/10 text-brand-primary rounded">{srv.icon}</span>
                            <span>{srv.title}</span>
                          </h4>
                          <p className="text-xs text-slate-500 dark:text-slate-400 font-sans leading-relaxed line-clamp-2">
                            {srv.description}
                          </p>
                        </div>

                        <div className="flex items-center gap-1.5 shrink-0">
                          <button
                            onClick={() => setEditingItem(srv)}
                            className="p-2 text-slate-400 hover:text-brand-primary rounded"
                            title="تعديل الخدمة"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteCollectionItem("services", srv.id)}
                            className="p-2 text-slate-400 hover:text-rose-500 rounded"
                            title="حذف الخدمة"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleSaveCollectionItem("services", editingItem);
                  }}
                  className="bg-white dark:bg-slate-850 border border-slate-100 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-5"
                >
                  <h3 className="font-sans font-bold text-slate-900 dark:text-white">
                    {editingItem.id ? "تعديل الخدمة الحالية" : "إضافة وتأسيس خدمة جديدة"}
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700 dark:text-slate-300 font-sans">عنوان الخدمة *</label>
                      <input
                        type="text"
                        required
                        value={editingItem.title}
                        onChange={(e) => setEditingItem({ ...editingItem, title: e.target.value })}
                        className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700 dark:text-slate-300 font-sans">أيقونة الخدمة الرسومية *</label>
                      <select
                        value={editingItem.icon}
                        onChange={(e) => setEditingItem({ ...editingItem, icon: e.target.value })}
                        className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm"
                      >
                        {AVAILABLE_ICONS.map(ic => (
                          <option key={ic} value={ic}>{ic}</option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-1.5 sm:col-span-2">
                      <label className="text-xs font-bold text-slate-700 dark:text-slate-300 font-sans">الوصف التفصيلي والفوائد للعميل *</label>
                      <textarea
                        required
                        rows={4}
                        value={editingItem.description}
                        onChange={(e) => setEditingItem({ ...editingItem, description: e.target.value })}
                        className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm"
                      />
                    </div>
                  </div>

                  <div className="pt-4 flex gap-3 justify-end">
                    <button
                      type="button"
                      onClick={() => setEditingItem(null)}
                      className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-sm font-semibold rounded-xl"
                    >
                      إلغاء التعديل
                    </button>
                    <button
                      type="submit"
                      className="px-5 py-2.5 bg-brand-primary hover:bg-brand-secondary text-white font-bold text-sm rounded-xl"
                    >
                      حفظ وتثبيت البيانات
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}

          {/* TAB 5: Portfolio Projects Manager */}
          {activeTab === "portfolio" && (
            <div className="space-y-6">
              {!editingItem ? (
                <div className="bg-white dark:bg-slate-850 border border-slate-100 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-sans font-bold text-slate-900 dark:text-white">مشاريع معرض الأعمال الحالية</h3>
                      <p className="text-xs text-slate-400 font-sans mt-1">تستطيع ترتيب المشاريع للأمام أو الخلف باستخدام أزرار الأسهم المخصصة للترتيب</p>
                    </div>
                    <button
                      onClick={() => setEditingItem({
                        title: "", description: "", category: "تطوير ويب",
                        images: [], previewUrl: "", clientName: "", clientUrl: ""
                      })}
                      className="px-4 py-2.5 bg-brand-primary hover:bg-brand-secondary text-white font-bold text-xs sm:text-sm rounded-xl flex items-center gap-1.5 cursor-pointer"
                    >
                      <Plus className="w-4 h-4" />
                      <span>إضافة مشروع جديد</span>
                    </button>
                  </div>

                  <div className="space-y-3">
                    {dbProjects.map((proj, idx) => (
                      <div key={proj.id} className="p-4 bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl flex items-center justify-between gap-4">
                        <div className="flex items-center gap-4 min-w-0">
                          {/* Ordering Controls */}
                          <div className="flex flex-col gap-1 shrink-0">
                            <button
                              onClick={() => handleReorderProject(idx, "up")}
                              disabled={idx === 0}
                              className="p-1 bg-white hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700 disabled:opacity-30 rounded border border-slate-200 dark:border-slate-700 text-slate-500"
                              title="ترقية الترتيب للأعلى"
                            >
                              <ChevronUp className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleReorderProject(idx, "down")}
                              disabled={idx === dbProjects.length - 1}
                              className="p-1 bg-white hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700 disabled:opacity-30 rounded border border-slate-200 dark:border-slate-700 text-slate-500"
                              title="تأخير الترتيب للأسفل"
                            >
                              <ChevronDown className="w-3.5 h-3.5" />
                            </button>
                          </div>

                          {/* Image preview cover */}
                          <div className="h-12 w-16 bg-slate-200 rounded overflow-hidden shrink-0">
                            <img
                              src={proj.images?.[0] || "https://images.unsplash.com/photo-1541462608141-275d72e2302a?q=80&w=150&auto=format&fit=crop"}
                              alt={proj.title}
                              className="w-full h-full object-cover"
                              referrerPolicy="no-referrer"
                            />
                          </div>

                          <div className="min-w-0">
                            <h4 className="font-sans font-bold text-sm text-slate-900 dark:text-white line-clamp-1">{proj.title}</h4>
                            <div className="flex items-center gap-2 mt-1">
                              <span className="text-[10px] px-2 py-0.5 bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded font-sans">{proj.category}</span>
                              {proj.clientName && (
                                <span className="text-[10px] text-slate-400 font-sans">مع الشريك: {proj.clientName}</span>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-1 shrink-0">
                          <button
                            onClick={() => setEditingItem(proj)}
                            className="p-2 text-slate-400 hover:text-brand-primary rounded"
                            title="تعديل المشروع"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteCollectionItem("projects", proj.id)}
                            className="p-2 text-slate-400 hover:text-rose-500 rounded"
                            title="حذف المشروع"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}

                    {dbProjects.length === 0 && (
                      <div className="text-center py-12 text-slate-400 font-sans text-sm">
                        لم يتم إضافة أي مشروع في المعرض بعد. اضغط على زر الإضافة لتأسيس مشروعك الأول!
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleSaveCollectionItem("projects", editingItem);
                  }}
                  className="bg-white dark:bg-slate-850 border border-slate-100 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-6"
                >
                  <h3 className="font-sans font-bold text-slate-900 dark:text-white border-b border-slate-50 dark:border-slate-800 pb-3">
                    {editingItem.id ? "تعديل تفاصيل المشروع" : "تأسيس وإضافة مشروع جديد لجمهورك"}
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700 dark:text-slate-300 font-sans">عنوان المشروع بالكامل *</label>
                      <input
                        type="text"
                        required
                        value={editingItem.title}
                        onChange={(e) => setEditingItem({ ...editingItem, title: e.target.value })}
                        className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700 dark:text-slate-300 font-sans">تصنيف المشروع ومجاله *</label>
                      <input
                        type="text"
                        required
                        placeholder="مثال: تطوير ويب، تصميم واجهات، هوية بصرية"
                        value={editingItem.category}
                        onChange={(e) => setEditingItem({ ...editingItem, category: e.target.value })}
                        className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm"
                      />
                    </div>

                    <div className="space-y-1.5 sm:col-span-2">
                      <label className="text-xs font-bold text-slate-700 dark:text-slate-300 font-sans">الوصف التفصيلي وقصة النجاح للمشروع *</label>
                      <textarea
                        required
                        rows={4}
                        value={editingItem.description}
                        onChange={(e) => setEditingItem({ ...editingItem, description: e.target.value })}
                        className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700 dark:text-slate-300 font-sans">رابط معاينة المشروع المباشر</label>
                      <input
                        type="url"
                        placeholder="https://example.com/project"
                        value={editingItem.previewUrl}
                        onChange={(e) => setEditingItem({ ...editingItem, previewUrl: e.target.value })}
                        className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-mono"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700 dark:text-slate-300 font-sans">اسم الشريك / العميل للمشروع</label>
                      <input
                        type="text"
                        value={editingItem.clientName}
                        onChange={(e) => setEditingItem({ ...editingItem, clientName: e.target.value })}
                        className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700 dark:text-slate-300 font-sans">رابط موقع العميل أو الشريك</label>
                      <input
                        type="url"
                        value={editingItem.clientUrl}
                        onChange={(e) => setEditingItem({ ...editingItem, clientUrl: e.target.value })}
                        className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-mono"
                      />
                    </div>
                  </div>

                  {/* Multiple image list management */}
                  <div className="border-t border-slate-100 dark:border-slate-800 pt-6 space-y-4">
                    <h4 className="font-sans font-bold text-sm text-slate-900 dark:text-white">إدارة صور المشروع المتعددة (رفع أو إضافة روابط)</h4>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* Form to insert dynamic URL */}
                      <div className="space-y-1.5">
                        <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400 font-sans">إضافة صورة عن طريق رابط خارجي:</label>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            placeholder="https://images.unsplash.com/photo-..."
                            value={newImageUrl}
                            onChange={(e) => setNewImageUrl(e.target.value)}
                            className="flex-1 px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-mono"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              if (newImageUrl.trim()) {
                                setEditingItem({
                                  ...editingItem,
                                  images: [...(editingItem.images || []), newImageUrl.trim()]
                                });
                                setNewImageUrl("");
                              }
                            }}
                            className="px-4 py-2 bg-brand-primary text-white text-xs font-bold rounded-xl"
                          >
                            إدراج
                          </button>
                        </div>
                      </div>

                      {/* File Upload helper with Drag & Drop */}
                      <div className="p-4 bg-slate-50 dark:bg-slate-900/40 rounded-2xl border border-slate-200 dark:border-slate-800">
                        <ImageUploadZone
                          label="إضافة صورة جديدة لمعرض المشروع"
                          value=""
                          onChange={(url) => {
                            if (url) {
                              setEditingItem({
                                ...editingItem,
                                images: [...(editingItem.images || []), url]
                              });
                            }
                          }}
                          helperText="سيتم إضافة الصورة المرفوعة مباشرة إلى ألبوم المشروع أدناه"
                        />
                      </div>
                    </div>

                    {/* Preview list of project images */}
                    <div className="flex flex-wrap gap-3 pt-3">
                      {(editingItem.images || []).map((imgUrl: string, index: number) => (
                        <div key={index} className="relative h-20 w-28 border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden group shrink-0">
                          <img src={imgUrl} alt="Project image preview" className="h-full w-full object-cover" referrerPolicy="no-referrer" />
                          <button
                            type="button"
                            onClick={() => setEditingItem({
                              ...editingItem,
                              images: editingItem.images.filter((_: any, idx: number) => idx !== index)
                            })}
                            className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center text-rose-400 font-bold text-xs transition-opacity rounded-lg"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ))}

                      {(editingItem.images || []).length === 0 && (
                        <span className="text-xs text-slate-400 font-sans">لا توجد صور مضافة للمشروع حالياً. يرجى إرفاق صورة واحدة كغلاف على الأقل.</span>
                      )}
                    </div>
                  </div>

                  <div className="pt-6 flex gap-3 justify-end border-t border-slate-100 dark:border-slate-800">
                    <button
                      type="button"
                      onClick={() => setEditingItem(null)}
                      className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-sm font-semibold rounded-xl"
                    >
                      إلغاء التعديل
                    </button>
                    <button
                      type="submit"
                      className="px-5 py-2.5 bg-brand-primary hover:bg-brand-secondary text-white font-bold text-sm rounded-xl"
                    >
                      حفظ وتثبيت المشروع بالكامل
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}

          {/* TAB 6: Testimonials Management */}
          {activeTab === "testimonials" && (
            <div className="space-y-6">
              {!editingItem ? (
                <div className="bg-white dark:bg-slate-850 border border-slate-100 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-6">
                  <div className="flex items-center justify-between">
                    <h3 className="font-sans font-bold text-slate-900 dark:text-white">قائمة آراء العملاء الحالية</h3>
                    <button
                      onClick={() => setEditingItem({ clientName: "", clientRole: "", clientCompany: "", feedback: "", rating: 5, avatar: "" })}
                      className="px-4 py-2.5 bg-brand-primary hover:bg-brand-secondary text-white font-bold text-xs sm:text-sm rounded-xl flex items-center gap-1.5 cursor-pointer"
                    >
                      <Plus className="w-4 h-4" />
                      <span>إضافة رأي جديد</span>
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {dbTestimonials.map((test) => (
                      <div key={test.id} className="p-4 bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl flex justify-between gap-4">
                        <div className="flex gap-3">
                          <img src={test.avatar || "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=100&auto=format&fit=crop"} alt={test.clientName} className="h-10 w-10 rounded-full object-cover shrink-0 border" referrerPolicy="no-referrer" />
                          <div className="space-y-1">
                            <h4 className="font-sans font-bold text-sm text-slate-900 dark:text-white">{test.clientName}</h4>
                            <p className="text-[10px] text-slate-400 font-sans">{test.clientRole} {test.clientCompany ? `، ${test.clientCompany}` : ""}</p>
                            <p className="text-xs text-slate-500 dark:text-slate-400 font-sans line-clamp-2 italic">&ldquo;{test.feedback}&rdquo;</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-1 shrink-0">
                          <button
                            onClick={() => setEditingItem(test)}
                            className="p-2 text-slate-400 hover:text-brand-primary rounded"
                            title="تعديل الرأي"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteCollectionItem("testimonials", test.id)}
                            className="p-2 text-slate-400 hover:text-rose-500 rounded"
                            title="حذف الرأي"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleSaveCollectionItem("testimonials", editingItem);
                  }}
                  className="bg-white dark:bg-slate-850 border border-slate-100 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-5"
                >
                  <h3 className="font-sans font-bold text-slate-900 dark:text-white">إضافة أو تعديل رأي العميل</h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700 dark:text-slate-300 font-sans">اسم العميل بالكامل *</label>
                      <input
                        type="text"
                        required
                        value={editingItem.clientName}
                        onChange={(e) => setEditingItem({ ...editingItem, clientName: e.target.value })}
                        className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700 dark:text-slate-300 font-sans">المنصب والوظيفة للعميل</label>
                      <input
                        type="text"
                        placeholder="مثل: المدير التنفيذي، رائد أعمال"
                        value={editingItem.clientRole}
                        onChange={(e) => setEditingItem({ ...editingItem, clientRole: e.target.value })}
                        className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700 dark:text-slate-300 font-sans">الشركة أو المؤسسة</label>
                      <input
                        type="text"
                        value={editingItem.clientCompany}
                        onChange={(e) => setEditingItem({ ...editingItem, clientCompany: e.target.value })}
                        className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700 dark:text-slate-300 font-sans">التقييم بالنجوم (من 1 إلى 5)</label>
                      <select
                        value={editingItem.rating}
                        onChange={(e) => setEditingItem({ ...editingItem, rating: Number(e.target.value) })}
                        className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm"
                      >
                        <option value={5}>5 نجوم (كامل)</option>
                        <option value={4}>4 نجوم (ممتاز)</option>
                        <option value={3}>3 نجوم (جيد)</option>
                        <option value={2}>نجمتان</option>
                        <option value={1}>نجمة واحدة</option>
                      </select>
                    </div>

                    <div className="space-y-1.5 sm:col-span-2">
                      <label className="text-xs font-bold text-slate-700 dark:text-slate-300 font-sans">الرسالة والنص الكامل للتوصية *</label>
                      <textarea
                        required
                        rows={4}
                        value={editingItem.feedback}
                        onChange={(e) => setEditingItem({ ...editingItem, feedback: e.target.value })}
                        className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm"
                      />
                    </div>

                    {/* Avatar Upload with Drag & Drop */}
                    <div className="sm:col-span-2 bg-slate-50/50 dark:bg-slate-900/30 p-4 rounded-2xl border border-slate-150 dark:border-slate-800">
                      <ImageUploadZone
                        label="الصورة الرمزية للعميل (Avatar)"
                        value={editingItem.avatar || ""}
                        onChange={(url) => setEditingItem({ ...editingItem, avatar: url })}
                        helperText="يفضل صورة مربعة الأبعاد ونظيفة لوجه العميل"
                      />
                    </div>
                  </div>

                  <div className="pt-4 flex gap-3 justify-end border-t border-slate-100 dark:border-slate-800">
                    <button
                      type="button"
                      onClick={() => setEditingItem(null)}
                      className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-sm font-semibold rounded-xl"
                    >
                      إلغاء التعديل
                    </button>
                    <button
                      type="submit"
                      className="px-5 py-2.5 bg-brand-primary hover:bg-brand-secondary text-white font-bold text-sm rounded-xl"
                    >
                      حفظ الرأي وإدراجه بالموقع
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}

          {/* TAB 7: FAQs Management */}
          {activeTab === "faqs" && (
            <div className="space-y-6">
              {!editingItem ? (
                <div className="bg-white dark:bg-slate-850 border border-slate-100 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-6">
                  <div className="flex items-center justify-between">
                    <h3 className="font-sans font-bold text-slate-900 dark:text-white">قائمة الأسئلة الشائعة</h3>
                    <button
                      onClick={() => setEditingItem({ question: "", answer: "" })}
                      className="px-4 py-2.5 bg-brand-primary hover:bg-brand-secondary text-white font-bold text-xs sm:text-sm rounded-xl flex items-center gap-1.5 cursor-pointer"
                    >
                      <Plus className="w-4 h-4" />
                      <span>إضافة سؤال وجواب جديد</span>
                    </button>
                  </div>

                  <div className="space-y-3">
                    {dbFaqs.map((faq) => (
                      <div key={faq.id} className="p-4 bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl flex justify-between gap-4">
                        <div className="space-y-1">
                          <h4 className="font-sans font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                            <HelpCircle className="w-4.5 h-4.5 text-brand-primary shrink-0" />
                            <span>{faq.question}</span>
                          </h4>
                          <p className="text-xs text-slate-500 dark:text-slate-400 font-sans leading-relaxed line-clamp-2">
                            {faq.answer}
                          </p>
                        </div>

                        <div className="flex items-center gap-1 shrink-0">
                          <button
                            onClick={() => setEditingItem(faq)}
                            className="p-2 text-slate-400 hover:text-brand-primary rounded"
                            title="تعديل السؤال"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteCollectionItem("faqs", faq.id)}
                            className="p-2 text-slate-400 hover:text-rose-500 rounded"
                            title="حذف السؤال"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleSaveCollectionItem("faqs", editingItem);
                  }}
                  className="bg-white dark:bg-slate-850 border border-slate-100 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-5"
                >
                  <h3 className="font-sans font-bold text-slate-900 dark:text-white">إضافة أو تعديل سؤال وجواب</h3>

                  <div className="space-y-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700 dark:text-slate-300 font-sans">السؤال الأساسي *</label>
                      <input
                        type="text"
                        required
                        value={editingItem.question}
                        onChange={(e) => setEditingItem({ ...editingItem, question: e.target.value })}
                        className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700 dark:text-slate-300 font-sans">الإجابة والرد التفصيلي بالكامل *</label>
                      <textarea
                        required
                        rows={5}
                        value={editingItem.answer}
                        onChange={(e) => setEditingItem({ ...editingItem, answer: e.target.value })}
                        className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm"
                      />
                    </div>
                  </div>

                  <div className="pt-4 flex gap-3 justify-end border-t border-slate-100 dark:border-slate-800">
                    <button
                      type="button"
                      onClick={() => setEditingItem(null)}
                      className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-sm font-semibold rounded-xl"
                    >
                      إلغاء التعديل
                    </button>
                    <button
                      type="submit"
                      className="px-5 py-2.5 bg-brand-primary hover:bg-brand-secondary text-white font-bold text-sm rounded-xl"
                    >
                      حفظ وتثبيت السؤال
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}

          {/* TAB 8: Blog Management */}
          {activeTab === "blog" && (
            <div className="space-y-6">
              {!editingItem ? (
                <div className="bg-white dark:bg-slate-850 border border-slate-100 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-6">
                  <div className="flex items-center justify-between">
                    <h3 className="font-sans font-bold text-slate-900 dark:text-white">قائمة مقالات مدونتك الحالية</h3>
                    <button
                      onClick={() => setEditingItem({ title: "", summary: "", content: "", image: "", readTime: "5 دقائق" })}
                      className="px-4 py-2.5 bg-brand-primary hover:bg-brand-secondary text-white font-bold text-xs sm:text-sm rounded-xl flex items-center gap-1.5 cursor-pointer"
                    >
                      <Plus className="w-4 h-4" />
                      <span>إضافة تدوينة جديدة</span>
                    </button>
                  </div>

                  <div className="space-y-3">
                    {dbBlogs.map((blog) => (
                      <div key={blog.id} className="p-4 bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl flex justify-between items-center gap-4">
                        <div className="flex items-center gap-3 min-w-0">
                          <img src={blog.image || "https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=100&auto=format&fit=crop"} alt={blog.title} className="h-10 w-14 rounded object-cover shrink-0" referrerPolicy="no-referrer" />
                          <div className="min-w-0">
                            <h4 className="font-sans font-bold text-sm text-slate-900 dark:text-white line-clamp-1">{blog.title}</h4>
                            <p className="text-[10px] text-slate-400 font-sans mt-0.5">{blog.date} • وقت القراءة: {blog.readTime}</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-1 shrink-0">
                          <button
                            onClick={() => setEditingItem(blog)}
                            className="p-2 text-slate-400 hover:text-brand-primary rounded"
                            title="تعديل التدوينة"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteCollectionItem("blogs", blog.id)}
                            className="p-2 text-slate-400 hover:text-rose-500 rounded"
                            title="حذف التدوينة"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleSaveCollectionItem("blogs", editingItem);
                  }}
                  className="bg-white dark:bg-slate-850 border border-slate-100 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-5"
                >
                  <h3 className="font-sans font-bold text-slate-900 dark:text-white border-b border-slate-50 dark:border-slate-800 pb-3">إضافة وتعديل مقال المدونة</h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5 sm:col-span-2">
                      <label className="text-xs font-bold text-slate-700 dark:text-slate-300 font-sans">عنوان المقال بالكامل *</label>
                      <input
                        type="text"
                        required
                        value={editingItem.title}
                        onChange={(e) => setEditingItem({ ...editingItem, title: e.target.value })}
                        className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm"
                      />
                    </div>

                    <div className="space-y-1.5 sm:col-span-2">
                      <label className="text-xs font-bold text-slate-700 dark:text-slate-300 font-sans">مخلص المقال (سيو ومشاركات) *</label>
                      <textarea
                        required
                        rows={2}
                        value={editingItem.summary}
                        onChange={(e) => setEditingItem({ ...editingItem, summary: e.target.value })}
                        className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm"
                      />
                    </div>

                    <div className="space-y-1.5 sm:col-span-2">
                      <label className="text-xs font-bold text-slate-700 dark:text-slate-300 font-sans">المحتوى الكامل والتدوينة بالكامل *</label>
                      <textarea
                        required
                        rows={8}
                        value={editingItem.content}
                        onChange={(e) => setEditingItem({ ...editingItem, content: e.target.value })}
                        className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700 dark:text-slate-300 font-sans">وقت القراءة التقريبي</label>
                      <input
                        type="text"
                        placeholder="مثل: 5 دقائق"
                        value={editingItem.readTime}
                        onChange={(e) => setEditingItem({ ...editingItem, readTime: e.target.value })}
                        className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm"
                      />
                    </div>

                    {/* Image Cover upload with Drag & Drop */}
                    <div className="sm:col-span-2 bg-slate-50/50 dark:bg-slate-900/30 p-4 rounded-2xl border border-slate-150 dark:border-slate-800">
                      <ImageUploadZone
                        label="صورة غلاف المقال التعبيرية"
                        value={editingItem.image || ""}
                        onChange={(url) => setEditingItem({ ...editingItem, image: url })}
                        helperText="الصورة البارزة التي تظهر كغلاف في قسم المدونة"
                      />
                    </div>
                  </div>

                  <div className="pt-4 flex gap-3 justify-end border-t border-slate-100 dark:border-slate-800">
                    <button
                      type="button"
                      onClick={() => setEditingItem(null)}
                      className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-sm font-semibold rounded-xl"
                    >
                      إلغاء التعديل
                    </button>
                    <button
                      type="submit"
                      className="px-5 py-2.5 bg-brand-primary hover:bg-brand-secondary text-white font-bold text-sm rounded-xl"
                    >
                      حفظ وتثبيت المقال
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}

          {/* TAB: Promotional Offers */}
          {activeTab === "offers" && (
            <div className="space-y-6">
              {/* Offers List & Header */}
              <div className="bg-white dark:bg-slate-850 border border-slate-100 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-50 dark:border-slate-800 pb-4">
                  <div>
                    <h3 className="font-sans font-bold text-slate-900 dark:text-white">إدارة وتعديل العروض الترويجية والخصومات</h3>
                    <p className="text-xs text-slate-400 font-sans mt-1">تستطيع إضافة، تعديل، تفعيل أو تعطيل، وترتيب عروض الخدمات والخصومات الخاصة التي تظهر لزوار موقعك.</p>
                  </div>
                  <button
                    onClick={() => setEditingItem({
                      title: "",
                      description: "",
                      imageUrl: "",
                      discountCode: "",
                      discountPercentage: 10,
                      isActive: true,
                      orderIndex: dbOffers.length
                    })}
                    className="px-4 py-2.5 bg-brand-primary hover:bg-brand-secondary text-white text-xs sm:text-sm font-bold rounded-xl flex items-center justify-center gap-1.5 transition-all self-start cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    <span>إضافة عرض جديد</span>
                  </button>
                </div>

                <div className="space-y-3">
                  {dbOffers.map((offer, idx) => (
                    <div key={offer.id} className="p-4 bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="flex items-center gap-4 min-w-0">
                        {/* Ordering Controls */}
                        <div className="flex flex-col gap-1 shrink-0">
                          <button
                            onClick={() => handleReorderOffer(idx, "up")}
                            disabled={idx === 0}
                            className="p-1 bg-white hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700 disabled:opacity-30 rounded border border-slate-200 dark:border-slate-700 text-slate-500"
                            title="ترقية الترتيب للأعلى"
                          >
                            <ChevronUp className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleReorderOffer(idx, "down")}
                            disabled={idx === dbOffers.length - 1}
                            className="p-1 bg-white hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700 disabled:opacity-30 rounded border border-slate-200 dark:border-slate-700 text-slate-500"
                            title="تأخير الترتيب للأسفل"
                          >
                            <ChevronDown className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        {/* Image preview cover */}
                        <div className="h-12 w-16 bg-slate-200 dark:bg-slate-800 rounded overflow-hidden shrink-0 flex items-center justify-center">
                          {offer.imageUrl ? (
                            <img
                              src={offer.imageUrl}
                              alt={offer.title}
                              className="w-full h-full object-cover"
                              referrerPolicy="no-referrer"
                            />
                          ) : (
                            <Percent className="w-5 h-5 text-brand-primary" />
                          )}
                        </div>

                        <div className="min-w-0 space-y-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h4 className="font-sans font-bold text-sm text-slate-900 dark:text-white line-clamp-1">{offer.title}</h4>
                            {offer.discountPercentage > 0 && (
                              <span className="text-[10px] px-2 py-0.5 bg-rose-500/10 text-rose-600 dark:text-rose-400 font-extrabold rounded font-sans">
                                خصم {offer.discountPercentage}%
                              </span>
                            )}
                            {offer.discountCode && (
                              <span className="text-[10px] px-2 py-0.5 bg-brand-primary/10 text-brand-primary font-mono font-bold rounded">
                                كود: {offer.discountCode}
                              </span>
                            )}
                            <button
                              onClick={async () => {
                                setFormLoading(true);
                                try {
                                  const updated = { ...offer, isActive: !offer.isActive };
                                  const res = await fetch(`/api/offers/${offer.id}`, {
                                    method: "PUT",
                                    headers: {
                                      "Content-Type": "application/json",
                                      "Authorization": `Bearer ${authToken}`
                                    },
                                    body: JSON.stringify(updated)
                                  });
                                  if (res.ok) {
                                    setDbOffers(dbOffers.map(o => o.id === offer.id ? updated : o));
                                    setActionFeedback({ type: "success", message: "تم تغيير حالة تفعيل العرض بنجاح" });
                                    onRefreshAll();
                                  } else {
                                    setActionFeedback({ type: "error", message: "فشل تغيير حالة العرض" });
                                  }
                                } catch (err: any) {
                                  setActionFeedback({ type: "error", message: "خطأ: " + err.message });
                                } finally {
                                  setFormLoading(false);
                                }
                              }}
                              className={`text-[9px] px-1.5 py-0.5 rounded font-extrabold transition-all cursor-pointer ${
                                offer.isActive
                                  ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/30"
                                  : "bg-slate-300/30 text-slate-500 hover:bg-slate-300/50"
                              }`}
                            >
                              {offer.isActive ? "نشط ومفعّل" : "مخفي ومعطّل"}
                            </button>
                          </div>
                          <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1 font-sans">{offer.description}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-1 shrink-0 self-end sm:self-auto">
                        <button
                          onClick={() => setEditingItem(offer)}
                          className="p-2 text-slate-400 hover:text-brand-primary rounded"
                          title="تعديل العرض"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteCollectionItem("offers", offer.id, offer.title)}
                          className="p-2 text-slate-400 hover:text-rose-500 rounded"
                          title="حذف العرض"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}

                  {dbOffers.length === 0 && (
                    <div className="text-center py-12 text-slate-400 font-sans text-sm">
                      لم يتم إضافة أي عروض ترويجية حتى الآن. اضغط على زر "إضافة عرض جديد" بالأعلى للبدء.
                    </div>
                  )}
                </div>
              </div>

              {/* Edit/Add Form Overlay Modal */}
              {editingItem && editingItem.orderIndex !== undefined && (
                <form
                  onSubmit={async (e) => {
                    e.preventDefault();
                    await handleSaveCollectionItem("offers", editingItem);
                  }}
                  className="bg-white dark:bg-slate-850 border border-slate-100 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-6"
                >
                  <h4 className="font-sans font-bold text-slate-900 dark:text-white border-b border-slate-50 dark:border-slate-800 pb-3">
                    {editingItem.id ? "تعديل بيانات العرض الترويجي" : "إضافة عرض ترويجي جديد"}
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5 sm:col-span-2">
                      <label className="text-xs font-bold text-slate-700 dark:text-slate-300 font-sans">عنوان العرض الترويجي *</label>
                      <input
                        type="text"
                        required
                        value={editingItem.title}
                        onChange={(e) => setEditingItem({ ...editingItem, title: e.target.value })}
                        placeholder="مثال: خصم خاص 20% على خدمات تصميم الهوية البصرية"
                        className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm"
                      />
                    </div>

                    <div className="space-y-1.5 sm:col-span-2">
                      <label className="text-xs font-bold text-slate-700 dark:text-slate-300 font-sans">وصف العرض والامتيازات المشمولة *</label>
                      <textarea
                        required
                        rows={3}
                        value={editingItem.description}
                        onChange={(e) => setEditingItem({ ...editingItem, description: e.target.value })}
                        placeholder="اكتب تفاصيل العرض والخدمات المشمولة فيه وشروط الاستفادة منه بالتفصيل..."
                        className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700 dark:text-slate-300 font-sans">نسبة الخصم المئوية (%)</label>
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={editingItem.discountPercentage}
                        onChange={(e) => setEditingItem({ ...editingItem, discountPercentage: parseInt(e.target.value) || 0 })}
                        className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-mono"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700 dark:text-slate-300 font-sans">كود الخصم (إن وجد)</label>
                      <input
                        type="text"
                        value={editingItem.discountCode || ""}
                        onChange={(e) => setEditingItem({ ...editingItem, discountCode: e.target.value.toUpperCase() })}
                        placeholder="مثال: OFFER20"
                        className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-mono"
                      />
                    </div>

                    {/* Offers Image upload with Drag & Drop */}
                    <div className="sm:col-span-2 bg-slate-50/50 dark:bg-slate-900/30 p-4 rounded-2xl border border-slate-150 dark:border-slate-800">
                      <ImageUploadZone
                        label="صورة العرض الترويجي"
                        value={editingItem.imageUrl || ""}
                        onChange={(url) => setEditingItem({ ...editingItem, imageUrl: url })}
                        helperText="الصورة التوضيحية للعرض الترويجي أو التخفيض"
                      />
                    </div>

                    <div className="p-3 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center justify-between sm:col-span-2">
                      <div className="space-y-0.5">
                        <span className="text-xs text-slate-900 dark:text-white font-sans font-bold">تفعيل العرض فوراً</span>
                        <p className="text-[10px] text-slate-400 font-sans">عند تفعيل العرض سيظهر فوراً لزوار الموقع في القسم المخصص.</p>
                      </div>
                      <input
                        type="checkbox"
                        checked={editingItem.isActive}
                        onChange={(e) => setEditingItem({ ...editingItem, isActive: e.target.checked })}
                        className="rounded border-slate-300 dark:border-slate-800 text-brand-primary h-5 w-5 accent-brand-primary"
                      />
                    </div>
                  </div>

                  <div className="pt-4 flex gap-3 justify-end border-t border-slate-100 dark:border-slate-800">
                    <button
                      type="button"
                      onClick={() => setEditingItem(null)}
                      className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-sm font-semibold rounded-xl"
                    >
                      إلغاء
                    </button>
                    <button
                      type="submit"
                      className="px-5 py-2.5 bg-brand-primary hover:bg-brand-secondary text-white font-bold text-sm rounded-xl cursor-pointer"
                    >
                      حفظ وتثبيت العرض
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}

          {/* TAB: Page Sections Sorting / Reordering */}
          {activeTab === "ordering" && (
            <div className="bg-white dark:bg-slate-850 border border-slate-100 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-6">
              <div>
                <h3 className="font-sans font-bold text-slate-900 dark:text-white">أقسام وترتيب صفحات الموقع</h3>
                <p className="text-xs text-slate-400 font-sans mt-1">
                  يمكنك إعادة ترتيب تسلسل ظهور أقسام موقعك الإلكتروني لزوارك عن طريق استخدام أزرار الترتيب (للأعلى وللأسفل).
                </p>
              </div>

              <div className="space-y-3">
                {(() => {
                  const currentOrder = localSettings.sectionOrder || ["hero", "about", "offers", "services", "portfolio", "testimonials", "faq", "blog", "contact"];
                  const labelsMap: Record<string, string> = {
                    hero: "الواجهة الترحيبية (Hero Section)",
                    about: "من نحن والتعريف الشخصي (About Section)",
                    offers: "قسم العروض الخاصة والتخفيضات (Offers Section)",
                    services: "الخدمات المقدمة والمزايا (Services Section)",
                    portfolio: "معرض الأعمال والمشاريع المميزة (Portfolio Section)",
                    testimonials: "آراء وشهادات العملاء (Testimonials Section)",
                    faq: "الأسئلة الشائعة وإجاباتها السريعة (FAQ Section)",
                    blog: "مدونة إبداع والمقالات الحصرية (Blog Section)",
                    contact: "صندوق ونموذج اتصل بنا المباشر (Contact Section)"
                  };

                  return currentOrder.map((key, idx) => {
                    const isVisible = (localSettings.activeSections as any)[key] !== false;
                    return (
                      <div key={key} className={`p-4 rounded-2xl border transition-all flex items-center justify-between gap-4 ${
                        isVisible
                          ? "bg-slate-50 dark:bg-slate-900 border-slate-100 dark:border-slate-800"
                          : "bg-slate-200/45 dark:bg-slate-900/20 border-slate-200 dark:border-slate-800/50 opacity-60"
                      }`}>
                        <div className="flex items-center gap-4 min-w-0">
                          {/* Ordering Up/Down controls */}
                          <div className="flex flex-col gap-1 shrink-0">
                            <button
                              onClick={async () => {
                                const targetIdx = idx - 1;
                                if (targetIdx < 0) return;
                                const updatedOrder = [...currentOrder];
                                const temp = updatedOrder[idx];
                                updatedOrder[idx] = updatedOrder[targetIdx];
                                updatedOrder[targetIdx] = temp;
                                const nextSettings = { ...localSettings, sectionOrder: updatedOrder };
                                setLocalSettings(nextSettings);
                                await saveGeneralSettings(nextSettings);
                              }}
                              disabled={idx === 0}
                              className="p-1.5 bg-white hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700 disabled:opacity-30 rounded border border-slate-200 dark:border-slate-700 text-slate-500 cursor-pointer"
                              title="نقل للأعلى"
                            >
                              <ChevronUp className="w-4 h-4" />
                            </button>
                            <button
                              onClick={async () => {
                                const targetIdx = idx + 1;
                                if (targetIdx >= currentOrder.length) return;
                                const updatedOrder = [...currentOrder];
                                const temp = updatedOrder[idx];
                                updatedOrder[idx] = updatedOrder[targetIdx];
                                updatedOrder[targetIdx] = temp;
                                const nextSettings = { ...localSettings, sectionOrder: updatedOrder };
                                setLocalSettings(nextSettings);
                                await saveGeneralSettings(nextSettings);
                              }}
                              disabled={idx === currentOrder.length - 1}
                              className="p-1.5 bg-white hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700 disabled:opacity-30 rounded border border-slate-200 dark:border-slate-700 text-slate-500 cursor-pointer"
                              title="نقل للأسفل"
                            >
                              <ChevronDown className="w-4 h-4" />
                            </button>
                          </div>

                          <div className="min-w-0">
                            <span className="text-[10px] font-sans font-bold text-slate-400 bg-slate-200/50 dark:bg-slate-800 px-2 py-0.5 rounded mr-1">
                              الترتيب {idx + 1}
                            </span>
                            <h4 className="font-sans font-bold text-sm text-slate-900 dark:text-white mt-1">
                              {labelsMap[key] || key}
                            </h4>
                          </div>
                        </div>

                        {/* Visibility control toggle */}
                        <div className="flex items-center gap-2 shrink-0">
                          <button
                            onClick={async () => {
                              const nextActive = {
                                ...localSettings.activeSections,
                                [key]: !isVisible
                              };
                              const nextSettings = { ...localSettings, activeSections: nextActive };
                              setLocalSettings(nextSettings);
                              await saveGeneralSettings(nextSettings);
                            }}
                            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                              isVisible
                                ? "bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20"
                                : "bg-slate-300/30 text-slate-500 hover:bg-slate-300/50"
                            }`}
                          >
                            {isVisible ? "نشط ومفعّل" : "مخفي ومعطّل"}
                          </button>
                        </div>
                      </div>
                    );
                  });
                })()}
              </div>
            </div>
          )}

          {/* TAB 9: Inbox & Visitor Messaging logs */}
          {activeTab === "messages" && (
            <div className="bg-white dark:bg-slate-850 border border-slate-100 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-6">
              <h3 className="font-sans font-bold text-slate-900 dark:text-white">بريد رسائل تواصل العملاء</h3>

              <div className="space-y-4">
                {dbMessages.map((msg) => (
                  <div key={msg.id} className={`p-5 rounded-2xl border transition-all ${
                    msg.isRead
                      ? "bg-slate-50 border-slate-100 dark:bg-slate-900/40 dark:border-slate-800/80"
                      : "bg-brand-primary/5 border-brand-primary/10 shadow-sm"
                  }`}>
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-3 mb-3">
                      <div className="space-y-0.5">
                        <h4 className="font-sans font-extrabold text-sm sm:text-base text-slate-900 dark:text-white flex items-center gap-2">
                          {!msg.isRead && <span className="h-2 w-2 rounded-full bg-brand-primary animate-ping" />}
                          <span>{msg.name}</span>
                        </h4>
                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-400 font-sans">
                          <a href={`mailto:${msg.email}`} className="hover:text-brand-primary transition-colors">{msg.email}</a>
                          <span>تم الإرسال بتاريخ: {new Date(msg.date).toLocaleString('ar')}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        {!msg.isRead && (
                          <button
                            onClick={() => handleMarkMessageRead(msg.id)}
                            className="px-3 py-1.5 bg-brand-primary text-white text-xs font-bold rounded-xl"
                          >
                            تحديد كمقروء
                          </button>
                        )}
                        <button
                          onClick={() => handleDeleteMessage(msg.id)}
                          className="p-2 text-slate-400 hover:text-rose-500 bg-white dark:bg-slate-800 border rounded-xl"
                          title="حذف الرسالة"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="text-xs font-bold text-slate-500 dark:text-slate-400 font-sans">موضوع الرسالة: {msg.subject}</div>
                      <div className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 font-sans whitespace-pre-line leading-relaxed bg-white/50 dark:bg-slate-900/20 p-3 rounded-lg border border-slate-50 dark:border-slate-800/40">
                        {msg.message}
                      </div>
                    </div>
                  </div>
                ))}

                {dbMessages.length === 0 && (
                  <div className="text-center py-12 text-slate-400 font-sans text-sm">
                    لا توجد رسائل تواصل حالياً.
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 10: Security, backups and configurations */}
          {activeTab === "backup" && (
            <div className="space-y-6">
              {/* Security and credentials */}
              <div className="bg-white dark:bg-slate-850 border border-slate-100 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-6">
                <h3 className="font-sans font-bold text-slate-900 dark:text-white border-b border-slate-50 dark:border-slate-800 pb-3">الأمان وتعديل بيانات دخول المشرف</h3>
                
                <form onSubmit={handleCredentialsChange} className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-end">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 font-sans">اسم المستخدم الجديد</label>
                    <input
                      type="text"
                      required
                      value={credentialsForm.newUsername}
                      onChange={(e) => setCredentialsForm({ ...credentialsForm, newUsername: e.target.value })}
                      placeholder="اسم المستخدم الجديد"
                      className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 font-sans">كلمة المرور الجديدة (اختياري)</label>
                    <input
                      type="password"
                      value={credentialsForm.newPassword}
                      onChange={(e) => setCredentialsForm({ ...credentialsForm, newPassword: e.target.value })}
                      placeholder="اتركها فارغة إذا كنت لا ترغب في تغييرها"
                      className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm"
                    />
                  </div>

                  <div className="space-y-1.5 sm:col-span-2">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 font-sans">تأكيد كلمة المرور الحالية لحفظ التعديلات *</label>
                    <input
                      type="password"
                      required
                      value={credentialsForm.currentPassword}
                      onChange={(e) => setCredentialsForm({ ...credentialsForm, currentPassword: e.target.value })}
                      placeholder="كلمة المرور الحالية لتأكيد الهوية"
                      className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm"
                    />
                  </div>

                  <div className="sm:col-span-2 flex justify-end">
                    <button
                      type="submit"
                      className="px-5 py-2.5 bg-slate-900 hover:bg-slate-850 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-950 font-bold text-sm rounded-xl cursor-pointer"
                    >
                      تحديث بيانات الدخول
                    </button>
                  </div>
                </form>
              </div>

              {/* Data backups export/import */}
              <div className="bg-white dark:bg-slate-850 border border-slate-100 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-6">
                <h3 className="font-sans font-bold text-slate-900 dark:text-white border-b border-slate-50 dark:border-slate-800 pb-3">تصدير واستيراد قاعدة البيانات (نظام النسخ الاحتياطي)</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Export */}
                  <div className="p-5 bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl flex flex-col justify-between space-y-4">
                    <div>
                      <h4 className="font-sans font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                        <Download className="w-5 h-5 text-brand-primary" />
                        <span>تصدير البيانات (Export Database Backup)</span>
                      </h4>
                      <p className="text-xs text-slate-400 font-sans leading-relaxed mt-1">
                        تستطيع تنزيل قاعدة بيانات موقعك بالكامل (النصوص، الألوان، إعدادات الهوية، الخدمات، المشاريع، التوصيات والرسائل) في ملف JSON واحد للرجوع إليه أو نقله لأي استضافة أخرى لاحقاً.
                      </p>
                    </div>
                    <a
                      href="/api/backup/export"
                      download="portfolio_db_backup.json"
                      className="w-full py-3 bg-brand-primary hover:bg-brand-secondary text-white text-center font-bold text-xs sm:text-sm rounded-xl flex items-center justify-center gap-2 transition-colors"
                    >
                      <Download className="w-4 h-4" />
                      <span>تنزيل ملف النسخة الاحتياطية</span>
                    </a>
                  </div>

                  {/* Import */}
                  <div className="p-5 bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl flex flex-col justify-between space-y-4">
                    <div>
                      <h4 className="font-sans font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                        <Upload className="w-5 h-5 text-amber-500" />
                        <span>استيراد واستعادة البيانات (Import Backup)</span>
                      </h4>
                      <p className="text-xs text-slate-400 font-sans leading-relaxed mt-1">
                        قم برفع ملف النسخة الاحتياطية المصدّر سابقاً (JSON) لتطبيق كافة الإعدادات والبيانات والمشاريع بشكل فوري دون الحاجة لكتابتها مجدداً.
                      </p>
                    </div>
                    <div>
                      <label className="w-full py-3 bg-amber-600 hover:bg-amber-700 text-white text-center font-bold text-xs sm:text-sm rounded-xl flex items-center justify-center gap-2 transition-colors cursor-pointer">
                        <Upload className="w-4 h-4" />
                        <span>اختيار ورفع ملف الاستعادة</span>
                        <input
                          type="file"
                          accept=".json"
                          className="hidden"
                          onChange={handleBackupImport}
                        />
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

        </div>
      </main>

      {/* Custom Confirmation Modal */}
      {confirmDelete && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white dark:bg-slate-850 border border-slate-100 dark:border-slate-800 rounded-3xl p-6 shadow-2xl max-w-sm w-full text-center space-y-4">
            <div className="mx-auto w-12 h-12 bg-rose-100 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 rounded-full flex items-center justify-center animate-pulse">
              <Trash2 className="w-6 h-6" />
            </div>
            <div className="space-y-1.5">
              <h3 className="font-sans font-extrabold text-slate-900 dark:text-white text-base">هل أنت متأكد من الحذف؟</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-sans leading-relaxed">
                أنت على وشك حذف <span className="font-bold text-rose-500">"{confirmDelete.label}"</span> نهائياً. لا يمكن التراجع عن هذا الإجراء بمجرد تأكيده.
              </p>
            </div>
            <div className="flex gap-3 justify-center pt-2">
              <button
                onClick={() => setConfirmDelete(null)}
                className="flex-1 py-2 px-4 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold rounded-xl transition-all"
              >
                إلغاء التراجع
              </button>
              <button
                onClick={async () => {
                  const { id, collection } = confirmDelete;
                  setConfirmDelete(null);
                  setActionFeedback(null);
                  try {
                    const res = await fetch(`/api/${collection}/${id}`, {
                      method: "DELETE",
                      headers: { Authorization: `Bearer ${authToken}` }
                    });
                    if (res.ok) {
                      setActionFeedback({ type: "success", message: "تم حذف العنصر بنجاح." });
                      loadDashboardData();
                      onRefreshAll();
                    } else {
                      setActionFeedback({ type: "error", message: "فشل حذف العنصر." });
                    }
                  } catch (err) {
                    setActionFeedback({ type: "error", message: "خطأ اتصال بالخادم لحذف العنصر" });
                  }
                }}
                className="flex-1 py-2 px-4 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl shadow-md shadow-rose-600/20 transition-all cursor-pointer"
              >
                تأكيد الحذف
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
