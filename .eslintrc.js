"use strict";
const config = require("../../.eslintrc.base.js")(__dirname);
config.rules["import/no-extraneous-dependencies"] = "error";
config.rules["lodash/import-scope"] = ["error", "method"];
module.exports = config;
