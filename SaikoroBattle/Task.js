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
            if (task.mode == 'finish') {
                callback();
                return;
            }
            window.setTimeout(function () { TaskCtrl.wait(task, callback); }, 100);
        };
        TaskCtrl.parallelWait = function (tasks, callback) {
            var finish = true;
            for (var i = 0, len = tasks.tasks.length; i < len; i++) {
                if (tasks.tasks[i].mode != 'finish') {
                    finish = false;
                    break;
                }
            }
            if (finish) {
                callback();
                return;
            }
            window.setTimeout(function () { TaskCtrl.parallelWait(tasks, callback); }, 100);
        };
        TaskCtrl.debug = function (task, text) {
            if (this.debugBoard == null) {
                return;
            }
            var dbg = this.debugBoard;
            var h = dbg.innerHTML;
            h += '[' + task.name + ']' + text + '<br>';
            dbg.innerHTML = h;
        };
        TaskCtrl.DEFAULT_MODE = 'idle';
        TaskCtrl.debugBoard = null;
        return TaskCtrl;
    }());
    Task.TaskCtrl = TaskCtrl;
    var Tasks = (function () {
        function Tasks() {
            this.name = 'Tasks';
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
        Tasks.prototype.parallel = function () {
            var _this = this;
            TaskCtrl.do(this);
            var _loop_1 = function (i, len) {
                this_1.tasks[i].mode = Task.TaskCtrl.DEFAULT_MODE;
                window.setTimeout(function () { _this.tasks[i].do(); });
            };
            var this_1 = this;
            for (var i = 0, len = this.tasks.length; i < len; i++) {
                _loop_1(i, len);
            }
            TaskCtrl.parallelWait(this, function () { _this.finish(); });
        };
        Tasks.prototype.asap = function () {
            if (this.step == -1) {
                this.step = 0;
            }
            while (this.step < this.tasks.length) {
                var task = this.tasks[this.step];
                if (!(task instanceof WaitTask)) {
                    task.asap();
                }
                this.step++;
            }
            this.finish();
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
            this.name = 'FunctionTask';
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
            this.name = 'WaitTask';
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