namespace TextAdv {
    export const MODE_MAKIMONO: string = 'makimono';
    export const MODE_KAMISHIBAI: string = 'kamishibai';

    class Link {
        linkNo: number;
        toIdx: number;
    }

    class Scene {
        idx: number;
        text: string;
        title: string;
        html: string;
        links: Link[];
    }

    let $linkColor: string = 'blue';
    let $selectColor: string = 'red';

    let $trace: number[] = new Array();  // 遷移順配列
    let $mode: string = MODE_MAKIMONO;

    let $display: HTMLElement;
    let $scenes: Scene[];

    function analize(source: string): Scene[] {
        let scenes: Scene[] = new Array();

        let result: string = source.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
        let lines: string[] = result.split('\n');

        for (let i: number = 0, len: number = lines.length; i < len; i++) {
            lines[i] = lines[i].replace(/^\s*([\d０-９]+)\s*[:：]/, (m: string | null, g1: string): string => {
                m = null;    // mは捨てる
                g1 = '<>' + toHankaku(g1);
                return g1 + ':';
            });
        }

        let sceneWorks: string[] = lines.join('\n').split(/<>/);
        for (let i: number = 0, len: number = sceneWorks.length; i < len; i++) {
            let res: RegExpMatchArray | null = sceneWorks[i].match(/^(\d+):((\n|.)*)/m);
            if (res != null) {
                let idx: number = +res[1];
                let text: string = res[2];
                let scene: Scene = analizeScene(idx, text);
                scenes[idx] = scene;
            }
        }

        return scenes;
    }

    export function analizeScene(idx: number, text: string): Scene {
        let scene: Scene = new Scene();

        scene.idx = idx;
        scene.text = text;

        /*
         * 大括弧で囲まれたアンカー[msg → 000]と「それ以外」をわける。
         */
        let regDaikakkoCheck: RegExp = /((\[[^\]]+\])|(［[^］]+］))/g;
        let regDaikakkoAnchor: RegExp = /([^→\[\]［］]*)→\s*([0-9０-９]+)/; // msg → 000
        let regYajirushiOnly: RegExp = /→\s*([0-9０-９]+)/;   // → 000

        text = text.replace(regDaikakkoCheck, (s: string): string => { return '##BLOCK##' + s + '##BLOCK##'; });
        let blocks: string[] = text.split('##BLOCK##');

        /*
         * BLOCKごとにcreateContextualFragmentしようとしたが、アンカーをまたぐタグに対応できなかったので、アンカーも文字列で対応
         */
        let blockHTMLs: string[] = new Array();

        let links: Link[] = new Array();
        let linkCount: number = 0;

        for (let i: number = 0, len: number = blocks.length; i < len; i++) {
            let block: string = blocks[i];
            if (block.match(regDaikakkoCheck)) {
                // [msg → 000]
                let res: RegExpMatchArray | null = block.match(regDaikakkoAnchor);
                if (res != null) {
                    linkCount++;
                    let toIdx: number = +toHankaku(res[2]);
                    let msg: string = res[1].replace(/\s*$/, '');
                    let linkNo: number = linkCount;
                    let link: string = ' <span class="link">' + msg + '</span>';

                    blockHTMLs.push(link);
                    links.push({ linkNo, toIdx });
                }
            } else {
                // 「それ以外」
                while (true) {
                    let res: RegExpMatchArray | null = block.match(regYajirushiOnly);
                    if (res == null) {
                        break;
                    }
                    linkCount++;
                    let toIdx: number = toHankaku(res[1]);
                    let msg: string = '⇒ ' + toIdx;
                    let linkNo: number = linkCount;
                    let link: string = ' <span class="link">' + msg + '</span>';

                    block = block.replace(regYajirushiOnly, link);
                    links.push({ linkNo, toIdx });
                }

                block = block.replace(/⇒ /g, '→ ');
                blockHTMLs.push(block);
            }
        }

        let html: string = blockHTMLs.join('');
        let titlehtml: string[] = html.split('◇');
        if (2 <= titlehtml.length) {
            scene.title = titlehtml[0];
            scene.html = titlehtml[1];
        } else {
            scene.html = html;
        }

        scene.links = links;

