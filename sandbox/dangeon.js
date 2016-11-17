/*
* 俺ルール：グローバル変数には先頭に$をつける
*/
var $pc, $mapdata,
    $kabex, $kabey, $kabe2x, $kabe2y,
    $SCREEN_WIDTH, $SCREEN_HEIGHT, $DRAW_WIDTH, $DRAW_HEIGHT,
    $TOP, $RIGHT, $BOTTOM, $LEFT,
    $BIT_TOP, $BIT_RIGHT, $BIT_BOTTOM, $BIT_LEFT,
    $MUKI,
    $KEY;

$pc = new Object();

$mapdata = ['95555513',
    'A95553AA',
    'AAD53AAA',
    'AC556AAA',
    'C5515406',
    '93FAD3AB',
    'AAD452AA',
    'EC5556C6'];

$kabex = [ 5, 40, 114, 155, 180 ];
$kabey = [ 5, 31, 85, 115, 134 ];

$kabe2x = [ 5, 20, 114, 160, 180 ];
$kabe2y = [ 5, 16, 85, 120, 140 ];

$SCREEN_WIDTH = 400;
$SCREEN_HEIGHT = 300;

$DRAW_WIDTH = $SCREEN_WIDTH - $kabex[0] - $kabex[0];
$DRAW_HEIGHT = $SCREEN_HEIGHT - $kabey[0] - $kabey[0];

$TOP = 0;
$RIGHT = 1;
$BOTTOM = 2;
$LEFT = 3;
$BIT_TOP = 1;
$BIT_RIGHT = 2;
$BIT_BOTTOM = 4;
$BIT_LEFT = 8;

$MUKI = new Object();
$MUKI.CHARACTER = ['↑','→','↓','←'];
$MUKI.CHARACTER_LENGTH = $MUKI.CHARACTER.length;

$KEY = {
    W: '87', A:'65', D:'68'
};

/**
 * 最初に実行されるもの
 */
window.addEventListener('load', function() {
    var div_map;

    document.addEventListener('keydown', keyDownEvent);

    div_map = document.getElementById('div_map');

    mapview(div_map, $mapdata);

    $pc.xpos = 0;
    $pc.ypos = 7;
    $pc.muki = 0;

    document.getElementById('nakami[' + $pc.xpos + '][' + $pc.ypos + ']').innerHTML = '↑';

    submapview();
});

function keyDownEvent(evt) {
    var keyCode, map, kabeChar, kabeType, xdiff, ydiff;

    keyCode = evt.keyCode;
    
    if (keyCode == $KEY.W) {
        map = document.getElementById('map[' + $pc.xpos + '][' + $pc.ypos + ']');
        kabeChar = map.className.replace(/box/, '');
        kabeType = parseInt(kabeChar, 16);

        xdiff = 0;
        ydiff = 0;
        if ($pc.muki == $TOP) {
            if ((kabeType & $BIT_TOP) == 0) {
                ydiff = -1;
            }
        } else if ($pc.muki == $RIGHT) {
            if ((kabeType & $BIT_RIGHT) == 0) {
                xdiff = +1;
            }
        } else if ($pc.muki == $BOTTOM) {
            if ((kabeType & $BIT_BOTTOM) == 0) {
                ydiff = +1;
            }
        } else if ($pc.muki == $LEFT) {
            if ((kabeType & $BIT_LEFT) == 0) {
                xdiff = -1;
            }
        }

        if (xdiff != 0 || ydiff != 0) {
            document.getElementById('nakami[' + $pc.xpos + '][' + $pc.ypos + ']').innerHTML = '';
            $pc.xpos += xdiff;
            $pc.ypos += ydiff;
            document.getElementById('nakami[' + $pc.xpos + '][' + $pc.ypos + ']').innerHTML = $MUKI.CHARACTER[$pc.muki];

            submapview();
        }

    } else if (keyCode == $KEY.A) {
        $pc.muki--;
        if ($pc.muki < 0) {
            $pc.muki = $MUKI.CHARACTER_LENGTH - 1;
        }
        document.getElementById('nakami[' + $pc.xpos + '][' + $pc.ypos + ']').innerHTML = $MUKI.CHARACTER[$pc.muki];

        submapview();

    } else if (keyCode == $KEY.D) {
        $pc.muki++;
        if ($MUKI.CHARACTER_LENGTH - 1 < $pc.muki) {
            $pc.muki = 0;
        }
        document.getElementById('nakami[' + $pc.xpos + '][' + $pc.ypos + ']').innerHTML = $MUKI.CHARACTER[$pc.muki];

        submapview();
    }

}

function submapview() {
    var div_submap, submapdata, html,
    zenpou = 3, hidarimigi = 1;

    div_submap = document.getElementById('div_submap');
    div_submap.innerHTML = '';

    submapdata = map_kiritori($mapdata, zenpou, hidarimigi);

    mapview(div_submap, submapdata);

    // デバッグ情報の表示
    html = div_submap.innerHTML;
    html = html + submapdata[0] + '<br>' + submapdata[1] + '<br>' + submapdata[2] + '<br>' + submapdata[3] + '<br>';
    div_submap.innerHTML = html;

    draw3D(submapdata, zenpou, hidarimigi);
}

