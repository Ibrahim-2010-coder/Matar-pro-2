# Matar Pro (مَطَر برو) 🌧️

An all-in-one climate intelligence platform featuring hourly forecasts, a Windy-styled interactive radar map, a smart advisory for agriculture & road safety, and 7-month seasonal outlooks. Built entirely within a single-file architecture with full PWA offline capabilities.

🚀 **Live Demo:** [https://github.io](https://github.io)

---

## 🧑‍💻 Behind the Code: Meet the Developer
This platform was designed, engineered, and built from scratch by **Ibrahim Ahmed Z. Nada**. 
* 🇪🇬 **Origin:** Egypt
* 🎂 **Age:** 16 Years Old
* 🏫 **Current Academic Status:** High School Student in the Egyptian **Thanaweya Amma (ثانوية عامة)** system.

*Building a highly complex, single-file geospatially reactive web application while navigating the intensive Egyptian high school curriculum was an incredible challenge, but 'Matar Pro' stands as proof of what independent student developers can achieve!*

---

## 🔥 Key Architectural Marvel: Single-File Build
Unlike traditional web apps broken down into dozens of components, massive node modules, build pipelines, and server-side configurations, **Matar Pro runs entirely inside a single standalone HTML file**. 
* **Zero Build Steps:** No Webpack, Vite, npm, or installation scripts required.
* **Zero Costly API Keys:** Completely leverages open-source data streams client-side.
* **Ultimate Portability:** The entire application can be saved locally as a single document and run directly off-the-grid.

---

## 💡 Complete Feature Breakdown

### 🗺️ Interactive Windy-Style Map (The Grand Canvas)
* **Sleek Interface:** Rendered over a dark-oil styled canvas using Leaflet maps.
* **25+ Live Environmental Layers:** Access radar feeds, infrared satellites, real-time wind particle streams on all altitudes, total rainfall accumulations, snow updates, wet-bulb temperatures, cloud heights, sea wave swells, ocean currents, and air quality pollutants (PM2.5, Dust, $NO_2$, Ozone).
* **Radar Customization:** 8 distinct atmospheric styling color palettes (including Dark Sky, NEXRAD Level III, Meteored, and The Weather Channel styles) with custom layer transparency controls.
* **Time Machine Playback (Nowcasting):** Animated time-loop controls tracking real-time rainfall projections minute-by-minute synced directly with planetary wind shifts.

### 🚜 Smart Agrometeorology Tracker (Precision Farming)
* **Soil Telemetry Matrix:** Tracks active ground temperature and soil moisture levels across 4 distinct depth segments simultaneously (Surface 0cm, 6cm, 18cm, and 54cm).
* **48-Hour Irrigation Balancing Calculator:** Automatically cross-references incoming rainfall aggregates (in mm) against local reference evapotranspiration rates ($ET_0$) to yield an instant, color-coded watering decision.
* **Automated Agro-Advisor:** Generates human-like agronomic insights concerning localized frost warnings, dangerous wind thresholds, UV exposure ceilings, and plant hydration statuses.
* **7-Day Agriculture Schedule:** A comprehensive tabular chart visualizing daily farming risk indices, temperature spans, and weather patterns.

### 🚗 Route Planning & Transit Safety Analytics
* **Global Route Profiling:** Input any start and end point globally to automatically chart your active highway coordinates via the Open Source Routing Machine (OSRM).
* **Chronological Forecast Syncing:** Intelligently maps weather forecasts across your route to match the precise time you will cross each driving checkpoint (Departure, Mid-point, and Destination).
* **Smart Driving Assistant:** Scans ahead to display conversational voice prompts warning you about low visibility fog, sudden crosswinds, hydroplaning hazards, or severe dust storms.
* **Safety Hub Mapping:** Automatically reveals medical facilities, hospitals, fuel docks, and safe resting stops along your active route when an extreme weather warning triggers.

### 📊 Long-Range Seasonal Outlooks & Historical Climate Registry
* **7-Month Extended View:** Employs advanced Copernicus SEAS5 models to chart ambient temperature anomalies and rainfall tendencies across the next 7 months.
* **20-Year Climate Matrix:** Compares today's live temperature metrics directly with local climate baselines aggregated across the last two decades.
* **30-Day Daily Projections:** Delivers traditional month-ahead calendar matrix tracking global historical patterns.

### 🏃‍♂️ "Your Day Today" (Custom Activity Dashboards)
* **Athletic Performance Efficiency:** Computes real-time thermal stress and humidity metrics to give outdoor runners, cyclists, and fitness enthusiasts a 1-100 time efficiency score.
* **Aviation & Drone Flight Clearances:** Maps crosswind vectors at key atmospheric aviation pressure points (from ground up to 300 hPa / Flight Level 9000m) with instantaneous go/no-go indicators for drone operators.
* **Marine Safety & Angling Projections:** Monitors wave heights, wave periods, and barometric pressure trends to predict fish activity levels and declare swimming safety.
* **Health & Allergen Monitor:** Offers medical guidance alerts regarding high pollen, air pollution indices, migraine triggers, and abrupt weather transitions.

### 🔋 Eco-Toggle & System Resource Preserver
* Fully purges canvas animation nodes, heavy Leaflet instances, and reactive scripting from phone memory with a single click.
* Dynamically swaps graphic displays for high-contrast, text-only typography to conserve battery power and preserve roaming data packages for rural farmers or off-grid travelers.

### 📱 PWA Infrastructure & Offline-First Persistence
* Fully compliant Progressive Web App structure, allowing native installation onto Android and iOS home screens.
* **Integrated Push Alerts:** Native device alerting protocols notifying users of unexpected frost, severe thunderstorms, extreme winds, or sudden blinding fog.
* **Persistent Offline Mode:** When your mobile internet connection drops, the system unrolls a persistent offline layout containing the last successfully pulled weather report alongside a striking orange countdown clock documenting the data's exact age.

---

## 🛠️ Technical Stack
* **Core Languages:** Vanilla JavaScript (ES6+), CSS3, Semantic HTML5.
* **Mapping Framework:** Leaflet.js (Leaflet Routing Machine & Canvas particle layers).
* **Meteorological Raw Feeds:** Open-Meteo API.
* **Radar Processing Arrays:** RainViewer API.
* **Global Highway Routing:** OSRM (Open Source Routing Machine).

---

## ⚖️ License
Distributed under the **GNU General Public License v3.0 (GPL-3.0)**. See the `LICENSE` file for details.

---
*Developed with 💻 and ☕ by Ibrahim Ahmed Z. Nada (2026)*
