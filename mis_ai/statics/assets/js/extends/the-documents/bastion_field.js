function onLoadDropdownInfoInherit(eleInfo, eleInfoData, selectedData) {
    eleInfoData.find('.emp-info-detail-first-name').val(selectedData['first_name']);
    eleInfoData.find('.emp-info-detail-last-name').val(selectedData['last_name']);
    eleInfoData.find('.emp-info-detail-email').val(selectedData['email']);
    eleInfoData.find('.emp-info-detail-is-active').prop('checked', !!selectedData['is_active']);
    return eleInfo;
}

function onLoadDropdownInfoOpp(eleInfo, eleInfoData, selectedData) {
    eleInfoData.find('.opp-info-detail-title').val(selectedData['title']);
    eleInfoData.find('.opp-info-detail-code').val(selectedData['code']);
    return eleInfo;
}

function onLoadDropdownInfoProcess(eleInfo, eleInfoData, selectedData) {
    eleInfoData.find('.process-info-detail-title').val(selectedData['title']);
    eleInfoData.find('.process-info-detail-code').val(selectedData['code']);
    return eleInfo;
}

class BastionFieldControl {
    static defaultOpts = {
        // has_opp: false,
        // has_prj: false,
        // has_inherit: false,
        // has_process: false,

        // data_inherit: [
        //     {
        //         "id": "",
        //         "title": "",
        //         "first_name": "",
        //         "last_name": "",
        //         "email": "",
        //         "is_active": false,
        //         "selected": true,
        //     }
        // ],
        // data_opp: [
        //     {
        //         "id": "",
        //         "title": "",
        //         "code": "",
        //         "selected": true,
        //     }
        // ],
        // data_prj: [
        //     {
        //         "id": "",
        //         "title": "",
        //         "selected": true,
        //     }
        // ],
        // data_process: [
        //     {
        //         "id": "",
        //         "title": "",
        //         "selected": true,
        //     }
        // ],

        // opp_call_trigger_change: false,
        // prj_call_trigger_change: false,
        // inherit_call_trigger_change: false,
        // process_call_trigger_change: false,
    }

    get mainDiv() {
        return this.globalOpts?.['mainDiv'] || $('#bastionFieldTheDocument');
    }

    get oppEle() {
        return this.globalOpts?.['oppEle'] || this.mainDiv.find(':input[name=opportunity_id]');
    }

    get prjEle() {
        return this.globalOpts?.['prjEle'] || this.mainDiv.find(':input[name=project_id]');
    }

    get empInheritEle() {
        return this.globalOpts?.['empInheritEle'] || this.mainDiv.find(':input[name=employee_inherit_id]');
    }

    get processEle() {
        return this.globalOpts?.['processEle'] || this.mainDiv.find(':input[name=process]');
    }

    get processStageAppEle$() {
        return this.globalOpts?.['processStageAppEle$'] || this.mainDiv.find(':input[name="process_stage_app"]');
    }

    get list_from_app() {
        if (this.globalOpts?.['list_from_opp']) {
            return this.globalOpts['list_from_opp'].trim();
        }
        if (this.mainDiv.data('current-feature')) {
            return this.mainDiv.data('current-feature').trim();
        }
        return '';
    }

    get app_id() {
        if (this.globalOpts?.['app_id']) return this.globalOpts['app_id'];
        if (this.mainDiv.data('current-app-id')) return this.mainDiv.data('current-app-id');
        return '';
    }

    allOppConfig(getKey = null) {
        if (!this._AllOppConfig) {
            let data = {
                'has': this.oppEle.length > 0 ? this.oppEle.closest('html').length > 0 : false,
                'disabled': (this.mainDiv.data('opp_disabled') === '1' || this.mainDiv.data('opp_disabled') === 1),
                'required': (this.mainDiv.data('opp_required') === '1' || this.mainDiv.data('opp_required') === 1),
                'readonly': (this.mainDiv.data('opp_readonly') === '1' || this.mainDiv.data('opp_readonly') === 1),
                'hidden': (this.mainDiv.data('opp_hidden') === '1' || this.mainDiv.data('opp_hidden') === 1),
                'title': this.mainDiv.data('opp_title'),
                'data': [],
                ...(
                    Array.isArray(this.globalOpts?.['data_opp']) ? {'data': this.globalOpts['data_opp']} : {}
                ),
                ...this.globalOpts?.['oppFlagData'],
            }
            data['showing'] = data['has'] === true && data['hidden'] === false;
            data['not_change'] = data['disabled'] === true || data['readonly'] === true;
            this._AllOppConfig = data;
        }
        if (getKey) {
            return this._AllOppConfig.hasOwnProperty(getKey) ? this._AllOppConfig[getKey] : null;
        }
        return this._AllOppConfig;
    }

