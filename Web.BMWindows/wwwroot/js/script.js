//Hàm ready
$(function () {
    initSidebarToggles();
    initTabSwitching();
});

/**
 * Khởi tạo logic cho các nút đóng/mở sidebar
 */
function initSidebarToggles() {
    const $sidebar = $('#sidebar');
    const $mainContent = $('#mainContent');
    const $sidebarToggle = $('#sidebarToggle');
    const $mobileToggle = $('#mobileToggle');

    const $sidebarOverlay = $('<div class="sidebar-overlay"></div>').appendTo('body');

    // ----- 1. Sidebar Toggle (Desktop) -----
    $sidebarToggle.on('click', () => {
        $sidebar.toggleClass('collapsed');
        $mainContent.toggleClass('expanded');
    });

    // ----- 2. Sidebar Toggle (Mobile) -----
    $mobileToggle.on('click', () => {
        $sidebar.addClass('show');
        $sidebarOverlay.addClass('show');
    });

    // Tự động đóng sidebar mobile khi bấm vào overlay
    $sidebarOverlay.on('click', () => {
        $sidebar.removeClass('show');
        $sidebarOverlay.removeClass('show');
    });
}

/**
 * Khởi tạo logic chuyển tab nội dung chính
 */
function initTabSwitching() {
    const $navLinks = $('.sidebar-nav .nav-link[data-target]');
    const $sections = $('.content-section');
    const $breadcrumb = $('#breadcrumb');

    // Nếu không có section nào trên trang hiện tại thì bỏ qua
    if ($sections.length === 0) return;

    function updateBreadcrumb($activeLink) {
        if ($breadcrumb.length === 0) return;

        $breadcrumb.empty();

        const linkTarget = $activeLink.data('target');
        if (linkTarget !== 'dashboard') {
            const $homeItem = $('<li class="breadcrumb-item"><a href="#" data-target="dashboard">Dashboard</a></li>');
            $breadcrumb.append($homeItem);
        }

        const $parentMenu = $activeLink.closest('.submenu');
        if ($parentMenu.length > 0) {
            const parentText = $(`a[href="#${$parentMenu.attr('id')}"]`).find('.nav-text').text().trim();
            const $parentItem = $('<li class="breadcrumb-item"></li>').text(parentText);
            $breadcrumb.append($parentItem);
        }

        const $activeItem = $('<li class="breadcrumb-item active"></li>').text($activeLink.text().trim());
        $breadcrumb.append($activeItem);
    }

    $navLinks.on('click', function (e) {
        e.preventDefault();

        const $thisLink = $(this);
        const targetId = $thisLink.data('target');
        const $targetSection = $('#' + targetId);

        if ($targetSection.length === 0) {
            console.error('Không tìm thấy section với ID:', targetId);
            return;
        }

        $navLinks.removeClass('active');
        $thisLink.addClass('active');

        const $parentMenu = $thisLink.closest('.submenu');
        if ($parentMenu.length > 0) {
            $(`a[href="#${$parentMenu.attr('id')}"]`).addClass('active');
        }

        $sections.removeClass('active');
        $targetSection.addClass('active');

        updateBreadcrumb($thisLink);

        if ($(window).width() <= 768) {
            $('#sidebar').removeClass('show');
            $('.sidebar-overlay').removeClass('show');
        }
    });

    // Gán sự kiện click cho breadcrumb
    $breadcrumb.on('click', 'a[data-target="dashboard"]', function (e) {
        e.preventDefault();
        $('.nav-link[data-target="dashboard"]').click();
    });

    // Tự động mở tab đầu tiên có section hợp lệ
    const $firstValid = $navLinks.filter(function () {
        const id = $(this).data('target');
        return $('#' + id).length > 0;
    }).first();

    if ($firstValid.length) {
        $firstValid.click();
    }
}