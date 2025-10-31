$(document).ready(function () {

    const ele$ = $('#modalSearchMenu');
    const inp$ = ele$.find('.form-control-search');
    const data$ = ele$.find('.data-list');
    const dataFavorite$ = ele$.find('.data-favorite');

    let menusData = {};

    class MenuFavorite {
        static menusFavoriteData = [];

        static getFavorite() {
            if (localStorage) {
                MenuFavorite.menusFavoriteData = JSON.parse(
                    localStorage.getItem('menu_favorite') ?? `[]`
                );
            }
            return MenuFavorite.menusFavoriteData;
        }

        static hasInFavorite(item) {
            return MenuFavorite.menusFavoriteData.filter(itemChild => itemChild.url === item.url).length > 0;
        }

        static setFavorite(item) {
            if (localStorage) {
                const exist = MenuFavorite.menusFavoriteData.filter(itemChild => itemChild.url === item.url);
                if (exist.length === 0) {
                    MenuFavorite.menusFavoriteData.push(item);
                    localStorage.setItem('menu_favorite', JSON.stringify(MenuFavorite.menusFavoriteData));
                }
            }
        }

        static removeFavorite(item) {
            if (localStorage) {
                MenuFavorite.menusFavoriteData = MenuFavorite.menusFavoriteData.filter(itemChild => itemChild.url !== item.url);
                localStorage.setItem('menu_favorite', JSON.stringify(MenuFavorite.menusFavoriteData));
            }
        }

        static render(searchTxt){
            const eleNew$ = renderChild(
                searchTxt && searchTxt != "" ? MenuFavorite.menusFavoriteData.filter(
                    item => item.name.toLowerCase().indexOf(searchTxt) !== -1 || item.name_i18n.toLowerCase().indexOf(searchTxt) !== -1
                ) : MenuFavorite.menusFavoriteData
            );
            dataFavorite$.empty().append(eleNew$);
        }
    }

    function removeVietnameseTones(str) {
        return str.normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "") // remove diacritics
            .replace(/đ/g, "d")
            .replace(/Đ/g, "D");
    }

    function searchMenus(data, keyword) {
        const result = {};

        const cleanKeyword = removeVietnameseTones(keyword.toLowerCase());

        function searchInMenu(menu) {
            return menu.filter(item => {
                const name = removeVietnameseTones(item.name?.toLowerCase() || "");
                const name_i18n = removeVietnameseTones(item.name_i18n?.toLowerCase() || "");

                const isMatch = name.includes(cleanKeyword) || name_i18n.includes(cleanKeyword);

                const matchingChildren = searchInMenu(item.child || []);
                if (matchingChildren.length > 0) {
                    item.child = matchingChildren;
                }

                return isMatch || matchingChildren.length > 0;
            });
        }

        for (const key in data) {
            const filteredMenus = searchInMenu(data[key]);
            if (filteredMenus.length > 0) {
                result[key] = filteredMenus;
            }
        }

        return result;
    }

    function renderMenus(data) {
        data$.empty();
        Object.keys(data).map(
            key => {
                const menusChild$ = renderChild(data[key]);
                const tag$ = $(`<div class="w-100">${key.replaceAll("-", " ").toUpperCase()}</div>`).append(menusChild$);
                data$.append(tag$);
            }
        )
    }

    function renderChild(dataList, marginLeft = 1) {
        const eleItemChild$ = $(`<div class="w-100" style="padding-left: ${marginLeft * 30}px"></div>`);
        dataList.map(
            item => {
                let eleChild$ = $(``);
                if (typeof item.url === 'string' && item.url.length > 0 && item.url !== '#') {
                    let star$ = '';
                    if (MenuFavorite.hasInFavorite(item)) {
                        star$ = $(`<span class="text-warning mr-3"><i class="fa-solid fa-star"></i></span>`);
                        star$.on('click', function () {
                            console.log('item:', item);
                            MenuFavorite.removeFavorite(item);
                            MenuFavorite.render();
                            renderMenus(menusData);
                        })
                    } else {
                        star$ = $(`<span class="text-light mr-3"><i class="fa-regular fa-star"></i></span>`);
                        star$.on('click', function () {
                            MenuFavorite.setFavorite(item);
                            MenuFavorite.render();
                            renderMenus(menusData);
                        })
                    }

                    eleChild$ = $(`<div class="w-100"></div>`).append(star$).append(`
                        <a href="${item.url}" class="w-100">
                            ${item.icon}
                            ${item.name_i18n}
                            <small class="text-light">${item.name}</small>
                        </a>
                    `);
                } else {
                    eleChild$ = $(`
                        <div class="w-100">
                            ${item.icon}
                            ${item.name}
                        </div>
                    `);
                }
                let item$ = $(`<div class="w-100"></div>`);
                eleChild$.attr('menuData', item);
                item$.append(eleChild$);

                if (item.child.length > 0) {
                    const child$ = renderChild(item.child, marginLeft + 1);
                    item$.append(child$);
                }

                eleItemChild$.append(item$);
            }
        );
        return eleItemChild$;
    }

    function renderSearch(txt) {
        data$.empty();
        if (txt && txt !== "") {
            const dataFiltered = searchMenus(menusData, txt);
            renderMenus(dataFiltered);
        } else {
            renderMenus(menusData);
        }
    }

    let keyDebouncing = null;
    inp$.on('input', function () {
        const txt = $(this).val();
        if (keyDebouncing) clearTimeout(keyDebouncing);
        keyDebouncing = setTimeout(
            () => {
                renderSearch(txt);
                MenuFavorite.render(txt);
            },
            300
        );
    })

    ele$.find('.dropdown-toggle').on('click', function (e) {
        e.preventDefault(); // tránh submit form
        e.stopPropagation(); // tránh Bootstrap đóng ngay

        $.fn.callAjax2({
            url: ele$.data('url'),
            method: 'GET',
            isLoading: true,
            cache: true,
        }).then(resp => {
            const data = $.fn.switcherResp(resp);
            if (data && data.hasOwnProperty('menus')) {
                MenuFavorite.getFavorite();
                MenuFavorite.render();
                menusData = data['menus'];
                renderMenus(menusData);

                // Mở dropdown sau khi có data
                bootstrap.Dropdown.getOrCreateInstance(ele$.find('.dropdown-toggle')[0]).show();
            }
        });
    });

    new InteractiveMenu();
});

