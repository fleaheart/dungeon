var TaskTest;
(function (TaskTest) {
    function getElementById(elementId) {
        var elm = document.getElementById(elementId);
        if (elm == null) {
            throw elementId + ' is not found.';
        }
        return elm;
    }
    function dbg(text) {
        var dbg = getElementById('debugBoard2');
        var h = dbg.innerHTML;
        h += '&nbsp;&nbsp;&nbsp;&nbsp;' + text + '<br>';
        dbg.innerHTML = h;
    }
    TaskTest.dbg = dbg;
    function init() {
        getElementById('btn').addEventListener('click', susumeruGame);
        getElementById('btn2').addEventListener('click', susumeruGame2);
    }
    TaskTest.init = init;
    var GameStatus = (function () {
        function GameStatus() {
            this.count = 0;
            this.gameMode = null;
            this.me = -1;
            this.meList = [-1, -1, -1, -1];
        }
        return GameStatus;
    }());
    var _gameStatus = new GameStatus();
    var IdleGameMode = (function () {
        function IdleGameMode() {
            this.name = 'IdleGameMode';
            this.mode = Task.TaskCtrl.DEFAULT_MODE;
            this.gameStatus = new GameStatus();
        }
        IdleGameMode.prototype.do = function () {
            Task.TaskCtrl.do(this);
        };
        IdleGameMode.prototype.asap = function () {
            Task.TaskCtrl.asap(this);
        };
        IdleGameMode.prototype.finish = function () {
            Task.TaskCtrl.finish(this);
        };
        return IdleGameMode;
    }());
    var InitGameMode = (function () {
        function InitGameMode(gameStatus) {
            var _this = this;
            this.name = 'InitGameMode';
            this.mode = Task.TaskCtrl.DEFAULT_MODE;
            this.tasks = new Task.Tasks();
            this.finish = function () {
                Task.TaskCtrl.finish(_this);
                _this.gameStatus.count += 4;
                _this.gameStatus.gameMode = new SaikoroFurumadeGameMode(_this.gameStatus);
            };
            this.gameStatus = gameStatus;
            this.tasks.add(new Task.FunctionTask(dbg, 'init 1'));
            this.tasks.add(new Task.WaitTask(Task.WaitTask.SLOW));
            this.tasks.add(new Task.FunctionTask(dbg, 'init 2'));
            this.tasks.add(new Task.WaitTask(Task.WaitTask.SLOW));
            this.tasks.add(new NaibuTasks());
            this.tasks.add(new Task.FunctionTask(dbg, 'init 3'));
            this.tasks.add(new Task.WaitTask(Task.WaitTask.SLOW));
        }
        InitGameMode.prototype.do = function () {
            Task.TaskCtrl.do(this);
            this.tasks.do();
            this.gameStatus.count += 1;
            Task.TaskCtrl.wait(this.tasks, this.finish);
        };
        InitGameMode.prototype.asap = function () {
            Task.TaskCtrl.asap(this);
            this.gameStatus.count += 2;
            this.tasks.asap();
        };
        return InitGameMode;
    }());
    var SaikoroFurumadeGameMode = (function () {
        function SaikoroFurumadeGameMode(gameStatus) {
            var _this = this;
            this.name = 'SaikoroFurumadeGameMode';
            this.mode = Task.TaskCtrl.DEFAULT_MODE;
            this.tasks = new Task.Tasks();
            this.callback = function (me) {
                var result = getElementById('result');
                result.innerHTML = String(me);
                dbg('saikoro:' + me);
                _this.gameStatus.me = me;
            };
            this.finish = function () {
                Task.TaskCtrl.finish(_this);
                _this.gameStatus.gameMode = new HanteiGameMode(_this.gameStatus);
            };
            this.gameStatus = gameStatus;
            this.tasks.add(new Task.FunctionTask(dbg, 'saikoromae'));
            this.tasks.add(new SaikoroBattle.SaikoroTask(this.callback, this.rollingFunc));
        }
        SaikoroFurumadeGameMode.prototype.rollingFunc = function (me) {
            var result = getElementById('rolling');
            result.innerHTML = String(me);
        };
        SaikoroFurumadeGameMode.prototype.do = function () {
            Task.TaskCtrl.do(this);
            this.tasks.do();
            Task.TaskCtrl.wait(this.tasks, this.finish);
        };
        SaikoroFurumadeGameMode.prototype.asap = function () {
            Task.TaskCtrl.asap(this);
            this.tasks.asap();
        };
        return SaikoroFurumadeGameMode;
    }());
    var HanteiGameMode = (function () {
        function HanteiGameMode(gameStatus) {
            var _this = this;
            this.name = 'HanteiGameMode';
            this.mode = Task.TaskCtrl.DEFAULT_MODE;
            this.tasks = new Task.Tasks();
            this.finish = function () {
                Task.TaskCtrl.finish(_this);
                _this.gameStatus.gameMode = null;
            };
            this.gameStatus = gameStatus;
            var me = gameStatus.me;
            this.tasks.add(new Task.FunctionTask(dbg, 'uketotta me:' + me));
        }
        HanteiGameMode.prototype.do = function () {
            Task.TaskCtrl.do(this);
            this.tasks.do();
            Task.TaskCtrl.wait(this.tasks, this.finish);
        };
        HanteiGameMode.prototype.asap = function () {
            Task.TaskCtrl.asap(this);
            this.tasks.asap();
        };
        return HanteiGameMode;
    }());
    var NaibuTasks = (function () {
        function NaibuTasks() {
            var _this = this;
            this.name = 'NaibuTasks';
            this.mode = Task.TaskCtrl.DEFAULT_MODE;
            this.tasks = new Task.Tasks();
            this.finish = function () {
                Task.TaskCtrl.finish(_this);
            };
            this.tasks.add(new Task.FunctionTask(dbg, 'naibu 1'));
            this.tasks.add(new Task.WaitTask(Task.WaitTask.SLOW));
            this.tasks.add(new Task.FunctionTask(dbg, 'naibu 2'));
            this.tasks.add(new Task.WaitTask(Task.WaitTask.SLOW));
            this.tasks.add(new Task.FunctionTask(dbg, 'naibu 3'));
            this.tasks.add(new Task.WaitTask(Task.WaitTask.SLOW));
        }
        NaibuTasks.prototype.do = function () {
            Task.TaskCtrl.do(this);
            this.tasks.do();
            Task.TaskCtrl.wait(this.tasks, this.finish);
        };
        NaibuTasks.prototype.asap = function () {
            Task.TaskCtrl.asap(this);
            this.tasks.asap();
        };
        return NaibuTasks;
    }());
    function susumeruGame() {
        if (_gameStatus.gameMode == null) {
            _gameStatus.gameMode = new IdleGameMode();
        }
        dbg('susumeruGame :' + _gameStatus.gameMode.name);
        if (_gameStatus.gameMode instanceof IdleGameMode) {
            _gameStatus.gameMode = new InitGameMode(_gameStatus);
        }
        if (_gameStatus.gameMode.mode == 'running') {
            _gameStatus.gameMode.asap();
            return;
        }
        else if (_gameStatus.gameMode.mode == 'idle') {
            _gameStatus.gameMode.do();
        }
    }
    var KougekiJunjoHandanMode = (function () {
        function KougekiJunjoHandanMode(gameStatus) {
            var _this = this;
            this.name = 'KougekiJunjoHandanMode';
            this.mode = Task.TaskCtrl.DEFAULT_MODE;
            this.tasks = new Task.Tasks();
            this.callback = function (playerIdx, me) {
                _this.gameStatus.meList[playerIdx] = me;
            };
            this.rollingFunc = function (playerIdx, me) {
                var elm = getElementById('s' + String(playerIdx));
                elm.textContent = String(me);
            };
            this.check = function () {
                dbg('check');
                _this.finish();
            };
            this.finish = function () {
                Task.TaskCtrl.finish(_this);
            };
            this.gameStatus = gameStatus;
            for (var i = 0, len = 4; i < len; i++) {
                (function (playerIdx) {
                    _this.tasks.add(new SaikoroBattle.SaikoroTask(function (me) { _this.callback(playerIdx, me); }, function (me) { _this.rollingFunc(playerIdx, me); }));
                })(i);
            }
        }
        KougekiJunjoHandanMode.prototype.do = function () {
            var _this = this;
            Task.TaskCtrl.do(this);
            this.tasks.parallel();
            Task.TaskCtrl.parallelWait(this.tasks, function () { _this.check(); });
        };
        KougekiJunjoHandanMode.prototype.asap = function () {
            Task.TaskCtrl.asap(this);
            this.tasks.asap();
        };
        return KougekiJunjoHandanMode;
    }());
    function susumeruGame2() {
        if (_gameStatus.gameMode == null) {
            _gameStatus.gameMode = new IdleGameMode();
        }
        dbg('susumeruGame :' + _gameStatus.gameMode.name + ' (' + _gameStatus.gameMode.mode + ')');
        if (_gameStatus.gameMode instanceof IdleGameMode) {
            _gameStatus.gameMode = new KougekiJunjoHandanMode(_gameStatus);
        }
        dbg('susumeruGame :' + _gameStatus.gameMode.name + ' (' + _gameStatus.gameMode.mode + ')');
        if (_gameStatus.gameMode.mode == 'running') {
            _gameStatus.gameMode.asap();
            dbg('susumeruGame :' + _gameStatus.gameMode.name + ' (' + _gameStatus.gameMode.mode + ')');
            return;
        }
        else if (_gameStatus.gameMode.mode == 'idle') {
            _gameStatus.gameMode.do();
            dbg('susumeruGame :' + _gameStatus.gameMode.name + ' (' + _gameStatus.gameMode.mode + ')');
        }
    }
})(TaskTest || (TaskTest = {}));
//# sourceMappingURL=TaskTest.js.map