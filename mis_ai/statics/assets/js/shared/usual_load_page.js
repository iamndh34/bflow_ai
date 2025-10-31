/**
 * Các hàm load page và hàm hỗ trợ thường dùng
 */
class UsualLoadPageFunction {
    /**
     * Định dạng ô nhập ngày
     * @param {HTMLElement|jQuery} element - element
     * @param {string} [output_format='DD/MM/YYYY'] - định dạng ngày
     * @param {Boolean} [empty=true] - true nếu muốn làm trống ô ban đầu
     * @returns {void}
     */
    static LoadDate({element, output_format='DD/MM/YYYY', empty=true}) {
        if (!element) {
            console.error("element is required.");
            return;
        }
        element.daterangepicker({
            singleDatePicker: true,
            timePicker: false,
            showDropdowns: true,
            autoApply: true,
            autoUpdateInput: !empty,
            minYear: parseInt(moment().format('YYYY')) - 1,
            locale: {format: output_format},
        }).on('apply.daterangepicker', function (ev, picker) {
            $(this).val(picker.startDate.format(output_format));
        })
    }

    /**
     * Định dạng ô nhập thời giam AM/PM
     * @param {HTMLElement|jQuery} element - element
     * @param {string} [output_format='hh:mm A'] - định dạng giờ
     * @param {string} [minute_increment=1] - khoảng cách số phút
     * @returns {void}
     */
    static LoadTime({element, output_format='HH:mm', minute_increment=1}) {
        if (!element) {
            console.error("element is required.");
            return;
        }
        element.daterangepicker({
			timePicker: true,
			singleDatePicker: true,
			timePicker24Hour: true,
			timePickerIncrement: minute_increment,
            autoUpdateInput: false,
			locale: {
                applyLabel: $.fn.gettext('Apply'),
                format: output_format
            }
		}).on('show.daterangepicker', function (ev, picker) {
            picker.container.find('.applyBtn').addClass('btn-primary btn-xs w-100 m-0')
            picker.container.find('.cancelBtn').hide();
			picker.container.find(".calendar-table").hide();
		}).on('apply.daterangepicker', function (ev, picker) {
            $(this).val(picker.startDate.format(output_format));
        });
    }

    /**
     * Load ô Employee (expected-data-url = EmployeeListAPI)
     * @param {HTMLElement|jQuery} element - element
     * @param {Object} data - data json
     * @param {Boolean} [allow_clear=true] - select allow clear
     * @param {Object} data_params - data_params
     * @param {string} data_url - data_url
     * @returns {void}
     */
    static LoadEmployee({element, data=null, allow_clear=true, data_params = {}, data_url=''}) {
        if (!element) {
            console.error("element is required.");
            return;
        }
        data_url = data_url || element.attr('data-url')
        let queryString = '';
        if (typeof data_params === 'object' && data_params !== null && Object.keys(data_params).length > 0) {
            queryString = '?' + new URLSearchParams(data_params).toString();
        }
        element.initSelect2({
            allow_clear: allow_clear,
            ajax: {
                url: data_url + queryString,
                method: 'GET',
            },
            data: (data ? data : null),
            templateResult: function (state) {
                let groupHTML = `<span class="small">${state.data?.group?.title ? '(' + state.data.group.title + ')' : ""}</span>`
                return $(`<span>${state.text} ${groupHTML}</span>`);
            },
            keyResp: 'employee_list',
            keyId: 'id',
            keyText: 'full_name',
        })
    }

    /**
     * Load bảng Customer (expected-data-url = CustomerListAPI)
     * @param {HTMLElement|jQuery} element - element
     * @param {Object} data_params - data_params
     * @param {string} data_url - data_url
     * @returns {void}
     */
    static LoadEmployeeTable({element, data_params = {}, data_url=''}) {
        element.DataTable().clear().destroy()
        element.DataTableDefault({
            useDataServer: true,
            rowIdx: true,
            reloadCurrency: true,
            scrollY: '50vh',
            scrollX: true,
            scrollCollapse: true,
            ajax: {
                url: data_url || element.attr('data-url'),
                data: data_params,
                type: 'GET',
                dataSrc: function (resp) {
                    let data = $.fn.switcherResp(resp);
                    if (data && typeof data === 'object' && data.hasOwnProperty('employee_list')) {
                        return data?.['employee_list'];
                    }
                    return [];
                },
            },
            columns: [
                {
                    className: 'w-5',
                    'render': () => {
                        return ``;
                    }
                },
                {
                    className: 'w-5',
                    render: (data, type, row) => {
                        return `<div class="form-check">
                                    <input type="radio" name="employee-selected-radio" class="form-check-input" data-employee='${JSON.stringify(row)}'/>
                                </div>`
                    }
                },
                {
                    className: 'w-70',
                    render: (data, type, row) => {
                        return `<span class="badge badge-soft-primary mr-2">${row?.['code'] || ''}</span><span>${row?.['full_name'] || ''}</span>`
                    }
                },
                {
                    className: 'w-20',
                    render: (data, type, row) => {
                        return (row?.['group'] || {})?.['title']|| ''
                    }
                },
            ],
        })
    }

