import { createContext, useContext, useEffect, useState } from "react";
import { initializeApp, getApp, getApps } from "firebase/app";
import { getDatabase } from "firebase/database";

const ProjectFirebaseContext = createContext(null);

export const ProjectFirebaseProvider = ({ children }) => {
  const [firebaseApp, setFirebaseApp] = useState(null);
  const [firebaseDB, setFirebaseDB] = useState(null);
  const [domainKey, setDomainKey] = useState(null);

  useEffect(() => {
    const raw = localStorage.getItem("domainData");
    if (!raw) return;

    const domainData = JSON.parse(raw);
    const appName = domainData.domainKey;

    let app;
    if (!getApps().some((a) => a.name === appName)) {
      app = initializeApp(domainData.config, appName);
      console.log("✅ Initialized Firebase app:", appName);
    } else {
      app = getApp(appName);
    }

    const db = getDatabase(app);
    setFirebaseApp(app);
    setFirebaseDB(db);
    setDomainKey(appName);
  }, []);

  return (
    <ProjectFirebaseContext.Provider value={{ firebaseApp, firebaseDB, domainKey }}>
      {children}
    </ProjectFirebaseContext.Provider>
  );
};

export const useFirebase = () => useContext(ProjectFirebaseContext);