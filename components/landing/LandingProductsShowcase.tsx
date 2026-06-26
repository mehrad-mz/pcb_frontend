"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { APP_ROUTES, LANDING_PRODUCTS, type ProductSummary } from "@/lib/landing-data";

const PRODUCT_TRANSITION_MS = 220;

type ProductPhase = "entering" | "leaving";

function prefersReducedMotion() {
  return typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function panelClass(hasRevealed: boolean, phase: ProductPhase) {
  if (!hasRevealed) return "landing-product-panel is-awaiting";
  return `landing-product-panel is-${phase}`;
}

function ProductDetail({
  product,
  hasRevealed,
  phase,
}: {
  product: ProductSummary;
  hasRevealed: boolean;
  phase: ProductPhase;
}) {
  return (
    <div className={`landing-product-detail ${panelClass(hasRevealed, phase)}`}>
      <h3>{product.title}</h3>
      <ul className="landing-product-features">
        {product.features.map((feature) => (
          <li key={feature}>{feature}</li>
        ))}
      </ul>
      <p className="landing-product-price" dangerouslySetInnerHTML={{ __html: product.priceHtml }} />
      <div className="landing-product-actions">
        <Link href={APP_ROUTES.newOrder} className="landing-btn landing-btn-primary">
          سفارش
        </Link>
      </div>
    </div>
  );
}

export default function LandingProductsShowcase() {
  const showcaseRef = useRef<HTMLDivElement>(null);
  const [activeId, setActiveId] = useState(LANDING_PRODUCTS[0]?.id ?? "fr4");
  const [hasRevealed, setHasRevealed] = useState(false);
  const [phase, setPhase] = useState<ProductPhase>("entering");
  const activeProduct = LANDING_PRODUCTS.find((product) => product.id === activeId) ?? LANDING_PRODUCTS[0];

  useEffect(() => {
    const node = showcaseRef.current;
    if (!node || hasRevealed) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (!entry?.isIntersecting) return;
        setHasRevealed(true);
        setPhase("entering");
        observer.disconnect();
      },
      { threshold: 0.2, rootMargin: "0px 0px -5% 0px" },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [hasRevealed]);

  const selectProduct = useCallback(
    (id: string) => {
      if (id === activeId || phase === "leaving") return;

      if (prefersReducedMotion()) {
        setActiveId(id);
        setHasRevealed(true);
        setPhase("entering");
        return;
      }

      setPhase("leaving");
      window.setTimeout(() => {
        setActiveId(id);
        setPhase("entering");
      }, PRODUCT_TRANSITION_MS);
    },
    [activeId, phase],
  );

  if (!activeProduct) return null;

  return (
    <section className="landing-products" id="products">
      <div className="landing-section-head">
        <h2>محصولات و خدمات PCB</h2>
      </div>

      <div className="landing-products-showcase" ref={showcaseRef}>
        <div className="landing-product-tabs" role="tablist" aria-label="محصولات">
          {LANDING_PRODUCTS.map((product) => (
            <button
              key={product.id}
              type="button"
              role="tab"
              id={`product-tab-${product.id}`}
              aria-selected={product.id === activeId}
              aria-controls={`product-panel-${product.id}`}
              className={`landing-product-tab${product.id === activeId ? " is-active" : ""}`}
              onClick={() => selectProduct(product.id)}
            >
              {product.title}
            </button>
          ))}
        </div>

        <div
          className={`landing-product-visual ${panelClass(hasRevealed, phase)}`}
          role="tabpanel"
          id={`product-panel-${activeProduct.id}`}
          aria-labelledby={`product-tab-${activeProduct.id}`}
        >
          <div className="landing-product-image">
            <img
              key={activeProduct.id}
              src={activeProduct.imageSrc}
              alt={activeProduct.imageAlt}
              width={420}
              height={315}
              loading="lazy"
              decoding="async"
            />
          </div>
        </div>

        <ProductDetail product={activeProduct} hasRevealed={hasRevealed} phase={phase} />
      </div>
    </section>
  );
}
