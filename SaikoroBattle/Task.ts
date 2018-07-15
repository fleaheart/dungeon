namespace Task {

    export type ModeType = 'idle' | 'running' | 'asap' | 'finish';

    export interface Task {
        name: string;
        mode: ModeType;
        do: Function;
        asap: Function;
        finish: Function;
    }

    export class TaskCtrl {
        static readonly DEFAULT_MODE: ModeType = 'idle';
        static debugBoard: HTMLDivElement | null = null;

        static do(task: Task): void {
            task.mode = 'running';
        }

        static asap(task: Task): void {
            task.mode = 'asap';
        }

        static finish(task: Task): void {
            task.mode = 'finish';
        }

        static wait(task: Task, callback: Function): void {
            if (task.mode == 'finish') {
                callback();
                return;
            }
            window.setTimeout((): void => { TaskCtrl.wait(task, callback); }, 100);
        }

        static debug(task: Task, text: string): void {
            if (this.debugBoard == null) {
                return;
            }
            let dbg: HTMLDivElement = this.debugBoard;
            let h = dbg.innerHTML;
            h += '[' + task.name + ']' + text + '<br>';
            dbg.innerHTML = h;
        }
    }

    export class Tasks implements Task {
        public readonly name: string = 'Tasks';
        public mode: ModeType = TaskCtrl.DEFAULT_MODE;
        public tasks: Array<Task> = new Array<Task>();

        private step: number = -1;

        public add(task: Task): void {
            this.tasks.push(task);
        }

        public do(): void {
            TaskCtrl.do(this);
            this.step = -1;
            this.next();
        }

        public next(): void {
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

        public asap() {
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

        public finish(): void {
            TaskCtrl.finish(this);
            this.tasks.length = 0;
            this.step = -1;
        }
    }

    export class FunctionTask implements Task {
        public readonly name: string = 'FunctionTask';
        public mode: ModeType = TaskCtrl.DEFAULT_MODE;
        public func: Function;
        public param: any;

        constructor(func: Function, param: any) {
            this.func = func;
            this.param = param;
        }

        public do(): void {
            TaskCtrl.do(this);

            this.func(this.param);

            this.finish();
        }

        public asap() {
            TaskCtrl.asap(this);
            this.do();
        }

        public finish(): void {
            TaskCtrl.finish(this);
        }
    }

    export type WaitInterval = 0 | 100 | 300 | 700;

    export class WaitTask implements Task {
        public readonly name: string = 'WaitTask';

        static FAST: WaitInterval = 100;
        static NORMAL: WaitInterval = 300;
        static SLOW: WaitInterval = 700;

        public mode: ModeType = TaskCtrl.DEFAULT_MODE;
        public millisec: WaitInterval;

        constructor(millisec: WaitInterval) {
            this.millisec = millisec;
        }

        public do(): void {
            TaskCtrl.do(this);
            window.setTimeout((): void => { this.finish(); }, this.millisec);
        }

        public asap() {
            TaskCtrl.asap(this);
        }

        public finish(): void {
            TaskCtrl.finish(this);
        }
    }

}
