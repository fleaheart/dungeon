namespace Kyoutsu {

	export function getElementById(elementId: string): HTMLElement {
		let elm: HTMLElement | null = document.getElementById(elementId);
		if (elm == null) {
			throw elementId + ' is not found.';
		}
		return elm;
	}

	/**
	 * クラス名を持つ親エレメントをさがす
	 */
	export function searchParentElement(target: HTMLElement, className: string): HTMLElement | null {
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

	export class Message {
		board: HTMLDivElement | undefined = undefined;

		set(board: HTMLDivElement): void {
			this.board = board;
		}

		clear = (): void => {
			if (this.board == undefined) {
				return;
			}
			this.board.innerHTML = '';
		}

		add = (text: string): void => {
			if (this.board == undefined) {
				return;
			}
			let html = this.board.innerHTML;
			if (html == '') {
				html = text;
			} else {
				html += ' / ' + text;
			}
			this.board.innerHTML = html;
		}

		writeLine = (text: string): void => {
			if (this.board == undefined) {
				return;
			}
			let html = this.board.innerHTML;
			html += text + '<br>';
			this.board.innerHTML = html;
		}
	}

	export function load(url: string): string {
		let res = '';

		let method: string = 'GET';
		let async: boolean = false;

		let xhr = new XMLHttpRequest();
		xhr.abort();

		xhr.open(method, url, async);
		xhr.setRequestHeader("If-Modified-Since", "Thu, 01 Jun 1970 00:00:00 GMT");

		xhr.addEventListener('readystatechange', (): void => {
			if (xhr.readyState == 4) {
				res = xhr.responseText;
			}
		});

		xhr.send();

		return res;
	};

	export const BIT_TOP: number = 1;
	export const BIT_RIGHT: number = 2;
	export const BIT_BOTTOM: number = 4;
	export const BIT_LEFT: number = 8;

	export const INPUT_UP: number = BIT_TOP;
	export const INPUT_RIGHT: number = BIT_RIGHT;
	export const INPUT_DOWN: number = BIT_BOTTOM;
	export const INPUT_LEFT: number = BIT_LEFT;

	export const INPUT_ESCAPE: number = 27;

	// keyCodeが必要になったらまた考える。案)getKeyCode(s: string): number
	export function getInputCode(key: string): number {
		if (key == 'w' || key == 'W') {
			return INPUT_UP;
		}
		if (key == 'd' || key == 'D') {
			return INPUT_RIGHT;
		}
		if (key == 's' || key == 'S') {
			return INPUT_DOWN;
		}
		if (key == 'a' || key == 'A') {
			return INPUT_LEFT;
		}
		if (key == 'Escape' || key == 'Esc') {
			return INPUT_ESCAPE;
		}

		return 0;
	}

	export class Keyboard {
		keyboard: HTMLDivElement = <HTMLDivElement>document.createElement('DIV');
		keys: Array<HTMLElement> = new Array<HTMLElement>();

		constructor() {
			let keyboard = this.keyboard;
			keyboard.style.position = 'absolute';
			keyboard.style.width = '138px';
			keyboard.style.display = 'flex';
			keyboard.style.flexWrap = 'wrap';
			keyboard.style.border = '1px solid black';
			keyboard.style.padding = '2px';
			keyboard.style.textAlign = 'center';

			for (let i = 0; i < 9; i++) {
				let key = document.createElement('DIV');
				key.className = 'sofwareKey';
				key.style.display = 'inline-block';
				key.style.margin = '2px';
				key.style.width = '40px';
				key.style.height = '40px';
				key.style.border = '1px solid red';
				key.style.textAlign = 'center';
				keyboard.appendChild(key);

				this.keys.push(key);
			}
		}

		setKeyEvent(type: string, listener: EventListener) {
			for (let i = 0, len: number = this.keys.length; i < len; i++) {
				this.keys[i].addEventListener(type, listener);
			}
		}

		setKeytops(keytops: Array<string>): void {
			for (let i = 0, len: number = this.keys.length; i < len; i++) {
				let key: HTMLElement | undefined = this.keys[i];
				let keytop: string | undefined = keytops[i];
				if (key != undefined && keytop != undefined) {
					if (3 < keytop.length) {
						key.innerHTML = keytop.substr(0, 3) + '<span style="display:none">' + keytop.substr(3) + '</span>';
					} else {
						key.innerHTML = keytop;
					}
				}
			}
		}
	}

	export function getKeytop(target: EventTarget | HTMLElement | null): string {
		let element: HTMLElement | null = searchParentElement(<HTMLElement>target, 'sofwareKey');
		if (element == null) {
			return '';
		}

		let key: string | null = element.textContent;
		if (key == null) {
			return '';
		}

		return key;
	}

}