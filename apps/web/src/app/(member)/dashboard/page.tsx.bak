
"use client";

import MemberAvatar from "@/components/MemberAvatar";
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


const [loggingOut, setLoggingOut] = useState(false);

async function handleLogout() {
  setLoggingOut(true);
  setError("");

  try {
    const csrfResponse = await fetch("/api/v1/auth/csrf/", {
      credentials: "same-origin",
      cache: "no-store",
    });

    if (!csrfResponse.ok) {
      throw new Error("Could not prepare logout.");
    }

    const { csrfToken } = await csrfResponse.json();

    const response = await fetch("/api/v1/auth/logout/", {
      method: "POST",
      credentials: "same-origin",
      headers: {
        "X-CSRFToken": csrfToken,
      },
    });

    if (!response.ok) {
      throw new Error("Logout failed. Please try again.");
    }

    router.replace("/login");
    router.refresh();
  } catch (err) {
    setError(
      err instanceof Error ? err.message : "Something went wrong."
    );
  } finally {
    setLoggingOut(false);
  }
}


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

  return (
    <>
      
      <main className="dashboard-page">
      
      
      
  <header
  style={{
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    flexWrap: "wrap",
    gap: 20,
    padding: 24,
    background: "#ffffff",
    border: "1px solid #dce4ed",
    borderRadius: 18,
    boxShadow: "0 8px 24px rgba(16, 43, 78, 0.06)",
  }}
>

  <div>
    <p
      style={{
        margin: "0 0 8px",
        color: "#1769e0",
        fontSize: 13,
        fontWeight: 700,
        letterSpacing: 1,
      }}
    >
      CAREER CLUB CONNECT
    </p>

    <h1 style={{ margin: "0 0 8px" }}>
      Welcome back, {member.first_name || member.username}!
    </h1>

    <p style={{ margin: 0, color: "#5c6b7c" }}>
      Connect, share experiences, and take your next career step.
    </p>
  </div>

  <MemberAvatar
    name={
      [member.first_name, member.last_name]
        .filter(Boolean)
        .join(" ") || member.username
    }
    size={72}
  />
</header>

<DashboardFeatureCards />
<DashboardHighlight />




<button
  type="button"
  onClick={handleLogout}
  disabled={loggingOut}
  style={{
    marginTop: 32,
    padding: "12px 24px",
    cursor: "pointer",
  }}
>
  {loggingOut ? "Logging out..." : "Log out"}
</button>

    </main>
    </>
  );
}