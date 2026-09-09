'use strict';
var path;
try { path = require('path'); } catch (e) {}

function globParent(pattern, options) {
  if (typeof pattern !== 'string') return '';
  options = options || {};
  var cleaned = pattern;
  if (options.flipBackslashes !== false) cleaned = cleaned.replace(/\\/g, '/');
  var idx = -1;
  var globChars = ['*', '?', '{', '[', '('];
  for (var i = 0; i < cleaned.length; i++) {
    if (globChars.indexOf(cleaned[i]) !== -1) { idx = i; break; }
  }
  var base = (idx === -1) ? cleaned : cleaned.slice(0, idx);
  var lastSlash = -1;
  for (var j = base.length - 1; j >= 0; j--) {
    if (base[j] === '/' || base[j] === '\\') { lastSlash = j; break; }
  }
  var result;
  if (lastSlash === -1) result = '';
  else result = base.slice(0, lastSlash);
  if (result === '' && (pattern[0] === '/' || pattern[0] === '\\')) result = '/';
  return result;
}

globParent.default = globParent;
globParent.isGlob = function (pattern) {
  if (typeof pattern !== 'string') return false;
  return /[*?{[\]()]/.test(pattern);
};
globParent.globParent = globParent;

module.exports = globParent;
module.exports.default = globParent;
