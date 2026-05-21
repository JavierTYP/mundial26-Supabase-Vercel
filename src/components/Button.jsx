export default function Button({
  children,
  onClick,
  variant = "primary",
  disabled,
  type = "button",
  className = "",
}) {
  const styles = {
    primary:
      "bg-brand-blue hover:bg-blue-500 text-white shadow-lg shadow-blue-500/10",
    secondary:
      "bg-slate-800 hover:bg-slate-700 text-slate-100 border border-slate-700",
    danger:
      "bg-red-600 hover:bg-red-500 text-white shadow-lg shadow-red-500/10",
  };

  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className={`inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-50 ${className} ${
        styles[variant] ?? styles.primary
      }`}
    >
      {children}
    </button>
  );
}
