namespace SaikoroBattle {

    let _debugBoard: HTMLDivElement;
    function debug(text: string) {
        let html = _debugBoard.innerHTML;
        html += text + '<br>';
        _debugBoard.innerHTML = html;
    }
    function debugClear(): void {
        _debugBoard.innerHTML = '';
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

    interface ActionItem {
        type: string;
        name: string;
        detail: string;
        power: number;
    }

    class AttackItem implements ActionItem {
        type: string;
        name: string;
        detail: string;
        power: number;

        constructor(name: string, detail: string, power: number) {
            this.type = 'attack';
            this.name = name;
            this.detail = detail;
            this.power = power;
        }

        public clone(): AttackItem {
            let item = new AttackItem(this.name, this.detail, this.power);

            return item;
        }
    }

    let punch = new AttackItem('パンチ', '', 20);
    let kick = new AttackItem('キック', '', 30);
    let goshouha = new AttackItem('張り手', '', 40);

    class DefenseItem implements ActionItem {
        type: string;
        name: string;
        detail: string;
        power: number;
        through: boolean = false;
        nigashiPoint: number = 0;

        constructor(name: string, detail: string, power: number) {
            this.type = 'defense';
            this.name = name;
            this.detail = detail;
            this.power = power;
        }

        public clone(): DefenseItem {
            let item = new DefenseItem(this.name, this.detail, this.power);
            item.through = this.through;
            item.nigashiPoint = this.nigashiPoint;

            return item;
        }
    }

    let futsu = new DefenseItem('普通に喰らう', '', 0);
    let guard1 = new DefenseItem('ちょっとガード', '', 5);
    let guard2 = new DefenseItem('だいぶガード', '', 10);
    let yokei1 = new DefenseItem('余計に喰らう', '', -5);
    let yokei2 = new DefenseItem('かなり喰らう', '', -10);
    let kawasu = new DefenseItem('完全にかわす', '', 0);
    kawasu.through = true;

    class Charactor {
        type: string;

        name: string;
        hitPoint: number;

        attackPalette: Array<AttackItem>;
        defensePalette: Array<DefenseItem>;

        constructor(type: string, name: string) {
            this.type = type;
            this.name = name;
            this.hitPoint = 0;

            this.attackPalette = new Array<AttackItem>();
            this.defensePalette = new Array<DefenseItem>();
        }

        setAttackPalette = (palette: Array<AttackItem>) => {
            this.attackPalette.length = 0;
            for (let i = 0, l: number = palette.length; i < l; i++) {
                this.attackPalette.push(palette[i].clone());
            }
        }

        setDefensePalette = (palette: Array<DefenseItem>) => {
            this.defensePalette.length = 0;
            for (let i = 0, l: number = palette.length; i < l; i++) {
                this.defensePalette.push(palette[i].clone());
            }
        }
    }

    // メンバー変数
    let _mode: number = 0;

    let defaultAttackPalette: Array<AttackItem> = [punch, punch, kick, kick, goshouha, goshouha];
    let defaultDefensePalette: Array<DefenseItem> = [futsu, guard1, guard2, yokei1, yokei2, kawasu];

    let plyerobj = new Charactor('main', 'player');
    plyerobj.setAttackPalette(defaultAttackPalette);
    plyerobj.setDefensePalette(defaultDefensePalette);

    let enemyobj = new Charactor('enemy', '敵');
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
            } else {
                _mode = 2;
                return;
            }
        }

        if (_mode == 2) {
            attackDefence(enemyobj, plyerobj);
            if (plyerobj.hitPoint <= 0) {
                debug('loose');
                _mode = 0;
            } else {
                _mode = 1;
                return;
            }
        }
    }

    function nokoriHpHyouji(): void {
        _playerHPElm.textContent = String(plyerobj.hitPoint);
        _enemyhpElm.textContent = String(enemyobj.hitPoint);
    }

    function attackDefence(attacker: Charactor, defender: Charactor): void {
        debugClear();

        let attackMe: number = saikoro();
        let attackItem: AttackItem = attacker.attackPalette[attackMe];

        debug(attacker.name + 'の攻撃: さいころの目 → [' + String(attackMe + 1) + ']' + attackItem.name);

        let defenderMe: number = saikoro();
        let defenderItem: DefenseItem = defender.defensePalette[defenderMe];

        debug(defender.name + 'の防御:[' + String(defenderMe + 1) + ']' + defenderItem.name);

        let damage: number = 0;
        if (!defenderItem.through) {
            damage = attackItem.power - defenderItem.power;
            if (damage < 0) {
                damage = 0;
            }
            debug(defender.name + 'は ' + damage + 'ポイントのダメージを喰らった');
        }

        defender.hitPoint = defender.hitPoint - damage;
        if (defender.hitPoint <= 0) {
            defender.hitPoint = 0;
        }

        nokoriHpHyouji();

        if (defender.hitPoint <= 0) {
            debug(defender.name + 'は、倒れた');
        }
    }
}
