"use client";

import type { LucideIcon } from "lucide-react";
import {
  Ruler,
  BarChart3,
  LayoutTemplate,
  Users,
  FileText
} from "lucide-react";

export interface SidebarNavItem {
  title: string;
  href: string;
  icon: LucideIcon;
}

export const navItems: SidebarNavItem[] = [
  {
    title: "개발자 가이드",
    href: "/developer-guide",
    icon: FileText,
  },
  {
    title: "치수 규칙 설정",
    href: "/measurement-rules",
    icon: Ruler,
  },
  {
    title: "템플릿 관리",
    href: "/templates",
    icon: LayoutTemplate,
  },
  {
    title: "차트 유형 관리",
    href: "/chart-types",
    icon: BarChart3,
  },
  {
    title: "사용자 관리",
    href: "/users",
    icon: Users,
  },
];
