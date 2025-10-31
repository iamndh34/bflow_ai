# Hướng dẫn sử dụng hệ thống Product Attribute

## Yêu cầu cài đặt

### Điều kiện tiên quyết

```html
<!-- HTML bắt buộc -->
{% include 'extends/product_attribute_extend/canvas.html' %}

<!-- Scripts bắt buộc -->
<script src="{% static "assets/js/extends/product_attribute/product_attribute.js" %}"></script>
```

## Hướng dẫn sử dụng cơ bản

### 1. Hiển thị nút Attribute trong DataTable

Trong cấu hình cột DataTable của bạn:

**Tham số:**
- `has_attributes`: boolean - Đánh dấu sản phẩm đã có attribute hay chưa
- `attributes_total_cost`: number - Tổng chi phí từ các attribute đã chọn
- `rowData`: object - Dữ liệu của dòng hiện tại, cần chứa:
  - `duration`: number - Thời lượng sử dụng
  - `duration_unit_data`: object - Thông tin đơn vị thời gian
  - `product_id`: string - ID của sản phẩm  
  - `title`: string - Tên sản phẩm
  - `code`: string - Mã sản phẩm
- `selected_attributes`: object - Các attribute đã được lưu trước đó

```javascript
{
    className: 'w-5',
    render: (data, type, row) => {
        return ProductAttribute.renderProductAttributeButton(
            row.has_attributes,           // Cờ đánh dấu có attribute
            row.attributes_total_cost,    // Tổng chi phí attribute
            row,                          // Toàn bộ dữ liệu dòng
            row.selected_attributes       // Attribute đã chọn
        );
    }
}
```

### 2. Xử lý cập nhật Attribute

Lắng nghe sự kiện `productAttributeUpdate` để xử lý khi attribute thay đổi:

```javascript
$(document).on('productAttributeUpdate', function(e, data) {
    // data trả về chứa, dùng data đe update lại dòng:
    // - rowIndex: Chỉ số của dòng đang được cập nhật
    // - rowData: Dữ liệu đầy đủ của dòng
    // - attributes: Cấu hình attribute đã chọn
    // - totalCost: Tổng chi phí bổ sung từ các attribute
    // - table: Instance của DataTable
});

```

### 3. Kích hoạt cập nhật Attribute khi thay đổi duration

Gọi sự kiện này khi thay đổi giá trị duration:

```javascript
// Khi duration thay đổi
$(document).on('change', '.service-duration', function() {
    const newDuration = $(this).val();
    $(document).trigger('changeDuration', newDuration);
});
```

## Cấu trúc dữ liệu

### Cấu trúc rowData

```javascript
{
    // Thông tin sản phẩm
    "id": "product-uuid",              // ID duy nhất của sản phẩm
    "product_id": "product-uuid",      // ID sản phẩm (có thể trùng với id)
    "code": "PRD-001",                 // Mã sản phẩm/SKU
    "title": "Cloud Server Instance",   // Tên sản phẩm
    
    // Thông tin giá
    "price": 1000000,                  // Giá gốc mỗi đơn vị
    "quantity": 1,                     // Số lượng
    "duration": 1,                     // Hệ số thời gian
    "duration_id": "month-duration-id", // ID đơn vị thời gian đã chọn
    "duration_unit_data": {            // Chi tiết đơn vị thời gian
        "id": "42e8bfa8-a120-40fb-87d1-e160ca3167ab",
        "code": "THANG",
        "title": "tháng",
        "ratio": 720                   // Tỷ lệ chuyển đổi sang đơn vị cơ sở
    },
    
    // Cấu hình attribute
    "has_attributes": false,           // Sản phẩm có attribute hay không
    "attributes_total_cost": 0,        // Tổng chi phí từ các attribute
    "selected_attributes": {},         // Các attribute đã chọn trước đó
}
```

### Cấu trúc selected_attributes

```javascript
{
    "attribute-id-1": {
        "type": "numeric",             // Loại attribute số
        "value": "64GB",               // Giá trị hiển thị
        "cost": 500000,                // Chi phí bổ sung
        "rawValue": 64,                // Giá trị số thực
    },
    "attribute-id-2": {
        "type": "list",                // Loại attribute danh sách
        "value": "RTX 4070",           // Tùy chọn đã chọn
        "cost": 3000000,               // Chi phí bổ sung
        "index": 1,                    // Vị trí trong danh sách
    }
}
```

## Các loại Attribute

### Attribute dạng số (Numeric)

```javascript
{
    "id": "unique-id",
    "title": "RAM",
    "price_config_type": 0,           // 0 cho loại numeric
    "price_config_data": {
        "min_value": 0,                // Giá trị tối thiểu
        "max_value": 128,              // Giá trị tối đa
        "increment": 16,               // Bước nhảy
        "attribute_unit": "GB",        // Đơn vị
        "price_per_unit": "100000",    // Giá mỗi đơn vị
        "duration_unit_data": {        // Thông tin đơn vị thời gian
            "id": "duration-id",
            "title": "tháng",
            "ratio": 720
        }
    },
    "is_mandatory": true               // Bắt buộc hay không
}
```

### Attribute dạng danh sách (List)

```javascript
{
    "id": "unique-id",
    "title": "Model GPU",
    "price_config_type": 1,           // 1 cho loại list
    "price_config_data": {
        "list_item": [                // Danh sách tùy chọn
            {
                "title": "RTX 4060",
                "additional_cost": 2000000
            },
            {
                "title": "RTX 4070",
                "additional_cost": 3000000
            }
        ],
        "duration_unit_data": {
            "id": "duration-id",
            "title": "tháng",
            "ratio": 720
        }
    },
    "is_mandatory": false
}
```
