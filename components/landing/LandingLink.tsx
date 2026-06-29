"use client";

import type { AnchorHTMLAttributes, MouseEvent } from "react";

type LandingLinkProps = AnchorHTMLAttributes<HTMLAnchorElement> & {
  href: string;
};

/** Full-page navigation — avoids broken client routing on the WebGL landing page. */
export default function LandingLink({ href, onClick, ...props }: LandingLinkProps) {
  const handleClick = (event: MouseEvent<HTMLAnchorElement>) => {
    onClick?.(event);
    if (event.defaultPrevented) return;

    event.preventDefault();
    window.location.assign(href);
  };

  return <a href={href} onClick={handleClick} {...props} />;
}
