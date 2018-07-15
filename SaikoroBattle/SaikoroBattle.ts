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

    export function init(): void {
        _debugBoard = <HTMLDivElement>getElementById('debugBoard');

        _playerHPElm = <HTMLSpanElement>getElementById('playerHP');
        _enemyhpElm = <HTMLSpanElement>getElementById('enemyHP');

        initMainBoard();
    };

    function initMainBoard(): void {
        let mainBoard = <HTMLDivElement>getElementById('mainBoard');

        let startButton = <HTMLButtonElement>document.createElement('BUTTON');
        startButton.textContent = 'start';
        startButton.addEventListener('click', susumeruGame);
        mainBoard.appendChild(startButton);

        {
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
        {
            let actionBoard = <HTMLDivElement>document.createElement('DIV');
            actionBoard.id = 'defenseActionBoard';
            actionBoard.className = 'actionBoard';

            for (let i = 0; i < 6; i++) {
                let actionBox = <HTMLDivElement>document.createElement('DIV');
                actionBox.className = 'actionBox';
                actionBoard.appendChild(actionBox);
            }

            mainBoard.appendChild(actionBoard);
        }
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

    let tasks = new Task.Tasks();

    function susumeruGame() {
        if (tasks.mode == 'running') {
            tasks.asap();
            return;
        }

        if (_mode == 0) {
            plyerobj.hitPoint = 100;
            enemyobj.hitPoint = 100;

            {
                let actionBoard = <HTMLDivElement>getElementById('attackActionBoard');
                tasks.add(new ActionSetTask(actionBoard, plyerobj.attackPalette));
            }
            {
                let actionBoard = <HTMLDivElement>getElementById('defenseActionBoard');
                tasks.add(new ActionSetTask(actionBoard, plyerobj.defensePalette));
            }
            tasks.add(new Task.FunctionTask(nokoriHpHyouji, null));
            tasks.add(new Task.WaitTask(Task.WaitTask.FAST));
            tasks.add(new Task.FunctionTask(debugClear, null));
            tasks.add(new Task.WaitTask(Task.WaitTask.FAST));
            tasks.add(new Task.FunctionTask(debug, 'start'));
            tasks.add(new Task.WaitTask(Task.WaitTask.SLOW));
            _mode = 1;

        } else if (_mode == 1) {
            attackDefence(tasks, plyerobj, enemyobj);
            if (enemyobj.hitPoint <= 0) {
                tasks.add(new Task.FunctionTask(debug, 'win'));
                tasks.add(new Task.WaitTask(Task.WaitTask.SLOW));
                _mode = 0;
            } else {
                _mode = 2;
            }

        } else if (_mode == 2) {
            attackDefence(tasks, enemyobj, plyerobj);
            if (plyerobj.hitPoint <= 0) {
                tasks.add(new Task.FunctionTask(debug, 'loose'));
                tasks.add(new Task.WaitTask(Task.WaitTask.SLOW));
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

    function attackDefence(tasks: Task.Tasks, attacker: Charactor, defender: Charactor): void {
        let attackActionBoard = <HTMLDivElement>getElementById('attackActionBoard');
        let defenceActionBoard = <HTMLDivElement>getElementById('defenseActionBoard');

        tasks.add(new Task.FunctionTask(debugClear, null));
        tasks.add(new Task.FunctionTask(actionSelectReset, { div: attackActionBoard }));
        tasks.add(new Task.FunctionTask(actionSelectReset, { div: defenceActionBoard }));
        tasks.add(new Task.WaitTask(Task.WaitTask.FAST));

        let attackMe: number = saikoro();
        let attackAction: AttackAction = attacker.attackPalette[attackMe];

        tasks.add(new Task.FunctionTask(debug, attacker.name + 'の攻撃: さいころの目 → [' + String(attackMe + 1) + ']' + attackAction.name));
        tasks.add(new Task.FunctionTask(actionSelect, { div: attackActionBoard, me: attackMe, className: 'selected_attack' }));
        tasks.add(new Task.WaitTask(Task.WaitTask.NORMAL));

        let defenderMe: number = saikoro();
        let defenderAction: DefenseAction = defender.defensePalette[defenderMe];

        tasks.add(new Task.FunctionTask(debug, defender.name + 'の防御:[' + String(defenderMe + 1) + ']' + defenderAction.name));
        tasks.add(new Task.FunctionTask(actionSelect, { div: defenceActionBoard, me: defenderMe, className: 'selected_defense' }));

        tasks.add(new Task.WaitTask(Task.WaitTask.NORMAL));

        let damage: number = 0;
        if (!defenderAction.through) {
            damage = attackAction.power - defenderAction.power;
            if (damage < 0) {
                damage = 0;
            }
            tasks.add(new Task.FunctionTask(debug, defender.name + 'は ' + damage + 'ポイントのダメージを喰らった'));
            tasks.add(new Task.WaitTask(Task.WaitTask.NORMAL));
        }

        defender.hitPoint = defender.hitPoint - damage;
        if (defender.hitPoint <= 0) {
            defender.hitPoint = 0;
        }

        tasks.add(new Task.FunctionTask(nokoriHpHyouji, null));
        tasks.add(new Task.WaitTask(Task.WaitTask.NORMAL));

        if (defender.hitPoint <= 0) {
            tasks.add(new Task.FunctionTask(debug, defender.name + 'は、倒れた'));
            tasks.add(new Task.WaitTask(Task.WaitTask.NORMAL));
        }
    }

    class ActionSetTask implements Task.Task {
        public mode: Task.ModeType = Task.TaskCtrl.DEFAULT_MODE;
        constructor(private div: HTMLDivElement, private actionList: Array<Action>) { }

        private tasks = new Task.Tasks();

        public do() {
            Task.TaskCtrl.do(this);

            let childNodes = this.div.childNodes;
            for (let i = 0; i < 6; i++) {
                let box = <HTMLDivElement>childNodes.item(i);
                let action: Action = this.actionList[i];

                this.tasks.add(new Task.FunctionTask(() => { this.setBox(box, action); }, null));
                this.tasks.add(new Task.WaitTask(Task.WaitTask.FAST));
            }

            this.tasks.do();

            Task.TaskCtrl.wait(this.tasks, (): void => { this.finish(); });
        }

        public asap() {
            Task.TaskCtrl.asap(this);
            this.tasks.asap();
        }

        public setBox(box: HTMLDivElement, action: Action) {
            box.innerHTML = action.name;
        }

        public finish(): void {
            Task.TaskCtrl.finish(this);
        }
    }

    function actionSelect(param: any) {
        let div: HTMLDivElement = param.div;
        let me: number = param.me;
        let className = param.className;

        let childNodes = div.childNodes;
        for (let i = 0; i < 6; i++) {
            let box = <HTMLDivElement>childNodes.item(i);

            if (i == me) {
                box.classList.add(className);
            }
        }

    }

    function actionSelectReset(param: any) {
        let div: HTMLDivElement = param.div;

        let childNodes = div.childNodes;
        for (let i = 0; i < 6; i++) {
            let box = <HTMLDivElement>childNodes.item(i);

            box.classList.remove('selected_attack');
            box.classList.remove('selected_defense');
        }

    }
}
