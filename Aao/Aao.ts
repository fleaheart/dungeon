
let KEY_UP = 38, KEY_RIGHT = 39, KEY_DOWN = 40, KEY_LEFT = 37;

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
		this.x = 0;
		this.y = 0;
		this.ascii_x = 0;
		this.ascii_y = 0;
		this.muki = 'e'
	}

	public moveTo(x_: number, y_: number): void {
		let dx: number = x_ - this.x;
		let dy: number = y_ - this.y;
		this.moveBy(dx, dy);
		this.x = x_;
		this.y = y_;
	}

	public moveBy(dx_: number, dy_: number): void {
		if (dx_ < 0) {
			this.img.src = 'player3.png';
		}
		if (0 < dx_) {
			this.img.src = 'player4.png';
		}
		if (dy_ < 0) {
			this.img.src = 'player2.png';
		}
		if (0 < dy_) {
			this.img.src = 'player1.png';
		}
		this.x += dx_;
		this.y += dy_;
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

window.addEventListener('load', function (): void {
	let koukoku: HTMLElement | null = document.getElementById('y_gc_div_uadcntr');
	if (koukoku != null) {
		koukoku.style.zIndex = '0';
		koukoku.style.position = 'absolute';
		koukoku.style.top = '600px';
	}

	let divframe: HTMLElement | null = document.getElementById('debug');
	if (divframe != null) {
		divframe.style.position = 'absolute';
		divframe.style.top = '180px';
		divframe.style.left = '660px';
	}

	{
		let elm: HTMLElement | null = document.getElementById('divFieldAscii');
		if (elm == null) {
			throw new Error();
		}
		elm.style.left = '660px'
	} {
		let elm: HTMLElement | null = document.getElementById('divObjectAscii');
		if (elm == null) {
			throw new Error();
		}
		elm.style.left = '660px'
	}

	let _frameTiming: number = 16;
	let _frameCount: number;
	let _keyCode: number;
	let _koudouArray = new Array();
	let _mode: string;

	class Hensu {
		muki: string;
		frame: number;
		frameend: number;
	}

	let _hensu: Hensu = new Hensu();
	let _dbg: string = '';

	let _field1: string[] = new Array();
	_field1.push('**************************      ********');
	_field1.push('*        **                            *');
	_field1.push('*       **    **      ***      ****    *');
	_field1.push('*      **    **    ****************    *');
	_field1.push('********    **     ******  *****       *');
	_field1.push('**          **              ****       *');
	_field1.push('**   ********                          *');
	_field1.push('**   *                                 *');
	_field1.push('**   *                      ***        *');
	_field1.push('**   *                      ***        *');
	_field1.push('*                                      *');
	_field1.push('*                                      *');
	_field1.push('*          ****               **********');
	_field1.push('*          ****               **********');
	_field1.push('****************************************');

	let _field2: string[] = new Array();
	_field2.push('****************************************');
	_field2.push('*                                      *');
	_field2.push('*                                      *');
	_field2.push('*                                      *');
	_field2.push('*                                      *');
	_field2.push('*                                       ');
	_field2.push('*                                       ');
	_field2.push('*                                       ');
	_field2.push('*                                       ');
	_field2.push('*                                      *');
	_field2.push('*                                      *');
	_field2.push('*                                      *');
	_field2.push('*                                      *');
	_field2.push('*                                      *');
	_field2.push('**************************      ********');

	let _field3: string[] = new Array();
	_field3.push('****************************************');
	_field3.push('*                                      *');
	_field3.push('*                                      *');
	_field3.push('*                                      *');
	_field3.push('*                                      *');
	_field3.push('                                       *');
	_field3.push('                                       *');
	_field3.push('                                       *');
	_field3.push('                                       *');
	_field3.push('*                                      *');
	_field3.push('*                                      *');
	_field3.push('*                                      *');
	_field3.push('*                                      *');
	_field3.push('*                                      *');
	_field3.push('****************************************');

	let _field: string[] = new Array();
	let _nextField: string[] = new Array();
	for (let i = 0; i < _field1.length; i++) {
		_field.push(_field1[i]);
	}
	let _object: string[] = new Array();
	for (let i = 0; i < _field.length; i++) {
		_object.push('                                        ');
	}

	let _hougaku: { [index: string]: any; } = {
		n: { x: 0, y: -1 }, e: { x: 1, y: 0 }, s: { x: 0, y: 1 }, w: { x: -1, y: 0 }
	}

	let bg: HTMLImageElement = <HTMLImageElement>document.createElement('IMG');
	bg.src = 'map1.png';
	bg.style.position = 'absolute';

	let nextbg: HTMLImageElement = <HTMLImageElement>document.createElement('IMG');
	bg.src = 'map1.png';
	nextbg.style.position = 'absolute';
	nextbg.style.display = 'none';

	let divField = document.getElementById('divFieldGraph');
	if (divField == null) {
		throw new Error();
	}
	divField.appendChild(bg);
	divField.appendChild(nextbg);

	let c: Charactor = new Charactor('A');
	let cimg: HTMLImageElement = <HTMLImageElement>document.createElement('IMG');
	cimg.style.position = 'absolute';
	cimg.src = 'player.png'

	c.img = cimg;
	c.moveTo(18 * 16, 2 * 32);
	divField.appendChild(cimg);

	put(c);

	display();

	_frameCount = 0;
	_mode = 'free';
	setTimeout(frameCheck, _frameTiming);

	function put(obj: Charactor): void {
		putc(obj.ascii_x, obj.ascii_y, obj.chr);
	}

	function putc(x: number, y: number, c: string): void {
		let swp = _object[y];
		swp = swp.substr(0, x) + c + swp.substr(x + 1);
		_object[y] = swp;
	}

	function get(x: number, y: number): string {
		if (y < 0 || _field.length <= y) {
			return '';
		}
		if (x < 0 || _field[y].length <= x) {
			return '';
		}
		return _field[y].charAt(x);
	}

	function display(): void {
		let divFieldAscii: HTMLElement | null = document.getElementById('divFieldAscii');
		if (divFieldAscii == null) {
			throw new Error();
		}
		divFieldAscii.innerHTML = _field.join('<br>').replace(/ /g, '&nbsp;');

		let divObjectAscii: HTMLElement | null = document.getElementById('divObjectAscii');
		if (divObjectAscii == null) {
			throw new Error();
		}
		divObjectAscii.innerHTML = _object.join('<br>').replace(/ /g, '&nbsp;');
	}

	document.addEventListener('keydown', function (e: KeyboardEvent): void {
		_keyCode = e.keyCode;
	});

	document.addEventListener('keyup', function (e: KeyboardEvent): void {
		if (e.keyCode == _keyCode) {
			_keyCode = -1;
		}
	});

	function frameCheck(): void {

		_frameCount++;
		let debugElm = document.getElementById('debug');
		if (debugElm != null) {
			debugElm.innerHTML =
				_mode + '<br>' + _frameCount + '<br>' + _keyCode
				+ '<br>' + c.x + ',' + c.y
				+ '<br>' + c.ascii_x + ',' + c.ascii_y
				+ '<br>[' + _dbg + ']'
				;
		}

		if (_keyCode == 27) {
			return;
		}

		if (_mode == 'free') {
			if (_frameCount % 2 == 0) {

				if (0 < _koudouArray.length) {

					let koudou = _koudouArray.shift();
					if (koudou.type == 'idou') {

						c.moveBy(koudou.value.x * 4, koudou.value.y * 4);

						if (c.muki == 'n' && c.y <= 0) {
							nextbg.src = 'map2.png';
							nextbg.style.position = 'absolute';
							nextbg.style.top = '-480px';
							nextbg.style.left = '0px';

							bg.style.top = '0px';
							bg.style.left = '0px';

							_nextField = _field2;

							_hensu = { muki: 'n', frame: 0, frameend: 30 };

							nextbg.style.display = '';

							_mode = 'scrl';
						}
						if (c.muki == 'e' && 640 - 32 <= c.x) {
							nextbg.src = 'map3.png';
							nextbg.style.position = 'absolute';
							nextbg.style.top = '0px';
							nextbg.style.left = '640px';

							bg.style.top = '0px';
							bg.style.left = '0px';

							_nextField = _field3;

							_hensu = { muki: 'e', frame: 0, frameend: 40 };

							nextbg.style.display = '';

							_mode = 'scrl';
						}
						if (c.muki == 's' && 480 - 32 <= c.y) {
							nextbg.src = 'map1.png';
							nextbg.style.top = '480px';
							nextbg.style.left = '0px';

							bg.style.top = '0px';
							bg.style.left = '0px';

							_nextField = _field1;

							_hensu = { muki: 's', frame: 0, frameend: 30 };

							nextbg.style.display = '';

							_mode = 'scrl';
						}
						if (c.muki == 'w' && c.x <= 0) {
							nextbg.src = 'map2.png';
							nextbg.style.position = 'absolute';
							nextbg.style.top = '0px';
							nextbg.style.left = '-640px';

							bg.style.top = '0px';
							bg.style.left = '0px';

							_nextField = _field2;

							_hensu = { muki: 'w', frame: 0, frameend: 40 };

							nextbg.style.display = '';

							_mode = 'scrl';
						}
					}
					if (koudou.type == 'jump') {
						c.moveBy(0, koudou.value);
					}
				}

				put(c);
				display();

				if (_mode != 'scrl') {
					if (_keyCode == KEY_UP) {
						move_tate('n');
					}
					if (_keyCode == KEY_RIGHT) {
						move_yoko('e');
					}
					if (_keyCode == KEY_DOWN) {
						move_tate('s');
					}
					if (_keyCode == KEY_LEFT) {
						move_yoko('w');
					}
				}
			}
		} else
			if (_mode == 'scrl') {
				if (_hensu.frame == 0) {
					putc(c.ascii_x, c.ascii_y, ' ');
				}

				_hensu.frame++;
				if (_hensu.muki == 'n') {
					nextbg.style.top = (-480 + 16 * _hensu.frame) + 'px';
					bg.style.top = (0 + 16 * _hensu.frame) + 'px';
					c.moveBy(0, 15);
				} else
					if (_hensu.muki == 'e') {
						nextbg.style.left = (640 - 16 * _hensu.frame) + 'px';
						bg.style.left = (0 - 16 * _hensu.frame) + 'px';
						c.moveBy(-15.2, 0);
					} else
						if (_hensu.muki == 's') {
							nextbg.style.top = (480 - 16 * _hensu.frame) + 'px';
							bg.style.top = (0 - 16 * _hensu.frame) + 'px';
							c.moveBy(0, -15);
						} else
							if (_hensu.muki == 'w') {
								nextbg.style.left = (-640 + 16 * _hensu.frame) + 'px';
								bg.style.left = (0 + 16 * _hensu.frame) + 'px';
								c.moveBy(15.2, 0);
							}

				if (_hensu.frameend <= _hensu.frame) {
					bg.src = nextbg.src;
					bg.style.top = '0px';
					nextbg.style.display = 'none';


					if (_hensu.muki == 'n') {
						c.moveTo(c.x, 480 - 32);

					} else
						if (_hensu.muki == 'e') {
							c.moveTo(0, c.y);

						} else
							if (_hensu.muki == 's') {
								c.moveTo(c.x, 0);

							} else
								if (_hensu.muki == 'w') {
									c.moveTo(640 - 32, c.y);
								}



					for (let i = 0; i < _field.length; i++) {
						_field[i] = _nextField[i];
					}
					display();


					_mode = 'free';
				}
			}

		setTimeout(arguments.callee, _frameTiming);
	}

	function move_tate(hougaku: string): void {
		let check_ascii_x = Math.floor((c.x + 0) / 16);
		let check_ascii_y = hougaku == 's' ? Math.floor((c.y + 32) / 32) : Math.floor(c.y / 32) - ((c.y % 32 == 0) ? 1 : 0);

		let check_c1 = get(check_ascii_x, check_ascii_y);
		let check_c2 = get(check_ascii_x + 1, check_ascii_y);
		let check_offet = c.x % 16 == 0 ? ' ' : get(check_ascii_x + 2, check_ascii_y);

		move_check(hougaku, check_c1, check_c2, check_offet);
	}

	function move_yoko(hougaku: string): void {
		let check_ascii_x = hougaku == 'e' ? Math.floor((c.x + 32) / 16) : Math.floor(c.x / 16) - ((c.x % 16 == 0) ? 1 : 0);
		let check_ascii_y = Math.floor((c.y + 0) / 32);

		let check_c = get(check_ascii_x, check_ascii_y);
		let check_offet = c.y % 32 == 0 ? ' ' : get(check_ascii_x, check_ascii_y + 1);

		move_check(hougaku, check_c, ' ', check_offet);
	}

	function move_check(hougaku: string, c1: string, c2: string, c3: string) {
		if (c1 == ' ' && c2 == ' ' && c3 == ' ') {
			if (c.muki == hougaku) {
				putc(c.ascii_x, c.ascii_y, ' ');
				_koudouArray.push({ type: 'idou', value: _hougaku[hougaku] });
			} else {
				c.muki = hougaku;
			}
		}
	}

});
