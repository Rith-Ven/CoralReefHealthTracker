# Coral Reef Health Tracker (CRHT)

A professional, full-stack analytical platform designed for marine researchers and conservationists to monitor, document, and analyze coral reef health indicators globally.

## 📌 Project Overview

The Coral Reef Health Tracker provides a centralized interface for environmental data collection and longitudinal health analysis. By leveraging real-time data visualization, the platform enables users to identify critical correlations between water temperature and coral bleaching events, facilitating informed conservation strategies.

## ✨ Key Features

- **Unified Monitoring Dashboard**: A single-page interface for managing multiple reef locations, viewing historical data, and logging new observations.
- **Advanced Data Visualization**: Interactive time-series analysis comparing water temperature gradients against coral bleaching percentages.
- **Field Observation Logging**: Standardized data entry for temperature, bleaching levels, and biodiversity indices.
- **Optimized User Experience**: Employs the 'Outfit' typeface for high legibility and a specialized maritime-themed UI.
- **Dynamic Reef Management**: Seamless creation and deletion of reef profiles with instant state synchronization.

## 🚀 Technical Architecture

- **Frontend**: React 19 (TypeScript), Vite, Recharts, React Router 7.
- **Backend**: FastAPI (Python), SQLAlchemy ORM, Pydantic.
- **Persistence**: SQLite (Relational Database).
- **Typography**: Outfit (Google Fonts).

## 🛠️ Installation & Deployment

### Prerequisites
- Python 3.10 or higher
- Node.js 18.x or higher
- npm or yarn

### Backend Setup
1. Navigate to the project root directory.
2. Install the required Python dependencies:
   ```bash
   pip install fastapi uvicorn sqlalchemy pydantic
   ```
3. Initialize the database and start the API server:
   ```bash
   python3 main.py
   ```
   *The backend will be accessible at `http://localhost:8081`.*

### Frontend Setup
1. Navigate to the `/frontend` directory:
   ```bash
   cd frontend
   ```
2. Install the Node.js dependencies:
   ```bash
   npm install
   ```
3. Execute the development server:
   ```bash
   npm run dev
   ```
   *The application will be accessible at `http://localhost:5173`.*

## 📂 System Structure

- `/` : Root directory containing the FastAPI backend service and SQLite database.
- `/frontend` : React application source code, including components, assets, and API service layers.

## 🔧 Troubleshooting

- **Port Conflicts**: The backend is configured to run on port **8081** to prevent interference with standard system services.
- **Database Access**: Ensure the `reef_tracker.db` file is not locked by external database management software during runtime.
- **API Connectivity**: Verify that both the backend and frontend servers are active simultaneously to ensure proper data synchronization.

## 📝 License
This project is distributed under the MIT License for educational and environmental conservation efforts.
