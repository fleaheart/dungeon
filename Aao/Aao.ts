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

	const FRAME_TIMING: number = 16;

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

	interface Koudou {
		type: string;
		muki: Muki;
	}

	class GameStatus {
		gameMode: GameMode | null = null;
		player: Character = new Character('');

		gameFieldGamen: GameFieldGamen = NullGameFieldGamen;

		frameCount: number = 0;
		lastKeyCode: number = -1;
		lastKey: string = '';

		koudouArray: Array<Koudou> = new Array<Koudou>();
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

			if (0 < this.gameStatus.koudouArray.length) {

				let koudou = this.gameStatus.koudouArray.shift();
				if (koudou != undefined) {
					if (koudou.type == 'idou') {
						let muki: Muki = koudou.muki;

						this.gameStatus.player.moveBy(muki.nextXY.x * 4, muki.nextXY.y * 4);

						if (muki.over(this.gameStatus.player)) {
							let nextName = this.gameStatus.gameFieldGamen.over[muki.muki];
							if (nextName != null) {
								let nextGameFieldGamen: GameFieldGamen = getGameFieldGamen(nextName);
								this.gameStatus.gameMode = new ScrollGameMode(this.gameStatus, this.gameStatus.player.muki, nextGameFieldGamen);
								return;
							}
						}
					}
					if (koudou.type == 'jump') {
						// 未実装
					}
				}
			}

			put(this.gameStatus.player);
			display();

			let lastKeyCode = this.gameStatus.lastKeyCode;
			if (lastKeyCode == KEY_UP) {
				this.move(muki_n);
			}
			if (lastKeyCode == KEY_RIGHT) {
				this.move(muki_e);
			}
			if (lastKeyCode == KEY_DOWN) {
				this.move(muki_s);
			}
			if (lastKeyCode == KEY_LEFT) {
				this.move(muki_w);
			}
		}

		move(muki: Muki) {
			let player: Character = this.gameStatus.player;

			let next_ascii_x = Math.floor(player.x / 16) + ((player.x % 16 == 0) ? 1 : 0) * muki.nextXY.x;
			let next_ascii_y = Math.floor(player.y / 32) + ((player.y % 32 == 0) ? 1 : 0) * muki.nextXY.y;

			let check_c1 = get(next_ascii_x, next_ascii_y);
			let check_c2 = get(next_ascii_x + 1, next_ascii_y);

			if (check_c1 == ' ' && check_c2 == ' ') {
				if (player.muki == muki.muki) {
					putc(player.asciiPosX(), player.asciiPosY(), ' ');
					this.gameStatus.koudouArray.push({ type: 'idou', muki: muki });
				} else {
					player.muki = muki.muki;
				}
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
				_gameBoard.next.backGround.style.display = '';
				putc(this.gameStatus.player.asciiPosX(), this.gameStatus.player.asciiPosY(), ' ');
			}

			this.frame++;

			_gameBoard.current.backGround.style.top = String(this.frame * -16 * this.muki.nextXY.y) + 'px';
			_gameBoard.current.backGround.style.left = String(this.frame * -16 * this.muki.nextXY.x) + 'px';
			_gameBoard.next.backGround.style.top = String(480 * this.muki.nextXY.y + this.frame * -16 * this.muki.nextXY.y) + 'px';
			_gameBoard.next.backGround.style.left = String(640 * this.muki.nextXY.x + this.frame * -16 * this.muki.nextXY.x) + 'px';

			this.gameStatus.player.moveBy(-15.2 * this.muki.nextXY.x, -15 * this.muki.nextXY.y);

			if (this.muki.frameEnd <= this.frame) {
				_gameBoard.current.backGround.src = _gameBoard.next.backGround.src;
				_gameBoard.current.backGround.style.top = '0px';
				_gameBoard.current.backGround.style.left = '0px';
				_gameBoard.next.backGround.style.display = 'none';

				this.muki.scrollEndAdgust(this.gameStatus.player);

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
				+ ' / ' + gameStatus.lastKeyCode
				+ '<br>' + gameStatus.gameFieldGamen.name
				+ '<br>' + gameStatus.player.x + ',' + gameStatus.player.y
				+ '<br>' + gameStatus.player.asciiPosX() + ',' + gameStatus.player.asciiPosY()
				;
		}

		if (gameStatus.lastKeyCode == 27) {
			return;
		}

		gameStatus.gameMode.do();

		setTimeout(frameCheck, FRAME_TIMING);
	}

	type MukiType = 'n' | 'e' | 's' | 'w';

	interface Muki {
		muki: MukiType;
		nextXY: XY;
		over: Function;
		frameEnd: number;
		scrollEndAdgust(pc: Character): void;
	}

	interface XY {
		x: number;
		y: number;
	}

	class Muki_N implements Muki {
		muki: MukiType = 'n';
		readonly nextXY: XY = { x: 0, y: -1 };
		readonly frameEnd: number = 30;

		over(pc: Character): boolean {
			return pc.y <= 0;
		}

		scrollEndAdgust(pc: Character): void {
			pc.moveTo(pc.x, 480 - 32);
		}
	}
	let muki_n = new Muki_N();

	class Muki_E implements Muki {
		muki: MukiType = 'e';
		readonly nextXY: XY = { x: 1, y: 0 };
		readonly frameEnd: number = 40;

		over(pc: Character): boolean {
			return 640 - 32 <= pc.x;
		}

		scrollEndAdgust(pc: Character): void {
			pc.moveTo(0, pc.y);
		}
	}
	let muki_e = new Muki_E();

	class Muki_S implements Muki {
		muki: MukiType = 's';
		readonly nextXY: XY = { x: 0, y: 1 };
		readonly frameEnd: number = 30;

		over(pc: Character): boolean {
			return 480 - 32 <= pc.y;
		}

		scrollEndAdgust(pc: Character): void {
			pc.moveTo(pc.x, 0);
		}
	}
	let muki_s = new Muki_S();

	class Muki_W implements Muki {
		muki: MukiType = 'w';
		readonly nextXY: XY = { x: -1, y: 0 };
		readonly frameEnd: number = 40;

		over(pc: Character): boolean {
			return pc.x <= 0;
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
			_gameStatus.lastKeyCode = e.keyCode;
			_gameStatus.lastKey = e.key;
		});

		document.addEventListener('keyup', (e: KeyboardEvent): void => {
			if (e.keyCode == _gameStatus.lastKeyCode) {
				_gameStatus.lastKeyCode = -1;
				_gameStatus.lastKey = '';
			}
		});

		_GameFieldGamenList.push(new GameFieldGamen('field1', $field1, 'map1.png', 'field2', null, null, null));
		_GameFieldGamenList.push(new GameFieldGamen('field2', $field2, 'map2.png', null, 'field3', 'field1', null));
		_GameFieldGamenList.push(new GameFieldGamen('field3', $field3, 'map3.png', null, null, null, 'field2'));

		let player = new Character('A');
		player.moveTo(18 * 16, 2 * 32);
		_gameBoard.fieldGraph.appendChild(player.img);

		_gameStatus.player = player;
		_gameStatus.gameFieldGamen = getGameFieldGamen('field1');

		put(player);

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