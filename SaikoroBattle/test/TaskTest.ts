namespace TaskTest {

	function getElementById(elementId: string): HTMLElement {
		let elm: HTMLElement | null = document.getElementById(elementId);
		if (elm == null) {
			throw elementId + ' is not found.';
		}
		return elm;
	}

	export function dbg(text: string) {
		let dbg = getElementById('debugBoard2');
		let h = dbg.innerHTML;
		h += '&nbsp;&nbsp;&nbsp;&nbsp;' + text + '<br>';
		dbg.innerHTML = h;
	}

	export function init() {
		getElementById('btn').addEventListener('click', susumeruGame);
		getElementById('btn2').addEventListener('click', susumeruGame2);

	}

	class GameStatus {
		public count: number = 0;
		public gameMode: GameMode | null = null;
		public me: number = -1;
		public players: Array<any> = [-1, -1, -1, -1, -1, -1, -1];
	}

	let _gameStatus = new GameStatus();

	interface GameMode extends Task.Task {
		gameStatus: GameStatus;
	}

	class IdleGameMode implements GameMode {
		public readonly name: string = 'IdleGameMode';
		public mode: Task.ModeType = Task.TaskCtrl.DEFAULT_MODE;

		public gameStatus: GameStatus = new GameStatus();

		public do() {
			Task.TaskCtrl.do(this);
		}

		public asap() {
			Task.TaskCtrl.asap(this);
		}

		public finish() {
			Task.TaskCtrl.finish(this);
		}

	}

	class InitGameMode implements GameMode {
		public readonly name: string = 'InitGameMode';
		public mode: Task.ModeType = Task.TaskCtrl.DEFAULT_MODE;

		public gameStatus: GameStatus;

		private tasks = new Task.Tasks();

		constructor(gameStatus: GameStatus) {
			this.gameStatus = gameStatus;

			this.tasks.add(new Task.FunctionTask(dbg, 'init 1'));
			this.tasks.add(new Task.WaitTask(Task.WaitTask.SLOW));
			this.tasks.add(new Task.FunctionTask(dbg, 'init 2'));
			this.tasks.add(new Task.WaitTask(Task.WaitTask.SLOW));
			this.tasks.add(new NaibuTasks());
			this.tasks.add(new Task.FunctionTask(dbg, 'init 3'));
			this.tasks.add(new Task.WaitTask(Task.WaitTask.SLOW));
		}

		public do(): void {
			Task.TaskCtrl.do(this);

			this.tasks.do();

			this.gameStatus.count += 1;

			Task.TaskCtrl.wait(this.tasks, this.finish);
		}

		public asap(): void {
			Task.TaskCtrl.asap(this);

			this.gameStatus.count += 2;

			this.tasks.asap();
		}

		public finish = (): void => {
			Task.TaskCtrl.finish(this);

			this.gameStatus.count += 4;

			this.gameStatus.gameMode = new SaikoroFurumadeGameMode(this.gameStatus);
		}

	}

	class SaikoroFurumadeGameMode implements GameMode {
		public readonly name: string = 'SaikoroFurumadeGameMode';
		public mode: Task.ModeType = Task.TaskCtrl.DEFAULT_MODE;

		public gameStatus: GameStatus;

		private tasks = new Task.Tasks();

		constructor(gameStatus: GameStatus) {
			this.gameStatus = gameStatus;

			this.tasks.add(new Task.FunctionTask(dbg, 'saikoromae'));
			this.tasks.add(new SaikoroBattle.SaikoroTask(this.callback, this.rollingFunc));
		}

		private callback = (me: number) => {
			let result = <HTMLSpanElement>getElementById('result');
			result.innerHTML = String(me);
			dbg('saikoro:' + me);

			this.gameStatus.me = me;
		}

		private rollingFunc(me: number) {
			let result = <HTMLSpanElement>getElementById('rolling');
			result.innerHTML = String(me);
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
			this.gameStatus.gameMode = new HanteiGameMode(this.gameStatus);
		}

	}

	class HanteiGameMode implements GameMode {
		public readonly name: string = 'HanteiGameMode';
		public mode: Task.ModeType = Task.TaskCtrl.DEFAULT_MODE;

		public gameStatus: GameStatus;

		private tasks = new Task.Tasks();

		constructor(gameStatus: GameStatus) {
			this.gameStatus = gameStatus;

			let me = gameStatus.me;

			this.tasks.add(new Task.FunctionTask(dbg, 'uketotta me:' + me));
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
			this.gameStatus.gameMode = null;
		}

	}

	class NaibuTasks implements Task.Task {
		public readonly name: string = 'NaibuTasks';
		public mode: Task.ModeType = Task.TaskCtrl.DEFAULT_MODE;

		private tasks = new Task.Tasks();

		constructor() {
			this.tasks.add(new Task.FunctionTask(dbg, 'naibu 1'));
			this.tasks.add(new Task.WaitTask(Task.WaitTask.SLOW));
			this.tasks.add(new Task.FunctionTask(dbg, 'naibu 2'));
			this.tasks.add(new Task.WaitTask(Task.WaitTask.SLOW));
			this.tasks.add(new Task.FunctionTask(dbg, 'naibu 3'));
			this.tasks.add(new Task.WaitTask(Task.WaitTask.SLOW));
		}

		public do() {
			Task.TaskCtrl.do(this);

			this.tasks.do();

			Task.TaskCtrl.wait(this.tasks, this.finish);
		}

		public asap() {
			Task.TaskCtrl.asap(this);

			this.tasks.asap();
		}

		public finish = () => {
			Task.TaskCtrl.finish(this);

		}
	}

	function susumeruGame() {
		if (_gameStatus.gameMode == null) {
			_gameStatus.gameMode = new IdleGameMode();
		}
		dbg('susumeruGame :' + _gameStatus.gameMode.name);

		if (_gameStatus.gameMode instanceof IdleGameMode) {
			_gameStatus.gameMode = new InitGameMode(_gameStatus);
		}

		if (_gameStatus.gameMode.mode == 'running') {
			_gameStatus.gameMode.asap();
			return;
		} else if (_gameStatus.gameMode.mode == 'idle') {
			_gameStatus.gameMode.do();
		}
	}

	class KougekiJunjoHandanMode implements GameMode {
		public readonly name: string = 'KougekiJunjoHandanMode';
		public mode: Task.ModeType = Task.TaskCtrl.DEFAULT_MODE;

		public gameStatus: GameStatus;

		private tasks = new Task.ParallelTasks();

		private orderEntryList: Array<{ entry: boolean, me: number }> = new Array();
		private order: Array<number> = new Array<number>();

		constructor(gameStatus: GameStatus) {
			this.gameStatus = gameStatus;

			this.order.length = 0;
			this.orderEntryList.length = 0;
			for (let i = 0, len = this.gameStatus.players.length; i < len; i++) {
				this.orderEntryList.push({ entry: true, me: -1 });
			}

			this.orderEntry();
		}

		private orderEntry() {
			this.tasks.tasks.length = 0;
			for (let i = 0, len = this.gameStatus.players.length; i < len; i++) {
				if (this.orderEntryList[i].entry) {
					((playerIdx: number): void => {
						this.tasks.add(new SaikoroBattle.SaikoroTask(
							(me: number): void => { this.callback(playerIdx, me); },
							(me: number): void => { this.rollingFunc(playerIdx, me); }
						));
					})(i);
				}
			}
		}

		private callback = (playerIdx: number, me: number) => {
			this.orderEntryList[playerIdx].me = me;
		}

		private rollingFunc = (playerIdx: number, me: number) => {
			let elm = getElementById('s' + String(playerIdx));
			elm.textContent = String(me);
		}

		public do(): void {
			Task.TaskCtrl.do(this);
			this.tasks.do();
			Task.TaskCtrl.parallelWait(this.tasks, (): void => { this.check(); });
		}

		public asap(): void {
			Task.TaskCtrl.asap(this);

			this.tasks.asap();
		}

		private check = (): void => {
			dbg('check');

			let existsKaburi: boolean = false;
			let meList: Array<{ playerIdx: number, me: number, kaburi: boolean }> = new Array();
			for (let i = 0, len: number = this.gameStatus.players.length; i < len; i++) {
				if (this.orderEntryList[i].entry) {
					let me = this.orderEntryList[i].me
					let kaburi = ((me: number): boolean => {
						let kaburi = false;
						for (let i = 0, len: number = meList.length; i < len; i++) {
							if (this.orderEntryList[meList[i].playerIdx].entry) {
								if (meList[i].me == me) {
									kaburi = true;
									meList[i].kaburi = true;
								}
							}
						}
						return kaburi;
					})(me);
					meList.push({ playerIdx: i, me: me, kaburi: kaburi });
					if (kaburi) {
						existsKaburi = true;
					}
				}
			}

			meList.sort((m1, m2): number => {
				if (m1.kaburi && !m2.kaburi) {
					return 1;
				}
				if (!m1.kaburi && m2.kaburi) {
					return -1;
				}
				if (m1.me == m2.me) {
					return 0;
				}
				return m1.me < m2.me ? 1 : -1;
			});

			for (let i = 0, len: number = meList.length; i < len; i++) {
				dbg(i + ' idx:' + meList[i].playerIdx + ' me:' + meList[i].me + ':' + meList[i].kaburi);

				if (meList[i].kaburi) {
					this.orderEntryList[meList[i].playerIdx].entry = true;
				} else {
					this.orderEntryList[meList[i].playerIdx].entry = false;
					this.order.push(meList[i].playerIdx);
				}
			}

			let orderText = '';
			for (let i = 0, len: number = this.order.length; i < len; i++) {
				orderText += ' -> ' + String(this.order[i]);
			}
			dbg(orderText);

			if (existsKaburi) {
				this.mode = Task.TaskCtrl.DEFAULT_MODE;
				this.orderEntry();
				return;
			}

			this.finish();
		}

		public finish = (): void => {
			Task.TaskCtrl.finish(this);

			dbg('finish');
		}
	}

	function susumeruGame2() {
		if (_gameStatus.gameMode == null) {
			_gameStatus.gameMode = new IdleGameMode();
		}
		dbg('susumeruGame1 :' + _gameStatus.gameMode.name + ' (' + _gameStatus.gameMode.mode + ')');

		if (_gameStatus.gameMode instanceof IdleGameMode) {
			_gameStatus.gameMode = new KougekiJunjoHandanMode(_gameStatus);
		}
		dbg('susumeruGame2 :' + _gameStatus.gameMode.name + ' (' + _gameStatus.gameMode.mode + ')');

		if (_gameStatus.gameMode.mode == 'running') {
			_gameStatus.gameMode.asap();
			dbg('susumeruGame3a :' + _gameStatus.gameMode.name + ' (' + _gameStatus.gameMode.mode + ')');
			return;
		} else if (_gameStatus.gameMode.mode == 'idle') {
			_gameStatus.gameMode.do();
			dbg('susumeruGame3b :' + _gameStatus.gameMode.name + ' (' + _gameStatus.gameMode.mode + ')');
		}
	}
}