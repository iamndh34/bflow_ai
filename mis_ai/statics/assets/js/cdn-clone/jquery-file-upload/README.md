### See the code on github: <a href="https://github.com/juliomalegria/django-chunked-upload" target="_blank">django-chunked-upload</a>.

### Demo: <a href="https://github.com/juliomalegria/django-chunked-upload-demo">django-chunked-upload-demo</a>

---

CSS:

```html

<head>
    <script src="/static/demo/js/jquery.js"></script>
    <script src="/static/demo/js/jquery.ui.widget.js"></script>
    <!-- The Iframe Transport is required for browsers without support for XHR file uploads -->
    <script src="/static/demo/js/jquery.iframe-transport.js"></script>
    <!-- The basic File Upload plugin -->
    <script src="/static/demo/js/jquery.fileupload.js"></script>
    <!-- Calculate md5 -->
    <script src="/static/demo/js/spark-md5.js"></script>
</head>
<body>
<script>
    let md5 = "";
    let csrf = $("input[name='csrfmiddlewaretoken']")[0].value;
    let form_data = [
        {
            "name": "csrfmiddlewaretoken",
            "value": csrf
        }
    ];

    function calculate_md5(file, chunk_size) {
        let slice = File.prototype.slice || File.prototype.mozSlice || File.prototype.webkitSlice;
        let chunks = chunks = Math.ceil(file.size / chunk_size);
        let current_chunk = 0;
        let spark = new SparkMD5.ArrayBuffer();

        function onload(e) {
            spark.append(e.target.result);  // append chunk
            current_chunk++;
            if (current_chunk < chunks) {
                read_next_chunk();
            } else {
                md5 = spark.end();
            }
        }

        function read_next_chunk() {
            let reader = new FileReader();
            reader.onload = onload;
            let start = current_chunk * chunk_size;
            let end = Math.min(start + chunk_size, file.size);
            reader.readAsArrayBuffer(slice.call(file, start, end));
        }

        read_next_chunk();
    }

    $("#chunked_upload").fileupload({
        url: "{% url 'api_chunked_upload' %}",
        dataType: "json",
        maxChunkSize: 100000, // Chunks of 100 kB
        formData: form_data,
        add: function (e, data) { // Called before starting upload
            $("#messages").empty();
            // If this is the second file you're uploading we need to remove the
            // old upload_id and just keep the csrftoken (which is always first).
            form_data.splice(1);
            calculate_md5(data.files[0], 100000);  // Again, chunks of 100 kB
            data.submit();
        },
        chunkdone: function (e, data) { // Called after uploading each chunk
            if (form_data.length < 2) {
                form_data.push(
                        {
                            "name": "upload_id",
                            "value": data.result.upload_id
                        }
                );
            }
            $("#messages").append($('<p>').text(JSON.stringify(data.result)));
            let progress = parseInt(data.loaded / data.total * 100.0, 10);
            $("#progress").text(Array(progress).join("=") + "> " + progress + "%");
        },
        done: function (e, data) { // Called when the file has completely uploaded
            $.ajax({
                type: "POST",
                url: "{% url 'api_chunked_upload_complete' %}",
                data: {
                    csrfmiddlewaretoken: csrf,
                    upload_id: data.result.upload_id,
                    md5: md5
                },
                dataType: "json",
                success: function (data) {
                    $("#messages").append($('<p>').text(JSON.stringify(data)));
                }
            });
        },
    });
</script>
</body>
```

---