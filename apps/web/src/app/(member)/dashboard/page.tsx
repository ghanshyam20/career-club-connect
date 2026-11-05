
"use client";

import MemberAvatar from "@/components/MemberAvatar";
import Link from "next/link";
import DashboardFeatureCards from "@/components/DashboardFeatureCards";
import DashboardHighlight from "@/components/DashboardHighlight";

import "./dashboard.css";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type Member = {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
};

export default function DashboardPage() {
  const router = useRouter();
  const [member, setMember] = useState<Member | null>(null);
  const [error, setError] = useState("");


  useEffect(() => {
    let active = true;

    async function loadMember() {
      try {
        const response = await fetch("/api/v1/auth/me/", {
          credentials: "same-origin",
          cache: "no-store",
        });

        if (response.status === 401 || response.status === 403) {
          router.replace("/login");
          return;
        }

        if (!response.ok) {
          throw new Error("Could not load your profile.");
        }

        const data: Member = await response.json();

        if (active) {
          setMember(data);
        }
      } catch {
        if (active) {
          setError("Could not connect to the server. Please try again.");
        }
      }
    }

    loadMember();

    return () => {
      active = false;
    };
  }, [router]);

  if (error) {
    return <main style={{ padding: 32 }}><p role="alert">{error}</p></main>;
  }

  if (!member) {
    return <main style={{ padding: 32 }}>Loading your dashboard...</main>;
  }


  const fullName =
    [member.first_name, member.last_name].filter(Boolean).join(" ") ||
    member.email ||
    "Career Club member";

  return (
    <main className="dashboard-page">
      <header className="dashboard-welcome">
        <div className="dashboard-welcome-copy">
          <span className="dashboard-eyebrow">YOUR CAREER CLUB SPACE</span>
          <h1>Welcome back, {member.first_name || fullName}!</h1>
          <p>
            Discover fresh perspectives, connect with members, and
            keep moving toward your career goals.
          </p>
          <Link href="/profile" className="dashboard-profile-text-link">
            View your profile
          </Link>
        </div>

        <Link
          href="/profile"
          className="dashboard-avatar-link"
          aria-label="Open my profile"
          title="View my profile"
        >
          <MemberAvatar name={fullName} size={76} />
        </Link>
      </header>

      <DashboardFeatureCards />
      <DashboardHighlight />
    </main>
  );
}
