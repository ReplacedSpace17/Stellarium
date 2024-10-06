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
import { or } from 'three/webgpu';

//vaciar repe
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
  const [followAsteroid, setFollowAsteroid] = useState(null);
  const [planetInfo, setPlanetInfo] = useState(null);
  const grandeGroup = new THREE.Group();
  const pequeñoGroup = new THREE.Group();
  const phaGroup = new THREE.Group();
  const cometasEnanosGroup = new THREE.Group();
  const planetasGroup = new THREE.Group();
  const trailPoints = {}; // Objeto para almacenar los puntos de rastro de cada planeta


  const [searchTerm, setSearchTerm] = useState('');

  
  // definir una lista para almacenar los planetas y ids
  const planets_renderes = [];
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
  
  function createLabel(text) {
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    
    // Ajusta el tamaño del lienzo y la fuente
    canvas.width = 1000; // Cambia el ancho según sea necesario
    canvas.height = 500; // Cambia la altura según sea necesario
    
    context.font = '250px Arial'; // Aumenta el tamaño de la fuente
    context.fillStyle = 'white'; // Asegúrate de que el texto sea blanco
    context.textAlign = 'center'; // Alinear texto al centro
    context.textBaseline = 'middle'; // Alinear texto verticalmente
    context.fillText(text, canvas.width / 2, canvas.height / 2); // Centra el texto en el canvas
  
    const texture = new THREE.CanvasTexture(canvas);
    const spriteMaterial = new THREE.SpriteMaterial({ map: texture, transparent: true });
    const sprite = new THREE.Sprite(spriteMaterial);
    
    // Ajusta la escala del sprite
    sprite.scale.set(2, 1, 1); // Cambia el tamaño del sprite según sea necesario
  
    return sprite;
  }

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
asteroidsData.forEach((asteroid) => {
  const asteroidMesh = createAsteroid(asteroid, "GRANDE");
  grandeGroup.add(asteroidMesh);

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
  grandeGroup.add(orbitLine);

  // Crear y agregar la etiqueta
  console.log('Creating label for', asteroid.name); // Depuración
  const label = createLabel(asteroid.name); // Asumiendo que `asteroid` tiene un atributo `name`
  
  // Posicionar la etiqueta sobre el asteroide
  label.position.copy(asteroidMesh.position); // Ajusta según sea necesario para posicionar adecuadamente
  label.position.y += 1; // Eleva la etiqueta sobre el asteroide
  grandeGroup.add(label);
});




    // Crear asteroides y añadirlos a la escena
// Crear asteroides pequeños y añadirlos a la escena
asteroidePequeño.forEach((asteroid) => {
  const asteroidMesh = createAsteroid(asteroid, "PEQUEÑO");
  pequeñoGroup.add(asteroidMesh);

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
  pequeñoGroup.add(orbitLine);
});

// Crear asteroides y añadirlos a la escena
ateroidePHA.forEach((asteroid) => {
  const asteroidMesh = createAsteroid(asteroid, "PHA");
  phaGroup.add(asteroidMesh);

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
  phaGroup.add(orbitLine);


});



//cometas enanos
// Crear cometas enanos y añadirlos a la escena
cometasEnanos.forEach((cometa) => {
  const cometaMesh = createAsteroid(cometa, "COMETAS"); // Cambiar el tipo si es necesario
  cometasEnanosGroup.add(cometaMesh);

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
  cometasEnanosGroup.add(orbitLine);
});




////



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


// Carga de los planetas
console.log('IDs de los planetas:');
planetsData.forEach((planet) => {
  loader2.load(`/planetas/${planet.model}`, (gltf) => {
      const planetMesh = gltf.scene;
      planetMesh.name = planet.name;
      console.log('Mesh cargado:', planet.name, planetMesh);

      // Escalado del modelo del planeta
      const planetScale = planet.radius * (sunRadiusReference / planetScaleFactor) / 100;
      planetMesh.scale.set(planetScale, planetScale, planetScale);

      // Almacenar el ID y el nombre del planeta en el array
      const planetGroupUUID = planetMesh.uuid; // UUID del mesh
      const planetName = planet.name; // Nombre del planeta
      
      // Agregar el mesh al grupo antes de acceder al padre
      planetasGroup.add(planetMesh);

      // Aquí verificamos si el mesh tiene un padre antes de acceder a su uuid
      const parentGroupUUID = planetMesh.parent ? planetMesh.parent.uuid : null; // UUID del grupo padre

      // Almacenar en planets
      planets.push({ 
          id: planetGroupUUID,   // Guardar el ID del mesh
          name: planetName,      // Guardar el nombre del planeta
          mesh: planetMesh,      // Guardar el mesh
          ...planet              // Guardar otras propiedades del planeta
      });

      // Almacena solo el uuid del grupo padre y el nombre del planeta en planets_renderes
      planets_renderes.push({
          parentUUID: parentGroupUUID, // Guardar el UUID del grupo padre
          name: planetName              // Guardar el nombre del planeta
      });

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
      planetasGroup.add(orbitLine);

      // Crear y agregar la etiqueta
      console.log('Creating label for', planet.name); // Depuración
      const label = createLabel(planet.name); // Crear la etiqueta usando la función proporcionada

      // Posicionar la etiqueta sobre el planeta
      label.position.copy(planetMesh.position); // Ajusta según sea necesario para posicionar adecuadamente
      label.position.y += planetScale + 2000; // Eleva la etiqueta sobre el planeta, ajusta la altura según el tamaño del planeta

      // Hacer que la etiqueta sea un hijo del planeta para que se mueva con él
      planetMesh.add(label);

      console.log('Modelo cargado:', planet.name, planetMesh);
      console.log(planets); // Verifica los planetas
      console.log(planets_renderes); // Verifica los planetas renderizados
  }, (xhr) => {
      console.log((xhr.loaded / xhr.total * 100) + '% cargado para ' + planet.name);
  }, (error) => {
      console.error('Error al cargar el modelo de ' + planet.name + ':', error);
  });
});

