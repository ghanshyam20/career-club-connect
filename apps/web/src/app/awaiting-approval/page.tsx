"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import "../auth.css";

export default function AwaitingApprovalPage() {
  const searchParams = useSearchParams();
  const isPendingLogin = searchParams.get("status") === "pending";

  return (
    <main className="auth-page">
      <section className="auth-card">
        <Link href="/" className="auth-brand">
          <span className="auth-brand-mark">CC</span>
          <span>Career Club Connect</span>
        </Link>

        <div style={{ fontSize: 40, marginBottom: 12 }}>
          ⏳
        </div>

        <h1>
          {isPendingLogin
            ? "Your account is pending approval"
            : "Registration submitted!"}
        </h1>

        <p className="auth-description">
          {isPendingLogin
            ? "Your registration has been received, but an administrator has not approved your account yet."
            : "Thank you for joining Career Club Connect. Your account is now awaiting administrator approval."}
        </p>

        <div className="approval-notice">
          <strong>What happens next?</strong>

          <p>
            Our administrator will review your registration.
            Once approved, you can log in using the same
            email and password.
          </p>

          <p>You do not need to register again.</p>
        </div>

        <Link href="/login" className="auth-submit approval-login-link">
          Back to login
        </Link>
      </section>
    </main>
  );
}
