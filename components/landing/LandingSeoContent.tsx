"use client";

import { useId, useState } from "react";
import { LANDING_SEO_CONTENT } from "@/lib/landing-seo-content";

export default function LandingSeoContent() {
  const [expanded, setExpanded] = useState(false);
  const contentId = useId();

  return (
    <section className="landing-seo" aria-label="توضیحات">
      <div className="landing-seo-inner">
        <div
          id={contentId}
          className={`landing-seo-content${expanded ? " is-expanded" : ""}`}
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
    </section>
  );
}
