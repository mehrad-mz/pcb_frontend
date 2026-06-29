"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import LandingLink from "./LandingLink";
import { APP_ROUTES, NAV_LINKS } from "@/lib/landing-data";

export default function LandingNav() {
  const [menuOpen, setMenuOpen] = useState(false);

  const closeMenu = useCallback(() => setMenuOpen(false), []);

  useEffect(() => {
    if (!menuOpen) return;

    window.addEventListener("scroll", closeMenu, { passive: true });
    return () => window.removeEventListener("scroll", closeMenu);
  }, [menuOpen, closeMenu]);

  return (
    <>
      <header className="landing-nav">
        <Link href="/" className="landing-brand">
          <img src="/logo.svg" alt="Global PCB" className="landing-brand-logo" />
        </Link>

        <nav className="landing-nav-links" aria-label="اصلی">
          {NAV_LINKS.map((link) => (
            <a key={link.href} href={link.href}>
              {link.label}
            </a>
          ))}
        </nav>

        <div className="landing-nav-actions">
          <LandingLink href={APP_ROUTES.login} className="landing-btn landing-btn-ghost">
            ورود / ثبت‌نام
          </LandingLink>
          <LandingLink href={APP_ROUTES.newOrder} className="landing-btn landing-btn-primary landing-nav-order-btn">
            ثبت سفارش
          </LandingLink>
          <button
            type="button"
            className="landing-menu-toggle"
            aria-label={menuOpen ? "بستن منو" : "باز کردن منو"}
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((open) => !open)}
          >
            <span />
            <span />
          </button>
        </div>
      </header>

      {menuOpen ? (
        <div className="landing-mobile-menu" id="landing-mobile-menu">
          {NAV_LINKS.map((link) => (
            <a key={link.href} href={link.href} onClick={closeMenu}>
              {link.label}
            </a>
          ))}
          <LandingLink href={APP_ROUTES.newOrder} onClick={closeMenu}>
            ثبت سفارش
          </LandingLink>
        </div>
      ) : null}
    </>
  );
}
