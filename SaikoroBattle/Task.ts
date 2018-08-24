namespace Task {

	export type ModeType = 'idle' | 'running' | 'asap' | 'finish';

	export interface Task {
		name: string;
		mode: ModeType;
		do: () => void;
		asap: () => void;
		finish: () => void;
	}

	export class TaskCtrl {
		static readonly DEFAULT_MODE: ModeType = 'idle';
		static do(task: Task): void {
			task.mode = 'running';
		}

		static asap(task: Task): void {
			task.mode = 'asap';
		}

		static finish(task: Task): void {
			task.mode = 'finish';
		}

		static wait(task: Task, callback: () => void): void {
			if (task.mode == 'finish') {
				callback();
				return;
			}

			window.setTimeout((): void => { TaskCtrl.wait(task, callback); }, 100);
		}
	}

	export class SequentialTasks implements Task {
		readonly name: string = 'Tasks';
		mode: ModeType = TaskCtrl.DEFAULT_MODE;
		tasks: Array<Task> = new Array<Task>();

		private step: number = -1;

		add(task: Task): void {
			this.tasks.push(task);
		}

		do(): void {
			TaskCtrl.do(this);
			this.step = -1;
			this.next();
		}

		next(): void {
			if (this.mode != 'running') {
				return;
			}

			this.step++;
			if (this.tasks.length <= this.step) {
				this.finish();
				return;
			}

			let task = this.tasks[this.step];

			task.do();

			TaskCtrl.wait(task, (): void => { this.next(); });
		}

		asap(): void {
			if (this.step == -1) {
				this.step = 0;
			}
			while (this.step < this.tasks.length) {
				let task = this.tasks[this.step];
				if (!(task instanceof WaitTask)) {
					task.asap();
				}
				this.step++;
			}

			this.finish();
		}

		finish(): void {
			TaskCtrl.finish(this);
			this.tasks.length = 0;
			this.step = -1;
		}
	}

	export class ParallelTasks implements Task {
		readonly name: string = 'Tasks';
		mode: ModeType = TaskCtrl.DEFAULT_MODE;
		tasks: Array<Task> = new Array<Task>();

		add(task: Task): void {
			this.tasks.push(task);
		}

		do(): void {
			TaskCtrl.do(this);

			for (let i = 0, len: number = this.tasks.length; i < len; i++) {
				this.tasks[i].mode = Task.TaskCtrl.DEFAULT_MODE;
				window.setTimeout((): void => { this.tasks[i].do(); });
			}

			this.wait();
		}

		asap(): void {
			for (let i = 0, len: number = this.tasks.length; i < len; i++) {
				if (this.tasks[i].mode == 'running') {
					window.setTimeout((): void => { this.tasks[i].asap(); });
				}
			}
		}

		wait(): void {
			let finish: boolean = true;
			for (let i = 0, len: number = this.tasks.length; i < len; i++) {
				if (this.tasks[i].mode != 'finish') {
					finish = false;
					break;
				}
			}
			if (finish) {
				this.finish();
				return;
			}

			window.setTimeout((): void => { this.wait(); }, 100);
		}

		finish(): void {
			TaskCtrl.finish(this);
			this.tasks.length = 0;
		}
	}

	export class FunctionTask implements Task {
		readonly name: string = 'FunctionTask';
		mode: ModeType = TaskCtrl.DEFAULT_MODE;
		func: () => void;

		constructor(func: () => void) {
			this.func = func;
		}

		do(): void {
			TaskCtrl.do(this);

			this.func();

			this.finish();
		}

		asap(): void {
			TaskCtrl.asap(this);
			this.do();
		}

		finish(): void {
			TaskCtrl.finish(this);
		}
	}

	export type WaitInterval = 0 | 100 | 300 | 700;

	export class WaitTask implements Task {
		readonly name: string = 'WaitTask';

		static FAST: WaitInterval = 100;
		static NORMAL: WaitInterval = 300;
		static SLOW: WaitInterval = 700;

		mode: ModeType = TaskCtrl.DEFAULT_MODE;
		millisec: WaitInterval;

		constructor(millisec: WaitInterval) {
			this.millisec = millisec;
		}

		do(): void {
			TaskCtrl.do(this);
			window.setTimeout((): void => { this.finish(); }, this.millisec);
		}

		asap(): void {
			TaskCtrl.asap(this);
		}

		finish(): void {
			TaskCtrl.finish(this);
		}
	}

}
