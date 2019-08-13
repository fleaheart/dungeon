"use strict";
var SaikoroBattle;
(function (SaikoroBattle) {
    var _message = new Kyoutsu.Message();
    var SaikoroBattlePlayer = (function () {
        function SaikoroBattlePlayer(character) {
            this.hitPoint = 0;
            this.saikoroMe = 1;
            this.attackBoxList = [];
            this.defenseBoxList = [];
            this.operationOrder = -1;
            this.targetIdx = -1;
            this.character = character.clone();
            this.characterBoard = document.createElement('DIV');
            this.hitPointElement = document.createElement('SPAN');
            this.debugElement = document.createElement('SPAN');
            this.saikoroElement = document.createElement('DIV');
            this.attackActionBoard = document.createElement('DIV');
            this.defenseActionBoard = document.createElement('DIV');
        }
        SaikoroBattlePlayer.prototype.openAttackActionBoard = function () {
            this.attackActionBoard.style.display = 'flex';
        };
        SaikoroBattlePlayer.prototype.closeAttackActionBoard = function () {
            this.attackActionBoard.style.display = 'none';
        };
        SaikoroBattlePlayer.prototype.openDefenseActionBoard = function () {
            this.defenseActionBoard.style.display = 'flex';
        };
        SaikoroBattlePlayer.prototype.closeDefenseActionBoard = function () {
            this.defenseActionBoard.style.display = 'none';
        };
        return SaikoroBattlePlayer;
    }());
    SaikoroBattle.NullCharacter = new SaikoroBattlePlayer(new SaikoroBattle.Character(-1, 'NULL', 'NULL'));
    var GameStatus = (function () {
        function GameStatus() {
            var _this = this;
            this.gameMode = undefined;
            this.players = [];
            this.operationPos = -1;
            this.attacker = SaikoroBattle.NullCharacter;
            this.defender = SaikoroBattle.NullCharacter;
            this.operationIdx = function () {
                for (var i = 0, len = _this.players.length; i < len; i++) {
                    var player = _this.players[i];
                    if (player.operationOrder == _this.operationPos) {
                        return i;
                    }
                }
                return -1;
            };
        }
        return GameStatus;
    }());
    var _gameStatus = new GameStatus();
    function initMainBoard(characterList) {
        var mainBoard = document.createElement('DIV');
        for (var i = 0, len = characterList.length; i < len; i++) {
            var player = new SaikoroBattlePlayer(characterList[i]);
            _gameStatus.players.push(player);
            createActonBoard(player);
            mainBoard.appendChild(player.characterBoard);
        }
        mainBoard.style.border = '1px solid red';
        mainBoard.style.width = '462px';
        document.body.appendChild(mainBoard);
        var messageBoard = document.createElement('DIV');
        messageBoard.style.border = '1px dashed black';
        messageBoard.style.width = '462px';
        messageBoard.style.height = '180px';
        messageBoard.style.overflow = 'scroll';
        document.body.appendChild(messageBoard);
        _message.set(messageBoard);
        var keyboard = new Kyoutsu.Keyboard();
        document.body.appendChild(keyboard.keyboard);
        keyboard.setKeyEvent('click', keyboardClick);
        keyboard.setKeyEvent('touch', function (e) { keyboardClick(e); e.preventDefault(); });
        keyboard.setKeytops([' ', 'w', ' ', 'a', ' ', 'd', ' ', ' ', ' ']);
    }
    SaikoroBattle.initMainBoard = initMainBoard;
    function addPlayer(player) {
        _gameStatus.players.push(player);
    }
    SaikoroBattle.addPlayer = addPlayer;
    function createActonBoard(player) {
        {
            var span = document.createElement('SPAN');
            span.textContent = player.character.name + ' HP: ';
            player.characterBoard.appendChild(span);
        }
        player.characterBoard.appendChild(player.hitPointElement);
        player.characterBoard.appendChild(player.debugElement);
        player.saikoroElement.className = 'saikoro';
        player.characterBoard.appendChild(player.saikoroElement);
        for (var attackDefense = 1; attackDefense <= 2; attackDefense++) {
            var actionBoard = void 0;
            var actionBoxList = void 0;
            if (attackDefense == 1) {
                actionBoard = player.attackActionBoard;
                actionBoxList = player.attackBoxList;
            }
            else {
                actionBoard = player.defenseActionBoard;
                actionBoxList = player.defenseBoxList;
            }
            actionBoard.className = 'actionBoard';
            for (var i = 0; i < 6; i++) {
                var actionBox = document.createElement('DIV');
                actionBox.className = 'actionBox';
                actionBoard.appendChild(actionBox);
                actionBoxList.push(actionBox);
            }
            player.characterBoard.appendChild(actionBoard);
        }
    }
    function integerRandom(maxValue) {
        var value = Math.random() * maxValue;
        return Math.floor(value);
    }
    function saikoro() {
        return integerRandom(6);
    }
    function keyboardClick(e) {
        var key = Kyoutsu.getKeytop(e.target);
        if (key == 'w') {
            susumeruGame();
        }
    }
    function susumeruGame() {
        if (_gameStatus.gameMode == undefined) {
            _gameStatus.gameMode = new InitGameMode(_gameStatus);
        }
        if (_gameStatus.gameMode.mode == 'running') {
            _gameStatus.gameMode.asap();
            return;
        }
        else if (_gameStatus.gameMode.mode == 'idle') {
            _gameStatus.gameMode.do();
        }
    }
    SaikoroBattle.susumeruGame = susumeruGame;
    var InitGameMode = (function () {
        function InitGameMode(gameStatus) {
            this.name = 'InitGameMode';
            this.mode = Task.TaskCtrl.DEFAULT_MODE;
            this.tasks = new Task.SequentialTasks();
            this.gameStatus = gameStatus;
            for (var i = 0, len = gameStatus.players.length; i < len; i++) {
                var player = gameStatus.players[i];
                player.hitPoint = player.character.hitPointMax;
                if (player.character.type == 'Player') {
                    for (var j = 0, jlen = player.character.attackPalette.length; j < jlen; j++) {
                        player.character.attackPalette[j].opened = true;
                        player.character.defensePalette[j].opened = true;
                    }
                }
            }
            this.tasks.add(new ActionSetTask(gameStatus));
            this.tasks.add(new Task.FunctionTask(function () { nokoriHpHyouji(gameStatus); }));
            this.tasks.add(new Task.WaitTask(Task.WaitTask.FAST));
            this.tasks.add(new Task.FunctionTask(_message.clear));
            this.tasks.add(new Task.WaitTask(Task.WaitTask.FAST));
            this.tasks.add(new Task.FunctionTask(function () { _message.writeLine('start'); }));
        }
        InitGameMode.prototype.do = function () {
            var _this = this;
            Task.TaskCtrl.do(this);
            this.tasks.do();
            Task.TaskCtrl.wait(this.tasks, function () { _this.finish(); });
        };
        InitGameMode.prototype.asap = function () {
            Task.TaskCtrl.asap(this);
            this.tasks.asap();
        };
        InitGameMode.prototype.finish = function () {
            Task.TaskCtrl.finish(this);
            this.gameStatus.gameMode = new ActionTaishouSelectMode(this.gameStatus);
        };
        return InitGameMode;
    }());
    var ActionSetTask = (function () {
        function ActionSetTask(gameStatus) {
            this.name = 'ActionSetTask';
            this.mode = Task.TaskCtrl.DEFAULT_MODE;
            this.actionList = [];
            this.tasks = new Task.ParallelTasks();
            for (var i = 0, len = gameStatus.players.length; i < len; i++) {
                var player = gameStatus.players[i];
                this.setActionBox(player);
            }
        }
        ActionSetTask.prototype.setActionBox = function (player) {
            var _this = this;
            var tasks = new Task.SequentialTasks();
            for (var attackDefense = 1; attackDefense <= 2; attackDefense++) {
                var actionBoxList = void 0;
                if (attackDefense == 1) {
                    this.actionList = player.character.attackPalette;
                    actionBoxList = player.attackBoxList;
                }
                else {
                    this.actionList = player.character.defensePalette;
                    actionBoxList = player.defenseBoxList;
                }
                var _loop_1 = function (i) {
                    var box = actionBoxList[i];
                    var action = this_1.actionList[i];
                    tasks.add(new Task.FunctionTask(function () { _this.setBox(box, action); }));
                    tasks.add(new Task.WaitTask(Task.WaitTask.FAST));
                };
                var this_1 = this;
                for (var i = 0; i < 6; i++) {
                    _loop_1(i);
                }
            }
            this.tasks.add(tasks);
        };
        ActionSetTask.prototype.setBox = function (box, action) {
            box.innerHTML = action.opened ? action.name : '？？？';
        };
        ActionSetTask.prototype.do = function () {
            var _this = this;
            Task.TaskCtrl.do(this);
            this.tasks.do();
            Task.TaskCtrl.wait(this.tasks, function () { _this.finish(); });
        };
        ActionSetTask.prototype.asap = function () {
            Task.TaskCtrl.asap(this);
            this.tasks.asap();
        };
        ActionSetTask.prototype.finish = function () {
            Task.TaskCtrl.finish(this);
        };
        return ActionSetTask;
    }());
    var SaikoroTask = (function () {
        function SaikoroTask(callback, rollingFunc) {
            this.name = 'SaikoroTask';
            this.mode = Task.TaskCtrl.DEFAULT_MODE;
            this.rollingCount = 0;
            this.rollingMaxCount = 200;
            this.me = -1;
            this.callback = callback;
            if (rollingFunc != undefined) {
                this.rollingFunc = rollingFunc;
            }
            else {
                this.rollingFunc = function () { };
            }
        }
        SaikoroTask.prototype.do = function () {
            Task.TaskCtrl.do(this);
            this.rollingCount = 0;
            this.rolling();
        };
        SaikoroTask.prototype.rolling = function () {
            var _this = this;
            if (this.mode != 'running' && this.mode != 'asap') {
                return;
            }
            this.me = saikoro();
            if (this.rollingFunc != null) {
                window.setTimeout(function () { _this.rollingFunc(_this.me); });
            }
            this.rollingCount++;
            if (this.mode == 'asap' || this.rollingMaxCount <= this.rollingCount) {
                this.finish();
                return;
            }
            else {
                window.setTimeout(function () { _this.rolling(); }, 50);
            }
        };
        SaikoroTask.saikoroHTML = function (me) {
            return [
                '　　　<br>　<span style="color:red">●</span>　<br>　　　<br>',
                '●　　<br>　　　<br>　　●<br>',
                '●　　<br>　●　<br>　　●<br>',
                '●　●<br>　　　<br>●　●<br>',
                '●　●<br>　●　<br>●　●<br>',
                '●　●<br>●　●<br>●　●<br>'
            ][me];
        };
        SaikoroTask.prototype.asap = function () {
            Task.TaskCtrl.asap(this);
            this.rolling();
        };
        SaikoroTask.prototype.finish = function () {
            Task.TaskCtrl.finish(this);
            this.callback(this.me);
        };
        return SaikoroTask;
    }());
    SaikoroBattle.SaikoroTask = SaikoroTask;
    var ActionTaishouSelectMode = (function () {
        function ActionTaishouSelectMode(gameStatus) {
            this.name = 'ActionTaishouSelectMode';
            this.mode = Task.TaskCtrl.DEFAULT_MODE;
            this.gameStatus = gameStatus;
            this.init();
        }
        ActionTaishouSelectMode.prototype.init = function () {
            actionSelectReset(this.gameStatus.players);
            for (var i = 0, len = this.gameStatus.players.length; i < len; i++) {
                var player = this.gameStatus.players[i];
                player.openAttackActionBoard();
                player.openDefenseActionBoard();
            }
        };
        ActionTaishouSelectMode.prototype.do = function () {
            Task.TaskCtrl.do(this);
            for (var i = 0, len = this.gameStatus.players.length; i < len; i++) {
                var player = this.gameStatus.players[i];
                var targetIdx = -1;
                while (true) {
                    targetIdx = integerRandom(len);
                    if (player.character.type == 'Player') {
                        if (this.gameStatus.players[targetIdx].character.type == 'Enemy') {
                            break;
                        }
                    }
                    else if (player.character.type == 'Enemy') {
                        if (this.gameStatus.players[targetIdx].character.type == 'Player') {
                            break;
                        }
                    }
                }
                player.targetIdx = targetIdx;
            }
            this.finish();
        };
        ActionTaishouSelectMode.prototype.asap = function () {
            Task.TaskCtrl.asap(this);
        };
        ActionTaishouSelectMode.prototype.finish = function () {
            Task.TaskCtrl.finish(this);
            this.gameStatus.gameMode = new KougekiJunjoHandanMode(this.gameStatus);
        };
        return ActionTaishouSelectMode;
    }());
    var KougekiJunjoHandanMode = (function () {
        function KougekiJunjoHandanMode(gameStatus) {
            this.name = 'KougekiJunjoHandanMode';
            this.mode = Task.TaskCtrl.DEFAULT_MODE;
            this.tasks = new Task.ParallelTasks();
            this.order = [];
            this.orderEntryList = [];
            this.gameStatus = gameStatus;
            this.order.length = 0;
            this.orderEntryList.length = 0;
            for (var i = 0, len = this.gameStatus.players.length; i < len; i++) {
                this.orderEntryList.push({ entry: true, me: -1 });
            }
            this.orderEntry();
        }
        KougekiJunjoHandanMode.prototype.orderEntry = function () {
            var _this = this;
            this.tasks.tasks.length = 0;
            for (var i = 0, len = this.gameStatus.players.length; i < len; i++) {
                if (this.orderEntryList[i].entry) {
                    (function (playerIdx) {
                        _this.tasks.add(new SaikoroTask(function (me) { _this.callback(playerIdx, me); }, function (me) { _this.rollingFunc(playerIdx, me); }));
                    })(i);
                }
            }
        };
        KougekiJunjoHandanMode.prototype.callback = function (playerIdx, me) {
            this.gameStatus.players[playerIdx].saikoroMe = me;
        };
        KougekiJunjoHandanMode.prototype.rollingFunc = function (playerIdx, me) {
            this.gameStatus.players[playerIdx].saikoroElement.innerHTML = SaikoroTask.saikoroHTML(me);
        };
        KougekiJunjoHandanMode.prototype.do = function () {
            var _this = this;
            Task.TaskCtrl.do(this);
            window.setTimeout(function () {
                var tasks = new Task.ParallelTasks();
                tasks.add(new Task.FunctionTask(_message.clear));
                tasks.add(new Task.FunctionTask(function () { actionSelectReset(_this.gameStatus.players); }));
                tasks.add(new Task.FunctionTask(function () { _message.writeLine('攻撃順判定'); }));
                tasks.do();
            });
            this.tasks.do();
            Task.TaskCtrl.wait(this.tasks, function () { _this.check(); });
        };
        KougekiJunjoHandanMode.prototype.asap = function () {
            Task.TaskCtrl.asap(this);
            this.tasks.asap();
        };
        KougekiJunjoHandanMode.prototype.check = function () {
            var _this = this;
            var existsKaburi = false;
            var meList = [];
            for (var i = 0, len = this.gameStatus.players.length; i < len; i++) {
                if (this.orderEntryList[i].entry) {
                    var me = this.gameStatus.players[i].saikoroMe;
                    var kaburi = (function (me) {
                        var kaburi = false;
                        for (var i_1 = 0, len_1 = meList.length; i_1 < len_1; i_1++) {
                            if (_this.orderEntryList[meList[i_1].playerIdx].entry) {
                                if (meList[i_1].me == me) {
                                    kaburi = true;
                                    meList[i_1].kaburi = true;
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
            meList.sort(function (m1, m2) {
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
            for (var i = 0, len = meList.length; i < len; i++) {
                SaikoroBattle._debug.writeLine(i + ' idx:' + meList[i].playerIdx + ' me:' + meList[i].me + ':' + meList[i].kaburi);
                if (meList[i].kaburi) {
                    this.orderEntryList[meList[i].playerIdx].entry = true;
                }
                else {
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
        };
        KougekiJunjoHandanMode.prototype.finish = function () {
            Task.TaskCtrl.finish(this);
            for (var i = 0, len = this.order.length; i < len; i++) {
                var playerIdx = this.order[i];
                this.gameStatus.players[playerIdx].operationOrder = i;
                this.gameStatus.players[playerIdx].debugElement.textContent = ' ' + String(this.gameStatus.players[playerIdx].operationOrder)
                    + ' -> ' + String(this.gameStatus.players[playerIdx].targetIdx);
            }
            this.gameStatus.operationPos = 0;
            this.gameStatus.gameMode = new Attack1GameMode(this.gameStatus);
        };
        return KougekiJunjoHandanMode;
    }());
    var Attack1GameMode = (function () {
        function Attack1GameMode(gameStatus) {
            var _this = this;
            this.name = 'Attack1GameMode';
            this.mode = Task.TaskCtrl.DEFAULT_MODE;
            this.tasks = new Task.SequentialTasks();
            this.gameStatus = gameStatus;
            var attackerIdx = this.gameStatus.operationIdx();
            if (attackerIdx == -1) {
                throw 'no stack';
            }
            gameStatus.attacker = this.gameStatus.players[attackerIdx];
            var targetIdx = gameStatus.attacker.targetIdx;
            gameStatus.defender = this.gameStatus.players[targetIdx];
            this.tasks.add(new Task.FunctionTask(_message.clear));
            this.tasks.add(new Task.FunctionTask(function () { actionSelectReset(gameStatus.players); }));
            this.tasks.add(new Task.FunctionTask(function () { _message.writeLine(_this.gameStatus.attacker.character.name + 'の攻撃'); }));
            this.tasks.add(new Task.FunctionTask(function () { _this.gameStatus.attacker.openAttackActionBoard(); }));
            this.tasks.add(new SaikoroTask(function (me) { _this.callback(me); }, function (me) { _this.rollingFunc(me); }));
        }
        Attack1GameMode.prototype.callback = function (me) {
            this.gameStatus.attacker.saikoroMe = me;
        };
        Attack1GameMode.prototype.rollingFunc = function (me) {
            this.gameStatus.attacker.saikoroElement.innerHTML = SaikoroTask.saikoroHTML(me);
        };
        Attack1GameMode.prototype.do = function () {
            var _this = this;
            Task.TaskCtrl.do(this);
            this.tasks.do();
            Task.TaskCtrl.wait(this.tasks, function () { _this.finish(); });
        };
        Attack1GameMode.prototype.asap = function () {
            Task.TaskCtrl.asap(this);
            this.tasks.asap();
        };
        Attack1GameMode.prototype.finish = function () {
            Task.TaskCtrl.finish(this);
            this.gameStatus.gameMode = new Attack2GameMode(this.gameStatus);
            this.gameStatus.gameMode.do();
        };
        return Attack1GameMode;
    }());
    var Attack2GameMode = (function () {
        function Attack2GameMode(gameStatus) {
            var _this = this;
            this.name = 'Attack2GameMode';
            this.mode = Task.TaskCtrl.DEFAULT_MODE;
            this.tasks = new Task.SequentialTasks();
            this.gameStatus = gameStatus;
            var attackMe = this.gameStatus.attacker.saikoroMe;
            var attackAction = this.gameStatus.attacker.character.attackPalette[attackMe];
            attackAction.opened = true;
            this.tasks.add(new Task.FunctionTask(function () { _message.writeLine('さいころの目 → [' + String(attackMe + 1) + ']' + attackAction.name); }));
            this.tasks.add(new Task.FunctionTask(function () { actionSelect(_this.gameStatus.attacker.attackBoxList, attackMe, 'selected_attack', attackAction); }));
            this.tasks.add(new Task.FunctionTask(function () { _message.writeLine(_this.gameStatus.defender.character.name + 'の防御'); }));
            this.tasks.add(new Task.FunctionTask(function () { _this.gameStatus.defender.openDefenseActionBoard(); }));
            this.tasks.add(new SaikoroTask(function (me) { _this.callback(me); }, function (me) { _this.rollingFunc(me); }));
        }
        Attack2GameMode.prototype.do = function () {
            var _this = this;
            Task.TaskCtrl.do(this);
            this.tasks.do();
            Task.TaskCtrl.wait(this.tasks, function () { _this.finish(); });
        };
        Attack2GameMode.prototype.callback = function (me) {
            this.gameStatus.defender.saikoroMe = me;
        };
        Attack2GameMode.prototype.rollingFunc = function (me) {
            this.gameStatus.defender.saikoroElement.innerHTML = SaikoroTask.saikoroHTML(me);
        };
        Attack2GameMode.prototype.asap = function () {
            Task.TaskCtrl.asap(this);
            this.tasks.asap();
        };
        Attack2GameMode.prototype.finish = function () {
            Task.TaskCtrl.finish(this);
            this.gameStatus.gameMode = new Attack3GameMode(this.gameStatus);
            this.gameStatus.gameMode.do();
        };
        return Attack2GameMode;
    }());
    var Attack3GameMode = (function () {
        function Attack3GameMode(gameStatus) {
            var _this = this;
            this.name = 'Attack3GameMode';
            this.mode = Task.TaskCtrl.DEFAULT_MODE;
            this.tasks = new Task.SequentialTasks();
            this.gameStatus = gameStatus;
            var attackMe = this.gameStatus.attacker.saikoroMe;
            var attackAction = this.gameStatus.attacker.character.attackPalette[attackMe];
            var defenseMe = this.gameStatus.defender.saikoroMe;
            var defenseAction = this.gameStatus.defender.character.defensePalette[defenseMe];
            defenseAction.opened = true;
            this.tasks.add(new Task.FunctionTask(function () { _message.writeLine('さいころの目 → [' + String(defenseMe + 1) + ']' + defenseAction.name); }));
            this.tasks.add(new Task.FunctionTask(function () { actionSelect(_this.gameStatus.defender.defenseBoxList, defenseMe, 'selected_defense', defenseAction); }));
            this.tasks.add(new Task.WaitTask(Task.WaitTask.NORMAL));
            var damage = 0;
            if (!defenseAction.through) {
                damage = attackAction.power - defenseAction.power;
                if (damage < 0) {
                    damage = 0;
                }
                this.tasks.add(new Task.FunctionTask(function () { _message.writeLine(_this.gameStatus.defender.character.name + 'は ' + damage + 'ポイントのダメージを喰らった'); }));
                this.tasks.add(new Task.WaitTask(Task.WaitTask.NORMAL));
            }
            this.gameStatus.defender.hitPoint = this.gameStatus.defender.hitPoint - damage;
            if (this.gameStatus.defender.hitPoint <= 0) {
                this.gameStatus.defender.hitPoint = 0;
            }
            this.tasks.add(new Task.FunctionTask(function () { nokoriHpHyouji(gameStatus); }));
            this.tasks.add(new Task.WaitTask(Task.WaitTask.NORMAL));
            if (this.gameStatus.defender.hitPoint <= 0) {
                this.tasks.add(new Task.FunctionTask(function () { _message.writeLine(_this.gameStatus.defender.character.name + 'は、倒れた'); }));
                this.tasks.add(new Task.WaitTask(Task.WaitTask.NORMAL));
            }
        }
        Attack3GameMode.prototype.do = function () {
            var _this = this;
            Task.TaskCtrl.do(this);
            this.tasks.do();
            Task.TaskCtrl.wait(this.tasks, function () { _this.finish(); });
        };
        Attack3GameMode.prototype.asap = function () {
            Task.TaskCtrl.asap(this);
            this.tasks.asap();
        };
        Attack3GameMode.prototype.finish = function () {
            Task.TaskCtrl.finish(this);
            if (0 < this.gameStatus.defender.hitPoint) {
                this.gameStatus.operationPos++;
                if (0 <= this.gameStatus.operationIdx()) {
                    this.gameStatus.gameMode = new Attack1GameMode(this.gameStatus);
                }
                else {
                    this.gameStatus.gameMode = new KougekiJunjoHandanMode(this.gameStatus);
                }
            }
            else {
                this.gameStatus.gameMode = new InitGameMode(this.gameStatus);
            }
        };
        return Attack3GameMode;
    }());
    function nokoriHpHyouji(gameStatus) {
        for (var i = 0, len = gameStatus.players.length; i < len; i++) {
            var player = gameStatus.players[i];
            player.hitPointElement.textContent = String(player.hitPoint);
        }
    }
    function actionSelect(actionBoxList, me, className, action) {
        for (var i = 0; i < 6; i++) {
            var box = actionBoxList[i];
            if (i == me) {
                box.classList.add(className);
                box.textContent = action.name;
            }
        }
    }
    function actionSelectReset(players) {
        for (var i = 0, len = players.length; i < len; i++) {
            var player = players[i];
            for (var attackDefense = 1; attackDefense <= 2; attackDefense++) {
                var actionBoxList = void 0;
                if (attackDefense == 1) {
                    actionBoxList = player.attackBoxList;
                }
                else {
                    actionBoxList = player.defenseBoxList;
                }
                for (var i_2 = 0; i_2 < 6; i_2++) {
                    var box = actionBoxList[i_2];
                    box.classList.remove('selected_attack');
                    box.classList.remove('selected_defense');
                }
            }
            player.closeAttackActionBoard();
            player.closeDefenseActionBoard();
        }
    }
})(SaikoroBattle || (SaikoroBattle = {}));
//# sourceMappingURL=SaikoroBattle.js.map