namespace Dungeon {

    const MAP_IPPEN = 48;

    const TILE_IPPEN = 24;
    const MU_FUTOSA = 1;
    const ARI_ARI = 6;

    let _board: HTMLElement;

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
            _board.style.width = String(MAP_IPPEN * 32) + 'px';
            _board.style.height = String(MAP_IPPEN * 32) + 'px';
            _board.style.verticalAlign = 'top';
        }

        document.body.appendChild(_board);

        for (let y = 0; y < TILE_IPPEN; y++) {
            let x_hairetsu: MapBlock[] = [];
            for (let x = 0; x < TILE_IPPEN; x++) {
                let tile = document.createElement('div');
                tile.id = 'tile_' + String(x) + '_' + String(y);
                tile.style.display = 'inline-block';
                tile.style.margin = '0px';
                tile.style.border = 'black ' + String(MU_FUTOSA) + 'px dotted';
                tile.style.width = String(MAP_IPPEN) + 'px';
                tile.style.height = String(MAP_IPPEN) + 'px';
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

    function clickTile(evt: MouseEvent): void {
        let tile = evt.target;
        if (!(tile instanceof HTMLElement)) {
            return;
        }

        let mapBlock = pickupMapBlock(tile.id);

        let offsetX = evt.offsetX;
        let offsetY = evt.offsetY;

        if (offsetX < ARI_ARI) {
            let kabe: number = mapBlock.W;
            kabe++;
            if (kabeHairetsu.length <= kabe) {
                kabe = 0;
            }
            mapBlock.W = kabeHairetsu[kabe];

        } else if (MAP_IPPEN - ARI_ARI * 2 < offsetX) {
            let kabe: number = mapBlock.E;
            kabe++;
            if (kabeHairetsu.length <= kabe) {
                kabe = 0;
            }
            mapBlock.E = kabeHairetsu[kabe];

        } else if (offsetY < ARI_ARI) {
            let kabe: number = mapBlock.N;
            kabe++;
            if (kabeHairetsu.length <= kabe) {
                kabe = 0;
            }
            mapBlock.N = kabeHairetsu[kabe];

        } else if (MAP_IPPEN - ARI_ARI * 2 < offsetY) {
            let kabe: number = mapBlock.S;
            kabe++;
            if (kabeHairetsu.length <= kabe) {
                kabe = 0;
            }
            mapBlock.S = kabeHairetsu[kabe];

        }

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

        let mapBlock: MapBlock = pickupMapBlock(tile.id);

        let offsetX = evt.offsetX;
        let offsetY = evt.offsetY;

        if (offsetX < ARI_ARI) {
            tile.style.borderLeft = 'red ' + String(ARI_ARI) + 'px solid';
            tile.style.width = String(MAP_IPPEN - (ARI_ARI + (mapBlock.E != MU ? 5 : 0) - MU_FUTOSA)) + 'px';
        } else if (MAP_IPPEN - ARI_ARI * 2 < offsetX) {
            tile.style.borderRight = 'red ' + String(ARI_ARI) + 'px solid';
            tile.style.width = String(MAP_IPPEN - (ARI_ARI + (mapBlock.W != MU ? 5 : 0) - MU_FUTOSA)) + 'px';
        } else if (offsetY < ARI_ARI) {
            tile.style.borderTop = 'red ' + String(ARI_ARI) + 'px solid';
            tile.style.height = String(MAP_IPPEN - (ARI_ARI + (mapBlock.S != MU ? 5 : 0) - MU_FUTOSA)) + 'px';
        } else if (MAP_IPPEN - ARI_ARI * 2 < offsetY) {
            tile.style.borderBottom = 'red ' + String(ARI_ARI) + 'px solid';
            tile.style.height = String(MAP_IPPEN - (ARI_ARI + (mapBlock.N != MU ? 5 : 0) - MU_FUTOSA)) + 'px';
        } else {
            writeTile(tile);
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

        let tate_futosa = 0;
        if (mapBlock.N == MU) {
            tile.style.borderTop = 'black ' + String(MU_FUTOSA) + 'px dotted';
            tate_futosa += MU_FUTOSA;
        } else if (mapBlock.N == KABE) {
            tile.style.borderTop = 'black ' + String(ARI_ARI) + 'px solid';
            tate_futosa += ARI_ARI;
        } else if (mapBlock.N == DOOR) {
            tile.style.borderTop = 'black ' + String(ARI_ARI) + 'px dashed';
            tate_futosa += ARI_ARI;
        }
        if (mapBlock.S == MU) {
            tile.style.borderBottom = 'black ' + String(MU_FUTOSA) + 'px dotted';
            tate_futosa += MU_FUTOSA;
        } else if (mapBlock.S == KABE) {
            tile.style.borderBottom = 'black ' + String(ARI_ARI) + 'px solid';
            tate_futosa += ARI_ARI;
        } else if (mapBlock.S == DOOR) {
            tile.style.borderBottom = 'black ' + String(ARI_ARI) + 'px dashed';
            tate_futosa += ARI_ARI;
        }
        tile.style.height = String(MAP_IPPEN - (tate_futosa - 2)) + 'px';

        let yoko_futosa = 0;
        if (mapBlock.W == MU) {
            tile.style.borderLeft = 'black ' + String(MU_FUTOSA) + 'px dotted';
            yoko_futosa += MU_FUTOSA;
        } else if (mapBlock.W == KABE) {
            tile.style.borderLeft = 'black ' + String(ARI_ARI) + 'px solid';
            yoko_futosa += ARI_ARI;
        } else if (mapBlock.W == DOOR) {
            tile.style.borderLeft = 'black ' + String(ARI_ARI) + 'px dashed';
            yoko_futosa += ARI_ARI;
        }
        if (mapBlock.E == MU) {
            tile.style.borderRight = 'black ' + String(MU_FUTOSA) + 'px dotted';
            yoko_futosa += MU_FUTOSA;
        } else if (mapBlock.E == KABE) {
            tile.style.borderRight = 'black ' + String(ARI_ARI) + 'px solid';
            yoko_futosa += ARI_ARI;
        } else if (mapBlock.E == DOOR) {
            tile.style.borderRight = 'black ' + String(ARI_ARI) + 'px dashed';
            yoko_futosa += ARI_ARI;
        }
        tile.style.width = String(MAP_IPPEN - (yoko_futosa - 2)) + 'px';
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

        for (let i = 0; i < TILE_IPPEN; i++) {
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
