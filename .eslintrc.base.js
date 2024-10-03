"use strict";
module.exports = (projectRoot, extraRules = {}) => ({
  root: true, // fix possible "Plugin %s was conflicted between %s.json and %s.json" errors
  env: {
    jest: true,
    browser: true,
    es6: true,
    node: true,
  },
  extends: [
    "eslint:recommended",
    "plugin:react/recommended",
    "plugin:@typescript-eslint/eslint-recommended",
    "plugin:import/recommended",
  ],
  globals: {
    Atomics: "readonly",
    SharedArrayBuffer: "readonly",
  },
  parser: "@typescript-eslint/parser",
  parserOptions: {
    ecmaFeatures: {
      jsx: true,
    },
    ecmaVersion: 2018,
    sourceType: "module",
    tsconfigRootDir: projectRoot,
    project: "tsconfig.json",
    warnOnUnsupportedTypeScriptVersion: false,
  },
  plugins: [
    "@typescript-eslint",
    "import",
    "lodash",
    "node",
    "react-hooks",
    "react",
    "typescript-enum",
    "typescript-sort-keys",
    "unused-imports",
    "no-only-tests",
  ],
  settings: {
    react: {
      version: "detect",
    },
    "import/parsers": {
      "@typescript-eslint/parser": [".ts", ".tsx"],
    },
    "import/resolver": {
      typescript: {
        project: projectRoot,
      },
    },
  },
  ignorePatterns: [
    "node_modules",
    "dist",
    "webpack.config.ts",
    "**/bin/**",
    "*.d.ts",
    "*.js",
  ],
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

    "node/prefer-global/process": "error",
    "node/prefer-global/console": "error",
    "node/prefer-global/buffer": "error",
    "node/prefer-global/url-search-params": "error",
    "node/prefer-global/url": "error",

    "require-atomic-updates": "off",
    "no-prototype-builtins": "off",
    "react/prop-types": "off",
    "react/no-unescaped-entities": "off",
    "react-hooks/rules-of-hooks": "error",
    "react-hooks/exhaustive-deps": "warn",
    "@typescript-eslint/no-misused-promises": "error",
    "@typescript-eslint/promise-function-async": "error",
    "arrow-body-style": ["error", "as-needed"],
    "@typescript-eslint/await-thenable": "error",
    "@typescript-eslint/no-floating-promises": ["error", { ignoreVoid: false }],
    "@typescript-eslint/unbound-method": ["error", { ignoreStatic: true }],
    "@typescript-eslint/return-await": ["error"],
    "@typescript-eslint/array-type": ["error", { default: "array-simple" }],
    "@typescript-eslint/ban-ts-comment": ["error"],
    "@typescript-eslint/no-useless-constructor": ["error"],
    "@typescript-eslint/prefer-optional-chain": ["error"],
    "@typescript-eslint/consistent-type-imports": ["error"],
    "@typescript-eslint/require-array-sort-compare": [
      "error",
      { ignoreStringArrays: true },
    ],
    eqeqeq: ["error"],
    "object-shorthand": ["error", "always"],
    "@typescript-eslint/unbound-method": ["error"],
    "@typescript-eslint/no-implicit-any-catch": [
      "error",
      { allowExplicitAny: true },
    ],
    "typescript-enum/no-const-enum": ["error"], // not supported in SWC

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
        argsIgnorePattern: "^_",
        varsIgnorePattern: "^_",
        ignoreRestSiblings: true,
      },
    ],
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
    "@typescript-eslint/padding-line-between-statements": [
      "error",
      // Force empty lines.
      {
        blankLine: "always",
        prev: ["block", "block-like", "function", "class", "interface", "type"],
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

    ...extraRules,
  },
});