scene.add(grandeGroup);
scene.add(pequeñoGroup);
scene.add(phaGroup);
scene.add(cometasEnanosGroup);
scene.add(planetasGroup);



 // Configuración del Raycaster y mouse
 const raycaster = new THREE.Raycaster();
 const mouse = new THREE.Vector2();

 let followPlanet = null; // Variable global para almacenar el nombre del planeta a seguir

 const handleClick = (event) => {
   mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
   mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
 
   raycaster.setFromCamera(mouse, camera);
   const intersects = raycaster.intersectObjects(planets.map(p => p.mesh));
 
   if (intersects.length > 0) {
     const selectedMesh = intersects[0].object;
 
     // UUID del mesh seleccionado
     console.log('UUID del mesh seleccionado:', selectedMesh.uuid);
 
     // UUID del parent
     const parentUUID = selectedMesh.parent.uuid;
     console.log('UUID del parent:', parentUUID);
 
     // Buscar el planeta por el UUID del parent en lugar del mesh
     const parentPlanet = planets.find(p => p.id === parentUUID);
 
     if (parentPlanet) {
       console.log('El parent coincide con el planeta:', parentPlanet.name);
 
       // Establecer el planeta a seguir en la variable followPlanet
       followPlanet = parentPlanet.name; // Actualiza el nombre del planeta que la cámara debe seguir
       console.log(`Siguiendo al planeta: ${followPlanet}`);
       
       if (parentPlanet.name === "Venus") {
         console.log("¡Planeta Venus detectado!");
         // Puedes agregar cualquier acción específica para Venus aquí
       }
     } else {
       console.log('No se encontró un planeta que coincida con el parentUUID.');
     }
   } else {
     console.log('No se detectaron intersecciones');
   }
 };
 












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
          const planetData = planets.find((p) => p.name === followPlanet);
          if (planetData) {
            const distance = 30; // Distancia desde la que quieres observar el planeta
        
            // Calcular la nueva posición de la cámara suavemente
            const targetPosition = new THREE.Vector3(
              planetData.mesh.position.x,
              planetData.mesh.position.y + 10, // Ajuste de altura
              planetData.mesh.position.z + distance
            );
        
            // Interpolación suave entre la posición actual de la cámara y la nueva
            camera.position.lerp(targetPosition, 0.05); // El segundo parámetro controla la suavidad
        
            // Hacer que la cámara mire suavemente hacia el planeta
            const targetLookAt = planetData.mesh.position.clone();
            camera.lookAt(targetLookAt);
        
            // Actualiza la información del planeta
            setPlanetInfo(planetData);
        
            // Deshabilitar controles de órbita mientras se sigue un planeta
            controls.enabled = false;
          }
        } else {
          // Si no se sigue un planeta, habilitar los controles de órbita nuevamente
          controls.enabled = true;
        
          // Actualizar los controles para que la cámara sea libre
          controls.update();
        
          // Restablecer la información del planeta cuando no se sigue ninguno
          setPlanetInfo(null);
        }
        
      
        

      }
    
      renderer.render(scene, camera);
      requestAnimationFrame(animate);
    };
    
    animate();
    

 
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


//ocultar planetas



