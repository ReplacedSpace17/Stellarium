import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

const SolarSystemWithOrbitsAndStars = () => {
  const mountRef = useRef(null);
  const [paused, setPaused] = useState(false);
  const [speed, setSpeed] = useState(0.01);
  const controlsRef = useRef(null);

  const speeds = {
    slow: 0.001,
    normal: 0.01,
    fast: 0.02,
  };

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

    const light = new THREE.PointLight(0xffffff, 1, 100);
    light.position.set(0, 0, 0);
    scene.add(light);

    const sunGeometry = new THREE.SphereGeometry(1.5, 32, 32);
    const sunMaterial = new THREE.MeshBasicMaterial({ color: 0xffff00, opacity: 0.8, transparent: true });
    const sun = new THREE.Mesh(sunGeometry, sunMaterial);
    scene.add(sun);

    const planetGeometry = new THREE.SphereGeometry(0.5, 32, 32);
    const planetMaterials = [
      new THREE.MeshBasicMaterial({ color: 0xff0000 }), // Planeta 1 (rojo)
      new THREE.MeshBasicMaterial({ color: 0x0000ff }), // Planeta 2 (azul)
      new THREE.MeshBasicMaterial({ color: 0x00ff00 }), // Planeta 3 (verde)
    ];
    const planetNames = ['Planeta 1', 'Planeta 2', 'Planeta 3'];
    const planets = [];

    const orbitRadii = [4, 6, 8];
    for (let i = 0; i < planetMaterials.length; i++) {
      const planet = new THREE.Mesh(planetGeometry, planetMaterials[i]);
      planet.name = planetNames[i];
      scene.add(planet);
      planets.push({ mesh: planet, radius: orbitRadii[i], label: null });
    }

    camera.position.z = 15;

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.enableZoom = true;
    controlsRef.current = controls;

    const createOrbit = (radius) => {
      const points = [];
      const segments = 100;
      for (let i = 0; i <= segments; i++) {
        const angle = (i / segments) * Math.PI * 2;
        points.push(new THREE.Vector3(Math.cos(angle) * radius, 0, Math.sin(angle) * radius));
      }
      const orbitGeometry = new THREE.BufferGeometry().setFromPoints(points);
      const orbitMaterial = new THREE.LineBasicMaterial({ color: 0xffffff, opacity: 0.5, transparent: true });
      return new THREE.LineLoop(orbitGeometry, orbitMaterial);
    };

    planets.forEach(planet => {
      const orbit = createOrbit(planet.radius);
      scene.add(orbit);
    });

    const starCount = 100;
    const starGeometry = new THREE.SphereGeometry(0.1, 9, 8);
    const starMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff });
    
    for (let i = 0; i < starCount; i++) {
      const star = new THREE.Mesh(starGeometry, starMaterial);
      star.position.x = Math.random() * 200 - 100;
      star.position.y = Math.random() * 200 - 100;
      star.position.z = Math.random() * 200 - 100;
      scene.add(star);
    }

    const createLabel = (text, position) => {
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d');
      context.font = 'Bold 24px Arial';  // Puedes cambiar la fuente aquí
      context.fillStyle = 'white';
      context.fillText(text, 0, 24);
      
      const texture = new THREE.CanvasTexture(canvas);
      const spriteMaterial = new THREE.SpriteMaterial({ map: texture });
      const sprite = new THREE.Sprite(spriteMaterial);
      sprite.scale.set(2, 1, 1); // Ajusta el tamaño si es necesario
      sprite.position.copy(position);
      sprite.position.y += 1; // Ajusta la altura de la etiqueta sobre el planeta
      return sprite;
    };

    // Crear etiquetas una vez y agregarlas a la escena
    planets.forEach(planet => {
      const labelSprite = createLabel(planet.mesh.name, planet.mesh.position);
      planet.label = labelSprite; // Guardamos la referencia de la etiqueta
      scene.add(labelSprite);
    });

    // Añadir asteroides
    const asteroidGeometry = new THREE.SphereGeometry(0.1, 8, 8);
    const asteroidMaterial = new THREE.MeshBasicMaterial({ color: 0xaaaaaa });

    const asteroids = [];
    const asteroidCount = 20; // Número de asteroides
    for (let i = 0; i < asteroidCount; i++) {
      const asteroid = new THREE.Mesh(asteroidGeometry, asteroidMaterial);
      const orbitRadius = Math.random() * 4 + 2; // Radio aleatorio para la órbita del asteroide
      asteroid.position.x = Math.cos(Math.random() * Math.PI * 2) * orbitRadius;
      asteroid.position.z = Math.sin(Math.random() * Math.PI * 2) * orbitRadius;
      asteroid.userData = { radius: orbitRadius, speed: Math.random() * 0.02 + 0.01 }; // Velocidad aleatoria
      scene.add(asteroid);
      asteroids.push(asteroid);
    }

    const animate = () => {
      requestAnimationFrame(animate);

      if (!paused) {
        sun.rotation.y += 0.004;
        const time = Date.now() * speed;

        planets.forEach((planet, index) => {
          planet.mesh.position.x = Math.sin(time * (index + 1)) * planet.radius;
          planet.mesh.position.z = Math.cos(time * (index + 1)) * planet.radius;

          // Actualiza la posición de las etiquetas
          if (planet.label) {
            planet.label.position.copy(planet.mesh.position);
            planet.label.position.y += 1; // Ajusta la altura de la etiqueta sobre el planeta
          }
        });

        // Actualizar posición de asteroides
        asteroids.forEach(asteroid => {
          asteroid.rotation.y += 0.01; // Rotación del asteroide
          const radius = asteroid.userData.radius;
          const speed = asteroid.userData.speed;
          asteroid.position.x = Math.sin(time * speed) * radius;
          asteroid.position.z = Math.cos(time * speed) * radius;
        });
      }

      controls.update();
      renderer.render(scene, camera);
    };

    animate();

    return () => {
      mountRef.current.removeChild(renderer.domElement);
      controls.dispose();
    };
  }, [paused, speed]);

  const togglePause = () => {
    setPaused(!paused);
  };

  const setNormalSpeed = () => {
    setSpeed(speeds.normal);
  };

  const setSlowSpeed = () => {
    setSpeed(speeds.slow);
  };

  const setFastSpeed = () => {
    setSpeed(speeds.fast);
  };

  return (
    <div>
      <div ref={mountRef}></div>
      <div style={{ position: 'absolute', top: '10px', left: '10px', zIndex: 100 }}>
        <button onClick={togglePause} style={{ margin: '5px' }}>
          {paused ? 'Reanudar' : 'Pausar'}
        </button>
        <button onClick={setSlowSpeed} style={{ margin: '5px' }}>
          Lenta
        </button>
        <button onClick={setNormalSpeed} style={{ margin: '5px' }}>
          Normal
        </button>
        <button onClick={setFastSpeed} style={{ margin: '5px' }}>
          Rápida
        </button>
      </div>
    </div>
  );
};

export default SolarSystemWithOrbitsAndStars;
