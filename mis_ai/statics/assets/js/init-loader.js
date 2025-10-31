
let globeWFRuntimeID = null;
let globeIDLastSubmit = null;
let globeEleLastSubmit = null;

$.fn.extend({
    transEle: $('#base-trans-factory'),
    isDebug: function () {
        return $.fn.parseBoolean(globeIsDebug, false)
    },
    getClass: function (regex){
        let clsThis = this;
        const regexObj = new RegExp(regex);
        let matches = [];
        clsThis.each(function (index, item) {
            item.className.split(" ").map(
                (item) => {
                    let state = regexObj.exec(item);
                    if (Array.isArray(state) && state.length > 0){
                        matches.push(item);
                    }
                }
            )
        });
        return matches;
    },
    alterClass: function (removals, additions) {
        // https://stackoverflow.com/a/8680251/13048590
        // https://gist.github.com/peteboere/1517285
        let self = this;
        if (removals.indexOf('*') === -1) {
            // Use native jQuery methods if there is no wildcard matching
            self.removeClass(removals);
            return !additions ? self : self.addClass(additions);
        }
        let patt = new RegExp('\\s' + removals.replace(/\*/g, '[A-Za-z0-9-_]+').split(' ').join('\\s|\\s') + '\\s', 'g');
        self.each(function (i, it) {
            let cn = ' ' + it.className + ' ';
            while (patt.test(cn)) {
                cn = cn.replace(patt, ' ');
            }
            it.className = $.trim(cn);
        });

        return !additions ? self : self.addClass(additions);
    },
    isBoolean(value) {
        return typeof value === 'boolean';
    },
    getPkDetail: function () {
        return globePK;
    },
    hasOwnProperties: function (objData, keys) {
        if (objData && typeof objData === 'object' && Array.isArray(keys)) {
            for (let i = 0; i < keys.length; i++) {
                if (!objData.hasOwnProperty(keys[i])) {
                    return false;
                }
            }
            return true;
        }
        return false;
    },
    shortName: function (name, defaultReturn = '', length = 2) {
        if (name) {
            let rs = name.split(" ").map((item) => {
                return item ? item.charAt(0) : ""
            }).join("");
            if (rs.length > length) return rs.slice(0, length);
            return rs;
        }
        return defaultReturn;
    },
    parseBoolean: function (value, no_value_is_false = false, defaultReturn = null) {
        if (typeof value === 'boolean') return value;
        if (typeof value === "string") {
            value = value.trim();
            if (value === 1 || value === '1' || value === 'true' || value === 'True') return true;
            if (value === 0 || value === '0' || value === 'false' || value === 'False') return false;
        }

        if (!value && no_value_is_false === true) return false;
        return null;
    },
    dateRangePickerDefault: function (opts, funcCallback) {
        let optsAfter = {
            singleDatePicker: true,
            timePicker: true,
            startDate: moment().startOf('hour'),
            showDropdowns: true,
            minYear: 1901,
            cancelClass: "btn-secondary",
            autoApply: false,
            autoUpdateInput: false,
            ...opts,
            locale: {
                "applyLabel": $.fn.transEle.attr('data-apply'),
                "cancelLabel": $.fn.transEle.attr('data-cancel'),
                "customRangeLabel": $.fn.transEle.attr('data-custom-range'),
                "format": 'YYYY-MM-DD hh:mm:ss',
                ...(opts?.['locale'] || {}),
            },
        }

        let currentFormat = optsAfter.locale?.['format'] || 'YYYY-MM-DD hh:mm:ss';
        $(this)
            .attr('data-locale-format', currentFormat)
            .on('apply.daterangepicker', function (ev, picker){
                if (picker.startDate) $(this).val(picker.startDate.format(currentFormat));
                else $(this).val("");
            })
            .on('cancel.daterangepicker', function (ev, picker){
                $(this).val("");
            })
        return $(this).daterangepicker(optsAfter, funcCallback ? funcCallback: function (start, end, label){});
    },
    notifyB: function (option, typeAlert = null, alertConfig={}) {
        setTimeout(function () {
            $('.alert.alert-dismissible .close').addClass('btn-close').removeClass('close');
        }, option.timeout || 100);

        let data = {
            title: option.title || '',
            message: '',
            placement: {
                from: "top",
                align: "right"
            },
        };
        if (option.description) {
            let msg = "";
            let des_tmp = '';
            if (typeof option.description === 'string') {
                des_tmp = option.description;
            } else if (Array.isArray(option.description)) {
                des_tmp = option.description.join(", ");
            } else if (typeof option.description === 'object') {
                let des_tmp_arr = [];
                for (const [_key, value] of Object.entries(option.description)) {
                    des_tmp_arr.push(value);
                }
                des_tmp = des_tmp_arr.join(", ");
            } else {
                des_tmp = option.description.toString();
            }
            if (msg) {
                msg += ": " + des_tmp;
            } else {
                msg = des_tmp;
            }
            data['message'] = msg;
        }
        let prefixType = `dismissible alert-`  // `` | `dismissible alert-inv alert-inv-`
        let alert_config = {
            animate: {
                enter: 'animated lightSpeedIn',
                exit: 'animated lightSpeedOut'
            },
            type: prefixType + "primary",
            allow_dismiss: true,
            z_index: 2147483647, /* Maximum index */
            delay: 2500,
            ...alertConfig
        }
        switch (typeAlert.trim()) {
            case 'success':
                alert_config['type'] = prefixType + "success";
                data['icon'] = 'bi bi-check2-circle';
                break
            case 'failure':
                alert_config['type'] = prefixType + "danger";
                data['icon'] = 'bi bi-info-circle-fill';
                break
            case 'warning':
                alert_config['type'] = prefixType + "warning";
                data['icon'] = 'bi bi-info-circle-fill';
                break
            case 'info':
                alert_config['type'] = prefixType + "info";
                data['icon'] = 'bi bi-info-circle-fill';
                break
            case 'alert':
                alert_config['type'] = prefixType + "primary";
                data['icon'] = 'bi bi-bell-fill';
                break
        }
        $.notify(data, alert_config);
    },
    valCurrency: function (returnType = null) { // returnType choice in ['string', 'number']
        if (!returnType) returnType = $(this).attr('data-return-type');
        let result = $(this).attr('value'); // don't change attr('value') to .val() !!!!
        if (!result) result = '0';
        switch (returnType) {
            case 'string':
                result = result.toString();
                break
            case 'number':
                result = parseFloat(result);
                break
            default:
                break
        }
        return result;
    },
    initMaskMoney2: function ($eleSelected = null, selectType = null) {
        // $eleSelected && selectType are required when apply Mask-Money for concrete element.
        // ELSE: apply all element have 'input.mask-money' & 'span.mask-money'
        let inputElement = $(document).find('input.mask-money');
        let spanElement = $(document).find('span.mask-money');
        if (inputElement.length > 0 || spanElement.length > 0) {
            DocumentControl.getCompanyCurrencyConfig().then((configData) => {
                let clsMaskMoney2 = new MaskMoney2(configData);
                if ($eleSelected && selectType) {
                    if ($eleSelected.hasClass('mask-money')) {
                        if ($eleSelected.is('input')) {
                            clsMaskMoney2.applyMaskMoney($($eleSelected), 'input');
                        }
                        if ($eleSelected.is('span')) {
                            clsMaskMoney2.applyMaskMoney($($eleSelected), 'display');
                        }
                    }
                } else {
                    inputElement.map((idx, item) => {
                        clsMaskMoney2.applyMaskMoney($(item), 'input');
                    });
                    spanElement.map((idx, item) => {
                        clsMaskMoney2.applyMaskMoney($(item), 'display');
                    });
                }
            });
        }
    },
    switcherResp: function (resp, opts={}) {
        opts = {
            // config
            'isNotify': true,
            'notifyOpts': {},  // 'notifyOpts': { 'keyNotMatch': '', 'replaceKey': {}, 'isShowKey': true}
            'swalOpts': {},  // 'swalOpts': {'allowOutsideClick': true},

            // callback status
            '200': (respData, configData) => respData.data,
            '201': (respData, configData) => respData.data,
            '204': (respData, configData) => {
                if (configData.isNotify === true){
                    $.fn.notifyB({'description': $.fn.transEle.attr('data-success')}, 'success');
                }
                return {'status': 204}
            },
            '400': (respData, configData) => {
                let mess = respData.data;
                if (respData.data.hasOwnProperty('errors')) {
                    mess = respData.data.errors;
                }
                if (configData.isNotify === true){
                    UtilControl.notifyErrors(mess, configData.notifyOpts);
                }
                return {};
            },
            '401': (respData, configData) => {
                const auth_error_code = respData?.['auth_error_code'];
                if (auth_error_code === "authentication_2fa_failed"){
                    WindowControl.showUnauthenticated({
                        ...configData.swalOpts,
                        title: $.fn.gettext('2FA verification request process'),
                        confirmButtonText: $.fn.gettext('2FA verification page'),
                        'redirect_url': () => $x.fn.redirectVerify2FA(),
                    },true);
                } else {
                    WindowControl.showUnauthenticated(configData.swalOpts,true);
                }
                return {};
            },
            '403': (respData, configData) => {
                WindowControl.showForbidden(configData.swalOpts);
                return {};
            },
            '404': (respData, configData) => {
                WindowControl.showNotFound(configData.swalOpts);
                return {};
            },
            '429': (respData, configData) => {
                const html = $.fn.gettext("Expected available in {time_sec} seconds").replaceAll("{time_sec}", '<b class="status-code-429">' + respData?.['retry_time'] || $.fn.gettext("a few") + '</b>');
                let timerInterval;
                WindowControl.showTimeOut({
                    ...configData.swalOpts,
                    timer: respData?.['retry_time'] || 60 * 1000,
                    title: $.fn.gettext("Request was throttled"),
                    html: html,
                    timerProgressBar: true,
                    checkVisible: function (){
                        if (Swal.isVisible()) {
                            const eleTmp$ = $(Swal.getHtmlContainer());
                            if (eleTmp$.find('b.status-code-429').length === 0){
                                // force close when another showing
                                Swal.close();
                            } else {
                                // keep show 429
                                return false;
                            }
                        }
                        return true;
                    },
                    didOpen: function (){
                        const timer = Swal.getPopup().querySelector("b");
                        timerInterval = setInterval(() => {
                          timer.textContent = `${(Swal.getTimerLeft() / 1000).toFixed(1)}`;
                        }, 100);
                    },
                    willClose: () => {
                        clearInterval(timerInterval);
                    },
                    allowOutsideClick: false,
                    callback: function (){},
                })
            },
            '500': (respData, configData) => {
                WindowControl.showSVErrors(configData.swalOpts);
                return {};
            },
            'default': (respData, configData) => {
                return {};
            },

            ...opts,
        }

        if (typeof resp === 'object') {
            let status = 500;
            if (resp.hasOwnProperty('status')) status = resp.status;
            switch (status) {
                case 200:
                    return opts['200'](resp, opts);
                case 201:
                    return opts['201'](resp, opts);
                case 204:
                    return opts['204'](resp, opts);
                case 400:
                    return opts['400'](resp, opts);
                case 401:
                    return opts['401'](resp, opts);
                case 403:
                    return opts['403'](resp, opts);
                case 404:
                    return opts['404'](resp, opts);
                case 429:
                    return opts['429'](resp, opts);
                case 500:
                    return opts['500'](resp, opts);
                default:
                    return opts['default'](resp, opts);
            }
        }
    },
    redirectUrl: function (redirectPath, timeout = 0, params = '') {
        setTimeout(() => {
            if (params && (params !== '' && params !== undefined)) {
                window.location.href = redirectPath + '?' + params;
            } else {
                window.location.href = redirectPath;
            }
        }, timeout);
    },
    reloadWithHashID: function (tabID = null) {
        if (this instanceof jQuery) {
            // call from $('#id').reloadWithHashID()
            let tabPane = $(this).closest('.tab-pane');
            if (tabPane.length > 0) {
                let idTabPane = $(tabPane[0]).attr('id');
                if (idTabPane) {
                    WindowControl.pushHashUrl(idTabPane);
                    window.location.reload();
                }
            }

        } else {
            // call from $.fn.reloadWithHashID() | require tabId
            if (tabID) {
                WindowControl.pushHashUrl(tabID);
                window.location.reload();
            }
        }
    },
    callAjax: function (url, method, data = {}, csrfToken = null, headers = {}, content_type = "application/json", opts = {}) {
        if (isDenied && !globeUrlNotDeny.includes(url)) return new Promise(function (resolve, reject) {
        });
        else {
            let isDropdown = opts['isDropdown'];
            let isNotify = opts['isNotify'];
            if (!$.fn.isBoolean(isNotify)) isNotify = true;
            return new Promise(function (resolve, reject) {
                let ctx = {
                    url: url,
                    type: method, // dataType: 'json',
                    contentType: content_type === "multipart/form-data" ? false : content_type,
                    processData: content_type !== "multipart/form-data",
                    data: content_type === "application/json" ? JSON.stringify(data) : WFRTControl.appendBodyCheckWFTask(method, data, url),
                    headers: {
                        "X-CSRFToken": (csrfToken === true ? $("input[name=csrfmiddlewaretoken]").val() : csrfToken),
                        "DTISDD": isDropdown ? 'true' : '', ...headers
                    },
                    success: function (rest, textStatus, jqXHR) {
                        let data = $.fn.switcherResp(rest, {
                            'isNotify': isNotify,
                        });
                        if (data) {
                            if (DocumentControl.getBtnIDLastSubmit() === 'idxSaveInZoneWFThenNext') {
                                let btnSubmit = $('#idxSaveInZoneWFThenNext');
                                let dataWFAction = btnSubmit.attr('data-wf-action');
                                if (btnSubmit && dataWFAction) {
                                    let eleActionDoneTask = $('.btn-action-wf[data-value=' + dataWFAction + ']');
                                    if (eleActionDoneTask.length > 0) {
                                        DocumentControl.setBtnIDLastSubmit(null);
                                        $(eleActionDoneTask[0]).attr('data-success-reload', false)
                                        WFRTControl.callActionWF($(eleActionDoneTask[0])).then(() => {
                                            resolve(rest);
                                        })
                                    } else {
                                        resolve(rest);
                                    }
                                } else {
                                    resolve(rest);
                                }
                            } else {
                                resolve(rest);
                            }

                        } else resolve({'status': jqXHR.status});

                    },
                    error: function (jqXHR, textStatus, errorThrown) {
                        let resp_data = jqXHR.responseJSON;
                        if (resp_data && typeof resp_data === 'object') {
                            $.fn.switcherResp(resp_data, {
                                'isNotify': isNotify,
                            });
                            reject(resp_data);
                        } else if (jqXHR.status === 204) reject({'status': 204});
                    },
                };
                if (method.toLowerCase() === 'get') ctx.data = data
                $.ajax(ctx);
            });
        }
    },
    callAjax2: function (opts = {}) {
        if (isDenied && !globeUrlNotDeny.includes(opts?.['url'])){
            return new Promise(function (resolve, reject) {});
        }
        else {
            let isDropdown = UtilControl.popKey(opts, 'isDropdown', false, true);
            let isNotify = UtilControl.popKey(opts, 'isNotify', false, true);
            if (!$.fn.isBoolean(isNotify)) isNotify = false;
            let notifyOpts = UtilControl.popKey(opts, 'notifyOpts', {}, true);
            const areaControl = UtilControl.popKey(opts, 'areaControl', $(''), false);

            let isLoading = UtilControl.popKey(opts, 'isLoading', false, true);
            let loadingOpts = UtilControl.popKey(opts, 'loadingOpts', {}, true);
            if (!$.fn.isBoolean(isLoading)) isLoading = false;

            // sweetAlertOpts: {'allowOutsideClick': true},
            let sweetAlertOpts = UtilControl.popKey(opts, 'sweetAlertOpts', {}, true);

            //
            let callbackStatus = UtilControl.popKey(opts, 'callbackStatus', {}, true);

            return new Promise(function (resolve, reject) {
                // Setup then Call Ajax
                let url = opts?.['url'] || null;
                if (url) {
                    function callingAPI(){
                        let method = opts?.['method'] || 'GET';
                        let processData = opts?.['processData'] || true;
                        let contentType = opts?.['contentType'] || "application/json";
                        if (contentType === "multipart/form-data") {
                            contentType = false;
                            processData = false;
                        }

                        let csrfToken = opts?.['csrf_token'] || $("input[name=csrfmiddlewaretoken]").val();
                        let headers = opts?.['headers'] || {}
                        let data = opts?.['data'];
                        if (method.toLowerCase() === 'put' && typeof data === 'object') {
                            data = WFRTControl.appendBodyCheckWFTask(method, data, url);
                        }
                        if (method.toLowerCase() !== 'get' && contentType === "application/json") {
                            data = JSON.stringify(data);
                        }

                        if (opts?.['cache'] === true) headers["ENABLEXCACHECONTROL"] = true;

                        let successCallback = opts?.['success'] || null;
                        let onlySuccessCallback = UtilControl.popKey(opts, 'successOnly', false);
                        let errorCallback = opts?.['error'] || null;
                        let onlyErrorCallback = UtilControl.popKey(opts, 'errorOnly', false);
                        let statusCodeCallback = opts?.['statusCode'] || {};

                        let ctx = {
                            ...opts,
                            complete: function (jqXHR, textStatus){
                                if (isLoading) $x.fn.hideLoadingPage();
                            },
                            success: function (rest, textStatus, jqXHR) {
                                if (successCallback) successCallback(rest, textStatus, jqXHR);
                                if (onlySuccessCallback === false) {
                                    let data = $.fn.switcherResp(rest, {
                                        'isNotify': isNotify,
                                        'notifyOpts': {
                                            ...notifyOpts,
                                            'areaControl': areaControl,
                                        },
                                        'swalOpts': sweetAlertOpts,
                                        ...callbackStatus,
                                    });
                                    if (data) {
                                        resolve(rest);
                                    } else resolve({'status': jqXHR.status});
                                }
                            },
                            error: function (jqXHR, textStatus, errorThrown) {
                                if (errorCallback) errorCallback(jqXHR, textStatus, errorThrown);
                                if (onlyErrorCallback === false) {
                                    let resp_data = jqXHR.responseJSON;
                                    if (resp_data && typeof resp_data === 'object') {
                                        $.fn.switcherResp(resp_data, {
                                            'isNotify': isNotify,
                                            'notifyOpts': {
                                                ...notifyOpts,
                                                'areaControl': areaControl,
                                            },
                                            'swalOpts': sweetAlertOpts,
                                            ...callbackStatus,
                                        });
                                        reject(resp_data);
                                    } else if (jqXHR.status === 204) reject({'status': 204});
                                }
                            },
                            url: url,
                            type: method,
                            contentType: contentType,
                            processData: processData,
                            data: data,
                            headers: {
                                "DTISDD": isDropdown === true ? 'true' : '',
                                "X-CSRFToken": csrfToken, ...headers
                            },
                            statusCode: {
                                204: function () {
                                    if (isNotify === true) $.fn.notifyB({
                                        'description': $.fn.transEle.attr('data-success'),
                                    }, 'success');
                                },
                                401: function () {
                                    if (isNotify === true) $.fn.notifyB({
                                        'description': $.fn.gettext('The session login was expired')
                                    }, 'failure');
                                    return WindowControl.redirectLogin(1000);
                                },
                                403: function () {
                                    if (isNotify === true) $.fn.notifyB({
                                        'description': $.fn.gettext("Forbidden")
                                    }, 'failure');
                                },
                                429: function (){
                                    if (isNotify === true) $.fn.notifyB({
                                        'description': $.fn.gettext("Request was throttled. Expected available in {time_sec} seconds.").replaceAll("{time_sec}", $.fn.gettext("a few"))
                                    }, 'failure');
                                },
                                404: function () {
                                    if (isNotify === true) $.fn.notifyB({
                                        'description': $.fn.gettext("Not found"),
                                    }, 'failure');
                                }, ...statusCodeCallback,
                            },
                        };
                        return $.ajax(ctx);
                    }

                    if (isLoading) {
                        const loadingDidOpenEnd = loadingOpts?.['didOpenEnd'] || null;
                        loadingOpts['didOpenEnd'] = function (){
                            if (loadingDidOpenEnd && typeof loadingDidOpenEnd === 'function') loadingDidOpenEnd();
                            return callingAPI();
                        }
                        $x.fn.showLoadingPage(loadingOpts);
                        return true;
                    } else return callingAPI();
                } else {
                    throw Error('Ajax must be url setup before send');
                }
            });
        }
    },
    DataTableDefault: function (opts) {
        if (window.DTLanguageData) {
            const finalOpts = $.extend(true, {
                language: window.DTLanguageData
            }, opts || {});

            return new DTBControl($(this)).init(finalOpts);
        }
        $.ajax({
            url: globeDTBLanguageConfig.trim(),
            dataType: 'json',
            async: false,  // Đồng bộ cho lần đầu
            success: function (data) {
                window.DTLanguageData = data;
            },
            error: function () {
                console.error('❌ Không load được language file');
            }
        });
        // Merge và init
        const finalOpts = $.extend(true, {
            language: window.DTLanguageData || {}
        }, opts || {});
        return new DTBControl($(this)).init(finalOpts);
    },
    initSelect2: function (opts) {
        return new SelectDDControl($(this), opts).init();
    },
    toggleSelect2: function(isDisplay=false){
        if (this instanceof jQuery) {
            if (typeof isDisplay !== "boolean"){
                isDisplay = isDisplay === 1;
            }
            const container$ = $(this).siblings('.select2-container');
            if (container$.length > 0) isDisplay === true ? container$.show(0) : container$.hide(0);
            $(this).hide(0);
        }
    },
    destroySelect2: function (addEmpty=false) {
        let state = false;
        if (this instanceof jQuery) {
            if (this.hasClass("select2-hidden-accessible")) {
                state = true;
                this.val("").select2('destroy');
            }
            $(this).find('option').remove();
            $(this).append(`<option value="" selected></option>`);
        }
        return state;
    },
    compareStatusShowPageAction: function (resultDetail) {
        WFRTControl.compareStatusShowPageAction(resultDetail);
    },
    changePropertiesElementIsZone: function (opts) {
        WFRTControl.changePropertiesElementIsZone($(this), opts);
    },
    gettext: function (txt){
        try {
            return gettext(txt)
        } catch (e) {
            return txt
        }
    },
    serializeObject: function (){
        let formData = {};

        function addToFormData(_name, _value, override=false){
            if (_name){
                if (override === true){
                    formData[_name] = _value;
                } else {
                    const existData = formData?.[_name] || undefined;
                    if (existData !== undefined) {
                        if (Array.isArray(existData)){
                            formData[_name].push(_value);
                        } else {
                            formData[_name] = [existData, _value];
                        }
                    } else {
                        formData[_name] = _value;
                    }
                }
            }
        }

        if (this instanceof jQuery) {
            const form$ = $(this);
            let formArray = this.serializeArray();

            formArray.forEach(function(item) {
                const input$ = form$.find(`[name="${item.name}"]`);
                if (!input$.hasClass('ignore-input')){
                    const inputType = input$.attr("type");
                    if (!item.name.startsWith("table-")){
                        if (inputType === "checkbox") {
                            addToFormData(item.name, true);
                        } else if (inputType === "number") {
                            addToFormData(item.name, item.value ? parseFloat(item.value) : null);
                        } else if (inputType === "date" || inputType === "datetime-local") {
                            addToFormData(item.name, item.value ? new Date(item.value).toISOString() : null);
                        } else {
                            addToFormData(item.name, item.value);
                        }
                    }
                }
            });

            // Xử lý các checkbox chưa chọn
            this.find('input[type="checkbox"]:not(:checked)').each(function() {
                if (!formData.hasOwnProperty(this.name)) {
                    addToFormData(this.name, false, true);
                }
            });

            // Xử lý các radio button chưa chọn
            this.find('input[type="radio"]').each(function() {
                if (!formData.hasOwnProperty(this.name)) {
                    addToFormData(
                        this.name,
                        $(`input[name="${this.name}"]:checked`).val() || null,
                        true
                    );
                }
            });

            // Xử lý các select với multiple lựa chọn
            this.find('select').not('[name^=table-]').each(function() {
                if ($(this).attr("multiple")) {
                    addToFormData(this.name, $(this).val() || [], true);
                } else {
                    addToFormData(this.name, $(this).val() || null, true);
                }
            });
        }
        return formData;
    },
    /**
     * Kiểm tra và cảnh báo Sinh mã tự động
     * @param {Object} param_app_code - app_code
     * @param {string} param_ele_code_id - field code's id in page (to get iQuery element)
     * @returns {void}
     */
    InitAutoGenerateCodeField({param_app_code, param_ele_code_id}) {
        let dataParam = {'company_id': $('#company-current-id').attr('data-id')}
        let function_number_ajax = $.fn.callAjax2({
            url: '/company/function-number',
            data: dataParam,
            method: 'GET'
        }).then(
            (resp) => {
                let data = $.fn.switcherResp(resp);
                if (data && typeof data === 'object' && data.hasOwnProperty('function_number')) {
                    return data?.['function_number'];
                }
                return {};
            },
            (errs) => {
                console.log(errs);
            }
        )

        Promise.all([function_number_ajax]).then(
            (results) => {
                let function_number_data = results[0] || []
                if (function_number_data.filter((item) => {return item?.['app_code'] === param_app_code}).length === 1) {
                    const code_ele = $(`#${param_ele_code_id}`)
                    code_ele.addClass('auto-code-field')
                    code_ele.attr('placeholder', $.fn.gettext('Auto-generate if blank (based on config)'))
                    code_ele.prop('required', false)
                    code_ele.closest('.form-group').find('label').removeClass('required')
                }
            })
    },
});

$(document).ready(function () {
    $('#idxRealAction').removeClass('hidden');
    new NotifyController().active();
    new ListeningEventController().active();


    window.isMobile = ('ontouchstart' in document.documentElement && /mobi/i.test(navigator.userAgent));
});