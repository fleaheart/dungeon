"use strict";
var Aao;
(function (Aao) {
    var FRAME_TIMING = 16;
    var MukiClass = (function () {
        function MukiClass(mukiType, nextX, nextY, frameEnd) {
            this.mukiType = mukiType;
            this.nextX = nextX;
            this.nextY = nextY;
            this.frameEnd = frameEnd;
        }
        return MukiClass;
    }());
    var muki_n = new MukiClass('n', 0, -1, 30);
    var muki_e = new MukiClass('e', 1, 0, 40);
    var muki_s = new MukiClass('s', 0, 1, 30);
    var muki_w = new MukiClass('w', -1, 0, 40);
    var mukiArray = [muki_n, muki_e, muki_s, muki_w];
    function createMuki(mukiType) {
        for (var i = 0, len = mukiArray.length; i < len; i++) {
            var muki = mukiArray[i];
            if (muki.mukiType == mukiType) {
                return muki;
            }
        }
        throw mukiType + ' is illigal argument';
    }
    var Character = (function () {
        function Character(chr, mukiListGroup) {
            this.mukiListGroup = undefined;
            this.chr = chr;
            this.img = document.createElement('IMG');
            this.img.style.position = 'absolute';
            this.x = 0;
            this.y = 0;
            this.ascii_x = 0;
            this.ascii_y = 0;
            this.frame = 0;
            this.muki = muki_e;
            this.mukiListGroup = mukiListGroup;
        }
        Character.prototype.moveTo = function (x, y, muki) {
            var dx = x - this.x;
            var dy = y - this.y;
            this.moveBy(dx, dy, muki);
            this.x = x;
            this.y = y;
        };
        Character.prototype.moveBy = function (dx, dy, muki) {
            this.frame++;
            this.x += dx;
            this.y += dy;
            this.img.style.left = this.x + 'px';
            this.img.style.top = this.y + 'px';
            if (dx < 0) {
                this.ascii_x = Math.floor(this.x / 16);
            }
            else if (0 < dx) {
                this.ascii_x = Math.ceil(this.x / 16);
            }
            if (dy < 0) {
                this.ascii_y = Math.floor(this.y / 32);
            }
            else if (0 < dy) {
                this.ascii_y = Math.ceil(this.y / 32);
            }
            if (this.mukiListGroup == undefined) {
                return;
            }
            var array = this.mukiListGroup[muki.mukiType];
            var currentFlame = this.frame % array.length;
            this.img.src = array[currentFlame];
        };
        return Character;
    }());
    var GameField = (function () {
        function GameField() {
            this.backGround = document.createElement('IMG');
            this.maptext = [];
        }
        return GameField;
    }());
    var GameBoard = (function () {
        function GameBoard() {
            this.fieldAscii = undefined;
            this.objectAscii = undefined;
            this.debug = undefined;
            this.fieldGraph = document.createElement('DIV');
            this.asciiPosition = [];
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
    var _GameFieldGamenList = [];
    function getGameFieldGamen(name) {
        for (var i = 0, len = _GameFieldGamenList.length; i < len; i++) {
            var item = _GameFieldGamenList[i];
            if (item.name == name) {
                return item;
            }
        }
        throw name + ' is not found';
    }
    var GameInitter = (function () {
        function GameInitter() {
            this.start_field = 'no define';
            this.player = undefined;
            this.start_x = 0;
            this.start_y = 0;
            this.start_muki = undefined;
            this.gameFieldGamenList = [];
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
                    this.start_x = Number(value);
                }
                else if (attr == 'start_y') {
                    this.start_y = Number(value);
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
    var PlayerInitter = (function () {
        function PlayerInitter(gameInitter) {
            this.chr = 'no define';
            this.mukiList_n = [];
            this.mukiList_e = [];
            this.mukiList_s = [];
            this.mukiList_w = [];
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
            this.maptext = [];
            this.imgsrc = 'no define';
            this.over_n = undefined;
            this.over_e = undefined;
            this.over_s = undefined;
            this.over_w = undefined;
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
        var initter = undefined;
        var i = 0;
        while (true) {
            var line = lines[i];
            i++;
            if (line == undefined) {
                break;
            }
            if (line == '[GAME_INITIALIZE]') {
                if (initter != undefined) {
                    initter.save();
                }
                initter = gameInitter;
            }
            else if (line == '[PLAYER]') {
                if (initter != undefined) {
                    initter.save();
                }
                initter = new PlayerInitter(gameInitter);
            }
            else if (line == '[FIELD]') {
                if (initter != undefined) {
                    initter.save();
                }
                initter = new GameFieldGamenInitter(gameInitter);
            }
            if (initter != undefined) {
                initter.analize(line);
            }
        }
        if (initter != undefined) {
            initter.save();
        }
    }
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
        if (gameInitter.player == undefined || gameInitter.start_muki == undefined) {
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
    function keyboardMousedown(evt) {
        var key = Kyoutsu.getKeytop(evt.target);
        documentKeydown(key);
    }
    function keyboardMouseup(_evt) {
        documentKeyup(0);
    }
    var GameStatus = (function () {
        function GameStatus() {
            this.gameMode = undefined;
            this.player = new Character('');
            this.gameFieldGamen = new GameFieldGamen('null', [], '', undefined, undefined, undefined, undefined);
            this.frameCount = 0;
            this.lastInputCode = 0;
            this.koudouArray = [];
        }
        return GameStatus;
    }());
    var _gameStatus = new GameStatus();
    function frameCheck() {
        var gameStatus = _gameStatus;
        gameStatus.frameCount++;
        if (gameStatus.gameMode == undefined) {
            gameStatus.gameMode = new FreeGameMode(gameStatus);
        }
        if (_gameBoard.debug != undefined) {
            _gameBoard.debug.innerHTML =
                gameStatus.gameMode.name
                    + '<br>' + gameStatus.frameCount
                    + '<br>' + gameStatus.lastInputCode
                    + '<br>' + gameStatus.gameFieldGamen.name
                    + '<br>' + gameStatus.player.x + ',' + gameStatus.player.y
                    + '<br>' + gameStatus.player.ascii_x + ',' + gameStatus.player.ascii_y;
        }
        if (gameStatus.lastInputCode == Kyoutsu.INPUT_ESCAPE) {
            return;
        }
        gameStatus.gameMode.do();
        setTimeout(frameCheck, FRAME_TIMING);
    }
    function put(character, chr) {
        var x = character.ascii_x;
        var y = character.ascii_y;
        if (chr == undefined) {
            chr = character.chr;
        }
        chr = (chr + '..').substr(0, 2);
        var swp = _gameBoard.asciiPosition[y];
        swp = swp.substr(0, x) + chr + swp.substr(x + 2);
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
        if (_gameBoard.fieldAscii != undefined) {
            _gameBoard.fieldAscii.innerHTML = _gameBoard.current.maptext.join('<br>').replace(/ /g, '&nbsp;');
        }
        if (_gameBoard.objectAscii != undefined) {
            _gameBoard.objectAscii.innerHTML = _gameBoard.asciiPosition.join('<br>').replace(/ /g, '&nbsp;');
        }
    }
    var FreeGameMode = (function () {
        function FreeGameMode(gameStatus) {
            this.name = 'free';
            this.gameStatus = gameStatus;
        }
        FreeGameMode.prototype.do = function () {
            if (this.gameStatus.frameCount % 2 != 0) {
                return;
            }
            var koudou = this.gameStatus.koudouArray.shift();
            if (koudou != undefined) {
                if (koudou.type == 'idou') {
                    var muki = koudou.muki;
                    this.gameStatus.player.moveBy(muki.nextX * 4, muki.nextY * 4, muki);
                    if (this.gamenOver(this.gameStatus.player, muki)) {
                        var nextName = this.gameStatus.gameFieldGamen.over[muki.mukiType];
                        if (nextName != undefined) {
                            var nextGameFieldGamen = getGameFieldGamen(nextName);
                            this.gameStatus.gameMode = new ScrollGameMode(this.gameStatus, this.gameStatus.player.muki, nextGameFieldGamen);
                            return;
                        }
                    }
                }
                if (koudou.type == 'jump') {
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
                    put(character, '  ');
                    this.gameStatus.koudouArray.push({ type: 'idou', muki: muki });
                }
                else {
                    character.muki = muki;
                }
            }
        };
        FreeGameMode.prototype.gamenOver = function (character, muki) {
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
                this.scrollEndAdgust(this.gameStatus.player, this.muki);
                for (var i = 0; i < _gameBoard.current.maptext.length; i++) {
                    _gameBoard.current.maptext[i] = _gameBoard.next.maptext[i];
                }
                this.gameStatus.gameFieldGamen = this.nextGameFieldGamen;
                this.gameStatus.gameMode = new FreeGameMode(this.gameStatus);
            }
        };
        ScrollGameMode.prototype.scrollEndAdgust = function (character, muki) {
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
        };
        return ScrollGameMode;
    }());
})(Aao || (Aao = {}));
//# sourceMappingURL=Aao.js.map