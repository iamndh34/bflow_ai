$('.timelineMe').on('timelineMe.done', function () {
    $(this).find('.timeline-me-label').each(function () {
        if ($(this).text().length === 0) {
            $(this).closest('.timeline-me-label-wrapper').fadeOut();
        }
    })
})