import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import api from "../api/api.js";
import Hero from "../components/Hero.jsx";
import ShopPhotos from "../components/ShopPhotos.jsx";
import OnlineOrders from "../components/OnlineOrders.jsx";

const fallbackItems = [
  {
    id: "burger-01",
    name: "Classic Bite Burger",
    description: "A bold vegetarian burger with spicy sauce and cheese.",
    price: 199,
    category: "Burgers",
    image_url: "/burger.jpg",
    is_veg: true,
    is_bestseller: true,
  },
  {
    id: "fries-01",
    name: "Peri Peri Fries",
    description: "Crispy fries tossed in hot peri peri seasoning.",
    price: 129,
    category: "Fries",
    image_url: "/fries.jpg",
    is_veg: true,
    is_bestseller: false,
  },
  {
    id: "meal-01",
    name: "Crispy Veg Combo",
    description: "Burger, fries, and drink for the perfect quick meal.",
    price: 299,
    category: "Combos",
    image_url: "/shop2.jpg",
    is_veg: true,
    is_bestseller: false,
  },
];

export default function Home() {
  const location = useLocation();
  const [items, setItems] = useState(fallbackItems);
  const [categories, setCategories] = useState(["All", "Burgers", "Fries", "Combos"]);
  const [activeCategory, setActiveCategory] = useState("All");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [menuRes, catRes] = await Promise.all([api.get("/menu"), api.get("/menu/categories")]);
        setItems(menuRes.data.length ? menuRes.data : fallbackItems);
        setCategories(["All", ...(catRes.data.length ? catRes.data : ["Burgers", "Fries", "Combos"]) ]);
      } catch (err) {
        setItems(fallbackItems);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  useEffect(() => {
    if (location.state?.scrollTo) {
      const element = document.getElementById(location.state.scrollTo);
      if (element) {
        element.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }
  }, [location.state]);

  const filteredItems = activeCategory === "All" ? items : items.filter((item) => item.category === activeCategory);

  return (
    <>
      <Hero />
      <section className="marquee-strip" aria-hidden="true">
        <div className="marquee-track">
          <span>GABA GRAB A BITE • QUICK BITES • BOLD FLAVORS • FAST VEGETARIAN FAST FOOD • PROFESSIONALS • STUDENTS</span>
          <span>GABA GRAB A BITE • QUICK BITES • BOLD FLAVORS • FAST VEGETARIAN FAST FOOD • PROFESSIONALS • STUDENTS</span>
        </div>
      </section>

      <section className="feature-strip feature-strip--wide">
        <div className="feature-card">
          <strong>Fast service</strong>
          <span>Designed for busy urban diners and quick delivery cravings.</span>
        </div>
        <div className="feature-card">
          <strong>Premium burgers</strong>
          <span>Vegetarian gourmet burgers hand-crafted to order.</span>
        </div>
        <div className="feature-card">
          <strong>Bold flavors</strong>
          <span>Fresh sauces, spicy sides and loud taste in every bite.</span>
        </div>
      </section>

      <section className="order-section" id="menu">
        <div className="order-header">
          <div>
            <span className="hero-badge">The bite selection</span>
            <h2>Quick bites, bold flavors.</h2>
            <p>
              Fast, professional vegetarian burgers for the modern urban professional.
              Experience bold flavors and convenience in every bite.
            </p>
          </div>
          <div className="order-links">
            <button className="nav-link" type="button" onClick={() => setActiveCategory("All")}>All</button>
            <button className="nav-link" type="button" onClick={() => setActiveCategory("Burgers")}>Burgers</button>
            <button className="nav-link" type="button" onClick={() => setActiveCategory("Fries")}>Fries</button>
            <button className="nav-link" type="button" onClick={() => setActiveCategory("Combos")}>Combos</button>
          </div>
        </div>

        <div className="category-bar category-bar--compact">
          {categories.map((category) => (
            <button
              key={category}
              className={`category-chip ${activeCategory === category ? "active" : ""}`}
              onClick={() => setActiveCategory(category)}
            >
              {category}
            </button>
          ))}
        </div>

        {loading ? (
          <p className="loading-state">Loading menu...</p>
        ) : (
          <OnlineOrders items={filteredItems} />
        )}
      </section>

      <section className="bite-selection">
        <div className="bite-card">
          <span className="hero-badge">The bite selection</span>
          <h2>View the full menu and build your meal.</h2>
          <p>
            Browse all categories, choose your burger and fries combo, then order online for fast pickup or delivery.
          </p>
          <a href="#menu" className="btn btn-yellow">View Full Menu</a>
        </div>
      </section>

      <section className="shop-section" id="shop">
        <div className="shop-intro">
          <span className="hero-badge">Shop</span>
          <h2>See the kitchen, taste the vibe.</h2>
          <p>Every photo shows our restaurant’s energy and our food’s bold appetite.</p>
        </div>
        <ShopPhotos />
      </section>

      <section className="contact-section" id="contact">
        <div className="contact-inner">
          <div>
            <span className="hero-badge">Book Online</span>
            <h2>Reserve your order and get it delivered hot.</h2>
            <p>
              Gabba serves burgers, fries, pizza and more with fast delivery and pickup options.
              Place your order online and we’ll take care of the rest.
            </p>
            <div className="contact-card">
              <div>
                <strong>Address</strong>
                <p>21 Bite Loud Street, Downtown Market, Mumbai</p>
              </div>
              <div>
                <strong>Phone</strong>
                <p>+91 98765 43210</p>
              </div>
              <div>
                <strong>Hours</strong>
                <p>10:00 AM - 11:30 PM daily</p>
              </div>
            </div>
          </div>
          <div className="contact-visual">
            <img src="/shop1.jpg" alt="Gabba shop interior" />
          </div>
        </div>
      </section>
    </>
  );
}