        return scene;
    }

    function toHankaku(s: string): number {
        return +(s.replace(/[０-９]/g, (s: string): string => { return String.fromCharCode(s.charCodeAt(0) - 65248); }));
    }

    export function initialize(display: HTMLElement, source: string): void {
        $display = display;
        $scenes = analize(source);
    }

    export function start(): void {
        $display.innerHTML = '';
        go(0);
    }

    export function go(idx: number, selectedElm?: HTMLElement): void {
        let sceneElm: HTMLElement | null = null;
        let step: number = 0;
        if (selectedElm != null) {
            // 選択されたものを赤くする
            if ($mode == MODE_MAKIMONO) {
                sceneElm = searchUpperElement(selectedElm, 'scene');
            } else {
                sceneElm = $display;
            }

            if (sceneElm != null) {
                sceneElm.id.match(/^sc(\d+)$/);
                step = +RegExp.$1;

                let linkElms: HTMLElement[] = new Array();
                pickupElements(sceneElm, 'link', linkElms);
                for (let i: number = 0; i < linkElms.length; i++) {
                    linkElms[i].style.color = $linkColor;
                }
                selectedElm.style.color = $selectColor;
            }
        }

        // 次に表示する用にすでに表示しているものを消す
        let i: number = step + 1;
        while (true) {
            let elm: HTMLElement | null = document.getElementById('sc' + i);
            if (elm == null) {
                break;
            }
            $display.removeChild(elm);

            i++;
        }

        let scene: Scene = $scenes[idx];

        // HTML化
        step++;
        let sceneDiv: HTMLElement | null = null;
        if ($mode == MODE_MAKIMONO) {
            // HTMLとしてdivを作成し終端に取り付ける
            let elementId = 'sc' + step;
            let div: string = '<div id="' + elementId + '" class="scene">' + scene.html + '</div><p>';
            let r = document.createRange();
            r.selectNode($display);
            $display.appendChild(r.createContextualFragment(div));
            sceneDiv = document.getElementById(elementId);

        } else if ($mode == MODE_KAMISHIBAI) {
            // 中身を取り替える
            $display.innerHTML = scene.html;
            sceneDiv = $display;
        }

        if (sceneDiv != null) {
            let linkElms: HTMLElement[] = new Array();
            pickupElements(sceneDiv, 'link', linkElms);

            for (let i: number = 0, len: number = linkElms.length; i < len; i++) {
                let linkElm: HTMLElement = linkElms[i];
                if (linkElm.className == 'link') {
                    linkElm.style.color = 'blue';
                    linkElm.style.textDecoration = 'underline';
                    linkElm.style.cursor = 'pointer';

                    ((toIdx: number, linkElm: HTMLElement): void => {
                        linkElm.addEventListener('click', (): void => {
                            go(toIdx, linkElm);
                        });
                    })(scene.links[i].toIdx, linkElm);
                }
            }
        }

        if (scene.title != null) {
            document.title = scene.title;
        }

        // 遷移順のシーン番号をスタックする
        $trace.push(idx);

        // 画面をスクロールする
        if ($mode == MODE_MAKIMONO) {
            scroll();
        }

    }

    export function back(): void {
        $trace.pop();
        let idx: number | undefined = $trace.pop();
        if (idx != undefined) {
            go(idx);
        }
    }

    function searchUpperElement(elm: HTMLElement, className: string): HTMLElement | null {
        let parent: HTMLElement = <HTMLElement>elm.parentNode;
        if (parent == null) {
            return null;
        }

        if (parent.className == className) {
            return parent;
        }

        return searchUpperElement(parent, className);
    }

    function pickupElements(parentElm: HTMLElement, className: string, pickupElms: HTMLElement[]): void {
        if (pickupElms == null) {
            return;
        }

        let childElms: NodeList = parentElm.childNodes;
        for (let i: number = 0; i < childElms.length; i++) {
            let elm: HTMLElement = <HTMLElement>childElms.item(i);

            if (0 < elm.childNodes.length) {
                pickupElements(elm, className, pickupElms);
            }

            if (elm.className == className) {
                pickupElms.push(elm);
            }
        }
    }

    let $timer: number;
    let $interval: number = 5;
    let $dy: number = 10;

    export function scroll(): void {
        if (window.innerHeight + window.pageYOffset < document.body.scrollHeight) {
            window.scrollBy(0, $dy);
            $timer = setTimeout(arguments.callee, $interval);
            return;
        }
        clearTimeout($timer);
    }
}

window.addEventListener('load', (): void => {
    let displayElm: HTMLDivElement = <HTMLDivElement>document.getElementById('display');
    let sourceElm: HTMLTextAreaElement = <HTMLTextAreaElement>document.getElementById('source');
    if (sourceElm != null && displayElm != null) {
        TextAdv.initialize(displayElm, sourceElm.value);
        TextAdv.start();
    }
});
