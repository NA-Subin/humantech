import { createContext, useContext, useEffect, useState } from "react";
import { initializeApp, getApp, getApps } from "firebase/app";
import { getDatabase } from "firebase/database";
import FullPageLoading from "../theme/Loading";
import DomainLogin from "../components/login/login-user/Login";

const ProjectFirebaseContext = createContext(null);

export const ProjectFirebaseProvider = ({ children }) => {
  const [firebaseApp, setFirebaseApp] = useState(null);
  const [firebaseDB, setFirebaseDB] = useState(null);
  const [domainKey, setDomainKey] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initFirebase = async () => {
      try {
        const raw = localStorage.getItem("domainData");
        if (!raw) {
          console.warn("⚠️ ไม่พบ domainData ใน localStorage");
          return;
        }

        const domainData = JSON.parse(raw);
        if (!domainData?.domainKey || !domainData?.config) {
          console.error("❌ domainData ไม่มีค่า domainKey หรือ config");
          return;
        }

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
      } catch (error) {
        console.error("❌ Error initializing Firebase project:", error);
      } finally {
        // ✅ เพิ่ม delay ก่อนปิดโหลด
        setTimeout(() => setLoading(false), 1200); // 1.2 วินาที
      }
    };

    initFirebase();
  }, []);

  // ✅ แสดงหน้าโหลดสวย ๆ
  if (loading) return <FullPageLoading />;

  // ✅ ตรวจว่า firebase โหลดครบ
  if (!firebaseApp || !firebaseDB) {
    return <div style={{ textAlign: "center", marginTop: "20px" }}><DomainLogin /></div>;
  }

  return (
    <ProjectFirebaseContext.Provider value={{ firebaseApp, firebaseDB, domainKey }}>
      {children}
    </ProjectFirebaseContext.Provider>
  );
};

export const useFirebase = () => useContext(ProjectFirebaseContext);