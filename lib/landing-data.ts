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
};

export const LANDING_PRODUCT_SUMMARIES: ProductSummary[] = [
  {
    id: "fr4",
    title: "برد FR-4",
    priceHtml: "از $2.00 / ۵ عدد",
    leadTime: "زمان ساخت: ۲۴ ساعت",
    features: ["۱ تا ۳۲ لایه", "POFV رایگان برای ۶+ لایه", "کنترل امپدانس ±۱۰٪"],
  },
  {
    id: "flex",
    title: "برد Flexible",
    priceHtml: "از $5.00 / ۵ عدد",
    leadTime: "زمان ساخت: ۳ روز",
    features: ["انعطاف‌پذیر و قابل تا شدن", "مناسب فضاهای محدود", "مونتاژ PCBA پشتیبانی می‌شود"],
  },
  {
    id: "mcpcb",
    title: "برد Metal Core",
    priceHtml: "از $39.00 / ۵ عدد",
    leadTime: "زمان ساخت: ۴ روز",
    features: ["انتقال حرارت عالی", "مناسب LED و درایور", "آلومینیوم یا مس"],
  },
  {
    id: "hf",
    title: "برد فرکانس بالا",
    priceHtml: "استعلام سفارشی",
    leadTime: "زمان ساخت: ۵–۷ روز",
    features: ["Rogers، PTFE و مواد RF", "امپدانس دقیق", "مناسب 5G و RF"],
  },
  {
    id: "pcba",
    title: "مونتاژ PCB (PCBA)",
    priceHtml: "از $8.00 / ۵ عدد",
    leadTime: "زمان ساخت: ۲۴–۴۸ ساعت",
    features: ["مونتاژ SMT و THT", "تأمین قطعات از BOM", "بازرسی AOI"],
  },
  {
    id: "stencil",
    title: "Stencil SMT",
    priceHtml: "از $3.00",
    leadTime: "زمان ساخت: ۲۴ ساعت",
    features: ["استencil فولاد", "برش لیزری دقیق", "نانو-coating با کوپن"],
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
  { href: "#process", label: "فرآیند" },
  { href: "#capabilities", label: "قابلیت‌ها" },
  { href: "#order-stages", label: "مراحل سفارش" },
  { href: "#products", label: "محصولات" },
  { href: "#pricing", label: "قیمت‌گذاری" },
] as const;
