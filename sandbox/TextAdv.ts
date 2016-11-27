
const MODE_MAKIMONO: string = 'makimono';
const MODE_KAMISHIBAI: string = 'kamishibai';

class TextAdv {
    public linkColor: string = 'blue';
    public selectColor: string = 'red';

    private currentStep: number = null;
    private step: number = 1;
    private trace: number[] = new Array();
    private mode: string = MODE_MAKIMONO;

    constructor(public display: HTMLElement, public scene: string[]) {

    }

    public start(): void {
        this.step = 1;
        this.go(0);
    }

    public go(idx: number, selectedElem?: HTMLElement) {
        if (selectedElem != null) {
            let parent: HTMLElement = null;
            if (this.mode == MODE_MAKIMONO) {
                parent = this.searchUpperElemnt(selectedElem, 'scene');
            } else {
                parent = this.display;
            }

            let elems: HTMLElement[] = new Array();
            this.pickupElements(parent, 'link', elems);

            for (let i: number = 0; i < elems.length; i++) {
                elems[i].style.color = this.linkColor;
            }
            selectedElem.style.color = this.selectColor;
        }

        // 次に表示する用にすでに表示しているものを消す
        {
            let i: number = this.step;
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
            let bodyParts: string[] = this.scene[idx].split('◇');
            if (2 <= bodyParts.length) {
                document.title = bodyParts[0];
                html = bodyParts[1];
            } else {
                html = this.scene[idx];
            }
        }

        while (true) {
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

        if (this.mode == MODE_MAKIMONO) {
            id = 'sc' + this.step;
            let div: string = '<div id="' + id + '" class="scene">' + html + '</div><p>';
            let r = document.createRange();
            r.selectNode(this.display);
            this.display.appendChild(r.createContextualFragment(div));

            (function (xthis, step) {
                document.getElementById(id).addEventListener('mouseover', function () {
                    xthis.step = step + 1;
                });
            })(this, this.step);

            this.step++;

        } else if (this.mode == MODE_KAMISHIBAI) {
            id = this.display.id;
            this.display.innerHTML = html;
            this.step++;
        }

        this.trace.push(idx);

        {
            let elems: HTMLElement[] = new Array();
            this.pickupElements(document.getElementById(id), 'link', elems);
            for (let i: number = 0; i < elems.length; i++) {
                elems[i].style.color = this.linkColor;
                elems[i].style.textDecoration = 'underline';
                elems[i].style.cursor = 'pointer';
            }
        }

        if (this.mode == MODE_MAKIMONO) {
            //    this.scroll();
        }
    }

    public back() {
        this.trace.pop();
        let idx: number = this.trace.pop();

        if (idx != null) {
            this.go(idx);
        }
    }

    private searchUpperElemnt(elem: HTMLElement, className: string): HTMLElement {
        let parent: HTMLElement = <HTMLElement>elem.parentNode;
        if (parent == null) {
            return null;
        }

        if (parent.className == className) {
            return parent;
        }

        return this.searchUpperElemnt(parent, className);
    }

    private pickupElements(parentElem: HTMLElement, className: string, pickupElems: HTMLElement[]): void {
        if (pickupElems == null) {
            return;
        }

        let childElems: NodeList = parentElem.childNodes;
        for (let i: number = 0; i < childElems.length; i++) {
            let elem: HTMLElement = <HTMLElement>childElems.item(i);

            if (0 < elem.childNodes.length) {
                this.pickupElements(elem, className, pickupElems);
            }

            if (elem.className == className) {
                pickupElems.push(elem);
            }
        }
    }

    private interval: number = 100;
    private dy: number = 10;

    public scroll(): void {
        if (document.body.clientHeight + window.pageYOffset < document.body.scrollHeight) {
            window.scrollBy(0, 10);
            setTimeout(arguments.callee, 1);
        }
    }

}
