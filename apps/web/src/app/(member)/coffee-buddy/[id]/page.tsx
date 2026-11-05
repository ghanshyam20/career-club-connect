"use client";

import {
  FormEvent,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import "./chat.css";

type Message = {
  id: number;
  sender: number;
  sender_name: string;
  content: string;
  created_at: string;
};

export default function CoffeeChatPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const [messages, setMessages] = useState<Message[]>([]);
  const [myId, setMyId] = useState<number | null>(null);
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");

  const bottomRef = useRef<HTMLDivElement>(null);
  const messageListRef = useRef<HTMLDivElement>(null);
  const shouldScrollRef = useRef(true);

  const loadMessages = useCallback(async () => {
    try {
      const response = await fetch(
        `/api/v1/coffee-buddy/${id}/messages/`,
        {
          credentials: "same-origin",
          cache: "no-store",
        }
      );

      if (response.status === 401) {
        router.replace("/login");
        return;
      }

      if (!response.ok) {
        throw new Error(
          response.status === 403
            ? "You do not have access to this conversation."
            : "Conversation unavailable."
        );
      }

      const data: Message[] = await response.json();

      setMessages(data);
      setError("");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Connection failed."
      );
    } finally {
      setLoading(false);
    }
  }, [id, router]);

  useEffect(() => {
    const loadInitialMessages = async () => {
      await loadMessages();
    };

    void loadInitialMessages();

    const interval = window.setInterval(() => {
      if (document.visibilityState === "visible") {
        void loadMessages();
      }
    }, 5000);

    return () => window.clearInterval(interval);
  }, [loadMessages]);

  useEffect(() => {
    let active = true;

    fetch("/api/v1/auth/me/", {
      credentials: "same-origin",
    })
      .then((response) =>
        response.ok ? response.json() : null
      )
      .then((user) => {
        if (active && user) setMyId(user.id);
      })
      .catch(() => {});

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (shouldScrollRef.current && !loading) {
      bottomRef.current?.scrollIntoView({
        behavior: "auto",
        block: "nearest",
      });
    }
  }, [messages, loading]);

  function handleMessageScroll() {
    const element = messageListRef.current;
    if (!element) return;

    const distanceFromBottom =
      element.scrollHeight -
      element.scrollTop -
      element.clientHeight;

    shouldScrollRef.current = distanceFromBottom < 100;
  }

  async function sendMessage(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    if (!content.trim() || sending) return;

    setSending(true);
    setError("");

    try {
      const csrfResponse = await fetch(
        "/api/v1/auth/csrf/",
        { credentials: "same-origin" }
      );

      if (!csrfResponse.ok) {
        throw new Error("Could not prepare message.");
      }

      const { csrfToken } = await csrfResponse.json();

      const response = await fetch(
        `/api/v1/coffee-buddy/${id}/messages/`,
        {
          method: "POST",
          credentials: "same-origin",
          headers: {
            "Content-Type": "application/json",
            "X-CSRFToken": csrfToken,
          },
          body: JSON.stringify({
            content: content.trim(),
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Could not send message.");
      }

      setContent("");
      shouldScrollRef.current = true;
      await loadMessages();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Message failed."
      );
    } finally {
      setSending(false);
    }
  }

  const otherMember = messages.find(
    (message) => message.sender !== myId
  )?.sender_name;

  return (
    <main className="coffee-chat-page">
      <Link
        href="/coffee-buddy"
        className="coffee-chat-back"
      >
        ← Back to Coffee Buddy
      </Link>

      <section className="coffee-chat-shell">
        <header className="coffee-chat-header">
          <div className="coffee-chat-avatar">
            {(otherMember || "C").charAt(0).toUpperCase()}
          </div>

          <div className="coffee-chat-header-info">
            <h1>{otherMember || "Coffee Buddy conversation"}</h1>
            <p>Private conversation · Coffee Buddy</p>
          </div>
        </header>

        <div className="coffee-chat-meeting-note">
          <span aria-hidden="true">☕</span>
          <span>
            Arrange an online call or agree on a public
            meeting place and time through this chat.
          </span>
        </div>

        <div
          className="coffee-chat-messages"
          ref={messageListRef}
          onScroll={handleMessageScroll}
          role="log"
          aria-label="Conversation messages"
          aria-live="polite"
          aria-relevant="additions"
        >
          {loading ? (
            <div className="coffee-chat-empty">
              Loading conversation...
            </div>
          ) : messages.length === 0 ? (
            <div className="coffee-chat-empty">
              <span className="coffee-chat-empty-icon">☕</span>
              <h2>Start the conversation</h2>
              <p>
                Say hello and introduce yourself.
                You can arrange your meeting here.
              </p>
            </div>
          ) : (
            messages.map((message) => {
              const mine = message.sender === myId;

              return (
                <article
                  key={message.id}
                  className={`coffee-chat-message ${
                    mine ? "mine" : "theirs"
                  }`}
                >
                  <div className="coffee-chat-bubble">
                    {!mine && (
                      <strong className="coffee-chat-sender">
                        {message.sender_name}
                      </strong>
                    )}

                    <p>{message.content}</p>

                    <time
                      dateTime={message.created_at}
                      className="coffee-chat-time"
                    >
                      {new Date(
                        message.created_at
                      ).toLocaleString([], {
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </time>
                  </div>
                </article>
              );
            })
          )}

          <div ref={bottomRef} />
        </div>

        {error && (
          <div
            className="coffee-chat-error"
            role="alert"
          >
            {error}
          </div>
        )}

        <form
          onSubmit={sendMessage}
          className="coffee-chat-composer"
        >
          <label
            htmlFor="coffee-message"
            className="coffee-chat-label"
          >
            Your message
          </label>

          <div className="coffee-chat-compose-row">
            <textarea
              id="coffee-message"
              value={content}
              onChange={(event) =>
                setContent(event.target.value)
              }
              maxLength={2000}
              rows={2}
              placeholder="Write a message..."
              required
            />

            <button
              type="submit"
              disabled={sending || !content.trim()}
              className="coffee-chat-send"
            >
              {sending ? "Sending..." : "Send"}
            </button>
          </div>

          <small className="coffee-chat-hint">
            Messages are visible only to participants
            in this conversation.
          </small>
        </form>
      </section>
    </main>
  );
}
