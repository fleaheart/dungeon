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
        type: string;
        name: string;
        detail: string;
        power: number;
    }

    class AttackAction implements Action {
        type: string;
        name: string;
        detail: string;
        power: number;

        constructor(name: string, detail: string, power: number) {
            this.type = 'attack';
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
        type: string;
        name: string;
        detail: string;
        power: number;
        through: boolean = false;
        nigashiPoint: number = 0;

        constructor(name: string, detail: string, power: number) {
            this.type = 'defense';
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

    let _doTasks: DoTasks;
    function susumeruGame() {

        let tasks = new Array<Task>();

        while (true) {
            if (_mode == 0) {
                plyerobj.hitPoint = 100;
                enemyobj.hitPoint = 100;

                tasks = new Array<Task>();
                tasks.push(new Task(nokoriHpHyouji, null, Wait.Short));
                tasks.push(new Task(debugClear, null, Wait.Short));
                tasks.push(new Task(debug, 'start', Wait.Normal));
                _mode = 1;
                break;
            }

            if (_mode == 1) {
                attackDefence(tasks, plyerobj, enemyobj);
                if (enemyobj.hitPoint <= 0) {
                    tasks.push(new Task(debug, 'win', Wait.Slow));
                    _mode = 0;
                } else {
                    _mode = 2;
                }
                break;
            }

            if (_mode == 2) {
                attackDefence(tasks, enemyobj, plyerobj);
                if (plyerobj.hitPoint <= 0) {
                    tasks.push(new Task(debug, 'loose', Wait.Slow));
                    _mode = 0;
                } else {
                    _mode = 1;
                }
                break;
            }

            // 無限ループになるので絶対
            break;
        }

        _doTasks = new DoTasks(tasks);
        _doTasks.start();
    }

    function nokoriHpHyouji(): void {
        _playerHPElm.textContent = String(plyerobj.hitPoint);
        _enemyhpElm.textContent = String(enemyobj.hitPoint);
    }

    function attackDefence(tasks: Array<Task>, attacker: Charactor, defender: Charactor): void {

        tasks.push(new Task(debugClear, null, Wait.Short));

        let attackMe: number = saikoro();
        let attackAction: AttackAction = attacker.attackPalette[attackMe];

        tasks.push(new Task(debug, attacker.name + 'の攻撃: さいころの目 → [' + String(attackMe + 1) + ']' + attackAction.name, Wait.Normal));

        let defenderMe: number = saikoro();
        let defenderAction: DefenseAction = defender.defensePalette[defenderMe];

        tasks.push(new Task(debug, defender.name + 'の防御:[' + String(defenderMe + 1) + ']' + defenderAction.name, Wait.Normal));

        let damage: number = 0;
        if (!defenderAction.through) {
            damage = attackAction.power - defenderAction.power;
            if (damage < 0) {
                damage = 0;
            }
            tasks.push(new Task(debug, defender.name + 'は ' + damage + 'ポイントのダメージを喰らった', Wait.Normal));
        }

        defender.hitPoint = defender.hitPoint - damage;
        if (defender.hitPoint <= 0) {
            defender.hitPoint = 0;
        }

        tasks.push(new Task(nokoriHpHyouji, null, Wait.Normal));

        if (defender.hitPoint <= 0) {
            tasks.push(new Task(debug, defender.name + 'は、倒れた', Wait.Normal));
        }
    }

    class Task {
        public func: Function;
        public param: any;
        public wait: WaitValue;

        constructor(func: Function, param: any, wait: WaitValue) {
            this.func = func;
            this.param = param;
            this.wait = wait;
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

    class DoTasks {
        private tasks: Array<Task>;
        private step: number | null = null;
        private timer: number | null = null;

        constructor(tasks: Array<Task>) {
            this.tasks = tasks;
        }

        public start() {
            this.step = 0;
            this.doTask();
        }

        public doTask() {
            if (this.step == null) {
                this.destroy();
                return;
            }
            if (this.timer != null) {
                window.clearTimeout(this.timer);
            }
            if (this.tasks.length <= this.step) {
                this.destroy();
                return;
            }

            let func = this.tasks[this.step].func;
            let param = this.tasks[this.step].param;
            let wait = this.tasks[this.step].wait;

            func(param);

            this.step++;

            this.timer = window.setTimeout(() => { this.doTask(); }, wait.value);
        }

        public destroy() {
            this.step = null;
            if (this.timer != null) {
                window.clearTimeout(this.timer);
            }
            this.timer = null;
        }
    }
}
