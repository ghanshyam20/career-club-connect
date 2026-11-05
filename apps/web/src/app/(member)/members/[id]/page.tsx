"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import "./member.css";

type Experience = {
  id: number;
  title: string;
  category: string;
  content: string;
  created_at: string;
};

type Post = {
  id: number;
  category: string;
  content: string;
  created_at: string;
};

type Member = {
  id: number;
  username: string;
  name: string;
  career_club_round: number | null;
  bio: string;
  skills: string;
  career_interests: string;
  experiences: Experience[];
  posts: Post[];
};

export default function MemberDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [member, setMember] = useState<Member | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    async function loadMember() {
      try {
        const response = await fetch(
          `/api/v1/profiles/members/${params.id}/`,
          { credentials: "same-origin", cache: "no-store" }
        );

        if (response.status === 401 || response.status === 403) {
          router.replace("/login");
          return;
        }

        if (!response.ok) {
          throw new Error("Participant profile not found.");
        }

        const data: Member = await response.json();
        if (active) setMember(data);
      } catch (err) {
        if (active) {
          setError(
            err instanceof Error ? err.message : "Could not load profile."
          );
        }
      } finally {
        if (active) setLoading(false);
      }
    }

    void loadMember();

    return () => {
      active = false;
    };
  }, [params.id, router]);

  if (loading) {
    return <main className="member-detail">Loading participant profile...</main>;
  }

  if (error || !member) {
    return (
      <main className="member-detail">
        <h1>Profile unavailable</h1>
        <p>{error || "Participant not found."}</p>
        <Link href="/search">Back to Search & Explore</Link>
      </main>
    );
  }

  const skills = member.skills.split(",").map((s) => s.trim()).filter(Boolean);

  return (
    <main className="member-detail">
      <Link className="member-back" href="/search">
        ← Back to Search & Explore
      </Link>

      <section className="member-hero">
        <div className="member-avatar">
          {member.name.charAt(0).toUpperCase()}
        </div>

        <div>
          <h1>{member.name}</h1>


          {member.career_club_round !== null && (
            <span className="member-round">
              Career Club · Round {member.career_club_round}
            </span>
          )}
        </div>
      </section>

      <section className="member-section">
        <h2>About</h2>
        <p>{member.bio || "No introduction added yet."}</p>
      </section>

      <section className="member-section">
        <h2>Skills</h2>
        {skills.length ? (
          <div className="member-skills">
            {skills.map((skill) => (
              <span key={skill}>{skill}</span>
            ))}
          </div>
        ) : (
          <p>No skills listed yet.</p>
        )}
      </section>

      <section className="member-section">
        <h2>Career interests</h2>
        <p>{member.career_interests || "No career interests listed yet."}</p>
      </section>

      <section className="member-section">
        <h2>Career experiences ({member.experiences.length})</h2>

        {member.experiences.length === 0 ? (
          <p>No public career experiences yet.</p>
        ) : (
          <div className="member-content-list">
            {member.experiences.map((experience) => (
              <article className="member-content-card" key={experience.id}>
                <span className="member-content-category">
                  {experience.category.replaceAll("_", " ")}
                </span>
                <h3>
                  <Link
                    href={`/experiences/${experience.id}`}
                    className="member-experience-link"
                  >
                    {experience.title}
                  </Link>
                </h3>
                <p>{experience.content}</p>
              </article>
            ))}
          </div>
        )}
      </section>

      <section className="member-section">
        <h2>Community contributions ({member.posts.length})</h2>

        {member.posts.length === 0 ? (
          <p>No community contributions yet.</p>
        ) : (
          <div className="member-content-list">
            {member.posts.map((post) => (
              <article className="member-content-card" key={post.id}>
                <span className="member-content-category">
                  {post.category.replaceAll("_", " ")}
                </span>
                <p>{post.content}</p>
              </article>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
