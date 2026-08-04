import React from "react";

export default function Hero() {
  return (
    <section className="hero hero--gaba" id="hero">
      <div className="hero-columns">
        <div className="hero-panel">
          <span className="hero-panel-title">THE BURGER MENU</span>
          <div className="hero-crumbs">
            <span>classic depart</span>
            <span>midfire depart</span>
            <span>luxury depart</span>
            <span>THE BOLD FLAVOR BITE</span>
          </div>
        </div>

        <div className="hero-copy">
          <h1>QUICK BITES, <br /> BOLD FLAVORS</h1>
          <p>
            Fast, professional vegetarian burgers for the modern urban professional.
            Experience bold flavors and convenience in every bite.
          </p>
          <div className="hero-actions">
            <a href="#menu" className="btn btn-yellow">Order Online</a>
            <a href="https://api.whatsapp.com/send?phone=916260509660" className="btn btn-outline-light">WhatsApp</a>
          </div>
        </div>

        <div className="hero-visual">
          <img src="/custom-hero.jpg" alt="Gaba Grab A Bite hero" onError={(e) => { e.target.onerror = null; e.target.src = '/hero.jpg'; }} />
        </div>
      </div>
    </section>
  );
}
