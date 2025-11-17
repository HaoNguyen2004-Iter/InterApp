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

    // ----- 5. HÀM CẬP NHẬT BREADCRUMB -----
    function updateBreadcrumb($activeLink) {
        if ($breadcrumb.length === 0) return;

        $breadcrumb.empty(); // Xóa breadcrumb cũ

        const linkTarget = $activeLink.data('target');

        // Thêm "Dashboard" nếu không phải là trang dashboard
        if (linkTarget !== 'dashboard') {
            const $homeItem = $('<li class="breadcrumb-item"><a href="#" data-target="dashboard">Dashboard</a></li>');
            $breadcrumb.append($homeItem);
        }

        // Lấy text của menu cha (nếu có)
        const $parentMenu = $activeLink.closest('.submenu');
        if ($parentMenu.length > 0) {
            const parentText = $(`a[href="#${$parentMenu.attr('id')}"]`).find('.nav-text').text().trim();
            const $parentItem = $('<li class="breadcrumb-item"></li>').text(parentText);
            $breadcrumb.append($parentItem);
        }

        // Thêm link hiện tại
        const $activeItem = $('<li class="breadcrumb-item active"></li>').text($activeLink.text().trim());
        $breadcrumb.append($activeItem);
    }

    // ----- 4. XỬ LÝ CLICK CHUYỂN TAB -----
    $navLinks.on('click', function (e) {
        e.preventDefault();

        const $thisLink = $(this);
        const targetId = $thisLink.data('target');
        const $targetSection = $('#' + targetId);

        if ($targetSection.length === 0) {
            console.error('Không tìm thấy section với ID:', targetId);
            return;
        }

        // 4.1. Xử lý Class 'active' cho LINK MENU
        $navLinks.removeClass('active');
        $thisLink.addClass('active');
        // 4.2. Tự động active link cha (nếu có)
        const $parentMenu = $thisLink.closest('.submenu');
        if ($parentMenu.length > 0) {
            $(`a[href="#${$parentMenu.attr('id')}"]`).addClass('active');
        }

        // 4.3. Xử lý Class 'active' cho NỘI DUNG
        $sections.removeClass('active');
        $targetSection.addClass('active');

        // 4.4. Cập nhật Breadcrumb
        updateBreadcrumb($thisLink);

        // 4.5. (Mobile) Tự động đóng sidebar
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

    // ----- 6. TỰ ĐỘNG MỞ TRANG ĐẦU TIÊN -----
    $('.sidebar-nav .nav-link[data-target="dashboard"]').click();
}