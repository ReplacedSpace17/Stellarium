import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import planetsData from './data/planets.json';
import './style.css';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';


import asteroidsData from './data/AsteroidesG.json';
import asteroidePequeño from './data/AsteroidesP.json';
import ateroidePHA from './data/AteroidsPHAS.json';
import cometasEnanos from './data/cometas_enanos.json';
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
    const material = new THREE.MeshBasicMaterial({ color: 0xFF0099 });
    const asteroidMesh = new THREE.Mesh(geometry, material);
    asteroidMesh.name = asteroid.name;
    
    // Asegúrate de que la posición inicial sea correcta
    const r = asteroid.a * scale; // Usa el semieje mayor
    asteroidMesh.position.set(r * Math.cos(0), 0, r * Math.sin(0)); // Coloca el asteroide en la órbita
    return asteroidMesh;
  }
  if(type === 'COMETAS'){
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

const generateAsteroidOrbitPoints = (a, e, i, w, steps = 360) => {
  const points = [];
  const inclination = (i * Math.PI) / 180; // Convertir inclinación a radianes
  const argumentOfPeriapsis = (w * Math.PI) / 180; // Convertir w a radianes

  for (let j = 0; j < steps; j++) {
    const M = (j / steps) * 2 * Math.PI; // Anomalía media
    const E = solveKepler(M, e); // Resolver la anomalía excéntrica
    const ν = 2 * Math.atan2(
      Math.sqrt(1 + e) * Math.sin(E / 2),
      Math.sqrt(1 - e) * Math.cos(E / 2)
    ); // Anomalía verdadera
    const r = (a * (1 - e ** 2)) / (1 + e * Math.cos(ν)); // Distancia radial

    // Coordenadas en el plano XY, considerando el argumento del periastro
    const x = r * Math.cos(ν);
    const z = r * Math.sin(ν);

    // Aplicar la rotación por el argumento del periapsis
    const x_rotated = x * Math.cos(argumentOfPeriapsis) - z * Math.sin(argumentOfPeriapsis);
    const z_rotated = x * Math.sin(argumentOfPeriapsis) + z * Math.cos(argumentOfPeriapsis);
    
    // Aplicar la inclinación
    const y = r * Math.sin(inclination); // Mantener la inclinación en la coordenada Y

    // Agregar el punto rotado y ajustado
    points.push(new THREE.Vector3(x_rotated, y, z_rotated));
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

  const createSun = (scene) => {
    const loader = new GLTFLoader();
    loader.load('/planetas/Sol.glb', (gltf) => {
      const sun = gltf.scene;
      sun.scale.set(5, 5, 5); // Escalar el modelo según sea necesario
      scene.add(sun);
    }, undefined, (error) => {
      console.error('Error al cargar el modelo del Sol:', error);
    });
  };
  
  
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
const loader = new GLTFLoader();
loader.load('/planetas/Sol.glb', (gltf) => {
  const sun = gltf.scene;

  // Escalar el modelo más pequeño
// Escalar el modelo más pequeño
sun.scale.set(0.03, 0.03, 0.03); // Cambiar a 0.1, 0.1, 0.1
 // Ajusta la escala a 0.5, 0.5, 0.5 para hacerlo más pequeño

  // Opcional: Ajustar la posición del modelo
  sun.position.set(0, 0, 0); // Asegúrate de que esté en la vista de la cámara

  scene.add(sun);

  // Chequear los hijos de la escena
  gltf.scene.traverse((child) => {
    if (child.isMesh) {
      console.log('Mesh encontrado:', child);
    }
  });
}, (xhr) => {
  console.log((xhr.loaded / xhr.total * 100) + '% cargado');
}, (error) => {
  console.error('Error al cargar el modelo del Sol:', error);
});

    
    

    // Crear asteroides y añadirlos a la escena
// Crear asteroides y añadirlos a la escena
asteroidsData.forEach((asteroid) => {
  const asteroidMesh = createAsteroid(asteroid, "GRANDE");
  scene.add(asteroidMesh);

  // Crear órbitas
  const orbitPoints = generateAsteroidOrbitPoints(
    asteroid.a * scale,   // Semieje mayor
    asteroid.e,           // Excentricidad
    asteroid.i,           // Inclinación
    asteroid.w            // Argumento del periastro
  );
  
  console.log('Orbit Points for', asteroid.name, orbitPoints); // Depuración
  
  const orbitGeometry = new THREE.BufferGeometry().setFromPoints(orbitPoints);
  const orbitMaterial = new THREE.LineBasicMaterial({
    color: 0xffffff,
    opacity: 0.15,
    transparent: true,
  });
  
  const orbitLine = new THREE.Line(orbitGeometry, orbitMaterial);
  scene.add(orbitLine);
});




    // Crear asteroides y añadirlos a la escena
// Crear asteroides pequeños y añadirlos a la escena
asteroidePequeño.forEach((asteroid) => {
  const asteroidMesh = createAsteroid(asteroid, "PEQUEÑO");
  scene.add(asteroidMesh);

  // Crear órbitas para asteroides pequeños
  const orbitPoints = generateAsteroidOrbitPoints(
    asteroid.a * scale,   // Semieje mayor
    asteroid.e,           // Excentricidad
    asteroid.i,           // Inclinación
    asteroid.w            // Argumento del periastro
  );

  console.log('Orbit Points for', asteroid.name, orbitPoints); // Depuración

  const orbitGeometry = new THREE.BufferGeometry().setFromPoints(orbitPoints);
  const orbitMaterial = new THREE.LineBasicMaterial({
    color: 0xffffff,
    opacity: 0.15,
    transparent: true,
  });

  const orbitLine = new THREE.Line(orbitGeometry, orbitMaterial);
  scene.add(orbitLine);
});


     // Crear asteroides y añadirlos a la escena
     ateroidePHA.forEach((asteroid) => {
      const asteroidMesh = createAsteroid(asteroid, "PHA");
      scene.add(asteroidMesh);
       // Crear órbitas para asteroides pequeños
  const orbitPoints = generateAsteroidOrbitPoints(
    asteroid.a * scale,   // Semieje mayor
    asteroid.e,           // Excentricidad
    asteroid.i,           // Inclinación
    asteroid.w            // Argumento del periastro
  );

  console.log('Orbit Points for', asteroid.name, orbitPoints); // Depuración

  const orbitGeometry = new THREE.BufferGeometry().setFromPoints(orbitPoints);
  const orbitMaterial = new THREE.LineBasicMaterial({
    color: 0xffffff,
    opacity: 0.15,
    transparent: true,
  });

  const orbitLine = new THREE.Line(orbitGeometry, orbitMaterial);
  scene.add(orbitLine);
    });


//cometas enanos
// Crear cometas enanos y añadirlos a la escena
cometasEnanos.forEach((cometa) => {
  const cometaMesh = createAsteroid(cometa, "COMETAS"); // Cambiar el tipo si es necesario
  scene.add(cometaMesh);

  // Crear órbitas para cometas enanos
  const orbitPoints = generateAsteroidOrbitPoints(
    cometa.a * scale,   // Semieje mayor
    cometa.e,           // Excentricidad
    cometa.i,           // Inclinación
    cometa.w            // Argumento del periastro
  );

  console.log('Orbit Points for', cometa.name, orbitPoints); // Depuración

  const orbitGeometry = new THREE.BufferGeometry().setFromPoints(orbitPoints);
  const orbitMaterial = new THREE.LineBasicMaterial({
    color: 0x00ff00, // Puedes cambiar el color si lo deseas
    opacity: 0.15,
    transparent: true,
  });

  const orbitLine = new THREE.Line(orbitGeometry, orbitMaterial);
  scene.add(orbitLine);
});


  const loader2 = new GLTFLoader();
const planets = [];

const ambientLight = new THREE.AmbientLight(0xffffff, 0.6); // Luz ambiental blanca con intensidad 0.5
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 1); // Luz direccional blanca con intensidad 1
directionalLight.position.set(100, 100, 100); // Posición de la luz
scene.add(directionalLight);

const sunScale = 0.03; // Escala del Sol
const sunRadiusReference = 100; // Valor de referencia para el radio del Sol (puedes ajustarlo como desees)
const planetScaleFactor = sunRadiusReference; // Factor de escala relativo, como 1.0 para planetas en tu definición

planetsData.forEach((planet) => {
  loader2.load(`/planetas/${planet.model}`, (gltf) => {
    const planetMesh = gltf.scene;

    // Escalado del modelo del planeta
    const planetScale = planet.radius * (sunRadiusReference / planetScaleFactor) / 100;
    planetMesh.scale.set(planetScale, planetScale, planetScale);
    planetMesh.name = planet.name;
    planets.push({ mesh: planetMesh, ...planet });
    scene.add(planetMesh);

    const label = createLabel(planet.name, 500); // Usar un tamaño más razonable
    label.position.set(1, (planet.radius * (sunRadiusReference / planetScaleFactor)) + 5, 0); // Posición por encima del planeta
    label.position.x = -label.scale.x / 2; // Centrar en el eje X
    
    // Agregar la etiqueta al planeta
    planetMesh.add(label);

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

  }, (xhr) => {
    console.log((xhr.loaded / xhr.total * 100) + '% cargado para ' + planet.name);
  }, (error) => {
    console.error('Error al cargar el modelo de ' + planet.name + ':', error);
  });
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
    
          // Añadir rotación del planeta (rotación en el eje Y)
          const rotationSpeed = planet.rotationSpeed || 0.01; // Velocidad de rotación del planeta
          planet.mesh.rotation.y += rotationSpeed; // Rotación sobre el eje Y
        });
        // animacion asteroides grandes
        asteroidsData.forEach((asteroid) => {
          // Cálculo del tiempo
          const time = Date.now() * speed * asteroid.per_y; // velocidad orbital ajustada por el período
          const M = asteroid.M0 || 0 + time; // Media anómala (puedes inicializar M0 si es necesario)
          const E = solveKepler(M, asteroid.e); // Resolución de la ecuación de Kepler
          const ν = 2 * Math.atan2(
            Math.sqrt(1 + asteroid.e) * Math.sin(E / 2),
            Math.sqrt(1 - asteroid.e) * Math.cos(E / 2)
          );
          const r = (asteroid.a * (1 - asteroid.e ** 2)) / (1 + asteroid.e * Math.cos(ν)); // Distancia radial
      
          // Actualiza la posición del asteroide usando el factor de escalado
          const asteroidMesh = scene.getObjectByName(asteroid.name); // Obtén el mesh del asteroide por su nombre
          if (asteroidMesh) {
            asteroidMesh.position.set(
              r * scale * Math.cos(ν),
              r * scale * Math.sin(ν) * Math.sin(asteroid.i * (Math.PI / 180)), // Incluye inclinación
              r * scale * Math.sin(ν) * Math.cos(asteroid.i * (Math.PI / 180)) // Incluye inclinación
            );
      
            // Añadir rotación del asteroide (opcional)
            const rotationSpeed = asteroid.rotationSpeed || 0.01; // Velocidad de rotación del asteroide
            asteroidMesh.rotation.y += rotationSpeed; // Rotación sobre el eje Y
          }
        });
        
         // animacion asteroides pequeño
         asteroidePequeño.forEach((asteroid) => {
          // Cálculo del tiempo
          const time = Date.now() * speed * asteroid.per_y; // velocidad orbital ajustada por el período
          const M = asteroid.M0 || 0 + time; // Media anómala (puedes inicializar M0 si es necesario)
          const E = solveKepler(M, asteroid.e); // Resolución de la ecuación de Kepler
          const ν = 2 * Math.atan2(
            Math.sqrt(1 + asteroid.e) * Math.sin(E / 2),
            Math.sqrt(1 - asteroid.e) * Math.cos(E / 2)
          );
          const r = (asteroid.a * (1 - asteroid.e ** 2)) / (1 + asteroid.e * Math.cos(ν)); // Distancia radial
      
          // Actualiza la posición del asteroide usando el factor de escalado
          const asteroidMesh = scene.getObjectByName(asteroid.name); // Obtén el mesh del asteroide por su nombre
          if (asteroidMesh) {
            asteroidMesh.position.set(
              r * scale * Math.cos(ν),
              r * scale * Math.sin(ν) * Math.sin(asteroid.i * (Math.PI / 180)), // Incluye inclinación
              r * scale * Math.sin(ν) * Math.cos(asteroid.i * (Math.PI / 180)) // Incluye inclinación
            );
      
            // Añadir rotación del asteroide (opcional)
            const rotationSpeed = asteroid.rotationSpeed || 0.01; // Velocidad de rotación del asteroide
            asteroidMesh.rotation.y += rotationSpeed; // Rotación sobre el eje Y
          }
        });

            // animacion asteroides pha
            ateroidePHA.forEach((asteroid) => {
              // Cálculo del tiempo
              const time = Date.now() * speed * asteroid.per_y; // velocidad orbital ajustada por el período
              const M = asteroid.M0 || 0 + time; // Media anómala (puedes inicializar M0 si es necesario)
              const E = solveKepler(M, asteroid.e); // Resolución de la ecuación de Kepler
              const ν = 2 * Math.atan2(
                Math.sqrt(1 + asteroid.e) * Math.sin(E / 2),
                Math.sqrt(1 - asteroid.e) * Math.cos(E / 2)
              );
              const r = (asteroid.a * (1 - asteroid.e ** 2)) / (1 + asteroid.e * Math.cos(ν)); // Distancia radial
          
              // Actualiza la posición del asteroide usando el factor de escalado
              const asteroidMesh = scene.getObjectByName(asteroid.name); // Obtén el mesh del asteroide por su nombre
              if (asteroidMesh) {
                asteroidMesh.position.set(
                  r * scale * Math.cos(ν),
                  r * scale * Math.sin(ν) * Math.sin(asteroid.i * (Math.PI / 180)), // Incluye inclinación
                  r * scale * Math.sin(ν) * Math.cos(asteroid.i * (Math.PI / 180)) // Incluye inclinación
                );
          
                // Añadir rotación del asteroide (opcional)
                const rotationSpeed = asteroid.rotationSpeed || 0.01; // Velocidad de rotación del asteroide
                asteroidMesh.rotation.y += rotationSpeed; // Rotación sobre el eje Y
              }
            });

            // Animación de cometas enanos
cometasEnanos.forEach((cometa) => {
  // Cálculo del tiempo
  const time = Date.now() * speed * cometa.per_y; // Velocidad orbital ajustada por el período
  const M = (cometa.M0 || 0) + time; // Media anómala (inicializa M0 si es necesario)
  const E = solveKepler(M, cometa.e); // Resolución de la ecuación de Kepler
  const ν = 2 * Math.atan2(
    Math.sqrt(1 + cometa.e) * Math.sin(E / 2),
    Math.sqrt(1 - cometa.e) * Math.cos(E / 2)
  );
  const r = (cometa.a * (1 - cometa.e ** 2)) / (1 + cometa.e * Math.cos(ν)); // Distancia radial

  // Actualiza la posición del cometa usando el factor de escalado
  const cometaMesh = scene.getObjectByName(cometa.name); // Obtén el mesh del cometa por su nombre
  if (cometaMesh) {
    cometaMesh.position.set(
      r * scale * Math.cos(ν),
      r * scale * Math.sin(ν) * Math.sin(cometa.i * (Math.PI / 180)), // Incluye inclinación
      r * scale * Math.sin(ν) * Math.cos(cometa.i * (Math.PI / 180)) // Incluye inclinación
    );

    // Añadir rotación del cometa (opcional)
    const rotationSpeed = cometa.rotationSpeed || 0.01; // Velocidad de rotación del cometa
    cometaMesh.rotation.y += rotationSpeed; // Rotación sobre el eje Y
  }
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

function createLabel(text, size) {
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    context.font = `${size}px Arial`;
    
    // Configurar el color de la etiqueta aquí
    context.fillStyle = 'white'; // Establecer el color a blanco
    context.fillText(text, 0, size);
    
    const texture = new THREE.Texture(canvas);
    texture.needsUpdate = true;

    const spriteMaterial = new THREE.SpriteMaterial({ map: texture, transparent: true });
    const sprite = new THREE.Sprite(spriteMaterial);
    sprite.scale.set(size / 100, size / 100, 1); // Ajustar la escala del sprite

    return sprite;
}

  
const handleClick = (event) => {
  // Normalizar las coordenadas del mouse
  mouseRef.current.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouseRef.current.y = -(event.clientY / window.innerHeight) * 2 + 1;

  // Actualizar el raycaster
  raycasterRef.current.setFromCamera(mouseRef.current, cameraRef.current);

  // Calcular los objetos intersectados
  const intersects = raycasterRef.current.intersectObjects(planets.map(planet => planet.mesh));

  if (intersects.length > 0) {
    const selectedPlanet = intersects[0].object;

    // Establecer el estado de seguir al planeta seleccionado
    setFollowPlanet(selectedPlanet);

    // Actualizar la información del planeta (para mostrar en la etiqueta)
    const planetData = planets.find(planet => planet.mesh === selectedPlanet);
    setPlanetInfo(planetData);
  }
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
