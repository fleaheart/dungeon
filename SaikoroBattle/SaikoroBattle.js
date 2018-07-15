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
    var _mode = 0;
    var defaultAttackPalette = [punch, punch, kick, kick, goshouha, goshouha];
    var defaultDefensePalette = [futsu, guard1, guard2, yokei1, yokei2, kawasu];
    var plyerobj = new Charactor('main', 'player');
    plyerobj.setAttackPalette(defaultAttackPalette);
    plyerobj.setDefensePalette(defaultDefensePalette);
    var enemyobj = new Charactor('enemy', '敵');
    enemyobj.setAttackPalette(defaultAttackPalette);
    enemyobj.setDefensePalette(defaultDefensePalette);
    var tasks = new Task.Tasks();
    function susumeruGame() {
        if (tasks.mode == 'running') {
            tasks.asap();
            return;
        }
        if (_mode == 0) {
            plyerobj.hitPoint = 100;
            enemyobj.hitPoint = 100;
            Task.TaskCtrl.debugBoard = getElementById('debugBoard2');
            {
                var actionBoard = getElementById('attackActionBoard');
                tasks.add(new ActionSetTask(actionBoard, plyerobj.attackPalette));
            }
            {
                var actionBoard = getElementById('defenseActionBoard');
                tasks.add(new ActionSetTask(actionBoard, plyerobj.defensePalette));
            }
            tasks.add(new Task.FunctionTask(nokoriHpHyouji, null));
            tasks.add(new Task.WaitTask(Task.WaitTask.FAST));
            tasks.add(new Task.FunctionTask(debugClear, null));
            tasks.add(new Task.WaitTask(Task.WaitTask.FAST));
            tasks.add(new Task.FunctionTask(debug, 'start'));
            tasks.add(new Task.WaitTask(Task.WaitTask.SLOW));
            _mode = 1;
        }
        else if (_mode == 1) {
            attackDefence(tasks, plyerobj, enemyobj);
            if (enemyobj.hitPoint <= 0) {
                tasks.add(new Task.FunctionTask(debug, 'win'));
                tasks.add(new Task.WaitTask(Task.WaitTask.SLOW));
                _mode = 0;
            }
            else {
                _mode = 2;
            }
        }
        else if (_mode == 2) {
            attackDefence(tasks, enemyobj, plyerobj);
            if (plyerobj.hitPoint <= 0) {
                tasks.add(new Task.FunctionTask(debug, 'loose'));
                tasks.add(new Task.WaitTask(Task.WaitTask.SLOW));
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
        tasks.add(new Task.FunctionTask(debugClear, null));
        tasks.add(new Task.FunctionTask(actionSelectReset, { div: attackActionBoard }));
        tasks.add(new Task.FunctionTask(actionSelectReset, { div: defenceActionBoard }));
        tasks.add(new Task.WaitTask(Task.WaitTask.FAST));
        var attackMe = saikoro();
        var attackAction = attacker.attackPalette[attackMe];
        tasks.add(new Task.FunctionTask(debug, attacker.name + 'の攻撃: さいころの目 → [' + String(attackMe + 1) + ']' + attackAction.name));
        tasks.add(new Task.FunctionTask(actionSelect, { div: attackActionBoard, me: attackMe, className: 'selected_attack' }));
        tasks.add(new Task.WaitTask(Task.WaitTask.NORMAL));
        var defenderMe = saikoro();
        var defenderAction = defender.defensePalette[defenderMe];
        tasks.add(new Task.FunctionTask(debug, defender.name + 'の防御:[' + String(defenderMe + 1) + ']' + defenderAction.name));
        tasks.add(new Task.FunctionTask(actionSelect, { div: defenceActionBoard, me: defenderMe, className: 'selected_defense' }));
        tasks.add(new Task.WaitTask(Task.WaitTask.NORMAL));
        var damage = 0;
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