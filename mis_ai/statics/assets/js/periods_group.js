$(document).ready(function () {
    const trans_script_periods = $('#trans-script-periods')
    const periodEle = $('#period-select')
    let quarterFilterEle = $('#quarter-filter')
    let monthFilterEle = $('#month-filter')
    let periodQuarterEle = $('#period-quarter')
    let periodMonthEle = $('#period-month')
    const current_period_Ele = $('#current_period')
    let current_period = {}
    if (current_period_Ele.text() !== '') {
        current_period = JSON.parse(current_period_Ele.text())
        getMonthOrder(current_period)
        periodMonthEle.val(current_period?.['current_sub']?.['order']).trigger('change');
        $('#period-day-from').val(1)
        $('#period-day-to').val(get_final_date_of_current_month(
            null, null, 'DD/MM/YYYY', current_period
        ))
    }

    function LoadPeriod(data=null) {
        periodEle.initSelect2({
            ajax: {
                url: periodEle.attr('data-url'),
                method: 'GET',
            },
            callbackDataResp: function (resp, keyResp) {
                let res = []
                for (const item of resp.data[keyResp]) {
                    if (item?.['fiscal_year'] <= current_period['fiscal_year']) {
                        res.push(item)
                    }
                }
                return res
            },
            data: (data ? data : null),
            keyResp: 'periods_list',
            keyId: 'id',
            keyText: 'title',
        }).on('change', function () {
            let selected_option = SelectDDControl.get_data_from_idx(periodEle, periodEle.val())
            if (selected_option) {
                getMonthOrder(selected_option)
            }
        })
    }

    function getMonthOrder(period_data) {
        periodMonthEle.html(``)
        let subs = period_data?.['subs'] ? period_data?.['subs'] : []
        let select_data = []
        for (let i = 0; i < subs.length; i++) {
            if (moment(subs[i]?.['start_date'], 'YYYY-MM-DD') <= moment()) {
                let option_month = moment(subs[i]?.['start_date']).month() + 1
                let option_year = moment(subs[i]?.['start_date']).year()
                periodMonthEle.append(`<option value="${subs[i]?.['order']}">${trans_script_periods.attr(`data-trans-m${option_month}th`)}</option>`)
                select_data.push({
                    'id': i + 1,
                    'title': trans_script_periods.attr(`data-trans-m${option_month}th`),
                    'month': i + 1,
                    'year': option_year
                })
            }
        }
        periodMonthEle.empty();
        periodMonthEle.initSelect2({
            data: select_data,
            templateResult: function (state) {
                let monthHTML = `<div class="col-6">${state?.['text'] ? state?.['text'] : "_"}</div>`
                let yearHTML = `<div class="col-6 text-right"><span class="badge badge-outline badge-soft-danger">${state?.['data']?.['year'] ? state?.['data']?.['year'] : "_"}</span></div>`
                return $(`<div class="row">${monthHTML}${yearHTML}</div>`);
            },
        });
    }

    function get_final_date_of_current_month(filter_year, filter_month, return_format='DD/MM/YYYY', current_period=null) {
        let current_year = current_period?.['fiscal_year'];
        let current_month = current_period?.['current_sub']?.['current_month'];
        if (filter_year && filter_month) {
            current_year = filter_year;
            if (filter_month > 12) {
                current_year += Math.floor((filter_month - 1) / 12);
                filter_month = ((filter_month - 1) % 12) + 1;
            }
            current_month = filter_month;
        }
        let lastDayOfMonth = moment(`${current_year}-${current_month}`, 'YYYY-M').endOf('month');
        return lastDayOfMonth.date();
    }

    $(document).on('change', '#period-month', function () {
        let selected_option = SelectDDControl.get_data_from_idx(periodEle, periodEle.val())
        if (selected_option) {
            $('#period-day-from').val(1);
            $('#period-day-to').val(
                get_final_date_of_current_month(
                    selected_option?.['fiscal_year'], parseInt(periodMonthEle.val()) + selected_option['space_month']
                )
            );
        }
    })

    $(document).on('change', '#month-filter', function () {
        if ($(this).prop('checked')) {
            quarterFilterEle.prop('checked', !$(this).prop('checked'))
            periodQuarterEle.prop('disabled', $(this).prop('checked'))
        }
        periodMonthEle.prop('disabled', !$(this).prop('checked'))
    })

    $(document).on('change', '#quarter-filter', function () {
        if ($(this).prop('checked')) {
            monthFilterEle.prop('checked', !$(this).prop('checked'))
            periodMonthEle.prop('disabled', $(this).prop('checked'))
        }
        periodQuarterEle.prop('disabled', !$(this).prop('checked'))
    })

    LoadPeriod(current_period)
})
