/*
* 俺ルール：グローバル変数には先頭に$をつける
*/
class Pc {
    xpos: number;
    ypos: number;
    muki: number;
}

let $pc: Pc = new Pc();

let $mapdata: string[] = ['95555513',
    'A95553AA',
    'AAD53AAA',
    'AC556AAA',
    'C5515406',
    '93FAD3AB',
    'AAD452AA',
    'EC5556C6'];

let $kabex: number[] = [5, 40, 114, 155, 180];
let $kabey: number[] = [5, 31, 85, 115, 134];

let $kabe2x: number[] = [5, 20, 114, 160, 180];
let $kabe2y: number[] = [5, 16, 85, 120, 140];

let $SCREEN_WIDTH: number = 400;
let $SCREEN_HEIGHT: number = 300;

let $DRAW_WIDTH: number = $SCREEN_WIDTH - $kabex[0] - $kabex[0];
let $DRAW_HEIGHT: number = $SCREEN_HEIGHT - $kabey[0] - $kabey[0];

const $TOP: number = 0;
const $RIGHT: number = 1;
const $BOTTOM: number = 2;
const $LEFT: number = 3;
const $BIT_TOP: number = 1;
const $BIT_RIGHT: number = 2;
const $BIT_BOTTOM: number = 4;
const $BIT_LEFT: number = 8;

let $MUKI_CHARACTER: string[] = ['↑', '→', '↓', '←'];
let $MUKI_CHARACTER_LENGTH: number = $MUKI_CHARACTER.length;

namespace $KEY {
    export const W: number = 87;
    export const A: number = 65;
    export const D: number = 68;
}

/**
 * 最初に実行されるもの
 */
window.addEventListener('load', (): void => {

    document.addEventListener('keydown', keyDownEvent);

    let div_map: HTMLElement | null = document.getElementById('div_map');
    if (div_map != null) {
        mapview(div_map, $mapdata);
    }

    $pc.xpos = 0;
    $pc.ypos = 7;
    $pc.muki = 0;

    let nakami: HTMLElement | null = document.getElementById('nakami[' + $pc.xpos + '][' + $pc.ypos + ']');
    if (nakami != null) {
        nakami.innerHTML = '↑';
    }

    submapview();
});

function keyDownEvent(evt: KeyboardEvent): void {
    let keyCode: number = evt.keyCode;
    if (keyCode == $KEY.W) {
        let kabeChar: string = $mapdata[$pc.ypos].charAt($pc.xpos);
        let kabeType: number = parseInt(kabeChar, 16);

        let xdiff: number = 0;
        let ydiff: number = 0;
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
            let nakami: HTMLElement | null = null;
            nakami = document.getElementById('nakami[' + $pc.xpos + '][' + $pc.ypos + ']');
            if (nakami != null) {
                nakami.innerHTML = '';
            }
            $pc.xpos += xdiff;
            $pc.ypos += ydiff;
            nakami = document.getElementById('nakami[' + $pc.xpos + '][' + $pc.ypos + ']');
            if (nakami != null) {
                nakami.innerHTML = $MUKI_CHARACTER[$pc.muki];
            }

            submapview();
        }

    } else if (keyCode == $KEY.A) {
        $pc.muki--;
        if ($pc.muki < 0) {
            $pc.muki = $MUKI_CHARACTER_LENGTH - 1;
        }
        let nakami: HTMLElement | null = null;
        nakami = document.getElementById('nakami[' + $pc.xpos + '][' + $pc.ypos + ']');
        if (nakami != null) {
            nakami.innerHTML = $MUKI_CHARACTER[$pc.muki];
        }

        submapview();

    } else if (keyCode == $KEY.D) {
        $pc.muki++;
        if ($MUKI_CHARACTER_LENGTH - 1 < $pc.muki) {
            $pc.muki = 0;
        }
        let nakami: HTMLElement | null = null;
        nakami = document.getElementById('nakami[' + $pc.xpos + '][' + $pc.ypos + ']');
        if (nakami != null) {
            nakami.innerHTML = $MUKI_CHARACTER[$pc.muki];
        }

        submapview();
    }

}

function submapview(): void {
    let zenpou: number = 3
    let hidarimigi: number = 1;

    let div_submap: HTMLElement | null = document.getElementById('div_submap');

    let submapdata: string[] = map_kiritori($mapdata, zenpou, hidarimigi);

    if (div_submap != null) {
        mapview(div_submap, submapdata);
    }

    // デバッグ情報の表示
    if (div_submap != null) {
        let html: string = div_submap.innerHTML;
        html = html + submapdata[0] + '<br>' + submapdata[1] + '<br>' + submapdata[2] + '<br>' + submapdata[3] + '<br>';
        div_submap.innerHTML = html;
    }

    draw3D(submapdata, zenpou, hidarimigi);
}

