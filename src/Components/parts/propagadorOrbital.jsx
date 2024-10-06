import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

import planetsData from './data/planets.json';

// Función para resolver la ecuación de Kepler (iteración de Newton-Raphson)
const solveKepler = (M, e, tolerance = 1e-6) => {
  let E = M;
  let delta = 1;
  while (Math.abs(delta) > tolerance) {
    delta = E - e * Math.sin(E) - M;
    E = E - delta / (1 - e * Math.cos(E));
  }
  return E;
};

const generateOrbitPoints = (a, e, steps = 360) => {
  const points = [];
  for (let i = 0; i < steps; i++) {
    const M = (i / steps) * 2 * Math.PI; // Anomalía media
    const E = solveKepler(M, e); // Resolver la anomalía excéntrica
    const ν = 2 * Math.atan2(
      Math.sqrt(1 + e) * Math.sin(E / 2),
      Math.sqrt(1 - e) * Math.cos(E / 2)
    ); // Anomalía verdadera
    const r = a * (1 - e ** 2) / (1 + e * Math.cos(ν)); // Distancia radial

    // Coordenadas en el plano XZ (suponiendo inclinación cero para simplicidad)
    const x = r * Math.cos(ν);
    const z = r * Math.sin(ν);
    points.push(new THREE.Vector3(x, 0, z));
  }
  return points;
};

const createStarField = (scene) => {
  const starGeometry = new THREE.BufferGeometry();
  const starMaterial = new THREE.PointsMaterial({
    color: 0xffffff,
    size: 0.5, // Tamaño de las estrellas
    opacity: 0.7,
    transparent: true,
  });

  const starVertices = [];
  for (let i = 0; i < 1000; i++) {
    const x = (Math.random() - 0.5) * 1000;
    const y = (Math.random() - 0.5) * 1000;
    const z = (Math.random() - 0.5) * 1000;
    starVertices.push(x, y, z);
  }

  starGeometry.setAttribute(
    'position',
    new THREE.Float32BufferAttribute(starVertices, 3)
  );

  const stars = new THREE.Points(starGeometry, starMaterial);
  scene.add(stars);
};

const SolarSystem = () => {
  const mountRef = useRef(null);
  const [paused, setPaused] = useState(false);
  const [speed, setSpeed] = useState(0.001); // Velocidad inicial de la animación
  const controlsRef = useRef(null);

  useEffect(() => {
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    const renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);
    mountRef.current.appendChild(renderer.domElement);

    // Luz del sol
    const light = new THREE.PointLight(0xffffff, 1.5, 500);
    light.position.set(0, 0, 0);
    scene.add(light);

    // Crear sol
    const sunGeometry = new THREE.SphereGeometry(5, 32, 32);
    const sunMaterial = new THREE.MeshBasicMaterial({ color: 0xffff00 });
    const sun = new THREE.Mesh(sunGeometry, sunMaterial);
    scene.add(sun);

    // Crear planetas y sus órbitas
    const planets = [];
    planetsData.forEach((planet) => {
      const geometry = new THREE.SphereGeometry(planet.radius, 32, 32);
      const material = new THREE.MeshBasicMaterial({ color: planet.color });
      const planetMesh = new THREE.Mesh(geometry, material);
      planetMesh.name = planet.name;
      planets.push({ mesh: planetMesh, ...planet });
      scene.add(planetMesh);

      // Crear órbitas (color más tenue)
      const orbitPoints = generateOrbitPoints(planet.a * 20, planet.e);
      const orbitGeometry = new THREE.BufferGeometry().setFromPoints(orbitPoints);
      const orbitMaterial = new THREE.LineBasicMaterial({
        color: 0xffffff,
        opacity: 0.3,
        transparent: true,
      });
      const orbitLine = new THREE.Line(orbitGeometry, orbitMaterial);
      scene.add(orbitLine);

      // Crear propagador orbital
      const propagatorPoints = generateOrbitPoints(planet.a * 20, planet.e, 720); // Más puntos para suavidad
      const propagatorGeometry = new THREE.BufferGeometry().setFromPoints(propagatorPoints);
      const propagatorMaterial = new THREE.LineBasicMaterial({ color: 0xff0000 }); // Color rojo para el propagador
      const propagatorLine = new THREE.Line(propagatorGeometry, propagatorMaterial);
      scene.add(propagatorLine);
    });

    camera.position.z = 200;

    // Controles de cámara
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controlsRef.current = controls;

    // Campo estelar
    createStarField(scene);

    const animate = () => {
      if (!paused) {
        planets.forEach((planet) => {
          const time = Date.now() * speed * planet.orbitalSpeed;
          const M = planet.M0 + time;
          const E = solveKepler(M, planet.e);
          const ν = 2 * Math.atan2(
            Math.sqrt(1 + planet.e) * Math.sin(E / 2),
            Math.sqrt(1 - planet.e) * Math.cos(E / 2)
          );
          const r = planet.a * (1 - planet.e ** 2) / (1 + planet.e * Math.cos(ν));
          planet.mesh.position.set(
            r * Math.cos(ν) * 20,
            0,
            r * Math.sin(ν) * 20
          );
        });
      }

      controls.update();
      renderer.render(scene, camera);
      requestAnimationFrame(animate);
    };
    animate();

    return () => {
      mountRef.current.removeChild(renderer.domElement);
    };
  }, [paused, speed]);

  return (
    <div>
      <div ref={mountRef} />
      <div style={{ position: 'absolute', top: '10px', left: '10px' }}>
        <button onClick={() => setPaused(!paused)}>
          {paused ? 'Resume' : 'Pause'}
        </button>
        <input
          type="range"
          min="0.001"
          max="0.01"
          step="0.001"
          value={speed}
          onChange={(e) => setSpeed(parseFloat(e.target.value))}
        />
        <span>Speed: {speed}</span>
      </div>
    </div>
  );
};

export default SolarSystem;
