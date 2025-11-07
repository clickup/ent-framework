"use strict";

import eslint from "@eslint/js";
import tseslint from "@typescript-eslint/eslint-plugin";
import eslintParser from "@typescript-eslint/parser";
import eslintPluginImport from "eslint-plugin-import";
import eslintPluginLodash from "eslint-plugin-lodash";
import eslintPluginNoOnlyTests from "eslint-plugin-no-only-tests";
import eslintPluginNode from "eslint-plugin-n";
import eslintPluginReact from "eslint-plugin-react";
import eslintPluginReactHooks from "eslint-plugin-react-hooks";
import eslintPluginTypescriptEnum from "eslint-plugin-typescript-enum";
import eslintPluginUnusedImports from "eslint-plugin-unused-imports";
import globals from "globals";
import stylistic from "@stylistic/eslint-plugin";

// Custom local rules for Slapdash codebase
const localRules = {
  rules: {
    "zod-prefer-safe-nullish": {
      meta: {
        type: "problem",
        docs: {
          description:
            "Prefer .safeNullish() over .optional(), .nullable(), or .nullish() for LLM response Zod schemas",
          category: "Best Practices",
          recommended: true,
        },
        messages: {
          preferSafeNullish:
            "Use .safeNullish() instead of .{{method}}() for LLM response schemas. " +
            ".safeNullish() handles both undefined and null values, and it converts null to undefined " +
            "to avoid the need for null checks. LLMs sometimes generate null instead of undefined " +
            "and vice versa, so .safeNullish() is more robust.",
        },
        schema: [],
      },
      create(context) {
        return {
          MemberExpression(node) {
            // Check if this is a method call like .optional(), .nullable(), or .nullish()
            if (
              node.property &&
              node.property.type === "Identifier" &&
              ["optional", "nullable", "nullish"].includes(node.property.name)
            ) {
              // Check if this is being called (e.g., .optional() not just .optional)
              const parent = node.parent;
              if (
                parent &&
                parent.type === "CallExpression" &&
                parent.callee === node
              ) {
                // Try to determine if this is a Zod schema
                // This is a heuristic: we look for z. in the call chain
                let current = node.object;
                let isZodSchema = false;

                // Walk up the chain looking for z.something
                while (current) {
                  if (
                    current.type === "MemberExpression" &&
                    current.object &&
                    current.object.type === "Identifier" &&
                    current.object.name === "z"
                  ) {
                    isZodSchema = true;
                    break;
                  }

                  if (current.type === "CallExpression") {
                    current = current.callee;
                  } else if (current.type === "MemberExpression") {
                    current = current.object;
                  } else {
                    break;
                  }
                }

                if (isZodSchema) {
                  context.report({
                    node: node.property,
                    messageId: "preferSafeNullish",
                    data: {
                      method: node.property.name,
                    },
                  });
                }
              }
            }
          },
        };
      },
    },
  },
};

// Fixing a bug in the eslint-plugin-react library.
const browserGlobals = {
  ...globals.browser,
  AudioWorkletGlobalScope: false, // this is the default,
};
delete browserGlobals["AudioWorkletGlobalScope "];
delete tseslint.configs.recommended["extends"];

function toFlatConfig(plugin, name) {
  delete plugin.configs.recommended["extends"];
  const parserOptions = plugin.configs.recommended.parserOptions;
  delete plugin.configs.recommended["parserOptions"];
  return {
    ...plugin.configs.recommended,
    plugins: { [name]: plugin },
    ...(parserOptions ? { languageOptions: { parserOptions } } : {}),
  };
}

