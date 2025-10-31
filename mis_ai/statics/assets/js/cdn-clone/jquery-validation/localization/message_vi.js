/*
 * Translated default messages for the jQuery validation plugin.
 * Locale: VI (Vietnamese; Tiếng Việt)
 */
$.extend($.validator.messages, {
    required: "Trường này là bắt buộc.",
    remote: "Vui lòng sửa trường này.",
    email: "Vui lòng nhập địa chỉ email hợp lệ.",
    url: "Vui lòng nhập URL hợp lệ.",
    date: "Vui lòng nhập ngày hợp lệ.",
    dateISO: "Vui lòng nhập ngày hợp lệ (ISO).",
    number: "Vui lòng nhập số hợp lệ.",
    digits: "Vui lòng chỉ nhập số.",
    equalTo: "Vui lòng nhập lại giá trị giống như trước đó.",
    maxlength: $.validator.format("Vui lòng nhập không quá {0} ký tự."),
    minlength: $.validator.format("Vui lòng nhập ít nhất {0} ký tự."),
    rangelength: $.validator.format("Vui lòng nhập giá trị có độ dài từ {0} đến {1} ký tự."),
    range: $.validator.format("Vui lòng nhập giá trị từ {0} đến {1}."),
    max: $.validator.format("Vui lòng nhập giá trị nhỏ hơn hoặc bằng {0}."),
    min: $.validator.format("Vui lòng nhập giá trị lớn hơn hoặc bằng {0}."),
    step: $.validator.format("Vui lòng nhập bội số của {0}."),
	creditcard: "Hãy nhập số thẻ tín dụng.",
	extension: "Phần mở rộng không đúng.",
    pattern: "Định dạng không hợp lệ.",
    accept: "Vui lòng chọn tệp có định dạng hợp lệ.",
    phone_vn: "Vui lòng nhập số điện thoại hợp lệ.",
    phone: "Vui lòng nhập số điện thoại hợp lệ.",
    json: "Vùng lòng nhập json hợp lệ.",
    lessThanEqual: function (value, element){
        let valueMax = $(value).val();
        return $.validator.format(`Vui lòng nhập giá trị nhỏ hơn hoặc bằng ${valueMax}.`)
    },
    greaterThanEqual: function (value, element){
        let valueMin = $(value).val();
        return $.validator.format(`Vui lòng nhập giá trị lớn hơn hoặc bằng ${valueMin}.`)
    },
    counterWordsMax: `Chỉ có thể chấp nhận tối đa {0} từ.`,
    counterWordsMin: `Chỉ có thể chấp nhận tối thiểu {0} từ.`,
    allow_emailDomainValidation: `Tên miền không được chấp nhận.`,
    restrict_emailDomainValidation: `Tên miền bị hạn chế.`,
});