class SelectDDControl {
    static get_data_from_idx(selectEle, idx) {
        // get data of another IDX (loaded from select2)
        if (!idx && selectEle) idx = selectEle.val();
        let cls = new SelectDDControl(selectEle);
        return cls._getDataBackupLoaded(idx);
    }

    static get_data_key_map(item, keyMap) {
        // get data in object (in object recursive) with  '--' || '.'
        // {'a': {'b': {'c': 1}}} --> get c in b in c --> a--b--c
        if (item && keyMap && typeof item === 'object') {
            let arr = [];
            if (keyMap.includes('--')) {
                arr = keyMap.split('--');
            } else if (keyMap.includes('.')) {
                arr = keyMap.split('.');
            } else {
                arr = [keyMap];
            }

            if (arr.length === 1) {
                if (item.hasOwnProperty(keyMap)) {
                    return item[keyMap];
                }
            } else if (arr.length >= 2) {
                let dataLv = item?.[arr[0]];
                if (dataLv) {
                    return SelectDDControl.get_data_key_map(item[arr[0]], arr.slice(1).join('--'));
                }
            }
        }
        return '';
    }

    static get_data_from_resp(resp, keyResp) {
        // get data from resp by key response
        let result = [];
        let respTmp = resp?.data;
        if (respTmp) {
            let respData = SelectDDControl.get_data_key_map(resp?.data, keyResp);
            if (respData) {
                if (Array.isArray(respData) && respData.length) {
                    result = respData;
                }
            } else {
                if (typeof respTmp === 'object' && Object.keys(respTmp).length === 1 && Array.isArray(respTmp[Object.keys(respTmp)[0]])) {
                    result = respTmp[Object.keys(respTmp)[0]];
                }
            }
        }
        return result;
    }

    arrDataBackupLoaded = 'data-idx-data-loaded';
    page = 1;
    pageSize = 10;
    pageInfinite = true;

    get __has_option_empty() {
        // check select allow render option empty value
        let state = true;
        this.ele.find('option').each(function () {
            if ($(this).val() === '' || !$(this)) {
                state = false;
            }
        });
        return state;
    }

    get __auto_selected_data_onload() {
        let configKey = this.opts?.['selectedDataOnload'];
        let configAttr = this.ele.attr('data-selectedDataOnload');

        if (configKey === undefined || configAttr === undefined) {
            return true
        } else if (typeof configKey === "boolean") {
            return configKey
        } else if (configAttr === 'true') {
            return true;
        } else if (configAttr === 'false') {
            return false;
        }
        return true;
    }

    get _data_getDataOnload() {
        // Get dataOnload from OPTS or attribute data-onload
        // Priority:
        //  1. Opts
        //  2. attr('data-onload')
        //  3. []
        let parseData = [];
        let data = this.opts?.data || null;
        if (data) {
            parseData = data;
        } else {
            data = this.ele.attr('data-onload') || '[]';
            try {
                let temp = data.replaceAll("'", '"');
                parseData = JSON.parse(temp);
            } catch (e) {
            }
        }

        if (Array.isArray(parseData)) {
            // skip because type is correct!
        } else if (typeof parseData === 'object') {
            parseData = [parseData];
        } else {
            parseData = [];
        }
        return parseData;
    }

    get _data_keyResp() {
        // key of object get data to Response API Ajax (value="")
        // Priority:
        //  1. Opts
        //  2. attr('data-keyResp')
        //  3. 'data'
        let keyResp = this.opts?.['keyResp'] ? this.opts?.['keyResp'] : this.ele.attr('data-keyResp') ? this.ele.attr('data-keyResp') : 'data';
        this.ele.attr('data-keyResp', keyResp);
        return keyResp;
    }

    get _data_keyId() {
        // key of object get value to value (value="")
        // Priority:
        //  1. Opts
        //  2. attr('data-keyId')
        //  3. 'id'
        let keyId = this.opts?.['keyId'] ? this.opts?.['keyId'] : this.ele.attr('data-keyId') ? this.ele.attr('data-keyId') : 'id';
        this.ele.attr('data-keyId', keyId);
        return keyId;
    }

    get _data_keyText() {
        // key of object get value to text display
        // Priority:
        //  1. Opts
        //  2. attr('data-keyText')
        //  3. 'title'
        let keyText = this.opts?.keyText ? this.opts?.keyText : this.ele.attr('data-keyText') ? this.ele.attr('data-keyText') : 'title';
        this.ele.attr('data-keyText', keyText)
        return keyText;
    }

