// App.js
import React from "react";
import { BrowserRouter } from "react-router-dom";
import AppRouter from "./AppRouter";
import { ProjectFirebaseProvider } from "./server/ProjectFirebaseContext";

const App = () => {
  return (
    <BrowserRouter>
      <ProjectFirebaseProvider>
        <AppRouter />
      </ProjectFirebaseProvider>
    </BrowserRouter>
  );
};

export default App;
