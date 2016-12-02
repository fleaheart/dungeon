namespace TextAdv {
    export const MODE_MAKIMONO: string = 'makimono';
    export const MODE_KAMISHIBAI: string = 'kamishibai';

    class Link {
        elementId: string;
        toIdx: number;
    }

    class Scene {
        idx: number;
        text: string;
        html: string;
        links: Link[];
    }

    let $linkColor: string = 'blue';
    let $selectColor: string = 'red';

    let $step: number = 1;   // 遷移数
    let $trace: number[] = new Array();  // 遷移順配列
    let $mode: string = MODE_MAKIMONO;

    let $display: HTMLElement;
    let $scenes: Scene[];

    export function analizeScene(idx: number, text: string): Scene {

        let scene: Scene = new Scene();

        scene.idx = idx;
        scene.text = text;

        let regDaikakkoAnchor: RegExp = /^\[([^←→]*)([←→]*)(.*)\]$/;
        let regYajirushiOnly: RegExp = /→\s*([0-9０-９]+)/;

        /*
         * 大括弧で囲まれたアンカー[msg → 000]と「それ以外」をわける。
         */
        let blocks: string[] = null;
        text = text.replace(/(\[[^\]]+\])/g, (s: string) => { return '##BLOCK##' + s + '##BLOCK##'; });
        blocks = text.split('##BLOCK##');

        /*
         * BLOCKごとにcreateContextualFragmentしようとしたが、アンカーをまたぐタグに対応できなかったので、アンカーも文字列で対応
         */
        let blockHTMLs: string[] = new Array();

        let links: Link[] = new Array();
        let linkCount: number = 0;

        for (let i = 0; i < blocks.length; i++) {
            let block: string = blocks[i];

            if (block.charAt(0) == '[') {
                // [msg → 000]
                linkCount++;
                let res: RegExpMatchArray = block.match(regDaikakkoAnchor);
                if (res != null) {
                    let muki: string = RegExp.$2;
                    let toIdx: number = +(muki == '→' ? RegExp.$3 : RegExp.$1);
                    let msg: string = muki == '→' ? RegExp.$1 : RegExp.$3;
                    let elementId: string = 'link_' + idx + '_' + linkCount;
                    let link: string = '<span id="' + elementId + '" class="link">' + msg + '</span>';

                    blockHTMLs.push(link);
                    links.push({ elementId, toIdx });
                }
            } else {
                // 「それ以外」
                while (true) {
                    let res: RegExpMatchArray = block.match(regYajirushiOnly);
                    if (res == null) {
                        break;
                    }

                    linkCount++;
                    let toIdx: number = toHankaku(RegExp.$1);
                    let msg: string = '⇒ ' + toIdx + ' ';
                    let elementId: string = 'link_' + idx + '_' + linkCount;
                    let link: string = '<span id="' + elementId + '" class="link">' + msg + '</span>';

                    block = block.replace(regYajirushiOnly, link);
                    links.push({ elementId, toIdx });
                }

                block = block.replace(/⇒ /g, '→ ');
                blockHTMLs.push(block);
            }
        }

        scene.html = blockHTMLs.join('');
        scene.links = links;

        return scene;
    }

    function toHankaku(s: string): number {
        return +(s.replace(/[０-９]/g, (s: string) => { return String.fromCharCode(s.charCodeAt(0) - 65248); }));
    }

    export function initialize(display: HTMLElement, scene: string[]): void {
        $display = display;
        $scenes = new Array();
        for (let i: number = 0, len = scene.length; i < len; i++) {
            $scenes.push(analizeScene(i, scene[i]));
        }
    }

    export function start(): void {
        $step = 1;
        go(0);
    }

    export function go(idx: number, selectedElem?: HTMLElement): void {
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

        let scene: Scene = $scenes[idx];

        // HTML化
        if ($mode == MODE_MAKIMONO) {
            // HTMLとしてdivを作成し終端に取り付ける
            let id = 'sc' + $step;
            let div: string = '<div id="' + id + '" class="scene">' + scene.html + '</div><p>';
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
            let id = $display.id;
            $display.innerHTML = scene.html;
            $step++;
        }

        for (let i: number = 0; i < scene.links.length; i++) {
            let linkElement: HTMLElement = document.getElementById(scene.links[i].elementId);
            linkElement.style.color = 'blue';
            linkElement.style.textDecoration = 'underline';
            linkElement.style.cursor = 'pointer';

            ((linkElement: HTMLElement, toIdx: number): void => {
                linkElement.addEventListener('click', (evt: Event): void => { clickLink(evt, toIdx); });
            })(linkElement, scene.links[i].toIdx);
        }

        // 遷移順のシーン番号をスタックする
        $trace.push(idx);

        // 画面をスクロールする
        if ($mode == MODE_MAKIMONO) {
            scroll();
        }

    }

    function clickLink(evt: Event, toIdx: number): void {
        let idx: number = toIdx;
        let selectedElem: HTMLElement = <HTMLElement>evt.srcElement;
        go(idx, selectedElem);
    }

    export function back(): void {
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
