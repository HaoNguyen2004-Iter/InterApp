var mSelectors = [];
var atmSelector;
var mediaDomain = '';
function MediaSelector(options) {
    var s = options.selector;
    var t = this;
    t.options = options;
    $(s + ' ul').sortable({
        placeholder: "ui-state-highlight",
        update: function () {
            t.updateData();
        }
    });
    t.updateData = function () {
        var sid = s;
        var ops = t.options;

        if (atmSelector != null) {
            sid = '#' + atmSelector.id;
            ops = atmSelector.options;
        }

        if (ops.selectType == 'multiple') {
            var val = [];
            var id = '#' + t.id;
            $(sid + ' li').each(function () {
                val.push($(this).attr('path'));
            });
            $(sid + ' input[type="hidden"]').val(val.join(';'));
            if ($(id + ' ul').html() == '') {
                $(id + ' ul').css('display', 'none');
            } else {
                $(id + ' ul').css('display', 'block');
            }
        }
    }
    t.callbackEvents = function () {
        if (t.options.selectType == 'multiple') {
            $(s + ' .remove').unbind().click(function () {
                $(this).closest('li').remove();
                t.updateData();
            });

            $(s + ' ul').sortable("refresh");
            //$(s + ' ul').unbind().disableSelection();
        } else if (t.options.selectType == 'single') {
            $(s + ' .remove').unbind().click(function () {
                $(s + ' img').attr('src', mediaDomain + app.thumb('images', null, '375x250'));
                $(s + ' input').val('');
            });
        }
    }
    t.drawImageItem = function (file) {
        var li = '<li class="item img" path="' + file.path + '">';
        li += '<div class="cover">';
        li += '<img src="' + app.thumb(null, mediaDomain + file.path, '375x250') + '" />';
        li += '</div><div class="actions">';
        li += '<button class="btn btn-default btn-xs remove"><i class="fa fa-times"></i></button></div>';
        li += '</li>';
        return li;
    }
    t.drawFileItem = function (file) {
        var li = '<li class="item file" path="' + file.path + '"><div class="btn-group btn-group-sm file-group" style="margin: 0">'
            + '<button class="btn btn-white ell" type="button">' + file.name + '</button>'
            + '<button class="btn btn-default remove" type="button"><i class="fa fa-times" style="margin:0"></i></button>'
            + '</div></li>';
        return li;
    }

    if (t.options.selectType == 'single') {
        $(s + ' img').attr('src', mediaDomain + app.thumb('images', t.options.gallery, '375x250'));
        t.callbackEvents();
    } else {
        if (typeof t.options.gallery != 'undefined' && t.options.gallery != '') {
            var arr = t.options.gallery.split(';');
            if (arr.length > 0) {
                $.each(arr, function (k, i) {
                    $(s + ' ul').append(t.drawImageItem({
                        path: i
                    }));
                });
                t.callbackEvents();
            }
        }
        t.updateData();
    }

    t.show = function (callback) {
        t.loadManager(function () {
            $('#mediaManagerModal').modal('show');
            if (callback != null) {
                callback();
            }
        });
    }
    t.loadManager = function (callback) {
        var ops = atmSelector != null ? atmSelector.options : t.options;
        if ($('#mediaManagerModal').length == 0) {
            loadData(mediaDomain + '/apiMedia/getMediaManagerModal', {
                isMobile: options.isMobile,
                dataType: 'html'
            }, null, function (result) {
                $('body').append(result);
                initMediaManager(ops);
                if (callback != null) {
                    callback();
                }
            });
        } else {
            mediaViewModel.clearSelected();
            mediaViewModel.setOptions(ops);
            if (callback != null) {
                callback();
            }
        }
    }
    t.options.receiveFiles = function (data) {
        $('#mediaManagerModal').modal('hide');
        if (atmSelector != null) {
            t.drawData(data);
        }

        if (t.options.selectFilesOutCallback != null) {
            t.options.selectFilesOutCallback(data);
        }
    }

    t.drawData = function (data) {
        var id = '#' + atmSelector.id;
        if (data.length > 0) {
            switch (atmSelector.options.selectType) {
                case 'single':
                    {
                        setTimeout(function () {
                            $(id + ' input').val(mediaDomain + data[0].path);
                            $(id + ' img')
                                .attr('src', mediaDomain + app.thumb('images', data[0].path, '375x250'))
                                .css('max-width', '250px');
                            t.callbackEvents();
                            t.updateData();
                        }, 200);
                    }
                    break;
                case 'multiple':
                    {
                        var ul = $(id + ' ul');
                        var template = ul.attr('template');
                        setTimeout(function () {
                            $.each(data, function (k, i) {
                                if (template == 'image') {
                                    ul.append(t.drawImageItem(i));
                                } else {
                                    ul.append(t.drawFileItem(i));
                                }
                            });
                            t.callbackEvents();
                            t.updateData();
                        }, 200);
                    } break;
            }
        }
        if (t.options.callback != null) {
            t.options.callback(data);
        }
    }
    t.init = function () {
        var l = $(s + " .select-media-btn");

        l.click(function () {
            var btn = $(this);

            var sid = $(this).closest('.media-selector').attr('id');
            $(mSelectors).each(function () {
                if (this.id == sid) {
                    atmSelector = this;
                    return;
                }
            });

            btn.button('loading');
            t.show(function () {
                btn.button('reset');
            });
        });
        $(s + ' .upload-btn').click(function () {
            $(s + ' .btn-group input[type="file"]').click();
            var sid = $(this).closest('.media-selector').attr('id');
            $(mSelectors).each(function () {
                if (this.id == sid) {
                    atmSelector = this;
                    return;
                }
            });
        });

        $(s + ' .btn-group input[type="file"]').change(function () {
            var files = $(this).get(0).files;
            t.loadManager(function () {
                mediaUploader.upload(files, function (result) {
                    t.drawData(result);
                });
            });
        });
    }

    t.init();

    return t;
};

