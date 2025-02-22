function _typeof(obj) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (obj) { return typeof obj; } : function (obj) { return obj && "function" == typeof Symbol && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }, _typeof(obj); }
function _toConsumableArray(arr) { return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _unsupportedIterableToArray(arr) || _nonIterableSpread(); }
function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }
function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }
function _iterableToArray(iter) { if (typeof Symbol !== "undefined" && iter[Symbol.iterator] != null || iter["@@iterator"] != null) return Array.from(iter); }
function _arrayWithoutHoles(arr) { if (Array.isArray(arr)) return _arrayLikeToArray(arr); }
function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) arr2[i] = arr[i]; return arr2; }
import { parseLosslessNumber } from './numberParsers.js';
import { revive } from './revive.js';
/**
 * The LosslessJSON.parse() method parses a string as JSON, optionally transforming
 * the value produced by parsing.
 *
 * The parser is based on the parser of Tan Li Hou shared in
 * https://lihautan.com/json-parser-with-javascript/
 *
 * @param text
 * The string to parse as JSON. See the JSON object for a description of JSON syntax.
 *
 * @param [reviver]
 * If a function, prescribes how the value originally produced by parsing is
 * transformed, before being returned.
 *
 * @param [parseNumber=parseLosslessNumber]
 * Pass a custom number parser. Input is a string, and the output can be unknown
 * numeric value: number, bigint, LosslessNumber, or a custom BigNumber library.
 *
 * @returns Returns the Object corresponding to the given JSON text.
 *
 * @throws Throws a SyntaxError exception if the string to parse is not valid JSON.
 */
