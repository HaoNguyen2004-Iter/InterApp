var isSystem = null;
var mediaViewModel, folderViewModel, mediaUploader;
var _URL = window.URL || window.webkitURL;
var mm = "#mediaManagerModal";
var baseUrl = '/';
var imgFormats = ['jpg', 'jpeg', 'png', 'gif'];
var videoFormats = ['flv', 'avi', 'mp4', 'mkv'];
var fileFormats = ['txt', 'pdf', 'xls', 'xlsx', 'doc', 'docx', 'ppt', 'pptx'];
var mediaDomain = 'https://static.spress.vn';
var Folder = function (item, options) {
    var s = this;
    if (item != null) {
        s.id = ko.observable(item.id);
        s.name = ko.observable(item.name);
        s.path = ko.observable(item.path);
        s.shared = ko.observable(false);
        s.renameable = ko.observable(options.renameable);
        s.shareable = ko.observable(false);
        s.createable = ko.observable(options.createable);
        s.folderType = ko.observable(item.folderType);
        s.state = ko.observable(item.state);
        s.deleteable = ko.observable(options.deleteable);
    } else {
        s.id = ko.observable(0);
        s.name = ko.observable('');
        s.path = ko.observable('');
        s.renameable = ko.observable(false);
        s.shareable = ko.observable(false);
        s.createable = ko.observable(false);
        s.shared = ko.observable(false);
        s.folderType = ko.observable('');
        s.state = ko.observable('');
        s.deleteable = ko.observable(false);
    }
    s.visible = ko.observable(true);
    s.active = ko.observable(false);
    s.opened = ko.observable(false);
    s.childs = ko.observableArray([]);
    s.newChild = ko.observable('');
    s.creating = ko.observable(false);
    s.renaming = ko.observable(false);

}
function FolderNode(item) {
    var f = '<li dataid="' + item.id + '" class="node" id="fn_' + item.id + '">'
        + '<div class="wtree-wholerow"></div>'
        + '<i class="wtree-icon fa wtree-ocl  fa-angle-right"></i>'
        + '<a class="wtree-anchor" href="#">'
        + '  <div class="folder-group">'
        + '     <i class="wtree-icon fa fa-folder text-orange-400" ></i>'
        + '     <i class="fa fa-user ' + (item.share_status != 'shared' ? 'hide' : '') + '"></i>'
        + '  </div>'
        + (item.renameable ?
            ' <div class="edit-form hide"><input class="form-control" value="' + item.name + '" />'
            + '     <button class="btn btn-default btn-xs cancel-rename"><i class="fa fa-times"></i></button>'
            + '  </div>' : ''
        )
        + '  <span class="name">' + item.name + '</span>'
        + '</a>'
        + '<div class="btn-group dropdown ' + (!item.createable && !item.renameable && !item.shareable && !item.removeable ? 'hide' : '') + '">'
        + '     <button class="btn btn-default btn-xs" data-toggle="dropdown" aria-expanded="false"><i class="fa fa-gear"></i></button>'
        + '     <ul class="dropdown-menu dropdown-menu-right">'
        + (item.createable ? '<li><a  href="javascript:void(0)" class="create-child" dataid="' + item.id + '"><i class="fa fa-plus"></i> Tạo thư mục</a></li>' : '')
        + (item.renameable ? '<li><a  href="javascript:void(0)" class="rename" dataid="' + item.id + '"><i class="fa fa-i-cursor"></i> Sửa tên</a></li>' : '')
        + (item.shareable ? '<li><a  href="javascript:void(0)" class="share ' + (item.share_status == 'shared' ? 'hide' : '') + '" dataid="' + item.id + '"><i class="fa fa-share-alt"></i> Chia sẽ</a></li>' : '')
        + (item.shareable ? '<li><a  href="javascript:void(0)" class="unshare  ' + (item.share_status != 'shared' ? 'hide' : '') + '" dataid="' + item.id + '"><i class="fa fa-share-alt-square"></i> Hủy chia sẽ</a></li>' : '')
        + (item.deleteable ? ' <li><a  href="javascript:void(0)" class="delete" dataid="' + item.id + '"><i class="fa fa-trash-o"></i> Xóa</a></li>' : '')
        + '     </ul>'
        + '</div>'
        + ' <ul class="wtree-children hide create-child-form">'
        + '     <li>'
        + '         <div class="wtree-anchor">'
        + '             <div class="folder-group"><i class="wtree-icon fa fa-folder" ></i></div>'
        + '             <div class="edit-form">'
        + '                 <input class="form-control" />'
        + '                 <button class="btn btn-default btn-xs cancel-create"><i class="fa fa-times"></i></button>'
        + '             </div>'
        + '         </div>'
        + '     </li>'
        + ' </ul>'
        + '</li>';
    return f;
}
var FolderViewModel = function (options) {
    var s = this,
        folderId = 0,
        r = options.root,
        activeId = 0;
    s.rootPath = options.rootPath;
    s.folders = [];
    s.currentMediaPage = 1;
    s.totalMedia = ko.observable(0);

    s.loadMedia = function() {
        
    }
    s.selectFolder = function (id) {
        $(r + " .node").each(function () {
            if ($(this).hasClass('active')) {
                $(this).removeClass('active');
            }
        });
        $('#fn_' + id).addClass('active');
        var obj = s.getDataFolder(id);
        if (obj != null) {
            $("#media_overview").fadeIn('fast');
            $.ajax({
                url: mediaDomain + '/apimedia/mediaList',
                data: {
                    path: obj.path,
                    isSystem: isSystem,
                    folderType: obj.folderType,
                    hasCount: true,
                    unlimited: true
                },
                dataType: "JSON",
                //contentType: "application/json; charset=utf-8",
                success: function (result) {
                    $("#media_overview").fadeOut('fast');
                    if (result.Many.length > 0) {
                        if ($('#childs_of_' + id).length == 0) {
                            $("#fn_" + id).append('<ul class="wtree-children" style="display:none" id="childs_of_' + id + '" ></ul>');
                            $.each(result.Many, function (k, i) {
                                if (i.type == 'folder') {
                                    var f = {
                                        id: s.folders.length,
                                        name: i.name,
                                        path: i.path,
                                        share_status: i.share_status,
                                        folderType: obj.folderType,
                                        state: '',
                                        createable: obj.folderType == 'shared' ? false : true,
                                        renameable: obj.folderType == 'shared' ? false : true,
                                        shareable: false,
                                        deleteable: obj.folderType == 'shared' ? false : true
                                    };
                                    s.folders.push(f);
                                    $('#childs_of_' + id).prepend(FolderNode(f));
                                }
                            });
                        }
                    }
                    s.events();
                    s.sortChilds(id);
                    mediaViewModel.reload(result, s, obj.path, obj.folderType);
                    $("#media_overview").fadeOut('fast');
                }
            });
        }
    }
    s.getDataFolder = function (id) {
        var obj = null;
        id = parseInt(id);
        $.each(s.folders, function () {
            if (this.id == id) {
                obj = this;
                return false;
            }
        });
        return obj;
    }
    s.sortChilds = function (id) {
        var $ul = $('ul#childs_of_' + id),
            $li = $ul.children('.node');
        $li.sort(function (a, b) {
            var an = $(a).find('> a .name').text(),
                bn = $(b).find('> a .name').text();
            if (an > bn) {
                return 1;
            }
            if (an < bn) {
                return -1;
            }
            return 0;
        });

        $li.detach().appendTo($ul);
    }
    s.deleteFolder = function (id, parent) {
        if (id != null) {
            $(s.folders).each(function (k, i) {
                if (i.id == parseInt(id)) {
                    s.deleteFolder(null, i.id);
                    s.folders.splice(k, 1);
                    $('#fn_' + id).remove();
                }
            });
        } else if (parent != null) {
            $(s.folders).each(function (k, i) {
                if (i.parent == parent) {
                    s.deleteFolder(null, i.id);
                    s.folders.splice(k, 1);
                }
            });
        }
    }
    s.loadSubFolders = function (id) {

        var obj = null;
        $(s.folders).each(function () {
            if (this.id == parseInt(id)) {
                obj = this;
                return;
            }
        });
        if (obj != null) {
            $.ajax({
                url: mediaDomain + "/apimedia/mediaList",
                data: {
                    path: obj.path,
                    isSystem: isSystem,
                    type: 'folder',
                    folderType: obj.folderType,
                    unlimited: true
                },
                dataType: 'JSON',
                success: function (result) {
                    $.each(result.Many, function (k, i) {
                        var f = {
                            id: s.folders.length,
                            parent: id,
                            name: i.name,
                            path: i.path,
                            share_status: i.share_status,
                            folderType: obj.folderType,
                            createable: obj.folderType == 'shared' ? false : true,
                            renameable: obj.folderType == 'shared' ? false : true,
                            shareable: false,
                            deleteable: obj.folderType == 'shared' ? false : true
                        };
                        s.folders.push(f);
                        $('#childs_of_' + id).append(FolderNode(f));
                    });
                    s.sortChilds(id);
                    //s.sort(obj.childs());
                    s.events();
                }
            });
        }
    }
    s.expand = function (id, path) {
        var i, html;
        if (id < 0) {
            i = $(r + ' #fn_' + activeId + ' > .wtree-ocl');
            if (i.hasClass('fa-angle-right')) {
                i.removeClass('fa-angle-right').addClass('fa-angle-down');
                $('#childs_of_' + activeId).show();
            }
            if ($('#childs_of_' + activeId).length == 0) {
                html = '<ul class="wtree-children"  id="childs_of_' + activeId + '"></ul>';
                $("#fn_" + activeId).append(html);
            }
            $(s.folders).each(function (k, i) {
                if (i.path == path) {
                    activeId = i.id;
                    return false;
                }
            });
            s.selectFolder(activeId);
        } else {
            i = $(r + ' #fn_' + id + ' > .wtree-ocl');
            if (i.hasClass('fa-angle-down')) {
                i.removeClass('fa-angle-down').addClass('fa-angle-right');
                $('#childs_of_' + id).hide();
            } else {
                i.removeClass('fa-angle-right').addClass('fa-angle-down');
                if ($('#childs_of_' + id).length == 0) {
                    html = '<ul class="wtree-children"  id="childs_of_' + id + '"></ul>';
                    $("#fn_" + id).append(html);
                } else {
                    $('#childs_of_' + id).show();
                }
                if ($("#childs_of_" + id).html() == '') {
                    s.loadSubFolders(id);
                }
            }
        }
    }
    s.insertName = function (form, type, id) {
        var input = $(form).find('input').focus();
        $(input).unbind().keyup(function (e) {
            if (e.which == 13) {
                form.addClass('hide');
                var obj = s.getDataFolder(id);
                if (obj != null) {
                    var params = {
                        name: $(this).val(),
                        type: type,
                        path: obj.path,
                        isSystem: isSystem
                    };
                    $(this).val('');
                    if (params.name != '') {
                        $.ajax({
                            url: mediaDomain + '/apimedia/createOrUpdateFolder',
                            data: params,
                            type: 'POST',
                            success: function (result) {
                                if (result != null) {
                                    if (params.type == 'new') {
                                        var f = {
                                            path: result,
                                            parent: id,
                                            name: params.name,
                                            id: s.folders.length,
                                            folderType: obj.folderType,
                                            createable: obj.folderType == 'shared' ? false : true,
                                            renameable: obj.folderType == 'shared' ? false : true,
                                            shareable: false,
                                            deleteable: obj.folderType == 'shared' ? false : true
                                        };
                                        s.folders.push(f);
                                        $('#childs_of_' + id).append(FolderNode(f));
                                    } else {
                                        $(input).closest('a').find('span').text(params.name);
                                        $.each(s.folders, function () {
                                            if (this.id == id) {
                                                this.name = params.name;
                                                return false;
                                            }
                                        });
                                        $(form).closest('.node').find('.btn-group').removeClass('hide');
                                        $(form).closest('.node').find('> a .name').removeClass('hide');
                                    }
                                }
                                s.sortChilds(id);
                                s.events();
                            }
                        });
                    }
                }
            }
        });
    }
    s.events = function () {
        $(r + ' .wtree-icon,' +
            r + ' .wtree-anchor,' +
            r + ' .wtree-ocl,' +
            r + ' .wtree-wholerow,' +
            r + ' .create-child,' +
            r + ' .rename,' +
            r + ' .share,' +
            r + ' .unshare,' +
            r + ' .delete,' +
            r + ' .reload,' +
            r + ' .add-folder,' + 
            r + ' #reload_folders').unbind();
        $(r + ' .reload').click(function () {
            s.folders = [];
            $(r + ' .wtree').html('');
            s.loadFolders();
        });
        $(r + ' .add-folder').click(function () {
            $.ajax({
                url: mediaDomain + '/apimedia/createOrUpdateFolder',
                data: {
                    name: 'New folder',
                    type: 'new',
                    //path: s.rootPath,
                    isSystem: isSystem
                },
                type: 'POST',
                success: function(result) {
                    var id = s.folders.length;
                    var f = {
                        id: id,
                        name: 'New folder',
                        path: result,
                        folderType: '',
                        renameable: true,
                        shareable: false,
                        deleteable: false,
                        createable: true
                    };
                    s.folders.push(f);
                    $(r + ' .wtree').append(FolderNode(f));
                    $('#fn_' + id).find('> .btn-group').addClass('hide');
                    var form = $('#fn_' + id).find('> a > .edit-form').removeClass('hide');
                    form.next().addClass('hide').text();
                    form.find('input').val(f.name);
                    s.insertName(form, 'rename', id);
                    s.events();
                }
            });
        });
        $(r + ' .wtree-icon,' + r + '  .wtree-anchor').hover(
            function () {
                $(this).closest('li').find('> .wtree-wholerow').addClass('wholerow-hovered');
            }, function () {
                $(this).closest('li').find('> .wtree-wholerow').removeClass('wholerow-hovered');
            }
        );
        $(r + ' .wtree-ocl').click(function () {
            s.expand($(this).closest('li').attr('dataid'), null);
        });

        $(r + ' .wtree-wholerow').click(function () {
            s.selectFolder($(this).closest('li').attr('dataid'));
        });
        $(r + ' .wtree-anchor').click(function () {
            s.selectFolder($(this).closest('li').attr('dataid'));
        });
        $(r + ' .create-child').click(function () {
            var id = $(this).attr('dataid');
            if ($('#childs_of_' + id).length == 0 || $('#childs_of_' + id).css('display') == 'none') {
                s.expand(id, null);
            }
            var form = $('#fn_' + id).find('> .create-child-form').removeClass('hide');
            s.insertName(form, 'new', id);
        });
        $(r + ' .rename').click(function () {
            $(this).closest('.btn-group').addClass('hide');
            var id = $(this).attr('dataid');
            var form = $('#fn_' + id).find('> a > .edit-form').removeClass('hide');
            var name = form.next().addClass('hide').text();
            form.find('input').val(name);
            s.insertName(form, 'rename', id);
        });
        $(r + ' .delete').click(function () {
            var id = $(this).attr('dataid');
            var obj = s.getDataFolder(id);
            if (obj.shared) {
                app.alert('<i class="fa fa-warning"></i> Không thể xóa thư mục khi đang được chia sẽ.');
            } else {
                app.confirm('warning', 'Bạn chắc chắn muốn xóa thư mục này ? ', null, function () {
                    $.ajax({
                        url: mediaDomain + "/apimedia/deleteFolder",
                        type: 'POST',
                        data: {
                            path: obj.path,
                            name: obj.name
                        },
                        success: function (result) {
                            switch (result) {
                                case 'none':
                                    {
                                        s.deleteFolder(id);
                                        s.selectFolder(s.folders[0].id);
                                    }
                                    break;
                                default:
                                    {
                                        app.alert('Có lỗi xảy ra hoặc bạn không có quyền xóa.', null);
                                    }
                            }
                        }
                    });
                });
            }
        });

        $(r + ' .cancel-rename').click(function () {
            var form = $(this).closest('.edit-form');
            var name = form.next().removeClass('hide').text();
            form.addClass('hide').find('input').val(name);
            $(this).closest('.node').find('.btn-group').removeClass('hide');
        });
        $(r + ' .cancel-create').click(function () {
            $(this).closest('.create-child-form').addClass('hide').find('input').val('');
        });
        $(r + ' .share').click(function () {
            var id = $(this).attr('dataid');
            var obj = s.getDataFolder(id);
            if (obj.shared) {
                app.alert('Chia sẽ này đã được chia sẽ', null);
            } else {
                $("#mediaShareFolderModal").modal('show');
                activeId = id;
            }
        });
        $(r + ' .unshare').click(function () {
            var id = $(this).attr('dataid');
            app.confirm('Bạn đồng ý hủy chia sẽ thư mục này ?', function () {
                var obj = s.getDataFolder(id);
                if (obj != null) {
                    $.ajax({
                        url: mediaDomain + "/apimedia/unshareFolder",
                        type: 'POST',
                        data: {
                            path: obj.path,
                            name: obj.name
                        },
                        success: function (result) {
                            switch (result) {
                                case 'none':
                                    {
                                        $('#fn_' + obj.id + ' > a .fa-user').addClass('hide');
                                        $('#fn_' + obj.id + ' > .btn-group .share').removeClass('hide');
                                        $('#fn_' + obj.id + ' > .btn-group .unshare').addClass('hide');
                                    }
                                    break;
                                default:
                                    {
                                        app.alert('Có lỗi xảy ra hoặc bạn không có quyền chia sẽ.', null);
                                    }
                            }
                        }
                    });
                }
            });
        });
        $(r + ' #reload_folders').click(function () {
            s.loadFolders();
        });
    }

    s.loadFolders = function () {
        $.ajax({
            url: mediaDomain +  "/apimedia/mediaList",
            dataType: 'JSON',
            data: {
                isSystem: isSystem,
                type: 'folder'
            },
            success: function (result) {
                if (result.Error) {
                    $(r + ' .not-allow')
                        .css('display', 'block');
                    console.log(result.Message);
                } else {
                    $(r + ' .not-allow').css('display', 'none');
                    if (result.Many.length > 0) {
                        $.each(result.Many, function (k, i) {
                            var f = {
                                id: s.folders.length,
                                name: i.name,
                                path: i.path,
                                folderType: '',
                                state: i.state,
                                renameable: !isSystem,
                                shareable: false,
                                deleteable: !isSystem,
                                createable: true
                            };
                            s.folders.push(f);
                            $(r + ' .wtree').append(FolderNode(f));
                        });
                        
                        s.selectFolder(s.folders[0].id);
                    }    
                }
                s.events();
            }
        });
    }
    s.reload = function () {
        folderId = 0;
        s.folders = [];
        s.loadFolders();
    }
    s.init = function () {
        s.loadFolders();
        $(r + ' .submitShareFolder').click(function () {
            $("#mediaShareFolderModal").modal('hide');
            var obj = s.getDataFolder(activeId);
            if (obj != null) {
                $.ajax({
                    url: mediaDomain + "/apimedia/shareFolder",
                    type: 'POST',
                    data: {
                        path: obj.path,
                        name: obj.name
                    },
                    success: function (result) {
                        switch (result) {
                            case 'none':
                                {
                                    $.each(s.folders,
                                        function () {
                                            if (this.id == obj.id) {
                                                this.shared = true;
                                                return false;
                                            }
                                        });
                                    $('#fn_' + obj.id + ' > a .fa-user').removeClass('hide');
                                    $('#fn_' + obj.id + ' > .btn-group .share').addClass('hide');
                                    $('#fn_' + obj.id + ' > .btn-group .unshare').removeClass('hide');
                                }
                                break;
                            case 'folder_has_been_share':
                                {
                                    app.alert('Chia sẽ này đã được chia sẽ', null);
                                }
                                break;
                            default:
                                {
                                    app.alert('Có lỗi xảy ra hoặc bạn không có quyền chia sẽ.', null);
                                }
                        }
                    }
                });
            }
        });

    }

    s.init();

    

    return this;
}
var File = function (item, options) {
    var s = this;
    if (item != null) {
        s.id = ko.observable(item.id);
        s.mdPath = ko.observable(mediaDomain + app.thumb(item.type, item.path, "375x250"));
        s.path = ko.observable(item.path);
        s.name = ko.observable(item.name);
        s.size = ko.observable(item.size);
        s.use_state = ko.observable(0);
    } else {
        s.id = ko.observable(0);
        s.name = ko.observable('');
        s.mdPath = ko.observable('');
        s.path = ko.observable('');
        s.size = ko.observable('');
        s.use_state = ko.observable('');
    }
    s.detail = ko.observable('');
    s.visible = ko.observable(true);
    s.active = ko.observable(false);
    s.editing = ko.observable(false);
    s.width = ko.observable(0);
    s.height = ko.observable(180);
    s.dimensions = ko.observable('');
    s.format = ko.computed(function () {
        if (s.name() == '')
            return 'file';
        var ext = s.name().replace(/^.*\./, '');
        if (jQuery.inArray(ext, imgFormats) >= 0) return 'image';
        if (jQuery.inArray(ext, videoFormats) >= 0) return 'video';
        if (jQuery.inArray(ext, fileFormats) >= 0) {
            switch (ext) {
                case 'txt': return 'text';
                case 'ppt': case 'pptx': return 'powerpoint';
                case 'doc': case 'docx': return 'word';
                case 'xls': case 'xlsx': return 'excel';
                case 'pdf': return 'pdf';
            }
            return '';
        }
        return 'file';
    });

    if (item != null && s.format() == 'image') {
        s.dimensions(item.dimensions);
        s.height(180);
        var arr = item.dimensions.split(' x ');
        var w = parseInt(arr[0]);
        var h = parseInt(arr[1]);
        console.log(item);
        if (h > 180) {
            s.width((180 * w) / h);
            s.height(180);
        } else {
            if (w > 400) {
                s.width(400);
                s.height((400 * h) / w);
            } else {
                s.width(w);
                s.height(h);
            }
        }
    }
}
var Unit = function (file, path) {
    var s = this;
    s.id = ko.observable(0);
    s.type = ko.observable('image');
    s.name = ko.observable(file.name);
    s.path = ko.observable(path);
    console.log('path to upload: ' + path);
    s.size = ko.computed(function () {
        var sizeStr = "";
        var sizeKB = file.size / 1024;
        if (parseInt(sizeKB) > 1024) {
            var sizeMB = sizeKB / 1024;
            sizeStr = sizeMB.toFixed(2) + " MB";
        } else {
            sizeStr = sizeKB.toFixed(2) + " KB";
        }
        return sizeStr;
    });
    s.uploadPercent = ko.observable(0);
    s.status = ko.observable('0%');
    s.posted = ko.observable(false);
    s.callback = null;
    var BYTES_PER_CHUNK = 1000000;

    s.uploadComplete = function (fileObj) {
        $.ajax({
            url: mediaDomain + "/apimedia/SaveChunksForLibrary",
            type: "POST",
            data: {
                fileName: s.name(),
                completed: true,
                count: fileObj.count,
                type: fileObj.type,
                fileCode: fileObj.fileCode,
                size: s.size(),
                path: app.hasValue(s.path) ? s.path : null,
                isSystem: isSystem,
                dimensions: fileObj.dimensions
            },
            success: function (result) {
                if (result == 'folder_has_been_full') {
                    app.alert('<i class="fa fa-warning"></i> Quá trình tải thất bại do ổ cứng hệ thống đã đầy. Vui lòng liên hệ người quản trị để được hỗ trợ. Xin cám ơn !');
                } else {
                    s.uploadPercent(100);
                    s.status('Hoàn tất');
                    s.posted(true);
                    if (s.callback != null) {
                        s.callback({
                            name: s.name(),
                            path: result,
                            type: fileObj.type,
                            size: s.size(),
                            dimensions: fileObj.dimensions
                        });
                    }
                }
            }
        });
    }
    s.postChunk = function (fileObj, formData) {
        var xhr = new XMLHttpRequest();
        xhr.onload = function () {
            fileObj.completed = fileObj.completed + 1;
            var percent = Math.floor(fileObj.completed / fileObj.count * 100);

            if (fileObj.completed === fileObj.count) {
                s.uploadPercent(99);
                s.status('Đang xử lý...');
                s.uploadComplete(fileObj);
            } else {
                s.uploadPercent(percent);
                s.status(percent + '%');
                s.analyst(fileObj);
            }
        };
        xhr.onreadystatechange = function () {
            if (xhr.readyState == 4) {
                if (xhr.status == 200) {
                    fileObj.fileCode = xhr.responseText;
                }
            }
        };
        xhr.open("POST", mediaDomain + "/apimedia/PostChunk", true);
        xhr.send(formData);
    }
    s.analyst = function (fileObj) {
        if (fileObj.start < fileObj.size) {
            var chunk;
            if (typeof fileObj.blob.slice === 'function') {
                chunk = fileObj.blob.slice(fileObj.start, fileObj.end);// if mozill,opera and chrome this condition call
            } else if (typeof fileObj.blob.webkitSlice === 'function')//this not perform condition use safari
            {
                chunk = fileObj.blob.webkitSlice(fileObj.start, fileObj.end);
            }
            var formData = new FormData();
            formData.append("chunk", chunk);
            formData.append("index", fileObj.completed);
            formData.append("fileCode", fileObj.fileCode);
            formData.append("type", fileObj.type);
            s.postChunk(fileObj, formData);
            fileObj.start = fileObj.end;
            fileObj.end = fileObj.start + BYTES_PER_CHUNK;
        }
    }
    s.newGuid = function () {
        function s4() {
            return Math.floor((1 + Math.random()) * 0x10000)
                .toString(16)
                .substring(1);
        }

        return s4() + s4();
    }
    s.post = function (callback) {
        if (s.valid()) {
            s.callback = callback;
            var fileObj = {
                blob: file,
                size: file.size,
                end: BYTES_PER_CHUNK,
                start: 0,
                completed: 0,
                success: false,
                type: 'images',
                extension: file.name.replace(/^.*\./, ''),
                //uploadElement: $(e).parents(".file-upload"),
                fileCode: s.newGuid(),
                count: file.size % BYTES_PER_CHUNK == 0 ? file.size / BYTES_PER_CHUNK : Math.floor(file.size / BYTES_PER_CHUNK) + 1
            };
            var img = new Image();
            img.onload = function () {
                var w = img.width,
                    h = img.height;
                fileObj.dimensions = w + ' x ' + h;
                s.analyst(fileObj);
            };
            img.src = _URL.createObjectURL(file);
        } else {
            if (callback != null) {
                s.callback();
            }
        }
    }

    s.isImageValid = function (filename) {
        var ext = filename.replace(/^.*\./, '');
        if (ext == filename) {
            ext = '';
        } else {
            ext = ext.toLowerCase();
        }
        if (jQuery.inArray(ext, imgFormats) >= 0)
            return true;
        return false;
    }
    s.isVideoValid = function (filename) {
        var ext = filename.replace(/^.*\./, '');
        if (ext == filename) {
            ext = '';
        } else {
            ext = ext.toLowerCase();
        }
        if (jQuery.inArray(ext, videoFormats) >= 0)
            return true;
        return false;
    }
    s.isDocValid = function (filename) {
        var ext = filename.replace(/^.*\./, '');
        if (ext == filename) {
            ext = '';
        } else {
            ext = ext.toLowerCase();
        }
        if (jQuery.inArray(ext, fileFormats) >= 0)
            return true;
        return false;
    }
    s.valid = ko.computed(function () {
        if (file.size > 50000 * 1024)
            return false;
        if (s.isImageValid(s.name()))
            return true;
        if (s.isVideoValid(s.name()))
            return true;
        if (s.isDocValid(s.name()))
            return true;
        return false;
    });
}
var Uploader = function (parent) {
    var s = this;
    s.parent = parent;
    s.files = ko.observableArray([]);
    s.result = ko.observableArray([]);
    s.postNumber = ko.observable(0);

    s.upload = function (files, callback) {
        s.files.removeAll();
        s.result.removeAll();
        $('#mediaUploadingModal').modal('show');
        for (var i = 0; i < files.length; i++) {
            s.files.push(new Unit(
                files[i],
                s.parent.activePath()
            ));
        }
        var posting = false;
        s.postNumber(0);

        var interval = setInterval(function () {
            if (!posting) {
                $.each(s.files(), function (k, i) {
                    if (!i.posted()) {
                        posting = true;
                        i.post(function (result) {
                            s.postNumber(s.postNumber() + 1);
                            posting = false;
                            var f = new File({
                                id: 0,
                                path: result.path,
                                name: result.name,
                                type: result.type,
                                size: result.size,
                                dimensions: result.dimensions
                            });
                            parent.files.push(f);
                            s.result.push(f);
                        });
                        return false;
                    }
                });
            }
            if (s.postNumber() == s.files().length) {
                $('#mediaUploadingModal').modal('hide');
                clearInterval(interval);
                if (callback != null) {
                    callback(ko.toJS(s.result()));
                }
            }
        }, 100);
    }

    s.init = function () {

        $(".gallery-panel .input-file-upload").on('change', function (e) { 
            var files = $(this).get(0).files;
            s.upload(files);
        });
    }

    s.init();
}

