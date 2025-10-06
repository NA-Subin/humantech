// src/context/LanguageContext.js
import React, { createContext, useState, useEffect } from "react";
import i18n from "./theme/i18n";

export const LanguageContext = createContext();

export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState("th");

  const changeLanguage = (lang) => {
    i18n.changeLanguage(lang);
    setLanguage(lang);
  };

  // ✅ ให้ i18n ใช้ภาษาไทยทันทีตอน mount
  useEffect(() => {
    i18n.changeLanguage("th");
  }, []);

  return (
    <LanguageContext.Provider value={{ language, changeLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
};
