# VedaAI — AI-Powered Assessment Intelligence Platform

> Transform handwritten student assessments and question papers into structured, mapped, and visually highlighted insights.

[![Live Vercel Deployment](https://img.shields.io/badge/Live%20Demo-Vercel-black?style=for-the-badge&logo=vercel)](https://vedaai-three-zeta.vercel.app)
[![AI Engine](https://img.shields.io/badge/AI-Gemini%203.6%20Flash-4F46E5?style=for-the-badge&logo=google)](https://ai.google.dev/)
[![Framework](https://img.shields.io/badge/Next.js-16%20(App%20Router)-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![Styling](https://img.shields.io/badge/Tailwind%20CSS-v4-38BDF8?style=for-the-badge&logo=tailwindcss)](https://tailwindcss.com/)

---

## 🌐 Live Production Application
👉 **[https://vedaai-three-zeta.vercel.app](https://vedaai-three-zeta.vercel.app)**

---

## 📖 Overview

**VedaAI** is a production-grade AI assessment intelligence platform engineered for modern educators. It bridges the gap between physical examination papers and digital assessment workflows. By uploading any printed/digital question paper and handwritten student answer sheet, VedaAI:

1. **Extracts Every Question & Subpart** — Dynamically parses main questions (`Q1`, `Q2`, `Q4`) and split subparts (`3(a)`, `3(b)`, `1(a)`, `1(b)`) with allocated marks.
2. **Reads Handwritten Student Responses** — Identifies student handwriting, answer numbering, and bounding coordinates across multiple pages.
3. **Maps Answers to Questions** — Accurately matches answers even when written **out of order** (e.g., student answers `Q4` before `Q2`).
4. **Highlights Exact Answer Regions** — Visual green bounding box highlights hug the exact answer block on the interactive answer sheet viewer.
5. **Evaluates & Scores** — Awards marks with AI feedback explaining student performance.
6. **Handles Edge Cases** — Flags unattempted questions (`0/X`), unmatched extra answers, multi-page answers spanning multiple sheets, and varied handwriting styles.

---

## 📱 Full Responsiveness & Device Support

The platform is designed to provide an optimal experience across all device screen sizes:
- **Desktop & Laptop**: Dual-panel workspace with synchronous question sidebar and interactive answer sheet viewer with zoom controls.
- **Tablet**: Adaptive grid layout with responsive column widths.
- **Mobile**: Clean stacked layout with slide-out navigation drawer (accessible via hamburger menu ☰) and tab switcher between *Questions* and *Answer Sheet*. Tapping any question automatically navigates to and highlights the target region on the answer sheet.

---

## ⚡ Architecture & Pipeline

```
                       Upload Files (PDF / Images)
                                   │
                     Client-Side PDF Text & Canvas Extraction
                     (pdfjs-dist with Y-coordinate line grouping)
                                   │
              ┌────────────────────┴────────────────────┐
              ▼                                         ▼
   /api/extract-questions                     /api/extract-answers
  • Gemini 3.6 Flash Vision                 • Gemini 3.6 Flash Multimodal
  • Dynamic Structure Parser                • Dynamic Bounding Box Engine
  • Subpart Splitting (3a, 3b)              • Multi-Page Continuation
              │                                         │
              └────────────────────┬────────────────────┘
                                   ▼
                           /api/map-answers
                    • Primary: Number & subpart match
                    • Out-of-order resolution
                    • Scoring & AI Feedback generation
                                   │
                                   ▼
                        Interactive Results View
                    • Question Accordions & Score Badges
                    • Precision Bounding Box Highlights
                    • Multi-Page Sheet Navigation & Zoom
```

---

## 🛠️ Tech Stack

| Layer | Technology | Purpose |
|---|---|---|
| **Frontend** | React 19, Next.js 16 (App Router) | Core application and rendering engine |
| **Language** | JavaScript (ES6+ / JSX) | Full frontend and backend route handlers |
| **Styling** | Tailwind CSS v4, Lucide Icons | Responsive UI and design system |
| **Animations** | Framer Motion | Smooth transitions and interactions |
| **AI Engine** | Google Gemini 3.6 Flash | Multimodal vision, OCR & reasoning |
| **PDF Processing** | pdfjs-dist | In-browser canvas rendering & text extraction |
| **Validation** | Zod | Schema validation and type safety |
| **Toasts** | Sonner | Real-time user feedback and alerts |

---

## 🚀 Local Development Setup

### 1. Clone the repository
```bash
git clone https://github.com/Khushii0212/VedaAI.git
cd VedaAI
```

### 2. Install dependencies
```bash
npm install
```

### 3. Configure environment variables
Create a `.env.local` file in the root directory:
```env
GEMINI_API_KEY=your_google_ai_studio_api_key_here
GEMINI_MODEL=gemini-3.6-flash
```
*(Note: `.env.local` is strictly git-ignored to prevent exposing API keys).*

### 4. Run the development server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🔒 Security & Privacy

- **API Keys**: All credentials (`GEMINI_API_KEY`) are stored in server-side environment variables and are never exposed in client bundles or committed to Git.
- **Client-Side Rendering**: File rendering occurs directly in the user's browser using HTML5 Canvas and `pdfjs-dist`.
- **Zero Data Retention**: Document files are processed in-memory for the duration of the assessment session without persistent cloud storage of student identity records.

---

## 📄 License
MIT License. Built for the VedaAI AI Assessment Platform Challenge.
