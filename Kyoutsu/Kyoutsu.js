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
    var Message = (function () {
        function Message() {
            var _this = this;
            this.board = null;
            this.clear = function () {
                if (_this.board == null) {
                    return;
                }
                _this.board.innerHTML = '';
            };
            this.add = function (text) {
                if (_this.board == null) {
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
                if (_this.board == null) {
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
    Kyoutsu.INPUT_UP = 1;
    Kyoutsu.INPUT_RIGHT = 2;
    Kyoutsu.INPUT_DOWN = 4;
    Kyoutsu.INPUT_LEFT = 8;
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
})(Kyoutsu || (Kyoutsu = {}));
//# sourceMappingURL=Kyoutsu.js.map