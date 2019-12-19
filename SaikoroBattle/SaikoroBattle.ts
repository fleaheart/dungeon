namespace SaikoroBattle {

    let _message = new Kyoutsu.Message();

    function debuglog(text: string): void {
        console.log(text);
    }

    class SaikoroBattlePlayer {
        character: Character;

        hitPoint: number = 0;

        characterBoard: HTMLElement;
        nameElement: HTMLElement;
        hitPointElement: HTMLElement;
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
            this.nameElement = document.createElement('SPAN');
            this.hitPointElement = document.createElement('SPAN');
            this.saikoroElement = document.createElement('SPAN');
            this.attackActionBoard = document.createElement('DIV');
            this.defenseActionBoard = document.createElement('DIV');
        }

        openAttackActionBoard(): void {
            this.attackActionBoard.style.display = 'flex';
        }

        closeAttackActionBoard(): void {
            this.attackActionBoard.style.display = 'none';
        }

        openDefenseActionBoard(): void {
            this.defenseActionBoard.style.display = 'flex';
        }

        closeDefenseActionBoard(): void {
            this.defenseActionBoard.style.display = 'none';
        }
    }

    export let NullCharacter = new SaikoroBattlePlayer(new Character(-1, 'NULL', 'NULL'));

    interface GameMode extends Task.Task {

    }

    class NullGameMode implements GameMode {
        readonly name: string = 'NullGameMode';
        mode: Task.ModeType = Task.DEFAULT_MODE;
        do(): void { }
        asap(): void { }
        finish(): void { }
    }

    class GameStatus {
        gameMode: GameMode = new NullGameMode();
        players: SaikoroBattlePlayer[] = [];
        operationPos: number = -1;
        attacker: SaikoroBattlePlayer = NullCharacter;
        defender: SaikoroBattlePlayer = NullCharacter;

        operationIdx = (): number => {
            for (let i = 0, len: number = this.players.length; i < len; i++) {
                let player: SaikoroBattlePlayer = this.players[i];
                if (player.operationOrder == this.operationPos) {
                    return i;
                }
            }
            return -1;
        };
    }
    let _gameStatus = new GameStatus();

    export function initMainBoard(characterList: Character[]): void {
        let mainBoard: HTMLElement = document.createElement('DIV');

        for (let i = 0, len: number = characterList.length; i < len; i++) {
            let player: SaikoroBattlePlayer = new SaikoroBattlePlayer(characterList[i]);
            _gameStatus.players.push(player);

            createActonBoard(player);

            mainBoard.appendChild(player.characterBoard);
        }

        mainBoard.style.border = '1px solid red';
        mainBoard.style.width = '462px';
        document.body.appendChild(mainBoard);

        let messageBoard: HTMLElement = document.createElement('DIV');
        messageBoard.style.border = '1px dashed black';
        messageBoard.style.width = '462px';
        messageBoard.style.height = '180px';
        messageBoard.style.overflow = 'scroll';
        document.body.appendChild(messageBoard);

        _message.set(messageBoard);

        let keyboard = new Kyoutsu.Keyboard();

        document.body.appendChild(keyboard.keyboard);

        keyboard.setKeyEvent('click', keyboardClick);
        keyboard.setKeyEvent('touch', (e: Event): void => { keyboardClick(e); e.preventDefault(); });

        keyboard.setKeytops([' ', 'w', ' ', 'a', ' ', 'd', ' ', ' ', ' ']);

        _gameStatus.gameMode = new InitGameMode(_gameStatus);
    }

    function createActonBoard(player: SaikoroBattlePlayer): void {
        player.saikoroElement.className = 'saikoro';
        player.characterBoard.appendChild(player.saikoroElement);

        player.nameElement.className = 'playerName';
        player.nameElement.textContent = player.character.name;
        player.characterBoard.appendChild(player.nameElement);

        player.characterBoard.appendChild(document.createTextNode('HP:'));
        player.hitPointElement.className = 'hitPoint';
        player.characterBoard.appendChild(player.hitPointElement);

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

    function keyboardClick(e: Event) {
        let key: string = Kyoutsu.getKeytop(e.target);
        if (key == 'w') {
            susumeruGame();
        }
    }

    export function susumeruGame(): void {
        if (_gameStatus.gameMode.mode == 'running') {
            _gameStatus.gameMode.asap();
            return;

        } else if (_gameStatus.gameMode.mode == 'idle') {
            _gameStatus.gameMode.do();
        }
    }

    class InitGameMode implements GameMode {
        readonly name: string = 'InitGameMode';
        mode: Task.ModeType = Task.DEFAULT_MODE;

        gameStatus: GameStatus;

        private tasks = new Task.SequentialTasks();

        constructor(gameStatus: GameStatus) {
            this.gameStatus = gameStatus;
            this.init();
        }

        init(): void {
            for (let i = 0, len: number = this.gameStatus.players.length; i < len; i++) {
                let player: SaikoroBattlePlayer = this.gameStatus.players[i];
                player.hitPoint = player.character.hitPointMax;

                if (player.character.type == 'Player') {
                    for (let j = 0, jlen = player.character.attackPalette.length; j < jlen; j++) {
                        player.character.attackPalette[j].opened = true;
                        player.character.defensePalette[j].opened = true;
                    }
                }
            }

            this.tasks.add(new ActionSetTask(this.gameStatus.players));

            this.tasks.add(new Task.FunctionTask((): void => { nokoriHpHyouji(this.gameStatus); }));
            this.tasks.add(new Task.WaitTask(Task.WaitTask.FAST));
            this.tasks.add(new Task.FunctionTask(_message.clear));
            this.tasks.add(new Task.WaitTask(Task.WaitTask.FAST));
            this.tasks.add(new Task.FunctionTask((): void => { _message.writeLine('start'); }));
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

            this.gameStatus.gameMode = new PaletteSelectMode(this.gameStatus);
        }
    }

    class ActionSetTask implements Task.Task {
        readonly name: string = 'ActionSetTask';
        mode: Task.ModeType = Task.DEFAULT_MODE;

        private actionList: Action[] = [];
        private tasks = new Task.ParallelTasks();

        constructor(players: SaikoroBattlePlayer[]) {
            for (let i = 0, len: number = players.length; i < len; i++) {
                let player: SaikoroBattlePlayer = players[i];
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
            box.innerHTML = action.opened ? action.name : '？？？';
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
        mode: Task.ModeType = Task.DEFAULT_MODE;

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

    class PaletteSelectMode implements GameMode {
        readonly name: string = 'PaletteSelectMode';
        mode: Task.ModeType = Task.DEFAULT_MODE;

        gameStatus: GameStatus;

        constructor(gameStatus: GameStatus) {
            this.gameStatus = gameStatus;
            this.init();
        }

        init(): void {
            setTimeout((): void => { this.do(); });
        }

        do(): void {
            Task.TaskCtrl.do(this);
            this.finish();
        }

        asap(): void {
            Task.TaskCtrl.asap(this);
        }

        finish(): void {
            Task.TaskCtrl.finish(this);

            this.gameStatus.gameMode = new ActionTaishouSelectMode(this.gameStatus);
        }
    }

    class ActionTaishouSelectMode implements GameMode {
        readonly name: string = 'ActionTaishouSelectMode';
        mode: Task.ModeType = Task.DEFAULT_MODE;

        gameStatus: GameStatus;

        constructor(gameStatus: GameStatus) {
            this.gameStatus = gameStatus;
            this.init();
        }

        init(): void {
        }

        do(): void {
            Task.TaskCtrl.do(this);

            actionStateReaet(this.gameStatus.players);
            actionSelectReset(this.gameStatus.players);
            for (let i = 0, len: number = this.gameStatus.players.length; i < len; i++) {
                let player: SaikoroBattlePlayer = this.gameStatus.players[i];
                player.openAttackActionBoard();
                player.openDefenseActionBoard();
            }

            for (let i = 0, len: number = this.gameStatus.players.length; i < len; i++) {
                let player: SaikoroBattlePlayer = this.gameStatus.players[i];

                let targetIdx = -1;
                if (0 < player.hitPoint) {
                    while (true) {
                        targetIdx = integerRandom(len);
                        let targetPlayer: SaikoroBattlePlayer = this.gameStatus.players[targetIdx];

                        if (0 < targetPlayer.hitPoint) {
                            if (player.character.type == 'Player') {
                                if (targetPlayer.character.type == 'Enemy') {
                                    break;
                                }
                            } else if (player.character.type == 'Enemy') {
                                if (targetPlayer.character.type == 'Player') {
                                    break;
                                }
                            }
                        }
                    }
                }
                player.targetIdx = targetIdx;
            }

            this.finish();
        }

        asap(): void {
            Task.TaskCtrl.asap(this);
        }

        finish(): void {
            Task.TaskCtrl.finish(this);

            this.gameStatus.gameMode = new KougekiJunjoHandanMode(this.gameStatus);
        }
    }

    // 攻撃順序判断
    class KougekiJunjoHandanMode implements GameMode {
        readonly name: string = 'KougekiJunjoHandanMode';
        mode: Task.ModeType = Task.DEFAULT_MODE;

        gameStatus: GameStatus;

        private tasks: Task.ParallelTasks = new Task.ParallelTasks();

        private order: number[] = [];
        private orderEntryList: { entry: boolean, me: number; }[] = [];

        constructor(gameStatus: GameStatus) {
            this.gameStatus = gameStatus;
            this.init();
        }

        init(): void {
            actionStateReaet(this.gameStatus.players);

            this.order.length = 0;
            this.orderEntryList.length = 0;
            for (let i = 0, len = this.gameStatus.players.length; i < len; i++) {
                this.gameStatus.players[i].operationOrder = -1;
                let entry: boolean = 0 < this.gameStatus.players[i].hitPoint;
                this.orderEntryList.push({ entry: entry, me: -1 });
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

        private callback(playerIdx: number, me: number): void {
            this.gameStatus.players[playerIdx].saikoroMe = me;
        }

        private rollingFunc(playerIdx: number, me: number): void {
            this.gameStatus.players[playerIdx].saikoroElement.innerHTML = SaikoroTask.saikoroHTML(me);
        }

        do(): void {
            Task.TaskCtrl.do(this);

            window.setTimeout((): void => {
                let tasks: Task.ParallelTasks = new Task.ParallelTasks();
                tasks.add(new Task.FunctionTask(_message.clear));
                tasks.add(new Task.FunctionTask((): void => { actionSelectReset(this.gameStatus.players); }));
                tasks.add(new Task.FunctionTask((): void => { _message.writeLine('攻撃順判定'); }));
                tasks.do();
            });

            this.tasks.do();

            Task.TaskCtrl.wait(this.tasks, (): void => { this.check(); });
        }

        asap(): void {
            Task.TaskCtrl.asap(this);

            this.tasks.asap();
        }

        private check(): void {
            let existsKaburi: boolean = false;
            let meList: { playerIdx: number, me: number, kaburi: boolean; }[] = [];
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
                debuglog(i + ' idx:' + meList[i].playerIdx + ' me:' + meList[i].me + ':' + meList[i].kaburi);
                if (meList[i].kaburi) {
                    this.orderEntryList[meList[i].playerIdx].entry = true;
                } else {
                    this.orderEntryList[meList[i].playerIdx].entry = false;
                    this.order.push(meList[i].playerIdx);
                }
            }

            if (existsKaburi) {
                this.mode = Task.DEFAULT_MODE;
                this.orderEntry();
                return;
            }

            this.finish();
        }

        finish(): void {
            Task.TaskCtrl.finish(this);

            for (let i = 0, len: number = this.order.length; i < len; i++) {
                let playerIdx = this.order[i];
                this.gameStatus.players[playerIdx].operationOrder = i;
                debuglog(String(playerIdx) + ' ' + String(this.gameStatus.players[playerIdx].operationOrder)
                    + ' -> ' + String(this.gameStatus.players[playerIdx].targetIdx));
            }

            this.gameStatus.operationPos = 0;
            this.gameStatus.gameMode = new Attack1GameMode(this.gameStatus);
        }
    }

    class Attack1GameMode implements GameMode {
        readonly name: string = 'Attack1GameMode';
        mode: Task.ModeType = Task.DEFAULT_MODE;

        gameStatus: GameStatus;

        private tasks = new Task.SequentialTasks();

        constructor(gameStatus: GameStatus) {
            this.gameStatus = gameStatus;
            this.init();
        }

        init(): void {
            let attackerIdx: number = this.gameStatus.operationIdx();
            if (attackerIdx == -1) {
                throw 'no stack';
            }

            this.gameStatus.attacker = this.gameStatus.players[attackerIdx];

            let targetIdx: number = this.gameStatus.attacker.targetIdx;
            this.gameStatus.defender = this.gameStatus.players[targetIdx];

            this.tasks.add(new Task.FunctionTask(_message.clear));
            this.tasks.add(new Task.FunctionTask((): void => { actionStateReaet(this.gameStatus.players); }));
            this.tasks.add(new Task.FunctionTask((): void => { actionSelectReset(this.gameStatus.players); }));
            if (this.gameStatus.attacker.hitPoint <= 0) {
                this.tasks.add(new Task.FunctionTask((): void => { _message.writeLine(this.gameStatus.attacker.character.name + 'は倒れている。'); }));
            } else {
                this.tasks.add(new Task.FunctionTask((): void => { attackPlayer(this.gameStatus.attacker); }));
                this.tasks.add(new Task.FunctionTask((): void => { _message.writeLine(this.gameStatus.attacker.character.name + 'の攻撃'); }));
                this.tasks.add(new Task.FunctionTask((): void => { this.gameStatus.attacker.openAttackActionBoard(); }));
                this.tasks.add(new SaikoroTask(
                    (me: number): void => { this.callback(me); },
                    (me: number): void => { this.rollingFunc(me); }
                ));
            }
        }

        private callback(me: number): void {
            this.gameStatus.attacker.saikoroMe = me;
        }

        private rollingFunc(me: number): void {
            this.gameStatus.attacker.saikoroElement.innerHTML = SaikoroTask.saikoroHTML(me);
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

            if (this.gameStatus.attacker.hitPoint <= 0) {
                this.gameStatus.operationPos++;
                if (0 <= this.gameStatus.operationIdx()) {
                    this.gameStatus.gameMode = new Attack1GameMode(this.gameStatus);
                } else {
                    this.gameStatus.gameMode = new ActionTaishouSelectMode(this.gameStatus);
                }
            } else {
                this.gameStatus.gameMode = new Attack2GameMode(this.gameStatus);
                this.gameStatus.gameMode.do();
            }
        }
    }

    class Attack2GameMode implements GameMode {
        readonly name: string = 'Attack2GameMode';
        mode: Task.ModeType = Task.DEFAULT_MODE;

        gameStatus: GameStatus;

        private tasks = new Task.SequentialTasks();

        constructor(gameStatus: GameStatus) {
            this.gameStatus = gameStatus;
            this.init();
        }

        init(): void {
            this.tasks.add(new Task.FunctionTask((): void => { defenderPlayer(this.gameStatus.defender); }));
            if (this.gameStatus.defender.hitPoint <= 0) {
                this.tasks.add(new Task.FunctionTask((): void => { _message.writeLine(this.gameStatus.defender.character.name + 'は倒れている。'); }));
                return;
            }

            let attackMe: number = this.gameStatus.attacker.saikoroMe;
            let attackAction: AttackAction = this.gameStatus.attacker.character.attackPalette[attackMe];
            attackAction.opened = true;

            this.tasks.add(new Task.FunctionTask((): void => { _message.writeLine('さいころの目 → [' + String(attackMe + 1) + ']' + attackAction.name); }));

            this.tasks.add(new Task.FunctionTask((): void => { actionSelect(this.gameStatus.attacker.attackBoxList, attackMe, 'selected_attack', attackAction); }));
            this.tasks.add(new Task.FunctionTask((): void => { _message.writeLine(this.gameStatus.defender.character.name + 'の防御'); }));
            this.tasks.add(new Task.FunctionTask((): void => { this.gameStatus.defender.openDefenseActionBoard(); }));
            this.tasks.add(new SaikoroTask(
                (me: number): void => { this.callback(me); },
                (me: number): void => { this.rollingFunc(me); }
            ));
        }

        do(): void {
            Task.TaskCtrl.do(this);

            this.tasks.do();

            Task.TaskCtrl.wait(this.tasks, (): void => { this.finish(); });
        }

        private callback(me: number): void {
            this.gameStatus.defender.saikoroMe = me;
        }

        private rollingFunc(me: number): void {
            this.gameStatus.defender.saikoroElement.innerHTML = SaikoroTask.saikoroHTML(me);
        }

        asap(): void {
            Task.TaskCtrl.asap(this);

            this.tasks.asap();
        }

        finish(): void {
            Task.TaskCtrl.finish(this);

            if (this.gameStatus.defender.hitPoint <= 0) {
                this.gameStatus.operationPos++;
                if (0 <= this.gameStatus.operationIdx()) {
                    this.gameStatus.gameMode = new Attack1GameMode(this.gameStatus);
                } else {
                    this.gameStatus.gameMode = new ActionTaishouSelectMode(this.gameStatus);
                }
            } else {
                this.gameStatus.gameMode = new Attack3GameMode(this.gameStatus);
                this.gameStatus.gameMode.do();
            }
        }
    }

    class Attack3GameMode implements GameMode {
        readonly name: string = 'Attack3GameMode';
        mode: Task.ModeType = Task.DEFAULT_MODE;

        gameStatus: GameStatus;

        private tasks = new Task.SequentialTasks();

        constructor(gameStatus: GameStatus) {
            this.gameStatus = gameStatus;
            this.init();
        }

        init(): void {
            let attackMe: number = this.gameStatus.attacker.saikoroMe;
            let attackAction: AttackAction = this.gameStatus.attacker.character.attackPalette[attackMe];

            let defenseMe: number = this.gameStatus.defender.saikoroMe;
            let defenseAction: DefenseAction = this.gameStatus.defender.character.defensePalette[defenseMe];
            defenseAction.opened = true;

            this.tasks.add(new Task.FunctionTask((): void => { _message.writeLine('さいころの目 → [' + String(defenseMe + 1) + ']' + defenseAction.name); }));

            this.tasks.add(new Task.FunctionTask((): void => { actionSelect(this.gameStatus.defender.defenseBoxList, defenseMe, 'selected_defense', defenseAction); }));

            this.tasks.add(new Task.WaitTask(Task.WaitTask.NORMAL));

            let damage: number = 0;
            if (!defenseAction.through) {
                damage = attackAction.power - defenseAction.power;
                if (damage < 0) {
                    damage = 0;
                }
                this.tasks.add(new Task.FunctionTask((): void => { _message.writeLine(this.gameStatus.defender.character.name + 'は ' + damage + 'ポイントのダメージを喰らった'); }));
                this.tasks.add(new Task.WaitTask(Task.WaitTask.NORMAL));
            }

            this.gameStatus.defender.hitPoint = this.gameStatus.defender.hitPoint - damage;
            if (this.gameStatus.defender.hitPoint <= 0) {
                this.gameStatus.defender.hitPoint = 0;
            }

            this.tasks.add(new Task.FunctionTask((): void => { nokoriHpHyouji(this.gameStatus); }));
            this.tasks.add(new Task.WaitTask(Task.WaitTask.NORMAL));

            if (this.gameStatus.defender.hitPoint <= 0) {
                this.tasks.add(new Task.FunctionTask((): void => { _message.writeLine(this.gameStatus.defender.character.name + 'は、倒れた'); }));
                this.tasks.add(new Task.WaitTask(Task.WaitTask.NORMAL));
            }
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

            this.gameStatus.attacker = NullCharacter;
            this.gameStatus.defender = NullCharacter;

            // 生存者確認
            let playerAliveCount: number = 0;
            let enemyAliveCount: number = 0;
            for (let i = 0, len = this.gameStatus.players.length; i < len; i++) {
                let player: SaikoroBattlePlayer = this.gameStatus.players[i];
                if (0 < player.hitPoint) {
                    if (player.character.type == 'Player') {
                        playerAliveCount++;
                    } else {
                        enemyAliveCount++;
                    }
                }
            }

            if (playerAliveCount <= 0) {
                this.gameStatus.gameMode = new InitGameMode(this.gameStatus);
            } else if (enemyAliveCount <= 0) {
                this.gameStatus.gameMode = new InitGameMode(this.gameStatus);
            } else {
                this.gameStatus.operationPos++;
                if (0 <= this.gameStatus.operationIdx()) {
                    this.gameStatus.gameMode = new Attack1GameMode(this.gameStatus);
                } else {
                    this.gameStatus.gameMode = new ActionTaishouSelectMode(this.gameStatus);
                }
            }
        }
    }

    function nokoriHpHyouji(gameStatus: GameStatus): void {
        for (let i = 0, len: number = gameStatus.players.length; i < len; i++) {
            let player: SaikoroBattlePlayer = gameStatus.players[i];
            player.hitPointElement.textContent = String(player.hitPoint);
        }
    }

    function attackPlayer(sbp: SaikoroBattlePlayer): void {
        sbp.characterBoard.classList.add('attacker');
    }

    function defenderPlayer(sbp: SaikoroBattlePlayer): void {
        sbp.characterBoard.classList.add('defender');
    }

    function actionStateReaet(players: SaikoroBattlePlayer[]): void {
        let clearStatuses: string[] = ['attacker', 'defender'];
        for (let i = 0, len: number = players.length; i < len; i++) {
            let player: SaikoroBattlePlayer = players[i];
            for (let j = 0, jlen = clearStatuses.length; j < jlen; j++) {
                let className = clearStatuses[j];
                player.characterBoard.classList.remove(className);
            }
        }
    }

    function actionSelect(actionBoxList: HTMLElement[], me: number, className: string, action: Action): void {
        for (let i = 0; i < 6; i++) {
            let box: HTMLElement = actionBoxList[i];

            if (i == me) {
                box.classList.add(className);
                box.textContent = action.name;
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
            player.closeAttackActionBoard();
            player.closeDefenseActionBoard();
        }
    }
}
