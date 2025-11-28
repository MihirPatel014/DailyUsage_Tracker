# DailyUsage Tracker

A mobile-friendly Progressive Web App (PWA) for tracking daily consumption of routine household items like milk, water jars, ironing services, and more.

## 🎯 Features

- ✅ **Item Management** - Create/Edit/Delete items with custom units & rates
- ✅ **Daily Dashboard** - Quick-add entries for routine items
- ✅ **Entry Logging** - Multiple entries per day with auto-cost calculation
- ✅ **Monthly Cycle** - Manual reset with confirmation (logs preserved)
- ✅ **History View** - Date-grouped logs with item filtering
- ✅ **PWA Support** - Installable, offline-first
- ✅ **Theme Toggle** - Light/Dark/System modes

## 🚀 Run Locally

**Prerequisites:** Node.js

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Set the `GEMINI_API_KEY`** in [.env.local](.env.local) to your Gemini API key (optional)

3. **Run the app:**
   ```bash
   npm run dev
   ```

4. **Build for production:**
   ```bash
   npm run build
   ```

## 🛠️ Tech Stack

- **Frontend:** React 19.2 + TypeScript
- **Routing:** React Router DOM 7.9
- **Database:** IndexedDB via Dexie.js 4.2
- **Build Tool:** Vite 6.2
- **Icons:** Lucide React
- **PWA:** Service Worker + Manifest

## 📱 PWA Features

- **Offline-first**: All data stored locally in IndexedDB
- **Installable**: Can be added to home screen
- **Fast**: Target load time < 2 seconds
- **Mobile-optimized**: Large tap areas, responsive design

## 📚 Documentation

See [prd.md](prd.md) for the complete Product Requirements Document (Phase 1).

## 🔗 Links

- View your app in AI Studio: https://ai.studio/apps/drive/1SZT0cvwnlRlT2GN1pyrlzYVEhiU1Icoi

---

**Phase 1 MVP** - Built with ❤️ for effortless daily usage tracking
