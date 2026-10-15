import type { ReactNode } from "react";
import AppNavigation from "@/components/AppNavigation";

export default function MemberLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <div className="member-shell">
      <AppNavigation />
      <div className="member-content">{children}</div>
    </div>
  );
}