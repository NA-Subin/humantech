// src/i18n.js
import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";

import addemployee_th from "../locales/attendantTH/AddEmployee.json";
import addemployee_en from "../locales/attendantEN/AddEmployee.json";

import employee_th from "../locales/attendantTH/Employee.json";
import employee_en from "../locales/attendantEN/Employee.json";

import time_th from "../locales/attendantTH/TimeAttendant.json";
import time_en from "../locales/attendantEN/TimeAttendant.json";

import calculate_th from "../locales/attendantTH/Calculate.json";
import calculate_en from "../locales/attendantEN/Calculate.json";

import AddLeave_th from "../locales/attendantTH/AddLeave.json";
import AddLeave_en from "../locales/attendantEN/AddLeave.json";

i18n
    .use(LanguageDetector) // auto detect ภาษา
    .use(initReactI18next)
    .init({
        resources: {
            th: {
                translation: {
                    ...addemployee_th,
                    ...employee_th,
                    ...time_th,
                    ...calculate_th,
                    ...AddLeave_th
                }
            },
            en: {
                translation: {
                    ...addemployee_en,
                    ...employee_en,
                    ...time_en,
                    ...calculate_en,
                    ...AddLeave_en
                }
            }
        },
        fallbackLng: "th",
        interpolation: {
            escapeValue: false
        }
    });

export default i18n;
