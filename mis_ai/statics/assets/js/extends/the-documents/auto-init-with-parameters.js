$(document).ready(function () {
    const {
        opp_id,
        opp_title,
        opp_code,
        process_id,
        process_title,
        process_stage_app_id,
        process_stage_app_title,
        inherit_id,
        inherit_title,
    } = $x.fn.getManyUrlParameters([
        'opp_id', 'opp_title', 'opp_code',
        'process_id', 'process_title',
        'process_stage_app_id', 'process_stage_app_title',
        'inherit_id', 'inherit_title',
    ])

    let $employeeEle = $('#employee_inherit_id');
    let dataEmployeeCurrent = [];
    if ($employeeEle.length > 0) {
        if ($employeeEle.attr('data-onload')) {
            dataEmployeeCurrent = JSON.parse($employeeEle.attr('data-onload'));
        }
    }

    new $x.cls.bastionField({
        has_opp: true,
        has_inherit: true,
        has_process: true,
        has_prj: true,
        data_opp: $x.fn.checkUUID4(opp_id) ? [
            {
                "id": opp_id,
                "title": $x.fn.decodeURI(opp_title),
                "code": $x.fn.decodeURI(opp_code),
                "selected": true,
            }
        ] : [],
        data_process: $x.fn.checkUUID4(process_id) ? [
            {
                "id": process_id,
                "title": process_title,
                "selected": true,
            }
        ] : [],
        data_process_stage_app: $x.fn.checkUUID4(process_stage_app_id) ? [
            {
                "id": process_stage_app_id,
                "title": process_stage_app_title,
                "selected": true,
            }
        ] : [],
        data_inherit: $x.fn.checkUUID4(inherit_id) ? [
            {
                "id": inherit_id,
                "full_name": inherit_title,
                "selected": true,
            }
        ] : dataEmployeeCurrent,
    }).init();
})