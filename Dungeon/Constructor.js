"use strict";
var Dungeon;
(function (Dungeon) {
    var MAP_IPPEN = 16;
    var TILE_IPPEN = 48;
    var MU_FUTOSA = 1;
    var ARI_FUTOSA = 2;
    var HANNOU = 6;
    var _board;
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
    var kabeHairetsu = [MU, KABE, DOOR];
    var MapBlock = (function () {
        function MapBlock() {
            this.x = -1;
            this.y = -1;
            this.N = MU;
            this.E = MU;
            this.S = MU;
            this.W = MU;
        }
        return MapBlock;
    }());
    var _map_ippen = 0;
    var _mapBlockMatrix = [];
    window.addEventListener('load', function () {
        {
            var element = document.getElementById('board');
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
        createMatrix(MAP_IPPEN);
        {
            var element = document.getElementById('map_ippen');
            if (element != null) {
                element.addEventListener('keypress', keypressMapIppen);
            }
        }
        {
            var element = document.getElementById('load_button');
            if (element != null) {
                element.addEventListener('click', clickLoad);
            }
        }
        {
            var element = document.getElementById('hanten_button');
            if (element != null) {
                element.addEventListener('click', clickHanten);
            }
        }
        {
            var element = document.getElementById('center_button');
            if (element != null) {
                element.addEventListener('click', clickCenter);
            }
        }
        {
            var element = document.getElementById('kaiten_button');
            if (element != null) {
                element.addEventListener('click', clickKaiten);
            }
        }
    });
    function keypressMapIppen() {
        var element = document.getElementById('map_ippen');
        if (!(element instanceof HTMLInputElement)) {
            return;
        }
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
        createMatrix(map_ippen);
    }
    function createMatrix(map_ippen) {
        _map_ippen = map_ippen;
        var element = document.getElementById('map_ippen');
        if (!(element instanceof HTMLInputElement)) {
            return;
        }
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
                tile.style.verticalAlign = 'top';
                tile.innerHTML = '&nbsp;';
                tile.addEventListener('click', clickTile);
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
        _currentMapBlock = mapBlock;
        var hougaku = getHougaku(evt);
        if (hougaku == undefined) {
            refresh();
            return;
        }
        var kabe = mapBlock[hougaku.char];
        kabe++;
        if (kabeHairetsu.length <= kabe) {
            kabe = 0;
        }
        mapBlock[hougaku.char] = kabeHairetsu[kabe];
        refresh();
        save();
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
        tile.style.width = String(TILE_IPPEN - (yoko_line_futosa - 2)) + 'px';
        tile.style.height = String(TILE_IPPEN - (tate_line_futosa - 2)) + 'px';
    }
    function save() {
        var element = document.getElementById('maptext');
        if (!(element instanceof HTMLTextAreaElement)) {
            return;
        }
        element.value = JSON.stringify(_mapBlockMatrix);
    }
    function clickLoad() {
        var element = document.getElementById('maptext');
        if (!(element instanceof HTMLTextAreaElement)) {
            return;
        }
        var mapBlockMatrix = eval(element.value);
        if (_map_ippen < mapBlockMatrix.length) {
            createMatrix(mapBlockMatrix.length);
        }
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
        for (var i = 0, len = _board.childNodes.length; i < len; i++) {
            var tile = _board.childNodes[i];
            if (tile instanceof HTMLElement && tile.id.match(/^tile_/)) {
                writeTile(tile);
                tile.style.backgroundColor = (tile.id == currentId) ? 'pink' : '';
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
})(Dungeon || (Dungeon = {}));
//# sourceMappingURL=constructor.js.map