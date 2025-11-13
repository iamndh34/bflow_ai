// AI Chat Functionality with jQuery
$(document).ready(function () {
    const $chatButton = $('#aiChatButton');
    const $chatContainer = $('#aiChatContainer');
    const $chatClose = $('#aiChatClose');
    const $chatInput = $('#aiChatInput');
    const $chatSend = $('#aiChatSend');
    const $chatBody = $('#aiChatBody');
    const $typingIndicator = $('#typingIndicator');
    const $bai_script_url = $('#bai-script-url');

    let session_key = ""

    // Toggle chat visibility
    $chatButton.on('click', function () {
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
    $chatClose.on('click', function () {
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
            let aiResponse = '';
            $.ajax({
                url: $bai_script_url.attr('data-ask-url'),
                method: 'POST',
                data: JSON.stringify({context: message}),
                contentType: "application/json",
                processData: false,
                headers: {"X-CSRFToken": $('input[name="csrfmiddlewaretoken"]').val()},
                success: function (res) {
                    if (res.data) {
                        console.log(res.data)
                        let accountData = res.data
                        let aiResponse = `
                        <div class="account-info">
                            <h4 class="fw-bold px-1 py-2">${accountData["VietnameseName"]} (${accountData["EnglishName"]})</h4>
                            <p><strong class="fw-bold">Số tài khoản:</strong> ${accountData["AccountNumber"]}</p>
                            <p><strong class="fw-bold">Phương pháp kế toán:</strong> ${accountData["AccountingMethod"]}</p>
                            <p><strong class="fw-bold">Tài khoản đối ứng:</strong> ${accountData["CorrespondingAccounts"]}</p>
                            <p><strong class="fw-bold">Ý nghĩa:</strong> ${accountData["Meaning"]}</p>
                            <p><strong class="fw-bold">Cách sử dụng:</strong> ${accountData["Usage"]}</p>
                        </div>
                        `;
                        addMessage(aiResponse, 'ai');
                        $chatSend.prop('disabled', false);
                    } else {
                        console.log(res.message)
                        let aiResponse = res.message
                        addMessage(aiResponse, 'ai');
                        $chatSend.prop('disabled', false);
                    }

                },
                error: function (error) {
                    console.log(error)
                    aiResponse = error
                    addMessage(error, 'ai');
                    $chatSend.prop('disabled', false);
                }
            })

        }
    }

    // Add message to chat
    function addMessage(content, sender, is_hello = false) {
        const $messageDiv = $('<div>').addClass(`ai-message ${sender}`);
        const $contentDiv = $('<div>').addClass(`ai-message-content ${is_hello ? 'is_hello' : ''}`).html(content);

        $messageDiv.append($contentDiv);
        $chatBody.append($messageDiv);

        // Scroll to bottom
        $chatBody.animate({scrollTop: $chatBody[0].scrollHeight}, 300);
    }

    // Show typing indicator with enhanced animation
    function showTypingIndicator() {
        // Add typing indicator to chat body
        $chatBody.append($typingIndicator);

        // Show with animation
        setTimeout(() => {
            $typingIndicator.addClass('active');
            // Smooth scroll to bottom
            $chatBody.animate({scrollTop: $chatBody[0].scrollHeight}, 300);
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
    $chatSend.on('click', function () {
        sendMessage($bai_script_url.attr('data-ask-url'));
    });

    // Auto-resize textarea
    $chatInput.on('input', function () {
        this.style.height = 'auto';
        this.style.height = (this.scrollHeight) + 'px';
    });

    // Close chat on Escape key
    $(document).on('keydown', function (e) {
        if (e.which === 27 && $chatContainer.hasClass('active')) {
            $chatContainer.removeClass('active');
        }
    });
});