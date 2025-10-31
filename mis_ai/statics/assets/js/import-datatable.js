$(document).ready(function () {
    const $trans_db_script = $('#import-db-trans-script')
    const $import_db_form_cfg = JSON.parse($('#import_db_form_cfg').text().trim())
    const $list_import_db = $import_db_form_cfg?.['list_import_db'] ? $import_db_form_cfg?.['list_import_db'] : []
    const $btn_group_import_datatable = $('.btn-group-import-datatable')
    const $import_db_form = $('#import-db-form')
    const $import_db_form_select_table = $('#modal-import-datatable-from-excel .import-db-form-select-table')
    const $import_db_form_modal_table = $('#modal-import-datatable-from-excel .import-db-form-modal-table')
    const $import_from_index_ele = $('#modal-import-datatable-from-excel .from-index')
    const $import_to_index_ele = $('#modal-import-datatable-from-excel .to-index')
    const $import_progress_bar = $('#modal-import-datatable-from-excel .progress-bar')
    let PREVIEW_TABLE = null
    let SELECTED_FILE = null
    let THIS_IMPORT_SPACE = null
    let APPLY_ALL_CREATE_NEW_LIST = []
    let APPLY_ALL_GET_OLD_LIST = []

    function excelDateToJSDate(excelDate) {
        if (Number(excelDate)) {
            const date = new Date((Number(excelDate) - 25569) * 86400000);
            return date.toISOString().split('T')[0];
        }
        else if (moment(excelDate, 'YYYY-MM-DD') !== 'Invalid date') {
            return excelDate;
        }
        else if (moment(excelDate, 'YYYY/MM/DD') !== 'Invalid date') {
            return moment(excelDate, 'YYYY/MM/DD').format('YYYY-MM-DD');
        }
        else if (moment(excelDate, 'DD-MM-YYYY') !== 'Invalid date') {
            return moment(excelDate, 'DD-MM-YYYY').format('YYYY-MM-DD');
        }
        else if (moment(excelDate, 'DD/MM/YYYY') !== 'Invalid date') {
            return moment(excelDate, 'DD/MM/YYYY').format('YYYY-MM-DD');
        }
        return ''
    }

    $btn_group_import_datatable.on('click', function () {
        THIS_IMPORT_SPACE = $(this).closest('.import-db-space')
        let target_table_id = null
        THIS_IMPORT_SPACE.find('table').each(function () {
            if (!target_table_id) {
                target_table_id = $(this).attr('id')
            } else {
                return false
            }
        })

        for (let i = 0; i < $list_import_db.length; i++) {
            if ($list_import_db[i]?.['map_with'] === target_table_id) {
                let option = $list_import_db[i]?.['option'] ? $list_import_db[i]?.['option'] : []
                if (option.includes(0)) {
                    $('.btn-import-datatable-from-excel').prop('hidden', false)
                }
                if (option.includes(1)) {
                    $('.btn-load-datatable-from-excel').prop('hidden', false)
                }
                if (option.includes(2)) {
                    $('.btn-export-datatable-to-excel').prop('hidden', false)
                }
            }
        }
    })

    $('#modal-import-datatable-from-excel .import-db-form-input-file').on('change', function () {
        SELECTED_FILE = event.target.files[0];
    });

    $('#modal-import-datatable-from-excel .import-db-form-load-file-btn').on('click', function () {
        if (SELECTED_FILE && $import_db_form_select_table.val()) {
            const reader = new FileReader();

            $('#modal-import-datatable-from-excel .progress-container').prop('hidden', false)
            $import_progress_bar.css('width', '0%').attr('aria-valuenow', 0); // Đặt về 0%

            // Cập nhật thanh progress khi tệp đang được đọc
            reader.onprogress = function (event) {
                if (event.lengthComputable) {
                    const progress = Math.round((event.loaded / event.total) * 100);

                    // Cập nhật giao diện thanh progress
                    $import_progress_bar.css('width', progress + '%').attr('aria-valuenow', progress);
                }
            };

            reader.onload = function (event) {
                const data = new Uint8Array(event.target.result);
                const workbook = XLSX.read(data, {type: 'array'});

                const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
                const rows = XLSX.utils.sheet_to_json(firstSheet, {header: 1});

                displayExcelData(
                    rows,
                    $import_from_index_ele.val(),
                    $import_to_index_ele.val(),
                    $import_db_form_select_table.attr('data-col-type').split(','),
                    $import_db_form_select_table.attr('data-format') ? JSON.parse($import_db_form_select_table.attr('data-format'))?.['value_list'] : [],
                );

                // Sau khi load xong, thanh progress đạt 100%
                $import_progress_bar.css('width', '100%').attr('aria-valuenow', '100');
                setTimeout(
                    () => {
                        $('#modal-import-datatable-from-excel .progress-container').prop('hidden', true)
                    },
                    1000
                )
            };

            reader.onerror = function () {
                alert('Error reading file');
                // Nếu có lỗi, ẩn thanh progress
                $.fn.notifyB({description: "File is loaded error!"}, 'failure')
            };

            reader.readAsArrayBuffer(SELECTED_FILE);
        } else {
            if (!SELECTED_FILE) {
                $.fn.notifyB({description: 'Please select a FILE first!'}, 'warning');
            }
            if (!$import_db_form_select_table.val()) {
                $.fn.notifyB({description: 'Please select a TABLE first!'}, 'warning');
            }
        }
    })

    $('.btn-import-datatable-from-excel').on('click', function () {
        $('#modal-import-datatable-from-excel-warning').modal('show')

        $import_db_form.attr('data-method', THIS_IMPORT_SPACE.find('.import-db-form-url').attr('data-import-db-method'))
        $import_db_form.attr('data-url', THIS_IMPORT_SPACE.find('.import-db-form-url').attr('data-import-db-url'))

        let target_table_id = null
        THIS_IMPORT_SPACE.find('table').each(function () {
            if (!target_table_id) {
                target_table_id = $(this).attr('id')
            } else {
                return false
            }
        })
        let tableEle_item = null
        for (let i = 0; i < $list_import_db.length; i++) {
            if ($list_import_db[i]?.['map_with'] === target_table_id) {
                tableEle_item = $list_import_db[i]
            }
        }
        if (tableEle_item) {
            $import_db_form_select_table.val(tableEle_item?.['name'])
            $import_db_form_select_table.attr('data-col-type', tableEle_item?.['col_type'])
            $import_db_form_select_table.attr('data-format', JSON.stringify(tableEle_item?.['data_format']))

            let tableEle = $(`table[data-table-id="${tableEle_item?.['id']}"]`)
            $import_db_form_modal_table.html(tableEle)
            $import_db_form_modal_table.find('table').attr('id', tableEle.attr('data-table-id')).prop('hidden', false)
            PREVIEW_TABLE = $import_db_form_modal_table.find('table')
            let col_order_list = []
            PREVIEW_TABLE.find('thead tr th').each(function () {
                col_order_list.push($(this).text())
            })
            $('.col-order-list').text(col_order_list.slice(2).join(' > '))
        }
    })

    function displayExcelData(data, from_index_value, to_index_value, col_type, data_format) {
        if (data.length > 1) {
            const limit_request_per_min = 150
            let from_index = from_index_value ? parseInt(from_index_value) : null
            let to_index = to_index_value ? parseInt(to_index_value) : null
            if (to_index >= data.length) {
                to_index = data.length - 1
            }

            if (from_index && to_index && (to_index - from_index + 1) <= limit_request_per_min) {
                PREVIEW_TABLE.find('tbody').html('')

                for (let i = from_index; i <= to_index; i++) {
                    let tds = ``
                    for (let j = 0; j < col_type.length; j++) {
                        console.log(data_format[j]?.['data_fixed_key'])
                        if (col_type[j] === 'input-text') {
                            tds += `<td style="min-width: 250px"><input class="form-control" value="${data[i][j] || ''}"></td>`
                        } else if (col_type[j] === 'input-date') {
                            tds += `<td style="min-width: 250px"><input class="form-control date-field" value="${data[i][j] ? excelDateToJSDate(data[i][j]) : ''}" placeholder="YYYY-MM-DD"></td>`
                        } else if (col_type[j] === 'input-money') {
                            tds += `<td style="min-width: 250px"><input class="form-control mask-money text-right" value="${data[i][j] || 0}"></td>`
                        } else if (col_type[j] === 'input-money(disabled)') {
                            tds += `<td style="min-width: 250px"><input disabled readonly class="form-control mask-money text-right" value="${data[i][j] || 0}"></td>`
                        } else if (col_type[j] === 'input-number') {
                            tds += `<td style="min-width: 200px"><input type="number" class="form-control text-right" value="${data[i][j] || 0}"></td>`
                        } else if (col_type[j] === 'select') {
                            tds += `<td style="min-width: 250px">
                                <select class="form-select select2">
                                    <option selected>${data[i][j] || ''}</option>
                                </select>
                            </td>`
                        } else if (col_type[j] === 'span') {
                            tds += `<td style="min-width: 250px"><span>${data[i][j] || ''}</span></td>`
                        } else if (col_type[j] === 'span-money') {
                            tds += `<td class="text-right" style="min-width: 250px"><span class="mask-money" data-init-money="${data[i][j] || 0}"></span></td>`
                        } else if (col_type[j] === 'textarea') {
                            tds += `<td style="min-width: 300px"><textarea class="form-control small">${data[i][j] || ''}</textarea></td>`
                        } else if (col_type[j] === 'checkbox') {
                            tds += `<td style="min-width: 100px"><input type="checkbox" class="form-check" ${data[i][j] ? 'checked' : ''}></td>`
                        } else if (col_type[j] === 'list') {
                            tds += `<td style="min-width: 250px"><textarea class="form-control json-input" data-fixed-key='${JSON.stringify(data_format[j]?.['data_fixed_key'] || "[]")}'>${data[i][j] || "[]"}</textarea></td>`
                        } else if (col_type[j] === 'json') {
                            tds += `<td style="min-width: 250px"><textarea class="form-control json-input" data-fixed-key='${JSON.stringify(data_format[j]?.['data_fixed_key'] || "[]")}'>${data[i][j] || "{}"}</textarea></td>`
                        } else {
                            tds += `<td>-</td>`
                        }
                    }
                    PREVIEW_TABLE.find('tbody').append(`<tr>
                        <td style="min-width: 80px">
                            ${i - from_index + 1}
                            <button hidden type="button" class="btn btn-sm btn-icon btn-flush-secondary flush-soft-hover btn-rounded btn-del-row-import-db">
                                <span class="btn-icon-wrap">
                                    <span class="feather-icon">
                                        <i class="fas fa-trash-alt"></i>
                                    </span>
                                </span>
                            </button>
                        </td>
                        <td style="min-width: 100px">
                            <i hidden class="status-ok text-success fw-bold fas fa-check-circle"></i>
                            <span class="small err-title"></span>
                        </td>
                        ${tds}
                    </tr>`)
                    $.fn.initMaskMoney2()
                }
            }
            else {
                $.fn.notifyB({description: `FromX or ToY is missing. Row number is limited at ${limit_request_per_min} (current: ${to_index - from_index + 1})!`}, 'warning')
            }
        } else {
            $.fn.notifyB({description: "File is empty!"}, 'warning')
        }
    }

    function combinesDataImportDB(row, target_table, create_new_list = [], get_old_list = []) {
        // prepare data
        let col_type = target_table.attr('data-col-type').split(',')
        let col_data_format_string = target_table.attr('data-format')
        let col_data_format = col_data_format_string ? JSON.parse(col_data_format_string) : {}
        let key = col_data_format?.['key']
        let value_list = col_data_format?.['value_list']
        let data_combined = {}
        data_combined[key] = {}
        data_combined['create_new_list'] = create_new_list
        data_combined['get_old_list'] = get_old_list
        for (let i = 0; i < value_list.length; i++) {
            let col_index = parseInt(value_list[i]['col_index'])
            if (col_index >= 0) {
                if (col_type[col_index] === 'input-text') {
                    data_combined[key][value_list[i]['col_key']] = row.find(`td:eq(${col_index + 2}) input`).val() || null
                } else if (col_type[col_index] === 'input-date') {
                    data_combined[key][value_list[i]['col_key']] = row.find(`td:eq(${col_index + 2}) input`).val() || null
                } else if (col_type[col_index] === 'input-money') {
                    data_combined[key][value_list[i]['col_key']] = row.find(`td:eq(${col_index + 2}) input`).attr('value') || null
                } else if (col_type[col_index] === 'input-money(disabled)') {
                    data_combined[key][value_list[i]['col_key']] = row.find(`td:eq(${col_index + 2}) input`).attr('value') || null
                } else if (col_type[col_index] === 'input-number') {
                    data_combined[key][value_list[i]['col_key']] = row.find(`td:eq(${col_index + 2}) input`).val() || null
                } else if (col_type[col_index] === 'select') {
                    data_combined[key][value_list[i]['col_key']] = row.find(`td:eq(${col_index + 2}) select option:eq(0)`).val() || null
                } else if (col_type[col_index] === 'span') {
                    data_combined[key][value_list[i]['col_key']] = row.find(`td:eq(${col_index + 2}) span`).text() || null
                } else if (col_type[col_index] === 'span-money') {
                    data_combined[key][value_list[i]['col_key']] = row.find(`td:eq(${col_index + 2}) span`).attr('data-init-money') || null
                } else if (col_type[col_index] === 'textarea') {
                    data_combined[key][value_list[i]['col_key']] = row.find(`td:eq(${col_index + 2}) textarea`).val() || null
                } else if (col_type[col_index] === 'checkbox') {
                    data_combined[key][value_list[i]['col_key']] = row.find(`td:eq(${col_index + 2}) input`).prop('checked')
                } else if (col_type[col_index] === 'list') {
                    data_combined[key][value_list[i]['col_key']] = row.find(`td:eq(${col_index + 2}) textarea`).val() ? JSON.parse(row.find(`td:eq(${col_index + 2}) textarea`).val()) : []
                } else if (col_type[col_index] === 'json') {
                    data_combined[key][value_list[i]['col_key']] = row.find(`td:eq(${col_index + 2}) textarea`).val() ? JSON.parse(row.find(`td:eq(${col_index + 2}) textarea`).val()) : {}
                }
            } else {
                if (col_index === -1) {
                    data_combined[key][value_list[i]['col_key']] = value_list[i]['data_default'] || null
                } else if (col_index === -2) {
                    if (value_list[i]['get_value'] && !value_list[i]['get_text'] && value_list[i]['get_attr'] === '') {
                        data_combined[key][value_list[i]['col_key']] = $(value_list[i]['ele_id']).val() || null
                    }
                    else if (!value_list[i]['get_value'] && value_list[i]['get_text'] && value_list[i]['get_attr'] === '') {
                        data_combined[key][value_list[i]['col_key']] = $(value_list[i]['ele_id']).text() || null
                    }
                    else if (!value_list[i]['get_value'] && !value_list[i]['get_text'] && value_list[i]['get_attr'] !== '') {
                        data_combined[key][value_list[i]['col_key']] = $(value_list[i]['ele_id']).attr(value_list[i]['get_attr']) || null
                    }
                }
            }
        }
        return data_combined
    }

    async function processRow(row, frm, data_combined, type, row_order) {
        let data = {
            url: frm.dataUrl,
            method: frm.dataMethod,
            data: data_combined,
            urlRedirect: frm.dataUrlRedirect,
        };

        try {
            let resp = await $.fn.callAjax2(data);  // Đợi AJAX hoàn tất
            let resultData = $.fn.switcherResp(resp);

            if (resultData) {
                $('.importing-row').text((row_order+1).toString() + ' /')
                let import_data_rows = THIS_IMPORT_SPACE.find('.import_data_rows');
                let old_rows = import_data_rows.text() ? JSON.parse(import_data_rows.text()) : [];
                old_rows.push(resultData?.['import_data_row']);
                import_data_rows.text(JSON.stringify(old_rows));
                row.find('.status-ok').prop('hidden', false);
                row.find('.err-title').prop('hidden', true);
                row.addClass('bg-success-light-5');
                return true
            }
        } catch (errs) {
            row.find('.status-ok').prop('hidden', true);
            row.find('.err-title').prop('hidden', false);
            row.addClass('bg-danger-light-5');

            if (type === 'import') {
                for (let key in errs.data ? errs.data.errors : {}) {
                    row.find('.err-title').text(errs.data.errors[key]).removeClass('text-warning').addClass('text-danger');
                }
                Swal.fire({
                    html: `<h5 class="text-danger">${$trans_db_script.attr('data-trans-err')}</h5>`,
                });
                $.fn.notifyB({description: errs.data.errors}, 'failure');
                return false
            } else if (type === 'load') {
                let err_key = ''
                let err_message = ''
                for (let key in errs.data ? errs.data.errors : {}) {
                    row.find('.err-title').text(errs.data.errors[key]).removeClass('text-danger').addClass('text-warning');
                    err_key = key
                    err_message = errs.data.errors[key]
                }
                $.fn.notifyB({description: errs.data.errors}, 'warning');
                let result = await Swal.fire({
                    showCancelButton: true,
                    showConfirmButton: true,
                    confirmButtonText: $trans_db_script.attr('data-trans-continue'),
                    cancelButtonText: $trans_db_script.attr('data-trans-cancel'),
                    html: `
                    <h5 class="text-left text-warning">${err_message}</h5>
                    <div class="hr border my-3"></div>
                    <div class="text-left">
                        <div class="form-check form-check-sm">
                            <input type="radio" name="select-data-option" class="form-check-input" id="create-new">
                            <label class="form-check-label" for="create-new">${$trans_db_script.attr('data-trans-create-new')}</label>
                        </div>
                    </div>
                    <div class="text-left">
                        <div class="form-check form-check-sm">
                            <input type="radio" name="select-data-option" class="form-check-input" id="use-old">
                            <label class="form-check-label" for="use-old">${$trans_db_script.attr('data-trans-use-old')}</label>
                        </div>
                    </div>
                    <div class="hr border my-3"></div>
                    <div class="text-left">
                        <div class="form-check form-check-sm">
                            <input type="checkbox" class="form-check-input" id="apply-all">
                            <label class="form-check-label" for="apply-all">${$trans_db_script.attr('data-trans-apply-all')}</label>
                        </div>
                    </div>`,
                });
                if (result.isConfirmed) {
                    if ($('#create-new').prop('checked') || $('#use-old').prop('checked')) {
                        if ($('#create-new').prop('checked')) {
                            if (!data_combined['create_new_list'].includes(err_key)) {
                                data_combined['create_new_list'].push(err_key)
                            }
                        }
                        if ($('#use-old').prop('checked')) {
                            if (!data_combined['get_old_list'].includes(err_key)) {
                                data_combined['get_old_list'].push(err_key)
                            }
                        }
                        if ($('#apply-all').prop('checked')) {
                            APPLY_ALL_CREATE_NEW_LIST = data_combined['create_new_list']
                            APPLY_ALL_GET_OLD_LIST = data_combined['get_old_list']
                        }
                        return await processRow(row, frm, data_combined, type)
                    }
                    $.fn.notifyB({description: $trans_db_script.attr('data-trans-select-one')}, 'failure')
                }
                return false
            }
        }
    }

    async function processAllRows(form, table_data, type = 'import') {
        let frm = new SetupFormSubmit(form);
        $('.all-row').text(PREVIEW_TABLE.find('tbody tr').length)
        PREVIEW_TABLE.find('tbody tr input').prop('disabled', true).prop('readonly', true)
        // Duyệt qua từng hàng và đợi từng AJAX hoàn tất trước khi tiếp tục, nếu gặp lỗi thì ngừng
        for (let i = 0; i < PREVIEW_TABLE.find('tbody tr').length; i++) {
            let row = PREVIEW_TABLE.find('tbody tr').eq(i);  // Lấy hàng hiện tại
            if (row.find('.status-ok').prop('hidden')) {
                let data_combined = combinesDataImportDB(
                    row, table_data, APPLY_ALL_CREATE_NEW_LIST, APPLY_ALL_GET_OLD_LIST
                )
                let status = await processRow(row, frm, data_combined, type, i);   // Đợi AJAX hoàn thành cho từng hàng
                if (status === false) {
                    $('#modal-import-datatable-from-excel .modal-footer button').prop('hidden', false)
                    return false
                }
            }
        }
        return true
    }

    $import_db_form.submit(function (event) {
        event.preventDefault();
        Swal.fire({
            title: `<h5 class="text-muted">${$trans_db_script.attr('data-trans-start-import')}</h5><h6 class="text-danger mt-3">${$trans_db_script.attr('data-trans-start-import-noty')}</h6>`,
            showCancelButton: false,
            confirmButtonText: 'OK',
        }).then(async (result) => {
            if (result.isConfirmed) {
                $('#modal-import-datatable-from-excel .modal-footer button').prop('hidden', true)
                // Gọi hàm xử lý tất cả các hàng
                let all_success = await processAllRows($import_db_form, $import_db_form_select_table, 'import').then();
                if (all_success) {
                    $('#modal-import-datatable-from-excel .modal-footer button').prop('hidden', false)
                    Swal.fire({
                        html: `<h5 class="text-success">${$trans_db_script.attr('data-trans-done')}</h5>
                               <h6 class="text-muted">${$trans_db_script.attr('data-trans-reload')}</h6>`,
                    }).then((result) => {
                        if (result.isConfirmed) {
                            location.reload()
                        }
                    });
                }
            }
        })
    })

    $(document).on('mouseenter', '.import-db-form-modal-table table tbody tr', function () {
        $(this).addClass('bg-secondary-light-5')
        $(this).find('td:eq(0) .btn-del-row-import-db').prop('hidden', false);
    }).on('mouseleave', '.import-db-form-modal-table table tbody tr', function () {
        $(this).removeClass('bg-secondary-light-5')
        $(this).find('td:eq(0) .btn-del-row-import-db').prop('hidden', true);
    });

    $(document).on('click', '.btn-del-row-import-db', function () {
        let this_table = $(this).closest('table')
        $(this).closest('tr').remove()
        this_table.find('tbody tr').each(function (idx, ele) {
            $(this).find('td:eq(0)').html(`
                ${idx + 1}
                <button hidden type="button" class="btn btn-sm btn-icon btn-flush-secondary flush-soft-hover btn-rounded btn-del-row-import-db">
                    <span class="btn-icon-wrap">
                        <span class="feather-icon">
                            <i class="fas fa-trash-alt"></i>
                        </span>
                    </span>
                </button>
            `);
        })
    })


    // load data
    const $load_db_form = $('#load-db-form')
    const $load_db_form_select_table = $('#modal-load-datatable-from-excel .import-db-form-select-table')
    const $load_db_form_modal_table = $('#modal-load-datatable-from-excel .import-db-form-modal-table')
    const $load_from_index_ele = $('#modal-load-datatable-from-excel .from-index')
    const $load_to_index_ele = $('#modal-load-datatable-from-excel .to-index')
    const $load_progress_bar = $('#modal-load-datatable-from-excel .progress-bar')

    $('#modal-load-datatable-from-excel .import-db-form-input-file').on('change', function () {
        SELECTED_FILE = event.target.files[0];
    });

    $('#modal-load-datatable-from-excel .import-db-form-load-file-btn').on('click', function () {
        if (SELECTED_FILE && $load_db_form_select_table.val()) {
            const reader = new FileReader();

            $('#modal-load-datatable-from-excel .progress-container').prop('hidden', false)
            $load_progress_bar.css('width', '0%').attr('aria-valuenow', 0); // Đặt về 0%

            // Cập nhật thanh progress khi tệp đang được đọc
            reader.onprogress = function (event) {
                if (event.lengthComputable) {
                    const progress = Math.round((event.loaded / event.total) * 100);

                    // Cập nhật giao diện thanh progress
                    $load_progress_bar.css('width', progress + '%').attr('aria-valuenow', progress);
                }
            };

            reader.onload = function (event) {
                const data = new Uint8Array(event.target.result);
                const workbook = XLSX.read(data, {type: 'array'});

                const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
                const rows = XLSX.utils.sheet_to_json(firstSheet, {header: 1});

                displayExcelData(
                    rows,
                    $load_from_index_ele.val(),
                    $load_to_index_ele.val(),
                    $load_db_form_select_table.attr('data-col-type').split(','),
                    $load_db_form_select_table.attr('data-format') ? JSON.parse($load_db_form_select_table.attr('data-format'))?.['value_list'] : [],
                );

                // Sau khi load xong, thanh progress đạt 100%
                $load_progress_bar.css('width', '100%').attr('aria-valuenow', '100');
                setTimeout(
                    () => {
                        $('#modal-load-datatable-from-excel .progress-container').prop('hidden', true)
                    },
                    1000
                )
            };

            reader.onerror = function () {
                alert('Error reading file');
                // Nếu có lỗi, ẩn thanh progress
                $.fn.notifyB({description: "File is loaded error!"}, 'failure')
            };

            reader.readAsArrayBuffer(SELECTED_FILE);
        } else {
            if (!SELECTED_FILE) {
                $.fn.notifyB({description: 'Please select a FILE first!'}, 'warning');
            }
            if (!$load_db_form_select_table.val()) {
                $.fn.notifyB({description: 'Please select a TABLE first!'}, 'warning');
            }
        }
    })

    $('.btn-load-datatable-from-excel').on('click', function () {
        $load_db_form.attr('data-method', THIS_IMPORT_SPACE.find('.import-db-form-url').attr('data-import-db-method'))
        $load_db_form.attr('data-url', THIS_IMPORT_SPACE.find('.import-db-form-url').attr('data-import-db-url'))

        let target_table_id = null
        THIS_IMPORT_SPACE.find('table').each(function () {
            if (!target_table_id) {
                target_table_id = $(this).attr('id')
            } else {
                return false
            }
        })

        let tableEle_item = null
        for (let i = 0; i < $list_import_db.length; i++) {
            if ($list_import_db[i]?.['map_with'] === target_table_id) {
                tableEle_item = $list_import_db[i]
            }
        }
        if (tableEle_item) {
            $load_db_form_select_table.val(tableEle_item?.['name'])
            $load_db_form_select_table.attr('data-col-type', tableEle_item?.['col_type'])
            $load_db_form_select_table.attr('data-format', JSON.stringify(tableEle_item?.['data_format']))

            let tableEle = $(`table[data-table-id="${tableEle_item?.['id']}"]`)
            $load_db_form_modal_table.html(tableEle)
            $load_db_form_modal_table.find('table').attr('id', tableEle.attr('data-table-id')).prop('hidden', false)
            PREVIEW_TABLE = $load_db_form_modal_table.find('table')
        }
    })

    $load_db_form.submit(async function (event) {
        event.preventDefault();

        // Gọi hàm xử lý tất cả các hàng
        let all_success = await processAllRows($load_db_form, $load_db_form_select_table, 'load').then();
        if (all_success) {
            Swal.fire({
                html: `<h5 class="text-success">${$trans_db_script.attr('data-trans-done')}</h5>`,
            });
        }
    })
})