    /**
     * Load ô Industry (expected-data-url = IndustryListAPI)
     * @param {HTMLElement|jQuery} element - element
     * @param {Object} data - data json
     * @param {Boolean} [allow_clear=true] - select allow clear
     * @param {Object} data_params - data_params
     * @param {string} data_url - data_url
     * @returns {void}
     */
    static LoadIndustry({element, data=null, allow_clear=true, data_params = {}, data_url=''}) {
        if (!element) {
            console.error("element is required.");
            return;
        }
        data_url = data_url || element.attr('data-url')
        let queryString = '';
        if (typeof data_params === 'object' && data_params !== null && Object.keys(data_params).length > 0) {
            queryString = '?' + new URLSearchParams(data_params).toString();
        }
        element.initSelect2({
            allow_clear: allow_clear,
            ajax: {
                url: data_url + queryString,
                method: 'GET',
            },
            data: (data ? data : null),
            keyResp: 'industry_list',
            keyId: 'id',
            keyText: 'title',
        })
    }

    /**
     * Load ô Contact (expected-data-url = ContactListAPI)
     * @param {HTMLElement|jQuery} element - element
     * @param {Object} data - data json
     * @param {Boolean} [allow_clear=true] - select allow clear
     * @param {Object} data_params - data_params
     * @param {string} data_url - data_url
     * @returns {void}
     */
    static LoadContact({element, data=null, allow_clear=true, data_params = {}, data_url=''}) {
        if (!element) {
            console.error("element is required.");
            return;
        }
        data_url = data_url || element.attr('data-url')
        let queryString = '';
        if (typeof data_params === 'object' && data_params !== null && Object.keys(data_params).length > 0) {
            queryString = '?' + new URLSearchParams(data_params).toString();
        }
        element.initSelect2({
            allow_clear: allow_clear,
            ajax: {
                url: data_url + queryString,
                method: 'GET',
            },
            data: (data ? data : null),
            keyResp: 'contact_list',
            keyId: 'id',
            keyText: 'fullname',
        })
    }

    /**
     * Load ô Account (expected-data-url = AccountListAPI)
     * @param {HTMLElement|jQuery} element - element
     * @param {Object} data - data json
     * @param {Boolean} [allow_clear=true] - select allow clear
     * @param {Object} data_params - data_params
     * @param {string} data_url - data_url
     * @returns {void}
     */
    static LoadAccount({element, data=null, allow_clear=true, data_params = {}, data_url=''}) {
        if (!element) {
            console.error("element is required.");
            return;
        }
        data_url = data_url || element.attr('data-url')
        let queryString = '';
        if (typeof data_params === 'object' && data_params !== null && Object.keys(data_params).length > 0) {
            queryString = '?' + new URLSearchParams(data_params).toString();
        }
        element.initSelect2({
            allow_clear: allow_clear,
            ajax: {
                url: data_url + queryString,
                method: 'GET',
            },
            data: (data ? data : null),
            keyResp: 'account_list',
            keyId: 'id',
            keyText: 'name',
        })
    }

    /**
     * Load ô Account Group (expected-data-url = AccountGroupListAPI)
     * @param {HTMLElement|jQuery} element - element
     * @param {Object} data - data json
     * @param {Boolean} [allow_clear=true] - select allow clear
     * @param {Object} data_params - data_params
     * @param {string} data_url - data_url
     * @returns {void}
     */
    static LoadAccountGroup({element, data=null, allow_clear=true, data_params = {}, data_url=''}) {
        if (!element) {
            console.error("element is required.");
            return;
        }
        data_url = data_url || element.attr('data-url')
        let queryString = '';
        if (typeof data_params === 'object' && data_params !== null && Object.keys(data_params).length > 0) {
            queryString = '?' + new URLSearchParams(data_params).toString();
        }
        element.initSelect2({
            allow_clear: allow_clear,
            ajax: {
                url: data_url + queryString,
                method: 'GET',
            },
            data: (data ? data : null),
            keyResp: 'account_group_list',
            keyId: 'id',
            keyText: 'title',
        })
    }

