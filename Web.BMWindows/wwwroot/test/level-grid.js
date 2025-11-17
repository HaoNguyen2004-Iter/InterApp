
(function ($) {
    $.fn.levelGrid = function (options) {
        console.log('this is levelGrid');
        var s = this;
        var sel = this.selector;
        var currentPage = 0;
        var isLevelGrid = true;
        s.searchParams = {
            keyword: "",
            limit: null
        };
        s.editParams = {};
        s.sourceData = [];
        s.viewData = [];
        s.count = 0;
        s.rowIndex = 0;
        s.sequentially = {
            number: 20,
            total: 0,
            first: false,
            done: false,
            loading: false,
            loaded: 0
        }
        s.aiAlpha = ['', 'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', ' J', 'K'];
        s.formId = '';
        s.sumarray = [];
        s.tounchTr = null;
        s.rowState = null;
        s.moveObjectId = null;
        s.colRight;
        s.searching;
        s.initData = false;
        s.hr = 31;
        s.editLoader = '.salary-grid-edit-loader';
        s.clickSubContextMenu = false;
        // Establish our default settings
        var set = $.extend({
            tableSize: null,
            lazy: null,
            rootUrl: null,
            dataUrl: null,
            params: null,
            autoLoad: null,
            width: null,
            height: null,
            selectRow: null,
            toolbars: null,
            idAttribute: null,
            rows: [],
            reloadAfterEdit: null,
            reloadAfterEditFalse: null,  // 
            cols: null,
            loadMode: null,
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
            hideable: false,
            editInlineCallback: null
        }, options);

        s.set = set;
        if (set.paging != null) {
            s.searchParams.page = set.paging.page != null ? set.paging.page : 1;
            s.searchParams.limit = set.paging.limit != null ? set.paging.limit : 20;
        }
        s.filter = {
            attrs: []
        };

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
            return '<td class="first-col" style="width: 40px"><div class="checkbox checkbox-info">' +
                '<input type="checkbox"  class="styled check-item" value="" dataId="' +
                id +
                '"/><label></label></div></td>';
        }

        s.drawExpandNode = function (level, totalChild) {
            var n = '<button type="button" class="btn btn-icon btn-xs btn-expander expand-child '
                + (totalChild > 0 ? '' : 'not-child') + '" level="' + level + '">';

            if (set.expand >= level) {
                n += '<i class="icon-arrow-down5"></i>';
            } else {
                n += '<i class="icon-arrow-right5"></i>';
            }
            n += '</button>';
            return n;
        };

        s.optimizeStr = function (str) {
            str += '';
            str = str.replace(/</g, "&lt;");
            str = str.replace(/>/g, "&gt;");
            return str;
        }

        s.setTdData = function (item, cell, i, stt, level) {
            var td = '<td data-attr="' + cell.attribute + '" ci="' + i + '"';
            var cls = '', txt = '';
            var hasChild = item.Childs != null && item.Childs.length > 0;
            if (cell.class != null) {
                if ($.isFunction(cell.class)) {
                    cls += ' ' + cell.class(item) + ' ';
                } else {
                    cls += ' ' + cell.class + ' ';
                }
            }
            if (typeof cell.editInline == "function") {

                if (cell.editInline(item)) {
                    cls += ' edit-inline ';
                }
            }
            else {
                if (cell.editInline) {
                    cls += ' edit-inline ';
                }
            }


            if (cell.expandChild) {
                cls += ' expand-child ';
            }

            if (level == 1) {
                cls += ` ${hasChild ? ' text-bold ' : ''} `;
            }


            td += ' class="' + cls + '"';
            td += `style="${hasChild ? '' : ' '} `;
            var sty = '';

            if (cell.style != null) {
                if ($.isFunction(cell.style)) {
                    sty += ' ' + cell.style(item) + ' ';
                } else {
                    sty += cell.style;
                }
            }
            td += sty + '"';

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
                        } else {
                            s.sumarray[i] = null;
                        }

                        td += '>';
                        td += '<div style="">';

                        var v = "";
                        if (cell.attribute != null) {
                            if (item[cell.attribute] != null) {
                                v = item[cell.attribute];
                            }

                        }

                        var txt = s.optimizeStr(v);

                        if (cell.expandChild != null) {
                            td += s.drawExpandNode(level, item.TotalChild);

                            if (item.TotalChild != null && item.TotalChild > 0) {
                                txt += ' (' + item.TotalChild + ')';
                            }
                        }

                        if (cell.editInline != null) {
                            if (typeof cell.editInline == "function") {
                                ei = cell.editInline(item);
                            }
                            else {
                                var ei = cell.editInline;
                            }
                            if (ei == true) {

                                if (txt == '') {
                                    if (cell.placeHolder != null) {
                                        txt = '<span class="text-muted text-placeHolder">' + cell.placeHolder + '</span>';
                                    }
                                }

                                td += `<span class="span-edit-inline" style="${isLevelGrid ? '' : 'font-weight: normal;'}">${txt}</span>`;
                                td += '<div class="form-group inline-form">' +
                                    '<input style="' +
                                    sty +
                                    '" class="form-control control" control-type="text" data-type="text" attr="' +
                                    cell.attribute +
                                    '" value="' +
                                    v +
                                    '" />' +
                                    '</div>';
                            }
                            else {
                                var objValue = null;
                                if (ei.value != null) {
                                    objValue = ei.value(item);
                                }
                                if (objValue != null) {
                                    var v = '';
                                    if ($.isArray(objValue)) {
                                        var arr = [];
                                        $(objValue).each(function () {
                                            arr.push(this.text);
                                        });
                                        v = arr.join('</br>');
                                    } else {
                                        if (objValue.text != null) {
                                            v = objValue.text;
                                        }
                                    }
                                    if (v == '') {
                                        if (cell.placeHolder != null) {
                                            v = '<span class="text-muted text-placeHolder">' + cell.placeHolder + '</span>';
                                        }
                                    }
                                    td += '<span class="span-edit-inline"' + '>' + v + '</span>';
                                } else {
                                    if (cell.render != null) {
                                        txt = cell.render(item);
                                    }
                                    if (txt == '') {
                                        if (ei != false && cell.placeHolder != null) {
                                            txt = '<span class="text-muted text-placeHolder">' + cell.placeHolder + '</span>';
                                        }
                                    }
                                    td += '<span class="span-edit-inline"' + '>' + txt + '</span>';
                                }
                                var select = '<div name="' + cell.attribute + '" data-value="' + (objValue != null && objValue.id != null ? objValue.id : '') +
                                    '"  data-index="' + i + '" id="' + app.newGuid()
                                    + '" control-type="select" class="select-inline control" attr="' + cell.attribute + '" ></div>';
                                td += '<div class="form-group inline-form">' + select + '</div>';
                            }
                        }
                        else {
                            if (cell.render != null) {
                                td += '<span class="span-edit-inline" style="' + sty + '"> ' + cell.render(item) + '</span>';
                            } else {
                                td += '<span ';
                                td += ' class="span-edit-inline" title="' + v + '"';
                                td += '> ' + s.optimizeStr(v) + '</span>';
                            }
                        }
                        td += '</div>';
                    };
                    break;
                case "checkbox":
                    {
                        td += '>';
                        var v = item[cell.attribute];
                        td += '<div class="form-group no-margin">' +
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
                        var v = app.formatDate(item[cell.attribute]);

                        td += ' data-val="' + app.convertVnToEnDate(v) + '"';
                        td += '>';
                        var allowEditDate = false;
                        if (typeof cell.editInline == "function") {
                            var allowEditDate = cell.editInline(item);
                        }
                        else {
                            allowEditDate = true;
                        }
                        if (allowEditDate) {
                            var txt = v;
                            if (txt == '') {
                                if (cell.placeHolder != null) {
                                    txt = '<span class="text-muted text-placeHolder">' + cell.placeHolder + '</span>';
                                }
                            }

                            td += '<span class="span-edit-inline">' + txt + '</span>';
                            td += '<div class="form-group inline-form">' +
                                '<input style="' + sty + '" class="form-control datepicker control" control-type="datepicker" data-type="text" attr="' +
                                cell.attribute +
                                '" value="' + v + '" />' +
                                '</div>';
                        } else {
                            td += '<span class="span-edit-inline">' + v + '</span>';
                        }

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
                case "price":
                case "number":
                    {
                        if (cell.sumable) {
                            if (typeof s.sumarray[i] == "undefined") {
                                s.sumarray[i] = 0;
                            }
                        }

                        var val = 0;
                        if (cell.render != null) {
                            val = cell.render(item, cell.attribute);
                        } else {
                            val = parseFloat(item[cell.attribute]);
                        }

                        td += ' data-val="' + val + '"';

                        td += '>';
                        s.sumarray[i] += val;

                        txt = cell.fixed != null ? val.toFixed(cell.fixed) : Math.round(val);

                        if (cell.renderText != null) {
                            txt = cell.renderText(item);
                        } else {
                            txt = cell.type == 'price' ? app.formatPrice(txt) : txt;
                        }
                        td += '<div>';
                        var ce;
                        if (typeof cell.editInline == "function") {
                            ce = cell.editInline(item);
                        }
                        else {
                            ce = cell.editInline;
                        }
                        if (ce) {
                            var allowEdit = item.Childs == null || typeof this.Childs == 'undefined' || (item.Childs != null && item.Childs.length > 0);
                            td += `<span class="${allowEdit ? 'span-edit-inline' : 'span'}"> ` + txt + '</span>';

                            if (allowEdit) {
                                var stl = cell.style != null ? cell.style : '';
                                td += '<div class="form-group inline-form">' +
                                    '<input style="' +
                                    stl +
                                    '" class="form-control control" control-type="text" data-type="price" attr="' +
                                    cell.attribute +
                                    '" value="' +
                                    app.formatPrice(val) +
                                    '" />' +
                                    '</div>';
                            }

                        } else {
                            td += '<span class="span-edit-inline"> ' + txt + '</span>';
                        }
                        td += '</div>';
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

        s.drawRow = function (item, idAttr, stt, level, gid, pId) {

            var row = { left: '', right: '' };
            var skip = set.skipCols;
            var tr = '<tr data-level="' + level + '" level="' + level + '" ';

            if (set.contextMenu != null) {
                tr += ' data-toggle="context" data-target=".context-table-row" ';
            }
            tr += ' dataid="' + item[idAttr]
                + '" dataParentId="' + (item.ParentId != null ? item.ParentId + '' : '')
                + '"  ai="' + stt + '" gid="' + gid + '" ' + (pId != null ? 'parentId="' + pId + '"' : '');

            var cls = ` style="height: ${set.dataHeight}px" class="tr-child tr-real level-${level} `;
            if (set.expand >= level && item.Childs != null) {
                cls += ' expanded ';
            }

            if (item.Childs != null && item.Childs.length == 2 && level == 2) {
                cls += ' tr-group-2 ';
            }

            if (set.rowStyle != null) {
                tr += ' ' + set.rowStyle(item) + '" ';
            }
            if (set.rowState != null) {
                cls += ' ' + set.rowState(item);
            }
            cls += '"';

            if (set.expand < level - 1) {
                tr += ' style="display: none; " ';
            }

            tr += cls;
            if (typeof item['Code'] != 'undefined') {
                tr += ' datacode="' + item['Code'] + '" ';
            }
            if (item.ParentId != null) {
                tr += ' parent="' + item.ParentId + '" ';
            }
            tr += '>';

            var start, end, cell, v, i;
            var str;

            if (skip > 0) {
                str = '';

                if (skip > 0 && (set.checkAll == null || set.checkAll)) {
                    str += s.drawCheckbox(item.Id);
                    skip--;
                }
                start = 0;
                end = skip;

                for (i = start; i < end; i++) {
                    cell = set.rows[i];
                    str += s.setTdData(item, cell, i, stt, level);
                }
                row.left = tr + str + '<td>&nbsp;</td></tr>';
            }

            str = '';
            start = skip;
            end = set.rows.length;

            for (i = start; i < end; i++) {
                cell = set.rows[i];
                str += s.setTdData(item, cell, i, stt, level);

            }
            row.right = tr + str + '<td>&nbsp;</td></tr>';

            return row;
        }

        s.drawRowWithoutTr = function (item, stt, level) {

            var row = { left: '', right: '' };

            var skip = set.skipCols;
            var tr = '';

            var start, end, cell, v, i;
            var str;

            if (skip > 0) {
                str = '';
                if (skip > 0 && (set.checkAll == null || set.checkAll)) {
                    str += s.drawCheckbox(item.Id);
                    skip--;
                }
                start = 0;
                end = skip;

                for (i = start; i < end; i++) {
                    cell = set.rows[i];
                    str += s.setTdData(item, cell, i, stt, level);
                }
                row.left = tr + str + '<td>&nbsp;</td>';
            }

            str = '';
            start = skip;
            end = set.rows.length;

            for (i = start; i < end; i++) {
                cell = set.rows[i];
                str += s.setTdData(item, cell, i, stt, level);

            }
            row.right = tr + str + '<td>&nbsp;</td>';
            return row;
        }

        s.drawGroup = function (item, idAttr, stt, gid) {

            var skip = set.skipCols;
            var al = $(sel).find('.area-bl table tbody')
            var ar = $(sel).find('.area-br table tbody');
            var sg = set.group;
            var row = { l: '', r: '' };

            // left

            var cls = '';
            if (item.Childs != null && item.Childs.length > 0) {
                cls += ' loaded has-child expanded ';
            }

            if (item.expand > 0) {
                cls += ' expanded ';
            }

            if (set.rowState != null) {
                cls += ' ' + set.rowState(item);
            }

            var str = '<tr dataid="' + item.Id + '" level="1" class="tr-group ' + cls + ' level-1 " gid="' + gid + '" ';

            if (set.contextMenu != null) {
                str += ' data-toggle="context" data-target=".context-table-row" ';
            }
            str += ' > ';
            var start, end, cell, v, i;
            var str;

            if (skip > 0) {
                if (skip > 0 && (set.checkAll == null || set.checkAll)) {
                    //str += s.drawCheckbox(item.Id);
                    str += '<td class="td-checkbox first-col" style=""><div class="checkbox"><input type="checkbox" class="styled check-group" gid="' + gid + '" /><label></label></div></td>';
                    skip--;
                }
                start = 0;
                end = skip;

                for (i = start; i < end; i++) {
                    cell = set.rows[i];
                    str += s.setTdData(item, cell, i, stt, 1);
                }
                str += '<td>&nbsp;</td></tr>';
            }

            if (sg.addable) {
                str += '<button class="btn btn-icon btn-xs btn-add-row bg-primary" groupid="' + item.Id + '" type="button"><i class="icon-plus3"></i></button>';
            }
            str += '</div></td></tr>';

            row.l = str;

            str = '';
            start = skip;
            end = set.rows.length;
            // right
            var tr = '<tr dataid="' + item.Id + '" class="tr-group ' + cls + ' level-1 " gid="' + gid + '" ';

            if (set.contextMenu != null) {
                tr += ' data-toggle="context" data-target=".context-table-row" ';
            }

            tr += ' >';
            for (var k = start; k < end; k++) {
                var r = set.rows[k];
                var sty = r.style != null ? r.style : '';
                sty += '';

                var v = item[r.attribute] != null ? item[r.attribute] : '';

                if (r.sumable) {
                    if (item.Childs?.length > 0) {

                        txt = r.fixed != null ? v.toFixed(r.fixed) : Math.round(v);

                        tr += '<td data-attr="' + r.attribute + '" class="text-bold text-right " style="' + sty + '">' +
                            '<span>' + app.formatPrice(txt) + '</span></td>';
                    } else {
                        tr += s.setTdData(item, r, k, stt, 1);
                    }
                } else {
                    tr += s.setTdData(item, r, k, stt, 1);
                }
            }
            tr += '<td>&nbsp;</td></tr>';

            str += tr;
            row.r = str;
            return row;
        }

        s.drawAddInline = function (item, idAttr, stt) {
            var row = { left: '', right: '' };

            var skip = set.skipCols;
            var tr = '<tr  groupid="' + item.Id + '" class="tr-child tr-add-inline" >';

            var start, end, cell, v, i;
            var str;

            if (skip > 0) {
                str = '';
                if (skip > 0 && (set.checkAll == null || set.checkAll)) {
                    str += '<td>&nbsp;</td>';
                    skip--;
                }
                start = 0;
                end = skip;

                for (i = start; i < end; i++) {
                    cell = set.rows[i];
                    if (cell.addInline || cell.addQuickInline) {
                        str += '<td class="add-inline">';
                        str += `<span class=" ${cell.addQuickInline ? "span-add-auto-inline text-center" : "span-add-inline pl-30"}"><i class="icon-plus3 ${cell.addQuickInline ? "" : "position-left"} "></i>${cell.addQuickInline ? "" : "Thêm mới"}</span>`;
                        if (!cell.addQuickInline)
                            str += '<div class="form-group inline-form">' +
                                '<input style="" stt="' + stt + '" class="form-control pl-20  control" data-type="text" attr="' +
                                cell.attribute +
                                '" value="" />' +
                                '</div>';
                        str += '</td>';
                    } else {
                        str += '<td>&nbsp;</td>';
                    }
                }
                row.left = tr + str + '<td>&nbsp;</td></tr>';

                str = '';
                start = skip;
                end = set.rows.length;
                for (i = start; i < end; i++) {
                    str += '<td>&nbsp;</td>';
                }
                row.right = tr + str + '<td>&nbsp;</td></tr>';
            } else {
                str = '';
                start = 0;
                end = set.rows.length;
                for (i = start; i < end; i++) {
                    cell = set.rows[i];
                    if (cell.addInline || cell.addQuickInline) {
                        str += '<td class="add-inline">';
                        str += `<span class=" ${cell.addQuickInline ? "span-add-auto-inline text-center" : "span-add-inline pl-30"}"><i class="icon-plus3 ${cell.addQuickInline ? "" : "position-left"} "></i>${cell.addQuickInline ? "" : "Thêm mới"}</span>`;
                        if (!cell.addQuickInline)
                            str += '<div class="form-group inline-form">' +
                                '<input style="" stt="' + stt + '" class="form-control pl-20  control" data-type="text" attr="' +
                                cell.attribute +
                                '" value="" />' +
                                '</div>';
                        str += '</td>';
                    } else {
                        str += '<td>&nbsp;</td>';
                    }
                }
                row.right = tr + str + '<td>&nbsp;</td></tr>';
            }
            return row;
        }

        s.drawSuminfo = function (mc) {

            var si = s.set.sumInfo;

            if (set.skipCols > 0) {
                s.set.sumableDisplayTop ?
                    mc.find(".area-bl tbody").prepend('<tr class="warning tr-total"><td colspan="' +
                        set.skipCols +
                        '" style="height: 31px" class="text-bold ">TỔNG CỘNG</td></tr>') :
                    mc.find(".area-bl tbody").append('<tr class="warning tr-total"><td colspan="' +
                        set.skipCols +
                        '" style="height: 31px" class="text-bold ">TỔNG CỘNG</td></tr>')
            }

            var tr = '<tr style="height: 31px" class="warning tr-total">';
            var index = 0;
            if (si.colspan != null) {
                index = si.colspan;
                tr += '<td colspan="' +
                    si.colspan +
                    '" style="text-align: right"><strong>Tổng</strong></td>';
            }
            if (set.skipCols > 0) {
                index += set.skipCols;
            }

            if (set.checkAll) {
                index -= 1;
            }

            var cLabel = -1;
            var tLabel = '';

            if (si.label != null) {
                var cLabel = si.label.col != null ? si.label.col : 0;
                var tLabel = si.label.text != null
                    ? si.label.text
                    : 'TỔNG CỘNG';
            }

            for (var i = index; i < s.set.rows.length; i++) {
                if (i == cLabel) {
                    tr += '<td style="text-align: right"><strong>' + tLabel + '</strong></td>';
                } else {
                    var col = s.set.rows[i];
                    if (col.sumable) {
                        var v = '';
                        if (s.sumarray.length > i) {
                            v = col.fixed != null ? s.sumarray[i].toFixed(col.fixed) : app.formatPrice(s.sumarray[i]);
                        }
                        var td = '<td class="text-right" data-attr="' + col.attribute + '" ';
                        if (col.style != null) {
                            td += 'style="' + col.style + '"';
                        }

                        td += ' ><strong>' +
                            v +
                            '</strong></td>';
                        tr += td;
                    } else {
                        tr += '<td>&nbsp;</td>';
                    }
                }
            }
            tr += '<td></td></tr>';
            s.set.sumableDisplayTop ? mc.find(".area-br tbody").prepend(tr) : mc.find(".area-br tbody").append(tr);

        }

        s.addParent = function (mc) {

            if (set.skipCols > 0) {
                mc.find(".area-bl tbody").append('<tr class=" tr-add-parent"><td colspan="' +
                    set.skipCols +
                    '" style="height: 31px" class="text-bold "><span class=" span-add-parent text-center"><i class="icon-plus3" style="font-size: 10px; margin-right: 10px"></i>Thêm mới</span></td></tr>');

                var tr = '<tr style="height: 31px" class=" tr-add-parent">';

                var cs = set.rows.length - set.skipCols;

                tr += '<td colspan="' + cs + '"></td></tr>';
                mc.find(".area-br tbody").append(tr);
            } else {

                var tr = '<tr class=" tr-add-parent"><td colspan="' +
                    set.rows.length +
                    '" style="height: 31px" class="text-bold "><span class=" span-add-parent text-center"><i class="icon-plus3" style="font-size: 10px; margin-right: 10px"></i>Thêm mới</span></td></tr>'


                mc.find(".area-br tbody").append(tr);
            }

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
                    var td = '<td ';

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
                                        '<button type="button" class="btn btn-default btn-left dropdown-toggle" title="Lộc dữ liệu" ' +
                                        'data-toggle="dropdown"><i class="icon-search4"></i></button>' +
                                        //'<ul class="dropdown-menu">' +
                                        //'<li><a href="javascript:void(0)" class="operator" value="[*]">Chứa</a></li>' +
                                        //'<li><a href="javascript:void(0)" class="operator" value="=">Bằng</a></li>' +
                                        //'<li><a href="javascript:void(0)" class="operator" value=">">Lớn hơn</a></li>' +
                                        //'<li><a href="javascript:void(0)" class="operator" value=">=">Lớn hơn hoặc bằng</a></li>' +
                                        //'<li><a href="javascript:void(0)" class="operator" value="<">Bé hơn</a></li>' +
                                        //'<li><a href="javascript:void(0)" class="operator" value="<=">Bé hơn hoặc bằng</a></li>' +
                                        //'</ul>' +
                                        '</div > ' +
                                        '<input type="text" class="form-control filter-contains" data-index="' + i + '" attr="' +
                                        f.attr +
                                        '" placeholder="...">' +
                                        '</div>';
                                    td += o;
                                }
                                break;
                            case 'option':
                                {
                                    var w = set.head.groups[i];
                                    var o = '<div class="form-group form-group-sm">' +
                                        '<div class="input-group input-group-sm">' +
                                        '<select class="form-control filter-option select-option" attr="' + cell.attribute + '"  data-index="' +
                                        i +
                                        '" data-width="' + w + '" style="width: ' + w + 'px">' +
                                        '<option value="">Tất cả</option>';
                                    if (f.lst != null) {
                                        var data = f.lst();
                                        $(data).each(function () {
                                            o += '<option value="' + this.id + '">' + this.text + '</option>';
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
                                        '<button type="button" class="btn btn-default btn-left dropdown-toggle" ' +
                                        'title="Lộc dữ liệu" data-toggle="dropdown"><i class="icon-filter4"></i></button>' +
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
                                        '<button type="button" class="btn btn-default btn-left dropdown-toggle" ' +
                                        'title="Lộc dữ liệu" data-toggle="dropdown"><i class="icon-filter4"></i></button>' +
                                        '</div>';
                                    o += '<input class="form-control compo-tree" id="' + app.newGuid() + '" data-index="' + i + '" type="text" />';
                                    o += '</div>' +
                                        '</div>';
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

        s.drawChilds = function (a1, g1, level, childs) {
            var r, g, a;
            var c = {
                l: '',
                r: ''
            };
            $(childs).each(function (i, o) {
                g = app.newGuid();
                a = a1 + '.' + (i + 1);
                r = s.drawRow(o, 'Id', a, level, g, g1); // item, idAttr, stt, level, gid, pId
                c.l += r.left;
                c.r += r.right;
                if (o.Childs != null) {
                    var c2 = s.drawChilds(a, g, level + 1, o.Childs);
                    c.l += c2.l;
                    c.r += c2.r;
                }
            });

            return c;
        }

        s.setViewData = function (list) {
            var idAttr = "Id";
            if (set.idAttribute != null) {
                idAttr = set.idAttribute;
            }
            var has, r, ai1, ai2, ai3, ai4, g1, g2, g3;
            var al = $(sel).find('.area-bl table tbody')
            var ar = $(sel).find('.area-br table tbody');

            $.each(list, function (k, item) {
                g1 = app.newGuid();
                ai1 = set.group.aiAlpha ? s.aiAlpha[k + 1] : k + 1;
                var g = s.drawGroup(item, idAttr, ai1, g1);
                al.append(g.l);
                ar.append(g.r);
                var glHtml = al.find('.tr-group[gid="' + g1 + '"]');
                var grHtml = ar.find('.tr-group[gid="' + g1 + '"]');

                if (item.Childs != null) {
                    var c = s.drawChilds(ai1, g1, 2, item.Childs);
                    if (set.addInline) {
                        r = s.drawAddInline(item, idAttr, item.Childs.length);
                        c.l += r.left;
                        c.r += r.right;
                    }
                    $(glHtml).after(c.l);
                    $(grHtml).after(c.r);
                }
            });
        }
        s.clearData = function () {
            var mc = $(sel).find('> .level-table > .main-content');
            mc.find('.area-bl tbody .tr-group').css('background-color', 'red')
            mc.find(".area-bl tbody").html("");
            mc.find(".area-br tbody").html("");
            mc.find(".area-bom tbody").html("");
        }
        s.drawData = function (list, count, callback, eventCallback) {
            if (list) {
                isLevelGrid = list.some(item => item.TotalChild > 0);
            }

            var mc = $(sel).find('> .level-table > .main-content');
            mc.find('.area-bl tbody .tr-group').css('background-color', 'red')
            mc.find(".area-bl tbody").html("");
            mc.find(".area-br tbody").html("");
            mc.find(".area-bom tbody").html("");
            s.sourceData = list;
            s.count = count;
            var r; 

            s.sumarray = [];
            if (set.rows.length > 0) {
                if (list != null && list.length > 0) {
                    s.setViewData(list);

                    setTimeout(function () {
                        s.setRowEvents(eventCallback);
                    }, 100);

                    /*  if (set.loadDataCallback != null) {
                          console.log('loadDataCallback 1')
  
                          set.loadDataCallback();
                      }*/
                    //// draw sum tr 
                    if (s.set.addQuickInline) {
                        s.addParent(mc);
                    }
                    if (s.set.sumInfo != null) {
                        s.drawSuminfo(mc);

                        s.updateTotalRow();
                    }

                    mc.find('.empty-message').css('display', 'none');
                }
                else {
                    setTimeout(function () {
                        s.setRowEvents();
                    }, 400);
                    if (s.set.addQuickInline) {
                        s.addParent(mc);
                    }
                    r = s.drawEmptyRow(true);
                    mc.find(".area-bl tbody").append(r);
                    r = s.drawEmptyRow(false);
                    mc.find(".area-br tbody").append(r);
                    mc.find('.empty-message').css('display', 'block');

                }
            }

            mc.find(" .total-row span").text(count);

            console.log(set.paging);

            if (set.paging != null) {
                mc.find("tfoot").css('display', '');
                s.setPagination(count);
            }
            s.hideTableLoading();
            if (set.loadDataCallback != null) {
                //  console.log('loadDataCallback 2')

                set.loadDataCallback(list);
            }

            if (callback != null) {
                callback(list);
            }
        }

        s.redrawData = function (list, count, callback, eventCallback) {
            if (list) {
                isLevelGrid = list.some(item => item.TotalChild > 0);
            }

            var mc = $(sel).find('> .level-table > .main-content');
            mc.find('.area-bl tbody .tr-group').css('background-color', 'red')
            mc.find(".area-bl tbody").html("");
            mc.find(".area-br tbody").html("");
            mc.find(".area-bom tbody").html("");
            s.sourceData = list;
            s.count = count;
            var r;
             
        }

        s.loadData = function (params, callback, reload) {
            if (params != null) {
                $.extend(s.searchParams, params);
            }
            app.cleanJson(s.searchParams);
            s.showTableLoading();
            $.ajax({
                url: set.url,
                type: "GET",
                dataType: "JSON",
                contentType: 'application/json; charset=utf-8',
                data: s.searchParams,
                success: function (result) {
                    var list = result.Many != null ? result.Many : result;
                    var count = result.Count != null ? result.Count : 0;
                    s.drawData(list, count, callback);
                }
            });

        };

        s.searchGroup = function (gid) {
            if (gid != null && gid.length > 0) {
                s.filter.groupId = parseInt(gid);
            } else {
                s.filter.groupId = null;
            }
            s.search(null);

        }

        s.search = function (par, callback) {

            if (set.filterReload) {

                var c = {};
                for (var j = 0; j < s.filter.attrs.length; j++) {
                    var a = s.filter.attrs[j];
                    c[a.attr] = a.v;
                }

                if (par != null) {
                    $.extend(c, par);
                }

                s.searchParams.page = 1;

                $.extend(s.searchParams, c);

                s.loadData(null, callback);
            } else {

                if (par != null) {
                    $.extend(s.filter, par);
                }

                var mc = $(sel).find('> .level-table > .main-content');

                mc.find('.area tbody tr.tr-add-inline').css('display', 'none');

                var bl = mc.find(' .area-bl tbody');
                bl.find('tr.tr-group').css('display', 'none');

                var br = mc.find(' .area-br tbody');
                br.find('tr.tr-group').css('display', 'none');

                s.showTableLoading();
                setTimeout(function () {

                    var list = [];
                    $(s.sourceData).each(function () {
                        var g = this;
                        var c = 0;
                        $(g.Childs).each(function () {
                            var active = true;
                            var row = this;
                            for (var j = 0; j < s.filter.attrs.length; j++) {
                                var a = s.filter.attrs[j];
                                switch (a.type) {
                                    case 'option':
                                        {
                                            if (a.v != null) {
                                                if (row[a.attr] + '' != a.v) {
                                                    active = false;
                                                }
                                            }
                                        }
                                        break;
                                    case 'contains':
                                        {
                                            if (a.v != null && a.v.length > 0) {
                                                if (row.Keyword != null) {
                                                    if (row.Keyword.indexOf(a.v) < 0) {
                                                        active = false;
                                                    }
                                                } else {
                                                    active = false;
                                                }
                                            }
                                        }
                                        break;
                                }
                            }

                            if (active) {
                                c++;
                                bl.find('tr.tr-child[dataid="' + row.Id + '"]').css('display', 'table-row');
                                br.find('tr.tr-child[dataid="' + row.Id + '"]').css('display', 'table-row');
                            } else {
                                bl.find('tr.tr-child[dataid="' + row.Id + '"]').css('display', 'none');
                                br.find('tr.tr-child[dataid="' + row.Id + '"]').css('display', 'none');
                            }
                        });
                        if (c > 0) {
                            bl.find('tr.tr-group[groupid="' + g.Id + '"]').css('display', 'table-row');
                            br.find('tr.tr-group[groupid="' + g.Id + '"]').css('display', 'table-row');
                        }
                    });

                    s.hideTableLoading();
                }, 300);
            }

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
                            var r = s.drawRow(item, idAttr, 1, k + 1, true);   // item, idAttr, stt, level, gid, pId
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
                //   console.log('loadDataCallback 3')
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

        s.setSubContentHeight = function (h) {
            var tc = $(sel).find('.sub-content .tab-content');
            tc.css('height', h - 70);
        }

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

        s.createOrUpdateObject = function (par, callback, tr) {
            s.showTableLoading();
            if (par == null) {
                par = { id: 0 }

            }
            var url = set.editController != null ? set.editController + '/' : '/admin/';
            url += set.model + "Edit";
            $.extend(s.editParams, par);
            $.ajax({
                url: url,
                type: "GET",
                data: s.editParams,
                dataType: "html",
                success: function (result) {
                    s.hideTableLoading();
                    var m = set.modal;
                    s.initModal({
                        title: (par.id > 0 ? 'Cập nhật ' : 'Thêm mới ') + m.title,
                        width: m.width,
                        type: m.type != null ? m.type : 1,
                        noPaddingBody: m.noPaddingBody,
                        headerClass: m.headerClass,
                        noFooter: m.noFooter,
                        mode: m.mode
                    }, result);
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
            $.each($(sel).find('> .level-table > .main-content .area-br tr'),
                function (k, tr) {
                    if ($(tr).hasClass("active")) {
                        ids.push($(tr).attr("dataid"));
                    }
                });
            return ids;
        }

        s.getCheckedRowIds = function () {
            var ids = [];
            $.each($(sel).find('> .level-table > .main-content .first-col input[type="checkbox"]'),
                function () {
                    if ($(this).prop('checked') == true) {

                        ids.push($(this).closest('tr').attr("dataid"));
                    }
                });
            return ids;
        }

        s.getCheckedRowSingleIds = function () {
            var ids = [];
            var checkedRows = $(sel).find('> .level-table > .main-content .first-col input[type="checkbox"]:checked');

            checkedRows.each(function () {
                var currentId = $(this).closest('tr').find('td[data-attr="STT"]').text();
                var isChild = false;

                checkedRows.each(function () {
                    var parentId = $(this).closest('tr').find('td[data-attr="STT"]').text();

                    // Sử dụng regex để kiểm tra xem currentId có phải là con của parentId hay không
                    var regex = new RegExp('^' + parentId + '\\.');
                    if (currentId.match(regex)) {
                        isChild = true;
                        return false; // Thoát khỏi vòng lặp nếu tìm thấy cha
                    }
                });

                if (!isChild) {
                    ids.push($(this).closest('tr').attr("dataid"));
                }
            });
            return ids;
        };

        s.getCheckedDatas = function () {
            var result = [];
            var idAttr = "Id";
            if (set.idAttribute != null) {
                idAttr = set.idAttribute;
            }
            var ids = s.getCheckedRowIds();
            for (var i = 0; i < ids.length; i++) {
                var v = s.getDataById(ids[i], null);
                result.push(v);
            }
            return result;
        };

        //var obj = {};
        //s.getCopy = function () {
        //    var result = [];
        //    var idAttr = "Id";
        //    if (set.idAttribute != null) {
        //        idAttr = set.idAttribute;
        //    }
        //    var ids = s.getCheckedRowSingleIds();
        //    var dataList = [];
        //    var filter = []
        //    for (var i = 0; i < ids.length; i++) {
        //        var v = s.getDataById(ids[i], null);

        //        dataList.push(v)
        //    }

        //    obj.dataList = dataList
        //    $.each($(sel).find('> .level-table > .main-content .first-col input[type="checkbox"]'), function () {
        //        if ($(this).prop('checked') == true) {
        //            // Đặt trạng thái checked về false
        //            $(this).prop('checked', false);

        //            $(this).closest('.first-col').find('.checkbox .checker span').removeClass('checked');
        //        }
        //    });

        //    app.notify('success', 'Đã sao chép dữ liệu')

        //}

        //s.getPaste = function (data) {
        //    if (data.parentId && obj) {
        //        var url = set.editController != null ? set.editController + '/' : '/admin/';
        //        url += "CopyChild" + set.model + "Row";
        //        obj.parentId = data.parentId;
        //        obj.currentId = data.currentId;
        //        if (data.position) {
        //            obj.isCopyBottom = true;
        //        }
        //        app.postData(url, obj, function (result) {
        //            if (result.Success) {
        //                s.loadData();
        //            } else {
        //                app.notify('warning', result.Message);
        //            }
        //        });

        //    }
        //    obj = {}
        //};
        var obj = {};
        s.getCopy = function () {
            var ids = s.getCheckedRowSingleIds();

            if (ids.length === 0) {
                app.notify('warning', 'Vui lòng chọn dòng để sao chép');
                return;
            }

            var url = (set.editController != null ? set.editController + '/' : '/admin/') + "Copy" + set.model + "Row";

            var model = { Id: ids[0] };

            app.postData(url, model, function (result) {
                if (result.Success) {
                    obj.dataList = result.Data; // dữ liệu bản copy mới từ server
                    app.notify('success', 'Đã sao chép dữ liệu');
                    // Có thể gọi load lại bảng hoặc update UI
                    // s.loadData();
                } else {
                    app.notify('warning', result.Message);
                }
            });
        };
        s.getPaste = function (data) {
            if (data.parentId && obj) {
                var url = set.editController != null ? set.editController + '/' : '/admin/';
                url += "Paste" + set.model + "Row";
                obj.parentId = data.parentId;
                obj.currentId = data.currentId;
                if (data.position) {
                    obj.isCopyBottom = true;
                }
                app.postData(url, obj, function (result) {
                    if (result.Success) {
                        var newItems = result.Data;
                        s.drawData(newItems, newItems.length, null);
                        app.notify('success', 'Đã dán dữ liệu');
                    } else {
                        app.notify('warning', result.Message);
                    }
                });
            }
            obj = {};
        };
        s.setCheckedRowIds = function (ids) {
            var mc = $(sel).find('> .level-table > .main-content');
            for (var i = 0; i < ids.length; i++) {
                var tr = mc.find('.area-bl tr[dataid="' + ids[i] + '"]');
                var checkbox = $(tr).find('.first-col input[type="checkbox"]');
                checkbox.prop('checked', true);
            }
            $.uniform.update();
        }

        s.getSelectedRow = function () {
            var tr = $(sel).find('> .level-table > .main-content .area-br tr[class="active"]').first();
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

        s.getDataById = function (id, list) {
            if (list == null) {
                list = s.sourceData;
            }
            var data;
            for (var i = 0; i < list.length; i++) {
                var o = list[i];
                if (o.Id == id) {
                    data = o;
                    break;
                } else {
                    if (o.Childs != null) {
                        data = s.getDataById(id, o.Childs);
                        if (data != null)
                            break;
                    }
                }
            }
            return data;
        };

        s.getActiveTabIndex = function () {
            var index = $(sel).find('> .level-table > .sub-content > .tab-content > div.active').index();
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

            var mc = $(sel).find('> .level-table > .main-content');
            var rs = $(sel).find('> .level-table > .resize');
            var sc = $(sel).find('> .level-table > .sub-content');

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

            mc.find('.area-br > div').scroll(function (e) {
                if ($(s.tounchTr).length == 0 || $(s.tounchTr).hasClass('area-br')) {
                    clearTimeout($.data(this, "scrollCheck"));
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
                    clearTimeout($.data(this, "scrollCheck"));
                }
            });

            mc.find('.styled').uniform();

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
                var at = $(sel).find('.level-table');
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
                                    s.createOrUpdateObject({ id: id },
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
                            var attr = f.attribute;
                            var w = parseInt(ele.attr('data-width'));

                            if (f.filter.reload) {
                                var p = {};
                                p[attr] = e.val;
                                if (e.val == '') {
                                    p.loadMode = 0;
                                } else {
                                    p.loadMode = 3;
                                }
                                s.loadData(p, function () { }, true);
                            } else {
                                var ex = false;
                                $(s.filter.attrs).each(function () {
                                    if (this.attr == attr) {
                                        switch (f.filter.dataType) {
                                            case 'int':
                                                {
                                                    this.v = e.val != '' ? parseInt(e.val) : null;
                                                }
                                                break;
                                            case 'float':
                                                {
                                                    this.v = e.val != '' ? parseFloat(e.val) : null;
                                                }
                                                break;
                                            default:
                                                {
                                                    this.v = e.val != '' ? e.val : null;
                                                }
                                                break;
                                        }
                                        ex = true;
                                    }
                                });
                                if (!ex) {
                                    s.filter.attrs.push(
                                        {
                                            attr: attr,
                                            type: 'option',
                                            v: e.val != '' ? e.val : null
                                        });
                                }
                                s.searchParams.loadMode = e.val == '' ? 0 : 3;

                                s.search();
                            }
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
                                if (!f.ajax.customData) {

                                    $(result).each(function () {
                                        data.push({
                                            id: this[f.ajax.attr.id],
                                            text: this[f.ajax.attr.text],
                                        });
                                    });
                                }
                                return !f.ajax.customData ? { results: data } : { results: f.ajax.showData(result) };
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
                    var attr = $(this).attr('attr');
                    var ele = $(this);
                    var key = $(this).val();
                    var idex = ele.attr('data-index');
                    var f = set.rows[idex].filter;

                    if (globalTimeout != null) {
                        clearTimeout(globalTimeout);
                    }
                    globalTimeout = setTimeout(function () {
                        if (f.reload) {
                            var par = {};
                            par[attr] = key;
                            s.loadData(par,
                                function () { },
                                true);
                        } else {
                            var e = false;
                            $(s.filter.attrs).each(function () {
                                if (this.attr == attr) {
                                    this.v = key;
                                    e = true;
                                }
                            });
                            if (!e) {
                                s.filter.attrs.push(
                                    {
                                        attr: attr,
                                        type: 'contains',
                                        v: key
                                    });
                            }
                            s.searchParams.loadMode = key == '' ? 0 : 3;
                            s.search();
                        }
                        clearTimeout(globalTimeout);
                    }, 300);
                });
            }

            $(document).on('click', function (e) {

                if (!$(e.target).hasClass('edit-inline')
                    && !$(e.target).hasClass('span-edit-inline')
                    && !$(e.target).hasClass('text-placeHolder')
                    && !$(e.target).hasClass('compo-select3-drop')
                    && !$(e.target).hasClass('compo-select3-mask')
                    && $(e.target).closest(".inline-form").length === 0
                    && $(e.target).closest(".compo-select3-drop").length === 0
                ) {
                    var cell = $(sel).find('.areas tr td.editing');
                    if (cell.length > 0) {
                        var inp = cell.find('.form-control');
                        if (!inp.hasClass('select3')) {
                            var ct = inp.attr('control-type');
                            var nextObj = null;
                            if (ct == 'datepicker') {
                                var tr = cell.closest('tr');
                                var dataId = tr.attr('dataid');
                                var ci = cell.attr('ci');
                                nextObj = {
                                    dataId: dataId,
                                    ci: ci,
                                    next: true
                                };
                            }
                            s.closeEditInline(inp, inp.val(), inp.attr('data-type'), inp.val(), nextObj);
                        } else {
                            var td = inp.closest('td');
                            td.removeClass('editing');
                            inp.prop('disabled', false);
                        }
                    }
                }

                if (!$(e.target).hasClass('add-inline')
                    && !$(e.target).hasClass('span-add-inline')
                    && !$(e.target).hasClass('compo-select3-drop')
                    && !$(e.target).hasClass('compo-select3-mask')
                    && $(e.target).closest(".inline-form").length === 0
                    && $(e.target).closest(".compo-select3-drop").length === 0
                ) {
                    var cell = $(sel).find('.areas tr td.adding');
                    if (cell.length > 0) {
                        var inp = cell.find('.form-control');
                        s.closeAddInline(inp, inp.val(), inp.attr('data-type'));
                    }
                }
            });

            $('[data-toggle="tooltip"]').tooltip({
                html: true
            });

            mc.find('.btn-expand-all').click(function () {
                var btn = $(this);
                var ie = btn.hasClass('expanded');
                var groups = mc.find('tr.tr-group');
                if (ie) {
                    $(groups).each(function () {
                        $(this).removeClass('expanded');
                        var i = $(this).find('td.expand-child .btn.btn-expander i');
                        i.removeClass('icon-arrow-down5').addClass('icon-arrow-right5')
                    })

                    mc.find('tr.tr-child').css('display', 'none');
                    btn.removeClass('expanded');
                    btn.find('i').removeClass('icon-arrow-down5').addClass('icon-arrow-right5')

                } else {
                    $(groups).each(function () {
                        $(this).addClass('expanded');
                        var i = $(this).find('td.expand-child .btn.btn-expander i');
                        i.removeClass('icon-arrow-right5').addClass('icon-arrow-down5')
                    })
                    mc.find('tr.tr-child').css('display', 'table-row');
                    btn.addClass('expanded');
                    btn.find('i').removeClass('icon-arrow-right5').addClass('icon-arrow-down5');
                }
            });
        };

        s.showChild = function (tr, isShow, mc) {
            var mid = $(tr).attr('gid');
            if (isShow) {
                $(tr).css('display', 'table-row');
            } else {
                $(tr).css('display', 'none');
            }
            var childs = mc.find('tr[parentid="' + mid + '"]');
            if (childs.length > 0) {
                if (isShow) {
                    if ($(tr).hasClass('expanded')) {
                        $(childs).each(function () {
                            s.showChild(this, true, mc);
                        });
                    }
                } else {
                    $(childs).each(function () {
                        s.showChild(this, false, mc);
                    });
                }
            }
        }

        s.expand = function (btn, tr, mc) {
            var gid = tr.attr('gid');
            var level = parseInt(tr.attr('level'));
            var i = btn.find('i');
            var trs = mc.find('tr[parentid="' + gid + '"]');
            var isExpanded = tr.hasClass('expanded');

            $(trs).each(function () {
                s.showChild(this, !isExpanded, mc);
            });

            if (isExpanded) {
                tr.removeClass('expanded');
                i.removeClass('icon-arrow-down5').addClass('icon-arrow-right5');
            } else {
                tr.addClass('expanded');
                i.removeClass('icon-arrow-right5').addClass('icon-arrow-down5');
            }

            if (!tr.hasClass('loaded')) {
                var id = tr.attr('dataid');
                s.showTableLoading();
                app.loadData(set.url, {
                    parentId: id,
                    loadMode: 3
                }, null, function (result) {
                    s.hideTableLoading();
                    var list = result.Many != null ? result.Many : result;
                    var glHtml = mc.find('.area-bl tr[gid="' + gid + '"]');
                    var grHtml = mc.find('.area-br tr[gid="' + gid + '"]');
                    var ai1 = tr.find('td:eq(0)').text();

                    var c = s.drawChilds(ai1, gid, level + 1, list); // item, idAttr, stt, level, gid, pId
                    $(glHtml).after(c.l);
                    $(grHtml).after(c.r);

                    $(list).each(function () {
                        s.sourceData.push(this);
                    });

                    setTimeout(function () {
                        s.setRowEvents();
                    }, 400);

                    tr.addClass('loaded');
                });
            }
        }

        s.setRowEvents = function (callback) {
            var mc = $(sel).find('> .level-table > .main-content');

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

            mc.find(".area-bl tr").unbind();

            mc.find(".area-br tr").unbind();

            mc.find(".area-bl tr td").unbind();

            mc.find(".area-br tr td").unbind();
            mc.find(".area-br tr td span").unbind();

            mc.find('.styled').uniform();

            mc.find(".area-bl tr td").click(function (e) {
                if (e.target != this) return;
                s.selectRow($(this).closest('tr'));
            });

            mc.find(".area-br tr td").click(function (e) {
                if (e.target != this) return;
                s.selectRow($(this).closest('tr'));
            });

            mc.find(".area td.edit-inline").click(function (e) {

                if (e.target != this) return;
                if (!$(this).hasClass('editing')) {
                    var td = $(this);
                    var fct = mc.find('.area td.editing .inline-form .control');
                    /*  console.log("fct", fct);*/
                    if (fct.length > 0) {
                        var dataId = $(td).closest('tr').attr('dataid');
                        var ci = parseInt(td.attr('ci'));
                        var ct = fct.attr('control-type');
                        switch (ct) {
                            case 'select': {
                                s.closeEditInline(fct, fct.val(), 'select3', fct.attr('data-text'), {
                                    dataId: dataId,
                                    ci: ci,
                                    next: false
                                });
                            } break;
                            case 'datepicker': {
                                s.closeEditInline(fct, fct.val(), fct.attr('data-type'), fct.val(), {
                                    dataId: dataId,
                                    ci: ci,
                                    next: false
                                });

                            } break;
                            default: {

                                console.log(fct, fct.val(), fct.attr('data-type'), fct.val());

                                s.closeEditInline(fct, fct.val(), fct.attr('data-type'), fct.val(), {
                                    dataId: dataId,
                                    ci: ci,
                                    next: false
                                });
                            } break;
                        }
                    }
                    else {
                        s.activeTdInline(td);
                    }
                  
                  
                    /*  console.log("aaaa");*/
                }
            });

            mc.find("span.span-edit-inline").click(function (e) {
                if (e.target != this) return;
                $(this).closest('td').trigger("click");
            });
            mc.find(".area td.edit-inline .text-placeHolder").click(function (e) {
                if (e.target != this) return;
                $(this).closest('span.span-edit-inline').trigger("click");
            });

            mc.find('.area td.edit-inline input[type="checkbox"]').unbind().change(function (e) {
                if (e.target != this) return;
                s.closeEditInline($(this), $(this).prop('checked'));
            });

            // add inline 
            mc.find(".area td.add-inline").click(function (e) {
                if (e.target != this) return;
                if (!$(this).hasClass('editing')) {
                    var fct = mc.find('.area td.editing > .inline-form .form-control');
                    if (fct.length > 0) {
                        s.closeAddInline(fct, fct.val());
                    }
                    if (!$(this).find('span').hasClass("span-add-auto-inline"))
                        $(this).addClass('adding');


                    var inp = $(this).find('.form-control');
                    if ($(inp).is("select")) {
                        $(inp).trigger('open');
                    } else {
                        inp.focus().select();
                    }
                }
            });

            mc.find(".area tr.tr-add-parent").click(function (e) {
                s.insertRow({
                    insertType: 'Parent',
                    insertPosition: 'Bottom',
                })
            })

            mc.find(".area td.add-inline > span").click(function (e) {
                //if (e.target != this) return;
                $(this).closest('td').trigger("click");
            })

            mc.find('.btn-expander').unbind().click(function () {
                var btn = $(this);
                var tr = btn.closest('tr');
                s.expand(btn, tr, mc);
            });

            mc.find(".area-bl tr").hover(function () {
                var id = $(this).attr('dataid');
                $(this).addClass('hover');
                $(sel).find('.area-br tr[dataid="' + id + '"]').addClass('hover');
            }, function () {
                var id = $(this).attr('dataid');
                $(sel).find('.area-br tr[dataid="' + id + '"]').removeClass('hover');
                $(this).removeClass('hover');
            });

            mc.find(".area-br tr").hover(function () {
                var id = $(this).attr('dataid');
                $(sel).find('.area-bl tr[dataid="' + id + '"]').addClass('hover');
                $(this).addClass('hover');

            }, function () {
                var id = $(this).attr('dataid');
                $(sel).find('.area-bl tr[dataid="' + id + '"]').removeClass('hover');
                $(this).removeClass('hover');
            });


            var addInput = mc.find(".area td.add-inline input");

            addInput.unbind();


            addInput.keyup(function (e) {
                var keycode = (event.keyCode ? event.keyCode : event.which);
                var v = $(this).val(), c, tr, body, ai, nextStr, td;
                if (keycode == 13) {
                    s.closeAddInline($(this));
                }
            });

            mc.find('.btn-add-row').unbind().click(function () {
                var gid = $(this).attr('groupid');
                var tr = $(this).closest('tr');
                var p = {};
                p[set.group.attr] = gid;
                s.createOrUpdateObject(p, null, tr);
            });

            if (set.contextMenu != null) {
                var cmt = $(sel).find('> .context-menu-salary-grid-popup');
                mc.find('.area-br tr[data-toggle="context"]').contextmenu({
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
                                    if (this == 'edit' || this == 'delete') {
                                        var lis = menu.find('a[action="edit"], a[action="delete"]');
                                        if (row.Status != null && row.Status > 0) {
                                            lis.addClass('disabled');
                                        } else {
                                            lis.removeClass('disabled');
                                        }
                                    } else {
                                        li.find('a').removeClass('disabled');
                                    }
                                }
                            } else {
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

                mc.find('.area-bl tr[data-toggle="context"]').contextmenu({
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
                                    li.find('a').removeClass('disabled');
                                }
                            } else {
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
            }

            mc.find(".check-group").unbind().click(function () {
                var gid = $(this).attr('gid');
                var checked = $(this).is(":checked");
                s.checkChilds(gid, checked);

                $.uniform.update();

                if (set.selectRowCallback != null) {
                    set.selectRowCallback();
                }
            });

            mc.find(".checkAll").unbind().click(function () {
                var checked = $(this).is(":checked");
                mc.find('.area-bl td input[type="checkbox"]').prop("checked", checked);
                mc.find('.area-br td input[type="checkbox"]').prop("checked", checked);
                $.uniform.update();

                if (set.selectRowCallback != null) {
                    set.selectRowCallback();
                }
            });

            mc.find('.check-item').click(function () {
                var checked = $(this).is(":checked");
                var id = $(this).closest('tr').attr('gid');
                s.checkChilds(id, checked);
            });
            if (set.height.fixHeight != true) {
                var childs = mc.find('.area-bl tbody tr.tr-child');
                childs.each(function () {
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

            if (callback != null) {
                callback();
            }
        };

        s.activeTdInline = function (td) {
            td.addClass('editing');
            var inp = td.find('.control');
            var ct = inp.attr('control-type');
            switch (ct) {
                case 'select': {
                    var idex = parseInt(inp.attr('data-index'));
                    var r = set.rows[idex];
                    var f = set.rows[idex].editInline;

                    var t = $(td).closest('tr');
                    var id = t.find('td[data-attr="' + r.attribute + '"] .form-control[name="' + r.attribute + '"]').text().trim();
                    var text = t.find('td[data-attr="' + r.attribute + '"].edit-inline span').text();
                    var valueList = { id, text };
                    var data = s.getDataById(t.attr('dataid'));

                    if (typeof set.rows[idex].editInline == "function") {
                        f = set.rows[idex].editInline(data);
                    }
                    if ($.isFunction(f.value)) {
                        var data = s.getDataById(t.attr('dataid'));
                        valueList = f.value(data);
                    }

                    if (!td.hasClass('loaded')) {
                        if (f != null) {
                            var inpId = inp.attr('id');
                            var cl3 = $('#' + inpId).unbind().compoSelect3({
                                placeHolder: f.placeHolder,
                                type: f.type,
                                dropWidth: f.dropWidth,
                                ajax: f.ajax,
                                lst: f.lst,
                                multi: f.multi,
                                value: valueList,
                                moreUrl: f.moreUrl,
                                beforeSearch: f.beforeSearch,
                                selectCallback: function (v, inp) {
                                    var hasChange = inp.hasClass('has-change');
                                    if (hasChange) {
                                        if ($.isArray(v)) {
                                            var ids = [];
                                            var txt = [];
                                            $(v).each(function () {
                                                ids.push(this.id);
                                                txt.push(this.text);
                                            })
                                            s.closeEditInline(inp, ids.join(','), txt.join(','), null, {
                                                next: true
                                            });
                                        } else {
                                            s.closeEditInline(inp, v.id, 'select3', v.text, {
                                                next: true
                                            });
                                        }
                                        if (typeof f.editCallBack == 'function') {
                                            f.editCallBack(v)
                                        }
                                    } else {
                                        var td = inp.closest('td');
                                        td.removeClass('editing');
                                        inp.prop('disabled', false);
                                    }
                                }
                            });
                            td.addClass('loaded');
                            cl3.open();
                            set.rows[idex].editInline.cl3 = cl3;
                        }
                    } else {
                        var cl3 = set.rows[idex].editInline.cl3;
                        if (cl3 != null) {
                            cl3.open();
                        }
                    }

                    //mc.find('.area td.edit-inline select').change(function (e) {
                    //    if (e.target != this) return;
                    //    s.closeEditInline($(this), $(this).val());
                    //});

                } break;
                case 'datepicker': {
                    var idex = parseInt(inp.attr('data-index'));
                    var r = set.rows[idex];
                    var t = $(td).closest('tr');

                    if (!td.hasClass('loaded')) {
                        inp.daterangepicker({
                            singleDatePicker: true,
                            autoUpdateInput: false,
                            locale: {
                                format: 'DD/MM/YYYY',
                                daysOfWeek: daysOfWeek,
                                monthNames: monthNames
                            }
                        }, function (d) {
                            var rf = 'DD/MM/YYYY';
                            console.log(d);
                            $(this.element[0]).val(d.format(rf));
                            //if (prop.onChange != null) {
                            //    prop.onChange(d.format(rf), this.element[0]);
                            //}
                        });

                        var v = inp.val();
                        if (v != null && v != '') {
                            inp.data('daterangepicker').setStartDate(v);
                            inp.data('daterangepicker').setEndDate(v);
                        }
                        inp.focus().select();
                        //td.addClass('loaded')
                    } else {
                        inp.focus().select();
                    }
                } break;
                default: {

                    inp.unbind();
                    console.log(inp.attr('data-type'));
                    if (inp.attr('data-type') == 'price') {
                        console.log(44);
                        //setTimeout(function () {
                        //    inp.mask("#,##0", { reverse: true });
                        //}, 100);
                    }
                    if (inp.attr('data-type') == 'number') {
                        console.log(555);
                        //setTimeout(function () {
                        //    inp.mask("#,##0", { reverse: true });
                        //}, 100);
                    }
                    if (inp.attr('type') == 'checkbox') {
                        inp.change(function (e) {
                            if (e.target != this) return;
                            s.closeEditInline($(this), $(this).prop('checked'));
                        });
                    }

                    inp.keyup(function (e) {
                        var keycode = (event.keyCode ? event.keyCode : event.which);
                        console.log(123123);
                        var v = $(this).val();
                        console.log(keycode, v);

                        if (keycode == 13) { 
                            s.closeEditInline($(this), v, null, null, {
                                next: true
                            });
                        }
                    });

                    inp.focus().select();

                } break;
            }
        }

        s.checkChilds = function (gid, checked) {
            var mc = $(sel).find('> .level-table > .main-content');
            var childs = mc.find(' .area-bl tr[parentid="' + gid + '"] ');
            if (childs.length > 0) {
                $(childs).each(function () {
                    var id = $(this).attr('gid');
                    s.checkChilds(id, checked);

                    $(this).find('input.check-item').prop('checked', checked);

                    $.uniform.update();
                });
            }
        }

        s.clearCheckbox = function () {
            var mc = $(sel).find('> .level-table > .main-content');
            mc.find(".checkAll").prop('checked', false);
            mc.find(".check-group").prop('checked', false);
            $.uniform.update();
        }

        s.clickContextMenu = function (context, e) {
            var a = $(e.target);
            if (!a[0].hasAttribute('action')) {
                a = $(e.target).closest('a');
            }
            var tr = $(context.context);
            var act = a.attr('action');
            var cls = a.attr('class');

            switch (act) {
                case 'edit':
                    {
                        var id = $(tr).attr('dataid');
                        s.createOrUpdateObject({ id: id }, function () { }, $(tr));
                    }
                    break;
                case 'delete':
                    {
                        var id = $(tr).attr('dataid');
                        s.deleteObjects('bulk',
                            [id],
                            function () {
                                s.loadData();
                            });
                    }
                    break;
                case 'insert-child':
                    {
                        s.insertRow({
                            insertType: 'Child',
                            currentId: tr.attr('dataid'),
                            id: null
                        }, tr)
                    }
                    break;
                case 'insert-top':
                    {
                        s.insertRow({
                            insertType: 'Near',
                            insertPosition: 'Top',
                            currentId: tr.attr('dataid'),
                            parentId: tr.attr('parent')
                        }, tr)
                    }
                    break;
                case 'insert-bottom':
                    {
                        s.insertRow({
                            insertType: 'Near',
                            insertPosition: 'Bottom',
                            currentId: tr.attr('dataid'),
                            parentId: tr.attr('parent')
                        }, tr)
                    }
                    break;
                case 'copy':
                    {
                        s.getCopy();

                    }
                    break;
                case 'pastChild':
                    {
                        s.getPaste({ parentId: tr.attr('dataid'), currentId: tr.attr('dataid'), position: false });
                    }
                    break;
                case 'pastBottomPosition':
                    {
                        s.getPaste({ parentId: tr.attr('parent'), currentId: tr.attr('dataid'), position: true });
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
            if (data != null) {
                data[attr] = v;

                var i;

                for (i = 0; i < set.rows.length; i++) {
                    var cell = set.rows[i];

                    if (cell.type == 'date') {
                        var v = data[cell.attribute];
                        if (v != null) {
                            v = moment(v).format('MM/DD/YYYY');
                            data[cell.attribute] = v;
                        }
                    }

                    if (cell.formula != null) {
                        var v = cell.formula(data);
                        var txt = v;
                        var td = tr.find('td[data-attr="' + cell.attribute + '"]');

                        txt = cell.fixed != null ? txt.toFixed(cell.fixed) : Math.round(txt);
                        txt = cell.type == 'price' ? app.formatPrice(txt) : txt;

                        td.attr('data-val', v);
                        $(td.find('span')).text(txt);
                        $(td.find('input')).val(txt);
                        data[cell.attribute] = v;
                    }
                }

                s.setDataById(data, null);
                return data;
            }
            return null;
        }

        s.setDataById = function (data, list) {
            if (list == null) {
                list = s.sourceData;
            }
            for (var i = 0; i < list.length; i++) {
                if (list[i].Id == data.Id) {
                    list[i] = data;
                    return;
                } else {
                    if (list[i].Childs != null) {
                        s.setDataById(data, list[i].Childs);
                    }
                }
            }
        };

        s.selectContentTab = function (index, tabId) {
            var sc = browser == 'Web' ? $(sel).find('> .level-table > .sub-content') : $('#sub_content_modal');
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
        s.getChildsByParentId = function (pid, list) {
            var items = [];
            if (list == null) {
                list = s.sourceData;
            }
            $(list).each(function () {
                if (this.Id == pid) {
                    items = this.Childs;
                } else {
                    if (this.Childs != null) {
                        items = s.getChildsByParentId(pid, this.Childs);
                    }
                }
            });
            return items;
        }

        s.updateSumableValue = function (tr) {
            var gid = $(tr).attr('gid');
            var mc = $(sel).find('> .level-table > .main-content');
            var childs = mc.find('.area tr[parentid="' + gid + '"]');
            if (childs.length > 0) {
                $(childs).each(function () {
                    s.updateSumableValue(this);
                });

                for (var k = 0; k < set.rows.length; k++) {
                    var r = set.rows[k];
                    if (r.sumable) {
                        var v = 0;
                        $(childs).each(function () {
                            var x = $(this).find('td[data-attr="' + r.attribute + '"]').attr('data-val');
                            //x = x.replace(/\,/g, ''); 
                            if (app.hasValue(x) && $.isNumeric(x)) {
                                v += parseFloat(x);
                            }
                        });

                        $(tr).find('td[data-attr="' + r.attribute + '"]').attr('data-val', v);
                        $(tr).find('td[data-attr="' + r.attribute + '"] input.form-control').val(v);
                        $(tr).find('td[data-attr="' + r.attribute + '"] span').text(r.fixed != null ? v.toFixed(r.fixed) : app.formatPrice(v));

                    }
                }
            }
        }

        s.updateTotalRow = function () {
            for (var i = 0; i < set.rows.length; i++) {
                var cell = set.rows[i];
                if (cell.sumable) {
                    var total = 0;
                    $(s.sourceData).each(function () {
                        var row = this;
                        var v = $('.area .tr-group[dataid="' + row.Id + '"] td[data-attr="' + cell.attribute + '"] span').text();
                        v = v.replace(/,/g, '');
                        v = parseFloat(v);
                        total += v;
                    });
                    total = cell.fixed != null ? total.toFixed(cell.fixed) : app.formatPrice(Math.round(total));
                    $('.tr-total td[data-attr="' + cell.attribute + '"] strong').text(total);
                    if (cell.sumableParam) {
                        cell.sumableParam(total)
                    }
                }
            }
        }

        s.optimizeData = function (data) {
            for (var i = 0; i < set.rows.length; i++) {
                var a = set.rows[i];
                var v = data[a.attribute];
                if (v != null) {
                    data[a.attribute] = s.optimizeStr(v);
                }
            }
            return data;
        }

        s.closeEditInline = function (inp, v, type, txt, nextActive) {

            console.log(v, type, txt, nextActive);

            var tr = inp.closest('tr');
            var attr = inp.attr('attr');
            var t = inp.attr('data-type');
            var td = inp.closest('td');
            var ci = parseInt($(td).attr('ci'));
            var ct = inp.attr('control-type');
            var cell = set.rows[ci];

            var row = {};

            if (t == 'price') {
                v = v.replace(new RegExp(',', 'g'), '');
                if (!$.isNumeric(v)) {
                    v = '0';
                    inp.val(v);
                } else {
                    v = v.replace(/,/g, '');
                    v = parseFloat(v);

                    if (cell.min != null) {
                        if (v < cell.min) {
                            v = cell.min;
                        }
                    }
                    if (cell.max != null) {
                        if (v > cell.max) {
                            v = cell.max;
                        }
                    }
                    inp.val(v);
                }
            }

            if (ct == 'datepicker') {
                if (v.length > 0) {
                    v = app.convertVnToEnDate(v);
                }
            }

            if (cell != null) {
                if (cell.warningClass != null) {
                    row[cell.attribute] = v;
                    cell.warningClass(row).status ?
                        td.addClass(cell.warningClass(row).name) :
                        td.removeClass(cell.warningClass(row).name)
                }
            }

            inp.prop('disabled', true);

            td.attr('data-val', v);
            console.log(v);
            var data = s.updateRowValue(tr, attr, v);
            data = s.optimizeData(data);
            var dataId = data.Id;
            var mc = $(sel).find('> .level-table > .main-content');
            var trs = $(sel).find('> .level-table > .main-content .area .tr-group');
            var arrTotal = [];

            $(trs).each(function () {
                var p = this;
                var gid = $(p).attr('gid');
                var childs = mc.find('.area tr[parentid="' + gid + '"]');
                s.updateSumableValue(p);
                for (var k = 0; k < set.rows.length; k++) {
                    var r = set.rows[k];
                    if (r.sumable) {
                        if ($(childs).length > 0) {
                            var v = 0;
                            $(childs).each(function () {
                                var x = $(this).find('td[data-attr="' + r.attribute + '"]').attr('data-val');
                                if (app.hasValue(x) && $.isNumeric(x)) {
                                    v += parseFloat(x);
                                }
                            });

                            $(p).find('td[data-attr="' + r.attribute + '"] input.form-control').val(v);
                            $(p).find('td[data-attr="' + r.attribute + '"] span').text(r.fixed ? v.toFixed(2) : app.formatPrice(v));
                            if (r.editInlineReDrawCol && $(p).find('td[data-attr="' + r.attribute + '"] span').text() != '') {
                                arrTotal.push(v)
                            }
                        }
                    }
                }
            });

            //s.updateSumableValue();

            var url = set.editController != null ? set.editController + '/' : '/admin/';
            url += set.model + "EditRow";

            if (set.params.edit != null) {
                $.extend(data, set.params.edit);
            }

            $(s.editLoader).show();

            console.log(data);
            //data = null;
            if (data != null) {
                data.Childs = null;

                $('.daterangepicker.dropdown-menu').remove();

                app.postData(url, data, function (result) {
                    if (result.Success) {
                        if (set.reloadAfterEdit) { // vẽ lại toàn bộ
                            var list = result.Data.Many != null ? result.Data.Many : result.Data;
                            var count = data.Count != null ? data.Count : list.length;
                            console.log(list);
                            s.drawData(list, count, null, function () {
                                if (nextActive != null) {
                                    if (nextActive.next) {
                                        nextActive.dataId = dataId;
                                        nextActive.ci = ci;
                                    }
                                    s.editNextCell(nextActive);
                                }
                            });
                            if (set.editInlineCallback != null) {
                                set.editInlineCallback(list);
                            }
                        }
                        else {
                            var td = inp.closest('td');
                            td.removeClass('editing');
                            inp.prop('disabled', false);
                            $(s.editLoader).hide();

                            if (cell.editInline.reDraw || cell.editInlineReDraw) { // vẽ 1 dòng
                                if (result.Data != null) {
                                    data = $.extend(data, result.Data);

                                    var ai = tr.attr('ai');
                                    var level = tr.attr('data-level');
                                    var r = s.drawRowWithoutTr(data, ai, level);

                                    var mc = $(sel).find('> .level-table > .main-content');
                                    var gid = tr.attr('gid');
                                    mc.find('.area-bl tr[gid="' + gid + '"]').html(r.left);
                                    mc.find('.area-br tr[gid="' + gid + '"]').html(r.right);
                                    s.setRowEvents();
                                }
                            }
                            else {
                                if (result.Success) {
                                    app.notify('success', 'Cập nhật thành công');
                                    if (txt != null) {
                                        td.find('.span-edit-inline').text(txt);
                                    }
                                    else {
                                        if (t == 'price') {
                                            v = app.formatPrice(v);
                                        }
                                        if (cell.expandChild) {
                                            if (data.TotalChild != null && data.TotalChild > 0) {
                                                v += ' (' + data.TotalChild + ')';
                                            }
                                        }
                                        td.find('.span-edit-inline').text(v);
                                    }
                                }
                                else {
                                    app.notify('warning', result.Message)   
                                }
                            }

                            if (cell.editInline.condition) {
                                if (result.Success) {
                                    if (result.Success) {
                                        app.notify('success', 'Cập nhật thành công');
                                        data = $.extend(data, result.Data);
                                        if (cell.editInline.condition && cell.editInline.condition(result.Data)) {
                                            td.addClass(cell.editInline.className);
                                        } else {
                                            td.removeClass(cell.editInline.className);
                                        }
                                    } else {
                                        if (result.Message != "" && result.Message != null) {
                                            app.notify('warning', result.Message);
                                        }
                                    }
                                }
                            }

                            if (cell.updateChild) {
                                var gid = tr.attr('gid');
                                var level = 1;
                                if (tr.attr('data-level'))
                                    level = tr.attr('data-level');

                                updateChildValues(gid, cell.attribute, v, Number(level));
                            }
                            if (cell.editInlineReDrawCol) {
                                var tdsf = $(sel).find(`td[data-attr="${cell.editInlineReDrawCol.attributeFrom}"]:not(.tr-group td)`);
                                var tdst = $(sel).find(`td[data-attr="${cell.editInlineReDrawCol.attributeTo}"]:not(.tr-group td)`);

                                var valueStrongElement = $('.tr-total td[data-attr="' + cell.editInlineReDrawCol.attributeFrom + '"] strong').text();
                                var stringToInt = valueStrongElement.replace(/,/g, '');
                                var total = parseInt(stringToInt, 10);
                                tdsf.each(function (index) {
                                    var currentTd = $(this);
                                    if (currentTd.hasClass('edit-inline')) {
                                        var numberWithCommaRemoved = currentTd.text().replace(/,/g, '');
                                        var numberValue = parseFloat(numberWithCommaRemoved);
                                        $(tdst[index]).find('.span-edit-inline').text((numberValue / total * 100).toFixed(2))
                                        $(tdst[index]).find('.form-group').text((numberValue / total * 100).toFixed(2))
                                        $(tdst[index]).attr('data-val', (numberValue / total * 100).toFixed(2))
                                    }
                                });
                                var trs = $(sel).find('> .level-table > .main-content .area .tr-group');
                                $(trs).each(function () {
                                    var p = this;
                                    s.updateSumableValue(p);
                                })
                                s.updateTotalRow();

                            }
                            if (cell.editInline.editCallback != null) {
                                cell.editInline.editCallback();
                            }
                            s.updateTotalRow();
                            td.removeClass('editing');

                            if (nextActive != null) {
                                if (nextActive.next) {
                                    nextActive.dataId = dataId;
                                    nextActive.ci = ci;
                                }
                                s.editNextCell(nextActive);
                            }
                        }

                        app.notify('success', 'Đã lưu thông tin');
                    }
                    else {
                        var td = inp.closest('td');
                        td.removeClass('editing');
                        inp.prop('disabled', false);
                        $(s.editLoader).hide();
                        app.notify('warning', result.Message);

                        //reloadAfterEdit cả false
                        if (set.reloadAfterEditFalse) {
                            var list = result.Data.Many != null ? result.Data.Many : result.Data;
                            var count = data.Count != null ? data.Count : list.length;
                            s.drawData(list, count, null, function () {
                                if (nextActive != null) {
                                    if (nextActive.next) {
                                        nextActive.dataId = dataId;
                                        nextActive.ci = ci;
                                    }
                                    s.editNextCell(nextActive);
                                }
                            });
                            if (set.editInlineCallback != null) {
                                set.editInlineCallback(list);
                            }
                        }
                    }
                });
            } else {
                var td = inp.closest('td');
                td.removeClass('editing');
                inp.prop('disabled', false);
                $(s.editLoader).hide();
            }
        }

        s.editNextCell = function (o) {
            var mc = $(sel).find('> .level-table > .main-content');
            var tr = mc.find('tr[dataid="' + o.dataId + '"]');
            var nextTd;

            var cells = set.rows;

            if (o.next) {
                var tds = tr.find('td.edit-inline');
                for (var i = 0; i < tds.length; i++) {
                    var td = tds[i];
                    var ci = parseInt($(td).attr('ci'));
                    if (ci > o.ci) {
                        var c = cells[ci];
                        if (c.disableNextEdit != true) {
                            nextTd = $(td);
                            break;
                        }
                    }
                }
            } else {
                nextTd = tr.find('td[ci="' + o.ci + '"]');
            }

            if (nextTd != null) {
                s.activeTdInline($(nextTd));
            }
        }

        s.updateChildValues = function (gid, attribute, v, level) {
            $(`.area-bl tr[parentid="${gid}"]`).each(function () {
                var spanElement = $(this).find(`td[data-attr="${attribute}"] > div > span`);
                var inputElement = $(this).find(`td[data-attr="${attribute}"] > div > div > input`);

                if (spanElement.length > 0) {
                    var currentValue = spanElement.text();
                    var newValue = [v, ...currentValue.split('.').slice(level)].join(".");
                    spanElement.text(newValue);
                    inputElement.val(newValue);
                }

                var childGid = $(this).attr('gid');
                s.updateChildValues(childGid, attribute, v, level);
            });
        }

        s.closeAddInline = function (inp) {
            var v = inp.val();
            var attr = inp.attr('attr');
            var tr = inp.closest('tr');
            var gid = parseInt(tr.attr('groupid'));
            var lstt = parseInt(inp.attr('stt'));
            var td = inp.closest('td');
            var span = tr.find('td span');

            if (v && v.length > 0) {

                var url = set.editController != null ? set.editController + '/' : '/admin/';
                url += set.model + "addRow";

                var data = {
                    stt: lstt + 1
                };
                data[attr] = v;
                data[set.relateId] = gid;
                if (set.params.add != null) {
                    $.extend(data, set.params.add);
                }
                $(inp).prop('disabled', true);
                $(s.editLoader).show();

                app.postData(url, data,
                    function (result) {
                        $(s.editLoader).hide();

                        if (result.Success) {
                            var c = result.Data;
                            var al = $('.area-bl table tbody');
                            var ar = $('.area-br table tbody');
                            $(s.sourceData).each(function () {
                                if (this.Id == gid) {
                                    var r = s.drawRow(c, 'Id', this.Childs.length + 1, gid);
                                    if (this.Childs.length > 0) {
                                        var glHtml = al.find('.tr-child.tr-real[groupid="' + gid + '"]').last();
                                        var grHtml = ar.find('.tr-child.tr-real[groupid="' + gid + '"]').last();

                                        $(glHtml).after(r.left);
                                        $(grHtml).after(r.right);
                                    } else {
                                        var glHtml = al.find('.tr-group[groupid="' + gid + '"]');
                                        var grHtml = ar.find('.tr-group[groupid="' + gid + '"]');
                                        $(glHtml).after(r.left);
                                        $(grHtml).after(r.right);
                                    }

                                    this.Childs.push(c);
                                }
                            });

                            $(inp).attr('stt', lstt + 1);
                        } else {
                            app.notify('warning', result.Message);
                        }

                        $(inp).val('').prop('disabled', false);
                        td.removeClass('adding');

                        s.setRowEvents();
                    });
            }
            else {
                td.removeClass('adding');
            }
        }

        s.displayChilds = function (pid, display, bl) {
            var trs = bl
                ? $(sel).find('> .level-table > .main-content .area-bl tr')
                : $(sel).find('> .level-table > .main-content .area-br tr');
            trs.each(function () {
                var p = $(this).attr('parent');
                if (p == pid) {
                    $(this).css('display', display);
                    s.displayChilds($(this).attr('dataid'), display, bl);
                }
            });
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
                    var sc = $(sel).find('> .level-table > .sub-content');
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
                    var at = $(sel).find('> .level-table');
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
                    var at = $(sel).find('> .level-table');
                    at.css('height', th);
                    if (set.subContent && browser == 'Web') {
                        if (at.hasClass('expand')) {
                            s.setMainTableHeight(th - 35);
                        } else {
                            s.setMainTableHeight(parseInt(th / 2));
                        }
                        s.setSubContentHeight(parseInt(th / 2));
                    } else {
                        s.setMainTableHeight(th);
                    }
                }
            }
            else {
                s.setMainTableHeight(fh);
            }
            if (fw == null) {
                s.setMainTableWidth();
            }
        };

        s.setMainTableWidth = function () {
            var tr = $(sel).find('> .level-table > .main-content .area-tr');
            var br = $(sel).find('> .level-table > .main-content .area-br');

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
            var hh = set.head.height != null ? set.head.height : 32;
            if (set.filterable) {
                hh += 37;
            }
            if (set.footer == false) {
                ah += 50;
            }
            var mc = $(sel).find('> .level-table > .main-content');
            mc.css('height', ah + 35);
            //mc.find('> .areas').css('height', ah);
            //mc.find('> .areas .area-bl').css('height', ah - hh - 18);
            //mc.find('> .areas .area-bl > div').css('height', ah - hh - 2);
            //mc.find('> .areas .area-br').css('height', ah - hh - 1);
            //mc.find('> .areas .area-br > div').css('height', ah - hh - 2);

            var ran = set.size == 'sm' ? 17 : 52;
            mc.find('> .areas').css('height', ah - 50);
            mc.find('> .areas .area-bl').css('height', ah - hh - 16 - ran);
            mc.find('> .areas .area-bl > div').css('height', ah - hh - ran);
            mc.find('> .areas .area-br').css('height', ah - hh + 1 - ran);
            mc.find('> .areas .area-br > div').css('height', ah - hh + 1 - ran);

        }

        s.setPagination = function (total) {
            if (total == 0) {
                $(sel).find(".pagination").css('display', 'none');
            }
            else {
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
            if (set.height.row != null) {
                s.hr = set.height.row;
            }

            var skip = set.skipCols;
            var sg = set.group;
            var h = $(window).height();
            var cgl = '',
                cgr = '',
                wl = 0,
                wr = 0;
            var th, cs;
            var tb = $('<div class="level-table expand ' + (set.border ? 'bordered' : '') + (set.subContent != null ? ' has-sub-content' : '') + ' ' + (set.evenColor ? 'even-color' : '') + '"></div>');
            if (app.hasValue(set.height.fix)) {
                tb.css('height', set.height.fix);
            } else {
                tb.css('height', h - set.height.top);

            }

            tb.append(`<div class="main-content"><div class="areas ${skip > 0 ? 'has-left' : ''}"><span class="empty-message" style="display: none">Không tìm thấy dữ liệu phù hợp</span></div></div>`);
            $(sel).append(tb);

            var hh = set.head.height != null ? set.head.height : 32;
            if (set.filterable) {
                hh += 37;
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
                            '<div class="checkbox"><input type="checkbox" class="styled checkAll" /><label></label></div></th>';
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


                            th += (col.sort != null ? '<i style="margin-left:5px;" class="fa fa-caret-down"></i>' : "") +
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
            area = $('<div class="area area-bl" style="width:' + (wl + (ww > 375 ? 19 : 1) - 3) + 'px"></div>');
            area.append(
                '<div><table class="table table-bordered table-hover" style="width:' + wl + 'px"></table></div>');
            area.find('table').append(cgl);

            var tbody = '<tbody>';

            if (sg != null) {
                var top = 0;
                $(sg.data).each(function () {
                    var gr = this;
                    var h = 0;
                    h = s.hr * gr.totalChild;
                    var p2 = top + h + s.hr;

                    tbody += '<tr class="tr-group expanded ' +
                        (gr.class != null ? gr.class : '') +
                        '" groupid="' + gr.id + '"  data-p1="' + top + '" data-p2="' + p2 + '">' +
                        '<td colspan="' + ((set.checkAll == null || set.checkAll) ? skip + 1 : skip) +
                        '" class="' + (gr.class != null ? gr.class : '') + '" ' +
                        'style="height:' + s.hr + 'px">';
                    tbody += '<div>';
                    if (set.checkAll) {
                        tbody +=
                            '<div class="checkbox"><input type="checkbox" class="styled check-group" groupid="' + gr.id + '" /><label></label></div>';
                    }
                    tbody += '<button class="btn btn-icon btn-xs btn-expander"><i class="icon-arrow-down5"></i></button> ';

                    if (sg.render != null) {
                        tbody += sg.render(gr);
                    } else {
                        tbody += this.text;
                    }
                    if (sg.addable) {
                        tbody +=
                            '<button class="btn btn-icon btn-xs btn-add-row bg-primary" groupid="' + gr.id + '" type="button"><i class="icon-plus3"></i></button>';
                    }
                    tbody += '</div></td></tr>';
                    tbody += '<tr class="tr-group-overload tr-group-overload-top"  groupid="' + gr.id + '" style = "display: none"><td style="height: 0px">&nbsp;</td></tr>';
                    tbody += '<tr class="tr-group-overload tr-group-overload-bot"  groupid="' + gr.id + '" ' + (gr.totalChild == 0 ? 'style="display: none"' : '') + '><td style="height: ' + h + 'px">&nbsp;</td></tr>';

                    top += h + s.hr;
                });
            } else {
            }

            tbody += '</tbody>';
            area.find('table').append(tbody);

            $(sel).find('.areas').append(area);

            var hasOm = set.optionMenu != null && browser == 'Wap';

            // area top right
            skip = set.skipCols;

            area = $('<div class="area area-tr" style="left: ' +
                wl +
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
            cs = set.cols.right;
            for (var i = 0; i < cs.length; i++) {
                r = cs[i];
                th += '<tr>';

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

                        th += 'class="' + cls + '" ri="' + (i + 1) + '" ci="' + col.ci + '" >';


                        if (col.expandAll != null) {
                            th += '<button type="button" class="btn btn-xs btn-expand-all expanded"><i class="icon-arrow-down5"></i></button>'
                        }

                        if (col.note != null) {
                            th += '<span class="th-tooltip"><i class="icon-info22" data-toggle="tooltip" data-placement="bottom" title="' + col.note + '"></i></span>';
                        }

                        th += '<span class="title">';
                        var txt = '';
                        if (col.render != null) {
                            txt = col.render();
                        } else {
                            txt = (col.title != null ? col.title : "&nbsp;");
                        }
                        th += txt;

                        th += '</th>';
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
                wl +
                'px;' +
                (hasOm ? 'right: 35px;' : '') +
                '"><div></div></div>');
            tb = $('<table class="table table-bordered table-hover"></table>');
            cgr = $('<colgroup></colgroup>');
            wr = 0;

            if (set.checkAll == null || set.checkAll) {
                if (skip == 0) {
                    cgr.append('<col style="width: 40px" w="40">');
                    wr += 40;
                } else {
                    skip--;
                }
            }

            s.colRight = set.head.groups.length - skip;

            for (var k = skip; k < set.head.groups.length; k++) {
                cgr.append('<col i="' + k + '" w="' + set.head.groups[k] + '" style="width: ' + set.head.groups[k] + 'px">');
                wr += set.head.groups[k];
            }
            cgr.append('<col>');

            tbody = '<tbody>';

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
            // sub content 
            if (set.subContent != null) {
                var tab = $('<div class="tabbable"></div>');

                var ul = $('<div class="tabs-group"><div><ul class="nav nav-tabs nav-tabs-bottom"></ul></div></div>');
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


                $(sel).find('.level-table')
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

                $(sel).find('.level-table').append(sc);
            }

            if (set.contextMenu != null) {
                var cm = '<div class="context-menu-salary-grid-popup">' +
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
                        case 'insertChild':
                            {
                                cm +=
                                    '<li><a href="#" action="insert-child"><i class="icon-add-to-list position-left"></i>Thêm cấp con</a></li> ';
                            }
                            break;
                        case 'insertTop':
                            {
                                cm +=
                                    '<li><a href="#" action="insert-top"><i class="icon-add-to-list position-left"></i>Thêm 1 dòng phía trên</a></li> ';
                            }
                            break;
                        case 'insertBottom':
                            {
                                cm +=
                                    '<li><a href="#" action="insert-bottom"><i class="icon-add-to-list position-left"></i>Thêm 1 dòng phía dưới</a></li> ';
                            }
                            break;
                        case 'copy':
                            {
                                cm +=
                                    '<li><a href="#" action="copy"><i class="icon-add-to-list position-left"></i>Copy</a></li> ';
                            }
                            break;
                        case 'pastChild':
                            {
                                cm +=
                                    '<li><a href="#" action="pastChild"><i class="icon-add-to-list position-left"></i>Chèn con</a></li> ';
                            }
                            break;
                        case 'pastBottomPosition':
                            {
                                cm +=
                                    '<li><a href="#" action="pastBottomPosition"><i class="icon-add-to-list position-left"></i>Chèn dưới vị trí</a></li> ';
                            }
                            break;
                        case '-':
                            {
                                cm += '<li class="divider" ></li>';
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
            //s.resize();
            s.setStaticEvents();

            if (set.data != null) {
                var mc = $(sel).find('> .level-table > .main-content');
                s.setViewData(set.data, true);
                s.sortai();

                // draw sum tr
                if (s.set.sumInfo != null) {
                    s.drawSuminfo(mc);
                }
            } else {
                if (set.autoLoad != false) {
                    s.searchParams.loadMode = set.loadMode;
                    s.loadData();
                }
            }
        };

        s.initTable();

        s.insertRow = function (par, tr) {
            s.showTableLoading();
            var url = set.editController != null ? set.editController + '/' : '/admin/';
            url += "Insert" + set.model + "Row";
            var data = s.editParams;
            $.extend(data, par);
            app.postData(url, data, function (result) {
                s.hideTableLoading();

                if (set.reloadAfterEdit) {
                    if (result.Success) {

                        var data = result.Data;
                        var list = data.Many != null ? data.Many : data;
                        var count = data.Count != null ? data.Count : 0;
                        s.drawData(list, count, null);

                    } else {
                        app.notify('warning', result.Message);
                    }
                } else {
                    if (result.Success) {
                        //s.loadData();

                        var mc = $(sel).find('> .level-table > .main-content');
                        var ai1, level, gid, c, glHtml, grHtml;

                        switch (par.insertType) {
                            case 'Child': {
                                ai1 = tr.find('td:eq(0)').text();
                                level = parseInt(tr.attr('level'));
                                gid = tr.attr('gid');
                                c = s.drawChilds(ai1, gid, level + 1, [result.Data]);
                                glHtml = mc.find('.area-bl tr[parentid="' + gid + '"]:last');
                                grHtml = mc.find('.area-br tr[parentid="' + gid + '"]:last');

                                if (glHtml.length == 0) {
                                    glHtml = mc.find('.area-bl tr[gid="' + gid + '"]');
                                    grHtml = mc.find('.area-br tr[gid="' + gid + '"]');
                                }

                                $(glHtml).after(c.l);
                                $(grHtml).after(c.r);
                                mc.find('.area-bl tr[gid="' + gid + '"] .expand-child').removeClass('not-child');
                            } break;
                            case 'Parent': {

                                level = 1;
                                ai1 = mc.find('.area-bl tr.level-1').length + 1;
                                gid = app.newGuid();

                                c = s.drawGroup(result.Data, 'Id', ai1, gid);

                                glHtml = mc.find('.area-bl tr.tr-add-parent');
                                grHtml = mc.find('.area-br tr.tr-add-parent');

                                $(glHtml).before(c.l);
                                $(grHtml).before(c.r);
                            } break;
                        }

                        s.sourceData.push(result.Data);
                        setTimeout(function () {
                            s.setRowEvents();
                        }, 400);

                        mc.find('.empty-message').css('display', 'none');

                    } else {
                        app.notify('warning', result.Message);
                    }
                }


            });
        }

        s.pushDataByParentId = function (data, pid, list) {
            if (list == null) {
                list = s.sourceData;
            }
            $(list).each(function () {
                if (this.Id == pid) {
                    if (this.Childs == null) {
                        this.Childs = [];
                    }
                    this.Childs.push(data);
                    return;
                } else {
                    if (this.Childs.length > 0) {
                        s.pushDataByParentId(data, pid, this.Childs);
                    }
                }
            });
        };

        return s;
    };

}(jQuery));