import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Enable Ant Design CSS-in-JS optimization
  transpilePackages: ['antd', '@ant-design/icons', '@ant-design/nextjs-registry'],

  async redirects() {
    return [
      {
        source: "/admin",
        destination: "/dashboard",
        permanent: false,
      },
      {
        source: "/admin/dashboard",
        destination: "/dashboard",
        permanent: false,
      },
      {
        source: "/business",
        destination: "/dashboard/business/locations",
        permanent: false,
      },
      {
        source: "/business/dashboard",
        destination: "/dashboard/business/locations",
        permanent: false,
      },
    ];
  },
};

export default nextConfig;
