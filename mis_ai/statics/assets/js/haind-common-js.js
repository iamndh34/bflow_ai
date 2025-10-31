class AutoValidator {
    // field_list's format: [
    // {
    // key: <field's name>,
    // condition: <function>,
    // message: '...'
    // }
    // ]
    static CustomValidator(form_validator, field_list=[]) {
        let form_rules = {}
        for (let i = 0; i < field_list.length; i++) {
            if (field_list[i]?.['key']) {
                let key = field_list[i]['key']
                form_rules[key] = {}
                form_rules[key][key+'Validator'] = true
                $.validator.addMethod(
                    key+'Validator',
                    function (value, element) {
                        return field_list[i]['condition'] ? field_list[i]['condition'](value, element) : true;
                    },
                    $.fn.gettext(field_list[i]['message']) ? $.fn.gettext(field_list[i]['message']) : $.fn.gettext('This field is required')
                );
                $(`[name="${key}"]`).rules("add", {[key + 'Validator']: true});
            }
        }
    }
}
