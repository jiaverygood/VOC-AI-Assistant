"use client";

import { useState, type FormEvent } from "react";
import type { VocAnalyzeResponse, VocEntry, VocErrorResponse } from "@/lib/voc/types";
import { ErrorMessage } from "@/components/ui/ErrorMessage";
import { Spinner } from "@/components/ui/Spinner";

export function VocInputForm({ onAnalyzed }: { onAnalyzed: (entry: VocEntry) => void }) {
  const [rawText, setRawText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!rawText.trim() || isSubmitting) return;

    setIsSubmitting(true);
    setError(null);

    try {
      const res = await fetch("/api/voc/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rawText }),
      });
      const data: VocAnalyzeResponse | VocErrorResponse = await res.json();

      if (!res.ok || "error" in data) {
        setError("error" in data ? data.error : "VOC 분석에 실패했습니다. 잠시 후 다시 시도해주세요.");
        return;
      }

      onAnalyzed(data.entry);
      setRawText("");
    } catch {
      setError("VOC 분석에 실패했습니다. 잠시 후 다시 시도해주세요.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3">
      <textarea
        value={rawText}
        onChange={(event) => setRawText(event.target.value)}
        placeholder="접수된 VOC 원문을 붙여넣어주세요."
        rows={6}
        className="w-full resize-none rounded-none border border-border-card bg-surface-card px-4 py-3 text-sm text-text-primary placeholder:text-text-secondary focus:outline-none focus:ring-2 focus:ring-accent-ring"
      />
      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={!rawText.trim() || isSubmitting}
          className="flex shrink-0 items-center gap-2 rounded-none bg-cta-submit px-5 py-2 text-sm font-semibold text-cta-submit-text transition-opacity hover:opacity-90 disabled:opacity-50"
        >
          {isSubmitting && <Spinner />}
          분석하기
        </button>
        {isSubmitting && <span className="text-xs text-text-secondary">AI가 분석 중입니다...</span>}
      </div>
      {error && <ErrorMessage message={error} />}
    </form>
  );
}
