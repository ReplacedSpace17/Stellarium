# 🌌 Stellarium - Interactive Digital Orrery

**Stellarium** is a virtual, interactive model of our solar system developed as part of the **2024 NASA Space Apps Challenge**. This project aims to educate the public about celestial mechanics by visualizing not only planets but also **Near-Earth Objects (NEOs)**, including asteroids and comets that pass close to our planet.

[Insert Screenshot or Demo GIF here]

## 🚀 Overview
Since 1713, orreries have helped humanity understand the movement of the heavens. This modern web-based version uses 3D graphics and NASA's open data to provide a dynamic experience of our cosmic neighborhood.

### Key Features
* **Real-Time Visualization:** Interactive 3D environment showing the orbits of planets and NEOs.
* **Data-Driven:** Utilizes Keplerian parameters (eccentricity, semi-major axis, inclination, etc.) to accurately map orbital trajectories.
* **NEO Tracking:** Displays Near-Earth Asteroids (NEA), Near-Earth Comets (NEC), and Potentially Hazardous Asteroids (PHA).
* **Interactive UI:** Toggle labels, zoom in/out, and explore the solar system from different perspectives.

## 🛠️ Tech Stack
* **Framework:** [React](https://reactjs.org/) + [Vite](https://vitejs.dev/) (Fast Refresh & Optimized Bundling).
* **3D Rendering:** [Three.js](https://threejs.org/) / [React Three Fiber](https://docs.pmnd.rs/react-three-fiber/getting-started/introduction).
* **Data Sources:** NASA Small-Body Database (SBDB) and Horizons System.
* **Deployment:** Vercel.

## 📐 The Science Behind It
The app calculates celestial positions using **Keplerian elements**. To map an orbit, the model processes:
1.  **Eccentricity ($e$):** Shape of the orbit.
2.  **Semi-major axis ($a$):** Size of the orbit.
3.  **Inclination ($i$):** Tilt of the orbit.
4.  **Longitude of the Ascending Node ($\Omega$):** Orientation.
5.  **Argument of Periapsis ($\omega$):** Direction of the closest point to the Sun.



## 🔧 Installation & Setup

1.  **Clone the repo:**
    ```bash
    git clone [https://github.com/ReplacedSpace17/Stellarium.git](https://github.com/ReplacedSpace17/Stellarium.git)
    ```
2.  **Install dependencies:**
    ```bash
    npm install
    ```
3.  **Run development server:**
    ```bash
    npm run dev
    ```

## 🏆 NASA Space Apps Challenge
This project was developed for the **"Create an Orrery Web App"** challenge. It focuses on the importance of monitoring NEOs to ensure planetary defense and further space exploration.

## 👤 Author
**Javier Gutierrez-Ramirez**
* Computer Systems Engineer & MSc in Computer Science Student.
* Founder of [Singularity Club](https://github.com/Singularity-Club).
* Passionate about AI, Bioinformatics, and Open Science.

---
*Disclaimer: Data provided by NASA APIs. This project is for educational purposes.*
