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

    type ModeType = 'idle' | 'running' | 'finish';

    interface Task {
        mode: ModeType;
        do: Function;
        finish: Function;
    }

    class TaskCtrl {
        static readonly DEFAULT_MODE: ModeType = 'idle';

        static do(task: Task): void {
            task.mode = 'running';
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

    type WaitInterval = 0 | 100 | 300 | 700;

    const WAIT_ZERO: WaitInterval = 0;
    const WAIT_FAST: WaitInterval = 100;
    const WAIT_NORMAL: WaitInterval = 300;
    const WAIT_SLOW: WaitInterval = 700;

    class Tasks implements Task {
        public mode: ModeType = TaskCtrl.DEFAULT_MODE;
        public tasks: Array<Task> = new Array<Task>();

        private step: number = 0;

        public add(task: Task): void {
            this.tasks.push(task);
        }

        public addFunction(func: Function, param: any, millisec: WaitInterval): void {
            let task = new FunctionTask(func, param, millisec);
            this.add(task);
        }

        public do() {
            TaskCtrl.do(this);
            this.step = 0;
            this.next();
        }

        public next(): void {
            if (this.tasks.length <= this.step) {
                this.finish();
                return;
            }

            let task = this.tasks[this.step];

            task.do();

            TaskCtrl.wait(task, (): void => { this.step++; this.next(); });
        }

        public finish(): void {
            TaskCtrl.finish(this);
        }

        public destroy(): void {
            this.tasks.length = 0;
            this.step = 0;
            this.mode = TaskCtrl.DEFAULT_MODE;
        }
    }

    class FunctionTask implements Task {
        public mode: ModeType = TaskCtrl.DEFAULT_MODE;
        public func: Function;
        public param: any;
        public millisec: WaitInterval;

        constructor(func: Function, param: any, millisec: WaitInterval) {
            this.func = func;
            this.param = param;
            this.millisec = millisec;
        }

        public do(): void {
            TaskCtrl.do(this);

            this.func(this.param);

            window.setTimeout((): void => { this.finish(); }, this.millisec);
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
        tasks.destroy();

        if (_mode == 0) {
            plyerobj.hitPoint = 100;
            enemyobj.hitPoint = 100;

            let actionBoard = <HTMLDivElement>getElementById('attackActionBoard');

            tasks.add(new ActionSetTask(actionBoard, plyerobj.attackPalette));

            tasks.addFunction(nokoriHpHyouji, null, WAIT_FAST);
            tasks.addFunction(debugClear, null, WAIT_FAST);
            tasks.addFunction(debug, 'start', WAIT_SLOW);
            _mode = 1;

        } else if (_mode == 1) {
            attackDefence(tasks, plyerobj, enemyobj);
            if (enemyobj.hitPoint <= 0) {
                tasks.addFunction(debug, 'win', WAIT_SLOW);
                _mode = 0;
            } else {
                _mode = 2;
            }

        } else if (_mode == 2) {
            attackDefence(tasks, enemyobj, plyerobj);
            if (plyerobj.hitPoint <= 0) {
                tasks.addFunction(debug, 'loose', WAIT_SLOW);
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

        doTasks.addFunction(debugClear, null, WAIT_ZERO);

        let attackMe: number = saikoro();
        let attackAction: AttackAction = attacker.attackPalette[attackMe];

        doTasks.addFunction(debug, attacker.name + 'の攻撃: さいころの目 → [' + String(attackMe + 1) + ']' + attackAction.name, WAIT_NORMAL);

        let defenderMe: number = saikoro();
        let defenderAction: DefenseAction = defender.defensePalette[defenderMe];

        doTasks.addFunction(debug, defender.name + 'の防御:[' + String(defenderMe + 1) + ']' + defenderAction.name, WAIT_NORMAL);

        let damage: number = 0;
        if (!defenderAction.through) {
            damage = attackAction.power - defenderAction.power;
            if (damage < 0) {
                damage = 0;
            }
            doTasks.addFunction(debug, defender.name + 'は ' + damage + 'ポイントのダメージを喰らった', WAIT_NORMAL);
        }

        defender.hitPoint = defender.hitPoint - damage;
        if (defender.hitPoint <= 0) {
            defender.hitPoint = 0;
        }

        doTasks.addFunction(nokoriHpHyouji, null, WAIT_NORMAL);

        if (defender.hitPoint <= 0) {
            doTasks.addFunction(debug, defender.name + 'は、倒れた', WAIT_NORMAL);
        }
    }

    class ActionSetTask implements Task {
        public mode: ModeType = TaskCtrl.DEFAULT_MODE;
        constructor(private div: HTMLDivElement, private actionList: Array<Action>) { }

        public do() {
            TaskCtrl.do(this);

            let tasks = new Tasks();

            let childNodes = this.div.childNodes;
            for (let i = 0; i < 6; i++) {
                let box = <HTMLDivElement>childNodes.item(i);
                let action: Action = this.actionList[i];

                tasks.addFunction(() => {
                    this.setBox(box, action);
                }, null, WAIT_FAST);
            }

            tasks.do();

            TaskCtrl.wait(tasks, (): void => { this.finish(); });
        }

        public setBox(box: HTMLDivElement, action: Action) {
            box.innerHTML = action.name;
        }

        public finish(): void {
            TaskCtrl.finish(this);
        }
    }
}