    allPrjConfig(getKey = null) {
        if (!this._AllPrjConfig) {
            let data = {
                'has': this.prjEle.length > 0 ? this.prjEle.closest('html').length > 0 : false,
                'disabled': (this.mainDiv.data('prj_disabled') === '1' || this.mainDiv.data('prj_disabled') === 1),
                'required': (this.mainDiv.data('prj_required') === '1' || this.mainDiv.data('prj_required') === 1),
                'readonly': (this.mainDiv.data('prj_readonly') === '1' || this.mainDiv.data('prj_readonly') === 1),
                'hidden': (this.mainDiv.data('prj_hidden') === '1' || this.mainDiv.data('prj_hidden') === 1),
                'title': this.mainDiv.data('prj_title'),
                'data': [],
                ...(
                    Array.isArray(this.globalOpts?.['data_prj']) ? {'data': this.globalOpts['data_prj']} : {}
                ),
                ...this.globalOpts?.['prjFlagData']
            };
            data['showing'] = data['has'] === true && data['hidden'] === false;
            data['not_change'] = data['disabled'] === true || data['readonly'] === true;
            this._AllPrjConfig = data;
        }
        if (getKey) {
            return this._AllPrjConfig.hasOwnProperty(getKey) ? this._AllPrjConfig[getKey] : null;
        }
        return this._AllPrjConfig;
    }

    allInheritConfig(getKey = null) {
        if (!this._AllInheritConfig) {
            let data = {
                'has': this.empInheritEle.length > 0 ? this.empInheritEle.closest('html').length > 0 : false,
                'disabled': (this.mainDiv.data('inherit_disabled') === '1' || this.mainDiv.data('inherit_disabled') === 1),
                'required': (this.mainDiv.data('inherit_required') === '1' || this.mainDiv.data('inherit_required') === 1),
                'readonly': (this.mainDiv.data('inherit_readonly') === '1' || this.mainDiv.data('inherit_readonly') === 1),
                'hidden': (this.mainDiv.data('inherit_hidden') === '1' || this.mainDiv.data('inherit_hidden') === 1),
                'title': this.mainDiv.data('inherit_title'),
                'data': this.empInheritEle.data('onload') || [],
                ...(
                    Array.isArray(this.globalOpts?.['data_inherit']) ? {'data': this.globalOpts['data_inherit']} : {}
                ),
                ...this.globalOpts?.['inheritFlagData']
            };
            data['showing'] = data['has'] === true && data['hidden'] === false;
            data['not_change'] = data['disabled'] === true || data['readonly'] === true;
            this._AllInheritConfig = data;
        }
        if (getKey) {
            return this._AllInheritConfig.hasOwnProperty(getKey) ? this._AllInheritConfig[getKey] : null;
        }
        return this._AllInheritConfig;
    }

    allProcessConfig(getKey = null) {
        if (!this._AllProcessConfig) {
            let data = {
                'has': this.processEle.length > 0 ? this.processEle.closest('html').length > 0 : false,
                'disabled': (this.mainDiv.data('process_disabled') === '1' || this.mainDiv.data('process_disabled') === 1),
                'required': (this.mainDiv.data('process_required') === '1' || this.mainDiv.data('process_required') === 1),
                'readonly': (this.mainDiv.data('process_readonly') === '1' || this.mainDiv.data('process_readonly') === 1),
                'hidden': (this.mainDiv.data('process_hidden') === '1' || this.mainDiv.data('process_hidden') === 1),
                'title': this.mainDiv.data('process_title'),
                'data': [],
                ...(
                    Array.isArray(this.globalOpts?.['data_process']) ? {'data': this.globalOpts['data_process']} : {}
                ),
                ...this.globalOpts?.['processFlagData'],
            };
            data['showing'] = data['has'] === true && data['hidden'] === false;
            data['not_change'] = data['disabled'] === true || data['readonly'] === true;
            this._AllProcessConfig = data;
        }
        if (getKey) {
            return this._AllProcessConfig.hasOwnProperty(getKey) ? this._AllProcessConfig[getKey] : null;
        }
        return this._AllProcessConfig;
    }

