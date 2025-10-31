const $formset_cond = $('#formset-condition')

class Conditions {
    constructor() {
    }
    propertyList = [];
    set setPropertyList(data){
        this.propertyList = data
    }
    get getPropertyList(){
        return this.propertyList
    }
    static $url = $('#app-url-factory');
    static appMapUrl = {
        'saledata.account': {
            'url': Conditions.$url.attr('data-md-account'),
            'keyResp': 'account_sale_list',
            'keyText': 'name',
        },
        'saledata.industry': {
            'url': Conditions.$url.attr('data-md-industry'),
            'keyResp': 'industry_list',
        },
        'hr.employee': {
            'url': Conditions.$url.attr('data-md-employee'),
            'keyResp': 'employee_list',
            'keyText': 'full_name',
        },
        'saledata.product': {
            'url': Conditions.$url.attr('data-md-product'),
            'keyResp': 'product_sale_list',
        },
        'saledata.producttype': {
            'url': Conditions.$url.attr('data-md-product-type'),
            'keyResp': 'product_type_list',
        },
        'saledata.productcategory': {
            'url': Conditions.$url.attr('data-md-product-category'),
            'keyResp': 'product_category_list',
        },
        'saledata.expense': {
            'url': Conditions.$url.attr('data-md-expense'),
            'keyResp': 'expense_list',
        },
        'saledata.expenseitem': {
            'url': Conditions.$url.attr('data-md-expense-item'),
            'keyResp': 'expense_item_list',
        },
    }

    /***
     * handle action click button submit of formset modal
     * @param elm_target element of action on click
     * @param elm_focus element store data serializer, if null function return array instead
     * @param element_formset element of formset. for loop get data purpose
     * @param {dropdown_list:string, application_property_list:string} data
     * @constructor
     */
    ElementAction(elm_target = null, elm_focus = null, element_formset = null) {
        if (elm_target && element_formset) elm_target.on('click', function (e) {
            e.preventDefault();
            let result = []
            element_formset.find('[data-formset-body] [data-formset-form]').each(function (idx, item) {
                /*** for loop in formset get list of condition ***/

                if (!$(item).attr('data-formset-form-deleted')) {
                    let formset_logic_temp = $(this).find('.formset-logic').val();
                    let sub_formset_temp = [];
                    $(item).find('[data-subformset-body] [data-subformset-form]').each(function () {
                        /*** for loop in sub formset get sub condition ***/
                        if (!this.hasAttribute('data-formset-form-deleted')) {
                            /*** get data form from sub-formset ***/
                            let left_cond = $(this).find('select[name*="-left_cond"]').val();
                            if ($(this).find('select[name*="-left_cond"]').val()) {
                                left_cond = SelectDDControl.get_data_from_idx($(this).find('select[name*="-left_cond"]'), $(this).find('select[name*="-left_cond"]').val());
                            }
                            let operator = $(this).find('select[name*="-math"]').val();
                            let right_cond = $(this).find('[name*="-right_cond"]').val();
                            if (left_cond?.['type'] === 5) {
                                let dataRC = SelectDDControl.get_data_from_idx($(this).find('[name*="-right_cond"]'), $(this).find('[name*="-right_cond"]').val());
                                if (dataRC) {
                                    right_cond = dataRC;
                                }
                            }
                            /*** push sub-formset to array temp ***/
                            sub_formset_temp.push({
                                left_cond: left_cond,
                                operator: operator,
                                right_cond: right_cond,
                                is_idx: parseInt($(this).find('[name*="ORDER"]').val()),
                            }, $(this).find('.subformset-logic').val())
                        }
                    });

                    /*** check if one condition convert to object else keep array ***/
                    if (sub_formset_temp.length === 2) result.push(sub_formset_temp[0], formset_logic_temp)
                    else result.push(sub_formset_temp, formset_logic_temp)
                }
            });
            let end_result = {
                node_in: parseInt(element_formset.parent('form').find('[name="node_in"]').val()),
                node_out: parseInt(element_formset.parent('form').find('[name="node_out"]').val()),
                condition: result,
            }

            // update condition for association data when edit condition, LHPHUC
            let key = end_result.node_in + '_' + end_result.node_out;
            let before_data = elm_focus.val();
            if (before_data) {
                before_data = JSON.parse(before_data);
                before_data[key] = end_result;
                end_result = before_data
            }
            else {
                let temp = {}
                temp[key] = end_result;
                end_result = temp
            }

            // add new association to flowchart class
            let getAssoc = FlowJsP.getAssociate
            getAssoc[key] = end_result
            FlowJsP.setAssociateList = getAssoc
            // if has element focus add to html input value e return element target call function
            if (elm_focus) elm_focus.val(JSON.stringify(end_result))
            else return end_result

        });
    }

