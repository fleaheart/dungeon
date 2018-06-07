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
    var Chara = (function () {
        function Chara(type, name) {
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
            this.hitpoint = 0;
            this.attackPalette = new Array();
            this.defensePalette = new Array();
        }
        return Chara;
    }());
    var _mode = 0;
    var defaultAttackPalette = [punch, punch, kick, kick, goshouha, goshouha];
    var defaultDefensePalette = [futsu, guard1, guard2, yokei1, yokei2, kawasu];
    var plyerobj = new Chara('main', 'player');
    plyerobj.setAttackPalette(defaultAttackPalette);
    plyerobj.setDefensePalette(defaultDefensePalette);
    var enemyobj = new Chara('enemy', '敵');
    enemyobj.setAttackPalette(defaultAttackPalette);
    enemyobj.setDefensePalette(defaultDefensePalette);
    function susumeruGame() {
        if (_mode == 0) {
            plyerobj.hitpoint = 100;
            enemyobj.hitpoint = 100;
            nokoriHpHyouji();
            debugClear();
            debug('start');
            _mode = 1;
            return;
        }
        if (_mode == 1) {
            attackDefence(plyerobj, enemyobj);
            if (enemyobj.hitpoint <= 0) {
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
            if (plyerobj.hitpoint <= 0) {
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
        _playerHPElm.textContent = String(plyerobj.hitpoint);
        _enemyhpElm.textContent = String(enemyobj.hitpoint);
    }
    function attackDefence(attacker, defender) {
        debugClear();
        var attackMe = saikoro();
        var attackItem = attacker.attackPalette[attackMe];
        debug(attacker.name + 'の攻撃: さいころの目 → [' + String(attackMe + 1) + ']' + attackItem.name);
        var defenderMe = saikoro();
        var defenderItem = defender.defensePalette[defenderMe];
        debug(defender.name + 'の防御:[' + String(defenderMe + 1) + ']' + defenderItem.name);
        var damage = 0;
        if (!defenderItem.through) {
            damage = attackItem.power - defenderItem.power;
            if (damage < 0) {
                damage = 0;
            }
            debug(defender.name + 'は ' + damage + 'ポイントのダメージを喰らった');
        }
        defender.hitpoint = defender.hitpoint - damage;
        if (defender.hitpoint <= 0) {
            defender.hitpoint = 0;
        }
        nokoriHpHyouji();
        if (defender.hitpoint <= 0) {
            debug(defender.name + 'は、倒れた');
        }
    }
})(SaikoroBattle || (SaikoroBattle = {}));
//# sourceMappingURL=saikotoBattole.js.map