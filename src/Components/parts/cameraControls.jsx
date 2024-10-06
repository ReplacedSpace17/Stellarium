import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import planetsData from './data/planets.json';
import './style.css';

// Función para resolver la ecuación de Kepler
const solveKepler = (M, e, tolerance = 1e-6) => {
  let E = M;
  let delta = 1;
  while (Math.abs(delta) > tolerance) {
    delta = E - e * Math.sin(E) - M;
    E = E - delta / (1 - e * Math.cos(E));
  }
  return E;
};

// Función para generar los puntos de la órbita


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

    // Coordenadas en el plano XZ
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
    size: 0.5,
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
  const [speed, setSpeed] = useState(0.0005);
  const controlsRef = useRef(null);
  const cameraRef = useRef(null);
  const raycasterRef = useRef(new THREE.Raycaster());
  const mouseRef = useRef(new THREE.Vector2());
  const [followPlanet, setFollowPlanet] = useState(null);
  const [planetInfo, setPlanetInfo] = useState(null);

  useEffect(() => {
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    cameraRef.current = camera;
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

      // Crear órbitas
      const orbitPoints = generateOrbitPoints(planet.a * 20, planet.e);
      const orbitGeometry = new THREE.BufferGeometry().setFromPoints(orbitPoints);
      const orbitMaterial = new THREE.LineBasicMaterial({
        color: 0xffffff,
        opacity: 0.3,
        transparent: true,
      });
      const orbitLine = new THREE.Line(orbitGeometry, orbitMaterial);
      scene.add(orbitLine);
    });

    // Establecer posición inicial de la cámara
    camera.position.set(0, 50, 200);
    camera.lookAt(0, 0, 0);

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

        // Seguir al planeta seleccionado
        if (followPlanet) {
          const planetMesh = planets.find((p) => p.name === followPlanet);
          if (planetMesh) {
            const distance = 30;
            camera.position.set(
              planetMesh.mesh.position.x,
              planetMesh.mesh.position.y + 10,
              planetMesh.mesh.position.z + distance
            );
            camera.lookAt(planetMesh.mesh.position);
            setPlanetInfo(planetMesh);
          }
        } else {
          controls.update();
          setPlanetInfo(null);
        }
      }

      renderer.render(scene, camera);
      requestAnimationFrame(animate);
    };

    animate();

    // Manejar clics en los planetas
    const handleClick = (event) => {
      mouseRef.current.x = (event.clientX / window.innerWidth) * 2 - 1;
      mouseRef.current.y = -(event.clientY / window.innerHeight) * 2 + 1;

      raycasterRef.current.setFromCamera(mouseRef.current, camera);
      const intersects = raycasterRef.current.intersectObjects(scene.children, true);

      if (intersects.length > 0) {
        const intersectedObject = intersects[0].object;
        if (planets.some((planet) => planet.mesh.name === intersectedObject.name)) {
          setFollowPlanet(intersectedObject.name);
        }
      }
    };

    window.addEventListener('click', handleClick);
    window.addEventListener('resize', () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    });

    return () => {
      window.removeEventListener('click', handleClick);
      mountRef.current.removeChild(renderer.domElement);
      controls.dispose();
    };
  }, [paused, followPlanet, speed]);

  return (
    <div style={{ position: 'relative', height: '100vh' }}>
      <div ref={mountRef} />
      <div style={{ position: 'absolute', top: '10px', left: '10px', color: '#fff', zIndex: 1 }}>
        <button onClick={() => setPaused((prev) => !prev)}>
          {paused ? 'Reanudar' : 'Pausar'}
        </button>
        {/* Botón para dejar de seguir al planeta */}
        {followPlanet && (
          <button onClick={() => setFollowPlanet(null)}>
            Dejar de seguir
          </button>
        )}
      </div>
      {planetInfo && (
        <div className='card'>
          <h2>Nombre: {planetInfo.name}</h2>
          <p>Radio: {planetInfo.radius}</p>
          <p>Distancia del sol: {planetInfo.a}</p>
          <p>Excentricidad: {planetInfo.e}</p>
          <p>Velocidad orbital: {planetInfo.orbitalSpeed}</p>
          
        </div>
      )}
    </div>
  );
};

export default SolarSystem;
