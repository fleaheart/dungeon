namespace SaikoroBattle {

	let _debugBoard: HTMLDivElement;
	function debug(text: string) {
		let html = _debugBoard.innerHTML;
		html += text + '<br>';
		_debugBoard.innerHTML = html;
	}
	function debugClear(): void {
		_debugBoard.innerHTML = '';
	}

	export function dbg(text: string) {
		let dbg = getElementById('debugBoard2');
		let h = dbg.innerHTML;
		h += text + ' / ';
		dbg.innerHTML = h;
	}

	function getElementById(elementId: string): HTMLElement {
		let elm: HTMLElement | null = document.getElementById(elementId);
		if (elm == null) {
			throw elementId + ' is not found.';
		}
		return elm;
	}

	function load(url: string): string {
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

	type OmoteUraType = 'OMOTE' | 'URA';

	class GameDeifine {
		public attackActionList: Array<AttackAction> = new Array<AttackAction>();
		public defenseActionList: Array<DefenseAction> = new Array<DefenseAction>();

		public playerList: Array<Character> = new Array<Character>();
		public enemyList: Array<Character> = new Array<Character>();
	}
	let _gameDeifine = new GameDeifine();

	class GameStatus {
		public gameMode: GameMode | null = null;
		public players: Array<Player> = new Array<Player>();
		public omoteUra: OmoteUraType = 'OMOTE'
		public attacker: Player = NullCharacter;
		public defender: Player = NullCharacter;
	}
	let _gameStatus = new GameStatus();

	export function init(): void {
		_debugBoard = <HTMLDivElement>getElementById('debugBoard');

		initDefine();

		_gameStatus.players.push(new Player(_gameDeifine.playerList[0]));
		_gameStatus.players.push(new Player(_gameDeifine.enemyList[0]));

		initMainBoard(_gameStatus);
	};

	function initDefine() {
		let fileData: string = load('SaikoroBattle.txt');
		let lines: string[] = fileData.split(/[\r\n]+/);

		for (let i = 0, len: number = lines.length; i < len; i++) {
			let columns: string[] = lines[i].split(/\t/);

			if (columns.length < 4) {
				continue;
			}

			let id: number = +columns[0];
			let type: string = columns[1];
			//	let alphanumericName: string = columns[2];
			let name: string = columns[3];

			if (type == 'Attack') {
				let action = new AttackAction(id, name, +columns[4]);
				_gameDeifine.attackActionList.push(action);

			} else if (type == 'Defense') {
				let action = new DefenseAction(id, name, +columns[4]);
				if (columns[5] == 'through') {
					action.through = true;
				}

				_gameDeifine.defenseActionList.push(action);

			} else if (type == 'Player' || type == 'Enemy') {
				let character = new Character(id, type, name);
				character.hitPointMax = +columns[4];

				setDefaultActionPalette(_gameDeifine.attackActionList, columns[5], character.attackPalette);
				setDefaultActionPalette(_gameDeifine.defenseActionList, columns[6], character.defensePalette);

				if (type == 'Player') {
					_gameDeifine.playerList.push(character);
				} else if (type == 'Enemy') {
					_gameDeifine.enemyList.push(character);
				}
			}
		}
	}

	function setDefaultActionPalette<T extends Action>(list: Array<T>, idText: string, palette: Array<T>): void {
		let ids: string[] = idText.split(',');
		if (ids.length != 6) {
			throw 'illegal palette count';
		}

		palette.length = 0;
		for (let i = 0; i < 6; i++) {
			let action = pickupAction(list, +ids[i]);
			palette.push(action);
		}
	}

	function pickupAction<T extends Action>(list: Array<T>, id: number): T {
		for (let i = 0, len: number = list.length; i < len; i++) {
			if (list[i].id == id) {
				return <T>list[i].clone();
			}
		}
		throw 'id:' + String(id) + ' is not found';
	}

	function initMainBoard(gameStatus: GameStatus): void {
		let mainBoard = <HTMLDivElement>getElementById('mainBoard');

		let startButton = <HTMLButtonElement>document.createElement('BUTTON');
		startButton.textContent = 'start';
		startButton.addEventListener('click', susumeruGame);
		mainBoard.appendChild(startButton);

		for (let i = 0, len: number = gameStatus.players.length; i < len; i++) {
			let player: Player = gameStatus.players[i];

			createActonBoard(player);

			mainBoard.appendChild(player.characterBoard);
		}
	}

	function createActonBoard(player: Player) {
		{
			let span = <HTMLSpanElement>document.createElement('SPAN');
			span.textContent = player.character.name + ' HP: ';
			player.characterBoard.appendChild(span);
		}
		{
			let span = <HTMLSpanElement>document.createElement('SPAN');
			player.characterBoard.appendChild(span);
			player.hitPointElement = span;
		}
		{
			let saikoro: HTMLDivElement = player.saikoroElement;
			saikoro.className = 'saikoro';
			player.characterBoard.appendChild(saikoro);
		}

		for (let attackDefense: number = 1; attackDefense <= 2; attackDefense++) {
			let actionBoard: HTMLDivElement;
			let actionBoxList: Array<HTMLDivElement>;

			if (attackDefense == 1) {
				actionBoard = player.attackActionBoard;
				actionBoxList = player.attackBoxList;
			} else {
				actionBoard = player.defenseActionBoard;
				actionBoxList = player.defenseBoxList;
			}

			actionBoard.className = 'actionBoard';
			for (let i = 0; i < 6; i++) {
				let actionBox = <HTMLDivElement>document.createElement('DIV');
				actionBox.className = 'actionBox';
				actionBoard.appendChild(actionBox);
				actionBoxList.push(actionBox);
			}

			player.characterBoard.appendChild(actionBoard);
		}
	}

	function integerRandom(maxValue: number): number {
		let value = Math.random() * maxValue;
		return Math.floor(value);
	}

	function saikoro(): number {
		return integerRandom(6);
	}

	interface GameObject {
		id: number;
		name: string;
	}

	interface Action extends GameObject {
		detail: string;
		power: number;

		clone(): Action;
	}

	class AttackAction implements Action {
		id: number;
		name: string;
		detail: string;
		power: number;

		constructor(id: number, name: string, power: number, detail?: string) {
			this.id = id;
			this.name = name;
			this.power = power;
			if (detail == undefined) {
				this.detail = '';
			} else {
				this.detail = detail;
			}
		}

		public clone(): AttackAction {
			let action = new AttackAction(this.id, this.name, this.power, this.detail);

			return action;
		}
	}

	class DefenseAction implements Action {
		id: number;
		name: string;
		detail: string;
		power: number;
		through: boolean = false;
		nigashiPoint: number = 0;

		constructor(id: number, name: string, power: number, detail?: string) {
			this.id = id;
			this.name = name;
			this.power = power;
			if (detail == undefined) {
				this.detail = '';
			} else {
				this.detail = detail;
			}
		}

		public clone(): DefenseAction {
			let action = new DefenseAction(this.id, this.name, this.power, this.detail);
			action.through = this.through;
			action.nigashiPoint = this.nigashiPoint;

			return action;
		}
	}

	class Character implements GameObject {
		id: number;
		type: string;

		name: string;
		hitPointMax: number = 0;

		attackPalette: Array<AttackAction> = new Array<AttackAction>();
		defensePalette: Array<DefenseAction> = new Array<DefenseAction>();

		constructor(id: number, type: string, name: string) {
			this.id = id;
			this.type = type;
			this.name = name;
		}

		clone(): Character {
			let character = new Character(this.id, this.type, this.name);
			character.hitPointMax = this.hitPointMax;

			cloneList(this.attackPalette, character.attackPalette);
			cloneList(this.defensePalette, character.defensePalette);

			return character;
		}
	}

	function cloneList<T extends Action>(source: Array<T>, destination: Array<T>): void {
		destination.length = 0;
		for (let i = 0, len: number = source.length; i < len; i++) {
			destination.push(<T>source[i].clone());
		}
	}

	class Player {
		character: Character;

		hitPoint: number = 0;

		characterBoard: HTMLDivElement;
		hitPointElement: HTMLSpanElement;
		saikoroElement: HTMLDivElement;
		saikoroMe: number = 1;

		attackActionBoard: HTMLDivElement;
		attackBoxList: Array<HTMLDivElement> = new Array<HTMLDivElement>();
		defenseActionBoard: HTMLDivElement;
		defenseBoxList: Array<HTMLDivElement> = new Array<HTMLDivElement>();

		constructor(character: Character) {
			this.character = character.clone();

			this.characterBoard = <HTMLDivElement>document.createElement('DIV');
			this.hitPointElement = <HTMLSpanElement>document.createElement('SPAN');
			this.saikoroElement = <HTMLDivElement>document.createElement('DIV');
			this.attackActionBoard = <HTMLDivElement>document.createElement('DIV');
			this.defenseActionBoard = <HTMLDivElement>document.createElement('DIV');
		}
	}

	let NullCharacter = new Player(new Character(-1, 'NULL', 'NULL'));

	interface GameMode extends Task.Task {
		gameStatus: GameStatus;
	}

	export function susumeruGame() {
		if (_gameStatus.gameMode == null) {
			_gameStatus.gameMode = new InitGameMode(_gameStatus);
		}

		if (_gameStatus.gameMode.mode == 'running') {
			_gameStatus.gameMode.asap();
			return;
		} else if (_gameStatus.gameMode.mode == 'idle') {
			_gameStatus.gameMode.do();
		}
	}

	class InitGameMode implements GameMode {
		public readonly name: string = 'InitGameMode';
		public mode: Task.ModeType = Task.TaskCtrl.DEFAULT_MODE;

		public gameStatus: GameStatus;

		private tasks = new Task.Tasks();

		constructor(gameStatus: GameStatus) {
			this.gameStatus = gameStatus;

			for (let i = 0, len: number = gameStatus.players.length; i < len; i++) {
				let player: Player = gameStatus.players[i];
				player.hitPoint = player.character.hitPointMax;
			}

			this.tasks.add(new ActionSetTask(gameStatus));

			this.tasks.add(new Task.FunctionTask(nokoriHpHyouji, gameStatus));
			this.tasks.add(new Task.WaitTask(Task.WaitTask.FAST));
			this.tasks.add(new Task.FunctionTask(debugClear, null));
			this.tasks.add(new Task.WaitTask(Task.WaitTask.FAST));
			this.tasks.add(new Task.FunctionTask(debug, 'start'));
		}

		public do(): void {
			Task.TaskCtrl.do(this);

			this.tasks.do();

			Task.TaskCtrl.wait(this.tasks, this.finish);
		}

		public asap(): void {
			Task.TaskCtrl.asap(this);

			this.tasks.asap();
		}

		public finish = (): void => {
			Task.TaskCtrl.finish(this);

			this.gameStatus.gameMode = new KougekiJunjoHandanMode(this.gameStatus);
		}
	}

	class ActionSetTask implements Task.Task {
		public readonly name: string = 'ActionSetTask';
		public mode: Task.ModeType = Task.TaskCtrl.DEFAULT_MODE;

		private actionList: Array<Action>;
		private tasks = new Task.Tasks();

		constructor(gameStatus: GameStatus) {
			for (let i = 0, len: number = gameStatus.players.length; i < len; i++) {
				let player: Player = gameStatus.players[i];
				this.setActionBox(player);
			}
		}

		private setActionBox(player: Player) {
			for (let attackDefense = 1; attackDefense <= 2; attackDefense++) {
				let actionBoxList: Array<HTMLDivElement>;
				if (attackDefense == 1) {
					this.actionList = player.character.attackPalette;
					actionBoxList = player.attackBoxList;
				} else {
					this.actionList = player.character.defensePalette;
					actionBoxList = player.defenseBoxList;
				}

				for (let i = 0; i < 6; i++) {
					let box = actionBoxList[i];
					let action: Action = this.actionList[i];

					this.tasks.add(new Task.FunctionTask(() => { this.setBox(box, action); }, null));
					this.tasks.add(new Task.WaitTask(Task.WaitTask.FAST));
				}
			}
		}

		public setBox(box: HTMLDivElement, action: Action) {
			box.innerHTML = action.name;
		}

		public do() {
			Task.TaskCtrl.do(this);

			this.tasks.do();

			Task.TaskCtrl.wait(this.tasks, (): void => { this.finish(); });
		}

		public asap() {
			Task.TaskCtrl.asap(this);
			this.tasks.asap();
		}

		public finish(): void {
			Task.TaskCtrl.finish(this);
		}
	}

	export class SaikoroTask implements Task.Task {
		public name: string = 'SaikoroTask';
		public mode: Task.ModeType = Task.TaskCtrl.DEFAULT_MODE;

		private callback: Function;
		private rollingFunc: Function;
		private rollingCount = 0;
		private rollingMaxCount = 200;
		private me = -1;

		constructor(callback: Function, rollingFunc?: Function) {
			this.callback = callback;
			if (rollingFunc != undefined) {
				this.rollingFunc = rollingFunc;
			} else {
				this.rollingFunc = (): void => { }; // null object model
			}
		}

		public do(): void {
			Task.TaskCtrl.do(this);
			this.rollingCount = 0;
			this.rolling();
		}

		public rolling() {
			if (this.mode != 'running' && this.mode != 'asap') {
				return;
			}

			this.me = saikoro();

			if (this.rollingFunc != null) {
				window.setTimeout((): void => { this.rollingFunc(this.me); });
			}

			this.rollingCount++;

			if (this.mode == 'asap' || this.rollingMaxCount <= this.rollingCount) {
				this.finish();
				return;
			} else {
				window.setTimeout((): void => { this.rolling(); }, 50);
			}
		}

		public static saikoroHTML(me: number): string {
			return [
				'　　　<br>　<span style="color:red">●</span>　<br>　　　<br>',
				'●　　<br>　　　<br>　　●<br>',
				'●　　<br>　●　<br>　　●<br>',
				'●　●<br>　　　<br>●　●<br>',
				'●　●<br>　●　<br>●　●<br>',
				'●　●<br>●　●<br>●　●<br>'
			][me];
		}

		public asap(): void {
			Task.TaskCtrl.asap(this);

			this.rolling();
		}

		public finish(): void {
			Task.TaskCtrl.finish(this);

			this.callback(this.me);
		}
	}

	// 攻撃順序判断
	class KougekiJunjoHandanMode implements GameMode {
		public readonly name: string = 'KougekiJunjoHandanMode';
		public mode: Task.ModeType = Task.TaskCtrl.DEFAULT_MODE;

		public gameStatus: GameStatus;

		private tasks: Task.Tasks = new Task.Tasks();

		constructor(gameStatus: GameStatus) {
			this.gameStatus = gameStatus;

			this.orderEntry();
		}

		private orderEntry(){
			for (let i = 0, len = this.gameStatus.players.length; i < len; i++) {
				((playerIdx: number): void => {
					this.tasks.add(new SaikoroTask(
						(me: number): void => { this.callback(playerIdx, me); },
						(me: number): void => { this.rollingFunc(playerIdx, me); }
					));
				})(i);
			}

		}
		private callback = (playerIdx: number, me: number) => {
			this.gameStatus.players[playerIdx].saikoroMe = me;
		}

		private rollingFunc = (playerIdx: number, me: number) => {
			this.gameStatus.players[playerIdx].saikoroElement.innerHTML = SaikoroTask.saikoroHTML(me);
		}

		public do(): void {
			Task.TaskCtrl.do(this);

			window.setTimeout(() => {
				let tasks: Task.Tasks = new Task.Tasks();
				tasks.add(new Task.FunctionTask(debugClear, null));
				for (let i = 0, len = this.gameStatus.players.length; i < len; i++) {
					tasks.add(new Task.FunctionTask(actionSelectReset, this.gameStatus.players[i]));
				}
				tasks.add(new Task.FunctionTask(debug, '攻撃順判定'));
				tasks.do();
			});

			this.tasks.parallel();

			Task.TaskCtrl.parallelWait(this.tasks, (): void => { this.check(); });
		}

		public asap(): void {
			Task.TaskCtrl.asap(this);

			this.tasks.asap();
		}

		public wait(taskArray: Array<Task.Task>, callback: Function): void {
			let finish: boolean = true;
			for (let i = 0, len: number = taskArray.length; i < len; i++) {
				if (taskArray[i].mode != 'finish') {
					finish = false;
					break;
				}
			}
			if (finish) {
				callback();
				return;
			}

			window.setTimeout((): void => { this.wait(taskArray, callback); }, 100);
		}

		private check = (): void => {
			let tasks: Task.Tasks = new Task.Tasks();

			let saikoroP0: number = this.gameStatus.players[0].saikoroMe;
			let saikoroP1: number = this.gameStatus.players[1].saikoroMe;

			tasks.add(new Task.FunctionTask(debug, '[' + (saikoroP0 + 1) + '] : [' + (saikoroP1 + 1) + ']'));

			if (saikoroP0 == saikoroP1) {
				tasks.do();

				// もう一回
				this.mode = Task.TaskCtrl.DEFAULT_MODE;
				this.orderEntry();
				return;
			}

			if (saikoroP0 < saikoroP1) {
				this.gameStatus.attacker = this.gameStatus.players[1];
				this.gameStatus.defender = this.gameStatus.players[0];
			} else {
				this.gameStatus.attacker = this.gameStatus.players[0];
				this.gameStatus.defender = this.gameStatus.players[1];
			}

			tasks.add(new Task.FunctionTask(debug, this.gameStatus.attacker.character.name + 'の攻撃から'));
			tasks.do();

			this.gameStatus.omoteUra = 'OMOTE';

			this.finish();
		}

		public finish = (): void => {
			Task.TaskCtrl.finish(this);

			this.gameStatus.gameMode = new Attack1GameMode(this.gameStatus);
		}
	}

	class Attack1GameMode implements GameMode {
		public readonly name: string = 'Attack1GameMode';
		public mode: Task.ModeType = Task.TaskCtrl.DEFAULT_MODE;

		public gameStatus: GameStatus;

		private tasks = new Task.Tasks();

		constructor(gameStatus: GameStatus) {
			this.gameStatus = gameStatus;

			this.tasks.add(new Task.FunctionTask(debugClear, null));
			this.tasks.add(new Task.FunctionTask(actionSelectReset, gameStatus.attacker));
			this.tasks.add(new Task.FunctionTask(actionSelectReset, gameStatus.defender));
			this.tasks.add(new Task.FunctionTask(debug, this.gameStatus.attacker.character.name + 'の攻撃'));
			this.tasks.add(new SaikoroTask(this.callback, this.rollingFunc));
		}

		private callback = (me: number) => {
			this.gameStatus.attacker.saikoroMe = me;
		}

		private rollingFunc = (me: number) => {
			this.gameStatus.attacker.saikoroElement.innerHTML = SaikoroTask.saikoroHTML(me);
		}

		public do(): void {
			Task.TaskCtrl.do(this);

			this.tasks.do();

			Task.TaskCtrl.wait(this.tasks, this.finish);
		}

		public asap(): void {
			Task.TaskCtrl.asap(this);

			this.tasks.asap();
		}

		public finish = (): void => {
			Task.TaskCtrl.finish(this);

			this.gameStatus.gameMode = new Attack2GameMode(this.gameStatus);
			this.gameStatus.gameMode.do();
		}
	}

	class Attack2GameMode implements GameMode {
		public readonly name: string = 'Attack2GameMode';
		public mode: Task.ModeType = Task.TaskCtrl.DEFAULT_MODE;

		public gameStatus: GameStatus;

		private tasks = new Task.Tasks();

		constructor(gameStatus: GameStatus) {
			this.gameStatus = gameStatus;

			let attackMe = this.gameStatus.attacker.saikoroMe;
			let attackAction: AttackAction = this.gameStatus.attacker.character.attackPalette[attackMe];

			this.tasks.add(new Task.FunctionTask(debug, 'さいころの目 → [' + String(attackMe + 1) + ']' + attackAction.name));
			this.tasks.add(new Task.FunctionTask(actionSelect, { actionBoxList: this.gameStatus.attacker.attackBoxList, me: attackMe, className: 'selected_attack' }));

			this.tasks.add(new Task.FunctionTask(debug, this.gameStatus.defender.character.name + 'の防御'));
			this.tasks.add(new SaikoroTask(this.callback, this.rollingFunc));
		}

		public do(): void {
			Task.TaskCtrl.do(this);

			this.tasks.do();

			Task.TaskCtrl.wait(this.tasks, this.finish);
		}

		private callback = (me: number) => {
			this.gameStatus.defender.saikoroMe = me;
		}

		private rollingFunc = (me: number) => {
			this.gameStatus.defender.saikoroElement.innerHTML = SaikoroTask.saikoroHTML(me);
		}

		public asap(): void {
			Task.TaskCtrl.asap(this);

			this.tasks.asap();
		}

		public finish = (): void => {
			Task.TaskCtrl.finish(this);
			this.gameStatus.gameMode = new Attack3GameMode(this.gameStatus);
			this.gameStatus.gameMode.do();
		}
	}

	class Attack3GameMode implements GameMode {
		public readonly name: string = 'Attack3GameMode';
		public mode: Task.ModeType = Task.TaskCtrl.DEFAULT_MODE;

		public gameStatus: GameStatus;

		private tasks = new Task.Tasks();

		constructor(gameStatus: GameStatus) {
			this.gameStatus = gameStatus;

			let attackMe: number = this.gameStatus.attacker.saikoroMe;
			let attackAction: AttackAction = this.gameStatus.attacker.character.attackPalette[attackMe];

			let defenseMe: number = this.gameStatus.defender.saikoroMe;
			let defenseAction: DefenseAction = this.gameStatus.defender.character.defensePalette[defenseMe];

			this.tasks.add(new Task.FunctionTask(debug, 'さいころの目 → [' + String(defenseMe + 1) + ']' + defenseAction.name));
			this.tasks.add(new Task.FunctionTask(actionSelect, { actionBoxList: this.gameStatus.defender.defenseBoxList, me: defenseMe, className: 'selected_defense' }));

			this.tasks.add(new Task.WaitTask(Task.WaitTask.NORMAL));

			let damage: number = 0;
			if (!defenseAction.through) {
				damage = attackAction.power - defenseAction.power;
				if (damage < 0) {
					damage = 0;
				}
				this.tasks.add(new Task.FunctionTask(debug, this.gameStatus.defender.character.name + 'は ' + damage + 'ポイントのダメージを喰らった'));
				this.tasks.add(new Task.WaitTask(Task.WaitTask.NORMAL));
			}

			this.gameStatus.defender.hitPoint = this.gameStatus.defender.hitPoint - damage;
			if (this.gameStatus.defender.hitPoint <= 0) {
				this.gameStatus.defender.hitPoint = 0;
			}

			this.tasks.add(new Task.FunctionTask(nokoriHpHyouji, gameStatus));
			this.tasks.add(new Task.WaitTask(Task.WaitTask.NORMAL));

			if (this.gameStatus.defender.hitPoint <= 0) {
				this.tasks.add(new Task.FunctionTask(debug, this.gameStatus.defender.character.name + 'は、倒れた'));
				this.tasks.add(new Task.WaitTask(Task.WaitTask.NORMAL));
			}
		}

		public do(): void {
			Task.TaskCtrl.do(this);

			this.tasks.do();

			Task.TaskCtrl.wait(this.tasks, this.finish);
		}

		public asap(): void {
			Task.TaskCtrl.asap(this);

			this.tasks.asap();
		}

		public finish = (): void => {
			Task.TaskCtrl.finish(this);

			if (0 < this.gameStatus.defender.hitPoint) {
				if (this.gameStatus.omoteUra == 'OMOTE') {
					this.gameStatus.omoteUra = 'URA';
					let swap: Player = this.gameStatus.attacker;
					this.gameStatus.attacker = this.gameStatus.defender;
					this.gameStatus.defender = swap;

					this.gameStatus.gameMode = new Attack1GameMode(this.gameStatus);
				} else {
					this.gameStatus.gameMode = new KougekiJunjoHandanMode(this.gameStatus);
				}
			} else {
				this.gameStatus.gameMode = new InitGameMode(this.gameStatus);
			}
		}
	}

	function nokoriHpHyouji(gameStatus: GameStatus): void {
		for (let i = 0, len: number = gameStatus.players.length; i < len; i++) {
			let player: Player = gameStatus.players[i];
			player.hitPointElement.textContent = String(player.hitPoint);
		}
	}

	function actionSelect(param: any) {
		let actionBoxList: Array<HTMLDivElement> = param.actionBoxList;
		let me: number = param.me;
		let className = param.className;

		for (let i = 0; i < 6; i++) {
			let box = actionBoxList[i];

			if (i == me) {
				box.classList.add(className);
			}
		}
	}

	function actionSelectReset(player: Player) {
		for (let attackDefense = 1; attackDefense <= 2; attackDefense++) {
			let actionBoxList: Array<HTMLDivElement>;
			if (attackDefense == 1) {
				actionBoxList = player.attackBoxList;
			} else {
				actionBoxList = player.defenseBoxList;
			}
			for (let i = 0; i < 6; i++) {
				let box = actionBoxList[i];

				box.classList.remove('selected_attack');
				box.classList.remove('selected_defense');
			}
		}
	}
}
