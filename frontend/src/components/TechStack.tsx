import * as THREE from "three";
import { useRef, useMemo, useState, useEffect } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Environment, Text, Billboard, Plane } from "@react-three/drei";
import { EffectComposer, N8AO } from "@react-three/postprocessing";

// Create a texture loader with proper error handling
const textureLoader = new THREE.TextureLoader();
textureLoader.crossOrigin = 'anonymous';

// Define image URLs and tech names
const techData = [
  { url: "/images/react.png", name: "React" },
  { url: "/images/java.png", name: "Java" },
  { url: "/images/python.png", name: "Python" },
  { url: "/images/express.png", name: "Express" },
  { url: "/images/postgresql.png", name: "PostgreSQL" },
  { url: "/images/mysql.png", name: "MySQL" },
  { url: "/images/typescript.png", name: "TypeScript" },
  { url: "/images/javascript.png", name: "JavaScript" },
  { url: "/images/aws.png", name: "AWS" },
  { url: "/images/azure.png", name: "Azure" },
  { url: "/images/docker.png", name: "Docker" },
  { url: "/images/kubernetes.png", name: "Kubernetes" },
  { url: "/images/prometheus.png", name: "Prometheus" },
  { url: "/images/grafana.png", name: "Grafana" },
  { url: "/images/redis.png", name: "Redis" },
];

// Create texture objects with proper type structure
interface TechItem {
  texture: THREE.Texture;
  name: string;
}

// Load textures with proper error handling
const textures: TechItem[] = techData.map(tech => {
  const texture = textureLoader.load(tech.url, undefined, undefined, (error) => {
    console.error(`Error loading texture ${tech.url}:`, error);
  });
  return {
    texture, 
    name: tech.name
  };
});

// Calculate positions in a circular pattern
const createPositions = (count: number, radius: number = 12): [number, number, number][] => {
  return Array.from({ length: count }, (_, i) => {
    const angle = (i / count) * Math.PI * 2; // Distribute around a circle
    const x = Math.cos(angle) * radius * Math.random() * 0.5 + radius * Math.cos(angle);
    const y = (Math.random() - 0.5) * 10; // Random height variation
    const z = Math.sin(angle) * radius * Math.random() * 0.5 + radius * Math.sin(angle);
    return [x, y, z];
  });
};

const positions = createPositions(textures.length);

interface ScreenLogoProps {
  texture: THREE.Texture;
  name: string;
  position: [number, number, number];
  isActive: boolean;
}

function ScreenLogo({ texture, name, position, isActive }: ScreenLogoProps) {
  const [hovered, setHovered] = useState(false);
  const meshRef = useRef<THREE.Mesh>(null);
  const groupRef = useRef<THREE.Group>(null);
  const { camera } = useThree();
  
  // Random rotation speed for idle animation
  const rotSpeed = useMemo(() => Math.random() * 0.01 + 0.002, []);
  const floatSpeed = useMemo(() => Math.random() * 0.2 + 0.1, []);
  const initialY = useMemo(() => position[1], [position]);
  
  // Animation timer
  const time = useRef(Math.random() * 100);
  
  useFrame((_, delta) => {
    if (groupRef.current) {
      time.current += delta;
      
      if (isActive) {
        // Subtle floating animation
        groupRef.current.position.y = initialY + Math.sin(time.current * floatSpeed) * 0.5;
        
        // Scale effect on hover
        if (hovered) {
          groupRef.current.scale.lerp(new THREE.Vector3(1.15, 1.15, 1.15), 0.1);
        } else {
          groupRef.current.scale.lerp(new THREE.Vector3(1, 1, 1), 0.1);
        }
        
        // Subtle rotation when not hovered
        if (!hovered) {
          groupRef.current.rotation.y += rotSpeed * delta;
        }
      } else {
        // When not active, shrink and hide
        groupRef.current.scale.lerp(new THREE.Vector3(0.001, 0.001, 0.001), 0.05);
      }
    }
  });
  
  return (
    <group 
      ref={groupRef} 
      position={position}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
    >
      <Billboard follow={true}>
        {/* Card backing */}
        <mesh receiveShadow castShadow>
          <boxGeometry args={[2.5, 2.5, 0.1]} />
          <meshStandardMaterial 
            color={hovered ? "#ffffff" : "#f5f5f5"} 
            roughness={0.2} 
            metalness={0.1}
            envMapIntensity={0.5}
          />
        </mesh>
        
        {/* Logo on front */}
        <Plane args={[2, 2]} position={[0, 0.3, 0.06]} ref={meshRef}>
          <meshBasicMaterial 
            map={texture} 
            transparent 
            opacity={hovered ? 1 : 0.9}
          />
        </Plane>
        
        {/* Tech name */}
        <Text
          position={[0, -1, 0.06]}
          fontSize={0.2}
          color={hovered ? "#000000" : "#555555"}
          anchorX="center"
          anchorY="middle"
        >
          {name}
        </Text>
      </Billboard>
    </group>
  );
}

const TechStack = () => {
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY || document.documentElement.scrollTop;
      const workElement = document.getElementById("work");
      
      if (workElement) {
        const threshold = workElement.getBoundingClientRect().top;
        setIsActive(scrollY > threshold);
      } else {
        // Fallback activation based on scroll position if work element not found
        // Typically activate after scrolling 30% down the page
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  return (
    <div
      id="tech-stack"
      className="techstack"
    >
      <h2>My Techstack</h2>
      <Canvas
        shadows
        gl={{ alpha: true, stencil: false, depth: false, antialias: false }}
        camera={{ position: [0, 0, 20], fov: 32.5, near: 1, far: 100 }}
        onCreated={(state) => (state.gl.toneMappingExposure = 1.5)}
        className="tech-canvas"
      >
        <ambientLight intensity={1.5} />
        <spotLight 
          position={[20, 20, 25]} 
          penumbra={1} 
          angle={0.2}
          color="white"
          castShadow
          shadow-mapSize={[512, 512]}
        />
        <directionalLight position={[0, 5, -4]} intensity={2} />
        
        {/* Render all logo screens */}
        {textures.map((techItem, i) => {
          // Ensure we only render if position exists
          if (i < positions.length) {
            return (
              <ScreenLogo
                key={i}
                texture={techItem.texture}
                name={techItem.name}
                position={positions[i]}
                isActive={isActive}
              />
            );
          }
          return null;
        })}
        
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