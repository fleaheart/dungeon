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

    let _playerHPElm: HTMLSpanElement;
    let _enemyhpElm: HTMLSpanElement;

    function getElementById(elementId: string): HTMLElement {
        let elm: HTMLElement | null = document.getElementById(elementId);
        if (elm == null) {
            throw elementId + ' is not found.';
        }
        return elm;
    }

    window.addEventListener('load', () => {
        _debugBoard = <HTMLDivElement>getElementById('debugBoard');

        _playerHPElm = <HTMLSpanElement>getElementById('playerHP');
        _enemyhpElm = <HTMLSpanElement>getElementById('enemyHP');

        initMainBoard();
    });

    function initMainBoard(): void {
        let mainBoard = <HTMLDivElement>getElementById('mainBoard');

        let startButton = <HTMLButtonElement>document.createElement('BUTTON');
        startButton.textContent = 'start';
        startButton.addEventListener('click', susumeruGame);
        mainBoard.appendChild(startButton);

        let actionBoard = <HTMLDivElement>document.createElement('DIV');
        actionBoard.id = 'attackActionBoard';
        actionBoard.className = 'actionBoard';

        for (let i = 0; i < 6; i++) {
            let actionBox = <HTMLDivElement>document.createElement('DIV');
            actionBox.className = 'actionBox';
            actionBoard.appendChild(actionBox);
        }

        mainBoard.appendChild(actionBoard);
    }

    function integerRandom(maxValue: number): number {
        let value = Math.random() * maxValue;
        return Math.floor(value);
    }

    function saikoro(): number {
        return integerRandom(6);
    }

    interface Action {
        name: string;
        detail: string;
        power: number;
    }

    class AttackAction implements Action {
        name: string;
        detail: string;
        power: number;

        constructor(name: string, detail: string, power: number) {
            this.name = name;
            this.detail = detail;
            this.power = power;
        }

        public clone(): AttackAction {
            let action = new AttackAction(this.name, this.detail, this.power);

            return action;
        }
    }

    let punch = new AttackAction('パンチ', '', 20);
    let kick = new AttackAction('キック', '', 30);
    let goshouha = new AttackAction('張り手', '', 40);

    class DefenseAction implements Action {
        name: string;
        detail: string;
        power: number;
        through: boolean = false;
        nigashiPoint: number = 0;

        constructor(name: string, detail: string, power: number) {
            this.name = name;
            this.detail = detail;
            this.power = power;
        }

        public clone(): DefenseAction {
            let action = new DefenseAction(this.name, this.detail, this.power);
            action.through = this.through;
            action.nigashiPoint = this.nigashiPoint;

            return action;
        }
    }

    let futsu = new DefenseAction('普通に喰らう', '', 0);
    let guard1 = new DefenseAction('ちょっとガード', '', 5);
    let guard2 = new DefenseAction('だいぶガード', '', 10);
    let yokei1 = new DefenseAction('余計に喰らう', '', -5);
    let yokei2 = new DefenseAction('かなり喰らう', '', -10);
    let kawasu = new DefenseAction('完全にかわす', '', 0);
    kawasu.through = true;

    class Charactor {
        type: string;

        name: string;
        hitPoint: number;

        attackPalette: Array<AttackAction>;
        defensePalette: Array<DefenseAction>;

        constructor(type: string, name: string) {
            this.type = type;
            this.name = name;
            this.hitPoint = 0;

            this.attackPalette = new Array<AttackAction>();
            this.defensePalette = new Array<DefenseAction>();
        }

        setAttackPalette = (palette: Array<AttackAction>) => {
            this.attackPalette.length = 0;
            for (let i = 0, l: number = palette.length; i < l; i++) {
                this.attackPalette.push(palette[i].clone());
            }
        }

        setDefensePalette = (palette: Array<DefenseAction>) => {
            this.defensePalette.length = 0;
            for (let i = 0, l: number = palette.length; i < l; i++) {
                this.defensePalette.push(palette[i].clone());
            }
        }
    }

    type ModeType = 'idle' | 'running' | 'asap' | 'finish';

    interface Task {
        mode: ModeType;
        do: Function;
        asap: Function;
        finish: Function;
    }

    class TaskCtrl {
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

        static wait(task: Task, callback: Function): void {
            if (task.mode != 'running') {
                callback();
                return;
            }
            window.setTimeout((): void => { TaskCtrl.wait(task, callback); }, 100);
        }
    }

    class Tasks implements Task {
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
            window.setTimeout((): void => {
                TaskCtrl.asap(this);

                while (this.step < this.tasks.length) {
                    let task = this.tasks[this.step];
                    if (!(task instanceof WaitTask)) {
                        task.asap();
                    }
                    this.step++;
                }

                this.finish();
            });
        }

        public finish(): void {
            TaskCtrl.finish(this);
            this.tasks.length = 0;
            this.step = -1;
        }
    }

    class FunctionTask implements Task {
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

    type WaitInterval = 0 | 100 | 300 | 700;

    class WaitTask implements Task {
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

    // メンバー変数
    let _mode: number = 0;

    let defaultAttackPalette: Array<AttackAction> = [punch, punch, kick, kick, goshouha, goshouha];
    let defaultDefensePalette: Array<DefenseAction> = [futsu, guard1, guard2, yokei1, yokei2, kawasu];

    let plyerobj = new Charactor('main', 'player');
    plyerobj.setAttackPalette(defaultAttackPalette);
    plyerobj.setDefensePalette(defaultDefensePalette);

    let enemyobj = new Charactor('enemy', '敵');
    enemyobj.setAttackPalette(defaultAttackPalette);
    enemyobj.setDefensePalette(defaultDefensePalette);

    let tasks: Tasks = new Tasks();

    function susumeruGame() {
        if (tasks.mode == 'running') {
            tasks.asap();
            return;
        }

        if (_mode == 0) {
            plyerobj.hitPoint = 100;
            enemyobj.hitPoint = 100;

            let actionBoard = <HTMLDivElement>getElementById('attackActionBoard');

            tasks.add(new ActionSetTask(actionBoard, plyerobj.attackPalette));

            tasks.add(new FunctionTask(nokoriHpHyouji, null));
            tasks.add(new WaitTask(WaitTask.FAST));
            tasks.add(new FunctionTask(debugClear, null));
            tasks.add(new WaitTask(WaitTask.FAST));
            tasks.add(new FunctionTask(debug, 'start'));
            tasks.add(new WaitTask(WaitTask.SLOW));
            _mode = 1;

        } else if (_mode == 1) {
            attackDefence(tasks, plyerobj, enemyobj);
            if (enemyobj.hitPoint <= 0) {
                tasks.add(new FunctionTask(debug, 'win'));
                tasks.add(new WaitTask(WaitTask.SLOW));
                _mode = 0;
            } else {
                _mode = 2;
            }

        } else if (_mode == 2) {
            attackDefence(tasks, enemyobj, plyerobj);
            if (plyerobj.hitPoint <= 0) {
                tasks.add(new FunctionTask(debug, 'loose'));
                tasks.add(new WaitTask(WaitTask.SLOW));
                _mode = 0;
            } else {
                _mode = 1;
            }
        }

        tasks.do();
    }

    function nokoriHpHyouji(): void {
        _playerHPElm.textContent = String(plyerobj.hitPoint);
        _enemyhpElm.textContent = String(enemyobj.hitPoint);
    }

    function attackDefence(doTasks: Tasks, attacker: Charactor, defender: Charactor): void {

        doTasks.add(new FunctionTask(debugClear, null));

        let attackMe: number = saikoro();
        let attackAction: AttackAction = attacker.attackPalette[attackMe];

        doTasks.add(new FunctionTask(debug, attacker.name + 'の攻撃: さいころの目 → [' + String(attackMe + 1) + ']' + attackAction.name));
        tasks.add(new WaitTask(WaitTask.NORMAL));

        let defenderMe: number = saikoro();
        let defenderAction: DefenseAction = defender.defensePalette[defenderMe];

        doTasks.add(new FunctionTask(debug, defender.name + 'の防御:[' + String(defenderMe + 1) + ']' + defenderAction.name));
        tasks.add(new WaitTask(WaitTask.NORMAL));

        let damage: number = 0;
        if (!defenderAction.through) {
            damage = attackAction.power - defenderAction.power;
            if (damage < 0) {
                damage = 0;
            }
            doTasks.add(new FunctionTask(debug, defender.name + 'は ' + damage + 'ポイントのダメージを喰らった'));
            tasks.add(new WaitTask(WaitTask.NORMAL));
        }

        defender.hitPoint = defender.hitPoint - damage;
        if (defender.hitPoint <= 0) {
            defender.hitPoint = 0;
        }

        doTasks.add(new FunctionTask(nokoriHpHyouji, null));
        tasks.add(new WaitTask(WaitTask.NORMAL));

        if (defender.hitPoint <= 0) {
            doTasks.add(new FunctionTask(debug, defender.name + 'は、倒れた'));
            tasks.add(new WaitTask(WaitTask.NORMAL));
        }
    }

    class ActionSetTask implements Task {
        public mode: ModeType = TaskCtrl.DEFAULT_MODE;
        constructor(private div: HTMLDivElement, private actionList: Array<Action>) { }

        private tasks = new Tasks();

        public do() {
            TaskCtrl.do(this);

            let childNodes = this.div.childNodes;
            for (let i = 0; i < 6; i++) {
                let box = <HTMLDivElement>childNodes.item(i);
                let action: Action = this.actionList[i];

                this.tasks.add(new FunctionTask(() => { this.setBox(box, action); }, null));
                this.tasks.add(new WaitTask(WaitTask.FAST));
            }

            this.tasks.do();

            TaskCtrl.wait(this.tasks, (): void => { this.finish(); });
        }

        public asap() {
            TaskCtrl.asap(this);
            this.tasks.asap();
        }

        public setBox(box: HTMLDivElement, action: Action) {
            box.innerHTML = action.name;
        }

        public finish(): void {
            TaskCtrl.finish(this);
        }
    }
}
