namespace Dungeon {

    const MAP_IPPEN = 24;

    const TILE_IPPEN = 48;
    const MU_FUTOSA = 1;
    const ARI_ARI = 6;

    let _board: HTMLElement;

    type HougakuChar = 'N' | 'E' | 'S' | 'W';

    type BorderStyleName = 'borderTop' | 'borderRight' | 'borderBottom' | 'borderLeft';

    interface Hougaku {
        char: HougakuChar;
        borderStyleName: BorderStyleName;
    }

    let hougaku_N: Hougaku = {
        char: 'N',
        borderStyleName: 'borderTop'
    };

    let hougaku_E: Hougaku = {
        char: 'E',
        borderStyleName: 'borderRight'
    };

    let hougaku_S: Hougaku = {
        char: 'S',
        borderStyleName: 'borderBottom'
    };

    let hougaku_W: Hougaku = {
        char: 'W',
        borderStyleName: 'borderLeft'
    };

    type Kabe = 0 | 1 | 2;

    const MU: Kabe = 0;
    const KABE: Kabe = 1;
    const DOOR: Kabe = 2;

    let kabeHairetsu: Kabe[] = [MU, KABE, DOOR];

    class MapBlock {
        x: number = -1;
        y: number = -1;

        N: Kabe = MU;
        E: Kabe = MU;
        S: Kabe = MU;
        W: Kabe = MU;
    }

    let _mapBlockMatrix: MapBlock[][] = [];

    window.addEventListener('load', (): void => {

        {
            let element = document.getElementById('board');
            if (element == null) {
                return;
            }
            _board = element;
            _board.style.border = 'black 1px solid';
            _board.style.padding = '4px';
            _board.style.width = String(TILE_IPPEN * 32) + 'px';
            _board.style.height = String(TILE_IPPEN * 32) + 'px';
            _board.style.verticalAlign = 'top';
        }

        document.body.appendChild(_board);

        for (let y = 0; y < MAP_IPPEN; y++) {
            let x_hairetsu: MapBlock[] = [];
            for (let x = 0; x < MAP_IPPEN; x++) {
                let tile = document.createElement('div');
                tile.id = 'tile_' + String(x) + '_' + String(y);
                tile.style.display = 'inline-block';
                tile.style.margin = '0px';
                tile.style.border = 'black ' + String(MU_FUTOSA) + 'px dotted';
                tile.style.width = String(TILE_IPPEN) + 'px';
                tile.style.height = String(TILE_IPPEN) + 'px';
                tile.style.verticalAlign = 'top';
                tile.innerHTML = '&nbsp;';

                tile.addEventListener('click', clickTile);
                tile.addEventListener('mousemove', mousemoveTile);
                tile.addEventListener('mouseout', mouseoutTile);

                _board.appendChild(tile);

                let mapBlock: MapBlock = new MapBlock();
                mapBlock.x = x;
                mapBlock.y = y;

                x_hairetsu.push(mapBlock);
            }

            _mapBlockMatrix.push(x_hairetsu);

            let br = document.createElement('br');
            _board.appendChild(br);
        }

        {
            let element = document.getElementById('load_button');
            if (element != null) {
                element.addEventListener('click', clickLoad);
            }
        }
        {
            let element = document.getElementById('kaiten_button');
            if (element != null) {
                element.addEventListener('click', clickKaiten);
            }
        }
        {
            let element = document.getElementById('center_button');
            if (element != null) {
                element.addEventListener('click', clickCenter);
            }
        }
    });

    function getHougaku(evt: MouseEvent): Hougaku | undefined {
        let offsetX = evt.offsetX;
        let offsetY = evt.offsetY;

        if (offsetX < ARI_ARI) {
            return hougaku_W;

        } else if (TILE_IPPEN - ARI_ARI * 2 < offsetX) {
            return hougaku_E;

        } else if (offsetY < ARI_ARI) {
            return hougaku_N;

        } else if (TILE_IPPEN - ARI_ARI * 2 < offsetY) {
            return hougaku_S;

        }

        return undefined;
    }

