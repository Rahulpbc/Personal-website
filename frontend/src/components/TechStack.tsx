import * as THREE from "three";
import { useRef, useMemo, useState, useEffect } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Environment, Text, Billboard, Plane } from "@react-three/drei";
import { EffectComposer, N8AO } from "@react-three/postprocessing";
import "./styles/TechStack.css";

// Create a texture loader with proper error handling
const textureLoader = new THREE.TextureLoader();
textureLoader.crossOrigin = 'anonymous';

// Helper to get absolute URL for images
const getImageUrl = (path: string) => {
  const baseUrl = window.location.origin;
  // Remove leading slash if present
  const cleanPath = path.startsWith('/') ? path.substring(1) : path;
  return `${baseUrl}/${cleanPath}`;
};

// Log for debugging
console.log("Base URL for images:", window.location.origin);

// Define image URLs and tech names
const techData = [
  { url: "images/react.png", name: "React" },
  { url: "images/java.png", name: "Java" },
  { url: "images/python.png", name: "Python" },
  { url: "images/express.png", name: "Express" },
  { url: "images/postgresql.png", name: "PostgreSQL" },
  { url: "images/mysql.png", name: "MySQL" },
  { url: "images/typescript.png", name: "TypeScript" },
  { url: "images/javascript.png", name: "JavaScript" },
  { url: "images/aws.png", name: "AWS" },
  { url: "images/azure.png", name: "Azure" },
  { url: "images/docker.png", name: "Docker" },
  { url: "images/kubernetes.png", name: "Kubernetes" },
  { url: "images/prometheus.png", name: "Prometheus" },
  { url: "images/grafana.png", name: "Grafana" },
  { url: "images/redis.png", name: "Redis" },
];

// Create texture objects with proper type structure
interface TechItem {
  texture: THREE.Texture;
  name: string;
}

// Load textures with proper error handling and absolute URLs
const textures: TechItem[] = techData.map(tech => {
  // Use absolute URL
  const fullUrl = getImageUrl(tech.url);
  console.log(`Loading texture from: ${fullUrl}`);
  
  // Create placeholder texture first
  const texture = new THREE.Texture();
  
  // Load the actual texture
  const img = new Image();
  img.onload = () => {
    texture.image = img;
    texture.needsUpdate = true;
    console.log(`Successfully loaded texture for ${tech.name}`);
  };
  img.onerror = (err) => {
    console.error(`Failed to load texture for ${tech.name}:`, err);
  };
  img.src = fullUrl;
  
  return {
    texture, 
    name: tech.name
  };
});

// Calculate responsive positions based on screen size
const createPositions = (count: number): [number, number, number][] => {
  const getResponsiveRadius = () => {
    const width = window.innerWidth;
    if (width < 600) return 6;  // Mobile - smaller radius for better visibility
    if (width < 1024) return 8; // Tablet - medium radius
    return 12; // Desktop - larger radius
  };
  
  const getResponsiveHeight = () => {
    const width = window.innerWidth;
    if (width < 600) return 6;  // Less vertical spread on mobile
    if (width < 1024) return 8; // Medium vertical spread on tablet
    return 10; // Larger vertical spread on desktop
  };
  
  const radius = getResponsiveRadius();
  const heightRange = getResponsiveHeight();
  
  return Array.from({ length: count }, (_, i) => {
    const angle = (i / count) * Math.PI * 2; // Distribute around a circle
    const x = Math.cos(angle) * radius;
    const y = (Math.random() - 0.5) * heightRange; // Random height variation with responsive range
    const z = Math.sin(angle) * radius;
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
  
  // Responsive card sizing based on screen width
  const getCardSize = useMemo(() => {
    const width = window.innerWidth;
    if (width < 600) return { card: 1.8, logo: 1.5, text: 0.15 };
    if (width < 1024) return { card: 2.0, logo: 1.7, text: 0.18 };
    return { card: 2.5, logo: 2.0, text: 0.2 };
  }, []);
  
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
  
  // Add window resize handler
  useEffect(() => {
    const handleResize = () => {
      // Force re-render on resize to update card sizes
      if (groupRef.current) {
        groupRef.current.scale.set(1, 1, 1);
      }
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
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
          <boxGeometry args={[getCardSize.card, getCardSize.card, 0.1]} />
          <meshStandardMaterial 
            color={hovered ? "#ffffff" : "#f5f5f5"} 
            roughness={0.2} 
            metalness={0.1}
            envMapIntensity={0.5}
          />
        </mesh>
        
        {/* Logo on front */}
        <Plane args={[getCardSize.logo, getCardSize.logo]} position={[0, 0.3, 0.06]} ref={meshRef}>
          <meshBasicMaterial 
            map={texture} 
            transparent 
            opacity={hovered ? 1 : 0.9}
          />
        </Plane>
        
        {/* Tech name */}
        <Text
          position={[0, -1, 0.06]}
          fontSize={getCardSize.text}
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
        gl={{ alpha: true, stencil: false, depth: true, antialias: true, preserveDrawingBuffer: true }}
        camera={{ position: [0, 0, 20], fov: 32.5, near: 1, far: 100 }}
        onCreated={(state) => {
          state.gl.toneMappingExposure = 1.5;
          console.log("TechStack Canvas created successfully");
        }}
        className="tech-canvas"
        resize={{ scroll: false }}
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