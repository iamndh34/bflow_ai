class ProductAttribute {
    constructor(options) {
        this.selectedAttributes = options.selectedAttributes
        this.productAttributes = [];
        this.currentRowData = options.rowData;
        this.currentRowIndex = null;
        this.currentTable = null;
        this.isInitialized = false;
        this.targetDuration =  options.rowData?.duration_unit_data
        this.uomTimeList = []
    }

    setRowData(rowData){
        this.currentRowData = rowData
    }

    hasAttributes(){
        return Object.keys(this.selectedAttributes).length > 0;
    }

    convertPriceBetweenDurations(price, fromDurationUnit, toDurationUnit) {
        if (!fromDurationUnit || !toDurationUnit) {
            return price;
        }

        // If same unit, no conversion needed
        if (fromDurationUnit.id === toDurationUnit.id) {
            return price;
        }

        // Get ratios

        let fromRatio = fromDurationUnit.ratio
        if(!fromRatio){
            let fromDurationUnitData = this.uomTimeList.find(item => item.id === fromDurationUnit.id)
            if (fromDurationUnitData){
                fromRatio = fromDurationUnitData.ratio
            } else {
                fromRatio = 1
            }
        }

        let toRatio = toDurationUnit.ratio
        if(!toRatio){
            let toDurationUnitData = this.uomTimeList.find(item => item.id === toDurationUnit.id)
            if (toDurationUnitData){
                toRatio = toDurationUnitData.ratio
            } else {
                toRatio = 1
            }
        }
        // This converts the price from 'from' unit to 'to' unit
        return price * (toRatio / fromRatio);
    }

    getEffectivePrice(attr, basePrice) {
        if (Object.keys(this.targetDuration).length === 0 || !attr.price_config_data.duration_unit_data) {
            return basePrice;
        }

        // Convert from attribute's duration unit to target duration unit
        return this.convertPriceBetweenDurations(
            basePrice,
            attr.price_config_data.duration_unit_data,
            this.targetDuration
        );
    }

    init() {
        if (this.isInitialized) {
            return this;
        }

        this.loadSampleAttributes();
        this.bindEvents();
        this.isInitialized = true;
        return this;
    }

    loadSampleAttributes() {
        this.productAttributes = [
            {
                "id": "79c206cf-11b3-4219-8c44-d6eae74e61dc",
                "title": "RAM 3",
                "parent_n": {
                    "id": "c6c1e2ca-25e6-43f7-8d25-532743f3f563",
                    "title": "NVIDIA RTX",
                    "code": ""
                },
                "price_config_type": 0,
                "price_config_data": {
                    "increment": 16,
                    "max_value": 128,
                    "min_value": 0,
                    "attribute_unit": "RAM",
                    "price_per_unit": "12000000",
                    "duration_unit_id": "42e8bfa8-a120-40fb-87d1-e160ca3167ab",
                    "duration_unit_data": {
                        "id": "42e8bfa8-a120-40fb-87d1-e160ca3167ab",
                        "code": "NAM",
                        "group": {
                            "id": "fb958ae1-8a38-4b47-a172-5746c0fd8b4e",
                            "code": "Time",
                            "title": "Thời gian",
                            "is_referenced_unit": false
                        },
                        "ratio": 8640,
                        "title": "nam",
                        "is_default": false
                    }
                },
                "is_category": false,
                "is_inventory": true
            },
            {
                "id": "cb2949a9-4c04-44e9-b4a5-1b2eebe50ae5",
                "title": "RAM 2",
                "parent_n": {
                    "id": "c6c1e2ca-25e6-43f7-8d25-532743f3f563",
                    "title": "NVIDIA RTX",
                    "code": ""
                },
                "price_config_type": 0,
                "price_config_data": {
                    "increment": 8,
                    "max_value": 64,
                    "min_value": 0,
                    "attribute_unit": "RAM",
                    "price_per_unit": "100000",
                    "duration_unit_id": "a270178d-214f-445e-bf15-f7f1560d586a",
                    "duration_unit_data": {
                        "id": "a270178d-214f-445e-bf15-f7f1560d586a",
                        "code": "NGAY",
                        "group": {
                            "id": "fb958ae1-8a38-4b47-a172-5746c0fd8b4e",
                            "code": "Time",
                            "title": "Thời gian",
                            "is_referenced_unit": false
                        },
                        "ratio": 24,
                        "title": "ngay",
                        "is_default": false
                    }
                },
                "is_category": false,
                "is_inventory": true
            },
            {
                "id": "3931f7ed-80b7-4e3e-917b-bf4312eb77d4",
                "title": "GPU(2)",
                "parent_n": {
                    "id": "c6c1e2ca-25e6-43f7-8d25-532743f3f563",
                    "title": "NVIDIA RTX",
                    "code": ""
                },
                "price_config_type": 1,
                "price_config_data": {
                    "list_item": [
                        {
                            "title": "RTX4060",
                            "additional_cost": 2000000
                        },
                        {
                            "title": "RTX4070",
                            "additional_cost": 3000000
                        },
                        {
                            "title": "RTX4080",
                            "additional_cost": 5000000
                        }
                    ],
                    "duration_unit_id": "57119380-c3ae-44cd-9708-635c7151d900",
                    "duration_unit_data": {
                        "id": "57119380-c3ae-44cd-9708-635c7151d900",
                        "code": "THANG",
                        "group": {
                            "id": "fb958ae1-8a38-4b47-a172-5746c0fd8b4e",
                            "code": "Time",
                            "title": "Thời gian",
                            "is_referenced_unit": false
                        },
                        "ratio": 720,
                        "title": "thang",
                        "is_default": false
                    }
                },
                "is_category": false,
                "is_inventory": true
            }
        ];
    }

    isAttributeMandatory(attr) {
        return attr.is_mandatory !== undefined ? attr.is_mandatory : true;
    }

    getAttributeType(attr) {
        return attr.price_config_type === 0 ? 'numeric' : 'list';
    }

    requiresDuration(attr) {
        // Only numeric types with duration unit REQUIRE duration input
        return attr.price_config_type === 0 && attr.price_config_data.duration_unit_data;
    }

    hasDuration(attr) {
        // Both numeric and list types can have duration if duration_unit_data exists
        return attr.price_config_data.duration_unit_data !== undefined && attr.price_config_data.duration_unit_data !== null;
    }

    initializeDefaultSelections() {
        this.productAttributes.forEach(attr => {
            const isMandatory = this.isAttributeMandatory(attr);
            if (isMandatory && !this.selectedAttributes[attr.id]) {
                if (attr.price_config_type === 1) { // list type
                    const firstOption = attr.price_config_data.list_item[0];
                    const convertedCost = firstOption.additional_cost

                    this.selectedAttributes[attr.id] = {
                        type: 'list',
                        value: firstOption.title,
                        cost: convertedCost,
                        index: 0,
                        requiresDuration: false,
                        hasDuration: this.hasDuration(attr)
                    };
                } else if (attr.price_config_type === 0) { // numeric type
                    const minValue = attr.price_config_data.min_value;
                    const unit = attr.price_config_data.attribute_unit || '';

                    this.selectedAttributes[attr.id] = {
                        type: 'numeric',
                        value: `${minValue}${unit}`,
                        cost: 0,
                        rawValue: minValue,
                        requiresDuration: this.requiresDuration(attr),
                        hasDuration: this.hasDuration(attr)
                    };
                }
            }
        });
    }

    bindEvents() {
        const self = this;

        // Handle attribute button click
        $(document).on('click', '.btn-open-product-attribute', async function(e) {
            e.preventDefault();
            const $row = $(this).closest('tr');
            self.currentRowIndex = $row.index();

            // Get the DataTable instance and store it FIRST
            const $table = $row.closest('table');
            if ($table.length && $.fn.DataTable.isDataTable($table)) {
                self.currentTable = $table.DataTable();
            }

            // Get product ID AFTER setting currentRowData
            const productId = self.appendProductId($row);

            // self.loadSampleAttributes();

    // Load product attributes from server
    if (productId) {
        await self.loadProductAttributes(productId);
    } else {
        // Fall back to sample attributes if no product ID
        self.loadSampleAttributes();
    }


            await self.loadTimeUom()

            // Initialize default selections for mandatory attributes
            self.initializeDefaultSelections();

            // Render attributes in offcanvas
            self.renderAttributes();
        });

        // Handle save button click
        $(document).on('click', '#offcanvas-save-attribute-btn', function() {
            if (self.validateMandatoryAttributes()) {
                self.saveAttributes();
            }
        });

        // Handle list option selection with price conversion
        $(document).on('change', '.attribute-list-option', function() {
            const attrId = $(this).data('attr-id');
            const optionIndex = $(this).val();
            const attr = self.productAttributes.find(a => a.id === attrId);
            const option = attr.price_config_data.list_item[optionIndex];

            // Convert the price to target duration unit
            const convertedBaseCost = option.additional_cost

            self.selectedAttributes[attrId] = {
                type: 'list',
                value: option.title,
                cost: convertedBaseCost,
                index: parseInt(optionIndex),
                requiresDuration: false,
                hasDuration: self.hasDuration(attr)
            };

            self.updateSummary();
        });

        // Handle numeric slider change
        $(document).on('input', '.attribute-range-slider', function() {
            const attrId = $(this).data('attr-id');
            const attr = self.productAttributes.find(a => a.id === attrId);
            const sliderValue = parseInt($(this).val());

            const configData = attr.price_config_data;
            self.updateNumericValue(attrId, sliderValue, configData);
        });

        // Handle change row duration
        $(document).on('changeDuration', function (e, duration) {
            self.currentRowData.duration = duration;
            self.saveAttributes()
        })
    }

    updateListCostDisplay(attrId) {
        const attr = this.productAttributes.find(a => a.id === attrId);
        const selectedData = this.selectedAttributes[attrId];

        if (attr && selectedData) {
            const duration = selectedData.duration || 1;
            const durationUnit = Object.keys(this.targetDuration).length > 0 ? this.targetDuration.title :
                               (attr.price_config_data.duration_unit_data?.title || '');

            // Update all option displays
            attr.price_config_data.list_item.forEach((option, index) => {
                const convertedPrice = this.getEffectivePrice(attr, option.additional_cost);
                const totalCost = this.hasDuration(attr) ? convertedPrice * duration : convertedPrice;
                const $label = $(`#option-${attrId}-${index}`).next('label');
                const $costSpan = $label.find('.option-cost');

                if ($costSpan.length) {
                    $costSpan.attr('data-init-money', totalCost);

                    // Update the cost text if mask money is not available
                    if (!$.fn.initMaskMoney2) {
                        $costSpan.text(totalCost.toLocaleString());
                    }
                }
            });

            // Update duration label if it exists
            if (this.hasDuration(attr)) {
                const $durationLabel = $(`#duration-list-${attrId}`).siblings('label');
                if ($durationLabel.length) {
                    $durationLabel.find('.duration-info').text(`(${duration} ${durationUnit})`);
                }
            }

            // Initialize mask money if available
            if ($.fn.initMaskMoney2) {
                $.fn.initMaskMoney2();
            }
        }
    }

    createAttributeCard(attr) {
        const isMandatory = this.isAttributeMandatory(attr);
        const isSelected = isMandatory || this.selectedAttributes[attr.id];
        const cardSelected = isSelected ? 'selected' : '';
        const attrType = this.getAttributeType(attr);
        const configData = attr.price_config_data;

        let contentHtml = '';
        if (attr.price_config_type === 1) {
            contentHtml = this.createListOptionsHtml(attr);
        } else if (attr.price_config_type === 0) {
            contentHtml = this.createNumericControlHtml(attr);
        }

        let configInfo = this.renderPriceConfigInfo(attr);

        const parentInfo = attr.parent_n ?
            `<small class="text-muted">${attr.parent_n.title}</small>` : '';

        let badges = `<span class="badge ${attrType === 'list' ? 'bg-primary' : 'bg-purple'} badge-sm">
                        ${attrType.toUpperCase()}
                      </span>`;

        if (this.requiresDuration(attr)) {
            badges += '<span class="badge bg-warning badge-sm ms-1">Duration Required</span>';
        } else if (this.hasDuration(attr) && attr.price_config_type === 1) {
            badges += '<span class="badge bg-info badge-sm ms-1">Duration Optional</span>';
        }

        return `
            <div class="col-12 mb-3">
                <div class="card attribute-card ${cardSelected}" id="attr-${attr.id}">
                    <div class="card-body">
                        <div class="d-flex justify-content-between align-items-center mb-3">
                            <div class="d-flex align-items-center gap-2">
                                <div>
                                    <h6 class="mb-0">${attr.title}</h6>
                                    ${parentInfo}
                                </div>
                                ${badges}
                            </div>
                        </div>

                        ${configInfo}

                        <div class="attribute-content show" id="content-${attr.id}">
                            ${contentHtml}
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    renderPriceConfigInfo(attr) {
        const configData = attr.price_config_data;
        let infoHtml = '<div class="price-config-info bg-light rounded p-2 mb-3">';

        if (attr.price_config_type === 0) { // Numeric type
            const originalPricePerUnit = parseFloat(configData.price_per_unit);
            const convertedPricePerUnit = this.getEffectivePrice(attr, originalPricePerUnit);

            // Show different info based on whether we have targetDuration
            if (Object.keys(this.targetDuration).length > 0) {
                infoHtml += `
                    <div class="row small">
                        <div class="col-6">
                            <span class="text-muted">Range:</span>
                            <strong>${configData.min_value} - ${configData.max_value} ${configData.attribute_unit || ''}</strong>
                        </div>
                        <div class="col-6">
                            <span class="text-muted">Increment:</span>
                            <strong>${configData.increment} ${configData.attribute_unit || ''}</strong>
                        </div>
                    </div>
                    <div class="row small mt-1">
                        <div class="col-6">
                            <span class="text-muted">Price per ${this.targetDuration.title}:</span>
                            <strong><span class="mask-money" data-init-money="${convertedPricePerUnit}"></span></strong>
                        </div>
                        <div class="col-6">
                            <span class="text-muted">Original price per ${configData?.duration_unit_data?.title}:</span>
                            <strong><span class="mask-money" data-init-money="${originalPricePerUnit}"></span></strong>
                        </div>
                    </div>
                `;
            }
            else {
                // No conversion - show original price only
                infoHtml += `
                    <div class="row small">
                        <div class="col-6">
                            <span class="text-muted">Range:</span>
                            <strong>${configData.min_value} - ${configData.max_value} ${configData.attribute_unit || ''}</strong>
                        </div>
                        <div class="col-6">
                            <span class="text-muted">Increment:</span>
                            <strong>${configData.increment} ${configData.attribute_unit || ''}</strong>
                        </div>
                    </div>
                    <div class="row small mt-1">
                        <div class="col-12">
                            <span class="text-muted">Price per unit${configData?.duration_unit_data ? ` (${configData.duration_unit_data.title})` : ''}:</span>
                            <strong><span class="mask-money" data-init-money="${originalPricePerUnit}"></span></strong>
                        </div>
                    </div>
                `;
            }
        } else if (attr.price_config_type === 1) { // List type
            const optionCount = configData.list_item ? configData.list_item.length : 0;
            const minPrice = configData.list_item ? Math.min(...configData.list_item.map(item => item.additional_cost)) : 0
            const maxPrice = configData.list_item ? Math.max(...configData.list_item.map(item => item.additional_cost)) : 0

            infoHtml += `
                <div class="row small">
                    <div class="col-6">
                        <span class="text-muted">Options:</span>
                        <strong>${optionCount} available</strong>
                    </div>
                    <div class="col-6">
                        <span class="text-muted">Price range:</span>
                        <strong>
                            <span class="mask-money" data-init-money="${minPrice}"></span> -
                            <span class="mask-money" data-init-money="${maxPrice}"></span>
                        </strong>
                    </div>
                </div>
                ${configData.duration_unit_data ? `
                <div class="row small mt-1">
                    <div class="col-12">
                        <span class="text-muted">Duration unit:</span>
                        <strong>${configData?.duration_unit_data?.title}</strong>
                    </div>
                </div>
                ` : ''}
            `;
        }

        infoHtml += '</div>';

        $.fn.initMaskMoney2();
        return infoHtml;
    }

    createListOptionsHtml(attr) {
        let optionsHtml = '';
        const listItems = attr.price_config_data.list_item || [];

        listItems.forEach((option, index) => {
            // Check if this option is selected
            let isChecked = false;
            if (this.selectedAttributes[attr.id]) {
                isChecked = this.selectedAttributes[attr.id].index === index;
            } else if (this.isAttributeMandatory(attr) && index === 0) {
                isChecked = true;
            }

            // Get converted price
            const price = option.additional_cost

            optionsHtml += `
                <div class="form-check list-option-item mb-2">
                    <input class="form-check-input attribute-list-option"
                           type="radio"
                           name="${attr.id}"
                           value="${index}"
                           data-attr-id="${attr.id}"
                           id="option-${attr.id}-${index}"
                           ${isChecked ? 'checked' : ''}>
                    <label class="form-check-label d-flex justify-content-between align-items-center w-100"
                           for="option-${attr.id}-${index}">
                        <span>${option.title}</span>
                        <span class="text-primary fw-bold mask-money option-cost" data-init-money="${price}"></span>
                    </label>
                </div>
            `;
        });

        $.fn.initMaskMoney2();

        return `<div class="list-options">${optionsHtml}</div>`;
    }

    createNumericControlHtml(attr) {
        const config = attr.price_config_data;
        const min = config.min_value || 0;
        const max = config.max_value || 100;
        const increment = config.increment || 1;
        const unit = config.attribute_unit || '';

        const steps = (max - min) / increment;
        let currentValue = 0;
        let displayValue = min;
        let cost = 0;

        if (this.selectedAttributes[attr.id]) {
            const savedValue = this.selectedAttributes[attr.id].rawValue || min;
            currentValue = (savedValue - min) / increment;
            displayValue = savedValue;
            cost = this.selectedAttributes[attr.id].cost || 0;
        }

        return `
            <div class="numeric-control p-3 bg-white border rounded">
                <input type="range"
                       class="form-range attribute-range-slider"
                       id="slider-${attr.id}"
                       data-attr-id="${attr.id}"
                       min="0"
                       max="${steps}"
                       value="${currentValue}">

                <div class="d-flex justify-content-between mt-3">
                    <span class="fw-bold fs-5" id="value-${attr.id}">${displayValue}${unit}</span>
                    <div class="text-end">
                        <span class="text-primary fw-bold fs-5 mask-money" id="cost-${attr.id}" data-init-money="${cost}">${cost}</span>
                    </div>
                </div>
            </div>
        `;
    }

    updateNumericValue(attrId, sliderValue, configData) {
        const min = configData.min_value || 0;
        const increment = configData.increment || 1;
        const pricePerUnit = parseFloat(configData.price_per_unit) || 0;
        const unit = configData.attribute_unit || '';

        // Get the attribute to access duration unit data
        const attr = this.productAttributes.find(a => a.id === attrId);
        const convertedPricePerUnit = this.getEffectivePrice(attr, pricePerUnit);

        const durationUnit = Object.keys(this.targetDuration).length > 0 ? this.targetDuration.title :
                           (configData.duration_unit_data?.title || '');

        const value = min + (sliderValue * increment);
        const baseCost = sliderValue * convertedPricePerUnit

        $(`#value-${attrId}`).text(`${value}${unit}`);
        $(`#cost-${attrId}`).attr('data-init-money', baseCost);

        // Update the cost label to show duration if applicable
        if (this.requiresDuration({ price_config_data: configData, price_config_type: 0 })) {
            $(`#cost-${attrId}`).siblings('small').text(`Total Cost (${durationUnit})`);
        }

        // Save the value
        this.selectedAttributes[attrId] = {
            type: 'numeric',
            value: `${value}${unit}`,
            cost: baseCost,
            rawValue: value,
            requiresDuration: this.requiresDuration({ price_config_data: configData, price_config_type: 0 }),
            hasDuration: this.hasDuration({ price_config_data: configData, price_config_type: 0 })
        };

        $.fn.initMaskMoney2();

        this.updateSummary();
    }

    validateMandatoryAttributes() {
        const mandatoryAttrs = this.productAttributes.filter(attr => this.isAttributeMandatory(attr));
        const missingAttrs = [];

        mandatoryAttrs.forEach(attr => {
            if (!this.selectedAttributes[attr.id]) {
                missingAttrs.push(attr.title);
            }
        });

        if (missingAttrs.length > 0) {
            // You can add a toast or alert here
            console.warn('Missing mandatory attributes:', missingAttrs);
        }

        return missingAttrs.length === 0;
    }

    updateSummary() {
        const $summary = $('#attribute-summary');
        const $content = $('#summary-content');
        const $totalCost = $('#total-attr-cost');

        $content.empty();

        let totalCost = 0;
        let hasAllMandatory = true;

        this.productAttributes.forEach(attr => {
            const data = this.selectedAttributes[attr.id];
            const isMandatory = this.isAttributeMandatory(attr);
            const configData = attr.price_config_data;

            if (isMandatory && !data) {
                hasAllMandatory = false;
                const itemHtml = `
                    <div class="d-flex justify-content-between align-items-center mb-2 p-2 bg-light rounded border-danger">
                        <span class="fw-semibold text-danger">${attr.title}:</span>
                        <span class="text-danger">Not configured</span>
                    </div>
                `;
                $content.append(itemHtml);
            } else if (data) {
                let detailInfo = '';
                const durationUnit = Object.keys(this.targetDuration).length > 0 ? this.targetDuration?.title :
                                   (configData.duration_unit_data?.title || 'months');

                if (data.type === 'numeric' && data.requiresDuration) {
                    const convertedPricePerUnit = this.getEffectivePrice(attr, parseFloat(configData.price_per_unit));
                    // detailInfo = `
                    //     <small class="text-muted d-block">
                    //         ${data.rawValue} units × <span class="mask-money" data-init-money="${convertedPricePerUnit}"></span>/unit × ${durationUnit}
                    //     </small>
                    // `;
                    if (Object.keys(this.targetDuration).length > 0) {
                        detailInfo = `
                            <small class="text-muted d-block">
                                ${data.rawValue} units × <span class="mask-money" data-init-money="${convertedPricePerUnit}"></span>/unit (converted to ${durationUnit})
                            </small>
                        `;
                    } else {
                        detailInfo = `
                            <small class="text-muted d-block">
                                ${data.rawValue} units × <span class="mask-money" data-init-money="${convertedPricePerUnit}"></span>/unit
                            </small>
                        `;
                    }
                } else if (data.type === 'list' && data.hasDuration && data.duration > 1) {
                    detailInfo = `
                        <small class="text-muted d-block">
                            Base price: <span class="mask-money" data-init-money="${data.cost}"></span> × ${durationUnit}
                        </small>
                    `;
                } else if (data.type === 'list') {
                    detailInfo = `<small class="text-muted d-block">Selected option</small>`;
                }

                const itemHtml = `
                    <div class="d-flex justify-content-between align-items-start mb-2 p-2 bg-light rounded">
                        <div>
                            <span class="fw-semibold">${attr.title}:</span>
                            <span class="text-dark ms-2">${data.value}</span>
                            ${detailInfo}
                        </div>
                        <span class="text-primary fw-bold mask-money" data-init-money="${data.cost}"></span>
                    </div>
                `;
                $content.append(itemHtml);
                totalCost += data.cost;
            }
        });

        $totalCost.attr('data-init-money', totalCost);

        const $saveBtn = $('#offcanvas-save-attribute-btn');
        if (!hasAllMandatory) {
            $saveBtn.addClass('disabled').attr('disabled', true);
        } else {
            $saveBtn.removeClass('disabled').attr('disabled', false);
        }

        if ($.fn.initMaskMoney2) {
            $.fn.initMaskMoney2();
        }
    }

    appendProductId($row) {
        let productId = null;

        // Get product ID
        if (this.currentRowData) {
            productId = this.currentRowData.product_id
        }

        // Fallback: try to extract from row HTML if no ID found
        if (!productId && $row && $row.length) {
            // Check for data attributes
            productId = $row.attr('data-product-id');
        }

        const $offcanvas = $('#offcanvas-product-attribute');
        if ($offcanvas.length && productId) {
            $offcanvas.data('current-product-id', productId);
        }

        return productId;
    }

    async loadProductAttributes(productId) {
        const $offcanvas = $('#offcanvas-product-attribute');
        const urlTemplate = $offcanvas.attr('data-product-attribute');
        const url = urlTemplate.format_url_with_uuid(productId);

        try {
            await $.fn.callAjax2({
                url: url,
                method: 'GET',
            }).then(
                (resp) => {
                    let data = $.fn.switcherResp(resp);
                    if (data.product_attribute_list && data.product_attribute_list.attribute_list) {
                        this.productAttributes = data.product_attribute_list.attribute_list;
                        console.log('Loaded product attributes:', this.productAttributes);
                    }
                },
                (errs) => {
                    console.error('Error loading attributes:', errs);
                    // Fall back to sample attributes
                    this.loadSampleAttributes();
                }
            );
        } catch (error) {
            console.error('Error loading product attributes:', error);
            this.loadSampleAttributes();
        }
    }

    async loadTimeUom() {
        const $offcanvas = $('#offcanvas-product-attribute');
        const url = $offcanvas.attr('data-uom-list-url');

        try {
            await $.fn.callAjax2({
                url: url,
                method: 'GET',
                data: {'group__code': 'Time', 'group__is_default': true}
            }).then(
                (resp) => {
                    let data = $.fn.switcherResp(resp);
                    this.uomTimeList = data['unit_of_measure']
                },
                (errs) => {
                    console.error('Error loading attributes:', errs);
                    // Fall back to sample attributes
                    this.loadSampleAttributes();
                }
            );
        } catch (error) {
            console.error('Error loading uom:', error);
            this.loadSampleAttributes();
        }
    }

    renderAttributes() {
        const container = $('#offcanvas-product-attribute .offcanvas-body .row');
        container.empty();

        // Add title with product info if available
        if (this.currentRowData) {
            const productInfo = `
                <div class="col-12 mb-3">
                    <div class="card">
                        <div class="card-body d-flex align-items-center">
                            <span class="fs-5">
                                ${this.currentRowData.title || 'Unknown Product'}
                            </span>
                            ${this.currentRowData.code ? `<span class="badge bg-secondary ms-2">${this.currentRowData.code}</span>` : ''}
                        </div>
                    </div>
                </div>
            `;
            container.append(productInfo);
        }

        // Render each attribute
        this.productAttributes.forEach(attr => {
            const attrHtml = this.createAttributeCard(attr);
            container.append(attrHtml);
        });

        // Add summary section
        container.append(this.createSummarySection());

        // Update summary immediately
        this.updateSummary();
    }

    createSummarySection() {
        return `
            <div class="col-12 mt-3">
                <div class="card border-primary" id="attribute-summary">
                    <div class="card-body">
                        <h6 class="card-title text-primary mb-3">
                            <i class="fa fa-check-circle me-2"></i>Configuration Summary
                        </h6>
                        <div id="summary-content"></div>
                        <hr class="my-3">
                        <div class="d-flex justify-content-between align-items-center">
                            <span class="fw-bold fs-5">Total Additional Cost:</span>
                            <span class="h4 text-primary mb-0 mask-money" id="total-attr-cost" data-init-money="0"></span>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    saveAttributes() {
        if (!this.validateMandatoryAttributes()) {
            return;
        }

        let totalAttrCost = this.calculateTotalAttributeCost();

        this.updateRowButton()

        const offcanvasElement = document.getElementById('offcanvas-product-attribute');
        const offcanvas = bootstrap.Offcanvas.getInstance(offcanvasElement);
        if (offcanvas) {
            offcanvas.hide();
        }

        console.log(this.currentRowData)

        $(document).trigger('productAttributeUpdate', {
            rowIndex: this.currentRowIndex,
            rowData: this.currentRowData,
            attributes: this.selectedAttributes,
            totalCost: totalAttrCost,
            table: this.currentTable
        })
    }

    updateRowButton() {
        const $tables = $('table').filter(function() {
            return $(this).find('.btn-open-product-attribute').length > 0;
        });

        if ($tables.length) {
            const $row = $tables.first().find('tbody tr').eq(this.currentRowIndex);
            const $btn = $row.find('.btn-open-product-attribute');
            const $icon = $btn.find('i');

            let totalAttrCost = this.calculateTotalAttributeCost();

            const mandatoryCount = this.productAttributes.filter(attr => this.isAttributeMandatory(attr)).length;
            const configuredMandatoryCount = this.productAttributes.filter(attr =>
                this.isAttributeMandatory(attr) && this.selectedAttributes[attr.id]
            ).length;

            if (configuredMandatoryCount === mandatoryCount) {
                $btn.removeClass('btn-soft-primary btn-soft-warning').addClass('btn-soft-success');
                $btn.attr('title', `Attributes configured - Total: ${totalAttrCost.toLocaleString()}`);
                $icon.removeClass('fa-plus fa-exclamation').addClass('fa-check');
            } else {
                $btn.removeClass('btn-soft-primary btn-soft-success').addClass('btn-soft-warning');
                $btn.attr('title', `Configure required attributes`);
                $icon.removeClass('fa-plus fa-check').addClass('fa-exclamation');
            }

            let $badge = $btn.parent().find('.attribute-badge');
            if (totalAttrCost > 0) {
                if (!$badge.length) {
                    $btn.parent().append(`
                        <span class="attribute-badge badge bg-info ms-1 mask-money" data-init-money="${totalAttrCost}">
                            ${totalAttrCost.toLocaleString()}
                        </span>
                    `);
                } else {
                    $badge.attr('data-init-money', totalAttrCost);
                    $badge.text(totalAttrCost.toLocaleString());
                }
                $.fn.initMaskMoney2();
            } else if ($badge.length) {
                $badge.remove();
            }
        }
    }

    calculateTotalAttributeCost() {
        let totalCost = 0;

        for (const [attrId, data] of Object.entries(this.selectedAttributes)) {
            if (data && data.cost) {
                totalCost += data.cost;
            }
        }

        let rowDurationData = this.currentRowData.duration ?? 1
        totalCost = totalCost * rowDurationData

        return totalCost;
    }

    static validateRowDataInput(rowData) {
        const requiredRowDataFields = [
            'duration_unit_data',
            'product_id',
            'title',
            'code',
            'duration'
        ]

        if (!rowData) {
            console.log('Invalid input: rowData is null or undefined');
            return false;
        }

        const missingRowDataFields = [];
        requiredRowDataFields.forEach(field => {
            if (rowData[field] === undefined || rowData[field] === null) {
                missingRowDataFields.push(field);
            }
        })
        if (missingRowDataFields.length > 0) {
            console.log('Missing rowData fields:', missingRowDataFields)
            console.log('Current rowData:', rowData)
            return false
        }
        return true
    }

    static renderProductAttributeButton(has_attributes=false, attributes_total_cost=0, rowData, selectedAttributes= {}) {
        ProductAttribute.validateRowDataInput(rowData)
        if (rowData.duration_unit_data === undefined || rowData.duration_unit_data === null) {
            rowData.duration_unit_data = {}
        }
        if (!window.productAttributeInstance) {
            window.productAttributeInstance = new ProductAttribute({rowData, selectedAttributes});
            window.productAttributeInstance.init();
        }

        const hasAttributes = has_attributes
        const totalCost =  attributes_total_cost;

        if (hasAttributes) {
            return `<div class="d-flex align-items-center justify-content-between">
                        <button
                            type="button"
                            class="btn btn-icon btn-rounded btn-soft-success btn-xs btn-open-product-attribute"
                            data-bs-toggle="offcanvas"
                            data-bs-target="#offcanvas-product-attribute"
                            title="Edit attributes - Total: ${totalCost.toLocaleString()}"
                        >
                            <span class="icon"><i class="fa-solid fa-check"></i></span>
                        </button>
                        ${totalCost > 0 ? `<span class="attribute-badge badge bg-info ms-1 mask-money" data-init-money="${totalCost}">${totalCost.toLocaleString()}</span>` : ''}
                    </div>`;
        } else {
            return `<div class="d-flex align-items-center justify-content-between">
                        <button
                            type="button"
                            class="btn btn-icon btn-rounded btn-soft-primary btn-xs btn-open-product-attribute"
                            data-bs-toggle="offcanvas"
                            data-bs-target="#offcanvas-product-attribute"
                            title="Configure required attributes"
                        >
                            <span class="icon"><i class="fa-solid fa-plus"></i></span>
                        </button>
                    </div>`;
        }
    }
}