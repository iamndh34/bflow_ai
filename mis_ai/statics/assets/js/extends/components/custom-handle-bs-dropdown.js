// this function fire when dropdown menu inside datatable has scrollbody has style is overflow auto
    /**
     * self: khoảng cách element từ trên top
     * selfDropdown: chiều dài của dropdown
     * **/
class DropdownBSHandle {
    static init(){
        $('.info-btn').off().on('click', function () {
            if ($(this).parents('.dropdown').hasClass('show')) $(this).parents('.dropdown').removeClass('show')
            else{
                $(this).parents('.dropdown').addClass('show')
                let self = window.innerHeight - $(this).offset().top
                let selfDropdown = $(this).next().innerHeight()
                if (self < selfDropdown){
                    const istop = $(this).offset().top - selfDropdown
                    $(this).parents('.dropdown').find('.dropdown-menu').css(
                        {"position": "fixed","top": `${istop}px`,"left": `${$(this).offset().left}px`,
                            "opacity": 1, "display": "block"
                        }
                    )
                }
                else
                    $(this).parents('.dropdown').find('.dropdown-menu').css(
                        {"position": "fixed","top": `${$(this).offset().top + $(this).innerHeight()}px`,
                            "left": `${$(this).offset().left}px`, "opacity": 1, "display": "block"
                        }
                    )
            }
        });
        $(document).on('click', function (e) {
            e.stopPropagation()
            let container = $(".dropdown.show"); // Give you class or ID
            if (!container.is(e.target) && container.has(e.target).length === 0) // ... nor a descendant-child of the container
            {
                container.removeClass('show')
                container.find('.dropdown-menu').css({"display":"none","opacity":0});
            }
        });
    }
}