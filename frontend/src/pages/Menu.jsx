import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import api from "../api/api.js";
import OnlineOrders from "../components/OnlineOrders.jsx";

export default function Menu() {
  const location = useLocation();
  const [items, setItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [activeCategory, setActiveCategory] = useState("All");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function load() {
      try {
        const [menuRes, catRes] = await Promise.all([api.get("/menu"), api.get("/menu/categories")]);
        setItems(menuRes.data);
        setCategories(["All", ...catRes.data]);
      } catch (err) {
        setError("Unable to load the menu right now. Please refresh.");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  useEffect(() => {
    if (location.state?.scrollTo) {
      const element = document.getElementById(location.state.scrollTo);
      if (element) element.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [location.state]);

  const filteredItems = activeCategory === "All" ? items : items.filter((item) => item.category === activeCategory);

  return (
    <main className="menu-page page-wrap">
      <section className="menu-hero menu-hero--clean">
        <div className="menu-hero-copy">
          <span className="hero-badge">Explore the Menu</span>
          <h1>Pick your craving. We'll handle the rest.</h1>
          <p>Loaded burgers, crispy sides, and drinks to wash it all down — order in a tap, ready fast.</p>
          <div className="menu-hero-tags">
            <span className="label-pill">Best seller</span>
            <span className="label-pill">Express pickup</span>
            <span className="label-pill">Veg-friendly</span>
          </div>
        </div>
      </section>

      <section className="category-bar menu-category-bar">
        {categories.map((category) => (
          <button
            key={category}
            className={`category-chip ${activeCategory === category ? "active" : ""}`}
            onClick={() => setActiveCategory(category)}
          >
            {category}
          </button>
        ))}
      </section>

      {error && <div className="error-banner">{error}</div>}
      {loading ? (
        <p className="loading-state">Loading the menu...</p>
      ) : (
        <OnlineOrders items={filteredItems} />
      )}
    </main>
  );
}