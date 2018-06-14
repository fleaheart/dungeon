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

    interface ActionItem {
        type: string;
        name: string;
        detail: string;
        power: number;
    }

    class AttackItem implements ActionItem {
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

        public clone(): AttackItem {
            let item = new AttackItem(this.name, this.detail, this.power);

            return item;
        }
    }

    let punch = new AttackItem('パンチ', '', 20);
    let kick = new AttackItem('キック', '', 30);
    let goshouha = new AttackItem('張り手', '', 40);

    class DefenseItem implements ActionItem {
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

        public clone(): DefenseItem {
            let item = new DefenseItem(this.name, this.detail, this.power);
            item.through = this.through;
            item.nigashiPoint = this.nigashiPoint;

            return item;
        }
    }

    let futsu = new DefenseItem('普通に喰らう', '', 0);
    let guard1 = new DefenseItem('ちょっとガード', '', 5);
    let guard2 = new DefenseItem('だいぶガード', '', 10);
    let yokei1 = new DefenseItem('余計に喰らう', '', -5);
    let yokei2 = new DefenseItem('かなり喰らう', '', -10);
    let kawasu = new DefenseItem('完全にかわす', '', 0);
    kawasu.through = true;

    class Charactor {
        type: string;

        name: string;
        hitPoint: number;

        attackPalette: Array<AttackItem>;
        defensePalette: Array<DefenseItem>;

        constructor(type: string, name: string) {
            this.type = type;
            this.name = name;
            this.hitPoint = 0;

            this.attackPalette = new Array<AttackItem>();
            this.defensePalette = new Array<DefenseItem>();
        }

        setAttackPalette = (palette: Array<AttackItem>) => {
            this.attackPalette.length = 0;
            for (let i = 0, l: number = palette.length; i < l; i++) {
                this.attackPalette.push(palette[i].clone());
            }
        }

        setDefensePalette = (palette: Array<DefenseItem>) => {
            this.defensePalette.length = 0;
            for (let i = 0, l: number = palette.length; i < l; i++) {
                this.defensePalette.push(palette[i].clone());
            }
        }
    }

    // メンバー変数
    let _mode: number = 0;

    let defaultAttackPalette: Array<AttackItem> = [punch, punch, kick, kick, goshouha, goshouha];
    let defaultDefensePalette: Array<DefenseItem> = [futsu, guard1, guard2, yokei1, yokei2, kawasu];

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
                tasks.push(new Task(nokoriHpHyouji, null, 100));
                tasks.push(new Task(debugClear, null, 100));
                tasks.push(new Task(debug, 'start', 200));
                _mode = 1;
                break;
            }

            if (_mode == 1) {
                attackDefence(tasks, plyerobj, enemyobj);
                if (enemyobj.hitPoint <= 0) {
                    tasks.push(new Task(debug, 'win', 700));
                    _mode = 0;
                } else {
                    _mode = 2;
                }
                break;
            }

            if (_mode == 2) {
                attackDefence(tasks, enemyobj, plyerobj);
                if (plyerobj.hitPoint <= 0) {
                    tasks.push(new Task(debug, 'loose', 700));
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

        tasks.push(new Task(debugClear, null, 100));

        let attackMe: number = saikoro();
        let attackItem: AttackItem = attacker.attackPalette[attackMe];

        tasks.push(new Task(debug, attacker.name + 'の攻撃: さいころの目 → [' + String(attackMe + 1) + ']' + attackItem.name, 300));

        let defenderMe: number = saikoro();
        let defenderItem: DefenseItem = defender.defensePalette[defenderMe];

        tasks.push(new Task(debug, defender.name + 'の防御:[' + String(defenderMe + 1) + ']' + defenderItem.name, 300));

        let damage: number = 0;
        if (!defenderItem.through) {
            damage = attackItem.power - defenderItem.power;
            if (damage < 0) {
                damage = 0;
            }
            tasks.push(new Task(debug, defender.name + 'は ' + damage + 'ポイントのダメージを喰らった', 300));
        }

        defender.hitPoint = defender.hitPoint - damage;
        if (defender.hitPoint <= 0) {
            defender.hitPoint = 0;
        }

        tasks.push(new Task(nokoriHpHyouji, null, 300));

        if (defender.hitPoint <= 0) {
            tasks.push(new Task(debug, defender.name + 'は、倒れた', 300));
        }
    }

    class Task {
        public func: Function;
        public param: any;
        public wait: number;

        constructor(func: Function, param: any, wait: number) {
            this.func = func;
            this.param = param;
            this.wait = wait;
        }
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

            this.timer = window.setTimeout(() => { this.doTask(); }, wait);
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
