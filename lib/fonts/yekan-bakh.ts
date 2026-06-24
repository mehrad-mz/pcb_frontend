import localFont from "next/font/local";

/** Brand typeface — Yekan Bakh Fa-En (Persian + Latin). */
export const yekanBakh = localFont({
  src: [
    {
      path: "../../Fonts/Fa-En/Yekan Bakh Fa-En 03 Light.woff",
      weight: "300",
      style: "normal",
    },
    {
      path: "../../Fonts/Fa-En/Yekan Bakh Fa-En 04 Regular.woff",
      weight: "400",
      style: "normal",
    },
    {
      path: "../../Fonts/Fa-En/Yekan Bakh Fa-En 05 Medium.woff",
      weight: "500",
      style: "normal",
    },
    {
      path: "../../Fonts/Fa-En/Yekan Bakh Fa-En 06 Bold.woff",
      weight: "600",
      style: "normal",
    },
    {
      path: "../../Fonts/Fa-En/Yekan Bakh Fa-En 06 Bold.woff",
      weight: "700",
      style: "normal",
    },
    {
      path: "../../Fonts/Fa-En/Yekan Bakh Fa-En 07 Heavy.woff",
      weight: "800",
      style: "normal",
    },
  ],
  variable: "--font-yekan-bakh",
  display: "swap",
});
