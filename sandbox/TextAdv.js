var MODE_MAKIMONO = 'makimono';
var MODE_KAMISHIBAI = 'kamishibai';
var TextAdv = (function () {
    function TextAdv(display, scene) {
        this.display = display;
        this.scene = scene;
        this.linkColor = 'blue';
        this.selectColor = 'red';
        this.currentStep = null;
        this.step = 1;
        this.trace = new Array();
        this.mode = MODE_MAKIMONO;
        this.interval = 100;
        this.dy = 10;
    }
    TextAdv.prototype.start = function () {
        this.step = 1;
        this.go(0);
    };
    TextAdv.prototype.go = function (idx, selectedElem) {
        if (selectedElem != null) {
            var parent_1 = null;
            if (this.mode == MODE_MAKIMONO) {
                parent_1 = this.searchUpperElemnt(selectedElem, 'scene');
            }
            else {
                parent_1 = this.display;
            }
            var elems = new Array();
            this.pickupElements(parent_1, 'link', elems);
            for (var i = 0; i < elems.length; i++) {
                elems[i].style.color = this.linkColor;
            }
            selectedElem.style.color = this.selectColor;
        }
        // 次に表示する用にすでに表示しているものを消す
        {
            var i = this.step;
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
            var bodyParts = this.scene[idx].split('◇');
            if (2 <= bodyParts.length) {
                document.title = bodyParts[0];
                html = bodyParts[1];
            }
            else {
                html = this.scene[idx];
            }
        }
        while (true) {
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
                var cc = 2;
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
        if (this.mode == MODE_MAKIMONO) {
            id = 'sc' + this.step;
            var div = '<div id="' + id + '" class="scene">' + html + '</div><p>';
            var r = document.createRange();
            r.selectNode(this.display);
            this.display.appendChild(r.createContextualFragment(div));
            (function (xthis, step) {
                document.getElementById(id).addEventListener('mouseover', function () {
                    xthis.step = step + 1;
                });
            })(this, this.step);
            this.step++;
        }
        else if (this.mode == MODE_KAMISHIBAI) {
            id = this.display.id;
            this.display.innerHTML = html;
            this.step++;
        }
        this.trace.push(idx);
        {
            var elems = new Array();
            this.pickupElements(document.getElementById(id), 'link', elems);
            for (var i = 0; i < elems.length; i++) {
                elems[i].style.color = this.linkColor;
                elems[i].style.textDecoration = 'underline';
                elems[i].style.cursor = 'pointer';
            }
        }
        if (this.mode == MODE_MAKIMONO) {
        }
    };
    TextAdv.prototype.back = function () {
        this.trace.pop();
        var idx = this.trace.pop();
        if (idx != null) {
            this.go(idx);
        }
    };
    TextAdv.prototype.searchUpperElemnt = function (elem, className) {
        var parent = elem.parentNode;
        if (parent == null) {
            return null;
        }
        if (parent.className == className) {
            return parent;
        }
        return this.searchUpperElemnt(parent, className);
    };
    TextAdv.prototype.pickupElements = function (parentElem, className, pickupElems) {
        if (pickupElems == null) {
            return;
        }
        var childElems = parentElem.childNodes;
        for (var i = 0; i < childElems.length; i++) {
            var elem = childElems.item(i);
            if (0 < elem.childNodes.length) {
                this.pickupElements(elem, className, pickupElems);
            }
            if (elem.className == className) {
                pickupElems.push(elem);
            }
        }
    };
    TextAdv.prototype.scroll = function () {
        if (document.body.clientHeight + window.pageYOffset < document.body.scrollHeight) {
            window.scrollBy(0, 10);
            setTimeout(arguments.callee, 1);
        }
    };
    return TextAdv;
}());
//# sourceMappingURL=TextAdv.js.map