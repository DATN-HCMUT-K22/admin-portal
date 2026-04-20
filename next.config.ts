import type { NextConfig } from "next";

const nextConfig: NextConfig = {
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
