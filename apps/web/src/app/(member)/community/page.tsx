"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

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

  return (
    <main style={{ maxWidth: 760, margin: "0 auto", padding: "24px 16px" }}>
      <h1>Community</h1>
      <p>Connect and share with Career Club members.</p>
      <form
        onSubmit={handleSubmit}
        style={{
          background: "#ffffff",
          border: "1px solid #e2e8f0",
          borderRadius: 16,
          padding: 20,
          marginTop: 24,
          marginBottom: 24,
        }}
      >
        <h2 style={{ fontSize: 18, marginBottom: 16 }}>
          Share with the community
        </h2>

        <textarea
          value={content}
          onChange={(event) => setContent(event.target.value)}
          placeholder="What's on your mind? Share a question, opportunity, or experience..."
          maxLength={3000}
          required
          rows={4}
          style={{
            width: "100%",
            padding: 12,
            border: "1px solid #cbd5e1",
            borderRadius: 10,
            resize: "vertical",
            font: "inherit",
            boxSizing: "border-box",
          }}
        />

        <div
          style={{
            display: "flex",
            gap: 12,
            marginTop: 16,
            alignItems: "center",
            flexWrap: "wrap",
            justifyContent: "space-between",
          }}
        >
          <select
            value={category}
            onChange={(event) => setCategory(event.target.value)}
            aria-label="Post category"
            style={{
              padding: 10,
              borderRadius: 8,
              border: "1px solid #cbd5e1",
            }}
          >
            {Object.entries(categories).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>

          <button
            type="submit"
            disabled={saving || !content.trim()}
            style={{
              background: "#1769e0",
              color: "#ffffff",
              border: "none",
              borderRadius: 10,
              padding: "11px 22px",
              fontWeight: 600,
              cursor: saving ? "wait" : "pointer",
              opacity: saving || !content.trim() ? 0.6 : 1,
            }}
          >
            {saving ? "Publishing..." : "Publish Post"}
          </button>
        </div>
      </form>

      {success && <p role="status">{success}</p>}

      {loading && <p>Loading community posts...</p>}

      {error && <p role="alert">{error}</p>}

      {!loading && !error && posts.length === 0 && (
        <p>No posts yet. Be the first to start a conversation!</p>
      )}

      {!loading &&
        !error &&
        posts.map((post) => (
          <article
            key={post.id}
            style={{
              background: "#ffffff",
              border: "1px solid #e2e8f0",
              borderRadius: 16,
              padding: 20,
              marginTop: 18,
            }}
          >
            <div style={{ fontWeight: 700 }}>{post.author_name}</div>

            <div style={{ fontSize: 13, color: "#64748b", marginTop: 4 }}>
              {categories[post.category] ?? post.category}
              {" · "}
              {new Date(post.created_at).toLocaleDateString()}
            </div>

            <p style={{ marginTop: 16, whiteSpace: "pre-wrap" }}>
              {post.content}
            </p>

            <button
              type="button"
              onClick={() => handleLike(post)}
              aria-label={post.is_liked ? "Unlike post" : "Like post"}
              aria-pressed={post.is_liked}
              style={{
                marginTop: 16,
                background: "transparent",
                border: "none",
                padding: "8px 0",
                color: post.is_liked ? "#1769e0" : "#475569",
                fontWeight: post.is_liked ? 700 : 400,
                cursor: "pointer",
                fontSize: 15,
              }}
            >
              {post.is_liked ? "♥" : "♡"} {post.likes_count} likes
            </button>

            <button
              type="button"
              onClick={() => handleToggleComments(post.id)}
              aria-expanded={openComments === post.id}
              style={{
                marginLeft: 24,
                background: "transparent",
                border: "none",
                color: "#475569",
                cursor: "pointer",
                fontSize: 15,
              }}
            >
              {openComments === post.id ? "Hide comments" : "💬 Comments"}
            </button>

            {openComments === post.id && (
              <section
                aria-label="Post comments"
                style={{
                  borderTop: "1px solid #e2e8f0",
                  marginTop: 16,
                  paddingTop: 16,
                }}
              >
                {commentsLoading && <p>Loading comments...</p>}

                {!commentsLoading && (comments[post.id] ?? []).length === 0 && (
                  <p>No comments yet. Start the conversation!</p>
                )}

                {!commentsLoading &&
                  (comments[post.id] ?? []).map((comment) => (
                    <div
                      key={comment.id}
                      style={{
                        background: "#f8fafc",
                        padding: 12,
                        borderRadius: 10,
                        marginBottom: 10,
                      }}
                    >
                      <strong>{comment.author_name}</strong>
                      <p style={{ marginTop: 6, whiteSpace: "pre-wrap" }}>
                        {comment.content}
                      </p>
                    </div>
                  ))}
                <form
                  onSubmit={(event) => handleSubmitComment(event, post.id)}
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: 10,
                    marginTop: 16,
                  }}
                >
                  <label htmlFor={`comment-${post.id}`}>Write a comment</label>

                  <textarea
                    id={`comment-${post.id}`}
                    value={commentText}
                    onChange={(event) => setCommentText(event.target.value)}
                    placeholder="Share your thoughts..."
                    maxLength={1000}
                    rows={3}
                    required
                    style={{
                      width: "100%",
                      boxSizing: "border-box",
                      padding: 12,
                      border: "1px solid #cbd5e1",
                      borderRadius: 10,
                      fontSize: 15,
                      resize: "vertical",
                    }}
                  />

                  <button
                    type="submit"
                    disabled={commentSaving || !commentText.trim()}
                    style={{
                      alignSelf: "flex-start",
                      background: "#1769e0",
                      color: "#ffffff",
                      border: "none",
                      borderRadius: 10,
                      padding: "10px 18px",
                      fontWeight: 600,
                      cursor: commentSaving ? "wait" : "pointer",
                      opacity: commentSaving ? 0.6 : 1,
                    }}
                  >
                    {commentSaving ? "Posting..." : "Post Comment"}
                  </button>
                </form>
              </section>
            )}
          </article>
        ))}
    </main>
  );
}
