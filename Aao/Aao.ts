namespace Aao {
    const FRAME_TIMING: number = 16;

    type MukiType = 'n' | 'e' | 's' | 'w';

    interface Muki {
        mukiType: MukiType;
        nextX: number;
        nextY: number;
        frameEnd: number;
    }

    class MukiClass implements Muki {
        mukiType: MukiType;
        nextX: number;
        nextY: number;
        frameEnd: number;

        constructor(mukiType: MukiType, nextX: number, nextY: number, frameEnd: number) {
            this.mukiType = mukiType;
            this.nextX = nextX;
            this.nextY = nextY;
            this.frameEnd = frameEnd;
        }
    }

    let muki_n: Muki = new MukiClass('n', 0, -1, 30);
    let muki_e: Muki = new MukiClass('e', 1, 0, 40);
    let muki_s: Muki = new MukiClass('s', 0, 1, 30);
    let muki_w: Muki = new MukiClass('w', -1, 0, 40);
    let mukiArray: Array<Muki> = [muki_n, muki_e, muki_s, muki_w];

    function createMuki(mukiType: MukiType): Muki {
        for (let i = 0, len: number = mukiArray.length; i < len; i++) {
            let muki: Muki = mukiArray[i];
            if (muki.mukiType == mukiType) {
                return muki;
            }
        }
        throw mukiType + ' is illigal argument';
    }

    interface MukiListGroup {
        [idx: string]: Array<string>;
    }

    class Character {
        chr: string;
        img: HTMLImageElement;
        x: number;
        y: number;
        ascii_x: number;
        ascii_y: number;
        frame: number;
        muki: Muki;
        mukiListGroup: MukiListGroup | undefined = undefined;

        constructor(chr: string, mukiListGroup?: MukiListGroup) {
            this.chr = chr;
            this.img = <HTMLImageElement>document.createElement('IMG');
            this.img.style.position = 'absolute';
            this.x = 0;
            this.y = 0;
            this.ascii_x = 0;
            this.ascii_y = 0;
            this.frame = 0;
            this.muki = muki_e;
            this.mukiListGroup = mukiListGroup;
        }

        moveTo(x: number, y: number, muki: Muki): void {
            let dx: number = x - this.x;
            let dy: number = y - this.y;
            this.moveBy(dx, dy, muki);
            this.x = x;
            this.y = y;
        }

        moveBy(dx: number, dy: number, muki: Muki): void {
            this.frame++;

            this.x += dx;
            this.y += dy;

            this.img.style.left = this.x + 'px';
            this.img.style.top = this.y + 'px';

            if (dx < 0) {
                this.ascii_x = Math.floor(this.x / 16);
            } else if (0 < dx) {
                this.ascii_x = Math.ceil(this.x / 16);
            }
            if (dy < 0) {
                this.ascii_y = Math.floor(this.y / 32);
            } else if (0 < dy) {
                this.ascii_y = Math.ceil(this.y / 32);
            }

            if (this.mukiListGroup == undefined) {
                return;
            }

            let array: Array<string> = this.mukiListGroup[muki.mukiType];
            let currentFlame: number = this.frame % array.length;

            this.img.src = array[currentFlame];
        }
    }

    class GameField {
        backGround: HTMLImageElement;
        maptext: Array<string>;

        constructor() {
            this.backGround = <HTMLImageElement>document.createElement('IMG');
            this.maptext = new Array<string>();
        }
    }

    class GameBoard {
        fieldGraph: HTMLDivElement;
        fieldAscii: HTMLDivElement | undefined = undefined;
        objectAscii: HTMLDivElement | undefined = undefined;
        asciiPosition: Array<string>;
        debug: HTMLDivElement | undefined = undefined;

        current: GameField;
        next: GameField;

        constructor() {
            this.fieldGraph = <HTMLDivElement>document.createElement('DIV');
            this.asciiPosition = new Array<string>();
            for (let i = 0; i < 15; i++) {
                this.asciiPosition.push('                                        ');
            }

            this.current = new GameField();
            this.next = new GameField();
        }
    }
    let _gameBoard: GameBoard = new GameBoard();

    class GameFieldGamen {
        name: string;
        maptext: Array<string>;
        imgsrc: string;

        over: { [mukiType: string]: string | undefined } = {};

        constructor(name: string, maptext: Array<string>, imgsrc: string, over_n: string | undefined, over_e: string | undefined, over_s: string | undefined, over_w: string | undefined) {
            this.name = name;
            this.maptext = maptext;
            this.imgsrc = imgsrc;
            this.over['n'] = over_n;
            this.over['e'] = over_e;
            this.over['s'] = over_s;
            this.over['w'] = over_w;
        }
    }
    let _GameFieldGamenList: Array<GameFieldGamen> = new Array<GameFieldGamen>();

    function getGameFieldGamen(name: string): GameFieldGamen {
        for (let i = 0, len: number = _GameFieldGamenList.length; i < len; i++) {
            let item: GameFieldGamen = _GameFieldGamenList[i];
            if (item.name == name) {
                return item;
            }
        }
        throw name + ' is not found';
    }

    interface Initter {
        analize(line: string): void;
        save(): void;
    }

    class GameInitter implements Initter {
        start_field: string = 'no define';
        player: Character | undefined = undefined;
        start_x: number = 0;
        start_y: number = 0;
        start_muki: Muki | undefined = undefined;

        gameFieldGamenList: Array<GameFieldGamen> = new Array<GameFieldGamen>();

        reg: RegExp = /^([_0-9a-zA-Z]*): ?(.*)\s*/;

        analize(line: string): void {
            let defineData: RegExpMatchArray | null = line.match(this.reg);
            if (defineData != null) {
                let attr: string = defineData[1];
                let value: string = defineData[2];

                if (attr == 'start_field') {
                    this.start_field = value;
                } else if (attr == 'start_x') {
                    this.start_x = +value;
                } else if (attr == 'start_y') {
                    this.start_y = +value;
                } else if (attr == 'start_muki') {
                    if (value == 'n' || value == 'e' || value == 's' || value == 'w') {
                        this.start_muki = createMuki(value);
                    }
                }
            }
        }

        save(): void {
            // 全部そろうまでわからないので、ここでは何もしない
        }
    }

    class PlayerInitter implements Initter {
        private gameInitter: GameInitter;
        chr: string = 'no define';

        mukiList_n: Array<string> = new Array<string>();
        mukiList_e: Array<string> = new Array<string>();
        mukiList_s: Array<string> = new Array<string>();
        mukiList_w: Array<string> = new Array<string>();

        reg: RegExp = /^([_0-9a-zA-Z]*): ?(.*)\s*/;

        constructor(gameInitter: GameInitter) {
            this.gameInitter = gameInitter;
        }

        analize(line: string): void {
            let defineData: RegExpMatchArray | null = line.match(this.reg);
            if (defineData != null) {
                let attr: string = defineData[1];
                let value: string = defineData[2];
                if (attr == 'chr') {
                    this.chr = value;
                } else if (attr == 'mukiList_n') {
                    this.mukiList_n.push(value);
                } else if (attr == 'mukiList_e') {
                    this.mukiList_e.push(value);
                } else if (attr == 'mukiList_s') {
                    this.mukiList_s.push(value);
                } else if (attr == 'mukiList_w') {
                    this.mukiList_w.push(value);
                }
            }
        }

        save(): void {
            let mukiListGroup: MukiListGroup = { 'n': this.mukiList_n, 'e': this.mukiList_e, 's': this.mukiList_s, 'w': this.mukiList_w };
            let player = new Character(this.chr, mukiListGroup);
            this.gameInitter.player = player;
        }
    }

    class GameFieldGamenInitter implements Initter {
        private gameInitter: GameInitter;
        name: string = 'no define';
        maptext: Array<string> = new Array<string>();
        imgsrc: string = 'no define';
        over_n: string | undefined = undefined;
        over_e: string | undefined = undefined;
        over_s: string | undefined = undefined;
        over_w: string | undefined = undefined;

        reg: RegExp = /^([_0-9a-zA-Z]*): ?(.*)\s*/;

        maptextMode: boolean = false;
        maptextCount: number = 0;

        constructor(gameInitter: GameInitter) {
            this.gameInitter = gameInitter;
        }

        analize(line: string): void {
            if (this.maptextMode) {
                this.maptext.push(line);
                this.maptextCount++;
                if (15 <= this.maptextCount) {
                    this.maptextMode = false;
                }
            } else {
                let defineData: RegExpMatchArray | null = line.match(this.reg);
                if (defineData != null) {
                    let attr: string = defineData[1];
                    let value: string = defineData[2];
                    if (attr == 'name') {
                        this.name = value;
                    } else if (attr == 'imgsrc') {
                        this.imgsrc = value;
                    } else if (attr == 'maptext') {
                        this.maptextMode = true;
                    } else if (attr == 'over_n') {
                        this.over_n = value;
                    } else if (attr == 'over_e') {
                        this.over_e = value;
                    } else if (attr == 'over_s') {
                        this.over_s = value;
                    } else if (attr == 'over_w') {
                        this.over_w = value;
                    }
                }
            }
        }

        save(): void {
            this.gameInitter.gameFieldGamenList.push(new GameFieldGamen(this.name, this.maptext, this.imgsrc, this.over_n, this.over_e, this.over_s, this.over_w));
        }
    }

    function loadData(gameInitter: GameInitter): void {
        let data: string = Kyoutsu.load('data.txt');
        let lines: Array<string> = data.split(/[\r\n]+/g);

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
                initter = gameInitter;

            } else if (line == '[PLAYER]') {
                if (initter != undefined) {
                    initter.save();
                }
                initter = new PlayerInitter(gameInitter);

            } else if (line == '[FIELD]') {
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

    /**
     * main
     */
    export function init(): void {
        initMainBoard();

        document.addEventListener('keydown', (e: KeyboardEvent): void => {
            documentKeydown(e.key);
        });

        document.addEventListener('keyup', (e: KeyboardEvent): void => {
            let inputCode = Kyoutsu.getInputCode(e.key);
            documentKeyup(inputCode);
        });

        let gameInitter: GameInitter = new GameInitter();

        loadData(gameInitter);

        if (gameInitter.player == undefined || gameInitter.start_muki == undefined) {
            throw 'illigal data file';
        }

        let player = gameInitter.player;

        for (let i = 0, len: number = gameInitter.gameFieldGamenList.length; i < len; i++) {
            _GameFieldGamenList.push(gameInitter.gameFieldGamenList[i]);
        }
        let gameFieldGamen: GameFieldGamen = getGameFieldGamen(gameInitter.start_field);

        _gameStatus.player = player;
        _gameStatus.gameFieldGamen = gameFieldGamen;

        _gameBoard.fieldGraph.appendChild(player.img);

        _gameBoard.current.backGround.src = gameFieldGamen.imgsrc;

        for (let i = 0; i < gameFieldGamen.maptext.length; i++) {
            _gameBoard.current.maptext.push(gameFieldGamen.maptext[i]);
        }

        player.moveTo(gameInitter.start_x * 16, gameInitter.start_y * 32, gameInitter.start_muki);
        put(player);
        display();

        setTimeout(frameCheck, FRAME_TIMING);
    };

    function documentKeydown(key: string): void {
        _gameStatus.lastInputCode = Kyoutsu.getInputCode(key);
    }

    function documentKeyup(inputCode: number): void {
        if (inputCode == 0 || inputCode == _gameStatus.lastInputCode) {
            _gameStatus.lastInputCode = 0;
        }
    }

    function initMainBoard(): void {
        let mainBoard: HTMLElement = Kyoutsu.getElementById('mainBoard');

        {
            let elm: HTMLDivElement = _gameBoard.fieldGraph;
            elm.className = 'fieldGraph';

            _gameBoard.current.backGround.style.position = 'absolute';

            _gameBoard.next.backGround.style.position = 'absolute';
            _gameBoard.next.backGround.style.display = 'none';

            elm.appendChild(_gameBoard.current.backGround);
            elm.appendChild(_gameBoard.next.backGround);

            mainBoard.appendChild(elm);
        }

        {
            let elm: HTMLDivElement = <HTMLDivElement>document.createElement('DIV');
            elm.className = 'fieldAscii';
            elm.style.left = '660px'

            _gameBoard.fieldAscii = elm;

            mainBoard.appendChild(elm);
        }
        {
            let elm: HTMLDivElement = <HTMLDivElement>document.createElement('DIV');
            elm.className = 'fieldAscii';
            elm.style.left = '660px'
            elm.style.color = 'red';

            _gameBoard.objectAscii = elm;

            mainBoard.appendChild(elm);
        }
        {
            let elm: HTMLDivElement = <HTMLDivElement>document.createElement('DIV');
            elm.style.position = 'absolute';
            elm.style.top = '180px';
            elm.style.left = '660px';

            _gameBoard.debug = elm;

            mainBoard.appendChild(elm);
        }

        let keyboard = new Kyoutsu.Keyboard();
        keyboard.keyboard.style.top = '496px';

        mainBoard.appendChild(keyboard.keyboard);

        keyboard.setKeyEvent('mousedown', keyboardMousedown);
        keyboard.setKeyEvent('mouseup', keyboardMouseup);

        keyboard.setKeytops([' ', 'w', ' ', 'a', 's', 'd', ' ', 'Escape', ' ']);
    }

    function keyboardMousedown(evt: Event): void {
        let key = Kyoutsu.getKeytop(evt.target);
        documentKeydown(key);
    }

    function keyboardMouseup(_evt: Event): void {
        documentKeyup(0);
    }

    interface Koudou {
        type: string;
        muki: Muki;
    }

    class GameStatus {
        gameMode: GameMode | undefined = undefined;
        player: Character = new Character('');

        gameFieldGamen: GameFieldGamen = new GameFieldGamen('null', new Array<string>(), '', undefined, undefined, undefined, undefined);

        frameCount: number = 0;
        lastInputCode: number = 0;

        koudouArray: Array<Koudou> = new Array<Koudou>();
    }
    let _gameStatus: GameStatus = new GameStatus();

    interface GameMode {
        name: string;
        gameStatus: GameStatus;

        do(): void;
    }

    function frameCheck(): void {
        let gameStatus: GameStatus = _gameStatus;

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
                + '<br>' + gameStatus.player.ascii_x + ',' + gameStatus.player.ascii_y
                ;
        }

        if (gameStatus.lastInputCode == Kyoutsu.INPUT_ESCAPE) {
            return;
        }

        gameStatus.gameMode.do();

        setTimeout(frameCheck, FRAME_TIMING);
    }

    function put(character: Character, chr?: string): void {
        let x: number = character.ascii_x;
        let y: number = character.ascii_y;
        if (chr == undefined) {
            chr = character.chr;
        }

        chr = (chr + '..').substr(0, 2);

        let swp = _gameBoard.asciiPosition[y];
        swp = swp.substr(0, x) + chr + swp.substr(x + 2);
        _gameBoard.asciiPosition[y] = swp;
    }

    function get(x: number, y: number): string {
        if (y < 0 || _gameBoard.current.maptext.length <= y) {
            return '';
        }
        if (x < 0 || _gameBoard.current.maptext[y].length <= x) {
            return '';
        }
        return _gameBoard.current.maptext[y].charAt(x);
    }

    function display(): void {
        if (_gameBoard.fieldAscii != undefined) {
            _gameBoard.fieldAscii.innerHTML = _gameBoard.current.maptext.join('<br>').replace(/ /g, '&nbsp;');
        }
        if (_gameBoard.objectAscii != undefined) {
            _gameBoard.objectAscii.innerHTML = _gameBoard.asciiPosition.join('<br>').replace(/ /g, '&nbsp;');
        }
    }

    class FreeGameMode implements GameMode {
        readonly name: string = 'free';
        gameStatus: GameStatus;

        constructor(gameStatus: GameStatus) {
            this.gameStatus = gameStatus;
        }

        do(): void {
            if (this.gameStatus.frameCount % 2 != 0) {
                return;
            }

            let koudou = this.gameStatus.koudouArray.shift();
            if (koudou != undefined) {
                if (koudou.type == 'idou') {
                    let muki: Muki = koudou.muki;

                    this.gameStatus.player.moveBy(muki.nextX * 4, muki.nextY * 4, muki);

                    if (this.gamenOver(this.gameStatus.player, muki)) {
                        let nextName = this.gameStatus.gameFieldGamen.over[muki.mukiType];
                        if (nextName != undefined) {
                            let nextGameFieldGamen: GameFieldGamen = getGameFieldGamen(nextName);
                            this.gameStatus.gameMode = new ScrollGameMode(this.gameStatus, this.gameStatus.player.muki, nextGameFieldGamen);
                            return;
                        }
                    }
                }
                if (koudou.type == 'jump') {
                    // 未実装
                }
            }

            put(this.gameStatus.player);
            display();

            let inputCode: number = this.gameStatus.lastInputCode;
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
        }

        move(muki: Muki): void {
            let character: Character = this.gameStatus.player;

            let next_ascii_x = Math.floor(character.x / 16) + ((character.x % 16 == 0) ? 1 : 0) * muki.nextX;
            let next_ascii_y = Math.floor(character.y / 32) + ((character.y % 32 == 0) ? 1 : 0) * muki.nextY;

            let check_c1 = get(next_ascii_x, next_ascii_y);
            let check_c2 = get(next_ascii_x + 1, next_ascii_y);

            let check_offet: string;
            if (muki.mukiType == 'n' || muki.mukiType == 's') {
                check_offet = character.x % 16 == 0 ? ' ' : get(next_ascii_x + 2, next_ascii_y);
            } else if (muki.mukiType == 'e' || muki.mukiType == 'w') {
                check_offet = character.y % 32 == 0 ? ' ' : get(next_ascii_x + 1, next_ascii_y + 1);
            } else {
                throw 'unreachable';
            }

            if (check_c1 == ' ' && check_c2 == ' ' && check_offet == ' ') {
                if (character.muki.mukiType == muki.mukiType) {
                    put(character, '  ');
                    this.gameStatus.koudouArray.push({ type: 'idou', muki: muki });
                } else {
                    character.muki = muki;
                }
            }
        }

        gamenOver(character: Character, muki: Muki): boolean {
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
    }

    class ScrollGameMode implements GameMode {
        readonly name: string = 'scrl';
        gameStatus: GameStatus;

        muki: Muki;
        nextGameFieldGamen: GameFieldGamen;
        frame: number;

        constructor(gameStatus: GameStatus, muki: Muki, nextGameFieldGamen: GameFieldGamen) {
            this.gameStatus = gameStatus;
            this.muki = muki;
            this.nextGameFieldGamen = nextGameFieldGamen;

            this.frame = 0;
        }

        do(): void {
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

                for (let i = 0; i < _gameBoard.current.maptext.length; i++) {
                    _gameBoard.current.maptext[i] = _gameBoard.next.maptext[i];
                }

                this.gameStatus.gameFieldGamen = this.nextGameFieldGamen;
                this.gameStatus.gameMode = new FreeGameMode(this.gameStatus);
            }
        }

        scrollEndAdgust(character: Character, muki: Muki): void {
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
    }

}
