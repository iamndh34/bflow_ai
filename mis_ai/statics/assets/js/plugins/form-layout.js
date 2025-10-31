$(document).ready(function () {
    // class support design layout
    class designFormUtils {
        // ----------------------------------------- //
        //
        //  Support all action that DnD need handle
        //
        // ----------------------------------------- //


        // template of row and item element
        rowData = '<div class="my-row row mb-1"><div class="utils-form absolute-top-over"><div class="util-form-control util-form-row"><i class="fas fa-times btn btn-xs util-form-control-btn util-row-remove "></i><i class="fas fa-cog btn btn-xs util-form-control-btn util-row-config"></i><i class="fas fa-caret-up btn btn-xs util-form-control-btn util-row-caret-up"></i><i class="fas fa-caret-down btn btn-xs util-form-control-btn util-row-caret-down"></i></div></div>{0}</div>';
        htmlChildItem = '<div class="util-child-group mb-3"><div class="utils-form"><div class="util-form-control util-form-cell"><i class="fas fa-times btn btn-xs util-form-control-btn util-cell-remove"></i><i class="fas fa-cog btn btn-xs util-form-control-btn util-cell-config"></i><i class="fas fa-caret-up btn btn-xs util-form-control-btn util-cell-caret-up"></i><i class="fas fa-caret-down btn btn-xs util-form-control-btn util-cell-caret-down"></i></div></div><div class="form-group"><label for="" class="form-label">Label input</label>{0}<small class="form-text text-muted">Descriptions.</small></div></div>';

        static parseDesignForm() {
            // DnD design is success -> call this for get HTML designed!
            let designData = $("#drop-container").clone();
            designData.find('.utils-form').remove();
            return designData.html();
        }

        static getDesignFormText() {
            return $('<textarea></textarea>').val(this.parseDesignForm()).val().replaceAll('href="#', 'href="#preview_').replaceAll('id="', 'id="preview_');
        }

        static reloadPreview() {
            // call this for reload preview
            $('.design-preview').html(this.getDesignFormText());
        }

        static callbackInitElementAfterDropped() {
            // support call some action after drag component dropped.
            let elePreview = $('.design-preview');
            elePreview.find('.select2').select2();
            elePreview.find('table.table').map((idx, item) => {
                if (!$.fn.DataTable.isDataTable($(item))) $(item).DataTableDefault();
            });
        }

        static activeDropStop() {
            // call when callback "stop" of draggable is called.
            this.reloadPreview();
            this.callbackInitElementAfterDropped();
        }

        static getElementWhereIsDroppedRow(event) {
            const classFindRow = '.my-row';
            let dropPosition = {
                x: event.pageX, y: event.pageY
            };
            let placeInsert = 'after';
            let elementDrop = document.elementFromPoint(dropPosition.x, dropPosition.y);
            if (elementDrop) {
                let existTab = elementDrop.closest('.drop-content-dnd-tab');
                let parentX = elementDrop.closest(classFindRow);
                if (parentX) {
                    if (existTab) {
                        let tab_belong_parent = $(parentX).find('.drop-content-dnd-tab');
                        if (tab_belong_parent) {
                            parentX = elementDrop.closest('.drop-content-dnd');
                            placeInsert = 'append';
                        }
                    }
                } else {
                    parentX = elementDrop.closest('.drop-content-dnd');
                    placeInsert = 'append';
                }
                if (!parentX) {
                    console.log('[ROW] Parent is not value.', elementDrop, existTab, parentX);
                }
                return [parentX, (!!existTab), placeInsert]
            }
            console.log('[ROW] Element Drop is empty!');
            return [null, false, placeInsert]
        }

        static getElementWhereIsDroppedCell(event, realThis, elementDrop) {
            const classFindCell = '.util-child-group'
            let placeInsert = 'after';
            if (elementDrop) {
                let existTab = elementDrop.closest('.drop-content-dnd-tab');
                let parentX = elementDrop.closest(classFindCell);
                if (parentX) {
                    if (existTab) {
                        let tab_in_parent = $(parentX).find('.drop-content-dnd-tab');
                        if (tab_in_parent) {
                            parentX = elementDrop.closest('.my-col');
                            placeInsert = 'append';
                        }
                    }
                } else {
                    parentX = elementDrop.closest('.my-col');
                    placeInsert = 'append';
                }
                return [parentX, (!!existTab), placeInsert]
            }
            return [null, false, placeInsert]
        }

        static setComponentIDropped(realThis) {
            // set ID of component for get ID in droppable
            $(realThis).data("originalId", $(realThis).attr("id"))
        }

        static getComponentIDDropped(ui) {
            // get ID in drop of droppable (data from setComponentIDDropped
            return ui.draggable.data("originalId");
        }

        static hiddeDragAfterDrop(ui) {
            // when we want to hide drag component dropped.
            ui.draggable.hide();
        }

        getHtmlColumn(colCount) {
            let htmlTmp = '';
            let colNum = null;
            if (12 % colCount === 0) {
                colNum = 12 / colCount;
            }
            for (let i = 0; i < colCount; i++) {
                htmlTmp += colNum === null ? '<div class="draggable my-col col"></div>' : '<div class="my-col col-{0}"></div>'.format_by_idx(colNum);
            }
            return htmlTmp;
        }

        generateColumn(realThis, event, ui) {
            // generate row when drag LAYOUT dropped. return state (boolean) generate row.
            let [rowDrop, isTab, placeInsert] = designFormUtils.getElementWhereIsDroppedRow(event);
            if (rowDrop) {
                let textID = designFormUtils.getComponentIDDropped(ui);
                let colCount = parseInt(textID.split('-')[1]);
                if (colCount && 0 < colCount <= 12) {
                    if (isTab === true) {
                        switch (placeInsert) {
                            case 'append':
                                $(rowDrop).append(this.rowData.format_by_idx(this.getHtmlColumn(colCount)))
                                break
                            case 'after':
                                $(this.rowData.format_by_idx(this.getHtmlColumn(colCount))).insertAfter(rowDrop);
                                break
                        }
                    } else {
                        switch (placeInsert) {
                            case 'append':
                                $(rowDrop).append(this.rowData.format_by_idx(this.getHtmlColumn(colCount)))
                                break
                            case 'after':
                                $(this.rowData.format_by_idx(this.getHtmlColumn(colCount))).insertAfter(rowDrop);
                                break
                        }
                    }

                    // init drag for my-col
                    $(".my-col").droppable({
                        accept: '.drag-component-child',
                        drop: function (event, ui) {
                            // stop drag component!
                            event.stopPropagation();

                            // drag component copyright
                            let position = ui.helper.position();
                            ui.helper.remove();
                            let element = document.elementFromPoint(position.left, position.top);

                            // real target
                            if ($(element).closest($(event.target)).length > 0){
                                console.log('True', element);
                                new designFormUtils().generateItemCell(this, event, ui, element);
                            } else {
                                console.log('False location!');
                                // $(ui.draggable).draggable("cancel");
                                $(ui.draggable).draggable("option", "revert", true);
                                // Lưu trữ vị trí ban đầu của phần tử drag component
                                // var initialPos = ui.helper.data("initialPos");

                                // Thiết lập animation cho phần tử drag component
                                // ui.draggable.animate({ top: initialPos.top, left: initialPos.left }, 500);
                            }

                            // cal generate
                            // new designFormUtils().generateItemCell(this, event, ui, element);
                        }
                    });
                    return true
                }
                return false
            } else $.fn.notifyB({
                // 'description': "You must drop inside the cell or row -  don't drop the mouse too close to the partitions. Please try again."
                'description': "Bạn phải thả chuột vào bên trong ô hoặc hàng - không thả chuột quá gần các phân vùng. Vui lòng thử lại."
            }, 'warning')
        }

        generateItemCell(realThis, event, ui, elementAtDroppedArea) {
            let [childRowDrop, isTab, placeInsert] = designFormUtils.getElementWhereIsDroppedCell(event, realThis, elementAtDroppedArea);
            if (childRowDrop) {
                let componentId = designFormUtils.getComponentIDDropped(ui);
                let eleSelected = componentId.split("component-child-")[1];
                let dataAppend = '';
                switch (eleSelected) {
                    case 'input-text':
                        dataAppend = this.htmlChildItem.format_by_idx(`<input type="text" class="form-control">`);
                        break
                    case 'select':
                        dataAppend = this.htmlChildItem.format_by_idx('<select class="form-select"><option selected>Select</option><option value="1">One</option><option value="2">Two</option><option value="3">Three</option></select>');
                        break
                    case 'multiple-select':
                        dataAppend = this.htmlChildItem.format_by_idx('<select class="form-select select2" multiple><option selected>Multiple Select Menu</option><option value="1">One</option><option value="2">Two</option><option value="3">Three</option></select>');
                        break
                    case 'text-area':
                        dataAppend = this.htmlChildItem.format_by_idx('<textarea class="form-control" rows="3" placeholder="Textarea"></textarea>');
                        break
                    case 'read-only-plain-text':
                        dataAppend = this.htmlChildItem.format_by_idx('<input type="text" readonly class="form-control-plaintext" value="email@example.com">');
                        break
                    case 'file-browser':
                        dataAppend = this.htmlChildItem.format_by_idx('<input class="form-control"  type="file">');
                        break
                    case 'checkbox':
                        dataAppend = this.htmlChildItem.format_by_idx('<div class="form-check"><input type="checkbox" class="form-check-input"><label class="form-check-label" for="">Checkbox Static</label></div>');
                        break
                    case 'radio':
                        dataAppend = this.htmlChildItem.format_by_idx('<div class="form-check"><input type="radio" name="customRadio" class="form-check-input"><label class="form-check-label" for="">Radio Static</label></div><div class="form-check"><input type="radio" name="customRadio" class="form-check-input"><label class="form-check-label" for="">Radio Static 2</label></div>');
                        break
                    case 'tabs':
                        dataAppend = this.htmlChildItem.format_by_idx('<ul class="nav nav-light nav-tabs">' + '<li class="nav-item"><a class="nav-link active" data-bs-toggle="tab" href="#tab_block_1"><span class="nav-link-text">Active</span></a></li>' + '<li class="nav-item"><a class="nav-link" data-bs-toggle="tab" href="#tab_block_2"><span class="nav-link-text">Link</span></a></li>' + '</ul>' + '<div class="tab-content">' + '<div class="tab-pane fade show active" id="tab_block_1">' + '<p>assumenda labore aesthetic magna delectus mollit. </p>' + '<div class="container drop-content drop-content-dnd-tab"></div>' + '</div>' + '<div class="tab-pane fade" id="tab_block_2"><p>Pitchfork sustainable tofu synth chambray yr.</p></div>' + '</div>')
                        break
                    case 'data-table':
                        dataAppend = this.htmlChildItem.format_by_idx('<table class="table nowrap"><thead><tr><th>Seq.</th><th>Name</th><th>Position</th><th>Office</th><th>Start date</th><th>Salary</th></tr></thead><tbody></tbody></table>')
                        break
                }

                if (isTab === true) {
                    switch (placeInsert) {
                        case 'append':
                            $(childRowDrop).append(this.rowData.format_by_idx(this.getHtmlColumn(childRowDrop)))
                            break
                        case 'after':
                            $(this.rowData.format_by_idx(this.getHtmlColumn(childRowDrop))).insertAfter(childRowDrop);
                            break
                    }
                } else {
                    switch (placeInsert) {
                        case 'append':
                            $(childRowDrop).append(dataAppend);
                            break
                        case 'after':
                            $(dataAppend).insertAfter(childRowDrop);
                            break
                    }
                    // childRowDrop ? $(dataAppend).insertAfter(childRowDrop) : $(realThis).append(dataAppend);
                }
            } else $.fn.notifyB({
                // 'description': "You must drop inside the cell or row -  don't drop the mouse too close to the partitions. Please try again."
                'description': "Bạn phải thả chuột vào bên trong ô hoặc hàng - không thả chuột quá gần các phân vùng. Vui lòng thử lại."
            }, 'warning')
        }
    }

    function loadEvents() {
        // ----------------------------------------- //
        //
        //  Group all event handle in here
        //
        // ----------------------------------------- //


        // More drag components
        $('#all-drag-component').click(function (e) {
            e.preventDefault();
            $(this).addClass('hidden');
            $('.drag-component').removeClass('hidden');
        })

        // Row control
        $(document).on('click', '.util-row-remove', function (e) {
            e.preventDefault();
            $(this).closest('.my-row').remove();
            designFormUtils.activeDropStop();
        });
        $(document).on('click', '.util-row-config', function (e) {
            e.preventDefault();
            let parentEle = $(this).closest('.my-row');
            alert("Setting dialog is open! " + 'ROW');
        });
        $(document).on('click', '.util-row-caret-up', function (e) {
            e.preventDefault();
            let parentEle = $(this).closest('.my-row');
            let prevEle = parentEle.prev('.my-row');
            if (parentEle && prevEle) {
                parentEle.insertBefore(prevEle);
            }
            designFormUtils.activeDropStop();
        });
        $(document).on('click', '.util-row-caret-down', function (e) {
            e.preventDefault();
            let parentEle = $(this).closest('.my-row');
            let nextEle = parentEle.next('.my-row');
            if (parentEle && nextEle) {
                nextEle.insertBefore(parentEle);
            }
            designFormUtils.activeDropStop();
        });
        // Cell control
        $(document).on('click', '.util-cell-remove', function (e) {
            e.preventDefault();
            $(this).closest('.util-child-group').remove();
            designFormUtils.activeDropStop();
        });
        $(document).on('click', '.util-cell-config', function (e) {
            e.preventDefault();
            let parentEle = $(this).closest('.util-child-group');
            alert("Setting dialog is open! " + parentEle.find('input').val());
        });
        $(document).on('click', '.util-cell-caret-up', function (e) {
            e.preventDefault();
            let parentEle = $(this).closest('.util-child-group');
            let prevEle = parentEle.prev('.util-child-group');
            if (parentEle && prevEle) {
                parentEle.insertBefore(prevEle);
            }
            designFormUtils.activeDropStop();
        });
        $(document).on('click', '.util-cell-caret-down', function (e) {
            e.preventDefault();
            let parentEle = $(this).closest('.util-child-group');
            let nextEle = parentEle.next('.util-child-group');
            if (parentEle && nextEle) {
                nextEle.insertBefore(parentEle);
            }
            designFormUtils.activeDropStop();
        });

        $('#btnCopyDesignHtml').click(function (e) {
            // put HTML designed to clipboard
            e.preventDefault();
            navigator.clipboard.writeText(designFormUtils.getDesignFormText()).then().catch(err => console.error('Put data to clipboard raise errors:', err));
        });
        $('#btnExportDesignHtml').click(function (e) {
            // put HTML designed to clipboard
            e.preventDefault();
            const data = designFormUtils.getDesignFormText();
            const blob = new Blob([data], {type: "text/html"});
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = "layout.html";
            link.click();
            URL.revokeObjectURL(url);
        });
    }

    function loadDnD() {
        // ----------------------------------------- //
        //
        //  Group DnD handle in here
        //
        // ----------------------------------------- //


        $(".drag-component").draggable({
            cursor: "crosshair", cursorAt: {top: -5, left: -5},
            revert: "invalid", helper: "clone", start: function (event, ui) {
                designFormUtils.setComponentIDropped($(this))
            }, stop: function (event, ui) {
                designFormUtils.activeDropStop();
            },
        });

        $('.drag-component-child').draggable({
            cursor: "crosshair", cursorAt: {top: 0, left: 0},
            revert: "invalid", helper: function () {
                return $(this).clone().appendTo("body").css({
                    "position": "absolute",
                    "z-index": 9999
                });
            }, start: function (event, ui) {
                ui.helper.data("initialPos", ui.position);
                designFormUtils.setComponentIDropped($(this))
            }, stop: function (event, ui) {
                designFormUtils.activeDropStop()
            },
        });
        $('.drop-content-dnd').droppable({
            accept: ".drag-component", drop: function (event, ui) {
                // stop drag component!
                event.stopPropagation();

                let stateRow = new designFormUtils().generateColumn($(this), event, ui);
                // right negative float util row
                if (stateRow === true) $('.absolute-top-over').css('right', '-' + ($('.util-form-row').first().width() + 1.1 + 6) + 'px');
            }
        });
    }

    // call all function need active
    loadEvents();
    loadDnD();
});