    allProcessStageAppConfig(getKey = null) {
        if (!this._AllProcessStageAppConfig) {
            let data = {
                'has': this.processStageAppEle$.length > 0 ? this.processStageAppEle$.closest('html').length > 0 : false,
                'disabled': (this.mainDiv.data('process_disabled') === '1' || this.mainDiv.data('process_disabled') === 1),
                'required': (this.mainDiv.data('process_required') === '1' || this.mainDiv.data('process_required') === 1),
                'readonly': (this.mainDiv.data('process_readonly') === '1' || this.mainDiv.data('process_readonly') === 1),
                'hidden': (this.mainDiv.data('process_hidden') === '1' || this.mainDiv.data('process_hidden') === 1),
                'title': this.mainDiv.data('process_title'),
                'data': [],
                ...(
                    Array.isArray(this.globalOpts?.['data_process_stage_app']) ? {'data': this.globalOpts['data_process_stage_app']} : {}
                ),
                ...this.globalOpts?.['processStageAppFlagData']
            };
            data['showing'] = data['has'] === true && data['hidden'] === false;
            data['not_change'] = data['disabled'] === true || data['readonly'] === true;
            this._AllProcessStageAppConfig = data;
        }
        if (getKey) {
            return this._AllProcessStageAppConfig.hasOwnProperty(getKey) ? this._AllProcessStageAppConfig[getKey] : null;
        }
        return this._AllProcessStageAppConfig;
    }

    constructor(opts) {
        this._AllOppConfig = null;
        this._AllPrjConfig = null;
        this._AllInheritConfig = null;
        this._AllProcessConfig = null;
        this._AllProcessStageAppConfig = null;

        this.globalOpts = {
            'mainDiv': $('#bastionFieldTheDocument'),
            'oppEle': null,
            'prjEle': null,
            'empInheritEle': null,
            'processEle': null,
            'processStageAppEle$': null,
            'list_from_app': null,
            'app_id': null,
            'urlDataMatch': '/process/runtime/data-match/api',
            ...opts,
        };

        this.ajaxOpp = {
            'ajax': {
                'url': '/opportunity/list/api',
                'method': 'GET',
            },
            'keyResp': 'opportunity_list',
            'keyText': 'code',
            ...opts?.['ajaxOpp'],
        }
        this.ajaxProject = {
            'ajax': {
                'url': '/project/list-api',
                'method': 'GET',
            },
            'keyResp': 'project_list',
            'keyText': 'code',
            ...opts?.['ajaxProject'],
        }
        this.ajaxInherit = {
            'ajax': {
                'url': '/hr/employee/api',
                'method': 'GET',
            },
            'keyResp': 'employee_list',
            'keyText': 'full_name',
            ...opts?.['ajaxInherit'],
        }
        this.ajaxProcess = {
            'ajax': {
                'url': '/process/runtime/list/me/api',
                'method': 'GET',
            },
            'keyResp': 'process_runtime_list',
            'keyText': 'title',
            'allowClear': true,
            ...opts?.['ajaxProcess'],
        }
        this.ajaxProcessStageApp = {
            'ajax': {
                'url': '/process/runtime/stages-apps/me/api',
                'method': 'GET',
            },
            'keyResp': 'process_runtime_stages_app_list',
            'keyText': 'title',
            'allowClear': true,
            ...opts?.['ajaxProcessStageApp'],
        }

        this.opp_call_trigger_change = opts?.['opp_call_trigger_change'] || false;
        this.prj_call_trigger_change = opts?.['prj_call_trigger_change'] || false;
        this.inherit_call_trigger_change = opts?.['inherit_call_trigger_change'] || false;
        this.process_call_trigger_change = opts?.['process_call_trigger_change'] || false;
    }

    static skipBastionChange = 'change_from_bastion_config';

