import type { VocEntry } from "@/lib/voc/types";
import { VocEntryCard } from "./VocEntryCard";

export function VocUrgentSection({ entries }: { entries: VocEntry[] }) {
  const urgent = entries.filter((entry) => entry.urgency === "상");
  if (urgent.length === 0) return null;

  return (
    <section className="flex flex-col gap-3">
      <h2 className="text-sm font-bold text-text-primary">🚨 긴급 확인 필요</h2>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {urgent.map((entry) => (
          <VocEntryCard key={entry.id} entry={entry} compact />
        ))}
      </div>
    </section>
  );
}
