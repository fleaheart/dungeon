"use strict";
var SaikoroBattle;
(function (SaikoroBattle) {
    SaikoroBattle._debug = new Kyoutsu.Message();
    var AttackAction = (function () {
        function AttackAction(id, name, power, detail) {
            this.opened = false;
            this.id = id;
            this.name = name;
            this.power = power;
            if (detail == undefined) {
                this.detail = '';
            }
            else {
                this.detail = detail;
            }
        }
        AttackAction.prototype.clone = function () {
            var action = new AttackAction(this.id, this.name, this.power, this.detail);
            return action;
        };
        return AttackAction;
    }());
    SaikoroBattle.AttackAction = AttackAction;
    var DefenseAction = (function () {
        function DefenseAction(id, name, power, detail) {
            this.opened = false;
            this.through = false;
            this.nigashiPoint = 0;
            this.id = id;
            this.name = name;
            this.power = power;
            if (detail == undefined) {
                this.detail = '';
            }
            else {
                this.detail = detail;
            }
        }
        DefenseAction.prototype.clone = function () {
            var action = new DefenseAction(this.id, this.name, this.power, this.detail);
            action.through = this.through;
            action.nigashiPoint = this.nigashiPoint;
            return action;
        };
        return DefenseAction;
    }());
    SaikoroBattle.DefenseAction = DefenseAction;
    var Character = (function () {
        function Character(id, type, name) {
            this.hitPointMax = 0;
            this.attackPalette = [];
            this.defensePalette = [];
            this.id = id;
            this.type = type;
            this.name = name;
        }
        Character.prototype.clone = function () {
            var character = new Character(this.id, this.type, this.name);
            character.hitPointMax = this.hitPointMax;
            cloneList(this.attackPalette, character.attackPalette);
            cloneList(this.defensePalette, character.defensePalette);
            return character;
        };
        return Character;
    }());
    var SaikoroBattlePlayer = (function () {
        function SaikoroBattlePlayer(character) {
            this.hitPoint = 0;
            this.saikoroMe = 1;
            this.attackBoxList = [];
            this.defenseBoxList = [];
            this.operationOrder = -1;
            this.targetIdx = -1;
            this.character = character.clone();
            this.characterBoard = document.createElement('DIV');
            this.hitPointElement = document.createElement('SPAN');
            this.debugElement = document.createElement('SPAN');
            this.saikoroElement = document.createElement('DIV');
            this.attackActionBoard = document.createElement('DIV');
            this.defenseActionBoard = document.createElement('DIV');
        }
        SaikoroBattlePlayer.prototype.openAttackActionBoard = function () {
            this.attackActionBoard.style.display = 'flex';
        };
        SaikoroBattlePlayer.prototype.closeAttackActionBoard = function () {
            this.attackActionBoard.style.display = 'none';
        };
        SaikoroBattlePlayer.prototype.openDefenseActionBoard = function () {
            this.defenseActionBoard.style.display = 'flex';
        };
        SaikoroBattlePlayer.prototype.closeDefenseActionBoard = function () {
            this.defenseActionBoard.style.display = 'none';
        };
        return SaikoroBattlePlayer;
    }());
    SaikoroBattle.SaikoroBattlePlayer = SaikoroBattlePlayer;
    SaikoroBattle.NullCharacter = new SaikoroBattlePlayer(new Character(-1, 'NULL', 'NULL'));
    var GameDeifine = (function () {
        function GameDeifine() {
            this.attackActionList = [];
            this.defenseActionList = [];
            this.playerList = [];
            this.enemyList = [];
        }
        return GameDeifine;
    }());
    var _gameDeifine = new GameDeifine();
    function init() {
        SaikoroBattle._debug.set(Kyoutsu.getElementById('debugBoard'));
        initDefine();
    }
    SaikoroBattle.init = init;
    function initDefine() {
        var fileData = Kyoutsu.load('SaikoroBattle.txt');
        var lines = fileData.split(/[\r\n]+/);
        for (var i = 0, len = lines.length; i < len; i++) {
            var columns = lines[i].split(/\t/);
            if (columns.length < 4) {
                continue;
            }
            var id = Number(columns[0]);
            var type = columns[1];
            var name_1 = columns[3];
            if (type == 'Attack') {
                var action = new AttackAction(id, name_1, Number(columns[4]));
                _gameDeifine.attackActionList.push(action);
            }
            else if (type == 'Defense') {
                var action = new DefenseAction(id, name_1, Number(columns[4]));
                if (columns[5] == 'through') {
                    action.through = true;
                }
                _gameDeifine.defenseActionList.push(action);
            }
            else if (type == 'Player' || type == 'Enemy') {
                var character = new Character(id, type, name_1);
                character.hitPointMax = Number(columns[4]);
                setDefaultActionPalette(_gameDeifine.attackActionList, columns[5], character.attackPalette);
                setDefaultActionPalette(_gameDeifine.defenseActionList, columns[6], character.defensePalette);
                if (type == 'Player') {
                    _gameDeifine.playerList.push(character);
                }
                else if (type == 'Enemy') {
                    _gameDeifine.enemyList.push(character);
                }
            }
        }
    }
    function setDefaultActionPalette(list, idText, palette) {
        var ids = idText.split(',');
        if (ids.length != 6) {
            throw 'illegal palette count';
        }
        palette.length = 0;
        for (var i = 0; i < 6; i++) {
            var action = pickupAction(list, Number(ids[i]));
            palette.push(action);
        }
    }
    function pickupAction(list, id) {
        for (var i = 0, len = list.length; i < len; i++) {
            if (list[i].id == id) {
                return list[i].clone();
            }
        }
        throw 'id:' + String(id) + ' is not found';
    }
    function cloneList(source, destination) {
        destination.length = 0;
        for (var i = 0, len = source.length; i < len; i++) {
            destination.push(source[i].clone());
        }
    }
    function searchPlayer(idx) {
        return new SaikoroBattlePlayer(_gameDeifine.playerList[idx]);
    }
    SaikoroBattle.searchPlayer = searchPlayer;
    function searchEnemy(idx) {
        return new SaikoroBattlePlayer(_gameDeifine.enemyList[idx]);
    }
    SaikoroBattle.searchEnemy = searchEnemy;
})(SaikoroBattle || (SaikoroBattle = {}));
//# sourceMappingURL=SaikoroBattleInit.js.map