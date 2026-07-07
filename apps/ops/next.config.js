const withPWA = require("@ducanh2912/next-pwa").default({});

/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ["@syntaxure/ui", "@syntaxure/db"],
  experimental: {
    outputFileTracingIncludes: {
      "/*": [
        "./node_modules/.prisma/client/**",
        "../../node_modules/.pnpm/@prisma+client@*/node_modules/.prisma/client/**",
      ],
    },
  },
};

module.exports = withPWA(nextConfig);
