// src/components/Model.jsx
import { useLoader } from '@react-three/fiber';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';

const Model = () => {
  // Cargamos el modelo GLTF
  const gltf = useLoader(GLTFLoader, './1.glb');
  
  return (
    <>
      {/* Renderizamos el modelo en la escena */}
      <primitive object={gltf.scene} />
    </>
  );
};

export default Model;
