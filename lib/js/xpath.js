"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var XPathSelector = function () {
    function XPathSelector() {
        _classCallCheck(this, XPathSelector);
    }

    _createClass(XPathSelector, null, [{
        key: "select",
        value: function select(xpath) {
            var element = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : document;

            var res = document.evaluate(xpath, element);
            var results = [];
            var result = res.iterateNext();
            while (result) {
                results.push(result);
                result = res.iterateNext();
            }

            return results.length ? results : null;
        }
    }]);

    return XPathSelector;
}();

exports.default = XPathSelector;
module.exports = exports["default"];