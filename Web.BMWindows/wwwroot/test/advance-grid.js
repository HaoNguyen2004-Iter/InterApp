
(function (e) {
    function t() {
        var e = document.createElement("p");
        var t = false;
        if (e.addEventListener) e.addEventListener("DOMAttrModified", function () { t = true }, false);
        else if (e.attachEvent) e.attachEvent("onDOMAttrModified", function () { t = true });
        else return false;
        e.setAttribute("id", "target");
        return t;
    }

    function n(t, n) {
        if (t) {
            var r = this.data("attr-old-value");
            if (n.attributeName.indexOf("style") >= 0) {
                if (!r["style"]) r["style"] = {};
                var i = n.attributeName.split(".");
                n.attributeName = i[0];
                n.oldValue = r["style"][i[1]];
                n.newValue = i[1] + ":" + this.prop("style")[e.camelCase(i[1])];
                r["style"][i[1]] = n.newValue;
            } else {
                n.oldValue = r[n.attributeName];
                n.newValue = this.attr(n.attributeName);
                r[n.attributeName] = n.newValue;
            }
            this.data("attr-old-value", r);
        }
    }
    var r = window.MutationObserver || window.WebKitMutationObserver;
    e.fn.attrchange = function (i) {
        var s = { trackValues: false, callback: e.noop };
        if (typeof i === "function") {
            s.callback = i;
        } else {
            e.extend(s, i);
        }
        if (s.trackValues) {
            e(this).each(function (t, n) {
                var r = {};
                for (var i, t = 0, s = n.attributes, o = s.length; t < o; t++) {
                    i = s.item(t);
                    r[i.nodeName] = i.value;
                }
                e(this).data("attr-old-value", r);
            });
        }
        if (r) {
            var o = { subtree: false, attributes: true, attributeOldValue: s.trackValues };
            var u = new r(function (t) {
                t.forEach(function (t) {
                    var n = t.target;
                    if (s.trackValues) {
                        t.newValue = e(n).attr(t.attributeName);
                    }
                    s.callback.call(n, t);
                });
            });
            return this.each(function () { u.observe(this, o) });
        } else if (t()) {
            return this.on("DOMAttrModified",
                function (e) {
                    if (e.originalEvent) e = e.originalEvent;
                    e.attributeName = e.attrName;
                    e.oldValue = e.prevValue;
                    s.callback.call(this, e);
                });
        } else if ("onpropertychange" in document.body) {
            return this.on("propertychange",
                function (t) {
                    t.attributeName = window.event.propertyName;
                    n.call(e(this), s.trackValues, t);
                    s.callback.call(this, t);
                });
        }
        return this;
    }

})(jQuery);