    get _ajax_url_method_or_full() {
        // Setup url + method of ajax
        //      1. if opts['ajax'] ==> return full config of opts
        //      2. else attribute data-url & data-method
        //      3. null
        // Priority:
        //  1. opts['ajax']
        //  2. attr('data-url') & attr('data-method')
        //  3. null
        let ajaxData = this.opts?.['ajax'];
        if (ajaxData) return ajaxData;
        if (ajaxData === null) return null;  // without ajax!

        // case: opts.ajax === undefined
        let url = this.ele.attr('data-url');
        let method = this.ele.attr('data-method') || 'GET';
        if (url && method) {
            return {
                'url': url,
                'method': method,
            }
        }
        return null;
    }

    get _ajax_cache() {
        // setup cache for ajax call
        // Priority:
        //  1. Opts
        //  2. attribute('data-cache')
        //  3. true
        if (this.opts.hasOwnProperty('cache') || this.ele.attr('data-cache') !== undefined) {
            return this.opts?.['cache'] ? this.opts?.['cache'] : (this.ele.attr('data-cache') === 'true');
        }
        return true; // default if not found config
    }

    _ele_collect_selected(hasAjax) {
        // Get option:selected in currently
        // Push data to script id random
        let optionTextFind = 'option';
        if (hasAjax === true) optionTextFind += ':selected';

        let dataSelected = [];
        this.ele.find(optionTextFind).each(function () {
            dataSelected.push({
                'id': $(this).val(),
                'text': $(this).text(),
                'data': {
                    'id': $(this).val(),
                    'text': $(this).text(),
                },
                'selected': $(this).prop('selected'),
            })
        })
        let idxDataOnLoadForEle = UtilControl.generateRandomString(32);
        this.ele.attr('data-select-on-load', idxDataOnLoadForEle);
        $(`<script type="application/json" id="${idxDataOnLoadForEle}">${JSON.stringify(dataSelected)}</script>`).insertAfter($.fn.transEle);
        return dataSelected;
    }

    _getDataBackupLoaded(idx = null) {
        // get Data backup from JSON element
        let idEle = this.ele.attr(this.arrDataBackupLoaded);
        let eleJSON = $('#' + idEle);
        if (eleJSON.length <= 0) {
            $(`<script type="application/json" id="${idEle}">{}</script>`).insertAfter($.fn.transEle);
            return {};
        }
        let dataBackup = JSON.parse(eleJSON.text());
        if (idx) return dataBackup?.[idx] || {};
        return dataBackup;
    }

    _setDataBackupLoaded(data) {
        // set Data backup to JSON element
        if (!data) data = {};
        let idEle = this.ele.attr(this.arrDataBackupLoaded);
        let eleJSON = $('#' + idEle);
        if (eleJSON.length <= 0) {
            $(`<script type="application/json" id="${idEle}">${JSON.stringify(data)}</script>`).insertAfter($.fn.transEle);
            return true;
        }
        return eleJSON.text(JSON.stringify(data));
    }

    _forceUpdateDataBackupLoaded(idx, data) {
        // force update Data backup to JSON element with (idx, data)
        let dataBackup = this._getDataBackupLoaded();
        dataBackup[idx] = data;
        this._setDataBackupLoaded(dataBackup);
    }

    _ajax_parse_resp_data(resp) {
        // setup data after receive resp API
        //      Auto add selected to first load
        //      Exclude selected from resp data
        // data-virtual cho case muốn show 1 số opts chỉ có ở UI
        let clsThis = this;
        let data_convert = [];
        let keyResp = this._data_keyResp;
        // let respData = resp?.data[keyResp];
        let respData = this.callbackDataResp(resp, keyResp);
        let dataVirtual = this.ele.attr('data-virtual')
        let pagePrevious = resp?.data?.['page_previous'];
        let keyId = this._data_keyId;
        let keyText = this._data_keyText;
        let idsSelected = this.ele.val();
        if (respData && Array.isArray(respData) && respData.length) {

            // append select to first load
            if (idsSelected && pagePrevious === 0) {
                this.ele.find('option:selected').each(function () {
                    let idn = $(this).val();
                    data_convert.push({
                        'id': idn,
                        'text': $(this).text(),
                        'data': {
                            ...clsThis._getDataBackupLoaded(idn)
                        },
                        'selected': true,
                    })
                })
            }

            // append to resp to data with exclude exist selected
            respData.map((item) => {
                let idn = this.callbackValueId(item, keyId);
                if (!idsSelected || (idsSelected && !idsSelected.includes(idn))) {
                    data_convert.push({
                        'id': idn,
                        'text': this.callbackTextDisplay(item, keyText),
                        'data': item,
                        'selected': false,
                    });
                }
            })
        }
        if (dataVirtual !== undefined && pagePrevious === 0){
            let tempDataVirtual = []
            try {
                let temp = dataVirtual.replaceAll("'", '"');
                let parseData = JSON.parse(temp);
                tempDataVirtual = parseData.reverse()
            } catch (e) {
            }
            for (let item of tempDataVirtual){
                if (item[keyId] !== idsSelected)
                    data_convert.unshift({
                        'id': item[keyId],
                        'text': this.callbackTextDisplay(item, keyText),
                        'data': item,
                        'selected': false,
                    })
            }
        }
        return data_convert;
    }

