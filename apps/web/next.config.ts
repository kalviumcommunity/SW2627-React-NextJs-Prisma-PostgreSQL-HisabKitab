import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["@hisab-kitab/database", "@hisab-kitab/shared"],
};

export default nextConfig;
