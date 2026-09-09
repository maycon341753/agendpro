'use strict';
var fillRange = require('fill-range');
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
braces.expand = braces; braces.compile = function (i) { return typeof i === 'string' ? i : ''; };
module.exports = braces;