    /**
     * Load ô Customer (expected-data-url = CustomerListAPI)
     * @param {HTMLElement|jQuery} element - element
     * @param {Object} data - data json
     * @param {Boolean} [allow_clear=true] - select allow clear
     * @param {Object} data_params - data_params
     * @param {string} data_url - data_url
     * @returns {void}
     */
    static LoadCustomer({element, data=null, allow_clear=true, data_params = {}, data_url=''}) {
        if (!element) {
            console.error("element is required.");
            return;
        }
        data_url = data_url || element.attr('data-url')
        let queryString = '';
        if (typeof data_params === 'object' && data_params !== null && Object.keys(data_params).length > 0) {
            queryString = '?' + new URLSearchParams(data_params).toString();
        }
        element.initSelect2({
            allow_clear: allow_clear,
            ajax: {
                url: data_url + queryString,
                method: 'GET',
            },
            data: (data ? data : null),
            keyResp: 'customer_list',
            keyId: 'id',
            keyText: 'name',
        })
    }

    /**
     * Load bảng Customer (expected-data-url = CustomerListAPI)
     * @param {HTMLElement|jQuery} element - element
     * @param {Object} data_params - data_params
     * @param {string} data_url - data_url
     * @returns {void}
     */
    static LoadCustomerTable({element, data_params = {}, data_url=''}) {
        element.DataTable().clear().destroy()
        element.DataTableDefault({
            useDataServer: true,
            rowIdx: true,
            reloadCurrency: true,
            scrollY: '50vh',
            scrollX: true,
            scrollCollapse: true,
            ajax: {
                url: data_url || element.attr('data-url'),
                data: data_params,
                type: 'GET',
                dataSrc: function (resp) {
                    let data = $.fn.switcherResp(resp);
                    if (data && typeof data === 'object' && data.hasOwnProperty('customer_list')) {
                        return data?.['customer_list'];
                    }
                    return [];
                },
            },
            columns: [
                {
                    className: 'w-5',
                    'render': () => {
                        return ``;
                    }
                },
                {
                    className: 'w-5',
                    render: (data, type, row) => {
                        return `<div class="form-check">
                                    <input type="radio" name="customer-selected-radio" class="form-check-input" data-customer='${JSON.stringify(row)}'/>
                                </div>`
                    }
                },
                {
                    className: 'w-70',
                    render: (data, type, row) => {
                        return `<span class="badge badge-soft-primary mr-2">${row?.['code'] || ''}</span><span>${row?.['name'] || ''}</span>`
                    }
                },
                {
                    className: 'w-20',
                    render: (data, type, row) => {
                        return row?.['tax_code'] || ''
                    }
                },
            ],
        })
    }

    /**
     * Load ô Supplier (expected-data-url = SupplierListAPI)
     * @param {HTMLElement|jQuery} element - element
     * @param {Object} data - data json
     * @param {Boolean} [allow_clear=true] - select allow clear
     * @param {Object} data_params - data_params
     * @param {string} data_url - data_url
     * @returns {void}
     */
    static LoadSupplier({element, data=null, allow_clear=true, data_params = {}, data_url=''}) {
        if (!element) {
            console.error("element is required.");
            return;
        }
        data_url = data_url || element.attr('data-url')
        let queryString = '';
        if (typeof data_params === 'object' && data_params !== null && Object.keys(data_params).length > 0) {
            queryString = '?' + new URLSearchParams(data_params).toString();
        }
        element.initSelect2({
            allow_clear: allow_clear,
            ajax: {
                url: data_url + queryString,
                method: 'GET',
            },
            data: (data ? data : null),
            keyResp: 'supplier_list',
            keyId: 'id',
            keyText: 'name',
        })
    }

    /**
     * Load bảng Supplier (expected-data-url = SupplierListAPI)
     * @param {HTMLElement|jQuery} element - element
     * @param {Object} data_params - data_params
     * @param {string} data_url - data_url
     * @returns {void}
     */
    static LoadSupplierTable({element, data_params = {}, data_url=''}) {
        element.DataTable().clear().destroy()
        element.DataTableDefault({
            useDataServer: true,
            rowIdx: true,
            reloadCurrency: true,
            scrollY: '50vh',
            scrollX: true,
            scrollCollapse: true,
            ajax: {
                url: data_url || element.attr('data-url'),
                data: data_params,
                type: 'GET',
                dataSrc: function (resp) {
                    let data = $.fn.switcherResp(resp);
                    if (data && typeof data === 'object' && data.hasOwnProperty('supplier_list')) {
                        return data?.['supplier_list'];
                    }
                    return [];
                },
            },
            columns: [
                {
                    className: 'w-5',
                    'render': () => {
                        return ``;
                    }
                },
                {
                    className: 'w-5',
                    render: (data, type, row) => {
                        return `<div class="form-check">
                                    <input type="radio" name="supplier-selected-radio" class="form-check-input" data-supplier='${JSON.stringify(row)}'/>
                                </div>`
                    }
                },
                {
                    className: 'w-70',
                    render: (data, type, row) => {
                        return `<span class="badge badge-soft-primary mr-2">${row?.['code'] || ''}</span><span>${row?.['name'] || ''}</span>`
                    }
                },
                {
                    className: 'w-20',
                    render: (data, type, row) => {
                        return row?.['tax_code'] || ''
                    }
                },
            ],
        })
    }

