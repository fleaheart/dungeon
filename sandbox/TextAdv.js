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
    var $step = 1; // 遷移数
    var $trace = new Array(); // 遷移順配列
    var $mode = TextAdv.MODE_MAKIMONO;
    var $display;
    var $scenes;
    function analize(source) {
        var scenes = new Array();
        var result = source.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
        var lines = result.split('\n');
        for (var i = 0, len = lines.length; i < len; i++) {
            lines[i] = lines[i].replace(/^\s*([\d０-９]+)\s*[:：]/, function (s, g1) {
                g1 = '<>' + toHankaku(g1);
                return g1 + ':';
            });
        }
        var sceneWorks = lines.join('\n').split(/<>/);
        for (var i = 0, len = sceneWorks.length; i < len; i++) {
            sceneWorks[i].match(/^(\d+):((\n|.)*)/m);
            var idx = +RegExp.$1;
            var body = RegExp.$2;
            var scene = analizeScene(idx, body);
            scenes[idx] = scene;
        }
        return scenes;
    }
    function analizeScene(idx, text) {
        var scene = new Scene();
        scene.idx = idx;
        scene.text = text;
        var regDaikakkoAnchor = /^\[([^←→]*)([←→]*)(.*)\]$/;
        var regYajirushiOnly = /→\s*([0-9０-９]+)/;
        /*
         * 大括弧で囲まれたアンカー[msg → 000]と「それ以外」をわける。
         */
        var blocks = null;
        text = text.replace(/(\[[^\]]+\])/g, function (s) { return '##BLOCK##' + s + '##BLOCK##'; });
        blocks = text.split('##BLOCK##');
        /*
         * BLOCKごとにcreateContextualFragmentしようとしたが、アンカーをまたぐタグに対応できなかったので、アンカーも文字列で対応
         */
        var blockHTMLs = new Array();
        var links = new Array();
        var linkCount = 0;
        for (var i = 0; i < blocks.length; i++) {
            var block = blocks[i];
            if (block.charAt(0) == '[') {
                // [msg → 000]
                linkCount++;
                var res = block.match(regDaikakkoAnchor);
                if (res != null) {
                    var muki = RegExp.$2;
                    var toIdx = +(muki == '→' ? RegExp.$3 : RegExp.$1);
                    var msg = muki == '→' ? RegExp.$1 : RegExp.$3;
                    var elementId = 'link_' + idx + '_' + linkCount;
                    var link = '<span id="' + elementId + '" class="link">' + msg + '</span>';
                    blockHTMLs.push(link);
                    links.push({ elementId: elementId, toIdx: toIdx });
                }
            }
            else {
                // 「それ以外」
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
        var title = null;
        var html = blockHTMLs.join('');
        var titlehtml = html.split('◇');
        if (2 <= titlehtml.length) {
            title = titlehtml[0];
            html = titlehtml[1];
        }
        scene.title = title;
        scene.html = html;
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
    function go(idx, selectedElem) {
        if (selectedElem != null) {
            // 選択されたものを赤くする
            var parent_1 = null;
            if ($mode == TextAdv.MODE_MAKIMONO) {
                parent_1 = searchUpperElemnt(selectedElem, 'scene');
            }
            else {
                parent_1 = $display;
            }
            var elems = new Array();
            pickupElements(parent_1, 'link', elems);
            for (var i = 0; i < elems.length; i++) {
                elems[i].style.color = $linkColor;
            }
            selectedElem.style.color = $selectColor;
        }
        {
            // 次に表示する用にすでに表示しているものを消す
            var i = $step;
            while (true) {
                var elem = document.getElementById('sc' + i);
                if (elem == null) {
                    break;
                }
                elem.parentNode.removeChild(elem);
                i++;
            }
        }
        var scene = $scenes[idx];
        // HTML化
        if ($mode == TextAdv.MODE_MAKIMONO) {
            // HTMLとしてdivを作成し終端に取り付ける
            var id_1 = 'sc' + $step;
            var div = '<div id="' + id_1 + '" class="scene">' + scene.html + '</div><p>';
            var r = document.createRange();
            r.selectNode($display);
            $display.appendChild(r.createContextualFragment(div));
            (function (step) {
                document.getElementById(id_1).addEventListener('mouseover', function () {
                    $step = step + 1;
                });
            })($step);
            $step++;
        }
        else if ($mode == TextAdv.MODE_KAMISHIBAI) {
            // 中身を取り替える
            var id = $display.id;
            $display.innerHTML = scene.html;
            $step++;
        }
        for (var i = 0; i < scene.links.length; i++) {
            var linkElement = document.getElementById(scene.links[i].elementId);
            linkElement.style.color = 'blue';
            linkElement.style.textDecoration = 'underline';
            linkElement.style.cursor = 'pointer';
            (function (linkElement, toIdx) {
                linkElement.addEventListener('click', function (evt) { clickLink(evt, toIdx); });
            })(linkElement, scene.links[i].toIdx);
        }
        if (scene.title != null) {
            document.title = scene.title;
        }
        // 遷移順のシーン番号をスタックする
        $trace.push(idx);
        // 画面をスクロールする
        if ($mode == TextAdv.MODE_MAKIMONO) {
            scroll();
        }
    }
    TextAdv.go = go;
    function clickLink(evt, toIdx) {
        var idx = toIdx;
        var selectedElem = evt.srcElement;
        go(idx, selectedElem);
    }
    function back() {
        $trace.pop();
        var idx = $trace.pop();
        if (idx != null) {
            go(idx);
        }
    }
    TextAdv.back = back;
    function searchUpperElemnt(elem, className) {
        var parent = elem.parentNode;
        if (parent == null) {
            return null;
        }
        if (parent.className == className) {
            return parent;
        }
        return searchUpperElemnt(parent, className);
    }
    function pickupElements(parentElem, className, pickupElems) {
        if (pickupElems == null) {
            return;
        }
        var childElems = parentElem.childNodes;
        for (var i = 0; i < childElems.length; i++) {
            var elem = childElems.item(i);
            if (0 < elem.childNodes.length) {
                pickupElements(elem, className, pickupElems);
            }
            if (elem.className == className) {
                pickupElems.push(elem);
            }
        }
    }
    var $interval = 5;
    var $dy = 10;
    function scroll() {
        //        alert([document.body.clientHeight, window.innerHeight, window.pageYOffset, document.body.scrollHeight]);
        //        return;
        if (window.innerHeight + window.pageYOffset - $dy < document.body.scrollHeight) {
            window.scrollBy(0, $dy);
            setTimeout(arguments.callee, $interval);
        }
    }
    TextAdv.scroll = scroll;
})(TextAdv || (TextAdv = {}));
window.addEventListener('load', function () {
    var displayElement = document.getElementById('display');
    var sourceElement = document.getElementById('source');
    if (sourceElement != null && displayElement != null) {
        TextAdv.initialize(displayElement, sourceElement.value);
        TextAdv.start();
    }
});
//# sourceMappingURL=TextAdv.js.map