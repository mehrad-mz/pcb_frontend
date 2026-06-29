/** App routes used from the Next.js landing page. */
export const APP_ROUTES = {
  login: "/login",
  newOrder: "/order",
  help: "/api/v1/pcb/help/",
} as const;

export const PERSIAN_DIGITS = ["۱", "۲", "۳", "۴", "۵", "۶", "۷"];

export const STORY_STEP_LABELS = ["۰۱", "۰۲", "۰۳", "۰۴"];

export type StoryStep = {
  label: string;
  heading: string;
  description: string;
};

export const STORY_STEPS: StoryStep[] = [
  {
    label: "آپلود و اعتبارسنجی",
    heading: "تحلیل فوری گربر",
    description:
      "فایل طراحی را بارگذاری کن و موتور ما لایه‌ها، سوراخکاری و قوانین امپدانس را در چند ثانیه بررسی می‌کند.",
  },
  {
    label: "استعلام و پیکربندی",
    heading: "قیمت شفاف، لحظه‌ای",
    description: "تعداد لایه، جنس، پوشش سطحی و زمان تحویل را انتخاب کن.",
  },
  {
    label: "ساخت",
    heading: "کیفیت تولید صنعتی",
    description: "بازرسی نوری خودکار، امپدانس کنترل‌شده و پوشش ENIG.",
  },
  {
    label: "تحویل",
    heading: "ارسال‌شده، تست‌شده، آماده",
    description: "تست الکتریکی روی هر برد. پیگیری از حکاکی تا ارسال.",
  },
];

export type SiteStat = {
  id: string;
  icon: "clipboard-list" | "factory" | "package-check";
  title: string;
  value: string;
};

export const LANDING_SITE_STATS: SiteStat[] = [
  {
    id: "registered",
    icon: "clipboard-list",
    title: "سفارش ثبت‌شده",
    value: "۱۲,۵۰۰+",
  },
  {
    id: "production",
    icon: "factory",
    title: "سفارش در حال ساخت",
    value: "۳۸۰+",
  },
  {
    id: "delivered",
    icon: "package-check",
    title: "برد تحویل‌داده‌شده",
    value: "۹۸,۰۰۰+",
  },
];

export const NAV_LINKS = [
  { href: "#products", label: "محصولات" },
  { href: "#process", label: "فرآیند" },
  { href: "#capabilities", label: "قابلیت‌ها" },
] as const;

export type FooterLink = {
  href: string;
  label: string;
};

export const FOOTER_IMPORTANT_LINKS: FooterLink[] = [
  { href: "#products", label: "محصولات" },
  { href: "#process", label: "فرآیند ساخت" },
  { href: "#capabilities", label: "قابلیت‌ها" },
  { href: APP_ROUTES.newOrder, label: "ثبت سفارش" },
  { href: APP_ROUTES.help, label: "راهنما و پشتیبانی" },
];

export const FOOTER_ARTICLES: FooterLink[] = [
  { href: APP_ROUTES.help, label: "راهنمای طراحی گربر" },
  { href: APP_ROUTES.help, label: "انتخاب ضخامت مس و لایه" },
  { href: APP_ROUTES.help, label: "پوشش سطحی ENIG در برابر HASL" },
  { href: APP_ROUTES.help, label: "کنترل امپدانس در بردهای چندلایه" },
];

export type FooterSocial = {
  id: string;
  href: string;
  label: string;
};

export const FOOTER_CONTACT = {
  email: "info@globalpcb.com",
  tagline: "از گربر تا برد آماده — ساخت سریع، کیفیت صنعتی.",
} as const;

export const FOOTER_SOCIALS: FooterSocial[] = [
  { id: "instagram", href: "https://instagram.com", label: "اینستاگرام" },
  { id: "telegram", href: "https://t.me", label: "تلگرام" },
  { id: "linkedin", href: "https://linkedin.com", label: "لینکدین" },
];

export type ProductSummary = {
  id: string;
  title: string;
  priceHtml: string;
  features: string[];
  imageSrc: string;
  imageAlt: string;
};

export const LANDING_PRODUCTS: ProductSummary[] = [
  {
    id: "fr4",
    title: "برد FR-4",
    priceHtml: "از <strong>۱۵۰,۰۰۰ تومان</strong> / ۵ عدد",
    features: ["۱ تا ۳۲ لایه", "POFV رایگان برای ۶+ لایه", "کنترل امپدانس ±۱۰٪"],
    imageSrc: "/products/fr4-pcb.svg",
    imageAlt: "نمونه برد FR-4 با مسیرهای طلایی",
  },
  {
    id: "stencil",
    title: "Stencil SMT",
    priceHtml: "از <strong>۲۵۰,۰۰۰ تومان</strong>",
    features: ["فولاد ضدزنگ ۳۰۴ HTA", "دقت برش لیزری ±۰.۰۰۳ میلی‌متر", "الکتروپولیش و نانو-coating"],
    imageSrc: "/products/smt-stencil.svg",
    imageAlt: "استencil SMT با برش لیزری دقیق",
  },
];
