var TextAdv;
(function (TextAdv) {
    TextAdv.MODE_MAKIMONO = 'makimono';
    TextAdv.MODE_KAMISHIBAI = 'kamishibai';
    var Link = (function () {
        function Link() {
        }
        return Link;
    }());
    var Scene = (function () {
        function Scene() {
        }
        return Scene;
    }());
    var $linkColor = 'blue';
    var $selectColor = 'red';
    var $trace = new Array();
    var $mode = TextAdv.MODE_MAKIMONO;
    var $display;
    var $scenes;
    var $scrlctrl = null;
    function analize(source) {
        var scenes = new Array();
        var result = source.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
        var lines = result.split('\n');
        for (var i = 0, len = lines.length; i < len; i++) {
            lines[i] = lines[i].replace(/^\s*([\d０-９]+)\s*[:：]/, function (m, g1) {
                if (m != null) {
                    m = null;
                }
                g1 = '<>' + toHankaku(g1);
                return g1 + ':';
            });
        }
        var sceneWorks = lines.join('\n').split(/<>/);
        for (var i = 0, len = sceneWorks.length; i < len; i++) {
            var res = sceneWorks[i].match(/^(\d+):((\n|.)*)/m);
            if (res != null) {
                var idx = +res[1];
                var text = res[2];
                var scene = analizeScene(idx, text);
                scenes[idx] = scene;
            }
        }
        return scenes;
    }
    function analizeScene(idx, text) {
        var scene = new Scene();
        scene.idx = idx;
        scene.text = text;
        var regDaikakkoCheck = /((\[[^\]]+\])|(［[^］]+］))/g;
        var regDaikakkoAnchor = /([^→\[\]［］]*)→\s*([0-9０-９]+)/;
        var regYajirushiOnly = /→\s*([0-9０-９]+)/;
        text = text.replace(regDaikakkoCheck, function (s) { return '##BLOCK##' + s + '##BLOCK##'; });
        var blocks = text.split('##BLOCK##');
        var blockHTMLs = new Array();
        var links = new Array();
        var linkCount = 0;
        for (var i = 0, len = blocks.length; i < len; i++) {
            var block = blocks[i];
            if (block.match(regDaikakkoCheck)) {
                var res = block.match(regDaikakkoAnchor);
                if (res != null) {
                    linkCount++;
                    var toIdx = +toHankaku(res[2]);
                    var msg = res[1].replace(/\s*$/, '');
                    var linkNo = linkCount;
                    var link = ' <span class="link">' + msg + '</span>';
                    blockHTMLs.push(link);
                    links.push({ linkNo: linkNo, toIdx: toIdx });
                }
            }
            else {
                while (true) {
                    var res = block.match(regYajirushiOnly);
                    if (res == null) {
                        break;
                    }
                    linkCount++;
                    var toIdx = toHankaku(res[1]);
                    var msg = '⇒ ' + toIdx;
                    var linkNo = linkCount;
                    var link = ' <span class="link">' + msg + '</span>';
                    block = block.replace(regYajirushiOnly, link);
                    links.push({ linkNo: linkNo, toIdx: toIdx });
                }
                block = block.replace(/⇒ /g, '→ ');
                blockHTMLs.push(block);
            }
        }
        var html = blockHTMLs.join('');
        var titlehtml = html.split('◇');
        if (2 <= titlehtml.length) {
            scene.title = titlehtml[0];
            scene.html = titlehtml[1];
        }
        else {
            scene.html = html;
        }
        scene.links = links;
        return scene;
    }
    TextAdv.analizeScene = analizeScene;
    function toHankaku(s) {
        return +(s.replace(/[０-９]/g, function (s) { return String.fromCharCode(s.charCodeAt(0) - 65248); }));
    }
    function initialize(display, source) {
        $display = display;
        $scenes = analize(source);
    }
    TextAdv.initialize = initialize;
    function start() {
        $display.innerHTML = '';
        go(0);
    }
    TextAdv.start = start;
    function go(idx, selectedElm) {
        var sceneElm = null;
        var step = 0;
        if (selectedElm != undefined) {
            if ($mode == TextAdv.MODE_MAKIMONO) {
                sceneElm = searchUpperElement(selectedElm, 'scene');
            }
            else {
                sceneElm = $display;
            }
            if (sceneElm != null) {
                sceneElm.id.match(/^sc(\d+)$/);
                step = +RegExp.$1;
                var linkElms = new Array();
                pickupElements(sceneElm, 'link', linkElms);
                for (var i_1 = 0; i_1 < linkElms.length; i_1++) {
                    linkElms[i_1].style.color = $linkColor;
                }
                selectedElm.style.color = $selectColor;
            }
        }
        var i = step + 1;
        while (true) {
            var elm = document.getElementById('sc' + i);
            if (elm == null) {
                break;
            }
            $display.removeChild(elm);
            i++;
        }
        var scene = $scenes[idx];
        step++;
        var sceneDiv = null;
        if ($mode == TextAdv.MODE_MAKIMONO) {
            var elementId = 'sc' + step;
            var div = '<div id="' + elementId + '" class="scene">' + scene.html + '</div><p>';
            var r = document.createRange();
            r.selectNode($display);
            $display.appendChild(r.createContextualFragment(div));
            sceneDiv = document.getElementById(elementId);
        }
        else if ($mode == TextAdv.MODE_KAMISHIBAI) {
            $display.innerHTML = scene.html;
            sceneDiv = $display;
        }
        if (sceneDiv != null) {
            var linkElms = new Array();
            pickupElements(sceneDiv, 'link', linkElms);
            for (var i_2 = 0, len = linkElms.length; i_2 < len; i_2++) {
                var linkElm = linkElms[i_2];
                if (linkElm.className == 'link') {
                    linkElm.style.color = 'blue';
                    linkElm.style.textDecoration = 'underline';
                    linkElm.style.cursor = 'pointer';
                    (function (toIdx, linkElm) {
                        linkElm.addEventListener('click', function () {
                            go(toIdx, linkElm);
                        });
                    })(scene.links[i_2].toIdx, linkElm);
                }
            }
        }
        if (scene.title != null) {
            document.title = scene.title;
        }
        $trace.push(idx);
        if ($mode == TextAdv.MODE_MAKIMONO) {
            if (selectedElm == undefined) {
                return;
            }
            if ($scrlctrl == null) {
                $scrlctrl = new ScrollCtrl($display);
            }
            $scrlctrl.scroll(selectedElm);
        }
    }
    TextAdv.go = go;
    function back() {
        $trace.pop();
        var idx = $trace.pop();
        if (idx != undefined) {
            go(idx);
        }
    }
    TextAdv.back = back;
    function searchUpperElement(elm, className) {
        var parent = elm.parentNode;
        if (parent == null) {
            return null;
        }
        if (parent.className == className) {
            return parent;
        }
        return searchUpperElement(parent, className);
    }
    function pickupElements(parentElm, className, pickupElms) {
        if (pickupElms == null) {
            return;
        }
        var childElms = parentElm.childNodes;
        for (var i = 0; i < childElms.length; i++) {
            var elm = childElms.item(i);
            if (0 < elm.childNodes.length) {
                pickupElements(elm, className, pickupElms);
            }
            if (elm.className == className) {
                pickupElms.push(elm);
            }
        }
    }
    var ScrollCtrl = (function () {
        function ScrollCtrl(display) {
            var _this = this;
            this.scrolling = function () {
                if (_this.base == null || _this.selectedElm == null) {
                    return;
                }
                var rect = _this.selectedElm.getBoundingClientRect();
                if (rect.top < _this.lastTop && 20 < rect.top) {
                    if (_this.base.tagName == 'BODY') {
                        window.scrollBy(0, _this.dy);
                    }
                    else {
                        _this.base.scrollTop = _this.base.scrollTop + _this.dy;
                    }
                    _this.timer = setTimeout(_this.scrolling, _this.interval);
                    _this.lastTop = rect.top;
                    return;
                }
                clearTimeout(_this.timer);
                _this.selectedElm = null;
            };
            this.timer = 0;
            this.interval = 5;
            this.dy = 10;
            this.base = display;
            this.selectedElm = null;
            this.lastTop = 0;
            while (this.base.style.height == '') {
                if (this.base.tagName == 'BODY') {
                    break;
                }
                var elm = this.base.parentNode;
                if (elm == null) {
                    break;
                }
                else {
                    this.base = elm;
                }
            }
        }
        ScrollCtrl.prototype.scroll = function (selectedElm) {
            this.selectedElm = selectedElm;
            var rect = this.selectedElm.getBoundingClientRect();
            this.lastTop = rect.top + 1;
            this.scrolling();
        };
        return ScrollCtrl;
    }());
})(TextAdv || (TextAdv = {}));
window.addEventListener('load', function () {
    var displayElm = document.getElementById('display');
    var sourceElm = document.getElementById('source');
    if (sourceElm != null && displayElm != null) {
        TextAdv.initialize(displayElm, sourceElm.value);
        TextAdv.start();
    }
});
//# sourceMappingURL=TextAdv.js.map