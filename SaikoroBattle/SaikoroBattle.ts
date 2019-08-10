namespace SaikoroBattle {

    let _message = new Kyoutsu.Message();
    let _debug = new Kyoutsu.Message();

    class GameDeifine {
        attackActionList: AttackAction[] = [];
        defenseActionList: DefenseAction[] = [];

        playerList: Character[] = [];
        enemyList: Character[] = [];
    }
    let _gameDeifine = new GameDeifine();

    class GameStatus {
        gameMode: GameMode | undefined = undefined;
        players: SaikoroBattlePlayer[] = [];
        actionStack: number[] = [];
        attacker: SaikoroBattlePlayer = NullCharacter;
        defender: SaikoroBattlePlayer = NullCharacter;
    }
    let _gameStatus = new GameStatus();

    export function init(): void {
        _debug.set(Kyoutsu.getElementById('debugBoard'));

        initDefine();

        clearGamePlayer();
    }

    function initDefine(): void {
        let fileData: string = Kyoutsu.load('SaikoroBattle.txt');
        let lines: string[] = fileData.split(/[\r\n]+/);

        for (let i = 0, len: number = lines.length; i < len; i++) {
            let columns: string[] = lines[i].split(/\t/);

            if (columns.length < 4) {
                continue;
            }

            let id: number = Number(columns[0]);
            let type: string = columns[1];
            // let alphanumericName: string = columns[2];
            let name: string = columns[3];

            if (type == 'Attack') {
                let action = new AttackAction(id, name, Number(columns[4]));
                _gameDeifine.attackActionList.push(action);

            } else if (type == 'Defense') {
                let action = new DefenseAction(id, name, Number(columns[4]));
                if (columns[5] == 'through') {
                    action.through = true;
                }

                _gameDeifine.defenseActionList.push(action);

            } else if (type == 'Player' || type == 'Enemy') {
                let character = new Character(id, type, name);
                character.hitPointMax = Number(columns[4]);

                setDefaultActionPalette(_gameDeifine.attackActionList, columns[5], character.attackPalette);
                setDefaultActionPalette(_gameDeifine.defenseActionList, columns[6], character.defensePalette);

                if (type == 'Player') {
                    _gameDeifine.playerList.push(character);
                } else if (type == 'Enemy') {
                    _gameDeifine.enemyList.push(character);
                }
            }
        }
    }

    function setDefaultActionPalette<T extends Action>(list: T[], idText: string, palette: T[]): void {
        let ids: string[] = idText.split(',');
        if (ids.length != 6) {
            throw 'illegal palette count';
        }

        palette.length = 0;
        for (let i = 0; i < 6; i++) {
            let action: T = pickupAction(list, Number(ids[i]));
            palette.push(action);
        }
    }

    function pickupAction<T extends Action>(list: T[], id: number): T {
        for (let i = 0, len: number = list.length; i < len; i++) {
            if (list[i].id == id) {
                return <T>list[i].clone();
            }
        }
        throw 'id:' + String(id) + ' is not found';
    }

    export function initMainBoard(): void {
        let gameStatus: GameStatus = _gameStatus;

        let mainBoard: HTMLElement = document.createElement('DIV');
        mainBoard.style.border = '1px solid red';
        mainBoard.style.width = '462px';
        document.body.appendChild(mainBoard);

        let messageBoard: HTMLElement = document.createElement('DIV');
        messageBoard.style.border = '1px dashed black';
        messageBoard.style.width = '462px';
        messageBoard.style.height = '140px';
        messageBoard.style.overflow = 'scroll';
        document.body.appendChild(messageBoard);

        _message.set(messageBoard);

        let keyboard = new Kyoutsu.Keyboard();

        document.body.appendChild(keyboard.keyboard);

        keyboard.setKeyEvent('click', keyboardClick);
        keyboard.setKeyEvent('touch', (e: Event): void => { keyboardClick(e); e.preventDefault(); });

        keyboard.setKeytops([' ', 'w', ' ', 'a', ' ', 'd', ' ', ' ', ' ']);

        for (let i = 0, len: number = gameStatus.players.length; i < len; i++) {
            let player: SaikoroBattlePlayer = gameStatus.players[i];

            createActonBoard(player);

            mainBoard.appendChild(player.characterBoard);
        }
    }

    function clearGamePlayer() {
        _gameStatus.players.length = 0;
    }

    export function addPlayer(player: SaikoroBattlePlayer): void {
        _gameStatus.players.push(player);
    }

    export function searchPlayer(idx: number): SaikoroBattlePlayer {
        return new SaikoroBattlePlayer(_gameDeifine.playerList[idx]);
    }

    export function searchEnemy(idx: number): SaikoroBattlePlayer {
        return new SaikoroBattlePlayer(_gameDeifine.enemyList[idx]);
    }

    function createActonBoard(player: SaikoroBattlePlayer): void {
        {
            let span: HTMLElement = document.createElement('SPAN');
            span.textContent = player.character.name + ' HP: ';
            player.characterBoard.appendChild(span);
        }

        player.characterBoard.appendChild(player.hitPointElement);
        player.characterBoard.appendChild(player.debugElement);
        player.saikoroElement.className = 'saikoro';
        player.characterBoard.appendChild(player.saikoroElement);

        for (let attackDefense: number = 1; attackDefense <= 2; attackDefense++) {
            let actionBoard: HTMLElement;
            let actionBoxList: HTMLElement[];

            if (attackDefense == 1) {
                actionBoard = player.attackActionBoard;
                actionBoxList = player.attackBoxList;
            } else {
                actionBoard = player.defenseActionBoard;
                actionBoxList = player.defenseBoxList;
            }

            actionBoard.className = 'actionBoard';
            for (let i = 0; i < 6; i++) {
                let actionBox: HTMLElement = document.createElement('DIV');
                actionBox.className = 'actionBox';
                actionBoard.appendChild(actionBox);
                actionBoxList.push(actionBox);
            }

            player.characterBoard.appendChild(actionBoard);
        }
    }

    function integerRandom(maxValue: number): number {
        let value: number = Math.random() * maxValue;
        return Math.floor(value);
    }

    function saikoro(): number {
        return integerRandom(6);
    }

    interface GameObject {
        id: number;
        name: string;
    }

    interface Action extends GameObject {
        detail: string;
        power: number;

        clone(): Action;
    }

    class AttackAction implements Action {
        id: number;
        name: string;
        detail: string;
        power: number;

        constructor(id: number, name: string, power: number, detail?: string) {
            this.id = id;
            this.name = name;
            this.power = power;
            if (detail == undefined) {
                this.detail = '';
            } else {
                this.detail = detail;
            }
        }

        clone(): AttackAction {
            let action = new AttackAction(this.id, this.name, this.power, this.detail);

            return action;
        }
    }

    class DefenseAction implements Action {
        id: number;
        name: string;
        detail: string;
        power: number;
        through: boolean = false;
        nigashiPoint: number = 0;

        constructor(id: number, name: string, power: number, detail?: string) {
            this.id = id;
            this.name = name;
            this.power = power;
            if (detail == undefined) {
                this.detail = '';
            } else {
                this.detail = detail;
            }
        }

        clone(): DefenseAction {
            let action = new DefenseAction(this.id, this.name, this.power, this.detail);
            action.through = this.through;
            action.nigashiPoint = this.nigashiPoint;

            return action;
        }
    }

    type PlayerType = 'NULL' | 'Player' | 'Enemy';

    class Character implements GameObject {
        id: number;
        type: PlayerType;

        name: string;
        hitPointMax: number = 0;

        attackPalette: AttackAction[] = [];
        defensePalette: DefenseAction[] = [];

        constructor(id: number, type: PlayerType, name: string) {
            this.id = id;
            this.type = type;
            this.name = name;
        }

        clone(): Character {
            let character = new Character(this.id, this.type, this.name);
            character.hitPointMax = this.hitPointMax;

            cloneList(this.attackPalette, character.attackPalette);
            cloneList(this.defensePalette, character.defensePalette);

            return character;
        }
    }

    function cloneList<T extends Action>(source: T[], destination: T[]): void {
        destination.length = 0;
        for (let i = 0, len: number = source.length; i < len; i++) {
            destination.push(<T>source[i].clone());
        }
    }

    class SaikoroBattlePlayer {
        character: Character;

        hitPoint: number = 0;

        characterBoard: HTMLElement;
        hitPointElement: HTMLElement;
        debugElement: HTMLElement;
        saikoroElement: HTMLElement;
        saikoroMe: number = 1;

        attackActionBoard: HTMLElement;
        attackBoxList: HTMLElement[] = [];
        defenseActionBoard: HTMLElement;
        defenseBoxList: HTMLElement[] = [];

        operationOrder: number = -1;
        targetIdx: number = -1;

        constructor(character: Character) {
            this.character = character.clone();

            this.characterBoard = document.createElement('DIV');
            this.hitPointElement = document.createElement('SPAN');
            this.debugElement = document.createElement('SPAN');
            this.saikoroElement = document.createElement('DIV');
            this.attackActionBoard = document.createElement('DIV');
            this.defenseActionBoard = document.createElement('DIV');
        }
    }

    let NullCharacter = new SaikoroBattlePlayer(new Character(-1, 'NULL', 'NULL'));

    interface GameMode extends Task.Task {
        gameStatus: GameStatus;
    }

    function keyboardClick(e: Event) {
        let key: string = Kyoutsu.getKeytop(e.target);
        if (key == 'w') {
            susumeruGame();
        }
    }

    export function susumeruGame(): void {
        if (_gameStatus.gameMode == undefined) {
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
        readonly name: string = 'InitGameMode';
        mode: Task.ModeType = Task.TaskCtrl.DEFAULT_MODE;

        gameStatus: GameStatus;

        private tasks = new Task.SequentialTasks();

        constructor(gameStatus: GameStatus) {
            this.gameStatus = gameStatus;

            for (let i = 0, len: number = gameStatus.players.length; i < len; i++) {
                let player: SaikoroBattlePlayer = gameStatus.players[i];
                player.hitPoint = player.character.hitPointMax;
            }

            this.tasks.add(new ActionSetTask(gameStatus));

            this.tasks.add(new Task.FunctionTask((): void => { nokoriHpHyouji(gameStatus); }));
            this.tasks.add(new Task.WaitTask(Task.WaitTask.FAST));
            this.tasks.add(new Task.FunctionTask(_message.clear));
            this.tasks.add(new Task.WaitTask(Task.WaitTask.FAST));
            this.tasks.add(new Task.FunctionTask((): void => { _message.writeLine('start'); }));
        }

        do(): void {
            Task.TaskCtrl.do(this);

            this.tasks.do();

            Task.TaskCtrl.wait(this.tasks, this.finish);
        }

        asap(): void {
            Task.TaskCtrl.asap(this);

            this.tasks.asap();
        }

        finish = (): void => {
            Task.TaskCtrl.finish(this);

            this.gameStatus.gameMode = new ActionTaishouSelectMode(this.gameStatus);
        }
    }

    class ActionSetTask implements Task.Task {
        readonly name: string = 'ActionSetTask';
        mode: Task.ModeType = Task.TaskCtrl.DEFAULT_MODE;

        private actionList: Action[] = [];
        private tasks = new Task.ParallelTasks();

        constructor(gameStatus: GameStatus) {
            for (let i = 0, len: number = gameStatus.players.length; i < len; i++) {
                let player: SaikoroBattlePlayer = gameStatus.players[i];
                this.setActionBox(player);
            }
        }

        private setActionBox(player: SaikoroBattlePlayer): void {
            let tasks = new Task.SequentialTasks();
            for (let attackDefense = 1; attackDefense <= 2; attackDefense++) {
                let actionBoxList: HTMLElement[];
                if (attackDefense == 1) {
                    this.actionList = player.character.attackPalette;
                    actionBoxList = player.attackBoxList;
                } else {
                    this.actionList = player.character.defensePalette;
                    actionBoxList = player.defenseBoxList;
                }

                for (let i = 0; i < 6; i++) {
                    let box: HTMLElement = actionBoxList[i];
                    let action: Action = this.actionList[i];

                    tasks.add(new Task.FunctionTask((): void => { this.setBox(box, action); }));
                    tasks.add(new Task.WaitTask(Task.WaitTask.FAST));
                }
            }
            this.tasks.add(tasks);
        }

        setBox(box: HTMLElement, action: Action): void {
            box.innerHTML = action.name;
        }

        do(): void {
            Task.TaskCtrl.do(this);

            this.tasks.do();

            Task.TaskCtrl.wait(this.tasks, (): void => { this.finish(); });
        }

        asap(): void {
            Task.TaskCtrl.asap(this);
            this.tasks.asap();
        }

        finish(): void {
            Task.TaskCtrl.finish(this);
        }
    }

    export class SaikoroTask implements Task.Task {
        name: string = 'SaikoroTask';
        mode: Task.ModeType = Task.TaskCtrl.DEFAULT_MODE;

        private callback: (me: number) => void;
        private rollingFunc: (me: number) => void;
        private rollingCount = 0;
        private rollingMaxCount = 200;
        private me = -1;

        constructor(callback: (me: number) => void, rollingFunc?: (me: number) => void) {
            this.callback = callback;
            if (rollingFunc != undefined) {
                this.rollingFunc = rollingFunc;
            } else {
                this.rollingFunc = (): void => { }; // null object model
            }
        }

        do(): void {
            Task.TaskCtrl.do(this);
            this.rollingCount = 0;
            this.rolling();
        }

        rolling(): void {
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

        static saikoroHTML(me: number): string {
            return [
                '　　　<br>　<span style="color:red">●</span>　<br>　　　<br>',
                '●　　<br>　　　<br>　　●<br>',
                '●　　<br>　●　<br>　　●<br>',
                '●　●<br>　　　<br>●　●<br>',
                '●　●<br>　●　<br>●　●<br>',
                '●　●<br>●　●<br>●　●<br>'
            ][me];
        }

        asap(): void {
            Task.TaskCtrl.asap(this);

            this.rolling();
        }

        finish(): void {
            Task.TaskCtrl.finish(this);

            this.callback(this.me);
        }
    }

    class ActionTaishouSelectMode implements GameMode {
        readonly name: string = 'ActionTaishouSelectMode';
        mode: Task.ModeType = Task.TaskCtrl.DEFAULT_MODE;

        gameStatus: GameStatus;

        constructor(gameStatus: GameStatus) {
            this.gameStatus = gameStatus;
        }

        do = (): void => {
            Task.TaskCtrl.do(this);

            for (let i = 0, len: number = this.gameStatus.players.length; i < len; i++) {
                let player: SaikoroBattlePlayer = this.gameStatus.players[i];

                let targetIdx = -1;
                while (true) {
                    targetIdx = integerRandom(len);
                    if (player.character.type == 'Player') {
                        if (this.gameStatus.players[targetIdx].character.type == 'Enemy') {
                            break;
                        }
                    } else if (player.character.type == 'Enemy') {
                        if (this.gameStatus.players[targetIdx].character.type == 'Player') {
                            break;
                        }
                    }
                }
                player.targetIdx = targetIdx;
            }

            this.finish();
        }

        asap = (): void => {
            Task.TaskCtrl.asap(this);
        }

        finish = (): void => {
            Task.TaskCtrl.finish(this);

            this.gameStatus.gameMode = new KougekiJunjoHandanMode(this.gameStatus);
        }
    }

    // 攻撃順序判断
    class KougekiJunjoHandanMode implements GameMode {
        readonly name: string = 'KougekiJunjoHandanMode';
        mode: Task.ModeType = Task.TaskCtrl.DEFAULT_MODE;

        gameStatus: GameStatus;

        private tasks: Task.ParallelTasks = new Task.ParallelTasks();

        private order: number[] = [];
        private orderEntryList: { entry: boolean, me: number }[] = [];

        constructor(gameStatus: GameStatus) {
            this.gameStatus = gameStatus;

            this.order.length = 0;
            this.orderEntryList.length = 0;
            for (let i = 0, len = this.gameStatus.players.length; i < len; i++) {
                this.orderEntryList.push({ entry: true, me: -1 });
            }

            this.orderEntry();
        }

        private orderEntry(): void {
            this.tasks.tasks.length = 0;
            for (let i = 0, len = this.gameStatus.players.length; i < len; i++) {
                if (this.orderEntryList[i].entry) {
                    ((playerIdx: number): void => {
                        this.tasks.add(new SaikoroTask(
                            (me: number): void => { this.callback(playerIdx, me); },
                            (me: number): void => { this.rollingFunc(playerIdx, me); }
                        ));
                    })(i);
                }
            }
        }

        private callback = (playerIdx: number, me: number): void => {
            this.gameStatus.players[playerIdx].saikoroMe = me;
        }

        private rollingFunc = (playerIdx: number, me: number): void => {
            this.gameStatus.players[playerIdx].saikoroElement.innerHTML = SaikoroTask.saikoroHTML(me);
        }

        do(): void {
            Task.TaskCtrl.do(this);

            window.setTimeout((): void => {
                let tasks: Task.ParallelTasks = new Task.ParallelTasks();
                tasks.add(new Task.FunctionTask(_message.clear));
                tasks.add(new Task.FunctionTask((): void => { actionSelectReset(this.gameStatus.players) }));
                tasks.add(new Task.FunctionTask((): void => { _message.writeLine('攻撃順判定') }));
                tasks.do();
            });

            this.tasks.do();

            Task.TaskCtrl.wait(this.tasks, (): void => { this.check(); });
        }

        asap(): void {
            Task.TaskCtrl.asap(this);

            this.tasks.asap();
        }

        private check = (): void => {
            let existsKaburi: boolean = false;
            let meList: { playerIdx: number, me: number, kaburi: boolean }[] = [];
            for (let i = 0, len: number = this.gameStatus.players.length; i < len; i++) {
                if (this.orderEntryList[i].entry) {
                    let me: number = this.gameStatus.players[i].saikoroMe;
                    let kaburi: boolean = ((me: number): boolean => {
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
                _debug.writeLine(i + ' idx:' + meList[i].playerIdx + ' me:' + meList[i].me + ':' + meList[i].kaburi);
                if (meList[i].kaburi) {
                    this.orderEntryList[meList[i].playerIdx].entry = true;
                } else {
                    this.orderEntryList[meList[i].playerIdx].entry = false;
                    this.order.push(meList[i].playerIdx);
                }
            }

            if (existsKaburi) {
                this.mode = Task.TaskCtrl.DEFAULT_MODE;
                this.orderEntry();
                return;
            }

            this.finish();
        }

        finish = (): void => {
            Task.TaskCtrl.finish(this);

            this.gameStatus.actionStack.length = 0;
            for (let i = 0, len: number = this.order.length; i < len; i++) {
                let playerIdx = this.order[i];
                this.gameStatus.actionStack.push(playerIdx);
                this.gameStatus.players[playerIdx].operationOrder = i;
                // debug
                this.gameStatus.players[playerIdx].debugElement.textContent = ' ' + String(this.gameStatus.players[playerIdx].operationOrder) 
                + ' -> ' + String(this.gameStatus.players[playerIdx].targetIdx);
            }

            this.gameStatus.gameMode = new Attack1GameMode(this.gameStatus);
        }
    }

    class Attack1GameMode implements GameMode {
        readonly name: string = 'Attack1GameMode';
        mode: Task.ModeType = Task.TaskCtrl.DEFAULT_MODE;

        gameStatus: GameStatus;

        private tasks = new Task.SequentialTasks();

        constructor(gameStatus: GameStatus) {
            this.gameStatus = gameStatus;
            let attackerIdx: number | undefined = this.gameStatus.actionStack.shift();
            if (attackerIdx == undefined) {
                throw 'no stack';
            }

            gameStatus.attacker = this.gameStatus.players[attackerIdx];

            let targetIdx: number = gameStatus.attacker.targetIdx;
            gameStatus.defender = this.gameStatus.players[targetIdx];

            this.tasks.add(new Task.FunctionTask(_message.clear));
            this.tasks.add(new Task.FunctionTask((): void => { actionSelectReset(gameStatus.players); }));
            this.tasks.add(new Task.FunctionTask((): void => { _message.writeLine(this.gameStatus.attacker.character.name + 'の攻撃') }));
            this.tasks.add(new SaikoroTask(this.callback, this.rollingFunc));
        }

        private callback = (me: number): void => {
            this.gameStatus.attacker.saikoroMe = me;
        }

        private rollingFunc = (me: number): void => {
            this.gameStatus.attacker.saikoroElement.innerHTML = SaikoroTask.saikoroHTML(me);
        }

        do(): void {
            Task.TaskCtrl.do(this);

            this.tasks.do();

            Task.TaskCtrl.wait(this.tasks, this.finish);
        }

        asap(): void {
            Task.TaskCtrl.asap(this);

            this.tasks.asap();
        }

        finish = (): void => {
            Task.TaskCtrl.finish(this);

            this.gameStatus.gameMode = new Attack2GameMode(this.gameStatus);
            this.gameStatus.gameMode.do();
        }
    }

    class Attack2GameMode implements GameMode {
        readonly name: string = 'Attack2GameMode';
        mode: Task.ModeType = Task.TaskCtrl.DEFAULT_MODE;

        gameStatus: GameStatus;

        private tasks = new Task.SequentialTasks();

        constructor(gameStatus: GameStatus) {
            this.gameStatus = gameStatus;

            let attackMe: number = this.gameStatus.attacker.saikoroMe;
            let attackAction: AttackAction = this.gameStatus.attacker.character.attackPalette[attackMe];

            this.tasks.add(new Task.FunctionTask((): void => { _message.writeLine('さいころの目 → [' + String(attackMe + 1) + ']' + attackAction.name) }));
            this.tasks.add(new Task.FunctionTask((): void => { actionSelect(this.gameStatus.attacker.attackBoxList, attackMe, 'selected_attack'); }));

            this.tasks.add(new Task.FunctionTask((): void => { _message.writeLine(this.gameStatus.defender.character.name + 'の防御') }));
            this.tasks.add(new SaikoroTask(this.callback, this.rollingFunc));
        }

        do(): void {
            Task.TaskCtrl.do(this);

            this.tasks.do();

            Task.TaskCtrl.wait(this.tasks, this.finish);
        }

        private callback = (me: number): void => {
            this.gameStatus.defender.saikoroMe = me;
        }

        private rollingFunc = (me: number): void => {
            this.gameStatus.defender.saikoroElement.innerHTML = SaikoroTask.saikoroHTML(me);
        }

        asap(): void {
            Task.TaskCtrl.asap(this);

            this.tasks.asap();
        }

        finish = (): void => {
            Task.TaskCtrl.finish(this);
            this.gameStatus.gameMode = new Attack3GameMode(this.gameStatus);
            this.gameStatus.gameMode.do();
        }
    }

    class Attack3GameMode implements GameMode {
        readonly name: string = 'Attack3GameMode';
        mode: Task.ModeType = Task.TaskCtrl.DEFAULT_MODE;

        gameStatus: GameStatus;

        private tasks = new Task.SequentialTasks();

        constructor(gameStatus: GameStatus) {
            this.gameStatus = gameStatus;

            let attackMe: number = this.gameStatus.attacker.saikoroMe;
            let attackAction: AttackAction = this.gameStatus.attacker.character.attackPalette[attackMe];

            let defenseMe: number = this.gameStatus.defender.saikoroMe;
            let defenseAction: DefenseAction = this.gameStatus.defender.character.defensePalette[defenseMe];

            this.tasks.add(new Task.FunctionTask((): void => { _message.writeLine('さいころの目 → [' + String(defenseMe + 1) + ']' + defenseAction.name) }));
            this.tasks.add(new Task.FunctionTask((): void => { actionSelect(this.gameStatus.defender.defenseBoxList, defenseMe, 'selected_defense'); }));

            this.tasks.add(new Task.WaitTask(Task.WaitTask.NORMAL));

            let damage: number = 0;
            if (!defenseAction.through) {
                damage = attackAction.power - defenseAction.power;
                if (damage < 0) {
                    damage = 0;
                }
                this.tasks.add(new Task.FunctionTask((): void => { _message.writeLine(this.gameStatus.defender.character.name + 'は ' + damage + 'ポイントのダメージを喰らった') }));
                this.tasks.add(new Task.WaitTask(Task.WaitTask.NORMAL));
            }

            this.gameStatus.defender.hitPoint = this.gameStatus.defender.hitPoint - damage;
            if (this.gameStatus.defender.hitPoint <= 0) {
                this.gameStatus.defender.hitPoint = 0;
            }

            this.tasks.add(new Task.FunctionTask((): void => { nokoriHpHyouji(gameStatus); }));
            this.tasks.add(new Task.WaitTask(Task.WaitTask.NORMAL));

            if (this.gameStatus.defender.hitPoint <= 0) {
                this.tasks.add(new Task.FunctionTask((): void => { _message.writeLine(this.gameStatus.defender.character.name + 'は、倒れた') }));
                this.tasks.add(new Task.WaitTask(Task.WaitTask.NORMAL));
            }
        }

        do(): void {
            Task.TaskCtrl.do(this);

            this.tasks.do();

            Task.TaskCtrl.wait(this.tasks, this.finish);
        }

        asap(): void {
            Task.TaskCtrl.asap(this);

            this.tasks.asap();
        }

        finish = (): void => {
            Task.TaskCtrl.finish(this);

            if (0 < this.gameStatus.defender.hitPoint) {
                if (0 < this.gameStatus.actionStack.length) {
                    this.gameStatus.gameMode = new Attack1GameMode(this.gameStatus);
                } else {
                    this.gameStatus.gameMode = new KougekiJunjoHandanMode(this.gameStatus);
                }
            } else {
                this.gameStatus.gameMode = new InitGameMode(this.gameStatus);
            }
        }
    }

    function nokoriHpHyouji(gameStatus: GameStatus): void {
        for (let i = 0, len: number = gameStatus.players.length; i < len; i++) {
            let player: SaikoroBattlePlayer = gameStatus.players[i];
            player.hitPointElement.textContent = String(player.hitPoint);
        }
    }

    function actionSelect(actionBoxList: HTMLElement[], me: number, className: string): void {
        for (let i = 0; i < 6; i++) {
            let box: HTMLElement = actionBoxList[i];

            if (i == me) {
                box.classList.add(className);
            }
        }
    }

    function actionSelectReset(players: SaikoroBattlePlayer[]): void {
        for (let i = 0, len: number = players.length; i < len; i++) {
            let player: SaikoroBattlePlayer = players[i];
            for (let attackDefense = 1; attackDefense <= 2; attackDefense++) {
                let actionBoxList: HTMLElement[];
                if (attackDefense == 1) {
                    actionBoxList = player.attackBoxList;
                } else {
                    actionBoxList = player.defenseBoxList;
                }
                for (let i = 0; i < 6; i++) {
                    let box: HTMLElement = actionBoxList[i];

                    box.classList.remove('selected_attack');
                    box.classList.remove('selected_defense');
                }
            }
        }
    }
}
