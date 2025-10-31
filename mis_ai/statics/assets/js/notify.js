class NotifyPopup {
    // Usage
    // Define function name is type notify
    // Content function:
    //  Step 1: Serializer option receive from caller.
    //  Step 2: Create element notify and append to notify block
    //  Step 3: Display element notify just created and active fadeout for it.
    // ... Usage

    constructor() {
        this.title = '';
        this.description = '';
        this.classAppend = '';
    }

    // util functions
    empty(value) {
        return value === null || typeof value === "undefined" || value.toString().trim() === "";
    }

    changeClass(element, is_show) {
        if (is_show === 0) {
            element.classList.add("notify-hidden");
            element.classList.remove("notify-show");
        } else {
            element.classList.remove("notify-hidden");
            element.classList.add("notify-show");
        }
    }

    createConfirmNotifyBlock() {
        if (!document.getElementById("notify-block")) {
            let body = document.getElementsByTagName("body")[0];
            let container = document.createElement("div");
            container.id = "notify-block";
            body.appendChild(container);
        }
    }

    cleanChildNotifyBlock(){
        // call clean child node notify when load page
        // call when load init.js
        $("#notify-block").empty();
    }

    createElementNotifyTitle(notify_block, title) {
        if (title) {
            let notify_title = document.createElement('span');
            notify_title.classList.add('notify-title');
            notify_title.textContent = title;
            notify_block.appendChild(notify_title);
            notify_block.appendChild(document.createElement('br'));
        }
    }

    createElementNotifyContent(notify_block, description) {
        if (Array.isArray(description)) {
            if (description.length > 1) {
                let notifyContentEleUl = document.createElement('ul');
                notifyContentEleUl.classList.add('notify-text');
                description.map((value, index, array) => {
                    let notify_text = document.createElement('li');
                    notify_text.textContent = value;
                    notifyContentEleUl.appendChild(notify_text);
                });
                notify_block.appendChild(notifyContentEleUl);
            } else if (description.length === 1) {
                let notify_text = document.createElement('span');
                notify_text.classList.add('notify-text');
                notify_text.textContent = description;
                notify_block.appendChild(notify_text);
            }
        } else {
            let notify_text = document.createElement('span');
            notify_text.classList.add('notify-text');
            notify_text.textContent = description;
            notify_block.appendChild(notify_text);
        }
    }

    insertFirstNotify(notify_block) {
        // Add first to Notify Block
        const list = document.getElementById("notify-block");
        if (list.children[0]) {
            // Insert before existing child:
            list.insertBefore(notify_block, list.children[0]);
        } else {
            list.appendChild(notify_block);
        }
    }

    hiddenNotifyFadeoutNotWorking(element) {
        // hidden some notify fadeout error.
        let listChildNotify = Array.from(element.parentElement.children);
        const currentIndex = listChildNotify.indexOf(element);
        listChildNotify.forEach((value, index, array) => {
            if (index >= currentIndex) {
                this.changeClass(listChildNotify[index], 0);
            }
        });
        // Remove self element from parent's child
        element.parentElement.removeChild(element);
    }

    // ... util function

    // support functions
    serializerOption(option, type) {
        this.title = this.empty(option.title) ? null : option.title;
        this.description = this.empty(option.description) ? '' : option.description;
        switch (type) {
            case 'success':
                this.classAppend = 'notify-success';
                break;
            case 'info':
                this.classAppend = 'notify-info';
                break;
            case 'warning':
                this.classAppend = 'notify-warning';
                break;
            case 'error':
                this.classAppend = 'notify-error';
                break;
            default:
                this.classAppend = null;
                break;
        }
    }

    elementNotify() {
        // Create Notify Block if not exist
        this.createConfirmNotifyBlock();

        // New element notify
        // Set opacity default = 1
        let notify_block = document.createElement("div");
        notify_block.classList.add('notify-content');
        if (this.classAppend) {
            notify_block.classList.add(this.classAppend);
        }
        notify_block.style.opacity = 1;

        // Create content notify
        if (this.title) this.createElementNotifyTitle(notify_block, this.title);
        if (this.description) this.createElementNotifyContent(notify_block, this.description);

        // Add first to Notify Block
        this.insertFirstNotify(notify_block);

        // Return element block
        return notify_block;
    }

    displayNotify(element, timeout = 4) {
        // timeout (seconds) 1 = 5s | default 5 = 5s = 5000ms
        timeout *= 1000;
        this.changeClass(element, 1);
        setTimeout(() => {
            const interval_timer = 25; // 0.1s
            const division_opacity = 1 / (timeout * 0.1 / interval_timer);
            let intervalOpacity = setInterval(() => {
                element.style.opacity = element.style.opacity - division_opacity;
                if (element.style.opacity <= 0) {
                    this.changeClass(element, 0);
                }
            }, interval_timer);
            setTimeout(() => {
                clearInterval(intervalOpacity);
                this.hiddenNotifyFadeoutNotWorking(element);
            }, timeout * 0.1);
        }, timeout * 0.8)
    }

    // ... support functions

    // public functions
    success(option) {
        this.serializerOption(option, 'success');
        let ele = this.elementNotify();
        this.displayNotify(ele);
    }

    info(option) {
        this.serializerOption(option, 'info');
        let ele = this.elementNotify();
        this.displayNotify(ele);
    }

    warning(option) {
        this.serializerOption(option, 'warning');
        let ele = this.elementNotify();
        this.displayNotify(ele);
    }

    error(option) {
        this.serializerOption(option, 'error');
        let ele = this.elementNotify();
        this.displayNotify(ele);
    }

    // ... public functions
}
