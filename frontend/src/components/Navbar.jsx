import React from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useCart } from "../context/CartContext.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import GoogleSignIn from "./GoogleSignIn.jsx";

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { totalCount } = useCart();
  const { user, logout } = useAuth();

  function scrollToId(id) {
    if (location.pathname !== "/") {
      navigate("/", { state: { scrollTo: id } });
    } else {
      const element = document.getElementById(id);
      if (element) element.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }

  return (
    <header className="navbar nav-tube">
      <Link to="/" className="logo logo-image">
        <img src="/logo.svg" alt="Gabba logo" />
      </Link>
      <nav>
        <button type="button" className="nav-link" onClick={() => scrollToId("hero")}>Home</button>
        <button type="button" className="nav-link" onClick={() => scrollToId("menu")}>Online Orders</button>
        <button type="button" className="nav-link" onClick={() => scrollToId("menu")}>Menus</button>
        <button type="button" className="nav-link" onClick={() => scrollToId("shop")}>Shop</button>
        <button type="button" className="nav-link" onClick={() => scrollToId("contact")}>Book Online</button>
        <Link to="/cart" className="cart-pill">
          Cart {totalCount > 0 && `(${totalCount})`}
        </Link>
        <div style={{ marginLeft: 12 }}>
          <GoogleSignIn />
        </div>
        {user ? (
          <>
            {user.is_admin && <Link to="/admin">Owner Dashboard</Link>}
            <button className="link" onClick={logout}>Logout</button>
          </>
        ) : (
          <>
            <Link to="/login">Login</Link>
            <Link to="/signup">Signup</Link>
          </>
        )}
      </nav>
    </header>
  );
}