export function parse(text, reviver) {
  var parseNumber = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : parseLosslessNumber;
  var i = 0;
  var value = parseValue();
  expectValue(value);
  expectEndOfInput();
  return reviver ? revive(value, reviver) : value;
  function parseObject() {
    if (text.charCodeAt(i) === codeOpeningBrace) {
      i++;
      skipWhitespace();
      var object = {};
      var initial = true;
      while (i < text.length && text.charCodeAt(i) !== codeClosingBrace) {
        if (!initial) {
          eatComma();
          skipWhitespace();
        } else {
          initial = false;
        }
        var start = i;
        var key = parseString();
        if (key === undefined) {
          throwObjectKeyExpected();
        }
        skipWhitespace();
        eatColon();
        var _value = parseValue();
        if (_value === undefined) {
          throwObjectValueExpected();
        }

        // TODO: test deep equal instead of strict equal
        // if (Object.prototype.hasOwnProperty.call(object, key) && !isDeepEqual(value, object[key])) {
        //   // Note that we could also test `if(key in object) {...}`
        //   // or `if (object[key] !== 'undefined') {...}`, but that is slower.
        //   throwDuplicateKey(key, start + 1)
        // }

        object[key] = _value;
      }
      if (text.charCodeAt(i) !== codeClosingBrace) {
        throwObjectKeyOrEndExpected();
      }
      i++;
      return object;
    }
  }
  function parseArray() {
    if (text.charCodeAt(i) === codeOpeningBracket) {
      i++;
      skipWhitespace();
      var array = [];
      var initial = true;
      while (i < text.length && text.charCodeAt(i) !== codeClosingBracket) {
        if (!initial) {
          eatComma();
        } else {
          initial = false;
        }
        var _value2 = parseValue();
        expectArrayItem(_value2);
        array.push(_value2);
      }
      if (text.charCodeAt(i) !== codeClosingBracket) {
        throwArrayItemOrEndExpected();
      }
      i++;
      return array;
    }
  }
  function parseValue() {
    var _ref, _ref2, _ref3, _ref4, _ref5, _parseString;
    skipWhitespace();
    var value = (_ref = (_ref2 = (_ref3 = (_ref4 = (_ref5 = (_parseString = parseString()) !== null && _parseString !== void 0 ? _parseString : parseNumeric()) !== null && _ref5 !== void 0 ? _ref5 : parseObject()) !== null && _ref4 !== void 0 ? _ref4 : parseArray()) !== null && _ref3 !== void 0 ? _ref3 : parseKeyword('true', true)) !== null && _ref2 !== void 0 ? _ref2 : parseKeyword('false', false)) !== null && _ref !== void 0 ? _ref : parseKeyword('null', null);
    skipWhitespace();
    return value;
  }
  function parseKeyword(name, value) {
    if (text.slice(i, i + name.length) === name) {
      i += name.length;
      return value;
    }
  }
  function skipWhitespace() {
    while (isWhitespace(text.charCodeAt(i))) {
      i++;
    }
  }
  function parseString() {
    if (text.charCodeAt(i) === codeDoubleQuote) {
      i++;
      var result = '';
      while (i < text.length && text.charCodeAt(i) !== codeDoubleQuote) {
        if (text.charCodeAt(i) === codeBackslash) {
          var char = text[i + 1];
          var escapeChar = escapeCharacters[char];
          if (escapeChar !== undefined) {
            result += escapeChar;
            i++;
          } else if (char === 'u') {
            if (isHex(text.charCodeAt(i + 2)) && isHex(text.charCodeAt(i + 3)) && isHex(text.charCodeAt(i + 4)) && isHex(text.charCodeAt(i + 5))) {
              result += String.fromCharCode(parseInt(text.slice(i + 2, i + 6), 16));
              i += 5;
            } else {
              throwInvalidUnicodeCharacter(i);
            }
          } else {
            throwInvalidEscapeCharacter(i);
          }
        } else {
          if (isValidStringCharacter(text.charCodeAt(i))) {
            result += text[i];
          } else {
            throwInvalidCharacter(text[i]);
          }
        }
        i++;
      }
      expectEndOfString();
      i++;
      return result;
    }
  }
  function parseNumeric() {
    var start = i;
    if (text.charCodeAt(i) === codeMinus) {
      i++;
      expectDigit(start);
    }
    if (text.charCodeAt(i) === codeZero) {
      i++;
    } else if (isNonZeroDigit(text.charCodeAt(i))) {
      i++;
      while (isDigit(text.charCodeAt(i))) {
        i++;
      }
    }
    if (text.charCodeAt(i) === codeDot) {
      i++;
      expectDigit(start);
      while (isDigit(text.charCodeAt(i))) {
        i++;
      }
    }
    if (text.charCodeAt(i) === codeLowercaseE || text.charCodeAt(i) === codeUppercaseE) {
      i++;
      if (text.charCodeAt(i) === codeMinus || text.charCodeAt(i) === codePlus) {
        i++;
      }
      expectDigit(start);
      while (isDigit(text.charCodeAt(i))) {
        i++;
      }
    }
    if (i > start) {
      return parseNumber(text.slice(start, i));
    }
  }
  function eatComma() {
    if (text.charCodeAt(i) !== codeComma) {
      throw new SyntaxError("Comma ',' expected after value ".concat(gotAt()));
    }
    i++;
  }
  function eatColon() {
    if (text.charCodeAt(i) !== codeColon) {
      throw new SyntaxError("Colon ':' expected after property name ".concat(gotAt()));
    }
    i++;
  }
  function expectValue(value) {
    if (value === undefined) {
      throw new SyntaxError("JSON value expected ".concat(gotAt()));
    }
  }
  function expectArrayItem(value) {
    if (value === undefined) {
      throw new SyntaxError("Array item expected ".concat(gotAt()));
    }
  }
  function expectEndOfInput() {
    if (i < text.length) {
      throw new SyntaxError("Expected end of input ".concat(gotAt()));
    }
  }
  function expectDigit(start) {
    if (!isDigit(text.charCodeAt(i))) {
      var numSoFar = text.slice(start, i);
      throw new SyntaxError("Invalid number '".concat(numSoFar, "', expecting a digit ").concat(gotAt()));
    }
  }
  function expectEndOfString() {
    if (text.charCodeAt(i) !== codeDoubleQuote) {
      throw new SyntaxError("End of string '\"' expected ".concat(gotAt()));
    }
  }
  function throwObjectKeyExpected() {
    throw new SyntaxError("Quoted object key expected ".concat(gotAt()));
  }
  function throwDuplicateKey(key, pos) {
    throw new SyntaxError("Duplicate key '".concat(key, "' encountered at position ").concat(pos));
  }
  function throwObjectKeyOrEndExpected() {
    throw new SyntaxError("Quoted object key or end of object '}' expected ".concat(gotAt()));
  }
  function throwArrayItemOrEndExpected() {
    throw new SyntaxError("Array item or end of array ']' expected ".concat(gotAt()));
  }
  function throwInvalidCharacter(char) {
    throw new SyntaxError("Invalid character '".concat(char, "' ").concat(pos()));
  }
  function throwInvalidEscapeCharacter(start) {
    var chars = text.slice(start, start + 2);
    throw new SyntaxError("Invalid escape character '".concat(chars, "' ").concat(pos()));
  }
  function throwObjectValueExpected() {
    throw new SyntaxError("Object value expected after ':' ".concat(pos()));
  }
  function throwInvalidUnicodeCharacter(start) {
    var end = start + 2;
    while (/\w/.test(text[end])) {
      end++;
    }
    var chars = text.slice(start, end);
    throw new SyntaxError("Invalid unicode character '".concat(chars, "' ").concat(pos()));
  }

  // zero based character position
  function pos() {
    return "at position ".concat(i);
  }
  function got() {
    return i < text.length ? "but got '".concat(text[i], "'") : 'but reached end of input';
  }
  function gotAt() {
    return got() + ' ' + pos();
  }
}
function isWhitespace(code) {
  return code === codeSpace || code === codeNewline || code === codeTab || code === codeReturn;
}
function isHex(code) {
  return code >= codeZero && code <= codeNine || code >= codeUppercaseA && code <= codeUppercaseF || code >= codeLowercaseA && code <= codeLowercaseF;
}
function isDigit(code) {
  return code >= codeZero && code <= codeNine;
}
function isNonZeroDigit(code) {
  return code >= codeOne && code <= codeNine;
}
export function isValidStringCharacter(code) {
  return code >= 0x20 && code <= 0x10ffff;
}
export function isDeepEqual(a, b) {
  if (a === b) {
    return true;
  }
  if (Array.isArray(a) && Array.isArray(b)) {
    return a.length === b.length && a.every(function (item, index) {
      return isDeepEqual(item, b[index]);
    });
  }
  if (isObject(a) && isObject(b)) {
    var keys = _toConsumableArray(new Set([].concat(_toConsumableArray(Object.keys(a)), _toConsumableArray(Object.keys(b)))));
    return keys.every(function (key) {
      return isDeepEqual(a[key], b[key]);
    });
  }
  return false;
}
function isObject(value) {
  return _typeof(value) === 'object' && value !== null;
}

