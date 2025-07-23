import Cookies from "js-cookie";
import CryptoJS from "crypto-js";

const COOKIE_KEY = "auth_cookie";

// ✅ ใช้ key จาก .env
const SECRET = process.env.REACT_APP_ENCRYPT_SECRET;

if (!SECRET) {
    console.warn("❗️ENV: REACT_APP_ENCRYPT_SECRET is not defined.");
}

// Save Encrypted Cookie
export const saveEncryptedCookie = (data) => {
    if (!SECRET) return;

    const encrypted = CryptoJS.AES.encrypt(JSON.stringify(data), SECRET).toString();
    Cookies.set(COOKIE_KEY, encrypted, { expires: 7, secure: true, sameSite: "Strict" });
};

// Load & Decrypt Cookie
export const loadEncryptedCookie = () => {
    const encrypted = Cookies.get(COOKIE_KEY);
    if (!encrypted || !SECRET) return null;

    try {
        const bytes = CryptoJS.AES.decrypt(encrypted, SECRET);
        const decrypted = bytes.toString(CryptoJS.enc.Utf8);
        return JSON.parse(decrypted);
    } catch (error) {
        return null;
    }
};

// Remove Cookie
export const clearCookie = () => {
    Cookies.remove(COOKIE_KEY);
};
