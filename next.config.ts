import type { NextConfig } from "next";

const securityHeaders = [
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=()",
  },
  { key: "X-DNS-Prefetch-Control", value: "on" },
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
];

const cspHeader = {
  key: "Content-Security-Policy",
  value:
    "default-src 'self'; " +
    "script-src 'self' 'unsafe-inline'; " +
    "style-src 'self' 'unsafe-inline'; " +
    "img-src 'self' data:; " +
    "font-src 'self'; " +
    "connect-src 'self' https://finnhub.io https://query2.finance.yahoo.com; " +
    "frame-ancestors https://sethmelnick.com https://*.vercel.app; " +
    "base-uri 'self'; " +
    "form-action 'self'",
};

const nextConfig: NextConfig = {
  assetPrefix: "https://investment-calculator-one-wine.vercel.app",
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [...securityHeaders, cspHeader],
      },
    ];
  },
};

export default nextConfig;
