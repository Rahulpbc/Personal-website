import { lazy, Suspense } from "react";
import "./App.css";
import ErrorBoundary from "./components/ErrorBoundary";

const CharacterModel = lazy(() => import("./components/character"));
const MainContainer = lazy(() => import("./components/MainContainer"));
import { LoadingProvider } from "./context/LoadingProvider";

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