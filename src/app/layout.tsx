import type { Metadata } from "next";
import Nav from "./nav";
import "./globals.css";

export const metadata: Metadata = {
  title: "쿠팡파트너스 쇼츠 자동화",
  description:
    "쿠팡파트너스 상품을 YouTube Shorts / Instagram Reels 영상으로 자동 생성하는 파이프라인",
};

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
