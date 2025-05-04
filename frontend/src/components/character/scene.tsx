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
  
  useEffect(() => {
    if (canvasDiv.current) {
      let rect = canvasDiv.current.getBoundingClientRect();
      let container = { width: rect.width, height: rect.height };
      const aspect = container.width / container.height;
      const scene = sceneRef.current;

      const renderer = new THREE.WebGLRenderer({
        alpha: true,
        antialias: true,
      });
      renderer.setSize(container.width, container.height);
      renderer.setPixelRatio(window.devicePixelRatio);
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 1;
      canvasDiv.current.appendChild(renderer.domElement);

      const camera = new THREE.PerspectiveCamera(14.5, aspect, 0.1, 1000);
      camera.position.z = 10;
      camera.position.set(0, 13.1, 24.7);
      camera.zoom = 1.1;
      camera.updateProjectionMatrix();

      let headBone: THREE.Object3D | null = null;
      let screenLight: THREE.Object3D | null = null;
      let mixer: THREE.AnimationMixer | null = null;

      const clock = new THREE.Clock();

      const light = setLighting(scene);
      let progress = setProgress((value) => setLoading(value));
      const { loadCharacter } = setCharacter(renderer, scene, camera);

      loadCharacter().then((gltf) => {
        try {
          if (gltf && gltf.scene) {
            const animations = setAnimations(gltf);
            if (hoverDivRef.current) {
              animations.hover(gltf, hoverDivRef.current);
            }
            mixer = animations.mixer;
            let character = gltf.scene;
            setChar(character);
            scene.add(character);
            
            // Handle missing objects gracefully
            headBone = character.getObjectByName("spine006") || null;
            screenLight = character.getObjectByName("screenlight") || null;
            
            // Safely scale and position the model
            if (character && character.scale && character.position) {
              character.scale.set(0.5, 0.5, 0.5);
              character.position.set(0, 8, 0);
              console.log("Character positioned successfully");
            } else {
              console.error("Character missing scale or position properties");
            }
            
            progress.loaded().then(() => {
              setTimeout(() => {
                // Safely turn on lights
                if (light && typeof light.turnOnLights === 'function') {
                  light.turnOnLights();
                }
                
                // Only call startIntro if it exists
                if (animations && typeof animations.startIntro === 'function') {
                  animations.startIntro();
                }
              }, 2500);
            });
            
            // Add resize listener
            window.addEventListener("resize", () => {
              if (canvasDiv.current) {
                handleResize(renderer, camera, {current: canvasDiv.current}, character);
              }
            });
          } else {
            console.error("Failed to load character model: gltf or gltf.scene is undefined");
            // Complete loading anyway to avoid hanging
            progress.loaded();
          }
        } catch (error) {
          console.error("Error setting up character:", error);
          // Complete loading anyway to avoid hanging
          progress.loaded();
        }
      });

      let mouse = { x: 0, y: 0 },
        interpolation = { x: 0.1, y: 0.2 };

      const onMouseMove = (event: MouseEvent) => {
        handleMouseMove(event, (x, y) => (mouse = { x, y }));
      };
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

      document.addEventListener("mousemove", onMouseMove);
      const landingDiv = document.getElementById("landingDiv");
      if (landingDiv) {
        landingDiv.addEventListener("touchstart", onTouchStart);
        landingDiv.addEventListener("touchend", onTouchEnd);
      }
      const animate = () => {
        requestAnimationFrame(animate);
        
        try {
          // Only attempt head rotation if headBone exists
          if (headBone) {
            handleHeadRotation(
              headBone,
              mouse.x,
              mouse.y,
              interpolation.x,
              interpolation.y,
              THREE.MathUtils.lerp
            );
            
            // Only call setPointLight if both light and screenLight exist
            if (light && typeof light.setPointLight === 'function' && screenLight) {
              light.setPointLight(screenLight);
            }
          }
          
          // Update animation mixer if it exists
          const delta = clock.getDelta();
          if (mixer) {
            mixer.update(delta);
          }
          
          // Render the scene
          if (renderer && scene && camera) {
            renderer.render(scene, camera);
          }
        } catch (error) {
          console.error("Error in animation loop:", error);
        }
      };
      animate();
      return () => {
        try {
          // Clear any pending timeouts
          if (debounce) {
            clearTimeout(debounce);
          }
          
          // Clean up scene and renderer if they exist
          if (sceneRef.current) {
            sceneRef.current.clear();
          }
          
          if (renderer) {
            renderer.dispose();
            
            // Remove renderer from DOM if canvas exists
            if (canvasDiv.current && renderer.domElement && canvasDiv.current.contains(renderer.domElement)) {
              canvasDiv.current.removeChild(renderer.domElement);
            }
          }
          
          // Remove event listeners
          document.removeEventListener("mousemove", onMouseMove);
          
          if (landingDiv) {
            landingDiv.removeEventListener("touchstart", onTouchStart);
            landingDiv.removeEventListener("touchend", onTouchEnd);
          }
          
          console.log("Scene cleanup completed successfully");
        } catch (error) {
          console.error("Error during scene cleanup:", error);
        }
      };
    }
  }, []);

  // Handle visibility based on screen size and ensure proper rendering
  useEffect(() => {
    // Check if we're on desktop
    const isDesktop = window.innerWidth > 1024;
    
    // Only proceed with character initialization on desktop
    if (!isDesktop) {
      console.log('Mobile device detected, not initializing character');
      return;
    }
    
    // Ensure the container is visible
    if (canvasDiv.current) {
      canvasDiv.current.style.visibility = 'visible';
      canvasDiv.current.style.display = 'block';
    }
    
    // Force a repaint to ensure proper rendering
    const timer = setTimeout(() => {
      if (canvasDiv.current) {
        console.log('Ensuring character container visibility');
        // Add a force-visible class
        canvasDiv.current.classList.add('force-visible');
        
        // Force a repaint by briefly hiding and showing
        canvasDiv.current.style.opacity = '0';
        setTimeout(() => {
          if (canvasDiv.current) {
            canvasDiv.current.style.opacity = '1';
          }
        }, 50);
      }
    }, 300);
    
    // Handle window resize
    const handleResize = () => {
      const newIsDesktop = window.innerWidth > 1024;
      if (canvasDiv.current) {
        if (newIsDesktop) {
          canvasDiv.current.style.display = 'block';
        } else {
          canvasDiv.current.style.display = 'none';
        }
      }
    };
    
    window.addEventListener('resize', handleResize);
    
    return () => {
      clearTimeout(timer);
      window.removeEventListener('resize', handleResize);
    };
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