// AI Chat Functionality with jQuery
$(document).ready(function() {
    const $chatButton = $('#aiChatButton');
    const $chatContainer = $('#aiChatContainer');
    const $chatClose = $('#aiChatClose');
    const $chatInput = $('#aiChatInput');
    const $chatSend = $('#aiChatSend');
    const $chatBody = $('#aiChatBody');
    const $typingIndicator = $('#typingIndicator');
    const $bai_script_url = $('#bai-script-url');

    // Toggle chat visibility
    $chatButton.on('click', function() {
        $chatContainer.toggleClass('active');
        if ($chatContainer.hasClass('active')) {
            if ($chatBody.find('.is_hello').length === 0) {
                showTypingIndicator();
                setTimeout(() => {
                    hideTypingIndicator();
                    addMessage('Xin chào👋! Tôi là trợ lí Bflow AI. Tôi có thể giúp gì cho bạn?', 'ai', true);
                }, 1000);
            }
            $chatInput.focus();
        }
    });

    // Close chat
    $chatClose.on('click', function() {
        $chatContainer.removeClass('active');
    });

    // Send message
    function sendMessage(data_url) {
        const message = $chatInput.val().trim();
        if (message && data_url) {
            // Add user message
            addMessage(message, 'user');
            $chatInput.val('');
            $chatSend.prop('disabled', true);

            // Show typing indicator
            showTypingIndicator();

            // Hard response or Call AI API here
            hideTypingIndicator();
            const aiResponse = 'Shut up!';
            addMessage(aiResponse, 'ai');
            $chatSend.prop('disabled', false);
        }
    }

    // Add message to chat
    function addMessage(content, sender, is_hello=false) {
        const $messageDiv = $('<div>').addClass(`ai-message ${sender}`);
        const $contentDiv = $('<div>').addClass(`ai-message-content ${is_hello ? 'is_hello' : ''}`).html(content);

        $messageDiv.append($contentDiv);
        $chatBody.append($messageDiv);

        // Scroll to bottom
        $chatBody.animate({ scrollTop: $chatBody[0].scrollHeight }, 300);
    }

    // Show typing indicator with enhanced animation
    function showTypingIndicator() {
        // Add typing indicator to chat body
        $chatBody.append($typingIndicator);

        // Show with animation
        setTimeout(() => {
            $typingIndicator.addClass('active');
            // Smooth scroll to bottom
            $chatBody.animate({ scrollTop: $chatBody[0].scrollHeight }, 300);
        }, 100);
    }

    // Hide typing indicator with animation
    function hideTypingIndicator() {
        $typingIndicator.removeClass('active');
        setTimeout(() => {
            $typingIndicator.detach();
        }, 300);
    }

    // Send message on button click
    $chatSend.on('click', function() {
        sendMessage($bai_script_url.attr('data-ask-demo-url'));
    });

    // Auto-resize textarea
    $chatInput.on('input', function() {
        this.style.height = 'auto';
        this.style.height = (this.scrollHeight) + 'px';
    });

    // Close chat on Escape key
    $(document).on('keydown', function(e) {
        if (e.which === 27 && $chatContainer.hasClass('active')) {
            $chatContainer.removeClass('active');
        }
    });

    $(document).on("click", '.btn-accept-ai-create-contact', function () {
        showTypingIndicator();
        setTimeout(() => {
            hideTypingIndicator();
            addMessage('Đang tạo mới Liên hệ...', 'ai');
        }, 1000);
        let combinesData = {
            url: $bai_script_url.attr('data-ask-demo-url'),
            method: 'POST',
            data: {
                'owner': $(this).attr('data-employee-current-id'),
                'fullname': $(this).closest('.form-ai-create-contact').find('.fullname').val(),
                'job_title': $(this).closest('.form-ai-create-contact').find('.job_title').val(),
                'email': $(this).closest('.form-ai-create-contact').find('.email').val(),
                'mobile': $(this).closest('.form-ai-create-contact').find('.mobile').val()
            },
        }
        $.fn.callAjax2(combinesData).then(
            (resp) => {
                let data = $.fn.switcherResp(resp);
                if (data) {
                    showTypingIndicator();
                    setTimeout(() => {
                        hideTypingIndicator();
                        addMessage(`Liên hệ mới đã được tạo thành công 🎉! Mã Liên hệ: ${data?.['code']}`, 'ai');
                    }, 1000);
                }
            },
            (errs) => {
                console.log(errs)
                showTypingIndicator();
                setTimeout(() => {
                    hideTypingIndicator();
                    addMessage(`Không thể thêm liên hệ mới 😭! Chi tiết lỗi: ${JSON.stringify(errs.data.errors)}`, 'ai');
                }, 1000);
            })
    })
});