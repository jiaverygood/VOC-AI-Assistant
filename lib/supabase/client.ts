import { createClient } from "@supabase/supabase-js";

// anon/publishable key만 사용한다 — RLS로 접근을 제어하므로 브라우저에 노출돼도 안전하다.
// (good-day-surf-brand와 동일한 프로젝트/키 정책)
export function createSupabaseClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    throw new Error("Supabase 설정이 올바르지 않습니다.");
  }

  return createClient(url, anonKey);
}
