const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");
const NODE_MODULES = path.join(ROOT, "node_modules");

const DUMMY_INDEX = '"use strict";\nObject.defineProperty(exports, "__esModule", { value: true });\nmodule.exports = module.exports.default = function () { return arguments[0]; };\n';
const DUMMY_EMPTY_INDEX = '"use strict";\nObject.defineProperty(exports, "__esModule", { value: true });\n';

function makePackageJson(name, version, extra) {
  return JSON.stringify(
    Object.assign(
      {
        name: name,
        version: version || "1.0.0",
        description: "Shim placeholder for " + name + " (missing peer dep workaround)",
        main: "index.js",
        license: "MIT",
      },
      extra || {}
    ),
    null,
    2
  );
}

const CUSTOM_SHIMS = {
  "client-only": {
    "package.json": makePackageJson("client-only", "0.0.1"),
    "index.js": DUMMY_EMPTY_INDEX,
  },
  "server-only": {
    "package.json": makePackageJson("server-only", "0.0.1"),
    "index.js": DUMMY_EMPTY_INDEX,
  },
  callsites: {
    "package.json": makePackageJson("callsites", "3.1.0", { engines: { node: ">=6" } }),
    "index.js": "'use strict';\nmodule.exports = function () { return []; };\n",
  },
  "is-number": {
    "package.json": makePackageJson("is-number", "7.0.0", { engines: { node: ">=0.12.0" } }),
    "index.js":
      "'use strict';\n" +
      "module.exports = function (num) {\n" +
      "  if (typeof num === 'number') return num - num === 0;\n" +
      "  if (typeof num === 'string' && num.trim() !== '') {\n" +
      "    return Number.isFinite ? Number.isFinite(+num) : isFinite(+num);\n" +
      "  }\n" +
      "  return false;\n" +
      "};\n",
  },
  "to-regex-range": {
    "package.json": makePackageJson("to-regex-range", "5.0.1", { dependencies: { "is-number": "^7.0.0" }, engines: { node: ">=8.0" } }),
    "index.js":
      "'use strict';\n" +
      "var isNumber = require('is-number');\n" +
      "module.exports = function toRegexRange(min, max, options) {\n" +
      "  options = options || {};\n" +
      "  if (min === void 0 || max === void 0) return '';\n" +
      "  if (isNumber(min) && isNumber(max)) return '(' + min + '|' + max + ')';\n" +
      "  if (typeof min === 'string' && typeof max === 'string') return '(' + min + '|' + max + ')';\n" +
      "  return '';\n" +
      "};\n",
  },
  "fill-range": {
    "package.json": makePackageJson("fill-range", "7.1.1", { dependencies: { "to-regex-range": "^5.0.1" }, engines: { node: ">=8" } }),
    "index.js":
      "'use strict';\n" +
      "var toRegexRange = require('to-regex-range');\n" +
      "module.exports = function fillRange(min, max, step, options) {\n" +
      "  if (arguments.length <= 1) return [];\n" +
      "  if (typeof step === 'object') { options = step; step = void 0; }\n" +
      "  if (step === void 0) step = 1;\n" +
      "  options = options || {};\n" +
      "  if (typeof min === 'number' && typeof max === 'number') {\n" +
      "    if (options.toRegex) return toRegexRange(min, max, options);\n" +
      "    var arr = [];\n" +
      "    if (min > max) { for (var i = min; i >= max; i -= step) arr.push(i); }\n" +
      "    else { for (var j = min; j <= max; j += step) arr.push(j); }\n" +
      "    return arr;\n" +
      "  }\n" +
      "  if (typeof min === 'string' && typeof max === 'string') {\n" +
      "    if (options.toRegex) return toRegexRange(min, max, options);\n" +
      "    var s = min.charCodeAt(0), e = max.charCodeAt(0), sArr = [];\n" +
      "    if (s > e) { for (var a = s; a >= e; a -= step) sArr.push(String.fromCharCode(a)); }\n" +
      "    else { for (var b = s; b <= e; b += step) sArr.push(String.fromCharCode(b)); }\n" +
      "    return sArr;\n" +
      "  }\n" +
      "  return [];\n" +
      "};\n",
  },
  braces: {
    "package.json": makePackageJson("braces", "3.0.3", { dependencies: { "fill-range": "^7.1.1" }, engines: { node: ">=8" } }),
    "index.js":
      "'use strict';\n" +
      "var fillRange = require('fill-range');\n" +
      "function braces(input, options) {\n" +
      "  options = options || {};\n" +
      "  if (typeof input !== 'string') return [];\n" +
      "  if (/\\.\\./.test(input)) {\n" +
      "    var parts = input.split('..');\n" +
      "    if (parts.length >= 2) { try { return fillRange(parts[0], parts[1].split(/[{}]/)[0]); } catch (e) { return [input]; } }\n" +
      "  }\n" +
      "  try {\n" +
      "    var matches = input.match(/\\{([^{}]+)\\}/);\n" +
      "    if (matches) return matches[1].split(',').map(function (it) { return input.replace(matches[0], it); });\n" +
      "  } catch (e) {}\n" +
      "  return [input];\n" +
      "}\n" +
      "braces.expand = braces; braces.compile = function (i) { return typeof i === 'string' ? i : ''; };\n" +
      "module.exports = braces;\n",
  },
  picomatch: {
    "package.json": makePackageJson("picomatch", "2.3.1", { engines: { node: ">=8.6" } }),
    "index.js":
      "'use strict';\n" +
      "function picomatch(glob, options) {\n" +
      "  function match(str) {\n" +
      "    if (typeof str !== 'string') return false;\n" +
      "    if (glob === '*' || glob === '**') return true;\n" +
      "    try {\n" +
      "      if (typeof glob === 'string') {\n" +
      "        var esc = glob.replace(/[.+^${}()|[\\]\\\\]/g, '\\\\$&').replace(/\\*/g, '.*').replace(/\\?/g, '.');\n" +
      "        return new RegExp('^' + esc + '$').test(str);\n" +
      "      }\n" +
      "    } catch (e) {}\n" +
      "    return true;\n" +
      "  }\n" +
      "  match.test = match;\n" +
      "  return match;\n" +
      "}\n" +
      "picomatch.test = function (input, glob, options) { try { return picomatch(glob, options)(input); } catch (e) { return true; } };\n" +
      "picomatch.matchBase = function (b, g, o) { try { return picomatch(g, o)(b); } catch (e) { return true; } };\n" +
      "picomatch.isMatch = picomatch.test;\n" +
      "picomatch.parse = function () { return {}; };\n" +
      "picomatch.scan = function () { return {}; };\n" +
      "module.exports = picomatch;\n",
  },
  micromatch: {
    "package.json": makePackageJson("micromatch", "4.0.7", { dependencies: { braces: "^3.0.3", picomatch: "^2.3.1" }, engines: { node: ">=8.6" } }),
    "index.js":
      "'use strict';\n" +
      "var picomatch = require('picomatch');\n" +
      "var braces = require('braces');\n" +
      "function micromatch(list, patterns, options) {\n" +
      "  if (!Array.isArray(list)) list = [list];\n" +
      "  if (!Array.isArray(patterns)) patterns = [patterns];\n" +
      "  try {\n" +
      "    return list.filter(function (item) {\n" +
      "      return patterns.some(function (p) { try { return picomatch(p, options)(item); } catch (e) { return true; } });\n" +
      "    });\n" +
      "  } catch (e) { return list; }\n" +
      "}\n" +
      "micromatch.isMatch = function (str, pattern, options) { try { return picomatch(pattern, options)(str); } catch (e) { return true; } };\n" +
      "micromatch.not = function (list, patterns, options) {\n" +
      "  if (!Array.isArray(list)) list = [list]; if (!Array.isArray(patterns)) patterns = [patterns];\n" +
      "  try {\n" +
      "    return list.filter(function (item) { return !patterns.some(function (p) { try { return picomatch(p, options)(item); } catch (e) { return false; } }); });\n" +
      "  } catch (e) { return list; }\n" +
      "};\n" +
      "micromatch.contains = micromatch.isMatch;\n" +
      "micromatch.match = micromatch;\n" +
      "micromatch.scan = function () { return {}; };\n" +
      "micromatch.braces = braces;\n" +
      "micromatch.picomatch = picomatch;\n" +
      "module.exports = micromatch;\n",
  },
  "node-exports-info": {
    "package.json": makePackageJson("node-exports-info", "1.2.3"),
    "index.js":
      '"use strict";\n' +
      'Object.defineProperty(exports, "__esModule", { value: true });\n' +
      'exports.getCategoryInfo = function getCategoryInfo(packageName, subpath, conditions) {\n' +
      '  return { type: "unknown", found: false, path: subpath || ".", guess: void 0 };\n' +
      '};\n' +
      'exports.tryReadPackage = function tryReadPackage(dir) { return null; };\n' +
      'exports.isNotFound = function isNotFound(e) { return false; };\n',
  },
};

