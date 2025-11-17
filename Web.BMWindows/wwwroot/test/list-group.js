


(function ($) {
    $.fn.listGroup = function (options) {
        var l = this;
        var sel = this.selector;
        l.searchParams = {
            limit: null
        };
        var set = $.extend({
            footer: null,
            tableSize: null,
            initCallback: null
        }, options);
        l.set = set;
        l.globalTimeout;
        l.drawItem = function (data, item) {
            var li = '<li class="media" dataid="' +
                data[item.id] +
                '" data-parent="' +
                (item.relateId != null ? data[item.relateId] : '') +
                '"><a href="javascript:void(0)" class="media-link">';
            if (item.left != null) {
                li += ' <div class="media-left">' + item.left.render(data) + '</div>';
            }

            li += '<div class="media-body">' + item.body.render(data) + '</div>';

            if (item.right != null) {
                li += ' <div class="media-right">' + item.right.render(data) + '</div>';
            }

            li += '</a></li>';

            return li;
        }

        l.loadData = function (gi, parentId, param) {
          
            var g = set.groups[gi];
            console.log(g,'gsdg');
            var gele, gul, list, li, data, obj;
            if (g.list != null) {
                l.hideLoading(gi);
                gele = $(sel).find('.group-item[data-group="' + gi + '"]');
                gul = $(gele).find(' ul.media-list');
                list = g.list;
                g.data = list;
                gul.html('');
                if (g.item.default != null) {
                    li = l.drawItem(g.item.default, g.item);
                    gul.append(li);
                }

                $(list).each(function () {
                    li = l.drawItem(this, g.item);
                    gul.append(li);
                });

                if (set.autoLoad) {
                    if (g.activeId != null) {
                        var ali = gul.find('li[dataid="' + g.activeId + '"]');
                        l.selectItem(ali);
                    } else {
                        l.selectItem(gul.find('li:eq(0)'));
                    }
                }
                l.dataEvents(gi);
            } else if (g.ajax != null) {
                var url = g.ajax.url;
                if (url != null) {
                    gele = $(sel).find(' > .advance-list-group > .group-item[data-group="' + gi + '"]');
                    $(gele).find('.search-group input').attr('data-parent', parentId);
                    $(gele).find('.heading-elements .btn-add').attr('data-parent', parentId);

                    data = g.ajax.data;
                    if (param != null) {
                        $.extend(data, param);
                    }
                    var fp = l.getFilterParam(gi);
                    $.extend(data, fp);
                    if (g.item.relateId != null) {
                        if (typeof parentId != 'undefined') {
                            data[g.item.relateId] = parentId;
                            obj = {};
                            obj[g.item.relateId] = parentId;
                            g.activeRelateObj = obj;
                        } else {
                            if (typeof g.activeRelateObj != 'undefined' && g.activeRelateObj != null) {
                                data[g.item.relateId] = g.activeRelateObj[g.item.relateId];
                            }
                        }
                    }

                    if (g.type == 'html') {
                        data.dataType = 'html';
                    }
                    l.showLoading(gi);
                    app.loadData(url,
                        data,
                        null,
                        function (result) {
                            l.hideLoading(gi);
                            switch (g.type) {
                                case 'list':
                                    {
                                        var gul = $(gele).find(' ul.media-list');
                                        var list = result.Many != null ? result.Many : result;
                                        g.data = list;

                                        gul.html('');

                                        if (g.item.default != null) {
                                            li = l.drawItem(g.item.default, g.item);
                                            gul.append(li);
                                        }

                                        if (list.length > 0) {
                                            $(list).each(function () {
                                                li = l.drawItem(this, g.item);
                                                gul.append(li);
                                            });
                                            if (set.autoLoad) {
                                                l.selectItem(gul.find('li:eq(0)'));
                                            }

                                        } else {
                                            gul.html('<li><div class="alert alert-warning no-border no-margin"> Không tìm thấy kết quả phù hợp </div></li>');
                                        }
                                    }
                                    break;
                                case 'html':
                                    {
                                        $(gele).find('.group-content > .html-content').html(result);
                                    }
                                    break;
                            }

                            l.dataEvents(gi);
                            if (g.loadDataCallback != null) {
                                g.loadDataCallback(gi, parentId);
                            }
                        });
                }
            }
            else if (g.grid != null) {

                gele = $(sel).find(' > .advance-list-group > .group-item[data-group="' + gi + '"]');
                $(gele).find('.search-group input').attr('data-parent', parentId);
                $(gele).find('.heading-elements .btn-add').attr('data-parent', parentId);

                data = {};
                if (param != null) {
                    $.extend(data, param);
                }
                console.log(g.relateId, parentId);

                if (g.relateId != null) {
                    data[g.relateId] = parentId;
                    obj = {};
                    obj[g.relateId] = parentId;
                    g.grid.searchParams[g.relateId] = parentId;
                    g.activeRelateObj = obj;
                } 

                console.log(g.grid.searchParams);

                g.grid.search(g.grid.searchParams);
            }
        }

        l.selectItemById = function (gi, dataid) {
            var gele = $(sel).find('.group-item[data-group="' + gi + '"]');
            var ul = $(gele).find(' ul.media-list');
            ul.find('> li.active').removeClass('active');
            var ali = ul.find('li[dataid="' + dataid + '"]');

            l.selectItem(ali);
        }

        l.selectItem = function (ele) {
            ele.addClass('active');
            var v = ele.attr('dataid');
            var gIndex = parseInt(ele.closest('.group-item').attr('data-group'));

            var g = set.groups[gIndex];

            gIndex++;
            if (gIndex < set.groups.length) {
                l.loadData(gIndex, v);
            }
            if (g != null) {
                if (g.selectCallback != null) {
                    g.selectCallback(v);
                }
            }

        }

        l.getDataById = function (gi, id) {
            var data;
            var g = set.groups[gi];
            $(g.data).each(function () {
                if (this.Id == id) {
                    data = this;
                    return;
                }
            });
            return data;
        }

        l.dataEvents = function (gi) {
            var gele = $(sel).find(' > .advance-list-group > .group-item[data-group="' + gi + '"]');
            $(gele).find('ul li.media a').unbind().click(function () {
                var ul = $(this).closest('ul');
                ul.find('> li').removeClass('active');
                l.selectItem($(this).closest('li'));
            });
            var g = set.groups[gi];

            if (g.contextMenu != null) {
                var cmt = gele.find('> .context-menu-popup');
                gele.find('ul.media-list > li').unbind().contextmenu({
                    target: cmt.selector,
                    before: function (e, context) {
                        e.preventDefault();

                        var menu = this.getMenu();
                        var id = $(context).attr('dataid');
                        var row = l.getDataById(gi, id);

                        $(g.contextMenu).each(function () {
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
                                l.clickContextMenu(gi, context, e);
                            }
                        }
                    }
                });

            }

        }

        l.showLoading = function (gi) {
            var g = $(sel).find(' > .advance-list-group > .group-item[data-group="' + gi + '"]');
            g.find('.loading').show();
        }
        l.hideLoading = function (gi) {
            var g = $(sel).find(' > .advance-list-group > .group-item[data-group="' + gi + '"]');
            g.find('.loading').hide();
        }
        l.createOrUpdateObject = function (gi, mode, data, callback) {
            l.showLoading(gi);
            var g = set.groups[gi];
            var c = g.command;
            var url = c.editController != null ? c.editController + '/' : '/admin/';
            url += c.model + "Edit";
            $.extend(data, c.param);
            var idm = app.newGuid();
            app.createPartialModal({
                url: url,
                data: data,
                modal: {
                    title: (mode == 1 ? 'Cập nhật ' : 'Thêm mới ') + g.header.title.toLowerCase(),
                    id: idm,
                    width: c.modal.width,
                    model: c.model
                }
            }, function () {
                l.hideLoading(gi);
                if (c.loadModalCallback != null) {
                    c.loadModalCallback(gi, idm);
                }
            });
        };

        l.deleteObjects = function (gi, type, ids, callback) {
            var g = set.groups[gi];
            var c = g.command;
            app.confirm("warning",
                null,
                ids.length + ' đối tượng được chọn để xóa.',
                function () {
                    var url = c.editController != null ? c.editController + '/' : '/admin/';
                    if (type == "bulk") {
                        app.postData(url + "/delete" + c.model + 'ByIds',
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

        l.clickContextMenu = function (gi, context, e) {
            var a = $(e.target);
            if (!a[0].hasAttribute('action')) {
                a = $(e.target).closest('a');
            }
            var li = $(context.context);
            var act = a.attr('action');
            var cls = a.attr('class');
            var g = set.groups[gi];
            switch (act) {
                case 'edit':
                    {
                        l.createOrUpdateObject(gi, 1,
                            {
                                id: $(li).attr('dataid')
                            }, function () { });
                    }
                    break;
                case 'delete':
                    {
                        var id = $(li).attr('dataid');
                        l.deleteObjects(gi, 'bulk',
                            [id],
                            function () {
                                l.loadData(gi);
                            });
                    }
                    break;
                case 'move-bottom':
                    {

                    }
                    break;
                case 'custom':
                    {
                        for (var i = 0; i < g.contextMenu.length; i++) {
                            var cm = g.contextMenu[i];
                            if (cls == cm.class) {
                                if (cm.click != null) {
                                    cm.click(li);
                                    return false;
                                }
                            } else {
                                if (cm.childs != null) {
                                    for (var j = 0; j < cm.childs.length; j++) {
                                        var ch = cm.childs[j];
                                        if (cls == ch.class) {
                                            if (ch.click != null) {
                                                ch.click(li);
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

        l.resetSlimScroll = function (g, w, h) {
            $(g).find(' > .slimScrollDiv').css('width', w).css('height', h);
            $(g).find(' > .slimScrollDiv > .scroller').css('width', w).css('height', h);
            //$(g).find('.scroller').slimScroll({
            //    height: h + 'px',
            //    width: w + 'px',
            //    size: '8px'
            //});
        }

        l.resize = function () {
            var h = $(window).height();
            var fw = $(sel).width();
            var w, v;
            var lg = $(sel).find('.advance-list-group');
            var left = 0;
            if (set.top != null) {
                h -= set.top;
            }

            $(sel).find('> .advance-list-group').css('height', h);

            $(set.groups).each(function (i, o) {
                var gh = h;
                if (o.header != null) {
                    gh = h - 43;
                    if (o.header.filter != null || o.header.toolbar != null) {
                        gh = h - 94;
                    }
                }

                if (o.width.indexOf('px') > 0) {
                    w = parseInt(o.width.substr(0, o.width.length - 2));
                } else if (o.width.indexOf('%') > 0) {
                    v = parseInt(o.width.substr(0, o.width.length - 1));
                    w = fw * v / 100;
                } else {
                    w = fw - left;
                }

                var g = $(sel).find(' > .advance-list-group > .group-item[data-group="' + i + '"]');
                $(g).css('width', w).css('left', left);
                if (o.grid != null) {
                    $(g).find('.apply-advance-grid').css('height', gh);
                    $(g).find('.apply-level-grid').css('height', gh);
                } else {
                    l.resetSlimScroll(g, w, gh);
                }

                if (o.width.indexOf('px') > 0) {
                    left += parseInt(o.width.substr(0, o.width.length - 2));
                } else if (o.width.indexOf('%') > 0) {
                    v = parseInt(o.width.substr(0, o.width.length - 1));
                    left += w;
                }
            });
        }

        l.loadFilterOption = function (ele, callback) {
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
        l.getFilterParam = function (gid) {
            var g = $(sel).find(' > .advance-list-group > .group-item[data-group="' + gid + '"]');
            if (set.groups[gid].header != null) {
                var fs = set.groups[gid].header.filter;
                var param = {};
                $(fs).each(function () {
                    switch (this.type) {
                        case 'month':
                            {
                                var inp = $(g).find('.search-group input[data-attr="' + this.attr + '"]');
                                param[this.attr] = inp.val();
                            } break;
                        case 'option':
                            {
                                var sell = $(g).find('.search-group select[data-attr="' + this.attr + '"]');
                                param[this.attr] = sell.val();
                            }
                            break;
                    }
                });
                return param;
            }
            return null;
        }
        l.staticEvents = function () {

            var h = $(sel).find('> .advance-list-group').height();
            $(set.groups).each(function (i, o) {
                var gh = o.header != null ? h - 100 : h;
                var g = $(sel).find(' > .advance-list-group > .group-item[data-group="' + i + '"]');
                $(g).find('.scroller').slimScroll({
                    height: gh + 'px',
                    size: '8px'
                });

                switch (o.type) {
                    case 'grid':
                        {
                            o.grid = $('#' + o.gridId).advanceGrid(o.option);
                        }
                        break;
                    case 'levelGrid':
                        {
                            o.grid = $('#' + o.gridId).levelGrid(o.option);
                        }
                        break;
                }

                $(g).find('.btn-add').click(function () {
                    var p = $(this).attr('data-parent');
                    var e = $(this).closest('.group-item').attr('data-group');
                    var gr = set.groups[parseInt(e)];
                    var d = {};
                    d[gr.item.relateId] = p;
                    l.createOrUpdateObject(i, 0, d, function () { });
                });
            });

            l.resize();

            $(sel).find('.search-group input').unbind().keyup(function () {
                var gi = parseInt($(this).closest('.group-item').attr('data-group'));
                var attr = $(this).attr('data-attr');
                var pId = $(this).attr('data-parent');
                var v = $(this).val();
                if (l.globalTimeout != null) {
                    clearTimeout(l.globalTimeout);
                }
                var p = {};
                p[attr] = v;

                l.globalTimeout = setTimeout(function () {
                    l.loadData(gi, pId, p);
                    clearTimeout(l.globalTimeout);
                }, 400);
            });

            $(sel).find('.search-group .select-option').unbind().select2({
                minimumResultsForSearch: 1,
                dropdownCssClass: 'bigdrop'
            }).on('select2-open',
                function (e) {
                    var ele = $(this);
                    l.loadFilterOption(ele, function () {
                        ele.select2('close').select2('open');
                        return true;
                    });
                }).on("change",
                    function (e) {
                        var ele = $(e.target);
                        var attr = $(ele).attr('data-attr');
                        var gi = parseInt($(ele).closest('.group-item').attr('data-group'));
                        var pId = $(ele).attr('data-parent');
                        var p = {};
                        p[attr] = e.val;
                        l.loadData(gi, pId, p);
                    });

            $(sel).find('.search-group .datepicker').each(function () {
                var name = $(this).attr('name');
                $(sel).find('.search-group div[name="' + name + '"]').compoDate({
                    placeHolder: 'Tất cả',
                    selectCallback: function (arr, ele) {
                        var attr = $(ele).attr('data-attr');
                        var gi = parseInt($(ele).closest('.group-item').attr('data-group'));
                        var pId = $(ele).attr('data-parent');
                        var p = {};
                        p[attr + 'From'] = arr.from != null ? app.convertVnToEnDate(arr.from) : null;
                        p[attr + 'To'] = arr.to != null ? app.convertVnToEnDate(arr.to) : null;
                        l.loadData(gi, pId, p);
                    }
                });
            });

            $(sel).find('.search-group .datetime-month').each(function () {
                var name = $(this).attr('name');
                $(sel).find('.search-group input[name="' + name + '"]').datetimepicker({
                    viewMode: 'months',
                    format: 'MM/YYYY',
                    locale: 'vi'
                }).on('dp.change',
                    function (e) {
                        var ele = e.currentTarget;
                        var attr = $(e.currentTarget).attr('data-attr');
                        var gi = parseInt($(ele).closest('.group-item').attr('data-group'));
                        var pId = $(ele).attr('data-parent');
                        var p = {};
                        p[attr] = e.date.format('MM/YYYY');
                        l.loadData(gi, pId, p);
                    });
            });

            $(window).resize(function () {
                l.resize();
            });

            if (set.initCallback != null) {
                set.initCallback();
            }
        }
        l.init = function () {
            var fw = $(sel).width();
            var dw, w, v;
            $(sel).append('<div class="advance-list-group"></div>');
            var lg = $(sel).find(' > .advance-list-group');
            var left = 0;
            $(set.groups).each(function (i, o) {
                if (o.width.indexOf('px') > 0) {
                    w = parseInt(o.width.substr(0, o.width.length - 2));
                } else if (o.width.indexOf('%') > 0) {
                    v = parseInt(o.width.substr(0, o.width.length - 1));
                    w = fw * v / 100;
                } else {
                    w = fw - left;

                }

                var sty = 'left: ' + left + 'px; width: ' + w + 'px';
                var g = '<div class="group-item" data-type="' + o.type + '" data-group="' + i + '" style="' + sty + '">';

                if (o.header != null) {
                    g += '<div class="group-header"><h6 class="text-bold">' + o.header.title + '</h6>';
                    if (o.header.filter != null) {
                        g += '<div class="search-group">';
                        for (var j = 0; j < o.header.filter.length; j++) {
                            var f = o.header.filter[j];
                            var hw = f.width != null ? f.width : '100%';
                            switch (f.type) {
                                case 'contains':
                                    {
                                        g += '<div class="form-group has-feedback" style="width: ' + hw + '">' +
                                            '<div class="form-control-feedback"><i class="icon-search4 text-muted"></i></div>' +
                                            '<input type="text" class="form-control"  data-attr="' + f.attr + '" data-index="' + i + '" placeholder="Tìm ' + o.header.title.toLowerCase() + '" ></div>';
                                    }
                                    break;
                                case 'option':
                                    {
                                        g += '<div class="form-group form-group-sm"  style="width: ' +
                                            hw +
                                            '">' +
                                            '<div class="input-group input-group-sm">' +
                                            '<div class="input-group-btn" > ' +
                                            '<button type="button" class="btn btn-default btn-left dropdown-toggle" ' +
                                            'title="" data-toggle="dropdown"><i class="icon-filter4"></i></button>' +
                                            '</div>' +
                                            '<select class="form-control filter-option select-option loaded" data-attr="' +
                                            f.attr +
                                            '"  data-index="' +
                                            i +
                                            '" data-width="' +
                                            dw +
                                            '">';
                                        if (f.placeHolder != false) {
                                            g += '<option value="">Tất cả</option>';
                                        }
                                        if (f.lst != null) {
                                            var data = f.lst();
                                            $(data).each(function () {
                                                g += '<option value="' + this.id + '">' + this.text + '</option>';
                                            });
                                        }
                                        g += '</select>' +
                                            '</div>' +
                                            '</div>';
                                    }
                                    break;
                                case 'optionRemote':
                                    {
                                        g += '<div class="form-group form-group-sm"  style="width: ' + hw + '">' +
                                            '<div class="input-group input-group-sm">' +
                                            '<div class="input-group-btn" > ' +
                                            '<button type="button" class="btn btn-default btn-left dropdown-toggle" ' +
                                            'title="Lộc dữ liệu" data-toggle="dropdown"><i class="icon-filter4"></i></button>' +
                                            '</div>' +
                                            '<input type="text" data-attr="' + f.attr + '" class="form-control filter-option select-option-remote" data-index="' +
                                            i +
                                            '" data-width="' + dw +
                                            '"/>';
                                        g += '</div>' +
                                            '</div>';
                                    }
                                    break;
                                case 'compoTree':
                                    {
                                        g += '<div class="form-group form-group-sm"  style="width: ' + hw + '">' +
                                            '<div class="input-group input-group-sm">' +
                                            '<div class="input-group-btn" > ' +
                                            '<button type="button" class="btn btn-default btn-left dropdown-toggle" ' +
                                            'title="Lộc dữ liệu" data-toggle="dropdown"><i class="icon-filter4"></i></button>' +
                                            '</div>';
                                        g += '<input class="form-control compo-tree" id="' + app.newGuid() + '" data-index="' + i + '"  data-attr="' + f.attr + '" type="text" />';
                                        g += '</div>' +
                                            '</div>';
                                    }
                                    break;
                                case 'compoMoney':
                                    {
                                        g += '<div class="compo-money" from to name=""  style="width: ' + hw + '"  data-attr="' + f.attr + '"></div>';
                                    }
                                    break;
                                case 'number':
                                    {
                                        g += '<div class="compo-number" from to name="  style="width: ' + hw + '""  data-attr="' + f.attr + '"></div>';
                                    }
                                    break;
                                case 'date':
                                    {
                                        g += '<div class="form-group form-group-sm"  style="width: ' + hw + '"><div class="datepicker" from to name="" data-index="' + i + '" data-attr="' + f.attr + '"></div></div>';
                                    }
                                    break;
                                case 'month':
                                    {
                                        g += '<div class="form-group form-group-sm  has-feedback has-feedback-right"  style="width: ' + hw + '"" >' +
                                            '<input class="form-control datetime-month"  data-attr="' +
                                            f.attr +
                                            '" type="text" name="' +
                                            f.attr +
                                            '"  placeholder="tháng" value="' +
                                            moment().format('MM/YYYY') +
                                            '" /> <div class="form-control-feedback"><i class="icon-calendar2"></i></div></div>';
                                    }
                                    break;
                            }
                        }

                        g += '</div>';
                    }
                    if (o.header.toolbar) {
                        g += '<div class="search-group">' + o.header.toolbar + '</div>';
                    }

                    var ul = '<div class="heading-elements"><ul class="icons-list" >';

                    if (o.header.create) {
                        ul += '<li><button class="btn btn-add btn-icon btn-xs" type="button" title="Thêm mới ' + o.header.title.toLowerCase() + '"><i class="icon-plus3"></i></button>';
                    }
                    if (o.header.sort != null) {
                        ul += '<li><button class="btn btn-sort btn-icon btn-xs" title="Sắp xếp"><i class="icon-sort-alpha-asc"></i></button>';
                    }

                    ul += '</ul ></div>';
                    g += ul;
                    g += '</div>';
                }

                switch (o.type) {
                    case 'list':
                        {
                            g += '<div class="group-content scroller ' + (o.header != null ? 'has-header' : '') + '">';
                            g += app.loading(true);
                            g += '<ul class="media-list media-list-linked media-list-bordered"></ul>';
                        }
                        break;
                    case 'grid':
                        {
                            g += '<div class="apply-advance-grid" style="">';

                            g += '<div class="group-content ' + (o.header != null ? 'has-header' : '') + '" style="width: ' + (w - 15) + 'px">';
                            o.gridId = app.newGuid();
                            g += '<div id="' + o.gridId + '" ></div>';
                            g += '</div>';
                        }
                        break;
                    case 'html':
                        {
                            g += '<div class="group-content scroller ' + (o.header != null ? 'has-header' : '') + '">';
                            g += app.loading(true);
                            g += '<div class="html-content"></div>';
                        } break;
                    case 'levelGrid':
                        {
                            g += '<div class="apply-level-grid" style="">';

                            g += '<div class="group-content ' + (o.header != null ? 'has-header' : '') + '" style="width: ' + (w - 15) + 'px">';
                            o.gridId = app.newGuid();
                            g += '<div id="' + o.gridId + '" ></div>';
                            g += '</div>';
                        }
                        break;
                    default:
                        {
                            g += '<div class="group-content scroller ' + (o.header != null ? 'has-header' : '') + '">';
                            g += app.loading(true);
                        } break;
                }

                g += '</div>';

                if (o.contextMenu != null) {
                    var cm = '<div class="context-menu-popup">' +
                        '<ul class="dropdown-menu">';
                    for (i = 0; i < o.contextMenu.length; i++) {
                        var c = o.contextMenu[i];
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
                    cm += '</ul></div>';
                    g += cm;
                }

                g += '</div>';
                lg.append(g);

                if (o.width.indexOf('px') > 0) {
                    left += parseInt(o.width.substr(0, o.width.length - 2));
                } else if (o.width.indexOf('%') > 0) {
                    v = parseInt(o.width.substr(0, o.width.length - 1));
                    left += w;
                }
            });
            l.staticEvents();

            if (set.autoLoad) {
                l.loadData(0);
            }
        }
        l.init();
        return this;
    };
}(jQuery));