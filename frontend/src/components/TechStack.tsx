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
  // Configure texture to only show on part of the sphere
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.repeat.set(0.5, 0.5); // Only use 1/4 of the texture
  texture.offset.set(0.25, 0.25); // Center the logo
  texture.wrapS = THREE.ClampToEdgeWrapping;
  texture.wrapT = THREE.ClampToEdgeWrapping;
  return texture;
});

// Use a high-quality sphere geometry for better texture mapping
const sphereGeometry = new THREE.SphereGeometry(1, 32, 32);

// Create spheres with better spacing
const spheres = [...Array(15)].map(() => ({
  scale: [0.8, 0.9, 1, 1.1, 1.2][Math.floor(Math.random() * 5)],
}));

type SphereProps = {
  vec?: THREE.Vector3;
  scale: number;
  r?: typeof THREE.MathUtils.randFloatSpread;
  material: THREE.MeshPhysicalMaterial;
  isActive: boolean;
};

function SphereGeo({
  vec = new THREE.Vector3(),
  scale,
  r = THREE.MathUtils.randFloatSpread,
  material,
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

  // Reduce logo plane size to fit within sphere boundary (70% of sphere diameter)
  const logoPlaneSize = scale * 1.4; // 70% of sphere diameter (scale * 2)

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
      <group>
        {/* White Sphere */}
        <mesh
          castShadow
          receiveShadow
          scale={scale}
          geometry={sphereGeometry}
          material={new THREE.MeshStandardMaterial({ color: "white", roughness: 0.3, metalness: 0.2 })}
          rotation={[0.3, 1, 1]}
        />

        {/* Logo Plane 1 (Front) - positioned on the surface of the sphere */}
        <mesh position={[0, 0, scale * 0.99]} rotation={[0, 0, 0]}>
          <planeGeometry args={[logoPlaneSize, logoPlaneSize]} />
          <meshBasicMaterial 
            map={material.map} 
            side={THREE.DoubleSide} 
            transparent={true} 
            alphaTest={0.5}
            depthWrite={false} // Prevent z-fighting with sphere
          />
        </mesh>

        {/* Logo Plane 2 (Back) - positioned on the opposite side */}
        <mesh position={[0, 0, -scale * 0.99]} rotation={[0, Math.PI, 0]}>
          <planeGeometry args={[logoPlaneSize, logoPlaneSize]} />
          <meshBasicMaterial 
            map={material.map} 
            side={THREE.DoubleSide} 
            transparent={true} 
            alphaTest={0.5}
            depthWrite={false} // Prevent z-fighting with sphere
          />
        </mesh>
      </group>
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
    return textures.map(
      (texture) => {
        // Configure texture to only show on the front hemisphere of the sphere
        texture.offset.set(0.25, 0.25);
        texture.repeat.set(0.5, 0.5);
        texture.center.set(0.5, 0.5);
        
        // Create a material optimized for spherical logo display
        const material = new THREE.MeshPhysicalMaterial({
          map: texture,
          color: '#ffffff',  // White base color
          emissive: "#ffffff",
          emissiveMap: texture,
          emissiveIntensity: 0.3,
          metalness: 0.4,
          roughness: 0.6,
          clearcoat: 0.4,
          transparent: false,
          side: THREE.FrontSide,
        });
        
        return material;
      }
    );
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
        <ambientLight intensity={1} />
        <spotLight
          position={[20, 20, 25]}
          penumbra={1}
          angle={0.2}
          color="white"
          castShadow
          shadow-mapSize={[512, 512]}
        />
        <directionalLight position={[0, 5, -4]} intensity={2} />
        <Physics gravity={[0, 0, 0]}>
          <Pointer isActive={isActive} />
          {spheres.map((props, i) => (
            <SphereGeo
              key={i}
              {...props}
              material={materials[i % materials.length]} // Use sequential logos instead of random
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