function map_kiritori(mapdata: string[], zenpou: number, hidarimigi: number): string[] {
    let kiritorimapdata: string[] = new Array();
    let x: number = 0;
    let y: number = 0;
    if ($pc.muki == $TOP) {
        for (y = zenpou * -1; y <= 0; y++) {
            let line: string = '';
            for (x = hidarimigi * -1; x <= hidarimigi; x++) {
                let c: string = getPosChar(mapdata, $pc.xpos + x, $pc.ypos + y);
                c = charkaiten(c, $pc.muki);
                line += c;
            }
            kiritorimapdata.push(line);
        }

    } else if ($pc.muki == $RIGHT) {
        for (x = zenpou; 0 <= x; x--) {
            let line: string = '';
            for (y = hidarimigi * -1; y <= hidarimigi; y++) {
                let c: string = getPosChar(mapdata, $pc.xpos + x, $pc.ypos + y);
                c = charkaiten(c, $pc.muki);
                line += c;
            }
            kiritorimapdata.push(line);
        }

    } else if ($pc.muki == $BOTTOM) {
        for (y = zenpou; 0 <= y; y--) {
            let line: string = '';
            for (x = hidarimigi; hidarimigi * -1 <= x; x--) {
                let c: string = getPosChar(mapdata, $pc.xpos + x, $pc.ypos + y);
                c = charkaiten(c, $pc.muki);
                line += c;
            }
            kiritorimapdata.push(line);
        }

    } else if ($pc.muki == $LEFT) {
        for (x = zenpou * -1; x <= 0; x++) {
            let line: string = '';
            for (y = hidarimigi; hidarimigi * -1 <= y; y--) {
                let c: string = getPosChar(mapdata, $pc.xpos + x, $pc.ypos + y);
                c = charkaiten(c, $pc.muki);
                line += c;
            }
            kiritorimapdata.push(line);
        }
    }

    return kiritorimapdata;
}

function getPosChar(mapdata: string[], x: number, y: number): string {
    let c: string;
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

function charkaiten(c: string, muki: number): string {
    let n: number = parseInt(c, 16);
    for (let i: number = 0; i < (4 - muki) % 4; i++) {
        n = n * 2;
        if (16 <= n) {
            n = n - 16;
            n = n + 1;
        }
    }
    c = n.toString(16).toUpperCase();

    return c;
}

function draw3D(mapdata: string[], zenpou: number, hidarimigi: number): void {
    let elm: HTMLElement | null = document.getElementById('map3d');
    if (elm == null) {
        return;
    }
    let cvs: HTMLCanvasElement = <HTMLCanvasElement>elm;
    let context: CanvasRenderingContext2D | null = cvs.getContext('2d');
    if (context == null) {
        return;
    }

    context.beginPath();
    context.clearRect(0, 0, $SCREEN_WIDTH, $SCREEN_HEIGHT);

    let kabe: number = -1;

    for (let i: number = 0; i <= zenpou; i++) {
        let c: string = mapdata[zenpou - i].charAt(hidarimigi);
        let n: number = parseInt(c, 16);

        let hidarikabeflg: number = 0;
        let migikabeflg: number = 0;

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

function mapview(div_map: HTMLElement, kakumapdata: string[]): void {
    let ippen: number = 36;
    let futosa: number = 2;

    div_map.innerHTML = '';

    for (let y: number = 0, yl: number = kakumapdata.length; y < yl; y++) {
        for (let x: number = 0, xl: number = kakumapdata[y].length; x < xl; x++) {
            let c: string = kakumapdata[y].charAt(x);

            let kukaku: HTMLElement = document.createElement('DIV');
            kukaku.className = 'kukaku';
            kukaku.style.width = (ippen + futosa * 2) + 'px';
            kukaku.style.height = (ippen + futosa * 2) + 'px';

            let map: HTMLElement = document.createElement('DIV');
            map.id = 'map[' + x + '][' + y + ']';
            setStyle(map, c, ippen, futosa);

            let nakami: HTMLElement = document.createElement('DIV');
            nakami.id = 'nakami[' + x + '][' + y + ']';
            nakami.className = 'nakami';
            nakami.style.width = ippen + 'px';
            nakami.style.height = ippen + 'px';

            map.appendChild(nakami);
            kukaku.appendChild(map);
            div_map.appendChild(kukaku);
        }

        let br: HTMLElement = document.createElement('BR');
        div_map.appendChild(br);
    }
}

function setStyle(map: HTMLElement, c: string, ippen: number, futosa: number): void {
    let n: number = parseInt(c, 16);

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
    } else {
        map.style.marginTop = futosa + 'px';
    }

    if ((n & $BIT_RIGHT) == $BIT_RIGHT) {
        map.style.borderRightWidth = futosa + 'px';
    } else {
        map.style.marginRight = futosa + 'px';
    }
    if ((n & $BIT_BOTTOM) == $BIT_BOTTOM) {
        map.style.borderBottomWidth = futosa + 'px';
    } else {
        map.style.marginBottom = futosa + 'px';
    }
    if ((n & $BIT_LEFT) == $BIT_LEFT) {
        map.style.borderLeftWidth = futosa + 'px';
    } else {
        map.style.marginLeft = futosa + 'px';
    }
}

function kabemaekaku(context: CanvasRenderingContext2D, fukasa: number): void {
    context.beginPath();

    context.moveTo($kabex[fukasa], $kabey[fukasa]);
    context.lineTo($DRAW_WIDTH - $kabex[fukasa], $kabey[fukasa]);
    context.lineTo($DRAW_WIDTH - $kabex[fukasa], $DRAW_HEIGHT - $kabey[fukasa]);
    context.lineTo($kabex[fukasa], $DRAW_HEIGHT - $kabey[fukasa]);

    context.closePath();
    context.stroke();
}

function kabetatekaku(context: CanvasRenderingContext2D, fukasa: number, side: number): void {
    let startx: number;
    let fugou: number;

    if (side == $LEFT) {
        startx = 0;
        fugou = 1;
    } else if (side == $RIGHT) {
        startx = $DRAW_WIDTH;
        fugou = -1;
    } else {
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

function kabeyokokaku(context: CanvasRenderingContext2D, fukasa: number, side: number): void {
    let startx: number;
    let fugou: number;

    if (side == $LEFT) {
        startx = 0;
        fugou = 1;
    } else if (side == $RIGHT) {
        startx = $DRAW_WIDTH;
        fugou = -1;
    } else {
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
