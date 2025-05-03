import * as THREE from "three";
import { useRef, useMemo, useState, useEffect } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Environment } from "@react-three/drei";
import { EffectComposer, N8AO } from "@react-three/postprocessing";
import {
  BallCollider,
  Physics,
  RigidBody,
  CylinderCollider,
  RapierRigidBody,
} from "@react-three/rapier";

// Create a texture loader with proper error handling
const textureLoader = new THREE.TextureLoader();
textureLoader.crossOrigin = 'anonymous';

// Define image URLs
const imageUrls = [
  "/images/react.png",
  "/images/java.png",
  "/images/python.png",
  "/images/express.png",
  "/images/postgresql.png",
  "/images/mysql.png",
  "/images/typescript.png",
  "/images/javascript.png",
  "/images/aws.png",
  "/images/azure.png",
  "/images/docker.png",
  "/images/kubernetes.png",
  "/images/prometheus.png",
  "/images/grafana.png",
  "/images/redis.png",
  "/images/terraform.png",
];

// Load textures with error handling
const textures = imageUrls.map((url) => {
  console.log(`Attempting to load texture: ${url}`);
  const texture = textureLoader.load(
    url,
    (loadedTexture) => {
      console.log(`Successfully loaded texture: ${url}`, loadedTexture);
    },
    (progress) => {
      console.log(`Loading texture progress for ${url}:`, progress);
    },
    (error) => {
      console.error(`Error loading texture ${url}:`, error);
    }
  );
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
});

// Create a box geometry with rounded edges for better logo display
const boxGeometry = new THREE.BoxGeometry(1.8, 1.8, 1.8, 4, 4, 4);
// Keep a sphere geometry for the base shape
const sphereGeometry = new THREE.SphereGeometry(1, 28, 28);

const spheres = [...Array(30)].map(() => ({
  scale: [0.7, 1, 0.8, 1, 1][Math.floor(Math.random() * 5)],
}));

type SphereProps = {
  vec?: THREE.Vector3;
  scale: number;
  r?: typeof THREE.MathUtils.randFloatSpread;
  material: [THREE.MeshPhysicalMaterial, THREE.MeshPhysicalMaterial]; // Array of two materials
  isActive: boolean;
};

function SphereGeo({
  vec = new THREE.Vector3(),
  scale,
  r = THREE.MathUtils.randFloatSpread,
  material, // This will now be an array of materials
  isActive,
}: SphereProps) {
  const api = useRef<RapierRigidBody | null>(null);

  useFrame((_state, delta) => {
    if (!isActive) return;
    delta = Math.min(0.1, delta);
    const impulse = vec
      .copy(api.current!.translation())
      .normalize()
      .multiply(
        new THREE.Vector3(
          -50 * delta * scale,
          -150 * delta * scale,
          -50 * delta * scale
        )
      );

    api.current?.applyImpulse(impulse, true);
  });

  return (
    <RigidBody
      linearDamping={0.75}
      angularDamping={0.15}
      friction={0.2}
      position={[r(20), r(20) - 25, r(20) - 10]}
      ref={api}
      colliders={false}
    >
      <BallCollider args={[scale]} />
      <CylinderCollider
        rotation={[Math.PI / 2, 0, 0]}
        position={[0, 0, 1.2 * scale]}
        args={[0.15 * scale, 0.275 * scale]}
      />
      {/* Create two meshes - one sphere with base material and one box with logo */}
      <mesh
        castShadow
        receiveShadow
        scale={scale * 0.95} // Slightly smaller than the logo box
        geometry={sphereGeometry}
        material={material[0]} // Base white material
        rotation={[0.3, 1, 1]}
      />
      <mesh
        castShadow
        receiveShadow
        scale={scale}
        geometry={boxGeometry}
        material={material[1]} // Logo material
        rotation={[0.3, 1, 1]}
      />
    </RigidBody>
  );
}

type PointerProps = {
  vec?: THREE.Vector3;
  isActive: boolean;
};

