import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "쿠팡파트너스 쇼츠 자동화",
  description:
    "쿠팡파트너스 상품을 YouTube Shorts / Instagram Reels 영상으로 자동 생성하는 파이프라인",
};

function Nav() {
  return (
    <nav className="border-b border-gray-800 bg-gray-950">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
        <a href="/" className="text-lg font-bold text-white">
          쿠팡쇼츠 자동화
        </a>
        <div className="flex gap-6 text-sm">
          <a
            href="/"
            className="text-gray-400 transition hover:text-white"
          >
            대시보드
          </a>
          <a
            href="/pipeline"
            className="text-gray-400 transition hover:text-white"
          >
            파이프라인
          </a>
          <a
            href="/demo"
            className="text-gray-400 transition hover:text-white"
          >
            데모
          </a>
        </div>
      </div>
    </nav>
  );
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      <body className="bg-gray-950 text-gray-100">
        <Nav />
        <main className="mx-auto max-w-5xl px-6 py-8">{children}</main>
      </body>
    </html>
  );
}
