var Dungeon;
(function (Dungeon) {
    var $kabex = [5, 40, 114, 155, 180];
    var $kabey = [5, 31, 85, 115, 134];
    var $SCREEN_WIDTH = 400;
    var $SCREEN_HEIGHT = 300;
    var $DRAW_WIDTH = $SCREEN_WIDTH - $kabex[0] - $kabex[0];
    var $DRAW_HEIGHT = $SCREEN_HEIGHT - $kabey[0] - $kabey[0];
    var Muki_N = (function () {
        function Muki_N() {
            this.index = 0;
            this.mukiType = 'n';
            this.mukiChr = '↑';
            this.bit = Kyoutsu.BIT_TOP;
            this.nextXY = { x: 0, y: -1 };
        }
        return Muki_N;
    }());
    var muki_n = new Muki_N();
    var Muki_E = (function () {
        function Muki_E() {
            this.index = 1;
            this.mukiType = 'e';
            this.mukiChr = '→';
            this.bit = Kyoutsu.BIT_RIGHT;
            this.nextXY = { x: 1, y: 0 };
        }
        return Muki_E;
    }());
    var muki_e = new Muki_E();
    var Muki_S = (function () {
        function Muki_S() {
            this.index = 2;
            this.mukiType = 's';
            this.mukiChr = '↓';
            this.bit = Kyoutsu.BIT_BOTTOM;
            this.nextXY = { x: 0, y: 1 };
        }
        return Muki_S;
    }());
    var muki_s = new Muki_S();
    var Muki_W = (function () {
        function Muki_W() {
            this.index = 3;
            this.mukiType = 'w';
            this.mukiChr = '←';
            this.bit = Kyoutsu.BIT_LEFT;
            this.nextXY = { x: -1, y: 0 };
        }
        return Muki_W;
    }());
    var muki_w = new Muki_W();
    var mukiArray = [muki_n, muki_e, muki_s, muki_w];
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
    function mukiRotation(muki, chokkakuCount) {
        var index = muki.index + chokkakuCount;
        if (index < 0) {
            index += 4;
        }
        else if (4 <= index) {
            index -= 4;
        }
        return mukiArray[index];
    }
    var Character = (function () {
        function Character() {
            this.muki = new Muki_N();
        }
        return Character;
    }());
    var GameInitter = (function () {
        function GameInitter() {
            this.start_floor = 'no define';
            this.start_x = 0;
            this.start_y = 0;
            this.start_muki = muki_e;
            this.reg = /^([_0-9a-zA-Z]*): ?(.*)\s*/;
        }
        GameInitter.prototype.analize = function (line) {
            var defineData = line.match(this.reg);
            if (defineData != null) {
                var attr = defineData[1];
                var value = defineData[2];
                if (attr == 'start_floor') {
                    this.start_floor = value;
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
    var FloorInitter = (function () {
        function FloorInitter() {
            this.name = 'no define';
            this.maptext = new Array();
            this.reg = /^([_0-9a-zA-Z]*): ?(.*)\s*/;
            this.maptextMode = false;
        }
        FloorInitter.prototype.analize = function (line) {
            if (this.maptextMode) {
                if (line == ':mapend') {
                    this.maptextMode = false;
                }
                else {
                    this.maptext.push(line);
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
                    else if (attr == 'maptext') {
                        this.maptextMode = true;
                    }
                }
            }
        };
        FloorInitter.prototype.save = function () {
            var floor = { name: this.name, maptext: this.maptext };
            _floorList.push(floor);
        };
        return FloorInitter;
    }());
    var _gameStatus = {
        gameInitter: new GameInitter(),
        player: new Character(),
        mapdata: new Array()
    };
    var _floorList = new Array();
    function getFloor(name) {
        for (var i = 0, len = _floorList.length; i < len; i++) {
            var item = _floorList[i];
            if (item.name == name) {
                return item;
            }
        }
        throw name + ' is not found';
    }
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
            if (line == '[GAME_INITIALIZE]') {
                if (initter != null) {
                    initter.save();
                }
                initter = _gameStatus.gameInitter;
            }
            else if (line == '[FLOOR]') {
                if (initter != null) {
                    initter.save();
                }
                initter = new FloorInitter();
            }
            if (initter != null) {
                initter.analize(line);
            }
        }
        if (initter != null) {
            initter.save();
        }
    }
    function init() {
        loadData();
        var floor = getFloor(_gameStatus.gameInitter.start_floor);
        _gameStatus.mapdata = floor.maptext;
        document.addEventListener('keydown', keyDownEvent);
        var div_map = Kyoutsu.getElementById('div_map');
        mapview(div_map, _gameStatus.mapdata, '');
        _gameStatus.player.xpos = _gameStatus.gameInitter.start_x;
        _gameStatus.player.ypos = _gameStatus.gameInitter.start_y;
        _gameStatus.player.muki = _gameStatus.gameInitter.start_muki;
        var nakami = Kyoutsu.getElementById('nakami[' + _gameStatus.player.xpos + '][' + _gameStatus.player.ypos + ']');
        nakami.innerHTML = _gameStatus.gameInitter.start_muki.mukiChr;
        submapview();
        var keyboard = new Kyoutsu.Keyboard();
        keyboard.keyboard.style.top = '320px';
        document.body.appendChild(keyboard.keyboard);
        keyboard.setKeyEvent('click', keyboardClick);
        keyboard.setKeyEvent('touch', function (e) { keyboardClick(e); e.preventDefault(); });
        keyboard.setKeytops([' ', 'w', ' ', 'a', ' ', 'd', ' ', ' ', ' ']);
    }
    Dungeon.init = init;
    function keyboardClick(e) {
        var key = Kyoutsu.getKeytop(e.target);
        keyOperation(key);
    }
    function keyDownEvent(e) {
        keyOperation(e.key);
    }
    function keyOperation(key) {
        var inputCode = Kyoutsu.getInputCode(key);
        if (inputCode == Kyoutsu.INPUT_UP) {
            var kabeChar = _gameStatus.mapdata[_gameStatus.player.ypos].charAt(_gameStatus.player.xpos);
            var kabeType = parseInt(kabeChar, 16);
            var xdiff = 0;
            var ydiff = 0;
            var muki = _gameStatus.player.muki;
            xdiff = (kabeType & muki.bit) == 0 ? muki.nextXY.x : 0;
            ydiff = (kabeType & muki.bit) == 0 ? muki.nextXY.y : 0;
            if (xdiff != 0 || ydiff != 0) {
                var nakami = void 0;
                nakami = Kyoutsu.getElementById('nakami[' + _gameStatus.player.xpos + '][' + _gameStatus.player.ypos + ']');
                nakami.innerHTML = '';
                _gameStatus.player.xpos += xdiff;
                _gameStatus.player.ypos += ydiff;
                nakami = Kyoutsu.getElementById('nakami[' + _gameStatus.player.xpos + '][' + _gameStatus.player.ypos + ']');
                nakami.innerHTML = _gameStatus.player.muki.mukiChr;
                submapview();
            }
        }
        else if (inputCode == Kyoutsu.INPUT_LEFT) {
            _gameStatus.player.muki = mukiRotation(_gameStatus.player.muki, -1);
            var nakami = Kyoutsu.getElementById('nakami[' + _gameStatus.player.xpos + '][' + _gameStatus.player.ypos + ']');
            nakami.innerHTML = _gameStatus.player.muki.mukiChr;
            submapview();
        }
        else if (inputCode == Kyoutsu.INPUT_RIGHT) {
            _gameStatus.player.muki = mukiRotation(_gameStatus.player.muki, +1);
            var nakami = Kyoutsu.getElementById('nakami[' + _gameStatus.player.xpos + '][' + _gameStatus.player.ypos + ']');
            nakami.innerHTML = _gameStatus.player.muki.mukiChr;
            submapview();
        }
    }
    function submapview() {
        var zenpou = 3;
        var hidarimigi = 1;
        var submapdata = map_kiritori(_gameStatus.mapdata, zenpou, hidarimigi);
        draw3D(submapdata, zenpou, hidarimigi);
        var div_submap = Kyoutsu.getElementById('div_submap');
        mapview(div_submap, submapdata, 'sub');
        var html = div_submap.innerHTML;
        html = html + submapdata[0] + '<br>' + submapdata[1] + '<br>' + submapdata[2] + '<br>' + submapdata[3] + '<br>';
        div_submap.innerHTML = html;
    }
    function map_kiritori(mapdata, zenpou, hidarimigi) {
        var kiritorimapdata = new Array();
        var x = 0;
        var y = 0;
        if (_gameStatus.player.muki.bit == Kyoutsu.BIT_TOP) {
            for (y = zenpou * -1; y <= 0; y++) {
                var line = '';
                for (x = hidarimigi * -1; x <= hidarimigi; x++) {
                    var c = getPosChar(mapdata, _gameStatus.player.xpos + x, _gameStatus.player.ypos + y);
                    c = charkaiten(c, _gameStatus.player.muki);
                    line += c;
                }
                kiritorimapdata.push(line);
            }
        }
        else if (_gameStatus.player.muki.bit == Kyoutsu.BIT_RIGHT) {
            for (x = zenpou; 0 <= x; x--) {
                var line = '';
                for (y = hidarimigi * -1; y <= hidarimigi; y++) {
                    var c = getPosChar(mapdata, _gameStatus.player.xpos + x, _gameStatus.player.ypos + y);
                    c = charkaiten(c, _gameStatus.player.muki);
                    line += c;
                }
                kiritorimapdata.push(line);
            }
        }
        else if (_gameStatus.player.muki.bit == Kyoutsu.BIT_BOTTOM) {
            for (y = zenpou; 0 <= y; y--) {
                var line = '';
                for (x = hidarimigi; hidarimigi * -1 <= x; x--) {
                    var c = getPosChar(mapdata, _gameStatus.player.xpos + x, _gameStatus.player.ypos + y);
                    c = charkaiten(c, _gameStatus.player.muki);
                    line += c;
                }
                kiritorimapdata.push(line);
            }
        }
        else if (_gameStatus.player.muki.bit == Kyoutsu.BIT_LEFT) {
            for (x = zenpou * -1; x <= 0; x++) {
                var line = '';
                for (y = hidarimigi; hidarimigi * -1 <= y; y--) {
                    var c = getPosChar(mapdata, _gameStatus.player.xpos + x, _gameStatus.player.ypos + y);
                    c = charkaiten(c, _gameStatus.player.muki);
                    line += c;
                }
                kiritorimapdata.push(line);
            }
        }
        return kiritorimapdata;
    }
    function getPosChar(mapdata, x, y) {
        var c;
        if (y < 0 || mapdata.length <= y) {
            c = '0';
        }
        else {
            if (x < 0 || mapdata[y].length <= x) {
                c = '0';
            }
            else {
                c = mapdata[y].charAt(x);
            }
        }
        return c;
    }
    function charkaiten(c, muki) {
        var n = parseInt(c, 16);
        for (var i = 0; i < (4 - muki.index) % 4; i++) {
            n = n * 2;
            if (16 <= n) {
                n = n - 16;
                n = n + 1;
            }
        }
        c = n.toString(16).toUpperCase();
        return c;
    }
    function draw3D(mapdata, zenpou, hidarimigi) {
        var cvs = Kyoutsu.getElementById('map3d');
        ;
        var context = cvs.getContext('2d');
        if (context == null) {
            return;
        }
        context.beginPath();
        context.clearRect(0, 0, $SCREEN_WIDTH, $SCREEN_HEIGHT);
        var kabe = -1;
        for (var i = 0; i <= zenpou; i++) {
            var c = mapdata[zenpou - i].charAt(hidarimigi);
            var n = parseInt(c, 16);
            var hidarikabeflg = 0;
            var migikabeflg = 0;
            if ((n & Kyoutsu.BIT_TOP) == Kyoutsu.BIT_TOP) {
                if (kabe == -1 || i < kabe) {
                    kabemaekaku(context, i + 1);
                    kabe = i;
                }
            }
            if ((n & Kyoutsu.BIT_LEFT) == Kyoutsu.BIT_LEFT) {
                if (kabe == -1 || i <= kabe) {
                    kabetatekaku(context, i + 1, Kyoutsu.BIT_LEFT);
                    hidarikabeflg = 1;
                }
            }
            if ((n & Kyoutsu.BIT_RIGHT) == Kyoutsu.BIT_RIGHT) {
                if (kabe == -1 || i <= kabe) {
                    kabetatekaku(context, i + 1, Kyoutsu.BIT_RIGHT);
                    migikabeflg = 1;
                }
            }
            c = mapdata[zenpou - i].charAt(hidarimigi - 1);
            n = parseInt(c, 16);
            if ((n & Kyoutsu.BIT_TOP) == Kyoutsu.BIT_TOP) {
                if (kabe == -1 || i <= kabe) {
                    if (hidarikabeflg != 1) {
                        kabeyokokaku(context, i + 1, Kyoutsu.BIT_LEFT);
                    }
                }
            }
            c = mapdata[zenpou - i].charAt(hidarimigi + 1);
            n = parseInt(c, 16);
            if ((n & Kyoutsu.BIT_TOP) == Kyoutsu.BIT_TOP) {
                if (kabe == -1 || i <= kabe) {
                    if (migikabeflg != 1) {
                        kabeyokokaku(context, i + 1, Kyoutsu.BIT_RIGHT);
                    }
                }
            }
        }
    }
    function mapview(div_map, kakumapdata, header) {
        var ippen = 36;
        var futosa = 2;
        div_map.innerHTML = '';
        for (var y = 0, yl = kakumapdata.length; y < yl; y++) {
            for (var x = 0, xl = kakumapdata[y].length; x < xl; x++) {
                var c = kakumapdata[y].charAt(x);
                var kukaku = document.createElement('DIV');
                kukaku.className = 'kukaku';
                kukaku.style.width = (ippen + futosa * 2) + 'px';
                kukaku.style.height = (ippen + futosa * 2) + 'px';
                var map = document.createElement('DIV');
                map.id = 'map[' + x + '][' + y + ']';
                setStyle(map, c, ippen, futosa);
                var nakami = document.createElement('DIV');
                nakami.id = header + 'nakami[' + x + '][' + y + ']';
                nakami.className = 'nakami';
                nakami.style.width = ippen + 'px';
                nakami.style.height = ippen + 'px';
                map.appendChild(nakami);
                kukaku.appendChild(map);
                div_map.appendChild(kukaku);
            }
            var br = document.createElement('BR');
            div_map.appendChild(br);
        }
    }
    Dungeon.mapview = mapview;
    function setStyle(map, c, ippen, futosa) {
        var n = parseInt(c, 16);
        map.style.display = 'inline-block';
        map.style.margin = '0px';
        map.style.padding = '0px';
        map.style.width = ippen + 'px';
        map.style.height = ippen + 'px';
        map.style.verticalAlign = 'middle';
        map.style.textAlign = 'center';
        map.style.border = '0px solid black';
        map.style.backgroundColor = 'white';
        if ((n & Kyoutsu.BIT_TOP) == Kyoutsu.BIT_TOP) {
            map.style.borderTopWidth = futosa + 'px';
        }
        else {
            map.style.marginTop = futosa + 'px';
        }
        if ((n & Kyoutsu.BIT_RIGHT) == Kyoutsu.BIT_RIGHT) {
            map.style.borderRightWidth = futosa + 'px';
        }
        else {
            map.style.marginRight = futosa + 'px';
        }
        if ((n & Kyoutsu.BIT_BOTTOM) == Kyoutsu.BIT_BOTTOM) {
            map.style.borderBottomWidth = futosa + 'px';
        }
        else {
            map.style.marginBottom = futosa + 'px';
        }
        if ((n & Kyoutsu.BIT_LEFT) == Kyoutsu.BIT_LEFT) {
            map.style.borderLeftWidth = futosa + 'px';
        }
        else {
            map.style.marginLeft = futosa + 'px';
        }
    }
    Dungeon.setStyle = setStyle;
    function kabemaekaku(context, fukasa) {
        context.beginPath();
        context.moveTo($kabex[fukasa], $kabey[fukasa]);
        context.lineTo($DRAW_WIDTH - $kabex[fukasa], $kabey[fukasa]);
        context.lineTo($DRAW_WIDTH - $kabex[fukasa], $DRAW_HEIGHT - $kabey[fukasa]);
        context.lineTo($kabex[fukasa], $DRAW_HEIGHT - $kabey[fukasa]);
        context.closePath();
        context.stroke();
    }
    function kabetatekaku(context, fukasa, side) {
        var startx;
        var fugou;
        if (side == Kyoutsu.BIT_LEFT) {
            startx = 0;
            fugou = 1;
        }
        else if (side == Kyoutsu.BIT_RIGHT) {
            startx = $DRAW_WIDTH;
            fugou = -1;
        }
        else {
            return;
        }
        context.beginPath();
        context.moveTo(startx + fugou * $kabex[fukasa - 1], $kabey[fukasa - 1]);
        context.lineTo(startx + fugou * $kabex[fukasa], $kabey[fukasa]);
        context.lineTo(startx + fugou * $kabex[fukasa], $DRAW_HEIGHT - $kabey[fukasa]);
        context.lineTo(startx + fugou * $kabex[fukasa - 1], $DRAW_HEIGHT - $kabey[fukasa - 1]);
        context.closePath();
        context.stroke();
    }
    function kabeyokokaku(context, fukasa, side) {
        var startx;
        var fugou;
        if (side == Kyoutsu.BIT_LEFT) {
            startx = 0;
            fugou = 1;
        }
        else if (side == Kyoutsu.BIT_RIGHT) {
            startx = $DRAW_WIDTH;
            fugou = -1;
        }
        else {
            return;
        }
        context.beginPath();
        context.moveTo(startx + fugou * $kabex[fukasa - 1], $kabey[fukasa]);
        context.lineTo(startx + fugou * $kabex[fukasa], $kabey[fukasa]);
        context.lineTo(startx + fugou * $kabex[fukasa], $DRAW_HEIGHT - $kabey[fukasa]);
        context.lineTo(startx + fugou * $kabex[fukasa - 1], $DRAW_HEIGHT - $kabey[fukasa]);
        context.closePath();
        context.stroke();
    }
})(Dungeon || (Dungeon = {}));
//# sourceMappingURL=Dungeon.js.map