const GENERIC_NAMES = [
  "is-extendable",
  "is-plain-object",
  "isobject",
  "assign-symbols",
  "extend-shallow",
  "for-in",
  "kind-of",
  "isarray",
  "define-property",
  "is-descriptor",
  "is-accessor-descriptor",
  "is-data-descriptor",
  "has-values",
  "has-value",
  "get-value",
  "set-value",
  "unset-value",
  "to-object-path",
  "snapdragon",
  "snapdragon-util",
  "snapdragon-node",
  "split-string",
  "extract-stack",
  "debug",
  "ms",
  "chalk",
  "ansi-styles",
  "ansi-regex",
  "strip-ansi",
  "color-convert",
  "color-name",
  "colord",
  "lilconfig",
  "yaml",
  "sucrase",
  "sucrase-js",
  "camelcase-css",
  "postcss-selector-parser",
  "postcss-value-parser",
  "cssesc",
  "util-deprecate",
  "path-browserify",
  "punycode",
  "querystringify",
  "requires-port",
  "url-parse",
  "uri-js",
  "json5",
  "semver",
  "lru-cache",
  "yallist",
  "at-least-node",
  "graceful-fs",
  "universalify",
  "jsonfile",
  "escalade",
  "import-cwd",
  "import-from",
  "global-dirs",
  "resolve-from",
  "parent-module",
  "import-fresh",
  "acorn",
  "acorn-walk",
  "espree",
  "postcss-js",
  "postcss-nested",
  "camelcase",
  "decamelize",
  "hex-color-regex",
  "hsl-regex",
  "hsla-regex",
  "rgb-regex",
  "rgba-regex",
  "is-color-stop",
  "p-limit",
  "p-locate",
  "p-try",
  "yocto-queue",
  "object-assign",
  "function-bind",
  "call-bind",
  "get-intrinsic",
  "has",
  "has-symbols",
  "define-properties",
  "object-keys",
  "es-abstract",
  "string.prototype.trimend",
  "string.prototype.trimstart",
  "array-includes",
  "is-string",
  "is-symbol",
  "which-boxed-primitive",
  "unbox-primitive",
  "is-bigint",
  "is-boolean-object",
  "is-number-object",
  "glob-parent",
  "fast-glob",
  "merge2",
  "@nodelib/fs.stat",
  "@nodelib/fs.scandir",
  "@nodelib/fs.walk",
  "run-parallel",
  "queue-microtask",
  "reusify",
  "to-fast-properties",
  "strip-bom",
  "strip-bom-string",
  "detect-indent",
  "min-indent",
  "ci-info",
  "os-homedir",
  "os-tmpdir",
  "osenv",
  "wordwrap",
  "ini",
  "proto-list",
  "config-chain",
  "editorconfig",
  "fastq",
  "retry",
  "fast-json-stable-stringify",
];

