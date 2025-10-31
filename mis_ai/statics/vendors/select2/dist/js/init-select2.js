/***
 * initSelectBox() is using for select dropdown
 * @class {string} dropdown-select_two - class name of select element needed
 * @data-attribute:
 * + multiple="true" => set combobox is multiple
 * + prefix="application_property_list" => object key of response return
 * + url="{% url 'ApplicationPropertyListAPI' %}"
 * + params="{name: value}"
 * + onload={id="", title="name"}
 * @param selectBoxElement: element of select
 *@note
 * +++++++++ select2 on change
 *     selectbox.on("select2:select", function (e) {
 *          let item = e.params.data
 *     });
 *     @variable e.params.data: full data of select store
 *---------------------------------------------------------------------
 * +++++++++ setup select2 with info icon
 * step 1: append HTML with format follow there code bellow
 * ==> <div class="input-group">
 *         <div class="input-affix-wrapper">
 *             <div class="dropdown input-prefix">
 *                 <i class="fas fa-info-circle"
 *                    data-bs-toggle="dropdown"
 *                    data-dropdown-animation
 *                    aria-haspopup="true"
 *                    aria-expanded="false"
 *                    disabled></i>
 *                 <div class="dropdown-menu w-210p mt-2"></div>
 *             </div>
 *             <select name="customer_per" id="form-create-customer_per"
 *                     class="form-select dropdown-select_two"
 *                     data-url="{% url "EmployeeListAPI" %}"
 *                     data-prefix="employee_list"
 *                     data-link-detail="{% url 'EmployeeDetail' 1 %}"
 *                     data-template-format="[{'name':'Title', 'value': 'title'},{'name':'Code', 'value': 'code'}]"
 *             ></select>
 *       </div>
 * step 2: make sure 2 attribute is added to select tag HTML
 *  ==> link-detail="{% url 'EmployeeDetail' 1 %}"
 *  ==> template-format="[{'name':'Title', 'value': 'title'},{'name':'Code', 'value': 'code'}]"
 *
 *  ALL DONE !!!
 *  --------------------------------------------------------------------------------------------------
 * other callback
 * select2:unselect: được gọi khi một mục bị hủy chọn.
 * select2:open: được gọi khi mở danh sách chọn.
 * select2:close: được gọi khi đóng danh sách chọn.
 * select2:clear: được gọi khi xóa tất cả các mục đã chọn.
 */
