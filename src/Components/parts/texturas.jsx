import { Canvas } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';
import { useEffect, useRef, useState } from 'react';

function Model() {
  const { scene } = useGLTF('/asteroides/asteroide1.glb');
  const planetRef = useRef();

  console.log('Modelo cargado:', scene);

  if (scene) {
    console.log('Hijos del modelo:', scene.children);
    scene.children.forEach(child => {
      console.log('Detalles del hijo:', child);
      if (child.isMesh) {
        console.log('Material original:', child.material);
        
        const originalMaterial = child.material;

        if (originalMaterial.isMeshStandardMaterial) {
          originalMaterial.roughness = 0.2;
          originalMaterial.metalness = 0.5;
        } else {
          const newMaterial = new THREE.MeshStandardMaterial({
            map: originalMaterial.map,
            roughness: 0.2,
            metalness: 0.5
          });
          child.material = newMaterial;
        }
      }
    });
    scene.position.set(0, 0, 0);
    scene.scale.set(2, 2, 2); // Escala del modelo
  }

  useEffect(() => {
    const animate = () => {
      if (planetRef.current) {
        planetRef.current.rotation.y += 0.005; // Velocidad de rotación
      }
      requestAnimationFrame(animate);
    };
    animate();
  }, []);

  return <primitive ref={planetRef} object={scene} />;
}

function SolarSystem() {
  const [cameraPosition, setCameraPosition] = useState([0, 0, 10]); // Estado para la posición de la cámara

  const handleCenterClick = () => {
    setCameraPosition([0, 0, 10]); // Centrar la cámara en el objeto
  };

  return (
    <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}>
      <Canvas 
        style={{ width: '100%', height: '100%', backgroundColor: 'white' }}
        camera={{ fov: 120, position: cameraPosition, near: 0.1, far: 1000 }} // Aumenta el FOV a 120
        gl={{ antialias: true }} 
      >
        <ambientLight intensity={1} />
        <directionalLight position={[10, 10, 5]} intensity={2} />
        <pointLight position={[0, 0, 0]} intensity={1} />
        
        <OrbitControls />
        <Model />
      </Canvas>
      
      {/* Botón para centrar el objeto */}
      <button 
        onClick={handleCenterClick}
        style={{
          position: 'absolute',
          top: '20px',
          left: '20px',
          padding: '10px',
          fontSize: '16px',
          cursor: 'pointer',
          backgroundColor: '#007BFF',
          color: 'white',
          border: 'none',
          borderRadius: '5px'
        }}
      >
        Centrar Objeto
      </button>
    </div>
  );
}

export default SolarSystem;
