import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  webpack: (config: any) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      vitest: false,
      "@testing-library/react": false,
      "@testing-library/jest-dom": false,
    };
    return config;
  },
};

export default nextConfig;
