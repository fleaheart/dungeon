var Aao;
(function (Aao) {
    var KEY_UP = 87, KEY_RIGHT = 68, KEY_DOWN = 83, KEY_LEFT = 65;
    var FRAME_TIMING = 16;
    var Character = (function () {
        function Character(chr, mukiListGroup) {
            this.mukiListGroup = {};
            this.chr = chr;
            this.img = document.createElement('IMG');
            this.img.style.position = 'absolute';
            this.x = 0;
            this.y = 0;
            this.frame = 0;
            this.muki = 'e';
            if (mukiListGroup != undefined) {
                this.mukiListGroup = mukiListGroup;
            }
        }
        Character.prototype.moveTo = function (x, y, muki) {
            var dx = x - this.x;
            var dy = y - this.y;
            this.moveBy(dx, dy, muki);
            this.x = x;
            this.y = y;
        };
        Character.prototype.moveBy = function (dx, dy, muki) {
            var array = this.mukiListGroup[muki.muki];
            var currentFlame = this.frame % array.length;
            this.img.src = array[currentFlame];
            this.x += dx;
            this.y += dy;
            this.refrectStyle();
            this.frame++;
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
            this.maptext = new Array();
        }
        return GameField;
    }());
    var GameBoard = (function () {
        function GameBoard() {
            this.fieldAscii = null;
            this.objectAscii = null;
            this.debug = null;
            this.fieldGraph = document.createElement('DIV');
            this.asciiPosition = new Array();
            for (var i = 0; i < 15; i++) {
                this.asciiPosition.push('                                        ');
            }
            this.current = new GameField();
            this.next = new GameField();
        }
        return GameBoard;
    }());
    var _gameBoard = new GameBoard();
    var GameFieldGamen = (function () {
        function GameFieldGamen(name, maptext, imgsrc, over_n, over_e, over_s, over_w) {
            this.over = {};
            this.name = name;
            this.maptext = maptext;
            this.imgsrc = imgsrc;
            this.over['n'] = over_n;
            this.over['e'] = over_e;
            this.over['s'] = over_s;
            this.over['w'] = over_w;
        }
        return GameFieldGamen;
    }());
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
    function put(obj, chr) {
        var x = obj.asciiPosX();
        var y = obj.asciiPosY();
        if (chr == undefined) {
            chr = obj.chr;
        }
        var swp = _gameBoard.asciiPosition[y];
        swp = swp.substr(0, x) + chr + swp.substr(x + 1);
        _gameBoard.asciiPosition[y] = swp;
    }
    function get(x, y) {
        if (y < 0 || _gameBoard.current.maptext.length <= y) {
            return '';
        }
        if (x < 0 || _gameBoard.current.maptext[y].length <= x) {
            return '';
        }
        return _gameBoard.current.maptext[y].charAt(x);
    }
    function display() {
        if (_gameBoard.fieldAscii != null) {
            _gameBoard.fieldAscii.innerHTML = _gameBoard.current.maptext.join('<br>').replace(/ /g, '&nbsp;');
        }
        if (_gameBoard.objectAscii != null) {
            _gameBoard.objectAscii.innerHTML = _gameBoard.asciiPosition.join('<br>').replace(/ /g, '&nbsp;');
        }
    }
    var GameStatus = (function () {
        function GameStatus() {
            this.gameMode = null;
            this.player = new Character('');
            this.gameFieldGamen = new GameFieldGamen('null', new Array(), '', null, null, null, null);
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
                        this.gameStatus.player.moveBy(muki.nextXY.x * 4, muki.nextXY.y * 4, muki);
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
            var character = this.gameStatus.player;
            var next_ascii_x = Math.floor(character.x / 16) + ((character.x % 16 == 0) ? 1 : 0) * muki.nextXY.x;
            var next_ascii_y = Math.floor(character.y / 32) + ((character.y % 32 == 0) ? 1 : 0) * muki.nextXY.y;
            var check_c1 = get(next_ascii_x, next_ascii_y);
            var check_c2 = get(next_ascii_x + 1, next_ascii_y);
            var check_offet;
            if (muki.muki == 'n' || muki.muki == 's') {
                check_offet = character.x % 16 == 0 ? ' ' : get(next_ascii_x + 2, next_ascii_y);
            }
            else if (muki.muki == 'e' || muki.muki == 'w') {
                check_offet = character.y % 32 == 0 ? ' ' : get(next_ascii_x + 1, next_ascii_y + 1);
            }
            else {
                throw 'unreachable';
            }
            if (check_c1 == ' ' && check_c2 == ' ' && check_offet == ' ') {
                if (character.muki == muki.muki) {
                    put(character, ' ');
                    this.gameStatus.koudouArray.push({ type: 'idou', muki: muki });
                }
                else {
                    character.muki = muki.muki;
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
                _gameBoard.next.maptext = this.nextGameFieldGamen.maptext;
                _gameBoard.next.backGround.src = this.nextGameFieldGamen.imgsrc;
                _gameBoard.next.backGround.style.display = '';
                put(this.gameStatus.player, ' ');
            }
            this.frame++;
            _gameBoard.current.backGround.style.top = String(this.frame * -16 * this.muki.nextXY.y) + 'px';
            _gameBoard.current.backGround.style.left = String(this.frame * -16 * this.muki.nextXY.x) + 'px';
            _gameBoard.next.backGround.style.top = String(480 * this.muki.nextXY.y + this.frame * -16 * this.muki.nextXY.y) + 'px';
            _gameBoard.next.backGround.style.left = String(640 * this.muki.nextXY.x + this.frame * -16 * this.muki.nextXY.x) + 'px';
            this.gameStatus.player.moveBy(-15.2 * this.muki.nextXY.x, -15 * this.muki.nextXY.y, this.muki);
            if (this.muki.frameEnd <= this.frame) {
                _gameBoard.current.backGround.src = _gameBoard.next.backGround.src;
                _gameBoard.current.backGround.style.top = '0px';
                _gameBoard.current.backGround.style.left = '0px';
                _gameBoard.next.backGround.style.display = 'none';
                this.muki.scrollEndAdgust(this.gameStatus.player);
                for (var i = 0; i < _gameBoard.current.maptext.length; i++) {
                    _gameBoard.current.maptext[i] = _gameBoard.next.maptext[i];
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
        Muki_N.prototype.over = function (character) {
            return character.y <= 0;
        };
        Muki_N.prototype.scrollEndAdgust = function (character) {
            character.moveTo(character.x, 480 - 32, this);
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
        Muki_E.prototype.over = function (character) {
            return 640 - 32 <= character.x;
        };
        Muki_E.prototype.scrollEndAdgust = function (character) {
            character.moveTo(0, character.y, this);
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
        Muki_S.prototype.over = function (character) {
            return 480 - 32 <= character.y;
        };
        Muki_S.prototype.scrollEndAdgust = function (character) {
            character.moveTo(character.x, 0, this);
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
        Muki_W.prototype.over = function (character) {
            return character.x <= 0;
        };
        Muki_W.prototype.scrollEndAdgust = function (character) {
            character.moveTo(640 - 32, character.y, this);
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
        loadData();
        var player = _gameStatus.player;
        player.moveTo(18 * 16, 2 * 32, muki_s);
        _gameBoard.fieldGraph.appendChild(player.img);
        _gameStatus.gameFieldGamen = getGameFieldGamen('field1');
        for (var i = 0; i < _gameStatus.gameFieldGamen.maptext.length; i++) {
            _gameBoard.current.maptext.push(_gameStatus.gameFieldGamen.maptext[i]);
        }
        _gameBoard.current.backGround.src = _gameStatus.gameFieldGamen.imgsrc;
        put(player);
        display();
        setTimeout(frameCheck, FRAME_TIMING);
    });
    function initMainBoard() {
        var mainBoard = Kyoutsu.getElementById('mainBoard');
        {
            var elm = _gameBoard.fieldGraph;
            elm.className = 'fieldGraph';
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
    var PlayerInitter = (function () {
        function PlayerInitter() {
            this.chr = 'no define';
            this.mukiList_n = new Array();
            this.mukiList_e = new Array();
            this.mukiList_s = new Array();
            this.mukiList_w = new Array();
            this.reg = /^([_0-9a-zA-Z]*): ?(.*)\s*/;
        }
        PlayerInitter.prototype.analize = function (line) {
            var defineData = line.match(this.reg);
            if (defineData != null) {
                var attr = defineData[1];
                var value = defineData[2];
                if (attr == 'chr') {
                    this.chr = value;
                }
                else if (attr == 'mukiList_n') {
                    this.mukiList_n.push(value);
                }
                else if (attr == 'mukiList_e') {
                    this.mukiList_e.push(value);
                }
                else if (attr == 'mukiList_s') {
                    this.mukiList_s.push(value);
                }
                else if (attr == 'mukiList_w') {
                    this.mukiList_w.push(value);
                }
            }
        };
        PlayerInitter.prototype.save = function () {
            var mukiListGroup = { 'n': this.mukiList_n, 'e': this.mukiList_e, 's': this.mukiList_s, 'w': this.mukiList_w };
            var player = new Character(this.chr, mukiListGroup);
            _gameStatus.player = player;
        };
        return PlayerInitter;
    }());
    var GameFieldGamenInitter = (function () {
        function GameFieldGamenInitter() {
            this.name = 'no define';
            this.maptext = new Array();
            this.imgsrc = 'no define';
            this.over_n = null;
            this.over_e = null;
            this.over_s = null;
            this.over_w = null;
            this.reg = /^([_0-9a-zA-Z]*): ?(.*)\s*/;
            this.maptextMode = false;
            this.maptextCount = 0;
        }
        GameFieldGamenInitter.prototype.analize = function (line) {
            if (this.maptextMode) {
                this.maptext.push(line);
                this.maptextCount++;
                if (15 <= this.maptextCount) {
                    this.maptextMode = false;
                }
            }
            else {
                var defineData = line.match(this.reg);
                if (defineData != null) {
                    var attr = defineData[1];
                    var value = defineData[2];
                    if (attr == 'name') {
                        this.name = value;
                    }
                    else if (attr == 'imgsrc') {
                        this.imgsrc = value;
                    }
                    else if (attr == 'maptext') {
                        this.maptextMode = true;
                    }
                    else if (attr == 'over_n') {
                        this.over_n = value;
                    }
                    else if (attr == 'over_e') {
                        this.over_e = value;
                    }
                    else if (attr == 'over_s') {
                        this.over_s = value;
                    }
                    else if (attr == 'over_w') {
                        this.over_w = value;
                    }
                }
            }
        };
        GameFieldGamenInitter.prototype.save = function () {
            _GameFieldGamenList.push(new GameFieldGamen(this.name, this.maptext, this.imgsrc, this.over_n, this.over_e, this.over_s, this.over_w));
        };
        return GameFieldGamenInitter;
    }());
    function loadData() {
        var data = Kyoutsu.load('data.txt');
        var lines = data.split(/[\r\n]+/g);
        var initter = null;
        var i = 0;
        while (true) {
            var line = lines[i];
            i++;
            if (line == undefined) {
                break;
            }
            if (line == '[PLAYER]') {
                if (initter != null) {
                    initter.save();
                }
                initter = new PlayerInitter();
            }
            else if (line == '[FIELD]') {
                if (initter != null) {
                    initter.save();
                }
                initter = new GameFieldGamenInitter();
            }
            if (initter != null) {
                initter.analize(line);
            }
        }
        if (initter != null) {
            initter.save();
        }
    }
})(Aao || (Aao = {}));
//# sourceMappingURL=Aao.js.map