(function ($) {
    $.fn.setCursorPosition = function (pos) {
        this.each(function (index, elem) {
            if (elem.setSelectionRange) {
                elem.setSelectionRange(pos, pos);
            } else if (elem.createTextRange) {
                var range = elem.createTextRange();
                range.collapse(true);
                range.moveEnd('character', pos);
                range.moveStart('character', pos);
                range.select();
            }
        });
        return this;
    };

    $.fn.advanceGrid = function (options) {
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
        s.count = 0;
        s.count = 0;
        s.formId = '';
        s.sumarray = [];
        s.tounchTr = null;
        s.moveObjectId = null;
        s.clickSubContextMenu = false;
        s.activeParentId = null;
        // Establish our default settings
        var set = $.extend({
            data: null,
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
            multiLevel: true
        },
            options);
        s.set = set;

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
        s.drawExpandNode = function (level, totalChild) {
            var n = '<span class="expand-child position-left level-' + level + ' ' + (set.expandable ? 'expand loaded' : '') + '  " level="' + level + '" >';
            if (totalChild > 0) {
                if (set.expandable) {
                    n += '<i class="icon-arrow-down12"></i>';
                } else {
                    n += '<i class="icon-arrow-right13"></i>';
                }

            } else {
                n += '';
            }
            n += '</span>';
            return n;
        };
        s.drawRow = function (item, idAttr, level, stt, bl) {
            var skip = set.skipCols;
            var tr = '<tr ';

            if (set.contextMenu != null) {
                tr += ' data-toggle="context" data-target=".context-table-row" ';
            }

            tr += ' dataid="' +
                item[idAttr] +
                '" ai="' +
                stt +
                '" ';
            if (set.rowStyle != null) {
                tr += ' class="' + set.rowStyle(item) + '" ';
            }
            if (typeof item['Code'] != 'undefined') {
                tr += ' datacode="' + item['Code'] + '" ';
            }
            if (item.ParentId != null) {
                tr += ' parent="' + item.ParentId + '" ';
            }
            tr += '>';
            var start, end;

            if (bl) {
                if (skip == 0)
                    return '';
                if (skip > 0 && (set.checkAll == null || set.checkAll)) {
                    tr += s.drawCheckbox();
                    skip--;
                }
                start = 0;
                end = skip;
            } else {
                if (set.checkAll == null || set.checkAll) {
                    if (skip == 0) {
                        tr += s.drawCheckbox();
                    } else {
                        skip--;
                    }
                }
                start = skip;
                end = set.rows.length;
            }

            for (var i = start; i < end; i++) {
                var cell = set.rows[i];
                var v;
                if (app.hasValue(cell.visible)) {
                    v = cell.visible();
                } else {
                    v = true;
                }
                if (v) {
                    if (cell.model != null) {
                        model = cell.model;
                    }
                    var td = '<td attr="' + cell.attribute + '" ci="' + i + '"';
                    var cls = '';
                    if (cell.class != null) {
                        if ($.isFunction(cell.class)) {
                            var t = cell.class(item, cell.attribute);
                            cls += ' ' + t + ' ';
                        } else {
                            cls += ' ' + cell.class + ' ';
                        }
                    }
                    if (cell.editInline) {
                        cls += ' edit-inline ';
                    }
                    td += ' class="' + cls + '"';
                    td += ' style="';
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
                                        s.sumarray[i] += cell.sumValue(item, cell.attribute);
                                    }
                                } else {
                                    s.sumarray[i] = null;
                                }

                                td += '>';
                                if (cell.expandChild != null) {
                                    td += s.drawExpandNode(level, item.TotalChild);
                                }
                                var v = "";
                                if (cell.attribute != null) {
                                    if (item[cell.attribute] != null)
                                        v = item[cell.attribute];
                                }

                                if (cell.render != null) {
                                    td += '<span> ' + cell.render(item, cell.attribute) + '</span>';
                                } else {
                                    td += '<span ';
                                    if (cell.aline != null) {
                                        td += ' class="aline"';
                                    }
                                    td += '> ' + v + '</span>';
                                }

                                if (cell.editInline != null) {
                                    if (cell.editInline == true) {
                                        td += '<div class="form-group inline-form">' +
                                            '<input class="form-control" style="' + (cell.style != null ? cell.style : '') + '" data-type="text" ' +
                                            ' attr="' + cell.attribute + '" value="' + v + '" />' +
                                            '</div>';
                                    } else {
                                        var ei = cell.editInline;
                                        switch (ei.type) {
                                            case 'optionRemote': {
                                                td += '<div class="form-group inline-form">' +
                                                    '<input class="form-control inline-form-option-remote" rowindex="' + i + '" data-type="text" attr="' +
                                                    cell.attribute +
                                                    '" value="' +
                                                    v +
                                                    '" />' +
                                                    '</div>';
                                            } break;
                                        }
                                    }
                                }
                            };
                            break;
                        case "checkbox":
                            {
                                td += '>';
                                var v = item[cell.attribute];
                                td += '<div class="form-group">' +
                                    '<input class="" type="checkbox" attr="' +
                                    cell.attribute +
                                    '" value="true" ' +
                                    (v == true ? 'checked="checked"' : '') +
                                    ' />' +
                                    '</div>';
                                s.sumarray[i] = null;
                            };
                            break;
                        case "option":
                            {
                                td += ' style="width: 40px;">';
                                var option = '<ul class="icons-list">';
                                option += '<li class="dropdown">';
                                option +=
                                    '<a class="dropdown-toggle" href="#" data-toggle="dropdown" aria-expanded="false"><i class="icon-menu9" style="font-size: 16px;"></i></a>';
                                option += '<ul class="dropdown-menu dropdown-menu-right" style="width: 200px">';
                                for (var j = 0; j < cell.render.length; j++) {
                                    var opt = cell.render[j];
                                    if (opt != null) {
                                        if (opt.condition == null || opt.condition(item)) {
                                            option += '<li><a href="javascript:void(0)"';
                                            if (opt.class != null) {
                                                option += 'class="' + opt.class + '"';
                                            }
                                            option += '><i style="margin-right:5px" class="' +
                                                opt.icon +
                                                ' ' +
                                                opt.iconColor +
                                                '"></i>' +
                                                opt.text +
                                                '</a></li>';
                                        }
                                    }
                                }
                                option += '</li></ul>';

                                td += option + '</ul>';
                            };
                            break;
                        case "date":
                            {

                                td += '>';
                                if (cell.expandChild != null) {
                                    td += s.drawExpandNode(level);
                                }
                                td += app.formatDate(item[cell.attribute]);
                                s.sumarray[i] = null;
                            };
                            break;
                        case "time":
                            {

                                td += '>';
                                if (cell.expandChild != null) {
                                    td += s.drawExpandNode(level);
                                }
                                td += app.formatTime(item[cell.attribute]);
                                s.sumarray[i] = null;
                            };
                            break;
                        case "datetime":
                            {
                                td += '>';
                                if (cell.expandChild != null) {
                                    td += s.drawExpandNode(level);
                                }
                                td += app.formatDateTime(item[cell.attribute]);
                                s.sumarray[i] = null;
                            };
                            break;
                        case "html":
                            {

                                td += '>';
                                if (cell.expandChild != null) {
                                    td += s.drawExpandNode(level);
                                }
                                if (cell.render != null) {
                                    td += cell.render(item, cell.attribute).replace(/\n/g, '<br/>');
                                } else if (cell.attribute != null) {
                                    td += item[cell.attribute] != null ? item[cell.attribute] : "";
                                }
                                s.sumarray[i] = null;
                            };
                            break;
                        case "price":
                        case "number":
                            {
                                if (cell.sumable) {
                                    if (typeof s.sumarray[i] == "undefined") {
                                        s.sumarray[i] = 0;
                                    }
                                }
                                td += '>';
                                if (cell.expandChild != null) {
                                    td += s.drawExpandNode(level);
                                }
                                var val = 0;
                                if (cell.render != null) {
                                    val = cell.render(item, cell.attribute);
                                } else {
                                    val = item[cell.attribute];
                                }
                                s.sumarray[i] += val != null ? val : 0;
                                td += '<span> ' + app.formatPrice(val) + '</span>';
                                if (cell.editInline) {
                                    td += '<div class="form-group inline-form">' +
                                        '<input class="form-control"  style="' + (cell.style != null ? cell.style : '') + '"  data-type="price" attr="' +
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
                                if (cell.expandChild != null) {
                                    td += s.drawExpandNode(level);
                                }
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
                    tr += td;
                }
            }


            tr += '<td>&nbsp;</td></tr>';
            return tr;
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



        s.rowFilter = function (bl) {
            var skip = set.skipCols;
            var tr = '<tr class="tr-filter">';
            var start, end;

            if (bl) {
                if (skip == 0)
                    return '';
                if (skip > 0 && (set.checkAll == null || set.checkAll)) {
                    tr += '<td></td>';
                    skip--;
                }
                start = 0;
                end = skip;
            } else {
                if (set.checkAll == null || set.checkAll) {
                    if (skip == 0) {
                        tr += '<td></td>';
                    } else {
                        skip--;
                    }
                }
                start = skip;
                end = set.rows.length;
            }

            for (var i = start; i < end; i++) {
                var cell = set.rows[i];
                var v;
                if (app.hasValue(cell.visible)) {
                    v = cell.visible();
                } else {
                    v = true;
                }
                if (v) {
                    var model = set.model;
                    if (cell.model != null) {
                        model = cell.model;
                    }
                    var td = '<td ci="' + i + '" ';

                    if (cell.colspan != null) {
                        if (cell.colspan.if(item)) {
                            td += ' colspan="' + cell.colspan.value + '" ';
                        }
                    }
                    td += '>';
                    var f = cell.filter;
                    if (f != null) {
                        switch (f.type) {
                            case 'contains':
                                {
                                    var o = '<div class="input-group input-group-sm">' +
                                        '<div class="input-group-btn" > ' +
                                        '<button type="button" class="btn btn-default btn-left" title="Lộc dữ liệu" ' +
                                        '><i class="icon-filter4"></i></button>' +
                                        //'<ul class="dropdown-menu">' +
                                        //'<li><a href="javascript:void(0)" class="operator" value="[*]">Chứa</a></li>' +
                                        //'<li><a href="javascript:void(0)" class="operator" value="=">Bằng</a></li>' +
                                        //'<li><a href="javascript:void(0)" class="operator" value=">">Lớn hơn</a></li>' +
                                        //'<li><a href="javascript:void(0)" class="operator" value=">=">Lớn hơn hoặc bằng</a></li>' +
                                        //'<li><a href="javascript:void(0)" class="operator" value="<">Bé hơn</a></li>' +
                                        //'<li><a href="javascript:void(0)" class="operator" value="<=">Bé hơn hoặc bằng</a></li>' +
                                        //'</ul>' +
                                        '</div > ' +
                                        '<input type="text" class="form-control filter-contains"  data-index="' + i + '" attr="' +
                                        f.attr +
                                        '" placeholder="...">' +
                                        '</div>';
                                    td += o;
                                }
                                break;
                            case 'option':
                                {
                                    var o = '<div class="form-group form-group-sm">' +
                                        '<div class="input-group input-group-sm">' +
                                        '<select class="form-control filter-option select-option" attr="' + cell.attribute + '"  data-index="' +
                                        i +
                                        '" data-width="' +
                                        set.head.groups[i] +
                                        '">' +
                                        '<option value="">Tất cả</option>';
                                    if (f.lst != null) {
                                        var data = f.lst();
                                        $(data).each(function () {
                                            if (f.selected != null && f.selected == this.id) {
                                                o += '<option value="' + this.id + '" selected="selected">' + this.text + '</option>';
                                            } else {
                                                o += '<option value="' + this.id + '">' + this.text + '</option>';
                                            }
                                        });
                                    }
                                    o += '</select>' +
                                        '</div>' +
                                        '</div>';
                                    td += o;
                                }
                                break;
                            case 'optionRemote':
                                {
                                    var o = '<div class="form-group form-group-sm">' +
                                        '<div class="input-group input-group-sm">' +
                                        '<div class="input-group-btn" > ' +
                                        '<button type="button" class="btn btn-default btn-left" ' +
                                        'title="Lộc dữ liệu"><i class="icon-filter4"></i></button>' +
                                        '</div>' +
                                        '<input type="text" attr="' + cell.attribute + '" class="form-control filter-option select-option-remote" data-index="' +
                                        i +
                                        '" data-width="' +
                                        set.head.groups[i] +
                                        '"/>';
                                    o += '</div>' +
                                        '</div>';
                                    td += o;
                                }
                                break;
                            case 'compoTree':
                                {
                                    var o = '<div class="form-group form-group-sm">' +
                                        '<div class="input-group input-group-sm">' +
                                        '<div class="input-group-btn" > ' +
                                        '<button type="button" class="btn btn-default btn-left" ' +
                                        'title="Lộc dữ liệu"><i class="icon-filter4"></i></button>' +
                                        '</div>';
                                    o += '<input class="form-control compo-tree" id="' + app.newGuid() + '" data-index="' + i + '" type="text" />';
                                    o += '</div>' +
                                        '</div>';
                                    td += o;
                                }
                                break;
                            case 'compoMoney':
                                {
                                    var o = '<div class="compo-money" from to name="' + cell.attribute + '"></div>';
                                    td += o;
                                }
                                break;
                            case 'number':
                                {
                                    var o = '<div class="compo-number" from to name="' + cell.attribute + '"></div>';
                                    td += o;
                                }
                                break;
                            case 'date':
                                {
                                    var o = '<div class="datepicker" from to name="' + cell.attribute + '" data-index="' +
                                        i +
                                        '" ></div>';
                                    td += o;
                                }
                                break;
                        }
                    }
                    td += '</td>';
                    tr += td;
                }
            }


            tr += '<td>&nbsp;</td></tr>';
            return tr;
        }
        s.loopDrawchild = function (mc, data, pId, idAttr, level) {
            $.each(data, function (k, item) {
                if (item.ParentId == pId) {
                    var r = s.drawRow(item, idAttr, level, k + 1, true);
                    mc.find(".area-bl tbody").append(r);
                    r = s.drawRow(item, idAttr, level, k + 1, false);
                    mc.find(".area-br tbody").append(r);

                    s.loopDrawchild(mc, data, item.Id, idAttr, level + 1);
                }

            });
        }

        s.setViewData = function (list) {
            var mc = $(sel).find('> .advance-table > .main-content');
            var idAttr = "Id";
            var r;
            if (set.idAttribute != null) {
                idAttr = set.idAttribute;
            }
            s.sumarray = [];

            $.each(list,
                function (k, item) {
                    if (set.expandable) {
                        if (item.ParentId == null) {
                            r = s.drawRow(item, idAttr, 1, k + 1, true);
                            mc.find(".area-bl tbody").append(r);
                            r = s.drawRow(item, idAttr, 1, k + 1, false);
                            mc.find(".area-br tbody").append(r);
                            s.loopDrawchild(mc, list, item.Id, idAttr, 2);
                        }
                    } else {
                        r = s.drawRow(item, idAttr, 1, k + 1, true);
                        if (s.activeParentId != null) {
                            $(mc.find('.area-bl tbody tr[dataid="' + s.activeParentId + '"]')).after(r);
                        } else {
                            mc.find(".area-bl tbody").append(r);
                        }
                        r = s.drawRow(item, idAttr, 1, k + 1, false);

                        if (s.activeParentId != null) {
                            $(mc.find('.area-br tbody tr[dataid="' + s.activeParentId + '"]')).after(r);
                        } else {
                            mc.find(".area-br tbody").append(r);
                        }
                    }
                });

            // draw sum tr
            if (s.set.sumInfo != null) {
                if (set.skipCols > 0) {
                    mc.find(".area-bl tbody").append('<tr class="warning"><td colspan="' +
                        set.skipCols +
                        '" style=" " class="text-bold text-right">TỔNG CỘNG</td></tr>');
                }

                var tr = '<tr class="warning">';
                var index = 0;
                if (s.set.sumInfo.colspan != null) {
                    index = s.set.sumInfo.colspan;
                    tr += '<td colspan="' +
                        s.set.sumInfo.colspan +
                        '" style="text-align: right"><strong>Tổng</strong></td>';
                }
                if (set.skipCols > 0) {
                    index += set.skipCols;
                }

                var cLabel = -1;
                var tLabel = '';

                if (s.set.sumInfo.label != null) {
                    var cLabel = s.set.sumInfo.label.col != null ? s.set.sumInfo.label.col : 0;
                    var tLabel = s.set.sumInfo.label.text != null
                        ? s.set.sumInfo.label.text
                        : 'TỔNG CỘNG';

                }

                if (set.checkAll) {
                    index -= 1;
                }

                for (var i = index; i < s.set.rows.length; i++) {
                    if (i == cLabel) {
                        tr += '<td style="text-align: right"><strong>' + tLabel + '</strong></td>';
                    } else {
                        var col = s.set.rows[i];
                        if (col.sumable) {
                            tr += '<td class="text-right" attr="' + col.attribute + '"><strong>' +
                                app.formatPrice(s.sumarray[i]) +
                                '</strong></td>';
                        } else {
                            tr += '<td>&nbsp;</td>';
                        }
                    }
                }
                tr += '<td></td></tr>';
                mc.find(".area-br tbody").append(tr);

            }

            mc.find('.empty-message').css('display', 'none');

        }

        s.loadData = function (params, callback, reload) {

            if (params != null) {
                $.extend(s.searchParams, params);
            }

            var mc = $(sel).find('> .advance-table > .main-content');


            if (set.multiLevel) {
                if (s.activeParentId != null) {
                    var tr = mc.find('.area-br tbody tr[dataid="' + s.activeParentId + '"]');
                    s.reloadChilds(tr);
                } else {
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
                            mc.find(".area-bl tbody").html("");
                            mc.find(".area-br tbody").html("");
                            mc.find(".area-bom tbody").html("");
                            s.sourceData = list;
                            s.count = result.Count;
                            if (set.rows.length > 0) {
                                if (list != null && list.length > 0) {
                                    s.setViewData(list);
                                } else {
                                    var r = s.drawEmptyRow(true);
                                    mc.find(".area-bl tbody").append(r);
                                    r = s.drawEmptyRow(false);
                                    mc.find(".area-br tbody").append(r);
                                    mc.find('.empty-message').css('display', 'block');
                                }
                            }

                            mc.find(" .total-row span").text(count);

                            if (set.paging != null) {
                                mc.find("tfoot").css('display', '');
                                s.setPagination(count);
                            }
                            s.hideTableLoading();
                            s.setRowEvents();
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



        };
        s.search = function (conditions, callback) {
            s.searchParams.page = 1;
            $.extend(s.searchParams, conditions);
            s.loadData(null, callback);
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
            if (set.paging != null) {
                $(sel).find("tfoot").css('display', '');
                s.setPagination(count);
            }
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
            $.each($(sel).find('> .advance-table > .main-content .area-br tr'),
                function (k, tr) {
                    if ($(tr).hasClass("active")) {
                        ids.push($(tr).attr("dataid"));
                    }
                });
            return ids;
        }
        s.getCheckedRowIds = function () {
            var ids = [];
            $.each($(sel).find('> .advance-table > .main-content .first-col input[type="checkbox"]'),
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
            var mc = $(sel).find('> .advance-table > .main-content');
            for (var i = 0; i < ids.length; i++) {
                var tr = mc.find('.area-bl tr[dataid="' + ids[i] + '"]');
                var checkbox = $(tr).find('.first-col input[type="checkbox"]');
                checkbox.prop('checked', true);
            }
            $.uniform.update();
        }
        s.getSelectedRow = function () {
            var tr = $(sel).find('> .advance-table > .main-content .area-br tr[class="active"]').first();
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
            var index = $(sel).find('> .advance-table > .sub-content > .tab-content > div.active').index();
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

            var mc = $(sel).find('> .advance-table > .main-content');
            var rs = $(sel).find('> .advance-table > .resize');
            var sc = $(sel).find('> .advance-table > .sub-content');
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
                    var t = $(this).scrollTop();
                    var l = $(this).scrollLeft();
                    mc.find('.area-bl > div').scrollTop(t);
                    mc.find('.area-tr > div').scrollLeft(l);
                }
            });

            mc.find('.area-bl > div').scroll(function () {
                if ($(s.tounchTr).length == 0 || $(s.tounchTr).hasClass('area-bl')) {
                    var t = $(this).scrollTop();
                    mc.find('.area-br > div').scrollTop(t);
                }
            });

            mc.find('.styled').uniform();

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

            rs.find('.btn-expand-main-content').unbind().click(function () {
                var at = $(sel).find('.advance-table');
                var b = $(this);
                var h = at.height();
                if (at.hasClass('expand')) {
                    sc.css('display', 'block');
                    at.removeClass('expand');
                    b.find('i').removeClass('icon-arrow-up5').addClass('icon-arrow-down5');
                    s.setMainTableHeight(parseInt(h / 2));
                } else {
                    sc.css('display', 'none');
                    at.addClass('expand');
                    b.find('i').removeClass('icon-arrow-down5').addClass('icon-arrow-up5');
                    if (set.footer == null || set.footer) {
                        s.setMainTableHeight(h - 35);
                    } else {
                        s.setMainTableHeight(h);
                    }

                }
            });

            sc.find('.btn-scroll-tab-right').unbind().click(function () {
                var d = $(this).closest('.tabbable').find('.tabs-group > div');
                var leftPos = d.scrollLeft();
                d.animate({ scrollLeft: leftPos + 200 }, 100);
            });
            sc.find('.btn-scroll-tab-left').unbind().click(function () {
                var d = $(this).closest('.tabbable').find('.tabs-group > div');
                var leftPos = d.scrollLeft();
                d.animate({ scrollLeft: leftPos - 200 }, 100);
            });

            sc.find('.btn-select-tab').unbind().click(function () {
                var id = $(this).attr('href');
                var a = sc.find('.tabs-group a[href="' + id + '"]');
                a.tab('show');
                var d = sc.find('.tabs-group > div');
                var left = parseInt(a.closest('li').attr('data-pos'));
                d.animate({ scrollLeft: left }, 100);
            });

            sc.find(' > .tabbable a[data-toggle="tab"]').unbind().on('shown.bs.tab',
                function (e) {
                    var i = $(e.target).attr('data-index');
                    s.selectContentTab(i, $(e.target).attr('href'));
                });

            scm.find(' .tabbable a[data-toggle="tab"]').unbind().on('shown.bs.tab',
                function (e) {
                    var i = $(e.target).attr('data-index');
                    s.selectContentTab(i, $(e.target).attr('href'));
                });

            if (set.toolbars != null) {
                if (set.toolbars.create != null) {
                    $(set.toolbars.create.ele).unbind().click(function () {
                        if (set.toolbars.create.click != null) {
                            set.toolbars.create.click();
                        } else {
                            var btn = $(this);
                            btn.button('loading');
                            if (s.editParams != null) {
                                s.editParams.parentId = null;
                            }
                            console.log(s.editParams);
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

            if (set.filterable) {

                mc.find('.tr-filter .btn').unbind().click(function () {

                });

                mc.find('.tr-filter .select-option').unbind().select2({
                    minimumResultsForSearch: 1,
                    dropdownCssClass: 'bigdrop'
                }).on('select2-open',
                    function (e) {
                        var ele = $(this);
                        s.loadFilterOption(ele, function () {
                            ele.select2('close').select2('open');
                            return true;
                        });
                    }).on("change",
                        function (e) {
                            var ele = $(e.target);
                            var f = set.rows[ele.attr('data-index')];
                            var p = {};
                            if (f.filter.prop != null) {
                                p[f.filter.prop] = e.val;
                            } else {
                                p[f.attribute] = e.val;
                            }
                            var w = parseInt(ele.attr('data-width'));
                            ele.closest('div').find('.select2-container').css('width', (w - 30) + 'px');
                            s.search(p);

                        });

                mc.find('.tr-filter .select-option-remote').each(function () {
                    var ele = $(this);
                    var idex = $(this).attr('data-index');
                    var f = set.rows[idex].filter;
                    ele.unbind().select2({
                        ajax: {
                            url: f.ajax.url,
                            dataType: 'json',
                            quietMillis: 200,
                            data: function (term, page) {
                                var k = app.toKeyword(term);
                                var sd = $.extend({
                                    keyword: k,
                                    limit: 10
                                },
                                    f.ajax.data);
                                return sd;
                            },
                            results: function (result) {
                                var data = [];
                                var list = result.Many != null ? result.Many : result;
                                $(list).each(function () {
                                    if (f.ajax.render != null) {
                                        data.push(f.ajax.render(this));
                                    } else {
                                        data.push({
                                            id: this[f.ajax.attr.id],
                                            text: this[f.ajax.attr.text]
                                        });
                                    }

                                });
                                return {
                                    results: data
                                };
                            }
                        },
                        minimumInputLength: 1,
                        minimumResultsForSearch: 1,
                        dropdownCssClass: 'bigdrop',
                        allowClear: true,
                        placeholder: 'Tất cả'
                    }).on("change",
                        function (e) {
                            var ele = $(e.target);
                            var f = set.rows[ele.attr('data-index')];
                            var p = {};
                            if (f.filter.prop != null) {
                                p[f.filter.prop] = e.val;
                            } else {
                                p[f.attribute] = e.val;
                            }
                            var w = parseInt(ele.attr('data-width'));
                            ele.closest('div').find('.select2-container').css('width', (w - 30) + 'px');
                            s.search(p);
                        });
                });

                mc.find('.tr-filter .compo-tree').each(function () {
                    var ele = $(this);
                    var idex = ele.attr('data-index');
                    var f = set.rows[idex].filter;
                    var opt = f.option;
                    opt.placeHolder = 'Tất cả';
                    opt.valueType = 1;
                    opt.width = set.head.groups[idex];
                    opt.width -= 31;
                    opt.selectCallback = function (val) {
                        var r = set.rows[idex];
                        var p = {};
                        if (f.prop != null) {
                            p[f.prop] = val;
                        } else {
                            p[r.attribute] = val;
                        }
                        s.search(p);
                    };
                    var eid = ele.attr('id');
                    $('#' + eid).compoTree(opt);
                });

                mc.find('.tr-filter .datepicker').each(function () {
                    var ele = $(this);
                    var name = $(this).attr('name');
                    var idex = ele.attr('data-index');

                    var f = set.rows[idex].filter;

                    mc.find('.tr-filter div[name="' + name + '"]').compoDate({
                        placeHolder: 'Tất cả',
                        days: f.option != null ? f.option.days : null,
                        selectCallback: function (arr, ctr) {
                            var p = {};
                            p[name + 'From'] = arr.from != null ? app.convertVnToEnDate(arr.from) : null;
                            p[name + 'To'] = arr.to != null ? app.convertVnToEnDate(arr.to) : null;
                            s.search(p);
                        }
                    });
                });

                mc.find('.tr-filter .compo-money').each(function () {
                    var name = $(this).attr('name');
                    mc.find('.tr-filter div[name="' + name + '"]').compoMoney({
                        placeHolder: 'Tất cả',
                        selectCallback: function (arr, ctr) {
                            var p = {};
                            p[name + 'From'] = arr.from;
                            p[name + 'To'] = arr.to;
                            s.search(p);
                        }
                    });
                });

                mc.find('.tr-filter .compo-number').each(function () {
                    var name = $(this).attr('name');
                    mc.find('.tr-filter div[name="' + name + '"]').compoNumber({
                        placeHolder: 'Tất cả',
                        selectCallback: function (arr, ctr) {
                            var p = {};
                            p[name + 'From'] = arr.from;
                            p[name + 'To'] = arr.to;
                            s.search(p);
                        }
                    });
                });

                var globalTimeout = null;
                mc.find('.filter-contains').unbind().keyup(function () {
                    var keyword = $(this).val();
                    var attr = $(this).attr('attr');
                    if (globalTimeout != null) {
                        clearTimeout(globalTimeout);
                    }
                    var ele = $(this);
                    var idex = ele.attr('data-index');
                    var f = set.rows[idex].filter;

                    globalTimeout = setTimeout(function () {
                        var p = {};
                        p[attr] = f.email ? keyword : app.toKeyword(keyword);
                        $.extend(s.searchParams, p);
                        if (s.searchParams.page != 1) {
                            s.searchParams.page = 1;
                        }
                        if (set.beforeSearch != null) {
                            s.searchParams = set.beforeSearch(s.searchParams);
                        }

                        s.loadData();
                        clearTimeout(globalTimeout);
                    }, 400);
                });
            }


            if (set.height.correlate != null) {
                set.height.correlate.attrchange({
                    callback: function (e) {
                        var curHeight = $(this).height();
                        var th = curHeight - (set.toolbars != null ? 40 : 0);
                        var at = $(sel).find('> .advance-table');
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

            mc.find('.area-tl .table th.orderable').unbind().click(function () {
                var ob = $(this).attr('orderby');
                var co = $(this).attr('currentorder');
                var i = $(this).find('i');
                co = co == 'desc' ? 'asc' : 'desc';
                s.searchParams.OrderBy = ob;
                s.searchParams.OrderType = co;
                $(this).attr('currentorder', co);
                s.loadData();
            });

            mc.find('.area-tr .table th.orderable').unbind().click(function () {
                var ob = $(this).attr('orderby');
                var co = $(this).attr('currentorder');
                var i = $(this).find('i');
                co = co == 'desc' ? 'asc' : 'desc';
                s.searchParams.OrderBy = ob;
                s.searchParams.OrderType = co;
                $(this).attr('currentorder', co);
                s.loadData();
            });

            $('.th-hide').click(function () {
                var x, y;
                var b = $(this);
                var th = b.closest('th');
                var ri = parseInt(th.attr('ri'));
                var chs = [];
                var ci = th.attr('ci');
                if (ci.indexOf('-') > 0) {
                    var arr = ci.split('-');
                    x = parseInt(arr[0]);
                    y = parseInt(arr[1]);
                    for (var j = x; j <= y; j++) {
                        chs.push(j);
                    }
                } else {
                    chs.push(parseInt(ci));
                }

                var cols = mc.find('.area-tr colgroup col');
                $(cols).each(function () {
                    var i = parseInt($(this).attr('i'));
                    if ($.inArray(i, chs) >= 0) {
                        $(this).css('width', 2);
                    }
                });

                // ẩn filter

                cols = mc.find('.area-tr .tr-filter td');
                $(cols).each(function () {
                    var i = parseInt($(this).attr('ci'));
                    if ($.inArray(i, chs) >= 0) {
                        var div = $(this).find('> div');
                        if (div.length > 0) {
                            div.css('display', 'none');
                        }
                    }
                });

                cols = mc.find('.area-br colgroup col');
                $(cols).each(function () {
                    var i = parseInt($(this).attr('i'));
                    if ($.inArray(i, chs) >= 0) {
                        $(this).css('width', 2);
                    }
                });

                th.addClass('hided');

                if (chs.length > 1) {
                    for (var k = ri + 1; k <= set.cols.right.length; k++) {
                        cols = mc.find('.area-tr thead th[ri="' + k + '"]');
                        $(cols).each(function () {
                            var ci = $(this).attr('ci');
                            if (ci.indexOf('-') > 0) {
                                var arr = ci.split('-');
                                x = parseInt(arr[0]);
                                y = parseInt(arr[1]);

                                if ($.inArray(x, chs) >= 0 && $.inArray(y, chs) >= 0) {
                                    $(this).addClass('hided');
                                }

                            } else {
                                ci = parseInt(ci);
                                if ($.inArray(ci, chs) >= 0) {
                                    $(this).addClass('hided');
                                }
                            }
                        });
                    }
                }

                var d = mc.find('.area-bl > div');
                var l = d.scrollLeft();
                d.scrollLeft(l - 1);
            });

            $('.th-unhide').click(function () {
                var x, y, k;
                var b = $(this);
                var th = b.closest('th');
                var ri = parseInt(th.attr('ri'));
                var chs = [];
                var ci = th.attr('ci');
                if (ci.indexOf('-') > 0) {
                    var arr = ci.split('-');
                    x = parseInt(arr[0]);
                    y = parseInt(arr[1]);
                    for (var j = x; j <= y; j++) {
                        chs.push(j);
                    }
                } else {
                    chs.push(parseInt(ci));
                }

                var cols = mc.find('.area-tr colgroup col');
                $(cols).each(function () {
                    var i = parseInt($(this).attr('i'));
                    if ($.inArray(i, chs) >= 0) {
                        var w = $(this).attr('w');
                        $(this).css('width', w + 'px');
                    }
                });

                cols = mc.find('.area-br colgroup col');
                $(cols).each(function () {
                    var i = parseInt($(this).attr('i'));
                    if ($.inArray(i, chs) >= 0) {
                        var w = $(this).attr('w');
                        $(this).css('width', w + 'px');
                    }
                });

                th.removeClass('hided');

                if (chs.length > 1) {
                    for (k = ri + 1; k <= set.cols.right.length; k++) {
                        cols = mc.find('.area-tr thead th[ri="' + k + '"]');
                        $(cols).each(function () {
                            ci = $(this).attr('ci');
                            if (ci.indexOf('-') > 0) {
                                var arr = ci.split('-');
                                x = parseInt(arr[0]);
                                y = parseInt(arr[1]);

                                if ($.inArray(x, chs) >= 0 && $.inArray(y, chs) >= 0) {
                                    $(this).removeClass('hided');
                                }

                            } else {
                                ci = parseInt(ci);
                                if ($.inArray(ci, chs) >= 0) {
                                    $(this).removeClass('hided');
                                }
                            }
                        });
                    }
                }

                // bỏ ẩn cha
                if (ri > 1) {
                    for (k = 1; k < ri; k++) {
                        cols = mc.find('.area-tr thead th[ri="' + k + '"]');
                        $(cols).each(function () {
                            ci = $(this).attr('ci');
                            if (ci.indexOf('-') > 0) {
                                var arr = ci.split('-');
                                x = parseInt(arr[0]);
                                y = parseInt(arr[1]);
                                if (chs.length > 1) {
                                    if (x <= chs[0] && y >= chs[chs.length - 1]) {
                                        $(this).removeClass('hided');
                                    }
                                } else {
                                    if (x <= chs[0] && chs[0] <= y) {
                                        $(this).removeClass('hided');
                                    }
                                }
                            } else {
                                ci = parseInt(ci);
                                if (chs.length == 1) {
                                    if (ci == chs[0]) {
                                        $(this).removeClass('hided');
                                    }
                                }
                            }
                        });
                    }
                }
                var d = mc.find('.area-bl > div');
                var l = d.scrollLeft();
                d.scrollLeft(l - 1);
            });

            $('[data-toggle="tooltip"]').tooltip({
                html: true
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

        s.setRowHeight = function () {
            var mc = $(sel).find('> .advance-table > .main-content');
            mc.find('.area-bl tbody tr').each(function () {
                var h = $(this).height();
                var id = $(this).attr('dataid');
                var trr = mc.find('.area-br tr[dataid="' + id + '"]');
                if (trr.height() >= h) {
                    $(this).css('height', trr.height());
                } else {
                    $(trr).css('height', h);
                }
                var tro = mc.find('.area-bom tr[dataid="' + id + '"]');
                if (tro.height() >= h) {
                    $(this).css('height', tro.height());
                } else {
                    $(tro).css('height', h);
                }
            });
        }

        s.setRowEvents = function () {
            s.setRowHeight();

            var mc = $(sel).find('> .advance-table > .main-content');

            mc.find('.styled').uniform();

            mc.find(".area-bl tr td").unbind().click(function (e) {
                if (e.target != this) return;
                s.selectRow($(this).closest('tr'));
            });

            mc.find(".area-bl tr").hover(function () {
                var id = $(this).attr('dataid');
                $(sel).find('.area-br tr[dataid="' + id + '"]').addClass('hover');
                $(this).addClass('hover');
                $(this).addClass('hover');

            },
                function () {
                    var id = $(this).attr('dataid');
                    $(sel).find('.area-br tr[dataid="' + id + '"]').removeClass('hover');
                    $(this).removeClass('hover');
                    $(this).removeClass('hover');
                });
            mc.find(".area-br tr").hover(function () {
                var id = $(this).attr('dataid');
                $(sel).find('.area-bl tr[dataid="' + id + '"]').addClass('hover');
                $(this).addClass('hover');
                $(this).addClass('hover');

            },
                function () {
                    var id = $(this).attr('dataid');
                    $(sel).find('.area-bl tr[dataid="' + id + '"]').removeClass('hover');
                    $(this).removeClass('hover');
                    $(this).removeClass('hover');
                });

            mc.find(".area-br tr td").unbind().click(function (e) {
                if (e.target != this) return;
                s.selectRow($(this).closest('tr'));
            });

            mc.find(".area td.edit-inline").unbind().dblclick(function (e) {
                if (e.target != this) return;
                if (!$(this).hasClass('editing')) {

                    var ci = parseInt($(this).attr('ci'));
                    var cell = set.rows[ci];
                    mc.find('.area td.editing').each(function () {
                        var inp = $(this).find('> .inline-form input');
                        s.closeEditInline(inp, inp.val(), inp.attr('data-type'));
                    });
                    if (cell.editInline == true) {
                        $(this).addClass('editing');
                        var inp = $(this).find('input');
                        inp.select();
                    } else {
                        $(this).addClass('editing');
                        var f = cell.editInline.option;
                        switch (cell.editInline.type) {
                            case 'optionRemote': {
                                var ele = $(this).find('input');
                                if (!ele.hasClass('loaded')) {
                                    ele.unbind()
                                        .select2(cell.editInline.option)
                                        .on("change", function (e) {
                                            ele = $(e.target);
                                            f = set.rows[ci].editInline.option;
                                            var p = {};
                                            if (f.prop != null) {
                                                p[f.prop] = e.val;
                                            } else {
                                                p[set.rows[ci].attribute] = e.val;
                                            }

                                            s.closeEditInline(ele, e.val, ele.attr('data-type'), e.added.text);
                                        });
                                    ele.select2("open");
                                } else {
                                    ele.select2("open");
                                }
                            } break;
                        }
                    }
                }
            });

            mc.find(".area td.edit-inline > span").unbind().dblclick(function (e) {
                if (e.target != this) return;
                $(this).closest('td').trigger("dblclick");
            });

            mc.find('.area td.edit-inline input[type="checkbox"]').unbind().change(function (e) {
                if (e.target != this) return;
                s.closeEditInline($(this), $(this).prop('checked'));
            });

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
                    if (set.toolbars.edit != null) {
                        if (checkNumber > 0) {
                            $(set.toolbars.edit.ele).prop('disabled', false);
                        } else {
                            $(set.toolbars.edit.ele).prop('disabled', true);
                        }
                    }
                }

                $.uniform.update();
                if (set.selectRowCallback != null) {
                    set.selectRowCallback(tr);
                }
            });

            mc.find('.expand-child').unbind().click(function () {
                var arrow = $(this);
                var tr = arrow.closest('tr');
                s.expandChild(arrow, tr, false);
            });

            mc.find(".area td.edit-inline input").keyup(function (e) {
                var keycode = (event.keyCode ? event.keyCode : event.which);
                if (keycode == '13') {
                    s.closeEditInline($(this), $(this).val(), $(this).attr('data-type'));
                }
            });

            if (set.contextMenu != null) {
                var cmt = $(sel).find('> .context-menu-popup');
                mc.find('.area-br tr[data-toggle="context"]').unbind().contextmenu({
                    target: cmt.selector,
                    before: function (e, context) {
                        e.preventDefault();
                        if (s.moveObjectId != null) {
                            this.getMenu().find('li .near')
                                .removeClass('disabled');
                        } else {
                            this.getMenu().find('li .near')
                                .addClass('disabled');
                        }

                        var menu = this.getMenu();
                        var id = $(context).attr('dataid');
                        var row = s.getDataById(id);

                        $(set.contextMenu).each(function () {
                            var li = menu.find('a.' + this.class).closest('li');
                            if (this.enable == null || this.enable(row)) {
                                li.css('display', 'block');
                                if (this.visible != null && !this.visible(row)) {
                                    li.find('a').addClass('disabled');
                                } else {
                                    var lis;
                                    switch (this) {
                                        case 'edit':
                                            {
                                                lis = menu.find('a[action="edit"]');
                                                lis.removeClass('disabled');
                                            }
                                            break;
                                        case 'delete':
                                            {
                                                lis = menu.find('a[action="delete"]');
                                                lis.removeClass('disabled');
                                            }
                                            break;
                                        case 'deleteStatus':
                                            {
                                                lis = menu.find('a[action="delete-status"]');
                                                if (row.Status != null && row.Status > 0) {
                                                    lis.addClass('disabled');
                                                } else {
                                                    lis.removeClass('disabled');
                                                }
                                            }
                                            break;
                                        default:
                                            {
                                                li.find('a').removeClass('disabled');
                                            }
                                            break;
                                    }
                                }
                            }
                            else {
                                li.css('display', 'none');
                            }
                        });

                        return true;
                    },
                    onItem: function (context, e) {
                        console.log(444);
                        var ct = $(e.currentTarget);
                        if (!ct.hasClass('dropdown-submenu')) {
                            if (!$(e.target).hasClass('disabled')) {
                                s.clickContextMenu(context, e);
                            }
                        } else {
                            if (!s.clickSubContextMenu) {
                                s.clickContextMenu(context, e);
                                s.clickSubContextMenu = true;
                            } else {
                                s.clickSubContextMenu = false;
                            }
                        }
                    }
                });

                mc.find('.area-bl tr[data-toggle="context"]').unbind().contextmenu({
                    target: cmt.selector,
                    before: function (e, context) {
                        e.preventDefault();
                        if (s.moveObjectId != null) {
                            this.getMenu().find('li .near')
                                .removeClass('disabled');
                        } else {
                            this.getMenu().find('li .near')
                                .addClass('disabled');
                        }
                        var menu = this.getMenu();
                        var id = $(context).attr('dataid');
                        var row = s.getDataById(id);

                        $(set.contextMenu).each(function () {
                            var li = menu.find('a.' + this.class).closest('li');
                            if (this.enable == null || this.enable(row)) {
                                li.css('display', 'block');
                                if (this.visible != null && !this.visible(row)) {
                                    li.find('a').addClass('disabled');
                                } else {
                                    var lis;
                                    switch (this) {
                                        case 'edit':
                                            {
                                                lis = menu.find('a[action="edit"]');
                                                lis.removeClass('disabled');
                                            }
                                            break;
                                        case 'delete':
                                            {
                                                lis = menu.find('a[action="delete"]');
                                                lis.removeClass('disabled');
                                            }
                                            break;
                                        case 'deleteStatus':
                                            {
                                                lis = menu.find('a[action="delete-status"]');
                                                if (row.Status != null && row.Status > 0) {
                                                    lis.addClass('disabled');
                                                } else {
                                                    lis.removeClass('disabled');
                                                }
                                            }
                                            break;
                                        default:
                                            {
                                                li.find('a').removeClass('disabled');
                                            }
                                            break;
                                    }
                                }
                            }
                            else {
                                li.css('display', 'none');
                            }
                        });
                        return true;
                    },
                    onItem: function (context, e) {
                        var ct = $(e.currentTarget);
                        if (!ct.hasClass('dropdown-submenu')) {
                            if (!$(e.target).hasClass('disabled')) {
                                s.clickContextMenu(context, e);
                                s.clickSubContextMenu = true;
                            }
                        } else {
                            console.log(s.clickSubContextMenu);
                            if (!s.clickSubContextMenu) {

                                s.clickContextMenu(context, e);
                                s.clickSubContextMenu = true;
                            } else {
                                s.clickSubContextMenu = false;
                            }
                        }
                    }
                });
            }

            if (set.optionMenu != null) {
                mc.find('.area-bom a').unbind().click(function () {
                    var a = $(this);
                    var tr = a.closest('tr');
                    var act = a.attr('action');
                    var cls = a.attr('class');
                    switch (act) {
                        case 'edit':
                            {
                                var id = $(tr).attr('dataid');
                                s.createOrUpdateObject(id, function () { }, $(tr));
                            }
                            break;

                        case 'delete':
                            {
                                var id = $(tr).attr('dataid');
                                s.deleteObjects('bulk',
                                    [id],
                                    function () {
                                        console.log('reload...');
                                        s.loadData();
                                    });
                            }
                            break;

                        case 'move-top':
                            {
                                var id = $(tr).attr('dataid');
                                var url = set.editController != null ? set.editController + '/' : '/admin/';
                                url += 'ChangePriority' + set.model;
                                s.showTableLoading();
                                app.postData(url,
                                    {
                                        PriorityPosition: 'Top',
                                        id: id
                                    },
                                    function (result) {
                                        s.search({},
                                            function () {
                                                s.hideTableLoading();
                                            });
                                    });
                            }
                            break;
                        case 'move-bottom':
                            {

                            }
                            break;
                        case 'chose-position':
                            {
                                app.notify('info', 'Chọn vị trí sắp xếp');
                                s.moveObjectId = $(tr).attr('dataid');
                            }
                            break;
                        case 'near-above':
                            {
                                var url = set.editController != null ? set.editController + '/' : '/admin/';
                                url += 'ChangePriority' + set.model;
                                s.showTableLoading();
                                app.postData(url,
                                    {
                                        PriorityPosition: 'NearAbove',
                                        NearId: $(tr).attr('dataid'),
                                        id: s.moveObjectId
                                    },
                                    function (result) {
                                        s.moveObjectId = null;
                                        s.loadData({},
                                            function () {
                                                s.hideTableLoading();
                                            });
                                    });
                            }
                            break;
                        case 'near-under':
                            {
                                var url = set.editController != null ? set.editController + '/' : '/admin/';
                                url += 'ChangePriority' + set.model;
                                s.showTableLoading();
                                app.postData(url,
                                    {
                                        PriorityPosition: 'NearUnder',
                                        NearId: $(tr).attr('dataid'),
                                        id: s.moveObjectId
                                    },
                                    function (result) {
                                        s.moveObjectId = null;
                                        s.loadData({},
                                            function () {
                                                s.hideTableLoading();
                                            });
                                    });
                            }
                            break;
                        case 'add-child':
                            {
                                $.extend(s.editParams,
                                    {
                                        parentId: tr.attr('dataid'),
                                        id: null
                                    });
                                s.addChild(s.editParams);
                            }
                            break;
                        case 'custom':
                            {
                                for (var i = 0; i < set.contextMenu.length; i++) {
                                    var cm = set.contextMenu[i];
                                    if (cls == cm.class) {
                                        if (cm.click != null) {
                                            cm.click(tr);
                                            return false;
                                        }
                                    } else {
                                        if (cm.childs != null) {
                                            for (var j = 0; j < cm.childs.length; j++) {
                                                var ch = cm.childs[j];
                                                if (cls == ch.class) {
                                                    if (ch.click != null) {
                                                        ch.click(tr);
                                                        return false;
                                                    }
                                                }

                                            }
                                        }
                                    }


                                }
                            }
                            break;
                    }
                });
            }
        };

        s.removeChilds = function (pid) {
            var childs = $(sel).find('.area-bl tbody tr[parent="' + pid + '"]');
            if (childs.length > 0) {
                $(childs).each(function () {
                    var cid = $(this).attr('dataid');
                    s.removeChilds(cid);
                    $(sel).find('.area-bl tbody tr[dataid="' + cid + '"]').remove();
                    $(sel).find('.area-br tbody tr[dataid="' + cid + '"]').remove();
                });
            }
        }

        s.expandChild = function (arrow, tr, reload) {
            if (arrow == null) {
                arrow = tr.find('.expand-child');
            }
            var isExpand = arrow.hasClass('expand');
            var i = arrow.find('i');
            var parentId = tr.attr('dataid');
            var ai = tr.attr('ai');
            if (reload) {
                s.removeChilds(parentId);
                isExpand = false;
            }
            if (isExpand) {
                arrow.removeClass('expand');
                i.removeClass('icon-arrow-down12').addClass('icon-arrow-right13');
                s.displayChilds(parentId, 'none', true);
                s.displayChilds(parentId, 'none', false);
            } else {
                arrow.addClass('expand');
                i.removeClass('icon-arrow-right13');
                var isLoaded = arrow.hasClass('loaded');
                if (!isLoaded || reload) {
                    i.addClass('icon-spinner10 spinner');
                    var level = arrow.attr('level');

                    var url = set.dataUrl != null ? set.dataUrl : '/api/' + set.model + "List";
                    loadData(url,
                        {
                            parentId: parentId,
                            unlimited: true
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
                                var blInsertIndex = $(sel).find('.area-bl tbody tr[dataid="' + parentId + '"]');
                                var brInsertIndex = $(sel).find('.area-br tbody tr[dataid="' + parentId + '"]');
                                $.each(list,
                                    function (k, item) {
                                        var r = s.drawRow(item,
                                            idAttr,
                                            parseInt(level) + 1,
                                            ai + '.' + (k + 1),
                                            true);
                                        $(r).insertAfter(blInsertIndex);
                                        blInsertIndex = $(blInsertIndex).next();

                                        r = s.drawRow(item, idAttr, parseInt(level) + 1, ai + '.' + (k + 1), false);
                                        $(r).insertAfter(brInsertIndex);
                                        brInsertIndex = $(brInsertIndex).next();
                                    });

                                s.setRowEvents();
                                s.sourceData = $.merge(list, s.sourceData);
                            } else {
                                i.addClass('hide');
                            }

                            arrow.addClass('loaded');
                            if (set.loadDataCallback != null) {
                                set.loadDataCallback(result);
                            }
                        });
                } else {
                    i.addClass('icon-arrow-down12');
                    s.displayChilds(parentId, 'table-row', true);
                    s.displayChilds(parentId, 'table-row', false);
                }
            }


            $(sel).find('.area-bl tbody tr.current-command').removeClass('current-command');
        }

        s.clickContextMenu = function (context, e) {
            var a = $(e.target);
            if (!a[0].hasAttribute('action')) {
                a = $(e.target).closest('a');
            }
            var tr = $(context.context);
            var act = a.attr('action');
            var cls = a.attr('class');
            console.log(act);
            switch (act) {
                case 'edit':
                    {
                        var id = $(tr).attr('dataid');
                        var pid = $(tr).attr('parent');

                        if (typeof pid != 'undefined') {
                            $(sel).find('.area-bl tbody tr[dataid="' + pid + '"]').addClass('current-command');
                        }

                        if (set.multiLevel) {
                            var row = s.getDataById(id);
                            if (row.ParentId != null) {
                                s.activeParentId = row.ParentId;
                            } else {
                                s.activeParentId = null;
                            }
                        }
                        s.createOrUpdateObject(id, function () { }, $(tr));
                    }
                    break;
                case 'delete':
                    {
                        var id = $(tr).attr('dataid');
                        s.deleteObjects('bulk',
                            [id],
                            function () {
                                console.log('reload...');
                                s.loadData();
                            });
                    }
                    break;
                case 'delete-status':
                    {
                        console.log(5555);
                        var id = $(tr).attr('dataid');
                        s.deleteObjects('bulk',
                            [id],
                            function () {
                                console.log('reload...');
                                s.loadData();
                            });
                    }
                    break;
                case 'move-top':
                    {
                        var id = $(tr).attr('dataid');
                        var url = set.editController != null ? set.editController + '/' : '/admin/';
                        url += 'ChangePriority' + set.model;
                        s.showTableLoading();
                        app.postData(url,
                            {
                                PriorityPosition: 'Top',
                                id: id
                            },
                            function (result) {
                                s.search({},
                                    function () {
                                        s.hideTableLoading();
                                    });
                            });
                    }
                    break;
                case 'move-bottom':
                    {

                    }
                    break;
                case 'chose-position':
                    {
                        app.notify('info', 'Chọn vị trí sắp xếp');
                        s.moveObjectId = $(tr).attr('dataid');
                    }
                    break;
                case 'near-above':
                    {
                        var url = set.editController != null ? set.editController + '/' : '/admin/';
                        url += 'ChangePriority' + set.model;
                        s.showTableLoading();
                        app.postData(url,
                            {
                                PriorityPosition: 'NearAbove',
                                NearId: $(tr).attr('dataid'),
                                id: s.moveObjectId
                            },
                            function (result) {
                                s.moveObjectId = null;
                                s.loadData({},
                                    function () {
                                        s.hideTableLoading();
                                    });
                            });
                    }
                    break;
                case 'near-under':
                    {
                        var url = set.editController != null ? set.editController + '/' : '/admin/';
                        url += 'ChangePriority' + set.model;
                        s.showTableLoading();
                        app.postData(url,
                            {
                                PriorityPosition: 'NearUnder',
                                NearId: $(tr).attr('dataid'),
                                id: s.moveObjectId
                            },
                            function (result) {
                                s.moveObjectId = null;
                                s.loadData({},
                                    function () {
                                        s.hideTableLoading();
                                    });
                            });
                    }
                    break;
                case 'add-child':
                    {
                        s.showTableLoading();
                        var url = set.editController != null ? set.editController + '/' : '/admin/';
                        url += set.model + "Edit";
                        $.extend(s.editParams,
                            {
                                parentId: tr.attr('dataid'),
                                id: null
                            });

                        tr.addClass('current-command');

                        $.ajax({
                            url: url,
                            type: "GET",
                            data: s.editParams,
                            dataType: "html",
                            success: function (result) {
                                s.hideTableLoading();
                                s.initModal({
                                    title: 'Thêm ' + set.modal.title.toLowerCase(),
                                    width: set.modal.width,
                                    type: set.modal.type != null ? set.modal.type : 1,
                                    mode: set.modal.mode
                                }, result);
                                s.eventModal();
                                s.showModal();

                                if (set.loadModalCallback != null) {
                                    set.loadModalCallback(tr);
                                }
                            }
                        });
                    }
                    break;
                case 'custom':
                    {
                        for (var i = 0; i < set.contextMenu.length; i++) {
                            var cm = set.contextMenu[i];
                            if (cls == cm.class) {
                                if (cm.click != null) {
                                    cm.click(tr);
                                    return false;
                                }
                            } else {
                                if (cm.childs != null) {
                                    for (var j = 0; j < cm.childs.length; j++) {
                                        var ch = cm.childs[j];
                                        if (cls == ch.class) {
                                            if (ch.click != null) {
                                                ch.click(tr);
                                                return false;
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                    break;
            }
        };

        s.updateRowValue = function (tr, attr, v) {
            var id = parseInt(tr.attr('dataid'));
            var data = s.getDataById(parseInt(id));
            data[attr] = v;
            var i;
            console.log(data);
            for (i = 0; i < set.rows.length; i++) {
                var cell = set.rows[i];
                if (cell.formula != null) {
                    v = cell.formula(data);
                    var txt = v;
                    var td = tr.find('td[attr="' + cell.attribute + '"]');
                    console.log(txt, $.isNumeric(txt));
                    if ($.isNumeric(txt)) {
                        txt = cell.fixed != null ? txt.toFixed(cell.fixed) : Math.round(txt);
                        txt = cell.type == 'price' ? app.formatPrice(txt) : txt;
                    }
                    console.log(cell.attribute, txt);
                    td.attr('data-val', v);
                    $(td.find('span')).text(txt);
                    $(td.find('input')).val(txt);
                    data[cell.attribute] = v;
                }
            }

            s.setDataById(data, null);
            return data;
        }

        s.setDataById = function (data, list) {
            if (list == null) {
                list = s.sourceData;
            }
            for (var i = 0; i < list.length; i++) {
                if (list[i].Id == data.Id) {
                    list[i] = data;
                    return;
                }
            }
        };

        s.closeEditInline = function (inp, val, t, text) {

            var tr = inp.closest('tr');
            var td = inp.closest('td');
            var id = tr.attr('dataid');
            var ci = parseInt(td.attr('ci'));
            var attr = inp.attr('attr');
            var url = set.editController != null ? set.editController + '/' : '/admin/';
            url += set.model + "EditAttr";

            var cell = set.rows[ci];
            if (cell.beforeSaveInline != null) {
                var data = s.getDataById(parseInt(id));
                val = cell.beforeSaveInline(data, val);
            }

            s.updateRowValue(tr, attr, val);

            if (text == null) {
                text = val;
            }
            app.postData(url,
                {
                    id: id,
                    value: val,
                    attr: attr
                },
                function (result) {
                    var td = inp.closest('td');
                    console.log(t);
                    if (t == 'price') {
                        text = text.replace(/,/g, '');
                        text = app.formatPrice(text);
                    }
                    td.find('> span').text(text);
                    td.removeClass('editing');
                    app.notify('success', 'Đã lưu thông tin');
                });
        }

        s.displayChilds = function (pid, display, bl) {
            var trs = bl
                ? $(sel).find('> .advance-table > .main-content .area-bl tr')
                : $(sel).find('> .advance-table > .main-content .area-br tr');
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

                        s.setRowEvents();

                        i.removeClass('hide');
                        s.sourceData = $.merge(list, s.sourceData);
                    } else {
                        i.addClass('hide');
                    }
                    arrow.addClass('loaded');
                });
        };

        s.selectContentTab = function (index, tabId) {
            var sc = browser == 'Web' ? $(sel).find('> .advance-table > .sub-content') : $('#sub_content_modal');
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
                    var sc = $(sel).find('> .advance-table > .sub-content');
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
                if (set.height.correlate != null) {
                    var co = set.height.correlate;
                    var th = co.height() - (set.toolbars != null ? 40 : 0);
                    var at = $(sel).find('> .advance-table');
                    at.css('height', th);
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
                    var wh = $(window).height();
                    var th = wh - set.height.top;
                    var at = $(sel).find('> .advance-table');
                    at.css('height', th);
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
                $(sel).find('.areas').css('height', fh);
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
            var tr = $(sel).find('> .advance-table > .main-content .area-tr');
            var br = $(sel).find('> .advance-table > .main-content .area-br');

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
            var hh = set.head.height != null ? set.head.height : 39;
            if (set.filterable) {
                hh += 36;
            }
            if (set.footer == false) {
                ah += 50;
            }
            var mc = $(sel).find('> .advance-table > .main-content');
            mc.css('height', ah + 35);
            var ran = set.size == 'sm' ? 17 : 30;
            mc.find('> .areas').css('height', ah - 15);
            mc.find('> .areas .area-bl').css('height', ah - hh - 16 - ran);
            mc.find('> .areas .area-bl > div').css('height', ah - hh - 16 - ran);
            mc.find('> .areas .area-br').css('height', ah - hh + 1 - ran);
            mc.find('> .areas .area-br > div').css('height', ah - hh + 1 - ran);

        }

        s.setSubContentHeight = function (h) {
            var tc = $(sel).find('.sub-content .tab-content');
            tc.css('height', h - 70);
        }

        s.setPagination = function (total) {
            if (total == 0) {
                $(sel).find(".pagination").css('display', 'none');
            } else {
                var limit = s.searchParams.unlimited ? total : s.searchParams.limit;
                $(sel).find(".pagination").css('display', 'block');
                var pagination = $(sel).find(".pagination");
                $(pagination).html('');
                var startPageIndex;
                var numPage = parseInt(total / limit);
                var li;
                if (total % limit != 0) {
                    numPage++;
                }
                if (s.searchParams.page <= 2) {
                    startPageIndex = 1;
                } else if (s.searchParams.page >= numPage - 3) {
                    startPageIndex = numPage - 4;
                    if (startPageIndex < 1) {
                        startPageIndex = 1;
                    }
                } else {
                    startPageIndex = s.searchParams.page - 2;
                }

                var length = startPageIndex;
                if (set.paging != null) {
                    if (set.paging.pageNumber != null) {
                        length += set.paging.pageNumber;
                    } else {
                        length += 5;
                    }
                }
                if (numPage < 5) {
                    length = startPageIndex + numPage;
                }
                if (length > 1) {
                    if (length > 2) {
                        $(pagination).append('<li><a href="#" class="pre  text-bold"><span>←</span></a></li>');
                    }
                    for (var i = startPageIndex; i < length; i++) {
                        li = '<li>';
                        if (i == s.searchParams.page) {
                            li = '<li class="active">';
                        }
                        li += '<a href="#" page=' + i + ' class="text-bold">' + i + '</a></li>';
                        $(pagination).append(li);
                    }
                    if (length > 2) {
                        $(pagination).append('<li><a href="#" class="next text-bold"><span>→</span></a></li>');
                    }
                }
                $(pagination).find("a").unbind().click(function () {
                    s.searchParams.page = $(this).attr("page");
                    s.loadData();
                    return false;
                });
                $(pagination).find(".pre").unbind().click(function () {
                    if (s.searchParams.page > 1) {
                        s.searchParams.page--;
                        s.loadData();
                    }
                    return false;
                });
                $(pagination).find(".next").unbind().click(function () {
                    if (s.searchParams.page < numPage) {
                        s.searchParams.page++;
                        s.loadData();
                    }
                    return false;
                });
            }
        }

        s.initTable = function () {
            var skip = set.skipCols;
            var h = $(window).height();
            var cgl = '',
                cgr = '',
                wl = 0,
                wr = 0;
            var th;
            var tb = $('<div class="advance-table ' + (set.border ? ' bordered' : '') + (set.subContent != null ? ' has-sub-content' : '') + (set.size != null ? ' advance-table-' + set.size : '') + '"></div>');
            if (app.hasValue(set.height.fix)) {
                tb.css('height', set.height.fix);
            } else {
                tb.css('height', h - set.height.top);
            }

            tb.append('<div class="main-content"><div class="areas ' + (skip > 0 ? 'has-left' : '') + '"><span class="empty-message">Không tìm thấy dữ liệu phù hợp</span></div></div>');
            $(sel).append(tb);

            var hh = set.head.height != null ? set.head.height : 39;
            if (set.filterable) {
                hh += 36;
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
                var cs = set.cols.left;
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
                    for (var j = 0; j < r.length; j++) {
                        var col = r[j];
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


                            if (col.render != null) {
                                th += col.render();
                            } else {
                                th += (col.title != null ? col.title : "&nbsp;");
                            }


                            th += (col.sort != null ? '<i style="margin-left:5px;" class="icon-sort"></i>' : "") +
                                "</th>";
                        }


                    }
                    th += '</tr>';
                }
                th += '</thead>';

                tb.append(th);

                if (set.filterable) {
                    var f = s.rowFilter(true);
                    tb.append('<tbody>' + f + '</tbody>');
                }

                area.css('width', wl + 1).find('> div').append(tb);
            }
            $(sel).find('.areas').append(area);

            // area bottom left
            var ww = $(window).width();
            area = $('<div class="area area-bl" style="width:' + (wl + (ww > 375 ? 18 : 1)) + 'px"></div>');
            area.append(
                '<div><table class="table table-bordered table-hover" style="width:' + wl + 'px"></table></div>');
            area.find('table').append(cgl);
            area.find('table').append('<tbody></tbody>');
            $(sel).find('.areas').append(area);

            var hasOm = set.optionMenu != null && browser == 'Wap';

            // area top right
            skip = set.skipCols;

            area = $('<div class="area area-tr" style="left: ' +
                (wl + 1) +
                'px; height: ' +
                hh +
                'px; ' +
                (hasOm ? 'right: 35px;' : '') +
                '"><div></div></div>');
            tb = $('<table class="table table-bordered"></table>');
            cgr = $('<colgroup></colgroup>');
            wr = 0;

            if (set.checkAll == null || set.checkAll) {
                if (skip == 0) {
                    cgr.append('<col style="width: 40px">');
                    wr += 40;
                } else {
                    skip--;
                }
            }

            for (var k = skip; k < set.head.groups.length; k++) {
                cgr.append('<col i="' + k + '" w="' + set.head.groups[k] + '" style="width: ' + set.head.groups[k] + 'px">');
                wr += set.head.groups[k];
            }
            cgr.append('<col>');

            tb.attr('data-w', wr).css('width', +wr + 'px').append(cgr);

            th = '<thead>';
            skip = set.skipCols;
            var cs = set.cols.right;
            for (var i = 0; i < cs.length; i++) {
                r = cs[i];
                th += '<tr>';
                if (i == 0 && (set.checkAll == null || set.checkAll)) {
                    if (skip == 0) {
                        th += '<th rowspan="' +
                            set.cols.left.length +
                            '" style="height: 31px">' +
                            '<div class="checkbox">' +
                            '<input type="checkbox" class="styled checkAll" /><label></label></div></th>';
                    } else {
                        skip--;
                    }
                }
                for (var j = 0; j < r.length; j++) {
                    var col = r[j];
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
                        var cls = '';
                        if (col.class != null) {
                            cls += col.class;
                        }
                        if (col.color != null) {
                            cls += ' hc-' + col.color + ' ';
                        }


                        if (col.sort != null) {
                            cls += ' orderable ';
                            th += ' orderby="' + col.sort + '" currentOrder="" ';
                        }

                        th += ' ri="' + (i + 1) + '" ci="' + col.ci + '" class="' + cls + '"';

                        th += '>';
                        var txt = '';

                        if (col.render != null) {
                            txt = col.render();
                        } else {
                            txt = (col.title != null ? col.title : "&nbsp;");
                        }

                        if (set.hideable) {
                            th += '<span class="title ' + (col.concat ? 'concat' : 'ell') + '" style=" ">' + txt + '</span>';
                            th += '<span class="th-hide" i="" data-toggle="tooltip" data-placement="right" title="Ẩn cột ' +
                                txt +
                                '" ><i class="icon-shrink7"></i></span>' +
                                '<span class="th-unhide" i=""  data-toggle="tooltip" data-placement="right" title="Bỏ ẩn cột ' +
                                txt +
                                '"><i class="icon-enlarge7"></i></span>';
                        } else {
                            th += '<span class="title" style="">' + txt + '</span>';
                        }


                        th += (col.sort != null ? '<i style="margin-left:5px;" class="icon-sort"></i>' : "") +
                            "</th>";
                    }
                }
                th += '<th>&nbsp;</th>';
                th += '</tr>';
            }
            th += '</thead>';

            tb.append(th);
            if (set.filterable) {
                tb.append('<tbody>' + s.rowFilter(false) + '</tbody>');
            }

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
            cgr = $('<colgroup></colgroup>');
            wr = 0;

            if (set.checkAll == null || set.checkAll) {
                if (skip == 0) {
                    cgr.append('<col style="width: 40px">');
                    wr += 40;
                } else {
                    skip--;
                }
            }

            for (var k = skip; k < set.head.groups.length; k++) {
                cgr.append('<col i="' + k + '" w="' + set.head.groups[k] + '" style="width: ' + set.head.groups[k] + 'px">');
                wr += set.head.groups[k];
            }
            cgr.append('<col>');
            tb.css('width', +wr + 'px').append(cgr).append('<tbody></tbody>');
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


            // sub content

            if (set.subContent != null) {
                var tab = $('<div class="tabbable"></div>');

                var ul = $(
                    '<div class="tabs-group"><div><ul class="nav nav-tabs nav-tabs-bottom"></ul></div></div>');
                var ul2 = '<ul class="dropdown-menu dropdown-menu-right">';
                var tabids = [];
                var ulw = 0;
                for (var l = 0; l < set.subContent.tabs.length; l++) {
                    var t = set.subContent.tabs[l];
                    var tid = app.newGuid(10);
                    ul.find('ul').append(
                        '<li data-pos="' +
                        ulw +
                        '" class="" style="width: ' +
                        t.width +
                        'px">' +
                        '<a data-index="' +
                        l +
                        '" href="#' +
                        tid +
                        '" data-toggle="tab" aria-expanded="true">' +
                        (l + 1) +
                        '. ' +
                        t.title +
                        '</a>' +
                        '</li>');
                    ul2 += '<li><a href="#' +
                        tid +
                        '" class="btn-select-tab">' +
                        (l + 1) +
                        '. ' +
                        t.title +
                        '</a></li>';
                    tabids.push(tid);
                    ulw += t.width;
                }
                ul.find('ul').css('width', ulw);
                ul2 += '</ul>';


                var tc = $('<div class="tab-content"></div>');
                for (var m = 0; m < set.subContent.tabs.length; m++) {
                    var ca = set.subContent.tabs[m];
                    tc.append('<div role="tabpanel" class="tab-pane ' + (ca.class != null ? ca.class : '') + '" id="' +
                        tabids[m] +
                        '"></div>');
                }
                tc.append(
                    '<div class="loading" style="display: none"><i class="icon-spinner10 spinner text-primary"></i></div>');

                if (browser == 'Web') {
                    $(sel).find('.advance-table')
                        .append('<div class="resize" ><button class="btn btn-default btn-expand-main-content"><i class="icon-arrow-down5"></i></button></div>');
                    var sc = $('<div class="sub-content"></div>');
                    tab.append(
                        '<button class="btn btn-default btn-sm btn-scroll-tab-left"><i class="icon-arrow-left5"></i></button>');
                    tab.append(ul);
                    tab.append('<div class="btn-group dropup ">' +
                        '<button class="btn btn-default btn-sm btn-scroll-tab-right"><i class="icon-arrow-right5"></i></button>' +
                        '<button class="btn btn-default btn-sm" data-toggle=\"dropdown\" aria-expanded=\"false\"><i class="icon-more2"></i></button>' +
                        ul2 +
                        '</div>');

                    sc.append(tab);

                    sc.append(tc);

                    $(sel).find('.advance-table').append(sc);

                } else {
                    var scm = 'sub_content_modal';
                    app.createEmptyModal({
                        title: 'Thông tin ' + set.modal.title,
                        width: '100%',
                        headerClass: 'bg-primary',
                        id: scm,
                        noPaddingBody: true
                    });
                    tab.append(ul);
                    tab.append(tc);
                    $('#' + scm + ' .modal-body').html(tab);
                }
            }

            if (set.contextMenu != null) {
                var cm = '<div class="context-menu-popup">' +
                    '<ul class="dropdown-menu">';
                for (var i = 0; i < set.contextMenu.length; i++) {
                    var c = set.contextMenu[i];
                    switch (c) {
                        case 'edit':
                            {
                                cm +=
                                    '<li><a href="#" action="edit"><i class="icon-pencil7 position-left"></i>Cập nhật</a></li>';
                            }
                            break;
                        case 'delete':
                            {
                                cm +=
                                    '<li><a href="#" action="delete"><i class="icon-x position-left"></i>Xóa</a></li> ';
                            }
                            break;
                        case 'deleteStatus':
                            {
                                cm +=
                                    '<li><a href="#" action="delete-status"><i class="icon-x position-left"></i>Xóa</a></li> ';
                            }
                            break;
                        case 'add-child':
                            {
                                cm +=
                                    '<li><a href="#" action="add-child"><i class="icon-stack-plus position-left"></i>Thêm cấp con</a></li> ';
                            }
                            break;
                        case '-':
                            {
                                cm += '<li class="divider" ></li>';
                            }
                            break;
                        case 'sort':
                            {
                                cm += '<li class="divider" ></li> ' +
                                    '<li class="dropdown-header">' +
                                    '<i class="icon-sort position-left"></i>Di chuyển</li>' +
                                    '<li> <a href="#" action="move-top"><i class="position-left"></i>Lên đầu</a></li> ' +
                                    '<li> <a href="#" action="move-bottom"><i class="position-left"></i>Xuống cuối</a></li> ' +
                                    '<li> <a href="#" action="chose-position"><i class="position-left"></i>Chọn vị trí</a></li> ' +
                                    '<li> <a href="#" class="disabled near" action="near-above"><i class="position-left"></i>Liền trên</a></li> ' +
                                    '<li> <a href="#" class="disabled near" action="near-under"><i class="position-left"></i>Liền dưới</a></li> ';
                            }
                            break;
                        default:
                            {
                                if (c.childs != null) {
                                    cm += '<li class="dropdown-submenu dropdown-submenu-hover">';
                                    cm += '<a href="#"><i class="' + c.icon + ' position-left" ></i>' + c.text + '</a>';
                                    cm += '<ul class="dropdown-menu">';
                                    $.each(c.childs,
                                        function () {
                                            cm += '<li> <a href="#"  action="custom" class="' +
                                                this.class +
                                                '">' +
                                                this.text +
                                                '</a></li> ';
                                        });
                                    cm += '</ul>';
                                    cm += '</li>';

                                } else {
                                    cm +=
                                        '<li><a href="#" title="' + c.text + '" action="custom" class="' +
                                        c.class +
                                        '">' +
                                        (c.icon != null ? '<i class="' + c.icon + '"></i>' : '') +
                                        c.text +
                                        '</a></li> ';
                                }
                            }
                            break;
                    }
                }
                cm += '</ul> ' +
                    '</div>';
                $(sel).append(cm);
            }

            s.setStaticEvents();

            if (set.data != null) {
                s.setViewData(set.data);
                s.setRowEvents();
            } else {
                if (set.autoLoad != false) {
                    s.loadData();
                }
            }
        };
        s.initTable();
        return this;
    };
}(jQuery));