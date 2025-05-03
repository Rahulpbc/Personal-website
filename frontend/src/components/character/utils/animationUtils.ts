import * as THREE from "three";
import { GLTF } from "three-stdlib";
import gsap from "gsap";

// Simplified animation setup for any model
const setAnimations = (gltf: GLTF) => {
  let character = gltf.scene;
  let mixer = new THREE.AnimationMixer(character);
  
  // Play all available animations if any exist
  if (gltf.animations && gltf.animations.length > 0) {
    console.log("Available animations:", gltf.animations.map(a => a.name));
    
    // Play the first animation as a demo
    const firstAnimation = gltf.animations[0];
    if (firstAnimation) {
      const action = mixer.clipAction(firstAnimation);
      action.play();
    }
    
    // Try to play other animations if they exist
    gltf.animations.forEach((clip, index) => {
      if (index > 0) { // Skip the first one we already played
        try {
          const action = mixer.clipAction(clip);
          action.play();
        } catch (err) {
          console.log(`Could not play animation: ${clip.name}`);
        }
      }
    });
  } else {
    console.log("No animations found in the model");
  }
  // Simplified startIntro function that works with any model
  function startIntro() {
    // Try to play all animations if they exist
    if (gltf.animations && gltf.animations.length > 0) {
      try {
        // Reset and play the first animation
        const action = mixer.clipAction(gltf.animations[0]);
        action.reset().play();
        console.log("Started intro animation");
      } catch (err) {
        console.log("Could not play intro animation");
      }
    }
  }

  // Simplified hover function that works with any model
  function hover(gltf: GLTF, hoverDiv: HTMLDivElement) {
    // Simple rotation animation on hover instead of bone animation
    let isHovering = false;
    
    const onHoverFace = () => {
      if (!isHovering) {
        isHovering = true;
        // Simple rotation animation on hover
        gsap.to(character.rotation, { y: character.rotation.y + 0.5, duration: 0.5 });
      }
    };
    
    const onLeaveFace = () => {
      if (isHovering) {
        isHovering = false;
        // Return to original rotation
        gsap.to(character.rotation, { y: character.rotation.y - 0.5, duration: 0.5 });
      }
    };
    
    if (!hoverDiv) return;
    hoverDiv.addEventListener("mouseenter", onHoverFace);
    hoverDiv.addEventListener("mouseleave", onLeaveFace);
    
    return () => {
      hoverDiv.removeEventListener("mouseenter", onHoverFace);
      hoverDiv.removeEventListener("mouseleave", onLeaveFace);
    };
  }

  // Return the simplified animation functions
  return { mixer, startIntro, hover };
};

export default setAnimations;