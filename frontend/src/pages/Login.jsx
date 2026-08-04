import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const data = await login(form);
      navigate(data.user?.is_admin ? "/admin" : "/");
    } catch (err) {
      setError(err.response?.data?.error || "Login failed. Check your details and try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="page-wrap" style={{ maxWidth: 520 }}>
      <div className="auth-panel">
        <h2>Welcome back</h2>
        <p className="subtle">Login to manage your orders, track delivery, and keep browsing Gabba.</p>
        {error && <div className="error-banner">{error}</div>}
        <form onSubmit={handleSubmit} className="auth-form">
          <label>Email</label>
          <input name="email" type="email" value={form.email} onChange={handleChange} required />
          <label>Password</label>
          <input name="password" type="password" value={form.password} onChange={handleChange} required />
          <button className="btn btn-yellow" disabled={loading} style={{ width: "100%", marginTop: 20 }}>
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        <div className="divider-or">or</div>
        <button type="button" className="google-btn" onClick={() => window.alert("Google sign-in will be connected to your provider soon.")}> 
          Continue with Google
        </button>

        <p className="auth-foot">New to Gabba? <Link to="/signup">Create an account</Link></p>
      </div>
    </div>
  );
}
