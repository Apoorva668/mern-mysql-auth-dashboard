import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <div className="min-h-full flex items-center justify-center px-4">
      <div className="w-full max-w-md rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <h1 className="text-xl font-semibold text-slate-900">Page not found</h1>
        <p className="mt-1 text-sm text-slate-600">The page you’re looking for doesn’t exist.</p>
        <div className="mt-4">
          <Link className="text-slate-900 underline" to="/dashboard">
            Go to dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}

