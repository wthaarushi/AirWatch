# AirSense

A lightweight air-quality and mask-safety web app.

Overview:
AirSense is a web application that gives users real-time air quality information and practical safety guidance. The app displays AQI for the user’s location and recommends whether wearing a mask is necessary. It also adjusts its advice based on whether the user plans to exercise outdoors.

Built for HackMars 2025.

Features:
- Real-time AQI data retrieval
- Mask recommendations based on AQI
- Exercise-based safety adjustments
- Simple and responsive UI
- Frontend implemented in HTML, CSS, and JavaScript
- Backend (planned) using Python
- Tech Stack
- Frontend: HTML, CSS, JavaScript
- Backend (planned): Python (FastAPI)

APIs: Air quality API (e.g., AirVisual or equivalent)

Folder Structure
project-root  
│── index.html  
│── style.css  
│── script.js  
│── assets/  
│── backend/ (planned)  
│── README.md  

Setup:
Clone the repository:
git clone https://github.com/YOUR-USERNAME/REPO-NAME.git
cd REPO-NAME
Open index.html in your browser.
Backend setup will be added later.

How It Works:
The frontend requests AQI data from the API, processes it using the mask and exercise logic, and updates the interface accordingly. When the backend is added, it will handle API calls, caching, and user-related features.

Team:
Aditya Singh, Aarushi

MIT License