    configOppSelect(opts) {
        return {
            ...this.ajaxOpp,
            'allowClear': true,
            'dataParams': {
                'list_from_app': this.list_from_app,
                'is_close_lost': false,
                'is_deal_close': false,
                ...this.ajaxOpp?.['dataParams'],
            },
            templateResult: function (state) {
                let titleHTML = `<span>${state.data?.title ? state.data.title : state.title ? state.title : "_"}</span>`
                let codeHTML = `<span class="badge badge-soft-primary mr-2">${state.text ? state.text : "_"}</span>`
                return $(`<span>${codeHTML} ${titleHTML}</span>`);
            },
            cache: true, ...opts,
            'disabled': this.allOppConfig('not_change'),
        }
    }

    initOppSelect(opts) {
        if (this.oppEle instanceof jQuery && this.oppEle.length === 1) {
            let clsThis = this;

            // active events
            this.mainDiv.trigger('bastionField.preInit:opp');
            this.oppEle.trigger('bastionField.preInit:opp');

            // not allow change opp | use for create new from Opp
            const configSelect2 = this.configOppSelect(opts);
            if (this.allOppConfig('not_change') === true) {
                this.oppEle.attr('readonly', 'readonly').closest('.form-group').css('cursor', 'not-allowed');
                const clsSelect2 = new SelectDDControl(this.oppEle, configSelect2);
                clsSelect2.renderDataOnload(clsSelect2.config());
            } else {
                // main
                this.oppEle.destroySelect2();
                this.oppEle.initSelect2(configSelect2).on('change', function (event, data) {
                    if (data === BastionFieldControl.skipBastionChange) return;  // skip on first change from bastion config

                    const oppIDSelected = $(this).val();
                    let hasVal = !!oppIDSelected;

                    clsThis.callLinkedData('opp');

                    // re-check project
                    if (clsThis.allPrjConfig('showing') === true && hasVal) {
                        if (clsThis.allPrjConfig('disabled') === false) clsThis.prjEle.prop('disabled', hasVal);
                        if (clsThis.allPrjConfig('readonly') === false) clsThis.prjEle.prop('readonly', hasVal);
                    }
                });
            }

            if (this.opp_call_trigger_change === true) this.oppEle.trigger('change', BastionFieldControl.skipBastionChange);

            // active events
            this.mainDiv.trigger('bastionField.init:opp');
            this.oppEle.trigger('bastionField.init:opp');
        }
    }

    initPrjSelect(opts) {
        if (this.prjEle instanceof jQuery && this.prjEle.length === 1 && !this.prjEle.hasClass("select2-hidden-accessible")) {
            let dataOnload = opts?.['data'] || [];
            // active events
            this.mainDiv.trigger('bastionField.preInit:prj');
            this.prjEle.trigger('bastionField.preInit:prj');

            let clsThis = this;
            let config = {
                ...this.ajaxProject,
                'allowClear': true,
                'dataParams': {'list_from_app': this.list_from_app},
                templateResult: function (state) {
                    let titleHTML = `<span>${state.data?.title ? state.data.title : "_"}</span>`
                    let codeHTML = `<span class="badge badge-soft-primary mr-2">${state.text ? state.text : "_"}</span>`
                    return $(`<span>${codeHTML} ${titleHTML}</span>`);
                },
                cache: true,
            }
            if (dataOnload !== undefined && dataOnload !== null && dataOnload.length > 0) {
                config['data'] = dataOnload;
            }

            if (this.allOppConfig('not_change') === true) {
                this.prjEle.attr('readonly', 'readonly').closest('.form-group').css('cursor', 'not-allowed');
                const clsSelect2 = new SelectDDControl(this.prjEle, config);
                clsSelect2.renderDataOnload(clsSelect2.config());
            } else {
                this.prjEle.destroySelect2();
                this.prjEle.initSelect2(config).on('change', function (event, data) {
                    if (data === BastionFieldControl.skipBastionChange) return;  // skip on first change from bastion config

                    let hasVal = !!$(this).val();

                    // re-check inherit
                    clsThis.initInheritSelect({
                        'data-params': hasVal ? {
                            'list_from_prj': $(this).val(),
                        } : {}
                    });

                    // re-check project
                    if (clsThis.allOppConfig('showing') === true && hasVal) {
                        if (clsThis.allOppConfig('disabled') === false) clsThis.oppEle.prop('disabled', hasVal);
                        if (clsThis.allOppConfig('readonly') === false) clsThis.oppEle.prop('readonly', hasVal);
                    }
                });
            }
            if (this.prj_call_trigger_change === true) this.prjEle.trigger('change', BastionFieldControl.skipBastionChange);

            // active events
            this.mainDiv.trigger('bastionField.init:prj');
            this.prjEle.trigger('bastionField.init:prj');
        }
    }

