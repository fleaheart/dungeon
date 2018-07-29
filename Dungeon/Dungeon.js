var Dungeon;
(function (Dungeon) {
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
    var Pc = (function () {
        function Pc() {
            this.muki = new Muki_N();
        }
        return Pc;
    }());
    var $pc = new Pc();
    var $mapdata = ['95555513',
        'A95553AA',
        'AAD53AAA',
        'AC556AAA',
        'C5515406',
        '93FAD3AB',
        'AAD452AA',
        'EC5556C6'];
    var $kabex = [5, 40, 114, 155, 180];
    var $kabey = [5, 31, 85, 115, 134];
    var $SCREEN_WIDTH = 400;
    var $SCREEN_HEIGHT = 300;
    var $DRAW_WIDTH = $SCREEN_WIDTH - $kabex[0] - $kabex[0];
    var $DRAW_HEIGHT = $SCREEN_HEIGHT - $kabey[0] - $kabey[0];
    function init() {
        document.addEventListener('keydown', keyDownEvent);
        var div_map = Kyoutsu.getElementById('div_map');
        mapview(div_map, $mapdata);
        $pc.xpos = 0;
        $pc.ypos = 7;
        $pc.muki = muki_n;
        var nakami = Kyoutsu.getElementById('nakami[' + $pc.xpos + '][' + $pc.ypos + ']');
        nakami.innerHTML = '↑';
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
            var kabeChar = $mapdata[$pc.ypos].charAt($pc.xpos);
            var kabeType = parseInt(kabeChar, 16);
            var xdiff = 0;
            var ydiff = 0;
            var muki = $pc.muki;
            xdiff = (kabeType & muki.bit) == 0 ? muki.nextXY.x : 0;
            ydiff = (kabeType & muki.bit) == 0 ? muki.nextXY.y : 0;
            if (xdiff != 0 || ydiff != 0) {
                var nakami = void 0;
                nakami = Kyoutsu.getElementById('nakami[' + $pc.xpos + '][' + $pc.ypos + ']');
                nakami.innerHTML = '';
                $pc.xpos += xdiff;
                $pc.ypos += ydiff;
                nakami = Kyoutsu.getElementById('nakami[' + $pc.xpos + '][' + $pc.ypos + ']');
                nakami.innerHTML = $pc.muki.mukiChr;
                submapview();
            }
        }
        else if (inputCode == Kyoutsu.INPUT_LEFT) {
            $pc.muki = mukiRotation($pc.muki, -1);
            var nakami = Kyoutsu.getElementById('nakami[' + $pc.xpos + '][' + $pc.ypos + ']');
            nakami.innerHTML = $pc.muki.mukiChr;
            submapview();
        }
        else if (inputCode == Kyoutsu.INPUT_RIGHT) {
            $pc.muki = mukiRotation($pc.muki, +1);
            var nakami = Kyoutsu.getElementById('nakami[' + $pc.xpos + '][' + $pc.ypos + ']');
            nakami.innerHTML = $pc.muki.mukiChr;
            submapview();
        }
    }
    function submapview() {
        var zenpou = 3;
        var hidarimigi = 1;
        var submapdata = map_kiritori($mapdata, zenpou, hidarimigi);
        draw3D(submapdata, zenpou, hidarimigi);
        var div_submap = Kyoutsu.getElementById('div_submap');
        mapview(div_submap, submapdata);
        var html = div_submap.innerHTML;
        html = html + submapdata[0] + '<br>' + submapdata[1] + '<br>' + submapdata[2] + '<br>' + submapdata[3] + '<br>';
        div_submap.innerHTML = html;
    }
    function map_kiritori(mapdata, zenpou, hidarimigi) {
        var kiritorimapdata = new Array();
        var x = 0;
        var y = 0;
        if ($pc.muki.bit == Kyoutsu.BIT_TOP) {
            for (y = zenpou * -1; y <= 0; y++) {
                var line = '';
                for (x = hidarimigi * -1; x <= hidarimigi; x++) {
                    var c = getPosChar(mapdata, $pc.xpos + x, $pc.ypos + y);
                    c = charkaiten(c, $pc.muki);
                    line += c;
                }
                kiritorimapdata.push(line);
            }
        }
        else if ($pc.muki.bit == Kyoutsu.BIT_RIGHT) {
            for (x = zenpou; 0 <= x; x--) {
                var line = '';
                for (y = hidarimigi * -1; y <= hidarimigi; y++) {
                    var c = getPosChar(mapdata, $pc.xpos + x, $pc.ypos + y);
                    c = charkaiten(c, $pc.muki);
                    line += c;
                }
                kiritorimapdata.push(line);
            }
        }
        else if ($pc.muki.bit == Kyoutsu.BIT_BOTTOM) {
            for (y = zenpou; 0 <= y; y--) {
                var line = '';
                for (x = hidarimigi; hidarimigi * -1 <= x; x--) {
                    var c = getPosChar(mapdata, $pc.xpos + x, $pc.ypos + y);
                    c = charkaiten(c, $pc.muki);
                    line += c;
                }
                kiritorimapdata.push(line);
            }
        }
        else if ($pc.muki.bit == Kyoutsu.BIT_LEFT) {
            for (x = zenpou * -1; x <= 0; x++) {
                var line = '';
                for (y = hidarimigi; hidarimigi * -1 <= y; y--) {
                    var c = getPosChar(mapdata, $pc.xpos + x, $pc.ypos + y);
                    c = charkaiten(c, $pc.muki);
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
    function mapview(div_map, kakumapdata) {
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
                nakami.id = 'nakami[' + x + '][' + y + ']';
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