# 🌌 Stellarium: Interactive 3D Orrery & NEO Tracker

[![NASA Space Apps
2024](https://img.shields.io/badge/Challenge-NASA%20Space%20Apps-blue?style=for-the-badge&logo=nasa)](https://www.spaceappschallenge.org/)
[![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://reactjs.org/)
[![Three.js](https://img.shields.io/badge/Three.js-000000?style=for-the-badge&logo=three.js&logoColor=white)](https://threejs.org/)
[![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)

**Stellarium** es un planetario digital de alta fidelidad diseñado para
visualizar la compleja dinámica orbital de nuestro Sistema Solar, con un
enfoque especializado en **Objetos Cercanos a la Tierra (NEOs)**.
Desarrollado originalmente para el **NASA Space Apps Challenge 2024**,
este software integra datos astronómicos reales con renderizado
interactivo en 3D.

------------------------------------------------------------------------

## 🔬 Descripción Técnica

A diferencia de los modelos estáticos, Stellarium funciona como un
**propagador orbital**. La aplicación calcula la posición de los cuerpos
celestes basándose en los **Elementos Orbitales Keplerianos**
proporcionados por el Laboratorio de Propulsión a Chorro (JPL) de la
NASA.

### Implementaciones Clave:

-   **Mecánica Orbital:** Algoritmos para convertir parámetros
    Keplerianos de 6 grados de libertad ($e, a, i, \Omega, \omega, M$)
    en coordenadas cartesianas ($x, y, z$).
-   **Gestión de Activos 3D:** Carga optimizada de modelos `.glb` de
    alta resolución para planetas y asteroides específicos como *Bennu*,
    *Eros* e *Itokawa*.
-   **Filtrado de Datos:** Clasificación dinámica de objetos: Asteroides
    Potencialmente Peligrosos (PHAs), Cometas y NEAs.

## 📂 Arquitectura del Proyecto

El proyecto sigue una estructura modular para separar la lógica
matemática del renderizado visual:

``` text
Stellarium/
├── 📁 public/
│   ├── 📁 models/              # Organización por tipo de activo
│   │   ├── 📁 asteroids/       # glb: bennu, eros, itokawa...
│   │   └── 📁 planets/         # glb: Tierra, Marte, Sol...
│   └── 🖼️ favicon.svg
├── 📁 src/
│   ├── 📁 assets/              # Texturas e imágenes estáticas
│   ├── 📁 components/          # Componentes de UI y Layout
│   │   ├── 📁 layout/          # Navbar, Sidebars, HUD de información
│   │   └── 📁 view/            # Canvas principal y Contenedores 3D
│   ├── 📁 data/                # JSONs de efemérides y parámetros Keplerianos
│   ├── 📁 hooks/               # Lógica de React reutilizable
│   ├── 📁 scene/               # El "Core" de Three.js / R3F
│   │   ├── 📁 entities/        # Modelos individuales (Planet.jsx, Asteroid.jsx)
│   │   ├── 📁 mechanics/       # Órbitas y propagadores (OrbitalPropagator.js)
│   │   └── 📄 Stage.jsx        # Configuración de luces, cámaras y entorno
│   ├── 📁 utils/               # Funciones matemáticas (Conversión Kepler -> Cartesiano)
│   ├── 📄 App.jsx              # Punto de entrada de la aplicación
│   └── 📄 main.jsx
├── 📄 .gitignore
├── 📄 package.json
└── 📝 README.md
```

## ☄️ Cuerpos Celestes Incluidos

-   Todos los planetas desde Mercurio hasta Neptuno.
-   Asteroides: Bennu, Eros e Itokawa.
-   Trayectorias orbitales en tiempo real.

## 🛠️ Instalación y Desarrollo

``` bash
git clone https://github.com/ReplacedSpace17/Stellarium.git
cd Stellarium
npm install
npm run dev
```

## 📈 Roadmap

-   Integración con API CNEOS (NASA)
-   Simulación de defensa planetaria
-   Soporte WebXR

## 👨‍💻 Autor

Javier Gutierrez-Ramirez\

## 🤝 Contributing

¡Las contribuciones son lo que hacen que la comunidad científica y tecnológica sea un lugar increíble para aprender e inspirar! Cualquier aportación que hagas será **muy valorada**.

### Pasos para contribuir:

1. **Fork** el proyecto.
2. Crea una **Branch** para tu mejora:  
   `git checkout -b feature/MejoraIncreible`
3. Realiza tus **Changes** (siguiendo las mejores prácticas de código).
4. Haz un **Commit** de tus cambios:  
   `git commit -m 'Add: Se agregó funcionalidad de trayectoria de cometas'`
5. Haz un **Push** a la rama:  
   `git checkout -b feature/MejoraIncreible`
6. Abre un **Pull Request**.

### Áreas de interés para colaborar:
* **Optimización de Efemérides:** Mejora en el cálculo de perturbaciones gravitacionales.
* **UI/UX:** Implementación de un HUD (Heads-Up Display) más inmersivo.
* **Modelado 3D:** Optimización de mallas `.glb` para dispositivos móviles.
* **Data Science:** Scripts para automatizar la actualización de los archivos JSON desde la API de la NASA.

---