    function pickupMapBlock(id: string): MapBlock {
        id.match(/tile_(\d+)_(\d+)/);
        let x = Number(RegExp.$1);
        let y = Number(RegExp.$2);
        let mapBlock = _mapBlockMatrix[y][x];

        return mapBlock;
    }

    function clickTile(evt: MouseEvent): void {
        let tile = evt.target;
        if (!(tile instanceof HTMLElement)) {
            return;
        }

        let mapBlock = pickupMapBlock(tile.id);
        _currentMapBlock = mapBlock;

        let hougaku: Hougaku | undefined = getHougaku(evt);
        if (hougaku == undefined) {
            refresh();
            return;
        }

        let kabe: number = mapBlock[hougaku.char];
        kabe++;
        if (kabeHairetsu.length <= kabe) {
            kabe = 0;
        }
        mapBlock[hougaku.char] = kabeHairetsu[kabe];

        refresh();

        save();
    }

    function mousemoveTile(evt: MouseEvent): void {
        let tile = evt.target;
        if (!(tile instanceof HTMLElement)) {
            return;
        }

        let hougaku: Hougaku | undefined = getHougaku(evt);
        if (hougaku == undefined) {
            writeTile(tile);
            return;
        }

        tile.style[hougaku.borderStyleName] = 'red ' + String(ARI_ARI) + 'px solid';

        let mapBlock: MapBlock = pickupMapBlock(tile.id);
        let hantai: HougakuChar;

        if (hougaku.char == 'W' || hougaku.char == 'E') {
            if (hougaku.char == 'W') {
                hantai = 'E';
            } else {
                hantai = 'W';
            }
            tile.style.width = String(TILE_IPPEN - (ARI_ARI + (mapBlock[hantai] != MU ? (ARI_ARI - MU_FUTOSA) : 0) - MU_FUTOSA)) + 'px';

        } else if (hougaku.char == 'N' || hougaku.char == 'S') {
            if (hougaku.char == 'N') {
                hantai = 'S';
            } else {
                hantai = 'N';
            }
            tile.style.height = String(TILE_IPPEN - (ARI_ARI + (mapBlock[hantai] != MU ? (ARI_ARI - MU_FUTOSA) : 0) - MU_FUTOSA)) + 'px';

        }

    }

    function mouseoutTile(evt: MouseEvent): void {
        let tile = evt.target;
        if (!(tile instanceof HTMLElement)) {
            return;
        }

        writeTile(tile);
    }

    function writeTile(tile: HTMLElement): void {

        let mapBlock: MapBlock = pickupMapBlock(tile.id);

        let tate_line_futosa = 0;
        let yoko_line_futosa = 0;

        let hougakuHairetsu: Hougaku[] = [hougaku_N, hougaku_E, hougaku_S, hougaku_W];
        for (let i = 0, len = hougakuHairetsu.length; i < len; i++) {
            let hougaku = hougakuHairetsu[i];

            let style: string = '';
            let line_futosa: number = 0;

            if (mapBlock[hougaku.char] == MU) {
                style = 'black ' + String(MU_FUTOSA) + 'px dotted';
                line_futosa = MU_FUTOSA;

            } else if (mapBlock[hougaku.char] == KABE) {
                style = 'black ' + String(ARI_ARI) + 'px solid';
                line_futosa = ARI_ARI;

            } else if (mapBlock[hougaku.char] == DOOR) {
                style = 'black ' + String(ARI_ARI) + 'px dashed';
                line_futosa = ARI_ARI;

            }

            tile.style[hougaku.borderStyleName] = style;

            if (hougaku.char == 'W' || hougaku.char == 'E') {
                yoko_line_futosa += line_futosa;

            } else if (hougaku.char == 'N' || hougaku.char == 'S') {
                tate_line_futosa += line_futosa;

            }

        }

        tile.style.width = String(TILE_IPPEN - (yoko_line_futosa - 2)) + 'px';
        tile.style.height = String(TILE_IPPEN - (tate_line_futosa - 2)) + 'px';
    }

