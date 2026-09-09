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

picomatch.parse = function (pattern, options) {
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
picomatch.scan = function (input, options) {
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

picomatch.default = picomatch;

module.exports = picomatch;
module.exports.default = picomatch;
