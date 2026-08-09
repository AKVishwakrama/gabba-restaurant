import React, { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Hero from "../components/Hero.jsx";
import ShopPhotos from "../components/ShopPhotos.jsx";

export default function Home() {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (location.state?.scrollTo === "contact") {
      const element = document.getElementById("contact");
      if (element) {
        element.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }
  }, [location.state]);

  return (
    <>
      <Hero />

      <section className="home-intro page-wrap">
        <div className="home-intro-copy">
          <span className="hero-badge">Gabba Grab A Bite</span>
          <h2>Veg burgers that actually hit different.</h2>
          <p>
            No meat, no compromise — just loaded patties, melty cheese, and fries hot off the fryer.
            Order online, skip the line, and taste why regulars keep coming back.
          </p>
          <div className="hero-actions hero-actions--home">
            <button className="btn btn-yellow" onClick={() => navigate("/menu")}>See Menu</button>
            <a href="https://api.whatsapp.com/send?phone=916260509660" className="btn btn-outline-light">WhatsApp Order</a>
          </div>
        </div>
        <div className="home-intro-cards">
          <div className="info-card">
            <h3>Made when you order</h3>
            <p>Nothing sits around. Your food starts cooking the moment you hit order.</p>
          </div>
          <div className="info-card">
            <h3>Full-on cafe vibe</h3>
            <p>Good food deserves a good spot to eat it in — walk in and see for yourself.</p>
          </div>
          <div className="info-card">
            <h3>Delivered hot, fast</h3>
            <p>No cold fries, no long waits. Just quick delivery when you're hungry.</p>
          </div>
        </div>
      </section>

      <section className="home-feature page-wrap">
        <div className="feature-splash">
          <div className="feature-copy">
            <h3>Big flavor, zero meat</h3>
            <p>
              Every burger is loaded, every side is fresh, and every bite is built to satisfy —
              this is what veg comfort food is supposed to taste like.
            </p>
            <button className="btn btn-yellow" onClick={() => navigate("/menu")}>Browse the full menu</button>
          </div>
          <div className="feature-image">
            <img src="/shop-photo-2.jpg" alt="Gabba cafe interior" />
          </div>
        </div>
      </section>

      <section className="home-gallery page-wrap">
        <div className="gallery-title">
          <span className="hero-badge">Our cafe</span>
          <h2>Come see where the magic happens.</h2>
        </div>
        <ShopPhotos />
      </section>

      <section className="contact-section contact-section--pink" id="contact">
        <div className="page-wrap contact-panel">
          <div className="contact-copy">
            <span className="hero-badge hero-badge--white">Contact</span>
            <h2>Craving it already? Order now.</h2>
            <p>
              Message us on WhatsApp, walk in, or order online — however you like it,
              we'll get your food to you fast.
            </p>
          </div>
          <div className="contact-cards">
            <div className="contact-card contact-card--large">
              <h3>Address</h3>
              <p>Ahinsa Chowk, GABA, Kachnar City Rd, in front of Shalby Hospital, GABA, Vijay Nagar, Jabalpur, Raksha, Madhya Pradesh 482002</p>
            </div>
            <div className="contact-card">
              <h3>Phone</h3>
              <p>+91 62605 09660</p>
            </div>
            <div className="contact-card">
              <h3>Hours</h3>
              <p>10:00 AM - 11:30 PM daily</p>
            </div>
            <div className="contact-card contact-card--action">
              <h3>Order now</h3>
              <a href="https://api.whatsapp.com/send?phone=916260509660" className="btn btn-black">Chat on WhatsApp</a>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}