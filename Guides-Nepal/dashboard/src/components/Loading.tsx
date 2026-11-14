export default function Loading({
  label = "Loading...",
  size = "md",
}: {
  label?: string;
  size?: "sm" | "md" | "lg";
}) {
  const dim =
    size === "sm" ? "h-4 w-4" : size === "lg" ? "h-8 w-8" : "h-6 w-6";
  return (
    <div className="flex items-center justify-center gap-2.5 py-10 text-gray-500">
      <div
        className={`animate-spin rounded-full border-2 border-gray-200 border-t-brand-yellow ${dim}`}
      />
      <span className="text-sm">{label}</span>
    </div>
  );
}
