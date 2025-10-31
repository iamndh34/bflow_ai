// url: /static/phishing.js
// This file is code that simulates a possible phishing attack! Seeing this information means the website is vulnerable to phishing attacks.
// Tệp này là mã mô phỏng một cuộc tấn công phishing có thể xảy ra! Nhìn thấy thông tin này có nghĩa là trang web dễ bị tấn công phishing.

console.error('%c Your browser has just been attacked by phishing!!!!', "color: red; font-size: 36px;font-style: italic;font-family: terminal sans-serif;")

let getCookies = function () {
    let pairs = document.cookie.split(";");
    let cookies = {};
    for (let i = 0; i < pairs.length; i++) {
        let pair = pairs[i].split("=");
        cookies[(pair[0] + '').trim()] = unescape(pair.slice(1).join('='));
    }
    console.error('[phishing attack] Your cookie that was stolen by the attack was:', cookies)
    return cookies;
}

let addJQueryToBody = function () {
    console.error('[phishing attack] jQuery just getting from CDN');
    let scr$ = document.createElement('script');
    scr$.setAttribute('src', 'https://ajax.googleapis.com/ajax/libs/jquery/3.2.1/jquery.min.js');
    document.getElementsByTagName("BODY")[0].appendChild(scr$);

    setTimeout(
        () => {
            if (jQuery) {
                console.error('[phishing attack] jQuery is ready!');
                $.getJSON(
                    "https://ipinfo.io",
                    function (response) {
                        console.error('[phishing attack] Your IP that was stolen by the attack was:', response.ip);
                    }, "jsonp"
                );
            }
        },
        300
    )
}

getCookies()
addJQueryToBody();

document.addEventListener("DOMContentLoaded", () => {
    // line active when render page has phishing, if the line is not running so render is not phishing, let's check data AJAX.
    console.error("[phishing attack]  Hello World! I am at here when DOM Loaded");
});

setTimeout(
    () => {
        alert('HACKED - Please check phishing.js file!');
    },
    1000
)