class InteractiveMenu {
    constructor() {
        this.menu = document.getElementById('top-header-menu');
        this.hoverBg = document.getElementById('hoverBg');
        this.activeBg = document.getElementById('activeBg');
        this.menuItems = document.querySelectorAll('.navbar-nav > .nav-item');
        this.activeItem = document.querySelector('.navbar-nav > .nav-item.active');

        this.init();
    }

    init() {
        this.setActiveBackground();
        this.bindEvents();
    }

    bindEvents() {
        // Hover events
        this.menuItems.forEach(item => {
            item.addEventListener('mouseenter', (e) => this.handleHover(e));
            item.addEventListener('mouseleave', () => this.handleHoverOut());
            item.addEventListener('click', (e) => this.handleClick(e));
        });

        // Menu leave event
        this.menu.addEventListener('mouseleave', () => {
            this.hoverBg.classList.remove('show');
        });
    }

    handleHover(e) {
        // Lấy đúng element li.nav-item
        let item = e.target;

        // Nếu target là span hoặc a, tìm parent li.nav-item
        if (item.tagName !== 'LI') item = item.closest('.nav-item')

        const itemRect = item.getBoundingClientRect();
        const menuRect = this.menu.getBoundingClientRect();
        
        const left = itemRect.left - menuRect.left;
        const width = itemRect.width;

        // Di chuyển background hover
        this.hoverBg.style.left = left + 7 + 'px';
        this.hoverBg.style.width = width + 'px';
        this.hoverBg.classList.add('show');
    }

    handleHoverOut() {
        // Không cần làm gì vì mouseleave của menu sẽ xử lý
        return true
    }

    handleClick(e) {
        // Lấy đúng element li.nav-item
        let clickedItem = e.target;

        // Nếu target là span hoặc a, tìm parent li.nav-item
        if (clickedItem.tagName !== 'LI') {
            clickedItem = clickedItem.closest('.nav-item');
        }
        
        // Nếu không tìm thấy nav-item, không làm gì
        if (!clickedItem) return;

        // Kiểm tra xem có phải là menu cha (cấp 1) không
        // Menu cha là con trực tiếp của .navbar-nav
        if (!clickedItem.parentElement.classList.contains('navbar-nav')) {
            return; // Không xử lý nếu là menu con
        }

        // Tìm thẻ a trong nav-item
        const link = clickedItem.querySelector('a.nav-link');
        
        // Chỉ preventDefault nếu href là javascript:void(0) hoặc bắt đầu bằng javascript:
        if (link && link.href && link.href.startsWith('javascript:')) {
            e.preventDefault();
        }

        // Tạo hiệu ứng ripple
        this.createRipple(e);

        // Update active item - chỉ cho menu cấp 1
        $('.navbar-nav > .nav-item').removeClass('active');
        clickedItem.classList.add('active');
        this.activeItem = clickedItem;

        // Update active background
        setTimeout(() => {
            this.setActiveBackground();
        }, 100);
    }

    setActiveBackground() {
        if (this.activeItem) {
            const itemRect = this.activeItem.getBoundingClientRect();
            const menuRect = this.menu.getBoundingClientRect();

            // Tính toán vị trí
            
            const left = itemRect.left - menuRect.left;
            const width = itemRect.width;

            this.activeBg.style.left = left + 7 + 'px';
            this.activeBg.style.width = width + 'px';
            this.activeBg.classList.add('show');
        }
    }

    createRipple(e) {
        const item = e.target;
        const rect = item.getBoundingClientRect();
        const ripple = document.createElement('span');

        const size = Math.max(rect.width, rect.height);
        const x = e.clientX - rect.left - size / 2;
        const y = e.clientY - rect.top - size / 2;

        ripple.classList.add('ripple');
        ripple.style.width = ripple.style.height = size + 'px';
        ripple.style.left = x + 'px';
        ripple.style.top = y + 'px';

        item.appendChild(ripple);

        // Xóa ripple sau khi animation kết thúc
        setTimeout(() => {
            ripple.remove();
        }, 600);
    }
}