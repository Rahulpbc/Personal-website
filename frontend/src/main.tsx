import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import { setupGlobalErrorHandling, logError } from "./utils/debugLogger";

// Set up global error handling as early as possible
setupGlobalErrorHandling();

// Wrap the main rendering in a try-catch to catch any initialization errors
try {
  const rootElement = document.getElementById("root");
  
  if (!rootElement) {
    throw new Error("Root element not found");
  }
  
  createRoot(rootElement).render(
    <StrictMode>
      <App />
    </StrictMode>
  );
  
  // Log successful render
  console.log("Application successfully rendered");
} catch (error) {
  // Log any errors during initialization
  logError("Failed to initialize application", error);
  
  // Create a fallback UI if rendering fails completely
  const rootElement = document.getElementById("root") || document.body;
  rootElement.innerHTML = `
    <div style="padding: 20px; margin: 20px; text-align: center;">
      <h2>Something went wrong</h2>
      <p>We're sorry, but there was an error loading the application.</p>
      <button onclick="window.location.reload()" style="padding: 10px 20px; margin-top: 15px;">
        Reload Page
      </button>
    </div>
  `;
}