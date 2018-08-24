namespace TextAdv {
    type DisplyMode = 'makimono' | 'kamishibai';
    export const MODE_MAKIMONO: DisplyMode = 'makimono';
    export const MODE_KAMISHIBAI: DisplyMode = 'kamishibai';

    export class Link {
        linkNo: number = 0;
        toIdx: number = 0;

        constructor(linkNo: number, toIdx: number) {
            this.linkNo = linkNo;
            this.toIdx = toIdx;
        }
    }

    export class Scene {
        idx: number = 0;
        text: string = '';
        title: string = '';
        html: string = '';
        links: Array<Link> = new Array<Link>();
        // 妥当性用
        checked: boolean = false;
        steps: Array<number> = new Array<number>();
    }

    let $linkColor: string = 'blue';
    let $selectColor: string = 'red';

    let $trace = new Array<number>();  // 遷移順配列
    let $mode: DisplyMode = MODE_MAKIMONO;

    let $display: HTMLElement;
    let $scenes: Array<Scene>;
    let $scrlctrl: ScrollCtrl | undefined = undefined;

    export function analize(source: string): Array<Scene> {
        let scenes: Array<Scene> = new Array<Scene>();

        let result: string = source.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
        let lines: Array<string> = result.split('\n');

        for (let i = 0, len: number = lines.length; i < len; i++) {
            lines[i] = lines[i].replace(/^\s*([\d０-９]+)\s*[:：]/, (_m: string | null, g1: string): string => {
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
                    links.push(new Link(linkNo, toIdx));
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
                    links.push(new Link(linkNo, toIdx));
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
        if ($scenes[0] != undefined) {
            $display.innerHTML = '';
            go(0);
        }
    }

    export function go(idx: number, selectedElm?: HTMLElement): void {
        let step = 0;   // MODE_MAKIMONO用
        if (selectedElm != undefined) {
            // 選択されたものを赤くする
            let sceneElm: HTMLElement | null = null;
            if ($mode == MODE_MAKIMONO) {
                sceneElm = searchParentElement(selectedElm, 'scene');
            } else if ($mode == MODE_KAMISHIBAI) {
                sceneElm = $display;
            } else {
                throw 'unreachable';
            }

            if (sceneElm != null) {
                let res: RegExpMatchArray | null = sceneElm.id.match(/^sc(\d+)$/);
                if (res != null) {
                    step = +RegExp.$1;
                }

                let linkElms = new Array<HTMLElement>();
                pickupElements(sceneElm, 'link', linkElms);
                for (let i = 0; i < linkElms.length; i++) {
                    linkElms[i].style.color = $linkColor;
                }
                selectedElm.style.color = $selectColor;
            }
        }

        if ($mode == MODE_MAKIMONO) {
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
        }

        let scene: Scene = $scenes[idx];

        // HTML化
        let sceneDiv: HTMLElement;
        if ($mode == MODE_MAKIMONO) {
            step++;
            // divを作成し終端に取り付ける
            sceneDiv = document.createElement('DIV');
            sceneDiv.id = 'sc' + step;
            sceneDiv.className = 'scene';
            sceneDiv.innerHTML = scene.html;
            $display.appendChild(sceneDiv);
        } else if ($mode == MODE_KAMISHIBAI) {
            // 中身を取り替える
            $display.innerHTML = scene.html;
            sceneDiv = $display;
        } else {
            throw 'unreachable';
        }

        // リンクにアンカーをつける
        let linkElms = new Array<HTMLElement>();
        pickupElements(sceneDiv, 'link', linkElms);

        for (let i = 0, len: number = linkElms.length; i < len; i++) {
            let linkElm: HTMLElement = linkElms[i];
            if (linkElm.className == 'link') {
                linkElm.style.color = 'blue';
                linkElm.style.textDecoration = 'underline';
                linkElm.style.cursor = 'pointer';

                linkElm.addEventListener('click', (): void => {
                    go(scene.links[i].toIdx, linkElm);
                });
            }
        }

        if (scene.title != '') {
            document.title = scene.title;
        }

        // 遷移順のシーン番号をスタックする
        $trace.push(idx);

        // 画面をスクロールする
        if ($mode == MODE_MAKIMONO) {
            if (selectedElm == undefined) {
                return;
            }

            if ($scrlctrl == undefined) {
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

    /**
     * Kyoutsu.searchParentElementと一緒
     */
    function searchParentElement(target: HTMLElement, className: string): HTMLElement | null {
		let element: HTMLElement | Node | null = target;

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

    function pickupElements(parentElm: HTMLElement, className: string, pickupElms: Array<HTMLElement>): void {
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
        private selectedElm: HTMLElement | undefined;
        private lastTop: number;

        constructor(display: HTMLElement) {
            this.timer = 0;
            this.interval = 5;
            this.dy = 10;
            this.base = display;
            this.selectedElm = undefined;
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
            if (this.selectedElm == undefined) {
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
            this.selectedElm = undefined;
        }
    }

    // ソース妥当性チェック部
    class CheckSourceResult {
        log: string = '';
        mugenStopper: number = 0;
        sceneCount: number = 0;
        maxIdx: number = 0;
        nukeIdxs: Array<number> = new Array<number>();
        existsStartScene: boolean = false;
        errorMessages: Array<string> = new Array<string>();

        logging(text: string): void {
            this.log += text;
        }
    }
    export let $result: CheckSourceResult = new CheckSourceResult();

    export function checkSource(source: string): void {
        $result = new CheckSourceResult();

        let analyzeScenes = analize(source);

        // undefinedをつめる
        let scenes = new Array<Scene>();
        analyzeScenes.forEach(scene => {
            if (scene != undefined) {
                $result.sceneCount++;
                let idx: number = scene.idx;
                if ($result.maxIdx < idx) {
                    $result.maxIdx = idx;
                }
                scenes.push(scene);
            }
        });

        scenes.sort((a: Scene, b: Scene): number => { return a.idx - b.idx; });

        $result.logging('シーン数: ' + $result.sceneCount + ' (' + analyzeScenes.length + ', ' + scenes.length + ')<br>');
        $result.logging('最大シーンインデックス: ' + $result.maxIdx + '<br>');

        $result.logging('シーンインデックス:');
        let nukeCheckIdx = 0;
        for (let i = 0, len: number = scenes.length; i < len; i++) {
            let scene: Scene = scenes[i];
            $result.logging(' ' + scene.idx);
            if (scene.idx == 0) {
                $result.existsStartScene = true;
            }
            while (nukeCheckIdx < scene.idx) {
                $result.nukeIdxs.push(nukeCheckIdx);
                nukeCheckIdx++
            }
            nukeCheckIdx++;
        }
        $result.logging('<br>');
        $result.logging('インデックス抜け: ' + $result.nukeIdxs + '<br>');

        if ($result.existsStartScene) {
            let steps = new Array<number>();
            checkScene(scenes, 0, steps);
            $result.logging(' 無限ストッパーカウント: ' + $result.mugenStopper + '<br>');
        } else {
            $result.logging('スタートシーン[0]が存在しません<br>');
            $result.errorMessages.push('スタートシーン[0]が存在しません');
        }

        scenes.forEach(scene => {
            if (!scene.checked) {
                $result.errorMessages.push('シーン[' + scene.idx + ']はどこからも呼び出されていません');
            }
        });

        $result.errorMessages.forEach(message => {
            $result.logging(message + '<br>');
        });
    }

    function checkScene(scenes: Array<Scene>, idx: number, steps: Array<number>): void {
        if (10000 < $result.mugenStopper) { return; } $result.mugenStopper++;

        steps.push(idx);

        let scene: Scene | null = pickupScene(scenes, idx);
        if (scene == null) {
            $result.logging('シーン[' + idx + ']はみつからないのにチェックしようとしました<br>');
            $result.errorMessages.push('シーン[' + idx + ']はみつからないのにチェックしようとしました');
            return;
        }

        scene.steps = steps;

        for (let j = 0, jlen: number = scene.links.length; j < jlen; j++) {
            let link: Link = scene.links[j];
            let toIdx = link.toIdx;
            $result.logging(scene.steps + ' →[' + toIdx + ']');

            let toScene: Scene | null = pickupScene(scenes, toIdx);

            if (toScene == null) {
                $result.logging(' リンク先がみつかりません<br>');
                $result.errorMessages.push('シーン[' + scene.idx + ']のリンク先[' + link.toIdx + ']がみつかりません');
            } else {
                if (!toScene.checked) {
                    let hit = false;
                    for (let i = 0, len: number = steps.length; i < len; i++) {
                        if (steps[i] == toIdx) {
                            $result.logging(' 無限ループを検出しました');
                            $result.errorMessages.push('シーン[' + scene.idx + ']のリンク（→' + link.toIdx + '）はここまでの到達ステップ(' + scene.steps + ')のいずれかに戻ります');
                            hit = true;
                            break;
                        }
                    }
                    $result.logging('<br>');
                    if (!hit) {
                        checkScene(scenes, toIdx, arrayClone(steps));
                    }
                } else {
                    $result.logging(' チェック済です<br>');
                }
            }
        }

        scene.checked = true;
    }

    function pickupScene(scenes: Array<Scene>, idx: number): Scene | null {
        for (let i = 0, len = scenes.length; i < len; i++) {
            let scene: Scene = scenes[i];
            if (scene != undefined && scene.idx == idx) {
                return scene;
            }
        }
        return null;
    }

    function arrayClone<T>(array: Array<T>): Array<T> {
        let cloneArray = new Array<T>();
        array.forEach(value => {
            cloneArray.push(value);
        });
        return cloneArray;
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
