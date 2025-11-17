import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    // global rules
    rules: {
      "@typescript-eslint/no-explicit-any": "off",
    },
    // ensure rule is off for TS/TSX specifically
    overrides: [
      {
        files: ["*.ts", "*.tsx"],
        rules: {
          "@typescript-eslint/no-explicit-any": "off",
        },
      },
    ],
  },
];

export default eslintConfig;
