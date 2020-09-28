namespace Dungeon {

    const MAP_IPPEN = 16;

    const TILE_IPPEN = 48;
    const MU_FUTOSA = 1;
    const ARI_FUTOSA = 2;
    const HANNOU = 6;

    const STORAGE_HEADER = 'MAP_STORAGE_';
    let _map_list: HTMLSelectElement;
    let _map_name: HTMLInputElement;
    let _memo: HTMLInputElement;
    let _board: HTMLElement;
    let _map_text: HTMLTextAreaElement;

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

    class MapBlock {
        x: number = -1;
        y: number = -1;

        N: Kabe = MU;
        E: Kabe = MU;
        S: Kabe = MU;
        W: Kabe = MU;

        memo: string | undefined = undefined;
    }

    let _map_ippen: number = 0;
    let _mapBlockMatrix: MapBlock[][] = [];

    function getElementById(elementId: string): HTMLInputElement {
        let element = document.getElementById(elementId);
        if (element instanceof HTMLInputElement) {
            return element;
        }
        throw elementId;
    }

    window.addEventListener('load', (): void => {

        {
            let element = document.getElementById('map_list');
            if (!(element instanceof HTMLSelectElement)) {
                return;
            }
            _map_list = element;

            {
                let option = document.createElement('option');
                option.value = '';
                option.text = '';
                _map_list.options.add(option);
            }

            let mapNameListText: string | null = window.localStorage.getItem(STORAGE_HEADER + 'map_list');
            if (mapNameListText != null) {
                let mapNameList: string[] = mapNameListText.split('\t');
                for (let i = 0, len = mapNameList.length; i < len; i++) {
                    let mapName = mapNameList[i];
                    if (mapName.trim() != '') {
                        let option = document.createElement('option');
                        option.value = mapName;
                        option.text = mapName;
                        _map_list.options.add(option);
                    }
                }
            }

            _map_list.addEventListener('change', changeMapList);
        }

        _map_name = getElementById('map_name');
        _map_name.addEventListener('change', changeMapName);
        _map_name.value = '';

        getElementById('del_button').addEventListener('click', clickMapDel);

        getElementById('map_ippen').addEventListener('keypress', keypressMapIppen);
        getElementById('load_button').addEventListener('click', load);
        getElementById('hanten_button').addEventListener('click', clickHanten);
        getElementById('center_button').addEventListener('click', clickCenter);
        getElementById('kaiten_button').addEventListener('click', clickKaiten);

        _memo = getElementById('memo');
        _memo.addEventListener('change', changeMemo);

        {
            let element = document.getElementById('board');
            if (element == null) {
                return;
            }
            _board = element;
            _board.style.border = 'black 1px solid';
            _board.style.padding = '4px';
            _board.style.width = String(TILE_IPPEN * 32 + 64) + 'px';
            _board.style.verticalAlign = 'top';
        }

        {
            let element = document.getElementById('map_text');
            if (!(element instanceof HTMLTextAreaElement)) {
                return;
            }
            _map_text = element;
        }

        getElementById('backup_button').addEventListener('click', clickBackup);

        createMatrix(MAP_IPPEN);
    });

    function changeMapList(): void {
        let mapName = _map_list.value;
        _map_name.value = mapName;

        let mapText: string | null = window.localStorage.getItem(STORAGE_HEADER + 'NAME_' + mapName);
        if (mapText == null) {
            createMatrix(MAP_IPPEN);
            return;
        }

        _map_text.value = mapText;

        let mapBlockMatrix: MapBlock[][] = eval(_map_text.value);
        if (mapBlockMatrix.length != _map_ippen) {
            createMatrix(mapBlockMatrix.length);
        }

        load();
    }

    function changeMapName(): void {
        let mapName = _map_name.value;

        for (let i = 0, len = _map_list.options.length; i < len; i++) {
            let option: HTMLOptionElement | null = _map_list.options.item(i);
            if (option != null) {
                if (option.value == mapName) {
                    _map_list.selectedIndex = i;
                    changeMapList();
                    return;
                }
            }
        }

        let option = document.createElement('option');
        option.value = mapName;
        option.text = mapName;
        _map_list.options.add(option);
        option.selected = true;

        createMatrix(MAP_IPPEN);

        saveMapList();
    }

    function clickMapDel(): void {
        let mapName = _map_list.value;

        let index = _map_list.selectedIndex;
        _map_list.options.remove(index);
        window.localStorage.removeItem(STORAGE_HEADER + 'NAME_' + mapName);

        _map_name.value = '';

        saveMapList();
    }

    function saveMapList() {
        let mapNameList: string[] = [];
        for (let i = 0, len = _map_list.options.length; i < len; i++) {
            let option: HTMLOptionElement | null = _map_list.options.item(i);
            if (option != null) {
                mapNameList.push(option.value);
            }
        }

        mapNameList.sort();

        let mapNameListText = mapNameList.join('\t');

        window.localStorage.setItem(STORAGE_HEADER + 'map_list', mapNameListText);
    }

    function keypressMapIppen(evt: KeyboardEvent): void {
        if (evt.key != 'Enter') {
            return;
        }

        let element = getElementById('map_ippen');
        if (element.value == '') {
            return;
        }

        let map_ippen: number = Number(element.value);
        if (isNaN(map_ippen)) {
            return;
        }
        if (map_ippen % 2 != 0) {
            return;
        }

        let mapBlockMatrix: MapBlock[][] = cloneMapBlockMatrix(_mapBlockMatrix);

        createMatrix(map_ippen);

        copyMapBlockMatrix(mapBlockMatrix, _mapBlockMatrix);

        refresh();
    }

    function cloneMapBlockMatrix(mapBlockMatrix: MapBlock[][]): MapBlock[][] {
        let cloned: MapBlock[][] = [];
        for (let y = 0, ylen = mapBlockMatrix.length; y < ylen; y++) {
            let x_hairetsu: MapBlock[] = mapBlockMatrix[y];
            let x_cloned: MapBlock[] = [];
            for (let x = 0, xlen = x_hairetsu.length; x < xlen; x++) {
                x_cloned.push(x_hairetsu[x]);
            }
            cloned.push(x_cloned);
        }
        return cloned;
    }

    /**
     * matrix1をmatrix2にコピーするが、x:0,y:0から小さいほうのサイズまで
     */
    function copyMapBlockMatrix(matrix1: MapBlock[][], matrix2: MapBlock[][]) {
        for (let y = 0, ylen1 = matrix1.length, ylen2 = matrix2.length; y < ylen1 && y < ylen2; y++) {
            let x_hairetsu1: MapBlock[] = matrix1[y];
            let x_hairetsu2: MapBlock[] = matrix2[y];
            for (let x = 0, xlen1 = x_hairetsu1.length, xlen2 = x_hairetsu2.length; x < xlen1 && x < xlen2; x++) {
                x_hairetsu2[x] = x_hairetsu1[x];
            }
        }
    }

    function createMatrix(map_ippen: number): void {
        _map_ippen = map_ippen;

        let element = getElementById('map_ippen');
        element.value = String(_map_ippen);

        _board.textContent = '';
        _mapBlockMatrix.length = 0;

        for (let y = 0; y < _map_ippen; y++) {
            let x_hairetsu: MapBlock[] = [];
            for (let x = 0; x < _map_ippen; x++) {
                let tile = document.createElement('div');
                tile.id = 'tile_' + String(x) + '_' + String(y);
                tile.style.display = 'inline-block';
                tile.style.margin = '0px';
                tile.style.border = 'black ' + String(MU_FUTOSA) + 'px dotted';
                tile.style.width = String(TILE_IPPEN) + 'px';
                tile.style.height = String(TILE_IPPEN) + 'px';
                tile.style.verticalAlign = 'middle';
                tile.style.textAlign = 'center';
                tile.innerHTML = '&nbsp;';

                tile.addEventListener('click', clickTile);
                tile.addEventListener('dblclick', dblclickTile);
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
    }

    function getHougaku(evt: MouseEvent): Hougaku | undefined {
        let offsetX = evt.offsetX;
        let offsetY = evt.offsetY;

        if (offsetX < HANNOU) {
            return hougaku_W;

        } else if (TILE_IPPEN - HANNOU * 2 < offsetX) {
            return hougaku_E;

        } else if (offsetY < HANNOU) {
            return hougaku_N;

        } else if (TILE_IPPEN - HANNOU * 2 < offsetY) {
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

        let hougaku: Hougaku | undefined = getHougaku(evt);
        if (hougaku == undefined) {
            refresh();
            return;
        }

        let kabe: Kabe;
        if (evt.shiftKey) {
            kabe = MU;
        } else if (evt.ctrlKey) {
            kabe = KABE;
        } else if (evt.altKey) {
            kabe = DOOR;
        } else {
            return;
        }

        mapBlock[hougaku.char] = kabe;

        refresh();

        save();
    }

    function dblclickTile(evt: MouseEvent): void {
        let tile = evt.target;
        if (!(tile instanceof HTMLElement)) {
            return;
        }

        let mapBlock = pickupMapBlock(tile.id);
        _currentMapBlock = mapBlock;

        _memo.value = _currentMapBlock.memo || '';

        refresh();
    }

    function mousemoveTile(evt: MouseEvent): void {
        let tile = evt.target;
        if (!(tile instanceof HTMLElement)) {
            return;
        }

        writeTile(tile);

        let hougaku: Hougaku | undefined = getHougaku(evt);
        if (hougaku == undefined) {
            return;
        }

        tile.style[hougaku.borderStyleName] = 'red ' + String(HANNOU) + 'px solid';

        let mapBlock: MapBlock = pickupMapBlock(tile.id);
        let hantai: HougakuChar;

        if (hougaku.char == 'W' || hougaku.char == 'E') {
            if (hougaku.char == 'W') {
                hantai = 'E';
            } else {
                hantai = 'W';
            }
            tile.style.width = String(TILE_IPPEN - (HANNOU + (mapBlock[hantai] != MU ? (ARI_FUTOSA - MU_FUTOSA) : 0) - MU_FUTOSA)) + 'px';

        } else if (hougaku.char == 'N' || hougaku.char == 'S') {
            if (hougaku.char == 'N') {
                hantai = 'S';
            } else {
                hantai = 'N';
            }
            tile.style.height = String(TILE_IPPEN - (HANNOU + (mapBlock[hantai] != MU ? (ARI_FUTOSA - MU_FUTOSA) : 0) - MU_FUTOSA)) + 'px';

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
                style = 'black ' + String(ARI_FUTOSA) + 'px solid';
                line_futosa = ARI_FUTOSA;

            } else if (mapBlock[hougaku.char] == DOOR) {
                style = 'black ' + String(ARI_FUTOSA) + 'px dashed';
                line_futosa = ARI_FUTOSA;

            }

            tile.style[hougaku.borderStyleName] = style;

            if (hougaku.char == 'W' || hougaku.char == 'E') {
                yoko_line_futosa += line_futosa;

            } else if (hougaku.char == 'N' || hougaku.char == 'S') {
                tate_line_futosa += line_futosa;

            }
        }

        let memo: string = mapBlock.memo || '';
        tile.textContent = 0 < memo.length ? memo.charAt(0) : '';

        tile.style.width = String(TILE_IPPEN - (yoko_line_futosa - 2)) + 'px';
        tile.style.height = String(TILE_IPPEN - (tate_line_futosa - 2)) + 'px';
    }

    function save(): void {
        let mapText = JSON.stringify(_mapBlockMatrix);
        _map_text.value = mapText;

        let mapName = _map_name.value;
        if (mapName != '') {
            window.localStorage.setItem(STORAGE_HEADER + 'NAME_' + mapName, mapText);
        }
    }

    function load(): void {
        let mapBlockMatrix: MapBlock[][] = eval(_map_text.value);

        _mapBlockMatrix.length = 0;
        for (let y = 0; y < _map_ippen; y++) {
            let x_hairetsu: MapBlock[] = [];
            for (let x = 0; x < _map_ippen; x++) {
                let mapBlock: MapBlock | undefined = undefined;
                if (y < mapBlockMatrix.length) {
                    mapBlock = mapBlockMatrix[y][x];
                }
                if (mapBlock == undefined) {
                    mapBlock = new MapBlock();
                }
                mapBlock.x = x;
                mapBlock.y = y;

                x_hairetsu.push(mapBlock);
            }

            _mapBlockMatrix.push(x_hairetsu);
        }

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

        let mawariIdArray: string[] = [];
        for (let x = -1; x <= 1; x++) {
            for (let y = -2; y <= 2; y++) {
                // マイナスになってもヒットしないだけ
                let mawariId = 'tile_' + String(_currentMapBlock.x + x) + '_' + String(_currentMapBlock.y + y);
                mawariIdArray.push(mawariId);
            }
        }

        for (let i = 0, len = _board.childNodes.length; i < len; i++) {
            let tile = _board.childNodes[i];
            if (tile instanceof HTMLElement && tile.id.match(/^tile_/)) {
                writeTile(tile);

                let backgroundColor = '';

                if (tile.id == currentId) {
                    backgroundColor = 'pink';
                } else {
                    for (let m = 0, mlen = mawariIdArray.length; m < mlen; m++) {
                        if (tile.id == mawariIdArray[m]) {
                            backgroundColor = 'lightblue';
                            break;
                        }
                    }
                }

                tile.style.backgroundColor = backgroundColor;
            }
        }
    }

    let _currentMapBlock: MapBlock = new MapBlock();

    function clickCenter(): void {
        if (_currentMapBlock.x < 0 || _currentMapBlock.y < 0) {
            return;
        }

        let offsetX = _map_ippen / 2 - _currentMapBlock.x;
        let offsetY = _map_ippen / 2 - _currentMapBlock.y;

        _mapBlockMatrix = centering(_mapBlockMatrix, offsetY, offsetX);

        _currentMapBlock = _mapBlockMatrix[_map_ippen / 2][_map_ippen / 2];

        refresh();
    }

    function clickKaiten(): void {
        let offsetX = _map_ippen / 2 - _currentMapBlock.x;
        let offsetY = _map_ippen / 2 - _currentMapBlock.y;

        _mapBlockMatrix = centering(_mapBlockMatrix, offsetY, offsetX);
        _mapBlockMatrix = rotarion(_mapBlockMatrix);
        _mapBlockMatrix = centering(_mapBlockMatrix, offsetY * -1, offsetX * -1 + 1);

        refresh();
    }

    function clickHanten(): void {
        let offsetX = _map_ippen / 2 - _currentMapBlock.x;
        let offsetY = _map_ippen / 2 - _currentMapBlock.y;

        _mapBlockMatrix = centering(_mapBlockMatrix, offsetY, offsetX);
        _mapBlockMatrix = rotarion(_mapBlockMatrix);
        _mapBlockMatrix = rotarion(_mapBlockMatrix);
        _mapBlockMatrix = rotarion(_mapBlockMatrix);
        _mapBlockMatrix = centering(_mapBlockMatrix, offsetY * -1 + 1, offsetX * -1);

        refresh();
    }

    function centering(mapBlockMatrix: MapBlock[][], offsetY: number, offsetX: number): MapBlock[][] {
        let movedMatrix: MapBlock[][] = [];
        for (let i = 0; i < _map_ippen; i++) {
            movedMatrix[i] = [];
        }

        for (let y = 0, ylen = mapBlockMatrix.length; y < ylen; y++) {
            let yadd;
            if (0 <= offsetY) {
                yadd = offsetY + y;
            } else {
                yadd = (mapBlockMatrix.length + offsetY) + y;
            }
            if (mapBlockMatrix.length <= yadd) {
                yadd -= mapBlockMatrix.length;
            }

            let x_hairetsu = mapBlockMatrix[y];
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
                movedMatrix[yadd][xadd] = mapBlockMatrix[y][x];
            }
        }

        return movedMatrix;
    }

    function rotarion(mapBlockMatrix: MapBlock[][]): MapBlock[][] {
        let movedMatrix: MapBlock[][] = [];
        for (let i = 0; i < _map_ippen; i++) {
            movedMatrix[i] = [];
        }

        for (let y = 0, ylen = mapBlockMatrix.length; y < ylen; y++) {
            let x_hairetsu = mapBlockMatrix[y];
            for (let x = 0, xlen = x_hairetsu.length; x < xlen; x++) {
                let mapBlock = mapBlockMatrix[xlen - 1 - y][x];

                let swap: Kabe = mapBlock.W;
                mapBlock.W = mapBlock.S;
                mapBlock.S = mapBlock.E;
                mapBlock.E = mapBlock.N;
                mapBlock.N = swap;

                movedMatrix[x][y] = mapBlock;
            }
        }

        return movedMatrix;
    }

    function changeMemo(): void {
        if (_memo.value.trim() != '') {
            _currentMapBlock.memo = _memo.value;
        } else {
            _currentMapBlock.memo = undefined;
        }

        refresh();

        save();
    }

    function clickBackup(): void {
        let backupTextArray: string[] = [];
        let mapNameListText: string | null = window.localStorage.getItem(STORAGE_HEADER + 'map_list');
        if (mapNameListText != null) {
            let mapNameList: string[] = mapNameListText.split('\t');
            for (let i = 0, len = mapNameList.length; i < len; i++) {
                let mapName = mapNameList[i];
                let mapText: string | null = window.localStorage.getItem(STORAGE_HEADER + 'NAME_' + mapName);
                backupTextArray.push('{"name":"' + mapName + '","text":\n' + mapText + '\n}');
            }
        }
        let backupText: string = '[' + backupTextArray.join(',\n') + ']';
        copy(backupText);
    }

    function copy(text: string): void {
        let textArea: HTMLTextAreaElement = document.createElement('textarea');
        textArea.value = text;
        let body: HTMLBodyElement = document.getElementsByTagName('body')[0];
        body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        body.removeChild(textArea);
    }

}
