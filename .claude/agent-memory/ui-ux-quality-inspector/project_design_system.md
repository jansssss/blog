---
name: Blog Project Design System
description: Design conventions, spacing, color, and layout patterns used across the blog project
type: project
---

This blog is a Next.js project using Tailwind CSS.

**Layout**
- Global max width: `max-w-5xl` — enforced across all pages (calculator, list, view)
- Container padding: `px-4`
- Page vertical padding: `py-12`

**Color palette (Tailwind)**
- Primary accent: blue-50 / blue-100 / blue-200 / blue-600 — used for icons, badges, hover states
- Surface: white with `border-gray-100` (thin, subtle borders)
- Body text: gray-900 (headings), gray-500 (subtext), gray-400 (captions/disclaimers)
- Hero background: `bg-gradient-to-b from-blue-50/60 to-white`

**Hero section pattern**
- Rounded card: `rounded-3xl bg-gradient-to-b from-blue-50/60 to-white border border-blue-100/60 px-8 py-12 text-center`
- Pill badge: `inline-block px-3 py-1 text-xs font-medium text-blue-600 bg-blue-100 rounded-full`
- h1: `text-3xl md:text-4xl font-bold text-gray-900 tracking-tight`
- Subtext: `text-gray-500 text-base max-w-md mx-auto`

**Card pattern (index/grid pages)**
- Grid: `grid grid-cols-2 lg:grid-cols-4 gap-4`
- Card: `p-5 bg-white border border-gray-100 rounded-2xl hover:border-blue-200 hover:shadow-lg hover:shadow-blue-50 transition-all group`
- Icon box: `w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600` with icon `w-5 h-5`
- Card title: `font-semibold text-sm text-gray-900 leading-snug`
- Card description: `text-xs text-gray-400 hidden sm:block leading-relaxed`

**Disclaimer line**
- `text-xs text-gray-400 text-center mt-8`

**Anti-patterns to avoid**
- Cluttered bottom sections (금융 상식, 체크리스트, 관련 링크 blocks) — removed in calculator redesign
- Oversized hero icons in circle containers — replaced with gradient card hero
- `max-w-6xl` — standardized to `max-w-5xl`
