
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import "./AppNavigation.css";

const navigation = [
  { label: "Home", href: "/dashboard", icon: "⌂" },
  { label: "Explore", href: "/experiences", icon: "⌕" },
  { label: "Community", href: null, icon: "▤" },
  { label: "Coffee Buddy", href: null, icon: "☕" },
  { label: "My Actions", href: null, icon: "☑" },
  { label: "Profile", href: "/profile", icon: "♙" },
];

export default function AppNavigation() {
  const pathname = usePathname();

  return (
    <>
      <aside className="app-sidebar" aria-label="Main navigation">
        <Link className="app-brand" href="/dashboard">
          <span className="app-brand-mark">CC</span>
          <span>
            Career Club
            <strong>Connect</strong>
          </span>
        </Link>

        <nav className="app-nav-links">
          {navigation.map((item) => {
            const active = item.href === pathname;

            return item.href ? (
              <Link
                key={item.label}
                href={item.href}
                className={`app-nav-link ${active ? "active" : ""}`}
                aria-current={active ? "page" : undefined}
              >
                <span className="app-nav-icon" aria-hidden="true">
                  {item.icon}
                </span>
                {item.label}
              </Link>
            ) : (
              <span
                key={item.label}
                className="app-nav-link disabled"
                title="Coming soon"
              >
                <span className="app-nav-icon" aria-hidden="true">
                  {item.icon}
                </span>
                {item.label}
              </span>
            );
          })}
        </nav>

        
      </aside>

      <nav className="app-bottom-nav" aria-label="Mobile navigation">
        {navigation.map((item) => {
          const active = item.href === pathname;

          return item.href ? (
            <Link
              key={item.label}
              href={item.href}
              className={`app-bottom-link ${active ? "active" : ""}`}
              aria-current={active ? "page" : undefined}
            >
              <span aria-hidden="true">{item.icon}</span>
              <small>{item.label}</small>
            </Link>
          ) : (
            <span
              key={item.label}
              className="app-bottom-link disabled"
              title="Coming soon"
            >
              <span aria-hidden="true">{item.icon}</span>
              <small>{item.label}</small>
            </span>
          );
        })}
      </nav>
    </>
  );
}
