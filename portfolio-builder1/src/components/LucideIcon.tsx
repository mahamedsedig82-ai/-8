/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import * as Icons from "lucide-react";

interface LucideIconProps {
  name: string;
  className?: string;
  size?: number;
}

export default function LucideIcon({ name, className = "", size = 24 }: LucideIconProps) {
  // Safe dynamic lookup with fallback to Sparkles
  const IconComponent = (Icons as any)[name] || Icons.Sparkles;
  return <IconComponent className={className} size={size} />;
}

// Available icons to choose from in the admin dashboard dropdown
export const AVAILABLE_ICONS = [
  "Globe",
  "Palette",
  "Briefcase",
  "TrendingUp",
  "Smartphone",
  "Search",
  "Award",
  "ShieldCheck",
  "Code",
  "PenTool",
  "CheckCircle",
  "MessageSquare",
  "Settings",
  "Users",
  "Layers",
  "Sparkles",
  "BookOpen",
  "Zap",
  "Star",
  "Heart",
  "Lightbulb",
  "MapPin",
  "Phone",
  "Mail"
];
