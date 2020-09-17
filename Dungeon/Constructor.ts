namespace Dungeon {

    const MAP_IPPEN = 24;

    const TILE_IPPEN = 48;
    const MU_FUTOSA = 1;
    const ARI_ARI = 6;

    let _board: HTMLElement;

    type HougakuChar = 'N' | 'E' | 'S' | 'W';

    type BorderStyleName = 'borderTop' | 'borderRight' | 'borderBottom' | 'borderLeft';

    function getBorderStyleName(hougaku: HougakuChar): BorderStyleName & keyof CSSStyleDeclaration {
        if (hougaku == 'N') {
            return 'borderTop';

        } else if (hougaku == 'E') {
            return 'borderRight';

        } if (hougaku == 'S') {
            return 'borderBottom';

        } else if (hougaku == 'W') {
            return 'borderLeft';

        }

        throw hougaku;
    }

    type KabeType = 0 | 1 | 2;

    const MU: KabeType = 0;
    const KABE: KabeType = 1;
    const DOOR: KabeType = 2;

    let kabeHairetsu: KabeType[] = [MU, KABE, DOOR];

    class MapBlock {
        x: number = -1;
        y: number = -1;

        N: KabeType = MU;
        E: KabeType = MU;
        S: KabeType = MU;
        W: KabeType = MU;
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
                element.addEventListener('click', load);
            }
        }
        {
            let element = document.getElementById('kaiten_button');
            if (element != null) {
                element.addEventListener('click', kaiten);
            }
        }
    });

    function getHougaku(evt: MouseEvent): HougakuChar | undefined {
        let offsetX = evt.offsetX;
        let offsetY = evt.offsetY;

        if (offsetX < ARI_ARI) {
            return 'W';

        } else if (TILE_IPPEN - ARI_ARI * 2 < offsetX) {
            return 'E';

        } else if (offsetY < ARI_ARI) {
            return 'N';

        } else if (TILE_IPPEN - ARI_ARI * 2 < offsetY) {
            return 'S';

        }

        return undefined;
    }

    function clickTile(evt: MouseEvent): void {
        let tile = evt.target;
        if (!(tile instanceof HTMLElement)) {
            return;
        }

        let hougaku: HougakuChar | undefined = getHougaku(evt);
        if (hougaku == undefined) {
            return;
        }

        let mapBlock = pickupMapBlock(tile.id);

        let kabe: number = mapBlock[hougaku];
        kabe++;
        if (kabeHairetsu.length <= kabe) {
            kabe = 0;
        }
        mapBlock[hougaku] = kabeHairetsu[kabe];

        writeTile(tile);

        save();
    }

    function pickupMapBlock(id: string): MapBlock {
        id.match(/tile_(\d+)_(\d+)/);
        let x = Number(RegExp.$1);
        let y = Number(RegExp.$2);
        let mapBlock = _mapBlockMatrix[y][x];

        return mapBlock;
    }

    function mousemoveTile(evt: MouseEvent): void {
        let tile = evt.target;
        if (!(tile instanceof HTMLElement)) {
            return;
        }

        let hougaku = getHougaku(evt);
        if (hougaku == undefined) {
            writeTile(tile);
            return;
        }

        let borderStyleName = getBorderStyleName(hougaku);
        tile.style[borderStyleName] = 'red ' + String(ARI_ARI) + 'px solid';

        let mapBlock: MapBlock = pickupMapBlock(tile.id);
        let hantai: HougakuChar;

        if (hougaku == 'W' || hougaku == 'E') {
            if (hougaku == 'W') {
                hantai = 'E';
            } else {
                hantai = 'W';
            }
            tile.style.width = String(TILE_IPPEN - (ARI_ARI + (mapBlock[hantai] != MU ? (ARI_ARI - MU_FUTOSA) : 0) - MU_FUTOSA)) + 'px';

        } else if (hougaku == 'N' || hougaku == 'S') {
            if (hougaku == 'N') {
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

        let tate_tsukattabun = 0;
        let yoko_tsukattabun = 0;

        let hougakuHairetsu: HougakuChar[] = ['N', 'E', 'S', 'W'];
        for (let i = 0, len = hougakuHairetsu.length; i < len; i++) {
            let hougaku = hougakuHairetsu[i];

            let style: string = '';
            let tsukattabun: number = 0;

            if (mapBlock[hougaku] == MU) {
                style = 'black ' + String(MU_FUTOSA) + 'px dotted';
                tsukattabun = MU_FUTOSA;

            } else if (mapBlock[hougaku] == KABE) {
                style = 'black ' + String(ARI_ARI) + 'px solid';
                tsukattabun = ARI_ARI;

            } else if (mapBlock[hougaku] == DOOR) {
                style = 'black ' + String(ARI_ARI) + 'px dashed';
                tsukattabun = ARI_ARI;

            }

            let borderStyleName: BorderStyleName = getBorderStyleName(hougaku);
            tile.style[borderStyleName] = style;

            if (hougaku == 'W' || hougaku == 'E') {
                yoko_tsukattabun += tsukattabun;

            } else if (hougaku == 'N' || hougaku == 'S') {
                tate_tsukattabun += tsukattabun;

            }

        }

        tile.style.width = String(TILE_IPPEN - (yoko_tsukattabun - 2)) + 'px';
        tile.style.height = String(TILE_IPPEN - (tate_tsukattabun - 2)) + 'px';
    }

    function save(): void {
        let element = document.getElementById('maptext');
        if (!(element instanceof HTMLTextAreaElement)) {
            return;
        }
        element.value = JSON.stringify(_mapBlockMatrix);
    }

    function load(): void {
        let element = document.getElementById('maptext');
        if (!(element instanceof HTMLTextAreaElement)) {
            return;
        }

        _mapBlockMatrix = eval(element.value);

        refresh();
    }

    function refresh(): void {
        for (let i = 0, len = _board.childNodes.length; i < len; i++) {
            let tile = _board.childNodes[i];
            if (tile instanceof HTMLElement && tile.id.match(/^tile_/)) {
                writeTile(tile);
            }
        }
    }

    function kaiten(): void {
        let rotation: MapBlock[][] = [];

        for (let i = 0; i < MAP_IPPEN; i++) {
            rotation[i] = [];
        }

        for (let y = 0, ylen = _mapBlockMatrix.length; y < ylen; y++) {
            let x_hairetsu = _mapBlockMatrix[y];
            for (let x = 0, xlen = x_hairetsu.length; x < xlen; x++) {
                let mapBlock = _mapBlockMatrix[xlen - 1 - y][x];

                let swap: KabeType = mapBlock.W;
                mapBlock.W = mapBlock.S;
                mapBlock.S = mapBlock.E;
                mapBlock.E = mapBlock.N;
                mapBlock.N = swap;

                rotation[x][y] = mapBlock;
            }
        }

        _mapBlockMatrix = rotation;

        refresh();
    }

}
