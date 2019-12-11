namespace SaikoroBattle {

    export interface GameObject {
        id: number;
        name: string;

        clone(): GameObject;
    }

    export interface Action extends GameObject {
        detail: string;
        power: number;
        opened: boolean;
    }

    export class AttackAction implements Action {
        id: number;
        name: string;
        detail: string;
        power: number;
        opened: boolean = false;

        constructor(id: number, name: string, power: number, detail?: string) {
            this.id = id;
            this.name = name;
            this.power = power;
            if (detail == undefined) {
                this.detail = '';
            } else {
                this.detail = detail;
            }
        }

        clone(): AttackAction {
            let action = new AttackAction(this.id, this.name, this.power, this.detail);

            return action;
        }
    }

    export class DefenseAction implements Action {
        id: number;
        name: string;
        detail: string;
        power: number;
        opened: boolean = false;
        through: boolean = false;
        nigashiPoint: number = 0;

        constructor(id: number, name: string, power: number, detail?: string) {
            this.id = id;
            this.name = name;
            this.power = power;
            if (detail == undefined) {
                this.detail = '';
            } else {
                this.detail = detail;
            }
        }

        clone(): DefenseAction {
            let action = new DefenseAction(this.id, this.name, this.power, this.detail);
            action.through = this.through;
            action.nigashiPoint = this.nigashiPoint;

            return action;
        }
    }

    type PlayerType = 'NULL' | 'Player' | 'Enemy';

    export class Character implements GameObject {
        id: number;
        type: PlayerType;

        name: string;
        hitPointMax: number = 0;

        attackPalette: AttackAction[] = [];
        defensePalette: DefenseAction[] = [];

        constructor(id: number, type: PlayerType, name: string) {
            this.id = id;
            this.type = type;
            this.name = name;
        }

        clone(): Character {
            let character = new Character(this.id, this.type, this.name);
            character.hitPointMax = this.hitPointMax;

            cloneList(this.attackPalette, character.attackPalette);
            cloneList(this.defensePalette, character.defensePalette);

            return character;
        }
    }

    class GameDeifine {
        attackActionList: AttackAction[] = [];
        defenseActionList: DefenseAction[] = [];

        characterList: Character[] = [];
    }
    let _gameDeifine = new GameDeifine();

    export function pickupCharacter(idx: number): Character {
        return pickupAction(_gameDeifine.characterList, idx);
    }

    export function init(): void {
        initDefine();
    }

    function initDefine(): void {
        let fileData: string = Kyoutsu.load('SaikoroBattle.txt');
        let lines: string[] = fileData.split(/[\r\n]+/);

        for (let i = 0, len: number = lines.length; i < len; i++) {
            let columns: string[] = lines[i].split(/\t/);

            if (columns.length < 4) {
                continue;
            }

            let id: number = Number(columns[0]);
            let type: string = columns[1];
            // let alphanumericName: string = columns[2];
            let name: string = columns[3];

            if (type == 'Attack') {
                let action = new AttackAction(id, name, Number(columns[4]));
                _gameDeifine.attackActionList.push(action);

            } else if (type == 'Defense') {
                let action = new DefenseAction(id, name, Number(columns[4]));
                if (columns[5] == 'through') {
                    action.through = true;
                }

                _gameDeifine.defenseActionList.push(action);

            } else if (type == 'Player' || type == 'Enemy') {
                let character = new Character(id, type, name);
                character.hitPointMax = Number(columns[4]);

                setDefaultActionPalette(_gameDeifine.attackActionList, columns[5], character.attackPalette);
                setDefaultActionPalette(_gameDeifine.defenseActionList, columns[6], character.defensePalette);

                _gameDeifine.characterList.push(character);
            }
        }
    }

    function setDefaultActionPalette<T extends Action>(list: T[], idText: string, palette: T[]): void {
        let ids: string[] = idText.split(',');
        if (ids.length != 6) {
            throw 'illegal palette count';
        }

        palette.length = 0;
        for (let i = 0; i < 6; i++) {
            let action: T = pickupAction(list, Number(ids[i]));
            palette.push(action);
        }
    }

    function pickupAction<T extends GameObject>(list: T[], id: number): T {
        for (let i = 0, len: number = list.length; i < len; i++) {
            if (list[i].id == id) {
                return <T>list[i].clone();
            }
        }
        throw 'id:' + String(id) + ' is not found';
    }

    function cloneList<T extends Action>(source: T[], destination: T[]): void {
        destination.length = 0;
        for (let i = 0, len: number = source.length; i < len; i++) {
            destination.push(<T>source[i].clone());
        }
    }

}