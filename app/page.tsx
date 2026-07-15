"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { ErrorMessage } from "@/components/ui/ErrorMessage";
import { Spinner } from "@/components/ui/Spinner";
import { VocEntryCard } from "@/components/voc/VocEntryCard";
import { VocFilterBar, type CategoryFilter, type UrgencyFilter } from "@/components/voc/VocFilterBar";
import { VocInputForm } from "@/components/voc/VocInputForm";
import { VocList } from "@/components/voc/VocList";
import { VocUrgentSection } from "@/components/voc/VocUrgentSection";
import { createSupabaseClient } from "@/lib/supabase/client";
import type { VocEntry } from "@/lib/voc/types";

export default function VocAssistantPage() {
  const supabase = useMemo(() => createSupabaseClient(), []);

  const [entries, setEntries] = useState<VocEntry[]>([]);
  const [isLoadingList, setIsLoadingList] = useState(true);
  const [listError, setListError] = useState<string | null>(null);
  const [latestEntry, setLatestEntry] = useState<VocEntry | null>(null);
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>("전체");
  const [urgencyFilter, setUrgencyFilter] = useState<UrgencyFilter>("전체");

  const fetchEntries = useCallback(async () => {
    setIsLoadingList(true);
    setListError(null);

    const { data, error } = await supabase
      .from("voc_entries")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      setListError("VOC 목록을 불러오지 못했습니다. 잠시 후 다시 시도해주세요.");
    } else {
      setEntries((data ?? []) as VocEntry[]);
    }
    setIsLoadingList(false);
  }, [supabase]);

  useEffect(() => {
    fetchEntries();
  }, [fetchEntries]);

  function handleAnalyzed(entry: VocEntry) {
    setLatestEntry(entry);
    setEntries((prev) => [entry, ...prev]);
  }

  const filteredEntries = entries
    .filter((entry) => categoryFilter === "전체" || entry.category === categoryFilter)
    .filter((entry) => urgencyFilter === "전체" || entry.urgency === urgencyFilter)
    .sort((a, b) => b.created_at.localeCompare(a.created_at));

  return (
    <div className="min-h-screen bg-surface-page">
      <header className="flex items-center justify-between border-b border-border-subtle px-6 py-4">
        <div className="flex items-center gap-4">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo1.png" alt="Good Day Surf logo" className="h-16 w-16 shrink-0 rounded-full object-cover" />
          <div>
            <p className="text-lg font-bold text-text-primary">Good Day Surf</p>
            <h1 className="text-xs font-medium text-text-secondary">VOC AI Assistant</h1>
          </div>
        </div>
        <p className="text-xs text-text-secondary">Good Waves, Good Vibes</p>
      </header>

      <main className="mx-auto flex max-w-4xl flex-col gap-8 px-4 pb-16">
        <p className="pt-8 text-base text-text-secondary">VOC 원문을 붙여넣으면 감정·요약·키워드·카테고리·긴급도를 바로 정리해드려요.</p>

        <section className="flex flex-col gap-3">
          <h2 className="text-sm font-bold text-text-primary">VOC 입력</h2>
          <VocInputForm onAnalyzed={handleAnalyzed} />
        </section>

        {latestEntry && (
          <section className="flex flex-col gap-3">
            <h2 className="text-sm font-bold text-text-primary">✅ 방금 분석한 결과</h2>
            <VocEntryCard entry={latestEntry} />
          </section>
        )}

        <VocUrgentSection entries={entries} />

        <section className="flex flex-col gap-4">
          <div className="flex flex-col gap-3">
            <h2 className="text-sm font-bold text-text-primary">누적 VOC ({filteredEntries.length}건)</h2>
            <VocFilterBar
              category={categoryFilter}
              onCategoryChange={setCategoryFilter}
              urgency={urgencyFilter}
              onUrgencyChange={setUrgencyFilter}
            />
          </div>

          {listError && <ErrorMessage message={listError} />}

          {isLoadingList ? (
            <div className="flex justify-center py-16">
              <Spinner />
            </div>
          ) : (
            !listError && <VocList entries={filteredEntries} />
          )}
        </section>
      </main>
    </div>
  );
}