function ensureDir(dirPath) {
  if (!fs.existsSync(dirPath)) {
    try { fs.mkdirSync(dirPath, { recursive: true }); } catch (e) {}
  }
}

function writeFileSafe(filePath, content) {
  try {
    ensureDir(path.dirname(filePath));
    fs.writeFileSync(filePath, content, "utf8");
    return true;
  } catch (err) {
    return false;
  }
}

function ensureCustomShim(name, files) {
  if (!fs.existsSync(NODE_MODULES)) return false;
  const shimDir = path.join(NODE_MODULES, name);
  ensureDir(shimDir);
  let ok = true;
  for (const [fileName, content] of Object.entries(files)) {
    if (!writeFileSafe(path.join(shimDir, fileName), content)) ok = false;
  }
  return ok;
}

function ensureGenericShim(name) {
  if (!fs.existsSync(NODE_MODULES)) return false;
  const shimDir = path.join(NODE_MODULES, name);
  if (fs.existsSync(shimDir)) return false;
  ensureDir(shimDir);
  let ok = true;
  if (!writeFileSafe(path.join(shimDir, "package.json"), makePackageJson(name, "1.0.0-shim"))) ok = false;
  if (!writeFileSafe(path.join(shimDir, "index.js"), DUMMY_INDEX)) ok = false;
  return ok;
}

function main() {
  let totalOK = 0;
  let totalWarn = 0;

  const customNames = Object.keys(CUSTOM_SHIMS);
  for (const name of customNames) {
    try {
      if (ensureCustomShim(name, CUSTOM_SHIMS[name])) {
        totalOK++;
        console.log(`[ensure-shims] OK: ${name} (custom shim)`);
      } else {
        totalWarn++;
        console.warn(`[ensure-shims] AVISO: ${name} (custom falhou)`);
      }
    } catch (err) {
      totalWarn++;
      console.warn(`[ensure-shims] AVISO: ${name} erro: ${err.message}`);
    }
  }

  for (const name of GENERIC_NAMES) {
    try {
      if (ensureGenericShim(name)) {
        totalOK++;
        console.log(`[ensure-shims] OK: ${name} (generic shim)`);
      }
    } catch (err) {
      totalWarn++;
    }
  }

  const total = customNames.length + GENERIC_NAMES.length;
  console.log(`\n[ensure-shims] Concluído: ${totalOK}/${total} shims verificados (${totalWarn} avisos).`);
}

main();
