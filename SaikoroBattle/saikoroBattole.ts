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

    let _mainBoard: HTMLDivElement;

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
        _mainBoard = <HTMLDivElement>getElementById('mainBoard');

        _playerHPElm = <HTMLSpanElement>getElementById('playerHP');
        _enemyhpElm = <HTMLSpanElement>getElementById('enemyHP');

        let startButton: HTMLButtonElement = <HTMLButtonElement>document.createElement('BUTTON');

        startButton.textContent = 'start';

        startButton.addEventListener('click', susumeruGame);

        _mainBoard.appendChild(startButton);
    });

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

    let tasks: Tasks | null = null;

    function susumeruGame() {
        if (tasks == null) {
            tasks = new Tasks();
        } else {
            tasks.destroy();
        }

        if (_mode == 0) {
            plyerobj.hitPoint = 100;
            enemyobj.hitPoint = 100;

            tasks.addFunction(nokoriHpHyouji, null, Wait.Short);
            tasks.addFunction(debugClear, null, Wait.Short);
            tasks.addFunction(debug, 'start', Wait.Slow);
            _mode = 1;

        } else if (_mode == 1) {
            attackDefence(tasks, plyerobj, enemyobj);
            if (enemyobj.hitPoint <= 0) {
                tasks.addFunction(debug, 'win', Wait.Slow);
                _mode = 0;
            } else {
                _mode = 2;
            }

        } else if (_mode == 2) {
            attackDefence(tasks, enemyobj, plyerobj);
            if (plyerobj.hitPoint <= 0) {
                tasks.addFunction(debug, 'loose', Wait.Slow);
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

        doTasks.addFunction(debugClear, null, Wait.Short);

        let attackMe: number = saikoro();
        let attackAction: AttackAction = attacker.attackPalette[attackMe];

        doTasks.addFunction(debug, attacker.name + 'の攻撃: さいころの目 → [' + String(attackMe + 1) + ']' + attackAction.name, Wait.Normal);

        let defenderMe: number = saikoro();
        let defenderAction: DefenseAction = defender.defensePalette[defenderMe];

        doTasks.addFunction(debug, defender.name + 'の防御:[' + String(defenderMe + 1) + ']' + defenderAction.name, Wait.Normal);

        let damage: number = 0;
        if (!defenderAction.through) {
            damage = attackAction.power - defenderAction.power;
            if (damage < 0) {
                damage = 0;
            }
            doTasks.addFunction(debug, defender.name + 'は ' + damage + 'ポイントのダメージを喰らった', Wait.Normal);
        }

        defender.hitPoint = defender.hitPoint - damage;
        if (defender.hitPoint <= 0) {
            defender.hitPoint = 0;
        }

        doTasks.addFunction(nokoriHpHyouji, null, Wait.Normal);

        if (defender.hitPoint <= 0) {
            doTasks.addFunction(debug, defender.name + 'は、倒れた', Wait.Normal);
        }
    }

    type ModeType = 'idle' | 'running' | 'finish';

    interface Task {
        mode: ModeType;
        do: Function;
        finish: Function;
    }

    function taskEndWait(task: Task, callback: Function): void {
        if (task.mode != 'running') {
            callback();
            return;
        }

        window.setTimeout((): void => { taskEndWait(task, callback); }, 100);
    }

    class FunctionTask implements Task {
        public mode: ModeType = 'idle';
        public func: Function;
        public param: any;
        public wait: WaitValue;

        constructor(func: Function, param: any, wait: WaitValue) {
            this.func = func;
            this.param = param;
            this.wait = wait;
        }

        public do = () => {
            this.mode = 'running';
            this.func(this.param);

            window.setTimeout((): void => { this.finish(); }, this.wait.value);
        }

        public finish = (): void => {
            this.mode = 'finish';
        }
    }

    class WaitValue {
        public value: number = 0;
        constructor(value: number) {
            this.value = value;
        }
    }

    class Wait {
        public static Zero = new WaitValue(0);
        public static Short = new WaitValue(100);
        public static Normal = new WaitValue(300);
        public static Slow = new WaitValue(700);
    }

    class Tasks implements Task {
        public mode: ModeType = 'idle';
        public tasks: Array<Task> = new Array<Task>();

        private step: number = 0;

        public add(task: Task): void {
            this.tasks.push(task);
        }

        public addFunction(func: Function, param: any, wait: WaitValue): void {
            let task = new FunctionTask(func, param, wait);
            this.add(task);
        }

        public do() {
            this.mode = 'running';
            this.step = 0;
            this.next();
        }

        public next(): void {
            if (this.tasks.length < this.step) {
                this.finish();
                return;
            }

            let task = this.tasks[this.step];

            task.do();

            taskEndWait(task, (): void => { this.step++; this.next(); });
        }

        public finish(): void {
            this.mode = 'finish';
        }

        public destroy(): void {
            this.tasks.length = 0;
            this.mode = 'idle';
        }
    }

}
