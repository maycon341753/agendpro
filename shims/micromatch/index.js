'use strict';
var picomatch = require('picomatch');
var braces = require('braces');
function micromatch(list, patterns, options) {
  if (!Array.isArray(list)) list = [list];
  if (!Array.isArray(patterns)) patterns = [patterns];
  try {
    return list.filter(function (item) {
      return patterns.some(function (p) { try { return picomatch(p, options)(item); } catch (e) { return true; } });
    });
  } catch (e) { return list; }
}
micromatch.isMatch = function (str, pattern, options) { try { return picomatch(pattern, options)(str); } catch (e) { return true; } };
micromatch.not = function (list, patterns, options) {
  if (!Array.isArray(list)) list = [list]; if (!Array.isArray(patterns)) patterns = [patterns];
  try {
    return list.filter(function (item) {
      return !patterns.some(function (p) { try { return picomatch(p, options)(item); } catch (e) { return false; } });
    });
  } catch (e) { return list; }
};
micromatch.contains = micromatch.isMatch;
micromatch.match = micromatch;
micromatch.scan = function () { return {}; };
micromatch.braces = braces;
micromatch.picomatch = picomatch;
module.exports = micromatch;