    cleanFormset(element_formset = null) {
        element_formset.find('[data-formset-body]').empty()
    }

    // render data item to html
    appendData(form_elm = null, value = null, idx = 0, sub_idx_arr = 0) {
        let elm_idx = idx
        let $elm_cond = form_elm.find('[data-subformset-body] .formset:not([data-formset-form-deleted])').eq(idx);
        if (sub_idx_arr !== 0) {  // if child formset
            elm_idx = sub_idx_arr
        } else {  // if parent formset
            $elm_cond = form_elm.find('[data-subformset-body] .formset:not([data-formset-form-deleted])').eq(0);
        }
        /*** append logic to html ***/
        let logic_formset = `condition-${elm_idx}-logic`;
        if (value.hasOwnProperty('logic_next') && value.logic)

            $elm_cond.find('select[name="' + logic_formset + '"]').val(value.logic)

        /*** append left condition ***/
        let left_cond = `parameter-${elm_idx}-left_cond`;
        if (value.hasOwnProperty('left_cond') && value.left_cond) {
            this.loadInitS2($elm_cond.find('select[name="' + left_cond + '"]'), [value.left_cond], {"application": $('#select-box-features').val(), 'is_wf_condition': true}, $('#next-node-association'));
        }

        /*** append right condition ***/
        let right_cond = `parameter-${elm_idx}-right_cond`;
        if (value.hasOwnProperty('right_cond') && value.right_cond) {
            this.generatorHTMLRightDropdownBox(value.left_cond, idx, $elm_cond, $elm_cond.find('select[name="' + left_cond + '"]'));
            if ([1, 2, 6].includes(value.left_cond?.['type'])) {
                $elm_cond.find('input[name="parameter-' + idx + '-right_cond"]').val(value.right_cond);
            }
            if ([5].includes(value.left_cond?.['type'])) {
                let app_label = value.left_cond?.['content_type'];
                $elm_cond.find('select[name="' + right_cond + '"]').attr({
                    'data-url': Conditions.appMapUrl[app_label]?.['url'],
                    'data-method': "GET",
                    'data-keyResp': Conditions.appMapUrl[app_label]?.['keyResp'],
                    'data-keyText': Conditions.appMapUrl[app_label]?.['keyText'],
                })
                this.loadInitS2($elm_cond.find('select[name="' + right_cond + '"]'), [value.right_cond], {}, $('#next-node-association'));
            }
        }

        /*** append operator ***/
        let math = `parameter-${elm_idx}-math`;
        // change math option
        this.changeParameter(value.left_cond?.['type'], $elm_cond)
        if (value.hasOwnProperty('operator') && value.operator) {
            $elm_cond.find('select[name="' + math + '"]').val(value.operator).trigger('change');
        }
    }

    loopData(data_list = [], elm_form = null) {
        this.cleanFormset(elm_form)
        for (let idx = 0; idx < data_list.length; idx++) {
            let item = data_list[idx];
            let is_eq = idx;
            if (idx > 0) is_eq = idx - 1
            /*** loop data list append to HTML ***/
            if (typeof item === 'object' && !Array.isArray(item) && Object.keys(item).length) {
                /*** add formset ***/
                elm_form.find('[data-formset-add]').trigger('click');
                let elm_subform = elm_form.find('[data-formset-body] [data-formset-form]').eq(is_eq).find('[data-subformset-prefix]');
                elm_subform.find('[data-subformset-add]').trigger('click');
                this.appendData(elm_subform, item, is_eq)
            }
            else if (Array.isArray(item) && item.length) {
                /*** add formset and add sub-formset ***/
                elm_form.find('[data-formset-add]').trigger('click');
                let elm_subform = elm_form.find('[data-formset-body] [data-formset-form]').eq(is_eq).find('[data-subformset-prefix]');
                for (let idx_child = 0; idx_child < item.length; idx_child++) {
                    let child = item[idx_child];
                    if (typeof child === 'object' && !Array.isArray(child) && Object.keys(child).length) {
                        let child_eq = idx_child
                        if (idx_child > 0) child_eq = idx_child / 2;
                        elm_subform.find('[data-subformset-add]').trigger('click');
                        let subform_text = elm_subform.find('[data-subformset-body]').children('.formset').last().find('input[type="number"]').attr('name');
                        let reorder_idx = subform_text.split('-')
                        this.appendData(elm_subform, child, child_eq, parseInt(reorder_idx[1]))
                    } else {
                        let logic_formset = `-${0}-type`;
                        elm_subform.find('select[name*="' + logic_formset + '"]').val(child)
                    }
                }
            } else {
                /*** item is string and item is prev logic of formset
                 add logic to prev item ***/
                let logic_formset = `-${is_eq}-logic`;
                elm_form.find('select[name*="' + logic_formset + '"]').val(item)
            }
            // });
        }
    }

