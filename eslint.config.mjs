import { dirname, join } from "path";
import { fileURLToPath } from "url";
import createConfig from "./eslint.base.config.mjs";

const filename = fileURLToPath(import.meta.url);
const foldername = dirname(filename);

export default createConfig({
  projectRoot: foldername,
  eslintTsConfig: join(foldername, "tsconfig.json"),
  extraRules: {
    "import/no-extraneous-dependencies": "error",
    "@typescript-eslint/explicit-function-return-type": [
      "error",
      { allowExpressions: true, allowedNames: ["configure"] },
    ],
    "lodash/import-scope": ["error", "method"],
    "@typescript-eslint/no-explicit-any": "error",
  },
});
