import { CATEGORIES, SENTIMENTS, URGENCIES, type VocAnalysis } from "./types";

// "gemini-flash-latest"(gemini-3.5-flash)는 무료 티어 일일 한도가 20건뿐이라
// VOC 분석처럼 반복 호출되는 용도에는 금방 소진된다. "gemini-flash-lite-latest"는
// 라이트 모델이라 무료 티어 한도가 훨씬 넉넉해 이 용도에 더 적합하다.
const GEMINI_MODEL = "gemini-flash-lite-latest";
const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`;

export class GeminiClientError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

const RESPONSE_SCHEMA = {
  type: "OBJECT",
  properties: {
    sentiment: { type: "STRING", enum: SENTIMENTS },
    summary: { type: "STRING" },
    keywords: { type: "ARRAY", items: { type: "STRING" } },
    category: { type: "STRING", enum: CATEGORIES },
    urgency: { type: "STRING", enum: URGENCIES },
  },
  required: ["sentiment", "summary", "keywords", "category", "urgency"],
};

function buildPrompt(rawText: string): string {
  return [
    "다음은 발리에서 서핑 레슨을 운영하는 'Good Day Surf Bali'에 남겨진 VOC(고객의 소리) 원문이다.",
    "아래 기준에 따라 분석하라.",
    "- sentiment: 전체 어조가 긍정/중립/부정 중 무엇인지",
    "- summary: 핵심 내용을 한 문장으로 요약",
    "- keywords: 핵심 키워드 3~5개",
    "- category: 강습/강사(레슨 내용·강사 태도/실력) · 예약/일정(예약 프로세스·시간 변경·노쇼) · 안전/장비(안전관리·웨트슈트·보드 등 장비 상태) · 가격/환불 · 사진/영상(세션 촬영 품질·전달) · 기타 중 가장 적합한 하나",
    "- urgency: 상/중/하 — 안전사고·부상 위험, 환불 분쟁, 고객 이탈 위험 등 즉시 대응이 필요하면 상",
    "",
    "VOC 원문:",
    rawText,
  ].join("\n");
}

function isValidAnalysis(value: unknown): value is VocAnalysis {
  if (typeof value !== "object" || value === null) return false;
  const v = value as Record<string, unknown>;
  return (
    typeof v.summary === "string" &&
    v.summary.trim().length > 0 &&
    SENTIMENTS.includes(v.sentiment as VocAnalysis["sentiment"]) &&
    CATEGORIES.includes(v.category as VocAnalysis["category"]) &&
    URGENCIES.includes(v.urgency as VocAnalysis["urgency"]) &&
    Array.isArray(v.keywords) &&
    v.keywords.every((k) => typeof k === "string")
  );
}

export async function analyzeVoc(rawText: string): Promise<VocAnalysis> {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    // 키 값 자체는 절대 로그/응답에 노출하지 않는다.
    throw new GeminiClientError(500, "AI 분석 설정에 문제가 있습니다. 관리자에게 문의해주세요.");
  }

  let response: Response;
  try {
    response = await fetch(GEMINI_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-goog-api-key": apiKey,
      },
      body: JSON.stringify({
        contents: [{ parts: [{ text: buildPrompt(rawText) }] }],
        generationConfig: {
          responseMimeType: "application/json",
          responseSchema: RESPONSE_SCHEMA,
          // 단순 추출/분류 작업이라 reasoning이 필요 없다 — thinking을 끄지 않으면
          // 응답이 10초 넘게 걸려 PRD의 "5초 이내" 기준을 못 맞춘다.
          thinkingConfig: { thinkingBudget: 0 },
        },
      }),
      cache: "no-store",
    });
  } catch {
    throw new GeminiClientError(502, "AI 분석에 실패했습니다. 잠시 후 다시 시도해주세요.");
  }

  if (!response.ok) {
    if (response.status === 429) {
      throw new GeminiClientError(429, "요청이 많아 잠시 후 다시 시도해주세요.");
    }
    throw new GeminiClientError(502, "AI 분석에 실패했습니다. 잠시 후 다시 시도해주세요.");
  }

  const body = await response.json();
  const text: string | undefined = body?.candidates?.[0]?.content?.parts?.[0]?.text;

  if (!text) {
    throw new GeminiClientError(502, "AI 분석 결과를 받지 못했습니다. 잠시 후 다시 시도해주세요.");
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(text);
  } catch {
    throw new GeminiClientError(502, "AI 분석 결과 형식이 올바르지 않습니다. 잠시 후 다시 시도해주세요.");
  }

  if (!isValidAnalysis(parsed)) {
    throw new GeminiClientError(502, "AI 분석 결과 형식이 올바르지 않습니다. 잠시 후 다시 시도해주세요.");
  }

  return {
    sentiment: parsed.sentiment,
    summary: parsed.summary,
    keywords: parsed.keywords.slice(0, 5),
    category: parsed.category,
    urgency: parsed.urgency,
  };
}
