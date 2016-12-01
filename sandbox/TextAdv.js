var TextAdv;
(function (TextAdv) {
    TextAdv.MODE_MAKIMONO = 'makimono';
    TextAdv.MODE_KAMISHIBAI = 'kamishibai';
    var $linkColor = 'blue';
    var $selectColor = 'red';
    var $step = 1; // 遷移数
    var $trace = new Array(); // 遷移順配列
    var $mode = TextAdv.MODE_MAKIMONO;
    var $display;
    var $scene;
    function initialize(display, scene) {
        $display = display;
        $scene = scene;
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
        var html = '';
        {
            // シーンを取り出す
            var bodyParts = $scene[idx].split('◇');
            if (2 <= bodyParts.length) {
                document.title = bodyParts[0];
                html = bodyParts[1];
            }
            else {
                html = $scene[idx];
            }
        }
        while (true) {
            // 遷移をアンカーに編集する
            var s = html.indexOf('[', 0), e = html.indexOf(']', 0);
            var before = null;
            var linkParts = null;
            if (0 <= s && 0 <= e) {
                before = html.substring(s, e + 1);
                linkParts = html.substring(s + 1, e).split('→');
                if (linkParts.length != 2) {
                    linkParts = html.substring(s + 1, e).split('←');
                    if (linkParts.length == 2) {
                        var swap = linkParts[0];
                        linkParts[0] = linkParts[1];
                        linkParts[1] = swap;
                    }
                    else {
                        break;
                    }
                }
            }
            else {
                s = html.indexOf('→', 0);
                if (0 <= s) {
                    e = s + 1;
                    while (e < html.length) {
                        var c = html.charAt(e);
                        if (isNaN(Number(c)) || c == ' ') {
                            break;
                        }
                        e++;
                    }
                    before = html.substring(s, e);
                    var linkNum = html.substring(s + 1, e);
                    linkParts = new Array();
                    linkParts[0] = '⇒' + linkNum;
                    linkParts[1] = linkNum;
                }
                else {
                    break;
                }
            }
            if (linkParts == null) {
                break;
            }
            var after = '<span class="link" onclick="go(' + linkParts[1] + ', this);">' + linkParts[0] + '</span>';
            html = html.replace(before, after);
        }
        while (0 <= html.indexOf('⇒', 0)) {
            html = html.replace('⇒', '→');
        }
        var id = null;
        if ($mode == TextAdv.MODE_MAKIMONO) {
            // HTMLとしてdivを作成し終端に取り付ける
            id = 'sc' + $step;
            var div = '<div id="' + id + '" class="scene">' + html + '</div><p>';
            var r = document.createRange();
            r.selectNode($display);
            $display.appendChild(r.createContextualFragment(div));
            (function (step) {
                document.getElementById(id).addEventListener('mouseover', function () {
                    $step = step + 1;
                });
            })($step);
            $step++;
        }
        else if ($mode == TextAdv.MODE_KAMISHIBAI) {
            // 中身を取り替える
            id = $display.id;
            $display.innerHTML = html;
            $step++;
        }
        // 遷移順のシーン番号をスタックする
        $trace.push(idx);
        // 未選択カラーにする
        {
            var elems = new Array();
            pickupElements(document.getElementById(id), 'link', elems);
            for (var i = 0; i < elems.length; i++) {
                elems[i].style.color = $linkColor;
                elems[i].style.textDecoration = 'underline';
                elems[i].style.cursor = 'pointer';
            }
        }
        // 画面をスクロールする
        if ($mode == TextAdv.MODE_MAKIMONO) {
            scroll();
        }
    }
    TextAdv.go = go;
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
        if (document.body.clientHeight + window.pageYOffset < document.body.scrollHeight) {
            window.scrollBy(0, $dy);
            setTimeout(arguments.callee, $interval);
        }
    }
    TextAdv.scroll = scroll;
})(TextAdv || (TextAdv = {}));
//# sourceMappingURL=TextAdv.js.map