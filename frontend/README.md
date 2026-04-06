# Coral Reef Health Tracker - Frontend

This is the React-based frontend for the Coral Reef Health Tracker.

## 🛠 Features
- **Reef Dashboard**: Overview of all monitored reefs.
- **Split Detail View**: Dedicated tabs for **Trends** (charts and history) and **Logging** (form entry).
- **Interactive Charts**: Powered by `recharts` to visualize the relationship between water temperature and coral bleaching.
- **Responsive Navigation**: Seamless transitions between reefs and views.

## 🏗 Setup
1. Install dependencies:
   ```bash
   npm install
   ```
2. Start development server:
   ```bash
   npm run dev
   ```

## 🎨 Styling
The project uses **Vanilla CSS** with CSS Variables for consistent branding. The primary typeface is **Outfit**, a modern geometric sans-serif.

## 🔗 API Connection
The frontend connects to the FastAPI backend at `http://localhost:8080`. This can be configured in `src/api.ts`.