function Pointer({ vec = new THREE.Vector3(), isActive }: PointerProps) {
  const ref = useRef<RapierRigidBody>(null);

  useFrame(({ pointer, viewport }) => {
    if (!isActive) return;
    const targetVec = vec.lerp(
      new THREE.Vector3(
        (pointer.x * viewport.width) / 2,
        (pointer.y * viewport.height) / 2,
        0
      ),
      0.2
    );
    ref.current?.setNextKinematicTranslation(targetVec);
  });

  return (
    <RigidBody
      position={[100, 100, 100]}
      type="kinematicPosition"
      colliders={false}
      ref={ref}
    >
      <BallCollider args={[2]} />
    </RigidBody>
  );
}

const TechStack = () => {
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    // Create a reference to the techstack element
    const techstackRef = document.querySelector('.techstack');
    
    // Function to check if element is in viewport
    const isInViewport = (element: Element) => {
      if (!element) return false;
      const rect = element.getBoundingClientRect();
      return (
        rect.top <= (window.innerHeight || document.documentElement.clientHeight) &&
        rect.bottom >= 0
      );
    };
    
    const handleScroll = () => {
      if (techstackRef) {
        setIsActive(isInViewport(techstackRef));
      }
    };
    
    // Handle navigation clicks
    document.querySelectorAll(".header a").forEach((elem) => {
      const element = elem as HTMLAnchorElement;
      element.addEventListener("click", () => {
        const interval = setInterval(() => {
          handleScroll();
        }, 10);
        setTimeout(() => {
          clearInterval(interval);
        }, 1000);
      });
    });
    
    // Initial check and scroll listener
    handleScroll();
    window.addEventListener("scroll", handleScroll);
    
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);
  const materials = useMemo(() => {
    // Create a base white material for the spheres
    const baseMaterial = new THREE.MeshPhysicalMaterial({
      color: '#ffffff',
      emissive: '#f0f0f0',
      emissiveIntensity: 0.2,
      metalness: 0.3,
      roughness: 0.4,
      clearcoat: 0.8,
      clearcoatRoughness: 0.2
    });
    
    // Create materials with logos for the flat sides
    return textures.map((texture) => {
      // Create a multi-material array with the base material and logo material
      const logoMaterial = new THREE.MeshPhysicalMaterial({
        map: texture,
        emissive: '#ffffff',
        emissiveMap: texture,
        emissiveIntensity: 0.7,
        metalness: 0.4,
        roughness: 0.3,
        clearcoat: 0.6,
        transparent: true,
        opacity: 1.0,
        side: THREE.DoubleSide
      });
      
      // Return an array with the base material for most faces and logo material for specific faces
      return [baseMaterial, logoMaterial];
    });
  }, []);

  return (
    <div className="techstack">
      <h2> My Techstack</h2>

      <Canvas
        shadows
        gl={{ alpha: true, stencil: false, depth: false, antialias: false }}
        camera={{ position: [0, 0, 20], fov: 32.5, near: 1, far: 100 }}
        onCreated={(state) => (state.gl.toneMappingExposure = 1.5)}
        className="tech-canvas"
      >
        <ambientLight intensity={2.0} /> {/* Further increased ambient light */}
        <spotLight
          position={[20, 20, 25]}
          penumbra={1}
          angle={0.4} /* Wider angle for better coverage */
          color="white"
          intensity={2.0} /* Increased intensity */
          castShadow
          shadow-mapSize={[1024, 1024]}
        />
        <directionalLight position={[0, 5, -4]} intensity={3.0} /> {/* Increased intensity */}
        <pointLight position={[-10, 0, -20]} intensity={2.0} color="#ffffff" /> {/* Increased intensity */}
        <pointLight position={[10, 10, 10]} intensity={1.5} color="#f0f0ff" /> {/* Additional light */}
        <Physics gravity={[0, 0, 0]}>
          <Pointer isActive={isActive} />
          {spheres.map((props, i) => (
            <SphereGeo
              key={i}
              {...props}
              material={materials[Math.floor(Math.random() * materials.length)] as [THREE.MeshPhysicalMaterial, THREE.MeshPhysicalMaterial]}
              isActive={isActive}
            />
          ))}
        </Physics>
        {/* Use a preset environment instead of trying to load a custom HDR file */}
        <Environment
          preset="city"
          environmentIntensity={0.5}
          environmentRotation={[0, 4, 2]}
        />
        <EffectComposer enableNormalPass={false}>
          <N8AO color="#0f002c" aoRadius={2} intensity={1.15} />
        </EffectComposer>
      </Canvas>
    </div>
  );
};

export default TechStack;