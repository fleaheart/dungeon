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

    class Item {
        constructor(public name: string, public detail: string, public power: number) { }

        public clone(): Item {
            return new Item(this.name, this.detail, this.power);
        }
    }

    class AttackItem extends Item {

    }

    let punch = new AttackItem('パンチ', '', 20);
    let kick = new AttackItem('キック', '', 30);
    let goshouha = new AttackItem('張り手', '', 40);

    class DefenseItem extends Item {
        through: boolean = false;
        nigashiPoint: number = 0;

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

    class Chara {
        type: string;

        name: string;
        hitpoint: number;

        attackPalette: Array<AttackItem>;
        defensePalette: Array<DefenseItem>;

        constructor(type: string, name: string) {
            this.type = type;
            this.name = name;
            this.hitpoint = 0;

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
    let _attack: AttackItem;
    let _defense: DefenseItem;

    let defaultAttackPalette: Array<AttackItem> = [punch, punch, kick, kick, goshouha, goshouha];
    let defaultDefensePalette: Array<DefenseItem> = [futsu, guard1, guard2, yokei1, yokei2, kawasu];

    let plyerobj = new Chara('main', 'player');
    plyerobj.setAttackPalette(defaultAttackPalette);
    plyerobj.setDefensePalette(defaultDefensePalette);

    let enemyobj = new Chara('enemy', '敵');
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
            let damage: number = hantei(enemyobj);
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
            let damage: number = hantei(plyerobj);
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

    function nokoriHpHyouji(): void {
        _playerHPElm.textContent = String(plyerobj.hitpoint);
        _enemyhpElm.textContent = String(enemyobj.hitpoint);
    }

    function attack(chara: Chara): void {
        let me: number = saikoro();
        let item = chara.attackPalette[me];

        _attack = item;

        debugClear();
        debug(chara.name + 'の攻撃: さいころの目 → [' + String(me + 1) + ']' + item.name);
    }

    function defense(chara: Chara): void {
        let me: number = saikoro();
        let item = chara.defensePalette[me];

        _defense = item;

        debug(chara.name + 'の防御:[' + String(me + 1) + ']' + item.name);
    }

    function hantei(chara: Chara): number {
        let damage: number = 0;
        if (!_defense.through) {
            damage = _attack.power - _defense.power;
            if (damage < 0) {
                damage = 0;
            }
        }

        debug(chara.name + 'は ' + damage + 'ポイントのダメージを喰らった');

        return damage;
    }
}
