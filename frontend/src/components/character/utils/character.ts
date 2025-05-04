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

  const loadCharacter = () => {
    console.log("Starting character model loading process...");
    
    // Check if model file exists by attempting to fetch it first
    return fetch("/models/character.glb")
      .then(response => {
        if (!response.ok) {
          throw new Error(`Model file not found: ${response.status} ${response.statusText}`);
        }
        console.log("Character model file exists, proceeding with loading...");
        
        return new Promise<GLTF | null>((resolve, reject) => {
          // Configure DRACO loader with absolute path
          const dracoLoaderPath = window.location.origin + "/draco/";
          console.log(`Setting DRACO decoder path to: ${dracoLoaderPath}`);
          dracoLoader.setDecoderPath(dracoLoaderPath);
          
          // Load the model with progress tracking
          loader.load(
            "/models/character.glb",
            (gltf) => {
              console.log("GLTF model loaded successfully!", gltf);
              try {
                const character = gltf.scene;
                
                // Log model hierarchy for debugging
                console.log("Model hierarchy:", character);
                
                // Set up model properties
                renderer.compileAsync(character, camera, scene)
                  .then(() => {
                    console.log("Model compiled successfully");
                    
                    character.traverse((child: any) => {
                      if (child.isMesh) {
                        const mesh = child as THREE.Mesh;
                        child.castShadow = true;
                        child.receiveShadow = true;
                        mesh.frustumCulled = true;
                        console.log(`Configured mesh: ${child.name}`);
                      }
                    });
                    
                    // Add model to scene immediately
                    scene.add(character);
                    console.log("Added character to scene");
                    
                    // Position the model
                    character.scale.set(0.5, 0.5, 0.5);
                    character.position.set(0, 8, 0);
                    
                    // Set up animations after model is in scene
                    try {
                      console.log("Setting up character timeline...");
                      setCharTimeline(character, camera);
                      setAllTimeline();
                    } catch (animError) {
                      console.warn("Animation setup error (non-critical):", animError);
                      // Continue even if animations fail
                    }
                    
                    // Adjust foot positions if they exist
                    try {
                      const footR = character.getObjectByName("footR");
                      const footL = character.getObjectByName("footL");
                      
                      if (footR && footR.position) {
                        footR.position.y = 3.36;
                        console.log("Adjusted footR position");
                      } else {
                        console.log("footR object not found in model");
                      }
                      
                      if (footL && footL.position) {
                        footL.position.y = 3.36;
                        console.log("Adjusted footL position");
                      } else {
                        console.log("footL object not found in model");
                      }
                    } catch (footError) {
                      console.warn("Foot adjustment error (non-critical):", footError);
                    }
                    
                    // Clean up
                    dracoLoader.dispose();
                    
                    // Resolve with the loaded model
                    resolve(gltf);
                  })
                  .catch(compileError => {
                    console.error("Error compiling model:", compileError);
                    // Still resolve with the model even if compilation fails
                    scene.add(character);
                    resolve(gltf);
                  });
              } catch (setupError) {
                console.error("Error setting up character:", setupError);
                reject(setupError);
              }
            },
            (progress) => {
              // Log loading progress
              const percentComplete = Math.round((progress.loaded / progress.total) * 100);
              console.log(`Loading model: ${percentComplete}% (${progress.loaded}/${progress.total} bytes)`);
            },
            (error) => {
              console.error("Error loading GLTF model:", error);
              reject(error);
            }
          );
        });
      })
      .catch(fetchError => {
        console.error("Error fetching model file:", fetchError);
        return Promise.reject(fetchError);
      });
  };

  return { loadCharacter };
};

export default setCharacter;