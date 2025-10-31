class SetupFormSubmit {
    static getUrlDetailWithID(url, pk) {
        url = url.split("/").slice(0, -1).join("/") + "/";
        if (url && pk) {
            return url + pk.toString();
        }
        return null;
    }

    static setInputValue(input$, value){
        if ($(input$).is(':checkbox')) {
            $(input$).prop('checked', !!value);
        } else if ($(input$).is(':radio')){
            const nameRadio = $(input$).attr('name');
            if (nameRadio){
                const frm$ = $(input$).closest('form');
                if (frm$.length > 0){
                    frm$.find(`:radio[name=${nameRadio}]`).prop('checked', false);
                }
                const eleChecked$ = frm$.find(`:radio[name=${nameRadio}][value=${value}]`);
                if (eleChecked$.length > 0) eleChecked$.prop('checked', true);
            }
        } else {
            $(input$).val(value)
        }
    }

    static serializerInput(input$, toObject = false) {
        let item = {
            'name': $(input$).attr('name'),
            'value': $(input$).val(),
        }

        let dataType = $(input$).attr('data-type');
        switch (dataType) {
            case 'json':
                try {
                    item['value'] = JSON.parse(item['value']);
                } catch (err) {
                }
                break
            case 'date':
                item['value'] = moment(
                    item['value'],
                    $(input$).attr('data-date-format') || 'DD-MM-YYYY',
                ).format('YYYY-MM-DD');
                break
            case 'datetime':
                item['value'] = moment(
                    item['value'],
                    $(input$).attr('data-date-format') || 'DD-MM-YYYY HH:mm:ss',
                ).format('YYYY-MM-DD HH:mm:ss');
                break
        }
        if ($(input$).is(':checkbox')) {
            item['value'] = $(input$).prop('checked');
        }
        if ($(input$).is(':radio')){
            const radioValue = $(input$).attr('value');
            if ($(input$).prop('checked') && radioValue){
                item['value'] = radioValue;
            } else {
                return {}; // return without key
            }
        }

        if (toObject === true) {
            let TempItem = {};
            TempItem[item.name] = item.value;
            return TempItem;
        }
        return item;
    }

    static serializerObject(formSelected) {
        // const queryExclude = ':not([dont_serialize]):not([name^="DataTables_"])';
        // const query$ = formSelected.find(queryExclude);
        //
        // let obj = {};
        // // case radio
        // query$.find(':input[name]:not([disabled])[type=radio]').each(function (){
        //     const name = $(this).attr('name');
        //     const value = $(this).attr('value');
        //     const checked = $(this).prop('checked');
        //     if (value !== null && value !== undefined && checked === true) obj[name] = value;
        // })
        // // another
        // query$.find(':input[name]:not([disabled]):not([type=radio])').each(function () {
        //     let item = SetupFormSubmit.serializerInput($(this));
        //     if (item && item.hasOwnProperty('name')){
        //         if (item.name in obj) {
        //             obj[item.name] = $.isArray(obj[item.name]) ? obj[item.name] : [obj[item.name]];
        //             obj[item.name].push(item.value);
        //         } else obj[item.name] = item.value;
        //     }
        // })
        // return obj;
        return $(formSelected).serializeObject();
    }

    static groupDataFromPrefix(data, prefix) {
        let rs = {};
        Object.keys(data).map((key) => {
            if (key.startsWith(prefix)) {
                rs[key.split(prefix)[1]] = data[key]
            }
        })
        return rs;
    }

    constructor(formSelected, urlDefault = null, urlRedirectDefault = null, dataMethodDefault = 'POST') {
        this.formSelected = formSelected;

        // URL call API
        this.dataUrl = formSelected.attr('data-url');
        if (!this.dataUrl) this.dataUrl = urlDefault ? urlDefault : window.location.pathname;

        // METHOD call API
        this.dataMethod = formSelected.attr('data-method');
        if (!this.dataMethod) {
            if (dataMethodDefault) {
                this.dataMethod = dataMethodDefault
            } else {
                if ($.fn.isDebug()) {
                    console.log(this.formSelected, 'Data Method do not support! It is ' + this.dataMethod)
                }
                throw ('Data Method do not support! It is ' + this.dataMethod);
            }
        }

        // URL REDIRECT after success callback
        this.dataUrlRedirect = formSelected.attr('data-url-redirect');
        if (!this.dataUrlRedirect) this.dataUrlRedirect = urlRedirectDefault ? urlRedirectDefault : null;

        // REDIRECT TIMEOUT
        this.dataRedirectTimeout = formSelected.attr('data-redirect-timeout');
        if (!this.dataRedirectTimeout) this.dataRedirectTimeout = this.dataRedirectTimeout ? this.dataRedirectTimeout : 1000;

        // Data body get from form input
        this.dataForm = SetupFormSubmit.serializerObject(formSelected);

        // URL DETAIL
        this.dataUrlDetail = formSelected.attr('data-url-detail');
        if (!this.dataUrlRedirect) this.dataUrlRedirect = urlRedirectDefault ? urlRedirectDefault : null;
        if (this.dataUrlDetail) {
            this.dataUrlDetail = this.dataUrlDetail.split("/").slice(0, -1).join("/") + "/";
        }
    }

    getUrlDetail(pk) {
        if (this.dataUrlDetail && pk) {
            return this.dataUrlDetail + pk.toString();
        }
        return null;
    }

    static reset_form(ele$) {
        $(ele$).find('.is-invalid').removeClass('is-invalid');
        $(ele$).find('.is-valid').removeClass('is-valid');
        $(ele$).find('.form-error-msg').remove();
    }

    static call_validate(ele$, configs) {
        let validator = $(ele$).validate({
            ignore: ".ignore-validate", // ":hidden",
            focusInvalid: true,
            validClass: "is-valid",
            errorClass: "is-invalid",
            errorElement: "small",
            showErrors: function (errorMap, errorList) {
                this.defaultShowErrors();
                const isSilentPopup = $(ele$).data('validate-silent-popup');
                if (!(isSilentPopup === 'true' || isSilentPopup === true)){
                    errorList.map(
                        item => {
                            if (item.element && item.message){
                                if (!$(item.element).is(':visible')){
                                    const formGroup$ = $(item.element).closest('.form-group');
                                    const label$ = formGroup$.length > 0 ? formGroup$.find('.form-label') : $(item.element).siblings('label');

                                    if (label$ && label$.length > 0){
                                        $.fn.notifyB({
                                            'title': label$.text() + ': ',
                                            'description': item.message,
                                        }, 'failure');
                                    }
                                }
                            }
                        }
                    )
                }
            },
            errorPlacement: function (error, element) {
                // error.insertAfter(element);
                error.addClass('form-error-msg')
                error.css({'color': "red"})

                //
                let parentEle = element.parent();
                let insertAfterEle = parentEle.hasClass('input-group') || parentEle.hasClass('input-affix-wrapper') ? parentEle : element;

                //
                if (insertAfterEle.siblings('.select2-container').length > 0) {
                    insertAfterEle.parent().append(error);
                } else error.insertAfter(insertAfterEle);
            },
            success: function (label, element) {
                $(element).siblings('.form-error-msg').remove();
                let parentEle = $(element).parent();

                if (parentEle.hasClass('input-group') || parentEle.hasClass('input-affix-wrapper')) {
                    parentEle.siblings('.form-error-msg').remove();
                } else {
                    $(element).siblings('.form-error-msg').remove();
                }
            },
            onsubmit: false,
            ...configs
        });
        $.validator.unpretentious(ele$);
        return validator;
    }

    validate(opts) {
        if (this.formSelected) {
            let submitHandler = opts?.['submitHandler'];
            if (opts.hasOwnProperty('submitHandler')) delete opts['submitHandler'];

            return SetupFormSubmit.call_validate(
                $(this.formSelected),
                {
                    submitHandler: function (form, event) {
                        event.preventDefault();
                        const avtiveElement = $(document.activeElement).closest('.dataTables_filter').length
                        if (avtiveElement === 1) {
                            $(this).submit(false)
                        }
                        else{
                            if (submitHandler){
                                submitHandler($(form), event)
                            }
                            else{
                                form.submit();
                            }
                        }
                    },
                    onsubmit: true, // !!submitHandler,
                    ...opts,
                }
            )
        } else throw Error('Form element must be required!');
    }

    static validate(frmEle, opts) {
        return new SetupFormSubmit(frmEle).validate(opts)
    }
}

class MaskMoney2 {
    static _beforeParseFloatAndLimit(strData) {
        let strCheck = String(strData || '').trim();
        // check not number => return "0"
        if (!/^[-+]?\d*\.?\d+$/.test(strCheck)) {
            return "0";
        }
        let data = strCheck.replace(/^0+0+$/, "");
        if (data.indexOf('.') > -1 && data.length > 18) {
            return data.slice(0, 18);
        } else if (data.indexOf('.') === -1 && data.length > 17) {
            return data.slice(0, 17);
        }
        return data;
    }

    static focusInputMoney($ele) {
        return $($ele).val($($ele).attr('value'));
    }

    static blurInputMoney($eleSelected) {
        DocumentControl.getCompanyCurrencyConfig().then((configData) => {
            $($eleSelected).val(new MaskMoney2(configData).applyConfig($($eleSelected), $($eleSelected).attr('value')));
        });
    }

    static realtimeInputMoney($ele) {
        $($ele).attr('value', parseFloat(MaskMoney2._beforeParseFloatAndLimit($($ele).val())));
    }

    static initCurrencyExchange(docData = {}) {
        let $currencyAllowEle = $('#is_currency_exchange');
        let $currencyCompanyEle = $('#currency_company_id');
        let $currencyExchangeEle = $('#currency_exchange_id');
        let $currencyExchangeEleRateEle = $('#currency_exchange_rate');

        if ($currencyAllowEle.length > 0 && $currencyCompanyEle.length > 0 && $currencyExchangeEle.length > 0 && $currencyExchangeEleRateEle.length > 0) {
            DocumentControl.getCompanyCurrencyConfig().then((configCurrencyData) => {
                // Set event on click to allow/ not allow currency exchange
                $currencyAllowEle.on('click', function () {
                    $currencyExchangeEle.attr('disabled', true);
                    $currencyExchangeEleRateEle.attr('readonly', true);
                    if ($currencyAllowEle.is(':checked')) {
                        $currencyExchangeEle.removeAttr('disabled');
                        $currencyExchangeEleRateEle.removeAttr('readonly');
                    }
                    if (!$currencyAllowEle.is(':checked')) {
                        let dataCompany = SelectDDControl.get_data_from_idx($currencyCompanyEle, $currencyCompanyEle.val());
                        FormElementControl.loadInitS2($currencyExchangeEle, [dataCompany]);
                        $currencyExchangeEle.trigger('change');
                    }
                    $.fn.initMaskMoney2();
                });
                // Set event on change currency then load rate and apply maskMoney
                $currencyExchangeEle.on('change', function () {
                    let dataExchange = SelectDDControl.get_data_from_idx($currencyExchangeEle, $currencyExchangeEle.val());
                    $currencyExchangeEleRateEle.attr('value', dataExchange?.['rate']);
                    $.fn.initMaskMoney2();
                });
                // Set event on change currency rate then apply maskMoney
                $currencyExchangeEleRateEle.on('change', function () {
                    $.fn.initMaskMoney2();
                });
                // Get currency company then set as default currency
                DocumentControl.getCompanyCurrencyFull().then((configData) => {
                    if (configData?.['master_data_currency']) {
                        configData['master_data_currency']['abbreviation'] = configData?.['master_data_currency']?.['code'];
                        configData['master_data_currency']['rate'] = 1;
                    }
                    FormElementControl.loadInitS2($currencyCompanyEle, [configData?.['master_data_currency']]);
                    FormElementControl.loadInitS2($currencyExchangeEle, [configData?.['master_data_currency']]);
                    if (docData?.['is_currency_exchange'] && docData?.['currency_exchange_data'] && docData?.['currency_exchange_rate']) {
                        if (docData?.['is_currency_exchange'] === true) {
                            $currencyAllowEle[0].checked = true;
                            $currencyExchangeEle.removeAttr('disabled');
                            $currencyExchangeEleRateEle.removeAttr('readonly');
                        }
                        FormElementControl.loadInitS2($currencyExchangeEle, [docData?.['currency_exchange_data']]);
                        $currencyExchangeEleRateEle.attr('value', docData?.['currency_exchange_rate']);
                        $.fn.initMaskMoney2();
                    }
                    if (window.location.href.includes('/detail/')) {
                        $currencyAllowEle.attr('hidden', 'true');
                        $currencyExchangeEle.attr('readonly', 'true');
                        $currencyExchangeEleRateEle.attr('readonly', 'true');
                    }
                });
            });
            if (window.location.href.includes('/detail/')) {
                $currencyAllowEle.attr('hidden', 'true');
                $currencyExchangeEle.attr('readonly', 'true');
                $currencyExchangeEleRateEle.attr('readonly', 'true');
            }
        }
        return true;
    }

    static setupSubmitCurrencyExchange() {
        let dataSubmit = {};
        let $currencyAllowEle = $('#is_currency_exchange');
        let $currencyCompanyEle = $('#currency_company_id');
        let $currencyExchangeEle = $('#currency_exchange_id');
        let $currencyExchangeEleRateEle = $('#currency_exchange_rate');
        if ($currencyAllowEle.length > 0 && $currencyCompanyEle.length > 0 && $currencyExchangeEle.length > 0 && $currencyExchangeEleRateEle.length > 0) {
            if ($currencyCompanyEle.val() && $currencyExchangeEle.val() && $currencyExchangeEleRateEle.val()) {
                let dataCompany = SelectDDControl.get_data_from_idx($currencyCompanyEle, $currencyCompanyEle.val());
                let dataExchange = SelectDDControl.get_data_from_idx($currencyExchangeEle, $currencyExchangeEle.val());
                dataSubmit['is_currency_exchange'] = $currencyAllowEle[0].checked;
                if ($currencyAllowEle[0].checked === true) {
                    dataSubmit['currency_company_id'] = $currencyCompanyEle.val();
                    dataSubmit['currency_company_data'] = dataCompany;
                    dataSubmit['currency_exchange_id'] = $currencyExchangeEle.val();
                    dataSubmit['currency_exchange_data'] = dataExchange;
                    dataSubmit['currency_exchange_rate'] = $currencyExchangeEleRateEle.valCurrency();
                }
                if ($currencyAllowEle[0].checked === false) {
                    dataSubmit['currency_company_id'] = null;
                    dataSubmit['currency_company_data'] = {};
                    dataSubmit['currency_exchange_id'] = null;
                    dataSubmit['currency_exchange_data'] = {};
                    dataSubmit['currency_exchange_rate'] = 1;
                }
            }
        }
        return dataSubmit;
    }

    constructor(configData) {
        this.configData = configData;
    }

    applyConfig($ele, strAttrValue) {
        let strDataParsed = parseFloat(strAttrValue);
        if (strAttrValue !== null && Number.isFinite(strDataParsed)) {
            // strAttrValue = strDataParsed.toString();
            strAttrValue = (strDataParsed >= 0 ? strDataParsed : strDataParsed * (-1)).toString();

            // apply mask-money config
            let prefix = this.configData?.['prefix'];
            let suffix = this.configData?.['suffix'];
            let decimal = this.configData?.['decimal'];
            let thousand = this.configData?.['thousands'];
            let precision = parseInt(this.configData?.['precision']);

            if ($ele) {
                let other_abbreviation = $ele.attr('data-other-abbreviation');
                if (other_abbreviation) {
                    if (prefix) {
                        prefix = prefix.replace(prefix.trim(), other_abbreviation)
                    }
                    if (suffix) {
                        suffix = suffix.replace(suffix.trim(), other_abbreviation)
                    }
                }
            }
            // Check currency exchange global
            let dataExchange = MaskMoney2.setupSubmitCurrencyExchange();
            if (dataExchange?.['is_currency_exchange'] === true) {
                let nonExchange = false;
                if ($ele) {
                    if ($ele[0].closest('.non-exchange')) {
                        nonExchange = true;
                    }
                    if (!$ele[0].closest('.non-exchange')) {
                        this.runAllowExchange($($ele), $($ele).attr('value'));
                    }
                }
                if (nonExchange === false) {
                    if (prefix) {
                        prefix = dataExchange?.['currency_exchange_data']?.['abbreviation'];
                    }
                    if (suffix) {
                        suffix = dataExchange?.['currency_exchange_data']?.['abbreviation'];
                    }
                }
            }
            if (prefix) {
                prefix = prefix.replace(/\s+/g, '');
            }
            if (suffix) {
                suffix = suffix.replace(/\s+/g, '');
            }

            let parsedFloatData = parseFloat(MaskMoney2._beforeParseFloatAndLimit(strAttrValue));
            if (Number.isInteger(precision)) parsedFloatData = parseFloat(parsedFloatData.toFixed(precision));
            if (Number.isFinite(parsedFloatData)) {
                let result = '';
                let arrData = parsedFloatData.toString().split(".");
                if (arrData[0].length > 0) {
                    let rs = [];
                    arrData[0].split("").reverse().map((item, idx, {length}) => {
                        rs.push(item);
                        if (idx !== length - 1 && idx !== 0 && (idx + 1) % 3 === 0) rs.push(thousand ? thousand : "");
                    });
                    if (arrData.length === 2 && arrData[1].length > 0) {
                        result = rs.reverse().join("") + (decimal ? decimal : ".") + arrData[1];
                    } else result = rs.reverse().join("");
                }
                // return (prefix ? prefix : "") + result + (suffix ? suffix : "");
                return strDataParsed >= 0 ? (prefix ? prefix : "") + result + (suffix ? suffix : "") :  '(' + (prefix ? prefix : "") + result + (suffix ? suffix : "") + ')';
            }
        }
    }

    applyMaskMoney($ele, inputOrDisplay) {
        // inputOrDisplay choice in ['input', 'display']
        switch (inputOrDisplay) {
            case 'input':
                $($ele).val(this.applyConfig($($ele), $($ele).attr('value')));
                break
            case 'display':
                $($ele).text(this.applyConfig($($ele), $($ele).attr('data-init-money')));
                break
            default:
                if ($.fn.isDebug() === true) throw Error('strData must be required!')
        }
    }

    applyConfigExchange(strAttrValue) {
        let strDataParsed = parseFloat(strAttrValue);
        let $currencyExchangeEleRateEle = $('#currency_exchange_rate');
        if (strAttrValue !== null && Number.isFinite(strDataParsed) && $currencyExchangeEleRateEle.length > 0) {
            let dataExchange = MaskMoney2.setupSubmitCurrencyExchange();
            if (dataExchange?.['is_currency_exchange'] === true) {
                strDataParsed = strDataParsed * dataExchange?.['currency_exchange_rate'];
            }
            strAttrValue = (strDataParsed >= 0 ? strDataParsed : strDataParsed * (-1)).toString();

            // apply mask-money config
            let prefix = this.configData?.['prefix'];
            let suffix = this.configData?.['suffix'];
            let decimal = this.configData?.['decimal'];
            let thousand = this.configData?.['thousands'];
            let precision = parseInt(this.configData?.['precision']);

            if (prefix) {
                prefix = prefix.replace(/\s+/g, '');
            }
            if (suffix) {
                suffix = suffix.replace(/\s+/g, '');
            }

            let parsedFloatData = parseFloat(MaskMoney2._beforeParseFloatAndLimit(strAttrValue));
            if (Number.isInteger(precision)) parsedFloatData = parseFloat(parsedFloatData.toFixed(precision));
            if (Number.isFinite(parsedFloatData)) {
                let result = '';
                let arrData = parsedFloatData.toString().split(".");
                if (arrData[0].length > 0) {
                    let rs = [];
                    arrData[0].split("").reverse().map((item, idx, {length}) => {
                        rs.push(item);
                        if (idx !== length - 1 && idx !== 0 && (idx + 1) % 3 === 0) rs.push(thousand ? thousand : "");
                    });
                    if (arrData.length === 2 && arrData[1].length > 0) {
                        result = rs.reverse().join("") + (decimal ? decimal : ".") + arrData[1];
                    } else result = rs.reverse().join("");
                }
                // return (prefix ? prefix : "") + result + (suffix ? suffix : "");
                return strDataParsed >= 0 ? (prefix ? prefix : "") + result + (suffix ? suffix : "") :  '(' + (prefix ? prefix : "") + result + (suffix ? suffix : "") + ')';
            }
        }
    }

    applyMaskMoneyExchange($ele, value) {
        $ele.attr("data-bs-toggle", "tooltip");
        $ele.attr("data-bs-placement", "bottom");
        $ele.attr('title', this.applyConfigExchange(value));
        return true;
    }

    runAllowExchange($ele, value) {
        let $currencyAllowEle = $('#is_currency_exchange');
        if ($currencyAllowEle.length > 0) {
            if ($currencyAllowEle.is(':checked')) {
                this.applyMaskMoneyExchange($ele, value);
            }
        }
        return true;
    }

}

class UrlGatewayReverse {
    static get_url(docID, docAppCode, params = {}) {
        let arrAppCode = docAppCode.split(".");
        let urlData = '#';
        if (docID && arrAppCode.length === 2) {
            urlData = globeGatewayMiddleDetailView
                .replaceAll('_plan_', arrAppCode[0])
                .replaceAll('_app_', arrAppCode[1])
                .replaceAll('_pk_', docID) + "?" + $.param(params);
        }
        return urlData;
    }

    static get_url_pk_app(doc_id, app_id, params) {
        let urlData = '#';
        if (app_id && doc_id) {
            urlData = globeGatewayPKMiddleDetailView
                .replaceAll('__pk_app__', app_id)
                .replaceAll('__pk_doc__', doc_id) + "?" + $.param(params);
        }
        return urlData;
    }

    static get_app_translate_full() {
        let appNameTranslate = $("#app_name_translate").text();
        return appNameTranslate ? JSON.parse(appNameTranslate) : {};
    }

    static get_app_name(code_app) {
        if (code_app) {
            let _arr = code_app.split(".");
            if (_arr.length === 2) {
                let appNameTranslate = UrlGatewayReverse.get_app_translate_full()
                let appData = appNameTranslate?.[_arr[0].toLowerCase()];
                if (appData && typeof appData === 'object') {
                    let featureData = appNameTranslate?.[_arr[0].toLowerCase()][_arr[1].toLowerCase()];
                    if (featureData && typeof featureData === 'object') return featureData;
                }
            }
        }
        return {};
    }

    static get_app_name_pk_app(pk_app) {
        if (pk_app) {
            let appNameTranslate = UrlGatewayReverse.get_app_translate_full()
            let appData = appNameTranslate?.[pk_app];
            if (appData) return appData;
        }
        return {}
    }

    static has_active_app(appData) {
        if (appData) {
            if (appData && appData.hasOwnProperty('is_active')) return appData['is_active'];
        }
        return true;
    }
}

class LogController {
    constructor() {
        this.groupLogEle = $('#drawer_log_data');
        this.tabLog = $('#tab-diagram');
        this.logUrl = this.tabLog.attr('data-url');
        this.blockDataRuntime = $('#idxDataRuntime');
        this.tabActivityLog = $('#tab-activities');
        this.activityUrl = this.tabActivityLog.attr('data-url');
        this.blockDataActivities = $('#idxDataActivities');
    }

    setStyleBoxLog() {
        let heightNavHeader = $('.blog-header').outerHeight();
        $('.ntt-drawer').css('top', heightNavHeader).css('height', "calc(100vh - " + (heightNavHeader + "px") + ")");
    }

    parseLogOfDoc(stagesData) {
        let ulStages = [];
        let actions = {
            'New task': $.fn.transEle.attr('data-new-task'),
            'Create document': $.fn.transEle.attr('data-create-document'),
            'Receive document': $.fn.transEle.attr('data-receive-document'),
            'Approved': $.fn.transEle.attr('data-approved'),
            'Rejected': $.fn.transEle.attr('data-rejected'),
            'Edit data by zones': $.fn.transEle.attr('data-edit-zone'),
            'Return to creator': $.fn.transEle.attr('data-return-creator'),
            'Document was returned': $.fn.transEle.attr('data-document-returned'),
            'Rerun workflow': $.fn.transEle.attr('data-rerun-workflow'),
            'Workflow ended': $.fn.transEle.attr('data-workflow-end'),
            'Workflow ended (Approved)': $.fn.transEle.attr('data-end-approved'),
            'Workflow ended (Rejected)': $.fn.transEle.attr('data-end-rejected'),
            'Rejected because of workflow error': $.fn.transEle.attr('data-workflow-error'),
        }
        if (stagesData.length > 0) {
            stagesData.map((item) => {
                let baseHTML = `<div class="row"><div class="col-12"><div class="card"><div class="hk-ribbon-type-1 start-touch">` + `<span>{stationName}</span></div>{logData}</div></div></div>`;
                let stationName = item['code'] ? `<i class="fas fa-cog"></i><span class="ml-1">${item['title']}</span>` : item['title'];

                let assigneeHTML = [];
                item['assignee_and_zone'].map((item2) => {
                    if (item2['is_done'] === false) {
                        assigneeHTML.push(`<span class="badge badge-secondary badge-outline wrap-text mr-1">${item2['full_name']}</span>`)
                    }
                })
                let assignGroupHTML = assigneeHTML.length > 0 ? `<div class="card-footer card-text">${assigneeHTML.join("")}</div>` : ``;

                let logHTML = [];
                item['logs'].map((itemLog) => {
                    let childLogHTML = `<div class="mt-2">`;
                    let img = `<img src="/static/assets/images/systems/bot_4712104.png" alt="BflowBot"/>`;
                    let name = "BflowBot";
                    let msg = itemLog?.['msg'];
                    if (actions?.[itemLog?.['msg']]) {
                        msg = actions?.[itemLog?.['msg']];
                    }
                    if ($.fn.hasOwnProperties(itemLog['actor_data'], ['full_name'])) {
                        img = `<i class="fas fa-user-circle fs-4 text-blue"></i>`;
                        name = itemLog['actor_data']?.['full_name'];
                    }
                    childLogHTML += `<div class="d-flex align-items-center">
                                            <div class="media align-items-center">
                                                <div class="media-head me-2">
                                                    ${img}
                                                </div>
                                                <div class="media-body">
                                                    <b class="d-block fs-7">${name}</b>
                                                </div>
                                            </div>
                                            <small class="text-light">  -  ${UtilControl.parseDateTime(itemLog?.['date_created'])}</small>
                                        </div>`;
                    childLogHTML += ` <ul>
                                        <li><span class="fs-7">- ${msg}</span></li>
                                    </ul></div>`;
                    logHTML.push(childLogHTML);
                })
                let logGroupHTML = `<div class="card-body mt-5"><div class="card-text">${logHTML.join("")}</div></div>`

                ulStages.push(baseHTML.format_by_key({
                    stationName: stationName,
                    // assigneeData: assignGroupHTML,
                    logData: logGroupHTML,
                }))
            })
        }
        return ulStages.join("");
    }

    parseLogActivities(log_data) {
        return log_data.map((item) => {
            let dateCreatedHTML = `<span class="badge badge-dark badge-outline mr-1">${UtilControl.parseDateTime(item.date_created)}</span>`;
            let msgHTML = `<span class="badge badge-light badge-outline mr-1">${item.msg}</span>`;
            let isDataChangeHTML = Object.keys(item?.['data_change']).length > 0 ? `<button class="btn btn-icon btn-rounded bg-dark-hover btn-log-act-more mr-1"><span class="icon"><i class="fa-solid fa-info"></i></span></button>` : ``;
            let dataChangeHTML = `<pre class="log-act-data-change hidden">${JSON.stringify(item?.['data_change'], null, 2)}</pre>`;
            let baseHTML = ``;
            if (item?.['automated_logging'] === true) {
                baseHTML = `<div class="avatar avatar-icon avatar-xxs avatar-soft-dark avatar-rounded mr-1"><span class="initial-wrap"><i class="fa-solid fa-gear"></i></span></div>`;
            } else {
                baseHTML = `<span class="badge badge-primary mr-1">${item?.['employee_data']?.['full_name']}</span>`;
            }
            return `<p class="mb-1 mt-1"> ${baseHTML} ${dateCreatedHTML} ${msgHTML} ${isDataChangeHTML} </p> ${dataChangeHTML}` + `<hr class="bg-blue-dark-3" />`
        }).join("");
    }

    getDataLogAndActivities(pkID, runtimeID, forceLoad = null) {
        // reset style
        this.setStyleBoxLog();
        // log runtime
        if (this.logUrl && (!this.groupLogEle.attr('data-log-runtime-loaded') || forceLoad === true)) {
            WindowControl.showLoadingWaitResponse(this.blockDataRuntime);
            this.blockDataRuntime.empty();
            let dataRuntimeCounter = 0;
            let intervalShowWfHistory = setInterval(() => {
                if (dataRuntimeCounter > 5) {
                    clearInterval(intervalShowWfHistory);
                    this.blockDataRuntime.html(`<span class="text-danger">${$.fn.gettext("Failed to load resource")}</span>`).removeClass('hidden');
                    WindowControl.hideLoadingWaitResponse(this.blockDataRuntime);
                } else {
                    dataRuntimeCounter += 1;
                    if (!runtimeID) runtimeID = WFRTControl.getWFRuntimeID();
                    if (runtimeID) {
                        clearInterval(intervalShowWfHistory);
                        $.fn.callAjax2({
                            url: SetupFormSubmit.getUrlDetailWithID(this.logUrl, runtimeID),
                            method: 'GET',
                        }).then((resp) => {
                            this.groupLogEle.attr('data-log-runtime-loaded', true);
                            let data = $.fn.switcherResp(resp);
                            if (data && $.fn.hasOwnProperties(data, ['diagram_data'])) {
                                let diagram_data = data?.['diagram_data'];
                                if (diagram_data) {
                                    let stages = diagram_data?.['stages'] || [];
                                    this.blockDataRuntime.html(
                                        this.parseLogOfDoc(stages)
                                    ).removeClass('hidden');
                                    WindowControl.hideLoadingWaitResponse(this.blockDataRuntime);
                                }
                            }
                        });
                    }
                }
            }, 1000)
        }

        // log activities
        WindowControl.showLoadingWaitResponse(this.blockDataActivities);
        this.blockDataActivities.empty();
        let intervalDataActivity = setInterval(() => {
            if (!pkID) pkID = this.tabActivityLog.attr('data-id-value');
            if (this.activityUrl && pkID && (!this.groupLogEle.attr('data-log-activity-loaded') || forceLoad === true)) {
                clearInterval(intervalDataActivity);
                $.fn.callAjax2({
                    url: this.activityUrl,
                    method: 'GET',
                    data: {'doc_id': pkID},
                }).then((resp) => {
                    this.groupLogEle.attr('data-log-activity-loaded', true);
                    let data = $.fn.switcherResp(resp);
                    if (data && data['status'] === 200 && data.hasOwnProperty('log_data')) {
                        this.blockDataActivities.append(this.parseLogActivities(data['log_data']));
                    } else {
                        WindowControl.hideLoadingWaitResponse(this.blockDataActivities);
                    }
                }, (errs) => {

                });
            }
        }, 1000)
    }
}

class NotifyController {
    constructor() {
        this.bellIdx = $('#idxNotifyBell');
        this.bellIdxIcon = $('#idxNotifyBellIcon');
        this.bellCount = $('#my-notify-count');
        this.notifyCountUrl = this.bellIdx.attr('data-url');
        this.dropdownData = $('#notifyDropdownData');
        this.btnSeenAll = $('#btnNotifySeenAll');
        this.btnClearAll = $('#btnNotifyClearAll');
    }

    handleBellCount(count=0){
        if (typeof count !== 'number') {
            count = 0;
        }
        this.bellCount.data('notify.count', count);
        if (count > 0){
            this.bellCount.text(count);
            this.bellIdxIcon.addClass('my-bell-ring');
        } else {
            this.bellCount.text('');
            this.bellIdxIcon.removeClass('my-bell-ring');
        }
    }

    checkNotifyCount() {
        $.fn.callAjax2({
            url: this.notifyCountUrl,
            method: 'GET',
        }).then((resp) => {
            let data = $.fn.switcherResp(resp);
            this.handleBellCount(data['count'] || 0);
        });
    }

    callDoneNotify(urlNotifyDone, btnEle$) {
        let clsThis = this;
        if (urlNotifyDone) {
            $.fn.callAjax2({
                url: urlNotifyDone,
                method: 'GET'
            }).then(
                (resp) => {
                    let data = $.fn.switcherResp(resp);
                    if (data) {
                        let counter = Number.parseInt(clsThis.bellCount.text());
                        if (counter > 0) counter -= 1;

                        if (counter > 0) clsThis.bellCount.text(counter);
                        else {
                            clsThis.bellCount.text('0').fadeOut();
                            clsThis.bellIdxIcon.removeClass('my-bell-ring');
                        }

                        btnEle$.closest('.bell-menu-item').find('.notify-flag-unseen').remove();
                        btnEle$.fadeOut({
                            'duration': 'fast',
                            'always': function () {
                                btnEle$.remove();
                            }
                        });
                    }
                },
                (errs) => {
                },
            );
        }
    }

    onEvents(){
        const clsThis = this;
        this.bellIdx.on('data.newOne', function (){
            const count = clsThis.bellCount.data('notify.count');
            clsThis.handleBellCount(count + 1);
        });
    }

    // main
    active() {
        new NotifyPopup().cleanChildNotifyBlock();
        let realThis = this;

        realThis.onEvents();

        if (realThis.notifyCountUrl) realThis.checkNotifyCount();

        let notifyData = [];
        let currentPage = 0;
        let pageSize = 10;
        let filterList = {};

        const nowDate = moment().toDate();
        const btn$ = $('#notifyDropdownData');
        const notifyGroup$ = $('#notify-bell-list');
        const notifyContent$ = notifyGroup$.find('.notify-bell-content');
        const itemEmpty$ = notifyGroup$.find('.notify-bell-empty');
        const itemSub$ = notifyGroup$.find('#notify-bell-item-sub-base.notify-bell-item-sub');
        const itemBase$ = notifyGroup$.find('#notify-bell-item-base');
        const body$ = notifyGroup$.find('.notify-bell-list-body');
        const loadMore$ = notifyGroup$.find('.notify-bell-load-more');
        const filter$ = notifyGroup$.find('#notify-bell-filter');
        const btnSeenAll$ = notifyGroup$.find('#notifyBtnSeenAll');
        const btnDeleteAll$ = notifyGroup$.find('#notifyBtnDeleteAll');

        btn$.on('click', function () {
            if (!notifyGroup$.is(':visible') && body$.find('.notify-bell-item').length === 0) {
                notifyGroup$.trigger("data.load")
            }
            notifyGroup$.fadeToggle(0, function () {
                notifyContent$.fadeToggle(100);
            });
        })
        notifyGroup$.on('click', function (event) {
            const target$ = $(event.target);
            if (target$.closest('.notify-bell-content').length === 0) {
                notifyContent$.fadeToggle(100, function () {
                    notifyGroup$.fadeToggle(0);
                })
            } else {
                const notifyBellItem$ = $(event.target).closest('.notify-bell-item');
                const notifyItemData = $(notifyBellItem$).data('notifyItemData');

                if (notifyBellItem$.length > 0 && notifyItemData){
                    let notifyIdx = notifyItemData?.['id'];
                    let docIdx = notifyItemData?.['doc_id'];
                    let appIdx = notifyItemData?.['application_id'];
                    let commentIdx = notifyItemData?.['comment_mentions_id'];

                    const notifyBtnReply$ = $(event.target).closest('.data-btn-mention-reply');
                    if (notifyBtnReply$.length > 0){
                        // seen
                        let isDone = !!notifyItemData?.['is_done'];
                        if (isDone === false) call_done_notify(notifyIdx, $(notifyBellItem$));

                        //
                        let modalEle = $('#CommentModal');
                        new $x.cls.cmt(modalEle.find('.comment-group')).init(docIdx, appIdx, {'comment_id': commentIdx ? commentIdx : null})
                        // new $x.cls.cmt(modalEle.find('.comment-group')).init(docIdx, appIdx)
                        modalEle.modal('show');
                    }

                    const notifyBtnSeen$ = $(event.target).closest('.data-btn-read-item');
                    if (notifyBtnSeen$.length > 0){
                        call_done_notify(notifyIdx, $(notifyBellItem$));
                    }
                }
            }
        })

        function resolveFilter(){
            const value = $(filter$).val();
            if (value === 'unseen'){
                filterList = {'is_done': false}
            } else if (value === 'seen'){
                filterList = {'is_done': true}
            } else {
                filterList = {}
            }
        }

        resolveFilter();

        function resetNotifyListShowing(){
            currentPage = 0;
            body$.children().not(itemEmpty$).remove();
            itemEmpty$.show(0);
        }

        filter$.on('change', function (){
            resolveFilter();
            resetNotifyListShowing();
            notifyGroup$.trigger("data.load");
        })

        function resolve_app_name(_code_app) {
            if (_code_app) {
                let appData = UrlGatewayReverse.get_app_name(_code_app);
                if (appData && appData.hasOwnProperty('title')) return appData['title'];
            }
            return _code_app;
        }

        function date_to_str(dateObj){
            return `${dateObj.getDate()}-${dateObj.getMonth() + 1}-${dateObj.getFullYear()}`
        }

        function call_done_notify(notify_id, ele$){
            $.fn.callAjax2({
                url: notifyGroup$.attr('data-url-done-notify').replaceAll('__pk__', notify_id),
                method: 'GET',
            }).then(
                (resp) => {
                    let data = $.fn.switcherResp(resp);
                    if (data) {
                        let counter = Number.parseInt(realThis.bellCount.text());
                        if (counter > 0) counter -= 1;

                        if (counter > 0) realThis.bellCount.text(counter);
                        else {
                            realThis.bellCount.text('0').fadeOut();
                            realThis.bellIdxIcon.removeClass('my-bell-ring');
                        }
                        ele$.removeClass('unread');
                    }
                },
                (errs) => {
                },
            );

        }

        function decorate_msg(msg){
            let regex = /@[^]*?\u200B/g;
            return $.fn.gettext(msg).replace(regex, (match) => {
                return `<span class="notify-mention-person">${match}</span>`;
            });

        }

        function appendNotifyItem(data){
            itemEmpty$.hide(0);
            const notifyId = data?.['id'];
            const docId = data?.['doc_id'];
            const docApp = data?.['doc_app'];
            const base$ = $(itemBase$.prop('outerHTML')).removeAttr('id');
            base$.data('notifyItemData', data);
            base$.addClass('detail');
            base$.find('.data-btn-detail-item').attr('href', UrlGatewayReverse.get_url(docId, docApp, {'redirect': true, 'notify_id': notifyId}))
            base$.find('.item-data-msg').html(decorate_msg(data.msg) || '');
            base$.find('.item-data-app').text(resolve_app_name(data.doc_app));
            base$.find('.item-data-time').html(
                $x.fn.displayRelativeTime(data.date_created, {
                    'callback': function (data) {
                        const dateStr = data['objDT'].toDate().toISOString().substring(0, 10);
                        const eleSubTmp$ = notifyGroup$.find(`.notify-bell-item-sub[data-value="${dateStr}"]`);
                        let dateShow = null;
                        switch (DateTimeControl.diffDay(data['objDT'].toDate(), nowDate)) {
                            case 0:
                                dateShow = $.fn.gettext('Today');
                            case 1:
                                if (dateShow === null) dateShow = $.fn.gettext('1 day ago');
                            case 2:
                                if (dateShow === null) dateShow = $.fn.gettext('2 day ago');
                            case 3:
                                if (dateShow === null) dateShow = $.fn.gettext('3 day ago');
                                if (eleSubTmp$.length === 0){
                                    const sub$ = $(itemSub$.prop('outerHTML')).removeAttr('id').attr('data-value', dateStr);
                                    sub$.find('p').text(dateShow);
                                    body$.append(sub$);
                                }
                                return `<small>${data.relate}</small> ● <small>${data.output}</small>`;
                            default:
                                if (eleSubTmp$.length === 0){
                                    const sub$ = $(itemSub$.prop('outerHTML')).removeAttr('id').attr('data-value', dateStr);
                                    sub$.find('p').text(date_to_str(data['objDT'].toDate()));
                                    body$.append(sub$);
                                }
                                return `<small>${data.output}</small>`;
                        }
                    }
                })
            );
            if (data.is_done !== true) base$.addClass('unread');
            else base$.removeClass('unread');

            const notifyType = data?.['notify_type'] || 0;
            switch (notifyType) {
                case 0:
                    break
                case 10:
                    // WF NEW TASK
                    base$.find('.item-image-sub-icon').addClass('bg-yellow').empty().append('<i class="fa-solid fa-bolt text-white"></i>');
                    break
                case 11:
                    // WF RETURN
                    base$.find('.item-image-sub-icon').addClass('bg-violet').empty().append('<i class="fa-solid fa-rotate-left text-white"></i>');
                    break
                case 12:
                    // WF END
                    base$.find('.item-image-sub-icon').addClass('bg-green').empty().append('<i class="fa-solid fa-flag text-white"></i>');
                    break
                case 20:
                    // COMMENT MENTIONS
                    const mentionId = data?.['comment_mentions_id'];
                    if (mentionId && $x.fn.checkUUID4(mentionId)) {
                        base$.addClass('mention');
                        base$.find('.item-image-sub-icon').addClass('bg-neon').empty().append('<i class="fa-solid fa-quote-left text-white"></i>');
                        const employeeSenderData = data?.['employee_sender_data'];
                        if (employeeSenderData){
                            const itemImage$ = base$.find('.item-image');
                            const full_name = employeeSenderData?.['full_name'] || '';
                            const email = employeeSenderData?.['email'] || '';
                            if (full_name) {
                                itemImage$
                                    .find('img')
                                    .attr('data-bs-toogle', 'tooltip')
                                    .attr('title', full_name + ' - ' + email)
                                    .removeClass('img-filter-opacity-50');
                            }
                            const avatar_img = employeeSenderData?.['avatar_img'] || '';
                            if (avatar_img) itemImage$.find('img').attr('src', avatar_img);
                        }
                    } else {
                        base$.removeClass('mention');

                        // handle when notify is project activities
                        if (data.doc_app === 'project.activities'){
                            base$.find('.item-data-msg').html(data.title);
                        }
                    }
                    break
            }
            body$.append(base$);

            ListeningEventController.listenImageLoad($(base$).find('img'));
        }

        loadMore$.on('click', function (){
            notifyGroup$.trigger("data.load");
        })

        notifyGroup$.on("data.load", function () {
            const url = $(btn$).attr('data-url') + '?' + $.param({...filterList, 'pageSize': pageSize, 'page': currentPage + 1, 'order': '-date_created'});
            $.fn.callAjax2({
                url: url,
                method: 'GET',
                isLoading: true,
                errorOnly: true,
            }).then(
                (resp) => {
                    let data = $.fn.switcherResp(resp);
                    const pageNext = data?.['page_next'];
                    if (data && data.hasOwnProperty('notify_data')) {
                        currentPage = currentPage + 1;
                        notifyData = notifyData.concat(data['notify_data']);

                        if (pageNext) loadMore$.addClass('active');
                        else loadMore$.removeClass('active');

                        data['notify_data'].map((item) => {
                            appendNotifyItem(item);
                        })
                        body$.find('[data-bs-toggle="tooltip"]').tooltip();
                    }
                },
                errs => {},
            );
        });

        btnSeenAll$.on('click', function (event) {
            event.preventDefault();
            let dataUrl = $(this).attr('data-url');
            let dataMethod = $(this).attr('data-method');
            if (dataUrl && dataMethod) {
                $.fn.callAjax2({
                    url: dataUrl,
                    method: dataMethod,
                }).then((resp) => {
                    let data = $.fn.switcherResp(resp);
                    if (data) {
                        realThis.bellIdxIcon.removeClass('my-bell-ring');
                        realThis.bellCount.text("");
                        resetNotifyListShowing();
                        notifyGroup$.trigger("data.load");
                    }
                },)
            }
        });

        btnDeleteAll$.on('click', function (event) {
            event.preventDefault();
            let dataUrl = $(this).attr('data-url');
            let dataMethod = $(this).attr('data-method');
            if (dataUrl && dataMethod) {
                $.fn.callAjax2({
                    url: dataUrl,
                    method: dataMethod,
                }).then((resp) => {
                    let data = $.fn.switcherResp(resp);
                    if (data['status'] === 204) {
                        realThis.checkNotifyCount();
                        resetNotifyListShowing();
                        notifyGroup$.trigger("data.load");
                    }
                });
            }
        });
    }
}

class FileUtils {
    static clsButtonMain = 'btn-file-upload';
    static numberFileSizeMiBMax = 20;
    // https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input/file#unique_file_type_specifiers
    static keyTypeAccept = 'data-f-accept'; // default: undefined || null : allow all

    static keyInputTextID = 'data-f-input-id';
    static keyInputFileID = 'data-f-input-file-id';
    static keyInputTextName = 'data-f-input-name';
    static keyInputTextRequired = 'data-f-input-required';
    static keyInputTextDisabled = 'data-f-input-disabled';
    static keyInputMultiple = 'data-f-multiple';
    static keyEleFileNameID = 'data-f-name-ele-id';
    static clsNameInputFile = 'input-file-upload';

    static _getMaxSizeDisplay() {
        return $.fn.gettext("Maximum size {size}MiB").replaceAll("{size}", FileUtils.numberFileSizeMiBMax);
    }

    static _getAllowMultiple() {
        return $.fn.gettext("Allows uploading multiple files");
    }

    static _checkTypeFileAllow(file_type, accept_list) {
        file_type = file_type.toLowerCase();
        if (accept_list.includes('*')) return true;

        for (let i = 0; i < accept_list.length; i++) {
            let typeF = accept_list[i].toLowerCase();
            if (typeF.endsWith("/*")) {
                if (file_type.split("/")[0] === typeF.split("/")[0]) return true;
            } else if (typeF === file_type) return true;
        }

        return false;
    }

    static checkTypeAccept(file, accept) {
        let acceptArr = accept.split(",").map((item) => item.trim());
        if (!FileUtils._checkTypeFileAllow(file.type, acceptArr)) {
            let typeMsgErr = acceptArr.map((item) => `"${item}"`).join(", ");
            $.fn.notifyB({
                'description': `${$.fn.gettext("File type not allowed for uploading")}. <p>${$.fn.gettext("It must be one of the following file types:")} ${typeMsgErr}<p>`,
            }, 'failure');
            return false;
        }
        return true;
    }

    static checkMaxFileSize(file_size) {
        if (file_size > FileUtils.numberFileSizeMiBMax * 1024 * 1024) {
            $.fn.notifyB({
                'description': FileUtils._getMaxSizeDisplay(),
            }, 'failure');
            return false;
        }
        return true;
    }

    static parseFileSize(file_size, fixRound = 2) {
        if (file_size) {
            // file_size: is bytes size
            const KiB = 1024;
            const MiB = KiB * 1024;
            const GiB = MiB * 1024;

            if (file_size >= GiB) {
                return (file_size / GiB).toFixed(fixRound) + " GB";
            } else if (file_size >= MiB) {
                return (file_size / MiB).toFixed(fixRound) + " MB";
            } else if (file_size >= KiB) {
                return (file_size / KiB).toFixed(fixRound) + " KB";
            } else {
                return file_size + " B";
            }
        }
        return '0 KiB';
    }

    static createInputText(mainEle, name, required, disabled, multiple = false) {
        let idRandom = UtilControl.generateRandomString(32);
        $(mainEle).attr(FileUtils.keyInputTextID, '#' + idRandom);
        let ele = $(`<input 
                type="text" 
                class="hidden" 
                name="${name}" 
                ${required === true ? "required" : ""}
                ${disabled === true ? "disabled" : ""}
                id="${idRandom}"
                ${multiple === true ? 'multiple' : ''}
            />`);
        ele.val("");
        ele.insertAfter(mainEle);
        return ele;
    }

    static updateInputText(inputText, required, disabled, multiple) {
        $(inputText).prop('required', required);
        $(inputText).prop('disabled', disabled);
        $(inputText).prop('multiple', multiple);
    }

    static createInputFile(mainEle, required, disabled, multiple) {
        let idRandom = UtilControl.generateRandomString(32);
        $(mainEle).attr(FileUtils.keyInputFileID, '#' + idRandom);

        let accept = $(mainEle).attr(FileUtils.keyTypeAccept);

        let ele = $(`
            <input 
                type="file" 
                value=""
                class="hidden ${FileUtils.clsNameInputFile}" id="${idRandom}"
                accept="${accept ? accept : '*'}"
                ${required ? "required" : ""}
                ${disabled ? "disabled" : ""}
                ${multiple ? "multiple" : ""}
            />
            <small><i>${multiple === true ? FileUtils._getAllowMultiple() : ""} ${FileUtils._getMaxSizeDisplay()}</i></small>
        `);
        ele.insertAfter(mainEle);
        return ele;
    }

    static updateInputFile(inputFile, required, disabled, multiple) {
        $(inputFile).prop('required', required);
        $(inputFile).prop('disabled', disabled);
        $(inputFile).prop('multiple', multiple);
    }

    static enableButtonFakeUpload(btnFakeEle, disabled) {
        $(btnFakeEle).prop('disabled', disabled);
    }

    static init(eleSelect$ = null, dataDetail = {}) {
        if (eleSelect$) {
            let idInputText = $(eleSelect$).attr(FileUtils.keyInputTextID);
            let idInputFile = $(eleSelect$).attr(FileUtils.keyInputFileID);
            let idInputTextName = $(eleSelect$).attr(FileUtils.keyInputTextName);
            let idInputTextRequired = $.fn.parseBoolean($(eleSelect$).attr(FileUtils.keyInputTextRequired), true) === true;
            let idInputTextDisabled = $.fn.parseBoolean($(eleSelect$).attr(FileUtils.keyInputTextDisabled), true) === true;
            let idInputMultipleUpload = $.fn.parseBoolean($(eleSelect$).attr(FileUtils.keyInputMultiple), false) === true;

            if (idInputText && idInputFile) {
                let eleInputText = $(idInputText);
                let eleInputFile = $(idInputFile);
                if (!(eleInputText.length > 0 && eleInputFile.length > 0)) {
                    FileUtils.createInputText(
                        $(eleSelect$),
                        idInputTextName,
                        idInputTextRequired,
                        idInputTextDisabled,
                        idInputMultipleUpload,
                    );
                    FileUtils.createInputFile(
                        $(eleSelect$),
                        idInputTextRequired,
                        idInputTextDisabled,
                        idInputMultipleUpload,
                    );
                } else {
                    FileUtils.updateInputText(
                        $(eleInputText[0]),
                        idInputTextRequired,
                        idInputTextDisabled,
                        idInputMultipleUpload
                    )
                    FileUtils.updateInputFile(
                        $(eleInputFile[0]),
                        idInputTextRequired,
                        idInputTextDisabled,
                        idInputMultipleUpload,
                    )
                }
            } else {
                FileUtils.createInputText(
                    $(eleSelect$),
                    idInputTextName,
                    $.fn.parseBoolean(idInputTextRequired, false) === true,
                    idInputTextDisabled,
                    idInputMultipleUpload,
                );
                FileUtils.createInputFile(
                    $(eleSelect$),
                    idInputTextRequired,
                    idInputTextDisabled,
                    idInputMultipleUpload,
                );
            }

            FileUtils.enableButtonFakeUpload($(eleSelect$), $.fn.parseBoolean(idInputTextDisabled, true) === true,)

            if (dataDetail && $.fn.hasOwnProperties(dataDetail, ['id', 'file_name'])) {
                let media_file_id = dataDetail?.['id'];
                let file_name = dataDetail?.['file_name'];
                let file_size = dataDetail?.['file_size'];
                if (media_file_id && file_name) {
                    let f_utils = new FileUtils(eleSelect$);
                    f_utils.setIdFile(media_file_id);
                    f_utils.setFileNameUploaded(file_name, file_size || null);
                }
            }
        } else {
            $('.btn-file-upload').each(function () {
                FileUtils.init($(this));
            });
        }
    }

    constructor(btnUploadFileEle$) {
        if (btnUploadFileEle$) {
            this.btnUploadFileEle$ = btnUploadFileEle$;

            this.idInputText = btnUploadFileEle$.attr(FileUtils.keyInputTextID);
            if (this.idInputText) this.eleInputText = $(this.idInputText);

            this.idInputFile = btnUploadFileEle$.attr(FileUtils.keyInputFileID);
            if (this.idInputFile) this.eleInputFile = $(this.idInputFile);

            this.idEleFileName = btnUploadFileEle$.attr(FileUtils.keyEleFileNameID);
        } else if ($.fn.isDebug() === true) throw Error('Required button upload when init new FileUtils');
    }

    resetValeInputFile() {
        this.eleInputFile.val(null);
    }

    setIdFile(fileID) {
        let eleInputText = $(this.idInputText);
        if (eleInputText.length > 0) {
            return eleInputText.val(fileID);
        }
        Swal.fire({
            icon: 'error',
            title: 'Oops...',
            text: 'Upload process went wrong!',
            footer: '<a href="#" class="show-raise-ticket">Raise a ticket?</a>'
        })
        if ($.fn.isDebug() === true) throw Error('Input must be required before upload file!');
    }

    setFileNameUploaded(fName, fSize = null) {
        let textDisplay = fName ? `${fName} - ${FileUtils.parseFileSize(fSize, 2)}` : ''
        if (this.idEleFileName) {
            let ele = $(this.idEleFileName);
            if (ele.length > 0) {
                ele.text(textDisplay);
            }
        } else {
            let getEleFName = this.btnUploadFileEle$.siblings('.display-file-name-uploaded');
            if (getEleFName.length > 0) {
                getEleFName.text(textDisplay);
            } else {
                this.btnUploadFileEle$.parent().append($(`<small class="form-text text-muted display-file-name-uploaded">${textDisplay}</small>`));
            }
        }
    }

    callUploadFile(file, btnMainEle) {
        let clsThis = this;
        let dataUrl = globeUrlAttachmentUpload;

        let formData = new FormData();
        formData.append('file', file);

        let progressBarEle = $(`<div class="progress">
            <div
                class="progress-bar progress-bar-striped bg-info progress-bar-animated" role="progressbar"
                aria-valuenow="0" aria-valuemin="0" aria-valuemax="100"
            ></div>
        </div>
        `)
        $(btnMainEle).parent().append(progressBarEle);

        return $.fn.callAjax2({
            url: dataUrl,
            method: 'POST',
            data: formData,
            contentType: 'multipart/form-data',
            isNotify: false,
            xhr: function () {
                let xhr = new XMLHttpRequest();
                xhr.upload.addEventListener("progress", function (evt) {
                    if (evt.lengthComputable) {
                        let percentComplete = evt.loaded / evt.total;
                        percentComplete = parseInt(percentComplete * 100);
                        progressBarEle.find('.progress-bar').alterClass('w-*', 'w-' + Math.ceil(percentComplete).toString());

                        if (percentComplete === 100) {
                            console.log('complete upload');
                        }

                    }
                }, false);
                return xhr;
            },
            error: function (jqXHR, textStatus, errorThrown) {
                let resp_data = jqXHR.responseJSON;
                if ((!resp_data || typeof resp_data !== 'object') && jqXHR.status !== 204) {
                    WindowControl.hideLoadingButton($(btnMainEle));
                    progressBarEle.remove();
                }
            },
            errorOnly: false,
        }).then((resp) => {
            let detailFile = resp?.data?.detail ? resp.data.detail : resp?.data?.['file_detail'];
            clsThis.setIdFile(detailFile?.['id']);
            clsThis.setFileNameUploaded(detailFile?.['file_name'], detailFile?.['file_size']);
            WindowControl.hideLoadingButton($(btnMainEle));
            progressBarEle.remove();
        }, (errs) => {
            progressBarEle.remove();
            let existData = errs?.data?.['errors']?.['exist'];
            let nameFile = existData?.['name'].split(".")[0];
            let extFile = existData?.['name'].split(".").pop();
            if (existData) {
                let newFileNameIDRandom = 'newFileName_' + UtilControl.generateRandomString(12);
                Swal.fire({
                    title: `<h5 class="text-danger"><i class="fa-solid fa-file"></i> ${nameFile}.${extFile}</h5> <p>What would you like to new upload with the file name to?</p>`,
                    confirmButtonText: 'New',
                    showCancelButton: true,
                    cancelButtonText: $.fn.transEle.attr('data-cancel'),
                    showDenyButton: true,
                    denyButtonText: `Use it`,
                    denyButtonColor: '#1d9e7d',
                    html: `<div class="input-group mb-3">
                                        <input type="text" autocapitalize="off" class="form-control" placeholder="New file name" id="${newFileNameIDRandom}">
                                        <span class="input-group-text" id="newFileExt" data-file-ext="${extFile}">.${extFile}</span>
                                    </div>`,
                    showLoaderOnConfirm: true,
                    preConfirm: () => {
                        let newFileNewEle = $('#' + newFileNameIDRandom);
                        let fileNewNameExcludeExt = newFileNewEle.val();
                        if (fileNewNameExcludeExt) {
                            let nameNewFile = newFileNewEle.val() + "." + extFile;
                            let newFile = new File([file], nameNewFile, {
                                type: file.type,
                            });
                            let formDataNewName = new FormData();
                            formDataNewName.append('file', newFile);
                            return $.fn.callAjax2({
                                url: dataUrl,
                                method: 'POST',
                                data: formDataNewName,
                                contentType: 'multipart/form-data',
                                isNotify: false,
                            }).then((resp) => {
                                let detailNewFile = resp?.data?.detail;
                                clsThis.setIdFile(detailNewFile?.['id']);
                                clsThis.setFileNameUploaded(detailNewFile?.['file_name'], detailNewFile?.['file_size']);
                                return true;
                            }, (errs) => {
                                if ($.fn.isDebug() === true) console.log(errs);
                                clsThis.showErrsUploadFile(newFileNewEle);
                                return false;
                            });
                        } else {
                            clsThis.showErrsUploadFile(newFileNewEle);
                            return false;
                        }

                    },
                    allowOutsideClick: false,
                }).then((result) => {
                    if (result.isConfirmed) {
                        // change name
                        // data update to element at preConfirm
                        // Swal.fire('Saved!', '', 'success');
                    } else if (result.isDenied) {
                        // use file exist
                        clsThis.resetValeInputFile();
                        clsThis.setIdFile(existData['id']);
                        clsThis.setFileNameUploaded(existData['file_name'], existData['file_size']);
                    } else {
                        // cancel
                        clsThis.resetValeInputFile();
                        clsThis.setIdFile(null);
                        clsThis.setFileNameUploaded(null);
                    }
                    WindowControl.hideLoadingButton($(btnMainEle));
                })
            } else {
                if ($.fn.isDebug() === true) console.log(errs);
                clsThis.resetValeInputFile();
                WindowControl.hideLoadingButton($(btnMainEle));
            }
        },);
    }

    showErrsUploadFile(inputNewFileName$) {
        $(inputNewFileName$).addClass('is-invalid');
        let groupNewFileEle = $(inputNewFileName$).closest('.input-group').parent();
        let textErrs = groupNewFileEle.find('.file-errs');
        if (textErrs.length > 0) textErrs.text(`File name is exist`); else groupNewFileEle.append(`<small class="file-errs form-text text-danger">File name is exist</small>`);
    }
}

class ListeningEventController {
    switchCompany() {
        const btnSwitch$ = $('#btn-call-switch-company');
        $('#switchMyCompany').on('show.bs.modal', function (){
            if ($(this).attr('data-loaded') !== 'true'){
                $(this).attr('data-loaded', 'true');
                $.fn.callAjax2({
                    url: $(btnSwitch$).attr('data-url'),
                    isLoading: true,
                }).then((resp) => {
                    const data = $.fn.switcherResp(resp);
                    if (data){
                        const companyList = data?.['company_list'] || [];
                        const body$ = $('#body-call-switch-company');
                        if (Array.isArray(companyList) && companyList.length > 0){
                            companyList.map(
                                item => {
                                    let logo = '';
                                    if (item.logo) logo = `
                                    <img
                                        class="brand-img img-fluid" src="${item.logo}" alt="brand"
                                        style="height: 3rem; margin: 0 1rem;"
                                    >
                                `;
                                    body$.append(`
                                    <div class="company_switch_item p-3">
                                        <div class="form-check d-flex align-items-center">
                                            <input
                                                id="company_switch_id_${item.id}"
                                                name="switch_current_company"
                                                class="form-check-input"
                                                value="${item.id}"
                                                type="radio"
                                                ${item?.['is_current'] === true ? 'checked' : ''}
                                            >
                                            <label
                                                    class="form-check-label ${item?.['is_current'] === true ? 'text-success' : ''}"
                                                    for="company_switch_id_${item.id}"
                                            >
                                                ${logo}
                                                ${item.code} - ${item.title}
                                            </label>
                                        </div>
                                    </div>
                                `)
                                }
                            )
                            ListeningEventController.listenImageLoad(body$.find('img'));
                            $('.company_switch_item').on('click', function (){
                                const inp$ = $(this).find('input[name="switch_current_company"]');
                                if (inp$.length > 0){
                                    inp$.prop("checked", true).trigger('change');
                                }
                            })
                        }
                    }
                });
            }
        })
        btnSwitch$.click(function () {
            let current_company_id = $('#company-current-id').attr('data-id');
            let company_id_selected = $("input[name='switch_current_company']:checked").val();
            if (current_company_id !== company_id_selected) {
                $.fn.callAjax2({
                    url: $(btnSwitch$).attr('data-url'),
                    method: 'PUT',
                    isLoading: true,
                    data: {
                        'company': company_id_selected
                    },
                }).then((resp) => {
                    $.fn.notifyB({
                        'description': resp.data.detail
                    }, 'success');
                    setTimeout(() => {
                        window.location.href = '/';
                    }, 1200);
                });
            } else $('#switchMyCompany').modal('toggle');
        });
    }

    selectELe() {
        // Listen event select and select2-init-v1 for set previous selected data
        $(document).on('focus', 'select', function () {
            $(this).data('previousValue', $(this).val());
        })
        $(document).on('click', '.select2-init-v1', function () {
            if (!$(this).attr('data-ajax-loaded')) {
                $(this).attr('data-ajax-loaded', true);

                let urlData = $(this).attr('data-url') + '?' + $(this).attr('data-params');
                let keyResult = $(this).attr('data-result-key');
                $(this).append(`<option class="x-item-loading" value="x-item-loading" disabled>` + $.fn.transEle.attr('data-loading') + '...' + `</option>`);
                $.fn.callAjax2({
                    url: urlData,
                    method: 'GET',
                }).then((resp) => {
                    let data = $.fn.switcherResp(resp);
                    if (data && typeof data === 'object' && data.hasOwnProperty(keyResult)) {
                        let selectedVal = $(this).find(":selected").val();
                        let dataList = data?.[keyResult];
                        $.map(dataList, (item) => {
                            if (!selectedVal || (selectedVal && item.id !== selectedVal)) $(this).append(`<option value="${item.id}">${item.title}</option>`);
                        });
                        if (!selectedVal) {
                            $(this).find('option.x-item-loading').text("").attr('disable', 'disable').attr('selected', 'selected');
                        } else {
                            $(this).find('option.x-item-loading').attr('disable', 'disable').remove();
                        }
                    }
                });
            }
        });
        // -- Listen event select and select2-init-v1 for set previous selected data
        $(".select2").each(function () {
            $(this).initSelect2();
        });
    }

    formSubmitEle() {
        // button event submit form (last click)
        $(document).on('click', "[type='submit']", function (event) {
            DocumentControl.setBtnIDLastSubmit($(this).attr('id'));
        });
        // Submit support on listen from button
        $('.btn_support_submit').click(function (e) {
            let frm_id = $(this).attr('data-form-id');
            if (frm_id) {
                $('#' + frm_id).submit();
            }
        });
        // submit form from Page Actions
        //      - push status input to form when form create
        //      - update value of input status when submit
        $('.btn-saving-form').each(function (event) {
            let defaultStatus = ["0", "1"];
            let frm_idx = $(this).attr('form');
            let status_system = $(this).attr('data-status-submit');

            let allowNextStep = !!(
                $(this).attr('type') === 'submit'
                && frm_idx && typeof frm_idx === 'string' && frm_idx.length > 0
                && status_system && typeof status_system === "string" && status_system.length === 1
                && defaultStatus.indexOf(status_system) !== -1
            );
            if (allowNextStep === true) {
                let frmEle = $('#' + frm_idx);
                if (frmEle.length > 0) {
                    // setup input status
                    let statusInputEle = $(
                        `
                            <input 
                                name="system_status" 
                                class="hidden" 
                                type="text" 
                                id="idx-system_status" 
                                value=""
                                ${frmEle.attr('data-method').toUpperCase() === 'PUT' ? "" : "required"} 
                            />
                        `
                    );

                    // Attach click event listener to submit buttons
                    $(document).find('button[type="submit"], input[type="submit"]').on('click', function () {
                        DocumentControl.setBtnLastSubmit($(this));
                    });

                    $(document).find('button[type="submit"], input[type="submit"]').on('click', function () {
                        DocumentControl.setBtnIDLastSubmit($(this).attr('id'));
                    });

                    // append input status if not exist
                    if (frmEle.find('input[name="system_status"]').length === 0) frmEle.append(statusInputEle);
                    else statusInputEle = frmEle.find('input[name="system_status"]');

                    // on submit push status to form
                    $(frmEle).on('submit', function (event) {
                        // let submitterEle = $(event.originalEvent.submitter);
                        let submitterEle = DocumentControl.getBtnLastSubmit();
                        if (submitterEle && submitterEle.length > 0) {
                            let systemStatus = submitterEle.attr('data-status-submit');
                            let statusCode = statusInputEle.val();
                            if (statusCode === "" || statusCode === null || statusCode === undefined || statusCode === '0' || statusCode === 0) {
                                statusInputEle.val(Number.parseInt(systemStatus));
                            } else if (
                                (statusCode === '0' || statusCode === 0)
                                && (systemStatus === '1' || systemStatus === 1)
                            ) {
                                event.preventDefault();
                                return false;
                            }
                        } else {
                            // get submitter is undefined! => deny next step!
                            event.preventDefault();
                            return false;
                        }
                    });
                }
            }
        })
    }

    formInputClickOpenEdit() {
        DocumentControl.formDetailToUpdateAction();
    }

    nttDrawer() {
        // Active drawer
        $('.ntt-drawer-toggle-link').each(function () {
            if ($(this).attr('data-drawer-active') === "true") {
                $(this).trigger('click');
            }
        });
        // -- Active drawer
    }

    actionWFInHeader() {
        $('.btn-action-wf').click(function (event) {
            event.preventDefault();
            return WFRTControl.callActionWF($(this))
        });
        // Edit in Zone at DocDetail Page
        $('#btn-active-edit-zone-wf').click(function (event) {
            event.preventDefault();
            $(this).addClass('hidden');
            WFRTControl.activeZoneInDoc();
        })
        // -- Edit in Zone at DocDetail Page
    }

    log() {
        // Action support Workflow in Doc Detail
        $(document).on('click', '.btn-log-act-more', function (event) {
            event.preventDefault();
            $(this).closest('p').next('.log-act-data-change').toggleClass('hidden');
        })
        $('#btnLogShow').click(function (event) {
            event.preventDefault();
            new LogController().getDataLogAndActivities();
        });
        // -- Action support Workflow in Doc Detail
    }

    maskMoney() {
        $(document).on('focus', 'input.mask-money', function () {
            return MaskMoney2.focusInputMoney($(this));
        });
        $(document).on('blur', 'input.mask-money', function () {
            return MaskMoney2.blurInputMoney($(this));
        });
        $(document).on('input', 'input.mask-money', function () {
            return MaskMoney2.realtimeInputMoney($(this));
        });
        $.fn.initMaskMoney2();
    }

    ticket() {
        $('#ticket-hash-tag').select2({
            tags: true,
            tokenSeparators: [',', ' ']
        });
        const modal$ = $('#modalRaiseTicket');
        modal$.on('shown.bs.modal', function () {
            $('#ticket-email').val($('#email-request-owner').text());
            $('#ticket-email-auto').val($('#email-request-owner').text());
            $('#ticket-location-raise').val(window.location);
            $('#ticket-location-raise-auto').val(window.location);
        });

        $("#ticket-attachments").change(function () {
            let previewContainer = $("#ticket-attachment-preview");
            previewContainer.empty();

            if (this.files) {
                let filesAmount = this.files.length;
                for (let i = 0; i < filesAmount; i++) {
                    let reader = new FileReader();
                    reader.onload = function (event) {
                        let imgElement = $("<img>");
                        imgElement.attr("src", event.target.result);
                        imgElement.css({
                            "max-width": "100px",
                            "max-height": "100px"
                        });
                        previewContainer.append(imgElement);
                    };
                    reader.readAsDataURL(this.files[i]);
                }
            }
        });

        let ticketFrm = $('#frm-send-a-ticket');

        SetupFormSubmit.validate(
            ticketFrm,
            {
                submitHandler: function (form, event){
                    event.preventDefault();

                    let formData = new FormData(form[0]);
                    formData.append("attachments", document.getElementById('ticket-attachments').files);

                    WindowControl.showLoading();
                    $.ajax({
                        url: $(form).data('url'), // point to server-side URL
                        type: $(form).data('method'),
                        dataType: 'json', // what to expect back from server
                        cache: false,
                        contentType: false,
                        processData: false, //data: {'data': form_data, 'csrfmiddlewaretoken': csrf_token},
                        data: formData,
                        success: function (resp) { // display success response
                            let data = $.fn.switcherResp(resp)
                            ticketFrm.find('input').attr('readonly', 'readonly');
                            ticketFrm.find('textarea').attr('readonly', 'readonly');
                            $('#staticTicketResp').val(data?.ticket?.code).closest('.form-group').removeClass('hidden');
                            const link$ = modal$.find('.link-ticket-detail');
                            link$.attr('href', link$.attr('href').replaceAll('__code__', data?.ticket?.code));
                            $.fn.notifyB({
                                'description': $.fn.gettext('Successful'),
                            }, 'success')
                            WindowControl.hideLoading();
                        },
                        error: function (response) {
                            $.fn.notifyB({
                                'description': $.fn.gettext('Failed'),
                            }, 'failure');
                            WindowControl.hideLoading();
                        }
                    });
                },
            }
        )
    }

    dataTable() {
        $(document).find('table').each((idx, tbl) => {
            if (!$(tbl).attr('load-data-hide-spinner')) {
                $(tbl).on('preXhr.dt', (e, settings, data) => {
                    // show loading full page
                    // WindowControl.showLoading();

                    // show loading tbody table
                    WindowControl.showLoadingWaitResponse($(tbl).find('tbody'));
                    // $x.fn.showLoadingPage();
                });
                $(tbl).on('draw.dt', () => {
                    // hide loading full page
                    // WindowControl.hideLoading();

                    // hide loading tbody table
                    WindowControl.hideLoadingWaitResponse($(tbl).find('tbody'));
                    // $x.fn.hideLoadingPage();
                });
            }
        });
    }

    navAndMenu() {
        $('.hk-navbar-togglable').click(function (event) {
            $(this).find('.icon').children().toggleClass('d-none');
        });

        DocumentControl.change_space();

        DocumentControl.menu_handler();
    }

    activeFileUpload() {
        $(document).on('click', '.show-raise-ticket', function () {
            Swal.close();
            let idBtnRaiseTicket = 'btnRaiseTicketInSWALFire';
            let eleBtnRaiseTicket = $('#' + idBtnRaiseTicket);
            if (eleBtnRaiseTicket.length > 0) {
                eleBtnRaiseTicket.click();
            } else {
                let btn = $(`<button data-bs-toggle="modal" data-bs-target="#modalRaiseTicket" id="${idBtnRaiseTicket}"></button>`);
                DocumentControl.getElePageContent().append(btn);
                btn.click();
            }
        });

        $(document).on('click', '.btn-file-upload', function (event) {
            let idInputText = $(this).attr(FileUtils.keyInputTextID);
            let idInputFile = $(this).attr(FileUtils.keyInputFileID);

            if (idInputFile && idInputFile) {
                let eleInputText = $(idInputText);
                let eleInputFile = $(idInputFile);

                if (eleInputText.length > 0 && eleInputFile.length > 0) return eleInputFile.click();

                Swal.fire({
                    icon: 'error',
                    title: 'Oops...',
                    text: 'File upload went wrong!',
                    footer: '<a href="#" class="show-raise-ticket">Raise a ticket?</a>'
                })
                if ($.fn.isDebug() === true) throw Error('Upload file must be required setup attribute');
            }

            Swal.fire({
                icon: 'error',
                title: 'Oops...',
                text: 'File upload went wrong!',
                footer: '<a href="#" class="show-raise-ticket">Raise a ticket?</a>'
            })
            if ($.fn.isDebug() === true) throw Error('Upload file must be required setup attribute');
        });

        $(document).on('change', `.${FileUtils.clsNameInputFile}`, function (event) {
            let btnMain = $(this).siblings('button.' + FileUtils.clsButtonMain);
            if (btnMain.length > 0) {
                WindowControl.showLoadingButton($(btnMain));
                let file = event.target.files[0];
                if (FileUtils.checkMaxFileSize(file.size) === true && FileUtils.checkTypeAccept(file, $(this).attr('accept')) === true) {
                    let query = `[${FileUtils.keyInputFileID}="#${$(this).attr('id')}"]`;
                    let mainEle = $(query);
                    if (mainEle.length > 0) {
                        new FileUtils(mainEle).callUploadFile(file, btnMain);
                    } else {
                        Swal.fire({
                            icon: 'error',
                            title: 'Oops...',
                            text: 'Not found main element include file went wrong!',
                            footer: '<a href="#" class="show-raise-ticket">Raise a ticket?</a>'
                        });
                        if ($.fn.isDebug() === true) throw Error('Not found main element include file went wrong!');
                        WindowControl.hideLoadingButton($(btnMain));
                    }
                } else {
                    WindowControl.hideLoadingButton($(btnMain));
                }
            }
        });

        FileUtils.init();
    }

    static tabHashUrl__parent_active(currentEle) {
        $(currentEle).closest('.nav-tabs a[data-bs-toggle="tab"]').each(function () {
            if ($(this).length > 0) {
                let drawerEle = $(this).closest('.ntt-drawer');
                if (drawerEle.length > 0) {
                    $('.ntt-drawer-toggle-link[data-drawer-target="#' + drawerEle.attr('id') + '"]').each(function () {
                        $(this).trigger('click');
                    });
                }
                $(this).tab('show');
                ListeningEventController.tabHashUrl__parent_active($(this).parent());
            }
        })
    }

    tabHashUrl() {
        $(`
            .nav.nav-tabs a[data-bs-toggle="tab"],
            .nav.flex-column a[data-bs-toggle="tab"]
        `).filter(function () {
            return this.hash === location.hash;
        }).each(function () {
            if ($(this).length > 0) {
                let drawerEle = $(this).closest('.ntt-drawer');
                if (drawerEle.length > 0) {
                    $('.ntt-drawer-toggle-link[data-drawer-target="#' + drawerEle.attr('id') + '"]').each(function () {
                        $(this).trigger('click');
                    });
                }
                $(this).tab('show');
                ListeningEventController.tabHashUrl__parent_active($(this).parent());
            }
        });

        $('a[data-bs-toggle="tab"]').on('shown.bs.tab', function (e) {
            if ($(this).data('push-tab')){
                window.history.pushState(null, null, $(e.target).attr("href"));
            }
            // if ($(this).data('not-push-tab') === null || $(this).data('not-push-tab') === undefined) {
            //     window.history.pushState(null, null, $(e.target).attr("href"));
            // }
        });
    }

    setValidatorDefaults() {
        $.validator.setDefaults({
            focusInvalid: true,
            validClass: "is-valid",
            errorClass: "is-invalid",
            errorElement: "small",
            errorPlacement: function (error, element) {
                element.closest('.form-group').append(error);
                // error.insertAfter(element);
                error.css({
                    'color': "red",
                })
            }
        });
    }

    dropdownInAccordion() {
        $('body').on('show.bs.dropdown', '.info-btn-more', function () {
            // add class for accordion show dropdown
            let accorItemEle = $(this).closest('.accordion-item');
            if (accorItemEle.length > 0) {
                accorItemEle.addClass('overflow-unset');
            }
            // check ID to link detail - Yes: show link | No: hide link
            let linkEle = $(this).parent().find('.link-detail-more');
            if (linkEle.length > 0) $(this).attr('data-id') ? linkEle.removeClass('hidden') : linkEle.addClass('hidden');
        }).on('hidden.bs.dropdown', '.info-btn-more', function () {
            // rollback to original for accordion
            let accorItemEle = $(this).closest('.accordion-item');
            if (accorItemEle.length > 0 && accorItemEle.find('.info-btn-more.show').length === 0) {
                accorItemEle.removeClass('overflow-unset');
            }
        })
    }

    static listenImageLoad(imgEle = null, opts = {}) {
        function resolve_title_tooltip(_ele) {
            let parentTxt = '';
            if ($(_ele).parent().attr('data-toggle') === 'tooltip' || $(_ele).parent().attr('data-bs-toggle') === 'tooltip') {
                parentTxt = $(_ele).parent().attr('title');
            }
            return `${parentTxt ? parentTxt + "." : ""} ${$.fn.gettext("This image encountered an error during loading or does not exist")}`
        }

        let imgReplace = opts?.['imgReplace'] || globeFileNotFoundImg;
        (
            imgEle ? imgEle : $('img')
        ).each(function () {
            if ($(this)[0].complete === true && $(this)[0].naturalWidth === 0 && $(this)[0].naturalHeight === 0) {
                $(this).attr('data-old-src', $(this).attr('src'));
                $(this).attr('src', imgReplace);
                $(this).attr('data-toggle', 'tooltip');
                $(this).attr('title', resolve_title_tooltip($(this)));
                $(this).tooltip();
            }

            $(this).on('error', function () {
                $(this).attr('data-old-src', $(this).attr('src'));
                $(this).attr('data-toggle', 'tooltip');
                $(this).attr('title', resolve_title_tooltip($(this)));
                $(this).attr('src', imgReplace);
                $(this).addClass('img-filter-opacity-50');
            });
        })
    }

    formatEle() {
        // Listen event on element and format to right type (number, code,...)
        $(document).on('input', '.valid-num', function () {
            let value = this.value;
            // Replace non-digit characters with an empty string
            value = value.replace(/[^0-9.]/g, '');
            // Remove unnecessary zeros from the integer part
            value = value.replace("-", "").replace(/^0+(?=\d)/, '');
            // Update value of input
            this.value = value;
            return true;
        })
    }

    // main
    active() {
        this.switchCompany();
        this.selectELe();
        this.formSubmitEle();
        this.formInputClickOpenEdit();
        this.nttDrawer();
        this.actionWFInHeader();
        this.log();
        this.maskMoney();
        this.ticket();
        this.dataTable();
        this.navAndMenu();
        this.activeFileUpload();
        this.tabHashUrl();  // keep it run after nttDrawer and log
        this.setValidatorDefaults();
        this.dropdownInAccordion();
        this.formatEle();
        ListeningEventController.listenImageLoad();
        MaskMoney2.initCurrencyExchange();
    }
}

class WFRTControl {
    // Handle every thing about Workflow Runtime

    static appendBodyCheckWFTask(method, reqBodyData, url) {
        // handle body data before send
        // if BtnIdLastSubmit = 'idxSaveInZoneWF' => is update data in zones
        // check WF ID, task ID, url exist PK
        // False: return data input
        // True: convert body data with Zone Accept
        let pk = $.fn.getPkDetail();
        let btnIDLastSubmit = DocumentControl.getBtnIDLastSubmit();
        let IDRuntime = WFRTControl.getRuntimeWF();
        if (IDRuntime
            && WFRTControl.getWFRuntimeID() && WFRTControl.getTaskWF() && pk && url.includes(pk) && method.toLowerCase() === 'put') {
            let taskID = WFRTControl.getTaskWF();
            let isEditAllZone = WFRTControl.getIsEditAllZone();
            if (isEditAllZone === 'true') {
                reqBodyData['task_id'] = taskID;
                return reqBodyData;
            }
            let keyOk = WFRTControl.getZoneKeyData();
            let keyOkRelated = WFRTControl.getZoneKeyRelatedData();
            let newData = {};
            for (let key in reqBodyData) {
                if (keyOk.includes(key)) {
                    newData[key] = reqBodyData[key];
                }
                if (keyOkRelated.includes(key)) {
                    newData[key] = reqBodyData[key];
                }
            }
            newData['task_id'] = taskID;
            reqBodyData = newData;
        }
        return reqBodyData;
    }

    static callActionWF(ele$) {
        // -- wf call action
        let actionSelected = $(ele$).attr('data-value');
        let taskID = $('#idxGroupAction').attr('data-wf-task-id');
        let runtimeID = WFRTControl.getRuntimeWF();
        let urlBase = globeTaskDetail;
        let urlRTAfterBase = globeRuntimeAfterFinishDetail;
        let dataSuccessReload = $(ele$).attr('data-success-reload');
        let dataCR = $(ele$).attr('data-cr');
        let dataSubmit = {'action': actionSelected};
        if (dataCR) {
            dataSubmit['data_cr'] = JSON.parse(dataCR)
        }
        let urlRedirect = ele$.attr('data-url-redirect');
        if (actionSelected !== undefined && taskID && urlBase) {
            if (actionSelected === '1') {  // Approve: check if next node is out form need select person before submit
                return WFRTControl.callActionApprove(urlBase, taskID, dataSubmit, dataSuccessReload, urlRedirect);
            } else if (actionSelected === '2') {  // Reject: check if remark before submit
                return WFRTControl.callActionRejectReturn(urlBase, taskID, dataSubmit, dataSuccessReload);
            } else if (actionSelected === '3') {  // Return: check if remark before submit
                return WFRTControl.callActionRejectReturn(urlBase, taskID, dataSubmit, dataSuccessReload);
            } else if (actionSelected === '4') {  // Receive: check if next node is out form need select person before submit
                return WFRTControl.callActionApprove(urlBase, taskID, dataSubmit, dataSuccessReload, urlRedirect);
            } else {
                return WFRTControl.callAjaxActionWF(urlBase, taskID, dataSubmit, dataSuccessReload);
            }
        }
        if (actionSelected !== undefined && urlRTAfterBase) {
            if (actionSelected === '1') {  // open change request page
                return WFRTControl.callAjaxOpenCRAfterFinish(urlRTAfterBase, runtimeID, dataSubmit, dataSuccessReload);
            }
            if (actionSelected === '2') {  // cancel after finished
                return WFRTControl.callAjaxActionWFAfterFinish(urlRTAfterBase, runtimeID, dataSubmit, dataSuccessReload);
            }
            if (actionSelected === '3') {  // save change request
                if (dataSubmit.hasOwnProperty('data_cr')) {
                    return WFRTControl.callAjaxActionWFAfterFinish(urlRTAfterBase, runtimeID, dataSubmit, dataSuccessReload);
                }
                return true;
            }
            if (actionSelected === '4') {  // cancel change request
                WindowControl.showLoading();
                setTimeout(function () {
                    // Redirect to the previous page
                    let urlBack = window.location.href.replace('update', 'detail');
                    window.location.replace(urlBack);
                }, 1000);
            }
        }
    }

    static callAjaxActionWF(urlBase, taskID, dataSubmit, dataSuccessReload, urlRedirect = null) {
        let urlData = SetupFormSubmit.getUrlDetailWithID(urlBase, taskID);
        WindowControl.showLoading();
        return $.fn.callAjax2({
            'url': urlData,
            'method': 'PUT',
            'data': dataSubmit,
        }).then((resp) => {
            let data = $.fn.switcherResp(resp);
            if (data?.['status'] === 200) {
                $.fn.notifyB({
                    'description': $.fn.transEle.attr('data-action-wf') + ': ' + $.fn.transEle.attr('data-success'),
                }, 'success');
                if (!(dataSuccessReload === 'false' || dataSuccessReload === false)) {
                    setTimeout(() => {
                        if (!urlRedirect) {
                            window.location.reload()
                        } else {
                            window.location.replace(urlRedirect);
                        }
                    }, 1000)
                }
            }
            setTimeout(() => {
                WindowControl.hideLoading();
                if (urlRedirect) {
                    window.location.replace(urlRedirect);
                }
            }, 1000)
        }, (errs) => {
            setTimeout(() => {
                WindowControl.hideLoading();
                if (urlRedirect) {
                    window.location.replace(urlRedirect);
                }
            }, 500)
        });
    }

    static callAjaxActionWFAfterFinish(urlBase, runtimeID, dataSubmit, dataSuccessReload, urlRedirect = null) {
        let urlData = SetupFormSubmit.getUrlDetailWithID(urlBase, runtimeID);
        Swal.fire({
            input: "textarea",
            inputLabel: $.fn.transEle.attr('data-reason-cancel'),
            inputPlaceholder: $.fn.transEle.attr('data-reason-type-here'),
            inputAttributes: {
                "aria-label": $.fn.transEle.attr('data-reason-type-here'),
                "maxlength": "255" // Set the maximum length attribute
            },
            allowOutsideClick: false,
            showConfirmButton: true,
            confirmButtonText: $.fn.transEle.attr('data-confirm'),
            showCancelButton: true,
            cancelButtonText: $.fn.transEle.attr('data-cancel'),
            inputValidator: (value) => {
                if (value.length > 255) {
                    return 'Maximum length exceeded (255 characters)';
                }
            },
        }).then((result) => {
            if (result.dismiss === Swal.DismissReason.timer || result.value) {
                dataSubmit['remark'] = result.value;
                Swal.fire({
                    title: $.fn.transEle.attr('data-msg-are-u-sure'),
                    text: $.fn.transEle.attr('data-warning-can-not-undo'),
                    icon: "warning",
                    allowOutsideClick: false,
                    showConfirmButton: true,
                    confirmButtonText: $.fn.transEle.attr('data-confirm'),
                    showCancelButton: true,
                    cancelButtonText: $.fn.transEle.attr('data-cancel'),
                }).then((result) => {
                    if (result.isConfirmed) {
                        WindowControl.showLoading();
                        return $.fn.callAjax2({
                            'url': urlData,
                            'method': 'PUT',
                            'data': dataSubmit,
                        }).then((resp) => {
                            let data = $.fn.switcherResp(resp);
                            if (data?.['status'] === 200) {
                                $.fn.notifyB({
                                    'description': $.fn.transEle.attr('data-action-wf') + ': ' + $.fn.transEle.attr('data-success'),
                                }, 'success');
                                if (!(dataSuccessReload === 'false' || dataSuccessReload === false)) {
                                    setTimeout(() => {
                                        if (!urlRedirect) {
                                            window.location.reload()
                                        } else {
                                            window.location.replace(urlRedirect);
                                        }
                                    }, 1000)
                                }
                            }
                            setTimeout(() => {
                                WindowControl.hideLoading();
                                if (urlRedirect) {
                                    window.location.replace(urlRedirect);
                                }
                            }, 1000)
                        }, (err) => {
                            setTimeout(() => {
                                WindowControl.hideLoading();
                            }, 1000)
                            $.fn.notifyB({description: err?.data?.errors || err?.message}, 'failure');
                        });
                    }
                })
            }
        });
    }

    static callAjaxOpenCRAfterFinish(urlBase, runtimeID, dataSubmit, dataSuccessReload, urlRedirect = null) {
        let urlData = SetupFormSubmit.getUrlDetailWithID(urlBase, runtimeID);
        WindowControl.showLoading();
        return $.fn.callAjax2({
            'url': urlData,
            'method': 'PUT',
            'data': dataSubmit,
        }).then((resp) => {
            let data = $.fn.switcherResp(resp);
            if (data?.['status'] === 200) {
                if (!(dataSuccessReload === 'false' || dataSuccessReload === false)) {
                    setTimeout(() => {
                        $('#btn-enable-edit').click();
                    }, 1000)
                }
            }
            setTimeout(() => {
                WindowControl.hideLoading();
                if (urlRedirect) {
                    window.location.replace(urlRedirect);
                }
            }, 1000)
        }, (err) => {
            setTimeout(() => {
                WindowControl.hideLoading();
            }, 1000)
            $.fn.notifyB({description: err?.data?.errors || err?.message}, 'failure');
        });
    }

    static callActionRejectReturn(urlBase, taskID, dataSubmit, dataSuccessReload) {
        let label = $.fn.transEle.attr('data-reason-reject');
        if (dataSubmit?.['action'] === '3') {
            label = $.fn.transEle.attr('data-reason-return');
        }
        Swal.fire({
            input: "textarea",
            inputLabel: label,
            inputPlaceholder: $.fn.transEle.attr('data-reason-type-here'),
            inputAttributes: {
                "aria-label": $.fn.transEle.attr('data-reason-type-here'),
                "maxlength": "255" // Set the maximum length attribute
            },
            allowOutsideClick: false,
            showConfirmButton: true,
            confirmButtonText: $.fn.transEle.attr('data-confirm'),
            showCancelButton: true,
            cancelButtonText: $.fn.transEle.attr('data-cancel'),
            inputValidator: (value) => {
                if (value.length > 255) {
                    return 'Maximum length exceeded (255 characters)';
                }
            },
        }).then((result) => {
            if (result.dismiss === Swal.DismissReason.timer || result.value) {
                dataSubmit['remark'] = result.value;
                return WFRTControl.callAjaxActionWF(urlBase, taskID, dataSubmit, dataSuccessReload);
            } else {
                $.fn.notifyB({description: "remark is required"}, 'failure');
                return false;
            }
        });
    }

    static callActionApprove(urlBase, taskID, dataSubmit, dataSuccessReload, urlRedirect) {
        let dataRTConfig = {
            'urlBase': urlBase, 'taskID': taskID, 'dataSuccessReload': dataSuccessReload, 'urlRedirect': urlRedirect
        }
        // check next node
        let associationData = WFAssociateControl.checkNextNode(WFRTControl.getRuntimeDocData());
        WFRTControl.submitCheckAssociation(dataSubmit, associationData, 1, dataRTConfig);
    }

    static callWFSubmitForm(_form) {
        let appID = WFRTControl.getAppID();
        let appBaseline = WFRTControl.getAppBaseline();
        let $formEle = _form.formSelected;
        let IDRuntime = WFRTControl.getRuntimeWF();
        let currentEmployee = $x.fn.getEmployeeCurrentID();
        let docData = WFRTControl.getRuntimeDocData();
        if ($formEle.length > 0) {
            // check currency
            let dataCurrency = MaskMoney2.setupSubmitCurrencyExchange();
            if (Object.keys(dataCurrency).length !== 0) {
                _form.dataForm['is_currency_exchange'] = dataCurrency?.['is_currency_exchange'];
                _form.dataForm['currency_company_id'] = dataCurrency?.['currency_company_id'];
                _form.dataForm['currency_company_data'] = dataCurrency?.['currency_company_data'];
                _form.dataForm['currency_exchange_id'] = dataCurrency?.['currency_exchange_id'];
                _form.dataForm['currency_exchange_data'] = dataCurrency?.['currency_exchange_data'];
                _form.dataForm['currency_exchange_rate'] = dataCurrency?.['currency_exchange_rate'];
            }
            // check submit CR
            if (docData?.['system_status'] === 3 && docData?.['employee_inherit']?.['id'] === currentEmployee && docData?.['code'] && _form.dataMethod.toLowerCase() === 'put') {
                let docRootID = docData?.['document_root_id'];
                let docChangeOrder = docData?.['document_change_order'] + 1;
                let code = docData?.['code'];
                if (docRootID) {
                    _form.dataMethod = 'POST';
                    _form.dataUrl = $formEle.attr('data-url-cr');
                    _form.dataForm['code'] = code;
                    _form.dataForm['system_status'] = 1;
                    _form.dataForm['is_change'] = true;
                    _form.dataForm['document_root_id'] = docRootID;
                    _form.dataForm['document_change_order'] = docChangeOrder;
                    // check next node
                    let associationData = WFAssociateControl.checkNextNode(_form.dataForm);
                    // select cancel/confirm change
                    Swal.fire({
                        title: $.fn.transEle.attr('data-msg-are-u-sure'),
                        text: $.fn.transEle.attr('data-warning-can-not-undo'),
                        icon: "warning",
                        allowOutsideClick: false,
                        showConfirmButton: true,
                        confirmButtonText: $.fn.transEle.attr('data-confirm'),
                        showCancelButton: true,
                        cancelButtonText: $.fn.transEle.attr('data-cancel'),
                    }).then((result) => {
                        if (result.isConfirmed) {
                            WFRTControl.submitCheckAssociation(_form, associationData, 0);
                        }
                    })
                }
                return true;
            }
            if (!IDRuntime) {  // Start run WF (@decorator_run_workflow in API)
                // check next node
                let associationData = WFAssociateControl.checkNextNode(_form.dataForm);
                // check baseline app
                if (appBaseline.includes(appID) && _form.dataMethod.toLowerCase() === 'post') {
                    _form.dataForm['system_status'] = 0;
                    WFRTControl.callAjaxWFCreate(_form);
                    return true;
                }
                // select save status before select collaborator
                Swal.fire({
                    title: $.fn.transEle.attr('data-select-save-status'),
                    html: String(WFRTControl.setupHTMLDraftOrWF()),
                    allowOutsideClick: false,
                    showConfirmButton: true,
                    confirmButtonText: $.fn.transEle.attr('data-confirm'),
                    showCancelButton: true,
                    cancelButtonText: $.fn.transEle.attr('data-cancel'),
                    didOpen: () => {
                        // Add event listener for click events on the group
                        document.querySelectorAll('.group-checkbox-save-status').forEach((checkboxGr) => {
                            checkboxGr.addEventListener('click', function () {
                                // Mark the child radio button as checked
                                let radio = this.querySelector('.checkbox-save-status');
                                if (radio) {
                                    radio.checked = true; // Automatically unchecks other radios in the group
                                }
                            });
                        });
                    }
                }).then((result) => {
                    if (result.dismiss === Swal.DismissReason.timer || result.value) {
                        let eleChecked = document.querySelector('.checkbox-save-status:checked');
                        if (eleChecked) {
                            let saveStatus = eleChecked.getAttribute('data-status');
                            if (saveStatus) {
                                _form.dataForm['system_status'] = parseInt(saveStatus);
                                if (_form.dataForm['system_status'] === 0) {  // draft
                                    WFRTControl.callAjaxWFCreate(_form);
                                }
                                if (_form.dataForm['system_status'] === 1) {  // WF

                                    // check submit baseline
                                    if (appBaseline.includes(appID)) {
                                        _form.dataForm['system_status'] = 0;
                                        _form.dataForm['run_baseline'] = true;
                                    }

                                    WFRTControl.submitCheckAssociation(_form, associationData, 0);
                                }
                            }
                        } else {
                            $.fn.notifyB({description: $.fn.transEle.attr('data-need-one-option')}, 'failure');
                            return false;
                        }
                    }
                });
            }
            if (IDRuntime) { // Already in WF, update zones
                _form.dataForm['system_status'] = 1;
                WFRTControl.callAjaxWFUpdate(_form);
            }
        }
    }

    static callAjaxWFCreate(_form) {
        WindowControl.showLoading({'loadingTitleAction': _form.dataMethod.toLowerCase() === 'post' ? 'CREATE' : 'UPDATE'});
        $.fn.callAjax2(
            {
                'url': _form.dataUrl,
                'method': _form.dataMethod,
                'data': _form.dataForm,
            }
        ).then(
            (resp) => {
                let data = $.fn.switcherResp(resp);
                if (data && (data['status'] === 201 || data['status'] === 200)) {
                    $.fn.notifyB({description: data.message}, 'success');
                    if (_form?.resetForm) $(_form.formElm)[0].reset()

                    // check submit baseline
                    let $formEle = _form.formSelected;
                    let docData = WFRTControl.getRuntimeDocData();
                    let associationData = WFAssociateControl.checkNextNode(_form.dataForm);
                    if (_form.dataForm?.['run_baseline'] === true && docData?.['id']) {
                        let docRootID = docData?.['id'];
                        _form.dataMethod = 'POST';
                        _form.dataUrl = $formEle.attr('data-url-cr');
                        _form.dataForm['document_root_id'] = docRootID;
                        _form.dataForm['system_status'] = 1;
                        WFRTControl.submitCheckAssociation(_form, associationData, 0);
                        _form.dataForm['run_baseline'] = false;
                    }

                    setTimeout(() => {
                        window.location.replace(_form.dataUrlRedirect);
                    }, 2000);
                }
            }, (err) => {
                setTimeout(() => {
                    WindowControl.hideLoading();
                }, 1000)
                $.fn.notifyB({description: err?.data?.errors || err?.message}, 'failure');
            }
        )
    }

    static callAjaxWFUpdate(_form) {
        WindowControl.showLoading({'loadingTitleAction': 'UPDATE'});
        $.fn.callAjax2(
            {
                'url': _form.dataUrl,
                'method': _form.dataMethod,
                'data': _form.dataForm,
                isLoading: true,
            }
        ).then(
            (resp) => {
                let data = $.fn.switcherResp(resp);
                if (data && (data['status'] === 201 || data['status'] === 200)) {
                    let btnIDLastSubmit = DocumentControl.getBtnIDLastSubmit();
                    if (btnIDLastSubmit === 'idxSaveInZoneWFThenNext') {
                        for (let btnWFEle of document.querySelectorAll('.btn-action-wf')) {
                            btnWFEle.setAttribute('data-url-redirect', _form.dataUrlRedirect);
                        }
                        let btnSubmit = $('#idxSaveInZoneWFThenNext');
                        let dataWFAction = btnSubmit.attr('data-wf-action');
                        if (btnSubmit && dataWFAction) {
                            let eleActionDoneTask = $('.btn-action-wf[data-value=' + dataWFAction + ']');
                            if (eleActionDoneTask.length > 0) {
                                DocumentControl.setBtnIDLastSubmit(null);
                                $(eleActionDoneTask[0]).attr('data-success-reload', false)
                                WFRTControl.callActionWF($(eleActionDoneTask[0]));
                            }
                        }
                    }
                    $.fn.notifyB({description: data.message}, 'success');
                    if (btnIDLastSubmit === 'idxSaveInZoneWF') {
                        setTimeout(() => {
                            window.location.replace(_form.dataUrlRedirect);
                        }, 1000);
                    }
                }
            }, (err) => {
                setTimeout(() => {
                    WindowControl.hideLoading();
                }, 1000)
                $.fn.notifyB({description: err?.data?.errors || err?.message}, 'failure');
            }
        )
    }

    static submitActionApprove(dataRTConfig, dataSubmit) {
        let urlBase = dataRTConfig?.['urlBase'];
        let taskID = dataRTConfig?.['taskID'];
        let dataSuccessReload = dataRTConfig?.['dataSuccessReload'];
        let urlRedirect = dataRTConfig?.['urlRedirect'];
        let collabOutForm = WFRTControl.getCollabOutFormData();
        if (collabOutForm && collabOutForm.length > 0) {
            Swal.fire({
                title: $.fn.transEle.attr('data-select-next-node-collab'),
                html: String(WFRTControl.setupHTMLSelectCollab(collabOutForm)),
                allowOutsideClick: false,
                showConfirmButton: true,
                confirmButtonText: $.fn.transEle.attr('data-confirm'),
                showCancelButton: true,
                cancelButtonText: $.fn.transEle.attr('data-cancel'),
                didOpen: () => {
                    // Attach click event listeners to each group container
                    document.querySelectorAll('.group-checkbox-next-node-collab').forEach((checkboxGr) => {
                        checkboxGr.addEventListener('click', function () {
                            // Find and mark the radio button inside this group as checked
                            let radio = this.querySelector('.checkbox-next-node-collab');
                            if (radio) {
                                radio.checked = true; // Automatically unchecks others in the group
                            }
                        });
                    });
                }
            }).then((result) => {
                if (result.dismiss === Swal.DismissReason.timer || result.value) {
                    let eleChecked = document.querySelector('.checkbox-next-node-collab:checked');
                    if (eleChecked) {
                        dataSubmit['next_node_collab_id'] = eleChecked.getAttribute('data-id');
                        return WFRTControl.callAjaxActionWF(urlBase, taskID, dataSubmit, dataSuccessReload, urlRedirect);
                    } else {
                        return "You need to select one person!";
                    }
                }
            });
        } else {
            return WFRTControl.callAjaxActionWF(urlBase, taskID, dataSubmit, dataSuccessReload, urlRedirect);
        }
    }

    static submitCheckAssociation(_form, associationData, submitType, dataRTConfig = {}) {
        let dataSubmit = {};
        let typeCheck = 0;  // 0: pass condition, 1: fail condition
        if (submitType === 0) {
            dataSubmit = _form.dataForm;
        }
        if (submitType === 1) {
            dataSubmit = _form;
        }
        if (associationData.hasOwnProperty('check') && associationData.hasOwnProperty('data')) {
            if (associationData?.['data'].length <= 0) {  // Not apply WF
                if (submitType === 0) {
                    WFRTControl.submitCheckCollabNextNode(_form);
                    return true;
                }
                if (submitType === 1) {
                    WFRTControl.submitActionApprove(dataRTConfig, dataSubmit);
                    return true;
                }
            }
            if (associationData?.['data'].length === 1) {
                if (associationData?.['check'] === true) {
                    dataSubmit['next_association_id'] = associationData?.['data'][0]?.['id'];
                    if (submitType === 0) {
                        WFRTControl.setCollabOFCreate(associationData?.['data'][0]?.['node_out']?.['collab_out_form']);
                        WFRTControl.submitCheckCollabNextNode(_form);
                        return true;
                    }
                    if (submitType === 1) {
                        WFRTControl.setCollabOFRuntime(associationData?.['data'][0]?.['node_out']?.['collab_out_form']);
                        WFRTControl.submitActionApprove(dataRTConfig, dataSubmit);
                        return true;
                    }
                }
                if (associationData?.['check'] === false) {
                    typeCheck = 1;
                }
            }
            if (associationData?.['data'].length > 1) {
                if (associationData?.['check'] === false) {
                    typeCheck = 1;
                }
            }
            // select association
            Swal.fire({
                title: $.fn.transEle.attr('data-select-association'),
                html: String(WFRTControl.setupHTMLSelectAssociation(associationData?.['data'], typeCheck)),
                allowOutsideClick: false,
                showConfirmButton: true,
                confirmButtonText: $.fn.transEle.attr('data-confirm'),
                showCancelButton: true,
                cancelButtonText: $.fn.transEle.attr('data-cancel'),
                didOpen: () => {
                    // Attach click event listeners to each group container
                    document.querySelectorAll('.group-checkbox-next-association').forEach((checkboxGr) => {
                        checkboxGr.addEventListener('click', function () {
                            // Find and mark the radio button inside this group as checked
                            let radio = this.querySelector('.checkbox-next-association');
                            if (radio) {
                                radio.checked = true; // Automatically unchecks others in the group
                            }
                        });
                    });
                }
            }).then((result) => {
                if (result.dismiss === Swal.DismissReason.timer || result.value) {
                    let eleChecked = document.querySelector('.checkbox-next-association:checked');
                    if (eleChecked) {
                        if (eleChecked.getAttribute('data-detail')) {
                            let association = JSON.parse(eleChecked.getAttribute('data-detail'));
                            dataSubmit['next_association_id'] = association?.['id'];
                            if (submitType === 0) {
                                WFRTControl.setCollabOFCreate(association?.['node_out']?.['collab_out_form']);
                                WFRTControl.submitCheckCollabNextNode(_form);
                                return true;
                            }
                            if (submitType === 1) {
                                WFRTControl.setCollabOFRuntime(association?.['node_out']?.['collab_out_form']);
                                WFRTControl.submitActionApprove(dataRTConfig, dataSubmit);
                                return true;
                            }
                        }
                    } else {
                        $.fn.notifyB({description: $.fn.transEle.attr('data-need-one-option')}, 'failure');
                        return false;
                    }
                }
            });
        } else {
            $.fn.notifyB({description: $.fn.transEle.attr('data-no-next-node')}, 'failure');
            return false;
        }
    }

    static submitCheckCollabNextNode(_form) {
        let collabOutForm = WFRTControl.getCollabOutFormData();
        // Have collaborator -> show select collaborator before submit
        if (collabOutForm && collabOutForm.length > 0) {
            if (_form.dataForm['system_status'] === 0) {
                WFRTControl.callAjaxWFCreate(_form);
            }
            if ([1, 3].includes(_form.dataForm['system_status'])) {
                Swal.fire({
                    title: $.fn.transEle.attr('data-select-next-node-collab'),
                    html: String(WFRTControl.setupHTMLSelectCollab(collabOutForm)),
                    allowOutsideClick: false,
                    showConfirmButton: true,
                    confirmButtonText: $.fn.transEle.attr('data-confirm'),
                    showCancelButton: true,
                    cancelButtonText: $.fn.transEle.attr('data-cancel'),
                    didOpen: () => {
                        // Attach click event listeners to each group container
                        document.querySelectorAll('.group-checkbox-next-node-collab').forEach((checkboxGr) => {
                            checkboxGr.addEventListener('click', function () {
                                // Find and mark the radio button inside this group as checked
                                let radio = this.querySelector('.checkbox-next-node-collab');
                                if (radio) {
                                    radio.checked = true; // Automatically unchecks others in the group
                                }
                            });
                        });
                    }
                }).then((result) => {
                    if (result.dismiss === Swal.DismissReason.timer || result.value) {
                        let eleChecked = document.querySelector('.checkbox-next-node-collab:checked');
                        if (eleChecked) {
                            _form.dataForm['next_node_collab_id'] = eleChecked.getAttribute('data-id');
                            _form.dataForm['system_status'] = 1;
                        } else {
                            return "You need to select one person!";
                        }
                        WFRTControl.callAjaxWFCreate(_form);
                    }
                });
            }
        } else {  // No collaborator -> original submit
            WFRTControl.callAjaxWFCreate(_form);
        }
    }

    static setupHTMLSelectAssociation(AssociationData, type) {
        let htmlCustom = ``;
        let commonTxt = $.fn.transEle.attr('data-select-association-type-1');
        let commonImg = `<i class="fas fa-check-circle text-green fs-5"></i>`;
        if (type === 1) {
            commonTxt = $.fn.transEle.attr('data-select-association-type-2');
            commonImg = `<i class="fas fa-exclamation-triangle text-red fs-5"></i>`;
        }
        htmlCustom += `<div class="d-flex mb-5">${commonImg}<span>${commonTxt}</span></div>`;
        for (let associate of AssociationData) {
            htmlCustom += `<div class="d-flex align-items-center justify-content-between group-checkbox-next-association">
                                <div class="form-check form-check-lg d-flex align-items-center">
                                    <input type="radio" name="next-association" class="form-check-input checkbox-next-association" id="associate-${associate?.['id'].replace(/-/g, "")}" data-detail="${JSON.stringify(associate).replace(/"/g, "&quot;")}">
                                    <label class="form-check-label mr-2" for="associate-${associate?.['id'].replace(/-/g, "")}">${associate?.['node_out']?.['title']}</label>
                                </div>
                            </div><hr>`;
        }
        return htmlCustom;
    }

    static setupHTMLSelectCollab(collabOutForm) {
        let htmlCustom = ``;
        if (Array.isArray(collabOutForm)) {
            for (let i = 0; i < collabOutForm.length; i++) {
                let collab = collabOutForm[i];
                htmlCustom += `<div class="d-flex align-items-center justify-content-between group-checkbox-next-node-collab">
                                <div class="form-check form-check-lg d-flex align-items-center">
                                    <input type="radio" name="next-node-collab" class="form-check-input checkbox-next-node-collab" id="collab-${collab?.['id'].replace(/-/g, "")}" data-id="${collab?.['id']}">
                                    <label class="form-check-label mr-2" for="collab-${collab?.['id'].replace(/-/g, "")}">${collab?.['full_name']}</label>
                                </div>
                                <span class="badge badge-secondary badge-outline">${collab?.['group']?.['title'] ? collab?.['group']?.['title'] : ''}</span>
                            </div>`;
                if (i < (collabOutForm.length - 1)) {
                    htmlCustom += `<hr>`;
                }
            }
        }
        return htmlCustom;
    }

    static setupHTMLDraftOrWF() {
        let htmlCustom = ``;
        let statusList = [0, 1];
        let statusMapText = {
            0: $.fn.transEle.attr('data-save-document'),
            1: $.fn.transEle.attr('data-save-run-wf'),
        };
        for (let status of statusList) {
            let checked = "";
            if (status === 0) {
                checked = "checked";
            }
            htmlCustom += `<div class="d-flex group-checkbox-save-status">
                                <div class="form-check form-check-lg d-flex align-items-center">
                                    <input type="radio" name="save-status" class="form-check-input checkbox-save-status" id="save-type-${status}" data-status="${status}" ${checked}>
                                    <label class="form-check-label" for="save-type-${status}">${statusMapText[status]}</label>
                                </div>
                            </div>`;
            if (status === 0) {
                htmlCustom += `<hr>`;
            }
        }
        return htmlCustom;
    }

    static setupHTMLNonWF(is_cancel = false) {
        let htmlBody = `<div class="d-flex align-items-center">
                            <div class="media align-items-center">
                                <div class="media-head me-2">
<!--                                    <i class="far fa-smile"></i>-->
                                    <img src="/static/assets/images/systems/bot_4712104.png" alt="BflowBot"/>
                                </div>
                                <div class="media-body">
                                    <b class="d-block fs-7">BflowBot</b>
                                </div>
                            </div>
                        </div>
                        <ul>
                            <li><span class="fs-7">- ${$.fn.transEle.attr('data-finish-wf-non-apply')}</span></li>
                        </ul>`;
        let htmlCancel = `<div class="d-flex align-items-center">
                                <div class="media align-items-center">
                                    <div class="media-head me-2">
                                        <img src="/static/assets/images/systems/bot_4712104.png" alt="BflowBot"/>
                                    </div>
                                    <div class="media-body">
                                        <b class="d-block fs-7">BflowBot</b>
                                    </div>
                                </div>
                            </div>
                            <ul>
                                <li><span class="fs-7">- ${$.fn.transEle.attr('data-canceled-by-creator')}</span></li>
                            </ul>`;
        if (is_cancel === true) {
            htmlBody = htmlCancel + htmlBody;
        }
        return `<div class="row">
                    <div class="col-12">
                        <div class="card">
                            <div class="hk-ribbon-type-1 start-touch">` + `<span>${$.fn.transEle.attr('data-node-completed')}</span></div>
                            <br>
                            <div class="card-body mt-4">
                                ${htmlBody}
                            </div>
                        </div>
                        </div>
                    </div>`;
    }

    static setWFRuntimeID(runtime_id) {
        if (runtime_id) {
            WFRTControl.setRuntimeWF(runtime_id);
            let $pageLog = $('#idxPageLog');
            if ($pageLog.length > 0) {
                $pageLog.removeClass('hidden');
            }
            let btn = $('#btnLogShow');
            btn.removeClass('hidden');
            let url = SetupFormSubmit.getUrlDetailWithID(btn.attr('data-url-runtime-detail'), runtime_id);
            $.fn.callAjax2({
                'url': url,
                'method': 'GET',
            }).then((resp) => {
                let data = $.fn.switcherResp(resp);
                if ($.fn.hasOwnProperties(data, ['runtime_detail'])) {
                    let runtimeData = data?.['runtime_detail'];
                    // Khi phiếu trong trạng thái đã tạo ( state > 1) thì button save không có hiệu lực
                    if (runtimeData?.['state'] >= 1) {
                        $('#idxRealAction .btn[type="submit"][form]').not('.btn-wf-after-finish').addClass('hidden');
                    }
                    let $dataRTNotFound = $('#idxDataRuntimeNotFound');
                    // Phiếu tự động hoàn thành (không bật quy trình) -> hiển thị idxDataRuntimeNotFound
                    if (runtimeData?.['state'] === 3) {
                        $dataRTNotFound.removeClass('hidden');
                        $dataRTNotFound.empty().append(WFRTControl.setupHTMLNonWF(false));
                    }
                    let appCode = runtimeData?.['app_code'].split(".").pop();
                    let docData = WFRTControl.getRuntimeDocData();
                    // Nếu hủy phiếu sau khi tự động hoàn thành (không bật quy trình)
                    if (docData?.['system_status'] === 4) {
                        $dataRTNotFound.empty().append(WFRTControl.setupHTMLNonWF(true));
                    }
                    let actionMySelf = runtimeData['action_myself'];
                    if (actionMySelf) {
                        let grouAction = $('#idxGroupAction');
                        let taskID = actionMySelf['id'];
                        if (taskID) {
                            WFRTControl.setTaskWF(taskID);
                            let actions = actionMySelf['actions'];
                            if (actions && Array.isArray(actions) && actions.length > 0) {
                                WFRTControl.setActionsList(actions);
                                let priorityAdded = false;
                                actions.map((item) => {
                                    let liFound = grouAction.find('li[data-value=' + item + ']')
                                    let iconFound = liFound.find('.icon-action-wf');
                                    if (priorityAdded === false) {
                                        if (item === 0 || item === 1 || item === 4) {
                                            priorityAdded = true;
                                            $('#btnMainApprove').attr('data-value', item).removeClass('hidden').find('.icon').html(iconFound.clone());
                                        }
                                    }
                                    liFound.removeClass('hidden');
                                })
                                if (!(priorityAdded === true && actions.length === 1)) {
                                    grouAction.closest('.dropdown').removeClass('hidden');
                                }
                            }
                        }
                        // XỬ LÝ ZONES
                        if (window.location.href.includes('/update/')) {
                            if (docData?.['system_status'] === 3 && docData?.['employee_inherit']?.['id'] === $x.fn.getEmployeeCurrentID()) {
                                // Bật nút lưu CR
                                WFRTControl.setBtnWFAfterFinishUpdate();
                                // Bật zone initial
                                WFRTControl.setWFInitialData(appCode, true);
                            } else {
                                if (['zones', 'zones_hidden', 'is_edit_all_zone'].every(key => key in actionMySelf)) {
                                    WFRTControl.activeBtnOpenZone(actionMySelf['zones'], actionMySelf['zones_hidden'], actionMySelf['is_edit_all_zone']);
                                } else {
                                    WFRTControl.activeSetZoneHiddenMySelf(runtimeData['zones_hidden_myself']);
                                }
                            }
                        }
                        if (window.location.href.includes('/detail/')) {
                            WFRTControl.checkAllowEditZones(actionMySelf);
                            WFRTControl.activeSetZoneHiddenMySelf(runtimeData['zones_hidden_myself']);
                            if (docData?.['system_status'] === 3) {
                                // Bật nút CR & Cancel
                                if (docData?.['employee_inherit']?.['id'] === $x.fn.getEmployeeCurrentID()) {
                                    let appAllowChange = [
                                        "quotation.quotation",
                                        "saleorder.saleorder",
                                    ];
                                    let appAllowCancel = [
                                        "quotation.quotation",
                                        "saleorder.saleorder",
                                        "leaseorder.leaseorder",
                                        "purchasing.purchaserequest",
                                        "purchasing.purchaseorder",
                                        "serviceorder.serviceorder",
                                    ];
                                    if (appAllowChange.includes(runtimeData?.['app_code']) && appAllowCancel.includes(runtimeData?.['app_code'])) {
                                        WFRTControl.setBtnWFAfterFinishDetail('all');
                                    }
                                    if (appAllowChange.includes(runtimeData?.['app_code']) && !appAllowCancel.includes(runtimeData?.['app_code'])) {
                                        WFRTControl.setBtnWFAfterFinishDetail('change');
                                    }
                                    if (appAllowCancel.includes(runtimeData?.['app_code']) && !appAllowChange.includes(runtimeData?.['app_code'])) {
                                        WFRTControl.setBtnWFAfterFinishDetail('cancel');
                                    }
                                }
                                // Bật nút in
                                let $btnPrint = $('#print-document');
                                if ($btnPrint && $btnPrint.length > 0) {
                                    $btnPrint.removeAttr('hidden');
                                }
                            }
                        }
                        // XỬ LÝ ASSOCIATION
                        WFRTControl.setAssociateRuntime(actionMySelf?.['association']);
                    }
                }
            })
        }
        if (!globeWFRuntimeID) {
            globeWFRuntimeID = runtime_id;
        }
    }

    static setWFInitialData(app_code, isCR = false) {
        if (app_code) {
            let btn = $('#btnLogShow');
            let url = btn.attr('data-url-current-wf');
            $.fn.callAjax2({
                'url': url,
                'method': 'GET',
                'data': {'code': app_code},
            }).then((resp) => {
                let data = $.fn.switcherResp(resp);
                if (data) {
                    if (data.hasOwnProperty('app_list') && Array.isArray(data.app_list)) {
                        // Check only 1 wf config for application
                        if (data?.['app_list'].length === 1) {
                            let WFconfig = data?.['app_list'][0];
                            // Check if wf mode is apply (!== 0)
                            if (WFconfig?.['mode'] !== 0) {
                                let workflow_current = WFconfig?.['workflow_currently'];
                                if (workflow_current) {
                                    // Zones handler
                                    if (window.location.href.includes('/create') || (window.location.href.includes('/update/') && isCR === true)) {
                                        WFRTControl.activeBtnOpenZone(workflow_current['initial_zones'], workflow_current['initial_zones_hidden'], workflow_current['is_edit_all_zone']);
                                    }
                                    // Association handler
                                    WFRTControl.setAssociateCreate(workflow_current['association']);
                                }
                            }
                            WFRTControl.setAppID(WFconfig?.['application_id'] ? WFconfig?.['application_id']: "");
                        }
                    }
                }
            })
        }
    }

    static getWFRuntimeID() {
        return globeWFRuntimeID;
    }

    static getActionsList() {
        let itemEle = $('#idxWFActionsData');
        if (itemEle && itemEle.length > 0) return JSON.parse(itemEle.text());
        return [];
    }

    static setActionsList(actions) {
        $('html').append(`<script class="hidden" id="idxWFActionsData">${JSON.stringify(actions)}</script>`);
    }

    static getTaskWF() {
        return $('#idxGroupAction').attr('data-wf-task-id');
    }

    static setTaskWF(taskID) {
        $('#idxGroupAction').attr('data-wf-task-id', taskID);
    }

    static getRuntimeWF() {
        return $('#idxGroupAction').attr('data-wf-runtime-id');
    }

    static setRuntimeWF(runtimeID) {
        $('#idxGroupAction').attr('data-wf-runtime-id', runtimeID);
    }

    static activeZoneInDoc() {
        let zonesData = WFRTControl.getZoneData();
        let zonesHiddenData = WFRTControl.getZoneHiddenData();
        let isEditAllZone = WFRTControl.getIsEditAllZone();
        let docData = WFRTControl.getRuntimeDocData();
        // Case user is allowed to edit all page
        if (isEditAllZone === 'true') {
            if (window.location.href.includes('/update/')) {
                let idFormID = globeFormMappedZone;
                if (idFormID && globeWFRuntimeID) {
                    DocumentControl.getElePageAction().find('[form=' + idFormID + ']').not('.btn-wf-after-finish').addClass('hidden');
                    if (docData?.['system_status'] === 1) {
                        $('#idxSaveInZoneWF').attr('form', idFormID).removeClass('hidden').on('click', function () {
                            DocumentControl.setBtnIDLastSubmit($(this).attr('id'));
                        });
                    }

                    let actionList = WFRTControl.getActionsList();
                    let actionBubble = null;
                    if (actionList.includes(1)) {
                        actionBubble = 1;
                    } else if (actionList.includes(4)) {
                        actionBubble = 4;
                    }
                    if (actionBubble) {
                        $('#idxSaveInZoneWFThenNext').attr('form', idFormID).attr('data-wf-action', actionBubble).attr('data-actions-list', JSON.stringify(WFRTControl.getActionsList())).removeClass('hidden').on('click', function () {
                            DocumentControl.setBtnIDLastSubmit($(this).attr('id'));
                        });
                    }
                }
            }
            return true;
        }
        // Case user can only edit page by zones
        if (Array.isArray(zonesData) && Array.isArray(zonesHiddenData)) {
            let pageEle = DocumentControl.getElePageContent();
            let input_mapping_properties = WFRTControl.getInputMappingProperties();

            // Step1: remove required & set disable, readonly field (chỉ disabled các field trong form)
            pageEle.find('.required').removeClass('required');
            pageEle.find('input, select, textarea, button, span[data-zone]').each(function (event) {
                let inputMapProperties = input_mapping_properties[$(this).attr('name')];
                if (!inputMapProperties)
                    inputMapProperties = input_mapping_properties[$(this).attr('data-zone')];
                if (inputMapProperties && typeof inputMapProperties === 'object') {
                    let arrTmpFind = [];
                    // main: name + data-zone
                    inputMapProperties['name'].map((nameFind) => {
                        arrTmpFind.push("[name=" + nameFind + "]");
                        if ($(this).attr('data-zone')) arrTmpFind.push("[data-zone=" + nameFind + "]");
                    })
                    // optional: id, class
                    inputMapProperties['id'].map((idFind) => {
                        arrTmpFind.push("[id=" + idFind + "]");
                    })
                    inputMapProperties['id_border_zones'].map((item) => {
                        arrTmpFind.push('#' + item)
                    })
                    inputMapProperties['cls_border_zones'].map((item) => {
                        arrTmpFind.push('.' + item);
                    })
                    arrTmpFind.map((item) => {
                        pageEle.find(item).each(function (event) {
                            $(this).changePropertiesElementIsZone({
                                'add_disable': true,
                                'add_readonly': true,
                                'remove_required': true,
                            });
                        });
                    })
                } else {
                    $(this).changePropertiesElementIsZone({
                        'add_disable': true,
                        'add_readonly': true,
                        'remove_required': true,
                    });
                }
                // case: input is Files
                if ($(this).hasClass('dm-uploader-ids')) {
                    let uploaderEle = $(this).closest('.dad-file-control-group').find('.dm-uploader');
                    uploaderEle.dmUploader('disable');
                }
            });
            // Step2: apply zones editable config
            if (zonesData.length > 0) {
                zonesData.map((item) => {
                    if (item?.['code']) {
                        let inputMapProperties = input_mapping_properties[item?.['code']];
                        if (inputMapProperties && typeof inputMapProperties === 'object') {
                            let arrTmpFind = [];
                            inputMapProperties['name'].map((nameFind) => {
                                arrTmpFind.push("[name=" + nameFind + "]");
                                arrTmpFind.push("[data-zone=" + nameFind + "]");
                            })
                            inputMapProperties['id'].map((idFind) => {
                                arrTmpFind.push("[id=" + idFind + "]");
                            })
                            arrTmpFind.map((findText) => {
                                pageEle.find(findText).each(function () {
                                    let optsSetZone = {
                                        'add_require_label': true,
                                        'add_require': false,
                                        'remove_disable': true,
                                        'remove_readonly': true,
                                        'add_border': true,
                                        'add_class_active': true,
                                    };
                                    let dmUploaderAttr = 'enable';
                                    if (this.classList.contains('zone-readonly')) {
                                        optsSetZone = {
                                            'add_require_label': true,
                                            'add_require': false,
                                            'remove_disable': true,
                                            'add_readonly': true,
                                            'add_border': true,
                                            'add_class_active': true,
                                        };
                                        dmUploaderAttr = 'disable';
                                    }
                                    $(this).changePropertiesElementIsZone(optsSetZone);
                                    $(this).find('input, select, textarea, button').each(function (event) {
                                        $(this).changePropertiesElementIsZone(optsSetZone);

                                        // case: input is Files
                                        if ($(this).hasClass('dm-uploader-ids')) {
                                            let uploaderEle = $(this).closest('.dad-file-control-group').find('.dm-uploader');
                                            uploaderEle.dmUploader(dmUploaderAttr);
                                        }
                                    });
                                })
                            });
                            inputMapProperties['id_border_zones'].map((item) => {
                                pageEle.find('#' + item).changePropertiesElementIsZone({
                                    'add_border': true,
                                    'add_readonly': true,
                                });
                            })
                            inputMapProperties['cls_border_zones'].map((item) => {
                                pageEle.find('.' + item).changePropertiesElementIsZone({
                                    'add_border': true,
                                    'add_readonly': true,
                                });
                            })
                        }
                    }
                })
            }
            // Step3: apply zones hidden config
            if (zonesHiddenData.length > 0) {
                zonesHiddenData.map((item) => {
                    if (item?.['code']) {
                        let inputMapProperties = input_mapping_properties[item?.['code']];
                        if (inputMapProperties && typeof inputMapProperties === 'object') {
                            let arrTmpFind = [];
                            inputMapProperties['name'].map((nameFind) => {
                                arrTmpFind.push("[name=" + nameFind + "]");
                                arrTmpFind.push("[data-zone=" + nameFind + "]");
                            })
                            inputMapProperties['id'].map((idFind) => {
                                arrTmpFind.push("[id=" + idFind + "]");
                            })
                            arrTmpFind.map((findText) => {
                                pageEle.find(findText).each(function () {
                                    let optsSetZone = {'add_empty_value': true};
                                    $(this).changePropertiesElementIsZone(optsSetZone);
                                    $(this).find('input, select, textarea, button, span, p, li').each(function (event) {
                                        $(this).changePropertiesElementIsZone(optsSetZone);
                                    });
                                })
                            });
                        }
                    }
                })
            }
            // add button save at zones
            if (zonesData.length > 0) {  // check if user has zones && doc in WF runtime then show button save at zone
                if (window.location.href.includes('/update/')) {
                    let idFormID = globeFormMappedZone;
                    if (idFormID && globeWFRuntimeID) {
                        DocumentControl.getElePageAction().find('[form=' + idFormID + ']').not('.btn-wf-after-finish').addClass('hidden');
                        if (docData?.['system_status'] === 1) {
                            $('#idxSaveInZoneWF').attr('form', idFormID).removeClass('hidden').on('click', function () {
                                DocumentControl.setBtnIDLastSubmit($(this).attr('id'));
                            });
                        }

                        let actionList = WFRTControl.getActionsList();
                        let actionBubble = null;
                        if (actionList.includes(1)) {
                            actionBubble = 1;
                        } else if (actionList.includes(4)) {
                            actionBubble = 4;
                        }
                        if (actionBubble) {
                            $('#idxSaveInZoneWFThenNext').attr('form', idFormID).attr('data-wf-action', actionBubble).attr('data-actions-list', JSON.stringify(WFRTControl.getActionsList())).removeClass('hidden').on('click', function () {
                                DocumentControl.setBtnIDLastSubmit($(this).attr('id'));
                            });
                        }
                    }
                }
            }
        }
    }

    static activeZoneHiddenMySelf() {
        let zonesHiddenData = WFRTControl.getZoneHiddenData();
        if (Array.isArray(zonesHiddenData)) {
            let pageEle = DocumentControl.getElePageContent();
            let input_mapping_properties = WFRTControl.getInputMappingProperties();

            // apply zones hidden config
            if (zonesHiddenData.length > 0) {
                zonesHiddenData.map((item) => {
                    if (item?.['code']) {
                        let inputMapProperties = input_mapping_properties[item?.['code']];
                        if (inputMapProperties && typeof inputMapProperties === 'object') {
                            let arrTmpFind = [];
                            inputMapProperties['name'].map((nameFind) => {
                                arrTmpFind.push("[name=" + nameFind + "]");
                                arrTmpFind.push("[data-zone=" + nameFind + "]");
                            })
                            inputMapProperties['id'].map((idFind) => {
                                arrTmpFind.push("[id=" + idFind + "]");
                            })
                            arrTmpFind.map((findText) => {
                                pageEle.find(findText).each(function () {
                                    let optsSetZone = {'add_empty_value': true};
                                    $(this).changePropertiesElementIsZone(optsSetZone);
                                    $(this).find('input, select, textarea, button, span, p, li').each(function (event) {
                                        $(this).changePropertiesElementIsZone(optsSetZone);
                                    });
                                })
                            });
                        }
                    }
                })
            }
        }
    }

    static checkAllowEditZones(actionMySelf) {
        if (actionMySelf?.['is_edit_all_zone']) {
            if (actionMySelf['is_edit_all_zone'] === true) {
                $('#idxRealAction').removeClass('hidden');
            }
        }
        if (actionMySelf?.['zones']) {
            if (actionMySelf['zones'].length > 0) {
                $('#idxRealAction').removeClass('hidden');
            }
        }
        return true;
    }

    static activeBtnOpenZone(zonesData, zonesHiddenData, isEditAllZone) {
        if (window.location.href.includes('/update/') || window.location.href.includes('/create')) {
            WFRTControl.setZoneData(zonesData);
            WFRTControl.setZoneHiddenData(zonesHiddenData);
            WFRTControl.setIsEditAllZoneData(isEditAllZone);
            if (zonesData && Array.isArray(zonesData) && zonesHiddenData && Array.isArray(zonesHiddenData)) {
                WFRTControl.activeZoneInDoc();
            }
        }
    }

    static activeSetZoneHiddenMySelf(zonesHiddenData) {
        if (window.location.href.includes('/detail/') || window.location.href.includes('/update/')) {
            WFRTControl.setZoneHiddenData(zonesHiddenData);
            WFRTControl.activeZoneHiddenMySelf();
        }
    }

    static getRuntimeDocData() {
        let itemEle = $('#idxRuntimeDoc');
        if (itemEle && itemEle.length > 0) {
            return JSON.parse(itemEle.val());
        }
        return {};
    }

    static getZoneData() {
        let itemEle = $('#idxZonesData');
        if (itemEle && itemEle.length > 0) {
            return JSON.parse(itemEle.text());
        }
        return [];
    }

    static getZoneHiddenData() {
        let itemEle = $('#idxZonesHiddenData');
        if (itemEle && itemEle.length > 0) {
            return JSON.parse(itemEle.text());
        }
        return [];
    }

    static getIsEditAllZone() {
        let itemEle = $('#idxIsEditAllZone');
        if (itemEle && itemEle.length > 0) {
            return itemEle.text();
        }
        return 'true';
    }

    static getCollabOutFormData() {
        // typeWF 0: dataInitial, 1: dataRuntime
        let typeWF = 0;
        if (window.location.href.includes('/detail/')) {
            typeWF = 1;
        }
        if (window.location.href.includes('/update/')) {
            let docData = WFRTControl.getRuntimeDocData();
            if (docData?.['system_status']) {
                if (![0, 3].includes(docData?.['system_status'])) {
                    typeWF = 1;
                }
            }
        }
        if (typeWF === 0) {
            let $collabOFCreate = $('#idxCollabOFCreate');
            if ($collabOFCreate && $collabOFCreate.length > 0) {
                return JSON.parse($collabOFCreate.text());
            }
        }
        if (typeWF === 1) {
            let $collabOFRuntime = $('#idxCollabOFRuntime');
            if ($collabOFRuntime && $collabOFRuntime.length > 0) {
                return JSON.parse($collabOFRuntime.text());
            } else {  // case if not $collabOFRuntime then check & use dataInitial
                let $collabOFCreate = $('#idxCollabOFCreate');
                if ($collabOFCreate && $collabOFCreate.length > 0) {
                    return JSON.parse($collabOFCreate.text());
                }
            }
        }
        return [];
    }

    static getAssociateData() {
        // typeWF 0: dataInitial, 1: dataRuntime
        let typeWF = 0;
        if (window.location.href.includes('/detail/')) {
            typeWF = 1;
        }
        if (window.location.href.includes('/update/')) {
            let docData = WFRTControl.getRuntimeDocData();
            if (docData?.['system_status']) {
                if (![0, 3].includes(docData?.['system_status'])) {
                    typeWF = 1;
                }
            }
        }
        if (typeWF === 0) {  // initial
            let $associateCreate = $('#idxAssociateCreate');
            if ($associateCreate && $associateCreate.length > 0) {
                return JSON.parse($associateCreate.text());
            }
        }
        if (typeWF === 1) {  // runtime
            let $associateRuntime = $('#idxAssociateRuntime');
            if ($associateRuntime && $associateRuntime.length > 0) {
                return JSON.parse($associateRuntime.text());
            } else {  // case if not $associateRuntime then check & use dataInitial
                let $associateCreate = $('#idxAssociateCreate');
                if ($associateCreate && $associateCreate.length > 0) {
                    return JSON.parse($associateCreate.text());
                }
            }
        }
        return [];
    }

    static getZoneKeyData() {
        let itemEle = $('#idxZonesKeyData');
        if (itemEle) {
            return JSON.parse(itemEle.text());
        }
        return [];
    }

    static getZoneHiddenKeyData() {
        let itemEle = $('#idxZonesHiddenKeyData');
        if (itemEle && itemEle.length > 0) {
            return JSON.parse(itemEle.text());
        }
        return [];
    }

    static getZoneKeyRelatedData() {
        let itemEle = $('#idxZonesKeyRelatedData');
        if (itemEle && itemEle.length > 0) {
            return JSON.parse(itemEle.text());
        }
        return [];
    }

    static getZoneHiddenKeyRelatedData() {
        let itemEle = $('#idxZonesHiddenKeyRelatedData');
        if (itemEle && itemEle.length > 0) {
            return JSON.parse(itemEle.text());
        }
        return [];
    }

    static getAppID() {
        let itemEle = $('#idxApp');
        if (itemEle.length > 0) {
            return itemEle.text();
        }
        return "";
    }

    static getAppBaseline() {
        return [
            "36f25733-a6e7-43ea-b710-38e2052f0f6d",
        ];
    }

    static setRuntimeDoc(docData) {
        if (typeof docData === 'object' && docData !== null) {
            let $RuntimeDoc = $('#idxRuntimeDoc');
            if ($RuntimeDoc && $RuntimeDoc.length > 0) {
                $RuntimeDoc.val(`${JSON.stringify(docData)}`);
            } else {
                $('html').append(`<input class="hidden" id="idxRuntimeDoc" value="${JSON.stringify(docData).replace(/"/g, "&quot;")}">`);
            }
        }
    }

    static setZoneData(zonesData) {
        let body_fields = [];
        let body_fields_related = [];
        if (zonesData && Array.isArray(zonesData)) {
            zonesData.map((item) => {
                body_fields.push(item.code);
                body_fields_related = body_fields_related.concat(item?.['code_related']);
            });
            let $editData = $('#idxZonesData');
            let $editKey = $('#idxZonesKeyData');
            let $editRelate = $('#idxZonesKeyRelatedData');
            if ($editData && $editData.length > 0) {
                $editData.empty().html(`${JSON.stringify(zonesData)}`);
            } else {
                $('html').append(`<script class="hidden" id="idxZonesData">${JSON.stringify(zonesData)}</script>`);
            }
            if ($editKey && $editKey.length > 0) {
                $editKey.empty().html(`${JSON.stringify(body_fields)}`);
            } else {
                $('html').append(`<script class="hidden" id="idxZonesKeyData">${JSON.stringify(body_fields)}</script>`);
            }
            if ($editRelate && $editRelate.length > 0) {
                $editRelate.empty().html(`${JSON.stringify(body_fields_related)}`);
            } else {
                $('html').append(`<script class="hidden" id="idxZonesKeyRelatedData">${JSON.stringify(body_fields_related)}</script>`);
            }
        }
    }

    static setZoneHiddenData(zonesHiddenData) {
        let body_fields = [];
        let body_fields_related = [];
        if (zonesHiddenData && Array.isArray(zonesHiddenData)) {
            zonesHiddenData.map((item) => {
                body_fields.push(item.code);
                body_fields_related = body_fields_related.concat(item?.['code_related']);
            });
            let $hiddenData = $('#idxZonesHiddenData');
            let $hiddenKey = $('#idxZonesHiddenKeyData');
            let $hiddenRelate = $('#idxZonesHiddenKeyRelatedData');
            if ($hiddenData && $hiddenData.length > 0) {
                $hiddenData.empty().html(`${JSON.stringify(zonesHiddenData)}`);
            } else {
                $('html').append(`<script class="hidden" id="idxZonesHiddenData">${JSON.stringify(zonesHiddenData)}</script>`);
            }
            if ($hiddenKey && $hiddenKey.length > 0) {
                $hiddenKey.empty().html(`${JSON.stringify(body_fields)}`);
            } else {
                $('html').append(`<script class="hidden" id="idxZonesHiddenKeyData">${JSON.stringify(body_fields)}</script>`);
            }
            if ($hiddenRelate && $hiddenRelate.length > 0) {
                $hiddenRelate.empty().html(`${JSON.stringify(body_fields_related)}`);
            } else {
                $('html').append(`<script class="hidden" id="idxZonesHiddenKeyRelatedData">${JSON.stringify(body_fields_related)}</script>`);
            }
        }
    }

    static setIsEditAllZoneData(isEditAllZone) {
        let $allZone = $('#idxIsEditAllZone');
        if ($allZone && $allZone.length > 0) {
            $allZone.empty().html(`${isEditAllZone}`);
        } else {
            $('html').append(`<script class="hidden" id="idxIsEditAllZone">${isEditAllZone}</script>`);
        }
    }

    static setCollabOFRuntime(collabOutFormData) {
        if (collabOutFormData && Array.isArray(collabOutFormData)) {
            let $collab = $('#idxCollabOFRuntime');
            if ($collab && $collab.length > 0) {
                $collab.empty().html(`${JSON.stringify(collabOutFormData)}`);
            } else {
                $('html').append(`<script class="hidden" id="idxCollabOFRuntime">${JSON.stringify(collabOutFormData)}</script>`);
            }
        }
    }

    static setCollabOFCreate(collabOutFormData) {
        if (collabOutFormData && Array.isArray(collabOutFormData)) {
            let $collab = $('#idxCollabOFCreate');
            if ($collab && $collab.length > 0) {
                $collab.empty().html(`${JSON.stringify(collabOutFormData)}`);
            } else {
                $('html').append(`<script class="hidden" id="idxCollabOFCreate">${JSON.stringify(collabOutFormData)}</script>`);
            }
        }
    }

    static setAssociateRuntime(associateData) {
        if (associateData && Array.isArray(associateData)) {
            let $associate = $('#idxAssociateRuntime');
            if ($associate && $associate.length > 0) {
                $associate.empty().html(`${JSON.stringify(associateData)}`);
            } else {
                $('html').append(`<script class="hidden" id="idxAssociateRuntime">${JSON.stringify(associateData)}</script>`);
            }
        }
    }

    static setAssociateCreate(associateData) {
        if (associateData && Array.isArray(associateData)) {
            let $associate = $('#idxAssociateCreate');
            if ($associate && $associate.length > 0) {
                $associate.empty().html(`${JSON.stringify(associateData)}`);
            } else {
                $('html').append(`<script class="hidden" id="idxAssociateCreate">${JSON.stringify(associateData)}</script>`);
            }
        }
    }

    static setBtnWFAfterFinishDetail(type) {
        let $pageAction = $('#idxPageAction');
        let $realAction = $('#idxRealAction');
        let btnCancel = $('#btnCancel');
        let btnEnableCR = $('#btnEnableCR');
        if ($pageAction && $pageAction.length > 0 && $realAction && $realAction.length > 0) {
            if (btnCancel.length <= 0 && btnEnableCR.length <= 0) {
                let buttons = ``;
                if (type === 'all') {
                    buttons = `<button type="button" class="btn btn-outline-primary btn-wf-after-finish" id="btnEnableCR" data-value="1">${$.fn.transEle.attr('data-change-request')}</button>
                                <button type="button" class="btn btn-outline-primary btn-wf-after-finish" id="btnCancel" data-value="2">${$.fn.transEle.attr('data-cancel')}</button>`;
                }
                if (type === 'change') {
                    buttons = `<button type="button" class="btn btn-outline-primary btn-wf-after-finish" id="btnEnableCR" data-value="1">${$.fn.transEle.attr('data-change-request')}</button>`;
                }
                if (type === 'cancel') {
                    buttons = `<button type="button" class="btn btn-outline-primary btn-wf-after-finish" id="btnCancel" data-value="2">${$.fn.transEle.attr('data-cancel')}</button>`;
                }

                $($realAction).after(`<div class="btn-group btn-group-rounded" role="group" aria-label="Basic example">${buttons}</div>`);
                // add event
                $pageAction.on('click', '.btn-wf-after-finish', function () {
                    return WFRTControl.callActionWF($(this));
                });
            }
        }
    }

    static setBtnWFAfterFinishUpdate() {
        let $pageAction = $('#idxPageAction');
        let $realAction = $('#idxRealAction');
        let btnSaveCR = $('#btnSaveCR');
        let btnCancelCR = $('#btnCancelCR');
        let formID = globeFormMappedZone;
        if ($pageAction && $pageAction.length > 0 && $realAction && $realAction.length > 0 && formID) {
            if (btnSaveCR.length <= 0 && btnCancelCR.length <= 0) {
                $($realAction).after(`<div class="btn-group btn-group-rounded" role="group" aria-label="Basic example">
                                            <button class="btn btn-outline-primary btn-wf-after-finish" type="submit" form="${formID}" id="btnSaveCR" data-value="3">${$.fn.transEle.attr('data-save-change')}</button>
                                            <button type="button" class="btn btn-outline-primary btn-wf-after-finish" id="btnCancelCR" data-value="4">${$.fn.transEle.attr('data-go-back')}</button>
                                        </div>`);
                // Add event
                $pageAction.on('click', '.btn-wf-after-finish', function () {
                    return WFRTControl.callActionWF($(this));
                });
            }
        }
    }

    static setAppID(appID) {
        if (appID) {
            let $appIDEle = $('#idxApp');
            if ($appIDEle && $appIDEle.length > 0) {
                $appIDEle.empty().html(appID);
            } else {
                $('html').append(`<div class="hidden" id="idxApp">${appID}</div>`);
            }
        }
    }

    static getInputMappingProperties() {
        let input_mapping_properties = $('#input_mapping_properties').text();
        if (input_mapping_properties) {
            return JSON.parse(input_mapping_properties);
        }
        return {}
    }

    static compareStatusShowPageAction(resultDetail) {
        let $realActions = $('#idxRealAction');
        WFRTControl.setRuntimeDoc(resultDetail);
        switch (resultDetail?.['system_status']) {
            case 1:  // created
                if (resultDetail?.['workflow_runtime_id']) {
                    $realActions.addClass('hidden');
                }
                break
            case 2:  // added
                break
            case 3:  // finished
                DocumentControl.getElePageAction().find('[type="submit"]').each(function () {
                    $(this).addClass("hidden")
                });
                $realActions.addClass('hidden');
                break
            case 4:  // rejected
                DocumentControl.getElePageAction().find('[type="submit"]').each(function () {
                    $(this).addClass("hidden")
                });
                $realActions.addClass('hidden');
                break
            default:
                break
        }
    }

    static changePropertiesElementIsZone(ele$, opts) {
        let config = {
            'add_require_label': false,
            'add_require': false,
            'remove_required': false,
            'remove_disable': false,
            'add_disable': false,
            'remove_readonly': false,
            'add_readonly': false,
            'add_border': false,
            'add_class_active': false,  // flag to know element is active zone
            'add_empty_value': false, ...opts
        }
        if (config?.['add_require_label'] === true) {
            $(ele$).closest('.form-group').find('.form-label').addClass('required');
        }
        if (config?.['add_disable'] === true) {
            if (!$(ele$).hasClass('zone-active')) {
                $(ele$).attr('disabled', 'disabled');
                if ($(ele$).is('div')) {
                    $(ele$).css('cursor', 'no-drop')
                    $(ele$).addClass('bg-light');
                }
            }
        }
        if (config?.['remove_required'] === true) {
            $(ele$).removeAttr('required');
        }
        if (config?.['remove_disable'] === true) {
            $(ele$).removeAttr('disabled');
            $(ele$).removeClass('bg-light');
        }
        if (config?.['add_readonly'] === true) {
            if (!$(ele$).hasClass('zone-active') || $(ele$).hasClass('zone-readonly')) {
                if ($(ele$).is('div')) {
                    $(ele$).addClass('bg-light');
                } else {
                    $(ele$).attr('readonly', 'readonly');
                }
            }
        }
        if (config?.['remove_readonly'] === true) {
            $(ele$).removeAttr('readonly');
            $(ele$).removeClass('bg-light');
        }
        if (config?.['add_require'] === true) {
            $(ele$).prop('required', true);
        }
        if (config?.['add_border'] === true) {
            $(ele$).addClass('border-warning');
        }

        if (config?.['add_class_active'] === true) {  // flag to know which fields are active by WF zones
            $(ele$).addClass('zone-active');
        }
        if (config?.['add_empty_value'] === true) {  // set value to empty
            if (!$(ele$).hasClass('zone-active')) {
                if ($(ele$).is('input')) {  // if <input>
                    $(ele$).val('');
                    if ($(ele$).hasClass('mask-money')) {  // if <input class="mask-money">
                        $(ele$).attr('value', '');
                    }
                    // add class hidden-zone (for use css in my-style.css)
                    $(ele$).attr('placeholder', '');
                    $(ele$).addClass('hidden-zone');
                    $(ele$).addClass('border');
                    $(ele$).addClass('border-dashed');
                    $(ele$).addClass('border-red');
                }
                if ($(ele$).is("select") && $(ele$).hasClass("select2-hidden-accessible")) {  // if select2
                    $(ele$).html(`<option value="" selected></option>`);
                    // add class hidden-zone (for use css in my-style.css)
                    $(ele$).initSelect2({placeholder: $.fn.transEle.attr('data-in-hidden-zone'),});
                    $(ele$).next('.select2-container').addClass('hidden-zone');
                }
                if ($(ele$).is('textarea')) {  // if <textarea>
                    $(ele$).val('');
                    // add class hidden-zone (for use css in my-style.css)
                    $(ele$).attr('placeholder', $.fn.transEle.attr('data-in-hidden-zone'));
                    $(ele$).addClass('hidden-zone');
                }
                if ($(ele$).is('span')) {  // if <span> (only span that have attr data-zone)
                    if ($(ele$).attr('data-zone')) {
                        if ($(ele$).hasClass('mask-money')) {
                            $(ele$).attr('data-init-money', '').html(``);
                        } else {
                            $(ele$).html(``);
                        }
                    }
                }
                if ($(ele$).is('p')) {  // if <p>
                    $(ele$).html(`${$.fn.transEle.attr('data-in-hidden-zone')}`);
                }
                if ($(ele$).is('button')) {  // if <button> (only button that have attr data-zone)
                    if ($(ele$).attr('data-zone')) {
                        $(ele$).attr('hidden', 'true');
                    }
                }
                if ($(ele$).is('li')) {  // if <li>
                    $(ele$).attr('hidden', 'true');
                    if ($(ele$).hasClass('nav-item')) {  // check if <li> is nav-item then find tab-pane removeCls "show"
                        let $navLink = $(ele$).find('.nav-link');
                        if ($navLink && $navLink.length > 0) {
                            let href = $navLink.attr('href');
                            if (href.includes("#")) {
                                href = href.replace("#", "");
                                let $tabPane = $(`.tab-pane[id="${href}"]`);
                                if ($tabPane && $tabPane.length > 0) {
                                    $tabPane.removeClass("show");
                                    $tabPane.removeClass("active");
                                }
                            }
                        }
                    }
                }
            }
        }
        // active border for <select2>
        if ($(ele$).is("select") && $(ele$).hasClass("select2-hidden-accessible"))
            WFRTControl.changePropertiesElementIsZone($(ele$).next('.select2-container').find('.select2-selection'), config)
    }

    static displayRuntimeStatus(status, is_system_auto_create=false) {
        if (is_system_auto_create) {
            return `<span class="badge fs-8 bg-blue-light-1">${$.fn.gettext('Create automatically')}</span>`;
        }
        let sttTxt = {
            0: $.fn.transEle.attr('data-draft'),
            1: $.fn.transEle.attr('data-created'),
            2: $.fn.transEle.attr('data-added'),
            3: $.fn.transEle.attr('data-approved'),
            4: $.fn.transEle.attr('data-cancel'),
        }
        let sttBadge = {
            0: "grey-light-4",
            1: "yellow-light-4",
            2: "blue-light-4",
            3: "green-light-4",
            4: "red-light-4",
        }
        if (status || status === 0) {
            return `<span class="badge text-dark-10 fs-8 bg-${sttBadge[status]}">${sttTxt[status]}</span>`;
        }
        return ``;
    }

    static displayEmployeeWithGroup(obj_employee, field_fullname='full_name') {
        if (Object.keys(obj_employee).length > 0 && field_fullname) {
            return `<span title="${obj_employee?.['group']?.['title'] || $.fn.gettext('No group')}">${obj_employee?.[field_fullname] || ''}</span>`;
        }
        return ``;
    }

    static getDataDDSystemStatus() {
        return [
            {'id': 0, 'title': $.fn.transEle.attr('data-draft')},
            {'id': 1, 'title': $.fn.transEle.attr('data-created')},
            {'id': 2, 'title': $.fn.transEle.attr('data-added')},
            {'id': 3, 'title': $.fn.transEle.attr('data-approved')},
            {'id': 4, 'title': $.fn.transEle.attr('data-cancel')},
        ]
    }

    static findDataZoneHidden(dataForm, dataDetail) {
        let keyHidden = WFRTControl.getZoneHiddenKeyData();
        if (keyHidden) {
            if (keyHidden.length > 0) {
                let keyHiddenRelated = WFRTControl.getZoneHiddenKeyRelatedData();
                keyHidden = keyHidden.concat(keyHiddenRelated);
                // set data detail to zones hidden
                if (dataForm && dataDetail) {
                    for (let key of keyHidden) {
                        if (dataDetail.hasOwnProperty(key)) {
                            dataForm[key] = dataDetail[key];
                        }
                    }
                }
            }
        }
        return dataForm;
    }
}

class WFAssociateControl {
    // Handle every thing about Runtime Association

    static checkNextNode(dataForm) {
        let result = [];
        let associateData = WFRTControl.getAssociateData().reverse();
        if (associateData.length === 1) {  // check node system
            if (["approved"].includes(associateData[0]?.['node_out']?.['code'])) {
                return {'check': true, 'data': associateData};
            }
        }
        for (let assoData of associateData) {  // many nodes, check condition
            let check = false;
            let listLogic = [];
            for (let condition of assoData?.['condition']) {
                if (Array.isArray(condition)) {
                    let checkSub = false;
                    let listLogicSub = [];
                    for (let subCond of condition) {
                        listLogicSub.push(WFAssociateControl.compareLogic(subCond, dataForm));
                    }
                    if (listLogicSub.length === 0) {
                        listLogic.push(true);
                    } else {
                        if (listLogicSub.length % 2 !== 0) {
                            checkSub = WFAssociateControl.evaluateLogic(listLogicSub);
                        } else {
                            listLogicSub.pop();
                            if (listLogicSub.length === 1) {
                                checkSub = listLogicSub[0];
                            } else {
                                checkSub = WFAssociateControl.evaluateLogic(listLogicSub);
                            }
                        }
                        listLogic.push(checkSub);
                    }
                } else {
                    listLogic.push(WFAssociateControl.compareLogic(condition, dataForm));
                }
            }
            if (listLogic.length === 0) {
                result.push(assoData);
            } else {
                if (listLogic.length % 2 !== 0) {
                    check = WFAssociateControl.evaluateLogic(listLogic);
                } else {
                    listLogic.pop();
                    if (listLogic.length === 1) {
                        check = listLogic[0];
                    } else {
                        check = WFAssociateControl.evaluateLogic(listLogic);
                    }
                }
                if (check === true) {
                    result.push(assoData);
                }
            }
        }
        if (result.length > 0) {  // return result (have association pass condition)
            return {'check': true, 'data': result};
        }
        return {'check': false, 'data': associateData};  // return associateData (not any association pass condition)
    };

    static compareLogic(condition, dataForm) {
        let left = null;
        let right = null;
        if (typeof condition === 'object' && condition !== null) {
            if (condition?.['left_cond']) {
                // left = WFAssociateControl.findKey(dataForm, condition?.['left_cond']?.['code']);
                left = WFAssociateControl.calculateParam(dataForm, condition?.['left_cond']);
            }
            if (condition?.['right_cond']) {
                right = WFAssociateControl.calculateParam(dataForm, condition?.['right_cond']);

                // right = condition?.['right_cond'];
                // if (condition?.['left_cond']?.['type'] === 5) {
                //     if (condition?.['right_cond']?.['id']) {
                //         right = condition?.['right_cond']?.['id'];
                //     }
                // }
                // if (condition?.['left_cond']?.['type'] === 6) {
                //     right = parseFloat(condition?.['right_cond']);
                // }
            }
            if (left !== null && right !== null) {
                let isMatch = false;
                if (condition?.['operator'] === 'is') {
                    if (Array.isArray(left)) {
                        isMatch = left.includes(right);
                        return isMatch;
                    }
                    if (typeof left === 'string') {
                        isMatch = left === right;
                        return isMatch;
                    }
                }
                if (condition?.['operator'] === 'contains') {
                    if (Array.isArray(left)) {
                        isMatch = left.includes(right);
                        return isMatch;
                    }
                }
                if (condition?.['operator'] === 'not_contain') {
                    if (Array.isArray(left)) {
                        isMatch = !left.includes(right);
                        return isMatch;
                    }
                }
                if (condition?.['operator'] === '=') {
                    isMatch = left === right;  // Strict equality
                    return isMatch;
                }
                if (condition?.['operator'] === '<') {
                    isMatch = left < right;  // Less than
                    return isMatch;
                }
                if (condition?.['operator'] === '<=') {
                    isMatch = left <= right;  // Less than or equal to
                    return isMatch;
                }
                if (condition?.['operator'] === '>') {
                    isMatch = left > right;  // Greater than
                    return isMatch;
                }
                if (condition?.['operator'] === '>=') {
                    isMatch = left >= right;  // Greater than or equal to
                    return isMatch;
                }
                if (condition?.['operator'] === '!=') {
                    isMatch = left !== right;  // Not equal
                    return isMatch;
                }
            }
        }
        if (typeof condition === 'string') {
            if (["AND", "OR"].includes(condition)) {
                return condition.toLowerCase();
            }
        }

    };

    static findKey(dataForm, key) {
        if (!key.includes("__")) {
            return dataForm?.[key];
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
        }, dataForm);
    }

    static evaluateLogic(conditions) {
        let result = conditions[0];  // Start with the first value
        for (let i = 1; i < conditions.length; i += 2) {
            let operator = conditions[i];     // Get the operator ("and" or "or")
            let nextValue = conditions[i + 1];  // Get the next value (true/false)
            // Apply the logical operator
            if (operator === "and") {
                result = result && nextValue;
            } else if (operator === "or") {
                result = result || nextValue;
            }
        }
        return result;
    };

    // Calculate condition param of association

    static calculateParam(dataForm, param) {
        let result_json = {};
        let parse_formula = "";
        if (Array.isArray(param)) {
            for (let item of param) {
                if (typeof item === 'object' && item !== null) {
                    if (item.hasOwnProperty('is_property')) {
                        if (dataForm.hasOwnProperty(item?.['code'])) {
                            parse_formula += dataForm[item?.['code']];
                        }
                    } else if (item.hasOwnProperty('param_type')) {
                        if (item?.['param_type'] === 2) { // FUNCTION
                            if (item?.['code'] === 'max' || item?.['code'] === 'min') {
                                let functionData = WFAssociateControl.functionMaxMin(item, dataForm, result_json);
                                parse_formula += functionData;
                            } else if (item?.['code'] === 'sumItemIf') {
                                let functionData = WFAssociateControl.functionSumItemIf(item, dataForm);
                                parse_formula += functionData;
                            }
                        }
                    }
                } else if (typeof item === 'string') {
                    parse_formula += item;
                }
            }
        }
        // format
        parse_formula = WFAssociateControl.formatExpression(parse_formula);
        return WFAssociateControl.evaluateFormula(parse_formula);
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
        functionBody = WFAssociateControl.extractDataToSum(data_form, leftValueJSON, condition_operator, rightValue, lastElement);
        if (functionBody[functionBody.length - 1] === ",") {
            let functionBodySlice = functionBody.slice(0, -1);
            return syntax + functionBodySlice + ")";
        }
        return syntax + functionBody + ")";
    };

    static extractDataToSum(data, leftValueJSON, condition_operator, rightValue, lastElement) {
        let functionBody = "";
        if (typeof leftValueJSON === 'object' && leftValueJSON !== null) {
            let val = WFAssociateControl.findKey(data, leftValueJSON?.['code']);
            if (val) {
                // TH val là danh sách => loop kiểm tra
                if (Array.isArray(val)) {
                    val = val.map(item =>
                        typeof item === 'string'
                            ? item.replace(/\s/g, "").toLowerCase()
                            : item
                    );
                    let check = val.includes(rightValue);
                    // Danh sách có chứa rightValue => loop lấy dữ liệu tương ứng
                    if (check === true) {
                        let valData = WFAssociateControl.findKey(data, lastElement?.['code']);
                        if (val.length === valData.length) {
                            for (let i = 0; i < val.length; i++) {
                                if (val[i] === rightValue) {
                                    functionBody += String(valData[i]);
                                    functionBody += ",";
                                }
                            }
                        }
                    }
                    // Danh sách không chứa rightValue => trả về 0
                    if (check === false) {
                        functionBody += String(0);
                        functionBody += ",";
                    }
                }
                // TH val là 1 giá trị => kiểm tra trực tiếp
                if (typeof val === 'string') {
                    let leftValue = val.replace(/\s/g, "").toLowerCase();
                    let checkExpression = `"${leftValue}" ${condition_operator} "${rightValue}"`;
                    let check = WFAssociateControl.evaluateFormula(checkExpression);
                    if (check === true) {
                        functionBody += String(data[lastElement?.['code']]);
                        functionBody += ",";
                    }
                    if (check === false) {
                        functionBody += String(0);
                        functionBody += ",";
                    }
                }
            }
        }
        return functionBody;
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

}

class UtilControl {
    static parseJson(data, defaultReturn = {}) {
        try {
            return JSON.parse(data);
        } catch (error) {
            return defaultReturn;
        }
    }

    static dumpJson(data, defaultReturn = '{}') {
        try {
            return JSON.stringify(data);
        } catch (error) {
            return defaultReturn;
        }
    }

    static generateRandomString(length = 32, startFromLetter = false) {
        let result = '';
        let characterLetter = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
        let characterNumber = '0123456789';
        let characters = characterLetter + characterNumber;

        if (startFromLetter === true) {
            result += characterLetter.charAt(Math.floor(Math.random() * characterLetter.length));
            length -= 1;
        }

        for (let i = 0; i < length; i++) {
            result += characters.charAt(Math.floor(Math.random() * characters.length));
        }
        return result;
    }

    static generateUUID4() {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
            let r = Math.random() * 16 | 0,
                v = c === 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    }

    static checkUUID4(data) {
        if (
            typeof data === "string" && (
                data.length === 36 // string type
                || data.length === 36 - 4 // hex type
            )
        ) {
            const regexExp = /^[0-9a-fA-F]{8}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{12}$/gi;
            return regexExp.test(data);
        }
        return false;
    }

    static arraysEqual(a, b) {
        if (a.length !== b.length) return false;
        return a.every((value, index) => value === b[index]);
    }

    static arrayIncludesAll(a, b) {
        return b.every(value => a.includes(value));
    }

    static arrayRange(start, end, step = 1) {
        return Array.from(
            {length: (end - start) / step + 1},
            (value, index) => start + index * step
        )
    }

    static initElementInitSelect(opts, html_or_$ = 'html') {
        let configData = {
            'dummy-data': {},
            'key-display': 'title',
            'key-primary': 'id',
            'url': null,
            'method': 'GET',
            'params': {},
            'result-key': null,
            'class-name': '', ...opts
        }
        let selData = $('<select>');
        selData.addClass('form-select select2-init-v1');
        selData.addClass(configData['class-name']);
        selData.attr('data-init-loaded', null);
        selData.attr('data-ajax-loaded', null);

        selData.attr('data-dummy', JSON.stringify(configData['dummy-data']));
        selData.attr('data-key-display', configData['key-display']);
        selData.attr('data-key-primary', configData['key-primary']);
        selData.attr('data-url', configData['url']);
        selData.attr('data-method', configData['method']);
        selData.attr('data-params', $.param(configData['params']));
        selData.attr('data-result-key', configData['result-key']);
        switch (html_or_$) {
            case "$":
                return selData;
            case "html":
                return selData.prop('outerHTML');
            default:
                if ($.fn.isDebug() === true) throw Error('Init Select must be return type choice in: [html, object $]')
        }
    }

    static sumArray(array) {
        return array.reduce(function (acc, currentValue) {
            return acc + currentValue;
        }, 0);
    }

    static getValueOrEmpty(objData, key, defaultData = '') {
        if (typeof objData === 'object' && typeof key === 'string') {
            if (objData.hasOwnProperty(key) && objData[key]) {
                return objData[key];
            }
        }
        return defaultData;
    }

    static parseDateTime(dateStrUTC, microSecondLength = 0) {
        let dateNew = new Date(Date.parse(dateStrUTC));
        return "{day}/{month}/{year} {hour}:{minute}:{second}".format_by_key({
            day: dateNew.getDate().toString().padStart(2, '0'),
            month: (dateNew.getMonth() + 1).toString().padStart(2, '0'),
            year: dateNew.getFullYear().toString(),
            hour: dateNew.getHours().toString().padStart(2, '0'),
            minute: dateNew.getMinutes().toString().padStart(2, '0'),
            second: dateNew.getSeconds().toString().padStart(2, '0'),
        }) + (microSecondLength > 0 ? ("." + dateNew.getMilliseconds().toString().padStart(3, '0')) : "")
    }

    static parseDate(dateStrUTC) {
        let dateNew = new Date(Date.parse(dateStrUTC));
        return "{day}/{month}/{year}".format_by_key({
            day: dateNew.getDate().toString().padStart(2, '0'),
            month: (dateNew.getMonth() + 1).toString().padStart(2, '0'),
            year: dateNew.getFullYear().toString(),
        })
    }

    static popKey(data, key, defaultData = null, compareTypeWithDefault = false) {
        // Has key in "data" && (
        //      !compareTypeWithDefault || (compareTypeWithDefault === true && typeof data[key] === typeof defaultData)
        // )
        // otherwise return defaultData
        if (typeof data === 'object') {
            if (data.hasOwnProperty(key)) {
                let tmp = data[key];
                delete data[key];
                if (compareTypeWithDefault === true) {
                    if (typeof tmp === typeof defaultData) return tmp;
                } else return tmp;
            }
        }
        return defaultData;
    }

    static getKey(data, key, defaultData = null, compareTypeWithDefault = false) {
        if (typeof data === 'object') {
            if (data.hasOwnProperty(key)) {
                let tmp = data[key];
                if (compareTypeWithDefault === true) {
                    if (typeof tmp === typeof defaultData) return tmp;
                } else return tmp;
            }
        }
        return defaultData;
    }

    static cleanDataNotify(data) {
        if (data && typeof data === 'object' && data.hasOwnProperty('errors')) {
            data = data.errors;
            switch (typeof data) {
                case 'object':
                    ['status'].map((key) => {
                        delete data[key];
                    });
                    break;
                default:
                    data = {'': data.toString()}
            }
        } else {
            ['status'].map((key) => {
                delete data[key];
            });
        }
        return data;
    }

    static checkAndAddFormErrors(source$ , key, message, destination){
        if (key && message){
            const inp$ = source$.find(`:input[name=${key}]`);
            if (inp$.length > 0){
                const frm$ = inp$.closest('form');
                if (frm$.length > 0){
                    const formID = frm$.attr('id');
                    if (formID){
                        const validator = frm$.data('validator');
                        if (validator){
                            if (!destination.hasOwnProperty(formID)) destination[formID] = {};
                            destination[formID][key] = message;
                        }
                    }
                }
            }
        }
    }

    static showFormErrors(formIdErrors){
        Object.keys(formIdErrors).map(
            formID => {
                const form$ = $('#' + formID);
                const validator = form$.data('validator');
                if (validator){
                    validator.showErrors(formIdErrors[formID]);
                }
            }
        )
    }

    static showAndScrollToInputError($input) {
        let $tabPane = $input.closest('.tab-pane');
        let $modal = $input.closest('.modal');

        if ($tabPane.length && !$tabPane.hasClass('active')) {
            let tabId = $tabPane.attr('id');
            $(`a[href="#${tabId}"]`).tab('show');
        }

        if ($modal.length && !$modal.hasClass('show')) {
            $modal.modal('show');
        }

        setTimeout(function() {
            $x.fn.scrollToIdx($input);
        }, 200);
    }

    static makeSureOneInputErrorIsShowing(areaControl$, allInputErrors){
        if (allInputErrors.length > 0){
            let listInp$ = [];
            for (let i = 0 ; i < allInputErrors.length ; i++){
                const inp$ = areaControl$.find(`:input[name=${allInputErrors[i]}]`);
                if (inp$.length > 0) {
                    if (inp$.is(':visible')) {
                        $x.fn.scrollToIdx(inp$);
                        return;
                    }
                    listInp$.push(inp$);
                }
            }
            if (listInp$.length > 0) {
                for (let i = 0 ; i < listInp$.length ; i++){
                    const insideModal = listInp$[i].closest('.modal').length > 0;
                    const insideTab = listInp$[i].closest('.tab-content').length > 0;
                    if (insideModal === false && insideTab === false){
                        $x.fn.scrollToIdx(listInp$[i]);
                        return;
                    }
                }
                UtilControl.showAndScrollToInputError(listInp$[0]);
            }
        }
    }

    static notifyErrors(errs, opts = {}) {
        let confirmOpts = $.extend(
            {
                'areaControl': $(''),
                'autoDetectShowErrors': true,
                'keyNotMatch': '',
                'replaceKey': {},
                'isShowKey': true,
            },
            opts
        )
        const areaControl$ = confirmOpts['areaControl'] instanceof jQuery ? confirmOpts['areaControl'] : $('');

        function resolveDataNotify(key, data) {
            if (confirmOpts.isShowKey === true) {
                if (confirmOpts.replaceKey) {
                    if (confirmOpts.replaceKey.hasOwnProperty(key)) return {
                        'title': confirmOpts.replaceKey[key],
                        'description': data
                    }
                    if (typeof confirmOpts.keyNotMatch === "string") return {
                        'title': confirmOpts.keyNotMatch,
                        'description': data
                    }
                }
                return {
                    'title': key,
                    'description': data
                }
            }
            return {'description': data}
        }

        if (errs) {
            if (typeof errs === 'object') {
                let allInputErrors = [];
                let formIdErrors = {};
                let errors_converted = UtilControl.cleanDataNotify(errs);
                Object.keys(errors_converted).map((key) => {
                    const notifyData = resolveDataNotify(key, errors_converted[key])
                    jQuery.fn.notifyB(notifyData, 'failure');
                    if (confirmOpts?.['autoDetectShowErrors'] === true) {
                        UtilControl.checkAndAddFormErrors(
                            areaControl$,
                            key,
                            notifyData['description'],
                            formIdErrors,
                        );
                    }
                    allInputErrors.push(key);
                });
                UtilControl.showFormErrors(formIdErrors);
                UtilControl.makeSureOneInputErrorIsShowing(areaControl$, allInputErrors);
            } else if (typeof errs === 'string') {
                jQuery.fn.notifyB({
                    'description': errs
                }, 'failure');
            } else if (Array.isArray(errs)) {
                errs.map((item) => {
                    jQuery.fn.notifyB({
                        'description': item
                    }, 'failure');
                })
            }
        }
    }

    static removeEmptyValuesFromObj(object) {
        for (let key in object) {
            if (object.hasOwnProperty(key)) {
                let value = object[key];
                if (value === null || value === undefined || value === '') {
                    delete object[key];
                }
            }
        }
        return object;
    }

    static getRandomArbitrary(min, max) {
        min = Math.ceil(min);
        max = Math.ceil(max);
        return Math.ceil(Math.random() * (max - min) + min);

    }

    static getRandomInArray(array) {
        return array[Math.floor(Math.random() * array.length)];
    }

    static keepExistInOther(arr_main, arr_check_remove) {
        // arr_main:    ["1", "2", "3"]
        // arr_check:   ["1", "3", "4"]
        // => ["1", "3"]
        if (Array.isArray(arr_main) && Array.isArray(arr_check_remove)) {
            return arr_main.filter(
                (item) => {
                    return arr_check_remove.indexOf(item) !== -1;
                }
            )
        }
        return [];
    }

    static removeExistInOther(arr_main, arr_check_remove) {
        // arr_main:    ["1", "2", "3"]
        // arr_check:   ["1", "3", "4"]
        // => ["2"]
        if (Array.isArray(arr_main) && Array.isArray(arr_check_remove)) {
            return arr_main.filter(
                (item) => {
                    return arr_check_remove.indexOf(item) === -1;
                }
            )
        }
        return [];
    }

    static hasOwnProperties(objData, keys) {
        if (objData && typeof objData === 'object' && Array.isArray(keys)) {
            for (let i = 0; i < keys.length; i++) {
                if (!objData.hasOwnProperty(keys[i])) {
                    return false;
                }
            }
            return true;
        }
        return false;
    }

    static displayRelativeTime(dataStr, opts = {}, only_date=false) {
        if (dataStr) {
            let format = opts?.['format'] || "YYYY-MM-DD HH:mm:ss";
            let outputFormat = opts?.['outputFormat'] || "DD-MM-YYYY HH:mm:ss";
            let callback = opts?.['callback'] || function (data) {
                if (only_date) {
                    return `<span>${data.output}</span>`;
                }
                return `<span>${data.output}</span> <span class="small">(${data.relate})</span>`;
            }
            const objDT = moment(dataStr, format);
            let relateTimeStr = objDT.fromNow();
            let appendStrData = objDT.format(outputFormat);
            return callback({
                'relate': relateTimeStr,
                'output': appendStrData,
                'objDT': objDT,
                'format': format,
                'outputFormat': outputFormat,
            });
        }
        return '--';
    }

    static checkNumber(dataStr) {
        return !isNaN(Number(dataStr))
    }

    static convertToSlug(txt, opts) {
        opts = {
            1: [/[^\w -]+/g, ""],
            2: [/ +/g, "-"],
            ...opts,
        }

        Object.keys(opts)
            .map(
                key => {
                    try {
                        return parseInt(key);
                    } catch (e) {
                        return null;
                    }
                }
            )
            .filter(key => key !== null)
            .sort()
            .map(
                key => {
                    let config = opts?.[key];
                    if (!config) {
                        config = opts?.[key.toString()];
                    }
                    if (config && Array.isArray(config) && config.length === 2) {
                        txt = txt.replace(config[0], config[1]);
                    }
                }
            )

        return txt
    }

    static flattenObject(obj, parentKey = '', result = {}) {
        // {a: {b: 1}, c: 2} => {a__b: 1, c: 2}
        for (let key in obj) {
            let newKey = parentKey ? `${parentKey}__${key}` : key;
            if (typeof obj[key] === 'object' && obj[key] !== null) {
                UtilControl.flattenObject(obj[key], newKey, result);
            } else {
                result[newKey] = obj[key];
            }
        }
        return result;
    }

    static flattenObjectParams(obj, parentKey = '', result = {}) {
        if (Array.isArray(obj)) {
            result[parentKey] = obj;
        } else {
            for (let key in obj) {
                let newKey = parentKey ? `${parentKey}__${key}` : key;
                if (typeof obj[key] === 'object' && obj[key] !== null) {
                    UtilControl.flattenObjectParams(obj[key], newKey, result);
                } else {
                    result[newKey] = obj[key];
                }
            }
        }
        return result;
    }

    static sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    static escapeHTML(txt) {
        return txt
            .toString()
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;');
    }

    static decodeURI(txt){
        return decodeURIComponent((txt + '').replace(/\+/g, '%20'))
    }

    static cutMaxlength(txt, maxNum){
        txt = txt.toString();
        if (txt.length > maxNum) return txt.slice(0, maxNum) + '...';
        return txt;
    }
}

class DTBControl {
    // Handle every thing about DataTable
    static getRowData(ele$) {
        // element call from in row of DataTable
        let row = $(ele$).closest('tr');
        return $($(ele$).closest('table')).DataTable().row(row).data();
    }

    static deleteRow(ele$) {
        $(ele$).closest('table').DataTable().row($(ele$).parents('tr')).remove().draw();
    }

    static updateDataRow(clsThis, func, isDraw = false) {
        clsThis = $(clsThis).is('tr') ? $(clsThis) : $(clsThis).closest('tr');
        let dtb = ($(clsThis).is('table') ? $(clsThis) : $(clsThis).closest('table')).DataTable();
        let rowIdx = dtb.row(clsThis).index();
        let rowData = $x.fn.getRowData($(clsThis));
        let newData = func(clsThis, rowIdx, rowData);
        let dtbAfter = dtb.row(rowIdx).data(newData);
        if (isDraw === true) dtbAfter.draw(false);
        return dtbAfter;
    }

    checkRowSelect(opts) {
        let $this = this
        if (opts?.['fullToolbar'] === true)
            // init on click when enable count select
            $('.check-select, .check-select-all', this.dtb$).on('change', function (e) {
                e.stopPropagation()
                if ($(this).hasClass('check-select-all')) {
                    // continue
                    let listData = $(this).closest('table').DataTable().rows({page: 'current'}).data().toArray()
                    $('.check-select', $this.dtb$).prop('checked', this.checked)
                    for (let item of listData) {
                        $this.setRowSelected = {
                            item: item,
                            idTable: $(this).closest('table').attr('id'),
                            checked: this.checked
                        }
                    }
                } else {
                    const rowData = $(this).closest('table').DataTable().row($(this).closest('tr')).data();
                    $this.setRowSelected = {
                        item: rowData,
                        idTable: $(this).closest('table').attr('id'),
                        checked: this.checked
                    }

                }
                // count and print to text noti in toolbar
                const allData = $this.getRowSelected
                $('.count_selected').html($.fn.transEle.attr('data-datatable-count-txt').replace(
                    '{0}',
                    Object.keys(allData[$(this).closest('table').attr('id')]).length
                ))
            });
    }

    reCheckSelect(sgs) {
        const ckAll = $('.check-select-all', $(sgs.oInstance))
        if (ckAll.length) ckAll.prop('checked', false)
        let rowSelect = this.getRowSelected
        rowSelect = rowSelect[sgs.sInstance] || {}
        let isFull = true
        if (Object.keys(rowSelect).length > 0) {
            for (let item of sgs?.aoData) {
                if (rowSelect[item?._aData?.id]) {
                    item._aData.checked = true
                    $('input', item.anCells[0]).attr('checked', true)
                } else {
                    isFull = false
                    item._aData.checked = false
                }
            }
        } else isFull = false
        if (isFull) ckAll.prop('checked', true)
    }

    static getTableSelected(tableID) {
        let dataList = $('#tbl-stored').text()
        if (dataList) dataList = JSON.parse(dataList)
        dataList = dataList[tableID] || {}
        return dataList
    }

    static prepareHTMLToolbar(divWrap, _settgs) {
        // show selected show count select is display
        $('.count_selected', divWrap).html(`<p>${
            $.fn.transEle.attr('data-datatable-count-txt').replace('{0}', '0')}</p>`)
        divWrap.find('.select2:not(:disabled)').initSelect2();
        // show column show/hide
        const $custom_tb = $('.custom_toolbar', divWrap).append(
            `<div class="dropdown ct_toolbar-columns">` +
            `<button data-bs-toggle="dropdown" class="btn btn-outline-light dropdown-toggle" type="button">` +
            `<i class="fa-solid fa-list"></i></button><div role="menu" class="dropdown-menu p-4"></div></div>`
        )
        let columnList = `<div class="form-check form-check-sm">` +
            `<input type="checkbox" class="form-check-input check_all" id="tb_columns-all" checked>` +
            `<label class="form-check-label" for="tb_columns-all">${$.fn.transEle.attr('data-all')}</label></div><hr class="mt-1 mb-1">`;
        for (let item of _settgs.aoColumns) {
            if (item?.data) {
                columnList += `<div class="form-check form-check-sm">` +
                    `<input type="checkbox" class="form-check-input" data-column="${item.idx}" id="tb_columns-${item.idx}" checked>` +
                    `<label class="form-check-label" for="customChecks1">${item.sTitle}</label></div>`
            }
        }
        $('.ct_toolbar-columns .dropdown-menu', divWrap).html(columnList)
    }

    set setRowSelected(rowData) {
        let temp = this.dataSelect
        if (!temp.hasOwnProperty(rowData.idTable))
            temp[rowData.idTable] = {}
        if (rowData.checked)
            temp[rowData.idTable][rowData.item.id] = rowData.item
        else
            delete temp[rowData.idTable][rowData.item.id]
        this.dataSelect = temp
        let storeElm = $(`<script id="tbl-stored" type="application/json">`)
        storeElm.text(JSON.stringify(temp))
        if ($(`body`).find('#tbl-stored').length === 0) {
            storeElm.insertAfter($.fn.transEle)
        } else $('#tbl-stored', 'body').text(JSON.stringify(temp))
    }

    get getRowSelected() {
        return this.dataSelect
    }

    static __fillDefaultSelect2Filter(ele$) {
        if (!$(ele$).attr('data-maximumSelectionLength')) {
            $(ele$).attr('data-maximumSelectionLength', 5);
        }
        if (!$(ele$).attr('data-cache')) {
            $(ele$).attr('data-cache', 'true');
        }
        if (!$(ele$).attr('data-allowClear')) {
            $(ele$).attr('data-allowClear', 'true');
        }
        return $(ele$);
    }

    static parseHeaderDropdownFilter(columns, settings, tbl) {
        let api = tbl.DataTable();
        let $thead = api.table().header();
        let hasColHeaderFilter = false;
        let rowColFilterEle = $(`<tr class="row-custom-filter"></tr>`);
        (columns || []).map(
            (item) => {
                let colFilter = item?.['colFilter'];
                if (colFilter) {
                    hasColHeaderFilter = true;

                    let attrTxt = '';
                    Object.keys(colFilter).map(
                        (key) => {
                            if (key !== 'keyParam' && key !== 'dataUrl' && key !== 'keyResp') {
                                attrTxt += ` data-${key}="${colFilter[key]}"`
                            }
                        }
                    )
                    $(`<th>
                         <select
                            class="select-custom-filter"
                            data-keyParam="${colFilter.keyParam}"
                            data-url="${colFilter.dataUrl}"
                            data-keyResp="${colFilter.keyResp}"
                            ${attrTxt}
                            multiple
                        ></select>
                    </th>`).appendTo(rowColFilterEle);
                } else {
                    $(`<th></th>`).appendTo(rowColFilterEle);
                }
            }
        )
        if (hasColHeaderFilter) {
            rowColFilterEle.appendTo($($thead));
        }
        setTimeout(
            () => {
                $($thead).find('select.select-custom-filter').each(function () {
                    DTBControl.__fillDefaultSelect2Filter($(this)).initSelect2();
                }).on('select2:close', function () {
                    api.table().ajax.reload();
                }).on('select2:clear', function () {
                    api.table().ajax.reload();
                }).on('select2:unselect', function () {
                    api.table().ajax.reload();
                });
            },
            0
        );
    }

    static _summaryFilterToText(textFilterEle, manualFilterEle = null, textManual = []) {
        if (textFilterEle) {
            let textFilterSelected = [];

            if (manualFilterEle) {
                manualFilterEle.find('select.custom-filter-manual-dtb').each(function () {
                    let valSelected = $(this).val();
                    if (valSelected) {
                        if (Array.isArray(valSelected)) {
                            let textDisplay = [];
                            $(this).find('option:selected').each(function () {
                                textDisplay.push($(this).text());
                            })
                            if (textDisplay && textDisplay.length > 0) {
                                textFilterSelected.push(`<span data-select-id="${$(this).attr('id')}"  class="badge badge-light badge-outline mr-1 mb-1"><i class="fa-regular fa-circle-xmark remove-filter-child"></i> ${$(this).closest('.form-group').find('label small').text()} : ${textDisplay.join(", ")}</span>`)
                            }
                        } else {
                            let textDisplay = $(this).find('option:selected').text();
                            if (textDisplay) {
                                textFilterSelected.push(`<span data-select-id="${$(this).attr('id')}"  class="badge badge-light badge-outline mr-1 mb-1"><i class="fa-regular fa-circle-xmark remove-filter-child"></i> ${$(this).closest('.form-group').find('label small').text()} : ${textDisplay}</span>`)
                            }
                        }
                    }
                });
            } else if (textManual) {
                textManual.map(
                    (item) => {
                        if (item.text) {
                            textFilterSelected.push(`<span data-select-id="${item.idx}" class="badge badge-light badge-outline mr-1 mb-1"><i class="fa-regular fa-circle-xmark remove-filter-child"></i> ${item.placeholder} : ${item.text}</span>`);
                        }
                    }
                )
            }
            if (textFilterSelected.length <= 5) {
                textFilterEle.html(textFilterSelected.join(``))
            } else {
                textFilterEle.html(textFilterSelected.slice(1, 5).join("") + `<button class='btn btn-soft-light btn-sm show-more-filter-text'>...</button><script class="hidden">${JSON.stringify(textFilterSelected)}</script>`)
            }

            textFilterEle.on('click', '.show-more-filter-text', function () {
                Swal.fire({
                    html: textFilterSelected.join(""),
                })
            }).on('click', '.remove-filter-child', function () {
                let ele = $('#' + $(this).closest('span').attr('data-select-id'));
                if (ele.length > 0) {
                    ele.val("");
                    ele.trigger('change');
                    $(this).remove();
                }
            })
        }
    }

    static _parseCusTools(settings, wrapperEle) {
        let cusToolData = [];
        (settings.oInit.cusTool || []).map(
            (item) => {
                let idx = $x.fn.randomStr(32);
                let autoFillRequired = {};
                switch (item.code) {
                    case 'draft':
                        autoFillRequired['icon'] = `<i class="fa-regular fa-note-sticky"></i>`;
                        autoFillRequired['text'] = $.fn.transEle.attr('data-msg-draft');
                        break
                    case 'export':
                        autoFillRequired['icon'] = `<i class="fa-solid fa-file-export"></i>`;
                        autoFillRequired['text'] = $.fn.transEle.attr('data-msg-export-to-file');
                        break
                }

                let config = {
                    'idx': idx,
                    'code': null,
                    'icon': '',
                    'text': '',
                    'url': '#',
                    'className': '',
                    'eClick': null,
                    ...autoFillRequired,
                    ...item,
                }

                if (config.icon) {
                    if (config.icon.includes('class="')) {
                        config.icon = config.icon.replace('class="', 'class="dropdown-icon ');
                    } else if (config.icon.includes("class='")) {
                        config.icon = config.icon.replace("class='", "class='dropdown-icon ");
                    }
                }

                let ele = $(`<a class="dropdown-item ${config.className}" id="${idx}" href="${config.url}">${config.icon}<span>${config.text}</span></a>`);
                if (config.eClick) wrapperEle.on('click', '#' + idx, config.eClick);
                cusToolData.push(ele.prop('outerHTML'));
            }
        );
        return cusToolData;
    }

    static parseFilter2(dtb, settings, json) {
        let wrapperEle = dtb.closest('.dataTables_wrapper');
        let groupCustomEle = wrapperEle.find('.util-btn');
        let filterEle = wrapperEle.find('.dataTables_filter');

        // handle customize filter
        let btnFilterEle = wrapperEle.find('.btnAddFilter');
        let textFilterEle = wrapperEle.find('.textFilter');
        let manualFilterEle = wrapperEle.find('.manualFilter');
        let cusFilterArr = [];
        let initTextFilter = [];
        let cusFilter = settings.oInit?.['cusFilter'] || [];
        if (cusFilter && Array.isArray(cusFilter)) {
            cusFilter.map(
                (item) => {
                    let config = {
                        keyText: 'title',
                        keyId: 'id',
                        keyResp: null,
                        dataUrl: null,
                        keyParam: null,
                        placeholder: null,
                        data: [],   // [{'id': '', 'text': '', selected: false}]
                        ...item,
                    }
                    if (
                        (config.keyResp && config.dataUrl && config.keyParam && config.keyText && config.keyId) ||
                        (!config.dataUrl && config.data && Array.isArray(config.data) && config.data.length > 0)
                    ) {
                        let textSelected = '';
                        let attrHTML = ['data-method="GET"'];
                        Object.keys(config).map(
                            (key) => {
                                if (config[key]) {
                                    if (key === 'dataUrl') {
                                        attrHTML.push(`data-url="${config.dataUrl}"`);
                                    } else if (key === 'dataMethod') {
                                        attrHTML.push(`data-method="${config.dataMethod}"`);
                                    } else if (key === 'placeholder') {
                                        attrHTML.push(`data-placeholder="${config.placeholder}"`);
                                    } else if (key === 'data') {
                                        config['data'].map(
                                            (itemOnload) => {
                                                if (itemOnload?.['selected'] === true) {
                                                    let keyTextTmp = config?.['keyText'] || 'title';
                                                    textSelected = itemOnload?.[keyTextTmp] || '';
                                                }
                                            }
                                        )
                                    } else if (key === 'multiple') {
                                        attrHTML.push(`multiple`);
                                    } else if (key === 'allowClear') {
                                        attrHTML.push('data-allowClear="true"');
                                    } else {
                                        attrHTML.push(`data-${key}="${config[key]}"`);
                                    }
                                }
                            }
                        )

                        let fakeIdx = $x.fn.randomStr(32);
                        cusFilterArr.push(`
                            <div class="col-12 col-md-4 w-200p mb-1">
                                <div class="form-group">
                                    <label for="${fakeIdx}"><small>${config.placeholder}</small></label>
                                    <select 
                                        id="${fakeIdx}"
                                        class="custom-filter-manual-dtb form-select form-select-sm"
                                        ${attrHTML.join(" ")}
                                        data-onload='${JSON.stringify(config.data || [])}'
                                    ></select>
                                </div>
                            </div>
                        `);
                        initTextFilter.push({
                            'placeholder': config.placeholder,
                            'text': textSelected,
                            'idx': fakeIdx,
                        })
                    }
                }
            )
        }
        if (cusFilterArr && cusFilterArr.length > 0) {
            btnFilterEle.html(`
                <button 
                    class="btn btn-light btn-sm mr-1"
                    data-bs-toggle="tooltip"
                    data-bs-placement="bottom"
                    title="${$.fn.transEle.attr('data-msg-open-close-filter')}"
                    type="button"
                >
                    <span>
                        <span class="icon dtb-icon-btn-filter"><i class="fa-solid fa-filter" style="color: #707070;"></i></span>
                        <span class="dtb-text-btn-filter">${$.fn.transEle.attr('data-msg-filter')}</span>
                    </span>
                </button>
            `);
            manualFilterEle.html(cusFilterArr.join(""));
            wrapperEle.on('click', '.btnAddFilter', function () {
                wrapperEle.find('.manualFilter').toggleClass('hidden');
            });
            DTBControl._summaryFilterToText(textFilterEle, null, initTextFilter);
        }

        // append filter search class form-control-sm
        filterEle.addClass('mr-1');
        filterEle.find('input[type="text"]'); // .addClass('form-control w-200p');

        // handle sort
        let preKeyVisible = settings.aoHeader[0].map((item) => {
            return $(item.cell).text().trim();
        });
        let keyVisible = [];

        let keySort = [];
        settings.aoColumns.map(
            (colConfig, idx) => {
                let colSortSTitle = colConfig?.['sTitle'] || '';
                let colSortEnabled = colConfig?.['orderable'] || false;
                let colSortMKey = colConfig?.['mData'] || '';
                if (colSortEnabled && colSortMKey) {
                    keySort.push(`<option value="${colSortMKey}">${colSortSTitle}</option>`);
                }

                let colText = preKeyVisible[idx];
                let isVisible = colConfig?.['bVisible'] || false;
                let idxCol = colConfig?.['idx'];
                let randomStringData = $x.fn.randomStr(32);
                if (colText)
                    keyVisible.push(`
                        <li class="d-flex align-items-center justify-content-between mb-1">
                            <div class="form-check">
                                <input 
                                    type="checkbox" 
                                    class="form-check-input custom-visible-item-dtb" 
                                    id="${randomStringData}" ${isVisible ? 'checked' : ''}
                                    data-idx="${idxCol}"
                                >
                                <label class="form-check-label" for="${randomStringData}">${colText}</label>
                            </div>
                        </li>
                    `)
            }
        )

        let keySortHtml = '';
        if (settings.oInit['enableSortColumns'] === true) {
            keySortHtml = keySort.length > 0 ? `
                <div 
                    class="input-group input-group-sm w-115p ml-1"
                    data-bs-toggle="tooltip"
                    title="${$.fn.transEle.attr('data-msg-sorting-by')}"
                >
                    <select class="form-select form-select-sm w-80p custom-order-dtb">
                        <option selected></option>
                            ${keySort.join("")}
                    </select>
                    <button class="btn btn-light custom-order-asc-dtb w-35p" type="button" disabled>
                        <i class="fa-solid fa-arrow-down-a-z"></i>
                    </button>
                </div>
            ` : '';
        }

        // handle tools
        let cusToolHtml = '';
        if (settings.oInit['let cusToolHtml'] === true) {
            let cusToolData = DTBControl._parseCusTools(settings, wrapperEle) || [];
            cusToolHtml = cusToolData.length > 0 ? `
                <div 
                    class="btn-group btn-group-sm dropdown ml-1"
                    data-bs-toggle="tooltip"
                    title="${$.fn.transEle.attr('data-msg-tools')}"
                >
                    <button type="button" class="btn btn-light dropdown-toggle" data-bs-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                        <i class="fa-regular fa-lightbulb"></i>
                    </button>
                    <div class="dropdown-menu w-150p">
                        ${cusToolData.join("")}
                    </div>
                </div>
            ` : '';
        }

        // handler visible
        let keyVisibleHtml = '';
        if (settings.oInit['enableVisibleColumns'] === true) {
            keyVisibleHtml = keyVisible.length > 0 ? `
                <div 
                    class="btn-group btn-group-sm dropdown ml-1"
                    data-bs-toggle="tooltip"
                    title="${$.fn.transEle.attr('data-msg-show-hide-columns')}"
                >
                    <button type="button" class="btn btn-light dropdown-toggle" data-bs-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                        <i class="fa-solid fa-list"></i>
                    </button>
                    <div class="dropdown-menu w-150p">
                        <ul class="p-0 m-0 custom-visible-dtb">
                            <li class="d-flex align-items-center justify-content-between mb-1">
                                <div class="form-check">
                                    <input 
                                        type="checkbox" 
                                        class="form-check-input check-all" 
                                        id="${dtb.attr('id')}-visible-check-all"
                                    >
                                    <blabel class="form-check-label" for="${dtb.attr('id')}-visible-check-all"><b>${$.fn.transEle.attr('data-all')}</b></label>
                                </div>
                            </li>
                            ${keyVisible.join("")}
                        </ul>
                    </div>
                </div>
            ` : '';
        }

        if (
            keySortHtml.length > 0 ||
            keyVisibleHtml.length > 0 ||
            cusToolHtml.length > 0
        ) {
            groupCustomEle.html(`
                <div class="d-flex justify-content-end align-items-center">
                    ${keySortHtml}
                    ${keyVisibleHtml}
                    ${cusToolHtml}
                </div>
            `).on(
                'change', 'select.custom-order-dtb', function () {
                    if ($(this).val()) {
                        $(this).parent().find('.custom-order-asc-dtb').prop('disabled', false);
                        dtb.DataTable().ajax.reload();
                    } else {
                        $(this).parent().find('.custom-order-asc-dtb').prop('disabled', true);
                    }
                }
            ).on(
                'click', 'button.custom-order-asc-dtb', function () {
                    $(this).find('i').toggleClass('fa-arrow-down-a-z').toggleClass('fa-arrow-down-z-a');
                    dtb.DataTable().ajax.reload();
                }
            ).on(
                'change', 'input.custom-visible-item-dtb',
                function () {
                    // handle check all
                    let ddEle = $(this).closest('.dropdown-menu');
                    let allEle = ddEle.find('input.check-all');
                    let arrChecked = true;
                    ddEle.find('input.custom-visible-item-dtb').each(function () {
                        if ($(this).prop('checked') === false) arrChecked = false;
                    });
                    allEle.prop('checked', arrChecked);

                    // handle this item
                    let idx = Number.parseInt($(this).attr('data-idx'));
                    if (Number.isInteger(idx)) {
                        let currentVal = $(this).prop('checked');
                        dtb.DataTable().column(idx).visible(currentVal);
                    }
                    $.fn.initMaskMoney2();
                }
            ).on(
                'change', 'input.check-all',
                function () {
                    let currentVal = $(this).prop('checked');
                    $(this).closest('.dropdown-menu').find('input.custom-visible-item-dtb').each(function () {
                        $(this).prop('checked', currentVal).trigger('change');
                    });
                    $.fn.initMaskMoney2();
                }
            );
            wrapperEle.on('change', 'select.custom-filter-manual-dtb', function () {
                dtb.DataTable().ajax.reload();
                DTBControl._summaryFilterToText(
                    textFilterEle, manualFilterEle,
                )
            });

            setTimeout(
                () => {
                    wrapperEle.find('select.custom-filter-manual-dtb').each(function () {
                        $(this).initSelect2({
                            allowClear: true,
                            keepIdNullHasText: true,
                        })
                    });
                    wrapperEle.find('input.custom-visible-item-dtb').each(function () {
                        $(this).trigger('change');
                    })
                },
                1000
            )
        } else {
            // hidden toolbar when not any tool has already.
            let stateHidden = true;
            let eleHeaderToolbar = wrapperEle.find('.dtb-header-toolbar');
            eleHeaderToolbar.children('div').each(function () {
                if ($(this).children().length > 0) stateHidden = false;
            });
            if (stateHidden === true) eleHeaderToolbar.addClass('hidden');
        }
    }

    static parseDomDtl(opts) {
        // header Toolbar class name
        let headerToolbarClsName = opts['headerToolbarClsName'] || 'mt-2';

        // stateDefaultPageControl: disable all toolbar
        let stateDefaultPageControl = typeof opts?.['stateDefaultPageControl'] === 'boolean' ? opts?.['stateDefaultPageControl'] : true;
        if (opts.hasOwnProperty('stateDefaultPageControl')) delete opts['stateDefaultPageControl'];

        // let domDTL = "<'row miner-group'<'col-sm-12 col-md-3 col-lg-2 mt-3'f>>" +
        //     "<'row mt-3'<'col-sm-12 col-md-6'<'count_selected'>><'col-sm-12 col-md-6'<'custom_toolbar'>>>" +
        //     "<'row mt-3'<'col-sm-12 col-md-6'l><'col-sm-12 col-md-6'p>>" +
        //     "<'row mt-3'<'col-sm-12'tr>>" +
        //     "<'row mt-3'<'col-sm-12 col-md-6'i>>";

        // style 1
        let styleDom = opts?.['styleDom'] || 'full';
        let domDTL = `<'d-flex dtb-header-toolbar ${headerToolbarClsName}'<'btnAddFilter'>B<'textFilter overflow-hidden'>f<'util-btn'>><'row manualFilter hidden'>` + 'rt';
        if (styleDom === 'small') {
            domDTL += `<'row tbl-footer-toolbar' <'cus-page-info'<'col-12 d-flex justify-content-center py-1'l><'col-12  d-flex justify-content-center py-1'i><'col-12  d-flex justify-content-center py-1'p>>>`;
        } else if (styleDom === 'hide-foot') {
            domDTL += ``;
        } else {
            domDTL += `<'row tbl-footer-toolbar' <'col-lg-6 col-md-12 d-flex cus-page-info'li><'col-lg-6 col-md-12'p>>`;
        }

        let utilsDom = {
            // "l": Đại diện cho thanh điều hướng (paging) của DataTable.
            // "f": Đại diện cho hộp tìm kiếm (filtering) của DataTable.
            // "t": Đại diện cho bảng (table) chứa dữ liệu.
            // "i": Đại diện cho thông tin về số hàng hiển thị và tổng số hàng.
            // "p": Đại diện cho thanh phân trang (pagination).
            // "r": Đại diện cho sắp xếp (ordering) của các cột.
            // "s": Đại diện cho hộp chọn số hàng hiển thị.
            visiblePaging: stateDefaultPageControl, // "l"
            visibleSearchField: stateDefaultPageControl,   // "f"
            visibleDisplayRowTotal: stateDefaultPageControl,   // "i"
            visiblePagination: stateDefaultPageControl,   // "p"
            visibleOrder: stateDefaultPageControl,   // "r"
            visibleRowQuantity: stateDefaultPageControl,   // "s"
            visibleButton: false, // button
        }
        // show or hide button
        if (opts.hasOwnProperty('visibleButton')) {
            if ($.fn.isBoolean(opts['visibleButton'])) utilsDom.visibleButton = opts['visibleButton'];
            delete opts['visibleButton']
        }
        if (utilsDom.visibleButton === false) domDTL = domDTL.replace('>B<', '><');

        // show or hide search field
        if (opts.hasOwnProperty('visiblePaging')) {
            if ($.fn.isBoolean(opts['visiblePaging'])) utilsDom.visiblePaging = opts['visiblePaging'];
            delete opts['visiblePaging'];
        }
        if (utilsDom.visiblePaging === false) domDTL = domDTL.replace('l>', '>');

        // show or hide search field
        if (opts.hasOwnProperty('visibleSearchField')) {
            if ($.fn.isBoolean(opts['visibleSearchField'])) {
                utilsDom.visibleSearchField = opts['visibleSearchField'];
                opts.searching = opts['visibleSearchField'];
            }
            delete opts['visibleSearchField']
        }
        if (utilsDom.visibleSearchField === false) {
            domDTL = domDTL.replace('f>', '>').replaceAll('miner-group', 'miner-group hidden');
        }

        // show or hide row total field
        if (opts.hasOwnProperty('visibleDisplayRowTotal')) {
            if ($.fn.isBoolean(opts['visibleDisplayRowTotal'])) utilsDom.visibleDisplayRowTotal = opts['visibleDisplayRowTotal'];
            delete opts['visibleDisplayRowTotal']
        }
        if (utilsDom.visibleDisplayRowTotal === false) domDTL = domDTL.replace('i>', '>');

        // show or hide page field
        if (opts.hasOwnProperty('visiblePagination')) {
            if ($.fn.isBoolean(opts['visiblePagination'])) utilsDom.visiblePagination = opts['visiblePagination'];
            delete opts['visiblePagination']
        }
        if (utilsDom.visiblePagination === false) {
            domDTL = domDTL.replace('p>', '>');
            utilsDom['pageLength'] = -1; // full page
        }

        // show or hide order field
        if (opts.hasOwnProperty('visibleOrder')) {
            if ($.fn.isBoolean(opts['visibleOrder'])) utilsDom.visibleOrder = opts['visibleOrder'];
            delete opts['visibleOrder']
        }
        if (utilsDom.visibleOrder === false) domDTL = domDTL.replace('r>', '>');

        // show or hide row quantity field
        if (opts.hasOwnProperty('visibleRowQuantity')) {
            if ($.fn.isBoolean(opts['visibleRowQuantity'])) utilsDom.visibleRowQuantity = opts['visibleRowQuantity'];
            delete opts['visibleRowQuantity']
        }
        if (utilsDom.visibleRowQuantity === false) domDTL = domDTL.replace('s>', '>');

        // show/hide custom toolbar
        if (!opts.hasOwnProperty('fullToolbar') || opts?.['fullToolbar'] === false) {
            // show hide/row selected
            domDTL = domDTL.replace("<'count_selected'>", '')
            // show hide custom toolbar
            domDTL = domDTL.replace("<'custom_toolbar'>", '')
        }

        return [opts, domDTL];
    }

    static cleanBaseKeyOfDataAjax(d) {
        if (typeof d === "object" && Object.keys(d).length > 0) {
            let keyHasRemove = ['columns', 'draw', 'length', 'order', 'ordering', 'search', 'start', 'page', 'pageSize']
            let result = {};
            Object.keys(d).map(
                (key) => {
                    if (keyHasRemove.indexOf(key) === -1) {
                        result[key] = d[key];
                    }
                }
            )
            return result
        }
        return {};
    }

    static cleanParamBeforeCall(params, keyKeepEmpty = []) {
        let result = {}
        if (params && typeof params === 'object') {
            Object.keys(params).map(
                (key) => {
                    let val = params[key];
                    if (
                        val
                        || typeof val === 'boolean'
                        || typeof val === 'number'
                        || keyKeepEmpty.includes(key)
                    ) result[key] = val;
                }
            )
        }
        return result;
    }

    static addCommonAction(urls, data) {
        let link = urls?.['data-edit'].format_url_with_uuid(data?.['id']);
        let disabled = '';
        if ([2, 3].includes(data?.['system_status'])) {
            disabled = 'disabled';
        }
        let bodyBase = `<a class="dropdown-item ${disabled}" href="${link}"><i class="dropdown-icon far fa-edit"></i><span>${$.fn.transEle.attr('data-edit')}</span></a>
                        <a class="dropdown-item action-delete hidden" href="#" data-id="${data?.['id']}"><i class="dropdown-icon far fa-trash-alt"></i><span>${$.fn.transEle.attr('data-delete')}</span></a>`;
        if (data?.['is_delete'] === true) {
            bodyBase = `<a class="dropdown-item action-delete" href="#" data-id="${data?.['id']}"><i class="dropdown-icon far fa-trash-alt"></i><span>Restore</span></a>`;
        }
        return `<div class="dropdown">
                    <button type="button" class="btn btn-icon btn-rounded btn-flush-light flush-soft-hover btn-lg" aria-expanded="false" data-bs-toggle="dropdown"><span class="icon"><i class="far fa-caret-square-down"></i></span></button>
                    <div role="menu" class="dropdown-menu dropdown-menu-actions">
                        ${bodyBase}
                    </div>
                </div>`;
    }

    static pushButtonsToDtb(tableID) {
        if (window.location.href.includes('/detail/')) {
            let $table = $(`#${tableID}`);
            let wrapper$ = $table.closest('.dataTables_wrapper');
            let headerToolbar$ = wrapper$.find('.dtb-header-toolbar');
            let textFilter$ = $('<div class="d-flex overflow-x-auto overflow-y-hidden"></div>');
            headerToolbar$.prepend(textFilter$);

            if (textFilter$.length > 0) {
                textFilter$.css('display', 'flex');
                if (!headerToolbar$.find('.dt-buttons').length) {
                    // DataTables Buttons container
                    $($table.DataTable().buttons().container())
                        .addClass('ml-2') // thêm margin nếu cần
                        .appendTo(textFilter$);
                }
            }
        }
    }

    static customExportExel() {
        return [{
            extend: 'excelHtml5',
            text: `<i class="fa-solid fa-file-excel mr-1"></i> ${$.fn.transEle.attr('data-export-exel')}`,
            className: 'btn btn-outline-primary',
            exportOptions: {
                columns: ':visible',   // cột nào (all, visible, index)
                rows: ':visible',      // hàng nào (all, visible, selected)
                modifier: {
                    search: 'applied', // có lọc search/pagination không
                },
                format: {
                    body: function (data, row, column, node) {
                        let s2Ele = node.querySelector('.select2-hidden-accessible:not([hidden]):not(.hidden)');
                        if (s2Ele) {
                            let s2Data = SelectDDControl.get_data_from_idx($(s2Ele), $(s2Ele).val());
                            return s2Data?.['title'];
                        }
                        let inputEle = node.querySelector('.form-control[type="text"]:not([hidden]):not(.hidden)');
                        if (inputEle) {
                            return inputEle.value.trim();
                        }
                        // custom cell value
                        return $(node).text().trim();
                    }
                }
            },
            customize: function (xlsx) {
                // Truy cập sheet1
                var sheet = xlsx.xl.worksheets['sheet1.xml'];

                // Ví dụ: thêm style cho header
                $('row:first c', sheet).attr('s', '2');

                // Ví dụ: sửa dữ liệu cell A2
                $('row c[r^="A2"] is t', sheet).text('Custom Name');
            }
        }]
    }

    get reloadCurrency() {
        let reloadCurrency = this.opts?.['reloadCurrency'];
        return $.fn.isBoolean(reloadCurrency) ? reloadCurrency : false;
    }

    appendErrorConfirmAjax() {
        if (this.opts?.['ajax']) {
            if (this.opts['ajax']['url']) {
                if (!this.opts['ajax']?.['error']) {
                    this.opts['ajax']['error'] = function (xhr, error, thrown) {
                        $.fn.switcherResp(xhr?.['responseJSON']);
                        if ($.fn.isDebug() === true) console.log(xhr, error, thrown);
                    }
                }
            } else {
                if ($.fn.isDebug() === true) console.log('Ajax table cancels load data because config url Ajax is blank. Please config it, then try again!', {...this.opts});
                delete this.opts['ajax'];
                this.opts['data'] = [];
            }
        }
        if (isDenied) { // global variable
            // denied ajax and empty data
            if (this.opts.hasOwnProperty('ajax')) delete this.opts['ajax'];
            if (!this.opts.hasOwnProperty('data')) this.opts['data'] = [];
        } else {
            if (this.opts?.['ajax']) {
                // has ajax , remove data
                if (this.opts.hasOwnProperty('data')) delete this.opts['data'];
            } else {
                // hasn't ajax, add data empty
                if (!this.opts.hasOwnProperty('data')) this.opts['data'] = [];
            }
        }

        return true;
    }

    setUpUseDataServer() {
        let clsThis = this;
        // config server side processing
        if (this.opts['useDataServer']) {
            // server side v
            let ajaxDataCallback = this.opts?.['ajax']?.['data'] || {};
            let setupServerSide = {
                processing: true,
                serverSide: true,
                // ordering: false,
                // ordering: true,
                searchDelay: 1000,
                order: [],
                ajax: $.extend(
                    this.opts['ajax'],
                    {
                        data: function (d) {
                            // re-configure (assign other config) to d
                            if (ajaxDataCallback instanceof Function) {
                                Object.assign(d, ajaxDataCallback(d));
                            } else if (ajaxDataCallback instanceof Object) {
                                Object.assign(d, ajaxDataCallback)
                            }

                            // get wrapper element
                            let wrapperEle = clsThis.dtb$.closest('.dataTables_wrapper');

                            // setup ordering
                            let sortKey = wrapperEle.find('.custom-order-dtb').val();
                            let sortASC = wrapperEle.find('.custom-order-asc-dtb i').hasClass('fa-arrow-down-z-a');   // DESC
                            let orderingManual = d?.['ordering'] || null;
                            let orderTxt = sortKey ? `${sortASC ? '-' : ''}${sortKey}` : orderingManual ? orderingManual : '';

                            // setup another filtering
                            let keyKeepEmpty = [];
                            let customFilter = {};

                            $(`div.row-custom-filter[data-dtb-id="#` + clsThis.dtb$.attr('id') + `"]`).find('select').each(
                                function () {
                                    let val = $(this).val();
                                    if (val) {
                                        if ((typeof val === "string" && val) || (Array.isArray(val) && val.length > 0)) {
                                            customFilter[$(this).attr('data-keyParam')] = (!Array.isArray(val) ? [val] : val).join(",");
                                        }
                                    } else {
                                        if ($(this).attr('data-keepIdNullHasText') === 'true') {
                                            customFilter[$(this).attr('data-keyParam')] = "";
                                            keyKeepEmpty.push($(this).attr('data-keyParam'))
                                        }
                                    }
                                }
                            );

                            let customFilterData = {};
                            let filterManualEle = wrapperEle.find('select.custom-filter-manual-dtb');
                            if (filterManualEle.length > 0) {
                                filterManualEle.each(function () {
                                    customFilterData[$(this).attr('data-keyparam')] = $(this).val();
                                })
                            } else {
                                (clsThis.opts.cusFilter || []).map(
                                    (item) => {
                                        if (item.data && Array.isArray(item.data)) {
                                            let valParam = [];
                                            item.data.map(
                                                (item2) => {
                                                    if (item2.selected === true) {
                                                        valParam.push(item2.id);
                                                    }
                                                }
                                            )
                                            customFilterData[item.keyParam] = valParam.join(",");
                                        }

                                    }
                                )
                            }

                            return DTBControl.cleanParamBeforeCall({
                                ...DTBControl.cleanBaseKeyOfDataAjax(d),
                                'page': Math.ceil(d.start / d.length) + 1,
                                'pageSize': d.length,
                                'search': d?.search?.value ? d.search.value : '',
                                'ordering': orderTxt, ...customFilter, ...customFilterData,
                            }, keyKeepEmpty);
                        },
                        dataFilter: (data) => {
                            let json = JSON.parse(data);
                            json.recordsTotal = json?.data?.['page_count']
                            json.recordsFiltered = json?.data?.['page_count']
                            return JSON.stringify(json);
                        },
                        headers: {
                            "ENABLEXCACHECONTROL": !!(this.opts?.['ajax']?.['cache']) ? 'true' : 'false',
                        },
                    }
                )
            }
            this.opts = $.extend(this.opts, setupServerSide)
        }
    }

    get callbackGetLinkBlank() {
        return this.opts?.['callbackGetLinkBlank'] || function (rowData) {
            // return url was converted
            return null;
        }
    }

    get callbackRenderIdx() {
        let clsThis = this;
        let rowIdx = this.opts?.['rowIdx'];
        if (rowIdx === true) {
            return function (row, data, displayNum) {
                let dtbTmp = $(clsThis.dtb$).DataTable();
                let pageInfo = dtbTmp.page.info();
                let counter = '';
                if (pageInfo['serverSide'] === true) {
                    // serverSide --> displayNum was reset to 0 when render --> so page number * page size + display
                    counter = pageInfo.start + displayNum + 1;
                } else {
                    // for datatable not use serverSide.
                    counter = displayNum + 1;
                }
                let htmlDisplay = `${counter}`;
                let callbackGetLinkBlank = clsThis.callbackGetLinkBlank;
                let urlTargetHTML = callbackGetLinkBlank ? callbackGetLinkBlank(data) : null;
                if (urlTargetHTML) {
                    htmlDisplay = `<a 
                    href="${urlTargetHTML}" 
                    target="_blank" 
                    data-bs-toggle="tooltip"
                    data-bs-placement="bottom" 
                    title="${$.fn.transEle.attr('data-msg-open-new-tab')}"
                >${counter}</a>`;
                }
                $('td:eq(0)', row).html(htmlDisplay);
            }
        }
        return function (row, data, displayNum, displayIndex, dataIndex) {
            // default callback of detail datatable
            let editZElm = $('[data-zone]', row)
            // if (editZElm.length){
            //     editZElm.addClass('border-warning')
            //     editZElm.next('.select2-container').find('.select2-selection').addClass('border-warning')
            // }
        };
    }

    get mergeDrawCallback() {
        let clsThis = this;
        // merge two drawCallback function
        let drawCallback01 = this.opts?.['drawCallback'] || function (settings) {};
        const usingOnlyDrawCallbackOverride = this.opts?.['usingOnlyDrawCallbackOverride'] || false;
        let drawCallBackDefault;
        drawCallBackDefault = usingOnlyDrawCallbackOverride === true ?
            function (settings) {
            } :
            function (settings) {
                // $('.dataTables_paginate > .pagination').addClass('custom-pagination pagination-rounded pagination-simple');
                const dataTableWrapper$ = clsThis.dtb$.closest('.dataTables_wrapper');
                if (dataTableWrapper$.length > 0){
                    dataTableWrapper$.find('.dataTables_paginate').find('.pagination').addClass('pagination-sm dtb-pagination-custom')
                    dataTableWrapper$.find('.dataTables_info').addClass('dtb-info-custom');
                    dataTableWrapper$.find('.dataTables_length label').addClass('dtb-length-custom');
                    dataTableWrapper$.find('.dataTables_length select').addClass('dtb-length-list-custom');
                }

                feather.replace();
                // reload all currency
                if (clsThis.reloadCurrency === true) $.fn.initMaskMoney2();
                // buildSelect2();
                setTimeout(() => DocumentControl.buildSelect2(), 0);
            }
        return function (settings) {
            drawCallback01.bind(this)(settings);
            drawCallBackDefault.bind(this)(settings);
        }
    }

    get mergeRowCallback() {
        let rowCallbackManual = this.opts?.['rowCallback'] || function (row, data, displayNum, displayIndex, dataIndex) {
        };
        let callbackRenderIdx = this.callbackRenderIdx;
        return function (row, data, displayNum, displayIndex, dataIndex) {
            rowCallbackManual.bind(this)(row, data, dataIndex);
            callbackRenderIdx.bind(this)(row, data, dataIndex);
        }
    }

    get mergeInitComplete() {
        let clsThis = this;
        let initCompleteManual = this.opts?.['initComplete'] || function (settings, json) {
        };
        return function (settings, json) {
            ListeningEventController.listenImageLoad(
                $(this.api().table().container()).find('img'),
            );

            $(this.api().table().container()).find('input').attr('autocomplete', 'off');
            initCompleteManual.bind(this)(settings, json);
            DTBControl.parseHeaderDropdownFilter.bind(this)(
                (clsThis.opts?.['columns'] || []), settings, clsThis.dtb$
            );
            DTBControl.parseFilter2.bind(this)(clsThis.dtb$, settings, json);
        }
    }

    get columns() {
        return (this.opts?.['columns'] || []).map(
            (item) => {
                if (!item?.['data']) {
                    item['data'] = null
                }
                let clsNameTmp = item?.['className'] ? (item?.['className'] + ' wrap-text') : 'wrap-text';
                return {
                    ...item,
                    className: clsNameTmp,
                }
            }
        );
    }

    parseWhenAllToolbarWasDisabled(opts) {
        let disableAll = opts['stateFullTableTools'];
        if (disableAll === false || disableAll === true) {
            opts.enableVisibleColumns = disableAll;
            opts.enableSortColumns = disableAll;
            opts.enableFilterCustom = disableAll;
            opts.enableTools = disableAll;
            opts.searching = disableAll;
            opts.ordering = disableAll;
            opts.visiblePaging = disableAll;
            opts.visibleSearchField = disableAll;
            opts.visibleDisplayRowTotal = disableAll;
            opts.visiblePagination = disableAll;
            opts.visibleOrder = disableAll;
            opts.visibleRowQuantity = disableAll;

            if (disableAll === false) {
                opts.paginate = false;
                opts.pageLength = -1;
                opts.lengthMenu = [];
            }
        }
        return opts;
    }

    parseDtlOpts() {
        // prepare config
        this.opts = this.parseWhenAllToolbarWasDisabled(this.opts);
        // init table
        let [domOpts, domDTL] = DTBControl.parseDomDtl(this.opts);
        // ajax
        this.appendErrorConfirmAjax();

        // config server side processing
        this.setUpUseDataServer();

        return {
            // default custom variable
            stateFullTableTools: null,
            enableVisibleColumns: true,
            enableSortColumns: true,
            enableFilterCustom: true,
            enableTools: true,
            // scrollY: '400px',
            // scrollCollapse: true,
            // fixedHeader: true,
            autoFill: false,
            search: $.fn.DataTable.ext.type.search['html-numeric'],
            searching: true,
            ordering: false,
            paginate: true,
            dom: domDTL,
            language: {
                url: globeDTBLanguageConfig.trim(),
            },
            lengthMenu: [
                [5, 10, 20, 30, 50, -1], [5, 10, 20, 30, 50, $.fn.transEle.attr('data-all')],
            ],
            pageLength: 20,
            ...domOpts,
            columns: this.columns,
            rowCallback: this.mergeRowCallback,
            drawCallback: this.mergeDrawCallback,
            initComplete: this.mergeInitComplete,
        };
    }

    constructor(dtb$) {
        this.dtb$ = $(dtb$);
        this.dataSelect = {};
        this.opts = {};
    }

    init(opts) {
        this.opts = opts;
        let config = this.parseDtlOpts(opts);
        let tbl = this.dtb$.DataTable(config);
        let $this = this;
        tbl.on('init.dt', function (event, settings) {
            let divWrap = $(this).closest('.dataTables_wrapper');
            // $(this).closest('.dataTables_wrapper').find('.select2:not(:disabled)').initSelect2();
            if (opts?.['fullToolbar'] === true) {
                // load toolbar if setup is true
                DTBControl.prepareHTMLToolbar(divWrap, settings)
                // handle on check on/off column
                $('.ct_toolbar-columns .dropdown-menu input[type="checkbox"]', divWrap).off().on('change', function (e) {
                    if ($(this).attr('id') === 'tb_columns-all') {
                        let listIdx = []
                        $(this).parent('.form-check').siblings('.form-check').each(function () {
                            listIdx.push($(this).find('input').attr('data-column'))
                        })
                        tbl.columns(listIdx).visible(this.checked)
                        $('input:not(#tb_columns-all)', $(this).closest('.dropdown-menu')).prop('checked', this.checked)
                    } else {
                        tbl.column($(this).attr('data-column')).visible(this.checked)
                        if (!this.checked) $('#tb_columns-all', divWrap).prop('checked', false)
                        else {
                            let isFull = true
                            $(this).parent('.form-check').siblings('.form-check').each(function () {
                                if ($(this).find('input:not(.check_all)').prop('checked') === false) {
                                    isFull = false
                                    return false
                                }
                            })
                            if (isFull) $('#tb_columns-all', divWrap).prop('checked', true)
                        }
                    }
                });
            }
            $(window).trigger("resize");
        });
        tbl.on('draw.dt', function (event, settings) {
            // init row has checkbox selection
            $this.checkRowSelect(opts);
            $this.reCheckSelect(settings);

            // select filter in header
            setTimeout(() => {
                $('.header-column_search th.flt-select select', this.dtb$).each(function () {
                    $(this).initSelect2()
                })
            }, 0)
        });
        return tbl;
    }
}

class WindowControl {
    static eleHrefActive(url) {
        let link = document.createElement('a');
        link.href = url;
        document.body.appendChild(link);
        link.click();
    }

    static getHashUrl() {
        return location.hash;
    }

    static getAllParamsByKey(defaultData=null){
        let urlParsed = {};
        const sPageURL = window.location.search.substring(1);
        const sURLVariables = sPageURL.split('&');
        for (let i = 0; i < sURLVariables.length; i++) {
            const sParameterName = sURLVariables[i].split('=');
            urlParsed[sParameterName[0]] = sParameterName[1] === undefined ? defaultData : UtilControl.decodeURI(sParameterName[1]);
        }
        return urlParsed;
    }

    static getUrlParameter(sParam, defaultData='') {
        const sPageURL = window.location.search.substring(1);
        const sURLVariables = sPageURL.split('&');
        let sParameterName;

        for (let i = 0; i < sURLVariables.length; i++) {
            sParameterName = sURLVariables[i].split('=');

            if (sParameterName[0] === sParam) {
                return sParameterName[1] === undefined ? defaultData : UtilControl.decodeURI(sParameterName[1]);
            }
        }
        return defaultData;
    }

    static getManyUrlParameters(paramKeys, defaultData = '') {
        const urlParsed = WindowControl.getAllParamsByKey(defaultData);
        let result = {};
        paramKeys.map(
            key => {
                result[key] = defaultData;
                if (urlParsed.hasOwnProperty(key)){
                    result[key] = urlParsed[key];
                }
            }
        )
        return result;
    }

    static pushHashUrl(idHash) {
        window.history.pushState(null, null, idHash.includes('#') ? idHash : '#' + idHash);
    }

    static removeHashUrl() {
        window.history.replaceState(null, "", "#");
    }

    static redirectLogin(timeout = 0, location_to_next = true) {
        if (location_to_next === true) {
            return jQuery.fn.redirectUrl('/auth/logout', timeout, 'next=' + window.location.pathname);
        } else {
            return jQuery.fn.redirectUrl('/auth/logout', timeout, '');
        }
    }

    static redirectVerify2FA(timeout=0, location_to_next=true){
        if (location_to_next === true) {
            return jQuery.fn.redirectUrl('/auth/2fa', timeout, 'next=' + window.location.pathname);
        } else {
            return jQuery.fn.redirectUrl('/auth/2fa', timeout, '');
        }
    }

    static showLoading(opts) {
        // loadingTitleAction: GET (default), CREATE, UPDATE, DELETE, GET_PAGE_INIT_DATA
        function resolve_title() {
            let title = '';
            let loadingTitleKeepDefault = opts?.['loadingTitleKeepDefault'] || true;
            if (loadingTitleKeepDefault === true) {
                let loadingTitleAction = opts?.['loadingTitleAction'] || 'GET';
                if (loadingTitleAction === 'GET') {
                    title += $.fn.gettext('Loading');
                } else if (loadingTitleAction === 'CREATE') {
                    title += $.fn.gettext('Creating');
                } else if (loadingTitleAction === 'UPDATE') {
                    title += $.fn.gettext("Updating");
                } else if (loadingTitleAction === "DELETE") {
                    title += $.fn.gettext("Deleting")
                }
            }
            let loadingTitleMore = opts?.['loadingTitleMore'] || '';
            if (loadingTitleMore) title += ' ' + loadingTitleMore;
            return title;
        }

        function resolve_icon() {
            let icon = '';
            let decor_class = '';
            let loadingTitleKeepDefault = opts?.['loadingTitleKeepDefault'] || true;
            if (loadingTitleKeepDefault === true) {
                let loadingTitleAction = opts?.['loadingTitleAction'] || 'GET';
                if (loadingTitleAction === 'GET') {
                    icon = '/static/assets/images/systems/get_doc.gif';
                    decor_class = 'primary';
                } else if (loadingTitleAction === 'CREATE') {
                    icon = '/static/assets/images/systems/create_doc.gif';
                    decor_class = 'success';
                } else if (loadingTitleAction === 'UPDATE') {
                    icon = '/static/assets/images/systems/edit_doc.gif';
                    decor_class = 'blue';
                } else if (loadingTitleAction === "DELETE") {
                    icon = '/static/assets/images/systems/delete_doc.gif';
                    decor_class = 'danger';
                }
            }
            return [icon, decor_class]
        }

        let didOpenStartSetup = opts?.['didOpenStart'] || null;
        if (didOpenStartSetup) delete opts['didOpenStart'];

        let didOpenEndSetup = opts?.['didOpenEnd'] || null;
        if (didOpenEndSetup) delete opts['didOpenEnd']

        let didDestroyStartSetup = opts?.['didDestroyStart'] || null;
        if (didDestroyStartSetup) delete opts['didDestroyStart'];

        let didDestroyEndSetup = opts?.['didDestroyEnd'] || null;
        if (didDestroyEndSetup) delete opts['didDestroyEnd'];

        Swal.fire({
            html:
            `<div class="d-flex align-items-center">
                <div class="me-3"><img style="width: 60px; height: 60px" src="${resolve_icon()[0]}" alt="icon"></div>
                <div>
                    <h4 class="text-${resolve_icon()[1]}">${resolve_title()}</h4>
                    <p class="small">${$.fn.gettext('Please wait')}...</p>
                </div>
                <div class="ms-auto"><div class="swal2-loader" style="display: flex;"></div></div>
            </div>`,
            customClass: {
                container: 'swal2-has-bg',
                htmlContainer: 'bg-transparent text-start',
                actions: 'w-100'
            },
            allowOutsideClick: false,
            showConfirmButton: false,
            didOpen: () => {
                if (didOpenStartSetup instanceof Function) didOpenStartSetup();
                Swal.showLoading();
                if (didOpenEndSetup instanceof Function) didOpenEndSetup();
            },
            didDestroy: () => {
                if (didDestroyStartSetup instanceof Function) didDestroyStartSetup();
                Swal.hideLoading();
                if (didDestroyEndSetup instanceof Function) didDestroyEndSetup();
            },
            ...opts,
        });
    }

    static hideLoading(checkIsLoading = true) {
        if (checkIsLoading === true) {
            try {
                if (Swal.isLoading()) {
                    checkIsLoading = false;
                }
            } catch (e) {
                checkIsLoading = false;
            }
        }
        if (checkIsLoading === false) {
            swal.close();
        }
    }

    static showLoadingButton(ele$, opts) {
        let startOrEnd = opts?.['location'] || 'end'; // 'start','end'
        let borderOrGrow = opts?.['type'] || 'border'; // 'border','grow'
        if (ele$ instanceof jQuery) {
            $(ele$).addClass('btn-upload-force-color');
            $(ele$).prop('disabled', true);
            if (startOrEnd === 'start') {
                $(ele$).prepend($(`<span class="spinner-${borderOrGrow} spinner-${borderOrGrow}-sm ntt-spinner-btn mr-1" role="status" aria-hidden="true"></span>`))
            } else if (startOrEnd === 'end') {
                $(ele$).append($(`<span class="spinner-${borderOrGrow} spinner-${borderOrGrow}-sm ntt-spinner-btn ml-1" role="status" aria-hidden="true"></span>`))
            }
        }
    }

    static hideLoadingButton(ele$, opts) {
        if (ele$ instanceof jQuery) {
            $(ele$).prop('disabled', false).removeClass('btn-upload-force-color');
            $(ele$).find('.ntt-spinner-btn').remove();
        }
    }

    static showLoadingWaitResponse(ele$, opts, addClass = '') {
        return $(ele$).fadeOut({
            'duration': 'fast', // 'start': function (){
            //     $(`<div class="spinner spinner-border text-secondary my-3" role="status"><span class="sr-only">Loading...</span></div>`).insertBefore($(this));
            // },
            'done': function () {
                $(`<div class="${addClass} spinner spinner-border text-secondary my-3" role="status"><span class="sr-only">Loading...</span></div>`).insertBefore($(this));
                if (!$(this).hasClass('fade-in-active')) $(this).addClass('hidden');
            }, ...opts
        });
    }

    static hideLoadingWaitResponse(ele$, opts) {
        return $(ele$).addClass('fade-in-active').fadeIn({
            'duration': 'fast',
            'start': function () {
                $(this).prev('.spinner').addClass('hidden').remove();
                $(this).removeClass("hidden")
            }, // 'done': function (){
            //     $(this).prev('.spinner').addClass('hidden').remove();
            // },
            ...opts
        });
    }

    static showForbidden(opts) {
        Swal.fire({
            html:
            `<div class="d-flex align-items-center">
                <div class="me-3"><img style="width: 60px; height: 60px" src="/static/assets/images/systems/forbidden.gif" alt="icon"></div>
                <div>
                    <h4 class="text-danger">${$.fn.gettext("Forbidden")}</h4>
                    <p class="small">${$.fn.gettext('You do not have permission to access this function!')}</p>
                </div>
            </div>`,
            customClass: {
                container: 'swal2-has-bg',
                htmlContainer: 'bg-transparent text-start',
                actions: 'w-100',
            },
            allowOutsideClick: false,
            showDenyButton: true,
            denyButtonText: $.fn.gettext('Home Page'),
            confirmButtonColor: '#3085d6',
            showConfirmButton: true,
            confirmButtonText: $.fn.gettext('Previous page'),
            denyButtonColor: '#21b48f',
            preConfirm: function (opts) {
                window.location.href = document.referrer;
            },
            preDeny: function () {
                window.location.href = '/';
            },
            ...opts,
        })
    }

    static showNotFound(opts) {
        Swal.fire({
            html:
            `<div class="d-flex align-items-center">
                <div class="me-3"><img style="width: 60px; height: 60px" src="/static/assets/images/systems/not_found.gif" alt="icon"></div>
                <div>
                    <h4 class="text-warning">${$.fn.gettext("Not found")}</h4>
                    <p class="small">${$.fn.gettext('The requested content was not found!')}</p>
                </div>
            </div>`,
            customClass: {
                container: 'swal2-has-bg',
                htmlContainer: 'bg-transparent text-start',
                actions: 'w-100'
            },
            allowOutsideClick: true,
            showDenyButton: true,
            denyButtonText: $.fn.gettext('Home Page'),
            confirmButtonColor: '#3085d6',
            showConfirmButton: true,
            confirmButtonText: $.fn.gettext('Previous page'),
            denyButtonColor: '#21b48f',
            preConfirm: function (opts) {
                window.location.href = document.referrer;
            },
            preDeny: function () {
                window.location.href = '/';
            },
            ...opts,
        })
    }

    static showTimeOut(props) {
        let {
            callback,
            checkVisible,
            ...opts
        } = {
            'checkVisible': function (){
                if (Swal.isVisible()) {
                    Swal.close();  // force close when another showing
                }
                return true;
            },
            'callback': function () {
            },
            ...props
        };
        const state = checkVisible();
        if (state !== false){
            Swal.fire({
                icon: 'warning',
                timer: 400,
                timerProgressBar: false,
                showConfirmButton: false,
                didOpen: () => {
                    Swal.showLoading();
                    $('.swal2-actions.swal2-loading').css('margin-top', 0);
                    $('.swal2-popup').css('background', 'unset');
                },
                ...opts,
            }).then((result) => {
                setTimeout(() => {
                    callback();
                });
            });
        }
    }

    static showUnauthenticated(opts, isRedirect = true) {
        if (isRedirect === true) {
            Swal.fire({
                html:
                `<div class="d-flex align-items-center">
                    <div class="me-3"><img style="width: 60px; height: 60px" src="/static/assets/images/systems/logout.gif" alt="icon"></div>
                    <div>
                        <h4 class="text-danger">${$.fn.gettext('The session login was expired')}</h4>
                        <p class="small">${$.fn.gettext('You will be logged out!')}</p>
                    </div>
                </div>`,
                customClass: {
                    container: 'swal2-has-bg',
                    htmlContainer: 'bg-transparent text-start',
                    actions: 'w-100',
                },
                allowOutsideClick: false,
                confirmButtonColor: '#3085d6',
                timer: 2000,
                timerProgressBar: true,
                showConfirmButton: true,
                confirmButtonText: $.fn.gettext('Login page'),
                ...opts
            }).then((result) => {
                if (result.dismiss === Swal.DismissReason.timer || result.isConfirmed || result.value) {
                    const redirectData = opts?.['redirect_url'] || $x.fn.redirectLogin;
                    if (typeof redirectData === "function") return redirectData.call();
                    return opts?.['redirect_url'] || redirectData;
                }
            });
        } else {
            Swal.fire({
                html:
                `<div class="d-flex align-items-center">
                    <div class="me-3"><img style="width: 60px; height: 60px" src="/static/assets/images/systems/logout.gif" alt="icon"></div>
                    <div>
                        <h4 class="text-danger">${$.fn.gettext('The session login was expired')}</h4>
                        <p class="small">${$.fn.gettext('You will be logged out!')}</p>
                    </div>
                </div>`,
                customClass: {
                    container: 'swal2-has-bg',
                    htmlContainer: 'bg-transparent text-start',
                    actions: 'w-100',
                },
                allowOutsideClick: false,
                confirmButtonColor: '#3085d6',
                showConfirmButton: true,
                confirmButtonText: $.fn.gettext('Login page'),
                preConfirm: function (opts) {
                    return $x.fn.redirectLogin();
                },
                ...opts,
            });
        }
    }

    static showSVErrors() {
        Swal.fire({
            html:
            `<div class="d-flex align-items-center">
                <div class="me-3"><img style="width: 60px; height: 60px" src="/static/assets/images/systems/error.gif" alt="icon"></div>
                <div>
                    <h4 class="text-danger">${$.fn.gettext("Internal Server Errors")}</h4>
                    <p class="small">${$.fn.gettext('An error occurred while interacting with the data!')}</p>
                </div>
            </div>`,
            customClass: {
                container: 'swal2-has-bg',
                htmlContainer: 'bg-transparent text-start',
                actions: 'w-100',
            },
            allowOutsideClick: true,
            showDenyButton: true,
            denyButtonText: $.fn.gettext('Home Page'),
            confirmButtonColor: '#3085d6',
            showConfirmButton: true,
            confirmButtonText: $.fn.gettext('Previous page'),
            denyButtonColor: '#21b48f',
            showCancelButton: true,
            cancelButtonText: $.fn.gettext('Close'),
            preConfirm: function (opts) {
                window.location.href = document.referrer;
            },
            preDeny: function () {
                window.location.href = '/';
            },
        })
    }

    static getOffsetTop(element, parentElement) {
        let offsetTop = 0;
        while(element && element !== parentElement) {
            offsetTop += element.offsetTop;
            element = element.offsetParent;
        }
        return offsetTop;
    }

    static scrollToIdx(idxStrOr$, parentEleStrOr$ = '#idxPageContent', timer=200) {
        const ele$ = idxStrOr$ instanceof jQuery ? idxStrOr$ : $(idxStrOr$);
        let parent$ = parentEleStrOr$ instanceof jQuery ? parentEleStrOr$ : $(parentEleStrOr$);
        // let offsetTop = ele$.offset().top;
        // parent$.animate({scrollTop: offsetTop > 150 ? offsetTop - 150 : offsetTop}, timer);
        const offsetTop = WindowControl.getOffsetTop(ele$[0], parent$[0]);
        const vh = Math.max(document.documentElement.clientHeight || 0, window.innerHeight || 0);
        parent$.animate({scrollTop: offsetTop - vh/2}, timer);
    }

    static findGetParameter(parameterName) {
        let result = null,
            tmp = [];
        location.search
            .substr(1)
            .split("&")
            .forEach(function (item) {
                tmp = item.split("=");
                if (tmp[0] === parameterName) result = decodeURIComponent(tmp[1]);
            });
        return result;
    }

    static getPropertiesValue(propertyName) {
        const root = document.querySelector(':root');
        return getComputedStyle(root).getPropertyValue(propertyName);
    }

    static scrollToCus(scroller$, selected$, duration) {
        let parentOffset = scroller$.offset().top;
        let elementOffset = $(selected$).offset().top;
        let scrollPosition = elementOffset - parentOffset + scroller$.scrollTop() - (scroller$.height() / 2) + ($(selected$).height() / 2);
        scroller$.animate({scrollTop: scrollPosition}, duration ?? 'slow');
    }
}

class PersonControl {
    static shortNameGlobe(personData, shortNameKey = null) {
        if (typeof personData === 'object') {
            if (shortNameKey === null) {
                if ($.fn.hasOwnProperties(personData, ['first_name', 'last_name'])) {
                    let last_name = personData['last_name'].split(' ')[0][0];
                    let first_name = personData['first_name'].split(' ');
                    first_name = first_name[first_name.length - 1][0]
                    return `${last_name.length > 0 ? last_name[0] : ''}${first_name.length > 0 ? first_name[0] : ''}`;
                }
            } else {
                if (personData.hasOwnProperty(shortNameKey)) {
                    let arr = personData[shortNameKey].split(" ").map(
                        (charTxt) => {
                            if (charTxt.length > 0) {
                                return charTxt[0];
                            }
                            return '';
                        }
                    )
                    if (arr.length > 2) arr = [arr[0], arr[arr.length - 1]];
                    return arr.join("");
                }
            }
        }
        return '';
    }

    static renderAvatar(personData, clsName = "", appendHtml = "", shortNameKey = null) {
        let avatar = personData?.['avatar_img'];
        let htmlTooltipFullname = `data-bs-toggle="tooltip" data-bs-placement="bottom" title="${personData?.['full_name']}"`;
        let shortName = PersonControl.shortNameGlobe(personData, shortNameKey);
        if (avatar && avatar !== 'None' && avatar !== 'none') {
            return `<div class="avatar ${clsName ? clsName : 'avatar-xs avatar-primary avatar-rounded'}" ${htmlTooltipFullname}><img src="${avatar}" alt="${shortName}" class="avatar-img">${appendHtml}</div>`;
        }
        return `
            <div class="avatar avatar-rounded ${clsName ? clsName : 'avatar-xs avatar-primary avatar-rounded'}" ${htmlTooltipFullname}>
                <span class="initial-wrap" >${shortName}</span>
                ${appendHtml}
            </div>
        `;
    }

    static getEmployeeCurrentID(default_val = null) {
        let ele = $('#idx-link-to-current-employee');
        if (ele.length > 0) {
            return ele.data('value-id');
        }
        return default_val;
    }

    static getEmployeeCurrent(key=null, default_val = null) {
        let ele = $('#idx-link-to-current-employee');
        if (ele.length > 0) {
            let data = ele.data('value-full');
            if (typeof data === 'string'){
                try {
                    data = JSON.parse(data);
                } catch(e){}
            }
            if (data && typeof data === 'object' && data.hasOwnProperty(key)){
                return data[key];
            }
            return default_val;
        }
        return default_val;
    }

    static combineName(firstName, lastName) {
        let firstPart = firstName.trim();
        let lastPart = lastName.trim();
        // Combine full name
        return `${firstPart} ${lastPart}`;
    }
}

class DocumentControl {
    static classOfPlan(code) {
        let classPlan = {
            'e-office': 'primary',
            'hrm': 'success',
            'personal': 'info',
            'sale': 'danger'
        }
        if (code) {
            return classPlan[code] ? classPlan[code] : 'primary'
        }
        return classPlan
    }

    static getBtnIDLastSubmit() {
        return globeIDLastSubmit;
    }

    static setBtnIDLastSubmit(idx) {
        globeIDLastSubmit = idx;
    }

    static getElePageAction() {
        return $("#idxPageAction");
    }

    static getElePageContent() {
        return $('#idxPageContent');
    }

    static getBtnLastSubmit() {
        return globeEleLastSubmit;
    }

    static setBtnLastSubmit($ele) {
        globeEleLastSubmit = $ele;
    }

    static async getCompanyConfig() {
        let dataText = sessionStorage.getItem('companyConfig');
        if (!dataText || dataText === '') {
            let companyConfigUrl = globeUrlCompanyConfig;
            if (companyConfigUrl) {
                return await $.fn.callAjax2({
                    url: companyConfigUrl,
                    method: 'GET',
                }).then((resp) => {
                    let data = $.fn.switcherResp(resp);
                    dataText = JSON.stringify(data);
                    sessionStorage.setItem('companyConfig', dataText);
                    sessionStorage.setItem('companyConfigTime', Date.now());
                    return data;
                }).then((rs) => {
                    return rs
                });
            }
        } else{
            let cacheTime = sessionStorage.getItem('companyConfigTime');
            if (Date.now() - cacheTime > 1440 * 60 * 1000) {
                sessionStorage.removeItem('companyConfig');
                return this.getCompanyConfig(); // Gọi lại
            }
            return JSON.parse(dataText);
        }
    }

    static async getCompanyCurrencyConfig() {
        let data = await DocumentControl.getCompanyConfig();
        return data?.['config']?.['currency_rule'] ? data?.['config']?.['currency_rule'] : {};
    }

    static async getCompanyCurrencyFull() {
        let data = await DocumentControl.getCompanyConfig();
        return data['config'];
    }

    static formDetailToUpdateAction() {
        let $DetailForm = $('form[readonly]');
        if ($DetailForm) {
            $('.readonly > * + span').on('click', function () {
                // for input/select
                $('[readonly]', $(this).parent('.readonly')).attr('readonly', false);
                $('input[disabled]', $(this).parent('.readonly')).attr('disabled', false);
                // for radio/checkbox
                $('[type="checkbox"][disabled], [type="radio"][disabled]', $(this).parent('.readonly'))
                    .attr('disabled', false);
                // for select2 with icon info
                $('[disabled]', $(this).closest('.input-group.readonly')).attr('disabled', false);
                // for select2 with icon info
                $('select[disabled]', $(this).parent('.readonly')).attr('disabled', false);
                // for table
                $(`[data-table-readonly="${$(this).parent('.readonly').find('table').attr('id')}"]`).attr('disabled', false)
                $('.table-readonly', $(this).parent('.readonly')).removeClass('.readonly.table-readonly');

                // final delete class readonly
                $(`button[form="${$DetailForm.attr('id')}"]`).removeClass('hidden')
                $(this).parent('.readonly').removeClass('readonly');
            });
        }
    }

    static buildSelect2() {
        $('.select2-init-v1').each(function () {
            if (!$(this).attr('data-init-loaded')) {
                // flag is on
                $(this).attr('data-init-loaded', true);

                // display dummy data
                let dummyData = JSON.parse($(this).attr('data-dummy'));
                if (dummyData && typeof dummyData === 'object' && dummyData.hasOwnProperty('title') && dummyData.hasOwnProperty('id')) {
                    $(this).empty().append(`<option value="${dummyData.id}" selected>${dummyData.title}</option>`)
                }

            }
        })
    }

    static change_space() {
        function executeTimeOutChangeSpace(urlData, methodData, spaceCode, spaceName, urlRedirectData) {
            let baseMsg = $.fn.transEle;
            Swal.fire({
                html:
                `<div>
                    <h4 class="text-blue">${$.fn.transEle.attr('data-msgLabelReloadPageIn')} "${spaceName}"</h4>
                    <p class="small">${$.fn.transEle.attr('data-msgReloadPageIn')}</p>
                </div>`,
                allowOutsideClick: false,
                timer: 1000,
                timerProgressBar: true,
                showCancelButton: true,
                cancelButtonText: baseMsg.attr('data-cancel'),
                showConfirmButton: false,
                confirmButtonText: baseMsg.attr('data-confirm'),
            }).then((result) => {
                if (result.dismiss === Swal.DismissReason.timer || result.isConfirmed || result.value) {
                    callChangeSpaceAndReload(urlData, methodData, spaceCode, urlRedirectData);
                }
            });
        }

        $('#btnTestAlert').click(function () {
            executeTimeOutChangeSpace();
        })

        function callChangeSpaceAndReload(urlData, methodData, spaceCode, urlRedirectData) {
            WindowControl.showLoading();
            $.fn.callAjax2({
                url: urlData,
                method: methodData,
                data: {'space_code': spaceCode},
            }).then((resp) => {
                let data = $.fn.switcherResp(resp);
                if (data && data['status'] === 200) {
                    $.fn.notifyB({
                        'description': $.fn.transEle.attr('data-success')
                    }, 'success');
                    setTimeout(() => {
                        window.location.href = urlRedirectData;
                    }, 1000,);
                }
                setTimeout(() => {
                    WindowControl.hideLoading();
                }, 1000);
            }, (errs) => {
                WindowControl.hideLoading();
            });
        }

        // $('.space-item').click(function (event) {
        //     event.preventDefault();
        //     let space_selected = $('#menu-tenant').attr('data-space-selected');
        //     let urlData = $(this).closest('.dropdown-menu').attr('data-url');
        //     let urlRedirectData = $(this).closest('.dropdown-menu').attr('data-url-redirect');
        //     let methodData = $(this).closest('.dropdown-menu').attr('data-method');
        //     let spaceCode = $(this).attr('data-space-code');
        //     if (spaceCode !== space_selected) {
        //         executeTimeOutChangeSpace(urlData, methodData, spaceCode, $(this).attr('data-space-name'), urlRedirectData);
        //     }
        // })

        $('.space-item').click(function (event) {
            event.preventDefault();
            let $menuTenant = $('#menu-tenant');
            let space_selected = $menuTenant.attr('data-space-selected');
            let urlData = $menuTenant.attr('data-url');
            let urlRedirectData = $menuTenant.attr('data-url-redirect');
            let methodData = 'put';
            let spaceCode = $(this).attr('data-space-code');
            let spaceName = $(this).attr('data-space-name');
            if (spaceCode !== space_selected) {
                executeTimeOutChangeSpace(urlData, methodData, spaceCode, spaceName, urlRedirectData);
            }
        })

    }

    static active_menu(item) {
        if (item.length > 0) {
            item.first().addClass('active')
            let parent = item.first().parents('.nav-item');
            if (parent.length > 0) {
                parent.first().addClass('active');
                DocumentControl.active_menu(parent.first());
            }
        }
        return null;
    }

    static menu_handler() {
        let nav_data = $('#get-menu-active');
        let menu_id_active = nav_data.attr('data-nav-menu');
        if (menu_id_active) {
            let ele_menu = $('#' + menu_id_active);
            if (ele_menu) {
                DocumentControl.active_menu(ele_menu);
            }
        }
        let tenant_code_active = nav_data.attr('data-nav-tenant');
        if (tenant_code_active) $('#menu-tenant').children('option[value=' + tenant_code_active + ']').attr('selected', 'selected');
    }

    static renderCodeBreadcrumb(detailData, keyCode = 'code', keyActive = 'is_active', keyStatus = 'system_status', keyInherit = 'employee_inherit', keyIsChange = 'is_change', keyDocRootID = 'document_root_id', keyDocChangeOrder = 'document_change_order') {
        if (typeof detailData === 'object') {
            let [code, is_active, system_status, employee_inherit, is_change, document_root_id, doc_change_order] = [detailData?.[keyCode], detailData?.[keyActive], detailData?.[keyStatus], detailData?.[keyInherit], detailData?.[keyIsChange], detailData?.[keyDocRootID], detailData?.[keyDocChangeOrder]];
            if (!doc_change_order) {
                doc_change_order = "";
            }
            let $breadcrumbCode = $('#idx-breadcrumb-current-code');
            $breadcrumbCode.empty();
            if (code) {
                let clsState = 'hidden';
                if (is_active === true) {
                    clsState = 'badge badge-info badge-indicator-processing badge-indicator';
                } else if (clsState === false) {
                    clsState = 'badge badge-light badge-indicator';
                }
                $breadcrumbCode.html(
                    `
                    <span class="${clsState}"></span>
                    <b class="fs-7 text-primary" id="documentCode" data-is-change="${is_change}" data-doc-root-id="${document_root_id}" data-doc-change-order="${doc_change_order}">${code}</b>
                `
                ).removeClass('hidden');
            }
            if (system_status || system_status === 0) {
                let draft = $.fn.transEle.attr('data-msg-draft');
                let created = $.fn.transEle.attr('data-created');
                let added = $.fn.transEle.attr('data-added');
                let approved = $.fn.transEle.attr('data-approved');
                let cancel = $.fn.transEle.attr('data-cancel');
                let status_class = {
                    [draft]: "grey-light-4",
                    [created]: "yellow-light-4",
                    [added]: "blue-light-4",
                    [approved]: "green-light-4",
                    [cancel]: "red-light-4",
                }
                let dataStatus = system_status;
                let dataInheritID = employee_inherit?.['id'];
                if ($x.fn.checkNumber(system_status)) {
                    const key = Object.keys(status_class);
                    system_status = key[system_status]
                }
                if (window.location.href.includes('/update/') && dataStatus === 3) {
                    $breadcrumbCode.append(
                        `<span class="badge text-dark-10 fs-8 bg-blue-light-4" id="systemStatus" data-status="${dataStatus}" data-status-cr="${dataStatus + 2}" data-inherit="${dataInheritID}" data-is-change="${is_change}" data-doc-root-id="${document_root_id}" data-doc-change-order="${doc_change_order}">${$.fn.transEle.attr('data-change-request')}</span>`
                    ).removeClass('hidden');
                } else {
                    $breadcrumbCode.append(
                        `<span class="badge text-dark-10 fs-8 bg-${status_class[system_status]}" id="systemStatus" data-status="${dataStatus}" data-status-cr="" data-inherit="${dataInheritID}" data-is-change="${is_change}" data-doc-root-id="${document_root_id}" data-doc-change-order="${doc_change_order}">${system_status}</span>`
                    ).removeClass('hidden');
                }
                if (detailData?.['system_auto_create']) {
                    $breadcrumbCode.append(`<span class="badge fs-8 bg-blue-light-1 ml-1">${$.fn.gettext('Create automatically')}</span>`)
                }
            }
        }
    }

    static buttonLinkBlank(url, iconHtml = '<i class="fa-solid fa-arrow-up-right-from-square"></i>') {
        return `<a href="${url}" target="_blank">
            <button 
                class="btn btn-link btn-xs"
                data-bs-toggle="tooltip"
                data-bs-placement="bottom" 
                title="${$.fn.transEle.attr('data-msg-open-new-tab')}"
            >${iconHtml}</button>
        </a>`;
    }

    static closeCard(eleCard, destroyParentClosest = null, isPurge = false) {
        let ele = $(eleCard).closest('.card');
        if (destroyParentClosest !== null) ele = ele.closest(destroyParentClosest);
        if (isPurge === true) {
            ele.remove();
        } else {
            ele.addClass('d-none');
        }
    }

    static openCard(eleCard, openParentClosest = null) {
        let ele = $(eleCard).closest('.card');
        if (openParentClosest !== null) ele = ele.closest(openParentClosest);
        ele.removeClass('d-none');
    }

    static numberWithCommas(value) {
        value = value.toString();
        let pattern = /(-?\d+)(\d{3})/;
        while (pattern.test(value))
            value = value.replace(pattern, "$1,$2");
        return value;
    }
}

class ExcelSheetJSController {
    // https://docs.sheetjs.com/

    static parseFileToJSON(file, callback_render, callback_error = null) {
        let reader = new FileReader();

        reader.onload = function (e) {
            let data = e.target.result;
            let workbook = XLSX.read(data, {
                type: 'binary'
            });
            workbook.SheetNames.forEach(function (sheetName) {
                let XL_row_object = XLSX.utils.sheet_to_row_object_array(workbook.Sheets[sheetName]);
                if (callback_render && typeof callback_render === 'function') callback_render(XL_row_object);
                else console.log(XL_row_object);
            })
        };

        reader.onerror = function (ex) {
            if (callback_error && typeof callback_error === 'function') callback_error(ex);
            else console.log('onerror: ', ex);
        };

        reader.readAsBinaryString(file);
    }

    static download(workbook, fileName, Props, writeOpt, callbackComplete) {
        Props = {
            Author: "Bflow",
            LastAuthor: "Bflow",
            Keywords: 'bflow, bflow-export, export, excel',
            Company: 'Bflow.vn',
            Title: 'Bflow Export Data',
            Subject: 'Bflow Export Data',
            ProgramName: 'Bflow',
            ...Props,
        }
        workbook.Props = Props;

        if (!fileName.endsWith('.xlsx')) fileName += '.xlsx';
        writeOpt = {
            compression: true,
            ...writeOpt
        }
        XLSX.writeFile(workbook, fileName, writeOpt);

        if (typeof callbackComplete === "function") callbackComplete()
    }

    static _convertWidthColsJSON(data){
        let widthArr = [];
        let colPropertiesTmp = {
            'wch': 10,
        }
        data.map(
            item => {
                Object.keys(item).map(
                    (key, idx) => {
                        let itemOfIndex = widthArr?.[idx] || {...colPropertiesTmp};
                        let wData = Math.max(
                            itemOfIndex.wch,
                            key.toString().length,
                            item[key].toString().length
                        );
                        itemOfIndex['wch'] = wData <= 40 ? wData : 40;
                        widthArr[idx] = itemOfIndex;
                    }
                )
            }
        )
        return widthArr;
    }

    static _convertWidthColsArray(data){
        let widthArr = [];
        let colPropertiesTmp = {
            'wch': 10,
        }
        data.map(
            item => {
                Object.keys(item).map(
                    (key, idx) => {
                        let itemOfIndex = widthArr?.[idx] || {...colPropertiesTmp};
                        let wData = Math.max(
                            itemOfIndex.wch,
                            key.toString().length,
                            item[key].toString().length
                        );
                        itemOfIndex['wch'] = wData <= 40 ? wData : 40;
                        widthArr[idx] = itemOfIndex;
                    }
                )
            }
        )
        return widthArr;
    }

    static createWorkbook(opts, dataType, callback = () => {}) {
        opts = {
            'sheetName': 'Data',
            'data': [],
            '!cols': [],
            '!merges': [],
            ...opts
        }
        if (XLSX) {
            if (Array.isArray(opts.data)) {
                const workbook = XLSX.utils.book_new();
                let worksheet = null;
                let widthCols = opts['!cols'];
                let merges = opts['!merges'];

                switch (dataType) {
                    case 'json':
                        worksheet = XLSX.utils.json_to_sheet(opts.data);
                        if (Array.isArray(widthCols) && widthCols.length === 0) {
                            widthCols = this._convertWidthColsJSON(opts.data, dataType);
                        }
                        break
                    case 'array':
                        worksheet = XLSX.utils.aoa_to_sheet(opts.data);
                        if (Array.isArray(widthCols) && widthCols.length === 0) {
                            widthCols = this._convertWidthColsArray(opts.data, dataType);
                        }
                        break
                    default:
                        throw Error(`Create Workbook: Worksheet not support type "${dataType}" convert!`);
                }

                if (worksheet) {
                    if (opts['!cols']) worksheet["!cols"] = widthCols;

                    // [{"s":{"r":0,"c":0},"e":{"r":1,"c":0}}] : Gộp cột A từ hàng 1 đến hàng 2
                    if (merges) worksheet['!merges'] = merges;

                    if (callback && typeof callback === 'function') callback(workbook, worksheet);

                    XLSX.utils.book_append_sheet(workbook, worksheet, opts.sheetName);
                    return workbook;
                } else throw Error('Create Workbook: The worksheet must be required');
            } else throw Error('Create Workbook: The data of sheet must be array object');
        } else throw Error('Create Workbook: The library is not found');
    }
}

class ExcelJSController {
    // https://www.npmjs.com/package/exceljs

    static coordToIndex(coord){
        let index = 0;
        for (let i=0; i < coord.length ; i++){
            const ascii = coord[i].charCodeAt(0);
            const coefficient = coord.length - i - 1;
            index += (ascii - 64) * 26 ** coefficient
        }
        // Trừ thêm cho 1 do index bắt đầu từ 0 còn công thức thì index bắt đầu từ 1.
        return index - 1;
    }

    static indexToCoord(r, c) {
        // Công thức toán của toạ độ: Tổ hợp cộng của `(Ci - 64) x 26 ^ ( n - i - 1)` với i=0 đến n-1
        // Tổ hợp sau đó trừ thêm cho 1 do index bắt đầu từ 0 còn công thức thì index bắt đầu từ 1.
        // Ci là mã ASCII của ký tự tại vị trí i trong chuỗi (với A=65)
        // n là độ dài chuỗi ký tự
        // Ví dụ `ABC`
        // A = 65, B = 66, C = 67
        // Vị trí 0: (A - 64) * 26² = 1 * 26² = 676
        // Vị trí 1: (B - 64) * 26¹ = 2 * 26¹ = 52
        // Vị trí 2: (C - 64) * 26⁰ = 3 * 26⁰ = 3
        // Tổng: 676 + 52 + 3 = 731
        // Trừ thêm đi 1: Kết quả: 730

        // return String.fromCharCode(65 + c) + (r + 1);
        let letter = '';
        let temp;
        while (c >= 0) {
            temp = c % 26;
            letter = String.fromCharCode(temp + 65) + letter;
            c = (c - temp - 1) / 26;
        }
        return letter + (r + 1);
    }

    static indexToCoordRange(coord1, coord2) {
        const data1 = ExcelJSController.indexToCoord(coord1.r, coord1.c);
        const data2 = ExcelJSController.indexToCoord(coord2.r, coord2.c);
        return data1 + ':' + data2;
    }

    static async download(opts){
        let {
            workbook, fileName, wbProps, callback
        } = {
            'workbook': null,
            'fileName': 'download.xlsx',
            'wbProps': {},
            'callback': () => {},
            ...opts,
        }

        if (!fileName.endsWith('.xlsx')) fileName += '.xlsx';

        wbProps = {
            'creator': 'Bflow.vn',
            'lastModifiedBy': 'Bflow',
            'created': new Date(),
            'modified': new Date(),
            'lastPrinted': null,
            ...wbProps,
        }
        Object.keys(wbProps).map(
            propertyKey => {
                workbook[propertyKey] = wbProps[propertyKey];
            }
        )

        let buffer = await workbook.xlsx.writeBuffer();
        let blob = new Blob([buffer], {type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"});
        let link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = fileName;
        link.click();
        URL.revokeObjectURL(link.href);

        if (callback && typeof callback === 'function') callback();
    }

    static styleCell(worksheet, opts) {
        let {
            fullBorder, cellCallback
        } = {
            'fullBorder': true,
            cellCallback: (cell, colNumber, row, rowNumber) => {},
            ...opts
        };
        const styleFullBorder = {
                top: {style: 'thin'},
                left: {style: 'thin'},
                bottom: {style: 'thin'},
                right: {style: 'thin'}
            };
        worksheet.eachRow(function (row, rowNumber) {
            row.eachCell(function (cell, colNumber) {
                if (fullBorder) cell.border = styleFullBorder;
                cellCallback(cell, colNumber, row, rowNumber);
            });
        });
    }

    static convertWidthColsArray(data, opts) {
        let {
            minWch,
            maxWch,
            appendWch
        } = {
            minWch: 3,
            maxWch: 40,
            appendWch: 2,
            ...opts
        };
        let colWidth = [];
        data.map(
            dataItem => {
                dataItem.map(
                    (subItem, idx) => {
                        let currentByIdx = colWidth?.[idx] || 0;
                        if (currentByIdx === undefined) currentByIdx = minWch;
                        let currentLength = subItem.toString().length;
                        if (typeof subItem === 'boolean' && currentLength < 12) currentLength = 12;
                        if (currentLength > currentByIdx) {
                            colWidth[idx] = currentLength > maxWch ? maxWch : currentLength;
                        }
                    }
                )
            }
        )
        return colWidth.map(item => item + appendWch);
    }

    static createWorkbook(opts) {
        let {
            sheetName,
            data,
            cols,
            merges,
            styles,
            callback,
        } = {
            'sheetName': 'Data',
            'data': [],  // [[1,2,3],[4,5,6]]
            'cols': [],  // Width Of Columns: [3, 40, 10]
            'merges': [],  // ["A1:A2", "B1:C1"]
            'styles': [], // [["A1", {"alignment": {vertical: 'middle', horizontal: 'left'}}], ]
            'callback': (workbook, worksheet) => {},
            ...opts
        }

        if (ExcelJS) {
            const workbook = new ExcelJS.Workbook();

            const worksheet = workbook.addWorksheet(sheetName);

            data.map(dataItem => worksheet.addRow(dataItem))

            worksheet.columns = Array.from(
                cols.map(
                    colItem => {
                        return {
                            width: colItem
                        }
                    }
                )
            )

            merges.map(mergeItem => {
                worksheet.mergeCells(mergeItem);
            })

            styles.map(styleItem => {
                let [coord, config] = styleItem;
                let cell = worksheet.getCell(coord);
                Object.keys(config).map(
                    propertyKey => {
                        cell[propertyKey] = config[propertyKey];
                    }
                )
            });

            if (callback && typeof callback === 'function') callback(workbook, worksheet);

            return workbook;
        } else throw Error('Create Workbook: The library is not found');
    }
}

class DateTimeControl {
    static defaultFormatDatetime = 'YYYY-MM-DD hh:mm:ss';
    static defaultFormatDate = 'YYYY-MM-DD';

    static convertData(data, fromFormat, toFormat) {
        return moment(data, fromFormat).format(toFormat ? toFormat : DateTimeControl.defaultFormatDate);
    }

    static parseToMoment(data, format) {
        return moment(data, format);
    }

    static convertEleDate(ele$, opts = {}) {
        let toFormat = opts?.['toFormat'] || DateTimeControl.defaultFormatDate;
        let defaultIsEmpty = opts?.['defaultIsEmpty'] !== undefined ? opts?.['defaultIsEmpty'] : '';

        let data = $(ele$).val();
        if (data) {
            let fromFormat = $(ele$).attr('data-locale-format');
            return DateTimeControl.convertData(data, fromFormat, toFormat);
        }
        return defaultIsEmpty;
    }

    static convertEleDatetime(ele$, opts = {}) {
        let toFormat = opts?.['toFormat'] || DateTimeControl.defaultFormatDatetime;
        let defaultIsEmpty = opts?.['defaultIsEmpty'] !== undefined ? opts?.['defaultIsEmpty'] : '';

        let data = $(ele$).val();
        if (data) {
            let fromFormat = $(ele$).attr('data-locale-format');
            return DateTimeControl.convertData(data, fromFormat, toFormat);
        }
        return defaultIsEmpty;
    }

    static convertDateToMoment(data, opts = {}) {
        let toFormat = opts?.['toFormat'] || DateTimeControl.defaultFormatDate;
        let defaultIsEmpty = opts?.['defaultIsEmpty'] !== undefined ? opts?.['defaultIsEmpty'] : '';
        if (data) {
            return moment(data, toFormat);
        }
        return defaultIsEmpty;
    }

    static convertDatetimeToMoment(data, opts = {}) {
        let toFormat = opts?.['toFormat'] || DateTimeControl.defaultFormatDatetime;
        let defaultIsEmpty = opts?.['defaultIsEmpty'] !== undefined ? opts?.['defaultIsEmpty'] : '';
        if (data) {
            return moment(data, toFormat);
        }
        return defaultIsEmpty;
    }

    static reformatData(data, fromFormat, toFormat, defaultIsEmpty = '') {
        if (data) {
            return moment(data, fromFormat).format(toFormat);
        }
        return defaultIsEmpty;
    }

    static isSameDay(date1, date2) {
      return date1.getDate() === date2.getDate() &&
             date1.getMonth() === date2.getMonth() &&
             date1.getFullYear() === date2.getFullYear();
    }

    static diffDay(date1, date2){
        const rDate1 = new Date(date1.getYear(), date1.getMonth(), date1.getDate());
        const rDate2 = new Date(date2.getYear(), date2.getMonth(), date2.getDate());

        const timeDifference = Math.abs(rDate2 - rDate1);
        return Math.ceil(timeDifference / (1000 * 60 * 60 * 24));
    }

    static getCurrentDate(dateType = "YMD", separate = "-") {
        let currentDate = new Date();
        let day = String(currentDate.getDate()).padStart(2, '0');
        let month = String(currentDate.getMonth() + 1).padStart(2, '0');
        let year = currentDate.getFullYear();
        switch (dateType) {
            case "YMD":
                return `${year}${separate}${month}${separate}${day}`;
            case "DMY":
                return `${day}${separate}${month}${separate}${year}`;
            case "MDY":
                return `${month}${separate}${day}${separate}${year}`;
            default:
                throw new Error("Invalid dateType. Use 'YMD', 'DMY', or 'MDY'.");
        }
    }

    static formatDateType(fromType, toType, dateStr) {
        const formatMap = {
            'YYYY': 'year',
            'MM': 'month',
            'DD': 'day',
            'hh': 'hour',
            'mm': 'minute',
            'ss': 'second'
        };

        const getDateParts = (format, dateStr) => {
            const delimiters = /[-/ :]/;
            const formatParts = format.split(delimiters);
            const dateParts = dateStr.split(delimiters);
            const result = {};

            formatParts.forEach((part, index) => {
                if (formatMap[part]) {
                    result[formatMap[part]] = dateParts[index]?.padStart(2, '0') || '00';
                }
            });

            return result;
        };

        const parts = getDateParts(fromType, dateStr);

        return toType
            .replace('YYYY', parts.year || '0000')
            .replace('MM', parts.month || '00')
            .replace('DD', parts.day || '00')
            .replace('hh', parts.hour || '00')
            .replace('mm', parts.minute || '00')
            .replace('ss', parts.second || '00');
    }

    static getMonthInfo(month, year) {
        if (month < 1 || month > 12) {
            throw new Error("Month must be between 1 and 12");
        }

        const targetMonth = month - 1; // JS Date dùng month 0-based

        const firstDate = new Date(year, targetMonth, 1);
        const lastDate = new Date(year, targetMonth + 1, 0);

        const formatDate = (date) => {
            const dd = String(date.getDate()).padStart(2, '0');
            const mm = String(date.getMonth() + 1).padStart(2, '0');
            const yyyy = date.getFullYear();
            return `${dd}/${mm}/${yyyy}`;
        };

        return {
            "month": month,
            "year": year,
            "from": formatDate(firstDate),
            "to": formatDate(lastDate)
        };
    }

    static initDatePicker(ele) {
        $(ele).daterangepicker({
            singleDatePicker: true,
            timepicker: false,
            showDropdowns: true,
            minYear: parseInt(moment().format('YYYY'), 10) - 50,
            maxYear: parseInt(moment().format('YYYY'), 10) + 5,
            locale: {
                format: 'DD/MM/YYYY',
            },
            autoApply: true,
            autoUpdateInput: false,
        }).on('apply.daterangepicker', function (ev, picker) {
            $(ele).val(picker.startDate.format('DD/MM/YYYY')).trigger('change');
        });
        $(ele).val('').trigger('change');
    }

    static initFlatPickrDate(ele) {
        if (!ele._flatpickr) {
            flatpickr(ele, {
                dateFormat: "d/m/Y",
                allowInput: true,
                disableMobile: true,
                locale: 'vn',
                onChange: function (selectedDates, dateStr, instance) {
                    if (selectedDates.length > 0) {
                        const d = selectedDates[0];
                        const formatted = ('0' + d.getDate()).slice(-2) + '/' +
                            ('0' + (d.getMonth() + 1)).slice(-2) + '/' +
                            d.getFullYear();
                        $(ele).val(formatted).trigger('change');
                    }
                },
                defaultDate: null
            });

            $(ele).val('').trigger('change');
        }
    }

    static initFlatPickrDateInMonth(ele, month, year) {
        // month: 1-based (e.g. 7 for July)
        const targetMonth = month - 1; // flatpickr uses 0-based months
        const targetYear = year;

        const startDate = new Date(targetYear, targetMonth, 1);
        const endDate = new Date(targetYear, targetMonth + 1, 0);

        let fp = flatpickr(ele, {
            dateFormat: "d/m/Y",
            allowInput: true,
            disableMobile: true,
            locale: 'vn',
            defaultDate: startDate,
            minDate: startDate,
            maxDate: endDate,
            onChange: function (selectedDates, dateStr, instance) {
                if (selectedDates.length > 0) {
                    const d = selectedDates[0];
                    const formatted = ('0' + d.getDate()).slice(-2) + '/' +
                        ('0' + (d.getMonth() + 1)).slice(-2) + '/' +
                        d.getFullYear();
                    $(ele).val(formatted).trigger('change');
                }
            },
            onReady: function (selectedDates, dateStr, instance) {
                // Set calendar to desired month/year without triggering restrict logic
                instance.currentYear = targetYear;
                instance.changeMonth(targetMonth - instance.currentMonth); // move to desired month
                instance.redraw();
            },
            // Optional: prevent switching month/year manually
            onMonthChange: function (selectedDates, dateStr, instance) {
                instance.setDate(startDate, false);
            },
            onYearChange: function (selectedDates, dateStr, instance) {
                instance.setDate(startDate, false);
            }
        });

        $(ele).val('').trigger('change');
    }

}

class Beautiful {
    static randomColorClass() {
        const randomColor = [
            "primary", "success", "warning", "danger", "info", "red", "green", "pink", "purple",
            "violet", "indigo", "blue", "sky", "cyan", "teal", "neon", "lime", "sun", "yellow", "orange", "pumpkin",
            "brown", "gold", "light", "dark"
        ]
        return randomColor[Math.floor(Math.random() * 25)]
    }

    static randomColorHex(){
        return "#000000".replace(/0/g,function(){return (~~(Math.random()*16)).toString(16);});
    }

    static hexToRgb(hex) {
        hex = hex.replace(/^#/, '');
        let r = parseInt(hex.slice(0, 2), 16);
        let g = parseInt(hex.slice(2, 4), 16);
        let b = parseInt(hex.slice(4, 6), 16);

        return { r, g, b };
    }

    static rgbToHex(r, g, b) {
        return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
    }

    static lightenColor(hex, factor) {
        let { r, g, b } = Beautiful.hexToRgb(hex);

        r = Math.min(255, Math.floor(r + (255 - r) * factor));
        g = Math.min(255, Math.floor(g + (255 - g) * factor));
        b = Math.min(255, Math.floor(b + (255 - b) * factor));

        return Beautiful.rgbToHex(r, g, b);
    }
}

class FileControl {
    static get_val(input_val, default_empty = null) {
        if (input_val) {
            let result = [];
            input_val.split(",").map(
                (item) => {
                    if (item && UtilControl.checkUUID4(item)) result.push(item);
                }
            )
            return result;
        }
        return default_empty
    }

    static convert_size_to_simple_display(value, typeCode) {
        function upto_level(_typeCode) {
            if (_typeCode === '') {
                return 'KB';
            }
            if (_typeCode === 'KB') {
                return 'MB';
            }
            if (_typeCode === 'MB') {
                return 'GB';
            }
            return 'TB';
        }

        if (value > 1024) {
            if (typeCode === 'TB') {
                return {
                    value,
                    typeCode
                }
            }
            return FileControl.convert_size_to_simple_display(
                value / 1024,
                upto_level(typeCode)
            )
        }
        return {
            value,
            typeCode
        }
    }

    static parse_size(value, round = 2) {
        let data = FileControl.convert_size_to_simple_display(value, "")
        return `${data.value.toFixed(round)} ${data.typeCode}`;
    }

    static resolve_ids(ids) {
        let result = [];
        ids.split(",").map(
            (item) => {
                if (item) {
                    result.push(item.trim());
                }
            }
        )
        return result.join(",");
    }

    static call_ajax_detail_attribute(fileID) {
        let $modalFileAttr = $('.modal.modal-file-attribute');
        if (fileID && $modalFileAttr.length > 0) {
            // call ajax get detail of file
            WindowControl.showLoading();
            $.fn.callAjax2({
                url: $modalFileAttr.attr('data-url-detail').format_url_with_uuid(fileID),
                method: 'GET',
                isLoading: true,
            }).then(
                (resp) => {
                    let data = $.fn.switcherResp(resp);
                    if (data) {
                        let fileData = data;
                        let fileNameEle = $modalFileAttr[0].querySelector('.file-name');
                        let docTypeEle = $modalFileAttr[0].querySelector('.file_attr_document_type');
                        let contentGrEle = $modalFileAttr[0].querySelector('.file_attr_content_group');
                        let remarkEle = $modalFileAttr[0].querySelector('.file_attr_remark');
                        let btnSaveEle = $modalFileAttr[0].querySelector('.btn-save');
                        if (fileNameEle) {
                            fileNameEle.innerHTML = fileData?.['file_name'];
                        }
                        if (docTypeEle) {
                            let dataS2 = [];
                            if (fileData?.['document_type']) {
                                dataS2 = [fileData?.['document_type']];
                            }
                            let $appIDCurrentEle = $('#app_id_current');
                            let appIDCurrent = null;
                            if ($appIDCurrentEle.length > 0) {
                                appIDCurrent = JSON.parse($appIDCurrentEle.text());
                            }
                            FormElementControl.loadInitS2($(docTypeEle), dataS2, {'applications__id': appIDCurrent}, $modalFileAttr, true);
                        }
                        if (contentGrEle) {
                            let dataS2 = [];
                            if (fileData?.['content_group']) {
                                dataS2 = [fileData?.['content_group']];
                            }
                            FormElementControl.loadInitS2($(contentGrEle), dataS2, {}, $modalFileAttr, true);
                        }
                        if (remarkEle) {
                            $(remarkEle).val("");
                            if (fileData?.['remarks']) {
                                $(remarkEle).val(fileData?.['remarks']);
                            }
                        }
                        if (btnSaveEle) {
                            $(btnSaveEle).attr('data-id', fileID);
                            $(btnSaveEle).off('click').on('click', function () {
                                let fileID = $(btnSaveEle).attr('data-id');
                                FileControl.call_ajax_edit_attribute(fileID);
                            })
                        }
                        $modalFileAttr.modal('show');
                        WindowControl.hideLoading();
                    }
                }
            )
        }
    }

    static call_ajax_edit_attribute(fileID) {
        let dataSubmit = {};
        let $modalFileAttr = $('.modal.modal-file-attribute');
        if (fileID && $modalFileAttr.length > 0) {
            let docTypeEle = $modalFileAttr[0].querySelector('.file_attr_document_type');
            let contentGrEle = $modalFileAttr[0].querySelector('.file_attr_content_group');
            let remarkEle = $modalFileAttr[0].querySelector('.file_attr_remark');
            if (docTypeEle && contentGrEle && remarkEle) {
                dataSubmit['document_type_id'] = null;
                if ($(docTypeEle).val()) {
                    dataSubmit['document_type_id'] = $(docTypeEle).val();
                }
                dataSubmit['content_group_id'] = null;
                if ($(contentGrEle).val()) {
                    dataSubmit['content_group_id'] = $(contentGrEle).val();
                }
                if ($(remarkEle).val()) {
                    dataSubmit['remarks'] = $(remarkEle).val();
                }
            }
        }
        // call ajax update file
        WindowControl.showLoading({'loadingTitleAction': 'UPDATE'});
        $.fn.callAjax2(
            {
                'url': $modalFileAttr.attr('data-url-detail').format_url_with_uuid(fileID),
                'method': 'PUT',
                'data': dataSubmit,
            }
        ).then(
            (resp) => {
                let data = $.fn.switcherResp(resp);
                if (data && (data['status'] === 201 || data['status'] === 200)) {
                    $.fn.notifyB({description: data.message}, 'success');
                    setTimeout(() => {
                        WindowControl.hideLoading();
                    }, 2000);
                }
            }, (err) => {
                setTimeout(() => {
                    WindowControl.hideLoading();
                }, 1000)
                $.fn.notifyB({description: err?.data?.errors || err?.message}, 'failure');
            }
        )
    }

    ui_multi_add_file(id, file) {
        // Creates a new file and add it to our list
        let base64Capture = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzVweCIgaGVpZ2h0PSIzNXB4IiB2aWV3Qm94PSIwIDAgMjQgMjQiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CiAgPGc+CiAgICA8cGF0aCBkPSJNMTkgOVYxNy44QzE5IDE4LjkyMDEgMTkgMTkuNDgwMiAxOC43ODIgMTkuOTA4QzE4LjU5MDMgMjAuMjg0MyAxOC4yODQzIDIwLjU5MDMgMTcuOTA4IDIwLjc4MkMxNy40ODAyIDIxIDE2LjkyMDEgMjEgMTUuOCAyMUg4LjJDNy4wNzk4OSAyMSA2LjUxOTg0IDIxIDYuMDkyMDIgMjAuNzgyQzUuNzE1NjkgMjAuNTkwMyA1LjQwOTczIDIwLjI4NDMgNS4yMTc5OSAxOS45MDhDNSAxOS40ODAyIDUgMTguOTIwMSA1IDE3LjhWNi4yQzUgNS4wNzk4OSA1IDQuNTE5ODQgNS4yMTc5OSA0LjA5MjAyQzUuNDA5NzMgMy43MTU2OSA1LjcxNTY5IDMuNDA5NzMgNi4wOTIwMiAzLjIxNzk5QzYuNTE5ODQgMyA3LjA3OTkgMyA4LjIgM0gxM00xOSA5TDEzIDNNMTkgOUgxNEMxMy40NDc3IDkgMTMgOC41NTIyOCAxMyA4VjMiIHN0cm9rZT0iIzAwMDAwMCIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiLz4KICA8L2c+Cjwvc3ZnPgo=';
        let template = $(
            this.ele$.find('.pattern-file-text-plain').text()
                .replace('%%filename%%', file.name)
                .replace('%%fileid%%', id)
                .replace('%%fileinfo%%', FileControl.parse_size(file.size))
                .replace('%%filecapture%%', base64Capture)
        );
        const elePreview$ = template.find('.file-preview-link');
        if (elePreview$.length > 0){
            elePreview$.attr('href', elePreview$.attr('href').replaceAll('__pk__', id));
        }
        this.ele$.find('.dm-uploader-no-files').hide();

        this.ele$.find('.dm-uploader-result-list').prepend(template).fadeIn();

        let $dmUploader = this.ele$.find(`.dm-uploader-result-item[data-file-id="${id}"]`);
        if ($dmUploader.length > 0) {
            let $btnEditAttr = $dmUploader.find('.btn-edit-attribute');
            if ($btnEditAttr.length > 0) {
                $btnEditAttr.attr('data-file-id', id);
            }
        }

    }

    ui_multi_update_file_progress(id, percent, class_state) {
        let ele = this.ele$.find(`[data-file-id="${id}"]`);
        if (ele.length > 0) {
            ele.alterClass('state-f-*').addClass(class_state);
            if (percent) {
                ele.find('.btn-percent-upload').addClass('show').text(percent + '%');
                if (percent === 100) {
                    setTimeout(
                        () => {
                            ele.find('.btn-percent-upload').fadeOut().removeClass('show');
                        },
                        1000
                    )
                }
            }
        }
    }

    ui_update_input_file(config) {
        // resolve type
        let acceptData = [];
        let acceptDataTxt = 'ALL';
        let allowType = config.allowedTypes;
        if (allowType && allowType !== '*') {
            let inputFileEle = this.ele$.find('.dm-uploader input[type="file"]');
            if (inputFileEle.length > 0) {
                if (allowType.endsWith("/*")) {
                    acceptData.push(allowType);
                } else {
                    let extFile = config.extFilter;
                    if (extFile && Array.isArray(extFile)) extFile.map(
                        (item) => {
                            acceptData.push(
                                `${allowType}/${item}`
                            )
                        }
                    );
                    else acceptData.push(`${allowType}/*`);
                }

                acceptDataTxt = acceptData.join(", ");
                inputFileEle.attr('accept', acceptDataTxt);
            } else {
                acceptDataTxt = allowType;
            }
        }


        // resolve size
        let sizeLimitTxt = FileControl.parse_size(config.maxFileSize);

        // show instruction
        let htmlOfType = acceptDataTxt === 'ALL' ? '' : this.ele$.find('.template-data-error-type').text().replace('%%fileaccept%%', acceptDataTxt);
        let htmlOfSize = this.ele$.find('.template-data-error-size').text().replace('%%filesizelimit%%', sizeLimitTxt);
        this.ele$.find('.instruction-upload-file-text').append(htmlOfType, htmlOfSize);
    }

    ui_check_id_exist(id) {
        let inputEle = this.ele$.find('.dm-uploader-ids');
        return inputEle.val().indexOf(id) !== -1;
    }

    ui_add_id(id) {
        let inputEle = this.ele$.find('.dm-uploader-ids');
        let ids = inputEle.val();
        if (typeof ids === 'string' && ids.indexOf(id) === -1) {
            ids = FileControl.resolve_ids(ids + ',' + id)
            inputEle.val(ids);

            // Manually trigger the change event
            inputEle[0].dispatchEvent(new Event('change'));
        }
    }

    ui_remove_id(id) {
        if (this.init_opts.enable_remove === true) {
            let inputEle = this.ele$.find('.dm-uploader-ids');
            let ids = inputEle.val();
            if (typeof ids === 'string' && ids.indexOf(id) !== -1) {
                inputEle.val(
                    FileControl.resolve_ids(
                        ids.replace(id, '')
                    )
                );

                // Manually trigger the change event
                inputEle[0].dispatchEvent(new Event('change'));
            }
        } else {
            Swal.fire({
                icon: 'error',
                title: 'Remove was not support!',
            });
        }
    }

    ui_remove_line_file_by_id(id) {
        let itemEle = this.ele$.find(`.dm-uploader-result-list .dm-uploader-result-item[data-file-id="${id}"]`);
        if (itemEle.length > 0) {
            this.ui_remove_id(itemEle.attr('data-file-id'));
            itemEle.remove();
        }

        let resultItem = this.ele$.find('.dm-uploader-result-list .dm-uploader-result-item');
        if (resultItem.length === 0) {
            this.ele$.find('.dm-uploader-no-files').fadeIn();
            this.ele$.find('.dm-uploader-result-list').fadeOut();
        }
    }

    ui_on_click_remove(parentEle = null) {
        if (this.init_opts.enable_remove === true) {
            let clsThis = this;
            let itemEle = parentEle ? parentEle : clsThis.ele$.find('.dm-uploader-result-item');
            itemEle.find('.btn-destroy-file').on('click', function () {
                let itemEle = $(this).closest('.dm-uploader-result-item');
                Swal.fire({
                    title: $.fn.transEle.attr('data-sure-delete'),
                    icon: 'question',
                    html: `
                        <p>${itemEle.find('.f-item-name').text()}</p>
                        <small class="text-warning">${$.fn.transEle.attr('data-change-not-save-until-doc-save')}</small>
                    `,
                    confirmButtonText: $.fn.transEle.attr('data-msg-yes-delete-it'),
                    cancelButtonText: $.fn.transEle.attr('data-cancel'),
                    showCancelButton: true,
                }).then(
                    (results) => {
                        if (results.isConfirmed) {
                            clsThis.ui_remove_line_file_by_id(itemEle.attr('data-file-id'));
                        }
                    }
                )
            })
        }
    }

    ui_on_click_download(parentEle=null){
        if (this.init_opts.enable_download === true){
            const clsThis = this;
            const itemEle = parentEle ? parentEle : clsThis.ele$.find('dm-uploader-result-item');
            itemEle.find('.btn-download-file').on('click', function (){
                let itemEle = $(this).closest('.dm-uploader-result-item');
                FileControl.download(itemEle.attr('data-file-id'));
            })
        }
    }

    ui_on_show_file_cloud() {
        // Call ajax (DTB) when fist open modal
        let clsThis = this;
        let modalEle = this.ele$.find('.modal.modal-file-cloud');
        let selectedGroup = modalEle.find('.selected-file-cloud');
        let tblEle = modalEle.find('table.select-file-cloud');

        function refresh_dtb() {
            tblEle.DataTable().rows().clear();
            selectedGroup.empty().closest('.selected-file-cloud-group').fadeOut();
        }

        modalEle.on('show.bs.modal', function () {
            if (tblEle.length === 1) {
                if ($.fn.DataTable.isDataTable(tblEle)) {
                    refresh_dtb();
                    tblEle.DataTable().ajax.reload();
                } else {
                    tblEle.DataTableDefault({
                        useDataServer: true,
                        styleDom: 'small',
                        ajax: {
                            url: tblEle.attr('data-url'),
                            type: 'GET',
                            dataSrc: function (resp) {
                                let data = $.fn.switcherResp(resp);
                                if (data && resp.data.hasOwnProperty('file_list')) {
                                    return resp.data['file_list'] ? resp.data['file_list'] : [];
                                }
                                throw Error('Call data raise errors.')
                            },
                        },
                        columns: [
                            {
                                width: '10%',
                                render: (data, type, row) => {
                                    return `<div class="form-check"><input type="checkbox" class="form-check-input row-select"></div>`;
                                }
                            },
                            {
                                width: '25%',
                                className: 'wrap-text',
                                data: 'file_name',
                                render: (data, type, row) => {
                                    return data;
                                }
                            },
                            {
                                width: '15%',
                                className: 'wrap-text',
                                data: 'file_size',
                                render: (data, type, row) => {
                                    if (data) {
                                        return FileControl.parse_size(data)
                                    }
                                    return data;
                                }
                            },
                            {
                                width: '25%',
                                className: 'wrap-text',
                                data: 'remarks',
                                render: (data, type, row) => {
                                    return data || '';
                                }
                            },
                            {
                                width: '25%',
                                className: 'wrap-text',
                                data: 'date_created',
                                render: (data, type, row) => {
                                    if (data) {
                                        return $x.fn.displayRelativeTime(data);
                                    }
                                    return data;
                                }
                            },
                        ],
                        rowCallback: function (row, data, displayNum, displayIndex, dataIndex) {
                            $(row).find('input[type="checkbox"].row-select').on('change', function () {
                                if ($(this).prop('checked') === true) {
                                    selectedGroup.closest('.selected-file-cloud-group').fadeIn();
                                    selectedGroup.append(
                                        $(`
                                        <span 
                                            class="selected-file-cloud-item badge badge-soft-primary mr-1 mb-1" 
                                            data-id="${data.id}"
                                        >
                                            ${data.file_name}
                                            <script type="application/json" class="d-none">
                                                ${JSON.stringify(data)}
                                            </script>
                                        </span>
                                    `)
                                    )
                                } else {
                                    selectedGroup.find(`.selected-file-cloud-item[data-id="${data.id}"]`).remove();
                                    if (selectedGroup.find('.selected-file-cloud-item').length === 0) {
                                        selectedGroup.closest('.selected-file-cloud-group').fadeOut();
                                    }
                                }
                            })
                        },
                        initComplete: function (settings, json) {
                            modalEle.find('button.save-change-file-cloud').on('click', function () {
                                let ids = {};
                                selectedGroup.find('.selected-file-cloud-item').each(function () {
                                    ids[$(this).attr('data-id')] = JSON.parse($(this).find('script').text());
                                })
                                let skipFileName = [];
                                Object.keys(ids).map(
                                    (key) => {
                                        let file_id = ids[key]?.['id'];
                                        if (file_id && clsThis.ui_check_id_exist(file_id)) skipFileName.push(ids[key].file_name);
                                        else clsThis.ui_load_file_data(ids[key]);
                                    }
                                )
                                if (skipFileName.length > 0) {
                                    Swal.fire({
                                        position: "top-end",
                                        icon: "info",
                                        html: `<p>${clsThis.ele$.attr('data-msg-skip-exist-file')}</p> <b>${skipFileName.join(", ")}</b>`,
                                        showConfirmButton: false,
                                        timer: 1000,
                                    });
                                }
                            })
                        },
                    });
                }
            }
        })
    }

    ui_on_click_edit_attribute(parentEle = null) {
        let clsThis = this;
        let itemEle = parentEle ? parentEle : clsThis.ele$.find('.dm-uploader-result-item');
        itemEle.find('.btn-edit-attribute').on('click', function () {
            let fileID = $(this).attr('data-file-id');
            FileControl.call_ajax_detail_attribute(fileID);
        })
    }

    event_for_destroy(element, hide_or_show) {
        let itemEle = $(element).closest('.dad-file-control-group').find('.dm-uploader-result-list').find('button.btn-destroy-file').addClass('d-none');
        if (itemEle.length > 0) {
            if (hide_or_show === 'hide') {
                itemEle.addClass('d-none')
            } else if (hide_or_show === 'show') {
                itemEle.removeClass('d-none')
            }
        }
    }

    ui_load_file_data(fileData) {
        let file_id = fileData?.['id'];
        if (file_id) {
            if (!this.ui_check_id_exist(file_id)) {
                let f_obj = new File([""], fileData.file_name, {
                    name: fileData.file_name,
                    type: fileData.file_type,
                    lastModified: $x.fn.parseDateTime(fileData.date_created),
                });
                Object.defineProperty(f_obj, 'remarks', {value: fileData.remarks});
                Object.defineProperty(f_obj, 'size', {value: fileData.file_size});
                Object.defineProperty(f_obj, 'document_type', {value: fileData.document_type});
                Object.defineProperty(f_obj, 'content_group', {value: fileData.content_group});
                this.ui_multi_add_file(fileData.id, f_obj);
                this.ui_multi_update_file_progress(fileData.id, null, 'state-f-success');
                this.ui_on_click_remove(
                    this.ele$.find(`.dm-uploader-result-item[data-file-id="${fileData.id}"]`)
                )
                this.ui_on_click_download(
                    this.ele$.find(`.dm-uploader-result-item[data-file-id="${fileData.id}"]`)
                )
                this.ui_on_click_edit_attribute(
                    this.ele$.find(`.dm-uploader-result-item[data-file-id="${fileData.id}"]`)
                )
                this.ui_add_id(fileData.id);
            } else {
                Swal.fire({
                    position: "top-end",
                    icon: "info",
                    html: `<p>${this.ele$.attr('data-msg-skip-exist-file')}</p> <b>${fileData.file_name}</b>`,
                    showConfirmButton: false,
                    timer: 1000,
                });
            }
        } else {
            Swal.fire({
                icon: 'error',
                title: this.ele$.attr('data-msg-upload-exception'),
            });
        }
    }

    _config() {
        let clsThis = this;
        return {
            url: '#',
            // maxFileSize: 3 * 1024 * 1024, // 3 Megs (MB)
            maxFileSize: 15 * 1024 * 1024, // 15 Megs (MB)
            allowedTypes: "*",
            extFilter: null,
            onDragEnter: function () {
                // Happens when dragging something over the DnD area
                this.addClass('active');
            },
            onDragLeave: function () {
                // Happens when dragging something OUT of the DnD area
                this.removeClass('active');
            },
            onInit: function () {
                // Plugin is ready to use
            },
            onComplete: function () {
                // All files in the queue are processed (success or error)
            },
            onNewFile: function (id, file) {
                // When a new file is added using the file selector or the DnD area
                clsThis.ui_multi_add_file(id, file);
            },
            onBeforeUpload: function (id) {
                // about tho start uploading a file
                clsThis.ui_multi_update_file_progress(id, 0, 'state-f-wait');
            },
            onUploadCanceled: function (id) {
                // Happens when a file is directly canceled by the user.
                clsThis.ui_multi_update_file_progress(id, 0, 'state-f-cancel');
            },
            onUploadProgress: function (id, percent) {
                // Updating file progress
                clsThis.ui_multi_update_file_progress(id, percent, 'state-f-progress');
            },
            onUploadSuccess: function (id, data) {
                // A file was successfully uploaded
                clsThis.ui_multi_update_file_progress(id, 100, 'state-f-success');
            },
            onUploadError: function (id, xhr, status, message) {
                clsThis.ui_multi_update_file_progress(id, 0, 'state-f-error');
            },
            onFallbackMode: function () {
            },
            onFileTypeError: function (file) {
            },
            onFileSizeError: function (file) {
            },
            onFileExtError: function (file) {
            },
            onDestroy: function () {
                // $(element).addClass('d-none');
                this.onDisableDaD();
                clsThis.event_for_destroy(this, 'hide');
                clsThis.ele$.find('.instruction-upload-file-text p:nth-child(n+1)').remove();
                clsThis.ele$.find('.dm-uploader-result-list').html('');
                clsThis.ele$.find('.dm-uploader-no-files').css({ 'display': 'block'});
            },
            onDisableDaD: function () {
                $(this).find('input[type="file"]').prop('disabled', true).prop('readonly', true);
                $(this).find('button.btn-select-cloud').prop('disabled', true).prop('readonly', true);
                clsThis.event_for_destroy(this, 'hide');
            },
            onEnableDaD: function () {
                $(this).find('input[type="file"]').prop('disabled', false).prop('readonly', false);
                $(this).find('button.btn-select-cloud').prop('disabled', false).prop('readonly', false);
                clsThis.event_for_destroy(this, 'show');
            },
        }
    }

    constructor(ele$, opts = {}) {
        this.ele$ = ele$;
        this.config = {
            ...this._config(),
            ...opts,
        }
        this.init_opts = {};
    }

    init(opts = {}) {
        let clsThis = this;
        const config = this.config;
        if (!this.ele$.hasClass('dad-file-control-group')) {
            this.ele$.find('.dad-file-control-group').each(function () {
                new FileControl(
                    $(this),
                    config,
                ).init(opts);
            });
            return;
        } else {
            opts = {
                'name': '',
                'data': [],
                enable_download: false,
                ...(
                    opts?.['enable_edit'] === true || opts?.['enable_edit'] === undefined ? {
                        'readonly': false,
                        'disabled': false,
                        'enable_choose_file': true,
                        'enable_remove': true,
                    } : {
                        'readonly': true,
                        'disabled': true,
                        'enable_choose_file': false,
                        'enable_remove': false,
                    }
                ),
                'required': false,
                'select_folder': !!opts?.['select_folder'],
                ...opts
            }
            this.init_opts = opts;
            this.ele$.each(function () {
                let groupEle = $(this);
                let dmUploaderEle = $(groupEle).find('.dm-uploader');
                let dmResults = $(groupEle).find('.dm-uploader-results')

                if (dmUploaderEle.length > 0 && dmResults.length > 0) {
                    dmUploaderEle.dmUploader({
                        ...config,
                        maxFileSize: opts?.['maxFileSize'] ? opts['maxFileSize'] : config['maxFileSize'],
                        extraData: async function (fileId, fileData) {
                            const result = await Swal.fire({
                                // input: "text",
                                // title: groupEle.attr('data-msg-attribute-file'),
                                // html: fileData.name,
                                // inputAttributes: {
                                //     autocapitalize: "off"
                                // },
                                // html: String(FileControl.setupHTMLFileAttributes(groupEle, fileData.name)),
                                title: "Upload file successfully!",
                                icon: "success",
                                customClass: {
                                    htmlContainer: 'sweet-alert-left-content', // only the html content
                                },
                                cancelButtonText: $.fn.transEle.attr('data-cancel'),
                                showCancelButton: true,
                                allowOutsideClick: false,
                                // didOpen: () => {
                                //     // logics after SweetAlert render
                                //     let $attrDocTypeEle = $('#file_attr_document_type');
                                //     let $attrContentGrEle = $('#file_attr_content_group');
                                //     if ($attrDocTypeEle.length > 0 && $attrContentGrEle.length > 0) {
                                //         FormElementControl.loadInitS2($attrDocTypeEle, [], {}, $(Swal.getPopup()), true);
                                //         FormElementControl.loadInitS2($attrContentGrEle, [], {}, $(Swal.getPopup()), true);
                                //     }
                                // }
                            });
                            if (!result.isConfirmed) {
                                clsThis.ui_remove_line_file_by_id(fileId);
                                return {state: false, data: 'CANCEL'};
                            }
                            // const remarks = result.value;
                            const $folderId = opts?.['element_folder'];
                            // file attributes
                            // let $attrDocTypeEle = $('#file_attr_document_type');
                            // let $attrContentGrEle = $('#file_attr_content_group');
                            // let $attrRemarkEle = $('#file_attr_remark');
                            let data = {};
                            // if ($attrDocTypeEle.length > 0 && $attrContentGrEle.length > 0 && $attrRemarkEle.length > 0) {
                            //     data = {'remarks': $attrRemarkEle.val()};
                            //     if ($attrDocTypeEle.val()) {
                            //         data['document_type_id'] = $attrDocTypeEle.val();
                            //     }
                            //     if ($attrContentGrEle.val()) {
                            //         data['content_group_id'] = $attrContentGrEle.val();
                            //     }
                            // }

                            const finalExtend = {
                                state: true,
                                data: data,
                            };
                            // check select folder
                            if ('select_folder' in opts && 'element_folder' in opts){
                                const checkValid = $x.fn.checkUUID4($folderId.val())
                                if (!checkValid){
                                    const fruit = await Swal.fire({
                                        title: "Select folder",
                                        showConfirmButton: true,
                                        html: `<div class="form-group">` +
                                            `<select class="form-select auto-init-select2" data-url="${
                                                $('#url-factory').attr('data-folder-api')}" data-method="GET" data-keyResp="folder_list"></select></div>`,
                                        didOpen: () => {
                                            $('#swal2-html-container select').initSelect2()
                                        },
                                        preConfirm: function () {
                                            return {folder: $('#swal2-html-container select').val()}
                                        },
                                    });
                                    if (fruit.isConfirmed) $folderId.val(fruit.value?.['folder']);
                                    else {
                                        clsThis.ui_remove_line_file_by_id(fileId);
                                        return {state: false, data: 'CANCEL'};
                                    }
                                }
                                finalExtend.data.folder = $folderId.val()
                            }
                            return finalExtend
                        },
                        url: $(clsThis.ele$).attr('data-url'),
                        headers: {
                            'X-CSRFToken': clsThis.ele$.find('input[name="csrfmiddlewaretoken"]').val()
                        },
                        onUploadSuccess: function (id, data) {
                            let fileData = data?.['data']?.['file_detail'] || null;
                            if (typeof fileData === 'object' && fileData.hasOwnProperty('id')) {
                                config.onUploadSuccess(id, data);
                                let eleItem = clsThis.ele$.find(`.dm-uploader-result-item[data-file-id="${id}"]`);
                                eleItem.attr('data-file', JSON.stringify(fileData));
                                eleItem.attr('data-file-id', fileData.id);
                                eleItem.find('a.file-preview-link').attr('href', '/attachment/preview/1'.format_url_with_uuid(fileData.id));
                                let $btnEditAttr = eleItem.find('.btn-edit-attribute');
                                if ($btnEditAttr.length > 0) {
                                    $btnEditAttr.attr('data-file-id', fileData?.['id']);
                                }
                                clsThis.ui_on_click_remove(eleItem);
                                clsThis.ui_on_click_download(eleItem);
                                clsThis.ui_on_click_edit_attribute(eleItem);
                                clsThis.ui_add_id(fileData.id);
                                if (opts?.CB_after_upload){
                                    opts.CB_after_upload(fileData)
                                }
                            }
                            else {
                                Swal.fire({
                                    icon: 'error',
                                    title: clsThis.ele$.attr('data-msg-upload-exception'),
                                });
                            }
                        },
                        onUploadError: function (id, xhr, status, message) {
                            config.onUploadError(id, xhr, status, message);
                            let crt_msg = clsThis.ele$.attr('data-msg-upload-exception');
                            if (xhr?.['responseJSON']?.data?.errors) crt_msg = xhr['responseJSON'].data.errors
                            let custom_opts = {
                                icon: 'error',
                                title: crt_msg,
                            }
                            if (xhr?.['status'] === 403) custom_opts = {
                                html:
                                    `<div class="d-flex align-items-center">` +
                                    `<div class="me-3"><img style="width: 60px; height: 60px" src="/static/assets/images/systems/forbidden.gif" alt="icon"></div>` +
                                    `<div><h4 class="text-danger">${$.fn.gettext("Forbidden")}</h4>` +
                                    `<p>${$.fn.gettext('You do not have permission to perform this action!')}</p></div></div>`,
                                customClass: {
                                    container: 'swal2-has-bg',
                                    htmlContainer: 'bg-transparent text-start',
                                    actions: 'w-100',
                                },
                                allowOutsideClick: true,
                                showDenyButton: true,
                                denyButtonText: $.fn.gettext('Home Page'),
                                confirmButtonColor: '#3085d6',
                                showConfirmButton: true,
                                confirmButtonText: $.fn.gettext('Previous page'),
                                denyButtonColor: '#21b48f',
                                preConfirm: function (opts) {
                                    window.location.href = document.referrer;
                                },
                                preDeny: function () {
                                    window.location.href = '/';
                                },
                            }
                            Swal.fire(custom_opts);
                            clsThis.ui_remove_line_file_by_id(id);
                        },
                        onInit: function () {
                            // append input file ids storages
                            $(dmResults).append(`
                                <input 
                                    type="text" 
                                    ${opts.name ? 'name="' + opts.name + '"' : ''} 
                                    value="" 
                                    class="dm-uploader-ids hidden" 
                                    ${opts.readonly ? "readonly" : ""}
                                    ${opts.disabled ? "disabled" : ""}
                                    ${opts.required ? "required" : ""}
                                />
                            `);
                            groupEle.addClass('dm-uploader-initializer');

                            // init table file cloud
                            clsThis.ui_on_show_file_cloud();

                            // update input file
                            clsThis.ui_update_input_file(config);

                            // resolve exist data
                            if (Array.isArray(opts.data) && opts.data.length > 0) {
                                opts.data.map((item) => clsThis.ui_load_file_data(item))
                            }
                            else {
                                clsThis.ele$.find('.dm-uploader-no-files').show();
                            }

                            // show choose file
                            if (!opts.enable_choose_file) {
                                dmUploaderEle.remove();
                            }
                            // show remove file exist
                            if (!opts.enable_remove) {
                                clsThis.ele$.find('button.btn-destroy-file').remove()
                            }
                            if (!opts.enable_download) {
                                clsThis.ele$.find('button.btn-download-file').remove()
                            }
                        },
                        onFileTypeError: function (file) {
                            let templateTitle = clsThis.ele$.find('.template-title-error-type').html();
                            let templateData = clsThis.ele$.find('.instruction-upload-file-text').html();

                            Swal.fire({
                                title: templateTitle,
                                icon: "error",
                                html: templateData,
                            });
                        },
                        onFileSizeError: function (file) {
                            let templateTitle = clsThis.ele$.find('.template-title-error-size').html();
                            let templateData = clsThis.ele$.find('.instruction-upload-file-text').html();

                            Swal.fire({
                                title: templateTitle,
                                icon: "error",
                                html: templateData,
                            });
                        },
                        onFileExtError: function (file) {
                            let templateTitle = clsThis.ele$.find('.template-title-error-type').html();
                            let templateData = clsThis.ele$.find('.instruction-upload-file-text').html();

                            Swal.fire({
                                title: templateTitle,
                                icon: "error",
                                html: templateData,
                            });
                        },
                    });
                }
            });
        }
    }

    static getUrl(pk){
        return `/attachment/download/${pk}`
    }

    static download(pk){
        const a = document.createElement('a');
        a.href = FileControl.getUrl(pk);
        document.body.appendChild(a);
        a.click();
    }

    static downloadByStream(pk, successCallback = null) {
        if (!successCallback) {
            successCallback = function (chunks, response) {
                // const contentType = response.headers.get("Content-Type");
                // const blob = new Blob(chunks, {type: response.headers.get("Content-Type")});
                // const blobUrl = URL.createObjectURL(blob);
            }
        }
        const url = FileControl.getUrl(pk);
        if (url){
            $x.fn.showLoadingPage({
                'didOpenEnd': function () {
                    fetch(url)
                        .then(
                            response => {
                            const reader = response.body.getReader();
                            let chunks = [];
                            let receivedLength = 0;

                            function readChunk() {
                                return reader.read().then(
                                    (
                                        {
                                            done,
                                            value
                                        }
                                    ) => {
                                        if (done) {
                                            $x.fn.hideLoadingPage();
                                            successCallback(chunks, response);
                                            return;
                                        }

                                        chunks.push(value);
                                        receivedLength += value.length;
                                        return readChunk();
                                    }
                                );
                            }

                            return readChunk();
                        })
                        .catch(
                            error => {
                                console.error("Error fetching file:", error);
                            }
                        );
                }
            });
        } else {
            $x.fn.showNotFound();
        }
    }

    static setupHTMLFileAttributes($ele, fileName) {
        return `<div class="form-group">
                    <label class="form-label float-left" for="file_attr_document_type">Document type</label>
                    <select
                            class="form-select"
                            id="file_attr_document_type"
                            data-url="${$ele.attr('data-url-document-type')}"
                            data-method="GET"
                            data-keyResp="document_type_list"
                    ></select>
                </div>
                <div class="form-group">
                    <label class="form-label float-left" for="file_attr_content_group">Content group</label>
                    <select
                            class="form-select"
                            id="file_attr_content_group"
                            data-url="${$ele.attr('data-url-content-group')}"
                            data-method="GET"
                            data-keyResp="content_group_list"
                    ></select>
                </div>
                <div class="form-group">
                    <label class="form-label float-left" for="file_attr_remark">Description</label>
                    <textarea class="form-control" rows="4" id="file_attr_remark" name="remarks"></textarea>
                </div>`;
    }
}

class FileStreamControl {
    constructor(props) {
        this.pk = props['pk'];
        this.chunks = null;
        this.response = null;

        this._content$ = $('#idxPageContent')
    }

    get content$(){
        return this._content$;
    }

    get contentType(){
        if (this.response){
            return this.response.headers.get("Content-Type")
        }
        return null;
    }

    get blobData(){
        if (this.chunks && this.contentType){
            return new Blob(this.chunks, {type: this.contentType});
        }
        return null
    }

    get blobURI(){
        const blobData = this.blobData;
        if (blobData){
            return URL.createObjectURL(blobData);
        }
        return null;
    }

    static getAppByContentType(contentType){
        if (contentType.startsWith('image/')) {
            return 'Image';
        }
        if (contentType === 'application/pdf') {
           return 'PDF';
        }
        if (
            contentType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
            contentType === 'application/msword'
        ) {
            return 'Microsoft Words';
        }
        if (
            contentType === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
            contentType === 'application/vnd.ms-excel'
        ) {
            return 'Microsoft Excel';
        }
        if (contentType.startsWith('text/')) {
            return 'Text';
        }
        return '-';
    }

    distribution(callback=null){
        const clsThis = this;
        $x.cls.file.downloadByStream(clsThis.pk, function (chunks, response) {
            clsThis.chunks = chunks;
            clsThis.response = response;

            if (callback && typeof callback === 'function') callback.bind(clsThis)(chunks, response);
            else {
                const contentType = clsThis.contentType;
                if (contentType.startsWith('image/')) {
                    return clsThis.image();
                }
                if (contentType === 'application/pdf') {
                   return clsThis.pdf();
                }
                if (
                    contentType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
                    contentType === 'application/msword'
                ) {
                    return clsThis.docx();
                }
                if (
                    contentType === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
                    contentType === 'application/vnd.ms-excel'
                ) {
                    return clsThis.excel();
                }
                if (contentType.startsWith('text/')) {
                    return clsThis.text();
                }
                clsThis.content$.append(`<div class="w-100 d-flex justify-content-center"><p>${$.fn.gettext("This content file does not support preview")}</p></div>`)
            }
        })
    }

    image(){
        const img = document.createElement('img');
        img.src = this.blobURI;
        img.style = "width: 100%;height: 100%;object-fit: contain;"
        this.content$.append(img);
    }

    pdf(){
        const iframe = $('<iframe id="preview-pdf"></iframe>');
        iframe.attr('src', this.blobURI);
        iframe.attr('width', '100%');
        iframe.attr('height', '99%');
        this.content$.append(iframe);
    }

    docx(){
        const blob = new Blob(this.chunks, {type: this.contentType});
        docx.renderAsync(blob, this.content$[0], null, {
            debug: false,
        })
    }

    excel() {
        const clsThis = this;
        function handleBlob(blob) {
            const reader = new FileReader();
            reader.onload = function (e) {
                const arrayBuffer = e.target.result;
                processFile(arrayBuffer);
            };
            reader.onerror = function (error) {
                console.error('FileReader error:', error);
            };
            reader.readAsArrayBuffer(blob);
        }

        function processFile(arrayBuffer) {
            const data = new Uint8Array(arrayBuffer);
            const workbook = XLSX.read(data, {type: 'array'});

            const ulNav = $(`<ul class="nav nav-light nav-tabs"></ul>`);
            const tabContent$ = $(`<div class="tab-content">`);

            workbook.SheetNames.map(
                (sheetName, idx) => {
                    const sheet = workbook.Sheets[sheetName];
                    const htmlString = XLSX.utils.sheet_to_html(sheet);

                    const rdIdx = 'ex_' + $x.fn.randomStr(10);
                    const tab$ = $(`<li class="nav-item">
                                    <a class="nav-link" data-bs-toggle="tab" href="#${rdIdx}">
                                        <span class="nav-link-text">${sheetName}</span>
                                    </a>
                                </li>`);
                    const content$ = $(`
                                    <div class="tab-pane fade" id="${rdIdx}">
                                        ${htmlString}
                                    </div>
                                `);
                    if (idx === 0) {
                        tab$.find('.nav-link').addClass('active');
                        content$.addClass('show active');
                    }
                    ulNav.append(tab$);
                    tabContent$.append(content$);
                }
            )
            clsThis.content$.html([ulNav, tabContent$]).find('table').addClass('w-100 table table-bordered');
        }

        handleBlob(this.blobData);
    }

    text() {
        const clsThis = this;
        function handleBlob(blob) {
            const reader = new FileReader();
            reader.onload = function (e) {
                const txtData = e.target.result;
                processFile(txtData);
            };
            reader.onerror = function (error) {
                console.error('FileReader error:', error);
            };
            reader.readAsText(blob);
        }

        function processFile(txtData) {
            clsThis.content$.append($('<pre></pre>').html(txtData.toString()));
        }

        handleBlob(this.blobData);
    }
}

class CommentControl {
    constructor(ele$, opts = {}) {
        let {
            owner_id,
            btn_goto_enabled,
            swalOpts
        } = {
            owner_id: $x.fn.getEmployeeCurrentID(),
            btn_goto_enabled: true,
            swalOpts: {'allowOutsideClick': true},
            ...opts
        }
        this.owner_id = owner_id;
        this.btn_goto_enabled = btn_goto_enabled;
        this.swalOpts = swalOpts;

        this.ele$ = ele$;
        this.ele_list$ = ele$.find('.comment-list');
        this.ele_add = ele$.find('.comment-add-area');
        this.ele_action_all = ele$.find('.comment-action-all');

        this.pk_doc = null;
        this.pk_app = null;
        this.pageSize = 10;

        this.default_avt = '/static/assets/images/systems/file-not-found.png';
        this.default_person_avt = '/static/assets/images/systems/person-avt.png';

        this.url_employee_detail = ele$.attr('data-url-employee-detail')
    }

    __current_page(data) {
        let next = data.page_next;
        let previous = data.page_previous;
        let current = 0;
        if (next === 0 && previous === 0) current = 1;
        else if (next === 0 && previous !== 0) current = previous + 1;
        else if (next !== 0 && previous === 0) current = next - 1;
        else if (next !== 0 && previous !== 0) current = previous + 1;

        return {
            'prev': previous,
            'current': current,
            'next': next,
        }
    }

    get_url_replies(pk) {
        let urlBase = this.ele$.attr('data-url-replies');
        return urlBase && pk ? urlBase.replace('__pk__', pk) : null;
    }

    item_add_event(eleItem$, has_replies = true) {
        let clsThis = this;
        let pk = eleItem$.attr('data-comment-id');
        let urlResolved = clsThis.get_url_replies(pk);

        eleItem$.find('.icon-collapse').on('click', function () {
            $(this).find('.fa-solid').toggleClass('d-none');

            if (!$(this).find('.fa-chevron-right').hasClass('d-none')) {
                eleItem$.find('.comment-content').fadeOut('fast');
                eleItem$.find('.comment-mentions').fadeOut('fast');
                eleItem$.find('.comment-replies').fadeOut('fast');
                eleItem$.find('.comment-reply-new').fadeOut('fast');
            } else {
                eleItem$.find('.comment-content').fadeIn('fast');
                eleItem$.find('.comment-mentions').fadeIn('fast');
                eleItem$.find('.comment-replies').fadeIn('fast');
            }

        });

        if (has_replies === true) {
            let commentRepliesEle = eleItem$.find('.comment-replies');
            let eleReplyComment = eleItem$.find('.comment-reply-new');

            function loadData(btnThis, opts = {}) {
                let {
                    override_url,
                    override_push_ele_group,
                    force_run,
                    success_callback,
                    fail_callback,
                } = {
                    override_url: urlResolved,
                    override_push_ele_group: commentRepliesEle,
                    force_run: false,
                    success_callback: function () {
                    },
                    fail_callback: function () {
                    },
                    ...opts
                }

                let stateDataUrl = !!$(btnThis).attr('data-url');
                if (stateDataUrl === false || force_run === true) {
                    if (override_url) {
                        $(btnThis).attr('data-url', override_url);
                        $.fn.callAjax2({
                            url: override_url,
                            method: 'GET',
                        }).then(
                            resp => {
                                let data = $.fn.switcherResp(resp);
                                if (data) {
                                    success_callback(resp);
                                    let replies_list = data?.['comment_replies_list'] || [];
                                    replies_list.map(
                                        item => {
                                            clsThis.render_comment_item(item, {
                                                'ele_push_group': override_push_ele_group,
                                                'get_html_opts': {
                                                    action_enabled: false,
                                                    replies_enabled: false,
                                                    add_comment_enabled: false,
                                                }
                                            })
                                        }
                                    )
                                }
                            },
                            errs => fail_callback(errs),
                        )
                    }
                }
            }

            let btnShowReplies = eleItem$.find('.btn-comment-action-show-replies');
            btnShowReplies.on('click', function () {
                let counter = Number.parseInt($(this).attr('data-counter'));
                if (counter > 0) {
                    commentRepliesEle.fadeToggle({
                        duration: 'fast',
                        start: function () {
                            if (!!$(btnShowReplies).attr('data-url') === false) commentRepliesEle.empty();
                        },
                        always: function () {
                            if (commentRepliesEle.is(':visible') === true) loadData(btnShowReplies);
                        },
                    });
                }
            })

            eleItem$.find('.btn-comment-reply-new').on('click', function () {
                if (eleReplyComment.length > 0) {
                    if (urlResolved) {
                        eleReplyComment.fadeToggle('fast');
                        if (!$(this).attr('data-url')) {
                            $(this).attr('data-url', urlResolved);
                            clsThis.init_box_comment({
                                urlSubmit: urlResolved,
                                textarea: eleReplyComment.find('textarea'),
                                frmInsideAdd: eleReplyComment.find('form.frm-add-new-comment'),
                                showingMentions: eleReplyComment.find('.mentions-display'),
                                render_comment_opts: {
                                    'ele_push_group': commentRepliesEle,
                                    'get_html_opts': {
                                        action_enabled: false,
                                        replies_enabled: false,
                                        add_comment_enabled: false,
                                    },
                                },
                                render_record_showing: false,
                                rendered_scroll_top: false,
                                rendered_plus_replies_ele: eleItem$.find('.btn-comment-action-show-replies'),
                            })
                        }
                    }
                }
            })

            eleItem$.siblings('.btn-comment-load-full').on('click', function () {
                let parentEle = $(this).parent();
                if (parentEle.hasClass('comment-replies')) {
                    let eleItemParent = parentEle.closest('.comment-item');
                    let urlSelected = eleItemParent.attr('data-comment-id');
                    let eleRepliesParent = eleItemParent.find('.comment-replies');
                    if (urlSelected && eleRepliesParent.length > 0) {
                        loadData(btnShowReplies, {
                            override_url: clsThis.get_url_replies(urlSelected),
                            override_push_ele_group: eleRepliesParent,
                            force_run: true,
                            success_callback: function () {
                                $(this).remove();
                                eleRepliesParent.empty();
                            },
                        });
                    }
                } else if (parentEle.hasClass('comment-list')) {
                    clsThis.fetch_all({}, {
                        success_callback: function () {
                            $(this).remove();
                            parentEle.empty();
                        },
                    });
                } else {
                    throw Error('Outside parent of Full Button');
                }
            })
        }

        ListeningEventController.listenImageLoad(
            eleItem$.find('img'),
            {'imgReplace': globeAvatarNotFoundImg},
        );
        if (clsThis.owner_id) eleItem$.find(`[data-mention-id="${clsThis.owner_id}"]`).addClass('mentions-is-me');
    }

    item_get_html(kwargs, opts = {}) {
        let clsThis = this;
        let {
            action_enabled,
            replies_enabled,
            mentions_enabled,
            add_comment_enabled,
            btn_full_enabled,
        } = {
            mentions_enabled: true,
            action_enabled: true,
            replies_enabled: true,
            add_comment_enabled: true,
            btn_full_enabled: false,
            ...opts,
        }

        // mentions
        function getFullHTMLMentionsPerson(_mentions, _mentions_data) {
            let htmlMentionsFullPerson = [];
            if (
                _mentions && typeof _mentions === 'object' && typeof Array.isArray(_mentions)
                && _mentions_data && typeof _mentions_data === 'object'
            ) {
                _mentions.map(
                    (item) => {
                        if (item) {
                            let _data_tmp = _mentions_data?.[item] || {};
                            if (_data_tmp) {
                                htmlMentionsFullPerson.push(
                                    `<a href="${clsThis.url_employee_detail.replace('__pk__', item)}" target="_blank">
                                        <img src="${_data_tmp?.['avatar_img'] || clsThis.default_person_avt}" 
                                        alt="${_data_tmp?.['full_name'] || ''}" class="mr-1" data-bs-toggle="tooltip" 
                                        title="${_data_tmp?.['full_name'] || ''} (${_data_tmp?.['group__title'] || ''})"/>
                                    </a>`
                                )
                            }
                        }
                    }
                )
            }
            return htmlMentionsFullPerson;
        }

        let htmlMentions = ``;
        if (mentions_enabled === true) {
            let htmlMentionsGot = getFullHTMLMentionsPerson(kwargs?.['mentions'] || [], kwargs?.['mentions_data'] || {});
            if (htmlMentionsGot.length > 0) {
                htmlMentions = `
                <div class="comment-mentions">
                    ${htmlMentionsGot.join("")}
                    <small>${clsThis.ele$.attr('data-msg-been-mentioned')}</small>
                </div>
                `;
            }
        }

        // latest reply datetime
        function getHTMLLatestReplyDatetime() {
            let replies_latest = kwargs['replies_latest'] || null;
            let relateTime = $x.fn.displayRelativeTime(replies_latest, {
                'callback': function (data) {
                    return `${data.relate} (${data.output})`
                }
            })
            return replies_latest ? `<small class="d-flex align-items-center">${clsThis.ele$.attr('data-msg-latest')}: ${relateTime} </small>` : ``;
        }

        // action
        function getFullPersonReplied() {
            let replies_persons = kwargs?.['replies_persons'] || {};
            if (replies_persons && typeof replies_persons === 'object') {
                return Object.keys(replies_persons).map(
                    (idx) => {
                        let dataOfIdx = replies_persons[idx];
                        return `
                            <a href="${clsThis.url_employee_detail.replace('__pk__', idx)}" target="_blank">
                                <img
                                    src="${dataOfIdx?.['avatar_img'] || clsThis.default_person_avt}" 
                                    alt="${dataOfIdx?.['full_name'] || ''}"
                                    class="avatar-img mr-1"
                                    data-bs-toggle="tooltip"
                                    title="${dataOfIdx?.full_name || ''}  (${dataOfIdx?.['group__title'] || ''}"
                                >
                            </a>
                        `
                    }
                ).join("")
            }
            return ``;
        }

        let htmlAction = action_enabled === true ? `
            <div class="d-flex comment-action">
                <small class="btn-comment-action btn-comment-reply-new">${clsThis.ele$.attr('data-msg-more-reply')}</small>
                <small 
                    class="btn-comment-action d-flex align-items-center"
                >
                    <span class="mr-2 btn-comment-action-show-replies" data-counter="${kwargs?.['children_count'] || 0}">
                        <span class="comment-num-counter">${kwargs?.['children_count'] || 0}</span> ${clsThis.ele$.attr('data-msg-more-replies')}
                    </span>
                    ${getFullPersonReplied()}
                </small>
                ${getHTMLLatestReplyDatetime()}
            </div>
        ` : '';

        // replies
        let htmlReplies = replies_enabled === true ? `
            <div class="comment-replies mx-5" style="display: none; width: calc(96% - 2rem);"></div>
        ` : ``;

        // add new
        let htmlAddNew = add_comment_enabled === true ? `
            <div class="comment-reply-new mx-5 mt-2" style="display: none; width: calc(96% - 2rem);">
                <p class="mentions-display" style="display: none;"></p>
                <textarea></textarea>
                <form class="frm-add-new-comment" data-method="POST">
                    <input type="text" class="d-none" name="mentions" value="{}"/>
                    <button class="w-100 btn btn-primary btn-square btn-add-new-comment" type="submit">${$.fn.transEle.attr('data-add')}</button>
                </form>
            </div>
        ` : ``;

        // date created
        function getHTMLDateCreated() {
            return `
                <small class="px-2">-</small>
                <small class="mr-1">${kwargs?.['date_relative'] || ''}</small>
                <small class="mr-1">(${kwargs?.date_output || ''})</small>
            `
        }

        // btn load full
        function getHTMLBtnLoadFull() {
            return btn_full_enabled === true ? `<button class="btn btn-xs btn-primary my-1 btn-comment-load-full">${clsThis.ele$.attr('data-msg-full')}</button>` : ``;
        }

        return `
            <div 
                class="w-100 min-h-50p comment-item p-2"
                data-comment-id="${kwargs['id']}"
            >
                <div class="w-100 min-h-15p d-flex align-items-center">
                    <span class="icon-collapse" style="max-width: 1.2rem; cursor: pointer">
                        <i class="fa-solid fa-xs fa-chevron-right mr-3 ml-1 d-none"></i>
                        <i class="fa-solid fa-xs fa-chevron-up mr-3 ml-1"></i>
                    </span>
                    <img
                        src="${kwargs?.['avatar_img'] || clsThis.default_person_avt}" 
                        alt="${kwargs?.employee_created?.full_name || ''}"
                        style="width: 2rem;object-fit: contain;"
                        class="mr-1"
                    >
                    <a href="${clsThis.url_employee_detail.replace('__pk__', kwargs?.employee_created?.id)}" target="_blank">
                        <b class="mr-1">${kwargs?.employee_created?.full_name || ''}</b>
                    </a>
                    ${getHTMLDateCreated()}
                </div>
                <div class="w-100 min-h-35p pt-3 pb-1 comment-content">
                    ${kwargs?.contents || ''}
                </div>
                ${htmlMentions}
                ${htmlAction}
                ${htmlAddNew}
                ${htmlReplies}
            </div>
            ${getHTMLBtnLoadFull()}
        `;
    }

    init_box_comment(opts) {
        let clsThis = this;
        let {
            urlSubmit,
            textarea,
            frmInsideAdd,
            showingMentions,
            render_comment_opts,
            render_record_showing,
            rendered_scroll_top,
            rendered_plus_replies_ele,
        } = {
            urlSubmit: null,
            textarea: this.ele_add.find('textarea'),
            frmInsideAdd: this.ele_add.find('form.frm-add-new-comment'),
            showingMentions: this.ele_add.find('.mentions-display'),
            render_comment_opts: {},
            render_record_showing: true,
            rendered_scroll_top: true,
            rendered_plus_replies_ele: null,
            ...opts
        }
        let inputMentions = frmInsideAdd.find('input[name="mentions"]');

        function setupDisplayMentionsInEditor(item) {
            return `
                <a 
                    href="${clsThis.url_employee_detail.replace('__pk__', item.id)}" 
                    target="_blank"
                >@${item.full_name}</a>
            `;
        }

        function setupDisplayMentionsInSummary(item) {
            return $(`
                <span class="mentions-display-txt">
                    <a 
                        href="${clsThis.url_employee_detail.replace('__pk__', item.id)}" 
                        target="_blank"
                    >
                        ${item.full_name} 
                        <small>(${item.group_title})</small>
                    </a>
                </span>
            `)
        }

        let tinymceEditor = null;

        textarea.tinymce({
            branding: false,
            readonly: 0,
            menubar: false,
            height: 120,
            plugins: 'advlist autolink lists insertdatetime hr emoticons table mention link media image preview tabfocus visualchars visualblocks wordcount',
            toolbar: 'styleselect | bold italic strikethrough | forecolor backcolor | numlist bullist table | link image media emoticons | formatting',
            pagebreak_split_block: true,
            pagebreak_separator: '<span class="page-break-here"><!-- my page break --></span>',
            toolbar_groups: {
                formatting: {
                    icon: 'more-drawer',
                    tooltip: 'My group of buttons',
                    items: 'outdent indent hr insertdatetime | visualblocks visualchars wordcount removeformat | preview'
                }
            },
            insertdatetime_formats: ['%d-%m-%Y %H:%M:%S', '%d-%m-%Y', '%H:%M:%S', '%I:%M:%S %p'],
            content_css: clsThis.ele$.attr('data-css-url-render'),
            content_style: `
                @import url(\'//fonts.googleapis.com/css?family=Google+Sans:400,500|Roboto:400,400italic,500,500italic,700,700italic|Roboto+Mono:400,500,700&amp;display=swap\');
                body { font-family:"Google Sans", "Roboto", "Roboto Mono", sans-serif; font-size: 14px; }
            `,
            mentions: {
                queryBy: 'email',
                items: 10,
                source: function (query, process, delimiter) {
                    // Do your ajax call
                    // When using multiple delimiters you can alter the query depending on the delimiter used
                    if (delimiter === '@') {
                        let params = $.param(
                            {
                                'page': 1,
                                'pageSize': 10,
                                'ordering': 'first_name',
                                ...(
                                    query ? {'search': query} : {}
                                )
                            }
                        )
                        $.fn.callAjax2({
                            url: clsThis.ele$.attr('data-mentions') + '?' + params,
                            cache: true,
                        }).then(
                            (resp) => {
                                let data = $.fn.switcherResp(resp);
                                if (data) {
                                    let resource = (data?.['employee_list'] || []).map(
                                        (item) => {
                                            if (!item.avatar_img) item.avatar_img = clsThis.default_person_avt;
                                            return UtilControl.flattenObject(item);
                                        }
                                    )
                                    process(resource);
                                }
                            },
                            (errs) => console.log(errs),
                        )
                    }
                },
                insert: function (item) {
                    return `<span 
                        class="mention-person"
                        data-mention="true"
                        data-mention-id="${item.id}" 
                        data-mention-email="${item.email}"
                        data-mention-full-name="${item.full_name}" 
                        data-mention-code="${item.code}" 
                        data-group-title="${item?.['group__title'] || ''}"
                    >${setupDisplayMentionsInEditor(item)}</span>\u200B&nbsp;`
                },
                render: function (item) {
                    return `
                        <li style="cursor: pointer;" class="d-flex align-items-center">
                            <img src="${item.avatar_img}" width="20px" alt="" class="m-3"/>
                            <div  style="display: inline-block;">
                                <div class="mention-person-item-title">
                                    <span style="color: #000038">${item.full_name}</span>
                                    <b>${item?.['group__title'] || ''}</b>
                                </div>
                            </div>
                        </li>
                    `
                    // <div><small>${item.email} - ${item.code}</small></div>
                },
                renderDropdown: function () {
                    return '<ul class="rte-autocomplete dropdown-menu mention-person-list"></ul>';
                },
                matcher: function (item) {
                    return item;
                },
            },
            setup: function (editor) {
                tinymceEditor = editor;
                editor.on('change', function () {
                    let content = editor.getContent();

                    let parser = new DOMParser();
                    let doc = parser.parseFromString(content, 'text/html');

                    let mentionsIds = [];
                    let mentionsTxt = [];
                    let mentions = doc.querySelectorAll('[data-mention="true"]');
                    Array.from(mentions).map(function (mention) {
                        let idx = mention.getAttribute('data-mention-id');
                        let email = mention.getAttribute('data-mention-email');
                        let fullName = mention.getAttribute('data-mention-full-name');
                        let code = mention.getAttribute('data-mention-code');
                        let groupTitle = mention.getAttribute('data-group-title');
                        if (mentionsIds.indexOf(idx) === -1) {
                            mentionsIds.push(idx);
                            mentionsTxt.push(setupDisplayMentionsInSummary({
                                'id': idx,
                                'email': email,
                                'full_name': fullName,
                                'code': code,
                                'group_title': groupTitle,
                            }))
                        }
                    });
                    inputMentions.val(JSON.stringify(mentionsIds));

                    //
                    showingMentions.empty()
                    if (mentionsTxt.length === 0) showingMentions.fadeOut('fast');
                    else {
                        mentionsTxt.map(
                            (item) => {
                                showingMentions.append(item);
                            }
                        )
                        showingMentions.fadeIn('fast');
                    }
                });
                editor.on('keydown', function (e) {
                    if (e.key === 'Backspace' || e.key === 'Delete') {
                        let node = editor.selection.getNode();
                        if (node.getAttribute("data-mention") === "true") {
                            e.preventDefault();
                            node.remove();
                            if (editor.getContent() === '') editor.setContent('<p>&nbsp;</p>');
                            editor.fire('change');
                        }
                    }
                });
                editor.on('init', function () {
                    // https://www.tiny.cloud/blog/tinymce-and-modal-windows/
                    // Include the following JavaScript into your tiny.init script to prevent the Bootstrap dialog from blocking focus:
                    document.addEventListener('focusin', (e) => {
                        if (e.target.closest(".tox-tinymce-aux, .moxman-window, .tam-assetmanager-root") !== null) {
                            e.stopImmediatePropagation();
                        }
                    })
                })
            },
            // config of: link
            default_link_target: '_blank',
            link_assume_external_targets: true,
            link_default_protocol: 'https',
        });

        frmInsideAdd.on('submit', function (event) {
            $(this).find('button[type=submit]').prop('disabled', true);
            event.preventDefault();

            let url = urlSubmit;
            if (!urlSubmit) {
                let doc_id = $(this).find('input[name="doc_id"]').val();
                let app_id = $(this).find('input[name="application"]').val();
                url = $(this).attr('data-url').replace('__pk_doc__', doc_id).replace('__pk_app__', app_id)
            }
            let mention_data = $(this).find('input[name="mentions"]').val();
            let data = {
                "mentions": mention_data ? JSON.parse(mention_data) : [],
                "contents": textarea.tinymce().getContent({"format": "html"}),
                "contents_txt": textarea.tinymce().getContent({"format": "text"})
                    .trim()
                    .replaceAll('\n', '. ')
                    .replaceAll('\t', ' '),
            };
            let method = $(this).attr('data-method');

            if (url && method && data) {
                $.fn.callAjax2({
                    url: url,
                    method: method,
                    data: data,
                    sweetAlertOpts: clsThis.swalOpts,
                }).then(
                    resp => {
                        let data = $.fn.switcherResp(resp);
                        if (data) {
                            // reset editor
                            textarea.tinymce().setContent('');
                            if (tinymceEditor) tinymceEditor.fire('change');

                            //
                            $.fn.notifyB({'description': $.fn.transEle.attr('data-success')}, 'success');

                            // render comment with detail API
                            clsThis.render_comment_item(data?.['comment_detail'] || {}, {'ap_or_pre': 'pre', ...render_comment_opts});

                            // increase records of all
                            if (render_record_showing === true) clsThis.render_record_showing({'plus_num': 1});

                            // scroll to top
                            if (rendered_scroll_top === true) clsThis.ele_list$.scrollTop(0);

                            // increase records of replies
                            if (rendered_plus_replies_ele) {
                                let counter = Number.parseInt(rendered_plus_replies_ele.attr('data-counter'));
                                if (counter === 0) {
                                    rendered_plus_replies_ele.attr('data-url', 'resolve-with-zero');
                                }
                                counter += 1;
                                rendered_plus_replies_ele.attr('data-counter', counter);
                                rendered_plus_replies_ele.find('.comment-num-counter').text(counter);
                            }
                        }
                        $(this).find('button[type=submit]').prop('disabled', false);
                    },
                    errs => {
                        $.fn.notifyB({
                            'description': $.fn.transEle.attr('data-fail'),
                        }, 'failure');
                        $(this).find('button[type=submit]').prop('disabled', false);
                    },
                )
            }

            return false;
        })
    }

    init_structure() {
        let clsThis = this;
        if (this.ele$.attr('data-structure-inited') !== 'true') {
            this.ele$.attr('data-structure-inited', 'true');

            function resolve_btn_goto() {
                let appIdx = clsThis.ele$.find('input[name="application"]').val();
                let docIdx = clsThis.ele$.find('input[name="doc_id"]').val();

                if (appIdx && docIdx) {
                    let appData = UrlGatewayReverse.get_app_name_pk_app(appIdx);
                    if (appData && typeof appData === 'object' && Object.keys(appData).length > 0 && UrlGatewayReverse.has_active_app(appData)) {
                        return UrlGatewayReverse.get_url_pk_app(docIdx, appIdx, {'redirect': true});
                    }
                }
                return null;
            }

            // init event collapse/expand
            let ele_this = this.ele$;
            this.ele_action_all.find('button[data-action="collapse-all"]').on('click', function () {
                ele_this.find('.icon-collapse').filter(function () {
                    return $(this).find('.fa-chevron-right').hasClass('d-none');
                }).trigger('click');
            })
            this.ele_action_all.find('button[data-action="expand-all"]').on('click', function () {
                ele_this.find('.icon-collapse').filter(function () {
                    return $(this).find('.fa-chevron-up').hasClass('d-none');
                }).trigger('click');
            })

            // goto
            let btnGoto = this.ele_action_all.find('button[data-action="goto"]');
            let urlGoto = resolve_btn_goto();
            if (urlGoto && this.btn_goto_enabled === true) {
                btnGoto.attr('data-bs-toggle', 'tooltip');
                btnGoto.attr('title', clsThis.ele$.attr('data-msg-goto-detail'));
                btnGoto.on('click', () => open(urlGoto))
            } else {
                btnGoto.prop('disabled', true).fadeOut({
                    duration: 'fast',
                    always: function () {
                        $(this).remove();
                    }
                });
            }

            // init add new comment / event click button add
            this.init_box_comment();

            // init collapse editor all
            this.ele$.find('.comment-all-collapse-editor').on('click', function () {
                clsThis.ele_add.fadeToggle('fast');
                $(this).find('.fa-solid').toggleClass('d-none');
            })
        }
    }

    render_comment_item(data, opts = {}) {
        let {
            ap_or_pre,
            effect_newest,
            ele_push_group,
            get_html_opts,
        } = {
            ap_or_pre: 'ap',
            effect_newest: true,
            ele_push_group: null,
            get_html_opts: {},
            ...opts
        }

        if (data && typeof data === 'object') {
            let dateRelateData = UtilControl.displayRelativeTime(data.date_created, {
                'callback': function (data) {
                    return {
                        'relate': data.relate,
                        'output': data.output,
                    }
                }
            })
            let kwargs = {
                'id': data?.['id'] || '',
                'avatar_img': data?.['employee_created']?.['avatar_img'] || this.default_person_avt,
                'employee_created': {
                    'id': data?.['employee_created']?.['id'] || '',
                    'full_name': data?.['employee_created']?.['full_name'] || '',
                },
                'date_relative': dateRelateData.relate,
                'date_output': dateRelateData.output,
                'contents': data.contents || '',
                'children_count': data?.['children_count'] || 0,
                'mentions': data?.['mentions'] || [],
                'mentions_data': data?.['mentions_data'] || {},
                'replies_persons': data?.['replies_persons'] || {},
                'replies_latest': data?.['replies_latest'] || null,
            }

            let html$ = $(this.item_get_html(kwargs, get_html_opts));
            if (effect_newest === true) html$.addClass('comment-item-newest');
            this.item_add_event(html$);

            let elePushTo = (
                ele_push_group ? ele_push_group : this.ele_list$
            )
            ap_or_pre === 'ap' ? elePushTo.append(html$) : elePushTo.prepend(html$);  // API sorting -date_created. render add new success
            setTimeout(
                () => html$.removeClass('comment-item-newest'),
                2000
            );
            return html$;
        }
    }

    render_btn_load_more() {
        let clsThis = this;
        let eleTotal = this.ele_action_all.find('.total-comment');
        let nextNum = eleTotal.attr('data-page-next');
        if (nextNum && nextNum > 0) {
            let btnLoadMore = $(`<button class="btn btn-xs btn-light my-3 comment-load-more">${$.fn.transEle.attr('data-msg-show-more')}</button>`);
            btnLoadMore.on('click', function () {
                $(this).remove();
                clsThis.fetch_all({
                    'page': nextNum,
                });
            })
            this.ele_list$.append(btnLoadMore);
        }
    }

    render_record_showing(opts) {
        let eleTotal = this.ele_action_all.find('.total-comment');
        let hasReloadAPI = opts?.['reloadAPI'] || false;

        function get_num(_key, _attr) {
            if (_key) {
                let _tmp = opts?.[_key];
                if (Number.isInteger(_tmp)) return _tmp;
            }
            if (_attr) {
                let _arrv = eleTotal.attr(_attr);
                if (_arrv) {
                    try {
                        return Number.parseInt(_arrv);
                    } catch (e) {
                    }
                }
            }
            return 0;
        }

        let plus_num = get_num('plus_num', null);
        let total = get_num('total', 'data-total');
        let current = get_num('current', 'data-page-current');
        let next = get_num('next', 'data-page-next');
        let loaded = get_num(null, 'data-page-loaded');

        if (plus_num > 0) {
            if (hasReloadAPI) {
                if (next === 0) loaded = total;
                else loaded += plus_num;
            } else {
                loaded += plus_num;
                total += plus_num;
            }
        }
        eleTotal.attr('data-total', total);
        eleTotal.attr('data-page-current', current);
        eleTotal.attr('data-page-next', next);

        let recordTotal = eleTotal.attr('data-total');
        let recordLoaded = next === 0 ? recordTotal : loaded;
        eleTotal.attr('data-page-loaded', recordLoaded);
        eleTotal.text(
            eleTotal.attr('data-pattern').replace("{}", `${recordLoaded}/${recordTotal}`)
        ).fadeIn('fast');
    }

    fetch_all(params = {}, opts = {}) {
        let {
            success_callback,
            fail_callback,
        } = {
            success_callback: function () {
            },
            fail_callback: function () {
            },
            ...opts
        }
        let clsThis = this;
        let url = this.ele$.attr('data-url');
        if (url) {
            url = url.replace('__pk_doc__', this.pk_doc).replace('__pk_app__', this.pk_app);
            $.fn.callAjax2({
                url: url + '?' + $.param({
                    'parent_n__isnull': true,
                    'pageSize': clsThis.pageSize,
                    'page': 1,
                    ...params,
                }),
                method: 'GET',
                isLoading: true,
                sweetAlertOpts: {'allowOutsideClick': true},
            }).then(
                (resp) => {
                    let data = $.fn.switcherResp(resp);
                    if (data && data.hasOwnProperty('comment_list')) {
                        success_callback(resp);
                        let comment_list = data.comment_list;
                        comment_list.map(
                            (item) => {
                                clsThis.render_comment_item(item);
                            }
                        );
                        let dataPage = clsThis.__current_page(data);
                        clsThis.render_record_showing({
                            'total': data.page_count,
                            'current': dataPage.current,
                            'next': dataPage.next,
                            'plus_num': clsThis.pageSize,
                            'reloadAPI': true,
                        });
                        clsThis.render_btn_load_more();
                    }
                },
                (errs) => fail_callback(errs),
            )
        } else throw Error('Comment list is not provide url');

    }

    fetch_room_of_idx(commentIdx) {
        let clsThis = this;
        if (commentIdx) {
            $.fn.callAjax2({
                url: clsThis.ele$.attr('data-url-room-reply').replaceAll('__pk__', commentIdx),
                method: 'GET',
                sweetAlertOpts: {'allowOutsideClick': true},
            }).then(
                (resp) => {
                    let data = $.fn.switcherResp(resp);
                    if (data && data.hasOwnProperty('room_data')) {
                        let room_data = data.room_data;
                        if (room_data) {
                            let siblingCount = room_data?.['siblings_count'] || 0;
                            // parent data
                            let parentData = room_data?.['parent'] || {};
                            if (parentData && typeof parentData === 'object' && Object.keys(parentData).length > 0) {
                                let eleParent = clsThis.render_comment_item(parentData, {
                                    'get_html_opts': {
                                        'btn_full_enabled': siblingCount && siblingCount > 1 ? true : false,
                                    },
                                });
                                // child data
                                if (eleParent.length > 0) {
                                    let childCount = room_data?.['children_count'] || 0;
                                    let childData = room_data?.['child'] || {};
                                    let eleRepliesOfChild = eleParent.find('.comment-replies');
                                    if (childData && typeof childData === 'object' && Object.keys(childData).length > 0 && eleRepliesOfChild.length > 0) {
                                        clsThis.render_comment_item(childData, {
                                            'ele_push_group': eleRepliesOfChild,
                                            'get_html_opts': {
                                                'action_enabled': false,
                                                'replies_enabled': false,
                                                'add_comment_enabled': false,
                                                'btn_full_enabled': childCount && childCount > 1 ? true : false,
                                            },
                                        });
                                        eleRepliesOfChild.fadeIn('fast');
                                    }
                                }
                            }
                        }
                    }
                },
                (errs) => {
                },
            )
        }
    }

    init(pk_doc, pk_app, opts = {}) {
        this.opts = {
            comment_id: null,
            ...opts
        }
        this.pk_doc = pk_doc;
        this.ele_add.find('form.frm-add-new-comment').find('input[name="doc_id"]').val(pk_doc);
        this.pk_app = pk_app;
        this.ele_add.find('form.frm-add-new-comment').find('input[name="application"]').val(pk_app);

        this.init_structure();
        this.ele_list$.empty();

        this.opts.comment_id ? this.fetch_room_of_idx(this.opts.comment_id) : this.fetch_all();
    }
}

class DiagramControl {
    static setBtnDiagram(appCode) {
        if (window.location.href.includes('/detail/') && ["saleorder.saleorder"].includes(appCode)) {
            let $btnLog = $('#btnLogShow');
            let $modalBlock = $('.idxModalData');
            let urlDiagram = globeDiagramList;
            if ($btnLog.length > 0 && $modalBlock.length > 0) {
                let htmlBtn = `<button class="btn nav-link" type="button" id="btnDiagram" data-bs-toggle="offcanvas" data-bs-target="#offcanvasDiagram" aria-controls="offcanvasExample" data-url="${urlDiagram}" data-method="GET"><span class="icon"><i class="fas fa-network-wired"></i></span></button>`;
                let htmlCanvas = `<div class="offcanvas offcanvas-end w-95" tabindex="-1" id="offcanvasDiagram" aria-labelledby="offcanvasTopLabel">
                                    <div class="modal-header">
                                        <h5><b>Diagram</b></h5>
                                        <div class="btn-group" role="group" aria-label="Button group with nested dropdown">
                                            <button type="button" class="btn btn-outline-secondary" id="btnRefreshDiagram" data-url="${urlDiagram}" data-method="GET" data-bs-toggle="tooltip" data-bs-placement="bottom" title="Reload">${$.fn.transEle.attr('data-refresh')}</button>
                                            <button type="button" class="btn btn-outline-secondary" data-bs-dismiss="offcanvas" aria-label="Close" data-bs-toggle="tooltip" data-bs-placement="bottom" title="Close">${$.fn.transEle.attr('data-close')}</button>
                                        </div>
                                    </div>
                                    <div class="offcanvas-body">
                                        <div data-simplebar class="h-800p min-w-1680p nicescroll-bar">
                                            <div class="card-group" id="flowchart_diagram"></div>
                                        </div>
                                    </div>
                                </div>`;
                $btnLog.after(htmlBtn);
                $modalBlock.after(htmlCanvas);
                // set event
                $('#btnDiagram, #btnRefreshDiagram').on('click', function () {
                    if (window.location.href.includes('/detail/')) {
                        // Split the URL by '/'
                        let parts = window.location.href.split('/');
                        let pk = DiagramControl.extractUUID(window.location.href);
                        $.fn.callAjax2({
                                'url': $(this).attr('data-url'),
                                'method': $(this).attr('data-method'),
                                'data': {'app_code': appCode, 'doc_id': pk},
                                isLoading: true,
                            }
                        ).then(
                            (resp) => {
                                let data = $.fn.switcherResp(resp);
                                if (data) {
                                    if (data.hasOwnProperty('diagram_list') && Array.isArray(data.diagram_list)) {
                                        if (data.diagram_list.length > 0) {
                                            let data_diagram = data.diagram_list[0];
                                            DiagramControl.loadDiagram(data_diagram);
                                        }
                                    }
                                }
                            }
                        )
                    }
                })
            }
        }
    };

    static loadDiagram(data_diagram) {
        let $chartDiagram = $('#flowchart_diagram');
        $chartDiagram.empty();
        let html = "";
        let sttTxt = JSON.parse($('#stt_sys').text());
        let diaTxt = JSON.parse($('#dia_app').text());
        let sttMapBadge = [
            "soft-light",
            "soft-primary",
            "soft-info",
            "soft-success",
            "soft-danger",
        ]
        // prefix
        let htmlPrefix = DiagramControl.loadPrefixSuffix(data_diagram?.['prefix'], sttTxt, diaTxt, sttMapBadge);
        // main doc
        let docData = data_diagram?.['doc_data'];
        let htmlBody = `<div class="row"><small>${$.fn.transEle.attr('data-code')}: ${docData?.['code']}</small></div>
                        <div class="row"><small>${$.fn.transEle.attr('data-quantity')}: ${docData?.['quantity']}</small></div>
                        <div class="row"><small>${$.fn.transEle.attr('data-total')}: <span class="mask-money" data-init-money="${parseFloat(docData?.['total'] ? docData?.['total'] : '0')}"></span></small></div>
                        <div class="row"><small>${$.fn.transEle.attr('data-reference')}: ${docData?.['reference'] ? docData?.['reference'] : ''}</small></div>`;
                    if (docData?.['customer_data']?.['id']) {
                        htmlBody += `<div class="row"><small>${$.fn.transEle.attr('data-customer')}: ${docData?.['customer_data']?.['title'] ? docData?.['customer_data']?.['title'] : ''}</small></div>`;
                    }
                    if (docData?.['supplier_data']?.['id']) {
                        htmlBody += `<div class="row"><small>${$.fn.transEle.attr('data-supplier')}: ${docData?.['supplier_data']?.['title'] ? docData?.['supplier_data']?.['title'] : ''}</small></div>`;
                    }
        let htmlMain = `<div class="card">
                                <div class="card-header bg-primary">
                                    <h6 class="text-white">${diaTxt[data_diagram?.['app_code']]}</h6>
                                </div>
                                <div class="card-body bg-green-light-4">
                                    <div class="card border-green clone" data-drag="1" title="card-1" id="control-1">
                                        <div class="card-header card-header-wth-text">
                                            <div>
                                                <div class="row"><small>${docData?.['title'] ? docData?.['title'] : docData?.['code']}</small></div>
                                            </div>
                                        </div>
                                        <div class="card-body">
                                            <div class="mb-5">
                                                ${htmlBody}
                                            </div>
                                        </div>
                                        <div class="card-footer text-muted d-flex justify-content-between">
                                            <small><span class="badge badge-${sttMapBadge[docData?.['system_status']]}">${sttTxt[docData?.['system_status']][1]}</span></small>
                                            <small>${moment(docData?.['date_created']).format('DD/MM/YYYY')}</small>
                                        </div>
                                    </div>
                                </div>
                            </div>`;
        // suffix
        let htmlSuffix = DiagramControl.loadPrefixSuffix(data_diagram?.['suffix'], sttTxt, diaTxt, sttMapBadge);
        // result
        html += htmlPrefix;
        html += htmlMain;
        html += htmlSuffix;
        $chartDiagram.html(html);
        // mask money
        $.fn.initMaskMoney2();
    };

    static loadPrefixSuffix(data_pre_suf, sttTxt, diaTxt, sttMapBadge) {
        let htmlPreSuffix = "";
        for (let key in data_pre_suf) {
            let htmlChild = "";
            // if (data_pre_suf[key].length > 0) {
                for (let data_record of data_pre_suf[key]) {
                    let htmlBody = `<div class="row"><small>${$.fn.transEle.attr('data-code')}: ${data_record?.['code']}</small></div>
                                    <div class="row"><small>${$.fn.transEle.attr('data-quantity')}: ${data_record?.['quantity']}</small></div>
                                    <div class="row"><small>${$.fn.transEle.attr('data-total')}: <span class="mask-money" data-init-money="${parseFloat(data_record?.['total'] ? data_record?.['total'] : '0')}"></span></small></div>
                                    <div class="row"><small>${$.fn.transEle.attr('data-reference')}: ${data_record?.['reference'] ? data_record?.['reference'] : ''}</small></div>`;
                    if (data_record?.['customer_data']?.['id']) {
                        htmlBody += `<div class="row"><small>${$.fn.transEle.attr('data-customer')}: ${data_record?.['customer_data']?.['title'] ? data_record?.['customer_data']?.['title'] : ''}</small></div>`;
                    }
                    if (data_record?.['supplier_data']?.['id']) {
                        htmlBody += `<div class="row"><small>${$.fn.transEle.attr('data-supplier')}: ${data_record?.['supplier_data']?.['title'] ? data_record?.['supplier_data']?.['title'] : ''}</small></div>`;
                    }
                    htmlChild += `<div class="card border-green clone" data-drag="1" title="card-1" id="control-1">
                                        <div class="card-header card-header-wth-text">
                                            <div>
                                                <div class="row"><small>${data_record?.['title'] ? data_record?.['title'] : data_record?.['code']}</small></div>
                                            </div>
                                        </div>
                                        <div class="card-body">
                                            <div class="mb-5">
                                                ${htmlBody}
                                            </div>
                                        </div>
                                        <div class="card-footer text-muted d-flex justify-content-between">
                                            <small><span class="badge badge-${sttMapBadge[data_record?.['system_status']]}">${sttTxt[data_record?.['system_status']][1]}</span></small>
                                            <small>${moment(data_record?.['date_created']).format('DD/MM/YYYY')}</small>
                                        </div>
                                    </div>`;
                }
                htmlPreSuffix += `<div class="card">
                                    <div class="card-header bg-primary">
                                        <h6 class="text-white">${diaTxt[key]}</h6>
                                    </div>
                                    <div class="card-body bg-grey-light-5">
                                        ${htmlChild}
                                    </div>
                                </div>`;
            // }
        }
        return htmlPreSuffix;
    };

    static extractUUID(url) {
        let regex = /\/([a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12})/;
        let match = url.match(regex);
        if (match && match[1]) {
            return match[1];
        } else {
            return null;
        }
    };
}

class DataProcessorControl {

    static sortArrayByObjectKey(array, key, isDescending = false) {
        // sort list of object, using key of object to sort
        return array.sort((a, b) => {
            if (a[key] < b[key]) return isDescending ? 1 : -1; // Flip comparison for descending
            if (a[key] > b[key]) return isDescending ? -1 : 1; // Flip comparison for descending
            return 0; // a and b are equal
        });
    }
}

class FormElementControl {

    static loadInitS2($ele, data = [], dataParams = {}, $modal = null, isClear = false, customRes = {}) {
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
                let res1 = ``;
                let res2 = ``;
                if (customRes?.['res1']) {
                    res1 = `<span class="badge badge-soft-light mr-2">${state.data?.[customRes['res1']] ? state.data?.[customRes['res1']] : "--"}</span>`;
                }
                if (customRes?.['res2']) {
                    res2 = `<span>${state.data?.[customRes['res2']] ? state.data?.[customRes['res2']] : "--"}</span>`;
                }
                return $(`<span>${res1} ${res2}</span>`);
            }
        }
        $ele.initSelect2(opts);
        return true;
    }
}

let $x = {
    cls: {
        frm: SetupFormSubmit,
        window: WindowControl,
        wf: WFRTControl,
        util: UtilControl,
        dtb: DTBControl,
        person: PersonControl,
        doc: DocumentControl,
        bastionField: BastionFieldControl,
        excelSheetJS: ExcelSheetJSController,
        excelJS: ExcelJSController,
        datetime: DateTimeControl,
        file: FileControl,
        fileStream: FileStreamControl,
        cmt: CommentControl,
    },
    fn: {
        fileInit: FileUtils.init,

        setWFRuntimeID: WFRTControl.setWFRuntimeID,

        getRowData: DTBControl.getRowData,
        deleteRow: DTBControl.deleteRow,
        updateDataRow: DTBControl.updateDataRow,
        getSelection: DTBControl.getTableSelected,

        redirectLogin: WindowControl.redirectLogin,
        redirectVerify2FA: WindowControl.redirectVerify2FA,

        showLoadingButton: WindowControl.showLoadingButton,
        hideLoadingButton: WindowControl.hideLoadingButton,
        showLoadingPage: WindowControl.showLoading,
        hideLoadingPage: WindowControl.hideLoading,
        showLoadingWaitResponse: WindowControl.showLoadingWaitResponse,
        hideLoadingWaitResponse: WindowControl.hideLoadingWaitResponse,
        showNotFound: WindowControl.showNotFound,
        showTimeOut: WindowControl.showTimeOut,

        shortNameGlobe: PersonControl.shortNameGlobe,
        renderAvatar: PersonControl.renderAvatar,
        getEmployeeCurrentID: PersonControl.getEmployeeCurrentID,
        getEmployeeCurrent: PersonControl.getEmployeeCurrent,

        renderCodeBreadcrumb: DocumentControl.renderCodeBreadcrumb,
        buttonLinkBlank: DocumentControl.buttonLinkBlank,
        closeCard: DocumentControl.closeCard,
        openCard: DocumentControl.openCard,

        parseDateTime: UtilControl.parseDateTime,
        parseDate: UtilControl.parseDate,
        parseJson: UtilControl.parseJson,
        dumpJson: UtilControl.dumpJson,
        convertToSlug: UtilControl.convertToSlug,
        flattenObject: UtilControl.flattenObject,
        flattenObjectParams: UtilControl.flattenObjectParams,
        sleep: UtilControl.sleep,
        escapeHTML: UtilControl.escapeHTML,

        randomStr: UtilControl.generateRandomString,
        checkUUID4: UtilControl.checkUUID4,
        checkNumber: UtilControl.checkNumber,

        removeEmptyValuesFromObj: UtilControl.removeEmptyValuesFromObj,
        getRandomArbitrary: UtilControl.getRandomArbitrary,
        getRandomInArray: UtilControl.getRandomInArray,
        arrayRange: UtilControl.arrayRange,
        keepExistInOther: UtilControl.keepExistInOther,
        removeExistInOther: UtilControl.removeExistInOther,
        decodeURI: UtilControl.decodeURI,
        cutMaxlength: UtilControl.cutMaxlength,

        popKey: UtilControl.popKey,
        getKey: UtilControl.getKey,

        hasOwnProperties: UtilControl.hasOwnProperties,

        displayRelativeTime: UtilControl.displayRelativeTime,

        reformatData: DateTimeControl.reformatData,
        parseToMoment: DateTimeControl.parseToMoment,
        convertDatetime: DateTimeControl.convertData,
        convertEleDate: DateTimeControl.convertEleDate,
        convertEleDatetime: DateTimeControl.convertEleDatetime,
        convertDateToMoment: DateTimeControl.convertDateToMoment,
        convertDatetimeToMoment: DateTimeControl.convertDatetimeToMoment,

        randomColor: Beautiful.randomColorClass,
        randomColorHex: Beautiful.randomColorHex,
        hexToRgb: Beautiful.hexToRgb,
        rgbToHex: Beautiful.rgbToHex,
        lightenColor: Beautiful.lightenColor,

        getHashUrl: WindowControl.getHashUrl,
        getAllParamsByKey: WindowControl.getAllParamsByKey,
        getUrlParameter: WindowControl.getUrlParameter,
        getManyUrlParameters: WindowControl.getManyUrlParameters,
        pushHashUrl: WindowControl.pushHashUrl,
        scrollToIdx: WindowControl.scrollToIdx,
        findGetParameter: WindowControl.findGetParameter,
        getPropertiesValue: WindowControl.getPropertiesValue,
        scrollToCus: WindowControl.scrollToCus,

        numberWithCommas: DocumentControl.numberWithCommas,
    },
    opts: {
        tinymce_extends: function (opts) {
            let config = {
                ...$x.opts.tinymce,
                ...opts,
                content_style: $x.opts.tinymce.content_style + (opts?.['content_style'] || ''),
                setup: function (editor) {
                    $x.opts.tinymce.setup(editor);
                    let funcSetup = opts?.['setup'] || null;
                    if (funcSetup && funcSetup instanceof Function) funcSetup(editor);
                },
                init_instance_callback: function (editor) {
                    $x.opts.tinymce.init_instance_callback(editor);
                    let funcSetup = opts?.['init_instance_callback'] || null;
                    if (funcSetup && funcSetup instanceof Function) funcSetup(editor);
                },
                mentions: {
                    ...$x.opts.tinymce.mentions,
                    ...opts.mentions,
                },
            };

            let removeToolbar = opts?.['removeToolbar'] || [];
            if (removeToolbar && Array.isArray(removeToolbar)) {
                removeToolbar.map(
                    (item) => {
                        config['toolbar'] = config['toolbar'].replaceAll(item, '');
                        config['quickbars_insert_toolbar'] = config['quickbars_insert_toolbar'].replaceAll(item, '');
                    }
                )
            }
            let removePlugin = opts?.['removePlugin'] || [];
            if (removePlugin && Array.isArray(removePlugin)) {
                removePlugin.map(
                    (item) => {
                        config['plugins'] = config['plugins'].replaceAll(item, '')
                    }
                )
            }

            return config;
        },
        tinymce: {
            branding: false,
            readonly: 0,
            convert_urls: false,  // keep path url real, don't convert to short if same domain
            menubar: false,
            height: 320,
            // plugins: 'quickbars columns advlist autolink lists insertdatetime hr emoticons table mention link media image preview tabfocus visualchars visualblocks wordcount pagebreak print preview',
            // toolbar: 'undo redo | styleselect | bold italic strikethrough sizeselect fontselect fontsizeselect | centerHeight centerWidth | forecolor backcolor | numlist bullist table twoColumn threeColumn | pagebreak preview print | link image media emoticons | outdent indent hr insertdatetime | visualblocks visualchars wordcount removeformat',
            plugins: 'columns mention print preview paste importcss searchreplace autolink autosave save directionality code visualblocks visualchars fullscreen image link media template codesample table charmap hr pagebreak nonbreaking anchor toc insertdatetime advlist lists wordcount imagetools textpattern noneditable help charmap quickbars emoticons',
            toolbar: 'bold italic underline strikethrough | fontselect fontsizeselect formatselect | alignleft aligncenter alignright alignjustify | outdent indent |  numlist bullist table twoColumn threeColumn removeColumnsSplit cleanColumnItem | forecolor backcolor removeformat removeSelectionEle | image template link hr pagebreak| preview print visualblocks | rarely_used',
            quickbars_insert_toolbar: 'link image | numlist bullist table twoColumn threeColumn | hr pagebreak | removeSelectionEle',
            toolbar_groups: {
                rarely_used: {
                    icon: 'more-drawer',
                    tooltip: 'Rarely Used',
                    items: 'ltr rtl | charmap emoticons | superscript subscript | nonbreaking anchor media | undo redo | '
                }
            },
            fontsize_formats: "8px 9px 10px 11px 12px 14px 16px 18px 20px 22px 24px 26px 28px 36px 48px 72px",
            pagebreak_split_block: true,
            pagebreak_separator: '<span class="page-break-here"><!-- my page break --></span>',
            nonbreaking_force_tab: true,
            insertdatetime_formats: ['%d-%m-%Y %H:%M:%S', '%d-%m-%Y', '%H:%M:%S', '%I:%M:%S %p'],
            content_css: '/static/comment/css/style.css',
            content_style: `
                body { font-family: Arial, Helvetica, "Times New Roman", Times, serif, sans-serif; font-size: 11px; }
                table tr { vertical-align: top; }
                @media print {
                    .mce-visual-caret {
                        display: none;
                    }
                }
                .params-data {
                    padding: 3px;
                    background-color: #f1f1f1;
                }
            `,
            mentions__get_url: function (url, params, query) {
                return url + '?' + $.param(
                    {
                        ...params,
                        ...(query ? {'search': query} : {})
                    }
                );
            },
            mentions: {
                queryBy: 'code',
                items: 10,
                delimiter: '#',
                source: function (query, process, delimiter) {
                    // Do your ajax call
                    // When using multiple delimiters you can alter the query depending on the delimiter used
                    // if (delimiter === '#') {
                    //     let params = $.param(
                    //         $.extend(
                    //             {
                    //                 'page': 1,
                    //                 'pageSize': 10,
                    //                 'ordering': 'title',
                    //                 // 'application': application_id,
                    //                 // 'application__in': `${application_id},ba2ef9f1-63f4-4cfb-ae2f-9dee6a56da68`,
                    //             },
                    //             (query ? {'search': query} : {})
                    //         )
                    //     )
                    //     $.fn.callAjax2({
                    //         url: textarea$.attr('data-mentions') + '?' + params,
                    //         cache: true,
                    //     }).then(
                    //         (resp) => {
                    //             let data = $.fn.switcherResp(resp);
                    //             if (data) {
                    //                 let resource = (data?.['application_property_list'] || []).map(
                    //                     (item) => {
                    //                         return UtilControl.flattenObject(item)
                    //                     }
                    //                 )
                    //                 process(resource);
                    //             }
                    //         },
                    //         (errs) => $.fn.switcherResp(errs),
                    //     )
                    // }
                    process([]);
                },
                // zero with space: \u200B&nbsp; or \u200B
                insert: item => `<span id="idx-${$x.fn.randomStr(16)}" class="params-data" data-code="${item.code}">#${item.title}</span>\u200B`,
                render: item => `<li style="cursor: pointer;" class="d-flex align-items-center"><span>${item.title}</span></li>`,
                renderDropdown: () => '<ul class="rte-autocomplete dropdown-menu mention-person-list"></ul>',
                matcher: item => item,
            },
            setup: function (editor) {
                editor.on('keydown', function (e) {
                    if (e.key === 'Backspace' || e.key === 'Delete') {
                        let node = editor.selection.getNode();

                        if (node.classList.contains('params-data') && node.getAttribute('data-code')) {
                            e.preventDefault();
                            node.remove();
                            if (editor.getContent() === '') editor.setContent('<p>&nbsp;</p>');
                            editor.fire('change');
                        }
                    }
                });
                editor.on('init', function () {
                    // https://www.tiny.cloud/blog/tinymce-and-modal-windows/
                    // Include the following JavaScript into your tiny.init script to prevent the Bootstrap dialog from blocking focus:
                    document.addEventListener('focusin', (e) => {
                        if (e.target.closest(".tox-tinymce-aux, .moxman-window, .tam-assetmanager-root") !== null) {
                            e.stopImmediatePropagation();
                        }
                    })
                })
            },
            default_link_target: '_blank',
            link_assume_external_targets: true,
            link_default_protocol: 'https',
            init_instance_callback: function (editor) {
                let bookmark;
                editor.on('BeforeExecCommand', function (e) {
                    if (e.command === 'mcePrint') {
                        bookmark = editor.selection.getBookmark();
                        editor.selection.setCursorLocation(editor.dom.select('div')[0]);
                    }
                });
                editor.on('ExecCommand', function (e) {
                    if (e.command === 'mcePrint') {
                        editor.selection.moveToBookmark(bookmark);
                    }
                });
            },
        }
    }
}


String.format = function () {
    // String.format("{0} : {1}", "Fullname", "Nguyen Van A") => "Fullname : Nguyen Van A"
    let s = arguments[0];
    for (let i = 0; i < arguments.length - 1; i++) {
        let reg = new RegExp("\\{" + i + "\\}", "gm");
        s = s.replace(reg, arguments[i + 1]);
    }
    return s;
}
String.format_by_key = function () {
    let s = arguments[0];
    let objKey = arguments[1];
    Object.keys(objKey).forEach(function (key) {
        s = s.replace(new RegExp("\\{" + key + "\\}", "gm"), objKey[key]);
    });
    return s;
}

String.prototype.format_by_idx = function () {
    // argument of function start 0+ for fill to this
    // `<a href="{0}">{1}</a>`.format("http://...", "Tag a")
    // Return ==> `<a href="http://...">Tag A</a>`
    let s = this.toString();
    return s.replace(/\{(\d)\}/gm, (match, index) => arguments[index]);
}

String.prototype.format_url_with_uuid = function (uuid) {
    let s = this.toString();
    let reg = new RegExp(/([0-9])$/, "gm");
    s = s.replace(reg, uuid);
    return s;
}

String.prototype.format_by_key = function (objKey) {
    // objKey: Object Key-Value fill to this
    // `<a href="{href}">{title}</a>`.format_by_key({"href": "http://...", "title": "Tag A"})
    // Return ==> `<a href="http://...">Tag A</a>`
    let s = this.toString();
    Object.keys(objKey).forEach(function (key) {
        s = s.replace(new RegExp("\\{" + key + "\\}", "gm"), objKey[key]);
    });
    return s;
}

// return boolean value
// accept to type string with dashes and without dashes
String.prototype.valid_uuid4 = function () {
    let isCheck = this.toString()
    if (this.toString().indexOf('-') === -1) {
        isCheck = this.toString().replace(/(.{8})(.{4})(.{4})(.{4})(.{12})/g, '$1-$2-$3-$4-$5')
    }
    return /^[0-9a-f]{8}-([0-9a-f]{4}-){3}[0-9a-f]{12}$/i.test(isCheck);
}

// Array.prototype.convert_to_key = function (key = 'id') {
//     if (Array.isArray(this)) {
//         let objData = {};
//         this.map((item) => {
//             objData[item[key]] = item
//         })
//         return objData;
//     }
//     return {};
// }

// -- Array Customize}
/**
 * common function for DataTable action
 */
var DataTableAction = {
    'delete': function (url, crf, row) {
        let div = jQuery('<div>');
        let $content = '<div class="modal-dialog modal-dialog-centered"><div class="modal-content">' +
            `<div class="modal-header"><h5 class="modal-title">${$.fn.gettext('Delete Item')}</h5></div>` +
            `<div class="modal-body"><p class="text-center">${$.fn.gettext('Do you really want to delete this item')}</p></div>` +
            '<div class="modal-footer justify-content-between">' +
            `<button type="button" class="btn btn-primary" data-type="confirm">${$.fn.gettext('Confirm')}</button>` +
            `<button type="reset" class="btn btn-outline-primary" data-type="cancel">${$.fn.gettext('Cancel')}` +
            '</button></div></div></div>';
        div.addClass('modal fade')
        div.html($content)
        div.appendTo('body');
        div.modal('show');
        div.find('.btn').off().on('click', function () {
            if ($(this).attr('data-type') === 'cancel') div.remove(); else {
                $.fn.callAjax2({
                    url: url,
                    method: 'DELETE',
                }).then((res) => {
                    if (res.hasOwnProperty('status')) {
                        div.modal('hide');
                        div.remove();
                        if ($(row).length) $(row).closest('.table').DataTable().rows(row).remove().draw();
                        $.fn.notifyB({
                            description: res?.data?.message ? res.data.message : 'Delete item successfully'
                        }, 'success')
                    }
                });
            }
        })
    },
    'status': function (stt) {
        let html = '';
        const $baseTrans = $.fn.transEle
        const listSys = {
            '0': $baseTrans.attr('data-draft'),
            '1': $baseTrans.attr('data-created'),
            '2': $baseTrans.attr('data-added'),
            '3': $baseTrans.attr('data-finish'),
            '4': $baseTrans.attr('data-cancel'),
        }
        html = `<span>${listSys[stt]}</span>`
        return html
    },
    'item_view': function (data, link, format = null) {
        const $elmTrans = $.fn.transEle;
        let keyArg = [
            {
                name: $elmTrans.attr('data-title'),
                value: 'title'
            }, {
                name: $elmTrans.attr('data-code'),
                value: 'code'
            },
        ];
        // if (format) keyArg = JSON.parse(format.replace(/'/g, '"'));
        if (format) keyArg = format;

        let htmlContent = `<h6 class="dropdown-header header-wth-bg">${$elmTrans.attr('data-more-info')}</h6>`;
        for (let key of keyArg) {
            let isValue = data[key.value] ? data[key.value] : '--'
            const keyParts = key.value.split('.')
            if (keyParts.length >= 2) {
                const temp = data[keyParts[0]]?.[keyParts[1]]
                if (temp) isValue = temp
                else isValue = '--'
            }
            if ($.type(isValue) === "object") isValue = '--'
            htmlContent += `<div class="mb-1"><h6><i>${key.name}</i></h6><p>${isValue}</p></div>`;
        }
        if (link) {
            link = link.format_url_with_uuid(data['id']);
            htmlContent += `<div class="dropdown-divider"></div><div class="text-right">
            <a href="${link}" target="_blank" class="link-primary underline_hover">
                <span>${$elmTrans.attr('data-view-detail')}</span>
                <span class="icon ml-1">
                    <i class="bi bi-arrow-right-circle-fill"></i>
                </span>
            </a></div>`;
        }
        return htmlContent
    }
}
