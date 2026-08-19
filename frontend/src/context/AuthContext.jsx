// import React, { createContext, useContext, useEffect, useState } from "react";
// import api from "../api/api.js";

// const AuthContext = createContext(null);
// const STORAGE_KEY = "gabba_token";

// export function AuthProvider({ children }) {
//   const [user, setUser] = useState(null);
//   const [loading, setLoading] = useState(false);

//   useEffect(() => {
//     const token = localStorage.getItem(STORAGE_KEY);
//     if (!token) return;

//     setLoading(true);
//     api
//       .get("/auth/me")
//       .then((res) => setUser(res.data.user))
//       .catch(() => {
//         localStorage.removeItem(STORAGE_KEY);
//         setUser(null);
//       })
//       .finally(() => setLoading(false));
//   }, []);

//   async function login(payload) {
//     const res = await api.post("/auth/login", payload);
//     localStorage.setItem(STORAGE_KEY, res.data.token);
//     setUser(res.data.user);
//     return res.data;
//   }

//   async function register(payload) {
//     const res = await api.post("/auth/register", payload);
//     localStorage.setItem(STORAGE_KEY, res.data.token);
//     setUser(res.data.user);
//     return res.data;
//   }

//   function logout() {
//     localStorage.removeItem(STORAGE_KEY);
//     setUser(null);
//   }

//   return (
//     <AuthContext.Provider value={{ user, loading, login, register, logout }}>
//       {children}
//     </AuthContext.Provider>
//   );
// }

// export function useAuth() {
//   const ctx = useContext(AuthContext);
//   if (!ctx) throw new Error("useAuth must be used within AuthProvider");
//   return ctx;
// }





import React, { createContext, useContext, useEffect, useState } from "react";
import api from "../api/api.js";

const AuthContext = createContext(null);
const STORAGE_KEY = "gabba_token";

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);

  // IMPORTANT: start with true while checking saved token
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem(STORAGE_KEY);

    if (!token) {
      setLoading(false);
      return;
    }

    api
      .get("/auth/me")
      .then((res) => {
        console.log("Logged-in user:", res.data.user);
        setUser(res.data.user);
      })
      .catch((err) => {
        console.error("Auth check failed:", err);

        localStorage.removeItem(STORAGE_KEY);
        setUser(null);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  async function login(payload) {
    const res = await api.post("/auth/login", payload);

    console.log("Login response:", res.data);
    console.log("Admin status:", res.data.user?.is_admin);

    localStorage.setItem(STORAGE_KEY, res.data.token);

    setUser(res.data.user);

    return res.data;
  }

  async function register(payload) {
    const res = await api.post("/auth/register", payload);

    localStorage.setItem(STORAGE_KEY, res.data.token);

    setUser(res.data.user);

    return res.data;
  }

  function logout() {
    localStorage.removeItem(STORAGE_KEY);
    setUser(null);
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);

  if (!ctx) {
    throw new Error("useAuth must be used within AuthProvider");
  }

  return ctx;
}