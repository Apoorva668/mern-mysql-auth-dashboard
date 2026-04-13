import { Link, Route, Routes, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import NotFound from "./pages/NotFound";
import ProtectedRoute from "./components/ProtectedRoute";
import Dashboard from "./pages/Dashboard";
import { useAuth } from "./context/AuthContext";

function TopBar() {
  const nav = useNavigate();
  const { token, user, logout } = useAuth();

  useEffect(() => {
    function onLogout() {
      nav("/login");
    }
    window.addEventListener("auth:logout", onLogout);
    return () => window.removeEventListener("auth:logout", onLogout);
  }, [nav]);

  return (
    <div className="border-b border-slate-200 bg-white">
      <div className="mx-auto max-w-5xl px-4 py-3 flex items-center justify-between">
        <Link to="/" className="text-sm font-semibold text-slate-900">
          MERN Auth
        </Link>
        <div className="flex items-center gap-3">
          {token ? (
            <>
              <div className="text-sm text-slate-600">{user?.email}</div>
              <button
                className="text-sm font-medium text-slate-900 underline"
                onClick={() => {
                  logout();
                  nav("/login");
                }}
              >
                Logout
              </button>
            </>
          ) : (
            <div className="text-sm text-slate-600">Not signed in</div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <div className="min-h-full bg-slate-50">
      <TopBar />
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </div>
  );
}

