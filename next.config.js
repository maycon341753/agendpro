/** @type {import('next').NextConfig} */

const path = require("path");

const securityHeaders = [
  {
    key: "X-Frame-Options",
    value: "SAMEORIGIN",
  },
  {
    key: "X-Content-Type-Options",
    value: "nosniff",
  },
  {
    key: "Referrer-Policy",
    value: "strict-origin-when-cross-origin",
  },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), interest-cohort=()",
  },
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
  {
    key: "X-XSS-Protection",
    value: "1; mode=block",
  },
];

const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  compress: true,
  swcMinify: true,
  generateEtags: true,
  eslint: {
    ignoreDuringBuilds: true,
    dirs: [],
  },
  typescript: {
    ignoreBuildErrors: true,
  },

  images: {
    formats: ["image/webp", "image/avif"],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
    ],
  },

  webpack: (config) => {
    config.resolve.alias = config.resolve.alias || {};
    config.resolve.alias["client-only"] = path.resolve(__dirname, "shims/client-only/index.js");
    config.resolve.alias["server-only"] = path.resolve(__dirname, "shims/server-only/index.js");
    config.resolve.alias["is-number"] = path.resolve(__dirname, "shims/is-number/index.js");
    config.resolve.alias["to-regex-range"] = path.resolve(__dirname, "shims/to-regex-range/index.js");
    config.resolve.alias["fill-range"] = path.resolve(__dirname, "shims/fill-range/index.js");
    config.resolve.alias["braces"] = path.resolve(__dirname, "shims/braces/index.js");
    config.resolve.alias["picomatch"] = path.resolve(__dirname, "shims/picomatch/index.js");
    config.resolve.alias["micromatch"] = path.resolve(__dirname, "shims/micromatch/index.js");
    config.resolve.alias["node-exports-info"] = path.resolve(__dirname, "shims/node-exports-info/index.js");
    config.resolve.alias["callsites"] = path.resolve(__dirname, "shims/callsites/index.js");
    config.resolve.alias["fast-glob"] = path.resolve(__dirname, "shims/fast-glob/index.js");
    config.resolve.alias["glob-parent"] = path.resolve(__dirname, "shims/glob-parent/index.js");
    return config;
  },

  async headers() {
    return [
      {
        source: "/:path*",
        headers: securityHeaders,
      },
      {
        source: "/api/:path*",
        headers: [
          ...securityHeaders,
          {
            key: "Cache-Control",
            value: "no-store, no-cache, must-revalidate, proxy-revalidate",
          },
        ],
      },
    ];
  },

  async redirects() {
    return [
      {
        source: "/admin",
        destination: "/dashboard",
        permanent: true,
      },
      {
        source: "/home",
        destination: "/",
        permanent: true,
      },
    ];
  },

  env: {
    SUPABASE_URL: process.env.SUPABASE_URL,
    SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY,
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
  },
};

module.exports = nextConfig;
