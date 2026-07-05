import sharedConfig from "@syntaxure/config/tailwind";
import type { Config } from "tailwindcss";

const config: Config = {
  ...sharedConfig,
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}", "./styles/**/*.{css}"],
};

export default config;
