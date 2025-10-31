$(document).ready(function () {
    const $direct_first = $('#direct-first')
    const $direct_previous = $('#direct-previous')
    const $direct_next = $('#direct-next')
    const $direct_last = $('#direct-last')
    const $direct_create = $('#direct-create')
    const $direct_btn_group_url = $('#direct-btn-group-url')

    if ($direct_btn_group_url.length > 0) {
        $('#btn-group-direct').prop('hidden', false)
    }
    else {
        $('#btn-group-direct').remove()
    }

    $direct_first.on('click', function () {
        let dataParam = {
            'pageSize': 1,
            'ordering': 'date_created'
        }
        let ajax = $.fn.callAjax2({
            url: $direct_btn_group_url.attr('data-url-list-api'),
            data: dataParam,
            method: 'GET'
        }).then(
            (resp) => {
                let data = $.fn.switcherResp(resp);
                if (data && typeof data === 'object' && data.hasOwnProperty($direct_btn_group_url.attr('data-key-return'))) {
                    return data?.[$direct_btn_group_url.attr('data-key-return')];
                }
                return {};
            },
            (errs) => {
                console.log(errs);
            }
        )

        Promise.all([ajax]).then(
            (results) => {
                let data = results[0];
                if (data.length > 0) {
                    window.location.href = $direct_btn_group_url.attr('data-url-detail').replace('/0', `/${data[0].id}`);
                }
                else {
                    $.fn.notifyB({'description': 'Can not find the first record.'}, 'warning');
                }
            })
    })

    $direct_last.on('click', function () {
        let dataParam = {
            'pageSize': 1,
            'ordering': '-date_created'
        }
        let ajax = $.fn.callAjax2({
            url: $direct_btn_group_url.attr('data-url-list-api'),
            data: dataParam,
            method: 'GET'
        }).then(
            (resp) => {
                let data = $.fn.switcherResp(resp);
                if (data && typeof data === 'object' && data.hasOwnProperty($direct_btn_group_url.attr('data-key-return'))) {
                    return data?.[$direct_btn_group_url.attr('data-key-return')];
                }
                return {};
            },
            (errs) => {
                console.log(errs);
            }
        )

        Promise.all([ajax]).then(
            (results) => {
                let data = results[0];
                if (data.length > 0) {
                    window.location.href = $direct_btn_group_url.attr('data-url-detail').replace('/0', `/${data[0].id}`);
                }
                else {
                    $.fn.notifyB({'description': 'Can not find the last record.'}, 'warning');
                }
            })
    })

    $direct_previous.on('click', function () {
        let dataParam = {
            'direct_previous': true,
            'current_pk': $.fn.getPkDetail() !== "None" ? $.fn.getPkDetail() : null,
            'pageSize': 1,
            'ordering': '-date_created'
        }
        let ajax = $.fn.callAjax2({
            url: $direct_btn_group_url.attr('data-url-list-api'),
            data: dataParam,
            method: 'GET'
        }).then(
            (resp) => {
                let data = $.fn.switcherResp(resp);
                if (data && typeof data === 'object' && data.hasOwnProperty($direct_btn_group_url.attr('data-key-return'))) {
                    return data?.[$direct_btn_group_url.attr('data-key-return')];
                }
                return {};
            },
            (errs) => {
                console.log(errs);
            }
        )

        Promise.all([ajax]).then(
            (results) => {
                let data = results[0];
                if (data.length > 0) {
                    window.location.href = $direct_btn_group_url.attr('data-url-detail').replace('/0', `/${data[0].id}`);
                }
                else {
                    $.fn.notifyB({'description': 'Can not find the previous record.'}, 'warning');
                }
            })
    })

    $direct_next.on('click', function () {
        let dataParam = {
            'direct_next': true,
            'current_pk': $.fn.getPkDetail() !== "None" ? $.fn.getPkDetail() : null,
            'pageSize': 1,
            'ordering': 'date_created'
        }
        let ajax = $.fn.callAjax2({
            url: $direct_btn_group_url.attr('data-url-list-api'),
            data: dataParam,
            method: 'GET'
        }).then(
            (resp) => {
                let data = $.fn.switcherResp(resp);
                if (data && typeof data === 'object' && data.hasOwnProperty($direct_btn_group_url.attr('data-key-return'))) {
                    return data?.[$direct_btn_group_url.attr('data-key-return')];
                }
                return {};
            },
            (errs) => {
                console.log(errs);
            }
        )

        Promise.all([ajax]).then(
            (results) => {
                let data = results[0];
                if (data.length > 0) {
                    window.location.href = $direct_btn_group_url.attr('data-url-detail').replace('/0', `/${data[0].id}`);
                }
                else {
                    $.fn.notifyB({'description': 'Can not find the next record.'}, 'warning');
                }
            })
    })

    $direct_create.on('click', function () {
        if ($direct_btn_group_url.attr('data-url-create')) {
            window.location.href = $direct_btn_group_url.attr('data-url-create')
        }
        else {
            $.fn.notifyB({'description': 'Can not find the create new doc URL.'}, 'warning');
        }
    })
})
