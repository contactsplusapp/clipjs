'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var _moment = require('moment');

var _moment2 = _interopRequireDefault(_moment);

var _xpath = require('./xpath');

var _xpath2 = _interopRequireDefault(_xpath);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Clip = function () {
    function Clip(config) {
        var debug = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;

        _classCallCheck(this, Clip);

        this.config = config;
        this.debug = debug;
    }

    _createClass(Clip, [{
        key: 'withFieldDefinition',
        value: function withFieldDefinition(name) {
            var fn = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : _lodash2.default.noop;

            var def = _lodash2.default.get(this.config, 'fields.' + name);
            return fn(def);
        }
    }, {
        key: 'clipField',
        value: function clipField(conf) {
            //not configured
            if (!conf) {
                return;
            }

            var elements = void 0;

            if (conf.selector) {
                elements = document.querySelectorAll(conf.selector);
            } else if (conf.xpath) {
                elements = _xpath2.default.select(conf.xpath);
            }

            var values = _lodash2.default.map(elements, function (it) {
                var v = void 0;

                if (_lodash2.default.isString(it)) {
                    v = it;
                } else {
                    v = conf.attribute ? _lodash2.default.get(it, conf.attribute) : _lodash2.default.trim(it.textContent);
                }

                if (conf.regex) {
                    var exp = new RegExp(conf.regex, conf.regexFlags);
                    var matches = v.match(exp);
                    v = _lodash2.default.isArray(matches) ? _lodash2.default.last(matches) : matches;
                }

                return v;
            });

            return conf.blacklist ? _lodash2.default.filter(values, function (it) {
                return conf.blacklist.indexOf(it) == -1;
            }) : values;
        }
    }, {
        key: 'getValues',
        value: function getValues(field) {
            return this.clipField(field && field.value);
        }
    }, {
        key: 'getLabels',
        value: function getLabels(field) {
            return this.clipField(field && field.label);
        }
    }, {
        key: 'getSingleValue',
        value: function getSingleValue(name) {
            var _this = this;

            return this.withFieldDefinition(name, function (field) {
                var values = _this.getValues(field);
                return _lodash2.default.get(values, '0');
            });
        }
    }, {
        key: 'getPairs',
        value: function getPairs(name, defaultLabel) {
            var _this2 = this;

            return this.withFieldDefinition(name, function (field) {
                var values = _this2.getValues(field);
                var labels = _this2.getLabels(field) || [];
                return _lodash2.default.map(values, function (it, i) {
                    return {
                        type: labels[i] || defaultLabel,
                        value: it
                    };
                });
            });
        }
    }, {
        key: 'getName',
        value: function getName() {
            return this.getSingleValue('name');
        }
    }, {
        key: 'getPhoto',
        value: function getPhoto() {
            return this.getSingleValue('photo');
        }
    }, {
        key: 'getEmails',
        value: function getEmails() {
            return this.getPairs('emails', 'Email');
        }
    }, {
        key: 'getPhones',
        value: function getPhones() {
            return this.getPairs('phones', 'Phone');
        }
    }, {
        key: 'getTitle',
        value: function getTitle() {
            return this.getSingleValue('title');
        }
    }, {
        key: 'getCompany',
        value: function getCompany() {
            return this.getSingleValue('company');
        }
    }, {
        key: 'getGeneralLocation',
        value: function getGeneralLocation() {
            return this.getSingleValue('generalLocation');
        }
    }, {
        key: 'getGender',
        value: function getGender() {
            return this.getSingleValue('gender');
        }
    }, {
        key: 'getBirthday',
        value: function getBirthday() {
            var _this3 = this;

            return this.withFieldDefinition('birthday', function (field) {
                if (!field) {
                    return;
                }

                var values = _this3.getValues(field);
                var value = _lodash2.default.get(values, '0', '');
                if (value) {
                    var hasYear = value.indexOf(',') > -1 || value.replace(/\D/, '').length > 4;
                    var format = field && field.dateFormat || (hasYear ? 'MMMM DD, YYYY' : 'MMMM DD');

                    var d = (0, _moment2.default)(value, format);
                    return d.isValid() ? {
                        ts: d.toDate().getTime(),
                        hasYear: hasYear
                    } : null;
                }
            });
        }
    }, {
        key: 'getWebsite',
        value: function getWebsite() {
            return this.getSingleValue('website');
        }
    }, {
        key: 'getAdditionalSites',
        value: function getAdditionalSites() {
            var _this4 = this;

            var key = 'additionalSites';
            return this.withFieldDefinition(key, function (field) {
                var values = _this4.getPairs(key);
                var searchParam = field && field.value && field.value.searchParam;

                if (searchParam) {
                    _lodash2.default.each(values, function (it) {
                        try {
                            it.value = new URL(it.value).searchParams.get(searchParam);
                        } catch (e) {
                            console.warn('Failed to parse url');
                        }
                    });
                }

                return values;
            });
        }
    }, {
        key: 'getIMs',
        value: function getIMs() {
            return this.getPairs('ims');
        }
    }, {
        key: 'handles',
        value: function handles(host) {
            return this.config.handles.indexOf(host) > -1;
        }
    }, {
        key: 'isValidContact',
        value: function isValidContact() {
            return !!this.getName();
        }
    }, {
        key: 'getSocialType',
        value: function getSocialType() {
            return _lodash2.default.toLower(this.config.name);
        }
    }, {
        key: 'getSocialUrl',
        value: function getSocialUrl() {
            var socialUrlConfig = this.config.socialUrl;
            var url = window.location.href;

            if (socialUrlConfig) {
                var selector = socialUrlConfig.selector;
                var attr = socialUrlConfig.attrtribute || 'textContent';
                var regex = socialUrlConfig.regex;
                var regexFlags = socialUrlConfig.regexFlags;

                if (selector) {
                    var element = document.querySelector(element);
                    if (element) {
                        url = _lodash2.default.get(element, attr);
                    }
                } else if (regex) {
                    var exp = new RegExp(regex, regexFlags);
                    var matches = url.match(exp);
                    console.log(regex, matches);
                    url = _lodash2.default.isArray(matches) ? _lodash2.default.last(matches) : matches;
                }
            }

            return url;
        }
    }, {
        key: 'getSocialUsername',
        value: function getSocialUsername() {
            var socialUsernameConfig = this.config.socialUsername;
            var url = new URL(window.location.href);
            var username = void 0;

            if (socialUsernameConfig) {
                var selector = socialUsernameConfig.selector;
                var attr = socialUsernameConfig.attribute || 'textContent';

                if (selector) {
                    var element = document.querySelector(element);
                    username = _lodash2.default.get(element, attr);
                } else if (socialUsernameConfig.regex) {
                    var exp = new RegExp(socialUsernameConfig.regex, socialUsernameConfig.regexFlags);
                    username = window.location.pathname.match(exp);
                } else if (socialUsernameConfig.searchParam) {
                    username = _lodash2.default.get(url.searchParams, socialUsernameConfig.searchParam);
                } else if (socialUsernameConfig.pathIndex != undefined) {
                    var paths = url.pathname.split('/');
                    username = paths[socialUsernameConfig.pathIndex];
                }
            }

            if (username && _lodash2.default.isArray(socialUsernameConfig.blacklist)) {
                username = socialUsernameConfig.blacklist.indexOf(username) == -1 ? username : undefined;
            }

            return username;
        }
    }, {
        key: 'waitForElement',
        value: function waitForElement(selector, done) {
            var maxSeconds = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 60;

            var start = Date.now();
            var i = setInterval(function () {
                if (document.querySelector(selector)) {
                    clearInterval(i);
                    done();
                } else if (Date.now() - start > maxSeconds * 1000) {
                    done();
                }
            }, 1000);
        }
    }, {
        key: 'prep',
        value: function prep() {
            var _this5 = this;

            return new Promise(function (resolve) {
                var prepConfig = _this5.config.prep;

                if (!prepConfig) {
                    return resolve();
                }

                if (prepConfig.click) {
                    var waitForSelector = prepConfig.click.waitForSelector;
                    var elementSelector = prepConfig.click.elementSelector;

                    //Wait for element is already present
                    if (document.querySelector(waitForSelector)) {
                        return resolve();
                    }

                    var element = document.querySelector(elementSelector);

                    if (!element) {
                        console.warn('Could not find prep element.');
                        return resolve();
                    }

                    element.click();
                    _this5.waitForElement(waitForSelector, resolve);
                } else if (prepConfig.scroll) {
                    document.scrollingElement.scrollTop = prepConfig.scroll.to;
                    if (prepConfig.scroll.waitForSelector) {
                        _this5.waitForElement(prepConfig.scroll.waitForSelector, resolve);
                    } else {
                        setTimeout(function () {
                            return resolve();
                        }, prepConfig.scroll.wait || 1000);
                    }
                } else {
                    console.warn('Unknown prep config.');
                    resolve();
                }
            });
        }
    }, {
        key: 'fullClip',
        value: function fullClip() {
            var _this6 = this;

            return this.prep().then(function () {
                return _this6.clip();
            });
        }
    }, {
        key: 'quickClip',
        value: function quickClip() {
            return this.clip();
        }
    }, {
        key: 'clip',
        value: function clip() {
            var name = this.getName();
            var result = {
                name: name,
                title: this.getTitle(),
                company: this.getCompany(),
                photo: this.getPhoto(),
                emails: this.getEmails(),
                phones: this.getPhones(),
                socialUrl: this.getSocialUrl(),
                socialUsername: this.getSocialUsername(),
                socialType: this.getSocialType(),
                generalLocation: this.getGeneralLocation(),
                birthday: this.getBirthday(),
                website: this.getWebsite(),
                additionalSites: this.getAdditionalSites(),
                ims: this.getIMs(),
                gender: this.getGender()
            };

            return this.debug || name ? result : null;
        }
    }]);

    return Clip;
}();

exports.default = Clip;
module.exports = exports['default'];