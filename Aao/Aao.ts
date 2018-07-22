namespace Aao {
	let KEY_UP = 87, KEY_RIGHT = 68, KEY_DOWN = 83, KEY_LEFT = 65;

	class Character {
		chr: string;
		img: HTMLImageElement;
		x: number;
		y: number;
		muki: string;

		constructor(chr: string) {
			this.chr = chr;
			this.img = <HTMLImageElement>document.createElement('IMG');
			this.img.style.position = 'absolute';
			this.x = 0;
			this.y = 0;
			this.muki = 'e'
		}

		moveTo(x: number, y: number): void {
			let dx: number = x - this.x;
			let dy: number = y - this.y;
			this.moveBy(dx, dy);
			this.x = x;
			this.y = y;
		}

		moveBy(dx: number, dy: number): void {
			if (dx < 0) {
				this.img.src = 'player3.png';
			}
			if (0 < dx) {
				this.img.src = 'player4.png';
			}
			if (dy < 0) {
				this.img.src = 'player2.png';
			}
			if (0 < dy) {
				this.img.src = 'player1.png';
			}
			this.x += dx;
			this.y += dy;
			this.refrectStyle();
		}

		asciiPosX(): number {
			return Math.floor((this.x) / 16);
		}

		asciiPosY(): number {
			return Math.floor((this.y) / 32);
		}

		private refrectStyle(): void {
			this.img.style.left = this.x + 'px';
			this.img.style.top = this.y + 'px';
		}

	}

	class GameField {
		backGround: HTMLImageElement;
		field: Array<string>;

		constructor() {
			this.backGround = <HTMLImageElement>document.createElement('IMG');
			this.field = new Array<string>();
		}
	}

	class GameBoard {
		fieldGraph: HTMLDivElement;
		fieldAscii: HTMLDivElement | null = null;
		objectAscii: HTMLDivElement | null = null;
		debug: HTMLDivElement | null = null;

		current: GameField;
		next: GameField;

		constructor() {
			this.fieldGraph = <HTMLDivElement>document.createElement('DIV');

			this.current = new GameField();
			this.next = new GameField();
		}
	}
	let _gameBoard: GameBoard = new GameBoard();

	let $field1: string[] = new Array();
	let $field2: string[] = new Array();
	let $field3: string[] = new Array();

	let $koudouArray = new Array();
	let $lastKeyCode: number;
	let $frameTiming: number = 16;
	let $frameCount: number = 0;
	let $mode: string;
	let $dbg: string = '';

	let $pc: Character;

	class Hensu {
		muki: string;
		frame: number;
		frameend: number;
	}

	let $hensu: Hensu = new Hensu();	// hensuという名前の意味？

	$field1.push('**************************      ********');
	$field1.push('*        **                            *');
	$field1.push('*       **    **      ***      ****    *');
	$field1.push('*      **    **    ****************    *');
	$field1.push('********    **     ******  *****       *');
	$field1.push('**          **              ****       *');
	$field1.push('**   ********                          *');
	$field1.push('**   *                                 *');
	$field1.push('**   *                      ***        *');
	$field1.push('**   *                      ***        *');
	$field1.push('*                                      *');
	$field1.push('*                                      *');
	$field1.push('*          ****               **********');
	$field1.push('*          ****               **********');
	$field1.push('****************************************');

	$field2.push('****************************************');
	$field2.push('*                                      *');
	$field2.push('*                                      *');
	$field2.push('*                                      *');
	$field2.push('*                                      *');
	$field2.push('*                                       ');
	$field2.push('*                                       ');
	$field2.push('*                                       ');
	$field2.push('*                                       ');
	$field2.push('*                                      *');
	$field2.push('*                                      *');
	$field2.push('*                                      *');
	$field2.push('*                                      *');
	$field2.push('*                                      *');
	$field2.push('**************************      ********');

	$field3.push('****************************************');
	$field3.push('*                                      *');
	$field3.push('*                                      *');
	$field3.push('*                                      *');
	$field3.push('*                                      *');
	$field3.push('                                       *');
	$field3.push('                                       *');
	$field3.push('                                       *');
	$field3.push('                                       *');
	$field3.push('*                                      *');
	$field3.push('*                                      *');
	$field3.push('*                                      *');
	$field3.push('*                                      *');
	$field3.push('*                                      *');
	$field3.push('****************************************');

	for (let i = 0; i < $field1.length; i++) {
		_gameBoard.current.field.push($field1[i]);
	}
	let $asciiPosition: string[] = new Array();
	for (let i = 0; i < _gameBoard.current.field.length; i++) {
		$asciiPosition.push('                                        ');
	}

	let $hougaku: { [index: string]: any; } = {
		n: { x: 0, y: -1 }, e: { x: 1, y: 0 }, s: { x: 0, y: 1 }, w: { x: -1, y: 0 }
	}

	function put(obj: Character): void {
		putc(obj.asciiPosX(), obj.asciiPosY(), obj.chr);
	}

	function putc(x: number, y: number, chr: string): void {
		let swp = $asciiPosition[y];
		swp = swp.substr(0, x) + chr + swp.substr(x + 1);
		$asciiPosition[y] = swp;
	}

	function get(x: number, y: number): string {
		if (y < 0 || _gameBoard.current.field.length <= y) {
			return '';
		}
		if (x < 0 || _gameBoard.current.field[y].length <= x) {
			return '';
		}
		return _gameBoard.current.field[y].charAt(x);
	}

	function display(): void {
		if (_gameBoard.fieldAscii != null) {
			_gameBoard.fieldAscii.innerHTML = _gameBoard.current.field.join('<br>').replace(/ /g, '&nbsp;');
		}
		if (_gameBoard.objectAscii != null) {
			_gameBoard.objectAscii.innerHTML = $asciiPosition.join('<br>').replace(/ /g, '&nbsp;');
		}
	}

	function frameCheck(): void {
		$frameCount++;

		if (_gameBoard.debug != null) {
			_gameBoard.debug.innerHTML =
				$mode + '<br>' + $frameCount + '<br>' + $lastKeyCode
				+ '<br>' + $pc.x + ',' + $pc.y
				+ '<br>' + $pc.asciiPosX() + ',' + $pc.asciiPosY()
				+ '<br>[' + $dbg + ']'
				;
		}

		if ($lastKeyCode == 27) {
			return;
		}

		if ($mode == 'free') {
			if ($frameCount % 2 == 0) {

				if (0 < $koudouArray.length) {

					let koudou = $koudouArray.shift();
					if (koudou.type == 'idou') {

						$pc.moveBy(koudou.value.x * 4, koudou.value.y * 4);

						if ($pc.muki == 'n' && $pc.y <= 0) {
							_gameBoard.next.backGround.src = 'map2.png';
							_gameBoard.next.backGround.style.position = 'absolute';
							_gameBoard.next.backGround.style.top = '-480px';
							_gameBoard.next.backGround.style.left = '0px';

							_gameBoard.current.backGround.style.top = '0px';
							_gameBoard.current.backGround.style.left = '0px';

							_gameBoard.next.field = $field2;

							$hensu = { muki: 'n', frame: 0, frameend: 30 };

							_gameBoard.next.backGround.style.display = '';

							$mode = 'scrl';
						}
						if ($pc.muki == 'e' && 640 - 32 <= $pc.x) {
							_gameBoard.next.backGround.src = 'map3.png';
							_gameBoard.next.backGround.style.position = 'absolute';
							_gameBoard.next.backGround.style.top = '0px';
							_gameBoard.next.backGround.style.left = '640px';

							_gameBoard.current.backGround.style.top = '0px';
							_gameBoard.current.backGround.style.left = '0px';

							_gameBoard.next.field = $field3;

							$hensu = { muki: 'e', frame: 0, frameend: 40 };

							_gameBoard.next.backGround.style.display = '';

							$mode = 'scrl';
						}
						if ($pc.muki == 's' && 480 - 32 <= $pc.y) {
							_gameBoard.next.backGround.src = 'map1.png';
							_gameBoard.next.backGround.style.top = '480px';
							_gameBoard.next.backGround.style.left = '0px';

							_gameBoard.current.backGround.style.top = '0px';
							_gameBoard.current.backGround.style.left = '0px';

							_gameBoard.next.field = $field1;

							$hensu = { muki: 's', frame: 0, frameend: 30 };

							_gameBoard.next.backGround.style.display = '';

							$mode = 'scrl';
						}
						if ($pc.muki == 'w' && $pc.x <= 0) {
							_gameBoard.next.backGround.src = 'map2.png';
							_gameBoard.next.backGround.style.position = 'absolute';
							_gameBoard.next.backGround.style.top = '0px';
							_gameBoard.next.backGround.style.left = '-640px';

							_gameBoard.current.backGround.style.top = '0px';
							_gameBoard.current.backGround.style.left = '0px';

							_gameBoard.next.field = $field2;

							$hensu = { muki: 'w', frame: 0, frameend: 40 };

							_gameBoard.next.backGround.style.display = '';

							$mode = 'scrl';
						}
					}
					if (koudou.type == 'jump') {
						$pc.moveBy(0, koudou.value);
					}
				}

				put($pc);
				display();

				if ($mode != 'scrl') {
					if ($lastKeyCode == KEY_UP) {
						move_tate('n');
					}
					if ($lastKeyCode == KEY_RIGHT) {
						move_yoko('e');
					}
					if ($lastKeyCode == KEY_DOWN) {
						move_tate('s');
					}
					if ($lastKeyCode == KEY_LEFT) {
						move_yoko('w');
					}
				}
			}
		} else if ($mode == 'scrl') {
			if ($hensu.frame == 0) {
				putc($pc.asciiPosX(), $pc.asciiPosY(), ' ');
			}

			$hensu.frame++;
			if ($hensu.muki == 'n') {
				_gameBoard.next.backGround.style.top = (-480 + 16 * $hensu.frame) + 'px';
				_gameBoard.current.backGround.style.top = (0 + 16 * $hensu.frame) + 'px';
				$pc.moveBy(0, 15);
			} else if ($hensu.muki == 'e') {
				_gameBoard.next.backGround.style.left = (640 - 16 * $hensu.frame) + 'px';
				_gameBoard.current.backGround.style.left = (0 - 16 * $hensu.frame) + 'px';
				$pc.moveBy(-15.2, 0);
			} else if ($hensu.muki == 's') {
				_gameBoard.next.backGround.style.top = (480 - 16 * $hensu.frame) + 'px';
				_gameBoard.current.backGround.style.top = (0 - 16 * $hensu.frame) + 'px';
				$pc.moveBy(0, -15);
			} else if ($hensu.muki == 'w') {
				_gameBoard.next.backGround.style.left = (-640 + 16 * $hensu.frame) + 'px';
				_gameBoard.current.backGround.style.left = (0 + 16 * $hensu.frame) + 'px';
				$pc.moveBy(15.2, 0);
			}

			if ($hensu.frameend <= $hensu.frame) {
				_gameBoard.current.backGround.src = _gameBoard.next.backGround.src;
				_gameBoard.current.backGround.style.top = '0px';
				_gameBoard.current.backGround.style.left = '0px';
				_gameBoard.next.backGround.style.display = 'none';

				if ($hensu.muki == 'n') {
					$pc.moveTo($pc.x, 480 - 32);
				} else if ($hensu.muki == 'e') {
					$pc.moveTo(0, $pc.y);
				} else if ($hensu.muki == 's') {
					$pc.moveTo($pc.x, 0);
				} else if ($hensu.muki == 'w') {
					$pc.moveTo(640 - 32, $pc.y);
				}

				for (let i = 0; i < _gameBoard.current.field.length; i++) {
					_gameBoard.current.field[i] = _gameBoard.next.field[i];
				}
				display();

				$mode = 'free';
			}
		}

		setTimeout(arguments.callee, $frameTiming);
	}

	function move_tate(hougaku: string): void {
		let check_ascii_x = Math.floor(($pc.x + 0) / 16);
		let check_ascii_y = hougaku == 's' ? Math.floor(($pc.y + 32) / 32) : Math.floor($pc.y / 32) - (($pc.y % 32 == 0) ? 1 : 0);

		let check_c1 = get(check_ascii_x, check_ascii_y);
		let check_c2 = get(check_ascii_x + 1, check_ascii_y);
		let check_offet = $pc.x % 16 == 0 ? ' ' : get(check_ascii_x + 2, check_ascii_y);

		move_check(hougaku, check_c1, check_c2, check_offet);
	}

	function move_yoko(hougaku: string): void {
		let check_ascii_x = hougaku == 'e' ? Math.floor(($pc.x + 32) / 16) : Math.floor($pc.x / 16) - (($pc.x % 16 == 0) ? 1 : 0);
		let check_ascii_y = Math.floor(($pc.y + 0) / 32);

		let check_c = get(check_ascii_x, check_ascii_y);
		let check_offet = $pc.y % 32 == 0 ? ' ' : get(check_ascii_x, check_ascii_y + 1);

		move_check(hougaku, check_c, ' ', check_offet);
	}

	function move_check(hougaku: string, c1: string, c2: string, c3: string) {
		if (c1 == ' ' && c2 == ' ' && c3 == ' ') {
			if ($pc.muki == hougaku) {
				putc($pc.asciiPosX(), $pc.asciiPosY(), ' ');
				$koudouArray.push({ type: 'idou', value: $hougaku[hougaku] });
			} else {
				$pc.muki = hougaku;
			}
		}
	}

	window.addEventListener('load', (): void => {
		initMainBoard();

		document.addEventListener('keydown', (e: KeyboardEvent): void => {
			$lastKeyCode = e.keyCode;
		});

		document.addEventListener('keyup', (e: KeyboardEvent): void => {
			if (e.keyCode == $lastKeyCode) {
				$lastKeyCode = -1;
			}
		});

		$pc = new Character('A');
		$pc.moveTo(18 * 16, 2 * 32);
		_gameBoard.fieldGraph.appendChild($pc.img);

		put($pc);

		display();

		$mode = 'free';
		$frameCount = 0;
		setTimeout(frameCheck, $frameTiming);
	});

	function initMainBoard(): void {
		let mainBoard: HTMLElement = Kyoutsu.getElementById('mainBoard');

		{
			let elm: HTMLDivElement = _gameBoard.fieldGraph;
			elm.className = 'fieldGraph';

			_gameBoard.current.backGround.src = 'map1.png';
			_gameBoard.current.backGround.style.position = 'absolute';

			_gameBoard.next.backGround.style.position = 'absolute';
			_gameBoard.next.backGround.style.display = 'none';

			elm.appendChild(_gameBoard.current.backGround);
			elm.appendChild(_gameBoard.next.backGround);

			mainBoard.appendChild(elm);
		}

		{
			let elm: HTMLDivElement = <HTMLDivElement>document.createElement('DIV');
			elm.className = 'fieldAscii';
			elm.style.left = '660px'

			_gameBoard.fieldAscii = elm;

			mainBoard.appendChild(elm);
		}
		{
			let elm: HTMLDivElement = <HTMLDivElement>document.createElement('DIV');
			elm.className = 'fieldAscii';
			elm.style.left = '660px'
			elm.style.color = 'red';

			_gameBoard.objectAscii = elm;

			mainBoard.appendChild(elm);
		}
		{
			let elm: HTMLDivElement = <HTMLDivElement>document.createElement('DIV');
			elm.style.position = 'absolute';
			elm.style.top = '180px';
			elm.style.left = '660px';

			_gameBoard.debug = elm;

			mainBoard.appendChild(elm);
		}
	}
}