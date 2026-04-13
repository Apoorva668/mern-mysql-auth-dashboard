export default function Button({ children, variant = "primary", ...props }) {
  const cls =
    variant === "ghost"
      ? "bg-white border border-slate-300 text-slate-900 hover:bg-slate-50"
      : "bg-slate-900 text-white hover:bg-slate-800";

  return (
    <button
      {...props}
      className={`inline-flex items-center justify-center rounded-md px-4 py-2 text-sm font-medium transition disabled:opacity-60 ${cls} ${props.className || ""}`}
    >
      {children}
    </button>
  );
}

