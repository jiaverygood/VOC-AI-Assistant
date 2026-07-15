import { NextRequest, NextResponse } from "next/server";
import { createSupabaseClient } from "@/lib/supabase/client";
import { GeminiClientError, analyzeVoc } from "@/lib/voc/geminiClient";
import type { VocAnalyzeResponse, VocEntry, VocErrorResponse } from "@/lib/voc/types";

export async function POST(request: NextRequest) {
  let rawText: unknown;
  try {
    const body = await request.json();
    rawText = body?.rawText;
  } catch {
    return NextResponse.json<VocErrorResponse>({ error: "요청 형식이 올바르지 않습니다." }, { status: 400 });
  }

  if (typeof rawText !== "string" || rawText.trim().length === 0) {
    return NextResponse.json<VocErrorResponse>({ error: "VOC 원문을 입력해주세요." }, { status: 400 });
  }

  try {
    const analysis = await analyzeVoc(rawText.trim());

    const supabase = createSupabaseClient();
    const { data, error } = await supabase
      .from("voc_entries")
      .insert({ raw_text: rawText.trim(), ...analysis })
      .select()
      .single();

    if (error || !data) {
      return NextResponse.json<VocErrorResponse>(
        { error: "분석 결과 저장에 실패했습니다. 잠시 후 다시 시도해주세요." },
        { status: 502 }
      );
    }

    return NextResponse.json<VocAnalyzeResponse>({ entry: data as VocEntry });
  } catch (error) {
    if (error instanceof GeminiClientError) {
      return NextResponse.json<VocErrorResponse>({ error: error.message }, { status: error.status });
    }
    return NextResponse.json<VocErrorResponse>(
      { error: "VOC 분석에 실패했습니다. 잠시 후 다시 시도해주세요." },
      { status: 500 }
    );
  }
}
