"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import MemberAvatar from "@/components/MemberAvatar";

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
          setExperience(
            data.find((item) => item.status === "approved") ?? null
          );
        }
      } catch {
        if (active) setExperience(null);
      } finally {
        if (active) setLoading(false);
      }
    }

    void loadHighlight();

    return () => {
      active = false;
    };
  }, []);

  return (
    <section className="dashboard-highlight-section">
      <div className="dashboard-section-heading">
        <div>
          <span className="dashboard-eyebrow">FROM OUR COMMUNITY</span>
          <h2>Featured career experience</h2>
        </div>
        <Link href="/experiences" className="dashboard-browse-link">
          Browse library
        </Link>
      </div>

      <div className="dashboard-highlight-card">
        <div className="dashboard-highlight-accent" aria-hidden="true" />

        {loading ? (
          <p className="dashboard-highlight-muted">
            Finding a career story for you...
          </p>
        ) : experience ? (
          <>
            <div className="dashboard-highlight-meta">
              <span className="dashboard-highlight-badge">
                FEATURED STORY
              </span>
              <span className="dashboard-highlight-category">
                {experience.category.replaceAll("_", " ")}
              </span>
            </div>

            <h3>{experience.title}</h3>

            <p className="dashboard-highlight-excerpt">
              {experience.content.length > 240
                ? `${experience.content.slice(0, 240).trimEnd()}…`
                : experience.content}
            </p>

            <div className="dashboard-highlight-footer">
              <div className="dashboard-highlight-author">
                <MemberAvatar name={experience.author_name} size={42} />
                <div>
                  <strong>{experience.author_name}</strong>
                  <span>
                    {new Date(experience.created_at).toLocaleDateString(
                      undefined,
                      { month: "short", day: "numeric", year: "numeric" }
                    )}
                  </span>
                </div>
              </div>

              <Link href="/experiences" className="dashboard-highlight-button">
                Explore story
              </Link>
            </div>
          </>
        ) : (
          <div className="dashboard-highlight-empty">
            <h3>Your next story could inspire someone.</h3>
            <p>Share what you&apos;ve learned with the Career Club community.</p>
            <Link href="/experiences" className="dashboard-highlight-button">
              Visit Experience Library
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}
