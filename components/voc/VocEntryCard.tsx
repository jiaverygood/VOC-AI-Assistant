import type { VocEntry } from "@/lib/voc/types";
import { Badge } from "./Badge";

function formatDateTime(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleString("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function VocEntryCard({
  entry,
  compact = false,
}: {
  entry: VocEntry;
  compact?: boolean;
}) {
  const isUrgent = entry.urgency === "상";

  return (
    <div
      className={`flex flex-col gap-3 rounded-none border bg-surface-card p-5 ${
        isUrgent ? "border-2 border-accent-primary" : "border border-border-card"
      }`}
    >
      <div className="flex flex-wrap items-center gap-2">
        <Badge label={`긴급도 ${entry.urgency}`} variant={isUrgent ? "filled" : "outline"} />
        <Badge label={entry.category} />
        <Badge label={entry.sentiment} />
        <span className="ml-auto text-xs text-text-secondary">{formatDateTime(entry.created_at)}</span>
      </div>

      <p className="text-sm font-semibold text-text-primary">{entry.summary}</p>

      <p className={`text-sm text-text-secondary ${compact ? "line-clamp-2" : ""}`}>{entry.raw_text}</p>

      {entry.keywords.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {entry.keywords.map((keyword) => (
            <Badge key={keyword} label={`#${keyword}`} />
          ))}
        </div>
      )}
    </div>
  );
}