function initSelectBox(selectBoxElement = null) {
    let $select_box = selectBoxElement
    if (selectBoxElement === null)
        $select_box = $(".dropdown-select_two");

    $select_box.each(function () {
        let $this = $(this)

        // check if element has default data
        let default_data = $this.attr('data-onload')
        if (default_data && default_data.length) {
            if (typeof default_data === 'string') {
                let temp = default_data.replaceAll("'", '"')
                default_data = temp
                try {
                    default_data = JSON.parse(default_data)
                } catch (e) {
                    console.log('Warning: ', $this.attr('id'), ' parse data onload is error with this error', e)
                }
            }
            if (default_data){
                if (Array.isArray(default_data)){
                    let htmlTemp = ''
                    for (let item of default_data){
                        let name = item?.title
                        if (item?.fist_name && item?.last_name)
                            name = `${item.last_name}. ${item.fist_name}`
                        htmlTemp += `<option value="${item.id}" selected>${name}</option>`
                    }
                    $this.html(htmlTemp)
                }
                else{
                    let name = default_data.title;
                    if (default_data.first_name && default_data.last_name)
                        name = `${default_data.last_name}. ${default_data.first_name}`
                    $this.html(`<option value="${default_data.id}" selected>${name}</option>`)
                }
            }
        }
        let $thisURL = $this.attr('data-url')
        // init select2
        let options = {
            ajax: {
                url: $thisURL,
                headers: {
                    "ENABLEXCACHECONTROL": true
                },
                data: function (params) {
                    let query = params
                    query.isDropdown = true
                    if (params.term) query.search = params.term
                    query.page = params.page || 1
                    query.pageSize = params.pageSize || 10
                    if ($this.attr('data-params')) {
                        let strParams = $this.attr('data-params').replaceAll("'",'"')
                        let data_params = JSON.parse(strParams);
                        query = {...query, ...data_params}
                    }
                    return query
                },
                processResults: function (res, params) {
                    let data_original = res.data[$this.attr('data-prefix')];
                    let data_convert = []
                    if (data_original.length) {
                        for (let item of data_original) {
                            let text = 'title';
                            if ($this.attr('data-format'))
                                text = $this.attr('data-format')
                            else if(item.hasOwnProperty('full_name')) text = 'full_name';
                            try{
                                if (default_data && default_data.hasOwnProperty('id') && default_data.id === item.id)
                                    data_convert.push({...item, 'text': item[text], 'selected': true})
                                else data_convert.push({...item, 'text': item[text]})
                            }
                            catch (e) {
                                console.log(e)
                            }
                        }
                        if ($this.attr('data-virtual') !== undefined
                            && $this.attr('data-virtual') !== ''
                            && $this.attr('data-virtual') !== "[]")
                            data_convert.push(JSON.parse($this.attr('data-virtual')))
                    }
                    params.page = params.page || 1;
                    return {
                        results: data_convert,
                        pagination: {
                            more: (params.page * 10) < res?.data?.page_count // Calculate if there are more pages
                        }
                    };
                }
            },
            multiple: false,
            tags:false,
            closeOnSelect: !!$this.attr('data-select2-closeOnSelect'),
            language: {
                loadingMore: function () {
                    return $.fn.transEle.attr('data-select2-loadmore'); // Replace with your translated text
                }
            }
        }
        if ($this.attr('data-multiple') === 'true'){
            options['multiple'] = true
            options['allowClear'] = true
            options['tags'] = true
            $this.prop('multiple', true)
        }
        // if ($this.attr('readonly')) options['disabled'] = true

        // run select2
        $this.select2(options)
        if($this.attr('data-template-format')){
            $this.on("select2:select", function (e) {
                $this.parents('.input-affix-wrapper').find('.dropdown i').attr('disabled', false)
                optOnSelected($this, e.params.data)
            })
            if ($this.attr('data-onload')){
                let dataOnload = JSON.parse($this.attr('data-onload').replace(/'/g, '"'));
                $this.parents('.input-affix-wrapper').find('.dropdown i').attr('disabled', false)
                optOnSelected($this, dataOnload)
            }
        }
    });
}

// on change when select2 has info icon
function optOnSelected($elm, data){
    let keyArg = [
        {name: 'Title', value: 'title'},
        {name: 'Code', value: 'code'},
    ];
    const templateFormat = $elm.attr('data-template-format');
    if (templateFormat) {
        keyArg = JSON.parse(templateFormat.replace(/'/g, '"'));
    }
    let linkDetail = $elm.data('link-detail');
    let $elmTrans = $('#base-trans-factory');
    let htmlContent = `<h6 class="dropdown-header header-wth-bg">${$elmTrans.attr('data-more-info')}</h6>`;
    for (let key of keyArg) {
        if (data.hasOwnProperty(key.value))
            htmlContent += `<div class="row mb-1"><h6><i>${key.name}</i></h6><p>${data[key.value]}</p></div>`;
    }
    if (linkDetail) {
        link = linkDetail.format_url_with_uuid(data['id']);
        htmlContent += `<div class="dropdown-divider"></div><div class="text-right">
            <a href="${link}" target="_blank" class="link-primary underline_hover">
                <span>${$elmTrans.attr('data-view-detail')}</span>
                <span class="icon ml-1">
                    <i class="bi bi-arrow-right-circle-fill"></i>
                </span>
            </a></div>`;
    };
    $elm.parents('.input-affix-wrapper').find('.dropdown-menu').html(htmlContent);
}


$(document).ready(function () {
    initSelectBox();
});