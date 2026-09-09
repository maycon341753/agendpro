"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCategoryInfo = function getCategoryInfo(packageName, subpath, conditions) {
  return { type: "unknown", found: false, path: subpath || ".", guess: undefined };
};
exports.tryReadPackage = function tryReadPackage(dir) { return null; };
exports.isNotFound = function isNotFound(e) { return false; };