    _ajax_parse_params_external() {
        // setup params external from opts or attribute
        // Priority:
        //  1. opts.dataParams
        //  2. attribute('data-params')
        //  3. {}

        let params = this.opts?.['dataParams'];
        if (params && typeof params === 'object' && Object.keys(params).length > 0) return params;

        params = this.ele.attr('data-params');
        if (params) {
            let temp = params.replaceAll("'", '"')
            try {
                temp = JSON.parse(temp)
            } catch (e) {
                temp = {}
            }
            return temp
        }
        return {};
    }

    _ajax_url__get_parameter(url){
        let parameters = {};
        let arr = url.split("?");
        if (arr.length > 1){
            arr[1].split("&").map(
                (item) => {
                    let arrTmp = item.split('=');
                    if (arrTmp.length >= 2){
                        parameters[arrTmp[0]] = arrTmp[1];
                    }
                }
            )

        }
        return parameters;
    }

    _ajax_parse_params(params, configUrl) {
        // current param in URL
        let currentParams = this._ajax_url__get_parameter(configUrl);

        // setup params for ajax call
        let query = {};
        query.isDropdown = true;
        if (params.term) query.search = params.term;
        query.page = params.page || this.page;
        query.pageSize = params.pageSize || this.pageSize;

        // merge parameter!
        let resultParams = $x.fn.removeEmptyValuesFromObj({...query, ...currentParams, ...this._ajax_parse_params_external()});
        if (resultParams?.['pageSize'] === '-1' || resultParams?.['pageSize'] === -1) {
            this.pageInfinite = false;  // disable infinite ajax!
            params.isFinite = false;
        }

        return resultParams;
    }

    _ajax_parse_headers(headers) {
        // setup header for ajax call
        return {
            "ENABLEXCACHECONTROL": true, ...headers || {}
        }
    }

    get placeholder() {
        return this.opts?.['placeholder'] ? this.opts.placeholder : this.ele.attr('data-placeholder') ? this.ele.attr('data-placeholder') : $.fn.transEle.attr('data-select-placeholder');
    }

    get width() {
        return this.opts?.width ? this.opts?.width : this.ele.attr('data-width') ? this.ele.attr('data-width') : '100%';
    }

    get theme() {
        return this.opts?.theme ? this.opts?.theme : this.ele.attr('data-theme') ? this.ele.attr('data-theme') : 'bootstrap4';
    }

    get keepIdNullHasText() {
        // flag keep when id = "" but has text display
        // default: false
        // Priority:
        //  1. Opts
        //  2. attr('data-keepIdNullHasText')
        //  3. false
        return this.opts?.['keepIdNullHasText'] ? this.opts?.['keepIdNullHasText'] : (this.ele.attr('data-keepIdNullHasText') === 'true');
    }

    get minimumInputLength() {
        // setup min input length search for multiple
        // Priority:
        //  1. Opts
        //  2. attr('data-minimumInputLength')
        //  3. 0

        let minInpLength = this.opts?.minimumInputLength;
        if (minInpLength) return minInpLength;

        try {
            minInpLength = this.ele.attr('data-minimumInputLength');
            if (minInpLength) return parseInt(minInpLength);
        } catch (e) {
        }

        return 0;
    }

    get maximumInputLength() {
        // setup max input length search for multiple
        // Priority:
        //  1. Opts
        //  2. attr('data-maximumInputLength')
        //  3. 10 --> set < 1 for unlimited

        let maxInpLength = this.opts?.maximumInputLength;
        if (maxInpLength) return maxInpLength;

        try {
            maxInpLength = this.ele.attr('data-maximumInputLength');
            if (maxInpLength) return parseInt(maxInpLength);
        } catch (e) {
        }

        return 100;
    }

