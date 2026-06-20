"use client";

import { useRef } from "react";
import { ORDER_STEPS } from "@/lib/landing-archived-sections";
import { PERSIAN_DIGITS } from "@/lib/landing-data";
import { useOrderStagesScroll } from "./useOrderStagesScroll";

/**
 * Order-tracking stepper section — saved for reuse (e.g. order status page).
 * Not rendered on the main landing page.
 */
export default function LandingOrderStages() {
  const sectionRef = useRef<HTMLElement>(null);
  useOrderStagesScroll(sectionRef);

  return (
    <section ref={sectionRef} className="landing-order-stages" id="order-stages">
      <div className="landing-order-pin">
        <div className="landing-order-stages-inner">
          <div className="landing-section-head landing-order-head">
            <p className="landing-eyebrow">پیگیری سفارش</p>
            <h2>مراحل سفارش شما</h2>
            <p className="landing-order-hint">اسکرول کنید تا مراحل را ببینید</p>
          </div>
          <div className="landing-order-stepper-wrap">
            <ol className="landing-order-track" id="landing-order-track" aria-label="مراحل سفارش">
              {ORDER_STEPS.map((label, index) => (
                <li
                  key={label}
                  className={`landing-order-step${index === 0 ? " is-active" : ""}`}
                  data-step={index}
                >
                  <div className="landing-order-marker">
                    <span className="landing-order-num">{PERSIAN_DIGITS[index]}</span>
                    {index < ORDER_STEPS.length - 1 ? (
                      <span className="landing-order-segment" aria-hidden="true" />
                    ) : null}
                  </div>
                  <span className="landing-order-label">{label}</span>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </div>
    </section>
  );
}
