$(document).ready(function () {
    /***
     * setup attribute in HTML:
     *
     * ***/
    // let $elements = document.querySelectorAll('.multi-select-filter');
    var $elements = document.querySelectorAll(".multi-select-filter");
    $elements.forEach(function (element, idx) {
        let url = $(element).attr('data-url');
        let first_data = $(element).attr('data-onload');
        let elm_name = $(element).attr('name');
        let isMulti = $(element).attr('data-multiple')
        let iPrefix = $(element).attr('data-prefix')
        $.fn.callAjax(url, 'get')
            .then((resp) => {
                let data = $.fn.switcherResp(resp);
                if (data) {
                    $(element).text("");
                    if (data[iPrefix] && Array.isArray(data[iPrefix])) {
                        if (isMulti === 'true') $(element).prop('multiple', true)
                        let temp = '';
                        data[iPrefix].map(function (item) {
                            if (first_data && first_data.indexOf(item.id) !== -1)
                                temp += `<option value="${item.id}" selected>${item.title}</option>`
                            else
                                temp += `<option value="${item.id}">${item.title}</option>`
                        })
                        $(element).append(temp)
                    }
                }

                $(element).filterMultiSelect({
                    // displayed when no options are selected
                    placeholderText: $(element).attr('data-placeholder'),

                });
                $(`#${$(element).attr('id')}`).attr('data-index', idx)
            })
    });
});