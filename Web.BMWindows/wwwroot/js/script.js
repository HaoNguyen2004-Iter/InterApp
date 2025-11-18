//Hàm ready
$(function () {
    initSidebarToggles();
    initSidebarDropdown();
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
 * Khởi tạo logic dropdown/collapse cho sidebar submenu
 */
function initSidebarDropdown() {
    // Xử lý click vào menu có submenu
    $('.sidebar-nav .nav-link.has-submenu').on('click', function (e) {
        e.preventDefault();
        e.stopPropagation();
        
        const $this = $(this);
        const targetId = $this.attr('href');
        const $submenu = $(targetId);
        const $arrow = $this.find('.nav-arrow');
        
        console.log('Dropdown clicked:', targetId);
        console.log('Submenu found:', $submenu.length);
        
        // Toggle submenu
        if ($submenu.hasClass('show')) {
            // Đóng submenu
            $submenu.removeClass('show');
            $this.removeClass('active');
            $arrow.removeClass('fa-chevron-up').addClass('fa-chevron-down');
        } else {
            // Đóng tất cả submenu khác
            $('.sidebar-nav .submenu').removeClass('show');
            $('.sidebar-nav .nav-link.has-submenu').removeClass('active');
            $('.sidebar-nav .nav-arrow').removeClass('fa-chevron-up').addClass('fa-chevron-down');
            
            // Mở submenu hiện tại
            $submenu.addClass('show');
            $this.addClass('active');
            $arrow.removeClass('fa-chevron-down').addClass('fa-chevron-up');
        }
    });
    
    // Ngăn click vào submenu item đóng dropdown
    $('.sidebar-nav .submenu .nav-link').on('click', function (e) {
        e.stopPropagation();
    });
}

/**
 * Khởi tạo logic chuyển tab nội dung chính hoặc navigate sang trang khác
 */
function initTabSwitching() {
    const $navLinks = $('.sidebar-nav .nav-link[data-target]');
    const $sections = $('.content-section');
    const $breadcrumb = $('#breadcrumb');

    // Mapping từ data-target sang URL (cho các trang riêng biệt)
    const pageRoutes = {
        'category-management': '/Category/Index',
        'app-management': '/AppItem/Index',
        'settings': '/Settings/Index'
    };

    // ----- HÀM CẬP NHẬT BREADCRUMB -----
    function updateBreadcrumb($activeLink) {
        if ($breadcrumb.length === 0) return;

        $breadcrumb.empty();

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

    // ----- XỬ LÝ CLICK CHUYỂN TAB/PAGE -----
    $navLinks.on('click', function (e) {
        e.preventDefault();

        const $thisLink = $(this);
        const targetId = $thisLink.data('target');
        const $targetSection = $('#' + targetId);

        // Kiểm tra xem section có tồn tại trong trang hiện tại không
        if ($targetSection.length === 0) {
            // Nếu không tồn tại, kiểm tra xem có route mapping không
            if (pageRoutes[targetId]) {
                console.log('Navigating to:', pageRoutes[targetId]);
                window.location.href = pageRoutes[targetId];
            } else {
                console.error('Không tìm thấy section hoặc route cho:', targetId);
            }
            return;
        }

        // Nếu section tồn tại, xử lý tab switching
        $navLinks.removeClass('active');
        $thisLink.addClass('active');
        
        // Tự động active link cha (nếu có)
        const $parentMenu = $thisLink.closest('.submenu');
        if ($parentMenu.length > 0) {
            $(`a[href="#${$parentMenu.attr('id')}"]`).addClass('active');
        }

        // Xử lý Class 'active' cho NỘI DUNG
        $sections.removeClass('active');
        $targetSection.addClass('active');

        // Cập nhật Breadcrumb
        updateBreadcrumb($thisLink);

        // (Mobile) Tự động đóng sidebar
        if ($(window).width() <= 768) {
            $('#sidebar').removeClass('show');
            $('.sidebar-overlay').removeClass('show');
        }
    });

    // ----- TỰ ĐỘNG ACTIVE MENU DỰA TRÊN TRANG HIỆN TẠI -----
    const currentPath = window.location.pathname;
    console.log('Current path:', currentPath);
    
    // Tìm menu item tương ứng
    let $currentMenuItem = null;
    
    for (const [target, route] of Object.entries(pageRoutes)) {
        if (currentPath.toLowerCase().indexOf(route.toLowerCase()) === 0) {
            console.log('Found matching route:', target, '→', route);
            $currentMenuItem = $(`.sidebar-nav .nav-link[data-target="${target}"]`);
            break;
        }
    }

    // Active menu hiện tại
    if ($currentMenuItem && $currentMenuItem.length > 0) {
        console.log('Activating menu:', $currentMenuItem.text().trim());
        
        // XÓA TẤT CẢ active trước khi add mới
        $navLinks.removeClass('active');
        
        // Add active vào menu hiện tại
        $currentMenuItem.addClass('active');
        
        // Mở submenu nếu item nằm trong submenu
        const $parentSubmenu = $currentMenuItem.closest('.submenu');
        if ($parentSubmenu.length > 0) {
            $parentSubmenu.addClass('show');
            
            // Active menu cha
            const submenuId = $parentSubmenu.attr('id');
            $(`a[href="#${submenuId}"]`).addClass('active');
            
            // Xoay mũi tên
            $(`a[href="#${submenuId}"] .nav-arrow`)
                .removeClass('fa-chevron-down')
                .addClass('fa-chevron-up');
        }

        // Update breadcrumb
        updateBreadcrumb($currentMenuItem);
    } else {
        console.log('No matching menu found for path:', currentPath);
    }
}
