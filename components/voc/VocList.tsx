import type { VocEntry } from "@/lib/voc/types";
import { VocEntryCard } from "./VocEntryCard";

export function VocList({ entries }: { entries: VocEntry[] }) {
  if (entries.length === 0) {
    return <p className="py-10 text-center text-sm text-text-secondary">조건에 맞는 VOC가 없습니다.</p>;
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      {entries.map((entry) => (
        <VocEntryCard key={entry.id} entry={entry} compact />
      ))}
    </div>
  );
}
