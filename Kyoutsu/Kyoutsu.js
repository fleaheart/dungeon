"use strict";
var Kyoutsu;
(function (Kyoutsu) {
    function getElementById(elementId) {
        var elm = document.getElementById(elementId);
        if (elm == null) {
            throw elementId + ' is not found.';
        }
        return elm;
    }
    Kyoutsu.getElementById = getElementById;
    function searchParentElement(target, className) {
        var element = target;
        while (true) {
            if (element == null) {
                break;
            }
            if (element instanceof HTMLElement) {
                if (element.classList.contains(className)) {
                    return element;
                }
            }
            element = element.parentNode;
        }
        return null;
    }
    Kyoutsu.searchParentElement = searchParentElement;
    var Message = (function () {
        function Message() {
            var _this = this;
            this.board = undefined;
            this.clear = function () {
                if (_this.board == undefined) {
                    return;
                }
                _this.board.innerHTML = '';
            };
            this.add = function (text) {
                if (_this.board == undefined) {
                    return;
                }
                var html = _this.board.innerHTML;
                if (html == '') {
                    html = text;
                }
                else {
                    html += ' / ' + text;
                }
                _this.board.innerHTML = html;
            };
            this.writeLine = function (text) {
                if (_this.board == undefined) {
                    return;
                }
                var html = _this.board.innerHTML;
                html += text + '<br>';
                _this.board.innerHTML = html;
            };
        }
        Message.prototype.set = function (board) {
            this.board = board;
        };
        return Message;
    }());
    Kyoutsu.Message = Message;
    function load(url) {
        var res = '';
        var method = 'GET';
        var async = false;
        var xhr = new XMLHttpRequest();
        xhr.abort();
        xhr.open(method, url, async);
        xhr.setRequestHeader("If-Modified-Since", "Thu, 01 Jun 1970 00:00:00 GMT");
        xhr.addEventListener('readystatechange', function () {
            if (xhr.readyState == 4) {
                res = xhr.responseText;
            }
        });
        xhr.send();
        return res;
    }
    Kyoutsu.load = load;
    ;
    Kyoutsu.BIT_TOP = 1;
    Kyoutsu.BIT_RIGHT = 2;
    Kyoutsu.BIT_BOTTOM = 4;
    Kyoutsu.BIT_LEFT = 8;
    Kyoutsu.INPUT_UP = Kyoutsu.BIT_TOP;
    Kyoutsu.INPUT_RIGHT = Kyoutsu.BIT_RIGHT;
    Kyoutsu.INPUT_DOWN = Kyoutsu.BIT_BOTTOM;
    Kyoutsu.INPUT_LEFT = Kyoutsu.BIT_LEFT;
    Kyoutsu.INPUT_ESCAPE = 27;
    function getInputCode(key) {
        if (key == 'w' || key == 'W') {
            return Kyoutsu.INPUT_UP;
        }
        if (key == 'd' || key == 'D') {
            return Kyoutsu.INPUT_RIGHT;
        }
        if (key == 's' || key == 'S') {
            return Kyoutsu.INPUT_DOWN;
        }
        if (key == 'a' || key == 'A') {
            return Kyoutsu.INPUT_LEFT;
        }
        if (key == 'Escape' || key == 'Esc') {
            return Kyoutsu.INPUT_ESCAPE;
        }
        return 0;
    }
    Kyoutsu.getInputCode = getInputCode;
    var Keyboard = (function () {
        function Keyboard() {
            this.keyboard = document.createElement('DIV');
            this.keys = [];
            var keyboard = this.keyboard;
            keyboard.style.position = 'absolute';
            keyboard.style.width = '138px';
            keyboard.style.display = 'flex';
            keyboard.style.flexWrap = 'wrap';
            keyboard.style.border = '1px solid black';
            keyboard.style.padding = '2px';
            keyboard.style.textAlign = 'center';
            for (var i = 0; i < 9; i++) {
                var key = document.createElement('DIV');
                key.className = 'sofwareKey';
                key.style.display = 'inline-block';
                key.style.margin = '2px';
                key.style.width = '40px';
                key.style.height = '40px';
                key.style.border = '1px solid red';
                key.style.textAlign = 'center';
                keyboard.appendChild(key);
                this.keys.push(key);
            }
        }
        Keyboard.prototype.setKeyEvent = function (type, listener) {
            for (var i = 0, len = this.keys.length; i < len; i++) {
                this.keys[i].addEventListener(type, listener);
            }
        };
        Keyboard.prototype.setKeytops = function (keytops) {
            for (var i = 0, len = this.keys.length; i < len; i++) {
                var key = this.keys[i];
                var keytop = keytops[i];
                if (key != undefined && keytop != undefined) {
                    if (3 < keytop.length) {
                        key.innerHTML = keytop.substr(0, 3) + '<span style="display:none">' + keytop.substr(3) + '</span>';
                    }
                    else {
                        key.innerHTML = keytop;
                    }
                }
            }
        };
        return Keyboard;
    }());
    Kyoutsu.Keyboard = Keyboard;
    function getKeytop(target) {
        if (!(target instanceof HTMLElement)) {
            return '';
        }
        var element = searchParentElement(target, 'sofwareKey');
        if (element == null) {
            return '';
        }
        var key = element.textContent;
        if (key == null) {
            return '';
        }
        return key;
    }
    Kyoutsu.getKeytop = getKeytop;
})(Kyoutsu || (Kyoutsu = {}));
//# sourceMappingURL=Kyoutsu.js.map