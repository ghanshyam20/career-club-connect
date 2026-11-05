"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import "../auth.css";

function ApprovalContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isPendingLogin = searchParams.get("status") === "pending";
  const [message, setMessage] = useState("Checking your approval status...");

  useEffect(() => {
    const token = sessionStorage.getItem("careerclub_approval_token");

    if (!token) {
      setMessage("You can return to login to check whether your account is approved.");
      return;
    }

    let stopped = false;

    async function checkApproval() {
      try {
        const response = await fetch("/api/v1/auth/approval-status/", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token }),
          cache: "no-store",
        });

        if (!response.ok) {
          if (response.status === 400) {
            sessionStorage.removeItem("careerclub_approval_token");
            setMessage("Your approval check expired. Return to login to check again.");
          } else {
            setMessage("Unable to check right now. Retrying...");
          }
          return;
        }

        const result = await response.json();

        if (stopped) return;

        if (result.approved) {
          sessionStorage.removeItem("careerclub_approval_token");
          router.replace("/login?approved=1");
        } else {
          setMessage("Waiting for administrator approval. This page checks automatically every 5 seconds.");
        }
      } catch {
        if (!stopped) setMessage("Connection interrupted. Retrying...");
      }
    }

    void checkApproval();
    const interval = setInterval(() => void checkApproval(), 5000);

    return () => {
      stopped = true;
      clearInterval(interval);
    };
  }, [router]);

  return (
    <main className="auth-page">
      <section className="auth-card">
        <Link href="/" className="auth-brand">
          <span className="auth-brand-mark">CC</span>
          <span>Career Club Connect</span>
        </Link>
        <div style={{ fontSize: 40, marginBottom: 12 }}>⏳</div>
        <h1>
          {isPendingLogin
            ? "Your account is pending approval"
            : "Registration submitted!"}
        </h1>
        <p className="auth-description">
          Thank you for joining Career Club Connect.
          Your registration is awaiting administrator approval.
        </p>
        <div className="approval-notice">
          <strong>What happens next?</strong>
          <p>{message}</p>
          <p>You do not need to register again.</p>
          <p>Once approved, you will be redirected to login automatically.</p>
        </div>
        <Link href="/login" className="auth-submit approval-login-link">
          Back to login
        </Link>
      </section>
    </main>
  );
}

export default function ApprovalPage() {
  return (
    <Suspense fallback={<main style={{ padding: 24 }}>Loading...</main>}>
      <ApprovalContent />
    </Suspense>
  );
}
