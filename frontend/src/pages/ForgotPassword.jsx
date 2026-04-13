import { useState } from "react";
import { Link } from "react-router-dom";
import http from "../api/http";
import Alert from "../components/Alert";
import Button from "../components/Button";
import TextField from "../components/TextField";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function onSubmit(e) {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);
    try {
      const res = await http.post("/api/auth/forgot-password", { email: email.trim() });
      setSuccess(res.data.message || "Check your email for a reset link.");
    } catch (err) {
      setError(err?.response?.data?.message || "Request failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-full flex items-center justify-center px-4">
      <div className="w-full max-w-md rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <h1 className="text-xl font-semibold text-slate-900">Forgot password</h1>
        <p className="mt-1 text-sm text-slate-600">We’ll email you a reset link.</p>

        <form className="mt-6 space-y-4" onSubmit={onSubmit}>
          <Alert type="error">{error}</Alert>
          <Alert type="success">{success}</Alert>
          <TextField
            label="Email"
            type="email"
            value={email}
            onChange={setEmail}
            required
            autoComplete="email"
          />
          <Button disabled={loading} type="submit" className="w-full">
            {loading ? "Sending..." : "Send reset link"}
          </Button>
        </form>

        <div className="mt-4 text-sm">
          <Link className="text-slate-900 underline" to="/login">
            Back to login
          </Link>
        </div>
      </div>
    </div>
  );
}