    /**
     * Load ô Warehouse (expected-data-url = WareHouseListAPI)
     * @param {HTMLElement|jQuery} element - element
     * @param {Object} data - data json
     * @param {Boolean} [allow_clear=true] - select allow clear
     * @param {Object} data_params - data_params
     * @param {string} data_url - data_url
     * @returns {void}
     */
    static LoadWarehouse({element, data=null, allow_clear=true, data_params = {}, data_url=''}) {
        if (!element) {
            console.error("element is required.");
            return;
        }
        data_url = data_url || element.attr('data-url')
        let queryString = '';
        if (typeof data_params === 'object' && data_params !== null && Object.keys(data_params).length > 0) {
            queryString = '?' + new URLSearchParams(data_params).toString();
        }
        element.initSelect2({
            allow_clear: allow_clear,
            ajax: {
                url: data_url + queryString,
                method: 'GET',
            },
            data: (data ? data : null),
            keyResp: 'warehouse_list',
            keyId: 'id',
            keyText: 'title',
        })
    }

    /**
     * Load ô Product (expected-data-url = ProductListAPI)
     * @param {HTMLElement|jQuery} element - element
     * @param {Object} data - data json
     * @param {Boolean} [allow_clear=true] - select allow clear
     * @param {Object} data_params - data_params
     * @param {string} data_url - data_url
     * @returns {void}
     */
    static LoadProduct({element, data=null, allow_clear=true, data_params = {}, data_url=''}) {
        if (!element) {
            console.error("element is required.");
            return;
        }
        data_url = data_url || element.attr('data-url')
        let queryString = '';
        if (typeof data_params === 'object' && data_params !== null && Object.keys(data_params).length > 0) {
            queryString = '?' + new URLSearchParams(data_params).toString();
        }
        element.initSelect2({
            allow_clear: allow_clear,
            ajax: {
                url: data_url + queryString,
                method: 'GET',
            },
            data: (data ? data : null),
            keyResp: 'product_list',
            keyId: 'id',
            keyText: 'title',
        });
    }

    /**
     * Load ô Expense (expected-data-url = ExpenseListAPI)
     * @param {HTMLElement|jQuery} element - element
     * @param {Object} data - data json
     * @param {Boolean} [allow_clear=true] - select allow clear
     * @param {Object} data_params - data_params
     * @param {string} data_url - data_url
     * @returns {void}
     */
    static LoadExpense({element, data=null, allow_clear=true, data_params = {}, data_url=''}) {
        if (!element) {
            console.error("element is required.");
            return;
        }
        data_url = data_url || element.attr('data-url')
        let queryString = '';
        if (typeof data_params === 'object' && data_params !== null && Object.keys(data_params).length > 0) {
            queryString = '?' + new URLSearchParams(data_params).toString();
        }
        element.initSelect2({
            allow_clear: allow_clear,
            ajax: {
                url: data_url + queryString,
                method: 'GET',
            },
            data: (data ? data : null),
            keyResp: 'expense_list',
            keyId: 'id',
            keyText: 'title',
        })
    }

    /**
     * Load ô ExpenseItem (expected-data-url = ExpenseItemListAPI)
     * @param {HTMLElement|jQuery} element - element
     * @param {Object} data - data json
     * @param {Boolean} [allow_clear=true] - select allow clear
     * @param {Object} data_params - data_params
     * @param {string} data_url - data_url
     * @returns {void}
     */
    static LoadExpenseItem({element, data=null, allow_clear=true, data_params = {}, data_url=''}) {
        if (!element) {
            console.error("element is required.");
            return;
        }
        data_url = data_url || element.attr('data-url')
        let queryString = '';
        if (typeof data_params === 'object' && data_params !== null && Object.keys(data_params).length > 0) {
            queryString = '?' + new URLSearchParams(data_params).toString();
        }
        element.initSelect2({
            allow_clear: allow_clear,
            ajax: {
                url: data_url + queryString,
                method: 'GET',
            },
            data: (data ? data : null),
            keyResp: 'expense_item_list',
            keyId: 'id',
            keyText: 'title',
        })
    }