    configInheritSelect(opts) {
        let paramData = opts?.['data-params'] || null;
        if (!(paramData && typeof paramData === 'object')) paramData = {};
        // paramData['list_from_app'] = this.list_from_app;
        let paramDataBase = this.empInheritEle.attr('data-params');
        this.empInheritEle.removeAttr('data-onload');
        if (paramDataBase) {
            try {
                paramData = {...paramData, ...JSON.parse(paramDataBase)}
            } catch (e) {
            }
        }
        if (this.globalOpts?.['inherit_params'])
            try {
                paramData = {...paramData, ...this.globalOpts?.['inherit_params']}
            } catch (e) {}

        return {
            allowClear: true,
            cache: true,
            ...this.ajaxInherit,
            dataParams: paramData,
            ...opts,
            'disabled': this.allInheritConfig('not_change'),
        };
    }

    initInheritSelect(opts) {
        if (this.empInheritEle instanceof jQuery && this.empInheritEle.length === 1 && !this.empInheritEle.hasClass("select2-hidden-accessible")) {
            // active events
            this.mainDiv.trigger('bastionField.preInit:inherit');
            this.prjEle.trigger('bastionField.preInit:inherit');

            const configSelect2 = this.configInheritSelect(opts);

            if (this.allInheritConfig('not_change') === true) {
                this.empInheritEle.attr('readonly', 'readonly').closest('.form-group').css('cursor', 'not-allowed');
                const clsSelect2 = new SelectDDControl(this.empInheritEle, configSelect2);
                clsSelect2.renderDataOnload(clsSelect2.config());
            } else {
                this.empInheritEle.destroySelect2();
                this.empInheritEle.initSelect2(configSelect2).on('change', function (event, data) {
                    if (data === BastionFieldControl.skipBastionChange) return;  //
                });
            }

            if (this.inherit_call_trigger_change) this.empInheritEle.trigger('change', BastionFieldControl.skipBastionChange);

            // active events
            this.mainDiv.trigger('bastionField.init:inherit');
            this.prjEle.trigger('bastionField.init:inherit');
        }
    }

    configProcessSelect(opts) {
        return {
            ...this.ajaxProcess,
            'allowClear': true,
            'dataParams': {
                'belong_to_me': '1',
            }, ...opts,
            'disabled': this.allProcessConfig('not_change'),
        }
    }

    initProcessSelect(opts) {
        const clsThis = this;
        if (this.processEle instanceof jQuery && this.processEle.length === 1 && !this.processEle.hasClass("select2-hidden-accessible")) {
            // active events
            this.mainDiv.trigger('bastionField.preInit:process');
            this.processEle.trigger('bastionField.preInit:process');

            // not allow change opp | use for create new from Opp
            const configSelect2 = clsThis.configProcessSelect(opts);
            if (this.allProcessConfig('not_change') === true) {
                this.processEle.attr('readonly', 'readonly').closest('.form-group').css('cursor', 'not-allowed');
                const clsSelect2 = new SelectDDControl(clsThis.processEle, configSelect2);
                clsSelect2.renderDataOnload(clsSelect2.config());
            } else {
                // main
                this.processEle.destroySelect2();
                this.processEle.initSelect2(configSelect2).on('change', function (event, data) {
                    if (data === BastionFieldControl.skipBastionChange) return;  // skip on first change from bastion config
                    clsThis.callLinkedData('process');
                });
            }

            if (this.process_call_trigger_change === true) this.processEle.trigger('change', BastionFieldControl.skipBastionChange);

            // active events
            this.mainDiv.trigger('bastionField.init:process');
            this.processEle.trigger('bastionField.init:process');
        }
    }

    configProcessStageAppSelect(opts) {
        const dataParams = opts?.['dataParams'] || {};
        let extParams = {'was_done': false};
        const appId = this.app_id;
        if (appId) extParams['application_id'] = appId;
        return {
            ...this.ajaxProcessStageApp,
            'allowClear': true, ...opts,
            'dataParams': {
                'created_full': false,
                ...dataParams, ...extParams,
                ...(this.processEle.val() ? {'process_id': this.processEle.val()} : {}),
            },
            'disabled': this.allProcessStageAppConfig('not_change'),
        }
    }