export default function createConfig({
  projectRoot,
  eslintTsConfig,
  extraRules,
  extraIgnorePatterns,
}) {
  return [
    {
      ignores: [
        "**/node_modules/**/*",
        "dist/**",
        "**/webpack.config.ts",
        "**/bin/**",
        "**/*.d.ts",
        "**/*.sh",
        "*.js",
        "src/scripts/code_templates/*",
        ...(extraIgnorePatterns ?? []),
      ],
    },
    eslint.configs.recommended,
    toFlatConfig(eslintPluginReact, "react"),
    toFlatConfig(tseslint, "@typescript-eslint"),
    eslintPluginImport.flatConfigs.recommended,
    toFlatConfig(eslintPluginLodash, "lodash"),
    eslintPluginNode.configs["flat/recommended"],
    {
      files: ["**/*.ts", "**/*.tsx", "**/*.jsx"],
      languageOptions: {
        globals: {
          ...globals.node,
          ...browserGlobals,
          ...globals.es6,
          ...globals.jest,
          Atomics: "readonly",
          SharedArrayBuffer: "readonly",
          NodeJS: "readonly", // For NodeJS.Timeout, NodeJS.Process, etc.
        },
        parser: eslintParser,
        parserOptions: {
          ecmaFeatures: {
            jsx: true,
          },
          ecmaVersion: 2018,
          sourceType: "module",
          tsconfigRootDir: projectRoot,
          project: eslintTsConfig,
          warnOnUnsupportedTypeScriptVersion: false,
          // Reuse editor TS service and slim project to reduce memory and speed up.
          EXPERIMENTAL_useProjectService: true,
        },
      },

      plugins: {
        eslint,
        "@typescript-eslint": tseslint,
        lodash: eslintPluginLodash,
        "no-only-tests": eslintPluginNoOnlyTests,
        node: eslintPluginNode,
        react: eslintPluginReact,
        "react-hooks": eslintPluginReactHooks,
        "typescript-enum": eslintPluginTypescriptEnum,
        "unused-imports": eslintPluginUnusedImports,
        stylistic,
        local: localRules,
      },
      settings: {
        react: {
          version: "detect",
        },
        "import/parsers": {
          "@typescript-eslint/parser": [".ts", ".tsx"],
        },
        "import/resolver": {
          typescript: {
            project: eslintTsConfig,
            alwaysTryTypes: false,
          },
          node: {
            extensions: [".js", ".jsx", ".ts", ".tsx"],
          },
        },
      },
      rules: {
        // TODO: slowly enable no-extraneous-dependencies rule below. For now, it's
        // enforced only for some packages.
        //
        // In an ideal world, the root package.json should have 0 dependencies, and
        // all packages/* should define their own dependencies by themselves,
        // independently and locally. The rule below is exactly for that: it ensures
        // that all package's dependencies are explicitly mentioned in its
        // package.json, and no dependencies are borrowed implicitly from the root
        // node_modules.
        //
        // In real life though, enforcing packages independency is dangerous: we may
        // e.g. start accidentally bundle 2 React or 2 Redux versions if we forget
        // to sync their versions in different monorepo packages' package.json
        // files. (There must be some other lint rule for this hopefully.)
        //
        // In all cases, we should treat node_modules folders content as something
        // secondary and transient. (It's true even now with the new "yarn
        // Plug-n-Play" technology which we don't use yet.) The source of truth is
        // always package.json (enforced by lint) and yarn.lock (defines the exact
        // contents of all node_modules folders, bit by bit). In this schema, it
        // doesn't matter at all, does yarn use hoisting or not.
        //
        // "import/no-extraneous-dependencies": "error";
        "arrow-body-style": ["error", "as-needed"],

        "lodash/collection-ordering": "off",
        "lodash/preferred-alias": "off",
        "lodash/chaining": "off",
        "lodash/matches-prop-shorthand": "warn",
        "lodash/prefer-constant": "off",
        "lodash/prefer-flat-map": "off",
        "lodash/prefer-immutable-method": "off",
        "lodash/prefer-includes": "warn",
        "lodash/prefer-reject": "off",
        "lodash/identity-shorthand": "off",
        "lodash/prefer-is-nil": "off",
        "lodash/prefer-lodash-chain": "off",
        "lodash/matches-shorthand": "warn",
        "lodash/prefer-matches": "off",
        "lodash/prefer-noop": "off",
        "lodash/prefer-thru": "warn",
        "lodash/prefer-startswith": "off",
        "lodash/prefer-lodash-method": "off",
        "lodash/prefer-lodash-typecheck": "off",
        "lodash/prop-shorthand": "off",
        "lodash/import-scope": "off", // Doesn't matter much in node.js.
        "lodash/unwrap": "off",

        "node/prefer-global/process": "error",
        "node/prefer-global/console": "error",
        "node/prefer-global/buffer": "error",
        "node/prefer-global/url-search-params": "error",
        "node/prefer-global/url": "error",

        // Disable node plugin import checking for TypeScript files since TypeScript handles this.
        "n/no-deprecated-api": "warn",
        "n/no-missing-import": "off",
        "n/no-missing-require": "off",
        "n/no-extraneous-import": "off",
        "n/no-extraneous-require": "off",
        "n/no-process-exit": "off",
        "n/hashbang": "warn",
        "n/no-unsupported-features/es-syntax": "off",
        "n/no-unsupported-features/node-builtins": "off",
        "n/no-unpublished-import": "off",

        "require-atomic-updates": "off",
        "no-prototype-builtins": "off",
        "react/prop-types": "off",
        "react/no-unescaped-entities": "off",
        "react-hooks/rules-of-hooks": "error",
        "react-hooks/exhaustive-deps": "warn",

        "@typescript-eslint/no-misused-promises": "error",
        "@typescript-eslint/promise-function-async": "error",
        "@typescript-eslint/await-thenable": "error",
        "@typescript-eslint/no-floating-promises": [
          "error",
          { ignoreVoid: false },
        ],
        "@typescript-eslint/no-namespace": "off",
        "@typescript-eslint/no-this-alias": "off",
        "@typescript-eslint/no-unsafe-assignment": "off",
        "@typescript-eslint/unbound-method": ["error", { ignoreStatic: true }],
        "@typescript-eslint/array-type": ["error", { default: "array-simple" }],
        "@typescript-eslint/ban-ts-comment": ["error"],
        "@typescript-eslint/no-non-null-asserted-optional-chain": "off",
        "@typescript-eslint/no-useless-constructor": ["error"],
        "@typescript-eslint/no-empty-object-type": "off",
        "@typescript-eslint/no-explicit-any": "off",
        "@typescript-eslint/no-require-imports": "off",
        "@typescript-eslint/no-unused-expressions": "off",
        "@typescript-eslint/no-unsafe-function-type": "off",
        "@typescript-eslint/prefer-optional-chain": ["warn"],
        "@typescript-eslint/consistent-type-imports": ["error"],
        "@typescript-eslint/return-await": "warn",
        "@typescript-eslint/require-array-sort-compare": [
          "error",
          { ignoreStringArrays: true },
        ],
        "@typescript-eslint/use-unknown-in-catch-callback-variable": "warn",

        eqeqeq: ["error"],
        "object-shorthand": ["error", "always"],

        "typescript-enum/no-const-enum": ["error"], // not supported in SWC
        "typescript-enum/no-enum": "off",

        "@typescript-eslint/naming-convention": [
          "error",
          {
            selector: "variable",
            format: ["camelCase", "PascalCase", "UPPER_CASE"],
            leadingUnderscore: "allow",
            trailingUnderscore: "allow",
            filter: {
              regex: "^__webpack",
              match: false,
            },
          },
        ],

        // Disable in favour of @typescript-eslint/no-unused-vars.
        "no-unused-vars": "off",
        "@typescript-eslint/no-unused-vars": [
          "error",
          {
            args: "all",
            vars: "local", // Only check local variables, ignore imports used only as types.
            argsIgnorePattern: "^_",
            varsIgnorePattern: "^_",
            caughtErrorsIgnorePattern: "^_",
            destructuredArrayIgnorePattern: "^_",
            ignoreRestSiblings: true,
          },
        ],

        // Disable in favour of @typescript-eslint/no-redeclare which understands TS namespaces
        "no-redeclare": "off",
        "@typescript-eslint/no-redeclare": "off",
        "@typescript-eslint/member-ordering": [
          "error",
          {
            //
            // ATTENTION: the rules here are not simple, mainly because of this:
            // https://github.com/typescript-eslint/typescript-eslint/issues/6133
            //
            // Besides that, we also want contradictory things, like:
            //
            // 1. Having constructor close to fields definition (because people
            //    often define fields in the constructor arguments), although it
            //    logically should've been below static methods.
            // 2. Having all abstract things in the class grouped, irregardless on
            //    their public/protected/private modifiers.
            //
            default: [
              "signature",
              "call-signature",

              // Typically, class constants (that's why they're on top).
              "public-static-field",
              "public-static-get",
              "public-static-set",
              "protected-static-field",
              "protected-static-get",
              "protected-static-set",

              // All concrete fields. What's interesting is that the order we
              // emotionally want here for properties is private-protected-public,
              // which is the opposite to the order of methods (which is
              // public-protected-private). This is likely because the methods are
              // bulky, and properties are lean.
              "private-static-field",
              "private-instance-field",
              "public-instance-field",
              "public-abstract-field",
              "public-abstract-get",
              "public-abstract-set",

              // Protected fields and methods are grouped, because eslint currently
              // doesn't distinguish fields assigned with a lambda FROM methods, and
              // we often times expose abstract protected overridable lambdas:
              // https://github.com/typescript-eslint/typescript-eslint/issues/6133
              "protected-abstract-field",
              "protected-abstract-get",
              "protected-abstract-set",
              "protected-abstract-method",
              "public-abstract-method", // the only exception; it's to group all abstract things too
              "protected-instance-field",
              "protected-constructor",
              "protected-static-method",
              "protected-instance-get",
              "protected-instance-set",
              "protected-instance-method",

              // Public constructor, instance methods, static methods.
              "public-constructor", // often defines more public/protected/private properties, so should be close to fields
              "public-static-method",
              "public-instance-get",
              "public-instance-set",
              "public-instance-method",

              // Private constructor, instance methods, static methods.
              "private-constructor",
              "private-static-method",
              "private-instance-get",
              "private-instance-set",
              "private-instance-method",
              "private-static-get",
              "private-static-set",
            ],
          },
        ],

        "no-constant-condition": ["error", { checkLoops: false }],
        "no-buffer-constructor": ["error"],
        "no-console": ["error"],
        curly: ["error", "all"],
        "no-case-declarations": "off",

        "padding-line-between-statements": "off",
        "stylistic/padding-line-between-statements": [
          "error",
          // Force empty lines.
          {
            blankLine: "always",
            prev: [
              "block",
              "block-like",
              "function",
              "class",
              "interface",
              "type",
            ],
            next: "*",
          },
          {
            blankLine: "always",
            prev: "import",
            next: [
              "const",
              "if",
              "let",
              "var",
              "export",
              "function",
              "class",
              "interface",
              "type",
            ],
          },
          {
            blankLine: "always",
            prev: "*",
            next: ["function", "class", "interface", "type"],
          },
          // Allow one-liner functions without extra spacing (hacky):
          { blankLine: "any", prev: "singleline-const", next: "*" },
          { blankLine: "any", prev: "singleline-var", next: "*" },
          { blankLine: "any", prev: "singleline-let", next: "*" },
        ],

        "no-restricted-properties": [
          "error",
          {
            object: "window",
            property: "location",
            message:
              "We use React Router and History to control the location of our web or desktop app. Prefer `useLocation` in React components and `historyFromContext` in Redux Saga.",
          },
          ...(projectRoot.endsWith("client")
            ? [
                {
                  object: "window",
                  property: "document",
                  message: "Please use `useDocument` from `useDocument.tsx`.",
                },
                ...[
                  "addEventListener",
                  "removeEventListener",
                  "getElementById",
                  "documentElement",
                  "activeElement",
                  "querySelectorAll",
                ].map((property) => ({
                  object: "document",
                  property,
                  message: "Please use `useDocument` from `useDocument.tsx`.",
                })),
              ]
            : []),
        ],

        "no-restricted-globals": [
          "warn",
          {
            name: "location",
            message:
              "We use React Router and History to control the location of our web or desktop app. Prefer `useLocation` in React components and `historyFromContext` in Redux Saga.",
          },
        ],

        "no-restricted-syntax": [
          "error",
          {
            selector: (() => {
              const RE_BAD = "/([a-z0-9_ ]|^)E[Ii][Dd]|(^|[-_: ])eid/";
              return [
                `Identifier[name=${RE_BAD}]`,
                `Literal[value=${RE_BAD}]`,
                `TemplateElement[value.raw=${RE_BAD}]`,
                `TSInterfaceDeclaration[id.name=${RE_BAD}]`,
              ].join(",");
            })(),
            message:
              'Do not use "eid" or "EID" as a part of a name/field/type. Instead, prefer externalID or external_id.',
          },
        ],

        "prefer-const": [
          "error",
          {
            destructuring: "all",
          },
        ],

        "no-var": "error",
        "no-void": "error",

        "react/forbid-dom-props": [
          "error",
          {
            forbid: [
              {
                propName: "style",
                message: "Please use CSS Modules instead",
              },
            ],
          },
        ],
        "react/forbid-component-props": [
          "error",
          {
            forbid: [
              {
                propName: "style",
                message: "Please use CSS Modules instead",
              },
            ],
          },
        ],
        "no-sequences": ["error"],
        "no-undef": "off",
        // Too noisy about `react` and other node_modules
        "import/default": 0,
        // This complains about React.forwardRef, ReactDOM.render, etc.
        "import/no-named-as-default-member": 0,
        // This complains about "apollo" exporting ApolloClient as a default and as a
        // named import at the same time.
        "import/no-named-as-default": 0,
        // Does not seem to work well with node_modules
        "import/named": 0,
        "import/newline-after-import": "error",
        "import/order": [
          "error",
          {
            groups: ["builtin", "external", "index", "parent", "sibling"],
            pathGroups: [
              {
                pattern: "./**.module.css",
                group: "sibling",
                position: "after",
              },
              {
                pattern: "./**.module.scss",
                group: "sibling",
                position: "after",
              },
            ],
            alphabetize: {
              order: "asc",
              caseInsensitive: true,
            },
          },
        ],
        "import/no-useless-path-segments": ["error", { noUselessIndex: true }],
        "unused-imports/no-unused-imports": "error",
        "no-restricted-imports": [
          "error",
          {
            patterns: [
              {
                group: ["react-router"],
                message:
                  "Please use react-router-dom instead, since react-router's useLocation() doesn't work properly with StaticRouter on server side.",
              },
            ],
          },
        ],
        // Fixes a common mistake: `a ?? b < c` which feels like `(a ?? b) < c`, but
        // actually is `a ?? (b < c)`
        "no-mixed-operators": [
          "error",
          {
            allowSamePrecedence: false,
            groups: [
              ["??", "+"],
              ["??", "-"],
              ["??", "*"],
              ["??", "/"],
              ["??", "%"],
              ["??", "**"],
              ["??", "&"],
              ["??", "|"],
              ["??", "^"],
              ["??", "~"],
              ["??", "<<"],
              ["??", ">>"],
              ["??", ">>>"],
              ["??", "=="],
              ["??", "!="],
              ["??", "==="],
              ["??", "!=="],
              ["??", ">"],
              ["??", ">="],
              ["??", "<"],
              ["??", "<="],
              ["??", "&&"],
              ["??", "||"],
              ["??", "in"],
              ["??", "instanceof"],
            ],
          },
        ],

        quotes: ["error", "double", { avoidEscape: true }],

        "no-only-tests/no-only-tests": "error",

        "local/zod-prefer-safe-nullish": "warn",

        ...extraRules,
      },
    },
    {
      files: ["**/*.js"],
      languageOptions: {
        ecmaVersion: 2022,
      },
      rules: {
        "n/hashbang": "off",
        "n/no-unsupported-features/node-builtins": "off",
        "n/no-extraneous-import": "off",
        "@typescript-eslint/no-require-imports": "off",
        "lodash/prefer-lodash-method": "off",
        "n/no-process-exit": "off",
        "n/no-missing-require": "off",
      },
    },
    {
      files: ["**/*.mjs"],
      languageOptions: {
        sourceType: "module",
        ecmaVersion: 2020,
      },
      settings: {
        "import/core-modules": ["@stylistic/eslint-plugin", "@eslint/js"],
      },
      rules: {
        "n/hashbang": "off",
        "n/no-extraneous-import": "off",
        "n/no-unsupported-features/es-syntax": "off",
        "n/no-unpublished-import": "off",
        "n/no-process-exit": "off",
        "lodash/prefer-lodash-method": "off",
        // Disable import plugin checks for config files to avoid CJS/ESM export parsing issues
        "import/default": "off",
        "import/namespace": "off",
        "import/no-unresolved": "off",
        "import/no-named-as-default": "off",
        "import/no-named-as-default-member": "off",
      },
    },
    // Disable zod-prefer-safe-nullish for braintrust/eval files since those
    // schemas are for validating test configuration, not for guiding LLM output
    {
      files: [
        "**/scripts/evals/**/*.ts",
        "**/scripts/evals/**/*.tsx",
        "**/braintrust/**/*.ts",
        "**/braintrust/**/*.tsx",
      ],
      rules: {
        "local/zod-prefer-safe-nullish": "off",
      },
    },
  ];
}
