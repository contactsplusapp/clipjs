import _ from 'lodash';
import moment from 'moment';
import XPathSelector from './xpath';

export default class Clipper {
    constructor(config, debug = false) {
        this.config = config;
        this.debug = debug;
    }

    withFieldDefinition(name, fn = _.noop) {
        const def = _.get(this.config, `fields.${name}`);
        return fn(def);
    }

    clipField(conf) {
        //not configured
        if(!conf) {
            return;
        }

        let elements;

        if(conf.selector) {
            elements = document.querySelectorAll(conf.selector);
        } else if(conf.xpath) {
            elements = XPathSelector.select(conf.xpath);
        }

        const values = _.map(
            elements,
            it => {
                let v;

                if(_.isString(it)) {
                    v = it;
                } else {
                    v = conf.attribute ? _.get(it, conf.attribute) : _.trim(it.textContent);
                }

                if(conf.regex) {
                    const exp = new RegExp(conf.regex, conf.regexFlags);
                    const matches = v.match(exp);
                    v = _.isArray(matches) ? _.last(matches) : matches;
                }

                return v;
            }
        );

        return conf.blacklist ? _.filter(values, it => conf.blacklist.indexOf(it) == -1) : values;
    }

    getValues(field) {
        return this.clipField(field && field.value);
    }

    getLabels(field) {
        return this.clipField(field && field.label);
    }

    getSingleValue(name) {
        return this.withFieldDefinition(
            name,
            field => {
                const values = this.getValues(field);
                return _.get(values, '0');
            }
        );
    }

    getPairs(name, defaultLabel) {
        return this.withFieldDefinition(
            name,
            field => {
                const values = this.getValues(field);
                const labels = this.getLabels(field) || [];
                return _.map(
                    values,
                    (it, i) => {
                        return {
                            type: labels[i] || defaultLabel,
                            value: it
                        };
                    }
                );
            }
        );
    }

    getName() {
        return this.getSingleValue('name');
    }

    getPhoto() {
        return this.getSingleValue('photo');
    }

    getEmails() {
        return this.getPairs('emails', 'Email');
    }

    getPhones() {
        return this.getPairs('phones', 'Phone');
    }

    getTitle() {
        return this.getSingleValue('title');
    }

    getCompany() {
        return this.getSingleValue('company');
    }

    getGeneralLocation() {
        return this.getSingleValue('generalLocation');
    }

    getGender() {
        return this.getSingleValue('gender');
    }

    getBirthday() {
        return this.withFieldDefinition(
            'birthday',
            field => {
                if(!field) {
                    return;
                }

                const values = this.getValues(field);
                const value = _.get(values, '0', '');
                if(value) {
                    const hasYear = value.indexOf(',') > -1 || value.replace(/\D/, '').length > 4;
                    const format = (field && field.dateFormat) || (hasYear ? 'MMMM DD, YYYY' : 'MMMM DD');

                    const d = moment(value, format);
                    return d.isValid() ? {
                        ts: d.toDate().getTime(),
                        hasYear
                    } : null;
                }
            }
        );
    }

    getWebsite() {
        return this.getSingleValue('website');
    }

    getAdditionalSites() {
        const key = 'additionalSites';
        return this.withFieldDefinition(
            key,
            field => {
                const values = this.getPairs(key);
                const searchParam = field && field.value && field.value.searchParam;

                if(searchParam) {
                    _.each(
                        values,
                        it => {
                            try {
                                it.value = new URL(it.value).searchParams.get(searchParam);
                            } catch(e) {
                                console.warn('Failed to parse url');
                            }
                        }
                    )
                }

                return values;
            }
        );
    }

    getIMs() {
        return this.getPairs('ims');
    }

    handles(host) {
        return this.config.handles.indexOf(host) > -1;
    }

    isValidContact() {
        return !!this.getName();
    }

    getSocialType() {
        return _.toLower(this.config.name);
    }

    getSocialUrl() {
        const socialUrlConfig = this.config.socialUrl;
        let url = window.location.href;

        if(socialUrlConfig) {
            const selector = socialUrlConfig.selector;
            const attr = socialUrlConfig.attrtribute || 'textContent';
            const regex = socialUrlConfig.regex;
            const regexFlags = socialUrlConfig.regexFlags;

            if(selector) {
                const element = document.querySelector(element);
                if(element) {
                    url = _.get(element, attr);
                }
            } else if(regex) {
                const exp = new RegExp(regex, regexFlags);
                const matches = url.match(exp);
                console.log(regex, matches);
                url = _.isArray(matches) ? _.last(matches) : matches;
            }
        }

        return url;
    }

    getSocialUsername() {
        const socialUsernameConfig = this.config.socialUsername;
        const url = new URL(window.location.href);
        let username;

        if(socialUsernameConfig) {
            const selector = socialUsernameConfig.selector;
            const attr = socialUsernameConfig.attribute || 'textContent';

            if(selector) {
                const element = document.querySelector(element);
                username = _.get(element, attr);
            } else if(socialUsernameConfig.regex) {
                const exp = new RegExp(socialUsernameConfig.regex, socialUsernameConfig.regexFlags);
                username = window.location.pathname.match(exp);
            } else if(socialUsernameConfig.searchParam) {
                username = _.get(url.searchParams, socialUsernameConfig.searchParam);
            } else if(socialUsernameConfig.pathIndex != undefined) {
                const paths = url.pathname.split('/');
                username = paths[socialUsernameConfig.pathIndex];
            }
        }

        if(username && _.isArray(socialUsernameConfig.blacklist)) {
            username = socialUsernameConfig.blacklist.indexOf(username) == -1 ? username : undefined;
        }

        return username;
    }

    waitForElement(selector, done, maxSeconds = 60) {
        const start = Date.now();
        const i = setInterval(
            () => {
                if(document.querySelector(selector)) {
                    clearInterval(i);
                    done();
                } else if((Date.now() - start) > maxSeconds*1000) {
                    done();
                }
            },
            1000
        );
    }

    prep() {
        return new Promise(resolve => {
            const prepConfig = this.config.prep;

            if(!prepConfig) {
                return resolve();
            }

            if(prepConfig.click) {
                const waitForSelector = prepConfig.click.waitForSelector;
                const elementSelector = prepConfig.click.elementSelector;

                //Wait for element is already present
                if(document.querySelector(waitForSelector)) {
                    return resolve();
                }

                const element = document.querySelector(elementSelector);

                if(!element) {
                    console.warn('Could not find prep element.');
                    return resolve();
                }

                element.click();
                this.waitForElement(waitForSelector, resolve);

            } else if(prepConfig.scroll) {
                document.scrollingElement.scrollTop = prepConfig.scroll.to;
                if(prepConfig.scroll.waitForSelector) {
                    this.waitForElement(prepConfig.scroll.waitForSelector, resolve);
                } else {
                    setTimeout(() => resolve(), prepConfig.scroll.wait || 1000);
                }
            } else {
                console.warn('Unknown prep config.');
                resolve();
            }
        })

    }

    fullClip() {
        return this.prep().then(() => this.clip());
    }

    quickClip() {
        return this.clip();
    }

    clip() {
        const name = this.getName();
        const result = {
            name,
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
}