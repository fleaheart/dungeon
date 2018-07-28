var Dungeon;
(function (Dungeon) {
    var Pc = (function () {
        function Pc() {
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
    var $TOP = 0;
    var $RIGHT = 1;
    var $BOTTOM = 2;
    var $LEFT = 3;
    var $BIT_TOP = 1;
    var $BIT_RIGHT = 2;
    var $BIT_BOTTOM = 4;
    var $BIT_LEFT = 8;
    var $MUKI_CHARACTER = ['↑', '→', '↓', '←'];
    var $MUKI_CHARACTER_LENGTH = $MUKI_CHARACTER.length;
    var $KEY;
    (function ($KEY) {
        $KEY.W = 87;
        $KEY.A = 65;
        $KEY.D = 68;
    })($KEY || ($KEY = {}));
    function init() {
        document.addEventListener('touchstart', touchEvent);
        document.addEventListener('click', clickEvent);
        document.addEventListener('keydown', keyDownEvent);
        var div_map = Kyoutsu.getElementById('div_map');
        mapview(div_map, $mapdata);
        $pc.xpos = 0;
        $pc.ypos = 7;
        $pc.muki = 0;
        var nakami = Kyoutsu.getElementById('nakami[' + $pc.xpos + '][' + $pc.ypos + ']');
        nakami.innerHTML = '↑';
        submapview();
        var keyboard = new Kyoutsu.Keyboard();
        keyboard.keyBoard.style.top = '320px';
        document.body.appendChild(keyboard.keyBoard);
        keyboard.setKeyEvent('click', keyboardClick);
        keyboard.setKeytop([' ', 'w', ' ', 'a', 's', 'd', ' ', ' ', ' ']);
    }
    Dungeon.init = init;
    function keyboardClick(e) {
        var target = e.target;
        if (target == null) {
            return;
        }
        var element = target;
        while (true) {
            if (element == null) {
                break;
            }
            if (element.classList.contains('sofwareKey')) {
                break;
            }
            element = element.parentNode;
        }
        if (element == null) {
            return;
        }
        var key = element.textContent;
        if (key != null) {
            var keyCode = 0;
            if (key == 'w') {
                keyCode = $KEY.W;
            }
            else if (key == 'a') {
                keyCode = $KEY.A;
            }
            else if (key == 'd') {
                keyCode = $KEY.D;
            }
            keyOperation(keyCode);
        }
    }
    function touchEvent(evt) {
        var elm = evt.srcElement;
        if (elm == null) {
            return;
        }
        clickElement(elm);
        evt.preventDefault();
    }
    function clickEvent(evt) {
        var elm = evt.srcElement;
        if (elm == null) {
            return;
        }
        clickElement(elm);
    }
    function clickElement(elm) {
        var keyCode = 0;
        if (elm.id == 'ctrl_W') {
            keyCode = $KEY.W;
        }
        else if (elm.id == 'ctrl_A') {
            keyCode = $KEY.A;
        }
        else if (elm.id == 'ctrl_D') {
            keyCode = $KEY.D;
        }
        if (0 < keyCode) {
            keyOperation(keyCode);
        }
    }
    function keyDownEvent(evt) {
        var keyCode = evt.keyCode;
        keyOperation(keyCode);
    }
    function keyOperation(keyCode) {
        if (keyCode == $KEY.W) {
            var kabeChar = $mapdata[$pc.ypos].charAt($pc.xpos);
            var kabeType = parseInt(kabeChar, 16);
            var xdiff = 0;
            var ydiff = 0;
            if ($pc.muki == $TOP) {
                if ((kabeType & $BIT_TOP) == 0) {
                    ydiff = -1;
                }
            }
            else if ($pc.muki == $RIGHT) {
                if ((kabeType & $BIT_RIGHT) == 0) {
                    xdiff = +1;
                }
            }
            else if ($pc.muki == $BOTTOM) {
                if ((kabeType & $BIT_BOTTOM) == 0) {
                    ydiff = +1;
                }
            }
            else if ($pc.muki == $LEFT) {
                if ((kabeType & $BIT_LEFT) == 0) {
                    xdiff = -1;
                }
            }
            if (xdiff != 0 || ydiff != 0) {
                var nakami = void 0;
                nakami = Kyoutsu.getElementById('nakami[' + $pc.xpos + '][' + $pc.ypos + ']');
                nakami.innerHTML = '';
                $pc.xpos += xdiff;
                $pc.ypos += ydiff;
                nakami = Kyoutsu.getElementById('nakami[' + $pc.xpos + '][' + $pc.ypos + ']');
                nakami.innerHTML = $MUKI_CHARACTER[$pc.muki];
                submapview();
            }
        }
        else if (keyCode == $KEY.A) {
            $pc.muki--;
            if ($pc.muki < 0) {
                $pc.muki = $MUKI_CHARACTER_LENGTH - 1;
            }
            var nakami = Kyoutsu.getElementById('nakami[' + $pc.xpos + '][' + $pc.ypos + ']');
            nakami.innerHTML = $MUKI_CHARACTER[$pc.muki];
            submapview();
        }
        else if (keyCode == $KEY.D) {
            $pc.muki++;
            if ($MUKI_CHARACTER_LENGTH - 1 < $pc.muki) {
                $pc.muki = 0;
            }
            var nakami = Kyoutsu.getElementById('nakami[' + $pc.xpos + '][' + $pc.ypos + ']');
            nakami.innerHTML = $MUKI_CHARACTER[$pc.muki];
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
        if ($pc.muki == $TOP) {
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
        else if ($pc.muki == $RIGHT) {
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
        else if ($pc.muki == $BOTTOM) {
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
        else if ($pc.muki == $LEFT) {
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
        for (var i = 0; i < (4 - muki) % 4; i++) {
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
            if ((n & $BIT_TOP) == $BIT_TOP) {
                if (kabe == -1 || i < kabe) {
                    kabemaekaku(context, i + 1);
                    kabe = i;
                }
            }
            if ((n & $BIT_LEFT) == $BIT_LEFT) {
                if (kabe == -1 || i <= kabe) {
                    kabetatekaku(context, i + 1, $LEFT);
                    hidarikabeflg = 1;
                }
            }
            if ((n & $BIT_RIGHT) == $BIT_RIGHT) {
                if (kabe == -1 || i <= kabe) {
                    kabetatekaku(context, i + 1, $RIGHT);
                    migikabeflg = 1;
                }
            }
            c = mapdata[zenpou - i].charAt(hidarimigi - 1);
            n = parseInt(c, 16);
            if ((n & $BIT_TOP) == $BIT_TOP) {
                if (kabe == -1 || i <= kabe) {
                    if (hidarikabeflg != 1) {
                        kabeyokokaku(context, i + 1, $LEFT);
                    }
                }
            }
            c = mapdata[zenpou - i].charAt(hidarimigi + 1);
            n = parseInt(c, 16);
            if ((n & $BIT_TOP) == $BIT_TOP) {
                if (kabe == -1 || i <= kabe) {
                    if (migikabeflg != 1) {
                        kabeyokokaku(context, i + 1, $RIGHT);
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
        if ((n & $BIT_TOP) == $BIT_TOP) {
            map.style.borderTopWidth = futosa + 'px';
        }
        else {
            map.style.marginTop = futosa + 'px';
        }
        if ((n & $BIT_RIGHT) == $BIT_RIGHT) {
            map.style.borderRightWidth = futosa + 'px';
        }
        else {
            map.style.marginRight = futosa + 'px';
        }
        if ((n & $BIT_BOTTOM) == $BIT_BOTTOM) {
            map.style.borderBottomWidth = futosa + 'px';
        }
        else {
            map.style.marginBottom = futosa + 'px';
        }
        if ((n & $BIT_LEFT) == $BIT_LEFT) {
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
        if (side == $LEFT) {
            startx = 0;
            fugou = 1;
        }
        else if (side == $RIGHT) {
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
        if (side == $LEFT) {
            startx = 0;
            fugou = 1;
        }
        else if (side == $RIGHT) {
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