    /**
     * Load ô ProductType (expected-data-url = ProductTypeListAPI)
     * @param {HTMLElement|jQuery} element - element
     * @param {Object} data - data json
     * @param {Boolean} [allow_clear=true] - select allow clear
     * @param {Object} data_params - data_params
     * @param {string} data_url - data_url
     * @returns {void}
     */
    static LoadProductType({element, data=null, allow_clear=true, data_params = {}, data_url=''}) {
        if (!element) {
            console.error("element is required.");
            return;
        }
        data_url = data_url || element.attr('data-url')
        let queryString = '';
        if (typeof data_params === 'object' && data_params !== null && Object.keys(data_params).length > 0) {
            queryString = '?' + new URLSearchParams(data_params).toString();
        }
        element.initSelect2({
            allow_clear: allow_clear,
            ajax: {
                url: data_url + queryString,
                method: 'GET',
            },
            data: (data ? data : null),
            keyResp: 'product_type_list',
            keyId: 'id',
            keyText: 'title',
        });
    }

    /**
     * Load ô ProductCategory (expected-data-url = ProductCategoryListAPI)
     * @param {HTMLElement|jQuery} element - element
     * @param {Object} data - data json
     * @param {Boolean} [allow_clear=true] - select allow clear
     * @param {Object} data_params - data_params
     * @param {string} data_url - data_url
     * @returns {void}
     */
    static LoadProductCategory({element, data=null, allow_clear=true, data_params = {}, data_url=''}) {
        if (!element) {
            console.error("element is required.");
            return;
        }
        data_url = data_url || element.attr('data-url')
        let queryString = '';
        if (typeof data_params === 'object' && data_params !== null && Object.keys(data_params).length > 0) {
            queryString = '?' + new URLSearchParams(data_params).toString();
        }
        element.initSelect2({
            allow_clear: allow_clear,
            ajax: {
                url: data_url + queryString,
                method: 'GET',
            },
            data: (data ? data : null),
            keyResp: 'product_category_list',
            keyId: 'id',
            keyText: 'title',
        });
    }

    /**
     * Load ô Tax (expected-data-url = TaxListAPI)
     * @param {HTMLElement|jQuery} element - element
     * @param {Object} data - data json
     * @param {Boolean} [allow_clear=true] - select allow clear
     * @param {Object} data_params - data_params
     * @param {string} data_url - data_url
     * @returns {void}
     */
    static LoadTax({element, data=null, allow_clear=true, data_params = {}, data_url=''}) {
        if (!element) {
            console.error("element is required.");
            return;
        }
        data_url = data_url || element.attr('data-url')
        let queryString = '';
        if (typeof data_params === 'object' && data_params !== null && Object.keys(data_params).length > 0) {
            queryString = '?' + new URLSearchParams(data_params).toString();
        }
        element.initSelect2({
            allow_clear: allow_clear,
            ajax: {
                url: data_url + queryString,
                method: 'GET',
            },
            data: (data ? data : null),
            keyResp: 'tax_list',
            keyId: 'id',
            keyText: 'title',
        })
    }

    /**
     * Load ô UOM Group (expected-data-url = UnitOfMeasureGroupListAPI)
     * @param {HTMLElement|jQuery} element - element
     * @param {Object} data - data json
     * @param {Boolean} [allow_clear=true] - select allow clear
     * @param {Object} data_params - data_params
     * @param {string} data_url - data_url
     * @returns {void}
     */
    static LoadUOMGroup({element, data=null, allow_clear=true, data_params = {}, data_url=''}) {
        if (!element) {
            console.error("element is required.");
            return;
        }
        data_url = data_url || element.attr('data-url')
        let queryString = '';
        if (typeof data_params === 'object' && data_params !== null && Object.keys(data_params).length > 0) {
            queryString = '?' + new URLSearchParams(data_params).toString();
        }
        element.initSelect2({
            allow_clear: allow_clear,
            ajax: {
                url: data_url + queryString,
                method: 'GET',
            },
            callbackDataResp: function (resp, keyResp) {
                return resp.data[keyResp].filter(function (item) {
                    return Object.keys(item?.['referenced_unit']).length !== 0 && item?.['code'] !== 'ImportGroup';
                });
            },
            data: (data ? data : null),
            keyResp: 'unit_of_measure_group',
            keyId: 'id',
            keyText: 'title',
        })
    }

    /**
     * Load ô Account Type (expected-data-url = AccountTypeListAPI)
     * @param {HTMLElement|jQuery} element - element
     * @param {Object} data - data json
     * @param {Boolean} [allow_clear=true] - select allow clear
     * @param {Object} data_params - data_params
     * @param {string} data_url - data_url
     * @returns {void}
     */
    static LoadAccountType({element, data=null, allow_clear=true, data_params = {}, data_url=''}) {
        if (!element) {
            console.error("element is required.");
            return;
        }
        data_url = data_url || element.attr('data-url')
        let queryString = '';
        if (typeof data_params === 'object' && data_params !== null && Object.keys(data_params).length > 0) {
            queryString = '?' + new URLSearchParams(data_params).toString();
        }
        element.initSelect2({
            allow_clear: allow_clear,
            ajax: {
                url: data_url + queryString,
                method: 'GET',
            },
            data: (data ? data : null),
            keyResp: 'account_type_list',
            keyId: 'id',
            keyText: 'title',
        })
    }

