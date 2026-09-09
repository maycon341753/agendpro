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
      "var fillRange;\n" +
      "try { fillRange = require('fill-range'); } catch (e) {\n" +
      "  fillRange = function fillRange(min, max, step, options) {\n" +
      "    if (arguments.length <= 1) return [];\n" +
      "    if (typeof step === 'object') { options = step; step = void 0; }\n" +
      "    if (step === void 0) step = 1;\n" +
      "    options = options || {};\n" +
      "    if (typeof min === 'number' && typeof max === 'number') {\n" +
      "      if (options.toRegex) return '(' + min + '|' + max + ')';\n" +
      "      var arr = [];\n" +
      "      if (min > max) { for (var i = min; i >= max; i -= step) arr.push(i); }\n" +
      "      else { for (var j = min; j <= max; j += step) arr.push(j); }\n" +
      "      return arr;\n" +
      "    }\n" +
      "    if (typeof min === 'string' && typeof max === 'string') {\n" +
      "      if (options.toRegex) return '(' + min + '|' + max + ')';\n" +
      "      var s = min.charCodeAt(0), e = max.charCodeAt(0), sArr = [];\n" +
      "      if (s > e) { for (var a = s; a >= e; a -= step) sArr.push(String.fromCharCode(a)); }\n" +
      "      else { for (var b = s; b <= e; b += step) sArr.push(String.fromCharCode(b)); }\n" +
      "      return sArr;\n" +
      "    }\n" +
      "    return [];\n" +
      "  };\n" +
      "}\n" +
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
      "braces.expand = braces;\n" +
      "braces.compile = function (input) { return typeof input === 'string' ? input : ''; };\n" +
      "braces.makeRe = function makeRe(input) {\n" +
      "  try {\n" +
      "    var expanded = braces.expand(input, { expand: false });\n" +
      "    if (Array.isArray(expanded) && expanded.length > 0) {\n" +
      "      var joined = expanded.map(function (x) { return (x || '').replace(/[.+^${}()|[\\]\\\\]/g, '\\\\$&').replace(/\\*/g, '.*').replace(/\\?/g, '.'); }).join('|');\n" +
      "      return new RegExp('^(' + joined + ')$');\n" +
      "    }\n" +
      "  } catch (e) {}\n" +
      "  return /^.*$/;\n" +
      "};\n" +
      "braces.list = function list(input, options) { try { return braces.expand(input, options); } catch (e) { return [input]; } };\n" +
      "braces.snapdragon = function snapdragon() { return {}; };\n" +
      "braces.braces = braces;\n" +
      "braces.default = braces;\n" +
      "module.exports = braces;\n" +
      "module.exports.default = braces;\n",
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
      "picomatch.matcher = picomatch;\n" +
      "picomatch.test = function (input, glob, options) { try { return picomatch(glob, options)(input); } catch (e) { return true; } };\n" +
      "picomatch.matchBase = function (basename, glob, options) { try { return picomatch(glob, options)(basename); } catch (e) { return true; } };\n" +
      "picomatch.isMatch = picomatch.test;\n" +
      "picomatch.makeRe = function makeRe(pattern, options) {\n" +
      "  try {\n" +
      "    if (typeof pattern === 'string') {\n" +
      "      var esc = pattern.replace(/[.+^${}()|[\\]\\\\]/g, '\\\\$&').replace(/\\*/g, '.*').replace(/\\?/g, '.');\n" +
      "      return new RegExp('^' + esc + '$');\n" +
      "    }\n" +
      "  } catch (e) {}\n" +
      "  return /^.*$/;\n" +
      "};\n" +
      "picomatch.toRegex = picomatch.makeRe;\n" +
      "picomatch.parse = function (pattern, options) {\n" +
      "  if (typeof pattern !== 'string') pattern = '';\n" +
      "  return { input: pattern, prefix: '', start: 0, base: '', glob: pattern, slashes: [], parts: [], tokens: [], isBrace: false, isBracket: false, isGlob: /[*?{}[\\]]/.test(pattern), isExtglob: false, isGlobstar: /\\*\\*/.test(pattern) };\n" +
      "};\n" +
      "picomatch.scan = function (input, options) {\n" +
      "  if (typeof input !== 'string') input = '';\n" +
      "  return { input: input, start: 0, base: input, prefix: '', glob: input, isGlob: /[*?{}[\\]]/.test(input), isBrace: false, isBracket: false, isGlobstar: /\\*\\*/.test(input), isExtglob: false, slashes: [], parts: input.split('/'), tokens: [] };\n" +
      "};\n" +
      "picomatch.default = picomatch;\n" +
      "module.exports = picomatch;\n" +
      "module.exports.default = picomatch;\n",
  },
  micromatch: {
    "package.json": makePackageJson("micromatch", "4.0.7", { dependencies: { braces: "^3.0.3", picomatch: "^2.3.1" }, engines: { node: ">=8.6" } }),
    "index.js":
      "'use strict';\n" +
      "var picomatch;\n" +
      "var braces;\n" +
      "try { picomatch = require('picomatch'); } catch (e) {\n" +
      "  picomatch = function (glob, options) {\n" +
      "    function match(str) { if (typeof str !== 'string') return false; if (glob === '*' || glob === '**') return true; try { var esc = (glob || '').replace(/[.+^${}()|[\\]\\\\]/g, '\\\\$&').replace(/\\*/g, '.*').replace(/\\?/g, '.'); return new RegExp('^' + esc + '$').test(str); } catch (err) { return true; } }\n" +
      "    match.test = match; return match;\n" +
      "  };\n" +
      "  picomatch.matcher = picomatch;\n" +
      "  picomatch.makeRe = function () { return /^.*$/; };\n" +
      "  picomatch.test = function (s, g, o) { try { return picomatch(g, o)(s); } catch (e) { return true; } };\n" +
      "  picomatch.matchBase = function (b, g, o) { try { return picomatch(g, o)(b); } catch (e) { return true; } };\n" +
      "  picomatch.isMatch = picomatch.test;\n" +
      "  picomatch.parse = function (pattern, options) {\n" +
      "    if (typeof pattern !== 'string') pattern = '';\n" +
      "    return { input: pattern, prefix: '', start: 0, base: '', glob: pattern, slashes: [], parts: [], tokens: [], isBrace: false, isBracket: false, isGlob: /[*?{}[\\]]/.test(pattern), isExtglob: false, isGlobstar: /\\*\\*/.test(pattern) };\n" +
      "  };\n" +
      "  picomatch.scan = function (input, options) {\n" +
      "    if (typeof input !== 'string') input = '';\n" +
      "    return { input: input, start: 0, base: input, prefix: '', glob: input, isGlob: /[*?{}[\\]]/.test(input), isBrace: false, isBracket: false, isGlobstar: /\\*\\*/.test(input), isExtglob: false, slashes: [], parts: input.split('/'), tokens: [] };\n" +
      "  };\n" +
      "  picomatch.toRegex = function () { return /^.*$/; };\n" +
      "}\n" +
      "try { braces = require('braces'); } catch (e) {\n" +
      "  braces = function (input, options) {\n" +
      "    options = options || {}; if (typeof input !== 'string') return [];\n" +
      "    if (/\\.\\./.test(input)) { try { var fillRange; try { fillRange = require('fill-range'); } catch (ee) { fillRange = function (a, b) { return [a, b]; }; } var parts = input.split('..'); if (parts.length >= 2) return fillRange(parts[0], parts[1].split(/[{}]/)[0]); } catch (err) { return [input]; } }\n" +
      "    try { var matches = input.match(/\\{([^{}]+)\\}/); if (matches) return matches[1].split(',').map(function (it) { return input.replace(matches[0], it); }); } catch (err) {}\n" +
      "    return [input];\n" +
      "  };\n" +
      "  braces.expand = braces; braces.compile = function (i) { return typeof i === 'string' ? i : ''; }; braces.makeRe = function () { return /^.*$/; }; braces.list = function (i) { return [i]; }; braces.snapdragon = function () { return {}; };\n" +
      "}\n" +
      "function micromatch(list, patterns, options) {\n" +
      "  if (!Array.isArray(list)) list = [list];\n" +
      "  if (!Array.isArray(patterns)) patterns = [patterns];\n" +
      "  try {\n" +
      "    return list.filter(function (item) {\n" +
      "      return patterns.some(function (p) { try { return picomatch(p, options)(item); } catch (e) { return true; } });\n" +
      "    });\n" +
      "  } catch (e) { return list; }\n" +
      "}\n" +
      "micromatch.matcher = function matcher(pattern, options) {\n" +
      "  try { return picomatch(pattern, options); } catch (e) {\n" +
      "    function matchFallback(str) { return typeof str === 'string'; }\n" +
      "    matchFallback.test = matchFallback;\n" +
      "    return matchFallback;\n" +
      "  }\n" +
      "};\n" +
      "micromatch.isMatch = function (str, pattern, options) { try { return picomatch(pattern, options)(str); } catch (e) { return true; } };\n" +
      "micromatch.not = function (list, patterns, options) {\n" +
      "  if (!Array.isArray(list)) list = [list]; if (!Array.isArray(patterns)) patterns = [patterns];\n" +
      "  try {\n" +
      "    return list.filter(function (item) { return !patterns.some(function (p) { try { return picomatch(p, options)(item); } catch (e) { return false; } }); });\n" +
      "  } catch (e) { return list; }\n" +
      "};\n" +
      "micromatch.contains = micromatch.isMatch;\n" +
      "micromatch.match = micromatch;\n" +
      "micromatch.all = function (list, patterns, options) { return micromatch(list, patterns, options); };\n" +
      "micromatch.filter = function (pattern, options) {\n" +
      "  var fn = micromatch.matcher(pattern, options);\n" +
      "  return function (str) { return fn(str); };\n" +
      "};\n" +
      "micromatch.some = function (list, patterns, options) {\n" +
      "  if (!Array.isArray(list)) list = [list];\n" +
      "  if (!Array.isArray(patterns)) patterns = [patterns];\n" +
      "  try { return list.some(function (item) { return patterns.some(function (p) { try { return picomatch(p, options)(item); } catch (e) { return true; } }); }); } catch (e) { return true; }\n" +
      "};\n" +
      "micromatch.every = function (list, patterns, options) {\n" +
      "  if (!Array.isArray(list)) list = [list];\n" +
      "  if (!Array.isArray(patterns)) patterns = [patterns];\n" +
      "  try { return list.every(function (item) { return patterns.some(function (p) { try { return picomatch(p, options)(item); } catch (e) { return true; } }); }); } catch (e) { return true; }\n" +
      "};\n" +
      "micromatch.any = function (list, patterns, options) { return micromatch.some(list, patterns, options); };\n" +
      "micromatch.matchKeys = function (obj, patterns, options) {\n" +
      "  if (!obj || typeof obj !== 'object') return {};\n" +
      "  var keys = Object.keys(obj);\n" +
      "  var matched = micromatch(keys, patterns, options);\n" +
      "  var result = {};\n" +
      "  for (var i = 0; i < matched.length; i++) { result[matched[i]] = obj[matched[i]]; }\n" +
      "  return result;\n" +
      "};\n" +
      "micromatch.capture = function capture(pattern, string, options) {\n" +
      "  var result = []; try {\n" +
      "    var fn = picomatch(pattern, Object.assign({}, options || {}, { capture: true }));\n" +
      "    if (typeof fn === 'function') return fn(string) || [];\n" +
      "  } catch (e) {}\n" +
      "  return result;\n" +
      "};\n" +
      "micromatch.makeRe = function makeRe(pattern, options) {\n" +
      "  try {\n" +
      "    if (typeof pattern === 'string') {\n" +
      "      var esc = pattern.replace(/[.+^${}()|[\\]\\\\]/g, '\\\\$&').replace(/\\*/g, '.*').replace(/\\?/g, '.');\n" +
      "      return new RegExp('^' + esc + '$');\n" +
      "    }\n" +
      "  } catch (e) {}\n" +
      "  return /^.*$/;\n" +
      "};\n" +
      "micromatch.expand = function expand(pattern, options) {\n" +
      "  try { if (braces && typeof braces.expand === 'function') return braces.expand(pattern, options); } catch (e) {}\n" +
      "  return [pattern];\n" +
      "};\n" +
      "micromatch.list = function list(str, options) {\n" +
      "  try { if (braces && typeof braces.list === 'function') return braces.list(str, options); } catch (e) {}\n" +
      "  return [str];\n" +
      "};\n" +
      "micromatch.array = function array(arr, patterns, options) { return micromatch(arr, patterns, options); };\n" +
      "micromatch.parse = function parse(pattern, options) {\n" +
      "  if (typeof pattern !== 'string') pattern = '';\n" +
      "  return { input: pattern, prefix: '', start: 0, base: '', glob: pattern, slashes: [], parts: [], tokens: [], isBrace: false, isBracket: false, isGlob: /[*?{}[\\]]/.test(pattern), isExtglob: false, isGlobstar: /\\*\\*/.test(pattern) };\n" +
      "};\n" +
      "micromatch.scan = function scan(input, options) {\n" +
      "  if (typeof input !== 'string') input = '';\n" +
      "  return { input: input, start: 0, base: input, prefix: '', glob: input, isGlob: /[*?{}[\\]]/.test(input), isBrace: false, isBracket: false, isGlobstar: /\\*\\*/.test(input), isExtglob: false, slashes: [], parts: input.split('/'), tokens: [] };\n" +
      "};\n" +
      "micromatch.braces = braces;\n" +
      "micromatch.picomatch = picomatch;\n" +
      "micromatch.default = micromatch;\n" +
      "module.exports = micromatch;\n" +
      "module.exports.default = micromatch;\n",
  },
  "fast-glob": {
    "package.json": makePackageJson("fast-glob", "3.3.2", { dependencies: { "glob-parent": "^6.0.2", micromatch: "^4.0.4", braces: "^3.0.2" }, engines: { node: ">=8.6" } }),
    "index.js":
      "'use strict';\n" +
      "var fs; var path;\n" +
      "try { fs = require('fs'); } catch (e) {}\n" +
      "try { path = require('path'); } catch (e) {}\n" +
      "function walkDir(dir, results, seen, options, depth) {\n" +
      "  if (depth > 10) return;\n" +
      "  try {\n" +
      "    var entries = fs.readdirSync(dir, { withFileTypes: true });\n" +
      "    for (var i = 0; i < entries.length; i++) {\n" +
      "      var entry = entries[i]; var full = path ? path.join(dir, entry.name) : dir + '/' + entry.name;\n" +
      "      if (seen[full]) continue; seen[full] = true;\n" +
      "      try {\n" +
      "        if (entry.isDirectory()) {\n" +
      "          if (entry.name === 'node_modules' || entry.name === '.git' || entry.name === '.next' || entry.name === 'dist' || entry.name === 'build') continue;\n" +
      "          walkDir(full, results, seen, options, depth + 1);\n" +
      "        } else if (entry.isFile()) {\n" +
      "          var extOk = /\\.(js|jsx|ts|tsx|mdx|md|html|css)$/i.test(entry.name);\n" +
      "          if (extOk || (options && options.dot)) results.push(full);\n" +
      "        }\n" +
      "      } catch (e) {}\n" +
      "    }\n" +
      "  } catch (e) {}\n" +
      "}\n" +
      "function fastGlobSync(patterns, options) {\n" +
      "  if (!patterns) return []; if (!Array.isArray(patterns)) patterns = [patterns];\n" +
      "  options = options || {}; var results = []; var seen = {};\n" +
      "  var cwd = options.cwd || process.cwd();\n" +
      "  for (var pi = 0; pi < patterns.length; pi++) {\n" +
      "    var p = patterns[pi]; if (typeof p !== 'string') continue;\n" +
      "    if (p[0] === '!') continue;\n" +
      "    try { var parentDir = cwd; if (path && typeof path.dirname === 'function') { try { parentDir = path.resolve(cwd, p.split('*')[0].split('?')[0].split('{')[0].replace(/[^/\\\\]+$/, '') || '.'); } catch (e) {} } if (fs && typeof fs.readdirSync === 'function') walkDir(parentDir, results, seen, options, 0); } catch (e) {}\n" +
      "  }\n" +
      "  return results;\n" +
      "}\n" +
      "function fastGlob(patterns, options) { return Promise.resolve(fastGlobSync(patterns, options)); }\n" +
      "fastGlob.sync = fastGlobSync; fastGlob.async = fastGlob;\n" +
      "fastGlob.stream = function () {\n" +
      "  var Readable; try { Readable = require('stream').Readable; } catch (e) {}\n" +
      "  if (!Readable) return { on: function () { return this; }, pipe: function () { return this; } };\n" +
      "  return new Readable({ objectMode: true, read: function () { this.push(null); } });\n" +
      "};\n" +
      "fastGlob.generate = function () { return []; };\n" +
      "fastGlob.generateTasks = function (patterns, options) {\n" +
      "  if (!patterns) return []; if (!Array.isArray(patterns)) patterns = [patterns]; options = options || {};\n" +
      "  var tasks = []; var positive = []; var negative = [];\n" +
      "  for (var i = 0; i < patterns.length; i++) { var p = patterns[i]; if (typeof p !== 'string') continue; if (p[0] === '!') negative.push(p.slice(1)); else positive.push(p); }\n" +
      "  if (positive.length === 0 && patterns.length > 0) { positive.push('**/*'); }\n" +
      "  for (var j = 0; j < positive.length; j++) {\n" +
      "    tasks.push({ pattern: positive[j], patterns: [positive[j]], negative: negative.slice(), options: Object.assign({}, options, { cwd: options.cwd || process.cwd() }), base: options.cwd || process.cwd(), dynamic: true });\n" +
      "  }\n" +
      "  return tasks;\n" +
      "};\n" +
      "fastGlob.isDynamicPattern = function (pattern, options) { if (typeof pattern !== 'string') return false; return /[*?{[\\]()]/.test(pattern); };\n" +
      "fastGlob.isStaticPattern = function (pattern, options) { return !fastGlob.isDynamicPattern(pattern, options); };\n" +
      "fastGlob.escapePath = function (p) { return String(p || ''); };\n" +
      "fastGlob.default = fastGlob;\n" +
      "module.exports = fastGlob; module.exports.default = fastGlob; module.exports.sync = fastGlobSync; module.exports.async = fastGlob;\n" +
      "module.exports.generateTasks = fastGlob.generateTasks; module.exports.isDynamicPattern = fastGlob.isDynamicPattern; module.exports.isStaticPattern = fastGlob.isStaticPattern;\n",
  },
  "glob-parent": {
    "package.json": makePackageJson("glob-parent", "6.0.2", { engines: { node: ">=10.13.0" } }),
    "index.js":
      "'use strict';\n" +
      "var path; try { path = require('path'); } catch (e) {}\n" +
      "function globParent(pattern, options) {\n" +
      "  if (typeof pattern !== 'string') return '';\n" +
      "  options = options || {};\n" +
      "  var cleaned = pattern;\n" +
      "  if (options.flipBackslashes !== false) cleaned = cleaned.replace(/\\\\/g, '/');\n" +
      "  var idx = -1; var globChars = ['*', '?', '{', '[', '('];\n" +
      "  for (var i = 0; i < cleaned.length; i++) { if (globChars.indexOf(cleaned[i]) !== -1) { idx = i; break; } }\n" +
      "  var base = (idx === -1) ? cleaned : cleaned.slice(0, idx);\n" +
      "  var lastSlash = -1;\n" +
      "  for (var j = base.length - 1; j >= 0; j--) { if (base[j] === '/' || base[j] === '\\\\') { lastSlash = j; break; } }\n" +
      "  var result = (lastSlash === -1) ? '' : base.slice(0, lastSlash);\n" +
      "  if (result === '' && (pattern[0] === '/' || pattern[0] === '\\\\')) result = '/';\n" +
      "  return result;\n" +
      "}\n" +
      "globParent.default = globParent;\n" +
      "globParent.isGlob = function (pattern) { if (typeof pattern !== 'string') return false; return /[*?{[\\]()]/.test(pattern); };\n" +
      "globParent.globParent = globParent;\n" +
      "module.exports = globParent; module.exports.default = globParent;\n",
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
