import { useSyncExternalStore } from "react";
import { jwtDecode } from "jwt-decode";

const TOKEN_KEY = "token";
const AUTH_EVENT = "auth-change";

// Simpan atau hapus token, lalu beri tahu semua komponen yang memakai useAuth
export const setToken = (token) => {
  if (token) localStorage.setItem(TOKEN_KEY, token);
  else localStorage.removeItem(TOKEN_KEY);
  window.dispatchEvent(new Event(AUTH_EVENT));
};

const subscribe = (callback) => {
  window.addEventListener(AUTH_EVENT, callback);
  window.addEventListener("storage", callback);
  return () => {
    window.removeEventListener(AUTH_EVENT, callback);
    window.removeEventListener("storage", callback);
  };
};

const getToken = () => localStorage.getItem(TOKEN_KEY);

export function useAuth() {
  const token = useSyncExternalStore(subscribe, getToken);

  let user = null;
  if (token) {
    try {
      user = jwtDecode(token);
    } catch {
      user = null;
    }
  }

  return { token, user, isLoggedIn: Boolean(token) };
}
