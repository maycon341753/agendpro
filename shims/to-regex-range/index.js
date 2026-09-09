'use strict';
var isNumber = require('is-number');
module.exports = function toRegexRange(min, max, options) {
  options = options || {};
  if (min === void 0 || max === void 0) return '';
  if (isNumber(min) && isNumber(max)) return '(' + min + '|' + max + ')';
  if (typeof min === 'string' && typeof max === 'string') return '(' + min + '|' + max + ')';
  return '';
};
