'use strict';
var fs;
var path;
try { fs = require('fs'); } catch (e) {}
try { path = require('path'); } catch (e) {}

function fastGlob(patterns, options) {
  return Promise.resolve(fastGlobSync(patterns, options));
}

function fastGlobSync(patterns, options) {
  if (!patterns) return [];
  if (!Array.isArray(patterns)) patterns = [patterns];
  options = options || {};
  var results = [];
  var seen = {};
  var cwd = options.cwd || process.cwd();

  for (var pi = 0; pi < patterns.length; pi++) {
    var p = patterns[pi];
    if (typeof p !== 'string') continue;
    var neg = false;
    if (p[0] === '!') { neg = true; p = p.slice(1); }
    try {
      var parentDir = cwd;
      if (path && typeof path.dirname === 'function') {
        try { parentDir = path.resolve(cwd, p.split('*')[0].split('?')[0].split('{')[0].replace(/[^/\\]+$/, '') || '.'); } catch (e) {}
      }
      if (fs && typeof fs.readdirSync === 'function' && typeof fs.statSync === 'function') {
        walkDir(parentDir, results, seen, options, 0);
      }
    } catch (e) {}
  }
  return results;
}

function walkDir(dir, results, seen, options, depth) {
  if (depth > 10) return;
  try {
    var entries = fs.readdirSync(dir, { withFileTypes: true });
    for (var i = 0; i < entries.length; i++) {
      var entry = entries[i];
      var full = path ? path.join(dir, entry.name) : dir + '/' + entry.name;
      if (seen[full]) continue;
      seen[full] = true;
      try {
        if (entry.isDirectory()) {
          if (entry.name === 'node_modules' || entry.name === '.git' || entry.name === '.next' || entry.name === 'dist' || entry.name === 'build') continue;
          walkDir(full, results, seen, options, depth + 1);
        } else if (entry.isFile()) {
          var extOk = /\.(js|jsx|ts|tsx|mdx|md|html|css)$/i.test(entry.name);
          if (extOk || (options && options.dot)) results.push(full);
        }
      } catch (e) {}
    }
  } catch (e) {}
}

fastGlob.sync = fastGlobSync;
fastGlob.async = fastGlob;
fastGlob.stream = function () {
  var Readable; try { Readable = require('stream').Readable; } catch (e) {}
  if (!Readable) return { on: function () { return this; }, pipe: function () { return this; } };
  var s = new Readable({ objectMode: true, read: function () { this.push(null); } });
  return s;
};
fastGlob.generate = function () { return []; };
fastGlob.generateTasks = function (patterns, options) {
  if (!patterns) return [];
  if (!Array.isArray(patterns)) patterns = [patterns];
  options = options || {};
  var tasks = [];
  var positive = [];
  var negative = [];
  for (var i = 0; i < patterns.length; i++) {
    var p = patterns[i];
    if (typeof p !== 'string') continue;
    if (p[0] === '!') negative.push(p.slice(1));
    else positive.push(p);
  }
  if (positive.length === 0 && patterns.length > 0) {
    try { positive.push('**/*'); } catch (e) { positive = ['**/*']; }
  }
  for (var j = 0; j < positive.length; j++) {
    tasks.push({
      pattern: positive[j],
      patterns: [positive[j]],
      negative: negative.slice(),
      options: Object.assign({}, options, { cwd: options.cwd || process.cwd() }),
      base: options.cwd || process.cwd(),
      dynamic: true,
    });
  }
  return tasks;
};
fastGlob.isDynamicPattern = function (pattern, options) {
  if (typeof pattern !== 'string') return false;
  return /[*?{[\]()]/.test(pattern);
};
fastGlob.isStaticPattern = function (pattern, options) {
  return !fastGlob.isDynamicPattern(pattern, options);
};
fastGlob.escapePath = function (p) { return String(p || ''); };
fastGlob.default = fastGlob;

module.exports = fastGlob;
module.exports.default = fastGlob;
module.exports.sync = fastGlobSync;
module.exports.async = fastGlob;
module.exports.generateTasks = fastGlob.generateTasks;
module.exports.isDynamicPattern = fastGlob.isDynamicPattern;
module.exports.isStaticPattern = fastGlob.isStaticPattern;
