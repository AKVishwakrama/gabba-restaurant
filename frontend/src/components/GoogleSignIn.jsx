import React, { useEffect } from "react";
import api from "../api/api.js";

export default function GoogleSignIn() {
  useEffect(() => {
    const scriptId = "google-signin-script";
    if (document.getElementById(scriptId)) return;
    const s = document.createElement("script");
    s.src = "https://accounts.google.com/gsi/client";
    s.id = scriptId;
    s.async = true;
    s.defer = true;
    document.body.appendChild(s);
    s.onload = () => {
      if (!window.google) return;
      window.google.accounts.id.initialize({
        client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID || window.__GAPI_CLIENT_ID || "",
        callback: handleCredentialResponse,
      });
      window.google.accounts.id.renderButton(document.getElementById("google-signin-btn"), {
        theme: "outline",
        size: "small",
      });
    };
  }, []);

  async function handleCredentialResponse(res) {
    if (!res?.credential) return;
    try {
      const r = await api.post("/auth/google", { id_token: res.credential });
      if (r.data?.token) {
        localStorage.setItem("gabba_token", r.data.token);
        // reload so AuthProvider picks up the token
        window.location.reload();
      }
    } catch (err) {
      console.error("Google sign-in failed", err);
      alert("Google sign-in failed.\nCheck console for details.");
    }
  }

  return <div id="google-signin-btn" style={{ display: "inline-block" }} />;
}
