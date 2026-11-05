"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import "./detail.css";

type Experience = {
  id: number;
  title: string;
  category: string;
  content: string;
  author_name: string;
  author_id: number | null;
  publish_anonymously: boolean;
  created_at: string;
};

const categoryNames: Record<string, string> = {
  job_application: "Job Application",
  interview: "Interview",
  internship: "Internship",
  networking: "Networking",
  other: "Other",
};

export default function ExperienceDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id;

  const [experience, setExperience] = useState<Experience | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    async function loadExperience() {
      try {
        const response = await fetch(`/api/v1/experiences/${id}/`, {
          credentials: "same-origin",
          cache: "no-store",
        });

        if (response.status === 401 || response.status === 403) {
          router.replace("/login");
          return;
        }

        if (response.status === 404) {
          throw new Error("This experience is unavailable or has not been approved.");
        }

        if (!response.ok) {
          throw new Error("Could not load this experience.");
        }

        const data: Experience = await response.json();

        if (active) setExperience(data);
      } catch (err) {
        if (active) {
          setError(err instanceof Error ? err.message : "Something went wrong.");
        }
      } finally {
        if (active) setLoading(false);
      }
    }

    if (id) void loadExperience();

    return () => {
      active = false;
    };
  }, [id, router]);

  if (loading) {
    return (
      <main className="experience-detail-page">
        <p>Loading experience...</p>
      </main>
    );
  }

  if (error || !experience) {
    return (
      <main className="experience-detail-page">
        <div className="experience-detail-card">
          <h1>Experience unavailable</h1>
          <p>{error || "This experience could not be found."}</p>
          <Link href="/experiences">Return to Experience Library</Link>
        </div>
      </main>
    );
  }

  const authorInitials = experience.author_name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");

  return (
    <main className="experience-detail-page">
      <Link href="/experiences" className="experience-detail-back">
        Back to Experience Library
      </Link>

      <article className="experience-detail-card">
        <div className="experience-detail-topline">
          <span className="experience-detail-category">
            {categoryNames[experience.category] || experience.category}
          </span>
          <time dateTime={experience.created_at}>
            {new Date(experience.created_at).toLocaleDateString("en-GB", {
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
          </time>
        </div>

        <h1>{experience.title}</h1>

        <div className="experience-detail-author">
          <div className="experience-detail-avatar" aria-hidden="true">
            {authorInitials || "CC"}
          </div>

          <div>
            <strong>{experience.author_name}</strong>
            <p>
              {experience.publish_anonymously
                ? "Shared anonymously"
                : "Career Club community member"}
            </p>
          </div>
        </div>

        <div className="experience-detail-content">
          {experience.content}
        </div>
      </article>

      <section className="experience-detail-connect">
        <div>
          <span className="experience-detail-kicker">KEEP THE CONVERSATION GOING</span>
          <h2>Learn from the people behind the experiences.</h2>
          <p>
            Explore member profiles and connect through Career Club Coffee Buddy.
          </p>
        </div>

        <div className="experience-detail-actions">
          {experience.author_id !== null && !experience.publish_anonymously && (
            <Link
              href={`/members/${experience.author_id}`}
              className="experience-detail-primary"
            >
              View author profile
            </Link>
          )}

          <Link href="/coffee-buddy" className="experience-detail-secondary">
            Explore Coffee Buddy
          </Link>
        </div>
      </section>
    </main>
  );
}
