var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
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
    var Item = (function () {
        function Item(name, detail, power) {
            this.name = name;
            this.detail = detail;
            this.power = power;
        }
        Item.prototype.clone = function () {
            return new Item(this.name, this.detail, this.power);
        };
        return Item;
    }());
    var AttackItem = (function (_super) {
        __extends(AttackItem, _super);
        function AttackItem() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        return AttackItem;
    }(Item));
    var punch = new AttackItem('パンチ', '', 20);
    var kick = new AttackItem('キック', '', 30);
    var goshouha = new AttackItem('張り手', '', 40);
    var DefenseItem = (function (_super) {
        __extends(DefenseItem, _super);
        function DefenseItem() {
            var _this = _super !== null && _super.apply(this, arguments) || this;
            _this.through = false;
            _this.nigashiPoint = 0;
            return _this;
        }
        DefenseItem.prototype.clone = function () {
            var item = new DefenseItem(this.name, this.detail, this.power);
            item.through = this.through;
            item.nigashiPoint = this.nigashiPoint;
            return item;
        };
        return DefenseItem;
    }(Item));
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
    var _attack;
    var _defense;
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
            debug('start');
            _mode = 1;
            return;
        }
        if (_mode == 1) {
            attack(plyerobj);
            _mode = 2;
            return;
        }
        if (_mode == 2) {
            defense(enemyobj);
            _mode = 3;
            return;
        }
        if (_mode == 3) {
            var damage = hantei(enemyobj);
            enemyobj.hitpoint = enemyobj.hitpoint - damage;
            nokoriHpHyouji();
            if (enemyobj.hitpoint <= 0) {
                debug('win');
                _mode = 0;
                return;
            }
            _mode = 4;
            return;
        }
        if (_mode == 4) {
            attack(enemyobj);
            _mode = 5;
            return;
        }
        if (_mode == 5) {
            defense(plyerobj);
            _mode = 6;
            return;
        }
        if (_mode == 6) {
            var damage = hantei(plyerobj);
            plyerobj.hitpoint = plyerobj.hitpoint - damage;
            nokoriHpHyouji();
            if (plyerobj.hitpoint <= 0) {
                debug('loose');
                _mode = 0;
                return;
            }
            _mode = 1;
            return;
        }
    }
    function nokoriHpHyouji() {
        _playerHPElm.textContent = String(plyerobj.hitpoint);
        _enemyhpElm.textContent = String(enemyobj.hitpoint);
    }
    function attack(chara) {
        var me = saikoro();
        var item = chara.attackPalette[me];
        _attack = item;
        debugClear();
        debug(chara.name + 'の攻撃: さいころの目 → [' + String(me + 1) + ']' + item.name);
    }
    function defense(chara) {
        var me = saikoro();
        var item = chara.defensePalette[me];
        _defense = item;
        debug(chara.name + 'の防御:[' + String(me + 1) + ']' + item.name);
    }
    function hantei(chara) {
        var damage = 0;
        if (!_defense.through) {
            damage = _attack.power - _defense.power;
            if (damage < 0) {
                damage = 0;
            }
        }
        debug(chara.name + 'は ' + damage + 'ポイントのダメージを喰らった');
        return damage;
    }
})(SaikoroBattle || (SaikoroBattle = {}));
//# sourceMappingURL=saikotoBattole.js.map