import { signOut } from "firebase/auth";
import { auth } from "./firebase";
import { clearCookie } from "./cookieUtils";

export const logout = async (navigate) => {
  try {
    await signOut(auth);       // ออกจาก Firebase Auth
  } catch (err) {
    console.error("Logout error:", err);
  }

  clearCookie();
  localStorage.clear();
  navigate("/");
};
