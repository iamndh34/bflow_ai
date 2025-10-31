class IndicatorControl {
    static isOrder = $('#is_order').text();
    static $canvas = $('#indicatorCanvas');
    static $openCanvas = $('#open_indicator');
    static $table = $('#dtb_indicator');
    static $indicatorDataEle = $('#indicator_data');

    static renderTbl() {
        let trCustomEle = IndicatorControl.$table[0].querySelector('.tr-custom');
        if (trCustomEle) {
            let th1 = IndicatorControl.$indicatorDataEle.attr('data-trans-th1');
            let th2 = IndicatorControl.$indicatorDataEle.attr('data-trans-th2');
            let th3 = IndicatorControl.$indicatorDataEle.attr('data-trans-th3');
            let th4 = IndicatorControl.$indicatorDataEle.attr('data-trans-th4');
            let th5 = IndicatorControl.$indicatorDataEle.attr('data-trans-th5');
            if (th1 && th2 && th3 && th4 && th5) {
                if (IndicatorControl.isOrder === 'false') {
                    $(trCustomEle).append(`<th>${th1}</th>`);
                    $(trCustomEle).append(`<th>${th2}</th>`);
                    $(trCustomEle).append(`<th>${th5}</th>`);
                }
                if (IndicatorControl.isOrder === 'true') {
                    $(trCustomEle).append(`<th>${th1}</th>`);
                    $(trCustomEle).append(`<th>${th2}</th>`);
                    $(trCustomEle).append(`<th>${th3}</th>`);
                    $(trCustomEle).append(`<th>${th4}</th>`);
                    $(trCustomEle).append(`<th>${th5}</th>`);
                }
            }
        }
    };

    static renderDtbColumns() {
        let columns = [];
        if (IndicatorControl.isOrder === 'false') {
            columns = [
                {
                    targets: 0,
                    width: '1%',
                    render: (data, type, row, meta) => {
                        return `<span class="table-row-order" data-value="${(meta.row + 1)}">${(meta.row + 1)}</span>`
                    }
                },
                {
                    targets: 1,
                    width: '40%',
                    render: (data, type, row) => {
                        return `<b class="table-row-title" data-id="${row?.['indicator_data']?.['id']}">${row?.['indicator_data']?.['title']}</b>`
                    }
                },
                {
                    targets: 2,
                    width: '30%',
                    render: (data, type, row) => {
                        return `<span class="mask-money table-row-value" data-init-money="${parseFloat(row?.['indicator_value'])}" data-value="${row?.['indicator_value']}"></span>`
                    }
                },
                {
                    targets: 3,
                    width: '20%',
                    render: (data, type, row) => {
                        return `<span class="table-row-rate" data-value="${row?.['indicator_rate']}">${row?.['indicator_rate']} %</span>`
                    }
                }
            ];
        }
        if (IndicatorControl.isOrder === 'true') {
            columns = [
                {
                    targets: 0,
                    width: '1%',
                    render: (data, type, row, meta) => {
                        return `<span class="table-row-order" data-value="${(meta.row + 1)}">${(meta.row + 1)}</span>`
                    }
                },
                {
                    targets: 1,
                    width: '20%',
                    render: (data, type, row) => {
                        return `<b class="table-row-title" data-id="${row?.['quotation_indicator_data']?.['id']}">${row?.['quotation_indicator_data']?.['title']}</b>`
                    }
                },
                {
                    targets: 2,
                    width: '20%',
                    render: (data, type, row) => {
                        return `<span class="mask-money table-row-quotation-value" data-init-money="${parseFloat(row?.['quotation_indicator_value'])}" data-value="${row?.['quotation_indicator_value']}"></span>`
                    }
                },
                {
                    targets: 3,
                    width: '20%',
                    render: (data, type, row) => {
                        return `<span class="mask-money table-row-value" data-init-money="${parseFloat(row?.['indicator_value'])}" data-value="${row?.['indicator_value']}"></span>`
                    }
                },
                {
                    targets: 4,
                    width: '20%',
                    render: (data, type, row) => {
                        return `<span class="mask-money table-row-difference-value" data-init-money="${parseFloat(row?.['difference_indicator_value'])}" data-value="${row?.['difference_indicator_value']}"></span>`
                    }
                },
                {
                    targets: 5,
                    width: '15%',
                    render: (data, type, row) => {
                        return `<span class="table-row-rate" data-value="${row?.['indicator_rate']}">${row?.['indicator_rate']} %</span>`
                    }
                }
            ]
        }
        return columns;
    };

    static dtbIndicator(data) {
        if ($.fn.dataTable.isDataTable(IndicatorControl.$table)) {
            IndicatorControl.$table.DataTable().destroy();
        }
        IndicatorControl.$table.DataTableDefault({
            data: data ? data : [],
            paging: false,
            info: false,
            searching: false,
            columnDefs: [],
            columns: IndicatorControl.renderDtbColumns(),
            drawCallback: function () {
                $.fn.initMaskMoney2();
                IndicatorControl.dtbCustomHeader(IndicatorControl.$table);
            },
        });
    };

    static dtbCustomHeader($table) {
        let wrapper$ = $table.closest('.dataTables_wrapper');
        let $theadEle = wrapper$.find('thead');
        if ($theadEle.length > 0) {
            for (let thEle of $theadEle[0].querySelectorAll('th')) {
                if (!$(thEle).hasClass('border-right')) {
                    $(thEle).addClass('border-right');
                }
            }
        }
        let headerToolbar$ = wrapper$.find('.dtb-header-toolbar');
        let textFilter$ = $('<div class="d-flex overflow-x-auto overflow-y-hidden"></div>');
        headerToolbar$.prepend(textFilter$);

        if (textFilter$.length > 0) {
            textFilter$.css('display', 'flex');
            // Check if the button already exists before appending
            if (!$('#btn-refresh-indicator').length) {
                let html1 = `<button type="button" class="btn btn-primary" id="btn-refresh-indicator">${IndicatorControl.$indicatorDataEle.attr('data-trans-refresh')}</button>`;
                let $group = $(`<div class="btn-group" role="group" aria-label="Button group with nested dropdown">
                                ${html1}
                            </div>`);
                textFilter$.append(
                    $(`<div class="d-inline-block min-w-150p mr-1"></div>`).append($group)
                );
                // Select the appended button from the DOM and attach the event listener
                $('#btn-refresh-indicator').on('click', function () {
                    IndicatorControl.$indicatorDataEle.val("");
                    IndicatorControl.$openCanvas.trigger('click');
                    $.fn.notifyB({description: IndicatorControl.$indicatorDataEle.attr('data-trans-refreshed')}, 'success');
                });
            }
        }
    };

    static callAjaxInitIndicator() {
        $.fn.callAjax2({
                'url': IndicatorControl.$indicatorDataEle.attr('data-url'),
                'method': 'GET',
                'isDropdown': true,
            }
        ).then(
            (resp) => {
                let data = $.fn.switcherResp(resp);
                if (data) {
                    if (data.hasOwnProperty('quotation_indicator_list') && Array.isArray(data.quotation_indicator_list)) {
                        IndicatorControl.$indicatorDataEle.val(JSON.stringify(data.quotation_indicator_list));
                    }
                }
            }
        )
    };

    // handle calculate
    static loadIndicator(dataForm, opts = {}) {
        if (window.location.href.includes('/detail/')) {
            return true;
        }
        if (!IndicatorControl.$indicatorDataEle.val()) {
            $.fn.callAjax2({
                    'url': IndicatorControl.$indicatorDataEle.attr('data-url'),
                    'method': 'GET',
                    'isDropdown': true,
                }
            ).then(
                (resp) => {
                    let data = $.fn.switcherResp(resp);
                    if (data) {
                        if (data.hasOwnProperty('quotation_indicator_list') && Array.isArray(data.quotation_indicator_list)) {
                            IndicatorControl.$indicatorDataEle.val(JSON.stringify(data.quotation_indicator_list));
                            let indicatorList = data.quotation_indicator_list;
                            IndicatorControl.calculateIndicator(indicatorList, dataForm, opts);
                            // return data submit
                            return IndicatorControl.setupDataSubmit();
                        }
                    }
                }
            )
        } else {
            let indicatorList = JSON.parse(IndicatorControl.$indicatorDataEle.val());
            IndicatorControl.calculateIndicator(indicatorList, dataForm, opts);
            // return data submit
            return IndicatorControl.setupDataSubmit();
        }
    };

    static calculateIndicator(indicatorList, dataForm, opts = {}) {
        let isOrder = IndicatorControl.isOrder;
        let result_list = [];
        let result_json = {};
        let revenueValue = 0;
        let data_form = dataForm ? dataForm : {};
        let data_detail = opts?.['dataDetail'] ? opts?.['dataDetail'] : {};
        let data_quotation_indicator = opts?.['dataQuotationIndicator'] ? opts?.['dataQuotationIndicator'] : [];
        // Find data zone hidden in detail data
        WFRTControl.findDataZoneHidden(data_form, data_detail);
        // Check special case
        IndicatorControl.checkSpecialCaseIndicator(data_form);
        for (let indicator of indicatorList) {
            let rateValue = 0;
            let parse_formula = "";
            let formula_data = indicator?.['formula_data'];
            for (let item of formula_data) {
                if (typeof item === 'object' && item !== null) {
                    if (item.hasOwnProperty('is_property')) {
                        if (data_form.hasOwnProperty(item?.['code'])) {
                            parse_formula += data_form[item?.['code']];
                        }
                    } else if (item.hasOwnProperty('is_indicator')) {
                        if (result_json.hasOwnProperty(item?.['order'])) {
                            if (item?.['order'] < indicator?.['order']) {
                                parse_formula += result_json[item?.['order']]?.['indicator_value'];
                            }
                        }
                    } else if (item.hasOwnProperty('param_type')) {
                        if (item?.['param_type'] === 2) { // FUNCTION
                            if (item?.['code'] === 'max' || item?.['code'] === 'min') {
                                let functionData = IndicatorControl.functionMaxMin(item, data_form, result_json);
                                parse_formula += functionData;
                            } else if (item?.['code'] === 'sumItemIf') {
                                let functionData = IndicatorControl.functionSumItemIf(item, data_form);
                                parse_formula += functionData;
                            }
                        }
                    }
                } else if (typeof item === 'string') {
                    parse_formula += item;
                }
            }
            // begin calculate
            // format
            parse_formula = IndicatorControl.formatExpression(parse_formula);
            // value
            let value = IndicatorControl.evaluateFormula(parse_formula);
            // rate value
            if (indicator?.['code'] === "IN0001") {
                revenueValue = value;
            }
            if (value && revenueValue) {
                if (revenueValue !== 0) {
                    rateValue = ((value / revenueValue) * 100).toFixed(0);
                }
            }
            // check if indicator is_negative_set_zero is True
            if (indicator?.['is_negative_set_zero'] === true) {
                if (value < 0) {
                    value = 0;
                    rateValue = 0;
                }
            }
            // quotation value
            let quotationValue = 0;
            let differenceValue = value;
            // check if order then get quotation value
            if (isOrder === 'true') {
                for (let quotation_indicator of data_quotation_indicator) {
                    if (indicator?.['title'] === quotation_indicator?.['indicator']?.['title']) {
                        quotationValue = quotation_indicator?.['indicator_value'];
                        differenceValue = (value - quotation_indicator?.['indicator_value']);
                        break;
                    }
                }
            }
            // append result
            result_list.push({
                'indicator': indicator?.['id'],
                'indicator_data': {
                    'id': indicator?.['id'],
                    'title': indicator?.['title'],
                    'code': indicator?.['code'],
                },
                'quotation_indicator': indicator?.['id'],
                'quotation_indicator_data': {
                    'id': indicator?.['id'],
                    'title': indicator?.['title'],
                    'code': indicator?.['code'],
                },
                'order': indicator?.['order'],
                'indicator_value': value ? value : 0,
                'indicator_rate': rateValue,
                'quotation_indicator_value': quotationValue,
                'difference_indicator_value': differenceValue ? differenceValue : 0,
            });
            result_json[indicator?.['order']] = {
                'indicator_value': value ? value : 0,
                'indicator_rate': rateValue
            }
        }
        IndicatorControl.dtbIndicator(result_list);
        $.fn.initMaskMoney2();
    };

    static evaluateFormula(formulaText) {
        try {
            return eval(formulaText);
            // return evaluated;
        } catch (error) {
            return null;
        }
    };

    static functionMaxMin(item, data_form, result_json) {
        let functionBody = "[";
        let idx = 0;
        for (let function_child of item?.['function_data']) {
            idx++;
            if (typeof function_child === 'object' && function_child !== null) {
                if (function_child.hasOwnProperty('is_property')) {
                    if (data_form.hasOwnProperty(function_child?.['code'])) {
                        functionBody += data_form[function_child?.['code']];
                        if (idx < item?.['function_data'].length) {
                            functionBody += ",";
                        }
                    }
                } else if (function_child.hasOwnProperty('is_indicator')) {
                    if (result_json.hasOwnProperty(function_child?.['order'])) {
                        functionBody += result_json[function_child?.['order']]?.['indicator_value'];
                        if (idx < item?.['function_data'].length) {
                            functionBody += ",";
                        }
                    }
                }
            } else if (typeof function_child === 'string') {
                functionBody += function_child;
                if (idx < item?.['function_data'].length) {
                    functionBody += ",";
                }
            }
        }
        return item?.['syntax'] + functionBody + "])";
    };

    static functionSumItemIf(item, data_form) {
        let syntax = "sum(";
        let functionBody = "";
        let leftValueJSON = null;
        let rightValue = null;
        let operator_list = ['===', '!==', '<', '>', '<=', '>='];
        let condition_operator = operator_list.filter((element) => item?.['function_data'].includes(element))[0];
        let operatorIndex = item?.['function_data'].indexOf(condition_operator);
        if (operatorIndex !== -1 && operatorIndex > 0 && operatorIndex < item?.['function_data'].length - 1) {
            leftValueJSON = item?.['function_data'][operatorIndex - 1];
            rightValue = item?.['function_data'][operatorIndex + 1];
        }
        let lastElement = item?.['function_data'][item?.['function_data'].length - 1];
        let dataList = [];
        // Tab Products
        if (leftValueJSON?.['code'].includes("product_data")) {
            let dataTarget = [];
            for (let key in data_form) {
                if (key.includes("products_data")) {
                    dataTarget = data_form[key];
                    break;
                }
            }
            dataList = dataTarget;
        }
        if (["expense_data", "expense_item_data"].some(keyword => leftValueJSON?.['code']?.includes(keyword))) {
            let dataTarget = [];
            for (let key in data_form) {
                if (key.includes("expenses_data")) {
                    dataTarget = data_form[key];
                    break;
                }
            }
            dataList = dataTarget;
        }
        functionBody = IndicatorControl.extractDataToSum(dataList, leftValueJSON, condition_operator, rightValue, lastElement);
        if (functionBody[functionBody.length - 1] === ",") {
            let functionBodySlice = functionBody.slice(0, -1);
            return syntax + functionBodySlice + ")";
        }
        return syntax + functionBody + ")";
    };

    static extractDataToSum(data_list, leftValueJSON, condition_operator, rightValue, lastElement) {
        let functionBody = "";
        for (let data of data_list) {
            if (typeof leftValueJSON === 'object' && leftValueJSON !== null) {
                let val = IndicatorControl.findKey(data, leftValueJSON?.['code']);
                if (val) {
                    if (Array.isArray(val)) {
                        val = val.map(item => item.replace(/\s/g, "").toLowerCase());
                        let check = val.includes(rightValue);
                        if (check === true) {
                            functionBody += String(data[lastElement?.['code']]);
                            functionBody += ",";
                        }
                        if (check === false) {
                            functionBody += String(0);
                            functionBody += ",";
                        }
                    }
                    if (typeof val === 'string') {
                        let leftValue = val.replace(/\s/g, "").toLowerCase();
                        let checkExpression = `"${leftValue}" ${condition_operator} "${rightValue}"`;
                        let check = IndicatorControl.evaluateFormula(checkExpression);
                        if (check === true) {
                            let valPush = data[lastElement?.['code']];
                            if (lastElement?.['code'] === "product_subtotal_price") {
                                valPush = data[lastElement?.['code']] - (data?.['product_discount_amount_total'] * data?.['product_quantity'])
                            }
                            functionBody += String(valPush);
                            functionBody += ",";
                        }
                        if (check === false) {
                            functionBody += String(0);
                            functionBody += ",";
                        }
                    }
                }
            }
        }
        return functionBody
    };

    static checkSpecialCaseIndicator(data_form) {
        // check if product data has promotion gift then => += vào total_cost_pretax_amount
        if (data_form.hasOwnProperty('total_cost_pretax_amount')) {
            let promotion = document.getElementById('datable-quotation-create-product').querySelector('.table-row-promotion');
            if (promotion) {
                if (promotion.closest('tr').querySelector('.table-row-description').value === '(Gift)') {
                    let productGift = promotion.getAttribute('data-id-product');
                    let product_data_list = [];
                    if (data_form.hasOwnProperty('quotation_costs_data')) {
                        product_data_list = data_form['quotation_costs_data'];
                    } else if (data_form.hasOwnProperty('sale_order_costs_data')) {
                        product_data_list = data_form['sale_order_costs_data'];
                    }
                    for (let product of product_data_list) {
                        if (product.product === productGift) {
                            data_form['total_cost_pretax_amount'] += product.product_cost_price;
                            break;
                        }
                    }
                }
            }
        }
    };

    static formatExpression(input) {
        // Replace consecutive subtraction operators with a space before each minus sign
        return input.replace(/--/g, '+');
    };

    static findKey(data, key) {
        if (!key.includes("__")) {
            return data?.[key];
        }
        let listSub = key.split("__");
        return listSub.reduce((acc, curr) => {
            if (Array.isArray(acc)) {
                // If the current accumulator is an array, use flatMap to continue reduction
                return acc.flatMap(item => {
                    if (Array.isArray(item?.[curr])) {
                        // If the current item is also an array, return the array itself
                        return item?.[curr];
                    } else {
                        // If the item is not an array, proceed normally
                        return item?.[curr];
                    }
                });
            } else {
                // Regular reduction step if `acc` is not an array
                return acc?.[curr];
            }
        }, data);
    };

    // handle data
    static setupDataSubmit() {
        let result = [];
        let isOrder = IndicatorControl.isOrder;
        IndicatorControl.$table.DataTable().rows().every(function () {
            let row = this.node();
            let rowIndex = IndicatorControl.$table.DataTable().row(row).index();
            let $row = IndicatorControl.$table.DataTable().row(rowIndex);
            let dataRow = $row.data();

            let indicatorEle = row.querySelector('.table-row-title');
            let indicatorValEle = row.querySelector('.table-row-value');
            let indicatorRateEle = row.querySelector('.table-row-rate');
            let orderEle = row.querySelector('.table-row-order');
            if (indicatorEle && indicatorValEle && indicatorRateEle && orderEle) {
                let indicator = indicatorEle.getAttribute('data-id');
                let indicator_value = indicatorValEle.getAttribute('data-value');
                let indicator_rate = indicatorRateEle.getAttribute('data-value');
                let order = orderEle.getAttribute('data-value');
                if (isOrder === 'false') {
                    result.push({
                        'indicator': indicator,
                        'indicator_data': dataRow?.['indicator_data'],
                        'indicator_value': parseFloat(indicator_value),
                        'indicator_rate': parseFloat(indicator_rate),
                        'order': parseInt(order),
                    })
                }
                if (isOrder === 'true') {
                    let quotationEle = row.querySelector('.table-row-quotation-value');
                    let differEle = row.querySelector('.table-row-difference-value');
                    if (quotationEle && differEle) {
                        let quotation_indicator_value = quotationEle.getAttribute('data-value');
                        let difference_indicator_rate = differEle.getAttribute('data-value');
                        result.push({
                            'quotation_indicator': indicator,
                            'quotation_indicator_data': dataRow?.['quotation_indicator_data'],
                            'indicator_value': parseFloat(indicator_value),
                            'indicator_rate': parseFloat(indicator_rate),
                            'quotation_indicator_value': parseFloat(quotation_indicator_value),
                            'difference_indicator_value': parseFloat(difference_indicator_rate) ? difference_indicator_rate : 0,
                            'order': parseInt(order),
                        })
                    }
                }
            }
        });
        return result;
    };

    // init page
    static initPage() {
        IndicatorControl.renderTbl();
        IndicatorControl.dtbIndicator();
        IndicatorControl.callAjaxInitIndicator();
    };

}

// math functions
function max(data_list) {
    return Math.max(...data_list);
}

function min(data_list) {
    return Math.min(...data_list);
}

function sum() {
    return Array.prototype.reduce.call(arguments, function (acc, val) {
        return acc + val;
    }, 0);
}

$(document).ready(function () {

    IndicatorControl.initPage();

});