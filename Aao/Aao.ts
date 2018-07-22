namespace Aao {
	let KEY_UP = 87, KEY_RIGHT = 68, KEY_DOWN = 83, KEY_LEFT = 65;

	class Character {
		chr: string;
		img: HTMLImageElement;
		x: number;
		y: number;
		muki: MukiType;

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

	class GameFieldGamen {
		name: string;
		field: Array<string>;
		imgsrc: string;

		over: { [mukiType: string]: string | null } = {};

		constructor(name: string, field: Array<string>, imgsrc: string, over_n: string | null, over_e: string | null, over_s: string | null, over_w: string | null) {
			this.name = name;
			this.field = field;
			this.imgsrc = imgsrc;
			this.over['n'] = over_n;
			this.over['e'] = over_e;
			this.over['s'] = over_s;
			this.over['w'] = over_w;
		}
	}
	let NullGameFieldGamen: GameFieldGamen = new GameFieldGamen('null', new Array<string>(), '', null, null, null, null);

	let $field1: string[] = new Array();
	let $field2: string[] = new Array();
	let $field3: string[] = new Array();

	let $koudouArray = new Array();
	let $lastKeyCode: number;

	const FRAME_TIMING: number = 16;

	let $pc: Character;

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

	let _GameFieldGamenList: Array<GameFieldGamen> = new Array<GameFieldGamen>();
	function getGameFieldGamen(name: string): GameFieldGamen {
		for (let i = 0, len: number = _GameFieldGamenList.length; i < len; i++) {
			let item: GameFieldGamen = _GameFieldGamenList[i];
			if (item.name == name) {
				return item;
			}
		}
		throw name + ' is not found';
	}

	let $hougaku: { [index: string]: XY } = {
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

	class GameStatus {
		gameMode: GameMode | null = null;
		player: Character = new Character('');

		gameFieldGamen: GameFieldGamen = NullGameFieldGamen;

		frameCount: number = 0;
		lastKey: string = '';
	}
	let _gameStatus: GameStatus = new GameStatus();

	interface GameMode {
		name: string;
		gameStatus: GameStatus;

		do: Function;
	}

	class FreeGameMode implements GameMode {
		readonly name: string = 'free';
		gameStatus: GameStatus;

		constructor(gameStatus: GameStatus) {
			this.gameStatus = gameStatus;
		}

		do() {
			if (this.gameStatus.frameCount % 2 != 0) {
				return;
			}

			if (0 < $koudouArray.length) {

				let koudou = $koudouArray.shift();
				if (koudou.type == 'idou') {

					$pc.moveBy(koudou.value.x * 4, koudou.value.y * 4);

					let muki: Muki = createMuki($pc.muki);
					if (muki.over($pc)) {
						let nextName = _gameStatus.gameFieldGamen.over[muki.muki];
						if (nextName != null) {
							let nextGameFieldGamen: GameFieldGamen = getGameFieldGamen(nextName);
							this.gameStatus.gameMode = new ScrollGameMode(this.gameStatus, $pc.muki, nextGameFieldGamen);
							return;
						}
					}
				}
				if (koudou.type == 'jump') {
					$pc.moveBy(0, koudou.value);
				}
			}

			put($pc);
			display();

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

	class ScrollGameMode implements GameMode {
		readonly name: string = 'scrl';
		gameStatus: GameStatus;

		muki: Muki;
		nextGameFieldGamen: GameFieldGamen;
		frame: number;

		constructor(gameStatus: GameStatus, mukiType: MukiType, nextGameFieldGamen: GameFieldGamen) {
			this.gameStatus = gameStatus;
			this.muki = createMuki(mukiType);
			this.nextGameFieldGamen = nextGameFieldGamen;

			this.frame = 0;
		}

		do() {
			if (this.frame == 0) {

				_gameBoard.next.field = this.nextGameFieldGamen.field;
				_gameBoard.next.backGround.src = this.nextGameFieldGamen.imgsrc;
				_gameBoard.next.backGround.style.top = this.muki.nextPosition + 'px';
				_gameBoard.next.backGround.style.left = '0px';

				_gameBoard.current.backGround.style.top = '0px';
				_gameBoard.current.backGround.style.left = '0px';

				_gameBoard.next.backGround.style.display = '';

				putc($pc.asciiPosX(), $pc.asciiPosY(), ' ');
			}

			this.frame++;

			let scrollAmount: ScrollAmount = this.muki.scroll(this.frame);

			_gameBoard.current.backGround.style.top = scrollAmount.current.top + 'px';
			_gameBoard.current.backGround.style.left = scrollAmount.current.left + 'px';
			_gameBoard.next.backGround.style.top = scrollAmount.next.top + 'px';
			_gameBoard.next.backGround.style.left = scrollAmount.next.left + 'px';

			$pc.moveBy(scrollAmount.pc.x, scrollAmount.pc.y);

			if (this.muki.frameEnd <= this.frame) {
				_gameBoard.current.backGround.src = _gameBoard.next.backGround.src;
				_gameBoard.current.backGround.style.top = '0px';
				_gameBoard.current.backGround.style.left = '0px';
				_gameBoard.next.backGround.style.display = 'none';

				this.muki.scrollEndAdgust($pc);

				for (let i = 0; i < _gameBoard.current.field.length; i++) {
					_gameBoard.current.field[i] = _gameBoard.next.field[i];
				}
				display();

				this.gameStatus.gameFieldGamen = this.nextGameFieldGamen;
				this.gameStatus.gameMode = new FreeGameMode(this.gameStatus);
			}
		}
	}

	function frameCheck(): void {
		let gameStatus: GameStatus = _gameStatus;

		gameStatus.frameCount++;

		if (gameStatus.gameMode == null) {
			gameStatus.gameMode = new FreeGameMode(gameStatus);
		}

		if (_gameBoard.debug != null) {
			_gameBoard.debug.innerHTML =
				gameStatus.gameMode.name
				+ '<br>' + gameStatus.frameCount
				+ '<br>' + gameStatus.lastKey
				+ ' / ' + $lastKeyCode
				+ '<br>' + gameStatus.gameFieldGamen.name
				+ '<br>' + $pc.x + ',' + $pc.y
				+ '<br>' + $pc.asciiPosX() + ',' + $pc.asciiPosY()
				;
		}

		if ($lastKeyCode == 27) {
			return;
		}

		gameStatus.gameMode.do();

		setTimeout(frameCheck, FRAME_TIMING);
	}

	function move_tate(hougaku: MukiType): void {
		let check_ascii_x = Math.floor(($pc.x + 0) / 16);
		let check_ascii_y = hougaku == 's' ? Math.floor(($pc.y + 32) / 32) : Math.floor($pc.y / 32) - (($pc.y % 32 == 0) ? 1 : 0);

		let check_c1 = get(check_ascii_x, check_ascii_y);
		let check_c2 = get(check_ascii_x + 1, check_ascii_y);
		let check_offet = $pc.x % 16 == 0 ? ' ' : get(check_ascii_x + 2, check_ascii_y);

		move_check(hougaku, check_c1, check_c2, check_offet);
	}

	function move_yoko(hougaku: MukiType): void {
		let check_ascii_x = hougaku == 'e' ? Math.floor(($pc.x + 32) / 16) : Math.floor($pc.x / 16) - (($pc.x % 16 == 0) ? 1 : 0);
		let check_ascii_y = Math.floor(($pc.y + 0) / 32);

		let check_c = get(check_ascii_x, check_ascii_y);
		let check_offet = $pc.y % 32 == 0 ? ' ' : get(check_ascii_x, check_ascii_y + 1);

		move_check(hougaku, check_c, ' ', check_offet);
	}

	function move_check(hougaku: MukiType, c1: string, c2: string, c3: string) {
		if (c1 == ' ' && c2 == ' ' && c3 == ' ') {
			if ($pc.muki == hougaku) {
				putc($pc.asciiPosX(), $pc.asciiPosY(), ' ');
				$koudouArray.push({ type: 'idou', value: $hougaku[hougaku] });
			} else {
				$pc.muki = hougaku;
			}
		}
	}

	type MukiType = 'n' | 'e' | 's' | 'w';

	interface Muki {
		muki: MukiType;
		over: Function;
		nextPosition: Position;
		scroll(frame: number): ScrollAmount;
		frameEnd: number;
		scrollEndAdgust(pc: Character): void;
	}

	interface Position {
		top: number;
		left: number;
	}

	interface XY {
		x: number;
		y: number;
	}

	interface ScrollAmount {
		current: Position;
		next: Position;
		pc: XY;
	}

	class Muki_N implements Muki {
		muki: MukiType = 'n';
		readonly frameEnd: number = 30;

		over(pc: Character): boolean {
			return pc.y <= 0;
		}

		nextPosition: Position = { top: -480, left: 0 };

		scroll(frame: number): ScrollAmount {
			let current: Position = { top: 0 + 16 * frame, left: 0 };
			let next: Position = { top: -480 + 16 * frame, left: 0 };
			let pc: XY = { x: 0, y: 15 };

			return { current: current, next: next, pc: pc }
		}

		scrollEndAdgust(pc: Character): void {
			pc.moveTo(pc.x, 480 - 32);
		}
	}
	let muki_n = new Muki_N();

	class Muki_E implements Muki {
		muki: MukiType = 'e';
		readonly frameEnd: number = 40;

		over(pc: Character): boolean {
			return 640 - 32 <= pc.x;
		}

		nextPosition: Position = { top: 0, left: 640 };

		scroll(frame: number): ScrollAmount {
			let current: Position = { top: 0, left: 0 - 16 * frame };
			let next: Position = { top: 0, left: 640 - 16 * frame };
			let pc: XY = { x: -15.2, y: 0 };

			return { current: current, next: next, pc: pc }
		}

		scrollEndAdgust(pc: Character): void {
			pc.moveTo(0, pc.y);
		}
	}
	let muki_e = new Muki_E();

	class Muki_S implements Muki {
		muki: MukiType = 's';
		readonly frameEnd: number = 30;

		over(pc: Character): boolean {
			return 480 - 32 <= pc.y;
		}

		nextPosition: Position = { top: 480, left: 0 };

		scroll(frame: number): ScrollAmount {
			let current: Position = { top: 0 - 16 * frame, left: 0 };
			let next: Position = { top: 480 - 16 * frame, left: 0 };
			let pc: XY = { x: 0, y: -15 };

			return { current: current, next: next, pc: pc }
		}

		scrollEndAdgust(pc: Character): void {
			pc.moveTo(pc.x, 0);
		}
	}
	let muki_s = new Muki_S();

	class Muki_W implements Muki {
		muki: MukiType = 'w';
		readonly frameEnd: number = 40;

		over(pc: Character): boolean {
			return pc.x <= 0;
		}

		nextPosition: Position = { top: 0, left: -640 };

		scroll(frame: number): ScrollAmount {
			let current: Position = { top: 0, left: 0 + 16 * frame };
			let next: Position = { top: 0, left: -640 + 16 * frame };
			let pc: XY = { x: 15.2, y: 0 };

			return { current: current, next: next, pc: pc }
		}

		scrollEndAdgust(pc: Character): void {
			pc.moveTo(640 - 32, pc.y);
		}
	}
	let muki_w = new Muki_W();

	function createMuki(mukiType: MukiType): Muki {
		if (mukiType == 'n') {
			return muki_n;
		} else if (mukiType == 'e') {
			return muki_e;
		} else if (mukiType == 's') {
			return muki_s;
		} else if (mukiType == 'w') {
			return muki_w;
		}
		throw mukiType + ' is illigal argument';
	}

	window.addEventListener('load', (): void => {
		initMainBoard();

		document.addEventListener('keydown', (e: KeyboardEvent): void => {
			$lastKeyCode = e.keyCode;
			_gameStatus.lastKey = e.key;
		});

		document.addEventListener('keyup', (e: KeyboardEvent): void => {
			if (e.keyCode == $lastKeyCode) {
				$lastKeyCode = -1;
			}
		});

		_GameFieldGamenList.push(new GameFieldGamen('field1', $field1, 'map1.png', 'field2', null, null, null));
		_GameFieldGamenList.push(new GameFieldGamen('field2', $field2, 'map2.png', null, 'field3', 'field1', null));
		_GameFieldGamenList.push(new GameFieldGamen('field3', $field3, 'map3.png', null, null, null, 'field2'));

		$pc = new Character('A');
		$pc.moveTo(18 * 16, 2 * 32);
		_gameBoard.fieldGraph.appendChild($pc.img);

		_gameStatus.player = $pc;
		_gameStatus.gameFieldGamen = getGameFieldGamen('field1');

		put($pc);

		display();

		setTimeout(frameCheck, FRAME_TIMING);
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