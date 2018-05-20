var SaikoroBattle;
(function (SaikoroBattle) {
    var _debugBoard;
    function debug(text) {
        var html = _debugBoard.innerHTML;
        html += text + '<br>';
        _debugBoard.innerHTML = html;
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
    var _mode = 0;
    var _attackArray = [20, 20, 30, 30, 40, 40];
    var _attackTextArray = ['パンチ', 'パンチ', 'キック', 'キック', '張り手', '張り手'];
    var _defenseArray = [0, 5, 10, -5, -10, null];
    var _defenseTextArray = ['普通に喰らう', 'ちょっとガード', 'だいぶガード', '余計に喰らう', 'かなり喰らう', '完全にかわす'];
    var _playerhp;
    var _enemyhp;
    var _attack;
    var _defense;
    function susumeruGame() {
        if (_mode == 0) {
            _playerhp = 100;
            _enemyhp = 100;
            nokoriHpHyouji();
            debug('start');
            _mode = 1;
            return;
        }
        if (_mode == 1) {
            var me = saikoro();
            _attack = _attackArray[me];
            debug('attack:[' + String(me + 1) + ']' + _attackTextArray[me] + _attack);
            _mode = 2;
            return;
        }
        if (_mode == 2) {
            var me = saikoro();
            _defense = _defenseArray[me];
            debug('defense:[' + String(me + 1) + ']' + _defenseTextArray[me] + _defense);
            _mode = 3;
            return;
        }
        if (_mode == 3) {
            var damage = 0;
            if (_defense != null) {
                damage = _attack - _defense;
                if (damage < 0) {
                    damage = 0;
                }
            }
            _enemyhp = _enemyhp - damage;
            nokoriHpHyouji();
            debug('damage:' + damage);
            debug('enemy nokori:' + _enemyhp);
            if (_enemyhp <= 0) {
                debug('win');
                _mode = 0;
                return;
            }
            _mode = 4;
            return;
        }
        if (_mode == 4) {
            var me = saikoro();
            _attack = _attackArray[me];
            debug('attack:[' + String(me + 1) + ']' + _attackTextArray[me] + _attack);
            _mode = 5;
            return;
        }
        if (_mode == 5) {
            var me = saikoro();
            _defense = _defenseArray[me];
            debug('defense:[' + String(me + 1) + ']' + _defenseTextArray[me] + _defense);
            _mode = 6;
            return;
        }
        if (_mode == 6) {
            var damage = 0;
            if (_defense != null) {
                damage = _attack - _defense;
                if (damage < 0) {
                    damage = 0;
                }
            }
            _playerhp = _playerhp - damage;
            nokoriHpHyouji();
            debug('damage:' + damage);
            debug('player nokori:' + _playerhp);
            if (_playerhp <= 0) {
                debug('loose');
                _mode = 0;
                return;
            }
            _mode = 1;
            return;
        }
    }
    function nokoriHpHyouji() {
        _playerHPElm.textContent = String(_playerhp);
        _enemyhpElm.textContent = String(_enemyhp);
    }
})(SaikoroBattle || (SaikoroBattle = {}));
//# sourceMappingURL=saikotoBattole.js.map