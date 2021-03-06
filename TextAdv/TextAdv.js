"use strict";
var TextAdv;
(function (TextAdv) {
    TextAdv.MODE_MAKIMONO = 'makimono';
    TextAdv.MODE_KAMISHIBAI = 'kamishibai';
    var Link = (function () {
        function Link(linkNo, toIdx) {
            this.linkNo = 0;
            this.toIdx = 0;
            this.linkNo = linkNo;
            this.toIdx = toIdx;
        }
        return Link;
    }());
    TextAdv.Link = Link;
    var Scene = (function () {
        function Scene() {
            this.idx = 0;
            this.text = '';
            this.title = '';
            this.html = '';
            this.links = [];
            this.checked = false;
            this.steps = [];
        }
        return Scene;
    }());
    TextAdv.Scene = Scene;
    var $linkColor = 'blue';
    var $selectColor = 'red';
    var $trace = [];
    var $mode = TextAdv.MODE_MAKIMONO;
    var $display = undefined;
    var $scenes = [];
    var $scrlctrl = undefined;
    function analize(source) {
        var scenes = [];
        var result = source.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
        var lines = result.split('\n');
        for (var i = 0, len = lines.length; i < len; i++) {
            lines[i] = lines[i].replace(/^\s*([\d０-９]+)\s*[:：]/, function (_m, g1) {
                g1 = '<>' + toHankaku(g1);
                return g1 + ':';
            });
        }
        var sceneWorks = lines.join('\n').split(/<>/);
        for (var i = 0, len = sceneWorks.length; i < len; i++) {
            var res = sceneWorks[i].match(/^(\d+):((\n|.)*)/m);
            if (res != null) {
                var idx = Number(res[1]);
                var text = res[2];
                var scene = analizeScene(idx, text);
                scenes[idx] = scene;
            }
        }
        return scenes;
    }
    TextAdv.analize = analize;
    function analizeScene(idx, text) {
        var scene = new Scene();
        scene.idx = idx;
        scene.text = text;
        var regDaikakkoCheck = /((\[[^\]]+\])|(［[^］]+］))/g;
        var regDaikakkoAnchor = /([^→\[\]［］]*)→\s*([0-9０-９]+)/;
        var regYajirushiOnly = /→\s*([0-9０-９]+)/;
        text = text.replace(regDaikakkoCheck, function (s) { return '##BLOCK##' + s + '##BLOCK##'; });
        var blocks = text.split('##BLOCK##');
        var blockHTMLs = [];
        var links = [];
        var linkCount = 0;
        for (var i = 0, len = blocks.length; i < len; i++) {
            var block = blocks[i];
            if (block.match(regDaikakkoCheck)) {
                var res = block.match(regDaikakkoAnchor);
                if (res != null) {
                    linkCount++;
                    var toIdx = toHankaku(res[2]);
                    var msg = res[1].replace(/\s*$/, '');
                    var linkNo = linkCount;
                    var link = ' <span class="link">' + msg + '</span>';
                    blockHTMLs.push(link);
                    links.push(new Link(linkNo, toIdx));
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
                    links.push(new Link(linkNo, toIdx));
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
        return Number(s.replace(/[０-９]/g, function (s) { return String.fromCharCode(s.charCodeAt(0) - 65248); }));
    }
    function initialize(display, source) {
        $display = display;
        $scenes.length = 0;
        var list = analize(source);
        for (var i = 0, len = list.length; i < len; i++) {
            $scenes.push(list[i]);
        }
    }
    TextAdv.initialize = initialize;
    function start() {
        if ($display == undefined) {
            throw 'no initialized';
        }
        if ($scenes[0] != undefined) {
            $display.innerHTML = '';
            go(0);
        }
    }
    TextAdv.start = start;
    function go(idx, selectedElm) {
        if ($display == undefined) {
            throw 'no initialized';
        }
        var step = 0;
        if (selectedElm != undefined) {
            var sceneElm = null;
            if ($mode == TextAdv.MODE_MAKIMONO) {
                sceneElm = searchParentElement(selectedElm, 'scene');
            }
            else if ($mode == TextAdv.MODE_KAMISHIBAI) {
                sceneElm = $display;
            }
            else {
                throw 'unreachable';
            }
            if (sceneElm != null) {
                var res = sceneElm.id.match(/^sc(\d+)$/);
                if (res != null) {
                    step = Number(RegExp.$1);
                }
                var linkElms_1 = [];
                pickupElements(sceneElm, 'link', linkElms_1);
                for (var i = 0; i < linkElms_1.length; i++) {
                    linkElms_1[i].style.color = $linkColor;
                }
                selectedElm.style.color = $selectColor;
            }
        }
        if ($mode == TextAdv.MODE_MAKIMONO) {
            var i = step + 1;
            while (true) {
                var elm = document.getElementById('sc' + i);
                if (elm == null) {
                    break;
                }
                $display.removeChild(elm);
                i++;
            }
        }
        var scene = $scenes[idx];
        var sceneDiv;
        if ($mode == TextAdv.MODE_MAKIMONO) {
            step++;
            sceneDiv = document.createElement('DIV');
            sceneDiv.id = 'sc' + step;
            sceneDiv.className = 'scene';
            sceneDiv.innerHTML = scene.html;
            $display.appendChild(sceneDiv);
        }
        else if ($mode == TextAdv.MODE_KAMISHIBAI) {
            $display.innerHTML = scene.html;
            sceneDiv = $display;
        }
        else {
            throw 'unreachable';
        }
        var linkElms = [];
        pickupElements(sceneDiv, 'link', linkElms);
        var _loop_1 = function (i, len) {
            var linkElm = linkElms[i];
            if (linkElm.className == 'link') {
                linkElm.style.color = 'blue';
                linkElm.style.textDecoration = 'underline';
                linkElm.style.cursor = 'pointer';
                linkElm.addEventListener('click', function () {
                    go(scene.links[i].toIdx, linkElm);
                });
            }
        };
        for (var i = 0, len = linkElms.length; i < len; i++) {
            _loop_1(i, len);
        }
        if (scene.title != '') {
            document.title = scene.title;
        }
        $trace.push(idx);
        if ($mode == TextAdv.MODE_MAKIMONO) {
            if (selectedElm == undefined) {
                return;
            }
            if ($scrlctrl == undefined) {
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
    function searchParentElement(target, className) {
        var element = target;
        while (true) {
            if (element == null) {
                break;
            }
            if (element instanceof HTMLElement) {
                if (element.classList.contains(className)) {
                    return element;
                }
            }
            element = element.parentNode;
        }
        return null;
    }
    function pickupElements(parentElm, className, pickupElms) {
        var childElms = parentElm.childNodes;
        for (var i = 0; i < childElms.length; i++) {
            var item = childElms.item(i);
            if (item instanceof HTMLElement) {
                if (0 < item.childNodes.length) {
                    pickupElements(item, className, pickupElms);
                }
                if (item.className == className) {
                    pickupElms.push(item);
                }
            }
        }
    }
    var ScrollCtrl = (function () {
        function ScrollCtrl(display) {
            var _this = this;
            this.scrolling = function () {
                if (_this.selectedElm == undefined) {
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
                _this.selectedElm = undefined;
            };
            this.timer = 0;
            this.interval = 5;
            this.dy = 10;
            this.base = display;
            this.selectedElm = undefined;
            this.lastTop = 0;
            while (this.base.style.height == '') {
                if (this.base.tagName == 'BODY') {
                    break;
                }
                var elm = this.base.parentNode;
                if (elm == null) {
                    break;
                }
                if (elm instanceof HTMLElement) {
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
    var CheckSourceResult = (function () {
        function CheckSourceResult() {
            this.log = '';
            this.mugenStopper = 0;
            this.sceneCount = 0;
            this.maxIdx = 0;
            this.nukeIdxs = [];
            this.existsStartScene = false;
            this.errorMessages = [];
        }
        CheckSourceResult.prototype.logging = function (text) {
            this.log += text;
        };
        return CheckSourceResult;
    }());
    TextAdv.$result = new CheckSourceResult();
    function checkSource(source) {
        TextAdv.$result = new CheckSourceResult();
        var analyzeScenes = analize(source);
        var scenes = [];
        analyzeScenes.forEach(function (scene) {
            if (scene != undefined) {
                TextAdv.$result.sceneCount++;
                var idx = scene.idx;
                if (TextAdv.$result.maxIdx < idx) {
                    TextAdv.$result.maxIdx = idx;
                }
                scenes.push(scene);
            }
        });
        scenes.sort(function (a, b) { return a.idx - b.idx; });
        TextAdv.$result.logging('シーン数: ' + TextAdv.$result.sceneCount + ' (' + analyzeScenes.length + ', ' + scenes.length + ')<br>');
        TextAdv.$result.logging('最大シーンインデックス: ' + TextAdv.$result.maxIdx + '<br>');
        TextAdv.$result.logging('シーンインデックス:');
        var nukeCheckIdx = 0;
        for (var i = 0, len = scenes.length; i < len; i++) {
            var scene = scenes[i];
            TextAdv.$result.logging(' ' + scene.idx);
            if (scene.idx == 0) {
                TextAdv.$result.existsStartScene = true;
            }
            while (nukeCheckIdx < scene.idx) {
                TextAdv.$result.nukeIdxs.push(nukeCheckIdx);
                nukeCheckIdx++;
            }
            nukeCheckIdx++;
        }
        TextAdv.$result.logging('<br>');
        TextAdv.$result.logging('インデックス抜け: ' + TextAdv.$result.nukeIdxs + '<br>');
        if (TextAdv.$result.existsStartScene) {
            var steps = [];
            checkScene(scenes, 0, steps);
            TextAdv.$result.logging(' 無限ストッパーカウント: ' + TextAdv.$result.mugenStopper + '<br>');
        }
        else {
            TextAdv.$result.logging('スタートシーン[0]が存在しません<br>');
            TextAdv.$result.errorMessages.push('スタートシーン[0]が存在しません');
        }
        scenes.forEach(function (scene) {
            if (!scene.checked) {
                TextAdv.$result.errorMessages.push('シーン[' + scene.idx + ']はどこからも呼び出されていません');
            }
        });
        TextAdv.$result.errorMessages.forEach(function (message) {
            TextAdv.$result.logging(message + '<br>');
        });
    }
    TextAdv.checkSource = checkSource;
    function checkScene(scenes, idx, steps) {
        if (10000 < TextAdv.$result.mugenStopper) {
            return;
        }
        TextAdv.$result.mugenStopper++;
        steps.push(idx);
        var scene = pickupScene(scenes, idx);
        if (scene == null) {
            TextAdv.$result.logging('シーン[' + idx + ']はみつからないのにチェックしようとしました<br>');
            TextAdv.$result.errorMessages.push('シーン[' + idx + ']はみつからないのにチェックしようとしました');
            return;
        }
        scene.steps = steps;
        for (var j = 0, jlen = scene.links.length; j < jlen; j++) {
            var link = scene.links[j];
            var toIdx = link.toIdx;
            TextAdv.$result.logging(scene.steps + ' →[' + toIdx + ']');
            var toScene = pickupScene(scenes, toIdx);
            if (toScene == null) {
                TextAdv.$result.logging(' リンク先がみつかりません<br>');
                TextAdv.$result.errorMessages.push('シーン[' + scene.idx + ']のリンク先[' + link.toIdx + ']がみつかりません');
            }
            else {
                if (!toScene.checked) {
                    var hit = false;
                    for (var i = 0, len = steps.length; i < len; i++) {
                        if (steps[i] == toIdx) {
                            TextAdv.$result.logging(' 無限ループを検出しました');
                            TextAdv.$result.errorMessages.push('シーン[' + scene.idx + ']のリンク（→' + link.toIdx + '）はここまでの到達ステップ(' + scene.steps + ')のいずれかに戻ります');
                            hit = true;
                            break;
                        }
                    }
                    TextAdv.$result.logging('<br>');
                    if (!hit) {
                        checkScene(scenes, toIdx, arrayClone(steps));
                    }
                }
                else {
                    TextAdv.$result.logging(' チェック済です<br>');
                }
            }
        }
        scene.checked = true;
    }
    function pickupScene(scenes, idx) {
        for (var i = 0, len = scenes.length; i < len; i++) {
            var scene = scenes[i];
            if (scene != undefined && scene.idx == idx) {
                return scene;
            }
        }
        return null;
    }
    function arrayClone(array) {
        var cloneArray = [];
        array.forEach(function (value) {
            cloneArray.push(value);
        });
        return cloneArray;
    }
})(TextAdv || (TextAdv = {}));
window.addEventListener('load', function () {
    var displayElm = document.getElementById('display');
    var sourceElm = document.getElementById('source');
    if (displayElm instanceof HTMLElement && sourceElm instanceof HTMLTextAreaElement) {
        TextAdv.initialize(displayElm, sourceElm.value);
        TextAdv.start();
    }
});
//# sourceMappingURL=TextAdv.js.map