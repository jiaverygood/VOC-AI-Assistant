export function Badge({
  label,
  variant = "outline",
}: {
  label: string;
  variant?: "filled" | "outline";
}) {
  return (
    <span
      className={`inline-flex items-center rounded-none border px-2 py-0.5 text-xs font-medium ${
        variant === "filled"
          ? "border-accent-primary bg-accent-primary text-accent-primary-text"
          : "border-border-card text-text-secondary"
      }`}
    >
      {label}
    </span>
  );
}
