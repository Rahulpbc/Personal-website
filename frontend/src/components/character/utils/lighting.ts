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

  // Initial point light (will be turned on later)
  const initialPointLight = new THREE.PointLight(0xc2a4ff, 0, 100, 3);
  initialPointLight.position.set(3, 12, 4);
  initialPointLight.castShadow = true;
  scene.add(initialPointLight);

  // Skip HDR loading completely and use standard lighting instead
  console.log("Using standard lighting setup instead of HDR");
  
  // Add ambient light
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
  scene.add(ambientLight);
  
  // Add directional light for shadows
  const dirLight = new THREE.DirectionalLight(0xffffff, 0.5);
  dirLight.position.set(1, 1, 1);
  scene.add(dirLight);
  
  // Add additional point light for highlights
  const highlightPointLight = new THREE.PointLight(0xc2a4ff, 0.5, 100, 2);
  highlightPointLight.position.set(3, 12, 4);
  scene.add(highlightPointLight);
  
  // Set a basic environment color
  scene.background = new THREE.Color(0x303030);
  
  // Create a basic cube environment map
  const cubeRenderTarget = new THREE.WebGLCubeRenderTarget(128);
  const cubeCamera = new THREE.CubeCamera(0.1, 1000, cubeRenderTarget);
  scene.environment = cubeRenderTarget.texture;
  scene.environmentIntensity = 0.5;
  
  console.log("Standard lighting setup complete");

  function setPointLight(screenLight: any) {
    if (screenLight && screenLight.material && screenLight.material.opacity > 0.9) {
      initialPointLight.intensity = screenLight.material.emissiveIntensity * 20;
    } else {
      initialPointLight.intensity = 0;
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
    // Safely animate character-rim only if it exists
    const characterRim = document.querySelector(".character-rim");
    if (characterRim) {
      gsap.to(characterRim, {
        y: "55%",
        opacity: 1,
        delay: 0.2,
        duration: 2,
      });
    } else {
      console.log("Character rim element not found, skipping animation");
    }
  }

  return { setPointLight, turnOnLights };
};

export default setLighting;