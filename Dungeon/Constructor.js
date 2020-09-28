"use strict";
var Dungeon;
(function (Dungeon) {
    var MAP_IPPEN = 16;
    var TILE_IPPEN = 48;
    var MU_FUTOSA = 1;
    var ARI_FUTOSA = 2;
    var HANNOU = 6;
    var STORAGE_HEADER = 'MAP_STORAGE_';
    var _map_list;
    var _map_name;
    var _memo;
    var _board;
    var _map_text;
    var hougaku_N = {
        char: 'N',
        borderStyleName: 'borderTop'
    };
    var hougaku_E = {
        char: 'E',
        borderStyleName: 'borderRight'
    };
    var hougaku_S = {
        char: 'S',
        borderStyleName: 'borderBottom'
    };
    var hougaku_W = {
        char: 'W',
        borderStyleName: 'borderLeft'
    };
    var MU = 0;
    var KABE = 1;
    var DOOR = 2;
    var MapBlock = (function () {
        function MapBlock() {
            this.x = -1;
            this.y = -1;
            this.N = MU;
            this.E = MU;
            this.S = MU;
            this.W = MU;
            this.memo = undefined;
        }
        return MapBlock;
    }());
    var _map_ippen = 0;
    var _mapBlockMatrix = [];
    function getElementById(elementId) {
        var element = document.getElementById(elementId);
        if (element instanceof HTMLInputElement) {
            return element;
        }
        throw elementId;
    }
    window.addEventListener('load', function () {
        {
            var element = document.getElementById('map_list');
            if (!(element instanceof HTMLSelectElement)) {
                return;
            }
            _map_list = element;
            {
                var option = document.createElement('option');
                option.value = '';
                option.text = '';
                _map_list.options.add(option);
            }
            var mapNameListText = window.localStorage.getItem(STORAGE_HEADER + 'map_list');
            if (mapNameListText != null) {
                var mapNameList = mapNameListText.split('\t');
                for (var i = 0, len = mapNameList.length; i < len; i++) {
                    var mapName = mapNameList[i];
                    if (mapName.trim() != '') {
                        var option = document.createElement('option');
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
            var element = document.getElementById('board');
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
            var element = document.getElementById('map_text');
            if (!(element instanceof HTMLTextAreaElement)) {
                return;
            }
            _map_text = element;
        }
        getElementById('backup_button').addEventListener('click', clickBackup);
        createMatrix(MAP_IPPEN);
    });
    function changeMapList() {
        var mapName = _map_list.value;
        _map_name.value = mapName;
        var mapText = window.localStorage.getItem(STORAGE_HEADER + 'NAME_' + mapName);
        if (mapText == null) {
            createMatrix(MAP_IPPEN);
            return;
        }
        _map_text.value = mapText;
        var mapBlockMatrix = eval(_map_text.value);
        if (mapBlockMatrix.length != _map_ippen) {
            createMatrix(mapBlockMatrix.length);
        }
        load();
    }
    function changeMapName() {
        var mapName = _map_name.value;
        for (var i = 0, len = _map_list.options.length; i < len; i++) {
            var option_1 = _map_list.options.item(i);
            if (option_1 != null) {
                if (option_1.value == mapName) {
                    _map_list.selectedIndex = i;
                    changeMapList();
                    return;
                }
            }
        }
        var option = document.createElement('option');
        option.value = mapName;
        option.text = mapName;
        _map_list.options.add(option);
        option.selected = true;
        createMatrix(MAP_IPPEN);
        saveMapList();
    }
    function clickMapDel() {
        var mapName = _map_list.value;
        var index = _map_list.selectedIndex;
        _map_list.options.remove(index);
        window.localStorage.removeItem(STORAGE_HEADER + 'NAME_' + mapName);
        _map_name.value = '';
        saveMapList();
    }
    function saveMapList() {
        var mapNameList = [];
        for (var i = 0, len = _map_list.options.length; i < len; i++) {
            var option = _map_list.options.item(i);
            if (option != null) {
                mapNameList.push(option.value);
            }
        }
        mapNameList.sort();
        var mapNameListText = mapNameList.join('\t');
        window.localStorage.setItem(STORAGE_HEADER + 'map_list', mapNameListText);
    }
    function keypressMapIppen(evt) {
        if (evt.key != 'Enter') {
            return;
        }
        var element = getElementById('map_ippen');
        if (element.value == '') {
            return;
        }
        var map_ippen = Number(element.value);
        if (isNaN(map_ippen)) {
            return;
        }
        if (map_ippen % 2 != 0) {
            return;
        }
        var mapBlockMatrix = cloneMapBlockMatrix(_mapBlockMatrix);
        createMatrix(map_ippen);
        copyMapBlockMatrix(mapBlockMatrix, _mapBlockMatrix);
        refresh();
    }
    function cloneMapBlockMatrix(mapBlockMatrix) {
        var cloned = [];
        for (var y = 0, ylen = mapBlockMatrix.length; y < ylen; y++) {
            var x_hairetsu = mapBlockMatrix[y];
            var x_cloned = [];
            for (var x = 0, xlen = x_hairetsu.length; x < xlen; x++) {
                x_cloned.push(x_hairetsu[x]);
            }
            cloned.push(x_cloned);
        }
        return cloned;
    }
    function copyMapBlockMatrix(matrix1, matrix2) {
        for (var y = 0, ylen1 = matrix1.length, ylen2 = matrix2.length; y < ylen1 && y < ylen2; y++) {
            var x_hairetsu1 = matrix1[y];
            var x_hairetsu2 = matrix2[y];
            for (var x = 0, xlen1 = x_hairetsu1.length, xlen2 = x_hairetsu2.length; x < xlen1 && x < xlen2; x++) {
                x_hairetsu2[x] = x_hairetsu1[x];
            }
        }
    }
    function createMatrix(map_ippen) {
        _map_ippen = map_ippen;
        var element = getElementById('map_ippen');
        element.value = String(_map_ippen);
        _board.textContent = '';
        _mapBlockMatrix.length = 0;
        for (var y = 0; y < _map_ippen; y++) {
            var x_hairetsu = [];
            for (var x = 0; x < _map_ippen; x++) {
                var tile = document.createElement('div');
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
                var mapBlock = new MapBlock();
                mapBlock.x = x;
                mapBlock.y = y;
                x_hairetsu.push(mapBlock);
            }
            _mapBlockMatrix.push(x_hairetsu);
            var br = document.createElement('br');
            _board.appendChild(br);
        }
    }
    function getHougaku(evt) {
        var offsetX = evt.offsetX;
        var offsetY = evt.offsetY;
        if (offsetX < HANNOU) {
            return hougaku_W;
        }
        else if (TILE_IPPEN - HANNOU * 2 < offsetX) {
            return hougaku_E;
        }
        else if (offsetY < HANNOU) {
            return hougaku_N;
        }
        else if (TILE_IPPEN - HANNOU * 2 < offsetY) {
            return hougaku_S;
        }
        return undefined;
    }
    function pickupMapBlock(id) {
        id.match(/tile_(\d+)_(\d+)/);
        var x = Number(RegExp.$1);
        var y = Number(RegExp.$2);
        var mapBlock = _mapBlockMatrix[y][x];
        return mapBlock;
    }
    function clickTile(evt) {
        var tile = evt.target;
        if (!(tile instanceof HTMLElement)) {
            return;
        }
        var mapBlock = pickupMapBlock(tile.id);
        var hougaku = getHougaku(evt);
        if (hougaku == undefined) {
            refresh();
            return;
        }
        var kabe;
        if (evt.shiftKey) {
            kabe = MU;
        }
        else if (evt.ctrlKey) {
            kabe = KABE;
        }
        else if (evt.altKey) {
            kabe = DOOR;
        }
        else {
            return;
        }
        mapBlock[hougaku.char] = kabe;
        refresh();
        save();
    }
    function dblclickTile(evt) {
        var tile = evt.target;
        if (!(tile instanceof HTMLElement)) {
            return;
        }
        var mapBlock = pickupMapBlock(tile.id);
        _currentMapBlock = mapBlock;
        _memo.value = _currentMapBlock.memo || '';
        refresh();
    }
    function mousemoveTile(evt) {
        var tile = evt.target;
        if (!(tile instanceof HTMLElement)) {
            return;
        }
        writeTile(tile);
        var hougaku = getHougaku(evt);
        if (hougaku == undefined) {
            return;
        }
        tile.style[hougaku.borderStyleName] = 'red ' + String(HANNOU) + 'px solid';
        var mapBlock = pickupMapBlock(tile.id);
        var hantai;
        if (hougaku.char == 'W' || hougaku.char == 'E') {
            if (hougaku.char == 'W') {
                hantai = 'E';
            }
            else {
                hantai = 'W';
            }
            tile.style.width = String(TILE_IPPEN - (HANNOU + (mapBlock[hantai] != MU ? (ARI_FUTOSA - MU_FUTOSA) : 0) - MU_FUTOSA)) + 'px';
        }
        else if (hougaku.char == 'N' || hougaku.char == 'S') {
            if (hougaku.char == 'N') {
                hantai = 'S';
            }
            else {
                hantai = 'N';
            }
            tile.style.height = String(TILE_IPPEN - (HANNOU + (mapBlock[hantai] != MU ? (ARI_FUTOSA - MU_FUTOSA) : 0) - MU_FUTOSA)) + 'px';
        }
    }
    function mouseoutTile(evt) {
        var tile = evt.target;
        if (!(tile instanceof HTMLElement)) {
            return;
        }
        writeTile(tile);
    }
    function writeTile(tile) {
        var mapBlock = pickupMapBlock(tile.id);
        var tate_line_futosa = 0;
        var yoko_line_futosa = 0;
        var hougakuHairetsu = [hougaku_N, hougaku_E, hougaku_S, hougaku_W];
        for (var i = 0, len = hougakuHairetsu.length; i < len; i++) {
            var hougaku = hougakuHairetsu[i];
            var style = '';
            var line_futosa = 0;
            if (mapBlock[hougaku.char] == MU) {
                style = 'black ' + String(MU_FUTOSA) + 'px dotted';
                line_futosa = MU_FUTOSA;
            }
            else if (mapBlock[hougaku.char] == KABE) {
                style = 'black ' + String(ARI_FUTOSA) + 'px solid';
                line_futosa = ARI_FUTOSA;
            }
            else if (mapBlock[hougaku.char] == DOOR) {
                style = 'black ' + String(ARI_FUTOSA) + 'px dashed';
                line_futosa = ARI_FUTOSA;
            }
            tile.style[hougaku.borderStyleName] = style;
            if (hougaku.char == 'W' || hougaku.char == 'E') {
                yoko_line_futosa += line_futosa;
            }
            else if (hougaku.char == 'N' || hougaku.char == 'S') {
                tate_line_futosa += line_futosa;
            }
        }
        var memo = mapBlock.memo || '';
        tile.textContent = 0 < memo.length ? memo.charAt(0) : '';
        tile.style.width = String(TILE_IPPEN - (yoko_line_futosa - 2)) + 'px';
        tile.style.height = String(TILE_IPPEN - (tate_line_futosa - 2)) + 'px';
    }
    function save() {
        var mapText = JSON.stringify(_mapBlockMatrix);
        _map_text.value = mapText;
        var mapName = _map_name.value;
        if (mapName != '') {
            window.localStorage.setItem(STORAGE_HEADER + 'NAME_' + mapName, mapText);
        }
    }
    function load() {
        var mapBlockMatrix = eval(_map_text.value);
        _mapBlockMatrix.length = 0;
        for (var y = 0; y < _map_ippen; y++) {
            var x_hairetsu = [];
            for (var x = 0; x < _map_ippen; x++) {
                var mapBlock = undefined;
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
    function refresh() {
        for (var y = 0, ylen = _mapBlockMatrix.length; y < ylen; y++) {
            var x_hairetsu = _mapBlockMatrix[y];
            for (var x = 0, xlen = x_hairetsu.length; x < xlen; x++) {
                _mapBlockMatrix[y][x].x = x;
                _mapBlockMatrix[y][x].y = y;
            }
        }
        var currentId = 'tile_' + String(_currentMapBlock.x) + '_' + String(_currentMapBlock.y);
        var mawariIdArray = [];
        for (var x = -1; x <= 1; x++) {
            for (var y = -2; y <= 2; y++) {
                var mawariId = 'tile_' + String(_currentMapBlock.x + x) + '_' + String(_currentMapBlock.y + y);
                mawariIdArray.push(mawariId);
            }
        }
        for (var i = 0, len = _board.childNodes.length; i < len; i++) {
            var tile = _board.childNodes[i];
            if (tile instanceof HTMLElement && tile.id.match(/^tile_/)) {
                writeTile(tile);
                var backgroundColor = '';
                if (tile.id == currentId) {
                    backgroundColor = 'pink';
                }
                else {
                    for (var m = 0, mlen = mawariIdArray.length; m < mlen; m++) {
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
    var _currentMapBlock = new MapBlock();
    function clickCenter() {
        if (_currentMapBlock.x < 0 || _currentMapBlock.y < 0) {
            return;
        }
        var offsetX = _map_ippen / 2 - _currentMapBlock.x;
        var offsetY = _map_ippen / 2 - _currentMapBlock.y;
        _mapBlockMatrix = centering(_mapBlockMatrix, offsetY, offsetX);
        _currentMapBlock = _mapBlockMatrix[_map_ippen / 2][_map_ippen / 2];
        refresh();
    }
    function clickKaiten() {
        var offsetX = _map_ippen / 2 - _currentMapBlock.x;
        var offsetY = _map_ippen / 2 - _currentMapBlock.y;
        _mapBlockMatrix = centering(_mapBlockMatrix, offsetY, offsetX);
        _mapBlockMatrix = rotarion(_mapBlockMatrix);
        _mapBlockMatrix = centering(_mapBlockMatrix, offsetY * -1, offsetX * -1 + 1);
        refresh();
    }
    function clickHanten() {
        var offsetX = _map_ippen / 2 - _currentMapBlock.x;
        var offsetY = _map_ippen / 2 - _currentMapBlock.y;
        _mapBlockMatrix = centering(_mapBlockMatrix, offsetY, offsetX);
        _mapBlockMatrix = rotarion(_mapBlockMatrix);
        _mapBlockMatrix = rotarion(_mapBlockMatrix);
        _mapBlockMatrix = rotarion(_mapBlockMatrix);
        _mapBlockMatrix = centering(_mapBlockMatrix, offsetY * -1 + 1, offsetX * -1);
        refresh();
    }
    function centering(mapBlockMatrix, offsetY, offsetX) {
        var movedMatrix = [];
        for (var i = 0; i < _map_ippen; i++) {
            movedMatrix[i] = [];
        }
        for (var y = 0, ylen = mapBlockMatrix.length; y < ylen; y++) {
            var yadd = void 0;
            if (0 <= offsetY) {
                yadd = offsetY + y;
            }
            else {
                yadd = (mapBlockMatrix.length + offsetY) + y;
            }
            if (mapBlockMatrix.length <= yadd) {
                yadd -= mapBlockMatrix.length;
            }
            var x_hairetsu = mapBlockMatrix[y];
            for (var x = 0, xlen = x_hairetsu.length; x < xlen; x++) {
                var xadd = void 0;
                if (0 <= offsetX) {
                    xadd = offsetX + x;
                }
                else {
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
    function rotarion(mapBlockMatrix) {
        var movedMatrix = [];
        for (var i = 0; i < _map_ippen; i++) {
            movedMatrix[i] = [];
        }
        for (var y = 0, ylen = mapBlockMatrix.length; y < ylen; y++) {
            var x_hairetsu = mapBlockMatrix[y];
            for (var x = 0, xlen = x_hairetsu.length; x < xlen; x++) {
                var mapBlock = mapBlockMatrix[xlen - 1 - y][x];
                var swap = mapBlock.W;
                mapBlock.W = mapBlock.S;
                mapBlock.S = mapBlock.E;
                mapBlock.E = mapBlock.N;
                mapBlock.N = swap;
                movedMatrix[x][y] = mapBlock;
            }
        }
        return movedMatrix;
    }
    function changeMemo() {
        if (_memo.value.trim() != '') {
            _currentMapBlock.memo = _memo.value;
        }
        else {
            _currentMapBlock.memo = undefined;
        }
        refresh();
        save();
    }
    function clickBackup() {
        var backupTextArray = [];
        var mapNameListText = window.localStorage.getItem(STORAGE_HEADER + 'map_list');
        if (mapNameListText != null) {
            var mapNameList = mapNameListText.split('\t');
            for (var i = 0, len = mapNameList.length; i < len; i++) {
                var mapName = mapNameList[i];
                var mapText = window.localStorage.getItem(STORAGE_HEADER + 'NAME_' + mapName);
                backupTextArray.push('{"name":"' + mapName + '","text":\n' + mapText + '\n}');
            }
        }
        var backupText = '[' + backupTextArray.join(',\n') + ']';
        copy(backupText);
    }
    function copy(text) {
        var textArea = document.createElement('textarea');
        textArea.value = text;
        var body = document.getElementsByTagName('body')[0];
        body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        body.removeChild(textArea);
    }
})(Dungeon || (Dungeon = {}));
//# sourceMappingURL=constructor.js.map