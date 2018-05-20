var SaikoroBattle;
(function (SaikoroBattle) {
    var _debugBoard;
    function debug(text) {
        var html = _debugBoard.innerHTML;
        html += text + '<br>';
        _debugBoard.innerHTML = html;
    }
    var _mainBoard;
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
    var _defenseArray = [0, 5, 10, 0, -5, -10, null];
    var _hp;
    var _tekihp;
    var _attack;
    var _defense;
    function susumeruGame() {
        if (_mode == 0) {
            _hp = 100;
            _tekihp = 100;
            debug('start');
            _mode = 1;
            return;
        }
        if (_mode == 1) {
            var me = saikoro();
            _attack = _attackArray[me];
            debug('attack:[' + String(me + 1) + ']' + _attack);
            _mode = 2;
            return;
        }
        if (_mode == 2) {
            var me = saikoro();
            _defense = _defenseArray[me];
            debug('defense:[' + String(me + 1) + ']' + _defense);
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
            _tekihp = _tekihp - damage;
            debug('damage:' + damage);
            debug('teki nokori:' + _tekihp);
            if (_tekihp <= 0) {
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
            debug('attack:[' + String(me + 1) + ']' + _attack);
            _mode = 5;
            return;
        }
        if (_mode == 5) {
            var me = saikoro();
            _defense = _defenseArray[me];
            debug('defense:[' + String(me + 1) + ']' + _defense);
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
            _hp = _hp - damage;
            debug('damage:' + damage);
            debug('player nokori:' + _hp);
            if (_hp <= 0) {
                debug('loose');
                _mode = 0;
                return;
            }
            _mode = 1;
            return;
        }
    }
})(SaikoroBattle || (SaikoroBattle = {}));
//# sourceMappingURL=saikotoBattole.js.map