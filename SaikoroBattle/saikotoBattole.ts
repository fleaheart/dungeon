namespace SaikoroBattle {

    let _debugBoard: HTMLDivElement;
    function debug(text: string) {
        let html = _debugBoard.innerHTML;
        html += text + '<br>';
        _debugBoard.innerHTML = html;
    }

    let _mainBoard: HTMLDivElement;

    let _playerHPElm: HTMLSpanElement;
    let _enemyhpElm: HTMLSpanElement;

    function getElementById(elementId: string): HTMLElement {
        let elm: HTMLElement | null = document.getElementById(elementId);
        if (elm == null) {
            throw elementId + ' is not found.';
        }
        return elm;
    }

    window.addEventListener('load', () => {
        _debugBoard = <HTMLDivElement>getElementById('debugBoard');
        _mainBoard = <HTMLDivElement>getElementById('mainBoard');

        _playerHPElm = <HTMLSpanElement>getElementById('playerHP');
        _enemyhpElm = <HTMLSpanElement>getElementById('enemyHP');

        let startButton: HTMLButtonElement = <HTMLButtonElement>document.createElement('BUTTON');

        startButton.textContent = 'start';

        startButton.addEventListener('click', susumeruGame);

        _mainBoard.appendChild(startButton);
    });

    function integerRandom(maxValue: number): number {
        let value = Math.random() * maxValue;
        return Math.floor(value);
    }

    function saikoro(): number {
        return integerRandom(6);
    }

    // メンバー変数
    let _mode: number = 0;
    let _attackArray: number[] = [20, 20, 30, 30, 40, 40];
    let _attackTextArray: string[] = ['パンチ', 'パンチ', 'キック', 'キック', '張り手', '張り手'];
    let _defenseArray: (number | null)[] = [0, 5, 10, -5, -10, null];
    let _defenseTextArray: string[] = ['普通に喰らう', 'ちょっとガード', 'だいぶガード', '余計に喰らう', 'かなり喰らう', '完全にかわす'];
    let _playerhp: number;
    let _enemyhp: number;
    let _attack: number;
    let _defense: number | null;

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
            let me: number = saikoro();
            _attack = _attackArray[me];

            debug('attack:[' + String(me + 1) + ']' + _attackTextArray[me] + _attack);
            _mode = 2;
            return;
        }

        if (_mode == 2) {
            let me: number = saikoro();
            _defense = _defenseArray[me];

            debug('defense:[' + String(me + 1) + ']' + _defenseTextArray[me] + _defense);
            _mode = 3;
            return;
        }

        if (_mode == 3) {
            let damage: number = 0;
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
            let me: number = saikoro();
            _attack = _attackArray[me];

            debug('attack:[' + String(me + 1) + ']' + _attackTextArray[me] + _attack);
            _mode = 5;
            return;
        }

        if (_mode == 5) {
            let me: number = saikoro();
            _defense = _defenseArray[me];

            debug('defense:[' + String(me + 1) + ']' + _defenseTextArray[me] + _defense);
            _mode = 6;
            return;
        }

        if (_mode == 6) {
            let damage: number = 0;
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
}