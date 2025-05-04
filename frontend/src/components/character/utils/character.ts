import * as THREE from "three";
import { DRACOLoader, GLTF, GLTFLoader } from "three-stdlib";
import { setCharTimeline, setAllTimeline } from "../../utils/GsapScrolls";

const setCharacter = (
  renderer: THREE.WebGLRenderer,
  scene: THREE.Scene,
  camera: THREE.PerspectiveCamera
) => {
  const loader = new GLTFLoader();
  const dracoLoader = new DRACOLoader();
  dracoLoader.setDecoderPath("/draco/");
  loader.setDRACOLoader(dracoLoader);

  const loadCharacter = (): Promise<GLTF | null> => {
    console.log("Starting character model loading process...");
    
    const possiblePaths = [
      "/models/character.glb",
      `${window.location.origin}/models/character.glb`,
      "/public/models/character.glb"
    ];
    
    return new Promise<GLTF | null>((resolve) => {
      // Configure DRACO with absolute path to ensure it works
      const dracoLoaderPath = window.location.origin + "/draco/";
      dracoLoader.setDecoderPath(dracoLoaderPath);
      
      console.log("Updated DRACO decoder path to:", dracoLoaderPath);
      
      // Try loading from each path until one works
      const tryNextPath = (pathIndex: number): void => {
        if (pathIndex >= possiblePaths.length) {
          console.error("Failed to load character model from all possible paths");
          resolve(null);
          return;
        }
        
        const currentPath = possiblePaths[pathIndex];
        console.log(`Attempting to load model from: ${currentPath}`);
        
        // Attempt to load the model
        loader.load(
          currentPath,
          (gltf) => {
            if (!gltf || !gltf.scene) {
              console.error("Loaded model has no scene");
              tryNextPath(pathIndex + 1);
              return;
            }
            
            console.log("Character model loaded successfully!");
            const character = gltf.scene;
            
            // Setup and add to scene
            try {
              // Configure model meshes
              character.traverse((child: any) => {
                if (child.isMesh) {
                  child.castShadow = true;
                  child.receiveShadow = true;
                  if (child.material) {
                    child.material.needsUpdate = true;
                  }
                }
              });
              
              // Position and scale
              character.scale.set(0.5, 0.5, 0.5);
              character.position.set(0, 8, 0);
              
              // Add to scene
              scene.add(character);
              
              // Setup animations
              try {
                console.log("Setting up character animations...");
                setCharTimeline(character, camera);
                setAllTimeline();
                console.log("Character animations initialized");
              } catch (animError) {
                console.warn("Animation initialization error (non-critical):", animError);
              }
              
              // Adjust foot positions if they exist
              try {
                const footR = character.getObjectByName("footR");
                const footL = character.getObjectByName("footL");
                
                if (footR && footR.position) {
                  footR.position.y = 3.36;
                  console.log("Adjusted footR position");
                }
                
                if (footL && footL.position) {
                  footL.position.y = 3.36;
                  console.log("Adjusted footL position");
                }
              } catch (footError) {
                console.warn("Foot adjustment error (non-critical):", footError);
              }
              
              // Resolve with successful result
              resolve(gltf);
            } catch (error) {
              console.error("Error setting up character:", error);
              resolve(null);
            }
          },
          (progress) => {
            if (progress.total > 0) {
              const percent = Math.round((progress.loaded / progress.total) * 100);
              console.log(`Loading model... ${percent}%`);
            }
          },
          (error) => {
            console.warn(`Error loading from ${currentPath}:`, error);
            // Try next path
            tryNextPath(pathIndex + 1);
          }
        );
      };
      
      // Start with the first path
      tryNextPath(0);
    });
  };

  return { loadCharacter };
};

export default setCharacter;