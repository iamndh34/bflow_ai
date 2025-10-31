class FileFilterHandle {
    static $btnFilter = $('#open-file-filter');
    static $canvas = $('#fileFilterCanvas');
    static $btnApply = $('#apply-file-filter');

    static $transEle = $('#app-trans-factory');
    static $urlEle = $('#app-url-factory');

    static initCanvas() {
        let docTypeEle = FileFilterHandle.$canvas[0].querySelector('.file_attr_document_type');
        let contentGrEle = FileFilterHandle.$canvas[0].querySelector('.file_attr_content_group');
        if (docTypeEle && contentGrEle) {
            FormElementControl.loadInitS2($(docTypeEle), [], {}, FileFilterHandle.$canvas, true);
            FormElementControl.loadInitS2($(contentGrEle), [], {}, FileFilterHandle.$canvas, true);
        }
    };

    static getFilterData() {
        let filterData = {};
        let docTypeEle = FileFilterHandle.$canvas[0].querySelector('.file_attr_document_type');
        let contentGrEle = FileFilterHandle.$canvas[0].querySelector('.file_attr_content_group');
        if (docTypeEle) {
            if ($(docTypeEle).val()) {
                let docTypeData = $(docTypeEle).val();
                if (docTypeData.length > 0) {
                    filterData['document_type_id__in'] = docTypeData.join(',');
                }
            }
        }
        if (contentGrEle) {
            if ($(contentGrEle).val()) {
                let contentGrData = $(contentGrEle).val();
                if (contentGrData.length > 0) {
                    filterData['content_group_id__in'] = contentGrData.join(',');
                }
            }
        }
        return filterData;
    };

}

$(document).ready(function () {

    FileFilterHandle.$btnFilter.on('click', function () {
        FileFilterHandle.initCanvas();
        FileFilterHandle.$canvas.offcanvas('show');
    });

    // FileFilterHandle.$btnApply.on('click', function () {
    //     let filterData = FileFilterHandle.getFilterData();
    // });

});