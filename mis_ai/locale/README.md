# Hướng dẫn xây dựng bản dịch cho mã nguồn

---

Last update: 2024-03-04
Author: TrNT

---

Có 2 cách sử dụng bản dịch:

1. Sử dụng trên Python và HTML (sử dụng templatetags {% trans '' %})
2. Sử dụng trên JavaScript

Hỗ trợ bản dịch nằm trong thư mục root (settings.BASE_DIR/locale/vi/LC_MESSAGES/django.po) và trên app_dir (apps/core/account/locale/vi/LC_MESSAGES/*.po)
Với:
- Đường dẫn đến app: settings.BASE_DIR hoặc apps/core/account
- Đường dẫn đến bản dịch: locale/vi/LC_MESSAGES/
- Tệp chứa bản dịch: *.po (django.po hoặc djangojs.po)

```shell
# Tạo file dịch cho app tên "x" nằm tại đường dẫn "apps/x" 
# (giống thuộc tính name trong file apps.py của app):

$ python manage.py make_i18n apps.x
# Hoặc
$ python manage.py make_i18n apps.x --file_name=djangojs.po

# apps.x : đường dẫn đến ứng dụng
# --file_name là tên file muốn tạo, mặc định là djangojs
```

> Sau khi thêm bản dịch, muốn áp dụng bản dịch (compile po -> mo) sử dụng command: 
> $ python manage.py compilemessages

---

### 1. Sử dụng trên Python và HTML (sử dụng templatetags {% trans '' %})

#### Cài đặt:
Thêm bản dịch tương ứng vào file locale/{language_to}/LC_MESSAGES/django.po trên thư mục gốc hoặc app_dir

#### Mẫu:
```django.po
#
msgid "First Name"
msgstr "Tên"
```

#### Lưu ý:
- Khuyên khích sử dụng chúng ở settings.BASE_DIR để dễ tìm kiếm trùng từ khoá
- Không nên sử dụng file dịch này trong app_dir. 

#### Sử dụng:
- Thêm bản dịch vào file django.po
- Python:
  - Khai báo class XMsg trong apps/shared/msg/* sử dụng từ khoá vừa thêm bản dịch
  - Sử dụng class XMsg.msg_x trong views
- HTML:
  - thêm hàm load i18n vào file HTML {% load i18n %}
  - sử dụng {% trans 'key' %}

### 2. Sử dụng trên JavaScript

#### Cài đặt:
Thêm bản dịch tương ứng vào file locale/{language_to}/LC_MESSAGES/djangojs.po trên thư mục app_dir

#### Mẫu:
```django.po
#
msgid "First Name"
msgstr "Tên"
```

#### Lưu ý:
- Khuyến kích sử dụng trên app_dir vì cô lập các bản dịch để tải cho từng chức năng
- Không nên sử dụng trên settings.BASE_DIR vì gây tốn hiệu năng tải nhưng không sử dụng đến

#### Sử dụng:
- Tạo file dịch cho app tên "x" nằm tại đường dẫn "apps/x" (giống thuộc tính name trong file apps.py của app): $ python manage.py make_i18n apps.x
- Thêm bản dịch vào file dịch djangojs.po
- Khai báo view sử dụng bản dịch trên app: Chỉ sử dụng cho view render template
  - Nếu sử dụng @mask_view thì thêm từ khoá chuyển đổi trong settings.BASE_DIR/misui/jsi18n.py/I18N_JS_MATCH_APP sau đó sử dụng từ khoá đó thêm vào mask_view của view: jsi18n='key chuyển đổi vừa thêm'
  - Khác: Ghi đè block jsCatalog trên template chức năng đó. Và thêm tải js như sau: <script src="{% url 'javascript-catalog' packages='key chuyển đổi vừa thêm' %}"></script>
- Gọi lấy dữ liệu đã dịch với từ khoá dịch là "x" trên js: $.fn.gettext("x")

---
