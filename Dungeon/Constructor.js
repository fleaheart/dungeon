"use strict";
var Dungeon;
(function (Dungeon) {
    var MAP_IPPEN = 48;
    var TILE_IPPEN = 24;
    var MU_FUTOSA = 1;
    var ARI_ARI = 6;
    var _board;
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
            _board.style.width = String(MAP_IPPEN * 32) + 'px';
            _board.style.height = String(MAP_IPPEN * 32) + 'px';
            _board.style.verticalAlign = 'top';
        }
        document.body.appendChild(_board);
        for (var y = 0; y < TILE_IPPEN; y++) {
            var x_hairetsu = [];
            for (var x = 0; x < TILE_IPPEN; x++) {
                var tile = document.createElement('div');
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
    function clickTile(evt) {
        var tile = evt.target;
        if (!(tile instanceof HTMLElement)) {
            return;
        }
        var mapBlock = pickupMapBlock(tile.id);
        var offsetX = evt.offsetX;
        var offsetY = evt.offsetY;
        if (offsetX < ARI_ARI) {
            var kabe = mapBlock.W;
            kabe++;
            if (kabeHairetsu.length <= kabe) {
                kabe = 0;
            }
            mapBlock.W = kabeHairetsu[kabe];
        }
        else if (MAP_IPPEN - ARI_ARI * 2 < offsetX) {
            var kabe = mapBlock.E;
            kabe++;
            if (kabeHairetsu.length <= kabe) {
                kabe = 0;
            }
            mapBlock.E = kabeHairetsu[kabe];
        }
        else if (offsetY < ARI_ARI) {
            var kabe = mapBlock.N;
            kabe++;
            if (kabeHairetsu.length <= kabe) {
                kabe = 0;
            }
            mapBlock.N = kabeHairetsu[kabe];
        }
        else if (MAP_IPPEN - ARI_ARI * 2 < offsetY) {
            var kabe = mapBlock.S;
            kabe++;
            if (kabeHairetsu.length <= kabe) {
                kabe = 0;
            }
            mapBlock.S = kabeHairetsu[kabe];
        }
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
        var mapBlock = pickupMapBlock(tile.id);
        var offsetX = evt.offsetX;
        var offsetY = evt.offsetY;
        if (offsetX < ARI_ARI) {
            tile.style.borderLeft = 'red ' + String(ARI_ARI) + 'px solid';
            tile.style.width = String(MAP_IPPEN - (ARI_ARI + (mapBlock.E != MU ? 5 : 0) - MU_FUTOSA)) + 'px';
        }
        else if (MAP_IPPEN - ARI_ARI * 2 < offsetX) {
            tile.style.borderRight = 'red ' + String(ARI_ARI) + 'px solid';
            tile.style.width = String(MAP_IPPEN - (ARI_ARI + (mapBlock.W != MU ? 5 : 0) - MU_FUTOSA)) + 'px';
        }
        else if (offsetY < ARI_ARI) {
            tile.style.borderTop = 'red ' + String(ARI_ARI) + 'px solid';
            tile.style.height = String(MAP_IPPEN - (ARI_ARI + (mapBlock.S != MU ? 5 : 0) - MU_FUTOSA)) + 'px';
        }
        else if (MAP_IPPEN - ARI_ARI * 2 < offsetY) {
            tile.style.borderBottom = 'red ' + String(ARI_ARI) + 'px solid';
            tile.style.height = String(MAP_IPPEN - (ARI_ARI + (mapBlock.N != MU ? 5 : 0) - MU_FUTOSA)) + 'px';
        }
        else {
            writeTile(tile);
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
        var tate_futosa = 0;
        if (mapBlock.N == MU) {
            tile.style.borderTop = 'black ' + String(MU_FUTOSA) + 'px dotted';
            tate_futosa += MU_FUTOSA;
        }
        else if (mapBlock.N == KABE) {
            tile.style.borderTop = 'black ' + String(ARI_ARI) + 'px solid';
            tate_futosa += ARI_ARI;
        }
        else if (mapBlock.N == DOOR) {
            tile.style.borderTop = 'black ' + String(ARI_ARI) + 'px dashed';
            tate_futosa += ARI_ARI;
        }
        if (mapBlock.S == MU) {
            tile.style.borderBottom = 'black ' + String(MU_FUTOSA) + 'px dotted';
            tate_futosa += MU_FUTOSA;
        }
        else if (mapBlock.S == KABE) {
            tile.style.borderBottom = 'black ' + String(ARI_ARI) + 'px solid';
            tate_futosa += ARI_ARI;
        }
        else if (mapBlock.S == DOOR) {
            tile.style.borderBottom = 'black ' + String(ARI_ARI) + 'px dashed';
            tate_futosa += ARI_ARI;
        }
        tile.style.height = String(MAP_IPPEN - (tate_futosa - 2)) + 'px';
        var yoko_futosa = 0;
        if (mapBlock.W == MU) {
            tile.style.borderLeft = 'black ' + String(MU_FUTOSA) + 'px dotted';
            yoko_futosa += MU_FUTOSA;
        }
        else if (mapBlock.W == KABE) {
            tile.style.borderLeft = 'black ' + String(ARI_ARI) + 'px solid';
            yoko_futosa += ARI_ARI;
        }
        else if (mapBlock.W == DOOR) {
            tile.style.borderLeft = 'black ' + String(ARI_ARI) + 'px dashed';
            yoko_futosa += ARI_ARI;
        }
        if (mapBlock.E == MU) {
            tile.style.borderRight = 'black ' + String(MU_FUTOSA) + 'px dotted';
            yoko_futosa += MU_FUTOSA;
        }
        else if (mapBlock.E == KABE) {
            tile.style.borderRight = 'black ' + String(ARI_ARI) + 'px solid';
            yoko_futosa += ARI_ARI;
        }
        else if (mapBlock.E == DOOR) {
            tile.style.borderRight = 'black ' + String(ARI_ARI) + 'px dashed';
            yoko_futosa += ARI_ARI;
        }
        tile.style.width = String(MAP_IPPEN - (yoko_futosa - 2)) + 'px';
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
        for (var i = 0; i < TILE_IPPEN; i++) {
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