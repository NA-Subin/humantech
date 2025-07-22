import Cookies from "js-cookie";
import CryptoJS from "crypto-js";

const COOKIE_KEY = "auth_cookie";
const SECRET = "your-secret-key"; // ใช้ key แบบยาวพอสมควร เช่น 32-char

// Save Encrypted Cookie
export const saveEncryptedCookie = (data) => {
    const encrypted = CryptoJS.AES.encrypt(JSON.stringify(data), SECRET).toString();
    Cookies.set(COOKIE_KEY, encrypted, { expires: 7, secure: true, sameSite: "Strict" });
};

// Load & Decrypt Cookie
export const loadEncryptedCookie = () => {
    const encrypted = Cookies.get(COOKIE_KEY);
    if (!encrypted) return null;

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
