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
    var GameFieldGamen = (function () {
        function GameFieldGamen(name, field, imgsrc, over_n, over_e, over_s, over_w) {
            this.over = {};
            this.name = name;
            this.field = field;
            this.imgsrc = imgsrc;
            this.over['n'] = over_n;
            this.over['e'] = over_e;
            this.over['s'] = over_s;
            this.over['w'] = over_w;
        }
        return GameFieldGamen;
    }());
    var NullGameFieldGamen = new GameFieldGamen('null', new Array(), '', null, null, null, null);
    var $field1 = new Array();
    var $field2 = new Array();
    var $field3 = new Array();
    var FRAME_TIMING = 16;
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
    var _GameFieldGamenList = new Array();
    function getGameFieldGamen(name) {
        for (var i = 0, len = _GameFieldGamenList.length; i < len; i++) {
            var item = _GameFieldGamenList[i];
            if (item.name == name) {
                return item;
            }
        }
        throw name + ' is not found';
    }
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
            this.gameFieldGamen = NullGameFieldGamen;
            this.frameCount = 0;
            this.lastKeyCode = -1;
            this.lastKey = '';
            this.koudouArray = new Array();
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
            if (this.gameStatus.frameCount % 2 != 0) {
                return;
            }
            if (0 < this.gameStatus.koudouArray.length) {
                var koudou = this.gameStatus.koudouArray.shift();
                if (koudou != undefined) {
                    if (koudou.type == 'idou') {
                        var muki = koudou.muki;
                        this.gameStatus.player.moveBy(muki.nextXY.x * 4, muki.nextXY.y * 4);
                        if (muki.over(this.gameStatus.player)) {
                            var nextName = this.gameStatus.gameFieldGamen.over[muki.muki];
                            if (nextName != null) {
                                var nextGameFieldGamen = getGameFieldGamen(nextName);
                                this.gameStatus.gameMode = new ScrollGameMode(this.gameStatus, this.gameStatus.player.muki, nextGameFieldGamen);
                                return;
                            }
                        }
                    }
                    if (koudou.type == 'jump') {
                    }
                }
            }
            put(this.gameStatus.player);
            display();
            var lastKeyCode = this.gameStatus.lastKeyCode;
            if (lastKeyCode == KEY_UP) {
                this.move(muki_n);
            }
            if (lastKeyCode == KEY_RIGHT) {
                this.move(muki_e);
            }
            if (lastKeyCode == KEY_DOWN) {
                this.move(muki_s);
            }
            if (lastKeyCode == KEY_LEFT) {
                this.move(muki_w);
            }
        };
        FreeGameMode.prototype.move = function (muki) {
            var player = this.gameStatus.player;
            var next_ascii_x = Math.floor(player.x / 16) + ((player.x % 16 == 0) ? 1 : 0) * muki.nextXY.x;
            var next_ascii_y = Math.floor(player.y / 32) + ((player.y % 32 == 0) ? 1 : 0) * muki.nextXY.y;
            var check_c1 = get(next_ascii_x, next_ascii_y);
            var check_c2 = get(next_ascii_x + 1, next_ascii_y);
            if (check_c1 == ' ' && check_c2 == ' ') {
                if (player.muki == muki.muki) {
                    putc(player.asciiPosX(), player.asciiPosY(), ' ');
                    this.gameStatus.koudouArray.push({ type: 'idou', muki: muki });
                }
                else {
                    player.muki = muki.muki;
                }
            }
        };
        return FreeGameMode;
    }());
    var ScrollGameMode = (function () {
        function ScrollGameMode(gameStatus, mukiType, nextGameFieldGamen) {
            this.name = 'scrl';
            this.gameStatus = gameStatus;
            this.muki = createMuki(mukiType);
            this.nextGameFieldGamen = nextGameFieldGamen;
            this.frame = 0;
        }
        ScrollGameMode.prototype.do = function () {
            if (this.frame == 0) {
                _gameBoard.next.field = this.nextGameFieldGamen.field;
                _gameBoard.next.backGround.src = this.nextGameFieldGamen.imgsrc;
                _gameBoard.next.backGround.style.display = '';
                putc(this.gameStatus.player.asciiPosX(), this.gameStatus.player.asciiPosY(), ' ');
            }
            this.frame++;
            _gameBoard.current.backGround.style.top = String(this.frame * -16 * this.muki.nextXY.y) + 'px';
            _gameBoard.current.backGround.style.left = String(this.frame * -16 * this.muki.nextXY.x) + 'px';
            _gameBoard.next.backGround.style.top = String(480 * this.muki.nextXY.y + this.frame * -16 * this.muki.nextXY.y) + 'px';
            _gameBoard.next.backGround.style.left = String(640 * this.muki.nextXY.x + this.frame * -16 * this.muki.nextXY.x) + 'px';
            this.gameStatus.player.moveBy(-15.2 * this.muki.nextXY.x, -15 * this.muki.nextXY.y);
            if (this.muki.frameEnd <= this.frame) {
                _gameBoard.current.backGround.src = _gameBoard.next.backGround.src;
                _gameBoard.current.backGround.style.top = '0px';
                _gameBoard.current.backGround.style.left = '0px';
                _gameBoard.next.backGround.style.display = 'none';
                this.muki.scrollEndAdgust(this.gameStatus.player);
                for (var i = 0; i < _gameBoard.current.field.length; i++) {
                    _gameBoard.current.field[i] = _gameBoard.next.field[i];
                }
                display();
                this.gameStatus.gameFieldGamen = this.nextGameFieldGamen;
                this.gameStatus.gameMode = new FreeGameMode(this.gameStatus);
            }
        };
        return ScrollGameMode;
    }());
    function frameCheck() {
        var gameStatus = _gameStatus;
        gameStatus.frameCount++;
        if (gameStatus.gameMode == null) {
            gameStatus.gameMode = new FreeGameMode(gameStatus);
        }
        if (_gameBoard.debug != null) {
            _gameBoard.debug.innerHTML =
                gameStatus.gameMode.name
                    + '<br>' + gameStatus.frameCount
                    + '<br>' + gameStatus.lastKey
                    + ' / ' + gameStatus.lastKeyCode
                    + '<br>' + gameStatus.gameFieldGamen.name
                    + '<br>' + gameStatus.player.x + ',' + gameStatus.player.y
                    + '<br>' + gameStatus.player.asciiPosX() + ',' + gameStatus.player.asciiPosY();
        }
        if (gameStatus.lastKeyCode == 27) {
            return;
        }
        gameStatus.gameMode.do();
        setTimeout(frameCheck, FRAME_TIMING);
    }
    var Muki_N = (function () {
        function Muki_N() {
            this.muki = 'n';
            this.nextXY = { x: 0, y: -1 };
            this.frameEnd = 30;
        }
        Muki_N.prototype.over = function (pc) {
            return pc.y <= 0;
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
            this.nextXY = { x: 1, y: 0 };
            this.frameEnd = 40;
        }
        Muki_E.prototype.over = function (pc) {
            return 640 - 32 <= pc.x;
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
            this.nextXY = { x: 0, y: 1 };
            this.frameEnd = 30;
        }
        Muki_S.prototype.over = function (pc) {
            return 480 - 32 <= pc.y;
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
            this.nextXY = { x: -1, y: 0 };
            this.frameEnd = 40;
        }
        Muki_W.prototype.over = function (pc) {
            return pc.x <= 0;
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
            _gameStatus.lastKeyCode = e.keyCode;
            _gameStatus.lastKey = e.key;
        });
        document.addEventListener('keyup', function (e) {
            if (e.keyCode == _gameStatus.lastKeyCode) {
                _gameStatus.lastKeyCode = -1;
                _gameStatus.lastKey = '';
            }
        });
        _GameFieldGamenList.push(new GameFieldGamen('field1', $field1, 'map1.png', 'field2', null, null, null));
        _GameFieldGamenList.push(new GameFieldGamen('field2', $field2, 'map2.png', null, 'field3', 'field1', null));
        _GameFieldGamenList.push(new GameFieldGamen('field3', $field3, 'map3.png', null, null, null, 'field2'));
        var player = new Character('A');
        player.moveTo(18 * 16, 2 * 32);
        _gameBoard.fieldGraph.appendChild(player.img);
        _gameStatus.player = player;
        _gameStatus.gameFieldGamen = getGameFieldGamen('field1');
        put(player);
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