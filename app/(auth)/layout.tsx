import type { ReactNode } from "react";

import "./auth.css";

type AuthLayoutProps = {
  children: ReactNode;
};

export default function AuthLayout({ children }: AuthLayoutProps) {
  return <div className="auth-page">{children}</div>;
}
