import type { ReactNode } from "react";

type LoginLayoutProps = {
  children: ReactNode;
};

export default function LoginLayout({ children }: LoginLayoutProps) {
  return <div className="auth-login">{children}</div>;
}
