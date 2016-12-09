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
    var $step = 1;
    var $trace = new Array();
    var $mode = TextAdv.MODE_MAKIMONO;
    var $display;
    var $scenes;
    function analize(source) {
        var scenes = new Array();
        var result = source.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
        var lines = result.split('\n');
        for (var i = 0, len = lines.length; i < len; i++) {
            lines[i] = lines[i].replace(/^\s*([\d０-９]+)\s*[:：]/, function (s, g1) {
                s = null;
                g1 = '<>' + toHankaku(g1);
                return g1 + ':';
            });
        }
        var sceneWorks = lines.join('\n').split(/<>/);
        for (var i = 0, len = sceneWorks.length; i < len; i++) {
            sceneWorks[i].match(/^(\d+):((\n|.)*)/m);
            var idx = +RegExp.$1;
            var text = RegExp.$2;
            var scene = analizeScene(idx, text);
            scenes[idx] = scene;
        }
        return scenes;
    }
    function analizeScene(idx, text) {
        var scene = new Scene();
        scene.idx = idx;
        scene.text = text;
        var regDaikakkoAnchor = /([^→\[\]]*)→\s*([0-9０-９]+)/;
        var regYajirushiOnly = /→\s*([0-9０-９]+)/;
        text = text.replace(/(\[[^\]]+\])/g, function (s) { return '##BLOCK##' + s + '##BLOCK##'; });
        var blocks = text.split('##BLOCK##');
        var blockHTMLs = new Array();
        var links = new Array();
        var linkCount = 0;
        for (var i = 0, len = blocks.length; i < len; i++) {
            var block = blocks[i];
            if (block.charAt(0) == '[') {
                linkCount++;
                var res = block.match(regDaikakkoAnchor);
                if (res != null) {
                    var toIdx = +RegExp.$2;
                    var msg = RegExp.$1;
                    var elementId = 'link_' + idx + '_' + linkCount;
                    var link = '<span id="' + elementId + '" class="link">' + msg + '</span>';
                    blockHTMLs.push(link);
                    links.push({ elementId: elementId, toIdx: toIdx });
                }
            }
            else {
                while (true) {
                    var res = block.match(regYajirushiOnly);
                    if (res == null) {
                        break;
                    }
                    linkCount++;
                    var toIdx = toHankaku(RegExp.$1);
                    var msg = '⇒ ' + toIdx + ' ';
                    var elementId = 'link_' + idx + '_' + linkCount;
                    var link = '<span id="' + elementId + '" class="link">' + msg + '</span>';
                    block = block.replace(regYajirushiOnly, link);
                    links.push({ elementId: elementId, toIdx: toIdx });
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
        $step = 1;
        go(0);
    }
    TextAdv.start = start;
    function go(idx, selectedElm) {
        if (selectedElm != null) {
            var parentElm = void 0;
            if ($mode == TextAdv.MODE_MAKIMONO) {
                parentElm = searchUpperElement(selectedElm, 'scene');
            }
            else {
                parentElm = $display;
            }
            if (parentElm != null) {
                var elms = new Array();
                pickupElements(parentElm, 'link', elms);
                for (var i = 0; i < elms.length; i++) {
                    elms[i].style.color = $linkColor;
                }
                selectedElm.style.color = $selectColor;
            }
        }
        {
            var i = $step;
            while (true) {
                var elm = document.getElementById('sc' + i);
                if (elm == null) {
                    break;
                }
                elm.parentNode.removeChild(elm);
                i++;
            }
        }
        var scene = $scenes[idx];
        if ($mode == TextAdv.MODE_MAKIMONO) {
            var elementId_1 = 'sc' + $step;
            var div = '<div id="' + elementId_1 + '" class="scene">' + scene.html + '</div><p>';
            var r = document.createRange();
            r.selectNode($display);
            $display.appendChild(r.createContextualFragment(div));
            (function (step) {
                var elm = document.getElementById(elementId_1);
                if (elm != null) {
                    elm.addEventListener('mouseover', function () {
                        $step = step + 1;
                    });
                }
            })($step);
            $step++;
        }
        else if ($mode == TextAdv.MODE_KAMISHIBAI) {
            $display.innerHTML = scene.html;
            $step++;
        }
        for (var i = 0, len = scene.links.length; i < len; i++) {
            var linkElm = document.getElementById(scene.links[i].elementId);
            if (linkElm != null) {
                linkElm.style.color = 'blue';
                linkElm.style.textDecoration = 'underline';
                linkElm.style.cursor = 'pointer';
                (function (linkElm, toIdx) {
                    linkElm.addEventListener('click', function () {
                        go(toIdx, linkElm);
                    });
                })(linkElm, scene.links[i].toIdx);
            }
        }
        if (scene.title != null) {
            document.title = scene.title;
        }
        $trace.push(idx);
        if ($mode == TextAdv.MODE_MAKIMONO) {
            scroll();
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
    var $interval = 5;
    var $dy = 10;
    function scroll() {
        if (window.innerHeight + window.pageYOffset - $dy < document.body.scrollHeight) {
            window.scrollBy(0, $dy);
            setTimeout(arguments.callee, $interval);
        }
    }
    TextAdv.scroll = scroll;
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