// map with all escape characters
var escapeCharacters = {
  '"': '"',
  '\\': '\\',
  '/': '/',
  b: '\b',
  f: '\f',
  n: '\n',
  r: '\r',
  t: '\t'
  // note that \u is handled separately in parseString()
};

var codeBackslash = 0x5c; // "\"
var codeOpeningBrace = 0x7b; // "{"
var codeClosingBrace = 0x7d; // "}"
var codeOpeningBracket = 0x5b; // "["
var codeClosingBracket = 0x5d; // "]"
var codeSpace = 0x20; // " "
var codeNewline = 0xa; // "\n"
var codeTab = 0x9; // "\t"
var codeReturn = 0xd; // "\r"
var codeDoubleQuote = 0x0022; // "
var codePlus = 0x2b; // "+"
var codeMinus = 0x2d; // "-"
var codeZero = 0x30;
var codeOne = 0x31;
var codeNine = 0x39;
var codeComma = 0x2c; // ","
var codeDot = 0x2e; // "." (dot, period)
var codeColon = 0x3a; // ":"
export var codeUppercaseA = 0x41; // "A"
export var codeLowercaseA = 0x61; // "a"
export var codeUppercaseE = 0x45; // "E"
export var codeLowercaseE = 0x65; // "e"
export var codeUppercaseF = 0x46; // "F"
export var codeLowercaseF = 0x66; // "f"
//# sourceMappingURL=parse.js.map