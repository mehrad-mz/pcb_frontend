"use client";

import Link from "next/link";
import { useState } from "react";
import { APP_ROUTES, LANDING_PRODUCTS, type ProductSummary } from "@/lib/landing-data";

function ProductDetail({ product }: { product: ProductSummary }) {
  return (
    <div className="landing-product-detail">
      <h3>{product.title}</h3>
      <ul className="landing-product-features">
        {product.features.map((feature) => (
          <li key={feature}>{feature}</li>
        ))}
      </ul>
      <p className="landing-product-price" dangerouslySetInnerHTML={{ __html: product.priceHtml }} />
      <p className="landing-product-lead">{product.leadTime}</p>
      <div className="landing-product-actions">
        <Link href={APP_ROUTES.newOrder} className="landing-btn landing-btn-primary">
          سفارش
        </Link>
      </div>
    </div>
  );
}

export default function LandingProductsShowcase() {
  const [activeId, setActiveId] = useState(LANDING_PRODUCTS[0]?.id ?? "fr4");
  const activeProduct = LANDING_PRODUCTS.find((product) => product.id === activeId) ?? LANDING_PRODUCTS[0];

  if (!activeProduct) return null;

  return (
    <section className="landing-products" id="products">
      <div className="landing-section-head">
        <p className="landing-eyebrow">راهکارهای یکپارچه</p>
        <h2>محصولات و خدمات PCB</h2>
      </div>

      <div className="landing-products-showcase">
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
              onClick={() => setActiveId(product.id)}
            >
              {product.title}
            </button>
          ))}
        </div>

        <div
          className="landing-product-visual"
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

        <ProductDetail product={activeProduct} />
      </div>
    </section>
  );
}
