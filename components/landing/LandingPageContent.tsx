import LandingFooter from "./LandingFooter";
import LandingLink from "./LandingLink";
import LandingNav from "./LandingNav";
import LandingProductsShowcase from "./LandingProductsShowcase";
import LandingScrollMain from "./LandingScrollMain";
import LandingSeoContent from "./LandingSeoContent";
import LandingSiteStats from "./LandingSiteStats";
import { APP_ROUTES, STORY_STEP_LABELS, STORY_STEPS } from "@/lib/landing-data";

export default function LandingPageContent() {
  return (
    <>
      <LandingNav />

      <LandingScrollMain>
        <section className="landing-hero" data-scene="hero">
          <div className="landing-hero-inner">
            <h1 className="landing-hero-title">از گربر تا برد آماده</h1>
            <p className="landing-hero-copy">
              از اولین نمونه تا تولید انبوه — فایل گربر را آپلود کن، جریان برق را در طراحی‌ات ببین و بردها را در کمتر از ۲۴ ساعت دریافت کن.
            </p>
            <div className="landing-hero-actions">
              <LandingLink href={APP_ROUTES.newOrder} className="landing-btn landing-btn-primary landing-btn-lg">
                ثبت سفارش
              </LandingLink>
            </div>
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
            <h2>
              هر آنچه پروژه‌ات نیاز دارد،
              <br />
              از ۲ لایه تا HDI.
            </h2>
          </div>
          <LandingSiteStats />
        </section>

        <section className="landing-cta">
          <div className="landing-cta-inner">
            <h2>آماده‌ای طراحی بعدی‌ات را زنده کنی؟</h2>
            <p>گربر آپلود کن، مشخصات را تنظیم کن و ببین بردت جان می‌گیرد.</p>
            <LandingLink href={APP_ROUTES.newOrder} className="landing-btn landing-btn-primary landing-btn-lg">
              همین حالا سفارش بده
            </LandingLink>
          </div>
        </section>

        <LandingSeoContent />

        <LandingFooter />
      </LandingScrollMain>
    </>
  );
}
