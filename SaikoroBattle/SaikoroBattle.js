var SaikoroBattle;
(function (SaikoroBattle) {
    var _message = new Kyoutsu.Message();
    var _debug = new Kyoutsu.Message();
    var GameDeifine = (function () {
        function GameDeifine() {
            this.attackActionList = new Array();
            this.defenseActionList = new Array();
            this.playerList = new Array();
            this.enemyList = new Array();
        }
        return GameDeifine;
    }());
    var _gameDeifine = new GameDeifine();
    var GameStatus = (function () {
        function GameStatus() {
            this.gameMode = null;
            this.players = new Array();
            this.actionStack = new Array();
            this.attacker = NullCharacter;
            this.defender = NullCharacter;
        }
        return GameStatus;
    }());
    var _gameStatus = new GameStatus();
    function init() {
        _message.set(Kyoutsu.getElementById('messageBoard'));
        _debug.set(Kyoutsu.getElementById('messageBoard'));
        initDefine();
        _gameStatus.players.push(new Player(_gameDeifine.playerList[0]));
        _gameStatus.players.push(new Player(_gameDeifine.enemyList[0]));
        initMainBoard(_gameStatus);
    }
    SaikoroBattle.init = init;
    ;
    function initDefine() {
        var fileData = Kyoutsu.load('SaikoroBattle.txt');
        var lines = fileData.split(/[\r\n]+/);
        for (var i = 0, len = lines.length; i < len; i++) {
            var columns = lines[i].split(/\t/);
            if (columns.length < 4) {
                continue;
            }
            var id = +columns[0];
            var type = columns[1];
            var name_1 = columns[3];
            if (type == 'Attack') {
                var action = new AttackAction(id, name_1, +columns[4]);
                _gameDeifine.attackActionList.push(action);
            }
            else if (type == 'Defense') {
                var action = new DefenseAction(id, name_1, +columns[4]);
                if (columns[5] == 'through') {
                    action.through = true;
                }
                _gameDeifine.defenseActionList.push(action);
            }
            else if (type == 'Player' || type == 'Enemy') {
                var character = new Character(id, type, name_1);
                character.hitPointMax = +columns[4];
                setDefaultActionPalette(_gameDeifine.attackActionList, columns[5], character.attackPalette);
                setDefaultActionPalette(_gameDeifine.defenseActionList, columns[6], character.defensePalette);
                if (type == 'Player') {
                    _gameDeifine.playerList.push(character);
                }
                else if (type == 'Enemy') {
                    _gameDeifine.enemyList.push(character);
                }
            }
        }
    }
    function setDefaultActionPalette(list, idText, palette) {
        var ids = idText.split(',');
        if (ids.length != 6) {
            throw 'illegal palette count';
        }
        palette.length = 0;
        for (var i = 0; i < 6; i++) {
            var action = pickupAction(list, +ids[i]);
            palette.push(action);
        }
    }
    function pickupAction(list, id) {
        for (var i = 0, len = list.length; i < len; i++) {
            if (list[i].id == id) {
                return list[i].clone();
            }
        }
        throw 'id:' + String(id) + ' is not found';
    }
    function initMainBoard(gameStatus) {
        var mainBoard = Kyoutsu.getElementById('mainBoard');
        var startButton = document.createElement('BUTTON');
        startButton.textContent = 'start';
        startButton.addEventListener('click', susumeruGame);
        mainBoard.appendChild(startButton);
        for (var i = 0, len = gameStatus.players.length; i < len; i++) {
            var player = gameStatus.players[i];
            createActonBoard(player);
            mainBoard.appendChild(player.characterBoard);
        }
    }
    function createActonBoard(player) {
        {
            var span = document.createElement('SPAN');
            span.textContent = player.character.name + ' HP: ';
            player.characterBoard.appendChild(span);
        }
        {
            var span = document.createElement('SPAN');
            player.characterBoard.appendChild(span);
            player.hitPointElement = span;
        }
        {
            var saikoro_1 = player.saikoroElement;
            saikoro_1.className = 'saikoro';
            player.characterBoard.appendChild(saikoro_1);
        }
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
    var AttackAction = (function () {
        function AttackAction(id, name, power, detail) {
            this.id = id;
            this.name = name;
            this.power = power;
            if (detail == undefined) {
                this.detail = '';
            }
            else {
                this.detail = detail;
            }
        }
        AttackAction.prototype.clone = function () {
            var action = new AttackAction(this.id, this.name, this.power, this.detail);
            return action;
        };
        return AttackAction;
    }());
    var DefenseAction = (function () {
        function DefenseAction(id, name, power, detail) {
            this.through = false;
            this.nigashiPoint = 0;
            this.id = id;
            this.name = name;
            this.power = power;
            if (detail == undefined) {
                this.detail = '';
            }
            else {
                this.detail = detail;
            }
        }
        DefenseAction.prototype.clone = function () {
            var action = new DefenseAction(this.id, this.name, this.power, this.detail);
            action.through = this.through;
            action.nigashiPoint = this.nigashiPoint;
            return action;
        };
        return DefenseAction;
    }());
    var Character = (function () {
        function Character(id, type, name) {
            this.hitPointMax = 0;
            this.attackPalette = new Array();
            this.defensePalette = new Array();
            this.id = id;
            this.type = type;
            this.name = name;
        }
        Character.prototype.clone = function () {
            var character = new Character(this.id, this.type, this.name);
            character.hitPointMax = this.hitPointMax;
            cloneList(this.attackPalette, character.attackPalette);
            cloneList(this.defensePalette, character.defensePalette);
            return character;
        };
        return Character;
    }());
    function cloneList(source, destination) {
        destination.length = 0;
        for (var i = 0, len = source.length; i < len; i++) {
            destination.push(source[i].clone());
        }
    }
    var Player = (function () {
        function Player(character) {
            this.hitPoint = 0;
            this.saikoroMe = 1;
            this.attackBoxList = new Array();
            this.defenseBoxList = new Array();
            this.character = character.clone();
            this.characterBoard = document.createElement('DIV');
            this.hitPointElement = document.createElement('SPAN');
            this.saikoroElement = document.createElement('DIV');
            this.attackActionBoard = document.createElement('DIV');
            this.defenseActionBoard = document.createElement('DIV');
        }
        return Player;
    }());
    var NullCharacter = new Player(new Character(-1, 'NULL', 'NULL'));
    function susumeruGame() {
        if (_gameStatus.gameMode == null) {
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
            var _this = this;
            this.name = 'InitGameMode';
            this.mode = Task.TaskCtrl.DEFAULT_MODE;
            this.tasks = new Task.SequentialTasks();
            this.finish = function () {
                Task.TaskCtrl.finish(_this);
                _this.gameStatus.gameMode = new KougekiJunjoHandanMode(_this.gameStatus);
            };
            this.gameStatus = gameStatus;
            for (var i = 0, len = gameStatus.players.length; i < len; i++) {
                var player = gameStatus.players[i];
                player.hitPoint = player.character.hitPointMax;
            }
            this.tasks.add(new ActionSetTask(gameStatus));
            this.tasks.add(new Task.FunctionTask(nokoriHpHyouji, gameStatus));
            this.tasks.add(new Task.WaitTask(Task.WaitTask.FAST));
            this.tasks.add(new Task.FunctionTask(_message.clear, null));
            this.tasks.add(new Task.WaitTask(Task.WaitTask.FAST));
            this.tasks.add(new Task.FunctionTask(_message.writeLine, 'start'));
        }
        InitGameMode.prototype.do = function () {
            Task.TaskCtrl.do(this);
            this.tasks.do();
            Task.TaskCtrl.wait(this.tasks, this.finish);
        };
        InitGameMode.prototype.asap = function () {
            Task.TaskCtrl.asap(this);
            this.tasks.asap();
        };
        return InitGameMode;
    }());
    var ActionSetTask = (function () {
        function ActionSetTask(gameStatus) {
            this.name = 'ActionSetTask';
            this.mode = Task.TaskCtrl.DEFAULT_MODE;
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
                    tasks.add(new Task.FunctionTask(function () { _this.setBox(box, action); }, null));
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
            box.innerHTML = action.name;
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
    var KougekiJunjoHandanMode = (function () {
        function KougekiJunjoHandanMode(gameStatus) {
            var _this = this;
            this.name = 'KougekiJunjoHandanMode';
            this.mode = Task.TaskCtrl.DEFAULT_MODE;
            this.tasks = new Task.ParallelTasks();
            this.order = new Array();
            this.orderEntryList = new Array();
            this.callback = function (playerIdx, me) {
                _this.gameStatus.players[playerIdx].saikoroMe = me;
            };
            this.rollingFunc = function (playerIdx, me) {
                _this.gameStatus.players[playerIdx].saikoroElement.innerHTML = SaikoroTask.saikoroHTML(me);
            };
            this.check = function () {
                var existsKaburi = false;
                var meList = new Array();
                for (var i = 0, len = _this.gameStatus.players.length; i < len; i++) {
                    if (_this.orderEntryList[i].entry) {
                        var me = _this.gameStatus.players[i].saikoroMe;
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
                    _debug.writeLine(i + ' idx:' + meList[i].playerIdx + ' me:' + meList[i].me + ':' + meList[i].kaburi);
                    if (meList[i].kaburi) {
                        _this.orderEntryList[meList[i].playerIdx].entry = true;
                    }
                    else {
                        _this.orderEntryList[meList[i].playerIdx].entry = false;
                        _this.order.push(meList[i].playerIdx);
                    }
                }
                if (existsKaburi) {
                    _this.mode = Task.TaskCtrl.DEFAULT_MODE;
                    _this.orderEntry();
                    return;
                }
                _this.finish();
            };
            this.finish = function () {
                Task.TaskCtrl.finish(_this);
                _this.gameStatus.actionStack.length = 0;
                for (var i = 0, len = _this.order.length; i < len; i++) {
                    _this.gameStatus.actionStack.push(_this.order[i]);
                }
                _this.gameStatus.gameMode = new Attack1GameMode(_this.gameStatus);
            };
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
        KougekiJunjoHandanMode.prototype.do = function () {
            var _this = this;
            Task.TaskCtrl.do(this);
            window.setTimeout(function () {
                var tasks = new Task.ParallelTasks();
                tasks.add(new Task.FunctionTask(_message.clear, null));
                tasks.add(new Task.FunctionTask(actionSelectReset, _this.gameStatus.players));
                tasks.add(new Task.FunctionTask(_message.writeLine, '攻撃順判定'));
                tasks.do();
            });
            this.tasks.do();
            Task.TaskCtrl.wait(this.tasks, function () { _this.check(); });
        };
        KougekiJunjoHandanMode.prototype.asap = function () {
            Task.TaskCtrl.asap(this);
            this.tasks.asap();
        };
        return KougekiJunjoHandanMode;
    }());
    var Attack1GameMode = (function () {
        function Attack1GameMode(gameStatus) {
            var _this = this;
            this.name = 'Attack1GameMode';
            this.mode = Task.TaskCtrl.DEFAULT_MODE;
            this.tasks = new Task.SequentialTasks();
            this.callback = function (me) {
                _this.gameStatus.attacker.saikoroMe = me;
            };
            this.rollingFunc = function (me) {
                _this.gameStatus.attacker.saikoroElement.innerHTML = SaikoroTask.saikoroHTML(me);
            };
            this.finish = function () {
                Task.TaskCtrl.finish(_this);
                _this.gameStatus.gameMode = new Attack2GameMode(_this.gameStatus);
                _this.gameStatus.gameMode.do();
            };
            this.gameStatus = gameStatus;
            var attackerIdx = this.gameStatus.actionStack.shift();
            if (attackerIdx == undefined) {
                throw 'no stack';
            }
            if (attackerIdx == 0) {
                gameStatus.attacker = this.gameStatus.players[0];
                gameStatus.defender = this.gameStatus.players[1];
            }
            else {
                gameStatus.attacker = this.gameStatus.players[attackerIdx];
                gameStatus.defender = this.gameStatus.players[0];
            }
            this.tasks.add(new Task.FunctionTask(_message.clear, null));
            this.tasks.add(new Task.FunctionTask(actionSelectReset, gameStatus.players));
            this.tasks.add(new Task.FunctionTask(_message.writeLine, this.gameStatus.attacker.character.name + 'の攻撃'));
            this.tasks.add(new SaikoroTask(this.callback, this.rollingFunc));
        }
        Attack1GameMode.prototype.do = function () {
            Task.TaskCtrl.do(this);
            this.tasks.do();
            Task.TaskCtrl.wait(this.tasks, this.finish);
        };
        Attack1GameMode.prototype.asap = function () {
            Task.TaskCtrl.asap(this);
            this.tasks.asap();
        };
        return Attack1GameMode;
    }());
    var Attack2GameMode = (function () {
        function Attack2GameMode(gameStatus) {
            var _this = this;
            this.name = 'Attack2GameMode';
            this.mode = Task.TaskCtrl.DEFAULT_MODE;
            this.tasks = new Task.SequentialTasks();
            this.callback = function (me) {
                _this.gameStatus.defender.saikoroMe = me;
            };
            this.rollingFunc = function (me) {
                _this.gameStatus.defender.saikoroElement.innerHTML = SaikoroTask.saikoroHTML(me);
            };
            this.finish = function () {
                Task.TaskCtrl.finish(_this);
                _this.gameStatus.gameMode = new Attack3GameMode(_this.gameStatus);
                _this.gameStatus.gameMode.do();
            };
            this.gameStatus = gameStatus;
            var attackMe = this.gameStatus.attacker.saikoroMe;
            var attackAction = this.gameStatus.attacker.character.attackPalette[attackMe];
            this.tasks.add(new Task.FunctionTask(_message.writeLine, 'さいころの目 → [' + String(attackMe + 1) + ']' + attackAction.name));
            this.tasks.add(new Task.FunctionTask(actionSelect, { actionBoxList: this.gameStatus.attacker.attackBoxList, me: attackMe, className: 'selected_attack' }));
            this.tasks.add(new Task.FunctionTask(_message.writeLine, this.gameStatus.defender.character.name + 'の防御'));
            this.tasks.add(new SaikoroTask(this.callback, this.rollingFunc));
        }
        Attack2GameMode.prototype.do = function () {
            Task.TaskCtrl.do(this);
            this.tasks.do();
            Task.TaskCtrl.wait(this.tasks, this.finish);
        };
        Attack2GameMode.prototype.asap = function () {
            Task.TaskCtrl.asap(this);
            this.tasks.asap();
        };
        return Attack2GameMode;
    }());
    var Attack3GameMode = (function () {
        function Attack3GameMode(gameStatus) {
            var _this = this;
            this.name = 'Attack3GameMode';
            this.mode = Task.TaskCtrl.DEFAULT_MODE;
            this.tasks = new Task.SequentialTasks();
            this.finish = function () {
                Task.TaskCtrl.finish(_this);
                if (0 < _this.gameStatus.defender.hitPoint) {
                    if (0 < _this.gameStatus.actionStack.length) {
                        _this.gameStatus.gameMode = new Attack1GameMode(_this.gameStatus);
                    }
                    else {
                        _this.gameStatus.gameMode = new KougekiJunjoHandanMode(_this.gameStatus);
                    }
                }
                else {
                    _this.gameStatus.gameMode = new InitGameMode(_this.gameStatus);
                }
            };
            this.gameStatus = gameStatus;
            var attackMe = this.gameStatus.attacker.saikoroMe;
            var attackAction = this.gameStatus.attacker.character.attackPalette[attackMe];
            var defenseMe = this.gameStatus.defender.saikoroMe;
            var defenseAction = this.gameStatus.defender.character.defensePalette[defenseMe];
            this.tasks.add(new Task.FunctionTask(_message.writeLine, 'さいころの目 → [' + String(defenseMe + 1) + ']' + defenseAction.name));
            this.tasks.add(new Task.FunctionTask(actionSelect, { actionBoxList: this.gameStatus.defender.defenseBoxList, me: defenseMe, className: 'selected_defense' }));
            this.tasks.add(new Task.WaitTask(Task.WaitTask.NORMAL));
            var damage = 0;
            if (!defenseAction.through) {
                damage = attackAction.power - defenseAction.power;
                if (damage < 0) {
                    damage = 0;
                }
                this.tasks.add(new Task.FunctionTask(_message.writeLine, this.gameStatus.defender.character.name + 'は ' + damage + 'ポイントのダメージを喰らった'));
                this.tasks.add(new Task.WaitTask(Task.WaitTask.NORMAL));
            }
            this.gameStatus.defender.hitPoint = this.gameStatus.defender.hitPoint - damage;
            if (this.gameStatus.defender.hitPoint <= 0) {
                this.gameStatus.defender.hitPoint = 0;
            }
            this.tasks.add(new Task.FunctionTask(nokoriHpHyouji, gameStatus));
            this.tasks.add(new Task.WaitTask(Task.WaitTask.NORMAL));
            if (this.gameStatus.defender.hitPoint <= 0) {
                this.tasks.add(new Task.FunctionTask(_message.writeLine, this.gameStatus.defender.character.name + 'は、倒れた'));
                this.tasks.add(new Task.WaitTask(Task.WaitTask.NORMAL));
            }
        }
        Attack3GameMode.prototype.do = function () {
            Task.TaskCtrl.do(this);
            this.tasks.do();
            Task.TaskCtrl.wait(this.tasks, this.finish);
        };
        Attack3GameMode.prototype.asap = function () {
            Task.TaskCtrl.asap(this);
            this.tasks.asap();
        };
        return Attack3GameMode;
    }());
    function nokoriHpHyouji(gameStatus) {
        for (var i = 0, len = gameStatus.players.length; i < len; i++) {
            var player = gameStatus.players[i];
            player.hitPointElement.textContent = String(player.hitPoint);
        }
    }
    function actionSelect(param) {
        var actionBoxList = param.actionBoxList;
        var me = param.me;
        var className = param.className;
        for (var i = 0; i < 6; i++) {
            var box = actionBoxList[i];
            if (i == me) {
                box.classList.add(className);
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
        }
    }
})(SaikoroBattle || (SaikoroBattle = {}));
//# sourceMappingURL=SaikoroBattle.js.map