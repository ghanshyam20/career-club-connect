
"use client";
import Link from "next/link";
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
    <main style={{ maxWidth: 800, margin: "60px auto", padding: 24 }}>
      <h1>
        Welcome, {member.first_name || member.username}!
      </h1>

      <p>You&apos;re logged in to Career Club Connect.</p>

      <section style={{ marginTop: 32 }}>
        <h2>Your profile</h2>
        <p><strong>Username:</strong> {member.username}</p>
        <p><strong>Email:</strong> {member.email}</p>
        <p style={{ marginTop: 16 }}>
            <Link href="/profile">Edit my Career Club profile →</Link>
        </p>
      </section>

      <section style={{ marginTop: 32 }}>
        <h2>Experience Library</h2>
        <p>Read other members&apos; experiences or share your own.</p>
        <Link href="/experiences">Open Experience Library →</Link>
    </section>

      <section style={{ marginTop: 32 }}>
        <h2>Coming next</h2>
        <p>
          Career experiences, community discussions, Coffee Buddy,
          and personal career actions.
        </p>
      </section>

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
  );
}
