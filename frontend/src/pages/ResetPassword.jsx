import { useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import http from "../api/http";
import Alert from "../components/Alert";
import Button from "../components/Button";
import TextField from "../components/TextField";

export default function ResetPassword() {
  const [params] = useSearchParams();
  const presetToken = params.get("token") || "";
  const presetEmail = params.get("email") || "";

  const [email, setEmail] = useState(presetEmail);
  const [token, setToken] = useState(presetToken);
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const valid = useMemo(() => email.trim() && token.trim() && password.length >= 6, [email, token, password]);

  async function onSubmit(e) {
    e.preventDefault();
    setError("");
    setSuccess("");
    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }
    setLoading(true);
    try {
      const res = await http.post("/api/auth/reset-password", {
        email: email.trim(),
        token: token.trim(),
        password,
      });
      setSuccess(res.data.message || "Password reset successful. You can login now.");
    } catch (err) {
      setError(err?.response?.data?.message || "Reset failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-full flex items-center justify-center px-4">
      <div className="w-full max-w-md rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <h1 className="text-xl font-semibold text-slate-900">Reset password</h1>
        <p className="mt-1 text-sm text-slate-600">Enter the token from your email.</p>

        <form className="mt-6 space-y-4" onSubmit={onSubmit}>
          <Alert type="error">{error}</Alert>
          <Alert type="success">{success}</Alert>
          <TextField label="Email" type="email" value={email} onChange={setEmail} required />
          <TextField label="Token" value={token} onChange={setToken} required />
          <TextField label="New password" type="password" value={password} onChange={setPassword} required />
          <Button disabled={loading || !valid} type="submit" className="w-full">
            {loading ? "Resetting..." : "Reset password"}
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

