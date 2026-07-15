import type { Metadata } from "next";
import { Noto_Sans_KR } from "next/font/google";
import "./globals.css";

const notoSansKr = Noto_Sans_KR({
  variable: "--font-noto-sans-kr",
  subsets: ["latin"],
  weight: ["400", "500", "700", "900"],
});

export const metadata: Metadata = {
  title: "VOC AI Assistant — Good Day Surf Bali",
  description: "Good Day Surf Bali VOC 원문을 감정·요약·키워드·카테고리·긴급도로 자동 분석하는 어시스턴트",
};

// 새로고침 시 테마 깜빡임(FOUC)을 막기 위해 페인트 전에 실행되는 인라인 스크립트.
// localStorage에 저장된 값이 있으면 그걸, 없으면 OS 설정을 따른다.
const themeInitScript = `
  (function () {
    var stored = localStorage.getItem("theme");
    var theme = stored || (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
    document.documentElement.setAttribute("data-theme", theme);
  })();
`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body className={`${notoSansKr.variable} font-sans antialiased`}>
        {children}
      </body>
    </html>
  );
}
