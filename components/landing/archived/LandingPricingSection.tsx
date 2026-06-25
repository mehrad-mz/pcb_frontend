import { APP_ROUTES } from "@/lib/landing-data";
import { PRICING_CARDS } from "@/lib/landing-archived-sections";

/**
 * Pricing cards section — saved for reuse on a dedicated pricing page.
 * Not rendered on the main landing page.
 */
export default function LandingPricingSection() {
  return (
    <section className="landing-pricing" id="pricing">
      <div className="landing-pricing-inner">
        <div className="landing-pricing-copy">
          <p className="landing-eyebrow">قیمت‌گذاری ساده</p>
          <h2>
            از ۲ دلار شروع کن.
            <br />
            تا تولید انبوه.
          </h2>
          <p>۵ برد، استعلام فوری و تخفیف حجمی.</p>
          <a href={APP_ROUTES.newOrder} className="landing-btn landing-btn-primary landing-btn-lg">
            استعلام فوری
          </a>
        </div>
        <div className="landing-pricing-cards" id="landing-pricing-cards">
          {PRICING_CARDS.map((card) => (
            <article
              key={card.title}
              className={`landing-price-card${card.featured ? " landing-price-card--featured" : ""}`}
            >
              <span className="landing-price-tag">{card.tag}</span>
              <h3>{card.title}</h3>
              <p className="landing-price">
                از <strong>{card.price}</strong>
              </p>
              <ul>
                {card.items.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
