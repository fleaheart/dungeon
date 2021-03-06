namespace Dungeon {

    let $kabex: number[] = [0, 40, 114, 155, 180];
    let $kabey: number[] = [0, 31, 85, 115, 134];

    let $SCREEN_WIDTH: number = 400;
    let $SCREEN_HEIGHT: number = 300;

    type MukiType = 'n' | 'e' | 's' | 'w';
    type MukiChr = '↑' | '→' | '↓' | '←';

    interface Muki {
        index: number;
        mukiType: MukiType;
        mukiChr: MukiChr;
        bit: number;
        nextX: number;
        nextY: number;
    }

    class Muki_N implements Muki {
        readonly index: number = 0;
        readonly mukiType: MukiType = 'n';
        readonly mukiChr: MukiChr = '↑';
        readonly bit: number = Kyoutsu.BIT_TOP;
        readonly nextX: number = 0;
        readonly nextY: number = -1;
    }
    let muki_n = new Muki_N();

    class Muki_E implements Muki {
        readonly index: number = 1;
        readonly mukiType: MukiType = 'e';
        readonly mukiChr: MukiChr = '→';
        readonly bit: number = Kyoutsu.BIT_RIGHT;
        readonly nextX: number = 1;
        readonly nextY: number = 0;
    }
    let muki_e = new Muki_E();

    class Muki_S implements Muki {
        readonly index: number = 2;
        readonly mukiType: MukiType = 's';
        readonly mukiChr: MukiChr = '↓';
        readonly bit: number = Kyoutsu.BIT_BOTTOM;
        readonly nextX: number = 0;
        readonly nextY: number = 1;
    }
    let muki_s = new Muki_S();

    class Muki_W implements Muki {
        readonly index: number = 3;
        readonly mukiType: MukiType = 'w';
        readonly mukiChr: MukiChr = '←';
        readonly bit: number = Kyoutsu.BIT_LEFT;
        readonly nextX: number = -1;
        readonly nextY: number = 0;
    }
    let muki_w = new Muki_W();
    let mukiArray: Muki[] = [muki_n, muki_e, muki_s, muki_w];

    function createMuki(mukiType: MukiType): Muki {
        if (mukiType == 'n') {
            return muki_n;
        } else if (mukiType == 'e') {
            return muki_e;
        } else if (mukiType == 's') {
            return muki_s;
        } else if (mukiType == 'w') {
            return muki_w;
        }
        throw mukiType + ' is illigal argument';
    }

    function mukiRotation(muki: Muki, chokkakuCount: number): Muki {
        let index: number = muki.index + chokkakuCount;
        if (index < 0) {
            index += 4;
        } else if (4 <= index) {
            index -= 4;
        }
        return mukiArray[index];
    }

    class Character {
        xpos: number = 0;
        ypos: number = 0;
        muki: Muki = new Muki_N();
    }

    interface Initter {
        analize(line: string): void;
        save(): void;
    }

    class GameInitter implements Initter {
        start_floor: string = 'no define';
        start_x: number = 0;
        start_y: number = 0;
        start_muki: Muki = muki_e;
        mode: string = '';

        reg: RegExp = /^([_0-9a-zA-Z]*): ?(.*)\s*/;

        analize(line: string): void {
            let defineData: RegExpMatchArray | null = line.match(this.reg);
            if (defineData != null) {
                let attr: string = defineData[1];
                let value: string = defineData[2];

                if (attr == 'start_floor') {
                    this.start_floor = value;
                } else if (attr == 'start_x') {
                    this.start_x = Number(value);
                } else if (attr == 'start_y') {
                    this.start_y = Number(value);
                } else if (attr == 'start_muki') {
                    if (value == 'n' || value == 'e' || value == 's' || value == 'w') {
                        this.start_muki = createMuki(value);
                    }
                } else if (attr == 'mode') {
                    this.mode = value;
                }
            }
        }

        save(): void {
            // 全部そろうまでわからないので、ここでは何もしない
        }
    }

    class FloorInitter implements Initter {
        name: string = 'no define';
        maptext: string[] = [];

        reg: RegExp = /^([_0-9a-zA-Z]*): ?(.*)\s*/;

        maptextMode: boolean = false;

        analize(line: string): void {
            if (this.maptextMode) {
                if (line == ':mapend') {
                    this.maptextMode = false;
                } else {
                    this.maptext.push(line);
                }
            } else {
                let defineData: RegExpMatchArray | null = line.match(this.reg);
                if (defineData != null) {
                    let attr: string = defineData[1];
                    let value: string = defineData[2];
                    if (attr == 'name') {
                        this.name = value;
                    } else if (attr == 'maptext') {
                        this.maptextMode = true;
                    }
                }
            }
        }

        save(): void {
            let floor: Floor = { name: this.name, maptext: this.maptext };
            _floorList.push(floor);
        }
    }

    interface GameStatus {
        gameInitter: GameInitter;
        player: Character;
        mapdata: string[];
    }
    let _gameStatus: GameStatus = {
        gameInitter: new GameInitter(),
        player: new Character(),
        mapdata: []
    }

    interface Floor {
        name: string;
        maptext: string[];
    }
    let _floorList: Floor[] = [];

    function getFloor(name: string): Floor {
        for (let i = 0, len: number = _floorList.length; i < len; i++) {
            let item: Floor = _floorList[i];
            if (item.name == name) {
                return item;
            }
        }
        throw name + ' is not found';
    }

    function loadData(): void {
        let data: string = Kyoutsu.load('data.txt');
        let lines: string[] = data.split(/[\r\n]+/g);

        let initter: Initter | undefined = undefined;

        let i = 0;
        while (true) {
            let line: string | undefined = lines[i];
            i++;
            if (line == undefined) {
                break;
            }

            if (line == '[GAME_INITIALIZE]') {
                if (initter != undefined) {
                    initter.save();
                }
                // gameInitterだけは、全部そろうまでわからないので、捨てないで使いまわす。
                initter = _gameStatus.gameInitter;

            } else if (line == '[FLOOR]') {
                if (initter != undefined) {
                    initter.save();
                }
                initter = new FloorInitter();
            }

            if (initter != undefined) {
                initter.analize(line);
            }
        }
        if (initter != undefined) {
            initter.save();
        }
    }

    export function init(): void {
        loadData();

        let floor: Floor = getFloor(_gameStatus.gameInitter.start_floor);
        _gameStatus.mapdata = floor.maptext;

        document.addEventListener('keydown', keyDownEvent);

        let div_map: HTMLElement = Kyoutsu.getElementById('div_map');
        mapview(div_map, _gameStatus.mapdata, '');

        _gameStatus.player.xpos = _gameStatus.gameInitter.start_x;
        _gameStatus.player.ypos = _gameStatus.gameInitter.start_y;
        _gameStatus.player.muki = _gameStatus.gameInitter.start_muki;

        let nakami: HTMLElement = Kyoutsu.getElementById('nakami[' + _gameStatus.player.xpos + '][' + _gameStatus.player.ypos + ']');
        nakami.innerHTML = _gameStatus.gameInitter.start_muki.mukiChr;

        submapview();

        let keyboard = new Kyoutsu.Keyboard();

        document.body.appendChild(keyboard.keyboard);

        keyboard.setKeyEvent('click', keyboardClick);
        keyboard.setKeyEvent('touch', (e: Event): void => { keyboardClick(e); e.preventDefault(); });

        keyboard.setKeytops([' ', 'w', ' ', 'a', ' ', 'd', ' ', ' ', ' ']);

        let mode: string = _gameStatus.gameInitter.mode;
        let div_submap: HTMLElement = Kyoutsu.getElementById('div_submap');
        if (mode == 'debug') {
            div_map.style.display = '';
            div_submap.style.display = '';
            div_submap.style.top = '20px';
            div_submap.style.left = '424px';

            keyboard.keyboard.style.top = '20px';
            keyboard.keyboard.style.left = '560px';
        } else {
            if (mode == 'easy') {
                div_submap.style.display = '';
            }
            keyboard.keyboard.style.top = '320px';
        }
    }

    function keyboardClick(e: Event): void {
        let key: string = Kyoutsu.getKeytop(e.target);
        keyOperation(key);
    }

    function keyDownEvent(e: KeyboardEvent): void {
        keyOperation(e.key);
    }

    function keyOperation(key: string): void {
        let inputCode: number = Kyoutsu.getInputCode(key);
        if (inputCode == Kyoutsu.INPUT_UP) {
            let kabeChar: string = _gameStatus.mapdata[_gameStatus.player.ypos].charAt(_gameStatus.player.xpos);
            let kabeType: number = parseInt(kabeChar, 16);

            let xdiff: number = 0;
            let ydiff: number = 0;

            let muki: Muki = _gameStatus.player.muki;
            xdiff = (kabeType & muki.bit) == 0 ? muki.nextX : 0;
            ydiff = (kabeType & muki.bit) == 0 ? muki.nextY : 0;

            if (xdiff != 0 || ydiff != 0) {
                let nakami: HTMLElement;
                nakami = Kyoutsu.getElementById('nakami[' + _gameStatus.player.xpos + '][' + _gameStatus.player.ypos + ']');
                nakami.innerHTML = '';

                _gameStatus.player.xpos += xdiff;
                _gameStatus.player.ypos += ydiff;
                nakami = Kyoutsu.getElementById('nakami[' + _gameStatus.player.xpos + '][' + _gameStatus.player.ypos + ']');
                nakami.innerHTML = _gameStatus.player.muki.mukiChr;

                submapview();
            }

        } else if (inputCode == Kyoutsu.INPUT_LEFT) {
            _gameStatus.player.muki = mukiRotation(_gameStatus.player.muki, -1);

            let nakami: HTMLElement = Kyoutsu.getElementById('nakami[' + _gameStatus.player.xpos + '][' + _gameStatus.player.ypos + ']');
            nakami.innerHTML = _gameStatus.player.muki.mukiChr;

            submapview();

        } else if (inputCode == Kyoutsu.INPUT_RIGHT) {
            _gameStatus.player.muki = mukiRotation(_gameStatus.player.muki, +1);

            let nakami: HTMLElement = Kyoutsu.getElementById('nakami[' + _gameStatus.player.xpos + '][' + _gameStatus.player.ypos + ']');
            nakami.innerHTML = _gameStatus.player.muki.mukiChr;

            submapview();
        }
    }

    function submapview(): void {
        let zenpou: number = 3
        let hidarimigi: number = 1;

        let submapdata: string[] = map_kiritori(_gameStatus.mapdata, zenpou, hidarimigi);

        draw3D(submapdata, zenpou, hidarimigi);

        let div_submap: HTMLElement = Kyoutsu.getElementById('div_submap');

        mapview(div_submap, submapdata, 'sub');

        if (_gameStatus.gameInitter.mode == 'debug') {
            // デバッグ情報の表示
            let html: string = div_submap.innerHTML;
            html = html + submapdata[0] + '<br>' + submapdata[1] + '<br>' + submapdata[2] + '<br>' + submapdata[3] + '<br>';
            div_submap.innerHTML = html;
        }
    }

    function map_kiritori(mapdata: string[], zenpou: number, hidarimigi: number): string[] {
        let kiritorimapdata: string[] = [];
        let x: number = 0;
        let y: number = 0;

        if (_gameStatus.player.muki.bit == Kyoutsu.BIT_TOP) {
            for (y = zenpou * -1; y <= 0; y++) {
                let line: string = '';
                for (x = hidarimigi * -1; x <= hidarimigi; x++) {
                    let c: string = getPosChar(mapdata, _gameStatus.player.xpos + x, _gameStatus.player.ypos + y);
                    c = charkaiten(c, _gameStatus.player.muki);
                    line += c;
                }
                kiritorimapdata.push(line);
            }

        } else if (_gameStatus.player.muki.bit == Kyoutsu.BIT_RIGHT) {
            for (x = zenpou; 0 <= x; x--) {
                let line: string = '';
                for (y = hidarimigi * -1; y <= hidarimigi; y++) {
                    let c: string = getPosChar(mapdata, _gameStatus.player.xpos + x, _gameStatus.player.ypos + y);
                    c = charkaiten(c, _gameStatus.player.muki);
                    line += c;
                }
                kiritorimapdata.push(line);
            }

        } else if (_gameStatus.player.muki.bit == Kyoutsu.BIT_BOTTOM) {
            for (y = zenpou; 0 <= y; y--) {
                let line: string = '';
                for (x = hidarimigi; hidarimigi * -1 <= x; x--) {
                    let c: string = getPosChar(mapdata, _gameStatus.player.xpos + x, _gameStatus.player.ypos + y);
                    c = charkaiten(c, _gameStatus.player.muki);
                    line += c;
                }
                kiritorimapdata.push(line);
            }

        } else if (_gameStatus.player.muki.bit == Kyoutsu.BIT_LEFT) {
            for (x = zenpou * -1; x <= 0; x++) {
                let line: string = '';
                for (y = hidarimigi; hidarimigi * -1 <= y; y--) {
                    let c: string = getPosChar(mapdata, _gameStatus.player.xpos + x, _gameStatus.player.ypos + y);
                    c = charkaiten(c, _gameStatus.player.muki);
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

    function charkaiten(c: string, muki: Muki): string {
        let n: number = parseInt(c, 16);
        for (let i: number = 0; i < (4 - muki.index) % 4; i++) {
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
        let cvs = <HTMLCanvasElement>Kyoutsu.getElementById('map3d');
        let context: CanvasRenderingContext2D | null = cvs.getContext('2d');
        if (context == null) {
            return;
        }

        context.beginPath();
        context.clearRect(0, 0, $SCREEN_WIDTH, $SCREEN_HEIGHT);

        let kabe: number = -1;

        let hidarikabe: number[] = [zenpou];
        let migikabe: number[] = [zenpou];

        for (let i: number = 0; i <= zenpou; i++) {
            let c: string = mapdata[zenpou - i].charAt(hidarimigi);
            let n: number = parseInt(c, 16);

            let hidarikabeflg: number = 0;
            let migikabeflg: number = 0;

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
            hidarikabe[i] = hidarikabeflg;

            if ((n & Kyoutsu.BIT_RIGHT) == Kyoutsu.BIT_RIGHT) {
                if (kabe == -1 || i <= kabe) {
                    kabetatekaku(context, i + 1, Kyoutsu.BIT_RIGHT);
                    migikabeflg = 1;
                }
            }
            migikabe[i] = migikabeflg;

            c = mapdata[zenpou - i].charAt(hidarimigi - 1);
            n = parseInt(c, 16);
            if ((n & Kyoutsu.BIT_TOP) == Kyoutsu.BIT_TOP) {
                if (kabe == -1 || i <= kabe) {
                    if (hidarikabeflg != 1) {
                        kabeyokokaku(context, i + 1, hidarikabe, Kyoutsu.BIT_LEFT);
                        hidarikabe[i] += 2;
                    }
                }
            }

            c = mapdata[zenpou - i].charAt(hidarimigi + 1);
            n = parseInt(c, 16);
            if ((n & Kyoutsu.BIT_TOP) == Kyoutsu.BIT_TOP) {
                if (kabe == -1 || i <= kabe) {
                    if (migikabeflg != 1) {
                        kabeyokokaku(context, i + 1, migikabe, Kyoutsu.BIT_RIGHT);
                        migikabe[i] += 2;
                    }
                }
            }
        }
    }

    export function mapview(div_map: HTMLElement, kakumapdata: string[], header: string): void {
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
                nakami.id = header + 'nakami[' + x + '][' + y + ']';
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

    export function setStyle(map: HTMLElement, c: string, ippen: number, futosa: number): void {
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

        if ((n & Kyoutsu.BIT_TOP) == Kyoutsu.BIT_TOP) {
            map.style.borderTopWidth = futosa + 'px';
        } else {
            map.style.marginTop = futosa + 'px';
        }

        if ((n & Kyoutsu.BIT_RIGHT) == Kyoutsu.BIT_RIGHT) {
            map.style.borderRightWidth = futosa + 'px';
        } else {
            map.style.marginRight = futosa + 'px';
        }
        if ((n & Kyoutsu.BIT_BOTTOM) == Kyoutsu.BIT_BOTTOM) {
            map.style.borderBottomWidth = futosa + 'px';
        } else {
            map.style.marginBottom = futosa + 'px';
        }
        if ((n & Kyoutsu.BIT_LEFT) == Kyoutsu.BIT_LEFT) {
            map.style.borderLeftWidth = futosa + 'px';
        } else {
            map.style.marginLeft = futosa + 'px';
        }
    }

    function kabemaekaku(context: CanvasRenderingContext2D, fukasa: number): void {
        context.beginPath();

        context.moveTo($kabex[fukasa], $kabey[fukasa]);
        context.lineTo($SCREEN_WIDTH - $kabex[fukasa], $kabey[fukasa]);
        context.lineTo($SCREEN_WIDTH - $kabex[fukasa], $SCREEN_HEIGHT - $kabey[fukasa]);
        context.lineTo($kabex[fukasa], $SCREEN_HEIGHT - $kabey[fukasa]);

        context.closePath();
        context.stroke();
    }

    function kabetatekaku(context: CanvasRenderingContext2D, fukasa: number, side: number): void {
        let startx: number;
        let fugou: number;

        if (side == Kyoutsu.BIT_LEFT) {
            startx = 0;
            fugou = 1;
        } else if (side == Kyoutsu.BIT_RIGHT) {
            startx = $SCREEN_WIDTH;
            fugou = -1;
        } else {
            return;
        }

        context.beginPath();

        context.moveTo(startx + fugou * $kabex[fukasa - 1], $kabey[fukasa - 1]);
        context.lineTo(startx + fugou * $kabex[fukasa], $kabey[fukasa]);
        context.lineTo(startx + fugou * $kabex[fukasa], $SCREEN_HEIGHT - $kabey[fukasa]);
        context.lineTo(startx + fugou * $kabex[fukasa - 1], $SCREEN_HEIGHT - $kabey[fukasa - 1]);

        context.closePath();
        context.stroke();
    }

    function kabeyokokaku(context: CanvasRenderingContext2D, fukasa: number, kabeArray: number[], side: number): void {
        let startx: number;
        let fugou: number;

        if (side == Kyoutsu.BIT_LEFT) {
            startx = 0;
            fugou = 1;
        } else if (side == Kyoutsu.BIT_RIGHT) {
            startx = $SCREEN_WIDTH;
            fugou = -1;
        } else {
            return;
        }

        let nagasa: number = $kabex[fukasa - 1];
        if (kabeArray[fukasa - 2] == 0) {
            nagasa = $kabex[fukasa - 2];
            if (kabeArray[fukasa - 3] == 0) {
                nagasa = $kabex[fukasa - 3];
            }
        }

        context.beginPath();

        context.moveTo(startx + fugou * nagasa, $kabey[fukasa]);
        context.lineTo(startx + fugou * $kabex[fukasa], $kabey[fukasa]);
        context.lineTo(startx + fugou * $kabex[fukasa], $SCREEN_HEIGHT - $kabey[fukasa]);
        context.lineTo(startx + fugou * nagasa, $SCREEN_HEIGHT - $kabey[fukasa]);

        context.closePath();
        context.stroke();
    }
}