function initMediaSelector(options, initCallback) {

    $('.media-selector').each(function () {
        var s = $(this);
        if (s.html() == '') {
            var guid = app.newGuid();
            s.attr("id", guid);
            var data = app.hasValue(s.attr('data')) ? s.attr('data') : '';
            var op = {
                selector: "#" + guid,
                gallery: data,
                folderable: options.folderable,
                system: options.system,
                isMobile: options.isMobile,
                selectFilesOutCallback: options.selectFilesOutCallback,
                activePath: options.activePath,
                allowUpload: options.allowUpload
            };
            var type = s.attr('type');
            var template = s.attr('template');
            switch (type) {
                case 'single':
                    {
                        var d = '<div class="item">';
                        d += '<input type="hidden" name="' + s.attr('attrname') + '" value="' + data + '" />';
                        d += '<div class="cover" style="min-width: 112px">';
                        d += '<img src="" />';
                        d += '<div class="btn-group"><button type="button" class="btn btn-default btn-xs remove" ><i class="icon-x"></i></button>';
                        d += '<button type="button" class="btn btn-info btn-xs select-media-btn ladda-button" data-style="expand-right">Chọn file</button></div></div>';
                        $('#' + guid).append(d);
                        op.selectType = 'single';
                        mSelectors.push({
                            id: guid,
                            options: op
                        });
                        MediaSelector(op);
                    } break;
                case 'multiple':
                    {
                        var btnsize = 'btn-' + (options.btnSize != null ? options.btnSize : 'sm');
                        var d = '<div class="btn-group"><input type="file" multiple="" />';

                        if (options.allowUpload != false) {
                            d += '<button class="btn btn-default upload-btn ' + btnsize + '" onclick="' + "$(this).find('input').click()" + '" type="button"><i class="fa fa-upload"></i> Tải file từ máy</button>'; 
                        } 
                        
                        d += '<button type="button" class="btn btn-primary select-media-btn ' + btnsize + '" data-style="expand-right"><i class="fa fa-file-image-o"></i> Chọn file từ thư viện</button></div>';
                        d += '<input type="hidden" name="' + s.attr('attrname') + '" value="' + data + '" />';
                        d += '<ul template="' + template + '"></ul>';
                        s.html(d);
                        op.selectType = 'multiple';
                        mSelectors.push({
                            id: guid,
                            options: op
                        });
                        MediaSelector(op);
                    } break;
                default:
                    {
                        var d = '<div class="item"><button type="button" class="btn btn-info btn-xs select-media-btn ladda-button" data-style="expand-right"><i class="fa fa-image"></i> Chọn ảnh</button></div>';
                        s.html(d);
                        op.selectType = '';
                        mSelectors.push({
                            id: guid,
                            options: op
                        });
                        MediaSelector(op);
                    } break;
            }
        }
    });
    if (initCallback != null) {
        initCallback();
    }
}
