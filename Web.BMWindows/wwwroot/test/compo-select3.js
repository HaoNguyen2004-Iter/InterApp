
(function ($) {
    $.fn.compoSelect3 = function (options) {
        var s = this;

        var selector = this.selector;

        var set = $.extend({
            selectCallback: null,
            width: null,
            placeHolder: null,
            multi: false,
            lst: null,
            ajax: null,
            name: null,
            value: null,
            moreUrl: null,
            reloadDropdown: null,
            dropWidth: 400,
            beforeSearch: null
        }, options);
        var item = set.item;
        s.container = null;
        s.dropdown = null;
        s.days = [];

        s.drawLis = function (data, parent, level, val) {
            var str = '';
            $(data).each(function () {
                if (this[item.parent] == parent) {
                    var v = val + this[item.value] + ';';
                    str += '<li val="' +
                        v +
                        '" dataid="' +
                        this[item.value] +
                        '" parent="' +
                        this[item.parent] +
                        '">' +
                        '<a href="javascript:void(0)" class="level-' +
                        level +
                        '" title="' +
                        this[item.text] +
                        '"><i class="fa fa-plus-square-o"></i>' +
                        this[item.text] +
                        '</a ></li >';
                    str += s.drawLis(data, this[item.value], level + 1, v);
                }
            });
            return str;
        };

        s.selectOption = function (v) {
            var name = $(selector).attr('name');
            if (set.multi) {
                var ids = [];
                var text = [];

                $(v).each(function () {
                    ids.push(this.id);
                    text.push(this.text);
                });
                $(selector).find('input[name="' + name + '"]').val(ids.join(','));
                $(selector).find('input[name="' + name + '"]').attr('data-text', text.join(','));
                s.container.find('.btn-group').addClass('has-value');
                s.container.find('.btn').attr('title', text.join(', '));
                s.container.find('.btn span').text(text.join(', '));
            } else {
                s.container.find('.btn-group').addClass('has-value');
                $(selector).find('input[name="' + name + '"]').val(v.id);
                $(selector).find('input[name="' + name + '"]').attr('data-text', v.text);
                s.container.find('.btn span').text(v.text);
            }

            set.value = v;
        }

        s.positionDropdown = function () {

            var $dropdown = s.dropdown,
                container = s.container,
                offset = container.offset(),
                height = container.outerHeight(false),
                width = set.dropWidth,
                dropHeight = $dropdown.outerHeight(false),
                $window = $(window),
                windowWidth = $window.width(),
                windowHeight = $window.height(),
                viewPortRight = $window.scrollLeft() + windowWidth,
                viewportBottom = $window.scrollTop() + windowHeight,
                dropTop = offset.top + height,
                dropLeft = offset.left,
                enoughRoomBelow = dropTop + dropHeight <= viewportBottom,
                enoughRoomAbove = (offset.top - dropHeight) >= $window.scrollTop(),
                dropWidth = set.dropWidth,
                enoughRoomOnRight = function () {
                    return dropLeft + dropWidth <= viewPortRight;
                },
                enoughRoomOnLeft = function () {
                    return offset.left + viewPortRight + container.outerWidth(false) > dropWidth;
                },
                aboveNow = $dropdown.hasClass("drop-above"),
                bodyOffset,
                above,
                changeDirection,
                css,
                resultsListNode,
                body = $(document.body);
            if (aboveNow) {
                above = true;
                if (!enoughRoomAbove && enoughRoomBelow) {
                    changeDirection = true;
                    above = false;
                }
            } else {
                above = false;
                if (!enoughRoomBelow && enoughRoomAbove) {
                    changeDirection = true;
                    above = true;
                }
            }

            if (changeDirection) {
                $dropdown.hide();
                offset = container.offset();
                height = container.outerHeight(false);
                width = container.outerWidth(false);
                dropHeight = $dropdown.outerHeight(false);
                viewPortRight = $window.scrollLeft() + windowWidth;
                viewportBottom = $window.scrollTop() + windowHeight;
                dropTop = offset.top + height;
                dropLeft = offset.left;
                dropWidth = $dropdown.outerWidth(false);
                $dropdown.show();
                if (this.focusSearch != null) {
                    this.focusSearch();

                }
            }

            if (body.css('position') !== 'static') {
                bodyOffset = body.offset();
                dropTop -= bodyOffset.top;
                dropLeft -= bodyOffset.left;
            }
            if (!enoughRoomOnRight() && enoughRoomOnLeft()) {
                dropLeft = offset.left + container.outerWidth(false) - dropWidth;
            }

            css = {
                left: dropLeft,
                width: width
            };
            if (above) {
                container.addClass("drop-above");
                $dropdown.addClass("drop-above");
                dropHeight = $dropdown.outerHeight(false);
                css.top = offset.top - dropHeight;
                css.bottom = 'auto';
            }
            else {
                css.top = dropTop;
                css.bottom = 'auto';
                container.removeClass("drop-above");
                $dropdown.removeClass("drop-above");
            }

            $dropdown.css(css);
        }

        s.itemEvents = function () {
            var ele = s.dropdown;
            var ct = ele.find('.compo-items table');
            ct.find(' tr.li-single td').unbind().click(function (e) {
                if (e.target !== this)
                    return;
                var tr = $(this).closest('tr');
                var val = tr.attr('dataid');
                var text = tr.attr('data-text');
                var obj = {
                    id: val,
                    text: text
                };
                s.selectOption(obj);
                $('.compo-select3-drop').remove();
                $('.compo-select3-mask').remove();

                var inp = $(selector).find('input[type="hidden"]');
                inp.addClass('has-change');

                if (set.selectCallback != null) {
                    set.selectCallback(obj, inp);
                }
                s.container.find('.btn').removeClass('open');
            });

            ct.find(' tr.li-multi input[type="checkbox"]').unbind().click(function (e) {
                if (e.target !== this)
                    return;

                var inp = $(selector).find('input[type="hidden"]');
                inp.addClass('has-change');

                var checked = $(this).is(":checked");

                var val = $(this).val();
                var text = $(this).attr('data-text')
                var v = [];
                var csd = '.compo-select3-drop';
                var ci = $(csd + ' .compo-items.uncheck .table tbody');
                var cic = $(csd + ' .compo-items.check .table tbody');
                var v = set.value;

                if (v == null) {
                    v = [];
                }
                if (checked) {
                    v.push({
                        id: Number(val),
                        text: text
                    });
                    cic.append(this.closest('tr'))
                }
                else {
                    v = v.filter(function (x) {
                        return x.id != val;
                    });

                    ci.append(this.closest('tr'))

                }
                s.selectOption(v);
            });

        }

        s.genText = function (o, attr) {
            if (attr != null) {
                var v = o[attr];
                if (v != null)
                    return v;
            }
            return '';
        }

        s.searchRemote = function (key) {
            var csd = '.compo-select3-drop';
            var ci = $(csd + ' .compo-items.uncheck');
            var cic = $(csd + ' .compo-items.check');
            var cib = $(csd + ' .compo-items')
            var gid = app.newGuid();
            if (set.ajax != null) {
                var a = set.ajax;
                a.data.keyword = key;
                var par = a.data;
                if (set.beforeSearch != null) {
                    data = set.beforeSearch(par, $(selector));
                }

                s.showLoading();
                app.loadData(
                    a.url,
                    a.data,
                    null,
                    function (result) {
                        s.hideLoading();

                        ci.find('table').html('');
                        cic.find('table').html('');
                        cib.find('table').html('');

                        var data = result;

                        a = set.ajax;

                        if (data.length > 0) {

                            $(data).each(function () {

                                if (set.multi) {
                                    var isCheck = set.value?.find(item => item.text == this[a.attr.mainText])
                                    if (isCheck) {
                                        var tr = '<tr dataid="' + this[a.attr.id] + '" class="' + (set.multi ? 'li-multi' : 'li-single') + '" data-text="' + this[a.attr.mainText] + '">';
                                        if (set.multi) {
                                            tr += `<td class="chb"><input ${isCheck ? 'checked' : ''} type="checkbox" value="` + this[a.attr.id] + '" name="select3_' + gid + '" data-text="' + this[a.attr.mainText] + '" /></td>'
                                        }
                                        tr += '<td class="td1">' + s.genText(this, a.attr.text) + '</td>';
                                        tr += '<td class="td2">' + s.genText(this, a.attr.text2) + '</td>';
                                        tr += '<td class="td3">' + s.genText(this, a.attr.text3) + '</td>';
                                        tr += '</tr>';
                                        cic.find('table').append(tr);
                                    } else {
                                        var tr = '<tr dataid="' + this[a.attr.id] + '" class="' + (set.multi ? 'li-multi' : 'li-single') + '" data-text="' + this[a.attr.mainText] + '">';
                                        if (set.multi) {
                                            tr += `<td class="chb"><input ${isCheck ? 'checked' : ''} type="checkbox" value="` + this[a.attr.id] + '" name="select3_' + gid + '" data-text="' + this[a.attr.mainText] + '" /></td>'
                                        }
                                        tr += '<td class="td1">' + s.genText(this, a.attr.text) + '</td>';
                                        tr += '<td class="td2">' + s.genText(this, a.attr.text2) + '</td>';
                                        tr += '<td class="td3">' + s.genText(this, a.attr.text3) + '</td>';
                                        tr += '</tr>';
                                        ci.find('table').append(tr);
                                    }
                                } else {


                                    var tr = '<tr dataid="' + this[a.attr.id] + '" class="' + 'li-single' + '" data-text="' + this[a.attr.mainText] + '">';

                                    tr += '<td class="td1">' + s.genText(this, a.attr.text) + '</td>';
                                    tr += '<td class="td2">' + s.genText(this, a.attr.text2) + '</td>';
                                    tr += '<td class="td3">' + s.genText(this, a.attr.text3) + '</td>';
                                    tr += '</tr>';
                                    ci.find('table').append(tr);
                                    cib.find('table').append(tr);
                                }
                            });
                        }
                        else {
                            var tr = '<tr class="tr-empty"><td>Không tìm thấy dữ liệu phù hợp</td></tr>';

                            if (set.multi) {
                                ci.find('table').append(tr);
                            } else {
                                cib.find('table').append(tr);
                            }
                        }
                        ci.addClass('loaded');
                        cib.addClass('loaded');
                        s.itemEvents();
                    });
            }
        }

        s.showLoading = function () {
            $('.compo-select3-drop .search-spinner').css('display', 'block');
        }

        s.hideLoading = function () {
            $('.compo-select3-drop .search-spinner').css('display', 'none');
        }

        s.enable = function (b) {
            s.container.find('.btn').prop('disabled', !b);
        }

        s.dropEvents = function () {
            var ele = s.dropdown;
            var csd = '.compo-select3-drop';
            $('.compo-select3-mask').unbind().click(function () {
                $('body').find('.compo-select3-drop').remove();
                $(this).remove();
                s.container.find('.btn').removeClass('open');
                if (set.selectCallback != null) {
                    set.selectCallback(set.value, $(selector).find('input[type="hidden"]'));
                }
            });

            $(csd + ' .search-control').focus();

            var ci = $(csd + ' .compo-items');

            var load = !ci.hasClass('loaded') || set.reloadDropdown;

            if (load) {
                var gid = app.newGuid();

                switch (set.type) {
                    case 'option': {
                        if (set.lst != null) {
                            var data = set.lst();
                            ci.find('table').html('');
                            s.hideLoading();
                            $(data).each(function () {
                                var tr = '<tr dataid="' + this.id + '" class="' + (set.multi ? 'li-multi' : 'li-single') + '" data-text="' + this.mainText + '">';
                                if (set.multi) {
                                    //tr += '<td class="chb"><input type="checkbox" value="' + this.id + '" name="select3_' + gid + '" data-text="' + this.mainText + '" /></td>';
                                }
                                tr += '<td>' + (this.text != null ? this.text : '') + '</td>';
                                tr += '<td class="td2">' + (this.text2 != null ? this.text2 : '') + '</td>';
                                tr += '<td class="td3">' + (this.text3 != null ? this.text3 : '') + '</td>';
                                tr += '</tr>';
                                ci.find('table').append(tr);
                            });
                            ci.addClass('loaded');
                            s.itemEvents();
                        }
                        if (set.ajax != null) {
                            var a = set.ajax;
                            s.showLoading();
                            app.loadData(
                                a.url,
                                a.data,
                                null,
                                function (result) {
                                    s.hideLoading();
                                    ci.find('table').html('');
                                    var data = result;
                                    $(data).each(function () {
                                        var tr = '<tr dataid="' + this[a.attr.id] + '" class="' + (set.multi ? 'li-multi' : 'li-single') + '" data-text="' + this[a.attr.mainText] + '">';
                                        if (set.multi) {
                                            tr += '<td class="chb"><input type="checkbox" value="' + this[a.attr.id] + '" name="select3_' + gid + '" data-text="' + this[a.attr.mainText] + '" /></td>'
                                        }
                                        tr += '<td class="td1">' + (a.attr.text != null ? this[a.attr.text] : '') + '</td>';
                                        tr += '<td class="td2">' + (a.attr.text2 != null ? this[a.attr.text2] : '') + '</td>';
                                        tr += '<td class="td3">' + (a.attr.text3 != null ? this[a.attr.text3] : '') + '</td>';
                                        tr += '</tr>';
                                        ci.find('table').append(tr);
                                    });
                                    ci.addClass('loaded');

                                    s.itemEvents();
                                });
                        }
                    } break;
                    case 'remote': {
                        s.searchRemote(null);
                    } break;
                }
            } else {
                s.itemEvents();
            }

            var globalTimeout;
            ele.find('.search-control').unbind().keyup(function () {
                var ele = $(this);
                var key = $(this).val();
                key = key.toLowerCase();
                if (globalTimeout != null) {
                    clearTimeout(globalTimeout);
                }
                var csd = '.compo-select3-drop';
                var ci = $(csd + ' .compo-items');

                globalTimeout = setTimeout(function () {
                    switch (set.type) {
                        case 'option': {
                            var lis = ci.find('.table tr');
                            $(lis).each(function () {
                                var li = $(this);
                                var tds = li.find('td');
                                var match = false;
                                $(tds).each(function () {
                                    var text = li.text();
                                    text = text.toLowerCase();
                                    if (text.indexOf(key) != -1) {
                                        match = true;
                                        return;
                                    }
                                });

                                if (match) {
                                    li.css('display', 'table-row');
                                }
                                else {
                                    li.css('display', 'none');
                                }
                            })
                        } break;
                        case 'remote': {
                            s.searchRemote(key);
                        } break;
                    }
                    clearTimeout(globalTimeout);
                }, 200);
            });

        }

        s.open = function (btn) {
            if (btn == null) {
                btn = s.container.find('.btn');
            }
            btn.addClass('open');
            s.positionDropdown();
            $('body').append('<div class="compo-select3-mask"></div>');
            $('body').append(s.dropdown);

            var inp = $(selector).find('input[type="hidden"]');

            inp.removeClass('has-change');

            s.dropEvents();
        }

        s.containerEvents = function () {
            s.container.find('.btn-fil').unbind().click(function () {
                var btn = $(this);
                s.open(btn);
            });

            s.container.find('.btn-delete').unbind().click(function () {
                var btn = $(this);
                s.open(btn);

                if (set.multi) {
                    s.selectOption([]);
                } else {
                    s.selectOption({
                        id: null,
                        text: set.placeHolder != null ? set.placeHolder : ''
                    });
                }
                $('.compo-select3-drop').remove();
                $('.compo-select3-mask').remove();
                if (set.selectCallback != null) {
                    set.selectCallback(set.value, $(selector).find('input[type="hidden"]'));
                }
                s.container.find('.btn-group').removeClass('has-value');
                s.container.find('.btn').removeClass('open');
            });

        }

        s.data = null;

        s.init = function () {
            //$(selector).css('display', 'none');

            var txt = set.placeHolder != null ? set.placeHolder : '';
            var value = '';
            if (set.value != null) {
                if (set.multi) {
                    var t1 = [];
                    var t2 = [];
                    $(set.value).each(function () {
                        t1.push(this.id);
                        t2.push(this.text);
                    });
                    txt = t2.join(', ');
                    value = t1.join(',');
                } else {
                    txt = set.value.text;
                    value = set.value.id;
                }
            }

            var html = '<div class="compo-select3" style="' + (set.width != null ? 'width:' + set.width + 'px' : '') + '">';
            html += '<div class="btn-group btn-group-sm ' + (set.groupSize != null ? 'btn-group-' + set.groupSize : '') + '">' +
                '<button type="button" class="btn btn-default btn-fil">' +
                '<span>' + txt + '</span>' +
                '<i class="icon-arrow-down5"></i></button>' +
                '<button type="button" class="btn-delete btn-default btn"><i class="icon-x"></i></button>' +
                '</div></div>';

            $(html).insertAfter($(selector));

            s.container = $(selector).next();
            s.dropdown = $('<div class="compo-select3-drop" style="width: ' + set.dropWidth + 'px"></div>');
            var lg, v;
            $(selector).append('<input class="form-control select3" style="display: none" type="hidden" name="' + $(selector).attr('name') +
                '" value="' + value + '" data-text="' + txt + '" attr="' + $(selector).attr('attr') + '" />');
            if (set.value != null) {
                s.selectOption(set.value);
            }

            var str = '<div class="input-group input-group-xs ' + (set.moreUrl != null ? 'has-view-more' : '') + '">' +
                '<input type="text" class="form-control search-control" placeholder="Tìm kiếm" />' +
                '<i class="icon-spinner10 spinner search-spinner"></i>';

            if (set.moreUrl != null) {
                str += '<span class="input-group-btn"> ' +
                    '<a href="' + set.moreUrl + '" class="btn btn-default btn-link text-bold" target="_blank">Mở danh mục</a> ' +
                    '</span>';
            }
            str += ' </div>';
            s.dropdown.append(str);

            var tableMulti = `<div class="table-container">
                            <div>Đã chọn</div>
                            <div class="compo-items check">
                                <table class="table"></table>
                            </div><div>Danh mục</div>
                            <div class="compo-items uncheck">
                                <table class="table">
                                </table>
                            </div>
                        </div>`
            var table = `<div class="compo-items">
                            <table class="table">
                            </table>
                        </div>`

            s.dropdown.append(set.multi ? tableMulti : table);
            //s.dropEvents();
            s.containerEvents();

        }

        s.init();

        return s;
    }
}(jQuery));