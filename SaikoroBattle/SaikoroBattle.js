var SaikoroBattle;
(function (SaikoroBattle) {
    var _debugBoard;
    function debug(text) {
        var html = _debugBoard.innerHTML;
        html += text + '<br>';
        _debugBoard.innerHTML = html;
    }
    function debugClear() {
        _debugBoard.innerHTML = '';
    }
    function dbg(text) {
        var dbg = getElementById('debugBoard2');
        var h = dbg.innerHTML;
        h += text + ' / ';
        dbg.innerHTML = h;
    }
    SaikoroBattle.dbg = dbg;
    var _playerHPElm;
    var _enemyhpElm;
    function getElementById(elementId) {
        var elm = document.getElementById(elementId);
        if (elm == null) {
            throw elementId + ' is not found.';
        }
        return elm;
    }
    function init() {
        _debugBoard = getElementById('debugBoard');
        _playerHPElm = getElementById('playerHP');
        _enemyhpElm = getElementById('enemyHP');
        initMainBoard();
    }
    SaikoroBattle.init = init;
    ;
    function initMainBoard() {
        var mainBoard = getElementById('mainBoard');
        var startButton = document.createElement('BUTTON');
        startButton.textContent = 'start';
        startButton.addEventListener('click', susumeruGame);
        mainBoard.appendChild(startButton);
        {
            var actionBoard = document.createElement('DIV');
            actionBoard.id = 'attackActionBoard';
            actionBoard.className = 'actionBoard';
            for (var i = 0; i < 6; i++) {
                var actionBox = document.createElement('DIV');
                actionBox.className = 'actionBox';
                actionBoard.appendChild(actionBox);
            }
            var actionSaikoro = document.createElement('DIV');
            actionSaikoro.className = 'saikoro';
            actionBoard.appendChild(actionSaikoro);
            mainBoard.appendChild(actionBoard);
        }
        {
            var actionBoard = document.createElement('DIV');
            actionBoard.id = 'defenseActionBoard';
            actionBoard.className = 'actionBoard';
            for (var i = 0; i < 6; i++) {
                var actionBox = document.createElement('DIV');
                actionBox.className = 'actionBox';
                actionBoard.appendChild(actionBox);
            }
            var actionSaikoro = document.createElement('DIV');
            actionSaikoro.className = 'saikoro';
            actionBoard.appendChild(actionSaikoro);
            mainBoard.appendChild(actionBoard);
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
        function AttackAction(name, detail, power) {
            this.name = name;
            this.detail = detail;
            this.power = power;
        }
        AttackAction.prototype.clone = function () {
            var action = new AttackAction(this.name, this.detail, this.power);
            return action;
        };
        return AttackAction;
    }());
    var punch = new AttackAction('パンチ', '', 20);
    var kick = new AttackAction('キック', '', 30);
    var goshouha = new AttackAction('張り手', '', 40);
    var DefenseAction = (function () {
        function DefenseAction(name, detail, power) {
            this.through = false;
            this.nigashiPoint = 0;
            this.name = name;
            this.detail = detail;
            this.power = power;
        }
        DefenseAction.prototype.clone = function () {
            var action = new DefenseAction(this.name, this.detail, this.power);
            action.through = this.through;
            action.nigashiPoint = this.nigashiPoint;
            return action;
        };
        return DefenseAction;
    }());
    var yokei2 = new DefenseAction('かなり喰らう', '', -10);
    var yokei1 = new DefenseAction('余計に喰らう', '', -5);
    var futsu = new DefenseAction('普通に喰らう', '', 0);
    var guard1 = new DefenseAction('ちょっとガード', '', 5);
    var guard2 = new DefenseAction('だいぶガード', '', 10);
    var kawasu = new DefenseAction('完全にかわす', '', 0);
    kawasu.through = true;
    var Charactor = (function () {
        function Charactor(type, name) {
            var _this = this;
            this.setAttackPalette = function (palette) {
                _this.attackPalette.length = 0;
                for (var i = 0, l = palette.length; i < l; i++) {
                    _this.attackPalette.push(palette[i].clone());
                }
            };
            this.setDefensePalette = function (palette) {
                _this.defensePalette.length = 0;
                for (var i = 0, l = palette.length; i < l; i++) {
                    _this.defensePalette.push(palette[i].clone());
                }
            };
            this.type = type;
            this.name = name;
            this.hitPoint = 0;
            this.attackPalette = new Array();
            this.defensePalette = new Array();
        }
        return Charactor;
    }());
    var NullCharactor = new Charactor('NULL', 'NULL');
    var defaultAttackPalette = [punch, punch, kick, kick, goshouha, goshouha];
    var defaultDefensePalette = [yokei2, yokei1, futsu, guard1, guard2, kawasu];
    var plyerobj = new Charactor('main', 'player');
    plyerobj.setAttackPalette(defaultAttackPalette);
    plyerobj.setDefensePalette(defaultDefensePalette);
    var enemyobj = new Charactor('enemy', '敵');
    enemyobj.setAttackPalette(defaultAttackPalette);
    enemyobj.setDefensePalette(defaultDefensePalette);
    var GameStatus = (function () {
        function GameStatus() {
            this.gameMode = null;
            this.attacker = NullCharactor;
            this.defender = NullCharactor;
            this.defenseMe = -1;
        }
        return GameStatus;
    }());
    var _gameStatus = new GameStatus();
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
            this.tasks = new Task.Tasks();
            this.finish = function () {
                Task.TaskCtrl.finish(_this);
                _this.gameStatus.attacker = plyerobj;
                _this.gameStatus.defender = enemyobj;
                _this.gameStatus.gameMode = new Attack1GameMode(_this.gameStatus);
            };
            this.gameStatus = gameStatus;
            plyerobj.hitPoint = 100;
            enemyobj.hitPoint = 100;
            {
                var actionBoard = getElementById('attackActionBoard');
                this.tasks.add(new ActionSetTask(actionBoard, plyerobj.attackPalette));
            }
            {
                var actionBoard = getElementById('defenseActionBoard');
                this.tasks.add(new ActionSetTask(actionBoard, plyerobj.defensePalette));
            }
            this.tasks.add(new Task.FunctionTask(nokoriHpHyouji, null));
            this.tasks.add(new Task.WaitTask(Task.WaitTask.FAST));
            this.tasks.add(new Task.FunctionTask(debugClear, null));
            this.tasks.add(new Task.WaitTask(Task.WaitTask.FAST));
            this.tasks.add(new Task.FunctionTask(debug, 'start'));
            this.tasks.add(new Task.WaitTask(Task.WaitTask.SLOW));
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
    var Attack1GameMode = (function () {
        function Attack1GameMode(gameStatus) {
            var _this = this;
            this.name = 'Attack1GameMode';
            this.mode = Task.TaskCtrl.DEFAULT_MODE;
            this.tasks = new Task.Tasks();
            this.callback = function (me) {
                _this.gameStatus.attackMe = me;
            };
            this.finish = function () {
                Task.TaskCtrl.finish(_this);
                _this.gameStatus.gameMode = new Attack2GameMode(_this.gameStatus);
                _this.gameStatus.gameMode.do();
            };
            this.gameStatus = gameStatus;
            var attackActionBoard = getElementById('attackActionBoard');
            var defenseActionBoard = getElementById('defenseActionBoard');
            this.tasks.add(new Task.FunctionTask(debugClear, null));
            this.tasks.add(new Task.FunctionTask(actionSelectReset, { div: attackActionBoard }));
            this.tasks.add(new Task.FunctionTask(actionSelectReset, { div: defenseActionBoard }));
            this.tasks.add(new Task.FunctionTask(debug, this.gameStatus.attacker.name + 'の攻撃'));
            this.tasks.add(new SaikoroTask(this.callback, this.rollingFunc));
        }
        Attack1GameMode.prototype.rollingFunc = function (me) {
            var div = getElementById('attackActionBoard');
            var box = div.childNodes.item(6);
            box.innerHTML = SaikoroTask.saikoroHTML(me);
        };
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
            this.name = 'Attack1GameMode';
            this.mode = Task.TaskCtrl.DEFAULT_MODE;
            this.tasks = new Task.Tasks();
            this.callback = function (me) {
                _this.gameStatus.defenseMe = me;
            };
            this.finish = function () {
                Task.TaskCtrl.finish(_this);
                _this.gameStatus.gameMode = new Attack3GameMode(_this.gameStatus);
                _this.gameStatus.gameMode.do();
            };
            this.gameStatus = gameStatus;
            var attackActionBoard = getElementById('attackActionBoard');
            var attackMe = this.gameStatus.attackMe;
            var attackAction = this.gameStatus.attacker.attackPalette[attackMe];
            this.tasks.add(new Task.FunctionTask(debug, 'さいころの目 → [' + String(attackMe + 1) + ']' + attackAction.name));
            this.tasks.add(new Task.FunctionTask(actionSelect, { div: attackActionBoard, me: attackMe, className: 'selected_attack' }));
            this.tasks.add(new Task.FunctionTask(debug, this.gameStatus.defender.name + 'の防御'));
            this.tasks.add(new SaikoroTask(this.callback, this.rollingFunc));
        }
        Attack2GameMode.prototype.do = function () {
            Task.TaskCtrl.do(this);
            this.tasks.do();
            Task.TaskCtrl.wait(this.tasks, this.finish);
        };
        Attack2GameMode.prototype.rollingFunc = function (me) {
            var div = getElementById('defenseActionBoard');
            var box = div.childNodes.item(6);
            box.innerHTML = SaikoroTask.saikoroHTML(me);
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
            this.name = 'Attack1GameMode';
            this.mode = Task.TaskCtrl.DEFAULT_MODE;
            this.tasks = new Task.Tasks();
            this.finish = function () {
                Task.TaskCtrl.finish(_this);
                if (0 < _this.gameStatus.defender.hitPoint) {
                    var swap = _this.gameStatus.attacker;
                    _this.gameStatus.attacker = _this.gameStatus.defender;
                    _this.gameStatus.defender = swap;
                    _this.gameStatus.gameMode = new Attack1GameMode(_this.gameStatus);
                }
                else {
                    _this.gameStatus.gameMode = new InitGameMode(_this.gameStatus);
                }
            };
            this.gameStatus = gameStatus;
            var defenseActionBoard = getElementById('defenseActionBoard');
            var attackMe = this.gameStatus.attackMe;
            var attackAction = this.gameStatus.attacker.attackPalette[attackMe];
            var defenseMe = this.gameStatus.defenseMe;
            var defenseAction = this.gameStatus.defender.defensePalette[defenseMe];
            this.tasks.add(new Task.FunctionTask(debug, 'さいころの目 → [' + String(defenseMe + 1) + ']' + defenseAction.name));
            this.tasks.add(new Task.FunctionTask(actionSelect, { div: defenseActionBoard, me: defenseMe, className: 'selected_defense' }));
            this.tasks.add(new Task.WaitTask(Task.WaitTask.NORMAL));
            var damage = 0;
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
    function nokoriHpHyouji() {
        _playerHPElm.textContent = String(plyerobj.hitPoint);
        _enemyhpElm.textContent = String(enemyobj.hitPoint);
    }
    var ActionSetTask = (function () {
        function ActionSetTask(div, actionList) {
            var _this = this;
            this.name = 'ActionSetTask';
            this.mode = Task.TaskCtrl.DEFAULT_MODE;
            this.tasks = new Task.Tasks();
            this.div = div;
            this.actionList = actionList;
            var childNodes = this.div.childNodes;
            var _loop_1 = function (i) {
                var box = childNodes.item(i);
                var action = this_1.actionList[i];
                this_1.tasks.add(new Task.FunctionTask(function () { _this.setBox(box, action); }, null));
                this_1.tasks.add(new Task.WaitTask(Task.WaitTask.FAST));
            };
            var this_1 = this;
            for (var i = 0; i < 6; i++) {
                _loop_1(i);
            }
        }
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
    function actionSelect(param) {
        var div = param.div;
        var me = param.me;
        var className = param.className;
        var childNodes = div.childNodes;
        for (var i = 0; i < 6; i++) {
            var box = childNodes.item(i);
            if (i == me) {
                box.classList.add(className);
            }
        }
    }
    function actionSelectReset(param) {
        var div = param.div;
        var childNodes = div.childNodes;
        for (var i = 0; i < 6; i++) {
            var box = childNodes.item(i);
            box.classList.remove('selected_attack');
            box.classList.remove('selected_defense');
        }
    }
})(SaikoroBattle || (SaikoroBattle = {}));
//# sourceMappingURL=SaikoroBattle.js.map