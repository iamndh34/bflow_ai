/**
 * jQuery Gantt Chart
 *
 * @see http://taitems.github.io/jQuery.Gantt/
 * @license MIT
 */
/*jshint camelcase:true, freeze:true, jquery:true */
(function ($, undefined) {
    "use strict";

    var UTC_DAY_IN_MS = 24 * 60 * 60 * 1000;

    // custom selector `:findday` used to match on specified day in ms.
    //
    // The selector is passed a date in ms and elements are added to the
    // selection filter if the element date matches, as determined by the
    // id attribute containing a parsable date in ms.
    function findDay(elt, text) {
        var cd = new Date(parseInt(text, 10));
        cd.setHours(0, 0, 0, 0);
        var id = $(elt).attr("id") || "";
        var si = id.indexOf("-") + 1;
        var ed = new Date(parseInt(id.substring(si, id.length), 10));
        ed.setHours(0, 0, 0, 0);
        return cd.getTime() === ed.getTime();
    }
    $.expr.pseudos.findday = $.expr.createPseudo ?
        $.expr.createPseudo(function(text) {
            return function(elt) {
                return findDay(elt, text);
            };
        }) :
        function(elt, i, match) {
            return findDay(elt, match[3]);
        };

    // custom selector `:findweek` used to match on specified week in ms.
    function findWeek(elt, text) {
        var cd = new Date(parseInt(text, 10));
        var y = cd.getFullYear();
        var w = cd.getWeekOfYear();
        var m = cd.getMonth();
        if (m === 11 && w === 1) {
            y++;
        } else if (!m && w > 51) {
            y--;
        }
        cd = y + "-" + w;
        var id = $(elt).attr("id") || "";
        var si = id.indexOf("-") + 1;
        var ed = id.substring(si, id.length);
        return cd === ed;
    }
    $.expr.pseudos.findweek = $.expr.createPseudo ?
        $.expr.createPseudo(function(text) {
            return function(elt) {
                return findWeek(elt, text);
            };
        }) :
        function(elt, i, match) {
            return findWeek(elt, match[3]);
        };

    // custom selector `:findmonth` used to match on specified month in ms.
    function findMonth(elt, text) {
        var cd = new Date(parseInt(text, 10));
        cd = cd.getFullYear() + "-" + cd.getMonth();
        var id = $(elt).attr("id") || "";
        var si = id.indexOf("-") + 1;
        var ed = id.substring(si, id.length);
        return cd === ed;
    }
    $.expr[':'].findmonth = $.expr.createPseudo ?
        $.expr.createPseudo(function(text) {
            return function(elt) {
                return findMonth(elt, text);
            };
        }) :
        function(elt, i, match) {
            return findMonth(elt, match[3]);
        };

    // Date prototype helpers
    // ======================

    // `getWeekId` returns a string in the form of 'dh-YYYY-WW', where WW is
    // the week # for the year.
    // It is used to add an id to the week divs
    Date.prototype.getWeekId = function () {
        var y = this.getFullYear();
        var w = this.getWeekOfYear();
        var m = this.getMonth();
        if (m === 11 && w === 1) {
            y++;
        } else if (!m && w > 51) {
            y--;
        }
        return 'dh-' + y + "-" + w;
    };

    // `getRepDate` returns the milliseconds since the epoch for a given date
    // depending on the active scale
    Date.prototype.getRepDate = function (scale) {
        switch (scale) {
        case "hours":
            return this.getTime();
        case "weeks":
            return this.getDayForWeek().getTime();
        case "months":
            return new Date(this.getFullYear(), this.getMonth(), 1).getTime();
        case "days":
            /* falls through */
        default:
            return this.getTime();
        }
    };

    // `getDayOfYear` returns the day number for the year
    Date.prototype.getDayOfYear = function () {
        var year = this.getFullYear();
        return (Date.UTC(year, this.getMonth(), this.getDate()) -
                Date.UTC(year, 0, 0)) / UTC_DAY_IN_MS;
    };

    // Use ISO week by default
    //TODO: make these options.
    var firstDay = 1; // ISO week starts with Monday (1); use Sunday (0) for, e.g., North America
    var weekOneDate = 4; // ISO week one always contains 4 Jan; use 1 Jan for, e.g., North America

    // `getWeekOfYear` returns the week number for the year
    //TODO: fix bug when firstDay=6/weekOneDate=1 : https://github.com/moment/moment/issues/2115
    Date.prototype.getWeekOfYear = function () {
        var year = this.getFullYear(),
            month = this.getMonth(),
            date = this.getDate(),
            day = this.getDay();
        //var diff = weekOneDate - day + 7 * (day < firstDay ? -1 : 1);
        var diff = weekOneDate - day;
        if (day < firstDay) {
            diff -= 7;
        }
        if (diff + 7 < weekOneDate - firstDay) {
            diff += 7;
        }
        return Math.ceil(new Date(year, month, date + diff).getDayOfYear() / 7);
    };

    // `getDayForWeek` returns the first day of this Date's week
    Date.prototype.getDayForWeek = function () {
        var day = this.getDay();
        var diff = (day < firstDay ? -7 : 0) + firstDay - day;
        return new Date( this.getFullYear(), this.getMonth(), this.getDate() + diff );
    };

    $.fn.gantt = function (options) {

        var scales = ["hours", "days", "weeks", "months"];
        //Default settings
        var settings = {
            source: [],
            holidays: [],
            // paging
            itemsPerPage: 7,
            // localisation
            dow: ["S", "M", "T", "W", "T", "F", "S"],
            months: ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"],
            waitText: "Please wait...",
            // navigation
            navigate: "buttons",
            scrollToToday: true,
            // cookie options
            useCookie: false,
            cookieKey: "jquery.fn.gantt",
            // scale parameters
            scale: "days",
            maxScale: "months",
            minScale: "hours",
            // callbacks
            onItemClick: function (data) {  },
            onAddClick: function (dt, rowId) {  },
            onRender: $.noop
        };

        // read options
        $.extend(settings, options);

        // can't use cookie if don't have `$.cookie`
        settings.useCookie = settings.useCookie && $.isFunction($.cookie);

        // Grid management
        // ===============

        // Core object is responsible for navigation and rendering
        var core = {
            // Return the element whose topmost point lies under the given point
            // Normalizes for old browsers (NOTE: doesn't work when element is outside viewport)
            //TODO: https://github.com/taitems/jQuery.Gantt/issues/137
            elementFromPoint: (function(){ // IIFE
                // version for normal browsers
                if (document.compatMode === "CSS1Compat") {
                    return function (x, y) {
                        x -= window.pageXOffset;
                        y -= window.pageYOffset;
                        return document.elementFromPoint(x, y);
                    };
                }
                // version for older browsers
                return function (x, y) {
                    x -= $(document).scrollLeft();
                    y -= $(document).scrollTop();
                    return document.elementFromPoint(x, y);
                };
            })(),

            // **Create the chart**
            create: function (element) {

                // Initialize data with a json object or fetch via an xhr
                // request depending on `settings.source`
                if (typeof settings.source !== "string") {
                    element.data = settings.source;
                    core.init(element);
                } else {
                    $.getJSON(settings.source, function (jsData) {
                        element.data = jsData;
                        core.init(element);
                    });
                }
            },

            // **Setup the initial view**
            // Here we calculate the number of rows, pages and visible start
            // and end dates once the data are ready
            init: function (element) {
                element.rowsNum = element.data.length;
                element.pageCount = Math.ceil(element.rowsNum / settings.itemsPerPage);
                element.rowsOnLastPage = element.rowsNum - (Math.floor(element.rowsNum / settings.itemsPerPage) * settings.itemsPerPage);

                element.dateStart = tools.getMinDate(element);
                element.dateEnd = tools.getMaxDate(element);


                /* core.render(element); */
                core.waitToggle(element, function () { core.render(element); });
            },

            //hide and show columns
            render_filter_columns: function (element) {
                let row = $('<div class="col-xs-12 filter_bar"></div>')
                let dropdown = $(`<div class="dropdown filter_column"><button class="btn btn-primary dropdown-toggle btn-sm" aria-expanded="false" data-bs-toggle="dropdown" title="${$.fn.gettext('Filter')}"><i class="fa-solid fa-filter"></i></button></div>`)
                dropdown.find('button').tooltip({'placement': 'top'})
                let ul = $('<ul class="dropdown-menu"></ul>')
                settings.columns.forEach(x => {
                    let li = $('<li class="dropdown-item-marker" role="menuitem"></li>')
                    let label = $('<label></label>')
                    let input = $(`<input class="checkbox_column" type="checkbox" data-field="${x.value}" value="${x.value}" ${x.show ? 'checked="checked"' : ''}>`)
                    input.click(function () {
                        let column = $(this).attr('value')
                        settings.columns.forEach(item => {
                            if (item.value == column) item.show = $(this).is(":checked")
                        })
                        $('.leftPanel').replaceWith(core.leftPanel(element))
                        const $dataPanel = $('.dataPanel'), $rightPanel = $('.rightPanel');
                        element.scrollNavigation.panelMaxPos = ($dataPanel.width() - $rightPanel.width());
                        element.scrollNavigation.canScroll = ($dataPanel.width() > $rightPanel.width());
                        $dataPanel.css({ "left": element.hPosition });
                    })
                    label.append(input)
                    label.append(`<span style="padding-left: 5px">${x.label}</span>`)
                    li.append(label)
                    ul.append(li)
                })
                dropdown.append(ul)

                let button_reload = $('<button type="button" style="display: none" id="gantt_reload"></button>')
                button_reload.on("click", function (event) {
                    let data = $(this).data('data');
                    settings.source = data ? data : settings.source
                    settings.itemsPerPage = settings.source.length
                    element.data = data ? data : settings.source
                    if (data?.count) {
                        settings.pageNum = 1
                        let count = data ? data.count : 0
                        let pageSize = data ? data.page_size : 1
                        settings.pageCount = count % pageSize == 0 ? parseInt(count / pageSize) : (count - count % pageSize) / pageSize + 1
                    }
                    core.init(element)

                });

                let button_loadMore = $(`<button class="btn btn-primary btn-sm" type="button" id="gantt_load-more_btn" title="${$.fn.gettext('Load more')}">` +
                    `<i class="fa-solid fa-download"></i><span>${$.fn.gettext("Load more")}</span></button>`);
                button_loadMore.tooltip({'placement': 'top'})
                button_loadMore.on('click', function(e){
                    $(this).prop('disabled', true)
                    settings.clickLoadMore(e)
                })

                row.append(button_reload).append(dropdown).append(button_loadMore)
                return row
            },

            // **Render the grid**
            render: function (element) {
                var content = $('<div class="fn-content"/>');
                var $leftPanel = core.leftPanel(element);
                var $filterPanel = core.render_filter_columns(element);
                var $rightPanel = core.rightPanel(element, $leftPanel);
                var pLeft, hPos;

                if (settings.isShowSetting){
                    $filterPanel.append(core.navigation(element))
                    content.append($filterPanel)
                }
                // content.append($leftPanel).append($rightPanel).append(core.navigation(element));
                content.append($leftPanel).append($rightPanel);

                var $dataPanel = $rightPanel.find(".dataPanel");

                element.gantt = $('<div class="fn-gantt" />').append(content);

                $(element).empty().append(element.gantt);

                element.scrollNavigation.panelMargin = parseInt($dataPanel.css("left").replace("px", ""), 10);
                element.scrollNavigation.panelMaxPos = ($dataPanel.width() - $rightPanel.width());

                element.scrollNavigation.canScroll = ($dataPanel.width() > $rightPanel.width());

                core.markNow(element);
                core.fillData(element, $dataPanel, $leftPanel);

                // Set a cookie to record current position in the view
                if (settings.useCookie) {
                    var sc = $.cookie(settings.cookieKey + "ScrollPos");
                    if (sc) {
                        element.hPosition = sc;
                    }
                }

                // Scroll the grid to today's date
                if (settings.scrollToToday) {
                    core.navigateTo(element, 'now');
                    core.scrollPanel(element, 0);
                // or, scroll the grid to the left most date in the panel
                } else {
                    if (element.hPosition !== 0) {
                        if (element.scaleOldWidth) {
                            pLeft = ($dataPanel.width() - $rightPanel.width());
                            hPos = pLeft * element.hPosition / element.scaleOldWidth;
                            element.hPosition = hPos > 0 ? 0 : hPos;
                            element.scaleOldWidth = null;
                        }
                        $dataPanel.css({ "left": element.hPosition });
                        element.scrollNavigation.panelMargin = element.hPosition;
                    }
                    core.repositionLabel(element);
                }

                $dataPanel.css({ height: $leftPanel.height() });
                core.waitToggle(element);
                settings.onRender();
            },

            // Create and return the left panel with labels
            leftPanel: function (element) {
                /* Left panel */
                var ganttLeftPanel = $('<div class="leftPanel"/>')
                    .append($('<div class="row spacer"/>')
                    .css("height", tools.getCellSize() * element.headerRows));

                // create column label
                let column_labels = $(`<div class="column-header"></div>`),
                withLeftPanel = 1
                settings.columns.filter(x => x.show).forEach(x => {
                    withLeftPanel += parseInt(x.width) + 5
                    column_labels.append(`<span class="fn-label ${x.value !=='title' ? 'text-center' : ''}" style="width:${x.width}px">${x.label}</span>`);
                })
                ganttLeftPanel.find('.row').append(column_labels);
                const $trans =  $('#trans-factory')
                let divScroll = $('<div class="left-container"></div>'),
                    priorityList = {
                        0: {color: 'success', txt: $trans.attr('data-low')},
                        1: {color: 'warning', txt: $trans.attr('data-med')},
                        2: {color: 'danger', txt: $trans.attr('data-hig')}
                    }
                let isVisibleList = element.data.filter((item) => item?.is_visible || !item.hasOwnProperty('is_visible'))
                $.each(isVisibleList, function (i, entry) {
                    let row = null
                    if (i >= element.pageNum * settings.itemsPerPage &&
                        i < (element.pageNum * settings.itemsPerPage + settings.itemsPerPage)) {
                        const dataId = entry?.id || '';
                        row = $(`<div class="row name row${i} fn-wide" id="rowheader${i}" data-offset="${
                            i % settings.itemsPerPage * tools.getCellSize()}" data-id="${dataId}"></div>`)
                        // loop trong danh sách dc show lấy key và show ra danh sách bên trái
                        if (entry.values){
                            settings.columns.filter(x => x.show).forEach(x => {
                                // kiểm tra item có trong danh sách muốn show hay không (x.value là key data)
                                if (entry.values[0].dataObj.hasOwnProperty(x.value)) {
                                    // depend content row
                                    let span = $(`<span class="fn-label" style="width:${x.width}px"></span>`);
                                    if (entry.desc && x.value === 'title') {
                                        span.css("padding-left", "65px")
                                        row.removeClass('name').addClass('desc')
                                    }
                                    if (entry.show_expand && entry.name && x.value === 'title'){
                                        span.addClass(`has_child ${entry.is_expand ? 'is_expanded' : 'is_expand'}`)
                                        const spanIcon = $(`<span class="icon-scaret text-blue"><i class="icon-collapse fas fa-caret-${entry.is_expand ? 'down': 'right'}"></i></span>`)
                                        span.append(spanIcon)
                                        spanIcon.on('click', () => {
                                            settings.onClickParent(entry.values[0].dataObj.id)
                                        });
                                    }
                                    if (x.value === 'title'){
                                        const spanTit = $(`<span class="fn-label-txt">${entry.name ? entry.name : entry.desc}</span>`)
                                        span.append(spanTit)
                                        spanTit.on('click', ()=>{
                                            settings.loadTaskInfo(entry.values[0].dataObj.id)
                                        });
                                    }
                                    else {
                                        let value = entry.values[0].dataObj[x.value], valType = $.type(value);
                                        if (valType === "object"){ // nếu key là object
                                            let avClass = 'avatar-xxs avatar-' + $x.fn.randomColor()
                                            const nameHTML = $x.fn.renderAvatar(value, avClass,"","full_name")
                                            span.append(nameHTML).addClass(x.value === 'employee_created' ?
                                                'text-right' : 'text-left')
                                        }
                                        else if (x.value === 'priority') {
                                            const $badge = $(`<span class="badge badge-sm badge-${priorityList[value].color}">${priorityList[value].txt}</span>`);
                                            span.append($badge).addClass('text-center')
                                        }
                                        else if (x.value.includes('_date') !== -1){
                                            span.append(moment(value).format('DD/MM/YYYY')).addClass('text-center')
                                        }
                                    }
                                    row.attr('data-id', entry.values[0].dataObj.id).append(span);
                                }
                            });
                            divScroll.append(row)
                        } // end if (entry.values)
                    }
                });
                // return ganttLeftPanel.append(entries.join(""));
                ganttLeftPanel.append(divScroll);
                ganttLeftPanel.css('width', withLeftPanel)
                return ganttLeftPanel;
            },

            // Create and return the data panel element
            dataPanel: function (element, width) {
                var wheel = 'onwheel' in element ?
                    'wheel' : document.onmousewheel !== undefined ?
                    'mousewheel' : 'DOMMouseScroll',
                    dataPanel = $('<div class="dataPanel" style="width: ' + width + 'px;"/>');

                // Handle mousewheel events for scrolling the data panel
                function callbackWheel(mutations, observer) {
                    $('.rightPanel', element).on(wheel, function (e) {
                        core.wheelScroll(element, e);
                    });
                    observer.disconnect();
                }

                let observer = new MutationObserver(callbackWheel);
                observer.observe(element, {childList: true, subtree: true});

                // Handle click events and dispatch to registered `onAddClick` function
                dataPanel.click(function (e) {
                    e.stopPropagation();
                    var corrX/* <- never used? */, corrY;
                    var leftpanel = $(element).find(".fn-gantt .leftPanel");
                    var datapanel = $(element).find(".fn-gantt .dataPanel");
                    switch (settings.scale) {
                    case "months":
                        corrY = tools.getCellSize();
                        break;
                    case "hours":
                        corrY = tools.getCellSize() * 4;
                        break;
                    case "days":
                        corrY = tools.getCellSize() * 3;
                        break;
                    case "weeks":
                        /* falls through */
                    default:
                        corrY = tools.getCellSize() * 2;
                    }

                    /* Adjust, so get middle of elm
                    corrY -= Math.floor(tools.getCellSize() / 2);
                    */

                    // Find column where click occurred
                    var col = core.elementFromPoint(e.pageX, datapanel.offset().top + corrY);
                    // Was the label clicked directly?
                    if (col.className === "fn-label") {
                        col = $(col.parentNode);
                    } else {
                        col = $(col);
                    }

                    var dt = col.data("repdate");
                    // Find row where click occurred
                    var row = core.elementFromPoint(leftpanel.offset().left + leftpanel.width() - 10, e.pageY);
                    // Was the label clicked directly?
                    if (row.className.indexOf("fn-label") === 0) {
                        row = $(row.parentNode);
                    } else {
                        row = $(row);
                    }
                    var rowId = row.data('id');

                    // Dispatch user registered function with the DateTime in ms
                    // and the id if the clicked object is a row
                    settings.onAddClick(dt, rowId);
                });
                return dataPanel;
            },

            // Creates and return the right panel containing the year/week/day header
            rightPanel: function (element, leftPanel /* <- never used? */) {
                var range = null;
                // Days of the week have a class of one of
                // `sn` (Sunday), `sa` (Saturday), or `wd` (Weekday)
                var dowClass = ["sn", "wd", "wd", "wd", "wd", "wd", "sa"];
                //unused: was someone planning to allow styles to stretch to the bottom of the chart?
                //var gridDowClass = [" sn", "", "", "", "", "", " sa"];

                var yearArr = [];
                var scaleUnitsThisYear = 0;

                var monthArr = [];
                var scaleUnitsThisMonth = 0;

                var dayArr = [];
                var hoursInDay = 0;

                var dowArr = [];
                var horArr = [];

                var today = new Date();
                today.setHours(0, 0, 0, 0);

                // reused variables
                var $row = $('<div class="row header"></div>');
                var i, len;
                var year, month, week, day;
                var rday, dayClass;
                var dataPanel, dataPanelWidth;

                // Setup the headings based on the chosen `settings.scale`
                switch (settings.scale) {
                // **Hours**
                case "hours":
                    range = tools.parseTimeRange(element.dateStart, element.dateEnd, element.scaleStep);
                    dataPanelWidth = range.length * tools.getCellSize();

                    year = range[0].getFullYear();
                    month = range[0].getMonth();
                    day = range[0];

                    for (i = 0, len = range.length; i < len; i++) {
                        rday = range[i];

                        // Fill years
                        var rfy = rday.getFullYear();
                        if (rfy !== year) {
                            yearArr.push(
                                '<div class="row year" style="width: ' +
                                tools.getCellSize() * scaleUnitsThisYear +
                                'px;"><div class="fn-label">' +
                                year +
                                '</div></div>');

                            year = rfy;
                            scaleUnitsThisYear = 0;
                        }
                        scaleUnitsThisYear++;


                        // Fill months
                        var rm = rday.getMonth();
                        if (rm !== month) {
                            monthArr.push(
                                '<div class="row month" style="width: ' +
                                tools.getCellSize() * scaleUnitsThisMonth + 'px"><div class="fn-label">' +
                                settings.months[month] +
                                '</div></div>');

                            month = rm;
                            scaleUnitsThisMonth = 0;
                        }
                        scaleUnitsThisMonth++;

                        // Fill days & hours
                        var rgetDay = rday.getDay();
                        var getDay = day.getDay();
                        if (rgetDay !== getDay) {
                            dayClass = (today - day === 0) ?
                                "today" : tools.isHoliday( day.getTime() ) ?
                                "holiday" : dowClass[getDay];

                            dayArr.push(
                                '<div class="row date ' + dayClass + '" ' +
                                'style="width: ' + tools.getCellSize() * hoursInDay + 'px;">' +
                                '<div class="fn-label">' + day.getDate() + '</div></div>');
                            dowArr.push(
                                '<div class="row day ' + dayClass + '" ' +
                                'style="width: ' + tools.getCellSize() * hoursInDay + 'px;">' +
                                '<div class="fn-label">' + settings.dow[getDay] + '</div></div>');

                            day = rday;
                            hoursInDay = 0;
                        }
                        hoursInDay++;

                        dayClass = dowClass[rgetDay];
                        if (tools.isHoliday(rday)) {
                            dayClass = "holiday";
                        }
                        horArr.push(
                            '<div class="row day ' +
                            dayClass +
                            '" id="dh-' +
                            rday.getTime() +
                            '" data-offset="' + i * tools.getCellSize() +
                            '" data-repdate="' + rday.getRepDate(settings.scale) +
                            '"><div class="fn-label">' +
                            rday.getHours() +
                            '</div></div>');
                    }

                    // Last year
                    yearArr.push(
                        '<div class="row year" style="width: ' +
                        tools.getCellSize() * scaleUnitsThisYear + 'px;"><div class="fn-label">' +
                        year +
                        '</div></div>');

                    // Last month
                    monthArr.push(
                        '<div class="row month" style="width: ' +
                        tools.getCellSize() * scaleUnitsThisMonth + 'px"><div class="fn-label">' +
                        settings.months[month] +
                        '</div></div>');

                    dayClass = dowClass[day.getDay()];

                    if ( tools.isHoliday(day) ) {
                        dayClass = "holiday";
                    }

                    dayArr.push(
                        '<div class="row date ' + dayClass + '" ' +
                        'style="width: ' + tools.getCellSize() * hoursInDay + 'px;">' +
                        '<div class="fn-label">' + day.getDate() + '</div></div>');

                    dowArr.push(
                        '<div class="row day ' + dayClass + '" ' +
                        'style="width: ' + tools.getCellSize() * hoursInDay + 'px;">' +
                        '<div class="fn-label">' + settings.dow[day.getDay()] + '</div></div>');

                    dataPanel = core.dataPanel(element, dataPanelWidth);

                    // Append panel elements
                    dataPanel.append(
                        $row.clone().html(yearArr.join("")),
                        $row.clone().html(monthArr.join("")),
                        $row.clone().html(dayArr.join("")),
                        $row.clone().html(dowArr.join("")),
                        $row.clone().html(horArr.join(""))
                    );
                    break;

                // **Weeks**
                case "weeks":
                    range = tools.parseWeeksRange(element.dateStart, element.dateEnd);
                    dataPanelWidth = range.length * tools.getCellSize();

                    year = range[0].getFullYear();
                    month = range[0].getMonth();
                    week = range[0].getWeekOfYear();
                    var diff;

                    for (i = 0, len = range.length; i < len; i++) {
                        rday = range[i];

                        // Fill years
                        if (week > (week = rday.getWeekOfYear())) {
                            // partial weeks to subtract from year header
                            diff = rday.getDate() - 1;
                            // offset one month (December) if week starts in last year
                            diff -= !rday.getMonth() ? 0 : 31;
                            diff /= 7;
                            yearArr.push(
                                '<div class="row year" style="width: ' +
                                tools.getCellSize() * (scaleUnitsThisYear - diff) +
                                'px;"><div class="fn-label">' +
                                year +
                                '</div></div>');
                            year++;
                            scaleUnitsThisYear = diff;
                        }
                        scaleUnitsThisYear++;

                        // Fill months
                        if (rday.getMonth() !== month) {
                            // partial weeks to subtract from month header
                            diff = rday.getDate() - 1;
                            // offset one week if week starts in last month
                            //diff -= (diff <= 6) ? 0 : 7;
                            diff /= 7;
                            monthArr.push(
                                '<div class="row month" style="width:' +
                                tools.getCellSize() * (scaleUnitsThisMonth - diff) +
                                'px;"><div class="fn-label">' +
                                settings.months[month] +
                                '</div></div>');
                            month = rday.getMonth();
                            scaleUnitsThisMonth = diff;
                        }
                        scaleUnitsThisMonth++;

                        // Fill weeks
                        dayArr.push(
                            '<div class="row day wd"' +
                            ' id="' + rday.getWeekId() +
                            '" data-offset="' + i * tools.getCellSize() +
                            '" data-repdate="' + rday.getRepDate(settings.scale) + '">' +
                            '<div class="fn-label">' + week + '</div></div>');
                    }

                    // Last year
                    yearArr.push(
                        '<div class="row year" style="width: ' +
                        tools.getCellSize() * scaleUnitsThisYear + 'px;"><div class="fn-label">' +
                        year +
                        '</div></div>');

                    // Last month
                    monthArr.push(
                        '<div class="row month" style="width: ' +
                        tools.getCellSize() * scaleUnitsThisMonth + 'px"><div class="fn-label">' +
                        settings.months[month] +
                        '</div></div>');

                    dataPanel = core.dataPanel(element, dataPanelWidth);

                    // Append panel elements
                    dataPanel.append(
                        $row.clone().html(yearArr.join("")),
                        $row.clone().html(monthArr.join("")),
                        $row.clone().html(dayArr.join(""))
                    );
                    break;

                // **Months**
                case 'months':
                    range = tools.parseMonthsRange(element.dateStart, element.dateEnd);
                    dataPanelWidth = range.length * tools.getCellSize();

                    year = range[0].getFullYear();
                    month = range[0].getMonth();

                    for (i = 0, len = range.length; i < len; i++) {
                        rday = range[i];

                        // Fill years
                        if (rday.getFullYear() !== year) {
                            yearArr.push(
                                '<div class="row year" style="width: ' +
                                tools.getCellSize() * scaleUnitsThisYear +
                                'px;"><div class="fn-label">' +
                                year +
                                '</div></div>');
                            year = rday.getFullYear();
                            scaleUnitsThisYear = 0;
                        }
                        scaleUnitsThisYear++;
                        monthArr.push(
                            '<div class="row day wd" id="dh-' + tools.genId(rday) +
                            '" data-offset="' + i * tools.getCellSize() +
                            '" data-repdate="' + rday.getRepDate(settings.scale) + '">' +
                            (1 + rday.getMonth()) + '</div>');
                    }

                    // Last year
                    yearArr.push(
                        '<div class="row year" style="width: ' +
                        tools.getCellSize() * scaleUnitsThisYear + 'px;"><div class="fn-label">' +
                        year +
                        '</div></div>');

                    dataPanel = core.dataPanel(element, dataPanelWidth);

                    // Append panel elements
                    dataPanel.append(
                        $row.clone().html(yearArr.join("")),
                        $row.clone().html(monthArr.join(""))
                    );
                    break;

                // **Days (default)**
                default:
                    range = tools.parseDateRange(element.dateStart, element.dateEnd);
                    dataPanelWidth = range.length * tools.getCellSize();

                    year = range[0].getFullYear();
                    month = range[0].getMonth();

                    for (i = 0, len = range.length; i < len; i++) {
                        rday = range[i];

                        // Fill years
                        if (rday.getFullYear() !== year) {
                            yearArr.push(
                                '<div class="row year" style="width:' +
                                tools.getCellSize() * scaleUnitsThisYear +
                                'px;"><div class="fn-label">' +
                                year +
                                '</div></div>');
                            year = rday.getFullYear();
                            scaleUnitsThisYear = 0;
                        }
                        scaleUnitsThisYear++;

                        // Fill months
                        if (rday.getMonth() !== month) {
                            monthArr.push(
                                '<div class="row month" style="width:' +
                                tools.getCellSize() * scaleUnitsThisMonth +
                                'px;"><div class="fn-label">' +
                                settings.months[month] +
                                '</div></div>');
                            month = rday.getMonth();
                            scaleUnitsThisMonth = 0;
                        }
                        scaleUnitsThisMonth++;

                        day = rday.getDay();
                        dayClass = dowClass[day];
                        if ( tools.isHoliday(rday) ) {
                            dayClass = "holiday";
                        }

                        dayArr.push(
                            '<div class="row date ' + dayClass + '"' +
                            ' id="dh-' + tools.genId(rday) +
                            '" data-offset="' + i * tools.getCellSize() +
                            '" data-repdate="' + rday.getRepDate(settings.scale) + '">' +
                            '<div class="fn-label">' + rday.getDate() + '</div></div>');
                        dowArr.push(
                            '<div class="row day ' + dayClass + '"' +
                            ' id="dw-' + tools.genId(rday) +
                            '" data-repdate="' + rday.getRepDate(settings.scale) + '">' +
                            '<div class="fn-label">' + settings.dow[day] + '</div></div>');
                    } //for

                    // Last year
                    yearArr.push(
                        '<div class="row year" style="width: ' +
                        tools.getCellSize() * scaleUnitsThisYear + 'px;"><div class="fn-label">' +
                        year +
                        '</div></div>');

                    // Last month
                    monthArr.push(
                        '<div class="row month" style="width: ' +
                        tools.getCellSize() * scaleUnitsThisMonth + 'px"><div class="fn-label">' +
                        settings.months[month] +
                        '</div></div>');

                    dataPanel = core.dataPanel(element, dataPanelWidth);

                    // Append panel elements
                    dataPanel.append(
                        $row.clone().html(yearArr.join("")),
                        $row.clone().html(monthArr.join("")),
                        $row.clone().html(dayArr.join("")),
                        $row.clone().html(dowArr.join(""))
                    );
                }

                return $('<div class="rightPanel"></div>').append(dataPanel);
            },

            // **Navigation**
            navigation: function (element) {
                var ganttNavigate = null;
                // Scrolling navigation is provided by setting
                // `settings.navigate='scroll'`
                if (settings.navigate === "scroll") {
                    ganttNavigate = $('<div class="navigate" />')
                        .append($('<div class="nav-slider" />')
                            .append($('<div class="nav-slider-left" />')
                                .append($(`<button type="button" class="btn btn-primary btn-sm nav-page-back" title="${$.fn.gettext("Prev")}"/>`)
                                    .html('<svg fill="#000000" width="20px" height="20px" viewBox="0 0 0.6 0.6" id="up" data-name="Flat Color" xmlns="http://www.w3.org/2000/svg" class="icon flat-color"><path id="primary" d="m0.492 0.233 -0.175 -0.175a0.025 0.025 0 0 0 -0.036 0l-0.175 0.175a0.025 0.025 0 0 0 0.036 0.036L0.275 0.135V0.525a0.025 0.025 0 0 0 0.05 0V0.135l0.133 0.133a0.025 0.025 0 0 0 0.036 0 0.025 0.025 0 0 0 0 -0.036" style="fill: rgb(255, 255, 255);"/></svg>')
                                    .click(function () {
                                        core.navigatePage(element, -1);
                                    })
                                    .tooltip({placement: 'top'}))
                                .append($('<div class="page-number"/>')
                                        .append($('<span/>')
                                            .html(element.pageNum + 1 + ' / ' + element.pageCount)))
                                .append($(`<button type="button" class="btn btn-primary btn-sm nav-page-next" title="${$.fn.gettext("Next")}"/>`)
                                    .html('<svg fill="#000000" width="20px" height="20px" viewBox="0 0 0.6 0.6" id="down" data-name="Flat Color" xmlns="http://www.w3.org/2000/svg" class="icon flat-color"><path id="primary" d="M0.493 0.332a0.025 0.025 0 0 0 -0.035 0L0.325 0.465V0.075a0.025 0.025 0 0 0 -0.05 0v0.39l-0.132 -0.133a0.025 0.025 0 0 0 -0.035 0.035l0.175 0.175a0.025 0.025 0 0 0 0.035 0l0.175 -0.175a0.025 0.025 0 0 0 0 -0.035" style="fill: rgb(255,255,255);"/></svg>')
                                    .click(function () {
                                        core.navigatePage(element, 1);
                                    }).tooltip({placement: 'top'}))
                                .append($(`<button type="button" class="btn btn-primary btn-sm nav-now" title="${$.fn.gettext("Today")}"/>`)
                                    .html('<i class="fa-regular fa-clock"></i>')
                                    .click(function () {
                                        core.navigateTo(element, 'now');
                                    }).tooltip({placement: 'top'}))
                                .append($(`<button type="button" class="btn btn-primary btn-sm nav-prev-week" title="${$.fn.gettext("Jump prev")}"/>`)
                                    .html('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="20px" height="20px"><polyline style="fill:none;stroke:#ffffff;stroke-width:2;stroke-miterlimit:10;" points="16.6,26.5 6.1,16 16.6,5.5 "/><polyline style="fill:none;stroke:#ffffff;stroke-width:2;stroke-miterlimit:10;" points="23.6,26.5 13.1,16 23.6,5.5 "/></svg>')
                                    .click(function () {
                                        if (settings.scale === 'hours') {
                                            core.navigateTo(element, tools.getCellSize() * 8);
                                        } else if (settings.scale === 'days') {
                                            core.navigateTo(element, tools.getCellSize() * 30);
                                        } else if (settings.scale === 'weeks') {
                                            core.navigateTo(element, tools.getCellSize() * 12);
                                        } else if (settings.scale === 'months') {
                                            core.navigateTo(element, tools.getCellSize() * 6);
                                        }
                                    }).tooltip({placement: 'top'}))
                                .append($(`<button type="button" class="btn btn-primary btn-sm nav-prev-day" title="${$.fn.gettext("Slider prev")}"/>`)
                                    .html('<svg fill="#ffffff" width="20px" height="20px" viewBox="-1.963 0 12.8 12.8" xmlns="http://www.w3.org/2000/svg"><title>left</title><path d="m6.425 1.6 0.85 0.85L3.2 6.55l4.075 4.1 -0.85 0.85 -4.9 -4.95z"/></svg>')
                                    .click(function () {
                                        if (settings.scale === 'hours') {
                                            core.navigateTo(element, tools.getCellSize() * 4);
                                        } else if (settings.scale === 'days') {
                                            core.navigateTo(element, tools.getCellSize() * 7);
                                        } else if (settings.scale === 'weeks') {
                                            core.navigateTo(element, tools.getCellSize() * 4);
                                        } else if (settings.scale === 'months') {
                                            core.navigateTo(element, tools.getCellSize() * 3);
                                        }
                                    }).tooltip({placement: 'top'})))
                            .append($('<div class="nav-slider-content" />')
                                    .append($('<div class="nav-slider-bar" />')
                                            .append($('<a class="nav-slider-button" />')
                                                )
                                                .mousedown(function (e) {
                                                    e.preventDefault();
                                                    element.scrollNavigation.scrollerMouseDown = true;
                                                    core.sliderScroll(element, e);
                                                })
                                                .mousemove(function (e) {
                                                    if (element.scrollNavigation.scrollerMouseDown) {
                                                        core.sliderScroll(element, e);
                                                    }
                                                })
                                            )
                                        )
                            .append($('<div class="nav-slider-right" />')
                                .append($(`<button type="button" class="btn btn-primary btn-sm nav-next-day" title="${$.fn.gettext("Slider next")}"/>`)
                                    .html('<svg fill="#ffffff" width="20px" height="20px" viewBox="-1.925 0 12.8 12.8" xmlns="http://www.w3.org/2000/svg"><title>right</title><path d="m2.45 11.5 -0.85 -0.85 4.075 -4.1L1.6 2.45l0.85 -0.85 4.9 4.95z"/></svg>')
                                    .click(function () {
                                        if (settings.scale === 'hours') {
                                            core.navigateTo(element, tools.getCellSize() * -4);
                                        } else if (settings.scale === 'days') {
                                            core.navigateTo(element, tools.getCellSize() * -7);
                                        } else if (settings.scale === 'weeks') {
                                            core.navigateTo(element, tools.getCellSize() * -4);
                                        } else if (settings.scale === 'months') {
                                            core.navigateTo(element, tools.getCellSize() * -3);
                                        }
                                    }).tooltip({placement: 'top'}))
                            .append($(`<button type="button" class="btn btn-primary btn-sm nav-next-week" title="${$.fn.gettext("Jump next")}"/>`)
                                    .html('<svg  xmlns="http://www.w3.org/2000/svg"  viewBox="0 0 32 32" width="20px" height="20px"><polyline style="fill:none;stroke:#ffffff;stroke-width:2;stroke-miterlimit:10;" points="15.4,5.5 25.9,16 15.4,26.5 "/><polyline style="fill:none;stroke:#ffffff;stroke-width:2;stroke-miterlimit:10;" points="8.4,5.5 18.9,16 8.4,26.5 "/></svg>')
                                    .click(function () {
                                        if (settings.scale === 'hours') {
                                            core.navigateTo(element, tools.getCellSize() * -8);
                                        } else if (settings.scale === 'days') {
                                            core.navigateTo(element, tools.getCellSize() * -30);
                                        } else if (settings.scale === 'weeks') {
                                            core.navigateTo(element, tools.getCellSize() * -12);
                                        } else if (settings.scale === 'months') {
                                            core.navigateTo(element, tools.getCellSize() * -6);
                                        }
                                    }).tooltip({placement: 'top'}))
                                .append($(`<button type="button" class="btn btn-primary btn-sm nav-zoomIn" title="${$.fn.gettext("Zoom in")}"/>`)
                                    .html('<svg fill="#ffffff" xmlns="http://www.w3.org/2000/svg" width="20px" height="20px" viewBox="0 0 1.3 1.3" enable-background="new 0 0 52 52" xml:space="preserve"><g><path d="M0.775 0.475h-0.15v-0.15c0 -0.015 -0.01 -0.025 -0.025 -0.025h-0.1c-0.015 0 -0.025 0.01 -0.025 0.025v0.15h-0.15c-0.015 0 -0.025 0.01 -0.025 0.025v0.1c0 0.015 0.01 0.025 0.025 0.025h0.15v0.15c0 0.015 0.01 0.025 0.025 0.025h0.1c0.015 0 0.025 -0.01 0.025 -0.025v-0.15h0.15c0.015 0 0.025 -0.01 0.025 -0.025v-0.1c0 -0.015 -0.01 -0.025 -0.025 -0.025"/></g><path d="M1.24 1.13 0.953 0.845C1.012 0.763 1.05 0.66 1.05 0.55c0 -0.275 -0.225 -0.5 -0.5 -0.5S0.05 0.275 0.05 0.55s0.225 0.5 0.5 0.5c0.11 0 0.213 -0.038 0.295 -0.098l0.288 0.288c0.015 0.015 0.038 0.015 0.053 0l0.053 -0.053c0.015 -0.015 0.015 -0.04 0.003 -0.057M0.55 0.9c-0.193 0 -0.35 -0.158 -0.35 -0.35S0.358 0.2 0.55 0.2s0.35 0.158 0.35 0.35 -0.158 0.35 -0.35 0.35"/></svg>')
                                    .click(function () {
                                        core.zoomInOut(element, -1);
                                    }).tooltip({placement: 'top'}))
                                .append($(`<button type="button" class="btn btn-primary btn-sm nav-zoomOut" title="${$.fn.gettext("Zoom out")}"/>`)
                                    .html('<svg fill="#ffffff" xmlns="http://www.w3.org/2000/svg" width="20px" height="20px" viewBox="0 0 1.3 1.3" enable-background="new 0 0 52 52" xml:space="preserve"><g><path d="M0.475 0.625h0.3c0.015 0 0.025 -0.01 0.025 -0.025v-0.1c0 -0.015 -0.01 -0.025 -0.025 -0.025H0.475"/></g><g><path d="M0.475 0.475h-0.15c-0.015 0 -0.025 0.01 -0.025 0.025v0.1c0 0.015 0.01 0.025 0.025 0.025h0.15"/></g><path d="M1.24 1.133 0.953 0.845C1.012 0.763 1.05 0.66 1.05 0.55c0 -0.275 -0.225 -0.5 -0.5 -0.5S0.05 0.275 0.05 0.55s0.225 0.5 0.5 0.5c0.11 0 0.213 -0.038 0.295 -0.098l0.288 0.288c0.015 0.015 0.038 0.015 0.053 0l0.053 -0.053c0.015 -0.015 0.015 -0.04 0.003 -0.055M0.55 0.9c-0.193 0 -0.35 -0.158 -0.35 -0.35S0.358 0.2 0.55 0.2s0.35 0.158 0.35 0.35 -0.158 0.35 -0.35 0.35"/></svg>')
                                    .click(function () {
                                        core.zoomInOut(element, 1);
                                    }).tooltip({placement: 'top'}))
                                    )
                                );
                    $(document).mouseup(function () {
                        element.scrollNavigation.scrollerMouseDown = false;
                    });
                // Button navigation is provided by setting `settings.navigation='buttons'`
                } else {
                    ganttNavigate = $('<div class="navigate" />')
                        .append($('<button type="button" class="nav-link nav-page-back"/>')
                            .html('&uarr;')
                            .click(function () {
                                core.navigatePage(element, -1);
                            }))
                        .append($('<div class="page-number"/>')
                                .append($('<span/>')
                                    .html(element.pageNum + 1 + ' / ' + element.pageCount)))
                        .append($('<button type="button" class="nav-link nav-page-next"/>')
                            .html('&darr;')
                            .click(function () {
                                core.navigatePage(element, 1);
                            }))
                        .append($('<button type="button" class="nav-link nav-begin"/>')
                            .html('&#124;&lt;')
                            .click(function () {
                                core.navigateTo(element, 'begin');
                            }))
                        .append($('<button type="button" class="nav-link nav-prev-week"/>')
                            .html('&lt;&lt;')
                            .click(function () {
                                core.navigateTo(element, tools.getCellSize() * 7);
                            }))
                        .append($('<button type="button" class="nav-link nav-prev-day"/>')
                            .html('&lt;')
                            .click(function () {
                                core.navigateTo(element, tools.getCellSize());
                            }))
                        .append($('<button type="button" class="nav-link nav-now"/>')
                            .html('&#9679;')
                            .click(function () {
                                core.navigateTo(element, 'now');
                            }))
                        .append($('<button type="button" class="nav-link nav-next-day"/>')
                            .html('&gt;')
                            .click(function () {
                                core.navigateTo(element, tools.getCellSize() * -1);
                            }))
                        .append($('<button type="button" class="nav-link nav-next-week"/>')
                            .html('&gt;&gt;')
                            .click(function () {
                                core.navigateTo(element, tools.getCellSize() * -7);
                            }))
                        .append($('<button type="button" class="nav-link nav-end"/>')
                            .html('&gt;&#124;')
                            .click(function () {
                                core.navigateTo(element, 'end');
                            }))
                        .append($('<button type="button" class="nav-link nav-zoomIn"/>')
                            .html('&#43;')
                            .click(function () {
                                core.zoomInOut(element, -1);
                            }))
                        .append($('<button type="button" class="nav-link nav-zoomOut"/>')
                            .html('&#45;')
                            .click(function () {
                                core.zoomInOut(element, 1);
                            }));
                }
                return $('<div class="bottom"></div>').append(ganttNavigate);
            },

            // **Progress Bar**
            // Return an element representing a progress of position within the entire chart
            createProgressBar: function (label, desc, classNames, dataObj) {
                // label = label || "";
                label = dataObj?.['percent_completed'] || 0
                var bar = $(`<div class="bar" data-id="${dataObj.id}"><div class="fn-label">${label}%</div></div>`)
                        .data("dataObj", dataObj);
                if (desc) {
                    bar
                      .mouseenter(function (e) {
                          var hint = $('<div class="fn-gantt-hint" />').html(desc);
                          $("body").append(hint);
                          hint.css("left", e.pageX);
                          hint.css("top", e.pageY);
                          hint.show();
                      })
                      .mouseleave(function () {
                          $(".fn-gantt-hint").remove();
                      })
                      .mousemove(function (e) {
                          $(".fn-gantt-hint").css("left", e.pageX);
                          $(".fn-gantt-hint").css("top", e.pageY + 15);
                      });
                }
                if (classNames) {
                    bar.addClass(classNames);
                }
                if (dataObj.customBg) bar.css('background-color', dataObj.customBg).removeClass(classNames);
                bar.click(function (e) {
                    e.stopPropagation();
                    settings.onItemClick($(this).data("dataObj"));
                });
                return bar;
            },

            // Remove the `wd` (weekday) class and add `today` class to the
            // current day/week/month (depending on the current scale)
            markNow: function (element) {
                var cd = new Date().setHours(0, 0, 0, 0);
                switch (settings.scale) {
                case "weeks":
                    $(element).find(':findweek("' + cd + '")').removeClass('wd').addClass('today');
                    break;
                case "months":
                    $(element).find(':findmonth("' + cd + '")').removeClass('wd').addClass('today');
                    break;
                case "days":
                    /* falls through */
                case "hours":
                    /* falls through */
                default:
                    $(element).find(':findday("' + cd + '")').removeClass('wd').addClass('today');
                }
            },

            // **Fill the Chart**
            // Parse the data and fill the data panel
            fillData: function (element, datapanel, leftpanel /* <- never used? */) {
                var cellWidth = tools.getCellSize();
                var barOffset = (cellWidth - 18) / 2;
                var dataPanelWidth = datapanel.width();
                var invertColor = function (colStr) {
                    try {
                        colStr = colStr.replace("rgb(", "").replace(")", "");
                        var rgbArr = colStr.split(",");
                        var R = parseInt(rgbArr[0], 10);
                        var G = parseInt(rgbArr[1], 10);
                        var B = parseInt(rgbArr[2], 10);
                        var gray = Math.round((255 - (0.299 * R + 0.587 * G + 0.114 * B)) * 0.9);
                        return "rgb(" + gray + ", " + gray + ", " + gray + ")";
                    } catch (err) {
                        return "";
                    }
                };
                let wrapBar = $('<div class="panel-wrap-bar"/>');
                let wrapBarContent = $('<div class="panel-content-bar"/>');
                // Loop through the values of each data element and set a row
                let dataListVisible = element.data.filter((item) => item?.is_visible || !item.hasOwnProperty('is_visible'))
                $.each(dataListVisible, function (i, entry) {
                    if (i >= element.pageNum * settings.itemsPerPage &&
                        i < (element.pageNum * settings.itemsPerPage + settings.itemsPerPage)) {

                        $.each(entry.values, function (j, day) {
                            var _bar;
                            var from, to, cFrom, cTo, dFrom, dTo, dl, dp;
                            var topEl, top;
                            switch (settings.scale) {
                            // **Hourly data**
                            case "hours":
                                dFrom = tools.genId(tools.dateDeserialize(day.from), element.scaleStep);
                                from = $(element).find('#dh-' + dFrom);
                                dTo = tools.genId(tools.dateDeserialize(day.to), element.scaleStep);
                                to = $(element).find('#dh-' + dTo);
                                cFrom = from.data("offset");
                                cTo = to.data("offset");
                                dl = Math.floor((cTo - cFrom) / cellWidth) + 1;
                                dp = 100 * (cellWidth * dl - 1) / dataPanelWidth;

                                _bar = core.createProgressBar(day.label, day.desc, day.customClass, day.dataObj);

                                // find row
                                topEl = $(element).find("#rowheader" + i);
                                top = cellWidth * 5 + barOffset + topEl.data("offset");
                                _bar.css({
                                  top: top,
                                  left: Math.floor(cFrom),
                                  width: dp + '%'
                                });

                                wrapBarContent.append(_bar);
                                break;

                            // **Weekly data**
                            case "weeks":
                                dFrom = tools.dateDeserialize(day.from);
                                dTo = tools.dateDeserialize(day.to);
                                from = $(element).find("#" + dFrom.getWeekId());
                                cFrom = from.data("offset");
                                to = $(element).find("#" + dTo.getWeekId());
                                cTo = to.data("offset");
                                dl = Math.round((cTo - cFrom) / cellWidth) + 1;
                                dp = 100 * (cellWidth * dl - 1) / dataPanelWidth;

                                _bar = core.createProgressBar(day.label, day.desc, day.customClass, day.dataObj);

                                // find row
                                topEl = $(element).find("#rowheader" + i);
                                top = cellWidth * 3 + barOffset + topEl.data("offset");
                                _bar.css({
                                  top: top,
                                  left: Math.floor(cFrom),
                                  width: dp + '%'
                                });

                                // datapanel.append(_bar);
                                wrapBarContent.append(_bar);
                                break;

                            // **Monthly data**
                            case "months":
                                dFrom = tools.dateDeserialize(day.from);
                                dTo = tools.dateDeserialize(day.to);

                                if (dFrom.getDate() <= 3 && dFrom.getMonth() === 0) {
                                    dFrom.setDate(dFrom.getDate() + 4);
                                }

                                if (dFrom.getDate() <= 3 && dFrom.getMonth() === 0) {
                                    dFrom.setDate(dFrom.getDate() + 4);
                                }

                                if (dTo.getDate() <= 3 && dTo.getMonth() === 0) {
                                    dTo.setDate(dTo.getDate() + 4);
                                }

                                from = $(element).find("#dh-" + tools.genId(dFrom));
                                cFrom = from.data("offset");
                                to = $(element).find("#dh-" + tools.genId(dTo));
                                cTo = to.data("offset");
                                dl = Math.round((cTo - cFrom) / cellWidth) + 1;
                                dp = 100 * (cellWidth * dl - 1) / dataPanelWidth;

                                _bar = core.createProgressBar(day.label, day.desc, day.customClass, day.dataObj);

                                // find row
                                topEl = $(element).find("#rowheader" + i);
                                top = cellWidth * 2 + barOffset + topEl.data("offset");
                                _bar.css({
                                  top: top,
                                  left: Math.floor(cFrom),
                                  width: dp + '%'
                                });

                                wrapBar.append(_bar);
                                break;

                            // **Days**
                            default:
                                dFrom = tools.genId(tools.dateDeserialize(day.from));
                                dTo = tools.genId(tools.dateDeserialize(day.to));
                                from = $(element).find("#dh-" + dFrom);
                                cFrom = from.data("offset");
                                dl = Math.round((dTo - dFrom) / UTC_DAY_IN_MS) + 1;
                                dp = 100 * (cellWidth * dl - 1) / dataPanelWidth;

                                _bar = core.createProgressBar(day.label, day.desc, day.customClass, day.dataObj);

                                // find row
                                topEl = $(element).find("#rowheader" + i);
                                top = cellWidth * 4 + barOffset + topEl.data("offset");
                                _bar.css({
                                  top: top,
                                  left: Math.floor(cFrom),
                                  width: dp + '%'
                                });
                                wrapBarContent.append(_bar);
                            }

                            var $l = _bar.find(".fn-label");
                            if ($l.length) {
                                var gray = invertColor(_bar.css('backgroundColor'));
                                $l.css("color", gray);
                            }
                        });

                    }
                });
                wrapBar.append(wrapBarContent);
                datapanel.append(wrapBar);
            },
            // **Navigation**
            navigateTo: function (element, val) {
                var $rightPanel = $(element).find(".fn-gantt .rightPanel");
                var $dataPanel = $rightPanel.find(".dataPanel");
                var rightPanelWidth = $rightPanel.width();
                var dataPanelWidth = $dataPanel.width();
                var shift = function () {
                  core.repositionLabel(element);
                };
                var maxLeft, curLeft;
                switch (val) {
                case "begin":
                    $dataPanel.animate({ "left": "0" }, "fast", shift);
                    element.scrollNavigation.panelMargin = 0;
                    break;
                case "end":
                    var pLeft = dataPanelWidth - rightPanelWidth;
                    element.scrollNavigation.panelMargin = pLeft * -1;
                    $dataPanel.animate({ "left": "-" + pLeft }, "fast", shift);
                    break;
                case "now":
                    if (!element.scrollNavigation.canScroll || !$dataPanel.find(".today").length) {
                        return false;
                    }
                    maxLeft = (dataPanelWidth - rightPanelWidth) * -1;
                    curLeft = $dataPanel.css("left").replace("px", "");
                    val = $dataPanel.find(".today").offset().left - $dataPanel.offset().left;
                    val *= -1;
                    if (val > 0) {
                        val = 0;
                    } else if (val < maxLeft) {
                        val = maxLeft;
                    }
                    $dataPanel.animate({ "left": val }, "fast", shift);
                    element.scrollNavigation.panelMargin = val;
                    break;
                default:
                    maxLeft = (dataPanelWidth - rightPanelWidth) * -1;
                    curLeft = $dataPanel.css("left").replace("px", "");
                    val = parseInt(curLeft, 10) + val;
                    if (val <= 0 && val >= maxLeft) {
                        $dataPanel.animate({ "left": val }, "fast", shift);
                    }
                    element.scrollNavigation.panelMargin = val;
                }
                core.synchronizeScroller(element);
            },

            // Navigate to a specific page
            navigatePage: function (element, val) {
                if ((element.pageNum + val) >= 0 &&
                    (element.pageNum + val) < Math.ceil(element.rowsNum / settings.itemsPerPage)) {
                    core.waitToggle(element, function () {
                        element.pageNum += val;
                        element.hPosition = $(".fn-gantt .dataPanel").css("left").replace("px", "");
                        element.scaleOldWidth = false;
                        core.init(element);
                    });
                }
            },
            // Change zoom level
            zoomInOut: function (element, val) {
                core.waitToggle(element, function () {

                    var zoomIn = (val < 0);
                    var scaleSt = element.scaleStep + val * 3;
                    // adjust hour scale to desired factors of 24
                    scaleSt = {4:3, 5:6, 9:8, 11:12}[scaleSt] || (scaleSt < 1 ? 1 : scaleSt);
                    var scale = settings.scale;
                    var headerRows = element.headerRows;
                    if (settings.scale === "hours" && scaleSt >= 13) {
                        scale = "days";
                        headerRows = 4;
                        scaleSt = 13;
                    } else if (settings.scale === "days" && zoomIn) {
                        scale = "hours";
                        headerRows = 5;
                        scaleSt = 12;
                    } else if (settings.scale === "days" && !zoomIn) {
                        scale = "weeks";
                        headerRows = 3;
                        scaleSt = 13;
                    } else if (settings.scale === "weeks" && !zoomIn) {
                        scale = "months";
                        headerRows = 2;
                        scaleSt = 14;
                    } else if (settings.scale === "weeks" && zoomIn) {
                        scale = "days";
                        headerRows = 4;
                        scaleSt = 13;
                    } else if (settings.scale === "months" && zoomIn) {
                        scale = "weeks";
                        headerRows = 3;
                        scaleSt = 13;
                    }

                    // do nothing if attempting to zoom past max/min
                    if ((zoomIn && $.inArray(scale, scales) < $.inArray(settings.minScale, scales)) ||
                        (!zoomIn && $.inArray(scale, scales) > $.inArray(settings.maxScale, scales))) {
                        core.init(element);
                        return;
                    }

                    element.scaleStep = scaleSt;
                    settings.scale = scale;
                    element.headerRows = headerRows;
                    var $rightPanel = $(element).find(".fn-gantt .rightPanel");
                    var $dataPanel = $rightPanel.find(".dataPanel");
                    element.hPosition = $dataPanel.css("left").replace("px", "");
                    element.scaleOldWidth = ($dataPanel.width() - $rightPanel.width());

                    if (settings.useCookie) {
                        $.cookie(settings.cookieKey + "CurrentScale", settings.scale);
                        // reset scrollPos
                        $.cookie(settings.cookieKey + "ScrollPos", null);
                    }
                    core.init(element);
                });
            },

            // Move chart via mouseclick
            mouseScroll: function (element, e) {
                var $dataPanel = $(element).find(".fn-gantt .dataPanel");
                $dataPanel.css("cursor", "move");
                var bPos = $dataPanel.offset();
                var mPos = element.scrollNavigation.mouseX === null ? e.pageX : element.scrollNavigation.mouseX;
                var delta = e.pageX - mPos;
                element.scrollNavigation.mouseX = e.pageX;

                core.scrollPanel(element, delta);

                clearTimeout(element.scrollNavigation.repositionDelay);
                element.scrollNavigation.repositionDelay = setTimeout(core.repositionLabel, 50, element);
            },

            // Move chart via mousewheel
            wheelScroll: function (element, e) {
                let delta = e.detail ? e.detail * (-100) : e.originalEvent.wheelDelta / 120 * 100;
                core.scrollPanel(element, delta);
                clearTimeout(element.scrollNavigation.repositionDelay);
                element.scrollNavigation.repositionDelay = setTimeout(core.repositionLabel, 50, element);
                if (e.preventDefault) e.preventDefault();
                else return false;
            },

            // Move chart via slider control
            sliderScroll: function (element, e) {
                var $sliderBar = $(element).find(".nav-slider-bar");
                var $sliderBarBtn = $sliderBar.find(".nav-slider-button");
                var $rightPanel = $(element).find(".fn-gantt .rightPanel");
                var $dataPanel = $rightPanel.find(".dataPanel");

                var bPos = $sliderBar.offset();
                var bWidth = $sliderBar.width();
                var wButton = $sliderBarBtn.width();

                var pos, pLeft;

                if ((e.pageX >= bPos.left) && (e.pageX <= bPos.left + bWidth)) {
                    pos = e.pageX - bPos.left;
                    pos = pos - wButton / 2;
                    $sliderBarBtn.css("left", pos);

                    pLeft = $dataPanel.width() - $rightPanel.width();

                    var pPos = pos * pLeft / bWidth * -1;
                    if (pPos >= 0) {
                        $dataPanel.css("left", "0");
                        element.scrollNavigation.panelMargin = 0;
                    } else if (pos >= bWidth - (wButton * 1)) {
                        $dataPanel.css("left", pLeft * -1);
                        element.scrollNavigation.panelMargin = pLeft * -1;
                    } else {
                        $dataPanel.css("left", pPos);
                        element.scrollNavigation.panelMargin = pPos;
                    }
                    clearTimeout(element.scrollNavigation.repositionDelay);
                    element.scrollNavigation.repositionDelay = setTimeout(core.repositionLabel, 5, element);
                }
            },

            // Update scroll panel margins
            scrollPanel: function (element, delta) {
                if (!element.scrollNavigation.canScroll) {
                    return false;
                }
                var _panelMargin = parseInt(element.scrollNavigation.panelMargin, 10) + delta;
                if (_panelMargin > 0) {
                    element.scrollNavigation.panelMargin = 0;
                    $(element).find(".fn-gantt .dataPanel").css("left", element.scrollNavigation.panelMargin);
                } else if (_panelMargin < element.scrollNavigation.panelMaxPos * -1) {
                    element.scrollNavigation.panelMargin = element.scrollNavigation.panelMaxPos * -1;
                    $(element).find(".fn-gantt .dataPanel").css("left", element.scrollNavigation.panelMargin);
                } else {
                    element.scrollNavigation.panelMargin = _panelMargin;
                    $(element).find(".fn-gantt .dataPanel").css("left", element.scrollNavigation.panelMargin);
                }
                core.synchronizeScroller(element);
            },

            // Synchronize scroller
            synchronizeScroller: function (element) {
                if (settings.navigate !== "scroll") { return; }
                var $rightPanel = $(element).find(".fn-gantt .rightPanel");
                var $dataPanel = $rightPanel.find(".dataPanel");
                var $sliderBar = $(element).find(".nav-slider-bar");
                var $sliderBtn = $sliderBar.find(".nav-slider-button");

                var bWidth = $sliderBar.width();
                var wButton = $sliderBtn.width();

                var pLeft = $dataPanel.width() - $rightPanel.width();
                var hPos = $dataPanel.css("left") || 0;
                if (hPos) {
                    hPos = hPos.replace("px", "");
                }
                var pos = hPos * bWidth / pLeft - $sliderBtn.width() * 0.25;
                pos = pos > 0 ? 0 : (pos * -1 >= bWidth - (wButton * 0.75)) ? (bWidth - (wButton * 1.25)) * -1 : pos;
                $sliderBtn.css("left", pos * -1);
            },

            // Reposition data labels
            repositionLabel: function (element) {
                setTimeout(function () {
                    var $dataPanel;
                    if (!element) {
                        $dataPanel = $(".fn-gantt .rightPanel .dataPanel");
                    } else {
                        var $rightPanel = $(element).find(".fn-gantt .rightPanel");
                        $dataPanel = $rightPanel.find(".dataPanel");
                    }

                    if (settings.useCookie) {
                        $.cookie(settings.cookieKey + "ScrollPos", $dataPanel.css("left").replace("px", ""));
                    }
                }, 500);
            },

            // waitToggle
            waitToggle: function (element, showCallback) {
                if ( $.isFunction(showCallback) ) {
                    var $elt = $(element);
                    var eo = $elt.offset();
                    var ew = $elt.outerWidth();
                    var eh = $elt.outerHeight();

                    if (!element.loader) {
                        element.loader = $('<div class="fn-gantt-loader">' +
                        '<div class="fn-gantt-loader-spinner"><span>' + settings.waitText + '</span></div></div>');
                    }
                    $elt.append(element.loader);
                    setTimeout(showCallback, 500);

                } else if (element.loader) {
                  element.loader.detach();
                }
            }
        };

        // Utility functions
        // =================
        var tools = {

            // Return the maximum available date in data depending on the scale
            getMaxDate: function (element) {
                var maxDate = null;
                $.each(element.data, function (i, entry) {
                    $.each(entry.values, function (i, date) {
                        maxDate = maxDate < tools.dateDeserialize(date.to) ? tools.dateDeserialize(date.to) : maxDate;
                    });
                });
                maxDate = maxDate || new Date();
                var bd;
                switch (settings.scale) {
                case "hours":
                    maxDate.setHours(Math.ceil((maxDate.getHours()) / element.scaleStep) * element.scaleStep);
                    maxDate.setHours(maxDate.getHours() + element.scaleStep * 3);
                    break;
                case "weeks":
                    // wtf is happening here?
                    bd = new Date(maxDate.getTime());
                    bd = new Date(bd.setDate(bd.getDate() + 3 * 7));
                    var md = Math.floor(bd.getDate() / 7) * 7;
                    maxDate = new Date(bd.getFullYear(), bd.getMonth(), md === 0 ? 4 : md - 3);
                    break;
                case "months":
                    bd = new Date(maxDate.getFullYear(), maxDate.getMonth(), 1);
                    bd.setMonth(bd.getMonth() + 2);
                    maxDate = new Date(bd.getFullYear(), bd.getMonth(), 1);
                    break;
                case "days":
                    /* falls through */
                default:
                    maxDate.setHours(0);
                    maxDate.setDate(maxDate.getDate() + 3);
                }
                return maxDate;
            },

            // Return the minimum available date in data depending on the scale
            getMinDate: function (element) {
                var minDate = null;
                $.each(element.data, function (i, entry) {
                    $.each(entry.values, function (i, date) {
                        minDate = minDate > tools.dateDeserialize(date.from) ||
                            minDate === null ? tools.dateDeserialize(date.from) : minDate;
                    });
                });
                minDate = minDate || new Date();
                switch (settings.scale) {
                case "hours":
                    minDate.setHours(Math.floor((minDate.getHours()) / element.scaleStep) * element.scaleStep);
                    minDate.setHours(minDate.getHours() - element.scaleStep * 3);
                    break;
                case "weeks":
                    // wtf is happening here?
                    var bd = new Date(minDate.getTime());
                    bd = new Date(bd.setDate(bd.getDate() - 3 * 7));
                    var md = Math.floor(bd.getDate() / 7) * 7;
                    minDate = new Date(bd.getFullYear(), bd.getMonth(), md === 0 ? 4 : md - 3);
                    break;
                case "months":
                    minDate.setHours(0, 0, 0, 0);
                    minDate.setDate(1);
                    minDate.setMonth(minDate.getMonth() - 3);
                    break;
                case "days":
                    /* falls through */
                default:
                    minDate.setHours(0, 0, 0, 0);
                    minDate.setDate(minDate.getDate() - 3);
                }
                return minDate;
            },

            // Return an array of Date objects between `from` and `to`
            parseDateRange: function (from, to) {
                var year = from.getFullYear();
                var month = from.getMonth();
                var date = from.getDate();
                var range = [], i = 0;
                do {
                    range[i] = new Date(year, month, date + i);
                } while (range[i++] < to);
                return range;
            },

            // Return an array of Date objects between `from` and `to`,
            // scaled hourly
            parseTimeRange: function (from, to, scaleStep) {
                var year = from.getFullYear();
                var month = from.getMonth();
                var date = from.getDate();
                var hour = from.getHours();
                hour -= hour % scaleStep;
                var range = [], h = 0, i = 0;
                do {
                    range[i] = new Date(year, month, date, hour + h++ * scaleStep);
                    // overwrite any hours repeated due to DST changes
                    if (i > 0 && range[i].getHours() === range[i-1].getHours()) {
                        i--;
                    }
                } while (range[i++] < to);
                return range;
            },

            // Return an array of Date objects between a range of weeks
            // between `from` and `to`
            parseWeeksRange: function (from, to) {
                var current = from.getDayForWeek();

                var ret = [];
                var i = 0;
                do {
                    ret[i++] = current.getDayForWeek();
                    current.setDate(current.getDate() + 7);
                } while (current <= to);

                return ret;
            },

            // Return an array of Date objects between a range of months
            // between `from` and `to`
            parseMonthsRange: function (from, to) {
                var current = new Date(from);
                var end = new Date(to); // <- never used?

                var ret = [];
                var i = 0;
                do {
                    ret[i++] = new Date(current.getFullYear(), current.getMonth(), 1);
                    current.setMonth(current.getMonth() + 1);
                } while (current <= to);

                return ret;
            },

            // Deserialize a date from a string or integer
            dateDeserialize: function (dateStr) {
                var date = eval("new" + dateStr.replace(/\//g, " "));
                return new Date(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate(), date.getUTCHours(), date.getUTCMinutes());
            },

            // Generate an id for a date
            genId: function (t) { // varargs
                if ( $.isNumeric(t) ) {
                    t = new Date(t);
                }
                switch (settings.scale) {
                case "hours":
                    var hour = t.getHours();
                    if (arguments.length >= 2) {
                        hour = (Math.floor(t.getHours() / arguments[1]) * arguments[1]);
                    }
                    return (new Date(t.getFullYear(), t.getMonth(), t.getDate(), hour)).getTime();
                case "weeks":
                    var y = t.getFullYear();
                    var w = t.getWeekOfYear();
                    var m = t.getMonth();
                    if (m === 11 && w === 1) {
                        y++;
                    } else if (!m && w > 51) {
                        y--;
                    }
                    return y + "-" + w;
                case "months":
                    return t.getFullYear() + "-" + t.getMonth();
                case "days":
                    /* falls through */
                default:
                    return (new Date(t.getFullYear(), t.getMonth(), t.getDate())).getTime();
                }
            },

            // normalizes an array of dates into a map of start-of-day millisecond values
            _datesToDays: function ( dates ) {
                var dayMap = {};
                for (var i = 0, len = dates.length, day; i < len; i++) {
                    day = tools.dateDeserialize( dates[i] );
                    dayMap[ day.setHours(0, 0, 0, 0) ] = true;
                }
                return dayMap;
            },
            // Returns true when the given date appears in the array of holidays, if provided
            isHoliday: (function() { // IIFE
                // short-circuits the function if no holidays option was passed
                if (!settings.holidays || !settings.holidays.length) {
                  return function () { return false; };
                }
                var holidays = false;
                // returns the function that will be used to check for holidayness of a given date
                return function(date) {
                    if (!holidays) {
                      holidays = tools._datesToDays( settings.holidays );
                    }
                    return !!holidays[
                      // assumes numeric dates are already normalized to start-of-day
                      $.isNumeric(date) ?
                      date :
                      ( new Date(date.getFullYear(), date.getMonth(), date.getDate()) ).getTime()
                    ];
                };
            })(),

            // Get the current cell height
            getCellSize: function () {
                if (typeof tools._getCellSize === "undefined") {
                    var measure = $('<div style="display: none; position: absolute;" class="fn-gantt"><div class="row"></div></div>');
                    $("body").append(measure);
                    tools._getCellSize = measure.find(".row").outerHeight();
                    measure.empty().remove();
                }
                return tools._getCellSize;
            },

            // Get the current page height
            getPageHeight: function (element) {
                return element.pageNum + 1 === element.pageCount ? element.rowsOnLastPage * tools.getCellSize() : settings.itemsPerPage * tools.getCellSize();
            }
        };


        this.each(function () {
            this.data = null;        // Received data
            this.pageNum = 0;        // Current page number
            this.pageCount = 0;      // Available pages count
            this.rowsOnLastPage = 0; // How many rows on last page
            this.rowsNum = 0;        // Number of total rows
            this.hPosition = 0;      // Current position on diagram (Horizontal)
            this.dateStart = null;
            this.dateEnd = null;
            this.scrollClicked = false;
            this.scaleOldWidth = null;
            this.headerRows = null;

            // Update cookie with current scale
            if (settings.useCookie) {
                var sc = $.cookie(settings.cookieKey + "CurrentScale");
                if (sc) {
                    settings.scale = sc;
                } else {
                    $.cookie(settings.cookieKey + "CurrentScale", settings.scale);
                }
            }

            switch (settings.scale) {
            //case "hours":
            //    this.headerRows = 5;
            //    this.scaleStep = 8;
            //    break;
            case "hours":
                this.headerRows = 5;
                this.scaleStep = 1;
                break;
            case "weeks":
                this.headerRows = 3;
                this.scaleStep = 13;
                break;
            case "months":
                this.headerRows = 2;
                this.scaleStep = 14;
                break;
            case "days":
                /* falls through */
            default:
                this.headerRows = 4;
                this.scaleStep = 13;
            }

            this.scrollNavigation = {
                panelMouseDown: false,
                scrollerMouseDown: false,
                mouseX: null,
                panelMargin: 0,
                repositionDelay: 0,
                panelMaxPos: 0,
                canScroll: true
            };

            this.gantt = null;
            this.loader = null;

            core.create(this);

        });

    };
})(jQuery);