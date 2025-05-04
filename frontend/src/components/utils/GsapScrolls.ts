import * as THREE from "three";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

// Initialize GSAP setup - called once when app starts
export function initializeGsap() {
  // Kill all ScrollTrigger instances to prevent stale references
  ScrollTrigger.getAll().forEach(trigger => trigger.kill());
  
  // Clear any other GSAP animations that might be running
  gsap.globalTimeline.clear();
  
  console.log("GSAP ScrollTrigger instances cleared and reinitialized");
}

// Character timeline setup - this function is called with the character model
export function setCharTimeline(
  character: THREE.Object3D<THREE.Object3DEventMap> | null,
  camera: THREE.PerspectiveCamera
) {
  // Early return if no character or camera
  if (!character || !camera) {
    console.warn("Character or camera is missing, cannot set timeline");
    return;
  }
  
  console.log("Setting up character timeline");
  
  // Create a random intensity for screen light effect
  let intensity: number = 0;
  const intensityInterval = setInterval(() => {
    intensity = Math.random();
  }, 200);
  
  // Landing section animations
  const landingSection = document.querySelector(".landing-section");
  if (landingSection) {
    const tl1 = gsap.timeline({
      scrollTrigger: {
        trigger: landingSection,
        start: "top top",
        end: "bottom top",
        scrub: true,
        invalidateOnRefresh: true,
      },
    });
    
    tl1.fromTo(character.rotation, { y: 0 }, { y: 0.7, duration: 1 }, 0)
       .to(camera.position, { z: 22 }, 0);
    
    // Only animate DOM elements if they exist
    const characterModel = document.querySelector(".character-model");
    if (characterModel) {
      tl1.fromTo(characterModel, { x: 0 }, { x: "-25%", duration: 1 }, 0);
    }
    
    const landingContainer = document.querySelector(".landing-container");
    if (landingContainer) {
      tl1.to(landingContainer, { opacity: 0, duration: 0.4 }, 0)
         .to(landingContainer, { y: "40%", duration: 0.8 }, 0);
    }
    
    const aboutMe = document.querySelector(".about-me");
    if (aboutMe) {
      tl1.fromTo(aboutMe, { y: "-50%" }, { y: "0%" }, 0);
    }
  }
  
  // About section animations
  const aboutSection = document.querySelector(".about-section");
  if (aboutSection) {
    const tl2 = gsap.timeline({
      scrollTrigger: {
        trigger: aboutSection,
        start: "center 55%",
        end: "bottom top",
        scrub: true,
        invalidateOnRefresh: true,
      },
    });
    
    // Prepare elements that need animation
    let screenLight: THREE.Object3D | null = null;
    let monitor: THREE.Object3D | null = null;
    
    // Find screen light and monitor in the character model
    character.traverse((object: any) => {
      if (object.name === "Plane004") {
        object.children.forEach((child: any) => {
          if (child.material) {
            child.material.transparent = true;
            child.material.opacity = 0;
            if (child.material.name === "Material.027") {
              monitor = child;
              child.material.color.set("#FFFFFF");
            }
          }
        });
      }
      if (object.name === "screenlight" && object.material) {
        object.material.transparent = true;
        object.material.opacity = 0;
        object.material.emissive.set("#C8BFFF");
        gsap.timeline({ repeat: -1, repeatRefresh: true }).to(object.material, {
          emissiveIntensity: () => intensity * 8,
          duration: () => Math.random() * 0.6,
          delay: () => Math.random() * 0.1,
        });
        screenLight = object;
      }
    });
    
    // Get neck bone with null check
    const neckBone = character.getObjectByName("spine005");
    
    // Only add animations if we're on desktop
    if (window.innerWidth > 1024) {
      // Camera and character animations
      const tl2Setup = tl2
        .to(camera.position, { z: 75, y: 8.4, duration: 6, delay: 2, ease: "power3.inOut" }, 0)
        .to(character.rotation, { y: 0.92, x: 0.12, delay: 3, duration: 3 }, 0);
      
      // DOM element animations if they exist
      if (aboutSection) {
        tl2Setup
          .to(aboutSection, { y: "30%", duration: 6 }, 0)
          .to(aboutSection, { opacity: 0, delay: 3, duration: 2 }, 0);
      }
      
      // Character model animations if the element exists
      const characterModel = document.querySelector(".character-model");
      if (characterModel) {
        tl2Setup.fromTo(
          characterModel,
          { pointerEvents: "inherit" },
          { pointerEvents: "none", x: "-12%", delay: 2, duration: 5 },
          0
        );
      }
      
      // Neck bone animation if it exists
      if (neckBone && (neckBone as any).rotation) {
        tl2Setup.to((neckBone as any).rotation, { x: 0.6, delay: 2, duration: 3 }, 0);
      }
      
      // Monitor material animation if it exists
      if (monitor && (monitor as any).material) {
        tl2Setup.to((monitor as any).material, { opacity: 1, duration: 0.8, delay: 3.2 }, 0);
      }
      
      // Screen light material animation if it exists
      if (screenLight && (screenLight as any).material) {
        tl2Setup.to((screenLight as any).material, { opacity: 1, duration: 0.8, delay: 4.5 }, 0);
      }
    }
  }
}

