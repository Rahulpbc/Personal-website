import * as THREE from "three";
import { RGBELoader } from "three-stdlib";
import { gsap } from "gsap";

const setLighting = (scene: THREE.Scene) => {
  const directionalLight = new THREE.DirectionalLight(0xc7a9ff, 0);
  directionalLight.intensity = 0;
  directionalLight.position.set(-0.47, -0.32, -1);
  directionalLight.castShadow = true;
  directionalLight.shadow.mapSize.width = 1024;
  directionalLight.shadow.mapSize.height = 1024;
  directionalLight.shadow.camera.near = 0.5;
  directionalLight.shadow.camera.far = 50;
  scene.add(directionalLight);

  const pointLight = new THREE.PointLight(0xc2a4ff, 0, 100, 3);
  pointLight.position.set(3, 12, 4);
  pointLight.castShadow = true;
  scene.add(pointLight);

  // Create fallback lighting immediately so we have something even if HDR loading fails
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
  scene.add(ambientLight);
  
  // Set a basic environment color
  scene.background = new THREE.Color(0x303030);
  
  // Try to load HDR environment map with robust error handling
  try {
    // Check if we're in development or production
    const isDev = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
    
    // Use a simpler environment map that we know exists
    const hdrFile = "character.glb"; // Use the glb file we know exists as a placeholder
    
    new RGBELoader()
      .setPath("/models/")
      .load(hdrFile, 
        // Success callback
        function (texture) {
          try {
            texture.mapping = THREE.EquirectangularReflectionMapping;
            scene.environment = texture;
            scene.environmentIntensity = 0;
            
            // Only set rotation if the scene has this property
            if (scene.environmentRotation) {
              scene.environmentRotation.set(5.76, 85.85, 1);
            }
            console.log("HDR environment loaded successfully");
          } catch (err) {
            console.log("Error applying HDR texture:", err);
            // Fallback is already in place
          }
        },
        // Progress callback
        undefined,
        // Error callback
        function (error) {
          console.log("Could not load HDR environment map, using fallback lighting", error);
          // Fallback is already in place
        }
      );
  } catch (error) {
    console.log("Error setting up environment lighting:", error);
    // Fallback is already in place
  }

  function setPointLight(screenLight: any) {
    if (screenLight.material.opacity > 0.9) {
      pointLight.intensity = screenLight.material.emissiveIntensity * 20;
    } else {
      pointLight.intensity = 0;
    }
  }
  const duration = 2;
  const ease = "power2.inOut";
  function turnOnLights() {
    gsap.to(scene, {
      environmentIntensity: 0.64,
      duration: duration,
      ease: ease,
    });
    gsap.to(directionalLight, {
      intensity: 1,
      duration: duration,
      ease: ease,
    });
    gsap.to(".character-rim", {
      y: "55%",
      opacity: 1,
      delay: 0.2,
      duration: 2,
    });
  }

  return { setPointLight, turnOnLights };
};

export default setLighting;