    /**
     * Load ô UOM (expected-data-url = UnitOfMeasureListAPI)
     * @param {HTMLElement|jQuery} element - element
     * @param {Object} data - data json
     * @param {Boolean} [allow_clear=true] - select allow clear
     * @param {Object} data_params - data_params (truyền vào 'group_id' để lọc theo Group UOM)
     * @param {string} data_url - data_url
     * @returns {void}
     */
    static LoadUOM({element, data=null, allow_clear=true, data_params = {}, data_url=''}) {
        if (!element) {
            console.error("element is required.");
            return;
        }
        data_url = data_url || element.attr('data-url')
        let queryString = '';
        if (typeof data_params === 'object' && data_params !== null && Object.keys(data_params).length > 0) {
            queryString = '?' + new URLSearchParams(data_params).toString();
        }
        element.initSelect2({
            allow_clear: allow_clear,
            ajax: {
                url: data_url + queryString,
                method: 'GET',
            },
            data: (data ? data : null),
            keyResp: 'unit_of_measure',
            keyId: 'id',
            keyText: 'title',
        })
    }

    /**
     * Load ô Period (expected-data-url = PeriodsConfigListAPI)
     * @param {HTMLElement|jQuery} element - element
     * @param {Object} data - data json
     * @param {Boolean} [allow_clear=true] - select allow clear
     * @param {Object} data_params - data_params
     * @param {string} data_url - data_url
     * @returns {void}
     */
    static LoadPeriod({element, data=null, allow_clear=true, data_params = {}, data_url=''}) {
        if (!element) {
            console.error("element is required.");
            return;
        }
        data_url = data_url || element.attr('data-url')
        let queryString = '';
        if (typeof data_params === 'object' && data_params !== null && Object.keys(data_params).length > 0) {
            queryString = '?' + new URLSearchParams(data_params).toString();
        }
        element.initSelect2({
            allow_clear: allow_clear,
            ajax: {
                url: data_url + queryString,
                method: 'GET',
            },
            callbackDataResp: function (resp, keyResp) {
                let res = []
                for (const item of resp.data[keyResp]) {
                    if (item?.['fiscal_year'] <= new Date().getFullYear()) {
                        res.push(item)
                    }
                }
                return res
            },
            data: (data ? data : null),
            keyResp: 'periods_list',
            keyId: 'id',
            keyText: 'title',
        })
    }

    /**
     * Thêm dòng trong bảng
     * @param {HTMLElement|jQuery} table - table
     * @param {Object} [data={}] - data json tương ứng với các cột
     * @param {Boolean} [is_draw=true] - vẽ lại bảng
     * @returns {void}
     */
    static AddTableRow(table, data={}, is_draw=true) {
        table.DataTable().row.add(data).draw(is_draw);
    }

    /**
     * Thêm 1 dòng trống vào bảng DataTable đã khởi tạo
     * @param {HTMLElement|jQuery} table - Bảng đã init DataTable
     * @param {Object} [data={}] - Dữ liệu dòng
     * @param {number} [index] - Thêm vào vị trí đó
     */
    static AddTableRowAtIndex(table, data={}, index) {
        const dt = $(table).DataTable();
        if (index && index <= dt.rows().count()) {
            const currentData = dt.rows().data().toArray();
            currentData.splice(index, 0, data);
            dt.clear().rows.add(currentData).draw(false);
        }
    }

    /**
     * Xóa dòng trong bảng
     * @param {HTMLElement|jQuery} table - table
     * @param {number} row_index - thứ tự của hàng cần xóa
     * @param {Boolean} [is_draw=true] - vẽ lại bảng
     * @returns {void}
     */
    static DeleteTableRow(table, row_index, is_draw=true) {
        if (row_index > 0) {
            row_index = parseInt(row_index) - 1
            let rowIndex = table.DataTable().row(row_index).index();
            let row = table.DataTable().row(rowIndex);
            row.remove().draw(is_draw);
        }
    }

    /**
     * Scroll về cuối bảng khi add dòng
     * @param {HTMLElement|jQuery} $table - table
     * @returns {void}
     */
    static AutoScrollEnd($table) {
        const table_wrapper = $table.attr('id') + '_wrapper'
        const container = $(`#${table_wrapper} .dataTables_scrollBody`)[0]
        container.scrollTop = container.scrollHeight
    }

