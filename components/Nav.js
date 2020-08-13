import Link from "next/link";
import CartIcon from "./cart/CartIcon";
import { useState } from "react";

const Nav = () => {
  const [show, setDisplay] = useState(false);

  return (
    <nav className="woo-next-menu-container navbar-dark bg-primary">
      {/*Branding*/}
      <div className="woo-next-branding">
        <Link href="/">
          <a aria-hidden className="">
            {/* ePro Consulting */}
            <img src="/logo.svg" alt="logo"></img>
          </a>
        </Link>
      </div>

      {/*Navigation menu*/}
      <div className={`woo-next-sub-menu-wrap ${show ? "show" : ""}`} id="">
        <ul className="navbar-nav">
          <li className="nav-item">
            <Link href="/products">
              <a aria-hidden className="nav-link">Products</a>
            </Link>
          </li>
          <li className="nav-item">
            <Link href="/account">
              <a aria-hidden className="nav-link">My Account</a>
            </Link>
          </li>
          {/* <li className="nav-item">
            <Link href="/t-and-c">
              <a aria-hidden className="nav-link">Terms and Conditions</a>
            </Link>
          </li>
          <li className="nav-item">
            <Link href="/privacy-policy">
              <a aria-hidden className="nav-link">Privacy Policy</a>
            </Link>
          </li> */}
        </ul>
      </div>

      {/*	Cart and Menu button*/}
      <div className="woo-next-cart-and-menu-btn">
        {/*Cart Icon*/}
        <div>
          <CartIcon />
        </div>
        {/*Menu toggle button for mobile*/}
        <button
          onClick={() => setDisplay(!show)}
          className="woo-next-menu-btn"
          type="button"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>
      </div>
    </nav>
  );
};

export default Nav;
