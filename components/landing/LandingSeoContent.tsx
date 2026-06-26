"use client";

import { useId, useState } from "react";
import { LANDING_SEO_CONTENT } from "@/lib/landing-seo-content";

export default function LandingSeoContent() {
  const [expanded, setExpanded] = useState(false);
  const contentId = useId();

  return (
    <section className="landing-seo" aria-label="توضیحات">
      <div className="landing-seo-inner">
        <div className={`landing-seo-clip${expanded ? " is-expanded" : ""}`}>
          {!expanded ? <div className="landing-seo-fade" aria-hidden="true" /> : null}
          <div
            id={contentId}
            className="landing-seo-content"
            dangerouslySetInnerHTML={{ __html: LANDING_SEO_CONTENT }}
          />
          <button
            type="button"
            className="landing-seo-toggle"
            aria-expanded={expanded}
            aria-controls={contentId}
            onClick={() => setExpanded((open) => !open)}
          >
            {expanded ? "نمایش کمتر" : "نمایش بیشتر"}
          </button>
        </div>
      </div>
    </section>
  );
}