// Set up all other non-character animations
export function setAllTimeline() {
  console.log("Setting up general animations");
  
  // Ensure DOM is ready before setting up animations
  if (typeof document === 'undefined') {
    console.warn("Document not defined, cannot set animations");
    return;
  }
  
  // Career section animations
  const careerSection = document.querySelector(".career-section");
  if (careerSection) {
    const careerTimeline = gsap.timeline({
      scrollTrigger: {
        trigger: careerSection,
        start: "top 30%",
        end: "100% center",
        scrub: true,
        invalidateOnRefresh: true,
      },
    });
    
    // Career timeline animation if it exists
    const careerTimelineElement = document.querySelector(".career-timeline");
    if (careerTimelineElement) {
      careerTimeline
        .fromTo(
          careerTimelineElement,
          { maxHeight: "10%" },
          { maxHeight: "100%", duration: 0.5 },
          0
        )
        .fromTo(
          careerTimelineElement,
          { opacity: 0 },
          { opacity: 1, duration: 0.1 },
          0
        );
    }
    
    // Career info boxes animation if they exist
    const careerInfoBoxes = document.querySelectorAll(".career-info-box");
    if (careerInfoBoxes.length > 0) {
      careerTimeline.fromTo(
        careerInfoBoxes,
        { opacity: 0 },
        { opacity: 1, stagger: 0.1, duration: 0.5 },
        0
      );
    }
    
    // Career dots animation if they exist
    const careerDots = document.querySelectorAll(".career-dot");
    if (careerDots.length > 0) {
      careerTimeline.fromTo(
        careerDots,
        { animationIterationCount: "infinite" },
        {
          animationIterationCount: "1",
          delay: 0.3,
          duration: 0.1,
        },
        0
      );
    }
    
    // Responsive career section animation
    if (window.innerWidth > 1024) {
      careerTimeline.fromTo(
        careerSection,
        { y: 0 },
        { y: "20%", duration: 0.5, delay: 0.2 },
        0
      );
    } else {
      careerTimeline.fromTo(
        careerSection,
        { y: 0 },
        { y: 0, duration: 0.5, delay: 0.2 },
        0
      );
    }
  }
  
  // Hero section animations if it exists
  const heroSection = document.querySelector(".hero-section");
  if (heroSection) {
    const heroTimeline = gsap.timeline({
      scrollTrigger: {
        trigger: heroSection,
        start: "top top",
        end: "bottom top",
        scrub: true,
        invalidateOnRefresh: true,
      },
    });
    
    // Hero title animation if it exists
    const heroTitle = document.querySelector(".hero-main-title");
    if (heroTitle) {
      heroTimeline.to(heroTitle, { y: -50, opacity: 0 }, 0);
    }
    
    // Hero description animation if it exists
    const heroDesc = document.querySelector(".hero-main-desc");
    if (heroDesc) {
      heroTimeline.to(heroDesc, { y: -50, opacity: 0 }, 0);
    }
  }
}