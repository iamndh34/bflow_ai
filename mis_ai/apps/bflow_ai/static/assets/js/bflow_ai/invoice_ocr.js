$(document).ready(function () {
    const $bai_script_url = $('#bai-script-url');
    const $input_invoice_pdf_btn = $('#inputInvoicePdfBtn')
    const $clear_storage_btn = $('#clear-storage-btn')

    // Form
    const $input_serial_number = $('#serial-number-input')
    const $input_invoice_number = $('#invoice-number-input')
    const $input_date = $('#date-input')
    const $input_tax_code = $('#tax-code-input')
    const $input_payment = $('#payment-method-input')

    const $buyer_company_input = $('#buyer-company-input')
    const $seller_company_input = $('#seller-company-input')
    const $buyer_tax_input = $('#buyer-tax-input')
    const $seller_tax_input = $('#seller-tax-input')


    let invoiceTable;

    // Load data after reload page
    let savedData = localStorage.getItem("ocr_invoice_data");
    if (savedData) {

        let ocr_data = JSON.parse(savedData);
        console.log(ocr_data)

        if (ocr_data['invoice']) {
            fill_to_form(ocr_data);

            rag_products(ocr_data.items || []).then(rag_products_list => {
                fill_invoice_table(rag_products_list || []);
            });
        }

    }


    $input_invoice_pdf_btn.on('click', function () {
        const fileInput = $('#inputInvoicePdf')[0];
        const file = fileInput.files[0];

        if (!file) {
            console.log('Chưa chọn file nào');
            return;
        }

        console.log('File name:', file.name);

        // Tạo formData
        const formData = new FormData()
        formData.append(`invoice_pdf`, file)

        showLoading(); // hiển thị overlay

        $.ajax({
            url: $bai_script_url.attr('data-ask-demo-url'),
            type: 'POST',
            headers: {"X-CSRFToken": $('input[name="csrfmiddlewaretoken"]').val()},
            data: formData,
            processData: false,
            contentType: false,
            success: async function (response) {
                let ocr_data = JSON.parse(response.data.result)

                console.log('Upload thành công:', ocr_data);
                hideLoading(); // ẩn overlay dù success hay error

                localStorage.setItem("ocr_invoice_data", JSON.stringify(ocr_data));

                // 1. fill form
                await fill_to_form(ocr_data);

                // 2. RAG để match items
                const rag_products_list = await rag_products(ocr_data['items']);

                // 3. Đổ items có selected = true vào bảng
                fill_invoice_table(rag_products_list || []);
            },
            error: function (xhr, status, error) {
                console.error('Lỗi khi upload:', error);
                hideLoading(); // ẩn overlay dù success hay error
            }
        });
    })

    async function fill_to_form(ocr_data) {
        if (!ocr_data) return;

        const invoice = ocr_data['invoice'] || {};
        const buyer = ocr_data['invoice']['buyer'] || {};
        const seller = ocr_data['invoice']['seller'] || {};

        $input_serial_number.val(invoice['serial_number'] || "");
        $input_invoice_number.val(invoice['invoice_number'] || "");
        $input_tax_code.val(invoice['tax_code'] || "");
        $input_payment.val(invoice['payment_method'] || "")

        $buyer_company_input.val(buyer['name'])
        $seller_company_input.val(seller['company_name'])
        $buyer_tax_input.val(buyer['tax_code'])
        $seller_tax_input.val(seller['tax_code'])

        // Convert to YYYY/MM/dd
        let dateStr = invoice['date'] || "";
        if (dateStr.includes('/')) {
            const parts = dateStr.split('/');
            if (parts.length === 3) {
                dateStr = `${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`;
            }
        }

        $input_date.val(dateStr);
    }

    function fill_invoice_table(items) {
        // Lọc các item được chọn
        const selectedItems = items.filter(item => item.selected);

        if ($.fn.DataTable.isDataTable('#invoiceItemsTable')) {
            invoiceTable.clear().rows.add(selectedItems).draw();
            initSelect2InTable(items); // truyền tất cả items để select2 có đủ option
            return;
        }

        invoiceTable = $('#invoiceItemsTable').DataTable({
            data: selectedItems,
            columns: [
                {
                    data: 'name',
                    title: 'Product',
                    render: function (data, type, row, meta) {
                        const selectId = `product-select-${meta.row}`;
                        const selectedValue = data || '';

                        // Lấy danh sách option từ tất cả items
                        const allOptions = items.map(i => i.name);

                        let optionsHtml = '';
                        if (selectedValue && !allOptions.includes(selectedValue)) {
                            optionsHtml += `<option value="${selectedValue}" selected>${selectedValue}</option>`;
                        }

                        optionsHtml += allOptions.map(p =>
                            `<option value="${p}" ${p === selectedValue ? 'selected' : ''}>${p}</option>`
                        ).join('');

                        return `
                        <select id="${selectId}" class="form-select form-select-sm item-name" style="width:100%;">
                            <option value="">-- Select Product --</option>
                            ${optionsHtml}
                        </select>
                    `;
                    }
                },
                {
                    data: 'unit',
                    title: 'Unit',
                    render: data => `<input type="text" class="form-control form-control-sm item-unit" value="${data || ''}" />`
                },
                {
                    data: 'quantity',
                    title: 'Quantity',
                    render: data => `<input type="number" step="0.01" class="form-control form-control-sm item-quantity" value="${data || 0}" />`
                },
                {
                    data: 'unit_price',
                    title: 'Unit Price',
                    render: data => `<input type="number" step="0.01" class="form-control form-control-sm item-unit-price" value="${data || 0}" />`
                },
                {
                    data: 'amount',
                    title: 'Amount',
                    render: data => `<input type="number" step="0.01" class="form-control form-control-sm item-amount" value="${data || 0}" />`
                },
                {
                    data: 'discount',
                    title: 'Discount',
                    render: data => `<input type="number" step="0.01" class="form-control form-control-sm item-discount" value="${data || 0}" />`
                },
                {
                    data: 'vat_rate',
                    title: 'VAT Rate',
                    render: data => `<input type="text" step="0.01" class="form-control form-control-sm item-vat-rate" value="${data || 0}" />`
                }
            ],
            paging: false,
            searching: false,
            info: false,
            ordering: false,
            autoWidth: false,
            responsive: true,
            drawCallback: function () {
                initSelect2InTable(items);
            }
        });
    }

    async function rag_products(products) {
        try {
            const response = await $.ajax({
                url: $bai_script_url.attr('data-ask-rag-product-url'),
                type: 'POST',
                headers: {
                    "X-CSRFToken": $('input[name="csrfmiddlewaretoken"]').val()
                },
                data: JSON.stringify(products),
                contentType: 'application/json'
            });

            let result;
            try {
                result = typeof response.data?.result === 'string'
                    ? JSON.parse(response.data.result)
                    : (response.data?.result ?? response);
            } catch (e) {
                result = response.data?.result ?? response;
            }

            console.log("Kết quả RAG products:", result);
            return result;
        } catch (error) {
            console.error('Lỗi khi gọi API:', error);
            return [];
        }
    }

    function initSelect2InTable(allItems) {
        if (typeof $.fn.select2 === 'undefined') return;
        $('#invoiceItemsTable .item-name').each(function () {
            if ($(this).hasClass('select2-hidden-accessible')) return;

            const selectEl = $(this);
            selectEl.select2({
                placeholder: "Select a product",
                allowClear: true,
                width: 'resolve',
                dropdownParent: $('#invoiceItemsTable')
            });

            // Thêm các item chưa chọn vào dropdown
            allItems.forEach(item => {
                if (!item.selected && selectEl.find(`option[value="${item.name}"]`).length === 0) {
                    selectEl.append(new Option(item.name, item.name, false, false));
                }
            });
        });
    }

    $clear_storage_btn.on('click', function () {
        clearStorage()
    })

    function showLoading() {
        $('#loading-overlay').removeClass('d-none');
    }

    function hideLoading() {
        $('#loading-overlay').addClass('d-none');
    }

    function clearStorage() {
        localStorage.removeItem("ocr_invoice_data");
        window.location.reload();
    }
})