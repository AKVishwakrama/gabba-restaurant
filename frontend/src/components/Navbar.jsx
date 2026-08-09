import React from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useCart } from "../context/CartContext.jsx";
import { useAuth } from "../context/AuthContext.jsx";

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
        <img src="/logo1.png" alt="Gabba logo" />
      </Link>
      <nav>
        <Link to="/" className="nav-link">Home</Link>
        <Link to="/menu" className="nav-link">Menu</Link>
        <Link to="/cart" className={totalCount > 0 ? "cart-pill" : "nav-link"}>
          Cart {totalCount > 0 && `(${totalCount})`}
        </Link>

        {user ? (
          <>
            {user.is_admin && <Link to="/admin" className="nav-link">Owner Dashboard</Link>}
            <button className="link" onClick={logout}>Logout</button>
          </>
        ) : (
          <>
            <Link to="/login" className="nav-link">Login</Link>
            <Link to="/signup" className="nav-link">Signup</Link>
          </>
        )}
      </nav>
    </header>
  );
}