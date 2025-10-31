(function (factory) {
    if (typeof define === "function" && define.amd) {
        define(["jquery", "./jquery.validate"], factory);
    } else if (typeof module === "object" && module.exports) {
        module.exports = factory(require("jquery"));
    } else {
        factory(jQuery);
    }
}(function ($) {
    // call check another rule prefix data-valid-* when valid was called
    $.validator.unpretentious = function (frm$) {
        let validator = $(frm$).validate();

        $(frm$).find('input').each(function () {
            let ruleKey = [];
            let attributes = $(this)[0].attributes;
            let name = $(this).attr('name');
            Object.keys(attributes).map(key => {
                let data = attributes[key];
                if (data.name.startsWith('data-valid-')) {
                    let ruleKey = data.name.replace('data-valid-', '');
                    ruleKey = ruleKey.toLowerCase().replaceAll('-', '_').trim();
                    if ($.validator.methods.hasOwnProperty(ruleKey)) {
                        if (!validator.settings.rules.hasOwnProperty(name)) {
                            validator.settings.rules[name] = {}
                        }
                        if (!validator.settings.rules[name].hasOwnProperty(ruleKey)) {
                            validator.settings.rules[name] = {};
                            validator.settings.rules[name][ruleKey] = data.value;
                        }
                    }
                }
                ruleKey.push(attributes[key])
            })

            if (ruleKey.length > 0) {

            }
        })
    }

    function checkBase(value, element, callback) {
        // get rules field
        let rules = this.settings.rules?.[$(element).attr('name')] || null;
        if (!value) {
            // allow empty
            if (!$(element).attr('required')) return true;
            // check rule
            if (typeof rules === 'object' && rules.hasOwnProperty('required')) {
                if (rules['required'] !== true) return true;
            }
        }
        if (callback instanceof Function) {
            return callback.bind(this)(rules);
        }
        return true;
    }

    $.validator.addMethod("phone_vn", function (value, element) {
        return checkBase.bind(this)(value, element, function (rules) {
            if (rules.hasOwnProperty('phone_vn')) {
                let valueMethod = rules['phone_vn'];
                let regexStr = valueMethod && valueMethod !== 'true' ? valueMethod : /^((\+84)|0)([35789]|1[2389])([0-9]{8})$/gm;
                let regex = new RegExp(regexStr);
                return regex.test(value);
            }
            return true;
        });
    }, $.validator.messages?.["phone_vn"] || "Please enter a valid phone number.");

    $.validator.addMethod("date", function (value, element) {
        return checkBase.bind(this)(value, element, function (rules) {
            if (rules.hasOwnProperty('date')) {
                // let regexStr = valueMethod && valueMethod !== 'true' ? valueMethod : /^(?:(?:31(\/|-|\.)(?:0?[13578]|1[02]))\1|(?:(?:29|30)(\/|-|\.)(?:0?[13-9]|1[0-2])\2))(?:(?:1[6-9]|[2-9]\d)?\d{2})$|^(?:29(\/|-|\.)0?2\3(?:(?:(?:1[6-9]|[2-9]\d)?(?:0[48]|[2468][048]|[13579][26])|(?:(?:16|[2468][048]|[3579][26])00))))$|^(?:0?[1-9]|1\d|2[0-8])(\/|-|\.)(?:(?:0?[1-9])|(?:1[0-2]))\4(?:(?:1[6-9]|[2-9]\d)?\d{2})$/gm;
                let valueMethod = rules['date'];
                let regexDefault = /^(0?[1-9]|[12][0-9]|3[01])[\-](0?[1-9]|1[012])[\-]\d{4}$/gm; // format DD-MM-YYYY
                let format = $(element).data('date-format');
                if (format){
                    format = '^' + format
                        .replaceAll('-', '[\\-]')
                        .replaceAll('/', '[\\/]')
                        .replaceAll('YYYY', '\\d{4}')
                        .replaceAll('MM', '(0?[1-9]|1[012])')
                        .replaceAll('DD', '(0?[1-9]|[12][0-9]|3[01])') + '$';
                    regexDefault = format;
                }
                let regexStr = valueMethod && valueMethod !== 'true' ? valueMethod : regexDefault; // format DD-MM-YYYY
                let regex = new RegExp(regexStr);
                return regex.test(value);
            }
            return true;
        });
    }, $.validator.messages?.["date"] || "Please enter a valid date.");

    $.validator.addMethod("datetime", function (value, element) {
        return checkBase.bind(this)(value, element, function (rules) {
            if (rules.hasOwnProperty('datetime')) {
                let regexDefault = /^(0?[1-9]|[12][0-9]|3[01])[\-](0?[1-9]|1[012])[\-]\d{4}\s(0?[0-9]|1[0-9]|2[0-3]):([0-5][0-9]):([0-5][0-9])$/gm; // format DD-MM-YYYY HH:mm:ss
                let format = $(element).data('date-format');
                if (format){
                    format = '^' + format
                        .replaceAll('-', '[\\-]')
                        .replaceAll('/', '[\\/]')
                        .replaceAll('YYYY', '\\d{4}')
                        .replaceAll('MM', '(0?[1-9]|1[012])')
                        .replaceAll('DD', '(0?[1-9]|[12][0-9]|3[01])')
                        .replaceAll('HH', '(0?[0-9]|1[0-9]|2[0-3])')
                        .replaceAll('mm', '([0-5][0-9])')
                        .replaceAll('ss', '([0-5][0-9])')
                        + '$';
                    regexDefault = format;
                }
                let valueMethod = rules['datetime'];
                let regexStr = valueMethod && valueMethod !== 'true' ? valueMethod : regexDefault;
                let regex = new RegExp(regexStr);
                return regex.test(value);
            }
            return true;
        });
    }, $.validator.messages?.["datetime"] || "Please enter a valid date time.");

    $.validator.addMethod("json", function (value, element) {
        return checkBase.bind(this)(value, element, function (rules) {
            if (rules.hasOwnProperty('json')) {
                try {
                    JSON.parse(value);
                    return true;
                } catch (err) {
                    return false;
                }
            }
            return true;
        });
    }, $.validator.messages?.["json"] || "Please enter a valid JSON.");

    $.validator.addMethod("lessThanEqual", function (value, element, param) {
        return checkBase.bind(this)(value, element, function (rules) {
            let target = $(param);
            return parseInt(value) <= parseInt(target.val());
        });
    }, $.validator.messages?.["lessThanEqual"] || $.validator.format("Please enter a lesser or equal value."));

    $.validator.addMethod("greaterThanEqual", function (value, element, param) {
        return checkBase.bind(this)(value, element, function (rules) {
            let target = $(param);
            return parseInt(value) >= parseInt(target.val());
        });
    }, $.validator.messages?.["greaterThanEqual"] || $.validator.format("Please enter a greater or equal value."));

    $.validator.addMethod("counterWordsMax", function (value, element) {
        return checkBase.bind(this)(value, element, function (rules) {
            let inpValue = $(element).val();
            let wordCount = inpValue ? inpValue.split(" ").length : 0;
            return value ? parseInt(value) >= parseInt(wordCount) : true;
        });
    }, $.validator.messages?.["counterWordsMax"] || $.validator.format("The field has exceeded the word count."));

    $.validator.addMethod("counterWordsMin", function (value, element) {
         return checkBase.bind(this)(value, element, function (rules) {
            let inpValue = $(element).val();
            let wordCount = inpValue ? inpValue.split(" ").length : 0;
            return value ? parseInt(value) <= parseInt(wordCount) : true;
        });
    }, $.validator.messages?.["counterWordsMin"] || $.validator.format("The field has exceeded the word count."));

}));