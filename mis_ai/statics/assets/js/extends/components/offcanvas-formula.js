/**
 * Component List Controller
 * @version 2.0
 * @description Lightweight, performant component list manager
 */

const ComponentListController = (function() {
    'use strict';

    // Private store - chỉ dùng một cách lưu trữ
    const store = new Map();
    let container = null;
    const operationSysLst = [
        {
            'compoment_code': 'multiply()',
            'compoment_name': 'multiply(number, number)',
            'compoment_title': 'Returns the product of two numbers.',
            'component_type': 0,
        },
        {
            'compoment_code': 'divide()',
            'compoment_name': 'divide(number, number)',
            'compoment_title': 'Returns the quotient of two numbers.',
            'component_type': 0,
        },
        {
            'compoment_code': 'min()',
            'compoment_name': 'min(list)',
            'compoment_title': 'Returns the smallest number of the arguments.',
            'component_type': 0,
        },
        {
            'compoment_code': 'max()',
            'compoment_name': 'max(list)',
            'compoment_title': 'Returns the largest number of the arguments.',
            'component_type': 0,
        },
        {
            'compoment_code': 'sum()',
            'compoment_name': 'sum(list)',
            'compoment_title': 'Returns the sum of its arguments.',
            'component_type': 0,
        },
        {
            'compoment_code': 'round()',
            'compoment_name': 'round(value, precision)',
            'compoment_title': 'Returns the value of a number rounded to the nearest integer.',
            'component_type': 0,
        },
        {
            'compoment_code': 'ceil()',
            'compoment_name': 'ceil(number)',
            'compoment_title': 'Returns the smallest integer greater than or equal to the number.',
            'component_type': 0,
        },
        {
            'compoment_code': 'floor()',
            'compoment_name': 'floor(number)',
            'compoment_title': 'Returns the largest integer less than or equal to the number.',
            'component_type': 0,
        }
    ]
    let main_regex = /[a-zA-Z]+(?:_[a-zA-Z0-9]+)*\((?:[^)(]+|\((?:[^)(]+|\([^)(]*\))*\))*\)|[a-zA-Z]+(?:_[a-zA-Z0-9]+)*|[-+*/()]|\d+(?:\.\d+)?|%/g;
    let $elmFormula = $('#input_editor')
    let $elmSave = $('#formula-save')
    const errorMessages = {
        'parentheses': $.fn.gettext(') expected'),
        'syntax': $.fn.gettext('syntax error'),
        'quote': $.fn.gettext("single quote (') not allowed"),
        'unbalance': $.fn.gettext('value or operator expected')
    };
    let onSaveCallback = null;

    /**
     * Initialize controller
     * @param {string} selector - Container selector
     * @param {Object} options - Configuration options
     */
    function init(selector, options = {}) {
        container = document.querySelector(selector);
        if (!container) {
            throw new Error(`Container ${selector} not found`);
        }
        attachEventListeners();

        // clear form when close canvas
        const $modal = $('#offcanvasFormula')
        $modal.on('hidden.bs.offcanvas', function () {
            // default field of form
            $('#input_editor').val('')
            $('#formula_type_1').prop('checked', true)

            // clear custom field of form
            $('#table_index').remove()
        })

        // Khi click Save button
        $('#formula-save').on('click', function () {
            if (validateFormula()?.result === true && onSaveCallback) {
                const data = {
                    formula: $elmFormula.val(),
                    formulaType: $('input[name="formula_type"]:checked').val(),
                    rowIndex: $('#offcanvasFormula').find('.table_index').attr('data-idx'),
                    formula_explain: $('.editor_explain').text()
                };
                onSaveCallback(data);
                // Đóng offcanvas
                bootstrap.Offcanvas.getInstance(document.getElementById('offcanvasFormula')).hide();
            }
        });

        return this;
    }

    /**
     * Render component list với optimization
     * @param {Array} data - Template attribute list
     */
    function render(data) {
        if (!Array.isArray(data) || !container) {
            console.error('Invalid render parameters');
            return this;
        }

        // Clear previous data
        store.clear();

        // get all formula
        let crtDataFormula = $('#tbl_attribute_list').DataTable().data().toArray()
        for (let formula of crtDataFormula){
            if (formula.source === 1){  //  row source===1 data is formula
                data.push({
                    'compoment_code': formula.code,
                    'compoment_name': formula.name,
                    'compoment_title': formula.title,
                    'component_type': formula.type,
                })
            }
        }
        // Build HTML with template literals (faster than string concat)
        const html = data.map((attr, index) => {
            const safeCode = escapeHtml(attr.component_code || '');
            const key = `${safeCode}_${index}`;

            // Store data
            store.set(key, {
                index,
                data: attr,
                element: null // Will be set after DOM insertion
            });

            return `
                <li class="component-item" 
                    data-key="${key}"
                    data-code="${safeCode}"
                    role="button"
                    tabindex="0">
                    <i class="fas fa-hashtag"></i>
                    <span class="code-text">${attr.component_name}</span>
                </li>
            `;
        }).join('');

        // Single DOM update
        const ul = container.querySelector('ul');
        if (ul) {
            ul.innerHTML = html;
            // Cache DOM references
            ul.querySelectorAll('li').forEach(li => {
                const key = li.dataset.key;
                const item = store.get(key);
                if (item) {
                    item.element = li;
                }
            });
        }

        return this;
    }
    /**
     * Event delegation với single listener
     */
    function attachEventListeners() {
        if (!container) return;

        // Single delegated listener
        container.addEventListener('click', handleClick);

        // Optional: keyboard navigation
        container.addEventListener('mouseover', handleMouseEnter);

        // check formula valid
        $elmFormula.on('blur', () =>{
            let objCheck = validateFormula()
            if (objCheck?.['result'] === true) {
                $elmFormula.next().text('')
                $elmSave.removeClass('disabled')
            } else {
                $elmSave.addClass('disabled')
                const error = errorMessages[objCheck?.remark] || '';
                $elmFormula.next().text(error);
            }
        })
    }

    function handleClick(e) {
        const li = e.target.closest('li');
        if (!li) return;

        const key = li.dataset.key;
        const item = store.get(key);

        if (!item) return;

        const temp = $elmFormula.val()
        const txt = (temp ? temp : '') + `${item?.data?.['component_code']}`
        $elmFormula.val(txt)
        const objCheck = validateFormula()
        if (objCheck?.['result'] === true) {
            $elmFormula.next().text('')
            $elmSave.removeClass('disabled')
        } else {
            $elmSave.addClass('disabled')
            const error = errorMessages[objCheck?.remark] || '';
            $elmFormula.next().text(error);
        }
    }

    function handleMouseEnter(e){
        const li = e.target.closest('li.component-item');
        if (!li || !container.contains(li)) return;
        const key = li.dataset.key;
        const item = store.get(key);
        if (item) {
            $('.property-description h5').text(item?.data?.component_name)
            $('.property-description p').text(item?.data?.['component_title'])
            $('.property-description span').text(item?.data?.['component_code'])
        }
    }

    // Utilities
    function escapeHtml(str) {
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    }

    // check Parentheses
    function validateParentheses(strValue) {
        let stack = [];
        for (let i = 0; i < strValue.length; i++) {
            let char = strValue[i];
            if (char === "(") {
                // Push opening parenthesis to the stack
                stack.push(char);
            } else if (char === ")") {
                // Check if there is a corresponding opening parenthesis
                if (stack.length === 0 || stack.pop() !== "(") {
                    return false;
                }
            }
        }
        // Check if there are any unclosed parentheses
        return stack.length === 0;
    }

    function hasNonMatchingValue(strValue) {
        let str_test = "";
        let strValueNoSpace = strValue.replace(/\s/g, "");
        if (strValueNoSpace.length === 0) {
            return false;
        }
        let list_data = strValueNoSpace.match(main_regex);
        if (list_data.length > 0) {
            for (let item of list_data) {
                str_test += item
            }
        }
        let str_test_no_space = str_test.replace(/\s/g, "");
        return strValueNoSpace.length === str_test_no_space.length
    }

    function hasSingleQuote(strValue) {
        return !strValue.includes("'")
    }

    function parseStringToArray(expression) {
        let data = expression.replace(/\s/g, "");
        return data.match(main_regex)
    }

    function notBalanceOperatorAndValue(strValue) {
        let list_data = parseStringToArray(strValue);
        let valueCount = 0;
        let operatorCount = 0;
        for (let data of list_data) {
            if (!["(", ")", "%"].includes(data)) {
                if (["+", "-", "*", "/"].includes(data)) {
                    operatorCount++;
                } else {
                    valueCount++
                }
            }
        }
        return operatorCount === (valueCount - 1);
    }

    function validateFormula(){
        let dataInput = $('#input_editor').val();

        const validations = [
            {check: validateParentheses, error: 'parentheses'},
            {check: hasNonMatchingValue, error: 'syntax'},
            {check: hasSingleQuote, error: 'quote'},
            {check: notBalanceOperatorAndValue, error: 'unbalance'}
        ];

        for (const {check, error} of validations) {
            if (!check(dataInput)) {
                return {result: false, remark: error};
            }
        }

        return {result: true, remark: ''};
    }

    function setOnSaveCallback(callback) {
        onSaveCallback = callback;
    }

    // Public API
    return {
        init,
        render,
        setOnSaveCallback
    };
})();
