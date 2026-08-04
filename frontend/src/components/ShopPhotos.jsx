import React from "react";

export default function ShopPhotos() {
  const photos = ["/shop1.jpg", "/shop2.jpg", "/burger.jpg", "/fries.jpg"];
  return (
    <section className="shop-photos shop-photos--grid">
      <div className="shop-photos-header">
        <h3>Shop Photos</h3>
        <p>See the kitchen, the crew, and the meals that customers love.</p>
      </div>
      <div className="photos-grid">
        {photos.map((src, idx) => (
          <div className={`photo photo-${idx}`} key={idx}>
            <img src={src} alt={`Shop photo ${idx + 1}`} onError={(e) => { e.target.onerror = null; e.target.src = 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800'; }} />
          </div>
        ))}
      </div>
    </section>
  );
}