function map_kiritori(mapdata, zenpou, hidarimigi) {
    var kiritorimapdata, x, y, line, c;

    kiritorimapdata = new Array();
    if ($pc.muki == $TOP) {
        for (y = zenpou * -1; y <= 0; y++) {
            line = '';
            for (x = hidarimigi * -1; x <= hidarimigi; x++) {
                c = getPosChar(mapdata, $pc.xpos + x, $pc.ypos + y);
                c = charkaiten(c, $pc.muki);
                line += c;
            }
            kiritorimapdata.push(line);
        }

    } else if ($pc.muki == $RIGHT) {
        for (x = zenpou; 0 <= x; x--) {
            line = '';
            for (y = hidarimigi * -1; y <= hidarimigi; y++) {
                c = getPosChar(mapdata, $pc.xpos + x, $pc.ypos + y);
                c = charkaiten(c, $pc.muki);
                line += c;
            }
            kiritorimapdata.push(line);
        }

    } else if ($pc.muki == $BOTTOM) {
        for (y = zenpou; 0 <= y; y--) {
            line = '';
            for (x = hidarimigi; hidarimigi * -1 <= x; x--) {
                c = getPosChar(mapdata, $pc.xpos + x, $pc.ypos + y);
                c = charkaiten(c, $pc.muki);
                line += c;
            }
            kiritorimapdata.push(line);
        }

    } else if ($pc.muki == $LEFT) {
        for (x = zenpou * -1; x <= 0; x++) {
            line = '';
            for (y = hidarimigi; hidarimigi * -1 <= y; y--) {
                c = getPosChar(mapdata, $pc.xpos + x, $pc.ypos + y);
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
    } else {
        if (x < 0 || mapdata[y].length <= x) {
            c = '0';
        } else {
            c = mapdata[y].charAt(x);
        }
    }
    return c;
}

function charkaiten(c, muki) {
    var n, i;
    n = parseInt(c, 16);
    for (i = 0; i < (4 - muki) % 4; i++) {
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
    var cvs, context, i, kabe, c, n;

    cvs = document.getElementById('map3d');
    context = cvs.getContext('2d');

    context.beginPath();
    context.clearRect(0, 0, $SCREEN_WIDTH, $SCREEN_HEIGHT);

    kabe = -1;

    for (var i = 0; i <= zenpou; i++) {
        c = mapdata[zenpou - i].charAt(hidarimigi);
        n = parseInt(c, 16);

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

        var c = mapdata[zenpou - i].charAt(hidarimigi + 1);
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
    var x, xl, y, yl, c, kukaku, map, nakami, br;

    for (y = 0, yl = kakumapdata.length; y < yl; y++) {
        for (x = 0, xl = kakumapdata[y].length; x < xl; x++) {
            c = kakumapdata[y].charAt(x);

            kukaku = document.createElement('DIV');
            kukaku.className = 'kukaku';

            map = document.createElement('DIV');
            map.id = 'map[' + x + '][' + y + ']';
            map.className = 'box' + c;

            nakami = document.createElement('DIV');
            nakami.id = 'nakami[' + x + '][' + y + ']';
            nakami.className = 'nakami';

            map.appendChild(nakami);
            kukaku.appendChild(map);
            div_map.appendChild(kukaku);
        }

        br = document.createElement('BR');
        div_map.appendChild(br);
    }
}

function kabemaekaku(context, fukasa) {
    var startx, fugou;

    context.beginPath();

    context.moveTo($kabex[fukasa], $kabey[fukasa]);
    context.lineTo($DRAW_WIDTH - $kabex[fukasa], $kabey[fukasa]);
    context.lineTo($DRAW_WIDTH - $kabex[fukasa], $DRAW_HEIGHT - $kabey[fukasa]);
    context.lineTo($kabex[fukasa], $DRAW_HEIGHT - $kabey[fukasa]);

    context.closePath();
    context.stroke();
}

function kabetatekaku(context, fukasa, side) {
    var startx, fugou;

    if (side == $LEFT) {
        startx = 0;
        fugou = 1;
    }
    if (side == $RIGHT) {
        startx = $DRAW_WIDTH;
        fugou = -1;
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
    var startx, fugou;

    if (side == $LEFT) {
        startx = 0;
        fugou = 1;
    }
    if (side == $RIGHT) {
        startx = $DRAW_WIDTH;
        fugou = -1;
    }

    context.beginPath();

    context.moveTo(startx + fugou * $kabex[fukasa - 1], $kabey[fukasa]);  
    context.lineTo(startx + fugou * $kabex[fukasa], $kabey[fukasa]);  
    context.lineTo(startx + fugou * $kabex[fukasa], $DRAW_HEIGHT - $kabey[fukasa]);  
    context.lineTo(startx + fugou * $kabex[fukasa - 1], $DRAW_HEIGHT - $kabey[fukasa]);  

    context.closePath();
    context.stroke();
}