    async loadCondition(element_formset = null, data_condition = []) {
        // this.cleanFormset(element_formset)
        if (element_formset) {
            let data_condition_temp;
            if (!Array.isArray(data_condition) && typeof data_condition === 'string') {
                /*** check if data not array format ***/
                let replaceBoolean = data_condition.replaceAll("False", "false").replaceAll("True", "true");
                let replaceSlash = replaceBoolean.replaceAll(/"'"/g, '').replaceAll(/'/g, '"').replaceAll("None", '""');
                data_condition_temp = JSON.parse(replaceSlash);
            } else data_condition_temp = data_condition;
            // get left_cond ID and return full detail if ID
            if (data_condition_temp.length){
                let x = await this.callLeftConditionByID(data_condition_temp);
            }
            // render to formset
            this.loopData(data_condition_temp, element_formset);
        }
    }

    async callLeftConditionByID(data_condition_temp) {
        let IDList = [];
        for (let val of data_condition_temp){ // for in list condition
            if (val !== 'AND' && val !== 'OR'){ // check if val is not string logic
                if (typeof val === 'object'){ // if val is object (one condition)
                    IDList.push(val.left_cond?.['id'])
                }
                else{ // else val is list many condition
                    for (let child of val){
                        IDList.push(child.left_cond)
                    }
                }
            }
        }
        let params = {
            application: $('[name="application"]').val(),
            id__in: IDList.join(","),
        };
        let isData = await $.fn.callAjax2({
                'url': Conditions.$url.data('app-property'),
                'method': "GET",
                'data': params,
                'cache': true,
            }
        )
        if (isData) {
            $.fn.switcherResp(isData)
            let proList = {}
            $.map(isData.data.application_property_list, function (item) {
                proList[item.id] = item
            })
            this.setPropertyList = proList;
            return true
        }
    }

    loadInitS2($ele, data = [], dataParams = {}, $modal = null, isClear = false, customRes = {}) {
        let opts = {'allowClear': isClear};
        $ele.empty();
        if (data.length > 0) {
            opts['data'] = data;
        }
        if (Object.keys(dataParams).length !== 0) {
            opts['dataParams'] = dataParams;
        }
        if ($modal) {
            opts['dropdownParent'] = $modal;
        }
        if (Object.keys(customRes).length !== 0) {
            opts['templateResult'] = function (state) {
                let res1 = `<span class="badge badge-soft-primary mr-2">${state.data?.[customRes['res1']] ? state.data?.[customRes['res1']] : "--"}</span>`
                let res2 = `<span>${state.data?.[customRes['res2']] ? state.data?.[customRes['res2']] : "--"}</span>`
                return $(`<span>${res1} ${res2}</span>`);
            }
        }
        $ele.initSelect2(opts);
        return true;
    };

    /***
     * get list data type from WF_DATATYPE and render option for select fo math element
     * @param value Object key of data type
     * @param elm element per row of formset
     */
    changeParameter(value, elm) {
        for (let typeData of WF_DATATYPE[value]) {
            typeData['id'] = typeData?.['value'];
            typeData['title'] = typeData?.['text'];
        }
        this.loadInitS2(elm.find('[name*="-math"]'), WF_DATATYPE[value], {}, $('#next-node-association'));
        if (WF_DATATYPE[value].length > 0) {
            elm.find('[name*="-math"]').val(WF_DATATYPE[value][0]?.['id']).trigger('change');
        }
    }

    /***
     * render right condition when create new and open popup connection had value
     * @param left_info data of left condition
     * @param idx index of formset row
     * @param elm_sub_formset_row child formset of row of formset
     * @param select element of left condition
     */
    generatorHTMLRightDropdownBox(left_info, idx, elm_sub_formset_row=null, select){
        let _type = left_info?.['type'];
        let _code = left_info?.['code'];
        let properties = left_info?.['properties'];
        let app_label = left_info?.['content_type'];
        let opt_select = '';
        let dropdown = {};
        let md_url = '',
            md_multiple = false,
            md_prefix = '';
        if (Object.keys(properties).length !== 0 && Object.keys(properties).length !== -1) {
            if (properties.hasOwnProperty('data')) {
                for (let item of properties.data) {
                    opt_select += `<option value="${item.value}">${item.text}</option>`;
                }
            }
            if (properties.hasOwnProperty('dropdown_list')) {
                dropdown = properties.dropdown_list
                md_url = dropdown.url
                md_prefix = dropdown.prefix
                md_multiple = dropdown.multiple
            }
        }
        let html_temp = {
            1: `<input class="form-control" type="${_type}" name="parameter-${idx}-right_cond">`,
            2: `<input class="form-control datetime_field" type="text" name="parameter-${idx}-right_cond"/>`,
            3: `<select class="form-select" name="parameter-${idx}-right_cond">${opt_select}</select>`,
            4: `<div class="form-check mt-2"> <input type="checkbox" class="form-check-input" `
                + `id="${_code}-${idx}" name="parameter-${idx}-right_cond">`
                + `<label class="form-check-label" for="${_code}-${idx}">${left_info.title}</label></div>`,
            5: `<select class="form-control dropdown-select_two" `
                +`name="parameter-${idx}-right_cond" data-multiple="${md_multiple}" data-prefix="${md_prefix}" `
                +`data-url="${md_url}"></select>`,
        };
        // render html to column 3
        if ([1, 2, 6].includes(_type)){
            let int = _type === 6 ? 1 : _type;
            elm_sub_formset_row.find('.child-formset .flex-row').eq(2).html(html_temp[int]);
        }
        if ([5].includes(_type)) {
            let right_cond = select.parents('[data-subformset-form]').find('[name*="-right_cond"]');
            left_info.selected = true
            let virtual = {
                "id": "default",
                "text": "input type",
                "title": "input type"
            }
            let params = JSON.stringify({
                "application": $('#select-box-features').val(),
                "type": _type,
            })
            right_cond.attr({
                'data-virtual': JSON.stringify(virtual),
                'data-params': params
            })
            if (right_cond[0].nodeName !== 'SELECT') {
                let new_select = $(`<select name="${right_cond.attr('name')}" class="dropdown-select_two form-control"></select>`)
                if (right_cond.parent().hasClass('form-check'))
                    right_cond.parent().replaceWith(new_select)
                else right_cond.replaceWith(new_select)

            }
            // get new element has been replaced
            right_cond = select.parents('[data-subformset-form]').find('[name*="-right_cond"]')
            right_cond.attr({
                'data-virtual': JSON.stringify(virtual),
                // 'data-onload': JSON.stringify([left_info]),
                'data-params': params,
                'data-url': Conditions.appMapUrl[app_label]?.['url'],
                'data-method': "GET",
                'data-keyResp': Conditions.appMapUrl[app_label]?.['keyResp'],
                'data-keyText': Conditions.appMapUrl[app_label]?.['keyText'],
                'data-prefix': select.attr('data-prefix'),
                'data-multiple': 'false'
            })
            this.loadInitS2(right_cond, [], {}, $('#next-node-association'));


            // on change right condition
            right_cond.on("select2:select", function (e) {
                const right_data = e.params.data;
                if (right_data.type !== 5) {
                    let r_idx = right_data.type === 6 ? 1 : right_data.type
                    if (right_data.id === 'default') r_idx = 1
                    $(this).parent('.flex-row').html(html_temp[r_idx])
                } else if (right_data.type === 5) {
                    let textHtml = right_data.properties.dropdown_list;
                    $(this).attr('data-virtual', false)
                    $(this).attr('data-url', textHtml.url)
                    $(this).attr('data-prefix', textHtml.prefix)
                    $(this).attr('data-multiple', textHtml.multiple)
                    $(this).select2('destroy')
                    $(this).empty();
                    initSelectBox($(this))
                }
            });
        }
        // append type of left_cond
        let $input_type = $(`<input type="hidden" name="parameter-${idx}-property_type">`);
        $input_type.val(_type)
        select.parent().append($input_type)
        // re-init jquery for new html of column 3
        if (_type === 2)
            elm_sub_formset_row.find('.datetime_field').daterangepicker({
                singleDatePicker: true,
                timePicker: true,
                showDropdowns: true,
                minYear: 1901,
                "cancelClass": "btn-secondary",
                maxYear: parseInt(moment().format('YYYY'), 10)
            });
        // on change value left condition change dropdown math
        this.loadInitS2(select, [left_info], {"application": $('#select-box-features').val(), 'is_wf_condition': true}, $('#next-node-association'));
        this.changeParameter(_type, elm_sub_formset_row);
    }

    /*** init formset for condition
     * run formset when page loaded
     * init sub formset when user click add formset
     * handle click add formset and click add sub formset
     * handle delete formset and delete sub formset
     * @param {properties:string} data
     * ***/
    init() {
        let form_elm = $('[data-formset-prefix]');
        let form_opt = {
            form: '[data-formset-form]',
            emptyForm: '[data-formset-empty-form]',
            body: '[data-formset-body]',
            add: '[data-formset-add]',
            deleteButton: '[data-formset-delete]',
            moveUpButton: '[data-formset-move-up]',
            moveDownButton: '[data-formset-move-down]',
            prefix: 'formset-prefix'
        }
        let sub_form_opt = {
            form: '[data-subformset-form]',
            emptyForm: '[data-subformset-empty-form]',
            body: '[data-subformset-body]',
            add: '[data-subformset-add]',
            deleteButton: '[data-subformset-delete]',
            moveUpButton: '[data-subformset-move-up]',
            moveDownButton: '[data-subformset-move-down]',
            prefix: 'subformset-prefix'
        }
        var $this = this;

        if (form_elm.length) {
            form_elm.each(function (idx, elm) {
                let $this = $(elm)
                $this.formset(form_opt);
                // init sub formset
                let isAvailable = setInterval(function () {
                    if ($this.find('[data-subformset-prefix]')) {
                        $this.find('[data-subformset-prefix]').formset(sub_form_opt);
                        clearInterval(isAvailable);
                    }
                }, 200);
            });

            // init action button sub formset when click add new formset
            $('[data-formset-add]').on('click', function () {
                let $formset_name = $(this).data('formset-add');
                let $elm = $('[data-formset-prefix="' + $formset_name + '"]')
                $elm.find('[data-subformset-prefix]').formset(sub_form_opt);

                /*** validate logic condition each formset
                * @logic_rule: when user select logic, first logic condition will be applied for all logic after
                * @logic_on_change: when first logic change, all siblings logic change too
                 ***/
                let $formsetfirst = $elm.find('[data-formset-body] .formset:not([data-formset-form-deleted])').first()
                    .find('select[name*="-logic"]')
                $elm.find('[data-formset-body] .formset + .formset').find('select[name*="-logic"]')
                    .val($formsetfirst.val()).prop('disabled', true)

                $('[data-subformset-add]').on('click', function () {
                    let sub_formset_body = $(this).parent('[data-subformset-prefix]').find('[data-subformset-body]')
                    let elm_sub_formset_row = sub_formset_body.find('.formset:not([data-formset-form-deleted])').last();
                    let is_first = sub_formset_body.find('.formset:not([data-formset-form-deleted])').first()
                        .find('select[name*="-type"]')
                    sub_formset_body.find('.formset + .formset:not([data-formset-form-deleted])')
                        .find('select[name*="-type"]').val(is_first.val()).prop('disabled', true)

                    $('[data-subformset-delete]').on('click', function () {
                        $(this).parents('[data-subformset-body]').find('.formset:not([data-formset-form-deleted])')
                            .first().find('select[name*="-type"]').prop('disabled', false);
                    });
                    // call init select2 for left_cond
                    let left_cond = elm_sub_formset_row.find('[name*="-left_cond"]')
                    $this.loadInitS2(left_cond, [], {"application": $('#select-box-features').val(), 'is_wf_condition': true}, $('#next-node-association'));

                    // datatype on change
                    left_cond.on("select2:select", function (e) {
                        // when select on change right condition will change with left data
                        let _data = e.params.data;
                        let is_index = $(this).parents('[data-subformset-form]').index()
                        // init right condition HTML follow by left condition
                        let $select = $(this);
                        $this.generatorHTMLRightDropdownBox(_data?.['data'], is_index, elm_sub_formset_row, $select)
                    });

                });

                // handle event delete formset
                $('[data-formset-delete]').on('click', function () {
                    $(this).parents('[data-formset-body]').find('.formset:not([data-formset-form-deleted])').first()
                        .find('select[name*="-logic"]').prop('disabled', false);
                });
            });
        }
    };
} // end class

// init field element went add new condition
jQuery.fn.renderFormElements = function (arg) {
    function changeComparisonOperator() {
        $('.formset-logic').on('change', function () {
            $(this).parents('[data-formset-body]').find('.formset + .formset .formset-logic').val(this.value);
        });
        $('.subformset-logic').on('change', function () {
            $(this).parents('[data-subformset-body]').find('.formset + .formset .subformset-logic').val(this.value)
        })
    }
    changeComparisonOperator();
    return arg
}

let condition = new Conditions();

$(document).ready(function () {
    // declare and init condition component
    condition.init();
    // add action click for condition element in page
    condition.ElementAction($('#save-associate'), $('#node-associate'), $formset_cond);

    // load condition when open page or open popup
    let data_cond = [];
    condition.loadCondition($formset_cond, data_cond)
});