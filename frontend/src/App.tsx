import { lazy, Suspense } from "react";
import "./App.css";

const CharacterModel = lazy(() => import("./components/character"));
const MainContainer = lazy(() => import("./components/MainContainer"));
import { LoadingProvider } from "./context/LoadingProvider";

const App = () => {
  return (
    <>
      <LoadingProvider>
        <Suspense fallback={<div>Loading main content...</div>}>
          <MainContainer>
            <Suspense fallback={<div>Loading 3D model...</div>}>
              <CharacterModel />
            </Suspense>
          </MainContainer>
        </Suspense>
      </LoadingProvider>
    </>
  );
};

export default App;