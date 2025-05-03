// Simple utility to log errors in production
const isProduction = import.meta.env.PROD;

// Create a global error handler
export const setupGlobalErrorHandling = () => {
  if (typeof window !== 'undefined') {
    // Keep track of previous handler
    const originalOnError = window.onerror;
    
    // Override window.onerror
    window.onerror = function(message, source, lineno, colno, error) {
      logError('Uncaught error', { message, source, lineno, colno, error });
      
      // Call original handler if it exists
      if (originalOnError) {
        return originalOnError.apply(this, arguments as any);
      }
      
      // Don't prevent default handling
      return false;
    };
    
    // Handle unhandled promise rejections
    window.addEventListener('unhandledrejection', function(event) {
      logError('Unhandled promise rejection', { 
        reason: event.reason,
        promise: event.promise
      });
    });
    
    // Log initial load
    logInfo('Application initialized');
  }
};

// Log error with visual indicator in production
export const logError = (message: string, data?: any) => {
  console.error(`[ERROR] ${message}`, data);
  
  // In production, also show a visual indicator
  if (isProduction) {
    try {
      // Create or update error display element
      let errorDisplay = document.getElementById('production-error-display');
      
      if (!errorDisplay) {
        errorDisplay = document.createElement('div');
        errorDisplay.id = 'production-error-display';
        errorDisplay.style.position = 'fixed';
        errorDisplay.style.bottom = '10px';
        errorDisplay.style.right = '10px';
        errorDisplay.style.backgroundColor = 'rgba(255, 0, 0, 0.8)';
        errorDisplay.style.color = 'white';
        errorDisplay.style.padding = '10px';
        errorDisplay.style.borderRadius = '5px';
        errorDisplay.style.zIndex = '9999';
        errorDisplay.style.maxHeight = '200px';
        errorDisplay.style.overflowY = 'auto';
        errorDisplay.style.maxWidth = '80%';
        errorDisplay.style.fontSize = '12px';
        errorDisplay.style.fontFamily = 'monospace';
        document.body.appendChild(errorDisplay);
      }
      
      const errorItem = document.createElement('div');
      errorItem.style.marginBottom = '5px';
      errorItem.textContent = `${new Date().toISOString()}: ${message}`;
      errorDisplay.appendChild(errorItem);
      
      if (data) {
        const errorData = document.createElement('pre');
        errorData.style.margin = '0 0 10px 0';
        errorData.style.fontSize = '10px';
        errorData.textContent = JSON.stringify(data, null, 2);
        errorDisplay.appendChild(errorData);
      }
    } catch (e) {
      // If we can't show the visual indicator, at least log that error too
      console.error('Failed to display error indicator', e);
    }
  }
};

// Log info message
export const logInfo = (message: string, data?: any) => {
  console.log(`[INFO] ${message}`, data || '');
};

// Log warning message
export const logWarning = (message: string, data?: any) => {
  console.warn(`[WARNING] ${message}`, data || '');
};
