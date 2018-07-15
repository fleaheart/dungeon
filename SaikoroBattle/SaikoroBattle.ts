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

            let actionSaikoro = <HTMLDivElement>document.createElement('DIV');
            actionSaikoro.className = 'saikoro';
            actionBoard.appendChild(actionSaikoro);

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

            let actionSaikoro = <HTMLDivElement>document.createElement('DIV');
            actionSaikoro.className = 'saikoro';
            actionBoard.appendChild(actionSaikoro);

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

    let yokei2 = new DefenseAction('かなり喰らう', '', -10);
    let yokei1 = new DefenseAction('余計に喰らう', '', -5);
    let futsu = new DefenseAction('普通に喰らう', '', 0);
    let guard1 = new DefenseAction('ちょっとガード', '', 5);
    let guard2 = new DefenseAction('だいぶガード', '', 10);
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

    let NullCharactor = new Charactor('NULL', 'NULL');

    // メンバー変数
    let defaultAttackPalette: Array<AttackAction> = [punch, punch, kick, kick, goshouha, goshouha];
    let defaultDefensePalette: Array<DefenseAction> = [yokei2, yokei1, futsu, guard1, guard2, kawasu];

    let plyerobj = new Charactor('main', 'player');
    plyerobj.setAttackPalette(defaultAttackPalette);
    plyerobj.setDefensePalette(defaultDefensePalette);

    let enemyobj = new Charactor('enemy', '敵');
    enemyobj.setAttackPalette(defaultAttackPalette);
    enemyobj.setDefensePalette(defaultDefensePalette);

    interface GameMode extends Task.Task {
        gameStatus: GameStatus;
    }

    class GameStatus {
        public gameMode: GameMode | null = null;
        public attacker: Charactor = NullCharactor;
        public defender: Charactor = NullCharactor;
        public attackMe: number;
        public defenseMe: number = -1;
    }

    let _gameStatus = new GameStatus();

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

            plyerobj.hitPoint = 100;
            enemyobj.hitPoint = 100;

            {
                let actionBoard = <HTMLDivElement>getElementById('attackActionBoard');
                this.tasks.add(new ActionSetTask(actionBoard, plyerobj.attackPalette));
            }
            {
                let actionBoard = <HTMLDivElement>getElementById('defenseActionBoard');
                this.tasks.add(new ActionSetTask(actionBoard, plyerobj.defensePalette));
            }
            this.tasks.add(new Task.FunctionTask(nokoriHpHyouji, null));
            this.tasks.add(new Task.WaitTask(Task.WaitTask.FAST));
            this.tasks.add(new Task.FunctionTask(debugClear, null));
            this.tasks.add(new Task.WaitTask(Task.WaitTask.FAST));
            this.tasks.add(new Task.FunctionTask(debug, 'start'));
            this.tasks.add(new Task.WaitTask(Task.WaitTask.SLOW));
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

            this.gameStatus.attacker = plyerobj;
            this.gameStatus.defender = enemyobj;
            this.gameStatus.gameMode = new Attack1GameMode(this.gameStatus);
        }
    }

    class SaikoroTask implements Task.Task {
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

    class Attack1GameMode implements GameMode {
        public readonly name: string = 'Attack1GameMode';
        public mode: Task.ModeType = Task.TaskCtrl.DEFAULT_MODE;

        public gameStatus: GameStatus;

        private tasks = new Task.Tasks();

        constructor(gameStatus: GameStatus) {
            this.gameStatus = gameStatus;

            let attackActionBoard = <HTMLDivElement>getElementById('attackActionBoard');
            let defenseActionBoard = <HTMLDivElement>getElementById('defenseActionBoard');

            this.tasks.add(new Task.FunctionTask(debugClear, null));
            this.tasks.add(new Task.FunctionTask(actionSelectReset, { div: attackActionBoard }));
            this.tasks.add(new Task.FunctionTask(actionSelectReset, { div: defenseActionBoard }));
            this.tasks.add(new Task.FunctionTask(debug, this.gameStatus.attacker.name + 'の攻撃'));
            this.tasks.add(new SaikoroTask(this.callback, this.rollingFunc));
        }

        private callback = (me: number) => {
            this.gameStatus.attackMe = me;
        }

        private rollingFunc(me: number) {
            let div = <HTMLDivElement>getElementById('attackActionBoard');
            let box = <HTMLDivElement>div.childNodes.item(6);

            box.innerHTML = SaikoroTask.saikoroHTML(me);
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
        public readonly name: string = 'Attack1GameMode';
        public mode: Task.ModeType = Task.TaskCtrl.DEFAULT_MODE;

        public gameStatus: GameStatus;

        private tasks = new Task.Tasks();

        constructor(gameStatus: GameStatus) {
            this.gameStatus = gameStatus;

            let attackActionBoard = <HTMLDivElement>getElementById('attackActionBoard');

            let attackMe = this.gameStatus.attackMe;
            let attackAction: AttackAction = this.gameStatus.attacker.attackPalette[attackMe];

            this.tasks.add(new Task.FunctionTask(debug, 'さいころの目 → [' + String(attackMe + 1) + ']' + attackAction.name));
            this.tasks.add(new Task.FunctionTask(actionSelect, { div: attackActionBoard, me: attackMe, className: 'selected_attack' }));

            this.tasks.add(new Task.FunctionTask(debug, this.gameStatus.defender.name + 'の防御'));
            this.tasks.add(new SaikoroTask(this.callback, this.rollingFunc));
        }

        public do(): void {
            Task.TaskCtrl.do(this);

            this.tasks.do();

            Task.TaskCtrl.wait(this.tasks, this.finish);
        }

        private callback = (me: number) => {
            this.gameStatus.defenseMe = me;
        }

        private rollingFunc(me: number) {
            let div = <HTMLDivElement>getElementById('defenseActionBoard');
            let box = <HTMLDivElement>div.childNodes.item(6);

            box.innerHTML = SaikoroTask.saikoroHTML(me);
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
        public readonly name: string = 'Attack1GameMode';
        public mode: Task.ModeType = Task.TaskCtrl.DEFAULT_MODE;

        public gameStatus: GameStatus;

        private tasks = new Task.Tasks();

        constructor(gameStatus: GameStatus) {
            this.gameStatus = gameStatus;

            let defenseActionBoard = <HTMLDivElement>getElementById('defenseActionBoard');

            let attackMe = this.gameStatus.attackMe;
            let attackAction: AttackAction = this.gameStatus.attacker.attackPalette[attackMe];

            let defenseMe = this.gameStatus.defenseMe;
            let defenseAction: DefenseAction = this.gameStatus.defender.defensePalette[defenseMe];

            this.tasks.add(new Task.FunctionTask(debug, 'さいころの目 → [' + String(defenseMe + 1) + ']' + defenseAction.name));
            this.tasks.add(new Task.FunctionTask(actionSelect, { div: defenseActionBoard, me: defenseMe, className: 'selected_defense' }));

            this.tasks.add(new Task.WaitTask(Task.WaitTask.NORMAL));

            let damage: number = 0;
            if (!defenseAction.through) {
                damage = attackAction.power - defenseAction.power;
                if (damage < 0) {
                    damage = 0;
                }
                this.tasks.add(new Task.FunctionTask(debug, this.gameStatus.defender.name + 'は ' + damage + 'ポイントのダメージを喰らった'));
                this.tasks.add(new Task.WaitTask(Task.WaitTask.NORMAL));
            }

            this.gameStatus.defender.hitPoint = this.gameStatus.defender.hitPoint - damage;
            if (this.gameStatus.defender.hitPoint <= 0) {
                this.gameStatus.defender.hitPoint = 0;
            }

            this.tasks.add(new Task.FunctionTask(nokoriHpHyouji, null));
            this.tasks.add(new Task.WaitTask(Task.WaitTask.NORMAL));

            if (this.gameStatus.defender.hitPoint <= 0) {
                this.tasks.add(new Task.FunctionTask(debug, this.gameStatus.defender.name + 'は、倒れた'));
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
                let swap: Charactor = this.gameStatus.attacker;
                this.gameStatus.attacker = this.gameStatus.defender;
                this.gameStatus.defender = swap;
                this.gameStatus.gameMode = new Attack1GameMode(this.gameStatus);
            } else {
                this.gameStatus.gameMode = new InitGameMode(this.gameStatus);
            }
        }
    }

    function nokoriHpHyouji(): void {
        _playerHPElm.textContent = String(plyerobj.hitPoint);
        _enemyhpElm.textContent = String(enemyobj.hitPoint);
    }

    class ActionSetTask implements Task.Task {
        public readonly name: string = 'ActionSetTask';
        public mode: Task.ModeType = Task.TaskCtrl.DEFAULT_MODE;

        private div: HTMLDivElement
        private actionList: Array<Action>;
        private tasks = new Task.Tasks();

        constructor(div: HTMLDivElement, actionList: Array<Action>) {
            this.div = div;
            this.actionList = actionList;

            let childNodes = this.div.childNodes;
            for (let i = 0; i < 6; i++) {
                let box = <HTMLDivElement>childNodes.item(i);
                let action: Action = this.actionList[i];

                this.tasks.add(new Task.FunctionTask(() => { this.setBox(box, action); }, null));
                this.tasks.add(new Task.WaitTask(Task.WaitTask.FAST));
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