    /**
     * Hàm disabled các element trong trang Detail
     * @param {Boolean} [active=true] - active=true để áp dụng hàm
     * @param {Array} except - các element ngoại lệ
     * @returns {void}
     */
    static DisablePage(active = true, except = []) {
        if (!active) return;

        except = except.concat([
            '#print-document',
            '#printModal select',
            '#printModal button',
            '.dtb-header-toolbar input',
            '.dtb-header-toolbar select',
            '.dtb-header-toolbar button',
            '.tbl-footer-toolbar input',
            '.tbl-footer-toolbar select',
            '.tbl-footer-toolbar button',
        ]);

        const shouldExclude = (el) => except.some(selector => el.matches(selector));

        const disableElement = (el) => {
            if (shouldExclude(el)) return;

            if (el.matches('select, input, textarea, button')) {
                el.disabled = true;
            }

            if (el.matches('textarea')) {
                el.readOnly = true; // optional, chỉ để user vẫn copy text
            }
        };

        const containers = document.querySelectorAll('#idxPageContent, .idxModalData');
        containers.forEach(container => {
            if (!container) return;

            // disable các element hiện có
            container.querySelectorAll('select, input, textarea, button').forEach(disableElement);

            // theo dõi element mới được thêm
            const observer = new MutationObserver(mutations => {
                mutations.forEach(mutation => {
                    mutation.addedNodes.forEach(node => {
                        if (node.nodeType === 1) {
                            if (node.matches('select, input, textarea, button')) {
                                disableElement(node);
                            }
                            // nếu là container cha chứa nhiều input bên trong
                            node.querySelectorAll?.('select, input, textarea, button, a')
                                .forEach(disableElement);
                        }
                    });
                });
            });

            observer.observe(container, { childList: true, subtree: true });
        });
    }

    /**
     * Hàm đẩy tham số vào URL
     * @param {string} [url] - url
     * @param {Object} [params={}] - params (default = {})
     * @returns {string}
     */
    static Push_param_to_url(url, params={}) {
        const [baseUrl, queryString] = url.split('?');
        const currentParams = new URLSearchParams(queryString);
        Object.keys(params).forEach(key => {
            if (params[key] !== undefined && params[key] !== null) {
                currentParams.set(key, params[key]);
            }
        });
        return `${baseUrl}?${currentParams.toString()}`;
    }

    /**
     * Hàm đọc tiền thành chữ (VND)
     * @param {float} num
     * @returns {string}
     */
    static ReadMoneyVND(num) {
        if (num) {
            let xe0 = [
                '',
                'một',
                'hai',
                'ba',
                'bốn',
                'năm',
                'sáu',
                'bảy',
                'tám',
                'chín'
            ]
            let xe1 = [
                '',
                'mười',
                'hai mươi',
                'ba mươi',
                'bốn mươi',
                'năm mươi',
                'sáu mươi',
                'bảy mươi',
                'tám mươi',
                'chín mươi'
            ]
            let xe2 = [
                '',
                'một trăm',
                'hai trăm',
                'ba trăm',
                'bốn trăm',
                'năm trăm',
                'sáu trăm',
                'bảy trăm',
                'tám trăm',
                'chín trăm'
            ]

            let result = ""
            let str_n = String(num)
            let len_n = str_n.length

            if (len_n === 1) {
                result = xe0[num]
            } else if (len_n === 2) {
                if (num === 10) {
                    result = "mười"
                } else {
                    result = xe1[parseInt(str_n[0])] + " " + xe0[parseInt(str_n[1])]
                }
            } else if (len_n === 3) {
                result = xe2[parseInt(str_n[0])] + " " + UsualLoadPageFunction.ReadMoneyVND(parseInt(str_n.substring(1, len_n)))
            } else if (len_n <= 6) {
                result = UsualLoadPageFunction.ReadMoneyVND(parseInt(str_n.substring(0, len_n - 3))) + " nghìn " + UsualLoadPageFunction.ReadMoneyVND(parseInt(str_n.substring(len_n - 3, len_n)))
            } else if (len_n <= 9) {
                result = UsualLoadPageFunction.ReadMoneyVND(parseInt(str_n.substring(0, len_n - 6))) + " triệu " + UsualLoadPageFunction.ReadMoneyVND(parseInt(str_n.substring(len_n - 6, len_n)))
            } else if (len_n <= 12) {
                result = UsualLoadPageFunction.ReadMoneyVND(parseInt(str_n.substring(0, len_n - 9))) + " tỷ " + UsualLoadPageFunction.ReadMoneyVND(parseInt(str_n.substring(len_n - 9, len_n)))
            }

            result = String(result.trim())
            return result;
        }
        return ''
    }

