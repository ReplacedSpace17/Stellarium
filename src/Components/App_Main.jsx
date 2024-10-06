import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import planetsData from './data/planets.json';
import './style.css';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';


import asteroidsData from './data/AsteroidesG.json';
import asteroidePequeño from './data/AsteroidesP.json';
import ateroidePHA from './data/AteroidsPHAS.json';

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


const loader = new GLTFLoader();
const modelPath = 'ruta/a/tu/modelo.glb'; // Cambia esta ruta por la correcta


const createAsteroid = (asteroid, type) => {
  //Asteroide grande
  if(type === 'GRANDE'){
    const geometry = new THREE.SphereGeometry(asteroid.diameter / 2, 16, 16);
    const material = new THREE.MeshBasicMaterial({ color: 0x00FF00 });
    const asteroidMesh = new THREE.Mesh(geometry, material);
    asteroidMesh.name = asteroid.name;
    
    // Asegúrate de que la posición inicial sea correcta
    const r = asteroid.a * scale; // Usa el semieje mayor
    asteroidMesh.position.set(r * Math.cos(0), 0, r * Math.sin(0)); // Coloca el asteroide en la órbita
    return asteroidMesh;
  }
  if(type === 'PEQUEÑO'){
    const geometry = new THREE.SphereGeometry(asteroid.diameter / 2, 16, 16);
    const material = new THREE.MeshBasicMaterial({ color: 0x9900FF });
    const asteroidMesh = new THREE.Mesh(geometry, material);
    asteroidMesh.name = asteroid.name;
    
    // Asegúrate de que la posición inicial sea correcta
    const r = asteroid.a * scale; // Usa el semieje mayor
    asteroidMesh.position.set(r * Math.cos(0), 0, r * Math.sin(0)); // Coloca el asteroide en la órbita
    return asteroidMesh;
  }
  if(type === 'PHA'){
    const geometry = new THREE.SphereGeometry(asteroid.diameter / 2, 16, 16);
    const material = new THREE.MeshBasicMaterial({ color: 0xFF0000 });
    const asteroidMesh = new THREE.Mesh(geometry, material);
    asteroidMesh.name = asteroid.name;
    
    // Asegúrate de que la posición inicial sea correcta
    const r = asteroid.a * scale; // Usa el semieje mayor
    asteroidMesh.position.set(r * Math.cos(0), 0, r * Math.sin(0)); // Coloca el asteroide en la órbita
    return asteroidMesh;
  }
 
};

// Función para crear polvo azul orbitando alrededor de un objeto
const createOrbitingDust = (scene, centerObject) => {
  const dustGeometry = new THREE.BufferGeometry();
  const dustMaterial = new THREE.PointsMaterial({
    color: 0x00bfff, // Azul claro
    size: 0.2,       // Tamaño de cada partícula
    opacity: 0.6,
    transparent: true,
  });

  const dustVertices = [];
  const numParticles = 500; // Número de partículas de polvo
  const dustRadius = 20;    // Radio de la órbita de las partículas

  for (let i = 0; i < numParticles; i++) {
    // Generar partículas en una esfera alrededor del centro del objeto
    const angle = Math.random() * 2 * Math.PI;
    const radius = dustRadius + (Math.random() - 0.5) * dustRadius * 0.5; // Varía el radio
    const x = centerObject.position.x + radius * Math.cos(angle);
    const z = centerObject.position.z + radius * Math.sin(angle);
    const y = (Math.random() - 0.5) * dustRadius; // Añadir variación en el eje Y

    dustVertices.push(x, y, z);
  }

  dustGeometry.setAttribute(
    'position',
    new THREE.Float32BufferAttribute(dustVertices, 3)
  );

  const dust = new THREE.Points(dustGeometry, dustMaterial);
  scene.add(dust);

  return dust;
};

// Función para generar los puntos de la órbita

const scale = 200; // 1 UA = 100 unidades en el espacio 3D

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
  const [speed, setSpeed] = useState(0.00005);
  const controlsRef = useRef(null);
  const cameraRef = useRef(null);
  const raycasterRef = useRef(new THREE.Raycaster());
  const mouseRef = useRef(new THREE.Vector2());
  const [followPlanet, setFollowPlanet] = useState(null);
  const [planetInfo, setPlanetInfo] = useState(null);

  const trailPoints = {}; // Objeto para almacenar los puntos de rastro de cada planeta

  
  useEffect(() => {
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000000 // Aumentar el límite far a 5000 o más
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

    // Crear asteroides y añadirlos a la escena
  asteroidsData.forEach((asteroid) => {
    const asteroidMesh = createAsteroid(asteroid, "GRANDE");
    scene.add(asteroidMesh);
  });

    // Crear asteroides y añadirlos a la escena
    asteroidePequeño.forEach((asteroid) => {
      const asteroidMesh = createAsteroid(asteroid, "PEQUEÑO");
      scene.add(asteroidMesh);
    });

     // Crear asteroides y añadirlos a la escena
     ateroidePHA.forEach((asteroid) => {
      const asteroidMesh = createAsteroid(asteroid, "PHA");
      scene.add(asteroidMesh);
    });

   // Crear planetas y sus órbitas
const planets = [];
const planetScaleFactor = 1; // Factor de escala para aumentar el tamaño de los planetas

planetsData.forEach((planet) => {
  const geometry = new THREE.SphereGeometry(planet.radius * planetScaleFactor, 32, 32); // Aumenta el radio
  const material = new THREE.MeshBasicMaterial({ color: planet.color });
  const planetMesh = new THREE.Mesh(geometry, material);
  planetMesh.name = planet.name;
  planets.push({ mesh: planetMesh, ...planet });
  scene.add(planetMesh);
  
  // Crear etiqueta
  const label = createLabel(planet.name, 50);
  label.position.set(0, (planet.radius * planetScaleFactor) + 5, 0); // Posicionar por encima del planeta
  label.position.x = -label.scale.x / 2; // Centrar en el eje X
  planetMesh.add(label); // Agregar la etiqueta al planeta
  
  // Crear órbitas
  const orbitPoints = generateOrbitPoints(planet.a * scale, planet.e);
  console.log('Orbit Points for', planet.name, orbitPoints); // Depuración
  const orbitGeometry = new THREE.BufferGeometry().setFromPoints(orbitPoints);
  const orbitMaterial = new THREE.LineBasicMaterial({
    color: 0xffffff,
    opacity: 0.5,
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
          const r = (planet.a * (1 - planet.e ** 2)) / (1 + planet.e * Math.cos(ν)); // Distancia radial
    
          // Actualiza la posición del planeta usando el factor de escalado
          planet.mesh.position.set(
            r * scale * Math.cos(ν),
            0,
            r * scale * Math.sin(ν)
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

  const createLabel = (text, fontSize) => {
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
  
    // Ajustar el tamaño de la fuente dinámicamente
    context.font = `${fontSize}px Arial`;
    context.fillStyle = 'white';
    context.fillText(text, 0, fontSize);
  
    const texture = new THREE.Texture(canvas);
    texture.needsUpdate = true;
  
    const spriteMaterial = new THREE.SpriteMaterial({ map: texture });
    const sprite = new THREE.Sprite(spriteMaterial);
  
    // Ajustar la escala del sprite dependiendo del tamaño del texto
    sprite.scale.set(fontSize * 0.5, fontSize * 0.25, 1);
    
    return sprite;
  };
  

  
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
