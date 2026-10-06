import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const compat = new FlatCompat({ baseDirectory: dirname(fileURLToPath(import.meta.url)) });

const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  // public/ holds static assets, incl. the shared 미래AI랩 history-nav script kept identical across demos
  { ignores: [".next/**", "node_modules/**", "next-env.d.ts", "public/**"] },
];

export default eslintConfig;
