$(document).ready(function () {
    const $script_url = $('#script-url');
    const $select_app = $('#select-app');
    const $btn_send_message = $('#btn-send-message');
    const $user_question = $('#user-question');
    const $chat_message = $('.chat-messages');

    $btn_send_message.on('click', function () {
        const text = $user_question.val().trim()
        if (!text) return
        ShowMessage(text)
    })

    function ShowMessage(text) {
        if (text.length > 0) {
            // Hiển thị tin nhắn người dùng
            const userMessage = $(`
                <div class="message user d-flex justify-content-end">
                    <div class="message-text">${text}</div>
                </div>
            `)
            $chat_message.append(userMessage)
            $chat_message.scrollTop($chat_message.prop('scrollHeight'))

            // Xóa input
            $user_question.val('')

            const temp_resp = $(`
                <div class="message bot d-flex align-items-center typing-indicator">
                    <div class="avatar avatar-xs avatar-light avatar-rounded mr-1">
                        <span class="initial-wrap">B</span>
                    </div>
                    <div class="message-text">
                        <span class="dot one">.</span>
                        <span class="dot two">.</span>
                        <span class="dot three">.</span>
                    </div>
                </div>
            `)
            $chat_message.append(temp_resp)
            $chat_message.scrollTop($chat_message.prop('scrollHeight'))

            let ajax_solve_question = $.fn.callAjax2({
                url: $script_url.attr('data-url-solve-question'),
                data: {'question': text, 'app': $select_app.val()},
                method: 'POST'
            }).then(
                (resp) => {
                    let data = $.fn.switcherResp(resp);
                    if (data && typeof data === 'object' && data.hasOwnProperty('answer')) {
                        return data?.['answer'];
                    }
                    return {};
                },
                (errs) => {
                    console.log(errs);
                }
            )

            Promise.all([ajax_solve_question]).then(
                (results) => {
                    temp_resp.remove()
                    BotAnswer(results[0])
                }
            )
        }
    }

    function BotAnswer(text) {
        if (text.length > 0) {
            // Hiển thị "đang gõ..."
            const typingIndicator = $(`
                <div class="message bot d-flex align-items-center typing-indicator">
                    <div class="avatar avatar-xs avatar-light avatar-rounded mr-1">
                        <span class="initial-wrap">B</span>
                    </div>
                    <div class="message-text">
                        <span class="dot one">.</span>
                        <span class="dot two">.</span>
                        <span class="dot three">.</span>
                    </div>
                </div>
            `)
            $chat_message.append(typingIndicator)
            $chat_message.scrollTop($chat_message.prop('scrollHeight'))

            // Sau 1 giây thay bằng câu trả lời thật
            setTimeout(() => {
                typingIndicator.remove()

                const botMessage = $(`
                    <div class="message bot d-flex align-items-center">
                        <div class="avatar avatar-xs avatar-light avatar-rounded mr-1">
                            <span class="initial-wrap">B</span>
                        </div>
                        <div class="message-text">${text}</div>
                    </div>
                `)
                $chat_message.append(botMessage)
                $chat_message.scrollTop($chat_message.prop('scrollHeight'))
            }, 1000)
        }
    }

    BotAnswer('Xin chào! Mình là trợ lí AI của BFlow. Bạn cần hỗ trợ điều gì?')
});