    function save(): void {
        let element = document.getElementById('maptext');
        if (!(element instanceof HTMLTextAreaElement)) {
            return;
        }
        element.value = JSON.stringify(_mapBlockMatrix);
    }

    function clickLoad(): void {
        let element = document.getElementById('maptext');
        if (!(element instanceof HTMLTextAreaElement)) {
            return;
        }

        _mapBlockMatrix = eval(element.value);

        refresh();
    }

    function refresh(): void {
        for (let y = 0, ylen = _mapBlockMatrix.length; y < ylen; y++) {
            let x_hairetsu = _mapBlockMatrix[y];
            for (let x = 0, xlen = x_hairetsu.length; x < xlen; x++) {
                _mapBlockMatrix[y][x].x = x;
                _mapBlockMatrix[y][x].y = y;
            }
        }

        let currentId = 'tile_' + String(_currentMapBlock.x) + '_' + String(_currentMapBlock.y);

        for (let i = 0, len = _board.childNodes.length; i < len; i++) {
            let tile = _board.childNodes[i];
            if (tile instanceof HTMLElement && tile.id.match(/^tile_/)) {
                writeTile(tile);

                tile.style.backgroundColor = (tile.id == currentId) ? 'pink' : '';
            }
        }
    }

    function clickKaiten(): void {
        let movedMatrix: MapBlock[][] = [];

        for (let i = 0; i < MAP_IPPEN; i++) {
            movedMatrix[i] = [];
        }

        for (let y = 0, ylen = _mapBlockMatrix.length; y < ylen; y++) {
            let x_hairetsu = _mapBlockMatrix[y];
            for (let x = 0, xlen = x_hairetsu.length; x < xlen; x++) {
                let mapBlock = _mapBlockMatrix[xlen - 1 - y][x];

                let swap: Kabe = mapBlock.W;
                mapBlock.W = mapBlock.S;
                mapBlock.S = mapBlock.E;
                mapBlock.E = mapBlock.N;
                mapBlock.N = swap;

                movedMatrix[x][y] = mapBlock;
            }
        }

        _mapBlockMatrix = movedMatrix;

        refresh();
    }

    let _currentMapBlock: MapBlock = new MapBlock();

    function clickCenter(): void {
        if (_currentMapBlock.x < 0 || _currentMapBlock.y < 0) {
            return;
        }

        let movedMatrix: MapBlock[][] = [];

        for (let i = 0; i < MAP_IPPEN; i++) {
            movedMatrix[i] = [];
        }

        let offsetX = MAP_IPPEN / 2 - _currentMapBlock.x;
        let offsetY = MAP_IPPEN / 2 - _currentMapBlock.y;

        for (let y = 0, ylen = _mapBlockMatrix.length; y < ylen; y++) {
            let yadd;
            if (0 <= offsetY) {
                yadd = offsetY + y;
            } else {
                yadd = (_mapBlockMatrix.length + offsetY) + y;
            }
            if (_mapBlockMatrix.length <= yadd) {
                yadd -= _mapBlockMatrix.length;
            }

            let x_hairetsu = _mapBlockMatrix[y];
            for (let x = 0, xlen = x_hairetsu.length; x < xlen; x++) {
                let xadd;
                if (0 <= offsetX) {
                    xadd = offsetX + x;
                } else {
                    xadd = (x_hairetsu.length + offsetX) + x;
                }
                if (x_hairetsu.length <= xadd) {
                    xadd -= x_hairetsu.length;
                }
                movedMatrix[yadd][xadd] = _mapBlockMatrix[y][x];
            }
        }

        _mapBlockMatrix = movedMatrix;

        _currentMapBlock = _mapBlockMatrix[MAP_IPPEN / 2][MAP_IPPEN / 2];

        refresh();
    }

}
