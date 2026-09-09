'use strict';
var toRegexRange = require('to-regex-range');
module.exports = function fillRange(min, max, step, options) {
  if (arguments.length <= 1) return [];
  if (typeof step === 'object') { options = step; step = void 0; }
  if (step === void 0) step = 1;
  options = options || {};
  if (typeof min === 'number' && typeof max === 'number') {
    if (options.toRegex) return toRegexRange(min, max, options);
    var arr = [];
    if (min > max) { for (var i = min; i >= max; i -= step) arr.push(i); }
    else { for (var j = min; j <= max; j += step) arr.push(j); }
    return arr;
  }
  if (typeof min === 'string' && typeof max === 'string') {
    if (options.toRegex) return toRegexRange(min, max, options);
    var s = min.charCodeAt(0), e = max.charCodeAt(0), sArr = [];
    if (s > e) { for (var a = s; a >= e; a -= step) sArr.push(String.fromCharCode(a)); }
    else { for (var b = s; b <= e; b += step) sArr.push(String.fromCharCode(b)); }
    return sArr;
  }
  return [];
};
