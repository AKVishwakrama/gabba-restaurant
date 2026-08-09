import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
// import GoogleSignIn from "../components/GoogleSignIn.jsx";

export default function Signup() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", password: "", phone: "", address: "" });
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
      const payload = {
        ...form,
        email: form.email.trim().toLowerCase(),
      };
      await register(payload);
      navigate("/");
    } catch (err) {
      setError(err.response?.data?.error || "Signup failed. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="page-wrap" style={{ maxWidth: 520 }}>
      <div className="auth-panel">
        <h2>Sign up for delivery</h2>
        <p className="subtle">Create your Gabba account to save delivery details and order faster.</p>
        {error && <div className="error-banner">{error}</div>}
        <form onSubmit={handleSubmit} className="auth-form">
          <label>Name</label>
          <input name="name" value={form.name} onChange={handleChange} required />
          <label>Email</label>
          <input name="email" type="email" value={form.email} onChange={handleChange} required />
          <label>Password</label>
          <input name="password" type="password" value={form.password} onChange={handleChange} required />
          <label>Phone</label>
          <input name="phone" value={form.phone} onChange={handleChange} placeholder="+91XXXXXXXXXX" />
          <label>Address</label>
          <textarea name="address" value={form.address} onChange={handleChange} rows={3} placeholder="Your home area" />
          <button className="btn btn-yellow" disabled={loading} style={{ width: "100%", marginTop: 20 }}>
            {loading ? "Creating account..." : "Create account"}
          </button>
        </form>

        <div className="divider-or">or</div>
        

        <p className="auth-foot">Already have an account? <Link to="/login">Login</Link></p>
      </div>
    </div>
  );
}
