/** Data for landing sections kept for reuse on other pages (not shown on `/`). */

export const ORDER_STEPS = [
  "ثبت سفارش",
  "پرس‌فایل",
  "تایید مشتری",
  "بیش‌افزاری",
  "پرداخت",
  "در حال ساخت",
  "تحویل شده",
] as const;

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
