namespace Kyoutsu {

	export function getElementById(elementId: string): HTMLElement {
		let elm: HTMLElement | null = document.getElementById(elementId);
		if (elm == null) {
			throw elementId + ' is not found.';
		}
		return elm;
	}

	export class Message {
		board: HTMLDivElement | null = null;

		set(board: HTMLDivElement): void {
			this.board = board;
		}

		clear = (): void => {
			if (this.board == null) {
				return;
			}
			this.board.innerHTML = '';
		}

		add = (text: string): void => {
			if (this.board == null) {
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
			if (this.board == null) {
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

	export const INPUT_UP: number = 1;
	export const INPUT_RIGHT: number = 2;
	export const INPUT_DOWN: number = 4;
	export const INPUT_LEFT: number = 8;

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

}