var MediaViewModel = function (options) {
    var s = this,
        page = 0;
    s.tree = null;
    s.parentPath = ko.observable('');
    s.options = options;

    //s.uploader = ko.observable(new Uploader(s));
    s.folders = ko.observableArray([]);
    // array
    s.files = ko.observableArray([]);
    s.activeFiles = ko.observableArray([]);
    s.activeFolders = ko.observableArray([]);
    s.folderType = ko.observableArray('');
    s.renameFileText = ko.observable('');
    // search
    s.keyword = ko.observable('');
    s.search = function () {
        if (s.keyword() != '') {
            $.each(s.files(), function (k, i) {
                if (i.name().toLowerCase().indexOf(s.keyword().toLowerCase()) < 0) {
                    i.visible(false);
                } else {
                    i.visible(true);
                }
            });
        } else {
            $.each(s.files(), function (k, i) {
                if (i.name().toLowerCase().indexOf(s.keyword().toLowerCase()) < 0) {
                    i.visible(false);
                } else {
                    i.visible(true);
                }
            });
        }
        return true;
    }

    // variable
    s.loading = ko.observable(false);
    s.currentMediaPage = ko.observable(1);
    s.activePath = ko.observable('');
    if (app.hasValue(options.activePath)) {
        s.activePath(options.activePath);
    }

    // sort
    s.sortType = ko.observable('A - Z');
    s.sort = function (type) {
        s.sortType(type);
        switch (type) {
            case 'A - Z':
                {
                    s.files.sort(function (left, right) {
                        return left.name() == right.name() ? 0 : (left.name() < right.name() ? -1 : 1);
                    });
                    s.folders.sort(function (left, right) {
                        return left.name() == right.name() ? 0 : (left.name() < right.name() ? -1 : 1);
                    });
                } break;
            case 'Z - A':
                {
                    s.files.sort(function (left, right) {
                        return left.name() == right.name() ? 0 : (left.name() > right.name() ? -1 : 1);
                    });
                    s.folders.sort(function (left, right) {
                        return left.name() == right.name() ? 0 : (left.name() > right.name() ? -1 : 1);
                    });
                }
                break;
        }
    }

    // list
    s.listType = ko.observable('fa-th');
    s.selectTypeList = function (val) {
        s.listType(val);
    }
    s.lazyload = function () {

    }
    // load data
    s.loadMedias = function (data, folderType) {
        if (!s.loading()) {
            $.each(data.Many, function (k, i) {
                if (i.type == 'folder') {
                    s.folders.push(new Folder({
                        id: k,
                        name: i.name,
                        path: i.path,
                        share_status: i.share_status,
                        folderType: folderType
                    }, {
                            shareable: false,
                            renameable: true
                        }));
                } else {
                    s.files.push(new File({
                        name: i.name,
                        path: i.path,
                        size: i.size,
                        dimensions: i.dimensions,
                        id: 0
                    }));
                }
            });
        }
    }
    s.viewMoreMedia = function() {
        console.log(123);
    }
    s.getMedias = function () {
        $("#media_overview").fadeIn('fast');
        $.ajax({
            url: mediaDomain + '/apimedia/mediaList',
            data: {
                isSystem: isSystem,
                file: 'file',
                folderType: 'company',
                path: options.activePath
            },
            dataType: "JSON",
            contentType: "application/json; charset=utf-8",
            success: function (result) {
                $("#media_overview").fadeOut('fast');
                s.reload(result, null, options.activePath, 'company');
            }
        });
    }
    s.reload = function (data, tree, path, folderType) {
        if (tree != null) {
            s.tree = tree;
        }
        s.activePath(path);
        s.folderType(folderType);
        s.folders.removeAll();
        s.files.removeAll();
        s.activeFiles.removeAll();
        s.activeFolders.removeAll();
        s.loadMedias(data, folderType);
    }
    s.clearSelected = function () {
        s.activeFiles.removeAll();
        $(s.files()).each(function (k, i) {
            if (i.active()) {
                i.active(false);
            }
        });
        $(mm + ' .modal-header .btn-select-file').css('display', 'none');
        $(mm + ' .modal-header .btn-options').css('display', 'none');
    }
    // events 
    s.selectFile = function (obj) {
        if (s.options.selectType == 'single') {
            s.clearSelected();
            if (!obj.active()) {
                obj.active(true);
                s.activeFiles.push(obj);
            } else {
                obj.active(false);
                s.activeFiles.remove(obj);
            }
        } else {
            if (!obj.active()) {
                obj.active(true);
                s.activeFiles.push(obj);
            } else {
                obj.active(false);
                s.activeFiles.remove(obj);
            }
        }
        if ($(mm + ' .modal-header .btn-select-file').length > 0) {
            if (s.activeFiles().length > 0) {
                $(mm + ' .modal-header .btn-select-file').css('display', 'block');
                $(mm + ' .modal-header .btn-options').css('display', 'block');
            } else {
                $(mm + ' .modal-header .btn-select-file').css('display', 'none');
                $(mm + ' .modal-header .btn-options').css('display', 'none');
            }
        }

    }
    s.setOptions = function (options) {
        s.options = options;
    }
    s.selectFolder = function (obj, event) {
        var $this = $(event.currentTarget);
        if ($this.hasClass('clicked')) {
            s.tree.expand(-1, obj.path());
            //s.reload(obj, null, false);
            return;
        } else {
            $this.addClass('clicked');
            if (!obj.active()) {
                obj.active(true);
                s.activeFolders.push(obj);
            } else {
                obj.active(false);
                s.activeFolders.remove(obj);
            }
            //your code for single click
            setTimeout(function () {
                $this.removeClass('clicked');
            }, 500);
        }//end of else
    }
    s.removeMany = function () {
        app.confirm('warning', 'Bạn đồng ý xóa những file này ?', null, function () {
            var paths = [];
            $.each(s.activeFiles(), function (k, i) {
                paths.push(i.path());
            });
            $("#media_overview").fadeIn('fast');
            $.ajax({
                url: mediaDomain + '/apimedia/deleteFiles',
                data: {
                    paths: paths
                },
                dataType: "JSON",
                type: 'POST',
                success: function () {
                    $("#media_overview").fadeOut('fast');
                    $.each(s.activeFiles(), function (k, i) {
                        s.files.remove(i);
                    });
                    s.activeFiles.removeAll();
                }
            });
        });
    }
    s.download = function () {
        if (s.activeFiles().length > 0) {
            var fp = s.activeFiles()[0].path();
            if (app.hasValue(mediaDomain)) {
                fp = mediaDomain + s.activeFiles()[0].path();
            }
            window.open(fp, '_blank');
        }
    }
    s.selectFilesComplete = function () {
        s.options.receiveFiles(ko.toJS(s.activeFiles()));
    }
    s.rename = function () {
        s.renameFileText(s.activeFiles()[0].name());
        $("#mediaRenameFileModal").modal('show');
        $("#media_rename_file_control").select();
    }
    s.getlink = function () {
        $("#mediaGetLinkModal").modal('show');
        var fp = s.activeFiles()[0].path();
        if (app.hasValue(DOMAIN_FRONT_END)) {
            fp = DOMAIN_FRONT_END + s.activeFiles()[0].path();
        }
        $("#media_file_link_control").val(fp).select();
    }
    s.submitRenameFile = function () {
        $.ajax({
            url: mediaDomain + '/apimedia/renameFile',
            data: {
                path: s.activeFiles()[0].path(),
                name: s.renameFileText()
            },
            type: 'POST',
            success: function (result) {
                s.activeFiles()[0].name(s.renameFileText());
                s.renameFileText('');
                $("#mediaRenameFileModal").modal('hide');
            }
        });
    }

    // init
    s.init = function () {
        var h = $(window).height();
        if (!options.isMobile) {
            $("#media_bindings").height(h - 95); 

            $(".gallery-panel .webaby-tree ").height((h - 208) + (!options.hasFooter ? 50 : 0));
            $(".gallery-panel .media-content").height(h - 188 + (!options.hasFooter ? 50 : 0));

            $(window).resize(function () {
                var h = $(window).height();
                $("#media_bindings").height(h - 95);

                $('.gallery-panel .webaby-tree ').height(h - 208 + (!options.hasFooter ? 50 : 0));
                $('.gallery-panel .media-content').height(h - 188 + (!options.hasFooter ? 50 : 0));

            });

            $(".gallery-panel .resize-bar").draggable({
                containment: '#gallery_container',
                axis: 'x',
                start: function () {
                    var pos = $(this).position();
                    $("#folder_bindings").css('width', pos.left + 'px');
                    $("#media_bindings").css('margin-left', pos.left + 'px');
                },
                drag: function () {
                    var pos = $(this).position();
                    $("#folder_bindings").css('width', pos.left + 'px');
                    $("#media_bindings").css('margin-left', pos.left + 'px');
                },
                stop: function () {
                    var pos = $(this).position();
                    $("#folder_bindings").css('width', pos.left + 'px');
                    $("#media_bindings").css('margin-left', pos.left + 'px');
                }
            });
        } else {
            $(mm + ' .modal-header .btn-select-file').click(function () {
                s.selectFilesComplete();
            });
            $(mm + ' .modal-header .btn-delete-file').click(function () {
                s.removeMany();
            });
        }

        $(mm + ' .select-all-files').click(function () {
            if ($(this).is(":checked")) {
                if (s.files().length == 0) {
                    new PNotify({
                        title: 'Không có file để chọn',
                        addclass: 'alert bg-warning alert-styled-left'
                    });
                } else {
                    s.activeFiles.removeAll();
                    $(s.files()).each(function (k, i) {
                        i.active(true);
                        s.activeFiles.push(i);
                    });
                }
            } else {
                if (s.activeFiles().length > 0) {
                    $(s.activeFiles()).each(function (k, i) {
                        i.active(false);
                    });
                    s.activeFiles.removeAll();
                }
            }
        });
        if (!isSystem) {
            //s.getMedias();
        }


        $('#view_more_media').unbind().click(function () {
            var btn = $(this);
        });
    }

    s.init();
}

function initMediaManager(options) {
    isSystem = options.system;
    if (options.folderable) {
        $('#folder_bindings').css('display', 'block');
        $(mm + ' .resize-bar').css('display', 'block');
        folderViewModel = new FolderViewModel({
            root: '#folder_bindings',
            isMobile: options.isMobile,
            folder: options.folder,
            rootPath: options.activePath
    });
    } else {
        $('#media_bindings').css('margin-left', '0');
    }

    mediaViewModel = new MediaViewModel(options);
    ko.applyBindings(mediaViewModel, $("#media_bindings")[0]);
    mediaUploader = new Uploader(mediaViewModel);
    ko.applyBindings(mediaUploader, $('#mediaUploadingModal')[0]);

    $(mm + ' input[type=checkbox],' + mm + ' input[type=radio]').uniform({
        radioClass: 'choice'
    });
}

