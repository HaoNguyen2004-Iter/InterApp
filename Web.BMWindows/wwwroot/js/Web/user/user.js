//Hàm ready
$(function() {
    initUserMenu();
    initAppItemsAnimation();
    initCategoryFilter();
});

// Hàm khởi tạo menu người dùng
function initUserMenu() {
    const $trigger = $("#userDropdownTrigger");
    const $menu = $("#userDropdownMenu");

    // Xử lý click vào trigger
    $trigger.on('click', function(e) {
        e.stopPropagation();
        
        // Toggle menu visibility
        if ($menu.hasClass('show')) {
            closeDropdown();
        } else {
            openDropdown();
        }
    });

    // Xử lý click ra ngoài để đóng menu
    $(document).on('click', function(e) {
        if (!$trigger.is(e.target) && 
            $trigger.has(e.target).length === 0 && 
            !$menu.is(e.target) && 
            $menu.has(e.target).length === 0) {
            closeDropdown();
        }
    });

    // Xử lý ESC key để đóng dropdown
    $(document).on('keydown', function(e) {
        if (e.key === 'Escape' && $menu.hasClass('show')) {
            closeDropdown();
        }
    });

    // Functions để mở/đóng dropdown với animation
    function openDropdown() {
        $menu.addClass('show');
        $trigger.addClass('active');
    }

    function closeDropdown() {
        $menu.removeClass('show');
        $trigger.removeClass('active');
    }

    // Thêm animation cho dropdown items khi hover
    $menu.find('.dropdown-item').each(function(index) {
        $(this).css({
            'animation-delay': (index * 0.05) + 's'
        });
    });
}

// Hàm khởi tạo animation cho app items
function initAppItemsAnimation() {
    const $appItems = $('.app-item');
    
    // Thêm fade-in animation cho từng app item
    $appItems.each(function(index) {
        const $item = $(this);
        $item.css({
            'opacity': '0',
            'transform': 'translateY(20px)'
        });
        
        setTimeout(function() {
            $item.css({
                'opacity': '1',
                'transform': 'translateY(0)',
                'transition': 'all 0.4s ease'
            });
        }, index * 50); // Delay 50ms cho mỗi item
    });
}

// Hàm khởi tạo filter category với AJAX
function initCategoryFilter() {
    $('.category-filter').on('click', function(e) {
        e.preventDefault();
        
        const $link = $(this);
        const categoryId = $link.data('category-id');
        
        // Update active state
        $('.category-filter').removeClass('active');
        $link.addClass('active');
        
        // Load app items via AJAX
        loadAppItems(categoryId);
    });
}

// Hàm load app items qua AJAX
function loadAppItems(categoryId) {
    const $container = $('#app-items-container');
    
    // Show loading state
    $container.html('<div class="d-flex justify-content-center align-items-center" style="min-height: 60vh;"><div class="spinner-border text-primary" role="status"><span class="visually-hidden">Loading...</span></div></div>');
    
    // Build URL with or without categoryId
    let url = '/User/LoadAppItems';
    if (categoryId) {
        url += '?categoryId=' + categoryId;
    }
    
    // Fetch data
    fetch(url)
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.text();
        })
        .then(html => {
            // Update container with new content
            $container.html(html);
            
            // Re-initialize animations for new items
            initAppItemsAnimation();
            
            // Update URL without page reload (optional - for bookmarking)
            if (categoryId) {
                history.pushState(null, '', '/User/Index?categoryId=' + categoryId);
            } else {
                history.pushState(null, '', '/User/Index');
            }
        })
        .catch(error => {
            console.error('Error loading app items:', error);
            $container.html('<div class="alert alert-danger text-center" role="alert">Có lỗi xảy ra khi tải dữ liệu. Vui lòng thử lại.</div>');
        });
}

// Handle browser back/forward buttons
window.addEventListener('popstate', function(e) {
    // Parse URL to get categoryId
    const urlParams = new URLSearchParams(window.location.search);
    const categoryId = urlParams.get('categoryId');
    
    // Update active state
    $('.category-filter').removeClass('active');
    if (categoryId) {
        $('.category-filter[data-category-id="' + categoryId + '"]').addClass('active');
    } else {
        $('.category-filter[data-category-id=""]').addClass('active');
    }
    
    // Load items
    loadAppItems(categoryId);
});
