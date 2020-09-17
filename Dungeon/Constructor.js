"use strict";
var Dungeon;
(function (Dungeon) {
    var MAP_IPPEN = 24;
    var TILE_IPPEN = 48;
    var MU_FUTOSA = 1;
    var ARI_ARI = 6;
    var _board;
    function getBorderStyleName(hougaku) {
        if (hougaku == 'N') {
            return 'borderTop';
        }
        else if (hougaku == 'E') {
            return 'borderRight';
        }
        if (hougaku == 'S') {
            return 'borderBottom';
        }
        else if (hougaku == 'W') {
            return 'borderLeft';
        }
        throw hougaku;
    }
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
        for (var y = 0; y < MAP_IPPEN; y++) {
            var x_hairetsu = [];
            for (var x = 0; x < MAP_IPPEN; x++) {
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
        {
            var element = document.getElementById('load_button');
            if (element != null) {
                element.addEventListener('click', load);
            }
        }
        {
            var element = document.getElementById('kaiten_button');
            if (element != null) {
                element.addEventListener('click', kaiten);
            }
        }
    });
    function getHougaku(evt) {
        var offsetX = evt.offsetX;
        var offsetY = evt.offsetY;
        if (offsetX < ARI_ARI) {
            return 'W';
        }
        else if (TILE_IPPEN - ARI_ARI * 2 < offsetX) {
            return 'E';
        }
        else if (offsetY < ARI_ARI) {
            return 'N';
        }
        else if (TILE_IPPEN - ARI_ARI * 2 < offsetY) {
            return 'S';
        }
        return undefined;
    }
    function clickTile(evt) {
        var tile = evt.target;
        if (!(tile instanceof HTMLElement)) {
            return;
        }
        var hougaku = getHougaku(evt);
        if (hougaku == undefined) {
            return;
        }
        var mapBlock = pickupMapBlock(tile.id);
        var kabe = mapBlock[hougaku];
        kabe++;
        if (kabeHairetsu.length <= kabe) {
            kabe = 0;
        }
        mapBlock[hougaku] = kabeHairetsu[kabe];
        writeTile(tile);
        save();
    }
    function pickupMapBlock(id) {
        id.match(/tile_(\d+)_(\d+)/);
        var x = Number(RegExp.$1);
        var y = Number(RegExp.$2);
        var mapBlock = _mapBlockMatrix[y][x];
        return mapBlock;
    }
    function mousemoveTile(evt) {
        var tile = evt.target;
        if (!(tile instanceof HTMLElement)) {
            return;
        }
        var hougaku = getHougaku(evt);
        if (hougaku == undefined) {
            writeTile(tile);
            return;
        }
        var borderStyleName = getBorderStyleName(hougaku);
        tile.style[borderStyleName] = 'red ' + String(ARI_ARI) + 'px solid';
        var mapBlock = pickupMapBlock(tile.id);
        var hantai;
        if (hougaku == 'W' || hougaku == 'E') {
            if (hougaku == 'W') {
                hantai = 'E';
            }
            else {
                hantai = 'W';
            }
            tile.style.width = String(TILE_IPPEN - (ARI_ARI + (mapBlock[hantai] != MU ? (ARI_ARI - MU_FUTOSA) : 0) - MU_FUTOSA)) + 'px';
        }
        else if (hougaku == 'N' || hougaku == 'S') {
            if (hougaku == 'N') {
                hantai = 'S';
            }
            else {
                hantai = 'N';
            }
            tile.style.height = String(TILE_IPPEN - (ARI_ARI + (mapBlock[hantai] != MU ? (ARI_ARI - MU_FUTOSA) : 0) - MU_FUTOSA)) + 'px';
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
        var tate_tsukattabun = 0;
        var yoko_tsukattabun = 0;
        var hougakuHairetsu = ['N', 'E', 'S', 'W'];
        for (var i = 0, len = hougakuHairetsu.length; i < len; i++) {
            var hougaku = hougakuHairetsu[i];
            var style = '';
            var tsukattabun = 0;
            if (mapBlock[hougaku] == MU) {
                style = 'black ' + String(MU_FUTOSA) + 'px dotted';
                tsukattabun = MU_FUTOSA;
            }
            else if (mapBlock[hougaku] == KABE) {
                style = 'black ' + String(ARI_ARI) + 'px solid';
                tsukattabun = ARI_ARI;
            }
            else if (mapBlock[hougaku] == DOOR) {
                style = 'black ' + String(ARI_ARI) + 'px dashed';
                tsukattabun = ARI_ARI;
            }
            var borderStyleName = getBorderStyleName(hougaku);
            tile.style[borderStyleName] = style;
            if (hougaku == 'W' || hougaku == 'E') {
                yoko_tsukattabun += tsukattabun;
            }
            else if (hougaku == 'N' || hougaku == 'S') {
                tate_tsukattabun += tsukattabun;
            }
        }
        tile.style.width = String(TILE_IPPEN - (yoko_tsukattabun - 2)) + 'px';
        tile.style.height = String(TILE_IPPEN - (tate_tsukattabun - 2)) + 'px';
    }
    function save() {
        var element = document.getElementById('maptext');
        if (!(element instanceof HTMLTextAreaElement)) {
            return;
        }
        element.value = JSON.stringify(_mapBlockMatrix);
    }
    function load() {
        var element = document.getElementById('maptext');
        if (!(element instanceof HTMLTextAreaElement)) {
            return;
        }
        _mapBlockMatrix = eval(element.value);
        refresh();
    }
    function refresh() {
        for (var i = 0, len = _board.childNodes.length; i < len; i++) {
            var tile = _board.childNodes[i];
            if (tile instanceof HTMLElement && tile.id.match(/^tile_/)) {
                writeTile(tile);
            }
        }
    }
    function kaiten() {
        var rotation = [];
        for (var i = 0; i < MAP_IPPEN; i++) {
            rotation[i] = [];
        }
        for (var y = 0, ylen = _mapBlockMatrix.length; y < ylen; y++) {
            var x_hairetsu = _mapBlockMatrix[y];
            for (var x = 0, xlen = x_hairetsu.length; x < xlen; x++) {
                var mapBlock = _mapBlockMatrix[xlen - 1 - y][x];
                var swap = mapBlock.W;
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
})(Dungeon || (Dungeon = {}));
//# sourceMappingURL=constructor.js.map