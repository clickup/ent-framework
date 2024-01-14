"use strict";
const { basename } = require("path");

module.exports = {
  entryPoints: ["src"],
  exclude: ["**/internal/**", "**/__tests__/**", "**/node_modules/**"],
  entryPointStrategy: "expand",
  mergeModulesMergeMode: "project",
  sort: ["source-order"],
  out: "docs",
  logLevel: "Warn",
  hideGenerator: true,
  excludeInternal: true,
  excludePrivate: true,
  categorizeByGroup: true,
  hideInPageTOC: true,
  gitRevision: "master",
  sourceLinkTemplate: `https://github.com/clickup/${basename(__dirname)}/blob/master/{path}#L{line}`,
  basePath: ".",
};
