/** Django template routes used from the Next.js landing page. */
export const DJANGO_ROUTES = {
  login: "/api/v1/auth/login/",
  newOrder: "/api/v1/pcb/new-order/",
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

export type FeatureCard = {
  icon: string;
  title: string;
  description: string;
};

export const FEATURE_CARDS: FeatureCard[] = [
  {
    icon: "⚡",
    title: "نمونه ۲۴ ساعته",
    description: "برد ۱ تا ۴ لایه از ۲ دلار.",
  },
  {
    icon: "◎",
    title: "امپدانس کنترل‌شده",
    description: "۵۰Ω، ۹۰Ω دیفرانسیل.",
  },
  {
    icon: "▣",
    title: "تا ۳۲ لایه",
    description: "Via کور، via مدفون و via-in-pad.",
  },
  {
    icon: "◈",
    title: "آماده مونتاژ",
    description: "مونتاژ SMT، stencil و BOM.",
  },
];

export const ORDER_STEPS = [
  "ثبت سفارش",
  "پرس‌فایل",
  "تایید مشتری",
  "بیش‌افزاری",
  "پرداخت",
  "در حال ساخت",
  "تحویل شده",
];

export type ProductSummary = {
  id: string;
  title: string;
  priceHtml: string;
  leadTime: string;
  features: string[];
  imageSrc: string;
  imageAlt: string;
  serviceLabel: string;
};

export const LANDING_PRODUCTS: ProductSummary[] = [
  {
    id: "fr4",
    title: "برد FR-4",
    priceHtml: "از <strong>$2.00</strong> / ۵ عدد",
    leadTime: "زمان ساخت: ۲۴ ساعت",
    features: ["۱ تا ۳۲ لایه", "POFV رایگان برای ۶+ لایه", "کنترل امپدانس ±۱۰٪"],
    imageSrc: "/products/fr4-pcb.svg",
    imageAlt: "نمونه برد FR-4 با مسیرهای طلایی",
    serviceLabel: "خدمات برد FR-4",
  },
  {
    id: "stencil",
    title: "Stencil SMT",
    priceHtml: "از <strong>$3.00</strong>",
    leadTime: "زمان ساخت: ۱۲–۴۸ ساعت",
    features: ["فولاد ضدزنگ ۳۰۴ HTA", "دقت برش لیزری ±۰.۰۰۳ میلی‌متر", "الکتروپولیش و نانو-coating"],
    imageSrc: "/products/smt-stencil.svg",
    imageAlt: "استencil SMT با برش لیزری دقیق",
    serviceLabel: "خدمات Stencil SMT",
  },
];

export type PricingCard = {
  tag: string;
  title: string;
  price: string;
  featured?: boolean;
  items: string[];
};

export const PRICING_CARDS: PricingCard[] = [
  {
    tag: "نمونه",
    title: "۱–۴ لایه",
    price: "$2",
    items: ["برد ۱۰۰×۱۰۰ میلی‌متر", "ساخت ۲۴ ساعته", "FR4، آلومینیوم، Rogers"],
  },
  {
    tag: "پیشرفته",
    title: "۶–۳۲ لایه",
    price: "$2",
    featured: true,
    items: ["برد ۵۰×۵۰ میلی‌متر", "ساخت ۴ روزه", "via-in-pad POFV رایگان"],
  },
];

export const NAV_LINKS = [
  { href: "#products", label: "محصولات" },
  { href: "#process", label: "فرآیند" },
  { href: "#capabilities", label: "قابلیت‌ها" },
  { href: "#order-stages", label: "مراحل سفارش" },
  { href: "#pricing", label: "قیمت‌گذاری" },
] as const;
