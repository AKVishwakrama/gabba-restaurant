// import React from "react";
// import { useNavigate } from "react-router-dom";

// export default function Hero() {
//   const navigate = useNavigate();

//   return (
//     <section className="hero hero--gaba" id="hero">
//       <div className="hero-columns">
//         <div className="hero-copy hero-copy--large">
//           <span className="hero-badge hero-badge--light">Fresh vegetarian cafe food</span>
//           <h1>Professional premium burgers and cafe-style comfort.</h1>
//           <p>
//             Gabba pairs bold vegetarian flavors with polished presentation and professional online ordering.
//             Order from a modern cafe menu designed like the best food delivery apps.
//           </p>
//           <div className="hero-actions hero-actions--home">
//             <button className="btn btn-yellow" onClick={() => navigate("/menu")}>Explore Menu</button>
//             <a href="https://api.whatsapp.com/send?phone=916260509660" className="btn btn-outline-light">WhatsApp Order</a>
//           </div>
//         </div>
//         <div className="hero-visual hero-visual--large">
//           <img
//             src="/custom-hero.jpg"
//             alt="Gaba Grab A Bite hero"
//             onError={(e) => {
//               e.target.onerror = null;
//               e.target.src = '/hero.jpg';
//             }}
//             onLoad={(e) => e.target.classList.add('loaded')}
//           />
//         </div>
//       </div>
//     </section>
//   );
// }



import React from "react";
import { useNavigate } from "react-router-dom";

export default function Hero() {
  const navigate = useNavigate();

  return (
    <section className="hero hero--gaba" id="hero">
      <div className="hero-columns">
        <div className="hero-copy hero-copy--large">
          <span className="hero-badge hero-badge--light">Fresh Batch, Every Order</span>
          <h1>Hungry? We've got you covered.</h1>
          <p>
            Juicy veg burgers made to order, hot fries, and quick delivery —
            because good food shouldn't take forever.
          </p>
          <div className="hero-actions hero-actions--home">
            <button className="btn btn-yellow" onClick={() => navigate("/menu")}>Explore Menu</button>
            <a href="https://api.whatsapp.com/send?phone=916260509660" className="btn btn-outline-light">WhatsApp Order</a>
          </div>
        </div>
        <div className="hero-visual hero-visual--large">
          <img
            src="/custom-hero.jpeg"
            alt="Gaba Grab A Bite hero"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = '/hero.jpg';
            }}
            onLoad={(e) => e.target.classList.add('loaded')}
          />
        </div>
      </div>
    </section>
  );
}