"use client";

import { ClipboardList, Factory, PackageCheck, type LucideIcon } from "lucide-react";
import { LANDING_SITE_STATS } from "@/lib/landing-data";

const STAT_ICONS: Record<(typeof LANDING_SITE_STATS)[number]["icon"], LucideIcon> = {
  "clipboard-list": ClipboardList,
  factory: Factory,
  "package-check": PackageCheck,
};

export default function LandingSiteStats() {
  return (
    <div className="landing-stat-grid">
      {LANDING_SITE_STATS.map((stat) => {
        const Icon = STAT_ICONS[stat.icon];

        return (
          <article key={stat.id} className="landing-stat-card">
            <div className="landing-stat-icon" aria-hidden="true">
              <Icon size={30} strokeWidth={1.6} />
            </div>
            <p className="landing-stat-title">{stat.title}</p>
            <p className="landing-stat-value">{stat.value}</p>
          </article>
        );
      })}
    </div>
  );
}
