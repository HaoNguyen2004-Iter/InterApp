var table;
function initIconUpload(rootElement) {
    function getEl(id) {
        if (rootElement && rootElement.querySelector) {
            var el = rootElement.querySelector('#' + id);
            if (el) return el;
        }
        return document.getElementById(id);
    }

    function setStatus(text, show) {
        var s = getEl('iconUploadStatus');
        if (!s) return;
        s.style.display = show ? 'block' : 'none';
        s.textContent = text || '';
    }

    function isUrl(val) {
        if (!val) return false;
        return val.indexOf('data:') === 0 || val.indexOf('/') === 0 || val.indexOf('http') === 0;
    }

    var fileInput = getEl('IconFile');
    var preview = getEl('iconPreview');
    var hidden = getEl('Icon');
    var manual = getEl('IconManual');
    var btnApply = getEl('btnApplyManualIcon');

    // Apply manual URL button
    if (btnApply) btnApply.addEventListener('click', function () {
        var url = (manual.value || '').trim();
        if (!url) return;
        if (hidden) hidden.value = url;
        if (isUrl(url) && preview) preview.src = url;
    });

    // live preview when typing manual url
    if (manual) manual.addEventListener('input', function () {
        var url = (manual.value || '').trim();
        if (isUrl(url) && preview) preview.src = url;
    });

    // when submitting the form make sure manual value is copied to hidden
    (function attachFormSubmit() {
        var form = preview ? preview.closest('form') : null;
        if (!form && rootElement) {
            form = rootElement.querySelector('form');
        }
        if (!form) return;
        form.addEventListener('submit', function () {
            if (manual && manual.value && manual.value.trim() && hidden) {
                hidden.value = manual.value.trim();
            }
        });
    })();

    if (!fileInput) return;

    fileInput.addEventListener('change', function (e) {
        var f = e.target.files && e.target.files[0];
        if (!f) return;

        // quick client preview
        try { if (preview) preview.src = URL.createObjectURL(f); } catch (ex) { }

        var fd = new FormData();
        fd.append('file', f);

        setStatus('Đang tải lên...', true);

        fetch('/apimedia/TempUpload', {
            method: 'POST',
            body: fd,
            credentials: 'same-origin'
        }).then(function (res) {
            return res.json();
        }).then(function (result) {
            setStatus('', false);
            var url = '';
            if (typeof result === 'string' && result.length > 0) {
                url = result;
            } else if (result && result.url) {
                url = result.url;
            }

            if (url) {
                if (hidden) hidden.value = url;
                if (preview) preview.src = url;
                if (manual) manual.value = url;
            } else {
                setStatus('Upload thất bại', true);
                setTimeout(function () { setStatus('', false); }, 2500);
            }
        }).catch(function (err) {
            console.error(err);
            setStatus('Lỗi khi upload', true);
            setTimeout(function () { setStatus('', false); }, 2500);
        }).finally(function () {
            try { fileInput.value = ''; } catch (e) { }
        });
    });
}
/* End icon upload helper */


$(document).ready(function () {
    var panel = '#AppItemList_panel';
    table = $(panel + " .apply-table").advanceGrid({
        dataUrl: '/AppItem/AppItemList',
        model: "AppItem",
        editController: '/AppItem',
        checkAll: true,
        width: {},
        filterable: true,
        height: { top: 137 },
        modal: { type: 1, width: '900px', title: 'Ứng dụng' },
        toolbars: {
            reload: { ele: panel + ' .main-toolbar .btn-reload' }
        },
        contextMenu: ['edit'],
        paging: { options: [10, 20, 30, 50] },
        loadModalCallback: function (row) {
            var modalId = 'AppItemFormEditModal';

            // Initialize icon upload within the modal (if elements exist)
            var modalEl = document.getElementById(modalId);
            if (modalEl) {
                try { initIconUpload(modalEl); } catch (ex) { console.error('initIconUpload error:', ex); }
            }

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
        head: { height: 60, groups: [50, 200, 150, 200, 80, 50, 200, 130, 130] },
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
                type: 'text', attribute: 'Icon', class: 'text-center',
                render: function (row) {
                    var icon = row.Icon;
                    if (!icon) return '';
                    if (typeof icon === 'string' && (icon.indexOf('data:') === 0 || icon.indexOf('/') === 0 || icon.indexOf('http') === 0)) {
                        return '<img src="' + icon + '" style="height:28px;max-width:120px;object-fit:contain;border:1px solid #eee;padding:2px;" />';
                    }
                    return '';
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
            { type: 'datetime', attribute: 'CreatedDate' },
            { type: 'datetime', attribute: 'UpdatedDate' }
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
        // Initialize icon upload for this modal instance
        var modalEl = document.getElementById(mid);
        if (modalEl) {
            try { initIconUpload(modalEl); } catch (ex) { console.error('initIconUpload error:', ex); }
        }

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