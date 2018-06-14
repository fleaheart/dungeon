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
    var _mainBoard;
    var _playerHPElm;
    var _enemyhpElm;
    function getElementById(elementId) {
        var elm = document.getElementById(elementId);
        if (elm == null) {
            throw elementId + ' is not found.';
        }
        return elm;
    }
    window.addEventListener('load', function () {
        _debugBoard = getElementById('debugBoard');
        _mainBoard = getElementById('mainBoard');
        _playerHPElm = getElementById('playerHP');
        _enemyhpElm = getElementById('enemyHP');
        var startButton = document.createElement('BUTTON');
        startButton.textContent = 'start';
        startButton.addEventListener('click', susumeruGame);
        _mainBoard.appendChild(startButton);
    });
    function integerRandom(maxValue) {
        var value = Math.random() * maxValue;
        return Math.floor(value);
    }
    function saikoro() {
        return integerRandom(6);
    }
    var AttackItem = (function () {
        function AttackItem(name, detail, power) {
            this.type = 'attack';
            this.name = name;
            this.detail = detail;
            this.power = power;
        }
        AttackItem.prototype.clone = function () {
            var item = new AttackItem(this.name, this.detail, this.power);
            return item;
        };
        return AttackItem;
    }());
    var punch = new AttackItem('パンチ', '', 20);
    var kick = new AttackItem('キック', '', 30);
    var goshouha = new AttackItem('張り手', '', 40);
    var DefenseItem = (function () {
        function DefenseItem(name, detail, power) {
            this.through = false;
            this.nigashiPoint = 0;
            this.type = 'defense';
            this.name = name;
            this.detail = detail;
            this.power = power;
        }
        DefenseItem.prototype.clone = function () {
            var item = new DefenseItem(this.name, this.detail, this.power);
            item.through = this.through;
            item.nigashiPoint = this.nigashiPoint;
            return item;
        };
        return DefenseItem;
    }());
    var futsu = new DefenseItem('普通に喰らう', '', 0);
    var guard1 = new DefenseItem('ちょっとガード', '', 5);
    var guard2 = new DefenseItem('だいぶガード', '', 10);
    var yokei1 = new DefenseItem('余計に喰らう', '', -5);
    var yokei2 = new DefenseItem('かなり喰らう', '', -10);
    var kawasu = new DefenseItem('完全にかわす', '', 0);
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
    function susumeruGame() {
        if (_mode == 0) {
            plyerobj.hitPoint = 100;
            enemyobj.hitPoint = 100;
            nokoriHpHyouji();
            debugClear();
            debug('start');
            _mode = 1;
            return;
        }
        if (_mode == 1) {
            attackDefence(plyerobj, enemyobj);
            if (enemyobj.hitPoint <= 0) {
                debug('win');
                _mode = 0;
            }
            else {
                _mode = 2;
                return;
            }
        }
        if (_mode == 2) {
            attackDefence(enemyobj, plyerobj);
            if (plyerobj.hitPoint <= 0) {
                debug('loose');
                _mode = 0;
            }
            else {
                _mode = 1;
                return;
            }
        }
    }
    function nokoriHpHyouji() {
        _playerHPElm.textContent = String(plyerobj.hitPoint);
        _enemyhpElm.textContent = String(enemyobj.hitPoint);
    }
    var _doTasks;
    function attackDefence(attacker, defender) {
        var tasks = new Array();
        tasks.push(new Task(debugClear, null, 100));
        var attackMe = saikoro();
        var attackItem = attacker.attackPalette[attackMe];
        tasks.push(new Task(debug, attacker.name + 'の攻撃: さいころの目 → [' + String(attackMe + 1) + ']' + attackItem.name, 300));
        var defenderMe = saikoro();
        var defenderItem = defender.defensePalette[defenderMe];
        tasks.push(new Task(debug, defender.name + 'の防御:[' + String(defenderMe + 1) + ']' + defenderItem.name, 300));
        var damage = 0;
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
        _doTasks = new DoTasks(tasks);
        _doTasks.start();
    }
    var Task = (function () {
        function Task(func, param, wait) {
            this.func = func;
            this.param = param;
            this.wait = wait;
        }
        return Task;
    }());
    var DoTasks = (function () {
        function DoTasks(tasks) {
            this.step = null;
            this.timer = null;
            this.tasks = tasks;
        }
        DoTasks.prototype.start = function () {
            this.step = 0;
            this.doTask();
        };
        DoTasks.prototype.doTask = function () {
            var _this = this;
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
            var func = this.tasks[this.step].func;
            var param = this.tasks[this.step].param;
            var wait = this.tasks[this.step].wait;
            func(param);
            this.step++;
            this.timer = window.setTimeout(function () { _this.doTask(); }, wait);
        };
        DoTasks.prototype.destroy = function () {
            this.step = null;
            if (this.timer != null) {
                window.clearTimeout(this.timer);
            }
            this.timer = null;
        };
        return DoTasks;
    }());
})(SaikoroBattle || (SaikoroBattle = {}));
//# sourceMappingURL=saikotoBattole.js.map