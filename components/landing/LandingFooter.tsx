import Link from "next/link";
import { Mail } from "lucide-react";
import {
  FOOTER_ARTICLES,
  FOOTER_CONTACT,
  FOOTER_IMPORTANT_LINKS,
  FOOTER_SOCIALS,
} from "@/lib/landing-data";

function FooterSocialIcon({ id }: { id: string }) {
  switch (id) {
    case "instagram":
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden="true">
          <rect x="3" y="3" width="18" height="18" rx="5" />
          <circle cx="12" cy="12" r="4" />
          <circle cx="17.5" cy="6.5" r="0.75" fill="currentColor" stroke="none" />
        </svg>
      );
    case "telegram":
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden="true">
          <path d="M21.5 4.5 3.5 11.5c-.9.35-.88 1.65.03 1.97l4.56 1.5 1.74 5.28c.28.86 1.45 1.02 1.96.28l2.5-3.6 4.7 3.47c.77.57 1.86.14 2.04-.84L22.5 6c.18-1.02-.74-1.86-1.5-1.5Z" />
          <path d="M8.2 13.2 15.8 8.5" />
        </svg>
      );
    case "linkedin":
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden="true">
          <rect x="4" y="9" width="4" height="11" rx="1" />
          <circle cx="6" cy="6" r="2" />
          <path d="M13 9h3.5a3.5 3.5 0 0 1 3.5 3.5V20" />
          <path d="M13 13.5V20" />
        </svg>
      );
    default:
      return null;
  }
}

export default function LandingFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="landing-footer">
      <div className="landing-footer-inner">
        <div className="landing-footer-brand">
          <Link href="/" className="landing-footer-logo-link" aria-label="Global PCB">
            <img src="/logo.svg" alt="" className="landing-brand-logo landing-footer-logo" />
          </Link>
          <p className="landing-footer-tagline">{FOOTER_CONTACT.tagline}</p>
        </div>

        <nav className="landing-footer-col" aria-label="لینک‌های مهم و مقالات">
          <div className="landing-footer-group">
            <h3 className="landing-footer-heading">لینک‌های مهم</h3>
            <ul className="landing-footer-list">
              {FOOTER_IMPORTANT_LINKS.map((link) => (
                <li key={link.label}>
                  <a href={link.href}>{link.label}</a>
                </li>
              ))}
            </ul>
          </div>
          <div className="landing-footer-group">
            <h3 className="landing-footer-heading">مقالات</h3>
            <ul className="landing-footer-list">
              {FOOTER_ARTICLES.map((link) => (
                <li key={link.label}>
                  <a href={link.href}>{link.label}</a>
                </li>
              ))}
            </ul>
          </div>
        </nav>

        <div className="landing-footer-col landing-footer-contact">
          <h3 className="landing-footer-heading">تماس با ما</h3>
          <a href={`mailto:${FOOTER_CONTACT.email}`} className="landing-footer-email">
            <Mail size={16} strokeWidth={1.75} aria-hidden="true" />
            <span>{FOOTER_CONTACT.email}</span>
          </a>
          <div className="landing-footer-socials" aria-label="شبکه‌های اجتماعی">
            {FOOTER_SOCIALS.map((social) => (
              <a
                key={social.id}
                href={social.href}
                className="landing-footer-social"
                target="_blank"
                rel="noopener noreferrer"
                aria-label={social.label}
              >
                <FooterSocialIcon id={social.id} />
              </a>
            ))}
          </div>
        </div>
      </div>

      <div className="landing-footer-bottom">
        <p>&copy; {year} Global PCB. تمام حقوق محفوظ است.</p>
      </div>
    </footer>
  );
}
