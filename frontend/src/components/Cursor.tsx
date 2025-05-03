import { useEffect, useRef, useState } from "react";
import "./styles/Cursor.css";
import gsap from "gsap";

const Cursor = () => {
  const cursorRef = useRef<HTMLDivElement>(null);
  const [isActive, setIsActive] = useState(true);
  
  useEffect(() => {
    // Safety check - disable on mobile or if cursor element doesn't exist
    const isMobile = window.matchMedia("(max-width: 768px)").matches;
    if (isMobile || !cursorRef.current) {
      setIsActive(false);
      return;
    }
    
    let hover = false;
    let animationFrameId: number;
    const cursor = cursorRef.current;
    const mousePos = { x: 0, y: 0 };
    const cursorPos = { x: 0, y: 0 };
    
    // Mouse move handler
    const handleMouseMove = (e: MouseEvent) => {
      mousePos.x = e.clientX;
      mousePos.y = e.clientY;
    };
    
    // Animation loop with error handling
    const loop = () => {
      try {
        if (!hover && cursor) {
          const delay = 6;
          cursorPos.x += (mousePos.x - cursorPos.x) / delay;
          cursorPos.y += (mousePos.y - cursorPos.y) / delay;
          gsap.to(cursor, { x: cursorPos.x, y: cursorPos.y, duration: 0.1 });
        }
        animationFrameId = requestAnimationFrame(loop);
      } catch (error) {
        console.error("Error in cursor animation:", error);
        cancelAnimationFrame(animationFrameId);
      }
    };
    
    // Initialize hover effects
    const hoverElements = document.querySelectorAll("[data-cursor]");
    const hoverHandlers: { element: HTMLElement; over: any; out: any }[] = [];
    
    hoverElements.forEach((item) => {
      const element = item as HTMLElement;
      
      const handleMouseOver = (e: MouseEvent) => {
        try {
          if (!cursor) return;
          
          const target = e.currentTarget as HTMLElement;
          const rect = target.getBoundingClientRect();

          if (element.dataset.cursor === "icons") {
            cursor.classList.add("cursor-icons");
            gsap.to(cursor, { x: rect.left, y: rect.top, duration: 0.1 });
            cursor.style.setProperty("--cursorH", `${rect.height}px`);
            hover = true;
          }
          if (element.dataset.cursor === "disable") {
            cursor.classList.add("cursor-disable");
          }
        } catch (error) {
          console.error("Error in mouseover handler:", error);
        }
      };
      
      const handleMouseOut = () => {
        try {
          if (!cursor) return;
          cursor.classList.remove("cursor-disable", "cursor-icons");
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
    
    // Start everything
    document.addEventListener("mousemove", handleMouseMove);
    animationFrameId = requestAnimationFrame(loop);
    
    // Cleanup function
    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      cancelAnimationFrame(animationFrameId);
      
      // Remove all event listeners
      hoverHandlers.forEach(({ element, over, out }) => {
        element.removeEventListener("mouseover", over);
        element.removeEventListener("mouseout", out);
      });
    };
  }, []);

  // Don't render the cursor if it's not active
  if (!isActive) return null;
  
  return <div className="cursor-main" ref={cursorRef}></div>;
};

export default Cursor;