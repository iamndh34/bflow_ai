## DOCS
### 1.setup
insert vào html
```text
<script src="{% static 'vendors/ckeditor/ckeditor.js' %}"></script>
```
### 2. sử dụng
trong file js thêm đoạn code sau
với ".ck5-rich-txt" là tên class của textarea
```js
    ClassicEditor
        .create(document.querySelector('.ck5-rich-txt'),
            {
                toolbar: {
                    items: ['heading', '|', 'bold', 'italic', 'strikethrough', 'underline',
                        '|', 'numberedList', 'bulletedList']
                },
            },
        )
        .then(newEditor => {
            // public global scope for clean purpose when reset form.
            let editor = newEditor;
            window.editor = editor;
        })
```
các option của ckeditor trong bản này
```js
    items: [
        'heading',
        'style',
        '|',
        'bold',
        'italic',
        'strikethrough',
        'underline',
        'fontFamily',
        'fontSize',
        'fontColor',
        'fontBackgroundColor',
        'highlight',
        '|',
        'numberedList',
        'bulletedList',
        'outdent',
        'indent',
        'alignment',
        '|',
        'horizontalLine',
        'pageBreak',
        'insertTable',
        'specialCharacters',
        'blockQuote',
        'subscript',
        'superscript',
        '|',
        'findAndReplace',
        'removeFormat'
    ]
```
thêm nội dung khi load detail
```
newEditor.setData('this is new data')
```
thường thì sẽ public global scope để dể them xoá sửa cái text area này
```
let editor = newEditor;
window.editor = editor;
->  window.editor.setData('this is new data')
```
tương tự cho reset về rỗng là
```
window.editor.setData('this is new data')
```
#### tham khảo link cách thêm style cho ckeditor
hiện tại plugin chưa có style nào men nào muốn thêm có thể tham khảo link bellow.
```
    https://ckeditor.com/docs/ckeditor5/latest/features/style.html
```