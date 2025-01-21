"use strict";
const { basename } = require("path");

module.exports = {
  entryPoints: ["src"],
  exclude: [
    "**/internal/**",
    "**/__tests__/**",
    "**/__benchmarks__/**",
    "**/node_modules/**",
  ],
  entryPointStrategy: "expand",
  mergeModulesMergeMode: "project",
  sort: ["source-order"],
  out: "docs",
  parametersFormat: "table",
  interfacePropertiesFormat: "table",
  classPropertiesFormat: "table",
  tableColumnSettings: {
    hideInherited: true,
    hideModifiers: true,
    hideOverrides: true,
    hideSources: true,
  },
  logLevel: "Warn",
  hideGenerator: true,
  excludeInternal: true,
  excludePrivate: true,
  categorizeByGroup: true,
  blockTags: ["@file"], // added by e.g. barrelsby
  excludeTags: ["@file"], // added by e.g. barrelsby
  gitRevision: "master",
  sourceLinkTemplate: `https://github.com/clickup/${basename(__dirname)}/blob/master/{path}#L{line}`,
  basePath: ".",
};