    get maximumSelectionLength() {
        // setup maximumSelectionLength for multiple
        // Priority:
        //  1. Opts
        //  2. attr('data-maximumSelectionLength')
        //  3. 10 --> set it < 1 for unlimited selection

        let maxSelected = this.opts?.maximumSelectionLength;
        if (maxSelected) return maxSelected;

        try {
            maxSelected = this.ele.attr('data-maximumSelectionLength');
            if (maxSelected) return parseInt(maxSelected);
        } catch (e) {
        }

        return 10;
    }

    get templateResult() {
        // setup templateResult concat default + manual
        let clsThis = this;
        return function (state) {
            if (!(state.loading === true || state.disabled === true)) {  // show normal text of system: loading, ...
                if (state.data) clsThis._forceUpdateDataBackupLoaded(state.id, state.data);
                let setupFunc = clsThis.opts?.['templateResult'];
                return setupFunc ? setupFunc(state) : state.text;
            }
            return state.text;
        }
    }

    get templateSelection(){
        let clsThis = this;
        return function (state) {
            let setupFunc = clsThis.opts?.['templateSelection'];
            return setupFunc ? setupFunc(state) : state.text;
        }
    }

    get multipleAndAllowClear() {
        // Setup multiple + allowClear + closeOnSelect
        // Prepend option empty to first when (!multiple & allowClear)
        // Priority:
        //  1. opts
        //  2. attr('...')
        //  3. {default}
        let isDisabled = this.disabled;
        let isMultiple = this.opts?.multiple ? true : !!this.ele.attr('multiple');
        let isCloseSelect = this.ele.attr('data-closeOnSelect') !== 'false';
        let isAllowClear = this.opts?.allowClear ? true : (this.ele.attr('data-allowClear') === 'true');
        if (!isMultiple && isAllowClear && this.__has_option_empty !== true) {
            this.ele.prepend(`<option selected></option>`);
        }
        return {
            'multiple': isMultiple,
            'closeOnSelect': isCloseSelect,
            'allowClear': isDisabled === true ? false : isAllowClear,
        }
    }

    get tagsToken() {
        // Setup tags + tokenSeparators
        // Priority:
        //  1. opts
        //  2. attr('...')
        //  3. false|null
        let tagsData = this.opts?.tags ? true : (this.ele.attr('data-tags') === 'true');
        let tokenSeparators = null;
        if (tagsData) {
            if (this.opts?.tokenSeparators){
                tokenSeparators = this.opts?.tokenSeparators;
            } else if (this.ele.attr('data-tokenSeparators')) {
                try {
                    tokenSeparators = JSON.parse(this.ele.attr('data-tokenSeparators'))
                } catch (e) {
                }
            }
        }
        return {
            'tags': tagsData,
            'tokenSeparators': tokenSeparators,
        }
    }

    get disabled() {
        // Config disabled for select2
        // Priority:
        //  1. attr('disabled')
        //  2. opts
        //  3. false
        return this.ele.prop('disabled') || this.ele.attr('readonly') ? true : !!this.opts?.disabled;
    }

    get dropdownParent() {
        // parent element where select2 render to child of it. --> fix select2 was hidden when outside modal.
        // if parent is div.modal --> parent div.model
        // else parent.first
        if (!this.opts?.['dropdownParent']) {
            let dropdownParent = $(this.ele).closest('div.modal');
            if (dropdownParent.length > 0) return {'dropdownParent': $(dropdownParent[0])};
        } else {
            return {'dropdownParent': $(this.ele).parent()[0]}
        }
        return {};
    }

