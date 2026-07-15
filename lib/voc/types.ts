export type Sentiment = "긍정" | "중립" | "부정";
export type Category = "강습/강사" | "예약/일정" | "안전/장비" | "가격/환불" | "사진/영상" | "기타";
export type Urgency = "상" | "중" | "하";

export const SENTIMENTS: Sentiment[] = ["긍정", "중립", "부정"];
export const CATEGORIES: Category[] = ["강습/강사", "예약/일정", "안전/장비", "가격/환불", "사진/영상", "기타"];
export const URGENCIES: Urgency[] = ["상", "중", "하"];

export interface VocAnalysis {
  sentiment: Sentiment;
  summary: string;
  keywords: string[];
  category: Category;
  urgency: Urgency;
}

export interface VocEntry extends VocAnalysis {
  id: number;
  created_at: string;
  raw_text: string;
}

export interface VocAnalyzeResponse {
  entry: VocEntry;
}

export interface VocErrorResponse {
  error: string;
}
