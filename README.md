# 🌌 Digit88 Prompt Library

A high-performance, secure, and beautifully crafted internal platform for managing and sharing AI prompts. Built with **Next.js 14**, **Supabase**, and **Tailwind CSS**.

![Digit88 Prompt Library Banner](https://raw.githubusercontent.com/charud88/Prompt-Library-Internal/main/public/banner.png) *(Note: Replace with actual hosted banner URL)*

---

## ✨ Features

- **🎯 Curated Prompt Engine**: 45+ professional prompts across Engineering, QA, Sales, and Marketing.
- **🛡️ Enterprise Security**: 
  - OAuth2 Authentication (restricted to `@digit88.com`).
  - Strict **Concurrent Session Control** via Postgres triggers.
  - Hardened Row Level Security (RLS) for data sovereignty.
- **⚡ Performance First**: In-memory caching with **TanStack Query** and instant UI feedback.
- **🎨 Premium UX**: Modern glassmorphism design with a dark-mode first terminal aesthetic.
- **🏢 Leaver Strategy**: Intelligent data ownership logic ensuring corporate knowledge remains internal even if contributors leave.
- **🛠️ Admin Command Center**: Comprehensive moderation tools and real-time audit logs.

---

## 🚀 Tech Stack

- **Framework**: [Next.js 15 (App Router)](https://nextjs.org/)
- **Database & Auth**: [Supabase](https://supabase.com/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **State Management**: [TanStack Query v5](https://tanstack.com/query/latest)
- **Animations**: [Framer Motion](https://www.framer.com/motion/)
- **Icons**: [Lucide React](https://lucide.dev/)

---

## 🛠️ Installation & Setup

### 1. Clone the repository
```bash
git clone https://github.com/charud88/Prompt-Library-Internal.git
cd Prompt-Library-Internal/frontend
```

### 2. Install dependencies
```bash
npm install
```

### 3. Environment Variables
Create a `.env.local` file in the `frontend` directory:
```env
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

### 4. Database Setup
Run the migrations located in the `/database/migrations` directory in your Supabase SQL Editor in order:
1. `001_initial_schema.sql`
2. ...
3. `008_single_session.sql`

### 5. Run the development server
```bash
npm run dev
```

---

## 🛡️ Security & Hardening

This project implements several advanced security layers:
- **Pagination Capping**: Prevents DoS attacks by limiting large data fetches.
- **Open Redirect Validation**: Prevents phishing via OAuth callback parameters.
- **Postgres Session Triggers**: Automatically invalidates older sessions upon new device login.

---

## 🤝 Contributing

1. Create a Feature Branch (`git checkout -b feature/AmazingFeature`)
2. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
3. Push to the Branch (`git push origin feature/AmazingFeature`)
4. Open a Pull Request

---

## 📄 License

Internal Project of **Digit88**. All rights reserved.

---

<div align="center">
  <sub>Built with ❤️ by the Digit88 Engineering Team</sub>
</div>
