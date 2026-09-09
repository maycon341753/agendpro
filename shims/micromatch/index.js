'use strict';
var picomatch;
var braces;
try { picomatch = require('picomatch'); } catch (e) {
  picomatch = function (glob, options) {
    function match(str) { if (typeof str !== 'string') return false; if (glob === '*' || glob === '**') return true; try { var esc = (glob || '').replace(/[.+^${}()|[\]\\]/g, '\\$&').replace(/\*/g, '.*').replace(/\?/g, '.'); return new RegExp('^' + esc + '$').test(str); } catch (err) { return true; } }
    match.test = match; return match;
  };
  picomatch.matcher = picomatch;
  picomatch.makeRe = function () { return /^.*$/; };
  picomatch.test = function (s, g, o) { try { return picomatch(g, o)(s); } catch (e) { return true; } };
  picomatch.matchBase = function (b, g, o) { try { return picomatch(g, o)(b); } catch (e) { return true; } };
  picomatch.isMatch = picomatch.test;
  picomatch.parse = function () { return {}; };
  picomatch.scan = function () { return {}; };
  picomatch.toRegex = function () { return /^.*$/; };
}
try { braces = require('braces'); } catch (e) {
  braces = function (input, options) {
    options = options || {}; if (typeof input !== 'string') return [];
    if (/\.\./.test(input)) { try { var fillRange; try { fillRange = require('fill-range'); } catch (ee) { fillRange = function (a, b) { return [a, b]; }; } var parts = input.split('..'); if (parts.length >= 2) return fillRange(parts[0], parts[1].split(/[{}]/)[0]); } catch (err) { return [input]; } }
    try { var matches = input.match(/\{([^{}]+)\}/); if (matches) return matches[1].split(',').map(function (it) { return input.replace(matches[0], it); }); } catch (err) {}
    return [input];
  };
  braces.expand = braces; braces.compile = function (i) { return typeof i === 'string' ? i : ''; }; braces.makeRe = function () { return /^.*$/; }; braces.list = function (i) { return [i]; }; braces.snapdragon = function () { return {}; };
}

function micromatch(list, patterns, options) {
  if (!Array.isArray(list)) list = [list];
  if (!Array.isArray(patterns)) patterns = [patterns];
  try {
    return list.filter(function (item) {
      return patterns.some(function (p) {
        try { return picomatch(p, options)(item); } catch (e) { return true; }
      });
    });
  } catch (e) { return list; }
}

micromatch.matcher = function matcher(pattern, options) {
  try { return picomatch(pattern, options); } catch (e) {
    function matchFallback(str) { return typeof str === 'string'; }
    matchFallback.test = matchFallback;
    return matchFallback;
  }
};

micromatch.isMatch = function (str, pattern, options) {
  try { return picomatch(pattern, options)(str); } catch (e) { return true; }
};

micromatch.not = function (list, patterns, options) {
  if (!Array.isArray(list)) list = [list];
  if (!Array.isArray(patterns)) patterns = [patterns];
  try {
    return list.filter(function (item) {
      return !patterns.some(function (p) { try { return picomatch(p, options)(item); } catch (e) { return false; } });
    });
  } catch (e) { return list; }
};

micromatch.contains = micromatch.isMatch;
micromatch.match = micromatch;

micromatch.all = function (list, patterns, options) {
  return micromatch(list, patterns, options);
};

micromatch.filter = function (pattern, options) {
  var fn = micromatch.matcher(pattern, options);
  return function (str) { return fn(str); };
};

micromatch.some = function (list, patterns, options) {
  if (!Array.isArray(list)) list = [list];
  if (!Array.isArray(patterns)) patterns = [patterns];
  try { return list.some(function (item) { return patterns.some(function (p) { try { return picomatch(p, options)(item); } catch (e) { return true; } }); }); } catch (e) { return true; }
};

micromatch.every = function (list, patterns, options) {
  if (!Array.isArray(list)) list = [list];
  if (!Array.isArray(patterns)) patterns = [patterns];
  try { return list.every(function (item) { return patterns.some(function (p) { try { return picomatch(p, options)(item); } catch (e) { return true; } }); }); } catch (e) { return true; }
};

micromatch.any = function (list, patterns, options) {
  return micromatch.some(list, patterns, options);
};

micromatch.matchKeys = function (obj, patterns, options) {
  if (!obj || typeof obj !== 'object') return {};
  var keys = Object.keys(obj);
  var matched = micromatch(keys, patterns, options);
  var result = {};
  for (var i = 0; i < matched.length; i++) { result[matched[i]] = obj[matched[i]]; }
  return result;
};

micromatch.capture = function capture(pattern, string, options) {
  var result = []; try {
    var fn = picomatch(pattern, Object.assign({}, options || {}, { capture: true }));
    if (typeof fn === 'function') return fn(string) || [];
  } catch (e) {}
  return result;
};

micromatch.makeRe = function makeRe(pattern, options) {
  try {
    if (typeof pattern === 'string') {
      var esc = pattern.replace(/[.+^${}()|[\]\\]/g, '\\$&').replace(/\*/g, '.*').replace(/\?/g, '.');
      return new RegExp('^' + esc + '$');
    }
  } catch (e) {}
  return /^.*$/;
};

micromatch.expand = function expand(pattern, options) {
  try { if (braces && typeof braces.expand === 'function') return braces.expand(pattern, options); } catch (e) {}
  return [pattern];
};

micromatch.list = function list(str, options) {
  try { if (braces && typeof braces.list === 'function') return braces.list(str, options); } catch (e) {}
  return [str];
};

micromatch.array = function array(arr, patterns, options) {
  return micromatch(arr, patterns, options);
};

micromatch.parse = function parse(pattern, options) {
  if (typeof pattern !== 'string') pattern = '';
  return {
    input: pattern,
    prefix: '',
    start: 0,
    base: '',
    glob: pattern,
    slashes: [],
    parts: [],
    tokens: [],
    isBrace: false,
    isBracket: false,
    isGlob: /[*?{}[\]]/.test(pattern),
    isExtglob: false,
    isGlobstar: /\*\*/.test(pattern),
  };
};
micromatch.scan = function scan(input, options) {
  if (typeof input !== 'string') input = '';
  return {
    input: input,
    start: 0,
    base: input,
    prefix: '',
    glob: input,
    isGlob: /[*?{}[\]]/.test(input),
    isBrace: false,
    isBracket: false,
    isGlobstar: /\*\*/.test(input),
    isExtglob: false,
    slashes: [],
    parts: input.split('/'),
    tokens: [],
  };
};
micromatch.braces = braces;
micromatch.picomatch = picomatch;
micromatch.default = micromatch;
module.exports = micromatch;
module.exports.default = micromatch;
