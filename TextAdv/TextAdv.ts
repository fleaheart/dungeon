namespace TextAdv {
    type DisplyMode = 'makimono' | 'kamishibai';
    export const MODE_MAKIMONO: DisplyMode = 'makimono';
    export const MODE_KAMISHIBAI: DisplyMode = 'kamishibai';

    class Link {
        linkNo: number;
        toIdx: number;
    }

    class Scene {
        idx: number;
        text: string;
        title: string;
        html: string;
        links: Array<Link>;
    }

    let $linkColor: string = 'blue';
    let $selectColor: string = 'red';

    let $trace = new Array<number>();  // 遷移順配列
    let $mode: DisplyMode = MODE_MAKIMONO;

    let $display: HTMLElement;
    let $scenes: Array<Scene>;
    let $scrlctrl: ScrollCtrl | null = null;

    function analize(source: string): Array<Scene> {
        let scenes: Array<Scene> = new Array<Scene>();

        let result: string = source.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
        let lines: Array<string> = result.split('\n');

        for (let i = 0, len: number = lines.length; i < len; i++) {
            lines[i] = lines[i].replace(/^\s*([\d０-９]+)\s*[:：]/, (m: string | null, g1: string): string => {
                if (m != null) {
                    m = null;    // mは捨てる warning回避コード
                }
                g1 = '<>' + toHankaku(g1);
                return g1 + ':';
            });
        }

        let sceneWorks: Array<string> = lines.join('\n').split(/<>/);
        for (let i = 0, len: number = sceneWorks.length; i < len; i++) {
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
        let blocks: Array<string> = text.split('##BLOCK##');

        /*
         * BLOCKごとにcreateContextualFragmentしようとしたが、アンカーをまたぐタグに対応できなかったので、アンカーも文字列で対応
         */
        let blockHTMLs = new Array<string>();

        let links = new Array<Link>();
        let linkCount = 0;

        for (let i = 0, len: number = blocks.length; i < len; i++) {
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
        let titlehtml: Array<string> = html.split('◇');
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
        let step = 0;
        if (selectedElm != undefined) {
            // 選択されたものを赤くする
            if ($mode == MODE_MAKIMONO) {
                sceneElm = searchUpperElement(selectedElm, 'scene');
            } else {
                sceneElm = $display;
            }

            if (sceneElm != null) {
                sceneElm.id.match(/^sc(\d+)$/);
                step = +RegExp.$1;

                let linkElms = new Array<HTMLElement>();
                pickupElements(sceneElm, 'link', linkElms);
                for (let i = 0; i < linkElms.length; i++) {
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
            let linkElms = new Array<HTMLElement>();
            pickupElements(sceneDiv, 'link', linkElms);

            for (let i = 0, len: number = linkElms.length; i < len; i++) {
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
            if (selectedElm == undefined) {
                return;
            }

            if ($scrlctrl == null) {
                $scrlctrl = new ScrollCtrl($display);
            }
    
            $scrlctrl.scroll(selectedElm);
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
        let parent = <HTMLElement>elm.parentNode;
        if (parent == null) {
            return null;
        }

        if (parent.className == className) {
            return parent;
        }

        return searchUpperElement(parent, className);
    }

    function pickupElements(parentElm: HTMLElement, className: string, pickupElms: Array<HTMLElement>): void {
        if (pickupElms == null) {
            return;
        }

        let childElms: NodeList = parentElm.childNodes;
        for (let i = 0; i < childElms.length; i++) {
            let elm = <HTMLElement>childElms.item(i);
            if (0 < elm.childNodes.length) {
                pickupElements(elm, className, pickupElms);
            }

            if (elm.className == className) {
                pickupElms.push(elm);
            }
        }
    }

    class ScrollCtrl {
        private timer: number;
        private interval: number;
        private dy: number;
        private base: HTMLElement;
        private selectedElm: HTMLElement | null;
        private lastTop: number;

        constructor(display: HTMLElement) {
            this.timer = 0;
            this.interval = 5;
            this.dy = 10;
            this.base = display;
            this.selectedElm = null;
            this.lastTop = 0;

            // スクロールするelementの決定 height指定のあるもの
            while (this.base.style.height == '') {
                if (this.base.tagName == 'BODY') {
                    break;
                }
                let elm: Node | null = this.base.parentNode;
                if (elm == null) {
                    break;
                } else {
                    this.base = <HTMLElement>elm;
                }
            }
        }

        scroll(selectedElm: HTMLElement): void {
            this.selectedElm = selectedElm;
            let rect: ClientRect = this.selectedElm.getBoundingClientRect();
            this.lastTop = rect.top + 1;

            this.scrolling();
        }

        scrolling = (): void => {
            if (this.base == null || this.selectedElm == null) {
                return;
            }

            let rect: ClientRect = this.selectedElm.getBoundingClientRect();
            if (rect.top < this.lastTop && 20 < rect.top) {
                if (this.base.tagName == 'BODY') {
                    window.scrollBy(0, this.dy);
                } else {
                    this.base.scrollTop = this.base.scrollTop + this.dy;
                }
                this.timer = setTimeout(this.scrolling, this.interval);
                this.lastTop = rect.top;
                return;
            }

            // release
            clearTimeout(this.timer);
            this.selectedElm = null;
        }
    }
}

window.addEventListener('load', (): void => {
    let displayElm = <HTMLDivElement>document.getElementById('display');
    let sourceElm = <HTMLTextAreaElement>document.getElementById('source');
    if (sourceElm != null && displayElm != null) {
        TextAdv.initialize(displayElm, sourceElm.value);
        TextAdv.start();
    }
});
