# Instruction use Bastion Field 

---

### I. Get Started
```html
// add it into form
<div class="row">
    {% include 'extends/the-documents/bastion.html' with has_opp=True has_prj=True has_inherit=True is_open=True inherit_required=True %}
</div>
```
```javascript
// import it below HTML + after jquery library
<script src="{% static 'vendors/jquery-mockjax_2.6.0/jquery.mockjax.min.js' %}"></script> // using mockup api before define api, sample: bastionField.mockupPrjData
<script>
   $(document).ready(function () {
        let clsBastionField = new $x.cls.bastionField();
        clsBastionField.init(
            true, true, true,
            [
               {
                  'id': 'xxx',
                  'title': 'Opp 1',
                  'selected': true
               }
                  ], [
               {
                  'id': 'yyy',
                  'title': 'Prj 2',
                  'selected': true,
               }
                  ], [
               {
                  'id': 'yyy',
                  'full_name': "Nguyen Van A",
                  "selected": true,
               }
            ],
        );
   })
</script>
```

### II. Config
> Tất cả cấu hình có giá trị mặc định là "false"
> Khi không có trường nào thuộc opp, prj, inherit có chế độ hiển thị cả component BastionField sẽ không được hiển thị.
1. is_open: Tự động mở collapse sau khi render
2. has_opp: Bật hiển thị/sử dụng opportunity
2. opp_required: Thêm thuộc tính "required" cho opportunity
3. opp_disabled: Thêm thuộc tính "disabeld" cho trường opportunity
4. opp_readonly: Thêm thuộc tính "readonly" cho trường opportunity 
5. has_prj: Bật hiển thị/sử dụng project
6. prj_required: Thêm thuộc tính "required" cho project
7. prj_disabled: Thêm thuộc tính "disabbled" cho trường project
8. prj_readonly: Thêm thuộc tính "readonly" cho trường project
9. has_inherit: Bật hiển thị/sử dụng inheritor
10. inherit_required: Thêm thuộc tính "required" cho inheritor
11. inherit_disabled: Thêm thuộc tính "disabled" cho trường inheritor
12. inherit_readonly: Thêm thuộc tính "readonly" cho trường inheritor

### III. Events
> Tất cả sự kiện được kích hoạt tại $('#bastionFieldTheDocument')
```javascript
    new $x.cls.bastionField().mainDiv.on('{eventCode}', function (){
        // handle in here        
    })
```

> Các sự kiện trên trường chuyên biệt được gọi trên thẻ đó sau khi gọi trên thẻ cha.
> Sự kiện bao gồm: preInit và init <br/>
> VD: bastionField.preInit:opp sẽ được gọi 2 lần: <br/>
> new $x.cls.bastionField().mainDiv.on('bastionField.preInit:opp', function (){ console.log("1"); }) <br/>
> new $x.cls.bastionField().oppEle.on('bastionField.preInit:opp', function (){ console.log("2"); }) <br/>
> Kết quả: 1 2


1. General
   - bastionField.preInit : Được gọi trước quá trình khởi tạo (init function) BastionField.
   - bastionField.init : Được gọi sau quá trình khởi tạo hoàn tất.
   - bastionField.preInit:opp : ...
   - bastionField.init:opp : ...
   - bastionField.preInit:prj : ...
   - bastionField.init:prj : ...
   - bastionField.preInit:inherit : ...
   - bastionField.init:inherit : ... 
2. Opportunity
    - bastionField.preInit:opp : Được gọi trước quá trình khởi tạo trường Opportunity.
    - bastionField.init:opp: Được gọi sau quá trình khởi tạo trường Opportunity thành công.
3. Project
    - bastionField.preInit:prj : Được gọi trước quá trình khởi tạo trường Project.
    - bastionField.init:prj : Được gọi sau quá trình khởi tạo trường Project thành công.
4. Inherit
    - bastionField.preInit:inherit : Được gọi trước quá trình khởi tạo trường Inheritor.
    - bastionField.init:inherit : Được gọi sau quá trình khởi tạo trường Inheritor thành công.

### IV. Troubleshooting

---

###### Reversion:
1. 25/09/2023: Khởi tạo class chứa tất cả các action của BastionField
2. 
