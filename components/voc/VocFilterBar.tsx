"use client";

import { CATEGORIES, URGENCIES, type Category, type Urgency } from "@/lib/voc/types";

export type CategoryFilter = Category | "전체";
export type UrgencyFilter = Urgency | "전체";

interface TabGroupProps<T extends string> {
  label: string;
  options: T[];
  active: T;
  onChange: (value: T) => void;
}

function TabGroup<T extends string>({ label, options, active, onChange }: TabGroupProps<T>) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="text-xs font-medium text-text-secondary">{label}</span>
      {options.map((option) => {
        const isActive = option === active;
        return (
          <button
            key={option}
            type="button"
            onClick={() => onChange(option)}
            aria-pressed={isActive}
            className={`rounded-none px-3 py-1.5 text-xs font-medium transition-colors ${
              isActive
                ? "bg-accent-primary text-accent-primary-text"
                : "border border-border-card bg-surface-card text-text-secondary hover:text-text-primary"
            }`}
          >
            {option}
          </button>
        );
      })}
    </div>
  );
}

interface VocFilterBarProps {
  category: CategoryFilter;
  onCategoryChange: (value: CategoryFilter) => void;
  urgency: UrgencyFilter;
  onUrgencyChange: (value: UrgencyFilter) => void;
}

export function VocFilterBar({ category, onCategoryChange, urgency, onUrgencyChange }: VocFilterBarProps) {
  return (
    <div className="flex flex-col gap-3">
      <TabGroup label="카테고리" options={["전체", ...CATEGORIES]} active={category} onChange={onCategoryChange} />
      <TabGroup label="긴급도" options={["전체", ...URGENCIES]} active={urgency} onChange={onUrgencyChange} />
    </div>
  );
}
