"use strict";
var Dungeon;
(function (Dungeon) {
    function getParentElement(e, className) {
        var target = e.target;
        if (target == null) {
            return null;
        }
        var element = target;
        while (true) {
            if (element == null) {
                break;
            }
            if (element.classList.contains(className)) {
                return element;
            }
            element = element.parentNode;
        }
        return null;
    }
    var ippen = 36;
    function constructor_init() {
        Kyoutsu.getElementById('refresh').addEventListener('click', refresh);
        var partsBoard = Kyoutsu.getElementById('div_partsBoard');
        var futosa = 2;
        for (var i = 0; i < 16; i++) {
            var c = i.toString(16).toUpperCase();
            var kukaku = document.createElement('DIV');
            kukaku.className = 'kukaku';
            kukaku.style.margin = '4px';
            kukaku.style.border = '1px solid grey';
            kukaku.style.width = (ippen + futosa * 2) + 'px';
            kukaku.style.height = (ippen + futosa * 2) + 'px';
            var map = document.createElement('DIV');
            map.id = 'parts[' + i + ']';
            Dungeon.setStyle(map, c.toUpperCase(), ippen, futosa);
            var nakami = document.createElement('DIV');
            nakami.id = 'nakami[' + i + ']';
            nakami.className = 'nakami';
            nakami.style.width = ippen + 'px';
            nakami.style.height = ippen + 'px';
            nakami.textContent = String(c);
            map.appendChild(nakami);
            kukaku.appendChild(map);
            partsBoard.appendChild(kukaku);
            kukaku.addEventListener('mousedown', selectKukaku);
        }
        document.body.addEventListener('mousemove', drag);
        document.body.addEventListener('mouseup', dragStop);
    }
    Dungeon.constructor_init = constructor_init;
    var _mapdata = new Array();
    function refresh() {
        var textarea = Kyoutsu.getElementById('maptext');
        _mapdata = textarea.value.split(/[\r\n]+/g);
        var div_map = Kyoutsu.getElementById('div_map');
        Dungeon.mapview(div_map, _mapdata, '');
    }
    function selectKukaku(e) {
        var element = getParentElement(e, 'kukaku');
        if (element == null) {
            return;
        }
        var rect = element.getBoundingClientRect();
        var mover = element.cloneNode(true);
        mover.style.margin = '0';
        mover.style.border = '1px dashed red';
        mover.style.background = 'pink';
        mover.style.position = 'absolute';
        mover.style.top = rect.top + 'px';
        mover.style.left = rect.left + 'px';
        document.body.appendChild(mover);
        dragStart(e, mover);
    }
    var _dragObject = null;
    var _startTop = 0;
    var _startLeft = 0;
    var _startX = 0;
    var _startY = 0;
    function dragStart(e, element) {
        if (_dragObject != null) {
            return;
        }
        _dragObject = element;
        _startLeft = element.offsetLeft;
        _startTop = element.offsetTop;
        _startX = e.clientX;
        _startY = e.clientY;
    }
    function drag(e) {
        if (_dragObject == null) {
            return;
        }
        var x = _startLeft - (_startX - e.clientX);
        var y = _startTop - (_startY - e.clientY);
        _dragObject.style.left = x + 'px';
        _dragObject.style.top = y + 'px';
    }
    function dragStop(e) {
        if (_dragObject == null) {
            return;
        }
        var dropx = _startLeft - (_startX - e.clientX);
        var dropy = _startTop - (_startY - e.clientY);
        var boxippen = (ippen + 2 * 2);
        dropx = Math.floor(dropx + (boxippen / 2));
        dropy = Math.floor(dropy + (boxippen / 2));
        dropx = dropx - (dropx % boxippen);
        dropy = dropy - (dropy % boxippen);
        _dragObject.style.left = (dropx + 10) + 'px';
        _dragObject.style.top = (dropy + 6) + 'px';
        var c = _dragObject.textContent;
        if (c != null) {
            var x = dropx / boxippen;
            var y = (dropy - 200) / boxippen;
            for (var i = 0; i < y; i++) {
                var line_1 = _mapdata[i];
                if (line_1 == undefined) {
                    line_1 = '';
                    _mapdata[i] = line_1;
                }
            }
            var line = _mapdata[y];
            if (line == undefined) {
                line = '';
            }
            while (line.length < x) {
                line = line + '0';
            }
            line = line.substr(0, x) + c + line.substr(x + 1);
            _mapdata[y] = line;
            document.getElementById('maptext').value = _mapdata.join('\r\n');
            var div_map = Kyoutsu.getElementById('div_map');
            Dungeon.mapview(div_map, _mapdata, '');
        }
        document.body.removeChild(_dragObject);
        _dragObject = null;
        _startTop = 0;
        _startY = 0;
    }
})(Dungeon || (Dungeon = {}));
//# sourceMappingURL=Constructor.js.map