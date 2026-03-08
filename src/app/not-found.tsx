import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center text-center">
      <div className="mb-4 text-6xl font-bold text-gray-700">404</div>
      <h1 className="mb-2 text-xl font-semibold">페이지를 찾을 수 없습니다</h1>
      <p className="mb-6 text-gray-400">
        요청하신 페이지가 존재하지 않거나 이동되었습니다.
      </p>
      <Link
        href="/"
        className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-blue-700"
      >
        대시보드로 돌아가기
      </Link>
    </div>
  );
}