    get data() {
        // Setup data for: 1. don't have ajax | 2. initData when have ajax
        // Using return value from dataOnload + keyText
        let initData = [];
        let data = this._data_getDataOnload;
        if (data && Array.isArray(data)) {
            let autoSelected = (this.__auto_selected_data_onload === true);
            let keyId = this._data_keyId;
            let keyText = this._data_keyText;
            initData = data.map(
                (item) => {
                    let children = item?.['children'];
                    if (children && Array.isArray(children)) {
                        // case: otp group data
                        children.map(
                            item2 => {
                                let selected = item2?.['selected']
                                if (typeof selected !== "boolean") selected = autoSelected;
                                let _txt = this.callbackTextDisplay(item2, keyText);
                                return {
                                    'id': this.callbackValueId(item2, keyId),
                                    'text': _txt,
                                    'title': _txt,
                                    'data': item2,
                                    'selected': selected,
                                }
                            }
                        )
                        return {
                            ...item,
                            'children': children,
                        }
                    } else {
                        let selected = item?.['selected']
                        if (typeof selected !== "boolean") selected = autoSelected;
                        let _txt = this.callbackTextDisplay(item, keyText);
                        return {
                            'id': this.callbackValueId(item, keyId),
                            'text': _txt,
                            'title': _txt,
                            'data': item,
                            'selected': selected,
                        }
                    }
                }
            )
        }
        this.initData = initData;
        return {'data': initData.length > 0 ? initData : null};
    }

    get ajax() {
        // setup ajax + handle general pagination, filter, cache, ...
        // using value return from _ajax_url_method_or_full
        let clsThis = this;
        let ajaxConfig = null;
        let config = this._ajax_url_method_or_full;
        if (config) {
            ajaxConfig = {
                'cache': this._ajax_cache,
                'delay': 250,
                'headers': clsThis._ajax_parse_headers(),
                'processResults': function (resp, params) {
                    params.page = params.page || clsThis.page;
                    return {
                        results: clsThis._ajax_parse_resp_data(resp),
                        pagination: {
                            more: clsThis.pageInfinite === true ? (params.page * clsThis.pageSize) < (resp?.data?.['page_count'] || 1) : false,
                            // Load More Scrolling | Infinite Scrolling : https://select2.org/data-sources/ajax#count_filtered
                        }
                    };
                },
                ...config,
                'data': function (params) {
                    // data in ajax { 'data': function(params){}}
                    const dataOfManual = config?.['data'];
                    if (typeof dataOfManual === 'function') dataOfManual.bind(this)(params);
                    // append params of DataTable.
                    return clsThis._ajax_parse_params(params, config.url);
                },
            }
        }
        return {'ajax': (ajaxConfig ? ajaxConfig : null)};
    }

    constructor(selectEle, opts) {
        this.ele = $(selectEle);    // element init select2
        this.opts = opts || {};   // opts input at call setup
        this.initData = []; // ** [private] storage initData of class
        this._config = null; // ** [private] storage config of class

        if (!this.ele.attr(this.arrDataBackupLoaded)) {
            let idxDataBackup = UtilControl.generateRandomString(32);
            this.ele.attr(this.arrDataBackupLoaded, idxDataBackup);
        }
    }

    callbackRenderInfoDetail(inputAffixEle$) {
        // callback of render detail icon in select
        // return: object or list[object] by multiple select
        let callback = this.opts?.['callbackInfoDetail'];
        if (callback) {
            let DDMenuEle = $(inputAffixEle$).find('.dropdown-menu');
            let dataBackup = {};
            let selectedVal = this.ele.val();

            if (Array.isArray(selectedVal)) {
                dataBackup = [];
                selectedVal.map(
                    (idx) => {
                        dataBackup.push(this._getDataBackupLoaded(idx) || {});
                    }
                );
            } else if (typeof selectedVal === "string") {
                dataBackup = selectedVal ? this._getDataBackupLoaded(selectedVal) : {};
            }
            callback(DDMenuEle, dataBackup, selectedVal, this.ele);
        }
    }

    callbackDataResp(resp, keyResp) {
        let callback = this.opts?.['callbackDataResp'] || SelectDDControl.get_data_from_resp;
        if (callback) {
            let result = callback(resp, keyResp);
            if (result && Array.isArray(result)) return result;
        }
        return [];
    }

    callbackValueId(item, key) {
        let callback = this.opts?.['callbackValueId'] || SelectDDControl.get_data_key_map;
        if (callback) {
            return callback(item, key)
        }
        return '';
    }

    callbackTextDisplay(item, key) {
        // callback manual parse data to option text
        let callback = this.opts?.['callbackTextDisplay'] || SelectDDControl.get_data_key_map;
        return callback ? callback(item, key) : '';
    }

