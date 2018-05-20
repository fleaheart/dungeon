namespace SaikoroBattle {

    let _debugBoard: HTMLDivElement;
    function debug(text: string) {
        let html = _debugBoard.innerHTML;
        html += text + '<br>';
        _debugBoard.innerHTML = html;
    }

    let _mainBoard: HTMLDivElement;

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

    let _mode: number = 0;
    let _attackArray: number[] = [20, 20, 30, 30, 40, 40];
    let _defenseArray: (number | null)[] = [0, 5, 10, 0, -5, -10, null];
    let _hp: number;
    let _tekihp: number;
    let _attack: number;
    let _defense: number | null;

    function susumeruGame() {

        if (_mode == 0) {
            _hp = 100;
            _tekihp = 100;
            debug('start');
            _mode = 1;
            return;
        }

        if (_mode == 1) {
            let me: number = saikoro();
            _attack = _attackArray[me];

            debug('attack:[' + String(me + 1) + ']' + _attack);
            _mode = 2;
            return;
        }

        if (_mode == 2) {
            let me: number = saikoro();
            _defense = _defenseArray[me];

            debug('defense:[' + String(me + 1) + ']' + _defense);
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
            let me: number = saikoro();
            _attack = _attackArray[me];

            debug('attack:[' + String(me + 1) + ']' + _attack);
            _mode = 5;
            return;
        }

        if (_mode == 5) {
            let me: number = saikoro();
            _defense = _defenseArray[me];

            debug('defense:[' + String(me + 1) + ']' + _defense);
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
}