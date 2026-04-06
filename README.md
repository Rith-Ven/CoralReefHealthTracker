# Coral Reef Health Tracker 🌊🐠

A full-stack application for monitoring and tracking the health of coral reefs worldwide.

## 📂 Project Structure

- **`/backend`**: FastAPI (Python) API for data management and SQLite storage.
- **`/frontend`**: React (TypeScript) application for visualization and logging.

## 🚀 One-Command Start

To run both the frontend and backend together:

1. **Install Dependencies** (First time only):
   ```bash
   npm run install:all
   ```

2. **Start the Application**:
   ```bash
   npm start
   ```
   *This will start the backend at `http://localhost:8080` and the frontend at `http://localhost:5173`.*

## 🛠️ Manual Start (Alternative)

If you prefer to run them in separate terminals:

**Backend:**
```bash
cd backend
python main.py
```

**Frontend:**
```bash
cd frontend
npm run dev
```

## ✨ Features
- **Reef Management**: Add, view, and delete specific coral reefs.
- **Detailed Observations**: Log temperature, bleaching percentages, and biodiversity scores.
- **Trend Visualization**: Interactive charts showing health trends.
- **Split Detail View**: Dedicated pages for analyzing historical trends and logging new field data.
- **Modern UI**: Clean interface built with the **Outfit** font.

## 📝 Troubleshooting
If the "Create Reef" button hangs:
1. Ensure the backend terminal shows "Uvicorn running on http://0.0.0.0:8080".
2. Check that no other process is using port 8080 (`lsof -i :8080`).
3. Ensure `reef_tracker.db` is not opened in any other software.
