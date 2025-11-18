var table;

$(document).ready(function () {
    var panel = '#AppItemList_panel';
    table = $(panel + " .apply-table").advanceGrid({
        dataUrl: '/AppItem/AppItemList',
        model: "AppItem",
        editController: '/AppItem',
        checkAll: true,
        width: {},
        filterable: true,
        height: { top: 250 },
        modal: { type: 1, width: '900px', title: 'Ứng dụng' },
        toolbars: {
            reload: { ele: panel + ' .main-toolbar .btn-reload' }
        },
        contextMenu: ['edit'],
        paging: { options: [10, 20, 30, 50] },
        loadModalCallback: function (row) {
            var modalId = 'AppItemFormEditModal';
            
            $('#' + modalId + ' .btn-submit').unbind('click').click(function () {
                var btn = $(this);
                btn.button('loading');
                
                var formData = $('#' + modalId + ' form').serialize();
                
                $.ajax({
                    url: '/AppItem/AppItemEdit',
                    type: 'POST',
                    data: formData,
                    success: function (result) {
                        btn.button('reset');
                        
                        if (result.success) {
                            $('#' + modalId).modal('hide');
                            table.loadData();
                            
                            if (typeof app !== 'undefined' && typeof app.notify === 'function') {
                                app.notify('success', result.message);
                            }
                        } else {
                            if (typeof app !== 'undefined' && typeof app.notify === 'function') {
                                app.notify('error', result.message);
                            } else {
                                alert(result.message);
                            }
                        }
                    },
                    error: function () {
                        btn.button('reset');
                        if (typeof app !== 'undefined' && typeof app.notify === 'function') {
                            app.notify('error', 'Có lỗi xảy ra ra khi lưu');
                        } else {
                            alert('Có lỗi xảy ra ra khi lưu');
                        }
                    }
                });
            });
        },
        params: { search: { hasCount: true, limit: 20 } },
        head: { height: 60, groups: [50, 250, 150, 200, 80, 50, 110, 200, 200, 200, 200] },
        skipCols: 0,
        cols: {
            left: [[]],
            right: [[
                { title: 'STT', style: "height:60px" },
                { title: 'Tên ứng dụng' },
                { title: 'Nhóm' },
                { title: 'URL' },
                { title: 'Icon' },
                { title: 'Ưu tiên' },
                { title: 'Trạng thái' },
                { title: 'Người tạo' },
                { title: 'Ngày tạo' },
                { title: 'Người sửa' },
                { title: 'Ngày sửa' }
            ]]
        },
        rows: [
            { type: 'ai', style: 'text-align: center;' },
            {
                type: 'text', attribute: 'Name', style: 'font-weight: bold',
                filter: { type: 'contains', attr: 'keyword' },
                render: function (row) {
                    if (row.Name) {
                        return '<a class="Detail" id="' + row.Id + '">' + row.Name + '</a>';
                    }
                    return '';
                }
            },
            {
                type: 'text', attribute: 'CategoryId',
                class: 'text-center',
                render: function (row) {
                    return row.CategoryName;
                },
                filter: {
                    type: 'option',
                    ajax: {
                        url: '/Category/CategoryList',
                        data: { hasCount: false, limit: 100 }, 
                        dataType: 'json',
                        attr: { id: 'Id', text: 'Name' },
                        success: function (response) {
                            var list = response && response.Many ? response.Many : response;
                            console.log('Category response:', list);
                            return list;
                        }
                    }
                }
            },
            {
                type: 'text', attribute: 'Url',
                render: function (row) {
                    if (row.Url) {
                        return '<a href="' + row.Url + '" target="_blank" title="' + row.Url + '">' + 
                               (row.Url.length > 30 ? row.Url.substring(0, 30) + '...' : row.Url) + 
                               '</a>';
                    }
                    return '';
                }
            },
            {
                type: 'text', attribute: 'Icon',
                render: function (row) {
                    var icon = row.Icon;
                    if (!icon) return '';

                    // detect FontAwesome / class icon
                    var isFa = (icon.indexOf('fa-') >= 0) || (icon.indexOf('fas') === 0) || (icon.indexOf('fab') === 0) || (icon.indexOf('fal') === 0) || (icon.indexOf('far') === 0);

                    // detect URL / data URI / absolute path
                    var isUrl = (typeof icon === 'string') && (icon.indexOf('data:') === 0 || icon.indexOf('/') === 0 || icon.indexOf('http') === 0);

                    if (isFa) {
                        return '<i class="' + icon + '" style="font-size:18px;margin-right:6px;"></i> ' + icon;
                    } else if (isUrl) {
                        return '<img src="' + icon + '" style="height:28px;max-width:120px;object-fit:contain;border:1px solid #eee;padding:2px;" />';
                    } else {
                        // fallback: plain text or class
                        return '<span>' + icon + '</span>';
                    }
                }
            },
            { type: 'text', attribute: 'Prioritize', style: 'text-align: center' },
            {
                type: 'text',
                attribute: 'Status',
                class: 'text-center',
                render: function (row) {
                    var status = row.Status;
                    var html = '';
                    switch (status) {
                        case 0:
                            html = '<span class="badge badge-warning">Dừng</span>';
                            break;
                        case 1:
                            html = '<span class="badge badge-success">Hoạt động</span>';
                            break;
                    }

                    return html;
                },
                filter: {
                    type: 'option',
                    lst: function () {
                        return [
                            { id: '1', text: 'Hoạt động' },
                            { id: '0', text: 'Dừng' }
                        ];
                    }
                }
            },
            { type: 'text', attribute: 'CreatedBy' },
            { type: 'text', attribute: 'CreatedDate' },
            { type: 'text', attribute: 'UpdatedBy' },
            { type: 'text', attribute: 'UpdatedDate' }
        ]
    });

    console.log('Binding btn-add...');
    console.log('Button exists:', $(panel + ' .main-toolbar .btn-add').length);

    $(panel + ' .main-toolbar .btn-add').off('click').on('click', function () {
        console.log('Nút Thêm mới được click');
        editAppItem(0, function () {
            table.loadData();
        });
    });
});

function editAppItem(id, callback) {
    var modalTitle = id > 0 ? 'Cập nhật ứng dụng' : 'Thêm mới ứng dụng';
    var mid = 'editAppItemModal';

    app.createPartialModal({
        url: '/AppItem/AppItemEdit',
        data: {
            id: id || 0
        },
        modal: {
            title: modalTitle,
            width: '900px',
            id: mid,
            model: 'AppItem'
        }
    }, function () {
        $('#' + mid + ' .btn-submit').unbind('click').click(function () {
            var btn = $(this);
            btn.button('loading');

            var formData = $('#' + mid + ' form').serialize();

            $.ajax({
                url: '/AppItem/AppItemEdit',
                type: 'POST',
                data: formData,
                success: function (result) {
                    btn.button('reset');

                    if (result.success) {
                        $('#' + mid).modal('hide');

                        if (typeof app !== 'undefined' && typeof app.notify === 'function') {
                            app.notify('success', result.message);
                        }

                        if (callback) {
                            callback();
                        }
                    } else {
                        if (typeof app !== 'undefined' && typeof app.notify === 'function') {
                            app.notify('error', result.message);
                        } else {
                            alert(result.message);
                        }
                    }
                },
                error: function () {
                    btn.button('reset');
                    if (typeof app !== 'undefined' && typeof app.notify === 'function') {
                        app.notify('error', 'Có lỗi xảy ra khi lưu dữ liệu');
                    } else {
                        alert('Có lỗi xảy ra khi lưu dữ liệu');
                    }
                }
            });
        });
    });
}
