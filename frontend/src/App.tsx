import { lazy, Suspense, useEffect } from "react";
import "./App.css";
import ErrorBoundary from "./components/ErrorBoundary";
import { initialFX } from "./components/utils/initialFX";
import { initializeGsap } from "./components/utils/GsapScrolls";
import MainContainer from "./components/MainContainer";
import { LoadingProvider } from "./context/LoadingProvider";
import Work from "./components/Work";
import Loading from "./components/Loading";

// Eagerly import the character model for better reliability
const CharacterModel = lazy(() => import("./components/character"));

// Custom error fallback component with minimal styling
const ErrorFallback = () => (
  <div style={{ 
    padding: '20px', 
    margin: '20px auto', 
    maxWidth: '800px',
    backgroundColor: '#f8f9fa',
    border: '1px solid #ddd',
    borderRadius: '8px',
    textAlign: 'center',
    fontFamily: 'Arial, sans-serif'
  }}>
    <h2>Something went wrong</h2>
    <p>We're sorry, but there was an error loading this page.</p>
    <p>Try refreshing the browser or check the console for more details.</p>
    <button 
      onClick={() => window.location.reload()}
      style={{
        marginTop: '15px',
        padding: '10px 20px',
        backgroundColor: '#4285f4',
        color: 'white',
        border: 'none',
        borderRadius: '4px',
        cursor: 'pointer',
        fontSize: '16px'
      }}
    >
      Reload Page
    </button>
  </div>
);

const App = () => {
  // Initialize GSAP and clear any stale animations when the app mounts
  useEffect(() => {
    console.log("App mounted, initializing GSAP...");
    // Initialize GSAP animations
    initializeGsap();
    // Run the initialFX function to set up initial animations
    if (initialFX) initialFX();
    
    // Only perform 3D-related operations on desktop
    const isDesktop = window.innerWidth > 1024;
    
    // Force tech stack to be visible on all devices, but character only on desktop
    const forceRepaint = () => {
      console.log("Forcing repaint of elements");
      
      // Only handle character on desktop
      if (isDesktop) {
        const characterContainer = document.querySelector(".character-container");
        if (characterContainer) {
          characterContainer.classList.add("force-visible");
          console.log("Character container made visible");
        }
      }
      
      // Force tech stack visibility on all devices
      const techStack = document.getElementById("tech-stack");
      if (techStack) {
        techStack.style.visibility = 'visible';
        techStack.style.opacity = '1';
        console.log("Tech stack made visible");
      }
      
      // Force tech stack canvas to be visible on all devices
      document.querySelectorAll('#tech-stack canvas').forEach(canvas => {
        // Cast to HTMLElement to access style property
        const canvasElement = canvas as HTMLElement;
        canvasElement.style.display = 'block';
        canvasElement.style.visibility = 'visible';
      });
    };
    
    // Run the repaint after components have mounted
    setTimeout(forceRepaint, 1000);
    // Run again after loading is likely complete
    setTimeout(forceRepaint, 3000);
    
    // Clean up on unmount
    return () => {
      console.log("App unmounting, cleaning up GSAP...");
      // ScrollTrigger.getAll().forEach(t => t.kill());
    };
  }, []);

  return (
    <ErrorBoundary fallback={<ErrorFallback />}>
      <LoadingProvider>
        <Suspense fallback={<div>Loading main content...</div>}>
          <MainContainer>
            <Suspense fallback={<div>Loading 3D model...</div>}>
              <CharacterModel />
            </Suspense>
          </MainContainer>
        </Suspense>
      </LoadingProvider>
    </ErrorBoundary>
  );
};

export default App;