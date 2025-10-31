$(function () {
    $(document).on('drawer.show', '.ntt-drawer', function(event, data){
        let {
            eleClicked,
            alwaysState
        } = {
            eleClicked: null,
            alwaysState: true,
            ...data
        }
        const selectEle = $(this);

        // convert some flag
        let drawerPush = selectEle.attr('data-drawer-push');
        if (eleClicked) {
            let drawerPushBtn = $.fn.parseBoolean(eleClicked.attr('data-drawer-push'));
            if ($.fn.isBoolean(drawerPushBtn)) drawerPush = drawerPushBtn;

            let alwaysStateBtn = $.fn.parseBoolean(eleClicked.attr('data-drawer-always-state'));
            if ($.fn.isBoolean(alwaysStateBtn)) alwaysState = alwaysStateBtn;
        }
        // => always_state
        if (alwaysState === true) {
            selectEle.addClass('open');
            $('.hk-wrapper').addClass('open');
        } else if (alwaysState === false) {
            selectEle.removeClass('open');
            $('.hk-wrapper').removeClass('open');
        } else {
            selectEle.toggleClass('open');
            $('.hk-wrapper').toggleClass('open');
        }
        // => drawerPush
        let drawerWidth = selectEle.attr('data-drawer-width');
        if (!drawerWidth) {
            drawerWidth = selectEle.width() + 2 + 'px'; // plus "2" px border of drawer + body-content
        } else {
            drawerWidth += 'px';
        }
        if (selectEle.hasClass('ntt-drawer-left')) {
            $(':root').css({
                '--ntt-drawer-width': drawerWidth,
            });
        } else if (selectEle.hasClass('ntt-drawer-right')) {
            $(':root').css({
                '--ntt-drawer-width': drawerWidth,
            })
        }
        if (drawerPush === true || drawerPush === 'true') {
            if (selectEle.hasClass('ntt-drawer-left')) {
                $(':root').css({
                    '--ntt-drawer-margin-left': drawerWidth
                });
            } else if (selectEle.hasClass('ntt-drawer-right')) {
                $(':root').css({
                    '--ntt-drawer-margin-right': drawerWidth
                })
            }
        }
        if (selectEle.hasClass('ntt-drawer-left') || selectEle.hasClass('ntt-drawer-right')){
            let heightNavHeader = $('.hk-navbar').outerHeight();
            $('.ntt-drawer').css('top', heightNavHeader)
                .css('height', "calc(100vh - " + (heightNavHeader + "px") + ")");
        }
    });

    $(document).on('drawer.close', '.ntt-drawer', function(event){
        $(this).closest('.ntt-drawer').removeClass('open');
        $('.hk-wrapper').removeClass('open');
    });

    $(document).on('click', '.ntt-drawer-toggle-link', function (event) {
        event.preventDefault();

        let selectEle = $($(this).attr('data-drawer-target'));
        if (selectEle.length > 0) {
            // active trigger show
            selectEle.trigger('drawer.show', {
                'eleClicked': $(this),
            });
        }
    });

    $(document).on('click', '.ntt-drawer-close', function (event) {
        event.preventDefault();

        // active trigger close
        const selectedEle = $(this).closest('.ntt-drawer');
        if (selectedEle.length > 0) selectedEle.trigger('drawer.close');
    });
})

