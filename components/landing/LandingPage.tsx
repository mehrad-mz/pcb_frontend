"use client";

import Link from "next/link";
import { useCallback, useRef, useState } from "react";
import LandingProductsShowcase from "./LandingProductsShowcase";
import LandingSceneLoader from "./LandingSceneLoader";
import LandingSeoContent from "./LandingSeoContent";
import { useLandingScroll } from "./useLandingScroll";
import { usePcbScene } from "./usePcbScene";
import {
  DJANGO_ROUTES,
  FEATURE_CARDS,
  NAV_LINKS,
  STORY_STEP_LABELS,
  STORY_STEPS,
} from "@/lib/landing-data";

export default function LandingPage() {
  const shellRef = useRef<HTMLDivElement>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [sceneReady, setSceneReady] = useState(false);

  const handleSceneReady = useCallback(() => {
    setSceneReady(true);
  }, []);

  const pcbRef = usePcbScene(shellRef, handleSceneReady);
  useLandingScroll(shellRef, pcbRef, sceneReady);

  const closeMenu = () => setMenuOpen(false);

  return (
    <div className={`landing-body${sceneReady ? "" : " landing-body--loading"}`}>
      <div
        className={`landing-shell${sceneReady ? " landing-shell--ready" : ""}`}
        id="landing-shell"
        ref={shellRef}
      >
        <canvas id="pcb-canvas" aria-hidden="true" />
        <div className="landing-vignette" aria-hidden="true" />

        {!sceneReady ? <LandingSceneLoader /> : null}

        {sceneReady ? (
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
            <a href={DJANGO_ROUTES.login} className="landing-btn landing-btn-ghost">
              ورود
            </a>
            <a href={DJANGO_ROUTES.newOrder} className="landing-btn landing-btn-primary">
              ثبت سفارش
            </a>
            <button
              type="button"
              className="landing-menu-toggle"
              aria-label="باز کردن منو"
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
            <a href={DJANGO_ROUTES.newOrder} onClick={closeMenu}>
              ثبت سفارش
            </a>
          </div>
        ) : null}

        <main className="landing-scroll" id="landing-scroll">
          <section className="landing-hero" data-scene="hero">
            <div className="landing-hero-inner">
              <p className="landing-eyebrow">ساخت دقیق مدار چاپی</p>
              <h1 className="landing-hero-title">از گربر تا برد آماده</h1>
              <p className="landing-hero-copy">
                از اولین نمونه تا تولید انبوه — فایل گربر را آپلود کن، جریان برق را در طراحی‌ات ببین و بردها را در کمتر از ۲۴ ساعت دریافت کن.
              </p>
              <div className="landing-hero-actions">
                <a href={DJANGO_ROUTES.newOrder} className="landing-btn landing-btn-primary landing-btn-lg">
                  شروع سفارش
                </a>
                <a href="#process" className="landing-btn landing-btn-ghost landing-btn-lg">
                  مشاهده فرآیند
                </a>
              </div>
            </div>
            <div className="landing-scroll-hint" aria-hidden="true">
              <span>اسکرول کن تا مدار را دنبال کنی</span>
              <svg width="18" height="28" viewBox="0 0 18 28" fill="none">
                <rect x="1" y="1" width="16" height="26" rx="8" stroke="currentColor" strokeWidth="1.5" />
                <circle className="landing-scroll-dot" cx="9" cy="8" r="2" fill="currentColor" />
              </svg>
            </div>
          </section>

          <LandingProductsShowcase />

          <section className="landing-story" id="process">
            <div className="landing-story-pin">
              <div className="landing-story-ui">
                <div className="landing-stepper" id="landing-stepper">
                  <ol className="landing-stepper-list">
                    {STORY_STEP_LABELS.map((label, index) => (
                      <li
                        key={label}
                        className={`landing-stepper-item${index === 0 ? " is-active" : ""}`}
                        data-step={index}
                      >
                        <span className="landing-stepper-node">{label}</span>
                        {index < STORY_STEP_LABELS.length - 1 ? (
                          <span className="landing-stepper-segment" aria-hidden="true" />
                        ) : null}
                      </li>
                    ))}
                  </ol>
                </div>

                <div className="landing-story-panels">
                  {STORY_STEPS.map((step, index) => (
                    <article
                      key={step.heading}
                      className={`landing-story-panel${index === 0 ? " is-active" : ""}`}
                      data-step={index}
                    >
                      <p className="landing-panel-label">{step.label}</p>
                      <h2>{step.heading}</h2>
                      <p>{step.description}</p>
                    </article>
                  ))}
                </div>
              </div>
            </div>
          </section>

          <section className="landing-features" id="capabilities">
            <div className="landing-section-head">
              <p className="landing-eyebrow">ساخته‌شده برای مهندسان</p>
              <h2>
                هر آنچه پروژه‌ات نیاز دارد،
                <br />
                از ۲ لایه تا HDI.
              </h2>
            </div>
            <div className="landing-feature-grid">
              {FEATURE_CARDS.map((feature) => (
                <article key={feature.title} className="landing-feature-card">
                  <div className="landing-feature-icon">{feature.icon}</div>
                  <h3>{feature.title}</h3>
                  <p>{feature.description}</p>
                </article>
              ))}
            </div>
          </section>

          <section className="landing-cta">
            <div className="landing-cta-inner">
              <h2>آماده‌ای طراحی بعدی‌ات را زنده کنی؟</h2>
              <p>گربر آپلود کن، مشخصات را تنظیم کن و ببین بردت جان می‌گیرد.</p>
              <a href={DJANGO_ROUTES.newOrder} className="landing-btn landing-btn-primary landing-btn-lg">
                همین حالا سفارش بده
              </a>
            </div>
          </section>

          <LandingSeoContent />

          <footer className="landing-footer">
            <div className="landing-footer-inner">
              <img src="/logo.svg" alt="" className="landing-brand-logo landing-brand-logo-sm" aria-hidden="true" />
              <p>&copy; {new Date().getFullYear()} Global PCB. تمام حقوق محفوظ است.</p>
              <div className="landing-footer-links">
                <a href={DJANGO_ROUTES.help}>راهنما</a>
                <a href={DJANGO_ROUTES.help}>درباره ما</a>
                <a href={DJANGO_ROUTES.help}>تماس</a>
              </div>
            </div>
          </footer>
        </main>
          </>
        ) : null}
      </div>
    </div>
  );
}
