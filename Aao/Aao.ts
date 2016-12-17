
let KEY_UP = 87, KEY_RIGHT = 68, KEY_DOWN = 83, KEY_LEFT = 65;

class Charactor {
	chr: string;
	img: HTMLImageElement;
	x: number;
	y: number;
	ascii_x: number;
	ascii_y: number;
	muki: string;

	constructor(chr: string) {
		this.chr = chr;
		this.img = <HTMLImageElement>document.createElement('IMG');
		this.img.style.position = 'absolute';
		this.x = 0;
		this.y = 0;
		this.ascii_x = 0;
		this.ascii_y = 0;
		this.muki = 'e'
	}

	public moveTo(x: number, y: number): void {
		let dx: number = x - this.x;
		let dy: number = y - this.y;
		this.moveBy(dx, dy);
		this.x = x;
		this.y = y;
	}

	public moveBy(dx: number, dy: number): void {
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
		this.asciiPos();
		this.refrectStyle();
	}

	private asciiPos(): void {
		this.ascii_x = Math.floor((this.x) / 16);
		this.ascii_y = Math.floor((this.y) / 32);
	}

	private refrectStyle(): void {
		this.img.style.left = this.x + 'px';
		this.img.style.top = this.y + 'px';
	}

}

let $debugElm: HTMLElement | null = null;
let $fieldAsciiElm: HTMLElement | null = null;
let $objectAsciiElm: HTMLElement | null = null;
let $fieldGraphElm: HTMLElement | null = null;

let $field1: string[] = new Array();
let $field2: string[] = new Array();
let $field3: string[] = new Array();

let $field: string[] = new Array();
let $nextField: string[] = new Array();

let $backGround: HTMLImageElement = <HTMLImageElement>document.createElement('IMG');
let $nextBackGround: HTMLImageElement = <HTMLImageElement>document.createElement('IMG');

let $koudouArray = new Array();
let $lastKeyCode: number;
let $frameTiming: number = 16;
let $frameCount: number = 0;
let $mode: string;
let $dbg: string = '';

let $p: Charactor;

