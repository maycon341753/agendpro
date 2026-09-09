'use strict';
function picomatch(glob, options) {
  function match(str) {
    if (typeof str !== 'string') return false;
    if (glob === '*' || glob === '**') return true;
    try {
      if (typeof glob === 'string') {
        var esc = glob.replace(/[.+^${}()|[\]\\]/g, '\\$&').replace(/\*/g, '.*').replace(/\?/g, '.');
        return new RegExp('^' + esc + '$').test(str);
      }
    } catch (e) {}
    return true;
  }
  match.test = match;
  return match;
}

picomatch.matcher = picomatch;

picomatch.test = function (input, glob, options) { try { return picomatch(glob, options)(input); } catch (e) { return true; } };

picomatch.matchBase = function (basename, glob, options) { try { return picomatch(glob, options)(basename); } catch (e) { return true; } };
picomatch.isMatch = picomatch.test;

picomatch.makeRe = function makeRe(pattern, options) {
  try {
    if (typeof pattern === 'string') {
      var esc = pattern.replace(/[.+^${}()|[\]\\]/g, '\\$&').replace(/\*/g, '.*').replace(/\?/g, '.');
      return new RegExp('^' + esc + '$');
    }
  } catch (e) {}
  return /^.*$/;
};

picomatch.toRegex = picomatch.makeRe;

picomatch.parse = function () { return {}; };
picomatch.scan = function () { return {}; };

picomatch.default = picomatch;

module.exports = picomatch;
module.exports.default = picomatch;
