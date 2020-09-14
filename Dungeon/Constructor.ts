namespace Dungeon {

    const ippen = 48;

    const tile_ippen = 24;

    const mu_futosa = 1;
    const futosa = 6;

    let _board: HTMLElement;

    type KabeType = 0 | 1 | 2;

    const MU: KabeType = 0;
    const KABE: KabeType = 1;
    const DOOR: KabeType = 2;

    let kabeHairetsu: KabeType[] = [MU, KABE, DOOR];

    class Tile {
        x: number = -1;
        y: number = -1;

        N: KabeType = MU;
        E: KabeType = MU;
        S: KabeType = MU;
        W: KabeType = MU;
    }

    let _mapData: Tile[][] = [];

    window.addEventListener('load', (): void => {

        {
            let element = document.getElementById('board');
            if (element == null) {
                return;
            }
            _board = element;
            _board.style.border = 'black 1px solid';
            _board.style.padding = '4px';
            _board.style.width = String(ippen * 32) + 'px';
            _board.style.height = String(ippen * 32) + 'px';
            _board.style.verticalAlign = 'top';
        }

        document.body.appendChild(_board);

        for (let y = 0; y < tile_ippen; y++) {
            let x_hairetsu: Tile[] = [];
            for (let x = 0; x < tile_ippen; x++) {
                let tile = document.createElement('div');
                tile.id = 'tile_' + String(x) + '_' + String(y);
                tile.style.display = 'inline-block';
                tile.style.margin = '0px';
                tile.style.border = 'black ' + String(mu_futosa) + 'px dotted';
                tile.style.width = String(ippen) + 'px';
                tile.style.height = String(ippen) + 'px';
                tile.style.verticalAlign = 'top';
                tile.innerHTML = '&nbsp;';

                tile.addEventListener('click', clickTile);
                tile.addEventListener('mousemove', mousemoveTile);
                tile.addEventListener('mouseout', mouseoutTile);

                _board.appendChild(tile);

                let tileObj: Tile = new Tile();
                tileObj.x = x;
                tileObj.y = y;

                x_hairetsu.push(tileObj);
            }

            _mapData.push(x_hairetsu);

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

        let tileObj = pickupTileObj(tile.id);

        let offsetX = evt.offsetX;
        let offsetY = evt.offsetY;

        if (offsetX < futosa) {
            let kabe: number = tileObj.W;
            kabe++;
            if (kabeHairetsu.length <= kabe) {
                kabe = 0;
            }
            tileObj.W = kabeHairetsu[kabe];

        } else if (ippen - futosa * 2 < offsetX) {
            let kabe: number = tileObj.E;
            kabe++;
            if (kabeHairetsu.length <= kabe) {
                kabe = 0;
            }
            tileObj.E = kabeHairetsu[kabe];

        } else if (offsetY < futosa) {
            let kabe: number = tileObj.N;
            kabe++;
            if (kabeHairetsu.length <= kabe) {
                kabe = 0;
            }
            tileObj.N = kabeHairetsu[kabe];

        } else if (ippen - futosa * 2 < offsetY) {
            let kabe: number = tileObj.S;
            kabe++;
            if (kabeHairetsu.length <= kabe) {
                kabe = 0;
            }
            tileObj.S = kabeHairetsu[kabe];

        }

        writeTile(tile);

        save();
    }

    function pickupTileObj(id: string): Tile {
        id.match(/tile_(\d+)_(\d+)/);
        let x = Number(RegExp.$1);
        let y = Number(RegExp.$2);
        let tileObj = _mapData[y][x];

        return tileObj;
    }

    function mousemoveTile(evt: MouseEvent): void {
        let tile = evt.target;
        if (!(tile instanceof HTMLElement)) {
            return;
        }

        let tileObj: Tile = pickupTileObj(tile.id);

        let offsetX = evt.offsetX;
        let offsetY = evt.offsetY;

        if (offsetX < futosa) {
            tile.style.borderLeft = 'red ' + String(futosa) + 'px solid';
            tile.style.width = String(ippen - (futosa + (tileObj.E != MU ? 5 : 0) - mu_futosa)) + 'px';
        } else if (ippen - futosa * 2 < offsetX) {
            tile.style.borderRight = 'red ' + String(futosa) + 'px solid';
            tile.style.width = String(ippen - (futosa + (tileObj.W != MU ? 5 : 0) - mu_futosa)) + 'px';
        } else if (offsetY < futosa) {
            tile.style.borderTop = 'red ' + String(futosa) + 'px solid';
            tile.style.height = String(ippen - (futosa + (tileObj.S != MU ? 5 : 0) - mu_futosa)) + 'px';
        } else if (ippen - futosa * 2 < offsetY) {
            tile.style.borderBottom = 'red ' + String(futosa) + 'px solid';
            tile.style.height = String(ippen - (futosa + (tileObj.N != MU ? 5 : 0) - mu_futosa)) + 'px';
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

        let tileObj: Tile = pickupTileObj(tile.id);

        let tate_futosa = 0;
        if (tileObj.N == MU) {
            tile.style.borderTop = 'black ' + String(mu_futosa) + 'px dotted';
            tate_futosa += mu_futosa;
        } else if (tileObj.N == KABE) {
            tile.style.borderTop = 'black ' + String(futosa) + 'px solid';
            tate_futosa += futosa;
        } else if (tileObj.N == DOOR) {
            tile.style.borderTop = 'black ' + String(futosa) + 'px dashed';
            tate_futosa += futosa;
        }
        if (tileObj.S == MU) {
            tile.style.borderBottom = 'black ' + String(mu_futosa) + 'px dotted';
            tate_futosa += mu_futosa;
        } else if (tileObj.S == KABE) {
            tile.style.borderBottom = 'black ' + String(futosa) + 'px solid';
            tate_futosa += futosa;
        } else if (tileObj.S == DOOR) {
            tile.style.borderBottom = 'black ' + String(futosa) + 'px dashed';
            tate_futosa += futosa;
        }
        tile.style.height = String(ippen - (tate_futosa - 2)) + 'px';

        let yoko_futosa = 0;
        if (tileObj.W == MU) {
            tile.style.borderLeft = 'black ' + String(mu_futosa) + 'px dotted';
            yoko_futosa += mu_futosa;
        } else if (tileObj.W == KABE) {
            tile.style.borderLeft = 'black ' + String(futosa) + 'px solid';
            yoko_futosa += futosa;
        } else if (tileObj.W == DOOR) {
            tile.style.borderLeft = 'black ' + String(futosa) + 'px dashed';
            yoko_futosa += futosa;
        }
        if (tileObj.E == MU) {
            tile.style.borderRight = 'black ' + String(mu_futosa) + 'px dotted';
            yoko_futosa += mu_futosa;
        } else if (tileObj.E == KABE) {
            tile.style.borderRight = 'black ' + String(futosa) + 'px solid';
            yoko_futosa += futosa;
        } else if (tileObj.E == DOOR) {
            tile.style.borderRight = 'black ' + String(futosa) + 'px dashed';
            yoko_futosa += futosa;
        }
        tile.style.width = String(ippen - (yoko_futosa - 2)) + 'px';
    }

    function save(): void {
        let element = document.getElementById('maptext');
        if (!(element instanceof HTMLTextAreaElement)) {
            return;
        }
        element.value = JSON.stringify(_mapData);
    }

    function load(): void {
        let element = document.getElementById('maptext');
        if (!(element instanceof HTMLTextAreaElement)) {
            return;
        }

        _mapData = eval(element.value);

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
        let rotation: Tile[][] = [];

        for (let i = 0; i < tile_ippen; i++) {
            rotation[i] = [];
        }

        for (let y = 0, ylen = _mapData.length; y < ylen; y++) {
            let x_hairetsu = _mapData[y];
            for (let x = 0, xlen = x_hairetsu.length; x < xlen; x++) {
                let tailObj = _mapData[xlen - 1 - y][x];

                let swap: KabeType = tailObj.W;
                tailObj.W = tailObj.S;
                tailObj.S = tailObj.E;
                tailObj.E = tailObj.N;
                tailObj.N = swap;

                rotation[x][y] = tailObj;
            }
        }

        _mapData = rotation;

        refresh();
    }

}
