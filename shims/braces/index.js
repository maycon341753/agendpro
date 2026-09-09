'use strict';
var fillRange;
try { fillRange = require('fill-range'); } catch (e) {
  fillRange = function fillRange(min, max, step, options) {
    if (arguments.length <= 1) return [];
    if (typeof step === 'object') { options = step; step = void 0; }
    if (step === void 0) step = 1;
    options = options || {};
    if (typeof min === 'number' && typeof max === 'number') {
      if (options.toRegex) return '(' + min + '|' + max + ')';
      var arr = [];
      if (min > max) { for (var i = min; i >= max; i -= step) arr.push(i); }
      else { for (var j = min; j <= max; j += step) arr.push(j); }
      return arr;
    }
    if (typeof min === 'string' && typeof max === 'string') {
      if (options.toRegex) return '(' + min + '|' + max + ')';
      var s = min.charCodeAt(0), e = max.charCodeAt(0), sArr = [];
      if (s > e) { for (var a = s; a >= e; a -= step) sArr.push(String.fromCharCode(a)); }
      else { for (var b = s; b <= e; b += step) sArr.push(String.fromCharCode(b)); }
      return sArr;
    }
    return [];
  };
}
function braces(input, options) {
  options = options || {};
  if (typeof input !== 'string') return [];
  if (/\.\./.test(input)) {
    var parts = input.split('..');
    if (parts.length >= 2) { try { return fillRange(parts[0], parts[1].split(/[{}]/)[0]); } catch (e) { return [input]; } }
  }
  try {
    var matches = input.match(/\{([^{}]+)\}/);
    if (matches) return matches[1].split(',').map(function (it) { return input.replace(matches[0], it); });
  } catch (e) {}
  return [input];
}
braces.expand = braces;
braces.compile = function (input) { return typeof input === 'string' ? input : ''; };
braces.makeRe = function makeRe(input) {
  try {
    var expanded = braces.expand(input, { expand: false });
    if (Array.isArray(expanded) && expanded.length > 0) {
      var joined = expanded.map(function (x) { return (x || '').replace(/[.+^${}()|[\]\\]/g, '\\$&').replace(/\*/g, '.*').replace(/\?/g, '.'); }).join('|');
      return new RegExp('^(' + joined + ')$');
    }
  } catch (e) {}
  return /^.*$/;
};
braces.list = function list(input, options) { try { return braces.expand(input, options); } catch (e) { return [input]; } };
braces.snapdragon = function snapdragon() { return {}; };
braces.braces = braces;
braces.default = braces;

module.exports = braces;
module.exports.default = braces;
