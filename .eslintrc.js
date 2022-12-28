"use strict";
const config = require("../../.eslintrc.base.js")(__dirname);
config.rules["import/no-extraneous-dependencies"] = "error";
module.exports = config;