    initProcessStageAppSelect(opts) {
        // Keep init process before init stage app
        if (this.processStageAppEle$ instanceof jQuery && this.processStageAppEle$.length === 1 && !this.processStageAppEle$.hasClass("select2-hidden-accessible")) {
            const clsThis = this;
            // active events
            this.mainDiv.trigger('bastionField.preInit:processStageApp');
            this.processStageAppEle$.trigger('bastionField.preInit:processStageApp');

            // not allow change opp | use for create new from Opp
            const configSelect2 = clsThis.configProcessStageAppSelect(opts);
            if (this.allProcessConfig('not_change') === true) {
                this.processStageAppEle$.attr('readonly', 'readonly').closest('.form-group').css('cursor', 'not-allowed');
                const clsSelect2 = new SelectDDControl(clsThis.processStageAppEle$, configSelect2);
                clsSelect2.renderDataOnload(clsSelect2.config());
            } else {
                // main
                this.processStageAppEle$.destroySelect2();
                this.processStageAppEle$.initSelect2(configSelect2).on('change', function (event, data) {
                    if (data === BastionFieldControl.skipBastionChange) return;  // skip on first change from bastion config
                    clsThis.callLinkedData('process_stage_app');
                });
            }
            if (this.process_call_trigger_change === true) this.processStageAppEle$.trigger('change', BastionFieldControl.skipBastionChange);

            // active events
            this.mainDiv.trigger('bastionField.init:processStageApp');
            this.processStageAppEle$.trigger('bastionField.init:processStageApp');
        }
    }

    init() {
        if (this.mainDiv instanceof jQuery && this.mainDiv.length === 1) {
            this.mainDiv.trigger('bastionField.preInit');

            if (this.allInheritConfig('has') !== true) this.empInheritEle.prop('disabled', true).attr('readonly', 'readonly');
            this.initInheritSelect({'data': this.allInheritConfig('data')});

            if (this.allOppConfig('has') !== true) this.oppEle.prop('disabled', true).attr('readonly', 'readonly');
            this.initOppSelect({'data': this.allOppConfig('data')});

            if (this.allPrjConfig('has') !== true) this.prjEle.prop('disabled', true).attr('readonly', 'readonly');
            this.initPrjSelect({'data': this.allPrjConfig('data')});

            if (this.allProcessConfig('has') !== true) {
                this.processEle.prop('disabled', true).attr('readonly', 'readonly');
                this.processStageAppEle$.prop('disable', true).attr('readonly', 'readonly');
            }
            this.initProcessSelect({'data': this.allProcessConfig('data')});
            this.initProcessStageAppSelect({'data': this.allProcessStageAppConfig('data')});

            this.mainDiv.trigger('bastionField.init');
        }
    }

    _callLinkedData(filterData) {
        const clsThis = this;
        if (clsThis.processEle.data('url-data-match')) {
            $.fn.callAjax2({
                url: clsThis.processEle.data('url-data-match') + '?' + $.param({
                    ...filterData,
                    'app_id': clsThis.app_id,
                }),
                method: 'GET',
                isLoading: true,
                loadingOpts: {
                    'html': $.fn.gettext('Retrieving Opportunity Data that has been linked to Process') + '...',
                },
            }).then(resp => {
                    const data = $.fn.switcherResp(resp);
                    if (data) {
                        const linkedData = data?.['opp_process_stage_app'];
                        clsThis.selectedFillAllData(linkedData);
                    }
                },
                (error) => {
                    if (error.status === 403)
                        clsThis.processEle.val(null).trigger("change", BastionFieldControl.skipBastionChange);
                    else console.log('error permission denied')
                })
        }
    }

