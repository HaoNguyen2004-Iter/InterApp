var table;

$(document).ready(function () {
    var panel = '#CategoryList_panel';
    table = $(panel + " .apply-table").advanceGrid({
        dataUrl: '/Category/CategoryList',
        model: "Category",
        editController: '/Category',
        width: {},
        filterable: true,
        height: { top: 250 },
        modal: { type: 1, width: '800px', title: 'Nhóm ứng dụng' },
        toolbars: {
            reload: { ele: panel + ' .main-toolbar .btn-reload' }
        },
        contextMenu: ['edit'], 
        paging: {options: [10, 20, 30, 50]},
        loadModalCallback: function (row) {
            var modalId = 'CategoryFormEditModal';
            
            $('#' + modalId + ' .btn-submit').unbind('click').click(function () {
                var btn = $(this);
                btn.button('loading');
                
                var formData = $('#' + modalId + ' form').serialize();
                
                $.ajax({
                    url: '/Category/CategoryEdit',
                    type: 'POST',
                    data: formData,
                 
                    success: function (result) {
                        btn.button('reset');
                        
                        if (result.success) {
                            // Đóng modal
                            $('#' + modalId).modal('hide');
                            
                            table.loadData();
                            
                            if (typeof app !== 'undefined' && typeof app.notify === 'function') {
                                app.notify('success', result.message);
                            }
                        } else {
                            // Hiển thị lỗi từ server
                            if (typeof app !== 'undefined' && typeof app.notify === 'function') {
                                app.notify('error', result.message);
                            } else {
                                // Fallback nếu app.notify không tồn tại
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
        },

        params: { search: { hasCount: true, limit: 20 } },
        head: { height: 60, groups: [50, 220, 100, 200, 200, 200, 200, 200] },
        skipCols: 0,
        cols: {
            left: [[]],
            right: [[
                { title: 'STT', style: "height:60px" },
                { title: 'Tên nhóm' },
                { title: 'Ưu tiên' },
                { title: 'Trạng thái' },
                { title: 'Ngày tạo' },
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
            { type: 'text', attribute: 'Prioritize', style: 'text-align: center;' },
            { 
                type: 'text', 
                attribute: 'Status',
                style: 'text-align: center;', 
                
                render: function (row) {
                   
                    var status = row.Status;
                    var html = '';
                    
                    switch(status) {
                        case 0:
                            html = '<span class="badge badge-warning">Dừng</span>';
                            break;
                        case 1:
                            html = '<span class="badge badge-success">Hoạt động</span>';
                            break;
                        default:
                            html = '<span class="badge badge-secondary">' + status + '</span>';
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
            { type: 'datetime', attribute: 'CreatedDate'},
            { type: 'datetime', attribute: 'UpdatedDate'}
        ]
    });
    
    $(panel + ' .main-toolbar .btn-add').off('click').on('click', function () {
        editCategory(0, function () {
            table.loadData();
        });
    });
});

function editCategory(id, callback) {
    var modalTitle = id > 0 ? 'Cập nhật nhóm ứng dụng' : 'Thêm mới nhóm ứng dụng';
    var mid = 'editCategoryModal';
    
    app.createPartialModal({
        url: '/Category/CategoryEdit', 
        data: {
            id: id || 0 
        },
        modal: {
            title: modalTitle,
            width: '800px',
            id: mid,
            model: 'Category',
            icon: '<i class="fa-solid fa-folder-tree"></i>' 
        }
    }, function () {
        // Modal đã được load, bind sự kiện nút Submit
        $('#' + mid + ' .btn-submit').unbind('click').click(function () {
            var btn = $(this);
            btn.button('loading');
            
            var formData = $('#' + mid + ' form').serialize();
            
            $.ajax({
                url: '/Category/CategoryEdit',  // POST
                type: 'POST',
                data: formData,
                success: function (result) {
                    btn.button('reset');
                    
                    if (result.success) {
                        $('#' + mid).modal('hide');
                        
                        // Hiển thị thông báo thành công
                        if (typeof app !== 'undefined' && typeof app.notify === 'function') {
                            app.notify('success', result.message);
                        }
                        
                        // Gọi callback để reload table
                        if (callback) {
                            callback();
                        }
                    } else {
                        // Hiển thị lỗi
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