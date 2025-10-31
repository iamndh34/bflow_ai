$(document).ready(function () {
    // Change z-index of hk-wrapper when card fullscreen active/de-active
    $(document).on('click', '.card-full-screen-btn', function () {
        $('.hk-pg-wrapper').toggleClass('hk-pg-wrapper-z-index-1040');

        let eleCard = $(this).closest('.card');
        if (eleCard.length > 0) {
            eleCard.toggleClass('fullscreen');
            $(this).find('.icon > *').toggleClass('d-none');
            $(window).trigger("resize");

            let footerShow = eleCard.data('footer-show');
            if (eleCard.hasClass('fullscreen')) {
                if (footerShow === 'fullscreen') {
                    eleCard.find('.card-footer').removeClass('d-none');
                }
            } else {
                if (footerShow === 'fullscreen') {
                    eleCard.find('.card-footer').addClass('d-none');
                }
            }
        }
    });

    $(document).on('show.bs.collapse', '.card-action-collapse-body', function () {
        let fromEle = $('.card-action-collapse[data-bs-target="#' + $(this).attr('id') + '"]');
        fromEle.find('.icon .feather-icon[data-id="down"]').addClass('d-none');
        fromEle.find('.icon .feather-icon[data-id="up"]').removeClass('d-none');
    })
    $(document).on('hide.bs.collapse', '.card-action-collapse-body', function () {
        let fromEle = $('.card-action-collapse[data-bs-target="#' + $(this).attr('id') + '"]');
        fromEle.find('.icon .feather-icon[data-id="up"]').addClass('d-none');
        fromEle.find('.icon .feather-icon[data-id="down"]').removeClass('d-none');
    })

    $(document).on('click', '.card-full-width-btn', function () {
        let eleActive = $(this).find('.icon .feather-icon.d-none');
        let eleDivParent = $(this).closest('.card').parent('div');

        if (eleActive.data('id') === 'right') {
            eleDivParent.alterClass('col-*');
            eleDivParent.attr('class', eleDivParent.attr('data-classes-backup'));
        } else if (eleActive.data('id') === 'left') {
            eleDivParent.attr('data-classes-backup', eleDivParent.attr("class"));
            eleDivParent.alterClass('col-*', 'col-12');
        }

        $(this).find('.icon').find('.feather-icon').toggleClass('d-none');
    });

    $(document).on('click', '.card-action-close', function () {
        let eleCard = $(this).closest('.card');
        $(eleCard).trigger('card.action.close.click');
    });
    $(document).on('card.action.close.click', '.card', function () {
        let eleCard = $(this).closest('.card');
        let autoConfirm = $(this).data('auto-confirm');
        if (autoConfirm === true) {
            $(eleCard).trigger('card.action.close.confirm');
        } else if (autoConfirm === false) {
            $(eleCard).trigger('card.action.close.reject');
        } else {
            let eleTitle = eleCard.find('.card-header .card-main-title');
            if (eleTitle.length <= 0) eleTitle = eleCard.find('.card-header:not(.card-action-wrap)')
            Swal.fire({
                title: $.fn.transEle.attr('data-sure-delete'),
                html: eleTitle.html(),
                showCancelButton: true,
                confirmButtonText: $.fn.transEle.attr('data-confirm'),
                cancelButtonText: $.fn.transEle.attr('data-cancel'),
            }).then((result) => {
                if (result.isConfirmed) {
                    $(eleCard).trigger('card.action.close.confirm');
                } else {
                    $(eleCard).trigger('card.action.close.reject');
                }
            })
        }
    });
    $(document).on('card.action.close.confirm', '.card', function () {
        $(this).trigger('card.action.close.hide');
    });
    $(document).on('card.action.close.reject', '.card', function () {
    });
    $(document).on('card.action.close.hide', '.card', function () {
        if ($(this).data('manual-hide') === true) {
            $x.fn.closeCard($(this), 'div.member-item', false);
        }
    });
    $(document).on('card.action.close.show', '.card', function () {
        $x.fn.openCard($(this), 'div.member-item');
    });
    $(document).on('card.action.close.purge', '.card', function () {
        $x.fn.closeCard($(this), 'div.member-item', true);
    });
})
