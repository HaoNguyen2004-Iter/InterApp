var table;

$(document).ready(function () {
    var panel = '#CategoryList_panel';
    table = $(panel + " .apply-table").advanceGrid({
        dataUrl: '/Category/CategoryList',
        model: "Category",
        editController: '/Category',
        checkAll: true,
        width: {},
        filterable: true,
        height: { top: 150 },
        modal: { type: 1, width: '1000px', title: 'Nhóm ứng dụng' },
        toolbars: {
            reload: { ele: panel + ' .main-toolbar .btn-reload' }
        },
        contextMenu: ['edit'
        ],
        loadModalCallback: function () {
            initIdeaForm(function () {
                table.hideModal();
                table.loadData();
            });
        },
        loadDataCallback: function () {
            $('.Detail').click(function () {
                var id = $(this).attr('id');
                window.location.href = "/Category/CategoryDetail?Id=" + id;
            });
        },
        initCallback: function () {
            $(document).on('click', panel + ' .main-toolbar .btn-add', function () {
                table.createOrUpdateObject(null);
            });
        },
        params: { search: { hasCount: true, limit: 20 } },
        head: { height: 60, groups: [50, 220, 50, 100, 200, 200, 200] },
        skipCols: 0,
        cols: {
            left: [[]],
            right: [[
                { title: 'STT', style: "height:60px" },
                { title: 'Tên nhóm' },
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
            { type: 'text', attribute: 'Prioritize' },
            { type: 'text', attribute: 'Status' },
            { type: 'text', attribute: 'CreatedBy' },
            { type: 'text', attribute: 'CreatedDate' },
            { type: 'text', attribute: 'UpdatedBy' },
            { type: 'text', attribute: 'UpdatedDate' }
        ]
    });

    // Xử lý nút Sửa 
    $(document).on('click', '.btn-edit', function () {
        var id = $(this).data('id');
        editCategory(id, function () { }, function () {
            table.loadData();
        });
    });
});

function editCategory(id, initCallback, editCallback) {
    var modalTitle = id != null ? 'Cập nhật ý tưởng' : 'Thêm mới ý tưởng';
    var mid = 'editCategoryModal';
    app.createPartialModal({
        url: '/Category/CategoryDetail',
        data: {
            id: id
        },
        modal: {
            title: modalTitle,
            width: '800px',
            id: mid
        }
    }, function () {
        initCallback();
        initCategoryForm(function () {
            $('#' + mid).modal('hide');
            editCallback();
        })
    })
}