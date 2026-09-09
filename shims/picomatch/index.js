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
picomatch.test = function (input, glob, options) { try { return picomatch(glob, options)(input); } catch (e) { return true; } };
picomatch.matchBase = function (b, g, o) { try { return picomatch(g, o)(b); } catch (e) { return true; } };
picomatch.isMatch = picomatch.test;
picomatch.parse = function () { return {}; };
picomatch.scan = function () { return {}; };
module.exports = picomatch;
