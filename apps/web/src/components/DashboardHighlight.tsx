"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type Experience = {
  id: number;
  title: string;
  category: string;
  content: string;
  author_name: string;
  status: string;
  created_at: string;
};

export default function DashboardHighlight() {
  const [experience, setExperience] = useState<Experience | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    async function loadHighlight() {
      try {
        const response = await fetch("/api/v1/experiences/", {
          credentials: "same-origin",
          cache: "no-store",
        });

        if (!response.ok) {
          throw new Error("Could not load experiences.");
        }

        const data: Experience[] = await response.json();

        if (active) {
          const approved = data.filter(
            (item) => item.status === "approved"
          );

          setExperience(approved[0] ?? null);
        }
      } catch {
        if (active) {
          setExperience(null);
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    loadHighlight();

    return () => {
      active = false;
    };
  }, []);

  return (
    <section
      style={{
        marginTop: 28,
        padding: 24,
        background: "#ffffff",
        border: "1px solid #dce4ed",
        borderRadius: 18,
      }}
    >
      <h2 style={{ marginTop: 0 }}>Today&apos;s Highlight</h2>

      {loading ? (
        <p>Loading a career experience...</p>
      ) : experience ? (
        <>
          <p
            style={{
              color: "#1769e0",
              fontWeight: 700,
              marginBottom: 8,
            }}
          >
            {experience.title}
          </p>

          <p style={{ color: "#42566f", lineHeight: 1.7 }}>
            {experience.content}
          </p>

          <p style={{ color: "#64748b", fontSize: 13 }}>
            Shared by {experience.author_name}
          </p>

          <Link href="/experiences">
            Explore more experiences →
          </Link>
        </>
      ) : (
        <>
          <p>No approved career experiences available yet.</p>
          <Link href="/experiences">
            Explore Experience Library →
          </Link>
        </>
      )}
    </section>
  );
}