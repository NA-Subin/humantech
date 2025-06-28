// src/server/firebase.js
import { initializeApp, getApps } from 'firebase/app';
import { getDatabase } from 'firebase/database';
import {
  getAuth,
  GoogleAuthProvider,
  updateEmail,
  updatePassword,
} from 'firebase/auth';

const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  databaseURL: process.env.REACT_APP_FIREBASE_DATABASE_URL,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID,
  measurementId: process.env.REACT_APP_FIREBASE_MEASUREMENT_ID,
};

// ✅ ป้องกัน initialize ซ้ำ และตั้งชื่อ App ว่า "central"
const centralApp =
  getApps().find(app => app.name === 'central') ||
  initializeApp(firebaseConfig, 'central');

// ✅ ตั้งชื่อเหมือนเดิมเพื่อใช้กับโค้ดเก่าได้ทันที
const database = getDatabase(centralApp);
const auth = getAuth(centralApp);
const googleProvider = new GoogleAuthProvider();

// ✅ ฟังก์ชัน utility
const updateUserEmail = async (user, newEmail) => {
  await updateEmail(user, newEmail);
};

const updateUserPassword = async (user, newPassword) => {
  await updatePassword(user, newPassword);
};

export {
  database,          // ✅ ใช้ชื่อเดิม
  auth,              // ✅ ใช้ชื่อเดิม
  googleProvider,
  updateUserEmail,
  updateUserPassword,
};
