const withPWA = require("@ducanh2912/next-pwa").default({});

/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ["@syntaxure/ui", "@syntaxure/db"],
};

module.exports = withPWA(nextConfig);
