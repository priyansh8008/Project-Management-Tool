export default function VerifiedSuccessPage() {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        minHeight: "100vh",
        backgroundColor: "#f9fafb",
        color: "#111827",
        textAlign: "center",
      }}
    >
      <h1 style={{ fontSize: "2rem", fontWeight: "bold" }}>
        ✅ Email Verified Successfully!
      </h1>
      <p style={{ marginTop: "1rem", fontSize: "1.2rem" }}>
        Your account has been verified. You can now log in to your account.
      </p>
      <a
        href="/login"
        style={{
          marginTop: "2rem",
          backgroundColor: "#2563eb",
          color: "#fff",
          padding: "0.75rem 1.5rem",
          borderRadius: "0.5rem",
          textDecoration: "none",
          fontWeight: "600",
        }}
      >
        Go to Login
      </a>
    </div>
  );
}
