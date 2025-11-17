
(function ($) {
    $.fn.calendarGrid = function (options) {
        var s = this;
        var sel = this.selector;
        var currentPage = 0;
        s.searchParams = {
            keyword: "",
            page: 1,
            limit: null
        };
        s.editParams = {
        };

        s.sourceData = [];
        s.viewData = [];
        s.count = 0;
        s.count = 0;
        s.formId = '';
        s.sumarray = [];
        s.tounchTr = null;
        s.moveObjectId = null;
        s.clickSubContextMenu = false;
        s.activeParentId = null;
        s.months = [];
        s.days = [];
        s.colRight = 0;
        s.searching = false;
        s.editLoader = '.calendar-grid-edit-loader';
        // Establish our default settings
        var set = $.extend({
            footer: null,
            tableSize: null,
            rootUrl: null,
            dataUrl: null,
            paging: null,
            params: null,
            autoLoad: null,
            border: null,
            width: null,
            height: null,
            selectRow: null,
            toolbars: null,
            idAttribute: null,
            rows: [],
            cols: null,
            editController: null,
            model: "",
            filterable: false,
            checkAll: null,
            beforeSubmit: null,
            detailRow: null,
            childs: null,
            modal: null,
            contextMenu: null,
            skipCols: 0,
            loadDataCallback: null,
            loadModalCallback: null,
            selectRowCallback: null,
            submitFormCallback: null,
            sumInfo: null,
            beforeSearch: null,
            expandable: null,
            multiLevel: true,
            symbols: null
        }, options);
        s.set = set;
        s.sequentially = {
            number: 10,
            loaded: 0,
            first: false,
            done: false,
            loading: false
        }
        if (set.paging != null) {
            s.searchParams.page = set.paging.page != null ? set.paging.page : 1;
            s.searchParams.limit = set.paging.limit != null ? set.paging.limit : 20;
        }

        if (set.params != null) {
            if (typeof set.params.search != 'undefined') {
                $.extend(s.searchParams, set.params.search);
            }
            if (typeof set.params.edit != 'undefined') {
                $.extend(s.editParams, set.params.edit);
            }
        }
        s.showTableLoading = function () {
            console.log('zo');
            var tb = $(sel).find('.main-content');
            if ($(tb).find('.loading').length == 0) {
                $(tb).append(app.loading());
            }

            $(sel).find(".loading").show();
        }
        s.hideTableLoading = function () {
            $(sel).find(".loading").hide();
        }
        s.drawCheckbox = function (id) {
            return '<td class="first-col" style="width: 40px"><div class="checkbox checkbox-info"><input type="checkbox"  class="styled" value="" dataId="' +
                id +
                '"/><label></label></div></td>';
        }

        s.setDateData = function (item, m, d, e, index) {
            var td = '<td data-attr="' + e.attr + '" ';

            if (e.rootAttr != null) {
                td += ' data-root-attr="' + e.rootAttr + '" ';
            }

            var cls = ' day-' + d.dw + ' ';

            var v = '';
            if (typeof item != 'undefined') {
                v = item[e.attr];
                if (typeof v == 'undefined' || v == 'undefined') {
                    v = '';
                }
            }
            if (e.editInline) {
                if (set.symbols.locks.indexOf(v) < 0) {
                    if (d.dw == 0) {
                        if (e.allowCn) {
                            cls += ' edit-inline ';
                        }
                    } else {
                        cls += ' edit-inline ';
                    }

                }
            }

            if (set.contextMenuDate != null) {
                cls += ' context-menu-date ';
            }

            // cls += ' has-comment ';

            if (item != null) {
                if (e.highlight) {
                    td += ' hl="1" ';
                    if (item[e.attr] != item[e.rootAttr]) {
                        if (set.symbols.ks.indexOf(item[e.attr]) >= 0 || item[e.attr] == '') {
                            cls += ' highlight ';
                        } else {
                            cls += ' error ';
                        }
                    }
                }

                if (item.N == 1) {
                    cls += ' has-comment';
                }
            }


            var h = e.height != null ? e.height : 30;

            if (e.style != null) {
                td += ' style="' + e.style + '; height: ' + h + 'px" ';
            }

            td += 'i="' + index + '" class="' + cls + ' cell-date" data-y="' + m.y + '" data-m="' + m.m + '" data-dm="' + d.dm + '" data-dw="' + d.dw + '">';
            if (e.editInline) {
                var allowEdit = false;
                if (set.symbols.locks.indexOf(v) < 0) {
                    if (d.dw == 0) {
                        if (e.allowCn) {
                            allowEdit = true;
                        }
                    } else {
                        allowEdit = true;
                    }
                }
                if (allowEdit) {
                    td += '<span  class="span-edit-inline' +
                        (e.textAlign != null ? ' text-' + e.textAlign : '') +
                        '" >' +
                        v +
                        '</span>';
                    td += '<div class="form-group inline-form">' +
                        '<input class="form-control  ' +
                        (e.textAlign != null ? 'text-' + e.textAlign : '') +
                        '" data-type="text" value="' +
                        v +
                        '" style="height: ' +
                        (h - 1) +
                        'px" />' +
                        '</div>';
                } else {
                    td += '<span  class="' + (e.textAlign != null ? 'text-' + e.textAlign : '') + '" >' + v + '</span>';
                    td += '<div class="locked-group"><i class="icon-lock2 " data-toggle="tooltip" data-placement="top" title="Ký hiệu đã khóa"></i></div>';
                }
            } else {
                td += '<span  class="' + (e.textAlign != null ? 'text-' + e.textAlign : '') + '" >' + v + '</span>';
            }
            var cm = '<div class="btn-group">' +
                '<button type="button" class="btn dropdown-toggle" data-toggle="dropdown" aria-expanded="false"  title="Ghi chú"><i class="icon-info3"></i></button>';
            cm += '<ul class="dropdown-menu"><li><a href="#" class="add-comment"><i class="icon-comment position-left text-orange-300"></i>Tạo ghi chú</a></li>';
            cm += '<li><a href="#" class="edit-comment"><i class="icon-pencil7 position-left"></i>Sửa ghi chú</a></li>';
            cm += '<li><a href="#" class="delete-comment"><i class="icon-x position-left"></i>Xóa ghi chú</a></li>';
            cm += '</ul></div>';

            td += '<div class="comment-group">' + cm + '<span class="arrow"></span><div class="comment-content">' + app.loading() + '</div></div>';
            td += '</td>';
            return td;
        }
        s.setTdData = function (item, cell, i, stt) {
            var td = '<td data-attr="' + cell.attribute + '"';
            var cls = '';
            if (cell.class != null) {
                cls += ' ' + cell.class + ' ';
            }
            if (cell.editInline) {
                cls += ' edit-inline ';
            }
            td += ' class="' + cls + '"';
            td += ' style="height: ' + set.height.row + 'px; ';
            if (cell.style != null) {
                td += cell.style + '';
            }
            td += '"';

            if (cell.colspan != null) {
                if (cell.colspan.if(item)) {
                    td += ' colspan="' + cell.colspan.value + '" ';
                }
            }

            switch (cell.type) {
                case "text":
                    {
                        if (cell.sumable) {
                            if (typeof s.sumarray[i] == "undefined") {
                                s.sumarray[i] = 0;
                            }
                            if (cell.sumValue != null) {
                                s.sumarray[i] += cell.sumValue(item);
                            }
                        } else {
                            s.sumarray[i] = null;
                        }

                        td += '>';

                        var v = "";
                        if (cell.attribute != null) {
                            if (item[cell.attribute] != null)
                                v = item[cell.attribute];
                        }

                        if (cell.render != null) {
                            td += '<span class=""> ' + cell.render(item) + '</span>';
                        } else {
                            td += '<span ';
                            if (cell.aline != null) {
                                td += ' class="aline"';
                            }
                            td += '> ' + v + '</span>';
                        }
                        if (cell.editInline) {
                            td += '<div class="form-group inline-form">' +
                                '<input class="form-control" data-type="text" attr="' +
                                cell.attribute +
                                '" value="' +
                                v +
                                '" />' +
                                '</div>';
                        }
                    };
                    break;
                case "date":
                    {

                        td += '>';

                        td += app.formatDate(item[cell.attribute]);
                        s.sumarray[i] = null;
                    };
                    break;
                case "time":
                    {

                        td += '>';

                        td += app.formatTime(item[cell.attribute]);
                        s.sumarray[i] = null;
                    };
                    break;
                case "datetime":
                    {
                        td += '>';

                        td += app.formatDateTime(item[cell.attribute]);
                        s.sumarray[i] = null;
                    };
                    break;
                case "html":
                    {

                        td += '>';

                        if (cell.render != null) {
                            td += cell.render(item).replace(/\n/g, '<br/>');
                        } else if (cell.attribute != null) {
                            td += item[cell.attribute] != null ? item[cell.attribute] : "";
                        }
                        s.sumarray[i] = null;
                    };
                    break;
                case "number":
                    {
                        if (cell.sumable) {
                            if (typeof s.sumarray[i] == "undefined") {
                                s.sumarray[i] = 0;
                            }
                        }
                        td += '>';

                        var val = 0;
                        if (cell.render != null) {
                            val = cell.render(item);
                        } else {
                            val = item[cell.attribute];
                        }
                        s.sumarray[i] += val;

                        var txt = cell.fixed ? parseFloat(val).toFixed(2) : val;

                        td += '<span> ' + txt + '</span>';
                        if (cell.editInline) {
                            td += '<div class="form-group inline-form">' +
                                '<input class="form-control" data-type="number" attr="' +
                                cell.attribute +
                                '" value="' +
                                val +
                                '" />' +
                                '</div>';
                        }
                    };
                    break;
                case "ai":
                    {
                        td += '>';

                        td += stt;

                        if (cell.sumable) {
                            if (typeof s.sumarray[i] == "undefined") {
                                s.sumarray[i] = 0;
                            }
                            s.sumarray[i] += 1;
                        } else {
                            s.sumarray[i] = null;
                        }
                    };
                    break;
            }
            td += '</td>';

            return td;
        }
        s.drawRow = function (item, idAttr, level, stt, bl, gid) {

            var row = { left: '', right: '' };

            var skip = set.skipCols;
            var tr = '<tr ';

            if (set.contextMenu != null) {
                tr += ' data-toggle="context" data-target=".context-table-row" ';
            }

            tr += ' dataid="' + item[idAttr] + '" ai="' + stt + '" groupid="' + gid + '" ';

            var cls = ' class="tr-child  ';
            if (set.rowStyle != null) {
                tr += ' ' + set.rowStyle(item) + '" ';
            }
            cls += '"';
            tr += cls;
            if (typeof item['Code'] != 'undefined') {
                tr += ' datacode="' + item['Code'] + '" ';
            }
            if (item.ParentId != null) {
                tr += ' parent="' + item.ParentId + '" ';
            }
            tr += '>';
            var start, end, cell, v, i, str;
            if (skip > 0) {
                start = 0;
                end = skip;
                str = '';
                for (i = start; i < end; i++) {
                    cell = set.rows[i];
                    if (app.hasValue(cell.visible)) {
                        v = cell.visible();
                    } else {
                        v = true;
                    }
                    if (v) {
                        str += s.setTdData(item, cell, i, stt);
                    }
                }
                row.left = tr + str + '<td>&nbsp;</td></tr>';
            }

            str = '';
            start = skip;
            end = set.rows.length;

            var dindex = 0;

            var details = $.parseJSON(item.Detail);

            $(s.months).each(function () {
                var m = this;
                $(this.days).each(function () {
                    var d = this;
                    var dr;
                    $(details).each(function () {
                        var dd = moment(this.D, 'D-M-YYYY');
                        if (dd.date() == d.dm && (dd.month() + 1) == m.m) {
                            dr = this;
                            return;
                        }
                    });
                    $(s.set.dateItems).each(function (i, col) {
                        str += s.setDateData(dr, m, d, col, dindex);
                        dindex++;
                    });
                });
            });

            for (i = start; i < end; i++) {
                cell = set.rows[i];
                if (app.hasValue(cell.visible)) {
                    v = cell.visible();
                } else {
                    v = true;
                }
                if (v) {
                    str += s.setTdData(item, cell, i);
                }
            }

            row.right = tr + str + '</tr>';
            return row;
        }

        s.drawEmptyRow = function (bl) {
            var skip = set.skipCols;
            var tr = '<tr class="empty">';
            var colspan;

            if (bl) {
                if (skip == 0)
                    return '';
                if (skip > 0 && (set.checkAll == null || set.checkAll)) {
                    tr += s.drawCheckbox();
                    skip--;
                }
                colspan = skip;
            } else {
                if (set.checkAll == null || set.checkAll) {
                    if (skip == 0) {
                        tr += s.drawCheckbox();
                    } else {
                        skip--;
                    }
                }
                colspan = set.rows.length - skip;
            }
            tr += '<td colspan="' + colspan + '"></td>';
            tr += '<td>&nbsp;</td></tr>';
            return tr;
        }


        s.loopDrawchild = function (mc, data, pId, idAttr, level) {
            $.each(data, function (k, item) {
                if (item.ParentId == pId) {
                    var row = s.drawRow(item, idAttr, level, k + 1);
                    mc.find(".area-bl tbody").append(row.left);
                    //r = s.drawRow(item, idAttr, level, k + 1, false);
                    mc.find(".area-br tbody").append(row.right);

                    s.loopDrawchild(mc, data, item.Id, idAttr, level + 1);
                }
            });
        }

        s.showBackground = function () {
            var mc = $(sel).find('> .calendar-table > .main-content');
            var bl = mc.find('.area-bl tbody');
            var br = mc.find('.area-br tbody');

            mc.find('.area-bl tbody tr').css('display', 'none');
            mc.find('.area-br tbody tr').css('display', 'none');

            mc.find('.area-bl tbody tr.tr-background').remove();
            mc.find('.area-br tbody tr.tr-background').remove();
            var i;
            $(s.viewData).each(function () {
                if (this.active) {
                    mc.find('tr.tr-group[groupid="' + this.gid + '"]').css('display', 'table-row');
                    var l = '';
                    var r = '';
                    var pl = bl.find('tr.tr-group[groupid="' + this.gid + '"]');
                    var pr = br.find('tr.tr-group[groupid="' + this.gid + '"]');
                    for (i = 0; i < this.count; i++) {
                        if (this.left[i].active) {
                            l += this.left[i].bg;
                            r += this.right[i].bg;

                            bl.find('tr.tr-child[dataid="' + this.left[i].id + '"]')
                                .attr('data-top', this.left[i].top);
                            br.find('tr.tr-child[dataid="' + this.left[i].id + '"]')
                                .attr('data-top', this.left[i].top);
                        }
                    }
                    $(pl).after(l);
                    $(pr).after(r);
                    for (i = 0; i < this.count; i++) {
                        if (this.left[i].active) {
                            bl.find('tr.tr-child[dataid="' + this.left[i].id + '"]')
                                .attr('data-top', this.left[i].top);
                            br.find('tr.tr-child[dataid="' + this.left[i].id + '"]')
                                .attr('data-top', this.left[i].top);
                        }
                    }
                }
            });
        }

        s.showData = function (top) {
            var mc = $(sel).find('> .calendar-table > .main-content');
            var bl = mc.find('.area-bl tbody');
            var br = mc.find('.area-br tbody');
            var trs = bl.find('tr.tr-child');
            var a = mc.find('.area-br').height();
            var gids = [], hides = [], tr;

            $(trs).each(function () {
                var t = parseInt($(this).attr('data-top'));
                var h = set.height.row;
                if ((t <= top && top <= t + h) || (t - a <= top && top < t)) {
                    gids.push(parseInt($(this).attr('dataid')));
                }
            });

            var showed = bl.find('tr.tr-child.tr-real');

            $(showed).each(function () {
                var id = parseInt($(this).attr('dataid'));
                if ($.inArray(id, gids) < 0) {
                    hides.push(id);
                }
            });

            $(s.viewData).each(function () {
                if (this.groupChilds.length > 0) {
                    $(this.groupChilds).each(function () {
                        for (var i = 0; i < this.count; i++) {
                            if ($.inArray(this.left[i].id, hides) >= 0) {
                                bl.find('tr.tr-real[dataid="' + this.left[i].id + '"]')
                                    .replaceWith(this.left[i].bg);
                                br.find('tr.tr-real[dataid="' + this.right[i].id + '"]')
                                    .replaceWith(this.right[i].bg);
                            }
                        }
                    });
                } else {
                    for (var i = 0; i < this.count; i++) {
                        if ($.inArray(this.left[i].id, hides) >= 0) {
                            bl.find('tr.tr-real[dataid="' + this.left[i].id + '"]').replaceWith(this.left[i].bg);
                            br.find('tr.tr-real[dataid="' + this.right[i].id + '"]').replaceWith(this.right[i].bg);
                        }
                    }
                }

            });
            $(s.viewData).each(function () {
                if (this.active) {
                    for (var i = 0; i < this.count; i++) {
                        if ($.inArray(this.left[i].id, gids) >= 0) {
                            bl.find('tr.tr-background[dataid="' + this.left[i].id + '"]').replaceWith(this.left[i].html);
                            br.find('tr.tr-background[dataid="' + this.right[i].id + '"]').replaceWith(this.right[i].html);

                            bl.find('tr.tr-child[dataid="' + this.left[i].id + '"]')
                                .attr('data-top', this.left[i].top);

                            br.find('tr.tr-child[dataid="' + this.left[i].id + '"]')
                                .attr('data-top', this.left[i].top);

                        }
                    }
                }
            });
            s.setRowEvents();
        }

        s.clearViewData = function () {
            $(s.viewData).each(function () {
                this.left = [];
                this.right = [];
                this.count = 0;
                this.active = false;
            });

            var bd = $(sel).find('> .salary-table > .main-content .area tbody');
            bd.find('tr.tr-child').remove();
            bd.find('.tr-group').removeClass('showed-child');
            bd.find('.tr-background').remove();

        }

        s.loadDataSequentially = function (arr, callback) {
            s.searchParams.orgStr = arr.join(';');
            s.sequentially.ajax = $.ajax({
                url: set.dataUrl != null ? set.dataUrl : '/api/' + set.model + "List",
                type: "GET",
                dataType: "JSON",
                contentType: 'application/json; charset=utf-8',
                data: s.searchParams,
                success: function (result) {
                    var list = result.length > 0 ? result : [];

                    var mc = $(sel).find('> .salary-table > .main-content');

                    s.sourceData = $.merge(s.sourceData, list);
                    s.count += result.Count;
                    var r;

                    s.sumarray = [];

                    if (set.rows.length > 0) {
                        if (list != null && list.length > 0) {
                            var idAttr = "Id";
                            if (set.idAttribute != null) {
                                idAttr = set.idAttribute;
                            }
                            var has;
                            $.each(list,
                                function (k, item) {
                                    r = s.drawRow(item, idAttr, 1, k + 1, true, item[set.group.attr]);
                                    has = false;
                                    $(s.viewData).each(function () {
                                        if (this.gid == item[set.group.attr]) {
                                            has = true;
                                            this.active = true;
                                            this.left.push({
                                                keyword: item.Keyword,
                                                active: true,
                                                id: item[idAttr],
                                                html: r.left,
                                                bg: ''
                                            });
                                            this.right.push({
                                                id: item[idAttr],
                                                html: r.right,
                                                bg: ''
                                            });
                                            this.count++;
                                            return;
                                        }
                                    });

                                    if (!has) {
                                        s.viewData.push({
                                            keyword: item.Keyword,
                                            active: true,
                                            gid: item[set.group.attr],
                                            left: [{
                                                active: true,
                                                html: r.left,
                                                bg: ''
                                            }],
                                            right: [{
                                                html: r.left,
                                                bg: ''
                                            }],
                                            count: 1,
                                            loaded: true
                                        });
                                    }
                                });
                        }
                        //else {
                        //    r = s.drawEmptyRow(true);
                        //    mc.find(".area-bl tbody").append(r);
                        //    r = s.drawEmptyRow(false);
                        //    mc.find(".area-br tbody").append(r);
                        //    mc.find('.empty-message').css('display', 'block');
                        //}
                    }

                    if (s.sequentially.first) {
                        s.sequentially.first = false;

                    }

                    s.sequentially.loaded += arr.length;

                    app.loadingAsyncData({
                        mode: 1,
                        tl: s.sequentially.loaded / s.viewData.length
                    });

                    arr = [];
                    $(s.viewData).each(function () {
                        if (!this.loaded) {
                            if (arr.length < s.sequentially.number) {
                                arr.push(this.gid);
                                this.loaded = true;
                            } else {
                                return;
                            }
                        }
                    });

                    if (arr.length > 0) {
                        s.loadDataSequentially(arr);
                    } else {
                        s.sequentially.loading = false;
                        app.loadingAsyncData({
                            mode: 2
                        });
                        s.sortai();

                        s.setRowPositions();

                        s.showBackground();
                        s.showData(0);
                        s.hideTableLoading();
                        if (set.loadDataCallback != null) {
                            set.loadDataCallback(result);
                        }
                        if (callback != null) {
                            callback(result);
                        }
                    }
                }
            });
        }
        s.setRowPositions = function () {
            var h = set.height.row;
            var top = -set.height.row;
            $(s.viewData).each(function () {
                if (this.active) {
                    top += h;
                    this.top = top;
                    if (this.count > 0) {
                        var cc = 0;
                        for (var j = 0; j < this.count; j++) {
                            if (this.left[j].active) {
                                top += h;
                                cc++;
                                var id = this.left[j].id;
                                this.left[j].top = top;
                                var e = s.drawBackground(id, h, top, this.gid);
                                this.left[j].html = this.left[j].html.replace("##top##", top);
                                this.right[j].html = this.right[j].html.replace("##top##", top);

                                this.left[j].bg = e.left;
                                this.right[j].bg = e.right;
                            }
                        }
                        this.top = h * cc;
                    }
                }
            });
        }
        s.drawBackground = function (id, h, top, gid) {
            var el = '<tr dataid="' + id + '" data-top="' + top + '" class="tr-background tr-child" groupid="' + gid + '" style="">' +
                '<td style="height: ' + h + 'px" colspan="' + set.skipCols + '">&nbsp;</td></tr>';
            var er = '<tr dataid="' + id + '" data-top="' + top + '" class="tr-background tr-child" groupid="' + gid + '" style="">' +
                '<td style="height: ' + h + 'px" colspan="' + s.colRight + '">&nbsp;</td></tr>';
            return {
                left: el,
                right: er
            };
        }
        s.sortai = function () {
            var stt;
            $(s.viewData).each(function () {
                if (this.active) {
                    stt = 0;
                    $(this.left).each(function () {
                        if (this.active) {
                            var temp = $(this.html);
                            stt++;
                            temp.find('td:eq(0)').text(stt);
                            var h = $("<div>").append(temp.clone()).html();
                            this.html = h;
                        }
                    });
                }
            });
        }

        s.loadData = function (params, callback, reload) {
            if (params != null) {
                $.extend(s.searchParams, params);
            }
            var mc = $(sel).find('> .calendar-table > .main-content');
            if (set.multiLevel) {
                if (s.activeParentId != null) {
                    var tr = mc.find('.area-br tbody tr[dataid="' + s.activeParentId + '"]');
                    s.reloadChilds(tr);
                } else {
                    if (set.group != null && set.group.sequentially) {
                        var arr = [];

                        //s.sequentially.total = s.viewData % s.sequentially.number == 0
                        //    ? (s.viewData / s.sequentially.number)
                        //    : (s.viewData / s.sequentially.number) + 1;

                        $(s.viewData).each(function () {
                            if (!this.loaded) {
                                if (arr.length < s.sequentially.number) {
                                    arr.push(this.gid);
                                    this.loaded = true;
                                } else {
                                    return;
                                }
                            }
                        });

                        if (arr.length > 0) {
                            s.sequentially.loading = true;
                            s.sequentially.first = true;

                            app.loadingAsyncData({
                                mode: 0,
                                text: 'Đang tải dữ liệu bảng công'
                            });

                            s.clearViewData();

                            s.loadDataSequentially(arr, callback);
                        }

                    }
                    else {
                        s.showTableLoading();
                        $.ajax({
                            url: set.dataUrl != null ? set.dataUrl : '/api/' + set.model + "List",
                            type: "GET",
                            dataType: "JSON",
                            contentType: 'application/json; charset=utf-8',
                            data: s.searchParams,
                            success: function (result) {
                                var count = result.Count != null ? result.Count : 0;
                                var list = result.Many != null ? result.Many : result.length > 0 ? result : [];
                                if (count == 0) {
                                    count = list.length;
                                }
                                var hasOm = set.optionMenu != null;
                                //mc.find(".area-bl tbody").html("");
                                //mc.find(".area-br tbody").html("");
                                //mc.find(".area-bom tbody").html("");

                                s.sourceData = list;

                                s.count = result.Count;

                                if (set.rows.length > 0) {
                                    if (list != null && list.length > 0) {
                                        var idAttr = "Id";

                                        if (set.idAttribute != null) {
                                            idAttr = set.idAttribute;
                                        }
                                        s.sumarray = [];

                                        s.viewData = [];

                                        if (reload) {
                                            if (set.group == null) {
                                                mc.find(".area-bl tbody").html('');
                                                mc.find(".area-br tbody").html('');
                                            }
                                        }

                                        $.each(list, function (k, item) {
                                            var r;
                                            if (set.group != null) {
                                                r = s.drawRow(item, idAttr, 1, k + 1, true, item[set.group.attr]);
                                                var has = false;
                                                $(s.viewData).each(function () {
                                                    if (this.gid == item[set.group.attr]) {
                                                        has = true;
                                                        this.left += r.left;
                                                        this.right += r.right;
                                                        this.count += 1;
                                                        return;
                                                    }
                                                });
                                                if (!has) {
                                                    s.viewData.push({
                                                        gid: item[set.group.attr],
                                                        left: r.left,
                                                        right: r.right,
                                                        count: 1
                                                    });
                                                }
                                            } else {
                                                r = s.drawRow(item, idAttr, 1, k + 1, true, '');
                                                mc.find(".area-bl tbody").append(r.left);
                                                //r = s.drawRow(item, idAttr, 1, k + 1, false, '');
                                                mc.find(".area-br tbody").append(r.right);
                                            }

                                            if (hasOm) {
                                                mc.find(".area-bom tbody").append(s.drawOptionMenu(item, idAttr));
                                            }
                                        });

                                        //$(bodys).each(function() {
                                        //    var p = mc.find('.area-bl tbody tr[groupid="' + this.gid + '"]').last();
                                        //    //$(p).after(this.left); 
                                        //    p = mc.find('.area-br tbody tr[groupid="' + this.gid  + '"]').last();
                                        //    //$(p).after(this.right);
                                        //    console.log(this);
                                        //});


                                        if (set.group != null) {
                                            mc.find('tbody tr.tr-child').remove();
                                            var h;
                                            var top = -set.height.row;
                                            $(s.viewData).each(function () {
                                                h = set.height.row * this.count;
                                                top += set.height.row;
                                                var p = mc.find('.area-bl tbody tr[groupid="' + this.gid + '"]')
                                                    .attr('data-top', top).attr('data-height', h + set.height.row);
                                                $(p).after('<tr class="tr-background" groupid="' +
                                                    this.gid +
                                                    '">' +
                                                    '<td style="height: ' +
                                                    h +
                                                    'px" colspan="' +
                                                    set.skipCols +
                                                    '">&nbsp;</td></tr>');
                                                p = mc.find('.area-br tbody tr[groupid="' + this.gid + '"]')
                                                    .attr('data-top', top).attr('data-height', h + set.height.row);
                                                $(p).after('<tr class="tr-background" groupid="' +
                                                    this.gid +
                                                    '"><td style="height: ' +
                                                    h +
                                                    'px" colspan="' +
                                                    s.colRight +
                                                    '">&nbsp;</td></tr>');
                                                top += h;
                                            });

                                            s.sortai();

                                            s.showData(0);

                                        } else {
                                            s.setRowEvents();
                                        }

                                        mc.find('.empty-message').css('display', 'none');
                                    } else {
                                        var r = s.drawEmptyRow(true);
                                        mc.find(".area-bl tbody").append(r);
                                        r = s.drawEmptyRow(false);
                                        mc.find(".area-br tbody").append(r);
                                        mc.find('.empty-message').css('display', 'block');
                                    }
                                }

                                mc.find(" .total-row span").text(count);

                                s.hideTableLoading();

                                if (set.loadDataCallback != null) {
                                    set.loadDataCallback(result, reload);
                                }
                                if (callback != null) {
                                    callback(result);
                                }
                            }
                        });
                    }
                }
            }
        };

        s.searchGroup = function (gid) {
            if (gid.length > 0) {
                gid = parseInt(gid);
                $(s.viewData).each(function () {
                    if (this.gid == gid) {
                        this.active = true;
                    } else {
                        this.active = false;
                    }
                });
            } else {
                $(s.viewData).each(function () {
                    if (this.count > 0) {
                        this.active = true;
                    } else {
                        this.active = false;
                    }
                });
            }
            s.setRowPositions();
            s.showBackground();
            s.showData(0);
        }

        s.search = function (k) {
            var bd = $(sel).find('> .calendar-table > .main-content .area tbody');
            bd.find('tr.tr-child').remove();
            bd.find('.tr-background').remove();

            s.showTableLoading();
            $(s.viewData).each(function () {
                this.active = false;
                if (this.count > 0) {
                    for (var i = 0; i < this.count; i++) {
                        if (k.length > 0) {
                            if (this.left[i].keyword.indexOf(k) >= 0) {
                                this.active = true;
                                this.left[i].active = true;
                            } else {
                                this.left[i].active = false;
                            }
                        } else {
                            this.active = true;
                            this.left[i].active = true;
                        }
                    }
                }
            });
            s.sortai();
            s.setRowPositions();
            s.showBackground();
            s.showData(0);
            s.hideTableLoading();
        };

        s.setData = function (result, callback) {

            var count = result.Count != null ? result.Count : 0;
            var list = result.Many != null ? result.Many : result.length > 0 ? result : null;
            if (list != null) {
                if (count == 0) {
                    count = list.length;
                }
                $(sel).find(".area-bl tbody").html("");
                $(sel).find(".area-br tbody").html("");
                s.sourceData = list;
            }

            s.count = count;
            if (set.rows.length > 0) {
                if (list != null && list.length > 0) {
                    var idAttr = "Id";

                    if (set.idAttribute != null) {
                        idAttr = set.idAttribute;
                    }
                    s.sumarray = [];
                    $.each(list,
                        function (k, item) {
                            var r = s.drawRow(item, idAttr, 1, k + 1, true);
                            $(sel).find(".area-bl tbody").append(r);
                            r = s.drawRow(item, idAttr, 1, k + 1, false);
                            $(sel).find(".area-br tbody").append(r);
                        });
                }
            }
            $(sel).find(".main-content .total-row span").text(count);

            s.hideTableLoading();
            s.setRowEvents();
            if (set.loadDataCallback != null) {
                set.loadDataCallback(result);
            }
            if (callback != null) {

                callback(result);
            }
        }

        s.setSubmitEvent = function (type) {
            var flag = true;
            if (set.beforeSubmit != null) {
                flag = set.beforeSubmit();
            }
            if (!flag || !set.autoSubmit) return false;

            s.submitForm(type);
        };
        s.hideModal = function () {
            var type = parseInt($('#' + set.model + 'FormEditModal').attr('data-type'));
            if (type == 2) {
                $('#' + set.model + 'FormEditModal').fadeOut('fast',
                    function () {
                        $('#' + set.model + 'FormEditModal').remove();
                    });
            } else {
                $('#' + set.model + 'FormEditModal').modal("hide");
            }
            $('body').removeClass('overflow-hidden');
        };
        s.eventModal = function () {
            $('.form-cancel').unbind().click(function () {
                s.hideModal();
            });

            var wh = $(window).height();
            var fem = '#formEditModal';
            var h = $(fem + ' form').height();
            h += 57 + 60;
            var t = (wh - h) / 4;
            if (wh < h) {
                t = 0;
                h = wh;
            }
            $(fem + ' .wtable-epanel-content')
                .css('height', h + 'px')
                .css('top', t + 'px');

            $(window).resize(function () {
                var modal = set.modal;
                if (modal.type == 2) {
                    var ww = $(window).width();
                    wh = $(window).height();
                    var mw = modal.width;
                    var l = '';
                    if (mw.indexOf('%') > -1) {
                        mw = mw.substr(0, mw.length - 1);
                        l = ((100 - parseInt(mw)) / 2) + '%';
                    } else if (mw.indexOf('px') > -1) {
                        mw = mw.substr(0, mw.length - 2);
                        mw = parseInt(mw);
                        if (ww > mw) {
                            l = ((ww - mw) / 2) + 'px';
                        } else {
                            l = '0px';
                        }
                    }
                    var h = $(fem + ' form').height();
                    h += 57 + 60;
                    t = (wh - h) / 4;
                    if (wh < h) {
                        t = 0;
                        h = wh;
                    }
                    $(fem + ' .wtable-epanel-content')
                        .css('left', l)
                        .css('height', h + 'px')
                        .css('top', t + 'px');
                }
            });

            $(fem).on('keyup keypress',
                function (e) {
                    var keyCode = e.keyCode || e.which;
                    if (keyCode === 13) {
                        e.preventDefault();
                        return false;
                    }
                });

        };

        s.initModal = function (modal, content) {
            var html = '';
            if (modal.type == 2) {
                var ww = $(window).width();
                var mw = modal.width;
                var l = '';
                if (mw.indexOf('%') > -1) {
                    mw = mw.substr(0, mw.length - 1);
                    l = ((100 - parseInt(mw)) / 2) + '%';
                } else if (mw.indexOf('px') > -1) {
                    mw = mw.substr(0, mw.length - 2);
                    mw = parseInt(mw);
                    if (ww > mw) {
                        l = ((ww - mw) / 2) + 'px';
                    }
                }
                html = '<div class="wtable-epanel" id="' + set.model + 'FormEditModal" data-type="' + modal.type + '">';
                if (modal.width != "") {
                    html += '<div class="wtable-epanel-content" style="width:' + modal.width + ';left: ' + l + '">';
                } else {
                    html += '<div class="wtable-epanel-content">';
                }
                html += '<div class="panel panel-flat wtable-panel">';
                html += content;
                html += '</div></div></div>';
                $("body").append(html);
            } else {
                html = '<div class="modal" id="' +
                    set.model +
                    'FormEditModal" data-type="' +
                    modal.type +
                    '" data-backdrop="static"  role="dialog" aria-labelledby="myModalLabel" aria-hidden="true">';
                if (modal.width != "") {
                    html += '    <div class="modal-dialog" style="width:' + modal.width + '">';
                } else {
                    html += '    <div class="modal-dialog" >';
                }
                html += '<div class="modal-content">';
                html += '      <div class="modal-header p-15 ' +
                    (modal.headerClass != null ? modal.headerClass : '') +
                    '">';
                html +=
                    '          <button class="close" aria-hidden="true" data-dismiss="modal" type="button">×</button>';
                html += '              <h5 class="modal-title text-bold">' + modal.title + '</h5>';
                html += '          </div><form id="' +
                    set.model +
                    'Form" class="form-horizontal">' +
                    '<div class="modal-body ' +
                    (modal.noPaddingBody != null ? 'no-padding' : 'pt-15 pl-15 pr-15 pb-5') +
                    '">';
                html += content;
                html += '</div>';
                if (modal.footerTemplate != null) {
                    html += $(modal.footerTemplate).html();
                } else {
                    switch (modal.mode) {
                        case 2:
                            {
                                html += '<div class="panel-footer panel-footer p-15">' +
                                    '<div class="pull-right">' +
                                    '<button class="btn btn-sm btn-default form-cancel mr-10 btn-rounded" data-dismiss="modal">' +
                                    '<i class="fa fa-remove"></i> Thoát' +
                                    '</button>' +
                                    '<button class="btn btn-sm bg-slate mr-10 btn-submit btn-rounded" type="button" data-mode="1" ' +
                                    'data-loading-text="<i class=' +
                                    "'icon-spinner4 fa-spin position-left'" +
                                    '></i> Lưu tạm">' +
                                    '<i class="icon-floppy-disk position-left"></i> Lưu tạm' +
                                    '</button>' +
                                    '<button class="btn btn-sm btn-success btn-submit btn-rounded" type="button" data-mode="2" ' +
                                    'data-loading-text="<i class=' +
                                    "'icon-spinner4 fa-spin position-left'" +
                                    '></i> Lưu và gửi đề xuất">' +
                                    '<i class="icon-paperplane position-left"></i> Lưu và gửi đề xuất' +
                                    '</button>' +
                                    '</div>' +
                                    '</div>';
                            }
                            break;
                        case 3:
                            {
                                html += '<div class="panel-footer panel-footer p-15">' +
                                    '<div class="pull-right">' +
                                    '<button class="btn btn-sm btn-default form-cancel mr-10 btn-rounded" data-dismiss="modal">' +
                                    '<i class="fa fa-remove"></i> Thoát' +
                                    '</button>' +
                                    '<button class="btn btn-sm bg-slate mr-10 btn-submit btn-rounded" type="button" data-mode="1" ' +
                                    'data-loading-text="<i class=' +
                                    "'icon-spinner4 fa-spin position-left'" +
                                    '></i> Lưu tạm">' +
                                    '<i class="icon-floppy-disk position-left"></i> Lưu tạm' +
                                    '</button>' +
                                    '<button class="btn btn-sm btn-success btn-submit btn-rounded" type="button" data-mode="3" ' +
                                    'data-loading-text="<i class=' +
                                    "'icon-spinner4 fa-spin position-left'" +
                                    '></i> Lưu và gửi đề xuất">' +
                                    '<i class="icon-check position-left"></i> Lưu và ký chốt' +
                                    '</button>' +
                                    '</div>' +
                                    '</div>';
                            }
                            break;
                        default:
                            {
                                html += '<div class="panel-footer panel-footer p-15">' +
                                    '<div class="pull-right">' +
                                    '<button class="btn btn-sm btn-default form-cancel mr-10 btn-rounded" data-dismiss="modal">' +
                                    '<i class="fa fa-remove"></i> Thoát' +
                                    '</button>' +
                                    '<button class="btn btn-sm btn-fill btn-primary m-r-5 btn-submit btn-rounded" type="button" ' +
                                    'data-loading-text="<i class=' +
                                    "'icon-spinner4 fa-spin'" +
                                    '></i> Đang xử lý ...">' +
                                    '<i class="fa fa-save"></i> Lưu lại' +
                                    '</button>' +
                                    '</div>' +
                                    '</div>';
                            }
                    }
                }
                html += '</form></div></div></div>';
                $("body").append(html);
                $('#' + set.model + 'FormEditModal').on('hidden.bs.modal',
                    function (e) {
                        $('body').removeClass('overflow-hidden');
                        $('#' + set.model + 'FormEditModal').remove();
                    });
            }
        }
        s.showModal = function () {
            var type = parseInt($('#' + set.model + 'FormEditModal').attr('data-type'));
            if (type == 2) {

                $('#' + set.model + 'FormEditModal').fadeIn('fast');
            } else {
                $('#' + set.model + 'FormEditModal').modal("show");
            }
            $('body').addClass('overflow-hidden');
        }

        s.createOrUpdateComment = function (t, obj, initCallback, callback) {
            var title = t == 0 ? 'Tạo' : 'Sửa';
            title += ' ghi chú';
            var ccm = 'calendarCommentForm';
            s.showTableLoading();
            app.createPartialModal({
                url: DOMAIN_API + '/cb/CbTimekeepingCommentCommand',
                data: obj,
                modal: {
                    width: '500px',
                    title: title,
                    id: ccm
                }
            }, function () {
                initCallback();
                initCbTimekeepingCommentForm(function () {
                    $('#' + ccm).remove();
                    $('.modal-backdrop').remove();
                    callback();
                });
                s.hideTableLoading();
                $('#' + ccm).on('hidden.bs.modal',
                    function (e) {
                        // do something...
                        $('#' + ccm).remove();
                    });
            });
        }

        s.createOrUpdateObject = function (id, callback, tr) {
            s.showTableLoading();
            var url = set.editController != null ? set.editController + '/' : '/admin/';
            url += set.model + "Edit";
            $.extend(s.editParams,
                {
                    id: id
                });
            $.ajax({
                url: url,
                type: "GET",
                data: s.editParams,
                dataType: "html",
                success: function (result) {
                    s.hideTableLoading();
                    var m = set.modal;
                    s.initModal({
                        title: (id != null ? 'Cập nhật ' : 'Thêm mới ') + m.title,
                        width: m.width,
                        type: m.type != null ? m.type : 1,
                        noPaddingBody: m.noPaddingBody,
                        headerClass: m.headerClass,
                        noFooter: m.noFooter,
                        mode: m.mode
                    },
                        result);
                    s.eventModal();
                    s.showModal();

                    if (set.loadModalCallback != null) {
                        set.loadModalCallback(tr);
                    }
                    if (callback) {
                        callback();
                    }
                }
            });
        };
        s.getSelectedIds = function () {
            var ids = [];
            $.each($(sel).find('> .calendar-table > .main-content .area-br tr'),
                function (k, tr) {
                    if ($(tr).hasClass("active")) {
                        ids.push($(tr).attr("dataid"));
                    }
                });
            return ids;
        }
        s.getCheckedRowIds = function () {
            var ids = [];
            $.each($(sel).find('> .calendar-table > .main-content .first-col input[type="checkbox"]'),
                function () {
                    if ($(this).prop('checked') == true) {
                        ids.push($(this).closest('tr').attr("dataid"));
                    }
                });
            return ids;
        }
        s.getCheckedDatas = function () {
            var result = [];
            var idAttr = "Id";
            if (set.idAttribute != null) {
                idAttr = set.idAttribute;
            }
            var ids = s.getCheckedRowIds();
            for (var i = 0; i < ids.length; i++) {
                $(s.sourceData).each(function () {
                    if (this[idAttr] == ids[i]) {
                        result.push(this);
                        return false;
                    }
                });
            }
            return result;
        };
        s.setCheckedRowIds = function (ids) {
            var mc = $(sel).find('> .calendar-table > .main-content');
            for (var i = 0; i < ids.length; i++) {
                var tr = mc.find('.area-bl tr[dataid="' + ids[i] + '"]');
                var checkbox = $(tr).find('.first-col input[type="checkbox"]');
                checkbox.prop('checked', true);
            }
            $.uniform.update();
        }
        s.getSelectedRow = function () {
            var tr = $(sel).find('> .calendar-table > .main-content .area-br tr[class="active"]').first();
            return tr;
        };
        s.getSelectedDatas = function () {
            var result = [];
            var idAttr = "Id";
            if (set.idAttribute != null) {
                idAttr = set.idAttribute;
            }
            var ids = s.getSelectedIds();
            for (var i = 0; i < ids.length; i++) {
                $(s.sourceData).each(function () {
                    if (this[idAttr] == ids[i]) {
                        result.push(this);
                        return false;
                    }
                });
            }
            return result;
        };

        s.addChild = function (param, tr) {
            s.showTableLoading();
            var url = set.editController != null ? set.editController + '/' : '/admin/';
            url += set.model + "Edit";

            var m = set.modal;

            $.ajax({
                url: url,
                type: "GET",
                data: param,
                dataType: "html",
                success: function (result) {
                    s.hideTableLoading();
                    s.initModal({
                        title: 'Thêm ' + m.title.toLowerCase(),
                        width: m.width,
                        type: m.type != null ? m.type : 1,
                        mode: m.mode
                    },
                        result);
                    s.eventModal();
                    s.showModal();

                    if (set.loadModalCallback != null) {
                        set.loadModalCallback(tr);
                    }
                }
            });
        };

        s.getDataById = function (id) {
            var data;
            var idAttr = "Id";
            if (set.idAttribute != null) {
                idAttr = set.idAttribute;
            }
            $(s.sourceData).each(function () {
                if (this[idAttr] == id) {
                    data = this;
                    return false;
                }
            });
            return data;
        };
        s.getActiveTabIndex = function () {
            var index = $(sel).find('> .calendar-table > .sub-content > .tab-content > div.active').index();
            return index;
        }
        s.loadFilterOption = function (ele, callback) {
            if (!$(ele).hasClass('loaded')) {
                var idex = ele.attr('data-index');
                var f = set.rows[idex].filter;
                if (f.ajax != null) {
                    var par = f.ajax.data;
                    app.loadData(f.ajax.url,
                        par,
                        null,
                        function (result) {
                            ele.addClass('loaded');
                            var lst = result.Many != null ? result.Many : result;
                            $(lst).each(function () {
                                var option = new Option(this[f.ajax.attr.text],
                                    this[f.ajax.attr.id],
                                    true,
                                    true);
                                ele.append(option);
                            });
                            ele.select2('val', '');

                            if (callback != null) {
                                callback();
                            }
                        });
                    return true;
                }
            }
        }
        s.setStaticEvents = function () {
            s.resize();
            $(window).resize(function () {
                s.resize();
            });

            var mc = $(sel).find('> .calendar-table > .main-content');
            var rs = $(sel).find('> .calendar-table > .resize');
            var sc = $(sel).find('> .calendar-table > .sub-content');
            var scm = $('#sub_content_modal');

            window.addEventListener('touchstart',
                function (e) {
                    s.tounchTr = $(e.target).closest('.area');
                });

            $(mc).find(' .area').mouseover(function () {
                s.tounchTr = $(this);
            });

            mc.find('.area-tr > div').scroll(function () {
                if ($(s.tounchTr).length == 0 || $(s.tounchTr).hasClass('area-tr')) {
                    var l = $(this).scrollLeft();
                    mc.find('.area-br > div').scrollLeft(l);
                }
            });

            mc.find('.area-br > div').scroll(function () {
                if ($(s.tounchTr).length == 0 || $(s.tounchTr).hasClass('area-br')) {
                    clearTimeout($.data(this, "scrollCheck"));
                    var t = $(this).scrollTop();
                    var l = $(this).scrollLeft();
                    mc.find('.area-bl > div').scrollTop(t);
                    mc.find('.area-tr > div').scrollLeft(l);
                    $.data(this, "scrollCheck", setTimeout(function () {
                        if (!s.searching) {
                            s.showData(t);
                        }
                    }, 100));
                }
            });

            mc.find('.area-bl > div').scroll(function () {
                if ($(s.tounchTr).length == 0 || $(s.tounchTr).hasClass('area-bl')) {
                    var t = $(this).scrollTop();
                    mc.find('.area-br > div').scrollTop(t);
                    clearTimeout($.data(this, "scrollCheck"));
                    $.data(this, "scrollCheck", setTimeout(function () {
                        if (!s.searching) {
                            s.showData(t);
                        }
                    }, 100));
                }
            });

            mc.find(".checkAll").click(function () {
                if ($(this).prop("checked")) {
                    mc.find(".area-bl .first-col input").prop("checked", true);
                    mc.find(".area-br .first-col input").prop("checked", true);
                    if (set.toolbars != null) {
                        if (set.toolbars.delete != null) {
                            $(set.toolbars.delete.ele).prop('disabled', false);
                        }
                        if (set.toolbars.edit != null) {
                            $(set.toolbars.edit.ele).prop('disabled', true);
                        }
                    }
                } else {
                    mc.find(".area-bl .first-col input").prop("checked", false);
                    mc.find(".area-br .first-col input").prop("checked", false);
                    if (set.toolbars != null) {
                        if (set.toolbars.delete != null) {
                            $(set.toolbars.delete.ele).prop('disabled', true);
                        }
                        if (set.toolbars.edit != null) {
                            $(set.toolbars.edit.ele).prop('disabled', true);
                        }
                    }
                }
                $.uniform.update();
                if (set.selectRowCallback != null) {
                    set.selectRowCallback();
                }
            });

            var tempPosition;

            rs.draggable({
                axis: "y",
                start: function (event, ui) {
                    tempPosition = ui.position.top;
                },
                stop: function (event, ui) {
                    var newValue = ui.position.top;
                    var change = newValue - tempPosition;
                    var oh = mc.find('.areas').height();
                    s.setMainTableHeight(oh + change);
                    rs.css('top', 0);
                    oh = sc.find('> .tab-content').height();
                    s.setSubContentHeight(oh + 70 - change);
                }
            });


            if (set.toolbars != null) {
                if (set.toolbars.create != null) {
                    $(set.toolbars.create.ele).unbind().click(function () {
                        if (set.toolbars.create.click != null) {
                            set.toolbars.create.click();
                        } else {
                            var btn = $(this);
                            btn.button('loading');
                            s.createOrUpdateObject(null,
                                function () {
                                    btn.button('reset');
                                });
                        }
                    });
                }
                if (set.toolbars.edit != null) {

                    var te = set.toolbars.edit;

                    $(te.ele).prop('disabled', true);
                    $(te.ele).unbind().click(function () {
                        var id = s.getSelectedIds()[0];
                        var tr = s.getSelectedRow();
                        var btn = $(this);
                        if (app.hasValue(id)) {
                            var data = s.getDataById(id);
                            if (te.before == null || te.before(data)) {
                                if (te.click != null) {
                                    te.click(id);
                                } else {
                                    btn.button('loading');
                                    s.createOrUpdateObject(id,
                                        function () {
                                            btn.button('reset');
                                        },
                                        tr);
                                }
                            }
                        } else {
                            app.notify('warning', 'Vui lòng chọn đối tượng cần sửa');
                        }
                    });
                }
                if (set.toolbars.delete != null) {
                    var td = set.toolbars.delete;
                    $(td.ele).prop('disabled', true);
                    $(td.ele).unbind().click(function () {
                        var ids = s.getCheckedRowIds();
                        if (ids.length > 0) {
                            if (td.before == null || td.before(ids)) {
                                s.deleteObjects('bulk',
                                    ids,
                                    function () {
                                        s.loadData();
                                    });
                            }
                        } else {
                            app.notify('warning', 'Vui lòng chọn đối tượng cần xóa');
                        }
                    });
                }
                if (set.toolbars.reload != null) {
                    $(set.toolbars.reload.ele).unbind().click(function () {
                        s.loadData();
                    });
                }
                if (set.toolbars.reorder != null) {
                    $(set.toolbars.reorder.ele).unbind().click(function () {
                        var ids = s.getCheckedRowIds();
                        if (ids.length == 0) {
                            app.notify('warning', 'Vui lòng chọn dữ liệu để sắp xếp');
                        } else {

                        }
                    });
                }
            }

            mc.find('.first-col input[type="checkbox"]').click(function () {
                var ca = mc.find(".checkAll");
                var tr = $(this).closest('tr');
                var id = tr.attr('dataid');
                if ($(this).prop("checked")) {
                    $(sel).find('.area-bl tr[dataid="' + id + '"]').addClass("active");
                    $(sel).find('.area-br tr[dataid="' + id + '"]').addClass("active");
                } else {
                    $(sel).find('.area-bl tr[dataid="' + id + '"]').removeClass("active");
                    $(sel).find('.area-br tr[dataid="' + id + '"]').removeClass("active");
                    if (ca.prop("checked")) {
                        ca.prop('checked', false);
                    }
                }
                var checkNumber = 0;
                var inputs = mc.find(' .first-col input');

                inputs.each(function () {
                    if ($(this).prop("checked") == true) {
                        checkNumber++;
                    }
                });

                if (inputs.length == checkNumber) {
                    ca.prop('checked', true);
                }
                if (set.toolbars != null) {
                    if (set.toolbars.delete != null) {
                        if (checkNumber > 0) {
                            $(set.toolbars.delete.ele).prop('disabled', false);
                        } else {
                            $(set.toolbars.delete.ele).prop('disabled', true);
                        }
                    }
                }
                $.uniform.update();
                if (set.selectRowCallback != null) {
                    set.selectRowCallback(tr);
                }
            });


            mc.find('.area-tr th .th-scroll').draggable({
                axis: "x",
                start: function (event, ui) {
                    tempPosition = ui.position.left;
                },
                stop: function (event, ui) {
                    var w = ui.position.left;
                    var ele = $(event.target);
                    var i = ele.attr('i');
                    var coltrs = ele.closest('table').find('> colgroup');
                    coltrs.find('col[i="' + i + '"]').css('width', w + 5);
                    var tw = 0;
                    coltrs.find('col').each(function () {
                        tw += parseInt($(this).width());
                    });
                    ele.closest('table').css('width', tw).attr('data-w', tw);
                    mc.find('.area-br colgroup col[i="' + i + '"]').css('width', w + 5);
                    mc.find('.area-br table').css('width', tw).attr('data-w', tw);
                    s.setMainTableWidth();
                }
            });

            if (set.height.correlate != null) {
                set.height.correlate.attrchange({
                    callback: function (e) {
                        var curHeight = $(this).height();
                        var th = curHeight - (set.toolbars != null ? 40 : 0);
                        var at = $(sel).find('> .calendar-table');
                        at.css('height', th);
                        if (set.subContent != null) {
                            if (at.hasClass('expand')) {
                                s.setMainTableHeight(th - 35);
                            } else {
                                s.setMainTableHeight(parseInt(th / 2));
                            }
                            s.setSubContentHeight(parseInt(th / 2));
                        } else {
                            s.setMainTableHeight(th - 35);
                        }
                    }
                });
            }

            mc.find('.btn-change-limit').unbind().click(function () {
                var l = $(this).attr('data');
                var txt = $(this).text();
                $(this).closest('.btn-group').find(' .dropdown-toggle span').text(txt);

                var p = {};
                if (l != '') {
                    p.limit = parseInt(l);
                } else {
                    p.unlimited = true;
                }
                s.search(p,
                    function () {

                    });
            });

            mc.find('.area-tr .table th.orderable').unbind().click(function () {
                var ob = $(this).attr('orderby');
                var co = $(this).attr('currentorder');
                var i = $(this).find('i');
                co = co == 'desc' ? 'asc' : 'desc';
                s.searchParams.orderby = ob;
                s.searchParams.orderType = co;
                $(this).attr('currentorder', co);
                if (i.hasClass('fa-caret-down')) {
                    i.removeClass('fa-caret-down').addClass('fa-caret-up');
                } else {
                    i.removeClass('fa-caret-up').addClass('fa-caret-down');
                }
                s.loadData();
            });
        };
        s.reorder = function (tr) {
            var rom = '#reorder_modal';
            if ($(rom).length == 0) {
                var html =
                    '<div class="modal fade" data-backdrop="static" tabindex="-1" role="dialog" aria-labelledby="mySmallModalLabel">' +
                    '<div class="modal-dialog modal-sm" role="document">' +
                    '<div class="modal-content"></div></div>' +
                    '</div>';
            } else {

            }
        }
        s.loadComment = function (td) {
            var cg = $(td).find('.comment-group');
            if (!cg.hasClass('loaded')) {
                var tr = $(td).closest('tr');
                var date = td.attr('data-m') + '/' + td.attr('data-dm') + '/' + td.attr('data-y');
                var par = {
                    detailId: tr.attr('dataid'),
                    date: date,
                    type: set.contextMenuDate.type,
                    dataType: 'html'
                };

                s.showTableLoading();

                app.loadData(DOMAIN_API + '/cb/getTimekeepingCommentView',
                    par,
                    null,
                    function (html) {
                        $(cg).find('.comment-content').html(html);
                        cg.addClass('loaded');
                        s.hideTableLoading();
                    });
            } else {

            }
        }

        s.setRowEvents = function (gid) {
            var mc = $(sel).find('> .calendar-table > .main-content');
            var rtd, rspan;
            if (gid != null) {
                console.log('events - ' + gid);
                mc.find('.area-bl tr.tr-group[groupid="' + gid + '"] .btn-expander').unbind().click(function () {
                    var btn = $(this);
                    var tr = btn.closest('tr');
                    s.expandChild(btn, tr, mc);
                });

                var trl = '.area-bl tr.tr-child[groupid="' + gid + '"]';
                var trr = '.area-br tr.tr-child[groupid="' + gid + '"]';

                mc.find(trl).unbind().hover(function () {
                    var id = $(this).attr('dataid');
                    $(sel).find('.area-br tr.tr-child[dataid="' + id + '"]').addClass('hover');
                    $(this).addClass('hover');

                }, function () {
                    var id = $(this).attr('dataid');
                    $(sel).find('.area-br tr.tr-child[dataid="' + id + '"]').removeClass('hover');
                    $(this).removeClass('hover');
                });

                mc.find('.area-br tr.tr-child[groupid="' + gid + '"]').unbind().hover(function () {
                    var id = $(this).attr('dataid');
                    $(sel).find('.area-bl tr.tr-child[dataid="' + id + '"]').addClass('hover');
                    $(this).addClass('hover');

                }, function () {
                    var id = $(this).attr('dataid');
                    $(sel).find('.area-bl tr.tr-child[dataid="' + id + '"]').removeClass('hover');
                    $(this).removeClass('hover');
                });

                mc.find(trl + ' td,' + trl + ' p,' + trl + ' span,' + trl + ' div').unbind().click(function (e) {
                    if (e.target != this) {
                        return;
                    }
                    s.selectRow($(this).closest('tr'));
                });

                rtd = trr + ' td';
                mc.find(rtd).unbind();
                rspan = mc.find(rtd + '.edit-inline > span');
                rspan.unbind();

                mc.find(rtd + '.edit-inline').click(function (e) {
                    if (e.target != this) return;
                    if (!$(this).hasClass('editing')) {
                        mc.find('.area td.editing').each(function () {
                            var inp = $(this).find('> .inline-form input');
                            s.closeEditInline(inp, inp.val(), inp.attr('data-type'));
                        });
                        $(this).addClass('editing');
                        var inp = $(this).find('input');
                        inp.select();
                    }
                });

                rspan.click(function (e) {
                    if (e.target != this) return;
                    $(this).closest('td').trigger("click");
                });

                mc.find(rtd).hover(function () {
                    $(this).addClass('hover');
                    if ($(this).hasClass('has-comment')) {
                        s.loadComment($(this));
                    }
                }, function () {
                    $(this).removeClass('hover');
                });

                var input = mc.find(".area td.edit-inline input");

                input.unbind();

                input.keydown(function (e) {

                    var keycode = (event.keyCode ? event.keyCode : event.which);
                    var v = $(this).val(), c, tr, body, ai, nextStr, td;
                    if (keycode == 9) {
                        s.closeEditInline($(this), v);
                        v = $(this).val();
                        c = $(this).attr('attr');
                        td = $(this).closest('td');
                        ai = parseInt(td.attr('i'));
                        tr = $(this).closest('tr');
                        var tds = tr.find('td.edit-inline');
                        nextStr = null;
                        $(tds).each(function () {
                            var tai = parseInt($(this).attr('i'));
                            if (tai > ai) {
                                nextStr = $(this);
                                return false;
                            }
                        });
                        if (nextStr == null) {
                            nextStr = tds.first();
                        }
                        if (nextStr.length > 0) {
                            nextStr.addClass('editing');
                            nextStr.find('input').focus().select();
                        }
                        return false;
                    }
                });

                input.keyup(function (e) {
                    var keycode = (event.keyCode ? event.keyCode : event.which);
                    var v = $(this).val(), c, tr, body, ai, nextStr, td;
                    if (keycode >= 65 && keycode <= 90) {

                    }
                    else {
                        switch (keycode) {
                            case 13:
                            case 40:  // xuống
                                {
                                    s.closeEditInline($(this), v);
                                    c = $(this).closest('td').attr('i');
                                    tr = $(this).closest('tr');
                                    body = tr.closest('body');
                                    ai = parseInt(tr.attr('ai'));
                                    nextStr = body.find('tr[ai="' + (ai + 1) + '"]');
                                    if (nextStr.length == 0) {
                                        nextStr = body.find('tr[ai="1"]');
                                    }
                                    if (nextStr.length > 0) {
                                        td = nextStr.find('td[i="' + c + '"]');
                                        if (td.length > 0) {
                                            td.addClass('editing');
                                            td.find('input').focus().select();
                                        }
                                    }
                                }
                                break;

                            case 39: // phải 
                                {
                                    s.closeEditInline($(this), v);
                                    c = $(this).attr('attr');
                                    td = $(this).closest('td');
                                    ai = parseInt(td.attr('i'));
                                    tr = $(this).closest('tr');
                                    var tds = tr.find('td.edit-inline');
                                    nextStr = null;
                                    $(tds).each(function () {
                                        var tai = parseInt($(this).attr('i'));
                                        if (tai > ai) {
                                            nextStr = $(this);
                                            return false;
                                        }
                                    });
                                    if (nextStr == null) {
                                        nextStr = tds.first();
                                    }
                                    if (nextStr.length > 0) {
                                        nextStr.addClass('editing');
                                        nextStr.find('input').focus().select();
                                    }
                                }
                                break;
                            case 37: // trái
                                {
                                    s.closeEditInline($(this), v);
                                    c = $(this).attr('attr');
                                    td = $(this).closest('td');
                                    ai = parseInt(td.attr('i'));
                                    tr = $(this).closest('tr');
                                    var tds = tr.find('td.edit-inline');
                                    nextStr = null;
                                    $(tds).each(function () {
                                        var tai = parseInt($(this).attr('i'));
                                        if (tai < ai) {
                                            nextStr = $(this);
                                        }
                                    });
                                    if (nextStr == null) {
                                        nextStr = tds.last();
                                    }
                                    if (nextStr.length > 0) {
                                        nextStr.addClass('editing');
                                        nextStr.find('input').focus().select();
                                    }
                                }
                                break;
                            case 38: // lên
                                {
                                    s.closeEditInline($(this), v);
                                    c = $(this).closest('td').attr('i');
                                    tr = $(this).closest('tr');
                                    body = tr.closest('body');
                                    ai = parseInt(tr.attr('ai'));
                                    nextStr = body.find('tr[ai="' + (ai - 1) + '"]');

                                    if (nextStr.length == 0) {
                                        nextStr = body.find('tr:not(.tr-total)').last();
                                    }
                                    if (nextStr.length > 0) {
                                        td = nextStr.find('td[i="' + c + '"]');
                                        if (td.length > 0) {
                                            td.addClass('editing');
                                            td.find('input').focus().select();
                                        }
                                    }
                                }
                                break;
                        }
                    }
                });

            }
            else {

                mc.find(".area-bl tr").unbind().hover(function () {
                    var id = $(this).attr('dataid');
                    $(sel).find('.area-br tr[dataid="' + id + '"]').addClass('hover');
                    $(this).addClass('hover');

                }, function () {
                    var id = $(this).attr('dataid');
                    $(sel).find('.area-br tr[dataid="' + id + '"]').removeClass('hover');
                    $(this).removeClass('hover');
                });

                mc.find(".area-br tr").unbind().hover(function () {
                    var id = $(this).attr('dataid');
                    $(sel).find('.area-bl tr[dataid="' + id + '"]').addClass('hover');
                    $(this).addClass('hover');
                }, function () {
                    var id = $(this).attr('dataid');
                    $(sel).find('.area-bl tr[dataid="' + id + '"]').removeClass('hover');
                    $(this).removeClass('hover');
                });

                mc.find(".area-bl tr td").unbind().click(function (e) {
                    if (e.target != this) return;
                    s.selectRow($(this).closest('tr'));
                });

                rtd = '.area-br tr td';
                mc.find(rtd).unbind();

                //mc.find(rtd).click(function (e) {
                //    if (e.target != this) return;
                //    s.selectRow($(this).closest('tr'));
                //});

                rspan = mc.find(".area td.edit-inline > span");
                rspan.unbind();


                $('.add-comment').unbind().click(function () {
                    var td = $(this).closest('td');
                    var tr = td.closest('tr');
                    var id = $(tr).attr('dataid');
                    var date = td.attr('data-m') + '/' + td.attr('data-dm') + '/' + td.attr('data-y');
                    console.log(45454);
                    s.createOrUpdateComment(0,
                        {
                            date: date,
                            detailId: id,
                            type: set.contextMenuDate.type,
                            AuthEmployeeId: auth.EmployeeId
                        }, function () {

                        }, function () {
                            s.saveAfterChangeComment(td, 1);
                        });
                });

                $('.edit-comment').unbind().click(function () {
                    var td = $(this).closest('td');
                    var tr = td.closest('tr');
                    var id = $(tr).attr('dataid');
                    var date = td.attr('data-m') + '/' + td.attr('data-dm') + '/' + td.attr('data-y');
                    s.createOrUpdateComment(1,
                        {
                            date: date,
                            detailId: id,
                            type: set.contextMenuDate.type,
                            AuthEmployeeId: auth.EmployeeId
                        }, function () {

                        }, function () {
                            s.saveAfterChangeComment(td, 1);
                        });
                });

                $('.delete-comment').unbind().click(function () {
                    var td = $(this).closest('td');
                    var tr = td.closest('tr');
                    var id = $(tr).attr('dataid');
                    var date = td.attr('data-m') + '/' + td.attr('data-dm') + '/' + td.attr('data-y');
                    app.confirm('warning',
                        null,
                        null,
                        function (ok) {
                            if (ok) {
                                app.postData(DOMAIN_API + '/cb/DeleteCbTimekeepingComment',
                                    {
                                        date: date,
                                        detailId: id,
                                        type: set.contextMenuDate.type,
                                        AuthEmployeeId: auth.EmployeeId
                                    }, function () {
                                        s.saveAfterChangeComment(td, 0);
                                    });
                            }
                        });
                });


                mc.find(rtd + '.edit-inline').click(function (e) {
                    if (e.target != this) return;
                    if (!$(this).hasClass('editing')) {
                        mc.find('.area td.editing').each(function () {
                            var inp = $(this).find('> .inline-form input');
                            s.closeEditInline(inp, inp.val(), inp.attr('data-type'));
                        });
                        $(this).addClass('editing');
                        var inp = $(this).find('input');
                        inp.select();
                    }
                });

                rspan.click(function (e) {
                    if (e.target != this) return;
                    $(this).closest('td').trigger("click");
                });

                mc.find(rtd).hover(function () {
                    $(this).addClass('hover');
                    if ($(this).hasClass('has-comment')) {
                        s.loadComment($(this));
                    }
                }, function () {
                    $(this).removeClass('hover');
                });



                mc.find('.btn-expander').unbind().click(function () {
                    var btn = $(this);
                    var tr = btn.closest('tr');
                    s.expandChild(btn, tr, mc);
                });

                var input = mc.find(".area td.edit-inline input");

                input.unbind();

                input.keydown(function (e) {
                    var keycode = (event.keyCode ? event.keyCode : event.which);
                    var v = $(this).val(), c, tr, body, ai, nextStr, td;
                    if (keycode == 9) {
                        s.closeEditInline($(this), v);
                        v = $(this).val();
                        c = $(this).attr('attr');
                        td = $(this).closest('td');
                        ai = parseInt(td.attr('i'));
                        tr = $(this).closest('tr');
                        var tds = tr.find('td.edit-inline');
                        nextStr = null;
                        $(tds).each(function () {
                            var tai = parseInt($(this).attr('i'));
                            if (tai > ai) {
                                nextStr = $(this);
                                return false;
                            }
                        });
                        if (nextStr == null) {
                            nextStr = tds.first();
                        }
                        if (nextStr.length > 0) {
                            nextStr.addClass('editing');
                            nextStr.find('input').focus().select();
                        }
                        return false;
                    }
                });

                input.keyup(function (e) {
                    var keycode = (event.keyCode ? event.keyCode : event.which);
                    var v = $(this).val(), c, tr, body, ai, nextStr, td;
                    if (keycode >= 65 && keycode <= 90) {

                    }
                    else {
                        switch (keycode) {
                            case 13:
                            case 40:  // xuống
                                {
                                    s.closeEditInline($(this), v);
                                    c = $(this).closest('td').attr('i');
                                    tr = $(this).closest('tr');
                                    body = tr.closest('body');
                                    ai = parseInt(tr.attr('ai'));
                                    nextStr = body.find('tr[ai="' + (ai + 1) + '"]');
                                    if (nextStr.length == 0) {
                                        nextStr = body.find('tr[ai="1"]');
                                    }
                                    if (nextStr.length > 0) {
                                        td = nextStr.find('td[i="' + c + '"]');
                                        if (td.length > 0) {
                                            td.addClass('editing');
                                            td.find('input').focus().select();
                                        }
                                    }
                                }
                                break;

                            case 39: // phải 
                                {
                                    s.closeEditInline($(this), v);
                                    c = $(this).attr('attr');
                                    td = $(this).closest('td');
                                    ai = parseInt(td.attr('i'));
                                    tr = $(this).closest('tr');
                                    var tds = tr.find('td.edit-inline');
                                    nextStr = null;
                                    $(tds).each(function () {
                                        var tai = parseInt($(this).attr('i'));
                                        if (tai > ai) {
                                            nextStr = $(this);
                                            return false;
                                        }
                                    });
                                    if (nextStr == null) {
                                        nextStr = tds.first();
                                    }
                                    if (nextStr.length > 0) {
                                        nextStr.addClass('editing');
                                        nextStr.find('input').focus().select();
                                    }
                                }
                                break;
                            case 37: // trái
                                {
                                    s.closeEditInline($(this), v);
                                    c = $(this).attr('attr');
                                    td = $(this).closest('td');
                                    ai = parseInt(td.attr('i'));
                                    tr = $(this).closest('tr');
                                    var tds = tr.find('td.edit-inline');
                                    nextStr = null;
                                    $(tds).each(function () {
                                        var tai = parseInt($(this).attr('i'));
                                        if (tai < ai) {
                                            nextStr = $(this);
                                        }
                                    });
                                    if (nextStr == null) {
                                        nextStr = tds.last();
                                    }
                                    if (nextStr.length > 0) {
                                        nextStr.addClass('editing');
                                        nextStr.find('input').focus().select();
                                    }
                                }
                                break;
                            case 38: // lên
                                {
                                    s.closeEditInline($(this), v);
                                    c = $(this).closest('td').attr('i');
                                    tr = $(this).closest('tr');
                                    body = tr.closest('body');
                                    ai = parseInt(tr.attr('ai'));
                                    nextStr = body.find('tr[ai="' + (ai - 1) + '"]');

                                    if (nextStr.length == 0) {
                                        nextStr = body.find('tr:not(.tr-total)').last();
                                    }
                                    if (nextStr.length > 0) {
                                        td = nextStr.find('td[i="' + c + '"]');
                                        if (td.length > 0) {
                                            td.addClass('editing');
                                            td.find('input').focus().select();
                                        }
                                    }
                                }
                                break;
                        }
                    }
                });


                //var rtd = mc.find(".area-br tr td");
                //rtd.unbind();

                //rtd.click(function (e) {
                //    if (e.target != this) return;
                //    s.selectRow($(this).closest('tr'));
                //});
            }

            $('[data-toggle="tooltip"]').tooltip();
        };

        s.expandChild = function (btn, tr, mc) {
            var gid = parseInt(tr.attr('groupid'));
            var i = btn.find('i');
            var trs = mc.find('tr[groupid="' + gid + '"]:not(.tr-group)');

            mc.find('tbody tr.tr-real').remove();

            if (tr.hasClass('expanded')) {
                trs.remove();
                $(s.viewData).each(function () {
                    if (this.count > 0) {
                        this.active = true;
                        if (this.gid == gid) {
                            if (this.count > 0) {
                                for (var j = 0; j < this.count; j++) {
                                    this.left[j].active = false;
                                }
                            }
                        }
                    }
                });
                tr.removeClass('expanded');
                i.removeClass('icon-arrow-down5').addClass('icon-arrow-right5');
            } else {
                $(s.viewData).each(function () {
                    if (this.count > 0) {
                        this.active = true;
                        if (this.gid == gid) {
                            if (this.count > 0) {
                                for (var j = 0; j < this.count; j++) {
                                    this.left[j].active = true;
                                }
                            }
                        }
                    }

                });

                tr.addClass('expanded');
                i.removeClass('icon-arrow-right5').addClass('icon-arrow-down5');
            }

            s.setRowPositions();
            s.showBackground();
            s.showData(0);
        }

        s.updateRowValue = function (tr) {
            var id = parseInt(tr.attr('dataid'));
            var data = s.getDataById(id);
            var rowIndex = -1, i;
            for (i = 0; i < s.sourceData.length; i++) {
                if (s.sourceData[i].Id == id) {
                    rowIndex = i;
                    break;
                }
            }

            for (i = 0; i < set.rows.length; i++) {
                var cell = set.rows[i];
                if (cell.formula != null) {
                    var v = cell.formula(data);
                    var td = tr.find('td[data-attr="' + cell.attribute + '"]');
                    td.find('span').text(v);
                    td.find('input').val(v);
                    //s.sourceData[rowIndex][cell.attribute] = v;
                    data[cell.attribute] = parseFloat(v);
                }
            }
            s.sourceData[rowIndex] = data;
            return data;
        }

        s.saveAfterChangeComment = function (td, n) {

            if (n == 1) {
                td.addClass('has-comment');
                td.find('.comment-group').removeClass('loaded');
                td.find('.comment-content').html(app.loading());
            } else {
                td.removeClass('has-comment');
            }
            var tr = td.closest('tr');
            var id = tr.attr('dataid');
            var date = moment([
                parseInt(td.attr('data-y')), parseInt(td.attr('data-m')) - 1, parseInt(td.attr('data-dm'))
            ]).format('DD-MM-YYYY');

            $(s.sourceData).each(function () {
                if (this.Id == id) {
                    var r = this, c;
                    if (td.hasClass('cell-date')) {
                        var arr = [];
                        if (r.Detail != null) {
                            arr = $.parseJSON(r.Detail);
                            var hastd = false;
                            $(arr).each(function () {
                                if (this.D == date) {
                                    this.N = n;
                                    hastd = true;
                                }
                            });
                            if (!hastd) {
                                c = {
                                    D: date,
                                    N: n
                                };
                                arr.push(c);
                            }
                        } else {
                            c = {
                                D: date,
                                N: n
                            };
                            arr.push(c);
                        }
                        this.Detail = JSON.stringify(arr);
                    } else {
                        this.N = n;
                    }
                }
            });

            var url = set.editController != null ? set.editController + '/' : '/admin/';
            url += set.model + "EditDate";

            var data = s.updateRowValue(tr);


            $(s.editLoader).show();
            app.postData(url,
                data,
                function (result) {
                    $(s.editLoader).hide();
                });

        }

        s.closeEditInline = function (inp, v, t) {
            var tr = inp.closest('tr');
            var id = tr.attr('dataid');
            var td = inp.closest('td');
            var attr = td.attr('data-attr');
            var rattr = td.attr('data-root-attr');
            var date = moment([
                parseInt(td.attr('data-y')), parseInt(td.attr('data-m')) - 1, parseInt(td.attr('data-dm'))
            ]).format('DD-MM-YYYY');

            var ishl = 0;
            var hl = td.attr('hl');
            $(s.sourceData).each(function () {
                if (this.Id == id) {
                    var r = this, c;
                    if (td.hasClass('cell-date')) {
                        var arr = [];
                        if (r.Detail != null) {
                            arr = $.parseJSON(r.Detail);
                            var hastd = false;
                            $(arr).each(function () {
                                if (this.D == date) {
                                    this[attr] = v;
                                    hastd = true;

                                    if (hl == '1') {
                                        if (this[attr] != this[rattr]) {
                                            if (set.symbols.ks.indexOf(this[attr]) >= 0 || this[attr] == '') {
                                                ishl = 1;
                                            } else {
                                                ishl = 2;
                                            }
                                        }
                                    }
                                }
                            });
                            if (!hastd) {
                                c = {
                                    D: date
                                };
                                c[attr] = v;
                                arr.push(c);
                            }
                        } else {
                            c = {
                                D: date
                            };
                            c[attr] = v;
                            arr.push(c);
                        }
                        this.Detail = JSON.stringify(arr);
                    } else {
                        this[attr] = v;
                    }
                }
            });

            var data = s.updateRowValue(tr);
            var url = set.editController != null ? set.editController + '/' : '/admin/';
            url += set.model + "EditDate";

            if (set.beforeSaveDetail != null) {
                data = set.beforeSaveDetail(data);
            }

            $(s.editLoader).show();
            app.postData(url, data,
                function (result) {
                    $(s.editLoader).hide();
                });

            td = inp.closest('td');
            if (t == 'price') {
                v = v.replace(/,/g, '');
                v = app.formatPrice(v);
            }
            td.find('> span').text(v);
            td.removeClass('editing');

            switch (ishl) {
                case 0:
                    {
                        td.removeClass('highlight').removeClass('error');
                    }
                    break;
                case 1:
                    {
                        td.addClass('highlight').removeClass('error');
                    }
                    break;
                case 2:
                    {
                        td.addClass('error').removeClass('highlight');
                        app.notify('warning', 'Ký hiệu chấm công chưa đúng !');
                    }
                    break;
            }
        }

        s.displayChilds = function (pid, display, bl) {
            var trs = bl
                ? $(sel).find('> .calendar-table > .main-content .area-bl tr')
                : $(sel).find('> .calendar-table > .main-content .area-br tr');
            trs.each(function () {
                var p = $(this).attr('parent');
                if (p == pid) {
                    $(this).css('display', display);
                    s.displayChilds($(this).attr('dataid'), display, bl);
                }
            });
        }

        s.reloadChilds = function (parentTr) {
            var id = parentTr.attr('dataid');
            // delete exists childs
            $(parentTr).closest('tbody').find('tr[parent="' + id + '"]').each(function () {
                $(this).remove();
            });
            for (var i = 0; i < s.sourceData.length; i++) {
                if (s.sourceData[i].ParentId == id) {
                    s.sourceData.splice(i, 1);
                    i--;
                }
            }
            var arrow = parentTr.find('.expand-child');
            var isExpand = arrow.hasClass('expand');
            var i = arrow.find('i');
            var ai = parentTr.attr('ai');
            if (!isExpand) {
                arrow.addClass('expand');
            }
            i.removeClass('icon-arrow-right13');
            i.addClass('icon-spinner10 spinner');
            var level = arrow.attr('level');
            var url = set.dataUrl != null ? set.dataUrl : '/api/' + set.model + "List";
            loadData(url,
                {
                    parentId: id
                },
                null,
                function (result) {
                    var list = result.Many;
                    i.removeClass('icon-spinner10 spinner').addClass('icon-arrow-down12');
                    if (list != null && list.length > 0 && set.rows.length > 0) {

                        var idAttr = "Id";
                        if (set.idAttribute != null) {
                            idAttr = set.idAttribute;
                        }
                        s.sumarray = [];

                        var blInsertIndex = $(sel).find('.area-bl tbody tr[dataid="' + id + '"]');
                        var brInsertIndex = $(sel).find('.area-br tbody tr[dataid="' + id + '"]');
                        $.each(list,
                            function (k, item) {
                                var r = s.drawRow(item, idAttr, parseInt(level) + 1, ai + '.' + (k + 1), true);
                                $(r).insertAfter(blInsertIndex);
                                blInsertIndex = $(blInsertIndex).next();

                                r = s.drawRow(item, idAttr, parseInt(level) + 1, ai + '.' + (k + 1), false);
                                $(r).insertAfter(brInsertIndex);
                                brInsertIndex = $(brInsertIndex).next();
                            });

                        s.setRowEvents(id);

                        i.removeClass('hide');
                        s.sourceData = $.merge(list, s.sourceData);
                    } else {
                        i.addClass('hide');
                    }
                    arrow.addClass('loaded');
                });
        };

        s.selectContentTab = function (index, tabId) {
            var sc = browser == 'Web' ? $(sel).find('> .calendar-table > .sub-content') : $('#sub_content_modal');
            var tab = set.subContent.tabs[index];
            if (tabId == null) {
                tabId = sc.find('.tab-content > div').eq(index).attr("id");
            }
            var tc = $(tabId);

            var id = s.getSelectedIds()[0];
            if (id != null) {
                if (!tc.hasClass("loaded")) {
                    sc.find('.tab-content > .loading').css('display', 'block');
                    var data = {
                        dataType: 'html',
                        id: id
                    };
                    if ($.isFunction(tab.data)) {
                        var t = tab.data(s.getDataById(id));
                        $.extend(data, t);
                    } else {
                        $.extend(data, tab.data);
                    }

                    app.loadData(tab.url,
                        data,
                        null,
                        function (html) {
                            tc.addClass("loaded");
                            sc.find('.tab-content > .loading').css('display', 'none');
                            tc.html(html);
                            if (tab.loadCallback != null) {
                                tab.table = tab.loadCallback(id, tabId, s.getDataById(id));
                            }
                        });
                }
            }
        }
        s.bulkDelete = function (callback) {
            var ids = s.getSelectedIds();
            if (ids.length > 0) {
                s.deleteObjects("bulk", ids, callback);
            } else {
                app.confirm('info', 'Vui lòng chọn đối tượng cần xóa', null, null);
            }
        }
        s.deleteObjects = function (type, ids, callback) {
            app.confirm("warning",
                null,
                ids.length + ' đối tượng được chọn để xóa.',
                function () {
                    var url = set.editController != null ? set.editController : '/admin';
                    if (type == "bulk") {
                        app.postData(url + "/delete" + set.model + 'ByIds',
                            {
                                ids: ids
                            },
                            function () {
                                if (callback != null) {
                                    callback();
                                }
                            });
                    } else {

                        $.ajax({
                            url: url + "/delete" + set.model,
                            type: "POST",
                            data: {
                                model: set.model,
                                id: ids[0]
                            },
                            success: function () {
                                if (typeof webaby !== "undefined") {
                                    webaby.hideModalLoading();
                                }
                                $("#deleteModal").modal("hide");
                                if (callback != null) {
                                    callback();
                                }
                            }
                        });
                    }
                    $(sel).find(".checkAll").prop("checked", false);
                    $.uniform.update();
                });
        };
        s.setSubData = function (id) {

        };
        s.selectRow = function (tr, isReload) {
            var id = tr.attr('dataid');
            if (!tr.hasClass('active')) {
                $(sel).find('.area-bl tr.active').removeClass('active');
                $(sel).find('.area-bl tr[dataid="' + id + '"]').addClass('active');
                $(sel).find('.area-br tr.active').removeClass('active');
                $(sel).find('.area-br tr[dataid="' + id + '"]').addClass('active');
                $(sel).find('.area-bom tr.active').removeClass('active');
                $(sel).find('.area-bom tr[dataid="' + id + '"]').addClass('active');
                if (set.subContent != null) {
                    s.setSubData(id);
                }

                if (set.selectRowCallback != null) {
                    set.selectRowCallback(tr);
                }

            } else {
                $(sel).find('.area-bl tr[dataid="' + id + '"]').removeClass('active');
                $(sel).find('.area-br tr[dataid="' + id + '"]').removeClass('active');
                $(sel).find('.area-bom tr[dataid="' + id + '"]').removeClass('active');
            }
            if (set.subContent != null) {
                if (browser == 'Web') {
                    var sc = $(sel).find('> .calendar-table > .sub-content');
                    if (sc.attr('aid') != id || isReload) {
                        var li = sc.find('.tabs-group li[class="active"]');
                        if (li.length == 0) {
                            li = sc.find('.tabs-group li:eq(0)');
                            li.find('a').tab('show');
                        } else {
                            var tabIndex = li.index();
                            if (tabIndex < 0) {
                                tabIndex = 0;
                            }
                            sc.find('.tab-content .tab-pane').html('').removeClass('loaded');
                            sc.attr('aid', id);
                            s.selectContentTab(tabIndex, li.find(' > a').attr('href'));
                        }
                    }
                } else {
                    var scm = $('#sub_content_modal');
                    scm.modal('show');
                    var li = scm.find('.tabs-group li[class="active"]');
                    if (li.length == 0) {
                        li = scm.find('.tabs-group li:eq(0)');
                        li.find('a').tab('show');
                    } else {
                        var tabIndex = li.index();
                        if (tabIndex < 0) {
                            tabIndex = 0;
                        }
                        scm.find('.tab-content .tab-pane').html('').removeClass('loaded');
                        scm.attr('aid', id);
                        s.selectContentTab(tabIndex, li.find(' > a').attr('href'));
                    }
                }
            }
        };
        s.resize = function () {
            var fh = null;
            var fw = null;
            if (app.hasValue(set.height.fix)) {
                fh = set.height.fix;
            }
            if (app.hasValue(set.width.fix)) {
                fw = set.width.fix;
            }
            if (fh == null) {
                var wh = $(window).height();
                var th = wh - set.height.top;
                var at = $(sel).find('> .calendar-table');
                at.css('height', th + 15);
                if (set.subContent != null && browser == 'Web') {
                    if (at.hasClass('expand')) {
                        s.setMainTableHeight(th - 35);
                    } else {
                        s.setMainTableHeight(parseInt(th / 2));
                    }
                    s.setSubContentHeight(parseInt(th / 2));
                } else {
                    s.setMainTableHeight(th - 35);
                }
            } else {
                var hh = set.head.height != null ? set.head.height : 39;
                if (set.filterable) {
                    hh += 36;
                }
                if (set.footer == false) {
                    fh += 50;
                }
                var ran = 15;
                $(sel).find('.main-content').css('height', fh + 35);
                $(sel).find('.areas').css('height', fh - ran);
                $(sel).find('.area-bl').css('height', fh - hh - 16 - ran);
                $(sel).find('.area-bl > div').css('height', fh - hh - 16 - ran);
                $(sel).find('.area-br').css('height', fh - hh + 1 - ran);
                $(sel).find('.area-br > div').css('height', fh - hh + 1 - ran);
            }

            if (fw == null) {
                s.setMainTableWidth();
            }
        };

        s.setMainTableWidth = function () {
            var tr = $(sel).find('> .calendar-table > .main-content .area-tr');
            var br = $(sel).find('> .calendar-table > .main-content .area-br');

            var maxW = tr.find('> div').width();
            var tw = parseInt(tr.find('table').attr('data-w'));
            var trl = tr.find('table > colgroup col').last();
            var brl = br.find('table > colgroup col').last();
            if (maxW >= tw) {
                var nw = maxW - tw - 19;
                trl.css('width', nw);
                brl.css('width', nw);
            } else {
                trl.css('width', 0);
                brl.css('width', 0);
            }
        };

        s.setMainTableHeight = function (ah) {
            var hh = set.head.height != null ? set.head.height : 54;
            if (set.filterable) {
                hh += 37;
            }
            if (set.cols.colSub != null) {
                hh += 40;
            }
            if (set.footer == false) {
                ah += 50;
            }
            var mc = $(sel).find('> .calendar-table > .main-content');
            mc.css('height', ah + 35);
            mc.find('> .areas').css('height', ah);
            mc.find('> .areas .area-bl').css('height', ah - hh - 18);
            mc.find('> .areas .area-bl > div').css('height', ah - hh - 18);
            mc.find('> .areas .area-br').css('height', ah - hh - 1);
            mc.find('> .areas .area-br > div').css('height', ah - hh - 1);

        }

        s.setSubContentHeight = function (h) {
            var tc = $(sel).find('.sub-content .tab-content');
            tc.css('height', h - 70);
        }


        s.initTable = function () {
            var skip = set.skipCols;
            var h = $(window).height();
            var cgl = '',
                cgr = '',
                wl = 0,
                wr = 0, wdr = set.head.dateWidth;

            //if (set.cols.colSub != null) {
            //    if (set.cols.colSub.length > 1) {
            //        wdr = 35;
            //    }
            //}

            var dindex = 0;

            var r, col, j, th, k;
            var tb = $('<div class="calendar-table ' + (set.border ? 'bordered' : '') + '"></div>');
            if (app.hasValue(set.height.fix)) {
                tb.css('height', set.height.fix);
            } else {
                tb.css('height', h - set.height.top);
            }

            tb.append('<div class="main-content"><div class="areas ' + (skip > 0 ? 'has-left' : '') + '"><span class="empty-message" style="display: none">Không tìm thấy dữ liệu phù hợp</span></div></div>');
            $(sel).append(tb);

            var hh = set.head.height != null ? set.head.height : 54;

            if (set.filterable) {
                hh += 37;
            }
            if (set.cols.colSub != null) {
                hh += 40;
            }
            // area top left
            var area = $('<div class="area area-tl" style="height: ' + hh + 'px"><div></div></div>');
            if (skip > 0) {
                tb = $('<table class="table table-bordered"></table>');
                cgl = $('<colgroup></colgroup>');
                wl = 0;
                if (set.checkAll == null || set.checkAll) {
                    cgl.append('<col style="width: 40px">');
                    wl += 40;
                    skip--;
                }
                for (var k = 0; k < skip; k++) {
                    cgl.append('<col style="width: ' + set.head.groups[k] + 'px">');
                    wl += set.head.groups[k];
                }
                tb.css('width', wl).append(cgl.html());
                th = '<thead>';
                skip = set.skipCols;
                cs = set.cols.left;
                for (var i = 0; i < cs.length; i++) {
                    var r = cs[i];
                    th += '<tr>';

                    if (i == 0 && (set.checkAll == null || set.checkAll)) {
                        th += '<th rowspan="' +
                            cs.length +
                            '" style="height: 31px">' +
                            '<div class="checkbox">' +
                            '<input type="checkbox" class="styled checkAll" /><label></label></div></th>';
                        skip--;
                    }
                    for (j = 0; j < r.length; j++) {
                        col = r[j];
                        if (col.visible == null || col.visible()) {

                            th += '<th ';
                            if (col.rowspan != null) {
                                th += ' rowspan="' + col.rowspan + '" ';
                            }
                            if (col.colspan != null) {
                                th += ' colspan="' + col.colspan + '" ';
                            }
                            th += ' style="';
                            if (col.style != null) {
                                th += col.style + '; ';
                            }
                            th += '"';
                            cls = '';
                            if (col.class != null) {
                                cls += col.class;
                            }
                            if (col.sort != null) {
                                th += 'class="' + cls + ' orderable" orderby="' + col.sort + '" currentOrder="desc">';
                            } else {
                                th += 'class="' + cls + '" >';
                            }
                            if (col.render != null) {
                                th += col.render();
                            } else {
                                th += (col.title != null ? col.title : "&nbsp;");
                            }

                            th += (col.sort != null ? '<i style="margin-left:5px;" class="fa fa-caret-down"></i>' : "") +
                                "</th>";
                        }
                    }
                    th += '</tr>';
                }
                th += '</thead>';

                tb.append(th);

                var bd = '<tbody>';

                //if (set.filterable) {
                //    var f = s.rowFilter(true);
                //    bd += f;
                //}

                //if (set.cols.colSub != null) {
                //    bd += '<tr class="tr-filter"><td style="height: 40px;">&nbsp;</td></tr>';
                //}

                bd += '</tbody>';
                tb.append(bd);
                area.css('width', wl + 1).find('> div').append(tb);
            }
            $(sel).find('.areas').append(area);

            // area bottom left
            var ww = $(window).width();
            area = $('<div class="area area-bl" style="width:' + (wl + (ww > 375 ? 31 : 1)) + 'px"></div>');
            area.append('<div><table class="table table-bordered table-hover" style="width:' + wl + 'px"></table></div>');
            area.find('table').append(cgl);

            var tbody = '<tbody>';
            var gai;
            if (set.group != null) {
                gai = 0;
                $(set.group.data).each(function () {
                    gai++;
                    tbody += '<tr class="tr-group expanded" gai="' + gai + '" groupid="' + this.id + '" ><td colspan="' + skip + '">';
                    tbody += '<div><button class="btn btn-icon btn-xs btn-expander"><i class="icon-arrow-down5"></i></button>';
                    if (set.group.render != null) {
                        tbody += set.group.render(this);
                    } else {
                        tbody += this.text;
                    }
                    tbody += '</div></td></tr>';

                    var v = {
                        gid: this.id,
                        left: [],
                        right: [],
                        count: this.totalChild != null ? this.totalChild : 0,
                        loaded: false,
                        groupChilds: []
                    };

                    s.viewData.push(v);

                });
            }

            tbody += '</tbody>';
            area.find('table').append(tbody);
            $(sel).find('.areas').append(area);

            var hasOm = set.optionMenu != null && browser == 'Wap';

            var d1 = moment(set.cols.date[0], 'MM-DD-YYYY');
            var d2 = moment(set.cols.date[1], 'MM-DD-YYYY');
            var d = moment(set.cols.date[0], 'MM-DD-YYYY');
            var x, c, n, t, i;
            var diffMonth = d2.diff(d1, 'months');
            var diffDay = d2.diff(d1, 'days');

            if (diffMonth == 0 && d2.month() != d1.month()) {
                if (d2.year() == d1.year()) {
                    diffMonth = d2.month() - d1.month();
                } else {
                    diffMonth = 12 - d1.month() + d2.month();
                }
            }

            if (diffMonth == 0) {
                var m = {
                    m: d1.month() + 1,
                    y: d1.year(),
                    days: []
                };

                while (d1 <= d2) {
                    x = d1.date();
                    m.days.push(x);
                    d1.add(1, 'days');
                }
                s.months.push(m);
            }
            else {
                for (var l = 0; l <= diffMonth; l++) {
                    var m;
                    if (l == 0) {
                        m = {
                            m: d1.month() + 1,
                            y: d1.year(),
                            days: []
                        };
                        c = d1.daysInMonth();
                        for (n = d1.date(); n <= c; n++) {
                            m.days.push({
                                dm: n,
                                dw: moment(m.m + '-' + n + '-' + m.y, 'MM-DD-YYYY').day()
                            });
                        }
                        s.months.push(m);
                    } else if (l == diffMonth) {
                        m = {
                            m: d2.month() + 1,
                            y: d2.year(),
                            days: []
                        };
                        c = d2.daysInMonth();
                        for (n = 1; n <= d2.date(); n++) {
                            m.days.push({
                                dm: n,
                                dw: moment(m.m + '-' + n + '-' + m.y, 'MM-DD-YYYY').day()
                            });
                        }
                        s.months.push(m);
                    } else {
                        var d = d1.add(1, 'month');
                        m = {
                            m: d.month() + 1,
                            y: d.year(),
                            days: []
                        };
                        c = d.daysInMonth();
                        for (n = 1; n <= c; n++) {
                            m.days.push({
                                dm: n,
                                dw: moment(m.m + '-' + n + '-' + m.y, 'MM-DD-YYYY').day()
                            });
                        }
                        s.months.push(m);
                    }
                }
            }

            // area top right
            skip = set.skipCols;
            area = $('<div class="area area-tr" style="left: ' +
                (wl + 1) + 'px; height: ' + hh + 'px; ' +
                (hasOm ? 'right: 35px;' : '') +
                '"><div></div></div>');
            tb = $('<table class="table table-bordered"></table>');
            cgr = '<colgroup>';
            wr = 0;

            if (set.checkAll == null || set.checkAll) {
                if (skip == 0) {
                    cgr += '<col style="width: 40px">';
                    wr += 40;
                } else {
                    skip--;
                }
            }

            dindex = 0;
            for (k = 0; k <= diffDay; k++) {
                if (set.cols.colSub != null) {
                    for (var q = 0; q < set.cols.colSub.length; q++) {
                        cgr += '<col i="' + dindex + '" style="width: ' + wdr + 'px">';
                        wr += wdr;
                        dindex++;
                    }
                } else {
                    cgr += '<col i="' + dindex + '" style="width: ' + wdr + 'px">';
                    wr += wdr;
                    dindex++;
                }
            }
            for (k = skip; k < set.head.groups.length; k++) {
                cgr += '<col i="' + dindex + '" style="width: ' + set.head.groups[k] + 'px">';
                wr += set.head.groups[k];
                dindex++;
            }
            //wr += 19;
            cgr += '<col>';

            cgr += '</colgroup>';

            tb.attr('data-w', wr).css('width', +wr + 'px').append(cgr);
            th = '<thead>';
            th += '<tr>';
            skip = set.skipCols;

            for (i = 0; i < s.months.length; i++) {
                c = s.months[i];
                var span = c.days.length;
                if (set.cols.colSub != null) {
                    span = span * set.cols.colSub.length;
                }
                th += '<th class="calendar-month" ' + ' colspan="' + span + '" > <label>Tháng</label> ' + c.m + '/' + c.y + '</th>';
            }
            var cs = set.cols.right;
            var rsp = set.cols.colSub != null ? 3 : 2;
            for (i = 0; i < cs.length; i++) {
                col = cs[i];
                if (col.visible == null || col.visible()) {

                    th += '<th  rowspan="' + rsp + '" ';
                    if (col.colspan != null) {
                        th += ' colspan="' + col.colspan + '" ';
                    }
                    th += ' style="';
                    if (col.style != null) {
                        th += col.style + '; ';
                    }
                    th += '"';
                    var cls = '';
                    if (col.class != null) {
                        cls += col.class;
                    }
                    if (col.color != null) {
                        cls += ' hc-' + col.color + ' ';
                    }
                    if (col.sort != null) {
                        th += 'class="' + cls + ' orderable" orderby="' + col.sort + '" currentOrder="desc">';
                    } else {
                        th += 'class="' + cls + '" >';
                    }
                    var is = j + skip;

                    if (col.render != null) {
                        th += col.render();
                    } else {
                        th += (col.title != null ? col.title : "&nbsp;");
                    }

                    th += (col.sort != null ? '<i style="margin-left:5px;" class="fa fa-caret-down"></i>' : "") +
                        '<span class="th-scroll" i="' +
                        is +
                        '"></span></th>';
                }
            }

            th += '</tr><tr>';
            dindex = 0;
            for (i = 0; i < s.months.length; i++) {
                c = s.months[i];

                for (var o = 0; o < c.days.length; o++) {
                    th += '<th class="calendar-day" i="' + dindex + '" ' + (set.cols.colSub != null ? 'colspan="' + set.cols.colSub.length + '"' : '') + '> ' +
                        '<span class="day day-of-month day-' + c.days[o].dw + '" >' + c.days[o].dm + '</span>' +
                        '<span class="day day-of-week day-' + c.days[o].dw + '">' + daysOfWeek[c.days[o].dw] + '</span>' +
                        '</th>';
                    dindex++;
                }
            }

            th += '</tr>';

            if (set.cols.colSub != null) {
                th += '<tr class="tr-col-sub">';
                dindex = 0;
                for (i = 0; i < s.months.length; i++) {
                    c = s.months[i];
                    for (var o = 0; o < c.days.length; o++) {
                        for (var p = 0; p < set.cols.colSub.length; p++) {
                            x = set.cols.colSub[p];
                            th += '<th class="calendar-day" data-code="' + x.code + '" data-day="' + c.days[o].dw + '" class="calendar-sub " i="' + dindex + '" > ' +
                                '<span class="sub text-bold text-center day  day-' + c.days[o].dw + '" >' + x.text + '</span>' +
                                '</th>';
                            dindex++;
                        }

                    }
                }
                th += '</tr>';
            }

            s.colRight = dindex + set.cols.right.length;

            th += '</thead>';

            tb.append(th);

            area.find('> div').append(tb);
            $(sel).find('.areas').append(area);

            // area bottom right
            skip = set.skipCols;
            area = $('<div class="area area-br" style="left: ' +
                (wl + 1) +
                'px;' +
                (hasOm ? 'right: 35px;' : '') +
                '"><div></div></div>');
            tb = $('<table class="table table-bordered table-hover"></table>');

            tbody = '<tbody>';
            if (set.group != null) {
                gai = 0;
                $(set.group.data).each(function () {
                    gai++;
                    tbody += '<tr class="tr-group" gai="' + gai + '" groupid="' + this.id + '"><td colspan="' + s.colRight + '">&nbsp;</td></tr>';
                });
            }
            tbody += '</tbody>';

            tb.css('width', +wr + 'px').append(cgr).append(tbody);
            area.find('> div').append(tb);
            $(sel).find('.areas').append(area);

            if (set.optionMenu != null && browser == 'Wap') {
                area = $('<div class="area area-tom" style="right: 0; height: ' + hh + 'px"><div></div></div>');
                tb = $(
                    '<table class="table"><colgroup><col style="width: 40px" /></colgroup><thead><th style="height: 30px">&nbsp;</th></thead></table>');
                if (set.filterable) {
                    tb.append('<tbody><tr class="tr-filter"><td></td> </tr></tbody>');
                }
                area.find('> div').append(tb);
                $(sel).find('.areas').append(area);

                area = $('<div class="area area-bom" style="right: 0; top: 63px"><div></div></div>');
                tb = $('<table class="table table-bordered"><tbody></tbody></table>');
                area.find('> div').append(tb);
                $(sel).find('.areas').append(area);
            }

            $(sel).find('.areas').append('<span class="buffer-bl" style="width: ' + wl + 'px"></span>');

            if (set.footer != false) {
                var footer = $('<div class="area-footer"></div');
                footer.append('<span class="heading-text total-row"><span class="text-bold">0</span> kết quả</span>');
                var ff = $('<div class="icons-list pull-right"></div>');
                ff.append('<li class="btn-group dropup " style="float:left; margin-right: 10px">' +
                    '<span class="">Hiển thị<button type="button" class="dropdown-toggle btn btn-xs btn-default position-right" data-toggle="dropdown" aria-expanded="false">' +
                    '<span>20 kết quả</span> <label class="caret"></label></button>' +
                    '<ul class="dropdown-menu dropdown-menu-right">' +
                    '<li><a href="#" class="btn-change-limit" data="10">10 kết quả</a></li>' +
                    '<li><a href="#" class="btn-change-limit" data="20">20 kết quả</a></li>' +
                    '<li><a href="#" class="btn-change-limit" data="50">50 kết quả</a></li>' +
                    '<li><a href="#" class="btn-change-limit" data="">Tất cả</a></li>' +
                    '</ul>' +
                    '</li>');
                ff.append('<li><ul class="pagination pagination-flat pagination-xs"></ul></li>');
                footer.append(ff);
                $(sel).find('.main-content').append(footer);
            }

            //s.resize();

            s.setStaticEvents();

            if (set.autoLoad != false) {
                s.loadData();
            }
        };

        s.initTable();
        return this;
    };
}(jQuery));