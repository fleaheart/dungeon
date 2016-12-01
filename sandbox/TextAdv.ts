namespace TextAdv {
    export const MODE_MAKIMONO: string = 'makimono';
    export const MODE_KAMISHIBAI: string = 'kamishibai';

    let $linkColor: string = 'blue';
    let $selectColor: string = 'red';

    let $step: number = 1;   // 遷移数
    let $trace: number[] = new Array();  // 遷移順配列
    let $mode: string = MODE_MAKIMONO;

    let $display: HTMLElement;
    let $scene: string[];

    export function initialize(display: HTMLElement, scene: string[]): void {
        $display = display;
        $scene = scene;
    }

    export function start(): void {
        $step = 1;
        go(0);
    }

    export function go(idx: number, selectedElem?: HTMLElement) {
        if (selectedElem != null) {
            // 選択されたものを赤くする
            let parent: HTMLElement = null;
            if ($mode == MODE_MAKIMONO) {
                parent = searchUpperElemnt(selectedElem, 'scene');
            } else {
                parent = $display;
            }

            let elems: HTMLElement[] = new Array();
            pickupElements(parent, 'link', elems);

            for (let i: number = 0; i < elems.length; i++) {
                elems[i].style.color = $linkColor;
            }
            selectedElem.style.color = $selectColor;
        }

        {
            // 次に表示する用にすでに表示しているものを消す
            let i: number = $step;
            while (true) {
                let elem: HTMLElement = document.getElementById('sc' + i);
                if (elem == null) {
                    break;
                }
                elem.parentNode.removeChild(elem);

                i++;
            }
        }

        let html: string = '';
        {
            // シーンを取り出す
            let bodyParts: string[] = $scene[idx].split('◇');
            if (2 <= bodyParts.length) {
                document.title = bodyParts[0];
                html = bodyParts[1];
            } else {
                html = $scene[idx];
            }
        }

        while (true) {
            // 遷移をアンカーに編集する
            let s: number = html.indexOf('[', 0),
                e: number = html.indexOf(']', 0);

            let before: string = null;
            let linkParts: string[] = null;

            if (0 <= s && 0 <= e) {
                before = html.substring(s, e + 1);
                linkParts = html.substring(s + 1, e).split('→');

                if (linkParts.length != 2) {
                    linkParts = html.substring(s + 1, e).split('←');
                    if (linkParts.length == 2) {
                        let swap = linkParts[0];
                        linkParts[0] = linkParts[1];
                        linkParts[1] = swap;
                    } else {
                        break;
                    }
                }
            } else {
                s = html.indexOf('→', 0);
                if (0 <= s) {
                    e = s + 1;
                    while (e < html.length) {
                        let c = html.charAt(e);
                        if (isNaN(Number(c)) || c == ' ') {
                            break;
                        }
                        e++;
                    }
                    before = html.substring(s, e);
                    let linkNum: string = html.substring(s + 1, e);
                    linkParts = new Array();
                    linkParts[0] = '⇒' + linkNum;
                    linkParts[1] = linkNum;
                } else {
                    break;
                }
            }

            if (linkParts == null) {
                break;
            }

            let after: string = '<span class="link" onclick="go(' + linkParts[1] + ', this);">' + linkParts[0] + '</span>';

            html = html.replace(before, after);
        }

        while (0 <= html.indexOf('⇒', 0)) {
            html = html.replace('⇒', '→');
        }

        let id: string = null;

        if ($mode == MODE_MAKIMONO) {
            // HTMLとしてdivを作成し終端に取り付ける
            id = 'sc' + $step;
            let div: string = '<div id="' + id + '" class="scene">' + html + '</div><p>';
            let r = document.createRange();
            r.selectNode($display);
            $display.appendChild(r.createContextualFragment(div));

            (function (step) {
                document.getElementById(id).addEventListener('mouseover', function () {
                    $step = step + 1;
                });
            })($step);

            $step++;

        } else if ($mode == MODE_KAMISHIBAI) {
            // 中身を取り替える
            id = $display.id;
            $display.innerHTML = html;
            $step++;
        }

        // 遷移順のシーン番号をスタックする
        $trace.push(idx);

        // 未選択カラーにする
        {
            let elems: HTMLElement[] = new Array();
            pickupElements(document.getElementById(id), 'link', elems);
            for (let i: number = 0; i < elems.length; i++) {
                elems[i].style.color = $linkColor;
                elems[i].style.textDecoration = 'underline';
                elems[i].style.cursor = 'pointer';
            }
        }

        // 画面をスクロールする
        if ($mode == MODE_MAKIMONO) {
            scroll();
        }
    }

    export function back() {
        $trace.pop();
        let idx: number = $trace.pop();

        if (idx != null) {
            go(idx);
        }
    }

    function searchUpperElemnt(elem: HTMLElement, className: string): HTMLElement {
        let parent: HTMLElement = <HTMLElement>elem.parentNode;
        if (parent == null) {
            return null;
        }

        if (parent.className == className) {
            return parent;
        }

        return searchUpperElemnt(parent, className);
    }

    function pickupElements(parentElem: HTMLElement, className: string, pickupElems: HTMLElement[]): void {
        if (pickupElems == null) {
            return;
        }

        let childElems: NodeList = parentElem.childNodes;
        for (let i: number = 0; i < childElems.length; i++) {
            let elem: HTMLElement = <HTMLElement>childElems.item(i);

            if (0 < elem.childNodes.length) {
                pickupElements(elem, className, pickupElems);
            }

            if (elem.className == className) {
                pickupElems.push(elem);
            }
        }
    }

    let $interval: number = 5;
    let $dy: number = 10;

    export function scroll(): void {
        if (document.body.clientHeight + window.pageYOffset < document.body.scrollHeight) {
            window.scrollBy(0, $dy);
            setTimeout(arguments.callee, $interval);
        }
    }

}
