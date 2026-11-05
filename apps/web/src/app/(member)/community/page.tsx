"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import "./community.css";

type CommunityPost = {
  id: number;
  author_name: string;
  content: string;
  category: string;
  likes_count: number;
  is_liked: boolean;
  created_at: string;
  updated_at: string;
};

type PostComment = {
  id: number;
  author_name: string;
  content: string;
  created_at: string;
  updated_at: string;
};

const categories: Record<string, string> = {
  general: "General",
  career_advice: "Career Advice",
  job_opportunity: "Job Opportunity",
  event: "Event",
  question: "Question",
};

export default function CommunityPage() {
  const router = useRouter();

  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [activeCategory, setActiveCategory] = useState("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [content, setContent] = useState("");
  const [category, setCategory] = useState("general");
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState("");
  const [comments, setComments] = useState<Record<number, PostComment[]>>({});
  const [openComments, setOpenComments] = useState<number | null>(null);
  const [commentsLoading, setCommentsLoading] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [commentSaving, setCommentSaving] = useState(false);

  useEffect(() => {
    let active = true;

    async function loadPosts() {
      try {
        const response = await fetch("/api/v1/forum/posts/", {
          credentials: "same-origin",
          cache: "no-store",
        });

        if (response.status === 401 || response.status === 403) {
          router.replace("/login");
          return;
        }

        if (!response.ok) {
          throw new Error("Could not load community posts.");
        }

        const data: CommunityPost[] = await response.json();

        if (active) {
          setPosts(data);
        }
      } catch (err) {
        if (active) {
          setError(err instanceof Error ? err.message : "Connection error.");
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    loadPosts();

    return () => {
      active = false;
    };
  }, [router]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!content.trim()) {
      setError("Please write something before posting.");
      return;
    }

    setSaving(true);
    setError("");
    setSuccess("");

    try {
      const csrfResponse = await fetch("/api/v1/auth/csrf/", {
        credentials: "same-origin",
      });

      if (!csrfResponse.ok) {
        throw new Error("Could not verify your session.");
      }

      const { csrfToken } = await csrfResponse.json();

      const response = await fetch("/api/v1/forum/posts/", {
        method: "POST",
        credentials: "same-origin",
        headers: {
          "Content-Type": "application/json",
          "X-CSRFToken": csrfToken,
        },
        body: JSON.stringify({
          content: content.trim(),
          category,
        }),
      });

      if (response.status === 401 || response.status === 403) {
        router.replace("/login");
        return;
      }

      if (!response.ok) {
        throw new Error("Could not publish your post.");
      }

      const newPost: CommunityPost = await response.json();

      setPosts((previous) => [newPost, ...previous]);
      setContent("");
      setCategory("general");
      setSuccess("Your post has been published!");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Connection error.");
    } finally {
      setSaving(false);
    }
  }

  async function handleLike(post: CommunityPost) {
    setError("");

    try {
      const csrfResponse = await fetch("/api/v1/auth/csrf/", {
        credentials: "same-origin",
      });

      if (!csrfResponse.ok) {
        throw new Error("Could not verify your session.");
      }

      const { csrfToken } = await csrfResponse.json();

      const response = await fetch(`/api/v1/forum/posts/${post.id}/like/`, {
        method: post.is_liked ? "DELETE" : "POST",
        credentials: "same-origin",
        headers: {
          "X-CSRFToken": csrfToken,
        },
      });

      if (response.status === 401 || response.status === 403) {
        router.replace("/login");
        return;
      }

      if (!response.ok) {
        throw new Error("Could not update your like.");
      }

      const result: { liked: boolean; likes_count: number } =
        await response.json();

      setPosts((previous) =>
        previous.map((item) =>
          item.id === post.id
            ? {
                ...item,
                is_liked: result.liked,
                likes_count: result.likes_count,
              }
            : item,
        ),
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Connection error.");
    }
  }

  async function handleToggleComments(postId: number) {
    if (openComments === postId) {
      setOpenComments(null);
      return;
    }

    setOpenComments(postId);
    setCommentsLoading(true);
    setError("");

    try {
      const response = await fetch(`/api/v1/forum/posts/${postId}/comments/`, {
        credentials: "same-origin",
        cache: "no-store",
      });

      if (response.status === 401 || response.status === 403) {
        router.replace("/login");
        return;
      }

      if (!response.ok) {
        throw new Error("Could not load comments.");
      }

      const data: PostComment[] = await response.json();

      setComments((previous) => ({
        ...previous,
        [postId]: data,
      }));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Connection error.");
    } finally {
      setCommentsLoading(false);
    }
  }

  async function handleSubmitComment(
    event: FormEvent<HTMLFormElement>,
    postId: number,
  ) {
    event.preventDefault();

    const text = commentText.trim();

    if (!text || commentSaving) {
      return;
    }

    setCommentSaving(true);
    setError("");

    try {
      const csrfResponse = await fetch("/api/v1/auth/csrf/", {
        credentials: "same-origin",
      });

      if (!csrfResponse.ok) {
        throw new Error("Could not verify your session.");
      }

      const { csrfToken } = await csrfResponse.json();

      const response = await fetch(`/api/v1/forum/posts/${postId}/comments/`, {
        method: "POST",
        credentials: "same-origin",
        headers: {
          "Content-Type": "application/json",
          "X-CSRFToken": csrfToken,
        },
        body: JSON.stringify({ content: text }),
      });

      if (response.status === 401 || response.status === 403) {
        router.replace("/login");
        return;
      }

      if (!response.ok) {
        throw new Error("Could not publish your comment.");
      }

      const newComment: PostComment = await response.json();

      setComments((previous) => ({
        ...previous,
        [postId]: [...(previous[postId] ?? []), newComment],
      }));

      setCommentText("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Connection error.");
    } finally {
      setCommentSaving(false);
    }
  }

  const visiblePosts = posts.filter(
    (post) => activeCategory === "all" || post.category === activeCategory
  );

  const initials = (name: string) =>
    name
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((part) => part.charAt(0).toUpperCase())
      .join("") || "CC";

  const formatDate = (value: string) =>
    new Date(value).toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
      year: "numeric",
    });

  return (
    <main className="community-page">
      <header className="community-hero">
        <div>
          <span className="community-eyebrow">CAREER CLUB CONNECT</span>
          <h1>Community</h1>
          <p>
            Share ideas, ask questions, and grow together with your
            Career Club community.
          </p>
        </div>
        <div className="community-hero-decoration" aria-hidden="true">
          <span>✦</span>
        </div>
      </header>

      <div className="community-layout">
        <div className="community-main">
          <form className="community-composer" onSubmit={handleSubmit}>
            <div className="community-composer-heading">
              <div className="community-composer-icon">✎</div>
              <div>
                <h2>Start a conversation</h2>
                <p>Have something valuable to share?</p>
              </div>
            </div>

            <label className="community-sr-only" htmlFor="community-content">
              Write your community post
            </label>
            <textarea
              id="community-content"
              value={content}
              onChange={(event) => setContent(event.target.value)}
              placeholder="Share a question, an opportunity, an experience, or something you've learned..."
              maxLength={3000}
              required
              rows={4}
              className="community-composer-textarea"
            />

            <div className="community-composer-footer">
              <div className="community-composer-options">
                <label htmlFor="community-category">Topic</label>
                <select
                  id="community-category"
                  value={category}
                  onChange={(event) => setCategory(event.target.value)}
                >
                  {Object.entries(categories).map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
                <span className="community-character-count">
                  {content.length}/3000
                </span>
              </div>

              <button
                className="community-primary-button"
                type="submit"
                disabled={saving || !content.trim()}
              >
                {saving ? "Publishing..." : "Publish post"}
              </button>
            </div>
          </form>

          {success && (
            <p className="community-feedback community-success" role="status">
              {success}
            </p>
          )}
          {error && (
            <p className="community-feedback community-error" role="alert">
              {error}
            </p>
          )}

          <section className="community-feed" aria-label="Community discussions">
            <div className="community-feed-heading">
              <div>
                <span className="community-eyebrow">DISCUSSIONS</span>
                <h2>Community feed</h2>
              </div>
              <span className="community-post-count">
                {visiblePosts.length} posts
              </span>
            </div>

            <div className="community-filters" aria-label="Filter posts">
              {[
                ["all", "All posts"],
                ...Object.entries(categories),
              ].map(([value, label]) => (
                <button
                  key={value}
                  type="button"
                  className={
                    activeCategory === value
                      ? "community-filter active"
                      : "community-filter"
                  }
                  aria-pressed={activeCategory === value}
                  onClick={() => setActiveCategory(value)}
                >
                  {label}
                </button>
              ))}
            </div>

            {loading && (
              <div className="community-empty">Loading discussions...</div>
            )}

            {!loading && visiblePosts.length === 0 && (
              <div className="community-empty">
                <div className="community-empty-icon">✦</div>
                <h3>No discussions here yet</h3>
                <p>Start a conversation or explore another topic.</p>
              </div>
            )}

            {!loading &&
              visiblePosts.map((post) => (
                <article className="community-post" key={post.id}>
                  <div className="community-post-header">
                    <div className="community-avatar">
                      {initials(post.author_name)}
                    </div>
                    <div className="community-author-info">
                      <strong>{post.author_name}</strong>
                      <span>{formatDate(post.created_at)}</span>
                    </div>
                    <span
                      className={`community-category community-category-${post.category}`}
                    >
                      {categories[post.category] ?? post.category}
                    </span>
                  </div>

                  <p className="community-post-content">{post.content}</p>

                  <div className="community-post-actions">
                    <button
                      type="button"
                      className={
                        post.is_liked
                          ? "community-action liked"
                          : "community-action"
                      }
                      onClick={() => void handleLike(post)}
                      aria-label={post.is_liked ? "Unlike post" : "Like post"}
                      aria-pressed={post.is_liked}
                    >
                      <span aria-hidden="true">
                        {post.is_liked ? "♥" : "♡"}
                      </span>
                      {post.likes_count} {post.likes_count === 1 ? "Like" : "Likes"}
                    </button>

                    <button
                      type="button"
                      className="community-action"
                      onClick={() => void handleToggleComments(post.id)}
                      aria-expanded={openComments === post.id}
                    >
                      <span aria-hidden="true">▤</span>
                      {openComments === post.id ? "Hide comments" : "Comments"}
                    </button>
                  </div>

                  {openComments === post.id && (
                    <section
                      className="community-comments"
                      aria-label="Post comments"
                    >
                      <h3>Conversation</h3>

                      {commentsLoading && <p>Loading comments...</p>}

                      {!commentsLoading &&
                        (comments[post.id] ?? []).length === 0 && (
                          <p className="community-muted">
                            No comments yet. Be the first to reply.
                          </p>
                        )}

                      {!commentsLoading &&
                        (comments[post.id] ?? []).map((comment) => (
                          <div className="community-comment" key={comment.id}>
                            <div className="community-comment-avatar">
                              {initials(comment.author_name)}
                            </div>
                            <div className="community-comment-body">
                              <div className="community-comment-meta">
                                <strong>{comment.author_name}</strong>
                                <span>{formatDate(comment.created_at)}</span>
                              </div>
                              <p>{comment.content}</p>
                            </div>
                          </div>
                        ))}

                      <form
                        className="community-comment-form"
                        onSubmit={(event) =>
                          void handleSubmitComment(event, post.id)
                        }
                      >
                        <label htmlFor={`comment-${post.id}`}>
                          Add your comment
                        </label>
                        <textarea
                          id={`comment-${post.id}`}
                          value={commentText}
                          onChange={(event) =>
                            setCommentText(event.target.value)
                          }
                          placeholder="Write a thoughtful reply..."
                          maxLength={1000}
                          rows={3}
                          required
                        />
                        <button
                          type="submit"
                          className="community-primary-button"
                          disabled={commentSaving || !commentText.trim()}
                        >
                          {commentSaving ? "Posting..." : "Post comment"}
                        </button>
                      </form>
                    </section>
                  )}
                </article>
              ))}
          </section>
        </div>

        <aside className="community-sidebar" aria-label="Community information">
          <section className="community-side-card community-welcome">
            <div className="community-side-symbol">✦</div>
            <h2>Better together.</h2>
            <p>
              A space to exchange knowledge, support fellow members,
              and make meaningful career connections.
            </p>
          </section>

          <section className="community-side-card">
            <h2>Explore topics</h2>
            <p>Find conversations that matter to you.</p>

            <div className="community-topic-list">
              {Object.entries(categories).map(([value, label]) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setActiveCategory(value)}
                  className={
                    activeCategory === value
                      ? "community-topic selected"
                      : "community-topic"
                  }
                >
                  <span className="community-topic-dot" />
                  {label}
                  <span className="community-topic-count">
                    {posts.filter((post) => post.category === value).length}
                  </span>
                </button>
              ))}
            </div>
          </section>

          <section className="community-side-card community-guidelines">
            <h2>Community guidelines</h2>
            <p>
              Be respectful, share useful insights, and keep
              discussions constructive.
            </p>
            <div className="community-guideline-note">
              Every conversation is an opportunity to learn.
            </div>
          </section>
        </aside>
      </div>
    </main>
  );
}
