export default function Alert({ type = "info", children }) {
  const styles =
    type === "error"
      ? "bg-red-50 text-red-800 border-red-200"
      : type === "success"
        ? "bg-emerald-50 text-emerald-800 border-emerald-200"
        : "bg-slate-50 text-slate-800 border-slate-200";

  if (!children) return null;
  return <div className={`border rounded-md px-3 py-2 text-sm ${styles}`}>{children}</div>;
}