    renderDataOnload(config) {
        // Concat dataOnload config + option select in HTML ==> Auto selected it after render select2
        // Using return value from
        //      - collect_selected
        //      - this.initData: value was set at this.data
        // ** Will be applied templateSelection in the future
        let clsThis = this;

        let hasAjax = !!(config?.['ajax']);
        let dataSelected = this._ele_collect_selected(hasAjax);
        let dataOnload = this.initData;
        if (this.ele && this.ele.length > 0 && Array.isArray(dataOnload) && Array.isArray(dataSelected)) {
            let sumData = this.initData.concat(dataSelected);
            if (!hasAjax) {
                config['ajax'] = null;
                config['data'] = sumData.map(
                    (item) => {
                        return {
                            ...item,
                            // prepare text to title for templateResult callback
                            'title': item?.['text'] ? item?.['text'] : item?.['title'] ? item['title'] : '',
                        }
                    }
                );
            }

            let selectLoaded = false;
            let optHTML = sumData.map((item) => {
                if (
                    selectLoaded === false
                    && (
                        item.selected === true || sumData.length === 1
                    )
                ) {
                    selectLoaded = true;
                    let dataIDx = this.callbackValueId(item, this._data_keyId);
                    clsThis.loadInfoMore(
                        $(this.ele),
                        dataIDx ? dataIDx : this.callbackValueId(item?.['data'] || {}, this._data_keyId),
                        item?.['data'] ? item?.['data'] : item,
                    )
                }

                let idn = item?.['id'];
                let textShow = item?.['text'];
                if (idn || (!idn && this.keepIdNullHasText)) {
                    this._forceUpdateDataBackupLoaded(idn, item?.['data'] || {});
                    return `<option value="${idn}" ${item?.selected ? "selected" : ""}>${textShow || ''}</option>`;
                }
            }).join("");
            if (optHTML) this.ele.html(optHTML);
        }
        return true;
    }

    config() {
        // Return all config select2
        return {
            'placeholder': this.placeholder,
            'width': this.width,
            'theme': this.theme,
            'language': globeLanguage,
            ...this.opts,
            'minimumInputLength': this.minimumInputLength,
            'maximumInputLength': this.maximumInputLength,
            'maximumSelectionLength': this.maximumSelectionLength,
            'disabled': this.disabled,
            ...this.multipleAndAllowClear,
            ...this.tagsToken,
            'templateResult': this.templateResult,
            'templateSelection': this.templateSelection,
            ...this.dropdownParent,
            ...this.data,
            ...this.ajax,
        }
    }

    loadInfoMore(eleThis, detailIdx = null, detailData = null) {
        let nextHasInfoBtnMore = $(eleThis).siblings('.info-btn-more');
        let nextHasInfoBtnMore__Detail = $(eleThis).siblings('.info-btn-more-detail');
        if (nextHasInfoBtnMore.length > 0 && nextHasInfoBtnMore__Detail.length > 0) {
            let selectVal = detailIdx && detailData ? detailIdx : $(eleThis).val();
            let urlInfoDetail = $(eleThis).attr('data-url-info-detail');
            if (urlInfoDetail) {
                if (selectVal) {
                    urlInfoDetail = urlInfoDetail.replaceAll('__pk__', selectVal);
                    nextHasInfoBtnMore.attr('data-id', selectVal);
                    nextHasInfoBtnMore__Detail.find('.link-detail-more').attr('href', urlInfoDetail);
                } else {
                    nextHasInfoBtnMore.removeAttr('data-id');
                    nextHasInfoBtnMore__Detail.find('.link-detail-more').attr('href', '#');
                }
            }

            let func_onload = window[$(eleThis).data('on-load-info')];
            if (func_onload && typeof func_onload === 'function') {
                func_onload(
                    nextHasInfoBtnMore__Detail,
                    nextHasInfoBtnMore__Detail.find('.info-btn-more-detail-data'),
                    detailIdx && detailData ? detailData : SelectDDControl.get_data_from_idx($(eleThis), selectVal),
                );
            }

        }
    }

    init() {
        // call this for init select with options
        if (this.ele.length > 0) {
            if (!this._config) this._config = this.config();
            this.renderDataOnload(this._config);
            const sel2$ = this.ele.select2(this._config);
            this.ele.data('clsSelect2', this);
            // on event in select2 => call DOM event
            // don't trigger change + valid when change : because call duplicate showErrors
            const form$ = this.ele.closest('form');
            function hasCallValid(){
                return !!(form$.length > 0 && form$.data('validator'));
            }
            sel2$.on('select2:select', function(){
                if (hasCallValid()) $(this).valid();
            });
            sel2$.on('select2:unselect', function(){
                if (hasCallValid()) $(this).valid();
            });
            sel2$.on('select2:clear', function(){
                if (hasCallValid()) $(this).valid();
            });
            return sel2$;
        }
    }
}