    callLinkedData(from_app) {
        const clsThis = this;
        let filterData = {
            'opp_id': clsThis.oppEle.val() ? clsThis.oppEle.val() : null,
            'process_id': clsThis.processEle.val() ? clsThis.processEle.val() : null,
            'process_stage_id': clsThis.processStageAppEle$.val() ? clsThis.processStageAppEle$.val() : null,
        };

        if (from_app === 'opp') {
            filterData['opp_id'] ? clsThis._callLinkedData({
                'opp_id': filterData['opp_id']
            }) : clsThis.selectedFillAllData({});
        } else if (from_app === 'process') {
            if (filterData['opp_id']) {
                if (filterData['process_id']) {
                    clsThis._callLinkedData({
                        'process_id': filterData['process_id']
                    });
                } else {
                    const oppSelectedData = SelectDDControl.get_data_from_idx(clsThis.oppEle, filterData['opp_id']);
                    clsThis.selectedFillAllData({
                        'opp': {
                            'id': filterData['opp_id'], ...oppSelectedData,
                        },
                    })
                }
            } else {
                filterData['opp_id'] = null;
                filterData['process_stage_id'] = null;
                clsThis._callLinkedData({
                    'process_id': filterData['process_id']
                });
            }
        } else if (from_app === 'process_stage_app') {
            if (filterData['process_stage_id'] && (!filterData['opp_id'] || !filterData['process_id'])) clsThis._callLinkedData({
                'process_stage_id': filterData['process_stage_id']
            });
        }
    }

    _selectedFillAllData(linkedData) {
        const clsThis = this;
        let resolveData = {
            'opp': {},
            'process': {},
            'process_stage_app': {}, ...linkedData
        };

        // opportunity
        if (!clsThis.globalOpts?.['oppFlagData']?.['readonly']){
            clsThis.oppEle.destroySelect2();
            clsThis.oppEle.empty().initSelect2(clsThis.configOppSelect({
                data: resolveData?.['opp'] ? [
                    {
                        ...resolveData['opp'],
                        'selected': true,
                    }
                ] : []
            }));
        }

        // process
        clsThis.processEle.destroySelect2();
        clsThis.processEle.empty().initSelect2(clsThis.configProcessSelect({
            dataParams: {
                'belong_to_me': '1', ...(resolveData?.['opp']?.['id'] ? {'opp_id': resolveData?.['opp']?.['id']} : {}),
            },
            data: resolveData?.['process'] ? [
                {
                    ...resolveData['process'],
                    'selected': true,
                }
            ] : [],
        }));

        // stage app
        clsThis.processStageAppEle$.destroySelect2();
        const appId = clsThis.app_id;
        clsThis.processStageAppEle$.initSelect2(clsThis.configProcessStageAppSelect({
            dataParams: resolveData?.['process'] ? {
                'process_id': resolveData['process']['id'], ...appId && $x.fn.checkUUID4(appId) ? {'application_id': appId} : {},
            } : {},
            data: resolveData?.['process_stage_app'] ? [
                {
                    ...resolveData['process_stage_app'],
                    'selected': true,
                }
            ] : [],
        }));

        // inherit
        const oppID = clsThis.oppEle.val();
        const processID = clsThis.processEle.val();
        let dataParams = {};
        if (oppID && $x.fn.checkUUID4(oppID)) dataParams['list_from_opp'] = oppID;
        if (processID && $x.fn.checkUUID4(processID)) dataParams['process_id'] = processID;
        let dataEmpSelected = SelectDDControl.get_data_from_idx(clsThis.empInheritEle, clsThis.empInheritEle.val());
        clsThis.empInheritEle.destroySelect2();
        clsThis.empInheritEle.empty().initSelect2(clsThis.configInheritSelect({
            'data-params': dataParams,
            data: resolveData?.['opp']?.['employee_inherit'] ? [
                {
                    ...resolveData['opp']['employee_inherit'],
                    'selected': true,
                }
            ] : [],
        }));
        if (!clsThis.oppEle.val()) {
            clsThis.empInheritEle.empty().initSelect2(clsThis.configInheritSelect({
                'data-params': dataParams,
                data: dataEmpSelected ? [
                    {
                        ...dataEmpSelected,
                        'selected': true,
                    }
                ] : [],
            }));
        }
    }

    selectedFillAllData(linkedData) {
        // linkedData = {
        //     'opp': {
        //         'id': '',
        //         'title': '',
        //         'code': '',
        //     },
        //     'process': {
        //         'id': '',
        //         'title': '',
        //         'remarks': '',
        //     },
        //     'process_stage_app': {
        //         'id': '',
        //         'title': '',
        //         'remarks': '',
        //     },
        // };
        setTimeout(() => this._selectedFillAllData(linkedData), 100)
    }
}
