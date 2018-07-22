var Aao;
(function (Aao) {
    var KEY_UP = 87, KEY_RIGHT = 68, KEY_DOWN = 83, KEY_LEFT = 65;
    var Character = (function () {
        function Character(chr) {
            this.chr = chr;
            this.img = document.createElement('IMG');
            this.img.style.position = 'absolute';
            this.x = 0;
            this.y = 0;
            this.muki = 'e';
        }
        Character.prototype.moveTo = function (x, y) {
            var dx = x - this.x;
            var dy = y - this.y;
            this.moveBy(dx, dy);
            this.x = x;
            this.y = y;
        };
        Character.prototype.moveBy = function (dx, dy) {
            if (dx < 0) {
                this.img.src = 'player3.png';
            }
            if (0 < dx) {
                this.img.src = 'player4.png';
            }
            if (dy < 0) {
                this.img.src = 'player2.png';
            }
            if (0 < dy) {
                this.img.src = 'player1.png';
            }
            this.x += dx;
            this.y += dy;
            this.refrectStyle();
        };
        Character.prototype.asciiPosX = function () {
            return Math.floor((this.x) / 16);
        };
        Character.prototype.asciiPosY = function () {
            return Math.floor((this.y) / 32);
        };
        Character.prototype.refrectStyle = function () {
            this.img.style.left = this.x + 'px';
            this.img.style.top = this.y + 'px';
        };
        return Character;
    }());
    var GameField = (function () {
        function GameField() {
            this.backGround = document.createElement('IMG');
            this.field = new Array();
        }
        return GameField;
    }());
    var GameBoard = (function () {
        function GameBoard() {
            this.fieldAscii = null;
            this.objectAscii = null;
            this.debug = null;
            this.fieldGraph = document.createElement('DIV');
            this.current = new GameField();
            this.next = new GameField();
        }
        return GameBoard;
    }());
    var _gameBoard = new GameBoard();
    var $field1 = new Array();
    var $field2 = new Array();
    var $field3 = new Array();
    var $koudouArray = new Array();
    var $lastKeyCode;
    var FRAME_TIMING = 16;
    var $pc;
    $field1.push('**************************      ********');
    $field1.push('*        **                            *');
    $field1.push('*       **    **      ***      ****    *');
    $field1.push('*      **    **    ****************    *');
    $field1.push('********    **     ******  *****       *');
    $field1.push('**          **              ****       *');
    $field1.push('**   ********                          *');
    $field1.push('**   *                                 *');
    $field1.push('**   *                      ***        *');
    $field1.push('**   *                      ***        *');
    $field1.push('*                                      *');
    $field1.push('*                                      *');
    $field1.push('*          ****               **********');
    $field1.push('*          ****               **********');
    $field1.push('****************************************');
    $field2.push('****************************************');
    $field2.push('*                                      *');
    $field2.push('*                                      *');
    $field2.push('*                                      *');
    $field2.push('*                                      *');
    $field2.push('*                                       ');
    $field2.push('*                                       ');
    $field2.push('*                                       ');
    $field2.push('*                                       ');
    $field2.push('*                                      *');
    $field2.push('*                                      *');
    $field2.push('*                                      *');
    $field2.push('*                                      *');
    $field2.push('*                                      *');
    $field2.push('**************************      ********');
    $field3.push('****************************************');
    $field3.push('*                                      *');
    $field3.push('*                                      *');
    $field3.push('*                                      *');
    $field3.push('*                                      *');
    $field3.push('                                       *');
    $field3.push('                                       *');
    $field3.push('                                       *');
    $field3.push('                                       *');
    $field3.push('*                                      *');
    $field3.push('*                                      *');
    $field3.push('*                                      *');
    $field3.push('*                                      *');
    $field3.push('*                                      *');
    $field3.push('****************************************');
    for (var i = 0; i < $field1.length; i++) {
        _gameBoard.current.field.push($field1[i]);
    }
    var $asciiPosition = new Array();
    for (var i = 0; i < _gameBoard.current.field.length; i++) {
        $asciiPosition.push('                                        ');
    }
    var $hougaku = {
        n: { x: 0, y: -1 }, e: { x: 1, y: 0 }, s: { x: 0, y: 1 }, w: { x: -1, y: 0 }
    };
    function put(obj) {
        putc(obj.asciiPosX(), obj.asciiPosY(), obj.chr);
    }
    function putc(x, y, chr) {
        var swp = $asciiPosition[y];
        swp = swp.substr(0, x) + chr + swp.substr(x + 1);
        $asciiPosition[y] = swp;
    }
    function get(x, y) {
        if (y < 0 || _gameBoard.current.field.length <= y) {
            return '';
        }
        if (x < 0 || _gameBoard.current.field[y].length <= x) {
            return '';
        }
        return _gameBoard.current.field[y].charAt(x);
    }
    function display() {
        if (_gameBoard.fieldAscii != null) {
            _gameBoard.fieldAscii.innerHTML = _gameBoard.current.field.join('<br>').replace(/ /g, '&nbsp;');
        }
        if (_gameBoard.objectAscii != null) {
            _gameBoard.objectAscii.innerHTML = $asciiPosition.join('<br>').replace(/ /g, '&nbsp;');
        }
    }
    var GameStatus = (function () {
        function GameStatus() {
            this.gameMode = null;
            this.player = new Character('');
            this.frameCount = 0;
        }
        return GameStatus;
    }());
    var _gameStatus = new GameStatus();
    var FreeGameMode = (function () {
        function FreeGameMode(gameStatus) {
            this.name = 'free';
            this.gameStatus = gameStatus;
        }
        FreeGameMode.prototype.do = function () {
            if (_gameStatus.frameCount % 2 == 0) {
                if (0 < $koudouArray.length) {
                    var koudou = $koudouArray.shift();
                    if (koudou.type == 'idou') {
                        $pc.moveBy(koudou.value.x * 4, koudou.value.y * 4);
                        if ($pc.muki == 'n' && $pc.y <= 0) {
                            _gameBoard.next.backGround.src = 'map2.png';
                            _gameBoard.next.backGround.style.position = 'absolute';
                            _gameBoard.next.backGround.style.top = '-480px';
                            _gameBoard.next.backGround.style.left = '0px';
                            _gameBoard.current.backGround.style.top = '0px';
                            _gameBoard.current.backGround.style.left = '0px';
                            _gameBoard.next.field = $field2;
                            _gameBoard.next.backGround.style.display = '';
                            this.gameStatus.gameMode = new ScrollGameMode(this.gameStatus, $pc.muki);
                            return;
                        }
                        if ($pc.muki == 'e' && 640 - 32 <= $pc.x) {
                            _gameBoard.next.backGround.src = 'map3.png';
                            _gameBoard.next.backGround.style.position = 'absolute';
                            _gameBoard.next.backGround.style.top = '0px';
                            _gameBoard.next.backGround.style.left = '640px';
                            _gameBoard.current.backGround.style.top = '0px';
                            _gameBoard.current.backGround.style.left = '0px';
                            _gameBoard.next.field = $field3;
                            _gameBoard.next.backGround.style.display = '';
                            this.gameStatus.gameMode = new ScrollGameMode(this.gameStatus, $pc.muki);
                            return;
                        }
                        if ($pc.muki == 's' && 480 - 32 <= $pc.y) {
                            _gameBoard.next.backGround.src = 'map1.png';
                            _gameBoard.next.backGround.style.top = '480px';
                            _gameBoard.next.backGround.style.left = '0px';
                            _gameBoard.current.backGround.style.top = '0px';
                            _gameBoard.current.backGround.style.left = '0px';
                            _gameBoard.next.field = $field1;
                            _gameBoard.next.backGround.style.display = '';
                            this.gameStatus.gameMode = new ScrollGameMode(this.gameStatus, $pc.muki);
                            return;
                        }
                        if ($pc.muki == 'w' && $pc.x <= 0) {
                            _gameBoard.next.backGround.src = 'map2.png';
                            _gameBoard.next.backGround.style.position = 'absolute';
                            _gameBoard.next.backGround.style.top = '0px';
                            _gameBoard.next.backGround.style.left = '-640px';
                            _gameBoard.current.backGround.style.top = '0px';
                            _gameBoard.current.backGround.style.left = '0px';
                            _gameBoard.next.field = $field2;
                            _gameBoard.next.backGround.style.display = '';
                            this.gameStatus.gameMode = new ScrollGameMode(this.gameStatus, $pc.muki);
                            return;
                        }
                    }
                    if (koudou.type == 'jump') {
                        $pc.moveBy(0, koudou.value);
                    }
                }
                put($pc);
                display();
                if ($lastKeyCode == KEY_UP) {
                    move_tate('n');
                }
                if ($lastKeyCode == KEY_RIGHT) {
                    move_yoko('e');
                }
                if ($lastKeyCode == KEY_DOWN) {
                    move_tate('s');
                }
                if ($lastKeyCode == KEY_LEFT) {
                    move_yoko('w');
                }
            }
        };
        return FreeGameMode;
    }());
    var ScrollGameMode = (function () {
        function ScrollGameMode(gameStatus, mukiType) {
            this.name = 'scrl';
            this.gameStatus = gameStatus;
            this.muki = createMuki(mukiType);
            this.frame = 0;
        }
        ScrollGameMode.prototype.do = function () {
            if (this.frame == 0) {
                putc($pc.asciiPosX(), $pc.asciiPosY(), ' ');
            }
            this.frame++;
            var scrollAmount = this.muki.scroll(this.frame);
            _gameBoard.current.backGround.style.top = scrollAmount.current.top + 'px';
            _gameBoard.current.backGround.style.left = scrollAmount.current.left + 'px';
            _gameBoard.next.backGround.style.top = scrollAmount.next.top + 'px';
            _gameBoard.next.backGround.style.left = scrollAmount.next.left + 'px';
            $pc.moveBy(scrollAmount.pc.x, scrollAmount.pc.y);
            if (this.muki.frameEnd <= this.frame) {
                _gameBoard.current.backGround.src = _gameBoard.next.backGround.src;
                _gameBoard.current.backGround.style.top = '0px';
                _gameBoard.current.backGround.style.left = '0px';
                _gameBoard.next.backGround.style.display = 'none';
                this.muki.scrollEndAdgust($pc);
                for (var i = 0; i < _gameBoard.current.field.length; i++) {
                    _gameBoard.current.field[i] = _gameBoard.next.field[i];
                }
                display();
                this.gameStatus.gameMode = new FreeGameMode(_gameStatus);
            }
        };
        return ScrollGameMode;
    }());
    function frameCheck() {
        _gameStatus.frameCount++;
        if (_gameStatus.gameMode == null) {
            _gameStatus.gameMode = new FreeGameMode(_gameStatus);
        }
        if (_gameBoard.debug != null) {
            _gameBoard.debug.innerHTML =
                _gameStatus.gameMode.name + '<br>' + _gameStatus.frameCount + '<br>' + $lastKeyCode
                    + '<br>' + $pc.x + ',' + $pc.y
                    + '<br>' + $pc.asciiPosX() + ',' + $pc.asciiPosY();
        }
        if ($lastKeyCode == 27) {
            return;
        }
        _gameStatus.gameMode.do();
        setTimeout(frameCheck, FRAME_TIMING);
    }
    function move_tate(hougaku) {
        var check_ascii_x = Math.floor(($pc.x + 0) / 16);
        var check_ascii_y = hougaku == 's' ? Math.floor(($pc.y + 32) / 32) : Math.floor($pc.y / 32) - (($pc.y % 32 == 0) ? 1 : 0);
        var check_c1 = get(check_ascii_x, check_ascii_y);
        var check_c2 = get(check_ascii_x + 1, check_ascii_y);
        var check_offet = $pc.x % 16 == 0 ? ' ' : get(check_ascii_x + 2, check_ascii_y);
        move_check(hougaku, check_c1, check_c2, check_offet);
    }
    function move_yoko(hougaku) {
        var check_ascii_x = hougaku == 'e' ? Math.floor(($pc.x + 32) / 16) : Math.floor($pc.x / 16) - (($pc.x % 16 == 0) ? 1 : 0);
        var check_ascii_y = Math.floor(($pc.y + 0) / 32);
        var check_c = get(check_ascii_x, check_ascii_y);
        var check_offet = $pc.y % 32 == 0 ? ' ' : get(check_ascii_x, check_ascii_y + 1);
        move_check(hougaku, check_c, ' ', check_offet);
    }
    function move_check(hougaku, c1, c2, c3) {
        if (c1 == ' ' && c2 == ' ' && c3 == ' ') {
            if ($pc.muki == hougaku) {
                putc($pc.asciiPosX(), $pc.asciiPosY(), ' ');
                $koudouArray.push({ type: 'idou', value: $hougaku[hougaku] });
            }
            else {
                $pc.muki = hougaku;
            }
        }
    }
    var Muki_N = (function () {
        function Muki_N() {
            this.muki = 'n';
            this.frameEnd = 30;
        }
        Muki_N.prototype.scroll = function (frame) {
            var current = { top: 0 + 16 * frame, left: 0 };
            var next = { top: -480 + 16 * frame, left: 0 };
            var pc = { x: 0, y: 15 };
            return { current: current, next: next, pc: pc };
        };
        Muki_N.prototype.scrollEndAdgust = function (pc) {
            pc.moveTo(pc.x, 480 - 32);
        };
        return Muki_N;
    }());
    var muki_n = new Muki_N();
    var Muki_E = (function () {
        function Muki_E() {
            this.muki = 'e';
            this.frameEnd = 40;
        }
        Muki_E.prototype.scroll = function (frame) {
            var current = { top: 0, left: 0 - 16 * frame };
            var next = { top: 0, left: 640 - 16 * frame };
            var pc = { x: -15.2, y: 0 };
            return { current: current, next: next, pc: pc };
        };
        Muki_E.prototype.scrollEndAdgust = function (pc) {
            pc.moveTo(0, pc.y);
        };
        return Muki_E;
    }());
    var muki_e = new Muki_E();
    var Muki_S = (function () {
        function Muki_S() {
            this.muki = 's';
            this.frameEnd = 30;
        }
        Muki_S.prototype.scroll = function (frame) {
            var current = { top: 0 - 16 * frame, left: 0 };
            var next = { top: 480 - 16 * frame, left: 0 };
            var pc = { x: 0, y: -15 };
            return { current: current, next: next, pc: pc };
        };
        Muki_S.prototype.scrollEndAdgust = function (pc) {
            pc.moveTo(pc.x, 0);
        };
        return Muki_S;
    }());
    var muki_s = new Muki_S();
    var Muki_W = (function () {
        function Muki_W() {
            this.muki = 'w';
            this.frameEnd = 40;
        }
        Muki_W.prototype.scroll = function (frame) {
            var current = { top: 0, left: 0 + 16 * frame };
            var next = { top: 0, left: -640 + 16 * frame };
            var pc = { x: 15.2, y: 0 };
            return { current: current, next: next, pc: pc };
        };
        Muki_W.prototype.scrollEndAdgust = function (pc) {
            pc.moveTo(640 - 32, pc.y);
        };
        return Muki_W;
    }());
    var muki_w = new Muki_W();
    function createMuki(mukiType) {
        if (mukiType == 'n') {
            return muki_n;
        }
        else if (mukiType == 'e') {
            return muki_e;
        }
        else if (mukiType == 's') {
            return muki_s;
        }
        else if (mukiType == 'w') {
            return muki_w;
        }
        throw mukiType + ' is illigal argument';
    }
    window.addEventListener('load', function () {
        initMainBoard();
        document.addEventListener('keydown', function (e) {
            $lastKeyCode = e.keyCode;
        });
        document.addEventListener('keyup', function (e) {
            if (e.keyCode == $lastKeyCode) {
                $lastKeyCode = -1;
            }
        });
        $pc = new Character('A');
        $pc.moveTo(18 * 16, 2 * 32);
        _gameBoard.fieldGraph.appendChild($pc.img);
        _gameStatus.player = $pc;
        put($pc);
        display();
        setTimeout(frameCheck, FRAME_TIMING);
    });
    function initMainBoard() {
        var mainBoard = Kyoutsu.getElementById('mainBoard');
        {
            var elm = _gameBoard.fieldGraph;
            elm.className = 'fieldGraph';
            _gameBoard.current.backGround.src = 'map1.png';
            _gameBoard.current.backGround.style.position = 'absolute';
            _gameBoard.next.backGround.style.position = 'absolute';
            _gameBoard.next.backGround.style.display = 'none';
            elm.appendChild(_gameBoard.current.backGround);
            elm.appendChild(_gameBoard.next.backGround);
            mainBoard.appendChild(elm);
        }
        {
            var elm = document.createElement('DIV');
            elm.className = 'fieldAscii';
            elm.style.left = '660px';
            _gameBoard.fieldAscii = elm;
            mainBoard.appendChild(elm);
        }
        {
            var elm = document.createElement('DIV');
            elm.className = 'fieldAscii';
            elm.style.left = '660px';
            elm.style.color = 'red';
            _gameBoard.objectAscii = elm;
            mainBoard.appendChild(elm);
        }
        {
            var elm = document.createElement('DIV');
            elm.style.position = 'absolute';
            elm.style.top = '180px';
            elm.style.left = '660px';
            _gameBoard.debug = elm;
            mainBoard.appendChild(elm);
        }
    }
})(Aao || (Aao = {}));
//# sourceMappingURL=Aao.js.map