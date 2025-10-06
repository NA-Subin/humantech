// App.js
import React from "react";
import { BrowserRouter } from "react-router-dom";
import AppRouter from "./AppRouter";
// import { ProjectFirebaseProvider } from "./server/ProjectFirebaseContext";
import { LanguageProvider } from "./LanguageContext";

const App = () => {
  return (
    <BrowserRouter>
      {/* <ProjectFirebaseProvider> */}
        <LanguageProvider>
          <AppRouter />
        </LanguageProvider>
      {/* </ProjectFirebaseProvider> */}
    </BrowserRouter>
  );
};

export default App;
