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
    var futsu = new DefenseAction('普通に喰らう', '', 0);
    var guard1 = new DefenseAction('ちょっとガード', '', 5);
    var guard2 = new DefenseAction('だいぶガード', '', 10);
    var yokei1 = new DefenseAction('余計に喰らう', '', -5);
    var yokei2 = new DefenseAction('かなり喰らう', '', -10);
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
    var TaskCtrl = (function () {
        function TaskCtrl() {
        }
        TaskCtrl.do = function (task) {
            task.mode = 'running';
        };
        TaskCtrl.asap = function (task) {
            task.mode = 'asap';
        };
        TaskCtrl.finish = function (task) {
            task.mode = 'finish';
        };
        TaskCtrl.wait = function (task, callback) {
            if (task.mode != 'running') {
                callback();
                return;
            }
            window.setTimeout(function () { TaskCtrl.wait(task, callback); }, 100);
        };
        TaskCtrl.DEFAULT_MODE = 'idle';
        return TaskCtrl;
    }());
    var Tasks = (function () {
        function Tasks() {
            this.mode = TaskCtrl.DEFAULT_MODE;
            this.tasks = new Array();
            this.step = -1;
        }
        Tasks.prototype.add = function (task) {
            this.tasks.push(task);
        };
        Tasks.prototype.do = function () {
            TaskCtrl.do(this);
            this.step = -1;
            this.next();
        };
        Tasks.prototype.next = function () {
            var _this = this;
            if (this.mode != 'running') {
                return;
            }
            this.step++;
            if (this.tasks.length <= this.step) {
                this.finish();
                return;
            }
            var task = this.tasks[this.step];
            task.do();
            TaskCtrl.wait(task, function () { _this.next(); });
        };
        Tasks.prototype.asap = function () {
            var _this = this;
            window.setTimeout(function () {
                TaskCtrl.asap(_this);
                while (_this.step < _this.tasks.length) {
                    var task = _this.tasks[_this.step];
                    if (!(task instanceof WaitTask)) {
                        task.asap();
                    }
                    _this.step++;
                }
                _this.finish();
            });
        };
        Tasks.prototype.finish = function () {
            TaskCtrl.finish(this);
            this.tasks.length = 0;
            this.step = -1;
        };
        return Tasks;
    }());
    var FunctionTask = (function () {
        function FunctionTask(func, param) {
            this.mode = TaskCtrl.DEFAULT_MODE;
            this.func = func;
            this.param = param;
        }
        FunctionTask.prototype.do = function () {
            TaskCtrl.do(this);
            this.func(this.param);
            this.finish();
        };
        FunctionTask.prototype.asap = function () {
            TaskCtrl.asap(this);
            this.do();
        };
        FunctionTask.prototype.finish = function () {
            TaskCtrl.finish(this);
        };
        return FunctionTask;
    }());
    var WaitTask = (function () {
        function WaitTask(millisec) {
            this.mode = TaskCtrl.DEFAULT_MODE;
            this.millisec = millisec;
        }
        WaitTask.prototype.do = function () {
            var _this = this;
            TaskCtrl.do(this);
            window.setTimeout(function () { _this.finish(); }, this.millisec);
        };
        WaitTask.prototype.asap = function () {
            TaskCtrl.asap(this);
        };
        WaitTask.prototype.finish = function () {
            TaskCtrl.finish(this);
        };
        WaitTask.FAST = 100;
        WaitTask.NORMAL = 300;
        WaitTask.SLOW = 700;
        return WaitTask;
    }());
    var _mode = 0;
    var defaultAttackPalette = [punch, punch, kick, kick, goshouha, goshouha];
    var defaultDefensePalette = [futsu, guard1, guard2, yokei1, yokei2, kawasu];
    var plyerobj = new Charactor('main', 'player');
    plyerobj.setAttackPalette(defaultAttackPalette);
    plyerobj.setDefensePalette(defaultDefensePalette);
    var enemyobj = new Charactor('enemy', '敵');
    enemyobj.setAttackPalette(defaultAttackPalette);
    enemyobj.setDefensePalette(defaultDefensePalette);
    var tasks = new Tasks();
    function susumeruGame() {
        if (tasks.mode == 'running') {
            tasks.asap();
            return;
        }
        if (_mode == 0) {
            plyerobj.hitPoint = 100;
            enemyobj.hitPoint = 100;
            {
                var actionBoard = getElementById('attackActionBoard');
                tasks.add(new ActionSetTask(actionBoard, plyerobj.attackPalette));
            }
            {
                var actionBoard = getElementById('defenseActionBoard');
                tasks.add(new ActionSetTask(actionBoard, plyerobj.defensePalette));
            }
            tasks.add(new FunctionTask(nokoriHpHyouji, null));
            tasks.add(new WaitTask(WaitTask.FAST));
            tasks.add(new FunctionTask(debugClear, null));
            tasks.add(new WaitTask(WaitTask.FAST));
            tasks.add(new FunctionTask(debug, 'start'));
            tasks.add(new WaitTask(WaitTask.SLOW));
            _mode = 1;
        }
        else if (_mode == 1) {
            attackDefence(tasks, plyerobj, enemyobj);
            if (enemyobj.hitPoint <= 0) {
                tasks.add(new FunctionTask(debug, 'win'));
                tasks.add(new WaitTask(WaitTask.SLOW));
                _mode = 0;
            }
            else {
                _mode = 2;
            }
        }
        else if (_mode == 2) {
            attackDefence(tasks, enemyobj, plyerobj);
            if (plyerobj.hitPoint <= 0) {
                tasks.add(new FunctionTask(debug, 'loose'));
                tasks.add(new WaitTask(WaitTask.SLOW));
                _mode = 0;
            }
            else {
                _mode = 1;
            }
        }
        tasks.do();
    }
    function nokoriHpHyouji() {
        _playerHPElm.textContent = String(plyerobj.hitPoint);
        _enemyhpElm.textContent = String(enemyobj.hitPoint);
    }
    function attackDefence(tasks, attacker, defender) {
        var attackActionBoard = getElementById('attackActionBoard');
        var defenceActionBoard = getElementById('defenseActionBoard');
        tasks.add(new FunctionTask(debugClear, null));
        tasks.add(new FunctionTask(actionSelectReset, { div: attackActionBoard }));
        tasks.add(new FunctionTask(actionSelectReset, { div: defenceActionBoard }));
        tasks.add(new WaitTask(WaitTask.FAST));
        var attackMe = saikoro();
        var attackAction = attacker.attackPalette[attackMe];
        tasks.add(new FunctionTask(debug, attacker.name + 'の攻撃: さいころの目 → [' + String(attackMe + 1) + ']' + attackAction.name));
        tasks.add(new FunctionTask(actionSelect, { div: attackActionBoard, me: attackMe, className: 'selected_attack' }));
        tasks.add(new WaitTask(WaitTask.NORMAL));
        var defenderMe = saikoro();
        var defenderAction = defender.defensePalette[defenderMe];
        tasks.add(new FunctionTask(debug, defender.name + 'の防御:[' + String(defenderMe + 1) + ']' + defenderAction.name));
        tasks.add(new FunctionTask(actionSelect, { div: defenceActionBoard, me: defenderMe, className: 'selected_defense' }));
        tasks.add(new WaitTask(WaitTask.NORMAL));
        var damage = 0;
        if (!defenderAction.through) {
            damage = attackAction.power - defenderAction.power;
            if (damage < 0) {
                damage = 0;
            }
            tasks.add(new FunctionTask(debug, defender.name + 'は ' + damage + 'ポイントのダメージを喰らった'));
            tasks.add(new WaitTask(WaitTask.NORMAL));
        }
        defender.hitPoint = defender.hitPoint - damage;
        if (defender.hitPoint <= 0) {
            defender.hitPoint = 0;
        }
        tasks.add(new FunctionTask(nokoriHpHyouji, null));
        tasks.add(new WaitTask(WaitTask.NORMAL));
        if (defender.hitPoint <= 0) {
            tasks.add(new FunctionTask(debug, defender.name + 'は、倒れた'));
            tasks.add(new WaitTask(WaitTask.NORMAL));
        }
    }
    var ActionSetTask = (function () {
        function ActionSetTask(div, actionList) {
            this.div = div;
            this.actionList = actionList;
            this.mode = TaskCtrl.DEFAULT_MODE;
            this.tasks = new Tasks();
        }
        ActionSetTask.prototype.do = function () {
            var _this = this;
            TaskCtrl.do(this);
            var childNodes = this.div.childNodes;
            var _loop_1 = function (i) {
                var box = childNodes.item(i);
                var action = this_1.actionList[i];
                this_1.tasks.add(new FunctionTask(function () { _this.setBox(box, action); }, null));
                this_1.tasks.add(new WaitTask(WaitTask.FAST));
            };
            var this_1 = this;
            for (var i = 0; i < 6; i++) {
                _loop_1(i);
            }
            this.tasks.do();
            TaskCtrl.wait(this.tasks, function () { _this.finish(); });
        };
        ActionSetTask.prototype.asap = function () {
            TaskCtrl.asap(this);
            this.tasks.asap();
        };
        ActionSetTask.prototype.setBox = function (box, action) {
            box.innerHTML = action.name;
        };
        ActionSetTask.prototype.finish = function () {
            TaskCtrl.finish(this);
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
//# sourceMappingURL=saikoroBattole.js.map