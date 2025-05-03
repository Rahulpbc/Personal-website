import { useEffect, useRef, useState } from "react";
import "./styles/Cursor.css";
import gsap from "gsap";

const Cursor = () => {
  const cursorRef = useRef<HTMLDivElement>(null);
  const [isActive, setIsActive] = useState(false); // Start as inactive until we confirm it should be active
  
  useEffect(() => {
    // Safety check - disable on mobile or if cursor element doesn't exist
    const isMobile = window.matchMedia("(max-width: 768px)").matches;
    if (isMobile || !cursorRef.current) {
      return; // Keep it inactive
    }
    
    // Activate the cursor only after we've confirmed it should be active
    setIsActive(true);
    
    let hover = false;
    let animationFrameId: number | null = null;
    const cursor = cursorRef.current;
    const mousePos = { x: 0, y: 0 };
    const cursorPos = { x: 0, y: 0 };
    
    // Initial positioning to prevent "jump" on first move
    cursorPos.x = window.innerWidth / 2;
    cursorPos.y = window.innerHeight / 2;
    
    // Mouse move handler with error handling
    const handleMouseMove = (e: MouseEvent) => {
      try {
        mousePos.x = e.clientX;
        mousePos.y = e.clientY;
      } catch (error) {
        console.error("Error tracking mouse position:", error);
      }
    };
    
    // Animation loop with improved error handling
    const loop = () => {
      try {
        if (!hover && cursor) {
          const delay = 6;
          cursorPos.x += (mousePos.x - cursorPos.x) / delay;
          cursorPos.y += (mousePos.y - cursorPos.y) / delay;
          
          // Use direct DOM manipulation instead of GSAP for better performance
          cursor.style.transform = `translate(${cursorPos.x}px, ${cursorPos.y}px)`;
        }
        animationFrameId = requestAnimationFrame(loop);
      } catch (error) {
        console.error("Error in cursor animation:", error);
        // Don't cancel animation frame - try to recover
        if (animationFrameId) {
          cancelAnimationFrame(animationFrameId);
          // Try to restart the loop after a short delay
          setTimeout(() => {
            animationFrameId = requestAnimationFrame(loop);
          }, 100);
        }
      }
    };
    
    // Initialize hover effects with simplified implementation
    const hoverElements = document.querySelectorAll("[data-cursor]");
    const hoverHandlers: { element: HTMLElement; over: any; out: any }[] = [];
    
    hoverElements.forEach((item) => {
      const element = item as HTMLElement;
      
      const handleMouseOver = (e: MouseEvent) => {
        try {
          if (!cursor) return;
          
          const target = e.currentTarget as HTMLElement;
          const cursorType = element.dataset.cursor;
          
          if (cursorType === "icons") {
            cursor.classList.add("hover"); // Use CSS class from your stylesheet
            const rect = target.getBoundingClientRect();
            cursor.style.transform = `translate(${rect.left}px, ${rect.top}px)`;
            hover = true;
          } else if (cursorType === "disable") {
            cursor.style.opacity = "0.2"; // Just reduce opacity instead of hiding
          } else {
            // Default hover effect
            cursor.classList.add("hover");
          }
        } catch (error) {
          console.error("Error in mouseover handler:", error);
        }
      };
      
      const handleMouseOut = () => {
        try {
          if (!cursor) return;
          cursor.classList.remove("hover");
          cursor.style.opacity = "1";
          hover = false;
        } catch (error) {
          console.error("Error in mouseout handler:", error);
        }
      };
      
      element.addEventListener("mouseover", handleMouseOver);
      element.addEventListener("mouseout", handleMouseOut);
      
      // Store handlers for cleanup
      hoverHandlers.push({
        element,
        over: handleMouseOver,
        out: handleMouseOut
      });
    });
    
    // Handle click effect
    const handleMouseDown = () => {
      if (cursor) cursor.classList.add("click");
    };
    
    const handleMouseUp = () => {
      if (cursor) cursor.classList.remove("click");
    };
    
    document.addEventListener("mousedown", handleMouseDown);
    document.addEventListener("mouseup", handleMouseUp);
    
    // Start everything
    document.addEventListener("mousemove", handleMouseMove);
    animationFrameId = requestAnimationFrame(loop);
    
    // Cleanup function
    return () => {
      // Make sure we clean up everything
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mousedown", handleMouseDown);
      document.removeEventListener("mouseup", handleMouseUp);
      
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
      
      // Remove all event listeners
      hoverHandlers.forEach(({ element, over, out }) => {
        element.removeEventListener("mouseover", over);
        element.removeEventListener("mouseout", out);
      });
    };
  }, []);

  // Don't render the cursor if it's not active
  if (!isActive) return null;
  
  return <div className="cursor" ref={cursorRef}></div>; // Use the class name from your CSS
};

export default Cursor;