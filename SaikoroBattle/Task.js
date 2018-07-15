var Task;
(function (Task) {
    var TaskCtrl = (function () {
        function TaskCtrl() {
        }
        TaskCtrl.do = function (task) {
            task.mode = 'running';
        };
        TaskCtrl.asap = function (task) {
            task.mode = 'asap';
        };
        TaskCtrl.finish = function (task) {
            task.mode = 'finish';
        };
        TaskCtrl.wait = function (task, callback) {
            if (task.mode != 'running') {
                callback();
                return;
            }
            window.setTimeout(function () { TaskCtrl.wait(task, callback); }, 100);
        };
        TaskCtrl.DEFAULT_MODE = 'idle';
        return TaskCtrl;
    }());
    Task.TaskCtrl = TaskCtrl;
    var Tasks = (function () {
        function Tasks() {
            this.mode = TaskCtrl.DEFAULT_MODE;
            this.tasks = new Array();
            this.step = -1;
        }
        Tasks.prototype.add = function (task) {
            this.tasks.push(task);
        };
        Tasks.prototype.do = function () {
            TaskCtrl.do(this);
            this.step = -1;
            this.next();
        };
        Tasks.prototype.next = function () {
            var _this = this;
            if (this.mode != 'running') {
                return;
            }
            this.step++;
            if (this.tasks.length <= this.step) {
                this.finish();
                return;
            }
            var task = this.tasks[this.step];
            task.do();
            TaskCtrl.wait(task, function () { _this.next(); });
        };
        Tasks.prototype.asap = function () {
            var _this = this;
            window.setTimeout(function () {
                TaskCtrl.asap(_this);
                while (_this.step < _this.tasks.length) {
                    var task = _this.tasks[_this.step];
                    if (!(task instanceof WaitTask)) {
                        task.asap();
                    }
                    _this.step++;
                }
                _this.finish();
            });
        };
        Tasks.prototype.finish = function () {
            TaskCtrl.finish(this);
            this.tasks.length = 0;
            this.step = -1;
        };
        return Tasks;
    }());
    Task.Tasks = Tasks;
    var FunctionTask = (function () {
        function FunctionTask(func, param) {
            this.mode = TaskCtrl.DEFAULT_MODE;
            this.func = func;
            this.param = param;
        }
        FunctionTask.prototype.do = function () {
            TaskCtrl.do(this);
            this.func(this.param);
            this.finish();
        };
        FunctionTask.prototype.asap = function () {
            TaskCtrl.asap(this);
            this.do();
        };
        FunctionTask.prototype.finish = function () {
            TaskCtrl.finish(this);
        };
        return FunctionTask;
    }());
    Task.FunctionTask = FunctionTask;
    var WaitTask = (function () {
        function WaitTask(millisec) {
            this.mode = TaskCtrl.DEFAULT_MODE;
            this.millisec = millisec;
        }
        WaitTask.prototype.do = function () {
            var _this = this;
            TaskCtrl.do(this);
            window.setTimeout(function () { _this.finish(); }, this.millisec);
        };
        WaitTask.prototype.asap = function () {
            TaskCtrl.asap(this);
        };
        WaitTask.prototype.finish = function () {
            TaskCtrl.finish(this);
        };
        WaitTask.FAST = 100;
        WaitTask.NORMAL = 300;
        WaitTask.SLOW = 700;
        return WaitTask;
    }());
    Task.WaitTask = WaitTask;
})(Task || (Task = {}));
//# sourceMappingURL=Task.js.map