function showAstros(type) {
  switch (type) {
    case 'nea':
      grandeGroup.visible = true;
      pequeñoGroup.visible = true;
      phaGroup.visible = false;
      cometasEnanosGroup.visible = false;
      planetasGroup.visible = false;
      break;
    case 'nec':
      cometasEnanos.visible = true;
      grandeGroup.visible = false;
      pequeñoGroup.visible = false;
      phaGroup.visible = false;
      planetasGroup.visible = false;
      break;
    case 'pha':
      phaGroup.visible = true;
      grandeGroup.visible = false;
      pequeñoGroup.visible = false;
      cometasEnanosGroup.visible = false;
      planetasGroup.visible = false;
      break;
    case 'planetas':
      planetasGroup.visible = true;
      grandeGroup.visible = false;
      pequeñoGroup.visible = false;
      phaGroup.visible = false;
      cometasEnanosGroup.visible = false;
      break;
    case 'todos':
      planetasGroup.visible = true;
      grandeGroup.visible = true;
      pequeñoGroup.visible = true;
      phaGroup.visible = true;
      cometasEnanosGroup.visible = true;
      break;
   
    default:
      break;
  }
}
const [filteredPlanets, setFilteredPlanets] = useState([]);

const handleInputChange = (e) => {
  const value = e.target.value.toUpperCase(); // Convertir a mayúsculas
  setSearchTerm(value);

  // Filtrar planetas según el término de búsqueda y eliminar duplicados
  const filtered = [
    ...new Map(
      planets_renderes
        .filter((planet) => planet.name.toUpperCase().includes(value)) // Filtrar en cualquier parte del nombre
        .map((planet) => [planet.name.toUpperCase(), planet])
    ).values(),
  ];

  // Actualizar el estado de los planetas filtrados
  setFilteredPlanets(filtered);
};

const handleSuggestionClick = (planet) => {
  // Aquí llamamos a la función handleClick con el UUID del planeta seleccionado
  handleClickSearch(planet.parentUUID);
  // También puedes limpiar el input o las sugerencias si es necesario
  setSearchTerm(planet.name.toUpperCase());
  setFilteredPlanets([]); // Limpiar sugerencias al hacer clic
};

const handleClickSearch = (uuid) => {
  // Aquí va tu lógica de manejo de clics
  const selectedPlanet = planets_renderes.find(p => p.parentUUID === uuid);
  if (selectedPlanet) {
    console.log('Planeta seleccionado:', selectedPlanet.name);
    // Realiza el resto de la lógica como en tu función original
  }
};

return (
  <div style={{ position: 'relative', height: '100vh' }}>
    <div style={{ position: 'absolute', top: '10px', left: '10px', color: '#fff', zIndex: 1 }}>
      {/* Campo de entrada de búsqueda */}
      <input
        type="text"
        placeholder="Buscar..."
        className="search-input"
        value={searchTerm}
        onChange={handleInputChange} // Actualiza el término de búsqueda y los resultados
      />
      {searchTerm && filteredPlanets.length > 0 && (
        <ul className="suggestions" style={suggestionsStyle}>
          {filteredPlanets.map((planet) => (
            <li
              key={planet.parentUUID}
              style={suggestionItemStyle}
              onClick={() => handleSuggestionClick(planet)} // Manejar clic en la sugerencia
            >
              {planet.name.toUpperCase()} {/* Convertir a mayúsculas para mostrar */}
            </li>
          ))}
        </ul>
      )}

     

      {/* Botones para filtrar */}
      <button onClick={() => showAstros('nea')}>NEA</button>
      <button onClick={() => showAstros('nec')}>NEC</button>
      <button onClick={() => showAstros('pha')}>PHA</button>
      <button onClick={() => showAstros('planetas')}>Planetas</button>
      <button onClick={() => showAstros('todos')}>Mostrar todo</button>

      {/* Botón para dejar de seguir al planeta */}
      
    </div>

    <div ref={mountRef} />

    {planetInfo && (
  <div className="card">
    <h2>Nombre: {planetInfo.name}</h2>
    <p>Radio: {planetInfo.radius}</p>
    <p>Distancia del sol: {planetInfo.a}</p>
    <p>Excentricidad: {planetInfo.e}</p>
    <p>Velocidad orbital: {planetInfo.orbitalSpeed}</p>

    <button className="unfollow-button" onClick={() => {
      setFollowPlanet(null);
      window.location.reload(); // Recargar la página
    }}>
      Dejar de seguir
    </button>

    {/* Botón para buscar en Google */}
    <button
      className="search-button"
      onClick={() => {
        const searchUrl = `https://www.google.com/search?q=${encodeURIComponent(planetInfo.name)}`;
        window.open(searchUrl, '_blank'); // Abre en nueva pestaña
      }}
    >
      Buscar en Google
    </button>
  </div>
)}


  </div>
);
}


// Estilos para las sugerencias
const suggestionsStyle = {
  listStyleType: 'none',
  padding: '0',
  margin: '0',
  border: '1px solid #ccc',
  borderRadius: '5px',
  maxHeight: '150px',
  overflowY: 'auto',
  position: 'absolute', // Para que se superponga sobre otros elementos
  backgroundColor: 'black',
  zIndex: '1000',
};

// Estilo para cada item de sugerencia
const suggestionItemStyle = {
  padding: '10px',
  cursor: 'pointer',
  transition: 'background-color 0.3s',
};
export default SolarSystem;
