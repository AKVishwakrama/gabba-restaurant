import React from "react";

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="stripe-divider" style={{ margin: "-28px -28px 20px" }} />
      Gabba &copy; {new Date().getFullYear()} &mdash; Burgers, Pizza, Fries &amp; Momo. Made loud, delivered fast.
    </footer>
  );
}
