import React from "react";

export default function ShopPhotos() {
  const photos = ["/shop-03.jpeg", "/shop-01.jpeg", "shop-02.png"];
  return (
    <section className="shop-photos shop-photos--grid">
      <div className="shop-photos-header">
        <h3>Shop Photos</h3>
        <p>See the cafe, the brand, and the premium atmosphere.</p>
      </div>
      <div className="photos-grid photos-grid--simple">
        {photos.map((src, idx) => (
          <div className="photo" key={idx}>
            <img src={src} alt={`Shop photo ${idx + 1}`} onError={(e) => { e.target.onerror = null; e.target.src = 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800'; }} />
          </div>
        ))}
      </div>
    </section>
  );
}
