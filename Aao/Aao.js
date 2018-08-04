var Aao;
(function (Aao) {
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
            this.muki = muki_e;
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
            var array = this.mukiListGroup[muki.mukiType];
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
            this.lastInputCode = 0;
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
                        this.gameStatus.player.moveBy(muki.nextX * 4, muki.nextY * 4, muki);
                        if (gamenOver(this.gameStatus.player, muki)) {
                            var nextName = this.gameStatus.gameFieldGamen.over[muki.mukiType];
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
            var inputCode = this.gameStatus.lastInputCode;
            if (inputCode == Kyoutsu.INPUT_UP) {
                this.move(muki_n);
            }
            if (inputCode == Kyoutsu.INPUT_RIGHT) {
                this.move(muki_e);
            }
            if (inputCode == Kyoutsu.INPUT_DOWN) {
                this.move(muki_s);
            }
            if (inputCode == Kyoutsu.INPUT_LEFT) {
                this.move(muki_w);
            }
        };
        FreeGameMode.prototype.move = function (muki) {
            var character = this.gameStatus.player;
            var next_ascii_x = Math.floor(character.x / 16) + ((character.x % 16 == 0) ? 1 : 0) * muki.nextX;
            var next_ascii_y = Math.floor(character.y / 32) + ((character.y % 32 == 0) ? 1 : 0) * muki.nextY;
            var check_c1 = get(next_ascii_x, next_ascii_y);
            var check_c2 = get(next_ascii_x + 1, next_ascii_y);
            var check_offet;
            if (muki.mukiType == 'n' || muki.mukiType == 's') {
                check_offet = character.x % 16 == 0 ? ' ' : get(next_ascii_x + 2, next_ascii_y);
            }
            else if (muki.mukiType == 'e' || muki.mukiType == 'w') {
                check_offet = character.y % 32 == 0 ? ' ' : get(next_ascii_x + 1, next_ascii_y + 1);
            }
            else {
                throw 'unreachable';
            }
            if (check_c1 == ' ' && check_c2 == ' ' && check_offet == ' ') {
                if (character.muki.mukiType == muki.mukiType) {
                    put(character, ' ');
                    this.gameStatus.koudouArray.push({ type: 'idou', muki: muki });
                }
                else {
                    character.muki = muki;
                }
            }
        };
        return FreeGameMode;
    }());
    var ScrollGameMode = (function () {
        function ScrollGameMode(gameStatus, muki, nextGameFieldGamen) {
            this.name = 'scrl';
            this.gameStatus = gameStatus;
            this.muki = muki;
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
            _gameBoard.current.backGround.style.top = String(this.frame * -16 * this.muki.nextY) + 'px';
            _gameBoard.current.backGround.style.left = String(this.frame * -16 * this.muki.nextX) + 'px';
            _gameBoard.next.backGround.style.top = String(480 * this.muki.nextY + this.frame * -16 * this.muki.nextY) + 'px';
            _gameBoard.next.backGround.style.left = String(640 * this.muki.nextX + this.frame * -16 * this.muki.nextX) + 'px';
            this.gameStatus.player.moveBy(-15.2 * this.muki.nextX, -15 * this.muki.nextY, this.muki);
            if (this.muki.frameEnd <= this.frame) {
                _gameBoard.current.backGround.src = _gameBoard.next.backGround.src;
                _gameBoard.current.backGround.style.top = '0px';
                _gameBoard.current.backGround.style.left = '0px';
                _gameBoard.next.backGround.style.display = 'none';
                scrollEndAdgust(this.gameStatus.player, this.muki);
                for (var i = 0; i < _gameBoard.current.maptext.length; i++) {
                    _gameBoard.current.maptext[i] = _gameBoard.next.maptext[i];
                }
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
                    + '<br>' + gameStatus.lastInputCode
                    + '<br>' + gameStatus.gameFieldGamen.name
                    + '<br>' + gameStatus.player.x + ',' + gameStatus.player.y
                    + '<br>' + gameStatus.player.asciiPosX() + ',' + gameStatus.player.asciiPosY();
        }
        if (gameStatus.lastInputCode == Kyoutsu.INPUT_ESCAPE) {
            return;
        }
        gameStatus.gameMode.do();
        setTimeout(frameCheck, FRAME_TIMING);
    }
    var muki_n = {
        mukiType: 'n',
        nextX: 0,
        nextY: -1,
        frameEnd: 30
    };
    var muki_e = {
        mukiType: 'e',
        nextX: 1,
        nextY: 0,
        frameEnd: 40
    };
    var muki_s = {
        mukiType: 's',
        nextX: 0,
        nextY: 1,
        frameEnd: 30
    };
    var muki_w = {
        mukiType: 'w',
        nextX: -1,
        nextY: 0,
        frameEnd: 40
    };
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
    function gamenOver(character, muki) {
        if (muki.nextY < 0) {
            return character.y <= 0;
        }
        if (0 < muki.nextX) {
            return 640 - 32 <= character.x;
        }
        if (0 < muki.nextY) {
            return 480 - 32 <= character.y;
        }
        if (muki.nextX < 0) {
            return character.x <= 0;
        }
        throw 'unreachable';
    }
    function scrollEndAdgust(character, muki) {
        if (muki.nextY < 0) {
            character.moveTo(character.x, 480 - 32, muki);
        }
        if (0 < muki.nextX) {
            character.moveTo(0, character.y, muki);
        }
        if (0 < muki.nextY) {
            character.moveTo(character.x, 0, muki);
        }
        if (muki.nextX < 0) {
            character.moveTo(640 - 32, character.y, muki);
        }
    }
    var GameInitter = (function () {
        function GameInitter() {
            this.start_field = 'no define';
            this.start_x = 0;
            this.start_y = 0;
            this.start_muki = null;
            this.gameFieldGamenList = new Array();
            this.reg = /^([_0-9a-zA-Z]*): ?(.*)\s*/;
        }
        GameInitter.prototype.analize = function (line) {
            var defineData = line.match(this.reg);
            if (defineData != null) {
                var attr = defineData[1];
                var value = defineData[2];
                if (attr == 'start_field') {
                    this.start_field = value;
                }
                else if (attr == 'start_x') {
                    this.start_x = +value;
                }
                else if (attr == 'start_y') {
                    this.start_y = +value;
                }
                else if (attr == 'start_muki') {
                    if (value == 'n' || value == 'e' || value == 's' || value == 'w') {
                        this.start_muki = createMuki(value);
                    }
                }
            }
        };
        GameInitter.prototype.save = function () {
        };
        return GameInitter;
    }());
    function init() {
        initMainBoard();
        document.addEventListener('keydown', function (e) {
            documentKeydown(e.key);
        });
        document.addEventListener('keyup', function (e) {
            var inputCode = Kyoutsu.getInputCode(e.key);
            documentKeyup(inputCode);
        });
        var gameInitter = new GameInitter();
        loadData(gameInitter);
        if (gameInitter.player == null || gameInitter.start_muki == null) {
            throw 'illigal data file';
        }
        var player = gameInitter.player;
        for (var i = 0, len = gameInitter.gameFieldGamenList.length; i < len; i++) {
            _GameFieldGamenList.push(gameInitter.gameFieldGamenList[i]);
        }
        var gameFieldGamen = getGameFieldGamen(gameInitter.start_field);
        _gameStatus.player = player;
        _gameStatus.gameFieldGamen = gameFieldGamen;
        _gameBoard.fieldGraph.appendChild(player.img);
        _gameBoard.current.backGround.src = gameFieldGamen.imgsrc;
        for (var i = 0; i < gameFieldGamen.maptext.length; i++) {
            _gameBoard.current.maptext.push(gameFieldGamen.maptext[i]);
        }
        player.moveTo(gameInitter.start_x * 16, gameInitter.start_y * 32, gameInitter.start_muki);
        put(player);
        display();
        setTimeout(frameCheck, FRAME_TIMING);
    }
    Aao.init = init;
    ;
    function documentKeydown(key) {
        _gameStatus.lastInputCode = Kyoutsu.getInputCode(key);
    }
    function documentKeyup(inputCode) {
        if (inputCode == 0 || inputCode == _gameStatus.lastInputCode) {
            _gameStatus.lastInputCode = 0;
        }
    }
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
        var keyboard = new Kyoutsu.Keyboard();
        keyboard.keyboard.style.top = '496px';
        mainBoard.appendChild(keyboard.keyboard);
        keyboard.setKeyEvent('mousedown', keyboardMousedown);
        keyboard.setKeyEvent('mouseup', keyboardMouseup);
        keyboard.setKeytops([' ', 'w', ' ', 'a', 's', 'd', ' ', 'Escape', ' ']);
    }
    function keyboardMousedown(e) {
        var key = Kyoutsu.getKeytop(e.target);
        documentKeydown(key);
    }
    function keyboardMouseup() {
        documentKeyup(0);
    }
    var PlayerInitter = (function () {
        function PlayerInitter(gameInitter) {
            this.chr = 'no define';
            this.mukiList_n = new Array();
            this.mukiList_e = new Array();
            this.mukiList_s = new Array();
            this.mukiList_w = new Array();
            this.reg = /^([_0-9a-zA-Z]*): ?(.*)\s*/;
            this.gameInitter = gameInitter;
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
            this.gameInitter.player = player;
        };
        return PlayerInitter;
    }());
    var GameFieldGamenInitter = (function () {
        function GameFieldGamenInitter(gameInitter) {
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
            this.gameInitter = gameInitter;
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
            this.gameInitter.gameFieldGamenList.push(new GameFieldGamen(this.name, this.maptext, this.imgsrc, this.over_n, this.over_e, this.over_s, this.over_w));
        };
        return GameFieldGamenInitter;
    }());
    function loadData(gameInitter) {
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
            if (line == '[GAME_INITIALIZE]') {
                if (initter != null) {
                    initter.save();
                }
                initter = gameInitter;
            }
            else if (line == '[PLAYER]') {
                if (initter != null) {
                    initter.save();
                }
                initter = new PlayerInitter(gameInitter);
            }
            else if (line == '[FIELD]') {
                if (initter != null) {
                    initter.save();
                }
                initter = new GameFieldGamenInitter(gameInitter);
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