    /**
     * Auto load ô Employee created
     * @param {HTMLElement|jQuery} element - element
     * @param {Object} data - data json
     * @returns {void}
     */
    static AutoLoadCurrentEmployee({element, fullname=null}) {
        if (!element) {
            console.error("element is required.");
            return;
        }
        if (!fullname) {
            let ele_emp = $('#idx-link-to-current-employee')
            let data_emp = ele_emp.attr('data-value-full') ? JSON.parse(ele_emp.attr('data-value-full')) : {}
            element.val(data_emp?.['full_name'] || '')
            return;
        }
        element.val(fullname)
    }

    // for location
    /**
     * Auto load ô Country
     * @param {HTMLElement|jQuery} element - element
     * @param {Object} data - data json
     * @returns {void}
     */
    static LoadLocationCountry(element, data) {
        element.initSelect2({
            allowClear: true,
            data: (data ? data : null),
            keyResp: 'countries',
            keyId: 'id',
            keyText: 'title',
        }).on('change', function () {
            element.closest('.card-location').find('.location_province').empty();
            element.closest('.card-location').find('.location_ward').empty();
            if (element.val()) {
                element.closest('.card-location').find('.location_province').attr('data-url', `${element.closest('.card-location').find('.location_province').attr('data-raw-url')}?country_id=${$(this).val()}`)
                UsualLoadPageFunction.LoadLocationProvince(element.closest('.card-location').find('.location_province'))
                element.closest('.card-location').find('.location_province').prop('disabled', false);
                element.closest('.card-location').find('.location_ward').prop('disabled', false);
            }
            else {
                element.closest('.card-location').find('.location_province').prop('disabled', true);
                element.closest('.card-location').find('.location_ward').prop('disabled', true);
            }
        });
    }

    /**
     * Auto load ô Province
     * @param {HTMLElement|jQuery} element - element
     * @param {Object} data - data json
     * @returns {void}
     */
    static LoadLocationProvince(element, data) {
        element.initSelect2({
            allowClear: true,
            data: (data ? data : null),
            keyResp: 'nprovinces',
            keyId: 'id',
            keyText: 'fullname',
        }).on('change', function () {
            element.closest('.card-location').find('.location_ward').empty();
            if (element.val()) {
                element.closest('.card-location').find('.location_ward').attr('data-url', `${element.closest('.card-location').find('.location_ward').attr('data-raw-url')}?province_id=${$(this).val()}`)
                UsualLoadPageFunction.LoadLocationWard(element.closest('.card-location').find('.location_ward'))
                element.closest('.card-location').find('.location_ward').prop('disabled', false);
            }
            else {
                element.closest('.card-location').find('.location_ward').prop('disabled', true);
            }
        });
    }

    /**
     * Auto load ô Ward
     * @param {HTMLElement|jQuery} element - element
     * @param {Object} data - data json
     * @returns {void}
     */
    static LoadLocationWard(element, data) {
        element.initSelect2({
            allowClear: true,
            data: (data ? data : null),
            keyResp: 'nwards',
            keyId: 'id',
            keyText: 'fullname',
        });
    }

    /**
     * Đọc dữ liệu trong file Excel và trả về danh sách object để đổ vào DataTable.
     * @param {Event} even_object - Sự kiện change từ input file
     * @param {Array<{key: string, default: any, transform?: (value:any)=>any}>} key_structure - Cấu trúc cột cần đọc
     * @returns {Promise<Array<Object>>} Promise resolve với danh sách dữ liệu
     */
    static Read_file_excel(even_object, key_structure = []) {
        return new Promise((resolve, reject) => {
            const file = even_object?.target?.files?.[0];
            if (!file) return resolve([]);

            const reader = new FileReader();

            reader.onload = function (event) {
                try {
                    const data = new Uint8Array(event.target.result);
                    const workbook = XLSX.read(data, {type: 'array'});
                    const sheet = workbook.Sheets[workbook.SheetNames[0]];

                    if (!sheet) {
                        alert("No available sheet!");
                        return resolve([]);
                    }

                    let rows = XLSX.utils.sheet_to_json(sheet, {header: 1});

                    // Bỏ dòng tiêu đề
                    if (rows.length < 2) {
                        alert("File is empty!");
                        return resolve([]);
                    }

                    rows = rows.slice(1);

                    // Chuyển đổi từng dòng thành object
                    const data_list = rows.map(row => {
                        const obj = {};
                        key_structure.forEach((item, i) => {
                            const raw = row[i];
                            const value =
                                item?.transform
                                    ? item.transform(raw)
                                    : (raw ?? item?.default ?? '');
                            obj[item.key] = value;
                        });
                        return obj;
                    });

                    resolve(data_list);
                } catch (error) {
                    console.error("Excel parse error:", error);
                    alert("Can not read this file!");
                    resolve([]);
                }
            };

            reader.onerror = () => {
                alert("Error when file!");
                reject(new Error("File read error!"));
            };

            reader.readAsArrayBuffer(file);
        });
    }
}