window.addEventListener('load', (): void => {
	let koukoku: HTMLElement | null = document.getElementById('y_gc_div_uadcntr');
	if (koukoku != null) {
		koukoku.style.zIndex = '0';
		koukoku.style.position = 'absolute';
		koukoku.style.top = '600px';
	}

	$debugElm = document.getElementById('debug');
	if ($debugElm != null) {
		$debugElm.style.position = 'absolute';
		$debugElm.style.top = '180px';
		$debugElm.style.left = '660px';
	}

	$fieldAsciiElm = document.getElementById('divFieldAscii');
	if ($fieldAsciiElm != null) {
		$fieldAsciiElm.style.left = '660px'
	}

	$objectAsciiElm = document.getElementById('divObjectAscii');
	if ($objectAsciiElm != null) {
		$objectAsciiElm.style.left = '660px'
	}


	document.addEventListener('keydown', (e: KeyboardEvent): void => {
		$lastKeyCode = e.keyCode;
	});

	document.addEventListener('keyup', (e: KeyboardEvent): void => {
		if (e.keyCode == $lastKeyCode) {
			$lastKeyCode = -1;
		}
	});

	$backGround.src = 'map1.png';
	$backGround.style.position = 'absolute';

	$nextBackGround.style.position = 'absolute';
	$nextBackGround.style.display = 'none';

	$fieldGraphElm = document.getElementById('divFieldGraph');
	if ($fieldGraphElm == null) {
		throw new Error();
	}
	$fieldGraphElm.appendChild($backGround);
	$fieldGraphElm.appendChild($nextBackGround);

	$p = new Charactor('A');
	$p.img.src = 'player.png'
	$p.moveTo(18 * 16, 2 * 32);
	$fieldGraphElm.appendChild($p.img);

	put($p);

	display();

	$mode = 'free';
	$frameCount = 0;
	setTimeout(frameCheck, $frameTiming);
});

	class Hensu {
		muki: string;
		frame: number;
		frameend: number;
	}

	let $hensu: Hensu = new Hensu();

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
		$field.push($field1[i]);
	}
	let $asciiPosition: string[] = new Array();
	for (let i = 0; i < $field.length; i++) {
		$asciiPosition.push('                                        ');
	}

	let $hougaku: { [index: string]: any; } = {
		n: { x: 0, y: -1 }, e: { x: 1, y: 0 }, s: { x: 0, y: 1 }, w: { x: -1, y: 0 }
	}

	function put(obj: Charactor): void {
		putc(obj.ascii_x, obj.ascii_y, obj.chr);
	}

	function putc(x: number, y: number, chr: string): void {
		let swp = $asciiPosition[y];
		swp = swp.substr(0, x) + chr + swp.substr(x + 1);
		$asciiPosition[y] = swp;
	}

	function get(x: number, y: number): string {
		if (y < 0 || $field.length <= y) {
			return '';
		}
		if (x < 0 || $field[y].length <= x) {
			return '';
		}
		return $field[y].charAt(x);
	}

	function display(): void {
		if ($fieldAsciiElm != null) {
			$fieldAsciiElm.innerHTML = $field.join('<br>').replace(/ /g, '&nbsp;');
		}
		if ($objectAsciiElm != null) {
			$objectAsciiElm.innerHTML = $asciiPosition.join('<br>').replace(/ /g, '&nbsp;');
		}
	}

	function frameCheck(): void {

		$frameCount++;
		if ($debugElm != null) {
			$debugElm.innerHTML =
				$mode + '<br>' + $frameCount + '<br>' + $lastKeyCode
				+ '<br>' + $p.x + ',' + $p.y
				+ '<br>' + $p.ascii_x + ',' + $p.ascii_y
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

						$p.moveBy(koudou.value.x * 4, koudou.value.y * 4);

						if ($p.muki == 'n' && $p.y <= 0) {
							$nextBackGround.src = 'map2.png';
							$nextBackGround.style.position = 'absolute';
							$nextBackGround.style.top = '-480px';
							$nextBackGround.style.left = '0px';

							$backGround.style.top = '0px';
							$backGround.style.left = '0px';

							$nextField = $field2;

							$hensu = { muki: 'n', frame: 0, frameend: 30 };

							$nextBackGround.style.display = '';

							$mode = 'scrl';
						}
						if ($p.muki == 'e' && 640 - 32 <= $p.x) {
							$nextBackGround.src = 'map3.png';
							$nextBackGround.style.position = 'absolute';
							$nextBackGround.style.top = '0px';
							$nextBackGround.style.left = '640px';

							$backGround.style.top = '0px';
							$backGround.style.left = '0px';

							$nextField = $field3;

							$hensu = { muki: 'e', frame: 0, frameend: 40 };

							$nextBackGround.style.display = '';

							$mode = 'scrl';
						}
						if ($p.muki == 's' && 480 - 32 <= $p.y) {
							$nextBackGround.src = 'map1.png';
							$nextBackGround.style.top = '480px';
							$nextBackGround.style.left = '0px';

							$backGround.style.top = '0px';
							$backGround.style.left = '0px';

							$nextField = $field1;

							$hensu = { muki: 's', frame: 0, frameend: 30 };

							$nextBackGround.style.display = '';

							$mode = 'scrl';
						}
						if ($p.muki == 'w' && $p.x <= 0) {
							$nextBackGround.src = 'map2.png';
							$nextBackGround.style.position = 'absolute';
							$nextBackGround.style.top = '0px';
							$nextBackGround.style.left = '-640px';

							$backGround.style.top = '0px';
							$backGround.style.left = '0px';

							$nextField = $field2;

							$hensu = { muki: 'w', frame: 0, frameend: 40 };

							$nextBackGround.style.display = '';

							$mode = 'scrl';
						}
					}
					if (koudou.type == 'jump') {
						$p.moveBy(0, koudou.value);
					}
				}

				put($p);
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
		} else
			if ($mode == 'scrl') {
				if ($hensu.frame == 0) {
					putc($p.ascii_x, $p.ascii_y, ' ');
				}

				$hensu.frame++;
				if ($hensu.muki == 'n') {
					$nextBackGround.style.top = (-480 + 16 * $hensu.frame) + 'px';
					$backGround.style.top = (0 + 16 * $hensu.frame) + 'px';
					$p.moveBy(0, 15);
				} else
					if ($hensu.muki == 'e') {
						$nextBackGround.style.left = (640 - 16 * $hensu.frame) + 'px';
						$backGround.style.left = (0 - 16 * $hensu.frame) + 'px';
						$p.moveBy(-15.2, 0);
					} else
						if ($hensu.muki == 's') {
							$nextBackGround.style.top = (480 - 16 * $hensu.frame) + 'px';
							$backGround.style.top = (0 - 16 * $hensu.frame) + 'px';
							$p.moveBy(0, -15);
						} else
							if ($hensu.muki == 'w') {
								$nextBackGround.style.left = (-640 + 16 * $hensu.frame) + 'px';
								$backGround.style.left = (0 + 16 * $hensu.frame) + 'px';
								$p.moveBy(15.2, 0);
							}

				if ($hensu.frameend <= $hensu.frame) {
					$backGround.src = $nextBackGround.src;
					$backGround.style.top = '0px';
					$nextBackGround.style.display = 'none';


					if ($hensu.muki == 'n') {
						$p.moveTo($p.x, 480 - 32);

					} else if ($hensu.muki == 'e') {
						$p.moveTo(0, $p.y);

					} else if ($hensu.muki == 's') {
						$p.moveTo($p.x, 0);

					} else if ($hensu.muki == 'w') {
						$p.moveTo(640 - 32, $p.y);
					}



					for (let i = 0; i < $field.length; i++) {
						$field[i] = $nextField[i];
					}
					display();


					$mode = 'free';
				}
			}

		setTimeout(arguments.callee, $frameTiming);
	}

	function move_tate(hougaku: string): void {
		let check_ascii_x = Math.floor(($p.x + 0) / 16);
		let check_ascii_y = hougaku == 's' ? Math.floor(($p.y + 32) / 32) : Math.floor($p.y / 32) - (($p.y % 32 == 0) ? 1 : 0);

		let check_c1 = get(check_ascii_x, check_ascii_y);
		let check_c2 = get(check_ascii_x + 1, check_ascii_y);
		let check_offet = $p.x % 16 == 0 ? ' ' : get(check_ascii_x + 2, check_ascii_y);

		move_check(hougaku, check_c1, check_c2, check_offet);
	}

	function move_yoko(hougaku: string): void {
		let check_ascii_x = hougaku == 'e' ? Math.floor(($p.x + 32) / 16) : Math.floor($p.x / 16) - (($p.x % 16 == 0) ? 1 : 0);
		let check_ascii_y = Math.floor(($p.y + 0) / 32);

		let check_c = get(check_ascii_x, check_ascii_y);
		let check_offet = $p.y % 32 == 0 ? ' ' : get(check_ascii_x, check_ascii_y + 1);

		move_check(hougaku, check_c, ' ', check_offet);
	}

	function move_check(hougaku: string, c1: string, c2: string, c3: string) {
		if (c1 == ' ' && c2 == ' ' && c3 == ' ') {
			if ($p.muki == hougaku) {
				putc($p.ascii_x, $p.ascii_y, ' ');
				$koudouArray.push({ type: 'idou', value: $hougaku[hougaku] });
			} else {
				$p.muki = hougaku;
			}
		}
	}
