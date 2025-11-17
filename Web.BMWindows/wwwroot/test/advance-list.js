
(function ($) {
    $.fn.advanceList = function (options) {
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
        s.moveObjectId = null;
        var set = $.extend({
            rootUrl: null,
            dataUrl: null,
            params: null,
            autoLoad: null,
            selectRow: null,
            toolbars: null,
            idAttribute: null,
            editController: null,
            model: "",
            checkAll: null,
            loadDataCallback: null,
            loadModalCallback: null,
            selectRowCallback: null,
            submitFormCallback: null,
            beforeSearch: null
        }, options);
        s.set = set;
        s.loading = false;
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

        s.showLoading = function () {
            if ($(sel + ' .theme_radar').length == 0) {
                var h =
                    '<div class="theme_radar radar-advance-list" style="opacity: 0">' +
                    '<div class="pace_progress" data-progress-text="60%" data-progress="60"></div><div class="pace_activity"></div></div>';
                $(sel).append(h);
            }
            $(sel + ' .theme_radar').css('opacity', '1');
        };
        s.hideLoading = function () {
            $(sel + ' .theme_radar').css('opacity', '0');
        };
        s.initModal = function (modal) {
            if ($('#' + modal.id).length == 0) {
                createWapModal({
                    id: modal.id,
                    title: modal.title,
                    fullscreen: true,
                    headerClass: 'bg-primary'
                });
            }
            var h = '<form id="' + set.model + 'Form" class="form-horizontal">' +
                '<div class="text-right no-padding-left no-padding-bottom no-padding-right modal-footer" style="display: none">' +
                '<div class="">' +
                '<button class="btn btn-lg btn-default form-cancel mr-10" data-dismiss="modal">' +
                '<i class="fa fa-remove"></i> Thoát' +
                '</button>' +
                '<button class="btn btn-lg btn-fill btn-primary m-r-5 btn-submit" type="button" ' +
                'data-loading-text="<i class=' +
                "'icon-spinner4 fa-spin'" +
                '></i> Đang xử lý ...">' +
                '<i class="fa fa-save"></i> Lưu lại' +
                '</button>' +
                '</div>' +
                '</div>' +
                '</div>';
            $('#' + modal.id + ' .modal-body ').append(h);
            $('#' + set.model + 'FormEditModal').on('hidden.bs.modal',
                function (e) {
                    $('body').removeClass('overflow-hidden');
                    $('#' + set.model + 'FormEditModal').remove();
                });

        };
        s.hideModal = function () {
            $('#' + set.model + 'FormEditModal').modal('hide');
        };
        s.eventModal = function () {
            $('.form-cancel').unbind().click(function () {
                s.hideModal();
            });

            //var wh = $(window).height();
            //var fem = '#formEditModal';
            //var h = $(fem + ' form').height();
            //h += 57 + 60;
            //var t = (wh - h) / 4;
            //if (wh < h) {
            //    t = 0;
            //    h = wh;
            //}
            //$(fem + ' .wtable-epanel-content')
            //    .css('height', h + 'px')
            //    .css('top', t + 'px');

            //$(window).resize(function () {
            //    var modal = set.modal;
            //    if (modal.type == 2) {
            //        var ww = $(window).width();
            //        wh = $(window).height();
            //        var mw = modal.width;
            //        var l = '';
            //        if (mw.indexOf('%') > -1) {
            //            mw = mw.substr(0, mw.length - 1);
            //            l = ((100 - parseInt(mw)) / 2) + '%';
            //        } else if (mw.indexOf('px') > -1) {
            //            mw = mw.substr(0, mw.length - 2);
            //            mw = parseInt(mw);
            //            if (ww > mw) {
            //                l = ((ww - mw) / 2) + 'px';
            //            } else {
            //                l = '0px';
            //            }
            //        }
            //        var h = $(fem + ' form').height();
            //        h += 57 + 60;
            //        t = (wh - h) / 4;
            //        if (wh < h) {
            //            t = 0;
            //            h = wh;
            //        }
            //        $(fem + ' .wtable-epanel-content')
            //            .css('left', l)
            //            .css('height', h + 'px')
            //            .css('top', t + 'px');
            //    }
            //});

            //$(fem).on('keyup keypress', function (e) {
            //    var keyCode = e.keyCode || e.which;
            //    if (keyCode === 13) {
            //        e.preventDefault();
            //        return false;
            //    }
            //});

        };
        s.createOrUpdateObject = function (id, callback, row) {

            var mId = set.model + 'FormEditModal';

            s.initModal({
                title: (id != null ? 'Cập nhật ' : 'Tạo mới ') + set.modal.title.toLowerCase(),
                id: mId
            });
            $('#' + mId).modal('show');
            app.showModalLoading(mId);
            var url = set.editController != null ? set.editController + '/' : '/admin/';
            url += set.model + "Edit";
            $.extend(s.editParams, {
                id: id
            });
            $.ajax({
                url: url,
                type: "GET",
                data: s.editParams,
                dataType: "html",
                success: function (result) {
                    app.hideModalLoading(mId);
                    $('#' + mId + ' form').prepend(result);

                    $('#' + mId + ' .modal-footer').css('display', ' block');
                    s.eventModal();
                    if (set.loadModalCallback != null) {
                        set.loadModalCallback(row);
                    }
                    if (callback) {
                        callback();
                    }
                }
            });
        };
        s.deleteObjects = function (type, ids, callback) {
            app.confirm("warning",
                null,
                ids.length + ' đối tượng đươợc chọn để xóa.',
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
                    }
                });
        };
        s.setEvents = function () {
            var item = $(sel).find('.advance-list .media-list li ');

            $(item).find('.media-left').unbind().click(function () {
                var id = $(this).closest('li').attr('dataid');
                if (set.detailView != null) {

                    s.initDetailView(id);
                } else {
                    if (set.selectItemCallback != null) {
                        var data = s.getDataById(id);
                        set.selectItemCallback(data);
                    }
                }
            });
            $(item).find('.media-body').unbind().click(function () {
                var id = $(this).closest('li').attr('dataid');
                if (set.detailView != null) {
                    s.initDetailView(id);
                } else {
                    if (set.selectItemCallback != null) {
                        var data = s.getDataById(id);
                        set.selectItemCallback(data);
                    }
                }
            });

            var ul = $(item).find('.media-right .dropdown-menu');
            ul.find(' > li a').unbind().click(function () {
                var obj = $(this).closest('.media');
                var a = $(this);
                var act = a.attr('action');
                var cls = a.attr('class');
                switch (act) {
                    case 'edit':
                        {
                            var id = $(obj).attr('dataid');
                            s.createOrUpdateObject(id, function () { }, $(obj));
                        }
                        break;
                    case 'delete':
                        {
                            var id = $(obj).attr('dataid');
                            s.deleteObjects('bulk',
                                [id],
                                function () {
                                    s.loadData(null, null, true);
                                });
                        }
                        break;

                    case 'custom':
                        {
                            $(set.item.contextMenu).each(function () {
                                if (cls == this.class) {
                                    if (this.click != null) {
                                        this.click(obj);
                                    }
                                }
                            });
                        }
                        break;
                }
            });

        };
        s.staticEvents = function () {
            $('.btn-filter-list').unbind().click(function () {
                var m = 'filterListModal';

                if ($('#' + m).length == 0) {
                    createWapModal({
                        fullscreen: true,
                        id: m,
                        title: 'Lọc',
                        headerClass: 'bg-primary',
                        bodyClass: 'bg-white'
                    });

                    var attrs = [];
                    $(set.filter).each(function () {
                        if (this.type == 'filter') {
                            attrs = this.attrs;
                            return false;
                        }
                    });

                    var html = '';

                    $(attrs).each(function (i, f) {
                        switch (f.type) {
                            case 'text':
                                {
                                    var o = '<div class="form-group form-group-lg">' +
                                        '<label class="control-label col-lg-2">' +
                                        f.text +
                                        '</label>' +
                                        '<div class="col-lg-10">' +
                                        '<input type="text" name="' +
                                        f.name +
                                        '" class="form-control" placeHolder="' +
                                        f.text +
                                        '" />' +
                                        '</div></div>';
                                    html += o;
                                }
                                break;
                            case 'contains':
                                {
                                    var o = '<div class="input-group input-group-lg">' +
                                        '<div class="input-group-btn" > ' +
                                        '<button type="button" class="btn btn-default btn-left dropdown-toggle" title="Lộc dữ liệu" ' +
                                        'data-toggle="dropdown"><i class="icon-filter4"></i></button>' +
                                        '</div > ' +
                                        '<input type="text" class="form-control filter-contains" attr="' +
                                        f.attr +
                                        '" placeholder="...">' +
                                        '</div>';
                                    td += o;
                                }
                                break;
                            case 'option':
                                {
                                    var o = '<div class="form-group form-group-lg">' +
                                        '<label class="control-label col-lg-2">' +
                                        f.text +
                                        '</label>' +
                                        '<div class="col-lg-10">' +
                                        '<select name="' +
                                        f.name +
                                        '" class="form-control filter-option select-option" data-index="' +
                                        i +
                                        '">' +
                                        '<option value="">Tất cả</option>';
                                    if (f.lst != null) {
                                        var data = f.lst();
                                        $(data).each(function () {
                                            o += '<option value="' + this.id + '">' + this.text + '</option>';
                                        });
                                    }
                                    o += '</select>' +
                                        '</div></div>';
                                    html += o;
                                }
                                break;
                            case 'optionRemote':
                                {
                                    var o = '<div class="form-group form-group-lg">' +
                                        '<div class="input-group input-group-sm">' +
                                        '<div class="input-group-btn" > ' +
                                        '<button type="button" class="btn btn-default btn-left dropdown-toggle" ' +
                                        'title="Lộc dữ liệu" data-toggle="dropdown"><i class="icon-filter4"></i></button>' +
                                        '</div>' +
                                        '<input type="text" class="form-control filter-option select-option-remote" data-index="' +
                                        i +
                                        '" data-width="' +
                                        set.head.groups[i] +
                                        '"/>';
                                    o += '</div>' +
                                        '</div>';
                                    html += o;
                                }
                                break;
                            case 'compoTree':
                                {
                                    var o = '<div class="form-group form-group-lg">' +
                                        '<label class="control-label col-lg-2">' +
                                        f.text +
                                        '</label>' +
                                        '<div class="col-lg-10">' +
                                        '<input class="form-control compo-tree" id="' +
                                        app.newGuid() +
                                        '" name="' +
                                        f.name +
                                        '" data-index="' +
                                        i +
                                        '" type="text" />' +
                                        '</div>' +
                                        '</div>';
                                    html += o;
                                }
                                break;
                            case 'date':
                                {
                                    var o = '<div class="form-group form-group-lg has-feedback">' +
                                        '<label class="control-label col-lg-2">' +
                                        f.text +
                                        '</label>' +
                                        '<div class="col-lg-10">' +
                                        '<input type="hidden" name="' + f.name + 'From" />' +
                                        '<input type="hidden" name="' + f.name + 'To" />' +
                                        '<input name="' +
                                        f.name +
                                        '" type="text" name="' +
                                        f.name +
                                        '" class="form-control datepicker" placeHolder="' +
                                        f.text +
                                        '" data-index="' + i + '" />' +
                                        '<div class="form-control-feedback"><i class="icon-calendar2"></i></div>' +
                                        '</div></div>';

                                    html += o;
                                }
                                break;
                        }
                    });
                    var o = '<div class="form-group form-group-lg mt-15">' +
                        '<div class="col-xs-12"><button type="button" class="btn btn-warning btn-block btn-lg btn-start-search">Áp dụng</button></div>' +
                        '</div>';
                    html += o;

                    $('#' + m + ' .modal-body').append('<div class="form-horizontal">' + html + '</div>');

                    s.filterEvents();
                }

                $('#' + m).modal('show');
            });
            $(window).scroll(function () {
                if (Math.round($(window).scrollTop()) + $(window).height() == $(document).height()) {
                    if (!s.loading) {
                        s.searchParams.page++;
                        s.loadData();
                    }
                }
            });
            var globalTimeout = null;
            $(sel).find('.search-control').unbind().keyup(function () {
                var keyword = $(this).val();
                if (globalTimeout != null) {
                    clearTimeout(globalTimeout);
                }
                globalTimeout = setTimeout(function () {
                    var p = {};
                    p['keyword'] = keyword;
                    $.extend(s.searchParams, p);
                    console.log('s.searchParams', s.searchParams)
                    if (s.searchParams.page != 1) {
                        s.searchParams.page = 1;
                    }
                    if (set.beforeSearch != null) {
                        s.searchParams = set.beforeSearch(s.searchParams);
                    }
                    s.loadData({}, null, true);
                    clearTimeout(globalTimeout);
                }, 400);
            });

            $(sel).find('.btn-refresh').unbind().click(function () {
                s.searchParams = set.params.search;
                s.searchParams.page = 1;
                s.loadData(null, null, true);
            });
        };
        s.filterEvents = function () {
            var pf = $('#filterListModal');
            var attrs = [];
            $(set.filter).each(function () {
                if (this.type == 'filter') {
                    attrs = this.attrs;
                    return false;
                }
            });

            pf.find('.select-option').unbind().select2({
                minimumResultsForSearch: -1,
                dropdownCssClass: 'bigdrop'
            }).on('select2-open',
                function (e) {
                    if (!$(this).hasClass('loaded')) {
                        var ele = $(this);
                        var idex = $(this).attr('data-index');

                        var attrs = [];
                        $(set.filter).each(function () {
                            if (this.type == 'filter') {
                                attrs = this.attrs;
                                return false;
                            }
                        });
                        var f = attrs[idex];
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
                                        //.trigger('change');

                                    });
                                    ele.select2('close').select2('open');
                                });
                            return true;
                        }
                    }
                });

            pf.find(' .select-option-remote').each(function () {
                var ele = $(this);
                var idex = $(this).attr('data-index');
                var f = set.rows[idex].filter;
                var limit = f.ajax.data.limit != null ? f.ajax.data.limit : 10;
                ele.unbind().select2({
                    ajax: {
                        url: f.ajax.url,
                        dataType: 'json',
                        quietMillis: 200,
                        data: function (term, page) {
                            return {
                                keyword: term,
                                limit: limit
                            };
                        },
                        results: function (result) {
                            var data = [];
                            $(result).each(function () {
                                data.push({
                                    id: this[f.ajax.attr.id],
                                    text: this[f.ajax.attr.text]
                                });
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

            pf.find(' .compo-tree').each(function () {
                var ele = $(this);
                var idex = ele.attr('data-index');
                var f = attrs[idex];
                var opt = f.option;
                opt.placeHolder = 'Tất cả';
                opt.valueType = 1;
                opt.width = '100%';
                opt.groupSize = 'lg',
                    opt.selectCallback = function (val) {

                    };
                var id = $(this).attr('id');
                $('#' + id).compoTree(opt);
            });

            pf.find(' .datepicker').each(function () {
                var name = $(this).attr('name');
                var idex = $(this).attr('data-index');
                pf.find(' input[name="' + name + '"]').compoDate({
                    placeHolder: 'Tất cả',
                    selectCallback: function (arr, ctr) {
                        var r = attrs[idex];

                        pf.find('input[name="' + r.name + 'From"]')
                            .val(arr.from != null ? app.convertVnToEnDate(arr.from) : null);
                        pf.find('input[name="' + r.name + 'To"]')
                            .val(arr.to != null ? app.convertVnToEnDate(arr.to) : null);

                    }
                });
            });

            var globalTimeout = null;
            pf.find('.filter-contains').unbind().keyup(function () {
                var keyword = $(this).val();
                var attr = $(this).attr('attr');
                if (globalTimeout != null) {
                    clearTimeout(globalTimeout);
                }
                globalTimeout = setTimeout(function () {
                    var p = {};
                    p[attr] = keyword;
                    $.extend(s.searchParams, p);
                    if (s.searchParams.page != 1) {
                        s.searchParams.page = 1;
                    }
                    if (set.beforeSearch != null) {
                        s.searchParams = set.beforeSearch(s.searchParams);
                    }
                    s.loadData();
                    clearTimeout(globalTimeout);
                },
                    400);
            });

            pf.find(' .btn-start-search').unbind().click(function () {
                var params = [];
                $(attrs).each(function (i, o) {
                    switch (o.type) {
                        case 'text':
                        case 'option':
                        case 'compoTree':
                            {
                                params[o.name] = pf.find('.form-control[name="' + o.name + '"]').val();
                            }
                            break;
                        case 'date':
                            {
                                params[o.name + 'From'] = pf.find('input[name="' + o.name + 'From"]').val();
                                params[o.name + 'To'] = pf.find('input[name="' + o.name + 'To"]').val();
                            }
                            break;
                    }
                });
                $('#filterListModal').modal('hide');
                params.Type = $('#main_tab .active a').attr('data-type');
                params.Filter = $('#main_tab .active a').attr('href');
                
                s.loadData(params, null, true);
            });
        };
        s.getDataById = function (id) {
            var result = null;
            var idAttr = "Id";
            if (set.idAttribute != null) {
                idAttr = set.idAttribute;
            }
            $(s.sourceData).each(function () {
                console.log(this.Id + ' - ' + (this[idAttr] == id));
                if (this[idAttr] == id) {
                    result = this;
                    return false;
                }
            });
            return result;
        };
        s.initDetailView = function (id) {
            var m = 'advanceListDetailModal';
            var dv = set.detailView;

            var header = null;
            if (set.modal.headRender != null) {
                var row = s.getDataById(id);
                header = set.modal.headRender(row);
            }

            if ($('#' + m).length == 0) {
                createWapModal({
                    id: m,
                    title: 'Thông tin ' + set.modal.title,
                    fullscreen: true,
                    noPaddingBody: true,
                    headerClass: 'bg-primary p-5',
                    header: header
                });
                switch (dv.mode) {
                    case 0:
                        {
                            var row = s.getDataById(id);
                            var tb = $('<table class="table table-striped table-sm"><tbody></tbody></table>');
                            $(dv.attrs).each(function () {
                                var tr = $('<tr></tr>');
                                tr.append('<td>' + this.title + '</td>');
                                var v = '';
                                if (this.render != null) {
                                    v = this.render(row);
                                } else {
                                    switch (this.type) {
                                        case 'datetime':
                                            {
                                                v = app.formatDateTime(row[this.attribute]);
                                            }
                                            break;

                                        case 'text':
                                            {
                                                v = row[this.attribute];
                                            }
                                            break;
                                    }
                                }
                                tr.append('<td>' + (v != null ? v : '') + '</td>');
                                tb.find('tbody').append(tr);
                            });
                            $('#' + m + ' .modal-body').html(tb);
                        }
                        break;
                    case 1:
                        {
                            if (dv.tabs != null) {
                                var tabids = [];
                                var tab = $('<div class="tabbable" dataid=' + id + '></div>');
                                var ul = $(
                                    '<div class="tabs-group"><div><ul class="nav nav-tabs nav-tabs-bottom"></ul></div></div>');
                                var ulw = 0;
                                $(dv.tabs).each(function (i, o) {
                                    var tid = app.newGuid(10);
                                    ul.find('ul').append('<li class="" data-pos="' +
                                        ulw +
                                        '" ><a href="#' +
                                        tid +
                                        '" data-index="' +
                                        i +
                                        '"  data-toggle="tab" aria-expanded="true">' +
                                        o.title +
                                        '</a></li>');

                                    ulw += o.width;
                                    tabids.push(tid);
                                });
                                ul.find('ul').css('width', ulw);
                                var tc = $('<div class="tab-content"></div>');
                                for (var i = 0; i < dv.tabs.length; i++) {
                                    tc.append('<div role="tabpanel" class="tab-pane" id="' +
                                        tabids[i] +
                                        '"></div>');
                                }

                                tab.append(ul);
                                tab.append(tc);
                                $('#' + m + ' .modal-body').html(tab);

                                $('#' + m + ' .nav-tabs a[data-toggle="tab"]').on('shown.bs.tab',
                                    function (e) {
                                        var i = $(e.target).attr('data-index');
                                        var id = $(e.target).closest('.tabbable').attr('dataid');
                                        s.selectContentTab(i, $(e.target).attr('href'), id);

                                        var d = $('#' + m + ' .tabs-group > div');
                                        var left = parseInt($(e.target).closest('li').attr('data-pos'));
                                        d.animate({ scrollLeft: left - 100 }, 500);

                                    });
                            }
                        }
                        break;
                    case 2:
                        {
                            var row = s.getDataById(id);
                            console.log(auth.EmployeeId);
                            var aj = dv.ajax;
                            var data = {
                                dataType: 'html',
                                id: id,
                                AuthEmployeeId: auth != null ? auth.EmployeeId : null
                            };
                            if (aj.data != null) {
                                data = aj.data(row);
                            }
                            app.showModalLoading(m);
                            app.loadData(aj.url, data,
                                null,
                                function (html) {
                                    app.hideModalLoading(m);
                                    $('#' + m + ' .modal-body').html(html);
                                    if (dv.ajax.loadCallback != null) {
                                        dv.ajax.loadCallback(id);
                                    }
                                });
                        }
                        break;
                    default:
                }
            } else {
                if (header != null) {
                    $('#' + m + ' .modal-header').html(header);
                }
                if (dv.mode == 2) {
                    var row = s.getDataById(id);
                    var aj = dv.ajax;
                    var data = {
                        dataType: 'html',
                        id: id,
                        AuthEmployeeId: auth != null ? auth.EmployeeId : null
                    };
                    if (aj.data != null) {
                        data = aj.data(row);
                    }
                    app.showModalLoading(m);
                    app.loadData(aj.url, data,
                        null,
                        function (html) {
                            app.hideModalLoading(m);
                            $('#' + m + ' .modal-body').html(html);
                            if (dv.ajax.loadCallback != null) {
                                dv.ajax.loadCallback(id);
                            }
                        });
                }
            }

            $('#' + m).modal('show');

            $('.modal .pull-left').unbind().click(function () {
                var m = $(this).closest('.modal');
                m.removeClass('in');
                setTimeout(function () {
                    m.modal('hide');
                }, 200);
            });

            if (dv.tabs != null) {
                $('#' + m + ' .tabbable').attr('dataid', id);
                var li = $('#' + m + ' .nav-tabs li:eq(0)');
                if (li.hasClass('active')) {
                    li.removeClass('active');
                }
                li.find('a').tab('show');
            }

        };
        s.selectContentTab = function (index, tabId, id) {
            app.showModalLoading(m);
            var dv = set.detailView;
            var tc = $(tabId);
            var isLoad = false;
            if (tc.hasClass('loaded')) {
                if (tc.attr('dataid') != id) {
                    isLoad = true;
                    tc.attr('dataid', id);
                    tc.removeClass('loaded');
                    tc.html('');
                }
            } else {
                isLoad = true;
                tc.attr('dataid', id);
            }

            if (isLoad) {
                var tab = dv.tabs[index];
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
                var m = 'advanceListDetailModal';
                app.showModalLoading(m);
                app.loadData(tab.url, data,
                    null,
                    function (html) {
                        tc.addClass("loaded");
                        app.hideModalLoading(m);
                        tc.html(html);
                        if (tab.loadCallback != null) {
                            tab.loadCallback(id);
                        }


                    });


            }

            if (dv.changeTabCallback != null) {
                dv.changeTabCallback(index, tabId);
            }
        };
        s.drawItem = function (obj, idattr) {
            var it = set.item;
            var h = '<li class="media" dataid="' + obj[idattr] + '">' + '<div class="media-left">';
            if (it.left.type == 'img') {
                if (it.left.render != null) {
                    h += it.left.render(obj);
                } else {
                    h += '<div class="img-circle img-md"><img src="' + obj[it.left.attr] + '"  alt="" /></div>';
                }
            } else {
                if (it.left.render != null) {
                    h += it.left.render(obj);
                } else {
                    h += '<i class="' + it.left.icon + '"></i>';
                }
            }

            var txt = '';
            if ($.isFunction(it.info.title)) {
                txt = it.info.title(obj);
            } else {
                txt = obj[it.info.title];
            }

            h += '</div>' +
                '<div class="media-body">' +
                ' <h6 class="media-heading text-bold">' +
                txt +
                '</h6>';
            if (jQuery.isFunction(it.info.summary)) {
                h += it.info.summary(obj);
            } else {
                h += obj[it.info.summary];
            }
            h += '</div>';
            if (set.item.contextMenu != null) {
                h += '<div class="media-right media-middle pr-10">' +
                    '<ul class="icons-list text-nowrap">' +
                    '<li>' +
                    '<a href="#" class="dropdown-toggle" data-toggle="dropdown"><i class="icon-more2"></i></a>' +
                    '<ul class="dropdown-menu dropdown-menu-right">';

                $(set.item.contextMenu).each(function (i, a) {
                    switch (a) {
                        case '-':
                            {
                                h += '<li class="divider"></li>';
                            }
                            break;
                        case 'edit':
                            {
                                h += '<li class=""><a class="btn-edit" action="edit"><i class="icon-pencil7 position-left"></i> Cập nhật</a></li>';
                            }
                            break;
                        case 'delete':
                            {
                                h += '<li class=""><a class="btn-delete" action="delete"><i class="icon-x position-left"></i> Xóa</a></li>';
                            }
                            break;
                        default:
                            {
                                var li = '<li><a href="#" dataid="' + obj[idattr] + '" action="custom" class="' +
                                    a.class +
                                    '"><i class="' +
                                    a.icon +
                                    ' position-left"></i> ' +
                                    a.text +
                                    '</a></li>';
                                h += li;
                            }
                    }
                });

                h += '</ul>' +
                    '</li>' +
                    '</ul>' +
                    '</div>';
            }

            h += '</li>';
            return h;
        };
        s.loadData = function (params, callback, reload) {

            s.loading = true;
            if (params != null) {
                $.extend(s.searchParams, params);
            }
            s.showLoading();
            $.ajax({
                url: set.dataUrl != null ? set.dataUrl : '/api/' + set.model + "List",
                type: "GET",
                dataType: "JSON",
                contentType: 'application/json; charset=utf-8',
                data: s.searchParams,
                success: function (result) {
                    var count = result.Count != null ? result.Count : 0;
                    var list = result.Many != null ? result.Many : result.length > 0 ? result : null;
                    if (count == 0) {
                        count = list.length;
                    }
                    if (reload) {
                        s.sourceData = [];
                        $(params ? params.Filter : sel).find(".media-list").empty();
                    }

                    s.count = result.Count;

                    var ul = $(params ? params.Filter : sel).find('.media-list');
                   
                    if (list != null && list.length > 0) {
                        var idAttr = "Id";
                        if (set.idAttribute != null) {
                            idAttr = set.idAttribute;
                        }
                        $.each(list,
                            function (k, item) {
                                s.sourceData.push(item);

                                var r = s.drawItem(item, idAttr);
                                ul.append(r);
                            });
                        $(sel).find('.empty-group').css('display', 'none');
                    } else {
                        if (ul.html() == '') {

                            $(sel).find('.empty-group').css('display', 'block');
                        }
                        if (s.searchParams.page > 1) {
                            s.searchParams.page--;
                        }
                    }

                    s.hideLoading();
                    s.setEvents();
                    if (set.loadDataCallback != null) {
                        set.loadDataCallback(result);
                    }
                    if (callback != null) {
                        callback(result);
                    }
                    s.loading = false;
                }
            });
        };

        s.initList = function () {
            if (set.filter != null) {
                var pa = $('<div class="panel panel-filter panel-body no-border no-border-radius p-5 no-margin-bottom"></div>');
                var f = $('<div class=""></div>');
                $(set.filter).each(function (i, o) {
                    switch (o.type) {
                        case 'search':
                            {
                                f.append('' +
                                    '<div class="form-group has-feedback no-margin-bottom advance-list-search">' +
                                    '<div class="col-xs-' + o.size + '">' +
                                    '<input type="text" class="form-control search-control" placeholder="' + o.placeHolder + '">' +
                                    '<div class="form-control-feedback">' +
                                    '<i class="icon-search4 text-muted"></i>' +
                                    '</div></div></div>');
                            }
                            break;
                        case 'filter':
                            {
                                f.append('<div class="col-xs-' + o.size + ' no-padding">' +
                                    '<button type="button" class="btn btn-link btn-lg btn-filter-list">' +
                                    'Lọc<i class="icon-filter3 position-right text-muted"></i>' +
                                    '</button>' +
                                    '</div>');
                            }
                            break;
                    }
                });

                pa.append(f);
                $(sel).append(pa);
            }

            var h = '<h5 class="text-muted text-size-small text-bold pl-10 pr-10 text-uppercase">Danh sách ' + set.modal.title + '</h5>' +
                '<div class="advance-list">' +
                '<ul class="media-list media-list-bordered"></ul>' +
                '<div class="text-center empty-group" style="display:none">' +
                '<div class="alert alert-primary no-border m-15">Không tìm thấy kết quả.</div>' +
                '<button class="btn  btn-primary ml-15 mr-15 mb-15 btn-refresh"><i class="icon-loop3 position-left"></i>Tải lại</button>' +
                '</div>' +
                '</div>';

            $(sel).append(h);
            s.staticEvents();
            if (set.autoLoad != false) {
                s.loadData();
            }
        };
        s.initList();
        return this;
    };
}(jQuery));