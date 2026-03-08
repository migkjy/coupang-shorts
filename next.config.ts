import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Remotion 소스는 Next.js 빌드에서 제외
  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
    };
    return config;
  },
  // src/remotion 디렉토리는 Next.js 라우팅에서 무시
  experimental: {},
};

export default nextConfig;
