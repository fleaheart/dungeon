namespace Dungeon {

	let $kabex: number[] = [5, 40, 114, 155, 180];
	let $kabey: number[] = [5, 31, 85, 115, 134];

	let $SCREEN_WIDTH: number = 400;
	let $SCREEN_HEIGHT: number = 300;

	let $DRAW_WIDTH: number = $SCREEN_WIDTH - $kabex[0] - $kabex[0];
	let $DRAW_HEIGHT: number = $SCREEN_HEIGHT - $kabey[0] - $kabey[0];

	interface XY {
		x: number;
		y: number;
	}

	type MukiType = 'n' | 'e' | 's' | 'w';
	type MukiChr = '↑' | '→' | '↓' | '←';

	interface Muki {
		index: number;
		mukiType: MukiType;
		mukiChr: MukiChr;
		bit: number;
		nextXY: XY;
	}

	class Muki_N implements Muki {
		readonly index: number = 0;
		readonly mukiType: MukiType = 'n';
		readonly mukiChr: MukiChr = '↑';
		readonly bit: number = Kyoutsu.BIT_TOP;
		readonly nextXY: XY = { x: 0, y: -1 };
	}
	let muki_n = new Muki_N();

	class Muki_E implements Muki {
		readonly index: number = 1;
		readonly mukiType: MukiType = 'e';
		readonly mukiChr: MukiChr = '→';
		readonly bit: number = Kyoutsu.BIT_RIGHT;
		readonly nextXY: XY = { x: 1, y: 0 };
	}
	let muki_e = new Muki_E();

	class Muki_S implements Muki {
		readonly index: number = 2;
		readonly mukiType: MukiType = 's';
		readonly mukiChr: MukiChr = '↓';
		readonly bit: number = Kyoutsu.BIT_BOTTOM;
		readonly nextXY: XY = { x: 0, y: 1 };
	}
	let muki_s = new Muki_S();

	class Muki_W implements Muki {
		readonly index: number = 3;
		readonly mukiType: MukiType = 'w';
		readonly mukiChr: MukiChr = '←';
		readonly bit: number = Kyoutsu.BIT_LEFT;
		readonly nextXY: XY = { x: -1, y: 0 };
	}
	let muki_w = new Muki_W();
	let mukiArray: Array<Muki> = [muki_n, muki_e, muki_s, muki_w];

	function mukiRotation(muki: Muki, chokkakuCount: number): Muki {
		let index = muki.index + chokkakuCount;
		if (index < 0) {
			index += 4;
		} else if (4 <= index) {
			index -= 4;
		}
		return mukiArray[index];
	}

	class Character {
		xpos: number;
		ypos: number;
		muki: Muki = new Muki_N();
	}

	interface GameStatus {
		player: Character;
	}
	let _gameStatus: GameStatus = {
		player: new Character()
	}

	let $mapdata: string[] = ['95555513',
		'A95553AA',
		'AAD53AAA',
		'AC556AAA',
		'C5515406',
		'93FAD3AB',
		'AAD452AA',
		'EC5556C6'];

	export function init() {

		document.addEventListener('keydown', keyDownEvent);

		let div_map: HTMLElement = Kyoutsu.getElementById('div_map');
		mapview(div_map, $mapdata);

		_gameStatus.player.xpos = 0;
		_gameStatus.player.ypos = 7;
		_gameStatus.player.muki = muki_n;

		let nakami: HTMLElement = Kyoutsu.getElementById('nakami[' + _gameStatus.player.xpos + '][' + _gameStatus.player.ypos + ']');
		nakami.innerHTML = '↑';

		submapview();

		let keyboard = new Kyoutsu.Keyboard();
		keyboard.keyboard.style.top = '320px';

		document.body.appendChild(keyboard.keyboard);

		keyboard.setKeyEvent('click', keyboardClick);
		keyboard.setKeyEvent('touch', (e: Event): void => { keyboardClick(e); e.preventDefault(); });

		keyboard.setKeytops([' ', 'w', ' ', 'a', ' ', 'd', ' ', ' ', ' ']);
	}

	function keyboardClick(e: Event) {
		let key = Kyoutsu.getKeytop(e.target);
		keyOperation(key);
	}

	function keyDownEvent(e: KeyboardEvent): void {
		keyOperation(e.key);
	}

	function keyOperation(key: string) {
		let inputCode: number = Kyoutsu.getInputCode(key);
		if (inputCode == Kyoutsu.INPUT_UP) {
			let kabeChar: string = $mapdata[_gameStatus.player.ypos].charAt(_gameStatus.player.xpos);
			let kabeType: number = parseInt(kabeChar, 16);

			let xdiff: number = 0;
			let ydiff: number = 0;

			let muki: Muki = _gameStatus.player.muki;
			xdiff = (kabeType & muki.bit) == 0 ? muki.nextXY.x : 0;
			ydiff = (kabeType & muki.bit) == 0 ? muki.nextXY.y : 0;

			if (xdiff != 0 || ydiff != 0) {
				let nakami: HTMLElement;
				nakami = Kyoutsu.getElementById('nakami[' + _gameStatus.player.xpos + '][' + _gameStatus.player.ypos + ']');
				nakami.innerHTML = '';

				_gameStatus.player.xpos += xdiff;
				_gameStatus.player.ypos += ydiff;
				nakami = Kyoutsu.getElementById('nakami[' + _gameStatus.player.xpos + '][' + _gameStatus.player.ypos + ']');
				nakami.innerHTML = _gameStatus.player.muki.mukiChr;

				submapview();
			}

		} else if (inputCode == Kyoutsu.INPUT_LEFT) {
			_gameStatus.player.muki = mukiRotation(_gameStatus.player.muki, -1);

			let nakami: HTMLElement = Kyoutsu.getElementById('nakami[' + _gameStatus.player.xpos + '][' + _gameStatus.player.ypos + ']');
			nakami.innerHTML = _gameStatus.player.muki.mukiChr;

			submapview();

		} else if (inputCode == Kyoutsu.INPUT_RIGHT) {
			_gameStatus.player.muki = mukiRotation(_gameStatus.player.muki, +1);

			let nakami: HTMLElement = Kyoutsu.getElementById('nakami[' + _gameStatus.player.xpos + '][' + _gameStatus.player.ypos + ']');
			nakami.innerHTML = _gameStatus.player.muki.mukiChr;

			submapview();
		}

	}

	function submapview(): void {
		let zenpou: number = 3
		let hidarimigi: number = 1;

		let submapdata: string[] = map_kiritori($mapdata, zenpou, hidarimigi);

		draw3D(submapdata, zenpou, hidarimigi);

		let div_submap: HTMLElement = Kyoutsu.getElementById('div_submap');

		mapview(div_submap, submapdata);

		// デバッグ情報の表示
		let html: string = div_submap.innerHTML;
		html = html + submapdata[0] + '<br>' + submapdata[1] + '<br>' + submapdata[2] + '<br>' + submapdata[3] + '<br>';
		div_submap.innerHTML = html;
	}

	function map_kiritori(mapdata: string[], zenpou: number, hidarimigi: number): string[] {
		let kiritorimapdata: string[] = new Array();
		let x: number = 0;
		let y: number = 0;

		if (_gameStatus.player.muki.bit == Kyoutsu.BIT_TOP) {
			for (y = zenpou * -1; y <= 0; y++) {
				let line: string = '';
				for (x = hidarimigi * -1; x <= hidarimigi; x++) {
					let c: string = getPosChar(mapdata, _gameStatus.player.xpos + x, _gameStatus.player.ypos + y);
					c = charkaiten(c, _gameStatus.player.muki);
					line += c;
				}
				kiritorimapdata.push(line);
			}

		} else if (_gameStatus.player.muki.bit == Kyoutsu.BIT_RIGHT) {
			for (x = zenpou; 0 <= x; x--) {
				let line: string = '';
				for (y = hidarimigi * -1; y <= hidarimigi; y++) {
					let c: string = getPosChar(mapdata, _gameStatus.player.xpos + x, _gameStatus.player.ypos + y);
					c = charkaiten(c, _gameStatus.player.muki);
					line += c;
				}
				kiritorimapdata.push(line);
			}

		} else if (_gameStatus.player.muki.bit == Kyoutsu.BIT_BOTTOM) {
			for (y = zenpou; 0 <= y; y--) {
				let line: string = '';
				for (x = hidarimigi; hidarimigi * -1 <= x; x--) {
					let c: string = getPosChar(mapdata, _gameStatus.player.xpos + x, _gameStatus.player.ypos + y);
					c = charkaiten(c, _gameStatus.player.muki);
					line += c;
				}
				kiritorimapdata.push(line);
			}

		} else if (_gameStatus.player.muki.bit == Kyoutsu.BIT_LEFT) {
			for (x = zenpou * -1; x <= 0; x++) {
				let line: string = '';
				for (y = hidarimigi; hidarimigi * -1 <= y; y--) {
					let c: string = getPosChar(mapdata, _gameStatus.player.xpos + x, _gameStatus.player.ypos + y);
					c = charkaiten(c, _gameStatus.player.muki);
					line += c;
				}
				kiritorimapdata.push(line);
			}
		}

		return kiritorimapdata;
	}

	function getPosChar(mapdata: string[], x: number, y: number): string {
		let c: string;
		if (y < 0 || mapdata.length <= y) {
			c = '0';
		} else {
			if (x < 0 || mapdata[y].length <= x) {
				c = '0';
			} else {
				c = mapdata[y].charAt(x);
			}
		}
		return c;
	}

	function charkaiten(c: string, muki: Muki): string {
		let n: number = parseInt(c, 16);
		for (let i: number = 0; i < (4 - muki.index) % 4; i++) {
			n = n * 2;
			if (16 <= n) {
				n = n - 16;
				n = n + 1;
			}
		}
		c = n.toString(16).toUpperCase();

		return c;
	}

	function draw3D(mapdata: string[], zenpou: number, hidarimigi: number): void {
		let cvs: HTMLCanvasElement = <HTMLCanvasElement>Kyoutsu.getElementById('map3d');;
		let context: CanvasRenderingContext2D | null = cvs.getContext('2d');
		if (context == null) {
			return;
		}

		context.beginPath();
		context.clearRect(0, 0, $SCREEN_WIDTH, $SCREEN_HEIGHT);

		let kabe: number = -1;

		for (let i: number = 0; i <= zenpou; i++) {
			let c: string = mapdata[zenpou - i].charAt(hidarimigi);
			let n: number = parseInt(c, 16);

			let hidarikabeflg: number = 0;
			let migikabeflg: number = 0;

			if ((n & Kyoutsu.BIT_TOP) == Kyoutsu.BIT_TOP) {
				if (kabe == -1 || i < kabe) {
					kabemaekaku(context, i + 1);
					kabe = i;
				}
			}
			if ((n & Kyoutsu.BIT_LEFT) == Kyoutsu.BIT_LEFT) {
				if (kabe == -1 || i <= kabe) {
					kabetatekaku(context, i + 1, Kyoutsu.BIT_LEFT);
					hidarikabeflg = 1;
				}
			}
			if ((n & Kyoutsu.BIT_RIGHT) == Kyoutsu.BIT_RIGHT) {
				if (kabe == -1 || i <= kabe) {
					kabetatekaku(context, i + 1, Kyoutsu.BIT_RIGHT);
					migikabeflg = 1;
				}
			}

			c = mapdata[zenpou - i].charAt(hidarimigi - 1);
			n = parseInt(c, 16);
			if ((n & Kyoutsu.BIT_TOP) == Kyoutsu.BIT_TOP) {
				if (kabe == -1 || i <= kabe) {
					if (hidarikabeflg != 1) {
						kabeyokokaku(context, i + 1, Kyoutsu.BIT_LEFT);
					}
				}
			}

			c = mapdata[zenpou - i].charAt(hidarimigi + 1);
			n = parseInt(c, 16);
			if ((n & Kyoutsu.BIT_TOP) == Kyoutsu.BIT_TOP) {
				if (kabe == -1 || i <= kabe) {
					if (migikabeflg != 1) {
						kabeyokokaku(context, i + 1, Kyoutsu.BIT_RIGHT);
					}
				}
			}
		}
	}

	function mapview(div_map: HTMLElement, kakumapdata: string[]): void {
		let ippen: number = 36;
		let futosa: number = 2;

		div_map.innerHTML = '';

		for (let y: number = 0, yl: number = kakumapdata.length; y < yl; y++) {
			for (let x: number = 0, xl: number = kakumapdata[y].length; x < xl; x++) {
				let c: string = kakumapdata[y].charAt(x);

				let kukaku: HTMLElement = document.createElement('DIV');
				kukaku.className = 'kukaku';
				kukaku.style.width = (ippen + futosa * 2) + 'px';
				kukaku.style.height = (ippen + futosa * 2) + 'px';

				let map: HTMLElement = document.createElement('DIV');
				map.id = 'map[' + x + '][' + y + ']';
				setStyle(map, c, ippen, futosa);

				let nakami: HTMLElement = document.createElement('DIV');
				nakami.id = 'nakami[' + x + '][' + y + ']';
				nakami.className = 'nakami';
				nakami.style.width = ippen + 'px';
				nakami.style.height = ippen + 'px';

				map.appendChild(nakami);
				kukaku.appendChild(map);
				div_map.appendChild(kukaku);
			}

			let br: HTMLElement = document.createElement('BR');
			div_map.appendChild(br);
		}
	}

	function setStyle(map: HTMLElement, c: string, ippen: number, futosa: number): void {
		let n: number = parseInt(c, 16);

		map.style.display = 'inline-block';
		map.style.margin = '0px';
		map.style.padding = '0px';
		map.style.width = ippen + 'px';
		map.style.height = ippen + 'px';
		map.style.verticalAlign = 'middle';
		map.style.textAlign = 'center';
		map.style.border = '0px solid black';
		map.style.backgroundColor = 'white';

		if ((n & Kyoutsu.BIT_TOP) == Kyoutsu.BIT_TOP) {
			map.style.borderTopWidth = futosa + 'px';
		} else {
			map.style.marginTop = futosa + 'px';
		}

		if ((n & Kyoutsu.BIT_RIGHT) == Kyoutsu.BIT_RIGHT) {
			map.style.borderRightWidth = futosa + 'px';
		} else {
			map.style.marginRight = futosa + 'px';
		}
		if ((n & Kyoutsu.BIT_BOTTOM) == Kyoutsu.BIT_BOTTOM) {
			map.style.borderBottomWidth = futosa + 'px';
		} else {
			map.style.marginBottom = futosa + 'px';
		}
		if ((n & Kyoutsu.BIT_LEFT) == Kyoutsu.BIT_LEFT) {
			map.style.borderLeftWidth = futosa + 'px';
		} else {
			map.style.marginLeft = futosa + 'px';
		}
	}

	function kabemaekaku(context: CanvasRenderingContext2D, fukasa: number): void {
		context.beginPath();

		context.moveTo($kabex[fukasa], $kabey[fukasa]);
		context.lineTo($DRAW_WIDTH - $kabex[fukasa], $kabey[fukasa]);
		context.lineTo($DRAW_WIDTH - $kabex[fukasa], $DRAW_HEIGHT - $kabey[fukasa]);
		context.lineTo($kabex[fukasa], $DRAW_HEIGHT - $kabey[fukasa]);

		context.closePath();
		context.stroke();
	}

	function kabetatekaku(context: CanvasRenderingContext2D, fukasa: number, side: number): void {
		let startx: number;
		let fugou: number;

		if (side == Kyoutsu.BIT_LEFT) {
			startx = 0;
			fugou = 1;
		} else if (side == Kyoutsu.BIT_RIGHT) {
			startx = $DRAW_WIDTH;
			fugou = -1;
		} else {
			return;
		}

		context.beginPath();

		context.moveTo(startx + fugou * $kabex[fukasa - 1], $kabey[fukasa - 1]);
		context.lineTo(startx + fugou * $kabex[fukasa], $kabey[fukasa]);
		context.lineTo(startx + fugou * $kabex[fukasa], $DRAW_HEIGHT - $kabey[fukasa]);
		context.lineTo(startx + fugou * $kabex[fukasa - 1], $DRAW_HEIGHT - $kabey[fukasa - 1]);

		context.closePath();
		context.stroke();
	}

	function kabeyokokaku(context: CanvasRenderingContext2D, fukasa: number, side: number): void {
		let startx: number;
		let fugou: number;

		if (side == Kyoutsu.BIT_LEFT) {
			startx = 0;
			fugou = 1;
		} else if (side == Kyoutsu.BIT_RIGHT) {
			startx = $DRAW_WIDTH;
			fugou = -1;
		} else {
			return;
		}

		context.beginPath();

		context.moveTo(startx + fugou * $kabex[fukasa - 1], $kabey[fukasa]);
		context.lineTo(startx + fugou * $kabex[fukasa], $kabey[fukasa]);
		context.lineTo(startx + fugou * $kabex[fukasa], $DRAW_HEIGHT - $kabey[fukasa]);
		context.lineTo(startx + fugou * $kabex[fukasa - 1], $DRAW_HEIGHT - $kabey[fukasa]);

		context.closePath();
		context.stroke();
	}
}
