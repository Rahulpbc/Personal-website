import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import setCharacter from "./utils/character";
import setLighting from "./utils/lighting";
import { useLoading } from "../../context/LoadingProvider";
import handleResize from "./utils/resizeUtils";
import {
  handleMouseMove,
  handleTouchEnd,
  handleHeadRotation,
  handleTouchMove,
} from "./utils/mouseUtils";
import setAnimations from "./utils/animationUtils";
import { setProgress } from "../Loading";
import "../styles/Character.css";

const Scene = () => {
  const canvasDiv = useRef<HTMLDivElement | null>(null);
  const hoverDivRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef(new THREE.Scene());
  const { setLoading } = useLoading();
  const [character, setChar] = useState<THREE.Object3D | null>(null);
  
  // Handle initialization of the 3D scene
  useEffect(() => {
    console.log("Character scene mounting");
    
    // Only proceed if we're on desktop (based on device width)
    const isDesktop = window.innerWidth > 1024;
    if (!isDesktop) {
      console.log("Not initializing character on mobile device");
      return;
    }
    
    // Ensure the container is available
    if (!canvasDiv.current) {
      console.error("Character container not found");
      return;
    }
    
    // Get container dimensions
    const rect = canvasDiv.current.getBoundingClientRect();
    console.log("Character container dimensions:", rect.width, "x", rect.height);
    const container = { width: rect.width, height: rect.height };
    const aspect = container.width / container.height;
    const scene = sceneRef.current;

    // Set up renderer
    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
    });
    renderer.setSize(container.width, container.height);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1;
    
    // Add to DOM
    canvasDiv.current.appendChild(renderer.domElement);

    // Set up camera
    const camera = new THREE.PerspectiveCamera(14.5, aspect, 0.1, 1000);
    camera.position.z = 10;
    camera.position.set(0, 13.1, 24.7);
    camera.zoom = 1.1;
    camera.updateProjectionMatrix();

    // Initialize variables
    let headBone: THREE.Object3D | null = null;
    let screenLight: THREE.Object3D | null = null;
    let mixer: THREE.AnimationMixer | null = null;
    const clock = new THREE.Clock();

    // Set up lighting
    const light = setLighting(scene);
    
    // Progress tracking for loading
    let progress = setProgress((value) => setLoading(value));
    
    // Initialize character model
    const { loadCharacter } = setCharacter(renderer, scene, camera);

    // Load the character model
    loadCharacter()
      .then((gltf) => {
        try {
          if (gltf && gltf.scene) {
            console.log("Character model loaded successfully");
            
            // Set up animations
            const animations = setAnimations(gltf);
            
            // Set up hover effect if hover div is available
            if (hoverDivRef.current) {
              animations.hover(gltf, hoverDivRef.current);
            }
            
            // Store animation mixer
            mixer = animations.mixer;
            
            // Add character to scene
            const characterModel = gltf.scene;
            setChar(characterModel);
            scene.add(characterModel);
            
            // Get head bone and screen light
            headBone = characterModel.getObjectByName("spine006") || null;
            screenLight = characterModel.getObjectByName("screenlight") || null;
            
            // Scale and position the character
            if (characterModel) {
              characterModel.scale.set(0.5, 0.5, 0.5);
              characterModel.position.set(0, 8, 0);
              console.log("Character positioned successfully");
            } else {
              console.error("Character missing scale or position properties");
            }
            
            // Start animations once loaded
            progress.loaded().then(() => {
              setTimeout(() => {
                // Turn on lights if available
                if (light && typeof light.turnOnLights === 'function') {
                  light.turnOnLights();
                }
                
                // Start intro animation if available
                if (animations && typeof animations.startIntro === 'function') {
                  animations.startIntro();
                }
              }, 2500);
            });
          } else {
            console.error("Failed to load character model: gltf or gltf.scene is undefined");
            progress.loaded();
          }
        } catch (error) {
          console.error("Error setting up character:", error);
          progress.loaded();
        }
      })
      .catch((error) => {
        console.error("Error loading character:", error);
        progress.loaded();
      });

    // Mouse/touch tracking
    let mouse = { x: 0, y: 0 };
    let interpolation = { x: 0.1, y: 0.2 };

    // Mouse move handler
    const onMouseMove = (event: MouseEvent) => {
      handleMouseMove(event, (x, y) => (mouse = { x, y }));
    };
    
    // Touch handlers
    let debounce: ReturnType<typeof setTimeout> | undefined;
    
    const onTouchStart = (event: TouchEvent) => {
      const element = event.target as HTMLElement;
      debounce = setTimeout(() => {
        element?.addEventListener("touchmove", (e: TouchEvent) =>
          handleTouchMove(e, (x, y) => (mouse = { x, y }))
        );
      }, 200);
    };

    const onTouchEnd = () => {
      handleTouchEnd((x, y, interpolationX, interpolationY) => {
        mouse = { x, y };
        interpolation = { x: interpolationX, y: interpolationY };
      });
    };

    // Add event listeners
    document.addEventListener("mousemove", onMouseMove);
    const landingDiv = document.getElementById("landingDiv");
    if (landingDiv) {
      landingDiv.addEventListener("touchstart", onTouchStart);
      landingDiv.addEventListener("touchend", onTouchEnd);
    }

    // Handle window resize
    const handleWindowResize = () => {
      if (canvasDiv.current) {
        handleResize(renderer, camera, { current: canvasDiv.current }, character);
      }
    };
    
    window.addEventListener("resize", handleWindowResize);

    // Animation loop
    const animate = () => {
      requestAnimationFrame(animate);
      
      try {
        // Handle head rotation
        if (headBone) {
          handleHeadRotation(
            headBone,
            mouse.x,
            mouse.y,
            interpolation.x,
            interpolation.y,
            THREE.MathUtils.lerp
          );
          
          // Set point light if available
          if (light && typeof light.setPointLight === 'function' && screenLight) {
            light.setPointLight(screenLight);
          }
        }
        
        // Update animations
        const delta = clock.getDelta();
        if (mixer) {
          mixer.update(delta);
        }
        
        // Render scene
        renderer.render(scene, camera);
      } catch (error) {
        console.error("Error in animation loop:", error);
      }
    };
    
    // Start animation loop
    animate();

    // Cleanup
    return () => {
      // Remove event listeners
      document.removeEventListener("mousemove", onMouseMove);
      if (landingDiv) {
        landingDiv.removeEventListener("touchstart", onTouchStart);
        landingDiv.removeEventListener("touchend", onTouchEnd);
      }
      window.removeEventListener("resize", handleWindowResize);
      
      // Clear timeouts
      if (debounce) {
        clearTimeout(debounce);
      }

      // Clean up THREE.js resources
      if (canvasDiv.current) {
        if (renderer.domElement && canvasDiv.current.contains(renderer.domElement)) {
          canvasDiv.current.removeChild(renderer.domElement);
        }
      }
      
      // Dispose renderer and other resources
      if (character) {
        scene.remove(character);
      }
      mixer = null;
      renderer.dispose();
    };
  }, []);

  // Handle visibility based on screen size
  useEffect(() => {
    const isDesktop = window.innerWidth > 1024;
    
    if (canvasDiv.current) {
      if (isDesktop) {
        canvasDiv.current.classList.add('force-visible');
      } else {
        canvasDiv.current.classList.remove('force-visible');
      }
    }
    
    const handleResize = () => {
      const newIsDesktop = window.innerWidth > 1024;
      if (canvasDiv.current) {
        if (newIsDesktop) {
          canvasDiv.current.classList.add('force-visible');
        } else {
          canvasDiv.current.classList.remove('force-visible');
        }
      }
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <>
      <div className="character-container" id="character-container">
        <div className="character-model" ref={canvasDiv}>
          <div className="character-rim"></div>
          <div className="character-hover" ref={hoverDivRef}></div>
        </div>
      </div>
    </>
  );
};

export default Scene;
