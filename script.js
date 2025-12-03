// ===== CONFIG =====
const WAQI_TOKEN = "API Key goes here";
const OPENWEATHER_KEY = "API Key goes here";

// ===== APP STATE =====
const appState = {
    currentUser: null,
    currentCity: "San Francisco, CA",
    currentCoords: { lat: 37.7749, lon: -122.4194 },
};

// =======================================
// 1. GEOLOCATION → LAT/LON
// =======================================
async function geocodeLocation(location) {
    const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(location)}&count=1`;

    try {
        const res = await fetch(url);
        const data = await res.json();

        if (!data.results || data.results.length === 0) {
            return { error: "Location not found." };
        }

        const loc = data.results[0];
        return {
            lat: loc.latitude,
            lon: loc.longitude,
            name: `${loc.name}, ${loc.admin1 || ""}`.trim(),
        };

    } catch (err) {
        return { error: "Geocoding failed." };
    }
}

// =======================================
// 2. WAQI → REAL AQI
// =======================================
async function getAQIFromWAQI(lat, lon) {
    const url = `https://api.waqi.info/feed/geo:${lat};${lon}/?token=${WAQI_TOKEN}`;

    try {
        const res = await fetch(url);
        const data = await res.json();

        if (data.status !== "ok") return { error: "No AQI data." };

        return {
            aqi: data.data.aqi,
            pm25: data.data.iaqi.pm25?.v ?? null,
            pm10: data.data.iaqi.pm10?.v ?? null,
            o3:   data.data.iaqi.o3?.v ?? null,
            no2:  data.data.iaqi.no2?.v ?? null,
            so2:  data.data.iaqi.so2?.v ?? null,
            co:   data.data.iaqi.co?.v ?? null
        };

    } catch (err) {
        console.error("WAQI error:", err);
        return { error: "AQI fetch failed." };
    }
}

// =======================================
// 3. Health + Exercise Recommendations
// =======================================
function updateHealthRecommendations(aqi) {
    const maskBox = document.getElementById("mask-recommendation");
    const exerciseBox = document.getElementById("exercise-safe");

    if (aqi <= 50) {
        maskBox.innerText = "Not Required";
        exerciseBox.innerText = "Safe";
    } else if (aqi <= 100) {
        maskBox.innerText = "Optional";
        exerciseBox.innerText = "Moderate";
    } else if (aqi <= 150) {
        maskBox.innerText = "Recommended for Sensitive Groups";
        exerciseBox.innerText = "Limit Outdoor Activity";
    } else if (aqi <= 200) {
        maskBox.innerText = "Recommended";
        exerciseBox.innerText = "Avoid Outdoor Exercise";
    } else {
        maskBox.innerText = "Required";
        exerciseBox.innerText = "Indoor Only";
    }
}

// =======================================
// 4. UPDATE HOME TAB WITH REAL DATA
// =======================================
function getAQIColor(aqi) {
    if (aqi <= 50) return "var(--aqi-good)";
    if (aqi <= 100) return "var(--aqi-moderate)";
    if (aqi <= 150) return "var(--aqi-unhealthy-sensitive)";
    if (aqi <= 200) return "var(--aqi-unhealthy)";
    if (aqi <= 300) return "var(--aqi-very-unhealthy)";
    return "var(--aqi-hazardous)";
}

function getAQILabel(aqi) {
    if (aqi <= 50) return "Good";
    if (aqi <= 100) return "Moderate";
    if (aqi <= 150) return "Unhealthy for Sensitive Groups";
    if (aqi <= 200) return "Unhealthy";
    if (aqi <= 300) return "Very Unhealthy";
    return "Hazardous";
}

function updateHomeUI(data, cityName) {
    document.getElementById("current-location").innerText = cityName;

    document.getElementById("aqi-hero").style.backgroundColor = getAQIColor(data.aqi);
    document.getElementById("aqi-number").innerText = data.aqi;
    document.getElementById("aqi-label").innerText = getAQILabel(data.aqi);

    document.getElementById("health-advisory").innerText =
        "Updated real AQI from WAQI";

    // 🎭 --- MASK + EXERCISE LOGIC ---
    const maskBox = document.getElementById("mask-recommendation");
    const exerciseBox = document.getElementById("exercise-safe");

    if (data.aqi <= 50) {
        maskBox.innerText = "Not Required";
        exerciseBox.innerText = "Safe";
    } else if (data.aqi <= 100) {
        maskBox.innerText = "Optional";
        exerciseBox.innerText = "Moderate";
    } else if (data.aqi <= 150) {
        maskBox.innerText = "Recommended for Sensitive Groups";
        exerciseBox.innerText = "Limit Outdoor Activity";
    } else if (data.aqi <= 200) {
        maskBox.innerText = "Recommended";
        exerciseBox.innerText = "Avoid Outdoor Exercise";
    } else {
        maskBox.innerText = "Required";
        exerciseBox.innerText = "Indoor Only";
    }

    // 🎯 --- POLLUTANTS GRID ---
    const grid = document.getElementById("pollutants-grid");
    grid.innerHTML = "";

    const pollutants = [
        { label: "PM2.5", value: data.pm25 },
        { label: "PM10", value: data.pm10 },
        { label: "CO", value: data.co },
        { label: "NO₂", value: data.no2 },
        { label: "SO₂", value: data.so2 },
        { label: "O₃", value: data.o3 },
    ];

    pollutants.forEach(p => {
        if (p.value === null) return;
        const card = document.createElement("div");
        card.className = "pollutant-card";
        card.innerHTML = `
            <div class="pollutant-name">${p.label}</div>
            <div class="pollutant-value">${p.value}</div>
        `;
        grid.appendChild(card);
    });
}

// =======================================
// 5. HANDLE LOCATION UPDATE
// =======================================
async function updateLocationFromSearch() {
    const input = document.getElementById("locationSearchInput");
    const query = input.value.trim();

    if (!query) return alert("Enter a city name.");

    // Step 1: Convert city → lat/lon
    const geo = await geocodeLocation(query);
    if (geo.error) return alert(geo.error);

    // Save state
    appState.currentCity = geo.name;
    appState.currentCoords = { lat: geo.lat, lon: geo.lon };

    // Step 2: Fetch AQI
    const aqiData = await getAQIFromWAQI(geo.lat, geo.lon);
    if (aqiData.error) return alert(aqiData.error);

    // Step 3: Update UI
    updateHomeUI(aqiData, geo.name);

    alert("Location updated!");
}

// =======================================
// 6. WIRE UP BUTTON (THIS WAS MISSING)
// =======================================
document.addEventListener("DOMContentLoaded", () => {
    const btn = document.getElementById("locationSearchBtn");
    if (btn) {
        btn.addEventListener("click", updateLocationFromSearch);
    }
});

// =======================================
// 7. LOGIN + TAB SYSTEM (UNCHANGED)
// =======================================
function switchTab(tabName) {
    document.querySelectorAll(".tab-content").forEach(t => {
        t.style.display = "none";
    });

    document.getElementById(`${tabName}-tab`).style.display = "block";

    document.querySelectorAll(".nav-item").forEach(item => {
        item.classList.remove("active");
    });

    document.querySelector(`[data-tab="${tabName}"]`).classList.add("active");
}

function handleLogin() {
    appState.currentUser = "user";
    switchTab("home");
}

function handleLogout() {
    switchTab("login");
}

switchTab("login");
